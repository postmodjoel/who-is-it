import assert from "node:assert/strict";
import test from "node:test";

await import("../groupthink-rules.js");
const Rules = globalThis.GroupthinkRules;

test("pick-count and support boundaries preserve the live rules", () => {
  assert.deepEqual([13, 12, 6, 5, 2].map((count) => Rules.pickCountForBoard(count, true)), [3, 2, 2, 1, 1]);
  assert.equal(Rules.pickCountForBoard(2, false), 3);
  assert.deepEqual([2, 8, 9, 12].map(Rules.matchSupport), [2, 2, 3, 3]);
  assert.deepEqual([2, 8, 9, 12].map((count) => Rules.saveSupport(count, "current")), [2, 2, 3, 3]);
});

test("three-player scoring preserves matches and the zero-match consolation", () => {
  const result = Rules.scoreRound({
    picks: [["a", "b", "c"], ["a", "d", "e"], ["f", "g", "h"]],
    scores: [0, 0, 0]
  });
  assert.deepEqual(result.matchCounts, [1, 1, 0]);
  assert.deepEqual(result.roundScores, [2, 2, 3]);
  assert.deepEqual(result.scores, [2, 2, 3]);
  assert.equal(result.support, 2);
});

test("skipped seats are removed before support and never receive consolation", () => {
  const result = Rules.scoreRound({
    picks: [[], ["a", "b", "c"], ["a", "d", "e"]],
    skipped: [true, false, false]
  });
  assert.equal(result.activePlayerCount, 2);
  assert.deepEqual(result.roundScores, [0, 2, 2]);
});

test("duo scoring remains one shared sync score", () => {
  const result = Rules.scoreRound({
    picks: [["a", "b", "c"], ["a", "b", "c"]],
    duo: true,
    scores: [4, 4],
    syncScore: 6,
    doubleDownEnabled: true,
    doubleDowns: ["a", "a"]
  });
  assert.equal(result.roundSync, 6);
  assert.equal(result.syncScore, 12);
  assert.deepEqual(result.roundScores, [6, 6]);
  assert.deepEqual(result.doubleDowns, [null, null]);
});

test("optional double-down doubles a hit and a miss forfeits consolation", () => {
  const hit = Rules.scoreRound({
    picks: [["a", "b", "c"], ["a", "d", "e"], ["f", "g", "h"]],
    doubleDowns: ["a", null, null],
    doubleDownEnabled: true
  });
  assert.deepEqual(hit.roundScores, [4, 2, 3]);
  const miss = Rules.scoreRound({
    picks: [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]],
    doubleDowns: ["a", null, null],
    doubleDownEnabled: true
  });
  assert.deepEqual(miss.roundScores, [0, 3, 3]);
});

test("save resolution distinguishes winners, ties and insufficient support", () => {
  const common = {
    boardIds: ["a", "b", "c", "d", "e", "f"],
    picks: [["a", "b", "c"], ["a", "d", "e"], ["b", "d", "f"]],
    savePolicy: "current"
  };
  const saved = Rules.resolveSave({ ...common, votes: ["a", "a", "b"] });
  assert.equal(saved.savedId, "a");
  assert.deepEqual(saved.removedIds.sort(), ["b", "c", "d", "e", "f"]);
  const tied = Rules.resolveSave({ ...common, votes: ["a", "b", "c"] });
  assert.equal(tied.savedId, null);
  assert.equal(tied.tied, true);
  const insufficient = Rules.resolveSave({ ...common, votes: ["a", "b", "b"], skipped: [false, true, true] });
  assert.equal(insufficient.savedId, null);
  assert.equal(insufficient.insufficientSupport, true);
});

test("one-pick agreement crowns the final survivor", () => {
  const result = Rules.resolveSave({
    boardIds: ["a", "b", "c", "d"],
    picks: [["a"], ["a"]],
    votes: ["a", "a"],
    pickCount: 1
  });
  assert.equal(result.savedId, "a");
  assert.deepEqual(result.removedIds, ["b", "c", "d"]);
});

test("board policies and session endings are deterministic", () => {
  assert.equal(Rules.boardSizeForPlayers(12, "all-30"), 30);
  assert.equal(Rules.boardSizeForPlayers(9, "36-at-9"), 36);
  assert.equal(Rules.boardSizeForPlayers(12, "40-at-9"), 40);
  assert.equal(Rules.boardSizeForPlayers(6, "36-at-6-40-at-9"), 36);
  assert.equal(Rules.isSessionComplete({ yolo: true, boardCount: 1, roundIndex: 1 }), true);
  assert.equal(Rules.isSessionComplete({ yolo: false, boardCount: 30, roundIndex: 7 }), true);
});
