# Skill: plan-task

Use this skill before starting **any** work — feature, fix, refactor, or DB change.
Pass a task description and this skill classifies it, loads the right reference skills, and produces a ready-to-execute plan.

---

## Step 1 — Classify the task

Read the description and assign one or more types:

| Type | Signals |
|---|---|
| `new-feature` | "add", "implement", "build", "create new" |
| `db-change` | "new model", "new field", "migration", "schema" |
| `ui-change` | "component", "page", "form", "dialog", "table" |
| `bug-fix` | "broken", "error", "not working", "fix", "wrong" |
| `refactor` | "clean up", "simplify", "reorganize", "rename" |
| `email` | "send email", "template", "notification", "reminder" |
| `auth` | "login", "session", "permission", "role" |
| `plan-billing` | "plan", "limit", "upgrade", "feature gate" |
| `pr-review` | "review PR", "review diff", "check this PR" |

---

## Step 2 — Load reference skills

Read the skills listed for the matched types:

| Type | Skills to read |
|---|---|
| `new-feature` | `add-server-action`, `add-component`, `add-dashboard-page` |
| `db-change` | `add-prisma-model`, `add-zod-schema`, `add-server-action` |
| `ui-change` | `add-component`, `add-dashboard-page` |
| `bug-fix` | `query-db`, `debug-auth`, `plan-limits` (pick by domain) |
| `refactor` | `code-style`, `best-practices` |
| `email` | `send-email`, `plan-limits` |
| `auth` | `debug-auth`, `best-practices` |
| `plan-billing` | `plan-limits`, `add-server-action` |
| `pr-review` | `pr-review`, `code-style`, `best-practices` |
| **always** | `best-practices` |

---

## Step 3 — Ask clarifying questions (if needed)

Before producing the plan, ask if any of these are unclear:
- What domain/entity does this touch? (invoice, client, recurring, user, admin)
- Does this need to be plan-gated? If so, which plan tier?
- Is this user-facing, admin-facing, or both?
- Are there existing components/actions nearby that should be reused or extended?

---

## Step 4 — Produce the implementation plan

Output a plan with these sections:

### What & Why
One paragraph: what changes, why, and the intended outcome.

### Files to modify / create
Explicit paths. For new files, show the target path. For modifications, name the function/section to change.

### Steps (ordered)
Numbered steps. After each step, note: "Reuses `X` from `@/lib/Y`" when an existing utility applies.
Flag if a step can be skipped if condition doesn't apply.

### DRY check
List existing utilities this plan should use instead of reimplementing:
- Plan limits → `getUserUsage()` + `PLAN_FEATURES` from `@/lib/plans`
- Email → `dispatchInvoiceEmail()` + `isEmailLimitOk()`
- Formatting → `formatCurrency()`, `formatDate()` from `@/lib/`
- Class names → `cn()` from `@/lib/utils`
- Schemas → check `lib/schemas/` before writing a new one

### SOLID check
Flag any risk of:
- **S** violation: action doing too many things (write + email + notify + revalidate inline)
- **O** violation: hardcoded `plan === "PRO"` checks instead of extending `PLAN_FEATURES`
- **D** violation: component importing `prisma` directly

### Plan-limit / auth impact
- Does a new action need a usage limit check? Which one?
- Does a new page/action need `requireUser()` / `requireAdmin()`?
- Does a new feature need an entry in `PLAN_FEATURES`?

### Test plan
Which file in `app/actions/__tests__/` to update. What to mock. Key assertions.

### Definition of done
Bullet list. Example:
- [ ] Action returns `{ status: "success" }` on happy path
- [ ] Plan limit blocks creation when exceeded
- [ ] Toast shows on success and error
- [ ] `router.refresh()` reloads the list
- [ ] Vitest test passes

---

## Step 5 — Switch to Plan/Composer mode

After presenting the plan, tell the user:
> "Review the plan above. When ready, open Cursor Agent (Cmd+I → Agent mode) and paste the plan as context to start implementation."
