// Hair Compositor Lab — deterministic render matrix for the unified hair compositor migration.
// BASELINE/OVERLAP tabs render through whatever renderer is loaded (pre-change: the split
// base+lock renderers; post-change: the compositor), so the same page captures the before
// reference and validates the after. Fixed seeds, fixed mannequin, no manual selection.
(function () {
  const face = window.faceGenerator;

  function stableHash(value) {
    let h = 2166136261;
    const s = String(value || "");
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }

  // Complete, hand-authored trait bag (a bare bag renders faceless — composePortrait needs
  // faceShape etc). Literal so the lab stays stable even when the cast changes.
  const MANNEQUIN = {
    faceShape: "oval", skin: "tan", skinHex: "#c88968", eyeColor: "#5a3d28",
    hair: "cropped", hairColor: "darkBrown", hairHex: "#6b4a2f",
    clothing: "tee", shirt: "#8d95a6", background: "#cfd8cf",
    accessory: "none", expression: "neutral", mouthStyle: "soft", animMode: "still",
    browShape: "soft", earVariant: "round", teeth: "even", lips: "soft",
    beardLength: 0, moustacheScale: 0, jewelleryItems: [], castShadowItems: [], tattoos: [],
    tattooText: "", lashes: 0, build: 82, eyeGap: 46,
    headScaleX: 1, headScaleY: 1, headTilt: 0, headX: 0, headY: 0,
    frontHairY: 0, backHairY: 0
  };

  const STYLES = (face.traitBook.hairStyles || []).slice();
  const LIGHT = "#d9a066";
  const DARK = "#17131a";

  // style-variant columns per the brief: default (outline on), wide, narrow, outline off,
  // light colour, dark colour.
  const VARIANTS = [
    { key: "default", traits: {} },
    { key: "wide", traits: { headScaleX: 1.14 } },
    { key: "narrow", traits: { headScaleX: 0.88 } },
    { key: "outline-off", traits: { hairOutlineMode: "off" } },
    { key: "light", traits: { hairHex: LIGHT } },
    { key: "dark", traits: { hairHex: DARK } }
  ];

  // overlap columns: base alone / + partially overlapping placed piece / + disconnected placed
  // piece / + behind piece. Placements chosen so "overlap" clearly intersects every style's crown
  // mass and "disconnected" clearly floats free of it.
  const OVERLAP = [
    { key: "alone", locks: [] },
    { key: "+overlap", locks: [{ lock: "curtainBangs", x: 52, y: 30, scale: 0.5, rot: 0 }] },
    { key: "+disconnected", locks: [{ lock: "cheekCurl", x: 90, y: 74, scale: 0.3, rot: 20 }] },
    { key: "+behind", locks: [{ lock: "longSideLock", x: 24, y: 42, scale: 0.5, rot: -20, behind: true }] }
  ];

  function traitsFor(style, extra, locks) {
    const t = { ...MANNEQUIN, ...extra, hair: style };
    if (locks && locks.length) t.hairLocks = locks.map((l) => ({ ...l }));
    return t;
  }

  function cell(label, traits, wide) {
    const src = face.renderPortrait(stableHash(label), traits);
    return `<figure class="cell${wide ? " wide" : ""}"><img src="${src}" alt=""><figcaption>${label}</figcaption></figure>`;
  }

  function baselineGrid() {
    return STYLES.map((style) => {
      const cells = VARIANTS.map((v) => cell(`${style}·${v.key}`, traitsFor(style, v.traits))).join("");
      return `<div class="cell-row"><b>${style}</b>${cells}</div>`;
    }).join("");
  }

  function overlapGrid() {
    return STYLES.map((style) => {
      const cells = OVERLAP.map((o) => cell(`${style}·${o.key}`, traitsFor(style, {}, o.locks))).join("");
      return `<div class="cell-row"><b>${style}</b>${cells}</div>`;
    }).join("");
  }

  function fullMatrixOnce() {
    let count = 0;
    let worst = { key: "", ms: 0 };
    const perStyle = {};
    STYLES.forEach((style) => {
      const t0 = performance.now();
      VARIANTS.forEach((v) => { face.renderPortrait(stableHash(`p-${style}-${v.key}`), traitsFor(style, v.traits)); count += 1; });
      OVERLAP.forEach((o) => { face.renderPortrait(stableHash(`p-${style}-${o.key}`), traitsFor(style, {}, o.locks)); count += 1; });
      const ms = performance.now() - t0;
      perStyle[style] = +ms.toFixed(1);
      if (ms > worst.ms) worst = { key: style, ms };
    });
    return { count, perStyle, worst };
  }

  function runPerf() {
    const runs = [];
    let detail = null;
    for (let r = 0; r < 3; r += 1) {
      const t0 = performance.now();
      detail = fullMatrixOnce();
      runs.push(performance.now() - t0);
    }
    const sorted = runs.slice().sort((a, b) => a - b);
    const typical = face.renderPortrait(stableHash("perf-typical"), traitsFor("cropped", {}, [
      { lock: "curtainBangs", x: 52, y: 30, scale: 0.5, rot: 0 },
      { lock: "sideSwoop", x: 64, y: 34, scale: 0.42, rot: -20 }
    ]));
    const svgBytes = decodeURIComponent(typical.replace(/^data:image\/svg\+xml;charset=UTF-8,/, "")).length;
    const report = {
      renderer: window.facesHair && window.facesHair.getHairPreset ? "compositor" : "legacy-split",
      portraits: detail.count,
      runsMs: runs.map((v) => +v.toFixed(1)),
      medianMs: +sorted[1].toFixed(1),
      worstStyle: { style: detail.worst.key, ms: +detail.worst.ms.toFixed(1) },
      perStyleMs: detail.perStyle,
      typicalBasePlus2SvgBytes: svgBytes
    };
    document.querySelector("#perfOut").textContent = JSON.stringify(report, null, 2);
    window.hairLabPerf = report;
    return report;
  }

  // ---------- tabs ----------
  const tabs = document.querySelectorAll("header [data-tab]");
  const sections = document.querySelectorAll("main [data-tab]");
  let built = {};
  function show(tab) {
    tabs.forEach((b) => b.classList.toggle("is-active", b.dataset.tab === tab));
    sections.forEach((s) => { s.hidden = s.dataset.tab !== tab; });
    if (tab === "baseline" && !built.baseline) { document.querySelector("#baselineGrid").innerHTML = baselineGrid(); built.baseline = true; }
    if (tab === "overlap" && !built.overlap) { document.querySelector("#overlapGrid").innerHTML = overlapGrid(); built.overlap = true; }
    if (tab === "debug" && !built.debug) { buildDebug(); built.debug = true; }
  }
  tabs.forEach((b) => b.addEventListener("click", () => show(b.dataset.tab)));
  document.querySelector("#runPerf").addEventListener("click", runPerf);

  // ---------- compositor debug matrix ----------
  // Columns per row: preset alone · +overlapping placed · +disconnected · separate mode ·
  // mass mask (white on black) · exterior rim only · high-contrast stack colours · final composite.
  // Captions carry resolved layer IDs with zone + z-order. Fixed seeds, fixed geometry.
  const DEBUG_COLOURS = ["#ff4d6d", "#3a86ff", "#ffd400", "#28a745", "#8338ec", "#ff8c00", "#00b8c4"];
  const HEAD_FRAME_TF = "translate(0 -16) translate(128 150) scale(0.86 0.86) translate(-128 -150)";

  function debugLayers(traits) {
    const resolved = window.faceGenerator.resolveHairComposition(traits);
    return resolved ? resolved.layers.filter((l) => l.visible !== false) : [];
  }
  function hairOnlySvg(traits, inner) {
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
      `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'><rect width='256' height='256' fill='#000'/>${inner}</svg>`
    )}`;
  }
  function zoneWrap(layer, body) {
    // standard/base pieces live inside the head frame; drawn pieces are un-framed (net identity)
    if (!body) return "";
    return layer.piece === "drawn" ? body : `<g transform='${HEAD_FRAME_TF}'>${body}</g>`;
  }
  function massSvg(traits, key) {
    const inner = debugLayers(traits)
      .map((l, i) => zoneWrap(l, window.facesHair.renderHairPiecePart(l, { hair: "#fff", massFill: "#fff", seed: `${key}m${i}` }, "mass")))
      .join("");
    return hairOnlySvg(traits, inner);
  }
  function rimSvg(traits, key) {
    const mass = debugLayers(traits)
      .map((l, i) => zoneWrap(l, window.facesHair.renderHairPiecePart(l, { hair: "#fff", massFill: "#000" }, "mass")))
      .join("");
    const id = `dbgrim-${key.replace(/[^a-zA-Z0-9_-]/g, "_")}`;
    const inner = `<defs><filter id='${id}' x='-128' y='-128' width='512' height='512' filterUnits='userSpaceOnUse'>
        <feMorphology in='SourceAlpha' operator='dilate' radius='2.7' result='expanded'/>
        <feFlood flood-color='#fff' result='rimColor'/>
        <feComposite in='rimColor' in2='expanded' operator='in'/>
      </filter></defs>
      <g filter='url(#${id})'>${mass}</g><g>${mass}</g>`;
    return hairOnlySvg(traits, inner);
  }
  function contrastSvg(traits, key) {
    const inner = debugLayers(traits)
      .map((l, i) => zoneWrap(l, window.facesHair.renderHairPiecePart(
        { ...l, fill: DEBUG_COLOURS[i % DEBUG_COLOURS.length] },
        { hair: DEBUG_COLOURS[i % DEBUG_COLOURS.length], seed: `${key}c${i}` }, "fill")))
      .join("");
    return hairOnlySvg(traits, inner);
  }
  function stackCaption(traits) {
    const resolved = window.faceGenerator.resolveHairComposition(traits);
    if (!resolved || !resolved.layers.length) return "(bald)";
    return resolved.layers.map((l, i) => `${i}:${l.id} [${l.zone}]`).join(" · ");
  }
  function debugRow(label, baseTraits) {
    const overlapLocks = [{ lock: "curtainBangs", x: 52, y: 30, scale: 0.5, rot: 0 }];
    const disconnected = [{ lock: "cheekCurl", x: 90, y: 74, scale: 0.3, rot: 20 }];
    const t = (extra, locks) => {
      const traits = { ...baseTraits, ...(extra || {}) };
      if (locks) traits.hairLocks = locks.map((l) => ({ ...l }));
      return traits;
    };
    const cells = [
      cell(`${label}·alone`, t()),
      cell(`${label}·+overlap`, t({}, overlapLocks)),
      cell(`${label}·+disc`, t({}, disconnected)),
      cell(`${label}·separate`, t({ lockBlend: "separate" }, overlapLocks)),
      `<figure class="cell"><img src="${massSvg(t({}, overlapLocks), `${label}-mass`)}" alt=""><figcaption>mass mask</figcaption></figure>`,
      `<figure class="cell"><img src="${rimSvg(t({}, overlapLocks), `${label}-rim`)}" alt=""><figcaption>rim only</figcaption></figure>`,
      `<figure class="cell"><img src="${contrastSvg(t({}, overlapLocks), `${label}-hc`)}" alt=""><figcaption>stack colours</figcaption></figure>`,
      cell(`${label}·composite`, t({}, [...overlapLocks, ...disconnected]))
    ].join("");
    const caption = stackCaption(t({}, overlapLocks));
    return `<div class="cell-row"><b>${label}</b>${cells}</div><p class="lab-note" style="margin:-4px 0 12px">stack: ${caption}</p>`;
  }
  function buildDebug() {
    const grid = document.querySelector("#debugGrid");
    if (!(window.facesHair && window.facesHair.getHairPreset)) {
      document.querySelector("#debugNote").textContent = "Unified compositor not loaded yet — this tab activates after migration.";
      grid.innerHTML = "";
      return;
    }
    document.querySelector("#debugNote").textContent =
      "Per style: alone · +overlap · +disconnected · separate · mass · rim · stack colours · composite. Variant rows cover light/dark, outline off, wide/narrow, ±frontHairY, behind+front.";
    let html = STYLES.map((style) => debugRow(style, { ...MANNEQUIN, hair: style })).join("");
    // variant coverage on representative styles
    const reps = ["curls", "longWaves", "locs"].filter((s) => STYLES.includes(s));
    const variants = [
      ["light", { hairHex: LIGHT }], ["dark", { hairHex: DARK }], ["outline-off", { hairOutlineMode: "off" }],
      ["wide", { headScaleX: 1.14 }], ["narrow", { headScaleX: 0.88 }],
      ["fhY-12", { frontHairY: -12 }], ["fhY+12", { frontHairY: 12 }]
    ];
    reps.forEach((style) => {
      variants.forEach(([vk, extra]) => { html += debugRow(`${style}·${vk}`, { ...MANNEQUIN, hair: style, ...extra }); });
      // behind + front combination
      html += debugRow(`${style}·behind+front`, {
        ...MANNEQUIN, hair: style,
        hairLocks: [{ lock: "longSideLock", x: 24, y: 42, scale: 0.5, rot: -20, behind: true }]
      });
    });
    grid.innerHTML = html;
  }

  document.querySelector("#labMeta").textContent =
    `${STYLES.length} styles · ${VARIANTS.length}+${OVERLAP.length} columns · renderer: ${window.facesHair && window.facesHair.getHairPreset ? "compositor" : "legacy split"}`;
  show("baseline");

  window.hairLab = { MANNEQUIN, STYLES, VARIANTS, OVERLAP, traitsFor, runPerf, stableHash };
})();
