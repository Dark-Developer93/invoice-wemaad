---
name: plan-task
description: >-
  Classifies the task, **selects and Reads only relevant** path-scoped AGENTS.md + skills (token-conscious),
  then **SwitchMode to `plan`** and writes the plan in Plan UI. **SwitchMode to `plan` is required**; fallback is chat.
  Use before features, fixes, refactors, or DB changes — not for implementing code in Agent mode.
---

# Plan task → Plan mode

Use this skill before starting **any** work — feature, fix, refactor, or DB change.
The user supplies a task description; you **classify**, **select minimal context**, then **switch to Plan mode** and author the full plan (Step 4).

## Always-on behavior (do not skip)

- After **Step 1–2** (and **Step 3** only when genuinely ambiguous), **must** call **SwitchMode** to **Plan** (`target_mode_id`: `plan`) and write the full plan in Plan UI.
- **Do not** read every skill or every `AGENTS.md` “to be safe.” **Must Read** only the path-scoped `AGENTS.md` files selected in Step 2c (they are short; cheaper than loading wrong skills).
- **Do not** re-read `.cursor/rules/*.mdc` — they are already injected (`alwaysApply: true`).
- **Never** Read repo-root `AGENTS.md` (index only — pointers, not task rules).
- **Do not** dump the full plan only in chat or ask the user to paste into Agent.
- **Do not** block on “confirm direction.” **Do not** edit application source during planning.
- **Fallback** — If SwitchMode fails or is declined, same plan in main chat + Step 5 verification.

---

## Step 1 — Classify the task

Assign **one primary** type and **zero or more secondary** types (max 3 types total).

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

Also infer **touch surfaces** (used in Step 2) — check all that apply:

| Surface | Signals |
|---|---|
| `actions` | Server Action, mutation, `app/actions/` |
| `dashboard` | `app/dashboard/`, user page, sidebar |
| `admin` | `app/admin/`, `requireAdmin` |
| `api` | `app/api/`, route handler, cron, PDF |
| `components` | `components/`, form, dialog, RHF |
| `lib` | `lib/`, Prisma, schema, `plans`, `usage`, email transport |
| `prisma` | `schema.prisma`, migration, model |

If the task is **narrow** (one file or one function), say so in one line — this **lowers** read budgets in Step 2.

Also note **domain entities** when obvious (affects Step 2c): `invoice` · `client` · `recurring` · `billing` / `plan` · `admin` · `auth` · `email` · `notification` · `profile` · `onboarding` · `contact` · `report` / `export` · `pdf` · `cron`.

---

## Step 2 — Select context (token-conscious)

**Goal:** Load the **smallest** set of **path-scoped `AGENTS.md`** + **skills** that grounds the plan. Select **AGENTS.md first** (task-local rules), then skills (templates). Do not load the whole repo.

**Workflow:** Step 2c (draft AGENTS list) → Step 2b (skills + pairing merges into AGENTS list) → **Read tool** on final `AGENTS.md` files, then final skills.

### 2a. Rules — do not Read

These are **already in context** (`alwaysApply: true` in `.cursor/rules/`):

- `main.mdc` · `patterns.mdc` · `tech-stack.mdc`

**Never** use the Read tool on them during plan-task. Reference them in the plan by name only.

### 2c. AGENTS.md — selection (required when in scope)

Path-scoped agents live **only** under these paths (no others exist):

| File | Scope |
| --- | --- |
| `app/actions/AGENTS.md` | Server Actions, mutations, `generate-invoice.tsx` |
| `app/dashboard/AGENTS.md` | User dashboard pages, `requireUser`, Suspense |
| `app/admin/AGENTS.md` | Admin UI, `requireAdmin`, `revalidatePath` |
| `app/api/AGENTS.md` | Route handlers, cron, public PDF |
| `components/AGENTS.md` | UI, forms, RHF, `components/` |
| `lib/AGENTS.md` | Prisma singleton, `auth()`, plans, usage, email, schemas |

**Budget (hard caps) — separate from skills:**

| Task shape | Max AGENTS.md to Read |
|---|---|
| Narrow | **1** |
| Medium | **2** |
| Broad (3+ surfaces or new feature) | **3** |
| `pr-review` | **2** (from diff paths only) |

**Step A — Candidates from surfaces** (Step 1): add one candidate per matching surface row in the table above.

**Step B — Candidates from domain entities** (add if mentioned or implied):

| Entity / keywords | Add candidates (in priority order) |
| --- | --- |
| `invoice`, `client`, `recurring`, `notification`, `profile`, `onboarding` | `app/actions`, `app/dashboard`; + `components` if form/UI |
| `billing`, `plan`, `upgrade`, `limit` | `lib`, `app/actions`; + `app/admin` if admin approval flow |
| `admin`, `user management`, deactivate, `isAdmin` | `app/admin`, `app/actions` |
| `pdf`, `cron`, `chart`, `export`, `route`, `/api/` | `app/api`; + `app/actions` if cron/recurring action |
| `schema`, `migrate`, `prisma`, `zod`, `lib/schemas` | `lib`; + `app/actions` if mutations |
| `login`, `session`, `magic link`, `NextAuth` | `lib`, `app/actions` |
| `email`, `template`, `reminder`, `dispatch` | `lib`, `app/actions` |
| `contact`, landing, marketing form | `components`, `app/actions` |
| UI-only tweak (styling, copy, one component) | `components` only |

