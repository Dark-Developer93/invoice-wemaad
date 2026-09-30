// Server-side pagination helpers. Lists that grow without bound (a user's
// invoices, the admin user list, outstanding invoices) are fetched one page
// at a time with skip/take plus a COUNT, instead of loading and rendering
// every row on every visit.

export const PAGE_SIZES = {
  invoices: 20,
  adminUsers: 25,
  outstandingInvoices: 10,
} as const;

// Reads `?page=` (or another param) from Next's searchParams. Anything that
// isn't a positive integer (missing, "abc", "-3", "2.5", arrays) means page 1.
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw || !/^\d+$/.test(raw)) return 1;
  const page = Number(raw);
  return Number.isSafeInteger(page) && page >= 1 ? page : 1;
}

export interface PageInfo {
  page: number; // 1-based, clamped to an existing page
  pageCount: number; // always >= 1, even for an empty list
  skip: number;
  take: number;
}

// Clamps the requested page to the last existing one, so a stale link (e.g.
// page 5 after deleting down to 3 pages) shows the last page instead of an
// empty table.
export function getPageInfo(requestedPage: number, totalCount: number, pageSize: number): PageInfo {
  const pageCount = Math.max(1, Math.ceil(totalCount / pageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  return { page, pageCount, skip: (page - 1) * pageSize, take: pageSize };
}
