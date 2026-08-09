import { revalidateTag } from "next/cache";
import prisma from "@/lib/db";
import { sendEmail } from "@/lib/email";
import { cacheTags } from "@/lib/cache";

const ERROR_MESSAGE_MAX_LENGTH = 2000;

interface RecordCronRunInput {
  jobName: string;
  startedAt: Date;
  finishedAt: Date;
  processed?: number;
  failed?: number;
  errorMessage?: string;
}

// Persists one row per scheduled job execution so a silently-failing cron
// job is visible in the database (and from there, the admin panel) instead
// of only existing transiently in Vercel's function logs.
export async function recordCronRun(input: RecordCronRunInput) {
  const status = input.errorMessage
    ? "FAILURE"
    : (input.failed ?? 0) > 0
      ? "PARTIAL_FAILURE"
      : "SUCCESS";

  await prisma.cronRun.create({
    data: {
      jobName: input.jobName,
      status,
      startedAt: input.startedAt,
      finishedAt: input.finishedAt,
      processed: input.processed ?? 0,
      failed: input.failed ?? 0,
      errorMessage: input.errorMessage?.slice(0, ERROR_MESSAGE_MAX_LENGTH),
    },
  });

  return status;
}

interface AlertAdminsInput {
  title: string;
  message: string;
  href?: string;
}

// Notifies every active admin both in-app (bell, persists until read) and by
// email (so it doesn't depend on someone happening to check the dashboard).
// Best-effort: a failure notifying one admin, or one channel, doesn't block
// the others.
export async function alertAdmins({ title, message, href }: AlertAdminsInput) {
  const admins = await prisma.user.findMany({
    where: { isAdmin: true, isActive: true },
    select: { id: true, email: true },
  });

  await Promise.allSettled([
    ...admins.map((admin) =>
      prisma.notification.create({
        data: { userId: admin.id, title, message, href },
      }).then(() => {
        revalidateTag(cacheTags.notifications(admin.id));
      }).catch((err) => {
        console.error(`Failed to create system alert notification for admin ${admin.id}:`, err);
      })
    ),
    ...admins.map((admin) =>
      sendEmail({
        to: admin.email,
        templateName: "systemAlert",
        variables: { title, message, href },
      }).catch((err) => {
        console.error(`Failed to send system alert email to ${admin.email}:`, err);
      })
    ),
  ]);
}
