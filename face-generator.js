(function () {
  // Dark desaturated navy ink (not pure black) - matches the hand-drawn reference line art and
  // reads softer/more illustrated than a hard black outline.
  const ink = "#1f2330";
  const softInk = "rgba(31,35,48,.24)";
  const stroke = {
    contour: 3.4,
    frame: 3,
    feature: 2.5,
    detail: 1.8,
    whisper: 1.3
  };

  const skinTones = {
    porcelain: "#f4c9a6",
    fair: "#efbd94",
    olive: "#c39b6a",
    tan: "#c88968",
    fakeTan: "#cf8038",   // saturated orange spray-tan look
    amber: "#ad704e",
    brown: "#865335",
    deep: "#5b341f",
    ebony: "#3f2417"
  };

  const hairColors = {
    black: "#151313",
    blueBlack: "#101820",
    darkBrown: "#342016",
    brown: "#5a3320",
    auburn: "#974526",
    copper: "#c7532c",
    blonde: "#dba74d",
    silver: "#a9a39b",
    pink: "#e97a8d"
  };

  // Flat, slightly muted backdrop tones like the reference cards (no gradient, no vignette).
  const backgrounds = ["#a9c4e0", "#eeb6bd", "#9fccb0", "#e8836f", "#bcd09a", "#f0c860", "#bfdce6", "#c6b9e0", "#f0b884"];

  const faceShapes = {
    oval: "M128 61c35 0 58 28 58 73 0 26-7 48-21 62-10 11-24 16-37 16s-27-5-37-16c-14-14-21-36-21-62 0-45 23-73 58-73Z",
    round: "M128 65c37 0 63 28 63 70 0 27-8 50-23 65-11 11-25 17-40 17s-29-6-40-17c-15-15-23-38-23-65 0-42 26-70 63-70Z",
    heart: "M128 61c38 0 58 28 58 71 0 27-8 50-23 65-10 11-23 17-35 17s-25-6-35-17c-15-15-23-38-23-65 0-43 20-71 58-71Z",
    square: "M128 64c35 0 57 25 57 65v21c0 39-24 67-57 67s-57-28-57-67v-21c0-40 22-65 57-65Z",
    long: "M128 60c33 0 55 30 55 76 0 27-7 50-20 65-9 11-22 17-35 17s-26-6-35-17c-13-15-20-38-20-65 0-46 22-76 55-76Z"
  };

  // The brow line (~y128) is the pivot that separates "forehead" from "jaw". Head Height scales the
  // whole skull; Jaw Length stretches ONLY the lower face (below the brow) so a long chin doesn't
  // also squish the forehead - that uniform squish is what made faces look "compressed".
  const JAW_PIVOT = 128;
  // How much a feature at baseline `y` should slide down when the jaw is lengthened by `factor`.
  function jawDrop(factor, y) {
    return Math.max(0, y - JAW_PIVOT) * (Number(factor) || 0);
  }
  // Stretch a face-outline path vertically below JAW_PIVOT by (1+factor). Parses the M/c/s/Z paths in
  // faceShapes (absolute moveto + relative cubics) into absolute cubics with the lower half warped.
  function warpJaw(d, factor) {
    if (!factor) return d;
    const wy = (y) => (y > JAW_PIVOT ? JAW_PIVOT + (y - JAW_PIVOT) * (1 + factor) : y);
    const toks = d.match(/[A-Za-z]|-?\d*\.?\d+/g) || [];
    let i = 0, cx = 0, cy = 0, c2x = 0, c2y = 0, cmd = "", out = "";
    const n = () => parseFloat(toks[i++]);
    const r = (v) => v.toFixed(2);
    while (i < toks.length) {
      if (/[A-Za-z]/.test(toks[i])) { cmd = toks[i++]; if (cmd === "Z" || cmd === "z") { out += "Z"; continue; } }
      if (cmd === "M" || cmd === "L") {
        const x = n(), y = n(); cx = x; cy = y; out += `${cmd}${r(x)} ${r(wy(y))} `;
      } else if (cmd === "m" || cmd === "l") {
        const x = cx + n(), y = cy + n(); cx = x; cy = y; out += `${cmd === "m" ? "M" : "L"}${r(x)} ${r(wy(y))} `;
      } else if (cmd === "c") {
        const x1 = cx + n(), y1 = cy + n(), x2 = cx + n(), y2 = cy + n(), x = cx + n(), y = cy + n();
        out += `C${r(x1)} ${r(wy(y1))} ${r(x2)} ${r(wy(y2))} ${r(x)} ${r(wy(y))} `;
        c2x = x2; c2y = y2; cx = x; cy = y;
      } else if (cmd === "s") {
        const x2 = cx + n(), y2 = cy + n(), x = cx + n(), y = cy + n();
        const x1 = 2 * cx - c2x, y1 = 2 * cy - c2y;
        out += `C${r(x1)} ${r(wy(y1))} ${r(x2)} ${r(wy(y2))} ${r(x)} ${r(wy(y))} `;
        c2x = x2; c2y = y2; cx = x; cy = y;
      } else { i++; }
    }
    return out.trim();
  }

  const expressions = {
    neutral: {
      brows: "M84 113c13-5 27-5 40 0M134 113c13-5 27-5 40 0",
      eyes: "calm",
      mouth: "M110 171c11 2 25 2 36 0",
      mouthWidth: 3,
      blush: false
    },
    happy: {
      brows: "M83 108c15-8 29-7 43 3M132 111c14-10 29-11 43-3",
      eyes: "bright",
      mouth: "M106 166c12 14 32 14 44 0",
      mouthWidth: 3.8,
      teeth: true,
      blush: true
    },
    surprised: {
      brows: "M82 105c15-11 31-11 45 0M130 105c15-11 31-11 45 0",
      eyes: "wide",
      mouth: "M128 174m-6 0a6 8 0 1 0 12 0a6 8 0 1 0-12 0",
      openMouth: true,
      blush: true
    },
    angry: {
      brows: "M82 107c17-3 31 0 44 11M132 118c13-11 27-14 44-11",
      eyes: "narrow",
      mouth: "M110 174c11-6 25-6 36 0",
      mouthWidth: 3.6,
      blush: false
    },
    sad: {
      brows: "M82 116c12-13 28-14 43-2M132 114c15-12 31-11 43 2",
      eyes: "soft",
      mouth: "M110 176c11-8 25-8 36 0",
      mouthWidth: 3.4,
      blush: false
    }
  };

  // Rounded curl-clump edge. Each segment becomes a soft cubic BUMP (both control points pushed
  // along the outward normal), so the silhouette reads as round curl clusters. Arc-scallops met at
  // sharp outward cusps and looked like a spiky sea-urchin; cubic lobes stay round.
  function lobeChain(points, bump, focusY, away) {
    const f = (n) => n.toFixed(1);
    let d = "";
    for (let i = 1; i < points.length; i++) {
      const [px, py] = points[i - 1];
      const [x, y] = points[i];
      const chord = Math.hypot(x - px, y - py);
      // vary each clump's size deterministically so the silhouette isn't a uniform bubble-cap/wig
      const jitter = 0.74 + 0.5 * (Math.abs(Math.sin(i * 91.7)) % 1);
      const depth = chord * bump * jitter;
      const mx = (px + x) / 2;
      const my = (py + y) / 2;
      let nx = -(y - py);
      let ny = x - px;
      const len = Math.hypot(nx, ny) || 1;
      nx /= len;
      ny /= len;
      // orient the bump relative to the head centre: away = bulge outward, else toward the face
      const dot = nx * (mx - 128) + ny * (my - focusY);
      if ((dot < 0) === away) {
        nx = -nx;
        ny = -ny;
      }
      d += `C${f(px + nx * depth)} ${f(py + ny * depth)} ${f(x + nx * depth)} ${f(y + ny * depth)} ${f(x)} ${f(y)}`;
    }
    return d;
  }

  // Outer crown blob (sits behind the head): rounded curl clumps over a flat bottom.
  function curlyCrown({ rx, ry, cy = 150, bottom = 158, steps, bump = 0.72 }) {
    const cx = 128;
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const ang = Math.PI - (Math.PI * i) / steps;
      pts.push([cx + rx * Math.cos(ang), cy - ry * Math.sin(ang)]);
    }
    let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    d += lobeChain(pts, bump, cy, true);
    d += `L${(cx + rx).toFixed(1)} ${bottom}L${(cx - rx).toFixed(1)} ${bottom}Z`;
    return d;
  }

  // Front fringe: a clumpy mass of curls covering the forehead. BOTH edges are lobed - the top
  // clumps overlap the crown (same colour, seamless, no flat band) and the bottom clumps form the
  // hairline over the brows.
  function curlyFringe({ rx, topY, bottomY, dip, steps, bump = 0.72 }) {
    const cx = 128;
    const ts = Math.max(4, Math.round(steps * 0.7));
    const top = [];
    for (let i = 0; i <= ts; i++) {
      const ang = Math.PI - (Math.PI * i) / ts;
      top.push([cx + rx * Math.cos(ang), topY - 18 * Math.sin(ang)]);
    }
    const n = Math.max(5, steps);
    const bottom = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = cx + rx * 0.86 - 2 * rx * 0.86 * t;
      const droop = Math.sin(Math.PI * t) * dip;
      bottom.push([x, bottomY + droop]);
    }
    let d = `M${top[0][0].toFixed(1)} ${top[0][1].toFixed(1)}`;
    d += lobeChain(top, bump, 150, true);
    d += `L${bottom[0][0].toFixed(1)} ${bottom[0][1].toFixed(1)}`;
    d += lobeChain(bottom, bump, 150, false);
    d += "Z";
    return d;
  }

  // Smooth a list of [x,y] points into a cubic path (Catmull-Rom -> bezier). Used for the long
  // flowing hair silhouette and its strand lines so a handful of control points reads as soft waves.
  function catmull(pts, closed) {
    const n = pts.length;
    if (n < 2) return "";
    const f = (v) => v.toFixed(1);
    const get = (i) => (closed ? pts[(i + n) % n] : pts[Math.max(0, Math.min(n - 1, i))]);
    let d = `M${f(pts[0][0])} ${f(pts[0][1])}`;
    const end = closed ? n : n - 1;
    for (let i = 0; i < end; i++) {
      const p0 = get(i - 1), p1 = get(i), p2 = get(i + 1), p3 = get(i + 2);
      const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
      const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
      d += `C${f(c1x)} ${f(c1y)} ${f(c2x)} ${f(c2y)} ${f(p2[0])} ${f(p2[1])}`;
    }
    return closed ? d + "Z" : d;
  }

  // Long flowing wavy hair (Luna's gold standard): a wide voluminous back mass plus a front layer
  // with a soft centre part, a crown that shows forehead, and two long locks that frame the face and
  // fall past the shoulders with a gently scalloped (wavy) outer edge. Strand lines are added by
  // renderHairHighlights (clipped to the front layer). Replaces the borrowed faces.js "female1"
  // silhouette, which rendered as a blunt-banged bob.
  // Back mass: tapers from a high rounded crown, falls down both sides past the shoulders (to the
  // canvas bottom) with a gently waved outer edge — wider up top than at the ends, never a closed oval.
  const longWaveBack = catmull([
    [128, 30], [170, 38], [198, 64], [212, 106], [216, 150], [210, 184], [212, 214], [202, 244], [192, 256],
    [150, 250], [128, 250], [106, 250],
    [64, 256], [54, 244], [46, 214], [48, 184], [42, 150], [46, 106], [60, 64], [86, 38]
  ], true);
  const longWaveFront = catmull([
    // left lock: outer edge from the temple down with S-waves to the tip at the bottom edge
    [64, 96], [50, 124], [60, 158], [46, 196], [56, 230], [50, 256],
    // tip -> inner edge back up, kept OUTSIDE the cheek so the face stays open
    [76, 238], [82, 196], [80, 156], [88, 116],
    // clean shallow centre-part hairline (sits high so a forehead shows, no widow's-peak notch)
    [100, 92], [114, 87], [128, 85], [142, 87], [154, 92],
    // right inner edge down (outside the cheek), then the right lock + its S-waved outer edge up
    [168, 116], [176, 156], [174, 196], [180, 238],
    [206, 256], [200, 230], [210, 196], [196, 158], [206, 124], [192, 96],
    // crown over the skull (high and rounded, with soft volume)
    [168, 40], [128, 32], [88, 40]
  ], true);

  const hairStyles = {
    messy: {
      back: "M58 141c1-56 29-89 70-89 44 0 70 32 70 89-20-9-39-13-58-13-17 0-31 2-42 7-13 5-26 8-40 6Z",
      front: "M60 111c17-41 50-60 91-48 23 7 38 23 45 49-14-8-29-11-43-9-13 2-25 8-35 16-11 2-21 0-31-5-10-6-19-8-27-3Z"
    },
    bob: {
      back: "M60 160c2-66 30-102 68-102 39 0 66 36 68 102l-20 38H80L60 160Z",
      front: "M66 118c16-44 49-63 89-50 22 7 35 24 39 51-12-8-25-12-38-12-10 0-18 2-28 7-10-5-19-7-29-7-13 0-24 4-33 11Z"
    },
    longWaves: {
      back: longWaveBack,
      front: longWaveFront,
      longFlow: true
    },
    curls: {
      back: curlyCrown({ rx: 82, ry: 110, steps: 9, bump: 0.34 }),
      front: curlyFringe({ rx: 74, topY: 80, bottomY: 96, dip: 3, steps: 8, bump: 0.34 }),
      texture: "curls"
    },
    coily: {
      back: curlyCrown({ rx: 82, ry: 108, bottom: 156, steps: 12, bump: 0.44 }),
      front: curlyFringe({ rx: 73, topY: 78, bottomY: 95, dip: 3, steps: 11, bump: 0.44 }),
      texture: "coils"
    },
    locs: {
      back: "M55 84c10-28 33-42 73-42s63 14 73 42v124H55V84Z",
      front: "M61 99c22-39 83-48 134 0-37-14-95-14-134 0Z",
      texture: "locs"
    },
    cropped: {
      back: "M66 127c5-47 29-73 62-73 35 0 58 26 62 73-13-8-33-12-62-12-27 0-48 4-62 12Z",
      front: "M70 104c22-42 80-46 116 4-14-5-28-8-42-8-10 0-19 2-27 6-9-4-19-6-30-6-5 0-11 1-17 4Z"
    },
    sidePart: {
      back: "M60 132c3-55 31-88 69-88 38 0 65 32 68 86-33-16-98-16-137 2Z",
      front: "side-part-locks",
      sidePart: true
    },
    bald: {
      back: "",
      front: ""
    },
    hijab: {
      back: "M54 92c18-33 45-49 74-49s56 16 74 49v118H54V92Z",
      front: "M72 100c12-30 33-45 56-45s44 15 56 45v100H72V100Z",
      covered: true
    }
  };

  // The shoulder silhouette is generated per-character by shoulderPath(traits) from traits.build
  // (a half-width that's narrower for women + varies per person) so the cast isn't a row of
  // identically broad torsos. Each garment only carries its collar style; the soft rounded
  // shoulders + curved necklines replace the old hard rectangles/V-notches that read as "angular".
  const clothing = {
    hoodie: { collar: "hood" },
    tee: { collar: "crew" },
    vneck: { collar: "vneck" },
    collared: { collar: "shirt" },
    blazer: { collar: "blazer" },
    jacket: { collar: "zip" },
    turtleneck: { collar: "turtle" },
    overalls: { collar: "overall" },
    singlet: { collar: "none", bare: true },   // bare shoulders/arms + a thin-strap tank panel
    bare: { collar: "none", bare: true, nude: true } // no shirt - skin shoulders/chest
  };

  // Preset metals for metal jewellery (chain, etc.).
  const metalHex = {
    silver: "#cdd2d6",
    gold: "#e2b84f",
    black: "#2c2c30",
    roseGold: "#d79e8c"
  };

  const accessories = {
    none: () => "",
    glasses: (traits) => {
      const eyes = eyeLayout(traits);
      return `
        <rect x='${eyes.left - 19}' y='${eyes.y - 15}' width='38' height='30' rx='10' fill='rgba(255,255,255,.08)' stroke='#171512' stroke-width='3.1'/>
        <rect x='${eyes.right - 19}' y='${eyes.y - 15}' width='38' height='30' rx='10' fill='rgba(255,255,255,.08)' stroke='#171512' stroke-width='3.1'/>
        <path d='M${eyes.left + 19} ${eyes.y}h${eyes.right - eyes.left - 38}' stroke='#171512' stroke-width='2.8' stroke-linecap='round'/>
        <path d='M${eyes.left - 20} ${eyes.y - 3}c-7-2-11-1-15 2M${eyes.right + 20} ${eyes.y - 3}c7-2 11-1 15 2' fill='none' stroke='rgba(24,21,18,.45)' stroke-width='2.1' stroke-linecap='round'/>
        <path d='M${eyes.left - 8} ${eyes.y - 10}h12M${eyes.right - 8} ${eyes.y - 10}h12' fill='none' stroke='rgba(255,255,255,.55)' stroke-width='1.8' stroke-linecap='round'/>
      `;
    },
    roundGlasses: (traits) => {
      const eyes = eyeLayout(traits);
      return `
        <circle cx='${eyes.left}' cy='${eyes.y}' r='20' fill='rgba(255,255,255,.08)' stroke='#171512' stroke-width='3'/>
        <circle cx='${eyes.right}' cy='${eyes.y}' r='20' fill='rgba(255,255,255,.08)' stroke='#171512' stroke-width='3'/>
        <path d='M${eyes.left + 20} ${eyes.y}h${eyes.right - eyes.left - 40}' stroke='#171512' stroke-width='2.8' stroke-linecap='round'/>
        <path d='M${eyes.left - 21} ${eyes.y - 2}c-6-2-11-1-14 3M${eyes.right + 21} ${eyes.y - 2}c6-2 11-1 14 3' fill='none' stroke='rgba(24,21,18,.42)' stroke-width='2.1' stroke-linecap='round'/>
        <path d='M${eyes.left - 7} ${eyes.y - 12}c4-2 10-2 14 0M${eyes.right - 7} ${eyes.y - 12}c4-2 10-2 14 0' fill='none' stroke='rgba(255,255,255,.56)' stroke-width='1.7' stroke-linecap='round'/>
      `;
    },
    squareGlasses: (traits) => {
      const eyes = eyeLayout(traits);
      return `
        <rect x='${eyes.left - 18}' y='${eyes.y - 14}' width='36' height='28' rx='6' fill='rgba(255,255,255,.07)' stroke='#171512' stroke-width='3.1'/>
        <rect x='${eyes.right - 18}' y='${eyes.y - 14}' width='36' height='28' rx='6' fill='rgba(255,255,255,.07)' stroke='#171512' stroke-width='3.1'/>
        <path d='M${eyes.left + 18} ${eyes.y}h${eyes.right - eyes.left - 36}' stroke='#171512' stroke-width='2.8' stroke-linecap='round'/>
        <path d='M${eyes.left - 18} ${eyes.y - 9}h10M${eyes.right - 18} ${eyes.y - 9}h10' fill='none' stroke='rgba(255,255,255,.54)' stroke-width='1.7' stroke-linecap='round'/>
      `;
    },
    catEyeGlasses: (traits) => {
      const eyes = eyeLayout(traits);
      return `
        <path d='M${eyes.left - 21} ${eyes.y + 3}c6-21 35-21 43-4-5 12-36 14-43 4Z' fill='rgba(255,255,255,.08)' stroke='#171512' stroke-width='3.1' stroke-linejoin='round'/>
        <path d='M${eyes.right - 22} ${eyes.y - 1}c8-17 37-17 43 4-7 10-38 8-43-4Z' fill='rgba(255,255,255,.08)' stroke='#171512' stroke-width='3.1' stroke-linejoin='round'/>
        <path d='M${eyes.left + 18} ${eyes.y - 1}h${eyes.right - eyes.left - 36}' stroke='#171512' stroke-width='2.7' stroke-linecap='round'/>
        <path d='M${eyes.left - 5} ${eyes.y - 10}h11M${eyes.right - 5} ${eyes.y - 10}h11' fill='none' stroke='rgba(255,255,255,.52)' stroke-width='1.6' stroke-linecap='round'/>
      `;
    },
    hoops: () => `
      <circle cx='60' cy='145' r='7.5' fill='none' stroke='#f6bd2f' stroke-width='3'/>
      <circle cx='196' cy='145' r='7.5' fill='none' stroke='#f6bd2f' stroke-width='3'/>
      <path d='M60 137c2 1 3 2 4 4M196 137c-2 1-3 2-4 4' fill='none' stroke='rgba(255,255,255,.5)' stroke-width='1.6' stroke-linecap='round'/>
    `,
    studs: () => `
      <circle cx='58' cy='145' r='4.4' fill='#ffd569' stroke='#171512' stroke-width='2'/>
      <circle cx='198' cy='145' r='4.4' fill='#ffd569' stroke='#171512' stroke-width='2'/>
      <circle cx='58' cy='144' r='1.3' fill='rgba(255,255,255,.8)'/>
      <circle cx='198' cy='144' r='1.3' fill='rgba(255,255,255,.8)'/>
    `,
    dropEarrings: () => `
      <circle cx='60' cy='139' r='3.2' fill='#ffd569' stroke='#171512' stroke-width='1.8'/>
      <circle cx='196' cy='139' r='3.2' fill='#ffd569' stroke='#171512' stroke-width='1.8'/>
      <path d='M60 142v8M196 142v8' fill='none' stroke='#171512' stroke-width='1.8' stroke-linecap='round'/>
      <ellipse cx='60' cy='153' rx='4.8' ry='6.2' fill='#ff9bb0' stroke='#171512' stroke-width='2'/>
      <ellipse cx='196' cy='153' rx='4.8' ry='6.2' fill='#ff9bb0' stroke='#171512' stroke-width='2'/>
    `,
    beard: (traits, faceShape) => {
      // Two distinct looks driven by one `beardLength` knob, both clipped to the real face silhouette
      // so the beard can never float past the jaw as a pasted-on blob:
      //   - low length  -> STUBBLE: just dark speckle on the skin, no solid mass.
      //   - high length -> a SOLID, drawn beard (flat dark fill) with a RAGGED HAIRY top edge and a
      //     thin fringe of upward hairs, plus a band of stubble fading up into bare skin. NOT an
      //     airbrushed/feathered cloud - the fill is opaque with a crisp, hand-drawn edge like the
      //     reference art.
      const hairHex = hairColors[traits.hairColor] || "#3a2418";
      const base = shadeColor(hairHex, 0.82);
      const lo = shadeColor(hairHex, 0.58);
      const hi = shadeColor(hairHex, 1.26);

      // length comes from an explicit override (studio editor / corrections) or, failing that, the
      // named profile carried by existing characters.
      const profileLen = { trimShort: 0.3, chinCurtain: 0.45, boxedFull: 0.72, roundedHeavy: 0.9, roundedFull: 0.62 };
      const profile = traits.beardProfile || "trimShort";
      let length = traits.beardLength == null ? (profileLen[profile] != null ? profileLen[profile] : 0.35) : Number(traits.beardLength);
      length = Math.max(0, Math.min(1, length));

      // "roundedFull" = the Ethan look: a solid, neatly-groomed full beard with a CLEAN shaved frame
      // around the mouth (lips sit on bare skin), an integrated moustache over the lip, smooth rounded
      // edges and downward strand texture - none of the scraggly cheek-stubble halo of the stubble look.
      const isRounded = profile === "roundedFull";
      const skinHex = skinTones[traits.skin] || "#e8b48f";

      const cheekY = 158 - length * 14;   // sideburn / top of the cheek coverage (climbs with length)
      const centerY = 158 - length * 2;   // top of the beard at the midline, just under the nose
      const chinDeep = 250;               // run the mass well past the jaw; the face clip trims it

      // y of the (jagged) top edge at a given x: lowest at the centre, climbing to the sideburns.
      const topAt = (x) => {
        const t = Math.min(1, Math.abs(x - 128) / 48);
        return centerY - (centerY - cheekY) * Math.pow(t, 1.3);
      };
      const rng = (i, s) => { const v = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453; return v - Math.floor(v); };

      // how "solid" the beard is: 0 = pure stubble, 1 = full drawn beard. The loose stubble dots are
      // scaled by (1 - solid) so a real beard NEVER carries a halo of crumb-like specks.
      const solid = Math.max(0, Math.min(1, (length - 0.15) / 0.45));

      // Ragged top edge: a polyline along topAt with small per-step jitter so the hairline reads as
      // hair, not a smooth arc. Reused for the fill path and to plant edge hairs.
      const edgePts = [];
      const jitterAmp = isRounded ? 2.0 : 4.2;   // groomed beards have a cleaner top edge
      for (let x = 78; x <= 178; x += 3.5) {
        const jitter = (rng(Math.round(x), 7) - 0.5) * jitterAmp;
        edgePts.push([x, topAt(x) + jitter]);
      }
      const topPath = edgePts.map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join("");
      const region = `${topPath}L178 ${chinDeep}L78 ${chinDeep}Z`;

      // Solid mass: a near-opaque flat fill (NOT a translucent group) + a darker lower-jaw lowlight,
      // a few strand highlights, and a fringe of upward edge-hairs so the top reads as hair, not a
      // cut-out. The edge-hairs are what soften the boundary - no loose dot halo needed.
      let solidLayer = "";
      if (length > 0.16) {
        // Groomed beards read as a solid block of hair; the stubble look stays semi-translucent.
        const fillOp = isRounded ? "0.97" : (0.55 + 0.4 * solid).toFixed(2);
        let strands = "";
        const strandCount = Math.round((isRounded ? 9 : 4) + length * 7);
        for (let i = 0; i < strandCount; i++) {
          const x = 92 + (i / Math.max(1, strandCount - 1)) * 72;
          const y0 = topAt(x) + 12;
          // rounded beards comb straight down; stubble sways loosely
          const sway = (rng(i, 5) - 0.5) * (isRounded ? 3 : 8);
          const len = 24 + rng(i, 9) * 28;
          const op = isRounded ? (0.18 + solid * 0.14) : (0.12 + solid * 0.12);
          strands += `<path d='M${x.toFixed(1)} ${y0.toFixed(1)}q${sway.toFixed(1)} ${(len * 0.6).toFixed(1)} ${(sway * 0.35).toFixed(1)} ${len.toFixed(1)}' fill='none' stroke='${hi}' stroke-width='1' stroke-linecap='round' opacity='${op.toFixed(2)}'/>`;
        }
        let edgeHairs = "";
        for (let i = 0; i < edgePts.length; i += 1) {
          if (rng(i, 11) > 0.66) continue;
          const [x, y] = edgePts[i];
          const h = (isRounded ? 1.6 : 2.2) + rng(i, 13) * (isRounded ? 3 : 4.5);
          const dx = (rng(i, 15) - 0.5) * 3.2;
          edgeHairs += `<path d='M${x.toFixed(1)} ${y.toFixed(1)}q${(dx * 0.5).toFixed(1)} ${(-h * 0.6).toFixed(1)} ${dx.toFixed(1)} ${(-h).toFixed(1)}' fill='none' stroke='${base}' stroke-width='1.2' stroke-linecap='round' opacity='${(0.45 + 0.3 * solid).toFixed(2)}'/>`;
        }

        // Ethan look: carve a skin-coloured frame around the mouth so the lips sit on bare skin, and
        // lay an integrated moustache over the upper lip. Both ride inside the face clip with the mass.
        let mouthFrame = "";
        if (isRounded) {
          // shaved oval around the lips (kept above the chin so the goatee point stays bearded)
          mouthFrame = `
            <path d='M104 160c8-4 32-4 48 0 6 6 5 16 -2 20 -8 4 -36 4 -44 0 -7 -4 -8 -14 -2 -20Z' fill='${skinHex}'/>
            <path d='M101 158c13-11 22-7 27 0 5-7 14-11 27 0-15 8-26 7-27 0-1 7-12 8-27 0Z' fill='${shadeColor(hairHex, 0.7)}' stroke='${shadeColor(hairHex, 0.5)}' stroke-width='1' stroke-linejoin='round'/>`;
        }

        solidLayer = `
          <path d='${region}' fill='${base}' fill-opacity='${fillOp}'/>
          <path d='M88 195C108 224 148 224 168 195L168 214C150 236 106 236 88 214Z' fill='${lo}' opacity='0.5'/>
          ${strands}
          ${edgeHairs}
          ${mouthFrame}`;
      }

      // Loose stubble dots: only meaningful for genuine stubble (low length). They fade out as the
      // beard fills in solid, stay TIGHT to the beard zone (tiny 3px fringe above the edge, then down
      // into the mass), and are small + low-contrast so they read as shadow grain, not cake crumbs.
      let stipple = "";
      const stubbleStrength = isRounded ? 0 : Math.pow(1 - solid, 1.1);
      if (stubbleStrength > 0.03) {
        const dotCount = 190;
        for (let i = 0; i < dotCount; i++) {
          const x = 80 + rng(i, 1) * 96;
          const top = topAt(x);
          const y = (top - 3) + rng(i, 2) * (chinDeep - top);
          const d = y - top;
          let op;
          if (d < 0) op = 0.42 * (d + 3) / 3;                 // quick 3px fringe into bare skin
          else op = 0.4 * Math.max(0.25, 1 - d / 60);          // densest just below the edge
          op *= stubbleStrength;
          if (op < 0.05) continue;
          const r = (0.45 + rng(i, 3) * 0.6).toFixed(2);
          stipple += `<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${r}' fill='${lo}' opacity='${Math.min(0.7, op).toFixed(2)}'/>`;
        }
      }

      const beardBase = `
        <defs><clipPath id='beardclip'><path d='${faceShape}'/></clipPath></defs>
        <g clip-path='url(#beardclip)'>
          ${solidLayer}
          ${stipple}
        </g>
      `;
      return `${transformBeardBase(beardBase, traits)}`;
    },
    moustache: (traits) => {
      const profile = traits.beardProfile || "classic";
      const shapes = {
        classic: "<path d='M101 159c13-11 22-7 27 0 5-7 14-11 27 0-15 8-26 7-27 0-1 7-12 8-27 0Z' fill='#2f211b'/>",
        pencil: "<path d='M104 160c10-3 18-3 24 0 6-3 14-3 24 0-9 3-17 4-24 1-7 3-15 2-24-1Z' fill='#2b1b16'/>"
      };
      return transformMoustache(shapes[profile] || shapes.classic, traits);
    },
    necklace: () => `
      <path d='M96 209c12 18 52 18 64 0' fill='none' stroke='#f6bd2f' stroke-width='3' stroke-linecap='round'/>
      <path d='M102 211c10 13 40 13 52 0' fill='none' stroke='rgba(255,255,255,.42)' stroke-width='1.8' stroke-linecap='round'/>
      <circle cx='128' cy='228' r='5.5' fill='#f6bd2f' stroke='#171512' stroke-width='2'/>
      <path d='M126 226c2-2 4-2 6 0' fill='none' stroke='rgba(255,255,255,.58)' stroke-width='1.4' stroke-linecap='round'/>
    `,
    chain: (traits) => {
      // Metal preset (silver/gold/black/roseGold) wins; else an explicit accessoryColor; else gold.
      const metal = metalHex[traits.accessoryMetal] || traits.accessoryColor || "#e2b84f";
      const hi = shadeColor(metal, 1.22);
      const sz = Math.max(0.5, Math.min(2.2, Number(traits.chainLink) || 1)); // link-size multiplier
      const rx = (6.5 * sz).toFixed(1), ry = (4.2 * sz).toFixed(1), sw = (2.2 * Math.sqrt(sz)).toFixed(1);
      const step = 13 * sz;                       // spacing follows link size = dynamic link count
      const n = Math.max(1, Math.round(28 / step));
      let s = "";
      for (let i = -n; i <= n; i++) {
        const x = 128 + i * step;
        const t = Math.abs(i) / (n || 1);
        const y = 225 - t * t * 10;               // centre hangs lowest, ends ride up (a drape)
        const col = i % 2 ? hi : metal;
        s += `<ellipse cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' rx='${rx}' ry='${ry}' fill='none' stroke='${col}' stroke-width='${sw}'/>`;
      }
      return s;
    },
    choker: () => `
      <path d='M97 211c11 4 51 4 62 0v10c-13 5-49 5-62 0Z' fill='#1d1a21' stroke='#171512' stroke-width='2.1' stroke-linejoin='round'/>
      <circle cx='128' cy='221' r='4.5' fill='#ff89ab' stroke='#171512' stroke-width='2'/>
    `,
    bow: () => `
      <path d='M106 214l12-8 10 8-10 8-12-8Z' fill='#7b3f88' stroke='#171512' stroke-width='2.7' stroke-linejoin='round'/>
      <path d='M150 214l-12-8-10 8 10 8 12-8Z' fill='#7b3f88' stroke='#171512' stroke-width='2.7' stroke-linejoin='round'/>
      <rect x='123' y='208' width='10' height='12' rx='3' fill='#f7d36a' stroke='#171512' stroke-width='2.2'/>
    `,
    cap: (traits) => `
      <path d='M72 75c13-29 94-29 108 0l-12 31H84L72 75Z' fill='${traits.accent}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
      <path d='M50 103c39-13 117-13 156 0' fill='none' stroke='${ink}' stroke-width='8' stroke-linecap='round'/>
      <path d='M82 84c27-9 69-9 92 0' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='3.6' stroke-linecap='round'/>
      <circle cx='128' cy='74' r='3.5' fill='rgba(255,255,255,.34)'/>
    `,
    beanie: (traits) => `
      <path d='M72 91c12-34 100-34 112 0v26H72V91Z' fill='${traits.accent}' stroke='${ink}' stroke-width='${stroke.contour}'/>
      <path d='M73 109h110' stroke='${ink}' stroke-width='2.7'/>
      <path d='M84 85c9 9 9 21 0 32M107 75c8 15 8 27 0 42M132 72c8 16 8 30 0 45M157 76c8 15 8 27 0 41' stroke='rgba(24,21,18,.48)' stroke-width='2.8' stroke-linecap='round'/>
      <path d='M89 86c14-6 53-6 78 0' fill='none' stroke='rgba(255,255,255,.25)' stroke-width='3' stroke-linecap='round'/>
    `,
    beret: (traits) => `
      <path d='M74 84c31-28 77-29 103-8 12 10 2 24-30 27-35 3-69-2-73-19Z' fill='${traits.accent}' stroke='${ink}' stroke-width='${stroke.contour}'/>
      <path d='M126 69c4-11 12-14 23-10' fill='none' stroke='${ink}' stroke-width='3.2' stroke-linecap='round'/>
      <path d='M94 83c20-8 44-9 62-4' fill='none' stroke='rgba(255,255,255,.24)' stroke-width='3' stroke-linecap='round'/>
    `,
    headband: (traits) => `
      <path d='M67 101c33-20 88-20 122 0' fill='none' stroke='${traits.accent}' stroke-width='7' stroke-linecap='round'/>
      <path d='M67 101c33-20 88-20 122 0' fill='none' stroke='${ink}' stroke-width='2.4' stroke-linecap='round'/>
      <path d='M122 92c4 3 6 6 6 10' fill='none' stroke='rgba(255,255,255,.36)' stroke-width='2' stroke-linecap='round'/>
    `,
    flowerClip: () => `
      <circle cx='175' cy='101' r='5.2' fill='#ff69a6' stroke='#171512' stroke-width='1.9'/>
      <circle cx='185' cy='101' r='5.2' fill='#ff69a6' stroke='#171512' stroke-width='1.9'/>
      <circle cx='180' cy='92' r='5.2' fill='#ff69a6' stroke='#171512' stroke-width='1.9'/>
      <circle cx='180' cy='110' r='5.2' fill='#ff69a6' stroke='#171512' stroke-width='1.9'/>
      <circle cx='171' cy='96' r='5.2' fill='#ff8ec0' stroke='#171512' stroke-width='1.9'/>
      <circle cx='189' cy='96' r='5.2' fill='#ff8ec0' stroke='#171512' stroke-width='1.9'/>
      <circle cx='180' cy='101' r='4.2' fill='#ffd166' stroke='#171512' stroke-width='1.5'/>
    `,
    bucketHat: (traits) => `
      <path d='M68 78c25-26 96-26 121 0l-11 33H79L68 78Z' fill='${traits.accent}' stroke='${ink}' stroke-width='${stroke.contour}'/>
      <path d='M57 105c42-14 105-14 147 0' fill='none' stroke='${ink}' stroke-width='8.5' stroke-linecap='round'/>
      <path d='M83 79v29M113 68v40M143 68v40M173 79v29' stroke='rgba(255,255,255,.32)' stroke-width='3.6'/>
      <path d='M86 84c18-9 58-10 84-2' fill='none' stroke='rgba(24,21,18,.22)' stroke-width='2.3' stroke-linecap='round'/>
    `,
    // Wide-brim floppy straw sun hat: a tall rounded woven crown, a band that wraps the crown
    // base (with a draping scarf tail + geometric pattern), and a broad brim that drapes with a
    // visible darker UNDERSIDE so it reads as a 3D hat, not a flat saucer. Modelled on the Tara
    // gold-standard reference + a classic wide-brim icon.
    sunHat: () => {
      const strawTop = "#ddc086", strawUnder = "#b18f43", strawLo = "#a8884a", bandDark = "#2c2f45";
      const cols = ["#3a8f8a", "#d98a3a", "#7a5aa8", "#d98a3a", "#3a8f8a", "#7a5aa8", "#3a8f8a"];
      let diamonds = `<g stroke='${ink}' stroke-width='1.3' stroke-linejoin='round'>`;
      for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const x = 92 + t * 72;
        const y = 80 + Math.sin(t * Math.PI) * 7;
        diamonds += `<path d='M${x} ${y - 4} L${x + 3.6} ${y} L${x} ${y + 4} L${x - 3.6} ${y} Z' fill='${cols[i]}'/>`;
      }
      diamonds += "</g>";
      return `
        <path d='M74 96C60 124 56 152 62 178c8 2 16 0 20-4-4-24 0-50 12-74Z' fill='${bandDark}' stroke='${ink}' stroke-width='2.6' stroke-linejoin='round'/>
        <path d='M16 106 C 22 90 92 88 128 88 C 164 88 234 90 240 106 C 240 130 222 146 198 150 C 176 126 152 120 128 120 C 104 120 80 126 58 150 C 34 146 16 130 16 106 Z' fill='${strawTop}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
        <path d='M58 150 C 80 126 104 120 128 120 C 152 120 176 126 198 150 C 178 116 152 110 128 110 C 104 110 80 116 58 150 Z' fill='${strawUnder}'/>
        <g fill='none' stroke='${strawLo}' stroke-width='1.4' opacity='.55' stroke-linecap='round'>
          <path d='M24 108 C 40 96 94 92 128 92 C 162 92 216 96 232 108'/>
          <path d='M34 122 C 52 108 100 102 128 102 C 156 102 204 108 222 122'/>
          <path d='M50 138 C 68 124 104 116 128 116 C 152 116 188 124 206 138'/>
        </g>
        <path d='M82 90 C 76 2 180 2 174 90 Z' fill='${strawTop}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
        <g fill='none' stroke='${strawLo}' stroke-width='1.4' opacity='.5'>
          <path d='M84 80 C 102 64 154 64 172 80'/>
          <path d='M86 68 C 104 52 152 52 170 68'/>
          <path d='M90 56 C 106 44 150 44 166 56'/>
          <path d='M98 46 C 112 36 144 36 158 46'/>
          <path d='M108 38 C 118 32 138 32 148 38'/>
        </g>
        <path d='M82 90 C 110 102 146 102 174 90 L 174 72 C 146 84 110 84 82 72 Z' fill='${bandDark}' stroke='${ink}' stroke-width='2.4' stroke-linejoin='round'/>
        ${diamonds}
      `;
    },
    // Backwards snapback: the crown covers the top of the head, the brim points away so we see the
    // squatchee button + panel seam up top, and at the front sits the adjustable strap with its
    // snap holes and a tuft of hair poking through the closure gap. Renders OVER the hair.
    capBack: (traits) => {
      const green = traits.accent || "#3f9d4f";
      const lite = shadeColor(green, 1.16);
      const hairHex = hairColors[traits.hairColor] || "#6b4a2f";
      const tuft = shadeColor(hairHex, 0.96);
      const tuftLo = shadeColor(hairHex, 0.68);
      return `
        <path d='M101 98C101 76 155 76 155 98Z' fill='${tuft}'/>
        <path d='M116 96c2-11 5-15 10-21M128 97c1-12 3-17 7-23M141 96c1-10 3-14 7-18' fill='none' stroke='${tuftLo}' stroke-width='1.5' stroke-linecap='round' opacity='.6'/>
        <path d='M84 102C56 52 66 34 128 34C190 34 200 52 172 102C166 96 160 95 154 96C154 81 102 81 102 96C96 95 90 96 84 102Z' fill='${green}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
        <path d='M84 62c22-13 64-13 88-2' fill='none' stroke='${lite}' stroke-width='4' stroke-linecap='round' opacity='.5'/>
        <path d='M128 37V84' fill='none' stroke='${ink}' stroke-width='1.8' stroke-linecap='round' stroke-dasharray='1.5 5' opacity='.55'/>
        <circle cx='128' cy='34' r='3.7' fill='${green}' stroke='${ink}' stroke-width='2'/>
        <rect x='100' y='95' width='56' height='15' rx='5.5' fill='${green}' stroke='${ink}' stroke-width='${stroke.feature}'/>
        <path d='M106 100h44' stroke='${lite}' stroke-width='2' stroke-linecap='round' opacity='.4'/>
        <circle cx='113' cy='103' r='1.9' fill='${ink}'/>
        <circle cx='123' cy='103' r='1.9' fill='${ink}'/>
        <circle cx='133' cy='103' r='1.9' fill='${ink}'/>
        <circle cx='143' cy='103' r='1.9' fill='${ink}'/>
      `;
    },
    // Chunky knit scarf wound around the neck with two fringed tails - sage-green & cream
    // horizontal stripes modelled on the Umar gold-standard reference. Renders OVER the
    // clothing/neck so the collar disappears into the wrap. Each portrait is its own isolated
    // SVG document, so the fixed `scarfclip` id never collides between characters.
    scarf: () => {
      const green = "#7e9d57", greenLo = "#67844a", greenHi = "#92ad68";
      const cream = "#ece6c8", creamLo = "#d6cda0";
      const knit = "rgba(31,35,48,.20)";
      // Chunky cowl wound around the neck. It reads as a round TUBE rather than a flat
      // front-on panel because: the stripes ARC (sag in the middle) following the cylinder
      // of the neck, the rolled top rim catches light while the opening just below it falls
      // into shadow (the neck disappears into the wrap), and both sides turn darker as the
      // wrap rounds away from the viewer. Same depth idea as the sun-hat underside plane.
      const body = "M80 205C90 196 166 196 176 205C184 214 184 230 178 239C150 245 106 245 78 239C72 230 72 214 80 205Z";
      // One scarf end draping down from UNDER the cowl. It reads as soft folded fabric (not a
      // boxy tab) because the right third is a folded-over UNDERSIDE strip (darker, with a
      // crease line) and the cowl casts a shadow over the tail's top edge - same depth idea as
      // the reference scarf, where the tail twists to show its darker back. Drops off-frame.
      const tail = "M104 240C102 248 103 256 106 262L152 262C156 254 156 246 154 240C140 245 118 245 104 240Z";
      const tailFold = "M136 241C136 249 138 256 142 262L152 262C156 254 156 246 154 240C148 242 142 242 136 241Z";
      const foldCrease = "M136 241C136 249 138 256 142 262";
      // curved stripe bands - each bows downward in the middle so the wrap reads as round
      const sag = 6;
      let stripes = "";
      for (let y = 193; y < 262; y += 15) {
        stripes += `<path d='M54 ${y} Q128 ${y + sag} 202 ${y} L202 ${y + 7.4} Q128 ${y + sag + 7.4} 54 ${y + 7.4} Z' fill='${cream}'/>`;
        stripes += `<path d='M54 ${y + 7.4} Q128 ${y + sag + 7.4} 202 ${y + 7.4} L202 ${y + 9} Q128 ${y + sag + 9} 54 ${y + 9} Z' fill='${creamLo}' opacity='.7'/>`;
      }
      // vertical knit ribs read as a chunky stitch under the stripes
      let ribs = "";
      for (let x = 78; x <= 180; x += 7) ribs += `<path d='M${x} 197V262'/>`;
      // chunky fringe hanging off the tail end, alternating green/cream, running off the frame;
      // the strands over the folded underside are darker so the fold still reads at the bottom
      let fringe = "";
      for (let i = 0; i < 9; i++) {
        const fx = 108 + i * 5.2;
        const len = 7 + (i % 2 ? 1.6 : 0);
        const col = fx > 134 ? greenLo : (i % 2 ? cream : green);
        fringe += `<path d='M${fx} 261v${len}' stroke='${col}' stroke-width='3.2' stroke-linecap='round'/>`;
      }
      return `
        <clipPath id='scarfclip'><path d='${body}'/><path d='${tail}'/></clipPath>
        <g clip-path='url(#scarfclip)'>
          <rect x='58' y='188' width='128' height='86' fill='${green}'/>
          ${stripes}
          <g stroke='${knit}' stroke-width='1.3'>${ribs}</g>
          <path d='M80 205C90 197 166 197 176 205C150 211 106 211 80 205Z' fill='${greenHi}' opacity='.5'/>
          <path d='M90 207C104 214 152 214 166 207C162 220 94 220 90 207Z' fill='rgba(31,35,48,.26)'/>
          <path d='M78 205C72 214 72 230 78 239C86 236 90 230 90 222C90 216 88 210 86 206C83 205 80 204 78 205Z' fill='rgba(31,35,48,.20)'/>
          <path d='M178 205C184 214 184 230 178 239C170 236 166 230 166 222C166 216 168 210 170 206C173 205 176 204 178 205Z' fill='rgba(31,35,48,.20)'/>
          <path d='M78 239C106 245 150 245 178 239C176 243 150 247 128 247C106 247 80 243 78 239Z' fill='${greenLo}' opacity='.5'/>
          <path d='${tailFold}' fill='rgba(31,35,48,.30)'/>
          <path d='M104 240C120 246 140 246 154 240C153 247 152 250 150 252C138 256 118 256 108 252C106 250 105 247 104 240Z' fill='rgba(31,35,48,.24)'/>
        </g>
        ${fringe}
        <path d='${tail}' fill='none' stroke='${ink}' stroke-width='${stroke.feature}' stroke-linejoin='round'/>
        <path d='${foldCrease}' fill='none' stroke='${ink}' stroke-width='1.6' stroke-linecap='round' opacity='.55'/>
        <path d='${body}' fill='none' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
      `;
    }
  };

  const seedSpecs = [
    ["aaron", "Aaron", "he", "porcelain", "messy", "brown", "hoodie", "#256ba8", "neutral", "none", "architect"],
    ["maya", "Maya", "she", "amber", "longWaves", "black", "tee", "#b063c8", "happy", "dropEarrings", "psychologist", "warmSmile"],
    ["leon", "Leon", "he", "brown", "coily", "black", "hoodie", "#22834b", "neutral", "none", "personal trainer"],
    ["naomi", "Naomi", "she", "fair", "bob", "blueBlack", "overalls", "#2b2b2b", "angry", "flowerClip", "designer"],
    ["javier", "Javier", "he", "tan", "longWaves", "darkBrown", "jacket", "#ddba78", "sad", "moustache", "bartender"],
    ["tiana", "Arnold", "she", "deep", "locs", "black", "tee", "#df8f20", "happy", "necklace", "teacher", "bigSmile"],
    ["diego", "Diego", "he", "tan", "curls", "darkBrown", "collared", "#f6b334", "angry", "beard", "mechanic"],
    ["sophia", "Sophia", "she", "fair", "longWaves", "blonde", "tee", "#f077a6", "happy", "headband", "florist", "buckTeeth"],
    ["zeke", "Zeke", "he", "brown", "locs", "black", "tee", "#f1e4c5", "neutral", "chain", "musician"],
    ["meilin", "Meilin", "she", "fair", "bob", "black", "tee", "#f5d5e8", "happy", "roundGlasses", "student", "goofyTeeth"],
    ["gianni", "Gianni", "he", "tan", "cropped", "silver", "turtleneck", "#6d5b43", "sad", "beard", "pharmacist"],
    ["aisha", "Aisha", "she", "amber", "hijab", "blueBlack", "tee", "#09806f", "neutral", "none", "translator"],
    ["lucas", "Lucas", "he", "fair", "curls", "brown", "collared", "#2a8b65", "neutral", "roundGlasses", "journalist"],
    ["stella", "Stella", "she", "fair", "bob", "pink", "jacket", "#2d2d36", "angry", "choker", "barista"],
    ["jamal", "Jamal", "he", "brown", "cropped", "black", "hoodie", "#f2dbac", "sad", "beanie", "engineer"],
    ["olivia", "Olivia", "she", "fair", "longWaves", "brown", "tee", "#63b7df", "happy", "hoops", "doctor", "warmSmile"],
    ["arjun", "Arjun", "he", "brown", "cropped", "black", "collared", "#1d69a4", "neutral", "squareGlasses", "lawyer"],
    ["matilda", "Matilda", "she", "fair", "curls", "copper", "overalls", "#f7a51b", "angry", "headband", "gardener"],
    ["niko", "Niko", "they", "fair", "messy", "blueBlack", "tee", "#1f1f22", "neutral", "necklace", "editor"],
    ["celeste", "Celeste", "she", "amber", "curls", "blonde", "jacket", "#0e78a8", "happy", "headband", "travel agent", "wideSmile"],
    ["ryan", "Ryan", "he", "fair", "cropped", "black", "hoodie", "#596e7a", "sad", "scarf", "delivery driver"],
    ["amira", "Amira", "she", "amber", "longWaves", "brown", "tee", "#813fc0", "angry", "hoops", "nurse"],
    ["eli", "Eli", "he", "fair", "sidePart", "blonde", "collared", "#9a6336", "neutral", "roundGlasses", "veterinarian"],
    ["sanaa", "Sanaa", "she", "deep", "coily", "black", "tee", "#da7623", "sad", "headband", "social worker"],
    ["milo", "Milo", "he", "fair", "cropped", "auburn", "hoodie", "#f4dfb7", "happy", "cap", "paramedic", "buckTeeth"],
    ["lara", "Lara", "she", "tan", "bob", "brown", "jacket", "#15946e", "angry", "necklace", "realtor"],
    ["bruno", "Bruno", "he", "tan", "curls", "black", "collared", "#bd322b", "neutral", "beard", "chef"],
    ["yara", "Yara", "she", "tan", "hijab", "brown", "tee", "#5c9a57", "sad", "none", "doctor"],
    ["asher", "Asher", "he", "fair", "messy", "blonde", "tee", "#242426", "neutral", "necklace", "software developer"],
    ["elena", "Elena", "she", "tan", "longWaves", "brown", "tee", "#c33f38", "happy", "hoops", "event planner", "bigSmile"],
    ["kai", "Kai", "he", "fair", "cropped", "black", "collared", "#0d66a5", "angry", "none", "pilot"],
    ["lucy", "Lucy", "she", "fair", "bob", "brown", "tee", "#d84e40", "sad", "beret", "artist"],
    ["romeo", "Romeo", "he", "deep", "cropped", "blonde", "collared", "#276f37", "neutral", "hoops", "tailor"],
    ["adeline", "Adeline", "she", "fair", "curls", "copper", "turtleneck", "#f1e4c5", "neutral", "roundGlasses", "professor"],
    ["felix", "Felix", "he", "fair", "curls", "brown", "hoodie", "#f4c02e", "happy", "cap", "student"],
    ["ines", "Ines", "she", "fair", "longWaves", "darkBrown", "tee", "#ed78a9", "angry", "headband", "shop owner"],
    ["priya", "Priya", "she", "brown", "longWaves", "black", "tee", "#7f42b5", "happy", "hoops", "dentist", "wideSmile"],
    ["hugo", "Hugo", "he", "fair", "curls", "brown", "collared", "#226aa0", "sad", "roundGlasses", "bus driver"],
    ["noor", "Noor", "she", "brown", "hijab", "blueBlack", "tee", "#5a7b69", "angry", "none", "librarian"],
    ["tyler", "Tyler", "he", "fair", "messy", "blonde", "jacket", "#282a2f", "neutral", "none", "contractor"]
  ];

  const mouthLabels = {
    warmSmile: "soft smile",
    bigSmile: "big smile",
    wideSmile: "wide toothy smile",
    bigOpenSmile: "big open smile",
    buckTeeth: "buck teeth",
    goofyTeeth: "goofy teeth",
    plain: "plain mouth"
  };

  const featureLabels = {
    hoodie: "hoodie",
    tee: "plain shirt",
    collared: "collared shirt",
    jacket: "jacket",
    turtleneck: "turtleneck",
    overalls: "overalls",
    messy: "messy hair",
    bob: "bob haircut",
    longWaves: "long wavy hair",
    curls: "curly hair",
    coily: "coily hair",
    locs: "braids or locs",
    cropped: "short hair",
    sidePart: "side-parted hair",
    bald: "bald head",
    hijab: "headscarf",
    glasses: "glasses",
    roundGlasses: "round glasses",
    squareGlasses: "square glasses",
    catEyeGlasses: "cat eye glasses",
    hoops: "hoop earrings",
    studs: "stud earrings",
    dropEarrings: "drop earrings",
    beard: "beard",
    moustache: "moustache",
    necklace: "necklace",
    chain: "chain necklace",
    choker: "choker",
    scarf: "knit scarf",
    bow: "bow tie",
    cap: "cap",
    capBack: "backwards cap",
    beanie: "beanie",
    beret: "beret",
    headband: "headband",
    flowerClip: "flower clip",
    bucketHat: "bucket hat",
    sunHat: "sun hat"
  };

  // Per-character design overrides folded in from the studio (exported corrections). Keyed by the
  // base seed id (not the "gen-" portrait id). Drop an exported character's correction block here to
  // make its studio look the permanent default.
  const characterOverrides = {
    aaron: {
      hair: "coily", faceShape: "long", clothing: "bare", accessory: "choker",
      headScaleX: 0.96, headScaleY: 1.08, headY: -7, eyeGap: 45, earScale: 0.88, earY: 2,
      jawShadowY: -4.5, cheekY: 2, cheekOpacity: 0, browY: 2, browScaleX: 0.92,
      irisScale: 0.84, eyeOpen: 0.8, eyeScale: 0.9, noseScale: 0.96, noseY: 3,
      mouthScale: 1.02, mouthY: 7, mouthStyle: "goofyTeeth", lipColor: "#25293c",
      shoulderSlope: 0.76, build: 71, bodyWidth: 1.32, bust: 0.15,
      accessoryY: 21, accessoryScale: 0.94, beardLength: 0.42,
      animMode: "serious", blinkRate: 11.5,
      eyeColor: "#5da2d0", background: "#f5a3c4",
      tattooText: "maga", tattooFont: "elegant", tattooX: 53, tattooY: -13, tattooScale: 0.55, tattooRot: 31, tattooSkewX: -1, tattooWarp: 0.38,
      hairLocks: [
        { lock: "longSideLock", x: 56, y: 26, scale: 0.4, rot: -111, lines: false },
        { lock: "spikyFringe", x: 41, y: 41, scale: 0.72, rot: -20, lines: true },
        { lock: "sideSwoop", x: 67, y: 32, scale: 0.42, rot: -52, lines: true },
        { lock: "curlyForelock", x: 65, y: 43, scale: 0.54, rot: 13, lines: true, line: "#160808" },
        { lock: "longSideLock", x: 69, y: 46, scale: 0.56, rot: -14, lines: true },
        { lock: "curtainBangs", x: 54, y: 41, scale: 0.52, rot: -7, lines: false, outline: "none" }
      ]
    },
    olivia: {
      hair: "bald", hairColor: "silver", skin: "porcelain", faceShape: "long",
      headScaleY: 0.99, headY: -5, eyeGap: 51,
      chinShape: "dimple", chinY: -10, chinWidth: 0.94, jawLength: 0.24, jawShadowY: -5.5,
      browShape: "thin", browScaleX: 1.04, browY: 3.5, earScale: 0.9, earY: -4,
      noseY: 2, noseScale: 1.06, cheekY: 2, cheekOpacity: 0.06,
      mouthY: 2, mouthScale: 1.28, mouthStyle: "wideSmile", lipColor: "#db295f",
      teethStyle: "even", teethGap: 4, teethX: -1, teethY: -5, teethScale: 1.14,
      eyeScale: 1.12, eyeOpen: 1.1, eyeY: 3,
      build: 75, clothing: "bare", shoulderSlope: 0.64, bodyWidth: 1.3, bust: 0.05, beardScale: 1.02,
      animMode: "serious", blinkRate: 0, winkRate: 16,
      hairLocks: [
        { lock: "sideSwoop", x: 60, y: 45, scale: 1, rot: 0, lines: true, outline: "none" },
        { lock: "rightCascade", x: 57, y: 83, scale: 0.66, rot: 19, lines: false },
        { lock: "extraLongPair", x: 49, y: 53, scale: 0.84, rot: 0, lines: true, mirror: true, behind: true },
        { lock: "centerPartWaves", x: 78, y: 43, scale: 0.64, rot: -54, lines: true, behind: true },
        { lock: "longSStrand", x: 72, y: 62, scale: 0.6, rot: -50, lines: false, mirror: true },
        { lock: "longSideLock", x: 75, y: 54, scale: 0.6, rot: 0, lines: true, outline: "none" },
        { lock: "longSideLock", x: 68, y: 48, scale: 0.56, rot: -144, lines: true, mirror: true, outline: "none" },
        { lock: "splitSideLocks", x: 47, y: 55, scale: 1.16, rot: 0, lines: true, mirror: true, behind: true },
        { lock: "longSStrand", x: 25, y: 55, scale: 1, rot: 0, lines: true },
        { lock: "highPonytail", x: 31, y: 46, scale: 0.82, rot: -23, lines: true, outline: "none" }
      ]
    },
    aisha: {
      hair: "bald", hairColor: "darkBrown", skin: "brown", faceShape: "heart",
      headScaleX: 0.97, headY: -10, eyeGap: 57, frontHairY: 2,
      browShape: "arched", browY: 2, browScaleX: 1.1,
      earVariant: "lobe", earY: 6, earScale: 1.08,
      mouthY: 4, mouthScale: 1.26, mouthStyle: "goofyTeeth", lipColor: "#583f32",
      teethStyle: "bucky", teethGap: 2.5, teethOverhang: 8, teethX: 4, teethY: 3, teethScale: 1.18,
      clothing: "jacket", shirt: "#2a3c39", accessory: "studs", accessoryY: 16, accessoryX: 1, accessoryScale: 0.94,
      chinY: 4, chinWidth: 1.14, chinScale: 1.24,
      cheekY: -1.5, cheekOpacity: 0.02, noseY: 0.5, beardLength: 0.38,
      eyeScale: 1.02, eyeOpen: 0.6, irisScale: 0.7, eyeY: 2.5,
      animMode: "shifty", blinkRate: 10, winkRate: 23,
      hairLocks: [
        { lock: "softWaveCap", x: 50, y: 36, scale: 0.76, rot: 0, lines: true },
        { lock: "highPonytail", x: 53, y: 36, scale: 0.78, rot: 0, lines: true, mirror: true },
        { lock: "curlyForelock", x: 16, y: 32, scale: 0.62, rot: 0, lines: true, mirror: true },
        { lock: "curlyForelock", x: 82, y: 43, scale: 0.6, rot: 0, lines: true },
        { lock: "shortCrop", x: 47, y: 36, scale: 0.68, rot: 21, lines: true, outline: "none" }
      ]
    },
    tiana: {
      hair: "bald", hairColor: "blueBlack", skin: "porcelain",
      headScaleX: 0.94, headScaleY: 1.08, headY: -8, eyeGap: 55,
      browShape: "arched", browY: -2, browScaleX: 0.96,
      eyeScale: 1.24, irisScale: 0.74, eyeOpen: 1.16, eyeY: 5,
      pupilX: -1, pupilY: -1.5, lazyEye: 8,
      noseScale: 0.64, mouthStyle: "goofyTeeth", mouthScale: 1.28, lips: "soft",
      chinShape: "dimple", chinY: -5, chinWidth: 0.62, chinScale: 0.58, jawLength: -0.18, jawShadowY: -4,
      cheekY: 3, cheekOpacity: 0.01,
      clothing: "collared", shirt: "#545454", bodyWidth: 1.02, shoulderSlope: 1, build: 71,
      accessoryY: 4, accessoryScale: 1.28, animMode: "alert"
    },
    gianni: {
      browShape: "thick", browY: 4.5, browScaleX: 1.04, browThick: 1.45,
      cheekOpacity: 0.02, pupilX: -1.5, pupilY: -1.5, eyeY: -2, eyeOpen: 0.54,
      jawShadowY: -2, jawLength: -0.03, chinY: 1, chinWidth: 1.06,
      smileLips: "off", lips: "full", lipColor: "#78503b", mouthScale: 1.08,
      headScaleX: 1.04, headScaleY: 1.08, headY: 8,
      earScale: 0.86, earVariant: "attached", earY: -3,
      accessory: "none", beardScale: 0.78, animMode: "serious", blinkRate: 6,
      hairLocks: [
        { lock: "shortCrop", x: 50, y: 44, scale: 0.82, rot: 5, lines: false, outline: "#1a1a1a", fill: "#000000", dark: "#000000" },
        { lock: "rightCascade", x: 59, y: 55, scale: 0.78, rot: 0, lines: true, outline: "none" },
        { lock: "sideSwoop", x: 66, y: 29, scale: 0.3, rot: -86, lines: false, outline: "none", fill: "#030303" }
      ],
      beardBlobs: [
        { dx: 44, y: 177, r: 12 },
        { dx: 27, y: 183, r: 16 },
        { dx: 14, y: 198, r: 16 },
        { dx: 33, y: 195, r: 25 },
        { dx: 10, y: 209, r: 28 },
        { dx: 40, y: 187, r: 16 }
      ]
    },
    ryan: {
      clothing: "tee", shirt: "#3a8866", eyeColor: "#466756",
      eyeScale: 0.96, eyeOpen: 1.2, irisScale: 0.82, pupilY: -1, lazyEye: -0.5,
      noseY: 2.5, cheekOpacity: 0.02, earScale: 0.88, earY: -3, earVariant: "lobe",
      smileLips: "off", mouthY: -1, teethScale: 0.76,
      jawLength: -0.02, jawShadowY: 2, chinY: -3,
      beardLength: 0.22, accessoryY: -8, accessoryScale: 0.8,
      animMode: "calm", shoulderSlope: 0.76, build: 64, bodyWidth: 1.06,
      tattooFont: "display", tattooRot: 20, tattooSkewX: -30, tattooScale: 0.6, tattooX: -34, tattooY: 8,
      hairLocks: [
        { lock: "curtainBangs", x: 65, y: 40, scale: 0.3, rot: -16, lines: false },
        { lock: "curtainBangs", x: 50, y: 40, scale: 0.4, rot: -7, lines: false, mirror: true, outline: "none" },
        { lock: "longCapLocks", x: 35, y: 40, scale: 0.3, rot: -20, lines: false, mirror: true, outline: "none" },
        { lock: "shortCrop", x: 48, y: 38, scale: 0.7, rot: 4, lines: false, outline: "none" }
      ]
    },
    meilin: {
      hair: "bald", hairColor: "auburn", skin: "tan", background: "#d6dbe0", shirt: "#e17fba",
      animMode: "serious", blinkRate: 5.5,
      earScale: 0.88, earVariant: "narrow", earY: 2,
      pupilX: 1, pupilY: -3.5, lazyEye: -2, irisScale: 0.8, eyeScale: 0.84, eyeOpen: 0.9,
      accessoryScale: 0.98, chinY: -4, chinWidth: 0.92,
      mouthStyle: "wideSmile", mouthScale: 0.72, lips: "soft", mouthY: 2,
      noseY: 3, build: 76, shoulderSlope: 0.98, bodyWidth: 0.94, bust: 0.05,
      hairLocks: [
        { lock: "curtainBangs", x: 39, y: 40, scale: 0.32, rot: 0, lines: false, outline: "none" },
        { lock: "curtainBangs", x: 51, y: 37, scale: 0.36, rot: 0, lines: false, outline: "none" },
        { lock: "splitSideLocks", x: 50, y: 45, scale: 0.78, rot: -9, lines: false, outline: "none" },
        { lock: "longCapLocks", x: 50, y: 55, scale: 1.02, rot: -17, lines: false, behind: true, mirror: true },
        { lock: "longSideLock", x: 61, y: 54, scale: 0.86, rot: 0, lines: true, behind: true },
        { lock: "longSideLock", x: 52, y: 83, scale: 0.82, rot: 13, lines: true, behind: true }
      ]
    },
    zeke: {
      frontHairY: -6, accessoryScale: 0.84, accessoryMetal: "roseGold", chainLink: 0.5,
      eyeScale: 0.72, eyeOpen: 1, eyeY: -2.5, pupilY: -2, lazyEye: -1, irisScale: 0.86,
      moustacheX: -2, mouthScale: 1.08, lips: "full", mouthY: -5,
      jawLength: 0.17, jawShadowY: -6,
      chinShape: "dimple", chinY: -16, chinWidth: 0.72, chinScale: 0.78,
      cheekOpacity: 0.05, cheekY: 3.5, earVariant: "attached", earY: -5,
      animMode: "serious", blinkRate: 1.5
    },
    // --- A few exploratory quirky looks on un-baked base characters (mostly beard-blob driven) ---
    bruno: {
      accessory: "none", browShape: "thick", browThick: 1.35, browY: 1,
      eyeOpen: 0.7, jawShadowY: -2, mouthScale: 1.06, headScaleX: 1.03,
      animMode: "serious", blinkRate: 8,
      hairLocks: [
        { lock: "messyTufts", x: 50, y: 34, scale: 0.8, rot: 0, lines: true },
        { lock: "sideSwoop", x: 64, y: 30, scale: 0.34, rot: -70, lines: false }
      ],
      beardBlobs: [
        { dx: 46, y: 176, r: 14 }, { dx: 30, y: 184, r: 17 }, { dx: 14, y: 197, r: 18 },
        { dx: 34, y: 196, r: 24 }, { dx: 8, y: 210, r: 30 }, { dx: 44, y: 188, r: 15 }
      ]
    },
    diego: {
      accessory: "none", browShape: "bushy", browThick: 1.2, eyeOpen: 0.74, beardLength: 0.12,
      animMode: "curious", blinkRate: 5, winkRate: 12,
      beardBlobs: [
        { dx: 44, y: 190, r: 15 }, { dx: 22, y: 188, r: 16 }, { dx: 10, y: 200, r: 17 },
        { dx: 30, y: 198, r: 22 }, { dx: 6, y: 208, r: 24 }
      ]
    },
    sophia: {
      faceShape: "long", hair: "bob", frontHairY: -7, clothing: "collared", shirt: "#dd2727",
      skin: "tan", background: "#d9d9d9", eyeColor: "#3b6842",
      browShape: "arched", browThick: 1.75, browScaleX: 0.9, browY: 2.5,
      headScaleX: 0.98, headScaleY: 0.93, headY: -10, eyeGap: 45,
      irisScale: 0.7, eyeOpen: 0.88, eyeScale: 0.86, eyeY: 3, lazyEye: -2.5, pupilY: -3, pupilX: 0.5,
      teethStyle: "bucky", teethOverhang: 0.5, mouthStyle: "wideSmile", teethGap: 9.5, teethX: -7, teethScale: 0.72,
      earScale: 0.84, earY: -5, chinY: -8, chinWidth: 0.82, chinScale: 0.74,
      accessory: "studs", accessoryScale: 0.84, accessoryColor: "#1a4c6b",
      bust: 0.5, bodyWidth: 1.08, shoulderSlope: 0.7, build: 73, beardX: -1,
      animMode: "alert", blinkRate: 11,
      beardBlobs: [
        { dx: 19, y: 205, r: 7 }, { dx: 12, y: 203, r: 11 }, { dx: 2, y: 210, r: 8 }
      ]
    },
    niko: {
      faceShape: "long", chainLink: 0.85, accessoryY: 5, accessory: "squareGlasses", accessoryScale: 1.22,
      eyeScale: 0.98, eyeOpen: 1.02, eyeColor: "#283158", lips: "soft", mouthScale: 0.88, lipColor: "#d27f6a",
      earScale: 0.9, earVariant: "lobe", earY: 3, animMode: "serious", winkRate: 8, blinkRate: 10.5,
      headY: -6, headScaleY: 1.03, headScaleX: 0.97, eyeGap: 47,
      browScaleX: 0.92, browThick: 0.85, browShape: "arched",
      noseY: 4, noseTip: "button", noseWidth: 0.63, noseScale: 1.26,
      jawLength: -0.07, jawShadowY: -1, chinShape: "round", chinY: -1, chinWidth: 0.8, chinScale: 0.64,
      hairLocks: [
        { lock: "rightCascade", x: 42, y: 40, scale: 0.5, rot: -132, lines: true, outline: "none" },
        { lock: "rightCascade", x: 57, y: 39, scale: 0.58, rot: -75, lines: true, outline: "none" },
        { lock: "rightCascade", x: 44, y: 34, scale: 0.46, rot: -106, lines: false, outline: "none" },
        { lock: "longSStrand", x: 70, y: 47, scale: 0.42, rot: 0, lines: true, mirror: true, outline: "none", behind: true },
        { lock: "ribbonWaveLeft", x: 40, y: 51, scale: 0.46, rot: 5, lines: false, behind: true }
      ]
    },
    javier: {
      browThick: 1.15, eyeOpen: 0.78, mouthScale: 1.04, animMode: "shifty", blinkRate: 6,
      beardBlobs: [
        { dx: 0, y: 206, r: 13 }, { dx: 12, y: 199, r: 11 }, { dx: 9, y: 214, r: 12 }
      ]
    },
    sanaa: {
      browShape: "arched", browThick: 1.1, eyeScale: 1.06, eyeOpen: 1.0, cheekOpacity: 0.1,
      animMode: "alert", blinkRate: 3.5, lips: "full", lipColor: "#7a3b46",
      hairLocks: [
        { lock: "curlyForelock", x: 24, y: 30, scale: 0.66, rot: 0, lines: true, mirror: true },
        { lock: "curlyForelock", x: 76, y: 30, scale: 0.66, rot: 0, lines: true },
        { lock: "softWaveCap", x: 50, y: 32, scale: 0.8, rot: 0, lines: true }
      ]
    }
  };

  function createCharacters(makeTags, fallbackCharacters = []) {
    const fallbackRoles = fallbackCharacters.map((character) => character.role);
    return seedSpecs.map((seed, index) => {
      const [id, name, pronouns, skin, hair, hairColor, clothingStyle, shirt, expression, accessory, role, mouthStyle] = seed;
      const build = buildFor(id, index, pronouns, role);
      const traits = {
        faceShape: Object.keys(faceShapes)[index % Object.keys(faceShapes).length],
        skin,
        hair,
        hairColor,
        clothing: clothingStyle,
        shirt,
        expression,
        mouthStyle: mouthStyle || defaultMouthStyle(index, expression),
        accessory,
        accent: accentFor(index, accessory),
        background: backgrounds[index % backgrounds.length],
        eyeGap: eyeGapFor(index),
        // Natural iris palette, brown-weighted like real portraits (no fantasy violet, muted blue):
        // 3 brown variants + forest green + steel blue + hazel-amber.
        eyeColor: ["#5a3d28", "#6a4b3b", "#43301f", "#3f6048", "#45698f", "#7a5530"][index % 6],
        hairProfile: hairProfileFor(id, hair),
        beardProfile: beardProfileFor(id, accessory),
        portraitProfile: portraitProfileFor(id, index),
        earVariant: earVariantFor(id, index),
        browShape: browShapeFor(id, index),
        teethStyle: teethStyleFor(id, index),
        lips: lipsFor(id, index, pronouns),
        neckLength: neckLengthFor(id, index),
        build,
        shoulderSlope: slopeFor(build, pronouns)
      };
      // Studio-tuned per-character overrides (folded in from exported corrections). Flat keys win over
      // the seed/profile defaults; getProfile() picks up any profileOverrideKeys (eyeScale, jawLength…)
      // and hairLocks/categorical traits are read straight off traits.
      Object.assign(traits, characterOverrides[id] || {});
      const feature = describeVisibleTraits(traits);
      return {
        id: `gen-${id}`,
        name,
        pronouns,
        feature,
        secret: secretForExpression(expression),
        role: role || fallbackRoles[index % fallbackRoles.length] || "local witness",
        image: composePortrait(index, traits),
        tags: makeTags(name, secretForExpression(expression), role || "local witness"),
        variant: "",
        traits,
        // Seed is kept so the portrait can be re-rendered later with a changed expression
        // (eg. the Hidden Agendas mystery) without the face's gradients/jitter shifting.
        seed: index
      };
    });
  }

  function shadeColor(hex, factor) {
    const clean = hex.replace("#", "");
    const num = parseInt(clean, 16);
    const channel = (shift) => {
      const value = Math.round(Math.min(255, ((num >> shift) & 0xff) * factor));
      return value.toString(16).padStart(2, "0");
    };
    return `#${channel(16)}${channel(8)}${channel(0)}`;
  }

  // Linear blend between two hex colours (t=0 → a, t=1 → b). Unlike shadeColor (a channel multiply,
  // which can't meaningfully lighten near-black hair) this can lift a dark colour toward grey.
  function mixColor(a, b, t) {
    const pa = parseInt(a.replace("#", ""), 16);
    const pb = parseInt(b.replace("#", ""), 16);
    const ch = (sh) => {
      const va = (pa >> sh) & 0xff, vb = (pb >> sh) & 0xff;
      return Math.round(va + (vb - va) * t).toString(16).padStart(2, "0");
    };
    return `#${ch(16)}${ch(8)}${ch(0)}`;
  }

  // Hair-strand tones, contrast-aware: on dark hair the texture reads as LIGHTER strands (jade/rosa
  // refs), but shadeColor can't lighten near-black, so blend toward a cool grey instead. On medium/
  // light hair a darker lowlight reads best (kevin/penny refs).
  function hairStrandTones(hair) {
    const n = parseInt(hair.replace("#", ""), 16);
    const lum = 0.299 * ((n >> 16) & 0xff) + 0.587 * ((n >> 8) & 0xff) + 0.114 * (n & 0xff);
    if (lum < 90) {
      return { low: mixColor(hair, "#8b8e99", 0.55), hi: mixColor(hair, "#c2c5cf", 0.5) };
    }
    return { low: shadeColor(hair, 0.66), hi: shadeColor(hair, 1.2) };
  }

  function composePortrait(seed, traits) {
    // traits.skinHex lets callers force an explicit skin colour (eg. the Monocultural
    // mystery paints every face the same tone); otherwise resolve the named skin tone.
    const skin = traits.skinHex || skinTones[traits.skin] || skinTones.fair;
    const hair = hairColors[traits.hairColor];
    const expression = expressions[traits.expression];
    const faceShape = warpJaw(faceShapes[traits.faceShape], getProfile(traits).jawLength);
    const hairStyle = hairStyles[traits.hair] || hairStyles.messy;
    const outfit = clothing[traits.clothing];
    const accessorySvg = renderAccessory(traits, faceShape);
    // Styles mapped to faces.js silhouettes render as one piece on top of the face; the rest keep
    // this project's original back/front hair.
    const useFacesHair = typeof window !== "undefined" && window.facesHair && window.facesHair.has(traits.hair);
    const facesHairSvg = useFacesHair
      ? `<g transform='translate(0 ${Number(traits.frontHairY) || 0})'>${window.facesHair.render(traits.hair, `url(#hair-${seed})`, traits.hairOutline || ink, { ...hairStrandTones(hair), hairHex: hair, seed })}</g>`
      : "";
    const svg = `
      <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'>
        <defs>
          <style>
            .fixed-stroke path, .fixed-stroke circle, .fixed-stroke rect, .fixed-stroke ellipse, .fixed-stroke line, .fixed-stroke polyline, .fixed-stroke polygon {
              vector-effect: non-scaling-stroke;
            }
          </style>
          <linearGradient id='hair-${seed}' x1='0.2' y1='0' x2='0.8' y2='1'>
            <stop offset='0' stop-color='${shadeColor(hair, 1.1)}'/>
            <stop offset='0.6' stop-color='${hair}'/>
            <stop offset='1' stop-color='${shadeColor(hair, 0.86)}'/>
          </linearGradient>
        </defs>
        ${traits.headOnly ? "" : `<rect width='256' height='256' fill='${traits.background}'/>`}
        ${animCSS(traits, seed)}
        ${traits.headOnly ? "" : renderClothing(outfit, traits, seed)}
        ${traits.headOnly ? "" : renderNeckBase(traits, skin)}
        ${traits.headOnly ? "" : renderCollar(traits)}
        ${traits.headOnly ? "" : renderTattoo(traits, "body")}
        ${traits.noHead ? renderNeckStump(traits, skin) : ""}
        ${traits.noHead ? "" : headGroup(traits, `
          ${renderHairLocks(traits, seed, hair, true)}
          ${useFacesHair ? "" : renderBackHair(hairStyle, `url(#hair-${seed})`, traits)}
          ${renderEars(traits, skin)}
          <path d='${faceShape}' fill='${skin}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
          ${renderFaceShading(seed, skin, faceShape)}
          ${renderFaceModeling(seed, skin, traits)}
          ${renderFaceLines(seed, skin, traits)}
          ${renderChin(traits, skin)}
          ${renderBeardBlobs(traits, seed)}
          ${accessorySvg.behindHair || ""}
          ${useFacesHair ? "" : renderFrontHair(hairStyle, `url(#hair-${seed})`, traits) + renderHairHighlights(hairStyle, hair, traits, seed)}
          <g class='fa-brow'>${renderBrows(expression, traits)}</g>
          ${renderEyes(expression, traits)}
          ${renderNose(seed, traits)}
          ${accessorySvg.beforeMouth}
          ${renderExpressionMouth(expression, traits, seed)}
          ${renderTattoo(traits, "face")}
          ${/* Blush comes solely from renderFaceModeling's cheekOpacity (the studio Blush control).
               The old expression-based renderCheeks() blush was a second layer that doubled up on
               happy/surprised faces, so it's no longer drawn. */ ""}
          ${/* faces.js hair sits ON TOP of the face features (like the reference art) so swept hair
               overlaps the brow/cheek/temple instead of the brow & blush poking through it */ ""}
          ${useFacesHair ? facesHairSvg : ""}
          ${renderHairLocks(traits, seed, hair, false)}
          ${accessorySvg.afterMouth}
        `)}
        ${traits.headOnly ? "" : renderDrawnLocks(traits, seed, hair)}
      </svg>
    `;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  // Freely-placed decorative hair locks (the studio Lock Designer writes traits.hairLocks). Each is
  // themed to the hair colour and drawn on top of the hair, in array order = z-order (last = front).
  // behind=true renders the locks flagged `behind` (drawn at the very back of the head group, behind
  // the face + ears for depth); behind=false renders the rest on top of the hair. Index stays stable
  // across both passes so each lock keeps a unique gradient/clip seed.
  function renderHairLocks(traits, seed, hair, behind) {
    const locks = traits.hairLocks;
    if (!Array.isArray(locks) || !locks.length) return "";
    if (!(typeof window !== "undefined" && window.facesHair && window.facesHair.renderLock)) return "";
    return locks
      .map((inst, i) => ({ inst, i }))
      // Drawn (pen-tool) locks carry a raw `d` in portrait space and are rendered at top level by
      // renderDrawnLocks (outside the head group), so they're skipped in these in-head passes.
      .filter(({ inst }) => !inst.d && Boolean(inst.behind) === Boolean(behind))
      .map(({ inst, i }) => window.facesHair.renderLock(inst, { hair, fill: `url(#hair-${seed})`, ink, seed: `${seed}-l${i}` }))
      .join("");
  }

  // Pen-tool hair: locks whose `d` is a raw path drawn in portrait (256x256) coordinates. Rendered at
  // the top of the portrait (not inside the head group) so the studio's screen->256 mapping is exact.
  function renderDrawnLocks(traits, seed, hair) {
    const locks = traits.hairLocks;
    if (!Array.isArray(locks) || !locks.length) return "";
    if (!(typeof window !== "undefined" && window.facesHair && window.facesHair.renderLock)) return "";
    return locks
      .map((inst, i) => ({ inst, i }))
      .filter(({ inst }) => Boolean(inst.d))
      .map(({ inst, i }) => window.facesHair.renderLock(inst, { hair, fill: `url(#hair-${seed})`, ink, seed: `${seed}-d${i}` }))
      .join("");
  }

  // Scales/moves the whole head (skin, ears, hair, brows, eyes, nose, mouth, accessories) as one
  // unit so resizing it never desyncs a feature from the skull it's drawn on - that mismatch
  // (eg. a beard floating off a narrowed jaw) is what broke earlier per-feature resize attempts.
  function headGroup(traits, content) {
    // Global framing: shrink the head and lift it up so the portrait isn't "head-heavy".
    // The reference art frames the head in roughly the top ~60% with a clear neck and
    // shoulders below; ours used to fill almost the whole frame with the chin touching the
    // collar. FRAME_SCALE/FRAME_LIFT pull every head back to reveal neck + body.
    const FRAME_SCALE = 0.86;
    const FRAME_LIFT = -16;
    const scaleX = (Number(traits.headScaleX) || 1) * FRAME_SCALE;
    const scaleY = (Number(traits.headScaleY) || 1) * FRAME_SCALE;
    const x = Number(traits.headX) || 0;
    const y = (Number(traits.headY) || 0) + FRAME_LIFT;
    const pivotX = 128;
    const pivotY = 150;
    // Deliberately NOT using the fixed-stroke/non-scaling-stroke trick here: under a non-uniform
    // scale (different X/Y), non-scaling-stroke renders the line weight unevenly around curves
    // (thin on some sides, thick on others) instead of a clean proportional resize. Letting the
    // stroke scale naturally with the transform keeps line weight consistent and looks like a
    // true resize of the artwork rather than a geometry-only stretch.
    // Inner `.fa-head` group carries the optional head-sway animation so it composes with this
    // transform rather than overriding it.
    return `<g transform='translate(${x} ${y}) translate(${pivotX} ${pivotY}) scale(${scaleX} ${scaleY}) translate(-${pivotX} -${pivotY})'><g class='fa-head'>${content}</g></g>`;
  }

  // Opt-in idle animation, emitted as a <style> embedded in the portrait SVG (works in an <img>:
  // declarative CSS animation runs without script). animMode picks a preset; blinkRate/winkRate can
  // override the cadence. A per-seed phase desyncs characters so they don't blink in unison.
  function animCSS(traits, seed) {
    const mode = traits.animMode || "still";
    const cfg = {
      calm:    { blink: 5,   dart: 0,   sway: 0,   wink: 0,  brow: 0,  breathe: 7 },
      curious: { blink: 4,   dart: 6,   sway: 0,   wink: 14, brow: 9,  breathe: 0 },
      serious: { blink: 7,   dart: 0,   sway: 6,   wink: 0,  brow: 0,  breathe: 0 },
      shifty:  { blink: 3,   dart: 3.5, sway: 0,   wink: 0,  brow: 0,  breathe: 0 },
      alert:   { blink: 2.6, dart: 5,   sway: 0,   wink: 0,  brow: 6,  breathe: 0 },
      smug:    { blink: 4.5, dart: 0,   sway: 4.5, wink: 8,  brow: 7,  breathe: 0 },
      sleepy:  { blink: 2.2, dart: 0,   sway: 9,   wink: 0,  brow: 0,  breathe: 0 }
    }[mode];
    if (!cfg) return ""; // still / unknown
    const blink = traits.blinkRate != null && traits.blinkRate !== "" ? Number(traits.blinkRate) : cfg.blink;
    const wink = traits.winkRate != null && traits.winkRate !== "" ? Number(traits.winkRate) : cfg.wink;
    const dart = cfg.dart;
    const sway = cfg.sway;
    const brow = cfg.brow || 0;
    const breathe = cfg.breathe || 0;
    const ph = (Math.sin((seed + 1) * 12.9898) * 43758.5453) % 1; // deterministic 0..1 phase
    const ph2 = (Math.sin((seed + 7) * 78.233) * 12543.6789) % 1;  // a 2nd independent 0..1 value
    // Eye-dart travel: 0..1, normalised. Defaults to a per-character value so the roster varies.
    const dartAmt = traits.eyeDart != null && traits.eyeDart !== ""
      ? Math.max(0, Math.min(1, Number(traits.eyeDart)))
      : 0.35 + 0.55 * Math.abs(ph2);
    const d = (period) => (-(Math.abs(ph) * period)).toFixed(2);
    // A blink/wink should take a fixed amount of TIME no matter the interval, so its keyframe width is
    // (duration / interval); short intervals don't make a frantic blink. Blink duration gets a
    // per-character ±20% jitter so the roster doesn't blink in lockstep.
    const BLINK_DUR = 0.18 * (1 + 0.2 * (Math.abs(ph2) * 2 - 1)), WINK_DUR = 0.34;
    const widthPct = (dur, period) => Math.max(1, Math.min(26, (dur / period) * 100));
    const kf = [];
    const rules = ["g.fa-eye,g.fa-iris{transform-box:fill-box;transform-origin:center}"];
    if (blink > 0) {
      const bw = widthPct(BLINK_DUR, blink);
      const bs = (100 - bw).toFixed(2);          // blink begins
      const bm = (100 - bw * 0.5).toFixed(2);     // eye fully shut
      // The eye squishes a touch while the skin lid sweeps down over it (a real-feeling blink).
      kf.push(`@keyframes faBlink{0%,${bs}%,100%{transform:scaleY(1)}${bm}%{transform:scaleY(.82)}}`);
      kf.push(`@keyframes faLid{0%,${bs}%,100%{transform:translateY(-30px)}${bm}%{transform:translateY(0)}}`);
      rules.push(`g.fa-eye{animation:faBlink ${blink}s infinite;animation-delay:${d(blink)}s}`);
      rules.push(`g.fa-lid{animation:faLid ${blink}s infinite;animation-delay:${d(blink)}s}`);
    }
    if (dart > 0) {
      // Travel scaled by dartAmt (eyeDart). Base magnitudes are generous so eyeDart=1 reads as a big
      // look-around and eyeDart≈0 barely moves.
      const a = (n) => (n * dartAmt).toFixed(2);
      kf.push(`@keyframes faDart{0%,16%{translate:0 0}20%,38%{translate:${a(3.8)}px ${a(-1.7)}px}42%,60%{translate:${a(-4.2)}px ${a(1.4)}px}64%,82%{translate:${a(1.7)}px ${a(2.4)}px}86%,100%{translate:0 0}}`);
      rules.push(`g.fa-iris{animation:faDart ${dart}s infinite;animation-delay:${d(dart)}s}`);
    }
    if (wink > 0) {
      // A wink is the SAME skin-lid sweep as the blink, but on the right eye only (.fa-winklid), so it
      // reads as a clean lid closing - not the old scaleY squish that folded the eye in on itself.
      const ww = widthPct(WINK_DUR, wink);
      const a = (50 - ww / 2).toFixed(2), b = (50 + ww / 2).toFixed(2);
      kf.push(`@keyframes faWinkLid{0%,${a}%,${b}%,100%{transform:translateY(-30px)}50%{transform:translateY(0)}}`);
      rules.push(`g.fa-winklid{animation:faWinkLid ${wink}s infinite;animation-delay:${d(wink)}s}`);
    }
    if (sway > 0) {
      kf.push("@keyframes faSway{0%,100%{transform:rotate(-1.1deg)}50%{transform:rotate(1.1deg)}}");
      rules.push(`g.fa-head{transform-box:view-box;transform-origin:128px 205px;animation:faSway ${sway}s ease-in-out infinite;animation-delay:${d(sway)}s}`);
    } else if (breathe > 0) {
      // A gentle breathing bob (only when not swaying, since both ride the .fa-head group).
      kf.push("@keyframes faBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(1.1px) scale(1.006)}}");
      rules.push(`g.fa-head{transform-box:view-box;transform-origin:128px 210px;animation:faBreathe ${breathe}s ease-in-out infinite;animation-delay:${d(breathe)}s}`);
    }
    if (brow > 0) {
      // An occasional eyebrow raise - a quick lift then settle, most of the cycle at rest.
      const lift = (0.7 + 0.6 * Math.abs(ph)).toFixed(2);
      kf.push(`@keyframes faBrow{0%,68%,100%{transform:translateY(0)}76%,88%{transform:translateY(-${lift}px)}}`);
      rules.push(`g.fa-brow{animation:faBrow ${brow}s ease-in-out infinite;animation-delay:${d(brow)}s}`);
    }
    return `<style>${kf.join("")}${rules.join("")}</style>`;
  }

  // Custom text tattoo, placed on the chest/neck. Movable, scalable, rotatable and skewable, with a
  // choice of font families. Drawn over the clothing.
  const tattooFonts = {
    bold: "Archivo, system-ui, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    script: "'Brush Script MT', 'Segoe Script', cursive",
    mono: "'Courier New', ui-monospace, monospace",
    display: "'Press Start 2P', Impact, fantasy",
    gothic: "'Trattatello', 'Papyrus', 'Luminari', fantasy",
    slab: "'Rockwell', 'Roboto Slab', Georgia, serif",
    impact: "Impact, 'Haettenschweiler', 'Arial Narrow Bold', sans-serif",
    rounded: "'Arial Rounded MT Bold', 'Quicksand', system-ui, sans-serif",
    comic: "'Comic Sans MS', 'Chalkboard SE', cursive",
    typewriter: "'American Typewriter', 'Courier New', monospace",
    condensed: "'Arial Narrow', 'Roboto Condensed', sans-serif",
    elegant: "'Palatino Linotype', 'Book Antiqua', Palatino, serif",
    hand: "'Bradley Hand', 'Segoe Print', 'Marker Felt', cursive",
    stencil: "'Stencil', 'Allerta Stencil', Impact, sans-serif"
  };
  // place: "body" anchors on the chest (drawn in the torso layer); "face" anchors on the cheek
  // (drawn inside the head group so it moves/scales with the head).
  function renderTattoo(traits, place) {
    const text = traits.tattooText;
    if (!text) return "";
    const where = traits.tattooPlace || "body";
    if (where !== place) return "";
    const baseX = 128;
    const baseY = place === "face" ? 178 : 236;
    const x = baseX + (Number(traits.tattooX) || 0);
    const y = baseY + (Number(traits.tattooY) || 0);
    const scale = Number(traits.tattooScale) || 1;
    const rot = Number(traits.tattooRot) || 0;
    const skew = Number(traits.tattooSkewX) || 0;
    const font = tattooFonts[traits.tattooFont] || tattooFonts.bold;
    const color = traits.tattooColor || "#23232b";
    const esc = String(text).replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
    // Warp: a turbulence displacement filter that smears/distorts the lettering beyond a flat skew.
    const warp = Math.max(0, Number(traits.tattooWarp) || 0);
    const fid = `twarp-${place}`;
    const filt = warp > 0
      ? `<defs><filter id='${fid}' x='-40%' y='-60%' width='180%' height='220%'>`
        + `<feTurbulence type='turbulence' baseFrequency='0.035 0.08' numOctaves='2' seed='6' result='n'/>`
        + `<feDisplacementMap in='SourceGraphic' in2='n' scale='${(warp * 16).toFixed(1)}' xChannelSelector='R' yChannelSelector='G'/>`
        + `</filter></defs>`
      : "";
    const filterAttr = warp > 0 ? ` filter='url(#${fid})'` : "";
    return `<g transform='translate(${x} ${y}) rotate(${rot}) skewX(${skew}) scale(${scale})'>${filt}`
      + `<text x='0' y='0'${filterAttr} text-anchor='middle' font-family="${font}" font-size='17' font-weight='700' fill='${color}' opacity='0.9'>${esc}</text></g>`;
  }

  function renderClothing(outfit, traits, seed) {
    const garment = clothing[traits.clothing] || clothing.tee;
    const skin = skinTones[traits.skin] || "#c89070";
    const c = traits.shirt;
    const fill = garment.bare ? skin : c;       // bare/singlet show skin shoulders, not the shirt
    const lo = shadeColor(fill, 0.84);
    const sh = Number(traits.build) || 82;
    // A single soft chest-shadow arc near the neck for depth (no hard arm/torso seam lines - those
    // created a visible kink/"join" on the shoulder).
    const arc = `M${128 - sh * 0.5} 248C${128 - sh * 0.3} 228 ${128 - sh * 0.14} 220 128 220C${128 + sh * 0.14} 220 ${128 + sh * 0.3} 228 ${128 + sh * 0.5} 248`;
    // Sleeve seams: a curved stitch where each sleeve meets the torso, so a clothed body reads as an
    // actual garment with shoulders/arms instead of a single flat colour wedge. Skipped when bare.
    const seam = (s) => {
      const x0 = 128 + s * (sh * 0.62), x1 = 128 + s * (sh * 0.98);
      return `<path d='M${(x0).toFixed(1)} 214 C ${(x0 + s * 8).toFixed(1)} 226 ${(x1 - s * 4).toFixed(1)} 234 ${(x1).toFixed(1)} 252' fill='none' stroke='${lo}' stroke-width='${stroke.detail}' stroke-linecap='round' opacity='.5'/>`;
    };
    const sleeves = garment.bare ? "" : seam(-1) + seam(1);
    const body = `
      <path d='${shoulderPath(traits)}' fill='${fill}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
      ${renderBust(traits, sh, shadeColor(fill, 0.78))}
      <path d='${arc}' fill='none' stroke='${lo}' stroke-width='${stroke.detail}' stroke-linecap='round' opacity='.38'/>
      ${sleeves}
      ${traits.clothing === "singlet" ? renderSinglet(traits, c, sh) : ""}
    `;
    return `<g transform='translate(0 256) scale(1 1.13) translate(0 -256)'>${body}</g>`;
  }

  // Bust hint as a central Y: two curved branches sweeping in from each breast to a fork, then a
  // cleavage stem dropping out of frame. Scaled by traits.bust (0 = none). Drawn in the body's own
  // lowlight so it works clothed or bare.
  function renderBust(traits, sh, lo) {
    const bust = Number(traits.bust) || 0;
    if (bust <= 0) return "";
    const f = (n) => n.toFixed(1);
    const forkY = 246 - bust * 12;            // the fork (top of the cleavage)
    const spread = 18 + bust * 16;            // how far the branches reach out
    const branchTopY = forkY - 16 - bust * 12;
    const stemBotY = 257;                     // run the stem off the bottom edge
    const op = (0.4 + bust * 0.22).toFixed(2);
    const w = 2.6;
    const branchL = `M${f(128 - spread)} ${f(branchTopY)}Q${f(128 - spread * 0.38)} ${f(forkY - 2)} 128 ${f(forkY)}`;
    const branchR = `M${f(128 + spread)} ${f(branchTopY)}Q${f(128 + spread * 0.38)} ${f(forkY - 2)} 128 ${f(forkY)}`;
    const stem = `M128 ${f(forkY)}L128 ${f(stemBotY)}`;
    const stroke = (d) => `<path d='${d}' fill='none' stroke='${lo}' stroke-width='${w}' stroke-linecap='round' opacity='${op}'/>`;
    return stroke(branchL) + stroke(branchR) + stroke(stem);
  }

  // A spaghetti-strap singlet: a shirt-coloured scoop-neck panel over the torso with two thin straps
  // up over the shoulders. Drawn on top of the (skin) bare body so the shoulders/arms stay bare.
  function renderSinglet(traits, c, sh) {
    const f = (n) => n.toFixed(1);
    const lo = shadeColor(c, 0.82);
    const y = necklineY(traits);
    const stX = sh * 0.28;               // strap x-offset from centre
    const top = y - 2;
    const scoop = top + 26;              // depth of the scoop neckline
    const half = sh * 0.86;              // panel half-width at the bottom
    const panel = `M${f(128 - stX)} ${f(top)}`
      + `C${f(128 - stX - 4)} ${f(top + 34)} ${f(128 - half)} ${f(230)} ${f(128 - half)} 256`
      + `L${f(128 + half)} 256`
      + `C${f(128 + half)} ${f(230)} ${f(128 + stX + 4)} ${f(top + 34)} ${f(128 + stX)} ${f(top)}`
      + `Q128 ${f(scoop)} ${f(128 - stX)} ${f(top)}Z`;
    const strap = (s) => `<path d='M${f(128 + s * (stX + 5))} ${f(top - 1)}L${f(128 + s * (stX + 8))} ${f(196)}L${f(128 + s * (stX + 2))} ${f(196)}L${f(128 + s * (stX - 1))} ${f(top - 1)}Z' fill='${c}' stroke='${ink}' stroke-width='${stroke.feature}' stroke-linejoin='round'/>`;
    return `${strap(-1)}${strap(1)}`
      + `<path d='${panel}' fill='${c}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>`
      + `<path d='M${f(128 - stX + 4)} ${f(top + 6)}Q128 ${f(scoop + 4)} ${f(128 + stX - 4)} ${f(top + 6)}' fill='none' stroke='${lo}' stroke-width='${stroke.detail}' stroke-linecap='round' opacity='.5'/>`;
  }

  // Generates the shoulder/torso silhouette as smooth curves (no straight "arm" segments, which
  // read as boxy/lego). `build` drives width; `slope` drives the droop - slim builds get sloped,
  // contoured shoulders, bulky builds get broad, squarer (but still rounded) ones. Each side is two
  // smoothly-joined cubics: neck -> rounded deltoid -> arm, so the shoulder is a curve, not a corner.
  function shoulderPath(traits) {
    const sh = Math.max(60, Math.min(104, Number(traits.build) || 82)); // shoulder half-width
    const slope = traits.shoulderSlope != null
      ? Math.max(0, Math.min(1, Number(traits.shoulderSlope)))
      : Math.max(0.18, Math.min(0.9, 0.92 - (sh - 68) / 42));           // slim->sloped, bulky->squarer
    const neckHalf = sh < 76 ? 22 : 24;
    const neckY = 200;
    const tipY = 211 + slope * 20;          // how far the shoulder drops
    // Bottom (torso) half-width as a fraction of the shoulder width. 1 = straight sides (no tuck);
    // >1 flares the body out (reads as a torso, not a tapering limbless wedge); <1 tucks it in.
    const botHalf = sh * (Number(traits.bodyWidth) || 1);
    const r = 7 + slope * 4;                // shoulder rounding radius
    const nl = 128 - neckHalf, nr = 128 + neckHalf;
    const tl = 128 - sh, tr = 128 + sh;
    const bl = 128 - botHalf, br = 128 + botHalf;
    const dropY = neckY + 4 + slope * 7;
    return `M${nl} ${neckY}`
      + ` C ${nl - 7} ${dropY} ${(tl + r).toFixed(1)} ${(tipY - r - 2).toFixed(1)} ${tl} ${tipY.toFixed(1)}`
      + ` C ${(tl - r + 2).toFixed(1)} ${(tipY + r).toFixed(1)} ${bl - 1} ${(tipY + 13).toFixed(1)} ${bl} 256`
      + ` L ${br} 256`
      + ` C ${br + 1} ${(tipY + 13).toFixed(1)} ${(tr + r - 2).toFixed(1)} ${(tipY + r).toFixed(1)} ${tr} ${tipY.toFixed(1)}`
      + ` C ${(tr - r).toFixed(1)} ${(tipY - r - 2).toFixed(1)} ${nr + 7} ${dropY} ${nr} ${neckY} Z`;
  }

  // Neckline geometry shared by the skin column and the collar so they always meet on the same
  // curve. `y` is where the neckline crosses; it dips ~7px lower at centre for a soft crew curve.
  function necklineY(traits) {
    return 200 + (Number(traits.neckLength) || 0);
  }

  function renderNeckBase(traits, skin) {
    // Starts up behind the (lifted) chin and runs down into a softly rounded crew neckline so the
    // shirt opening reads as a curve, not a hard rectangle.
    const top = 150;
    const y = necklineY(traits);
    // Bare/singlet: the neck merges straight into the chest - no crew-neckline curve (that bottom
    // stroke read as a choker/necklace under the neck). Fill the column + stroke only the sides.
    if ((clothing[traits.clothing] || {}).bare) {
      const fill = `M106 ${top} L106 ${y + 12} L150 ${y + 12} L150 ${top} Z`;
      const sides = `M106 ${top} L106 ${y + 12} M150 ${top} L150 ${y + 12}`;
      return `<path d='${fill}' fill='${skin}'/><path d='${sides}' fill='none' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linecap='round'/>`;
    }
    const d = `M106 ${top} L106 ${y} Q128 ${y + 14} 150 ${y} L150 ${top} Z`;
    return `<path d='${d}' fill='${skin}' stroke='${ink}' stroke-width='${stroke.contour}'/>`;
  }

  // The cut neck left behind in Fireworks Mode (when the head has popped off). A skin-rimmed wound
  // at the top of the neck column with a ragged red interior - no "white chopped-off" rectangle.
  function renderNeckStump(traits, skin) {
    const cx = 128, y = 150;
    const rim = shadeColor(skin, 0.82);
    // ragged top edge of the neck stump
    const ragged = `M106 ${y} C112 ${y - 6} 118 ${y + 3} 124 ${y - 4} C128 ${y - 8} 132 ${y + 2} 138 ${y - 4} C144 ${y + 3} 150 ${y - 5} 150 ${y} Z`;
    return `<g>`
      + `<path d='${ragged}' fill='${skin}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>`
      + `<ellipse cx='${cx}' cy='${y - 1}' rx='20' ry='7' fill='${rim}'/>`
      + `<ellipse cx='${cx}' cy='${y - 1}' rx='15' ry='5' fill='#8a1018'/>`          // muscle ring
      + `<ellipse cx='${cx}' cy='${y - 1}' rx='8' ry='3' fill='#5a0a10'/>`            // trachea/centre
      + `<ellipse cx='${cx}' cy='${y - 1.5}' rx='3.4' ry='1.6' fill='#c98'/>`         // bone glint
      + `</g>`;
  }

  // Per-garment collar, drawn ON TOP of the skin neck so its curved opening shapes the neckline.
  function renderCollar(traits) {
    if ((clothing[traits.clothing] || {}).collar === "none") return ""; // bare / singlet
    const c = traits.shirt;
    const lo = shadeColor(c, 0.8);
    const hi = shadeColor(c, 1.14);
    const rib = shadeColor(c, 0.66);
    const dk = shadeColor(c, 0.6);
    const y = necklineY(traits);
    const cy = y + 7; // centre of the neckline dip
    const style = traits.clothing;
    const SC = stroke.contour, SF = stroke.feature, SD = stroke.detail;
    // Mirror a left-side path group around the x=128 centreline (for symmetric lapels/hoods).
    const mirror = (markup) => `<g transform='matrix(-1 0 0 1 256 0)'>${markup}</g>`;

    if (style === "turtleneck") {
      // a tall folded tube hugging the neck with vertical ribbing + a soft horizontal fold
      let ribs = "";
      for (let x = 110; x <= 146; x += 6) ribs += `<path d='M${x} ${y - 24} L${x} ${y - 2}'/>`;
      return `
        <path d='M104 ${y} Q128 ${cy} 152 ${y} L152 ${y - 24} Q128 ${y - 35} 104 ${y - 24} Z' fill='${c}' stroke='${ink}' stroke-width='${SC}' stroke-linejoin='round'/>
        <g stroke='${rib}' stroke-width='1.2' opacity='.5'>${ribs}</g>
        <path d='M107 ${y - 13} Q128 ${y - 5} 149 ${y - 13}' fill='none' stroke='${dk}' stroke-width='${SF}' stroke-linecap='round' opacity='.7'/>
      `;
    }
    if (style === "vneck") {
      // a V-neck knit: a chunky ribbed V-trim, with the shirt body filling the V.
      const trim = `M104 ${y - 2} L128 ${y + 34} L152 ${y - 2}`;
      let ribs = "";
      for (let x = 110; x <= 146; x += 6) { const t = Math.abs(x - 128) / 24; ribs += `<path d='M${x} ${(y + 2).toFixed(0)} L${x} ${(y + 2 + (1 - t) * 22).toFixed(0)}'/>`; }
      return `
        <path d='${trim}' fill='none' stroke='${ink}' stroke-width='5.5' stroke-linejoin='round'/>
        <path d='${trim}' fill='none' stroke='${c}' stroke-width='3' stroke-linejoin='round'/>
        <path d='M110 ${y} L128 ${y + 27} L146 ${y}' fill='none' stroke='${lo}' stroke-width='${SD}' opacity='.55'/>
        <g stroke='${rib}' stroke-width='1' opacity='.4'>${ribs}</g>
      `;
    }
    if (style === "collared") {
      // an open button-up shirt: two pointed collar flaps + a button placket down the chest
      const flapL = `M127 ${y + 4} L104 ${y + 1} L99 ${y + 16} L126 ${y + 22} Z`;
      let buttons = "";
      for (let i = 0; i < 3; i++) buttons += `<circle cx='128' cy='${y + 26 + i * 13}' r='2.1' fill='${hi}' stroke='${ink}' stroke-width='1.2'/>`;
      return `
        <path d='M128 ${y + 5} L150 ${cy} 156 ${y + 12}' fill='none' stroke='none'/>
        <path d='M128 ${y + 22} L128 256' stroke='${dk}' stroke-width='2.4' opacity='.55'/>
        <path d='${flapL}' fill='${c}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>
        ${mirror(`<path d='${flapL}' fill='${c}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>`)}
        ${buttons}
      `;
    }
    if (style === "blazer") {
      // a tailored blazer: peaked lapels over a lighter inner shirt-V and a knotted tie.
      const shirtV = `M115 ${y + 1} L128 ${y + 40} L141 ${y + 1} Z`;
      const lapelL = `M104 ${y - 1} L128 ${y + 6} L124 ${y + 44} L98 ${y + 18} Z`;
      const tie = `M128 ${y + 6} L122 ${y + 13} L126 ${y + 50} L130 ${y + 50} L134 ${y + 13} Z`;
      const knot = `M124 ${y + 5} L132 ${y + 5} L130 ${y + 12} L126 ${y + 12} Z`;
      return `
        <path d='${shirtV}' fill='${shadeColor(c, 1.5)}' stroke='${ink}' stroke-width='${SD}' stroke-linejoin='round'/>
        <path d='${tie}' fill='${dk}' stroke='${ink}' stroke-width='${SD}' stroke-linejoin='round'/>
        <path d='${knot}' fill='${shadeColor(dk, 1.15)}' stroke='${ink}' stroke-width='${SD}' stroke-linejoin='round'/>
        <path d='${lapelL}' fill='${c}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>
        ${mirror(`<path d='${lapelL}' fill='${c}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>`)}
        <path d='M104 ${y - 1} L116 ${y + 9}' fill='none' stroke='${dk}' stroke-width='${SD}' opacity='.6'/>
        ${mirror(`<path d='M104 ${y - 1} L116 ${y + 9}' fill='none' stroke='${dk}' stroke-width='${SD}' opacity='.6'/>`)}
      `;
    }
    if (style === "jacket") {
      // a zip-up jacket: stand-collar band + centre zip (teeth + pull) and two soft front seams
      const band = `M150 ${y} Q128 ${cy} 106 ${y} L101 ${y + 11} Q128 ${cy + 14} 155 ${y + 11} Z`;
      let teeth = "";
      for (let ty = y + 16; ty <= y + 50; ty += 4) teeth += `<path d='M125 ${ty} L131 ${ty}'/>`;
      return `
        <path d='${band}' fill='${c}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>
        <path d='M110 ${y + 11} C 112 ${y + 28} 116 ${y + 40} 120 ${y + 52}' fill='none' stroke='${lo}' stroke-width='${SD}' stroke-linecap='round' opacity='.5'/>
        <path d='M146 ${y + 11} C 144 ${y + 28} 140 ${y + 40} 136 ${y + 52}' fill='none' stroke='${lo}' stroke-width='${SD}' stroke-linecap='round' opacity='.5'/>
        <path d='M128 ${y + 6} V ${y + 52}' stroke='${ink}' stroke-width='2.6' stroke-linecap='round'/>
        <g stroke='${rib}' stroke-width='1.1' opacity='.55'>${teeth}</g>
        <circle cx='128' cy='${y + 13}' r='2.3' fill='${hi}' stroke='${ink}' stroke-width='1.4'/>
      `;
    }
    if (style === "hoodie") {
      // a pullover hoodie: two bunched hood rolls flanking the neck, a kangaroo pocket + drawstrings.
      const hoodL = `M101 ${y + 16} C 88 ${y - 4} 93 ${y - 30} 113 ${y - 26} C 122 ${y - 8} 118 ${y + 8} 112 ${y + 18} Z`;
      const band = `M150 ${y} Q128 ${cy} 106 ${y} L102 ${y + 6} Q128 ${cy + 8} 154 ${y + 6} Z`;
      const pocket = `M104 244 Q128 250 152 244 L152 256 L104 256 Z`;
      return `
        <path d='${hoodL}' fill='${lo}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>
        ${mirror(`<path d='${hoodL}' fill='${lo}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>`)}
        <path d='${band}' fill='${c}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>
        <path d='${pocket}' fill='${lo}' stroke='${dk}' stroke-width='${SD}' stroke-linejoin='round' opacity='.85'/>
        <path d='M118 246 L116 256 M138 246 L140 256' stroke='${dk}' stroke-width='1.8' stroke-linecap='round' opacity='.7'/>
        <path d='M120 ${y + 6} L116 ${y + 32}M136 ${y + 6} L140 ${y + 32}' stroke='${dk}' stroke-width='2.6' stroke-linecap='round'/>
        <circle cx='116' cy='${y + 34}' r='2.4' fill='${hi}' stroke='${ink}' stroke-width='1.3'/>
        <circle cx='140' cy='${y + 34}' r='2.4' fill='${hi}' stroke='${ink}' stroke-width='1.3'/>
      `;
    }
    if (style === "overalls") {
      // bib panel + two rounded straps over the shoulders
      return `
        <path d='M104 ${y + 6} Q128 ${y + 16} 152 ${y + 6} L152 ${y + 52} L104 ${y + 52} Z' fill='${c}' stroke='${ink}' stroke-width='${stroke.feature}' stroke-linejoin='round'/>
        <path d='M104 ${y + 8} C 92 ${y - 2} 80 ${y - 4} 70 ${y + 2}' fill='none' stroke='${c}' stroke-width='10' stroke-linecap='round'/>
        <path d='M152 ${y + 8} C 164 ${y - 2} 176 ${y - 4} 186 ${y + 2}' fill='none' stroke='${c}' stroke-width='10' stroke-linecap='round'/>
        <path d='M104 ${y + 8} C 92 ${y - 2} 80 ${y - 4} 70 ${y + 2}' fill='none' stroke='${ink}' stroke-width='2' stroke-linecap='round' opacity='.6'/>
        <path d='M152 ${y + 8} C 164 ${y - 2} 176 ${y - 4} 186 ${y + 2}' fill='none' stroke='${ink}' stroke-width='2' stroke-linecap='round' opacity='.6'/>
        <circle cx='112' cy='${y + 16}' r='2.2' fill='${hi}' stroke='${ink}' stroke-width='1.4'/>
        <circle cx='144' cy='${y + 16}' r='2.2' fill='${hi}' stroke='${ink}' stroke-width='1.4'/>
      `;
    }

    // default: crew tee — a ribbed collar band hugging the neckline curve
    const band = `M150 ${y} Q128 ${cy} 106 ${y} L102 ${y + 6} Q128 ${cy + 8} 154 ${y + 6} Z`;
    let ribs = "";
    for (let x = 108; x <= 148; x += 5) {
      const t = (x - 128) / 22;
      const ry = y + 7 * (1 - t * t);
      ribs += `<path d='M${x} ${ry + 1} L${x} ${ry + 5}'/>`;
    }
    return `
      <path d='${band}' fill='${lo}' stroke='${ink}' stroke-width='${SF}' stroke-linejoin='round'/>
      <g stroke='${rib}' stroke-width='1' stroke-linecap='round' opacity='.5'>${ribs}</g>
    `;
  }

  function renderEars(traits, skin) {
    const variants = {
      round: {
        left: "<circle cx='64' cy='140' r='14' fill='{skin}' stroke='{ink}' stroke-width='3.6'/>",
        right: "<circle cx='192' cy='140' r='14' fill='{skin}' stroke='{ink}' stroke-width='3.6'/>",
        detail: "<path d='M60 139c5 4 9 4 13 0M183 139c5 4 9 4 13 0' fill='none' stroke='{softInk}' stroke-width='2.2' stroke-linecap='round'/>"
      },
      attached: {
        left: "<ellipse cx='64' cy='141' rx='13' ry='15' fill='{skin}' stroke='{ink}' stroke-width='3.6'/>",
        right: "<ellipse cx='192' cy='141' rx='13' ry='15' fill='{skin}' stroke='{ink}' stroke-width='3.6'/>",
        detail: "<path d='M59 136c4 3 8 7 9 12M188 136c-4 3-8 7-9 12' fill='none' stroke='{softInk}' stroke-width='2.1' stroke-linecap='round'/>"
      },
      narrow: {
        left: "<ellipse cx='64' cy='140' rx='11' ry='16' fill='{skin}' stroke='{ink}' stroke-width='3.6'/>",
        right: "<ellipse cx='192' cy='140' rx='11' ry='16' fill='{skin}' stroke='{ink}' stroke-width='3.6'/>",
        detail: "<path d='M61 133c3 5 4 10 3 15M195 133c-3 5-4 10-3 15' fill='none' stroke='{softInk}' stroke-width='2.1' stroke-linecap='round'/>"
      },
      lobe: {
        left: "<path d='M52 132c1-9 8-14 15-14 8 0 14 7 14 17 0 8-3 15-7 18-2 2-5 3-7 3s-5-1-8-4c-4-4-7-11-7-20Z' fill='{skin}' stroke='{ink}' stroke-width='3.6' stroke-linejoin='round'/>",
        right: "<path d='M204 132c-1-9-8-14-15-14-8 0-14 7-14 17 0 8 3 15 7 18 2 2 5 3 7 3s5-1 8-4c4-4 7-11 7-20Z' fill='{skin}' stroke='{ink}' stroke-width='3.6' stroke-linejoin='round'/>",
        detail: "<path d='M61 136c4 4 6 8 6 14M195 136c-4 4-6 8-6 14' fill='none' stroke='{softInk}' stroke-width='2.1' stroke-linecap='round'/>"
      }
    };
    const template = variants[traits.earVariant] || variants.round;
    const rendered = [template.left, template.right, template.detail]
      .join("")
      .replaceAll("{skin}", skin)
      .replaceAll("{ink}", ink)
      .replaceAll("{softInk}", softInk);
    const scale = Number(traits.earScale) || 1;
    const y = Number(traits.earY) || 0;
    if (scale === 1 && !y) return rendered;
    return `<g transform='translate(0 ${y}) translate(128 140) scale(${scale}) translate(-128 -140)'>${rendered}</g>`;
  }

  // Soft shadows CLIPPED to the face shape so they sit inside the face (never spill onto hair/bg) -
  // a radial vignette for overall roundness plus hairline, cheek-hollow and jaw shadows give the
  // flat skin real depth (cheekbones / jaw definition) without any hard lines.
  function renderFaceShading(seed, skin, faceShapePath) {
    const clipId = `face-${seed}`;
    const sh2 = shadeColor(skin, 0.72);
    const hi = shadeColor(skin, 1.12);
    // Soft, feathered blobs CLIPPED to the face: shadows at the temples, cheek-hollows, jaw and
    // hairline + light highlights on the cheekbones/forehead give real cheek definition. Each blob
    // fades to transparent at its own edge so nothing leaves a hard band where the clip cuts it.
    return `
      <defs>
        <clipPath id='${clipId}'><path d='${faceShapePath}'/></clipPath>
        <radialGradient id='fblob-${seed}'>
          <stop offset='0' stop-color='${sh2}' stop-opacity='0.55'/>
          <stop offset='0.6' stop-color='${sh2}' stop-opacity='0.3'/>
          <stop offset='1' stop-color='${sh2}' stop-opacity='0'/>
        </radialGradient>
        <radialGradient id='fhi-${seed}'>
          <stop offset='0' stop-color='${hi}' stop-opacity='0.5'/>
          <stop offset='0.7' stop-color='${hi}' stop-opacity='0.2'/>
          <stop offset='1' stop-color='${hi}' stop-opacity='0'/>
        </radialGradient>
      </defs>
      <g clip-path='url(#${clipId})'>
        <ellipse cx='79' cy='118' rx='26' ry='46' fill='url(#fblob-${seed})' opacity='0.7'/>
        <ellipse cx='177' cy='118' rx='26' ry='46' fill='url(#fblob-${seed})' opacity='0.7'/>
        <ellipse cx='102' cy='150' rx='17' ry='22' fill='url(#fblob-${seed})' opacity='0.4'/>
        <ellipse cx='154' cy='150' rx='17' ry='22' fill='url(#fblob-${seed})' opacity='0.4'/>
        <ellipse cx='92' cy='162' rx='20' ry='26' fill='url(#fblob-${seed})' opacity='0.45'/>
        <ellipse cx='164' cy='162' rx='20' ry='26' fill='url(#fblob-${seed})' opacity='0.45'/>
        <ellipse cx='128' cy='74' rx='58' ry='26' fill='url(#fblob-${seed})' opacity='0.4'/>
        <ellipse cx='99' cy='133' rx='16' ry='15' fill='url(#fhi-${seed})' opacity='0.55'/>
        <ellipse cx='157' cy='133' rx='16' ry='15' fill='url(#fhi-${seed})' opacity='0.55'/>
        <ellipse cx='128' cy='100' rx='30' ry='22' fill='url(#fhi-${seed})' opacity='0.4'/>
      </g>
    `;
  }

  // Per-character, opt-in chin. chinShape: none|round|square|dimple|pointed. Tonal (crease above +
  // a highlight + an underside form-shadow arc) so it reads as a half-sphere/jaw mass without a hard
  // pasted-on outline. Movable (chinY) and resizable (chinWidth/chinScale).
  function renderChin(traits, skin) {
    const shape = traits.chinShape;
    if (!shape || shape === "none") return "";
    const cy = 198 + (Number(traits.chinY) || 0) + jawDrop(getProfile(traits).jawLength, 198);
    const hw = 22 * (Number(traits.chinWidth) || 1);
    const hh = 14 * (Number(traits.chinScale) || 1);
    const sh = shadeColor(skin, 0.84);
    const sh2 = shadeColor(skin, 0.9);
    const hi = shadeColor(skin, 1.1);
    const f = (n) => n.toFixed(1);
    let bottom;
    if (shape === "square") {
      bottom = `M${f(128 - hw)} ${f(cy)}C${f(128 - hw)} ${f(cy + hh * 1.2)} ${f(128 - hw * 0.55)} ${f(cy + hh * 1.5)} ${f(128)} ${f(cy + hh * 1.5)}C${f(128 + hw * 0.55)} ${f(cy + hh * 1.5)} ${f(128 + hw)} ${f(cy + hh * 1.2)} ${f(128 + hw)} ${f(cy)}`;
    } else if (shape === "pointed") {
      bottom = `M${f(128 - hw)} ${f(cy)}C${f(128 - hw * 0.85)} ${f(cy + hh * 1.4)} ${f(128 - hw * 0.2)} ${f(cy + hh * 1.95)} ${f(128)} ${f(cy + hh * 1.95)}C${f(128 + hw * 0.2)} ${f(cy + hh * 1.95)} ${f(128 + hw * 0.85)} ${f(cy + hh * 1.4)} ${f(128 + hw)} ${f(cy)}`;
    } else {
      bottom = `M${f(128 - hw)} ${f(cy)}C${f(128 - hw)} ${f(cy + hh * 1.5)} ${f(128 + hw)} ${f(cy + hh * 1.5)} ${f(128 + hw)} ${f(cy)}`;
    }
    const crease = `M${f(128 - hw * 0.82)} ${f(cy - hh * 0.45)}Q128 ${f(cy - hh)} ${f(128 + hw * 0.82)} ${f(cy - hh * 0.45)}`;
    const dimple = shape === "dimple"
      ? `<path d='M128 ${f(cy - hh * 0.1)}l0 ${f(hh * 0.8)}' fill='none' stroke='${sh}' stroke-width='2.2' stroke-linecap='round' opacity='0.5'/>`
      : "";
    return `
      <ellipse cx='128' cy='${f(cy + hh * 0.15)}' rx='${f(hw * 0.55)}' ry='${f(hh * 0.5)}' fill='${hi}' opacity='0.3'/>
      <path d='${bottom}' fill='none' stroke='${sh}' stroke-width='3.6' stroke-linecap='round' opacity='0.5'/>
      <path d='${crease}' fill='none' stroke='${sh2}' stroke-width='2.4' stroke-linecap='round' opacity='0.45'/>
      ${dimple}
    `;
  }

  // Per-character, opt-in "blob" beard. traits.beardBlobs = [{ dx, y, r }] (dx = distance from the
  // x=128 centreline; each blob is auto-mirrored to both sides, dx~0 = a single centre blob). The
  // blobs carry NO individual outlines: an ink-filled DILATED copy of every blob is drawn first, then
  // the beard-colour fills on top cover all the interior ink - so the ink shows only as a single rim
  // around the merged silhouette (interior seams vanish). A clipped lowlight adds a little depth.
  function renderBeardBlobs(traits, seed) {
    const blobs = traits.beardBlobs;
    if (!Array.isArray(blobs) || !blobs.length) return "";
    const hairHex = hairColors[traits.hairColor] || "#3a2418";
    const beard = shadeColor(hairHex, 0.8);
    const lo = shadeColor(hairHex, 0.62);
    const ow = 3.4; // outline thickness (the dilation amount)
    const circles = [];
    blobs.forEach((b) => {
      const dx = Math.abs(Number(b.dx) || 0);
      const y = Number(b.y) || 196;
      const r = Math.max(4, Number(b.r) || 16);
      if (dx < 2) circles.push([128, y, r]);
      else { circles.push([128 - dx, y, r]); circles.push([128 + dx, y, r]); }
    });
    const c = (cx, cy, r, fill) => `<circle cx='${cx.toFixed(1)}' cy='${cy.toFixed(1)}' r='${r.toFixed(1)}' fill='${fill}'/>`;
    const outline = circles.map(([x, y, r]) => c(x, y, r + ow, ink)).join("");
    const fill = circles.map(([x, y, r]) => c(x, y, r, beard)).join("");
    // lowlight: a darker fill on the lower portion of each blob, clipped to the union so it stays inside
    const clipId = `beardblob-${seed}`;
    const clip = circles.map(([x, y, r]) => `<circle cx='${x.toFixed(1)}' cy='${y.toFixed(1)}' r='${r.toFixed(1)}'/>`).join("");
    const low = circles.map(([x, y, r]) => c(x, y + r * 0.55, r * 0.7, lo)).join("");
    const body = `${outline}${fill}<defs><clipPath id='${clipId}'>${clip}</clipPath></defs><g clip-path='url(#${clipId})' opacity='0.5'>${low}</g>`;
    // Optional skew (around the beard centre ~128,205) to lean/taper the whole mass.
    const skx = Number(traits.beardSkewX) || 0;
    const sky = Number(traits.beardSkewY) || 0;
    if (!skx && !sky) return body;
    return `<g transform='translate(128 205) skewX(${skx}) skewY(${sky}) translate(-128 -205)'>${body}</g>`;
  }

  function renderFaceModeling(seed, skin, traits) {
    const profile = getProfile(traits);
    const cheekY = 150 + (profile.cheekY || 0);
    const cheekOpacity = (profile.cheekOpacity || 0.09).toFixed(2);
    const cheek = seed % 2
      ? `<ellipse cx='88' cy='${cheekY}' rx='13' ry='6' fill='#dc6f6a' opacity='${cheekOpacity}'/><ellipse cx='168' cy='${cheekY}' rx='13' ry='6' fill='#dc6f6a' opacity='${cheekOpacity}'/>`
      : `<ellipse cx='89' cy='${cheekY + 1}' rx='11' ry='5' fill='#dc6f6a' opacity='${Math.max((profile.cheekOpacity || 0.09) - 0.02, 0.04).toFixed(2)}'/><ellipse cx='167' cy='${cheekY + 1}' rx='11' ry='5' fill='#dc6f6a' opacity='${Math.max((profile.cheekOpacity || 0.09) - 0.02, 0.04).toFixed(2)}'/>`;
    // Nasolabial fold: a soft crease from each nostril wing down to just outside the mouth corner.
    // The reference art (penny/jade/kevin) always carries this faint pair on a smile - its absence is
    // the #1 "flat/AI" tell. Gated to smiling expressions and kept very soft (skin-shadow tone, low
    // opacity, round caps) so it reads as cheek form, not a drawn line. Sits under the nose/mouth.
    // Nasolabial folds + all other face creases now live in renderFaceLines (fully controllable).
    return `
      ${cheek}
      <path d='M84 ${134 + (profile.eyeSocketY || 0)}c6-4 16-6 27-3M145 ${131 + (profile.eyeSocketY || 0)}c12-3 22-1 28 4' fill='none' stroke='rgba(255,255,255,.09)' stroke-width='2' stroke-linecap='round'/>
      <path d='M104 ${201 + (profile.jawShadowY || 0) + jawDrop(profile.jawLength, 201)}c10 6 38 6 48 0' fill='none' stroke='rgba(24,21,18,.05)' stroke-width='3' stroke-linecap='round'/>
    `;
  }

  // Customisable face lines/creases. Every line type has its own 0..1 opacity (faceLineOpacity scales
  // them all). Nasolabial folds default on for smiles (as before); the rest default off so existing
  // characters are unchanged until the controls are dialled up.
  function renderFaceLines(seed, skin, traits) {
    const profile = getProfile(traits);
    const expr = expressions[traits.expression];
    const smiling = expr && (expr.teeth || expr.openMouth);
    const dk = shadeColor(skin, 0.8);
    const mult = (traits.faceLineOpacity != null && traits.faceLineOpacity !== "") ? Number(traits.faceLineOpacity) : 1;
    const op = (key, def) => {
      const v = (traits[key] != null && traits[key] !== "") ? Number(traits[key]) : def;
      return Math.max(0, Math.min(1, v * mult));
    };
    const line = (d, o, w) => o > 0 ? `<path d='${d}' fill='none' stroke='${dk}' stroke-width='${w || 1.6}' stroke-linecap='round' opacity='${o.toFixed(2)}'/>` : "";
    let out = "";
    // Nasolabial folds (nostril wing -> outside mouth corner)
    const ny = 150 + (profile.nasoY || 0);
    out += line(`M119 ${ny}C114 157 110 162 106 167M137 ${ny}C142 157 146 162 150 167`, op("nasoOpacity", smiling ? 0.55 : 0), 1.8);
    // Forehead horizontal wrinkles
    const fo = op("foreheadLineOpacity", 0);
    out += line("M99 105q29 -6 58 0", fo) + line("M97 112q31 -7 62 0", fo) + line("M100 119q28 -5 56 0", fo);
    // Frown lines (glabella, between the brows)
    const fr = op("frownLineOpacity", 0);
    out += line("M124 117q-1 6 0 11", fr, 1.4) + line("M132 117q1 6 0 11", fr, 1.4);
    // Under-eye lines / eye bags
    const ue = op("underEyeOpacity", 0);
    out += line("M99 145q10 4 22 1", ue, 1.3) + line("M135 146q12 3 22 -1", ue, 1.3);
    // Crow's feet (outer eye corners)
    const cf = op("crowsFeetOpacity", 0);
    out += line("M92 133l-7 -4M92 137l-8 1M93 141l-6 4", cf, 1.2) + line("M164 133l7 -4M164 137l8 1M163 141l6 4", cf, 1.2);
    // Marionette lines (mouth corners curving down)
    const mo = op("marionetteOpacity", 0);
    out += line("M106 169c-3 8 -3 14 -1 21", mo, 1.4) + line("M150 169c3 8 3 14 1 21", mo, 1.4);
    // Cheek hollows (a soft curve under each cheekbone)
    const ch = op("cheekLineOpacity", 0);
    out += line("M90 150c2 9 7 15 14 18", ch, 1.4) + line("M166 150c-2 9 -7 15 -14 18", ch, 1.4);
    return out;
  }

  // Fine hair-toned strand lines sweeping from the crown down to the hairline - the defining detail
  // of the reference art. sweep=0 fans the strands outward from the centre (centre part); a nonzero
  // sweep drifts them all one way (side-swept styles).
  function flowStrands(color, sweep, span, count = 8) {
    const { topY, botY, xL, xR } = span;
    let out = "";
    for (let i = 0; i < count; i++) {
      const t = i / (count - 1);
      const x0 = xL + t * (xR - xL);
      const jit = (Math.abs(Math.sin(i * 51.3)) % 1 - 0.5) * 5;
      const drift = sweep !== 0 ? sweep : (x0 - 128) * 0.16;
      const sx = x0 + jit;
      const c1 = sx + drift * 0.4;
      const c2 = sx + drift * 0.8;
      const ex = sx + drift;
      const c1y = topY + (botY - topY) * 0.32;
      const c2y = topY + (botY - topY) * 0.62;
      out += `<path d='M${sx.toFixed(1)} ${topY}C${c1.toFixed(1)} ${c1y.toFixed(1)} ${c2.toFixed(1)} ${c2y.toFixed(1)} ${ex.toFixed(1)} ${botY}' fill='none' stroke='${color}' stroke-width='1.3' stroke-linecap='round' opacity='.4'/>`;
    }
    return out;
  }

  function renderHairHighlights(style, hair, traits, seed) {
    // Base-hair strand lines disabled by request - they read as stringy on the base silhouette. The
    // per-lock line texture (renderLock) is kept. Early return leaves the smooth shape only.
    return "";
    if (!style.front || style.covered) return "";
    // Internal strand lines are the defining feature of the reference hair (penny/kevin/jade): a
    // mostly-smooth shape carried by many fine flowing lines in tones of the hair colour.
    let inner = "";
    if (style.longFlow) {
      // Long waves: fine lines fanning from the centre part, flowing down through both locks, each a
      // gentle S-wave following the silhouette. Clipped to the front layer so they stay on the hair.
      const dark = shadeColor(hair, 0.8);
      const lite = shadeColor(hair, 1.14);
      const N = 7;
      let marks = "";
      for (const side of [-1, 1]) {
        for (let k = 0; k < N; k++) {
          const t = k / (N - 1);
          const topX = 128 + side * (6 + t * 56), topY = 86 - t * 42;
          const botX = 128 + side * (52 + t * 22), botY = 236 + t * 16;
          const m1x = topX + side * ((botX - topX) * 0.28) - side * 10, m1y = topY + (botY - topY) * 0.34;
          const m2x = topX + side * ((botX - topX) * 0.6) + side * 9, m2y = topY + (botY - topY) * 0.66;
          const lit = k % 3 === 0;
          marks += `<path d='${catmull([[topX, topY], [m1x, m1y], [m2x, m2y], [botX, botY]], false)}' fill='none' stroke='${lit ? lite : dark}' stroke-width='${lit ? 1.6 : 2}' stroke-linecap='round' opacity='${lit ? 0.5 : 0.62}'/>`;
        }
      }
      const part = `<path d='M127 50Q128 70 127 86' fill='none' stroke='${dark}' stroke-width='1.6' stroke-linecap='round' opacity='.5'/>`;
      const sheen = `<path d='M98 58Q128 46 158 58' fill='none' stroke='${lite}' stroke-width='2.4' stroke-linecap='round' opacity='.5'/>`;
      inner = marks + part + sheen;
    } else if (style.texture === "curls" || style.texture === "coils") {
      const dark = shadeColor(hair, 0.64);
      const lite = shadeColor(hair, 1.22);
      const tight = style.texture === "coils";
      // flowing strands sweeping down from the crown (not a dot grid) - reads as hair texture
      const count = tight ? 9 : 7;
      let marks = "";
      for (let i = 0; i < count; i++) {
        const j = Math.sin(i * 12.9898) * 43758.5453;
        const jit = (j - Math.floor(j) - 0.5) * 6;
        const x = 66 + (i / (count - 1)) * 116 + jit;
        const y = 60 + ((i % 2) ? 5 : 0) + Math.abs(jit) * 0.4;
        const curve = tight
          ? `q-5 9 -1 17 q4 8 -1 15`
          : `q-3 12 2 22 q5 9 -1 17`;
        marks += `<path d='M${x.toFixed(1)} ${y.toFixed(1)} ${curve}' fill='none' stroke='${dark}' stroke-width='1.5' stroke-linecap='round' opacity='.45'/>`;
      }
      const sheen = `<path d='M84 ${tight ? 70 : 72}q22 -9 46 -3' fill='none' stroke='${lite}' stroke-width='2.6' stroke-linecap='round' opacity='.5'/>`;
      inner = marks + sheen;
    } else if (style.texture === "locs") {
      inner = "<path d='M76 87v55M99 68v70M123 61v71M148 65v72M171 82v60' fill='none' stroke='rgba(255,255,255,.12)' stroke-width='2.4' stroke-linecap='round'/>";
    } else {
      // Smooth styles: many fine hair-toned strands following the sweep, plus one soft sheen.
      const dark = shadeColor(hair, 0.74);
      const lite = shadeColor(hair, 1.18);
      let sweep = -8; // default = side-swept (messy and most fronts sweep one way)
      let span = { topY: 62, botY: 92, xL: 82, xR: 176 };
      if (style.sidePart) {
        sweep = -11;
        span = { topY: 60, botY: 98, xL: 80, xR: 180 };
      } else if (style.bun || style === hairStyles.bob || style === hairStyles.longWaves) {
        sweep = 0; // centre part: fan outward
        span = { topY: 60, botY: 100, xL: 78, xR: 178 };
      } else if (style === hairStyles.cropped) {
        sweep = -6;
        span = { topY: 70, botY: 90, xL: 84, xR: 172 };
      }
      const strands = flowStrands(dark, sweep, span, style === hairStyles.cropped ? 7 : 9);
      const sheenY = span.topY + 8;
      const sheen = `<path d='M${(span.xL + 10).toFixed(0)} ${sheenY}q24 -8 48 -2' fill='none' stroke='${lite}' stroke-width='2.4' stroke-linecap='round' opacity='.42'/>`;
      const bun = style.bun ? `<path d='M115 47c10-7 24-7 34 0' fill='none' stroke='${lite}' stroke-width='2.4' stroke-linecap='round' opacity='.4'/>` : "";
      inner = strands + sheen + bun;
    }
    if (!inner) return "";
    // Clip every strand/highlight to the hair silhouette so none can escape onto skin or float off
    // into the background as loose threads. Clip to the back blob (the full hair shape); fall back to
    // the front shape only if back isn't a real path.
    // Long waves clip to the front layer (crown + locks) so strands don't fall on the forehead that
    // the wide back blob would otherwise cover; other styles clip to the full back silhouette.
    const clipShape = style.longFlow ? style.front : (style.back && style.back[0] === "M" ? style.back : style.front);
    if (!clipShape || clipShape[0] !== "M") return inner;
    const clipId = `hairclip-${seed}`;
    return `<defs><clipPath id='${clipId}'><path d='${clipShape}'/></clipPath></defs><g clip-path='url(#${clipId})'>${inner}</g>`;
  }

  function renderBackHair(style, hair, traits) {
    if (!style.back) return "";
    const fill = style.covered ? traits.shirt : hair;
    const strokeWidth = style.sidePart ? 4 : 4.3;
    const y = Number(traits.backHairY) || 0;
    const hi = traits.hairOutline || ink;
    return `<g transform='translate(0 ${y})'><path d='${style.back}' fill='${fill}' stroke='${hi}' stroke-width='${strokeWidth}' stroke-linejoin='round'/>${renderHairTexture(style, hair, traits)}</g>`;
  }

  function renderFrontHair(style, hair, traits) {
    if (!style.front) return "";
    const hi = traits.hairOutline || ink;
    const y = Number(traits.frontHairY) || 0;
    const wrap = (svg) => y ? `<g transform='translate(0 ${y})'>${svg}</g>` : svg;
    if (style.covered) {
      return wrap(`
        <path d='M73 104c11-31 32-47 55-47s44 16 55 47v98' fill='none' stroke='${hi}' stroke-width='3.8' stroke-linecap='round' stroke-linejoin='round'/>
        <path d='M76 132c-3 23-2 48 2 70M180 132c3 23 2 48-2 70' fill='none' stroke='rgba(24,21,18,.18)' stroke-width='2.2' stroke-linecap='round'/>
        <path d='M90 204c17 16 59 16 76 0' fill='none' stroke='rgba(255,255,255,.18)' stroke-width='4' stroke-linecap='round'/>
      `);
    }
    if (style.sidePart) {
      if (traits.hairProfile === "sweptSilver") {
        return wrap(`
          <path d='M57 121c14-53 53-79 93-70 30 6 47 26 52 56-37-6-67-2-92 13-15-5-33-5-53 1Z' fill='${hair}' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
        `);
      }
      if (traits.hairProfile === "softSidePart") {
        return wrap(`
          <path d='M60 118c17-48 58-70 100-56 23 8 37 25 42 50-20-6-38-6-53-1-10 3-18 8-28 17-9-7-20-10-33-10-9 0-18 1-28 4Z' fill='${hair}' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
        `);
      }
      return wrap(`
        <path d='M62 120c18-49 56-72 97-58 22 7 36 23 43 48-43-12-84-9-140 10Z' fill='${hair}' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
      `);
    }
    if (style.bun) {
      if (traits.hairProfile === "softBun") {
        return wrap(`
          <circle cx='128' cy='55' r='17' fill='${hair}' stroke='${ink}' stroke-width='3.8'/>
          <path d='M70 116c18-39 49-56 84-46 18 5 33 20 42 45-10-6-20-9-31-9-13 0-25 6-37 18-10-10-21-15-33-15-8 0-17 2-25 7Z' fill='${hair}' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
          <path d='M82 111c6 9 8 17 7 25M174 111c-6 9-8 17-7 25' fill='none' stroke='rgba(24,21,18,.18)' stroke-width='2' stroke-linecap='round'/>
        `);
      }
      return wrap(`
        <circle cx='128' cy='52' r='21' fill='${hair}' stroke='${ink}' stroke-width='3.9'/>
        <path d='M63 113c21-49 84-55 128 1-37-13-89-13-128-1Z' fill='${hair}' stroke='${ink}' stroke-width='3.9' stroke-linejoin='round'/>
        <path d='M88 100c25-8 56-8 82 0' fill='none' stroke='rgba(24,21,18,.22)' stroke-width='2.2' stroke-linecap='round'/>
      `);
    }
    if (style.longFlow) {
      // Long flowing waves: the front layer is the same for every character (the per-character
      // hairProfile fringes below were authored for the old short longWaves and no longer apply).
      return wrap(`<path d='${style.front}' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>`);
    }
    if (style === hairStyles.longWaves && traits.hairProfile === "curtainWaves") {
      return wrap(`
        <path d='M60 115c17-54 55-77 94-61 17 7 31 21 40 43-18-6-34-6-47-1-7 3-12 8-18 19-6-11-11-16-18-19-14-6-29-6-51 2Z' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.longWaves && traits.hairProfile === "centerPartWaves") {
      return wrap(`
        <path d='M58 116c15-54 53-76 93-61 16 6 29 20 38 41-16-4-30-3-42 2-8 3-13 8-19 18-6-10-11-15-19-18-12-5-26-5-42-2-4 20-6 40-9 59' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
        <path d='M119 77c5-4 13-4 18 0' fill='none' stroke='rgba(24,21,18,.26)' stroke-width='2.2' stroke-linecap='round'/>
      `);
    }
    if (style === hairStyles.longWaves && traits.hairProfile === "shoulderWaves") {
      return wrap(`
        <path d='M60 120c15-47 46-68 86-57 24 7 39 25 46 53-13-7-24-10-35-10-11 0-21 3-29 10-9-7-19-10-31-10-11 0-22 3-35 10 0 18-4 36-11 54' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.bob && traits.hairProfile === "choppyBob") {
      return wrap(`
        <path d='M62 119c17-45 51-66 92-52 22 8 35 27 38 57-17-10-31-13-44-8-8 3-14 8-20 15-6-8-13-13-22-16-13-5-27-4-44 4Z' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.bob && traits.hairProfile === "sleekBob") {
      return wrap(`
        <path d='M63 116c16-43 51-62 92-49 22 7 35 25 39 54-15-8-28-11-40-10-10 1-18 5-26 12-8-7-16-11-26-12-12-1-25 2-39 10Z' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.bob && traits.hairProfile === "chinBob") {
      return wrap(`
        <path d='M67 117c16-41 48-59 86-47 21 6 34 22 39 47-11-7-22-10-34-10-12 0-22 4-30 11-9-7-18-11-29-11-11 0-22 3-32 10Z' fill='${hair}' stroke='${ink}' stroke-width='4.05' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.bob && traits.hairProfile === "softBob") {
      return wrap(`
        <path d='M65 117c15-40 47-58 85-47 20 6 33 22 39 48-12-8-24-11-36-11-11 0-21 4-30 10-9-6-18-10-28-10-11 0-21 3-30 10Z' fill='${hair}' stroke='${ink}' stroke-width='4.05' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.curls && traits.hairProfile === "ringletLift") {
      return wrap(`
        <path d='M55 112c14-58 58-81 103-58 21 10 36 30 41 61-19-8-34-11-46-8-9 2-16 7-25 19-10-12-18-17-28-19-13-3-28 0-45 5Z' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.cropped && traits.hairProfile === "crownLift") {
      return wrap(`
        <path d='M63 103c20-58 88-59 129 5-21-7-39-8-58-2-8 2-13 7-18 14-6-7-12-11-21-14-10-3-21-4-32-3Z' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.cropped && traits.hairProfile === "softCrop") {
      return wrap(`
        <path d='M68 106c19-41 79-46 116 3-16-4-31-4-46 0-10 3-17 8-22 14-8-6-16-10-25-13-8-2-16-3-23-4Z' fill='${hair}' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
      `);
    }
    if (style === hairStyles.messy && traits.hairProfile === "softSweep") {
      return wrap(`
        <path d='M58 110c18-47 52-66 95-52 22 7 37 24 44 50-15-6-30-8-44-4-14 4-24 11-34 17-12 3-24 2-34-3-8-4-16-6-27-8Z' fill='${hair}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>
      `);
    }
    const fill = style.covered ? traits.shirt : hair;
    return wrap(`<path d='${style.front}' fill='${fill}' stroke='${ink}' stroke-width='4.1' stroke-linejoin='round'/>`);
  }

  function renderHairTexture(style, hair, traits) {
    // curls/coils texture is now drawn as front strand lines in renderHairHighlights
    if (style.texture === "locs") {
      return "<path d='M70 84v103M89 69v124M109 60v137M128 58v139M147 60v137M168 72v120M187 88v98' fill='none' stroke='rgba(255,255,255,.12)' stroke-width='2.8' stroke-linecap='round'/><path d='M77 90c4-2 9-2 13 0M117 79c4-2 9-2 13 0M156 82c4-2 9-2 13 0' fill='none' stroke='rgba(24,21,18,.12)' stroke-width='1.6' stroke-linecap='round'/>";
    }
    if (style.covered) {
      return "";
    }
    return "";
  }

  // Per-character brow shapes (thickness / arch / length). Filled brows that vary like the
  // reference art, instead of one identical thin stroke on everyone.
  const browShapes = {
    soft: { th: 3.6, arch: 5, len: 38 },
    flat: { th: 4, arch: 2, len: 40 },
    arched: { th: 3.2, arch: 9, len: 37 },
    thick: { th: 4.8, arch: 5, len: 41 },
    bushy: { th: 5.6, arch: 4.5, len: 43 },
    thin: { th: 2.4, arch: 6.5, len: 36 },
    angular: { th: 4, arch: 1.5, len: 40, peakX: 0.62 }
  };

  // Emotion offsets keyed by the expression's eye shape (each expression has a unique one):
  // inner/outer = vertical shift of the brow ends, arch = extra curvature.
  const browEmotion = {
    calm: { inner: 0, outer: 0, arch: 0 },
    bright: { inner: 1, outer: -1.5, arch: 2 },
    wide: { inner: 2.5, outer: 2, arch: 3.5 },
    narrow: { inner: -5.5, outer: 4, arch: -2.5 },
    soft: { inner: 5, outer: -2, arch: 1 }
  };

  function renderBrows(expression, traits) {
    const profile = getProfile(traits);
    const by = 110 + (profile.browY || 0);
    const sx = profile.browScaleX || 1;
    const eyes = eyeLayout(traits);
    const shape = browShapes[traits.browShape] || browShapes.soft;
    const emo = browEmotion[expression.eyes] || browEmotion.calm;
    const len = shape.len * sx;
    const th = shape.th * (profile.browThick || 1);
    const arch = shape.arch + emo.arch;
    const peakX = shape.peakX || 0.5;
    const f = (n) => n.toFixed(1);
    // Real brow anatomy: a rounded "head" near the nose (full thickness) that arches over the eye
    // and tapers to a thin "tail" point at the temple. A uniform-thickness lozenge read as a solid
    // censor-bar block, which is what made every face look off.
    const brow = (eyeCx) => {
      const tc = eyeCx < 128 ? 1 : -1; // direction toward the nose
      const innerX = eyeCx + tc * len * 0.44; // head (near nose)
      const outerX = eyeCx - tc * len * 0.56; // tail point (temple)
      const peakXPos = eyeCx - tc * len * (peakX - 0.5) * 0.9;
      const topY = by - arch;
      const iTop = by - th * 0.5 + emo.inner;
      const iBot = by + th * 0.5 + emo.inner;
      const tip = by + emo.outer;
      return (
        `M${f(innerX)} ${f(iTop)}` +
        `Q${f(peakXPos)} ${f(topY)} ${f(outerX)} ${f(tip)}` + // top edge -> tapered tail point
        `Q${f(peakXPos)} ${f(topY + th * 0.85)} ${f(innerX)} ${f(iBot)}` + // underside back to head
        `Q${f(innerX + tc * th * 0.5)} ${f(by + emo.inner)} ${f(innerX)} ${f(iTop)}Z` // round the head
      );
    };
    const fill = browColor(traits);
    return `<path d='${brow(eyes.left)}${brow(eyes.right)}' fill='${fill}' stroke='${ink}' stroke-width='1.5' stroke-linejoin='round'/>`;
  }

  // Brows track the hair colour but deeper, so blondes read with visible (not black) brows while
  // darker hair gives a strong defined brow.
  function browColor(traits) {
    const hair = hairColors[traits.hairColor];
    return hair ? shadeColor(hair, 0.62) : ink;
  }

  function renderEyes(expression, traits) {
    const profile = getProfile(traits);
    // up/dn = how far the lid arcs above/below the eye midline. A clean symmetric lens (faces.js
    // style) reads as a normal eye; the old almond with a drooping outer corner + extra crease
    // lines is what made faces look "off".
    const shape = {
      calm: { y: 129, up: 10, dn: 7.5 },
      bright: { y: 129, up: 11, dn: 8 },
      wide: { y: 128, up: 12.5, dn: 9 },
      narrow: { y: 130, up: 7, dn: 5.5 },
      soft: { y: 131, up: 9, dn: 7 }
    }[expression.eyes];
    const eyes = eyeLayout(traits, shape.y + (profile.eyeY || 0));
    const skin = skinTones[traits.skin] || traits.skin;
    // Pupil offset within the lens; lazyEye adds an extra horizontal drift to ONE eye only (a lazy
    // eye / asymmetric strabismus look). Both stay clipped to the lens.
    const px = profile.pupilX || 0;
    const py = profile.pupilY || 0;
    const lazy = Number(traits.lazyEye) || 0;
    const left = renderEye(eyes.left, shape, traits.eyeColor, skin, profile, "l", px, py);
    const right = renderEye(eyes.right, shape, traits.eyeColor, skin, profile, "r", px + lazy, py);
    return `${left}${right}`;
  }

  function eyeLayout(traits, y = 129) {
    const gap = traits?.eyeGap || 47;
    return {
      left: 128 - gap / 2,
      right: 128 + gap / 2,
      y
    };
  }

  function renderEye(cx, shape, eyeColor, skin, profile, side, pupilDX, pupilDY) {
    // eyeY shifts the whole eye up/down. (Previously this offset was only baked into eyeLayout's y,
    // which renderEye ignored - so the Eye Height control did nothing.)
    const y = shape.y + (profile.eyeY || 0);
    const pdx = Number(pupilDX) || 0;
    const pdy = Number(pupilDY) || 0;
    const w = 14.2 * (profile.eyeScale || 1);
    const open = profile.eyeOpen || 1;
    const up = shape.up * open;
    const dn = shape.dn * open;
    const f = (n) => n.toFixed(1);
    // clean symmetric lens, split into a top arc + a bottom arc so each lid can be stroked
    // differently. The reference draws a dark upper lash-line but only a soft, lighter, warmer
    // lower lid - NOT a hard black line all the way around (that's the cartoon-disc tell).
    const topArc =
      `M${f(cx - w)} ${f(y)}` +
      `C${f(cx - w)} ${f(y - up * 0.55)} ${f(cx - w * 0.5)} ${f(y - up)} ${f(cx)} ${f(y - up)}` +
      `C${f(cx + w * 0.5)} ${f(y - up)} ${f(cx + w)} ${f(y - up * 0.55)} ${f(cx + w)} ${f(y)}`;
    const bottomArc =
      `M${f(cx + w)} ${f(y)}` +
      `C${f(cx + w)} ${f(y + dn * 0.55)} ${f(cx + w * 0.5)} ${f(y + dn)} ${f(cx)} ${f(y + dn)}` +
      `C${f(cx - w * 0.5)} ${f(y + dn)} ${f(cx - w)} ${f(y + dn * 0.55)} ${f(cx - w)} ${f(y)}`;
    // closed path (top arc, then the bottom arc's curves without its leading M) for fill + clip
    const lens = `${topArc}${bottomArc.slice(bottomArc.indexOf('C'))}Z`;
    const clipId = `eye-${Math.round(cx * 10)}-${Math.round(y * 10)}`;
    // iris dead centre horizontally, sitting low so the upper lid covers its top edge - that lid
    // overlap is what makes the reference eyes read as real almond eyes. Capped well inside the lens
    // half-width so the whites (sclera) clearly read on either side of the iris.
    const irisR = Math.min((up + dn) * 0.54, w * 0.62) * (profile.irisScale || 1);
    const irisY = y + dn * 0.2;
    // Pupil sized off the eye WIDTH, not the iris radius. The iris swings with eyeScale, irisScale
    // AND the per-expression up/dn, so a flat irisR*0.5 made pupils wildly inconsistent across the
    // roster (tiny on small-iris characters, merged-and-huge on dark wide ones). Keying off w gives
    // every character a near-uniform pupil that only grows with how big the eye actually is, capped
    // so it always stays comfortably inside the iris.
    const pupilR = Math.min(w * 0.4, irisR * 0.62);
    // upper-lid shadow arc (just inside the top outline) and a soft crease above the eye
    const topLid = `M${f(cx - w * 0.86)} ${f(y - up * 0.42)}Q${f(cx)} ${f(y - up * 1.02)} ${f(cx + w * 0.86)} ${f(y - up * 0.42)}`;
    const creaseY = y - up - 3.4;
    const crease = `M${f(cx - w * 0.66)} ${f(creaseY)}Q${f(cx)} ${f(creaseY - up * 0.32)} ${f(cx + w * 0.66)} ${f(creaseY)}`;
    // lower lid: a warm, lighter line (a soft skin shadow) instead of full-weight ink
    const lowerLid = shadeColor(skin, 0.52);
    // The iris/pupil/highlight sit in a `.fa-iris` group (eye-darts translate it within the clipped
    // lens). The whole eye is wrapped in `.fa-eye`/`.fa-eye-{side}` (blink scales it); the right eye
    // gets an extra `.fa-wink` group so a wink can close just that eye. Animations are opt-in via the
    // <style> from animCSS(); with no animation these groups are inert.
    const eye = `
      <defs><clipPath id='${clipId}'><path d='${lens}'/></clipPath></defs>
      <path d='${lens}' fill='#fcf8f0' stroke='none'/>
      <g clip-path='url(#${clipId})'>
        <g class='fa-iris'>
          <circle cx='${f(cx + pdx)}' cy='${f(irisY + pdy)}' r='${irisR.toFixed(2)}' fill='${eyeColor}' stroke='${ink}' stroke-width='1.3'/>
          <circle cx='${f(cx + pdx)}' cy='${f(irisY + pdy)}' r='${pupilR.toFixed(2)}' fill='#15100c'/>
          <circle cx='${f(cx + pdx - irisR * 0.32)}' cy='${f(irisY + pdy - irisR * 0.42)}' r='${(irisR * 0.16).toFixed(1)}' fill='#fff' opacity='.78'/>
        </g>
        <path d='${topLid}' fill='none' stroke='rgba(31,35,48,.5)' stroke-width='2.6' stroke-linecap='round'/>
        ${/* Eyelid: a skin cover sitting 30px above (hidden by the clip) that the blink sweeps down
             over the eye. Inline transform keeps it hidden when there's no animation. */ ""}
        <g class='fa-lid' transform='translate(0 -30)'>
          <path d='${lens}' fill='${skin}'/>
          <path d='M${f(cx - w * 0.9)} ${f(y)}Q${f(cx)} ${f(y + 1.3)} ${f(cx + w * 0.9)} ${f(y)}' fill='none' stroke='${ink}' stroke-width='1.9' stroke-linecap='round' opacity='.65'/>
        </g>
        ${/* Wink lid: right eye only. A second skin cover the wink sweeps down (faWinkLid), giving a
             clean lid-close wink independent of the blink lid. */ ""}
        ${side === "r" ? `<g class='fa-winklid' transform='translate(0 -30)'>
          <path d='${lens}' fill='${skin}'/>
          <path d='M${f(cx - w * 0.9)} ${f(y)}Q${f(cx)} ${f(y + 1.3)} ${f(cx + w * 0.9)} ${f(y)}' fill='none' stroke='${ink}' stroke-width='1.9' stroke-linecap='round' opacity='.65'/>
        </g>` : ""}
      </g>
      <path d='${bottomArc}' fill='none' stroke='${lowerLid}' stroke-width='1.9' stroke-linecap='round'/>
      <path d='${topArc}' fill='none' stroke='${ink}' stroke-width='${stroke.feature}' stroke-linecap='round' stroke-linejoin='round'/>
      <path d='${crease}' fill='none' stroke='${softInk}' stroke-width='1.4' stroke-linecap='round'/>
    `;
    return `<g class='fa-eye fa-eye-${side || "l"}'>${eye}</g>`;
  }

  function renderNose(seed, traits) {
    const profile = getProfile(traits);
    const y = (profile.noseY || 0) + jawDrop(profile.jawLength, 155);
    const scale = profile.noseScale || 1;
    const cx = 128;
    const f = (n) => n.toFixed(1);
    // faces.js keeps the nose to a soft underside curve close under the eyes rather than a long
    // shaded bridge - the long bridge stretched the midface and made faces look gaunt.
    const baseY = 155 + y;
    // noseWidth narrows/widens independently of the overall scale (a skinny vs broad nose).
    const w = 9 * scale * (profile.noseWidth || 1);
    // Tip shape: how curved/pointed the underside is. spread = how far the lower control points sit
    // out toward the wings (small = pointier/narrower tip); drop = how far the tip hangs below the
    // wings (small = flatter, less curved underside).
    const tipCfg = {
      round:    { spread: 0.45, drop: 2 },    // soft rounded tip (default)
      narrow:   { spread: 0.22, drop: 2 },    // skinny pointed tip
      pointed:  { spread: 0.16, drop: 2.6 },  // sharp, less curved
      straight: { spread: 0.5,  drop: 0.6 },  // flat underside, barely curved
      button:   { spread: 0.62, drop: 2.6 },  // rounder, fuller tip
      upturned: { spread: 0.3,  drop: -0.4 }  // tip lifts above the wings
    };
    const tc = tipCfg[traits.noseTip] || tipCfg.round;
    const sp = tc.spread, dr = tc.drop;
    const bridge = `M${cx} ${f(139 + y)}c-1.4 ${f(6 * scale)} -1.8 ${f(11 * scale)} -3.2 ${f(15 * scale)}`;
    // underside: from the left wing down to the centre tip, then mirrored up to the right wing
    const base =
      `M${f(cx - w)} ${f(baseY - 4)}` +
      `C${f(cx - w)} ${f(baseY)} ${f(cx - w * sp)} ${f(baseY + dr)} ${f(cx)} ${f(baseY + dr)}` +
      `C${f(cx + w * sp)} ${f(baseY + dr)} ${f(cx + w)} ${f(baseY)} ${f(cx + w)} ${f(baseY - 4)}`;
    const nostrils =
      `M${f(cx - w + 0.5)} ${f(baseY + 0.5)}c-1.6 1 -2.6 0.3 -3 -1.6` +
      `M${f(cx + w - 0.5)} ${f(baseY + 0.5)}c1.6 1 2.6 0.3 3 -1.6`;
    return `
      <path d='${bridge}' fill='none' stroke='rgba(24,21,18,.16)' stroke-width='1.7' stroke-linecap='round'/>
      <path d='${base}' fill='rgba(24,21,18,.05)' stroke='${ink}' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/>
      <path d='${nostrils}' fill='none' stroke='rgba(24,21,18,.4)' stroke-width='1.3' stroke-linecap='round'/>
      <ellipse cx='${cx}' cy='${f(baseY - 3)}' rx='${f(4 * scale * (profile.noseWidth || 1))}' ry='2.2' fill='rgba(255,255,255,.26)'/>
    `;
  }

  function renderExpressionMouth(expression, traits, seed) {
    let output = "";
    let anchorY = 171;
    if (expression.openMouth) {
      output = `<path d='${expression.mouth}' fill='#3a1d18' stroke='${ink}' stroke-width='3'/><ellipse cx='128' cy='177' rx='4.2' ry='2.4' fill='#e76f72' opacity='.62'/>`;
      anchorY = 174;
    } else if (expression.teeth) {
      output = renderSmileMouth(traits.mouthStyle, traits, seed);
      anchorY = 171;
    } else {
      output = renderLips(expression, traits);
    }
    return transformMouth(output, traits, anchorY);
  }

  function transformMouth(svg, traits, anchorY) {
    const y = (Number(traits.mouthY) || 0) + jawDrop(getProfile(traits).jawLength, anchorY);
    const scale = Number(traits.mouthScale) || 1;
    if (!y && scale === 1) return svg;
    return `<g transform='translate(0 ${y}) translate(128 ${anchorY}) scale(${scale}) translate(-128 -${anchorY})'>${svg}</g>`;
  }

  function renderSmileMouth(mouthStyle, traits, seed) {
    const style = mouthStyle || "warmSmile";
    // teeth pattern is its own axis; derive a sensible default from the legacy smile name
    const teethStyle = traits.teethStyle
      || (style === "buckTeeth" ? "bucky" : style === "goofyTeeth" ? "spaced" : "even");

    // closed-mouth smile: a curved lip with a soft glint, no open cavity (no teeth to mask)
    if (style === "warmSmile") {
      return `<path d='M106 166c12 14 32 14 44 0' fill='none' stroke='${ink}' stroke-width='3.8' stroke-linecap='round'/>`
        + `<path d='M114 169c8 3 20 3 28 0' fill='none' stroke='rgba(255,255,255,.6)' stroke-width='1.8' stroke-linecap='round'/>`;
    }

    // Open smiles. Structure (back to front): lower lip, dark opening, teeth (clipped to opening),
    // upper lip over the top edge, a lip sheen, then the lip-line outline. Lips are tinted with the
    // lip colour and can be toggled off (smileLips === "off") to fall back to a lip-line-only smile.
    const presets = {
      wideSmile: { L: 100, R: 156, y: 163, topDip: 13, botDip: 28 },
      bigSmile: { L: 104, R: 152, y: 164, topDip: 12, botDip: 24 },
      bigOpenSmile: { L: 99, R: 157, y: 162, topDip: 16, botDip: 40 },
      buckTeeth: { L: 108, R: 148, y: 166, topDip: 9, botDip: 19 },
      goofyTeeth: { L: 104, R: 152, y: 167, topDip: 11, botDip: 22 }
    };
    const p = presets[style] || presets.bigSmile;
    const skin = skinTones[traits.skin] || "#c89070";
    const lipC = traits.lipColor || shadeColor(skin, 0.74);
    const showLips = traits.smileLips !== "off";
    const f = (n) => n.toFixed(1);
    const arc = (cTop, cBot) => `M${p.L} ${p.y}Q128 ${f(p.y + cBot)} ${p.R} ${p.y}Q128 ${f(p.y + cTop)} ${p.L} ${p.y}Z`;
    const opening = arc(p.topDip, p.botDip);
    const overhang = effectiveOverhang(teethStyle, traits);
    // The opening extended downward so overhanging incisors can pass below the mouth and over the lip.
    const openingExt = arc(p.topDip, p.botDip + overhang + 2);
    const clipId = `mouth-${seed}`;
    const clipExtId = `mouthx-${seed}`;
    const teeth = transformTeeth(teethBand(teethStyle, p, traits), traits, 128, p.y + 8);
    const incisors = transformTeeth(teethIncisors(teethStyle, p, traits), traits, 128, p.y + 8);
    // Upper/lower lip sizes carry over from the closed-mouth lip controls so a person's lips look
    // consistent whether they're smiling or not.
    const upSize = Math.max(0.3, Number(traits.lipUpperSize) || 1);
    const loSize = Math.max(0.3, Number(traits.lipLowerSize) || 1);
    const lowerLip = showLips ? `<path d='${arc(p.botDip - 4, p.botDip + 12 * loSize)}' fill='${lipC}' stroke='${ink}' stroke-width='2.8' stroke-linejoin='round'/>` : "";
    const upperLip = showLips ? `<path d='${arc(p.topDip - 8 * upSize, p.topDip)}' fill='${shadeColor(lipC, 0.9)}' stroke='${ink}' stroke-width='2.8' stroke-linejoin='round'/>` : "";
    // A small highlight on the LOWER LIP only (the old sheen arced across the whole mouth, reading as
    // a stray pink curve over the teeth).
    const sheen = showLips ? `<path d='M${f(128 - 9)} ${f(p.y + p.botDip + 5)}q9 2 18 0' fill='none' stroke='${shadeColor(lipC, 1.14)}' stroke-width='1.6' stroke-linecap='round' opacity='.4'/>` : "";
    return `
      <defs>
        <clipPath id='${clipId}'><path d='${opening}'/></clipPath>
        <clipPath id='${clipExtId}'><path d='${openingExt}'/></clipPath>
      </defs>
      ${lowerLip}
      <path d='${opening}' fill='#3a1d18'/>
      <g clip-path='url(#${clipId})'>${teeth}</g>
      <g clip-path='url(#${clipExtId})'>${incisors}</g>
      ${upperLip}
      ${sheen}
      <path d='${opening}' fill='none' stroke='${ink}' stroke-width='3' stroke-linejoin='round'/>
    `;
  }

  // How far the central incisors hang below the tooth row. Bucky teeth get a built-in overhang so
  // they rest over the lower lip by default, without the user needing to crank the Overhang slider.
  function effectiveOverhang(teethStyle, traits) {
    const manual = Math.max(0, Number(traits.teethOverhang) || 0);
    if (manual > 0) return manual;
    return teethStyle === "bucky" ? 7 : 0;
  }

  // Does this mouth draw distinct central incisors (vs. just a flat tooth row)?
  function hasIncisors(teethStyle, traits) {
    return (Math.max(0, Number(traits.teethGap) || 0) > 0.4)
      || (Math.max(0, Number(traits.teethOverhang) || 0) > 0.4)
      || teethStyle === "bucky";
  }

  // Upper-teeth ROW + the side-tooth pattern, clipped (externally) to the mouth opening. The two
  // central incisors live in teethIncisors() so they can hang over the lower lip.
  function teethBand(teethStyle, p, traits) {
    const top = p.y - 3;
    const L = p.L + 2.5;
    const R = p.R - 2.5;
    const w = R - L;
    const h = p.topDip + 9;
    const div = "rgba(58,29,24,.32)";
    const f = (n) => n.toFixed(1);
    let teeth = `<rect x='${f(L)}' y='${f(top)}' width='${f(w)}' height='${f(h)}' rx='3' fill='#fcf7ec'/>`;
    teeth += `<rect x='${f(L)}' y='${f(top)}' width='${f(w)}' height='3.4' fill='rgba(58,29,24,.16)'/>`; // gum shadow under lip
    const y2 = f(top + h - 2);
    const vline = (x, wdt, c) => `<line x1='${f(x)}' y1='${f(top + 2)}' x2='${f(x)}' y2='${y2}' stroke='${c}' stroke-width='${wdt}' stroke-linecap='round'/>`;
    const incisors = hasIncisors(teethStyle, traits);
    if (teethStyle === "spaced") {
      for (let i = 1; i < 5; i++) teeth += vline(L + (w * i) / 5, 1.6, div);
    } else if (teethStyle === "gappy") {
      if (!incisors) teeth += vline(128, 2.6, ink);
      teeth += vline(L + w * 0.3, 1.1, div) + vline(R - w * 0.3, 1.1, div);
    } else if (teethStyle !== "bucky") {
      for (let i = 1; i < 4; i++) teeth += vline(L + (w * i) / 4, 1.1, div);
    }
    return teeth;
  }

  // The two central incisors (spaced by teethGap, hanging lower by teethOverhang). Drawn in their own
  // layer, clipped to the DOWNWARD-EXTENDED opening, AFTER the lower lip - so the overhang actually
  // overlaps the lip (buck teeth resting on it) instead of being cut off at the mouth opening.
  function teethIncisors(teethStyle, p, traits) {
    if (!hasIncisors(teethStyle, traits)) return "";
    const f = (n) => n.toFixed(1);
    const top = p.y - 3;
    const h = p.topDip + 9;
    const gap = Math.max(0, Number(traits.teethGap) || 0);
    const overhang = effectiveOverhang(teethStyle, traits);
    const iw = 6.6;
    const inTop = top + 1;
    const inH = h - 2 + overhang;
    const incisor = (x) => `<path d='M${f(x)} ${f(inTop)}h${f(iw)}v${f(inH - 3.2)}c0 1.8-1.4 3.2-${f(iw / 2)} 3.2s-${f(iw / 2)}-1.4-${f(iw / 2)}-3.2Z' fill='#fff' stroke='${ink}' stroke-width='1.4' stroke-linejoin='round'/>`;
    // The gap shows the mouth interior, but only within the tooth ROW height - below the row (over the
    // lip) the space between the teeth shows the lip itself.
    const gapRect = gap > 0.4 ? `<rect x='${f(128 - gap / 2)}' y='${f(inTop)}' width='${f(gap)}' height='${f(h)}' fill='#3a1d18'/>` : "";
    return gapRect + incisor(128 - gap / 2 - iw) + incisor(128 + gap / 2);
  }

  // Closed resting mouth: a simple line by default, or sculpted lips (with a cupid's-bow upper and
  // fuller lower) when a character has a `lips` style - only on calm/resting faces, since a full lip
  // on a frown reads oddly.
  function renderLips(expression, traits) {
    const style = traits.lips || "line";
    const mw = expression.mouthWidth || 3.2;
    // Lips are independent of emotion: a soft/full lip shows on any closed-mouth expression (angry,
    // sad, neutral) - the mood is carried by the brows/eyes, not by collapsing the mouth to a line.
    // Only "line" (or an expression with no closed mouth path) falls back to the stroked line.
    if (style === "line" || !expression.mouth) {
      return `<path d='${expression.mouth}' fill='none' stroke='${ink}' stroke-width='${mw}' stroke-linecap='round'/>`;
    }
    const skin = skinTones[traits.skin] || "#c89070";
    const lip = traits.lipColor || shadeColor(skin, 0.78);
    const full = style === "full";
    const f = (n) => n.toFixed(1);
    const cx = 128;
    const my = 171;                 // the mouth line (where the lips meet - shared, so no open gap)
    const L = full ? 106 : 109;
    const R = full ? 150 : 147;
    // Independent upper/lower sizing, plus distinct shape designs so faces don't all read the same.
    const upSize = Math.max(0.3, Number(traits.lipUpperSize) || 1);
    const loSize = Math.max(0.3, Number(traits.lipLowerSize) || 1);
    const upH = (full ? 7 : 5) * upSize;   // upper-lip height
    const loH = (full ? 13 : 9) * loSize;  // lower-lip drop
    // Upper shape = cupid's-bow character; lower shape = fullness/width.
    const bow = ({ cupid: 1, soft: 0.62, flat: 0.28, peaked: 1.75, heavy: 1.15 }[traits.lipUpper] ?? 0.62);
    const loW = ({ round: 11, pillow: 14.5, wide: 16, flat: 8 }[traits.lipLower] ?? 11);
    const dip = 2.5 * bow;          // centre dip of the upper lip
    const peak = 4 * bow;           // cupid peaks
    const seamTo = (x2) => `Q${cx} ${f(my + 1.4)} ${f(x2)} ${f(my)}`;
    // Upper lip: cupid's-bow top edge, bottom edge = the mouth line.
    const upper = `M${f(L)} ${f(my)}`
      + `C${f(L + 5)} ${f(my - upH)} ${f(cx - 11)} ${f(my - upH + 1)} ${f(cx - 5)} ${f(my - dip)}`
      + `C${f(cx - 2)} ${f(my - peak)} ${f(cx + 2)} ${f(my - peak)} ${f(cx + 5)} ${f(my - dip)}`
      + `C${f(cx + 11)} ${f(my - upH + 1)} ${f(R - 5)} ${f(my - upH)} ${f(R)} ${f(my)}`
      + seamTo(L) + "Z";
    // Lower lip: top edge = the mouth line, fuller curve below (width set by the lower-lip design).
    const lower = `M${f(L)} ${f(my)}` + seamTo(R)
      + `C${f(R - 5)} ${f(my + loH - 2)} ${f(cx + loW)} ${f(my + loH)} ${f(cx)} ${f(my + loH)}`
      + `C${f(cx - loW)} ${f(my + loH)} ${f(L + 5)} ${f(my + loH - 2)} ${f(L)} ${f(my)}Z`;
    const seam = `M${f(L)} ${f(my)}${seamTo(R)}`;
    return `
      <path d='${lower}' fill='${lip}' stroke='${ink}' stroke-width='2.4' stroke-linejoin='round'/>
      <path d='${upper}' fill='${shadeColor(lip, 0.92)}' stroke='${ink}' stroke-width='2.4' stroke-linejoin='round'/>
      <path d='${seam}' fill='none' stroke='${ink}' stroke-width='2.2' stroke-linecap='round'/>
      <path d='M${f(cx - 8)} ${f(my + loH * 0.5)}q8 2 16 0' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='1.4' stroke-linecap='round'/>
    `;
  }

  function transformTeeth(svg, traits, anchorX, anchorY) {
    const x = Number(traits.teethX) || 0;
    const y = Number(traits.teethY) || 0;
    const scale = Number(traits.teethScale) || 1;
    if (!x && !y && scale === 1) return svg;
    return `<g transform='translate(${x} ${y}) translate(${anchorX} ${anchorY}) scale(${scale}) translate(-${anchorX} -${anchorY})'>${svg}</g>`;
  }

  function renderCheeks(expression) {
    if (!expression.blush) return "";
    return "<ellipse cx='88' cy='152' rx='14' ry='7' fill='#f49a92' opacity='.34'/><ellipse cx='168' cy='152' rx='14' ry='7' fill='#f49a92' opacity='.34'/>";
  }

  // Recolour an accessory to traits.accessoryColor. For glasses the frame IS the dark stroke, so we
  // retint that; for everything else we retint the themeable fills (metal gold + the accent colour)
  // while leaving the dark ink outline intact so the piece keeps its drawn edge.
  function tintAccessory(svg, traits) {
    const c = traits.accessoryColor;
    if (!svg || !c) return svg;
    const glasses = ["glasses", "roundGlasses", "squareGlasses", "catEyeGlasses"].includes(traits.accessory);
    if (glasses) return svg.split("#171512").join(c);
    let out = svg.split("#f6bd2f").join(c).split("#ffd569").join(shadeColor(c, 1.18));
    if (traits.accent) out = out.split(traits.accent).join(c);
    return out;
  }

  function renderAccessory(traits, faceShape) {
    const render = accessories[traits.accessory] || accessories.none;
    const output = tintAccessory(render(traits, faceShape), traits);
    const transformed = transformAccessory(output, traits);
    const headwear = ["cap", "beanie", "beret", "headband", "flowerClip", "bucketHat", "sunHat"].includes(traits.accessory);
    const facial = ["beard", "moustache"].includes(traits.accessory);
    // The backwards cap must sit on top of the (faces.js) hair so the crown covers it and only the
    // side hair pokes out below - drawn before the hair it would be hidden entirely.
    // The backwards cap and the wide-brim sun hat must sit ON TOP of the (faces.js) hair so the
    // crown/brim cover it and only the hair below the brim shows - drawn under the hair they'd be
    // buried, which is what hid the hat behind Tara's fringe.
    // Earrings hang on the ears, which the hair sweeps over - so they render BEHIND the (front) hair,
    // peeking out below it, rather than on top. (Behind-flagged hair locks still sit further back.)
    const earrings = ["hoops", "dropEarrings"].includes(traits.accessory);
    if (traits.accessory === "capBack" || traits.accessory === "sunHat") return { beforeMouth: "", afterMouth: transformed };
    if (headwear) return { beforeMouth: transformed, afterMouth: "" };
    if (facial) return { beforeMouth: transformed, afterMouth: "" };
    if (earrings) return { beforeMouth: "", afterMouth: "", behindHair: transformed };
    return { beforeMouth: "", afterMouth: transformed };
  }

  function transformAccessory(svg, traits) {
    const x = Number(traits.accessoryX) || 0;
    const y = Number(traits.accessoryY) || 0;
    const scale = Number(traits.accessoryScale) || 1;
    if (!svg || (!x && !y && scale === 1)) return svg;
    const anchor = accessoryAnchor(traits.accessory);
    return `<g transform='translate(${x} ${y}) translate(${anchor.x} ${anchor.y}) scale(${scale}) translate(-${anchor.x} -${anchor.y})'>${svg}</g>`;
  }

  function accessoryAnchor(accessory) {
    const anchors = {
      glasses: { x: 128, y: 130 },
      roundGlasses: { x: 128, y: 130 },
      squareGlasses: { x: 128, y: 130 },
      catEyeGlasses: { x: 128, y: 130 },
      hoops: { x: 128, y: 144 },
      studs: { x: 128, y: 145 },
      dropEarrings: { x: 128, y: 146 },
      beard: { x: 128, y: 184 },
      moustache: { x: 128, y: 160 },
      necklace: { x: 128, y: 219 },
      chain: { x: 128, y: 220 },
      choker: { x: 128, y: 217 },
      scarf: { x: 128, y: 224 },
      bow: { x: 128, y: 214 },
      cap: { x: 128, y: 95 },
      capBack: { x: 128, y: 88 },
      beanie: { x: 128, y: 96 },
      beret: { x: 128, y: 86 },
      headband: { x: 128, y: 101 },
      flowerClip: { x: 180, y: 101 },
      bucketHat: { x: 128, y: 94 },
      sunHat: { x: 128, y: 88 }
    };
    return anchors[accessory] || { x: 128, y: 128 };
  }

  function transformBeardBase(svg, traits) {
    const x = Number(traits.beardX) || 0;
    const y = (Number(traits.beardY) || 0) + jawDrop(getProfile(traits).jawLength, 196);
    const scale = Number(traits.beardScale) || 1;
    if (!x && !y && scale === 1) return svg;
    return `<g transform='translate(${x} ${y}) translate(128 184) scale(${scale}) translate(-128 -184)'>${svg}</g>`;
  }

  function transformMoustache(svg, traits) {
    const x = Number(traits.moustacheX) || 0;
    const y = (Number(traits.moustacheY) || 0) + jawDrop(getProfile(traits).jawLength, 160);
    const scale = Number(traits.moustacheScale) || 1;
    if (!x && !y && scale === 1) return svg;
    return `<g transform='translate(${x} ${y}) translate(128 160) scale(${scale}) translate(-128 -160)'>${svg}</g>`;
  }

  function describeVisibleTraits(traits) {
    return [traits.expression, featureLabels[traits.hair], featureLabels[traits.accessory], mouthLabels[traits.mouthStyle], featureLabels[traits.clothing]]
      .filter(Boolean)
      .join(", ");
  }

  function defaultMouthStyle(index, expression) {
    if (expression !== "happy") return "plain";
    return ["warmSmile", "bigSmile", "wideSmile", "buckTeeth"][index % 4];
  }

  function eyeGapFor(index) {
    return [48, 52, 55, 50, 57, 53, 49, 56, 51, 54, 47, 52][index % 12];
  }

  function hairProfileFor(id, hair) {
    const custom = {
      aaron: "softSweep",
      sophia: "curtainWaves",
      gianni: "sweptSilver",
      stella: "choppyBob",
      matilda: "ringletLift",
      naomi: "sleekBob",
      meilin: "sleekBob",
      olivia: "centerPartWaves",
      ines: "centerPartWaves",
      elena: "centerPartWaves",
      eli: "softSidePart",
      ryan: "softCrop",
      tyler: "softSweep",
      adeline: "softBun"
    };
    if (custom[id]) return custom[id];
    if (hair === "cropped") return "crownLift";
    return "default";
  }

  function beardProfileFor(id, accessory) {
    if (!["beard", "moustache"].includes(accessory)) return "default";
    const custom = {
      diego: "roundedFull",
      gianni: "trimShort",
      bruno: "boxedFull",
      javier: "pencil"
    };
    return custom[id] || (accessory === "moustache" ? "classic" : "trimShort");
  }

  function defaultPortraitProfile() {
    return {
      eyeScale: 0.94,
      eyeOpen: 0.95,
      irisScale: 0.92,
      eyeY: 0,
      browY: 0,
      browScaleX: 1,
      noseY: 0,
      noseScale: 1,
      noseWidth: 1,
      mouthY: 0,
      cheekY: 0,
      cheekOpacity: 0.09,
      eyeSocketY: 0,
      jawShadowY: 0,
      jawLength: 0,
      pupilX: 0,
      pupilY: 0,
      browThick: 1
    };
  }

  const profileOverrideKeys = [
    "eyeScale", "eyeOpen", "irisScale", "eyeY", "browY", "browScaleX",
    "noseY", "noseScale", "noseWidth", "cheekY", "cheekOpacity", "eyeSocketY", "jawShadowY", "jawLength",
    "pupilX", "pupilY", "browThick"
  ];

  // Lets flat trait corrections (eg from the studio editor) override the per-character
  // portraitProfile without callers needing to know about the nested object.
  function getProfile(traits) {
    const base = { ...defaultPortraitProfile(), ...(traits.portraitProfile || {}) };
    profileOverrideKeys.forEach((key) => {
      if (traits[key] !== undefined && traits[key] !== "") base[key] = Number(traits[key]);
    });
    return base;
  }

  function portraitProfileFor(id, index) {
    const base = defaultPortraitProfile();
    const custom = {
      aaron: { eyeScale: 0.92, irisScale: 0.9, browY: -1, cheekOpacity: 0.06 },
      maya: { eyeScale: 0.98, irisScale: 0.94, cheekOpacity: 0.12, browY: -1 },
      leon: { eyeScale: 0.9, eyeOpen: 0.88, browScaleX: 1.04, cheekOpacity: 0.05 },
      naomi: { eyeScale: 0.88, eyeOpen: 0.84, browY: -2, noseScale: 0.92 },
      javier: { eyeScale: 0.9, eyeOpen: 0.9, noseScale: 1.08, mouthY: 2, jawShadowY: 2 },
      tiana: { eyeScale: 0.96, irisScale: 0.95, cheekOpacity: 0.12 },
      diego: { eyeScale: 0.9, eyeOpen: 0.88, browY: -1, jawShadowY: 2 },
      sophia: { eyeScale: 1, irisScale: 0.96, cheekOpacity: 0.14 },
      zeke: { eyeScale: 0.92, browScaleX: 1.03, cheekOpacity: 0.05 },
      meilin: { eyeScale: 0.9, irisScale: 0.9, eyeY: 1, noseScale: 0.92 },
      gianni: { eyeScale: 0.9, eyeOpen: 0.86, browY: -2, noseScale: 1.08, mouthY: 2, jawShadowY: 3 },
      aisha: { eyeScale: 0.92, eyeOpen: 0.9, browY: -1 },
      lucas: { eyeScale: 0.9, irisScale: 0.88, eyeY: 1 },
      stella: { eyeScale: 0.9, eyeOpen: 0.84, browY: -2, mouthY: 1 },
      jamal: { eyeScale: 0.9, eyeOpen: 0.9, browY: -1, jawShadowY: 2 },
      olivia: { eyeScale: 0.97, irisScale: 0.93, cheekOpacity: 0.11 },
      arjun: { eyeScale: 0.9, irisScale: 0.9, jawShadowY: 1 },
      matilda: { eyeScale: 0.94, irisScale: 0.92, cheekOpacity: 0.12 },
      niko: { eyeScale: 0.9, eyeOpen: 0.88, mouthY: 1 },
      celeste: { eyeScale: 0.96, cheekOpacity: 0.13 },
      ryan: { eyeScale: 0.9, eyeOpen: 0.88, browY: -1 },
      amira: { eyeScale: 0.94, eyeOpen: 0.88, browY: -1, cheekOpacity: 0.11 },
      eli: { eyeScale: 0.88, irisScale: 0.88, browY: -1, noseScale: 0.95 },
      sanaa: { eyeScale: 0.94, browY: -1, cheekOpacity: 0.09 },
      milo: { eyeScale: 0.94, irisScale: 0.93, cheekOpacity: 0.1 },
      lara: { eyeScale: 0.96, browY: -1, cheekOpacity: 0.09 },
      bruno: { eyeScale: 0.9, eyeOpen: 0.88, noseScale: 1.06, jawShadowY: 3 },
      yara: { eyeScale: 0.92, eyeOpen: 0.88, browY: -1, mouthY: 1 },
      asher: { eyeScale: 0.93, irisScale: 0.92, cheekOpacity: 0.08 },
      elena: { eyeScale: 0.96, irisScale: 0.95, cheekOpacity: 0.12 },
      kai: { eyeScale: 0.9, eyeOpen: 0.86, browY: -1 },
      lucy: { eyeScale: 0.93, irisScale: 0.91, cheekOpacity: 0.1 },
      romeo: { eyeScale: 0.9, browScaleX: 1.04 },
      adeline: { eyeScale: 0.9, irisScale: 0.88, eyeY: 1, noseScale: 0.94 },
      felix: { eyeScale: 0.95, irisScale: 0.93, cheekOpacity: 0.09 },
      ines: { eyeScale: 0.95, browY: -1, cheekOpacity: 0.1 },
      priya: { eyeScale: 0.96, cheekOpacity: 0.11 },
      hugo: { eyeScale: 0.88, irisScale: 0.88, eyeY: 1, mouthY: 1 },
      noor: { eyeScale: 0.92, eyeOpen: 0.88, browY: -1 },
      tyler: { eyeScale: 0.93, irisScale: 0.91, cheekOpacity: 0.08 }
    };
    const cycle = [
      { eyeScale: 0.92, irisScale: 0.9, cheekOpacity: 0.08 },
      { eyeScale: 0.96, irisScale: 0.94, cheekOpacity: 0.11 },
      { eyeScale: 0.9, eyeOpen: 0.88, browY: -1 },
      { eyeScale: 0.94, noseScale: 1.04, jawShadowY: 2 },
      { eyeScale: 0.91, irisScale: 0.89, mouthY: 1 }
    ][index % 5];
    return { ...base, ...cycle, ...(custom[id] || {}) };
  }

  function earVariantFor(id, index) {
    const custom = {
      gianni: "lobe",
      sophia: "attached",
      stella: "narrow",
      matilda: "round",
      aisha: "attached"
    };
    return custom[id] || ["round", "attached", "narrow", "lobe"][index % 4];
  }

  function browShapeFor(id, index) {
    const keys = Object.keys(browShapes);
    // spread the styles so neighbours in the roster don't share a brow
    let hash = index * 7;
    for (let i = 0; i < id.length; i++) hash += id.charCodeAt(i);
    return keys[hash % keys.length];
  }

  function teethStyleFor(id, index) {
    // mostly tidy/even teeth, with a sprinkling of character (bucky, gappy, spaced) so smiles vary
    const custom = { felix: "bucky", milo: "bucky", javier: "gappy", celeste: "even", will: "spaced" };
    if (custom[id]) return custom[id];
    return ["even", "even", "even", "gappy", "spaced", "perfect"][stableHash(id + index) % 6];
  }

  function lipsFor(id, index, pronouns) {
    // fuller lips read more naturally on resting faces; give "she" characters and a few others a
    // sculpted lip, leave the rest a simple line.
    const custom = { jade: "full", priya: "full", celeste: "full", tiana: "full", aaron: "line" };
    if (custom[id]) return custom[id];
    if (pronouns === "she") return stableHash(id) % 2 ? "full" : "soft";
    return stableHash(id + "lip") % 4 === 0 ? "soft" : "line";
  }

  function neckLengthFor(id, index) {
    const custom = {
      gianni: 8,
      sophia: 6,
      matilda: 5,
      olivia: 6,
      noor: 7,
      adeline: 6
    };
    if (custom[id] != null) return custom[id];
    return [0, 2, 4, 1, 3, 0][index % 6];
  }

  // Shoulder half-width: women slimmer than men, deterministic per-character variance, plus a
  // nudge from the role so physical jobs read bulky and sedentary ones slighter - the cast shows
  // a real range of builds instead of one uniform broad frame.
  function buildFor(id, index, pronouns, role) {
    const base = pronouns === "she" ? 72 : pronouns === "they" ? 80 : 86;
    const jitter = [0, 6, -4, 3, -6, 8, -2, 5, -7, 2, -3, 7][index % 12];
    let b = base + jitter;
    const r = (role || "").toLowerCase();
    if (/trainer|security|guard|bouncer|firefighter|athlete|construction|mover|wrestler|farmer|chef/.test(r)) b += 9;
    else if (/dancer|yoga|librarian|student|barista|writer|poet|accountant/.test(r)) b -= 4;
    return Math.max(62, Math.min(100, b));
  }

  // Shoulder droop: slim builds get sloped/contoured shoulders, bulky builds squarer (but still
  // rounded) ones; women a touch more sloped. Mirrors the fallback formula in shoulderPath so the
  // stored value matches the rendered shape - it just lets the studio show/edit a real default.
  function slopeFor(build, pronouns) {
    let s = 0.92 - (build - 68) / 42;
    if (pronouns === "she") s += 0.06;
    return Math.round(Math.max(0.18, Math.min(0.9, s)) * 100) / 100;
  }

  function secretForExpression(expression) {
    const secrets = {
      neutral: "keeps a careful face",
      happy: "smiles before answering",
      surprised: "reacts too honestly",
      angry: "looks ready to object",
      sad: "seems quietly worried"
    };
    return secrets[expression];
  }

  function accentFor(index, accessory) {
    if (accessory === "cap") return ["#058748", "#176fc0", "#d84e40"][index % 3];
    if (accessory === "capBack") return "#3f9d4f";
    if (accessory === "beanie") return ["#8d61d1", "#f0d68b", "#275f9c"][index % 3];
    if (accessory === "beret") return "#0b8f65";
    if (accessory === "headband") return ["#3478d8", "#f59ac0", "#f3af21"][index % 3];
    return ["#f3b42f", "#ff69a6", "#36a875", "#6d64c8"][index % 4];
  }

  function stableHash(value) {
    let hash = 2166136261;
    for (let index = 0; index < value.length; index += 1) {
      hash ^= value.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  window.faceGenerator = {
    createCharacters,
    renderPortrait: composePortrait,
    traitBook: {
      skinTones,
      hairColors,
      faceShapes: Object.keys(faceShapes),
      expressions: Object.keys(expressions),
      mouthStyles: Object.keys(mouthLabels),
      hairStyles: Object.keys(hairStyles),
      clothing: Object.keys(clothing),
      accessories: Object.keys(accessories),
      earVariants: ["round", "attached", "narrow", "lobe"],
      browShapes: Object.keys(browShapes),
      teethStyles: ["even", "perfect", "gappy", "bucky", "spaced"],
      lipStyles: ["line", "soft", "full"],
      lipUppers: ["soft", "cupid", "flat", "peaked", "heavy"],
      lipLowers: ["round", "pillow", "wide", "flat"],
      chinShapes: ["none", "round", "square", "dimple", "pointed"],
      animModes: ["still", "calm", "curious", "serious", "shifty", "alert", "smug", "sleepy"],
      tattooFonts: Object.keys(tattooFonts),
      tattooPlaces: ["body", "face"],
      accessoryMetals: ["", "silver", "gold", "black", "roseGold"],
      noseTips: ["round", "narrow", "pointed", "straight", "button", "upturned"],
      skinTones: Object.keys(skinTones),
      hairColors: Object.keys(hairColors),
      hairColorHex: hairColors,
      skinToneHex: skinTones
    }
  };
})();
