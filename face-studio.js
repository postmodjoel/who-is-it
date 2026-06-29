const makeTags = (name, secret, role) => [name, secret, role];
const characters = window.faceGenerator.createCharacters(makeTags, []);
const traitBook = window.faceGenerator.traitBook;
const expressions = traitBook.expressions;
const accessoryChoices = traitBook.accessories;
const correctionStorageKey = "who-is-that-face-corrections";

const selectOptions = (list) => list.map((value) => [value, titleCase(value)]);

const editorFields = [
  // Face
  { group: "Face", key: "faceShape", label: "Face Shape", type: "select", options: () => selectOptions(traitBook.faceShapes), fallback: "oval" },
  { group: "Face", key: "headScaleX", label: "Head Width", min: 0.85, max: 1.18, step: 0.01, fallback: 1 },
  { group: "Face", key: "headScaleY", label: "Head Height", min: 0.85, max: 1.18, step: 0.01, fallback: 1 },
  { group: "Face", key: "headY", label: "Head Position", min: -10, max: 10, step: 1, fallback: 0 },
  { group: "Face", key: "eyeGap", label: "Eye Gap", min: 40, max: 62, step: 1, fallback: 47 },
  // Skin
  { group: "Skin", key: "skin", label: "Skin Tone", type: "select", options: () => selectOptions(traitBook.skinTones), fallback: "fair" },
  // Hair
  { group: "Hair", key: "hair", label: "Hair Style", type: "select", options: () => selectOptions(traitBook.hairStyles), fallback: "messy" },
  { group: "Hair", key: "hairColor", label: "Hair Color", type: "select", options: () => selectOptions(traitBook.hairColors), fallback: "brown" },
  { group: "Hair", key: "frontHairY", label: "Front Hair Y", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Hair", key: "backHairY", label: "Back Hair Y", min: -14, max: 14, step: 1, fallback: 0 },
  // Brows
  { group: "Brows", key: "browShape", label: "Brow Shape", type: "select", options: () => selectOptions(traitBook.browShapes), fallback: "soft" },
  { group: "Brows", key: "browY", label: "Brow Height", min: -6, max: 6, step: 0.5, fallback: 0 },
  { group: "Brows", key: "browScaleX", label: "Brow Width", min: 0.8, max: 1.25, step: 0.02, fallback: 1 },
  // Eyes
  { group: "Eyes", key: "eyeScale", label: "Eye Size", min: 0.7, max: 1.25, step: 0.02, fallback: 0.94 },
  { group: "Eyes", key: "eyeOpen", label: "Eye Openness", min: 0.5, max: 1.2, step: 0.02, fallback: 0.95 },
  { group: "Eyes", key: "irisScale", label: "Iris Size", min: 0.7, max: 1.2, step: 0.02, fallback: 0.92 },
  { group: "Eyes", key: "eyeY", label: "Eye Height", min: -8, max: 8, step: 0.5, fallback: 0 },
  // Nose
  { group: "Nose", key: "noseY", label: "Nose Height", min: -8, max: 10, step: 0.5, fallback: 0 },
  { group: "Nose", key: "noseScale", label: "Nose Size", min: 0.6, max: 1.5, step: 0.02, fallback: 1 },
  // Cheeks
  { group: "Cheeks", key: "cheekY", label: "Cheek Height", min: -8, max: 8, step: 0.5, fallback: 0 },
  { group: "Cheeks", key: "cheekOpacity", label: "Blush", min: 0, max: 0.3, step: 0.01, fallback: 0.09 },
  // Ears
  { group: "Ears", key: "earVariant", label: "Ear Shape", type: "select", options: () => selectOptions(traitBook.earVariants), fallback: "round" },
  { group: "Ears", key: "earScale", label: "Ear Size", min: 0.7, max: 1.3, step: 0.02, fallback: 1 },
  { group: "Ears", key: "earY", label: "Ear Height", min: -10, max: 10, step: 1, fallback: 0 },
  // Mouth
  { group: "Mouth", key: "lips", label: "Lip Shape", type: "select", options: () => selectOptions(traitBook.lipStyles), fallback: "line" },
  { group: "Mouth", key: "mouthY", label: "Mouth Y", min: -16, max: 18, step: 1, fallback: 0 },
  { group: "Mouth", key: "mouthScale", label: "Mouth Size", min: 0.72, max: 1.28, step: 0.02, fallback: 1 },
  // Teeth
  { group: "Teeth", key: "teethStyle", label: "Teeth Style", type: "select", options: () => selectOptions(traitBook.teethStyles), fallback: "even" },
  { group: "Teeth", key: "teethX", label: "Teeth X", min: -16, max: 16, step: 1, fallback: 0 },
  { group: "Teeth", key: "teethY", label: "Teeth Y", min: -14, max: 14, step: 1, fallback: 0 },
  { group: "Teeth", key: "teethScale", label: "Teeth Size", min: 0.62, max: 1.38, step: 0.02, fallback: 1 },
  // Jaw
  { group: "Jaw", key: "jawLength", label: "Jaw Length", min: -0.25, max: 0.4, step: 0.01, fallback: 0 },
  { group: "Jaw", key: "jawShadowY", label: "Jaw Shadow", min: -6, max: 6, step: 0.5, fallback: 0 },
  // Chin (per-character, opt-in)
  { group: "Chin", key: "chinShape", label: "Chin Shape", type: "select", options: () => selectOptions(traitBook.chinShapes), fallback: "none" },
  { group: "Chin", key: "chinY", label: "Chin Height", min: -16, max: 18, step: 1, fallback: 0 },
  { group: "Chin", key: "chinWidth", label: "Chin Width", min: 0.6, max: 1.7, step: 0.02, fallback: 1 },
  { group: "Chin", key: "chinScale", label: "Chin Size", min: 0.5, max: 2, step: 0.02, fallback: 1 },
  // Clothing
  { group: "Clothing", key: "clothing", label: "Outfit", type: "select", options: () => selectOptions(traitBook.clothing), fallback: "tee" },
  { group: "Clothing", key: "build", label: "Build (shoulder width)", min: 60, max: 100, step: 1, fallback: 82 },
  { group: "Clothing", key: "shoulderSlope", label: "Shoulder Slope", min: 0, max: 1, step: 0.02, fallback: 0.5 },
  // Accessory
  { group: "Accessory", key: "accessory", label: "Accessory", type: "select", options: () => selectOptions(accessoryChoices), fallback: "none" },
  { group: "Accessory", key: "accessoryX", label: "Accessory X", min: -24, max: 24, step: 1, fallback: 0 },
  { group: "Accessory", key: "accessoryY", label: "Accessory Y", min: -24, max: 24, step: 1, fallback: 0 },
  { group: "Accessory", key: "accessoryScale", label: "Accessory Size", min: 0.68, max: 1.36, step: 0.02, fallback: 1 },
  // Beard
  { group: "Beard", key: "beardLength", label: "Beard Length", min: 0, max: 1, step: 0.02, fallback: 0.35 },
  { group: "Beard", key: "beardX", label: "Beard X", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Beard", key: "beardY", label: "Beard Y", min: -18, max: 22, step: 1, fallback: 0 },
  { group: "Beard", key: "beardScale", label: "Beard Scale", min: 0.72, max: 1.42, step: 0.02, fallback: 1 },
  // Moustache
  { group: "Moustache", key: "moustacheX", label: "Moustache X", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Moustache", key: "moustacheY", label: "Moustache Y", min: -18, max: 18, step: 1, fallback: 0 },
  { group: "Moustache", key: "moustacheScale", label: "Moustache Size", min: 0.62, max: 1.5, step: 0.02, fallback: 1 }
];

const hotspots = [
  { label: "Face Shape", group: "Face", left: 2, top: 2, width: 18, height: 10 },
  { label: "Hair", group: "Hair", left: 22, top: 2, width: 56, height: 24 },
  { label: "Ear", group: "Ears", left: 4, top: 46, width: 14, height: 18 },
  { label: "Ear", group: "Ears", left: 82, top: 46, width: 14, height: 18 },
  { label: "Brows", group: "Brows", left: 26, top: 36, width: 48, height: 10 },
  { label: "Eyes", group: "Eyes", left: 26, top: 44, width: 48, height: 12 },
  { label: "Nose", group: "Nose", left: 40, top: 52, width: 20, height: 16 },
  { label: "Cheeks", group: "Cheeks", left: 18, top: 54, width: 18, height: 14 },
  { label: "Cheeks", group: "Cheeks", left: 64, top: 54, width: 18, height: 14 },
  { label: "Mouth", group: "Mouth", left: 36, top: 64, width: 28, height: 10 },
  { label: "Jaw / Beard", group: "Beard", left: 28, top: 72, width: 44, height: 18 },
  { label: "Outfit", group: "Clothing", left: 20, top: 88, width: 60, height: 12 }
];

const state = {
  expression: "assigned",
  hair: "all",
  accessory: "all",
  search: "",
  matrix: false,
  selectedId: characters[0]?.id || "",
  selectedExpression: "assigned",
  activeGroup: "Face",
  corrections: readCorrections()
};

const editorGroups = [...new Set(editorFields.map((field) => field.group))];

const els = {
  expressionFilter: document.querySelector("#expressionFilter"),
  hairFilter: document.querySelector("#hairFilter"),
  accessoryFilter: document.querySelector("#accessoryFilter"),
  searchInput: document.querySelector("#searchInput"),
  matrixToggle: document.querySelector("#matrixToggle"),
  resetButton: document.querySelector("#resetButton"),
  faceGrid: document.querySelector("#faceGrid"),
  resultCount: document.querySelector("#resultCount"),
  expressionSummary: document.querySelector("#expressionSummary"),
  selectedPortrait: document.querySelector("#selectedPortrait"),
  selectedMeta: document.querySelector("#selectedMeta"),
  variantStrip: document.querySelector("#variantStrip"),
  portraitHotspots: document.querySelector("#portraitHotspots"),
  lockOverlay: document.querySelector("#lockOverlay"),
  hotspotHint: document.querySelector("#hotspotHint"),
  editorControls: document.querySelector("#editorControls"),
  correctionExport: document.querySelector("#correctionExport"),
  resetCorrectionButton: document.querySelector("#resetCorrectionButton")
};

init();

function init() {
  fillSelect(els.expressionFilter, [
    ["assigned", "Assigned"],
    ...expressions.map((expression) => [expression, titleCase(expression)])
  ]);
  fillSelect(els.hairFilter, [["all", "All"], ...optionsFrom("hair")]);
  fillSelect(els.accessoryFilter, [["all", "All"], ...optionsFrom("accessory")]);

  els.expressionFilter.addEventListener("change", () => {
    state.expression = els.expressionFilter.value;
    state.selectedExpression = state.expression;
    render();
  });
  els.hairFilter.addEventListener("change", () => {
    state.hair = els.hairFilter.value;
    render();
  });
  els.accessoryFilter.addEventListener("change", () => {
    state.accessory = els.accessoryFilter.value;
    render();
  });
  els.searchInput.addEventListener("input", () => {
    state.search = els.searchInput.value.trim().toLowerCase();
    render();
  });
  els.matrixToggle.addEventListener("change", () => {
    state.matrix = els.matrixToggle.checked;
    render();
  });
  els.resetButton.addEventListener("click", reset);
  els.resetCorrectionButton.addEventListener("click", clearSelectedCorrection);

  renderHotspots();
  wireLockStageOnce();
  render();
}

function reset() {
  state.expression = "assigned";
  state.hair = "all";
  state.accessory = "all";
  state.search = "";
  state.matrix = false;
  state.selectedId = characters[0]?.id || "";
  state.selectedExpression = "assigned";
  els.expressionFilter.value = state.expression;
  els.hairFilter.value = state.hair;
  els.accessoryFilter.value = state.accessory;
  els.searchInput.value = "";
  els.matrixToggle.checked = false;
  render();
}

function render() {
  const visible = filteredCharacters();
  if (!visible.some((character) => character.id === state.selectedId) && visible[0]) {
    state.selectedId = visible[0].id;
    state.selectedExpression = state.expression;
  }
  renderSummary(visible);
  renderGrid(visible);
  renderSelected();
}

function renderSummary(visible) {
  els.resultCount.textContent = `${visible.length} ${visible.length === 1 ? "face" : "faces"}`;
  const counts = expressions.map((expression) => [
    expression,
    visible.filter((character) => character.traits.expression === expression).length
  ]);
  els.expressionSummary.innerHTML = counts
    .map(([expression, count]) => `<span class="summary-pill">${escapeHtml(expression)} ${count}</span>`)
    .join("");
}

function renderGrid(visible) {
  els.faceGrid.innerHTML = "";
  visible.forEach((character) => {
    const sourceIndex = characters.indexOf(character);
    const displayTraits = traitsFor(character, selectedExpressionFor(character));
    const button = document.createElement("button");
    button.type = "button";
    button.className = `face-card ${state.matrix ? "matrix-card" : ""}`;
    button.classList.toggle("is-selected", character.id === state.selectedId);
    button.addEventListener("click", () => {
      state.selectedId = character.id;
      state.selectedExpression = state.expression;
      renderSelected();
      document.querySelectorAll(".face-card").forEach((card) => card.classList.remove("is-selected"));
      button.classList.add("is-selected");
    });

    if (state.matrix) {
      button.innerHTML = `
        ${expressions.map((expression) => `<img src="${portraitFor(character, sourceIndex, expression)}" alt="${escapeHtml(character.name)} ${escapeHtml(expression)}">`).join("")}
        <h3>${escapeHtml(character.name)}</h3>
        <p>${escapeHtml(character.feature)}</p>
      `;
    } else {
      const expression = state.expression === "assigned" ? character.traits.expression : state.expression;
      button.innerHTML = `
        <img src="${portraitFor(character, sourceIndex, expression)}" alt="${escapeHtml(character.name)}">
        <h3>${escapeHtml(character.name)}</h3>
        <p>${escapeHtml(describeCard(displayTraits, expression))}</p>
      `;
    }
    els.faceGrid.appendChild(button);
  });
}

function renderSelected() {
  const character = characters.find((item) => item.id === state.selectedId) || characters[0];
  if (!character) return;
  const index = characters.indexOf(character);
  const expression = selectedExpressionFor(character);
  const correction = correctionFor(character.id);
  const displayTraits = traitsFor(character, expression);
  const editCount = Object.keys(correction).length;
  els.selectedPortrait.innerHTML = `<img src="${portraitFor(character, index, expression)}" alt="${escapeHtml(character.name)}">`;
  renderLockOverlay(character);
  els.selectedMeta.innerHTML = `
    <div>
      <p class="meta-label">Selected</p>
      <h2>${escapeHtml(character.name)}</h2>
    </div>
    <div class="trait-list">
      ${traitPill("expression", expression)}
      ${traitPill("mouth", displayTraits.mouthStyle)}
      ${traitPill("hair", displayTraits.hair)}
      ${traitPill("hair color", displayTraits.hairColor)}
      ${traitPill("face", displayTraits.faceShape)}
      ${traitPill("skin", displayTraits.skin)}
      ${traitPill("clothing", displayTraits.clothing)}
      ${traitPill("accessory", displayTraits.accessory)}
      ${editCount ? traitPill("edits", editCount) : ""}
    </div>
  `;
  els.variantStrip.innerHTML = expressions
    .map((item) => {
      const active = item === expression ? "is-active" : "";
      return `
        <button class="variant-button ${active}" type="button" data-expression="${escapeHtml(item)}" title="${escapeHtml(item)}">
      <img src="${portraitFor(character, index, item)}" alt="${escapeHtml(character.name)} ${escapeHtml(item)}">
        </button>
      `;
    })
    .join("");
  els.variantStrip.querySelectorAll(".variant-button").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedExpression = button.dataset.expression;
      renderSelected();
    });
  });
  renderEditor(character);
}

