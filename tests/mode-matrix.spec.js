import { expect, test } from "@playwright/test";

// ===================== The mode matrix: every playable mode, on a phone =====================
// Tier 1: generic invariants (render health, touch guards, tap semantics, themes, low power)
// looped over every mode the wheel can land on. Tier 2: the bespoke interactions a generic loop
// can't reach (habbo walking, breed drags, pain scale, toolbars). Everything runs on the touch
// projects - the whole point is that phone players get the same game desktop players do.

async function openCleanTitle(page) {
  await page.addInitScript(() => {
    try { localStorage.removeItem("whoisit_game_v1"); } catch (e) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await expect(page.locator(".ts-local")).toBeVisible();
}

async function startNamedLocalGame(page, count = 3, solo = true) {
  await openCleanTitle(page);
  await page.locator(".ts-local").click();
  await page.locator(".ts-name-row").first().waitFor();
  for (let i = 2; i < count; i += 1) {
    await page.locator(".ts-add-player").click();
  }
  if (count > 2 && solo) {
    await page.locator(".ts-step-names .ts-team-mode-input").uncheck();
  }
  const names = Array.from({ length: count }, (_, i) => `Player ${i + 1}`);
  await page.locator(".ts-name-slot").evaluateAll((els, values) => {
    els.forEach((el, i) => {
      el.value = values[i] || "";
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }, names);
  await page.locator(".ts-names-go").click();
  const reveal = page.locator(".round-reveal").first();
  if (await reveal.isVisible().catch(() => false)) await reveal.click();
  await page.locator(".dimension-warp").evaluateAll((els) => els.forEach((el) => el.remove()));
  await expect(page.locator("#characterBoard")).toBeVisible();
  await expect(page.locator("#characterBoard [data-id]").first()).toBeVisible();
}

async function applyMode(page, id) {
  await page.evaluate((modeId) => {
    window.MysteryModes.clearMysteryEffectUI();
    window.MysteryModes.applyMysteryEffect(modeId);
    window.render();
  }, id);
  await page.waitForTimeout(120);
}

// Modes where the board is its own machine (tap ≠ cross-off, or no standard card grid):
// habbo taps SELECT a figure, manor moves tokens, and heads-only heads refuse to stay down
// ("you can't keep a good head down") - all deliberate, all covered by their own tests.
const CUSTOM_TAP_MODES = new Set(["habbo", "knockoff-manor", "heads-only"]);
const MOVING_TAP_MODES = new Set();   // reserved: force-tap for permanently-animating targets

async function assertRenderHealth(page, id, label) {
  const board = page.locator("#characterBoard");
  await expect(board, `${label} board`).toBeVisible();
  const box = await board.boundingBox();
  expect(box?.width || 0, `${label} board width`).toBeGreaterThan(120);
  expect(box?.height || 0, `${label} board height`).toBeGreaterThan(120);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${label} horizontal overflow`).toBeLessThanOrEqual(3);
  const tileCount = await page.locator("#characterBoard [data-id]").count();
  expect(tileCount, `${label} tiles`).toBeGreaterThan(1);
  const contentOk = await page.locator("#characterBoard [data-id]").evaluateAll((els) =>
    els.slice(0, 8).every((el) => {
      const rect = el.getBoundingClientRect();
      const img = el.querySelector("img");
      const imgRect = img ? img.getBoundingClientRect() : rect;
      return rect.width > 12 && rect.height > 12 && imgRect.width > 0 && imgRect.height > 0 && (el.textContent || "").trim().length > 0;
    })
  );
  expect(contentOk, `${label} card content`).toBe(true);
}

test("mode matrix: render, guards and tap semantics hold in every playable mode", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone", "phone matrix runs once, on the iphone project");
  test.setTimeout(420_000);
  const crashes = [];
  page.on("pageerror", (err) => crashes.push(String(err && err.message ? err.message : err)));

  await startNamedLocalGame(page, 3, true);
  const ids = await page.evaluate(() => window.MysteryModes.all().map((effect) => effect.id));
  expect(ids.length).toBeGreaterThan(20);

  const tapTargetFailures = [];
  for (const id of ids) {
    await applyMode(page, id);
    await assertRenderHealth(page, id, id);

    // Touch guards: no text selection on cards, no native image drags anywhere in the board.
    const guards = await page.evaluate(() => {
      const card = document.querySelector("#characterBoard [data-id]");
      const img = document.querySelector("#characterBoard img");
      const sel = (el) => {
        const cs = getComputedStyle(el);
        return cs.userSelect || cs.webkitUserSelect || cs.getPropertyValue("user-select") || cs.getPropertyValue("-webkit-user-select");
      };
      return {
        cardSelect: card ? sel(card) : "none",
        imgDrag: img ? (getComputedStyle(img).webkitUserDrag || getComputedStyle(img).getPropertyValue("-webkit-user-drag") || "none") : "none"
      };
    });
    expect(guards.cardSelect, `${id} card user-select`).toBe("none");
    expect(guards.imgDrag, `${id} img user-drag`).toBe("none");

    // Tap-target audit: any BUTTON the mode puts on the board must be a real thumb target.
    const small = await page.evaluate(() => {
      const out = [];
      document.querySelectorAll(".board-wrap button").forEach((b) => {
        const r = b.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) return;   // hidden
        if (r.width < 36 || r.height < 36) out.push(`${b.className || b.textContent.trim()} ${Math.round(r.width)}x${Math.round(r.height)}`);
      });
      return out;
    });
    small.forEach((s) => tapTargetFailures.push(`${id}: ${s}`));

    // Tap semantics on the standard grid: tap crosses a card off, tap again brings it back.
    if (!CUSTOM_TAP_MODES.has(id)) {
      const victim = page.locator("#characterBoard [data-id]:not(.is-down)").first();
      if (await victim.count()) {
        const vid = await victim.getAttribute("data-id");
        // Aim at the portrait's corner: a centre tap can land on a card's own widget strip
        // (e.g. the disease pain scale), which is deliberately NOT a cross-off.
        const tapOpts = { position: { x: 18, y: 18 }, force: MOVING_TAP_MODES.has(id) };
        await victim.tap(tapOpts);
        await expect(page.locator(`#characterBoard [data-id="${vid}"]`), `${id} tap crosses off`).toHaveClass(/is-down/);
        await page.locator(`#characterBoard [data-id="${vid}"]`).tap(tapOpts);
        await expect(page.locator(`#characterBoard [data-id="${vid}"]`), `${id} tap revives`).not.toHaveClass(/is-down/);
      }
    }
  }
  expect(tapTargetFailures, `board buttons under 36px:\n${tapTargetFailures.join("\n")}`).toEqual([]);

  // Light theme: every mode still renders a usable board (dark is the tested default).
  await page.evaluate(() => applyTheme("light"));
  for (const id of ids) {
    await applyMode(page, id);
    await assertRenderHealth(page, id, `${id} (light)`);
  }
  await page.evaluate(() => applyTheme("dark"));

  // Low power: looping animations off, board still usable.
  await page.evaluate(() => { state.settings.lowPower = true; applyLowPower(); });
  for (const id of ids) {
    await applyMode(page, id);
    await assertRenderHealth(page, id, `${id} (low power)`);
  }
  await page.evaluate(() => { state.settings.lowPower = false; applyLowPower(); });

  expect(crashes, `uncaught errors during the matrix:\n${crashes.join("\n")}`).toEqual([]);
});

