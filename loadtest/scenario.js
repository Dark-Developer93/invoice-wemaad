// k6 load test: simulates realistic InvoiceWeMaAd users (not raw request
// spam) and fails the run if the app can't keep latency/errors within budget.
//
// Each virtual user is one behavioral loop, repeated for the whole run:
//   1. Open the dashboard (page + the chart-data fetch its client makes)
//   2. Think 3–7s
//   3. Open the invoice list
//   4. Think 3–8s
//   5. Maybe: open clients (25%), download a PDF (10%), mark an invoice paid
//      (8%), create an invoice (3%)
//   6. Think 5–15s, loop
// That's roughly 3 requests per ~25s loop ≈ 0.12 req/s per active user.
//
// Every VU is a different seeded user with its own real session (see
// seed.mjs), so per-user caches behave like production instead of one hot key.
//
// Usage:
//   k6 run -e BASE_URL=http://localhost:3200 -e VUS=200 -e DURATION=3m loadtest/scenario.js
//   k6 run -e MODE=raw -e VUS=50 loadtest/scenario.js   # no think time: max throughput
import http from "k6/http";
import { check, sleep } from "k6";
import { SharedArray } from "k6/data";

const BASE_URL = __ENV.BASE_URL || "http://localhost:3200";
const VUS = Number(__ENV.VUS || 50);
const DURATION = __ENV.DURATION || "3m";
const RAMP = __ENV.RAMP || "30s";
// "browser" (default): requests exactly as a real browser makes them — see
//   the recording notes below. "fullpage": a full page load on every step
//   (the original scenario; more pessimistic). "raw": one endpoint, no think
//   time. ("realistic" is kept as an alias of "fullpage" for old commands.)
const MODE = __ENV.MODE === "realistic" ? "fullpage" : __ENV.MODE || "browser";
// browser mode: loops per visit. Each visit starts with a full page load
// (plus the link prefetches it triggers); the rest are in-app navigations.
const VISIT_LOOPS = Number(__ENV.VISIT_LOOPS || 5);
// Secure cookie name when testing an https deployment.
const COOKIE_NAME = BASE_URL.startsWith("https://") ? "__Secure-authjs.session-token" : "authjs.session-token";

// SharedArray: parsed once and shared read-only by every VU. A plain
// JSON.parse(open(...)) here runs once *per VU* (init code is per-VU in k6),
// which at 400+ VUs got k6 itself killed for memory.
const users = new SharedArray("users", () => JSON.parse(open("./users.json")).users);
const actions = new SharedArray("actions", () => [JSON.parse(open("./users.json")).actions || {}])[0];

export const options = {
  scenarios: {
    users: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: RAMP, target: VUS },
        { duration: DURATION, target: VUS },
        { duration: "10s", target: 0 },
      ],
      gracefulRampDown: "10s",
    },
  },
  // Same pass/fail bar as the video: p95 < 500ms, p99 < 1s, < 1% errors.
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
    // No-op thresholds, only so the end-of-run summary breaks latency down
    // per endpoint — that's what tells you *which* request to optimize.
    "http_req_duration{name:page:/dashboard}": [],
    "http_req_duration{name:nav:/dashboard}": [],
    "http_req_duration{name:nav:/dashboard/invoices}": [],
    "http_req_duration{name:nav:/dashboard/clients}": [],
    "http_req_duration{name:prefetch}": [],
    "http_req_duration{name:page:/dashboard/invoices}": [],
    "http_req_duration{name:page:/dashboard/clients}": [],
    "http_req_duration{name:api:chart-data}": [],
    "http_req_duration{name:api:invoice-pdf}": [],
    "http_req_duration{name:action:markAsPaid}": [],
    "http_req_duration{name:action:createInvoice}": [],
  },
  summaryTrendStats: ["avg", "med", "p(90)", "p(95)", "p(99)", "max"],
  // Server actions answer with redirects we want to see, not follow.
  maxRedirects: 0,
};

function between(min, max) {
  return min + Math.random() * (max - min);
}

