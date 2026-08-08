import { test, expect } from "@playwright/test";
import { PrismaClient } from "@prisma/client";

test.use({ storageState: "e2e/.auth/admin.json" });

// Reset the STARTER plan config back to its seeded defaults before each
// test so this file doesn't depend on run order or leak state to others
// (the billing-upgrade spec reads STARTER's price/limits too).
test.beforeEach(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.planConfig.update({
      where: { plan: "STARTER" },
      data: { price: 9, invoiceLimit: 25, emailLimit: 50 },
    });
  } finally {
    await prisma.$disconnect();
  }
});

test("admin can see platform insights", async ({ page }) => {
  await page.goto("/admin/insights");
  await expect(page.getByRole("heading", { name: "Insights" })).toBeVisible();
  await expect(page.getByText("Total Users")).toBeVisible();
  await expect(page.getByText("Plan Distribution")).toBeVisible();
});

test("admin can edit a plan's price and it takes effect on the billing page", async ({
  page,
}) => {
  await page.goto("/admin/plans");
  await expect(page.getByRole("heading", { name: "Pricing Plans" })).toBeVisible();

  await page.locator("#STARTER-price").fill("19");
  await page.locator("#STARTER-save").click();
  await expect(page.getByText("Starter plan updated.")).toBeVisible();

  // Verify the new price is actually enforced/displayed, not just saved —
  // load a fresh page as a regular user and check the billing page.
  const userCtx = await page.context().browser()!.newContext({
    storageState: "e2e/.auth/user.json",
  });
  const userPage = await userCtx.newPage();
  await userPage.goto("/dashboard/billing");
  await expect(userPage.getByText("$19", { exact: false }).first()).toBeVisible();
  await userCtx.close();
});