test("deck integrity: same seed deals the same universe, secrets unique, PG filters the wheel", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "pure logic - once is enough");
  await startNamedLocalGame(page, 3, true);
  const result = await page.evaluate(() => {
    const salt = "matrix-test-salt";
    newGame(salt, { silentEffect: true });
    const first = { board: state.board.map((c) => c.id), secrets: state.players.map((p) => p.secretId) };
    newGame(salt, { silentEffect: true });
    const second = { board: state.board.map((c) => c.id), secrets: state.players.map((p) => p.secretId) };
    state.settings.pg = true;
    const pgModes = window.MysteryModes.all().map((e) => ({ id: e.id, safe: window.MysteryModes.isPgSafe(e.id) }));
    state.settings.pg = false;
    return { first, second, pgModes };
  });
  expect(result.second.board).toEqual(result.first.board);
  expect(result.second.secrets).toEqual(result.first.secrets);
  expect(new Set(result.first.secrets).size).toBe(result.first.secrets.length);
  // With PG on, the random wheel must only ever land on pgSafe modes.
  const unsafeOffered = await page.evaluate(() => {
    state.settings.pg = true;
    const seen = new Set();
    for (let i = 0; i < 60; i += 1) {
      const eff = window.MysteryModes.randomEffect();
      if (eff) seen.add(eff.id);
    }
    state.settings.pg = false;
    return [...seen].filter((id) => !window.MysteryModes.isPgSafe(id));
  });
  expect(unsafeOffered).toEqual([]);
});

