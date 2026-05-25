import { NextResponse } from "next/server";
import { processRecurringInvoices } from "@/app/actions/recurringInvoices";

export async function GET(request: Request) {
  const auth = request.headers.get("Authorization");
  const expected = `Bearer ${process.env.CRON_SECRET}`;

  if (!process.env.CRON_SECRET || auth !== expected) {
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
