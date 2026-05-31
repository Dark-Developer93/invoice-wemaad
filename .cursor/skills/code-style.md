# Skill: code-style

Project-specific style rules. Apply when writing new code or reviewing.

## Imports
- Always `@/*` absolute paths — no relative imports like `../../../lib/`
- Order: React / Next.js → third-party packages → local `@/*` imports
- No new barrel `index.ts` files unless the folder already has one

## TypeScript
- Explicit typed interface or inline type for component props — never `any`
- Prefer `type` over `interface` for props (matches existing codebase)
- `z.infer<typeof schema>` for form value types — don't duplicate type definitions

## Classnames
- `cn()` from `@/lib/utils` for all className composition — no string concatenation
- No inline `style={{}}` — Tailwind only
- Dark mode: `dark:` class prefix, not `@media (prefers-color-scheme)`
- Responsive: mobile-first — base styles first, then `sm:` / `md:` modifiers

## Server Actions return type
Actions return either:
- `SubmissionResult<string[]>` — for form actions paired with Conform / React Hook Form
- `redirect(path)` — for destructive actions (delete, mark paid) with no form

Never return a custom shape. Never `throw` from an action.

## Error toast pattern
```ts
toast.error(Object.values(result.error ?? {}).flat()[0] ?? "Something went wrong");
```
Always use this exact pattern — don't access `result.error[""]` directly.

## Email in actions — always fire-and-forget
```ts
dispatchInvoiceEmail({ ... }).catch(() => {});
```
Only `await` for explicit user-triggered reminder sends (the UI shows a loading state and expects a result).

## No console.log
Remove all `console.log` before committing. The slow-query logger in `@/lib/db` and server-side `console.error` in email dispatch are the only intentional log points.

## Server Components — keep lean
- Fetch data, then pass typed props to client components
- No business logic in `page.tsx` — extract to named async functions in the same file
- One `requireUser()` call at the top; thread `userId` as a prop to child async components

## Comments
Write a comment only when the WHY is non-obvious. Never comment what the code does — the code already says that.
