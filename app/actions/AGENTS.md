# /app/actions

- Every file: `"use server"` directive at the top.
- Every action body: auth guard as the **first line** — `getRequiredUserId()`, `requireUser()`, or `requireAdmin()`.

### Exception — `generate-invoice.tsx`
- Not a form action; uses `auth()` from `@/lib/auth` (not session redirect helpers).
- Default (`skipAuthCheck: false`): scope invoice with `session.user.id`.
- Public PDF API: `skipAuthCheck: true` only after route-level token/HMAC verification — never call with `true` from dashboard code.
- Form actions: signature is `(prev: SubmissionResult<string[]> | null | undefined, formData: FormData)`. Parse with `parseWithZod(formData, { schema })` from `@conform-to/zod`.
- All DB queries include `userId` in `where`. Multi-step mutations use `prisma.$transaction`.
- Invoice/email creation: check `getUserUsage()` limits before acting.
- Email: `dispatchInvoiceEmail()` from `@/lib/email/invoice` — fire-and-forget (`.catch(() => {})`).
- Admin actions: call `revalidatePath()` on affected routes after mutations.
- Tests: `__tests__/<domain>.test.ts`. Mock `@/lib/session`, `@/lib/db`, `@/lib/usage`, `next/navigation`.
