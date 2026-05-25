"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";
import { PlanType, PLAN_ORDER } from "@/lib/plans";

export async function requestPlanUpgrade(newPlan: PlanType) {
  const session = await requireUser();

  if (!session?.user?.id) {
    return { status: "error" as const, message: "User not found" };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { plan: true },
  });

  if (!user) {
    return { status: "error" as const, message: "User not found" };
  }

  if (user.plan === newPlan) {
    return { status: "error" as const, message: "You are already on this plan." };
  }

  // Cancel any existing PENDING request for this user
  await prisma.planUpgradeRequest.updateMany({
    where: { userId: session.user.id, status: "PENDING" },
    data: { status: "REJECTED", adminNote: "Superseded by a new request" },
  });

  await prisma.planUpgradeRequest.create({
    data: {
      userId: session.user.id,
      requestedPlan: newPlan,
      status: "PENDING",
    },
  });

  revalidatePath("/dashboard/billing");

  return { status: "success" as const };
}

export async function getUserPendingUpgradeRequest(userId: string) {
  return prisma.planUpgradeRequest.findFirst({
    where: { userId, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}

// Internal: called by admin only
export async function updateUserPlan(newPlan: PlanType) {
  const session = await requireUser();

  if (!session?.user?.id) {
    return { status: "error" as const, message: "User not found" };
  }

  if (newPlan === "BUSINESS") {
    return { status: "error" as const, message: "Contact sales to upgrade to the Business plan." };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { plan: newPlan, planUpdatedAt: new Date() },
  });

  revalidatePath("/dashboard/billing");
  revalidatePath("/dashboard");

  return { status: "success" as const };
}
