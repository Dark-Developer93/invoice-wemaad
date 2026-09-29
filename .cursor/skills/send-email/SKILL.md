---
name: send-email
description: Send invoice and transactional email via dispatchInvoiceEmail or sendEmail with limit checks. Use for email templates, reminders, or notifications.
---


## Two layers — use the higher one when possible

### Layer 1: `dispatchInvoiceEmail()` — recommended for invoice emails
`@/lib/email/invoice`
```ts
import { dispatchInvoiceEmail } from "@/lib/email/invoice";

await dispatchInvoiceEmail({
  userId,
  clientName,
  contactEmail,       // primary ContactPerson email
  templateName,       // "newInvoice" | "updatedInvoice" | "reminderInvoice"
  invoiceNumber,      // number
  invoiceDueDate,     // Date | string
  total,              // number
  currency,           // "USD" | "EUR" | "EGP"
  invoiceId,
  notificationHref,   // optional, defaults to "/dashboard/invoices"
});
```
Handles: sends email + logs to `EmailLog` + creates in-app `Notification` on failure.

### Layer 2: `sendEmail()` — low-level transport
`@/lib/email/index`
```ts
import { sendEmail } from "@/lib/email/index";
await sendEmail({
  to: "recipient@example.com",
  templateName: "newInvoice",
  variables: { clientName, invoiceNumber, invoiceDueDate, invoiceAmount, invoiceLink },
});
```
Use only for non-invoice emails (e.g., welcome, contact form). Does not log or create notifications.

---

## Always check email limit before sending
```ts
import { getUserUsage, isEmailLimitOk } from "@/lib/usage";
const usage = await getUserUsage(userId);
if (!isEmailLimitOk(usage)) {
  // skip or return error
}
```

## Fire-and-forget vs. awaited
- **In form actions** (createInvoice, editInvoice): fire-and-forget — email failure must not fail the submission.
  ```ts
  dispatchInvoiceEmail({ ... }).catch(() => {});
  ```
- **In explicit reminder actions** (user pressed "Send Reminder"): `await` — user expects confirmation.

## Finding the primary contact
```ts
const client = await prisma.client.findUnique({
  where: { id: clientId, userId },
  include: { contactPersons: { where: { isPrimary: true }, take: 1 } },
});
const contactEmail = client?.contactPersons[0]?.email;
if (!contactEmail) return; // no primary contact — skip email
```

## Invoice URL for email links
```ts
import { getInvoiceUrl } from "@/lib/urls";
const link = getInvoiceUrl(invoiceId); // includes HMAC token for public access
```

## Adding a new email template
1. Create `lib/email/templates/MyTemplate.tsx` — React Email component with typed props.
2. Add template name to the union type in `SendEmailProps` in `lib/email/index.ts`.
3. Add subject to `EMAIL_SUBJECTS` map in `lib/email/index.ts`.
4. Register the component in the template map in `lib/email/index.ts`.
5. Test with Mailtrap locally (`MAILTRAP_TOKEN` env var).
