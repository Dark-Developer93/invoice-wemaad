"use server";

import { addMonths, addQuarters, addYears } from "date-fns";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";

import { requireUser } from "@/lib/session";
import { recurringInvoiceSchema } from "@/lib/zodSchemas";
import { PLAN_FEATURES } from "@/lib/plans";
import { getUserUsage, logEmailSent } from "@/lib/usage";
import { sendEmail } from "@/lib/email/index";
import { formatCurrency } from "@/lib/formatCurrency";
import { Currency } from "@/types";
import prisma from "@/lib/db";

function computeNextRunAt(
  from: Date,
  interval: "MONTHLY" | "QUARTERLY" | "YEARLY"
): Date {
  if (interval === "MONTHLY") return addMonths(from, 1);
  if (interval === "QUARTERLY") return addQuarters(from, 1);
  return addYears(from, 1);
}

export async function createRecurringInvoice(
  _prevState: SubmissionResult<string[]> | null | undefined,
  formData: FormData
): Promise<SubmissionResult<string[]>> {
  const session = await requireUser();

  if (!session?.user?.id) {
    return { status: "error", error: { "": ["User not found"] } };
  }

  const usage = await getUserUsage(session.user.id);
  if (!PLAN_FEATURES[usage.plan].analytics) {
    return {
      status: "error",
      error: { "": ["Recurring invoices require a Starter plan or above."] },
    };
  }

  const submission = parseWithZod(formData, { schema: recurringInvoiceSchema });
  if (submission.status !== "success") {
    return submission.reply();
  }

  const { interval, startDate, endDate, note, clientId, ...rest } =
    submission.value;

  const start = new Date(startDate);
  const nextRunAt = start <= new Date() ? computeNextRunAt(start, interval) : start;

  try {
    await prisma.recurringInvoice.create({
      data: {
        interval,
        startDate: start,
        endDate: endDate ? new Date(endDate) : null,
        nextRunAt,
        invoiceNote: note,
        clientId,
        userId: session.user.id,
        ...rest,
      },
    });

    return { status: "success", error: {} };
  } catch {
    return { status: "error", error: { "": ["Failed to create recurring invoice"] } };
  }
}

export async function toggleRecurringInvoice(id: string) {
  const session = await requireUser();
  if (!session?.user?.id) return { error: "User not found" };

  const current = await prisma.recurringInvoice.findUnique({
    where: { id, userId: session.user.id },
    select: { isActive: true },
  });

  if (!current) return { error: "Not found" };

  await prisma.recurringInvoice.update({
    where: { id },
    data: { isActive: !current.isActive },
  });

  return { success: true };
}

export async function deleteRecurringInvoice(id: string) {
  const session = await requireUser();
  if (!session?.user?.id) return { error: "User not found" };

  await prisma.recurringInvoice.delete({
    where: { id, userId: session.user.id },
  });

  return { success: true };
}

export async function processRecurringInvoices() {
  const now = new Date();

  const due = await prisma.recurringInvoice.findMany({
    where: { isActive: true, nextRunAt: { lte: now } },
    include: { client: { include: { contactPersons: { where: { isPrimary: true }, take: 1 } } } },
  });

  for (const recurring of due) {
    if (!recurring.userId) continue;

    const usage = await getUserUsage(recurring.userId);
    const atLimit =
      usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit;

    if (atLimit) continue;

    const lastInvoice = await prisma.invoice.findFirst({
      where: { userId: recurring.userId },
      orderBy: { invoiceNumber: "desc" },
      select: { invoiceNumber: true },
    });

    const invoiceNumber = (lastInvoice?.invoiceNumber ?? 0) + 1;

    const invoice = await prisma.invoice.create({
      data: {
        invoiceName: recurring.invoiceName,
        total: recurring.total,
        status: "PENDING",
        date: now,
        dueDate: recurring.dueDate,
        fromName: recurring.fromName,
        fromEmail: recurring.fromEmail,
        fromAddress: recurring.fromAddress,
        currency: recurring.currency,
        invoiceNumber,
        invoiceNote: recurring.invoiceNote,
        invoiceItemDescription: recurring.invoiceItemDescription,
        invoiceItemQuantity: recurring.invoiceItemQuantity,
        invoiceItemRate: recurring.invoiceItemRate,
        clientId: recurring.clientId,
        userId: recurring.userId,
        recurringInvoiceId: recurring.id,
      },
    });

    const contact = recurring.client?.contactPersons[0];
    const emailLimitOk =
      usage.emailLimit === null || usage.emailsThisMonth < usage.emailLimit;

    if (contact && emailLimitOk) {
      sendEmail({
        to: contact.email,
        templateName: "newInvoice",
        variables: {
          clientName: recurring.client!.name,
          invoiceNumber: invoiceNumber.toString(),
          invoiceDueDate: new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(now),
          invoiceAmount: formatCurrency({
            amount: recurring.total,
            currency: recurring.currency as Currency,
          }),
          invoiceLink:
            process.env.NODE_ENV !== "production"
              ? `http://localhost:3000/api/invoice/${invoice.id}`
              : `https://invoice-wemaad.vercel.app/api/invoice/${invoice.id}`,
        },
      })
        .then(() => logEmailSent(recurring.userId!, "recurringInvoice", invoice.id))
        .catch(console.error);
    }

    const nextRunAt = computeNextRunAt(now, recurring.interval);
    const expired = recurring.endDate && nextRunAt > recurring.endDate;

    await prisma.recurringInvoice.update({
      where: { id: recurring.id },
      data: { nextRunAt, isActive: !expired },
    });
  }
}
