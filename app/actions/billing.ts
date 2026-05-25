"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";
import { PlanType } from "@/lib/plans";

export async function requestPlanUpgrade(newPlan: PlanType) {
  try {
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
  } catch (error) {
    console.error("Failed to request plan upgrade:", error);
    return { status: "error" as const, message: "Failed to submit upgrade request. Please try again." };
  }
}

export async function getUserPendingUpgradeRequest() {
  try {
    const session = await requireUser();
    return prisma.planUpgradeRequest.findFirst({
      where: { userId: session.user.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
    });
  } catch {
    return null;
  }
}
