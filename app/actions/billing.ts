"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";
import { PlanType } from "@/lib/plans";

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

export async function getUserPendingUpgradeRequest() {
  const session = await requireUser();
  return prisma.planUpgradeRequest.findFirst({
    where: { userId: session.user!.id!, status: "PENDING" },
    orderBy: { createdAt: "desc" },
  });
}
