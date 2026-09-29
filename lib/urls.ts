import crypto from "crypto";
import { env } from "@/lib/env";

function hmacToken(invoiceId: string): string {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(invoiceId).digest("hex");
}

// Resolution order (all Vercel vars are auto-set and have no scheme):
// 1. Production: VERCEL_PROJECT_PRODUCTION_URL — the stable production domain
//    (a custom domain once one is added). This is what invoice emails link
//    to, and those links are opened by the client's *customers*, who have no
//    account. VERCEL_URL must not be used here: in production it's the
//    per-deployment hostname (my-app-abc123.vercel.app), which can sit behind
//    Vercel Deployment Protection (customer sees a Vercel login) and breaks
//    once that deployment is removed — while the emailed link lives forever.
// 2. Previews: VERCEL_URL, so a preview links to itself.
// 3. Local dev / non-Vercel hosts: NEXT_PUBLIC_APP_URL.
//
// Reads process.env directly rather than the validated `env` proxy: this is
// called from app/sitemap.ts and app/robots.ts, which Next.js executes at
// build time, so it must not require the full (secret-bearing) env schema to
// be present just to resolve a public URL.
export function getBaseUrl(): string {
  if (process.env.VERCEL_ENV === "production" && process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return (process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

export function getInvoiceUrl(invoiceId: string): string {
  const token = hmacToken(invoiceId);
  return `${getBaseUrl()}/api/invoice/${invoiceId}?token=${token}`;
}

export function verifyInvoiceToken(invoiceId: string, token: string): boolean {
  try {
    const expected = hmacToken(invoiceId);
    if (token.length !== expected.length) return false;
    return crypto.timingSafeEqual(Buffer.from(token, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}
