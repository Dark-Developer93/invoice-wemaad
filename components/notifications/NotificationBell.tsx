import prisma from "@/lib/db";
import { NotificationBellClient } from "./NotificationBellClient";

export async function NotificationBell({ userId }: { userId: string }) {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return <NotificationBellClient notifications={notifications} />;
}
