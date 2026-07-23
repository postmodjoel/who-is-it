import { expect, test } from "@playwright/test";

test("lab directory lists every workbench and filters by purpose", async ({ page }) => {
  await page.goto("/labs/");

  await expect(page).toHaveTitle(/Lab Directory/);
  await expect(page.locator(".lab-card")).toHaveCount(8);
  await expect(page.getByRole("heading", { name: "Lab directory." })).toBeVisible();

  await page.getByRole("searchbox", { name: "Find a lab" }).fill("hair");
  await expect(page.locator(".lab-card:visible")).toHaveCount(2);
  await expect(page.getByRole("link", { name: /Hair Studio/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Hair Compositor/ })).toBeVisible();
});

test("every workbench can return to the lab directory", async ({ page }) => {
  await page.goto("/labs/face-studio.html");
  await page.getByRole("link", { name: "All labs" }).click();

  await expect(page).toHaveURL(/\/labs\/$/);
  await expect(page.getByRole("heading", { name: "Lab directory." })).toBeVisible();
});