function filteredCharacters() {
  return characters.filter((character) => {
    const displayTraits = { ...character.traits, ...correctionFor(character.id) };
    const matchesHair = state.hair === "all" || displayTraits.hair === state.hair;
    const matchesAccessory = state.accessory === "all" || displayTraits.accessory === state.accessory;
    const haystack = `${character.name} ${character.feature} ${character.role} ${Object.values(displayTraits).join(" ")}`.toLowerCase();
    const matchesSearch = !state.search || haystack.includes(state.search);
    return matchesHair && matchesAccessory && matchesSearch;
  });
}

function selectedExpressionFor(character) {
  if (state.selectedExpression !== "assigned") return state.selectedExpression;
  if (state.expression !== "assigned") return state.expression;
  return character.traits.expression;
}

function portraitFor(character, index, expression) {
  const traits = traitsFor(character, expression);
  return window.faceGenerator.renderPortrait(index, traits);
}

function traitsFor(character, expression) {
  return { ...character.traits, ...correctionFor(character.id), expression };
}

function describeCard(traits, expression) {
  return [expression, traits.mouthStyle, traits.hair, traits.accessory].filter(Boolean).map(titleCase).join(" / ");
}

function optionsFrom(key) {
  return [...new Set(characters.map((character) => character.traits[key]))]
    .sort((a, b) => a.localeCompare(b))
    .map((value) => [value, titleCase(value)]);
}