**Step C — Candidates from explicit paths** in the user message (highest priority):

| Path prefix | Add |
| --- | --- |
| `app/actions/` | `app/actions/AGENTS.md` |
| `app/dashboard/` | `app/dashboard/AGENTS.md` |
| `app/admin/` | `app/admin/AGENTS.md` |
| `app/api/` | `app/api/AGENTS.md` |
| `components/` | `components/AGENTS.md` |
| `lib/` or `prisma/` | `lib/AGENTS.md` |

**Step D — `pr-review`:** If the user names changed files or paths, add AGENTS.md only for directories in the diff. If unknown, add at most `app/actions` + one other inferred from PR title/description.

**Step E — Prune** (drop candidates not needed):

| Drop | When |
| --- | --- |
| `app/dashboard/AGENTS.md` | No dashboard page/route/layout work |
| `components/AGENTS.md` | No UI/component work (API-only, action-only backend) |
| `app/admin/AGENTS.md` | No `/admin` work |
| `app/api/AGENTS.md` | No route handler / cron / PDF work |
| `app/actions/AGENTS.md` | Read-only UI with zero mutation (rare) |
| `lib/AGENTS.md` | No `lib/`, schema, auth, plans, or email transport work |

**Step F — Apply cap** — If over budget, keep in priority order:

1. AGENTS.md for **explicit path** from the user (Step C)
2. AGENTS.md **paired** with a skill you will keep (see 2b pairing — do not drop paired AGENTS if its skill stays)
3. AGENTS.md for **primary surface** of the task
4. Drop `components` before `dashboard` before `actions` when the task is backend-heavy

**Step G — Draft list only** — Do not Read yet. Finalize the AGENTS list after Step 2b-E (pairing), then Read in Step 2b-F.

**Do not Read:** `AGENTS.md` (repo root) — index only.

---

### 2b. Skills — selection algorithm

**Budget (hard caps):**

| Task shape | Max skills to Read |
|---|---|
| Narrow (single file / single bug) | **2** |
| Medium (one feature slice) | **3** |
| Broad (multi-surface / new feature) | **4** |
| `pr-review` only | **2** (`pr-review` + at most one of `code-style` / `query-db` / `send-email` by diff domain) |

**Step A — Candidates from types** (union, then dedupe):

| Type | Candidate skills |
|---|---|
| `new-feature` | `add-server-action`, `add-component`, `add-dashboard-page` |
| `db-change` | `add-prisma-model`, `add-zod-schema`, `add-server-action` |
| `ui-change` | `add-component`, `add-dashboard-page` |
| `bug-fix` | `query-db`, `debug-auth`, `plan-limits` |
| `refactor` | `code-style`, `best-practices` |
| `email` | `send-email`, `plan-limits` |
| `auth` | `debug-auth`, `best-practices` |
| `plan-billing` | `plan-limits`, `add-server-action` |
| `pr-review` | `pr-review`, `code-style`, `best-practices` |

**Step B — Prune** (drop candidates unless the task clearly needs them):

| Skill | Read only when |
|---|---|
| `add-server-action` | New/changed Server Action or mutation |
| `add-component` | New/changed UI, form, or client component |
| `add-dashboard-page` | New/changed `app/dashboard/**` route, layout, loading/error |
| `add-prisma-model` | Schema/migration/new model |
| `add-zod-schema` | New/changed Zod schema or FormData array parsing |
| `query-db` | Prisma query/transaction/N+1/ownership bug |
| `debug-auth` | Session, login, `requireUser`, magic-link |
| `send-email` | Sending/templates/reminders/dispatch |
| `plan-limits` | Plans, limits, upgrades, `getUserUsage`, invoice/email caps |
| `code-style` | Refactor/style/review-focused work |
| `best-practices` | Architecture choice, new feature shape, auth/billing, or unclear boundaries — **not** for a one-line bug in a known file |
| `codebase-index` | Unknown file locations, 3+ surfaces, or first-time area — **never** for narrow tasks with explicit paths |
| `pr-review` | Only when type is `pr-review` |

**Step C — Refine by surface** (prefer skills that match **surfaces**, drop mismatches):

- `components` only, no new page → drop `add-dashboard-page`
- `dashboard` page, no new action → drop `add-server-action` unless mutations are in scope
- `api` only, no UI → drop `add-component` and `add-dashboard-page`
- `prisma` without new API shape → drop `add-zod-schema` unless validation changes
- `email` secondary on a CRUD task → keep `send-email` only if sending behavior changes

