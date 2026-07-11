// Mystery effect registry and mode-specific rendering/lifecycle hooks.
// Loaded before app.js in the shared browser-global script stack.

// ---- definitions ----
const MYSTERY_EFFECT_DEFINITIONS = [
  {
    id: "prop-panic",
    name: "WHAT'S IN THE HAND?",
    apply: applyPropPanic,
    exampleQuestion: "Would your person's object beat a rock?"
  },
  {
    id: "family-tree-disaster",
    name: "Family Tree Disaster",
    apply: applyFamilyTreeDisaster,
    exampleQuestion: "Is your person someone’s twin?"
  },
  {
    id: "knockoff-manor",
    name: "MURDER! LIVE!",
    apply: applyKnockoffManor,
    exampleQuestion: "Is your person in the BATHS ROOM?"
  },
  {
    id: "emotional-audit",
    name: "Emotional Audit",
    apply: applyEmotionalAudit,
    exampleQuestion: "Is your person dangerously confident?"
  },
  {
    id: "witness-protection-filter",
    name: "Witness Protection Filter",
    apply: applyWitnessProtectionFilter,
    exampleQuestion: "Are your person's eyes redacted with a black bar?"
  },
  {
    id: "role-reveal",
    name: "Role Reveal",
    apply: applyRoleReveal,
    exampleQuestion: "Does your person work with their hands?"
  },
  {
    id: "hidden-agendas",
    name: "Hidden Agendas",
    apply: applyHiddenAgendas,
    exampleQuestion: "Is your person secretly seething behind that smile?"
  },
  {
    id: "monocultural",
    name: "Monocultural",
    apply: applyMonocultural,
    exampleQuestion: "Is your person a different colour to anyone else?"
  },
  {
    id: "gay-frogged",
    name: "Gay Frogged",
    apply: applyGayFrogged,
    exampleQuestion: "Is your person glowing the same colour as yours?"
  },
  {
    id: "face-first",
    name: "Face First",
    apply: applyFaceFirst,
    exampleQuestion: "Could you pick your person from their face alone?"
  },
  {
    id: "ps1-mode",
    name: "PS1 Mode",
    apply: applyPs1Mode,
    exampleQuestion: ""
  },
  {
    id: "yugioh",
    name: "Yu-Gi-Oh!",
    apply: applyYugioh,
    exampleQuestion: "Is your person a Trap Card?"
  },
  {
    id: "orgy",
    name: "Orgy Mode",
    apply: applyOrgy,
    exampleQuestion: "Is your person a bottom?"
  },
  {
    id: "fireworks",
    name: "Fireworks Mode",
    apply: applyFireworks,
    exampleQuestion: "Ready to make someone's head pop?"
  },
  {
    id: "pixall",
    name: "PIXALL",
    apply: applyPixall,
    exampleQuestion: "Is your person made of more than 8 pixels?"
  },
  {
    id: "disease",
    name: "Disease Mode",
    apply: applyDisease,
    exampleQuestion: "Is your person's condition MEGA?"
  },
  {
    id: "drugs",
    name: "Drug Addict Mode",
    apply: applyDrugs,
    exampleQuestion: "Does your person inject?"
  },
  {
    id: "fertility",
    name: "Fertility Mode",
    apply: applyFertility,
    exampleQuestion: "Is your person barren?"
  },
  {
    id: "disguise",
    name: "Special Disguise",
    apply: applyDisguise,
    exampleQuestion: "Can you even tell who your person is?"
  },
  {
    id: "work",
    name: "Work Mode",
    apply: applyWork,
    exampleQuestion: "Is your person ready for the meeting?"
  },
  {
    id: "linkedin",
    name: "LINKEDIN",
    apply: applyLinkedin,
    exampleQuestion: "Is your person #OpenToWork?"
  },
  {
    id: "neighbourhood-watch",
    name: "NEIGHBOURHOOD WATCH",
    apply: applyNeighbourhoodWatch,
    exampleQuestion: "Is your person the group admin?"
  },
  {
    id: "gallery",
    name: "THE GALLERY",
    apply: applyGallery,
    exampleQuestion: "Is your person priced on request?"
  },
  {
    id: "woke",
    name: "WOKE Mode",
    apply: applyWoke,
    exampleQuestion: "Is your person doing the absolute most?"
  },
  {
    id: "swipe",
    name: "SWIPE",
    apply: applySwipe,
    exampleQuestion: "Would you swipe right on your person?"
  },
  {
    id: "judgement",
    name: "Judgement Day",
    apply: applyJudgement,
    exampleQuestion: "Is your person going to hell?"
  },
  {
    id: "sims",
    name: "Sims Mode",
    apply: applySims,
    exampleQuestion: "Is your person's plumbob red?"
  },
  {
    id: "heads-only",
    name: "Heads Only",
    apply: applyHeadsOnly,
    exampleQuestion: "Is your person's head in the top half right now?"
  },
  {
    id: "habbo",
    name: "Habbo Hotel",
    apply: applyHabbo,
    exampleQuestion: "Is your person standing on the left side of the room?"
  },
  {
    id: "astrology",
    name: "Astrology",
    apply: applyAstrology,
    exampleQuestion: "Is your person a water sign?"
  },
  {
    id: "pantone",
    name: "PANTONE",
    apply: applyPantone,
    exampleQuestion: "Is your person's colour warm-toned?"
  },
  {
    id: "horny-potter",
    name: "Horny Potter",
    apply: applyHornyPotter,
    exampleQuestion: "Is your person in Slytherin?"
  }
];

let testTriggerBuffer = "";
let ps1Install = null;
let ps1Cleanup = null;

const MYSTERY_MODE_META = {
  "prop-panic": { tier: 1, wheelOrder: 10, pgSafe: true, glyph: "☂", teardown: stopPropLoop },
  "ps1-mode": { tier: 1, wheelOrder: 20, pgSafe: true, glyph: "△", teardown: cleanupPs1Mode },
  "face-first": { tier: 1, wheelOrder: 30, pgSafe: true, glyph: "☻" },
  "emotional-audit": { tier: 1, wheelOrder: 40, pgSafe: true, glyph: "♥" },
  "role-reveal": { tier: 1, wheelOrder: 50, pgSafe: true, glyph: "❂" },
  astrology: { tier: 1, wheelOrder: 60, pgSafe: true, glyph: "☽", boardClasses: ["astrology-board"], flash: "#8c5af0" },
  pantone: { tier: 1, wheelOrder: 70, pgSafe: true, glyph: "❏", boardClasses: ["pantone-board"] },
  habbo: { tier: 1, wheelOrder: 80, pgSafe: true, glyph: "⌂", boardClasses: ["habbo-board"], flash: "#2fb6d8", renderBoard: renderHabboBoard, afterRenderSecret: pixelateHabboSecret, teardown: resetHabbo },
  "heads-only": { tier: 1, wheelOrder: 90, pgSafe: true, glyph: "⊚", boardClasses: ["heads-board"], flash: "#7a5cff", renderBoard: renderHeadsOnlyBoard, teardown: resetHeadsAnim },
  gallery: { tier: 1, wheelOrder: 95, pgSafe: true, glyph: "◫", boardClasses: ["gallery-board"], flash: "#c9a24b" },
  "knockoff-manor": { tier: 2, wheelOrder: 10, pgSafe: false, glyph: "☠", boardClasses: ["knockoff-manor-board"], renderBoard: renderKnockoffManorBoard, renderHouseMap, decorateLocation: decorateMurderLocation, teardown: stopManorLoop },
  "family-tree-disaster": { tier: 2, wheelOrder: 20, pgSafe: true, glyph: "⚭", boardClasses: ["family-tree-board"], renderBoard: renderFamilyBoard },
  yugioh: { tier: 2, wheelOrder: 30, pgSafe: true, glyph: "◈", boardClasses: ["ygo-board"], bodyClasses: ["mode-yugioh"], flash: "#a05aff", decorateLocation: decorateYugiohLocation, prepareCard: prepareYugiohCard },
  pixall: { tier: 2, wheelOrder: 40, pgSafe: true, glyph: "▦", boardClasses: ["pixall-board"], bodyClasses: ["mode-pixall"], flash: "#5dff8f", afterDefaultBoard: startPixallLoop, teardown: stopPixallLoop },
  "horny-potter": { tier: 2, wheelOrder: 50, pgSafe: false, glyph: "☇", boardClasses: ["hp-board"] },
  "witness-protection-filter": { tier: 2, wheelOrder: 60, pgSafe: true, glyph: "⊘", flash: "#c9d200" },
  linkedin: { tier: 2, wheelOrder: 70, pgSafe: true, glyph: "in", boardClasses: ["linkedin-board"], bodyClasses: ["mode-linkedin"], afterDefaultBoard: renderLinkedinTicker, teardown: resetLinkedinTicker },
  "neighbourhood-watch": { tier: 2, wheelOrder: 75, pgSafe: true, glyph: "⚑", boardClasses: ["nw-board"], bodyClasses: ["mode-neighbourhood-watch"], flash: "#4267b2", afterDefaultBoard: renderNwTicker, teardown: resetNwTicker },
  "hidden-agendas": { tier: 3, wheelOrder: 10, pgSafe: false, glyph: "⚿", flash: "#3a5fd0" },
  monocultural: { tier: 3, wheelOrder: 20, pgSafe: false, glyph: "⧉", flash: "#c88968" },
  "gay-frogged": { tier: 3, wheelOrder: 30, pgSafe: false, glyph: "⚧", flash: "rainbow", decorateLocation: decorateGayFroggedLocation },
  swipe: {
    tier: 3, wheelOrder: 40, pgSafe: false, glyph: "☞", boardClasses: ["swipe-board"], flash: "#ff5a72", prepareCard: prepareSwipeCard,
    sorts: [["match", "Match % 🔥"], ["distance", "Distance 📍"]]
  },
  fireworks: { tier: 3, wheelOrder: 50, pgSafe: false, glyph: "✸", flash: "#ffd24d", prepareCard: prepareFireworksCard },
  sims: {
    tier: 3, wheelOrder: 60, pgSafe: true, glyph: "⬦", boardClasses: ["sims-board"], flash: "#3ec46a", afterDefaultBoard: startSimsLoop, teardown: resetSimsLoop,
    sorts: [["cash", "Simoleons §"], ["mood", "Mood 💎"]]
  },
  drugs: { tier: 4, wheelOrder: 10, pgSafe: false, glyph: "☤", boardClasses: ["drugs-board"], flash: "#8a5cff", sorts: [["habits", "Habits 💉"]] },
  disguise: { tier: 4, wheelOrder: 20, pgSafe: false, glyph: "⬗", flash: "#0b0b0d" },
  disease: { tier: 4, wheelOrder: 30, pgSafe: false, glyph: "☣", boardClasses: ["disease-board"], flash: "#e0341a", sorts: [["deathness", "Close to death 💀"]] },
  fertility: { tier: 4, wheelOrder: 40, pgSafe: false, glyph: "☥", boardClasses: ["fertility-board"], flash: "#ff5a7d", sorts: [["cum", "Sperm count 💦"], ["eggs", "Egg count 🥚"]] },
  orgy: {
    tier: 4, wheelOrder: 50, pgSafe: false, glyph: "⚯", boardClasses: ["orgy-board"], flash: "#ff2d6f",
    sorts: [["horniness", "Horniness 🔥"], ["cum", "Cum count 💦"], ["bodycount", "Body count 🍆"], ["deathness", "Close to death 💀"]]
  },
  judgement: {
    tier: 4, wheelOrder: 60, pgSafe: false, glyph: "⚖", boardClasses: ["judgement-board"], flash: "#ffcf4d",
    afterDefaultBoard: renderJudgementPurgatory, defaultSort: sortJudgementBoard,
    sorts: [["karma", "Karma ⚖️"], ["happiness", "Happiness 😀"]]
  },
  work: { tier: 4, wheelOrder: 70, pgSafe: false, glyph: "⚒", boardClasses: ["work-board"], flash: "#8a1a1a", sorts: [["days", "Days left ⛏"]] },
  woke: { tier: 5, wheelOrder: 10, pgSafe: false, glyph: "◉", boardClasses: ["woke-board"], flash: "#ff5ad0", sorts: [["horniness", "Horniness 🔥"], ["cum", "Cum count 💦"], ["deathness", "Close to death 💀"]] }
};

const mysteryRegistry = {};

function registerMysteryEffect(definition) {
  const meta = MYSTERY_MODE_META[definition.id] || {};
  const effect = {
    tier: meta.tier,
    pgSafe: meta.pgSafe === true,
    hooks: {},
    ...definition,
    ...meta
  };
  if (!effect.id || !effect.name || typeof effect.apply !== "function" || !effect.tier) {
    throw new Error(`Invalid mystery effect registration: ${effect.id || "(missing id)"}`);
  }
  mysteryRegistry[effect.id] = effect;
  return effect;
}

const mysteryEffects = MYSTERY_EFFECT_DEFINITIONS.map(registerMysteryEffect);
const PG_SAFE_MODES = mysteryEffects.filter((effect) => effect.pgSafe).map((effect) => effect.id);
const WOKE_PREREQS = ["gay-frogged", "orgy", "drugs", "disease", "fertility", "work", "disguise"];
const WHEEL_TIERS = deriveWheelTiers();
const DEV_ONLY_MODES = new Set(["ps1-mode"]);

function devModeEnabled(id) {
  if (!DEV_ONLY_MODES.has(id)) return true;
  try {
    return window.WHOISIT_DEV_PS1 === true || new URLSearchParams(location.search).get("devPs1") === "1";
  } catch (e) {
    return false;
  }
}
function playableMysteryEffects() {
  return mysteryEffects.filter((effect) => devModeEnabled(effect.id));
}

function deriveWheelTiers() {
  const tiers = [];
  mysteryEffects.forEach((effect) => {
    const index = effect.tier - 1;
    if (!tiers[index]) tiers[index] = [];
    tiers[index].push(effect);
  });
  return tiers.map((tier, index) => {
    const ids = [...tier].sort((a, b) => (a.wheelOrder || 999) - (b.wheelOrder || 999) || a.name.localeCompare(b.name)).map((effect) => effect.id);
    if (index === 0) ids.push(null);
    return ids;
  });
}

const MODE_BOARD_CLASSES = Array.from(new Set(mysteryEffects.flatMap((effect) => effect.boardClasses || [])));
const MODE_BODY_CLASSES = Array.from(new Set(mysteryEffects.flatMap((effect) => effect.bodyClasses || [])));


// ---- wheel ----
// What the Wheel of Fate WILL land on for the current salt (deterministic; includes "no effect").
function wheelTarget() {
  const playable = playableMysteryEffects().filter((e) => tierAllowed(e.tier - 1));
  const pool = state.settings.pg ? playable.filter((e) => PG_SAFE_MODES.includes(e.id)) : playable;
  const n = pool.length + 1;   // +1 = the No Effect cell
  const idx = stableHash(`${state.gameSalt}:wheel`) % n;
  return idx < pool.length ? pool[idx].id : null;
}
// No-repeat wheel: the wheel draws from a persistent bag and never repeats a mode until you've
// experienced every single one (then the bag resets for another full lap). Still salt-deterministic
// WITHIN the bag, and the chosen id rides the "start" message so online clients agree regardless
// of their local bag state.
const WHEEL_BAG_KEY = "whoisit_wheel_bag_v1";
function wheelBag() {
  try { const b = JSON.parse(localStorage.getItem(WHEEL_BAG_KEY) || "[]"); return Array.isArray(b) ? b : []; }
  catch (e) { return []; }
}
// Escalating derangement: the registry derives TIERS from per-mode metadata, tame -> unhinged.
// WOKE still needs every component mode experienced first (belt-and-braces beyond its tier).
function wheelPgOk(id) { return !state.settings.pg || id === null || PG_SAFE_MODES.includes(id); }
// Host intensity gate: the host can switch whole tiers off in setup (to skip the tame warm-up modes
// and drop straight into the rowdier ones) WITHOUT ever seeing which modes live in a tier. Empty /
// missing = every tier on. All-off would strand the wheel, so that degrades to "everything on".
function tierAllowed(tierIdx) {
  const t = state.settings && state.settings.tiers;
  if (!Array.isArray(t) || !t.length) return true;
  return t.includes(tierIdx + 1);
}
function wheelTargetFromBag() {
  const known = new Set(playableMysteryEffects().map((e) => e.id));
  const seen = wheelBag();
  for (let ti = 0; ti < WHEEL_TIERS.length; ti += 1) {
    if (!tierAllowed(ti)) continue;
    const tier = WHEEL_TIERS[ti];
    let pool = tier.filter((id) => (id === null || known.has(id)) && !seen.includes(id) && wheelPgOk(id));
    // Gate WOKE until its prerequisite modes have all been seen.
    pool = pool.filter((id) => id !== "woke" || WOKE_PREREQS.every((p) => seen.includes(p)));
    if (pool.length) return pool[stableHash(`${state.gameSalt}:wheel`) % pool.length];
  }
  // Whole gauntlet complete - reset and start a fresh, escalating lap. That's a SEASON FINALE:
  // flag it so the round flow plays the recap montage before this round's wheel spin.
  try { localStorage.setItem(WHEEL_BAG_KEY, "[]"); } catch (e) { /* fine */ }
  try {
    const season = 1 + (parseInt(localStorage.getItem(SEASON_KEY) || "1", 10) || 1);
    localStorage.setItem(SEASON_KEY, String(season));
    state.pendingFinale = season - 1;   // the season that just wrapped
  } catch (e) { /* fine */ }
  // Fresh lap: fall to the first ENABLED tier (not always tier 1 - the host may have gated it off).
  for (let ti = 0; ti < WHEEL_TIERS.length; ti += 1) {
    if (!tierAllowed(ti)) continue;
    const first = WHEEL_TIERS[ti].filter((id) => (id === null || known.has(id)) && wheelPgOk(id));
    if (first.length) return first[stableHash(`${state.gameSalt}:wheel`) % first.length];
  }
  return null;
}
const SEASON_KEY = "whoisit_season_v1";
function markWheelSeen(id) {
  try {
    const seen = wheelBag();
    if (!seen.includes(id)) { seen.push(id); localStorage.setItem(WHEEL_BAG_KEY, JSON.stringify(seen)); }
  } catch (e) { /* fine */ }
}


// ---- render-loops ----
// A ghost strip below the Judgement board: every soul you aborted this session, stuck in limbo.
function renderJudgementPurgatory() {
  const souls = state.global.mystery?.purgatory || [];
  if (!souls.length) return;
  const strip = document.createElement("div");
  strip.className = "jd-purgatory-strip";
  strip.innerHTML = `<div class="jd-purg-label">🕯️ PURGATORY · ${souls.length} aborted soul${souls.length > 1 ? "s" : ""} in limbo</div>`
    + `<div class="jd-purg-souls">`
    + souls.map((g) => `<figure class="jd-ghost"><img src="${g.image}" alt=""><figcaption>${escapeHtml(g.name)}<span>#${g.queuePos.toLocaleString()} in queue</span></figcaption></figure>`).join("")
    + `</div>`;
  els.characterBoard.appendChild(strip);
}

// ===================== LINKEDIN: the brainrot ticker feed =====================
// A strip above the board cycling generated LinkedIn posts (one board member at a time). Likes tick
// up cosmetically, a canned comment slides in, and it rotates every ~12s. Pauses on hover. The strip
// lives in .board-wrap (a sibling of the board) so it survives the board's per-render innerHTML wipe.
let linkedinRotateTimer = null, linkedinLikeTimer = null, linkedinPostIdx = 0, linkedinPaused = false;
function renderLinkedinTicker() {
  const posts = state.global.mystery?.posts || [];
  if (!posts.length) { resetLinkedinTicker(); return; }
  const wrap = document.querySelector(".board-wrap");
  if (!wrap) return;
  let strip = document.getElementById("linkedinTicker");
  if (!strip) {
    strip = document.createElement("div");
    strip.id = "linkedinTicker";
    strip.className = "li-ticker";
    strip.addEventListener("mouseenter", () => { linkedinPaused = true; });
    strip.addEventListener("mouseleave", () => { linkedinPaused = false; });
    wrap.insertBefore(strip, wrap.firstChild);   // above the board
    linkedinPostIdx = 0;
    paintLinkedinPost();
  }
  if (!linkedinRotateTimer) linkedinRotateTimer = setInterval(() => {
    if (linkedinPaused) return;
    if (state.global.mystery?.id !== "linkedin") { resetLinkedinTicker(); return; }
    linkedinPostIdx = (linkedinPostIdx + 1) % (state.global.mystery.posts || [1]).length;
    paintLinkedinPost();
  }, 12000);
  // Cosmetic like-counter ticking (local-only; not synced, purely decorative).
  if (!linkedinLikeTimer) linkedinLikeTimer = setInterval(() => {
    if (linkedinPaused) return;
    const el = document.querySelector("#linkedinTicker .li-likes b");
    if (el) { const n = parseInt(el.dataset.n || "0", 10) + 1 + Math.floor(Math.random() * 3); el.dataset.n = n; el.textContent = n.toLocaleString(); }
  }, 1500);
}
function paintLinkedinPost() {
  const strip = document.getElementById("linkedinTicker");
  const posts = state.global.mystery?.posts || [];
  if (!strip || !posts.length) return;
  const p = posts[linkedinPostIdx % posts.length];
  const ch = characterById(p.authorId);
  const avatar = ch && ch.image ? `<img class="li-avatar" src="${ch.image}" alt="">` : `<span class="li-avatar li-avatar-blank">in</span>`;
  strip.innerHTML = `
    <span class="li-logo" aria-hidden="true">in</span>
    <div class="li-post" role="status">
      <div class="li-post-head">${avatar}<div><b>${escapeHtml(p.author)}</b><span>${escapeHtml(p.title)}</span></div></div>
      <div class="li-post-body">${escapeHtml(p.text)}</div>
      <div class="li-post-foot"><span class="li-likes">👍 <b data-n="${p.likes}">${p.likes.toLocaleString()}</b></span><span class="li-comment">💬 ${escapeHtml(p.comment)}</span></div>
    </div>`;
}
function resetLinkedinTicker() {
  if (linkedinRotateTimer) { clearInterval(linkedinRotateTimer); linkedinRotateTimer = null; }
  if (linkedinLikeTimer) { clearInterval(linkedinLikeTimer); linkedinLikeTimer = null; }
  linkedinPaused = false;
  const strip = document.getElementById("linkedinTicker");
  if (strip) strip.remove();
}

// ===================== NEIGHBOURHOOD WATCH: the group feed ticker =====================
// Same engine as the LinkedIn ticker: one post at a time above the board, an angry-react counter
// that ticks up cosmetically (local-only), a comment that slides in, ~12s rotation, pause on hover.
let nwRotateTimer = null, nwReactTimer = null, nwPostIdx = 0, nwPaused = false;
function renderNwTicker() {
  const posts = state.global.mystery?.posts || [];
  if (!posts.length) { resetNwTicker(); return; }
  const wrap = document.querySelector(".board-wrap");
  if (!wrap) return;
  let strip = document.getElementById("nwTicker");
  if (!strip) {
    strip = document.createElement("div");
    strip.id = "nwTicker";
    strip.className = "nw-ticker";
    strip.addEventListener("mouseenter", () => { nwPaused = true; });
    strip.addEventListener("mouseleave", () => { nwPaused = false; });
    wrap.insertBefore(strip, wrap.firstChild);
    nwPostIdx = 0;
    paintNwPost();
  }
  if (!nwRotateTimer) nwRotateTimer = setInterval(() => {
    if (nwPaused) return;
    if (state.global.mystery?.id !== "neighbourhood-watch") { resetNwTicker(); return; }
    nwPostIdx = (nwPostIdx + 1) % (state.global.mystery.posts || [1]).length;
    paintNwPost();
  }, 12000);
  if (!nwReactTimer) nwReactTimer = setInterval(() => {
    if (nwPaused) return;
    const el = document.querySelector("#nwTicker .nw-reacts b");
    if (el) { const n = parseInt(el.dataset.n || "0", 10) + 1; el.dataset.n = n; el.textContent = n; }
  }, 2600);
}
function paintNwPost() {
  const strip = document.getElementById("nwTicker");
  const m = state.global.mystery;
  const posts = m?.posts || [];
  if (!strip || !posts.length) return;
  const p = posts[nwPostIdx % posts.length];
  const ch = characterById(p.authorId);
  const avatar = ch && ch.image ? `<img class="nw-avatar" src="${ch.image}" alt="">` : `<span class="nw-avatar nw-avatar-blank">f</span>`;
  strip.innerHTML = `
    <div class="nw-group-head">${escapeHtml(m.groupName || "NEIGHBOURHOOD WATCH")} <span>· Private group</span></div>
    <div class="nw-post" role="status">
      <div class="nw-post-head">${avatar}<div><b>${escapeHtml(p.author)}</b><span>${escapeHtml(p.role)} · ${escapeHtml(p.when)}</span></div></div>
      <div class="nw-post-body">${escapeHtml(p.text)}</div>
      <div class="nw-post-foot"><span class="nw-reacts">😡 <b data-n="${p.reacts}">${p.reacts}</b></span><span class="nw-comment">💬 <b>${escapeHtml(p.commenter)}:</b> ${escapeHtml(p.comment)}</span></div>
    </div>`;
}
function resetNwTicker() {
  if (nwRotateTimer) { clearInterval(nwRotateTimer); nwRotateTimer = null; }
  if (nwReactTimer) { clearInterval(nwReactTimer); nwReactTimer = null; }
  nwPaused = false;
  const strip = document.getElementById("nwTicker");
  if (strip) strip.remove();
}

// ===================== Prop Panic: the periodic PROP SWAP =====================
// Every few seconds the props go berserk and two random characters trade props - so the answers to
// "who is holding the X" keep shifting mid-round. That's the panic.
let propPanicTimer = null;
function stopPropLoop() { if (propPanicTimer) { clearInterval(propPanicTimer); propPanicTimer = null; } }
// Low power mode: skip the continuous animation/repaint loops so a warm phone can cool off. CSS
// separately pauses the infinite keyframe animations + backdrop blur; this stops the JS-driven ones
// (rAF repaints, canvas draws, DOM-churning tickers), which are the real battery/heat cost.
function lowPowerMode() { return !!(state.settings && state.settings.lowPower); }
function startPropLoop() {
  if (propPanicTimer || lowPowerMode()) return;
  propPanicTimer = setInterval(() => {
    if (state.global.mystery?.id !== "prop-panic") { stopPropLoop(); return; }
    const asg = state.global.mystery.assignments;
    const ids = state.board.map((c) => c.id).filter((id) => asg[id]);
    if (ids.length < 2) return;
    const a = ids[Math.floor(Math.random() * ids.length)];
    let b = a;
    while (b === a) b = ids[Math.floor(Math.random() * ids.length)];
    // Everyone's prop goes berserk, a PROP SWAP!! flash hits, then the two props trade owners.
    els.characterBoard.classList.add("prop-berserk");
    const flash = document.createElement("div");
    flash.className = "prop-swap-flash";
    flash.textContent = "PROP SWAP!!";
    document.body.appendChild(flash);
    setTimeout(() => {
      [asg[a], asg[b]] = [asg[b], asg[a]];
      flash.remove();
      renderBoard();
    }, 700);
  }, 6000);
}

// ===================== Heads Only mode =====================
// Formations: each maps (index i, count n, time-seconds t, width w, height h) -> a target {x,y} in px.
const HEADS_FORMATIONS = [
  // Ring, slowly rotating.
  (i, n, t, w, h) => { const R = Math.min(w, h) * 0.38; const a = (i / n) * Math.PI * 2 + t * 0.22; return { x: w / 2 + Math.cos(a) * R, y: h / 2 + Math.sin(a) * R }; },
  // Figure-8 / infinity (lemniscate), drifting along the curve.
  (i, n, t, w, h) => { const S = Math.min(w, h) * 0.44; const th = (i / n) * Math.PI * 2 + t * 0.35; const d = 1 + Math.sin(th) * Math.sin(th); return { x: w / 2 + (S * 1.35 * Math.cos(th)) / d, y: h / 2 + (S * Math.sin(th) * Math.cos(th)) / d }; },
  // Tidy grid.
  (i, n, t, w, h) => { const cols = Math.ceil(Math.sqrt(n * (w / h))); const c = i % cols, r = Math.floor(i / cols); const rows = Math.ceil(n / cols); return { x: w * (0.1 + ((c + 0.5) / cols) * 0.8), y: h * (0.12 + ((r + 0.5) / Math.max(rows, 1)) * 0.76) }; },
  // Phyllotaxis spiral.
  (i, n, t, w, h) => { const R = Math.min(w, h) * 0.46; const a = i * 2.399963 + t * 0.28; const rad = R * Math.sqrt((i + 1) / n); return { x: w / 2 + Math.cos(a) * rad, y: h / 2 + Math.sin(a) * rad }; },
  // Heart.
  (i, n, t, w, h) => { const th = (i / n) * Math.PI * 2; const s = Math.min(w, h) * 0.03; const hx = 16 * Math.pow(Math.sin(th), 3); const hy = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th); return { x: w / 2 + hx * s, y: h / 2 - hy * s }; },
  // Rolling sine wave.
  (i, n, t, w, h) => { const px = (i + 0.5) / n; return { x: w * (0.08 + px * 0.84), y: h / 2 + Math.sin(px * Math.PI * 4 + t * 1.1) * h * 0.26 }; }
];
let headsAnimRaf = null;
let headsPos = new Map();      // char id -> {x,y}, kept across re-renders so clicks don't jolt
let headsStartTs = null;       // persisted so the formation cycle keeps its phase across re-renders
function stopHeadsAnim() { if (headsAnimRaf) { cancelAnimationFrame(headsAnimRaf); headsAnimRaf = null; } }
function resetHeadsAnim() { stopHeadsAnim(); headsPos = new Map(); headsStartTs = null; }

const HEADS_FORM_NAMES = ["Ring ◯", "Figure-8 ∞", "Grid ▦", "Spiral ✺", "Heart ♥", "Wave 〜"];
// Safari perf: SVG data-URL images get re-rasterised by WebKit while they move, and a live CSS
// drop-shadow filter on ~24 animated elements repaints every frame. So each head is rasterised ONCE
// to a flat PNG with the shadow baked in - Safari then just composites bitmaps.
const headRasterCache = new Map();
function rasterizeHead(src, done) {
  if (headRasterCache.has(src)) { done(headRasterCache.get(src)); return; }
  const im = new Image();
  im.onload = () => {
    const S = 160;
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const x = c.getContext("2d");
    x.shadowColor = "rgba(0, 0, 0, 0.6)";
    x.shadowBlur = 6;
    x.shadowOffsetY = 3;
    x.drawImage(im, 0, 0, S, S);
    const url = c.toDataURL();
    headRasterCache.set(src, url);
    done(url);
  };
  im.onerror = () => done(src);
  im.src = src;
}
function renderHeadsOnlyBoard(player) {
  els.characterBoard.classList.add("heads-board");
  els.characterBoard.setAttribute("aria-label", "Floating heads");
  if (state.headsForm == null) state.headsForm = 0;
  // A little formation picker sits inside the board - pick the shape rather than auto-cycling.
  const bar = document.createElement("div");
  bar.className = "heads-toolbar";
  bar.innerHTML = HEADS_FORM_NAMES.map((nm, i) => `<button type="button" class="heads-form-btn ${i === state.headsForm ? "on" : ""}" data-form="${i}">${nm}</button>`).join("");
  bar.querySelectorAll("[data-form]").forEach((b) => b.addEventListener("click", () => {
    state.headsForm = Number(b.dataset.form);
    bar.querySelectorAll(".heads-form-btn").forEach((x) => x.classList.toggle("on", x === b));
  }));
  els.characterBoard.appendChild(bar);
  const layer = document.createElement("div");
  layer.className = "heads-layer";
  els.characterBoard.appendChild(layer);
  const list = sortedBoard();
  const n = list.length;
  const heads = list.map((ch) => {
    const m = getMysteryCardData(ch);
    const el = document.createElement("button");
    el.type = "button";
    el.className = `float-head ${player.eliminated.has(ch.id) ? "is-down" : ""}`.trim();
    el.dataset.id = ch.id;
    el.style.setProperty("--bob", `${(stableHash(ch.id) % 1000) / 1000 * 3}s`);
    el.innerHTML = `<img src="${m.image || ch.image}" alt=""><span class="float-name">${escapeHtml(displayName(ch))}</span>`;
    el.addEventListener("click", () => toggleEliminated(ch.id));
    wireBreedDnD(el, ch.id);
    layer.appendChild(el);
    // Swap the SVG for a flat pre-shadowed PNG once it's rasterised (Safari perf - see rasterizeHead).
    rasterizeHead(m.image || ch.image, (url) => { const img = el.querySelector("img"); if (img) img.src = url; });
    const seed = headsPos.get(ch.id);
    return { el, id: ch.id, x: seed ? seed.x : null, y: seed ? seed.y : null };
  });
  const PAD = 58;   // keep whole heads + names inside the board
  // Board size is read ONCE and refreshed on resize - a getBoundingClientRect() inside the rAF loop
  // forces a synchronous layout every frame, which Safari pays for far more dearly than Chrome.
  let w = layer.clientWidth || 640, h = layer.clientHeight || 520;
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => { w = layer.clientWidth || 640; h = layer.clientHeight || 520; }).observe(layer);
  }
  const step = (ts) => {
    if (headsStartTs == null) headsStartTs = ts;
    const t = (ts - headsStartTs) / 1000;
    const form = HEADS_FORMATIONS[state.headsForm || 0];
    heads.forEach((hd, i) => {
      const tgt = form(i, n, t, w, h);
      const tx = Math.max(PAD, Math.min(w - PAD, tgt.x));   // clamp inside the board
      const ty = Math.max(PAD, Math.min(h - PAD, tgt.y));
      if (hd.x == null) { hd.x = tx; hd.y = ty; }
      hd.x += (tx - hd.x) * 0.06;   // ease toward the formation so morphs glide
      hd.y += (ty - hd.y) * 0.06;
      hd.el.style.transform = `translate(${hd.x.toFixed(1)}px, ${hd.y.toFixed(1)}px) translate(-50%, -50%)`;
      headsPos.set(hd.id, { x: hd.x, y: hd.y });
    });
    // Low power: one layout pass, then stop rescheduling (heads sit static instead of morphing).
    if (!lowPowerMode()) headsAnimRaf = requestAnimationFrame(step);
  };
  headsAnimRaf = requestAnimationFrame(step);
}

// ===================== Habbo Hotel mode =====================
const HABBO_GW = 8, HABBO_GH = 8, HABBO_TW = 84, HABBO_TH = 42;   // 8x8: room for furni AND a stroll
let habboPos = new Map();     // char id -> {col,row}, persisted so walking survives re-renders
let habboSelected = null;
let habboCtx = null;
let habboWanderTimer = null;  // idle NPCs strolling around, like a populated Habbo room
let habboBlocked = new Set(); // "col,row" tiles occupied by furni - nobody stands or walks there
function resetHabbo() {
  habboPos = new Map(); habboSelected = null; habboCtx = null; habboBlocked = new Set();
  clearInterval(habboWanderTimer); habboWanderTimer = null;
  document.getElementById("habboCam")?.remove();
  document.getElementById("habboChat")?.remove();
}

