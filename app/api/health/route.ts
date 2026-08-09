import { NextResponse } from "next/server";
import prisma from "@/lib/db";

// Public, unauthenticated by design — meant to be pinged by an external
// uptime monitor (UptimeRobot, BetterStack, Pingdom, etc.). Returns only a
// boolean-ish status, no application data.
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", db: "ok", timestamp: new Date().toISOString() });
  } catch (error) {
    console.error("[HEALTH_CHECK]", error);
    return NextResponse.json(
      { status: "error", db: "error", timestamp: new Date().toISOString() },
      { status: 503 }
    );
  }
}
