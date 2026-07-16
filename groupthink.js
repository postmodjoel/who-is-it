// WHO? DO YOU THINK? — a second ruleset built on the shared face engine, deliberately using only its
// plain card board. The neutral faces are the setup; the room's consensus is the joke. Everyone
// nominates from one communal cast. YOLO Mode turns each reveal into a secret survivor vote with
// permanent cuts; switch it off for eight scored rounds where the full cast always returns.
(function installGroupthink() {
  const RULESET = "groupthink";
  const DISPLAY_NAME = "WHO? DO YOU THINK?";
  const Rules = window.GroupthinkRules;
  if (!Rules) throw new Error("GroupthinkRules must load before groupthink.js");
  const Lab = window.GroupthinkLab;
  const FULL_DECK_ROUNDS = Rules.FULL_DECK_ROUNDS;
  const productionRules = Rules.PRODUCTION;

  const active = () => typeof state !== "undefined" && state.ruleset === RULESET;
  const playerIndex = () => state.gameMode === "online" ? (state.mySeat || 0) : clampSeatIndex(state.currentPlayer);
  const gt = () => state.groupthink;
  const rosterName = (i) => state.roster?.[i]?.name || `Player ${i + 1}`;
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const baseCharacters = () => (gt()?.baseBoard || []).map(hydrateSerializedCharacter).filter(Boolean);
  const yoloMode = () => state.settings.groupthinkYolo !== false;
  const pickCountForBoard = (count) => Rules.pickCountForBoard(count, true);
  const pickCount = () => yoloMode() ? (gt()?.pickCount || pickCountForBoard(state.board?.length || 0)) : 3;
  const doubleDownEnabled = () => productionRules.doubleDown && gt()?.variant !== "duo-coop";
  const pickWord = (count) => count === 1 ? "one" : count === 2 ? "two" : "three";
  const currentRevision = () => Math.max(0, Number(gt()?.revision) || 0);

  function labConfig(seed, playerCount, boardSize) {
    return {
      seed,
      playerCount,
      yolo: yoloMode(),
      boardSize,
      savePolicy: productionRules.savePolicy,
      boardPolicy: productionRules.boardPolicy,
      doubleDown: productionRules.doubleDown,
      hostCanExport: state.gameMode !== "online" || state.isHost,
      roundIndex: gt()?.roundIndex || 0
    };
  }

  function recordLabRound(result, saveOutcome = null) {
    if (!Lab?.enabled()) return;
    Lab.recordRound({
      roundIndex: gt().roundIndex,
      boardBefore: Number(result?.boardBefore) || state.board.length,
      boardAfter: state.board.length,
      pickCount: gt().pickCount,
      picks: clone(result?.picks || []),
      matchCounts: (result?.matchCounts || []).slice(),
      roundScores: (result?.roundScores || []).slice(),
      doubleDowns: (result?.doubleDowns || []).slice(),
      doubleDownHits: (result?.doubleDownHits || []).slice(),
      saveOutcome: saveOutcome ? clone(saveOutcome) : null
    });
  }

  // Groupthink has more phases than classic WHO? IS IT?, so its online events carry a monotonic
  // revision. This makes stale/out-of-order packets harmless without changing the shared net layer
  // used by the base game.
  function bumpRevision() {
    if (!gt()) return 0;
    gt().revision = currentRevision() + 1;
    return gt().revision;
  }

  function isHostMessage(msg) {
    const hostId = typeof netHostId === "function" ? netHostId() : null;
    return !!hostId && typeof msg?.clientId === "string" && msg.clientId === hostId;
  }

  function adoptHostRevision(msg) {
    const revision = Number(msg?.revision);
    if (!isHostMessage(msg) || !Number.isInteger(revision) || revision <= currentRevision()) return false;
    gt().revision = revision;
    return true;
  }

  function seatIsGone(index) {
    const clientId = state.roster?.[index]?.clientId;
    return !!clientId && typeof netPeerGone === "function" && netPeerGone(clientId);
  }

  function syncSurvivorBoard() {
    const removed = new Set(yoloMode() ? (gt()?.removed || []) : []);
    const restored = baseCharacters();
    if (restored.length) state.board = restored.filter((character) => !removed.has(character.id));
  }

  function emptyState(count, sessionSalt, variant) {
    return {
      variant: variant || (count === 2 ? "duo-coop" : "standard"),
      sessionSalt,
      revision: 0,
      roundIndex: 0,
      phase: "selecting",
      promptId: "",
      promptText: "",
      effectId: null,
      pickCount: 3,
      picks: Array.from({ length: count }, () => []),
      doubleDowns: Array(count).fill(null),
      locked: Array(count).fill(false),
      skipped: Array(count).fill(false),
      removed: [],
      saveVotes: Array(count).fill(null),
      saveLocked: Array(count).fill(false),
      saveSkipped: Array(count).fill(false),
      scores: Array(count).fill(0),
      roundScores: Array(count).fill(0),
      syncScore: 0,
      history: [],
      baseBoard: []
    };
  }

  function startSession(seedSalt, opts = {}) {
    state.settings = normalizeGameSettings(state.settings);
    state.playMode = "solo";
    state.roundOver = false;
    state.guessMode = false;
    state.wheelPick = null;
    clearMysteryEffectUI();
    document.querySelectorAll(".round-reveal, .gt-results, .gt-handoff, .gt-finale").forEach((el) => el.remove());
    const sessionSalt = seedSalt || `groupthink-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    state.gameSalt = sessionSalt;
    if (state.gameMode !== "online") state.roomCode = String((stableHash(sessionSalt) % 9000) + 1000);
    assignRosterTeams({ preserveExisting: opts.resume || opts.preserveRosterSides });
    if (state.roster?.length) state.playerCount = state.roster.length;
    const count = Math.max(2, state.roster?.length || state.playerCount || 2);
    const boardSize = Math.min(Rules.boardSizeForPlayers(count, productionRules.boardPolicy), generatedCharacters.length);
    state.settings.boardSize = boardSize;
    state.board = buildBoard(generatedCharacters, boardSize);
    const taken = new Set();
    state.players = Array.from({ length: count }, (_, i) => makePlayer(i, taken));
    state.players.forEach((p) => { p.eliminated = new Set(); p.secretVisible = false; });
    state.currentPlayer = state.gameMode === "online" ? (state.mySeat || 0) : 0;
    state.global.hints = Array.from({ length: count }, () => []);
    state.global.undo = Array.from({ length: count }, () => []);
    state.global.roleMap = {};
    state.board.forEach((ch, i) => { state.global.roleMap[ch.id] = state.settings.roles ? characterRoles[i % characterRoles.length] : ch.role; });
    state.groupthink = emptyState(count, sessionSalt);
    state.groupthink.baseBoard = state.board.map(serializeCharacter);
    Lab?.start(labConfig(sessionSalt, count, state.board.length), { resume: false });
    state.roundAge = 0;
    state.lore = [];
    state.stats = {};
    state.scoreboard = {};
    state.seenPrompts = new Set();

    if (state.gameMode === "online") {
      netConnect();
      Lab?.announce();
      if (!opts.remote && !opts.announced) {
        netSend("start", {
          salt: sessionSalt,
          settings: state.settings,
          effectId: null,
          roster: rosterForWire(),
          playerCount: state.playerCount,
          playMode: "solo",
          ruleset: RULESET,
          first: true
        });
      }
    }
    startRound(0, { roundSalt: sessionSalt });
    scheduleSave();
  }

  function resume(saved) {
    state.playMode = "solo";
    const raw = saved.groupthink || {};
    const count = Math.max(2, state.roster?.length || saved.playerCount || 2);
    state.groupthink = { ...emptyState(count, raw.sessionSalt || saved.salt), ...clone(raw) };
    state.groupthink.picks = Array.from({ length: count }, (_, i) => Array.isArray(raw.picks?.[i]) ? raw.picks[i].slice() : []);
    state.groupthink.doubleDowns = Array.from({ length: count }, (_, i) => {
      const id = raw.doubleDowns?.[i];
      return doubleDownEnabled() && typeof id === "string" && state.groupthink.picks[i].includes(id) ? id : null;
    });
    state.groupthink.saveVotes = Array.from({ length: count }, (_, i) => typeof raw.saveVotes?.[i] === "string" ? raw.saveVotes[i] : null);
    state.groupthink.removed = Array.isArray(raw.removed)
      ? [...new Set(raw.removed)]
      : [...new Set((raw.used || []).flat().filter(Boolean))];
    ["locked", "scores", "roundScores"].forEach((key) => {
      state.groupthink[key] = Array.from({ length: count }, (_, i) => raw[key]?.[i] ?? (key === "locked" ? false : 0));
    });
    state.groupthink.saveLocked = Array.from({ length: count }, (_, i) => !!raw.saveLocked?.[i]);
    state.groupthink.skipped = Array.from({ length: count }, (_, i) => !!raw.skipped?.[i]);
    state.groupthink.saveSkipped = Array.from({ length: count }, (_, i) => !!raw.saveSkipped?.[i]);
    state.groupthink.revision = Math.max(0, Number(raw.revision) || 0);
    // Older saves may contain a mystery effect from before WHO? DO YOU THINK? settled on its plain-card
    // identity. Migrate them forward silently instead of reviving a special board on refresh.
    state.groupthink.effectId = null;
    state.wheelPick = null;
    state.board = hydrateSavedBoard(saved);
    if (!state.groupthink.baseBoard?.length && state.board.length) state.groupthink.baseBoard = state.board.map(serializeCharacter);
    if (!state.groupthink.baseBoard?.length) {
      state.gameSalt = state.groupthink.sessionSalt;
      const boardSize = Math.min(Rules.boardSizeForPlayers(count, productionRules.boardPolicy), generatedCharacters.length);
      state.board = buildBoard(generatedCharacters, boardSize);
      state.groupthink.baseBoard = state.board.map(serializeCharacter);
    }
    syncSurvivorBoard();
    state.groupthink.pickCount = yoloMode() ? (Number(raw.pickCount) || pickCountForBoard(state.board.length)) : 3;
    state.gameSalt = saved.salt || roundSalt(state.groupthink.roundIndex);
    assignRosterTeams({ preserveExisting: true });
    const taken = new Set();
    state.players = Array.from({ length: count }, (_, i) => makePlayer(i, taken));
    state.players.forEach((p) => { p.eliminated = new Set(); p.secretVisible = false; });
    const pendingLocks = state.groupthink.phase === "saving" ? state.groupthink.saveLocked : state.groupthink.locked;
    state.currentPlayer = state.gameMode === "online" ? (state.mySeat || 0) : Math.max(0, pendingLocks.findIndex((x) => !x));
    if (state.currentPlayer < 0) state.currentPlayer = 0;
    state.global.hints = Array.from({ length: count }, () => []);
    state.global.undo = Array.from({ length: count }, () => []);
    state.global.roleMap = {};
    state.board.forEach((ch, i) => { state.global.roleMap[ch.id] = state.settings.roles ? characterRoles[i % characterRoles.length] : ch.role; });
    state.location = state.settings.locations ? locations[stableHash(`${state.gameSalt}:loc`) % locations.length] : null;
    state.locationVariant = stableHash(`${state.gameSalt}:var`) % 2 ? "night" : "day";
    clearMysteryEffectUI();
    Lab?.start(labConfig(state.groupthink.sessionSalt, count, state.groupthink.baseBoard.length || state.board.length), { resume: true });
    Lab?.event("browser-resume", { phase: state.groupthink.phase, roundIndex: state.groupthink.roundIndex, revision: state.groupthink.revision });
    if (state.gameMode === "online") {
      netConnect();
      Lab?.setHost(!!state.isHost);
      Lab?.announce();
    }
    render();
    if (["saving", "results"].includes(state.groupthink.phase) && state.groupthink.lastResult) showResults(state.groupthink.lastResult);
    if (state.groupthink.phase === "complete") showFinale();
    scheduleSave();
  }

  function serialize() {
    return active() && gt() ? clone(gt()) : null;
  }

  function roundSalt(index) {
    return `${gt()?.sessionSalt || state.gameSalt}:groupthink:${index}`;
  }

  function allPrompts() {
    const data = window.GameData?.groupthinkPrompts || { base: [], locations: [] };
    return [...(data.base || []), ...(data.locations || [])];
  }

  function promptById(id) {
    return allPrompts().find((p) => p.id === id) || null;
  }

  function promptPool() {
    const data = window.GameData?.groupthinkPrompts || { base: [], locations: [] };
    const heat = new Set(allowedHeats(gt()?.roundIndex || 0, state.settings.pg));
    let pool = [...(data.base || [])];
    if (state.location) pool.push(...(data.locations || []));
    pool = pool.filter((p) => heat.has(p.heat || "mild") && (!state.settings.pg || p.pgSafe !== false));
    return pool.length ? pool : (data.base || []).filter((p) => !state.settings.pg || p.pgSafe !== false);
  }

  function choosePrompt(forcedId) {
    if (forcedId) {
      const forced = promptById(forcedId);
      if (forced) return forced;
    }
    const used = new Set((gt()?.history || []).map((h) => h.promptId));
    const pool = promptPool();
    const fresh = pool.filter((p) => !used.has(p.id));
    const options = fresh.length ? fresh : pool;
    return options.slice().sort((a, b) => stableHash(`${state.gameSalt}:prompt:${a.id}`) - stableHash(`${state.gameSalt}:prompt:${b.id}`))[0];
  }

  function startRound(index, config = {}) {
    if (!active() || !gt()) return;
    const app = document.querySelector("#app");
    if (app) app.inert = false;
    document.querySelectorAll(".gt-results, .gt-handoff, .gt-finale").forEach((el) => el.remove());
    clearMysteryEffectUI();
    syncSurvivorBoard();
    state.gameSalt = config.roundSalt || roundSalt(index);
    state.wheelPick = null;
    state.roundAge = index;
    state.plainRound = true;
    state.location = state.settings.locations ? locations[stableHash(`${state.gameSalt}:loc`) % locations.length] : null;
    state.locationVariant = stableHash(`${state.gameSalt}:var`) % 2 ? "night" : "day";
    gt().roundIndex = index;
    gt().phase = "selecting";
    gt().effectId = null;
    gt().pickCount = yoloMode() ? pickCountForBoard(state.board.length) : 3;
    gt().picks = Array.from({ length: state.players.length }, () => []);
    gt().doubleDowns = Array(state.players.length).fill(null);
    gt().locked = Array(state.players.length).fill(false);
    gt().skipped = Array(state.players.length).fill(false);
    gt().saveVotes = Array(state.players.length).fill(null);
    gt().saveLocked = Array(state.players.length).fill(false);
    gt().saveSkipped = Array(state.players.length).fill(false);
    gt().roundScores = Array(state.players.length).fill(0);
    gt().lastResult = null;
    const prompt = choosePrompt(config.promptId);
    gt().promptId = prompt?.id || "";
    gt().promptText = prompt?.text || `Pick ${pickWord(gt().pickCount)} people who concern you.`;
    if (Number.isInteger(config.revision)) gt().revision = config.revision;
    else if (state.gameMode !== "online" || state.isHost) bumpRevision();
    state.currentPlayer = state.gameMode === "online" ? (state.mySeat || 0) : 0;
    Lab?.phase("selecting", { roundIndex: index, revision: gt().revision, boardCount: state.board.length });
    render();
    scheduleSave();
  }

  function formattedPrompt() {
    const word = pickWord(pickCount());
    return String(gt()?.promptText || `Pick ${word}.`)
      .replace(/\bpick three\b/gi, (match) => `${match[0] === "P" ? "Pick" : "pick"} ${word}`)
      .replace(/\{location\}/g, state.location ? `the ${state.location.name}` : "this place");
  }

  function renderPrompt() {
    if (!active() || !els.questionPrompt) return;
    els.questionPrompt.textContent = formattedPrompt();
    const cue = document.querySelector(".cue-card");
    if (cue) {
      const canReroll = state.gameMode !== "online" || state.isHost;
      cue.title = canReroll && !gt().locked.some(Boolean) ? "Reroll before anybody locks" : `Shared ${DISPLAY_NAME} prompt`;
    }
  }

  function rerollPrompt() {
    if (!active() || gt().phase !== "selecting" || gt().locked.some(Boolean)) return;
    if (state.gameMode === "online" && !state.isHost) return;
    const pool = promptPool().filter((p) => p.id !== gt().promptId);
    if (!pool.length) return;
    const next = pool.slice().sort((a, b) => stableHash(`${state.gameSalt}:reroll:${a.id}`) - stableHash(`${state.gameSalt}:reroll:${b.id}`))[0];
    gt().promptId = next.id; gt().promptText = next.text;
    const revision = bumpRevision();
    if (state.gameMode === "online") netSend("gt-prompt", { roundIndex: gt().roundIndex, promptId: next.id, revision });
    renderPrompt(); scheduleSave(); sfx("blip");
  }

  function togglePick(id) {
    if (!active() || state.isObserver || gt().phase !== "selecting") return;
    const i = playerIndex();
    if (gt().locked[i] || !state.board.some((c) => c.id === id)) return;
    const picks = gt().picks[i] || (gt().picks[i] = []);
    const at = picks.indexOf(id);
    if (at >= 0) {
      picks.splice(at, 1);
      if (gt().doubleDowns[i] === id) gt().doubleDowns[i] = null;
    }
    else if (picks.length < pickCount()) picks.push(id);
    else { flashToast(`${pickWord(pickCount()).replace(/^./, (c) => c.toUpperCase())} means ${pickWord(pickCount())}. Unpick somebody first.`); sfx("buzzer"); return; }
    sfx(at >= 0 ? "revive" : "blip");
    renderBoard(); renderSelectionTray(); syncActionLabel(); scheduleSave();
  }

  function decorateCard(card, character, opts = {}) {
    if (!active() || state.isObserver || !gt()) return;
    const i = playerIndex();
    const picks = gt().picks[i] || [];
    const order = picks.indexOf(character.id);
    card.classList.toggle("gt-picked", order >= 0);
    card.classList.toggle("gt-ballot-locked", !!gt().locked[i]);
    if (!opts.preserveInteraction) card.disabled = !!gt().locked[i] || gt().phase !== "selecting";
    if (order >= 0) card.insertAdjacentHTML("beforeend", `<span class="gt-pick-number">${order + 1}</span>`);
  }

  function renderSelectionTray() {
    if (!active() || !els.secretCard) return;
    const i = state.isObserver ? 0 : playerIndex();
    const picks = gt()?.picks?.[i] || [];
    const locked = !!gt()?.locked?.[i];
    const doubled = gt()?.doubleDowns?.[i] || null;
    const limit = pickCount();
    const slots = Array.from({ length: limit }, (_, n) => {
      const ch = characterById(picks[n]);
      if (!ch) return `<span class="gt-tray-face is-empty"><i>?</i></span>`;
      if (!doubleDownEnabled()) return `<span class="gt-tray-face"><img src="${ch.image}" alt=""><b>${escapeHtml(ch.name)}</b></span>`;
      return `<button type="button" class="gt-tray-face gt-double-choice${doubled === ch.id ? " is-doubled" : ""}" data-double-id="${escapeHtml(ch.id)}" aria-pressed="${doubled === ch.id}" ${locked ? "disabled" : ""}><img src="${ch.image}" alt=""><b>${escapeHtml(ch.name)}</b><i>${doubled === ch.id ? "×2" : "DOUBLE?"}</i></button>`;
    }).join("");
    els.secretCard.className = `secret-card gt-selection-tray${locked ? " is-locked" : ""}`;
    els.secretCard.removeAttribute("style");
    els.secretCard.style.setProperty("--gt-picks", limit);
    els.secretCard.innerHTML = `<div class="gt-tray-head"><b>${state.isObserver ? DISPLAY_NAME : "YOUR PICKS"}</b><span>${yoloMode() ? `${state.board.length} still in` : "full deck"}</span></div><div class="gt-tray-slots">${slots}</div><p>${locked ? "LOCKED — waiting for the room" : `${picks.length}/${limit} selected${doubleDownEnabled() ? " · optional ×2" : ""}`}</p>`;
    els.secretCard.querySelectorAll(".gt-double-choice").forEach((button) => button.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleDoubleDown(button.dataset.doubleId);
    }));
  }

  function toggleDoubleDown(id) {
    if (!active() || state.isObserver || !doubleDownEnabled() || gt().phase !== "selecting") return;
    const i = playerIndex();
    if (gt().locked[i] || !gt().picks[i]?.includes(id)) return;
    gt().doubleDowns[i] = gt().doubleDowns[i] === id ? null : id;
    sfx(gt().doubleDowns[i] ? "coin" : "revive");
    renderSelectionTray();
    scheduleSave();
  }

  function renderRoom() {
    if (!active()) return;
    document.title = DISPLAY_NAME;
    const online = state.gameMode === "online";
    document.body.classList.toggle("mode-online", online);
    document.body.classList.add("mode-solo", "ruleset-groupthink");
    document.body.classList.remove("mode-team");
    els.roomCode.innerHTML = `${iconSvg("hash")}<span>${escapeHtml(state.roomCode)}</span>`;
    const saving = gt()?.phase === "saving";
    const locked = saving ? (gt()?.saveLocked || []) : (gt()?.locked || []);
    const skipped = saving ? (gt()?.saveSkipped || []) : (gt()?.skipped || []);
    const chips = (state.roster || []).map((r, i) => {
      const gone = state.gameMode === "online" && seatIsGone(i);
      const canSkip = gone && state.isHost && !locked[i] && ["selecting", "saving"].includes(gt()?.phase);
      const classes = ["gt-roster-chip", locked[i] ? "is-locked" : "", skipped[i] ? "is-skipped" : "", gone ? "is-away" : "", i === playerIndex() && !state.isObserver ? "is-current" : ""].filter(Boolean).join(" ");
      const icon = skipped[i] ? "—" : locked[i] ? "✓" : i + 1;
      return `<span class="${classes}"><i>${icon}</i><span>${escapeHtml(r.name)}</span>${gone ? `<small>OFFLINE</small>` : ""}${canSkip ? `<button type="button" class="gt-skip-seat" data-seat="${i}" aria-label="Continue this round without ${escapeHtml(r.name)}">SKIP ROUND</button>` : ""}</span>`;
    }).join("");
    els.seatRoster.className = "seat-roster gt-roster";
    els.seatRoster.innerHTML = chips;
    els.seatRoster.querySelectorAll(".gt-skip-seat").forEach((button) => button.addEventListener("click", () => skipDisconnectedSeat(Number(button.dataset.seat))));
    els.roomStatus.textContent = `${locked.filter(Boolean).length} of ${locked.length} locked`;
    // Survivor voting lives in a full-screen reveal, so the rail's otherwise-correct skip button is
    // physically behind it. Presence changes rebuild that reveal with an equivalent in-overlay action.
    if (saving && gt()?.lastResult && document.querySelector(".gt-results")) showResults(gt().lastResult);
  }

  function renderStatus() {
    if (!active() || !els.opponentPanel) return;
    const activeCount = Rules.activePlayerCount(gt()?.skipped || [], state.players.length);
    const support = Rules.matchSupport(activeCount);
    const duo = gt()?.variant === "duo-coop";
    const roundLabel = yoloMode()
      ? `ROUND ${(gt()?.roundIndex || 0) + 1} · ${state.board.length} FACES LEFT`
      : `ROUND ${(gt()?.roundIndex || 0) + 1} / ${FULL_DECK_ROUNDS} · FULL DECK`;
    els.opponentPanel.innerHTML = `<div class="gt-status"><b>${roundLabel}</b><span>${duo ? `SYNC ${gt().syncScore}` : `A MATCH NEEDS ${support} PLAYERS`}</span></div>`;
  }

  function syncAction() {
    if (!active() || !els.swapSeatButton) return;
    const i = state.isObserver ? 0 : playerIndex();
    const picks = gt()?.picks?.[i] || [];
    const locked = !!gt()?.locked?.[i];
    const txt = els.swapSeatButton.querySelector(".er-txt");
    const limit = pickCount();
    if (txt) txt.textContent = locked ? "LOCKED" : `LOCK IN ${picks.length}/${limit}`;
    els.swapSeatButton.disabled = state.isObserver || locked || picks.length !== limit || gt()?.phase !== "selecting";
    els.swapSeatButton.classList.remove("is-guess");
    els.swapSeatButton.setAttribute("aria-label", locked ? "Ballot locked" : `Lock in ${picks.length} of ${limit} picks`);
  }

  function lockIn() {
    if (!active() || state.isObserver || gt().phase !== "selecting") return;
    const i = playerIndex();
    const picks = gt().picks[i] || [];
    const doubleDownId = doubleDownEnabled() ? gt().doubleDowns[i] : null;
    if (picks.length !== pickCount() || gt().locked[i]) return;
    if (state.gameMode === "online" && !state.isHost) {
      gt().locked[i] = true;
      netSend("gt-ballot", { for: netHostId(), roundIndex: gt().roundIndex, picks: picks.slice(), doubleDownId });
      render(); scheduleSave(); return;
    }
    acceptBallot(i, picks, doubleDownId);
  }

  function validBallot(i, picks, doubleDownId = null) {
    if (!Number.isInteger(i) || i < 0 || i >= state.players.length || gt().locked[i]) return false;
    if (!Array.isArray(picks) || picks.length !== pickCount() || new Set(picks).size !== pickCount()) return false;
    const board = new Set(state.board.map((c) => c.id));
    return picks.every((id) => board.has(id))
      && (!doubleDownEnabled() || doubleDownId == null || (typeof doubleDownId === "string" && picks.includes(doubleDownId)));
  }

  function acceptBallot(i, picks, doubleDownId = null) {
    if (!validBallot(i, picks, doubleDownId)) return false;
    gt().picks[i] = picks.slice();
    gt().doubleDowns[i] = doubleDownEnabled() && picks.includes(doubleDownId) ? doubleDownId : null;
    gt().locked[i] = true;
    const revision = bumpRevision();
    if (state.gameMode === "online") netSend("gt-progress", { roundIndex: gt().roundIndex, locked: gt().locked.slice(), skipped: gt().skipped.slice(), revision });
    render(); scheduleSave();
    if (gt().locked.every(Boolean)) setTimeout(finalizeRound, 350);
    else if (state.gameMode === "local") showHandoff(gt().locked.findIndex((x) => !x));
    return true;
  }

  // A confirmed-disconnected seat can be skipped by the host for THIS round only. The roster is
  // deliberately preserved so a refresh/reconnect returns the person to their normal seat next
  // round. Skipped players score zero; they never receive the ordinary no-match consolation.
  function skipDisconnectedSeat(i) {
    if (!active() || state.gameMode !== "online" || !state.isHost || !seatIsGone(i)) return false;
    if (gt().phase === "selecting" && !gt().locked[i]) {
      gt().picks[i] = [];
      gt().doubleDowns[i] = null;
      gt().skipped[i] = true;
      gt().locked[i] = true;
      const revision = bumpRevision();
      netSend("gt-progress", { roundIndex: gt().roundIndex, locked: gt().locked.slice(), skipped: gt().skipped.slice(), revision });
      render(); scheduleSave();
      if (gt().locked.every(Boolean)) setTimeout(finalizeRound, 350);
      Lab?.event("disconnect-skip", { seat: i, phase: "selecting", roundIndex: gt().roundIndex });
      return true;
    }
    if (gt().phase === "saving" && !gt().saveLocked[i]) {
      gt().saveVotes[i] = null;
      gt().saveSkipped[i] = true;
      gt().saveLocked[i] = true;
      const revision = bumpRevision();
      netSend("gt-save-progress", { roundIndex: gt().roundIndex, locked: gt().saveLocked.slice(), skipped: gt().saveSkipped.slice(), revision });
      render(); showResults(gt().lastResult); scheduleSave();
      if (gt().saveLocked.every(Boolean)) setTimeout(finalizeSave, 350);
      Lab?.event("disconnect-skip", { seat: i, phase: "saving", roundIndex: gt().roundIndex });
      return true;
    }
    return false;
  }

  function showHandoff(next, onReady) {
    document.querySelector(".gt-handoff")?.remove();
    const app = document.querySelector("#app");
    if (app) app.inert = true;
    const ov = document.createElement("div");
    ov.className = "gt-handoff";
    ov.innerHTML = `<div><p>PASS THE DEVICE TO</p><h2>${escapeHtml(rosterName(next))}</h2><button type="button" class="button primary">I'M ${escapeHtml(rosterName(next).toUpperCase())}</button></div>`;
    document.body.appendChild(ov);
    ov.querySelector("button").addEventListener("click", () => {
      state.currentPlayer = next;
      if (app) app.inert = false;
      ov.remove();
      if (typeof onReady === "function") onReady();
      else render();
    });
  }

  function calculate(picks, skipped = gt()?.skipped || []) {
    return Rules.scoreRound({
      picks,
      skipped,
      doubleDowns: gt()?.doubleDowns || [],
      duo: gt()?.variant === "duo-coop",
      scores: gt()?.scores || [],
      syncScore: gt()?.syncScore || 0,
      doubleDownEnabled: doubleDownEnabled()
    });
  }

  function validResultPayload(result) {
    const count = state.players.length;
    if (!result || !Array.isArray(result.picks) || result.picks.length !== count
      || !Array.isArray(result.matchCounts) || result.matchCounts.length !== count
      || !Array.isArray(result.roundScores) || result.roundScores.length !== count
      || !Array.isArray(result.scores) || result.scores.length !== count) return false;
    const board = new Set(state.board.map((character) => character.id));
    return result.picks.every((list, i) => {
      if (!Array.isArray(list) || list.some((id) => !board.has(id)) || new Set(list).size !== list.length) return false;
      const doubled = result.doubleDowns?.[i];
      if (doubled != null && (!doubleDownEnabled() || typeof doubled !== "string" || !list.includes(doubled))) return false;
      return result.skipped?.[i] ? list.length === 0 : list.length === pickCount();
    });
  }

  function finalizeRound() {
    if (!active() || gt().phase !== "selecting" || !gt().locked.every(Boolean) || (state.gameMode === "online" && !state.isHost)) return;
    const result = calculate(gt().picks);
    const revision = bumpRevision();
    if (state.gameMode === "online") netSend("gt-result", { roundIndex: gt().roundIndex, result, revision });
    applyResult(result);
  }

  function applyResult(result) {
    if (!active() || !result || gt().phase !== "selecting") return;
    gt().picks = clone(result.picks);
    gt().skipped = Array.from({ length: state.players.length }, (_, i) => !!result.skipped?.[i]);
    gt().scores = result.scores.slice();
    gt().roundScores = result.roundScores.slice();
    gt().doubleDowns = Array.from({ length: state.players.length }, (_, i) => doubleDownEnabled() && typeof result.doubleDowns?.[i] === "string" ? result.doubleDowns[i] : null);
    gt().syncScore = result.syncScore || 0;
    gt().lastResult = { ...clone(result), boardBefore: state.board.length };
    if (state.gameMode === "local") state.currentPlayer = 0;
    if (!yoloMode()) {
      gt().phase = "results";
      gt().saveVotes = Array(state.players.length).fill(null);
      gt().saveLocked = Array(state.players.length).fill(false);
      gt().saveSkipped = Array(state.players.length).fill(false);
      gt().history.push({
        roundIndex: gt().roundIndex,
        promptId: gt().promptId,
        promptText: formattedPrompt(),
        effectId: gt().effectId,
        pickCount: gt().pickCount,
        picks: clone(result.picks),
        doubleDowns: gt().doubleDowns.slice(),
        doubleDownHits: Array.from({ length: state.players.length }, (_, i) => !!result.doubleDownHits?.[i]),
        skipped: gt().skipped.slice(),
        matchCounts: result.matchCounts.slice(),
        roundScores: result.roundScores.slice(),
        saveVotes: [],
        savedId: null,
        removedIds: []
      });
      recordLabRound(gt().lastResult, null);
      Lab?.phase("results", { roundIndex: gt().roundIndex, revision: gt().revision });
      render(); showResults(result); scheduleSave();
      return;
    }
    gt().phase = "saving";
    gt().saveVotes = Array(state.players.length).fill(null);
    gt().saveSkipped = gt().skipped.slice();
    gt().saveLocked = gt().saveSkipped.slice();
    Lab?.phase("saving", { roundIndex: gt().roundIndex, revision: gt().revision });
    render(); showResults(result); scheduleSave();
  }

  function saveCandidates(result = gt()?.lastResult) {
    const board = new Set((state.board || []).map((character) => character.id));
    return Object.keys(result?.counts || {}).filter((id) => board.has(id));
  }

  function toggleSave(id) {
    if (!active() || state.isObserver || gt().phase !== "saving") return;
    const i = playerIndex();
    if (gt().saveLocked[i] || !saveCandidates().includes(id)) return;
    gt().saveVotes[i] = gt().saveVotes[i] === id ? null : id;
    sfx(gt().saveVotes[i] ? "blip" : "revive");
    showResults(gt().lastResult);
    scheduleSave();
  }

  function validSaveVote(i, id) {
    return Number.isInteger(i) && i >= 0 && i < state.players.length
      && !gt().saveLocked[i] && typeof id === "string" && saveCandidates().includes(id);
  }

  function lockSave() {
    if (!active() || state.isObserver || gt().phase !== "saving") return;
    const i = playerIndex();
    const id = gt().saveVotes[i];
    if (!validSaveVote(i, id)) return;
    if (state.gameMode === "online" && !state.isHost) {
      gt().saveLocked[i] = true;
      netSend("gt-save-ballot", { for: netHostId(), roundIndex: gt().roundIndex, id });
      showResults(gt().lastResult); scheduleSave(); return;
    }
    acceptSaveVote(i, id);
  }

  function acceptSaveVote(i, id) {
    if (!validSaveVote(i, id)) return false;
    gt().saveVotes[i] = id;
    gt().saveLocked[i] = true;
    const revision = bumpRevision();
    if (state.gameMode === "online") netSend("gt-save-progress", { roundIndex: gt().roundIndex, locked: gt().saveLocked.slice(), skipped: gt().saveSkipped.slice(), revision });
    scheduleSave();
    if (gt().saveLocked.every(Boolean)) {
      showResults(gt().lastResult);
      setTimeout(finalizeSave, 350);
    } else if (state.gameMode === "local") {
      const next = gt().saveLocked.findIndex((locked) => !locked);
      showHandoff(next, () => showResults(gt().lastResult));
    } else {
      showResults(gt().lastResult);
    }
    return true;
  }

  function resolveSaveVotes() {
    return Rules.resolveSave({
      boardIds: state.board.map((character) => character.id),
      picks: gt().lastResult?.picks || gt().picks,
      votes: gt().saveVotes,
      skipped: gt().saveSkipped,
      pickCount: pickCount(),
      savePolicy: productionRules.savePolicy
    });
  }

  function validSaveOutcome(outcome) {
    if (!outcome || !Array.isArray(outcome.votes) || outcome.votes.length !== state.players.length
      || !Array.isArray(outcome.removedIds) || new Set(outcome.removedIds).size !== outcome.removedIds.length) return false;
    const candidates = new Set(saveCandidates());
    if (outcome.savedId != null && (!candidates.has(outcome.savedId) || outcome.removedIds.includes(outcome.savedId))) return false;
    return outcome.removedIds.every((id) => candidates.has(id) || (pickCount() === 1 && !!outcome.savedId && state.board.some((character) => character.id === id)));
  }

  function finalizeSave() {
    if (!active() || gt().phase !== "saving" || !gt().saveLocked.every(Boolean) || (state.gameMode === "online" && !state.isHost)) return;
    const outcome = resolveSaveVotes();
    const revision = bumpRevision();
    if (state.gameMode === "online") netSend("gt-save-result", { roundIndex: gt().roundIndex, outcome, revision });
    applySaveResult(outcome);
  }

  function applySaveResult(outcome) {
    if (!active() || !outcome || gt().phase !== "saving") return;
    gt().removed = [...new Set([...(gt().removed || []), ...(outcome.removedIds || [])])];
    syncSurvivorBoard();
    gt().lastResult = { ...gt().lastResult, saveOutcome: clone(outcome), survivorsLeft: state.board.length };
    gt().phase = "results";
    gt().history.push({
      roundIndex: gt().roundIndex,
      promptId: gt().promptId,
      promptText: formattedPrompt(),
      effectId: gt().effectId,
      pickCount: gt().pickCount,
      picks: clone(gt().lastResult.picks),
      doubleDowns: (gt().lastResult.doubleDowns || []).slice(),
      doubleDownHits: (gt().lastResult.doubleDownHits || []).slice(),
      matchCounts: gt().lastResult.matchCounts.slice(),
      roundScores: gt().lastResult.roundScores.slice(),
      saveVotes: outcome.votes.slice(),
      saveSkipped: Array.from({ length: state.players.length }, (_, i) => !!outcome.skipped?.[i]),
      savedId: outcome.savedId || null,
      removedIds: (outcome.removedIds || []).slice()
    });
    recordLabRound(gt().lastResult, outcome);
    Lab?.phase("results", { roundIndex: gt().roundIndex, revision: gt().revision, boardCount: state.board.length });
    render(); showResults(gt().lastResult); scheduleSave();
  }

  function resultCharacterHtml(result) {
    const base = baseCharacters();
    const saving = gt().phase === "saving";
    const i = state.isObserver ? 0 : playerIndex();
    const selected = gt().saveVotes?.[i] || null;
    const saveDisabled = state.isObserver || !!gt().saveLocked?.[i];
    const outcome = result.saveOutcome || null;
    return Object.entries(result.counts).sort((a, b) => b[1] - a[1] || base.findIndex((c) => c.id === a[0]) - base.findIndex((c) => c.id === b[0])).map(([id, count]) => {
      const ch = characterById(id); if (!ch) return "";
      const voters = result.picks.map((list, i) => list.includes(id) ? rosterName(i) : null).filter(Boolean);
      const matched = count >= result.support;
      const doubledBy = (result.doubleDowns || []).map((value, seat) => value === id ? seat : -1).filter((seat) => seat >= 0);
      const doubledHit = doubledBy.some((seat) => !!result.doubleDownHits?.[seat]);
      const saved = outcome?.savedId === id;
      const cut = !!outcome?.removedIds?.includes(id);
      const classes = ["gt-result-face", matched ? "is-match" : "", doubledBy.length ? "is-doubled" : "", doubledHit ? "is-double-hit" : "", saving ? "gt-save-face" : "", selected === id ? "is-save-picked" : "", saved ? "is-saved" : "", cut ? "is-cut" : ""].filter(Boolean).join(" ");
      const tag = outcome ? (saved ? "SAVED" : cut ? "SAWED OFF" : "STILL IN") : (matched ? `${count} PICKED` : "ALONE");
      const doubleBadge = doubledBy.length ? `<em class="gt-double-badge">${doubledHit ? "×2 HIT" : "×2 MISS"}</em>` : "";
      const body = `<img src="${ch.image}" alt=""><b>${escapeHtml(ch.name)}</b><span>${escapeHtml(voters.join(" · "))}</span>${doubleBadge}<i>${tag}</i>`;
      return saving
        ? `<button type="button" class="${classes}" data-save-id="${escapeHtml(id)}" aria-pressed="${selected === id}" ${saveDisabled ? "disabled" : ""}>${body}</button>`
        : `<div class="${classes}">${body}</div>`;
    }).join("");
  }

  function showResults(result) {
    const firstReveal = !document.querySelector(".gt-results");
    document.querySelector(".gt-results")?.remove();
    const ov = document.createElement("div");
    ov.className = "gt-results";
    const duo = gt().variant === "duo-coop";
    const scoreRows = duo
      ? `<div class="gt-sync-result"><span>ROUND SYNC</span><b>+${result.roundSync}</b><small>${result.skipped?.some(Boolean) ? "PLAYER SKIPPED · NO SCORE" : result.matchCounts[0] === pickCount() ? "SHARED BRAIN CELL" : result.matchCounts[0] === 0 ? "TOTAL OPPOSITES" : `${result.matchCounts[0]} MATCH${result.matchCounts[0] === 1 ? "" : "ES"}`}</small></div>`
      : result.roundScores.map((score, i) => {
        const doubled = result.doubleDowns?.[i];
        const doubleNote = doubled ? (result.doubleDownHits?.[i] ? " · ×2 HIT" : " · ×2 MISSED") : "";
        const note = result.skipped?.[i] ? "SKIPPED · NO POINTS" : result.matchCounts[i] === 0 ? "LONE WOLF" : `${result.matchCounts[i]} MATCH${result.matchCounts[i] === 1 ? "" : "ES"}`;
        return `<div class="gt-score-row"><span>${escapeHtml(rosterName(i))}</span><b>+${score}</b><small>${note}${doubleNote}</small></div>`;
      }).join("");
    const saving = gt().phase === "saving";
    const i = state.isObserver ? 0 : playerIndex();
    const selected = gt().saveVotes?.[i] || null;
    const saveLocked = !!gt().saveLocked?.[i];
    const selectedName = characterById(selected)?.name || "";
    const disconnectedSaveSeats = state.gameMode === "online" && state.isHost
      ? (state.roster || []).map((roster, seat) => ({ roster, seat })).filter(({ seat }) => seatIsGone(seat) && !gt().saveLocked[seat])
      : [];
    const skipControls = disconnectedSaveSeats.length
      ? `<div class="gt-save-skip-row">${disconnectedSaveSeats.map(({ roster, seat }) => `<button type="button" class="button ghost gt-save-skip" data-seat="${seat}">CONTINUE WITHOUT ${escapeHtml(roster.name.toUpperCase())}</button>`).join("")}</div>`
      : "";
    const controls = saving
      ? state.isObserver
        ? `<p class="gt-wait-host">The room is choosing one face to save…</p>`
        : `<div class="gt-save-controls"><p><b>SAVE ONE FROM THE SAW.</b> One clear winner survives. A tie saves nobody.</p><button type="button" class="button primary gt-save-lock" ${selected && !saveLocked ? "" : "disabled"}>${saveLocked ? `SAVE LOCKED · ${gt().saveLocked.filter(Boolean).length}/${gt().saveLocked.length}` : selected ? `SAVE ${escapeHtml(selectedName.toUpperCase())}` : "PICK A SURVIVOR"}</button>${skipControls}</div>`
      : state.gameMode === "local" || state.isHost
        ? `<button type="button" class="button primary gt-next">${sessionCompleteAfterRound() ? "FINAL RESULTS" : "NEXT PROMPT →"}</button>`
        : `<p class="gt-wait-host">Waiting for the host…</p>`;
    const verdict = result.saveOutcome
      ? `<div class="gt-saw-verdict"><b>${result.saveOutcome.savedId ? `${escapeHtml(characterById(result.saveOutcome.savedId)?.name || "One face")} survived the vote.` : "THE ROOM SPLIT. NOBODY WAS SAVED."}</b><span>${result.saveOutcome.removedIds.length} removed · ${state.board.length} still in</span></div>`
      : "";
    ov.innerHTML = `<div class="gt-results-panel"><p class="gt-results-kicker">${DISPLAY_NAME} · ROUND ${gt().roundIndex + 1}</p><h2>${escapeHtml(formattedPrompt())}</h2><div class="gt-result-faces">${resultCharacterHtml(result)}</div><div class="gt-round-scores">${scoreRows}</div>${verdict}${controls}</div>`;
    document.body.appendChild(ov);
    ov.querySelectorAll(".gt-save-face").forEach((button) => button.addEventListener("click", () => toggleSave(button.dataset.saveId)));
    ov.querySelector(".gt-save-lock")?.addEventListener("click", lockSave);
    ov.querySelectorAll(".gt-save-skip").forEach((button) => button.addEventListener("click", () => skipDisconnectedSeat(Number(button.dataset.seat))));
    ov.querySelector(".gt-next")?.addEventListener("click", requestNext);
    if (firstReveal) sfx(result.matchCounts.some((m) => m === pickCount()) ? "win" : "coin");
  }

  function nextConfig(index) {
    const salt = roundSalt(index);
    const old = state.gameSalt; state.gameSalt = salt;
    const prompt = choosePrompt();
    state.gameSalt = old;
    return { roundIndex: index, roundSalt: salt, effectId: null, promptId: prompt?.id || "" };
  }

  function sessionCompleteAfterRound() {
    return Rules.isSessionComplete({ yolo: yoloMode(), boardCount: state.board.length, roundIndex: gt().roundIndex });
  }

  function requestNext() {
    if (!active() || gt().phase !== "results") return;
    if (state.gameMode === "online" && !state.isHost) return;
    if (sessionCompleteAfterRound()) {
      gt().phase = "complete";
      const revision = bumpRevision();
      if (state.gameMode === "online") netSend("gt-finish", { roundIndex: gt().roundIndex, revision });
      showFinale(); scheduleSave(); return;
    }
    const config = nextConfig(gt().roundIndex + 1);
    config.revision = bumpRevision();
    if (state.gameMode === "online") netSend("gt-next", config);
    startRound(config.roundIndex, config);
  }

  // The old host knew every secret ballot; an ordinary guest only knows their own. When that guest
  // takes over, rebuild the aggregate by asking each locked client to privately resubmit its own
  // ballot. Nothing is revealed to the room and unfinished players simply remain unfinished.
  function onHostClaim() {
    if (!active() || state.gameMode !== "online" || !state.isHost) return;
    Lab?.setHost(true);
    Lab?.event("host-change", { roundIndex: gt().roundIndex, phase: gt().phase, revision: gt().revision });
    const i = playerIndex();
    if (gt().phase === "selecting") {
      const ownLocked = !!gt().locked[i];
      const ownPicks = (gt().picks[i] || []).slice();
      const ownDoubleDown = gt().doubleDowns?.[i] || null;
      gt().picks = gt().picks.map((list, seat) => seat === i ? ownPicks : []);
      gt().doubleDowns = gt().doubleDowns.map((id, seat) => seat === i ? ownDoubleDown : null);
      gt().locked = gt().skipped.map(Boolean);
      const revision = bumpRevision();
      netSend("gt-resubmit-request", {
        roundIndex: gt().roundIndex,
        phase: "selecting",
        locked: gt().locked.slice(),
        skipped: gt().skipped.slice(),
        revision
      });
      render(); scheduleSave();
      if (ownLocked && ownPicks.length === pickCount()) acceptBallot(i, ownPicks, ownDoubleDown);
      else if (gt().locked.every(Boolean)) setTimeout(finalizeRound, 350);
      return;
    }
    if (gt().phase === "saving") {
      const ownLocked = !!gt().saveLocked[i];
      const ownVote = gt().saveVotes[i];
      gt().saveVotes = gt().saveVotes.map((id, seat) => seat === i ? ownVote : null);
      gt().saveLocked = gt().saveSkipped.map(Boolean);
      const revision = bumpRevision();
      netSend("gt-resubmit-request", {
        roundIndex: gt().roundIndex,
        phase: "saving",
        locked: gt().saveLocked.slice(),
        skipped: gt().saveSkipped.slice(),
        revision
      });
      render(); showResults(gt().lastResult); scheduleSave();
      if (ownLocked && typeof ownVote === "string") acceptSaveVote(i, ownVote);
      else if (gt().saveLocked.every(Boolean)) setTimeout(finalizeSave, 350);
      return;
    }
    // Results/finale contain no hidden partial aggregate. A revisioned snapshot is the safest and
    // smallest way to make every peer converge on the new host's already-complete state.
    bumpRevision();
    if (typeof buildGameSave === "function") netSend("snapshot", { save: buildGameSave() });
    scheduleSave();
  }

  function strongestPair() {
    let best = null;
    for (let a = 0; a < state.players.length; a += 1) for (let b = a + 1; b < state.players.length; b += 1) {
      const n = gt().history.reduce((sum, h) => sum + h.picks[a].filter((id) => h.picks[b].includes(id)).length, 0);
      if (!best || n > best.n) best = { a, b, n };
    }
    return best;
  }

  function showFinale() {
    document.querySelectorAll(".gt-results, .gt-finale").forEach((el) => el.remove());
    Lab?.phase("complete", { roundIndex: gt().roundIndex, revision: gt().revision, boardCount: state.board.length });
    const ov = document.createElement("div"); ov.className = "gt-finale";
    const duo = gt().variant === "duo-coop";
    const ordered = gt().scores.map((score, i) => ({ i, score })).sort((a, b) => b.score - a.score);
    const pair = strongestPair();
    const maxSync = Math.max(1, gt().history.reduce((sum, round) => sum + (round.pickCount || 3) * 2, 0));
    const syncRatio = gt().syncScore / maxSync;
    const syncGrade = syncRatio >= .9 ? "SEEK MEDICAL HELP" : syncRatio >= .72 ? "TELEPATHIC" : syncRatio >= .48 ? "SHARED BRAIN CELL" : syncRatio >= .24 ? "SAME GROUP CHAT" : "TOTAL STRANGERS";
    const scores = duo
      ? `<div class="gt-final-sync"><span>FINAL SYNC</span><b>${gt().syncScore} / ${maxSync}</b><i>${syncGrade}</i></div>`
      : ordered.map((x, rank) => `<div class="gt-final-row"><i>${rank + 1}</i><span>${escapeHtml(rosterName(x.i))}</span><b>${x.score}</b></div>`).join("");
    const award = pair ? `${rosterName(pair.a)} + ${rosterName(pair.b)} shared ${pair.n} picks` : "The room survived";
    const survivor = state.board[0] || null;
    const survivorHtml = !yoloMode()
      ? `<div class="gt-final-survivor is-empty"><span>THE FULL DECK SURVIVED</span><b>${state.board.length} FACES. ZERO CASUALTIES.</b></div>`
      : survivor
        ? `<div class="gt-final-survivor"><span>THE LAST FACE STANDING</span><img src="${survivor.image}" alt=""><b>${escapeHtml(survivor.name)}</b></div>`
        : `<div class="gt-final-survivor is-empty"><span>THE LAST FACE STANDING</span><b>NOBODY. YOU SAWED OFF EVERYONE.</b></div>`;
    const canRestart = state.gameMode === "local" || state.isHost;
    ov.innerHTML = `<div class="gt-receipt"><p>THE ROOM HAS SPOKEN</p><h1 class="gt-final-logo"><span>WHO?</span><span>DO YOU THINK?</span></h1><small>SESSION RECEIPT · ${gt().history.length} ROUNDS</small>${survivorHtml}<div class="gt-final-scores">${scores}</div><div class="gt-final-award"><span>STRONGEST PSYCHIC CONNECTION</span><b>${escapeHtml(award)}</b></div><div class="gt-final-actions">${canRestart ? `<button type="button" class="button primary gt-again">PLAY AGAIN</button>` : `<span class="gt-wait-host">Waiting for the host…</span>`}<button type="button" class="button gt-menu">MAIN MENU</button></div></div>`;
    document.body.appendChild(ov);
    ov.querySelector(".gt-again")?.addEventListener("click", () => { ov.remove(); state.scoreboard = {}; startSession(); });
    ov.querySelector(".gt-menu").addEventListener("click", () => { clearOwnSave(); ov.remove(); state.groupthink = null; state.ruleset = "whoisit"; document.body.classList.remove("ruleset-groupthink"); showTitleScreen(); });
  }

  function handleNetMessage(msg) {
    if (!msg?.type?.startsWith("gt-")) return false;
    if (!active()) return true;
    if (msg.type === "gt-lab-event") {
      if (state.isHost) Lab?.receive(msg, state.roster || []);
      return true;
    }
    if (msg.type === "gt-ballot") {
      if (!state.isHost || gt().phase !== "selecting" || (msg.for && msg.for !== state.clientId) || msg.roundIndex !== gt().roundIndex) return true;
      const i = state.roster.findIndex((r) => r.clientId === msg.clientId);
      acceptBallot(i, msg.picks, msg.doubleDownId);
    } else if (msg.type === "gt-progress") {
      if (gt().phase === "selecting" && msg.roundIndex === gt().roundIndex && Array.isArray(msg.locked)
        && msg.locked.length >= state.players.length && adoptHostRevision(msg)) {
        gt().locked = msg.locked.slice(0, state.players.length).map(Boolean);
        gt().skipped = Array.from({ length: state.players.length }, (_, i) => !!msg.skipped?.[i]);
        render(); scheduleSave();
      }
    } else if (msg.type === "gt-result") {
      if (gt().phase === "selecting" && msg.roundIndex === gt().roundIndex && validResultPayload(msg.result) && adoptHostRevision(msg)) applyResult(msg.result);
    } else if (msg.type === "gt-save-ballot") {
      if (!state.isHost || gt().phase !== "saving" || (msg.for && msg.for !== state.clientId) || msg.roundIndex !== gt().roundIndex) return true;
      const i = state.roster.findIndex((r) => r.clientId === msg.clientId);
      acceptSaveVote(i, msg.id);
    } else if (msg.type === "gt-save-progress") {
      if (gt().phase === "saving" && msg.roundIndex === gt().roundIndex && Array.isArray(msg.locked)
        && msg.locked.length >= state.players.length && adoptHostRevision(msg)) {
        gt().saveLocked = msg.locked.slice(0, state.players.length).map(Boolean);
        gt().saveSkipped = Array.from({ length: state.players.length }, (_, i) => !!msg.skipped?.[i]);
        showResults(gt().lastResult); scheduleSave();
      }
    } else if (msg.type === "gt-save-result") {
      if (gt().phase === "saving" && msg.roundIndex === gt().roundIndex && validSaveOutcome(msg.outcome) && adoptHostRevision(msg)) applySaveResult(msg.outcome);
    } else if (msg.type === "gt-next") {
      if (gt().phase === "results" && !sessionCompleteAfterRound() && msg.roundIndex === gt().roundIndex + 1 && adoptHostRevision(msg)) startRound(msg.roundIndex, msg);
    } else if (msg.type === "gt-prompt") {
      const p = promptById(msg.promptId);
      if (gt().phase === "selecting" && msg.roundIndex === gt().roundIndex && !gt().locked.some(Boolean) && p && adoptHostRevision(msg)) {
        gt().promptId = p.id; gt().promptText = p.text; renderPrompt(); scheduleSave();
      }
    } else if (msg.type === "gt-resubmit-request") {
      if (msg.roundIndex !== gt().roundIndex || msg.phase !== gt().phase || !Array.isArray(msg.locked)) return true;
      const i = playerIndex();
      const wasLocked = msg.phase === "saving" ? !!gt().saveLocked[i] : !!gt().locked[i];
      const ownPicks = (gt().picks[i] || []).slice();
      const ownDoubleDown = gt().doubleDowns?.[i] || null;
      const ownVote = gt().saveVotes[i];
      if (!adoptHostRevision(msg)) return true;
      if (msg.phase === "selecting") {
        gt().locked = msg.locked.slice(0, state.players.length).map(Boolean);
        gt().skipped = Array.from({ length: state.players.length }, (_, seat) => !!msg.skipped?.[seat]);
        if (wasLocked && ownPicks.length === pickCount()) netSend("gt-ballot", { for: netHostId(), roundIndex: gt().roundIndex, picks: ownPicks, doubleDownId: ownDoubleDown, resubmit: true });
      } else {
        gt().saveLocked = msg.locked.slice(0, state.players.length).map(Boolean);
        gt().saveSkipped = Array.from({ length: state.players.length }, (_, seat) => !!msg.skipped?.[seat]);
        if (wasLocked && typeof ownVote === "string") netSend("gt-save-ballot", { for: netHostId(), roundIndex: gt().roundIndex, id: ownVote, resubmit: true });
      }
      render(); if (gt().phase === "saving") showResults(gt().lastResult); scheduleSave();
    } else if (msg.type === "gt-finish") {
      if (gt().phase === "results" && msg.roundIndex === gt().roundIndex && sessionCompleteAfterRound() && adoptHostRevision(msg)) {
        gt().phase = "complete"; showFinale(); scheduleSave();
      }
    }
    return true;
  }

  window.Groupthink = {
    RULESET,
    active,
    startSession,
    startRound,
    resume,
    serialize,
    renderPrompt,
    rerollPrompt,
    togglePick,
    decorateCard,
    renderSelectionTray,
    renderRoom,
    renderStatus,
    syncAction,
    lockIn,
    toggleDoubleDown,
    toggleSave,
    lockSave,
    calculate,
    pickCountForBoard,
    skipDisconnectedSeat,
    onHostClaim,
    handleNetMessage,
    showFinale
  };
})();
