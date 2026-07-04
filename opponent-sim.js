// Simulated opponent view for local play.

// ===================== Opponent view (simulated online play) =====================
// Stand-in for the multiplayer backend: a pseudo-AI in the OTHER seat crosses characters off over
// time, and the human seat sees each elimination pop in as a card - exactly what the real online
// feature will show. Both seats also share the same round mode (the Wheel of Fate result).
let opponentTimer = null;
function stopOpponentSim() { if (opponentTimer) { clearInterval(opponentTimer); opponentTimer = null; } }
function startOpponentSim() {
  stopOpponentSim();
  state.opponentLog = [];
  renderOpponentPanel();
  opponentTimer = setInterval(() => {
    const ai = state.players[1];
    if (!ai || !state.board.length) { stopOpponentSim(); return; }
    const cands = state.board.filter((c) => !ai.eliminated.has(c.id) && c.id !== ai.secretId);
    if (cands.length <= 1) { stopOpponentSim(); return; }
    const victim = cands[Math.floor(Math.random() * cands.length)];
    ai.eliminated.add(victim.id);
    (state.opponentLog = state.opponentLog || []).unshift({ seat: 1, id: victim.id, t: Date.now() });
    renderOpponentPanel();
    if (state.currentPlayer === 1) renderBoard();
  }, 2800);
}

function renderOpponentPanel() {
  const el = els.opponentPanel;
  if (!el) return;
  const otherIdx = state.currentPlayer === 0 ? 1 : 0;
  const log = (state.opponentLog || []).filter((e) => e.seat === otherIdx);
  const mode = state.global.mystery;
  const seatLabel = (typeof teamLabel === "function") ? teamLabel(otherIdx) : `Seat ${String.fromCharCode(65 + otherIdx)}`;
  const cards = log.slice(0, 8).map((e, i) => {
    const c = characterById(e.id);
    if (!c) return "";
    return `<div class="opp-card${i === 0 ? " is-new" : ""}"><img src="${c.image}" alt=""><span>${escapeHtml(c.name)}</span></div>`;
  }).join("");
  el.innerHTML = `
    <p class="label">${escapeHtml(seatLabel)} crossing off <span class="opp-live">● live</span></p>
    ${mode ? `<p class="opp-mode">Shared effect: <b>${escapeHtml(mode.name || "—")}</b></p>` : ""}
    <div class="opp-cards">${cards || '<span class="opp-empty">waiting for their first move…</span>'}</div>`;
}
