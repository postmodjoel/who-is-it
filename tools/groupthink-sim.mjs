import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { performance } from "node:perf_hooks";
import { Worker, isMainThread, parentPort, workerData } from "node:worker_threads";

await import("../groupthink-rules.js");
const Rules = globalThis.GroupthinkRules;

const PLAYER_COUNTS = [2, 3, 4, 6, 9, 12];
const YOLO_STATES = [true, false];
const BOARD_SIZES = [30, 36, 40];
const CORRELATIONS = [0.25, 0.5, 0.75, 0.9];
const CONSOLATION_PREVALENCE = [0, 0.1, 0.25, 0.5];
const SAVE_BEHAVIOURS = ["personal", "own", "room", "mixed"];
const SAVE_POLICY_ORDER = ["current", "one-third", "two-fifths", "majority"];
const BOARD_POLICY_ORDER = ["all-30", "36-at-9", "40-at-9", "36-at-6-40-at-9", "all-36"];
const MAX_YOLO_ROUNDS = 40;
const REPORT_VERSION = 1;

const args = process.argv.slice(2);
const argValue = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const quick = args.includes("--smoke");
const sessionsPerCell = Math.max(1, Number(argValue("--sessions") || process.env.GT_SIM_SESSIONS || (quick ? 80 : 20_000)) || 20_000);
const outputDir = path.resolve(argValue("--output") || process.env.GT_SIM_OUTPUT || "test-results/groupthink-lab");
const seedRoot = argValue("--seed") || process.env.GT_SIM_SEED || "who-do-you-think-lab-v1";
const skipFullMatrix = args.includes("--gate-only");
const layoutValidated = args.includes("--layout-validated") || process.env.GT_LAYOUT_VALIDATED === "1";
const requestedWorkers = Math.max(1, Number(argValue("--workers") || process.env.GT_SIM_WORKERS
  || (quick ? 1 : Math.min(8, Math.max(1, os.cpus().length - 1)))) || 1);

function stableHash(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function createRng(seed) {
  let state = stableHash(seed) || 0x6d2b79f5;
  let spare = null;
  const random = () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) / 4294967296;
  };
  random.normal = () => {
    if (spare != null) { const value = spare; spare = null; return value; }
    const u = Math.max(Number.EPSILON, random());
    const v = random();
    const mag = Math.sqrt(-2 * Math.log(u));
    spare = mag * Math.sin(2 * Math.PI * v);
    return mag * Math.cos(2 * Math.PI * v);
  };
  return random;
}

const mean = (values) => values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 0;
const variance = (values) => {
  if (!values.length) return 0;
  const avg = mean(values);
  return mean(values.map((value) => (value - avg) ** 2));
};
const quantile = (values, q) => {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  const index = Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * q)));
  return sorted[index];
};
const round = (value, digits = 6) => Number((Number(value) || 0).toFixed(digits));

function rankIds(ids, score, count, descending = true) {
  return ids.slice().sort((a, b) => {
    const diff = score[b] - score[a];
    return (descending ? diff : -diff) || a - b;
  }).slice(0, Math.min(count, ids.length));
}

function strategiesFor(playerCount, prevalence, sessionIndex) {
  if (playerCount === 2) return ["honest", "honest"];
  const strategies = Array(playerCount).fill(null);
  const adaptiveSeat = sessionIndex % playerCount;
  strategies[adaptiveSeat] = "adaptive";
  let remainingConsolation = Math.min(playerCount - 1, Math.round(playerCount * prevalence));
  for (let offset = 1; offset <= playerCount && remainingConsolation > 0; offset += 1) {
    const seat = (adaptiveSeat + offset) % playerCount;
    if (strategies[seat] == null) { strategies[seat] = "consolation"; remainingConsolation -= 1; }
  }
  const ordinary = ["honest", "consensus", "random"];
  let cursor = sessionIndex % ordinary.length;
  for (let seat = 0; seat < playerCount; seat += 1) {
    if (strategies[seat] == null) { strategies[seat] = ordinary[cursor % ordinary.length]; cursor += 1; }
  }
  return strategies;
}

function chooseSaveVote({ behaviour, seat, candidates, ownPicks, perception, pickCounts }) {
  if (!candidates.length) return null;
  const mode = behaviour === "mixed" ? ["personal", "own", "room"][seat % 3] : behaviour;
  if (mode === "own") {
    const owned = ownPicks.filter((id) => candidates.includes(id));
    return rankIds(owned.length ? owned : candidates, perception, 1, true)[0] ?? null;
  }
  if (mode === "room") {
    return candidates.slice().sort((a, b) => (pickCounts[b] || 0) - (pickCounts[a] || 0) || perception[b] - perception[a] || a - b)[0] ?? null;
  }
  return rankIds(candidates, perception, 1, true)[0] ?? null;
}

function candidateScore({ ownPicks, otherPicks, playerCount, doubleDownEnabled }) {
  const counts = {};
  otherPicks.forEach((list) => list.forEach((id) => { counts[id] = (counts[id] || 0) + 1; }));
  ownPicks.forEach((id) => { counts[id] = (counts[id] || 0) + 1; });
  const support = Rules.matchSupport(playerCount);
  const matches = ownPicks.filter((id) => counts[id] >= support);
  // Flat consolation floor of 1, matching scoreRound's live rule (a match always beats the floor).
  let score = matches.length ? matches.length * 2 : 1;
  let doubleDownId = null;
  if (doubleDownEnabled && matches.length) {
    doubleDownId = matches[0];
    score += 2;
  }
  return { score, doubleDownId };
}

