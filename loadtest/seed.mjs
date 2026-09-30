// Seeds a disposable database with load-test users, clients, invoices and a
// pre-authenticated Session row per user, then writes loadtest/users.json for
// k6 to read.
//
// Auth is bypassed exactly like e2e/global-setup.ts: Auth.js's database
// session strategy uses the session cookie value as a literal lookup key into
// Session.sessionToken, so a known token in the DB + the same value in the
// `authjs.session-token` cookie is a real, fully-validated session. Nothing in
// lib/auth.ts changes for this.
//
// It also resolves the server-action IDs for createInvoice/markAsPaid from the
// production build's manifest (so run `next build` first), letting k6 call
// them the same way the browser does.
//
// NEVER point this at a database with real data.
//
// Usage:
//   DATABASE_URL=... AUTH_SECRET=... node loadtest/seed.mjs [users=2000] [invoicesPerUser=40]

import { randomBytes, createHmac } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const LOADTEST_EMAIL_DOMAIN = "loadtest.example.test";

const USERS = Number(process.argv[2] ?? 2000);
const INVOICES_PER_USER = Number(process.argv[3] ?? 40);
const CLIENTS_PER_USER = 5;
const SESSION_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const BATCH = 200;

if (!process.env.AUTH_SECRET) {
  throw new Error("AUTH_SECRET must be set (same value the server runs with) to sign PDF links");
}

// Mirrors lib/urls.ts hmacToken() so k6 can request PDFs through the
// public signed-link route.
function pdfToken(invoiceId) {
  return createHmac("sha256", process.env.AUTH_SECRET).update(invoiceId).digest("hex");
}

function resolveActionIds() {
  const manifestPath = path.join(__dirname, "..", ".next", "server", "server-reference-manifest.json");
  if (!existsSync(manifestPath)) {
    console.warn("No production build found — write scenarios (createInvoice/markAsPaid) will be skipped.");
    return {};
  }
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const ids = {};
  for (const [id, entry] of Object.entries(manifest.node ?? {})) {
    if (entry.filename === "app/actions/invoices.ts" && ["createInvoice", "markAsPaid"].includes(entry.exportedName)) {
      ids[entry.exportedName] = id;
    }
  }
  return ids;
}

function daysAgo(n) {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function main() {
  const prisma = new PrismaClient();
  const started = Date.now();

  try {
    const users = [];
    for (let start = 0; start < USERS; start += BATCH) {
      const count = Math.min(BATCH, USERS - start);
      const batchUsers = Array.from({ length: count }, (_, j) => {
        const i = start + j;
        return {
          id: `lt_user_${i}`,
          email: `lt-user-${i}@${LOADTEST_EMAIL_DOMAIN}`,
          firstName: "Load",
          lastName: `User ${i}`,
          address: `${i} Benchmark Road`,
          companyName: `Load Co ${i}`,
          // Unlimited invoices + analytics, so writes never hit a plan limit
          // and the dashboard renders its full (heaviest) variant.
          plan: "BUSINESS",
          emailVerified: new Date(),
        };
      });
      await prisma.user.createMany({ data: batchUsers, skipDuplicates: true });

      const sessions = batchUsers.map((u) => ({
        sessionToken: randomBytes(32).toString("hex"),
        userId: u.id,
        expires: new Date(Date.now() + SESSION_MAX_AGE_MS),
      }));
      await prisma.session.deleteMany({ where: { userId: { in: batchUsers.map((u) => u.id) } } });
      await prisma.session.createMany({ data: sessions });

      const clients = batchUsers.flatMap((u, j) =>
        Array.from({ length: CLIENTS_PER_USER }, (_, c) => ({
          id: `${u.id}_client_${c}`,
          userId: u.id,
          name: `Client ${c} of ${u.lastName}`,
          email: `client-${c}-${start + j}@${LOADTEST_EMAIL_DOMAIN}`,
          tags: ["loadtest"],
        }))
      );
      await prisma.client.createMany({ data: clients, skipDuplicates: true });
      await prisma.address.createMany({
        data: clients.map((c) => ({
          id: `${c.id}_addr`,
          clientId: c.id,
          type: "BILLING",
          street: "1 Main St",
          city: "Berlin",
          country: "DE",
          zipCode: "10115",
          isDefault: true,
        })),
        skipDuplicates: true,
      });

      const invoices = batchUsers.flatMap((u) =>
        Array.from({ length: INVOICES_PER_USER }, (_, n) => {
          const qty = 1 + (n % 5);
          const rate = 50 + ((n * 37) % 450);
          const created = daysAgo((n * 3) % 120);
          return {
            id: `${u.id}_inv_${n}`,
            userId: u.id,
            clientId: `${u.id}_client_${n % CLIENTS_PER_USER}`,
            invoiceName: `Invoice ${n + 1}`,
            invoiceNumber: n + 1,
            status: n % 3 === 0 ? "PENDING" : "PAID",
            date: created,
            createdAt: created,
            dueDate: 14,
            fromName: `Load ${u.lastName}`,
            fromEmail: u.email,
            fromAddress: u.address,
            currency: "USD",
            items: [
              { description: "Consulting", quantity: qty, rate },
              { description: "Support", quantity: 1, rate: 99 },
            ],
            total: qty * rate + 99,
          };
        })
      );
      await prisma.invoice.createMany({ data: invoices, skipDuplicates: true });

      for (let j = 0; j < batchUsers.length; j++) {
        const u = batchUsers[j];
        const invoiceIds = Array.from({ length: INVOICES_PER_USER }, (_, n) => `${u.id}_inv_${n}`);
        users.push({
          token: sessions[j].sessionToken,
          userId: u.id,
          email: u.email,
          clientId: `${u.id}_client_0`,
          // A handful per user is plenty for random picks; keeps users.json small.
          invoices: invoiceIds.slice(0, 10).map((id) => ({ id, pdfToken: pdfToken(id) })),
        });
      }
      process.stdout.write(`\rSeeded ${Math.min(start + BATCH, USERS)}/${USERS} users`);
    }

    const out = { actions: resolveActionIds(), users };
    writeFileSync(path.join(__dirname, "users.json"), JSON.stringify(out));
    console.log(
      `\nDone in ${((Date.now() - started) / 1000).toFixed(1)}s — ${USERS} users, ` +
        `${USERS * CLIENTS_PER_USER} clients, ${USERS * INVOICES_PER_USER} invoices. ` +
        `Actions: ${JSON.stringify(out.actions)}`
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
