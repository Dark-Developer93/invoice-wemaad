import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { E2E_USER_EMAIL } from "./global-setup";

// Server-side pagination (lib/pagination.ts) on the invoice list and the
// admin user list: page size, Next/Previous, and that the admin summary
// cards still count every user, not just the visible page.

const stamp = Date.now();
const INVOICE_PAGE_SIZE = 20;
const ADMIN_PAGE_SIZE = 25;

test.describe("invoice list pagination", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  const clientName = `E2E Pagination Client ${stamp}`;

  // Business plan for this spec only, so the Free plan's client (3) and
  // monthly invoice (5) limits can't interfere; billing-upgrade.spec resets
  // the user to FREE on its own, and afterAll restores it here too.
  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.user.update({ where: { email: E2E_USER_EMAIL }, data: { plan: "BUSINESS" } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_USER_EMAIL } });
      const clients = await prisma.client.findMany({ where: { userId: user.id, name: clientName } });
      const ids = clients.map((c) => c.id);
      await prisma.invoice.deleteMany({ where: { clientId: { in: ids } } });
      await prisma.client.deleteMany({ where: { id: { in: ids } } });
      await prisma.user.update({ where: { id: user.id }, data: { plan: "FREE" } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test("pages through invoices 20 at a time, newest first", async ({ page }) => {
    // The client is created through the app so the (cached) client picker in
    // the invoice form shows it — see CLAUDE.md's E2E notes.
    await page.goto("/dashboard/clients", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Add Client" }).first().click();
    const clientDialog = page.getByRole("dialog");
    await clientDialog.getByLabel("Name").fill(clientName);
    await clientDialog.getByRole("tab", { name: "Addresses" }).click();
    await clientDialog.getByLabel("Street").fill("1 Page St");
    await clientDialog.getByLabel("City").fill("Testville");
    await clientDialog.getByLabel("Country").fill("Testland");
    await clientDialog.getByLabel("ZIP/Postal Code").fill("100");
    await clientDialog.getByRole("tab", { name: "Contacts" }).click();
    await clientDialog.getByRole("button", { name: "Add Contact Person" }).click();
    await clientDialog.getByLabel("First Name").fill("Page");
    await clientDialog.getByLabel("Last Name").fill("Tester");
    await clientDialog.getByLabel("Email").fill(`page-${stamp}@example.test`);
    await clientDialog.getByRole("button", { name: "Create Client" }).click();
    await expect(clientDialog).toBeHidden();

    // 20 older invoices inserted directly (fast); the one created through the
    // app below both makes it 2 pages and invalidates the cached list so
    // these become visible.
    const prisma = new PrismaClient();
    const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_USER_EMAIL } });
    const client = await prisma.client.findFirstOrThrow({ where: { userId: user.id, name: clientName } });
    const twoMonthsAgo = Date.now() - 60 * 24 * 60 * 60 * 1000;
    await prisma.invoice.createMany({
      data: Array.from({ length: INVOICE_PAGE_SIZE }, (_, i) => ({
        userId: user.id,
        clientId: client.id,
        invoiceName: `Pagination ${i}`,
        invoiceNumber: 600000 + (stamp % 9999) * 100 + i,
        status: "PENDING" as const,
        date: new Date(twoMonthsAgo),
        createdAt: new Date(twoMonthsAgo - i * 60_000),
        dueDate: 14,
        fromName: "E2E User",
        fromEmail: E2E_USER_EMAIL,
        fromAddress: "1 Test Street",
        currency: "USD",
        items: [{ description: "x", quantity: 1, rate: 10 }],
        total: 10,
      })),
    });
    await prisma.$disconnect();

    const newestName = `E2E Newest ${stamp}`;
    await page.goto("/dashboard/invoices", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Create Invoice" }).first().click();
    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Enter invoice name").fill(newestName);
    await dialog.getByRole("combobox").last().click();
    await page.getByRole("option", { name: clientName }).click();
    await dialog.getByPlaceholder("Your Address").fill("1 Test Street");
    await dialog.getByPlaceholder("Item name & description").fill("Newest");
    await dialog.locator("#send-email").click();
    await dialog.getByRole("button", { name: "Create Invoice" }).click();
    await expect(dialog).toBeHidden();

    const countDb = new PrismaClient();
    const total = await countDb.invoice.count({ where: { userId: user.id } });
    await countDb.$disconnect();
    const pageCount = Math.ceil(total / INVOICE_PAGE_SIZE);
    expect(pageCount).toBeGreaterThanOrEqual(2);

    await page.goto("/dashboard/invoices", { waitUntil: "networkidle" });
    const bodyRows = page.locator("table tbody tr");
    await expect(bodyRows).toHaveCount(INVOICE_PAGE_SIZE);
    // Newest first: the invoice just created leads page 1.
    await expect(bodyRows.first()).toContainText(clientName);
    await expect(page.getByText(`Page 1 of ${pageCount}`)).toBeVisible();
    await expect(page.getByRole("button", { name: "Previous" })).toBeDisabled();

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/\/dashboard\/invoices\?page=2$/);
    await expect(page.getByText(`Page 2 of ${pageCount}`)).toBeVisible();
    await expect(bodyRows).toHaveCount(Math.min(INVOICE_PAGE_SIZE, total - INVOICE_PAGE_SIZE));

    await page.getByRole("link", { name: "Previous" }).click();
    await expect(page).toHaveURL(/\/dashboard\/invoices$/);
    await expect(page.getByText(`Page 1 of ${pageCount}`)).toBeVisible();

    // A stale or hand-edited link shows a real page, never an empty table.
    await page.goto("/dashboard/invoices?page=9999", { waitUntil: "networkidle" });
    await expect(page.getByText(`Page ${pageCount} of ${pageCount}`)).toBeVisible();
    await expect(bodyRows.first()).toBeVisible();
    await page.goto("/dashboard/invoices?page=abc", { waitUntil: "networkidle" });
    await expect(page.getByText(`Page 1 of ${pageCount}`)).toBeVisible();
  });
});

