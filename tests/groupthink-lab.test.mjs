import assert from "node:assert/strict";
import test from "node:test";

const memory = new Map();
globalThis.location = { search: "?gtLab=1" };
globalThis.sessionStorage = {
  getItem: (key) => memory.get(key) || null,
  setItem: (key, value) => memory.set(key, String(value)),
  removeItem: (key) => memory.delete(key)
};

await import("../groupthink-lab.js");
const Lab = globalThis.GroupthinkLab;

test("lab stays disabled unless its explicit query flag is present", () => {
  globalThis.location.search = "";
  assert.equal(Lab.enabled(), false);
  globalThis.location.search = "?gtLab=1";
  assert.equal(Lab.enabled(), true);
});

test("host payload records rounds and events while stripping identity fields", () => {
  Lab.reset();
  Lab.start({
    seed: "seed-42",
    playerCount: 3,
    yolo: true,
    hostCanExport: true,
    playerName: "DO NOT EXPORT",
    roomCode: "ROOM-CODE-DO-NOT-EXPORT",
    clientId: "secret-client"
  }, { resume: false });
  Lab.phase("selecting", { roundIndex: 0, revision: 1 });
  Lab.event("disconnect", { seat: 2, phase: "selecting", revision: 1 });
  Lab.recordRound({
    roundIndex: 0,
    revision: 2,
    boardBefore: 30,
    boardAfter: 25,
    pickCount: 3,
    picks: [["a", "b", "c"], ["a", "d", "e"], ["f", "g", "h"]],
    matchCounts: [1, 1, 0],
    roundScores: [2, 2, 1],
    doubleDowns: [null, null, null],
    doubleDownHits: [false, false, false],
    saveOutcome: { savedId: "a", tied: false, removedIds: ["b", "c", "d", "e", "f", "g", "h"] }
  });
  const payload = Lab.payload();
  assert.equal(payload.schemaVersion, 1);
  assert.equal(payload.config.seed, "seed-42");
  assert.equal(payload.config.playerName, undefined);
  assert.equal(payload.config.roomCode, undefined);
  assert.equal(payload.config.clientId, undefined);
  assert.equal(payload.rounds.length, 1);
  assert.equal(payload.summary.completedRounds, 1);
  assert.equal(payload.summary.zeroMatchRate, 1 / 3);
  assert.equal(payload.summary.saveSuccessRate, 1);
  assert.equal(payload.events.some((entry) => entry.type === "disconnect" && entry.data.seat === 2), true);
  assert.equal(JSON.stringify(payload).includes("DO NOT EXPORT"), false);
  assert.equal(JSON.stringify(payload).includes("secret-client"), false);
});

test("CSV export includes meta, round and network-event records", () => {
  const csv = Lab.csv();
  assert.match(csv, /^recordType,schemaVersion,runId,seed,/);
  assert.match(csv, /\nmeta,/);
  assert.match(csv, /\nround,/);
  assert.match(csv, /\nevent,/);
  assert.match(csv, /disconnect/);
  assert.doesNotMatch(csv, /DO NOT EXPORT|secret-client|ROOM-CODE-DO-NOT-EXPORT/);
});