function simulateSession(config, sessionIndex) {
  const rng = createRng(`${config.seed}:${sessionIndex}`);
  const playerCount = config.playerCount;
  const duo = playerCount === 2;
  const strategies = strategiesFor(playerCount, config.consolationPrevalence, sessionIndex);
  // Production face IDs are strings; the pure rules intentionally reject other ballot values.
  let board = Array.from({ length: config.boardSize }, (_, index) => String(index));
  let scores = Array(playerCount).fill(0);
  let syncScore = 0;
  let roundIndex = 0;
  let stalled = false;
  let noProgressStreak = 0;
  const summary = {
    rounds: 0,
    playerRounds: 0,
    zeroMatchPlayerRounds: 0,
    wholeRoomZeroRounds: 0,
    saveRounds: 0,
    saves: 0,
    saveTies: 0,
    insufficientSaves: 0,
    nobodySaved: 0,
    removed: 0,
    firstRoundReduction: 0,
    adaptiveChoices: 0,
    adaptiveConsolationChoices: 0,
    doubleDownOffered: 0,
    doubleDownUptake: 0,
    doubleDownHits: 0,
    doubleDownMisses: 0,
    scoreVariance: 0,
    runaway: 0,
    emptyFinale: 0,
    singleFinale: 0,
    stalled: 0,
    removalCounts: [],
    strategy: {}
  };

  while (roundIndex < (config.yolo ? MAX_YOLO_ROUNDS : Rules.FULL_DECK_ROUNDS)) {
    const pickCount = Rules.pickCountForBoard(board.length, config.yolo);
    const latent = new Float64Array(config.boardSize);
    board.forEach((id) => { latent[id] = rng.normal(); });
    const perceptions = Array.from({ length: playerCount }, () => new Float64Array(config.boardSize));
    const independentWeight = Math.sqrt(Math.max(0, 1 - config.correlation ** 2));
    for (let seat = 0; seat < playerCount; seat += 1) {
      board.forEach((id) => { perceptions[seat][id] = config.correlation * latent[id] + independentWeight * rng.normal(); });
    }

    const picks = Array(playerCount).fill(null);
    const doubleDowns = Array(playerCount).fill(null);
    for (let seat = 0; seat < playerCount; seat += 1) {
      const strategy = strategies[seat];
      if (strategy === "adaptive") continue;
      if (strategy === "honest") picks[seat] = rankIds(board, perceptions[seat], pickCount, true);
      else if (strategy === "consensus") picks[seat] = rankIds(board, latent, pickCount, true);
      else if (strategy === "consolation") picks[seat] = rankIds(board, latent, pickCount, false);
      else {
        const noise = new Float64Array(config.boardSize);
        board.forEach((id) => { noise[id] = rng(); });
        picks[seat] = rankIds(board, noise, pickCount, true);
      }
    }

    for (let seat = 0; seat < playerCount; seat += 1) {
      if (strategies[seat] !== "adaptive") continue;
      const otherPicks = picks.filter((_, index) => index !== seat).map((list) => list || []);
      const consensusPicks = rankIds(board, latent, pickCount, true);
      const consolationPicks = rankIds(board, latent, pickCount, false);
      const consensus = candidateScore({ ownPicks: consensusPicks, otherPicks, playerCount, doubleDownEnabled: config.doubleDown });
      const consolation = candidateScore({ ownPicks: consolationPicks, otherPicks, playerCount, doubleDownEnabled: false });
      summary.adaptiveChoices += 1;
      if (consolation.score > consensus.score) {
        picks[seat] = consolationPicks;
        summary.adaptiveConsolationChoices += 1;
      } else {
        picks[seat] = consensusPicks;
        // The agent marks its strongest predicted overlap, not the post-reveal truth. That preserves
        // real missed-gamble outcomes instead of granting the simulator clairvoyance.
        doubleDowns[seat] = config.doubleDown ? consensusPicks[0] || null : null;
      }
    }

    if (config.doubleDown && !duo) {
      const counts = {};
      picks.forEach((list) => list.forEach((id) => { counts[id] = (counts[id] || 0) + 1; }));
      const support = Rules.matchSupport(playerCount);
      for (let seat = 0; seat < playerCount; seat += 1) {
        summary.doubleDownOffered += 1;
        if (!doubleDowns[seat] && strategies[seat] === "consensus") doubleDowns[seat] = rankIds(picks[seat], latent, 1, true)[0] || null;
        if (!doubleDowns[seat] && strategies[seat] === "honest") {
          const predicted = rankIds(picks[seat], perceptions[seat], 1, true)[0];
          if (predicted != null && perceptions[seat][predicted] > 0) doubleDowns[seat] = predicted;
        }
      }
    }

    const result = Rules.scoreRound({
      picks,
      skipped: Array(playerCount).fill(false),
      doubleDowns,
      duo,
      scores,
      syncScore,
      doubleDownEnabled: config.doubleDown
    });
    scores = result.scores.slice();
    syncScore = result.syncScore;
    summary.rounds += 1;
    summary.playerRounds += playerCount;
    summary.zeroMatchPlayerRounds += result.matchCounts.filter((count) => count === 0).length;
    if (result.matchCounts.every((count) => count === 0)) summary.wholeRoomZeroRounds += 1;
    result.doubleDowns.forEach((id, seat) => {
      if (!id) return;
      summary.doubleDownUptake += 1;
      if (result.doubleDownHits[seat]) summary.doubleDownHits += 1;
      else summary.doubleDownMisses += 1;
    });
    for (let seat = 0; seat < playerCount; seat += 1) {
      const strategy = strategies[seat];
      const bucket = summary.strategy[strategy] || (summary.strategy[strategy] = { points: 0, rounds: 0 });
      bucket.points += result.roundScores[seat] || 0;
      bucket.rounds += 1;
    }

    if (config.yolo) {
      // Mirrors the browser's deriveYoloOutcome: two faces resolve as the final showdown, three as
      // the transition cut, and a unanimous one-pick nomination skips the save vote entirely.
      let outcome;
      const candidates = [...new Set(picks.flat())].filter((id) => board.includes(id));
      if (board.length === 2) {
        outcome = Rules.resolveFinalShowdown({
          boardIds: board,
          picks,
          skipped: Array(playerCount).fill(false)
        });
      } else if (board.length === 3 || (pickCount === 1 && candidates.length === 1)) {
        outcome = Rules.resolveThreeFaceCut({
          boardIds: board,
          picks,
          skipped: Array(playerCount).fill(false)
        });
      } else {
        const votes = Array.from({ length: playerCount }, (_, seat) => chooseSaveVote({
          behaviour: config.saveBehaviour,
          seat,
          candidates,
          ownPicks: picks[seat],
          perception: perceptions[seat],
          pickCounts: result.counts
        }));
        outcome = Rules.resolveSave({
          boardIds: board,
          picks,
          votes,
          skipped: Array(playerCount).fill(false),
          savePolicy: config.savePolicy
        });
        summary.saveRounds += 1;
        if (outcome.savedId != null) summary.saves += 1;
        if (outcome.tied) summary.saveTies += 1;
        if (outcome.insufficientSupport) summary.insufficientSaves += 1;
        if (outcome.savedId == null) summary.nobodySaved += 1;
      }
      const removed = new Set(outcome.removedIds);
      const before = board.length;
      board = board.filter((id) => !removed.has(id));
      const removedCount = before - board.length;
      summary.removed += removedCount;
      summary.removalCounts.push(removedCount);
      if (roundIndex === 0) summary.firstRoundReduction = before ? removedCount / before : 0;
      noProgressStreak = removedCount === 0 ? noProgressStreak + 1 : 0;
      if (Rules.isSessionComplete({ yolo: true, boardCount: board.length, roundIndex })) break;
      if (noProgressStreak >= 8) { stalled = true; break; }
    } else if (Rules.isSessionComplete({ yolo: false, boardCount: board.length, roundIndex })) {
      break;
    }
    roundIndex += 1;
  }

  if (config.yolo && !Rules.isSessionComplete({ yolo: true, boardCount: board.length, roundIndex }) && summary.rounds >= MAX_YOLO_ROUNDS) stalled = true;
  summary.stalled = stalled ? 1 : 0;
  summary.emptyFinale = board.length === 0 ? 1 : 0;
  summary.singleFinale = board.length === 1 ? 1 : 0;
  summary.scoreVariance = variance(duo ? [syncScore] : scores);
  if (!duo && scores.length > 1) {
    const ordered = scores.slice().sort((a, b) => b - a);
    summary.runaway = ordered[0] - ordered[1] >= Math.max(6, mean(scores) * 0.5) ? 1 : 0;
  }
  return summary;
}

