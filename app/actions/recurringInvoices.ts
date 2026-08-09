"use server";

import { addMonths, addQuarters, addYears } from "date-fns";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";
import { Prisma } from "@prisma/client";

import { revalidatePath, revalidateTag } from "next/cache";

import { getRequiredUserId } from "@/lib/session";
import { recurringInvoiceSchema } from "@/lib/zodSchemas";
import { getPlanConfig } from "@/lib/planConfig";
import { getUserUsage, isEmailLimitOk, type UserUsage } from "@/lib/usage";
import { dispatchInvoiceEmail } from "@/lib/email/invoice";
import { calculateInvoiceTotal, parseInvoiceItems } from "@/lib/invoiceItems";
import prisma from "@/lib/db";
import { cacheTags } from "@/lib/cache";

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
  const planConfig = await getPlanConfig(usage.plan);
  if (!planConfig.recurringInvoices) {
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
  revalidateTag(cacheTags.recurringInvoices(userId));
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

    revalidatePath("/dashboard/recurring-invoices");
    revalidateTag(cacheTags.recurringInvoices(userId));
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
    revalidatePath("/dashboard/recurring-invoices");
    revalidateTag(cacheTags.recurringInvoices(userId));
    return { success: true };
  } catch (error) {
    console.error("Failed to delete recurring invoice:", error);
    return { error: "Failed to delete recurring invoice" };
  }
}

export interface ProcessRecurringInvoicesResult {
  processed: number;
  skippedAtLimit: number;
  failed: number;
  errors: string[];
}

export async function processRecurringInvoices(): Promise<ProcessRecurringInvoicesResult> {
  const now = new Date();
  const result: ProcessRecurringInvoicesResult = {
    processed: 0,
    skippedAtLimit: 0,
    failed: 0,
    errors: [],
  };

  const due = await prisma.recurringInvoice.findMany({
    where: { isActive: true, nextRunAt: { lte: now }, User: { isActive: true } },
    include: { client: { include: { contactPersons: { where: { isPrimary: true }, take: 1 } } } },
  });

  // In-memory only, for the best-effort email-limit check below (not the
  // invoice-limit check itself, which is re-verified fresh under lock).
  const emailUsageCache = new Map<string, UserUsage>();
  // Tracks which users' cached invoice/recurring-invoice lists need
  // invalidating — dedup'd so a user with several due invoices only gets
  // each tag revalidated once per run.
  const usersToInvalidate = new Set<string>();

  for (const recurring of due) {
    if (!recurring.userId) continue;
    const userId = recurring.userId;

    try {
      const nextRunAt = computeNextRunAt(recurring.nextRunAt, recurring.interval);
      const expired = !!recurring.endDate && nextRunAt > recurring.endDate;
      const items = parseInvoiceItems(recurring.items);
      const total = calculateInvoiceTotal(items);

      // Atomic: lock per-user, re-check the usage limit fresh, assign the next
      // invoice number, create the invoice, and advance the schedule, all in
      // one transaction. The advisory lock (released automatically at
      // transaction end) serializes this against both a concurrent manual
      // createInvoice call AND a second, overlapping cron invocation for the
      // same user — the previous per-run batched usage/number lookups could
      // both pass a stale check if two cron runs overlapped.
      const invoice = await prisma.$transaction(async (tx) => {
        await tx.$executeRaw`SELECT pg_advisory_xact_lock(hashtext(${userId}))`;

        const usage = await getUserUsage(userId, tx);
        if (usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit) {
          return null;
        }

        const last = await tx.invoice.findFirst({
          where: { userId },
          orderBy: { invoiceNumber: "desc" },
          select: { invoiceNumber: true },
        });
        const invoiceNumber = (last?.invoiceNumber ?? 0) + 1;

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
            userId,
            recurringInvoiceId: recurring.id,
          },
        });

        await tx.recurringInvoice.update({
          where: { id: recurring.id },
          data: { nextRunAt, isActive: !expired },
        });

        return created;
      });

      if (!invoice) {
        result.skippedAtLimit++;
        continue;
      }
      result.processed++;
      usersToInvalidate.add(userId);

      const contact = recurring.client?.contactPersons[0];
      if (contact) {
        // Best-effort: fetches usage once per user and caches it across this
        // batch rather than trusting an in-loop counter, since the
        // authoritative invoice-limit check already happened under lock above.
        let emailUsage = emailUsageCache.get(userId);
        if (!emailUsage) {
          emailUsage = await getUserUsage(userId);
          emailUsageCache.set(userId, emailUsage);
        }

        if (isEmailLimitOk(emailUsage)) {
          emailUsage.emailsThisMonth++;
          dispatchInvoiceEmail({
            userId,
            plan: emailUsage.plan,
            clientName: recurring.client!.name,
            contactEmail: contact.email,
            templateName: "newInvoice",
            logType: "recurringInvoice",
            invoiceNumber: invoice.invoiceNumber,
            invoiceDueDate: now,
            total,
            currency: recurring.currency,
            invoiceId: invoice.id,
            notificationHref: "/dashboard/recurring-invoices",
          }).catch(() => { /* email is best-effort; failure creates an in-app notification */ });
        }
      }
    } catch (err) {
      result.failed++;
      const message = err instanceof Error ? err.message : String(err);
      result.errors.push(`${recurring.id}: ${message}`);
      console.error(`Failed to process recurring invoice ${recurring.id}:`, err);
    }
  }

  for (const userId of usersToInvalidate) {
    revalidateTag(cacheTags.invoices(userId));
    revalidateTag(cacheTags.recurringInvoices(userId));
  }

  return result;
}
