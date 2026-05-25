"use server";

import { z } from "zod";
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
