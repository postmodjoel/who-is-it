import assert from "node:assert/strict";
import test from "node:test";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const context = { globalThis: {} };
vm.createContext(context);
for (const file of ["../genetics-rules.js", "../make-rules.js"]) {
  vm.runInContext(await readFile(new URL(file, import.meta.url), "utf8"), context);
}
const Genetics = context.globalThis.GeneticsRules;
const Make = context.globalThis.MakeRules;

const round2 = (seed = "draft-test") => Make.buildDraftRound({ sessionSeed: seed, roundIndex: 0, playerCount: 2 });

test("the six parts partition the registry: a full one-donor assembly reproduces the donor", () => {
  const round = round2("partition");
  const donor = round.donors[0];
  const recipe = Object.fromEntries(Make.PART_ORDER.map((part) => [part, donor.id]));
  const creature = Make.assembleCreature(recipe, { [donor.id]: donor });
  for (const entry of Genetics.TRAIT_REGISTRY) {
    assert.deepEqual(creature.phenotype[entry.key], donor.phenotype[entry.key], `${entry.key} not carried by its part`);
  }
  assert.equal(creature.phenotype.hairStyle, donor.phenotype.hairStyle);
});

test("draft rounds are deterministic, deal an 18-body slab, and stay standardised", () => {
  const left = round2("shape");
  assert.equal(JSON.stringify(left), JSON.stringify(round2("shape")));
  assert.equal(left.donors.length, 18);
  assert.equal(Make.buildDraftRound({ sessionSeed: "shape", roundIndex: 0, playerCount: 4 }).donors.length, 18);
  assert.deepEqual(left.donors.map((d) => d.label), Make.DONOR_LABELS);
  assert.ok(!Make.DONOR_LABELS.includes("I") && !Make.DONOR_LABELS.includes("O"), "I and O read as digits");
  for (const donor of left.donors) {
    assert.match(donor.id, /^wdym-donor-r0-\d+$/);
    assert.equal(donor.traits.background, left.background);
  }
  assert.equal(left.turnOrder.length, 2 * Make.PICKS_PER_PLAYER);
});

test("commission donors come back letter-sorted with no part information", () => {
  const round = round2("contributors");
  for (let player = 0; player < 2; player += 1) {
    const donors = Make.commissionDonors(round, player);
    assert.equal(donors.length, 6);
    assert.deepEqual(donors.map((d) => d.label), donors.map((d) => d.label).slice().sort());
    assert.deepEqual(new Set(donors.map((d) => d.id)), new Set(Object.values(round.recipes[player])));
  }
});

test("commissions use six distinct donors each and land inside the contested window", () => {
  for (let players = 2; players <= 6; players += 1) {
    for (let s = 0; s < 6; s += 1) {
      const round = Make.buildDraftRound({ sessionSeed: `contest-${s}`, roundIndex: 0, playerCount: players });
      round.recipes.forEach((recipe) => {
        assert.equal(new Set(Object.values(recipe)).size, Make.PART_ORDER.length, "recipe reuses a donor");
      });
      const counts = Make.contestedCounts(round.recipes);
      counts.forEach((count) => {
        assert.ok(count >= Make.CONTESTED_RANGE.min && count <= Make.maxContestedFor(players),
          `contested count ${count} outside window for ${players} players (seed contest-${s})`);
      });
    }
  }
});

test("targets are exactly the assembly of their secret recipes", () => {
  const round = round2("targets");
  const donorsById = Object.fromEntries(round.donors.map((donor) => [donor.id, donor]));
  round.recipes.forEach((recipe, player) => {
    const rebuilt = Make.assembleCreature(recipe, donorsById, { background: round.background });
    assert.equal(JSON.stringify(round.targets[player].phenotype), JSON.stringify(rebuilt.phenotype));
  });
});