// ===================== Sims bladder cycle =====================
// The BLADDER need drains over time; when it bottoms out the Sim pisses (a stream off the bottom of
// the card, eyes-shut shake), then it fills back up.
let simBladderTimer = null;
let simBladder = new Map();
function stopSimsLoop() { if (simBladderTimer) { clearInterval(simBladderTimer); simBladderTimer = null; } }
function resetSimsLoop() { stopSimsLoop(); simBladder = new Map(); }
function simsTick() {
  if (state.global.mystery?.id !== "sims") { stopSimsLoop(); return; }
  const asg = state.global.mystery.assignments || {};
  state.board.forEach((ch) => {
    const a = asg[ch.id];
    if (!a || !a.needs) return;
    const card = document.getElementById(`card-${ch.id}`);
    if (!card || card.classList.contains("sim-pissing")) return;
    if (!simBladder.has(ch.id)) simBladder.set(ch.id, a.needs.bladder);
    const s = card.querySelector('.sim-bar[data-need="bladder"] s');
    let v = simBladder.get(ch.id) - (0.8 + Math.random() * 1.5);   // gentle, slow drain
    if (v <= 0) {
      simBladder.set(ch.id, 94 + Math.random() * 6);           // relief - refill
      if (s) { s.style.width = "100%"; s.className = "sim-ok"; }
      // Some Sims shudder; others gently sway/bob side to side (a relieved little jiggle).
      const relief = stableHash(ch.id + ":relief") % 2 ? "relief-sway" : "relief-shake";
      card.classList.add("sim-pissing", relief);
      const piss = document.createElement("span");
      piss.className = "sim-piss";
      // Organic dribble: individual droplets with their own offsets/timing fall off the bottom of the
      // tile onto the tile underneath, where a puddle collects.
      piss.innerHTML = Array.from({ length: 4 }, (_, i) => {
        const dx = -6 + Math.floor(Math.random() * 13);
        const dl = (i * 0.32 + Math.random() * 0.2).toFixed(2);
        const du = (0.55 + Math.random() * 0.3).toFixed(2);
        return `<i class="sim-drop" style="--dx:${dx}px;--dl:${dl}s;--du:${du}s"></i>`;
      }).join("") + `<i class="sim-puddle"></i>`;
      card.appendChild(piss);
      setTimeout(() => { card.classList.remove("sim-pissing", relief); piss.remove(); }, 2200);
    } else {
      simBladder.set(ch.id, v);
      if (s) { s.style.width = `${v}%`; s.className = v < 25 ? "sim-crit" : v < 55 ? "sim-warn" : "sim-ok"; }
    }
  });
}
function startSimsLoop() { if (!simBladderTimer && !lowPowerMode()) simBladderTimer = setInterval(simsTick, 480); }

