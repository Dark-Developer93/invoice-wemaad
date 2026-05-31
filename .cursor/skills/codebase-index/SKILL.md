---
name: codebase-index
description: Project map of server actions, lib modules, API routes, components, and DB models. Use at the start of new work or when orienting in the repo.
---


Reference this at the start of any new chat to restore full project context instantly.
`@codebase-index` — no discovery calls needed after loading this.

---

## Server Actions (`app/actions/`)
```
invoices.ts          createInvoice · editInvoice · deleteInvoice · markAsPaid · sendReminderEmail
clients.ts           createClient · editClient · deleteClient
recurringInvoices.ts createRecurringInvoice · toggleRecurringInvoice · deleteRecurringInvoice · processRecurringInvoices
billing.ts           requestPlanUpgrade · getUserPendingUpgradeRequest
admin.ts             adminGetAllUsers · adminGetUser · adminUpdateUserPlan · adminToggleUserActive
                     adminToggleUserAdmin · adminGetPendingUpgradeRequests · adminGetUserUpgradeRequests
                     adminApproveUpgradeRequest · adminRejectUpgradeRequest · adminDeleteUser
profile.ts           updateProfile
onboarding.ts        onboardUser
notifications.ts     getUserNotifications · markAllNotificationsRead
contact.ts           submitContactForm
generate-invoice.tsx generateInvoicePDF(invoiceId, skipAuthCheck?)  [PDF ArrayBuffer — see auth exception below]
```

**Auth exception — `generate-invoice.tsx`:** Not a typical form action. Uses `auth()` from `@/lib/auth` (not `getRequiredUserId()` / `requireUser()`). When `skipAuthCheck` is `true`, loads the invoice by `id` only (no `userId` in `where`) — used by the public PDF API after HMAC/token verification. Dashboard download passes `skipAuthCheck: false` so the invoice is scoped to `session.user.id`.

## Lib (`lib/`)
```
db.ts              default: prisma (singleton PrismaClient)
session.ts         requireUser() · requireAdmin() · getRequiredUserId()
auth.ts            auth() · handlers · signIn · signOut
plans.ts           PLAN_LIMITS · PLAN_FEATURES · PLAN_PRICE · PLAN_ORDER  [PlanType enum]
usage.ts           getUserUsage(userId) · isEmailLimitOk(usage) · logEmailSent(userId, type, invoiceId?)
utils.ts           cn()
toFormData.ts      toFormData(data): FormData   [arrays → JSON.stringify]
formatCurrency.ts  formatCurrency(amount, currency)
formatDate.ts      formatDate(date)
urls.ts            getInvoiceUrl(invoiceId) · verifyInvoiceToken(token)
env.ts             env  [validated proxy — use instead of process.env]
zodSchemas.ts      re-exports: invoiceSchema · clientFormSchema · recurringInvoiceSchema · onboardingSchema
email/invoice.ts   dispatchInvoiceEmail(opts)  [sends + logs + notifies on failure]
email/index.ts     sendEmail(opts)  [low-level transport]
```

## Zod Schemas (`lib/schemas/`)
```
invoice.ts         invoiceSchema
client.ts          clientFormSchema  [nested addresses, contactPersons, customFields arrays]
recurringInvoice.ts recurringInvoiceSchema
onboarding.ts      onboardingSchema  [SWIFT/IBAN regex patterns]
```

## Key Components
```
components/providers/UserProvider.tsx       UserProvider · useUser()
components/dashboard-links/DashboardLinks.tsx  sidebar nav array — add new pages here
components/submit-button/SubmitButton.tsx   SubmitButton({ text, isLoading, form? })
components/upgrade-prompt/UpgradePrompt.tsx plan gate UI
components/empty-state/EmptyState.tsx       empty list state
components/invoice-form/InvoiceForm.tsx     main invoice create/edit form
components/client-form/clientForm.tsx       client form with nested arrays (camelCase — existing exception to PascalCase)
components/client-form/clientDialog.tsx     client create/edit dialog
```

## API Routes (`app/api/`)
```
GET/POST /api/auth/[...nextauth]     NextAuth session handlers
GET  /api/invoice/[invoiceId]        PDF stream  (HMAC-verified, public)
GET  /api/dashboard/chart-data       revenue chart data  (session auth)
GET  /api/reports/export             CSV export  (session auth)
POST /api/cron/recurring-invoices    run processRecurringInvoices  (Bearer token)
```

## DB Models (`prisma/schema.prisma`)
```
User · Invoice · Client · Address · ContactPerson · ClientCustomField
RecurringInvoice · EmailLog · PlanUpgradeRequest · Notification
Account · Session · VerificationToken · Authenticator
```

## Enums
```
PlanType:              FREE | STARTER | PRO | BUSINESS
InvoiceStatus:         PAID | PENDING
AddressType:           BILLING | SHIPPING | OTHER
RecurrenceInterval:    MONTHLY | QUARTERLY | YEARLY
UpgradeRequestStatus:  PENDING | APPROVED | REJECTED
```
