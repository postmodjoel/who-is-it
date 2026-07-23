import { expect, test } from "@playwright/test";

async function openDraft(page, names = ["Ada", "Bea"]) {
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("whoisit_game_v1");
      sessionStorage.removeItem("whoisit_online_game_v1");
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
    } catch (error) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await page.locator(".ts-letplay").click();
  await expect(page.locator(".ts-ruleset")).toHaveCount(3);
  // Focus carousel: a tap on an off-centre card only recentres it; the centred card is what launches.
  const wdymCard = page.locator('.ts-ruleset[data-ruleset="whodidyoumake"]');
  await wdymCard.click();
  await expect(wdymCard).toHaveClass(/is-focus/);
  await wdymCard.click();
  await expect(page).toHaveTitle("WHO? DID YOU MAKE?");
  await expect(page.locator(".ts-step-main .ts-online")).toBeEnabled();
  await page.locator(".ts-local").click();
  for (let index = 2; index < names.length; index += 1) await page.locator(".ts-add-player").click();
  const inputs = page.locator(".ts-name-slot");
  for (let index = 0; index < names.length; index += 1) await inputs.nth(index).fill(names[index]);
  await page.locator(".ts-names-go").click();
  await expect(page.locator("body")).toHaveClass(/ruleset-whodidyoumake/);
  await expect(page.locator(".wdym-handoff")).toBeVisible();
}

async function passCommissions(page) {
  await expect(page.locator(".wdym-handoff")).toBeVisible();
  if (await page.locator(".wdym-study-open").isVisible()) await page.locator(".wdym-study-open").click();
  await page.locator(".wdym-seen").click();
  await expect(page.locator(".wdym-draft")).toBeVisible();
}