function habboIso(col, row) {
  const originX = HABBO_GH * HABBO_TW / 2 + 24;
  const originY = 150;   // sits the room lower in the tall board area
  return { x: originX + (col - row) * HABBO_TW / 2, y: originY + (col + row) * HABBO_TH / 2 };
}
// A "camera" that zooms the room onto a chosen avatar and follows them (like Habbo). Pass null to
// pull back out to the whole room.
function habboCamera(id) {
  const room = habboCtx?.room;
  if (!room) return;
  const resetCamera = () => {
    room.style.setProperty("--hb-cam-x", "0px");
    room.style.setProperty("--hb-cam-y", "0px");
    room.style.setProperty("--hb-cam-scale", "1");
  };
  if (!id || !habboPos.has(id)) { resetCamera(); return; }
  const mobileRoomFit = !!(window.matchMedia && window.matchMedia("(max-width: 640px), (pointer: coarse)").matches);
  if (mobileRoomFit) { resetCamera(); return; }
  const p = habboIso(habboPos.get(id).col, habboPos.get(id).row);
  // clientWidth/Height = the visible viewport (excludes scrollbars); getBoundingClientRect can read
  // odd during transitions. The room's transform-origin is 0 0, so we just map (cx,cy) → viewport centre.
  const vw = els.characterBoard.clientWidth || els.characterBoard.getBoundingClientRect().width;
  const vh = els.characterBoard.clientHeight || els.characterBoard.getBoundingClientRect().height;
  const scale = 2.6;                             // a proper Habbo close-up, not a distant wide shot
  const cx = p.x, cy = p.y - 62;                 // aim at the FACE (upper body), not the mid-torso
  room.style.setProperty("--hb-cam-x", `${(vw / 2 - cx * scale).toFixed(0)}px`);
  room.style.setProperty("--hb-cam-y", `${(vh / 2 - cy * scale).toFixed(0)}px`);
  room.style.setProperty("--hb-cam-scale", String(scale));
}
function selectHabbo(id) {
  // Click the already-selected avatar again to zoom back out.
  if (habboSelected === id) {
    habboSelected = null;
    habboCtx?.figEls.forEach((el) => el.classList.remove("selected"));
    habboCamera(null);
    renderHabboSelectionUI();
    return;
  }
  habboSelected = id;
  if (habboCtx) habboCtx.figEls.forEach((el, cid) => el.classList.toggle("selected", cid === id));
  habboCamera(id);
  renderHabboSelectionUI(true);   // a fresh pick is the one moment the chat input grabs focus
}
// The ROOM CAM (a close-up feed of whoever is selected, crunched far softer than the room heads so
// you can actually tell who it is) + the chat bar that lets you talk AS them. Both live OUTSIDE the
// zooming room so they stay put while the camera flies around. Chat needs a real keyboard - phones
// don't get the bar (the room is cramped enough on a phone without an on-screen keyboard on top).
const HABBO_HAS_KEYBOARD = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
function renderHabboSelectionUI(focusChat = false) {
  const wrap = document.querySelector(".board-wrap");
  // Re-renders rebuild the bar (room DOM is fully rebuilt anyway) - carry the typed draft and focus
  // across so a mid-sentence net-sync render doesn't eat the message or yank the caret.
  const oldBar = document.getElementById("habboChat");
  const oldInput = oldBar?.querySelector("input");
  const draft = oldBar?.dataset.forId === habboSelected ? (oldInput?.value || "") : "";
  const hadFocus = !!oldInput && document.activeElement === oldInput;
  document.getElementById("habboCam")?.remove();
  document.getElementById("habboChat")?.remove();
  if (!wrap || !habboSelected || state.global.mystery?.id !== "habbo") return;
  const ch = characterById(habboSelected);
  if (!ch) return;
  const a = state.global.mystery.assignments[ch.id] || {};
  const banned = currentPlayer().eliminated.has(ch.id);
  const face = habboFaceSrc(a);   // real Habbo head if we have a sprite, else the generated portrait
  const cam = document.createElement("div");
  cam.id = "habboCam"; cam.className = "hb-cam";
  cam.innerHTML = `<p class="hb-cam-top"><span class="hb-rec">● REC</span><span>ROOM CAM</span></p>`
    + `<div class="hb-cam-screen"><img class="${face ? "hb-real-face" : ""}" src="${face || a.head || ch.image}" alt=""></div>`
    + `<p class="hb-cam-name">${displayName(ch)}</p>`
    + `<button type="button" class="hb-cam-ban ${banned ? "is-banned" : ""}">${banned ? "UNBAN" : "BAN"}</button>`;
  wrap.appendChild(cam);
  // Only the generated-portrait fallback gets pixel-crunched; a real Habbo head is already pixel-art.
  if (!face && a.head) pixelateSrc(a.head, 84, (url) => { const img = cam.querySelector(".hb-cam-screen img"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
  cam.querySelector(".hb-cam-ban").addEventListener("click", () => banHabbo(ch.id));
  if (HABBO_HAS_KEYBOARD && !banned) {
    const bar = document.createElement("div");
    bar.id = "habboChat"; bar.className = "hb-chatbar";
    bar.dataset.forId = ch.id;
    bar.innerHTML = `<img class="${face ? "hb-real-face" : ""}" src="${face || a.head || ch.image}" alt="">`
      + `<input type="text" maxlength="90" placeholder="Chat as ${displayName(ch)}…" aria-label="Chat as ${displayName(ch)}">`
      + `<button type="button">SAY</button>`;
    wrap.appendChild(bar);
    if (!face && a.head) pixelateSrc(a.head, 30, (url) => { const img = bar.querySelector("img"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
    const input = bar.querySelector("input");
    if (draft) input.value = draft;
    // The bobba filter runs ONCE at send time (not per client), so everyone reads the same censored
    // words - then the chat is broadcast so both online seats see every bubble.
    const say = () => {
      const t = input.value.trim();
      if (t) {
        const filtered = bobbaize(t);
        const bobbas = (filtered.match(/bobba/g) || []).length;
        if (bobbas) bumpStat("bobbas", bobbas);
        habboSay(ch.id, filtered);
        netSend("chat", { charId: ch.id, text: filtered });
        input.value = "";
      }
      input.focus();
    };
    bar.querySelector("button").addEventListener("click", say);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") say(); if (e.key === "Escape") selectHabbo(habboSelected); });
    if (focusChat || hadFocus) setTimeout(() => { if (input.isConnected) input.focus({ preventScroll: true }); }, 60);
  }
}
function banHabbo(id) {
  const wasBanned = currentPlayer().eliminated.has(id);
  if (!wasBanned) bumpStat("habboBans");
  // Set selection BEFORE the re-render toggleEliminated triggers: a fresh ban drops them into the
  // void and deselects (camera pulls back); readmitting refocuses them as they walk back in.
  habboSelected = wasBanned ? id : null;
  toggleEliminated(id);
}
// Banned avatars get thrown OUT of the room into the black void below it - greyed out, and tappable
// to readmit them (they keep their habboPos tile reserved, so they walk back to their old spot).
function renderHabboVoid(banned) {
  els.characterBoard.querySelector(".habbo-void")?.remove();
  if (!banned || !banned.length) return;
  const strip = document.createElement("div");
  strip.className = "habbo-void";
  const row = document.createElement("div");
  row.className = "hb-void-row";
  banned.forEach((ch) => {
    const a = state.global.mystery.assignments[ch.id] || {};
    const face = habboFaceSrc(a);
    const b = document.createElement("button");
    b.type = "button"; b.className = "hb-void-fig"; b.dataset.id = ch.id;
    b.title = `Readmit ${displayName(ch)}`;
    b.innerHTML = `<img src="${face || a.head || ch.image}" alt=""><span class="hb-void-name">${escapeHtml(displayName(ch))}</span>`;
    b.addEventListener("click", (e) => { e.stopPropagation(); banHabbo(ch.id); });
    row.appendChild(b);
    if (!face && a.head) pixelateSrc(a.head, 34, (url) => { const img = b.querySelector("img"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
  });
  strip.innerHTML = `<span class="hb-void-label">🚫 BANNED — tap to readmit</span>`;
  strip.appendChild(row);
  els.characterBoard.appendChild(strip);
}
// The Habbo word filter: random words become "bobba", exactly like the hotel's censor - the joke is
// that it fires on completely innocent words, and the table has to guess what was really said.
// PG mode censors MORE aggressively (it's a children's hotel, after all). Local randomness is fine:
// the text is bobba-ized once at send time and travels the wire already censored.
function bobbaize(text) {
  const rate = state.settings.pg ? 0.45 : 0.28;
  const words = String(text).split(/(\s+)/);
  const out = words.map((w) => {
    if (!w.trim() || w.length < 3) return w;
    if (Math.random() >= rate) return w;
    const tail = /[.,!?…]+$/.exec(w);
    return "bobba" + (tail ? tail[0] : "");
  });
  // Never censor the whole message into nothing but bobba... actually, sometimes that's funnier.
  return out.join("");
}
// Habbo chat: the new bubble lands at the head; older ones float upward and expire.
function habboSay(id, text) {
  const el = habboCtx?.figEls.get(id);
  if (!el) return;
  el.querySelectorAll(".hb-bubble").forEach((b) => {
    const lift = (Number(b.dataset.lift) || 0) + 1;
    if (lift > 2) { b.remove(); return; }
    b.dataset.lift = String(lift);
    b.style.setProperty("--lift", lift);
  });
  const bub = document.createElement("span");
  bub.className = "hb-bubble";
  bub.innerHTML = `<b>${escapeHtml(characterById(id)?.name || "???")}:</b> ${escapeHtml(text)}`;
  el.appendChild(bub);
  setTimeout(() => { bub.classList.add("hb-bubble-out"); setTimeout(() => bub.remove(), 350); }, 12000);
}
// An L-shaped path along the grid (columns first, then rows). Each hop is to an ADJACENT tile, which
// on screen is a pure isometric diagonal - so the avatar walks the grid like a real Habbo, turning at
// the corner, instead of sliding straight across the room.
function habboPath(c0, r0, c1, r1) {
  const path = []; let c = c0, r = r0;
  while (c !== c1) { c += Math.sign(c1 - c); path.push({ col: c, row: r }); }
  while (r !== r1) { r += Math.sign(r1 - r); path.push({ col: c, row: r }); }
  return path;
}
// Real pathfinding around the furniture: BFS over the grid (4-directional), never stepping on a
// furni tile. Guests walk AROUND the sofa like actual Habbos. Returns null only when the target
// is genuinely unreachable (fully walled in).
function habboPathAvoiding(c0, r0, c1, r1) {
  if (c0 === c1 && r0 === r1) return null;
  const key = (c, r) => `${c},${r}`;
  const prev = new Map([[key(c0, r0), null]]);
  const queue = [[c0, r0]];
  while (queue.length) {
    const [c, r] = queue.shift();
    if (c === c1 && r === r1) {
      const path = [];
      let k = key(c1, r1);
      while (prev.get(k)) {
        const [pc, pr] = k.split(",").map(Number);
        path.unshift({ col: pc, row: pr });
        k = prev.get(k);
      }
      return path;
    }
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nc = c + dc, nr = r + dr, nk = key(nc, nr);
      if (nc < 0 || nc >= HABBO_GW || nr < 0 || nr >= HABBO_GH) continue;
      if (prev.has(nk) || habboBlocked.has(nk)) continue;
      prev.set(nk, key(c, r));
      queue.push([nc, nr]);
    }
  }
  return null;
}
function habboWalk(id, col, row) {
  if (!habboCtx) return;
  if (habboBlocked.has(`${col},${row}`)) return;   // that tile's got furni on it
  for (const [oid, p] of habboPos) if (oid !== id && p.col === col && p.row === row) return; // tile taken
  const el = habboCtx.figEls.get(id);
  const cur = habboPos.get(id);
  if (!el || !cur || el.classList.contains("is-down")) return;
  const path = habboPathAvoiding(cur.col, cur.row, col, row);
  if (!path || !path.length) return;
  habboPos.set(id, { col, row });                      // final tile (kept for persistence)
  const token = (el._walk = (el._walk || 0) + 1);      // cancels any walk already in progress
  const STEP = 360;                                    // one Habbo beat per tile
  el.classList.add("walking");
  updateHabboFigSprite(el);                            // swap to the walk frame set
  let i = 0, prevX = habboIso(cur.col, cur.row).x;
  const stepTo = () => {
    if (el._walk !== token) return;
    if (i >= path.length) { el.classList.remove("walking"); updateHabboFigSprite(el); return; }   // arrived: stop the gait
    const s = path[i]; const p = habboIso(s.col, s.row);
    // Habbos face the way they're walking - flip at every turn of the L-path.
    if (p.x !== prevX) {
      el.classList.toggle("hb-face-l", p.x < prevX);
      el.classList.toggle("hb-face-r", p.x > prevX);
      updateHabboFigSprite(el);                        // real directional sprite, not a CSS mirror
    }
    prevX = p.x;
    el.style.transitionDuration = `${STEP}ms`;
    el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px)`;
    el.style.zIndex = String(100 + s.col + s.row);
    if (habboSelected === el.dataset.id) habboCamera(el.dataset.id);   // camera follows the walk
    i++;
    setTimeout(stepTo, STEP);
  };
  stepTo();
}
function habboMoveTo(col, row) { if (habboSelected) habboWalk(habboSelected, col, row); }
// Idle wander: every few seconds a random unselected habbo strolls a tile or two, so the room reads
// as a real populated Habbo hotel instead of a museum of statues.
function habboWander() {
  if (state.global.mystery?.id !== "habbo" || !habboCtx) return;
  const ids = [...habboCtx.figEls.keys()].filter((id) => id !== habboSelected && !habboCtx.figEls.get(id)?.classList.contains("is-down"));
  if (!ids.length) return;
  const id = ids[Math.floor(Math.random() * ids.length)];
  const el = habboCtx.figEls.get(id);
  const cur = habboPos.get(id);
  if (!el || !cur || el.classList.contains("walking")) return;
  const taken = new Set([...habboPos.entries()].filter(([oid]) => oid !== id).map(([, p]) => `${p.col},${p.row}`));
  const opts = [];
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    const c = cur.col + dc, r = cur.row + dr;
    if ((dc || dr) && Math.abs(dc) + Math.abs(dr) <= 2 && c >= 0 && c < HABBO_GW && r >= 0 && r < HABBO_GH && !taken.has(`${c},${r}`) && !habboBlocked.has(`${c},${r}`)) opts.push({ c, r });
  }
  if (opts.length) { const t = opts[Math.floor(Math.random() * opts.length)]; habboWalk(id, t.c, t.r); }
}

const habboWallpaperCache = new Map();
function habboLocationBannerSrc() {
  const slug = state.location && state.location.slug;
  if (!slug) return "";
  return `${LOCATION_ART_DIR}/${slug}_${state.locationVariant || "day"}_banner.png`;
}
function applyHabboWallpaper(wall) {
  const src = habboLocationBannerSrc();
  if (!src || !wall) return;
  const apply = (url) => {
    wall.style.setProperty("--hb-wallpaper", `url('${url}')`);
    wall.classList.add("hbw-wallpaper");
  };
  if (habboWallpaperCache.has(src)) { apply(habboWallpaperCache.get(src)); return; }
  const im = new Image();
  im.onload = () => {
    const W = 64, H = 28;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(im, 0, 0, W, H);
    try {
      const d = x.getImageData(0, 0, W, H);
      const a = d.data;
      for (let i = 0; i < a.length; i += 4) {
        a[i] = Math.round(a[i] / 32) * 32;
        a[i + 1] = Math.round(a[i + 1] / 32) * 32;
        a[i + 2] = Math.round(a[i + 2] / 32) * 32;
      }
      x.putImageData(d, 0, 0);
    } catch (e) { /* tainted - keep the low-res draw without quantising */ }
    const url = c.toDataURL("image/png");
    habboWallpaperCache.set(src, url);
    apply(url);
  };
  im.onerror = () => {};
  im.src = src;
}
// In Habbo mode the location banner gets crunched down to chunky pixels + quantised colours so the
// whole top of the screen reads as one pixel-art scene. Restored when the mode ends.
function habboizeBanner(on) {
  const photo = document.querySelector(".location-photo");
  if (!photo) return;
  if (!on) {
    if (photo.dataset.origBg) { photo.style.backgroundImage = photo.dataset.origBg; photo.style.removeProperty("image-rendering"); delete photo.dataset.origBg; }
    return;
  }
  if (photo.dataset.origBg) return;   // already pixelated
  const m = /url\("?([^")]+)"?\)/.exec(photo.style.backgroundImage);
  if (!m) return;
  photo.dataset.origBg = photo.style.backgroundImage;
  const im = new Image();
  im.onload = () => {
    const W = 144, H = 48;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(im, 0, 0, W, H);
    try {
      const d = x.getImageData(0, 0, W, H); const a = d.data;
      for (let i = 0; i < a.length; i += 4) { a[i] = Math.round(a[i] / 36) * 36; a[i + 1] = Math.round(a[i + 1] / 36) * 36; a[i + 2] = Math.round(a[i + 2] / 36) * 36; }
      x.putImageData(d, 0, 0);
    } catch (e) { /* tainted - skip quantise */ }
    if (photo.dataset.origBg) {   // still in habbo mode
      photo.style.backgroundImage = `url('${c.toDataURL()}')`;
      photo.style.imageRendering = "pixelated";
    }
  };
  im.src = decodeURI(m[1]);
}

// ===== Furni: scraped icon props placed deterministically around the room =====
// 7-12 floor props + 1-3 wall props, seeded from the salt + location so every client (and every
// re-render) hangs the same room. Floor props claim their tile in habboBlocked - figures can't
// stand there and walks route around them. If habbo-assets.js isn't present the room simply stays
// its classic CSS-art self.
// Curated-catalogue room dressing: props come ONLY from assets/habbo/habbo-room-catalogue.json via
// window.HabboRooms.pick (deterministic per salt + location, locationAliases decide the category,
// hotel->park fallback). background pieces hang on the walls; large/medium/small sit on tiles,
// claim habboBlocked, and may never split the walkable floor.
function renderHabboCatalogueFurni(room, wallL, wallR) {
  const locName = (state.location && state.location.name) || "";
  const seedBase = `${state.gameSalt}:habbofurni:${locName.toLowerCase()}`;
  const picked = window.HabboRooms.pick(locName, seedBase, stableHash);
  if (!picked || !picked.items.length) return;
  const keepsFloorConnected = (cand) => {
    const blocked = new Set(habboBlocked); blocked.add(cand);
    let start = null, free = 0;
    for (let r = 0; r < HABBO_GH; r++) for (let c = 0; c < HABBO_GW; c++) {
      if (!blocked.has(`${c},${r}`)) { free++; if (!start) start = [c, r]; }
    }
    if (!start) return false;
    const seen = new Set([`${start[0]},${start[1]}`]);
    const queue = [start];
    while (queue.length) {
      const [c, r] = queue.pop();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr, k = `${nc},${nr}`;
        if (nc < 0 || nc >= HABBO_GW || nr < 0 || nr >= HABBO_GH || seen.has(k) || blocked.has(k)) continue;
        seen.add(k); queue.push([nc, nr]);
      }
    }
    return seen.size === free;
  };
  const layer = document.createElement("div");
  layer.className = "habbo-furni-layer";
  let wallFlip = stableHash(`${seedBase}:wf`) % 2;
  picked.items.forEach((item, i) => {
    if (item.size === "background") {
      const host = (wallFlip++ % 2) ? wallR : wallL;
      const img = document.createElement("img");
      img.className = "hb-furni hb-furni-wall";
      img.src = item.path; img.alt = ""; img.draggable = false;
      img.style.left = `${8 + (stableHash(`${seedBase}:wx${i}`) % 62)}%`;
      img.style.top = `${14 + (stableHash(`${seedBase}:wy${i}`) % 30)}px`;
      host.appendChild(img);
      return;
    }
    let c = stableHash(`${seedBase}:fc${i}`) % HABBO_GW;
    let r = stableHash(`${seedBase}:fr${i}`) % HABBO_GH;
    let tries = 0;
    while ((habboBlocked.has(`${c},${r}`) || !keepsFloorConnected(`${c},${r}`)) && tries < HABBO_GW * HABBO_GH) {
      c = (c + 1) % HABBO_GW;
      if (c === 0) r = (r + 1) % HABBO_GH;
      tries++;
    }
    if (habboBlocked.has(`${c},${r}`) || !keepsFloorConnected(`${c},${r}`)) return;
    habboBlocked.add(`${c},${r}`);
    const p = habboIso(c, r);
    const img = document.createElement("img");
    img.className = `hb-furni hb-furni-floor hb-furni-${item.size}`;
    img.src = item.path; img.alt = ""; img.draggable = false;
    img.title = item.label;
    img.style.left = `${p.x.toFixed(0)}px`;
    img.style.top = `${p.y.toFixed(0)}px`;
    img.style.zIndex = String(100 + c + r);   // same sort space as the figures
    layer.appendChild(img);
  });
  room.appendChild(layer);
}

function renderHabboFurni(room, wallL, wallR) {
  habboBlocked = new Set();
  // Curated catalogue first; the legacy tag-based pool only remains as a fallback when the
  // catalogue script isn't loaded.
  if (window.HabboRooms && window.HabboRoomCatalogue) { renderHabboCatalogueFurni(room, wallL, wallR); return; }
  const props = window.HabboFurniProps;
  if (!Array.isArray(props) || !props.length) return;
  const locName = ((state.location && state.location.name) || "").toLowerCase();
  const seedBase = `${state.gameSalt}:habbofurni:${locName}`;
  const floorProps = props.filter((p) => p.kind === "floor");
  const wallPool = props.filter((p) => p.kind === "wall");
  if (!floorProps.length) return;
  // The room's furniture suits the venue: gardens get plants, clubs get neon, cafes get food.
  const prefTags = /park|garden|greenhouse|farm|beach|camp|orchard|meadow/.test(locName) ? ["garden", "plant"]
    : /casino|nightclub|club|arcade|karaoke|record|cinema|bowling/.test(locName) ? ["night", "lamp", "rare"]
    : /bakery|cafe|diner|restaurant|kitchen|wine|market/.test(locName) ? ["food", "table", "chair"]
    : /spa|spring|pool|bath|sauna|yoga|gym/.test(locName) ? ["plant", "lamp", "rug"]
    : /library|bookstore|museum|gallery|office|hotel/.test(locName) ? ["table", "chair", "lamp", "misc"]
    : ["chair", "sofa", "table", "plant", "lamp"];
  const preferred = floorProps.filter((p) => p.tags.some((t) => prefTags.includes(t)));
  const pool = preferred.length >= 10 ? preferred : preferred.concat(floorProps);
  const layer = document.createElement("div");
  layer.className = "habbo-furni-layer";
  // A prop may never SPLIT the floor: after adding it, every free tile must still reach every
  // other free tile (flood fill), or a guest could spawn walled-in behind the pot plants.
  const keepsFloorConnected = (cand) => {
    const blocked = new Set(habboBlocked); blocked.add(cand);
    let start = null, free = 0;
    for (let r = 0; r < HABBO_GH; r++) for (let c = 0; c < HABBO_GW; c++) {
      if (!blocked.has(`${c},${r}`)) { free++; if (!start) start = [c, r]; }
    }
    if (!start) return false;
    const seen = new Set([`${start[0]},${start[1]}`]);
    const queue = [start];
    while (queue.length) {
      const [c, r] = queue.pop();
      for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const nc = c + dc, nr = r + dr, k = `${nc},${nr}`;
        if (nc < 0 || nc >= HABBO_GW || nr < 0 || nr >= HABBO_GH || seen.has(k) || blocked.has(k)) continue;
        seen.add(k); queue.push([nc, nr]);
      }
    }
    return seen.size === free;
  };
  const nFloor = 7 + (stableHash(`${seedBase}:n`) % 6);   // 7..12 props
  for (let i = 0; i < nFloor; i++) {
    const prop = pool[stableHash(`${seedBase}:f${i}`) % pool.length];
    let c = stableHash(`${seedBase}:fc${i}`) % HABBO_GW;
    let r = stableHash(`${seedBase}:fr${i}`) % HABBO_GH;
    let tries = 0;
    while ((habboBlocked.has(`${c},${r}`) || !keepsFloorConnected(`${c},${r}`)) && tries < HABBO_GW * HABBO_GH) {
      c = (c + 1) % HABBO_GW;
      if (c === 0) r = (r + 1) % HABBO_GH;
      tries++;
    }
    if (habboBlocked.has(`${c},${r}`) || !keepsFloorConnected(`${c},${r}`)) continue;
    habboBlocked.add(`${c},${r}`);
    const p = habboIso(c, r);
    const img = document.createElement("img");
    img.className = "hb-furni hb-furni-floor";
    img.src = prop.path;
    img.alt = ""; img.draggable = false;
    img.style.left = `${p.x.toFixed(0)}px`;
    img.style.top = `${p.y.toFixed(0)}px`;
    img.style.zIndex = String(100 + c + r);   // same sort space as the figures, so overlap stacks right
    layer.appendChild(img);
  }
  // Wall art hangs INSIDE the skewed wall panels, so it follows the room's perspective for free.
  if (wallPool.length) {
    const nWall = 1 + (stableHash(`${seedBase}:w`) % 3);   // 1..3 pieces
    for (let i = 0; i < nWall; i++) {
      const prop = wallPool[stableHash(`${seedBase}:wp${i}`) % wallPool.length];
      const host = (stableHash(`${seedBase}:ws${i}`) % 2) ? wallR : wallL;
      const img = document.createElement("img");
      img.className = "hb-furni hb-furni-wall";
      img.src = prop.path;
      img.alt = ""; img.draggable = false;
      img.style.left = `${8 + (stableHash(`${seedBase}:wx${i}`) % 62)}%`;
      img.style.top = `${16 + (stableHash(`${seedBase}:wy${i}`) % 28)}px`;
      host.appendChild(img);
    }
  }
  room.appendChild(layer);
}

function renderHabboBoard(player) {
  els.characterBoard.classList.add("habbo-board");
  els.characterBoard.setAttribute("aria-label", "Habbo Hotel room");
  const list = sortedBoard();
  const room = document.createElement("div");
  room.className = "habbo-room";
  els.characterBoard.appendChild(room);

  // ===== The room shell: two REAL iso walls meeting at the back corner + a solid floor slab, all
  // themed from the current location (hot spring = teal water room, park = grass, etc). Everything
  // lives inside .habbo-room so the camera zoom carries the whole room. =====
  const wallX = habboIso(0, 0).x;                      // back corner of the diamond
  const EDGE = (HABBO_GW - 1) * (HABBO_TW / 2);         // horizontal run of one wall (252px)
  const RISE = (HABBO_GH - 1) * (HABBO_TH / 2);         // vertical drop of one wall edge (126px)
  const WALL_H = 112;
  const locName = ((state.location && state.location.name) || "").toLowerCase();
  // Every location maps to a minimal room skin. The left wall gets pixel-art wallpaper from the
  // current banner; the right wall stays a flat, location-suitable colour.
  const HABBO_THEMES = [
    [/ski|snow|ice|arctic|lodge|mountain/, { wall: "#6a4a2e", cap: "#8a6742", skirt: "#4a3018", ground: "#dce9f4", tile: "#f4f8fc", tileAlt: "#dfe9f2", side: "#a2b6ca", room: "#141c28", rug: "#a83a3a", rug2: "#7e2626", trim: "#e0b04a" }],
    [/spring|spa|pool|aquarium|bath|sauna/, { wall: "#2e6f78", cap: "#4c99a2", skirt: "#1d4a50", ground: "#7fccc4", tile: "#cdeeea", tileAlt: "#b2e0da", side: "#5f9a94", room: "#12262e", rug: "#1e5a62", rug2: "#174a50", trim: "#7fccc4" }],
    [/beach|pier|ferry|harbou?r|island/, { wall: "#7fc4e8", cap: "#a8dcf4", skirt: "#4a90b8", ground: "#e8d5a0", tile: "#f0e0b4", tileAlt: "#e2cf98", side: "#b8a068", room: "#173042", rug: "#3a86c8", rug2: "#2e6ea6", trim: "#f0e0b4" }],
    [/park|garden|greenhouse|farm|zoo|camp|orchard|meadow|yoga/, { wall: "#7a5a34", cap: "#96754a", skirt: "#59401f", ground: "#57a344", tile: "#6fbf58", tileAlt: "#5da84a", side: "#3f7531", room: "#161f12", rug: "#c8703a", rug2: "#a85a2c", trim: "#e8c87a" }],
    [/casino|nightclub|club|bar\b|arcade|karaoke|cinema|theatre|theater|bowling|record/, { wall: "#3a2a52", cap: "#57407a", skirt: "#241634", ground: "#502e58", tile: "#8a4a94", tileAlt: "#74407e", side: "#3e2044", room: "#120a1a", rug: "#5a3474", rug2: "#49285f", trim: "#c9a44a" }],
    [/bakery|cafe|diner|restaurant|kitchen|market|wine/, { wall: "#b0483a", cap: "#cc6a58", skirt: "#84332a", ground: "#e8ddc8", tile: "#f4ecd8", tileAlt: "#d8cbb0", side: "#b0a488", room: "#241812", rug: "#b0483a", rug2: "#963a2e", trim: "#f4ecd8" }],
    [/rooftop|office|train|airport|station|city|museum|library|bookstore|laundromat|hotel|gym|salon|gallery|tattoo/, { wall: "#5e6472", cap: "#7c828f", skirt: "#41454f", ground: "#8e94a0", tile: "#c2c8d2", tileAlt: "#aeb4c0", side: "#767c88", room: "#141821", rug: "#3a5a8c", rug2: "#2e4870", trim: "#c2c8d2" }]
  ];
  const theme = (HABBO_THEMES.find(([re]) => re.test(locName)) || [null,
    { wall: "#7d87b8", cap: "#99a2cc", skirt: "#565e88", ground: "#c3ae7e", tile: "#d8c79a", tileAlt: "#cbb888", side: "#93805a", room: "#232a4a", rug: "#8c3a3a", rug2: "#742e2e", trim: "#d8b45a" }])[1];
  const varName = { tileAlt: "tile-alt" };
  Object.keys(theme).forEach((k) => els.characterBoard.style.setProperty(`--hb-${varName[k] || k}`, theme[k]));

  // Solid ground slab under the tiles (with a hard extrusion off the two front edges).
  const ground = document.createElement("div");
  ground.className = "hb-ground";
  ground.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${EDGE * 2}" height="${RISE * 2 + 10}" style="position:absolute;left:${wallX - EDGE}px;top:150px" aria-hidden="true">
      <polygon points="${EDGE},${RISE * 2} ${EDGE * 2},${RISE} ${EDGE * 2},${RISE + 9} ${EDGE},${RISE * 2 + 9} 0,${RISE + 9} 0,${RISE}" fill="var(--hb-side)"/>
      <polygon points="${EDGE},0 ${EDGE * 2},${RISE} ${EDGE},${RISE * 2} 0,${RISE}" fill="var(--hb-ground)"/>
    </svg>`;
  // Walls: parallelograms whose bottom edges ride the floor's two back edges exactly (skewY ±26.565°,
  // tan = TH/TW = 0.5). Left wall gets a low-res sampled location wallpaper.
  const wallL = document.createElement("div");
  wallL.className = "hb-wallpanel hbw-left";
  wallL.style.cssText = `left:${wallX - EDGE}px;top:${150 - WALL_H}px;width:${EDGE}px;height:${WALL_H}px`;
  applyHabboWallpaper(wallL);
  const wallR = document.createElement("div");
  wallR.className = "hb-wallpanel hbw-right";
  wallR.style.cssText = `left:${wallX}px;top:${150 - WALL_H}px;width:${EDGE}px;height:${WALL_H}px`;
  room.appendChild(wallL);
  room.appendChild(wallR);
  room.appendChild(ground);

  const floor = document.createElement("div");
  floor.className = "habbo-floor";
  room.appendChild(floor);
  // Clicking empty room (not an avatar, not a walkable tile) drops the camera back out.
  room.addEventListener("click", (e) => {
    if (habboSelected && (e.target === room || e.target === floor || e.target.closest(".hb-ground")
      || e.target.classList.contains("hb-wallpanel") || e.target.classList.contains("habbo-decor")
      || e.target.classList.contains("hb-furni"))) selectHabbo(habboSelected);
  });
  for (let r = 0; r < HABBO_GH; r++) for (let c = 0; c < HABBO_GW; c++) {
    const p = habboIso(c, r);
    const tile = document.createElement("div");
    tile.className = `habbo-tile ${(c + r) % 2 ? "alt" : ""}`.trim();
    tile.style.left = `${p.x}px`; tile.style.top = `${p.y}px`; tile.style.zIndex = String(c + r);
    tile.addEventListener("click", () => habboMoveTo(c, r));
    floor.appendChild(tile);
  }
  // Furnish the room BEFORE anyone picks a spot: floor props claim tiles in habboBlocked.
  renderHabboFurni(room, wallL, wallR);
  // Give any character without a tile a starting spot, strided so they scatter across the whole floor
  // rather than bunching in the back rows. Furni tiles are off-limits; anyone persisted onto a tile
  // that now holds furni (stale pre-furni position) gets re-seated.
  const total = HABBO_GW * HABBO_GH;
  habboPos.forEach((p, id) => { if (habboBlocked.has(`${p.col},${p.row}`)) habboPos.delete(id); });
  const taken = new Set([...habboPos.values()].map((p) => `${p.col},${p.row}`));
  habboBlocked.forEach((key) => taken.add(key));
  const stride = Math.max(1, Math.floor(total / Math.max(1, list.length)));
  let slot = 0;
  list.forEach((ch) => {
    if (habboPos.has(ch.id)) return;
    let idx, c, r, key, tries = 0;
    do { idx = (slot * stride + Math.floor(slot / total)) % total; c = idx % HABBO_GW; r = Math.floor(idx / HABBO_GW); key = `${c},${r}`; slot++; tries++; } while (taken.has(key) && tries < total * 2);
    taken.add(key); habboPos.set(ch.id, { col: c, row: r });
  });
  const figs = document.createElement("div");
  figs.className = "habbo-figs";
  room.appendChild(figs);
  const figEls = new Map();
  list.forEach((ch) => {
    if (player.eliminated.has(ch.id)) return;   // banned avatars leave the room for the void strip
    const a = state.global.mystery.assignments[ch.id] || {};
    const pos = habboPos.get(ch.id);
    const p = habboIso(pos.col, pos.row);
    // Iso facing: instead of staring at the camera, everyone looks diagonally toward the room's
    // centre - pupils shifted sideways+down and a slight head turn, Habbo-style.
    const facing = pos.col >= pos.row ? -1 : 1;   // right half of the room looks left, left half right
    if (ch.traits && window.faceGenerator) {
      try {
        a.head = window.faceGenerator.renderPortrait(ch.seed, {
          ...ch.traits, headOnly: true,
          pupilX: (Number(ch.traits.pupilX) || 0) + facing * 2.6,
          pupilY: (Number(ch.traits.pupilY) || 0) + 1.6
        });
      } catch (e) { /* keep the stock head */ }
    }
    const el = document.createElement("button");
    el.type = "button";
    el.className = `habbo-fig ${facing === 1 ? "hb-face-r" : "hb-face-l"} ${ch.id === habboSelected ? "selected" : ""}`.trim();
    el.dataset.id = ch.id;
    el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px)`;
    el.style.zIndex = String(100 + pos.col + pos.row);
    // The figure: one local Habbo-style pixel sprite (habbo-avatar.js) built from the character's
    // traits. Facing is handled by CSS scaleX on .hb-avatar - never re-rendered mid-walk. Falls back
    // to the classic pixelated-head + CSS-body anatomy if the sprite generator isn't loaded.
    if (a.sprites) {
      // Real directional sprite matching the initial facing (no CSS mirroring - hb-real).
      el.classList.add("hb-real");
      el.innerHTML = `<span class="hb-name">${escapeHtml(displayName(ch))}</span>`
        + `<img class="hb-avatar" src="${habboSpriteSrc(a.sprites, facing === 1, false)}" alt="" draggable="false">`
        + `<span class="hb-shadow"></span>`;
    } else {
      const pants = mixHex(a.shirt || "#4a90e2", "#14161c", 0.45);
      el.innerHTML = `<span class="hb-name">${escapeHtml(displayName(ch))}</span>`
        + `<img class="hb-head" src="${a.head || ch.image}" alt="">`
        + `<span class="hb-body" style="--shirt:${a.shirt || "#4a90e2"};--skin:${skinHexOf(ch)};--pants:${pants}">`
        + `<i class="hb-arm hb-arm-l"></i><i class="hb-arm hb-arm-r"></i><i class="hb-torso"></i>`
        + `<i class="hb-leg hb-leg-l"></i><i class="hb-leg hb-leg-r"></i></span>`
        + `<span class="hb-shadow"></span>`;
    }
    el.addEventListener("click", (e) => { e.stopPropagation(); selectHabbo(ch.id); });
    figs.appendChild(el);
    figEls.set(ch.id, el);
    // Fallback path only: pixelate the head into chunky Habbo pixels once it loads. Crop tight to
    // the head so the pixel budget lands on the face - readable AND properly pixel-art.
    if (!a.avatar && a.head) pixelateSrc(a.head, 36, (url) => { const img = el.querySelector(".hb-head"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
  });
  habboCtx = { figEls, room };
  renderHabboVoid(list.filter((ch) => player.eliminated.has(ch.id)));   // banned avatars in the black void
  if (habboSelected && !figEls.has(habboSelected)) habboSelected = null;
  if (habboSelected) habboCamera(habboSelected);
  renderHabboSelectionUI();
  if (!habboWanderTimer && !lowPowerMode()) habboWanderTimer = setInterval(habboWander, 2600);   // idle strolling
}


// ---- special-boards ----
function renderHouseMap() {
  const mystery = state.global.mystery;
  if (mystery?.id !== "knockoff-manor") {
    els.houseMap.className = "house-map is-hidden";
    els.houseMap.innerHTML = "";
    return;
  }
  els.houseMap.className = "house-map is-hidden";
  els.houseMap.innerHTML = "";
}

function renderKnockoffManorBoard(player) {
  const mystery = state.global.mystery;
  const rooms = mystery.rooms || [];
  els.characterBoard.classList.add("knockoff-manor-board");
  els.characterBoard.setAttribute("aria-label", "MURDER! LIVE! room board");
  rooms.forEach((room) => {
    const roomTile = document.createElement("section");
    roomTile.className = `manor-room-tile ${room.id === mystery.bloodRoomId ? "has-blood" : ""}`.trim();
    roomTile.dataset.room = room.name;
    roomTile.style.setProperty("--room-row", room.row);
    roomTile.style.setProperty("--room-col", room.col);
    roomTile.style.setProperty("--room-row-span", room.rowSpan);
    roomTile.style.setProperty("--room-col-span", room.colSpan);
    roomTile.style.setProperty("--room-tone", room.tone);
    const weapon = room.weaponEmoji
      ? `<span class="manor-weapon wc-${room.weaponCorner || 0}" style="--wtilt:${room.weaponTilt || 0}deg" title="${escapeHtml(room.weaponName || "weapon")}" aria-hidden="true">${escapeHtml(room.weaponEmoji)}</span>`
      : "";
    roomTile.innerHTML = `
      <div class="manor-room-label">
        <span>${escapeHtml(room.name)}</span>
      </div>
      ${room.id === mystery.bloodRoomId ? "<div class=\"blood-splatter\" aria-hidden=\"true\"></div>" : ""}
      ${weapon}
      <div class="manor-room-cards"></div>
    `;
    const cardWrap = roomTile.querySelector(".manor-room-cards");
    state.board
      .filter((character) => mystery.assignments[character.id]?.roomId === room.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((character) => {
        cardWrap.appendChild(createManorCharacterToken(character, player));
      });
    // Rooms accept dragged suspects.
    roomTile.dataset.roomId = room.id;
    roomTile.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; roomTile.classList.add("drop-target"); });
    roomTile.addEventListener("dragleave", () => roomTile.classList.remove("drop-target"));
    roomTile.addEventListener("drop", (e) => {
      e.preventDefault(); roomTile.classList.remove("drop-target");
      const cid = e.dataTransfer.getData("text/plain");
      if (cid) manorMoveTo(cid, room.id);
    });
    els.characterBoard.appendChild(roomTile);
  });
  startManorLoop();
}

// Live theatre: every ~10s one (non-eliminated) suspect wanders into a different room, so the board
// is never static - "someone's on the move". Local-only cosmetic drift (like Habbo's idle wander), so
// it's not synced; manual drags still route through manorMoveTo. Cleared on teardown / mode change.
let manorLoopTimer = null;
function stopManorLoop() { if (manorLoopTimer) { clearInterval(manorLoopTimer); manorLoopTimer = null; } }
function startManorLoop() {
  stopManorLoop();
  if (state.gameMode === "online" || lowPowerMode()) return;   // no peer drift; no board re-renders in low power
  manorLoopTimer = setInterval(() => {
    const mystery = state.global.mystery;
    if (!mystery || mystery.id !== "knockoff-manor" || !els.characterBoard?.querySelector(".manor-room-tile")) {
      stopManorLoop();
      return;
    }
    const rooms = mystery.rooms || [];
    if (rooms.length < 2) return;
    const player = currentPlayer();
    const movable = state.board.filter((c) => !player.eliminated.has(c.id) && mystery.assignments[c.id]);
    if (!movable.length) return;
    const mover = movable[Math.floor(Math.random() * movable.length)];
    const fromId = mystery.assignments[mover.id].roomId;
    const others = rooms.filter((r) => r.id !== fromId);
    const dest = others[Math.floor(Math.random() * others.length)];
    if (!dest) return;
    mystery.assignments[mover.id].roomId = dest.id;
    mystery.assignments[mover.id].roomName = dest.name;
    state.justMovedManor = mover.id;             // one-shot "just walked in" highlight
    renderBoard();
    state.justMovedManor = null;
  }, 10000);
}


// ---- roulette ----
// Fallback glyphs for any future mode that has not declared one in the registry.
const FALLBACK_GLYPHS = ["✦", "⚛", "⬢", "✶", "⟁", "⌖", "☯", "⚙", "❖", "⌬", "☄", "⊛"];

// Spin a slot-machine of abstract symbols at the start of a round; it decelerates onto a random mode,
// flashes chaotically, then reveals + applies it. done(id) fires with the chosen mode id (or null).
function spinModeRoulette(done) {
  const modes = playableMysteryEffects().map((e, i) => ({ id: e.id, name: e.name, glyph: e.glyph || FALLBACK_GLYPHS[i % FALLBACK_GLYPHS.length], hue: (i * 47) % 360 }));
  modes.push({ id: null, name: "No Effect", glyph: "∅", hue: 210 });
  // Lands on the no-repeat bag pick (shared via the start message); legacy fallback: salt hash.
  const targetId = state.wheelPick !== undefined ? state.wheelPick : wheelTarget();
  markWheelSeen(targetId);
  const target = modes.find((m) => m.id === targetId) || modes[modes.length - 1];
  const targetPos = modes.indexOf(target);
  const CELL = 112, REPS = 9;
  let cells = [];
  for (let r = 0; r < REPS; r++) cells = cells.concat(modes);
  const landIndex = (REPS - 1) * modes.length + targetPos;

  document.querySelectorAll(".roulette-overlay").forEach((o) => o.remove());
  const overlay = document.createElement("div");
  overlay.className = "roulette-overlay";
  overlay.innerHTML = `
    <div class="roulette-box">
      <p class="roulette-title">Spinning the Wheel of Fate…</p>
      <div class="roulette-window">
        <div class="roulette-marker"></div>
        <div class="roulette-strip">${cells.map((m) => `<div class="roulette-cell" style="--hue:${m.hue}">${m.glyph}</div>`).join("")}</div>
      </div>
      <p class="roulette-reveal" aria-live="polite"></p>
    </div>`;
  document.body.appendChild(overlay);
  const strip = overlay.querySelector(".roulette-strip");
  const win = overlay.querySelector(".roulette-window");
  const center = win.clientWidth / 2;
  const jitter = (Math.random() - 0.5) * (CELL * 0.5);
  const finalX = -(landIndex * CELL + CELL / 2 - center + jitter);
  strip.style.transform = "translateX(0)";
  if (window.Sound) window.Sound.spinTicks(4500, 36, 420);   // fast-then-slow ticks match the deceleration
  requestAnimationFrame(() => {
    strip.style.transition = "transform 4.5s cubic-bezier(.1,.62,.2,1)";
    strip.style.transform = `translateX(${finalX}px)`;
  });
  // Drive the reveal off a timer (matches the 3.4s spin) rather than transitionend, which can be
  // dropped if the element is laid out late.
  setTimeout(() => {
    if (!overlay.isConnected) return;
    const rev = overlay.querySelector(".roulette-reveal");
    rev.textContent = target.id ? target.name : "NO EFFECT — clean round";
    rev.style.setProperty("--hue", target.hue);
    overlay.classList.add("is-landed", "is-flash");
    setTimeout(() => { overlay.remove(); done(target.id); }, 1800);
  }, 4600);
}

function applyMysteryEffect(effectId) {
  clearMysteryEffectUI();
  const effect = mysteryRegistry[effectId];
  if (!effect) return;
  if (typeof markModeDiscovered === "function") markModeDiscovered(effectId);   // collection meta
  state.global.mystery = effect.apply(effect);
}

function reapplyCurrentMystery() {
  const effect = currentMysteryEffect();
  if (!effect || typeof effect.apply !== "function") return null;
  state.global.mystery = effect.apply(effect);
  return state.global.mystery;
}

function clearMysteryEffectUI() {
  runModeTeardowns();
  state.global.mystery = null;
  els.characterBoard?.classList.remove(...MODE_BOARD_CLASSES);
  document.body.classList.remove(...MODE_BODY_CLASSES);
  document.querySelectorAll(
    ".roulette-overlay, #effectBlast, .effect-blast, .pb-overlay, .tug-overlay, .wed-overlay, " +
    ".reel-overlay, .keep-abort, .breed-overlay, .new-thinking, .prop-swap-flash, .flash-toast"
  ).forEach((el) => el.remove());
  if (els.mysteryResult) els.mysteryResult.textContent = "";
}

function currentMysteryEffect() {
  return state.global.mystery ? mysteryRegistry[state.global.mystery.id] || null : null;
}

function runModeTeardowns() {
  mysteryEffects.forEach((effect) => {
    if (typeof effect.teardown !== "function") return;
    try { effect.teardown(); } catch (error) { /* keep teardown best-effort */ }
  });
}

function cleanupPs1Mode() {
  if (ps1Cleanup) { ps1Cleanup(); ps1Cleanup = null; }
}

function renderModeHouseMap() {
  const effect = currentMysteryEffect();
  if (effect && typeof effect.renderHouseMap === "function") {
    effect.renderHouseMap();
    return;
  }
  if (!els.houseMap) return;
  els.houseMap.className = "house-map is-hidden";
  els.houseMap.innerHTML = "";
}

function beforeRenderModeBoard() {
  resetTransientBoardRenders();
  habboizeBanner(currentMysteryEffect()?.id === "habbo");
}

function resetTransientBoardRenders() {
  const modeId = currentMysteryEffect()?.id;
  stopHeadsAnim();
  if (modeId !== "pixall") stopPixallLoop();
  if (modeId !== "sims") stopSimsLoop();
  if (modeId !== "linkedin") resetLinkedinTicker();
  if (modeId !== "neighbourhood-watch") resetNwTicker();
  stopPropLoop();
}

function renderSpecialModeBoard(player) {
  const effect = currentMysteryEffect();
  if (!effect || typeof effect.renderBoard !== "function") return false;
  effect.renderBoard(player);
  return true;
}

function applyModeBoardClasses(board) {
  const effect = currentMysteryEffect();
  board.classList.remove(...MODE_BOARD_CLASSES);
  document.body.classList.remove(...MODE_BODY_CLASSES);
  (effect?.boardClasses || []).forEach((className) => board.classList.add(className));
  (effect?.bodyClasses || []).forEach((className) => document.body.classList.add(className));
}

function afterDefaultModeBoard(player) {
  const effect = currentMysteryEffect();
  if (effect && typeof effect.afterDefaultBoard === "function") effect.afterDefaultBoard(player);
}

function defaultModeSortedBoard() {
  const effect = currentMysteryEffect();
  return typeof effect?.defaultSort === "function" ? effect.defaultSort() : null;
}

function modeSorts(modeId) {
  return (mysteryRegistry[modeId]?.sorts || []);
}

function decorateModeLocation(context) {
  const effect = currentMysteryEffect();
  return typeof effect?.decorateLocation === "function" ? effect.decorateLocation(context) : context;
}

function afterRenderModeSecret(context) {
  const effect = currentMysteryEffect();
  if (typeof effect?.afterRenderSecret === "function") effect.afterRenderSecret(context);
}

function prepareModeCardRender(context) {
  const effect = currentMysteryEffect();
  const prepared = { ...context, classes: [], overlayHtml: "" };
  if (typeof effect?.prepareCard === "function") return effect.prepareCard(prepared) || prepared;
  return prepared;
}

function flashForCurrentMode() {
  return currentMysteryEffect()?.flash || "#ffbe0b";
}

function randomMysteryEffect() {
  const playable = playableMysteryEffects();
  const pool = state.settings.pg ? playable.filter((effect) => effect.pgSafe) : playable;
  return pool[Math.floor(Math.random() * pool.length)] || null;
}

const MysteryModes = {
  registry: mysteryRegistry,
  effects: mysteryEffects,
  all: () => playableMysteryEffects(),
  allRegistered: () => mysteryEffects,
  byId: (id) => mysteryRegistry[id] || null,
  current: currentMysteryEffect,
  isPgSafe: (id) => !!mysteryRegistry[id]?.pgSafe,
  randomEffect: randomMysteryEffect,
  modeSorts,
  defaultSortedBoard: defaultModeSortedBoard,
  renderHouseMap: renderModeHouseMap,
  beforeRenderBoard: beforeRenderModeBoard,
  renderSpecialBoard: renderSpecialModeBoard,
  applyBoardClasses: applyModeBoardClasses,
  afterDefaultBoard: afterDefaultModeBoard,
  decorateLocation: decorateModeLocation,
  afterRenderSecret: afterRenderModeSecret,
  prepareCardRender: prepareModeCardRender,
  applyMysteryEffect,
  clearMysteryEffectUI,
  reapplyCurrentMystery,
  wheelTarget,
  wheelTargetFromBag,
  markWheelSeen,
  spinModeRoulette,
  flashForCurrentMode,
  pgSafeModes: () => PG_SAFE_MODES.slice(),
  wheelTiers: () => WHEEL_TIERS.map((tier) => tier.slice()),
  wokePrereqs: () => WOKE_PREREQS.slice()
};

window.MysteryModes = MysteryModes;
window.mysteryEffects = mysteryEffects;
window.PG_SAFE_MODES = PG_SAFE_MODES;
window.WHEEL_TIERS = WHEEL_TIERS;
window.WOKE_PREREQS = WOKE_PREREQS;

function sortJudgementBoard() {
  if (state.global.mystery?.id !== "judgement") return null;
  const rank = { HEAVEN: 0, PURGATORY: 1, HELL: 2 };
  const vOf = (character) => rank[state.global.mystery.assignments?.[character.id]?.verdict] ?? 1;
  return [...state.board].sort((a, b) => vOf(a) - vOf(b) || a.name.localeCompare(b.name));
}

function decorateGayFroggedLocation(context) {
  return {
    ...context,
    classes: [...(context.classes || []), "is-gay-frogged"],
    description: context.location.gayPrompt || context.description,
    titlePrefixHtml: '<span class="gay-frogged-label">GAY</span> ',
    rainbowHtml: '<div class="location-rainbow" aria-hidden="true"></div>'
  };
}

function decorateYugiohLocation(context) {
  const flavor = yugiohLocationFlavor(context.location);
  return {
    ...context,
    classes: [...(context.classes || []), "is-yugioh"],
    name: `${context.location.name} ${flavor.suffix}`,
    description: flavor.text,
    eyebrow: "Field Spell · Activated",
    stamp: "FIELD"
  };
}

function pixelateHabboSecret({ card, character }) {
  const img = card?.querySelector(".portrait-wrap > img");
  if (!img) return;
  const a = character ? (state.global.mystery?.assignments?.[character.id] || {}) : {};
  const face = habboFaceSrc(a);
  if (face) {                       // real front-facing Habbo avatar, zoomed onto the head - no filter
    img.style.imageRendering = "pixelated";
    img.style.objectFit = "cover";
    img.style.objectPosition = "50% 22%";
    img.style.transform = "scale(1.65)";
    img.style.transformOrigin = "center";
    img.src = face;
    return;
  }
  if (img.src) {                    // fallback: crunch the generated portrait into Habbo pixels
    img.style.imageRendering = "pixelated";
    pixelateSrc(img.src, 40, (url) => { if (img.isConnected) img.src = url; });
  }
}

function prepareYugiohCard(context) {
  if (state.justEliminated === context.character.id) context.card.classList.add("ygo-flip");
  if (state.justRestored === context.character.id) context.card.classList.add("ygo-unflip");
  return context;
}

function prepareSwipeCard(context) {
  if (state.justEliminated === context.character.id) context.card.classList.add("swipe-nope");
  if (state.justRestored === context.character.id) context.card.classList.add("swipe-like");
  return context;
}

function prepareFireworksCard(context) {
  const { card, character, player } = context;
  const popping = state.justEliminated === character.id;
  let portraitSrc = context.portraitSrc;
  let overlayHtml = "";
  if (popping) card.classList.add("is-fireworks-pop");
  const fwHeadless = player.eliminated.has(character.id) && character.traits && window.faceGenerator;
  if (fwHeadless) {
    const render = (extra) => window.faceGenerator.renderPortrait(character.seed, { ...character.traits, ...extra });
    portraitSrc = render({ noHead: true });
    card.classList.add("fw-headless");
  }
  if (popping && character.traits && window.faceGenerator) {
    const render = (extra) => window.faceGenerator.renderPortrait(character.seed, { ...character.traits, ...extra });
    const headSrc = render({ headOnly: true });
    const palettes = [
      ["#ff4d6d", "#ffd24d", "#fff27a"], ["#4dd2ff", "#5dff8f", "#c8fff2"],
      ["#c46bff", "#ff5ad0", "#ffd0f4"], ["#ff8a4d", "#ffd24d", "#ff4d3a"],
      ["#5dff8f", "#c8ff5a", "#f2ffc8"], ["#fff27a", "#ffffff", "#ffd24d"]
    ];
    const fh = (salt) => stableHash(character.id + ":" + salt);
    const palette = palettes[fh("fwpal") % palettes.length];
    const style = ["ring", "willow", "crackle", "star"][fh("fwsty") % 4];
    const spark = (ang, dist, opts = {}) => {
      const size = opts.size != null ? opts.size : 0.7 + (fh("fwsz" + ang + dist) % 60) / 100;
      return `<i style="--tx:${Math.round(Math.cos(ang) * dist)}px;--ty:${Math.round(Math.sin(ang) * dist)}px;`
        + `--ps:${size.toFixed(2)};--gy:${opts.droop || 0}px;--pd:${(opts.delay || 0).toFixed(2)}s;--pdur:${(opts.dur || 0.85).toFixed(2)}s;`
        + `background:${opts.col || palette[fh("fwc" + ang) % palette.length]}"></i>`;
    };
    let parts = "";
    if (style === "ring") {
      for (let i = 0; i < 14; i++) parts += spark((i / 14) * Math.PI * 2, 58 + (fh("r" + i) % 10), { col: palette[0] });
      for (let i = 0; i < 9; i++) parts += spark((i / 9) * Math.PI * 2 + 0.3, 30, { col: palette[1], size: 0.6, delay: 0.08 });
    } else if (style === "willow") {
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2 + (fh("w" + i) % 10) / 30;
        parts += spark(ang, 40 + (fh("wd" + i) % 34), { droop: 34 + (fh("wg" + i) % 26), dur: 1.5, size: 0.8 });
      }
    } else if (style === "crackle") {
      for (let i = 0; i < 10; i++) parts += spark((i / 10) * Math.PI * 2, 44 + (fh("c" + i) % 14));
      for (let i = 0; i < 14; i++) {
        const ang = (fh("ca" + i) % 628) / 100;
        parts += spark(ang, 52 + (fh("cd" + i) % 30), { size: 0.45, delay: 0.22 + (fh("cy" + i) % 20) / 100, col: palette[2] });
      }
    } else {
      for (let s = 0; s < 5; s++) for (let k = 1; k <= 3; k++) {
        const ang = (s / 5) * Math.PI * 2 - Math.PI / 2;
        parts += spark(ang, 26 * k, { size: 1.15 - k * 0.25, delay: k * 0.06, col: palette[k - 1] });
      }
    }
    let blood = "";
    for (let i = 0; i < 14; i++) {
      const ang = -Math.PI / 2 + (i / 14 - 0.5) * 2.2;
      const dist = 26 + (i % 5) * 12;
      const dly = (i % 6) * 0.07;
      blood += `<b style="--bx:${Math.round(Math.cos(ang) * dist)}px;--by:${Math.round(Math.sin(ang) * dist)}px;--bd:${dly.toFixed(2)}s"></b>`;
    }
    overlayHtml = `<div class="fw" aria-hidden="true">`
      + `<img class="fw-head" src="${headSrc}" alt="">`
      + `<div class="fw-blood">${blood}</div>`
      + `<div class="fw-burst">${parts}</div><div class="fw-flash"></div></div>`;
  }
  return { ...context, portraitSrc, overlayHtml };
}


// ---- mode-logic ----
function createManorCharacterToken(character, player) {
  const token = document.createElement("button");
  const assignment = state.global.mystery?.assignments[character.id];
  const inBlood = assignment?.roomId && assignment.roomId === state.global.mystery?.bloodRoomId;
  token.type = "button";
  token.id = `token-${character.id}`;
  // Demeanor is the suspect's OWN tell (nervous / shifty / calm), independent of which room they're in.
  const demeanor = assignment?.demeanor || "shifty";
  const justMoved = state.justMovedManor === character.id;
  token.className = `manor-token manor-${demeanor} ${inBlood ? "in-blood" : ""} ${justMoved ? "just-moved" : ""}`.replace(/\s+/g, " ").trim();
  token.classList.toggle("is-down", player.eliminated.has(character.id));
  token.dataset.id = character.id;
  if (assignment?.roomName) token.dataset.houseRoom = assignment.roomName;
  token.setAttribute("aria-label", `${character.name}${assignment?.roomName ? ` in ${assignment.roomName}` : ""}`);
  token.setAttribute("title", `${character.name} — drag between rooms to move a suspect`);
  // Each demeanor animates on its own hashed beat so a roomful never fidgets in lockstep.
  const sway = 2.2 + (stableHash(character.id + ":shift") % 240) / 100;
  const delay = -(stableHash(character.id + ":shiftd") % 3000) / 1000;
  token.style.setProperty("--shift-dur", `${sway.toFixed(2)}s`);
  token.style.setProperty("--shift-delay", `${delay.toFixed(2)}s`);
  token.innerHTML = `
    <img src="${character.image}" alt="">
    ${demeanor === "nervous" ? '<span class="manor-sweat" aria-hidden="true">💧</span>' : ""}
    ${demeanor === "shifty" ? '<span class="manor-eyes" aria-hidden="true">👀</span>' : ""}
    <span class="manor-name">${escapeHtml(character.name)}</span>
  `;
  // Tap crosses off; a real drag relocates the suspect. (manordrag flag set by the drag handler.)
  token.addEventListener("click", () => { if (token.dataset.manordrag) { delete token.dataset.manordrag; return; } toggleEliminated(character.id); });
  wireManorDnD(token, character.id);
  return token;
}
// Drag a suspect from one room onto another to move them (repositioning to reason about alibis).
// The drop target is the room tile the pointer is over.
let manorTouchDrag = null;
const MANOR_TOUCH_HOLD_MS = 350;
function wireManorDnD(token, id) {
  token.draggable = true;
  token.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "move"; token.classList.add("dragging"); token.dataset.manordrag = "1"; });
  token.addEventListener("dragend", () => token.classList.remove("dragging"));
  // Touch: hold first, then finger-drag the token onto another room tile. Moving before the hold
  // stays a normal scroll gesture.
  token.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    manorTouchDrag = {
      id,
      token,
      x: t.clientX,
      y: t.clientY,
      active: false,
      timer: setTimeout(() => {
        if (!manorTouchDrag || manorTouchDrag.id !== id) return;
        manorTouchDrag.active = true;
        token.dataset.manordrag = "1";
        token.classList.add("dragging");
      }, MANOR_TOUCH_HOLD_MS)
    };
  }, { passive: true });
  token.addEventListener("touchmove", (e) => {
    if (!manorTouchDrag) return;
    const t = e.touches[0];
    const movedEnough = Math.abs(t.clientX - manorTouchDrag.x) > 8 || Math.abs(t.clientY - manorTouchDrag.y) > 8;
    if (!manorTouchDrag.active && movedEnough) {
      clearTimeout(manorTouchDrag.timer);
      manorTouchDrag = null;
      return;
    }
    if (!manorTouchDrag.active) return;
    e.preventDefault();
    token.dataset.manordrag = "1";
    token.classList.add("dragging");
    document.querySelectorAll(".manor-room-tile.drop-target").forEach((el) => el.classList.remove("drop-target"));
    const tile = document.elementFromPoint(t.clientX, t.clientY)?.closest(".manor-room-tile");
    if (tile) tile.classList.add("drop-target");
  }, { passive: false });
  token.addEventListener("touchend", (e) => {
    token.classList.remove("dragging");
    document.querySelectorAll(".manor-room-tile.drop-target").forEach((el) => el.classList.remove("drop-target"));
    if (manorTouchDrag) clearTimeout(manorTouchDrag.timer);
    if (manorTouchDrag && manorTouchDrag.active) {
      e.preventDefault();
      const t = e.changedTouches[0];
      const tile = document.elementFromPoint(t.clientX, t.clientY)?.closest(".manor-room-tile");
      if (tile) manorMoveTo(id, tile.dataset.roomId);
    }
    manorTouchDrag = null;
  });
  token.addEventListener("touchcancel", () => {
    if (manorTouchDrag) clearTimeout(manorTouchDrag.timer);
    manorTouchDrag = null;
    token.classList.remove("dragging");
    document.querySelectorAll(".manor-room-tile.drop-target").forEach((el) => el.classList.remove("drop-target"));
  });
}
function manorMoveTo(charId, roomId) {
  const mystery = state.global.mystery;
  if (!mystery || mystery.id !== "knockoff-manor") return;
  const room = (mystery.rooms || []).find((r) => r.id === roomId);
  const asg = mystery.assignments[charId];
  if (!room || !asg || asg.roomId === roomId) return;
  asg.roomId = room.id;
  asg.roomName = room.name;
  netSend("manor-move", { charId, roomId });
  addLog(`A suspect slinked into ${room.name}.`);
  renderBoard();
  scheduleSave();
}

function renderFamilyBoard(player) {
  els.characterBoard.classList.add("family-tree-board");
  const mystery = state.global.mystery;
  const clusters = mystery?.clusters || [];
  clusters.forEach((cluster) => {
    const treeModel = buildFamilyTreeModel(cluster, mystery.assignments);
    const group = document.createElement("section");
    group.className = `family-cluster ${cluster.className}`;
    group.dataset.familyCluster = cluster.id;
    group.innerHTML = `<h3>${escapeHtml(cluster.name)}</h3><div class="family-tree"><svg class="family-tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg></div>`;
    const tree = group.querySelector(".family-tree");
    const svg = tree.querySelector(".family-tree-lines");
    svg.innerHTML = treeModel.paths.map((path) => `<path d="${path}"></path>`).join("");
    treeModel.slots.forEach((slot) => {
      const character = state.board.find((item) => item.id === slot.characterId);
      if (!character) return;
      const node = document.createElement("div");
      node.className = `family-slot family-slot-${slot.key}`;
      node.style.gridColumn = `${slot.col} / span ${slot.span}`;
      node.style.gridRow = String(slot.row);
      node.appendChild(createCharacterCard(character, player));
      tree.appendChild(node);
    });
    // Members beyond the template's slots (in-laws who married in, fresh babies) branch off below the
    // tree instead of silently vanishing.
    const slotted = new Set(treeModel.slots.map((s) => s.characterId));
    const extras = cluster.characterIds.filter((cid) => !slotted.has(cid));
    if (extras.length) {
      const row = document.createElement("div");
      row.className = "family-extras";
      extras.forEach((cid) => {
        const character = state.board.find((item) => item.id === cid);
        if (character) row.appendChild(createCharacterCard(character, player));
      });
      group.appendChild(row);
    }
    els.characterBoard.appendChild(group);
  });
}

function buildFamilyTreeModel(cluster, assignments) {
  const templates = getFamilyTemplates(cluster.characterIds.length);
  const template = templates[stableHash(`${state.gameSalt}:${cluster.id}:template`) % templates.length];
  const slotDefs = template.slotDefs.slice(0, cluster.characterIds.length);
  const slots = assignFamilySlots(cluster, assignments, slotDefs);
  const slotMap = Object.fromEntries(slots.map((slot) => [slot.key, slot]));
  return {
    slots,
    paths: template.buildPaths(slotMap)
  };
}

function getFamilyTemplates(size) {
  const duoBranch = {
    slotDefs: [
      { key: "parentA", row: 1, col: 2, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Step-aunt", "Weird Uncle"] },
      { key: "parentB", row: 1, col: 4, span: 2, prefers: ["Dad", "Mum", "Legal Guardian Maybe", "Step-aunt", "Weird Uncle"] },
      { key: "core", row: 2, col: 3, span: 2, prefers: ["Twin", "Cousin", "Work Nephew", "Family Friend Who Won’t Leave", "Weird Uncle"] },
      { key: "side", row: 2, col: 5, span: 2, prefers: ["Cousin", "Step-aunt", "Weird Uncle", "Family Friend Who Won’t Leave", "Twin"] },
      { key: "baby", row: 3, col: 3, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Twin", "Cousin"] },
      { key: "sideKid", row: 3, col: 5, span: 2, prefers: ["Cousin", "Twin", "Work Nephew", "Baby Somehow"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parentA && slotMap.parentB) {
        const left = familyPoint(slotMap.parentA, "bottom");
        const right = familyPoint(slotMap.parentB, "bottom");
        const joinY = 18;
        const trunkY = 35;
        const midX = (left.x + right.x) / 2;
        paths.push(pathFromPoints([[left.x, joinY], [right.x, joinY]]));
        paths.push(pathFromPoints([[left.x, left.y], [left.x, joinY]]));
        paths.push(pathFromPoints([[right.x, right.y], [right.x, joinY]]));
        if (slotMap.core) {
          const coreTop = familyPoint(slotMap.core, "top");
          paths.push(pathFromPoints([[midX, joinY], [midX, trunkY], [coreTop.x, trunkY], [coreTop.x, coreTop.y]]));
          if (slotMap.side) {
            const sideTop = familyPoint(slotMap.side, "top");
            paths.push(pathFromPoints([[coreTop.x, trunkY], [sideTop.x, trunkY], [sideTop.x, sideTop.y]]));
          }
        }
      }
      if (slotMap.core && slotMap.baby) {
        const coreBottom = familyPoint(slotMap.core, "bottom");
        const babyTop = familyPoint(slotMap.baby, "top");
        paths.push(pathFromPoints([[coreBottom.x, coreBottom.y], [coreBottom.x, babyTop.y], [babyTop.x, babyTop.y]]));
      }
      if (slotMap.side && slotMap.sideKid) {
        const sideBottom = familyPoint(slotMap.side, "bottom");
        const kidTop = familyPoint(slotMap.sideKid, "top");
        paths.push(pathFromPoints([[sideBottom.x, sideBottom.y], [sideBottom.x, kidTop.y], [kidTop.x, kidTop.y]]));
      }
      return paths;
    }
  };
  const singleBranch = {
    slotDefs: [
      { key: "parent", row: 1, col: 3, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Step-aunt", "Weird Uncle"] },
      { key: "left", row: 2, col: 1, span: 2, prefers: ["Weird Uncle", "Step-aunt", "Family Friend Who Won’t Leave", "Cousin"] },
      { key: "core", row: 2, col: 3, span: 2, prefers: ["Twin", "Cousin", "Work Nephew", "Family Friend Who Won’t Leave"] },
      { key: "right", row: 2, col: 5, span: 2, prefers: ["Cousin", "Step-aunt", "Weird Uncle", "Twin"] },
      { key: "child", row: 3, col: 3, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Twin", "Cousin"] },
      { key: "leftChild", row: 3, col: 1, span: 2, prefers: ["Cousin", "Work Nephew", "Baby Somehow", "Twin"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parent) {
        const parentBottom = familyPoint(slotMap.parent, "bottom");
        const lineY = 35;
        const middle = [slotMap.left, slotMap.core, slotMap.right].filter(Boolean);
        if (middle.length) {
          const xs = middle.map((slot) => familyPoint(slot, "top").x).sort((a, b) => a - b);
          paths.push(pathFromPoints([[parentBottom.x, parentBottom.y], [parentBottom.x, lineY], [xs[0], lineY], [xs[xs.length - 1], lineY]]));
          middle.forEach((slot) => {
            const top = familyPoint(slot, "top");
            paths.push(pathFromPoints([[top.x, lineY], [top.x, top.y]]));
          });
        }
      }
      if (slotMap.core && slotMap.child) {
        const coreBottom = familyPoint(slotMap.core, "bottom");
        const childTop = familyPoint(slotMap.child, "top");
        paths.push(pathFromPoints([[coreBottom.x, coreBottom.y], [coreBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      if (slotMap.left && slotMap.leftChild) {
        const leftBottom = familyPoint(slotMap.left, "bottom");
        const childTop = familyPoint(slotMap.leftChild, "top");
        paths.push(pathFromPoints([[leftBottom.x, leftBottom.y], [leftBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      return paths;
    }
  };
  const splitBranch = {
    slotDefs: [
      { key: "parentA", row: 1, col: 2, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Step-aunt"] },
      { key: "parentB", row: 1, col: 4, span: 2, prefers: ["Dad", "Mum", "Legal Guardian Maybe", "Weird Uncle"] },
      { key: "left", row: 2, col: 2, span: 2, prefers: ["Twin", "Cousin", "Weird Uncle", "Family Friend Who Won’t Leave"] },
      { key: "right", row: 2, col: 4, span: 2, prefers: ["Cousin", "Twin", "Step-aunt", "Weird Uncle"] },
      { key: "leftChild", row: 3, col: 1, span: 2, prefers: ["Work Nephew", "Baby Somehow", "Cousin", "Twin"] },
      { key: "rightChild", row: 3, col: 5, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Cousin", "Twin"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parentA && slotMap.parentB) {
        const a = familyPoint(slotMap.parentA, "bottom");
        const b = familyPoint(slotMap.parentB, "bottom");
        const joinY = 18;
        const leftMid = slotMap.left ? familyPoint(slotMap.left, "top") : null;
        const rightMid = slotMap.right ? familyPoint(slotMap.right, "top") : null;
        paths.push(pathFromPoints([[a.x, joinY], [b.x, joinY]]));
        paths.push(pathFromPoints([[a.x, a.y], [a.x, joinY]]));
        paths.push(pathFromPoints([[b.x, b.y], [b.x, joinY]]));
        if (leftMid) paths.push(pathFromPoints([[a.x, joinY], [a.x, 35], [leftMid.x, 35], [leftMid.x, leftMid.y]]));
        if (rightMid) paths.push(pathFromPoints([[b.x, joinY], [b.x, 35], [rightMid.x, 35], [rightMid.x, rightMid.y]]));
      }
      if (slotMap.left && slotMap.leftChild) {
        const leftBottom = familyPoint(slotMap.left, "bottom");
        const childTop = familyPoint(slotMap.leftChild, "top");
        paths.push(pathFromPoints([[leftBottom.x, leftBottom.y], [leftBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      if (slotMap.right && slotMap.rightChild) {
        const rightBottom = familyPoint(slotMap.right, "bottom");
        const childTop = familyPoint(slotMap.rightChild, "top");
        paths.push(pathFromPoints([[rightBottom.x, rightBottom.y], [rightBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      return paths;
    }
  };
  const chainBranch = {
    slotDefs: [
      { key: "parent", row: 1, col: 3, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Family Friend Who Won’t Leave"] },
      { key: "core", row: 2, col: 3, span: 2, prefers: ["Twin", "Cousin", "Work Nephew", "Step-aunt"] },
      { key: "left", row: 3, col: 1, span: 2, prefers: ["Cousin", "Weird Uncle", "Step-aunt", "Family Friend Who Won’t Leave"] },
      { key: "baby", row: 3, col: 3, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Twin", "Cousin"] },
      { key: "right", row: 3, col: 5, span: 2, prefers: ["Cousin", "Twin", "Weird Uncle", "Step-aunt"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parent && slotMap.core) {
        const parentBottom = familyPoint(slotMap.parent, "bottom");
        const coreTop = familyPoint(slotMap.core, "top");
        paths.push(pathFromPoints([[parentBottom.x, parentBottom.y], [parentBottom.x, coreTop.y], [coreTop.x, coreTop.y]]));
      }
      if (slotMap.core) {
        const coreBottom = familyPoint(slotMap.core, "bottom");
        const lower = [slotMap.left, slotMap.baby, slotMap.right].filter(Boolean);
        if (lower.length) {
          const xs = lower.map((slot) => familyPoint(slot, "top").x).sort((a, b) => a - b);
          const lineY = 67;
          paths.push(pathFromPoints([[coreBottom.x, coreBottom.y], [coreBottom.x, lineY], [xs[0], lineY], [xs[xs.length - 1], lineY]]));
          lower.forEach((slot) => {
            const top = familyPoint(slot, "top");
            paths.push(pathFromPoints([[top.x, lineY], [top.x, top.y]]));
          });
        }
      }
      return paths;
    }
  };
  if (size <= 4) return [chainBranch, singleBranch];
  if (size === 5) return [duoBranch, singleBranch, chainBranch];
  return [duoBranch, splitBranch, singleBranch, chainBranch];
}

function assignFamilySlots(cluster, assignments, slotDefs) {
  const remaining = [...cluster.characterIds];
  return slotDefs.map((slot) => {
    const pickIndex = remaining.reduce((best, id, index) => {
      const role = assignments[id]?.role || "";
      const preference = slot.prefers.indexOf(role);
      const score = preference === -1 ? 999 : preference;
      const tiebreak = stableHash(`${cluster.id}:${slot.key}:${id}`);
      if (!best || score < best.score || (score === best.score && tiebreak < best.tiebreak)) {
        return { index, score, tiebreak };
      }
      return best;
    }, null);
    const characterId = remaining.splice(pickIndex?.index ?? 0, 1)[0];
    return { ...slot, characterId };
  });
}

function familyPoint(slot, edge) {
  const x = ((slot.col - 1) + (slot.span / 2)) / 6 * 100;
  const rowBands = {
    1: { top: 7, center: 18, bottom: 29 },
    2: { top: 39, center: 50, bottom: 61 },
    3: { top: 71, center: 82, bottom: 93 }
  };
  const band = rowBands[slot.row] || rowBands[2];
  return { x, y: band[edge] ?? band.center };
}

function pathFromPoints(points) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

// A labelled pain scale from D:< (agony) to :D (fine), over a red-to-green track, with the person's
// level (pain index 0-4, 0 = most pain) highlighted. Used by Disease mode and the woke disease module.
const PAIN_SCALE_FACES = ["D:<", ">:(", ":|", ":)", ":D"];
const PAIN_EXPRESSIONS = ["angry", "sad", "neutral", "happy", "happy"];
function renderPainScale(pain, cid) {
  const faces = PAIN_SCALE_FACES
    .map((f, i) => `<span class="dz-face${i === pain ? " is-here" : ""}" data-pain="${i}">${escapeHtml(f)}</span>`)
    .join("");
  return `<div class="dz-painscale"><span class="dz-painscale-label">PAIN SCALE · drag ↔</span>`
    + `<div class="dz-painscale-faces" data-cid="${cid || ""}">${faces}</div></div>`;
}
// Drag along a pain scale to set that character's pain level - which re-renders their face into the
// matching expression (agony -> angry ... fine -> happy). Updated in place so the drag isn't broken.
function setPain(cid, index) {
  const a = state.global.mystery?.assignments?.[cid];
  if (!a || a.pain === index) return;
  a.pain = index;
  const ch = characterById(cid);
  const card = document.getElementById(`card-${cid}`);
  if (ch && ch.traits && window.faceGenerator) {
    a.image = window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, expression: PAIN_EXPRESSIONS[index] || "neutral" });
    const img = card?.querySelector(".portrait-wrap > img");
    if (img) img.src = a.image;
  }
  card?.querySelectorAll(".dz-painscale-faces .dz-face").forEach((f, i) => f.classList.toggle("is-here", i === index));
}
let painDragCard = null;
function painPointer(e) {
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const scale = under?.closest(".dz-painscale-faces");
  if (!scale || !scale.dataset.cid) return;
  const rect = scale.getBoundingClientRect();
  const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  setPain(scale.dataset.cid, Math.round(t * (PAIN_SCALE_FACES.length - 1)));
}
function wirePainScaleDrag() {
  els.characterBoard.addEventListener("pointerdown", (e) => {
    const scale = e.target.closest(".dz-painscale-faces");
    if (!scale) return;
    e.preventDefault();                                   // stop the card's HTML5 drag / text select
    painDragCard = e.target.closest(".character-card");
    if (painDragCard) painDragCard.draggable = false;     // don't let it start a breed-drag mid-pain-drag
    painPointer(e);
  });
  document.addEventListener("pointermove", (e) => { if (painDragCard) painPointer(e); });
  document.addEventListener("pointerup", () => { if (painDragCard) { painDragCard.draggable = true; painDragCard = null; } });
}

// The round-reveal send-off: one line about the revealed character, in the voice of the mode that
// just ended ("Still going around with that MEGA HYSTERIA."). Generic pool when a mode has no
// bespoke line. Cosmetic only - salt-derived where it picks, so peers read the same epilogue.
const EPILOGUE_GENERIC = [
  "Has gone home to think about what they did.",
  "Will not be answering questions at this time.",
  "Remains, somehow, at large.",
  "Has already told the group chat their version.",
  "Considers this whole round defamatory.",
  "Learned nothing. Absolutely nothing."
];
function modeEpilogue(character) {
  if (!character) return "";
  const m = state.global.mystery;
  const generic = () => EPILOGUE_GENERIC[stableHash(`${state.gameSalt}:epi:${character.id}`) % EPILOGUE_GENERIC.length];
  const a = m && m.assignments ? m.assignments[character.id] : null;
  if (!m || !a) return generic();
  switch (m.id) {
    case "disease": {
      const d = (a.diseases || [])[0];
      if (a.patientZero) return "Patient zero. Still shaking hands at parties.";
      return d ? `Still going around with that ${d.tier} ${String(d.name).toUpperCase()}.` : generic();
    }
    case "drugs": {
      const habit = (a.habits || [])[0];
      return habit ? `Still on the ${habit.name}. "Quitting Monday."` : generic();
    }
    case "linkedin":
      return a.openToWork ? `Remains ${a.otwText || "#OpenToWork"}.` : `Still "${a.title}" at ${a.company}.`;
    case "neighbourhood-watch":
      return a.feudWith ? `The feud with ${a.feudWith} continues. I have footage.` : generic();
    case "orgy":
      return `Body count now ${(a.bodyCount || 0) + 1}. No further comment.`;
    case "astrology":
      return a.sun ? `Blames the whole round on ${a.retro ? "Mercury retrograde" : `being a ${a.sun.name}`}.` : generic();
    case "horny-potter":
      return a.horcrux ? `Their horcrux (${a.horcrux}) remains at large.` : `${a.house} has revoked their common-room privileges.`;
    case "work":
      return `${Math.max(0, (a.days || 1) - 1)} days remaining. The spoon digs on.`;
    case "judgement":
      return a.verdict === "HELL" ? `Still in ${a.location || "the Lake of Fire"}. One star.` :
        a.verdict === "HEAVEN" ? `Watching all of this from ${a.location || "Cloud Nine"}, smugly.` :
        `Still #${(stableHash(`${state.gameSalt}:q:${character.id}`) % 90000 + 10000).toLocaleString()} in the purgatory queue.`;
    case "sims":
      return a.action ? `Last seen ${String(a.action).toLowerCase()}. Needs unmet.` : generic();
    case "swipe":
      return a.ick ? `Unmatched by everyone. The ick: ${String(a.ick).toLowerCase()}.` : generic();
    case "fertility":
      return a.barren ? "Stock remains discontinued." : "Still restocking. Ask about bulk pricing.";
    case "yugioh":
      return a.frame === "trap" || a.frame === "spell" ? "Sent to the graveyard face-down. Rude." : "Added to the banlist for what they did tonight.";
    case "pantone":
      return a.name ? `Discontinued by Pantone. "${a.name}" is no more.` : generic();
    case "habbo":
      return state.settings.pg ? "Banned from the pool for splashing." : "Banned from the pool. You know what for. (bobba)";
    case "gallery":
      return a && a.sold ? `Sold for ${a.price}. The artist saw none of it.` : `Still unsold at ${a && a.price ? a.price : "any price"}. The critics were right.`;
    case "fireworks":
      return "Partially reassembled. The head is still missing.";
    case "knockoff-manor":
      return "Was in the BATHS ROOM the whole time. Allegedly.";
    case "witness-protection-filter":
      return "Relocated. New name, same eyes.";
    case "gay-frogged":
      return "Still glowing. The frogs kept in touch.";
    case "hidden-agendas":
      return "Now polling at 4%. Refuses to concede.";
    case "woke":
      return "Cancelled, cured, relapsed and re-platformed - all before breakfast.";
    default:
      return generic();
  }
}

// Last words: when a character gets flipped down, they sometimes protest - one line, in the voice
// of the active mode, anchored to the card. Local-only (the eliminator hears the complaint; the
// other seat just sees the flip), so Math.random is fine here.
const LAST_WORDS_GENERIC = [
  "I wasn't even THERE.",
  "You'll regret this at the reunion.",
  "Tell my plants I loved them.",
  "This is defamation, actually.",
  "I demand to speak to the board.",
  "Wow. WOW.",
  "I was about to say something important.",
  "My lawyer will flip me back up.",
  "You've made an enemy for life. A small one.",
  "Fine. FINE. I didn't want to be guessed anyway."
];
function modeLastWords(character) {
  const m = state.global.mystery;
  const a = m && m.assignments ? m.assignments[character.id] : null;
  const generic = () => LAST_WORDS_GENERIC[Math.floor(Math.random() * LAST_WORDS_GENERIC.length)];
  if (!m) return generic();
  const roll = Math.random();
  if (roll < 0.35) return generic();   // even in a mode, sometimes they just complain normally
  switch (m.id) {
    case "disease": {
      const d = a && (a.diseases || [])[0];
      return d ? `But it was only ${d.tier} ${d.name}!` : "I was getting BETTER.";
    }
    case "drugs": {
      const habit = a && (a.habits || [])[0];
      return habit ? `The ${habit.name} was for a FRIEND.` : "I can quit being eliminated whenever I want.";
    }
    case "linkedin":
      return a && a.openToWork ? "Eliminated?? I'm putting this on my profile." : "I'd like to connect about this.";
    case "neighbourhood-watch":
      return a && a.feudWith ? `${a.feudWith} put you up to this. I HAVE FOOTAGE.` : "The group will hear about this. With screenshots.";
    case "orgy":
      return "I was told there'd be no judgement here.";
    case "astrology":
      return a && a.sun ? `A ${a.sun.name} would NEVER do this to you.` : "Mercury did this. Not you. Mercury.";
    case "horny-potter":
      return a && a.horcrux ? "Joke's on you. I have a horcrux." : "Avada kedavr— oh.";
    case "work":
      return a ? `${a.days} days left and NOW this.` : "I was almost paroled.";
    case "judgement":
      return a && a.verdict === "HEAVEN" ? "I'll be watching from Cloud Nine. Smugly." : "See you downstairs.";
    case "sims":
      return "Sul sul... sul...";
    case "swipe":
      return "Unmatched?? UNMATCHED???";
    case "fertility":
      return "My stock! My beautiful stock!";
    case "pantone":
      return a && a.name ? `You'll never find "${a.name}" again.` : "You'll never match this shade again.";
    case "habbo":
      return "bobba.";
    case "yugioh":
      return "You've activated my trap card. (I have no trap card.)";
    case "knockoff-manor":
      return "The killer is still among—";
    case "witness-protection-filter":
      return "You never saw me. Officially.";
    case "gay-frogged":
      return "The glow was real. WE were real.";
    case "hidden-agendas":
      return "My donors will hear of this.";
    case "woke":
      return "Cancelled. Again. Typical.";
    case "pixall":
      return "I was only 8 pixels. What did I ever do to you.";
    case "ps1-mode":
      return "*despawns loudly*";
    case "disguise":
      return "At least tell me WHO you just eliminated.";
    case "prop-panic":
      return a && a.value ? `The ${a.value} was NEVER mine.` : "It was planted on me.";
    case "family-tree-disaster":
      return "My twin will avenge me.";
    case "emotional-audit":
      return a ? `My ${a.meter} was at ${a.value}% and it was all for you.` : "I FELT things, you know.";
    case "role-reveal":
      return a && a.value ? `But who will ${String(a.value).toLowerCase()} now?` : "The town needed me.";
    case "face-first":
      return "It was the face, wasn't it.";
    case "monocultural":
      return "We all look identical and you chose ME.";
    case "heads-only":
      return "You can't keep a good head down.";
    case "gallery":
      return "I was priceless. PRICELESS.";
    case "fireworks":
      return "I regret nothing.";
    default:
      return generic();
  }
}
// Anchor the bubble to the (freshly re-rendered) card or floating head. Comic-bubble, ~3s life.
function showLastWords(charId) {
  const ch = characterById(charId);
  if (!ch) return;
  const el = document.getElementById(`card-${charId}`) || document.querySelector(`.float-head[data-id="${charId}"]`);
  if (!el) return;
  document.querySelectorAll(".lastwords-bubble").forEach((b) => b.remove());
  const bub = document.createElement("span");
  bub.className = "lastwords-bubble";
  bub.textContent = modeLastWords(ch);
  if (el.classList.contains("float-head")) bub.classList.add("lw-floathead");
  // The eliminated card carries a heavy dimming filter (brightness 0.4), and a filter darkens its
  // whole subtree - so a bubble parented to the card would be greyed out and unreadable (worst on the
  // pitch-black Disguise tiles). Park it on <body> with fixed positioning over the card instead, fully
  // outside the filtered element. Ephemeral (3.2s), so not following mid-scroll is fine.
  const place = () => {
    const r = el.getBoundingClientRect();
    bub.style.left = `${Math.round(r.left + r.width / 2)}px`;
    bub.style.top = `${Math.round(r.top + 8)}px`;
  };
  bub.style.position = "fixed";
  document.body.appendChild(bub);
  place();
  setTimeout(() => {
    bub.classList.add("lw-out");
    setTimeout(() => bub.remove(), 380);
  }, 3200);
}

function getMysteryCardData(character) {
  const mystery = state.global.mystery;
  if (!mystery || !mystery.assignments) return { html: "", dataset: {} };
  const assignment = mystery.assignments[character.id];
  if (!assignment) return { html: "", dataset: {} };
  if (mystery.id === "prop-panic") {
    // The prop floats in one consistent spot (bottom-right of every portrait) so it reads as "what's
    // in this hand?" at a glance, not a scavenger hunt. Only the wobble beat is desynced per person;
    // the icon alone tells the story - no ROCK/WATER text label (funnier as a pure pictogram).
    const dl = -(stableHash(character.id + ":ppd") % 2400) / 1000;
    return {
      effectName: mystery.name,
      primaryText: assignment.value,
      propEmoji: assignment.emoji,
      cardClass: "prop-mode",
      style: `--pp-delay:${dl.toFixed(2)}s`,
      dataset: { mysteryValue: assignment.value },
      html: ""
    };
  }
  if (mystery.id === "family-tree-disaster") {
    return {
      effectName: mystery.name,
      dataset: { familyCluster: assignment.clusterId, familyRole: assignment.role },
      html: addMysteryBadge(assignment.role, "family")
    };
  }
  if (mystery.id === "knockoff-manor") {
    return {
      effectName: mystery.name,
      cardClass: "manor-guest",
      dataset: { houseRoom: assignment.roomName },
      html: addMysteryBadge(assignment.roomName, "room")
    };
  }
  if (mystery.id === "emotional-audit") {
    return {
      effectName: mystery.name,
      dataset: { emotionMeter: assignment.meter, emotionValue: String(assignment.value) },
      html: `<span class="emotion-meter"><span>${escapeHtml(assignment.meter)}: ${assignment.value}%</span><i style="--meter:${assignment.value}%"></i></span>`
    };
  }
  if (mystery.id === "vibe-labels") {
    return {
      effectName: mystery.name,
      dataset: { mysteryValue: assignment.value },
      html: addMysteryBadge(assignment.value, "vibe")
    };
  }
  if (mystery.id === "role-reveal") {
    // The role badge (html) already renders on both board and secret cards; a secretExtraHtml role
    // paragraph on top of it made the secret card show the job TWICE.
    return {
      effectName: mystery.name,
      dataset: { mysteryValue: assignment.value },
      html: addMysteryBadge(assignment.value, "role")
    };
  }
  if (mystery.id === "pantone") {
    return {
      effectName: mystery.name,
      cardClass: "pantone-mode",
      dataset: { pantoneName: assignment.name, pantoneCode: assignment.code },
      html: `<span class="pt-code">${escapeHtml(assignment.code)} TCX</span><span class="pt-name">${escapeHtml(assignment.name)}</span>`
    };
  }
  if (mystery.id === "horny-potter") {
    const genderCls = { MALE: "g-male", FEMALE: "g-female", ASIAN: "g-asian", ETHNIC: "g-ethnic" }[assignment.gender] || "g-male";
    const smoke = (assignment.role === "deatheater" || assignment.role === "darklord")
      ? `<span class="hp-smoke" aria-hidden="true"><i></i><i></i><i></i></span>` : "";
    return {
      effectName: mystery.name,
      cardClass: `hp-mode hp-${assignment.role}`,
      image: assignment.image || undefined,
      style: `--hp-color:${assignment.color};--smoke-delay:${assignment.smokeDelay || 0}s`,
      dataset: { hpHouse: assignment.house, hpSpell: assignment.spell, hpGender: assignment.gender },
      cornerHtml: smoke + `<span class="hp-gender ${genderCls}">${escapeHtml(assignment.gender)}</span>`,
      html: `<div class="hp-tag"><span class="hp-crest">${assignment.crest}</span> ${escapeHtml(assignment.house)}</div>`
        + `<table class="hp-sheet"><tbody>`
        + `<tr><th>Wand</th><td>${escapeHtml(assignment.wand)}</td></tr>`
        + `<tr class="hp-spell-row"><th>Fav Spell</th><td><b>${escapeHtml(assignment.spell)}</b> — ${escapeHtml(assignment.spellHint)}</td></tr>`
        + (assignment.horcrux
          ? `<tr class="hp-horcrux-row"><th>Horcrux</th><td>${escapeHtml(assignment.horcrux)}</td></tr>`
          : `<tr><th>Patronus</th><td>${escapeHtml(assignment.patronus)}</td></tr>`
            + `<tr><th>Boggart</th><td>${escapeHtml(assignment.boggart)}</td></tr>`)
        + `</tbody></table>`
    };
  }
  if (mystery.id === "hidden-agendas") {
    const side = assignment.party === "Democrat" ? "dem" : "rep";
    const st = assignment.stances || { for: [], against: [] };
    return {
      effectName: mystery.name,
      cardClass: `agenda-${side}`,
      image: assignment.image || undefined,
      propEmoji: assignment.emoji,
      primaryText: `${assignment.party} · ${assignment.state} · ${assignment.mood}`,
      dataset: { agendaParty: assignment.party, agendaState: assignment.state, agendaMood: assignment.mood },
      cornerHtml: assignment.converted ? `<span class="pol-converted">CONVERTED</span>` : "",
      html: `${addMysteryBadge(assignment.party, `agenda-${side}`)}${addMysteryBadge(assignment.state, "agenda-state")}`
        + `<div class="ha-stances">`
        + `<div class="ha-for"><b>FOR:</b> ${st.for.map(escapeHtml).join(", ")}</div>`
        + `<div class="ha-against"><b>AGAINST:</b> ${st.against.map(escapeHtml).join(", ")}</div>`
        + `</div>`
    };
  }
  if (mystery.id === "witness-protection-filter") {
    // Per-character delay + speed so the CCTV cams cut at different moments and paces - a wall of
    // synced cameras reads as one predictable loop; desynced ones read as genuinely chaotic.
    const camDelay = -(stableHash(character.id + ":cam") % 5200) / 1000;
    const camDur = 3.6 + (stableHash(character.id + ":camdur") % 3200) / 1000;
    return {
      effectName: mystery.name,
      cardClass: assignment.className,
      dataset: { mysteryValue: assignment.value },
      style: `--cam-delay:${camDelay.toFixed(2)}s;--cam-dur:${camDur.toFixed(2)}s`,
      cornerHtml: `<span class="wp-pixel" aria-hidden="true"></span>`,   // pixelated censor over the chest
      html: assignment.reason ? `<div class="wp-reason">🚨 <b>WANTED:</b> ${escapeHtml(assignment.reason)}</div>` : ""
    };
  }
  if (mystery.id === "monocultural") {
    return {
      effectName: mystery.name,
      image: assignment.image || undefined,
      html: ""
    };
  }
  if (mystery.id === "gay-frogged") {
    const cornerHtml = `<div class="gayfrog-corner">${assignment.letters.map((l) => `<span class="gayfrog-letter">${escapeHtml(l)}</span>`).join("")}</div>`;
    const titleBadge = assignment.title ? addMysteryBadge(assignment.title, "gayfrog-badge gayfrog-word") : "";
    // A per-tile negative animation-delay (0 to -6s) so the pulsing rainbow background on each card is
    // offset from its neighbours - the board shimmers rather than strobing in unison.
    const pulseDelay = -(stableHash(character.id + ":pulse") % 6000) / 1000;
    return {
      effectName: mystery.name,
      cardClass: `gayfrog gayfrog-${assignment.key}`,
      dataset: { gayfrogColor: assignment.color },
      style: `--glow:${assignment.color};--pulse-delay:${pulseDelay.toFixed(2)}s`,
      image: assignment.image || undefined,
      cornerHtml,
      pronoun: assignment.pronoun,
      secretExtraHtml: `<p class="card-pronouns">${escapeHtml(assignment.pronoun || "they/them")}</p>`,
      characterExtraHtml: `<p class="card-pronouns">${escapeHtml(assignment.pronoun || "they/them")}</p>`
        + `<div class="card-grindr-tags">${[...(stableHash(character.id + ":poc") % 3 === 0 ? ["POC"] : []), ...characterTags(character)].map((t) => `<span class="grindr-tag">${escapeHtml(t)}</span>`).join("")}</div>`,
      html: titleBadge
    };
  }
  if (mystery.id === "face-first") {
    return {
      effectName: mystery.name,
      cardClass: "facefirst",
      html: ""
    };
  }
  if (mystery.id === "disguise") {
    return {
      effectName: mystery.name,
      cardClass: "disguise",
      image: assignment.image || undefined,
      html: `<div class="dg-arabic" dir="rtl">${escapeHtml(assignment.arabic || "")}</div>`
        + `<div class="dg-phon">${escapeHtml(assignment.phon || "")}</div>`
    };
  }
  if (mystery.id === "woke") {
    const a = assignment;
    const M = window.GameData.drugMethods;
    const tierCls = { MINOR: "dz-minor", MAJOR: "dz-major", MEGA: "dz-mega" };
    const has = (m) => a.modules && a.modules.includes(m);

    // --- Corners: each module keeps the signature badge from its home mode. LBGT letter chips go
    //     top-left (like Gay-Frogged); every other badge stacks top-right in .woke-badges. ---
    const prideCorner = has("gay")
      ? `<div class="gayfrog-corner">${a.gay.letters.map((l) => `<span class="gayfrog-letter">${escapeHtml(l)}</span>`).join("")}</div>`
      : "";
    const badges = [];
    if (has("orgy")) badges.push(`<span class="orgy-pos">${escapeHtml(a.orgy.pos)}</span>`);
    if (has("drugs")) badges.push(`<span class="dg-count">${a.drugs.habits.length}× hooked</span>`);
    if (has("fertility")) badges.push(`<span class="ft-timer">⏳ ${a.fertility.hrs}h ${a.fertility.mins}m</span>`);
    if (has("work")) badges.push(`<span class="wk-days">${a.work.days}d</span>`);
    const cornerHtml = prideCorner + (badges.length ? `<div class="woke-badges">${badges.join("")}</div>` : "");

    // --- Body: each module rendered with its home mode's own markup/classes, stacked. ---
    const blocks = [];
    if (has("gay")) {
      const tags = [...(stableHash(character.id + ":poc") % 3 === 0 ? ["POC"] : []), ...characterTags(character)];
      blocks.push(`<div class="woke-block woke-gay">`
        + `<p class="card-pronouns">${escapeHtml(a.gay.pronoun)}</p>`
        + `<div class="card-grindr-tags">${tags.map((t) => `<span class="grindr-tag">${escapeHtml(t)}</span>`).join("")}</div>`
        + `<span class="mystery-badge gayfrog-badge gayfrog-word">${escapeHtml(a.gay.title)}</span></div>`);
    }
    if (has("orgy")) {
      const o = a.orgy;
      const bar = (label, n) => `<span class="orgy-bar"><b>${label}</b><i><s style="--n:${n * 10}%"></s></i></span>`;
      blocks.push(`<div class="orgy-stats">`
        + `<div class="orgy-cum"><span>💦 ${o.cumToday} today</span><span>${o.cumLifetime.toLocaleString()} life</span></div>`
        + `${bar("STAMINA", o.stamina)}${bar("HORNY", o.horniness)}${bar("LIFESPAN", o.lifespan)}${bar("SECRETS", o.secrets)}</div>`);
    }
    if (has("drugs")) {
      const rows = a.drugs.habits.map((d) => `<span class="dg-row"><b>${escapeHtml(d.name)}</b><i>${M[d.method] || d.method}</i></span>`).join("");
      blocks.push(`<div class="dg-sheet">${rows}<div class="dg-daily">~${a.drugs.daily}/day</div></div>`);
    }
    if (has("disease")) {
      const d = a.disease;
      const pills = d.diseases.map((x) => `<span class="dz-pill ${tierCls[x.tier]}">${escapeHtml(x.tier)} · ${escapeHtml(x.name)}</span>`).join("");
      const cancers = d.cancers.length
        ? `<div class="dz-cancers"><b>🎗 Cancers:</b> ${d.cancers.map((c) => `${escapeHtml(c.type)} <i>(${escapeHtml(c.eta)})</i>`).join(", ")}</div>`
        : "";
      const meds = `<div class="dz-meds"><b>💊 Meds:</b> ${d.meds.map(escapeHtml).join(", ")}</div>`;
      blocks.push(`<div class="dz-sheet">${renderPainScale(d.pain)}<div class="dz-pills">${pills}</div>`
        + `<div class="dz-bar"><b>AUTISM</b><i><s style="--n:${Math.round(d.autism * 100)}%"></s></i><u>${Math.round(d.autism * 100)}%</u></div>`
        + `${cancers}${meds}</div>`);
    }
    if (has("fertility")) {
      const f = a.fertility;
      const defect = f.defect ? `<div class="ft-defect">⚠ ${escapeHtml(f.defect)}</div>` : "";
      blocks.push(`<div class="ft-sheet">`
        + `<div class="ft-row"><b>💦</b><i>${escapeHtml(f.cum)}</i></div>`
        + `<div class="ft-row"><b>🥚</b><i>${f.barren ? '<span class="ft-barren">BARREN</span>' : f.eggs}</i></div>${defect}</div>`);
    }
    if (has("work")) {
      blocks.push(`<div class="wk-sheet"><div class="wk-sentence">⛏ ${a.work.days} DAYS REMAINING</div>`
        + `<div class="wk-stash"><b>STASH:</b> ${a.work.items.map(escapeHtml).join(", ")}</div></div>`);
    }
    if (has("disguise")) blocks.push(`<div class="woke-line">🕶 <i>incognito</i></div>`);
    // A woke baby wears whatever the identity reels landed on.
    if (character.wokeIdentity) {
      const w = character.wokeIdentity;
      blocks.unshift(`<div class="woke-id">🎰 ${escapeHtml(w.pronouns)} · ${escapeHtml(w.gender)} · ${escapeHtml(w.ethnicity)}</div>`);
    }

    const pulseDelay = -(stableHash(character.id + ":pulse") % 6000) / 1000;
    return {
      effectName: mystery.name,
      cardClass: has("gay") ? "woke has-pride" : "woke",
      image: a.image || undefined,
      style: `--glow:${a.glow};--pulse-delay:${pulseDelay.toFixed(2)}s`,
      dataset: a.orgy ? { wokePos: a.orgy.pos } : {},
      cornerHtml,
      html: `<div class="woke-sheet">${blocks.join("")}</div>`
    };
  }
  if (mystery.id === "work") {
    const a = assignment;
    return {
      effectName: mystery.name,
      cardClass: "work",
      image: a.image || undefined,
      cornerHtml: `<span class="wk-days" title="days remaining">${a.days}d</span>`,
      html: `<div class="wk-sheet">
        <div class="wk-sentence">⛏ ${a.days} DAYS REMAINING</div>
        <div class="wk-stash"><b>STASH:</b> ${a.items.map(escapeHtml).join(", ")}</div>
      </div>`
    };
  }
  if (mystery.id === "linkedin") {
    const a = assignment;
    const skills = (a.skills || []).map((s) =>
      `<div class="li-skill"><span>${escapeHtml(s.name)}</span><b>${s.count.toLocaleString()}</b></div>`).join("");
    const bn = a.banner || { type: "plain" };
    const bannerHtml = bn.type === "image"
      ? `<div class="li-banner li-banner-img${bn.power ? " li-banner-power" : ""}" style="background-image:url('${encodeURI(bn.src)}')"></div>`
      : `<div class="li-banner li-banner-${bn.type}"></div>`;
    const premium = a.premium ? `<span class="li-premium">${escapeHtml(a.premium)}</span>` : "";
    const nameHtml = a.displayName ? `<div class="li-name">${escapeHtml(a.displayName)}</div>` : "";
    const locationHtml = a.location ? `<div class="li-location">📍 ${escapeHtml(a.location)}</div>` : "";
    // LinkedIn mode owns the whole plate (the base card name h3 is hidden via CSS) so every card has
    // the identical vertical order: banner → Name Surname → title → company → location → connections → skills.
    return {
      effectName: mystery.name,
      cardClass: `linkedin li-${a.tier || "mid"}${a.openToWork ? " li-otw" : ""}`,
      cornerHtml: a.openToWork ? `<span class="li-otw-badge" title="Open to work">${escapeHtml(a.otwText || "#OpenToWork")}</span>` : "",
      html: `${bannerHtml}<div class="li-sheet">
        ${nameHtml}
        <div class="li-title">${escapeHtml(a.title)}${premium}</div>
        <div class="li-company">${escapeHtml(a.company)}</div>
        ${locationHtml}
        <div class="li-connections">${escapeHtml(a.connections || "")}</div>
        <div class="li-skills">${skills}</div>
      </div>`
    };
  }
  if (mystery.id === "gallery") {
    const a = assignment;
    // The frame IS the artwork: repainted portrait, uneven hang, and only a whisper of a label
    // (year · medium) under the name. No plaque box.
    return {
      effectName: mystery.name,
      cardClass: `gallery gal-${a.style}`,
      image: a.image || undefined,
      style: a.hang,
      cornerHtml: a.sold ? `<span class="gal-sold" title="Sold">● SOLD</span>` : "",
      html: `<div class="gal-caption">${a.year} · ${escapeHtml(a.medium)}</div>`
    };
  }
  if (mystery.id === "neighbourhood-watch") {
    const a = assignment;
    const isAdmin = /admin|moderator/i.test(a.role || "");
    return {
      effectName: mystery.name,
      cardClass: `nw${isAdmin ? " nw-admin" : ""}`,
      cornerHtml: isAdmin ? `<span class="nw-admin-badge">ADMIN</span>` : "",
      html: `<div class="nw-sheet">
        <div class="nw-name">${escapeHtml(a.displayName)}</div>
        <div class="nw-role">${escapeHtml(a.role)}</div>
        <div class="nw-since">🏠 ${escapeHtml(a.street)} · since ${a.since}</div>
        ${a.feudWith ? `<div class="nw-feud">⚔ Feuding with <b>${escapeHtml(a.feudWith)}</b></div>` : ""}
        <div class="nw-gripe">📢 Posting about: ${escapeHtml((a.gripe || "").replace("{target}", a.feudWith || "the new people"))}</div>
      </div>`
    };
  }
  if (mystery.id === "fertility") {
    const a = assignment;
    const fresh = a.freshMeat ? `<div class="ft-fresh">🥩 FRESH MEAT</div>` : "";
    const defect = a.defect ? `<div class="ft-defect">⚠ ${escapeHtml(a.defect)}</div>` : "";
    const countRow = a.hasCount ? `<div class="ft-row"><b>💦</b><i>${escapeHtml(a.cum)}</i></div>` : "";
    const eggsRow = a.hasEggs ? `<div class="ft-row"><b>🥚</b><i>${a.barren ? '<span class="ft-barren">BARREN</span>' : a.eggs}</i></div>` : "";
    return {
      effectName: mystery.name,
      cardClass: `fertility ${a.freshMeat ? "is-fresh" : ""}`.trim(),
      cornerHtml: `<span class="ft-timer" title="next emptying">⏳ ${a.hrs}h ${a.mins}m</span>`,
      html: `<div class="ft-sheet">${fresh}${countRow}${eggsRow}${defect}</div>`
    };
  }
  if (mystery.id === "disease") {
    const a = assignment;
    const tierCls = { MINOR: "dz-minor", MAJOR: "dz-major", MEGA: "dz-mega" };
    const pills = a.diseases.map((d) => `<span class="dz-pill ${tierCls[d.tier]}">${escapeHtml(d.tier)} · ${escapeHtml(d.name)}</span>`).join("");
    const cancers = a.cancers.length
      ? `<div class="dz-cancers"><b>🎗 Cancers:</b> ${a.cancers.map((c) => `${escapeHtml(c.type)} <i>(${escapeHtml(c.eta)})</i>`).join(", ")}</div>`
      : "";
    const meds = `<div class="dz-meds"><b>💊 Meds:</b> ${a.meds.map(escapeHtml).join(", ")}</div>`;
    return {
      effectName: mystery.name,
      cardClass: `disease ${a.patientZero ? "patient-zero" : ""}`.trim(),
      dataset: { dzPregnant: String(a.pregnant) },
      image: a.image || undefined,
      cornerHtml: a.patientZero ? `<span class="pz-badge">☣ PATIENT ZERO!</span>` : "",
      html: `<div class="dz-sheet">
        ${renderPainScale(a.pain, character.id)}
        <div class="dz-pills">${pills}</div>
        <div class="dz-bar"><b>AUTISM</b><i><s style="--n:${Math.round(a.autism * 100)}%"></s></i><u>${Math.round(a.autism * 100)}%</u></div>
        ${cancers}${meds}
      </div>`
    };
  }
  if (mystery.id === "drugs") {
    const a = assignment;
    const M = window.GameData.drugMethods;
    const rows = a.habits.map((d) => `<span class="dg-row"><b>${escapeHtml(d.name)}</b><i>${M[d.method] || d.method}</i></span>`).join("");
    return {
      effectName: mystery.name,
      cardClass: "drugs",
      image: a.image || undefined,
      cornerHtml: `<span class="dg-count" title="habits">${a.habits.length}× hooked</span>`,
      html: `<div class="dg-sheet">${rows}<div class="dg-daily">~${a.daily}/day</div></div>`
    };
  }
  if (mystery.id === "orgy") {
    const a = assignment;
    const bar = (label, n) => `<span class="orgy-bar"><b>${label}</b><i><s style="--n:${n * 10}%"></s></i></span>`;
    return {
      effectName: mystery.name,
      cardClass: "orgy",
      image: a.image,
      dataset: { orgyPos: a.pos },
      cornerHtml: `<span class="orgy-pos">${escapeHtml(a.pos)}</span><span class="orgy-bodycount" title="body count">🍆 ${a.bodyCount}</span>`,
      html: `<div class="orgy-stats">
        <div class="orgy-cum"><span>💦 ${a.cumToday} today</span><span>${a.cumLifetime.toLocaleString()} life</span></div>
        ${bar("STAMINA", a.stamina)}${bar("HORNY", a.horniness)}${bar("LIFESPAN", a.lifespan)}${bar("SECRETS", a.secrets)}
        <div class="orgy-links">🔗 ${escapeHtml(a.partners.join(", ") || "untouched")}</div>
        <div class="orgy-upnext"><b>UP NEXT:</b> ${escapeHtml(a.upNext)}</div>
      </div>`
    };
  }
  if (mystery.id === "yugioh") {
    const a = assignment;
    const isMonster = a.frame !== "spell" && a.frame !== "trap";
    const orbKey = isMonster ? a.attr : (a.frame === "spell" ? "SPELL" : "TRAP");
    const orbGlyph = { DARK: "🌙", LIGHT: "☀", FIRE: "🔥", WATER: "💧", EARTH: "⛰", WIND: "🌪", SPELL: "✦", TRAP: "⊘" }[orbKey] || "★";
    const stars = isMonster
      ? `<span class="ygo-stars" aria-label="Level ${a.level}">${'<i class="ygo-star">★</i>'.repeat(a.level)}</span>`
      : `<span class="ygo-kind">${escapeHtml(a.kind)}</span>`;
    const cornerHtml = `<span class="ygo-orb" data-attr="${orbKey}" title="${escapeHtml(orbKey)}">${orbGlyph}</span>`;
    const footer = isMonster
      ? `<span class="ygo-stat">ATK/${a.atk}</span><span class="ygo-stat">DEF/${a.def}</span>`
      : "";
    return {
      effectName: mystery.name,
      cardClass: `ygo ygo-${a.frame}`,
      dataset: { ygoAttr: orbKey },
      cornerHtml: `${cornerHtml}<span class="ygo-toprow">${stars}</span>`,
      html: `<span class="ygo-typeline">${escapeHtml(a.typeLine)}</span>${footer ? `<span class="ygo-footer">${footer}</span>` : ""}`
    };
  }
  if (mystery.id === "swipe") {
    const a = assignment;
    const tick = a.verified ? ' <span class="sw-tick" title="verified">✔</span>' : "";
    const unread = a.unread ? `<span class="sw-unread" title="unread messages">💬 ${a.unread}</span>` : "";
    return {
      effectName: mystery.name,
      cardClass: "swipe",
      // Name / age / distance overlay directly on the "profile photo", Tinder-style.
      cornerHtml: `<span class="sw-match" title="match">🔥 ${a.match}%</span>${unread}`
        + `<div class="sw-photo-label">`
        + `<div class="sw-name">${escapeHtml(displayName(character))} <span class="sw-age">${a.age}</span>${tick}</div>`
        + `<div class="sw-dist"><span class="sw-online"></span> ${a.distance} km away · <i>active now</i></div>`
        + `</div>`,
      html: `<div class="sw-sheet">
        <div class="sw-bio">"${escapeHtml(a.bio)}"</div>
        <div class="sw-look">🔎 ${escapeHtml(a.lookingFor)}</div>
        <div class="sw-flagrow">
          <span class="sw-flag sw-green">💚 ${escapeHtml(a.green)}</span>
          <span class="sw-flag sw-red">🚩 ${escapeHtml(a.red)}</span>
        </div>
        <div class="sw-ick">😬 <b>The ick:</b> ${escapeHtml(a.ick)}</div>
      </div>`
    };
  }
  if (mystery.id === "judgement") {
    const a = assignment;
    const glyph = a.mega ? "👹" : { HEAVEN: "😇", HELL: "😈" }[a.verdict];
    const label = a.mega ? "MEGA HELL" : { HEAVEN: "HEAVEN", HELL: "HELL" }[a.verdict];
    const crown = {
      HEAVEN: '<svg class="jd-halo" viewBox="0 0 64 22"><ellipse cx="32" cy="11" rx="27" ry="7.5"/></svg>',
      HELL: '<svg class="jd-horns" viewBox="0 0 62 34"><path class="horn" d="M21 34 C 8 25 5 9 14 2 C 13 13 17 25 25 31 Z"/><path class="horn" d="M41 34 C 54 25 57 9 48 2 C 49 13 45 25 37 31 Z"/></svg>'
    }[a.verdict];
    const meter2Label = { HEAVEN: "BLISS", HELL: "TORMENT" }[a.verdict];
    const meter2Cls = { HEAVEN: "rct-good", HELL: "rct-bad" }[a.verdict];
    const money = a.wealth != null ? `${a.wealth < 0 ? "-§" + Math.abs(a.wealth).toLocaleString() : "§" + a.wealth.toLocaleString()}` : "";
    const where = a.verdict === "HELL"
      ? `${escapeHtml(a.location)} · <b>${a.mega ? "🔥 MEGA HELL" : "Circle " + a.layer}</b>`
      : `${escapeHtml(a.location)} · <b>Tier ${a.layer}${money ? " · " + money : ""}</b>`;
    const bar = (lbl, n, cls) => `<span class="rct-bar"><b>${lbl}</b><i><s class="${cls}" style="--n:${n}%"></s></i></span>`;
    // HELL: individual flame tongues, each with its own position / height / flicker timing (hashed
    // per character+index so no two demons burn alike), split behind and in front of the body.
    let flames = "";
    if (a.verdict === "HELL") {
      const mk = (i, front) => {
        const s = `${character.id}:fl${front ? "f" : "b"}${i}`;
        const x = 3 + (stableHash(s + "x") % 90);
        const d = -(stableHash(s + "d") % 900) / 1000;
        const dur = (55 + (stableHash(s + "u") % 55)) / 100;
        const h = front ? 18 + (stableHash(s + "h") % 22) : 26 + (stableHash(s + "h") % 40);
        const w = front ? 10 + (stableHash(s + "w") % 8) : 14 + (stableHash(s + "w") % 12);
        return `<i class="jd-flame" style="--fx:${x}%;--fd:${d.toFixed(2)}s;--fu:${dur.toFixed(2)}s;--fh:${h}px;--fw:${w}px"></i>`;
      };
      let back = "", frontF = "";
      for (let i = 0; i < 7; i++) back += mk(i, false);
      for (let i = 0; i < 4; i++) frontF += mk(i, true);
      flames = `<span class="jd-flames jd-flames-back" aria-hidden="true">${back}</span>`
        + `<span class="jd-flames jd-flames-front" aria-hidden="true">${frontF}</span>`;
    }
    return {
      effectName: mystery.name,
      cardClass: `judgement jd-${a.verdict.toLowerCase()}${a.mega ? " jd-mega" : ""}`,
      dataset: { verdict: a.verdict },
      image: a.image || undefined,
      cornerHtml: flames
        + `<span class="jd-verdict">${glyph} ${label}</span>`
        + `<span class="jd-crown" aria-hidden="true">${crown}</span>`,
      html: `<div class="jd-sheet">
        <div class="jd-loc">📍 ${where}</div>
        <div class="jd-thought">💭 <i>"${escapeHtml(a.thought)}"</i></div>
        ${bar("HAPPINESS", a.happiness, "rct-happy")}
        ${bar(meter2Label, a.meter2, meter2Cls)}
      </div>`
    };
  }
  if (mystery.id === "heads-only") {
    return { effectName: mystery.name, cardClass: "heads-secret", image: assignment.image || undefined, html: "" };
  }
  if (mystery.id === "astrology") {
    const a = assignment;
    const retro = a.retro ? `<div class="astro-retro">☿ Mercury retrograde</div>` : "";
    return {
      effectName: mystery.name,
      cardClass: `astrology astro-${a.element.toLowerCase()}`,
      cornerHtml: `<span class="astro-glyph" title="${escapeHtml(a.sun.name)}">${a.sun.glyph}</span>`,
      html: `<div class="astro-sheet">
        <div class="astro-sign">${a.sun.glyph} <b>${escapeHtml(a.sun.name)}</b> · ${escapeHtml(a.element)}</div>
        <div class="astro-big">☀${a.sun.glyph} ☾${a.moon} ↑${a.rising}</div>
        <div class="astro-horo">🔮 <i>"${escapeHtml(a.horoscope)}"</i></div>
        <div class="astro-toxic">🚩 ${escapeHtml(a.toxic)}</div>
        ${retro}
      </div>`
    };
  }
  if (mystery.id === "habbo") {
    return { effectName: mystery.name, cardClass: "habbo-secret", image: assignment.head || undefined, html: "" };
  }
  if (mystery.id === "sims") {
    const a = assignment;
    const bar = (label, n, need) => {
      const cls = n < 25 ? "sim-crit" : n < 55 ? "sim-warn" : "sim-ok";
      return `<span class="sim-bar" data-need="${need}"><b>${label}</b><i><s class="${cls}" style="--n:${n}%"></s></i></span>`;
    };
    const money = a.simoleons < 0 ? `-§${Math.abs(a.simoleons).toLocaleString()}` : `§${a.simoleons.toLocaleString()}`;
    // A real CSS-3D square bipyramid (8 triangular faces) that genuinely rotates in 3D - so side faces
    // stay visible as it turns instead of squashing to a flat line like the old SVG.
    const plumbob = `<span class="sim-plumbob" data-mood="${a.mood}" aria-label="mood: ${a.mood}">`
      + `<span class="pb3d">`
      + `<b class="pf pt0"></b><b class="pf pt1"></b><b class="pf pt2"></b><b class="pf pt3"></b>`
      + `<b class="pf pb0"></b><b class="pf pb1"></b><b class="pf pb2"></b><b class="pf pb3"></b>`
      + `</span></span>`;
    return {
      effectName: mystery.name,
      cardClass: `sims sim-${a.mood}`,
      image: a.image || undefined,
      style: a.bg ? `--sim-bg:${a.bg}` : undefined,
      cornerHtml: plumbob
        + `<span class="sim-cash" title="simoleons">${money}</span>`,
      html: `<div class="sim-sheet">
        <div class="sim-action">💬 <i>${escapeHtml(a.action)}…</i></div>
        ${bar("HUNGER", a.needs.hunger, "hunger")}${bar("SOCIAL", a.needs.social, "social")}${bar("BLADDER", a.needs.bladder, "bladder")}${bar("FUN", a.needs.fun, "fun")}
        <div class="sim-career">💼 ${escapeHtml(a.career)}</div>
      </div>`
    };
  }
  return { html: "", dataset: {} };
}

function addMysteryBadge(text, type) {
  return `<span class="mystery-badge ${type}">${escapeHtml(text)}</span>`;
}

// Yu-Gi-Oh! mode: every character becomes a duel card - Normal/Effect monster, Spell or Trap, with
// an attribute orb, level stars, type line and ATK/DEF. Deterministic per character + game salt.
function applyYugioh(effect) {
  const monsterTypes = ["Spellcaster", "Warrior", "Dragon", "Beast", "Fiend", "Fairy", "Machine", "Zombie", "Aqua", "Pyro", "Rock", "Insect", "Dinosaur", "Sea Serpent", "Psychic", "Beast-Warrior", "Winged Beast", "Reptile"];
  const attrs = ["DARK", "LIGHT", "FIRE", "WATER", "EARTH", "WIND"];
  const spellKinds = ["Normal", "Quick-Play", "Continuous", "Field", "Equip"];
  const trapKinds = ["Normal", "Continuous", "Counter"];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:ygo:${ch.id}`);
    const roll = h % 100;
    let frame;
    if (roll < 30) frame = "normal";
    else if (roll < 62) frame = "effect";
    else if (roll < 80) frame = "spell";
    else if (roll < 95) frame = "trap";
    else if (roll < 98) frame = "fusion";
    else frame = "ritual";
    const a = { frame };
    if (frame === "spell" || frame === "trap") {
      a.kind = (frame === "spell" ? spellKinds : trapKinds)[(h >>> 3) % (frame === "spell" ? spellKinds.length : trapKinds.length)];
      a.typeLine = frame === "spell" ? "[Spell Card]" : "[Trap Card]";
    } else {
      a.attr = attrs[(h >>> 5) % attrs.length];
      a.level = 1 + ((h >>> 7) % 8);
      a.mtype = monsterTypes[(h >>> 11) % monsterTypes.length];
      const base = 300 + ((h >>> 9) % 10) * 200 + a.level * 200;
      a.atk = Math.min(3000, Math.round(base / 50) * 50);
      a.def = Math.min(3000, Math.round((base * 0.78 + ((h >>> 13) % 6) * 100) / 50) * 50);
      const tag = frame === "fusion" ? "Fusion/Effect" : frame === "ritual" ? "Ritual/Effect" : frame === "effect" ? "Effect" : "Normal";
      a.typeLine = `[${a.mtype}/${tag}]`;
    }
    assignments[ch.id] = a;
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Fertility Mode: a reproductive readout - cum count (millions/billions), egg count (10s-100s, some
// barren), a countdown to next "emptying", and a product-defect warning. Comedy stats on avatars.
function applyFertility(effect) {
  const defects = ["CHROMOSOMAL SURPLUS", "BATTERY FARM EGGS", "SLOW SWIMMERS", "CRACK BABIES IMMINENT",
    "TADPOLE QUALITY: POOR", "EXPIRED STOCK", "TWO-HEADED RISK", "GENETIC LUCKY DIP",
    "RECALLED BATCH", "SUSPICIOUSLY KEEN", "ALL DUDS", "PREMIUM GRADE (allegedly)"];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:fert:${ch.id}`);
    // Each person produces eggs OR cummies; a rare few make both.
    const r = (h >>> 17) % 100;
    const hasBoth = r < 8;
    const hasCount = hasBoth || r < 54;
    const hasEggs = hasBoth || r >= 54;
    const billions = (h >>> 2) % 4 === 0;
    const cum = billions
      ? (1 + ((h >>> 4) % 40) / 10).toFixed(1) + "B"
      : (50 + ((h >>> 4) % 900)) + "M";
    const barren = hasEggs && (h >>> 9) % 6 === 0;
    const eggs = barren ? 0 : 8 + ((h >>> 6) % 320);
    const hrs = (h >>> 11) % 72;
    const mins = (h >>> 13) % 60;
    const defect = ((h >>> 15) % 3 === 0)
      ? defects[stableHash(`${state.gameSalt}:fdef:${ch.id}`) % defects.length]
      : null;
    assignments[ch.id] = { cum, eggs, barren, hrs, mins, defect, hasCount, hasEggs };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// WOKE Mode: a chaotic mix-and-match of every other stat mode. Each character rolls a RANDOM SUBSET
// (2-3) of modules and, for each, gets the SAME data a real card in that mode would - so the woke card
// can be rendered with each mode's own visual treatment (LBGT letter chips, orgy bars, disease pills,
// pain-face corner, fertility timer, work sentence, disguise). Not Yu-Gi-Oh.
const WOKE_MODULES = ["gay", "orgy", "drugs", "disease", "fertility", "work", "disguise"];
// Rainbow-dye a portrait's hair for the woke "gay" module: every hair lock takes a different pride
// colour (with matching shade/shine so it still reads as hair), and the base silhouette is dyed too.
const WOKE_RAINBOW = ["#e40303", "#ff8c00", "#ffd400", "#28a745", "#3a86ff", "#8338ec"];
function wokeRainbowHair(traits) {
  const base = { hairHex: WOKE_RAINBOW[0] };
  if (!Array.isArray(traits.hairLocks) || !traits.hairLocks.length) return base;
  base.hairLocks = traits.hairLocks.map((l, i) => {
    const c = WOKE_RAINBOW[i % WOKE_RAINBOW.length];
    return { ...l, fill: c, dark: mixHex(c, "#180418", 0.42), shine: mixHex(c, "#ffffff", 0.42) };
  });
  return base;
}
function applyWoke(effect) {
  const D = window.GameData;
  const positions = ["TOP", "BOTTOM", "SIDE", "GAGGED", "CHOKING", "VERS", "POWER BOTTOM", "STARFISH"];
  const glows = ["#ff4d6d", "#ff9e3a", "#ffe23a", "#4dd46a", "#3aa0ff", "#a05aff", "#ff5ad0"];
  const defects = ["SLOW SWIMMERS", "EXPIRED STOCK", "TWO-HEADED RISK", "RECALLED BATCH", "ALL DUDS", "PREMIUM (allegedly)"];
  const stash = (D && D.workInventory) || ["Shiv"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:wk:${salt}`) % arr.length];
  // Special Disguise flattens the vibe when everyone's covered, so cap it at a COUPLE of people:
  // only the two lowest-hashed board members are ever allowed to roll it.
  const disguiseOk = new Set(
    deterministicOrder(state.board, `${state.gameSalt}:woke:disg`).slice(0, 2).map((c) => c.id)
  );
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:woke:${ch.id}`);
    // Deterministic shuffle of the module list, then take 2-3 for this character.
    const order = WOKE_MODULES
      .map((m) => [m, stableHash(`${state.gameSalt}:wkmod:${ch.id}:${m}`)])
      .sort((a, b) => a[1] - b[1])
      .map((x) => x[0]);
    let mods = order.slice(0, 2 + (h % 2));
    if (mods.includes("disguise") && !disguiseOk.has(ch.id)) mods = mods.filter((m) => m !== "disguise");
    const has = (m) => mods.includes(m);
    const a = { modules: mods };

    // Gay-Frogged: LBGT letter(s), a pride colour, pronoun, and an orientation title.
    if (has("gay")) {
      const L = PRIDE_LETTERS_POOL[(h >>> 3) % PRIDE_LETTERS_POOL.length];
      a.gay = {
        letters: L.letters, key: L.key, color: L.color,
        pronoun: PRIDE_PRONOUNS_POOL[(h >>> 6) % PRIDE_PRONOUNS_POOL.length],
        title: PRIDE_TITLES_POOL[(h >>> 9) % PRIDE_TITLES_POOL.length]
      };
    }
    a.glow = a.gay ? a.gay.color : glows[h % glows.length];

    // Orgy: position, body count, today's/lifetime cum, and the four stat bars.
    if (has("orgy")) {
      const stat = (salt) => 1 + (stableHash(`${state.gameSalt}:wko:${ch.id}:${salt}`) % 10);
      a.orgy = {
        pos: positions[(h >>> 5) % positions.length],
        bodyCount: 2 + ((h >>> 3) % 187),
        cumToday: (h >>> 5) % 14,
        cumLifetime: 150 + ((h >>> 7) % 9850),
        stamina: stat("sta"), horniness: stat("hor"), lifespan: stat("life"), secrets: stat("sec")
      };
    }
    // Drug Addict: 1-2 street-name habits + how they take each, plus a daily count.
    if (has("drugs")) {
      const n = 1 + ((h >>> 6) % 2);
      const habits = [];
      for (let k = 0; k < n; k++) {
        const dr = pick(D.drugs, `${ch.id}:dg${k}`);
        if (!habits.some((x) => x.name === dr[0])) habits.push({ name: dr[0], method: dr[1] });
      }
      a.drugs = { habits, daily: 1 + ((h >>> 5) % 40) };
    }
    // Disease: 1-2 diagnoses (with severity), a possible cancer, meds, an autism %, and a pain face.
    if (has("disease")) {
      const diseases = [];
      const dn = 1 + (h % 2);
      for (let k = 0; k < dn; k++) {
        const dz = pick(D.diseases, `${ch.id}:dz${k}`);
        if (!diseases.some((x) => x.name === dz[0])) diseases.push({ name: dz[0], tier: dz[1] });
      }
      const cancers = [];
      if ((h >>> 9) % 3 === 0) cancers.push({ type: pick(D.cancerTypes, `${ch.id}:c`), eta: pick(D.cancerEtas, `${ch.id}:e`) });
      a.disease = {
        diseases, cancers, meds: [pick(D.medications, `${ch.id}:m`)],
        autism: ((h >>> 3) % 101) / 100, pain: (h >>> 11) % D.painFaces.length
      };
    }
    // Fertility: a cum count, an egg count (or BARREN), a next-emptying timer, and a possible defect.
    if (has("fertility")) {
      const barren = (h >>> 11) % 5 === 0;
      const billions = (h >>> 2) % 4 === 0;
      a.fertility = {
        cum: billions ? (1 + ((h >>> 4) % 40) / 10).toFixed(1) + "B" : (50 + ((h >>> 4) % 900)) + "M",
        eggs: barren ? 0 : 8 + ((h >>> 6) % 320), barren,
        hrs: (h >>> 13) % 72, mins: (h >>> 15) % 60,
        defect: ((h >>> 17) % 3 === 0) ? defects[(h >>> 19) % defects.length] : null
      };
    }
    // Work: a days-remaining sentence and a stash item.
    if (has("work")) {
      a.work = { days: 1 + (h % 9000), items: [stash[(h >>> 4) % stash.length]] };
    }

    // Image: a disguised covering when that module rolled, otherwise the bare-shouldered woke portrait.
    // Gay module => full RAINBOW HAIR (each hair lock a different pride colour, base dyed too).
    if (ch.traits && window.faceGenerator) {
      const R = (extra) => window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, ...extra });
      const pride = has("gay") ? wokeRainbowHair(ch.traits) : {};
      a.image = has("disguise")
        ? (ch.pronouns === "she"
          ? R({ disguise: true })
          : R({ hair: "bald", hairLocks: [], beardLength: 0, accessory: "turban", accessoryColor: "#ededee",
            accessoryY: 0, accessoryScale: 1,
            clothing: (ch.traits.clothing === "bare" || ch.traits.clothing === "singlet") ? "tee" : ch.traits.clothing,
            shirt: "#f2f2f2" }))
        : R({ clothing: "bare", accessory: "none", ...pride });
    } else {
      a.image = ch.image;
    }
    assignments[ch.id] = a;
  });
  return { id: effect.id, name: effect.name, assignments };
}

// SWIPE Mode: every character becomes a dating-app profile - a bio, what they're looking for, a green
// flag, a red flag, the ick, an age, a distance away, a match %, and unread messages. Crossing a card
// off slaps a "NOPE" stamp on it; bringing it back stamps "LIKED".
function applySwipe(effect) {
  const D = window.GameData;
  const lookingFor = D.swipeLookingFor || ["Something casual"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:sw:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:swipe:${ch.id}`);
    assignments[ch.id] = {
      age: 18 + (h % 42),
      distance: 1 + ((h >>> 4) % 40),
      match: 1 + ((h >>> 7) % 99),
      unread: (h >>> 5) % 4 === 0 ? (h >>> 11) % 99 : 0,
      verified: (h >>> 13) % 7 === 0,
      lookingFor: lookingFor[(h >>> 3) % lookingFor.length],
      bio: pick(D.swipeBios || ["Just vibes."], `${ch.id}:bio`),
      green: pick(D.swipeGreenFlags || ["Texts back"], `${ch.id}:g`),
      red: pick(D.swipeRedFlags || ["Still loves their ex"], `${ch.id}:r`),
      ick: pick(D.swipeIcks || ["Chases the bus"], `${ch.id}:ick`)
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// JUDGEMENT DAY: the afterlife as a RollerCoaster-Tycoon theme park. Everyone's been sorted into
// HEAVEN, HELL or PURGATORY - each with its own dramatic backdrop (god-rays / flames / grey limbo) and
// a halo, horns or a shrug. Rendered like an RCT guest: a Location + Circle/Tier (or queue position), a
// guest "thought", and Happiness + a themed mood meter.
function applyJudgement(effect) {
  const D = window.GameData;
  const pick = (obj, verdict, salt) => {
    const arr = (obj && obj[verdict]) || ["—"];
    return arr[stableHash(`${state.gameSalt}:jd:${salt}`) % arr.length];
  };
  // The living are sorted HEAVEN or HELL only (purgatory is now reserved for aborted souls), skewed
  // toward hell. Heaven TIERS track each soul's last Sims net worth - the rich float higher.
  const bank = simBankGet();
  const wealthOf = (ch) => (bank[ch.id] != null ? bank[ch.id] : ((stableHash(`${state.gameSalt}:jdw:${ch.id}`) % 65000) - 5000));
  const verdictOf = {};
  state.board.forEach((ch) => { verdictOf[ch.id] = ["HELL", "HELL", "HELL", "HEAVEN", "HEAVEN"][stableHash(`${state.gameSalt}:judge:${ch.id}`) % 5]; });
  const heavenIds = state.board.filter((c) => verdictOf[c.id] === "HEAVEN").sort((x, y) => wealthOf(y) - wealthOf(x)).map((c) => c.id);
  const heavenTier = {};
  heavenIds.forEach((id, i) => { heavenTier[id] = heavenIds.length <= 1 ? 9 : 9 - Math.round((i / (heavenIds.length - 1)) * 8); });
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:judge:${ch.id}`);
    const verdict = verdictOf[ch.id];
    const wealth = Math.round(wealthOf(ch));
    const layer = verdict === "HEAVEN" ? heavenTier[ch.id] : 1 + ((h >>> 3) % 9);
    const mega = verdict === "HELL" && layer === 9;         // the deepest circle = MEGA HELL
    const base = verdict === "HEAVEN" ? 72 : 2;
    // Heaven: naked souls on a TRANSPARENT background (clouds show through). Hell: charred, ashen skin.
    let image = null;
    if (ch.traits && window.faceGenerator) {
      image = verdict === "HEAVEN"
        ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, background: "transparent", clothing: "bare", accessory: "none" })
        : window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, clothing: "bare", accessory: "none", skinHex: mega ? "#3a2b28" : "#4a3f3a", cheekOpacity: 0 });
    }
    assignments[ch.id] = {
      verdict, image, wealth, layer, mega,
      location: pick(D.judgementLocations, verdict, `${ch.id}:loc`),
      thought: pick(D.judgementThoughts, verdict, `${ch.id}:th`),
      happiness: Math.min(100, base + ((h >>> 5) % 26)),
      meter2: verdict === "HELL" ? 70 + ((h >>> 7) % 30) : 4 + ((h >>> 7) % 24)
    };
  });
  // Aborted souls linger in PURGATORY - rendered as a separate ghost strip on the board.
  const purgatory = (state.abortedBabies || []).map((g) => {
    let image = g.image;
    if (g.traits && window.faceGenerator) { try { image = window.faceGenerator.renderPortrait(g.seed, { ...g.traits, background: "transparent" }); } catch (e) { /* keep stored */ } }
    return { id: g.id, name: g.name, image, queuePos: 1 + (stableHash(`${state.gameSalt}:jdq:${g.id}`) % 900000) };
  });
  return { id: effect.id, name: effect.name, assignments, purgatory };
}

// SIMS Mode: every character is a Sim - a plumbob mood (green/yellow/red) floating over the head, four
// depleting need bars, whatever autonomous action they're currently doing, a career, and a simoleon
// balance.
// A tiny cross-round ledger of each character's last Sims net worth - Judgement Day reads it to rank
// heaven tiers (the rich ascend higher). Persisted so a Sims round earlier in the session still counts.
const SIM_BANK_KEY = "whoisit_sim_bank_v1";
function simBankGet() { try { return JSON.parse(localStorage.getItem(SIM_BANK_KEY) || "{}") || {}; } catch (e) { return {}; } }
function simBankSet(map) { try { localStorage.setItem(SIM_BANK_KEY, JSON.stringify(map)); } catch (e) { /* storage off */ } }
function applySims(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:sim:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:sims:${ch.id}`);
    const need = (salt) => 1 + (stableHash(`${state.gameSalt}:simn:${ch.id}:${salt}`) % 100);
    const needs = { hunger: need("hun"), social: need("soc"), bladder: need("bla"), fun: need("fun") };
    const lowest = Math.min(needs.hunger, needs.social, needs.bladder, needs.fun);
    const mood = lowest < 25 ? "red" : lowest < 55 ? "yellow" : "green";
    assignments[ch.id] = {
      mood, needs,
      action: pick(D.simsActions || ["Standing still"], `${ch.id}:a`),
      career: pick(D.simsCareers || ["Unemployed"], `${ch.id}:job`),
      simoleons: (h % 3 === 0 ? -(h % 900) : (h >>> 4) % 99000),
      ...simsPortrait(ch)   // transparent-bg portrait so relief animations move only the person
    };
  });
  const bank = simBankGet();
  state.board.forEach((ch) => { bank[ch.id] = assignments[ch.id].simoleons; });
  simBankSet(bank);
  return { id: effect.id, name: effect.name, assignments };
}
// Drag two Sims together => a SLOT MACHINE cycles the possible interactions and lands on one. The
// PG-safe set is wholesome (hug/gossip/rob/married/slap); adult games add WOOHOO + FIGHT.
const SIM_ICON = { MARRIED: "💍", SLAP: "👋", HUG: "🤗", GOSSIP: "🗣️", ROB: "🦝", FIGHT: "🥊", WOOHOO: "🛏️" };
function simReface(ch, expr) { try { return window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, expression: expr, background: "transparent" }); } catch (e) { return null; } }
function simsInteract(A, B) {
  const asg = state.global.mystery?.assignments;
  const a = asg && asg[A.id], b = asg && asg[B.id];
  if (!a || !b) return;
  if (document.querySelector(".wed-overlay")) return;      // one interaction at a time
  const PG_ACTS = ["MARRIED", "SLAP", "HUG", "GOSSIP", "ROB"];
  const ACTIONS = state.settings.pg ? PG_ACTS : [...PG_ACTS, "WOOHOO", "FIGHT"];
  const action = ACTIONS[stableHash(`${state.gameSalt}:simact:${A.id}:${B.id}`) % ACTIONS.length];
  const ov = document.createElement("div");
  ov.className = "wed-overlay";
  ov.innerHTML = `<div class="wed-stage">
      <div class="wed-title">🎰 SIMS</div>
      <div class="wed-couple">
        <img class="wed-face" src="${A.image}" alt="">
        <span class="wed-heart">↔</span>
        <img class="wed-face" src="${B.image}" alt="">
      </div>
      <div class="wed-slot"><b class="wed-slot-label">?</b></div>
    </div>`;
  document.body.appendChild(ov);
  const label = ov.querySelector(".wed-slot-label");
  const face = (act) => `${SIM_ICON[act] || "🎲"} ${act}`;
  // Rattle through the options, then lock on the chosen one.
  const stopTk = window.Sound ? window.Sound.spinTicks(1900, 95, 160) : null;
  let t = 0;
  const spin = setInterval(() => { label.textContent = face(ACTIONS[t % ACTIONS.length]); t++; }, 110);
  setTimeout(() => {
    clearInterval(spin); if (stopTk) stopTk();
    label.textContent = face(action);
    ov.classList.add("wed-locked", `act-${action.toLowerCase()}`);
    sfx("pop");
  }, 1900);
  setTimeout(() => {
    ov.remove();
    const H = {
      WOOHOO: () => simsWoohoo(A, B), SLAP: () => simsSlap(A, B, a, b), HUG: () => simsHug(A, B, a, b),
      GOSSIP: () => simsGossip(A, B, a, b), ROB: () => simsRob(A, B, a, b), FIGHT: () => simsFight(A, B, a, b),
      MARRIED: () => simsMarried(A, B, a, b)
    };
    (H[action] || H.MARRIED)();
  }, 2900);
}
// MARRIED: SUCCESS (stay together, estate wiped, both miserable) or FAILURE (divorce, split the estate
// 50/50, both blissful). Deterministic per pair.
function simsMarried(A, B, a, b) {
  const success = stableHash(`${state.gameSalt}:wed:${A.id}:${B.id}:${(a.simoleons || 0) + (b.simoleons || 0)}`) % 2 === 0;
  if (success) {
    [a, b].forEach((s) => { s.simoleons = Math.round((s.simoleons || 0) * 0.04); s.mood = "red"; s.action = "Regretting the vows"; s.needs = { ...s.needs, fun: Math.min(s.needs?.fun ?? 20, 8), social: Math.min(s.needs?.social ?? 20, 12) }; });
    flashToast("⛓️ Married — til debt do us part"); sfx("buzzer");
    bumpStat("weddings");
  } else {
    const pot = (a.simoleons || 0) + (b.simoleons || 0);
    a.simoleons = Math.round(pot / 2); b.simoleons = pot - a.simoleons;
    [a, b].forEach((s) => { s.mood = "green"; s.action = "Living their best divorced life"; s.needs = { ...s.needs, fun: Math.max(s.needs?.fun ?? 80, 90), social: Math.max(s.needs?.social ?? 80, 88) }; });
    flashToast("🕊️ Divorce — happily ever after"); sfx("coin");
    bumpStat("divorces");
  }
  const bank = simBankGet(); bank[A.id] = a.simoleons; bank[B.id] = b.simoleons; simBankSet(bank);
  renderBoard();
}
// SLAP: A wallops B. B's SOCIAL bottoms out and their face crumples (diabolically sad); A is elated.
function simsSlap(A, B, a, b) {
  const reface = (ch, expr) => { try { return window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, expression: expr, background: "transparent" }); } catch (e) { return null; } };
  b.mood = "red"; b.needs = { ...b.needs, social: 1, fun: Math.min(b.needs?.fun ?? 20, 6) }; b.action = "Reeling from that slap"; const bi = reface(B, "sad"); if (bi) b.image = bi;
  a.mood = "green"; a.needs = { ...a.needs, social: Math.max(a.needs?.social ?? 80, 96), fun: Math.max(a.needs?.fun ?? 80, 95) }; a.action = "Never felt more alive"; const ai = reface(A, "bigSmile"); if (ai) a.image = ai;
  flashToast(`👋 SLAP! ${escapeHtml(B.name)} did NOT see that coming.`);
  sfx("slap");
  renderBoard();
  const card = document.getElementById(`card-${B.id}`);
  if (card) { card.classList.remove("sim-slapped"); void card.offsetWidth; card.classList.add("sim-slapped"); }
}
const simBank = (A, B, a, b) => { const bank = simBankGet(); bank[A.id] = a.simoleons; bank[B.id] = b.simoleons; simBankSet(bank); };
// HUG: both social soars, both blissful.
function simsHug(A, B, a, b) {
  [{ ch: A, s: a }, { ch: B, s: b }].forEach(({ ch, s }) => { s.mood = "green"; s.needs = { ...s.needs, social: Math.max(s.needs?.social ?? 80, 97), fun: Math.max(s.needs?.fun ?? 70, 84) }; s.action = "Sharing a lovely hug"; const im = simReface(ch, "happy"); if (im) s.image = im; });
  flashToast(`🤗 ${escapeHtml(A.name)} + ${escapeHtml(B.name)} share a hug.`); sfx("sparkle"); renderBoard();
}
// FIGHT: both social craters, both furious.
function simsFight(A, B, a, b) {
  [{ ch: A, s: a }, { ch: B, s: b }].forEach(({ ch, s }) => { s.mood = "red"; s.needs = { ...s.needs, social: 4, fun: 6 }; s.action = "In a screaming match"; const im = simReface(ch, "angry"); if (im) s.image = im; });
  flashToast(`🥊 ${escapeHtml(A.name)} and ${escapeHtml(B.name)} throw hands!`); sfx("buzzer"); renderBoard();
  [A.id, B.id].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("sim-slapped"); void c.offsetWidth; c.classList.add("sim-slapped"); } });
}
// GOSSIP: A spills the tea and thrives; B just got dragged and wilts.
function simsGossip(A, B, a, b) {
  a.mood = "green"; a.needs = { ...a.needs, social: Math.max(a.needs?.social ?? 70, 93), fun: Math.max(a.needs?.fun ?? 70, 88) }; a.action = "Spilling the tea"; const ai = simReface(A, "happy"); if (ai) a.image = ai;
  b.mood = "red"; b.needs = { ...b.needs, social: Math.min(b.needs?.social ?? 40, 14) }; b.action = "Just got dragged"; const bi = simReface(B, "sad"); if (bi) b.image = bi;
  flashToast(`🗣️ ${escapeHtml(A.name)} spread a rumour about ${escapeHtml(B.name)}.`); sfx("laugh"); renderBoard();
}
// ROB: A cleans B out - all of B's simoleons transfer to A.
function simsRob(A, B, a, b) {
  const loot = Math.max(0, b.simoleons || 0);
  a.simoleons = (a.simoleons || 0) + loot; b.simoleons = 0;
  a.mood = "green"; a.action = "Just came into money"; const ai = simReface(A, "happy"); if (ai) a.image = ai;
  b.mood = "red"; b.needs = { ...b.needs, fun: 8 }; b.action = "Been completely cleaned out"; const bi = simReface(B, "sad"); if (bi) b.image = bi;
  simBank(A, B, a, b);
  flashToast(`🦝 ${escapeHtml(A.name)} robbed ${escapeHtml(B.name)} of §${loot.toLocaleString()}!`); sfx("coin"); renderBoard();
}
// WOOHOO: the classic Sims baby-maker (adult mode only). Reuses the shared birth animation + KEEP/ABORT.
function simsWoohoo(A, B) {
  const gayby = sameSex(A, B);
  const baby = makeBaby(A, B, gayby);
  playBirthAnimation(A.image, B.image, baby, true, () => offerKeepOrAbort(baby, () => {
    state.board.push(baby);
    if (state.global.mystery) state.global.mystery.assignments[baby.id] = { mood: "green", needs: { hunger: 92, social: 95, bladder: 70, fun: 98 }, action: "Being a fresh newborn", career: "Unemployed", simoleons: 0, ...simsPortrait(baby) };
    if (baby.isGayby) persistGayby(baby);
    netAnnounceBaby(baby); scheduleSave();
    state.justBorn = baby.id;
    if (typeof addLog === "function") addLog(`${A.name} + ${B.name} woohoo'd — baby ${baby.name}!`);
    renderBoard();
    state.justBorn = null;
  }, () => abortBaby(baby, A, B)), { woohoo: true });
}

// HEADS ONLY: no cards at all - just every character's floating head (+ name) drifting around the
// board, morphing between formations (circle, figure-8, grid, spiral, heart, wave). Heads render with
// a transparent background so only the head shows.
function applyHeadsOnly(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    const image = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, headOnly: true })
      : ch.image;
    assignments[ch.id] = { image };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// ASTROLOGY: every character gets a sun / moon / rising sign, an element, a daily horoscope, a toxic
// trait, and a Mercury-retrograde status.
function applyAstrology(effect) {
  const D = window.GameData;
  const signs = D.astrologySigns || [["Scorpio", "♏", "Water"]];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:astro:${ch.id}`);
    const sun = signs[h % signs.length];
    const moon = signs[(h >>> 4) % signs.length];
    const rising = signs[(h >>> 8) % signs.length];
    assignments[ch.id] = {
      sun: { name: sun[0], glyph: sun[1], element: sun[2] },
      moon: moon[1], rising: rising[1],
      element: sun[2],
      horoscope: (D.astrologyHoroscopes || ["The stars are unclear."])[(h >>> 3) % (D.astrologyHoroscopes || [1]).length],
      toxic: (D.astrologyToxic || ["ghosts everyone"])[(h >>> 6) % (D.astrologyToxic || [1]).length],
      retro: (h >>> 11) % 3 === 0
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// PANTONE: an early, purely-aesthetic mode. Each card is restyled as a Pantone colour chip - the
// character's (harmonised) background is matched to the nearest real Pantone swatch, and the plate
// shows the wordmark + code + colour name under their name. Nothing is repainted; it's a lens.
const PANTONE_COLORS = [
  // pinks / roses
  { c: "13-1520", n: "Rose Quartz", h: "#f7cbcb" }, { c: "15-1816", n: "Pink Nectar", h: "#e5a4ac" },
  { c: "14-1714", n: "Candy Pink", h: "#f4bbc7" }, { c: "15-2215", n: "Sachet Pink", h: "#e8909c" },
  { c: "16-1720", n: "Confetti", h: "#e58fa1" }, { c: "17-2031", n: "Fandango Pink", h: "#d4517f" },
  { c: "13-2807", n: "Ballerina", h: "#eec9d2" }, { c: "14-2710", n: "Pink Lavender", h: "#dcb1cc" },
  { c: "15-2705", n: "Orchid Bloom", h: "#d6a9c6" }, { c: "14-3204", n: "Pink Tint", h: "#e2d3dc" },
  // reds / corals
  { c: "16-1546", n: "Living Coral", h: "#ff6f61" }, { c: "16-1548", n: "Coral", h: "#f88379" },
  { c: "17-1463", n: "Tangerine Tango", h: "#dd4124" }, { c: "19-1664", n: "True Red", h: "#bf1932" },
  { c: "18-1438", n: "Marsala", h: "#955251" }, { c: "16-1626", n: "Dubarry", h: "#f4737e" },
  { c: "15-1327", n: "Peach Nougat", h: "#e6a086" },
  // oranges / peach
  { c: "14-1231", n: "Peach Cobbler", h: "#f5b183" }, { c: "13-1023", n: "Apricot Ice", h: "#f6c9a6" },
  { c: "16-1359", n: "Orange Tiger", h: "#f96714" }, { c: "14-1050", n: "Amberglow", h: "#e08e45" },
  { c: "13-0947", n: "Golden Apricot", h: "#e0a058" },
  // yellows / butters
  { c: "12-0824", n: "Pale Banana", h: "#f4e6a0" }, { c: "13-0851", n: "Lemon Drop", h: "#f2df66" },
  { c: "12-0722", n: "Custard", h: "#e8d99a" }, { c: "13-0755", n: "Primrose Yellow", h: "#efc93b" },
  { c: "11-0620", n: "Vanilla Custard", h: "#f0e3bb" }, { c: "14-0754", n: "Ceylon Yellow", h: "#d8ab4e" },
  // greens
  { c: "13-0317", n: "Green Ash", h: "#c0d3b0" }, { c: "14-0223", n: "Nile Green", h: "#a8c17f" },
  { c: "15-0343", n: "Greenery", h: "#88b04b" }, { c: "16-0142", n: "Kelly Green", h: "#4a944e" },
  { c: "12-0225", n: "Lime Cream", h: "#dfe8ad" }, { c: "14-6329", n: "Spearmint", h: "#7bbb8f" },
  { c: "13-6009", n: "Aqua Foam", h: "#a7cbb6" }, { c: "13-0221", n: "Butterfly", h: "#c8d99a" },
  // teals / cyans
  { c: "15-5217", n: "Cockatoo", h: "#58c9b9" }, { c: "14-4816", n: "Aruba Blue", h: "#69cbc9" },
  { c: "16-5127", n: "Turquoise", h: "#45b8ac" }, { c: "13-5309", n: "Pastel Turquoise", h: "#9dd5cd" },
  { c: "15-4712", n: "Dusty Aqua", h: "#8fc7c2" },
  // blues
  { c: "14-4318", n: "Cloud Blue", h: "#a8c3d1" }, { c: "14-4122", n: "Ballad Blue", h: "#a3bcd4" },
  { c: "15-3920", n: "Serenity", h: "#92a8d1" }, { c: "16-4132", n: "Little Boy Blue", h: "#6f9bd1" },
  { c: "18-4141", n: "Classic Blue", h: "#2a4d7b" }, { c: "13-4304", n: "Bit of Blue", h: "#dbe4e6" },
  { c: "13-4411", n: "Corydalis Blue", h: "#c1d3df" }, { c: "12-4607", n: "Clearwater", h: "#b6d7d5" },
  // purples / lavender
  { c: "14-3710", n: "Lavender Fog", h: "#c9bcd4" }, { c: "16-3320", n: "Sheer Lilac", h: "#b294bb" },
  { c: "18-3838", n: "Ultra Violet", h: "#5f4b8b" }, { c: "15-3817", n: "Lavender", h: "#b7add0" },
  // neutrals / browns
  { c: "11-0602", n: "Snow White", h: "#f2f0eb" }, { c: "13-4108", n: "Nimbus Cloud", h: "#d4d5d8" },
  { c: "15-4101", n: "High-rise Grey", h: "#b8bdc4" }, { c: "11-0107", n: "Almond Buff", h: "#e6dcc8" },
  { c: "13-1108", n: "Bone Beige", h: "#dccfbb" }, { c: "17-1052", n: "Buckthorn Brown", h: "#b07636" },
  { c: "19-1218", n: "Chocolate", h: "#5a3a29" }, { c: "19-4005", n: "Pirate Black", h: "#2b2b2c" },
  // Expanded library - a dense spread across the full wheel so any mixed colour maps to a distinct name.
  { c: "18-1763", n: "Poinsettia", h: "#cd202c" }, { c: "17-1664", n: "Poppy Red", h: "#dc343b" }, { c: "18-1660", n: "Tomato", h: "#c63b2f" },
  { c: "19-1557", n: "Chili Pepper", h: "#9b1b30" }, { c: "18-1550", n: "Aurora Red", h: "#b13b3b" }, { c: "17-1927", n: "Bubblegum", h: "#ee9dc0" },
  { c: "15-1912", n: "Quartz Pink", h: "#e4a0a8" }, { c: "14-2311", n: "Prism Pink", h: "#e6a4c4" }, { c: "16-2118", n: "Aurora Pink", h: "#e5779b" },
  { c: "18-2436", n: "Raspberry", h: "#b3325a" }, { c: "19-2434", n: "Beaujolais", h: "#80304c" }, { c: "18-1633", n: "Baroque Rose", h: "#b05f6d" },
  { c: "16-1526", n: "Terra Cotta", h: "#e28b7a" }, { c: "15-1523", n: "Peach Beige", h: "#e5b09c" }, { c: "14-1420", n: "Peach Pink", h: "#f4b6a0" },
  { c: "17-1937", n: "Hot Pink", h: "#e55982" }, { c: "15-2217", n: "Carmine Rose", h: "#e35a8d" }, { c: "18-2333", n: "Fuchsia Red", h: "#ab3373" },
  { c: "19-1663", n: "Racing Red", h: "#bd2635" }, { c: "16-1520", n: "Rose Tan", h: "#e0a89a" }, { c: "16-1364", n: "Vibrant Orange", h: "#ff7420" },
  { c: "15-1263", n: "Autumn Sunset", h: "#f88f47" }, { c: "14-1139", n: "Iceland Poppy", h: "#f2ad4a" }, { c: "16-1449", n: "Orange Ochre", h: "#e58637" },
  { c: "15-1247", n: "Tangerine", h: "#f79256" }, { c: "13-1114", n: "Sun Kiss", h: "#f0cfa0" }, { c: "12-0915", n: "Cornhusk", h: "#f2dfb2" },
  { c: "13-1030", n: "Impala", h: "#f4d29a" }, { c: "16-1145", n: "Nugget Gold", h: "#c08a3e" }, { c: "16-1546", n: "Coral Rose", h: "#f0876a" },
  { c: "15-1340", n: "Mock Orange", h: "#f6a04d" }, { c: "14-1064", n: "Saffron", h: "#f4a838" }, { c: "13-0858", n: "Empire Yellow", h: "#f6c500" },
  { c: "14-0847", n: "Freesia", h: "#e5b93a" }, { c: "12-0736", n: "Buttercup", h: "#f4d444" }, { c: "11-0710", n: "Transparent Yellow", h: "#f4eeb2" },
  { c: "13-0632", n: "Limelight", h: "#e3e08b" }, { c: "12-0740", n: "Aspen Gold", h: "#f6d55b" }, { c: "14-0952", n: "Spectra Yellow", h: "#f0b323" },
  { c: "12-0642", n: "Blazing Yellow", h: "#fce300" }, { c: "14-0446", n: "Bright Chartreuse", h: "#a5b736" }, { c: "15-0533", n: "Green Oasis", h: "#a4ab5a" },
  { c: "16-0435", n: "Peapod", h: "#8ba14b" }, { c: "15-6442", n: "Online Lime", h: "#79993a" }, { c: "16-0439", n: "Macaw Green", h: "#6f8f3a" },
  { c: "18-0135", n: "Online Green", h: "#3f7d3f" }, { c: "17-6229", n: "Fairway", h: "#3f915e" }, { c: "16-6444", n: "Vibrant Green", h: "#4fa64f" },
  { c: "15-6340", n: "Classic Green", h: "#4a9d5b" }, { c: "14-0156", n: "Green Flash", h: "#78bb44" }, { c: "13-0220", n: "Paradise Green", h: "#b6d97a" },
  { c: "12-0322", n: "Seafoam Green", h: "#c3d5a4" }, { c: "14-6408", n: "Desert Sage", h: "#a3ad8e" }, { c: "16-0110", n: "Turf Green", h: "#5a7247" },
  { c: "18-0130", n: "Garden Green", h: "#3a6b35" }, { c: "13-0648", n: "Sulphur Spring", h: "#d5d717" }, { c: "17-5641", n: "Emerald", h: "#009874" },
  { c: "16-5533", n: "Arcadia", h: "#00a28a" }, { c: "15-5519", n: "Turquoise", h: "#3bc6b8" }, { c: "14-4522", n: "Blue Curacao", h: "#37b6c4" },
  { c: "15-4825", n: "Scuba Blue", h: "#00a3c6" }, { c: "16-4535", n: "Bluebird", h: "#009bbf" }, { c: "14-4620", n: "Aqua Sky", h: "#7bc4c4" },
  { c: "13-4909", n: "Bleached Aqua", h: "#c1dcd8" }, { c: "12-5209", n: "Bimini Blue", h: "#b7dbdd" }, { c: "16-5121", n: "Lagoon", h: "#4c9a94" },
  { c: "18-4936", n: "Deep Lake", h: "#0f6d78" }, { c: "13-5412", n: "Aquifer", h: "#9dd0cf" }, { c: "18-4045", n: "Directoire Blue", h: "#1f4b99" },
  { c: "19-4052", n: "Classic Blue", h: "#0f4c81" }, { c: "18-4148", n: "Diva Blue", h: "#0079b5" }, { c: "17-4247", n: "Cendre Blue", h: "#3a7ca5" },
  { c: "16-4020", n: "Blue Bell", h: "#93aac7" }, { c: "15-3919", n: "Placid Blue", h: "#8aaad4" }, { c: "14-4115", n: "Cerulean", h: "#9bb7d4" },
  { c: "13-4308", n: "Ballad Blue", h: "#c1cdd6" }, { c: "14-4318", n: "Cerulean Sky", h: "#a7c1d2" }, { c: "18-3949", n: "Deep Ultramarine", h: "#39477f" },
  { c: "19-3952", n: "Surf the Web", h: "#2a4b9b" }, { c: "16-4032", n: "Little Boy Blue", h: "#7aa2d6" }, { c: "19-4029", n: "True Navy", h: "#33455f" },
  { c: "18-3224", n: "Radiant Orchid", h: "#ad5e99" }, { c: "17-3617", n: "Dahlia Purple", h: "#7f6497" }, { c: "16-3521", n: "Bougainvillea", h: "#9a6d9e" },
  { c: "15-3620", n: "Lavendula", h: "#a58fc0" }, { c: "14-3711", n: "Lavender Blue", h: "#b7b9d8" }, { c: "17-3628", n: "Amethyst Orchid", h: "#9866b0" },
  { c: "19-3536", n: "Imperial Palace", h: "#5c3a63" }, { c: "18-3418", n: "Purple Passion", h: "#66507a" }, { c: "19-3542", n: "Prism Violet", h: "#59315f" },
  { c: "13-3405", n: "Orchid Ice", h: "#d9c6d6" }, { c: "18-1048", n: "Monks Robe", h: "#6d4832" }, { c: "17-1230", n: "Mocha Mousse", h: "#a47864" },
  { c: "16-1235", n: "Tawny Birch", h: "#c08552" }, { c: "15-1315", n: "Warm Sand", h: "#d6b89a" }, { c: "14-1116", n: "Sand", h: "#dcc9a8" },
  { c: "13-1008", n: "Oatmeal", h: "#dccdb4" }, { c: "16-1414", n: "Cork", h: "#b79d80" }, { c: "17-1418", n: "Cognac", h: "#9c6b4a" },
  { c: "19-1220", n: "Coffee Bean", h: "#4a3327" }, { c: "18-0625", n: "Olive Drab", h: "#6a6338" }, { c: "16-0928", n: "Prairie Sand", h: "#c19a52" },
  { c: "15-1216", n: "Cuban Sand", h: "#c9a889" }, { c: "11-4001", n: "Brilliant White", h: "#edf1f4" }, { c: "12-4302", n: "Cloud Dancer", h: "#f0eee9" },
  { c: "14-4002", n: "Silver", h: "#bcbdc0" }, { c: "15-4003", n: "Dawn Blue", h: "#a2a9ab" }, { c: "17-4405", n: "Neutral Grey", h: "#8f9192" },
  { c: "18-0601", n: "Pewter", h: "#67686a" }, { c: "19-4007", n: "Anthracite", h: "#28292b" }, { c: "18-1306", n: "Fossil", h: "#79736b" },
  { c: "16-1305", n: "Aluminum", h: "#a29c94" }, { c: "19-0303", n: "Jet Black", h: "#2a2a2c" },
];
const PANTONE_VARIANCE_FAMILIES = [
  ["Rosewood", 348], ["Cerise", 338], ["Flamingo", 4], ["Vermilion", 12],
  ["Persimmon", 22], ["Amber", 34], ["Sunflower", 48], ["Lemon", 58],
  ["Citron", 72], ["Sprout", 92], ["Clover", 122], ["Juniper", 146],
  ["Jade", 162], ["Seafoam", 174], ["Lagoon", 188], ["Glacier", 198],
  ["Azure", 208], ["Denim", 222], ["Cobalt", 238], ["Iris", 252],
  ["Violet", 270], ["Orchid", 292], ["Magenta", 316], ["Mulberry", 330]
];
const PANTONE_VARIANCE_STEPS = [
  ["Tint", "11", 34, 91], ["Mist", "12", 42, 83], ["Bloom", "13", 50, 75],
  ["Wash", "14", 44, 66], ["Pop", "15", 62, 56], ["Satin", "16", 58, 46],
  ["Velvet", "18", 50, 34], ["Shadow", "19", 42, 23]
];
const PANTONE_NEUTRAL_VARIANCES = [
  { c: "11-2000", n: "Porcelain Tint", h: "#f5f0e8" }, { c: "12-2001", n: "Rice Paper", h: "#eee6d8" },
  { c: "13-2002", n: "Warm Plaster", h: "#dfd4c4" }, { c: "14-2003", n: "Linen Grey", h: "#cbc7bd" },
  { c: "15-2004", n: "Pumice", h: "#b6b0a6" }, { c: "16-2005", n: "Wet Cement", h: "#99968e" },
  { c: "17-2006", n: "Smoke Taupe", h: "#767168" }, { c: "18-2007", n: "Graphite Wash", h: "#555452" },
  { c: "19-2008", n: "Soft Black", h: "#222326" }, { c: "13-2100", n: "Milk Glass", h: "#eef2ef" },
  { c: "14-2101", n: "Blue Chalk", h: "#ced8dc" }, { c: "15-2102", n: "Storm Pearl", h: "#aeb8bf" },
  { c: "16-2103", n: "Steel Wool", h: "#8d969c" }, { c: "17-2104", n: "Slate Pencil", h: "#68727b" },
  { c: "18-2105", n: "Ink Wash", h: "#3f4852" }, { c: "19-2106", n: "Night Charcoal", h: "#1c222b" }
];
function pantoneHslToHex(h, s, l) {
  s /= 100; l /= 100;
  const k = (n) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  return "#" + [f(0), f(8), f(4)].map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");
}
const PANTONE_VARIANCE_COLORS = PANTONE_VARIANCE_FAMILIES.flatMap(([family, hue], familyIndex) =>
  PANTONE_VARIANCE_STEPS.map(([suffix, level, sat, light], stepIndex) => ({
    c: `${level}-${String(1000 + familyIndex * 10 + stepIndex).padStart(4, "0")}`,
    n: `${family} ${suffix}`,
    h: pantoneHslToHex(hue, sat, light)
  }))
).concat(PANTONE_NEUTRAL_VARIANCES);
const PANTONE_SWATCHES = (() => {
  const out = [], codes = new Set(), names = new Set();
  [...PANTONE_COLORS, ...PANTONE_VARIANCE_COLORS].forEach((p) => {
    const code = String(p.c).toLowerCase();
    const name = String(p.n).toLowerCase();
    if (codes.has(code) || names.has(name)) return;
    codes.add(code); names.add(name); out.push(p);
  });
  return out;
})();
function pantoneRgb(hex) { const h = hex.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function pantoneDist(a, b) {
  // "redmean" weighted distance - matches perceived colour closeness better than raw RGB.
  const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
}
function nearestPantone(hex, avoidCodes = []) {
  const t = pantoneRgb(hex);
  const avoid = new Set(avoidCodes.filter(Boolean));
  let best = null, bd = Infinity, fallback = PANTONE_SWATCHES[0], fd = Infinity;
  for (const p of PANTONE_SWATCHES) {
    const d = pantoneDist(t, pantoneRgb(p.h));
    if (d < fd) { fd = d; fallback = p; }
    if (!avoid.has(p.c) && d < bd) { bd = d; best = p; }
  }
  return best || fallback;
}
function applyPantone(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    const bg = (ch.traits && ch.traits.background) || "#cccccc";
    const p = nearestPantone(bg);
    assignments[ch.id] = { code: p.c, name: p.n, hex: p.h };
  });
  return { id: effect.id, name: effect.name, assignments };
}
function skinHexOf(ch) {
  const tb = window.faceGenerator && window.faceGenerator.traitBook;
  if (ch.traits && ch.traits.skinHex) return ch.traits.skinHex;
  const name = ch.traits && ch.traits.skin;
  return (tb && tb.skinToneHex && tb.skinToneHex[name]) || "#c88968";
}
// Bleed two suspects into each other like wet paint: each one shifts PART-way toward the other (not
// all the way to a shared midpoint), so they end up related-but-distinct instead of identical. Their
// Pantone chips re-derive from each new shade. Repeatable, so you can keep nudging the board together.
const PANTONE_MIX_T = 0.4;          // how far each moves toward the other (0 = no change, 0.5 = identical)
function mixPantonePair(A, B) {
  const bgA = (A.traits && A.traits.background) || "#cccccc", bgB = (B.traits && B.traits.background) || "#cccccc";
  const skinA = skinHexOf(A), skinB = skinHexOf(B);
  const asg = state.global.mystery && state.global.mystery.assignments;
  // A touch of per-character random jitter on the blend so the two never round to the SAME Pantone tag
  // (retry the jitter a few times until their nearest chips differ).
  const shift = (ch, ownBg, otherBg, ownSkin, otherSkin, avoidCode) => {
    const baseBg = mixHex(ownBg, otherBg, PANTONE_MIX_T);
    const bg = avoidCode ? baseBg : jitterHex(baseBg, 0.03);
    const p = nearestPantone(bg, avoidCode ? [avoidCode] : []);
    ch.traits = { ...ch.traits, background: bg, skinHex: jitterHex(mixHex(ownSkin, otherSkin, PANTONE_MIX_T), 0.03) };
    delete ch.traits.skin;          // let the mixed hex render instead of the named palette tone
    ch.image = window.faceGenerator.renderPortrait(ch.seed, ch.traits);
    if (asg) asg[ch.id] = { code: p.c, name: p.n, hex: p.h };
    return p.c;
  };
  const codeA = shift(A, bgA, bgB, skinA, skinB, null);
  shift(B, bgB, bgA, skinB, skinA, codeA);          // B avoids landing on A's exact Pantone
  renderBoard();
  [A.id, B.id].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("pantone-mix"); void c.offsetWidth; c.classList.add("pantone-mix"); } });
}

// HORNY POTTER: Harry Potter, but filthy. Everyone is sorted into a house with a wand + a favourite
// (real) spell interpreted lewdly. A few are house-less Death Eaters (Unforgivable Curses), and ONE
// is the Dark Lord - repainted bald and pasty, no house.
function applyHornyPotter(effect) {
  const D = window.GameData;
  const houses = D.hpHouses || [["Gryffindor", "#7a0f18", "🦁", "reckless"]];
  const spells = D.hpSpells || [["Lumos", "turns them on"]];
  const dark = D.hpDarkSpells || [["Imperio", "total control"]];
  const woods = D.hpWandWoods || ["Elder"], cores = D.hpWandCores || ["dragon heartstring"], flexes = D.hpWandFlex || ["rigid"];
  const patronuses = D.hpPatronuses || ["a wet raccoon"], boggarts = D.hpBoggarts || ["commitment"], horcruxes = D.hpHorcruxes || ["a buttplug"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:hp:${salt}`) % arr.length];
  const order = deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:sort`);
  // Exactly one poor soul (never the Dark Lord at index 0) is packing a very cursed "wand".
  const cursedIdx = order.length > 1 ? 1 + (stableHash(`${state.gameSalt}:hp:cursed`) % (order.length - 1)) : -1;
  const assignments = {};
  // Re-render a portrait onto a per-character-VARIED tint of a base colour, so every card's background
  // reads as its house (or its dark faction) without two cards sharing the exact same shade.
  const tinted = (ch, base, toward, lo, hi, extra) => {
    if (!(ch.traits && window.faceGenerator)) return null;
    const h = stableHash(`${state.gameSalt}:hp:tint:${ch.id}`);
    const t = lo + ((h % 1000) / 1000) * (hi - lo);
    return window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, ...(extra || {}), background: mixHex(base, toward, t) });
  };
  order.forEach((ch, i) => {
    const h = stableHash(`${state.gameSalt}:hp:${ch.id}`);
    let wand = `${woods[h % woods.length]}, ${cores[(h >>> 3) % cores.length]} core, ${flexes[(h >>> 6) % flexes.length]}`;
    if (i === cursedIdx) wand = "Flesh, human hair, actually his cock";
    const gender = hpGenderLabel(ch);
    const smokeDelay = -((h >>> 2) % 800) / 100;   // per-death-eater smoke offset (never in sync)
    if (i === 0) {                                   // the single Dark Lord - pasty repaint on a dark tint
      const image = tinted(ch, "#101018", "#2b2740", 0.1, 0.5, { hair: "bald", hairLocks: [], accessory: "none", skinHex: "#e6e7de", browThick: 0.15, noseScale: 0.62, lipColor: "#b7a6a6" });
      const s = dark[(h >>> 9) % dark.length];
      assignments[ch.id] = { role: "darklord", house: "The Dark Lord", color: "#3a3358", crest: "☇", wand: "Elder, thestral tail-hair core, unyielding", spell: s[0], spellHint: s[1], horcrux: pick(horcruxes, `hx:${ch.id}`), image, gender, smokeDelay };
      return;
    }
    if (h % 5 === 0) {                               // ~1 in 5 are house-less Death Eaters - smoky dark card
      const s = dark[(h >>> 9) % dark.length];
      const image = tinted(ch, "#1a1420", "#3a2846", 0.15, 0.55);
      assignments[ch.id] = { role: "deatheater", house: "Death Eater", color: "#5a3a6e", crest: "☠", wand, spell: s[0], spellHint: s[1], horcrux: pick(horcruxes, `hx:${ch.id}`), image, gender, smokeDelay };
      return;
    }
    const house = houses[(h >>> 4) % houses.length];
    const s = spells[(h >>> 9) % spells.length];
    const image = tinted(ch, house[1], "#f7f3ea", 0.44, 0.6);   // VIBRANT house tint (clearly the colour), per-char varied
    assignments[ch.id] = { role: "house", house: house[0], color: house[1], crest: house[2], vibe: house[3], wand, spell: s[0], spellHint: s[1], patronus: pick(patronuses, `pat:${ch.id}`), boggart: pick(boggarts, `bog:${ch.id}`), image, gender };
  });
  return { id: effect.id, name: effect.name, assignments };
}
// JK Rowling's "gender detector": crude, confident and wrong. Everyone is stamped MALE or FEMALE by
// how the game reckons they "should" present (they/them people get force-binaried) - except the two
// deliberately-broken cases: Olivia is misgendered MALE, and non-white characters get racialised
// labels (Kai -> ASIAN, dark-skinned -> ETHNIC) instead of a gender. It's satire of the bigoted logic.
function hpGenderLabel(ch) {
  if (ch.id === "gen-olivia") return "MALE";
  if (ch.id === "gen-kai") return "ASIAN";
  if (["brown", "deep", "ebony"].includes(ch.traits && ch.traits.skin)) return "ETHNIC";
  if (ch.pronouns === "he") return "MALE";
  if (ch.pronouns === "she") return "FEMALE";
  return (Number(ch.traits && ch.traits.bust) || 0) > 0.15 ? "FEMALE" : "MALE";   // they/them -> forced binary
}
// Dark Lord's kill: a green killing-curse flash over the victim's card, then they're crossed off (the
// HP way to mark a NO). If already down, un-cross them (drag the Dark Lord on again to revive).
function avadaKedavra(ch) {
  const card = document.getElementById(`card-${ch.id}`);
  const alreadyDown = currentPlayer().eliminated.has(ch.id);
  if (card && !alreadyDown) {
    card.classList.remove("hp-avada-hit"); void card.offsetWidth; card.classList.add("hp-avada-hit");
    const flash = document.createElement("div");
    flash.className = "hp-avada-flash";
    card.querySelector(".portrait-wrap")?.appendChild(flash);
  }
  flashToast(alreadyDown ? `✨ Finite — ${ch.name} rises again.` : `☠ Avada Kedavra — ${ch.name} is no more.`);
  sfx(alreadyDown ? "sparkle" : "boom");
  if (!alreadyDown) bumpStat("avadas");
  setTimeout(() => toggleEliminated(ch.id), alreadyDown ? 60 : 500);
}

// HABBO HOTEL: an isometric room. Every character becomes a blocky Habbo-style avatar (a pixelated
// head on a shirt-coloured body) standing on an iso floor. Click an avatar to select it, then click a
// tile to walk them there.
// Which APPROVED avatar a character wears in the hotel. Babies/new creations never get their own
// Habbo avatar (no runtime fetching, no approval card): they INHERIT a parent's approved sprite -
// the first parent with a manifest entry wins.
// A deterministic spare for anyone without a bespoke/parent avatar (gaybys, new creations, and base
// characters beyond the 40 hand-approved ones). Stable per character + salt so both peers agree and
// it doesn't reshuffle between renders.
function spareAvatarId(character) {
  const spares = window.HabboSpareAvatars || {};
  const keys = Object.keys(spares);
  if (!keys.length) return null;                     // no spares loaded -> classic figure fallback
  return keys[stableHash(`${state.gameSalt}:habbospare:${character.id}`) % keys.length];
}
function getHabboAvatarId(character) {
  if (!character) return null;
  const sprites = window.HabboAvatarSprites || {};
  const isCreation = character.isBaby || character.isGayby || character.isNewCreation
    || character.parentId || character.sourceParentId || character.generatedFrom || character.createdFrom
    || (Array.isArray(character.parents) && character.parents.length);
  if (isCreation) {
    const candidates = []
      .concat(Array.isArray(character.parents) ? character.parents : [])
      .concat([character.parentId, character.sourceParentId, character.generatedFrom, character.createdFrom])
      .filter(Boolean)
      .map((p) => (typeof p === "object" ? p.id : p));
    for (const pid of candidates) if (sprites[pid]) return pid;   // inherit a parent's approved sprite
    return spareAvatarId(character);                 // else a random spare (no more plain blocky body)
  }
  return sprites[character.id] ? character.id : spareAvatarId(character);
}
// Sprite entry by id: a bespoke approved avatar, else one of the generated spares. Same shape either way.
function habboSpritesById(id) {
  return (window.HabboAvatarSprites || {})[id] || (window.HabboSpareAvatars || {})[id] || null;
}
// The sprite src for a figure: requested direction if it exists, else d3, else the default body.
// Facing left = SW (dir 5), facing right = SE (dir 3); walking swaps to the walk frame set.
// Cache-busted with the manifest version so re-approved PNGs actually show up.
// The character's FACE in Habbo mode: the FRONT-FACING d3 pose (cropped to the head via CSS so it
// reads like the game's other portraits), falling back to the .head asset, then null so callers use
// the pixelated generated portrait.
function habboFaceSrc(a) {
  const src = a && a.sprites && ((a.sprites.directions || {})["3"] || a.sprites.head);
  return src ? `${src}?v=${window.HabboAvatarVersion || 1}` : null;
}
function habboSpriteSrc(entry, facingRight, walking) {
  if (!entry) return null;
  // These sheets are fetched one step off the classic compass: our d3 is the FRONT pose and d5 a
  // full side profile. The isometric room wants the Habbo THREE-QUARTER views - d2 (facing right)
  // and d4 (facing left) - for BOTH idle and walking, so a figure keeps the same silhouette when it
  // starts moving instead of snapping from a front pose to a side profile ("different person" bug).
  const dir = facingRight ? "2" : "4";
  const idle = entry.directions || {};
  const set = walking && entry.walk ? entry.walk : idle;
  const src = set[dir] || idle[dir] || set["3"] || idle["3"] || entry.body;
  return src ? `${src}?v=${window.HabboAvatarVersion || 1}` : null;
}
// Re-point a figure's <img> at the sprite matching its current facing/walking state.
function updateHabboFigSprite(el) {
  const img = el && el.querySelector && el.querySelector(".hb-avatar");
  if (!img) return;
  const a = state.global.mystery?.assignments?.[el.dataset.id];
  if (!a || !a.sprites) return;
  const src = habboSpriteSrc(a.sprites, el.classList.contains("hb-face-r"), el.classList.contains("walking"));
  if (src && img.getAttribute("src") !== src) img.setAttribute("src", src);
}

// HABBO HOTEL: an isometric room. Every character renders as their APPROVED local Habbo sprite
// (assets/habbo/avatars + avatar manifest; zero runtime Habbo API calls). Click an avatar to
// select it, then click a tile to walk them there.
function applyHabbo(effect) {
  const tb = window.faceGenerator?.traitBook;
  const assignments = {};
  state.board.forEach((ch) => {
    const head = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, headOnly: true })
      : ch.image;
    const shirt = ch.traits?.shirt || (tb?.skinToneHex?.[ch.traits?.skin]) || "#4a90e2";
    // Bespoke sprite -> inherited parent sprite -> a deterministic generated spare (getHabboAvatarId);
    // only characters with no spares available at all fall back to the classic head+CSS-body figure.
    const sprites = habboSpritesById(getHabboAvatarId(ch));
    assignments[ch.id] = {
      head, shirt, sprites,
      avatar: sprites ? habboSpriteSrc(sprites, false, false) : null,
      avatarHead: sprites ? sprites.head : null
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Special Disguise: the WOMEN get a neutral full-face covering (a single eye slit); everyone else is
// stripped to a bald head + hat + plain white top instead. A generic concealing wrap, not religious.
// Rough Latin->Arabic-script transliteration (looks the part, not linguistically exact) + an
// exaggerated phonetic spelling (Olivia -> OH-LEE-VEE-AHHH).
const ARABIC_MAP = { a: "ا", b: "ب", c: "ك", d: "د", e: "ي", f: "ف", g: "ج", h: "ه", i: "ي", j: "ج", k: "ك", l: "ل", m: "م", n: "ن", o: "و", p: "ب", q: "ق", r: "ر", s: "س", t: "ت", u: "و", v: "ف", w: "و", x: "كس", y: "ي", z: "ز" };
function arabicize(name) {
  return [...name.toLowerCase()].map((c) => ARABIC_MAP[c] || "").join("‌") || "؟";
}
function phonetic(name) {
  const V = { a: "AH", e: "EH", i: "EE", o: "OH", u: "OO", y: "EE" };
  const syl = []; let cons = "";
  for (const c of name.toLowerCase()) {
    if (V[c]) { syl.push(cons.toUpperCase() + V[c]); cons = ""; } else if (/[a-z]/.test(c)) cons += c;
  }
  if (cons) syl.push(cons.toUpperCase());
  let s = syl.join("-") || name.toUpperCase();
  return s.replace(/(AH|EH|OH|OO)$/, "$1HH").replace(/(EE)$/, "EEEE");   // stretch the final vowel
}
function applyDisguise(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    let image = null;
    if (ch.traits && window.faceGenerator) {
      // Two incognito looks: balaclava crew go pure black; turban crew go clean white.
      image = ch.pronouns === "she"
        ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, disguise: true, disguiseColor: "#0c0c0f", accessoryColor: "#0b0b0d", shirt: "#0b0b0d" })
        : window.faceGenerator.renderPortrait(ch.seed, {
          ...ch.traits, hair: "bald", hairLocks: [], beardLength: 0,
          accessory: "turban", accessoryColor: "#eceae2", accessoryY: 0, accessoryScale: 1,
          clothing: (ch.traits.clothing === "bare" || ch.traits.clothing === "singlet") ? "tee" : ch.traits.clothing,
          shirt: "#ededea"
        });
    }
    assignments[ch.id] = { image, arabic: arabicize(ch.name), phon: phonetic(ch.name) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Work Mode: a Soviet-labour-camp readout. Everyone's a bald, browless, pasty husk; each gets a days-
// remaining sentence and a secret stash of contraband (shivs etc.). Gulag energy.
function applyWork(effect) {
  const stash = (window.GameData && window.GameData.workInventory) || ["Shiv"];
  const assignments = {};
  state.board.forEach((ch) => {
    const image = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, {
        ...ch.traits, hair: "bald", hairLocks: [], noBrows: true,
        skinHex: "#e9ddd2", cheekOpacity: 0, beardLength: 0,
        build: 40, bodyWidth: 0.66, shoulderSlope: 1, bust: 0    // starved, tiny frail torso (head unchanged)
      })
      : null;
    const h = stableHash(`${state.gameSalt}:work:${ch.id}`);
    const days = 1 + (h % 9000);
    const n = 1 + ((h >>> 4) % 3);
    const items = [];
    for (let k = 0; k < n; k++) {
      const it = stash[stableHash(`${state.gameSalt}:wk:${ch.id}:${k}`) % stash.length];
      if (!items.includes(it)) items.push(it);
    }
    assignments[ch.id] = { image, days, items };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// LINKEDIN Mode: the corporate-hellscape sibling of WORK. Every face becomes a profile - job title,
// company, 1-3 endorsed skills with (absurd) endorsement counts, and a ~30% chance of the green
// #OpenToWork ring. A generated brainrot post feed rides above the board (see renderLinkedinTicker).
// All content is salt-deterministic so online peers see the same profiles and the same feed.
// Curated banner slugs for POWER-tier profiles: professional/aspirational locations whose day
// banner art is known to exist in assets/locations/ (so no 404s). POWER always gets one.
const LI_BANNER_SLUGS = [
  "office", "rooftop", "hotel_lobby", "airport_lounge", "art_gallery", "museum_lobby",
  "library", "cafe", "wine_cellar", "spa", "greenhouse", "restaurant", "bookstore", "theater"
];
// Skin-tone band → surname pool. Display-only representation (real surnames, no caricature).
const SURNAME_BUCKET = {
  porcelain: "anglo", fair: "anglo",
  olive: "european", tan: "european", fakeTan: "european",
  amber: "medSouth", brown: "medSouth",
  deep: "african", ebony: "african"
};
// "JOEL" → "Joel", "MARY-JANE" → "Mary-Jane" (display only; character.name is never mutated).
function toSentenceCase(name) {
  return String(name || "").toLowerCase().replace(/(^|[\s'-])([a-z])/g, (_, sep, ch) => sep + ch.toUpperCase());
}
function applyLinkedin(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:li:${salt}`) % arr.length];
  const locs = D.locations || [];
  const surnamesByBucket = D.linkedinSurnames || {};
  const liLocations = D.linkedinLocations || [];
  const liFlopLocations = D.linkedinFlopLocations || [];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:linkedin:${ch.id}`);
    // Success tier: FLOP (sad, low endorsements, grey banner) / MID / POWER (verified, thousands,
    // nice blurred banner). Roughly 35% flop, 45% mid, 20% power - salt-deterministic.
    const t = h % 100;
    const tier = t < 35 ? "flop" : t >= 80 ? "power" : "mid";
    const skillN = tier === "flop" ? 1 + (h % 2) : 1 + (h % 3);
    const skills = [];
    for (let k = 0; k < skillN; k++) {
      const name = pick(D.linkedinSkills, `${ch.id}:sk${k}`);
      if (skills.some((s) => s.name === name)) continue;
      const ch2 = stableHash(`${state.gameSalt}:li:${ch.id}:ec${k}`);
      const count = tier === "flop" ? (ch2 % 15)              // 0..14, genuinely sad
        : tier === "power" ? 1500 + (ch2 % 8499)              // 1500..9999
        : 30 + (ch2 % 1170);                                  // 30..1199
      skills.push({ name, count });
    }
    // Banner by tier: POWER *always* gets a rich blurred location banner (premium look — taller, gold
    // rule, richer saturation); MID a plain LinkedIn-blue gradient only; FLOP the sad grey stripes.
    let banner;
    if (tier === "power") {
      const slug = LI_BANNER_SLUGS[stableHash(`${state.gameSalt}:li:${ch.id}:bn`) % LI_BANNER_SLUGS.length];
      banner = { type: "image", power: true, src: `${LOCATION_ART_DIR}/${slug}_day_banner.png` };
    } else if (tier === "flop") {
      banner = { type: "grey" };
    } else {
      banner = { type: "plain" };
    }
    // #OpenToWork: flops flaunt it most (~60%), mids sometimes (~30%), power never (they're winning).
    const otwRoll = (h >>> 5) % 10;
    const openToWork = tier === "power" ? false : otwRoll < (tier === "flop" ? 6 : 3);
    // Display name: character's first name (Sentence Case) + a salt-deterministic surname whose pool
    // tracks skin tone. DISPLAY-ONLY — character.name is untouched (guessing/search key off it).
    const bucket = SURNAME_BUCKET[ch.traits && ch.traits.skin] || "medSouth";
    const pool = surnamesByBucket[bucket] || surnamesByBucket.medSouth || ["Smith"];
    const surname = pool[stableHash(`${state.gameSalt}:li:${ch.id}:sn`) % pool.length];
    const displayName = `${toSentenceCase(ch.name)} ${surname}`;
    const locPool = tier === "flop" ? (liFlopLocations.length ? liFlopLocations : liLocations) : liLocations;
    const location = locPool.length ? locPool[stableHash(`${state.gameSalt}:li:${ch.id}:loc`) % locPool.length] : "";
    assignments[ch.id] = {
      tier,
      surname,
      displayName,
      location,
      title: tier === "flop" ? pick(D.linkedinFlopTitles, `${ch.id}:ft`) : pick(D.linkedinTitles, `${ch.id}:t`),
      company: pick(D.linkedinCompanies, `${ch.id}:co`),
      skills,
      banner,
      connections: tier === "flop" ? `${1 + (h % 40)} connections`
        : tier === "power" ? `${(2000 + (h % 18000)).toLocaleString()} followers`
        : "500+ connections",
      premium: tier === "power" ? pick(D.linkedinPremium, `${ch.id}:pr`) : null,
      openToWork,
      otwText: openToWork ? pick(D.linkedinOpenToWork, `${ch.id}:otw`) : null
    };
  });
  // Build the deterministic post feed: up to 10 board members "posting", each an assembled
  // opener + brag + lesson + CTA, attributed to that character with a starting like count.
  const authors = state.board.slice(0, 10);
  const posts = authors.map((ch, i) => ({
    authorId: ch.id,
    author: ch.name,
    title: assignments[ch.id] ? assignments[ch.id].title : "Professional",
    text: `${pick(D.linkedinOpeners, `${ch.id}:po`)} ${pick(D.linkedinBrags, `${ch.id}:pb`)} ${pick(D.linkedinLessons, `${ch.id}:pl`)} ${pick(D.linkedinCTAs, `${ch.id}:pc`)}`,
    comment: pick(D.linkedinComments, `${ch.id}:pcm`),
    likes: 40 + (stableHash(`${state.gameSalt}:li:${ch.id}:lk`) % 4000)
  }));
  return { id: effect.id, name: effect.name, assignments, posts };
}

// NEIGHBOURHOOD WATCH: the suburban-Facebook-group sibling of LINKEDIN. Every face becomes a group
// member — role badge, street + lived-here-since year, and a FEUD with another board member. The
// ticker above the board cycles assembled posts (opener + gripe + evidence + signoff), with gripes
// that name the feud target. Surnames reuse the LinkedIn derivation (same salt key), so the same
// person keeps the same full name across both modes — the universe remembers.
function applyNeighbourhoodWatch(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:nw:${salt}`) % arr.length];
  const surnamesByBucket = D.linkedinSurnames || {};
  const fullName = (ch) => {
    const bucket = SURNAME_BUCKET[ch.traits && ch.traits.skin] || "medSouth";
    const pool = surnamesByBucket[bucket] || surnamesByBucket.medSouth || ["Smith"];
    return `${toSentenceCase(ch.name)} ${pool[stableHash(`${state.gameSalt}:li:${ch.id}:sn`) % pool.length]}`;
  };
  const groupName = pick(D.nwGroupNames || ["NEIGHBOURHOOD WATCH"], "group");
  const assignments = {};
  const n = state.board.length;
  state.board.forEach((ch, i) => {
    const h = stableHash(`${state.gameSalt}:nw:${ch.id}`);
    // Feud target: another board member, never self, salt-deterministic.
    const feud = n > 1 ? state.board[(i + 1 + (h % (n - 1))) % n] : null;
    assignments[ch.id] = {
      displayName: fullName(ch),
      role: pick(D.nwRoles || ["Member"], `${ch.id}:role`),
      street: pick(D.nwStreets || ["Cavendish St"], `${ch.id}:st`),
      since: 1962 + (h % 62),                       // lived here since 1962..2023
      feudWith: feud ? fullName(feud) : null,
      gripe: pick(D.nwGripes || ["the bins"], `${ch.id}:gr`)
    };
  });
  // The group feed: up to 10 members posting. {target} in a gripe resolves to the author's feud.
  const posts = state.board.slice(0, 10).map((ch) => {
    const a = assignments[ch.id];
    const gripe = a.gripe.replace("{target}", a.feudWith || "the new people at number 42");
    return {
      authorId: ch.id,
      author: a.displayName,
      role: a.role,
      when: `${1 + (stableHash(`${state.gameSalt}:nw:${ch.id}:wh`) % 9)}h`,
      text: `${pick(D.nwOpeners, `${ch.id}:po`)} ${gripe}. ${pick(D.nwEvidence, `${ch.id}:pe`)} ${pick(D.nwSignoffs, `${ch.id}:ps`)}`,
      commenter: assignments[state.board[(state.board.indexOf(ch) + 3) % n].id].displayName,
      comment: pick(D.nwComments, `${ch.id}:pc`),
      reacts: 3 + (stableHash(`${state.gameSalt}:nw:${ch.id}:rx`) % 84)
    };
  });
  return { id: effect.id, name: effect.name, groupName, assignments, posts };
}

// THE GALLERY: every portrait becomes a museum piece. Each character is hung in a different art
// STYLE - the style drives the frame and the CSS filter treatment (De Stijl, Renaissance, Pop Art,
// Impressionist, Baroque, Watercolour, Brutalist, Ukiyo-e) - with a brass plaque: title, year,
// medium, price. The exhibition takes over the venue: the location becomes the Art Gallery.
// Each style carries its own era (the year on the label matches the movement), and its own painted
// backdrop palette — the portrait is re-rendered on that backdrop so it reads as a painting, not a
// game card on a coloured square.
const GALLERY_STYLES = [
  { key: "destijl", label: "De Stijl", era: [1917, 1931], bgs: ["#f4f1ea", "#efe9dd"] },
  { key: "renaissance", label: "Renaissance", era: [1495, 1600], bgs: ["#3d2e20", "#453322", "#392c1f"] },
  { key: "impressionist", label: "Impressionist", era: [1865, 1895], bgs: ["#dfe8dd", "#e8e2d3", "#dee4ec"] },
  { key: "popart", label: "Pop Art", era: [1955, 1970], bgs: ["#ffd23a", "#ff5a72", "#4dd2ff", "#5dff8f"] },
  { key: "baroque", label: "Baroque", era: [1600, 1700], bgs: ["#2c2116", "#352818"] },
  { key: "watercolour", label: "Watercolour", era: [1790, 1880], bgs: ["#f7f4ec", "#f2ede2"] },
  { key: "brutalist", label: "Brutalist", era: [1950, 1975], bgs: ["#d8d8d4", "#c9c9c4"] },
  { key: "ukiyoe", label: "Ukiyo-e", era: [1760, 1850], bgs: ["#efe3c1", "#e9dbb4"] },
  { key: "cubist", label: "Cubist", era: [1907, 1925], bgs: ["#cabfa4", "#b8a888"] },
  { key: "artnouveau", label: "Art Nouveau", era: [1890, 1912], bgs: ["#e7ddc2", "#dcc9a0"] }
];
function applyGallery(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:gal:${salt}`) % arr.length];
  // Tonight's venue IS the gallery (salt-independent lookup, so both peers agree). Use the
  // app-level `locations` array (it carries the derived banner-art paths, unlike the raw data).
  const gal = (typeof locations !== "undefined" ? locations : []).find((l) => /gallery/i.test(l.name || ""));
  if (gal && state.settings.locations) { state.location = gal; state.locationVariant = "day"; }
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:gallery:${ch.id}`);
    const style = GALLERY_STYLES[h % GALLERY_STYLES.length];
    // Repaint the sitter onto the movement's backdrop (calm pose, no card-blue default bg).
    const bg = style.bgs[(h >>> 3) % style.bgs.length];
    let image = null;
    if (ch.traits && window.faceGenerator) {
      try { image = window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, background: bg, animMode: "calm" }); } catch (e) { /* keep original */ }
    }
    // Hang them slightly unevenly - a real wall, not a grid: per-piece scale/rotation/vertical drift.
    const scale = 0.9 + ((h >>> 8) % 13) / 100;             // 0.90..1.02
    const rot = (((h >>> 5) % 5) - 2) * 0.55;               // -1.1°..+1.1°
    const shift = ((h >>> 11) % 14) - 6;                    // -6..+7 px
    assignments[ch.id] = {
      style: style.key,
      styleLabel: style.label,
      image,
      hang: `--gal-scale:${scale.toFixed(2)};--gal-rot:${rot.toFixed(2)}deg;--gal-shift:${shift}px`,
      medium: pick(D.galleryMediums || ["oil on canvas"], `${ch.id}:m`),
      year: style.era[0] + (stableHash(`${state.gameSalt}:gal:${ch.id}:yr`) % (style.era[1] - style.era[0] + 1)),
      price: pick(D.galleryPrices || ["Priced on request"], `${ch.id}:p`),
      sold: (h >>> 6) % 4 === 0
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Disease Mode: every character gets a sheet of (deliberately outdated) diagnoses with MINOR/MAJOR/
// MEGA severity, a sliding autism scale, possible cancers with an estimated arrival, a meds list, a
// pain face, and a chance of pregnancy (filed as a MAJOR disease).
function applyDisease(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:dz:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:disease:${ch.id}`);
    const diseases = [];
    const n = 1 + (h % 3);
    for (let k = 0; k < n; k++) {
      const d = pick(D.diseases, `${ch.id}:d${k}`);
      if (!diseases.some((x) => x.name === d[0])) diseases.push({ name: d[0], tier: d[1] });
    }
    const pregnant = (h >>> 7) % 5 === 0;
    if (pregnant) diseases.unshift({ name: "Pregnancy", tier: "MAJOR" });
    const cancers = [];
    const cn = (h >>> 9) % 3;
    for (let k = 0; k < cn; k++) {
      cancers.push({ type: pick(D.cancerTypes, `${ch.id}:c${k}`), eta: pick(D.cancerEtas, `${ch.id}:e${k}`) });
    }
    const meds = [];
    const mn = 1 + ((h >>> 13) % 3);
    for (let k = 0; k < mn; k++) {
      const m = pick(D.medications, `${ch.id}:m${k}`);
      if (!meds.includes(m)) meds.push(m);
    }
    assignments[ch.id] = {
      diseases, cancers, meds, pregnant,
      autism: ((h >>> 3) % 101) / 100,
      pain: (h >>> 11) % D.painFaces.length
    };
  });
  // Crown 1-2 of them PATIENT ZERO (deterministic: the lowest-hashing on the board).
  const ranked = state.board.map((c) => [c.id, stableHash(`${state.gameSalt}:pz:${c.id}`)]).sort((a, b) => a[1] - b[1]);
  const zeros = 1 + (ranked.length > 12 ? 1 : 0);
  for (let k = 0; k < zeros && k < ranked.length; k++) if (assignments[ranked[k][0]]) assignments[ranked[k][0]].patientZero = true;
  return { id: effect.id, name: effect.name, assignments };
}

// Drug Addict Mode: random street-name addictions (some have several) + how they take each one.
function applyDrugs(effect) {
  const D = window.GameData;
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:drugs:${ch.id}`);
    const n = 1 + (h % 4);
    const habits = [];
    for (let k = 0; k < n; k++) {
      const d = D.drugs[stableHash(`${state.gameSalt}:dg:${ch.id}:${k}`) % D.drugs.length];
      if (!habits.some((x) => x.name === d[0])) habits.push({ name: d[0], method: d[1] });
    }
    // Everyone's eyes are heavy-lidded and half-shut - sleazy and off their face.
    const image = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, eyeOpen: 0.28, underEyeOpacity: 0.5, browY: (Number(ch.traits.browY) || 0) + 1 })
      : null;
    assignments[ch.id] = { habits, daily: 1 + ((h >>> 5) % 40), image };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// PIXALL: 8-bit pixel-art mode. No per-character data - the look comes from the pixel font (CSS) and
// a canvas pass that downscales + colour-quantises each portrait into chunky pixels.
function applyPixall(effect) {
  return { id: effect.id, name: effect.name, assignments: {} };
}

// ===================== Hidden Agendas politics (stances + tug-o-war) =====================
// Every politician runs on a platform of completely unhinged stances - FOR and AGAINST are drawn
// from one shared pool with zero party consistency (that's the point).
const STANCE_POOL = [
  "Abortion", "War in Iraq", "Pregnancy Tax", "Homosexuality", "Sodomy", "Creatine",
  "Seed Oils", "Chemtrails", "Daylight Savings", "Fluoride", "Microplastics", "5G Towers",
  "Immigrant Geese", "The Death Penalty (for jaywalking)", "Universal Basic Cigarettes",
  "Gluten", "Vaping in Church", "Horse Girls", "Pit Bulls (as currency)", "The Moon Landing",
  "Divorce (recreational)", "Mandatory Gym Class", "Cousin Marriage (loopholes)", "Feet Pic Tariffs",
  "Big Mattress", "Birds", "The Metric System", "Raw Milk Influencers", "Grandparents Voting"
];
function pickStances(chId) {
  // A deterministic shuffle of the pool per character; first 2-3 are FOR, next 2-3 AGAINST.
  const scored = STANCE_POOL.map((s) => [stableHash(`${state.gameSalt}:st:${chId}:${s}`), s]).sort((a, b) => a[0] - b[0]);
  const nFor = 2 + (stableHash(`${state.gameSalt}:stf:${chId}`) % 2);
  const nAg = 2 + (stableHash(`${state.gameSalt}:sta:${chId}`) % 2);
  return { for: scored.slice(0, nFor).map((x) => x[1]), against: scored.slice(nFor, nFor + nAg).map((x) => x[1]) };
}
if (window.GameData && window.GameData.modePrompts && !window.GameData.modePrompts["hidden-agendas"]) {
  window.GameData.modePrompts["hidden-agendas"] = [
    "Is your person FOR sodomy?",
    "Is your person AGAINST creatine?",
    "Would your person tax a pregnancy?",
    "Is your person packing heat at a school bake sale?",
    "Would your person fart a rainbow on live TV?",
    "Does your person own more than three flags?",
    "Is your person's approval rating under 40%?",
    "Would your person win a tug-o-war?",
    "Has your person ever been cancelled?",
    "Does your person think the moon landing was staged?",
    "Would your person tax YOU specifically?",
    "Is your person a REP?",
    "Is your person a DEM?",
    "Does your person do their own research?",
    "Would your person survive a town hall?",
    "Is your person in it for the lobbyist money?",
    "Does your person kiss babies for the cameras?"
  ];
}
// The tug-o-war: donkey pulls from the left, elephant from the right, both contestants' faces ride
// the rope. It strains back and forth, a random side wins with a yank, and the loser converts.
function politicsTug(A, B) {
  const mode = state.global.mystery?.id;
  const asg = state.global.mystery.assignments;
  const pa = asg[A.id], pb = asg[B.id];
  if (!pa || !pb) return;
  // Works for both party formats: politics uses REP/DEM, hidden agendas uses Republican/Democrat.
  const norm = (p) => (/^rep/i.test(p || "") ? "REP" : "DEM");
  if (norm(pa.party) === norm(pb.party)) {
    // Same team - no fight, just the no-breed jiggle.
    [A.id, B.id].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("no-breed-jiggle"); void c.offsetWidth; c.classList.add("no-breed-jiggle"); } });
    return;
  }
  const dem = norm(pa.party) === "DEM" ? A : B;
  const rep = norm(pa.party) === "REP" ? A : B;
  const ov = document.createElement("div");
  ov.className = "tug-overlay";
  // One consolidated piece of art (donkey + rope + elephant); the contestants' faces ride the rope.
  ov.innerHTML = `<div class="tug-stage">
      <div class="tug-title">⚖️ TUG-O-WAR!</div>
      <div class="tug-scene">
        <img class="tug-art" src="assets/pol-tug.png" alt="">
        <img class="tug-face tug-face-dem" src="${dem.image}" alt="">
        <img class="tug-face tug-face-rep" src="${rep.image}" alt="">
      </div>
    </div>`;
  document.body.appendChild(ov);
  const repWins = Math.random() < 0.5;
  // Strain for a couple of seconds, then the winning side yanks the rope home.
  setTimeout(() => {
    ov.classList.add(repWins ? "win-rep" : "win-dem");
    const banner = document.createElement("div");
    banner.className = "tug-banner";
    const loser = repWins ? dem : rep;
    banner.innerHTML = `${repWins ? "🐘" : "🫏"} <b>${escapeHtml(loser.name)}</b> CONVERTED!`;
    ov.querySelector(".tug-stage").appendChild(banner);
  }, 2300);
  setTimeout(() => {
    const loser = repWins ? dem : rep;
    // The loser swaps party but keeps their home state, mood and (crucially) their unhinged stances.
    asg[loser.id] = { ...asg[loser.id], party: repWins ? "Republican" : "Democrat", converted: true };
    netSend("tug", { loserId: loser.id, party: asg[loser.id].party });
    scheduleSave();
    ov.remove();
    renderBoard();
  }, 3900);
}

// Rasterise an SVG portrait down to `size` px and quantise its colours for a real 8-bit look.
const pixelCache = new Map();
function quantizePixelData(imageData, step = 51) {
  const a = imageData.data;
  for (let i = 0; i < a.length; i += 4) {
    const r = a[i], g = a[i + 1], b = a[i + 2];
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    // Tiny teeth/sclera pixels are often only one or two source pixels wide. Keep true near-whites
    // bright before bucket rounding so they do not collapse into grey or skin-coloured mush.
    if (r >= 235 && g >= 230 && b >= 215 && max - min <= 50) {
      a[i] = 255; a[i + 1] = 252; a[i + 2] = 240;
    } else {
      a[i] = Math.round(r / step) * step;
      a[i + 1] = Math.round(g / step) * step;
      a[i + 2] = Math.round(b / step) * step;
    }
  }
}
// `crop` (optional) is [fx, fy, fw, fh] as FRACTIONS of the source (0-1) - use it to spend the whole
// pixel budget on a region (e.g. just the head) instead of wasting it on transparent margins. Given
// as fractions so it survives whatever intrinsic size the SVG happens to rasterise at.
function pixelateSrc(src, size, done, crop) {
  const key = crop ? `${src}|${crop.join(",")}|${size}` : src;
  if (pixelCache.has(key)) { done(pixelCache.get(key)); return; }
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    if (crop) {
      // SVGs without width/height report intrinsic size 0, which breaks drawImage's source-crop. So
      // first rasterise the whole SVG into a known-size canvas (dest-size draw is reliable), THEN crop.
      const BASE = 256;
      const tmp = document.createElement("canvas");
      tmp.width = BASE; tmp.height = BASE;
      const tx = tmp.getContext("2d");
      tx.imageSmoothingEnabled = false;
      tx.drawImage(im, 0, 0, BASE, BASE);
      x.drawImage(tmp, crop[0] * BASE, crop[1] * BASE, crop[2] * BASE, crop[3] * BASE, 0, 0, size, size);
    } else {
      x.drawImage(im, 0, 0, size, size);
    }
    try {
      const d = x.getImageData(0, 0, size, size);
      quantizePixelData(d, 51);
      x.putImageData(d, 0, 0);
    } catch (e) { /* tainted canvas - skip quantise */ }
    const url = c.toDataURL();
    pixelCache.set(key, url);
    done(url);
  };
  im.onerror = () => done(src);
  im.src = src;
}
// PIXALL runs LIVE: each portrait <img> is swapped for a small canvas that re-samples the animated
// SVG several times a second - so blinks/expressions keep playing in chunky pixels instead of the
// old one-shot snapshot freezing people mid-blink. (SVG-image CSS animations keep running in the
// browser's image copy; drawImage grabs whatever frame is current.)
let pixallTimer = null;
let pixallItems = [];
function stopPixallLoop() { if (pixallTimer) { clearInterval(pixallTimer); pixallTimer = null; } pixallItems = []; }
function startPixallLoop() {
  stopPixallLoop();
  if (lowPowerMode()) return;   // canvas re-draw at ~7fps is a steady drain; skip it in low power
  const SIZE = 46, BASE = 256, CROP = [0.15, 0.02, 0.7, 0.7];
  const tmp = document.createElement("canvas");
  tmp.width = BASE; tmp.height = BASE;
  const tx = tmp.getContext("2d");
  els.characterBoard.querySelectorAll(".portrait-wrap > img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:image/png")) return;
    const srcIm = new Image();
    srcIm.src = src;                       // the browser keeps this SVG's animations ticking
    const cv = document.createElement("canvas");
    cv.width = SIZE; cv.height = SIZE;
    cv.className = "pixall-live";
    img.replaceWith(cv);
    pixallItems.push({ srcIm, ctx: cv.getContext("2d"), cv });
  });
  const draw = () => {
    pixallItems = pixallItems.filter((it) => it.cv.isConnected);
    if (!pixallItems.length) { stopPixallLoop(); return; }
    pixallItems.forEach((it) => {
      if (!it.srcIm.complete) return;
      tx.clearRect(0, 0, BASE, BASE);
      tx.imageSmoothingEnabled = false;
      tx.drawImage(it.srcIm, 0, 0, BASE, BASE);
      const x = it.ctx;
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, SIZE, SIZE);
      x.drawImage(tmp, CROP[0] * BASE, CROP[1] * BASE, CROP[2] * BASE, CROP[3] * BASE, 0, 0, SIZE, SIZE);
      try {
        const d = x.getImageData(0, 0, SIZE, SIZE);
        quantizePixelData(d, 51);
        x.putImageData(d, 0, 0);
      } catch (e) { /* tainted - leave unquantised */ }
    });
  };
  draw();
  pixallTimer = setInterval(draw, 140);   // ~7fps: chunky, retro, cheap
}
function pixelateBoard() {
  els.characterBoard.querySelectorAll(".portrait-wrap > img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:image/png")) return;
    // Crop in toward the face so the pixel budget lands on features - you can still tell who's who.
    pixelateSrc(src, 46, (url) => { if (img.isConnected) img.src = url; }, [0.15, 0.02, 0.7, 0.7]);
  });
}

