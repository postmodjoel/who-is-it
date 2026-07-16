import { expect, test } from "@playwright/test";

const PLAYER_COUNTS = [2, 3, 4, 6, 9, 12];

async function startDirect(page, playerCount, yolo) {
  await page.goto("/");
  await page.evaluate(({ playerCount: count, yolo: useYolo }) => {
    try { localStorage.removeItem("whoisit_game_v1"); } catch (error) { /* storage can be disabled */ }
    state.ruleset = "groupthink";
    state.settings = normalizeGameSettings({ ...state.settings, groupthinkYolo: useYolo });
    startLocalGame(count, Array.from({ length: count }, (_, seat) => `Seat ${seat + 1}`), "solo");
    document.querySelectorAll(".title-screen, .dimension-warp, .round-reveal").forEach((element) => element.remove());
  }, { playerCount, yolo });
  await expect(page.locator("body")).toHaveClass(/ruleset-groupthink/);
}

test("all supported player counts initialise complete local state with YOLO on and off", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "direct scale coverage runs once on desktop");
  test.setTimeout(150_000);

  for (const playerCount of PLAYER_COUNTS) {
    for (const yolo of [true, false]) {
      await startDirect(page, playerCount, yolo);
      const snapshot = await page.evaluate(() => {
        const ids = state.board.slice(0, 3).map((character) => character.id);
        const picks = state.players.map((_, seat) => ids.map((id, index) => state.board[(seat + index) % state.board.length].id));
        const score = Groupthink.calculate(picks, Array(state.players.length).fill(false));
        return {
          players: state.players.length,
          roster: state.roster.length,
          board: state.board.length,
          phase: state.groupthink.phase,
          effect: state.groupthink.effectId,
          mystery: state.global.mystery,
          arrays: ["picks", "doubleDowns", "locked", "skipped", "saveVotes", "saveLocked", "saveSkipped", "scores", "roundScores"]
            .map((key) => state.groupthink[key].length),
          scoreSeats: score.roundScores.length,
          active: score.activePlayerCount,
          support: score.support
        };
      });
      expect(snapshot.players).toBe(playerCount);
      expect(snapshot.roster).toBe(playerCount);
      expect(snapshot.board).toBe(30);
      expect(snapshot.phase).toBe("selecting");
      expect(snapshot.effect).toBeNull();
      expect(snapshot.mystery).toBeNull();
      expect(snapshot.arrays).toEqual(Array(9).fill(playerCount));
      expect(snapshot.scoreSeats).toBe(playerCount);
      expect(snapshot.active).toBe(playerCount);
      expect(snapshot.support).toBe(playerCount >= 9 ? 3 : 2);
      await expect(page.locator(".gt-roster-chip")).toHaveCount(playerCount);
    }
  }
});

test("pick transitions, full-deck preservation and finale boundaries share production rules", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "rules checks run once on desktop");
  await startDirect(page, 4, true);
  const boundaries = await page.evaluate(() => ({
    picks: [30, 13, 12, 6, 5, 1, 0].map((boardCount) => GroupthinkRules.pickCountForBoard(boardCount, true)),
    yoloDone: [2, 1, 0].map((boardCount) => GroupthinkRules.isSessionComplete({ yolo: true, boardCount, roundIndex: 0 })),
    fullDeckDone: [6, 7, 8].map((roundIndex) => GroupthinkRules.isSessionComplete({ yolo: false, boardCount: 30, roundIndex }))
  }));
  expect(boundaries.picks).toEqual([3, 3, 2, 2, 1, 1, 1]);
  expect(boundaries.yoloDone).toEqual([false, true, true]);
  expect(boundaries.fullDeckDone).toEqual([false, true, true]);

  await startDirect(page, 4, false);
  await page.evaluate(() => Groupthink.startRound(5, { roundSalt: "full-deck-regression" }));
  await expect(page.locator("#characterBoard .character-card[data-id]")).toHaveCount(30);
  await expect(page.locator(".gt-status")).toContainText("FULL DECK");
});

test("candidate 30, 36 and 40 face boards remain visible and tappable", async ({ page }, testInfo) => {
  test.setTimeout(90_000);
  await startDirect(page, 12, true);
  for (const boardSize of [30, 36, 40]) {
    await page.evaluate((size) => {
      state.board = buildBoard(generatedCharacters, size);
      state.groupthink.baseBoard = state.board.map(serializeCharacter);
      state.groupthink.removed = [];
      Groupthink.startRound(0, { roundSalt: `layout-${size}` });
    }, boardSize);
    const layout = await page.locator("#characterBoard .character-card[data-id]").evaluateAll((cards) => ({
      count: cards.length,
      visible: cards.every((card) => {
        const rect = card.getBoundingClientRect();
        return rect.width >= 36 && rect.height >= 44;
      }),
      overflow: document.documentElement.scrollWidth - window.innerWidth
    }));
    expect(layout.count).toBe(boardSize);
    expect(layout.visible, `${testInfo.project.name} ${boardSize}-face tap targets`).toBe(true);
    expect(layout.overflow, `${testInfo.project.name} ${boardSize}-face horizontal overflow`).toBeLessThanOrEqual(3);
    const first = page.locator("#characterBoard .character-card[data-id]").first();
    await first.click();
    await expect(first).toHaveClass(/gt-picked/);
  }
});

