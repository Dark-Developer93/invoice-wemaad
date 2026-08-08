import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { E2E_USER_EMAIL } from "./global-setup";

test.use({ storageState: "e2e/.auth/user.json" });

let clientId: string;
let clientName: string;

test.beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_USER_EMAIL } });
    clientName = `E2E Invoice Client ${Date.now()}`;
    const client = await prisma.client.create({
      data: { userId: user.id, name: clientName },
    });
    clientId = client.id;
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

test("create, edit, mark as paid, and delete an invoice", async ({ page }) => {
  const invoiceName = `E2E Invoice ${Date.now()}`;

  await page.goto("/dashboard/invoices");

  // ── Create ──────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Create Invoice" }).first().click();
  const createDialog = page.getByRole("dialog");
  await expect(createDialog).toBeVisible();

  await createDialog.getByPlaceholder("Enter invoice name").fill(invoiceName);
  await createDialog.getByRole("combobox").last().click();
  await page.getByRole("option", { name: clientName }).click();
  await createDialog.getByPlaceholder("Your Address").fill("456 Sender Ave, Testland");

  // The form already starts with one empty item row (quantity/rate default
  // to 1) — just fill its description.
  await createDialog.getByPlaceholder("Item name & description").fill("E2E test service");

  // Skip the (non-functional, dummy-SMTP) email send in this environment.
  await createDialog.locator("#send-email").click();

  await createDialog.getByRole("button", { name: "Create Invoice" }).click();
  await expect(createDialog).toBeHidden();
  await expect(page.getByRole("table").getByText(clientName).first()).toBeVisible();

  // ── Edit ────────────────────────────────────────────────────────────────
  const row = page.getByRole("row").filter({ hasText: clientName });
  await row.locator("button").first().click();
  await page.getByRole("menuitem", { name: "Edit Invoice" }).click();

  const editDialog = page.getByRole("dialog");
  await expect(editDialog).toBeVisible();
  const updatedName = `${invoiceName} (updated)`;
  await editDialog.getByPlaceholder("Enter invoice name").fill(updatedName);
  await editDialog.locator("#send-email").click();
  await editDialog.getByRole("button", { name: "Update Invoice" }).click();
  await expect(editDialog).toBeHidden();

  // ── Mark as paid ────────────────────────────────────────────────────────
  const updatedRow = page.getByRole("row").filter({ hasText: clientName });
  await updatedRow.locator("button").first().click();
  await page.getByRole("menuitem", { name: "Mark as Paid" }).click();
  await expect(page).toHaveURL(/\/paid$/);
  await page.getByRole("button", { name: "Mark as Paid" }).click();
  await expect(page).toHaveURL(/\/dashboard\/invoices$/);
  await expect(page.getByRole("row").filter({ hasText: clientName }).getByText("PAID")).toBeVisible();

  // ── Delete ──────────────────────────────────────────────────────────────
  const paidRow = page.getByRole("row").filter({ hasText: clientName });
  await paidRow.locator("button").first().click();
  await page.getByRole("menuitem", { name: "Delete Invoice" }).click();
  await expect(page).toHaveURL(/\/delete$/);
  await page.getByRole("button", { name: "Delete Invoice" }).click();
  await expect(page).toHaveURL(/\/dashboard\/invoices$/);
  await expect(page.getByRole("row").filter({ hasText: clientName })).toHaveCount(0);
});
