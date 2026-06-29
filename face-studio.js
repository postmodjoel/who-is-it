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
  { group: "Jaw", key: "jawShadowY", label: "Jaw Shadow", min: -6, max: 6, step: 0.5, fallback: 0 },
  // Clothing
  { group: "Clothing", key: "clothing", label: "Outfit", type: "select", options: () => selectOptions(traitBook.clothing), fallback: "tee" },
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
  els.editorControls.innerHTML = nav + `<div class="editor-active-group">${rows.join("")}</div>`;
  els.editorControls.querySelectorAll(".editor-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      state.activeGroup = tab.dataset.group;
      renderEditor(character);
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
  if (character) renderEditor(character);
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
