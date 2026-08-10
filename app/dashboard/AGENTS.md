# /app/dashboard

- All pages are Server Components. Use `requireUser()` for auth — redirects to /login automatically.
- Wrap data-fetching in `<Suspense fallback={<Skeleton />}>`. Provide a sibling `loading.tsx`.
- Always export `metadata` with format: `title: "Page Title | WeMaAd Invoice"`.
- Plan-gated pages: check `PLAN_FEATURES[usage.plan]` early and return `<UpgradePrompt>`.
- Use `auth()` (not `requireUser()`) only in `/app/api/` route handlers — never in dashboard pages.
- Call `requireUser()` once at the top of `page.tsx`; thread `userId` as a prop to child async components.
- Dashboard layout (`layout.tsx`) handles: onboarding redirect, sidebar, `UserProvider`. Do not duplicate these.
