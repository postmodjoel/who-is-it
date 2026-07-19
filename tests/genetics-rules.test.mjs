import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../genetics-rules.js", import.meta.url), "utf8");
const context = { globalThis: {} };
vm.createContext(context);
vm.runInContext(source, context);
const Rules = context.globalThis.GeneticsRules;

function roundFixture(sessionSeed = "lineage-test", roundIndex = 0) {
  return Rules.buildRound({ sessionSeed, roundIndex, builderIndex: 0 });
}

function overridden(founder, patch) {
  const copy = JSON.parse(JSON.stringify(founder));
  Object.assign(copy.phenotype, patch);
  return copy;
}

test("founder pools are deterministic, synthetic, and presentation-standardised", () => {
  const left = Rules.generateFounderPool("pool-seed", 24);
  const right = Rules.generateFounderPool("pool-seed", 24);
  assert.equal(JSON.stringify(left), JSON.stringify(right));
  assert.equal(left.length, 24);
  assert.equal(new Set(left.map((node) => node.id)).size, 24);
  for (const founder of left) {
    assert.equal(founder.sourceId, null);
    assert.equal(founder.isFounder, true);
    assert.ok(founder.signatures.length >= 3 && founder.signatures.length <= 4);
    assert.equal(founder.traits.clothing, "tee");
    assert.equal(founder.traits.accessory, "none");
    assert.equal(founder.traits.expression, "neutral");
    assert.equal(founder.traits.animMode, "still");
    assert.equal(founder.traits.tattooText, "");
    assert.equal(founder.traits.beardLength, 0);
    assert.equal(founder.phenotype.ethnicity, undefined);
  }
});

test("buildRound selects eight distinct A-H founders with round-local ids and one backdrop", () => {
  const round = roundFixture("round-shape");
  assert.equal(round.founders.length, 8);
  assert.deepEqual(Array.from(round.founders, (node) => node.label), ["A", "B", "C", "D", "E", "F", "G", "H"]);
  for (const founder of round.founders) {
    assert.match(founder.id, /^wwy-founder-r0x0-\d$/);
    assert.equal(founder.sourceId, null);
    assert.equal(founder.traits.background, round.background);
  }
  assert.equal(JSON.stringify(roundFixture("round-shape")), JSON.stringify(round));
  assert.notEqual(JSON.stringify(roundFixture("round-shape", 1).founders), JSON.stringify(round.founders));
});

test("children stay in bounds, record provenance for every registry trait, and never blend 50/50", () => {
  const round = roundFixture("provenance");
  const [a, b] = round.founders;
  const child = Rules.breedChild(a, b, { seed: "provenance:child" });
  for (const entry of Rules.TRAIT_REGISTRY) {
    assert.ok(child.provenance[entry.key], `provenance missing for ${entry.key}`);
    if (entry.mode === "blend") {
      assert.ok([0.35, 0.45, 0.55, 0.65].includes(child.provenance[entry.key].amount), `exact averaging on ${entry.key}`);
    }
    if (entry.min !== undefined) {
      assert.ok(child.phenotype[entry.key] >= entry.min && child.phenotype[entry.key] <= entry.max, `${entry.key} out of bounds`);
    }
  }
  const noseAmounts = new Set(["noseY", "noseScale", "noseLength", "noseWidth"].map((key) => child.provenance[key].amount));
  assert.equal(noseAmounts.size, 1, "nose bundle should share one contribution weight");
  assert.equal(child.traits.clothing, "tee");
  assert.equal(child.traits.expression, "neutral");
});

test("dominant quirks survive instead of averaging toward zero", () => {
  const round = roundFixture("dominance");
  const a = overridden(round.founders[0], { headTilt: 10, lazyEye: 7 });
  const b = overridden(round.founders[1], { headTilt: -10, lazyEye: -7 });
  const child = Rules.breedChild(a, b, { seed: "dominance:child" });
  assert.ok(Math.abs(child.phenotype.headTilt) >= 5 && Math.abs(child.phenotype.headTilt) <= 9,
    `head tilt should lean hard toward one parent, got ${child.phenotype.headTilt}`);
  assert.ok(Math.abs(child.phenotype.lazyEye) >= 3.5, `lazy eye should survive, got ${child.phenotype.lazyEye}`);
});

test("left and right eye heights inherit from different parents", () => {
  const round = roundFixture("side-specific");
  const a = overridden(round.founders[0], { eyeLeftY: 6, eyeRightY: -4 });
  const b = overridden(round.founders[1], { eyeLeftY: -2, eyeRightY: 5 });
  const child = Rules.breedChild(a, b, { seed: "side:child" });
  const leftY = child.phenotype.eyeLeftY;
  const rightY = child.phenotype.eyeRightY;
  const leftLeansA = leftY >= 3.5;    // 0.7-0.9 kept from A's +6 -> [3.6, 5.2]
  const leftLeansB = leftY <= 0.45;   // 0.7-0.9 kept from B's -2 -> [-1.2, 0.4]
  assert.ok(leftLeansA || leftLeansB, `left eye should lean toward one parent, got ${leftY}`);
  if (leftLeansA) assert.ok(rightY >= 2.2, `right eye should then lean toward the other parent, got ${rightY}`);
  else assert.ok(rightY <= -1.2, `right eye should then lean toward the other parent, got ${rightY}`);
});

