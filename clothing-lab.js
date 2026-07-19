(function () {
  const api = window.faceGenerator;
  const studio = window.WhoClothingStudio;
  if (!api || !studio) return;

  const DRAFT_KEY = "who-is-that-clothing-profile-drafts-v1";
  const REVIEW_KEY = "who-is-that-clothing-profile-reviews-v1";
  const UI_KEY = "who-is-that-clothing-studio-ui-v1";
  const collaredLayerStyles = new Set(["labCoat", "rugby", "varsity", "tracksuit", "collared", "blazer", "jacket"]);
  const clothingLayers = [
    ["rearCollar", "Rear collar"],
    ["neck", "Neck"],
    ["torso", "Torso"],
    ["frontCollar", "Front collar"],
    ["details", "Details"],
    ["overlays", "Overlays"]
  ];

  const controlGroups = [
    ["Garment placement", [
      ["garmentX", "Horizontal", 1], ["garmentY", "Vertical", 1],
      ["garmentScaleX", "Width", 0.02], ["garmentScaleY", "Height", 0.02]
    ]],
    ["Neck response", [
      ["necklineY", "Neckline height", 1], ["neckWidthScale", "Neck clearance", 0.02],
      ["necklineDepthScale", "Opening depth", 0.02]
    ]],
    ["Collar / lapels", [
      ["collarX", "Horizontal", 1], ["collarY", "Vertical", 1],
      ["collarScaleX", "Width", 0.02], ["collarScaleY", "Height", 0.02]
    ]],
    ["Pattern / details", [
      ["detailX", "Horizontal", 1], ["detailY", "Vertical", 1],
      ["detailScaleX", "Width", 0.02], ["detailScaleY", "Height", 0.02],
      ["detailLeftX", "Left stripe X", 1], ["detailLeftY", "Left stripe Y", 1],
      ["detailRightX", "Right stripe X", 1], ["detailRightY", "Right stripe Y", 1]
    ]],
    ["Line work", [["lineScale", "Line weight", 0.02]]]
  ];
  const controlMap = new Map(controlGroups.flatMap(([, fields]) => fields.map((field) => [field[0], field])));

  const bodyPresets = [
    { id: "balanced", label: "Balanced", note: "Average neck and shoulders", traits: { build: 82, shoulderSlope: 0.55, bodyWidth: 1, belly: 0, bust: 0.2, neckWidth: 0.78, neckLength: 4, neckTaper: 0.3 } },
    { id: "short-narrow", label: "Short + narrow", note: "Short neck, sloped shoulders", traits: { build: 68, shoulderSlope: 0.86, bodyWidth: 0.84, belly: 0, bust: 0, neckWidth: 0.5, neckLength: -8, neckTaper: 0.15 } },
    { id: "long-narrow", label: "Long + narrow", note: "Long neck, slim body", traits: { build: 72, shoulderSlope: 0.76, bodyWidth: 0.88, belly: 0, bust: 0.25, neckWidth: 0.52, neckLength: 20, neckTaper: 0.45 } },
    { id: "short-wide", label: "Short + wide", note: "Wide neck and compact join", traits: { build: 90, shoulderSlope: 0.34, bodyWidth: 1.06, belly: 0.08, bust: 0.2, neckWidth: 1.08, neckLength: -7, neckTaper: -0.1 } },
    { id: "long-wide", label: "Long + wide", note: "Wide neck with a deep drop", traits: { build: 94, shoulderSlope: 0.3, bodyWidth: 1.08, belly: 0, bust: 0.1, neckWidth: 1.05, neckLength: 18, neckTaper: 0.7 } },
    { id: "soft", label: "Soft body", note: "Belly, bust and rounded shoulders", traits: { build: 86, shoulderSlope: 0.66, bodyWidth: 1.2, belly: 0.72, bust: 0.9, neckWidth: 0.74, neckLength: 5, neckTaper: 0.25 } }
  ];

  const styles = api.traitBook.clothing.map((id) => ({
    id,
    label: studio.labels[id] || humanize(id),
    category: studio.categories[id] || "Other"
  }));
  const characters = api.createCharacters((name, secret, role) => [name, secret, role], []);
  const safeCharacter = characters.find((character) => !["scarf", "choker", "necklace", "chain"].includes(character.traits.accessory)) || characters[0];
  const storedUi = readJson(UI_KEY, {});
  const state = {
    selectedId: styles.some((item) => item.id === storedUi.selectedId) ? storedUi.selectedId : "rugby",
    characterId: characters.some((item) => item.id === storedUi.characterId) ? storedUi.characterId : safeCharacter?.id,
    category: "All",
    search: "",
    previewMode: storedUi.previewMode || "adjusted",
    layerView: storedUi.layerView || "composite",
    layerVisibility: { ...Object.fromEntries(clothingLayers.map(([key]) => [key, true])), ...(storedUi.layerVisibility || {}) },
    drafts: readJson(DRAFT_KEY, {}),
    reviews: readJson(REVIEW_KEY, {}),
    palettes: readJson(`${DRAFT_KEY}-palettes`, {})
  };

  const els = Object.fromEntries([
    "characterSelect", "categoryFilter", "searchInput", "copyExportButton", "resetAllButton",
    "selectedCategory", "selectedName", "previousOutfit", "nextOutfit", "heroPreview",
    "primaryColor", "accentColor", "underColor", "controlSections", "resetOutfitButton",
    "copyOutfitButton", "comparisonGrid", "catalogTitle", "catalogStats", "outfitGrid",
    "layerDiagnostics", "layerVisibility", "fitLegend",
    "exportOutput", "copyBottomExportButton"
  ].map((id) => [id, document.querySelector(`#${id}`)]));

  function readJson(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; }
    catch (error) { return fallback; }
  }

  function writeJson(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function humanize(value) {
    return String(value).replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (letter) => letter.toUpperCase());
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  function selectedStyle() { return styles.find((item) => item.id === state.selectedId) || styles[0]; }
  function selectedCharacter() { return characters.find((item) => item.id === state.characterId) || safeCharacter; }

  function baseProfile(id) {
    return { ...studio.defaults, ...(studio.profiles[id] || {}) };
  }

  function effectiveProfile(id) {
    return { ...baseProfile(id), ...(state.drafts[id] || {}) };
  }

  function changedProfile(id) {
    const base = baseProfile(id);
    const effective = effectiveProfile(id);
    return Object.fromEntries(Object.keys(studio.defaults)
      .filter((key) => Math.abs(Number(effective[key]) - Number(base[key])) > 0.00001)
      .map((key) => [key, effective[key]]));
  }

  function hasChanges(id) { return Object.keys(changedProfile(id)).length > 0; }

  function paletteFor(id) {
    const defaults = studio.palette[id] || ["#2f7a78", "#e7b64f", "#545454"];
    return { primary: defaults[0], accent: defaults[1], under: defaults[2], ...(state.palettes[id] || {}) };
  }

  function persist() {
    Object.keys(state.drafts).forEach((id) => {
      if (!Object.keys(changedProfile(id)).length) delete state.drafts[id];
    });
    writeJson(DRAFT_KEY, state.drafts);
    writeJson(REVIEW_KEY, state.reviews);
    writeJson(`${DRAFT_KEY}-palettes`, state.palettes);
    writeJson(UI_KEY, {
      selectedId: state.selectedId,
      characterId: state.characterId,
      previewMode: state.previewMode,
      layerView: state.layerView,
      layerVisibility: state.layerVisibility
    });
  }

  function traitsFor(styleId, preset, adjusted) {
    const character = selectedCharacter();
    const palette = paletteFor(styleId);
    const traits = {
      ...(character?.traits || {}),
      ...preset.traits,
      clothing: styleId,
      shirt: palette.primary,
      outerwearColor: palette.primary,
      clothingAccent: palette.accent,
      underShirt: palette.under,
      baseShirt: palette.under,
      accessory: "none",
      jewelleryItems: [],
      tattoos: [],
      clothingTuningBaseline: !adjusted
    };
    if (collaredLayerStyles.has(styleId)) {
      traits.clothingLayerView = state.layerView;
      traits.clothingLayerVisibility = state.layerVisibility;
    }
    if (adjusted) traits.clothingTuning = effectiveProfile(styleId);
    return traits;
  }

  function portrait(styleId, preset, adjusted) {
    const character = selectedCharacter();
    return api.renderPortrait(character?.seed || 0, traitsFor(styleId, preset, adjusted));
  }

  function renderHero() {
    const preset = bodyPresets[0];
    const before = portrait(state.selectedId, preset, false);
    const after = portrait(state.selectedId, preset, true);
    els.heroPreview.classList.toggle("is-split", state.previewMode === "split");
    if (state.previewMode === "split") {
      els.heroPreview.innerHTML = `<img src="${before}" alt="Baseline ${escapeHtml(selectedStyle().label)}"><img class="adjusted" src="${after}" alt="Adjusted ${escapeHtml(selectedStyle().label)}"><span class="split-rule"></span><span class="split-label before">Before</span><span class="split-label after">After</span>`;
    } else {
      const url = state.previewMode === "baseline" ? before : after;
      els.heroPreview.innerHTML = `<img src="${url}" alt="${escapeHtml(selectedStyle().label)} ${state.previewMode} preview">`;
    }
  }

  function renderComparison() {
    const adjusted = state.previewMode !== "baseline";
    els.comparisonGrid.innerHTML = bodyPresets.map((preset) => `
      <article class="fit-card">
        <div class="fit-images">
          <img src="${portrait(state.selectedId, preset, adjusted)}" alt="${escapeHtml(preset.label)} ${adjusted ? "adjusted" : "baseline"}">
        </div>
        <div class="fit-meta"><strong>${escapeHtml(preset.label)}</strong><span>${escapeHtml(preset.note)}</span></div>
      </article>
    `).join("");
    const viewLabel = state.layerView === "layerMap" ? "Layer Map" : state.layerView === "occlusion" ? "Occlusion" : "Composite";
    els.fitLegend.innerHTML = `<span><i class="${adjusted ? "adjusted-dot" : "baseline-dot"}"></i>${adjusted ? "Adjusted" : "Baseline"}</span><span>${viewLabel}</span>`;
  }

  function renderLayerDiagnostics() {
    const supported = collaredLayerStyles.has(state.selectedId);
    els.layerDiagnostics.hidden = !supported;
    document.querySelectorAll("[data-layer-view]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.layerView === state.layerView);
    });
    els.layerVisibility.innerHTML = clothingLayers.map(([key, label]) => `
      <label class="layer-toggle">
        <input type="checkbox" data-layer-visible="${key}" ${state.layerVisibility[key] === false ? "" : "checked"}>
        <span>${escapeHtml(label)}</span>
      </label>
    `).join("");
  }

  function controlMarkup() {
    const baseGroups = state.selectedId === "bare"
      ? controlGroups.filter(([, fields]) => fields.some(([key]) => key.startsWith("garment") || key === "lineScale"))
      : controlGroups;
    const groups = baseGroups.map(([group, fields]) => [
      group,
      fields.filter(([key]) => !key.startsWith("detailLeft") && !key.startsWith("detailRight")
        || state.selectedId === "tracksuit")
    ]);
    return groups.map(([group, fields], groupIndex) => `
      <details class="control-group" ${groupIndex < 2 ? "open" : ""}>
        <summary>${escapeHtml(group)}</summary>
        <div class="control-list">
          ${fields.map(([key, label, step]) => {
            const value = effectiveProfile(state.selectedId)[key];
            const changed = Object.hasOwn(changedProfile(state.selectedId), key);
            return `<div class="control-row ${changed ? "is-changed" : ""}" data-field-row="${key}">
              <span class="control-label"><span>${escapeHtml(label)}</span><i></i></span>
              <span class="control-stepper">
                <button type="button" data-step-field="${key}" data-step-direction="-1" aria-label="Decrease ${escapeHtml(label)}">−</button>
                <input type="number" inputmode="decimal" data-profile-field="${key}" value="${Number(value).toFixed(step < 1 ? 2 : 0)}" step="${step}" aria-label="${escapeHtml(label)}">
                <button type="button" data-step-field="${key}" data-step-direction="1" aria-label="Increase ${escapeHtml(label)}">+</button>
              </span>
              <button class="reset-field" type="button" data-reset-field="${key}" aria-label="Reset ${escapeHtml(label)}" title="Reset ${escapeHtml(label)}">↺</button>
            </div>`;
          }).join("")}
        </div>
      </details>
    `).join("");
  }

  function renderInspector(refreshControls = true) {
    const style = selectedStyle();
    const palette = paletteFor(style.id);
    els.selectedCategory.textContent = style.category;
    els.selectedName.textContent = style.label;
    els.primaryColor.value = palette.primary;
    els.accentColor.value = palette.accent;
    els.underColor.value = palette.under;
    if (refreshControls) els.controlSections.innerHTML = controlMarkup();
    document.querySelectorAll("[data-preview-mode]").forEach((button) => button.classList.toggle("is-active", button.dataset.previewMode === state.previewMode));
    renderLayerDiagnostics();
    renderHero();
  }

  function filteredStyles() {
    const query = state.search.trim().toLowerCase();
    return styles.filter((item) => (state.category === "All" || item.category === state.category)
      && (!query || `${item.label} ${item.category}`.toLowerCase().includes(query)));
  }

  function renderCatalog() {
    const visible = filteredStyles();
    const previewPreset = bodyPresets[0];
    els.outfitGrid.innerHTML = visible.map((item) => `
      <article class="catalog-card ${item.id === state.selectedId ? "is-selected" : ""} ${hasChanges(item.id) ? "is-changed" : ""}" data-style-card="${item.id}" data-review="${state.reviews[item.id] || ""}">
        <button class="catalog-select" type="button" data-select-style="${item.id}">
          <img src="${portrait(item.id, previewPreset, true)}" alt="${escapeHtml(item.label)}">
          <span>${escapeHtml(item.label)}</span>
        </button>
        <footer>
          <small>${escapeHtml(item.category)}${hasChanges(item.id) ? " / changed" : ""}</small>
          <span class="review-control" aria-label="Review ${escapeHtml(item.label)}">
            <button type="button" data-review-value="approved" data-review-style="${item.id}" aria-label="Approve" title="Approved">✓</button>
            <button type="button" data-review-value="needs-work" data-review-style="${item.id}" aria-label="Needs work" title="Needs work">!</button>
          </span>
        </footer>
      </article>
    `).join("");
    els.catalogTitle.textContent = `${visible.length} outfit${visible.length === 1 ? "" : "s"}`;
    const changed = styles.filter((item) => hasChanges(item.id)).length;
    const approved = Object.values(state.reviews).filter((value) => value === "approved").length;
    const needsWork = Object.values(state.reviews).filter((value) => value === "needs-work").length;
    els.catalogStats.innerHTML = `<span><strong>${changed}</strong> changed</span><span><strong>${approved}</strong> approved</span><span><strong>${needsWork}</strong> needs work</span>`;
  }

  function exportPayload(ids = null) {
    const candidates = ids || styles.map((item) => item.id);
    const profiles = {};
    candidates.forEach((id) => {
      const changed = changedProfile(id);
      if (Object.keys(changed).length) profiles[id] = changed;
    });
    return { version: studio.version, profiles };
  }

  function renderExport() {
    els.exportOutput.value = JSON.stringify(exportPayload(), null, 2);
  }

  function renderAll() {
    renderInspector();
    renderComparison();
    renderCatalog();
    renderExport();
  }

  function updatePreviewSurfaces() {
    renderInspector(false);
    renderComparison();
    renderExport();
    const card = els.outfitGrid.querySelector(`[data-style-card="${CSS.escape(state.selectedId)}"]`);
    if (card) {
      card.classList.toggle("is-changed", hasChanges(state.selectedId));
      const image = card.querySelector("img");
      if (image) image.src = portrait(state.selectedId, bodyPresets[0], true);
      const label = card.querySelector("small");
      if (label) label.textContent = `${selectedStyle().category}${hasChanges(state.selectedId) ? " / changed" : ""}`;
    }
  }

  function setField(key, value) {
    if (!controlMap.has(key) || !Number.isFinite(value)) return;
    const base = baseProfile(state.selectedId)[key];
    state.drafts[state.selectedId] ||= {};
    if (Math.abs(value - base) < 0.00001) delete state.drafts[state.selectedId][key];
    else state.drafts[state.selectedId][key] = value;
    if (!Object.keys(state.drafts[state.selectedId]).length) delete state.drafts[state.selectedId];
    persist();
    const row = els.controlSections.querySelector(`[data-field-row="${CSS.escape(key)}"]`);
    row?.classList.toggle("is-changed", Math.abs(value - base) >= 0.00001);
    updatePreviewSurfaces();
  }

  function selectStyle(id) {
    if (!styles.some((item) => item.id === id)) return;
    state.selectedId = id;
    persist();
    renderAll();
    document.querySelector(`[data-style-card="${CSS.escape(id)}"]`)?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  async function copyText(text, button) {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      els.exportOutput.value = text;
      els.exportOutput.select();
      document.execCommand("copy");
    }
    const original = button.textContent;
    button.textContent = "Copied";
    setTimeout(() => { button.textContent = original; }, 1100);
  }

  function setup() {
    els.characterSelect.innerHTML = characters.map((character) => `<option value="${character.id}">${escapeHtml(character.name)}</option>`).join("");
    els.characterSelect.value = state.characterId;
    const categories = ["All", ...new Set(styles.map((item) => item.category))];
    els.categoryFilter.innerHTML = categories.map((category) => `<option value="${escapeHtml(category)}">${escapeHtml(category)}</option>`).join("");

    els.characterSelect.addEventListener("change", () => { state.characterId = els.characterSelect.value; persist(); renderAll(); });
    els.categoryFilter.addEventListener("change", () => { state.category = els.categoryFilter.value; renderCatalog(); });
    els.searchInput.addEventListener("input", () => { state.search = els.searchInput.value; renderCatalog(); });
    document.querySelector(".preview-mode").addEventListener("click", (event) => {
      const button = event.target.closest("[data-preview-mode]");
      if (!button) return;
      state.previewMode = button.dataset.previewMode;
      persist();
      renderInspector(false);
      renderComparison();
    });
    els.layerDiagnostics.addEventListener("click", (event) => {
      const button = event.target.closest("[data-layer-view]");
      if (!button) return;
      state.layerView = button.dataset.layerView;
      persist();
      renderAll();
    });
    els.layerVisibility.addEventListener("change", (event) => {
      const input = event.target.closest("[data-layer-visible]");
      if (!input) return;
      state.layerVisibility[input.dataset.layerVisible] = input.checked;
      persist();
      renderHero();
      renderComparison();
    });
    els.previousOutfit.addEventListener("click", () => {
      const index = styles.findIndex((item) => item.id === state.selectedId);
      selectStyle(styles[(index - 1 + styles.length) % styles.length].id);
    });
    els.nextOutfit.addEventListener("click", () => {
      const index = styles.findIndex((item) => item.id === state.selectedId);
      selectStyle(styles[(index + 1) % styles.length].id);
    });
    els.outfitGrid.addEventListener("click", (event) => {
      const review = event.target.closest("[data-review-style]");
      if (review) {
        const id = review.dataset.reviewStyle;
        state.reviews[id] = state.reviews[id] === review.dataset.reviewValue ? "" : review.dataset.reviewValue;
        if (!state.reviews[id]) delete state.reviews[id];
        persist(); renderCatalog(); return;
      }
      const select = event.target.closest("[data-select-style]");
      if (select) selectStyle(select.dataset.selectStyle);
    });
    els.controlSections.addEventListener("input", (event) => {
      const input = event.target.closest("[data-profile-field]");
      if (input) setField(input.dataset.profileField, Number(input.value));
    });
    els.controlSections.addEventListener("click", (event) => {
      const stepButton = event.target.closest("[data-step-field]");
      if (stepButton) {
        const [key, , step] = controlMap.get(stepButton.dataset.stepField);
        const input = els.controlSections.querySelector(`[data-profile-field="${CSS.escape(key)}"]`);
        const value = Number(input.value) + Number(stepButton.dataset.stepDirection) * step;
        input.value = value.toFixed(step < 1 ? 2 : 0);
        setField(key, value);
        return;
      }
      const reset = event.target.closest("[data-reset-field]");
      if (reset) {
        const key = reset.dataset.resetField;
        const value = baseProfile(state.selectedId)[key];
        const input = els.controlSections.querySelector(`[data-profile-field="${CSS.escape(key)}"]`);
        input.value = Number(value).toFixed(controlMap.get(key)[2] < 1 ? 2 : 0);
        setField(key, value);
      }
    });
    [[els.primaryColor, "primary"], [els.accentColor, "accent"], [els.underColor, "under"]].forEach(([input, key]) => {
      input.addEventListener("input", () => {
        state.palettes[state.selectedId] = { ...paletteFor(state.selectedId), [key]: input.value };
        persist(); updatePreviewSurfaces();
      });
    });
    els.resetOutfitButton.addEventListener("click", () => { delete state.drafts[state.selectedId]; persist(); renderAll(); });
    els.resetAllButton.addEventListener("click", () => {
      if (!window.confirm("Reset every local clothing profile draft? Review labels and preview colours will stay.")) return;
      state.drafts = {}; persist(); renderAll();
    });
    els.copyOutfitButton.addEventListener("click", () => copyText(JSON.stringify(exportPayload([state.selectedId]), null, 2), els.copyOutfitButton));
    els.copyExportButton.addEventListener("click", () => copyText(els.exportOutput.value, els.copyExportButton));
    els.copyBottomExportButton.addEventListener("click", () => copyText(els.exportOutput.value, els.copyBottomExportButton));
  }

  setup();
  renderAll();
  window.clothingStudio = { state, styles, bodyPresets, effectiveProfile, exportPayload, portrait };
})();
