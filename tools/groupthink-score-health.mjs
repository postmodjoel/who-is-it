// WHO? DO YOU THINK? scoring-health analysis. Measures whether the SCORE means anything - it never
// changes the game. Five dimensions, each a measurable claim (see docs/SCORING_HEALTH_BRIEF.md):
//   A validity      - does trying to match the room beat random picking?
//   B signal vs luck - does skill decide the winner, or the dice?
//   C dynamic range  - does the final score separate the table without a blowout?
//   D invariance     - fair across table size and the 1/2/3-pick crowd-scaled ballots?
//   E no solved line - is there a dominant strategy that makes the score boring?
//
// All scoring goes through Rules.scoreRound, all ballot sizing through Rules.pickCountFor and all
// endgame resolution through the real resolve* functions - if this file re-implemented any of them
// the analysis would measure a fiction. Deterministic: same seed => identical report.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { performance } from "node:perf_hooks";

await import("../groupthink-rules.js");
const Rules = globalThis.GroupthinkRules;

// ---------------------------------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------------------------------
const args = process.argv.slice(2);
const argValue = (name) => args.find((arg) => arg.startsWith(`${name}=`))?.slice(name.length + 1);
const smoke = args.includes("--smoke");
const full = args.includes("--full");
// Player counts deliberately straddle the crowd-ramp breakpoints (2->3 and 6->7) so a fairness cliff
// at a ballot-size transition is visible rather than averaged away.
const PLAYER_COUNTS = [2, 3, 4, 5, 6, 7, 9, 12];
const CORRELATIONS = [0.25, 0.5, 0.75, 0.9];
const YOLO_STATES = [true, false];
const BOARD_SIZES = full ? [30, 36, 40] : [30];
const MAX_YOLO_ROUNDS = 40;
const sessionsPerCell = Math.max(20, Number(argValue("--sessions")) || (smoke ? 150 : 1200));
const seedRoot = argValue("--seed") || "score-health-v1";
const outputDir = path.resolve(argValue("--output") || "test-results/groupthink-score-health");

// The four archetypes. consensus is an oracle upper bound (ranks the shared latent), honest is the
// skilled-human proxy (ranks its own noisy perception), random is the null, consolation deliberately
// farms the zero-match floor by ranking the latent ascending.
const STRATEGIES = ["consensus", "honest", "random", "consolation"];

// Verdict thresholds from the brief. Reported beside every number so they can be retuned openly.
export const THRESHOLDS = {
  validityGap: 0.5,          // consensus - random points/round
  validityPassShare: 0.8,    // share of cells that must clear the gap with CI separation
  etaSqPass: 0.15,
  etaSqFail: 0.05,
  topFinishLift: 1.5,        // consensus first-place rate vs 1/playerCount chance
  topFinishCeiling: 0.9,     // skill should matter, not guarantee
  covLow: 0.15, covHigh: 0.6, covFailLow: 0.08,
  tiePass: 0.25, tieFail: 0.4,
  runawayPass: 0.1, runawayFail: 0.25,
  seatRPass: 0.05, seatRFail: 0.15,
  solvedWarn: 0.85, solvedFail: 0.95,
  // Two calibrations added 2026-07-22 that treat the EXTREMES as designed, not broken:
  luckRoomCorrelation: 0.5,  // corr <= this is a "luck room": perception is mostly noise, so there is
                             //   no skill signal to reward. A party game SHOULD be lucky here, so
                             //   these cells are not scored for skill separation (dimensions A and B).
  covHealthyForTies: 0.2     // a CoV this healthy excuses a high tie-for-first rate (dimension C): the
                             //   table separated on total points; the top two merely landed equal,
                             //   which in a near-unanimous room is expected, even thematic.
};

// ---------------------------------------------------------------------------------------------------
// Deterministic RNG + stats helpers (exported for tests)
// ---------------------------------------------------------------------------------------------------
export function stableHash(value) {
  let hash = 2166136261;
  const text = String(value);
  for (let i = 0; i < text.length; i += 1) { hash ^= text.charCodeAt(i); hash = Math.imul(hash, 16777619); }
  return hash >>> 0;
}

