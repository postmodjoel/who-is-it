// Online room transport and sync protocol.

// ===================== Online layer (room-synced clients) =====================
// The transport is a BroadcastChannel keyed by room code - two tabs/windows in the same browser ARE
// two online clients (each drives one seat). Because a round is fully derived from its salt, the
// protocol only needs to carry the salt plus live events (eliminations, babies, conversions,
// round-end); a future WebSocket relay can speak this exact protocol.
let net = null;
let netRoom = null;          // the room the current socket is connected to
let netReconnectTimer = null;
function setNetStatus(s) { state.netStatus = s; const el = document.querySelector(".or-status"); if (el && state.gameMode === "online") el.textContent = s === "open" ? (state.onlinePeer ? "🟢 friend connected" : "🟡 connected — waiting for a friend…") : s === "connecting" ? "🟠 connecting…" : "🔴 disconnected — retrying…"; updateLobby(); }
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
    return;
  }
  try {
    const bc = new BroadcastChannel(`whoisit-room-${room}`);
    bc.onmessage = (e) => handleNetMsg(e.data || {});
    net = { post: (m) => bc.postMessage(m), close: () => bc.close() };
    setNetStatus("open");
    netSend("hello", { pname: state.pname });
  } catch (e) { net = null; /* no BroadcastChannel - offline only */ }
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
  try { net.post({ type, seat: state.mySeat || 0, ...data }); } catch (e) { /* channel closed */ }
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
  if (msg.type === "sfx") { if (window.Sound && typeof msg.name === "string") window.Sound.play(msg.name); return; }
  if (msg.type === "music") { if (window.Sound) { window.Sound.setTrack(Number(msg.track) || 0); window.Sound.setMusic(!!msg.on); } return; }
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
    const seat = msg.seat === 0 ? 0 : 1;
    if (state.inLobby) {
      // Lobby: record the newcomer's name, announce their arrival, reply once so they learn us too.
      state.lobby = state.lobby || {};
      if (msg.pname && state.lobby[seat] !== msg.pname) { state.lobby[seat] = msg.pname; addLog(`${msg.pname} has arrived.`); }
      updateLobby();
      state.seenPeers = state.seenPeers || new Set();
      if (!state.seenPeers.has(seat)) { state.seenPeers.add(seat); netSend("hello", { pname: state.pname }); }
      return;
    }
    // Mid-game newcomer: sync them into the current round.
    netSend("sync", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick });
    return;
  }
  if (msg.type === "sync") {
    markPeerOnline();
    if (msg.salt && msg.salt !== state.gameSalt) {
      state.settings = { ...state.settings, ...(msg.settings || {}) };
      state.mySeat = msg.seat === 0 ? 1 : 0;   // take the other seat
      newGame(msg.salt, { remote: true, effectId: msg.effectId });
    } else if ((state.mySeat || 0) === (msg.seat || 0)) {
      // Same round (e.g. second tab resumed the same save) but we collided on the seat - the
      // newcomer (that's us: we sent the hello this sync answers) yields to the other one.
      state.mySeat = msg.seat === 0 ? 1 : 0;
      state.currentPlayer = state.mySeat;
      render();
    }
    return;
  }
  if (msg.type === "start") {
    markPeerOnline();
    state.settings = { ...state.settings, ...(msg.settings || {}) };
    if (msg.names) { state.lobby = msg.names; state.pname = msg.names[state.mySeat || 0] || state.pname; }
    state.inLobby = false;
    document.querySelector(".lobby-screen")?.remove();
    newGame(msg.salt, { remote: true, effectId: msg.effectId, first: msg.first === true });
    return;
  }
  if (msg.type === "elim") {
    markPeerOnline();
    const seat = msg.seat === 0 ? 0 : 1;
    if (seat === (state.mySeat || 0)) return;      // our own echo
    const p = state.players[seat];
    if (!p) return;
    if (msg.down) p.eliminated.add(msg.id); else p.eliminated.delete(msg.id);
    // Feed shows CURRENT crossings only: un-crossing removes the entry (no add/remove/add doubling).
    state.opponentLog = (state.opponentLog || []).filter((e) => !(e.seat === seat && e.id === msg.id));
    if (msg.down) state.opponentLog.unshift({ seat, id: msg.id, t: Date.now() });
    renderOpponentPanel();
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
  if (msg.type === "mode") {
    markPeerOnline();
    const eff = MysteryModes.byId(msg.id);
    if (eff) {
      applyMysteryEffect(eff.id);
      playEffectAnnouncement(eff.name);
      showMysteryAnnouncement(eff.name, eff.exampleQuestion);
      render();
      scheduleSave();
    }
    return;
  }
  if (msg.type === "endround") {
    markPeerOnline();
    showRoundReveal();   // the follow-up "start" message deals the new round
  }
}
// Strip a character down to what another client (or a save file) needs to rebuild them.
function serializeCharacter(ch) {
  const { image, ...rest } = ch;
  return JSON.parse(JSON.stringify(rest));
}
function netAnnounceBaby(baby) { netSend("baby", { baby: serializeCharacter(baby) }); }
