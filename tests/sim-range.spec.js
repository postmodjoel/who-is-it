import { test, expect } from "@playwright/test";

test.describe("The Next 30 review range", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/sim-range-review.html");
    await expect(page.locator(".range-card")).toHaveCount(30);
  });

  test("ships thirty unique, native candidates with a broad pronoun mix", async ({ page }) => {
    const range = await page.evaluate(() => window.SimRangeReview.characters.map((character) => ({
      id: character.id,
      name: character.name,
      pronouns: character.pronouns,
      role: character.role,
      image: character.image,
      traits: character.traits
    })));

    expect(range).toHaveLength(30);
    expect(new Set(range.map((character) => character.id)).size).toBe(30);
    expect(new Set(range.map((character) => character.name)).size).toBe(30);
    expect(new Set(range.map((character) => character.role)).size).toBe(30);
    expect(range.every((character) => character.id.startsWith("gen-sim3-"))).toBe(true);
    expect(range.every((character) => character.image.startsWith("data:image/svg+xml"))).toBe(true);

    const pronouns = Object.groupBy(range, (character) => character.pronouns);
    expect(pronouns.she.length).toBeGreaterThanOrEqual(12);
    expect(pronouns.he.length).toBeGreaterThanOrEqual(9);
    expect(pronouns.they.length).toBeGreaterThanOrEqual(6);

    const requiredTraits = ["skin", "hair", "hairColor", "clothing", "faceShape", "expression", "animMode"];
    expect(range.every((character) => requiredTraits.every((key) => Boolean(character.traits[key])))).toBe(true);
  });

  test("expression review re-renders the complete range", async ({ page }) => {
    const before = await page.locator(".range-card img").first().getAttribute("src");
    await page.getByRole("button", { name: "NEUTRAL", exact: true }).click();
    await expect(page.locator("#rangeSummary")).toContainText("NEUTRAL EXPRESSION");
    const after = await page.locator(".range-card img").first().getAttribute("src");
    expect(after).not.toBe(before);
    await expect(page.locator(".range-card img")).toHaveCount(30);
    await expect(page.locator(".range-card img[src^='data:image/svg+xml']")).toHaveCount(30);
  });

  test("votes persist and only kept candidates enter the playable cast", async ({ page }) => {
    const initiallyPlayable = await page.evaluate(() => window.faceGenerator
      .createCharacters(() => [])
      .filter((character) => character.id.startsWith(window.faceGenerator.simRange.prefix))
      .map((character) => character.id));
    expect(initiallyPlayable).toEqual([]);
    await expect(page.locator("#shortlistCount")).toHaveText("0");

    await page.getByRole("button", { name: "Keep Aya", exact: true }).click();
    await expect(page.locator('[data-sim-id="gen-sim3-aya"]')).toHaveClass(/is-kept/);
    await expect(page.locator("#shortlistCount")).toHaveText("1");
    await expect(page.locator("#finishButton")).toContainText("USE 1 IN GAME");

    await page.reload();
    await expect(page.locator('[data-sim-id="gen-sim3-aya"]')).toHaveClass(/is-kept/);
    const playableAfterReload = await page.evaluate(() => window.faceGenerator
      .createCharacters(() => [])
      .filter((character) => character.id.startsWith(window.faceGenerator.simRange.prefix))
      .map((character) => character.id));
    expect(playableAfterReload).toEqual(["gen-sim3-aya"]);

    await page.getByRole("button", { name: "KEPT ONLY", exact: true }).click();
    await expect(page.locator(".range-card")).toHaveCount(1);
    await page.getByRole("button", { name: "CLEAR VOTES", exact: true }).click();
    await expect(page.locator(".range-card")).toHaveCount(0);
    await expect(page.locator(".range-empty")).toContainText("NO ONE KEPT YET");
  });

  test("the contact sheet stays inside the viewport", async ({ page }) => {
    const layout = await page.evaluate(() => ({
      viewport: innerWidth,
      pageWidth: document.documentElement.scrollWidth,
      cards: [...document.querySelectorAll(".range-card")].map((card) => {
        const rect = card.getBoundingClientRect();
        return { left: rect.left, right: rect.right, width: rect.width };
      })
    }));

    expect(layout.pageWidth).toBeLessThanOrEqual(layout.viewport + 1);
    expect(layout.cards.every((card) => card.left >= -1 && card.right <= layout.viewport + 1 && card.width > 120)).toBe(true);
  });
});
