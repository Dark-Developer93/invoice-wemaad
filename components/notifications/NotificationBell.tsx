import { getUserNotifications } from "@/app/actions/notifications";
import { NotificationBellClient } from "./NotificationBellClient";

export async function NotificationBell() {
  const notifications = await getUserNotifications();
  return <NotificationBellClient notifications={notifications} />;
}
