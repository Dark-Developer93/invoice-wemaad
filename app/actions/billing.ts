"use server";

import { revalidatePath, revalidateTag, unstable_cache } from "next/cache";

import { requireUser } from "@/lib/session";
import prisma from "@/lib/db";
import { PlanType } from "@/lib/plans";
import { cacheTags } from "@/lib/cache";

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
    revalidateTag(cacheTags.billing(session.user.id));

    return { status: "success" as const };
  } catch (error) {
    console.error("Failed to request plan upgrade:", error);
    return { status: "error" as const, message: "Failed to submit upgrade request. Please try again." };
  }
}

// Cached until invalidated by revalidateTag(cacheTags.billing(userId)) —
// called here after requestPlanUpgrade, and by
// adminApproveUpgradeRequest/adminRejectUpgradeRequest in app/actions/admin.ts
// since those change the same pending-request status from the admin side.
// No time-based staleness.
export async function getUserPendingUpgradeRequest() {
  try {
    const session = await requireUser();
    const userId = session.user!.id as string;

    const request = await unstable_cache(
      () =>
        prisma.planUpgradeRequest.findFirst({
          where: { userId, status: "PENDING" },
          orderBy: { createdAt: "desc" },
        }),
      ["pending-upgrade-request", userId],
      { tags: [cacheTags.billing(userId)] }
    )();

    if (!request) return null;

    // unstable_cache serializes its return value, so Date fields come back
    // as ISO strings on a cache hit — normalize back to Date so callers
    // always get the same shape regardless of cache hit/miss.
    return {
      ...request,
      createdAt: new Date(request.createdAt),
      updatedAt: new Date(request.updatedAt),
    };
  } catch {
    return null;
  }
}