async function renderedAnatomy(donor) {
  return donor.locator(".wdym-donor-portrait img").evaluate((img) => {
    const svg = decodeURIComponent(img.getAttribute("src") || "");
    return [...new Set([...svg.matchAll(/data-anatomy-part='([^']+)'/g)].map((match) => match[1]))];
  });
}

// One scripted pick: read the round state, claim either the picker's own recipe part
// (strategy "greedy"), a rival's wanted part ("steal", falling back to greedy), or the
// first legal claim ("first").
async function scriptedPick(page, strategy) {
  if (await page.locator(".wdym-handoff").isVisible()) {
    if (await page.locator(".wdym-study-open").isVisible()) await page.locator(".wdym-study-open").click();
    await page.locator(".wdym-seen").click();
  }
  const move = await page.evaluate((mode) => {
    const M = window.MakeRules;
    const round = state.whodidyoumake.rounds[state.whodidyoumake.roundIndex];
    const picker = M.currentPicker(round);
    const legal = M.legalClaims(round, picker);
    const recipe = round.recipes[picker];
    let choice = null;
    if (mode === "steal") {
      choice = legal.find((claim) => round.recipes.some((other, index) =>
        index !== picker && other[claim.part] === claim.donorId && recipe[claim.part] !== claim.donorId));
    }
    if (!choice && mode !== "first") choice = legal.find((claim) => recipe[claim.part] === claim.donorId);
    if (!choice) choice = legal[0];
    return { picker, donorId: choice.donorId, part: choice.part };
  }, strategy);
  await page.locator(`.wdym-donor[data-donor="${move.donorId}"]`).click();
  await page.locator(`.wdym-claim-part[data-part="${move.part}"]`).click();
  return move;
}

async function finishDraft(page, strategies = {}) {
  for (let guard = 0; guard < 40; guard += 1) {
    const done = await page.evaluate(() => {
      const M = window.MakeRules;
      const round = state.whodidyoumake.rounds[state.whodidyoumake.roundIndex];
      return M.draftComplete(round) ? true : { picker: M.currentPicker(round) };
    });
    if (done === true) break;
    await scriptedPick(page, strategies[done.picker] || "greedy");
  }
  await expect(page.locator(".wdym-reveal")).toBeVisible();
}

test("a full flesh-draft round: commissions, snake draft, part stamps, butcher's bill", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "full round smoke runs once");
  await openDraft(page);
  await passCommissions(page);
  await expect(page.locator(".wdym-donor")).toHaveCount(18);
  await expect(page.locator(".wdym-up-next")).toBeVisible();
  await expect(page.locator(".cue-card")).toBeHidden();   // visual mode: no question furniture
  await expect(page.locator(".wdym-donor-chips i")).toHaveCount(0);   // clean cards until something is taken
  const firstMove = await scriptedPick(page, "greedy");
  await passCommissions(page);
  await expect(page.locator(".wdym-donor-chips i")).toHaveCount(1);   // the claim ledger appears
  const strippedDonor = page.locator(`.wdym-donor[data-donor="${firstMove.donorId}"]`);
  await expect(strippedDonor).toHaveAttribute("data-removed-parts", firstMove.part);
  expect(await renderedAnatomy(strippedDonor)).not.toContain(firstMove.part);

  await finishDraft(page);
  // The stage runs worst-build-first so the round climbs toward its winner.
  const expectedFirst = await page.evaluate(() => {
    const round = state.whodidyoumake.rounds[0];
    return state.roster[round.revealOrder[0]].name.toUpperCase();
  });
  await expect(page.locator(".wdym-screen-head h2")).toContainText(expectedFirst);
  await expect(page.locator(".wdym-next-reveal")).toContainText("NEXT BUILD");
  await expect(page.locator(".wdym-sources")).toHaveCount(2);   // built-from and made-from strips
  await expect(page.locator(".wdym-reveal-side:last-child .wdym-sources img")).toHaveCount(6);
  await expect(page.locator(".wdym-part-stamps .wdym-stamp")).toHaveCount(6);
  await expect(page.locator(".wdym-match-key")).toContainText("SUBSTITUTIONS SCORE ABOVE 40%");
  await expect(page.locator(".wdym-stamp:not(.is-exact) .wdym-match-factor").first()).toBeVisible();
  await expect(page.locator(".wdym-match-percent")).toHaveCount(6);
  const signals = await page.locator(".wdym-stamp:not(.is-exact) .wdym-match-factor i").allTextContents();
  expect(signals.length).toBeGreaterThan(0);
  signals.forEach((signal) => expect(signal).toMatch(/^(\+\+\+|\+\+|\+|—)$/));
  await page.locator(".wdym-next-reveal").click();
  await expect(page.locator(".wdym-part-stamps .wdym-stamp")).toHaveCount(6);
  await page.locator(".wdym-next-reveal").click();

  await expect(page.locator(".wdym-score")).toBeVisible();
  await expect(page.locator(".wdym-score-card")).toHaveCount(2);
  await expect(page.locator(".wdym-bill-pair img")).toHaveCount(4);
  const scores = await page.evaluate(() => state.whodidyoumake.scores);
  expect(Math.max(...scores)).toBeGreaterThan(40);

  await page.locator(".wdym-next-round").click();
  await expect(page.locator(".wdym-handoff")).toBeVisible();
  const roundIndex = await page.evaluate(() => state.whodidyoumake.roundIndex);
  expect(roundIndex).toBe(1);
});

test("snipped facial features are omitted so the face surface beneath stays blank", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "hidden anatomy smoke runs once");
  await openDraft(page);
  await passCommissions(page);

  const donorId = await page.evaluate(() => state.whodidyoumake.rounds[0].donors[0].id);
  await page.locator(`.wdym-donor[data-donor="${donorId}"]`).click();
  await page.locator('.wdym-claim-part[data-part="eyes"]').click();
  await passCommissions(page);
  await page.locator(`.wdym-donor[data-donor="${donorId}"]`).click();
  await page.locator('.wdym-claim-part[data-part="mouth"]').click();
  await passCommissions(page);

  const donor = page.locator(`.wdym-donor[data-donor="${donorId}"]`);
  const anatomy = await renderedAnatomy(donor);
  expect(anatomy).not.toContain("eyes");
  expect(anatomy).not.toContain("mouth");
  expect(anatomy).toEqual(expect.arrayContaining(["skull", "nose", "hair", "body"]));
  await expect(donor.locator(".wdym-zap-remnant")).toHaveCount(0);
  const removed = (await donor.getAttribute("data-removed-parts")).split(" ");
  expect(removed).toEqual(expect.arrayContaining(["eyes", "mouth"]));
  await expect(donor).toHaveAttribute("aria-label", /Removed:/);
});

