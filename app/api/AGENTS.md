# /app/api

- Use `auth()` from `@/lib/auth` for session checks — **never** `requireUser()` / `requireAdmin()` (they `redirect()` and break route handlers).
- On failure: `NextResponse.json({ error: "..." }, { status: 401 | 403 | 404 | 500 })`.
- **No CRUD mutations** — create/update/delete via Server Actions in `app/actions/`.
- `params` is a `Promise` in Next.js 15 — always `await params` in dynamic routes.
- Routes:
  - `GET /api/invoice/[invoiceId]` — public PDF; verify token/HMAC before `generateInvoicePDF(id, true)`.
  - `GET /api/dashboard/chart-data` · `GET /api/reports/export` — session via `auth()`.
  - `POST /api/cron/recurring-invoices` — `Authorization: Bearer ${CRON_SECRET}` only.
  - `app/api/auth/[...nextauth]/` — NextAuth handlers; do not add business logic here.
