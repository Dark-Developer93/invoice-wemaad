import { startOfMonth, endOfMonth } from "date-fns";

import prisma from "@/lib/db";
import { PLAN_LIMITS, PlanType } from "@/lib/plans";

export interface UserUsage {
  plan: PlanType;
  invoicesThisMonth: number;
  emailsThisMonth: number;
  invoiceLimit: number | null;
  emailLimit: number | null;
}

export async function getUserUsage(userId: string): Promise<UserUsage> {
  const now = new Date();
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [user, invoices, emails] = await Promise.all([
    prisma.user.findUniqueOrThrow({ where: { id: userId }, select: { plan: true } }),
    prisma.invoice.count({ where: { userId, createdAt: { gte: monthStart, lte: monthEnd } } }),
    prisma.emailLog.count({ where: { userId, sentAt: { gte: monthStart, lte: monthEnd } } }),
  ]);

  const plan = user.plan as PlanType;
  return {
    plan,
    invoicesThisMonth: invoices,
    emailsThisMonth: emails,
    invoiceLimit: PLAN_LIMITS[plan].invoices,
    emailLimit: PLAN_LIMITS[plan].emails,
  };
}

export async function logEmailSent(userId: string, emailType: string, invoiceId?: string) {
  await prisma.emailLog.create({ data: { userId, emailType, invoiceId } });
}
