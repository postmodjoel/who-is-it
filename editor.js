// Custom character editor and saved custom-character storage.

// ===================== Custom character editor (persisted to localStorage) =====================
const CUSTOM_KEY = "whoisit_custom_chars_v1";
const EDITOR_ANIM = ["still", "calm", "curious", "serious", "shifty", "alert", "smug", "sleepy", "googly", "sideeye", "crosseyed", "nervous", "nod", "bobble", "dreamy", "lean", "squint"];
function loadCustomChars() { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; } catch (e) { return []; } }
function saveCustomChars(list) { try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch (e) { /* storage disabled */ } }
function buildCustomCharacter(data) {
  const seed = data.seed != null ? data.seed : (95000 + (stableHash(data.id) % 4000));
  return {
    id: data.id, name: data.name || "Custom", pronouns: data.pronouns || "they",
    feature: "a custom-made character", secret: "keeps to themselves", role: data.role || "local witness",
    image: window.faceGenerator.renderPortrait(seed, data.traits), tags: [], variant: "",
    traits: data.traits, seed, isCustom: true
  };
}
// Rebuild the custom entries in the playable pool from storage (so saved faces get dealt into games).
function mergeCustomIntoPool() {
  if (!window.faceGenerator) return;
  [generatedCharacters, allCharacters].forEach((arr) => {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].isCustom) arr.splice(i, 1);
  });
  loadCustomChars().forEach((d) => { const ch = buildCustomCharacter(d); generatedCharacters.push(ch); allCharacters.push(ch); });
}
function upsertCustom(data) {
  const list = loadCustomChars();
  const i = list.findIndex((c) => c.id === data.id);
  if (i >= 0) list[i] = data; else list.push(data);
  saveCustomChars(list);
  mergeCustomIntoPool();
}
function deleteCustom(id) {
  saveCustomChars(loadCustomChars().filter((c) => c.id !== id));
  mergeCustomIntoPool();
}