// Average colour of the bottom strip of the location banner, for the board's fade-to-bottom gradient.
const fadeCache = new Map();
function sampleBottomColor(src, done) {
  if (fadeCache.has(src)) { done(fadeCache.get(src)); return; }
  const im = new Image();
  im.crossOrigin = "anonymous";
  im.onload = () => {
    const w = 24, h = 24;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.drawImage(im, 0, 0, w, h);
    try {
      const d = x.getImageData(0, Math.floor(h * 0.72), w, Math.ceil(h * 0.28)).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      const col = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
      fadeCache.set(src, col);
      done(col);
    } catch (e) { done("#15140f"); }
  };
  im.onerror = () => done("#15140f");
  im.src = src;
}

// Fireworks Mode: no per-character data - it's a visual mode where eliminating a character pops their
// head out of the card frame and explodes it into fireworks (handled in createCharacterCard + CSS).
function applyFireworks(effect) {
  return { id: effect.id, name: effect.name, assignments: {} };
}

// Orgy Mode: everyone's stripped to bare cartoon shoulders and given a dossier of (entirely fictional,
// comedic) bedroom stats - position, body count, cum count today/lifetime, stat bars, who they're
// linked to, and who's UP NEXT. Pure text/number gags on cartoon avatars, in the spirit of gay-frogged.
function applyOrgy(effect) {
  const positions = ["TOP", "BOTTOM", "SIDE", "GAGGED", "CHOKING", "VERS", "POWER BOTTOM", "STARFISH"];
  const board = state.board;
  const assignments = {};
  board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:orgy:${ch.id}`);
    const stat = (salt, max) => 1 + (stableHash(`${state.gameSalt}:orgy:${ch.id}:${salt}`) % max);
    const partnerCount = 1 + ((h >>> 9) % 3);
    const partners = [];
    for (let k = 0; k < partnerCount && partners.length < board.length - 1; k++) {
      let idx = stableHash(`${state.gameSalt}:orgy:${ch.id}:p${k}`) % board.length;
      let n = board[idx].name;
      let guard = 0;
      while ((n === ch.name || partners.includes(n)) && guard++ < board.length) { idx = (idx + 1) % board.length; n = board[idx].name; }
      if (n !== ch.name && !partners.includes(n)) partners.push(n);
    }
    let upNext = board[(h >>> 11) % board.length].name;
    if (upNext === ch.name) upNext = board[((h >>> 11) + 1) % board.length].name;
    const image = (ch.traits && window.faceGenerator)
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, clothing: "bare", accessory: "none" })
      : ch.image;
    assignments[ch.id] = {
      pos: positions[h % positions.length],
      bodyCount: 2 + ((h >>> 3) % 187),
      cumToday: (h >>> 5) % 14,
      cumLifetime: 150 + ((h >>> 7) % 9850),
      stamina: stat("sta", 10), horniness: stat("hor", 10), lifespan: stat("life", 10), secrets: stat("sec", 10),
      partners, upNext, image
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Re-skins the location as a Yu-Gi-Oh "Field Spell" - a grandiose suffix + over-dramatic flavour text.
function yugiohLocationFlavor(location) {
  const suffixes = window.GameData.yugiohField.suffixes;
  const lines = window.GameData.yugiohField.lines;
  const h = stableHash(`${state.gameSalt}:ygofield:${location.name}`);
  return { suffix: suffixes[h % suffixes.length], text: lines[(h >>> 4) % lines.length] };
}

// WHAT'S IN THE HAND?: everyone holds one of exactly 12 objects. Drag one onto another and the two
// objects BATTLE (Rock-Paper-Scissors style) - each beats the 5 that follow it around the ring, loses
// to the 5 before, and ties the one directly opposite. The loser is knocked off the board.
const PROP_BATTLE = [
  ["Rock", "🪨", "smashes"], ["Bag", "🛍️", "swallows"], ["Scissors", "✂️", "shreds"],
  ["Fire", "🔥", "burns"], ["Water", "💧", "douses"], ["Sponge", "🧽", "soaks up"],
  ["Sword", "🗡️", "slices"], ["Snake", "🐍", "poisons"], ["Boot", "🥾", "stomps"],
  ["Tree", "🌳", "outgrows"], ["Sun", "☀️", "scorches"], ["Moon", "🌙", "eclipses"]
];
// Does prop i beat prop j? +1 win, -1 loss, 0 draw. (Ring of 12: beat next 5, lose prev 5, tie +6.)
function propBattleResult(i, j) {
  if (i === j) return 0;
  const d = ((j - i) % 12 + 12) % 12;
  return d >= 1 && d <= 5 ? 1 : (d === 6 ? 0 : -1);
}
function applyPropPanic(effect) {
  const assignments = {};
  assignEvenCategories(state.board, PROP_BATTLE.map((p, i) => i), effect.id).forEach(({ character, value }) => {
    const p = PROP_BATTLE[value];
    assignments[character.id] = { propIdx: value, value: p[0], emoji: p[1] };
  });
  return { id: effect.id, name: effect.name, assignments };
}
// The duel: A's object is dragged onto B's. A VS overlay flashes the two, then the winner's object
// "verbs" the loser and the loser is crossed off (drag again on a downed card to revive).
function propBattle(A, B) {
  const asg = state.global.mystery?.assignments;
  const a = asg && asg[A.id], b = asg && asg[B.id];
  if (!a || !b || A.id === B.id) return;
  if (document.querySelector(".pb-overlay")) return;
  const res = propBattleResult(a.propIdx, b.propIdx);
  const ov = document.createElement("div");
  ov.className = "pb-overlay";
  ov.innerHTML = `<div class="pb-stage">
      <div class="pb-fighters">
        <span class="pb-fighter pb-a"><b>${a.emoji}</b><i>${escapeHtml(a.value)}</i></span>
        <span class="pb-vs">VS</span>
        <span class="pb-fighter pb-b"><b>${b.emoji}</b><i>${escapeHtml(b.value)}</i></span>
      </div>
      <div class="pb-result"></div>
    </div>`;
  document.body.appendChild(ov);
  sfx("blip");
  setTimeout(() => {
    const out = ov.querySelector(".pb-result");
    if (res === 0) {
      ov.classList.add("pb-draw");
      out.innerHTML = `🤝 <b>DRAW!</b> ${a.emoji} and ${b.emoji} are evenly matched.`;
      sfx("honk");
    } else {
      const win = res === 1 ? a : b, lose = res === 1 ? b : a;
      const winner = res === 1 ? A : B, loser = res === 1 ? B : A;
      ov.classList.add(res === 1 ? "pb-a-wins" : "pb-b-wins");
      out.innerHTML = `${win.emoji} <b>${escapeHtml(win.value)}</b> ${escapeHtml(PROP_BATTLE[win.propIdx][2])} ${lose.emoji} <b>${escapeHtml(lose.value)}</b>!`;
      ov._loserId = loser.id;
      ov._loserDown = currentPlayer().eliminated.has(loser.id);
      sfx("win");
    }
  }, 1400);
  setTimeout(() => {
    const loserId = ov._loserId;
    ov.remove();
    if (loserId) toggleEliminated(loserId);   // knock the loser off (or revive if already down)
  }, 2600);
}

function applyFamilyTreeDisaster(effect) {
  const roles = [
    "Mum",
    "Dad",
    "Twin",
    "Weird Uncle",
    "Cousin",
    "Step-aunt",
    "Work Nephew",
    "Baby Somehow",
    "Legal Guardian Maybe",
    "Family Friend Who Won’t Leave"
  ];
  const familyNames = [
    "Family A",
    "Family B",
    "The Suspicious Branch",
    "The Loud Cousins",
    "The Unclear Household"
  ];
  const clusterCount = Math.min(5, Math.max(3, Math.ceil(state.board.length / 8)));
  const sorted = deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:clusters`);
  const clusters = Array.from({ length: clusterCount }, (_, index) => ({
    id: `family-${index + 1}`,
    name: familyNames[index],
    className: `family-tone-${index + 1}`,
    characterIds: []
  }));
  const assignments = {};
  sorted.forEach((character, index) => {
    const cluster = clusters[index % clusterCount];
    const role = getDeterministicMysteryValue(character.id, roles, `${state.gameSalt}:${effect.id}:role`);
    cluster.characterIds.push(character.id);
    assignments[character.id] = { clusterId: cluster.id, role };
  });
  return { id: effect.id, name: effect.name, assignments, clusters };
}

