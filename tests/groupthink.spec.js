import { expect, test } from "@playwright/test";

async function openGroupthink(page, names, { yolo = true, dismissIntro = true } = {}) {
  await page.addInitScript(() => {
    try {
      if (!sessionStorage.getItem("gt-test-cleaned")) {
        localStorage.removeItem("whoisit_game_v1");
        localStorage.removeItem("whoisit_prefs_v1");
        sessionStorage.setItem("gt-test-cleaned", "1");
      }
    } catch (e) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await page.locator(".ts-letplay").click();
  const choice = page.locator('.ts-ruleset[data-ruleset="groupthink"]');
  await expect(choice).toHaveAttribute("aria-label", "Play WHO? DO YOU THINK?");
  // Focus carousel: a tap on an off-centre card only recentres it; the centred card is what launches.
  await choice.click();
  await expect(choice).toHaveClass(/is-focus/);
  await choice.click();
  await expect(page).toHaveTitle("WHO? DO YOU THINK?");
  await expect(page.locator(".ts-poster .ts-isit")).toHaveText("DO YOU THINK?");
  await page.locator(".ts-local").click();
  await expect(page.locator(".ts-step-names .ts-yolo")).toBeVisible();
  await expect(page.locator(".ts-step-names .ts-mode-lineup")).toBeHidden();
  if (!yolo) await page.locator(".ts-step-names .ts-yolo").click();
  await expect(page.locator(".ts-step-names .ts-yolo")).toHaveAttribute("aria-pressed", String(yolo));
  for (let i = 2; i < names.length; i += 1) await page.locator(".ts-add-player").click();
  const slots = page.locator(".ts-name-slot");
  // The menu animates duplicated setup panels during transitions; update the currently rendered
  // roster in one DOM turn so a delayed focus hand-off cannot append both names to the first input.
  await slots.evaluateAll((inputs, values) => {
    inputs.slice(0, values.length).forEach((input, index) => {
      input.value = values[index];
      input.dispatchEvent(new Event("input", { bubbles: true }));
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }, names);
  await expect.poll(() => slots.evaluateAll(
    (inputs, count) => inputs.slice(0, count).map((input) => input.value),
    names.length
  )).toEqual(names);
  await page.locator(".ts-names-go").click();
  await expect(page.locator("body")).toHaveClass(/ruleset-groupthink/);
  await expect(page.locator(".side-head .brand-doyouthink")).toHaveText("DO YOU THINK?");
  await expect(page.locator(".side-head .brand-isit")).toBeHidden();
  await expect(page.locator("#characterBoard [data-id]")).toHaveCount(30);
  await expect.poll(() => page.evaluate(() => state.global.mystery)).toBeNull();
  await expect.poll(() => page.evaluate(() => state.groupthink.effectId)).toBeNull();
  await expect(page.locator(".gt-intro-warp")).toBeVisible();
  if (dismissIntro) await page.locator(".gt-intro-skip").click();
}

async function pick(page, indexes) {
  const cards = page.locator("#characterBoard [data-id]");
  for (const index of indexes) await cards.nth(index).click();
  await expect(page.locator("#swapSeatButton")).toBeEnabled();
  await page.locator("#swapSeatButton").click();
}

async function acceptHandoff(page, name) {
  await expect(page.locator(".gt-handoff")).toContainText(name);
  await page.locator(".gt-handoff button").click();
}

async function saveCandidate(page, index) {
  const candidates = page.locator(".gt-save-face");
  await expect(candidates).not.toHaveCount(0);
  await candidates.nth(index).click();
  await expect(page.locator(".gt-save-lock")).toBeEnabled();
  await page.locator(".gt-save-lock").click();
}

test("two players score shared picks as one co-op sync total", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  await expect(page.locator("#questionPrompt")).not.toBeEmpty();
  await expect(page.locator(".gt-selection-tray")).toContainText("ADA'S PICKS");
  await expect(page.locator(".gt-selection-tray")).not.toContainText("selected");
  await expect(page.locator(".gt-selection-tray")).not.toContainText("saw");
  // Ballot size is dynamic (the board and crowd ramps decide it), so drive the test off the ballot the
  // round actually dealt rather than a hard-coded three - identical ballots must read as a total match
  // at any size. Read gt().pickCount, not resolvePickCount(): the round pins its size when it starts.
  const picks = await page.evaluate(() => state.groupthink.pickCount);
  const ballot = Array.from({ length: picks }, (_, index) => index);
  const boardBefore = await page.locator("#characterBoard [data-id]").count();
  await pick(page, ballot);
  await acceptHandoff(page, "Bea");
  await pick(page, ballot);
  await expect(page.locator(".gt-results")).toBeVisible();
  // Every pick shared: two points a face, and the duo's top-of-the-range sync banner.
  await expect(page.locator(".gt-sync-result")).toContainText(`+${picks * 2}`);
  await expect(page.locator(".gt-sync-result")).toContainText("SHARED BRAIN CELL");
  await expect(page.locator(".gt-save-lock")).toContainText("ADA:");
  await saveCandidate(page, 0);
  await acceptHandoff(page, "Bea");
  await saveCandidate(page, 0);
  await expect(page.locator(".gt-saw-verdict")).toContainText("survived the vote");
  await expect(page.locator(".gt-result-face.is-saved")).toHaveCount(1);
  await expect(page.locator(".gt-result-face.is-cut")).toHaveCount(picks - 1);
  await page.locator(".gt-next").click();
  await expect(page.locator("#characterBoard [data-id]")).toHaveCount(boardBefore - (picks - 1));
});

test("Groupthink opens with its own consensus splash", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "opening animation runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"], { dismissIntro: false });
  await expect(page.locator(".gt-intro-kicker")).toHaveText("EVERYONE SEES THE SAME FACES.");
  await expect(page.locator(".gt-intro-logo")).toContainText("WHO?");
  await expect(page.locator(".gt-intro-logo")).toContainText("DO YOU THINK?");
  await expect(page.locator(".gt-intro-cards i")).toHaveCount(3);
  await page.locator(".gt-intro-skip").click();
  await expect(page.locator(".gt-intro-warp")).toHaveCount(0);
});