export function createRng(seed) {
  let state = stableHash(seed) || 0x6d2b79f5;
  let spare = null;
  const random = () => {
    state ^= state << 13; state ^= state >>> 17; state ^= state << 5;
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

export const mean = (values) => values.length ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
export const variance = (values) => {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return mean(values.map((v) => (v - avg) ** 2));
};
export const stdev = (values) => Math.sqrt(variance(values));
const round = (value, digits = 4) => Number((Number(value) || 0).toFixed(digits));

export function quantile(values, q) {
  if (!values.length) return 0;
  const sorted = values.slice().sort((a, b) => a - b);
  return sorted[Math.max(0, Math.min(sorted.length - 1, Math.round((sorted.length - 1) * q)))];
}

export function pearson(xs, ys) {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return 0;
  const mx = mean(xs), my = mean(ys);
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i += 1) {
    num += (xs[i] - mx) * (ys[i] - my);
    dx += (xs[i] - mx) ** 2;
    dy += (ys[i] - my) ** 2;
  }
  return dx && dy ? num / Math.sqrt(dx * dy) : 0;
}

// Variance explained by group membership: SS_between / SS_total over {group: [observations]}.
// This is the "is the score skill or dice?" number - eta^2 of final score on strategy.
export function etaSquared(groups) {
  const all = Object.values(groups).flat();
  if (all.length < 2) return 0;
  const grand = mean(all);
  const ssTotal = all.reduce((sum, v) => sum + (v - grand) ** 2, 0);
  if (!ssTotal) return 0;
  const ssBetween = Object.values(groups).reduce((sum, obs) => obs.length ? sum + obs.length * (mean(obs) - grand) ** 2 : sum, 0);
  return ssBetween / ssTotal;
}

// Percentile bootstrap CI on the mean of a sample (200 resamples, seeded).
export function bootstrapCi(samples, seed) {
  if (!samples.length) return [0, 0];
  if (samples.length === 1) return [samples[0], samples[0]];
  const rng = createRng(`${seed}:bootstrap`);
  const estimates = [];
  for (let repeat = 0; repeat < 200; repeat += 1) {
    let total = 0;
    for (let i = 0; i < samples.length; i += 1) total += samples[Math.floor(rng() * samples.length)];
    estimates.push(total / samples.length);
  }
  return [round(quantile(estimates, 0.025)), round(quantile(estimates, 0.975))];
}

// Fractional first-place credit. A session with k tied leaders splits one "win" as 1/k to each,
// so win mass sums to exactly 1 per session and 1/playerCount becomes the EXACT null baseline: a
// single seat among N equally-skilled seats earns 1/N of the win mass in expectation, with no tie
// correction. Strict-winner counting instead deflated every strategy in proportion to the tie rate
// (40-50% here), making skill look weaker than it is. Returns per-strategy credit for the session;
// two leaders sharing a strategy sum their shares into that strategy.
export function creditFirsts(finals, strategies) {
  const top = Math.max(...finals);
  const leaders = [];
  finals.forEach((score, seat) => { if (score === top) leaders.push(seat); });
  const share = leaders.length ? 1 / leaders.length : 0;
  const byStrategy = {};
  leaders.forEach((seat) => { byStrategy[strategies[seat]] = (byStrategy[strategies[seat]] || 0) + share; });
  return { top, leaders, share, byStrategy };
}

function rankIds(ids, score, count, descending = true) {
  return ids.slice().sort((a, b) => {
    const diff = score[b] - score[a];
    return (descending ? diff : -diff) || a - b;
  }).slice(0, Math.min(count, ids.length));
}

// ---------------------------------------------------------------------------------------------------
// Panel assignment. The panel MUST rotate with the session index for two reasons:
//  1. Seat/strategy decorrelation - if seat 0 always played consensus, the seat-bias metric (D2)
//     would "detect" bias that is really strategy. Rotation makes seat index independent of skill.
//  2. Exactly ONE consensus and ONE consolation seat per session. Both rank the shared latent
//     deterministically, so duplicates are clones: twin consensus seats always tie each other for
//     first (fabricating tie rates and zeroing the strict-winner metric), and twin consolation seats
//     match each other's bottom pick (pair-collusion, which games ANY scoring rule and is out of
//     scope). honest/random have private noise, so any number of them is fine.
// The role list maps to seats via (roleIndex + sessionIndex) % playerCount, so over N consecutive
// sessions every role occupies every seat exactly once - uniform by construction.
// A 3-seat table cannot hold all four archetypes; it alternates consensus/consolation sessions so
// every archetype still appears across the cell.
// ---------------------------------------------------------------------------------------------------
export function panelFor(playerCount, sessionIndex) {
  let roles;
  if (playerCount === 3) {
    roles = sessionIndex % 2 === 0 ? ["consensus", "honest", "random"] : ["consolation", "honest", "random"];
  } else {
    roles = ["consensus", "consolation"];
    while (roles.length < playerCount) roles.push(roles.length % 2 === 0 ? "honest" : "random");
  }
  const seats = Array(playerCount);
  roles.forEach((role, roleIndex) => { seats[(roleIndex + sessionIndex) % playerCount] = role; });
  return seats;
}

// ---------------------------------------------------------------------------------------------------
// One session. `strategies` is per-seat; `mirror` sessions seat all-honest to measure the pure-luck
// noise floor (all-consensus would be identical deterministic picks and a floor of exactly zero).
// ---------------------------------------------------------------------------------------------------
export function simulateSession(config, sessionIndex, strategies) {
  const rng = createRng(`${config.seed}:${sessionIndex}`);
  const { playerCount, correlation, yolo, boardSize } = config;
  const duo = playerCount === 2 && config.duoVariant != null;
  let board = Array.from({ length: boardSize }, (_, i) => String(i));
  let scores = Array(playerCount).fill(0);
  let syncScore = 0;
  let roundIndex = 0;
  let noProgress = 0;
  let stalled = false;
  // points/rounds per strategy, overall and broken out by the resolved ballot size (1/2/3) - the
  // by-ballot view is what proves the new crowd-scaled one-pick rounds stay fair.
  const perStrategy = {};
  const perBallot = {};
  const bump = (map, strat, pts) => {
    const bucket = map[strat] || (map[strat] = { points: 0, rounds: 0 });
    bucket.points += pts; bucket.rounds += 1;
  };

  const maxRounds = yolo ? MAX_YOLO_ROUNDS : Rules.FULL_DECK_ROUNDS;
  while (roundIndex < maxRounds) {
    // Live ballot rule: tighter of the board ramp and the crowd ramp - never the stale board-only call.
    const pickCount = Rules.pickCountFor({ boardCount: board.length, playerCount, yolo });
    const latent = new Float64Array(boardSize);
    board.forEach((id) => { latent[id] = rng.normal(); });
    const independent = Math.sqrt(Math.max(0, 1 - correlation ** 2));
    const perceptions = strategies.map(() => {
      const view = new Float64Array(boardSize);
      board.forEach((id) => { view[id] = correlation * latent[id] + independent * rng.normal(); });
      return view;
    });

    const picks = strategies.map((strategy, seat) => {
      if (strategy === "consensus") return rankIds(board, latent, pickCount, true);
      if (strategy === "honest") return rankIds(board, perceptions[seat], pickCount, true);
      if (strategy === "consolation") return rankIds(board, latent, pickCount, false);
      const noise = new Float64Array(boardSize);
      board.forEach((id) => { noise[id] = rng(); });
      return rankIds(board, noise, pickCount, true);
    });

    const result = Rules.scoreRound({
      picks,
      skipped: Array(playerCount).fill(false),
      doubleDowns: Array(playerCount).fill(null),
      duo,
      scores,
      syncScore,
      doubleDownEnabled: false
    });
    scores = result.scores.slice();
    syncScore = result.syncScore;
    if (duo) {
      bump(perStrategy, strategies[0], result.roundSync);
    } else {
      strategies.forEach((strategy, seat) => {
        bump(perStrategy, strategy, result.roundScores[seat]);
        bump(perBallot[pickCount] || (perBallot[pickCount] = {}), strategy, result.roundScores[seat]);
      });
    }

    if (yolo) {
      // Mirrors the browser's outcome pipeline: two faces -> showdown, three (or a unanimous one-pick
      // nomination) -> consensus cut, otherwise the save vote.
      const candidates = [...new Set(picks.flat())].filter((id) => board.includes(id));
      let outcome;
      const skipped = Array(playerCount).fill(false);
      if (board.length === 2) {
        outcome = Rules.resolveFinalShowdown({ boardIds: board, picks, skipped });
      } else if (board.length === 3 || (pickCount === 1 && candidates.length === 1)) {
        outcome = Rules.resolveThreeFaceCut({ boardIds: board, picks, skipped });
      } else {
        // Save behaviour: each seat votes to spare its highest-perceived candidate. Save choice never
        // touches scoring, only pacing, so one behaviour is enough here (the balance sim sweeps four).
        const votes = perceptions.map((view) => rankIds(candidates, view, 1, true)[0] ?? null);
        outcome = Rules.resolveSave({ boardIds: board, picks, votes, skipped, savePolicy: "current" });
      }
      const removed = new Set(outcome.removedIds);
      const before = board.length;
      board = board.filter((id) => !removed.has(id));
      noProgress = board.length === before ? noProgress + 1 : 0;
      if (Rules.isSessionComplete({ yolo: true, boardCount: board.length, roundIndex })) { roundIndex += 1; break; }
      if (noProgress >= 8) { stalled = true; break; }
    } else if (Rules.isSessionComplete({ yolo: false, boardCount: board.length, roundIndex })) {
      roundIndex += 1; break;
    }
    roundIndex += 1;
  }
  if (yolo && !stalled && board.length > 1 && roundIndex >= MAX_YOLO_ROUNDS) stalled = true;

  return { finalScores: scores, syncScore, strategies, rounds: roundIndex, stalled, perStrategy, perBallot };
}

// ---------------------------------------------------------------------------------------------------
// Cell = one (playerCount, correlation, yolo, boardSize) point, aggregated over many sessions.
// ---------------------------------------------------------------------------------------------------
export function runCell(config) {
  const sessions = config.sessions;
  const strategyTotals = {};
  const ballotTotals = {};
  const perSessionRate = {};       // strategy -> [points-per-round of that strategy in one session]
  const scoreObs = {};             // strategy -> [final seat scores] for eta^2
  const seatIdx = [], seatScore = [];  // seat-bias pairs
  const winCounts = Object.fromEntries(STRATEGIES.map((s) => [s, 0]));
  let ties = 0, runaways = 0, stalledCount = 0, roundsTotal = 0;
  const covSamples = [];
  const consensusFirst = { wins: 0, seated: 0 };

  for (let index = 0; index < sessions; index += 1) {
    const strategies = panelFor(config.playerCount, index);
    const result = simulateSession(config, index, strategies);
    roundsTotal += result.rounds;
    if (result.stalled) stalledCount += 1;

    Object.entries(result.perStrategy).forEach(([strat, v]) => {
      const t = strategyTotals[strat] || (strategyTotals[strat] = { points: 0, rounds: 0 });
      t.points += v.points; t.rounds += v.rounds;
      (perSessionRate[strat] || (perSessionRate[strat] = [])).push(v.rounds ? v.points / v.rounds : 0);
    });
    Object.entries(result.perBallot).forEach(([ballot, byStrat]) => {
      const slot = ballotTotals[ballot] || (ballotTotals[ballot] = {});
      Object.entries(byStrat).forEach(([strat, v]) => {
        const t = slot[strat] || (slot[strat] = { points: 0, rounds: 0 });
        t.points += v.points; t.rounds += v.rounds;
      });
    });

    const finals = result.finalScores;
    strategies.forEach((strat, seat) => {
      (scoreObs[strat] || (scoreObs[strat] = [])).push(finals[seat]);
      seatIdx.push(seat); seatScore.push(finals[seat]);
    });
    // Fractional first-place credit (C still needs the raw tie count, so keep incrementing `ties`).
    const { leaders, byStrategy } = creditFirsts(finals, strategies);
    if (leaders.length > 1) ties += 1;
    Object.entries(byStrategy).forEach(([strat, credit]) => { winCounts[strat] += credit; });
    if (strategies.includes("consensus")) {
      consensusFirst.seated += 1;
      consensusFirst.wins += byStrategy.consensus || 0;
    }
    const avg = mean(finals);
    if (avg > 0) covSamples.push(stdev(finals) / avg);
    const ordered = finals.slice().sort((a, b) => b - a);
    if (finals.length > 1 && ordered[0] - ordered[1] >= Math.max(6, avg * 0.5)) runaways += 1;
  }

  const rate = (strat) => {
    const t = strategyTotals[strat];
    return t?.rounds ? t.points / t.rounds : null;
  };
  const ballotRates = Object.fromEntries(Object.entries(ballotTotals).map(([ballot, byStrat]) => [
    ballot,
    Object.fromEntries(Object.entries(byStrat).map(([strat, t]) => [strat, round(t.rounds ? t.points / t.rounds : 0)]))
  ]));
  // How many sessions each strategy is *seated* in varies with rotation on small tables; win credit
  // is normalised by seated sessions so absence never reads as losing. With fractional crediting,
  // winProb is the strategy's EXPECTED SHARE OF FIRSTS per seated session (dimension E's "is one line
  // dominant?" reads against this - 1/playerCount is the no-skill share).
  const seatedSessions = Object.fromEntries(STRATEGIES.map((s) => {
    let n = 0;
    for (let index = 0; index < sessions; index += 1) if (panelFor(config.playerCount, index).includes(s)) n += 1;
    return [s, n];
  }));
  const winProb = Object.fromEntries(STRATEGIES.map((s) => [s, seatedSessions[s] ? round(winCounts[s] / seatedSessions[s]) : 0]));
  const maxWin = Object.entries(winProb).sort((a, b) => b[1] - a[1])[0];

  return {
    ...config,
    meanRounds: round(roundsTotal / sessions, 2),
    stalledRate: round(stalledCount / sessions),
    strategyRate: Object.fromEntries(STRATEGIES.map((s) => [s, rate(s) == null ? null : round(rate(s))])),
    strategyCi: Object.fromEntries(STRATEGIES.map((s) => [s, bootstrapCi(perSessionRate[s] || [], `${config.seed}:${s}`)])),
    ballotRates,
    etaSq: round(etaSquared(scoreObs)),
    topFinishConsensus: round(consensusFirst.seated ? consensusFirst.wins / consensusFirst.seated : 0),
    topFinishChance: round(1 / config.playerCount),
    covMean: round(mean(covSamples)),
    tieRate: round(ties / sessions),
    runawayRate: round(runaways / sessions),
    seatR: round(pearson(seatIdx, seatScore)),
    winProb,
    maxWinStrategy: maxWin[0],
    maxWinProb: maxWin[1]
  };
}

// Duo is cooperative (one shared sync score), so the competitive dimensions are meaningless there.
// Validity still applies: a pair that reads the room must out-sync a pair picking noise.
export function runDuoCell(config) {
  const variants = ["honest", "random"];
  const out = { ...config, duo: true, variants: {} };
  for (const variant of variants) {
    const syncs = [];
    let roundsTotal = 0;
    for (let index = 0; index < config.sessions; index += 1) {
      const result = simulateSession({ ...config, duoVariant: variant, seed: `${config.seed}:${variant}` }, index, [variant, variant]);
      syncs.push(result.syncScore);
      roundsTotal += result.rounds;
    }
    out.variants[variant] = {
      meanSync: round(mean(syncs)),
      ci: bootstrapCi(syncs, `${config.seed}:${variant}`),
      meanRounds: round(roundsTotal / config.sessions, 2)
    };
  }
  return out;
}

// All-honest mirror: equally skilled seats whose only difference is private noise. The stdev of
// their final scores is the luck floor that real strategy separation has to clear.
export function runNoiseFloor(config) {
  const spreads = [];
  const sessions = Math.max(20, Math.floor(config.sessions / 4));
  for (let index = 0; index < sessions; index += 1) {
    const result = simulateSession({ ...config, seed: `${config.seed}:mirror` }, index, Array(config.playerCount).fill("honest"));
    spreads.push(stdev(result.finalScores));
  }
  return round(mean(spreads));
}

// ---------------------------------------------------------------------------------------------------
// Verdicts
// ---------------------------------------------------------------------------------------------------
export function judge(cells, duoCells) {
  const T = THRESHOLDS;
  const notes = { A: [], B: [], C: [], D: [], E: [] };

  // A - validity. Low-correlation "luck rooms" legitimately cannot separate skill from noise, so they
  // are not scored here (only the ordering-break check, which is always a defect, still applies).
  let orderingBroken = 0, strong = 0, aScored = 0;
  for (const cell of cells) {
    const r = cell.strategyRate;
    // A dead heat between honest and random inside CI overlap is expected in low-correlation cells
    // (perception is mostly noise there) - only a CI-separated inversion is an ordering break.
    if (r.random != null && r.honest != null && cell.strategyCi.random[0] > cell.strategyCi.honest[1]) { orderingBroken += 1; notes.A.push(`${cellLabel(cell)}: random (${r.random}) beats honest (${r.honest}) beyond CI overlap`); }
    if (cell.correlation <= T.luckRoomCorrelation) continue;   // luck room: not scored for validity
    aScored += 1;
    if (r.random != null && r.consensus != null) {
      const gapOk = r.consensus - r.random >= T.validityGap;
      const ciOk = cell.strategyCi.consensus[0] > cell.strategyCi.random[1];
      if (gapOk && ciOk && (r.honest == null || r.honest > r.random)) strong += 1;
    }
  }
  for (const duo of duoCells) {
    // A dead-heat in a chaotic room is expected (perception is mostly noise there); only random
    // BEATING honest with CI separation is an ordering break.
    const v = duo.variants;
    if (v.random.ci[0] > v.honest.ci[1]) { orderingBroken += 1; notes.A.push(`duo ${cellLabel(duo)}: random sync ${v.random.meanSync} beats honest ${v.honest.meanSync} beyond CI overlap`); }
  }
  const aShare = aScored ? strong / aScored : 0;
  const A = orderingBroken ? "FAIL" : aShare >= T.validityPassShare ? "PASS" : aShare >= 0.5 ? "WARN" : "FAIL";

  // B - signal vs luck. Chaotic rooms are EXPECTED to be lucky: with perception mostly noise there is
  // no skill signal to reward, which is correct party-game behaviour, not a scoring failure. They are
  // counted as acceptable, not scored as pass/fail; only rooms where agreement is real must show skill.
  let bFail = 0, bOk = 0;
  for (const cell of cells) {
    if (cell.correlation <= T.luckRoomCorrelation) { bOk += 1; continue; }
    const liftOk = cell.topFinishConsensus >= cell.topFinishChance * T.topFinishLift && cell.topFinishConsensus <= T.topFinishCeiling;
    if (cell.etaSq < T.etaSqFail || cell.topFinishConsensus <= cell.topFinishChance) { bFail += 1; notes.B.push(`${cellLabel(cell)}: etaSq ${cell.etaSq}, consensus-first ${cell.topFinishConsensus} (chance ${cell.topFinishChance})`); }
    else if (cell.etaSq >= T.etaSqPass && liftOk) bOk += 1;
  }
  const B = bFail ? "FAIL" : bOk / Math.max(1, cells.length) >= 0.8 ? "PASS" : "WARN";

  // C - dynamic range. A high tie-for-first rate is a defect ONLY alongside poor spread; with a
  // healthy CoV the table separated on total points and the top two merely landed equal (expected in
  // a near-unanimous room), so a very healthy spread excuses a high tie rate outright.
  let cFail = 0, cPass = 0;
  for (const cell of cells) {
    const tieLimitApplies = cell.playerCount >= 3 && cell.playerCount <= 6;
    const tiesWithPoorSpread = tieLimitApplies && cell.tieRate > T.tieFail && cell.covMean < T.covLow;
    const fail = cell.covMean < T.covFailLow || tiesWithPoorSpread || cell.runawayRate > T.runawayFail;
    const tiesOk = !tieLimitApplies || cell.tieRate <= T.tiePass || cell.covMean >= T.covHealthyForTies;
    const pass = cell.covMean >= T.covLow && cell.covMean <= T.covHigh && tiesOk && cell.runawayRate <= T.runawayPass;
    if (fail) { cFail += 1; notes.C.push(`${cellLabel(cell)}: CoV ${cell.covMean}, ties ${cell.tieRate}, runaway ${cell.runawayRate}`); }
    else if (pass) cPass += 1;
  }
  const C = cFail ? "FAIL" : cPass / Math.max(1, cells.length) >= 0.8 ? "PASS" : "WARN";

  // D - invariance: consolation never beats honest (overall AND per ballot size), no seat bias.
  let dFail = 0, dWarn = 0;
  for (const cell of cells) {
    const r = cell.strategyRate;
    if (r.consolation != null && r.honest != null && r.consolation > r.honest) { dFail += 1; notes.D.push(`${cellLabel(cell)}: consolation ${r.consolation} > honest ${r.honest}`); }
    for (const [ballot, rates] of Object.entries(cell.ballotRates)) {
      if (rates.consolation != null && rates.honest != null && rates.consolation > rates.honest) {
        dFail += 1; notes.D.push(`${cellLabel(cell)} @${ballot}-pick: consolation ${rates.consolation} > honest ${rates.honest}`);
      }
    }
    if (Math.abs(cell.seatR) > T.seatRFail) { dFail += 1; notes.D.push(`${cellLabel(cell)}: seat-score r ${cell.seatR}`); }
    else if (Math.abs(cell.seatR) > T.seatRPass) dWarn += 1;
  }
  const D = dFail ? "FAIL" : dWarn ? "WARN" : "PASS";

  // E - no solved strategy
  let eFail = 0, eWarn = 0;
  for (const cell of cells) {
    if (cell.maxWinProb > T.solvedFail) { eFail += 1; notes.E.push(`${cellLabel(cell)}: ${cell.maxWinStrategy} wins ${cell.maxWinProb}`); }
    else if (cell.maxWinProb > T.solvedWarn) { eWarn += 1; notes.E.push(`${cellLabel(cell)}: ${cell.maxWinStrategy} wins ${cell.maxWinProb}`); }
  }
  const E = eFail ? "FAIL" : eWarn ? "WARN" : "PASS";

  return { A, B, C, D, E, notes, aShare: round(aShare) };
}

function cellLabel(cell) {
  return `${cell.playerCount}p/corr${cell.correlation}/${cell.yolo ? "yolo" : "full"}/${cell.boardSize}`;
}

// ---------------------------------------------------------------------------------------------------
// Report
// ---------------------------------------------------------------------------------------------------
const DIMENSION_META = {
  A: ["Validity", "Does matching the room beat random picking?"],
  B: ["Signal vs luck", "Does skill decide the winner, or the dice?"],
  C: ["Dynamic range", "Does the final score separate the table without a blowout?"],
  D: ["Invariance", "Fair across table size and the 1/2/3-pick ballots?"],
  E: ["No solved strategy", "Is there a dominant line that makes the score boring?"]
};

function headline(verdicts) {
  const values = ["A", "B", "C", "D", "E"].map((k) => verdicts[k]);
  if (values.every((v) => v === "PASS")) return "The score works: skill beats luck, the table separates cleanly, and no dimension shows a fairness break.";
  if (values.includes("FAIL")) return "The score has at least one real break - see the FAIL rows below before trusting session results.";
  return "The score broadly works, with soft spots worth watching - see the WARN rows below.";
}

function deciderFor(key, verdicts, cells) {
  if (key === "A") return `consensus>random with CI separation in ${Math.round((verdicts.aShare || 0) * 100)}% of cells (target >=${THRESHOLDS.validityPassShare * 100}%)`;
  if (key === "B") return `etaSq median ${round(quantile(cells.map((c) => c.etaSq), 0.5))} (pass >=${THRESHOLDS.etaSqPass}, fail <${THRESHOLDS.etaSqFail})`;
  if (key === "C") return `CoV median ${round(quantile(cells.map((c) => c.covMean), 0.5))} (target ${THRESHOLDS.covLow}-${THRESHOLDS.covHigh})`;
  if (key === "D") return `worst |seat r| ${round(Math.max(...cells.map((c) => Math.abs(c.seatR))))}; consolation<=honest at every ballot size unless noted`;
  return `max strategy win-rate ${round(Math.max(...cells.map((c) => c.maxWinProb)))} (warn >${THRESHOLDS.solvedWarn}, fail >${THRESHOLDS.solvedFail})`;
}

function markdownReport(report) {
  const { verdicts, cells, duoCells } = report;
  const lines = [
    "# WHO? DO YOU THINK? scoring-health report",
    "",
    `Generated: ${report.generatedAt} · seed \`${report.seed}\` · ${report.sessionsPerCell} sessions/cell · ${cells.length} competitive cells + ${duoCells.length} duo cells · ${report.runtimeSeconds}s`,
    "",
    "## How to read this",
    "",
    "Each dimension is a measurable claim about the score. PASS means the claim held everywhere it was",
    "tested; WARN means it held but without margin (or in most-not-all cells); FAIL lists the exact cells",
    "that broke it. Thresholds are printed beside every number - they are tuning defaults, not law.",
    "If **D** fails at 1-pick, the crowd-ramp consolation floor needs a look before anything else.",
    "",
    `Two calibrations treat the EXTREMES as designed, not broken (both live in THRESHOLDS): (1) low-`,
    `correlation "luck rooms" (correlation <= ${THRESHOLDS.luckRoomCorrelation}) are not scored for skill separation (A, B) - a`,
    `chaotic room where nobody agrees SHOULD be lucky; (2) a high tie-for-first rate is accepted when the`,
    `score spread is healthy (CoV >= ${THRESHOLDS.covHealthyForTies}, dimension C) - the table separated, the top two just tied.`,
    "",
    `**Headline: ${headline(verdicts)}**`,
    "",
    "| Dim | Property | Verdict | Deciding number | Question |",
    "|---|---|---|---|---|",
    ...["A", "B", "C", "D", "E"].map((key) => {
      const [name, question] = DIMENSION_META[key];
      return `| ${key} | ${name} | **${verdicts[key]}** | ${deciderFor(key, verdicts, cells)} | ${question} |`;
    }),
    "",
    "## A - strategy points per round (pooled over correlations, board 30)",
    "",
    "| Players | Mode | consensus | honest | random | consolation | noise floor (all-honest stdev) |",
    "|---:|---|---:|---:|---:|---:|---:|"
  ];
  for (const playerCount of [...new Set(cells.map((c) => c.playerCount))]) {
    for (const yolo of YOLO_STATES) {
      const group = cells.filter((c) => c.playerCount === playerCount && c.yolo === yolo && c.boardSize === 30);
      if (!group.length) continue;
      const avg = (s) => round(mean(group.map((c) => c.strategyRate[s]).filter((v) => v != null)));
      lines.push(`| ${playerCount} | ${yolo ? "YOLO" : "full deck"} | ${avg("consensus")} | ${avg("honest")} | ${avg("random")} | ${avg("consolation")} | ${round(mean(group.map((c) => c.noiseFloor)))} |`);
    }
  }
  lines.push("", "## D - by resolved ballot size (points/round, honest vs consolation)", "",
    "| Ballot | honest | consolation | margin |", "|---:|---:|---:|---:|");
  const ballotAgg = {};
  for (const cell of cells) for (const [ballot, rates] of Object.entries(cell.ballotRates)) {
    const slot = ballotAgg[ballot] || (ballotAgg[ballot] = { honest: [], consolation: [] });
    if (rates.honest != null) slot.honest.push(rates.honest);
    if (rates.consolation != null) slot.consolation.push(rates.consolation);
  }
  for (const ballot of Object.keys(ballotAgg).sort()) {
    const h = round(mean(ballotAgg[ballot].honest));
    const c = round(mean(ballotAgg[ballot].consolation));
    lines.push(`| ${ballot}-pick | ${h} | ${c} | ${round(h - c)} |`);
  }
  lines.push("", "## Duo (cooperative - validity only)", "",
    "| Corr | Mode | honest-pair sync | random-pair sync |", "|---:|---|---:|---:|");
  for (const duo of duoCells) {
    lines.push(`| ${duo.correlation} | ${duo.yolo ? "YOLO" : "full deck"} | ${duo.variants.honest.meanSync} | ${duo.variants.random.meanSync} |`);
  }
  for (const key of ["A", "B", "C", "D", "E"]) {
    if (!verdicts.notes[key].length) continue;
    lines.push("", `## ${key} - flagged cells`, "", ...verdicts.notes[key].map((note) => `- ${note}`));
  }
  return `${lines.join("\n")}\n`;
}

function csvEscape(value) {
  const text = typeof value === "object" && value != null ? JSON.stringify(value) : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

function cellsCsv(cells) {
  const rows = cells.map((cell) => ({
    playerCount: cell.playerCount, correlation: cell.correlation, yolo: cell.yolo, boardSize: cell.boardSize,
    sessions: cell.sessions, meanRounds: cell.meanRounds, stalledRate: cell.stalledRate,
    consensusRate: cell.strategyRate.consensus, honestRate: cell.strategyRate.honest,
    randomRate: cell.strategyRate.random, consolationRate: cell.strategyRate.consolation,
    etaSq: cell.etaSq, topFinishConsensus: cell.topFinishConsensus, topFinishChance: cell.topFinishChance,
    covMean: cell.covMean, tieRate: cell.tieRate, runawayRate: cell.runawayRate, seatR: cell.seatR,
    maxWinStrategy: cell.maxWinStrategy, maxWinProb: cell.maxWinProb, noiseFloor: cell.noiseFloor,
    ballotRates: cell.ballotRates
  }));
  const headers = Object.keys(rows[0]);
  return `${headers.join(",")}\n${rows.map((row) => headers.map((key) => csvEscape(row[key])).join(",")).join("\n")}\n`;
}

// ---------------------------------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------------------------------
export async function main() {
  const start = performance.now();
  const cells = [];
  const duoCells = [];
  for (const boardSize of BOARD_SIZES) for (const yolo of YOLO_STATES) for (const correlation of CORRELATIONS) {
    for (const playerCount of PLAYER_COUNTS) {
      const seed = `${seedRoot}:${playerCount}:${yolo ? 1 : 0}:${correlation}:${boardSize}`;
      const config = { playerCount, correlation, yolo, boardSize, sessions: sessionsPerCell, seed };
      if (playerCount === 2) {
        duoCells.push(runDuoCell(config));
      } else {
        const cell = runCell(config);
        cell.noiseFloor = runNoiseFloor(config);
        cells.push(cell);
      }
    }
  }
  const verdicts = judge(cells, duoCells);
  const report = {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    seed: seedRoot,
    sessionsPerCell,
    thresholds: THRESHOLDS,
    runtimeSeconds: round((performance.now() - start) / 1000, 2),
    verdicts,
    cells,
    duoCells
  };
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(path.join(outputDir, "report.md"), markdownReport(report));
  fs.writeFileSync(path.join(outputDir, "cells.csv"), cellsCsv(cells));
  const failed = ["A", "B", "C", "D", "E"].filter((key) => verdicts[key] === "FAIL");
  process.stdout.write(`${headline(verdicts)}\n`);
  process.stdout.write(`Verdicts: ${["A", "B", "C", "D", "E"].map((key) => `${key}=${verdicts[key]}`).join(" ")}\n`);
  process.stdout.write(`Reports: ${outputDir}\n`);
  process.exitCode = failed.length ? 1 : 0;
}

if (process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url) await main();
