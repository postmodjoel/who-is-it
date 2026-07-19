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

test("a save spares its winner without executing the unpicked board", () => {
  const result = Rules.resolveSave({
    boardIds: ["a", "b", "c", "d"],
    picks: [["a"], ["b"]],
    votes: ["a", "a"]
  });
  assert.equal(result.savedId, "a");
  assert.deepEqual(result.removedIds, ["b"]);
});

test("a unanimous one-pick nomination cuts with no save vote", () => {
  const result = Rules.resolveThreeFaceCut({
    boardIds: ["a", "b", "c", "d"],
    picks: [["a"], ["a"], ["a"]]
  });
  assert.equal(result.cutId, "a");
  assert.deepEqual(result.removedIds, ["a"]);
  assert.equal(result.automaticCut, true);
});

test("the final showdown saws the agreed pick and crowns the other face", () => {
  const agreed = Rules.resolveFinalShowdown({
    boardIds: ["a", "b"],
    picks: [["a"], ["a"]]
  });
  assert.equal(agreed.cutId, "a");
  assert.equal(agreed.crownedId, "b");
  assert.equal(agreed.savedId, "b");
  assert.deepEqual(agreed.removedIds, ["a"]);
  assert.equal(agreed.finalShowdown, true);

  const split = Rules.resolveFinalShowdown({
    boardIds: ["a", "b"],
    picks: [["a"], ["b"]]
  });
  assert.equal(split.crownedId, null);
  assert.deepEqual(split.removedIds.slice().sort(), ["a", "b"]);
  assert.equal(split.tied, true);
});

test("lone-wolf consolation scales with the ballot size", () => {
  assert.deepEqual(Rules.scoreRound({ picks: [["a"], ["a"], ["b"]] }).roundScores, [2, 2, 1]);
  assert.deepEqual(Rules.scoreRound({ picks: [["a", "b"], ["a", "c"], ["d", "e"]] }).roundScores, [2, 2, 2]);
  assert.deepEqual(Rules.scoreRound({ picks: [["a", "b", "c"], ["a", "d", "e"], ["f", "g", "h"]] }).roundScores, [2, 2, 3]);
});

test("three faces bypass the save vote and require a clear cut before the final two", () => {
  const agreed = Rules.resolveThreeFaceCut({
    boardIds: ["a", "b", "c"],
    picks: [["b"], ["b"]]
  });
  assert.equal(agreed.cutId, "b");
  assert.deepEqual(agreed.removedIds, ["b"]);
  assert.equal(agreed.automaticCut, true);

  const split = Rules.resolveThreeFaceCut({
    boardIds: ["a", "b", "c"],
    picks: [["a"], ["b"]]
  });
  assert.equal(split.cutId, null);
  assert.deepEqual(split.removedIds, []);
  assert.equal(split.tied, true);
});

test("board policies and session endings are deterministic", () => {
  assert.equal(Rules.boardSizeForPlayers(12, "all-30"), 30);
  assert.equal(Rules.boardSizeForPlayers(9, "36-at-9"), 36);
  assert.equal(Rules.boardSizeForPlayers(12, "40-at-9"), 40);
  assert.equal(Rules.boardSizeForPlayers(6, "36-at-6-40-at-9"), 36);
  assert.equal(Rules.isSessionComplete({ yolo: true, boardCount: 1, roundIndex: 1 }), true);
  assert.equal(Rules.isSessionComplete({ yolo: false, boardCount: 30, roundIndex: 7 }), true);
});
