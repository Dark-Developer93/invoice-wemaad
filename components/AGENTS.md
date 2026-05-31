# /components

- Folder names: kebab-case. Component files: PascalCase.tsx.
- `components/ui/` — shadcn base components only. No feature logic here.
- Interactive components need `"use client"`. Server components: no directive.
- Form pattern: `useForm` + `zodResolver` → `toFormData()` → Server Action → `toast` + `router.refresh()`.
- User profile data (name, company, email): `useUser()` from `@/components/providers/UserProvider` (dashboard only).
- Complex multi-tab forms: create a `*Context.tsx` file to share the form instance across sub-components.
- Class names: always `cn()` from `@/lib/utils` — no string concatenation.
- Reuse `SubmitButton`, `UpgradePrompt`, `EmptyState` before creating similar components.