test("stealing a rival's part is worn by the thief and stamped STOLEN at the reveal", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "theft smoke runs once");
  await openDraft(page);
  await passCommissions(page);
  // Seat 0 opens with a spiteful steal, then everyone plays greedy.
  const theft = await scriptedPick(page, "steal");
  await finishDraft(page);
  const results = await page.evaluate(() => state.whodidyoumake.rounds[0].results);
  const recorded = results.thefts.find((entry) => entry.thief === theft.picker);
  if (recorded) {
    // Walk reveals until the victim's board shows the STOLEN stamp.
    for (let step = 0; step <= recorded.victim; step += 1) {
      if (step === recorded.victim) {
        await expect(page.locator(".wdym-stamp.is-stolen").first()).toBeVisible();
        await expect(page.locator(".wdym-stamp.is-stolen").first()).toContainText("STOLEN");
      }
      await page.locator(".wdym-next-reveal").click();
    }
  }
});

test("a one-round session reaches the finale with a crowned winner and a gallery", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "finale smoke runs once");
  await openDraft(page);
  // The host trims the night to one body via the toggle on the first commission screen.
  await page.locator(".wdym-bodies").click();   // 3 -> 4
  await page.locator(".wdym-bodies").click();   // 4 -> 5
  await page.locator(".wdym-bodies").click();   // 5 -> 1
  await expect(page.locator(".wdym-bodies")).toContainText("TO BUILD: 1");
  await passCommissions(page);
  await finishDraft(page);
  await page.locator(".wdym-next-reveal").click();
  await page.locator(".wdym-next-reveal").click();
  await expect(page.locator(".wdym-next-round")).toContainText("FINAL SCORES");
  await page.locator(".wdym-next-round").click();
  await expect(page.locator(".wdym-finale")).toBeVisible();
  await expect(page.locator(".wdym-final-score > span")).toHaveCount(2);
  await expect(page.locator(".wdym-final-score > span.is-winner")).toHaveCount(1);
  await expect(page.locator(".wdym-gallery figure")).toHaveCount(2);
});

test("the cast is the default slab, strangers stay one toggle away", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "donor source smoke runs once");
  await openDraft(page);
  const toggle = page.locator(".wdym-donors");
  await expect(toggle).toContainText("THE CAST");
  await toggle.click();
  await expect(toggle).toContainText("STRANGERS");
  await toggle.click();
  await expect(toggle).toContainText("THE CAST");
  await passCommissions(page);
  await expect(page.locator(".wdym-donor-name")).toHaveCount(18);
  const names = await page.locator(".wdym-donor-name").allTextContents();
  expect(names.every((name) => name.trim().length > 0 && !/^Donor /.test(name))).toBe(true);
});

test("the flesh draft seats at most six players", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "seat cap smoke runs once");
  await page.addInitScript(() => {
    try {
      localStorage.removeItem("whoisit_game_v1");
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
    } catch (error) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await page.locator(".ts-letplay").click();
  // Focus carousel: recentre the off-centre card, then the centred card launches.
  const wdymCard = page.locator('.ts-ruleset[data-ruleset="whodidyoumake"]');
  await wdymCard.click();
  await expect(wdymCard).toHaveClass(/is-focus/);
  await wdymCard.click();
  await page.locator(".ts-local").click();
  const addButton = page.locator(".ts-add-player");
  for (let index = 0; index < 8 && await addButton.isEnabled(); index += 1) await addButton.click();
  await expect(page.locator(".ts-name-slot")).toHaveCount(6);
  await expect(addButton).toBeDisabled();
});