test("Groupthink splash fits the active viewport", async ({ page }) => {
  await openGroupthink(page, ["Ada", "Bea"], { dismissIntro: false });
  const layout = await page.locator(".gt-intro-stage").evaluate((stage) => {
    const rect = stage.getBoundingClientRect();
    return {
      top: rect.top,
      bottom: rect.bottom,
      viewport: window.innerHeight,
      overflow: document.documentElement.scrollWidth - window.innerWidth
    };
  });
  expect(layout.top).toBeGreaterThanOrEqual(-1);
  expect(layout.bottom).toBeLessThanOrEqual(layout.viewport + 1);
  expect(layout.overflow).toBeLessThanOrEqual(3);
  await page.locator(".gt-intro-skip").click();
});

test("desktop question rail switches at stable scroll thresholds without changing its grid", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop sticky rail regression");
  await openGroupthink(page, ["Ada", "Bea"]);
  const sample = () => page.evaluate(() => {
    const panel = document.querySelector(".side-panel");
    const style = getComputedStyle(panel);
    return {
      progress: Number(getComputedStyle(document.documentElement).getPropertyValue("--hud-collapse-progress")),
      areas: style.gridTemplateAreas,
      height: panel.getBoundingClientRect().height,
      promptSize: parseFloat(getComputedStyle(document.querySelector(".question-prompt")).fontSize),
      helperOpacity: Number(getComputedStyle(document.querySelector(".cue-card")).getPropertyValue("--hud-helper-opacity") || getComputedStyle(document.documentElement).getPropertyValue("--hud-helper-opacity"))
    };
  });
  const top = await sample();
  await page.evaluate(() => window.scrollTo(0, 90));
  await page.waitForTimeout(260);
  const belowThreshold = await sample();
  await page.evaluate(() => window.scrollTo(0, 140));
  await page.waitForTimeout(260);
  const collapsed = await sample();
  await page.evaluate(() => window.scrollTo(0, 80));
  await page.waitForTimeout(260);
  const hysteresis = await sample();
  await page.evaluate(() => window.scrollTo(0, 30));
  await page.waitForTimeout(260);
  const expanded = await sample();
  expect(top.progress).toBeLessThan(0.05);
  expect(belowThreshold.progress).toBe(0);
  expect(collapsed.progress).toBeGreaterThan(0.95);
  expect(hysteresis.progress).toBe(1);
  expect(expanded.progress).toBe(0);
  expect(new Set([top.areas, belowThreshold.areas, collapsed.areas, hysteresis.areas, expanded.areas]).size).toBe(1);
  expect(collapsed.promptSize).toBeLessThan(top.promptSize);
  expect(collapsed.height).toBeLessThan(top.height);
  expect(expanded.promptSize).toBeCloseTo(top.promptSize, 1);
});

