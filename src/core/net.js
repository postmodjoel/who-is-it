// Online room transport and sync protocol.

// ===================== Online layer (room-synced clients) =====================
// The transport is a BroadcastChannel keyed by room code - two tabs/windows in the same browser ARE
// two online clients (each drives one seat). Because a round is fully derived from its salt, the
// protocol only needs to carry the salt plus live events (eliminations, babies, conversions,
// round-end); a future WebSocket relay can speak this exact protocol.
let net = null;
let netRoom = null;          // the room the current socket is connected to
let netReconnectTimer = null;
// Close the transport when the tab goes away so the relay/channel isn't left holding a dead peer.
// (No "bye" here: a refresh must NOT read as leaving - the heartbeat covers real disappearances.)
window.addEventListener("beforeunload", () => { try { if (net) net.close(); } catch (e) { /* fine */ } });

// ===================== Presence: who's here, who dropped, who left =====================
// Every message stamps its sender's clientId, so presence is just "when did we last hear from
// them". A 4s heartbeat ping keeps quiet players visible; 13s of silence = disconnected (kept in
// the roster - a refresh comes back on the same persistent clientId); an explicit "bye" = left.
const netPeers = new Map();   // clientId -> { name, lastSeen, gone }
let netHeartbeatTimer = null;
function recordGroupthinkPeerEvent(type, clientId, how) {
  if (state.ruleset !== "groupthink" || !state.isHost || !window.GroupthinkLab?.enabled()) return;
  const seat = (state.roster || []).findIndex((entry) => entry.clientId === clientId);
  GroupthinkLab.event(type, {
    seat,
    how: how || null,
    phase: state.groupthink?.phase || null,
    roundIndex: state.groupthink?.roundIndex || 0,
    revision: state.groupthink?.revision || 0
  });
}
function notePeer(msg) {
  if (!msg.clientId || msg.clientId === state.clientId) return;
  const name = typeof cleanPlayerName === "function" ? cleanPlayerName(msg.pname) : String(msg.pname || "").trim();
  let p = netPeers.get(msg.clientId);
  if (!p) { p = { name: name || "A friend", lastSeen: 0, gone: false }; netPeers.set(msg.clientId, p); }
  if (name) p.name = name;
  if (p.gone) {
    p.gone = false;
    recordGroupthinkPeerEvent("reconnect", msg.clientId, "message");
    state.onlinePeer = true;
    addLog(`${p.name} reconnected.`);
    if (typeof flashToast === "function") flashToast(`🟢 ${p.name} is back.`);
    // The returning peer might be the host everyone was about to replace - withdraw the offer.
    if (msg.clientId === netHostId() && typeof resetHostTakeoverOffer === "function") resetHostTakeoverOffer();
    renderRoom(); updateLobby();
  }
  p.lastSeen = Date.now();
}
function peerGone(p, how, clientId) {
  if (!p || p.gone) return;
  p.gone = true;
  recordGroupthinkPeerEvent("disconnect", clientId, how);
  const line = how === "left" ? `${p.name} left the room.` : `${p.name} disconnected — waiting for them to reconnect…`;
  addLog(line);
  if (typeof flashToast === "function") flashToast(how === "left" ? `👋 ${line}` : `🔌 ${line}`);
  // Roster slot is PRESERVED either way - a refreshed player rejoins the same seat.
  if (![...netPeers.values()].some((x) => !x.gone)) state.onlinePeer = false;
  // Groupthink hosts surface a per-round skip control only after presence has positively marked a
  // seat gone. Re-rendering here is harmless for classic WHO? IS IT? and keeps its room status fresh.
  renderRoom();
  updateLobby();
}
function startNetHeartbeat() {
  clearInterval(netHeartbeatTimer);
  netHeartbeatTimer = setInterval(() => {
    if (state.gameMode !== "online" || !net) return;
    netSend("ping", { pname: state.pname });
    const now = Date.now();
    netPeers.forEach((p, clientId) => { if (!p.gone && p.lastSeen && now - p.lastSeen > 13000) peerGone(p, "dropped", clientId); });
    // Host vanished for a while? The next player in join order gets offered the crown (app.js).
    if (typeof maybeOfferHostTakeover === "function") maybeOfferHostTakeover();
    // MISS-02: a guest stuck in a host-less lobby gets a banner + Leave focus instead of waiting forever.
    if (typeof maybeWarnLobbyHostGone === "function") maybeWarnLobbyHostGone();
  }, 4000);
}
// The current room authority: an explicit "hostclaim" winner, else roster slot 0 (the host seat).
function netHostId() {
  return state.hostClaimId || ((state.roster && state.roster[0]) || {}).clientId || null;
}
function netPeerGone(clientId) {
  return !!clientId && !!netPeers.get(clientId)?.gone;
}
// Mid-round connection loss is easy to miss (the roster pill is tiny). After 3s of not-open we put
// up a slim banner so players know their crossings aren't reaching anyone; it clears on reconnect.
let netBannerTimer = null;
function syncNetBanner(s) {
  clearTimeout(netBannerTimer);
  const kill = () => document.querySelector(".net-banner")?.remove();
  if (s === "open" || state.gameMode !== "online") { kill(); return; }
  netBannerTimer = setTimeout(() => {
    if (state.netStatus === "open" || state.gameMode !== "online") return;
    if (!document.querySelector(".net-banner")) {
      const b = document.createElement("div");
      b.className = "net-banner";
      b.setAttribute("role", "status");
      b.setAttribute("aria-live", "polite");
      b.textContent = "Reconnecting…";
      document.body.appendChild(b);
    }
  }, 3000);
}
function setNetStatus(s) {
  const previous = state.netStatus;
  state.netStatus = s;
  if (previous && previous !== s && state.ruleset === "groupthink" && window.GroupthinkLab?.enabled()) {
    GroupthinkLab.event("transport", { status: s, previous, phase: state.groupthink?.phase || null, roundIndex: state.groupthink?.roundIndex || 0 });
  }
  syncNetBanner(s);
  const el = document.querySelector(".or-status");
  if (el && state.gameMode === "online") {
    const text = s === "open"
      ? (state.onlinePeer ? "Friend connected" : "Connected — waiting for a friend")
      : s === "connecting"
        ? "Connecting"
        : "Disconnected — retrying";
    el.classList.toggle("is-connected", s === "open" && !!state.onlinePeer);
    el.classList.toggle("is-waiting", s === "open" && !state.onlinePeer);
    el.classList.toggle("is-connecting", s === "connecting");
    el.classList.toggle("is-disconnected", s !== "open" && s !== "connecting");
    const label = el.querySelector("span:last-child");
    if (label) label.textContent = text;
    else el.textContent = text;
  }
  updateLobby();
}
// Cross-device transport: add ?relay=ws://<host>:8765 to the URL on every device and run
// `python3 relay.py` on one machine - the relay fans messages out per room. Without the param the
// transport is a BroadcastChannel (two tabs in the same browser). Same protocol either way.
// Where the room-sync WebSocket lives. Priority: an explicit ?relay=ws://host param (local dev with
// a separate relay); else, when the page is served over http(s) from a real host (a deployment),
// use the SAME origin - so a deployed single-container build "just works" with no param. On plain
// localhost/file with no param we stay on BroadcastChannel (two tabs = two clients).
const NET_RELAY = (() => {
  try {
    const explicit = new URLSearchParams(location.search).get("relay");
    if (explicit) return explicit.replace(/\/+$/, "");
    const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?)/.test(location.hostname) || location.protocol === "file:";
    if (!isLocal && (location.protocol === "http:" || location.protocol === "https:")) {
      return `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`;
    }
  } catch (e) { /* fall through to BroadcastChannel */ }
  return null;
})();
function netConnect(force) {
  // Already on the right room's socket? Don't tear it down (that would drop the peer mid-game).
  if (!force && net && netRoom === state.roomCode) return;
  clearTimeout(netReconnectTimer);
  try { if (net) net.close(); } catch (e) { /* already closed */ }
  net = null; netRoom = state.roomCode;
  const room = state.roomCode;
  if (NET_RELAY) {
    setNetStatus("connecting");
    let ws;
    try { ws = new WebSocket(`${NET_RELAY}/${room}`); }
    catch (e) { setNetStatus("closed"); scheduleReconnect(room); return; }
    const queue = [];
    ws.onopen = () => { setNetStatus("open"); netSend("hello", { pname: state.pname }); while (queue.length) ws.send(queue.shift()); };
    ws.onmessage = (e) => { try { handleNetMsg(JSON.parse(e.data)); } catch (err) { /* junk frame */ } };
    ws.onerror = () => { /* onclose follows */ };
    ws.onclose = () => { if (netRoom === room && state.gameMode === "online") { setNetStatus("closed"); scheduleReconnect(room); } };
    net = {
      post: (m) => { const s = JSON.stringify(m); if (ws.readyState === 1) ws.send(s); else if (ws.readyState === 0) queue.push(s); },
      close: () => { try { ws.onclose = null; ws.close(); } catch (e) { /* fine */ } }
    };
    startNetHeartbeat();
    return;
  }
  try {
    const bc = new BroadcastChannel(`whoisit-room-${room}`);
    bc.onmessage = (e) => handleNetMsg(e.data || {});
    net = { post: (m) => bc.postMessage(m), close: () => bc.close() };
    setNetStatus("open");
    netSend("hello", { pname: state.pname });
  } catch (e) { net = null; /* no BroadcastChannel - offline only */ }
  startNetHeartbeat();
}
// Reconnect to the SAME room after a drop (the room is stable through a game, so this recovers a
// flaky connection instead of silently going dead).
function scheduleReconnect(room) {
  clearTimeout(netReconnectTimer);
  netReconnectTimer = setTimeout(() => {
    if (state.gameMode === "online" && state.roomCode === room) { netRoom = null; netConnect(true); }
  }, 1500);
}
function netSend(type, data) {
  if (!net) return;
  // `observe` rides every message so the host's hello handler can tell a TV/observer client from a
  // real player and NOT seat it in the roster.
  try { net.post({ type, ...(data || {}), seat: state.mySeat || 0, clientId: state.clientId || "", observe: !!state.isObserver }); } catch (e) { /* channel closed */ }
}
function markPeerOnline() {
  if (!state.onlinePeer) {
    state.onlinePeer = true;
    stopOpponentSim();                       // a REAL opponent replaces the AI sim
    addLog("Another player connected to the room.");
    if (els.roomStatus) els.roomStatus.textContent = "";
    renderRoom();                            // flip the room panel to "friend connected"
  }
}
function handleNetMsg(msg) {
  if (!msg || typeof msg !== "object") return;
  // Presence first: any message from another client proves they're alive (and revives them if we
  // thought they'd dropped).
  if (msg.clientId && msg.clientId !== state.clientId) notePeer(msg);
  if (window.WhoDidYouMake && WhoDidYouMake.handleNetMessage(msg)) return;
  if (window.Groupthink && Groupthink.handleNetMessage(msg)) return;
  if (msg.type === "ping") return;
  if (msg.type === "bye") { peerGone(netPeers.get(msg.clientId), "left", msg.clientId); return; }
  if (msg.type === "sfx") { if (window.Sound && typeof msg.name === "string") window.Sound.play(msg.name); return; }
  if (msg.type === "music") { if (window.Sound) { window.Sound.setTrack(Number(msg.track) || 0); window.Sound.setMusic(!!msg.on); } return; }
  if (msg.type === "settings") {
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;
    // Game settings are HOST-authoritative: ignore a broadcast from anyone who isn't the (possibly
    // claimed - see "hostclaim") host. Device-local prefs (lowPower) never ride the wire either way.
    const hostId = netHostId();
    if (hostId && msg.clientId && msg.clientId !== hostId) return;
    const { lowPower, ...wireSettings } = msg.settings || {};
    state.settings = typeof normalizeGameSettings === "function"
      ? normalizeGameSettings({ ...state.settings, ...wireSettings })
      : { ...state.settings, ...wireSettings };
    if (els.setupDialog?.open && typeof syncSettingsToForm === "function") syncSettingsToForm();
    if (typeof scheduleSave === "function") scheduleSave();
    return;
  }
  if (msg.type === "roomfull") {
    // Host's targeted rejection: the room is at capacity. Offer the couch seat (observer/TV mode).
    if (msg.for && msg.for !== state.clientId) return;
    if (typeof showJoinDeadEnd === "function") showJoinDeadEnd("full");
    return;
  }
  if (msg.type === "hostclaim") {
    // Someone took over hosting (the original host went quiet). Everyone records the new authority;
    // a RETURNING original host demotes itself instead of fighting for the crown.
    markPeerOnline();
    state.hostClaimId = msg.clientId || null;
    if (state.isHost && msg.clientId && msg.clientId !== state.clientId) {
      state.isHost = false;
      if (typeof flashToast === "function") flashToast("👑 Hosting moved on while you were gone.");
    } else if (msg.clientId && msg.clientId !== state.clientId) {
      const nm = (netPeers.get(msg.clientId) || {}).name || "A friend";
      if (typeof flashToast === "function") flashToast(`👑 ${nm} is hosting now.`);
    }
    if (typeof scheduleSave === "function") scheduleSave();
    return;
  }
  if (msg.type === "editchar") {
    // The other player restyled a board character - apply their traits + re-render our copy.
    const c = state.board.find((x) => x.id === msg.id);
    if (c && msg.traits) {
      c.traits = msg.traits; if (msg.name) c.name = msg.name; if (msg.pronouns) c.pronouns = msg.pronouns;
      try { c.image = window.faceGenerator.renderPortrait(msg.seed != null ? msg.seed : c.seed, c.traits); } catch (e) { /* keep old */ }
      if (state.global.mystery) { try { reapplyCurrentMystery(); } catch (err) { /* fine */ } }
      renderBoard(); renderSecret();
      flashToast(`🎨 A friend restyled ${c.name}.`);
    }
    return;
  }
  if (msg.type === "hello") {
    markPeerOnline();
    // Only the host is the roster authority. A guest, on seeing anyone else's hello (the host
    // connecting late, or another guest), re-announces itself once so the host (re)learns it -
    // this covers the guest-connected-before-host race. seenPeers bounds it to one reply per peer.
    if (!state.isHost) {
      if (msg.clientId && msg.clientId !== state.clientId) {
        state.seenPeers = state.seenPeers || new Set();
        if (!state.seenPeers.has(msg.clientId)) { state.seenPeers.add(msg.clientId); netSend("hello", { pname: state.pname }); }
      }
      return;
    }
    const cleanName = typeof cleanPlayerName === "function" ? cleanPlayerName(msg.pname) : String(msg.pname || "").trim();
    // Observers (TV displays) never take a seat: they only receive the broadcast to render the board.
    if (msg.observe) {
      if (state.inLobby) { broadcastLobby(); }
      else if (typeof buildGameSave === "function") netSend("snapshot", { for: msg.clientId, save: buildGameSave() });
      return;
    }
    if (msg.clientId && !state.roster.some((r) => r.clientId === msg.clientId)) {
      // GROUPTHINK shrinks one communal cast across a fixed roster. A late player would have no prior
      // ballots or score/save history, so the match roster closes the moment round one starts.
      if (!state.inLobby && (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake")) {
        netSend("roomfull", { for: msg.clientId });
        return;
      }
      // A new client: register them in the next open slot (up to the cap).
      const roomCap = state.ruleset === "whodidyoumake" ? 6 : MAX_PLAYERS;
      if (state.roster.length < roomCap) {
        const index = state.roster.length;
        state.roster.push({ name: cleanName || `Player ${index + 1}`, clientId: msg.clientId });
        state.playerCount = state.roster.length;
        if (!state.inLobby && typeof addMidGameRosterSeat === "function") addMidGameRosterSeat(index);
        addLog(`${cleanName || "A player"} has arrived.`);
      } else {
        // Room's full: tell THEM (nobody else cares) so their lobby can offer the TV couch seat.
        netSend("roomfull", { for: msg.clientId });
        return;
      }
    } else if (msg.clientId && cleanName) {
      // Known client updating their name.
      const r = state.roster.find((x) => x.clientId === msg.clientId);
      if (r) r.name = cleanName;
    }
    if (state.inLobby) { broadcastLobby(); updateLobby(); }
    // Mid-game hello (a reconnecting refresh OR a fresh joiner): ship the FULL authoritative
    // snapshot - same shape as the on-disk save - so they restore the exact round: board,
    // secrets, eliminations, babies, effect, lore, the lot. (The old salt-only "sync" couldn't
    // bring back crossings.)
    else if (typeof buildGameSave === "function") {
      const save = buildGameSave();
      // A reconnect snapshot is private to the peer that announced itself. Broadcasting it lets a
      // late, rejected joiner race the targeted `roomfull` packet and enter a closed match using the
      // known player's snapshot.
      netSend("snapshot", { for: msg.clientId, save });
      if (typeof saveGameState === "function") saveGameState();
    }
    else netSend("sync", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick, roster: rosterForWire(), playerCount: state.playerCount, playMode: state.playMode, ruleset: state.ruleset });
    return;
  }
  if (msg.type === "snapshot") {
    // Host's authoritative game state, addressed to a (re)connecting client. Everyone else ignores.
    if (typeof joinAcked === "function") joinAcked();   // a host answered: the room is real
    if (msg.for && msg.for !== state.clientId) return;
    if (state.isHost) return;                        // the host never adopts a snapshot
    const save = msg.save;
    if (!save || !save.salt) return;
    // A snapshot can replace an entire live game, so verify its sender against the authority encoded
    // in the snapshot itself (important for a first-time observer whose local roster is still empty).
    const snapshotHostId = save.hostClaimId || save.roster?.[0]?.clientId || netHostId();
    if (snapshotHostId && msg.clientId !== snapshotHostId) return;
    // Already fully in this round? Don't re-deal under our own feet unless the host's snapshot has
    // a larger roster/seat set (mid-game join) or a play-mode change we have not adopted.
    if (save.salt === state.gameSalt && state.board.length && !state.inLobby) {
      const incomingRoster = Array.isArray(save.roster) ? save.roster.length : 0;
      const incomingSeats = Array.isArray(save.players) ? save.players.length : 0;
      const playModeChanged = save.playMode && save.playMode !== state.playMode;
      const incomingGtRevision = save.ruleset === "groupthink" ? Math.max(0, Number(save.groupthink?.revision) || 0) : 0;
      const localGtRevision = state.ruleset === "groupthink" ? Math.max(0, Number(state.groupthink?.revision) || 0) : 0;
      const groupthinkAdvanced = save.ruleset === "groupthink" && incomingGtRevision > localGtRevision;
      if (!playModeChanged && !groupthinkAdvanced && incomingRoster <= (state.roster || []).length && incomingSeats <= (state.players || []).length) return;
    }
    markPeerOnline();
    // Adopt the host's game but keep MY identity: locate myself in the shipped roster.
    const idx = (save.roster || []).findIndex((r) => r.clientId === state.clientId);
    const mySide = idx >= 0 && typeof save.roster[idx].side === "number"
      ? save.roster[idx].side
      : (save.mySeat === 0 ? 1 : 0);                 // classic 2p fallback: the other seat
    state.inLobby = false;
    document.querySelector(".lobby-screen")?.remove();
    resumeGame({
      ...save,
      inLobby: false,
      isHost: false,
      clientId: state.clientId,
      pname: state.pname,
      myRosterIndex: idx >= 0 ? idx : 0,
      mySeat: mySide,
      currentPlayer: mySide
    });
    addLog("Rejoined the room — right where you left off.");
    return;
  }
  if (msg.type === "lobby") {
    markPeerOnline();
    if (typeof joinAcked === "function") joinAcked();   // a host answered: the room is real
    if (state.isHost) return;   // host owns the roster; ignore echoes of its own broadcast
    if (msg.settings) {
      const { lowPower, ...wireSettings } = msg.settings;
      state.settings = typeof normalizeGameSettings === "function"
        ? normalizeGameSettings({ ...state.settings, ...wireSettings })
        : { ...state.settings, ...wireSettings };
    }
    applyRosterFromMsg(msg);
    if (state.inLobby) showLobby();
    return;
  }
  if (msg.type === "sync") {
    markPeerOnline();
    applyRosterFromMsg(msg);
    if (msg.salt && msg.salt !== state.gameSalt) {
      state.settings = typeof normalizeGameSettings === "function"
        ? normalizeGameSettings({ ...state.settings, ...(msg.settings || {}) })
        : { ...state.settings, ...(msg.settings || {}) };
      state.inLobby = false;
      document.querySelector(".lobby-screen")?.remove();
      state.gameSalt = msg.salt;
      syncMySeatFromRoster();                 // clientId → my side (no more seat-collision dance)
      newGame(msg.salt, { remote: true, effectId: msg.effectId });
    }
    return;
  }
  if (msg.type === "start") {
    markPeerOnline();
    if (typeof joinAcked === "function") joinAcked();
    // Echo of the round we're already on (e.g. the loser of a tie-break re-adopting): ignore.
    if (msg.salt && msg.salt === state.gameSalt) return;
    // Crossing NEXT ROUND race: if WE also just dealt (broadcast within the last 2.5s), both clients
    // are holding different salts. Deterministic tie-break: the LOWER clientId's deal wins on both
    // sides. Winner re-broadcasts its start so the loser converges; loser adopts the foreign salt.
    if (state.lastStartSentAt && Date.now() - state.lastStartSentAt < 2500 && msg.clientId) {
      if (String(state.clientId || "") < String(msg.clientId)) {
        netSend("start", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick, roster: rosterForWire(), playerCount: state.playerCount, playMode: state.playMode, ruleset: state.ruleset });
        return;                               // keep OUR deal; the other side adopts it
      }
      state.lastStartSentAt = 0;              // we lost the tie-break: adopt theirs below
    }
    state.settings = typeof normalizeGameSettings === "function"
      ? normalizeGameSettings({ ...state.settings, ...(msg.settings || {}) })
      : { ...state.settings, ...(msg.settings || {}) };
    applyRosterFromMsg(msg);
    state.inLobby = false;
    document.querySelector(".lobby-screen")?.remove();
    // NET2-03: a first-round start (fresh session) resets the no-repeat prompt memory, matching
    // startLocalGame - without this an online tab hosting session after session slowly staled.
    if (msg.first === true) state.seenPrompts = new Set();
    state.gameSalt = msg.salt;
    syncMySeatFromRoster();                    // derive my side from the shared roster + salt
    newGame(msg.salt, { remote: true, effectId: msg.effectId, first: msg.first === true });
    return;
  }
  if (msg.type === "elim") {
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;   // our own echo (WS relay path)
    const side = sideFromMsg(msg);
    const p = state.players[side];
    if (!p) return;
    if (msg.down) p.eliminated.add(msg.id); else p.eliminated.delete(msg.id);
    if (side === (state.mySeat || 0)) {
      // A TEAMMATE crossed a card on MY shared board - reflect it live and persist.
      renderBoard();
      scheduleSave();
    } else {
      // Opponent feed shows CURRENT crossings only: un-crossing removes the entry (no doubling).
      state.opponentLog = (state.opponentLog || []).filter((e) => !(e.seat === side && e.id === msg.id));
      if (msg.down) state.opponentLog.unshift({ seat: side, id: msg.id, t: Date.now() });
      renderOpponentPanel();
    }
    return;
  }
  if (msg.type === "baby") {
    markPeerOnline();
    if (!msg.baby || state.board.some((c) => c.id === msg.baby.id)) return;
    const baby = { ...msg.baby };
    if (baby.traits && window.faceGenerator) { try { baby.image = window.faceGenerator.renderPortrait(baby.seed, baby.traits); } catch (e) { return; } }
    state.board.push(baby);
    // Re-run the mode's apply so the newcomer gets per-baby stats on this client too.
    try { reapplyCurrentMystery(); } catch (e) { /* fine */ }
    addLog(`${baby.name} arrived from the other seat!`);
    renderBoard();
    return;
  }
  if (msg.type === "headsform") {
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;
    state.headsForm = Math.max(0, Math.min(5, Number(msg.form) || 0));
    if (state.global.mystery?.id === "heads-only") renderBoard();
    scheduleSave();
    return;
  }
  if (msg.type === "tug") {
    markPeerOnline();
    const asg = state.global.mystery?.assignments;
    if (asg && asg[msg.loserId]) { asg[msg.loserId] = { ...asg[msg.loserId], party: msg.party, converted: true }; renderBoard(); }
    return;
  }
  if (msg.type === "manor-move") {
    markPeerOnline();
    const mystery = state.global.mystery;
    if (mystery?.id === "knockoff-manor") {
      const room = (mystery.rooms || []).find((r) => r.id === msg.roomId);
      const asg = mystery.assignments[msg.charId];
      if (room && asg) { asg.roomId = room.id; asg.roomName = room.name; renderBoard(); }
    }
    return;
  }
  if (msg.type === "chat") {
    markPeerOnline();
    if (msg.observe) return;   // TV/observer clients are read-only, including Habbo's bespoke chat.
    // Habbo room chat: the sender already bobba-ized the text, so every client shows the same words.
    if (state.global.mystery?.id === "habbo" && typeof habboSay === "function" && msg.charId && typeof msg.text === "string") {
      habboSay(msg.charId, String(msg.text).slice(0, 90));
    }
    return;
  }
  if (msg.type === "mode") {
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;   // our own echo (WS relay path)
    // WHO? DO YOU THINK? deliberately uses the plain shared card board. A stale classic client or a
    // debug packet must not be able to inject a mystery renderer into that ruleset.
    if (state.ruleset === "groupthink") return;
    const eff = MysteryModes.byId(msg.id);
    if (eff) {
      applyMysteryEffect(eff.id);
      state.wheelPick = eff.id;      // survives refresh: the snapshot/save carry this effect id
      playEffectAnnouncement(eff.name);
      showMysteryAnnouncement(eff.name, eff.exampleQuestion);
      drawPrompt();                  // the cue card speaks the new mode's deck immediately
      render();
      scheduleSave();
    }
    return;
  }
  if (msg.type === "guess") {
    // The other side took a (wrong) guess that DIDN'T end the round: keep our guess-counter mirror in
    // sync and flash it. A winning/round-ending guess arrives as "endround" with an outcome instead.
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;
    if (typeof state.guessesLeft === "object" && typeof msg.seat === "number" && !msg.correct) {
      state.guessesLeft[msg.seat] = Math.max(0, (state.guessesLeft[msg.seat] ?? (state.settings.maxGuesses || 3)) - 1);
      if (typeof flashToast === "function") {
        const nm = typeof seatWinnerName === "function" ? seatWinnerName(msg.seat) : "They";
        // FUN2-04: same salt+id-hashed taunt as the guesser's own screen - both ends read one joke.
        const taunt = typeof wrongGuessTaunt === "function" && msg.id ? ` ${wrongGuessTaunt(msg.id)}` : "";
        flashToast(`❌ ${nm} guessed wrong.${taunt} ${state.guessesLeft[msg.seat]} left.`);
      }
    }
    return;
  }
  if (msg.type === "endround") {
    markPeerOnline();
    // Show the reveal with a NEXT ROUND button; whoever clicks it deals + broadcasts "start" (and a
    // remote "start" clears this reveal via newGame). No auto-advance, so everyone gets a breather.
    // A resolved Win & Loss round carries an outcome (winner) so both sides show the same result.
    showRoundReveal(() => newGame(), msg.outcome);
    return;
  }
  if (msg.type === "sessionend") {
    // NET-05: someone printed the receipt - the night is over for the whole room, not just their
    // screen. Everyone gets their OWN session-end (stats/lore are per-device anyway). Observers get
    // it too; `remote` stops the broadcast from echoing around the room forever.
    markPeerOnline();
    // NET2-04: a guest can be mid-guess when the host ends the night - clear the guess banner +
    // body class so no stale guess UI survives under (or after) the receipt.
    if (typeof exitGuessMode === "function") { try { exitGuessMode(); } catch (e) { /* fine */ } }
    document.querySelector(".round-reveal")?.remove();
    if (typeof showSessionEnd === "function" && !document.querySelector(".session-end")) {
      showSessionEnd({ remote: true });
    }
    return;
  }
}
// Strip a character down to what another client (or a save file) needs to rebuild them.
function serializeCharacter(ch) {
  const { image, ...rest } = ch;
  return JSON.parse(JSON.stringify(rest));
}
function netAnnounceBaby(baby) { netSend("baby", { baby: serializeCharacter(baby) }); }
