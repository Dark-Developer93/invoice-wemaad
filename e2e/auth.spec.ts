import { test, expect } from "@playwright/test";

test.describe("auth guard", () => {
  test("unauthenticated visit to /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login/);
  });

  test("unauthenticated visit to /admin redirects to /login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe("authenticated user", () => {
  test.use({ storageState: "e2e/.auth/user.json" });

  test("can reach the dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("a non-admin visiting /admin is redirected away", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).not.toHaveURL(/\/admin\/users/);
  });
});

test.describe("authenticated admin", () => {
  test.use({ storageState: "e2e/.auth/admin.json" });

  test("can reach the admin panel", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: "User Management" })).toBeVisible();
  });
});
