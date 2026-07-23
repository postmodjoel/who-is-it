import test from "node:test";
import assert from "node:assert/strict";

const storage = new Map();
globalThis.window = {
  localStorage: {
    getItem(key) {
      return storage.has(key) ? storage.get(key) : null;
    },
    setItem(key, value) {
      storage.set(key, String(value));
    }
  }
};

await import("../faces-hair.js");
await import("../studio-bakes-import.js");
await import("../clothing-profiles.js");
await import("../face-generator.js");

const generator = window.faceGenerator;
const candidateIds = (cast) => cast
  .filter((character) => character.id.startsWith(generator.simRange.prefix))
  .map((character) => character.id);
const priorBallotTwoTriplets = [
  "cropped|securityVest|chain",
  "bob|blazer|beret",
  "coily|cardigan|roundGlasses",
  "longWaves|raincoat|flowerClip",
  "sidePart|blazer|bow",
  "curls|sequin|choker",
  "messy|labCoat|roundGlasses",
  "napeTail|flannel|studs",
  "duchess|varsity|squareGlasses",
  "softServe|singlet|headband",
  "longWaves|sariDrape|necklace",
  "cropped|labCoat|beard",
  "sideSpill|denim|necklace",
  "topKnotWhip|chefCoat|chain",
  "bald|sequin|dropEarrings",
  "hijab|overalls|none",
  "crestCap|varsity|necklace",
  "locs|raincoat|choker",
  "question|tee|roundGlasses",
  "samurai|apron|moustache",
  "sideSpill|leather|hoops",
  "curtainDome|sweaterVest|studs",
  "princessMane|pinafore|catEyeGlasses",
  "bald|collared|bow",
  "softServe|denim|flowerClip",
  "cropped|kurta|turban",
  "sidePart|flannel|roundGlasses",
  "locs|apron|scarf",
  "hijab|bomber|studs",
  "topKnotWhip|hoodie|beard",
  "longWaves|varsity|hoops",
  "question|leather|squareGlasses",
  "duchess|overalls|dropEarrings",
  "curtainDome|scrubs|necklace",
  "bob|leather|catEyeGlasses",
  "samurai|rugby|chain",
  "bald|blazer|scarf",
  "napeTail|vneck|roundGlasses",
  "sideSpill|cardigan|beret",
  "curls|sariDrape|hoops",
  "softServe|labCoat|choker",
  "messy|raincoat|moustache",
  "hijab|varsity|roundGlasses",
  "sidePart|chefCoat|necklace",
  "samurai|sweaterVest|catEyeGlasses",
  "coily|tracksuit|scarf",
  "crestCap|cardigan|hoops",
  "topKnotWhip|overalls|bow",
  "longWaves|flannel|beret",
  "question|jacket|studs"
];

test("the review surface can request all thirty third-ballot candidates", () => {
  const all = generator.createCharacters(() => [], [], { includeCandidateRange: true });
  const candidates = all.filter((character) => character.id.startsWith(generator.simRange.prefix));
  assert.equal(candidates.length, 30);
  assert.equal(new Set(candidates.map((character) => character.id)).size, 30);
  assert.equal(new Set(candidates.map((character) => character.name)).size, 30);
  assert.equal(new Set(candidates.map((character) => character.role)).size, 30);
  assert.ok(candidates.every((character) => character.image.startsWith("data:image/svg+xml")));

  const pronounCounts = candidates.reduce((counts, character) => {
    counts[character.pronouns] = (counts[character.pronouns] || 0) + 1;
    return counts;
  }, {});
  assert.ok(pronounCounts.she >= 12);
  assert.ok(pronounCounts.he >= 9);
  assert.ok(pronounCounts.they >= 6);
});

test("new candidates do not recycle the permanent cast, prior ballot, or each other as costume swaps", () => {
  const all = generator.createCharacters(() => [], [], { includeCandidateRange: true });
  const permanentCast = all.filter((character) => character.id.startsWith("gen-sim") && !character.id.startsWith(generator.simRange.prefix));
  const candidates = all.filter((character) => character.id.startsWith(generator.simRange.prefix));
  const definingPairs = ({ hair, clothing, accessory }) => {
    return [
      `hair:${hair}|clothing:${clothing}`,
      `hair:${hair}|accessory:${accessory}`,
      `clothing:${clothing}|accessory:${accessory}`
    ];
  };

  const priorPairs = new Set([
    ...permanentCast.flatMap((character) => definingPairs(character.traits)),
    ...priorBallotTwoTriplets.flatMap((triplet) => {
      const [hair, clothing, accessory] = triplet.split("|");
      return definingPairs({ hair, clothing, accessory });
    })
  ]);
  const candidatePairs = candidates.flatMap((character) => definingPairs(character.traits));
  assert.deepEqual(candidatePairs.filter((pair) => priorPairs.has(pair)), []);
  assert.equal(new Set(candidatePairs).size, candidatePairs.length);
});

