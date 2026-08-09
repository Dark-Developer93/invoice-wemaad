// Single source of truth for cache tag names. Used both when caching a
// per-user read (unstable_cache's `tags` option) and when invalidating it
// (revalidateTag) after a mutation — keeping tag construction in one place
// means a typo or mismatch between the two sides can't silently cause a
// read to never invalidate.
export const cacheTags = {
  invoices: (userId: string) => `invoices-${userId}`,
  clients: (userId: string) => `clients-${userId}`,
  recurringInvoices: (userId: string) => `recurring-invoices-${userId}`,
  notifications: (userId: string) => `notifications-${userId}`,
  billing: (userId: string) => `billing-${userId}`,
  // Platform-wide, not per-user — every plan tier's price/limits/features.
  planConfig: "plan-config",
};
