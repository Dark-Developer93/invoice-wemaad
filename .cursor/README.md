# Cursor — what do I use?

Rules in `.cursor/rules/` apply automatically. Everything below is **on demand**.

## Plan before you code

| Situation | Use |
|-----------|-----|
| New feature, fix, refactor, or schema change | `@plan-task` + describe the task |
| Lost in the repo | `@codebase-index` |

Accept **Plan** mode when prompted → review plan → **Build**.

Details: [skills/plan-task/README.md](skills/plan-task/README.md)

## Review a PR

| Situation | Use |
|-----------|-----|
| GitHub PR URL or number | **PR reviewer** agent, or `/review <url>`, or `@pr-fetch-review` |
| Already on the PR branch / local diff only | `@pr-review` |

Read-only: no commits or fixes unless you start a new Agent chat to implement.

Details: [skills/pr-fetch-review/README.md](skills/pr-fetch-review/README.md)

## While implementing

| Situation | Use |
|-----------|-----|
| Server Action | `@add-server-action` |
| Form / component | `@add-component` |
| Dashboard page | `@add-dashboard-page` |
| Prisma model | `@add-prisma-model` |
| Zod schema | `@add-zod-schema` |
| Plans / limits | `@plan-limits` |
| Email | `@send-email` |

Folder conventions: `app/*/AGENTS.md`, `components/AGENTS.md`, `lib/AGENTS.md` (loaded automatically by `@plan-task` when relevant).

## Pieces (don’t mix them up)

| Kind | Examples | Role |
|------|----------|------|
| **Rule** | `rules/*.mdc` | Always-on constraints |
| **Skill** | `@plan-task`, `@pr-review` | Playbooks you `@` mention |
| **Agent** | `agents/pr-reviewer.md` | Read-only reviewer persona |
| **Command** | `/review` | Shortcut prompt → agent + skills |
