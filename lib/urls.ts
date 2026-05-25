import crypto from "crypto";

function hmacToken(invoiceId: string): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return crypto.createHmac("sha256", secret).update(invoiceId).digest("hex");
}

export function getInvoiceUrl(invoiceId: string): string {
  const base =
    process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
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
