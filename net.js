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
function notePeer(msg) {
  if (!msg.clientId || msg.clientId === state.clientId) return;
  const name = typeof cleanPlayerName === "function" ? cleanPlayerName(msg.pname) : String(msg.pname || "").trim();
  let p = netPeers.get(msg.clientId);
  if (!p) { p = { name: name || "A friend", lastSeen: 0, gone: false }; netPeers.set(msg.clientId, p); }
  if (name) p.name = name;
  if (p.gone) {
    p.gone = false;
    state.onlinePeer = true;
    addLog(`${p.name} reconnected.`);
    if (typeof flashToast === "function") flashToast(`🟢 ${p.name} is back.`);
    renderRoom(); updateLobby();
  }
  p.lastSeen = Date.now();
}
function peerGone(p, how) {
  if (!p || p.gone) return;
  p.gone = true;
  const line = how === "left" ? `${p.name} left the room.` : `${p.name} disconnected — waiting for them to reconnect…`;
  addLog(line);
  if (typeof flashToast === "function") flashToast(how === "left" ? `👋 ${line}` : `🔌 ${line}`);
  // Roster slot is PRESERVED either way - a refreshed player rejoins the same seat.
  if (![...netPeers.values()].some((x) => !x.gone)) { state.onlinePeer = false; renderRoom(); }
  updateLobby();
}
function startNetHeartbeat() {
  clearInterval(netHeartbeatTimer);
  netHeartbeatTimer = setInterval(() => {
    if (state.gameMode !== "online" || !net) return;
    netSend("ping", { pname: state.pname });
    const now = Date.now();
    netPeers.forEach((p) => { if (!p.gone && p.lastSeen && now - p.lastSeen > 13000) peerGone(p, "dropped"); });
  }, 4000);
}
function setNetStatus(s) {
  state.netStatus = s;
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
  try { net.post({ type, seat: state.mySeat || 0, clientId: state.clientId || "", observe: !!state.isObserver, ...data }); } catch (e) { /* channel closed */ }
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
  if (msg.type === "ping") return;
  if (msg.type === "bye") { peerGone(netPeers.get(msg.clientId), "left"); return; }
  if (msg.type === "sfx") { if (window.Sound && typeof msg.name === "string") window.Sound.play(msg.name); return; }
  if (msg.type === "music") { if (window.Sound) { window.Sound.setTrack(Number(msg.track) || 0); window.Sound.setMusic(!!msg.on); } return; }
  if (msg.type === "settings") {
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;
    state.settings = typeof normalizeGameSettings === "function"
      ? normalizeGameSettings({ ...state.settings, ...(msg.settings || {}) })
      : { ...state.settings, ...(msg.settings || {}) };
    if (els.setupDialog?.open && typeof syncSettingsToForm === "function") syncSettingsToForm();
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
      else if (typeof buildGameSave === "function") netSend("snapshot", { save: buildGameSave() });
      return;
    }
    if (msg.clientId && !state.roster.some((r) => r.clientId === msg.clientId)) {
      // A new client: register them in the next open slot (up to the cap).
      if (state.roster.length < MAX_PLAYERS) {
        const index = state.roster.length;
        state.roster.push({ name: cleanName || `Player ${index + 1}`, clientId: msg.clientId });
        state.playerCount = state.roster.length;
        if (!state.inLobby && typeof addMidGameRosterSeat === "function") addMidGameRosterSeat(index);
        addLog(`${cleanName || "A player"} has arrived.`);
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
      netSend("snapshot", { save });
      if (typeof saveGameState === "function") saveGameState();
    }
    else netSend("sync", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick, roster: rosterForWire(), playerCount: state.playerCount, playMode: state.playMode });
    return;
  }
  if (msg.type === "snapshot") {
    // Host's authoritative game state, addressed to a (re)connecting client. Everyone else ignores.
    if (msg.for && msg.for !== state.clientId) return;
    if (state.isHost) return;                        // the host never adopts a snapshot
    const save = msg.save;
    if (!save || !save.salt) return;
    // Already fully in this round? Don't re-deal under our own feet unless the host's snapshot has
    // a larger roster/seat set (mid-game join) or a play-mode change we have not adopted.
    if (save.salt === state.gameSalt && state.board.length && !state.inLobby) {
      const incomingRoster = Array.isArray(save.roster) ? save.roster.length : 0;
      const incomingSeats = Array.isArray(save.players) ? save.players.length : 0;
      const playModeChanged = save.playMode && save.playMode !== state.playMode;
      if (!playModeChanged && incomingRoster <= (state.roster || []).length && incomingSeats <= (state.players || []).length) return;
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
    if (state.isHost) return;   // host owns the roster; ignore echoes of its own broadcast
    applyRosterFromMsg(msg);
    if (state.inLobby) updateLobby();
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
    state.settings = typeof normalizeGameSettings === "function"
      ? normalizeGameSettings({ ...state.settings, ...(msg.settings || {}) })
      : { ...state.settings, ...(msg.settings || {}) };
    applyRosterFromMsg(msg);
    state.inLobby = false;
    document.querySelector(".lobby-screen")?.remove();
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
    // Habbo room chat: the sender already bobba-ized the text, so every client shows the same words.
    if (state.global.mystery?.id === "habbo" && typeof habboSay === "function" && msg.charId && typeof msg.text === "string") {
      habboSay(msg.charId, String(msg.text).slice(0, 90));
    }
    return;
  }
  if (msg.type === "mode") {
    markPeerOnline();
    if (msg.clientId && msg.clientId === state.clientId) return;   // our own echo (WS relay path)
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
  if (msg.type === "endround") {
    markPeerOnline();
    // Show the reveal with a NEXT ROUND button; whoever clicks it deals + broadcasts "start" (and a
    // remote "start" clears this reveal via newGame). No auto-advance, so everyone gets a breather.
    showRoundReveal(() => newGame());
  }
}
// Strip a character down to what another client (or a save file) needs to rebuild them.
function serializeCharacter(ch) {
  const { image, ...rest } = ch;
  return JSON.parse(JSON.stringify(rest));
}
function netAnnounceBaby(baby) { netSend("baby", { baby: serializeCharacter(baby) }); }
