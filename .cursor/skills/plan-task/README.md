# plan-task

Use **`@plan-task`** before implementing a feature, fix, refactor, or schema change. It classifies your request, loads only the relevant project context, switches to **Plan mode**, and writes a reviewable implementation plan (with todos)—without editing code yet.

## Quick start

1. Open Composer (`Ctrl+I` / `Cmd+I`).
2. Mention the skill and describe the work:

   ```
   @plan-task Add export for overdue invoices on the dashboard
   ```

3. If prompted, **accept** the switch to **Plan** mode.
4. Review the plan in the Plan editor → click **Build** when ready.
5. Optionally **Save to workspace** to keep the plan under `.cursor/plans/`.

You can start in **Agent** mode; the skill calls `SwitchMode` to Plan for you.

## What it does

| Step | What happens |
|------|----------------|
| Classify | Task type, surfaces (actions, dashboard, admin, API, …), domain (invoice, client, …) |
| Load context | Reads **1–3** path `AGENTS.md` files + **2–4** skills (not the whole repo) |
| Plan | Full plan in Plan UI: files, steps, DRY/SOLID, auth/limits, tests, definition of done |
| Verify | Short chat summary: what was loaded and what was skipped |

**Always-on** (no extra reads): `.cursor/rules/main.mdc`, `patterns.mdc`, `tech-stack.mdc`.

**Not loaded by default:** repo-root `AGENTS.md`, unrelated folder agents, `codebase-index` on small scoped tasks.

## Good prompts

- `@plan-task Fix mark-as-paid not refreshing the invoice list`
- `@plan-task New admin filter on pending plan upgrades`
- `@plan-task Migration: add poNumber to Invoice`

Include paths or areas when you know them (`app/actions/invoices.ts`, `app/admin/`)—the skill prioritizes those for context selection.

## After the plan

- **Implement:** **Build** from the plan (do not paste the plan into a new chat).
- **Review code:** `@pr-review` once changes exist.

## If something goes wrong

- **Plan only appeared in chat** — SwitchMode may have failed or been declined; re-run `@plan-task` and accept Plan mode, or ask to follow plan-task and SwitchMode to `plan`.
- **Wrong scope in plan** — Reply in the thread; refine the plan or re-run with a clearer prompt.
- **Questions blocked planning** — Answer briefly (user vs admin, plan tier, etc.); the skill only asks when necessary.

## Full instructions

Agent behavior is defined in [SKILL.md](./SKILL.md).
