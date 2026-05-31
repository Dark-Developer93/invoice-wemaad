# Skill: add-server-action

## Location
`app/actions/<domain>.ts` — group by domain (invoices, clients, billing, admin, recurringInvoices).

## Standard imports
```ts
"use server";
import { parseWithZod } from "@conform-to/zod";
import { SubmissionResult } from "@conform-to/react";
import { getRequiredUserId } from "@/lib/session";
import { mySchema } from "@/lib/zodSchemas";
import prisma from "@/lib/db";
```

## Action body checklist

1. **Auth guard — first line**
   - User action: `const userId = await getRequiredUserId();`
   - Full session needed: `const session = await requireUser();` → `session.user.id`
   - Admin only: `await requireAdmin();`

2. **Usage limit check** (if creating invoices or sending emails)
   ```ts
   const usage = await getUserUsage(userId);
   if (usage.invoiceLimit !== null && usage.invoicesThisMonth >= usage.invoiceLimit) {
     return { status: "error", error: { "": ["Monthly invoice limit reached"] } };
   }
   ```

3. **Parse form data**
   ```ts
   const submission = parseWithZod(formData, { schema: mySchema });
   if (submission.status !== "success") return submission.reply();
   ```

4. **DB operation** — always include `userId` in `where` clauses.
   Multi-step: `prisma.$transaction(async (tx) => { ... })`

5. **Return**
   - Success: `return { status: "success", error: {} };`
   - Redirect: `return redirect("/dashboard/path");`
   - Error: `return { status: "error", error: { "": ["Message"] } };`

6. **Email** (if needed — fire-and-forget)
   ```ts
   dispatchInvoiceEmail({ userId, ... }).catch(() => {});
   ```

7. **Admin mutations only**: call `revalidatePath("/admin/path")` after DB write.

## Calling from a client component
```ts
const fd = toFormData(data as Record<string, unknown>);
const result = await myAction(null, fd);
if (result.status === "error") {
  toast.error(Object.values(result.error ?? {}).flat()[0] ?? "Something went wrong");
  return;
}
toast.success("Saved");
router.refresh();
```

## Test file
Add to `app/actions/__tests__/<domain>.test.ts`. Standard mocks:
```ts
vi.mock("@/lib/session", () => ({ getRequiredUserId: vi.fn(), requireUser: vi.fn() }));
vi.mock("@/lib/db", () => ({ default: { model: { create: vi.fn() } } }));
vi.mock("@/lib/usage", () => ({ getUserUsage: vi.fn(), isEmailLimitOk: vi.fn() }));
```
See `invoices.test.ts` for the canonical setup pattern.
