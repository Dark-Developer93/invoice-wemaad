import crypto from "crypto";
import { env } from "@/lib/env";

function hmacToken(invoiceId: string): string {
  return crypto.createHmac("sha256", env.AUTH_SECRET).update(invoiceId).digest("hex");
}

export function getInvoiceUrl(invoiceId: string): string {
  const base = env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  const token = hmacToken(invoiceId);
  return `${base}/api/invoice/${invoiceId}?token=${token}`;
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
