"use server";

import { unstable_cache, revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";
import { cacheTags } from "@/lib/cache";

const NOTIFICATION_PAGE_SIZE = 20;

// Cached until invalidated by revalidateTag(cacheTags.notifications(userId))
// — called here after markAllNotificationsRead, and at every
// prisma.notification.create call site (lib/email/invoice.ts, lib/monitoring.ts,
// app/actions/admin.ts) — no time-based staleness.
export async function getUserNotifications() {
  const session = await requireUser();
  const userId = session.user!.id as string;
  try {
    const notifications = await unstable_cache(
      () =>
        prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: NOTIFICATION_PAGE_SIZE,
        }),
      ["notifications", userId],
      { tags: [cacheTags.notifications(userId)] }
    )();

    // unstable_cache serializes its return value, so Date fields come back as
    // ISO strings on a cache hit — normalize back to Date so callers always
    // get the same shape regardless of cache hit/miss.
    return notifications.map((n) => ({
      ...n,
      createdAt: new Date(n.createdAt),
      readAt: n.readAt ? new Date(n.readAt) : null,
    }));
  } catch (error) {
    console.error("Failed to fetch notifications:", error);
    return [];
  }
}

export async function markAllNotificationsRead() {
  const session = await requireUser();
  try {
    await prisma.notification.updateMany({
      where: { userId: session.user.id, readAt: null },
      data: { readAt: new Date() },
    });
    revalidateTag(cacheTags.notifications(session.user!.id as string));
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
  }
}
