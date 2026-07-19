import { expect, test } from "@playwright/test";

/* Unified hair compositor: every portrait is a bald head plus one ordered stack of hair pieces.
 * Data/API tests probe window.facesHair / window.faceGenerator on the lab page; rendering tests
 * decode the produced SVGs; designer tests drive the Face Studio Hair Designer. */

const LAB = "/hair-compositor-lab.html";

async function decodePortrait(page, traits, seed = 7) {
  return page.evaluate(({ traits: t, seed: s }) => {
    const src = window.faceGenerator.renderPortrait(s, { ...window.hairLab.MANNEQUIN, ...t });
    return decodeURIComponent(src.replace(/^data:image\/svg\+xml;charset=UTF-8,/, ""));
  }, { traits, seed });
}

test.describe("compositor data + API", () => {
  test.beforeEach(async ({ page }) => { await page.goto(LAB); });

  test("every advertised style resolves; bald is empty; pieces support core modes", async ({ page }) => {
    const result = await page.evaluate(() => {
      const fh = window.facesHair;
      const styles = window.faceGenerator.traitBook.hairStyles;
      const unresolved = styles.filter((s) => s !== "bald" && (!fh.getHairPreset(s) || !fh.getHairPreset(s).layers.length));
      const baldLayers = fh.getHairPreset("bald").layers.length;
      const badPieces = Object.keys(fh.hairPieces).filter((key) => {
        const layer = fh.normalizeHairLayer(key.indexOf("lock:") === 0 ? { lock: key.slice(5) } : { piece: key, origin: "base" });
        return ["mass", "fill", "full"].some((mode) => !fh.renderHairPiecePart(layer, { hair: "#6b4a2f", ink: "#222", seed: "t" }, mode));
      });
      return { styles, unresolved, baldLayers, pieceCount: Object.keys(fh.hairPieces).length, badPieces };
    });
    expect(result.styles).not.toContain("hijab");
    expect(result.unresolved).toEqual([]);
    expect(result.baldLayers).toBe(0);
    expect(result.pieceCount).toBeGreaterThan(35);
    expect(result.badPieces).toEqual([]);
  });

  test("legacy order, override precedence, fallbacks, stable ids, wrapper delegation", async ({ page }) => {
    const r = await page.evaluate(() => {
      const R = window.faceGenerator.resolveHairComposition;
      const fh = window.facesHair;
      const legacy = R({ hair: "curls", hairLocks: [{ lock: "sideSwoop" }, { d: "M1 1L2 2Z" }] });
      const mat = R({ hair: "curls", hairLocks: [{ lock: "sideSwoop" }], hairComposition: { version: 1, preset: "bob", layers: [{ piece: "base:bob", origin: "base" }] } });
      const badVersion = R({ hair: "bob", hairLocks: [{ lock: "cheekCurl" }], hairComposition: { version: 9, layers: [] } });
      const unknownPreset = R({ hair: "mullet", hairLocks: [{ lock: "cheekCurl" }] });
      const unknownPiece = R({ hair: "bald", hairLocks: [{ lock: "notAKind" }, { lock: "cheekCurl" }] });
      const emptyMat = R({ hair: "curls", hairComposition: { version: 1, preset: "curls", layers: [] } });
      const dup = R({ hair: "bald", hairComposition: { version: 1, layers: [{ piece: "lock:cheekCurl", id: "a", origin: "placed" }, { piece: "lock:sideSwoop", id: "a", origin: "placed" }] } });
      // renderLockPart must be a pure adapter over the generic piece renderer
      const viaWrapper = fh.renderLockPart({ lock: "cowlickSprout", x: 50, y: 50, scale: 1 }, { hair: "#333" }, "mass");
      const viaGeneric = fh.renderHairPiecePart(fh.normalizeHairLayer({ lock: "cowlickSprout", x: 50, y: 50, scale: 1 }), { hair: "#333" }, "mass");
      return {
        legacyOrder: legacy.layers.map((l) => l.origin),
        legacyIds: new Set(legacy.layers.map((l) => l.id)).size === legacy.layers.length,
        matPieces: mat.layers.map((l) => l.piece),
        matFlag: mat.materialized,
        badVersion: badVersion.materialized === false && badVersion.layers.length === 2,
        unknownPreset: unknownPreset.preset === "bald" && unknownPreset.layers.length === 1,
        unknownPiece: unknownPiece.layers.map((l) => l.piece),
        emptyMat: emptyMat.layers.length === 0 && emptyMat.materialized === true,
        dupIds: dup.layers.map((l) => l.id),
        wrapperDelegates: viaWrapper === viaGeneric
      };
    });
    expect(r.legacyOrder).toEqual(["base", "placed", "placed"]);
    expect(r.legacyIds).toBe(true);
    expect(r.matPieces).toEqual(["base:bob"]);
    expect(r.matFlag).toBe(true);
    expect(r.badVersion).toBe(true);
    expect(r.unknownPreset).toBe(true);
    expect(r.unknownPiece).toEqual(["lock:cheekCurl"]);
    expect(r.emptyMat).toBe(true);
    expect(r.dupIds).toEqual(["a", "a+"]);
    expect(r.wrapperDelegates).toBe(true);
  });
});

