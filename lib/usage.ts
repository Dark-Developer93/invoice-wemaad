import { startOfMonth, endOfMonth } from "date-fns";
import type { Prisma } from "@prisma/client";

import prisma from "@/lib/db";
import { PlanType } from "@/lib/plans";
import { getPlanConfig } from "@/lib/planConfig";

export interface UserUsage {
  plan: PlanType;
  invoicesThisMonth: number;
  emailsThisMonth: number;
  invoiceLimit: number | null;
  emailLimit: number | null;
}

type Db = typeof prisma | Prisma.TransactionClient;

// `knownPlan`: pass it when the caller already loaded the user's plan in this
// request (e.g. getCurrentUser()) to skip re-selecting it. Limit checks that
// gate a write inside a transaction should NOT pass it — they must read the
// plan under the same lock as the write (pattern 3).
export async function getUserUsage(
  userId: string,
  db: Db = prisma,
  knownPlan?: PlanType
): Promise<UserUsage> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [planValue, invoices, emails] = await Promise.all([
    knownPlan ??
      db.user
        .findUniqueOrThrow({ where: { id: userId }, select: { plan: true } })
        .then((user) => user.plan),
    db.invoice.count({ where: { userId, createdAt: { gte: monthStart, lte: monthEnd } } }),
    db.emailLog.count({ where: { userId, sentAt: { gte: monthStart, lte: monthEnd } } }),
  ]);

  const plan = planValue as PlanType;
  const planConfig = await getPlanConfig(plan);
  return {
    plan,
    invoicesThisMonth: invoices,
    emailsThisMonth: emails,
    invoiceLimit: planConfig.invoiceLimit,
    emailLimit: planConfig.emailLimit,
  };
}

export async function logEmailSent(userId: string, emailType: string, invoiceId?: string) {
  await prisma.emailLog.create({ data: { userId, emailType, invoiceId } });
}

export function isEmailLimitOk(usage: UserUsage): boolean {
  return usage.emailLimit === null || usage.emailsThisMonth < usage.emailLimit;
}
