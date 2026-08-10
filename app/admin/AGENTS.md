# /app/admin

- `layout.tsx` calls `requireAdmin()` — all child pages inherit this guard.
- Mutations live in `app/actions/admin.ts` (and related billing actions). First line: `await requireAdmin()` or equivalent session check.
- After admin mutations: call `revalidatePath()` on affected `/admin` routes.
- Do not reuse user-dashboard feature components for admin-only UI; admin-specific pieces live under `app/admin/` or dedicated admin components in `components/`.
- Destructive ops: guard with `isAdmin: false` in `where` so admin accounts cannot be deleted or deactivated by mistake.
- No plan/usage gates here — admins operate outside `getUserUsage()` limits.
- Metadata: `title: "... | WeMaAd Invoice Admin"` or match existing admin pages.
