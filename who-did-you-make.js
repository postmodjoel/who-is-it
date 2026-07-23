// WHO? DID YOU MAKE? — the flesh draft, built on MakeRules.
// Every player holds a secret commission (six body parts from the shared donor board).
// Local play rotates a study/hidden-board memory draft; online play is a simultaneous Live Build.
// Claimed parts leave the shared slab forever and whatever you claim, you wear.
(function installWhoDidYouMake() {
  const RULESET = "whodidyoumake";
  const DISPLAY_NAME = "WHO? DID YOU MAKE?";
  const Make = window.MakeRules;
  const Genetics = window.GeneticsRules;
  if (!Make || !Genetics) throw new Error("make-rules.js must load before who-did-you-make.js");

  const ROUNDS_PER_SESSION = 3;
  const LIVE_FIRST_BONUS = 10;
  const PHASES = ["commission-viewing", "drafting", "reveal", "round-score", "finale"];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const active = () => typeof state !== "undefined" && state.ruleset === RULESET;
  const session = () => state.whodidyoumake;
  const rosterName = (index) => state.roster?.[index]?.name || `Player ${index + 1}`;
  const playerCount = () => Math.max(2, Math.min(6, state.roster?.length || state.playerCount || 2));
  const portraitCache = new Map();

  // Transient UI state (never saved): open donor, pending online claim, private-study cover,
  // and the most recent claim (for feedback).
  let pickerDonorId = null;
  let pendingClaimId = null;
  let studyRevealed = true;
  let justClaimed = null;   // { donorId, part, playerIndex, count } — count pins it to one render

  const online = () => state.gameMode === "online";
  const ownPlayerIndex = () => online() ? Math.max(0, Number(state.myRosterIndex) || 0) : (Make.currentPicker(currentRound()) ?? 0);
  const currentRevision = () => Math.max(0, Number(session()?.revision) || 0);

  const ping = (name) => { if (typeof sfx === "function") try { sfx(name); } catch (error) { /* muted */ } };

  function nodePortrait(node) {
    if (!node || !window.faceGenerator) return "";
    // Key on TRAITS, not phenotype: ride-along extras (glasses, outfits) change the render
    // without touching the phenotype, and stripped/unstripped states must not collide.
    const key = `${node.id || "node"}:${stableHash(JSON.stringify(node.traits || {}))}`;
    if (!portraitCache.has(key)) {
      portraitCache.set(key, window.faceGenerator.renderPortrait(stableHash(key), node.traits || {}));
    }
    return portraitCache.get(key);
  }

  function castCharacters() {
    return typeof generatedCharacters !== "undefined" && Array.isArray(generatedCharacters) ? generatedCharacters : [];
  }

  // A donor's ORIGINAL full look (all parts + extras) for reveal stamps and thumbnails.
  function fullDonor(round, id) {
    const donor = Make.donorById(round, id);
    return donor ? Make.strippedDonor(donor, [], { background: round.background }) : null;
  }

  // The commission is a face and nothing else—no donor sources or recipe hints.
  function commissionMarkup(round, playerIndex) {
    return `<img class="wdym-commission-face" src="${nodePortrait(round.targets[playerIndex])}" alt="Your commission">`;
  }

  // Reveal-only: a letter-sorted strip of source donors (no part information).
  function sourcesStripMarkup(round, donors, label) {
    return `<div class="wdym-sources">
      <b>${label}</b>
      <div>${donors.map((donor) => `<img src="${nodePortrait(fullDonor(round, donor.id))}" alt="" title="${escapeHtml(donor.name)}">`).join("")}</div>
    </div>`;
  }

  // The donors whose parts actually ended up in a player's build (unique, letter-sorted).
  function buildSources(round, playerIndex) {
    const ids = [...new Set(Object.values(Make.claimsOf(round, playerIndex)).filter(Boolean))];
    return ids.map((id) => Make.donorById(round, id)).filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  function currentRound() {
    return session()?.rounds?.[session().roundIndex] || null;
  }

  function donorsById(round) {
    return Object.fromEntries(round.donors.map((donor) => [donor.id, donor]));
  }

  function makeRound(roundIndex) {
    const round = Make.buildDraftRound({
      sessionSeed: session().sessionSeed,
      roundIndex,
      playerCount: playerCount(),
      donorSource: session().donorSource,
      characters: castCharacters()
    });
    round.completedOrder = [];
    return round;
  }

  // ===================== session lifecycle =====================

  function startSession(seedSalt, opts = {}) {
    const sessionSeed = String(seedSalt || `fleshdraft-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    const live = online();
    portraitCache.clear();
    pickerDonorId = null;
    pendingClaimId = null;
    studyRevealed = true;
    state.gameSalt = sessionSeed;
    if (!live) state.gameMode = "local";
    state.playMode = "solo";
    state.inLobby = false;
    if (!live) state.isHost = false;
    if (!live) state.isObserver = false;
    state.currentPlayer = live ? ownPlayerIndex() : 0;
    state.location = null;
    state.global.mystery = null;
    state.board = [];
    state.players = Array.from({ length: playerCount() }, (_, index) => ({
      pname: rosterName(index), secretId: null, eliminated: new Set(), mysteryUsed: false, secretVisible: true
    }));
    state.whodidyoumake = {
      modeVersion: Make.MODE_VERSION,
      format: live ? "live" : "memory",
      revision: 0,
      sessionSeed,
      roundIndex: 0,
      roundCount: ROUNDS_PER_SESSION,
      donorSource: "cast",
      phase: live ? "drafting" : "commission-viewing",
      viewingIndex: 0,
      revealIndex: 0,
      scores: Array(playerCount()).fill(0),
      rounds: []
    };
    session().rounds.push(makeRound(0));
    document.body.classList.remove("ruleset-groupthink");
    document.body.classList.add("ruleset-whodidyoumake");
    if (live) {
      netConnect();
      if (!opts.remote && !opts.announced) {
        netSend("start", { salt: sessionSeed, settings: state.settings, roster: rosterForWire(), playerCount: state.playerCount, playMode: "solo", ruleset: RULESET, first: true });
      }
    }
    render();
    scheduleSave();
  }

  function serialize() {
    return clone(session());
  }

  function looksLikeSession(restored) {
    if (restored?.modeVersion !== Make.MODE_VERSION) return false;
    if (!Array.isArray(restored.rounds) || !restored.rounds.length) return false;
    const round = restored.rounds[Math.min(restored.roundIndex || 0, restored.rounds.length - 1)];
    return Array.isArray(round?.donors) && round.donors.length >= 8 && Array.isArray(round?.claims) && Array.isArray(round?.recipes);
  }

  function resume(saved) {
    const restored = saved?.whodidyoumake;
    if (!looksLikeSession(restored)) {
      startSession();
      return;
    }
    portraitCache.clear();
    pickerDonorId = null;
    pendingClaimId = null;
    const live = (saved.gameMode || state.gameMode) === "online" || restored.format === "live";
    state.gameMode = live ? "online" : "local";
    state.playMode = "solo";
    state.inLobby = false;
    if (!live) state.isHost = false;
    state.isObserver = false;
    state.location = null;
    state.global.mystery = null;
    state.board = [];
    state.whodidyoumake = clone(restored);
    const s = session();
    s.format = live ? "live" : "memory";
    s.revision = Math.max(0, Number(s.revision) || 0);
    const count = playerCount();
    s.roundIndex = Math.min(s.roundIndex || 0, s.rounds.length - 1);
    if (!PHASES.includes(s.phase)) s.phase = "commission-viewing";
    s.donorSource = s.donorSource === "strangers" ? "strangers" : "cast";
    delete s.privacyMode;
    s.rounds.forEach((round) => {
      round.completedOrder = Array.isArray(round.completedOrder) ? round.completedOrder.filter((seat) => Number.isInteger(seat)) : [];
      delete round.peeksLeft;
    });
    while (s.scores.length < count) s.scores.push(0);
    s.viewingIndex = Math.min(s.viewingIndex || 0, count - 1);
    s.revealIndex = Math.min(s.revealIndex || 0, count - 1);
    studyRevealed = live || s.phase !== "commission-viewing";
    state.gameSalt = s.sessionSeed;
    state.players = Array.from({ length: count }, (_, index) => ({
      pname: rosterName(index), secretId: null, eliminated: new Set(), mysteryUsed: false, secretVisible: true
    }));
    document.body.classList.remove("ruleset-groupthink");
    document.body.classList.add("ruleset-whodidyoumake");
    if (live) netConnect();
    render();
  }

  // ===================== phase actions =====================

  // How many bodies tonight? Cycles 1-5, only before anyone has seen a commission.
  function cycleRoundCount() {
    const s = session();
    if (!active() || s.phase !== "commission-viewing" || s.viewingIndex > 0 || s.roundIndex > 0) return;
    s.roundCount = (s.roundCount % 5) + 1;
    ping("tick");
    render();
    scheduleSave();
  }

  // Slab source: the recognisable cast (default) or anonymous synthetic strangers.
  // Swapping re-deals round one, so it is only offered before anyone has peeked.
  function toggleDonorSource() {
    const s = session();
    if (!active() || s.phase !== "commission-viewing" || s.viewingIndex > 0 || s.roundIndex > 0) return;
    s.donorSource = s.donorSource === "cast" ? "strangers" : "cast";
    s.rounds[0] = makeRound(0);
    portraitCache.clear();
    ping("magic");
    render();
    scheduleSave();
  }

  function commissionSeen() {
    if (!active() || online() || session().phase !== "commission-viewing") return;
    const s = session();
    s.phase = "drafting";
    ping("blip");
    render();
    scheduleSave();
  }

  function openClaimBar(donorId) {
    if (!active() || session().phase !== "drafting") return;
    pickerDonorId = pickerDonorId === donorId ? null : donorId;
    if (pickerDonorId) ping("click");
    render();
  }

  function finishDraftIfReady(round) {
    if (!Make.draftComplete(round)) return false;
    round.results = Make.scoreRound(round);
    round.results.finishOrder = (round.completedOrder || []).slice();
    round.results.players.forEach((result) => {
      result.finishRank = round.results.finishOrder.indexOf(result.playerIndex) + 1;
      result.speedBonus = online() && result.finishRank === 1 ? LIVE_FIRST_BONUS : 0;
      result.baseScore = result.score;
      result.score += result.speedBonus;
      session().scores[result.playerIndex] += result.score;
    });
    // Reveal worst build first so the round climbs toward its winner.
    round.revealOrder = round.results.players.slice()
      .sort((a, b) => a.score - b.score || b.finishRank - a.finishRank || a.playerIndex - b.playerIndex)
      .map((result) => result.playerIndex);
    session().phase = "reveal";
    session().revealIndex = 0;
    playRevealSting();
    return true;
  }

  function broadcastState() {
    if (!online() || !state.isHost) return;
    session().revision = currentRevision() + 1;
    netSend("wdym-state", { revision: session().revision, whodidyoumake: serialize() });
  }

  function acceptClaim(playerIndex, donorId, part) {
    const round = currentRound();
    try {
      if (online()) Make.applyLiveClaim(round, playerIndex, donorId, part);
      else Make.applyClaim(round, playerIndex, donorId, part);
    } catch (error) {
      return false;
    }
    const filled = Object.values(Make.claimsOf(round, playerIndex)).filter(Boolean).length;
    if (filled === Make.PART_ORDER.length && !round.completedOrder.includes(playerIndex)) round.completedOrder.push(playerIndex);
    pickerDonorId = null;
    pendingClaimId = null;
    // One uniform sound for every claim: an audible "steal!" sting would leak who wanted what.
    ping("pop");
    justClaimed = { donorId, part, playerIndex, count: round.claims.length };
    const finished = finishDraftIfReady(round);
    if (!finished && !online()) {
      session().phase = "commission-viewing";
      session().viewingIndex = Make.currentPicker(round) ?? 0;
      studyRevealed = false;
    }
    render();
    scheduleSave();
    if (online()) broadcastState();
    return true;
  }

  function claimPart(donorId, part) {
    if (!active() || state.isObserver || session().phase !== "drafting" || pendingClaimId) return;
    const playerIndex = online() ? ownPlayerIndex() : Make.currentPicker(currentRound());
    if (playerIndex === null) return;
    if (online() && !state.isHost) {
      pendingClaimId = `${state.clientId}:${currentRound().roundIndex}:${currentRound().claims.length}:${donorId}:${part}`;
      netSend("wdym-claim-request", {
        for: netHostId(), requestId: pendingClaimId, roundIndex: currentRound().roundIndex, donorId, part
      });
      render();
      return;
    }
    acceptClaim(playerIndex, donorId, part);
  }

  // Which seat is on the reveal stage right now (worst score first, winner last).
  function revealSeat() {
    const s = session();
    const round = currentRound();
    const order = round?.revealOrder || round?.results?.players.map((result) => result.playerIndex) || [];
    return order[Math.min(s.revealIndex, Math.max(0, order.length - 1))] ?? 0;
  }

  // The reveal's little radio play: stamp thud, then a slap for each theft, then fanfare.
  function playRevealSting() {
    const round = currentRound();
    const result = round.results?.players.find((entry) => entry.playerIndex === revealSeat());
    if (!result) return;
    ping("reveal");
    const robbed = round.results.thefts.some((theft) => theft.victim === result.playerIndex);
    if (robbed) setTimeout(() => { if (active() && session()?.phase === "reveal") ping("slap"); }, 700);
    if (result.masterpiece) setTimeout(() => { if (active() && session()?.phase === "reveal") ping("win"); }, 1200);
  }

  function nextReveal() {
    if (!active() || session().phase !== "reveal") return;
    if (online() && !state.isHost) return;
    const s = session();
    if (s.revealIndex + 1 < playerCount()) {
      s.revealIndex += 1;
      playRevealSting();
    } else {
      s.phase = "round-score";
      ping("coin");
    }
    render();
    scheduleSave();
    broadcastState();
  }

  function nextRound() {
    if (!active() || session().phase !== "round-score") return;
    if (online() && !state.isHost) return;
    const s = session();
    if (s.roundIndex + 1 >= s.roundCount) {
      s.phase = "finale";
      ping("win");
      render();
      scheduleSave();
      broadcastState();
      return;
    }
    s.roundIndex += 1;
    s.rounds.push(makeRound(s.roundIndex));
    s.phase = online() ? "drafting" : "commission-viewing";
    s.viewingIndex = online() ? ownPlayerIndex() : (Make.currentPicker(currentRound()) ?? 0);
    studyRevealed = online();
    s.revealIndex = 0;
    portraitCache.clear();
    ping("magic");
    render();
    scheduleSave();
    broadcastState();
  }

  function returnToMenu() {
    clearOwnSave();
    document.querySelector(".wdym-handoff")?.remove();
    document.body.classList.remove("ruleset-whodidyoumake");
    state.whodidyoumake = null;
    state.ruleset = "whoisit";
    showTitleScreen();
  }

  // ===================== markup helpers =====================

  function creatureFor(round, playerIndex) {
    return Make.assembleCreature(Make.claimsOf(round, playerIndex), donorsById(round), {
      id: `wdym-build-${round.roundIndex}-${playerIndex}-${round.claims.length}`,
      name: rosterName(playerIndex),
      background: round.background
    });
  }

  function donorLetter(round, id) {
    return Make.donorById(round, id)?.label || "?";
  }

  function partsTakenFrom(round, donorId) {
    return round.claims.filter((claim) => claim.donorId === donorId).map((claim) => claim.part);
  }

  function strippedPortrait(round, donor, taken) {
    const shown = Make.strippedDonor(donor, taken, { background: round.background });
    // The renderer suppresses these SVG groups entirely. That exposes the existing face
    // surface beneath eyes/nose/mouth instead of covering them with a cosmetic blob.
    shown.traits.hiddenParts = taken.slice();
    return shown;
  }

  function donorCardMarkup(round, donor) {
    const taken = partsTakenFrom(round, donor.id);
    // Always render through the assembler: cast donors get their glasses/outfit extras
    // on the card, and stripping visibly removes the furniture along with the anatomy.
    const shown = strippedPortrait(round, donor, taken);
    const fresh = justClaimed && justClaimed.donorId === donor.id && justClaimed.count === round.claims.length;
    // Clean cards on a big slab: only CLAIMED parts get a ledger chip. Everything else is
    // implicitly available - the claim bar lists the full six when a donor is opened.
    const chips = Make.PART_ORDER.filter((part) => Make.takenBy(round, donor.id, part) !== null).map((part) => {
      const owner = Make.takenBy(round, donor.id, part);
      const justThis = fresh && justClaimed.part === part;
      return `<i class="is-taken ${justThis ? "is-fresh" : ""}">${Make.PART_LABELS[part]} · ${escapeHtml(rosterName(owner).slice(0, 3).toUpperCase())}</i>`;
    }).join("");
    const removedLabel = taken.length
      ? ` Removed: ${taken.map((part) => Make.PART_LABELS[part].toLowerCase()).join(", ")}.`
      : "";
    return `<button type="button" class="wdym-donor ${pickerDonorId === donor.id ? "is-open" : ""} ${taken.length >= Make.PART_ORDER.length ? "is-husk" : ""} ${fresh ? "is-fresh" : ""}"
      data-donor="${escapeHtml(donor.id)}" data-removed-parts="${taken.join(" ")}" aria-label="Face ${escapeHtml(donor.label)} — choose a part.${removedLabel}">
      <span class="wdym-donor-letter">${escapeHtml(donor.label)}</span>
      <span class="wdym-donor-portrait">
        <img src="${nodePortrait(shown)}" alt="Face ${escapeHtml(donor.label)}">
      </span>
      <span class="wdym-donor-name">${escapeHtml(round.donorSource === "cast" ? donor.name : `Face ${donor.label}`)}</span>
      <span class="wdym-donor-chips">${chips}</span>
    </button>`;
  }

  function trayMarkup(round, playerIndex, options = {}) {
    const slots = Make.claimsOf(round, playerIndex);
    const creature = creatureFor(round, playerIndex);
    const fresh = justClaimed && justClaimed.playerIndex === playerIndex && justClaimed.count === round.claims.length;
    return `<div class="wdym-tray ${options.current ? "is-current" : ""} ${fresh ? "is-fresh" : ""}">
      <img src="${nodePortrait(creature)}" alt="${escapeHtml(rosterName(playerIndex))}'s build so far">
      <b>${escapeHtml(rosterName(playerIndex))}</b>
      <div class="wdym-tray-slots">${Make.PART_ORDER.map((part) => {
        const justThis = fresh && justClaimed.part === part;
        return slots[part]
          ? `<i class="${justThis ? "is-fresh" : ""}" title="${Make.PART_LABELS[part]}">${escapeHtml(donorLetter(round, slots[part]))}</i>`
          : `<i class="is-empty" title="${Make.PART_LABELS[part]}">·</i>`;
      }).join("")}</div>
    </div>`;
  }

  function claimBarMarkup(round) {
    const donor = Make.donorById(round, pickerDonorId);
    if (!donor) return "";
    const picker = online() ? ownPlayerIndex() : Make.currentPicker(round);
    const slots = Make.claimsOf(round, picker);
    const shown = strippedPortrait(round, donor, partsTakenFrom(round, donor.id));
    return `<div class="wdym-claim-bar">
      <img src="${nodePortrait(shown)}" alt="">
      <div>
        <b>FACE ${escapeHtml(donor.label)}${round.donorSource === "cast" ? ` · ${escapeHtml(donor.name.toUpperCase())}` : ""}</b>
        <div class="wdym-claim-parts">${Make.PART_ORDER.map((part) => {
          const owner = Make.takenBy(round, donor.id, part);
          const slotFull = !!slots[part];
          const disabled = owner !== null || slotFull || !!pendingClaimId || state.isObserver;
          const note = owner !== null ? `gone · ${escapeHtml(rosterName(owner).slice(0, 3))}` : slotFull ? "slot full" : "";
          return `<button type="button" class="wdym-claim-part" data-part="${part}" ${disabled ? "disabled" : ""}>
            ${Make.PART_LABELS[part]}${note ? `<small>${note}</small>` : ""}
          </button>`;
        }).join("")}</div>
      </div>
    </div>`;
  }

  // ===================== phase screens =====================

  function viewingMarkup() {
    const s = session();
    const round = currentRound();
    const playerIndex = s.viewingIndex;
    const target = round.targets[playerIndex];
    const build = creatureFor(round, playerIndex);
    const filled = Object.values(Make.claimsOf(round, playerIndex)).filter(Boolean).length;
    if (!studyRevealed) return `<div class="wdym-handoff" role="dialog" aria-modal="true">
      <div class="game-dialog-panel wdym-pass-cover">
        <small>PRIVATE HANDOFF</small>
        <b>PASS TO ${escapeHtml(rosterName(playerIndex).toUpperCase())}</b>
        <p>The next commission is hidden until they take the device.</p>
        <button type="button" class="button primary wdym-study-open">I'M ${escapeHtml(rosterName(playerIndex).toUpperCase())} →</button>
      </div>
    </div>`;
    return `<div class="wdym-handoff" role="dialog" aria-modal="true">
      ${s.roundIndex === 0 && playerIndex === 0 ? `<div class="wdym-cold-open" aria-hidden="true">
        <p>TONIGHT</p>
        <b>${round.donors.length} FACES · ${s.roundCount} TO BUILD</b>
        <span>six parts each · you wear what you take</span>
      </div>` : ""}
      <div class="game-dialog-panel">
        <small>ROUND ${s.roundIndex + 1} · PRIVATE STUDY · ${filled}/6 PARTS</small>
        <b>${escapeHtml(rosterName(playerIndex))}</b>
        <p>Study the commission and what you have built. On the board, <b>both disappear</b>.</p>
        <div class="wdym-study-pair">
          <figure>${commissionMarkup(round, playerIndex)}<figcaption>COMMISSION</figcaption></figure>
          <figure><img src="${nodePortrait(build)}" alt="Your build so far"><figcaption>YOUR BUILD</figcaption></figure>
        </div>
        <button type="button" class="button primary wdym-seen">READY →</button>
        ${round.claims.length === 0 && playerIndex === 0 && s.roundIndex === 0 ? `<button type="button" class="button ghost wdym-bodies">TO BUILD: ${s.roundCount}</button>
        <button type="button" class="button ghost wdym-donors">FACES: ${round.donorSource === "cast" ? "THE CAST" : "STRANGERS"}</button>` : ""}
      </div>
    </div>`;
  }

  function liveReferenceMarkup(round, playerIndex) {
    if (state.isObserver) return "";
    const target = round.targets[playerIndex];
    const build = creatureFor(round, playerIndex);
    const filled = Object.values(Make.claimsOf(round, playerIndex)).filter(Boolean).length;
    return `<section class="wdym-live-reference" aria-label="Your live build">
      <figure><img src="${nodePortrait(target)}" alt="Your commission"><figcaption>YOUR COMMISSION</figcaption></figure>
      <span aria-hidden="true">→</span>
      <figure><img src="${nodePortrait(build)}" alt="Your build so far"><figcaption>YOUR BUILD · ${filled}/6</figcaption></figure>
    </section>`;
  }

  function liveProgressMarkup(round) {
    return `<div class="wdym-live-progress">${state.roster.map((player, index) => {
      const filled = Object.values(Make.claimsOf(round, index)).filter(Boolean).length;
      const rank = (round.completedOrder || []).indexOf(index);
      return `<span class="${index === ownPlayerIndex() && !state.isObserver ? "is-you" : ""} ${rank >= 0 ? "is-complete" : ""}">
        <b>${escapeHtml(player.name)}</b><i>${rank >= 0 ? (rank === 0 ? "FIRST BUILT" : `FINISHED #${rank + 1}`) : `${filled}/6`}</i>
      </span>`;
    }).join("")}</div>`;
  }

  function draftingMarkup() {
    const s = session();
    const round = currentRound();
    const picker = online() ? ownPlayerIndex() : Make.currentPicker(round);
    const pickNumber = round.claims.length + 1;
    const upNext = online() ? [] : round.turnOrder.slice(round.claims.length + 1, round.claims.length + 4).map((seat) => rosterName(seat));
    return `<div class="wdym-draft">
      <header class="wdym-screen-head">
        <span>${online() ? `LIVE BUILD · ${round.claims.length} CLAIMS LOCKED` : `MEMORY DRAFT · PICK ${pickNumber} OF ${round.turnOrder.length}`}</span>
        <h2>${online() ? "BUILD YOUR COMMISSION" : `${escapeHtml(rosterName(picker).toUpperCase())} IS CHOOSING`}</h2>
        <p>${online() ? "Everyone is picking now. First tap accepted gets the part." : "One pick. No target, no build, no peeking."}</p>
        ${upNext.length ? `<div class="wdym-up-next"><b>THEN</b>${upNext.map((name) => `<span>${escapeHtml(name)}</span>`).join("<i>→</i>")}</div>` : ""}
      </header>
      ${online() ? liveReferenceMarkup(round, picker) : ""}
      ${online() ? liveProgressMarkup(round) : ""}
      ${pendingClaimId ? `<p class="wdym-claim-pending" role="status">LOCKING YOUR PICK…</p>` : ""}
      <div class="wdym-panel wdym-donor-board">${round.donors.map((donor) => donorCardMarkup(round, donor)).join("")}</div>
      ${claimBarMarkup(round)}
    </div>`;
  }

  function matchFactorsMarkup(part, worn, wanted) {
    if (part.exact) return `<div class="wdym-match-factors"><span class="wdym-match-factor is-exact">EXACT MATCH</span></div>`;
    const factors = Array.isArray(part.factors) && part.factors.length
      ? part.factors
      : Make.partSimilarityBreakdown(worn, wanted, part.part).factors;
    return `<div class="wdym-match-factors" aria-label="Why this part is ${Math.round(part.similarity * 100)} percent similar">
      ${factors.map((factor) => `<span class="wdym-match-factor is-${factor.signal.length === 3 ? "near" : factor.signal.length === 2 ? "close" : factor.signal === "+" ? "some" : "far"}"
        title="${escapeHtml(factor.label)}: ${Math.round(factor.similarity * 100)}% similar">
        <b>${escapeHtml(factor.label)}</b><i aria-label="${Math.round(factor.similarity * 100)} percent similar">${factor.signal}</i>
      </span>`).join("")}
    </div>`;
  }

  function revealMarkup() {
    const s = session();
    const round = currentRound();
    const playerIndex = revealSeat();
    const result = round.results.players.find((entry) => entry.playerIndex === playerIndex);
    const creature = creatureFor(round, playerIndex);
    const target = round.targets[playerIndex];
    const theftsAgainst = round.results.thefts.filter((theft) => theft.victim === playerIndex);
    const theftsBy = round.results.thefts.filter((theft) => theft.thief === playerIndex);
    let step = 0;
    const delay = () => `style="--wdym-step:${step += 1}"`;
    return `<div class="wdym-reveal">
      <header class="wdym-screen-head">
        <span>ROUND ${s.roundIndex + 1} · REVEAL ${s.revealIndex + 1} OF ${playerCount()}</span>
        <h2>WHO? DID ${escapeHtml(rosterName(playerIndex).toUpperCase())} MAKE?</h2>
      </header>
      <div class="wdym-panel wdym-reveal-panel">
        <div class="wdym-reveal-pair">
          <div class="wdym-reveal-side" ${delay()}>
            <div class="wdym-reveal-person"><img src="${nodePortrait(creature)}" alt="${escapeHtml(rosterName(playerIndex))}'s completed build"><b>THE BUILD</b></div>
            ${sourcesStripMarkup(round, buildSources(round, playerIndex), "BUILT FROM")}
          </div>
          <span class="wdym-reveal-vs" ${delay()}>VS</span>
          <div class="wdym-reveal-side" ${delay()}>
            <div class="wdym-reveal-person"><img src="${nodePortrait(target)}" alt="${escapeHtml(rosterName(playerIndex))}'s commission"><b>THE COMMISSION</b></div>
            ${sourcesStripMarkup(round, Make.commissionDonors(round, playerIndex), "MADE FROM")}
          </div>
        </div>
        <div class="wdym-match-key" ${delay()} aria-label="Match signal and substitution scoring guide">
          <span><b>+++</b> NEAR</span><span><b>++</b> CLOSE</span><span><b>+</b> SOME</span><span><b>—</b> FAR</span>
          <small>EXACT PART +15 · SUBSTITUTIONS SCORE ABOVE 40% · CAPPED AT +12</small>
        </div>
        <div class="wdym-part-stamps" role="list" aria-label="Part score breakdown">${result.parts.map((part) => {
          const theft = theftsAgainst.find((entry) => entry.part === part.part);
          const worn = fullDonor(round, part.claimedId);
          const wanted = fullDonor(round, part.wantedId);
          return `<article class="wdym-stamp ${part.exact ? "is-exact" : theft ? "is-stolen" : "is-sub"}" role="listitem" ${delay()}>
            <div class="wdym-stamp-heading">
              <b>${part.label}</b>
              <span>${part.exact
                ? `FACE ${escapeHtml(donorLetter(round, part.claimedId))} · EXACT`
                : `WANTED ${escapeHtml(donorLetter(round, part.wantedId))} · WEARS ${escapeHtml(donorLetter(round, part.claimedId))}`}</span>
            </div>
            <span class="wdym-stamp-faces">
              <img class="is-wanted" src="${nodePortrait(wanted)}" alt="wanted donor">
              <em aria-hidden="true">${part.exact ? "=" : "→"}</em>
              <img src="${nodePortrait(worn)}" alt="worn donor">
            </span>
            ${matchFactorsMarkup(part, worn, wanted)}
            <span class="wdym-match-percent">${part.exact ? "100" : Math.round(part.similarity * 100)}%</span>
            <strong aria-label="${part.points} points">+${part.points}</strong>
            ${theft ? `<small>STOLEN by ${escapeHtml(rosterName(theft.thief))}${theft.contested ? "" : " · pure spite"}</small>` : ""}
          </article>`;
        }).join("")}</div>
        <footer class="wdym-reveal-total" ${delay()}>
          <span><small>TOTAL FOR</small><b>${escapeHtml(rosterName(playerIndex))}</b></span>
          <div class="wdym-reveal-notes">
            ${result.masterpiece ? `<i class="wdym-masterpiece">MASTERPIECE · +${Make.MASTERPIECE_BONUS}</i>` : ""}
            ${result.speedBonus ? `<i class="wdym-live-bonus">FIRST BUILT · +${result.speedBonus}</i>` : ""}
            ${theftsBy.length ? `<i class="wdym-theft-note">Robbed ${theftsBy.map((theft) =>
              `${escapeHtml(rosterName(theft.victim))} of ${theft.label.toLowerCase()} ${escapeHtml(donorLetter(round, theft.donorId))}`).join(", ")}.</i>` : ""}
          </div>
          <strong><small>POINTS</small>+${result.score}</strong>
        </footer>
      </div>
      <div class="game-action-bar wdym-reveal-actions">
        <button type="button" class="button ghost wdym-replay">▶ SHOW THAT AGAIN</button>
        ${!online() || state.isHost
          ? `<button type="button" class="button primary wdym-next-reveal">${s.revealIndex + 1 < playerCount() ? "NEXT BUILD →" : "ROUND STANDINGS →"}</button>`
          : `<span class="wdym-wait-host">Waiting for the host…</span>`}
      </div>
    </div>`;
  }

  function scoreMarkup() {
    const s = session();
    const round = currentRound();
    const lastRound = s.roundIndex + 1 >= s.roundCount;
    return `<div class="wdym-score">
      <header class="wdym-screen-head">
        <span>ROUND ${s.roundIndex + 1} OF ${s.roundCount}</span>
        <h2>THE TALLY</h2>
      </header>
      <div class="wdym-score-list">${round.results.players.slice().sort((a, b) => b.score - a.score || a.playerIndex - b.playerIndex).map((result) => `<article class="game-card wdym-score-card ${result.masterpiece ? "is-masterpiece" : ""}">
        <span class="wdym-bill-pair">
          <img src="${nodePortrait(creatureFor(round, result.playerIndex))}" alt="build">
          <img class="is-target" src="${nodePortrait(round.targets[result.playerIndex])}" alt="commission">
        </span>
        <b>${escapeHtml(rosterName(result.playerIndex))}</b>
        <strong>+${result.score}</strong>
        <span>${result.exactCount}/6 exact${result.masterpiece ? " · MASTERPIECE" : ""}${result.speedBonus ? ` · FIRST BUILT +${result.speedBonus}` : ""}</span>
      </article>`).join("")}</div>
      <div class="wdym-standings">
        <b>STANDINGS</b>
        ${state.roster.map((player, index) => `<span><b>${escapeHtml(player.name)}</b><strong>${s.scores[index] || 0}</strong></span>`).join("")}
      </div>
      ${!online() || state.isHost
        ? `<button type="button" class="button primary wdym-next-round">${lastRound ? "FINAL SCORES →" : "NEXT COMMISSION →"}</button>`
        : `<span class="wdym-wait-host">Waiting for the host…</span>`}
    </div>`;
  }

  function finaleMarkup() {
    const s = session();
    const ordered = state.roster.map((player, index) => ({ name: player.name, index, score: s.scores[index] || 0 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const finished = s.rounds.filter((round) => round.results);
    return `<div class="wdym-finale">
      <p>THAT'S THE LAST BUILD</p>
      <h2>WHO? DID YOU MAKE?</h2>
      <div class="wdym-final-score">${ordered.map((player, rank) => `<span class="${rank === 0 ? "is-winner" : ""}">
        <small>${rank + 1}</small><b>${escapeHtml(player.name)}</b><strong>${player.score}</strong>
      </span>`).join("")}</div>
      <section class="wdym-gallery">
        <b>TONIGHT'S BUILDS</b>
        ${ordered.map((player) => `<div class="wdym-gallery-row">
          <b>${escapeHtml(player.name)}</b>
          <div>${finished.map((round) => {
            const result = round.results.players.find((entry) => entry.playerIndex === player.index);
            return `<figure>
              <img src="${nodePortrait(creatureFor(round, player.index))}" alt="">
              <figcaption>${result ? `${result.exactCount}/6` : ""}${result?.masterpiece ? " ★" : ""}</figcaption>
            </figure>`;
          }).join("")}</div>
        </div>`).join("")}
      </section>
      <p class="wdym-final-note">${escapeHtml(ordered[0].name)} stitched closest to their commissions. Every face tonight was a stylized invention—no real anatomy, ancestry, race, or ethnicity is depicted or inferred.</p>
      <div class="game-action-bar wdym-final-actions">
        ${!online() || state.isHost ? `<button type="button" class="button primary wdym-again">PLAY AGAIN</button>` : `<span class="wdym-wait-host">Waiting for the host…</span>`}
        <button type="button" class="button wdym-menu">MAIN MENU</button>
      </div>
    </div>`;
  }

  // ===================== chrome =====================

  function sidebarCopy() {
    const s = session();
    const round = currentRound();
    switch (s.phase) {
      case "commission-viewing":
        return { role: "PRIVATE STUDY", name: rosterName(s.viewingIndex), prompt: "Study. Hide. Pick. Pass.", thumb: null };
      case "drafting": {
        const picker = online() ? ownPlayerIndex() : Make.currentPicker(round);
        return online()
          ? { role: "LIVE BUILD", name: state.isObserver ? "WATCHING" : rosterName(picker), prompt: "First accepted pick gets the part.", thumb: null }
          : { role: "NOW CHOOSING", name: rosterName(picker), prompt: "You wear what you take.", thumb: null };
      }
      case "reveal":
        return { role: "THE REVEAL", name: rosterName(revealSeat()), prompt: "Build against commission, part by part.", thumb: currentRound().targets[revealSeat()] };
      case "round-score":
        return { role: "ROUND SCORE", name: `ROUND ${s.roundIndex + 1}`, prompt: "Exact parts pay 15. Lookalikes pay less. Thefts pay in feelings.", thumb: null };
      default:
        return { role: "ALL BUILT", name: "COMPLETE", prompt: "Every commission has been judged.", thumb: null };
    }
  }

  function renderSidebar() {
    const s = session();
    const round = currentRound();
    const copy = sidebarCopy();
    els.roomCode.textContent = online() ? `ROOM #${state.roomCode}` : `ROUND ${Math.min(s.roundIndex + 1, s.roundCount)} / ${s.roundCount}`;
    els.secretCard.className = "secret-card wdym-secret-card";
    els.secretCard.innerHTML = `
      <div class="wdym-side-role">${copy.role}</div>
      ${copy.thumb ? `<img src="${nodePortrait(copy.thumb)}" alt="">` : `<span class="wdym-side-mark">✂</span>`}
      <b>${escapeHtml(copy.name)}</b>
      <small>${s.phase === "drafting" ? (online() ? `${Object.values(Make.claimsOf(round, ownPlayerIndex())).filter(Boolean).length} / 6 built` : `pick ${round.claims.length + 1} / ${round.turnOrder.length}`) : " "}</small>`;
    // Visual mode: the question card is hidden by CSS, and we blank its contents so
    // nothing else (aria-live, a future unhide) can resurrect question furniture here.
    els.questionPrompt.textContent = "";
    els.mysteryResult.textContent = "";
    els.opponentPanel.innerHTML = "";
    const picker = s.phase === "drafting" ? (online() ? ownPlayerIndex() : Make.currentPicker(round)) : null;
    els.seatRoster.innerHTML = state.roster.map((player, index) =>
      `<span class="wdym-roster-chip ${index === picker ? "is-picking" : ""}">
        <b>${escapeHtml(player.name)}</b>${s.phase === "drafting" && (online() || index === picker) ? "<i>✂</i>" : ""}<small>${s.scores[index] || 0}</small>
      </span>`
    ).join("");
    els.roomStatus.textContent = s.phase === "drafting"
      ? (online() ? "Live claims. Your commission is private." : "Board only. No peeking until your next study.")
      : "";
  }

  function renderMain() {
    const s = session();
    els.locationBand.innerHTML = "";
    els.locationBand.className = "location-band is-off";
    document.querySelector("#locationBackdrop")?.style.removeProperty("background-image");
    els.hintShelf.innerHTML = "";
    els.characterBoard.className = "character-board wdym-board";
    let markup = "";
    switch (s.phase) {
      case "drafting": markup = draftingMarkup(); break;
      case "reveal": markup = revealMarkup(); break;
      case "round-score": markup = scoreMarkup(); break;
      case "finale": markup = finaleMarkup(); break;
      default: markup = `<div class="wdym-waiting"><p>WHO? DID YOU MAKE?</p><b>${escapeHtml(rosterName(s.viewingIndex))}</b><span>is reading their commission</span></div>`;
    }
    els.characterBoard.innerHTML = markup;
    document.querySelector(".wdym-handoff")?.remove();
    if (s.phase === "commission-viewing") document.body.insertAdjacentHTML("beforeend", viewingMarkup());
  }

  function bindEvents() {
    document.querySelector(".wdym-study-open")?.addEventListener("click", () => { studyRevealed = true; ping("blip"); render(); });
    document.querySelector(".wdym-seen")?.addEventListener("click", commissionSeen);
    document.querySelector(".wdym-bodies")?.addEventListener("click", cycleRoundCount);
    document.querySelector(".wdym-donors")?.addEventListener("click", toggleDonorSource);
    els.characterBoard.querySelectorAll(".wdym-donor").forEach((button) =>
      button.addEventListener("click", () => openClaimBar(button.dataset.donor)));
    els.characterBoard.querySelectorAll(".wdym-claim-part").forEach((button) =>
      button.addEventListener("click", () => claimPart(pickerDonorId, button.dataset.part)));
    els.characterBoard.querySelector(".wdym-next-reveal")?.addEventListener("click", nextReveal);
    els.characterBoard.querySelector(".wdym-replay")?.addEventListener("click", () => { playRevealSting(); render(); });
    els.characterBoard.querySelector(".wdym-next-round")?.addEventListener("click", nextRound);
    els.characterBoard.querySelector(".wdym-again")?.addEventListener("click", () => startSession());
    els.characterBoard.querySelector(".wdym-menu")?.addEventListener("click", returnToMenu);
  }

  function render() {
    if (!active() || !session()) return;
    document.title = DISPLAY_NAME;
    document.body.classList.add("ruleset-whodidyoumake");
    document.body.classList.remove("ruleset-groupthink", "guess-mode");
    document.body.classList.toggle("observer", !!state.isObserver);
    window.applyRulesetChrome?.(RULESET);
    renderSidebar();
    renderMain();
    bindEvents();
    justClaimed = null;   // feedback animations fire on exactly one render per claim
  }

  function syncAction() {
    if (!active()) return;
    const button = els.swapSeatButton;
    if (button) button.hidden = true;
  }

  function primaryAction() {
    if (!active()) return false;
    const phase = session().phase;
    if (phase === "commission-viewing") commissionSeen();
    else if (phase === "reveal") nextReveal();
    else if (phase === "round-score") nextRound();
    return true;
  }

  function isHostMessage(msg) {
    const hostId = typeof netHostId === "function" ? netHostId() : null;
    return !!hostId && msg?.clientId === hostId;
  }

  function handleNetMessage(msg) {
    if (!msg?.type?.startsWith("wdym-")) return false;
    if (!active()) return true;
    if (msg.type === "wdym-claim-request") {
      if (!state.isHost || session().format !== "live" || session().phase !== "drafting"
        || (msg.for && msg.for !== state.clientId) || msg.roundIndex !== currentRound().roundIndex) return true;
      const playerIndex = state.roster.findIndex((entry) => entry.clientId && entry.clientId === msg.clientId);
      if (playerIndex < 0 || !acceptClaim(playerIndex, msg.donorId, msg.part)) {
        netSend("wdym-claim-rejected", {
          for: msg.clientId, requestId: msg.requestId, revision: currentRevision(), reason: "That part was just taken."
        });
      }
      return true;
    }
    if (msg.type === "wdym-state") {
      if (state.isHost || !isHostMessage(msg) || !looksLikeSession(msg.whodidyoumake)
        || Number(msg.revision) <= currentRevision()) return true;
      state.whodidyoumake = clone(msg.whodidyoumake);
      pendingClaimId = null;
      pickerDonorId = null;
      portraitCache.clear();
      render();
      scheduleSave();
      return true;
    }
    if (msg.type === "wdym-claim-rejected") {
      if (msg.for !== state.clientId || msg.requestId !== pendingClaimId) return true;
      pendingClaimId = null;
      pickerDonorId = null;
      if (typeof flashToast === "function") flashToast(msg.reason || "That part is no longer available.");
      render();
      return true;
    }
    return true;
  }

  function onHostClaim() {
    if (!active() || !online() || !state.isHost) return;
    pendingClaimId = null;
    broadcastState();
    render();
    scheduleSave();
  }

  window.WhoDidYouMake = {
    RULESET,
    DISPLAY_NAME,
    active,
    startSession,
    resume,
    serialize,
    render,
    syncAction,
    primaryAction,
    commissionSeen,
    cycleRoundCount,
    toggleDonorSource,
    openClaimBar,
    claimPart,
    nextReveal,
    nextRound,
    returnToMenu,
    handleNetMessage,
    onHostClaim
  };
})();