const KNOCKOFF_ROOM_NAMES = [
  "DINING ROOM",
  "FOOD HALL",
  "BATHS ROOM",
  "WORSHIP HALL",
  "WHISPER KITCHEN",
  "KNIFE LIBRARY",
  "UPSTAIRS DOWNSTAIRS",
  "PANIC PARLOR",
  "GARAGE OF TRUTH",
  "FORMAL CLOSET",
  "SECOND LOUNGE",
  "CRIME NOOK",
  "LAUNDRY BALLROOM",
  "CONSERVATORY-ISH",
  "HALLWAY HALL",
  "STUDY BUDDY",
  "BILLIARD ADJACENT",
  "MUD ROOM COURT"
];

// A proper floorplan seen from directly above: rooms of DIFFERENT sizes tessellating a 6-col x 7-row
// grid with no gaps (a tall wing here, a wide hall there, a couple of poky rooms). Each room hides one
// weapon somewhere inside it. Order matters - guests are dealt round-robin, so mix big/small early.
const KNOCKOFF_ROOM_LAYOUTS = [
  { row: 1, col: 3, rowSpan: 2, colSpan: 4 },   // wide hall, top
  { row: 1, col: 1, rowSpan: 3, colSpan: 2 },   // tall wing, top-left
  { row: 3, col: 3, rowSpan: 2, colSpan: 2 },   // square room
  { row: 3, col: 5, rowSpan: 2, colSpan: 2 },   // square room
  { row: 4, col: 1, rowSpan: 4, colSpan: 2 },   // long tall wing, left
  { row: 5, col: 3, rowSpan: 3, colSpan: 2 },   // tall room
  { row: 5, col: 5, rowSpan: 3, colSpan: 2 }    // tall room
];

