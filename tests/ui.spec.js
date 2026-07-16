import { expect, test } from "@playwright/test";

const SPECIAL_EXPECTATIONS = {
  habbo: [".habbo-room", ".habbo-fig"],
  "heads-only": [".heads-toolbar", ".float-head"],
  "knockoff-manor": [".manor-room-tile", ".manor-token"],
  yugioh: [".ygo-board", ".character-card"],
  linkedin: [".linkedin-board", "#linkedinTicker"],
  gallery: [".gallery-board", ".character-card"],
  "family-tree-disaster": [".family-tree-board", ".family-cluster"]
};

async function openCleanTitle(page) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("whoisit_game_v1");
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
    } catch (e) { /* storage may be blocked */ }
  });
  await page.goto("/");
  // The landing poster fronts the menu; choose the classic ruleset before local/online setup.
  const letplay = page.locator(".ts-letplay");
  if (await letplay.isVisible().catch(() => false)) await letplay.click();
  await page.locator('.ts-ruleset[data-ruleset="whoisit"]').click();
  await expect(page.locator(".ts-local")).toBeVisible();
}

async function startNamedLocalGame(page, count = 3, solo = true) {
  await openCleanTitle(page);
  // Local setup lives in the names step now: enter it, then add player rows to reach `count`.
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
  await expect.poll(() => page.locator(".ts-name-slot").evaluateAll((els) => els.map((el) => el.value))).toEqual(names);
  await page.locator(".ts-names-go").click();
  // Dispatch synchronously: the reveal also has an auto-finish timer and can detach midway through
  // Playwright's actionability checks under a busy exhaustive run.
  await page.locator(".round-reveal").evaluateAll((els) => els.forEach((el) => { el.click(); el.remove(); }));
  await page.locator(".dimension-warp, .forecast-card").evaluateAll((els) => els.forEach((el) => el.remove()));
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

async function assertBoardIsUsable(page, modeId) {
  const board = page.locator("#characterBoard");
  await expect(board).toBeVisible();
  const box = await board.boundingBox();
  expect(box?.width || 0, `${modeId} board width`).toBeGreaterThan(120);
  expect(box?.height || 0, `${modeId} board height`).toBeGreaterThan(120);

  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow, `${modeId} horizontal overflow`).toBeLessThanOrEqual(3);

  const tileCount = await page.locator("#characterBoard [data-id]").count();
  expect(tileCount, `${modeId} rendered tiles`).toBeGreaterThan(1);

  const contentOk = await page.locator("#characterBoard [data-id]").evaluateAll((els) =>
    els.slice(0, 8).every((el) => {
      const rect = el.getBoundingClientRect();
      const img = el.querySelector("img");
      const text = el.textContent || "";
      const imgRect = img ? img.getBoundingClientRect() : rect;
      return rect.width > 12 && rect.height > 12 && imgRect.width > 0 && imgRect.height > 0 && text.trim().length > 0;
    })
  );
  expect(contentOk, `${modeId} card content`).toBe(true);

  for (const selector of SPECIAL_EXPECTATIONS[modeId] || []) {
    await expect(page.locator(selector).first(), `${modeId} ${selector}`).toBeVisible();
  }
}

test("mandatory names and solo mode create one seat per player", async ({ page }) => {
  await openCleanTitle(page);
  await page.locator(".ts-local").click();
  await page.locator(".ts-name-row").first().waitFor();
  await page.locator(".ts-add-player").click();          // 2 -> 3 players
  await expect(page.locator(".ts-step-names .ts-team-mode")).toBeVisible();
  await page.locator(".ts-step-names .ts-team-mode-input").uncheck();
  await page.locator(".ts-names-go").click();
  // The shake is deliberately only 400ms; aria-invalid and the live error are the durable contract.
  await expect(page.locator(".ts-name-slot").first()).toHaveAttribute("aria-invalid", "true");
  await expect(page.locator(".ts-field-error").first()).toBeVisible();
  const inputs = page.locator(".ts-name-slot");
  await inputs.nth(0).fill("Ada");
  await inputs.nth(1).fill("Bea");
  await inputs.nth(2).fill("Cal");
  await page.locator(".ts-names-go").click();
  const reveal = page.locator(".round-reveal").first();
  if (await reveal.isVisible().catch(() => false)) await reveal.click();
  await expect(page.locator("body")).toHaveClass(/mode-solo/);
  await expect(page.locator(".seat-half")).toHaveCount(3);
});

