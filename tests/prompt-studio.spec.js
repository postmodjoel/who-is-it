import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/labs/prompt-studio.html");
  await page.evaluate(() => localStorage.removeItem("whoisit_prompt_studio_v1"));
  await page.reload();
  await page.getByRole("button", { name: "WHO? DO YOU THINK? SWIPE" }).click();
});

test("rates prompts, preserves feedback, undoes, and exports stable ids", async ({ page }) => {
  const total = await page.evaluate(() => Object.values(window.GameData.groupthinkPrompts).flat().length);
  // A floor against accidental deck collapse, not a size target - curation is expected to shrink it.
  expect(total).toBeGreaterThanOrEqual(80);
  await expect(page.locator("#gtProgress")).toContainText(`0/${total} rated`);
  const id = await page.locator(".swipe-id").textContent();
  const original = await page.locator(".swipe-text").textContent();

  await page.getByRole("button", { name: "GOOD IDEA / BAD WORDING" }).click();
  await page.locator("#gtNote").fill("Sharper and more specific");
  await page.locator("#gtReplacement").fill("Pick three who brought an alibi to dinner.");
  await page.locator("#gtRewrite").check();
  await page.getByRole("button", { name: "Yay" }).click();
  await expect(page.locator("#gtProgress")).toContainText(`1/${total} rated`);

  const saved = await page.evaluate((promptId) => JSON.parse(localStorage.getItem("whoisit_prompt_studio_v1")).groupthink[promptId], id);
  expect(saved).toMatchObject({
    verdict: "yay",
    reasons: ["GOOD IDEA / BAD WORDING"],
    note: "Sharper and more specific",
    replacement: "Pick three who brought an alibi to dinner.",
    rewrite: true
  });

  await page.locator("#gtUndo").click();
  await expect(page.locator(".swipe-id")).toHaveText(id);
  await expect(page.locator(".swipe-text")).toHaveText(original);
  await expect(page.locator("#gtNote")).toHaveValue("Sharper and more specific");

  await page.getByRole("button", { name: "Maybe" }).click();
  await page.locator("#gtExport").click();
  const payload = JSON.parse(await page.locator("#out").inputValue());
  expect(payload.studio).toBe("whoisit-prompt-studio-v2");
  expect(payload.groupthink[0]).toMatchObject({
    id,
    original,
    verdict: "maybe",
    authoredReplacement: "Pick three who brought an alibi to dinner.",
    rewriteRequested: true
  });
});

test("queue filters and keyboard shortcuts ignore feedback fields", async ({ page }) => {
  const total = await page.evaluate(() => Object.values(window.GameData.groupthinkPrompts).flat().length);
  await page.locator("#gtNote").focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator("#gtProgress")).toContainText(`0/${total} rated`);
  await page.locator("#gtCard").focus();
  await page.keyboard.press("ArrowUp");
  await expect(page.locator("#gtProgress")).toContainText(`1/${total} rated`);
  await page.locator("#gtQueue").selectOption("maybe");
  await expect(page.locator("#gtStage .swipe-card")).toHaveCount(1);
});

test("rejects malformed groupthink patches without replacing a loaded patch", async ({ page }) => {
  await page.getByRole("button", { name: "ALL PROMPTS" }).click();
  await page.getByText("Import a Claude patch").click();
  page.on("dialog", (dialog) => dialog.accept());
  await page.locator("#patchIn").fill(JSON.stringify({
    changes: [{ target: "groupthink", source: "base", action: "add", id: "cult", text: "Duplicate", heat: "hot", pgSafe: "yes" }]
  }));
  await page.getByRole("button", { name: "Review patch" }).click();
  await expect(page.locator("#patchList .patchrow")).toHaveCount(0);
});
