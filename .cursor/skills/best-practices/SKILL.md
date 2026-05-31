---
name: best-practices
description: Architecture rules: Server Actions vs REST, plan limits, email best-effort, admin isolation. Use when designing features or reviewing approaches.
---


Architecture decisions for this codebase. Consult when designing a new feature or reviewing a proposed approach.

## Mutations — Server Actions only
Never add REST endpoints for CRUD operations.
REST is reserved for: PDF streaming (`/api/invoice/[id]`), chart data, CSV export, Vercel Cron.
If someone proposes a new REST route for a mutation — use a Server Action instead.

## Forms — RHF-first; progressive enhancement where it fits
Dashboard invoice/client flows use **React Hook Form** + `toFormData` → Server Action. They require JavaScript; do not add a parallel native `action=` form unless the task explicitly asks for it.
For **public/marketing** forms (e.g. contact), prefer native `action=` + Server Action so submission works without JS. New dashboard forms: follow `add-component` (RHF + toast + `router.refresh()`).

## State management — no new libraries
No Redux, Zustand, Jotai, or similar.
- UI state: `useState` in the component that owns it
- Cross-tab form state: Context (see `InvoiceFormContext`, `ClientFormContext` as the pattern)
- Server state: `router.refresh()` after mutations + Suspense on load

## Plan limits — always additive, never inline
When adding a plan-gated feature:
1. Add a boolean to `PLAN_FEATURES` in `lib/plans.ts` for all four tiers.
2. Check with `PLAN_FEATURES[usage.plan].myFeature`.
Never write `if (usage.plan === "PRO")` directly in action or component code.

## Email is best-effort
Email failure must never fail a user action.
Pattern: fire-and-forget with `.catch(() => {})`. On failure, `dispatchInvoiceEmail` creates an in-app `Notification` automatically.

## No direct EmailLog queries
All email counting and limiting goes through `@/lib/usage`:
- `getUserUsage()` — fetches plan + invoice count + email count
- `isEmailLimitOk(usage)` — checks against limit
- `logEmailSent()` — appends to EmailLog

## Cascade deletes — required on all user-scoped models
Every model with a `userId` must have `onDelete: Cascade` on the User relation.
Account deletion must clean up all user data automatically via the DB.

## Prisma singleton
One client per Node.js process via the `globalForPrisma` pattern in `lib/db.ts`.
Never instantiate inside a request handler or Server Action.

## Admin isolation
Admin pages and actions live under `app/admin/`. They must use `requireAdmin()`.
Admin components live in `components/` but are never reused in the user dashboard.
Never share a component that does both user-facing and admin-facing logic.

## Async failure → in-app Notification
When a background operation fails (cron email, webhook), create a `Notification` record.
Do NOT silently swallow errors. Do NOT block user flows.
Pattern: `dispatchInvoiceEmail` already does this. Follow the same pattern for new async operations.

## No over-engineering
A feature request does not need a plugin system, a config table, or a generic abstraction.
Three similar actions are better than a premature helper.
Build what the task requires. Stop there.