test("each local turn studies target and build before a board with neither and no peeks", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "memory-flow smoke runs once");
  await openDraft(page);
  await expect(page.locator(".wdym-study-pair img")).toHaveCount(2);
  await expect(page.locator(".wdym-study-pair figcaption")).toHaveText(["COMMISSION", "YOUR BUILD"]);
  await expect(page.locator(".wdym-sources")).toHaveCount(0);   // no source hints before the reveal
  await passCommissions(page);
  await expect(page.locator(".wdym-study-pair, .wdym-commission-face, .wdym-tray")).toHaveCount(0);
  await expect(page.locator(".wdym-peek-hold, .wdym-peek-overlay")).toHaveCount(0);
  await scriptedPick(page, "greedy");
  await expect(page.locator(".wdym-handoff")).toBeVisible();
  await expect(page.locator(".wdym-study-pair")).toHaveCount(0);
  await page.locator(".wdym-study-open").click();
  await expect(page.locator(".wdym-study-pair img")).toHaveCount(2);
  await expect(page.locator(".wdym-handoff")).toContainText("0/6 PARTS");
});

test("a refresh resumes the draft mid-turn with every claim intact", async ({ page, context }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "resume smoke runs once");
  await openDraft(page);
  await passCommissions(page);
  await scriptedPick(page, "greedy");
  await scriptedPick(page, "greedy");
  await scriptedPick(page, "greedy");
  const before = await page.evaluate(() => JSON.stringify(state.whodidyoumake.rounds[0].claims));
  await page.waitForTimeout(650);

  const resumed = await context.newPage();
  await resumed.goto("/");
  await expect(resumed.locator("body")).toHaveClass(/ruleset-whodidyoumake/);
  await expect(resumed.locator(".wdym-handoff")).toBeVisible();
  const after = await resumed.evaluate(() => JSON.stringify(state.whodidyoumake.rounds[0].claims));
  expect(after).toBe(before);
  const phase = await resumed.evaluate(() => state.whodidyoumake.phase);
  expect(phase).toBe("commission-viewing");
});

test("retired WHO? WERE YOU? saves are cleared with an explanation instead of resuming", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "retirement smoke runs once");
  await page.addInitScript(() => {
    try {
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
      localStorage.setItem("whoisit_game_v1", JSON.stringify({
        v: 2, ruleset: "whowereyou", salt: "lineage-old", settings: {}, gameMode: "local",
        playerCount: 2, roster: [{ name: "Ada" }, { name: "Bea" }], board: [], players: [],
        whowereyou: { modeVersion: 2, sessionSeed: "lineage-old", rounds: [] }
      }));
    } catch (error) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await expect(page.locator(".ts-letplay")).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/ruleset-whodidyoumake/);
  const cleared = await page.evaluate(() => localStorage.getItem("whoisit_game_v1"));
  expect(cleared).toBeNull();
});

test("draft screens fit touch viewports without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(!["iphone", "tablet"].includes(testInfo.project.name), "touch layout only");
  await openDraft(page);
  await passCommissions(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(3);
  await page.locator(".wdym-donor").first().tap();
  await expect(page.locator(".wdym-claim-bar")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(3);
  const enabled = page.locator(".wdym-claim-part:not([disabled])").first();
  await enabled.tap();
  await expect(page.locator(".wdym-handoff")).toBeVisible();
  await expect(page.locator(".wdym-study-pair")).toHaveCount(0);
  await page.locator(".wdym-study-open").tap();
  await expect(page.locator(".wdym-study-pair img")).toHaveCount(2);
});

test("the flat reveal ledger fits touch viewports without horizontal overflow", async ({ page }, testInfo) => {
  test.skip(!["iphone", "tablet"].includes(testInfo.project.name), "touch reveal layout only");
  await openDraft(page);
  await passCommissions(page);
  await finishDraft(page, { 0: "greedy", 1: "first" });
  await expect(page.locator(".wdym-part-stamps .wdym-stamp")).toHaveCount(6);
  await expect(page.locator(".wdym-match-factor").first()).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(3);
});

test("genetics lab opens on the flesh-draft sampler with recipes and contention", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "lab smoke runs once");
  await page.goto("/labs/genetics-lab.html");
  await expect(page).toHaveTitle(/Genetics Lab/);
  await expect(page.locator('.lab-tab[data-view="draft"]')).toHaveClass(/is-active/);
  await expect(page.locator(".draft-donor")).toHaveCount(18);
  await expect(page.locator(".draft-recipe")).toHaveCount(2);
  await expect(page.locator(".draft-recipe span.is-contested").first()).toBeVisible();
  await page.locator("#draftPlayers").selectOption("4");
  await expect(page.locator(".draft-donor")).toHaveCount(18);
  await expect(page.locator(".draft-recipe")).toHaveCount(4);
});