**Step D — Apply cap** — If over budget, drop in this order: `codebase-index` → `best-practices` → `code-style` → least relevant template skill for the primary type.

**Step E — Skill → AGENTS.md pairing** (merge into Step 2c list; dedupe):

| Skill selected | Ensure this AGENTS.md is in the Read list |
| --- | --- |
| `add-server-action` | `app/actions/AGENTS.md` |
| `add-component` | `components/AGENTS.md` |
| `add-dashboard-page` | `app/dashboard/AGENTS.md` |
| `add-prisma-model`, `add-zod-schema` | `lib/AGENTS.md` |
| `query-db`, `debug-auth`, `send-email`, `plan-limits` | `lib/AGENTS.md` |
| `pr-review` | From diff paths (Step 2c-D), not this table |

If pairing pushes over the AGENTS cap, drop a **non-paired** candidate before dropping a paired one.

**Step F — Read** (mandatory, in this order):

1. Each path-scoped `AGENTS.md` in the **final** list (after pairing + cap).
2. Each `.cursor/skills/<name>/SKILL.md` in the final skills list.

Before reading, output a **one-line selection** in chat:

`Context: AGENTS [app/actions, lib] · skills [add-server-action, plan-limits] · skipped [components AGENTS — no UI]`

### 2d. Optional discovery (tight)

Use **at most one** of:

- **Grep** — single pattern to locate a symbol/file for `bug-fix`
- **Glob** — one pattern when the task references an unknown path

Do **not** run broad codebase search if the user named paths or entities (invoice, client, admin user list, etc.).

### 2e. What not to load

- Do not Read path-scoped `AGENTS.md` files **not** in the Step 2c final list.
- Do not `@` or Read skills not in the Step 2b final list.
- Do not Read `plan-task` (this file) again.
- Do not Read implementation files unless Step 2d discovery requires **one** file to disambiguate — never read “for context” before Plan mode.

---

## Step 3 — Clarifying questions (only if needed)

Ask **only** when planning is blocked:

- Domain/entity unclear
- Plan tier / gating unclear
- User vs admin vs API unclear
- Extend existing vs new file unclear

If inferable, proceed to Step 4.

---

## Step 4 — SwitchMode to Plan and author the plan (required)

**Immediately** after Step 2 (and any Step 3 answers):

1. Call **SwitchMode** with `target_mode_id`: **`plan`**. Short `explanation` (e.g. *Classified; minimal context loaded; writing plan*).
2. In **Plan mode**, create the full plan. YAML frontmatter: `name`, `overview`, `todos` (`id`, `content`, `status: pending`). Map **Steps** and **Definition of done** into `todos`.
3. Plan body sections:

### What & Why
One paragraph: outcome and scope (explicitly **in** / **out** of scope).

### Applicable context
Bullets **only** for context actually loaded in Step 2:

- **AGENTS.md Read** — full paths (e.g. `app/actions/AGENTS.md`) + one phrase per file on how it constrains the plan
- **Skills Read** — `.cursor/skills/<name>/`
- Rules: cite `main` / `patterns` / `tech-stack` as already-on (not re-read)
- **Skipped context** — skills and AGENTS.md intentionally omitted, with reason (e.g. *Skipped `app/api/AGENTS.md` — no route work*)

### Files to modify / create
Explicit paths; name functions/sections to change.

### Steps (ordered)
Numbered steps; note `Reuses X from @/lib/Y` where applicable.

### DRY check
Utilities to reuse (`getUserUsage`, `dispatchInvoiceEmail`, `formatCurrency`, `cn()`, existing schemas).

### SOLID check
S / O / D risks for this scope only.

### Plan-limit / auth impact
Limits, `requireUser` / `requireAdmin`, `PLAN_FEATURES`, API `auth()` if relevant.

### Test plan
`app/actions/__tests__/` target, mocks, assertions — or *none* if out of scope.

### Risks & open questions
Defaults chosen when ambiguous.

### Definition of done
Checklist (mirrored in `todos`).

4. Handoff: review → **Build**; optional **Save to workspace** (`.cursor/plans/`).

**Fallback** — Same sections in main chat if SwitchMode fails; still Step 5.

---

## Step 5 — Task verification in chat (after the plan)

Post in chat after the plan (Plan UI or fallback):

### Plan task (verify)

- **Types** — Primary + secondary
- **Surfaces** — From Step 1
- **AGENTS Read** — Final list from Step 2c (paths)
- **Skills Read** — Final list from Step 2b
- **Skipped** — Largest AGENTS or skill omission + reason
- **Scope** — user / admin / API / mixed
- **Plan name** — From frontmatter if available

*Reply if this plan does not match what you wanted.*

---

## Constraints

- Ticket-sized diffs; no drive-by refactors.
- Mutations via Server Actions only (no new REST CRUD).

## Handoff

- Implement via **Build** from the plan.
- After code exists, use `@pr-review` (it loads its own minimal skill set).
