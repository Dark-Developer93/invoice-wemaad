---
name: pr-review
description: >-
  PR review checklist for correctness, DRY, SOLID, and production readiness. Use for diffs or after
  @pr-fetch-review checkout. Prefer pr-reviewer agent + pr-fetch-review when the user gives a GitHub PR URL or number.
---

## GitHub PR (URL or number)

If the user gave a **PR link or number**, **first** follow `@pr-fetch-review` (checkout, diff, selective AGENTS/skills), **then** run sections 1–5 below.

For **local-only** diffs (no GitHub PR), skip fetch. Load skills from changed paths only (max **4** skills, max **3** path `AGENTS.md`). Do not re-read `.cursor/rules/*.mdc` (always-on).

---

## Context loading (local diff or after fetch)

Read only what applies — do not load every skill below:

| Skill | Read when diff touches |
| --- | --- |
| `code-style` | TS/TSX style, imports, toasts |
| `best-practices` | Architecture, scope, new surfaces |
| `query-db` | Prisma queries, transactions, N+1 |
| `send-email` | Email send/templates/reminders |
| `plan-limits` | Plans, limits, upgrades, usage |

Path `AGENTS.md` files: pick from diff paths (see `pr-fetch-review` routing table), max 3.

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