function bootstrapCi(samples, key, seed) {
  if (!samples.length) return [0, 0];
  if (samples.length === 1) return [samples[0][key], samples[0][key]];
  const rng = createRng(`${seed}:bootstrap`);
  const estimates = [];
  const repeats = 200;
  for (let repeat = 0; repeat < repeats; repeat += 1) {
    let total = 0;
    for (let i = 0; i < samples.length; i += 1) total += samples[Math.floor(rng() * samples.length)][key];
    estimates.push(total / samples.length);
  }
  return [round(quantile(estimates, 0.025)), round(quantile(estimates, 0.975))];
}

function runCell(config) {
  const sessionCount = Math.max(1, Number(config.sessions || sessionsPerCell) || sessionsPerCell);
  const totals = {
    rounds: 0, playerRounds: 0, zeroMatchPlayerRounds: 0, wholeRoomZeroRounds: 0,
    saveRounds: 0, saves: 0, saveTies: 0, insufficientSaves: 0, nobodySaved: 0,
    removed: 0, firstRoundReduction: 0, adaptiveChoices: 0, adaptiveConsolationChoices: 0,
    doubleDownOffered: 0, doubleDownUptake: 0, doubleDownHits: 0, doubleDownMisses: 0,
    scoreVariance: 0, runaway: 0, emptyFinale: 0, singleFinale: 0, stalled: 0
  };
  const strategy = {};
  const sessionMetrics = [];
  const removalDistribution = {};
  const reservoir = [];
  const reservoirSize = Math.min(512, sessionCount);
  for (let index = 0; index < sessionCount; index += 1) {
    const result = simulateSession(config, index);
    Object.keys(totals).forEach((key) => { totals[key] += result[key] || 0; });
    Object.entries(result.strategy).forEach(([name, values]) => {
      const bucket = strategy[name] || (strategy[name] = { points: 0, rounds: 0 });
      bucket.points += values.points;
      bucket.rounds += values.rounds;
    });
    result.removalCounts.forEach((count) => { removalDistribution[count] = (removalDistribution[count] || 0) + 1; });
    const metric = {
      rounds: result.rounds,
      zeroMatchRate: result.playerRounds ? result.zeroMatchPlayerRounds / result.playerRounds : 0,
      wholeRoomZeroRate: result.rounds ? result.wholeRoomZeroRounds / result.rounds : 0,
      saveSuccessRate: result.saveRounds ? result.saves / result.saveRounds : 0,
      saveTieRate: result.saveRounds ? result.saveTies / result.saveRounds : 0,
      insufficientSaveRate: result.saveRounds ? result.insufficientSaves / result.saveRounds : 0,
      nobodySavedRate: result.saveRounds ? result.nobodySaved / result.saveRounds : 0,
      firstRoundReduction: result.firstRoundReduction,
      adaptiveConsolationRate: result.adaptiveChoices ? result.adaptiveConsolationChoices / result.adaptiveChoices : 0,
      scoreVariance: result.scoreVariance,
      runawayRate: result.runaway
    };
    sessionMetrics.push(metric.rounds);
    if (reservoir.length < reservoirSize) reservoir.push(metric);
    else {
      const replacement = stableHash(`${config.seed}:reservoir:${index}`) % (index + 1);
      if (replacement < reservoirSize) reservoir[replacement] = metric;
    }
  }
  const strategyPointsPerRound = {};
  Object.entries(strategy).forEach(([name, values]) => { strategyPointsPerRound[name] = round(values.rounds ? values.points / values.rounds : 0); });
  const row = {
    seed: config.seed,
    playerCount: config.playerCount,
    yolo: config.yolo,
    boardSize: config.boardSize,
    correlation: config.correlation,
    consolationPrevalence: config.consolationPrevalence,
    saveBehaviour: config.saveBehaviour,
    savePolicy: config.savePolicy,
    doubleDown: config.doubleDown,
    sessions: sessionCount,
    meanRounds: round(totals.rounds / sessionCount),
    medianRounds: quantile(sessionMetrics, 0.5),
    p90Rounds: quantile(sessionMetrics, 0.9),
    roundDistribution: Object.fromEntries([...new Set(sessionMetrics)].sort((a, b) => a - b).map((rounds) => [rounds, round(sessionMetrics.filter((value) => value === rounds).length / sessionCount)])),
    zeroMatchRate: round(totals.playerRounds ? totals.zeroMatchPlayerRounds / totals.playerRounds : 0),
    wholeRoomZeroRate: round(totals.rounds ? totals.wholeRoomZeroRounds / totals.rounds : 0),
    saveSuccessRate: round(totals.saveRounds ? totals.saves / totals.saveRounds : 0),
    saveTieRate: round(totals.saveRounds ? totals.saveTies / totals.saveRounds : 0),
    insufficientSaveRate: round(totals.saveRounds ? totals.insufficientSaves / totals.saveRounds : 0),
    nobodySavedRate: round(totals.saveRounds ? totals.nobodySaved / totals.saveRounds : 0),
    firstRoundReduction: round(totals.firstRoundReduction / sessionCount),
    meanRemovedPerRound: round(totals.saveRounds ? totals.removed / totals.saveRounds : 0),
    adaptiveConsolationRate: round(totals.adaptiveChoices ? totals.adaptiveConsolationChoices / totals.adaptiveChoices : 0),
    doubleDownUptakeRate: round(totals.doubleDownOffered ? totals.doubleDownUptake / totals.doubleDownOffered : 0),
    doubleDownHitRate: round(totals.doubleDownUptake ? totals.doubleDownHits / totals.doubleDownUptake : 0),
    doubleDownMissRate: round(totals.doubleDownUptake ? totals.doubleDownMisses / totals.doubleDownUptake : 0),
    scoreVariance: round(totals.scoreVariance / sessionCount),
    runawayRate: round(totals.runaway / sessionCount),
    emptyFinaleRate: round(totals.emptyFinale / sessionCount),
    singleFinaleRate: round(totals.singleFinale / sessionCount),
    stalledRate: round(totals.stalled / sessionCount),
    removalDistribution: Object.fromEntries(Object.entries(removalDistribution).map(([count, frequency]) => [count, round(frequency / Math.max(1, totals.saveRounds))])),
    strategyPointsPerRound
  };
  row.confidence = {
    meanRounds: bootstrapCi(reservoir, "rounds", config.seed),
    zeroMatchRate: bootstrapCi(reservoir, "zeroMatchRate", config.seed),
    wholeRoomZeroRate: bootstrapCi(reservoir, "wholeRoomZeroRate", config.seed),
    saveSuccessRate: bootstrapCi(reservoir, "saveSuccessRate", config.seed),
    saveTieRate: bootstrapCi(reservoir, "saveTieRate", config.seed),
    insufficientSaveRate: bootstrapCi(reservoir, "insufficientSaveRate", config.seed),
    nobodySavedRate: bootstrapCi(reservoir, "nobodySavedRate", config.seed),
    firstRoundReduction: bootstrapCi(reservoir, "firstRoundReduction", config.seed),
    adaptiveConsolationRate: bootstrapCi(reservoir, "adaptiveConsolationRate", config.seed),
    scoreVariance: bootstrapCi(reservoir, "scoreVariance", config.seed),
    runawayRate: bootstrapCi(reservoir, "runawayRate", config.seed)
  };
  return row;
}