function think(min, max) {
  if (MODE !== "raw") sleep(between(min, max));
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function params(user, name, extraHeaders = {}) {
  return {
    headers: { Cookie: `${COOKIE_NAME}=${user.token}`, ...extraHeaders },
    tags: { name },
    redirects: 0,
  };
}

function ok(res, name) {
  // A 3xx to /login or /onboarding means the seeded session isn't valid —
  // that's a test setup failure, not a pass.
  return check(res, {
    [`${name} 2xx`]: (r) => r.status >= 200 && r.status < 300,
  });
}

// Server actions are plain POSTs with a `Next-Action` header naming the
// action ID and the arguments React-encoded in the body. This is what the
// browser sends when a form is submitted.
function callAction(user, name, actionId, body, contentTypeHeader) {
  const headers = { "Next-Action": actionId, Accept: "text/x-component" };
  if (contentTypeHeader) headers["Content-Type"] = contentTypeHeader;
  const res = http.post(`${BASE_URL}/dashboard/invoices`, body, params(user, name, headers));
  // markAsPaid ends in redirect() — Next reports that as 303 (or 200 with an
  // x-action-redirect header when handled by the client router).
  check(res, { [`${name} ok`]: (r) => (r.status >= 200 && r.status < 400) });
  return res;
}

function createInvoice(user) {
  // Mirrors React's encodeReply() for (prevState=null, formData): the
  // FormData's entries prefixed "_1_" (its reference id), then the argument
  // list in field "0". Order matters — the server decodes the stream and
  // materializes the FormData from fields already seen when "0" arrives.
  const fields = {
    invoiceName: "Load test invoice",
    total: "300",
    status: "PENDING",
    date: new Date().toISOString(),
    dueDate: "14",
    fromName: "Load User",
    fromEmail: user.email,
    fromAddress: "1 Benchmark Road",
    clientId: user.clientId,
    currency: "USD",
    // Seconds since epoch fits the Int column and never repeats for one VU.
    invoiceNumber: String(Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1000)),
    items: JSON.stringify([{ description: "Load", quantity: 3, rate: 100 }]),
    sendEmail: "false",
  };
  // An array, not an object: JS always orders integer-like keys ("0") first.
  const parts = Object.entries(fields).map(([k, v]) => [`_1_${k}`, v]);
  parts.push(["0", JSON.stringify([null, "$K1"])]);
  // Must be multipart (k6 would send a plain object urlencoded, which Next
  // doesn't treat as an action call).
  const boundary = "----k6loadtest" + Math.random().toString(16).slice(2);
  const body =
    parts
      .map(([k, v]) => `--${boundary}\r\nContent-Disposition: form-data; name="${k}"\r\n\r\n${v}\r\n`)
      .join("") + `--${boundary}--\r\n`;
  return callAction(user, "action:createInvoice", actions.createInvoice, body, `multipart/form-data; boundary=${boundary}`);
}

function markAsPaid(user) {
  const invoice = pick(user.invoices);
  return callAction(user, "action:markAsPaid", actions.markAsPaid, JSON.stringify([invoice.id]), "text/plain;charset=UTF-8");
}

// ── browser mode ─────────────────────────────────────────────────────────────
// Recorded from a real Chromium session (Playwright) doing this loop:
// - landing on /dashboard = full HTML page + chart-data fetch + one prefetch
//   per sidebar link (Next preloads visible <Link>s), sent together;
// - every later click = an RSC request (`RSC: 1`) carrying the router state
//   tree, which lets the server skip re-rendering the shared layout.
// The trees are generic route shapes (no user/session data).
const TREE = {
  landing: encodeURIComponent('["",{"children":["dashboard",{"children":["__PAGE__",{},null,null]},null,null]},null,null,true]'),
  toDashboard: encodeURIComponent('["",{"children":["dashboard",{"children":["__PAGE__",{},null,"refetch"]},null,null]},null,null]'),
  toInvoices: encodeURIComponent('["",{"children":["dashboard",{"children":["invoices",{"children":["__PAGE__",{},null,"refetch"]},null,null]},null,null]},null,null]'),
  toClients: encodeURIComponent('["",{"children":["dashboard",{"children":["clients",{"children":["__PAGE__",{},null,"refetch"]},null,null]},null,null]},null,null]'),
};
const PREFETCHED_LINKS = ["/", "/dashboard/invoices", "/dashboard/clients", "/dashboard/billing", "/dashboard/recurring-invoices", "/dashboard/reports"];

function rscId() {
  return Math.random().toString(36).slice(2, 7);
}

