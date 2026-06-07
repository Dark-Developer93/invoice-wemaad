"use server";

import { addMonths, addQuarters, addYears } from "date-fns";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";
import { Prisma } from "@prisma/client";

import { revalidatePath } from "next/cache";

import { getRequiredUserId } from "@/lib/session";
import { recurringInvoiceSchema } from "@/lib/zodSchemas";
import { PLAN_FEATURES } from "@/lib/plans";
import { getUserUsage, isEmailLimitOk } from "@/lib/usage";
import { dispatchInvoiceEmail } from "@/lib/email/invoice";
import { calculateInvoiceTotal, parseInvoiceItems } from "@/lib/invoiceItems";
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
  const userId = await getRequiredUserId();

  const usage = await getUserUsage(userId);
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

  const { interval, startDate, endDate, note, clientId, ...rest } = submission.value;
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
        userId,
        ...rest,
        total: calculateInvoiceTotal(rest.items),
      },
    });
  } catch (error) {
    console.error("Failed to create recurring invoice:", error);
    return { status: "error", error: { "": ["Failed to create recurring invoice"] } };
  }

  revalidatePath("/dashboard/recurring-invoices");
  return { status: "success", error: {} };
}

export async function toggleRecurringInvoice(id: string) {
  const userId = await getRequiredUserId();

  try {
    const current = await prisma.recurringInvoice.findUnique({
      where: { id, userId },
      select: { isActive: true },
    });

    if (!current) return { error: "Not found" };

    await prisma.recurringInvoice.update({
      where: { id, userId },
      data: { isActive: !current.isActive },
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to toggle recurring invoice:", error);
    return { error: "Failed to update recurring invoice" };
  }
}

export async function deleteRecurringInvoice(id: string) {
  const userId = await getRequiredUserId();

  try {
    await prisma.recurringInvoice.delete({ where: { id, userId } });
    return { success: true };
  } catch (error) {
    console.error("Failed to delete recurring invoice:", error);
    return { error: "Failed to delete recurring invoice" };
  }
}

export async function processRecurringInvoices() {
  const now = new Date();

  const due = await prisma.recurringInvoice.findMany({
    where: { isActive: true, nextRunAt: { lte: now }, User: { isActive: true } },
    include: { client: { include: { contactPersons: { where: { isPrimary: true }, take: 1 } } } },
  });

  // Batch usage checks — one lookup per unique user, not one per invoice.
  const userIds = [...new Set(due.map((r) => r.userId).filter(Boolean) as string[])];
  const usageMap = Object.fromEntries(
    await Promise.all(userIds.map(async (uid) => [uid, await getUserUsage(uid)] as const))
  );

  // Batch last invoice numbers per user to avoid N queries in the loop.
  const lastInvoiceMap = Object.fromEntries(
    await Promise.all(
      userIds.map(async (uid) => {
        const last = await prisma.invoice.findFirst({
          where: { userId: uid },
          orderBy: { invoiceNumber: "desc" },
          select: { invoiceNumber: true },
        });
        return [uid, last?.invoiceNumber ?? 0] as const;
      })
    )
  );

  for (const recurring of due) {
    if (!recurring.userId) continue;

    const usage = usageMap[recurring.userId];
    const atLimit =
      usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit;
    if (atLimit) continue;

    try {
      const invoiceNumber = ++lastInvoiceMap[recurring.userId];

      // Atomic: create invoice + advance schedule in one transaction.
      const nextRunAt = computeNextRunAt(now, recurring.interval);
      const expired = !!recurring.endDate && nextRunAt > recurring.endDate;
      const items = parseInvoiceItems(recurring.items);
      const total = calculateInvoiceTotal(items);

      const invoice = await prisma.$transaction(async (tx) => {
        const created = await tx.invoice.create({
          data: {
            invoiceName: recurring.invoiceName,
            total,
            status: "PENDING",
            date: now,
            dueDate: recurring.dueDate,
            fromName: recurring.fromName,
            fromEmail: recurring.fromEmail,
            fromAddress: recurring.fromAddress,
            currency: recurring.currency,
            invoiceNumber,
            invoiceNote: recurring.invoiceNote,
            items: items as Prisma.InputJsonValue,
            clientId: recurring.clientId,
            userId: recurring.userId,
            recurringInvoiceId: recurring.id,
          },
        });

        await tx.recurringInvoice.update({
          where: { id: recurring.id },
          data: { nextRunAt, isActive: !expired },
        });

        return created;
      });

      // Update local usage so subsequent invoices for the same user see the new count.
      usage.invoicesThisMonth++;

      const contact = recurring.client?.contactPersons[0];

      if (contact && isEmailLimitOk(usage)) {
        usage.emailsThisMonth++;
        dispatchInvoiceEmail({
          userId: recurring.userId!,
          clientName: recurring.client!.name,
          contactEmail: contact.email,
          templateName: "newInvoice",
          logType: "recurringInvoice",
          invoiceNumber,
          invoiceDueDate: now,
          total,
          currency: recurring.currency,
          invoiceId: invoice.id,
          notificationHref: "/dashboard/recurring-invoices",
        }).catch(() => { /* email is best-effort; failure creates an in-app notification */ });
      }
    } catch (err) {
      console.error(`Failed to process recurring invoice ${recurring.id}:`, err);
    }
  }
}
