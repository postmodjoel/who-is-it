// Custom character editor and saved custom-character storage.

// ===================== Custom character editor (persisted to localStorage) =====================
const CUSTOM_KEY = "whoisit_custom_chars_v1";
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
let editorPreviewFrame = 0, pendingEditorPreview = null;
function newEditorState() {
  const bases = generatedCharacters.filter((c) => !c.isCustom);
  const base = JSON.parse(JSON.stringify((bases.length ? pick(bases) : generatedCharacters[0]).traits || {}));
  return { id: `custom-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`, name: "New Face", pronouns: "they", traits: base, seed: 96000 + Math.floor(Math.random() * 3000), existing: false };
}
function renderEditorPreview() {
  if (!editorDialog || !editorState) return;
  pendingEditorPreview = {
    seed: editorState.seed,
    traits: JSON.parse(JSON.stringify(editorState.traits))
  };
  if (editorPreviewFrame) return;
  editorPreviewFrame = requestAnimationFrame(() => {
    editorPreviewFrame = 0;
    if (!pendingEditorPreview) return;
    const src = window.faceGenerator.renderPortrait(pendingEditorPreview.seed, pendingEditorPreview.traits);
    const img = editorDialog.querySelector("#edPreview");
    if (img && img.src !== src) img.src = src;
    pendingEditorPreview = null;
  });
}
function wireEditorHotspots() {
  const root = editorDialog.querySelector(".ed-hotspots");
  if (!root) return;
  root.innerHTML = EDITOR_HOTSPOTS.map((spot) => `
    <button type="button" class="ed-hotspot" data-hotkey="${escapeHtml(spot.key)}"
      style="left:${spot.left}%;top:${spot.top}%;width:${spot.width}%;height:${spot.height}%;"
      title="${escapeHtml(spot.label)}"><span>${escapeHtml(spot.label)}</span></button>
  `).join("");
  root.querySelectorAll("[data-hotkey]").forEach((btn) => btn.addEventListener("click", () => jumpEditorToKey(btn.dataset.hotkey)));
}
function jumpEditorToKey(key) {
  const root = editorDialog.querySelector(".editor-controls");
  if (!root) return;
  const target = root.querySelector(`[data-key="${CSS.escape(key)}"]`);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
  const field = target.closest(".ed-field, .ed-lockrow, .ed-tatrow");
  if (field) {
    field.classList.add("is-hot");
    setTimeout(() => field.classList.remove("is-hot"), 1200);
  }
  try { target.focus({ preventScroll: true }); } catch (e) { /* ignore */ }
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
const EDITOR_HOTSPOTS = [
  { label: "Face", key: "faceShape", left: 2, top: 2, width: 18, height: 10 },
  { label: "Hair", key: "hair", left: 22, top: 2, width: 56, height: 24 },
  { label: "Ear", key: "earVariant", left: 4, top: 46, width: 14, height: 18 },
  { label: "Ear", key: "earVariant", left: 82, top: 46, width: 14, height: 18 },
  { label: "Brows", key: "browShape", left: 26, top: 36, width: 48, height: 10 },
  { label: "Eyes", key: "eyeScale", left: 26, top: 44, width: 48, height: 12 },
  { label: "Nose", key: "noseTip", left: 40, top: 52, width: 20, height: 16 },
  { label: "Cheeks", key: "cheekOpacity", left: 18, top: 54, width: 18, height: 14 },
  { label: "Cheeks", key: "cheekOpacity", left: 64, top: 54, width: 18, height: 14 },
  { label: "Mouth", key: "mouthStyle", left: 36, top: 64, width: 28, height: 10 },
  { label: "Jaw / Beard", key: "beardLength", left: 28, top: 72, width: 44, height: 18 },
  { label: "Outfit", key: "clothing", left: 20, top: 88, width: 60, height: 12 }
];
// lockShade returns rgb(...) strings; <input type="color"> only speaks #rrggbb.
function editorToHex(c) {
  if (!c) return "#5a3d28";
  if (c[0] === "#") return c.length === 7 ? c : "#5a3d28";
  const m = /rgba?\((\d+)[,\s]+(\d+)[,\s]+(\d+)/.exec(c);
  if (!m) return "#5a3d28";
  return "#" + [m[1], m[2], m[3]].map((n) => (+n).toString(16).padStart(2, "0")).join("");
}

function editorHexToRgb(hex) {
  const clean = editorToHex(hex).slice(1);
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16)
  };
}

function editorRgbToHex(r, g, b) {
  return "#" + [r, g, b].map((part) => Math.max(0, Math.min(255, Math.round(part))).toString(16).padStart(2, "0")).join("");
}

