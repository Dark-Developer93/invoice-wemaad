# Skill: pr-review

Review PRs across five dimensions. Report findings grouped by section.
Flag as **blocker** (must fix) or **nit** (should fix).

---

## 1. Correctness — project-specific rules

- [ ] Every action has an auth guard as the first line (`getRequiredUserId`, `requireUser`, or `requireAdmin`)
- [ ] All DB queries include `userId` in `where` (no cross-user data leakage)
- [ ] New mutations that create invoices or send emails check plan limits via `getUserUsage()` first
- [ ] Email sends use `dispatchInvoiceEmail()` from `@/lib/email/invoice`, not raw `sendEmail()` directly
- [ ] `isEmailLimitOk(usage)` is checked before any email dispatch
- [ ] New Zod schemas are re-exported from `lib/zodSchemas.ts`
- [ ] Action files have `"use server"` · Client components have `"use client"`
- [ ] No `process.env.*` outside `@/lib/env.ts`
- [ ] No `new PrismaClient()` — only `import prisma from "@/lib/db"`
- [ ] Arrays through FormData: `JSON.stringify` on client + `z.preprocess(JSON.parse, ...)` in schema
- [ ] Schema changes include a migration (`prisma/migrations/` has a new entry)
- [ ] Destructive admin operations guard against affecting admin accounts (e.g., `isAdmin: false` in `where`)
- [ ] Tests added or updated in `app/actions/__tests__/` for changed actions

---

## 2. Minimal — flag over-engineering

- New helper/abstraction with only one call site → suggest inlining
- Error handling added for paths that cannot happen (Prisma throws, NextAuth guards redirect)
- Backwards-compat shims, `_unused` variables, or dead code
- Feature flags or conditional exports where the code can simply be changed

---

## 3. DRY — flag reimplemented utilities

| If the code does this... | It should use this instead |
|---|---|
| Plan limit check inline | `getUserUsage()` + `PLAN_FEATURES` from `@/lib/plans` |
| `prisma.emailLog.count(...)` | `getUserUsage()` from `@/lib/usage` |
| Currency formatting manually | `formatCurrency()` from `@/lib/formatCurrency` |
| Date formatting manually | `formatDate()` from `@/lib/formatDate` |
| `className={a + " " + b}` | `cn()` from `@/lib/utils` |
| New Zod schema duplicating existing pattern | Extend existing schema in `lib/schemas/` |
| `sendEmail()` for invoice email | `dispatchInvoiceEmail()` from `@/lib/email/invoice` |

---

## 4. SOLID — flag violations

- **S (Single Responsibility)**: A Server Action doing DB write + email + notification + revalidation all flat — the email/notification layer belongs in `dispatchInvoiceEmail()`.
- **O (Open/Closed)**: `if (plan === "PRO")` hardcoded in a utility — extend `PLAN_FEATURES` in `lib/plans.ts` instead.
- **L (Liskov)**: Component accepting a fat object prop and only using 2 fields — prefer explicit props.
- **I (Interface Segregation)**: A Context bundling unrelated state (form state + modal toggle) — split if consumed independently.
- **D (Dependency Inversion)**: A UI component directly importing `prisma` — data fetching belongs in Server Components or actions.

---

## 5. Production readiness

- N+1 risk: any loop calling `getUserUsage()` or a Prisma query per iteration — batch with `Promise.all`
- Missing `@@index` on Prisma fields used in `where` filters
- Expensive Server Component reads missing `unstable_cache`
- Email failure swallowed silently (`.catch(() => {})` without creating a `Notification` record)
- Admin mutations missing `revalidatePath()` on affected routes
- `findUnique` where `findUniqueOrThrow` is safer (record must exist)

---

## Review output format

```
## Correctness
- [blocker] `createClient` action is missing `userId` in the `where` clause on line 42 — potential cross-user data access.

## Minimal
- [nit] `formatInvoiceNumber()` helper is only called once — inline it.

## DRY
- [blocker] Manual email limit check on line 78 — use `isEmailLimitOk(usage)` from `@/lib/usage`.

## SOLID
- [nit] `if (usage.plan === "PRO")` in `lib/email/invoice.ts` — extend `PLAN_FEATURES.attachPdf` instead.

## Production readiness
- [blocker] `getUserUsage()` called inside a loop over recurring invoices — batch by userId first (see `processRecurringInvoices` pattern).
```