test("Groupthink presents its shared prompt as text, not a reroll button", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "desktop prompt affordance regression");
  await openGroupthink(page, ["Ada", "Bea"]);
  const cue = page.locator(".cue-card");
  const prompt = await page.locator("#questionPrompt").textContent();
  await expect(cue).not.toHaveClass(/is-clickable/);
  await expect(cue).not.toHaveAttribute("role", "button");
  await expect(cue).not.toHaveAttribute("tabindex");
  await expect(cue).not.toHaveAttribute("title");
  await cue.click();
  await expect(page.locator("#questionPrompt")).toHaveText(prompt);
});

test("standard scoring rewards matches and gives the no-match safety net", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea", "Cal"]);
  // Three players sit in the middle crowd band, so the ballot narrows to two picks - a full board
  // would otherwise hand out three, and consensus across three ballots would be a formality.
  await expect.poll(() => page.evaluate(() => window.Groupthink.resolvePickCount())).toBe(2);
  await pick(page, [0, 1]);
  await acceptHandoff(page, "Bea");
  await pick(page, [0, 3]);
  await acceptHandoff(page, "Cal");
  await pick(page, [5, 6]);
  await expect(page.locator(".gt-results")).toBeVisible();
  const rows = page.locator(".gt-score-row");
  await expect(rows.nth(0)).toContainText("+2");
  await expect(rows.nth(1)).toContainText("+2");
  // The lone wolf's consolation is a flat floor of one - a single match (the other two seats) always
  // beats it, so the isolated seat scores +1 regardless of ballot size.
  await expect(rows.nth(2)).toContainText("+1");
  await expect(rows.nth(2)).toContainText("LONE WOLF");
});

test("a big table narrows the ballot to a single pick", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea", "Cal", "Dee", "Eve", "Fay", "Gus"]);
  await expect.poll(() => page.evaluate(() => window.Groupthink.resolvePickCount())).toBe(1);
  // The prompt must read as a single accusation, never "the three ...".
  const prompt = await page.locator("#questionPrompt").textContent();
  expect(prompt).not.toMatch(/\bthree\b/i);
  expect(prompt).not.toMatch(/\{n\}/);
  await pick(page, [0]);
});

test("a refresh resumes the exact Groupthink ballot", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  const firstId = await page.locator("#characterBoard [data-id]").first().getAttribute("data-id");
  const prompt = await page.locator("#questionPrompt").innerText();
  await page.locator("#characterBoard [data-id]").first().click();
  await page.waitForTimeout(700);
  await page.reload();
  await expect(page.locator("body")).toHaveClass(/ruleset-groupthink/);
  await expect(page.locator("#questionPrompt")).toHaveText(prompt);
  await expect(page.locator(`#characterBoard [data-id="${firstId}"]`)).toHaveClass(/gt-picked/);
  await expect(page.locator(".gt-selection-tray .gt-tray-face img")).toHaveCount(1);
});

test("split save votes cut every nominated face from the shared plain-card board", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  await pick(page, [0, 1, 2]);
  await acceptHandoff(page, "Bea");
  await pick(page, [3, 4, 5]);
  await expect(page.locator(".gt-sync-result")).toContainText("+0");
  await saveCandidate(page, 0);
  await acceptHandoff(page, "Bea");
  await saveCandidate(page, 1);
  await expect(page.locator(".gt-saw-verdict")).toContainText("NOBODY WAS SAVED");
  await expect(page.locator(".gt-result-face.is-cut")).toHaveCount(6);
  await page.evaluate(() => window.Groupthink.startRound(1, { effectId: "habbo", roundSalt: "test-plain-survivors", announce: false }));
  await expect(page.locator("#characterBoard")).not.toHaveClass(/habbo-board/);
  await expect(page.locator("#characterBoard .character-card[data-id]")).toHaveCount(24);
  await expect(page.locator("#characterBoard .habbo-room")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => ({ effect: state.groupthink.effectId, mystery: state.global.mystery }))).toEqual({ effect: null, mystery: null });
});

