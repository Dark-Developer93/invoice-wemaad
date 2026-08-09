"use server";

import { redirect } from "next/navigation";
import { revalidatePath, revalidateTag } from "next/cache";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";
import { addDays } from "date-fns";

import { getRequiredUserId } from "@/lib/session";
import { invoiceSchema } from "@/lib/zodSchemas";
import { calculateInvoiceTotal } from "@/lib/invoiceItems";
import prisma from "@/lib/db";
import { getUserUsage, isEmailLimitOk, type UserUsage } from "@/lib/usage";
import { dispatchInvoiceEmail } from "@/lib/email/invoice";
import { cacheTags } from "@/lib/cache";

class InvoiceLimitReachedError extends Error {
  constructor(public usage: UserUsage) {
    super("Invoice limit reached");
  }
}

export async function createInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const userId = await getRequiredUserId();

  const submission = parseWithZod(formData, { schema: invoiceSchema });
  if (submission.status !== "success") {
    return { status: "error", error: { form: ["Invalid form data"] } };
  }

  let data;
  try {
    data = await prisma.$transaction(async (tx) => {
      // Serialize invoice creation per user (Postgres advisory lock, released
      // automatically at transaction end) so the usage-limit check below can't
      // race with a concurrent createInvoice call for the same user and let
      // both requests slip past the limit.
      await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

      const usage = await getUserUsage(userId, tx);
      if (usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit) {
        throw new InvoiceLimitReachedError(usage);
      }

      return tx.invoice.create({
        data: {
          ...submission.value,
          total: calculateInvoiceTotal(submission.value.items),
          userId,
        },
      });
    });
  } catch (error) {
    if (error instanceof InvoiceLimitReachedError) {
      return {
        status: "error",
        error: { "": [`Monthly invoice limit (${error.usage.invoiceLimit}) reached on the ${error.usage.plan} plan. Upgrade to create more.`] },
      };
    }
    console.error("Failed to create invoice:", error);
    return { status: "error", error: { "": ["Failed to create invoice"] } };
  }

  // The invoice itself was created successfully at this point — email dispatch
  // is best-effort and must not turn a successful create into a reported failure.
  try {
    const usage = await getUserUsage(userId);
    const shouldSendEmail = formData.get("sendEmail") !== "false";
    if (shouldSendEmail && isEmailLimitOk(usage)) {
      const client = await prisma.client.findUnique({
        where: { id: submission.value.clientId, userId },
        include: { contactPersons: { where: { isPrimary: true }, take: 1 } },
      });

      if (client?.contactPersons[0]) {
        dispatchInvoiceEmail({
          userId,
          clientName: client.name,
          contactEmail: client.contactPersons[0].email,
          templateName: "newInvoice",
          invoiceNumber: submission.value.invoiceNumber,
          invoiceDueDate: addDays(new Date(submission.value.date), submission.value.dueDate),
          total: Number(data.total),
          currency: submission.value.currency,
          invoiceId: data.id,
        }).catch(() => { /* email is best-effort; failure creates an in-app notification */ });
      }
    }
  } catch (error) {
    console.error(`Failed to dispatch email for invoice ${data.id}:`, error);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/invoices");
  revalidateTag(cacheTags.invoices(userId));
  return { status: "success", error: {} };
}

export async function editInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const userId = await getRequiredUserId();

  const invoiceId = formData.get("id");
  if (typeof invoiceId !== "string" || !invoiceId) {
    return { status: "error", error: { "": ["Invoice ID is missing"] } };
  }

  const submission = parseWithZod(formData, { schema: invoiceSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  try {
    const data = await prisma.invoice.update({
      where: { id: invoiceId, userId },
      data: {
        ...submission.value,
        total: calculateInvoiceTotal(submission.value.items),
        userId,
      },
    });

    const shouldSendEmail = formData.get("sendEmail") !== "false";

    if (shouldSendEmail) {
      const [client, usage] = await Promise.all([
        prisma.client.findUnique({
          where: { id: submission.value.clientId, userId },
          include: { contactPersons: { where: { isPrimary: true }, take: 1 } },
        }),
        getUserUsage(userId),
      ]);

      if (client?.contactPersons[0] && isEmailLimitOk(usage)) {
        dispatchInvoiceEmail({
          userId,
          clientName: client.name,
          contactEmail: client.contactPersons[0].email,
          templateName: "updatedInvoice",
          invoiceNumber: submission.value.invoiceNumber,
          invoiceDueDate: addDays(new Date(submission.value.date), submission.value.dueDate),
          total: Number(data.total),
          currency: submission.value.currency,
          invoiceId: data.id,
        }).catch(() => { /* email is best-effort; failure creates an in-app notification */ });
      }
    }

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/invoices");
    revalidateTag(cacheTags.invoices(userId));
    return { status: "success", error: {} };
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return { status: "error", error: { "": ["Failed to update invoice"] } };
  }
}

export async function deleteInvoice(invoiceId: string) {
  const userId = await getRequiredUserId();

  try {
    await prisma.invoice.delete({ where: { userId, id: invoiceId } });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return { error: "Failed to delete invoice" };
  }

  revalidatePath("/dashboard");
  revalidateTag(cacheTags.invoices(userId));
  return redirect("/dashboard/invoices");
}

export async function sendReminderEmail(invoiceId: string) {
  const userId = await getRequiredUserId();

  const invoiceData = await prisma.invoice.findUnique({
    where: { id: invoiceId, userId },
    include: {
      client: {
        include: {
          contactPersons: { where: { isPrimary: true }, take: 1 },
        },
      },
    },
  });

  if (!invoiceData || !invoiceData.client || !invoiceData.client.contactPersons[0]) {
    throw new Error("Invoice or client contact not found");
  }

  const usage = await getUserUsage(userId);
  if (!isEmailLimitOk(usage)) {
    throw new Error(
      `Monthly email limit (${usage.emailLimit}) reached on the ${usage.plan} plan. Upgrade your plan to send more emails.`
    );
  }

  const dueDate = addDays(new Date(invoiceData.date), invoiceData.dueDate);

  await dispatchInvoiceEmail({
    userId,
    clientName: invoiceData.client.name,
    contactEmail: invoiceData.client.contactPersons[0].email,
    templateName: "reminderInvoice",
    invoiceNumber: invoiceData.invoiceNumber,
    invoiceDueDate: dueDate,
    total: Number(invoiceData.total),
    currency: invoiceData.currency,
    invoiceId: invoiceData.id,
  });
}

export async function markAsPaid(invoiceId: string) {
  const userId = await getRequiredUserId();

  try {
    await prisma.invoice.update({
      where: { userId, id: invoiceId },
      data: { status: "PAID" },
    });
  } catch (error) {
    console.error("Failed to mark invoice as paid:", error);
    return { error: "Failed to update invoice status" };
  }

  revalidatePath("/dashboard");
  revalidateTag(cacheTags.invoices(userId));

  return redirect("/dashboard/invoices");
}
