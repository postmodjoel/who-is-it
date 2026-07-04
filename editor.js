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
function renderEditorControls() {
  const T = window.faceGenerator.traitBook, t = editorState.traits;
  const field = (label, html) => `<label class="ed-field"><span>${label}</span>${html}</label>`;
  const group = (title) => `<div class="ed-group">${title}</div>`;
  const sel = (key, opts, val) => `<select data-key="${key}">` + (opts || []).map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("") + "</select>";
  const slide = (key, label, min, max, step, val) => field(label, `<input type="range" data-key="${key}" data-num="1" min="${min}" max="${max}" step="${step}" value="${val}">`);
  const color = (key, label, def) => field(label, `<input type="color" data-key="${key}" value="${t[key] || def}">`);
  const num = (k, d) => (t[k] != null ? t[k] : d);
  editorDialog.querySelector(".editor-controls").innerHTML =
    group("Identity") +
    field("Name", `<input type="text" data-key="__name" value="${escapeHtml(editorState.name)}" maxlength="16">`) +
    field("Pronouns", sel("__pronouns", ["she", "he", "they"], editorState.pronouns)) +
    field("Skin", sel("skin", T.skinTones, t.skin)) +
    field("Expression", sel("expression", T.expressions, t.expression)) +
    field("Animation", sel("animMode", EDITOR_ANIM, t.animMode || "still")) +
    group("Hair") +
    field("Hair style", sel("hair", T.hairStyles, t.hair)) +
    field("Hair colour", sel("hairColor", T.hairColors, t.hairColor)) +
    color("hairOutline", "Hair outline", "#1f2330") +
    slide("frontHairY", "Front hair Y", -24, 24, 1, num("frontHairY", 0)) +
    slide("backHairY", "Back hair Y", -24, 24, 1, num("backHairY", 0)) +
    group("Beard & brows") +
    field("Accessory", sel("accessory", T.accessories, t.accessory || "none")) +
    slide("beardLength", "Beard length", 0, 0.5, 0.01, num("beardLength", 0)) +
    slide("beardScale", "Beard size", 0.6, 1.6, 0.02, num("beardScale", 1)) +
    slide("moustacheScale", "Moustache", 0, 1.6, 0.02, num("moustacheScale", 0)) +
    field("Brow", sel("browShape", T.browShapes, t.browShape || (T.browShapes || [])[0])) +
    slide("browThick", "Brow weight", 0.4, 2, 0.01, num("browThick", 1)) +
    slide("browY", "Brow height", -6, 6, 0.5, num("browY", 0)) +
    group("Face") +
    field("Face shape", sel("faceShape", T.faceShapes, t.faceShape)) +
    field("Nose tip", sel("noseTip", T.noseTips, t.noseTip || "round")) +
    field("Chin", sel("chinShape", T.chinShapes, t.chinShape || "none")) +
    field("Ears", sel("earVariant", T.earVariants, t.earVariant || "round")) +
    slide("headScaleX", "Head width", 0.85, 1.15, 0.01, num("headScaleX", 1)) +
    slide("headScaleY", "Head height", 0.85, 1.15, 0.01, num("headScaleY", 1)) +
    slide("jawLength", "Jaw length", -0.2, 0.5, 0.01, num("jawLength", 0)) +
    slide("noseWidth", "Nose width", 0.7, 1.3, 0.01, num("noseWidth", 1)) +
    slide("noseY", "Nose height", -8, 8, 0.5, num("noseY", 0)) +
    group("Eyes") +
    color("eyeColor", "Eye colour", "#5a3d28") +
    slide("eyeScale", "Eye size", 0.8, 1.25, 0.01, num("eyeScale", 1)) +
    slide("eyeGap", "Eye spacing", 42, 62, 1, num("eyeGap", 47)) +
    slide("lashes", "Lashes", 0, 1.6, 0.05, num("lashes", 0)) +
    group("Mouth & teeth") +
    field("Mouth", sel("mouthStyle", T.mouthStyles, t.mouthStyle)) +
    field("Teeth", sel("teethStyle", T.teethStyles, t.teethStyle || "even")) +
    field("Lips", sel("lips", T.lipStyles, t.lips || "soft")) +
    color("lipColor", "Lip colour", "#a55a52") +
    slide("mouthScale", "Mouth size", 0.85, 1.25, 0.01, num("mouthScale", 1)) +
    slide("mouthY", "Mouth height", -6, 14, 0.5, num("mouthY", 0)) +
    slide("lipLineWidth", "Lip line width", 0.3, 3, 0.05, num("lipLineWidth", 1)) +
    group("Body") +
    field("Clothing", sel("clothing", T.clothing, t.clothing)) +
    color("shirt", "Shirt", "#3a86ff") +
    color("background", "Background", "#a9c4e0") +
    slide("build", "Build", 55, 115, 1, num("build", 82)) +
    slide("bust", "Bust", 0, 0.9, 0.01, num("bust", 0));
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
    if (key === "__name") editorState.name = el.value || "Face";
    else if (key === "__pronouns") editorState.pronouns = el.value;
    else editorState.traits[key] = el.dataset.num ? Number(el.value) : el.value;
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
