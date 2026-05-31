---
name: pr-review
description: PR review checklist for correctness, DRY, SOLID, and production readiness. Use when reviewing pull requests or diffs.
---


Before reviewing, read these skills to load their rules — apply them during the review:
- `@code-style` — import order, classNames, return types, error toast, comment policy
- `@best-practices` — architecture decisions (actions vs REST, plan limits, email, state management)
- `@query-db` — Prisma patterns, N+1 risk, transaction usage, index requirements
- `@send-email` — email layers, limit checks, fire-and-forget contract
- `@plan-limits` — plan tier rules, `getUserUsage`, `PLAN_FEATURES` usage

Then run through the five sections below.

---

## 1. Correctness — project-specific checklist

- [ ] Every action: auth guard as first line (`getRequiredUserId` / `requireUser` / `requireAdmin`)
- [ ] All DB queries include `userId` in `where` — no cross-user data access
- [ ] New invoice/email creation checks plan limits via `getUserUsage()` first
- [ ] Email uses `dispatchInvoiceEmail()`, not raw `sendEmail()`, with `isEmailLimitOk()` check
- [ ] New schemas re-exported from `lib/zodSchemas.ts`
- [ ] Action files: `"use server"` · interactive components: `"use client"`
- [ ] No `process.env.*` outside `@/lib/env.ts`
- [ ] No `new PrismaClient()` — only `import prisma from "@/lib/db"`
- [ ] Arrays through FormData: `JSON.stringify` client-side + `z.preprocess(JSON.parse, ...)` in schema
- [ ] Schema changes include a new migration in `prisma/migrations/`
- [ ] Destructive admin ops guard against affecting admin accounts (`isAdmin: false` in `where`)
- [ ] Tests added/updated in `app/actions/__tests__/` for changed actions

---

## 2. Minimal
Apply rules from `@best-practices` ("No over-engineering" section) + flag:
- New helper with only one call site → suggest inlining
- Error handling for impossible paths
- Dead code, unused imports, `_` prefixed variables used to silence TS

---

## 3. DRY
Apply DRY rules from `@code-style` and `@best-practices` — flag any violations found in the diff.
Focus areas: plan limits inline vs `getUserUsage()`, manual formatting vs `formatCurrency`/`formatDate`, raw `EmailLog` queries vs `@/lib/usage`.

---

## 4. SOLID
Apply architecture rules from `@best-practices` — flag violations found in the diff.
Focus areas: S (action doing too much inline), O (hardcoded plan checks instead of `PLAN_FEATURES`), D (component importing `prisma`).

---

## 5. Production readiness
Apply query rules from `@query-db` and email rules from `@send-email` — flag:
- N+1 risk in loops
- Missing `@@index` on new Prisma fields used in `where`
- Expensive reads missing `unstable_cache`
- Email failure swallowed without `Notification` record
- Admin mutations missing `revalidatePath()`

---

## Output format

```
## Correctness
- [blocker] `createX` action missing `userId` in where clause — cross-user data risk.

## Minimal
- [nit] `formatLabel()` helper called once — inline it.

## DRY
- [blocker] Manual email limit check on line 34 — use `isEmailLimitOk(usage)` from @/lib/usage.

## SOLID
- [nit] `if (plan === "PRO")` in action — extend `PLAN_FEATURES` in lib/plans.ts instead.

## Production readiness
- [blocker] `getUserUsage()` called inside a loop — batch by userId first.
```