function configSeed(config) {
  return `${seedRoot}:${config.playerCount}:${config.yolo ? 1 : 0}:${config.boardSize}:${config.correlation}:${config.consolationPrevalence}:${config.saveBehaviour}:${config.savePolicy}:${config.doubleDown ? 1 : 0}`;
}

function cell(config) {
  return runCell({ ...config, seed: configSeed(config), sessions: sessionsPerCell });
}

const averageField = (rows, key) => mean(rows.map((row) => Number(row[key]) || 0));
const groupRows = (rows, key) => rows.reduce((groups, row) => {
  const value = row[key];
  if (!groups[value]) groups[value] = [];
  groups[value].push(row);
  return groups;
}, {});

let completedCells = 0;
let expectedCells = 0;
function markCellComplete(label) {
  completedCells += 1;
  if (!args.includes("--quiet") && (completedCells === 1 || completedCells % 50 === 0 || completedCells === expectedCells)) {
    process.stdout.write(`\r${label}: ${completedCells}/${expectedCells} cells`);
    if (completedCells === expectedCells) process.stdout.write("\n");
  }
}

class CellWorkerPool {
  constructor(size) {
    this.slots = Array.from({ length: size }, () => {
      const worker = new Worker(new URL(import.meta.url), { workerData: { groupthinkCellWorker: true } });
      const slot = { worker, index: -1 };
      worker.on("message", (message) => this.onMessage(slot, message));
      worker.on("error", (error) => this.onError(error));
      return slot;
    });
    this.batch = null;
  }

