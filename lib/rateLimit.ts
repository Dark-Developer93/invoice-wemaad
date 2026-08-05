// Best-effort in-memory rate limiter. State lives per server instance and is
// lost on cold start / doesn't share across concurrent serverless instances,
// so this is a first line of defense against casual abuse (mail-bombing a
// magic-link target, spamming the contact form), not a hard guarantee. A
// shared store (e.g. Redis) would be needed for airtight enforcement.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (bucket.count >= limit) {
    return false;
  }

  bucket.count++;
  return true;
}