test("new candidates also have distinct coarse face geometry", () => {
  const all = generator.createCharacters(() => [], [], { includeCandidateRange: true });
  const winners = all.filter((character) => character.id.startsWith("gen-sim") && !character.id.startsWith(generator.simRange.prefix));
  const candidates = all.filter((character) => character.id.startsWith(generator.simRange.prefix));
  const quantize = (value, step) => Math.round(Number(value) / step);
  const faceFingerprint = (character) => {
    const traits = character.traits;
    return [
      traits.faceShape,
      quantize(traits.headScaleX, 0.05),
      quantize(traits.headScaleY, 0.05),
      quantize(traits.eyeGap, 4),
      quantize(traits.eyeScale, 0.05),
      quantize(traits.eyeOpen, 0.05),
      traits.browShape,
      traits.noseTip,
      quantize(traits.noseWidth, 0.05),
      quantize(traits.mouthScale, 0.05),
      traits.lips,
      traits.chinShape,
      quantize(traits.build, 5)
    ].join("|");
  };

  const winnerFaces = new Set(winners.map(faceFingerprint));
  const candidateFaces = candidates.map(faceFingerprint);
  assert.deepEqual(candidateFaces.filter((face) => winnerFaces.has(face)), []);
  assert.equal(new Set(candidateFaces).size, candidateFaces.length);
});

test("the eight first-ballot winners plus Maude and Cleo are permanent", () => {
  storage.clear();
  const permanentIds = generator.createCharacters(() => [])
    .filter((character) => character.id.startsWith("gen-sim"))
    .map((character) => character.id);
  assert.deepEqual(permanentIds, [
    "gen-sim-kwame",
    "gen-sim-saskia",
    "gen-sim-zahra",
    "gen-sim-leila",
    "gen-sim-farah",
    "gen-sim-gus",
    "gen-sim-marisol",
    "gen-sim-lenny",
    "gen-sim2-maude",
    "gen-sim2-cleo"
  ]);
});

test("the other forty-eight second-ballot candidates stay removed", () => {
  const secondBallotIds = generator
    .createCharacters(() => [], [], { includeCandidateRange: true })
    .filter((character) => character.id.startsWith("gen-sim2-"))
    .map((character) => character.id);
  assert.deepEqual(secondBallotIds, ["gen-sim2-maude", "gen-sim2-cleo"]);
});

test("the twenty-two rejected first-ballot candidates stay removed", () => {
  const rejectedIds = new Set([
    "gen-sim-dalia",
    "gen-sim-rowan",
    "gen-sim-omar",
    "gen-sim-jun",
    "gen-sim-maceo",
    "gen-sim-greta",
    "gen-sim-beau",
    "gen-sim-imani",
    "gen-sim-paolo",
    "gen-sim-esme",
    "gen-sim-dev",
    "gen-sim-niamh",
    "gen-sim-sol",
    "gen-sim-chidi",
    "gen-sim-kenji",
    "gen-sim-arturo",
    "gen-sim-rue",
    "gen-sim-binta",
    "gen-sim-tariq",
    "gen-sim-evelyn",
    "gen-sim-koa",
    "gen-sim-rashida"
  ]);
  const allIds = generator
    .createCharacters(() => [], [], { includeCandidateRange: true })
    .map((character) => character.id);
  assert.deepEqual(allIds.filter((id) => rejectedIds.has(id)), []);
});

test("no candidate enters the playable cast before a vote", () => {
  storage.clear();
  assert.deepEqual(candidateIds(generator.createCharacters(() => [])), []);
});

test("only shortlisted candidate IDs enter the playable cast", () => {
  storage.set(generator.simRange.selectionStorageKey, JSON.stringify([
    "gen-sim3-aya",
    "gen-sim3-bo",
    "not-a-candidate"
  ]));
  assert.deepEqual(candidateIds(generator.createCharacters(() => [])), [
    "gen-sim3-aya",
    "gen-sim3-bo"
  ]);
});

test("malformed saved data safely falls back to the original cast", () => {
  storage.set(generator.simRange.selectionStorageKey, "{definitely not json");
  assert.deepEqual(candidateIds(generator.createCharacters(() => [])), []);
});
