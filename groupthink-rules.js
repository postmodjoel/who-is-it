// Pure WHO? DO YOU THINK? rules shared by the browser game, Node simulations and parity tests.
// Keep this file free of DOM, network and mutable app-state dependencies.
(function installGroupthinkRules(root) {
  const FULL_DECK_ROUNDS = 8;
  const SAVE_POLICIES = Object.freeze({
    current: "current",
    oneThird: "one-third",
    twoFifths: "two-fifths",
    majority: "majority"
  });
  const BOARD_POLICIES = Object.freeze({
    all30: "all-30",
    thirtySixAt9: "36-at-9",
    fortyAt9: "40-at-9",
    stepped: "36-at-6-40-at-9",
    all36: "all-36"
  });

  // These values are deliberately boring until the evidence gates select something else.
  const PRODUCTION = Object.freeze({
    savePolicy: SAVE_POLICIES.current,
    boardPolicy: BOARD_POLICIES.all30,
    doubleDown: false
  });

  const uniqueStrings = (values) => [...new Set((values || []).filter((value) => typeof value === "string"))];
  const cleanCount = (value) => Math.max(0, Math.floor(Number(value) || 0));

  function pickCountForBoard(boardCount, yolo = true) {
    if (!yolo) return 3;
    const count = cleanCount(boardCount);
    return count < 6 ? 1 : count <= 12 ? 2 : 3;
  }

  function matchSupport(activePlayerCount) {
    return cleanCount(activePlayerCount) >= 9 ? 3 : 2;
  }

  function saveSupport(activePlayerCount, policy = SAVE_POLICIES.current) {
    const count = cleanCount(activePlayerCount);
    if (count <= 2) return 2;
    if (policy === SAVE_POLICIES.oneThird) return Math.max(2, Math.ceil(count / 3));
    if (policy === SAVE_POLICIES.twoFifths) return Math.max(2, Math.ceil(count * 0.4));
    if (policy === SAVE_POLICIES.majority) return Math.floor(count / 2) + 1;
    return count >= 9 ? 3 : 2;
  }

  function boardSizeForPlayers(playerCount, policy = BOARD_POLICIES.all30) {
    const count = cleanCount(playerCount);
    if (policy === BOARD_POLICIES.thirtySixAt9) return count >= 9 ? 36 : 30;
    if (policy === BOARD_POLICIES.fortyAt9) return count >= 9 ? 40 : 30;
    if (policy === BOARD_POLICIES.stepped) return count >= 9 ? 40 : count >= 6 ? 36 : 30;
    if (policy === BOARD_POLICIES.all36) return 36;
    return 30;
  }

  function activePlayerCount(skipped, total) {
    const count = cleanCount(total);
    let active = 0;
    for (let i = 0; i < count; i += 1) if (!skipped?.[i]) active += 1;
    return active;
  }

  function scoreRound({
    picks = [],
    skipped = [],
    doubleDowns = [],
    duo = false,
    scores = [],
    syncScore = 0,
    doubleDownEnabled = false
  } = {}) {
    const seatCount = Array.isArray(picks) ? picks.length : 0;
    const cleanSkipped = Array.from({ length: seatCount }, (_, i) => !!skipped?.[i]);
    const activePicks = Array.from({ length: seatCount }, (_, i) => cleanSkipped[i] ? [] : uniqueStrings(picks[i]));
    const cleanDoubleDowns = Array.from({ length: seatCount }, (_, i) => {
      const id = doubleDowns?.[i];
      return doubleDownEnabled && !cleanSkipped[i] && typeof id === "string" && activePicks[i].includes(id) ? id : null;
    });
    const counts = {};
    activePicks.forEach((list) => list.forEach((id) => { counts[id] = (counts[id] || 0) + 1; }));
    const activeCount = activePlayerCount(cleanSkipped, seatCount);
    const support = matchSupport(activeCount);
    const matches = activePicks.map((list) => list.filter((id) => counts[id] >= support));
    const matchCounts = matches.map((list) => list.length);
    const doubleDownHits = cleanDoubleDowns.map((id, i) => !!id && matches[i].includes(id));

    if (duo) {
      const roundSync = cleanSkipped.some(Boolean) ? 0 : matchCounts[0] * 2;
      return {
        picks: activePicks,
        skipped: cleanSkipped,
        counts,
        activePlayerCount: activeCount,
        support: 2,
        matches,
        matchCounts,
        doubleDowns: Array(seatCount).fill(null),
        doubleDownHits: Array(seatCount).fill(false),
        roundScores: [roundSync, roundSync],
        scores: Array.from({ length: seatCount }, (_, i) => Number(scores[i]) || 0),
        roundSync,
        syncScore: (Number(syncScore) || 0) + roundSync
      };
    }

    const roundScores = matchCounts.map((matched, i) => {
      if (cleanSkipped[i]) return 0;
      let score = matched === 0 ? 3 : matched * 2;
      if (cleanDoubleDowns[i]) {
        if (doubleDownHits[i]) score += 2;
        else if (matched === 0) score = 0;
      }
      return score;
    });
    return {
      picks: activePicks,
      skipped: cleanSkipped,
      counts,
      activePlayerCount: activeCount,
      support,
      matches,
      matchCounts,
      doubleDowns: cleanDoubleDowns,
      doubleDownHits,
      roundScores,
      scores: Array.from({ length: seatCount }, (_, i) => (Number(scores[i]) || 0) + roundScores[i]),
      roundSync: 0,
      syncScore: Number(syncScore) || 0
    };
  }

  function resolveSave({
    boardIds = [],
    picks = [],
    votes = [],
    skipped = [],
    pickCount = 3,
    savePolicy = SAVE_POLICIES.current
  } = {}) {
    const board = uniqueStrings(boardIds);
    const boardSet = new Set(board);
    const candidates = uniqueStrings((picks || []).flat()).filter((id) => boardSet.has(id));
    const candidateSet = new Set(candidates);
    const seatCount = Math.max(picks?.length || 0, votes?.length || 0, skipped?.length || 0);
    const cleanSkipped = Array.from({ length: seatCount }, (_, i) => !!skipped?.[i]);
    const cleanVotes = Array.from({ length: seatCount }, (_, i) => {
      const id = votes?.[i];
      return !cleanSkipped[i] && typeof id === "string" && candidateSet.has(id) ? id : null;
    });
    const counts = {};
    cleanVotes.forEach((id) => { if (id) counts[id] = (counts[id] || 0) + 1; });
    const top = Math.max(0, ...Object.values(counts));
    const leaders = Object.keys(counts).filter((id) => counts[id] === top);
    const activeCount = activePlayerCount(cleanSkipped, seatCount);
    const support = saveSupport(activeCount, savePolicy);
    const savedId = leaders.length === 1 && top >= support ? leaders[0] : null;
    let removedIds = candidates.filter((id) => id !== savedId);
    if (cleanCount(pickCount) === 1 && savedId) removedIds = board.filter((id) => id !== savedId);
    return {
      votes: cleanVotes,
      skipped: cleanSkipped,
      counts,
      leaders,
      top,
      activePlayerCount: activeCount,
      support,
      savedId,
      removedIds,
      candidates,
      tied: top > 0 && leaders.length > 1,
      insufficientSupport: top > 0 && leaders.length === 1 && top < support
    };
  }

  function isSessionComplete({ yolo = true, boardCount = 0, roundIndex = 0 } = {}) {
    return yolo ? cleanCount(boardCount) <= 1 : cleanCount(roundIndex) + 1 >= FULL_DECK_ROUNDS;
  }

  root.GroupthinkRules = Object.freeze({
    FULL_DECK_ROUNDS,
    SAVE_POLICIES,
    BOARD_POLICIES,
    PRODUCTION,
    pickCountForBoard,
    matchSupport,
    saveSupport,
    boardSizeForPlayers,
    activePlayerCount,
    scoreRound,
    resolveSave,
    isSessionComplete
  });
})(typeof window !== "undefined" ? window : globalThis);
