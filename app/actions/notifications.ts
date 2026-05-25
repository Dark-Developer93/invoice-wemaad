"use server";

import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

const NOTIFICATION_PAGE_SIZE = 20;

export async function getUserNotifications() {
  const session = await requireUser();
  try {
    return await prisma.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: NOTIFICATION_PAGE_SIZE,
    });
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
  } catch (error) {
    console.error("Failed to mark notifications as read:", error);
  }
}
