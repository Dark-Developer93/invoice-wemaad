# Load testing (k6)

"How many people can this app handle before it breaks?", answered by
simulating realistic users with [k6](https://k6.io) and pushing until the
latency/error budget is blown.

## What a virtual user does

One VU = one seeded user with a real session, running this loop forever:

| Step | Request | Notes |
|---|---|---|
| 1 | `GET /dashboard` + `GET /api/dashboard/chart-data` | the chart fetch is what the dashboard's client makes on load |
| 2 | think 3–7s | |
| 3 | `GET /dashboard/invoices` | |
| 4 | think 3–8s | |
| 5 | 25% `GET /dashboard/clients` · 10% PDF download · 8% `markAsPaid` · 3% `createInvoice` | the two writes are real server-action calls, so cache invalidation is exercised |
| 6 | think 5–15s, loop | |

That's roughly **0.12 requests/second per active user**. "Active" means
clicking around at that moment. It doesn't mean registered or daily-active.

## Pass/fail bar

Every run is judged on the same thresholds (k6 exits non-zero on failure):

- p95 latency < 500 ms
- p99 latency < 1 s
- error rate < 1%

The end-of-run summary also breaks latency down per endpoint
(`http_req_duration{name:...}`), which tells you *which* request to fix.

## Running it

> **Never point this at a database with real data.** The seed creates
> thousands of users and the scenario creates/updates invoices.

```bash
# 1. Disposable Postgres with migrations applied
export DATABASE_URL=postgresql://...        # throwaway DB
export AUTH_SECRET=...                      # same value the server uses
npx prisma migrate deploy

# 2. Production build (the seed reads server-action IDs from it) + start
pnpm build
pnpm start -p 3200        # or: taskset -c 1 pnpm start -p 3200 to pin 1 CPU

# 3. Seed users/clients/invoices + sessions -> loadtest/users.json
node loadtest/seed.mjs 3000 40            # users, invoices per user

# 4. Ramp up like a binary search: double until it fails, then back off
k6 run -e BASE_URL=http://localhost:3200 -e VUS=50  -e DURATION=2m loadtest/scenario.js
k6 run -e BASE_URL=http://localhost:3200 -e VUS=100 -e DURATION=2m loadtest/scenario.js
# ...repeat the passing level 2-3x before trusting it

# Raw max throughput of one endpoint (no think time):
k6 run -e MODE=raw -e ENDPOINT=/dashboard/invoices -e VUS=20 loadtest/scenario.js   # ENDPOINT=pdf for the public PDF link

# 5. Clean up
node loadtest/cleanup.mjs
```

Options (`-e NAME=value`): `BASE_URL`, `VUS`, `DURATION` (hold time),
`RAMP` (ramp-up time), `MODE` (`realistic` | `raw`), `ENDPOINT` (raw mode only).

Against an **https** deployment the scenario automatically uses the
`__Secure-authjs.session-token` cookie name. Only run it against a
preview deployment backed by its own throwaway database, never production.

### Finding *why* it broke

Run the server under the V8 profiler while k6 is running, then look at the
top self-time functions:

```bash
node --cpu-prof --cpu-prof-dir=./prof node_modules/next/dist/bin/next start -p 3200
# ...run k6, then Ctrl+C the server; open prof/*.cpuprofile in Chrome DevTools
```

## Results (2026-09-29)

All components ran on one box. Node was pinned to **one CPU core**
(`taskset -c 1`), with Postgres and k6 on other cores, so the numbers
measure app-server CPU. Data: 3,000 users, 15,000 clients, 120,000 invoices.

Three builds were measured: the original code, after the CPU fixes
(round 1), and after the database round-trip fixes (round 2).

| Build | Active users | req/s | median | p95 | p99 | errors | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| original | 50 | 6.9 | 58 ms | 318 ms | 597 ms | 0% | PASS |
| original | 75 | 9.8 | 115 ms | 874 ms | 1,791 ms | 0% | FAIL |
| original | 100 | 13.0 | 180 ms | 1,418 ms | 3,873 ms | 0.07% | FAIL |
| round 1 | 100 | 13.7 / 13.6 | 56 / 38 ms | 256 / 172 ms | 443 / 308 ms | 0% | PASS ×2 |
| round 1 | 125 | 17.1 / 17.2 | 67 / 45 ms | 422 / 206 ms | 1,288 / 380 ms | 0% | 1 of 2 passed |
| round 1 | 150 | 20.4 | 82 ms | 549 ms | 1,294 ms | 0% | FAIL |
| round 2 | 100 | 13.7 / 13.9 | 52 / 42 ms | 226 / 158 ms | 387 / 236 ms | 0% | PASS ×2 |
| round 2 | 125 | 17.3 / 17.1 | 51 / 48 ms | 250 / 244 ms | 460 / 415 ms | 0% | PASS ×2 |
| round 2 | 150 | 20.5 / 20.1 | 57 / 61 ms | 311 / 334 ms | 528 / 722 ms | 0.05% | PASS ×2 |
| round 2 | 175 | 23.6 | 67 ms | 435 ms | 729 ms | 0% | PASS (once) |
| round 2 | 200 | 26.6 | 96 ms | 793 ms | 2,006 ms | 0% | FAIL |

So the same core went from **~50 → ~150 concurrent active users** (3×).

The bottleneck was always **CPU on the single Node process**. Profiling
showed what burned it before the fixes:

1. `formatCurrency()` built a new `Intl.NumberFormat` on every call. It was
   the #1 function (~15% of busy CPU).
2. Every invoice-table row eagerly built its hidden "View invoice" dialog.
   That was the #2 function (~10%).

After those fixes the profile is flat: what's left is mostly React/Next's
own server rendering and GC. Further gains are structural (pagination,
rendering less markup per row) rather than one-line fixes.

### Database round trips

Counted with Postgres `log_statement = 'all'`, one page load each:

| Request | Before | After |
|---|---:|---:|
| any dashboard page (session check) | 2 | 1 |
| `/dashboard` | 4 | 2 |
| `/dashboard/invoices`, `/dashboard/clients` | 3 | 2 |
| `/api/dashboard/chart-data` | 2 | 1 |
| `/dashboard/billing` | 8 | 4–5 |
| `/dashboard/reports` | 6–9 | 2 |
| public invoice PDF link (customers) | 5 | 1 |

Causes, all fixed:
- Prisma ran one extra query per `include`d relation, so every session check
  was Session, then User. Now `relationJoins` is on. List queries whose rows
  each include a to-many relation opt back out with
  `relationLoadStrategy: "query"`: as a JOIN, the invoice list was ~6× slower
  (47 ms vs 8 ms).
- The session callback re-selected the User row the adapter had just loaded.
- The dashboard layout, the page and `getUserUsage()` each selected the same
  User row. It's now `getCurrentUser()`, once per request. Reports ran two
  monthly COUNTs just to learn the plan.

Connections are fine. The app holds a steady Prisma pool (9 = 2 × CPUs + 1)
and reuses it; nothing opens connections per request.

Locally a round trip costs ~0.1 ms, so this barely shows in the table above.
On Vercel → Neon each one crosses the network (~1–5 ms warm, much more on a
Neon cold start), so fewer round trips is where users will feel it.

### Memory (peak during the 100-user runs)

- Node (`next start`): ~660 MB RSS
- Postgres: ~550 MB total, including `shared_buffers = 256MB`
- Data: 3,000 users + 120,000 invoices = 85 MB on disk

## Sizing a VPS

Rules for this workload, from the runs above:

- **One Node process uses one core** and handles **~150 concurrent active
  users** (~20 req/s). Extra cores don't speed up a single `next start`.
- **Don't run several Next processes (PM2 cluster, multiple containers)
  without a shared cache.** Next's data cache (`unstable_cache` +
  `revalidateTag`, which this app relies on everywhere) is per process by
  default. A second process would keep serving stale invoices after the
  first one handles an edit. Scaling past one process needs a custom
  `cacheHandler` backed by Redis. Until then, scale up (a faster core), not
  out.