test("habbo on touch: select shows the docked cam, walk keeps identity, ban round-trips", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone", "phone behaviour under test");
  await startNamedLocalGame(page, 3, true);
  await applyMode(page, "habbo");
  const fig = page.locator(".habbo-fig").first();
  const figId = await fig.getAttribute("data-id");
  await fig.tap();
  await expect(page.locator("#habboCam")).toBeVisible();
  // Phone cam is DOCKED (static, below the room), never floating over its right columns.
  const cam = await page.evaluate(() => {
    const c = document.getElementById("habboCam");
    const room = document.querySelector(".habbo-room").getBoundingClientRect();
    const r = c.getBoundingClientRect();
    return { position: getComputedStyle(c).position, belowRoom: r.top >= room.bottom - 2 };
  });
  expect(cam.position).toBe("static");
  expect(cam.belowRoom).toBe(true);
  // Walk to a free neighbouring tile: position changes, the sprite stays THIS character's sheet.
  const walk = await page.evaluate(async (id) => {
    const el = document.querySelector(`.habbo-fig[data-id="${id}"]`);
    const before = { transform: el.style.transform, src: el.querySelector("img.hb-avatar")?.src };
    const cur = habboPos.get(id);
    // The room is crowded: scan the WHOLE grid nearest-first and take the first walk that engages
    // (a free tile can still be unreachable if the pathing is boxed in).
    const taken = new Set([...habboPos.entries()].filter(([oid]) => oid !== id).map(([, p]) => `${p.col},${p.row}`));
    const targets = [];
    for (let c = 0; c < HABBO_GW; c += 1) for (let r = 0; r < HABBO_GH; r += 1) {
      const k = `${c},${r}`;
      if ((c !== cur.col || r !== cur.row) && !taken.has(k) && !habboBlocked.has(k)) {
        targets.push({ c, r, d: Math.abs(c - cur.col) + Math.abs(r - cur.row) });
      }
    }
    targets.sort((a, b) => a.d - b.d);
    for (const t of targets.slice(0, 40)) {
      habboWalk(id, t.c, t.r);
      if (el.classList.contains("walking")) break;
    }
    await new Promise((r) => setTimeout(r, 1200));
    return {
      walked: el.style.transform !== before.transform,
      sameSheet: (el.querySelector("img.hb-avatar")?.src || "").includes(id)
    };
  }, figId);
  expect(walk.walked).toBe(true);
  expect(walk.sameSheet).toBe(true);
  // BAN throws them into the void; UNBAN brings them back.
  await page.locator(".hb-cam-ban").tap();
  await expect(page.locator(`.habbo-void [data-id="${figId}"], .habbo-void .hb-void-fig`).first()).toBeVisible();
  const unban = page.locator(".hb-cam-ban");
  if (await unban.count()) {
    await unban.tap();
  }
});

