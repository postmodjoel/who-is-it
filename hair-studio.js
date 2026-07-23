// Hair Studio — Joel's hair-piece workshop.
// RATE COMBOS: base styles × lock pieces, sampled from his own 114 baked placements (plus mirrors).
// RATE PIECES: brand-new shapes — mutations of his authored locks and parametric spine growths —
// emitted as pen-tool ("drawn") lock instances the renderer already understands (inst.d in portrait
// space). CATALOGUE: every yay, cullable, final decisions later.
(function installHairStudio() {
  const face = window.faceGenerator;
  const hairLib = window.facesHair;
  const LOCK_BASE_K = 0.42;            // faces-hair lockTransform constant (scale=1 ≈ head-sized)
  const STORE_KEY = "wdym_hair_ratings_v1";
  const TAGS = ["SHAPE", "PLACEMENT", "TOO MUCH", "TOO PLAIN", "COLOUR", "CLIPPING"];
  const BATCH = 24;

  // ---------- tiny deterministic toolkit (same family as the game engines) ----------
  function stableHash(value) {
    let h = 2166136261;
    const s = String(value || "");
    for (let i = 0; i < s.length; i += 1) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
    return h >>> 0;
  }
  function seeded(seed) {
    let v = stableHash(seed) || 0x9e3779b9;
    return () => {
      v += 0x6d2b79f5;
      let o = v;
      o = Math.imul(o ^ (o >>> 15), o | 1);
      o ^= o + Math.imul(o ^ (o >>> 7), o | 61);
      return ((o ^ (o >>> 14)) >>> 0) / 4294967296;
    };
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const pick = (list, rng) => list[Math.floor(rng() * list.length) % list.length];
  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ---------- mine Joel's baked placements ----------
  const cast = face.createCharacters(() => [], []);
  const mined = (() => {
    const byKind = {};        // kind -> [{x,y,scale,rot}]
    const usage = {};         // kind -> count
    const pairs = {};         // "a|b" sorted -> count
    const baseHosts = {};     // base style -> count (characters that host locks)
    const hairHexes = new Set();
    cast.forEach((ch) => {
      const t = ch?.traits || {};
      if (t.hairHex) hairHexes.add(String(t.hairHex).toLowerCase());
      const locks = Array.isArray(t.hairLocks) ? t.hairLocks.filter((l) => l && l.lock) : [];
      if (!locks.length) return;
      baseHosts[t.hair || "cropped"] = (baseHosts[t.hair || "cropped"] || 0) + 1;
      const kinds = [...new Set(locks.map((l) => l.lock))];
      kinds.forEach((a, i) => kinds.slice(i + 1).forEach((b) => {
        const key = [a, b].sort().join("|");
        pairs[key] = (pairs[key] || 0) + 1;
      }));
      locks.forEach((l) => {
        usage[l.lock] = (usage[l.lock] || 0) + 1;
        (byKind[l.lock] = byKind[l.lock] || []).push({
          x: Number(l.x) || 50, y: Number(l.y) || 32, scale: Number(l.scale) || 0.4, rot: Number(l.rot) || 0
        });
      });
    });
    return { byKind, usage, pairs, baseHosts, hairHexes: [...hairHexes] };
  })();
  const KINDS = Object.keys(mined.usage);
  const ALL_KINDS = (hairLib.lockCatalog || []).map((e) => e.key);
  const COVERED = ["hijab"]; // headwear, not hair — never a lock host
  const BASE_STYLES = (Object.keys(mined.baseHosts).length ? Object.keys(mined.baseHosts) : ["cropped", "messy", "bob"])
    .filter((s) => !COVERED.includes(s));

  /* ---- Taste weights from Joel's 418 combo ratings (2026-07-19 export, deck gen 1). ----
   * Multipliers are yay-rate relative to the 23% mean, floored so nothing vanishes entirely.
   * Bases: messy 48% / bob 31% / cropped 20% / curls 18% / locs 18% / coily 13% / bald 9%. */
  const BASE_TASTE = { messy: 2.1, bob: 1.35, cropped: 0.87, curls: 0.78, locs: 0.78, coily: 0.57 };
  const KIND_TASTE = {
    splitSideLocks: 1.65, rightCascade: 1.43, hookSideLock: 1.43, highPonytail: 1.35,
    napeFlip: 1.3, spikyFringe: 1.22, sideSwoop: 1.22, leftCascade: 1.17, curtainBangs: 1.09,
    longSStrand: 1.04, extraLongPair: 1.0, shortCrop: 1.0, ribbonWaveLeft: 0.91,
    softWaveCap: 0.83, centerPartWaves: 0.78, longSideLock: 0.7, angularArc: 0.6,
    longCapLocks: 0.52, roundedPuffSide: 0.48, taperedCurtain: 0.48, cowlickSprout: 0.48,
    curlyForelock: 0.35, cheekCurl: 0.26, splitFangBang: 0.08
  };
  const kindWeight = (k) => (mined.usage[k] || 0) * (KIND_TASTE[k] == null ? 1 : KIND_TASTE[k]);
  function weightedBase(rng) {
    // "bald" is a mined host (locks-only characters) but rated 9% as a combo base — the explicit
    // 3% bald flag in makeCombo owns that case; keep it out of the weighted pool.
    const pool = BASE_STYLES.filter((s) => s !== "bald").map((s) => [s, BASE_TASTE[s] == null ? 0.8 : BASE_TASTE[s]]);
    const total = pool.reduce((s, [, w]) => s + w, 0);
    let roll = rng() * total;
    for (const [s, w] of pool) { roll -= w; if (roll <= 0) return s; }
    return pool[0][0];
  }

  function weightedKind(rng, exclude = []) {
    const pool = KINDS.filter((k) => !exclude.includes(k));
    const total = pool.reduce((s, k) => s + kindWeight(k), 0);
    let roll = rng() * total;
    for (const k of pool) { roll -= kindWeight(k); if (roll <= 0) return k; }
    return pool[0];
  }
  function coKind(rng, chosen) {
    const scores = {};
    ALL_KINDS.forEach((k) => { if (chosen.includes(k)) return; scores[k] = 0.2; });
    chosen.forEach((a) => Object.keys(scores).forEach((b) => {
      scores[b] += mined.pairs[[a, b].sort().join("|")] || 0;
    }));
    const entries = Object.entries(scores)
      .filter(([k]) => mined.byKind[k])
      .map(([k, v]) => [k, v * (KIND_TASTE[k] == null ? 1 : KIND_TASTE[k])]);
    const total = entries.reduce((s, [, v]) => s + v, 0) || 1;
    let roll = rng() * total;
    for (const [k, v] of entries) { roll -= v; if (roll <= 0) return k; }
    return weightedKind(rng, chosen);
  }
  function sampleInstance(kind, rng, hostIsBald) {
    const lib = mined.byKind[kind] || [{ x: 50, y: 32, scale: 0.4, rot: 0 }];
    const base = pick(lib, rng);
    const inst = {
      lock: kind,
      x: +clamp(base.x + (rng() * 2 - 1) * 3, 5, 95).toFixed(2),
      y: +clamp(base.y + (rng() * 2 - 1) * 3, 2, 92).toFixed(2),
      scale: +clamp(base.scale + (rng() * 2 - 1) * 0.05, 0.15, 1.2).toFixed(3),
      rot: Math.round(base.rot + (rng() * 2 - 1) * 8)
    };
    // Gen-1 ratings: mirroring hurt (18% vs 24% yay) — mined placements are side-tuned.
    if (rng() < 0.25) { inst.mirror = true; inst.x = +(100 - inst.x).toFixed(2); inst.rot = -inst.rot; }
    // Face-overlap guard ("full face overlap", "covers the left eye" nays): a piece whose centre
    // lands in the eye/cheek box gets lifted to the hairline. Bald hosts also demand scalp
    // placement ("wtf the hair is floating").
    const inFaceBox = inst.y > 42 && inst.y < 80 && inst.x > 32 && inst.x < 68;
    if (inFaceBox) inst.y = +(36 + rng() * 4).toFixed(2);
    if (hostIsBald && inst.y > 45) inst.y = +(28 + rng() * 14).toFixed(2);
    return inst;
  }

  // ---------- combo generator (deck gen 2 — reweighted from the 418-rating export) ----------
  function makeCombo(batch, index) {
    const seed = `hcombo2-${batch}-${index}`;
    const rng = seeded(seed);
    const bald = rng() < 0.03;
    const baseStyle = bald ? "bald" : weightedBase(rng);
    const hairHex = pick(mined.hairHexes.length ? mined.hairHexes : ["#3a2418"], rng);
    const roll = rng();
    const count = roll < 0.55 ? 1 : roll < 0.9 ? 2 : 3;
    const pieces = [];
    for (let i = 0; i < count; i += 1) {
      const kind = i === 0 ? weightedKind(rng) : coKind(rng, pieces.map((p) => p.lock));
      pieces.push(sampleInstance(kind, rng, bald));
    }
    return { id: seed, kind: "combo", generation: 2, baseStyle, hairHex, pieces };
  }

  // ---------- path toolkit for NEW pieces ----------
  function parsePaths(markup) {
    const out = [];
    const re = /d='([^']+)'/g;
    let m;
    while ((m = re.exec(markup))) out.push(m[1]);
    return out;
  }
  // d-string -> polyline list (absolute; curves flattened)
  function pathToPolys(d) {
    const tokens = d.match(/[a-zA-Z]|-?[\d.]+(?:e-?\d+)?/g) || [];
    const polys = [];
    let poly = null, cmd = "", i = 0, x = 0, y = 0, sx = 0, sy = 0;
    const num = () => Number(tokens[i++]);
    while (i < tokens.length) {
      const t = tokens[i];
      if (/[a-zA-Z]/.test(t)) { cmd = t; i += 1; if (cmd === "z" || cmd === "Z") { if (poly && poly.length) { poly.push([sx, sy]); } continue; } }
      const rel = cmd === cmd.toLowerCase();
      switch (cmd.toLowerCase()) {
        case "m": {
          const nx = num(), ny = num();
          x = rel ? x + nx : nx; y = rel ? y + ny : ny; sx = x; sy = y;
          poly = [[x, y]]; polys.push(poly); cmd = rel ? "l" : "L";
          break;
        }
        case "l": { const nx = num(), ny = num(); x = rel ? x + nx : nx; y = rel ? y + ny : ny; poly.push([x, y]); break; }
        case "h": { const nx = num(); x = rel ? x + nx : nx; poly.push([x, y]); break; }
        case "v": { const ny = num(); y = rel ? y + ny : ny; poly.push([x, y]); break; }
        case "c": {
          const c1x = rel ? x + num() : num(), c1y = rel ? y + num() : num();
          const c2x = rel ? x + num() : num(), c2y = rel ? y + num() : num();
          const ex = rel ? x + num() : num(), ey = rel ? y + num() : num();
          for (let s = 1; s <= 8; s += 1) {
            const u = s / 8, v = 1 - u;
            poly.push([
              v * v * v * x + 3 * v * v * u * c1x + 3 * v * u * u * c2x + u * u * u * ex,
              v * v * v * y + 3 * v * v * u * c1y + 3 * v * u * u * c2y + u * u * u * ey
            ]);
          }
          x = ex; y = ey; break;
        }
        case "q": {
          const c1x = rel ? x + num() : num(), c1y = rel ? y + num() : num();
          const ex = rel ? x + num() : num(), ey = rel ? y + num() : num();
          for (let s = 1; s <= 8; s += 1) {
            const u = s / 8, v = 1 - u;
            poly.push([v * v * x + 2 * v * u * c1x + u * u * ex, v * v * y + 2 * v * u * c1y + u * u * ey]);
          }
          x = ex; y = ey; break;
        }
        case "s": case "t": case "a": { // rare in this data: swallow args as a line to endpoint
          const argc = cmd.toLowerCase() === "s" ? 4 : cmd.toLowerCase() === "t" ? 2 : 7;
          const args = Array.from({ length: argc }, num);
          const ex = args[argc - 2], ey = args[argc - 1];
          x = rel ? x + ex : ex; y = rel ? y + ey : ey; poly.push([x, y]); break;
        }
        default: i += 1;
      }
    }
    return polys.filter((p) => p && p.length > 2);
  }
  // polyline -> smooth closed/open cubic path (Catmull-Rom)
  function polyToPath(pts, close) {
    if (pts.length < 3) return "";
    const P = (k) => pts[clamp(k, 0, pts.length - 1)];
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let k = 0; k < pts.length - 1; k += 1) {
      const p0 = P(k - 1), p1 = P(k), p2 = P(k + 1), p3 = P(k + 2);
      const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
      const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
      d += `C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
    }
    return close ? d + "Z" : d;
  }
  const centroid = (pts) => pts.reduce(([ax, ay], [px, py]) => [ax + px / pts.length, ay + py / pts.length], [0, 0]);
  function resample(pts, n) {
    const out = [];
    for (let k = 0; k < n; k += 1) out.push(pts[Math.min(pts.length - 1, Math.round(k * (pts.length - 1) / (n - 1)))]);
    return out;
  }

  // Standard locks render INSIDE headGroup (0.86 frame scale about (128,150), then -16 lift);
  // drawn locks render OUTSIDE it in raw portrait space — same as in-game. Bake the frame in so a
  // drawn piece lands exactly where a standard lock with the same placement would.
  const frameToPortrait = ([x, y]) => [(x - 128) * 0.86 + 128, (y - 150) * 0.86 + 150 - 16];

  // Mined anchors were authored for specific hair (a cowlick atop an afro hovers over a crop).
  // Ground floaters: if a piece's lowest point clears the framed scalp line, pull it down to touch.
  const SCALP_Y = 68;
  function groundPolys(polysP) {
    const bottom = Math.max(...polysP.flat().map((p) => p[1]));
    const dy = Math.max(0, SCALP_Y - bottom);
    return dy ? polysP.map((p) => p.map(([x, y]) => [x, y + dy])) : polysP;
  }

  // 512-lock-space -> portrait space, mirroring faces-hair's lockTransform maths.
  function lockSpaceToPortrait(pts, inst) {
    const k = LOCK_BASE_K * (inst.scale || 1);
    const rad = (inst.rot || 0) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const hx = (inst.x || 50) / 100 * 256, hy = (inst.y == null ? 32 : inst.y) / 100 * 256;
    const mir = inst.mirror ? -1 : 1;
    return pts.map(([px, py]) => {
      let ox = px - 256, oy = py - 256;
      let rx = ox * cos - oy * sin, ry = ox * sin + oy * cos;
      rx *= k * mir; ry *= k;
      return frameToPortrait([hx + rx, hy + ry]);
    });
  }

  // ---------- mutant pieces: transform Joel's authored silhouettes ----------
  const lockPolyCache = new Map();
  function lockPolys(kind) {
    if (!lockPolyCache.has(kind)) {
      const markup = hairLib.renderLockPart({ lock: kind, x: 50, y: 50, scale: 1 }, {}, "mass");
      lockPolyCache.set(kind, parsePaths(markup).flatMap(pathToPolys).map((p) => resample(p, 26)));
    }
    return lockPolyCache.get(kind);
  }
  const MUTATIONS = {
    mirror: (polys) => polys.map((p) => p.map(([x, y]) => [512 - x, y])),
    taper: (polys, rng) => {
      const t = 0.4 + rng() * 0.35;
      const ys = polys.flat().map((p) => p[1]);
      const y0 = Math.min(...ys), y1 = Math.max(...ys);
      return polys.map((p) => p.map(([x, y]) => {
        const f = 1 - (1 - t) * ((y - y0) / (y1 - y0 || 1));
        const [cx] = centroid(p);
        return [cx + (x - cx) * f, y];
      }));
    },
    curl: (polys, rng) => {
      const total = (rng() < 0.5 ? -1 : 1) * (0.35 + rng() * 0.55);
      return polys.map((p) => {
        const [cx, cy] = centroid(p);
        return p.map(([x, y], i) => {
          const a = total * (i / p.length);
          const dx = x - cx, dy = y - cy;
          return [cx + dx * Math.cos(a) - dy * Math.sin(a), cy + dx * Math.sin(a) + dy * Math.cos(a)];
        });
      });
    },
    stretch: (polys, rng) => {
      const sx = 0.7 + rng() * 0.6, sy = 0.7 + rng() * 0.6;
      return polys.map((p) => p.map(([x, y]) => [256 + (x - 256) * sx, 256 + (y - 256) * sy]));
    }
  };
  function makeMutant(rng) {
    // splice retired: 0/12 yay in the gen-1 ratings ("looks a bit... not like hair")
    const parent = weightedKind(rng);
    const parents = [parent];
    let polys = lockPolys(parent);
    // op weights from gen-1 yay rates: taper 20% > curl 17% > mirror 10% > stretch 8%
    const weightedOp = (exclude) => {
      const table = [["taper", 0.42], ["curl", 0.3], ["mirror", 0.16], ["stretch", 0.12]].filter(([o]) => o !== exclude);
      const total = table.reduce((s, [, w]) => s + w, 0);
      let roll = rng() * total;
      for (const [o, w] of table) { roll -= w; if (roll <= 0) return o; }
      return table[0][0];
    };
    const ops = [weightedOp()];
    if (rng() < 0.4) ops.push(weightedOp(ops[0]));
    ops.forEach((op) => { polys = MUTATIONS[op](polys, rng); });
    const placement = sampleInstance(parents[0], rng);
    const portrait = groundPolys(polys.map((p) => lockSpaceToPortrait(p, placement)));
    const d = portrait.map((p) => polyToPath(p, true)).join("");
    const strands = portrait.slice(0, 2).map((p) => {
      const [cx, cy] = centroid(p);
      const inner = p.filter((_, i) => i % 2 === 0).map(([x, y]) => [cx + (x - cx) * 0.55, cy + (y - cy) * 0.55]);
      return polyToPath(inner.slice(0, Math.max(4, Math.floor(inner.length * 0.6))), false);
    }).filter(Boolean);
    return { d, strokes: strands, label: `${parents.join("+")} · ${ops.join("+")}` };
  }

  // ---------- parametric pieces: spine-grown ribbons ----------
  function makeGrown(rng) {
    // gen-1 yay rates: spiral 67%, sCurve 50%; jHook 9%, zig/arc 0% — weight accordingly
    const famRoll = rng();
    const family = famRoll < 0.4 ? "spiral" : famRoll < 0.8 ? "sCurve" : famRoll < 0.92 ? "jHook" : famRoll < 0.96 ? "zig" : "arc";
    const len = 45 + rng() * 65;
    const steps = 22;
    const spine = [];
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps;
      switch (family) {
        case "arc": { const a = (t - 0.5) * 2.0; spine.push([Math.sin(a) * len * 0.8, t * len * 0.7 + Math.cos(a) * -14]); break; }
        case "sCurve": spine.push([Math.sin(t * Math.PI * 2) * len * 0.22, t * len]); break;
        case "jHook": spine.push([t < 0.7 ? 0 : Math.sin((t - 0.7) * Math.PI * 1.6) * len * 0.4, t * len]); break;
        case "spiral": { const r = len * 0.32 * (1 - t * 0.75), th = t * Math.PI * 2.4; spine.push([Math.cos(th) * r, Math.sin(th) * r * 0.9 + t * len * 0.35]); break; }
        default: spine.push([(i % 2 ? 1 : -1) * len * 0.1 * (1 - t * 0.5), t * len]);
      }
    }
    const w0 = 12 + rng() * 16, w1 = 2 + rng() * 6;
    const left = [], right = [];
    for (let i = 0; i < spine.length; i += 1) {
      const [x, y] = spine[i];
      const [nx, ny] = i ? [x - spine[i - 1][0], y - spine[i - 1][1]] : [spine[1][0] - x, spine[1][1] - y];
      const nl = Math.hypot(nx, ny) || 1;
      const w = (w0 + (w1 - w0) * (i / spine.length)) / 2;
      left.push([x - (ny / nl) * w, y + (nx / nl) * w]);
      right.push([x + (ny / nl) * w, y - (nx / nl) * w]);
    }
    const silhouette = [...left, ...right.reverse()];
    // anchor where Joel anchors: a mined placement, mirrored half the time. The spine grammar
    // grows DOWNWARD, so wild mined rotations (a cowlick's -138) would point the ribbon sideways
    // or skyward — clamp to hang/swoop territory.
    const anchor = sampleInstance(weightedKind(rng), rng);
    anchor.rot = clamp(anchor.rot || 0, -55, 55);
    const ax = anchor.x / 100 * 256, ay = anchor.y / 100 * 256;
    const rad = (anchor.rot || 0) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const mir = anchor.mirror ? -1 : 1;
    const place = (pts) => pts.map(([x, y]) => frameToPortrait([ax + (x * cos - y * sin) * mir, ay + (x * sin + y * cos)]));
    const placedSil = place(silhouette);
    const dy = Math.max(0, SCALP_Y - Math.max(...placedSil.map((p) => p[1])));
    const drop = (pts) => (dy ? pts.map(([x, y]) => [x, y + dy]) : pts);
    const d = polyToPath(drop(placedSil), true);
    const strands = [drop(place(spine.map(([x, y]) => [x * 0.6, y])))].map((p) => polyToPath(resample(p, 12), false));
    return { d, strokes: strands, label: `grown · ${family}` };
  }

  function makePiece(batch, index) {
    const seed = `hpiece2-${batch}-${index}`;
    const rng = seeded(seed);
    const def = rng() < 0.35 ? makeMutant(rng) : makeGrown(rng);
    return { id: seed, kind: "piece", generation: 2, ...def };
  }

  // ---------- rendering ----------
  const imageCache = new Map();
  function portraitFor(traits, cacheKey) {
    if (!imageCache.has(cacheKey)) imageCache.set(cacheKey, face.renderPortrait(stableHash(cacheKey), traits));
    return imageCache.get(cacheKey);
  }
  // A bare trait bag renders faceless (no faceShape -> composePortrait draws no skin), so the
  // mannequin scaffolds from the plainest cast member's full traits, then neutralises the rest.
  const scaffold = (() => {
    const plainness = (t) => (t.accessory !== "none" ? 4 : 0) + (t.beardLength ? 2 : 0)
      + (Number(t.moustacheScale) ? 1 : 0) + ((t.jewelleryItems || []).length ? 1 : 0)
      + ((t.tattoos || []).length ? 1 : 0) + (t.expression !== "neutral" ? 1 : 0);
    return cast.slice().sort((a, b) =>
      plainness(a.traits) - plainness(b.traits) || String(a.id).localeCompare(String(b.id)))[0].traits;
  })();
  const MANNEQUIN = {
    ...scaffold,
    skinHex: "#c88968", eyeColor: "#5a3d28", clothing: "tee", shirt: "#8d95a6",
    background: "#cfd8cf", accessory: "none", expression: "neutral", animMode: "still",
    beardLength: 0, moustacheScale: 0, jewelleryItems: [], tattoos: [], tattooText: "",
    castShadowItems: [], hairLocks: [], frontHairY: 0,
    headScaleX: 1, headScaleY: 1, headTilt: 0, headX: 0, headY: 0
  };
  const HEADS = [
    { label: "base" }, { label: "wide", headScaleX: 1.14 }, { label: "narrow", headScaleX: 0.88 },
    { label: "tall", headScaleY: 1.12 }, { label: "short", headScaleY: 0.9 }
  ];
  function comboTraits(combo, head) {
    return { ...MANNEQUIN, ...head, hair: combo.baseStyle, hairHex: combo.hairHex, hairLocks: combo.pieces };
  }
  function pieceContexts(piece) {
    const inst = { d: piece.d, strokes: piece.strokes };
    return [
      { label: "on crop", traits: { ...MANNEQUIN, hair: "cropped", hairHex: "#3a2418", hairLocks: [inst] } },
      { label: "solo", traits: { ...MANNEQUIN, hair: "bald", hairHex: "#3a2418", hairLocks: [inst] } },
      { label: "on waves", traits: { ...MANNEQUIN, hair: "messy", hairHex: "#974526", hairLocks: [inst] } },
      { label: "wide head", traits: { ...MANNEQUIN, headScaleX: 1.14, hair: "cropped", hairHex: "#151313", hairLocks: [inst] } },
      { label: "narrow", traits: { ...MANNEQUIN, headScaleX: 0.88, hair: "bald", hairHex: "#3a2418", hairLocks: [inst] } }
    ];
  }


  /* ---- DESIGNED styles: hand-composed 2026-07-19 from the visual aesthetic of Joel's 116
   * catalogued yays (both rating exports). The drawn components ARE his yay pieces (top-bun +
   * side-bun spirals, sCurve ponytail, nape tail, swoop fringe), recombined with catalogue locks.
   * Aesthetic rules inferred by eye: one clear gesture per style; asymmetry as personality;
   * volume above the skull (buns/quiffs/crests); appendages visibly anchored; rounded mops with
   * brow-grazing fringe; comedy shapes welcome. ---- */
  const HAIR_DESIGNS = [
    { name: "The Samurai", baseStyle: "cropped", pieces: [{ d: "M127.5 55.8C126.5 56.2 123.3 57.8 121.6 58.2C119.8 58.6 118.5 58.5 117.0 58.3C115.5 58.1 113.9 57.6 112.6 57.0C111.3 56.4 110.0 55.5 109.0 54.6C108.0 53.7 107.1 52.7 106.5 51.6C105.8 50.6 105.4 49.5 105.2 48.5C105.0 47.6 105.0 46.6 105.2 45.9C105.3 45.2 105.6 44.6 106.0 44.2C106.3 43.8 106.7 43.6 107.1 43.4C107.5 43.3 107.9 43.3 108.4 43.4C108.8 43.5 109.3 43.6 109.8 43.9C110.3 44.2 110.9 44.6 111.4 45.2C111.8 45.7 112.3 46.4 112.7 47.2C113.0 47.9 113.3 48.8 113.4 49.7C113.6 50.6 113.5 51.6 113.4 52.5C113.3 53.4 113.0 54.3 112.6 55.1C112.2 55.9 111.6 56.6 111.1 57.2C110.5 57.9 109.8 58.4 109.1 58.9C108.4 59.3 107.6 59.6 106.8 59.8C106.1 60.0 105.3 60.1 104.6 60.1C103.9 60.1 103.2 60.0 102.6 59.9C102.0 59.8 101.4 59.1 101.0 59.4C100.5 59.7 99.8 61.3 99.9 61.9C100.1 62.5 101.3 62.6 102.1 62.9C103.0 63.2 103.9 63.4 104.9 63.5C105.9 63.6 107.1 63.5 108.2 63.3C109.3 63.1 110.5 62.7 111.5 62.1C112.6 61.5 113.7 60.8 114.7 59.9C115.6 58.9 116.5 57.8 117.1 56.6C117.7 55.4 118.3 54.0 118.5 52.6C118.8 51.2 118.9 49.7 118.7 48.2C118.6 46.8 118.2 45.3 117.6 43.9C116.9 42.6 116.1 41.2 115.0 40.2C114.0 39.1 112.7 38.1 111.3 37.5C109.9 37.0 108.3 36.6 106.7 36.7C105.2 36.8 103.6 37.3 102.2 38.1C100.9 38.9 99.7 40.1 98.8 41.5C98.0 42.9 97.4 44.6 97.2 46.3C97.0 48.0 97.1 49.9 97.5 51.7C98.0 53.5 98.8 55.5 99.9 57.2C101.0 59.0 102.4 60.8 104.1 62.2C105.8 63.7 107.9 65.1 110.1 66.0C112.3 67.0 114.8 67.7 117.3 68.0C119.8 68.3 122.8 68.1 125.1 67.7C127.4 67.3 130.1 66.0 131.1 65.6Z", strokes: ["M125.2 54.8C123.3 55.5 117.4 58.4 114.1 58.9C110.9 59.3 107.7 58.5 105.9 57.4C104.0 56.3 103.0 54.1 102.9 52.3C102.8 50.5 104.0 48.2 105.2 46.8C106.4 45.4 108.6 44.1 110.2 43.8C111.7 43.4 113.6 43.8 114.6 44.6C115.5 45.5 116.1 47.2 115.9 48.7C115.7 50.3 114.7 52.4 113.5 54.0C112.3 55.6 110.4 57.2 108.7 58.2C107.1 59.3 105.1 59.9 103.7 60.2C102.2 60.6 100.7 60.2 100.1 60.2"] }] },
    { name: "The Question", baseStyle: "bald", pieces: [{ d: "M131.7 113.2C133.2 113.7 137.9 116.0 140.6 116.6C143.2 117.2 145.3 117.0 147.5 116.7C149.8 116.4 152.0 115.6 154.0 114.7C156.0 113.8 157.9 112.5 159.4 111.1C160.9 109.8 162.2 108.1 163.1 106.6C164.0 105.1 164.6 103.4 164.9 102.0C165.2 100.5 165.1 99.1 164.9 98.1C164.7 97.0 164.1 96.2 163.6 95.6C163.1 95.1 162.5 94.9 161.9 94.7C161.4 94.6 160.8 94.7 160.2 94.9C159.7 95.0 159.0 95.3 158.4 95.7C157.7 96.2 156.9 96.8 156.3 97.6C155.6 98.3 155.0 99.3 154.5 100.4C154.1 101.5 153.7 102.8 153.6 104.0C153.4 105.3 153.5 106.7 153.7 107.9C153.9 109.2 154.4 110.4 155.0 111.5C155.5 112.6 156.3 113.7 157.1 114.5C158.0 115.4 159.0 116.1 160.0 116.7C160.9 117.2 162.0 117.6 163.1 117.9C164.1 118.1 165.2 118.2 166.1 118.2C167.1 118.2 168.0 118.0 168.8 117.9C169.6 117.7 170.2 116.2 170.9 117.1C171.7 118.0 173.7 121.9 173.5 123.2C173.3 124.5 171.3 124.4 169.9 124.8C168.6 125.2 167.0 125.6 165.4 125.6C163.8 125.7 162.0 125.6 160.3 125.2C158.5 124.8 156.7 124.2 155.0 123.2C153.3 122.3 151.6 121.0 150.2 119.6C148.8 118.1 147.4 116.3 146.4 114.5C145.5 112.6 144.7 110.4 144.3 108.2C143.9 106.0 143.8 103.6 144.1 101.4C144.4 99.2 145.1 96.8 146.0 94.8C147.0 92.7 148.4 90.6 150.0 89.0C151.7 87.4 153.7 85.9 155.9 85.0C158.0 84.2 160.6 83.7 162.9 83.8C165.3 84.0 167.9 84.8 169.9 86.1C171.9 87.3 173.7 89.3 175.0 91.4C176.2 93.5 177.1 96.1 177.4 98.7C177.7 101.3 177.5 104.1 176.8 106.9C176.1 109.7 174.9 112.6 173.2 115.2C171.6 117.8 169.4 120.5 166.8 122.6C164.2 124.8 161.1 126.8 157.8 128.3C154.5 129.7 150.8 130.8 147.0 131.1C143.3 131.5 138.9 131.2 135.4 130.6C132.0 130.0 127.9 128.0 126.4 127.5Z", strokes: ["M135.2 111.5C138.0 112.5 146.9 116.9 151.7 117.5C156.6 118.2 161.4 117.0 164.2 115.4C167.0 113.7 168.4 110.4 168.5 107.7C168.7 105.1 167.0 101.6 165.2 99.4C163.3 97.3 160.0 95.5 157.7 94.9C155.3 94.4 152.5 95.0 151.1 96.2C149.7 97.5 148.9 100.0 149.1 102.3C149.4 104.7 150.9 107.8 152.7 110.2C154.5 112.6 157.4 115.0 159.8 116.5C162.3 118.1 165.3 119.1 167.4 119.5C169.6 120.0 171.8 119.5 172.7 119.5"], dx: 14, dy: -46 }] },
    { name: "Nape Tail", baseStyle: "messy", pieces: [{ behind: true, d: "M157.6 135.0C160.3 136.0 169.5 138.6 173.5 140.6C177.6 142.5 179.0 143.6 181.8 146.7C184.6 149.9 188.4 156.0 190.1 159.5C191.8 163.1 192.0 164.4 192.2 168.1C192.4 171.8 192.3 177.0 191.4 181.7C190.4 186.4 187.6 192.7 186.2 196.3C184.9 200.0 184.3 200.5 183.3 203.6C182.4 206.6 181.2 211.5 180.6 214.5C179.9 217.6 180.2 220.9 179.6 222.0C178.9 223.0 177.5 222.7 176.5 221.1C175.5 219.5 174.3 215.0 173.6 212.4C173.0 209.7 173.2 205.5 172.6 205.3C171.9 205.1 170.3 208.8 169.6 211.3C168.9 213.9 168.5 217.0 168.4 220.7C168.2 224.4 169.3 231.8 168.7 233.6C168.2 235.3 166.1 232.8 165.0 231.0C163.8 229.1 162.7 226.6 161.6 222.5C160.5 218.3 159.2 210.6 158.6 206.0C158.0 201.4 158.0 198.8 158.0 194.8C158.1 190.7 158.2 185.8 158.9 181.8C159.6 177.9 161.2 173.7 162.3 170.9C163.3 168.1 164.7 167.5 165.3 165.0C165.9 162.4 166.2 158.5 165.8 155.5C165.5 152.5 164.5 150.2 163.1 146.8C161.7 143.4 158.5 137.0 157.6 135.0Z", strokes: ["M163.9 158.8C166.1 159.8 174.0 162.2 177.2 165.2C180.4 168.2 182.5 172.4 182.9 176.9C183.4 181.5 180.7 188.2 179.7 192.5C178.6 196.7 177.4 200.2 176.5 202.5C175.6 204.8 175.0 206.9 174.3 206.1C173.6 205.2 172.5 198.8 172.1 197.4"] }] },
    { name: "Curtain Dome", baseStyle: "bob", pieces: [{ lock: "softWaveCap", x: 50, y: 28, scale: 0.5, rot: 0 }, { d: "M180.9 72.5C178.2 70.0 169.7 60.8 164.7 57.9C159.7 54.9 156.8 54.3 150.8 54.6C144.8 54.9 134.0 57.4 128.6 59.5C123.3 61.5 121.5 64.3 118.6 67.0C115.8 69.8 113.3 72.7 111.4 75.9C109.4 79.1 107.9 83.1 106.9 86.1C106.0 89.1 104.8 90.4 105.9 94.0C106.9 97.6 111.2 104.3 113.3 107.7C115.4 111.2 115.8 112.2 118.6 114.8C121.3 117.3 126.7 121.6 129.8 122.9C133.0 124.3 136.4 124.2 137.2 122.8C138.0 121.4 135.2 117.8 134.8 114.6C134.3 111.3 134.2 106.2 134.6 103.2C135.0 100.3 135.0 99.6 137.1 96.8C139.2 93.9 144.3 88.2 146.9 86.0C149.5 83.8 150.9 84.2 152.5 83.6C154.2 83.0 151.2 80.9 156.7 82.3C162.3 83.8 182.7 92.9 185.8 92.2C188.9 91.6 176.0 80.6 175.3 78.4C174.7 76.1 179.7 78.3 181.9 78.5C184.1 78.7 187.7 80.2 188.5 79.6C189.2 78.9 188.8 77.6 186.5 74.8C184.2 72.0 177.8 65.8 174.4 62.8C171.0 59.8 168.8 58.4 166.1 56.8C163.4 55.2 159.5 53.7 158.2 53.1Z", strokes: ["M166.1 77.6C163.3 75.9 155.2 68.2 149.5 67.7C143.8 67.2 135.8 71.7 131.8 74.6C127.8 77.5 125.9 81.3 125.4 85.1C124.9 88.8 126.8 93.6 128.9 97.0C131.0 100.3 136.0 104.7 138.0 105.3C140.0 106.0 140.2 101.5 140.7 100.7"] }] },
    { name: "Crest Cap", baseStyle: "cropped", pieces: [{ lock: "spikyFringe", x: 50, y: 26, scale: 0.52, rot: 0 }] },
    { name: "Soft Serve", baseStyle: "coily", pieces: [{ lock: "roundedPuffSide", x: 50, y: 26, scale: 0.55, rot: 0 }, { lock: "roundedPuffSide", x: 50, y: 15, scale: 0.4, rot: 0 }] },
    { name: "The Duchess", baseStyle: "bob", pieces: [{ lock: "longSideLock", x: 55, y: 28, scale: 0.46, rot: 118, mirror: true }, { lock: "shortCrop", x: 50, y: 22, scale: 0.45, rot: 0 }] },
    { name: "Princess Mane", baseStyle: "messy", pieces: [{ lock: "extraLongPair", x: 50, y: 34, scale: 0.62, rot: 0 }, { lock: "curtainBangs", x: 52, y: 28, scale: 0.48, rot: 0 }] },
    { name: "Top Knot Whip", baseStyle: "cropped", pieces: [{ d: "M127.5 55.8C126.5 56.2 123.3 57.8 121.6 58.2C119.8 58.6 118.5 58.5 117.0 58.3C115.5 58.1 113.9 57.6 112.6 57.0C111.3 56.4 110.0 55.5 109.0 54.6C108.0 53.7 107.1 52.7 106.5 51.6C105.8 50.6 105.4 49.5 105.2 48.5C105.0 47.6 105.0 46.6 105.2 45.9C105.3 45.2 105.6 44.6 106.0 44.2C106.3 43.8 106.7 43.6 107.1 43.4C107.5 43.3 107.9 43.3 108.4 43.4C108.8 43.5 109.3 43.6 109.8 43.9C110.3 44.2 110.9 44.6 111.4 45.2C111.8 45.7 112.3 46.4 112.7 47.2C113.0 47.9 113.3 48.8 113.4 49.7C113.6 50.6 113.5 51.6 113.4 52.5C113.3 53.4 113.0 54.3 112.6 55.1C112.2 55.9 111.6 56.6 111.1 57.2C110.5 57.9 109.8 58.4 109.1 58.9C108.4 59.3 107.6 59.6 106.8 59.8C106.1 60.0 105.3 60.1 104.6 60.1C103.9 60.1 103.2 60.0 102.6 59.9C102.0 59.8 101.4 59.1 101.0 59.4C100.5 59.7 99.8 61.3 99.9 61.9C100.1 62.5 101.3 62.6 102.1 62.9C103.0 63.2 103.9 63.4 104.9 63.5C105.9 63.6 107.1 63.5 108.2 63.3C109.3 63.1 110.5 62.7 111.5 62.1C112.6 61.5 113.7 60.8 114.7 59.9C115.6 58.9 116.5 57.8 117.1 56.6C117.7 55.4 118.3 54.0 118.5 52.6C118.8 51.2 118.9 49.7 118.7 48.2C118.6 46.8 118.2 45.3 117.6 43.9C116.9 42.6 116.1 41.2 115.0 40.2C114.0 39.1 112.7 38.1 111.3 37.5C109.9 37.0 108.3 36.6 106.7 36.7C105.2 36.8 103.6 37.3 102.2 38.1C100.9 38.9 99.7 40.1 98.8 41.5C98.0 42.9 97.4 44.6 97.2 46.3C97.0 48.0 97.1 49.9 97.5 51.7C98.0 53.5 98.8 55.5 99.9 57.2C101.0 59.0 102.4 60.8 104.1 62.2C105.8 63.7 107.9 65.1 110.1 66.0C112.3 67.0 114.8 67.7 117.3 68.0C119.8 68.3 122.8 68.1 125.1 67.7C127.4 67.3 130.1 66.0 131.1 65.6Z", strokes: ["M125.2 54.8C123.3 55.5 117.4 58.4 114.1 58.9C110.9 59.3 107.7 58.5 105.9 57.4C104.0 56.3 103.0 54.1 102.9 52.3C102.8 50.5 104.0 48.2 105.2 46.8C106.4 45.4 108.6 44.1 110.2 43.8C111.7 43.4 113.6 43.8 114.6 44.6C115.5 45.5 116.1 47.2 115.9 48.7C115.7 50.3 114.7 52.4 113.5 54.0C112.3 55.6 110.4 57.2 108.7 58.2C107.1 59.3 105.1 59.9 103.7 60.2C102.2 60.6 100.7 60.2 100.1 60.2"] }, { behind: true, d: "M157.6 135.0C160.3 136.0 169.5 138.6 173.5 140.6C177.6 142.5 179.0 143.6 181.8 146.7C184.6 149.9 188.4 156.0 190.1 159.5C191.8 163.1 192.0 164.4 192.2 168.1C192.4 171.8 192.3 177.0 191.4 181.7C190.4 186.4 187.6 192.7 186.2 196.3C184.9 200.0 184.3 200.5 183.3 203.6C182.4 206.6 181.2 211.5 180.6 214.5C179.9 217.6 180.2 220.9 179.6 222.0C178.9 223.0 177.5 222.7 176.5 221.1C175.5 219.5 174.3 215.0 173.6 212.4C173.0 209.7 173.2 205.5 172.6 205.3C171.9 205.1 170.3 208.8 169.6 211.3C168.9 213.9 168.5 217.0 168.4 220.7C168.2 224.4 169.3 231.8 168.7 233.6C168.2 235.3 166.1 232.8 165.0 231.0C163.8 229.1 162.7 226.6 161.6 222.5C160.5 218.3 159.2 210.6 158.6 206.0C158.0 201.4 158.0 198.8 158.0 194.8C158.1 190.7 158.2 185.8 158.9 181.8C159.6 177.9 161.2 173.7 162.3 170.9C163.3 168.1 164.7 167.5 165.3 165.0C165.9 162.4 166.2 158.5 165.8 155.5C165.5 152.5 164.5 150.2 163.1 146.8C161.7 143.4 158.5 137.0 157.6 135.0Z", strokes: ["M163.9 158.8C166.1 159.8 174.0 162.2 177.2 165.2C180.4 168.2 182.5 172.4 182.9 176.9C183.4 181.5 180.7 188.2 179.7 192.5C178.6 196.7 177.4 200.2 176.5 202.5C175.6 204.8 175.0 206.9 174.3 206.1C173.6 205.2 172.5 198.8 172.1 197.4"] }] },
    { name: "Side Spill", baseStyle: "messy", pieces: [{ lock: "longSideLock", x: 56, y: 26, scale: 0.4, rot: -111 }, { lock: "shortCrop", x: 50, y: 22, scale: 0.4, rot: 0 }] }
  ];

  // ---------- storage ----------
  function loadStore() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (parsed && parsed.combos && parsed.pieces) return parsed;
    } catch (error) { /* fresh */ }
    return { v: 1, combos: {}, pieces: {} };
  }
  let store = loadStore();
  const saveStore = () => { try { localStorage.setItem(STORE_KEY, JSON.stringify(store)); } catch (error) { /* full */ } };

  // ---------- the two decks ----------
  const decks = {
    combos: { batches: 3, make: makeCombo, bucket: () => store.combos, skipped: new Set(), cache: new Map() },
    pieces: { batches: 3, make: makePiece, bucket: () => store.pieces, skipped: new Set(), cache: new Map() }
  };
  let view = "combos";
  let draft = { tags: [], note: "" };
  let lastAction = null;   // { deck, id, prev, skip }
  let busy = false;

  function deckItems(name) {
    const deck = decks[name];
    const out = [];
    for (let b = 0; b < deck.batches; b += 1) {
      for (let i = 0; i < BATCH; i += 1) {
        const key = `${b}:${i}`;
        if (!deck.cache.has(key)) deck.cache.set(key, deck.make(b, i));
        out.push(deck.cache.get(key));
      }
    }
    return out;
  }
  function currentItem(name) {
    const deck = decks[name];
    for (let guard = 0; guard < 3; guard += 1) {
      const item = deckItems(name).find((it) => !deck.bucket()[it.id] && !deck.skipped.has(it.id));
      if (item) return item;
      deck.batches += 1;
    }
    return deckItems(name)[0];
  }

  function commit(verdict) {
    if (busy || !decks[view]) return;
    const deck = decks[view];
    const item = currentItem(view);
    lastAction = { deck: view, id: item.id, prev: deck.bucket()[item.id] || null, skip: false };
    deck.bucket()[item.id] = { ...item, verdict, tags: draft.tags.slice(), note: draft.note };
    saveStore();
    draft = { tags: [], note: "" };
    const card = document.querySelector(".rate-swipe-card");
    if (card) {
      busy = true;
      card.classList.add(verdict === "yay" ? "is-flung-right" : "is-flung-left");
      setTimeout(() => { busy = false; render(); }, 170);
    } else render();
  }
  function skip() {
    if (busy || !decks[view]) return;
    const item = currentItem(view);
    decks[view].skipped.add(item.id);
    lastAction = { deck: view, id: item.id, prev: null, skip: true };
    draft = { tags: [], note: "" };
    render();
  }
  function undo() {
    if (busy || !lastAction) return;
    const deck = decks[lastAction.deck];
    if (lastAction.skip) deck.skipped.delete(lastAction.id);
    else {
      const undone = deck.bucket()[lastAction.id];
      draft = { tags: undone?.tags?.slice() || [], note: undone?.note || "" };
      if (lastAction.prev) deck.bucket()[lastAction.id] = lastAction.prev;
      else delete deck.bucket()[lastAction.id];
      saveStore();
    }
    view = lastAction.deck;
    lastAction = null;
    render();
  }

  // ---------- markup ----------
  function comboCardMarkup(combo) {
    const main = portraitFor(comboTraits(combo, HEADS[0]), `${combo.id}:h0`);
    return `<div class="rate-swipe-card" id="hairCard" data-item="${combo.id}">
        <img src="${main}" alt="" draggable="false">
        <small>${esc(combo.baseStyle)} · ${combo.pieces.map((p) => esc(p.lock) + (p.mirror ? "ᴹ" : "")).join(" + ")}</small>
      </div>
      <div class="fit-strip">${HEADS.slice(1).map((head, i) =>
        `<figure><img src="${portraitFor(comboTraits(combo, head), `${combo.id}:h${i + 1}`)}" alt=""><figcaption>${head.label}</figcaption></figure>`).join("")}</div>`;
  }
  function pieceCardMarkup(piece) {
    const ctxs = pieceContexts(piece);
    return `<div class="rate-swipe-card" id="hairCard" data-item="${piece.id}">
        <img src="${portraitFor(ctxs[0].traits, `${piece.id}:c0`)}" alt="" draggable="false">
        <small>${esc(piece.label)}</small>
      </div>
      <div class="fit-strip">${ctxs.slice(1).map((c, i) =>
        `<figure><img src="${portraitFor(c.traits, `${piece.id}:c${i + 1}`)}" alt=""><figcaption>${c.label}</figcaption></figure>`).join("")}</div>`;
  }

  function reportMarkup(name) {
    const rated = Object.values(decks[name].bucket());
    const yay = rated.filter((r) => r.verdict === "yay"), nay = rated.filter((r) => r.verdict === "nay");
    if (yay.length < 3 || nay.length < 3) return `<p class="rate-hint">${yay.length} yay · ${nay.length} nay — rate a few more to unlock the report.</p>`;
    const rate = (list, fn) => {
      const groups = {};
      list.forEach((r) => { const k = fn(r); if (!k) return; (groups[k] = groups[k] || { y: 0, n: 0 })[r.verdict === "yay" ? "y" : "n"] += 1; });
      return Object.entries(groups).filter(([, g]) => g.y + g.n >= 3)
        .map(([k, g]) => ({ k, pct: g.y / (g.y + g.n), n: g.y + g.n }))
        .sort((a, b) => b.pct - a.pct);
    };
    const rows = name === "combos"
      ? [["BY BASE", rate(rated, (r) => r.baseStyle)], ["BY PIECE", rate(rated.flatMap((r) => (r.pieces || []).map((p) => ({ ...r, _k: p.lock }))), (r) => r._k)], ["BY COUNT", rate(rated, (r) => `${(r.pieces || []).length} piece${(r.pieces || []).length > 1 ? "s" : ""}`)]]
      : [["BY RECIPE", rate(rated, (r) => (r.label || "").split(" · ").slice(-1)[0])]];
    return `<div class="rate-report-cols">${rows.map(([title, list]) => `<div><b>${title}</b>${
      list.map((row) => `<span>${esc(row.k)} <i>${Math.round(row.pct * 100)}%</i> <em>(${row.n})</em></span>`).join("") || "<span>—</span>"
    }</div>`).join("")}</div>`;
  }

  function stageMarkup(name) {
    const item = currentItem(name);
    return `
      <div class="rate-deck">
        <button type="button" class="rate-big is-nay" title="Nay (←)">✗<span>← NAY</span></button>
        <div class="rate-card-well">${name === "combos" ? comboCardMarkup(item) : pieceCardMarkup(item)}</div>
        <button type="button" class="rate-big is-yay" title="Yay (→)">★<span>YAY →</span></button>
      </div>
      <div class="rate-tags">${TAGS.map((tag) => `<button type="button" class="rate-tag ${draft.tags.includes(tag) ? "is-on" : ""}" data-tag="${tag}">${tag}</button>`).join("")}</div>
      <input class="rate-note" id="hairNote" type="text" maxlength="140" placeholder="why? (optional) — then ← nay or yay →" value="${esc(draft.note)}">`;
  }

  function designedMarkup() {
    return HAIR_DESIGNS.map((d, i) => `<figure class="cat-card is-designed">
        <img src="${portraitFor(comboTraits({ baseStyle: d.baseStyle, hairHex: "#6b4a2f", pieces: d.pieces }, HEADS[0]), `design:${i}`)}" alt="">
        <figcaption>${esc(d.name)}<br><em>${esc(d.baseStyle)}</em></figcaption>
      </figure>`).join("");
  }

  function catalogueMarkup() {
    const combos = Object.values(store.combos).filter((r) => r.verdict === "yay");
    const pieces = Object.values(store.pieces).filter((r) => r.verdict === "yay");
    els.catMeta.textContent = `${combos.length} combos · ${pieces.length} pieces · ${HAIR_DESIGNS.length} designed`;
    if (els.catDesigned) els.catDesigned.innerHTML = designedMarkup();
    els.catCombos.innerHTML = combos.map((c) => `<figure class="cat-card">
        <img src="${portraitFor(comboTraits(c, HEADS[0]), `${c.id}:h0`)}" alt="">
        <figcaption>${esc(c.baseStyle)} · ${(c.pieces || []).map((p) => esc(p.lock)).join("+")}${c.note ? `<br><em>${esc(c.note)}</em>` : ""}</figcaption>
        <button type="button" class="cat-cull" data-deck="combos" data-id="${c.id}">✗</button>
      </figure>`).join("") || "<p class='rate-hint'>nothing yet — go swipe</p>";
    els.catPieces.innerHTML = pieces.map((p) => `<figure class="cat-card">
        <img src="${portraitFor(pieceContexts(p)[0].traits, `${p.id}:c0`)}" alt="">
        <figcaption>${esc(p.label)}${p.note ? `<br><em>${esc(p.note)}</em>` : ""}</figcaption>
        <button type="button" class="cat-cull" data-deck="pieces" data-id="${p.id}">✗</button>
      </figure>`).join("") || "<p class='rate-hint'>nothing yet</p>";
  }

  // ---------- render + bind ----------
  const els = {
    tabs: document.querySelectorAll(".lab-tab"),
    views: document.querySelectorAll(".lab-view"),
    mineMeta: document.querySelector("#mineMeta"),
    comboMeta: document.querySelector("#comboMeta"),
    comboReport: document.querySelector("#comboReport"),
    comboStage: document.querySelector("#comboStage"),
    pieceMeta: document.querySelector("#pieceMeta"),
    pieceReport: document.querySelector("#pieceReport"),
    pieceStage: document.querySelector("#pieceStage"),
    catMeta: document.querySelector("#catMeta"),
    catDesigned: document.querySelector("#catDesigned"),
    catCombos: document.querySelector("#catCombos"),
    catPieces: document.querySelector("#catPieces"),
    undo: document.querySelector("#hairUndo"),
    skip: document.querySelector("#hairSkip"),
    export: document.querySelector("#hairExport"),
    clear: document.querySelector("#hairClear")
  };

  function metaLine(name) {
    const rated = Object.values(decks[name].bucket());
    return `${rated.length} rated · ${rated.filter((r) => r.verdict === "yay").length} yay · ${rated.filter((r) => r.verdict === "nay").length} nay`;
  }

  function bindStage(stage) {
    stage.querySelector(".rate-big.is-nay").addEventListener("click", () => commit("nay"));
    stage.querySelector(".rate-big.is-yay").addEventListener("click", () => commit("yay"));
    stage.querySelectorAll(".rate-tag").forEach((button) => button.addEventListener("click", () => {
      const tag = button.dataset.tag;
      draft.tags = draft.tags.includes(tag) ? draft.tags.filter((t) => t !== tag) : [...draft.tags, tag];
      button.classList.toggle("is-on");
    }));
    stage.querySelector("#hairNote").addEventListener("input", (event) => { draft.note = event.target.value; });
    const card = stage.querySelector(".rate-swipe-card");
    card.addEventListener("pointerdown", (down) => {
      if (busy) return;
      const startX = down.clientX;
      let dx = 0;
      const move = (event) => { dx = event.clientX - startX; card.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`; };
      const up = () => {
        document.removeEventListener("pointermove", move);
        document.removeEventListener("pointerup", up);
        document.removeEventListener("pointercancel", up);
        card.style.transform = "";
        if (Math.abs(dx) > 70) commit(dx > 0 ? "yay" : "nay");
      };
      document.addEventListener("pointermove", move);
      document.addEventListener("pointerup", up);
      document.addEventListener("pointercancel", up);
    });
  }

  function render() {
    els.tabs.forEach((tab) => tab.classList.toggle("is-active", tab.dataset.view === view));
    els.views.forEach((section) => { section.hidden = section.dataset.view !== view; });
    els.mineMeta.textContent = `${cast.length} cast · ${Object.values(mined.usage).reduce((a, b) => a + b, 0)} placements mined · ${KINDS.length} kinds`;
    els.comboMeta.textContent = metaLine("combos");
    els.pieceMeta.textContent = metaLine("pieces");
    if (view === "combos") {
      els.comboReport.innerHTML = reportMarkup("combos");
      els.comboStage.innerHTML = stageMarkup("combos");
      bindStage(els.comboStage);
      if (window.matchMedia("(hover: hover)").matches) document.querySelector("#hairNote")?.focus({ preventScroll: true });
    }
    if (view === "pieces") {
      els.pieceReport.innerHTML = reportMarkup("pieces");
      els.pieceStage.innerHTML = stageMarkup("pieces");
      bindStage(els.pieceStage);
      if (window.matchMedia("(hover: hover)").matches) document.querySelector("#hairNote")?.focus({ preventScroll: true });
    }
    if (view === "catalogue") catalogueMarkup();
  }

  els.tabs.forEach((tab) => tab.addEventListener("click", () => { view = tab.dataset.view; draft = { tags: [], note: "" }; render(); }));
  els.undo.addEventListener("click", undo);
  els.skip.addEventListener("click", skip);
  els.export.addEventListener("click", () => {
    const payload = JSON.stringify({ exported: new Date().toISOString(), tagVocabulary: TAGS, mined: { usage: mined.usage, pairs: mined.pairs }, ...store }, null, 2);
    const blob = new Blob([payload], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "who-did-you-make-hair-ratings.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  });
  els.clear.addEventListener("click", () => {
    if (!confirm("Wipe every hair rating (combos + pieces + catalogue)?")) return;
    store = { v: 1, combos: {}, pieces: {} };
    lastAction = null;
    saveStore();
    render();
  });
  document.addEventListener("click", (event) => {
    const cull = event.target.closest(".cat-cull");
    if (!cull) return;
    // A cull is a changed mind, not lost data: flip to nay (tagged) so the deck won't re-deal it
    // and the export still records the second thought.
    const rating = decks[cull.dataset.deck].bucket()[cull.dataset.id];
    if (rating) {
      rating.verdict = "nay";
      rating.tags = [...new Set([...(rating.tags || []), "CULLED"])];
    }
    saveStore();
    render();
  });
  document.addEventListener("keydown", (event) => {
    if (view === "catalogue") return;
    if (event.key === "ArrowLeft") { event.preventDefault(); commit("nay"); }
    else if (event.key === "ArrowRight") { event.preventDefault(); commit("yay"); }
    else if (event.key === "ArrowDown") { event.preventDefault(); skip(); }
  });

  render();

  // Probe surface for browser verification + CI specs (not used by the UI).
  window.hairStudio = { mined, makeCombo, makePiece, lockSpaceToPortrait, lockPolys, sampleInstance, MANNEQUIN, HEADS, comboTraits, pieceContexts };
})();