test("founder order within couples and couple order never change the descendant", () => {
  const round = roundFixture("canonical");
  const ids = round.founders.map((node) => node.id);
  const base = Rules.createLineage(round.founders, [[ids[0], ids[1]], [ids[2], ids[3]]], round.seed);
  const swappedInside = Rules.createLineage(round.founders, [[ids[1], ids[0]], [ids[3], ids[2]]], round.seed);
  const swappedCouples = Rules.createLineage(round.founders, [[ids[2], ids[3]], [ids[0], ids[1]]], round.seed);
  const rePaired = Rules.createLineage(round.founders, [[ids[0], ids[2]], [ids[1], ids[3]]], round.seed);
  assert.equal(JSON.stringify(base.descendant.phenotype), JSON.stringify(swappedInside.descendant.phenotype));
  assert.equal(JSON.stringify(base.descendant.phenotype), JSON.stringify(swappedCouples.descendant.phenotype));
  assert.notEqual(JSON.stringify(base.descendant.phenotype), JSON.stringify(rePaired.descendant.phenotype));
  assert.equal(base.configKey, swappedCouples.configKey);
});

test("fairness simulates all 210 configurations and ranks the true lineage first", () => {
  const round = roundFixture("fairness");
  const ids = round.founders.map((node) => node.id);
  const pairs = [[ids[0], ids[1]], [ids[2], ids[3]]];
  const report = Rules.evaluateFairness(round.founders, pairs, round.seed);
  assert.equal(report.configCount, 210);
  assert.equal(report.configs.length, 210);
  assert.equal(report.rank, 1);
  assert.equal(report.configs.find((entry) => entry.correct).score, 100);
  assert.ok(report.margin > 0);
  assert.ok(["strong", "readable", "ambiguous"].includes(report.verdict));
  assert.equal(report.margin, +(100 - report.bestWrongScore).toFixed(2));
});

test("guess scoring: exact answers total 100 in any order, partials earn structured credit", () => {
  const round = roundFixture("scoring");
  const ids = round.founders.map((node) => node.id);
  const actual = [[ids[0], ids[1]], [ids[2], ids[3]]];
  const exact = Rules.scoreLineageGuess(round.founders, actual, actual, round.seed);
  assert.deepEqual(
    [exact.score, exact.founderPoints, exact.couplePoints, exact.compatibilityPoints, exact.exact],
    [100, 60, 20, 20, true]
  );
  const shuffled = Rules.scoreLineageGuess(round.founders, actual, [[ids[3], ids[2]], [ids[1], ids[0]]], round.seed);
  assert.equal(shuffled.score, 100);
  assert.equal(shuffled.exact, true);

  const misPaired = Rules.scoreLineageGuess(round.founders, actual, [[ids[0], ids[2]], [ids[1], ids[3]]], round.seed);
  assert.equal(misPaired.founderPoints, 60);
  assert.equal(misPaired.couplePoints, 0);
  assert.equal(misPaired.exact, false);
  assert.ok(misPaired.score >= 60 && misPaired.score <= 80);

  const oneWrong = Rules.scoreLineageGuess(round.founders, actual, [[ids[0], ids[1]], [ids[2], ids[4]]], round.seed);
  assert.equal(oneWrong.correctFounders, 3);
  assert.equal(oneWrong.founderPoints, 45);
  assert.equal(oneWrong.couplePoints, 10);
  assert.ok(oneWrong.score < 100);
  assert.ok(oneWrong.compatibilityPoints >= 0 && oneWrong.compatibilityPoints <= 20);

  const invalid = Rules.scoreLineageGuess(round.founders, actual, [[ids[0], ids[0]], [ids[1], ids[2]]], round.seed);
  assert.equal(invalid.valid, false);
  assert.equal(invalid.score, 0);
});

test("reveal callouts trace strong traits to lettered founders", () => {
  const round = roundFixture("callouts");
  const ids = round.founders.map((node) => node.id);
  const lineage = Rules.createLineage(round.founders, [[ids[0], ids[1]], [ids[2], ids[3]]], round.seed);
  const callouts = Rules.traitCallouts(round.founders, lineage.parents, lineage.descendant, 6);
  assert.ok(callouts.length > 0 && callouts.length <= 6);
  assert.ok(callouts.every((entry) => typeof entry.text === "string" && entry.text.length > 8));
  assert.ok(callouts.some((entry) => /Founder [A-H]|Parent [12]/.test(entry.text)));
  const groups = callouts.map((entry) => entry.group);
  assert.equal(new Set(groups).size, groups.length, "one callout per trait bundle");
});

test("rounds and lineages serialize as plain data", () => {
  const round = roundFixture("serialize-me");
  const ids = round.founders.map((node) => node.id);
  round.builderPairs = [[ids[0], ids[1]], [ids[2], ids[3]]];
  const lineage = Rules.createLineage(round.founders, round.builderPairs, round.seed);
  round.parents = lineage.parents;
  round.descendant = lineage.descendant;
  assert.equal(JSON.stringify(Rules.serialize(round)), JSON.stringify(round));
});

test("legacy 15-node tree still builds deterministically for the lab", () => {
  const founders = Rules.generateFounderPool("legacy", 8);
  const left = Rules.buildTree(founders, "legacy-tree");
  const right = Rules.buildTree(founders, "legacy-tree");
  assert.equal(JSON.stringify(left), JSON.stringify(right));
  assert.equal(Object.keys(left.nodes).length, 15);
  assert.equal(left.nodes.d0.parentIds.length, 2);
});
