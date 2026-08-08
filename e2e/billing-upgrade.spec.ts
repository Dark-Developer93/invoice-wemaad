import { test, expect, type Page } from "@playwright/test";
import { PrismaClient } from "@prisma/client";
import { E2E_USER_EMAIL } from "./global-setup";

let userId: string;

test.beforeAll(async () => {
  const prisma = new PrismaClient();
  try {
    const user = await prisma.user.findUniqueOrThrow({ where: { email: E2E_USER_EMAIL } });
    userId = user.id;
  } finally {
    await prisma.$disconnect();
  }
});

// Reset the E2E user back to FREE with no upgrade-request history before
// each test, so the two tests below don't depend on run order.
test.beforeEach(async () => {
  const prisma = new PrismaClient();
  try {
    await prisma.planUpgradeRequest.deleteMany({ where: { userId } });
    await prisma.user.update({ where: { id: userId }, data: { plan: "FREE" } });
  } finally {
    await prisma.$disconnect();
  }
});

async function requestUpgrade(userPage: Page) {
  await userPage.goto("/dashboard/billing");
  await userPage.getByRole("button", { name: "Request Upgrade" }).first().click();
  await expect(userPage.getByText("pending admin review")).toBeVisible();
}

test.describe("billing upgrade request", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("a user can request a plan upgrade and see it pending", async ({ page }) => {
    await requestUpgrade(page);
  });
});

test.describe("admin review of upgrade requests", () => {
  test("approving a request updates the user's plan", async ({ browser }) => {
    const userCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" });
    const userPage = await userCtx.newPage();
    await requestUpgrade(userPage);
    await userCtx.close();

    const adminCtx = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const adminPage = await adminCtx.newPage();
    await adminPage.goto(`/admin/users/${userId}`);
    await expect(adminPage.getByText("Plan Upgrade Requests").first()).toBeVisible();

    await adminPage.getByRole("button", { name: "Approve" }).click();
    const confirmDialog = adminPage.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Approve" }).click();
    await expect(adminPage.getByText("APPROVED", { exact: true })).toBeVisible();
    await adminCtx.close();

    const verifyCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" });
    const verifyPage = await verifyCtx.newPage();
    await verifyPage.goto("/dashboard/billing");
    await expect(verifyPage.getByText("pending admin review")).toHaveCount(0);
    await verifyCtx.close();
  });

  test("rejecting, then submitting a second request, leaves exactly one row: the new PENDING one", async ({
    browser,
  }) => {
    // Regression test for the requestPlanUpgrade race fix: the
    // reject-old-pending + create-new-pending sequence must be atomic per
    // user, so a reject followed by a fresh request never leaves two
    // PENDING rows or a PENDING row silently marked REJECTED.
    const userCtx = await browser.newContext({ storageState: "e2e/.auth/user.json" });
    const userPage = await userCtx.newPage();
    await requestUpgrade(userPage);

    const adminCtx = await browser.newContext({ storageState: "e2e/.auth/admin.json" });
    const adminPage = await adminCtx.newPage();
    await adminPage.goto(`/admin/users/${userId}`);
    await adminPage.getByRole("button", { name: "Reject" }).click();
    const confirmDialog = adminPage.getByRole("dialog");
    await expect(confirmDialog).toBeVisible();
    await confirmDialog.getByRole("button", { name: "Reject" }).click();
    await expect(adminPage.getByText("REJECTED", { exact: true })).toBeVisible();

    // User submits a fresh request after the rejection.
    await requestUpgrade(userPage);
    await adminPage.reload();

    const pendingBadges = adminPage.getByText("PENDING", { exact: true });
    const rejectedBadges = adminPage.getByText("REJECTED", { exact: true });
    await expect(pendingBadges).toHaveCount(1);
    await expect(rejectedBadges).toHaveCount(1);

    await userCtx.close();
    await adminCtx.close();
  });
});
