import { createHmac } from "crypto";
import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { E2E_USER_EMAIL } from "./global-setup";

// The link in an invoice email is opened by the user's *customer*, who has no
// account and no session. It's authorized only by the HMAC token in the URL
// (lib/urls.ts). These tests run in a browser context with no cookies at all
// to make sure nothing (middleware, auth changes, route refactors) ever puts
// that link behind a login.

// Same scheme as lib/urls.ts hmacToken(); the server must run with the same
// AUTH_SECRET as this process (true for `next start` from playwright.config).
function tokenFor(invoiceId: string): string {
  return createHmac("sha256", process.env.AUTH_SECRET!).update(invoiceId).digest("hex");
}

let invoiceId: string;
let clientId: string;

test.beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_USER_EMAIL } });
    const client = await prisma.client.create({
      data: { userId: user.id, name: `E2E Share Link Client ${Date.now()}` },
    });
    clientId = client.id;
    const invoice = await prisma.invoice.create({
      data: {
        userId: user.id,
        clientId,
        invoiceName: "Share link test",
        invoiceNumber: 900000 + Math.floor(Math.random() * 99999),
        status: "PENDING",
        date: new Date(),
        dueDate: 14,
        fromName: "E2E User",
        fromEmail: E2E_USER_EMAIL,
        fromAddress: "1 Test Street",
        currency: "USD",
        items: [{ description: "Consulting", quantity: 2, rate: 150 }],
        total: 300,
      },
    });
    invoiceId = invoice.id;
  } finally {
    await prisma.$disconnect();
  }
});

test.afterAll(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.invoice.deleteMany({ where: { clientId } });
    await prisma.client.delete({ where: { id: clientId } }).catch(() => {});
  } finally {
    await prisma.$disconnect();
  }
});

test.describe("public invoice share link (customer without an account)", () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test("opens the PDF with a valid token and no session", { tag: "@smoke" }, async ({ request, context }) => {
    expect(await context.cookies()).toHaveLength(0);

    const res = await request.get(`/api/invoice/${invoiceId}?token=${tokenFor(invoiceId)}`, {
      maxRedirects: 0,
    });

    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    // inline: the browser shows it, and the customer can still save it.
    expect(res.headers()["content-disposition"]).toContain("inline");
    expect((await res.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("rejects a missing or tampered token", { tag: "@smoke" }, async ({ request }) => {
    const missing = await request.get(`/api/invoice/${invoiceId}`, { maxRedirects: 0 });
    expect(missing.status()).toBe(401);

    const tampered = tokenFor(invoiceId).slice(0, -4) + "0000";
    const bad = await request.get(`/api/invoice/${invoiceId}?token=${tampered}`, { maxRedirects: 0 });
    expect(bad.status()).toBe(401);
  });
});