function fillSelect(select, options) {
  select.innerHTML = options
    .map(([value, label]) => `<option value="${escapeHtml(value)}">${escapeHtml(label)}</option>`)
    .join("");
}

function traitPill(label, value) {
  return `<span class="trait-pill">${escapeHtml(label)}: ${escapeHtml(titleCase(value))}</span>`;
}

function titleCase(value) {
  return String(value)
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

function renderEditor(character) {
  const correction = correctionFor(character.id);
  if (!editorGroups.includes(state.activeGroup)) state.activeGroup = editorGroups[0];

  const editedGroups = new Set(
    Object.keys(correction)
      .map((key) => editorFields.find((field) => field.key === key)?.group)
      .filter(Boolean)
  );
  const nav = `
    <div class="editor-tabs">
      ${editorGroups
        .map((group) => `
          <button type="button" class="editor-tab ${group === state.activeGroup ? "is-active" : ""} ${editedGroups.has(group) ? "is-edited" : ""}" data-group="${escapeHtml(group)}">
            ${escapeHtml(group)}
          </button>
        `)
        .join("")}
    </div>
  `;

  const rows = editorFields
    .filter((field) => field.group === state.activeGroup)
    .map((field) => {
    const base = baseValueFor(character, field);
    const value = correction[field.key] ?? base;
    const control = field.type === "select"
      ? `
        <select id="edit-${escapeHtml(field.key)}" data-key="${escapeHtml(field.key)}" data-kind="select">
          ${field.options().map(([optValue, optLabel]) => `<option value="${escapeHtml(optValue)}" ${optValue === value ? "selected" : ""}>${escapeHtml(optLabel)}</option>`).join("")}
        </select>
        <span class="editor-value"></span>
      `
      : `
        <input
          id="edit-${escapeHtml(field.key)}"
          type="range"
          min="${field.min}"
          max="${field.max}"
          step="${field.step}"
          value="${escapeHtml(value)}"
          data-key="${escapeHtml(field.key)}"
          data-kind="range"
        >
        <span class="editor-value">${escapeHtml(formatNumber(value))}</span>
      `;
    return `
      <div class="editor-control" data-group="${escapeHtml(field.group)}" data-field="${escapeHtml(field.key)}">
        <label for="edit-${escapeHtml(field.key)}">${escapeHtml(field.label)}</label>
        ${control}
      </div>
    `;
  });
  const designer = state.activeGroup === "Hair" ? lockDesignerMarkup(character)
    : state.activeGroup === "Beard" ? beardDesignerMarkup(character) : "";
  els.editorControls.innerHTML = nav + `<div class="editor-active-group">${rows.join("")}${designer}</div>`;
  if (state.activeGroup === "Hair") wireLockDesigner(character);
  if (state.activeGroup === "Beard") wireBeardDesigner(character);
  els.editorControls.querySelectorAll(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeGroup = tab.dataset.group;
      renderEditor(character);
      renderLockOverlay(character);
    });
  });
  els.editorControls.querySelectorAll("[data-kind='range']").forEach((input) => {
    input.addEventListener("input", () => {
      updateCorrection(character, input.dataset.key, Number(input.value));
    });
  });
  els.editorControls.querySelectorAll("[data-kind='select']").forEach((select) => {
    select.addEventListener("change", () => {
      updateEnumCorrection(character, select.dataset.key, select.value);
    });
  });
  renderCorrectionExport();
}