test("local custom lineup with one mode starts in that chosen mode", async ({ page }) => {
  await openCleanTitle(page);
  await page.locator(".ts-local").click();
  await page.locator(".ts-name-row").first().waitFor();
  await page.locator('.ts-step-names .mode-policy-chip[data-policy="custom"]').click();
  const checks = page.locator(".ts-step-names .mode-check:not([disabled])");
  const modeIds = await checks.evaluateAll((inputs) => inputs.map((input) => input.value));
  const chosenMode = modeIds[0];
  expect(chosenMode).toBeTruthy();
  // The lineup rebuilds after each edit, so use a fresh locator for every checkbox.
  for (const modeId of modeIds.slice(1)) await page.locator(`.ts-step-names .mode-check[value="${modeId}"]`).uncheck();
  await page.locator(".ts-name-slot").nth(0).fill("Ada");
  await page.locator(".ts-name-slot").nth(1).fill("Bea");
  await page.locator(".ts-names-go").click();
  await expect.poll(() => page.evaluate(() => state.global.mystery?.id || ""), { timeout: 15_000 }).toBe(chosenMode);
  await expect(page.locator("#characterBoard [data-id]").first()).toBeVisible();
});

test("sorting reorders cards without losing the board", async ({ page }) => {
  await startNamedLocalGame(page, 3, true);
  const result = await page.evaluate(async () => {
    const ids = () => [...document.querySelectorAll("#characterBoard [data-id]")].map((el) => el.dataset.id);
    const select = document.querySelector("#sortSelect");
    const start = ids();
    for (const key of ["skin", "eye", "hairamount", "appeal"]) {
      select.value = key;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      await new Promise((resolve) => setTimeout(resolve, 520));
      const now = ids();
      if (now.join("|") !== start.join("|")) return { key, start, now };
    }
    return { key: "", start, now: start };
  });
  expect(result.key).not.toBe("");
  expect([...result.now].sort()).toEqual([...result.start].sort());
  expect(new Set(result.now).size).toBe(result.start.length);
  await assertBoardIsUsable(page, `sort ${result.key}`);
});

test("secret reveal and hide keep the card footprint stable", async ({ page }) => {
  await startNamedLocalGame(page, 2, true);
  const card = page.locator("#secretCard");
  const revealed = await card.boundingBox();
  expect(revealed).not.toBeNull();
  await card.click();
  await expect(card).toHaveClass(/is-hidden/);
  await page.waitForTimeout(440);
  const hidden = await card.boundingBox();
  expect(hidden).not.toBeNull();
  expect(Math.abs(hidden.width - revealed.width)).toBeLessThanOrEqual(6);
  expect(Math.abs(hidden.height - revealed.height)).toBeLessThanOrEqual(6);
  await card.click();
  await expect(card).not.toHaveClass(/is-hidden/);
  await page.waitForTimeout(380);
  const rerevealed = await card.boundingBox();
  expect(rerevealed).not.toBeNull();
  expect(Math.abs(rerevealed.width - hidden.width)).toBeLessThanOrEqual(6);
  expect(Math.abs(rerevealed.height - hidden.height)).toBeLessThanOrEqual(6);
});

test("online room chip is clean and aligned", async ({ page }) => {
  await startNamedLocalGame(page, 2, true);
  await page.evaluate(() => {
    state.gameMode = "online";
    state.roomCode = "4815";
    state.playMode = "team";
    state.mySeat = 0;
    state.roster = [
      { clientId: state.clientId, name: "Joel", side: 0 },
      { clientId: "friend-client", name: "You", side: 1 }
    ];
    renderRoom();
  });
  const chip = page.locator(".seat-roster.online-room");
  await expect(chip).toBeVisible();
  const text = await chip.innerText();
  expect(text).toMatch(/room/i);
  expect(text).toContain("#4815");
  expect(text).toContain("1 friend connected");
  expect(text).not.toMatch(/[📋🟢⏳]/u);
  await expect(chip.locator(".or-copy .control-icon")).toBeVisible();
  await expect(chip.locator(".or-status.is-connected .or-dot")).toBeVisible();
  const aligned = await chip.locator(".or-status").evaluate((el) => {
    const dot = el.querySelector(".or-dot").getBoundingClientRect();
    const status = el.getBoundingClientRect();
    return Math.abs((dot.top + dot.height / 2) - (status.top + status.height / 2)) <= 2;
  });
  expect(aligned).toBe(true);
});

