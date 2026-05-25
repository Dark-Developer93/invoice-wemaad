"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/session";

const planSchema = z.enum(["FREE", "STARTER", "PRO", "BUSINESS"]);

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
  }
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
}

export async function adminRejectUpgradeRequest(requestId: string, adminNote?: string) {
  await requireAdmin();

  if (adminNote && adminNote.length > 1000) {
    throw new Error("Admin note cannot exceed 1000 characters.");
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
}
