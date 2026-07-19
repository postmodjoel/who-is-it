// Genetics Lab v2 — designer bench for the WHO? WERE YOU? engine.
// Three views: the synthetic founder pool, a fully authored lineage with the 210-configuration
// fairness sweep, and the legacy 15-node tree kept as an engine stress test.
(function installGeneticsLab() {
  const Rules = window.GeneticsRules;
  const Make = window.MakeRules;
  let seed = `lab-${Date.now().toString(36)}`;
  let view = "draft";
  let draftPlayers = 2;
  let draftSource = "cast";
  const imageCache = new Map();

  // Authored-lineage state: a real game round plus a full (unstripped) fairness report.
  let round = null;
  let fairness = null;
  let inspectedId = null;

  // Legacy state.
  const cast = window.faceGenerator.createCharacters(() => [], []);
  let legacyTree = null;
  let legacyInspectedId = "d0";

  const els = {
    seed: document.querySelector("#seedLabel"),
    tabs: document.querySelectorAll(".lab-tab"),
    views: document.querySelectorAll(".lab-view"),
    draftMeta: document.querySelector("#draftMeta"),
    stressMeta: document.querySelector("#stressMeta"),
    stressGrid: document.querySelector("#stressGrid"),
    rateMeta: document.querySelector("#rateMeta"),
    rateReport: document.querySelector("#rateReport"),
    rateStage: document.querySelector("#rateStage"),
    rateUndo: document.querySelector("#rateUndo"),
    rateSkip: document.querySelector("#rateSkip"),
    rateExport: document.querySelector("#rateExport"),
    rateClear: document.querySelector("#rateClear"),
    draftPlayers: document.querySelector("#draftPlayers"),
    draftSource: document.querySelector("#draftSource"),
    draftBoard: document.querySelector("#draftBoard"),
    draftRecipes: document.querySelector("#draftRecipes"),
    simSummary: document.querySelector("#simSummary"),
    runSims: document.querySelector("#runSims"),
    simReport: document.querySelector("#simReport"),
    pool: document.querySelector("#poolGrid"),
    board: document.querySelector("#authorBoard"),
    couples: document.querySelector("#authorCouples"),
    nodePicker: document.querySelector("#nodePicker"),
    inspector: document.querySelector("#traitInspector"),
    inspectName: document.querySelector("#inspectName"),
    fairnessSummary: document.querySelector("#fairnessSummary"),
    fairnessTable: document.querySelector("#fairnessTable"),
    legacyTree: document.querySelector("#legacyTree"),
    legacyInspector: document.querySelector("#legacyInspector"),
    legacyInspectName: document.querySelector("#legacyInspectName"),
    reroll: document.querySelector("#rerollSeed"),
    export: document.querySelector("#exportRound"),
    import: document.querySelector("#importRound")
  };

  function hash(value) {
    let out = 2166136261;
    for (const char of String(value)) { out ^= char.charCodeAt(0); out = Math.imul(out, 16777619); }
    return out >>> 0;
  }

  function portrait(node) {
    const key = `${node.id}:${hash(JSON.stringify(node.phenotype || {}))}`;
    if (!imageCache.has(key)) imageCache.set(key, window.faceGenerator.renderPortrait(hash(key), node.traits || {}));
    return imageCache.get(key);
  }

  function escapeText(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  function founderLetter(id) {
    return round?.founders.find((node) => node.id === id)?.label || "?";
  }

  // ===================== authored round =====================

  function rebuildRound(reroll = 0, keepPairs = null) {
    round = Rules.buildRound({ sessionSeed: seed, roundIndex: 0, builderIndex: 0, reroll });
    if (keepPairs) round.builderPairs = keepPairs;
    recompute();
  }

  function recompute() {
    imageCache.clear();
    fairness = null;
    round.parents = [null, null];
    round.descendant = null;
    round.builderPairs.forEach((pair, index) => {
      if (pair.length === 2) round.parents[index] = Rules.createParent(round.founders, pair, round.seed, `Parent ${index + 1}`);
    });
    if (round.builderPairs.every((pair) => pair.length === 2)) {
      const lineage = Rules.createLineage(round.founders, round.builderPairs, round.seed);
      round.parents = lineage.parents;
      round.descendant = lineage.descendant;
      fairness = Rules.evaluateFairness(round.founders, round.builderPairs, round.seed);
    }
    if (!nodeById(inspectedId)) inspectedId = round.founders[0].id;
    render();
  }

  function nodeById(id) {
    if (!id || !round) return null;
    return round.founders.find((node) => node.id === id)
      || round.parents.find((node) => node?.id === id)
      || (round.descendant?.id === id ? round.descendant : null);
  }

  function tapFounder(id) {
    const pairs = round.builderPairs;
    const placedAt = pairs.findIndex((pair) => pair.includes(id));
    if (placedAt >= 0) pairs[placedAt] = pairs[placedAt].filter((value) => value !== id);
    else if (pairs[0].length < 2) pairs[0].push(id);
    else if (pairs[1].length < 2) pairs[1].push(id);
    else return;
    recompute();
  }

  // ===================== rendering =====================

  function renderPool() {
    const pool = Rules.generateFounderPool(`${seed}:round:0:0`, 24);
    const chosen = new Set(Rules.selectDistinctFounders(pool, 8).map((node) => node.id));
    els.pool.innerHTML = pool.map((node) => `<div class="pool-card ${chosen.has(node.id) ? "is-chosen" : ""}">
      <img src="${portrait(node)}" alt="">
      <b>${escapeText(node.name)}</b>
      <small>${node.signatures.map((signature) => escapeText(signature.label)).join(" · ") || "no signatures"}</small>
    </div>`).join("");
  }

  function renderBoard() {
    const badges = new Map();
    round.builderPairs.forEach((pair, coupleIndex) => pair.forEach((id) => badges.set(id, `C${coupleIndex + 1}`)));
    els.board.innerHTML = round.founders.map((node) => `<button type="button" class="author-founder ${badges.has(node.id) ? "is-placed" : ""}" data-founder="${node.id}">
      <small>${escapeText(node.label)}</small>
      ${badges.has(node.id) ? `<i>${badges.get(node.id)}</i>` : ""}
      <img src="${portrait(node)}" alt="">
    </button>`).join("");
  }

  function personCard(node, caption) {
    if (!node) return `<div class="author-person is-unknown"><span>?</span><b>${escapeText(caption)}</b></div>`;
    return `<button type="button" class="author-person ${node.id === inspectedId ? "is-inspected" : ""}" data-node="${node.id}">
      <img src="${portrait(node)}" alt=""><b>${escapeText(caption)}</b>
    </button>`;
  }

  function renderCouples() {
    els.couples.innerHTML = `
      ${round.builderPairs.map((pair, index) => `<div class="author-couple">
        <b>COUPLE ${index + 1}</b>
        <div>
          ${pair.map((id) => personCard(nodeById(id), `Founder ${founderLetter(id)}`)).join("<span>+</span>") || "<em>empty</em>"}
          <span>→</span>
          ${personCard(round.parents[index], `Parent ${index + 1}`)}
        </div>
      </div>`).join("")}
      <div class="author-couple is-birth">
        <b>DESCENDANT</b>
        <div>${personCard(round.descendant, "The Descendant")}</div>
      </div>`;
  }

  function renderNodePicker() {
    const nodes = [
      ...round.founders.map((node) => [node, `F·${node.label}`]),
      ...round.parents.map((node, index) => node ? [node, `P${index + 1}`] : null).filter(Boolean),
      ...(round.descendant ? [[round.descendant, "D"]] : [])
    ];
    els.nodePicker.innerHTML = nodes.map(([node, label]) =>
      `<button type="button" class="picker-chip ${node.id === inspectedId ? "is-active" : ""}" data-node="${node.id}">${escapeText(label)}</button>`
    ).join("");
  }

  function provenanceText(node, key, item) {
    if (!item) {
      const signature = node.signatures?.find((entry) => entry.name === key || entry.group === item?.group);
      return signature ? "Founder source trait · signature feature" : "Founder source trait";
    }
    const nameOf = (id) => nodeById(id)?.name || (round.parents.find((parent) => parent?.id === id)?.name) || id;
    if (item.mode === "inherited") return `Inherited from ${nameOf(item.parent)}`;
    if (item.mode === "dominant") return `Dominant · ${Math.round((item.keep || 0) * 100)}% from ${nameOf(item.parent)}`;
    if (item.mode === "sideSpecific") return `${item.side} side · ${Math.round((item.keep || 0) * 100)}% from ${nameOf(item.parent)}`;
    return `Blend · ${Math.round((item.amount ?? 0.5) * 100)}% toward ${nameOf(item.parents?.[1])}`;
  }

  function renderInspector(target, node) {
    if (!node) { target.innerHTML = ""; return; }
    target.innerHTML = Object.entries(node.phenotype).map(([key, value]) => {
      const display = /^#[0-9a-f]{6}$/i.test(String(value))
        ? `<span class="trait-swatch" style="background:${value}"></span>${value}` : escapeText(String(value));
      return `<div class="trait-row"><b>${escapeText(key.replace(/([A-Z])/g, " $1"))}</b>
        <span>${display}<br><small>${escapeText(provenanceText(node, key, node.provenance?.[key]))}</small></span></div>`;
    }).join("");
  }

  function configLabel(pairs) {
    return pairs.map((pair) => pair.map(founderLetter).join("+")).join(" | ");
  }

  function renderFairness() {
    if (!fairness) {
      els.fairnessSummary.textContent = "Complete both couples first";
      els.fairnessTable.innerHTML = "<p>The sweep simulates every choose-4-of-8 × 3-pairings answer and compares each simulated descendant to the real one.</p>";
      return;
    }
    els.fairnessSummary.textContent = `${fairness.verdict.toUpperCase()} · true answer +${fairness.margin.toFixed(1)} over best wrong (${fairness.configCount} simulated)`;
    const shown = fairness.configs.slice(0, 20);
    const trueEntry = fairness.configs.find((entry) => entry.correct);
    const rows = shown.includes(trueEntry) ? shown : [...shown, trueEntry];
    els.fairnessTable.innerHTML = `<table>
      <thead><tr><th>#</th><th>configuration</th><th>similarity</th></tr></thead>
      <tbody>${rows.map((entry) => `<tr class="${entry.correct ? "is-true" : ""}">
        <td>${fairness.configs.indexOf(entry) + 1}</td>
        <td>${escapeText(configLabel(entry.pairs))}${entry.correct ? " · TRUE" : ""}</td>
        <td>${entry.score.toFixed(2)}</td>
      </tr>`).join("")}</tbody>
    </table>
    ${fairness.configs.length > rows.length ? `<p>…and ${fairness.configs.length - rows.length} weaker configurations.</p>` : ""}`;
  }

  // ===================== legacy view =====================

  function rebuildLegacy() {
    const founders = Rules.selectDistinctFounders(cast.filter((character) => character?.traits).map((character) => Rules.normalizeFounder(character)), 8);
    legacyTree = Rules.buildTree(founders, seed);
    legacyInspectedId = "d0";
  }

  function renderLegacy() {
    if (!legacyTree) rebuildLegacy();
    const rows = [
      [["f0", "F1"], ["f1", "F2"], ["f2", "F3"], ["f3", "F4"], ["f4", "F5"], ["f5", "F6"], ["f6", "F7"], ["f7", "F8"]],
      [["g0", "GP1"], ["g1", "GP2"], ["g2", "GP3"], ["g3", "GP4"]],
      [["p0", "Parent 1"], ["p1", "Parent 2"]],
      [["d0", "Descendant"]]
    ];
    els.legacyTree.innerHTML = rows.map((row) => `<div class="lab-tree-row">${row.map(([id, label]) => {
      const node = legacyTree.nodes[id];
      return `<button type="button" class="lab-node ${id === legacyInspectedId ? "is-selected" : ""}" data-node="${id}">
        <img src="${portrait(node)}" alt=""><b>${escapeText(label)}${node.isFounder ? ` · ${escapeText(node.name)}` : ""}</b></button>`;
    }).join("")}</div>`).join("");
    const node = legacyTree.nodes[legacyInspectedId];
    els.legacyInspectName.textContent = node.name;
    const legacyNodeById = (id) => legacyTree.nodes[Object.keys(legacyTree.nodes).find((key) => legacyTree.nodes[key].id === id || key === id)];
    els.legacyInspector.innerHTML = Object.entries(node.phenotype).map(([key, value]) => {
      const item = node.provenance?.[key];
      const source = !item ? "Founder source trait"
        : item.mode === "inherited" ? `Inherited from ${legacyNodeById(item.parent)?.name || item.parent}`
          : item.parent ? `${item.mode} · ${Math.round((item.keep || 0) * 100)}% from ${legacyNodeById(item.parent)?.name || item.parent}`
            : `Blend toward ${legacyNodeById(item.parents?.[1])?.name || "?"} (${Math.round((item.amount ?? 0.5) * 100)}%)`;
      const display = /^#[0-9a-f]{6}$/i.test(String(value))
        ? `<span class="trait-swatch" style="background:${value}"></span>${value}` : escapeText(String(value));
      return `<div class="trait-row"><b>${escapeText(key.replace(/([A-Z])/g, " $1"))}</b><span>${display}<br><small>${escapeText(source)}</small></span></div>`;
    }).join("");
  }

  // ===================== flesh draft view =====================

  function draftRound() {
    return Make.buildDraftRound({
      sessionSeed: seed,
      roundIndex: 0,
      playerCount: draftPlayers,
      donorSource: draftSource,
      characters: cast
    });
  }

  function renderDraft() {
    const round = draftRound();
    const counts = Make.contestedCounts(round.recipes);
    els.draftMeta.textContent = `${round.donorSource} · ${round.donors.length} donors · contested per player: ${counts.join(", ")}`;
    els.draftPlayers.value = String(draftPlayers);
    els.draftSource.value = draftSource;
    const demand = new Map();
    round.recipes.forEach((recipe) => Make.PART_ORDER.forEach((part) => {
      const key = `${recipe[part]}:${part}`;
      demand.set(key, (demand.get(key) || 0) + 1);
    }));
    els.draftBoard.innerHTML = round.donors.map((donor) => `<div class="draft-donor">
      <small>${escapeText(donor.label)}</small>
      <img src="${portrait(Make.strippedDonor(donor, [], { background: round.background }))}" alt="">
      ${round.donorSource === "cast" ? `<em>${escapeText(donor.name)}</em>` : ""}
      <div class="draft-demand">${Make.PART_ORDER.map((part) => {
        const wanted = demand.get(`${donor.id}:${part}`) || 0;
        return wanted ? `<i class="${wanted > 1 ? "is-contested" : ""}">${Make.PART_LABELS[part]}${wanted > 1 ? `×${wanted}` : ""}</i>` : "";
      }).join("")}</div>
    </div>`).join("");
    const letter = (id) => round.donors.find((donor) => donor.id === id)?.label || "?";
    els.draftRecipes.innerHTML = round.recipes.map((recipe, player) => `<div class="draft-recipe">
      <img src="${portrait(round.targets[player])}" alt="">
      <b>P${player + 1}</b>
      <div>${Make.PART_ORDER.map((part) => {
        const contested = round.recipes.some((other, index) => index !== player && other[part] === recipe[part]);
        return `<span class="${contested ? "is-contested" : ""}">${Make.PART_LABELS[part]}·${letter(recipe[part])}</span>`;
      }).join("")}</div>
    </div>`).join("");
  }

  function simStats(scores) {
    const sorted = scores.slice().sort((a, b) => a - b);
    const mean = +(scores.reduce((x, y) => x + y, 0) / scores.length).toFixed(1);
    return { mean, p10: sorted[Math.floor(sorted.length * .1)], p90: sorted[Math.floor(sorted.length * .9)] };
  }

  function runSims() {
    const SIMS = 200;
    els.runSims.disabled = true;
    const matchups = [
      { key: "allGreedy", label: "all greedy (baseline + seat check)", bots: () => Array.from({ length: draftPlayers }, () => Make.bots.greedy) },
      { key: "spiteVsGreedy", label: "seat 1 spite, rest greedy", bots: () => Array.from({ length: draftPlayers }, (_, i) => i === 0 ? Make.bots.spite : Make.bots.greedy) },
      { key: "randomVsGreedy", label: "seat 1 random, rest greedy (skill gradient)", bots: () => Array.from({ length: draftPlayers }, (_, i) => i === 0 ? Make.bots.random : Make.bots.greedy) }
    ];
    const tally = Object.fromEntries(matchups.map((m) => [m.key, { bySeat: Array.from({ length: draftPlayers }, () => []), thefts: 0, spiteThefts: 0, masterpieces: 0 }]));
    let sim = 0;
    const step = () => {
      const until = Math.min(sim + 10, SIMS);
      for (; sim < until; sim += 1) {
        for (const matchup of matchups) {
          const round = Make.buildDraftRound({ sessionSeed: `sim-${matchup.key}-${sim}`, roundIndex: 0, playerCount: draftPlayers });
          Make.runBotDraft(round, matchup.bots(), `sim-${matchup.key}-${sim}`);
          const bucket = tally[matchup.key];
          round.results.players.forEach((result, seatIndex) => {
            bucket.bySeat[seatIndex].push(result.score);
            if (result.masterpiece) bucket.masterpieces += 1;
          });
          bucket.thefts += round.results.thefts.length;
          bucket.spiteThefts += round.results.thefts.filter((theft) => !theft.contested).length;
        }
      }
      els.simSummary.textContent = `${sim} / ${SIMS} sims`;
      if (sim < SIMS) { setTimeout(step, 0); return; }
      const g = tally.allGreedy;
      const seatMeans = g.bySeat.map((scores) => simStats(scores).mean);
      const gradient = simStats(tally.randomVsGreedy.bySeat.slice(1).flat()).mean - simStats(tally.randomVsGreedy.bySeat[0]).mean;
      els.simSummary.textContent = `skill gradient +${gradient.toFixed(1)} · seat spread ${(Math.max(...seatMeans) - Math.min(...seatMeans)).toFixed(1)}`;
      els.simReport.innerHTML = matchups.map((matchup) => {
        const bucket = tally[matchup.key];
        return `<div class="sim-row"><b>${escapeText(matchup.label)}</b>
          ${bucket.bySeat.map((scores, seatIndex) => {
            const stats = simStats(scores);
            return `<span>seat ${seatIndex + 1}: <strong>${stats.mean}</strong> <small>(${stats.p10}–${stats.p90})</small></span>`;
          }).join("")}
          <small>${(bucket.thefts / SIMS).toFixed(1)} thefts/round · ${(bucket.spiteThefts / SIMS).toFixed(1)} pure spite · ${bucket.masterpieces} masterpieces</small>
        </div>`;
      }).join("");
      els.runSims.disabled = false;
    };
    step();
  }

  // ===================== stress view: deterministic renderer worst-cases =====================

  function stressFigure(node, caption) {
    return `<figure><img src="${portrait(node)}" alt=""><figcaption>${escapeText(caption)}</figcaption></figure>`;
  }

  function renderStress() {
    const round = Make.buildDraftRound({ sessionSeed: "stress-board", roundIndex: 0, playerCount: 2, donorSource: "cast", characters: cast });
    const byId = Object.fromEntries(round.donors.map((donor) => [donor.id, donor]));
    const findBy = (test) => round.donors.find(test) || round.donors[0];
    const hat = findBy((d) => ["cap", "beanie", "beret", "turban", "bucketHat", "sunHat", "capBack", "headband", "bow", "flowerClip"].includes(d.extras?.hair?.accessory));
    const specs = findBy((d) => String(d.extras?.eyes?.accessory || "").toLowerCase().includes("glasses"));
    const beard = findBy((d) => (d.extras?.mouth?.beardLength || 0) > 0.2);
    const bald = findBy((d) => d.phenotype.hairFamily === "none");
    const sections = [];

    // 1) each part alone on the mannequin
    const solo = Make.PART_ORDER.map((part) =>
      stressFigure(Make.assembleCreature({ [part]: specs.id }, byId, { background: round.background }), `${part} only (${specs.label})`));
    sections.push(`<div class="stress-row"><b>PART ISOLATION — ${escapeText(specs.name)}'s parts on the mannequin</b><div>${
      stressFigure(Make.assembleCreature({}, byId, { background: round.background }), "mannequin")}${solo.join("")}</div></div>`);

    // 2) strip states of one furnished donor
    const strips = Make.PART_ORDER.map((part) => stressFigure(Make.strippedDonor(hat, [part]), `minus ${part}`));
    sections.push(`<div class="stress-row"><b>STRIP MATRIX — ${escapeText(hat.name)}</b><div>${
      stressFigure(Make.strippedDonor(hat, []), "intact")}${strips.join("")}${
      stressFigure(Make.strippedDonor(hat, Make.PART_ORDER), "husk")}</div></div>`);

    // 3) extras collisions
    const frankenAll = Make.assembleCreature({ skull: bald.id, eyes: specs.id, nose: beard.id, mouth: beard.id, hair: hat.id, body: specs.id }, byId, { background: round.background });
    const clipOnBald = Make.assembleCreature({ skull: bald.id, hair: hat.id }, byId, { background: round.background });
    const beardOnMannequin = Make.assembleCreature({ mouth: beard.id }, byId, { background: round.background });
    sections.push(`<div class="stress-row"><b>EXTRAS COLLISIONS</b><div>${
      stressFigure(frankenAll, "everything at once")}${
      stressFigure(clipOnBald, `${hat.label}-hair on ${bald.label}-skull`)}${
      stressFigure(beardOnMannequin, "beard mouth, putty body")}</div></div>`);

    // 4) synthetic extremes at the widened spreads
    const pool = Rules.generateFounderPool("stress-extremes", 24);
    const argmax = (key, dir) => pool.reduce((best, f) => (dir * f.phenotype[key] > dir * best.phenotype[key] ? f : best), pool[0]);
    const extremes = [["headScaleX", 1, "widest head"], ["headScaleX", -1, "narrowest head"], ["build", 1, "biggest build"], ["build", -1, "smallest build"],
      ["eyeScale", 1, "biggest eyes"], ["noseScale", 1, "biggest nose"], ["mouthScale", 1, "widest mouth"], ["neckWidth", -1, "thinnest neck"]];
    sections.push(`<div class="stress-row"><b>SYNTHETIC EXTREMES (widened spreads)</b><div>${
      extremes.map(([key, dir, label]) => stressFigure(argmax(key, dir), label)).join("")}</div></div>`);

    els.stressMeta.textContent = `${round.donors.length} cast donors · specimens: ${specs.name}, ${hat.name}, ${beard.name}, ${bald.name}`;
    els.stressGrid.innerHTML = sections.join("");
  }

  // ===================== rate view: yay/nay the generator, harvest tuning data =====================

  const RATE_KEY = "wdym_face_ratings_v1";
  const RATE_TAGS = ["EYES", "NOSE", "MOUTH", "HAIR", "PROPORTIONS", "COLOUR"];
  const RATE_BATCH_SIZE = 30;
  let rateBatches = 4;
  const rateFaceCache = new Map();
  // Swipe-deck state: a draft (chips + note) rides the CURRENT face and commits with the swipe.
  let rateDraft = { tags: [], note: "" };
  const rateSkipped = new Set();   // session-only; skipped faces return next visit
  let rateLast = null;             // one-step undo: { faceId, prev, skip }
  let rateBusy = false;            // ignore inputs during the fling animation
  let rateFlingTimer = null;

  function loadRatings() {
    try {
      const parsed = JSON.parse(localStorage.getItem(RATE_KEY) || "null");
      return parsed && typeof parsed.faces === "object" ? parsed : { v: 1, faces: {} };
    } catch (error) { return { v: 1, faces: {} }; }
  }
  let ratings = loadRatings();

  function saveRatings() {
    try { localStorage.setItem(RATE_KEY, JSON.stringify(ratings)); } catch (error) { /* storage full - keep playing */ }
  }

  function rateBatch(batch) {
    // v2 seed namespace: the generator was retuned from Joel's first 49 ratings, so v1 face ids
    // now describe different renders. Fresh seeds keep the deck honest; old data stays in storage.
    if (!rateFaceCache.has(batch)) rateFaceCache.set(batch, Rules.generateFounderPool(`rate-v3-batch-${batch}`, RATE_BATCH_SIZE));
    return rateFaceCache.get(batch);
  }

  function rateFaces() {
    return Array.from({ length: rateBatches }, (_, batch) => rateBatch(batch)).flat();
  }

  // The deck deals itself forever: first unrated, unskipped face - extending by a batch when dry.
  function rateCurrentFace() {
    for (let guard = 0; guard < 3; guard += 1) {
      const face = rateFaces().find((f) => !ratings.faces[f.id] && !rateSkipped.has(f.id));
      if (face) return face;
      rateBatches += 1;
    }
    return rateFaces()[0];
  }

  function setRating(face, patch) {
    const existing = ratings.faces[face.id] || { id: face.id, verdict: null, tags: [], note: "", phenotype: face.phenotype };
    const next = { ...existing, ...patch, phenotype: face.phenotype, extras: face.extras, generation: "v3" };
    if (!next.verdict) delete ratings.faces[face.id];
    else ratings.faces[face.id] = next;
    saveRatings();
  }

  function rateCommit(verdict) {
    if (rateBusy || view !== "rate") return;
    const face = rateCurrentFace();
    rateLast = { faceId: face.id, prev: ratings.faces[face.id] ? JSON.parse(JSON.stringify(ratings.faces[face.id])) : null, skip: false };
    setRating(face, { verdict, tags: rateDraft.tags.slice(), note: rateDraft.note });
    rateDraft = { tags: [], note: "" };
    const card = document.querySelector("#rateCard");
    if (card) {
      rateBusy = true;
      card.classList.add(verdict === "yay" ? "is-flung-right" : "is-flung-left");
      rateFlingTimer = setTimeout(() => {
        rateFlingTimer = null;
        rateBusy = false;
        render();
      }, 170);
    } else {
      render();
    }
  }

  function rateSkip() {
    if (rateBusy || view !== "rate") return;
    const face = rateCurrentFace();
    rateSkipped.add(face.id);
    rateLast = { faceId: face.id, prev: null, skip: true };
    rateDraft = { tags: [], note: "" };
    render();
  }

  function rateUndo() {
    if (!rateLast) return;
    if (rateFlingTimer) {
      clearTimeout(rateFlingTimer);
      rateFlingTimer = null;
      rateBusy = false;
    }
    if (rateLast.skip) {
      rateSkipped.delete(rateLast.faceId);
    } else {
      const undone = ratings.faces[rateLast.faceId];
      rateDraft = { tags: undone?.tags?.slice() || [], note: undone?.note || "" };
      if (rateLast.prev) ratings.faces[rateLast.faceId] = rateLast.prev;
      else delete ratings.faces[rateLast.faceId];
      saveRatings();
      // The undone face is unrated again and earliest in deck order, so it IS the next card.
    }
    rateLast = null;
    render();
  }

  // The report: your clicks, converted into generator-tuning instructions.
  function rateReportMarkup() {
    const rated = Object.values(ratings.faces);
    const yay = rated.filter((entry) => entry.verdict === "yay");
    const nay = rated.filter((entry) => entry.verdict === "nay");
    if (yay.length < 3 || nay.length < 3) {
      return `<p class="rate-hint">${yay.length} yay · ${nay.length} nay — rate at least 3 of each to unlock the tuning report.</p>`;
    }
    const mean = (list, key) => list.reduce((sum, entry) => sum + Number(entry.phenotype[key] ?? 0), 0) / list.length;
    const numeric = Rules.TRAIT_REGISTRY
      .filter((entry) => entry.base !== undefined)
      .map((entry) => {
        const delta = (mean(nay, entry.key) - mean(yay, entry.key)) / (entry.max - entry.min);
        return { label: entry.label, delta };
      })
      .filter((row) => Math.abs(row.delta) >= 0.06)
      .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
      .slice(0, 8);
    const catRows = [];
    Rules.TRAIT_REGISTRY.filter((entry) => entry.mode === "categorical").forEach((entry) => {
      entry.options.forEach((option) => {
        const inNay = nay.filter((e) => e.phenotype[entry.key] === option).length / nay.length;
        const inYay = yay.filter((e) => e.phenotype[entry.key] === option).length / yay.length;
        if (Math.abs(inNay - inYay) >= 0.2) catRows.push({ label: `${entry.label}: ${option}`, delta: inNay - inYay });
      });
    });
    catRows.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
    const tagCount = (list) => RATE_TAGS.map((tag) => [tag, list.filter((entry) => entry.tags?.includes(tag)).length]).filter(([, n]) => n);
    return `
      <div class="rate-report-cols">
        <div><b>WHERE NAY FACES DIFFER</b>${numeric.length ? numeric.map((row) =>
          `<span>${escapeText(row.label)} runs ${row.delta > 0 ? "higher" : "lower"} <i>${(row.delta * 100).toFixed(0)}%</i></span>`).join("") : "<span>no strong numeric signal yet</span>"}
        ${catRows.slice(0, 4).map((row) => `<span>${escapeText(row.label)} ${row.delta > 0 ? "over" : "under"}-represented <i>${Math.abs(row.delta * 100).toFixed(0)}%</i></span>`).join("")}</div>
        <div><b>NAY REASONS</b>${tagCount(nay).map(([tag, n]) => `<span>${tag} <i>×${n}</i></span>`).join("") || "<span>none tagged</span>"}</div>
        <div><b>YAY REASONS</b>${tagCount(yay).map(([tag, n]) => `<span>${tag} <i>×${n}</i></span>`).join("") || "<span>none tagged</span>"}</div>
      </div>`;
  }

  function renderRate() {
    const rated = Object.values(ratings.faces);
    const face = rateCurrentFace();
    els.rateMeta.textContent = `${rated.length} rated · ${rated.filter((e) => e.verdict === "yay").length} yay · ${rated.filter((e) => e.verdict === "nay").length} nay · deck never runs dry`;
    els.rateReport.innerHTML = rateReportMarkup();
    els.rateStage.innerHTML = `
      <div class="rate-deck">
        <button type="button" class="rate-big is-nay" title="Nay (←)">✗<span>← NAY</span></button>
        <div class="rate-card-well"><div class="rate-swipe-card" id="rateCard" data-face="${face.id}"><img src="${portrait(face)}" alt="" draggable="false"></div></div>
        <button type="button" class="rate-big is-yay" title="Yay (→)">★<span>YAY →</span></button>
      </div>
      <div class="rate-tags">${RATE_TAGS.map((tag) =>
        `<button type="button" class="rate-tag ${rateDraft.tags.includes(tag) ? "is-on" : ""}" data-tag="${tag}">${tag}</button>`).join("")}</div>
      <input class="rate-note" id="rateNote" type="text" maxlength="140" placeholder="why? (optional) — then ← nay or yay →" value="${escapeText(rateDraft.note)}">`;
    bindRateStage();
    if (window.matchMedia("(hover: hover)").matches) document.querySelector("#rateNote")?.focus({ preventScroll: true });
  }

  function bindRateStage() {
    els.rateStage.querySelector(".rate-big.is-nay").addEventListener("click", () => rateCommit("nay"));
    els.rateStage.querySelector(".rate-big.is-yay").addEventListener("click", () => rateCommit("yay"));
    // chips + note update the draft IN PLACE (no re-render, or typing focus dies)
    els.rateStage.querySelectorAll(".rate-tag").forEach((button) =>
      button.addEventListener("click", () => {
        const tag = button.dataset.tag;
        rateDraft.tags = rateDraft.tags.includes(tag) ? rateDraft.tags.filter((t) => t !== tag) : [...rateDraft.tags, tag];
        button.classList.toggle("is-on");
      }));
    els.rateStage.querySelector("#rateNote").addEventListener("input", (event) => { rateDraft.note = event.target.value; });
    // touch/mouse swipe on the card itself
    const card = els.rateStage.querySelector("#rateCard");
    card.addEventListener("pointerdown", (down) => {
      if (rateBusy) return;
      const startX = down.clientX;
      let dx = 0;
      const move = (event) => {
        dx = event.clientX - startX;
        card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
      };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
        card.style.transform = "";
        if (Math.abs(dx) > 70) rateCommit(dx > 0 ? "yay" : "nay");
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    });
  }

  // Arrow keys are swipes, everywhere in the rate view - even mid-note. Caret movement in a
  // 140-char note loses to rating speed on purpose.
  document.addEventListener("keydown", (event) => {
    if (view !== "rate") return;
    if (event.key === "ArrowLeft") { event.preventDefault(); rateCommit("nay"); }
    else if (event.key === "ArrowRight") { event.preventDefault(); rateCommit("yay"); }
    else if (event.key === "ArrowDown") { event.preventDefault(); rateSkip(); }
  });

  function render() {
    els.seed.textContent = seed;
    els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === view));
    els.views.forEach((section) => { section.hidden = section.dataset.view !== view; });
    if (view === "rate") renderRate();
    if (view === "stress") renderStress();
    if (view === "draft") renderDraft();
    if (view === "pool") renderPool();
    if (view === "authored") {
      renderBoard();
      renderCouples();
      renderNodePicker();
      els.inspectName.textContent = nodeById(inspectedId)?.name || "";
      renderInspector(els.inspector, nodeById(inspectedId));
      renderFairness();
    }
    if (view === "legacy") renderLegacy();
    bind();
  }

  function bind() {
    els.board.querySelectorAll(".author-founder").forEach((button) =>
      button.addEventListener("click", () => tapFounder(button.dataset.founder)));
    document.querySelectorAll(".author-person[data-node], .picker-chip").forEach((button) =>
      button.addEventListener("click", () => { inspectedId = button.dataset.node; render(); }));
    els.legacyTree.querySelectorAll(".lab-node").forEach((button) =>
      button.addEventListener("click", () => { legacyInspectedId = button.dataset.node; renderLegacy(); bind(); }));
  }

  els.tabs.forEach((tab) => tab.addEventListener("click", () => { view = tab.dataset.view; render(); }));
  els.reroll.addEventListener("click", () => {
    seed = `lab-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    legacyTree = null;
    rebuildRound(0);
  });
  els.draftPlayers.addEventListener("change", () => {
    draftPlayers = Math.max(2, Math.min(6, Number(els.draftPlayers.value) || 2));
    imageCache.clear();
    render();
  });
  els.draftSource.addEventListener("change", () => {
    draftSource = els.draftSource.value === "strangers" ? "strangers" : "cast";
    imageCache.clear();
    render();
  });
  els.runSims.addEventListener("click", runSims);
  els.rateUndo.addEventListener("click", rateUndo);
  els.rateSkip.addEventListener("click", rateSkip);
  els.rateExport.addEventListener("click", () => {
    const payload = JSON.stringify({ exported: new Date().toISOString(), tagVocabulary: RATE_TAGS, ...ratings }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "who-did-you-make-face-ratings.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  els.rateClear.addEventListener("click", () => {
    if (!confirm("Wipe every face rating?")) return;
    ratings = { v: 1, faces: {} };
    rateLast = null;
    saveRatings();
    render();
  });
  els.export.addEventListener("click", () => {
    const payload = JSON.stringify({
      engineVersion: Rules.ENGINE_VERSION,
      modeVersion: Rules.MODE_VERSION,
      labSeed: seed,
      round,
      fairness: fairness ? { verdict: fairness.verdict, margin: fairness.margin, rank: fairness.rank } : null
    }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `who-were-you-round-${seed}.json`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  els.import.addEventListener("change", async () => {
    const file = els.import.files?.[0];
    if (!file) return;
    try {
      const payload = JSON.parse(await file.text());
      if (payload.modeVersion !== Rules.MODE_VERSION || !Array.isArray(payload.round?.founders) || payload.round.founders.length !== 8) {
        throw new Error("bad round");
      }
      seed = String(payload.labSeed || seed);
      round = payload.round;
      view = "authored";
      recompute();
    } catch (error) {
      alert("That JSON is not a WHO? WERE YOU? round export.");
    } finally {
      els.import.value = "";
    }
  });

  rebuildRound(0);
})();
