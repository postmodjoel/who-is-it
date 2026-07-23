import assert from "node:assert/strict";
import test from "node:test";

await import("../src/modes/groupthink/groupthink-rules.js");
const Rules = globalThis.GroupthinkRules;

test("pick-count and support boundaries preserve the live rules", () => {
  assert.deepEqual([13, 12, 6, 5, 2].map((count) => Rules.pickCountForBoard(count, true)), [3, 2, 2, 1, 1]);
  assert.equal(Rules.pickCountForBoard(2, false), 3);
  assert.deepEqual([2, 8, 9, 12].map(Rules.matchSupport), [2, 2, 3, 3]);
  assert.deepEqual([2, 8, 9, 12].map((count) => Rules.saveSupport(count, "current")), [2, 2, 3, 3]);
});

test("crowd pressure narrows the ballot and the tighter ramp always wins", () => {
  assert.deepEqual([2, 3, 6, 7, 12].map(Rules.pickCountForPlayers), [3, 2, 2, 1, 1]);
  // A full board leaves the crowd ramp in charge.
  assert.deepEqual([2, 6, 7].map((p) => Rules.pickCountFor({ boardCount: 30, playerCount: p })), [3, 2, 1]);
  // A shrinking board still overrides a small crowd - the endgame ramp survives.
  assert.deepEqual([30, 12, 5, 2].map((b) => Rules.pickCountFor({ boardCount: b, playerCount: 2 })), [3, 2, 1, 1]);
  // Neither ramp can ever ask for the whole board, and non-yolo stays a flat three.
  assert.equal(Rules.pickCountFor({ boardCount: 2, playerCount: 2, promptPicks: 3 }), 1);
  assert.equal(Rules.pickCountFor({ boardCount: 30, playerCount: 12, yolo: false }), 3);
  // A pinned prompt beats both ramps but still respects the board ceiling.
  assert.equal(Rules.pickCountFor({ boardCount: 30, playerCount: 2, promptPicks: 1 }), 1);
  assert.equal(Rules.pickCountFor({ boardCount: 30, playerCount: 12, promptPicks: 3 }), 3);
  // Degenerate input never yields a zero-pick ballot.
  assert.deepEqual([[0, 0], [1, 2], [-5, -5]].map(([b, p]) =>
    Rules.pickCountFor({ boardCount: b, playerCount: p })), [1, 1, 1]);
});

test("prompt text resolves to the ballot size in every direction", () => {
  const racists = { text: "The racists.", solo: "The racist." };
  assert.deepEqual([1, 2, 3].map((n) => Rules.promptTextFor(racists, n)),
    ["The racist.", "The racists.", "The racists."]);
  const token = { text: "Pick {n} most likely to be cannibals.", solo: "Pick the one cannibal." };
  assert.deepEqual([1, 2, 3].map((n) => Rules.promptTextFor(token, n)),
    ["Pick the one cannibal.", "Pick two most likely to be cannibals.", "Pick three most likely to be cannibals."]);
  // No solo form falls back to substituting "one" rather than leaking a raw token.
  assert.equal(Rules.promptTextFor({ text: "Rank the {n} worst." }, 1), "Rank the one worst.");
  assert.equal(Rules.promptTextFor(null, 2), "");
});

test("the shipped deck reads at every ballot size", async () => {
  globalThis.window = globalThis;
  globalThis.GameData = {};
  await import("../src/modes/groupthink/groupthink-data.js");
  const deck = globalThis.GameData.groupthinkPrompts;
  const all = [...deck.base, ...deck.locations];
  assert.ok(all.length >= 80, `deck shrank to ${all.length}`);
  assert.equal(new Set(all.map((entry) => entry.id)).size, all.length, "duplicate prompt ids");
  for (const entry of all) {
    for (const n of [1, 2, 3]) {
      const text = Rules.promptTextFor(entry, n);
      assert.ok(text, `${entry.id} produced no text at ${n}`);
      assert.ok(!text.includes("{n}"), `${entry.id} leaked {n} at ${n}`);
      // Nothing may claim a count the ballot did not ask for.
      if (!entry.picks && n < 3) assert.ok(!/\bthree\b/i.test(text), `${entry.id} says "three" at ${n}`);
      if (!entry.picks && n === 1) assert.ok(!/\btwo\b/i.test(text), `${entry.id} says "two" at 1`);
    }
    assert.ok(["mild", "medium", "feral"].includes(entry.heat), `${entry.id} bad heat`);
    if (entry.picks) assert.ok([1, 2, 3].includes(entry.picks), `${entry.id} bad pinned picks`);
  }
  assert.ok(deck.locations.every((entry) => [1, 2, 3].every((n) =>
    Rules.promptTextFor(entry, n).includes("{location}"))), "a location prompt lost its token");
  assert.ok(deck.base.filter((entry) => entry.heat === "mild").length >= 12, "mild opener tier too thin");
  assert.ok(all.filter((entry) => entry.heat !== "feral" && entry.pgSafe !== false).length >= 40, "PG pool too thin");
});

test("three-player scoring preserves matches and the zero-match consolation", () => {
  const result = Rules.scoreRound({
    picks: [["a", "b", "c"], ["a", "d", "e"], ["f", "g", "h"]],
    scores: [0, 0, 0]
  });
  assert.deepEqual(result.matchCounts, [1, 1, 0]);
  // Flat consolation floor: the zero-match seat scores 1, not the old ballot-scaled 3.
  assert.deepEqual(result.roundScores, [2, 2, 1]);
  assert.deepEqual(result.scores, [2, 2, 1]);
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
  assert.deepEqual(hit.roundScores, [4, 2, 1]);
  const miss = Rules.scoreRound({
    picks: [["a", "b", "c"], ["d", "e", "f"], ["g", "h", "i"]],
    doubleDowns: ["a", null, null],
    doubleDownEnabled: true
  });
  assert.deepEqual(miss.roundScores, [0, 1, 1]);
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

test("lone-wolf consolation is a flat floor of one below any single match", () => {
  // A zero-match seat scores 1 at every ballot size - strictly less than a single match (2), so
  // deliberate isolation can never beat matching, and no round is ever worth zero. (Was 1/2/3 by
  // ballot; scoring-health measured that scaling as the root of the tie/inversion failures.)
  assert.deepEqual(Rules.scoreRound({ picks: [["a"], ["a"], ["b"]] }).roundScores, [2, 2, 1]);
  assert.deepEqual(Rules.scoreRound({ picks: [["a", "b"], ["a", "c"], ["d", "e"]] }).roundScores, [2, 2, 1]);
  assert.deepEqual(Rules.scoreRound({ picks: [["a", "b", "c"], ["a", "d", "e"], ["f", "g", "h"]] }).roundScores, [2, 2, 1]);
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
