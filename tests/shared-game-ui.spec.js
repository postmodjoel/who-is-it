import { expect, test } from "@playwright/test";

const MENU_VIEWPORTS = [
  { width: 3440, height: 1440 },
  { width: 2560, height: 1440 },
  { width: 1440, height: 980 },
  { width: 430, height: 932 },
  { width: 390, height: 844 },
  { width: 360, height: 800 }
];

async function cleanBoot(page) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("whoisit_game_v1");
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
      sessionStorage.clear();
    } catch (error) { /* storage can be disabled in local previews */ }
  });
  await page.goto("/");
}

async function openRulesetPicker(page) {
  await cleanBoot(page);
  await page.locator(".ts-letplay").click();
  await expect(page.locator(".ts-step-ruleset")).toBeVisible();
}

// The focus carousel centre-scrolls and toggles .is-focus off its scroll handler, so a snapshot taken
// mid-animation is nondeterministic. Wait until focus + card geometry hold steady for several animation
// frames, then return the settled card sizes. (cleanBoot reloads the page each viewport, so the window
// counter starts fresh; within a viewport the before/after states differ, which resets it.)
async function settledCardSizes(page) {
  await page.waitForFunction(() => {
    const cards = [...document.querySelectorAll(".ts-ruleset")];
    if (cards.length !== 3) return false;
    const key = cards.map((c) => `${c.classList.contains("is-focus") ? "F" : "."}${Math.round(c.getBoundingClientRect().width)}`).join(",");
    if (window.__rsKey === key) window.__rsStable = (window.__rsStable || 0) + 1;
    else { window.__rsKey = key; window.__rsStable = 0; }
    return window.__rsStable >= 6;
  }, null, { timeout: 5000, polling: "raf" });
  return page.locator(".ts-ruleset").evaluateAll((buttons) => buttons.map((button) => {
    const rect = button.getBoundingClientRect();
    return { width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
}

async function startRuleset(page, ruleset) {
  await cleanBoot(page);
  await page.evaluate((key) => {
    Date.now = () => 1_710_000_000_000;
    Math.random = () => 0.314159;
    state.ruleset = key;
    state.settings.groupthinkYolo = false;
    startLocalGame(2, ["Joel", "You"], key === "whoisit" ? "team" : "solo");
    // Some prompts pin themselves to a one-pick ballot ("The worst person."), which would starve a
    // chrome test that needs to select two cards. Force a plain multi-pick prompt so this stays a
    // test about pick styling rather than about whatever the deck happened to deal.
    if (key === "groupthink") window.Groupthink?.startRound?.(0, { promptId: "racists" });
    document.querySelector(".title-screen")?.remove();
    window.Sound?.titleLoop?.(false);
  }, ruleset);
  await page.locator(".round-reveal, .dimension-warp, .forecast-card, .manifesto-card, .gt-intro-warp")
    .evaluateAll((nodes) => nodes.forEach((node) => node.remove()));
  if (ruleset === "whodidyoumake") {
    await expect(page.locator(".wdym-handoff")).toBeVisible();
    if (await page.locator(".wdym-study-open").isVisible()) await page.locator(".wdym-study-open").click();
    await page.locator(".wdym-seen").click();
    await expect(page.locator(".wdym-draft")).toBeVisible();
  } else {
    await expect(page.locator("#characterBoard")).toBeVisible();
  }
}

test("ruleset picker is stable, capped, and continuously painted at every target viewport", async ({ page }) => {
  for (const viewport of MENU_VIEWPORTS) {
    await page.setViewportSize(viewport);
    await openRulesetPicker(page);

    const before = await settledCardSizes(page);
    const metrics = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      tickerPosition: getComputedStyle(document.querySelector(".ts-ticker-field")).position,
      logoSizes: [...document.querySelectorAll(".ts-ruleset-logo")].map((node) => parseFloat(getComputedStyle(node).fontSize)),
      subtitleCount: document.querySelectorAll(".ts-ruleset small, .ts-ruleset-head small").length,
      musicControlCount: document.querySelectorAll(".ts-music").length,
      glowContent: getComputedStyle(document.querySelector(".ts-ruleset.is-focus"), "::before").content,
      // FOCUS CAROUSEL: exactly one game is centred (.is-focus) and only its PLAY sticker shows; the
      // neighbours blur/dim/peek with their CTA hidden. The track is a horizontal flex rail, not a grid.
      cardCount: document.querySelectorAll(".ts-ruleset").length,
      focusCount: document.querySelectorAll(".ts-ruleset.is-focus").length,
      visibleCtas: [...document.querySelectorAll(".ts-ruleset-enter")].filter((node) => node.getClientRects().length > 0).length,
      trackDisplay: getComputedStyle(document.querySelector(".ts-ruleset-grid")).display
    }));
    expect(metrics.overflow).toBeLessThanOrEqual(1);
    expect(metrics.tickerPosition).toBe("fixed");
    expect(Math.max(...metrics.logoSizes)).toBeLessThanOrEqual(92);
    expect(metrics.subtitleCount).toBe(0);
    expect(metrics.musicControlCount).toBe(0);
    expect(metrics.glowContent).toBe("none");
    expect(metrics.cardCount).toBe(3);
    expect(metrics.focusCount).toBe(1);
    expect(metrics.visibleCtas).toBe(1);
    expect(metrics.trackDisplay).toBe("flex");

    // Only the CENTRED card starts a game (a tap on a neighbour just recentres it), so enter through
    // the focused card, then BACK out of the mode step — the picker must return with geometry untouched.
    await page.locator(".ts-ruleset.is-focus").click();
    await expect(page.locator(".ts-step-main")).toBeVisible();
    await page.locator(".ts-splash-back").click();
    await expect(page.locator(".ts-step-ruleset")).toBeVisible();
    await expect(page.locator(".title-screen")).not.toHaveClass(/has-ruleset|is-groupthink|is-whodidyoumake/);
    await expect(page.locator(".ts-poster .ts-isit")).toHaveText("KNOWS?");

    // Re-entry re-centres with its own animation, so wait for the carousel to settle before snapshotting.
    // Sizes must return unchanged (no reflow); allow ±1px for sub-pixel scroll-position rounding.
    const after = await settledCardSizes(page);
    expect(after).toHaveLength(before.length);
    after.forEach((size, index) => {
      expect(Math.abs(size.width - before[index].width)).toBeLessThanOrEqual(1);
      expect(Math.abs(size.height - before[index].height)).toBeLessThanOrEqual(1);
    });

    const last = page.locator(".ts-ruleset").last();
    await last.scrollIntoViewIfNeeded();
    await expect(last).toBeVisible();
  }
});

test("shared switches animate and the soundboard uses the SVG icon contract", async ({ page }) => {
  await openRulesetPicker(page);
  await page.locator('.ts-ruleset[data-ruleset="whoisit"]').click();
  await page.locator(".ts-local").click();

  const soundSwitch = page.locator(".ts-step-names .ts-sound .ts-chip");
  const before = await soundSwitch.evaluate((node) => ({
    position: getComputedStyle(node).backgroundPosition,
    transition: getComputedStyle(node).transitionProperty
  }));
  await page.locator(".ts-step-names .ts-sound").click();
  await page.waitForTimeout(260);
  const after = await soundSwitch.evaluate((node) => getComputedStyle(node).backgroundPosition);
  expect(before.transition).toContain("background-position");
  expect(after).not.toBe(before.position);

  await page.evaluate(() => {
    document.querySelector(".title-screen")?.remove();
    installStaticIcons();
  });
  await expect(page.locator("#soundboardButton svg")).toHaveCount(1);
  await expect(page.locator("#soundboardButton")).not.toContainText("📣");
});

test("Groupthink player chips and pick feedback use the shared rounded, top-layer treatment", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 980 });
  await startRuleset(page, "groupthink");

  await expect(page.locator(".gt-roster-chip").first()).toHaveCSS("border-radius", "8px");
  const firstCard = page.locator(".character-card").first();
  await firstCard.click();
  await expect(firstCard).toHaveClass(/gt-picked/);
  await expect(firstCard.locator(".gt-pick-number")).toBeVisible();

  const treatment = await firstCard.evaluate((node) => {
    const ring = getComputedStyle(node, "::after");
    const badge = getComputedStyle(node.querySelector(".gt-pick-number"));
    return {
      ringBorder: ring.borderTopColor,
      ringZ: Number(ring.zIndex),
      ringAnimation: ring.animationName,
      badgeZ: Number(badge.zIndex),
      badgeAnimation: badge.animationName,
      hasOldChrome: document.body.classList.contains("destijl-chrome")
    };
  });
  expect(treatment.ringBorder).toBe("rgb(255, 212, 59)");
  expect(treatment.ringZ).toBeGreaterThan(10);
  expect(treatment.badgeZ).toBeGreaterThan(treatment.ringZ);
  expect(treatment.ringAnimation).toContain("gt-selection-ring-in");
  expect(treatment.badgeAnimation).toContain("gt-pick-number-in");
  expect(treatment.hasOldChrome).toBe(false);

  const secondCard = page.locator(".character-card").nth(1);
  await secondCard.click();
  await expect(page.locator(".gt-selection-tray .gt-tray-face b")).toHaveCount(0);
  await expect(page.locator(".gt-selection-tray")).not.toContainText("selected");
  const replayState = await Promise.all([
    firstCard.evaluate((node) => ({
      entering: node.classList.contains("gt-pick-enter"),
      ringAnimation: getComputedStyle(node, "::after").animationName,
      badgeAnimation: getComputedStyle(node.querySelector(".gt-pick-number")).animationName
    })),
    secondCard.evaluate((node) => ({
      entering: node.classList.contains("gt-pick-enter"),
      ringAnimation: getComputedStyle(node, "::after").animationName,
      badgeAnimation: getComputedStyle(node.querySelector(".gt-pick-number")).animationName
    }))
  ]);
  expect(replayState[0]).toEqual({ entering: false, ringAnimation: "none", badgeAnimation: "none" });
  expect(replayState[1].entering).toBe(true);
  expect(replayState[1].ringAnimation).toContain("gt-selection-ring-in");
  expect(replayState[1].badgeAnimation).toContain("gt-pick-number-in");
});

