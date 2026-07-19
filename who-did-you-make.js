// WHO? DID YOU MAKE? — the flesh draft, built on MakeRules.
// Every player holds a secret commission (six body parts from the shared donor board).
// Turns rotate snake-style; claimed parts leave the board forever and whatever you claim,
// you wear. Three rounds, highest total wins. Picks are public, commissions are private.
(function installWhoDidYouMake() {
  const RULESET = "whodidyoumake";
  const DISPLAY_NAME = "WHO? DID YOU MAKE?";
  const Make = window.MakeRules;
  const Genetics = window.GeneticsRules;
  if (!Make || !Genetics) throw new Error("make-rules.js must load before who-did-you-make.js");

  const ROUNDS_PER_SESSION = 3;
  const PEEKS_PER_ROUND = 3;   // after the first look, memory is the resource being drafted
  const PHASES = ["commission-viewing", "drafting", "reveal", "round-score", "finale"];

  const clone = (value) => JSON.parse(JSON.stringify(value));
  const active = () => typeof state !== "undefined" && state.ruleset === RULESET;
  const session = () => state.whodidyoumake;
  const rosterName = (index) => state.roster?.[index]?.name || `Player ${index + 1}`;
  const playerCount = () => Math.max(2, Math.min(6, state.roster?.length || state.playerCount || 2));
  const portraitCache = new Map();

  // Transient UI state (never saved): which donor's claim bar is open, whether the
  // commission peek is currently held down, and the most recent claim (for feedback).
  let pickerDonorId = null;
  let peeking = false;
  let justClaimed = null;   // { donorId, part, playerIndex, count } — count pins it to one render

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

  // The commission is a FACE and nothing else — no sources, no hints. You memorise it,
  // you spend your rationed peeks, and you find its donors on the slab by eye.
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
    round.peeksLeft = Object.fromEntries(Array.from({ length: playerCount() }, (_, index) => [index, PEEKS_PER_ROUND]));
    return round;
  }

  // ===================== session lifecycle =====================

  function startSession(seedSalt) {
    const sessionSeed = String(seedSalt || `fleshdraft-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    portraitCache.clear();
    pickerDonorId = null;
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
    state.whodidyoumake = {
      modeVersion: Make.MODE_VERSION,
      sessionSeed,
      roundIndex: 0,
      roundCount: ROUNDS_PER_SESSION,
      donorSource: "cast",
      phase: "commission-viewing",
      viewingIndex: 0,
      revealIndex: 0,
      scores: Array(playerCount()).fill(0),
      rounds: []
    };
    session().rounds.push(makeRound(0));
    document.body.classList.remove("ruleset-groupthink");
    document.body.classList.add("ruleset-whodidyoumake");
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
    state.gameMode = "local";
    state.playMode = "solo";
    state.inLobby = false;
    state.isHost = false;
    state.isObserver = false;
    state.location = null;
    state.global.mystery = null;
    state.board = [];
    state.whodidyoumake = clone(restored);
    const s = session();
    const count = playerCount();
    s.roundIndex = Math.min(s.roundIndex || 0, s.rounds.length - 1);
    if (!PHASES.includes(s.phase)) s.phase = "commission-viewing";
    s.donorSource = s.donorSource === "strangers" ? "strangers" : "cast";
    delete s.privacyMode;   // pre-ration saves: unlimited-peek toggle no longer exists
    s.rounds.forEach((round) => {
      if (!round.peeksLeft) {
        round.peeksLeft = Object.fromEntries(Array.from({ length: count }, (_, index) => [index, PEEKS_PER_ROUND]));
      }
    });
    while (s.scores.length < count) s.scores.push(0);
    s.viewingIndex = Math.min(s.viewingIndex || 0, count - 1);
    s.revealIndex = Math.min(s.revealIndex || 0, count - 1);
    state.gameSalt = s.sessionSeed;
    state.players = Array.from({ length: count }, (_, index) => ({
      pname: rosterName(index), secretId: null, eliminated: new Set(), mysteryUsed: false, secretVisible: true
    }));
    document.body.classList.remove("ruleset-groupthink");
    document.body.classList.add("ruleset-whodidyoumake");
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
    if (!active() || session().phase !== "commission-viewing") return;
    const s = session();
    if (s.viewingIndex + 1 < playerCount()) {
      s.viewingIndex += 1;
    } else {
      s.phase = "drafting";
    }
    peeking = false;
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

  function claimPart(donorId, part) {
    if (!active() || session().phase !== "drafting") return;
    const round = currentRound();
    const picker = Make.currentPicker(round);
    if (picker === null) return;
    try {
      Make.applyClaim(round, picker, donorId, part);
    } catch (error) {
      return;   // illegal tap: slot filled or part gone - the UI disables these anyway
    }
    pickerDonorId = null;
    // One uniform sound for every claim: an audible "steal!" sting would leak who wanted what.
    ping("pop");
    justClaimed = { donorId, part, playerIndex: picker, count: round.claims.length };
    if (Make.draftComplete(round)) {
      round.results = Make.scoreRound(round);
      round.results.players.forEach((result) => { session().scores[result.playerIndex] += result.score; });
      // Reveal worst build first so the round climbs toward its winner.
      round.revealOrder = round.results.players.slice()
        .sort((a, b) => a.score - b.score || a.playerIndex - b.playerIndex)
        .map((result) => result.playerIndex);
      session().phase = "reveal";
      session().revealIndex = 0;
      playRevealSting();
    }
    render();
    scheduleSave();
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
  }

  function nextRound() {
    if (!active() || session().phase !== "round-score") return;
    const s = session();
    if (s.roundIndex + 1 >= s.roundCount) {
      s.phase = "finale";
      ping("win");
      render();
      scheduleSave();
      return;
    }
    s.roundIndex += 1;
    s.rounds.push(makeRound(s.roundIndex));
    s.phase = "commission-viewing";
    s.viewingIndex = 0;
    s.revealIndex = 0;
    portraitCache.clear();
    ping("magic");
    render();
    scheduleSave();
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

  function donorCardMarkup(round, donor) {
    const taken = partsTakenFrom(round, donor.id);
    // Always render through the assembler: cast donors get their glasses/outfit extras
    // on the card, and stripping visibly removes the furniture along with the anatomy.
    const shown = Make.strippedDonor(donor, taken, { background: round.background });
    const fresh = justClaimed && justClaimed.donorId === donor.id && justClaimed.count === round.claims.length;
    // Clean cards on a big slab: only CLAIMED parts get a ledger chip. Everything else is
    // implicitly available - the claim bar lists the full six when a donor is opened.
    const chips = Make.PART_ORDER.filter((part) => Make.takenBy(round, donor.id, part) !== null).map((part) => {
      const owner = Make.takenBy(round, donor.id, part);
      const justThis = fresh && justClaimed.part === part;
      return `<i class="is-taken ${justThis ? "is-fresh" : ""}">${Make.PART_LABELS[part]} · ${escapeHtml(rosterName(owner).slice(0, 3).toUpperCase())}</i>`;
    }).join("");
    return `<button type="button" class="wdym-donor ${pickerDonorId === donor.id ? "is-open" : ""} ${taken.length >= Make.PART_ORDER.length ? "is-husk" : ""} ${fresh ? "is-fresh" : ""}"
      data-donor="${escapeHtml(donor.id)}" aria-label="Donor ${escapeHtml(donor.label)} — choose a part">
      <span class="wdym-donor-letter">${escapeHtml(donor.label)}</span>
      <img src="${nodePortrait(shown)}" alt="Donor ${escapeHtml(donor.label)}">
      <span class="wdym-donor-name">${escapeHtml(round.donorSource === "cast" ? donor.name : `Donor ${donor.label}`)}</span>
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
    const picker = Make.currentPicker(round);
    const slots = Make.claimsOf(round, picker);
    const shown = Make.strippedDonor(donor, partsTakenFrom(round, donor.id), { background: round.background });
    return `<div class="wdym-claim-bar">
      <img src="${nodePortrait(shown)}" alt="">
      <div>
        <b>DONOR ${escapeHtml(donor.label)}${round.donorSource === "cast" ? ` · ${escapeHtml(donor.name.toUpperCase())}` : ""}</b>
        <div class="wdym-claim-parts">${Make.PART_ORDER.map((part) => {
          const owner = Make.takenBy(round, donor.id, part);
          const slotFull = !!slots[part];
          const disabled = owner !== null || slotFull;
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
    return `<div class="wdym-handoff" role="dialog" aria-modal="true">
      ${s.roundIndex === 0 && playerIndex === 0 ? `<div class="wdym-cold-open" aria-hidden="true">
        <p>THE MORGUE OPENS</p>
        <b>${round.donors.length} DONORS · ${s.roundCount} ${s.roundCount === 1 ? "BODY" : "BODIES"}</b>
        <span>six parts each · you wear what you take</span>
      </div>` : ""}
      <div class="game-dialog-panel">
        <small>ROUND ${s.roundIndex + 1} · COMMISSION ${playerIndex + 1} OF ${playerCount()}</small>
        <b>${escapeHtml(rosterName(playerIndex))}</b>
        <p>Memorise the face. <b>${PEEKS_PER_ROUND} peeks</b> later, then memory only.</p>
        <div class="wdym-peek-stage ${peeking ? "is-showing" : ""}">
          ${peeking ? commissionMarkup(round, playerIndex) : "<span>HOLD TO SEE IT</span>"}
        </div>
        <button type="button" class="button wdym-hold">${peeking ? "LOOKING…" : "HOLD TO LOOK"}</button>
        <button type="button" class="button primary wdym-seen">I'VE SEEN IT →</button>
        ${playerIndex === 0 && s.roundIndex === 0 ? `<button type="button" class="button ghost wdym-bodies">BODIES TONIGHT: ${s.roundCount}</button>
        <button type="button" class="button ghost wdym-donors">DONORS: ${round.donorSource === "cast" ? "THE CAST" : "STRANGERS"}</button>` : ""}
      </div>
    </div>`;
  }

  function draftingMarkup() {
    const s = session();
    const round = currentRound();
    const picker = Make.currentPicker(round);
    const pickNumber = round.claims.length + 1;
    const lap = Math.floor(round.claims.length / playerCount()) + 1;
    // The snake order confuses first-timers ("why do I pick twice?") — show the queue.
    const upNext = round.turnOrder.slice(round.claims.length + 1, round.claims.length + 4).map((seat) => rosterName(seat));
    return `<div class="wdym-draft">
      <header class="wdym-screen-head">
        <span>THE FLESH DRAFT · PICK ${pickNumber} OF ${round.turnOrder.length}</span>
        <h2>${escapeHtml(rosterName(picker).toUpperCase())} IS CHOOSING</h2>
        <p>Take a part. You wear it.</p>
        ${upNext.length ? `<div class="wdym-up-next"><b>THEN</b>${upNext.map((name) => `<span>${escapeHtml(name)}</span>`).join("<i>→</i>")}</div>` : ""}
      </header>
      <div class="game-action-bar wdym-draft-actions">
        <button type="button" class="button wdym-peek-hold" ${(round.peeksLeft?.[picker] ?? 0) > 0 ? "" : "disabled"}>
          ${(round.peeksLeft?.[picker] ?? 0) > 0
            ? `✂ ${escapeHtml(rosterName(picker).toUpperCase())} · PEEK — ${round.peeksLeft[picker]} LEFT`
            : `${escapeHtml(rosterName(picker).toUpperCase())} · NO PEEKS LEFT`}
        </button>
      </div>
      <div class="wdym-panel wdym-donor-board">${round.donors.map((donor) => donorCardMarkup(round, donor)).join("")}</div>
      ${claimBarMarkup(round)}
      <div class="wdym-panel wdym-trays-panel">
        <b class="wdym-panel-label">THE BUILDS</b>
        <div class="wdym-trays">${Array.from({ length: playerCount() }, (_, index) =>
          trayMarkup(round, index, { current: index === picker })).join("")}</div>
      </div>
      ${peeking ? `<div class="wdym-peek-overlay">${commissionMarkup(round, picker)}<b>${escapeHtml(rosterName(picker))}'S COMMISSION</b></div>` : ""}
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
        <div class="wdym-reveal-side">
          <div ${delay()}>${sourcesStripMarkup(round, buildSources(round, playerIndex), "BUILT FROM")}</div>
          <div class="wdym-reveal-person" ${delay()}><img src="${nodePortrait(creature)}" alt=""><b>THE BUILD</b></div>
        </div>
        <span ${delay()}>vs</span>
        <div class="wdym-reveal-side">
          <div class="wdym-reveal-person" ${delay()}><img src="${nodePortrait(target)}" alt=""><b>THE COMMISSION</b></div>
          <div ${delay()}>${sourcesStripMarkup(round, Make.commissionDonors(round, playerIndex), "MADE FROM")}</div>
        </div>
      </div>
      <div class="wdym-part-stamps">${result.parts.map((part) => {
        const theft = theftsAgainst.find((entry) => entry.part === part.part);
        const worn = fullDonor(round, part.claimedId);
        const wanted = fullDonor(round, part.wantedId);
        return `<div class="wdym-stamp ${part.exact ? "is-exact" : theft ? "is-stolen" : "is-sub"}" ${delay()}>
          <b>${part.label}</b>
          ${part.exact
            ? `<span class="wdym-stamp-faces"><img src="${nodePortrait(worn)}" alt=""></span>
               <span>Donor ${escapeHtml(donorLetter(round, part.claimedId))} · EXACT</span>`
            : `<span class="wdym-stamp-faces">
                 <img src="${nodePortrait(worn)}" alt="worn"><em>≠</em><img class="is-wanted" src="${nodePortrait(wanted)}" alt="wanted">
               </span>
               <span>wanted ${escapeHtml(donorLetter(round, part.wantedId))} · wears ${escapeHtml(donorLetter(round, part.claimedId))} · ${Math.round(part.similarity * 100)}%</span>`}
          ${theft ? `<small>STOLEN by ${escapeHtml(rosterName(theft.thief))}${theft.contested ? "" : " · pure spite"}</small>` : ""}
          <strong>+${part.points}</strong>
        </div>`;
      }).join("")}</div>
      ${result.masterpiece ? `<p class="wdym-masterpiece" ${delay()}>MASTERPIECE · ALL SIX EXACT · +${Make.MASTERPIECE_BONUS}</p>` : ""}
      ${theftsBy.length ? `<p class="wdym-theft-note" ${delay()}>Also robbed ${theftsBy.map((theft) =>
        `${escapeHtml(rosterName(theft.victim))} of ${theft.label.toLowerCase()} ${escapeHtml(donorLetter(round, theft.donorId))}`).join(", ")}.</p>` : ""}
      <div class="wdym-reveal-total" ${delay()}><b>${escapeHtml(rosterName(playerIndex))}</b><strong>+${result.score}</strong></div>
      </div>
      <div class="game-action-bar wdym-reveal-actions">
        <button type="button" class="button ghost wdym-replay">▶ SHOW THAT AGAIN</button>
        <button type="button" class="button primary wdym-next-reveal">${s.revealIndex + 1 < playerCount() ? "NEXT BUILD →" : "ROUND STANDINGS →"}</button>
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
        <h2>THE BUTCHER'S BILL</h2>
      </header>
      <div class="wdym-score-list">${round.results.players.slice().sort((a, b) => b.score - a.score || a.playerIndex - b.playerIndex).map((result) => `<article class="game-card wdym-score-card ${result.masterpiece ? "is-masterpiece" : ""}">
        <span class="wdym-bill-pair">
          <img src="${nodePortrait(creatureFor(round, result.playerIndex))}" alt="build">
          <img class="is-target" src="${nodePortrait(round.targets[result.playerIndex])}" alt="commission">
        </span>
        <b>${escapeHtml(rosterName(result.playerIndex))}</b>
        <strong>+${result.score}</strong>
        <span>${result.exactCount}/6 exact${result.masterpiece ? " · MASTERPIECE" : ""}</span>
      </article>`).join("")}</div>
      <div class="wdym-standings">
        <b>STANDINGS</b>
        ${state.roster.map((player, index) => `<span><b>${escapeHtml(player.name)}</b><strong>${s.scores[index] || 0}</strong></span>`).join("")}
      </div>
      <button type="button" class="button primary wdym-next-round">${lastRound ? "SEE THE FINAL RECKONING →" : "DEAL THE NEXT BODY BAG →"}</button>
    </div>`;
  }

  function finaleMarkup() {
    const s = session();
    const ordered = state.roster.map((player, index) => ({ name: player.name, index, score: s.scores[index] || 0 }))
      .sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
    const finished = s.rounds.filter((round) => round.results);
    return `<div class="wdym-finale">
      <p>THE FLESH DRAFT IS OVER</p>
      <h2>WHO? DID YOU MAKE?</h2>
      <div class="wdym-final-score">${ordered.map((player, rank) => `<span class="${rank === 0 ? "is-winner" : ""}">
        <small>${rank + 1}</small><b>${escapeHtml(player.name)}</b><strong>${player.score}</strong>
      </span>`).join("")}</div>
      <section class="wdym-gallery">
        <b>TONIGHT'S BODIES OF WORK</b>
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
      <p class="wdym-final-note">${escapeHtml(ordered[0].name)} stitched closest to their commissions. Every donor tonight was a stylized invention—no real anatomy, ancestry, race, or ethnicity is depicted or inferred.</p>
      <div class="game-action-bar wdym-final-actions">
        <button type="button" class="button primary wdym-again">OPEN A NEW MORGUE</button>
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
        return { role: "PRIVATE COMMISSION", name: rosterName(s.viewingIndex), prompt: "Pass it on. No peeking.", thumb: null };
      case "drafting": {
        const picker = Make.currentPicker(round);
        return { role: "NOW CHOOSING", name: rosterName(picker), prompt: "You wear what you take.", thumb: null };
      }
      case "reveal":
        return { role: "THE REVEAL", name: rosterName(revealSeat()), prompt: "Build against commission, part by part.", thumb: currentRound().targets[revealSeat()] };
      case "round-score":
        return { role: "ROUND SCORE", name: `ROUND ${s.roundIndex + 1}`, prompt: "Exact parts pay 15. Lookalikes pay less. Thefts pay in feelings.", thumb: null };
      default:
        return { role: "THE MORGUE CLOSES", name: "COMPLETE", prompt: "Every commission has been judged.", thumb: null };
    }
  }

  function renderSidebar() {
    const s = session();
    const round = currentRound();
    const copy = sidebarCopy();
    els.roomCode.textContent = `ROUND ${Math.min(s.roundIndex + 1, s.roundCount)} / ${s.roundCount}`;
    els.secretCard.className = "secret-card wdym-secret-card";
    els.secretCard.innerHTML = `
      <div class="wdym-side-role">${copy.role}</div>
      ${copy.thumb ? `<img src="${nodePortrait(copy.thumb)}" alt="">` : `<span class="wdym-side-mark">✂</span>`}
      <b>${escapeHtml(copy.name)}</b>
      <small>${s.phase === "drafting" ? `pick ${round.claims.length + 1} / ${round.turnOrder.length}` : " "}</small>`;
    // Visual mode: the question card is hidden by CSS, and we blank its contents so
    // nothing else (aria-live, a future unhide) can resurrect question furniture here.
    els.questionPrompt.textContent = "";
    els.mysteryResult.textContent = "";
    els.opponentPanel.innerHTML = "";
    const picker = s.phase === "drafting" ? Make.currentPicker(round) : null;
    els.seatRoster.innerHTML = state.roster.map((player, index) =>
      `<span class="wdym-roster-chip ${index === picker ? "is-picking" : ""}">
        <b>${escapeHtml(player.name)}</b>${index === picker ? "<i>✂</i>" : ""}<small>${s.scores[index] || 0}</small>
      </span>`
    ).join("");
    els.roomStatus.textContent = s.phase === "drafting" ? "Picks public. Commissions secret." : "";
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

  // Release listeners live on the DOCUMENT: showing the peek re-renders the board, which
  // replaces the held button mid-press - a button-scoped pointerup would die with it and
  // strand the overlay open.
  function bindHold(button, onChange) {
    if (!button) return;
    button.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      onChange(true);
      const stop = () => {
        document.removeEventListener("pointerup", stop);
        document.removeEventListener("pointercancel", stop);
        onChange(false);
      };
      document.addEventListener("pointerup", stop);
      document.addEventListener("pointercancel", stop);
    });
  }

  function bindEvents() {
    const setPeek = (value) => {
      if (peeking === value) return;
      peeking = value;
      render();
    };
    // Draft peeks are a rationed resource: each hold burns one of the picker's charges.
    const setDraftPeek = (value) => {
      if (peeking === value) return;
      const round = currentRound();
      const picker = Make.currentPicker(round);
      if (value) {
        if (picker === null || (round.peeksLeft?.[picker] ?? 0) <= 0) return;
        round.peeksLeft[picker] -= 1;
        ping("magic");
        scheduleSave();
      }
      peeking = value;
      render();
    };
    document.querySelector(".wdym-seen")?.addEventListener("click", () => { peeking = false; commissionSeen(); });
    document.querySelector(".wdym-bodies")?.addEventListener("click", cycleRoundCount);
    document.querySelector(".wdym-donors")?.addEventListener("click", toggleDonorSource);
    bindHold(document.querySelector(".wdym-hold"), setPeek);
    bindHold(els.characterBoard.querySelector(".wdym-peek-hold"), setDraftPeek);
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
    document.body.classList.remove("ruleset-groupthink", "guess-mode", "observer");
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
    returnToMenu
  };
})();