test.describe("compositor rendering", () => {
  test.beforeEach(async ({ page }) => { await page.goto(LAB); });

  test("all styles render without console errors across the full matrix", async ({ page }) => {
    const errors = [];
    page.on("console", (msg) => { if (msg.type() === "error") errors.push(msg.text()); });
    await page.evaluate(() => {
      window.hairLab.STYLES.forEach((style) => {
        window.hairLab.VARIANTS.forEach((v) => window.faceGenerator.renderPortrait(1, window.hairLab.traitsFor(style, v.traits)));
        window.hairLab.OVERLAP.forEach((o) => window.faceGenerator.renderPortrait(1, window.hairLab.traitsFor(style, {}, o.locks)));
      });
    });
    expect(errors).toEqual([]);
  });

  test("merged mode has one same-zone rim; no per-piece base outline under overlaps", async ({ page }) => {
    const svg = await decodePortrait(page, { hair: "curls", hairLocks: [{ lock: "curtainBangs", x: 52, y: 30, scale: 0.5, rot: 0 }] });
    // exactly one front rim filter for the zone union, none of the legacy per-style stroke outline
    expect(svg.match(/hairlock-rim-[^']*hc-front/g).length).toBeGreaterThan(0);
    const rimDefs = svg.match(/<filter id='hairlock-rim-/g) || [];
    expect(rimDefs.length).toBe(1);
    expect(svg).not.toContain("stroke-width='2.94'"); // faces400 stroke would betray the old branch
  });

  test("separate mode renders every layer; outline-off produces no rim", async ({ page }) => {
    const separate = await decodePortrait(page, { hair: "curls", lockBlend: "separate", hairLocks: [{ lock: "curtainBangs" }, { lock: "sideSwoop" }] });
    expect((separate.match(/M80 144c57-57/g) || []).length).toBeGreaterThan(0); // curtainBangs path present
    expect((separate.match(/M105 166c50-78/g) || []).length).toBeGreaterThan(0); // sideSwoop path present
    const off = await decodePortrait(page, { hair: "curls", hairOutlineMode: "off", hairLocks: [{ lock: "curtainBangs" }] });
    expect(off).not.toContain("hairlock-rim-");
  });

  test("behind layers render before the head; front after face features", async ({ page }) => {
    const svg = await decodePortrait(page, { hair: "cropped", hairLocks: [{ lock: "longSideLock", behind: true, x: 24, y: 42 }, { lock: "curtainBangs", x: 52, y: 30 }] });
    const behindLayer = svg.indexOf("fa-hair-behind-layer");
    const brow = svg.indexOf("fa-brow");
    const frontRim = svg.indexOf("hc-front");
    const behindRim = svg.indexOf("hc-behind");
    expect(behindLayer).toBeGreaterThan(-1);
    expect(behindRim).toBeGreaterThan(behindLayer);
    expect(behindRim).toBeLessThan(brow);
    expect(frontRim).toBeGreaterThan(brow);
  });

  test("filter and mask ids stay unique across multiple portraits on one page", async ({ page }) => {
    const dupes = await page.evaluate(() => {
      const seen = new Set();
      const collide = [];
      [11, 22, 33].forEach((seed) => {
        const src = window.faceGenerator.renderPortrait(seed, {
          ...window.hairLab.MANNEQUIN, hair: "curls",
          hairLocks: [{ lock: "curtainBangs", internalLine: true }, { lock: "sideSwoop" }]
        });
        const svg = decodeURIComponent(src.replace(/^data:image\/svg\+xml;charset=UTF-8,/, ""));
        (svg.match(/id='[^']+'/g) || []).forEach((id) => {
          if (seen.has(`${seed}|${id}`)) return; // same-portrait reuse is fine within its own doc
          if (seen.has(id)) collide.push(id);
          seen.add(id);
          seen.add(`${seed}|${id}`);
        });
      });
      return collide;
    });
    expect(dupes).toEqual([]);
  });

  test("legacy hijab renders as scarf + bald without mutating the record", async ({ page }) => {
    const result = await page.evaluate(() => {
      const record = { ...window.hairLab.MANNEQUIN, hair: "hijab" };
      const before = JSON.stringify(record);
      const src = window.faceGenerator.renderPortrait(5, record);
      const svg = decodeURIComponent(src.replace(/^data:image\/svg\+xml;charset=UTF-8,/, ""));
      return { unchanged: JSON.stringify(record) === before, hasScarf: svg.includes("M54 92c18-33"), hasFrame: svg.includes("M73 104c11-31") };
    });
    expect(result.unchanged).toBe(true);
    expect(result.hasScarf).toBe(true);
    expect(result.hasFrame).toBe(true);
  });
});

test.describe("hair designer interactions", () => {
  const KEY = "who-is-that-face-corrections";
  async function openHair(page) {
    await page.goto("/face-studio.html");
    await page.getByRole("button", { name: "Hair", exact: true }).first().click();
    await expect(page.locator(".lock-designer .meta-label").first()).toHaveText("Hair Designer");
  }
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => { try { localStorage.removeItem("who-is-that-face-corrections"); } catch (e) { /* blocked */ } });
  });

  test("base group at the bottom; add lands on top; delete base persists after reload", async ({ page }) => {
    await openHair(page);
    const badges = page.locator(".lock-origin");
    await expect(badges.first()).toContainText("BASE");
    const before = await page.locator(".lock-row[data-index]").count();
    await page.locator(".lock-chip").first().click();
    await expect(page.locator(".lock-row[data-index]")).toHaveCount(before + 1);
    await expect(page.locator(".lock-row[data-index]").last().locator(".lock-origin")).toHaveText("PLACED");
    // delete the base row; it must stay deleted after reload
    await page.locator(".lock-row.is-base-row [data-lock-act='remove']").click();
    await expect(page.locator(".lock-row.is-base-row")).toHaveCount(0);
    await page.reload();
    await page.getByRole("button", { name: "Hair", exact: true }).first().click();
    await expect(page.locator(".lock-row.is-base-row")).toHaveCount(0);
    const comp = await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem("who-is-that-face-corrections") || "{}");
      const id = Object.keys(s).find((k) => s[k].hairComposition);
      return s[id].hairComposition;
    });
    expect(comp.version).toBe(1);
    expect(comp.layers.filter((l) => l.origin === "base").length).toBe(0);
  });

  test("action scopes: Reset base restores bottom; Clear placed keeps base; Clear all confirms", async ({ page }) => {
    await openHair(page);
    await page.locator(".lock-chip").first().click();
    await page.locator(".lock-row.is-base-row [data-lock-act='remove']").click();
    await page.locator("[data-stack-reset-base]").click();
    await expect(page.locator(".lock-row[data-index]").first().locator(".lock-origin")).toContainText("BASE");
    const withBase = await page.locator(".lock-row[data-index]").count();
    await page.locator("[data-stack-clear-placed]").click();
    const baseOnly = await page.locator(".lock-row[data-index]").count();
    expect(baseOnly).toBeLessThan(withBase);
    await expect(page.locator(".lock-row.is-base-row")).toHaveCount(baseOnly);
    page.once("dialog", (d) => d.accept());
    await page.locator("[data-stack-clear-all]").click();
    await expect(page.locator(".lock-row[data-index]")).toHaveCount(0);
  });

  test("style change confirms when base is edited, cancel preserves, accept swaps", async ({ page }) => {
    await openHair(page);
    // edit the base (delete it) to arm the confirmation
    await page.locator(".lock-row.is-base-row [data-lock-act='remove']").click();
    const hairSelect = page.locator('select[data-key="hair"]');
    const original = await hairSelect.inputValue();
    const target = original === "curls" ? "bob" : "curls";
    page.once("dialog", (d) => d.dismiss());
    await hairSelect.selectOption(target);
    await expect(hairSelect).toHaveValue(original);
    page.once("dialog", (d) => d.accept());
    await hairSelect.selectOption(target);
    await expect(hairSelect).toHaveValue(target);
    await expect(page.locator(".lock-row[data-index]").first().locator(".lock-origin")).toContainText(`BASE · ${target.toUpperCase()}`);
  });

  test("baked characters with hairLocks still load; reorder across the boundary persists", async ({ page }) => {
    await openHair(page);
    // find a character with placed rows out of the box (the baked cast)
    const placed = page.locator(".lock-row[data-index] .lock-origin", { hasText: "PLACED" });
    if (await placed.count() === 0) test.skip(true, "no baked lock character selected by default");
    // move the base row to the very top via the reorder API (drag simulation is flaky cross-driver)
    await page.evaluate(() => {
      const key = "who-is-that-face-corrections";
      // simulate a cross-boundary reorder through the same setStack path the UI uses
      const rows = document.querySelectorAll(".lock-row[data-index]");
      const grip = rows[0].querySelector(".lock-grip");
      const dt = new DataTransfer();
      dt.setData("text/lockidx", "0");
      const last = rows[rows.length - 1];
      last.dispatchEvent(new DragEvent("dragover", { bubbles: true, cancelable: true, dataTransfer: dt }));
      last.dispatchEvent(new DragEvent("drop", { bubbles: true, cancelable: true, dataTransfer: dt }));
    });
    await expect(page.locator(".lock-row[data-index]").last().locator(".lock-origin")).toContainText("BASE");
    await page.reload();
    await page.getByRole("button", { name: "Hair", exact: true }).first().click();
    await expect(page.locator(".lock-row[data-index]").last().locator(".lock-origin")).toContainText("BASE");
  });
});

