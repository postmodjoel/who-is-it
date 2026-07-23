(function () {
  const rangeConfig = window.faceGenerator.simRange || {};
  const storageKey = rangeConfig.selectionStorageKey || "who-sim-shortlist-v3";
  const prefix = rangeConfig.prefix || "gen-sim3-";
  const all = window.faceGenerator.createCharacters(() => [], [], { includeCandidateRange: true });
  const characters = all.filter((character) => character.id.startsWith(prefix));
  const characterIds = new Set(characters.map((character) => character.id));
  const grid = document.querySelector("#simRangeGrid");
  const summary = document.querySelector("#rangeSummary");
  const shortlistCount = document.querySelector("#shortlistCount");
  const finishButton = document.querySelector("#finishButton");
  const clearVotes = document.querySelector("#clearVotes");
  const expressionButtons = [...document.querySelectorAll("[data-expression]")];
  const filterButtons = [...document.querySelectorAll("[data-filter]")];
  let expression = "assigned";
  let filter = "all";
  let votes = readVotes();

  function readVotes() {
    try {
      const stored = JSON.parse(window.localStorage.getItem(storageKey) || "[]");
      return new Set(Array.isArray(stored) ? stored.filter((id) => characterIds.has(id)) : []);
    } catch (_) {
      return new Set();
    }
  }

  function saveVotes() {
    const ordered = characters.filter((character) => votes.has(character.id)).map((character) => character.id);
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(ordered));
    } catch (_) {
      // The in-memory shortlist still works if storage is unavailable.
    }
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }

  function title(value) {
    return String(value || "none").replace(/([a-z])([A-Z])/g, "$1 $2").replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function portrait(character) {
    if (expression === "assigned") return character.image;
    return window.faceGenerator.renderPortrait(character.seed, { ...character.traits, expression });
  }

  function visibleCharacters() {
    if (filter === "kept") return characters.filter((character) => votes.has(character.id));
    if (filter === "unkept") return characters.filter((character) => !votes.has(character.id));
    return characters;
  }

  function render() {
    const visible = visibleCharacters();
    grid.classList.toggle("is-empty", visible.length === 0);
    grid.innerHTML = visible.length
      ? visible.map((character, visibleIndex) => {
        const traits = character.traits || {};
        const visibleHair = traits.effectiveHijab ? "hijab" : traits.hair;
        const chips = [visibleHair, traits.clothing, traits.accessory !== "none" ? traits.accessory : null, traits.skin]
          .filter(Boolean).map((value) => `<span>${escapeHtml(title(value))}</span>`).join("");
        const kept = votes.has(character.id);
        const originalIndex = characters.indexOf(character);
        return `<article class="range-card${kept ? " is-kept" : ""}" data-sim-id="${escapeHtml(character.id)}" style="--i:${visibleIndex}">
          <span class="range-number">${String(originalIndex + 1).padStart(2, "0")}</span>
          <button class="range-vote" type="button" data-vote-id="${escapeHtml(character.id)}" aria-pressed="${kept}" aria-label="${kept ? `Remove ${escapeHtml(character.name)} from shortlist` : `Keep ${escapeHtml(character.name)}`}">
            <span aria-hidden="true">${kept ? "✓" : "+"}</span> ${kept ? "KEPT" : "KEEP"}
          </button>
          <div class="range-portrait"><img src="${portrait(character)}" alt="${escapeHtml(character.name)}"></div>
          <div class="range-copy">
            <div class="range-name-row"><h2 class="range-name">${escapeHtml(character.name)}</h2><span class="range-pronouns">${escapeHtml(character.pronouns)}</span></div>
            <p class="range-role">${escapeHtml(character.role)}</p>
            <div class="range-traits">${chips}</div>
          </div>
        </article>`;
      }).join("")
      : `<div class="range-empty"><strong>NO ONE KEPT YET</strong><span>Go back to ALL 30 and vote in the people you want.</span></div>`;

    shortlistCount.textContent = votes.size;
    clearVotes.disabled = votes.size === 0;
    finishButton.textContent = votes.size
      ? `USE ${votes.size} IN GAME →`
      : "BACK TO GAME · NONE KEPT →";
    summary.textContent = `${visible.length} SHOWN · ${votes.size} KEPT · ${expression.toUpperCase()} EXPRESSION`;
    expressionButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.expression === expression));
    filterButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.filter === filter));
  }

  expressionButtons.forEach((button) => button.addEventListener("click", () => {
    expression = button.dataset.expression;
    render();
  }));

  filterButtons.forEach((button) => button.addEventListener("click", () => {
    filter = button.dataset.filter;
    render();
  }));

  grid.addEventListener("click", (event) => {
    const button = event.target.closest("[data-vote-id]");
    if (!button) return;
    const id = button.dataset.voteId;
    if (votes.has(id)) votes.delete(id);
    else votes.add(id);
    saveVotes();
    render();
  });

  clearVotes.addEventListener("click", () => {
    votes.clear();
    saveVotes();
    render();
  });

  render();
  window.SimRangeReview = {
    characters,
    render,
    count: characters.length,
    get selectedIds() {
      return characters.filter((character) => votes.has(character.id)).map((character) => character.id);
    }
  };
})();
