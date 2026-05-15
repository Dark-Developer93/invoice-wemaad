"use server";

import { revalidatePath } from "next/cache";

import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";
import { PlanType } from "@/lib/plans";

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