test("the rate deck swipes with arrows, keeps notes with verdicts, undoes, and persists", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "rate deck smoke runs once");
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem("wdym-rate-test-ready")) return;
      sessionStorage.setItem("wdym-rate-test-ready", "1");
      localStorage.removeItem("wdym_face_ratings_v1");
    } catch (error) { /* blocked */ }
  });
  await page.goto("/labs/genetics-lab.html");
  await page.locator('.lab-tab[data-view="rate"]').click();
  await expect(page.locator(".rate-swipe-card")).toBeVisible();
  const firstFace = await page.locator(".rate-swipe-card").getAttribute("data-face");

  // note + chip ride the right-arrow yay
  await page.locator("#rateNote").fill("nice proportions");
  await page.locator('.rate-tag[data-tag="HAIR"]').click();
  await page.keyboard.press("ArrowRight");
  await expect(page.locator(`.rate-swipe-card:not([data-face="${firstFace}"])`)).toBeVisible();
  const stored = await page.evaluate(() => JSON.parse(localStorage.getItem("wdym_face_ratings_v1")));
  const first = Object.values(stored.faces)[0];
  expect(first.verdict).toBe("yay");
  expect(first.tags).toContain("HAIR");
  expect(first.note).toBe("nice proportions");

  // left arrow nays the next card; undo restores it to the top unrated
  await page.keyboard.press("ArrowLeft");
  await expect.poll(async () => (await page.evaluate(() =>
    Object.values(JSON.parse(localStorage.getItem("wdym_face_ratings_v1")).faces).filter((f) => f.verdict === "nay").length))).toBe(1);
  await page.locator("#rateUndo").click();
  await expect.poll(async () => (await page.evaluate(() =>
    Object.values(JSON.parse(localStorage.getItem("wdym_face_ratings_v1")).faces).filter((f) => f.verdict === "nay").length))).toBe(0);

  // skip advances without rating; ratings survive a reload
  const beforeSkip = await page.locator(".rate-swipe-card").getAttribute("data-face");
  await page.locator("#rateSkip").click();
  await expect(page.locator(`.rate-swipe-card:not([data-face="${beforeSkip}"])`)).toBeVisible();
  await page.reload();
  await page.locator('.lab-tab[data-view="rate"]').click();
  const persisted = await page.evaluate(() => Object.values(JSON.parse(localStorage.getItem("wdym_face_ratings_v1")).faces).length);
  expect(persisted).toBe(1);
  await expect(page.locator("#rateExport")).toBeVisible();
});

test("version-1 classic saves continue to resume after the ruleset swap", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "legacy save compatibility runs once");
  await page.addInitScript(() => {
    try {
      if (sessionStorage.getItem("legacy-save-test-ready")) return;
      sessionStorage.setItem("legacy-save-test-ready", "1");
      localStorage.removeItem("whoisit_game_v1");
      localStorage.setItem("whoisit_manifesto_v1", "1");
      localStorage.setItem("whoisit_onboarded_v1", "1");
    } catch (error) { /* storage may be blocked */ }
  });
  await page.goto("/");
  await page.locator(".ts-letplay").click();
  await page.locator('.ts-ruleset[data-ruleset="whoisit"]').click();
  await page.locator(".ts-local").click();
  await page.locator(".ts-name-slot").nth(0).fill("Legacy A");
  await page.locator(".ts-name-slot").nth(1).fill("Legacy B");
  await page.locator(".ts-names-go").click();
  await expect(page.locator(".character-card").first()).toBeVisible();
  await page.waitForTimeout(650);
  await page.evaluate(() => {
    const key = "whoisit_game_v1";
    const saved = JSON.parse(localStorage.getItem(key));
    saved.v = 1;
    delete saved.whodidyoumake;
    localStorage.setItem(key, JSON.stringify(saved));
  });
  await page.reload();
  await expect(page.locator(".character-card").first()).toBeVisible();
  await expect(page.locator("body")).not.toHaveClass(/ruleset-whodidyoumake/);
});