function updateCorrection(character, key, value) {
  const field = editorFields.find((item) => item.key === key);
  if (!field) return;
  const base = baseValueFor(character, field);
  const normalized = normalizeNumber(value);
  const next = { ...correctionFor(character.id) };
  if (numbersEqual(normalized, base)) {
    delete next[key];
  } else {
    next[key] = normalized;
  }
  setCorrection(character.id, next);
  render();
}

function updateEnumCorrection(character, key, value) {
  const field = editorFields.find((item) => item.key === key);
  const fallback = character.traits[key] ?? field?.fallback;
  const next = { ...correctionFor(character.id) };
  if (value === fallback) {
    delete next[key];
  } else {
    next[key] = value;
  }
  setCorrection(character.id, next);
  render();
}

function clearSelectedCorrection() {
  if (!state.selectedId) return;
  delete state.corrections[state.selectedId];
  saveCorrections();
  render();
}

function baseValueFor(character, field) {
  const raw = character.traits[field.key] ?? field.fallback;
  return field.type === "select" ? raw : normalizeNumber(raw);
}

function renderHotspots() {
  if (!els.portraitHotspots) return;
  els.portraitHotspots.innerHTML = hotspots
    .map((spot, i) => `
      <button type="button" class="portrait-hotspot" data-group="${escapeHtml(spot.group)}"
        style="left:${spot.left}%; top:${spot.top}%; width:${spot.width}%; height:${spot.height}%;"
        title="${escapeHtml(spot.label)}">
        <span>${escapeHtml(spot.label)}</span>
      </button>
    `)
    .join("");
  els.portraitHotspots.querySelectorAll(".portrait-hotspot").forEach((button) => {
    button.addEventListener("click", () => jumpToGroup(button.dataset.group));
  });
}

function jumpToGroup(group) {
  if (!editorGroups.includes(group)) return;
  state.activeGroup = group;
  const character = characters.find((item) => item.id === state.selectedId) || characters[0];
  if (character) { renderEditor(character); renderLockOverlay(character); }
  els.editorControls.scrollIntoView({ behavior: "smooth", block: "nearest" });
  els.editorControls.querySelectorAll(".editor-control").forEach((control) => flash(control));
}

function flash(el) {
  el.classList.add("is-highlight");
  setTimeout(() => el.classList.remove("is-highlight"), 1200);
}

