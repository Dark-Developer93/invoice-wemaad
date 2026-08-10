---
name: add-zod-schema
description: Add Zod schemas in lib/schemas and re-export from zodSchemas.ts. Use when validating forms or adding fields to existing schemas.
---


## Location & re-export
- File: `lib/schemas/<domain>.ts`
- Always add re-export to `lib/zodSchemas.ts`:
  ```ts
  export { mySchema } from "@/lib/schemas/myDomain";
  ```

## Basic schema template
```ts
import { z } from "zod";

export const mySchema = z.object({
  name: z.string().min(1, "Required").max(200),
  email: z.string().email("Invalid email").max(254),
  amount: z.number().min(0.01, "Must be positive"),
  status: z.enum(["ACTIVE", "ARCHIVED"]).default("ACTIVE"),
  note: z.string().max(1000).optional(),
});
```

## Common patterns in this codebase

**Optional URL or email (allow empty string)**
```ts
website: z.union([z.literal(""), z.string().url("Invalid URL")]).optional().nullable(),
```

**Arrays sent via FormData** (client JSON.stringifies, schema parses)
```ts
items: z.preprocess(
  (val) => { try { return JSON.parse(val as string); } catch { return []; } },
  z.array(itemSchema).min(1, "At least one item required")
),
```

**Cross-field validation**
```ts
export const mySchema = z.object({ startDate: z.string(), endDate: z.string().optional() })
  .refine(
    (d) => !d.endDate || new Date(d.endDate) > new Date(d.startDate),
    { message: "End date must be after start date", path: ["endDate"] }
  );
```

**Extending an existing schema**
```ts
import { invoiceSchema } from "@/lib/schemas/invoice";
export const extendedSchema = invoiceSchema.extend({ poNumber: z.string().max(50).optional() });
```

## Parsing in server actions

With `@conform-to/zod` (standard for form actions):
```ts
const submission = parseWithZod(formData, { schema: mySchema });
if (submission.status !== "success") return submission.reply();
const data = submission.value; // fully typed
```

With `safeParse` (profile/settings-style actions that use `Object.fromEntries`):
```ts
const parsed = mySchema.safeParse(Object.fromEntries(formData));
if (!parsed.success) return { status: "error", error: parsed.error.flatten().fieldErrors };
```

## Existing schemas reference
| Schema | File | Key patterns |
|---|---|---|
| `invoiceSchema` | `lib/schemas/invoice.ts` | currencies: `["USD","EUR","EGP"]`, Decimal fields |
| `clientFormSchema` | `lib/schemas/client.ts` | nested addresses/contactPersons/customFields arrays via preprocess |
| `recurringInvoiceSchema` | `lib/schemas/recurringInvoice.ts` | endDate > startDate refine |
| `onboardingSchema` | `lib/schemas/onboarding.ts` | SWIFT/IBAN regex patterns |
