# /lib

- `db.ts` — Prisma singleton. Import as `import prisma from "@/lib/db"`. Never `new PrismaClient()`.
- `session.ts` — `requireUser()` / `requireAdmin()` / `getRequiredUserId()` redirect on failure. Use in Server Components and Actions only (not in API route handlers).
- `auth.ts` — `auth()` reads session without redirect. Use in `/app/api/` route handlers.
- `env.ts` — validated env proxy. Never use `process.env.*` outside this file.
- `schemas/` — one Zod schema file per domain. Re-export everything through `zodSchemas.ts`.
- `email/index.ts` — transport + `sendEmail()`. `email/invoice.ts` — `dispatchInvoiceEmail()` (preferred for invoice emails).
- `plans.ts` — source of truth for all plan limits and feature flags. No plan logic elsewhere.
- `usage.ts` — `getUserUsage()`, `isEmailLimitOk()`, `logEmailSent()`. Always use these; never query `EmailLog` directly.
- `toFormData.ts` — arrays are `JSON.stringify`'d. Schemas must use `z.preprocess(JSON.parse, ...)` for array fields.
