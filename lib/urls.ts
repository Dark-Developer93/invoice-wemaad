import crypto from "crypto";
import { env } from "@/lib/env";

function hmacToken(invoiceId: string): string {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(invoiceId).digest("hex");
}

// VERCEL_URL is auto-set by Vercel on every deployment (production + PR previews).
// It has no scheme, so we prepend https://. Fall back to NEXT_PUBLIC_APP_URL for
// local dev and non-Vercel hosts.
function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
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
