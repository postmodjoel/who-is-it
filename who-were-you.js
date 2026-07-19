// WHO? WERE YOU? — rotating maker-versus-guesser bloodline game built on GeneticsRules v2.
// One player (the Maker) secretly breeds 8 synthetic founders -> 2 parents -> 1 descendant.
// Everyone else privately reconstructs which four founders were used and how they paired.
// The Maker role rotates until every player has built exactly one bloodline.
(function installWhoWereYou() {
  const RULESET = "whowereyou";
  const DISPLAY_NAME = "WHO? WERE YOU?";
  const Rules = window.GeneticsRules;
  if (!Rules) throw new Error("GeneticsRules must load before who-were-you.js");
  if (Rules.MODE_VERSION !== 2) throw new Error("who-were-you.js expects GeneticsRules mode v2");

  const PHASES = ["builder-handoff", "building", "guesser-handoff", "guessing", "reveal", "round-score", "finale"];
  const VERDICT_TEXT = {
    strong: "STRONG LINEAGE",
    readable: "READABLE",
    ambiguous: "TOO AMBIGUOUS — CHANGE A COUPLE"
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const active = () => typeof state !== "undefined" && state.ruleset === RULESET;
  const session = () => state.whowereyou;
  const rosterName = (index) => state.roster?.[index]?.name || `Player ${index + 1}`;
  const playerCount = () => Math.max(2, state.roster?.length || state.playerCount || 2);
  const portraitCache = new Map();

  function nodePortrait(node) {
    if (!node || !window.faceGenerator) return "";
    const key = `${node.id}:${stableHash(JSON.stringify(node.phenotype || {}))}`;
    if (!portraitCache.has(key)) {
      portraitCache.set(key, window.faceGenerator.renderPortrait(stableHash(key), node.traits || {}));
    }
    return portraitCache.get(key);
  }

  function currentRound() {
    return session()?.rounds?.[session().roundIndex] || null;
  }

  function founderById(round, id) {
    return round?.founders?.find((node) => node.id === id) || null;
  }

  function currentGuesserIndex() {
    const round = currentRound();
    if (!round) return 0;
    return round.guesserOrder[Math.min(round.activeGuesser, round.guesserOrder.length - 1)] ?? 0;
  }

  function makeRound(roundIndex, reroll = 0) {
    const round = Rules.buildRound({
      sessionSeed: session().sessionSeed,
      roundIndex,
      builderIndex: roundIndex % playerCount(),
      reroll
    });
    round.guesserOrder = Array.from({ length: playerCount() }, (_, index) => index).filter((index) => index !== round.builderIndex);
    round.activeGuesser = 0;
    return round;
  }

  // ===================== session lifecycle =====================

  function startSession(seedSalt) {
    const sessionSeed = String(seedSalt || `bloodline-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    portraitCache.clear();
    state.gameSalt = sessionSeed;
    state.gameMode = "local";
    state.playMode = "solo";
    state.inLobby = false;
    state.isHost = false;
    state.isObserver = false;
    state.currentPlayer = 0;
    state.location = null;
    state.global.mystery = null;
    state.board = [];
    state.players = Array.from({ length: playerCount() }, (_, index) => ({
      pname: rosterName(index), secretId: null, eliminated: new Set(), mysteryUsed: false, secretVisible: true
    }));
    state.whowereyou = {
      modeVersion: Rules.MODE_VERSION,
      engineVersion: Rules.ENGINE_VERSION,
      sessionSeed,
      roundIndex: 0,
      phase: "builder-handoff",
      scores: Array(playerCount()).fill(0),
      rounds: []
    };
    session().rounds.push(makeRound(0));
    document.body.classList.remove("ruleset-groupthink");
    document.body.classList.add("ruleset-whowereyou");
    render();
    scheduleSave();
  }

  function serialize() {
    return clone(session());
  }

  function looksLikeCurrentSession(restored) {
    if (restored?.modeVersion !== Rules.MODE_VERSION || restored?.engineVersion !== Rules.ENGINE_VERSION) return false;
    if (!Array.isArray(restored.rounds) || !restored.rounds.length) return false;
    const round = restored.rounds[Math.min(restored.roundIndex || 0, restored.rounds.length - 1)];
    return Array.isArray(round?.founders) && round.founders.length === 8 && Array.isArray(round?.builderPairs);
  }

  function resume(saved) {
    const restored = saved?.whowereyou;
    const hadOldShape = restored && (restored.tree || restored.puzzles || restored.modeVersion !== Rules.MODE_VERSION);
    if (!looksLikeCurrentSession(restored)) {
      if (hadOldShape && typeof flashToast === "function") {
        flashToast("WHO? WERE YOU? has changed — start a new bloodline.");
      }
      startSession();
      return;
    }
    portraitCache.clear();
    state.gameMode = "local";
    state.playMode = "solo";
    state.inLobby = false;
    state.isHost = false;
    state.isObserver = false;
    state.location = null;
    state.global.mystery = null;
    state.board = [];
    state.whowereyou = clone(restored);
    const s = session();
    const count = playerCount();
    s.roundIndex = Math.min(s.roundIndex || 0, s.rounds.length - 1);
    if (!PHASES.includes(s.phase)) s.phase = "builder-handoff";
    while (s.scores.length < count) s.scores.push(0);
    s.rounds.forEach((round) => {
      round.builderPairs = Array.isArray(round.builderPairs) ? round.builderPairs : [[], []];
      round.guesses = round.guesses || {};
      if (!Array.isArray(round.guesserOrder) || !round.guesserOrder.length) {
        round.guesserOrder = Array.from({ length: count }, (_, index) => index).filter((index) => index !== round.builderIndex);
      }
      round.activeGuesser = Math.min(round.activeGuesser || 0, round.guesserOrder.length - 1);
    });
    state.gameSalt = s.sessionSeed;
    state.players = Array.from({ length: count }, (_, index) => ({
      pname: rosterName(index), secretId: null, eliminated: new Set(), mysteryUsed: false, secretVisible: true
    }));
    document.body.classList.remove("ruleset-groupthink");
    document.body.classList.add("ruleset-whowereyou");
    render();
  }

  // ===================== builder actions =====================

  function recomputeLineage(round) {
    round.parents = [null, null];
    round.descendant = null;
    round.fairness = null;
    round.builderPairs.forEach((pair, index) => {
      if (pair.length === 2) round.parents[index] = Rules.createParent(round.founders, pair, round.seed, `Parent ${index + 1}`);
    });
    if (round.builderPairs[0].length === 2 && round.builderPairs[1].length === 2) {
      const lineage = Rules.createLineage(round.founders, round.builderPairs, round.seed);
      round.parents = lineage.parents;
      round.descendant = lineage.descendant;
      const fairness = Rules.evaluateFairness(round.founders, round.builderPairs, round.seed);
      round.fairness = {
        verdict: fairness.verdict,
        margin: fairness.margin,
        rank: fairness.rank,
        bestWrongScore: fairness.bestWrongScore,
        configCount: fairness.configCount
      };
    }
  }

  function builderTapFounder(id) {
    if (!active() || session().phase !== "building") return;
    const round = currentRound();
    if (round.published || !founderById(round, id)) return;
    const pairs = round.builderPairs;
    const placedAt = pairs.findIndex((pair) => pair.includes(id));
    if (placedAt >= 0) {
      pairs[placedAt] = pairs[placedAt].filter((value) => value !== id);
    } else if (pairs[0].length < 2) {
      pairs[0].push(id);
    } else if (pairs[1].length < 2) {
      pairs[1].push(id);
    } else {
      return;   // all four slots full - clear something first
    }
    recomputeLineage(round);
    render();
    scheduleSave();
  }

  function clearCouple(index) {
    if (!active() || session().phase !== "building") return;
    const round = currentRound();
    if (round.published) return;
    round.builderPairs[index] = [];
    recomputeLineage(round);
    render();
    scheduleSave();
  }

  function rerollBoard() {
    if (!active() || session().phase !== "building") return;
    const round = currentRound();
    if (round.published) return;
    session().rounds[session().roundIndex] = makeRound(session().roundIndex, (round.reroll || 0) + 1);
    portraitCache.clear();
    render();
    scheduleSave();
  }

  function canPublish() {
    const round = currentRound();
    return !!(round?.descendant && round.fairness && round.fairness.verdict !== "ambiguous");
  }

  function publishBloodline() {
    if (!active() || session().phase !== "building" || !canPublish()) return;
    const round = currentRound();
    round.published = true;
    round.activeGuesser = 0;
    session().phase = "guesser-handoff";
    render();
    scheduleSave();
  }

  // ===================== guesser actions =====================

  function currentGuess() {
    const round = currentRound();
    const playerIndex = currentGuesserIndex();
    if (!round.guesses[playerIndex]) round.guesses[playerIndex] = { pairs: [[], []], locked: false };
    return round.guesses[playerIndex];
  }

  function guesserTapFounder(id) {
    if (!active() || session().phase !== "guessing") return;
    const round = currentRound();
    if (!founderById(round, id)) return;
    const guess = currentGuess();
    if (guess.locked) return;
    const placedAt = guess.pairs.findIndex((pair) => pair.includes(id));
    if (placedAt >= 0) {
      guess.pairs[placedAt] = guess.pairs[placedAt].filter((value) => value !== id);
    } else if (guess.pairs[0].length < 2) {
      guess.pairs[0].push(id);
    } else if (guess.pairs[1].length < 2) {
      guess.pairs[1].push(id);
    } else {
      return;
    }
    render();
    scheduleSave();
  }

  function rotatePairing() {
    if (!active() || session().phase !== "guessing") return;
    const guess = currentGuess();
    if (guess.locked || guess.pairs.flat().length !== 4) return;
    const [w, x, y, z] = guess.pairs.flat().slice().sort();
    const variants = [[[w, x], [y, z]], [[w, y], [x, z]], [[w, z], [x, y]]];
    const currentKey = Rules.canonicalConfig(guess.pairs).key;
    const index = variants.findIndex((variant) => Rules.canonicalConfig(variant).key === currentKey);
    guess.pairs = clone(variants[(index + 1) % variants.length]);
    render();
    scheduleSave();
  }

  function lockGuess() {
    if (!active() || session().phase !== "guessing") return;
    const round = currentRound();
    const guess = currentGuess();
    if (guess.locked || guess.pairs.flat().length !== 4) return;
    guess.locked = true;
    if (round.activeGuesser + 1 < round.guesserOrder.length) {
      round.activeGuesser += 1;
      session().phase = "guesser-handoff";
      render();
      scheduleSave();
      return;
    }
    finishRound();
  }

  function finishRound() {
    const s = session();
    const round = currentRound();
    round.results = {
      players: round.guesserOrder.map((playerIndex) => {
        const guess = round.guesses[playerIndex];
        const scored = guess?.pairs?.flat().length === 4
          ? Rules.scoreLineageGuess(round.founders, round.builderPairs, guess.pairs, round.seed)
          : { valid: false, score: 0, founderPoints: 0, couplePoints: 0, compatibilityPoints: 0, correctFounders: 0, correctCouples: 0, exact: false, similarity: 0 };
        s.scores[playerIndex] += scored.score;
        return { playerIndex, name: rosterName(playerIndex), pairs: guess?.pairs || [[], []], ...scored };
      }),
      callouts: Rules.traitCallouts(round.founders, round.parents, round.descendant, 6)
    };
    s.phase = "reveal";
    render();
    scheduleSave();
  }

  // ===================== phase advancement =====================

  function beginTurn() {
    if (!active()) return;
    const s = session();
    if (s.phase === "builder-handoff") s.phase = "building";
    else if (s.phase === "guesser-handoff") s.phase = "guessing";
    else return;
    document.querySelector(".wwy-handoff")?.remove();
    render();
    scheduleSave();
  }

  function continueToScore() {
    if (!active() || session().phase !== "reveal") return;
    session().phase = "round-score";
    render();
    scheduleSave();
  }

  function nextRound() {
    if (!active() || session().phase !== "round-score") return;
    const s = session();
    if (s.roundIndex + 1 >= playerCount()) {
      s.phase = "finale";
      render();
      scheduleSave();
      return;
    }
    s.roundIndex += 1;
    s.rounds.push(makeRound(s.roundIndex));
    s.phase = "builder-handoff";
    render();
    scheduleSave();
  }

  function returnToMenu() {
    clearOwnSave();
    document.querySelector(".wwy-handoff")?.remove();
    document.body.classList.remove("ruleset-whowereyou");
    state.whowereyou = null;
    state.ruleset = "whoisit";
    showTitleScreen();
  }

  // ===================== shared markup =====================

  function founderCardMarkup(round, node, badges) {
    const badge = badges?.get(node.id);
    return `<button type="button" class="wwy-founder ${badge ? "is-placed" : ""}" data-founder="${escapeHtml(node.id)}">
      <span class="wwy-founder-letter">${escapeHtml(node.label)}</span>
      ${badge ? `<span class="wwy-founder-badge">${escapeHtml(badge)}</span>` : ""}
      <img src="${nodePortrait(node)}" alt="Founder ${escapeHtml(node.label)}">
    </button>`;
  }

  function founderBoardMarkup(round, pairs) {
    const badges = new Map();
    (pairs || []).forEach((pair, coupleIndex) => pair.forEach((id) => badges.set(id, `C${coupleIndex + 1}`)));
    return `<div class="wwy-founder-board">
      ${round.founders.map((node) => founderCardMarkup(round, node, badges)).join("")}
    </div>`;
  }

  function slotMarkup(round, pair, coupleIndex, slotIndex) {
    const id = pair[slotIndex];
    const node = id ? founderById(round, id) : null;
    if (!node) return `<span class="wwy-slot is-empty" data-couple="${coupleIndex}"><b>?</b></span>`;
    return `<button type="button" class="wwy-slot" data-founder="${escapeHtml(node.id)}" aria-label="Remove Founder ${escapeHtml(node.label)}">
      <img src="${nodePortrait(node)}" alt=""><b>${escapeHtml(node.label)}</b>
    </button>`;
  }

  function personCardMarkup(node, caption, extraClass = "") {
    if (!node) return `<div class="wwy-person is-unknown ${extraClass}"><span>?</span><b>${escapeHtml(caption)}</b></div>`;
    return `<div class="wwy-person ${extraClass}">
      <img src="${nodePortrait(node)}" alt="${escapeHtml(caption)}"><b>${escapeHtml(caption)}</b>
    </div>`;
  }

  function fairnessMarkup(round) {
    if (!round.descendant || !round.fairness) {
      return `<div class="wwy-fairness is-idle"><b>FAIRNESS</b><span>Complete both couples to test this bloodline.</span></div>`;
    }
    const f = round.fairness;
    const width = Math.round(Math.max(4, Math.min(100, f.margin * 5)));
    return `<div class="wwy-fairness is-${f.verdict}">
      <b>FAIRNESS</b>
      <span class="wwy-fairness-verdict">${VERDICT_TEXT[f.verdict]}</span>
      <span class="wwy-fairness-bar"><i style="width:${width}%"></i></span>
      <small>${f.margin.toFixed(1)} pts clear of the best wrong answer · ${f.configCount} answers simulated</small>
    </div>`;
  }

  // ===================== phase screens =====================

  function waitingMarkup(recipient) {
    return `<div class="wwy-waiting">
      <p>WHO? WERE YOU?</p>
      <b>${escapeHtml(recipient)}</b>
      <span>is taking a private turn</span>
    </div>`;
  }

  function handoffMarkup() {
    const s = session();
    const round = currentRound();
    const isBuilder = s.phase === "builder-handoff";
    const name = isBuilder ? rosterName(round.builderIndex) : rosterName(currentGuesserIndex());
    return `<div class="wwy-handoff" role="dialog" aria-modal="true">
      <div>
        <small>${isBuilder ? "THE MAKER'S BENCH PASSES TO" : "PASS THE DEVICE TO"}</small>
        <b>${escapeHtml(name)}</b>
        <p>${isBuilder
          ? "Build a bloodline in secret: two couples, one descendant. Everyone else will reconstruct it."
          : "Study the descendant and rebuild the ancestry in private. Tap only when they are ready."}</p>
        <button type="button" class="button primary wwy-ready">I'M ${escapeHtml(name.toUpperCase())}</button>
      </div>
    </div>`;
  }

  function buildingMarkup() {
    const round = currentRound();
    const pairs = round.builderPairs;
    const filled = pairs.flat().length;
    const activeCouple = pairs[0].length < 2 ? 0 : 1;
    return `<div class="wwy-build">
      <header class="wwy-screen-head">
        <span>BREEDING WORKBENCH</span>
        <h2>${escapeHtml(rosterName(round.builderIndex))} MAKES A BLOODLINE</h2>
        <p>${filled < 4 ? `Tap founders to fill Couple ${activeCouple + 1}. Tap again to put one back.` : "Review the private tree, then publish or revise a couple."}</p>
      </header>
      ${founderBoardMarkup(round, pairs)}
      <div class="wwy-couples">
        ${pairs.map((pair, coupleIndex) => `<section class="wwy-couple ${coupleIndex === activeCouple && filled < 4 ? "is-active" : ""}">
          <div class="wwy-couple-head"><b>COUPLE ${coupleIndex + 1}</b>
            ${pair.length ? `<button type="button" class="wwy-clear-couple" data-couple="${coupleIndex}">CLEAR</button>` : ""}
          </div>
          <div class="wwy-couple-row">
            ${slotMarkup(round, pair, coupleIndex, 0)}
            <span class="wwy-plus">+</span>
            ${slotMarkup(round, pair, coupleIndex, 1)}
            <span class="wwy-arrow">→</span>
            ${personCardMarkup(round.parents[coupleIndex], `Parent ${coupleIndex + 1}`, "is-parent")}
          </div>
        </section>`).join("")}
      </div>
      <div class="wwy-birth">
        ${personCardMarkup(round.descendant, "The Descendant", "is-descendant")}
        ${fairnessMarkup(round)}
      </div>
      <div class="wwy-build-actions">
        <button type="button" class="button wwy-reroll">REROLL THE BOARD</button>
        <button type="button" class="button primary wwy-publish" ${canPublish() ? "" : "disabled"}>PUBLISH THIS BLOODLINE</button>
      </div>
    </div>`;
  }

  function guessingMarkup() {
    const round = currentRound();
    const guess = currentGuess();
    const filled = guess.pairs.flat().length;
    return `<div class="wwy-guess">
      <header class="wwy-screen-head">
        <span>RECONSTRUCT THE ANCESTRY</span>
        <h2>WHO MADE THIS?</h2>
      </header>
      <div class="wwy-guess-layout">
        <div class="wwy-guess-target">
          ${personCardMarkup(round.descendant, "The Descendant", "is-descendant is-large")}
          <p>Four of these eight strangers made this person. Pick them, then arrange the two couples.</p>
        </div>
        <div class="wwy-guess-work">
          ${founderBoardMarkup(round, guess.pairs)}
          <div class="wwy-trays">
            ${guess.pairs.map((pair, coupleIndex) => `<section class="wwy-tray ${filled < 4 && (coupleIndex === (guess.pairs[0].length < 2 ? 0 : 1)) ? "is-active" : ""}">
              <b>COUPLE ${coupleIndex + 1}</b>
              <div class="wwy-couple-row">
                ${slotMarkup(round, pair, coupleIndex, 0)}
                <span class="wwy-plus">+</span>
                ${slotMarkup(round, pair, coupleIndex, 1)}
              </div>
            </section>`).join("")}
          </div>
          <div class="wwy-guess-actions">
            <button type="button" class="button wwy-rotate-pairing" ${filled === 4 ? "" : "disabled"}>SWAP THE PAIRING</button>
            <button type="button" class="button primary wwy-lock" ${filled === 4 ? "" : "disabled"}>LOCK ANCESTRY</button>
          </div>
        </div>
      </div>
    </div>`;
  }

  function revealLineupMarkup(round) {
    // Founders fade in, then the couples, then the parents, then the descendant.
    let step = 0;
    const delay = () => `style="--wwy-step:${step += 1}"`;
    return `<div class="wwy-lineage">
      <div class="wwy-lineage-row wwy-lineage-founders">
        ${round.builderPairs.map((pair, coupleIndex) => `<div class="wwy-lineage-couple" ${delay()}>
          ${pair.map((id) => personCardMarkup(founderById(round, id), `Founder ${founderById(round, id)?.label || "?"}`)).join('<span class="wwy-plus">+</span>')}
        </div>`).join("")}
      </div>
      <div class="wwy-lineage-row">
        ${round.parents.map((parent, index) => `<div class="wwy-lineage-node" ${delay()}>${personCardMarkup(parent, `Parent ${index + 1}`, "is-parent")}</div>`).join("")}
      </div>
      <div class="wwy-lineage-row">
        <div class="wwy-lineage-node" ${delay()}>${personCardMarkup(round.descendant, "The Descendant", "is-descendant")}</div>
      </div>
    </div>`;
  }

  function revealMarkup() {
    const round = currentRound();
    const unused = round.founders.filter((node) => !round.builderPairs.flat().includes(node.id));
    return `<div class="wwy-reveal">
      <header class="wwy-screen-head">
        <span>ROUND ${session().roundIndex + 1} · MADE BY ${escapeHtml(rosterName(round.builderIndex).toUpperCase())}</span>
        <h2>THE BLOODLINE REVEALED</h2>
      </header>
      ${revealLineupMarkup(round)}
      <section class="wwy-callouts">
        <b>HOW THE TRAITS TRAVELLED</b>
        <ul>${(round.results?.callouts || []).map((callout) => `<li>${escapeHtml(callout.text)}</li>`).join("")}</ul>
      </section>
      <section class="wwy-red-herrings">
        <b>NEVER IN THE FAMILY</b>
        <div>${unused.map((node) => personCardMarkup(node, `Founder ${node.label}`, "is-dim")).join("")}</div>
      </section>
      <button type="button" class="button primary wwy-continue">SEE THE SCORES →</button>
    </div>`;
  }

  function guessSummary(round, entry) {
    const label = (id) => founderById(round, id)?.label || "?";
    return entry.pairs.map((pair) => pair.map(label).join("+")).join(" | ");
  }

  function scoreMarkup() {
    const s = session();
    const round = currentRound();
    const lastRound = s.roundIndex + 1 >= playerCount();
    return `<div class="wwy-score">
      <header class="wwy-screen-head">
        <span>ROUND ${s.roundIndex + 1} OF ${playerCount()}</span>
        <h2>WHO READ THE BLOOD BEST?</h2>
      </header>
      <div class="wwy-score-list">
        ${(round.results?.players || []).map((entry) => `<article class="wwy-score-card ${entry.exact ? "is-exact" : ""}">
          <b>${escapeHtml(entry.name)}</b>
          <strong>+${entry.score}</strong>
          <small>guessed ${escapeHtml(guessSummary(round, entry))}${entry.exact ? " · EXACT BLOODLINE" : ""}</small>
          <span>${entry.correctFounders}/4 founders (+${entry.founderPoints}) · ${entry.correctCouples}/2 couples (+${entry.couplePoints}) · resemblance +${entry.compatibilityPoints}</span>
        </article>`).join("")}
      </div>
      <div class="wwy-standings">
        <b>STANDINGS</b>
        ${state.roster.map((player, index) => `<span class="${index === round.builderIndex ? "is-maker" : ""}">
          <b>${escapeHtml(player.name)}</b><strong>${s.scores[index] || 0}</strong>
          ${index === round.builderIndex ? "<small>made this round</small>" : ""}
        </span>`).join("")}
      </div>
      <button type="button" class="button primary wwy-next-round">${lastRound ? "SEE THE FINAL RECKONING →" : `HAND THE BENCH TO ${escapeHtml(rosterName((s.roundIndex + 1) % playerCount()).toUpperCase())} →`}</button>
    </div>`;
  }

  function finaleMarkup() {
    const s = session();
    const ordered = state.roster.map((player, index) => ({ name: player.name, score: s.scores[index] || 0 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const winner = ordered[0];
    return `<div class="wwy-finale">
      <p>EVERY PLAYER HAS MADE A BLOODLINE</p>
      <h2>WHO? WERE YOU?</h2>
      <div class="wwy-final-score">
        ${ordered.map((player, index) => `<span class="${index === 0 ? "is-winner" : ""}">
          <small>${index + 1}</small><b>${escapeHtml(player.name)}</b><strong>${player.score}</strong>
        </span>`).join("")}
      </div>
      <p class="wwy-final-note">${escapeHtml(winner.name)} read the family resemblance best. Every face tonight was a stylized invention—no real ancestry, race, or ethnicity is ever inferred.</p>
      <div class="wwy-final-actions">
        <button type="button" class="button primary wwy-again">NEW DYNASTY</button>
        <button type="button" class="button wwy-menu">MAIN MENU</button>
      </div>
    </div>`;
  }

  // ===================== chrome =====================

  function sidebarCopy() {
    const s = session();
    const round = currentRound();
    switch (s.phase) {
      case "builder-handoff":
      case "guesser-handoff":
        return { role: "PRIVATE HANDOFF", name: rosterName(s.phase === "builder-handoff" ? round.builderIndex : currentGuesserIndex()), prompt: "Pass the device without peeking.", status: "" };
      case "building":
        return { role: "THE MAKER", name: rosterName(round.builderIndex), prompt: "Choose two couples. The lab breeds them live. Publish only what can be read.", status: round.fairness ? VERDICT_TEXT[round.fairness.verdict] : `${round.builderPairs.flat().length} / 4 founders placed` };
      case "guessing":
        return { role: "THE DETECTIVE", name: rosterName(currentGuesserIndex()), prompt: "Rebuild the ancestry: pick four founders and arrange the two couples.", status: `${currentGuess().pairs.flat().length} / 4 founders placed` };
      case "reveal":
        return { role: "THE REVEAL", name: rosterName(round.builderIndex), prompt: "The bloodline unrolls. Compare the evidence.", status: "" };
      case "round-score":
        return { role: "ROUND SCORE", name: `ROUND ${s.roundIndex + 1}`, prompt: "Only guessers score. The Maker's reward is the chaos they authored.", status: "" };
      default:
        return { role: "THE DYNASTY", name: "COMPLETE", prompt: "Every player has been the Maker once.", status: "" };
    }
  }

  function renderSidebar() {
    const s = session();
    const round = currentRound();
    const copy = sidebarCopy();
    els.roomCode.textContent = `ROUND ${Math.min(s.roundIndex + 1, playerCount())} / ${playerCount()}`;
    els.secretCard.className = "secret-card wwy-secret-card";
    const showDescendant = round?.descendant && (s.phase === "guessing" || s.phase === "reveal" || s.phase === "round-score" || round.published);
    els.secretCard.innerHTML = `
      <div class="wwy-side-player">${copy.role}</div>
      ${showDescendant ? `<img src="${nodePortrait(round.descendant)}" alt="">` : `<span class="wwy-side-mark">?</span>`}
      <b>${escapeHtml(copy.name)}</b>
      <small>${escapeHtml(copy.status || " ")}</small>`;
    els.questionPrompt.textContent = copy.prompt;
    els.mysteryResult.textContent = "Visible traits only. No race or ethnicity is inferred.";
    els.opponentPanel.innerHTML = "";
    els.seatRoster.innerHTML = state.roster.map((player, index) =>
      `<span class="wwy-roster-chip ${index === round?.builderIndex ? "is-maker" : ""}">
        <b>${escapeHtml(player.name)}</b>${index === round?.builderIndex ? '<i title="This round\'s Maker">⚗</i>' : ""}<small>${s.scores[index] || 0}</small>
      </span>`
    ).join("");
    els.roomStatus.textContent = (s.phase === "building" || s.phase === "guessing") ? "Answers stay private until the reveal." : "";
  }

  function renderMain() {
    const s = session();
    els.locationBand.innerHTML = "";
    els.locationBand.className = "location-band is-off";
    document.querySelector("#locationBackdrop")?.style.removeProperty("background-image");
    els.hintShelf.innerHTML = "";
    els.characterBoard.className = "character-board wwy-board";
    const round = currentRound();
    let markup = "";
    switch (s.phase) {
      case "building": markup = buildingMarkup(); break;
      case "guessing": markup = guessingMarkup(); break;
      case "reveal": markup = revealMarkup(); break;
      case "round-score": markup = scoreMarkup(); break;
      case "finale": markup = finaleMarkup(); break;
      default: markup = waitingMarkup(rosterName(s.phase === "builder-handoff" ? round.builderIndex : currentGuesserIndex()));
    }
    els.characterBoard.innerHTML = markup;
    document.querySelector(".wwy-handoff")?.remove();
    if (s.phase === "builder-handoff" || s.phase === "guesser-handoff") {
      document.body.insertAdjacentHTML("beforeend", handoffMarkup());
    }
  }

  function bindEvents() {
    const s = session();
    const isBuilding = s.phase === "building";
    els.characterBoard.querySelectorAll(".wwy-founder, .wwy-slot[data-founder]").forEach((button) =>
      button.addEventListener("click", () => (isBuilding ? builderTapFounder : guesserTapFounder)(button.dataset.founder)));
    els.characterBoard.querySelectorAll(".wwy-clear-couple").forEach((button) =>
      button.addEventListener("click", () => clearCouple(Number(button.dataset.couple))));
    els.characterBoard.querySelector(".wwy-reroll")?.addEventListener("click", rerollBoard);
    els.characterBoard.querySelector(".wwy-publish")?.addEventListener("click", publishBloodline);
    els.characterBoard.querySelector(".wwy-rotate-pairing")?.addEventListener("click", rotatePairing);
    els.characterBoard.querySelector(".wwy-lock")?.addEventListener("click", lockGuess);
    els.characterBoard.querySelector(".wwy-continue")?.addEventListener("click", continueToScore);
    els.characterBoard.querySelector(".wwy-next-round")?.addEventListener("click", nextRound);
    els.characterBoard.querySelector(".wwy-again")?.addEventListener("click", () => startSession());
    els.characterBoard.querySelector(".wwy-menu")?.addEventListener("click", returnToMenu);
    document.querySelector(".wwy-ready")?.addEventListener("click", beginTurn);
  }

  function render() {
    if (!active() || !session()) return;
    document.title = DISPLAY_NAME;
    document.body.classList.add("ruleset-whowereyou");
    document.body.classList.remove("ruleset-groupthink", "guess-mode", "observer");
    renderSidebar();
    renderMain();
    bindEvents();
  }

  function syncAction() {
    if (!active()) return;
    const button = els.swapSeatButton;
    if (button) button.hidden = true;
  }

  function primaryAction() {
    if (!active()) return false;
    const phase = session().phase;
    if (phase === "builder-handoff" || phase === "guesser-handoff") beginTurn();
    else if (phase === "building") publishBloodline();
    else if (phase === "guessing") lockGuess();
    else if (phase === "reveal") continueToScore();
    else if (phase === "round-score") nextRound();
    return true;
  }

  window.WhoWereYou = {
    RULESET,
    DISPLAY_NAME,
    active,
    startSession,
    resume,
    serialize,
    render,
    syncAction,
    primaryAction,
    beginTurn,
    builderTapFounder,
    guesserTapFounder,
    clearCouple,
    rerollBoard,
    publishBloodline,
    rotatePairing,
    lockGuess,
    continueToScore,
    nextRound,
    returnToMenu
  };
})();
