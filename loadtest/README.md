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
k6 run -e MODE=raw -e VUS=50 loadtest/scenario.js

# 5. Clean up
node loadtest/cleanup.mjs
```

Options (`-e NAME=value`): `BASE_URL`, `VUS`, `DURATION` (hold time),
`RAMP` (ramp-up time), `MODE` (`realistic` | `raw`).

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

| Build | Active users | req/s | median | p95 | p99 | errors | Result |
|---|---:|---:|---:|---:|---:|---:|---|
| before | 50 | 6.9 | 58 ms | 318 ms | 597 ms | 0% | PASS |
| before | 75 | 9.8 | 115 ms | 874 ms | 1,791 ms | 0% | FAIL |
| before | 100 | 13.0 | 180 ms | 1,418 ms | 3,873 ms | 0.07% | FAIL |
| after | 100 | 13.7 | 56 ms | 256 ms | 443 ms | 0% | PASS |
| after (repeat) | 100 | 13.6 | 38 ms | 172 ms | 308 ms | 0% | PASS |
| after | 125 | 17.1 / 17.2 | 67 / 45 ms | 422 / 206 ms | 1,288 / 380 ms | 0% | borderline (1 of 2 passed) |
| after | 150 | 20.4 | 82 ms | 549 ms | 1,294 ms | 0% | FAIL |

So the same core went from **~50 → ~100 concurrent active users** (2×).
Latency at 100 users dropped from p95 1.4 s → 0.26 s.

The bottleneck both times was **CPU on the single Node process**, not the
database. Profiling showed what burned it before the fixes:

1. `formatCurrency()` built a new `Intl.NumberFormat` on every call. It was
   the #1 function (~15% of busy CPU).
2. Every invoice-table row eagerly built its hidden "View invoice" dialog.
   That was the #2 function (~10%).

After the fixes the profile is flat: what's left is mostly React/Next's own
server rendering and GC. Further gains are structural (pagination, rendering
less markup per row) rather than one-line fixes.

These are *relative* numbers for one core on a dev box. Production on
Vercel scales out across function instances, and every DB query there is
a network round trip to Neon. Run the scenario against a preview deployment
(with its own throwaway Neon branch) to get absolute numbers for that setup.