test("ballots shrink from three to two to one with the communal cast", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  const limits = await page.evaluate(() => [13, 12, 6, 5, 2].map((count) => window.Groupthink.pickCountForBoard(count)));
  expect(limits).toEqual([3, 2, 2, 1, 1]);
});

test("three-face agreement cuts one immediately and the final two resolves with no save vote", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  await page.evaluate(() => {
    state.groupthink.baseBoard = state.groupthink.baseBoard.slice(0, 3);
    state.groupthink.removed = [];
    Groupthink.startRound(0, { roundSalt: "three-face-cut" });
  });
  await expect(page.locator("#characterBoard [data-id]")).toHaveCount(3);
  await pick(page, [1]);
  await acceptHandoff(page, "Bea");
  await pick(page, [1]);
  await expect(page.locator(".gt-save-face")).toHaveCount(0);
  await expect(page.locator(".gt-saw-verdict")).toContainText("FINAL TWO UNLOCKED");
  await expect.poll(() => page.evaluate(() => ({
    phase: state.groupthink.phase,
    board: state.board.length,
    removed: state.groupthink.lastResult.saveOutcome.removedIds.length
  }))).toEqual({ phase: "results", board: 2, removed: 1 });
  await page.locator(".gt-next").click();
  await expect(page.locator("#characterBoard [data-id]")).toHaveCount(2);
  await expect(page.locator(".gt-selection-tray .gt-tray-face")).toHaveCount(1);
  await expect(page.locator(".gt-selection-tray")).toContainText("1 DESTROYED");
  await expect(page.locator(".gt-status")).toContainText("THE FINAL TWO");

  // The showdown: both condemn the same face — no save vote, the other face is crowned.
  const finalists = await page.evaluate(() => state.board.map((character) => character.name));
  await pick(page, [0]);
  await acceptHandoff(page, "Bea");
  await pick(page, [0]);
  await expect(page.locator(".gt-save-face")).toHaveCount(0);
  await expect(page.locator(".gt-saw-verdict")).toContainText("LAST FACE STANDING");
  await expect.poll(() => page.evaluate(() => ({
    phase: state.groupthink.phase,
    board: state.board.length
  }))).toEqual({ phase: "results", board: 1 });
  const showdown = await page.evaluate(() => ({
    crownedId: state.groupthink.lastResult.saveOutcome.crownedId,
    survivorId: state.board[0]?.id
  }));
  expect(showdown.crownedId).toBe(showdown.survivorId);
  await expect(page.locator(".gt-next")).toHaveText("FINAL RESULTS");
  await page.locator(".gt-next").click();
  await expect(page.locator(".gt-final-survivor")).toContainText(finalists[1]);
  await expect(page.locator(".gt-final-runnerup")).toContainText(finalists[0]);
});

test("prompt rerolls keep producing fresh prompts instead of ping-ponging", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  const seen = await page.evaluate(() => {
    const ids = [state.groupthink.promptId];
    for (let i = 0; i < 3; i += 1) {
      window.Groupthink.rerollPrompt();
      ids.push(state.groupthink.promptId);
    }
    return ids;
  });
  expect(new Set(seen).size).toBe(seen.length);
});

test("Groupthink setup exposes prompt safety but no mystery-effect controls", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset setup regression runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  await page.locator("#setupButton").click();
  await expect(page.locator("#setupDialog .setup-mode-row")).toBeHidden();
  await expect(page.locator("#setupDialog .mode-section")).toBeHidden();
  await expect(page.locator("#settingPG").locator("xpath=ancestor::label")).toContainText("Keep the judgement prompts kid-safe");
});

test("YOLO off keeps the full deck and skips the save ceremony", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"], { yolo: false });
  await expect(page.locator(".gt-status")).toContainText("ROUND 1 / 8 · FULL DECK");
  await pick(page, [0, 1, 2]);
  await acceptHandoff(page, "Bea");
  await pick(page, [0, 1, 2]);
  await expect(page.locator(".gt-results")).toBeVisible();
  await expect(page.locator(".gt-save-face")).toHaveCount(0);
  await expect(page.locator(".gt-next")).toHaveText("NEXT PROMPT →");
  await page.locator(".gt-next").click();
  await expect(page.locator("#characterBoard [data-id]")).toHaveCount(30);
  await expect(page.locator(".gt-status")).toContainText("ROUND 2 / 8 · FULL DECK");
});