function navigate(user, path, tree, name) {
  const res = http.get(
    `${BASE_URL}${path}${path.includes("?") ? "&" : "?"}_rsc=${rscId()}`,
    params(user, name, { RSC: "1", "Next-Router-State-Tree": tree })
  );
  ok(res, name);
  return res;
}

function landOnDashboard(user) {
  ok(http.get(`${BASE_URL}/dashboard`, params(user, "page:/dashboard")), "dashboard");
  const batch = [
    ["GET", `${BASE_URL}/api/dashboard/chart-data?range=30&status=PAID`, null, params(user, "api:chart-data")],
    ...PREFETCHED_LINKS.map((p) => [
      "GET",
      `${BASE_URL}${p}?_rsc=${rscId()}`,
      null,
      params(user, "prefetch", { RSC: "1", "Next-Router-Prefetch": "1", "Next-Router-State-Tree": TREE.landing }),
    ]),
  ];
  for (const res of http.batch(batch)) ok(res, "landing");
}

let loopsInVisit = 0; // per VU (each VU has its own JS runtime)

function browserLoop(user) {
  if (loopsInVisit % VISIT_LOOPS === 0) {
    landOnDashboard(user);
  } else {
    navigate(user, "/dashboard", TREE.toDashboard, "nav:/dashboard");
    ok(http.get(`${BASE_URL}/api/dashboard/chart-data?range=30&status=PAID`, params(user, "api:chart-data")), "chart");
  }
  loopsInVisit++;
  think(3, 7);

  navigate(user, "/dashboard/invoices", TREE.toInvoices, "nav:/dashboard/invoices");
  think(3, 8);

  const r = Math.random();
  if (r < 0.25) {
    navigate(user, "/dashboard/clients", TREE.toClients, "nav:/dashboard/clients");
  } else if (r < 0.35) {
    const invoice = pick(user.invoices);
    ok(http.get(`${BASE_URL}/api/invoice/${invoice.id}?token=${invoice.pdfToken}`, params(user, "api:invoice-pdf")), "pdf");
  } else if (r < 0.43 && actions.markAsPaid) {
    markAsPaid(user);
  } else if (r < 0.46 && actions.createInvoice) {
    createInvoice(user);
  }
  think(5, 15);
}

export default function () {
  // __VU is 1-based. Wrap so more VUs than seeded users still works.
  const user = users[(__VU - 1) % users.length];

  if (MODE === "raw") {
    // One endpoint, no think time: its max throughput / CPU cost per request.
    // ENDPOINT=pdf hits a random invoice's public signed link.
    const endpoint = __ENV.ENDPOINT || "/dashboard";
    if (endpoint === "pdf") {
      const invoice = pick(user.invoices);
      ok(http.get(`${BASE_URL}/api/invoice/${invoice.id}?token=${invoice.pdfToken}`, params(user, "api:invoice-pdf")), "pdf");
    } else {
      ok(http.get(`${BASE_URL}${endpoint}`, params(user, `page:${endpoint}`)), endpoint);
    }
    return;
  }

  if (MODE === "browser") {
    browserLoop(user);
    return;
  }

  // fullpage mode: a full page load on every step.
  ok(http.get(`${BASE_URL}/dashboard`, params(user, "page:/dashboard")), "dashboard");
  ok(http.get(`${BASE_URL}/api/dashboard/chart-data?range=30&status=PAID`, params(user, "api:chart-data")), "chart");
  think(3, 7);

  ok(http.get(`${BASE_URL}/dashboard/invoices`, params(user, "page:/dashboard/invoices")), "invoices");
  think(3, 8);

  const r = Math.random();
  if (r < 0.25) {
    ok(http.get(`${BASE_URL}/dashboard/clients`, params(user, "page:/dashboard/clients")), "clients");
  } else if (r < 0.35) {
    const invoice = pick(user.invoices);
    ok(http.get(`${BASE_URL}/api/invoice/${invoice.id}?token=${invoice.pdfToken}`, params(user, "api:invoice-pdf")), "pdf");
  } else if (r < 0.43 && actions.markAsPaid) {
    markAsPaid(user);
  } else if (r < 0.46 && actions.createInvoice) {
    createInvoice(user);
  }
  think(5, 15);
}
