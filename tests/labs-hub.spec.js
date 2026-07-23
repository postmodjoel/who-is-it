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

test("every workbench links back and Face Studio loads its generator", async ({ page }) => {
  const workbenches = [
    "face-studio.html",
    "clothing-lab.html",
    "hair-studio.html",
    "hair-compositor-lab.html",
    "genetics-lab.html",
    "prompt-studio.html",
    "compare.html",
    "audit-v2-dashboard.html"
  ];

  for (const workbench of workbenches) {
    await page.goto(`/labs/${workbench}`);
    await expect(page.getByRole("link", { name: "All labs" })).toBeVisible();
  }

  await page.goto("/labs/face-studio.html");
  await expect(page.locator("#resultCount")).not.toHaveText("0 faces");
  await page.getByRole("link", { name: "All labs" }).click();

  await expect(page).toHaveURL(/\/labs\/$/);
  await expect(page.getByRole("heading", { name: "Lab directory." })).toBeVisible();
});
