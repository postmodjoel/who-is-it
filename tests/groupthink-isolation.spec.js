import { expect, test } from "@playwright/test";

// This is intentionally explicit: a future effect that adds a custom renderer or interaction hook
// must be added here and to classic's bespoke scenarios, or the registry gate fails loudly.
const BESPOKE_CLASSIC_SCENARIOS = [
  "family-tree-disaster", "fireworks", "habbo", "heads-only", "judgement", "knockoff-manor",
  "linkedin", "neighbourhood-watch", "pixall", "prop-panic", "ps1-mode", "sims", "swipe", "yugioh"
].sort();

async function startGroupthink(page, yolo) {
  await page.goto("/");
  await page.evaluate((useYolo) => {
    try { localStorage.removeItem("whoisit_game_v1"); } catch (error) { /* fine */ }
    state.ruleset = "groupthink";
    state.settings = normalizeGameSettings({ ...state.settings, groupthinkYolo: useYolo });
    startLocalGame(3, ["Seat 1", "Seat 2", "Seat 3"], "solo");
    document.querySelectorAll(".title-screen, .dimension-warp, .round-reveal").forEach((element) => element.remove());
  }, yolo);
  await expect(page.locator("body")).toHaveClass(/ruleset-groupthink/);
}

async function plainBoardState(page) {
  return page.evaluate(() => ({
    mystery: state.global.mystery,
    effect: state.groupthink.effectId,
    plainCards: document.querySelectorAll("#characterBoard .character-card[data-id]").length,
    totalTiles: document.querySelectorAll("#characterBoard [data-id]").length,
    specialDom: document.querySelectorAll(".habbo-room, .habbo-fig, .heads-toolbar, .float-head, .manor-room-tile, .manor-token, .family-cluster, #linkedinTicker, #nwTicker, .judgement-purgatory").length,
    mysteryClasses: (() => {
      const special = new Set(MysteryModes.allRegistered().flatMap((effect) => [...(effect.bodyClasses || []), ...(effect.boardClasses || [])]));
      return [...document.body.classList, ...document.querySelector("#characterBoard").classList].filter((className) => special.has(className));
    })()
  }));
}

test("every playable mystery effect is isolated from Groupthink with YOLO on and off", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "registry isolation runs once on desktop");
  test.setTimeout(180_000);

  for (const yolo of [true, false]) {
    await startGroupthink(page, yolo);
    const ids = await page.evaluate(() => MysteryModes.all().map((effect) => effect.id));
    for (const [index, id] of ids.entries()) {
      await page.evaluate(({ id: effectId, index: roundIndex }) => {
        // Local/debug round configuration.
        state.settings.startModeId = effectId;
        Groupthink.startRound(roundIndex + 1, { effectId, roundSalt: `isolation-${effectId}` });

        // A stale classic mid-round packet must be consumed without activating anything.
        handleNetMsg({ type: "mode", id: effectId, clientId: "stale-classic-seat" });

        // An online host cannot smuggle a classic effect through the authoritative START packet.
        handleNetMsg({
          type: "start",
          salt: `remote-isolation-${roundIndex}-${effectId}`,
          settings: { ...state.settings, startModeId: effectId },
          roster: state.roster.map((seat, rosterIndex) => ({
            name: seat.name,
            clientId: seat.clientId || `remote-seat-${rosterIndex}`
          })),
          playerCount: state.roster.length,
          playMode: "solo",
          ruleset: "groupthink",
          effectId,
          first: false,
          clientId: "remote-host"
        });

        // Saved-game restoration strips old mystery state before rendering.
        const saved = buildGameSave();
        saved.effectId = effectId;
        saved.wheelPick = effectId;
        saved.groupthink.effectId = effectId;
        Groupthink.resume(saved);

        // Debug picker changes are explicitly ignored while this ruleset owns the board.
        const picker = document.querySelector("#debugEffectPicker");
        if (picker) {
          picker.value = effectId;
          picker.dispatchEvent(new Event("change", { bubbles: true }));
        }
      }, { id, index });
      const state = await plainBoardState(page);
      expect(state.mystery, `${id} YOLO ${yolo}: mystery state`).toBeNull();
      expect(state.effect, `${id} YOLO ${yolo}: effect id`).toBeNull();
      expect(state.plainCards, `${id} YOLO ${yolo}: plain cards`).toBe(30);
      expect(state.totalTiles, `${id} YOLO ${yolo}: standard interaction tiles`).toBe(30);
      expect(state.specialDom, `${id} YOLO ${yolo}: bespoke DOM`).toBe(0);
      expect(state.mysteryClasses, `${id} YOLO ${yolo}: mystery classes`).toEqual([]);
    }
  }
});

test("Habbo, Heads Only and MURDER! LIVE! bespoke boards are explicitly absent", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "explicit high-risk absence runs once on desktop");
  await startGroupthink(page, true);
  for (const id of ["habbo", "heads-only", "knockoff-manor"]) {
    await page.evaluate((effectId) => Groupthink.startRound(1, { effectId, roundSalt: `absence-${effectId}` }), id);
    await expect(page.locator(".habbo-room, .habbo-fig, .heads-toolbar, .float-head, .manor-room-tile, .manor-token")).toHaveCount(0);
    await expect(page.locator("#characterBoard .character-card[data-id]")).toHaveCount(30);
  }
});

test("the classic bespoke-effect registry cannot grow without an explicit scenario", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "registry contract runs once on desktop");
  await page.goto("/");
  const hooked = await page.evaluate(() => MysteryModes.allRegistered()
    .filter((effect) => ["renderBoard", "prepareCard", "afterDefaultBoard", "teardown"].some((hook) => typeof effect[hook] === "function"))
    .map((effect) => effect.id)
    .sort());
  expect(hooked).toEqual(BESPOKE_CLASSIC_SCENARIOS);
});