  run(configs, label) {
    if (!configs.length) return Promise.resolve([]);
    if (this.batch) throw new Error("The Groupthink worker pool only accepts one batch at a time.");
    return new Promise((resolve, reject) => {
      this.batch = { configs, label, results: Array(configs.length), cursor: 0, remaining: configs.length, resolve, reject };
      this.slots.forEach((slot) => this.assign(slot));
    });
  }

  assign(slot) {
    if (!this.batch || this.batch.cursor >= this.batch.configs.length) { slot.index = -1; return; }
    const index = this.batch.cursor;
    this.batch.cursor += 1;
    slot.index = index;
    slot.worker.postMessage({ index, config: this.batch.configs[index] });
  }

  onMessage(slot, message) {
    if (!this.batch) return;
    if (message.error) { this.onError(new Error(message.error)); return; }
    this.batch.results[message.index] = message.row;
    this.batch.remaining -= 1;
    markCellComplete(this.batch.label);
    if (this.batch.remaining === 0) {
      const { results, resolve } = this.batch;
      this.batch = null;
      resolve(results);
      return;
    }
    this.assign(slot);
  }

  onError(error) {
    if (!this.batch) throw error;
    const { reject } = this.batch;
    this.batch = null;
    reject(error);
  }

  async close() {
    await Promise.all(this.slots.map((slot) => slot.worker.terminate()));
  }
}

let workerPool = null;
async function measuredCells(configs, label) {
  const seeded = configs.map((config) => ({ ...config, seed: configSeed(config), sessions: sessionsPerCell }));
  if (workerPool) return workerPool.run(seeded, label);
  return seeded.map((config) => {
    const row = runCell(config);
    markCellComplete(label);
    return row;
  });
}

async function runBaselineMatrix() {
  const configs = [];
  for (const playerCount of PLAYER_COUNTS) for (const yolo of YOLO_STATES) for (const boardSize of BOARD_SIZES) {
    for (const correlation of CORRELATIONS) for (const consolationPrevalence of CONSOLATION_PREVALENCE) for (const saveBehaviour of SAVE_BEHAVIOURS) {
      configs.push({ playerCount, yolo, boardSize, correlation, consolationPrevalence, saveBehaviour, savePolicy: "current", doubleDown: false });
    }
  }
  return measuredCells(configs, "baseline");
}

async function runProductionBaseline(savePolicy, boardPolicy, doubleDown, label) {
  const configs = [];
  for (const playerCount of PLAYER_COUNTS) for (const yolo of YOLO_STATES) {
    for (const correlation of CORRELATIONS) for (const consolationPrevalence of CONSOLATION_PREVALENCE) for (const saveBehaviour of SAVE_BEHAVIOURS) {
      configs.push({
        playerCount,
        yolo,
        boardSize: Rules.boardSizeForPlayers(playerCount, boardPolicy),
        correlation,
        consolationPrevalence,
        saveBehaviour,
        savePolicy,
        doubleDown
      });
    }
  }
  return measuredCells(configs, label);
}