const KNOCKOFF_ROOM_TONES = [
  "#ffd166",
  "#8bd3dd",
  "#f7a8b8",
  "#b8e986",
  "#cdb4db",
  "#f4a261",
  "#a8dadc",
  "#ffddd2",
  "#bde0fe",
  "#d9ed92"
];

const MURDER_WEAPONS = [
  { name: "candlestick", emoji: "🕯️" },
  { name: "kitchen knife", emoji: "🔪" },
  { name: "revolver-ish", emoji: "🔫" },
  { name: "wrench", emoji: "🔧" },
  { name: "rope", emoji: "🪢" },
  { name: "hammer", emoji: "🔨" },
  { name: "axe", emoji: "🪓" },
  { name: "poison bottle", emoji: "🧪" },
  { name: "shovel", emoji: "🪏" },
  { name: "brick", emoji: "🧱" }
];

function applyKnockoffManor(effect) {
  const roomCount = KNOCKOFF_ROOM_LAYOUTS.length;
  const roomNames = deterministicOrder(
    KNOCKOFF_ROOM_NAMES.map((name, index) => ({ id: `room-name-${index}`, name })),
    `${state.gameSalt}:${effect.id}:names`
  ).slice(0, roomCount);
  // One weapon hidden in each room (shuffled deterministically so peers agree). A weapon lands at a
  // hashed corner of its room.
  const weaponBag = deterministicOrder(
    MURDER_WEAPONS.map((weapon, index) => ({ ...weapon, id: `weapon-${index}` })),
    `${state.gameSalt}:${effect.id}:weapons`
  );
  const rooms = roomNames.map((roomName, index) => {
    const weapon = weaponBag[index % weaponBag.length];
    return {
      id: `manor-room-${index + 1}`,
      name: roomName.name,
      row: KNOCKOFF_ROOM_LAYOUTS[index].row,
      col: KNOCKOFF_ROOM_LAYOUTS[index].col,
      rowSpan: KNOCKOFF_ROOM_LAYOUTS[index].rowSpan,
      colSpan: KNOCKOFF_ROOM_LAYOUTS[index].colSpan,
      tone: KNOCKOFF_ROOM_TONES[index % KNOCKOFF_ROOM_TONES.length],
      weaponEmoji: weapon.emoji,
      weaponName: weapon.name,
      // which corner the weapon sits in, and a small tilt - purely cosmetic, salt-stable.
      weaponCorner: stableHash(`${state.gameSalt}:${effect.id}:wpos:${index}`) % 4,
      weaponTilt: (stableHash(`${state.gameSalt}:${effect.id}:wrot:${index}`) % 31) - 15
    };
  });
  const assignments = {};
  // Everyone gets a demeanor that is THEIRS, not the room's: nervous (fidget + sweat) or shifty
  // (darting glances). A calmer few read as unbothered. Deterministic so both peers see the same tells.
  const DEMEANORS = ["nervous", "shifty", "nervous", "shifty", "calm"];
  deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:guests`).forEach((character, index) => {
    const room = rooms[index % rooms.length];
    const demeanor = DEMEANORS[stableHash(`${state.gameSalt}:${effect.id}:tell:${character.id}`) % DEMEANORS.length];
    assignments[character.id] = { roomId: room.id, roomName: room.name, demeanor };
  });
  const bloodRoom = rooms[stableHash(`${state.gameSalt}:${effect.id}:blood-room`) % rooms.length];
  return { id: effect.id, name: effect.name, assignments, rooms, bloodRoomId: bloodRoom.id };
}
// Location banner: MURDER! AT THE <venue>.
function decorateMurderLocation(context) {
  const base = (context.name || context.location?.name || "the manor").toUpperCase();
  return { ...context, name: `MURDER! AT THE ${base}`, eyebrow: "🔪 Live broadcast" };
}

function applyEmotionalAudit(effect) {
  const meters = [
    "Happiness",
    "Anger",
    "Panic",
    "Suspicion",
    "Confidence",
    "Exhaustion",
    "Petty Grievance",
    "Divorce Energy",
    "Parking Rage",
    "Secretiveness",
    "Jazz Tolerance",
    "Apology Quality",
    "Dryness",
    "Overfamiliarity",
    "Passive Aggression",
    "Shame Buffer",
    "Mum Friend Energy",
    "Midnight Courage",
    "Flirt Risk",
    "Grudge Retention",
    "Escalation",
    "Office Poison",
    "Gossip Voltage",
    "Holiday Resentment",
    "Text Tone",
    "Bad News Glow",
    "Trustworthiness",
    "Dinner Party Damage",
    "Aunt Energy",
    "Lie Fluency",
    "Exit Strategy"
  ];
  const assignments = {};
  assignEvenCategories(state.board, meters, `${state.gameSalt}:${effect.id}:meters`).forEach(({ character, value: meter }) => {
    assignments[character.id] = {
      meter,
      value: stableHash(`${state.gameSalt}:${effect.id}:${character.id}:${character.name}`) % 101
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

function applyVibeLabels(effect) {
  const labels = [
    "Has Lore",
    "Replies All",
    "Would Bring Guitar",
    "Microwaves Fish",
    "Says Circle Back",
    "Owns an Air Fryer",
    "Sleeps in Jeans",
    "Knows a Shortcut",
    "Unpaid DJ Energy",
    "Has a Laminator",
    "Would Fake a Smile",
    "Keeps Receipts",
    "Talks in Threats",
    "Can Ruin a Picnic",
    "Brings Courtroom Energy",
    "Could Start a Rumour",
    "Competes With Children",
    "Makes Brunch Tense",
    "Would Win the Divorce",
    "Owns Decorative Knives",
    "Could Sell You a Lie",
    "Looks Financially Petty",
    "Would Cry on Cue",
    "Unclear Motives",
    "Weaponized Calm",
    "Suspiciously Polite",
    "Carries Emotional Debt",
    "Bad Textback Energy",
    "Knows Too Much",
    "Birthday Speech Risk",
    "May Be the Ex",
    "Subtweet Face",
    "Definitely Has a Folder",
    "Could Silence a Table",
    "Private Groupchat Vibe"
  ];
  const assignments = {};
  assignEvenCategories(state.board, labels, `${state.gameSalt}:${effect.id}`).forEach(({ character, value }) => {
    assignments[character.id] = { value };
  });
  return { id: effect.id, name: effect.name, assignments };
}

function applyWitnessProtectionFilter(effect) {
  // Weighted pool: black censor bars over the eyes/mouth are the most common redaction, a handful get
  // the CCTV/security-camera look, and the rest are sprinkled with the atmospheric filters. Each entry
  // is [label, className, weight]; higher weight = shows up on more people.
  const pool = [
    ["Eyes Redacted", "witness-eyebar", 5],
    ["Mouth Redacted", "witness-mouthbar", 3],
    ["Security Camera", "witness-security", 4],
    ["Aquarium Glass", "witness-aquarium", 1],
    ["Fog Machine", "witness-fog", 1],
    ["Interrogation Lamp", "witness-interrogation", 1],
    ["Smoke Alarm Incident", "witness-smoke", 1]
  ];
  const weighted = [];
  pool.forEach(([label, cls, w]) => { for (let i = 0; i < w; i++) weighted.push([label, cls]); });
  // Filter roughly 60% of the board (always including both players' secrets), each assigned a weighted
  // category - so bars and cameras can repeat across several people.
  const count = Math.max(6, Math.round(state.board.length * 0.6));
  const selectedIds = buildWitnessShortlist(effect.id, count);
  const reasons = (window.GameData && window.GameData.witnessReasons) || ["Snitched on the mob"];
  const assignments = {};
  selectedIds.forEach((id) => {
    const pickHash = stableHash(`${state.gameSalt}:${effect.id}:pick:${id}`);
    const [label, cls] = weighted[pickHash % weighted.length];
    assignments[id] = { value: label, className: cls, reason: reasons[stableHash(`${state.gameSalt}:wpr:${id}`) % reasons.length] };
  });
  return { id: effect.id, name: effect.name, assignments, selectedIds };
}

function applyRoleReveal(effect) {
  const assignments = {};
  state.board.forEach((character) => {
    assignments[character.id] = { value: roleFor(character.id) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Florida", "Georgia", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Mexico", "New York", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "Wisconsin", "Wyoming"
];

// The "true" feelings revealed behind the smile. Each label maps to one of the face generator's
// five expressions so generated portraits can actually re-render with the new mood.
const HIDDEN_EMOTIONS = [
  { key: "angry", label: "Furious", emoji: "😠" },
  { key: "sad", label: "Resentful", emoji: "😔" },
  { key: "surprised", label: "Rattled", emoji: "😦" },
  { key: "happy", label: "Smug", emoji: "😏" },
  { key: "neutral", label: "Scheming", emoji: "🫥" }
];

// Hidden Agendas: splits the board into red/blue political sides, gives everyone a home state, and
// flips their expression to a "true" feeling. Generated faces are repainted with the new emotion;
// the hand-illustrated PNG faces keep their art but still get the mood emoji + colour treatment.
function applyHiddenAgendas(effect) {
  const assignments = {};
  deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:side`).forEach((character, index) => {
    const party = index % 2 === 0 ? "Democrat" : "Republican";
    const homeState = getDeterministicMysteryValue(character.id, US_STATES, `${state.gameSalt}:${effect.id}:state`);
    const current = character.traits ? character.traits.expression : null;
    const moodPool = HIDDEN_EMOTIONS.filter((mood) => mood.key !== current);
    const mood = getDeterministicMysteryValue(character.id, moodPool, `${state.gameSalt}:${effect.id}:mood`);
    const image = character.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(character.seed, { ...character.traits, expression: mood.key })
      : null;
    assignments[character.id] = { party, state: homeState, mood: mood.label, emoji: mood.emoji, image, stances: pickStances(character.id) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Monocultural: repaints every generated face with ONE shared skin tone, randomly chosen from the
// generator's defined skin tones (so it's always a real human tone - never an alien/blue/etc).
function applyMonocultural(effect) {
  const tb = window.faceGenerator && window.faceGenerator.traitBook;
  const names = (tb && tb.skinTones) || ["fair"];
  const hexOf = (name) => (tb && tb.skinToneHex && tb.skinToneHex[name]) || "#c88968";
  const lum = (name) => { const n = parseInt(hexOf(name).replace("#", ""), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  // Monocultural goes to an extreme: everyone becomes either the WHITEST or the DARKEST tone.
  const sorted = [...names].sort((a, b) => lum(a) - lum(b));
  const skin = (stableHash(`${state.gameSalt}:mono`) % 2 === 0) ? sorted[0] : sorted[sorted.length - 1];
  const color = hexOf(skin);
  const assignments = {};
  state.board.forEach((character) => {
    const image = character.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(character.seed, { ...character.traits, skin })
      : null;
    assignments[character.id] = { image };
  });
  return { id: effect.id, name: effect.name, color, assignments };
}

// Gay Frogged: everyone gets LGBTQIA+ letter(s) + an orientation title, independently assigned.
const PRIDE_LETTERS_POOL = [
  { letters: ["L"],        key: "L",    color: "#e40303" },
  { letters: ["G"],        key: "G",    color: "#ff8c00" },
  { letters: ["B"],        key: "B",    color: "#ffd400" },
  { letters: ["T"],        key: "T",    color: "#2ecc71" },
  { letters: ["Q"],        key: "Q",    color: "#00bcd4" },
  { letters: ["I"],        key: "I",    color: "#3a86ff" },
  { letters: ["A"],        key: "A",    color: "#8338ec" },
  { letters: ["+"],        key: "plus", color: "#ff4fd8" },
  { letters: ["L", "G"],   key: "LG",   color: "#ff6b35" },
  { letters: ["B", "T"],   key: "BT",   color: "#55efc4" },
  { letters: ["Q", "I"],   key: "QI",   color: "#74b9ff" },
  { letters: ["Q", "I", "A"], key: "QIA", color: "#4a90e2" },
];

const PRIDE_PRONOUNS_POOL = [
  "he/him", "she/her", "they/them", "they/them",
  "this/that", "this/that", "xe/xem", "ze/zir",
  "it/its", "she/they", "he/they", "any/all",
];

const PRIDE_TITLES_POOL = [
  "gay", "ultragay", "bisexual", "pansexual", "demisexual",
  "supersexual", "faggot", "fat++", "queer", "fluid",
  "unlabelled", "arospec", "asexual", "curious", "sapphic",
  "straight+", "omnisexual", "graysexual", "it's complicated",
  "homoflexible", "skoliosexual", "lithosexual", "polyamorous",
  "butch", "femme", "twink", "bear", "masc4masc",
];

function applyGayFrogged(effect) {
  const assignments = {};
  const letterAssignments = {};
  const titleAssignments = {};
  assignEvenCategories(state.board, PRIDE_LETTERS_POOL, `${state.gameSalt}:${effect.id}:letters`).forEach(({ character, value }) => {
    letterAssignments[character.id] = value;
  });
  assignEvenCategories(state.board, PRIDE_TITLES_POOL, `${state.gameSalt}:${effect.id}:titles`).forEach(({ character, value }) => {
    titleAssignments[character.id] = value;
  });
  const pronounAssignments = {};
  assignEvenCategories(state.board, PRIDE_PRONOUNS_POOL, `${state.gameSalt}:${effect.id}:pronouns`).forEach(({ character, value }) => {
    pronounAssignments[character.id] = value;
  });
  state.board.forEach((character) => {
    const letter = letterAssignments[character.id];
    assignments[character.id] = {
      letters: letter?.letters || ["Q"],
      key: letter?.key || "Q",
      color: letter?.color || "#00bcd4",
      title: titleAssignments[character.id] || "queer",
      pronoun: pronounAssignments[character.id] || "they/them",
    };
  });

  // Shuffle hairstyles between characters and re-render portraits
  if (window.faceGenerator) {
    const eligible = state.board.filter((c) => c.traits);
    const hairPool = shuffle(eligible.map((c) => ({ hair: c.traits.hair, hairColor: c.traits.hairColor, hairProfile: c.traits.hairProfile, hairLocks: c.traits.hairLocks, frontHairY: c.traits.frontHairY })));
    eligible.forEach((character, index) => {
      const swappedHair = hairPool[index];
      const image = window.faceGenerator.renderPortrait(character.seed, { ...character.traits, ...swappedHair });
      if (assignments[character.id]) {
        assignments[character.id].image = image;
      }
    });
  }

  return { id: effect.id, name: effect.name, assignments };
}

// Face First: crops every portrait in tight so only the face fills the tile.
function applyFaceFirst(effect) {
  const assignments = {};
  state.board.forEach((character) => {
    assignments[character.id] = {};
  });
  return { id: effect.id, name: effect.name, assignments };
}

function applyPs1Mode(effect) {
  if (ps1Install) {
    ps1Cleanup = ps1Install();
  }
  return { id: effect.id, name: effect.name };
}

// Full-frame announcement: a white flash plus the effect's name, each letter flung in from
// off-screen along its own path to slam together in the centre.
// Per-mode title entrances: each effect's name arrives its own way (neon flicker, typewriter,
// woodblock zoom, séance blur…). Anything unmapped keeps the classic letters-slam.
const TITLE_ANIMS = {
  "witness-protection-filter": "flicker", disguise: "flicker", drugs: "flicker",
  "knockoff-manor": "typewriter", work: "typewriter", "neighbourhood-watch": "typewriter", linkedin: "typewriter",
  habbo: "riseup", sims: "riseup", "family-tree-disaster": "riseup",
  yugioh: "zoomdrop", fireworks: "zoomdrop", "prop-panic": "zoomdrop",
  "gay-frogged": "wave", woke: "wave", orgy: "wave", swipe: "wave",
  pixall: "glitch", "ps1-mode": "glitch",
  gallery: "elegant", pantone: "elegant", astrology: "elegant", "horny-potter": "elegant",
  judgement: "spooky", disease: "spooky", fertility: "spooky"
};
function playEffectAnnouncement(name) {
  sfx("reveal");
  const prev = document.getElementById("effectBlast");
  if (prev) prev.remove();

  const overlay = document.createElement("div");
  overlay.id = "effectBlast";
  overlay.className = `effect-blast anim-${TITLE_ANIMS[currentMysteryEffect()?.id] || "slam"}`;

  // Full-screen colour flash behind the letters, tinted to the active mode.
  const col = flashForCurrentMode();
  const bg = document.createElement("div");
  bg.className = "effect-blast-bg";
  bg.style.background = col === "rainbow"
    ? "conic-gradient(from 0deg, #ff5a5a, #ffb14e, #ffe83a, #5dff8f, #4dd2ff, #c46bff, #ff5a5a)"
    : `radial-gradient(circle at 50% 45%, ${col}, transparent 70%)`;
  overlay.appendChild(bg);

  const flash = document.createElement("div");
  flash.className = "effect-blast-flash";
  overlay.appendChild(flash);

  const word = document.createElement("div");
  word.className = "effect-blast-word";
  // Group letters into per-word chunks that never break internally, so the title wraps BETWEEN words.
  let blastIndex = 0;
  name.toUpperCase().split(" ").forEach((wordText) => {
    const chunk = document.createElement("span");
    chunk.className = "effect-blast-wordpart";
    [...wordText].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "effect-blast-letter";
      span.textContent = ch;
      const dir = blastIndex % 2 === 0 ? -1 : 1;
      span.style.setProperty("--dx", `${dir * (55 + Math.random() * 45)}vw`);
      span.style.setProperty("--dy", `${(Math.random() - 0.5) * 70}vh`);
      span.style.setProperty("--rot", `${dir * (15 + Math.random() * 35)}deg`);
      span.style.setProperty("--delay", `${blastIndex * 40}ms`);
      chunk.appendChild(span);
      blastIndex++;
    });
    word.appendChild(chunk);
  });
  overlay.appendChild(word);

  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 4300);   // linger - let the title actually land
}

function showMysteryAnnouncement(_effectName, _exampleQuestion) {
  // No static example line any more - instead the live question switches into the mode's own deck.
  els.mysteryResult.textContent = "";
  drawPrompt();
}

function assignEvenCategories(characters, values, salt) {
  return deterministicOrder(characters, salt).map((character, index) => ({
    character,
    value: values[index % values.length]
  }));
}

function getDeterministicMysteryValue(characterId, valueList, salt) {
  return valueList[stableHash(`${salt}:${characterId}`) % valueList.length];
}

function deterministicOrder(items, salt) {
  return [...items].sort((a, b) => {
    const aHash = stableHash(`${salt}:${a.id}:${a.name}`);
    const bHash = stableHash(`${salt}:${b.id}:${b.name}`);
    return aHash - bHash;
  });
}

function buildWitnessShortlist(effectId, count) {
  const forced = Array.from(new Set(state.players.map((player) => player.secretId)));
  const ordered = deterministicOrder(state.board, `${state.gameSalt}:${effectId}:shortlist`);
  const chosen = [...forced];
  ordered.forEach((character) => {
    if (chosen.length >= Math.min(count, state.board.length)) return;
    if (!chosen.includes(character.id)) chosen.push(character.id);
  });
  return chosen.slice(0, Math.min(count, state.board.length));
}


// ---- grindr-tags ----
const GRINDR_TAGS = [
  "bb", "fisting", "group", "leather", "gape", "doggy",
  "oral", "vers", "top", "bottom", "pig", "daddy",
  "kinky", "hung", "bear", "otter", "twink", "cub",
  "wolf", "jock", "masc", "fem", "dom", "sub",
  "feet", "rim", "raw", "pup", "gear", "sling",
  "safe", "pnp", "420", "party", "discreet", "str8",
  "hairy", "smooth", "chub", "muscle", "thick", "lean",
  "nsa", "ltr", "host", "travel", "now", "tonight",
];

function characterTags(character) {
  const h = stableHash(character.id + ":tags");
  const count = 2 + (h % 3);
  const tags = [];
  for (let i = 0; i < count; i++) {
    const tag = GRINDR_TAGS[stableHash(character.id + ":tag:" + i) % GRINDR_TAGS.length];
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
}


// ---- ps1-runtime ----
(function () {
  const boardSelector = "#characterBoard";
  const cardSelector = ".character-card";
  const portraitSelector = ".portrait-wrap";
  const secretSelector = "#secretCard";
  const locationSelector = "#locationBand";

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || "ps1");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function makePalette(seed) {
    const palette = [
      ["#101824", "#f4c45f"],
      ["#131a2a", "#efb86d"],
      ["#1b1524", "#dec769"],
      ["#16191d", "#f0a65d"],
      ["#141d16", "#d2c75d"],
      ["#171321", "#e2b1ff"]
    ];
    const [booth, light] = palette[seed % palette.length];
    return {
      booth,
      light,
      skin: seed % 3 === 0 ? "#b87454" : seed % 3 === 1 ? "#d59a70" : "#8f5d43",
      skinDark: seed % 3 === 0 ? "#83513e" : seed % 3 === 1 ? "#a86f50" : "#65402f",
      skinLight: seed % 3 === 0 ? "#d59068" : seed % 3 === 1 ? "#efb17f" : "#a97454",
      hair: seed % 4 === 0 ? "#2b1c18" : seed % 4 === 1 ? "#7b4328" : seed % 4 === 2 ? "#151515" : "#c58b2f",
      hairLight: seed % 4 === 0 ? "#5a3529" : seed % 4 === 1 ? "#a96338" : seed % 4 === 2 ? "#373737" : "#e0b95b"
    };
  }

  function cssUrl(value) {
    return `url("${String(value).replace(/"/g, '\\"')}")`;
  }

  function createStage(card, portrait, image) {
    const seed = stableHash(card.dataset.id || image.currentSrc || image.src);
    const colors = makePalette(seed);
    const stage = document.createElement("div");
    stage.className = "ps1-character-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.style.setProperty("--ps1-face", cssUrl(image.currentSrc || image.src));
    stage.style.setProperty("--ps1-booth", colors.booth);
    stage.style.setProperty("--ps1-light", colors.light);
    stage.style.setProperty("--ps1-skin", colors.skin);
    stage.style.setProperty("--ps1-skin-dark", colors.skinDark);
    stage.style.setProperty("--ps1-skin-light", colors.skinLight);
    stage.style.setProperty("--ps1-hair", colors.hair);
    stage.style.setProperty("--ps1-hair-light", colors.hairLight);
    const angle = (seed % 9) - 4;
    stage.style.setProperty("--ps1-angle", `${angle}deg`);
    stage.style.setProperty("--ps1-hover-angle", `${Math.round(angle * -0.4)}deg`);
    stage.style.setProperty("--ps1-bob-delay", `${-(seed % 4800)}ms`);

    stage.innerHTML = `
      <div class="ps1-booth">
        <span class="ps1-floor"></span>
        <div class="ps1-head-rig">
          <span class="ps1-shadow"></span>
          <div class="ps1-head-blob">
            <span class="ps1-head-core"></span>
            <span class="ps1-map-plane ps1-map-left"></span>
            <span class="ps1-map-plane ps1-map-right"></span>
            <span class="ps1-ear ps1-ear-left"></span>
            <span class="ps1-ear ps1-ear-right"></span>
            <span class="ps1-map-plane ps1-map-top"></span>
            <span class="ps1-map-plane ps1-map-front"></span>
            <span class="ps1-front-facet ps1-front-facet-brow"></span>
            <span class="ps1-front-facet ps1-front-facet-left"></span>
            <span class="ps1-front-facet ps1-front-facet-right"></span>
            <span class="ps1-front-facet ps1-front-facet-jaw"></span>
            <span class="ps1-nose-facet"></span>
            <span class="ps1-chin-facet"></span>
          </div>
        </div>
        <span class="ps1-scanline"></span>
      </div>
    `;

    const prop = portrait.querySelector(".prop-overlay");
    portrait.classList.add("has-ps1-character");
    portrait.insertBefore(stage, prop || null);
  }

  function syncPortrait(container, image, id) {
    let stage = container.querySelector(":scope > .ps1-character-stage");
    if (!stage) {
      createStage({ dataset: { id } }, container, image);
      stage = container.querySelector(":scope > .ps1-character-stage");
    }

    if (stage) {
      if (stage.dataset.textureSampled !== "true") {
        stage.style.setProperty("--ps1-face", cssUrl(image.currentSrc || image.src));
      }
      sampleTextureColors(stage, image);
    }
  }

  function syncStage(card) {
    const portrait = card.querySelector(portraitSelector);
    const image = portrait?.querySelector(":scope > img");
    if (!portrait || !image) return;
    syncPortrait(portrait, image, card.dataset.id || image.src);
  }

  function enhanceBoard(board) {
    board.querySelectorAll(cardSelector).forEach(syncStage);
  }

  function enhanceSecret(secretCard) {
    if (!secretCard || secretCard.classList.contains("is-hidden")) return;
    let wrapper = secretCard.querySelector(":scope > .ps1-secret-portrait");
    let image = wrapper?.querySelector(":scope > img") || secretCard.querySelector(":scope > img");
    if (!image) return;

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "portrait-wrap ps1-secret-portrait";
      secretCard.insertBefore(wrapper, image);
      wrapper.appendChild(image);
    }

    syncPortrait(wrapper, image, `secret-${image.alt || image.src}`);
  }

  function enhanceLocation(locationBand) {
    const photo = locationBand?.querySelector(".location-photo");
    if (!photo) return;
    const source = extractCssUrl(photo.style.backgroundImage);
    if (!source || photo.dataset.ps1Source === source) return;
    photo.dataset.ps1Source = source;

    const image = new Image();
    image.onload = () => {
      try {
        const texture = pixelTexture(image, 112, 36);
        if (texture && photo.dataset.ps1Source === source) {
          photo.style.backgroundImage = cssUrl(texture);
          photo.classList.add("is-ps1-pixelated");
        }
      } catch (error) {
        photo.classList.add("is-ps1-pixelated");
      }
    };
    image.src = source;
  }

  function sampleTextureColors(stage, image) {
    if (stage.dataset.textureSampled === "true") return;
    if (!image.complete || !image.naturalWidth) {
      if (stage.dataset.textureSamplePending === "true") return;
      stage.dataset.textureSamplePending = "true";
      image.addEventListener("load", () => sampleTextureColors(stage, image), { once: true });
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, size, size);
      const skin = averageRect(context, size, 9, 9, 15, 17);
      const hair = averageRect(context, size, 8, 4, 16, 8);
      const texture = pixelTexture(image, 64);
      if (texture) {
        stage.style.setProperty("--ps1-face", cssUrl(texture));
      }
      if (skin) {
        stage.style.setProperty("--ps1-skin", skin);
        stage.style.setProperty("--ps1-skin-dark", shadeHex(skin, 0.68));
        stage.style.setProperty("--ps1-skin-light", shadeHex(skin, 1.2));
      }
      if (hair) {
        stage.style.setProperty("--ps1-hair", shadeHex(hair, 0.86));
        stage.style.setProperty("--ps1-hair-light", shadeHex(hair, 1.24));
      }
      delete stage.dataset.textureSamplePending;
      stage.dataset.textureSampled = "true";
    } catch (error) {
      delete stage.dataset.textureSamplePending;
      stage.dataset.textureSampled = "true";
    }
  }

  function averageRect(context, size, x1, y1, x2, y2) {
    const data = context.getImageData(0, 0, size, size).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let y = y1; y < y2; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        const index = (y * size + x) * 4;
        if (data[index + 3] < 32) continue;
        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
        count += 1;
      }
    }
    if (!count) return "";
    return rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count));
  }

  function pixelTexture(image, width, height = width) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return "";
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  }

  function extractCssUrl(value) {
    const match = String(value || "").match(/url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : "";
  }

  function shadeHex(hex, amount) {
    const value = hex.replace("#", "");
    const r = Math.max(0, Math.min(255, Math.round(parseInt(value.slice(0, 2), 16) * amount)));
    const g = Math.max(0, Math.min(255, Math.round(parseInt(value.slice(2, 4), 16) * amount)));
    const b = Math.max(0, Math.min(255, Math.round(parseInt(value.slice(4, 6), 16) * amount)));
    return rgbToHex(r, g, b);
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }

  function install() {
    document.body.dataset.characterRenderer = "ps1";
    const board = document.querySelector(boardSelector);
    const secretCard = document.querySelector(secretSelector);
    const locationBand = document.querySelector(locationSelector);
    if (!board) return () => {};

    enhanceBoard(board);
    enhanceSecret(secretCard);
    enhanceLocation(locationBand);

    let scheduled = false;
    const scheduleEnhance = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        enhanceBoard(board);
        enhanceSecret(secretCard);
        enhanceLocation(locationBand);
      });
    };
    const observer = new MutationObserver(scheduleEnhance);
    observer.observe(board, { childList: true });
    if (secretCard) observer.observe(secretCard, { childList: true });
    if (locationBand) observer.observe(locationBand, { childList: true, subtree: true });

    return function uninstall() {
      observer.disconnect();
      delete document.body.dataset.characterRenderer;
      document.querySelectorAll(".ps1-character-stage").forEach((el) => el.remove());
      document.querySelectorAll(".has-ps1-character").forEach((el) => {
        el.classList.remove("has-ps1-character");
      });
      document.querySelectorAll(".ps1-secret-portrait").forEach((el) => {
        const img = el.querySelector("img");
        if (img) el.parentElement?.insertBefore(img, el);
        el.remove();
      });
      document.querySelectorAll("[data-ps1-source]").forEach((el) => {
        delete el.dataset.ps1Source;
        el.classList.remove("is-ps1-pixelated");
      });
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { ps1Install = install; }, { once: true });
  } else {
    ps1Install = install;
  }
})();
