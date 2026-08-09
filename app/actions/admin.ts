"use server";

import { z } from "zod";
import { subMonths, format, startOfMonth } from "date-fns";
import { revalidatePath, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { cacheTags } from "@/lib/cache";
import { getPlanConfigs } from "@/lib/planConfig";
import { PLAN_ORDER, PlanType } from "@/lib/plans";

const planSchema = z.enum(["FREE", "STARTER", "PRO", "BUSINESS"]);

const ADMIN_NOTE_MAX_LENGTH = 1000;

export async function adminGetAllUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      plan: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
      planUpdatedAt: true,
      companyName: true,
      _count: {
        select: { invoices: true, clients: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminGetUser(userId: string) {
  await requireAdmin();

  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      plan: true,
      isAdmin: true,
      isActive: true,
      createdAt: true,
      planUpdatedAt: true,
      companyName: true,
      companyEmail: true,
      companyAddress: true,
      address: true,
      _count: {
        select: {
          invoices: true,
          clients: true,
          emailLogs: true,
          recurringInvoices: true,
        },
      },
    },
  });
}

export async function adminUpdateUserPlan(userId: string, plan: string) {
  await requireAdmin();

  const parsed = planSchema.safeParse(plan);
  if (!parsed.success) throw new Error("Invalid plan value.");

  await prisma.user.update({
    where: { id: userId },
    data: { plan: parsed.data, planUpdatedAt: new Date() },
  });

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/dashboard/billing");
}

export async function adminToggleUserActive(userId: string, isActive: boolean) {
  await requireAdmin();

  // Atomic: the WHERE clause on isAdmin: false prevents deactivating admins
  // and also closes the TOCTOU window for concurrent admin promotions.
  const result = await prisma.user.updateMany({
    where: { id: userId, isAdmin: false },
    data: { isActive },
  });

  if (result.count === 0) {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (target?.isAdmin) throw new Error("Cannot deactivate an admin account.");
    throw new Error("User not found.");
  }

  // Deactivating a user pauses all their recurring invoices so the cron
  // does not generate invoices while the account is suspended.
  if (!isActive) {
    await prisma.recurringInvoice.updateMany({
      where: { userId },
      data: { isActive: false },
    });
    revalidateTag(cacheTags.recurringInvoices(userId));
  }

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${userId}`);
}

export async function adminToggleUserAdmin(userId: string, makeAdmin: boolean) {
  const session = await requireAdmin();

  if (session.user!.id === userId && !makeAdmin) {
    throw new Error("You cannot remove your own admin privileges.");
  }

  const result = await prisma.user.updateMany({
    where: { id: userId },
    data: { isAdmin: makeAdmin },
  });

  if (result.count === 0) throw new Error("User not found.");

  revalidatePath(`/admin/users/${userId}`);
  revalidatePath("/admin/users");
}

export async function adminGetPendingUpgradeRequests() {
  await requireAdmin();

  return prisma.planUpgradeRequest.findMany({
    where: { status: "PENDING" },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          plan: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function adminGetUserUpgradeRequests(userId: string) {
  await requireAdmin();

  return prisma.planUpgradeRequest.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
  });
}

export async function adminApproveUpgradeRequest(requestId: string) {
  await requireAdmin();

  const request = await prisma.planUpgradeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already resolved.");
  }

  await prisma.$transaction([
    prisma.planUpgradeRequest.update({
      where: { id: requestId },
      data: { status: "APPROVED" },
    }),
    prisma.user.update({
      where: { id: request.userId },
      data: { plan: request.requestedPlan, planUpdatedAt: new Date() },
    }),
    prisma.notification.create({
      data: {
        userId: request.userId,
        title: "Plan upgrade approved",
        message: `Your request to upgrade to the ${request.requestedPlan} plan has been approved.`,
        href: "/dashboard/billing",
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${request.userId}`);
  revalidatePath("/dashboard/billing");
  revalidateTag(cacheTags.notifications(request.userId));
  revalidateTag(cacheTags.billing(request.userId));
}

export async function adminRejectUpgradeRequest(requestId: string, adminNote?: string) {
  await requireAdmin();

  if (adminNote && adminNote.length > ADMIN_NOTE_MAX_LENGTH) {
    throw new Error(`Admin note cannot exceed ${ADMIN_NOTE_MAX_LENGTH} characters.`);
  }

  const request = await prisma.planUpgradeRequest.findUnique({
    where: { id: requestId },
  });

  if (!request || request.status !== "PENDING") {
    throw new Error("Request not found or already resolved.");
  }

  await prisma.$transaction([
    prisma.planUpgradeRequest.update({
      where: { id: requestId },
      data: { status: "REJECTED", adminNote: adminNote || null },
    }),
    prisma.notification.create({
      data: {
        userId: request.userId,
        title: "Plan upgrade not approved",
        message: adminNote
          ? `Your request to upgrade to the ${request.requestedPlan} plan was not approved. Note: ${adminNote}`
          : `Your request to upgrade to the ${request.requestedPlan} plan was not approved.`,
        href: "/dashboard/billing",
      },
    }),
  ]);

  revalidatePath("/admin/users");
  revalidatePath(`/admin/users/${request.userId}`);
  revalidatePath("/dashboard/billing");
  revalidateTag(cacheTags.notifications(request.userId));
  revalidateTag(cacheTags.billing(request.userId));
}

