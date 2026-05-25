"use server";

import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { requireAdmin } from "@/lib/session";
import { PlanType } from "@prisma/client";

async function verifyAdmin() {
  const session = await requireAdmin();
  return session;
}

export async function adminGetAllUsers() {
  await verifyAdmin();

  const users = await prisma.user.findMany({
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
        select: {
          invoices: true,
          clients: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users;
}

export async function adminGetUser(userId: string) {
  await verifyAdmin();

  const user = await prisma.user.findUnique({
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

  return user;
}

export async function adminUpdateUserPlan(userId: string, plan: PlanType) {
  await verifyAdmin();

  await prisma.user.update({
    where: { id: userId },
    data: { plan, planUpdatedAt: new Date() },
  });
}

export async function adminToggleUserActive(userId: string, isActive: boolean) {
  await verifyAdmin();

  // Prevent deactivating an admin account
  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (target?.isAdmin) {
    throw new Error("Cannot deactivate an admin account.");
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive },
  });
}

export async function adminDeleteUser(userId: string) {
  await verifyAdmin();

  const target = await prisma.user.findUnique({
    where: { id: userId },
    select: { isAdmin: true },
  });

  if (target?.isAdmin) {
    throw new Error("Cannot delete an admin account.");
  }

  await prisma.user.delete({ where: { id: userId } });
  redirect("/admin/users");
}