function cssEscape(value) {
  return String(value).replace(/["\\]/g, "\\$&");
}

function correctionFor(id) {
  return state.corrections[id] || {};
}

function setCorrection(id, correction) {
  const clean = Object.fromEntries(Object.entries(correction).filter(([, value]) => value !== "" && value !== null && value !== undefined));
  if (Object.keys(clean).length) {
    state.corrections[id] = clean;
  } else {
    delete state.corrections[id];
  }
  saveCorrections();
}

function readCorrections() {
  try {
    const parsed = JSON.parse(localStorage.getItem(correctionStorageKey) || "{}");
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function saveCorrections() {
  localStorage.setItem(correctionStorageKey, JSON.stringify(state.corrections));
}

function renderCorrectionExport() {
  const selected = state.selectedId ? { [state.selectedId]: correctionFor(state.selectedId) } : {};
  const payload = {
    selected,
    all: state.corrections
  };
  els.correctionExport.value = JSON.stringify(payload, null, 2);
}

function normalizeNumber(value) {
  return Number(Number(value).toFixed(3));
}

function numbersEqual(a, b) {
  return Math.abs(Number(a) - Number(b)) < 0.001;
}

function formatNumber(value) {
  return Number.isInteger(Number(value)) ? String(value) : Number(value).toFixed(2);
}

/* ===================== Hair Lock Designer ===================== *
 * Locks are stored per character as corrections[id].hairLocks - an ordered array (array order =
 * z-order, last = front). Each entry: { lock, x, y, scale, rot, lines, fill?, dark?, shine?, line? }
 * with x/y as 0-100 (% of the 256 portrait box) for the lock's centre. The generator reads this
 * trait and composites the locks on top of the hair, so edits persist + show in the export JSON. */
const LOCK_CATALOG = (window.facesHair && window.facesHair.lockCatalog) || [];

function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
function currentCharacter() { return characters.find((c) => c.id === state.selectedId) || characters[0]; }
function lockLabel(key) { return (LOCK_CATALOG.find((c) => c.key === key) || {}).label || titleCase(key); }

function shadeHex(hex, factor) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  if (Number.isNaN(n)) return "#6b4a2f";
  const ch = (shift) => Math.max(0, Math.min(255, Math.round(((n >> shift) & 255) * factor)));
  const hp = (v) => v.toString(16).padStart(2, "0");
  return `#${hp(ch(16))}${hp(ch(8))}${hp(ch(0))}`;
}

function hairHexFor(character) {
  const name = correctionFor(character.id).hairColor || character.traits.hairColor;
  return (traitBook.hairColorHex && traitBook.hairColorHex[name]) || "#6b4a2f";
}

// Read-only effective locks: a hairLocks correction wins, otherwise fall back to the character's
// baked-in base locks (so a baked character like Aaron shows its locks in the designer).
function getLocks(id) {
  const corr = correctionFor(id).hairLocks;
  if (Array.isArray(corr)) return corr;
  const ch = characters.find((c) => c.id === id);
  const base = ch && ch.traits && ch.traits.hairLocks;
  return Array.isArray(base) ? base : [];
}

// For in-place mutation: ensure there's a hairLocks correction (deep-copied from the base on first
// touch) so editing a baked character never mutates the shared base array.
function editableLocks(id) {
  if (!Array.isArray(correctionFor(id).hairLocks)) {
    setLocks(id, getLocks(id).map((o) => ({ ...o })));
  }
  return correctionFor(id).hairLocks;
}

function setLocks(id, arr) {
  const next = { ...correctionFor(id) };
  if (arr && arr.length) next.hairLocks = arr;
  else delete next.hairLocks;
  setCorrection(id, next);
}

function lockThumb(key) {
  if (!window.facesHair || !window.facesHair.renderLock) return "";
  const g = window.facesHair.renderLock({ lock: key, x: 50, y: 50, scale: 1.02, rot: 0, lines: true }, { hair: "#6b4a2f", ink: "#1f2330" });
  return `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">${g}</svg>`;
}

function lockDesignerMarkup(character) {
  const locks = getLocks(character.id);
  const hairHex = hairHexFor(character);
  const palette = LOCK_CATALOG
    .map(({ key, label }) => `
      <button type="button" class="lock-chip" draggable="true" data-lock="${escapeHtml(key)}" title="Add ${escapeHtml(label)}">
        <span class="lock-chip-art">${lockThumb(key)}</span>
        <span class="lock-chip-label">${escapeHtml(label)}</span>
      </button>`)
    .join("");
  const stack = locks.length
    ? locks.map((inst, i) => lockRowMarkup(inst, i, locks.length, hairHex)).join("")
    : `<p class="lock-empty">No locks yet — click a style above, or drag one onto the hair.</p>`;
  return `
    <div class="lock-designer">
      <div class="lock-designer-head">
        <p class="meta-label">Lock Designer</p>
        ${locks.length ? `<button type="button" class="mini-button" data-lock-clear>Clear locks</button>` : ""}
      </div>
      <div class="lock-palette">${palette}</div>
      <div class="lock-stack">${stack}</div>
    </div>`;
}

const LOCK_INK = "#1f2330";
function lockRowMarkup(inst, i, n, hairHex) {
  // defHex = the auto colour shown when this part isn't overridden. 'outline' is special: its auto is
  // the global ink, and it has an on/off state (outline === 'none').
  const colorField = (part, defHex, label) => {
    const off = part === "outline" && inst.outline === "none";
    const set = inst[part] != null && inst[part] !== "none";
    const value = set ? inst[part] : defHex;
    return `
      <label class="lock-color ${set ? "is-set" : ""} ${off ? "is-off" : ""}">
        <input type="color" value="${escapeHtml(value)}" data-lock-color="${part}">
        <span>${label}</span>
        ${set ? `<button type="button" class="lock-color-reset" data-lock-reset="${part}" title="Auto colour">×</button>` : ""}
      </label>`;
  };
  const swap = `<select class="lock-swap" data-lock-swap>${LOCK_CATALOG.map((c) => `<option value="${escapeHtml(c.key)}" ${c.key === inst.lock ? "selected" : ""}>${escapeHtml(c.label)}</option>`).join("")}</select>`;
  return `
    <div class="lock-row" data-index="${i}" data-lock-droprow>
      <div class="lock-row-head">
        <span class="lock-grip" draggable="true" title="Drag to reorder">⠿</span>
        <span class="lock-row-num">${i + 1}</span>
        ${swap}
        <button type="button" class="mini-button lock-del" data-lock-act="remove" title="Delete">✕</button>
      </div>
      <div class="lock-row-controls">
        <label class="lock-num">Size <input type="range" min="0.3" max="2" step="0.02" value="${inst.scale ?? 1}" data-lock-num="scale"><span class="editor-value">${formatNumber(inst.scale ?? 1)}</span></label>
        <label class="lock-num">Rotate <input type="range" min="-180" max="180" step="1" value="${inst.rot ?? 0}" data-lock-num="rot"><span class="editor-value">${formatNumber(inst.rot ?? 0)}</span></label>
      </div>
      <div class="lock-row-toggles">
        <label class="lock-toggle"><input type="checkbox" data-lock-lines ${inst.lines === false ? "" : "checked"}> Lines</label>
        <label class="lock-toggle"><input type="checkbox" data-lock-mirror ${inst.mirror ? "checked" : ""}> Mirror</label>
        <label class="lock-toggle"><input type="checkbox" data-lock-outline ${inst.outline === "none" ? "" : "checked"}> Outline</label>
      </div>
      <div class="lock-row-colors">
        ${colorField("fill", shadeHex(hairHex, 1), "Hair")}
        ${colorField("dark", shadeHex(hairHex, 0.5), "Shadow")}
        ${colorField("shine", shadeHex(hairHex, 1.3), "Shine")}
        ${colorField("line", shadeHex(hairHex, 0.62), "Lines")}
        ${colorField("outline", LOCK_INK, "Outline")}
      </div>
    </div>`;
}

function wireLockDesigner(character) {
  const root = els.editorControls.querySelector(".lock-designer");
  if (!root) return;
  root.querySelectorAll(".lock-chip").forEach((chip) => {
    chip.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/lock", chip.dataset.lock));
    chip.addEventListener("click", () => addLock(character, chip.dataset.lock));
  });
  const clear = root.querySelector("[data-lock-clear]");
  if (clear) clear.addEventListener("click", () => { setLocks(character.id, []); render(); });
  root.querySelectorAll(".lock-row").forEach((row) => {
    const idx = Number(row.dataset.index);
    row.querySelectorAll("[data-lock-act]").forEach((btn) => {
      btn.addEventListener("click", () => lockAction(character, idx, btn.dataset.lockAct));
    });
    row.querySelectorAll("[data-lock-num]").forEach((inp) => {
      inp.addEventListener("input", () => updateLockField(character, idx, inp.dataset.lockNum, Number(inp.value), inp));
    });
    const lines = row.querySelector("[data-lock-lines]");
    if (lines) lines.addEventListener("change", () => { setLockProp(character, idx, "lines", lines.checked); render(); });
    const mirror = row.querySelector("[data-lock-mirror]");
    if (mirror) mirror.addEventListener("change", () => { setLockProp(character, idx, "mirror", mirror.checked || undefined); render(); });
    const outline = row.querySelector("[data-lock-outline]");
    if (outline) outline.addEventListener("change", () => { setLockProp(character, idx, "outline", outline.checked ? undefined : "none"); render(); });
    const swap = row.querySelector("[data-lock-swap]");
    if (swap) swap.addEventListener("change", () => { setLockProp(character, idx, "lock", swap.value); render(); });
    row.querySelectorAll("[data-lock-color]").forEach((inp) => {
      inp.addEventListener("input", () => setLockColor(character, idx, inp.dataset.lockColor, inp.value, false));
    });
    row.querySelectorAll("[data-lock-reset]").forEach((btn) => {
      btn.addEventListener("click", () => setLockColor(character, idx, btn.dataset.lockReset, null, true));
    });
    // Drag-to-reorder: the grip starts a drag, any row is a drop target.
    const grip = row.querySelector(".lock-grip");
    if (grip) {
      grip.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/lockidx", String(idx)); e.dataTransfer.effectAllowed = "move"; row.classList.add("is-dragging"); });
      grip.addEventListener("dragend", () => row.classList.remove("is-dragging"));
    }
    row.addEventListener("dragover", (e) => {
      if (![...e.dataTransfer.types].includes("text/lockidx")) return;
      e.preventDefault();
      row.classList.add("is-drop");
    });
    row.addEventListener("dragleave", () => row.classList.remove("is-drop"));
    row.addEventListener("drop", (e) => {
      const from = e.dataTransfer.getData("text/lockidx");
      if (from === "") return;
      e.preventDefault();
      row.classList.remove("is-drop");
      reorderLock(character, Number(from), idx);
    });
  });
}

function reorderLock(character, from, to) {
  if (from === to || Number.isNaN(from)) return;
  const locks = getLocks(character.id).slice();
  if (!locks[from]) return;
  const [item] = locks.splice(from, 1);
  locks.splice(to, 0, item);
  setLocks(character.id, locks);
  render();
}

function addLock(character, key, x, y) {
  const locks = getLocks(character.id).slice();
  locks.push({ lock: key, x: x == null ? 50 : Math.round(x), y: y == null ? 30 : Math.round(y), scale: 1, rot: 0, lines: true });
  setLocks(character.id, locks);
  render();
}

function lockAction(character, idx, act) {
  const locks = getLocks(character.id).slice();
  if (!locks[idx]) return;
  if (act === "remove") locks.splice(idx, 1);
  else if (act === "up" && idx < locks.length - 1) [locks[idx], locks[idx + 1]] = [locks[idx + 1], locks[idx]];
  else if (act === "down" && idx > 0) [locks[idx], locks[idx - 1]] = [locks[idx - 1], locks[idx]];
  else return;
  setLocks(character.id, locks);
  render();
}

function setLockProp(character, idx, prop, value) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  if (value === undefined) delete locks[idx][prop];
  else locks[idx][prop] = value;
  saveCorrections();
}

function updateLockField(character, idx, field, value, inp) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  locks[idx][field] = value;
  const span = inp.parentElement.querySelector(".editor-value");
  if (span) span.textContent = formatNumber(value);
  saveCorrections();
  refreshPortrait(character);
}

function setLockColor(character, idx, part, value, isReset) {
  const locks = editableLocks(character.id);
  if (!locks[idx]) return;
  if (value == null) delete locks[idx][part];
  else locks[idx][part] = value;
  saveCorrections();
  if (isReset) render();
  else refreshPortrait(character);
}

// Lightweight: re-render only the selected portrait + lock markers + export (no grid/editor rebuild),
// so dragging a marker or a colour slider stays smooth.
function refreshPortrait(character) {
  const index = characters.indexOf(character);
  const expression = selectedExpressionFor(character);
  const src = portraitFor(character, index, expression);
  const img = els.selectedPortrait.querySelector("img");
  if (img) img.src = src;
  else els.selectedPortrait.innerHTML = `<img src="${src}" alt="${escapeHtml(character.name)}">`;
  positionLockMarkers(character);
  renderCorrectionExport();
}

function renderLockOverlay(character) {
  if (!els.lockOverlay) return;
  const hairMode = state.activeGroup === "Hair";
  const beardMode = state.activeGroup === "Beard";
  const overlayMode = hairMode || beardMode;
  els.lockOverlay.hidden = !overlayMode;
  if (els.portraitHotspots) els.portraitHotspots.style.display = overlayMode ? "none" : "";
  if (els.hotspotHint) {
    els.hotspotHint.textContent = hairMode
      ? "Drag a lock from the palette onto the hair · drag a marker to reposition"
      : beardMode
        ? "Drag the beard blobs on the face · they mirror automatically"
        : "Click a region on the face to jump to its controls";
  }
  if (!overlayMode) { els.lockOverlay.innerHTML = ""; return; }
  if (beardMode) {
    const blobs = getBeardBlobs(character.id);
    els.lockOverlay.innerHTML = blobs
      .map((b, i) => `<button type="button" class="lock-marker beard-marker" data-bindex="${i}" style="left:${((128 + Math.abs(Number(b.dx) || 0)) / 256 * 100).toFixed(1)}%; top:${((Number(b.y) || 196) / 256 * 100).toFixed(1)}%;" title="Beard blob — drag to move (mirrors)">${i + 1}</button>`)
      .join("");
    els.lockOverlay.querySelectorAll(".beard-marker").forEach((marker) => wireBeardMarker(marker, character));
    return;
  }
  const locks = getLocks(character.id);
  els.lockOverlay.innerHTML = locks
    .map((inst, i) => `<button type="button" class="lock-marker" data-index="${i}" style="left:${inst.x}%; top:${inst.y == null ? 32 : inst.y}%;" title="${escapeHtml(lockLabel(inst.lock))} — drag to move">${i + 1}</button>`)
    .join("");
  els.lockOverlay.querySelectorAll(".lock-marker").forEach((marker) => wireLockMarker(marker, character));
}

function positionLockMarkers(character) {
  const locks = getLocks(character.id);
  els.lockOverlay.querySelectorAll(".lock-marker").forEach((marker) => {
    const inst = locks[Number(marker.dataset.index)];
    if (!inst) return;
    marker.style.left = `${inst.x}%`;
    marker.style.top = `${inst.y == null ? 32 : inst.y}%`;
  });
}

function wireLockMarker(marker, character) {
  marker.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const idx = Number(marker.dataset.index);
    const inst = editableLocks(character.id)[idx];
    if (!inst) return;
    const rect = els.lockOverlay.getBoundingClientRect();
    marker.setPointerCapture(e.pointerId);
    marker.classList.add("is-dragging");
    const move = (ev) => {
      inst.x = Math.round(clamp(((ev.clientX - rect.left) / rect.width) * 100, 0, 100));
      inst.y = Math.round(clamp(((ev.clientY - rect.top) / rect.height) * 100, 0, 100));
      marker.style.left = `${inst.x}%`;
      marker.style.top = `${inst.y}%`;
      refreshPortrait(character);
    };
    const up = () => {
      marker.releasePointerCapture(e.pointerId);
      marker.classList.remove("is-dragging");
      marker.removeEventListener("pointermove", move);
      marker.removeEventListener("pointerup", up);
      saveCorrections();
      render();
    };
    marker.addEventListener("pointermove", move);
    marker.addEventListener("pointerup", up);
  });
}

