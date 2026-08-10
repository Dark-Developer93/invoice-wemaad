---
name: pr-fetch-review
description: >-
  Checks out a GitHub PR from URL or number, diffs against the PR base branch, selects path-scoped AGENTS.md
  and review skills from the diff, and produces a rule-aware review. Use when the user pastes a PR link,
  names a PR number, or wants the PR branch checked out with a structured summary. Pair with pr-reviewer agent.
---

# PR fetch and review (invoice-wemaad)

## When this applies

The user wants to **materialize** a PR locally and get a **structured review** (scope, DRY, SOLID, production readiness) against this repo’s conventions.

**Read-only:** fetch, checkout, diff, read files, write review — no commits, no fixes (see `.cursor/agents/pr-reviewer.md`).

## Defaults

- **GitHub org/repo:** infer from `git remote get-url origin` when the user only gives a PR number.
- **Integration branch (fallback base):** **`origin/main`**. Run `git fetch origin main` (or `git fetch origin`) before diffing so the comparison is not stale.

If the PR’s base is not `main`, use **`baseRefName`** from `gh pr view` instead of assuming `main`.

## Workflow

### 1. Resolve PR identity

- URL `https://github.com/<owner>/<repo>/pull/<n>` → `owner`, `repo`, `n`.
- Plain number `n` → `gh pr view n --json url,baseRefName,headRefName,title,state,author` in the project root.

If `gh pr view` fails on classic Projects fields:

`gh pr view <n> --json title,author,state,headRefName,baseRefName,body,url`

### 2. Checkout the PR branch (execute in project root)

- Preferred: `gh pr checkout <n>` (matching `origin`), or `gh pr checkout <n> --repo <owner>/<repo>` for another repo.
- Fallback: `git fetch origin pull/<n>/head:pr-<n>` then `git checkout pr-<n>`.

### 3. Scope the diff to the correct base

- `git fetch origin <baseBranch>` (from PR base or `main`).
- `git log origin/<baseBranch>..HEAD --oneline`
- `git diff origin/<baseBranch>...HEAD --stat`
- Use triple-dot `...` for merge-base diff. For deep review: `git diff origin/<baseBranch>...HEAD -- <paths>`.

### 4. Warn if working tree is dirty

Local edits to tracked files may not be part of the PR — mention them; do not attribute them to the PR.

### 5. Select context from the diff (token-conscious)

**Do not** re-read `.cursor/rules/*.mdc` — `main.mdc`, `patterns.mdc`, `tech-stack.mdc` are **alwaysApply**; cite them by name in the review.

**Do not** Read repo-root `AGENTS.md`.

#### Path-scoped AGENTS.md (max **3** files)

Add candidates from changed paths in `--stat`, then keep the highest-signal (max 3):

| Changed path prefix | Read |
| --- | --- |
| `app/actions/` | `app/actions/AGENTS.md` |
| `app/dashboard/` | `app/dashboard/AGENTS.md` |
| `app/admin/` | `app/admin/AGENTS.md` |
| `app/api/` | `app/api/AGENTS.md` |
| `components/` | `components/AGENTS.md` |
| `lib/`, `prisma/` | `lib/AGENTS.md` |

If over cap, keep paths with the most behavioral change; drop `components` before `dashboard` on backend-heavy PRs.

#### Review skills (max **4** files)

Start from changed areas; **Read** only what the diff needs:

| Diff touches | Skills to consider (prune to ≤4) |
| --- | --- |
| `app/actions/`, mutations | `add-server-action` |
| `components/`, forms | `add-component` |
| `app/dashboard/` pages | `add-dashboard-page` |
| `prisma/`, migrations | `add-prisma-model`, `query-db` |
| `lib/schemas/`, validation | `add-zod-schema` |
| `lib/email/`, sending | `send-email`, `plan-limits` |
| `lib/plans`, `lib/usage`, billing UI | `plan-limits` |
| `lib/auth`, `lib/session`, login | `debug-auth` |
| Prisma/query performance | `query-db` |
| Style-only TS/TSX | `code-style` |
| Architecture / many surfaces | `best-practices` |
| **Checklist + output format** | `pr-review` (always Read for final sections) |

Drop `codebase-index` unless paths are unclear. Do not load every skill in the table.

Before reading, one line in chat:

`PR review context: AGENTS […] · skills […] · base origin/<branch>`

### 6. Read changed code

Open files that drive behavior from the diff — not every lockfile line unless relevant.

### 7. Run review checklist

Apply **`.cursor/skills/pr-review/SKILL.md`** sections 1–5 and use its **output format** (Correctness, Minimal, DRY, SOLID, Production readiness).

## Summary output (include in review)

In addition to the `pr-review` sections, start with:

1. **Branch and base** — HEAD branch name; base ref used (`origin/<base>`).
2. **PR** — Title, number, URL, author, state (from `gh pr view`).
3. **Applicable context** — Each **AGENTS.md** and **skill** Read + one phrase on what you checked; rules cited as already-on (`main` / `patterns` / `tech-stack`).
4. **What changed** — Bullets by area; file count and scale from `--stat`.
5. **Verdict** — merge-friendly · merge with follow-ups · needs changes.

Use severity: **blocker** · **suggestion** · **nice to have**.

## Constraints

- No commits, pushes, or source edits during review.
- No destructive git commands.
- Mutations belong in Server Actions, not new REST CRUD (cite `patterns` / `best-practices` when relevant).