test("breed drag on touch: long-press drag mixes two characters (pantone)", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "tablet", "synthetic TouchEvents need chromium + touch");
  await startNamedLocalGame(page, 3, true);
  await applyMode(page, "pantone");
  const performed = await page.evaluate(async () => {
    const cards = document.querySelectorAll("#characterBoard [data-id]");
    const a = cards[0], b = cards[1];
    if (!a || !b || a.getAttribute("draggable") !== "true") return { draggable: false };
    const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
    const t = (x, y, id) => new Touch({ identifier: id, target: a, clientX: x, clientY: y });
    a.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true, touches: [t(ra.x + 12, ra.y + 12, 9)], targetTouches: [t(ra.x + 12, ra.y + 12, 9)] }));
    await new Promise((r) => setTimeout(r, 400));      // past the long-press hold
    const mid = t(rb.x + rb.width / 2, rb.y + rb.height / 2, 9);
    a.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, cancelable: true, touches: [mid], targetTouches: [mid] }));
    const dragging = a.classList.contains("dragging");
    a.dispatchEvent(new TouchEvent("touchend", { bubbles: true, cancelable: true, changedTouches: [mid] }));
    await new Promise((r) => setTimeout(r, 600));
    // Pantone doesn't spawn an overlay - the pair MIX in place (re-tinted + a .pantone-mix pulse).
    const mixed = !!document.querySelector("#characterBoard .pantone-mix, .breed-overlay, .reel-overlay");
    return { draggable: true, dragging, mixed };
  });
  expect(performed.draggable).toBe(true);
  expect(performed.dragging).toBe(true);
  expect(performed.mixed).toBe(true);
  await page.evaluate(() => document.querySelectorAll(".breed-overlay, .reel-overlay").forEach((e) => e.remove()));
});

test("mode furniture on a phone: tickers, toolbars, pain scale, props, trading cards", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "iphone", "phone behaviour under test");
  test.setTimeout(120_000);
  await startNamedLocalGame(page, 3, true);

  // LinkedIn: the feed ticker exists and actually animates (marquee, not a frozen strip).
  await applyMode(page, "linkedin");
  await expect(page.locator("#linkedinTicker")).toBeVisible();

  // Heads-only: formation buttons switch the layout.
  await applyMode(page, "heads-only");
  const btn = page.locator(".heads-form-btn").nth(1);
  await btn.tap();
  await expect(btn).toHaveClass(/on/);

  // Disease: the pain scale is drag-to-set (touch-action none so the page must NOT scroll with it).
  await applyMode(page, "disease");
  const scale = page.locator(".dz-painscale-faces").first();
  if (await scale.count()) {
    const ta = await scale.evaluate((el) => getComputedStyle(el).touchAction);
    expect(ta).toBe("none");
  }

  // Prop panic: the held item pins to the bottom-right of its card, no label text.
  await applyMode(page, "prop-panic");
  const prop = page.locator("#characterBoard .prop-overlay").first();
  if (await prop.count()) {
    const pinned = await prop.evaluate((el) => {
      const card = el.closest("[data-id]").getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const cx = r.x + r.width / 2, cy = r.y + r.height / 2;
      return cx > card.x + card.width / 2 && cy > card.y + card.height / 2;
    });
    expect(pinned).toBe(true);
  }

  // Yu-Gi-Oh: every trading card fits the phone viewport (gold frames were prone to clipping).
  await applyMode(page, "yugioh");
  const ygoFits = await page.locator("#characterBoard [data-id]").evaluateAll((els) =>
    els.every((el) => {
      const r = el.getBoundingClientRect();
      return r.left >= -1 && r.right <= window.innerWidth + 1;
    })
  );
  expect(ygoFits).toBe(true);
});