let editorDialog = null, editorState = null;
function newEditorState() {
  const bases = generatedCharacters.filter((c) => !c.isCustom);
  const base = JSON.parse(JSON.stringify((bases.length ? pick(bases) : generatedCharacters[0]).traits || {}));
  return { id: `custom-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`, name: "New Face", pronouns: "they", traits: base, seed: 96000 + Math.floor(Math.random() * 3000), existing: false };
}
function renderEditorPreview() {
  const img = editorDialog.querySelector("#edPreview");
  if (img) img.src = window.faceGenerator.renderPortrait(editorState.seed, editorState.traits);
}
// Curated swatch palette for the colour widget (skin/hair naturals, De Stijl primaries, brights).
const EDITOR_SWATCHES = [
  "#171512", "#1f2330", "#fffdf7", "#8a8e99",
  "#e01b1b", "#1533cc", "#ffbe0b", "#178a47",
  "#3a2418", "#5a3d28", "#8a5a32", "#c98a4b", "#e8c48c", "#f2ddb8",
  "#111111", "#4a4a4a", "#b0b0b0", "#e8e2d4",
  "#ff5a72", "#ff8c42", "#5dff8f", "#4dd2ff", "#c46bff", "#ff2d6f",
  "#73497e", "#2d5a4e", "#7a1f1f", "#0a66c2", "#d25184", "#998880"
];
// lockShade returns rgb(...) strings; <input type="color"> only speaks #rrggbb.
function editorToHex(c) {
  if (!c) return "#5a3d28";
  if (c[0] === "#") return c.length === 7 ? c : "#5a3d28";
  const m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(c);
  if (!m) return "#5a3d28";
  return "#" + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, "0")).join("");
}
// A colour control = spectrum picker + hex field + swatch-grid button, all kept in sync.
function editorColorWidget(key, val) {
  return `<span class="ed-colorwrap">
    <input type="color" data-key="${key}" value="${val}">
    <input type="text" class="ed-hex" data-hexfor="${key}" value="${val}" maxlength="7" spellcheck="false" aria-label="Hex colour">
    <button type="button" class="ed-swatchbtn" data-swatchfor="${key}" title="Swatches">▦</button>
  </span>`;
}
function renderEditorControls() {
  const T = window.faceGenerator.traitBook, t = editorState.traits;
  const field = (label, html) => `<label class="ed-field"><span>${label}</span>${html}</label>`;
  const group = (title) => `<div class="ed-group">${title}</div>`;
  const sel = (key, opts, val) => `<select data-key="${key}">` + (opts || []).map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("") + "</select>";
  const slide = (key, label, min, max, step, val) => field(label, `<input type="range" data-key="${key}" data-num="1" min="${min}" max="${max}" step="${step}" value="${val}">`);
  const color = (key, label, def) => field(label, editorColorWidget(key, t[key] || def));
  const num = (k, d) => (t[k] != null ? t[k] : d);
  // The hair-lock designer rows: every placed lock gets shape/position/colour controls. The four
  // lock colours are LINKED by default - repainting the fill re-derives dark/shine/line at the same
  // relative shades; only a colour the user edits directly goes independent (see applyEditorValue).
  const lockRows = (Array.isArray(t.hairLocks) ? t.hairLocks : []).map((inst, i) => {
    if (inst.d) return `<div class="ed-lockrow"><b>Lock ${i + 1}</b> <i>(pen-drawn — edit in Face Studio)</i> <button type="button" class="ed-lockdel" data-lockdel="${i}">✕</button></div>`;
    const cat = (window.facesHair && window.facesHair.lockCatalog) || [];
    const opts = cat.map((c) => `<option value="${c.key}" ${c.key === inst.lock ? "selected" : ""}>${c.label}</option>`).join("");
    const shade = window.facesHair && window.facesHair.lockShade;
    const baseFill = editorToHex(inst.fill || "#5a3d28");
    const colorOf = (colKey, k) => editorToHex(inst[colKey] || (shade ? shade(baseFill, k) : baseFill));
    return `<div class="ed-lockrow">
      <div class="ed-lockhead"><b>Lock ${i + 1}</b><button type="button" class="ed-lockdel" data-lockdel="${i}">✕</button></div>
      ${field("Shape", `<select data-key="__lockf:${i}:lock">${opts}</select>`)}
      ${field("X", `<input type="range" data-key="__lockf:${i}:x" data-num="1" min="0" max="100" step="1" value="${inst.x != null ? inst.x : 50}">`)}
      ${field("Y", `<input type="range" data-key="__lockf:${i}:y" data-num="1" min="0" max="100" step="1" value="${inst.y != null ? inst.y : 32}">`)}
      ${field("Size", `<input type="range" data-key="__lockf:${i}:scale" data-num="1" min="0.15" max="1.6" step="0.02" value="${inst.scale != null ? inst.scale : 0.5}">`)}
      ${field("Rotate", `<input type="range" data-key="__lockf:${i}:rot" data-num="1" min="-180" max="180" step="1" value="${inst.rot != null ? inst.rot : 0}">`)}
      ${field("Mirror", sel(`__lockf:${i}:mirror`, ["no", "yes"], inst.mirror ? "yes" : "no"))}
      ${field("Behind head", sel(`__lockf:${i}:behind`, ["no", "yes"], inst.behind ? "yes" : "no"))}
      ${field("Strand lines", sel(`__lockf:${i}:lines`, ["yes", "no"], inst.lines === false ? "no" : "yes"))}
      ${field("Colour", editorColorWidget(`__lock:${i}:fill`, baseFill))}
      ${field("· dark", editorColorWidget(`__lock:${i}:dark`, colorOf("dark", 0.5)))}
      ${field("· shine", editorColorWidget(`__lock:${i}:shine`, colorOf("shine", 1.3)))}
      ${field("· lines", editorColorWidget(`__lock:${i}:line`, colorOf("line", 0.62)))}
    </div>`;
  }).join("");
  editorDialog.querySelector(".editor-controls").innerHTML =
    group("Identity") +
    field("Name", `<input type="text" data-key="__name" value="${escapeHtml(editorState.name)}" maxlength="16">`) +
    field("Pronouns", sel("__pronouns", ["she", "he", "they"], editorState.pronouns)) +
    field("Skin", sel("skin", T.skinTones, t.skin)) +
    field("Expression", sel("expression", T.expressions, t.expression)) +
    field("Animation", sel("animMode", EDITOR_ANIM, t.animMode || "still")) +
    slide("blinkRate", "Blink rate", 3, 16, 1, num("blinkRate", 8)) +
    group("Hair") +
    field("Hair style", sel("hair", T.hairStyles, t.hair)) +
    field("Hair colour", sel("hairColor", T.hairColors, t.hairColor)) +
    color("hairOutline", "Hair outline", "#1f2330") +
    slide("frontHairY", "Front hair Y", -24, 24, 1, num("frontHairY", 0)) +
    slide("backHairY", "Back hair Y", -24, 24, 1, num("backHairY", 0)) +
    field("Lock blending", sel("lockBlend", ["merged", "separate"], t.lockBlend || "merged")) +
    group("Hair locks") +
    (lockRows || `<p class="ed-note">No extra locks placed.</p>`) +
    `<button type="button" class="button ghost ed-lockadd">＋ Add lock</button>` +
    group("Beard & brows") +
    field("Accessory", sel("accessory", T.accessories, t.accessory || "none")) +
    color("accessoryColor", "Accessory colour", "#303840") +
    slide("accessoryScale", "Accessory size", 0.5, 1.7, 0.02, num("accessoryScale", 1)) +
    slide("accessoryX", "Accessory X", -30, 30, 1, num("accessoryX", 0)) +
    slide("accessoryY", "Accessory Y", -30, 30, 1, num("accessoryY", 0)) +
    slide("beardLength", "Beard length", 0, 0.5, 0.01, num("beardLength", 0)) +
    slide("beardScale", "Beard size", 0.6, 1.6, 0.02, num("beardScale", 1)) +
    slide("beardY", "Beard height", -18, 10, 0.5, num("beardY", 0)) +
    slide("moustacheScale", "Moustache", 0, 1.6, 0.02, num("moustacheScale", 0)) +
    field("Brow", sel("browShape", T.browShapes, t.browShape || (T.browShapes || [])[0])) +
    slide("browThick", "Brow weight", 0.4, 2, 0.01, num("browThick", 1)) +
    slide("browY", "Brow height", -6, 6, 0.5, num("browY", 0)) +
    slide("browScaleX", "Brow width", 0.7, 1.35, 0.01, num("browScaleX", 1)) +
    group("Face") +
    field("Face shape", sel("faceShape", T.faceShapes, t.faceShape)) +
    field("Chin", sel("chinShape", T.chinShapes, t.chinShape || "none")) +
    field("Ears", sel("earVariant", T.earVariants, t.earVariant || "round")) +
    slide("headScaleX", "Head width", 0.85, 1.15, 0.01, num("headScaleX", 1)) +
    slide("headScaleY", "Head height", 0.85, 1.15, 0.01, num("headScaleY", 1)) +
    slide("headY", "Head lift", -14, 14, 1, num("headY", 0)) +
    slide("jawLength", "Jaw length", -0.2, 0.5, 0.01, num("jawLength", 0)) +
    slide("chinY", "Chin height", -12, 8, 0.5, num("chinY", 0)) +
    slide("chinWidth", "Chin width", 0.7, 1.4, 0.02, num("chinWidth", 1)) +
    slide("earScale", "Ear size", 0.7, 1.3, 0.02, num("earScale", 1)) +
    slide("earY", "Ear height", -10, 10, 0.5, num("earY", 0)) +
    group("Nose") +
    field("Nose tip", sel("noseTip", T.noseTips, t.noseTip || "round")) +
    slide("noseScale", "Nose size", 0.7, 1.3, 0.01, num("noseScale", 1)) +
    slide("noseWidth", "Nose width", 0.7, 1.3, 0.01, num("noseWidth", 1)) +
    slide("noseY", "Nose height", -8, 8, 0.5, num("noseY", 0)) +
    group("Eyes") +
    color("eyeColor", "Eye colour", "#5a3d28") +
    slide("eyeScale", "Eye size", 0.8, 1.25, 0.01, num("eyeScale", 1)) +
    slide("eyeOpen", "Eye openness", 0.4, 1.3, 0.02, num("eyeOpen", 1)) +
    slide("irisScale", "Iris size", 0.55, 1, 0.01, num("irisScale", 0.8)) +
    slide("eyeGap", "Eye spacing", 42, 62, 1, num("eyeGap", 47)) +
    slide("eyeY", "Eye height", -6, 6, 0.5, num("eyeY", 0)) +
    slide("pupilX", "Pupil X", -3, 3, 0.5, num("pupilX", 0)) +
    slide("pupilY", "Pupil Y", -4, 4, 0.5, num("pupilY", 0)) +
    slide("lazyEye", "Lazy eye", -8, 8, 0.5, num("lazyEye", 0)) +
    slide("eyeDart", "Eye dart", 0, 0.5, 0.02, num("eyeDart", 0.2)) +
    slide("lashes", "Lashes", 0, 1.6, 0.05, num("lashes", 0)) +
    group("Skin detail") +
    slide("cheekOpacity", "Blush", 0, 0.3, 0.01, num("cheekOpacity", 0.08)) +
    slide("cheekY", "Blush height", -6, 6, 0.5, num("cheekY", 0)) +
    slide("nasoOpacity", "Smile lines", 0, 1, 0.05, num("nasoOpacity", 0)) +
    slide("foreheadLineOpacity", "Forehead lines", 0, 1, 0.05, num("foreheadLineOpacity", 0)) +
    slide("underEyeOpacity", "Under-eye", 0, 1, 0.05, num("underEyeOpacity", 0)) +
    slide("crowsFeetOpacity", "Crow's feet", 0, 1, 0.05, num("crowsFeetOpacity", 0)) +
    slide("marionetteOpacity", "Marionette lines", 0, 1, 0.05, num("marionetteOpacity", 0)) +
    group("Mouth & teeth") +
    field("Mouth", sel("mouthStyle", T.mouthStyles, t.mouthStyle)) +
    field("Teeth", sel("teethStyle", T.teethStyles, t.teethStyle || "even")) +
    slide("teethGap", "Teeth gap", 0, 6, 0.5, num("teethGap", 0)) +
    slide("teethScale", "Teeth size", 0.7, 1.3, 0.02, num("teethScale", 1)) +
    slide("teethOverhang", "Overhang", 0, 8, 0.5, num("teethOverhang", 0)) +
    field("Lips", sel("lips", T.lipStyles, t.lips || "soft")) +
    field("Upper lip", sel("lipUpper", T.lipUppers, t.lipUpper || "soft")) +
    field("Lower lip", sel("lipLower", T.lipLowers, t.lipLower || "round")) +
    slide("lipUpperSize", "Upper size", 0.3, 1.6, 0.05, num("lipUpperSize", 1)) +
    slide("lipLowerSize", "Lower size", 0.3, 1.6, 0.05, num("lipLowerSize", 1)) +
    color("lipColor", "Lip colour", "#a55a52") +
    slide("mouthScale", "Mouth size", 0.85, 1.25, 0.01, num("mouthScale", 1)) +
    slide("mouthY", "Mouth height", -6, 14, 0.5, num("mouthY", 0)) +
    slide("lipLineWidth", "Lip line width", 0.3, 3, 0.05, num("lipLineWidth", 1)) +
    group("Body") +
    field("Clothing", sel("clothing", T.clothing, t.clothing)) +
    color("shirt", "Shirt", "#3a86ff") +
    color("background", "Background", "#a9c4e0") +
    slide("build", "Build", 55, 115, 1, num("build", 82)) +
    slide("shoulderSlope", "Shoulder slope", 0, 1, 0.02, num("shoulderSlope", 0.5)) +
    slide("bodyWidth", "Body width", 0.6, 1.4, 0.02, num("bodyWidth", 1)) +
    slide("bust", "Bust", 0, 0.9, 0.01, num("bust", 0)) +
    slide("belly", "Belly", 0, 0.6, 0.02, num("belly", 0)) +
    group("Tattoo") +
    field("Text", `<input type="text" data-key="tattooText" value="${escapeHtml(t.tattooText || "")}" maxlength="6" placeholder="❤ / txt">`) +
    field("Placement", sel("tattooPlace", ["body", "face"], t.tattooPlace || "body")) +
    slide("tattooX", "Tattoo X", -45, 45, 1, num("tattooX", 0)) +
    slide("tattooY", "Tattoo Y", -40, 20, 1, num("tattooY", 0)) +
    slide("tattooScale", "Tattoo size", 0.4, 1.6, 0.05, num("tattooScale", 1)) +
    slide("tattooRot", "Tattoo angle", -60, 60, 1, num("tattooRot", 0));
  wireEditorColorWidgets();
  wireEditorLockButtons();
}
// Keep the three faces of each colour control (picker / hex / swatches) in lockstep.
function wireEditorColorWidgets() {
  const root = editorDialog.querySelector(".editor-controls");
  root.querySelectorAll(".ed-hex").forEach((hexEl) => {
    hexEl.addEventListener("input", () => {
      const v = hexEl.value.trim();
      if (!/^#[0-9a-fA-F]{6}$/.test(v)) return;
      const key = hexEl.dataset.hexfor;
      const picker = root.querySelector(`input[type="color"][data-key="${CSS.escape(key)}"]`);
      if (picker) picker.value = v.toLowerCase();
      applyEditorValue(key, v.toLowerCase(), false);
      renderEditorPreview();
    });
  });
  root.querySelectorAll(".ed-swatchbtn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelector(".ed-swatchpop")?.remove();
      const key = btn.dataset.swatchfor;
      const pop = document.createElement("div");
      pop.className = "ed-swatchpop";
      pop.innerHTML = EDITOR_SWATCHES.map((c) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join("");
      btn.parentElement.appendChild(pop);
      pop.addEventListener("click", (e) => {
        const c = e.target.dataset && e.target.dataset.c;
        if (!c) return;
        const picker = editorDialog.querySelector(`input[type="color"][data-key="${CSS.escape(key)}"]`);
        const hexEl = editorDialog.querySelector(`.ed-hex[data-hexfor="${CSS.escape(key)}"]`);
        if (picker) picker.value = c;
        if (hexEl) hexEl.value = c;
        applyEditorValue(key, c, false);
        renderEditorPreview();
        pop.remove();
      });
      setTimeout(() => document.addEventListener("pointerdown", function away(e) {
        if (!pop.contains(e.target)) { pop.remove(); document.removeEventListener("pointerdown", away); }
      }), 0);
    });
  });
}
function wireEditorLockButtons() {
  const root = editorDialog.querySelector(".editor-controls");
  root.querySelector(".ed-lockadd")?.addEventListener("click", () => {
    const cat = (window.facesHair && window.facesHair.lockCatalog) || [];
    if (!Array.isArray(editorState.traits.hairLocks)) editorState.traits.hairLocks = [];
    editorState.traits.hairLocks.push({ lock: cat.length ? cat[0].key : "sideSwoop", x: 50, y: 30, scale: 0.5, rot: 0, lines: true });
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelectorAll(".ed-lockdel").forEach((b) => b.addEventListener("click", () => {
    editorState.traits.hairLocks.splice(Number(b.dataset.lockdel), 1);
    renderEditorControls(); renderEditorPreview();
  }));
}
// Route an editor value onto the trait model. Lock colours are LINKED: painting the fill re-derives
// dark/shine/line at their standard relative shades UNLESS that channel was manually overridden
// (a direct edit sets a _m<Channel> flag on the lock and it goes independent from then on).
function applyEditorValue(key, val, isNum) {
  if (key === "__name") { editorState.name = val || "Face"; return; }
  if (key === "__pronouns") { editorState.pronouns = val; return; }
  if (key.startsWith("__lockf:")) {
    const [, iStr, prop] = key.split(":");
    const inst = editorState.traits.hairLocks && editorState.traits.hairLocks[Number(iStr)];
    if (!inst) return;
    if (prop === "mirror" || prop === "behind") inst[prop] = val === "yes";
    else if (prop === "lines") inst.lines = val !== "no";
    else if (prop === "lock") inst.lock = val;
    else inst[prop] = Number(val);
    return;
  }
  if (key.startsWith("__lock:")) {
    const [, iStr, col] = key.split(":");
    const inst = editorState.traits.hairLocks && editorState.traits.hairLocks[Number(iStr)];
    if (!inst) return;
    const shade = window.facesHair && window.facesHair.lockShade;
    if (col === "fill") {
      inst.fill = val;
      if (shade) {
        if (!inst._mDark) inst.dark = editorToHex(shade(val, 0.5));
        if (!inst._mShine) inst.shine = editorToHex(shade(val, 1.3));
        if (!inst._mLine) inst.line = editorToHex(shade(val, 0.62));
      }
      // Repaint the sibling swatches in place (no full re-render: keeps focus on the picker).
      [["dark", inst.dark], ["shine", inst.shine], ["line", inst.line]].forEach(([c, v]) => {
        if (!v) return;
        const picker = editorDialog.querySelector(`input[type="color"][data-key="__lock:${iStr}:${c}"]`);
        const hexEl = editorDialog.querySelector(`.ed-hex[data-hexfor="__lock:${iStr}:${c}"]`);
        if (picker) picker.value = v;
        if (hexEl) hexEl.value = v;
      });
    } else {
      inst[col] = val;
      inst["_m" + col[0].toUpperCase() + col.slice(1)] = true;   // manually set → unlink from fill
    }
    return;
  }
  editorState.traits[key] = isNum ? Number(val) : val;
}
function renderEditorSaved() {
  const list = loadCustomChars();
  const box = editorDialog.querySelector("#edSavedList");
  box.innerHTML = list.length
    ? list.map((c) => `<button type="button" class="ed-chip" data-edit="${c.id}">${escapeHtml(c.name)}</button>`).join("")
    : `<span class="ed-empty">None yet — build one and hit Save.</span>`;
  box.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => {
    const c = loadCustomChars().find((x) => x.id === b.dataset.edit);
    if (c) { editorState = { ...c, traits: JSON.parse(JSON.stringify(c.traits)), existing: true }; renderEditorControls(); renderEditorPreview(); syncEditorButtons(); }
  }));
}
// The live board list: pick a character on the current board to restyle - Save applies + syncs.
function renderEditorBoard() {
  const box = editorDialog.querySelector("#edBoardList");
  if (!box) return;
  const chars = state.board.filter((c) => c.traits);
  box.innerHTML = chars.length
    ? chars.map((c) => `<button type="button" class="ed-chip ${editorState.boardId === c.id ? "is-on" : ""}" data-board="${c.id}">${escapeHtml(displayName(c))}</button>`).join("")
    : `<span class="ed-empty">Deal a game to edit its characters.</span>`;
  box.querySelectorAll("[data-board]").forEach((b) => b.addEventListener("click", () => {
    const c = state.board.find((x) => x.id === b.dataset.board);
    if (!c) return;
    editorState = { id: c.id, name: c.name, pronouns: c.pronouns || "they", traits: JSON.parse(JSON.stringify(c.traits)), seed: c.seed, existing: false, boardId: c.id };
    renderEditorControls(); renderEditorPreview(); renderEditorBoard(); syncEditorButtons();
  }));
}
function syncEditorButtons() {
  const del = editorDialog.querySelector("#edDelete");
  if (del) del.style.display = (editorState.existing && !editorState.boardId) ? "" : "none";
  const save = editorDialog.querySelector("#edSave");
  const add = editorDialog.querySelector("#edAdd");
  const hint = editorDialog.querySelector("#edHint");
  if (editorState.boardId) {
    if (save) save.textContent = "💾 Save to board";
    if (add) add.style.display = "none";
    if (hint) hint.textContent = `Editing ${editorState.name} on the board — Save syncs to both players.`;
  } else {
    if (save) save.textContent = "Save";
    if (add) add.style.display = "";
    if (hint) hint.textContent = "Saved faces get dealt into future games.";
  }
}
// Randomisers. RAND maps each editable trait to a value generator (categorical from the traitBook,
// numeric within the slider range, colours as hex).
function editorRand() {
  const T = window.faceGenerator.traitBook;
  const pickA = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const hex = () => "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  const num = (lo, hi, dp) => +(lo + Math.random() * (hi - lo)).toFixed(dp);
  return {
    __pronouns: () => pickA(["she", "he", "they"]),
    skin: () => pickA(T.skinTones), hair: () => pickA(T.hairStyles), hairColor: () => pickA(T.hairColors),
    expression: () => pickA(T.expressions), faceShape: () => pickA(T.faceShapes),
    noseTip: () => pickA(T.noseTips || ["round"]), browShape: () => pickA(T.browShapes),
    clothing: () => pickA(T.clothing), accessory: () => pickA(T.accessories), animMode: () => pickA(EDITOR_ANIM),
    eyeColor: hex, shirt: hex,
    eyeScale: () => num(0.8, 1.2, 2), browThick: () => num(0.7, 1.4, 2), noseWidth: () => num(0.7, 1.3, 2),
    mouthScale: () => num(0.85, 1.2, 2), build: () => Math.floor(num(60, 110, 0))
  };
}
function setEditorTrait(key, val) {
  if (key === "__pronouns") editorState.pronouns = val;
  else editorState.traits[key] = val;
}
function randomizeAll() {
  const R = editorRand();
  Object.keys(R).forEach((k) => setEditorTrait(k, R[k]()));
  renderEditorControls(); renderEditorPreview();
}
function randomizeCurrent() {
  const R = editorRand();
  const keys = Object.keys(R);
  const key = (editorState.lastKey && R[editorState.lastKey]) ? editorState.lastKey : keys[Math.floor(Math.random() * keys.length)];
  setEditorTrait(key, R[key]());
  renderEditorControls(); renderEditorPreview();
  // Re-focus the field we just rolled so "This setting" keeps targeting it.
  const el = editorDialog.querySelector(`[data-key="${key}"]`);
  if (el) { el.focus(); editorState.lastKey = key; }
}
// Apply the current edit to the live board character and broadcast it to the other seat.
function applyBoardEdit() {
  const c = state.board.find((x) => x.id === editorState.boardId);
  if (!c) return;
  c.traits = JSON.parse(JSON.stringify(editorState.traits));
  c.name = editorState.name; c.pronouns = editorState.pronouns;
  try { c.image = window.faceGenerator.renderPortrait(c.seed, c.traits); } catch (e) { /* keep old */ }
  if (state.global.mystery) { try { reapplyCurrentMystery(); } catch (err) { /* no per-char data */ } }
  renderBoard(); renderSecret();
  netSend("editchar", { id: c.id, traits: c.traits, name: c.name, pronouns: c.pronouns, seed: c.seed });
  flashToast(`🎨 ${c.name} restyled${state.gameMode === "online" ? " — synced" : ""}.`);
  sfx("sparkle");
}
function buildEditorDialog() {
  const d = document.createElement("dialog");
  d.className = "editor-dialog";
  d.innerHTML = `
    <div class="editor-inner">
      <div class="dialog-head">
        <div><p class="eyebrow">Character studio</p><h2>Make &amp; save a character</h2></div>
        <button class="icon-button" id="edClose" type="button" aria-label="Close">X</button>
      </div>
      <div class="editor-body">
        <div class="editor-preview">
          <img id="edPreview" alt="preview">
          <small id="edHint">Saved faces get dealt into future games.</small>
          <div class="ed-rand">
            <button type="button" id="edRandAll" class="button ghost">🎲 Randomise all</button>
            <button type="button" id="edRandOne" class="button ghost">🎲 This setting</button>
          </div>
        </div>
        <div class="editor-controls"></div>
      </div>
      <div class="editor-saved"><p class="label">On the board <span class="ed-sub">— edit & sync live to both players</span></p><div id="edBoardList" class="ed-saved-list"></div></div>
      <div class="editor-saved"><p class="label">Saved characters</p><div id="edSavedList" class="ed-saved-list"></div></div>
      <div class="dialog-actions">
        <button type="button" id="edDelete" class="button ghost">Delete</button>
        <button type="button" id="edNew" class="button ghost">New</button>
        <button type="button" id="edAdd" class="button secondary">Add to board</button>
        <button type="button" id="edSave" class="button primary">Save</button>
      </div>
    </div>`;
  document.body.appendChild(d);
  d.querySelector(".editor-controls").addEventListener("input", (e) => {
    const el = e.target, key = el.dataset.key;
    if (!key) return;
    applyEditorValue(key, el.value, !!el.dataset.num);
    // Spectrum picker moved → mirror the value into its hex twin.
    if (el.type === "color") {
      const hexEl = d.querySelector(`.ed-hex[data-hexfor="${CSS.escape(key)}"]`);
      if (hexEl) hexEl.value = el.value;
    }
    renderEditorPreview();
  });
  // Remember the last field the user touched so "🎲 This setting" knows which one to roll.
  d.querySelector(".editor-controls").addEventListener("focusin", (e) => { if (e.target.dataset && e.target.dataset.key && e.target.dataset.key !== "__name") editorState.lastKey = e.target.dataset.key; });
  d.querySelector("#edRandAll").addEventListener("click", randomizeAll);
  d.querySelector("#edRandOne").addEventListener("click", randomizeCurrent);
  const persist = () => {
    const data = { id: editorState.id, name: editorState.name, pronouns: editorState.pronouns, traits: editorState.traits, seed: editorState.seed };
    upsertCustom(data);
    editorState.existing = true;
    renderEditorSaved(); syncEditorButtons();
    return data;
  };
  d.querySelector("#edSave").addEventListener("click", () => { if (editorState.boardId) applyBoardEdit(); else persist(); });
  d.querySelector("#edAdd").addEventListener("click", () => {
    const data = persist();
    const ch = buildCustomCharacter(data);
    const bi = state.board.findIndex((c) => c.id === data.id);
    if (bi >= 0) state.board[bi] = ch; else state.board.push(ch);
    if (state.global.mystery) { try { reapplyCurrentMystery(); } catch (err) { /* no per-char data */ } }
    state.justBorn = data.id; renderBoard(); state.justBorn = null;
  });
  d.querySelector("#edNew").addEventListener("click", () => { editorState = newEditorState(); renderEditorControls(); renderEditorPreview(); renderEditorBoard(); syncEditorButtons(); });
  d.querySelector("#edDelete").addEventListener("click", () => { if (editorState.existing) deleteCustom(editorState.id); editorState = newEditorState(); renderEditorControls(); renderEditorPreview(); renderEditorSaved(); syncEditorButtons(); });
  d.querySelector("#edClose").addEventListener("click", () => d.close());
  return d;
}
function openCharacterEditor() {
  if (!window.faceGenerator) return;
  if (!editorDialog) editorDialog = buildEditorDialog();
  editorState = newEditorState();
  renderEditorControls(); renderEditorPreview(); renderEditorSaved(); renderEditorBoard(); syncEditorButtons();
  editorDialog.showModal();
}