async function evaluateSaveGate() {
  const configs = [];
  for (const savePolicy of SAVE_POLICY_ORDER) for (const playerCount of PLAYER_COUNTS) for (const correlation of CORRELATIONS) {
    for (const saveBehaviour of SAVE_BEHAVIOURS) {
      configs.push({ playerCount, yolo: true, boardSize: 30, correlation, consolationPrevalence: 0.1, saveBehaviour, savePolicy, doubleDown: false });
    }
  }
  const rows = await measuredCells(configs, "save gate");
  const byPolicy = groupRows(rows, "savePolicy");
  const currentRows = byPolicy.current;
  const currentByPlayer = Object.fromEntries(Object.entries(groupRows(currentRows, "playerCount")).map(([players, values]) => [players, averageField(values, "saveSuccessRate")]));
  const currentOutside = Object.entries(currentByPlayer).filter(([players, rate]) => Number(players) >= 3 && (rate < 0.4 || rate > 0.6)).length;
  const currentError = Object.entries(currentByPlayer).filter(([players]) => Number(players) >= 3).reduce((sum, [, rate]) => sum + Math.abs(rate - 0.5), 0);
  const candidates = SAVE_POLICY_ORDER.map((policy) => {
    const policyRows = byPolicy[policy];
    const byPlayer = Object.fromEntries(Object.entries(groupRows(policyRows, "playerCount")).map(([players, values]) => [players, averageField(values, "saveSuccessRate")]));
    const error = Object.entries(byPlayer).filter(([players]) => Number(players) >= 3).reduce((sum, [, rate]) => sum + Math.abs(rate - 0.5), 0);
    const improvement = currentError ? (currentError - error) / currentError : 0;
    const allCellsInBounds = policyRows.filter((row) => row.playerCount >= 3).every((row) => row.saveSuccessRate >= 0.3 && row.saveSuccessRate <= 0.7);
    let correlationSupport = 0;
    for (const correlation of CORRELATIONS) {
      const current = currentRows.filter((row) => row.playerCount >= 3 && row.correlation === correlation);
      const candidate = policyRows.filter((row) => row.playerCount >= 3 && row.correlation === correlation);
      const oldError = current.reduce((sum, row) => sum + Math.abs(row.saveSuccessRate - 0.5), 0);
      const newError = candidate.reduce((sum, row) => sum + Math.abs(row.saveSuccessRate - 0.5), 0);
      if (oldError > 0 && newError <= oldError * 0.8) correlationSupport += 1;
    }
    const qualifies = policy !== "current" && currentOutside >= 2 && improvement >= 0.2 && allCellsInBounds && correlationSupport >= 3;
    return { policy, byPlayer, error: round(error), improvement: round(improvement), allCellsInBounds, correlationSupport, qualifies };
  });
  const selected = candidates.find((candidate) => candidate.qualifies)?.policy || "current";
  return { rows, currentByPlayer, currentOutside, currentError: round(currentError), candidates, selected };
}

function boardPolicyComplexity(policy) {
  const sizes = PLAYER_COUNTS.map((players) => Rules.boardSizeForPlayers(players, policy));
  const addedFaces = sizes.reduce((sum, size) => sum + Math.max(0, size - 30), 0);
  let breakpoints = 0;
  for (let i = 1; i < sizes.length; i += 1) if (sizes[i] !== sizes[i - 1]) breakpoints += 1;
  return { addedFaces, breakpoints };
}

async function evaluateBoardGate(savePolicy) {
  const configs = [];
  for (const boardPolicy of BOARD_POLICY_ORDER) for (const playerCount of PLAYER_COUNTS) for (const correlation of CORRELATIONS) {
    const boardSize = Rules.boardSizeForPlayers(playerCount, boardPolicy);
    configs.push({ boardPolicy, playerCount, yolo: true, boardSize, correlation, consolationPrevalence: 0.1, saveBehaviour: "mixed", savePolicy, doubleDown: false });
  }
  const measured = await measuredCells(configs, "board gate");
  const rows = measured.map((row, index) => ({ boardPolicy: configs[index].boardPolicy, ...row }));
  const candidates = BOARD_POLICY_ORDER.map((policy) => {
    const policyRows = rows.filter((row) => row.boardPolicy === policy);
    const byPlayer = Object.fromEntries(Object.entries(groupRows(policyRows, "playerCount")).map(([players, values]) => [players, {
      boardSize: values[0].boardSize,
      medianRounds: round(mean(values.map((row) => row.medianRounds)), 3),
      p90Rounds: Math.max(...values.map((row) => row.p90Rounds)),
      firstRoundReduction: round(averageField(values, "firstRoundReduction")),
      stalledRate: round(averageField(values, "stalledRate"))
    }]));
    const qualifiesSimulation = Object.values(byPlayer).every((metrics) => metrics.medianRounds >= 6 && metrics.medianRounds <= 8
      && metrics.firstRoundReduction <= 0.6 && metrics.p90Rounds <= 10 && metrics.stalledRate <= 0.01);
    const layoutPass = policy === "all-30" || layoutValidated;
    return { policy, byPlayer, ...boardPolicyComplexity(policy), qualifiesSimulation, layoutPass, qualifies: qualifiesSimulation && layoutPass, requiresLayoutValidation: policy !== "all-30" };
  });
  const qualifying = candidates.filter((candidate) => candidate.qualifies)
    .sort((a, b) => a.addedFaces - b.addedFaces || a.breakpoints - b.breakpoints || BOARD_POLICY_ORDER.indexOf(a.policy) - BOARD_POLICY_ORDER.indexOf(b.policy));
  return { rows, candidates, selected: qualifying[0]?.policy || "all-30", simulationQualified: qualifying.length > 0 };
}

function rowPairKey(row) {
  return [row.playerCount, row.yolo ? 1 : 0, row.correlation, row.boardSize].join(":");
}

