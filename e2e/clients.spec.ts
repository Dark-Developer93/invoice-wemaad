import { test, expect } from "@playwright/test";

test.use({ storageState: "e2e/.auth/user.json" });

test("create, edit, and delete a client", async ({ page }) => {
  const clientName = `E2E Client ${Date.now()}`;
  const updatedName = `${clientName} (updated)`;

  await page.goto("/dashboard/clients");

  // ── Create ──────────────────────────────────────────────────────────────
  await page.getByRole("button", { name: "Add Client" }).first().click();
  const createDialog = page.getByRole("dialog");
  await expect(createDialog).toBeVisible();

  await createDialog.getByLabel("Name").fill(clientName);

  await createDialog.getByRole("tab", { name: "Addresses" }).click();
  await createDialog.getByLabel("Street").fill("123 Test St");
  await createDialog.getByLabel("City").fill("Testville");
  await createDialog.getByLabel("Country").fill("Testland");
  await createDialog.getByLabel("ZIP/Postal Code").fill("12345");

  await createDialog.getByRole("tab", { name: "Contacts" }).click();
  await createDialog.getByRole("button", { name: "Add Contact Person" }).click();
  await createDialog.getByLabel("First Name").fill("Jane");
  await createDialog.getByLabel("Last Name").fill("Doe");
  await createDialog.getByLabel("Email").fill("jane.doe@example.test");

  await createDialog.getByRole("button", { name: "Create Client" }).click();
  await expect(createDialog).toBeHidden();
  await expect(page.getByRole("table").getByText(clientName, { exact: true })).toBeVisible();

  // ── Edit ────────────────────────────────────────────────────────────────
  const row = page.getByRole("row").filter({ hasText: clientName });
  await row.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Edit Client" }).click();

  const editDialog = page.getByRole("dialog");
  await expect(editDialog).toBeVisible();
  await editDialog.getByLabel("Name").fill(updatedName);
  await editDialog.getByRole("button", { name: "Update Client" }).click();
  await expect(editDialog).toBeHidden();
  await expect(page.getByRole("table").getByText(updatedName, { exact: true })).toBeVisible();

  // ── Delete ──────────────────────────────────────────────────────────────
  const updatedRow = page.getByRole("row").filter({ hasText: updatedName });
  await updatedRow.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("menuitem", { name: "Delete Client" }).click();
  await expect(page).toHaveURL(/\/delete$/);
  await page.getByRole("button", { name: "Delete Client" }).click();
  await expect(page).toHaveURL(/\/dashboard\/clients$/);
  await expect(page.getByRole("table").getByText(updatedName, { exact: true })).toHaveCount(0);
});
