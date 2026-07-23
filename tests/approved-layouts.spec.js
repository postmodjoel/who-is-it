import { expect, test } from "@playwright/test";

function expectContained(box, viewportWidth, label) {
  expect(box, `${label} should have a rendered box`).not.toBeNull();
  expect(box.x, `${label} should not escape the left edge`).toBeGreaterThanOrEqual(-0.5);
  expect(box.x + box.width, `${label} should not escape the right edge`).toBeLessThanOrEqual(viewportWidth + 0.5);
}

test.beforeEach(async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Exact audit checkpoints run once with explicit viewports.");
});

test("approved mobile landing composition stays inside narrow phones", async ({ page }) => {
  for (const viewport of [
    { width: 390, height: 844 },
    { width: 360, height: 800 }
  ]) {
    await page.setViewportSize(viewport);
    await page.goto("/");
    await expect(page.locator(".ts-letplay")).toBeVisible();

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scrollWidth).toBeLessThanOrEqual(viewport.width);

    for (const [selector, label] of [
      [".ts-poster", "landing poster"],
      [".ts-anthology", "anthology line"],
      [".ts-letplay", "primary action"]
    ]) {
      expectContained(await page.locator(selector).boundingBox(), viewport.width, label);
    }
  }
});

test("approved mobile lab directory remains compact and contained", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/labs/");
  await expect(page.locator(".lab-card")).toHaveCount(8);

  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(390);
  expectContained(await page.getByRole("heading", { name: "Lab directory." }).boundingBox(), 390, "lab heading");

  const cards = page.locator(".lab-card");
  for (let index = 0; index < 3; index += 1) {
    const box = await cards.nth(index).boundingBox();
    expectContained(box, 390, `lab card ${index + 1}`);
    expect(box.height, `lab card ${index + 1} should retain the approved compact height`).toBeLessThanOrEqual(205);
  }
});

test("approved Face Studio split prioritises the editor and stacks on tablet", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/labs/face-studio.html");
  await expect(page.locator("#resultCount")).not.toHaveText("0 faces");

  const inspect = await page.locator(".inspect-panel").boundingBox();
  const editor = await page.locator(".editor-panel").boundingBox();
  const portrait = await page.locator(".portrait-stage").boundingBox();
  expect(inspect).not.toBeNull();
  expect(editor).not.toBeNull();
  expect(portrait).not.toBeNull();
  expect(editor.width).toBeGreaterThan(inspect.width * 1.5);
  expect(portrait.width).toBeLessThanOrEqual(432);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(1440);

  await page.setViewportSize({ width: 768, height: 1024 });
  const tabletInspect = await page.locator(".inspect-panel").boundingBox();
  const tabletEditor = await page.locator(".editor-panel").boundingBox();
  expect(tabletEditor.y).toBeGreaterThanOrEqual(tabletInspect.y + tabletInspect.height);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(768);
});
