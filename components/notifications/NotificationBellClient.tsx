"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { markAllNotificationsRead } from "@/app/actions/notifications";

type Notification = {
  id: string;
  title: string;
  message: string;
  href: string | null;
  readAt: Date | null;
  createdAt: Date;
};

export function NotificationBellClient({
  notifications: initial,
}: {
  notifications: Notification[];
}) {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(initial);

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  async function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next && unreadCount > 0) {
      await markAllNotificationsRead();
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, readAt: n.readAt ?? new Date() }))
      );
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative shrink-0 rounded-full">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 size-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Notifications</h3>
        </div>
        <div className="max-h-80 overflow-y-auto divide-y">
          {notifications.length === 0 ? (
            <p className="px-4 py-8 text-center text-sm text-muted-foreground">
              No notifications yet
            </p>
          ) : (
            notifications.map((n) => {
              const content = (
                <div
                  className={`px-4 py-3 ${!n.readAt ? "bg-muted/50" : ""}`}
                >
                  <p className="text-sm font-medium leading-snug">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-snug">
                    {n.message}
                  </p>
                  <p className="text-xs text-muted-foreground/60 mt-1.5">
                    {formatDistanceToNow(new Date(n.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              );
              return n.href ? (
                <Link
                  key={n.id}
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="block hover:bg-muted/30 transition-colors"
                >
                  {content}
                </Link>
              ) : (
                <div key={n.id}>{content}</div>
              );
            })
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