test("setup dialog hides unsafe mode names in PG custom mode", async ({ page }) => {
  await startNamedLocalGame(page, 2, true);
  await page.locator("#setupButton").click();
  await expect(page.locator("#setupDialog")).toBeVisible();
  await page.locator('#settingModePolicy .mode-policy-chip[data-policy="custom"]').click();
  const result = await page.evaluate(() => {
    const visible = [...document.querySelectorAll("#settingModes .mode-check-copy b")].map((el) => el.textContent.trim());
    const unsafe = window.MysteryModes.all().filter((effect) => !effect.pgSafe).map((effect) => effect.name);
    return { visible, leaked: unsafe.filter((name) => visible.includes(name)) };
  });
  expect(result.visible.length).toBeGreaterThan(0);
  expect(result.leaked).toEqual([]);
});

test("all playable mystery modes render without blank or overflowing boards", async ({ page }) => {
  // Inherently long: ~30 modes each applied + asserted with settle waits. The default 60s budget
  // is tight when webkit/tablet emulation runs under parallel load, so give it real headroom.
  test.setTimeout(180_000);
  await startNamedLocalGame(page, 3, true);
  const ids = await page.evaluate(() => window.MysteryModes.all().map((effect) => effect.id));
  expect(ids).not.toContain("ps1-mode");
  for (const id of ids) {
    await applyMode(page, id);
    await assertBoardIsUsable(page, id);
  }
});

test("touch semantics: tap toggles, scroll is not captured, long press starts drag", async ({ page, browserName }) => {
  test.skip(browserName === "webkit", "Synthetic TouchEvent support is inconsistent in WebKit.");
  await startNamedLocalGame(page, 3, true);
  await applyMode(page, "fertility");
  const first = page.locator("#characterBoard [data-id]").first();
  await first.click();
  await expect(first).toHaveClass(/is-down/);
  await first.click();
  await expect(first).not.toHaveClass(/is-down/);

  const before = await page.evaluate(() => window.scrollY);
  await first.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const touch = new Touch({ identifier: 1, target: el, clientX: r.left + 12, clientY: r.top + 12 });
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true, touches: [touch], targetTouches: [touch] }));
    const moved = new Touch({ identifier: 1, target: el, clientX: r.left + 12, clientY: r.top + 80 });
    el.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, cancelable: true, touches: [moved], targetTouches: [moved] }));
    window.scrollTo(0, 120);
    el.dispatchEvent(new TouchEvent("touchend", { bubbles: true, cancelable: true, changedTouches: [moved] }));
  });
  const after = await page.evaluate(() => window.scrollY);
  expect(after).toBeGreaterThanOrEqual(before);
  await expect(first).not.toHaveClass(/dragging/);

  await first.evaluate(async (el) => {
    const r = el.getBoundingClientRect();
    const touch = new Touch({ identifier: 2, target: el, clientX: r.left + 16, clientY: r.top + 16 });
    el.dispatchEvent(new TouchEvent("touchstart", { bubbles: true, cancelable: true, touches: [touch], targetTouches: [touch] }));
    await new Promise((resolve) => setTimeout(resolve, 390));
    const moved = new Touch({ identifier: 2, target: el, clientX: r.left + 68, clientY: r.top + 16 });
    el.dispatchEvent(new TouchEvent("touchmove", { bubbles: true, cancelable: true, touches: [moved], targetTouches: [moved] }));
  });
  await expect(first).toHaveClass(/dragging/);
});

test("Habbo selection shows room cam; coarse pointers skip the camera jump", async ({ page }, testInfo) => {
  const touch = !!testInfo.project.use.hasTouch;
  await startNamedLocalGame(page, 3, true);
  await applyMode(page, "habbo");
  const fig = page.locator(".habbo-fig").first();
  if (touch) await fig.tap();
  else await fig.click();
  await expect(fig).toHaveClass(/selected/);
  await expect(page.locator("#habboCam")).toBeVisible();
  const camera = await page.locator(".habbo-room").evaluate((el) => ({
    scale: getComputedStyle(el).getPropertyValue("--hb-cam-scale").trim(),
    x: getComputedStyle(el).getPropertyValue("--hb-cam-x").trim(),
    y: getComputedStyle(el).getPropertyValue("--hb-cam-y").trim()
  }));
  if (touch) {
    // iPhone/tablet: selecting someone must NOT fling the room around - cam panel only.
    expect(camera).toEqual({ scale: "1", x: "0px", y: "0px" });
  } else {
    // Desktop keeps the zoom-follow camera.
    expect(Number(camera.scale)).toBeGreaterThan(1);
  }
  await assertBoardIsUsable(page, "habbo");
});
