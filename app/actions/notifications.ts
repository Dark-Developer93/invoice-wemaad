"use server";

import prisma from "@/lib/db";
import { requireUser } from "@/lib/session";

export async function getUserNotifications() {
  const session = await requireUser();
  return prisma.notification.findMany({
    where: { userId: session.user!.id! },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
}

export async function markAllNotificationsRead() {
  const session = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: session.user!.id!, readAt: null },
    data: { readAt: new Date() },
  });
}
