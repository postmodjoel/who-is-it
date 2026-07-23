import assert from "node:assert/strict";
import test from "node:test";

const Health = await import("../tools/groupthink-score-health.mjs");
const Rules = globalThis.GroupthinkRules;

test("stat helpers give known answers on hand-built inputs", () => {
  // eta^2: groups perfectly separated -> 1; identical groups -> 0; a known mixed case.
  assert.equal(Health.etaSquared({ a: [2, 2], b: [4, 4] }), 1);
  assert.equal(Health.etaSquared({ a: [3, 3], b: [3, 3] }), 0);
  // groups {a:[1,3], b:[3,5]}: grand 3, SStotal 8, SSbetween 2*(2-3)^2+2*(4-3)^2 = 4 -> 0.5
  assert.equal(Health.etaSquared({ a: [1, 3], b: [3, 5] }), 0.5);

  assert.equal(Health.pearson([1, 2, 3], [2, 4, 6]), 1);
  assert.equal(Health.pearson([1, 2, 3], [6, 4, 2]), -1);
  assert.equal(Health.pearson([1, 2, 3], [5, 5, 5]), 0);

  assert.equal(Health.mean([1, 2, 3]), 2);
  assert.equal(Health.stdev([2, 2, 2]), 0);
  assert.equal(Health.quantile([1, 2, 3, 4, 5], 0.5), 3);

  const [lo, hi] = Health.bootstrapCi([1, 2, 3, 4, 5], "test");
  assert.ok(lo <= 3 && hi >= 3 && lo < hi, `CI [${lo}, ${hi}] should bracket the mean`);
});

test("fractional first-place credit splits a tie and sums to one per session", () => {
  const S = ["consensus", "honest", "random"];
  // Two-way tie for first: each leader's strategy gets half a win.
  assert.deepEqual(Health.creditFirsts([5, 5, 2], S).byStrategy, { consensus: 0.5, honest: 0.5 });
  // Sole winner takes the whole win.
  assert.deepEqual(Health.creditFirsts([5, 3, 2], S).byStrategy, { consensus: 1 });
  // Three-way tie splits into thirds.
  const thirds = Health.creditFirsts([4, 4, 4], S).byStrategy;
  ["consensus", "honest", "random"].forEach((s) => assert.ok(Math.abs(thirds[s] - 1 / 3) < 1e-9));
  // Win mass is exactly 1.0 in every case - the property that makes 1/playerCount the null baseline.
  for (const finals of [[5, 5, 2], [5, 3, 2], [4, 4, 4], [9, 1, 1, 1]]) {
    const strategies = ["consensus", "honest", "random", "honest"].slice(0, finals.length);
    const total = Object.values(Health.creditFirsts(finals, strategies).byStrategy).reduce((a, b) => a + b, 0);
    assert.ok(Math.abs(total - 1) < 1e-9, `win mass ${total} must equal 1`);
  }
  // Two leaders sharing a strategy pool their shares onto that strategy.
  assert.deepEqual(Health.creditFirsts([5, 5, 2], ["honest", "honest", "random"]).byStrategy, { honest: 1 });
});

test("the RNG is deterministic and the panel rotation decorrelates seat from strategy", () => {
  const a = Health.createRng("seed-x");
  const b = Health.createRng("seed-x");
  assert.deepEqual([a(), a.normal(), a()], [b(), b.normal(), b()]);

  // Exactly one consensus and one consolation per session - duplicates would be deterministic
  // clones that tie each other for first (consensus) or collude on the bottom face (consolation).
  for (const playerCount of [4, 5, 7, 12]) {
    for (let session = 0; session < playerCount * 2; session += 1) {
      const panel = Health.panelFor(playerCount, session);
      assert.equal(panel.filter((s) => s === "consensus").length, 1, `${playerCount}p s${session}: one consensus`);
      assert.equal(panel.filter((s) => s === "consolation").length, 1, `${playerCount}p s${session}: one consolation`);
    }
    // Over a full rotation every seat hosts every role - the seat-bias metric depends on it.
    const seatStrategies = Array.from({ length: playerCount }, () => new Set());
    for (let session = 0; session < playerCount; session += 1) {
      Health.panelFor(playerCount, session).forEach((strategy, seat) => seatStrategies[seat].add(strategy));
    }
    seatStrategies.forEach((set) => assert.ok(set.has("consensus") && set.has("consolation"), "roles rotate through every seat"));
  }
  // Small tables still see all four archetypes across sessions even though no single session can.
  const seen = new Set();
  for (let session = 0; session < 4; session += 1) Health.panelFor(3, session).forEach((s) => seen.add(s));
  assert.equal(seen.size, 4);
});

test("smoke simulation preserves the two scoring invariants", () => {
  // These guard the SCORING, not the tool: room-reading must beat noise, and floor-farming must
  // never beat matching - at every ballot size, including the new 1-pick crowd rounds.
  for (const playerCount of [4, 7]) {
    const cell = Health.runCell({
      playerCount, correlation: 0.75, yolo: true, boardSize: 30,
      sessions: 120, seed: `invariant:${playerCount}`
    });
    const r = cell.strategyRate;
    assert.ok(r.consensus > r.random, `${playerCount}p: consensus ${r.consensus} must beat random ${r.random}`);
    assert.ok(r.consolation <= r.honest, `${playerCount}p: consolation ${r.consolation} must not beat honest ${r.honest}`);
    for (const [ballot, rates] of Object.entries(cell.ballotRates)) {
      if (rates.consolation == null || rates.honest == null) continue;
      assert.ok(rates.consolation <= rates.honest,
        `${playerCount}p @${ballot}-pick: consolation ${rates.consolation} must not beat honest ${rates.honest}`);
    }
    // 7 players on a full board is the new crowd-ramp territory: the 1-pick ballot must appear.
    if (playerCount === 7) assert.ok(cell.ballotRates["1"], "7-player YOLO cells must contain 1-pick rounds");
  }
});

test("sessions are reproducible and faithful to the live ballot rule", () => {
  const config = { playerCount: 5, correlation: 0.5, yolo: true, boardSize: 30, seed: "repro" };
  const one = Health.simulateSession(config, 7, Health.panelFor(5, 7));
  const two = Health.simulateSession(config, 7, Health.panelFor(5, 7));
  assert.deepEqual(one.finalScores, two.finalScores);
  assert.equal(one.rounds, two.rounds);
  // The tool must use the crowd-scaled rule, not the stale board-only ramp: 5 players on a full
  // board is a 2-pick ballot under pickCountFor but 3 under pickCountForBoard.
  assert.equal(Rules.pickCountFor({ boardCount: 30, playerCount: 5, yolo: true }), 2);
  assert.ok(one.perBallot["2"], "a 5-player session must score 2-pick rounds");
  assert.ok(!one.perBallot["3"], "a 5-player session must never see a 3-pick ballot");
});
