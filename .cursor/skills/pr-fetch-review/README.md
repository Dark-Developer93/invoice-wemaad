# pr-fetch-review

Fetches a GitHub PR, checks out the branch, diffs against base, and reviews with selective project context.

## Quick start

```
/review https://github.com/<org>/invoice-wemaad/pull/42
```

or select the **PR reviewer** agent and paste a PR URL / number.

```
@pr-fetch-review Review PR #42
```

## What it does

1. `gh pr checkout` (or git fetch fallback)
2. `git diff origin/<base>...HEAD` (base from PR or `main`)
3. Reads up to **3** path `AGENTS.md` + **4** skills from the diff
4. Outputs review via `@pr-review` checklist — **no commits, no fixes**

## Read-only

Use `.cursor/agents/pr-reviewer.md` or `/review` for strict read-only behavior.

## Local diff only

Use `@pr-review` directly if there is no GitHub PR to fetch.

See [SKILL.md](./SKILL.md) for the full workflow.