export async function adminDeleteUser(userId: string) {
  await requireAdmin();

  // Atomic: only delete non-admin users in a single operation.
  const result = await prisma.user.deleteMany({
    where: { id: userId, isAdmin: false },
  });

  if (result.count === 0) {
    const target = await prisma.user.findUnique({
      where: { id: userId },
      select: { isAdmin: true },
    });
    if (target?.isAdmin) throw new Error("Cannot delete an admin account.");
    throw new Error("User not found.");
  }
  // Sessions are cascade-deleted at the DB level (Session.onDelete: Cascade).
  revalidatePath("/admin/users");
}

const CRON_RUN_HISTORY_LIMIT = 50;

export async function adminGetRecentCronRuns() {
  await requireAdmin();

  return prisma.cronRun.findMany({
    orderBy: { startedAt: "desc" },
    take: CRON_RUN_HISTORY_LIMIT,
  });
}

export async function adminGetPlanConfigs() {
  await requireAdmin();
  return getPlanConfigs();
}

const MAX_LIMIT_VALUE = 1_000_000;
const MAX_PRICE_VALUE = 100_000;

const planConfigSchema = z.object({
  price: z.coerce.number().int().min(0).max(MAX_PRICE_VALUE).nullable(),
  invoiceLimit: z.coerce.number().int().min(1).max(MAX_LIMIT_VALUE).nullable(),
  emailLimit: z.coerce.number().int().min(1).max(MAX_LIMIT_VALUE).nullable(),
  recurringInvoices: z.boolean(),
  analytics: z.boolean(),
  customBranding: z.boolean(),
  teamCollaboration: z.boolean(),
  apiAccess: z.boolean(),
  multiUser: z.boolean(),
});

export type PlanConfigInput = z.infer<typeof planConfigSchema>;

export async function adminUpdatePlanConfig(plan: string, input: PlanConfigInput) {
  await requireAdmin();

  const parsedPlan = planSchema.safeParse(plan);
  if (!parsedPlan.success) throw new Error("Invalid plan.");

  const parsed = planConfigSchema.safeParse(input);
  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid plan configuration.");
  }

  await prisma.planConfig.upsert({
    where: { plan: parsedPlan.data },
    update: parsed.data,
    create: { plan: parsedPlan.data, ...parsed.data },
  });

  revalidateTag(cacheTags.planConfig);
  revalidatePath("/admin/plans");
  revalidatePath("/dashboard/billing");
}

export interface PlatformInsights {
  totalUsers: number;
  activeUsers: number;
  totalClients: number;
  totalInvoices: number;
  estimatedMrr: number;
  planDistribution: Array<{ plan: PlanType; count: number; price: number | null }>;
  monthlySignups: Array<{ month: string; count: number }>;
}

// Deliberately does NOT aggregate invoice totals/amounts: those belong to
// individual users' own businesses (what they bill their own clients), not
// to the platform operator. Summing them "just" as an aggregate still
// discloses financial data about what users are doing on the platform that
// an admin has no legitimate need to see. estimatedMrr is the one dollar
// figure here, and it's the platform's own subscription revenue (plan
// price x subscriber count) — nothing derived from any user's invoices.
//
// Not cached, unlike user-facing reads — admin pages read straight from the
// DB like the rest of the admin panel (adminGetAllUsers, etc.), and this is
// low-traffic enough that the extra query cost doesn't matter.
export async function adminGetPlatformInsights(): Promise<PlatformInsights> {
  await requireAdmin();

  const now = new Date();
  const twelveMonthsAgo = startOfMonth(subMonths(now, 11));

  const [totalUsers, activeUsers, totalClients, totalInvoices, planCounts, recentUsers, planConfigs] =
    await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.client.count(),
      prisma.invoice.count(),
      prisma.user.groupBy({ by: ["plan"], _count: { _all: true } }),
      prisma.user.findMany({
        where: { createdAt: { gte: twelveMonthsAgo } },
        select: { createdAt: true },
      }),
      getPlanConfigs(),
    ]);

  const monthlySignupsMap: Record<string, number> = {};
  for (let i = 11; i >= 0; i--) {
    monthlySignupsMap[format(subMonths(now, i), "MMM yy")] = 0;
  }
  for (const user of recentUsers) {
    const key = format(new Date(user.createdAt), "MMM yy");
    if (key in monthlySignupsMap) monthlySignupsMap[key] += 1;
  }

  const countByPlan = new Map(planCounts.map((p) => [p.plan, p._count._all]));
  const planDistribution = PLAN_ORDER.map((plan) => ({
    plan,
    count: countByPlan.get(plan) ?? 0,
    price: planConfigs[plan].price,
  }));

  // Business/custom pricing (price === null) isn't counted — there's no
  // single number to multiply by, so it's excluded from the estimate rather
  // than silently treated as $0.
  const estimatedMrr = planDistribution.reduce(
    (sum, p) => sum + (p.price !== null ? p.price * p.count : 0),
    0
  );

  return {
    totalUsers,
    activeUsers,
    totalClients,
    totalInvoices,
    estimatedMrr,
    planDistribution,
    monthlySignups: Object.entries(monthlySignupsMap).map(([month, count]) => ({ month, count })),
  };
}
