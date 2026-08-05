import crypto from "crypto";
import { NextResponse } from "next/server";
import { processRecurringInvoices } from "@/app/actions/recurringInvoices";

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

  try {
    await processRecurringInvoices();
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Cron error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
