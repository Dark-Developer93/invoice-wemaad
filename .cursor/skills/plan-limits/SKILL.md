---
name: plan-limits
description: Plan tiers, invoice/email limits, PLAN_FEATURES gates, and upgrade flow. Use when gating features, checking usage, or billing-related work.
---


## Plan tiers
Defined in `@/lib/plans` — source of truth for all limit and feature logic. Never hardcode checks inline.

| Plan | Price | Invoices/mo | Emails/mo | Recurring | Analytics | Branding | API |
|---|---|---|---|---|---|---|---|
| FREE | $0 | 5 | 20 | no | no | no | no |
| STARTER | $9 | 25 | 50 | yes | yes | no | no |
| PRO | $29 | 100 | 500 | yes | yes | yes | yes |
| BUSINESS | custom | unlimited | unlimited | yes | yes | yes | yes |

`null` in `PLAN_LIMITS` = unlimited. `PLAN_ORDER = ["FREE", "STARTER", "PRO", "BUSINESS"]`.

## Checking limits in a Server Action
```ts
import { getUserUsage, isEmailLimitOk } from "@/lib/usage";
import { PLAN_FEATURES } from "@/lib/plans";

const usage = await getUserUsage(userId);
// { plan, invoicesThisMonth, emailsThisMonth, invoiceLimit, emailLimit }

// Invoice limit
if (usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit) {
  return { status: "error", error: { "": [`Limit of ${usage.invoiceLimit} invoices/month reached`] } };
}

// Email limit
if (!isEmailLimitOk(usage)) { /* skip email or return error */ }

// Feature gate
if (!PLAN_FEATURES[usage.plan].recurringInvoices) {
  return { status: "error", error: { "": ["Requires Starter plan or above"] } };
}
```

## Gating UI in a Server Component
```tsx
import { UpgradePrompt } from "@/components/upgrade-prompt/UpgradePrompt";
const usage = await getUserUsage(session.user.id!);
if (!PLAN_FEATURES[usage.plan].analytics) {
  return <UpgradePrompt title="Analytics" message="Available on Starter plan and above." />;
}
```

## Adding a new plan-gated feature
1. Add boolean to `PLAN_FEATURES` object in `lib/plans.ts` for all four plan tiers.
2. Check with `PLAN_FEATURES[usage.plan].myFeature` — no plan-specific `if` branches elsewhere.

## Logging email sends
`dispatchInvoiceEmail()` calls `logEmailSent()` internally — do NOT call it again.
For non-invoice emails only:
```ts
import { logEmailSent } from "@/lib/usage";
await logEmailSent(userId, "myEmailType", optionalInvoiceId);
```

## How `getUserUsage()` works
Runs three queries in `Promise.all`: user plan, invoice count this month, email log count this month.
Uses `startOfMonth` / `endOfMonth` from `date-fns`. Cheap — one round trip.

## Upgrade flow
1. User submits upgrade request → `requestPlanUpgrade(plan)` in `app/actions/billing.ts`.
2. Previous pending requests are auto-rejected.
3. Admin reviews at `/admin/users/[userId]`.
4. Approval: `adminApproveUpgradeRequest()` updates `User.plan` + creates in-app `Notification`.
5. No payment processor — fully admin-managed.

## Batch usage (cron job pattern)
See `processRecurringInvoices()` in `app/actions/recurringInvoices.ts`:
- Fetch unique userIds from due recurring invoices.
- `Promise.all` one `getUserUsage()` per user → store in a map.
- Mutate `usage.invoicesThisMonth++` locally as invoices are created (avoids re-querying in the loop).
