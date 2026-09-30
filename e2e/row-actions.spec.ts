import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { E2E_USER_EMAIL } from "./global-setup";

// Row-menu actions the CRUD specs don't reach. Their dialogs mount on first
// open (useMountOnFirstOpen) instead of once per row up front, and the PDF
// download goes through the rewritten, owner-scoped generateInvoicePDF
// action — so this guards both refactors from the user's side.
//
// All data is created through the app itself (not inserted with Prisma):
// the client and invoice lists are served from Next's data cache, which only
// the app's own mutations invalidate, so rows inserted behind its back may
// not appear.

test.use({ storageState: "e2e/.auth/user.json" });

const stamp = Date.now();
const clientName = `E2E Row Actions Client ${stamp}`;
const invoiceName = `E2E Row Actions Invoice ${stamp}`;

test.afterAll(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_USER_EMAIL } });
    const clients = await prisma.client.findMany({ where: { userId: user.id, name: clientName } });
    const ids = clients.map((c) => c.id);
    await prisma.invoice.deleteMany({ where: { clientId: { in: ids } } });
    await prisma.client.deleteMany({ where: { id: { in: ids } } });
  } finally {
    await prisma.$disconnect();
  }
});

test("client and invoice row menus: quick view, create from row, view, download", async ({ page }) => {
  // ── Client (created through the UI) ───────────────────────────────────────
  await page.goto("/dashboard/clients", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Add Client" }).first().click();
  const createClient = page.getByRole("dialog");
  await createClient.getByLabel("Name").fill(clientName);
  // Same required fields as clients.spec.ts (the form validates across tabs).
  await createClient.getByRole("tab", { name: "Addresses" }).click();
  await createClient.getByLabel("Street").fill("9 Row St");
  await createClient.getByLabel("City").fill("Testville");
  await createClient.getByLabel("Country").fill("Testland");
  await createClient.getByLabel("ZIP/Postal Code").fill("999");
  await createClient.getByRole("tab", { name: "Contacts" }).click();
  await createClient.getByRole("button", { name: "Add Contact Person" }).click();
  await createClient.getByLabel("First Name").fill("Row");
  await createClient.getByLabel("Last Name").fill("Tester");
  await createClient.getByLabel("Email").fill(`row-actions-${stamp}@example.test`);
  await createClient.getByRole("button", { name: "Create Client" }).click();
  await expect(createClient).toBeHidden();
  const clientRow = page.getByRole("row").filter({ hasText: clientName });
  await expect(clientRow).toBeVisible();

  // ── Client quick view ───────────────────────────────────────────────────
  await clientRow.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Quick View" }).click();
  const viewClient = page.getByRole("dialog");
  await expect(viewClient.getByText("Client Details")).toBeVisible();
  await expect(viewClient.getByText(clientName)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(viewClient).toBeHidden();

  // ── Create an invoice from the client's row (client comes preselected) ──
  await clientRow.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Create Invoice" }).click();
  const createInvoice = page.getByRole("dialog");
  await expect(createInvoice.getByRole("combobox").filter({ hasText: clientName })).toBeVisible();
  await createInvoice.getByPlaceholder("Enter invoice name").fill(invoiceName);
  await createInvoice.getByPlaceholder("Your Address").fill("1 Test Street");
  await createInvoice.getByPlaceholder("Item name & description").fill("Row action work");
  await createInvoice.locator("#send-email").click(); // dummy SMTP in tests
  await createInvoice.getByRole("button", { name: "Create Invoice" }).click();
  await expect(createInvoice).toBeHidden();

  // ── Invoice: view dialog, twice (mounted on first open, then reused) ─────
  await page.goto("/dashboard/invoices", { waitUntil: "networkidle" });
  const invoiceRow = page.getByRole("row").filter({ hasText: clientName });
  await expect(invoiceRow).toBeVisible();
  for (let i = 0; i < 2; i++) {
    await invoiceRow.locator("button").first().click();
    await page.getByRole("menuitem", { name: "View Invoice" }).click();
    const viewInvoice = page.getByRole("dialog");
    await expect(viewInvoice.getByText(invoiceName)).toBeVisible();
    await expect(viewInvoice.getByText(clientName)).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(viewInvoice).toBeHidden();
  }

  // ── Invoice: download the PDF (owner-scoped server action) ─────────────
  await invoiceRow.locator("button").first().click();
  const [download] = await Promise.all([
    page.waitForEvent("download"),
    page.getByRole("menuitem", { name: "Download Invoice" }).click(),
  ]);
  expect(download.suggestedFilename()).toBe(`invoice-${invoiceName}.pdf`);
  const chunks: Buffer[] = [];
  for await (const chunk of await download.createReadStream()) chunks.push(chunk as Buffer);
  expect(Buffer.concat(chunks).subarray(0, 5).toString()).toBe("%PDF-");
});