test("turn legality: snake order, one slot per part, no re-claiming taken parts", () => {
  const round = round2("legality");
  assert.equal(Make.currentPicker(round), 0);
  assert.throws(() => Make.applyClaim(round, 1, round.donors[0].id, "nose"), /Not this player's pick/);
  Make.applyClaim(round, 0, round.donors[0].id, "nose");
  assert.equal(Make.currentPicker(round), 1, "snake: player 1 picks next");
  assert.throws(() => Make.applyClaim(round, 1, round.donors[0].id, "nose"), /already been claimed/);
  Make.applyClaim(round, 1, round.donors[1].id, "nose");
  assert.equal(Make.currentPicker(round), 1, "snake reverses: player 1 picks again");
  assert.throws(() => Make.applyClaim(round, 1, round.donors[2].id, "nose"), /slot already filled/);
  const legal = Make.legalClaims(round, 1);
  assert.ok(legal.length > 0);
  assert.ok(legal.every((claim) => claim.part !== "nose"), "filled slot must offer no claims");
});

test("bot drafts always complete for every table size (no dead-end states)", () => {
  for (let players = 2; players <= 6; players += 1) {
    const round = Make.buildDraftRound({ sessionSeed: `complete-${players}`, roundIndex: 0, playerCount: players });
    const bots = Array.from({ length: players }, (_, i) => i % 2 ? Make.bots.spite : Make.bots.greedy);
    Make.runBotDraft(round, bots, `complete-${players}`);
    assert.equal(round.claims.length, players * Make.PICKS_PER_PLAYER);
    round.results.players.forEach((result) => {
      result.parts.forEach((part) => assert.ok(part.claimedId, "every slot filled"));
    });
  }
});

test("scoring: exact parts pay 15, a perfect build pays 100, substitutions never beat exact", () => {
  const round = round2("scoring");
  // Script a perfect draft for player 0 and pure substitutions for player 1 where contested.
  while (!Make.draftComplete(round)) {
    const player = Make.currentPicker(round);
    const legal = Make.legalClaims(round, player);
    const recipe = round.recipes[player];
    const exact = legal.find((claim) => recipe[claim.part] === claim.donorId);
    const pick = player === 0 && exact ? exact : legal[0];
    Make.applyClaim(round, player, pick.donorId, pick.part);
  }
  const p0 = Make.scoreCommission(round, 0);
  if (p0.masterpiece) {
    assert.equal(p0.score, 100);
    assert.equal(p0.exactCount, 6);
  }
  for (const result of [p0, Make.scoreCommission(round, 1)]) {
    for (const part of result.parts) {
      if (part.exact) assert.equal(part.points, Make.EXACT_POINTS);
      else {
        assert.ok(part.points <= Make.SUBSTITUTION_CAP, "substitution beats the cap");
        assert.equal(part.points, Make.substitutionPoints(part.similarity));
      }
    }
    assert.ok(result.score >= 0 && result.score <= 100);
  }
});

test("theft annotation: a rival taking your part before you counts, secured parts do not", () => {
  const round = round2("theft");
  const contestedPart = Make.PART_ORDER.find((part) => round.recipes[0][part] === round.recipes[1][part]);
  assert.ok(contestedPart, "seeded round should contain a contested part");
  const donorId = round.recipes[1][contestedPart];
  Make.applyClaim(round, 0, donorId, contestedPart);   // player 0 snatches it on pick one
  Make.runBotDraft(round, [Make.bots.greedy, Make.bots.greedy], "theft-fill");
  const theft = round.results.thefts.find((entry) => entry.victim === 1 && entry.part === contestedPart);
  assert.ok(theft, "victim should be credited with a theft");
  assert.equal(theft.thief, 0);
  assert.equal(theft.contested, true, "player 0 wanted it too, so it is a contested win, not spite");
  const victimPart = round.results.players[1].parts.find((entry) => entry.part === contestedPart);
  assert.equal(victimPart.exact, false);
});

const CAST = Array.from({ length: 24 }, (_, index) => ({
  id: `cast-${index}`,
  name: `Person ${index}`,
  traits: {
    skin: ["fair", "tan", "brown", "deep"][index % 4],
    hair: ["cropped", "bald", "coily", "bald", "messy", "bald"][index % 6],   // bald-heavy cast to exercise the slab cap
    hairColor: ["black", "blonde", "auburn"][index % 3],
    faceShape: ["oval", "round", "square", "long", "heart"][index % 5],
    eyeGap: 42 + index,
    noseWidth: 0.7 + (index % 6) * 0.1,
    accessory: index === 0 ? "glasses" : index === 1 ? "cap" : "none",
    accessoryColor: index <= 1 ? "#112233" : "",
    beardLength: index === 2 ? 0.8 : 0,
    clothing: "hoodie",
    shirt: "#aa3355",
    expression: "smug",
    jewelleryItems: index === 3 ? ["noseRing", "necklace"] : []
  }
}));

test("cast donors carry their furniture with the right part", () => {
  const glasses = Make.castDonorFrom(CAST[0]);
  assert.equal(glasses.extras.eyes.accessory, "glasses");
  assert.equal(glasses.extras.eyes.accessoryColor, "#112233");
  assert.equal(Make.castDonorFrom(CAST[1]).extras.hair.accessory, "cap");
  assert.equal(Make.castDonorFrom(CAST[2]).extras.mouth.beardLength, 0.8);
  const pierced = Make.castDonorFrom(CAST[3]);
  assert.deepEqual(Array.from(pierced.extras.nose.jewelleryItems), ["noseRing"]);
  assert.deepEqual(Array.from(pierced.extras.body.jewelleryItems), ["necklace"]);
  assert.equal(pierced.extras.body.clothing, "hoodie");
  assert.equal(pierced.extras.mouth.expression, "smug");
});

test("composed hair locks ride the HAIR part for cast donors and appear on strangers", () => {
  const locked = Make.castDonorFrom({
    id: "locks-1", name: "Locks", traits: { hair: "bob", hairLocks: [{ lock: "sideSwoop", x: 60, y: 30, scale: 0.4, rot: -50 }], lockBlend: "merged" }
  });
  assert.equal(locked.extras.hair.hairLocks.length, 1);
  const byId = { [locked.id]: locked };
  const wearing = Make.assembleCreature({ hair: locked.id }, byId);
  assert.equal(wearing.traits.hairLocks[0].lock, "sideSwoop");
  const scalped = Make.strippedDonor(locked, ["hair"]);
  assert.equal(scalped.traits.hairLocks, undefined, "stolen hair takes its locks");

  const strangers = [...Genetics.generateFounderPool("lock-check-a", 30), ...Genetics.generateFounderPool("lock-check-b", 30)];
  const withLocks = strangers.filter((f) => f.extras?.hair?.hairLocks?.length);
  assert.ok(withLocks.length >= 5, `expected a healthy share of locked strangers, got ${withLocks.length}/60`);
  assert.ok(withLocks.every((f) => f.traits.hairLocks?.length), "locks must also be baked into render traits");
});

test("face tattoos ride the skull, body tattoos ride the torso", () => {
  const faceInk = Make.castDonorFrom({ id: "ink-1", name: "Ink Face", traits: { hair: "cropped", tattooText: "NEXT", tattooPlace: "face" } });
  assert.equal(faceInk.extras.skull.tattooText, "NEXT");
  assert.equal(faceInk.extras.body.tattooText, undefined);
  const bodyInk = Make.castDonorFrom({ id: "ink-2", name: "Ink Body", traits: { hair: "cropped", tattooText: "MUM", tattooPlace: "body" } });
  assert.equal(bodyInk.extras.body.tattooText, "MUM");
  assert.equal(bodyInk.extras.skull.tattooText, undefined);
});

test("assembly wears each part's extras and stripping removes them", () => {
  const a = Make.castDonorFrom(CAST[0]);
  const b = Make.castDonorFrom(CAST[2]);
  const byId = { [a.id]: a, [b.id]: b };
  const creature = Make.assembleCreature({ skull: a.id, eyes: a.id, nose: a.id, mouth: b.id, hair: a.id, body: b.id }, byId);
  assert.equal(creature.traits.accessory, "glasses", "eyes bring their glasses");
  assert.equal(creature.traits.beardLength, 0.8, "mouth brings its beard");
  assert.equal(creature.traits.clothing, "hoodie", "body brings its outfit");
  assert.equal(creature.traits.animMode, "still");
  const strippedEyes = Make.strippedDonor(a, ["eyes"]);
  assert.equal(strippedEyes.traits.accessory, "none", "stolen eyes take the glasses with them");
});

test("cast rounds are deterministic, named, and fall back to strangers when the cast is thin", () => {
  const options = { sessionSeed: "cast-round", roundIndex: 0, playerCount: 2, donorSource: "cast", characters: CAST };
  const round = Make.buildDraftRound(options);
  assert.equal(round.donorSource, "cast");
  assert.equal(round.donors.length, 18);
  round.donors.forEach((donor) => assert.match(donor.name, /^Person \d+$/));
  const availableNonBald = CAST.filter((character) => character.traits.hair !== "bald").length;
  const lowestPossibleBaldCount = Math.max(3, round.donors.length - availableNonBald);
  assert.ok(round.donors.filter((donor) => donor.phenotype.hairFamily === "none").length <= lowestPossibleBaldCount,
    "the slab should use the lowest achievable bald count for a bald-heavy cast");
  assert.equal(JSON.stringify(round), JSON.stringify(Make.buildDraftRound(options)));
  const thin = Make.buildDraftRound({ ...options, characters: CAST.slice(0, 10) });
  assert.equal(thin.donorSource, "strangers");
  assert.equal(thin.donors.length, 18);
});

test("stripped donors revert claimed parts to the mannequin and keep the rest", () => {
  const round = round2("strip");
  const donor = round.donors[2];
  const stripped = Make.strippedDonor(donor, ["hair", "skull"]);
  assert.equal(stripped.phenotype.hairStyle, "bald");
  assert.equal(stripped.phenotype.hairFamily, Make.MANNEQUIN.hairFamily);
  assert.equal(stripped.phenotype.skinColor, Make.MANNEQUIN.skinColor);
  assert.equal(stripped.phenotype.headTilt, Make.MANNEQUIN.headTilt);
  assert.equal(stripped.phenotype.noseWidth, donor.phenotype.noseWidth, "unclaimed parts must survive");
  assert.equal(stripped.phenotype.mouthScale, donor.phenotype.mouthScale);
  assert.equal(JSON.stringify(donor.phenotype.hairStyle), JSON.stringify(round.donors[2].phenotype.hairStyle), "stripping must not mutate the donor");
});

test("completed rounds serialize as plain data", () => {
  const round = round2("serialize");
  Make.runBotDraft(round, [Make.bots.greedy, Make.bots.spite], "serialize");
  assert.equal(JSON.stringify(Make.serialize(round)), JSON.stringify(round));
});
