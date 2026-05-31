---
name: debug-auth
description: Troubleshoot NextAuth magic-link sessions, requireUser redirects, and API auth. Use for login issues, session shape, or permission bugs.
---


## Auth setup summary
- Provider: NextAuth v5 · Nodemailer email magic-link
- Strategy: database sessions (not JWT) — 30-day max age, 24-hour update interval
- Session augmented: `session.user.id`, `session.user.isAdmin`, `session.user.isActive` (fetched fresh from DB each time)
- Config: `lib/auth.ts` · Adapter tables: User, Account, Session, VerificationToken, Authenticator

## Session object shape
```ts
session.user.id        // string (cuid)
session.user.isAdmin   // boolean
session.user.isActive  // boolean — false = deactivated
session.user.email     // string
session.user.name      // string | null
session.user.image     // string | null
```

## Common issues

**Redirect loop on /login**
- `User.isActive = false` — admin deactivated the account. Check DB.
- Missing `AUTH_SECRET` env var.

**`session.user.id` is undefined**
- Check `callbacks.session` in `lib/auth.ts` — it explicitly sets `session.user.id = user.id`.

**Magic link email not sent**
- Check `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`.
- `emailTransporter.verify()` runs on startup — check server logs for "Email transport ready".
- VerificationToken expires after 24h — user must re-request.

**`requireUser()` redirects despite being logged in**
- `isActive = false` → redirect to `/login?error=AccountDeactivated`.
- Onboarding incomplete → `dashboard/layout.tsx` redirects to `/onboarding` if `firstName`, `lastName`, or `address` is null.

**`requireAdmin()` redirects to /dashboard**
- `session.user.isAdmin = false`. Set `User.isAdmin = true` in DB or via admin panel.

**Session not persisting**
- Database sessions persist across restarts. If sessions vanish, check DB connectivity and `Session.expires`.

## `auth()` vs `requireUser()`
```ts
// Server Components + Actions — redirects on failure
import { requireUser, requireAdmin, getRequiredUserId } from "@/lib/session";

// API route handlers — returns null session, no redirect
import { auth } from "@/lib/auth";
const session = await auth();
if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
```
Never call `requireUser()` inside an API route handler — it calls `redirect()` which throws in that context.

## Local dev SMTP
Required env vars: `EMAIL_SERVER_HOST`, `EMAIL_SERVER_PORT`, `EMAIL_SERVER_USER`, `EMAIL_SERVER_PASSWORD`, `EMAIL_FROM`.
Use Mailtrap (set `MAILTRAP_TOKEN`) or Mailpit (local SMTP on port 1025) for testing.