// Drop target wiring is attached once (the overlay element persists across renders).
function wireLockStageOnce() {
  if (!els.lockOverlay) return;
  els.lockOverlay.addEventListener("dragover", (e) => { e.preventDefault(); els.lockOverlay.classList.add("is-drop"); });
  els.lockOverlay.addEventListener("dragleave", () => els.lockOverlay.classList.remove("is-drop"));
  els.lockOverlay.addEventListener("drop", (e) => {
    e.preventDefault();
    els.lockOverlay.classList.remove("is-drop");
    const key = e.dataTransfer.getData("text/lock");
    if (!key) return;
    const rect = els.lockOverlay.getBoundingClientRect();
    const x = clamp(((e.clientX - rect.left) / rect.width) * 100, 0, 100);
    const y = clamp(((e.clientY - rect.top) / rect.height) * 100, 0, 100);
    addLock(currentCharacter(), key, x, y);
  });
}

/* ===================== Beard Blob Designer ===================== *
 * Per-character mirrored "blob" beard. Stored as corrections[id].beardBlobs = [{ dx, y, r }] in head
 * pixels (dx = distance from the x=128 centreline, auto-mirrored). The generator draws the union
 * outline (renderBeardBlobs). Markers show on the right side; dragging sets dx/y, the twin mirrors. */
