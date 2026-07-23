import { expect, test } from "@playwright/test";

const UI_KEY = "who-is-that-clothing-studio-ui-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(({ key }) => {
    localStorage.setItem(key, JSON.stringify({
      selectedId: "labCoat",
      previewMode: "adjusted",
      layerView: "composite",
      layerVisibility: {
        rearCollar: true,
        neck: true,
        torso: true,
        frontCollar: true,
        details: true,
        overlays: true
      }
    }));
  }, { key: UI_KEY });
  await page.goto("/labs/clothing-lab.html");
  await expect(page.locator("#selectedName")).toHaveText("Lab Coat");
});

test("diagnostic views expose and independently hide renderer layers", async ({ page }) => {
  await page.locator('[data-layer-view="layerMap"]').click();
  await expect(page.locator('[data-layer-view="layerMap"]')).toHaveClass(/is-active/);
  await expect(page.locator(".fit-card")).toHaveCount(6);

  const fitImages = page.locator(".fit-card img");
  const firstImage = fitImages.first();
  const dimensions = await firstImage.evaluate((image) => ({
    width: image.getBoundingClientRect().width,
    height: image.getBoundingClientRect().height
  }));
  expect(dimensions.width).toBeGreaterThan(180);
  expect(dimensions.height).toBeGreaterThan(180);

  const diagnosticPixels = await fitImages.evaluateAll(async (images) => {
    await Promise.all(images.map((image) => image.decode()));
    const canvas = document.createElement("canvas");
    canvas.width = images[0].naturalWidth;
    canvas.height = images[0].naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    const targets = {
      rearCollar: [255, 62, 165],
      neck: [99, 230, 190],
      torso: [53, 167, 255],
      frontCollar: [255, 212, 59],
      details: [177, 151, 252],
      overlays: [255, 146, 43]
    };
    const counts = Object.fromEntries(Object.keys(targets).map((key) => [key, 0]));
    for (const image of images) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0);
      const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
      for (const [key, target] of Object.entries(targets)) {
      let count = 0;
      for (let index = 0; index < pixels.length; index += 4) {
        if (Math.abs(pixels[index] - target[0]) < 8
          && Math.abs(pixels[index + 1] - target[1]) < 8
          && Math.abs(pixels[index + 2] - target[2]) < 8
          && pixels[index + 3] > 180) count += 1;
      }
        counts[key] += count;
      }
    }
    return counts;
  });
  for (const [part, count] of Object.entries(diagnosticPixels)) {
    expect(count, `${part} should remain visible in the composite`).toBeGreaterThan(2);
  }

  const before = await firstImage.getAttribute("src");
  await page.locator('[data-layer-visible="rearCollar"]').uncheck();
  await expect.poll(() => firstImage.getAttribute("src")).not.toBe(before);
  const decoded = decodeURIComponent((await firstImage.getAttribute("src")) || "");
  expect(decoded).not.toContain("data-clothing-part='rearCollar'");

  await page.locator('[data-layer-view="occlusion"]').click();
  await expect(page.locator(".comparison-section")).toHaveScreenshot("clothing-lab-occlusion-grid.png");
});

test("lab coat composite fit grid stays stable across body presets", async ({ page }) => {
  await expect(page.locator(".comparison-section")).toHaveScreenshot("clothing-lab-composite-grid.png");
});

test("all migrated collared garments keep stable fit grids", async ({ page }) => {
  const styles = ["labCoat", "rugby", "varsity", "tracksuit", "collared", "blazer", "jacket"];
  for (const style of styles) {
    await page.locator(`[data-select-style="${style}"]`).click();
    await expect(page.locator(`[data-style-card="${style}"]`)).toHaveClass(/is-selected/);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(page.locator(".comparison-section")).toHaveScreenshot(`clothing-${style}-fit-grid.png`);
  }
});