- Postgres needs very little CPU here. It's mostly memory for its cache.

| Size | Example | What to expect |
|---|---|---|
| 1 vCPU / 2 GB | DigitalOcean $12, Hetzner CX22-class | Works, tight. Node and Postgres share the core, so expect ~100 active users. Add 2 GB swap, set Postgres `shared_buffers = 128MB` and `NODE_OPTIONS=--max-old-space-size=768`. |
| **2 vCPU / 4 GB (recommended)** | DigitalOcean $24, Hetzner CPX21-class | A full core for Node and one for Postgres, nginx/Caddy and the OS. ~150 active users with headroom, and room for PDF bursts. |
| 4 vCPU / 8 GB | | Only worth it with a Redis `cacheHandler` and 2–3 Node processes behind nginx, or Postgres moved off the box. |

Disk: 40 GB SSD is plenty (the DB grows ~0.7 KB per invoice).

Running on a VPS instead of Vercel also means doing yourself what Vercel
does now:
- `vercel.json` crons don't run. Add system cron entries that call
  `/api/cron/recurring-invoices` and `/api/cron/data-retention` with the
  `CRON_SECRET` header.
- TLS and a reverse proxy (Caddy is the least work).
- Postgres backups off the box (nightly `pg_dump` to object storage).
- Set `NEXT_PUBLIC_APP_URL` to the real domain. Invoice-email links use it
  off Vercel.

"Active" means clicking around right now. How many daily users that
supports depends on how many are online at once at peak. At a typical 5–10%
peak concurrency, 150 active users is on the order of 1,500–3,000 daily
users.

These are *relative* numbers for one core on a dev box. Run the scenario
against the real VPS (or a Vercel preview with its own throwaway Neon
branch) before relying on them.