function getBeardBlobs(id) {
  const corr = correctionFor(id).beardBlobs;
  if (Array.isArray(corr)) return corr;
  const ch = characters.find((c) => c.id === id);
  const base = ch && ch.traits && ch.traits.beardBlobs;
  return Array.isArray(base) ? base : [];
}
function editableBeardBlobs(id) {
  if (!Array.isArray(correctionFor(id).beardBlobs)) {
    setBeardBlobs(id, getBeardBlobs(id).map((b) => ({ ...b })));
  }
  return correctionFor(id).beardBlobs;
}
function setBeardBlobs(id, arr) {
  const next = { ...correctionFor(id) };
  if (arr && arr.length) next.beardBlobs = arr;
  else delete next.beardBlobs;
  setCorrection(id, next);
}

function beardDesignerMarkup(character) {
  const blobs = getBeardBlobs(character.id);
  const rows = blobs.length
    ? blobs.map((b, i) => `
        <div class="lock-row" data-bindex="${i}">
          <div class="lock-row-head">
            <span class="lock-row-num">${i + 1}</span>
            <label class="lock-num">Size <input type="range" min="6" max="48" step="1" value="${b.r ?? 16}" data-beard-r><span class="editor-value">${formatNumber(b.r ?? 16)}</span></label>
            <label class="lock-num">Spread <input type="range" min="0" max="90" step="1" value="${Math.abs(b.dx ?? 30)}" data-beard-dx><span class="editor-value">${formatNumber(Math.abs(b.dx ?? 30))}</span></label>
            <button type="button" class="mini-button lock-del" data-beard-del title="Delete">✕</button>
          </div>
        </div>`).join("")
    : `<p class="lock-empty">No beard blobs — click "+ Blob", then drag them on the face (they mirror automatically).</p>`;
  return `
    <div class="lock-designer">
      <div class="lock-designer-head">
        <p class="meta-label">Beard Blobs</p>
        <div style="display:flex; gap:6px;">
          <button type="button" class="mini-button" data-beard-add>+ Blob</button>
          ${blobs.length ? `<button type="button" class="mini-button" data-beard-clear>Clear</button>` : ""}
        </div>
      </div>
      <div class="lock-stack">${rows}</div>
    </div>`;
}

