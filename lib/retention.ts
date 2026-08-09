import prisma from "@/lib/db";

// How long EmailLog, Notification, and CronRun rows are kept before the
// data-retention cron deletes them. Usage-limit checks only ever look at
// the current calendar month (see lib/usage.ts), and the admin monitoring
// page only ever displays the most recent CRON_RUN_HISTORY_LIMIT rows, so
// pruning anything older than this doesn't change any observable behavior.
//
// Set conservatively high for now since the user base is still small —
// tighten this once there's enough volume that storage actually matters.
export const RETENTION_DAYS = 90;

export interface PruneOldRecordsResult {
  emailLogsDeleted: number;
  notificationsDeleted: number;
  cronRunsDeleted: number;
}

export async function pruneOldRecords(): Promise<PruneOldRecordsResult> {
  const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000);

  const [emailLogs, notifications, cronRuns] = await Promise.all([
    prisma.emailLog.deleteMany({ where: { sentAt: { lt: cutoff } } }),
    // Read notifications are safe to drop once stale; unread ones are kept
    // regardless of age so a user never loses an unseen notification.
    prisma.notification.deleteMany({
      where: { createdAt: { lt: cutoff }, readAt: { not: null } },
    }),
    prisma.cronRun.deleteMany({ where: { startedAt: { lt: cutoff } } }),
  ]);

  return {
    emailLogsDeleted: emailLogs.count,
    notificationsDeleted: notifications.count,
    cronRunsDeleted: cronRuns.count,
  };
}
