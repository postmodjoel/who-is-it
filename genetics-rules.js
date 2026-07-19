// Pure deterministic heredity + player-authored lineage rules for WHO? WERE YOU? (engine v2).
// One player (the Maker) breeds 8 synthetic founders -> 2 parents -> 1 descendant; everyone else
// reconstructs the four founders and their pairing. This module deliberately has no DOM,
// localStorage, network, Date.now, Math.random, or mutable app-state dependencies: every output
// is a pure function of its inputs, so rounds serialize, resume, and replay bit-for-bit.
(function installGeneticsRules(root) {
  const ENGINE_VERSION = 2;   // inheritance maths (dominance, bundles, side-specific)
  const MODE_VERSION = 2;     // rotating maker-versus-guesser round shape
  const FOUNDER_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H"];

  // Fairness margins are percentage points of descendant similarity between the true
  // configuration (always 100 by construction) and the best wrong configuration.
  // Calibrated 2026-07 over 36 arbitrary lineages: margins ran 5.0-11.6 (median 8.8),
  // so readable=6 blocks ~8% of careless configs while strong=10 stays attainable (~28%).
  const FAIRNESS_MARGINS = { strong: 10, readable: 6 };

  const SKIN_HEX = ["#f4c9a6", "#efbd94", "#c39b6a", "#c88968", "#ad704e", "#865335", "#5b341f", "#3f2417"];
  const HAIR_HEX = ["#151313", "#101820", "#342016", "#5a3320", "#974526", "#c7532c", "#dba74d", "#a9a39b"];
  const EYE_HEX = ["#3e2b1e", "#5a3d28", "#7a5530", "#8a5a24", "#3f6048", "#45698f", "#5f7386", "#6e6f72"];
  const BACKGROUNDS = ["#a9c4e0", "#eeb6bd", "#9fccb0", "#e3b4ab", "#bcd09a", "#e8d4a1", "#bfdce6", "#c6b9e0"];
  const STANDARD_SHIRT = "#8d95a6";   // one visually quiet outfit colour for every synthetic face

  const HAIR_FAMILY_STYLES = {
    none: ["bald"],
    straight: ["cropped", "bob", "sidePart"],
    wavy: ["messy", "longWaves"],
    curly: ["curls", "coily"],
    locs: ["locs"]
  };
  const HAIR_FAMILIES = Object.keys(HAIR_FAMILY_STYLES);
  // Adjacent texture families read as related; bald reads as its own striking statement.
  const HAIR_FAMILY_AXIS = { straight: 0, wavy: 1, curly: 2, locs: 3 };

  // Seeded contribution weights: each trait GROUP in a child leans one of these amounts toward
  // parent B. Never 0.5 - exact averaging would make ancestry pairings mathematically irrelevant
  // (((A+B)/2+(C+D)/2)/2 === (A+B+C+D)/4), and the guessing game depends on pairing structure.
  const WEIGHT_STEPS = [0.35, 0.45, 0.55, 0.65];

  // ---------------------------------------------------------------------------
  // Trait registry. Modes:
  //   blend           proportion lerped by the group weight (plus a whisper of seeded mutation)
  //   dominant        quirk kept 78-92% from one parent so it never averages away to zero
  //   sideSpecific    left/right variants inherit independently - each side chiefly one parent
  //   categorical     one parent's discrete option, picked by the group weight
  //   perceptualColor LAB-space blend
  // `group` is the bundle: one seeded weight per group keeps correlated features coherent.
  // `spread` is the restrained founder jitter (fraction of half-range); `signature: true`
  // marks traits eligible for a founder's pushed-to-the-edge signature feature.
  // ---------------------------------------------------------------------------
  const TRAIT_REGISTRY = [
    { key: "headScaleX", label: "head width", group: "headFrame", mode: "blend", min: 0.85, max: 1.18, base: 1, weight: 1.1, spread: 0.45 },
    { key: "headScaleY", label: "head height", group: "headFrame", mode: "blend", min: 0.85, max: 1.18, base: 1, weight: 1.1, spread: 0.45 },
    { key: "headY", label: "head position", group: "headFrame", mode: "blend", min: -10, max: 10, base: 0, weight: 0.5, spread: 0.2 },
    { key: "headTilt", label: "head tilt", group: "headTilt", mode: "dominant", min: -12, max: 12, base: 0, weight: 1.3, spread: 0.16 },

    { key: "neckWidth", label: "neck width", group: "neck", mode: "blend", min: 0.72, max: 1.38, base: 1, weight: 1.3, spread: 0.7, signature: true },
    { key: "neckTaper", label: "neck taper", group: "neck", mode: "blend", min: -1, max: 1, base: 0, weight: 0.8, spread: 0.4 },
    { key: "neckLength", label: "neck length", group: "neck", mode: "blend", min: -8, max: 16, base: 0, weight: 0.9, spread: 0.6, signature: true },
    { key: "neckTerminationY", label: "neck join depth", group: "neck", mode: "blend", min: -6, max: 12, base: 0, weight: 0.5, spread: 0.3 },

    { key: "eyeGap", label: "eye spacing", group: "eyeCore", mode: "blend", min: 40, max: 62, base: 47, weight: 1.25, spread: 0.6, signature: true },
    { key: "eyeScale", label: "eye size", group: "eyeCore", mode: "blend", min: 0.7, max: 1.25, base: 0.94, weight: 1.25, spread: 0.5, signature: true },
    { key: "eyeOpen", label: "eye openness", group: "eyeCore", mode: "blend", min: 0.5, max: 1.2, base: 0.95, weight: 1, spread: 0.6, signature: true },
    { key: "irisScale", label: "iris size", group: "eyeCore", mode: "blend", min: 0.7, max: 1.2, base: 0.92, weight: 0.8, spread: 0.4 },
    { key: "eyeX", label: "eye group x", group: "eyePlacement", mode: "blend", min: -12, max: 12, base: 0, weight: 0.5, spread: 0.2 },
    { key: "eyeY", label: "eye group height", group: "eyePlacement", mode: "blend", min: -8, max: 8, base: 0, weight: 0.7, spread: 0.3 },
    { key: "eyeLeftX", label: "left-eye x", group: "eyeAsym", mode: "sideSpecific", side: "left", min: -12, max: 12, base: 0, weight: 0.6, spread: 0.14 },
    { key: "eyeLeftY", label: "left-eye height", group: "eyeAsym", mode: "sideSpecific", side: "left", min: -8, max: 8, base: 0, weight: 0.8, spread: 0.16 },
    { key: "eyeRightX", label: "right-eye x", group: "eyeAsym", mode: "sideSpecific", side: "right", min: -12, max: 12, base: 0, weight: 0.6, spread: 0.14 },
    { key: "eyeRightY", label: "right-eye height", group: "eyeAsym", mode: "sideSpecific", side: "right", min: -8, max: 8, base: 0, weight: 0.8, spread: 0.16 },
    { key: "lazyEye", label: "lazy eye", group: "lazyEye", mode: "dominant", min: -8, max: 8, base: 0, weight: 1.2, spread: 0.1 },
    { key: "pupilX", label: "pupil x", group: "pupil", mode: "dominant", min: -5, max: 5, base: 0, weight: 0.45, spread: 0.16 },
    { key: "pupilY", label: "pupil y", group: "pupil", mode: "dominant", min: -5, max: 5, base: 0, weight: 0.4, spread: 0.14 },
    { key: "upperEyelidWidth", label: "upper eyelid", group: "eyelids", mode: "blend", min: 0.6, max: 3.8, base: 1.2, weight: 0.6, spread: 0.2 },
    { key: "lowerEyelidWidth", label: "lower eyelid", group: "eyelids", mode: "blend", min: 0.5, max: 3, base: 1, weight: 0.55, spread: 0.22 },
    { key: "eyeColor", label: "eye colour", group: "eyeColor", mode: "perceptualColor", weight: 1.2 },

    { key: "browShape", label: "brow shape", group: "browCore", mode: "categorical", options: ["soft", "flat", "arched", "thick", "bushy", "thin", "angular"], weight: 1.3, signature: true },
    { key: "browY", label: "brow height", group: "browCore", mode: "blend", min: -6, max: 6, base: 0, weight: 0.8, spread: 0.35 },
    { key: "browScaleX", label: "brow width", group: "browCore", mode: "blend", min: 0.8, max: 1.25, base: 1, weight: 0.8, spread: 0.3 },
    { key: "browThick", label: "brow thickness", group: "browCore", mode: "blend", min: 0.5, max: 2, base: 1, weight: 1.2, spread: 0.5, signature: true },
    { key: "browAngle", label: "brow angle", group: "browAngle", mode: "dominant", min: -25, max: 25, base: 0, weight: 1.1, spread: 0.2 },
    { key: "browLeftAngle", label: "left-brow angle", group: "browAsym", mode: "sideSpecific", side: "left", min: -30, max: 30, base: 0, weight: 0.8, spread: 0.12 },
    { key: "browRightAngle", label: "right-brow angle", group: "browAsym", mode: "sideSpecific", side: "right", min: -30, max: 30, base: 0, weight: 0.8, spread: 0.12 },

    { key: "noseY", label: "nose height", group: "nose", mode: "blend", min: -8, max: 10, base: 0, weight: 0.8, spread: 0.35 },
    { key: "noseScale", label: "nose size", group: "nose", mode: "blend", min: 0.6, max: 1.5, base: 1, weight: 1.3, spread: 0.7, signature: true },
    { key: "noseLength", label: "nose length", group: "nose", mode: "blend", min: 0.65, max: 1.5, base: 1, weight: 1.2, spread: 0.7, signature: true },
    { key: "noseWidth", label: "nose width", group: "nose", mode: "blend", min: 0.55, max: 1.5, base: 1, weight: 1.3, spread: 0.7, signature: true },
    { key: "noseTip", label: "nose tip", group: "nose", mode: "categorical", options: ["round", "narrow", "pointed", "straight", "button", "upturned"], weight: 1.2, signature: true },

    { key: "mouthY", label: "mouth height", group: "mouth", mode: "blend", min: -16, max: 18, base: 0, weight: 0.7, spread: 0.18 },
    { key: "mouthScale", label: "mouth width", group: "mouth", mode: "blend", min: 0.72, max: 1.28, base: 1, weight: 1.2, spread: 0.7, signature: true },
    { key: "lips", label: "lip shape", group: "mouth", mode: "categorical", options: ["line", "soft", "full"], weight: 1 },
    { key: "lipUpper", label: "upper lip shape", group: "mouth", mode: "categorical", options: ["soft", "cupid", "flat", "peaked", "heavy"], weight: 0.9 },
    { key: "lipLower", label: "lower lip shape", group: "mouth", mode: "categorical", options: ["round", "pillow", "wide", "flat"], weight: 0.9 },
    { key: "lipUpperSize", label: "upper lip size", group: "mouth", mode: "blend", min: 0.4, max: 1.8, base: 1, weight: 1, spread: 0.45, signature: true },
    { key: "lipLowerSize", label: "lower lip size", group: "mouth", mode: "blend", min: 0.4, max: 1.8, base: 1, weight: 1, spread: 0.35, signature: true },

    { key: "jawLength", label: "jaw length", group: "jawChin", mode: "blend", min: -0.25, max: 0.4, base: 0, weight: 1.1, spread: 0.7, signature: true },
    { key: "chinY", label: "chin position", group: "jawChin", mode: "blend", min: -16, max: 18, base: 0, weight: 0.6, spread: 0.15 },
    { key: "chinWidth", label: "chin width", group: "jawChin", mode: "blend", min: 0.6, max: 1.7, base: 1, weight: 1.1, spread: 0.7, signature: true },
    { key: "chinScale", label: "chin size", group: "jawChin", mode: "blend", min: 0.5, max: 2, base: 1, weight: 1, spread: 0.6, signature: true },
    { key: "chinShape", label: "chin shape", group: "jawChin", mode: "categorical", options: ["none", "round", "square", "dimple", "pointed"], weight: 1 },

    { key: "earScale", label: "ear size", group: "ears", mode: "blend", min: 0.7, max: 1.3, base: 1, weight: 1.1, spread: 0.7, signature: true },
    { key: "earY", label: "ear height", group: "ears", mode: "blend", min: -10, max: 10, base: 0, weight: 0.6, spread: 0.3 },
    { key: "earX", label: "ear spacing", group: "ears", mode: "blend", min: -12, max: 12, base: 0, weight: 0.5, spread: 0.25 },
    { key: "earRot", label: "ear rotation", group: "earRot", mode: "dominant", min: -20, max: 20, base: 0, weight: 0.9, spread: 0.2, signature: true },
    { key: "earVariant", label: "ear shape", group: "ears", mode: "categorical", options: ["round", "attached", "narrow", "lobe"], weight: 0.8 },
    { key: "earLeftX", label: "left-ear x", group: "earAsym", mode: "sideSpecific", side: "left", min: -14, max: 14, base: 0, weight: 0.45, spread: 0.1 },
    { key: "earLeftY", label: "left-ear height", group: "earAsym", mode: "sideSpecific", side: "left", min: -14, max: 14, base: 0, weight: 0.5, spread: 0.12 },
    { key: "earRightX", label: "right-ear x", group: "earAsym", mode: "sideSpecific", side: "right", min: -14, max: 14, base: 0, weight: 0.45, spread: 0.1 },
    { key: "earRightY", label: "right-ear height", group: "earAsym", mode: "sideSpecific", side: "right", min: -14, max: 14, base: 0, weight: 0.5, spread: 0.12 },

    { key: "build", label: "build", group: "body", mode: "blend", min: 60, max: 100, base: 83, weight: 1.3, spread: 0.75, signature: true },
    { key: "shoulderSlope", label: "shoulder slope", group: "body", mode: "blend", min: 0, max: 1, base: 0.6, weight: 1, spread: 0.7, signature: true },
    { key: "bodyWidth", label: "torso width", group: "body", mode: "blend", min: 0.7, max: 1.4, base: 1, weight: 1.2, spread: 0.55, signature: true },

    { key: "faceShape", label: "face shape", group: "faceShape", mode: "categorical", options: ["oval", "round", "heart", "square", "long"], weight: 1.5, signature: true },
    { key: "skinColor", label: "skin tone", group: "skin", mode: "perceptualColor", weight: 2.6 },
    { key: "hairColor", label: "hair colour", group: "hairColorGroup", mode: "perceptualColor", weight: 2 },
    { key: "hairFamily", label: "hair texture", group: "hairTexture", mode: "categorical", options: HAIR_FAMILIES, weight: 1.7, signature: true },
    { key: "frontHairY", label: "hairline", group: "hairline", mode: "blend", min: -18, max: 18, base: 0, weight: 0.5, spread: 0.5 }
  ];

  const REGISTRY_BY_KEY = Object.fromEntries(TRAIT_REGISTRY.map((entry) => [entry.key, entry]));
  const GROUP_ORDER = [...new Set(TRAIT_REGISTRY.map((entry) => entry.group))];
  const SIDE_GROUPS = [...new Set(TRAIT_REGISTRY.filter((entry) => entry.mode === "sideSpecific").map((entry) => entry.group))];

  // ---------------------------------------------------------------------------
  // Small pure helpers (identical hashing/rng to engine v1 so seeds stay portable).
  // ---------------------------------------------------------------------------
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const clone = (value) => JSON.parse(JSON.stringify(value));
  const cleanHex = (value, fallback) => /^#[0-9a-f]{6}$/i.test(String(value || "")) ? String(value).toLowerCase() : fallback;
  const number = (value, fallback) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round3 = (value) => +Number(value).toFixed(3);

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || "");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function seeded(seed) {
    let value = stableHash(seed) || 0x9e3779b9;
    return () => {
      value += 0x6d2b79f5;
      let out = value;
      out = Math.imul(out ^ (out >>> 15), out | 1);
      out ^= out + Math.imul(out ^ (out >>> 7), out | 61);
      return ((out ^ (out >>> 14)) >>> 0) / 4294967296;
    };
  }

  function srgbToLinear(value) {
    const channel = value / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  }

  function linearToSrgb(value) {
    const channel = value <= 0.0031308 ? value * 12.92 : 1.055 * (value ** (1 / 2.4)) - 0.055;
    return clamp(Math.round(channel * 255), 0, 255);
  }

  function hexToLab(hex) {
    const n = parseInt(cleanHex(hex, "#808080").slice(1), 16);
    const r = srgbToLinear((n >> 16) & 255);
    const g = srgbToLinear((n >> 8) & 255);
    const b = srgbToLinear(n & 255);
    const x = (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047;
    const y = (r * 0.2126 + g * 0.7152 + b * 0.0722);
    const z = (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883;
    const f = (v) => v > 0.008856 ? v ** (1 / 3) : 7.787 * v + 16 / 116;
    const fx = f(x), fy = f(y), fz = f(z);
    return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
  }

  function labToHex(lab) {
    const fy = (lab[0] + 16) / 116;
    const fx = lab[1] / 500 + fy;
    const fz = fy - lab[2] / 200;
    const inv = (v) => v ** 3 > 0.008856 ? v ** 3 : (v - 16 / 116) / 7.787;
    const x = 0.95047 * inv(fx);
    const y = inv(fy);
    const z = 1.08883 * inv(fz);
    const r = linearToSrgb(x * 3.2406 + y * -1.5372 + z * -0.4986);
    const g = linearToSrgb(x * -0.9689 + y * 1.8758 + z * 0.0415);
    const b = linearToSrgb(x * 0.0557 + y * -0.204 + z * 1.057);
    return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, "0")).join("")}`;
  }

  function mixPerceptual(a, b, amount = 0.5) {
    const left = hexToLab(a), right = hexToLab(b);
    return labToHex(left.map((value, index) => value + (right[index] - value) * amount));
  }

  function colorDistance(a, b) {
    const left = hexToLab(a), right = hexToLab(b);
    return Math.sqrt(left.reduce((sum, value, index) => sum + ((value - right[index]) ** 2), 0));
  }

  // ---------------------------------------------------------------------------
  // Rendering bridge: phenotype -> face-generator trait object with every
  // presentation channel standardised (quiet tee, flat backdrop, neutral, still).
  // ---------------------------------------------------------------------------
  function hairStyleFor(family, styleHint) {
    const styles = HAIR_FAMILY_STYLES[family] || HAIR_FAMILY_STYLES.straight;
    return styles.includes(styleHint) ? styleHint : styles[0];
  }

  function phenotypeToTraits(phenotype, options = {}) {
    const traits = {
      skinHex: cleanHex(phenotype.skinColor, "#c88968"),
      hairHex: cleanHex(phenotype.hairColor, "#342016"),
      hairColor: "darkBrown",
      eyeColor: cleanHex(phenotype.eyeColor, "#5a3d28"),
      hair: hairStyleFor(phenotype.hairFamily, phenotype.hairStyle),
      clothing: "tee",
      shirt: STANDARD_SHIRT,
      background: cleanHex(options.background, BACKGROUNDS[0]),
      accessory: "none",
      expression: "neutral",
      animMode: "still",
      beardLength: 0,
      moustacheScale: 0,
      jewelleryItems: [],
      tattoos: [],
      tattooText: "",
      blushOpacity: 0,
      eyeshadowOpacity: 0,
      cheekOpacity: 0,
      faceLineOpacity: 0,
      lashes: 0,
      eyeDart: 0
    };
    TRAIT_REGISTRY.forEach((entry) => {
      if (entry.mode === "perceptualColor") return;
      if (entry.mode === "categorical") {
        if (entry.key !== "hairFamily") traits[entry.key] = String(phenotype[entry.key] ?? entry.options[0]);
        return;
      }
      traits[entry.key] = round3(clamp(number(phenotype[entry.key], entry.base), entry.min, entry.max));
    });
    return traits;
  }

  // ---------------------------------------------------------------------------
  // Synthetic founder generation. Restrained base faces (small jitter around the
  // neutral base) plus two or three pushed "signature" features per founder, so
  // every face carries a few readable structural tells instead of uniform noise.
  // ---------------------------------------------------------------------------
  const SIGNATURE_MOVES = (() => {
    const moves = TRAIT_REGISTRY
      .filter((entry) => entry.signature && entry.mode !== "categorical")
      .map((entry) => ({
        name: entry.key,
        group: entry.group,
        label: entry.label,
        apply(phenotype, rng, direction) {
          const half = (entry.max - entry.min) / 2;
          const push = half * (0.45 + rng() * 0.3);
          rng();   // keep the rng stride identical across move kinds
          phenotype[entry.key] = round3(clamp(entry.base + direction * push, entry.min, entry.max));
        }
      }));
    moves.push(
      {
        name: "eyeAsym", group: "eyeAsym", label: "uneven eyes",
        apply(phenotype, rng, direction) {
          phenotype.eyeLeftY = round3(clamp(direction * (1.8 + rng() * 1.8), -8, 8));
          phenotype.eyeRightY = round3(clamp(-direction * (0.5 + rng() * 1.0), -8, 8));
        }
      },
      {
        name: "lazyEyeQuirk", group: "lazyEye", label: "wandering eye",
        apply(phenotype, rng, direction) {
          phenotype.lazyEye = round3(clamp(direction * (1.8 + rng() * 1.8), -8, 8));
          rng();
        }
      },
      {
        name: "browAsym", group: "browAsym", label: "uneven brows",
        apply(phenotype, rng, direction) {
          phenotype.browLeftAngle = round3(clamp(direction * (13 + rng() * 11), -30, 30));
          phenotype.browRightAngle = round3(clamp(-direction * (3 + rng() * 7), -30, 30));
        }
      },
      {
        name: "earAsym", group: "earAsym", label: "uneven ears",
        apply(phenotype, rng, direction) {
          phenotype.earLeftY = round3(clamp(direction * (5 + rng() * 6), -14, 14));
          phenotype.earRightY = round3(clamp(-direction * (2 + rng() * 4), -14, 14));
        }
      },
      {
        name: "tiltQuirk", group: "headTilt", label: "head tilt",
        apply(phenotype, rng, direction) {
          phenotype.headTilt = round3(clamp(direction * (6 + rng() * 5), -12, 12));
          rng();
        }
      }
    );
    return moves;
  })();

  // Accent hair pieces ("locks") for synthetic founders. Placements are lifted from the
  // hand-baked cast compositions, so generated locks sit where a human would put them;
  // generation only jitters them slightly. Rendered via traits.hairLocks (faces-hair.js).
  const LOCK_PRESETS = [
    { lock: "longSideLock", x: 56, y: 26, scale: 0.4, rot: -111 }, { lock: "sideSwoop", x: 67, y: 32, scale: 0.42, rot: -52 },
    { lock: "curtainBangs", x: 54, y: 41, scale: 0.52, rot: -7 }, { lock: "curlyForelock", x: 65, y: 43, scale: 0.56, rot: 13 }
  ];

  function pickPaletteColor(palette, rng) {
    const pick = palette[Math.floor(rng() * palette.length) % palette.length];
    const neighbour = palette[Math.floor(rng() * palette.length) % palette.length];
    return mixPerceptual(pick, neighbour, 0.12);   // tiny nudge so pool colours aren't 8 exact hexes
  }

  function generateFounder(seed, index) {
    const founderSeed = `${seed}:founder:${index}`;
    const rng = seeded(founderSeed);
    const phenotype = {};
    TRAIT_REGISTRY.forEach((entry) => {
      if (entry.mode === "perceptualColor") {
        const palette = entry.key === "skinColor" ? SKIN_HEX : entry.key === "hairColor" ? HAIR_HEX : EYE_HEX;
        phenotype[entry.key] = pickPaletteColor(palette, rng);
        return;
      }
      if (entry.mode === "categorical") {
        if (entry.key === "hairFamily") {
          const roll = rng();
          phenotype.hairFamily = roll < 0.08 ? "none" : roll < 0.42 ? "straight" : roll < 0.72 ? "wavy" : roll < 0.84 ? "curly" : "locs";
        } else {
          phenotype[entry.key] = entry.options[Math.floor(rng() * entry.options.length) % entry.options.length];
        }
        return;
      }
      const half = (entry.max - entry.min) / 2;
      const jitter = (rng() * 2 - 1) * half * (entry.spread ?? 0.32);
      phenotype[entry.key] = round3(clamp(entry.base + jitter, entry.min, entry.max));
    });
    const familyStyles = HAIR_FAMILY_STYLES[phenotype.hairFamily];
    phenotype.hairStyle = familyStyles[Math.floor(rng() * familyStyles.length) % familyStyles.length];

    // Three or four signature features, chosen by per-founder hash order, one per trait group.
    const signatureCount = 3 + (rng() < 0.4 ? 1 : 0);
    const ordered = SIGNATURE_MOVES.slice().sort((a, b) =>
      stableHash(`${founderSeed}:sig:${a.name}`) - stableHash(`${founderSeed}:sig:${b.name}`));
    const signatures = [];
    for (const move of ordered) {
      if (signatures.length >= signatureCount) break;
      if (signatures.some((existing) => existing.group === move.group)) continue;
      const direction = rng() < 0.5 ? -1 : 1;
      move.apply(phenotype, rng, direction);
      signatures.push({ name: move.name, group: move.group, label: move.label, direction });
    }

    // Accent locks: roughly a third of haired strangers wear 1-2 composed pieces,
    // jittered around hand-baked placements. They ride as HAIR extras, exactly like
    // a cast donor's, so the draft steals them along with the hair.
    const extras = { hair: {} };
    if (phenotype.hairFamily !== "none" && rng() < 0.7) {
      const lockCount = rng() < 0.45 ? 1 : 2;
      const picks = [];
      for (let i = 0; i < lockCount; i += 1) {
        const preset = LOCK_PRESETS[Math.floor(rng() * LOCK_PRESETS.length) % LOCK_PRESETS.length];
        picks.push({
          lock: preset.lock,
          x: round3(preset.x + (rng() * 2 - 1) * 4),
          y: round3(preset.y + (rng() * 2 - 1) * 3),
          scale: round3(clamp(preset.scale + (rng() * 2 - 1) * 0.05, 0.2, 1.2)),
          rot: Math.round(preset.rot + (rng() * 2 - 1) * 8)
        });
      }
      extras.hair.hairLocks = picks;
    }

    return {
      id: `wwy-pool-${stableHash(founderSeed).toString(36)}`,
      sourceId: null,
      name: `Stranger ${index + 1}`,
      label: "",
      generation: 2,
      parentIds: [],
      phenotype,
      signatures,
      extras,
      traits: { ...phenotypeToTraits(phenotype, {}), ...extras.hair },
      provenance: {},
      groupWeights: {},
      isFounder: true
    };
  }

  function generateFounderPool(seed, count = 24) {
    return Array.from({ length: count }, (_, index) => generateFounder(seed, index));
  }

  // ---------------------------------------------------------------------------
  // Phenotype similarity (0-100, registry-weighted). Drives founder-board
  // diversity, the 210-configuration fairness sweep, and compatibility scoring.
  // ---------------------------------------------------------------------------
  function traitSimilarity(entry, left, right) {
    if (entry.mode === "perceptualColor") {
      const fallback = entry.key === "skinColor" ? "#c88968" : entry.key === "hairColor" ? "#342016" : "#5a3d28";
      return 1 - clamp(colorDistance(left[entry.key] || fallback, right[entry.key] || fallback) / 62, 0, 1);
    }
    if (entry.mode === "categorical") {
      const a = left[entry.key], b = right[entry.key];
      if (a === b) return 1;
      if (entry.key === "hairFamily" && a in HAIR_FAMILY_AXIS && b in HAIR_FAMILY_AXIS) {
        return Math.abs(HAIR_FAMILY_AXIS[a] - HAIR_FAMILY_AXIS[b]) === 1 ? 0.45 : 0;
      }
      return 0;
    }
    const range = entry.max - entry.min;
    return 1 - clamp(Math.abs(number(left[entry.key], entry.base) - number(right[entry.key], entry.base)) / range, 0, 1);
  }

  function phenotypeSimilarity(nodeA, nodeB) {
    const left = nodeA?.phenotype || nodeA || {};
    const right = nodeB?.phenotype || nodeB || {};
    let score = 0;
    let weight = 0;
    TRAIT_REGISTRY.forEach((entry) => {
      score += traitSimilarity(entry, left, right) * entry.weight;
      weight += entry.weight;
    });
    return +(100 * score / weight).toFixed(2);
  }

  function selectDistinctFounders(pool, count = 8) {
    if (!Array.isArray(pool) || pool.length < count) throw new Error(`Need a pool of at least ${count} founders`);
    const distance = (a, b) => 100 - phenotypeSimilarity(a, b);
    // Greedy maximin from a handful of deterministic starts; keep whichever selection
    // holds the largest worst-case pairwise distance (rejects near-twin boards).
    let best = null;
    for (let start = 0; start < Math.min(6, pool.length); start += 1) {
      const picked = [pool[start]];
      const remaining = pool.filter((_, index) => index !== start);
      while (picked.length < count) {
        let bestIndex = 0;
        let bestScore = -1;
        remaining.forEach((candidate, index) => {
          const nearest = Math.min(...picked.map((chosen) => distance(candidate, chosen)));
          if (nearest > bestScore) { bestScore = nearest; bestIndex = index; }
        });
        picked.push(remaining.splice(bestIndex, 1)[0]);
      }
      let minPair = Infinity;
      for (let i = 0; i < picked.length; i += 1) {
        for (let j = i + 1; j < picked.length; j += 1) minPair = Math.min(minPair, distance(picked[i], picked[j]));
      }
      if (!best || minPair > best.minPair) best = { picked, minPair };
    }
    return best.picked.map((node) => clone(node));
  }

  // ---------------------------------------------------------------------------
  // Inheritance. One seeded weight per trait group (bundles), dominance for
  // quirks, independent left/right sides, categorical picks, LAB colour blends.
  // ---------------------------------------------------------------------------
  function breedChild(parentA, parentB, options = {}) {
    if (!parentA?.phenotype || !parentB?.phenotype) throw new Error("breedChild needs two phenotype-bearing parents");
    const seedValue = String(options.seed || `${parentA.id}+${parentB.id}`);
    const rng = seeded(seedValue);
    const a = parentA.phenotype;
    const b = parentB.phenotype;
    const phenotype = {};
    const provenance = {};

    // 1) Bundle weights: every group leans 35/45/55/65 toward parent B, recorded once.
    const groupWeights = {};
    GROUP_ORDER.forEach((group) => {
      groupWeights[group] = WEIGHT_STEPS[Math.floor(rng() * WEIGHT_STEPS.length) % WEIGHT_STEPS.length];
    });
    // 2) Side ownership: each asymmetry bundle hands its left side chiefly to one parent
    //    and its right side to the other, so founder asymmetry survives instead of averaging.
    const sideOwner = {};
    SIDE_GROUPS.forEach((group) => {
      const leftFromB = rng() < 0.5;
      sideOwner[group] = { left: leftFromB ? "B" : "A", right: leftFromB ? "A" : "B" };
    });

    TRAIT_REGISTRY.forEach((entry) => {
      const w = groupWeights[entry.group];
      if (entry.mode === "perceptualColor") {
        const fallback = entry.key === "skinColor" ? "#c88968" : entry.key === "hairColor" ? "#342016" : "#5a3d28";
        const amount = clamp(w + (rng() - 0.5) * 0.08, 0.3, 0.7);
        phenotype[entry.key] = mixPerceptual(a[entry.key] || fallback, b[entry.key] || fallback, amount);
        provenance[entry.key] = { mode: "blend", label: entry.label, group: entry.group, parents: [parentA.id, parentB.id], amount: round3(amount) };
        return;
      }
      if (entry.mode === "categorical") {
        const fromB = rng() < w;
        phenotype[entry.key] = String((fromB ? b[entry.key] : a[entry.key]) ?? entry.options[0]);
        provenance[entry.key] = { mode: "inherited", label: entry.label, group: entry.group, parent: fromB ? parentB.id : parentA.id };
        return;
      }
      const av = number(a[entry.key], entry.base);
      const bv = number(b[entry.key], entry.base);
      if (entry.mode === "dominant") {
        const fromB = w > 0.5;
        const keep = 0.78 + rng() * 0.14;
        const value = (fromB ? bv : av) * keep + (fromB ? av : bv) * (1 - keep);
        phenotype[entry.key] = round3(clamp(value, entry.min, entry.max));
        provenance[entry.key] = { mode: "dominant", label: entry.label, group: entry.group, parent: fromB ? parentB.id : parentA.id, keep: round3(keep) };
        return;
      }
      if (entry.mode === "sideSpecific") {
        const fromB = sideOwner[entry.group][entry.side] === "B";
        const keep = 0.7 + rng() * 0.2;
        const value = (fromB ? bv : av) * keep + (fromB ? av : bv) * (1 - keep);
        phenotype[entry.key] = round3(clamp(value, entry.min, entry.max));
        provenance[entry.key] = { mode: "sideSpecific", label: entry.label, group: entry.group, side: entry.side, parent: fromB ? parentB.id : parentA.id, keep: round3(keep) };
        return;
      }
      // blend: bundle-weighted lerp plus a whisper of seeded mutation so siblings differ.
      const mutation = (rng() * 2 - 1) * (entry.max - entry.min) * 0.02;
      const value = av * (1 - w) + bv * w + mutation;
      phenotype[entry.key] = round3(clamp(value, entry.min, entry.max));
      provenance[entry.key] = { mode: "blend", label: entry.label, group: entry.group, parents: [parentA.id, parentB.id], amount: w };
    });

    const familyStyles = HAIR_FAMILY_STYLES[phenotype.hairFamily] || HAIR_FAMILY_STYLES.straight;
    phenotype.hairStyle = familyStyles[Math.floor(rng() * familyStyles.length) % familyStyles.length];

    const id = String(options.id || `child-${stableHash(seedValue).toString(36)}`);
    return {
      id,
      sourceId: null,
      name: String(options.name || "Descendant"),
      label: "",
      generation: options.generation ?? Math.max(0, Math.min(parentA.generation ?? 1, parentB.generation ?? 1) - 1),
      parentIds: [parentA.id, parentB.id],
      phenotype,
      traits: phenotypeToTraits(phenotype, { background: options.background || parentA.traits?.background }),
      provenance,
      groupWeights,
      isFounder: false
    };
  }

  // ---------------------------------------------------------------------------
  // Lineage construction. Couples and couple order are canonicalised into the
  // breeding seeds, so founder order within a couple and couple order never
  // change the resulting faces - only WHICH four founders and HOW they pair.
  // ---------------------------------------------------------------------------
  function coupleKey(pair) {
    return pair.slice().sort().join("+");
  }

  function canonicalConfig(pairs) {
    const couples = pairs.map((pair) => pair.slice().sort()).sort((left, right) => left[0].localeCompare(right[0]));
    return { pairs: couples, key: couples.map((pair) => pair.join("+")).join("|") };
  }

  function validatePairs(founders, pairs) {
    if (!Array.isArray(pairs) || pairs.length !== 2) throw new Error("A lineage needs exactly two couples");
    const ids = pairs.flat();
    if (ids.length !== 4 || new Set(ids).size !== 4) throw new Error("The four founders must be different people");
    const byId = new Map(founders.map((node) => [node.id, node]));
    ids.forEach((id) => { if (!byId.has(id)) throw new Error(`Unknown founder ${id}`); });
    return byId;
  }

  // A single couple's child, seeded identically to createLineage's internal parents so a
  // half-built workbench preview is pixel-identical to the published lineage.
  function createParent(founders, pair, seed, displayName) {
    const sorted = pair.slice().sort();
    if (new Set(sorted).size !== 2) throw new Error("A couple needs two different founders");
    const byId = new Map(founders.map((node) => [node.id, node]));
    sorted.forEach((id) => { if (!byId.has(id)) throw new Error(`Unknown founder ${id}`); });
    const key = sorted.join("+");
    const parent = breedChild(byId.get(sorted[0]), byId.get(sorted[1]), {
      seed: `${seed}:parent:${key}`,
      id: `wwy-parent-${stableHash(`${seed}:${key}`).toString(36)}`,
      generation: 1
    });
    if (displayName) parent.name = displayName;
    return parent;
  }

  function createLineage(founders, pairs, seed, cache) {
    const byId = validatePairs(founders, pairs);
    const canonical = canonicalConfig(pairs);
    const parentFor = (pair) => {
      const key = coupleKey(pair);
      if (cache?.parents.has(key)) return cache.parents.get(key);
      const sorted = pair.slice().sort();
      const parent = breedChild(byId.get(sorted[0]), byId.get(sorted[1]), {
        seed: `${seed}:parent:${key}`,
        id: `wwy-parent-${stableHash(`${seed}:${key}`).toString(36)}`,
        generation: 1
      });
      if (cache) cache.parents.set(key, parent);
      return parent;
    };
    const canonicalParents = canonical.pairs.map(parentFor);
    const descendant = breedChild(canonicalParents[0], canonicalParents[1], {
      seed: `${seed}:child:${canonical.key}`,
      id: `wwy-child-${stableHash(`${seed}:${canonical.key}`).toString(36)}`,
      name: "The Descendant",
      generation: 0
    });
    // Display parents follow the maker's couple order; faces come from the canonical cache.
    const parents = pairs.map((pair, index) => ({
      ...clone(parentFor(pair)),
      name: `Parent ${index + 1}`
    }));
    return { parents, descendant, configKey: canonical.key };
  }

  // ---------------------------------------------------------------------------
  // Fairness: simulate every possible answer (choose 4 of 8 = 70, times 3
  // pairings = 210), score each simulated descendant against the real one, and
  // demand the true configuration wins by a readable margin.
  // ---------------------------------------------------------------------------
  function allConfigs(ids) {
    const configs = [];
    for (let i = 0; i < ids.length - 3; i += 1) {
      for (let j = i + 1; j < ids.length - 2; j += 1) {
        for (let k = j + 1; k < ids.length - 1; k += 1) {
          for (let l = k + 1; l < ids.length; l += 1) {
            const [a, b, c, d] = [ids[i], ids[j], ids[k], ids[l]];
            configs.push([[a, b], [c, d]], [[a, c], [b, d]], [[a, d], [b, c]]);
          }
        }
      }
    }
    return configs;
  }

  function evaluateFairness(founders, pairs, seed) {
    const actual = createLineage(founders, pairs, seed);
    const correctKey = actual.configKey;
    const cache = { parents: new Map() };
    const ranked = allConfigs(founders.map((node) => node.id)).map((config) => {
      const lineage = createLineage(founders, config, seed, cache);
      return {
        key: lineage.configKey,
        pairs: canonicalConfig(config).pairs,
        score: phenotypeSimilarity(lineage.descendant, actual.descendant),
        correct: lineage.configKey === correctKey
      };
    });
    ranked.sort((a, b) => b.score - a.score || a.key.localeCompare(b.key));
    const rank = ranked.findIndex((entry) => entry.correct) + 1;
    const bestWrong = ranked.find((entry) => !entry.correct);
    const margin = +(ranked.find((entry) => entry.correct).score - (bestWrong?.score || 0)).toFixed(2);
    const verdict = rank !== 1 ? "ambiguous"
      : margin >= FAIRNESS_MARGINS.strong ? "strong"
        : margin >= FAIRNESS_MARGINS.readable ? "readable" : "ambiguous";
    return { verdict, margin, rank, correctKey, bestWrongScore: bestWrong?.score || 0, bestWrongPairs: bestWrong?.pairs || [], configCount: ranked.length, configs: ranked };
  }

  // ---------------------------------------------------------------------------
  // Guess scoring: 15 a founder (max 60), 10 a rebuilt couple (max 20), and up
  // to 20 phenotype-compatibility points from how closely the guessed lineage's
  // own descendant resembles the real one. The exact lineage always totals 100.
  // ---------------------------------------------------------------------------
  function scoreLineageGuess(founders, actualPairs, guessPairs, seed) {
    const blank = { valid: false, score: 0, founderPoints: 0, couplePoints: 0, compatibilityPoints: 0, correctFounders: 0, correctCouples: 0, exact: false, similarity: 0 };
    let guessCanonical;
    try {
      validatePairs(founders, guessPairs);
      guessCanonical = canonicalConfig(guessPairs);
    } catch (error) {
      return blank;
    }
    const actualCanonical = canonicalConfig(actualPairs);
    const actualIds = new Set(actualCanonical.pairs.flat());
    const correctFounders = guessCanonical.pairs.flat().filter((id) => actualIds.has(id)).length;
    const actualCoupleKeys = new Set(actualCanonical.pairs.map((pair) => pair.join("+")));
    const correctCouples = guessCanonical.pairs.filter((pair) => actualCoupleKeys.has(pair.join("+"))).length;
    const exact = guessCanonical.key === actualCanonical.key;
    const actualDescendant = createLineage(founders, actualPairs, seed).descendant;
    const guessedDescendant = createLineage(founders, guessPairs, seed).descendant;
    const similarity = phenotypeSimilarity(guessedDescendant, actualDescendant);
    const compatibilityPoints = Math.round(20 * clamp((similarity - 50) / 50, 0, 1));
    const founderPoints = correctFounders * 15;
    const couplePoints = correctCouples * 10;
    return {
      valid: true,
      score: founderPoints + couplePoints + compatibilityPoints,
      founderPoints,
      couplePoints,
      compatibilityPoints,
      correctFounders,
      correctCouples,
      exact,
      similarity
    };
  }

  // ---------------------------------------------------------------------------
  // Round construction: a fully serializable, deterministic authored round.
  // ---------------------------------------------------------------------------
  function buildRound(options) {
    const sessionSeed = String(options.sessionSeed || "wwy-session");
    const roundIndex = options.roundIndex || 0;
    const reroll = options.reroll || 0;
    const seed = `${sessionSeed}:round:${roundIndex}:${reroll}`;
    const background = BACKGROUNDS[stableHash(`${seed}:bg`) % BACKGROUNDS.length];
    const pool = generateFounderPool(seed, options.poolSize || 24);
    const founders = selectDistinctFounders(pool, 8).map((node, index) => ({
      ...node,
      id: `wwy-founder-r${roundIndex}x${reroll}-${index}`,
      label: FOUNDER_LABELS[index],
      name: `Founder ${FOUNDER_LABELS[index]}`,
      traits: { ...node.traits, background }
    }));
    return {
      seed,
      roundIndex,
      reroll,
      background,
      builderIndex: options.builderIndex ?? 0,
      founders,
      builderPairs: [[], []],
      parents: [null, null],
      descendant: null,
      fairness: null,
      published: false,
      guesses: {},
      results: null
    };
  }

  // ---------------------------------------------------------------------------
  // Reveal copy: trace the strongest inherited decisions descendant -> parent ->
  // founder and phrase them like evidence ("Head tilt survived from Founder B.").
  // ---------------------------------------------------------------------------
  function founderLabelText(node) {
    return node?.label ? `Founder ${node.label}` : node?.name || "one founder";
  }

  function traitCallouts(founders, parents, descendant, limit = 6) {
    if (!descendant?.provenance) return [];
    const founderById = new Map(founders.map((node) => [node.id, node]));
    const parentById = new Map((parents || []).map((node) => [node.id, node]));
    const entries = [];
    Object.entries(descendant.provenance).forEach(([key, item]) => {
      const registry = REGISTRY_BY_KEY[key];
      if (!registry) return;
      const label = item.label.charAt(0).toUpperCase() + item.label.slice(1);
      let strength = registry.weight;
      let text = "";
      const traceFounder = (parent) => {
        const upstream = parent?.provenance?.[key];
        if (!upstream) return null;
        if (upstream.parent) return founderById.get(upstream.parent) || null;
        if (upstream.mode === "blend" && Math.abs(upstream.amount - 0.5) >= 0.1) {
          const lean = upstream.amount > 0.5 ? upstream.parents[1] : upstream.parents[0];
          return founderById.get(lean) || null;
        }
        return null;
      };
      if (item.mode === "dominant" || item.mode === "sideSpecific") {
        const parent = parentById.get(item.parent);
        const founder = traceFounder(parent);
        const verb = item.mode === "dominant" ? "survived" : "travelled";
        strength *= 1.5 + (item.keep || 0.8);
        text = founder
          ? `${label} ${verb} from ${founderLabelText(founder)} through ${parent?.name || "one parent"}.`
          : `${label} ${verb} through ${parent?.name || "one parent"}.`;
      } else if (item.mode === "inherited") {
        const parent = parentById.get(item.parent);
        const founder = traceFounder(parent);
        strength *= 1.6;
        text = founder
          ? `${label} passed down from ${founderLabelText(founder)}.`
          : `${label} passed down through ${parent?.name || "one parent"}.`;
      } else {
        const lean = Math.abs((item.amount ?? 0.5) - 0.5);
        if (lean >= 0.1) {
          const parent = parentById.get(item.amount > 0.5 ? item.parents[1] : item.parents[0]);
          const founder = traceFounder(parent);
          strength *= 1 + lean * 2;
          text = founder
            ? `${label} chiefly from ${founderLabelText(founder)}.`
            : `${label} leans toward ${parent?.name || "one parent"}.`;
        } else {
          strength *= 0.9;
          text = `${label} blended across both branches.`;
        }
      }
      entries.push({ key, group: item.group, label: item.label, text, strength: +strength.toFixed(3) });
    });
    const seenGroups = new Set();
    return entries
      .sort((a, b) => b.strength - a.strength || a.key.localeCompare(b.key))
      .filter((entry) => {
        if (seenGroups.has(entry.group)) return false;
        seenGroups.add(entry.group);
        return true;
      })
      .slice(0, limit);
  }

  // ---------------------------------------------------------------------------
  // Legacy bridge (Genetics Lab advanced view + engine tests): normalise a base
  // cast character onto the v2 phenotype and build the old 15-node full tree.
  // ---------------------------------------------------------------------------
  const LEGACY_SKIN = { porcelain: "#f4c9a6", fair: "#efbd94", olive: "#c39b6a", tan: "#c88968", fakeTan: "#cf8038", amber: "#ad704e", brown: "#865335", deep: "#5b341f", ebony: "#3f2417" };
  const LEGACY_HAIR = { black: "#151313", blueBlack: "#101820", darkBrown: "#342016", brown: "#5a3320", auburn: "#974526", copper: "#c7532c", blonde: "#dba74d", silver: "#a9a39b", pink: "#e97a8d" };

  function hairFamilyOf(style) {
    const text = String(style || "bald").toLowerCase();
    const exact = Object.entries(HAIR_FAMILY_STYLES).find(([, styles]) => styles.some((value) => text.includes(value.toLowerCase())));
    if (exact) return exact[0];
    if (/loc|braid|corn/.test(text)) return "locs";
    if (/curl|coil|afro|bun/.test(text)) return "curly";
    if (/wave|mess|sweep|curtain/.test(text)) return "wavy";
    if (/bald|shave|hijab/.test(text)) return "none";
    return "straight";
  }

  function traitValue(source, key, fallback) {
    if (source?.[key] !== undefined && source[key] !== "") return source[key];
    if (source?.portraitProfile?.[key] !== undefined && source.portraitProfile[key] !== "") return source.portraitProfile[key];
    return fallback;
  }

  function normalizeFounder(character, options = {}) {
    const source = character?.traits || {};
    const phenotype = {
      skinColor: cleanHex(source.skinHex || LEGACY_SKIN[source.skin], "#c88968"),
      hairColor: cleanHex(source.hairHex || LEGACY_HAIR[source.hairColor], "#342016"),
      eyeColor: cleanHex(source.eyeColor, "#5a3d28"),
      hairFamily: hairFamilyOf(source.hair)
    };
    TRAIT_REGISTRY.forEach((entry) => {
      if (entry.mode === "perceptualColor" || entry.key === "hairFamily") return;
      if (entry.mode === "categorical") {
        phenotype[entry.key] = String(traitValue(source, entry.key, entry.options[0]) || entry.options[0]);
        return;
      }
      phenotype[entry.key] = round3(clamp(number(traitValue(source, entry.key, entry.base), entry.base), entry.min, entry.max));
    });
    phenotype.hairStyle = hairStyleFor(phenotype.hairFamily, String(source.hair || ""));
    const id = String(options.id || character?.id || `founder-${stableHash(character?.name || "unknown")}`);
    return {
      id,
      sourceId: String(character?.id || id),
      name: String(options.name || character?.name || "Founder"),
      label: "",
      generation: options.generation ?? 3,
      parentIds: [],
      phenotype,
      signatures: [],
      traits: phenotypeToTraits(phenotype, { background: options.background }),
      provenance: {},
      groupWeights: {},
      isFounder: true
    };
  }

  function buildTree(founders, seedValue) {
    if (!Array.isArray(founders) || founders.length !== 8) throw new Error("A full ancestry tree needs exactly eight founders");
    const nodes = {};
    founders.forEach((founder, index) => { nodes[`f${index}`] = { ...clone(founder), id: `f${index}`, generation: 3, isFounder: true }; });
    for (let index = 0; index < 4; index += 1) {
      nodes[`g${index}`] = breedChild(nodes[`f${index * 2}`], nodes[`f${index * 2 + 1}`], {
        id: `g${index}`, name: `Grandparent ${index + 1}`, generation: 2, seed: `${seedValue}:g${index}`
      });
    }
    nodes.p0 = breedChild(nodes.g0, nodes.g1, { id: "p0", name: "Parent 1", generation: 1, seed: `${seedValue}:p0` });
    nodes.p1 = breedChild(nodes.g2, nodes.g3, { id: "p1", name: "Parent 2", generation: 1, seed: `${seedValue}:p1` });
    nodes.d0 = breedChild(nodes.p0, nodes.p1, { id: "d0", name: "The Descendant", generation: 0, seed: `${seedValue}:d0` });
    return { engineVersion: ENGINE_VERSION, seed: String(seedValue), rootId: "d0", nodes };
  }

  function serialize(value) {
    return clone(value);
  }

  root.GeneticsRules = Object.freeze({
    ENGINE_VERSION,
    MODE_VERSION,
    FOUNDER_LABELS,
    FAIRNESS_MARGINS,
    TRAIT_REGISTRY,
    generateFounder,
    generateFounderPool,
    selectDistinctFounders,
    phenotypeSimilarity,
    phenotypeToTraits,
    traitSimilarity,
    breedChild,
    coupleKey,
    canonicalConfig,
    createParent,
    createLineage,
    evaluateFairness,
    scoreLineageGuess,
    buildRound,
    traitCallouts,
    normalizeFounder,
    buildTree,
    mixPerceptual,
    colorDistance,
    serialize
  });
})(typeof window !== "undefined" ? window : globalThis);