for (const viewport of [
  { label: "desktop", width: 1440, height: 980 },
  { label: "mobile", width: 390, height: 844 }
]) {
  test(`all game shells share supported chrome and geometry on ${viewport.label}`, async ({ page }, testInfo) => {
    // This test drives its own viewports via setViewportSize, and its screenshot baselines are only
    // captured/committed for the desktop project (…-shell-desktop-darwin.png). Running it under the
    // iphone/tablet projects just asks for baselines that don't exist and fails on "writing actual".
    test.skip(testInfo.project.name !== "desktop", "shared-chrome baselines live on the desktop project only");
    await page.setViewportSize(viewport);
    for (const ruleset of ["whoisit", "groupthink", "whodidyoumake"]) {
      await startRuleset(page, ruleset);

      const capabilities = await page.evaluate((key) => ({
        declared: window.RULESET_CHROME_CAPABILITIES[key],
        visible: Object.fromEntries([...document.querySelectorAll("[data-ruleset-control]")].map((node) => [
          node.dataset.rulesetControl,
          !node.hidden && !node.classList.contains("is-capability-hidden")
        ])),
        panelRadius: getComputedStyle(document.querySelector(".side-panel")).borderRadius,
        buttonRadius: getComputedStyle(document.querySelector("#soundButton")).borderRadius
      }), ruleset);
      expect(capabilities.declared).toBeTruthy();
      expect(capabilities.visible.sort).toBe(capabilities.declared.sort);
      expect(capabilities.visible.sound).toBe(true);
      expect(capabilities.visible.theme).toBe(true);
      expect(capabilities.visible.settings).toBe(true);
      expect(capabilities.visible.help).toBe(true);
      expect(capabilities.panelRadius).toMatch(/^12px(?: 12px 0px 0px)?$/);
      expect(capabilities.buttonRadius).toBe("8px");

      if (ruleset === "groupthink") {
        await expect(page.locator(".sort-wrap")).toBeHidden();
        await expect(page.locator("#swapSeatButton")).toBeVisible();
      }
      if (ruleset === "whodidyoumake") {
        await expect(page.locator(".sort-wrap")).toBeHidden();
        await expect(page.locator("#almanacButton")).toBeHidden();
        await expect(page.locator("#editorButton")).toBeHidden();
        await expect(page.locator(".wdym-panel").first()).toHaveCSS("border-radius", "12px");
      }

      await expect(page).toHaveScreenshot(`${ruleset}-${viewport.label}-shell.png`, {
        animations: "disabled",
        caret: "hide",
        maxDiffPixelRatio: 0.025
      });
    }
  });
}