async function evaluateDoubleDownGate(savePolicy, boardPolicy) {
  const configs = [];
  for (const doubleDown of [false, true]) for (const playerCount of PLAYER_COUNTS.filter((count) => count >= 3)) {
    for (const yolo of YOLO_STATES) for (const correlation of CORRELATIONS) {
      const boardSize = Rules.boardSizeForPlayers(playerCount, boardPolicy);
      configs.push({ playerCount, yolo, boardSize, correlation, consolationPrevalence: 0.1, saveBehaviour: "mixed", savePolicy, doubleDown });
    }
  }
  const rows = await measuredCells(configs, "double-down gate");
  const off = rows.filter((row) => !row.doubleDown);
  const on = rows.filter((row) => row.doubleDown);
  const offMap = new Map(off.map((row) => [rowPairKey(row), row]));
  const playerTrigger = Object.entries(groupRows(off, "playerCount")).map(([players, values]) => {
    const chase = averageField(values, "adaptiveConsolationRate");
    const consolation = mean(values.map((row) => row.strategyPointsPerRound.consolation || 0));
    const consensus = mean(values.map((row) => row.strategyPointsPerRound.consensus || 0));
    return { playerCount: Number(players), chase: round(chase), consolationAdvantage: round(consolation - consensus), triggered: chase > 0.2 || consolation - consensus >= 0.25 };
  });
  const triggerCount = playerTrigger.filter((item) => item.triggered).length;
  let correlationSupport = 0;
  for (const correlation of CORRELATIONS) {
    const baseline = off.filter((row) => row.correlation === correlation);
    const candidate = on.filter((row) => row.correlation === correlation);
    const before = averageField(baseline, "adaptiveConsolationRate");
    const after = averageField(candidate, "adaptiveConsolationRate");
    if (before > 0 && after <= before * 0.75) correlationSupport += 1;
  }
  const regressions = on.map((candidate) => {
    const baseline = offMap.get(rowPairKey(candidate));
    const varianceLimit = baseline.scoreVariance === 0 ? candidate.scoreVariance <= 0.01 : candidate.scoreVariance <= baseline.scoreVariance * 1.15;
    const runawayLimit = baseline.runawayRate === 0 ? candidate.runawayRate <= 0.01 : candidate.runawayRate <= baseline.runawayRate * 1.15;
    return {
      zeroMatchOk: candidate.zeroMatchRate <= baseline.zeroMatchRate + 0.05,
      varianceOk: varianceLimit,
      runawayOk: runawayLimit
    };
  });
  const allRegressionLimitsPass = regressions.every((item) => item.zeroMatchOk && item.varianceOk && item.runawayOk);
  const qualifies = triggerCount >= 2 && correlationSupport >= 3 && allRegressionLimitsPass;
  return { rows, playerTrigger, triggerCount, correlationSupport, allRegressionLimitsPass, selected: qualifies, qualifies };
}

