import crypto from "crypto";
import { NextResponse } from "next/server";
import { processRecurringInvoices } from "@/app/actions/recurringInvoices";
import { recordCronRun, alertAdmins } from "@/lib/monitoring";

const JOB_NAME = "recurring-invoices";

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
    const result = await processRecurringInvoices();
    const finishedAt = new Date();

    const status = await recordCronRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt,
      processed: result.processed,
      failed: result.failed,
      errorMessage: result.failed > 0 ? result.errors.join("; ") : undefined,
    });

    if (status !== "SUCCESS") {
      const total = result.processed + result.failed + result.skippedAtLimit;
      await alertAdmins({
        title: "Recurring invoices job had failures",
        message: `${result.failed} of ${total} due recurring invoices failed to process. Errors: ${result.errors.join("; ")}`,
        href: "/admin/monitoring",
      }).catch((err) => console.error("Failed to alert admins:", err));
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (err) {
    const finishedAt = new Date();
    const errorMessage = err instanceof Error ? err.message : String(err);
    console.error("Cron error:", err);

    await recordCronRun({
      jobName: JOB_NAME,
      startedAt,
      finishedAt,
      errorMessage,
    }).catch((recordErr) => console.error("Failed to record cron run:", recordErr));

    await alertAdmins({
      title: "Recurring invoices job failed",
      message: `The daily recurring-invoices cron job threw an unhandled error: ${errorMessage}`,
      href: "/admin/monitoring",
    }).catch((alertErr) => console.error("Failed to alert admins:", alertErr));

    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