test("only the current host can change a Groupthink prompt and stale revisions are ignored", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  const result = await page.evaluate(() => {
    state.gameMode = "online";
    state.isHost = false;
    state.clientId = "guest-client";
    state.mySeat = 1;
    state.roster[0].clientId = "host-client";
    state.roster[1].clientId = "guest-client";
    const before = state.groupthink.promptId;
    const next = window.GameData.groupthinkPrompts.base.find((prompt) => prompt.id !== before);
    const revision = state.groupthink.revision + 1;
    window.Groupthink.handleNetMessage({ type: "gt-prompt", clientId: "not-the-host", roundIndex: 0, promptId: next.id, revision });
    const afterForgery = state.groupthink.promptId;
    window.Groupthink.handleNetMessage({ type: "gt-prompt", clientId: "host-client", roundIndex: 0, promptId: next.id, revision });
    const afterHost = state.groupthink.promptId;
    window.Groupthink.handleNetMessage({ type: "gt-prompt", clientId: "host-client", roundIndex: 0, promptId: before, revision });
    return { before, next: next.id, afterForgery, afterHost, afterStale: state.groupthink.promptId };
  });
  expect(result.afterForgery).toBe(result.before);
  expect(result.afterHost).toBe(result.next);
  expect(result.afterStale).toBe(result.next);
});

test("a skipped player gets zero rather than the no-match consolation", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  const score = await page.evaluate(() => {
    const picks = [[], state.board.slice(0, 3).map((character) => character.id)];
    const result = window.Groupthink.calculate(picks, [true, false]);
    return { skipped: result.skipped, roundScores: result.roundScores, roundSync: result.roundSync };
  });
  expect(score.skipped).toEqual([true, false]);
  expect(score.roundScores).toEqual([0, 0]);
  expect(score.roundSync).toBe(0);
});

test("mystery injections are ignored and a plain-board observer stays read-only", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "ruleset smoke runs once on desktop");
  await openGroupthink(page, ["Ada", "Bea"]);
  await page.evaluate(() => {
    window.Groupthink.startRound(1, { effectId: "habbo", roundSalt: "test-plain-groupthink", announce: false });
    handleNetMsg({ type: "mode", id: "heads-only", clientId: "classic-stale-peer" });
  });
  await expect(page.locator("#characterBoard .habbo-room, #characterBoard .heads-layer")).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => state.global.mystery)).toBeNull();
  const first = page.locator("#characterBoard .character-card[data-id]").first();
  const id = await first.getAttribute("data-id");
  await first.click();
  await expect(page.locator(`#characterBoard .character-card[data-id="${id}"]`)).toHaveClass(/gt-picked/);

  const before = await page.evaluate(() => state.groupthink.picks[state.mySeat || 0].slice());
  await page.evaluate(() => { state.isObserver = true; render(); });
  const observerCard = page.locator(`#characterBoard .character-card[data-id="${id}"]`);
  await observerCard.click();
  await expect.poll(() => page.evaluate(() => state.groupthink.picks[state.mySeat || 0].slice())).toEqual(before);
});

test("WHO? IS IT? still owns and renders the full mystery-effect engine", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "cross-ruleset regression runs once on desktop");
  await page.addInitScript(() => {
    try { localStorage.removeItem("whoisit_game_v1"); } catch (e) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await page.locator(".ts-letplay").click();
  await page.locator('.ts-ruleset[data-ruleset="whoisit"]').click();
  await page.locator(".ts-local").click();
  await expect(page.locator(".ts-step-names .ts-mode-lineup")).toBeVisible();
  await page.locator(".ts-name-slot").nth(0).fill("Ada");
  await page.locator(".ts-name-slot").nth(1).fill("Bea");
  await page.locator(".ts-names-go").click();
  await page.evaluate(() => {
    document.querySelectorAll(".dimension-warp, .round-reveal").forEach((element) => element.remove());
    window.MysteryModes.applyMysteryEffect("pantone");
    render();
  });
  await expect.poll(() => page.evaluate(() => ({ ruleset: state.ruleset, mystery: state.global.mystery?.id }))).toEqual({ ruleset: "whoisit", mystery: "pantone" });
  await expect(page.locator("#characterBoard")).toHaveClass(/pantone-board/);
  await expect(page.locator("#characterBoard .character-card[data-id]")).not.toHaveCount(0);
});