function wireBeardDesigner(character) {
  const root = els.editorControls.querySelector(".lock-designer");
  if (!root) return;
  const add = root.querySelector("[data-beard-add]");
  if (add) add.addEventListener("click", () => addBeardBlob(character));
  const clear = root.querySelector("[data-beard-clear]");
  if (clear) clear.addEventListener("click", () => { setBeardBlobs(character.id, []); render(); });
  root.querySelectorAll(".lock-row").forEach((row) => {
    const idx = Number(row.dataset.bindex);
    const r = row.querySelector("[data-beard-r]");
    if (r) r.addEventListener("input", () => updateBeardField(character, idx, "r", Number(r.value), r));
    const dx = row.querySelector("[data-beard-dx]");
    if (dx) dx.addEventListener("input", () => updateBeardField(character, idx, "dx", Number(dx.value), dx));
    const del = row.querySelector("[data-beard-del]");
    if (del) del.addEventListener("click", () => removeBeardBlob(character, idx));
  });
}

function addBeardBlob(character) {
  const blobs = getBeardBlobs(character.id).slice();
  blobs.push({ dx: 30, y: 198, r: 16 });
  setBeardBlobs(character.id, blobs);
  render();
}
function removeBeardBlob(character, idx) {
  const blobs = getBeardBlobs(character.id).slice();
  if (!blobs[idx]) return;
  blobs.splice(idx, 1);
  setBeardBlobs(character.id, blobs);
  render();
}
function updateBeardField(character, idx, field, value, inp) {
  const blobs = editableBeardBlobs(character.id);
  if (!blobs[idx]) return;
  blobs[idx][field] = value;
  const span = inp.parentElement.querySelector(".editor-value");
  if (span) span.textContent = formatNumber(value);
  saveCorrections();
  refreshPortrait(character);
}

function wireBeardMarker(marker, character) {
  marker.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    const idx = Number(marker.dataset.bindex);
    const blob = editableBeardBlobs(character.id)[idx];
    if (!blob) return;
    const rect = els.lockOverlay.getBoundingClientRect();
    marker.setPointerCapture(e.pointerId);
    marker.classList.add("is-dragging");
    const move = (ev) => {
      const hx = ((ev.clientX - rect.left) / rect.width) * 256;
      const hy = ((ev.clientY - rect.top) / rect.height) * 256;
      blob.dx = Math.round(clamp(Math.abs(hx - 128), 0, 100));
      blob.y = Math.round(clamp(hy, 110, 250));
      marker.style.left = `${((128 + blob.dx) / 256 * 100).toFixed(1)}%`;
      marker.style.top = `${(blob.y / 256 * 100).toFixed(1)}%`;
      refreshPortrait(character);
    };
    const up = () => {
      marker.releasePointerCapture(e.pointerId);
      marker.classList.remove("is-dragging");
      marker.removeEventListener("pointermove", move);
      marker.removeEventListener("pointerup", up);
      saveCorrections();
      render();
    };
    marker.addEventListener("pointermove", move);
    marker.addEventListener("pointerup", up);
  });
}