test.describe("visual snapshots", () => {
  test("style matrix snapshot", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "snapshots run once");
    await page.goto(LAB);
    await expect(page.locator("#baselineGrid img").first()).toBeVisible();
    await expect(page.locator("#baselineGrid")).toHaveScreenshot("compositor-style-matrix.png", { maxDiffPixelRatio: 0.01 });
  });

  test("focused styles + multi-zone snapshot", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "desktop", "snapshots run once");
    await page.goto(LAB);
    await page.locator('[data-tab="overlap"]').click();
    await expect(page.locator("#overlapGrid img").first()).toBeVisible();
    for (const style of ["curls", "coily", "locs", "longWaves"]) {
      const row = page.locator("#overlapGrid .cell-row", { has: page.locator("b", { hasText: style }) }).first();
      await expect(row).toHaveScreenshot(`compositor-${style}.png`, { maxDiffPixelRatio: 0.01 });
    }
  });

  test("mobile face studio stack stays usable", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "iphone", "mobile layout runs on the iphone project");
    await page.goto("/face-studio.html");
    await page.getByRole("button", { name: "Hair", exact: true }).first().click();
    await expect(page.locator(".lock-designer .meta-label").first()).toHaveText("Hair Designer");
    await expect(page.locator(".lock-stack")).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(overflow).toBe(false);
    await expect(page.locator(".lock-stack")).toHaveScreenshot("compositor-studio-mobile.png", { maxDiffPixelRatio: 0.02 });
  });
});
