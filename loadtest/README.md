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

### Clean comparison: `main` vs this branch

Each build was measured on a **freshly reset dataset**. Every run creates
invoices and marks others paid, so results drift if the data isn't reset
between builds; compare builds only within one session like this.

| Build | Active users | req/s | median | p95 | p99 | errors | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| main | 50 | 6.7 | 65 ms | 480 ms | 642 ms | 0% | PASS |
| main | 100 | 12.3 | 327 ms | 3,409 ms | 5,194 ms | 0.07% | FAIL |
| main | 150 | 15.7 | 965 ms | 7,441 ms | 21,563 ms | 0.06% | FAIL |
| branch | 100 | 13.6 | 39 ms | 132 ms | 226 ms | 0% | PASS |
| branch | 150 | 20.8 | 42 ms | 180 ms | 290 ms | 0% | PASS |
| branch | 200 | 26.5 | 59 ms | 506 ms | 1,414 ms | 0% | FAIL (p95 just over) |
| branch | 250 | 31.9 | 161 ms | 1,734 ms | 5,069 ms | 0.03% | FAIL |

Repeated on a second, slower host (same method, fresh data per build):

| Build | Active users | req/s | median | p95 | p99 | errors | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| main | 50 | 6.8 | 190 ms | 995 ms | 1,312 ms | 0% | FAIL |
| main | 100 | 11.1 | 879 ms | 4,533 ms | 16,505 ms | 0.08% | FAIL |
| branch | 100 | 13.8 | 73 ms | 294 ms | 468 ms | 0% | PASS |
| branch | 125 | 17.0 | 78 ms | 359 ms | 863 ms | 0% | PASS |
| branch | 150 | 19.7 | 127 ms | 1,045 ms | 2,286 ms | 0% | FAIL |

Absolute capacity depends heavily on the CPU (this host's `main` fails
where the first host's passed), but the ratio held on both: **about 3× as
many concurrent active users on the same core** (~50 → ~150 on the first
host, <50 → ~125 on the second). Always compare builds on the same machine.

### Pagination (same machine, sequential requests, warm cache)

| Page | Before | After |
|---|---:|---:|
| Invoice list, user with 400 invoices | 231 ms, 41 KB gzipped | 62 ms, 20 KB |
| Invoice list, user with 40 invoices | 57 ms | 47 ms |
| Admin users, 3,000 users | 1,455 ms, 2 MB gzipped | 69 ms, 33 KB |
| Reports, user with 400 invoices | 74 ms | 44 ms |

Before pagination these pages got slower with every invoice (or user) added;
now their cost stays flat.

### Max throughput per endpoint (raw mode, one core)

| Endpoint | Before structural changes | After |
|---|---:|---:|
| `/dashboard/invoices` | 14 req/s (~71 ms CPU each) | 26 req/s (~38 ms) |
| Public invoice PDF link | 37 req/s (~27 ms) | 310 req/s (~3 ms, cached) |
| `/dashboard`, `/clients`, `/billing`, `/reports` | 38–49 req/s | unchanged (already lean) |

The bottleneck was always **CPU on the single Node process**. Profiling
showed what burned it before the fixes:

1. `formatCurrency()` built a new `Intl.NumberFormat` on every call. It was
   the #1 function (~15% of busy CPU).
2. Every invoice-table row eagerly built its hidden "View invoice" dialog.
   That was the #2 function (~10%).

After those fixes the profile was flat, so the next gains were structural:

3. The invoice list was rendered as a server component, so every row's
   markup was sent twice (HTML plus a copy in the RSC payload for
   hydration, ~230 KB for 40 invoices). It's now a client component fed
   plain row data. The server renders byte-identical HTML with a fraction
   of the payload (1.9× faster page).
4. Invoice PDFs were re-rendered with react-pdf on every open. They're now
   cached under a hash of their exact inputs, so any edit produces a new
   PDF and nothing needs invalidating (8× faster link).

What's left is React/Next's own rendering. The remaining lever is rendering
less markup (for example, paginating the invoice list), which would change
the UI, so it wasn't done here.

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

- **One Node process uses one core** and handles **~125–150 concurrent active
  users** (depending on how fast the core is) (~20 req/s). Extra cores don't speed up a single `next start`.
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
| **2 vCPU / 4 GB (recommended)** | DigitalOcean $24, Hetzner CPX21-class | A full core for Node and one for Postgres, nginx/Caddy and the OS. ~125–150 active users (CPU-dependent), with room for PDF bursts. |
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
