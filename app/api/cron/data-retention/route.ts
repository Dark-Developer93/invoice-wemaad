import crypto from "crypto";
import { NextResponse } from "next/server";
import { pruneOldRecords } from "@/lib/retention";
import { recordCronRun, alertAdmins } from "@/lib/monitoring";

const JOB_NAME = "data-retention";

function isAuthorized(request: Request): boolean {
  if (!process.env.CRON_SECRET) return false;

  const auth = request.headers.get("Authorization") ?? "";
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  const authBuf = Buffer.from(auth);
  const expectedBuf = Buffer.from(expected);
  if (authBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(authBuf, expectedBuf);
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startedAt = new Date();

  try {
    const result = await pruneOldRecords();
    const finishedAt = new Date();
    const totalDeleted =
      result.emailLogsDeleted + result.notificationsDeleted + result.cronRunsDeleted;

    await recordCronRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt,
      processed: totalDeleted,
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const finishedAt = new Date();
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Data-retention cron error:", err);

    await recordCronRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt,
      errorMessage,
    }).catch((recordErr) => console.error("Failed to record cron run:", recordErr));

    await alertAdmins({
      title: "Data-retention job failed",
      message: `The daily data-retention cron job threw an unhandled error: ${errorMessage}`,
      href: "/admin/monitoring",
    }).catch((alertErr) => console.error("Failed to alert admins:", alertErr));

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