function editorRgbToHsl(r, g, b) {
  const rn = r / 255, gn = g / 255, bn = b / 255;
  const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  const d = max - min;
  if (d) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case rn: h = ((gn - bn) / d + (gn < bn ? 6 : 0)); break;
      case gn: h = ((bn - rn) / d + 2); break;
      default: h = ((rn - gn) / d + 4); break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

function editorHslToRgb(h, s, l) {
  const hn = ((h % 360) + 360) % 360 / 360;
  const sn = Math.max(0, Math.min(100, s)) / 100;
  const ln = Math.max(0, Math.min(100, l)) / 100;
  if (!sn) {
    const v = Math.round(ln * 255);
    return { r: v, g: v, b: v };
  }
  const hue2rgb = (p, q, t) => {
    let tt = t;
    if (tt < 0) tt += 1;
    if (tt > 1) tt -= 1;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  const q = ln < 0.5 ? ln * (1 + sn) : ln + sn - ln * sn;
  const p = 2 * ln - q;
  return {
    r: Math.round(hue2rgb(p, q, hn + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, hn) * 255),
    b: Math.round(hue2rgb(p, q, hn - 1 / 3) * 255)
  };
}

// A colour control = palette chip + hidden native fallback + hex field + swatch-grid button.
function editorColorWidget(key, val) {
  const hex = editorToHex(val);
  return `<span class="ed-colorwrap">
    <button type="button" class="ed-colorchip" data-swatchfor="${key}" style="--chip:${hex}" title="Open colour palette" aria-label="Colour"></button>
    <input type="color" data-key="${key}" value="${hex}" tabindex="-1" aria-hidden="true">
    <input type="text" class="ed-hex" data-hexfor="${key}" value="${hex}" maxlength="7" spellcheck="false" aria-label="Hex colour">
    <button type="button" class="ed-swatchbtn" data-swatchfor="${key}" title="Palette">◫</button>
  </span>`;
}
function sharedEditorFieldList(traitBook) {
  const shared = window.WhoEditorShared;
  if (!shared || !shared.fieldsForFaceStudio) return [];
  return shared.fieldsForFaceStudio(traitBook, traitBook.accessories || []);
}
function sharedGroupOrder() {
  const shared = window.WhoEditorShared;
  return Array.isArray(shared && shared.groupOrder) && shared.groupOrder.length
    ? shared.groupOrder.slice()
    : ["Face", "Skin", "Hair", "Brows", "Eyes", "Nose", "Face Lines", "Cheeks", "Ears", "Mouth", "Teeth", "Jaw", "Chin", "Clothing", "Accessory", "Jewellery", "Beard", "Animation", "Moustache", "Tattoo"];
}
function sharedGroupTitle(groupName) {
  const shared = window.WhoEditorShared;
  const map = (shared && shared.groupTitleMap) || {};
  return map[groupName] || groupName;
}
function editorColorDefault(key, traits) {
  if (key === "lipColor") return traits.lipColor || "#a55a52";
  if (key === "shirt") return traits.shirt || "#3a86ff";
  if (key === "background") return traits.background || "#a9c4e0";
  if (key === "accessoryColor") return traits.accessoryColor || "#303840";
  if (key === "hairOutline") return traits.hairOutline || "#1f2330";
  if (key === "eyeColor") return traits.eyeColor || "#5a3d28";
  if (key === "eyelashColor") return traits.eyelashColor || "#1f2330";
  if (key === "eyeshadowColor") return traits.eyeshadowColor || "#6a527a";
  if (key === "blushColor") return traits.blushColor || "#e7a18c";
  return traits[key] || "#5a3d28";
}
function renderEditorControls() {
  const T = window.faceGenerator.traitBook, t = editorState.traits;
  const field = (label, html) => `<label class="ed-field"><span>${label}</span>${html}</label>`;
  const group = (title) => `<div class="ed-group">${title}</div>`;
  const sel = (key, opts, val) => `<select data-key="${key}">` + (opts || []).map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("") + "</select>";
  const slide = (key, label, min, max, step, val) => field(label, `
    <span class="ed-range">
      <input type="range" data-key="${key}" data-num="1" data-pair="${key}" min="${min}" max="${max}" step="${step}" value="${val}">
      <input type="number" class="ed-num" data-key="${key}" data-num="1" data-pair="${key}" step="${step}" value="${val}">
    </span>`);
  const color = (key, label, def) => field(label, editorColorWidget(key, t[key] || def));
  const num = (k, d) => (t[k] != null ? t[k] : d);
  const renderSharedField = (item) => {
    const value = t[item.key] != null ? t[item.key] : item.fallback;
    if (item.type === "select") {
      const opts = (item.options ? item.options() : []).map(([optValue, optLabel]) => `<option value="${escapeHtml(optValue)}" ${optValue === value ? "selected" : ""}>${escapeHtml(optLabel)}</option>`).join("");
      return field(item.label, `<select data-key="${item.key}">${opts}</select>`);
    }
    if (item.type === "color") return color(item.key, item.label, editorColorDefault(item.key, t));
    if (item.type === "text") return field(item.label, `<input type="text" data-key="${item.key}" value="${escapeHtml(value || "")}" maxlength="18" spellcheck="false">`);
    return slide(item.key, item.label, item.min, item.max, item.step, value);
  };
  // The hair-lock designer rows: every placed lock gets shape/position/colour controls. The four
  // lock colours are LINKED by default - repainting the fill re-derives dark/shine/line at the same
  // relative shades; only a colour the user edits directly goes independent (see applyEditorValue).
  const lockRows = (Array.isArray(t.hairLocks) ? t.hairLocks : []).map((inst, i) => {
    if (inst.d) {
      const fill = editorToHex(inst.fill || "#5a3d28");
      const outline = editorToHex(inst.outline && inst.outline !== "none" ? inst.outline : "#1f2330");
      return `<div class="ed-lockrow">
        <div class="ed-lockhead"><b>Lock ${i + 1}</b><span class="ed-note">drawn shape</span><span class="ed-rowtools"><button type="button" class="ed-rowbtn" data-lockup="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" class="ed-rowbtn" data-lockdown="${i}" ${i === t.hairLocks.length - 1 ? "disabled" : ""}>↓</button><button type="button" class="ed-lockdel" data-lockdel="${i}">✕</button></span></div>
        ${field("Strand lines", sel(`__lockf:${i}:lines`, ["yes", "no"], inst.lines === false ? "no" : "yes"))}
        ${field("Outline", sel(`__lockf:${i}:outlineOn`, ["yes", "no"], inst.outline === "none" ? "no" : "yes"))}
        ${field("Colour", editorColorWidget(`__lock:${i}:fill`, fill))}
        ${field("Outline Colour", editorColorWidget(`__lock:${i}:outline`, outline))}
      </div>`;
    }
    const cat = (window.facesHair && window.facesHair.lockCatalog) || [];
    const opts = cat.map((c) => `<option value="${c.key}" ${c.key === inst.lock ? "selected" : ""}>${c.label}</option>`).join("");
    const shade = window.facesHair && window.facesHair.lockShade;
    const baseFill = editorToHex(inst.fill || "#5a3d28");
    const colorOf = (colKey, k) => editorToHex(inst[colKey] || (shade ? shade(baseFill, k) : baseFill));
    return `<div class="ed-lockrow">
      <div class="ed-lockhead"><b>Lock ${i + 1}</b><span class="ed-rowtools"><button type="button" class="ed-rowbtn" data-lockup="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" class="ed-rowbtn" data-lockdown="${i}" ${i === t.hairLocks.length - 1 ? "disabled" : ""}>↓</button><button type="button" class="ed-lockdel" data-lockdel="${i}">✕</button></span></div>
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
  const titleCaseText = (window.WhoEditorShared && window.WhoEditorShared.titleCase) || ((value) => String(value));
  const tattooRows = tattooList(t).map((tattoo, i) => {
    const place = tattoo.place || "body";
    const font = tattoo.font || "bold";
    return `<div class="ed-lockrow ed-tatrow">
      <div class="ed-lockhead"><b>Tattoo ${i + 1}</b><span class="ed-rowtools"><button type="button" class="ed-rowbtn" data-tatup="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" class="ed-rowbtn" data-tatdown="${i}" ${i === tattooList(t).length - 1 ? "disabled" : ""}>↓</button><button type="button" class="ed-tatdel" data-tatdel="${i}">✕</button></span></div>
      ${field("Text", `<input type="text" data-key="__tat:${i}:text" value="${escapeHtml(tattoo.text || "")}" maxlength="18" spellcheck="false">`)}
      ${field("Place", sel(`__tat:${i}:place`, T.tattooPlaces || ["body", "face"], place))}
      ${field("Layer", sel(`__tat:${i}:layer`, ["overClothes", "onSkin"], tattoo.layer || "overClothes"))}
      ${field("Font", sel(`__tat:${i}:font`, T.tattooFonts || ["bold"], font))}
      ${field("Colour", editorColorWidget(`__tat:${i}:color`, editorToHex(tattoo.color || "#23232b")))}
      ${slide(`__tat:${i}:x`, "X", -80, 80, 1, tattoo.x ?? 0)}
      ${slide(`__tat:${i}:y`, "Y", -60, 50, 1, tattoo.y ?? 0)}
      ${slide(`__tat:${i}:scale`, "Size", 0.25, 3.5, 0.05, tattoo.scale ?? 1)}
      ${slide(`__tat:${i}:rot`, "Rotate", -90, 90, 1, tattoo.rot ?? 0)}
      ${slide(`__tat:${i}:skewX`, "Skew", -45, 45, 1, tattoo.skewX ?? 0)}
      ${slide(`__tat:${i}:warp`, "Warp", 0, 1, 0.02, tattoo.warp ?? 0)}
      ${slide(`__tat:${i}:opacity`, "Fade", 0, 1, 0.05, tattoo.opacity ?? 1)}
    </div>`;
  }).join("");
  const beardRows = beardBlobList(t).map((blob, i) => `
    <div class="ed-lockrow ed-beardrow">
      <div class="ed-lockhead"><b>Beard Blob ${i + 1}</b><button type="button" class="ed-bearddel" data-bearddel="${i}">✕</button></div>
      ${slide(`__beard:${i}:r`, "Size", 6, 48, 1, blob.r ?? 16)}
      ${slide(`__beard:${i}:dx`, "Spread", 0, 90, 1, Math.abs(blob.dx ?? 30))}
      ${slide(`__beard:${i}:y`, "Y", 160, 228, 1, blob.y ?? 198)}
    </div>`
  ).join("");
  const jewelleryRows = jewelleryList(t).map((item, i) => `
    <div class="ed-lockrow ed-tatrow">
      <div class="ed-lockhead"><b>Jewellery ${i + 1}</b><span class="ed-rowtools"><button type="button" class="ed-rowbtn" data-jewelup="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" class="ed-rowbtn" data-jeweldown="${i}" ${i === jewelleryList(t).length - 1 ? "disabled" : ""}>↓</button><button type="button" class="ed-tatdel" data-jeweldel="${i}">✕</button></span></div>
      ${field("Type", `<select data-key="__jewel:${i}:type">${(T.jewellery || ["studs"]).map((value) => `<option value="${escapeHtml(value)}" ${value === (item.type || "studs") ? "selected" : ""}>${escapeHtml(titleCaseText(value))}</option>`).join("")}</select>`)}
      ${field("Side", `<select data-key="__jewel:${i}:side"><option value="both" ${(item.side || "both") === "both" ? "selected" : ""}>Both</option><option value="left" ${(item.side || "both") === "left" ? "selected" : ""}>Left</option><option value="right" ${(item.side || "both") === "right" ? "selected" : ""}>Right</option></select>`)}
      ${field("Layer", `<select data-key="__jewel:${i}:layer"><option value="beforeHead" ${(item.layer || "behindHair") === "beforeHead" ? "selected" : ""}>Behind Head</option><option value="behindHair" ${(item.layer || "behindHair") === "behindHair" ? "selected" : ""}>Behind Hair</option><option value="beforeMouth" ${(item.layer || "behindHair") === "beforeMouth" ? "selected" : ""}>Before Mouth</option><option value="afterMouth" ${(item.layer || "behindHair") === "afterMouth" ? "selected" : ""}>Front</option></select>`)}
      ${field("Metal", `<select data-key="__jewel:${i}:metal"><option value="" ${(item.metal || "") === "" ? "selected" : ""}>Auto</option><option value="silver" ${item.metal === "silver" ? "selected" : ""}>Silver</option><option value="gold" ${item.metal === "gold" ? "selected" : ""}>Gold</option><option value="black" ${item.metal === "black" ? "selected" : ""}>Black</option><option value="roseGold" ${item.metal === "roseGold" ? "selected" : ""}>Rose Gold</option></select>`)}
      ${field("Colour", editorColorWidget(`__jewelc:${i}:color`, editorToHex(item.color || "#e2b84f")))}
      ${field("Second", editorColorWidget(`__jewelc:${i}:color2`, editorToHex(item.color2 || "#ff9bb0")))}
      ${slide(`__jewel:${i}:x`, "X", -120, 120, 1, item.x ?? 0)}
      ${slide(`__jewel:${i}:y`, "Y", -120, 120, 1, item.y ?? 0)}
      ${slide(`__jewel:${i}:scale`, "Size", 0.25, 2.4, 0.02, item.scale ?? 1)}
      ${slide(`__jewel:${i}:rot`, "Rotate", -180, 180, 1, item.rot ?? 0)}
      ${slide(`__jewel:${i}:arcStart`, "Arc Start", -180, 180, 1, item.arcStart ?? 0)}
      ${slide(`__jewel:${i}:arcVisible`, "Arc Visible", 0.08, 1, 0.02, item.arcVisible ?? 1)}
    </div>`).join("");
  const shadowRows = castShadowList(t).map((item, i) => `
    <div class="ed-lockrow ed-tatrow">
      <div class="ed-lockhead"><b>Shadow ${i + 1}</b><span class="ed-rowtools"><button type="button" class="ed-rowbtn" data-shadowup="${i}" ${i === 0 ? "disabled" : ""}>↑</button><button type="button" class="ed-rowbtn" data-shadowdown="${i}" ${i === castShadowList(t).length - 1 ? "disabled" : ""}>↓</button><button type="button" class="ed-tatdel" data-shadowdel="${i}">✕</button></span></div>
      ${field("Preset", `<select data-key="__shadow:${i}:preset">${(T.castShadowPresets || ["capBrim"]).filter((value) => value !== "off").map((value) => `<option value="${escapeHtml(value)}" ${value === (item.preset || "capBrim") ? "selected" : ""}>${escapeHtml(titleCaseText(value))}</option>`).join("")}</select>`)}
      ${field("Surface", `<select data-key="__shadow:${i}:surface"><option value="face" ${(item.surface || "face") === "face" ? "selected" : ""}>Face</option><option value="neck" ${(item.surface || "face") === "neck" ? "selected" : ""}>Neck</option><option value="both" ${(item.surface || "face") === "both" ? "selected" : ""}>Face + Neck</option></select>`)}
      ${field("Sides", `<select data-key="__shadow:${i}:sides"><option value="one" ${(item.sides || "one") === "one" ? "selected" : ""}>One Side</option><option value="both" ${(item.sides || "one") === "both" ? "selected" : ""}>Both Sides</option></select>`)}
      ${field("Tint", `<select data-key="__shadow:${i}:tint"><option value="neutral" ${(item.tint || "neutral") === "neutral" ? "selected" : ""}>Neutral</option><option value="warm" ${(item.tint || "neutral") === "warm" ? "selected" : ""}>Warm</option><option value="cool" ${(item.tint || "neutral") === "cool" ? "selected" : ""}>Cool</option><option value="hairLinked" ${(item.tint || "neutral") === "hairLinked" ? "selected" : ""}>Hair-Linked</option></select>`)}
      ${slide(`__shadow:${i}:x`, "X", -120, 120, 1, item.x ?? 0)}
      ${slide(`__shadow:${i}:y`, "Y", -120, 120, 1, item.y ?? 0)}
      ${slide(`__shadow:${i}:spread`, "Spread", 0, 80, 1, item.spread ?? 0)}
      ${slide(`__shadow:${i}:darkness`, "Darkness", -1.5, 3, 0.05, item.darkness ?? 0)}
      ${slide(`__shadow:${i}:scaleX`, "Width", 0.4, 2.6, 0.02, item.scaleX ?? 1)}
      ${slide(`__shadow:${i}:scaleY`, "Height", 0.4, 2.6, 0.02, item.scaleY ?? 1)}
      ${slide(`__shadow:${i}:rot`, "Rotate", -180, 180, 1, item.rot ?? 0)}
      ${slide(`__shadow:${i}:opacity`, "Opacity", 0.05, 1, 0.05, item.opacity ?? 0.35)}
      ${slide(`__shadow:${i}:softness`, "Softness", 0.6, 2.2, 0.05, item.softness ?? 1)}
    </div>`).join("");
  const sharedFields = sharedEditorFieldList(T).filter((item) => {
    if (!item || !item.key) return false;
    if (item.group === "Tattoo" || item.group === "Jewellery" || item.group === "Lighting") return false; // use the richer list editors below
    if (typeof item.when === "function" && !item.when(t)) return false;
    return true;
  });
  const order = sharedGroupOrder().filter((groupName) => groupName !== "Tattoo");
  const sections = [
    group("Identity"),
    field("Name", `<input type="text" data-key="__name" value="${escapeHtml(editorState.name)}" maxlength="16">`),
    field("Pronouns", sel("__pronouns", ["she", "he", "they"], editorState.pronouns)),
    field("Expression", sel("expression", T.expressions, t.expression))
  ];
  order.forEach((groupName) => {
    const items = sharedFields.filter((item) => item.group === groupName);
    if (!items.length) return;
    sections.push(group(sharedGroupTitle(groupName)));
    items.forEach((item) => sections.push(renderSharedField(item)));
    if (groupName === "Hair") {
      sections.push(group("Hair locks"));
      sections.push(lockRows || `<p class="ed-note">No extra locks placed.</p>`);
      sections.push(`<div class="ed-inlinebuttons"><button type="button" class="button ghost ed-lockadd">＋ Add lock</button>${lockRows ? `<button type="button" class="button ghost ed-lockclear">Clear locks</button>` : ""}</div>`);
    }
    if (groupName === "Beard") {
      sections.push(group("Beard blobs"));
      sections.push(beardRows || `<p class="ed-note">No beard blobs placed.</p>`);
      sections.push(`<div class="ed-inlinebuttons"><button type="button" class="button ghost ed-beardadd">＋ Add beard blob</button>${beardRows ? `<button type="button" class="button ghost ed-beardclear">Clear beard blobs</button>` : ""}</div>`);
    }
    if (groupName === "Jewellery") {
      sections.push(group("Jewellery"));
      sections.push(jewelleryRows || `<p class="ed-note">No jewellery items yet.</p>`);
      sections.push(`<div class="ed-inlinebuttons"><button type="button" class="button ghost ed-jeweladd">＋ Add jewellery</button>${jewelleryRows ? `<button type="button" class="button ghost ed-jewelclear">Clear jewellery</button>` : ""}</div>`);
    }
    if (groupName === "Lighting") {
      sections.push(group("Cast shadows"));
      sections.push(shadowRows || `<p class="ed-note">No cast shadows yet.</p>`);
      sections.push(`<div class="ed-inlinebuttons"><button type="button" class="button ghost ed-shadowadd">＋ Add shadow</button>${shadowRows ? `<button type="button" class="button ghost ed-shadowclear">Clear shadows</button>` : ""}</div>`);
    }
  });
  sections.push(group(sharedGroupTitle("Tattoo")));
  sections.push(tattooRows || `<p class="ed-note">No extra tattoos placed.</p>`);
  sections.push(`<div class="ed-inlinebuttons"><button type="button" class="button ghost ed-tatadd">＋ Add tattoo</button>${tattooRows ? `<button type="button" class="button ghost ed-tatclear">Clear tattoos</button>` : ""}</div>`);
  editorDialog.querySelector(".editor-controls").innerHTML = sections.join("");
  wireEditorColorWidgets();
  wireEditorLockButtons();
  wireEditorBeardButtons();
  wireEditorTattooButtons();
  wireEditorJewelleryButtons();
  wireEditorShadowButtons();
  wireEditorHotspots();
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
      const picker = editorDialog.querySelector(`input[type="color"][data-key="${CSS.escape(key)}"]`);
      const hexEl = editorDialog.querySelector(`.ed-hex[data-hexfor="${CSS.escape(key)}"]`);
      const current = editorToHex((hexEl && hexEl.value) || (picker && picker.value) || "#5a3d28");
      const hsl = editorRgbToHsl(...Object.values(editorHexToRgb(current)));
      const pop = document.createElement("div");
      pop.className = "ed-swatchpop";
      pop.innerHTML = `
        <div class="ed-pop-top">
          <span class="ed-pop-chip" style="--chip:${current}"></span>
          <input type="text" class="ed-pop-hex" value="${current}" maxlength="7" spellcheck="false" aria-label="Selected colour hex">
        </div>
        <label class="ed-pop-row"><span>H</span><input type="range" min="0" max="360" step="1" value="${hsl.h}" data-hsl="h"></label>
        <label class="ed-pop-row"><span>S</span><input type="range" min="0" max="100" step="1" value="${hsl.s}" data-hsl="s"></label>
        <label class="ed-pop-row"><span>L</span><input type="range" min="0" max="100" step="1" value="${hsl.l}" data-hsl="l"></label>
        <div class="ed-pop-swatches">${EDITOR_SWATCHES.map((c) => `<button type="button" style="background:${c}" data-c="${c}" aria-label="${c}"></button>`).join("")}</div>
      `;
      btn.parentElement.appendChild(pop);
      const chip = pop.querySelector(".ed-pop-chip");
      const popHex = pop.querySelector(".ed-pop-hex");
      const hInput = pop.querySelector('[data-hsl="h"]');
      const sInput = pop.querySelector('[data-hsl="s"]');
      const lInput = pop.querySelector('[data-hsl="l"]');
      const syncColor = (color) => {
        if (picker) picker.value = color;
        if (hexEl) hexEl.value = color;
        if (popHex) popHex.value = color;
        if (chip) chip.style.setProperty("--chip", color);
        const chipButton = editorDialog.querySelector(`.ed-colorchip[data-swatchfor="${CSS.escape(key)}"]`);
        if (chipButton) chipButton.style.setProperty("--chip", color);
        applyEditorValue(key, color, false);
        renderEditorPreview();
      };
      const syncFromHsl = () => {
        const rgb = editorHslToRgb(Number(hInput.value), Number(sInput.value), Number(lInput.value));
        syncColor(editorRgbToHex(rgb.r, rgb.g, rgb.b));
      };
      [hInput, sInput, lInput].forEach((input) => input.addEventListener("input", syncFromHsl));
      popHex.addEventListener("input", () => {
        const raw = popHex.value.trim();
        if (!/^#[0-9a-fA-F]{6}$/.test(raw)) return;
        const next = raw.toLowerCase();
        const nextHsl = editorRgbToHsl(...Object.values(editorHexToRgb(next)));
        hInput.value = nextHsl.h;
        sInput.value = nextHsl.s;
        lInput.value = nextHsl.l;
        syncColor(next);
      });
      pop.querySelectorAll("[data-c]").forEach((swatch) => swatch.addEventListener("click", () => {
        const next = swatch.dataset.c;
        const nextHsl = editorRgbToHsl(...Object.values(editorHexToRgb(next)));
        hInput.value = nextHsl.h;
        sInput.value = nextHsl.s;
        lInput.value = nextHsl.l;
        syncColor(next);
      }));
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
  root.querySelector(".ed-lockclear")?.addEventListener("click", () => {
    if (!Array.isArray(editorState.traits.hairLocks)) editorState.traits.hairLocks = [];
    editorState.traits.hairLocks.splice(0);
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelectorAll(".ed-lockdel").forEach((b) => b.addEventListener("click", () => {
    editorState.traits.hairLocks.splice(Number(b.dataset.lockdel), 1);
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-lockup]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.lockup);
    const list = editorState.traits.hairLocks || [];
    if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-lockdown]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.lockdown);
    const list = editorState.traits.hairLocks || [];
    if (i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    renderEditorControls(); renderEditorPreview();
  }));
}
function tattooList(t) {
  if (window.WhoEditorShared && window.WhoEditorShared.normalizeTattooList) {
    return window.WhoEditorShared.normalizeTattooList(t);
  }
  if (Array.isArray(t.tattoos) && t.tattoos.length) return t.tattoos;
  if (!t.tattooText) return [];
  return [{
    text: t.tattooText,
    place: t.tattooPlace || "body",
    layer: t.tattooLayer || "overClothes",
    font: t.tattooFont || "bold",
    color: t.tattooColor || "#23232b",
    x: Number(t.tattooX) || 0,
    y: Number(t.tattooY) || 0,
    scale: Number(t.tattooScale) || 1,
    rot: Number(t.tattooRot) || 0,
    skewX: Number(t.tattooSkewX) || 0,
    warp: Number(t.tattooWarp) || 0,
    opacity: t.tattooOpacity == null ? 1 : Number(t.tattooOpacity)
  }];
}
function ensureTattooList() {
  if (!Array.isArray(editorState.traits.tattoos) || !editorState.traits.tattoos.length) {
    editorState.traits.tattoos = tattooList(editorState.traits).map((tattoo) => ({ ...tattoo }));
  }
  return editorState.traits.tattoos;
}
function jewelleryList(t) {
  const shared = window.WhoEditorShared;
  if (shared && shared.normalizeJewelleryList) return shared.normalizeJewelleryList(t);
  return Array.isArray(t.jewelleryItems) ? t.jewelleryItems.map((item) => ({ ...item })) : [];
}
function castShadowList(t) {
  const shared = window.WhoEditorShared;
  if (shared && shared.normalizeCastShadowList) return shared.normalizeCastShadowList(t);
  return Array.isArray(t.castShadowItems) ? t.castShadowItems.map((item) => ({ ...item })) : [];
}
function ensureJewelleryList() {
  if (!Array.isArray(editorState.traits.jewelleryItems)) {
    editorState.traits.jewelleryItems = jewelleryList(editorState.traits).map((item) => ({ ...item }));
  }
  return editorState.traits.jewelleryItems;
}
function ensureCastShadowList() {
  if (!Array.isArray(editorState.traits.castShadowItems)) {
    editorState.traits.castShadowItems = castShadowList(editorState.traits).map((item) => ({ ...item }));
  }
  return editorState.traits.castShadowItems;
}
function beardBlobList(t) {
  return Array.isArray(t.beardBlobs) ? t.beardBlobs : [];
}
function ensureBeardBlobList() {
  if (!Array.isArray(editorState.traits.beardBlobs)) editorState.traits.beardBlobs = [];
  return editorState.traits.beardBlobs;
}
function wireEditorBeardButtons() {
  const root = editorDialog.querySelector(".editor-controls");
  root.querySelector(".ed-beardadd")?.addEventListener("click", () => {
    ensureBeardBlobList().push({ dx: 30, y: 198, r: 16 });
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelector(".ed-beardclear")?.addEventListener("click", () => {
    ensureBeardBlobList().splice(0);
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelectorAll(".ed-bearddel").forEach((b) => b.addEventListener("click", () => {
    ensureBeardBlobList().splice(Number(b.dataset.bearddel), 1);
    renderEditorControls(); renderEditorPreview();
  }));
}
function wireEditorTattooButtons() {
  const root = editorDialog.querySelector(".editor-controls");
  root.querySelector(".ed-tatadd")?.addEventListener("click", () => {
    ensureTattooList().push({ text: "ink", place: "body", layer: "overClothes", font: "bold", color: "#23232b", x: 0, y: 0, scale: 1, rot: 0, skewX: 0, warp: 0, opacity: 1 });
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelector(".ed-tatclear")?.addEventListener("click", () => {
    ensureTattooList().splice(0);
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelectorAll(".ed-tatdel").forEach((b) => b.addEventListener("click", () => {
    ensureTattooList().splice(Number(b.dataset.tatdel), 1);
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-tatup]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.tatup);
    const list = ensureTattooList();
    if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-tatdown]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.tatdown);
    const list = ensureTattooList();
    if (i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    renderEditorControls(); renderEditorPreview();
  }));
}
function wireEditorJewelleryButtons() {
  const root = editorDialog.querySelector(".editor-controls");
  root.querySelector(".ed-jeweladd")?.addEventListener("click", () => {
    ensureJewelleryList().push({ type: "studs", side: "both", color: "#e2b84f", color2: "#ff9bb0", metal: "", x: 0, y: 0, scale: 1, rot: 0, layer: "behindHair", arcStart: 0, arcVisible: 1 });
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelector(".ed-jewelclear")?.addEventListener("click", () => {
    ensureJewelleryList().splice(0);
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelectorAll("[data-jeweldel]").forEach((b) => b.addEventListener("click", () => {
    ensureJewelleryList().splice(Number(b.dataset.jeweldel), 1);
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-jewelup]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.jewelup);
    const list = ensureJewelleryList();
    if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-jeweldown]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.jeweldown);
    const list = ensureJewelleryList();
    if (i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
    renderEditorControls(); renderEditorPreview();
  }));
}
function wireEditorShadowButtons() {
  const root = editorDialog.querySelector(".editor-controls");
  root.querySelector(".ed-shadowadd")?.addEventListener("click", () => {
    ensureCastShadowList().push({ preset: "capBrim", surface: "face", sides: "one", x: 0, y: 0, spread: 0, darkness: 0, tint: "neutral", scaleX: 1, scaleY: 1, rot: 0, opacity: 0.35, softness: 1 });
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelector(".ed-shadowclear")?.addEventListener("click", () => {
    ensureCastShadowList().splice(0);
    renderEditorControls(); renderEditorPreview();
  });
  root.querySelectorAll("[data-shadowdel]").forEach((b) => b.addEventListener("click", () => {
    ensureCastShadowList().splice(Number(b.dataset.shadowdel), 1);
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-shadowup]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.shadowup);
    const list = ensureCastShadowList();
    if (i > 0) [list[i - 1], list[i]] = [list[i], list[i - 1]];
    renderEditorControls(); renderEditorPreview();
  }));
  root.querySelectorAll("[data-shadowdown]").forEach((b) => b.addEventListener("click", () => {
    const i = Number(b.dataset.shadowdown);
    const list = ensureCastShadowList();
    if (i < list.length - 1) [list[i + 1], list[i]] = [list[i], list[i + 1]];
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
    else if (prop === "outlineOn") inst.outline = val === "no" ? "none" : (inst.outline && inst.outline !== "none" ? inst.outline : "#1f2330");
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
  if (key.startsWith("__tat:")) {
    const [, iStr, prop] = key.split(":");
    const inst = ensureTattooList()[Number(iStr)];
    if (!inst) return;
    inst[prop] = isNum ? Number(val) : val;
    return;
  }
  if (key.startsWith("__jewel:")) {
    const [, iStr, prop] = key.split(":");
    const inst = ensureJewelleryList()[Number(iStr)];
    if (!inst) return;
    inst[prop] = isNum ? Number(val) : val;
    return;
  }
  if (key.startsWith("__jewelc:")) {
    const [, iStr, prop] = key.split(":");
    const inst = ensureJewelleryList()[Number(iStr)];
    if (!inst) return;
    inst[prop] = val;
    return;
  }
  if (key.startsWith("__shadow:")) {
    const [, iStr, prop] = key.split(":");
    const inst = ensureCastShadowList()[Number(iStr)];
    if (!inst) return;
    inst[prop] = isNum ? Number(val) : val;
    return;
  }
  if (key.startsWith("__beard:")) {
    const [, iStr, prop] = key.split(":");
    const inst = ensureBeardBlobList()[Number(iStr)];
    if (!inst) return;
    inst[prop] = Number(val);
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
    if (save) save.textContent = "💾 Save & keep";
    if (add) add.style.display = "none";
    if (hint) hint.textContent = `Editing ${editorState.name} — Save syncs to the board AND keeps it in your saved characters.`;
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
    clothing: () => pickA(T.clothing), accessory: () => pickA(T.accessories), animMode: () => pickA(T.animModes || ["still"]),
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
          <div class="ed-preview-stage">
            <img id="edPreview" alt="preview">
            <div class="ed-hotspots" aria-label="Jump to character controls"></div>
          </div>
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
        <button type="button" id="edExport" class="button ghost ed-debug-only" title="Export this character as JSON">⤓ Export</button>
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
    if (el.dataset.pair) {
      d.querySelectorAll(`[data-pair="${CSS.escape(el.dataset.pair)}"]`).forEach((peer) => {
        if (peer === el) return;
        if (peer.type === "range") {
          const min = Number(peer.min);
          const max = Number(peer.max);
          const val = Number(el.value);
          if (Number.isFinite(val) && val >= min && val <= max) peer.value = el.value;
        } else {
          peer.value = el.value;
        }
      });
    }
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
  d.querySelector("#edSave").addEventListener("click", () => {
    // Editing a board character: sync it live AND keep it in the saved collection (so an inspired
    // GAYBY/restyle isn't lost the moment the round ends). A fresh face just persists.
    if (editorState.boardId) { applyBoardEdit(); persist(); }
    else persist();
  });
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
  // Debug-only: export the current character (name + pronouns + seed + full traits) as a JSON file, so
  // an inspired GAYBY / restyle can be saved down and kept. Button only shows in debug mode.
  d.querySelector("#edExport").addEventListener("click", () => {
    const payload = {
      schema: "whoisit-character-v1",
      id: editorState.id, name: editorState.name, pronouns: editorState.pronouns,
      seed: editorState.seed, traits: editorState.traits
    };
    const json = JSON.stringify(payload, null, 2);
    const slug = String(editorState.name || "character").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "character";
    // Copy to the clipboard FIRST (so it can be pasted straight into a chat to bake into the game),
    // then also download a .json backup.
    let copied = false;
    try { if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(json); copied = true; } } catch (e) { /* fall through */ }
    try {
      const blob = new Blob([json], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `${slug}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (e) { /* download blocked - clipboard still has it */ }
    if (typeof flashToast === "function") flashToast(copied ? `⤓ ${editorState.name} JSON copied + downloaded` : `⤓ Exported ${editorState.name}`);
  });
  return d;
}
function openCharacterEditor() {
  if (!window.faceGenerator) return;
  if (!editorDialog) editorDialog = buildEditorDialog();
  editorState = newEditorState();
  renderEditorControls(); renderEditorPreview(); renderEditorSaved(); renderEditorBoard(); syncEditorButtons();
  editorDialog.showModal();
}