test.describe("admin user list pagination", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  const emails = Array.from({ length: ADMIN_PAGE_SIZE + 1 }, (_, i) => `e2e-page-${stamp}-${i}@example.test`);

  test.beforeAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.user.createMany({
        data: emails.map((email, i) => ({
          email,
          firstName: "Paged",
          lastName: `User ${i}`,
          address: "1 Test Street",
          isActive: i % 2 === 0,
        })),
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  test.afterAll(async () => {
    const prisma = new PrismaClient();
    try {
      await prisma.user.deleteMany({ where: { email: { in: emails } } });
    } finally {
      await prisma.$disconnect();
    }
  });

  test("pages users 25 at a time; summary cards count every user", async ({ page }) => {
    const prisma = new PrismaClient();
    const [total, active] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
    ]);
    await prisma.$disconnect();
    const pageCount = Math.ceil(total / ADMIN_PAGE_SIZE);

    await page.goto("/admin/users", { waitUntil: "networkidle" });
    await expect(page.locator("table tbody tr")).toHaveCount(ADMIN_PAGE_SIZE);
    await expect(page.getByText(`Page 1 of ${pageCount}`)).toBeVisible();

    // Totals reflect the whole platform, not the 25 rows on screen.
    // Each summary card's text starts with its title, then the number.
    const card = (title: RegExp) => page.locator(".rounded-xl").filter({ hasText: title });
    await expect(card(/^Total Users/)).toContainText(String(total));
    await expect(card(/^Active/)).toContainText(String(active));

    await page.getByRole("link", { name: "Next" }).click();
    await expect(page).toHaveURL(/\/admin\/users\?page=2$/);
    await expect(page.getByText(`Page 2 of ${pageCount}`)).toBeVisible();
    await expect(page.locator("table tbody tr")).toHaveCount(Math.min(ADMIN_PAGE_SIZE, total - ADMIN_PAGE_SIZE));
  });
});