function csvEscape(value) {
  const text = typeof value === "object" && value != null ? JSON.stringify(value) : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function rowsToCsv(rows) {
  if (!rows.length) return "";
  const flatRows = rows.map((row) => ({
    ...row,
    strategyHonest: row.strategyPointsPerRound?.honest ?? "",
    strategyConsensus: row.strategyPointsPerRound?.consensus ?? "",
    strategyConsolation: row.strategyPointsPerRound?.consolation ?? "",
    strategyRandom: row.strategyPointsPerRound?.random ?? "",
    strategyAdaptive: row.strategyPointsPerRound?.adaptive ?? ""
  }));
  const excluded = new Set(["strategyPointsPerRound", "confidence", "roundDistribution", "removalDistribution"]);
  const headers = Object.keys(flatRows[0]).filter((key) => !excluded.has(key));
  return `${headers.join(",")}\n${flatRows.map((row) => headers.map((key) => csvEscape(row[key])).join(",")).join("\n")}\n`;
}

function markdownReport(report) {
  const save = report.gates.save;
  const board = report.gates.board;
  const doubled = report.gates.doubleDown;
  const production = report.decision;
  const lines = [
    "# WHO? DO YOU THINK? automated balance report",
    "",
    `Generated: ${report.generatedAt}`,
    `Sessions per cell: ${report.sessionsPerCell.toLocaleString()}`,
    `Total simulated sessions: ${report.totalSessions.toLocaleString()}`,
    `Runtime: ${report.runtimeSeconds}s`,
    "",
    "## Gated decision",
    "",
    "| Rule | Current | Selected | Gate result |",
    "|---|---:|---:|---|",
    `| Save threshold | current | ${production.savePolicy} | ${production.savePolicy === "current" ? "retain" : "apply"} |`,
    `| Board policy | all-30 | ${production.boardPolicy} | ${production.boardPolicy === "all-30" ? "retain" : "layout validation required"} |`,
    `| Optional double-down | off | ${production.doubleDown ? "on" : "off"} | ${production.doubleDown ? "apply" : "retain"} |`,
    "",
    "## Save gate",
    "",
    `Current player-count cells outside the 40–60% target: ${save.currentOutside}.`,
    "",
    "| Policy | Improvement | Correlations supporting | All cells 30–70% | Qualifies |",
    "|---|---:|---:|---:|---:|",
    ...save.candidates.map((candidate) => `| ${candidate.policy} | ${(candidate.improvement * 100).toFixed(1)}% | ${candidate.correlationSupport}/4 | ${candidate.allCellsInBounds ? "yes" : "no"} | ${candidate.qualifies ? "yes" : "no"} |`),
    "",
    "## Board gate",
    "",
    "| Policy | Added-face weight | Breakpoints | Simulation qualifies |",
    "|---|---:|---:|---:|",
    ...board.candidates.map((candidate) => `| ${candidate.policy} | ${candidate.addedFaces} | ${candidate.breakpoints} | ${candidate.qualifiesSimulation ? "yes" : "no"}${candidate.requiresLayoutValidation && !candidate.layoutPass ? " (layout evidence missing)" : ""} |`),
    "",
    "## Double-down gate",
    "",
    `Triggered player counts: ${doubled.triggerCount}. Correlations supporting a 25% chase reduction: ${doubled.correlationSupport}/4. Regression limits: ${doubled.allRegressionLimitsPass ? "pass" : "fail"}.`,
    "",
    "## Important interpretation",
    "",
    "The adaptive strategy is an upper-bound automated model of deliberate consolation chasing, not a claim about human intent. Game length is measured in rounds. A stalled session means eight consecutive YOLO rounds removed no faces or the 40-round safety cap was reached."
  ];
  return `${lines.join("\n")}\n`;
}

async function main() {
  const start = performance.now();
  const baselineCellCount = skipFullMatrix ? 0 : PLAYER_COUNTS.length * YOLO_STATES.length * BOARD_SIZES.length * CORRELATIONS.length * CONSOLATION_PREVALENCE.length * SAVE_BEHAVIOURS.length;
  const saveCellCount = SAVE_POLICY_ORDER.length * PLAYER_COUNTS.length * CORRELATIONS.length * SAVE_BEHAVIOURS.length;
  const boardCellCount = BOARD_POLICY_ORDER.length * PLAYER_COUNTS.length * CORRELATIONS.length;
  const doubleCellCount = 2 * PLAYER_COUNTS.filter((count) => count >= 3).length * YOLO_STATES.length * CORRELATIONS.length;
  expectedCells = baselineCellCount + saveCellCount + boardCellCount + doubleCellCount;
  workerPool = requestedWorkers > 1 ? new CellWorkerPool(requestedWorkers) : null;
  const baseline = skipFullMatrix ? [] : await runBaselineMatrix();
  const save = await evaluateSaveGate();
  let postSaveBaseline = [];
  if (save.selected !== Rules.PRODUCTION.savePolicy) {
    expectedCells += PLAYER_COUNTS.length * YOLO_STATES.length * CORRELATIONS.length * CONSOLATION_PREVALENCE.length * SAVE_BEHAVIOURS.length;
    postSaveBaseline = await runProductionBaseline(save.selected, Rules.PRODUCTION.boardPolicy, Rules.PRODUCTION.doubleDown, "post-save baseline");
  }
  const board = await evaluateBoardGate(save.selected);
  let postBoardBaseline = [];
  if (board.selected !== Rules.PRODUCTION.boardPolicy) {
    expectedCells += PLAYER_COUNTS.length * YOLO_STATES.length * CORRELATIONS.length * CONSOLATION_PREVALENCE.length * SAVE_BEHAVIOURS.length;
    postBoardBaseline = await runProductionBaseline(save.selected, board.selected, Rules.PRODUCTION.doubleDown, "post-board baseline");
  }
  const doubleDown = await evaluateDoubleDownGate(save.selected, board.selected);
  let postDoubleDownBaseline = [];
  if (doubleDown.selected !== Rules.PRODUCTION.doubleDown) {
    expectedCells += PLAYER_COUNTS.length * YOLO_STATES.length * CORRELATIONS.length * CONSOLATION_PREVALENCE.length * SAVE_BEHAVIOURS.length;
    postDoubleDownBaseline = await runProductionBaseline(save.selected, board.selected, doubleDown.selected, "post-double-down baseline");
  }
  const allRows = [...baseline, ...save.rows, ...postSaveBaseline, ...board.rows, ...postBoardBaseline, ...doubleDown.rows, ...postDoubleDownBaseline];
  const decision = { savePolicy: save.selected, boardPolicy: board.selected, doubleDown: doubleDown.selected };
  const report = {
    schemaVersion: REPORT_VERSION,
    generatedAt: new Date().toISOString(),
    seed: seedRoot,
    workers: workerPool ? requestedWorkers : 1,
    sessionsPerCell,
    totalCells: allRows.length,
    totalSessions: allRows.length * sessionsPerCell,
    runtimeSeconds: 0,
    dimensions: {
      playerCounts: PLAYER_COUNTS,
      yolo: YOLO_STATES,
      boardSizes: BOARD_SIZES,
      correlations: CORRELATIONS,
      consolationPrevalence: CONSOLATION_PREVALENCE,
      saveBehaviours: SAVE_BEHAVIOURS
    },
    layoutValidated,
    productionBefore: Rules.PRODUCTION,
    decision,
    gates: { save, board, doubleDown },
    baseline,
    postSaveBaseline,
    postBoardBaseline,
    postDoubleDownBaseline
  };
  delete report.gates.save.rows;
  delete report.gates.board.rows;
  delete report.gates.doubleDown.rows;
  report.runtimeSeconds = round((performance.now() - start) / 1000, 3);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "cells.csv"), rowsToCsv(allRows));
  fs.writeFileSync(path.join(outputDir, "report.md"), markdownReport(report));
  fs.writeFileSync(path.join(outputDir, "decision.json"), `${JSON.stringify({ schemaVersion: REPORT_VERSION, generatedAt: report.generatedAt, sessionsPerCell, decision, gates: report.gates }, null, 2)}\n`);
  if (workerPool) await workerPool.close();
  process.stdout.write(`Decision: ${JSON.stringify(decision)}\nReports: ${outputDir}\n`);
}

if (!isMainThread && workerData?.groupthinkCellWorker) {
  parentPort.on("message", ({ index, config }) => {
    try { parentPort.postMessage({ index, row: runCell(config) }); }
    catch (error) { parentPort.postMessage({ index, error: error && error.stack ? error.stack : String(error) }); }
  });
} else {
  await main();
}
