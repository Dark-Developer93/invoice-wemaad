import crypto from "crypto";
import { env } from "@/lib/env";

function hmacToken(invoiceId: string): string {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(invoiceId).digest("hex");
}

// VERCEL_URL is auto-set by Vercel on every deployment (production + PR previews).
// It has no scheme, so we prepend https://. Fall back to NEXT_PUBLIC_APP_URL for
// local dev and non-Vercel hosts.
//
// Reads process.env directly rather than the validated `env` proxy: this is
// called from app/sitemap.ts and app/robots.ts, which Next.js executes at
// build time, so it must not require the full (secret-bearing) env schema to
// be present just to resolve a public URL.
export function getBaseUrl(): string {
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
