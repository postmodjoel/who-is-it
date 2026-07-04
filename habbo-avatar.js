// ===================== habbo-avatar: local Habbo-style pixel sprites =====================
// Renders chunky hotel-guest sprites for Habbo mode as pure local SVG pixel art (no calls to
// Sulake's avatar-imaging API). Big square-ish head, small body, hard outlines, blocky shoes,
// simple side-lit shading. Traits (skin/hair/shirt/accessories) come from the character's
// existing face-generator traits, so the pixel guest reads as the same person.
// Exposes: window.habboAvatar.render(ch, opts)      -> full-body sprite data URL
//          window.habboAvatar.renderHead(ch, opts)  -> head-only data URL (cam/chat previews)
(function () {
  const INK = "#0e0d12";

  // Local fallback hash (stableHash lives in the app bundle; don't depend on load order).
  function hash(s) {
    let h = 5381;
    for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) >>> 0;
    return h >>> 0;
  }

  // Hair-colour names -> hex (mirrors the face generator's palette closely enough for pixels).
  const HAIR_HEX = {
    black: "#1d1a17", darkBrown: "#3a2418", brown: "#5a3d28", chestnut: "#6e4a2c",
    auburn: "#7a3b22", blonde: "#c9973f", platinum: "#e4d6ae", red: "#a83220",
    ginger: "#c05a24", silver: "#a8a8b0", grey: "#8a8a90", white: "#e8e6e0",
    blue: "#3a5fd0", pink: "#d8639a", purple: "#73497e", green: "#3f7a4a"
  };

  function shade(hex, k) {
    const n = parseInt(String(hex).replace("#", ""), 16);
    if (isNaN(n)) return hex;
    const f = (c) => Math.max(0, Math.min(255, Math.round(c * k)));
    return "#" + [f((n >> 16) & 255), f((n >> 8) & 255), f(n & 255)]
      .map((c) => c.toString(16).padStart(2, "0")).join("");
  }

  function skinHexFor(traits) {
    if (traits.skinHex) return traits.skinHex;
    const book = window.faceGenerator && window.faceGenerator.traitBook;
    const map = book && (book.skinToneHex || {});
    return (map && map[traits.skin]) || "#c89070";
  }
  function hairHexFor(traits) {
    return traits.hairHex || HAIR_HEX[traits.hairColor] || "#3a2418";
  }

  // Categorise the face-generator hair style into a pixel silhouette.
  function hairShape(style) {
    const s = String(style || "").toLowerCase();
    if (!s || s === "bald") return "bald";
    if (/afro|coily|curly|puff/.test(s)) return "afro";
    if (/pony|bun|updo|horn/.test(s)) return "pony";
    if (/long|waves|cascade|straight|locs|braid/.test(s)) return "long";
    if (/bob|shoulder/.test(s)) return "bob";
    return "short";
  }

  // The sprite grid is 26 wide x 44 tall logical pixels; rect() paints on that grid.
  function buildSprite(ch, opts) {
    const t = ch.traits || {};
    const o = opts || {};
    const seed = hash(`${ch.id}:${ch.seed || 0}`);
    const skin = skinHexFor(t);
    const hair = hairHexFor(t);
    const shirt = t.shirt || ["#3a86ff", "#e01b1b", "#178a47", "#ffbe0b", "#73497e", "#d8639a"][seed % 6];
    const trous = ["#2b2f4a", "#31313a", "#3a2d24", "#24413a"][(seed >>> 3) % 4];
    const shoes = ["#17151a", "#4a2c1a", "#e8e6e0"][(seed >>> 6) % 3];
    const acc = String(t.accessory || "");
    const shape = hairShape(t.hair);
    const R = [];
    const px = (x, y, w, h, c) => R.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`);

    // ---- head block (y 2..17): outline, skin, side-lit right edge ----
    const headOnly = !!o.headOnly;
    px(5, 2, 16, 1, INK); px(4, 3, 1, 13, INK); px(21, 3, 1, 13, INK); px(5, 16, 16, 1, INK);
    px(5, 3, 15, 13, skin);
    px(19, 3, 1, 13, shade(skin, 0.8));            // side light
    // ears
    px(3, 8, 1, 3, INK); px(22, 8, 1, 3, INK);
    // eyes (white + pupil), Habbo-style two-pixel stare
    px(9, 8, 2, 2, "#ffffff"); px(15, 8, 2, 2, "#ffffff");
    px(10, 8, 1, 2, "#2b2b33"); px(16, 8, 1, 2, "#2b2b33");
    // brows
    px(9, 6, 3, 1, shade(hair, 0.75)); px(15, 6, 3, 1, shade(hair, 0.75));
    // nose + mouth
    px(12, 10, 2, 1, shade(skin, 0.72));
    px(11, 13, 4, 1, "#7a3b30");
    // blush option via seed
    if ((seed >>> 9) % 3 === 0) { px(7, 11, 2, 1, shade(skin, 0.88)); px(17, 11, 2, 1, shade(skin, 0.88)); }

    // ---- hair ----
    if (shape !== "bald") {
      px(4, 1, 18, 1, INK);
      px(5, 2, 16, 3, hair);                        // cap
      px(5, 5, 3, 1, hair); px(18, 5, 3, 1, hair);  // fringe corners
      if ((seed >>> 4) % 2) px(9, 5, 3, 1, hair);   // fringe tuft varies per person
      px(19, 2, 2, 3, shade(hair, 0.8));
      if (shape === "afro") { px(3, 0, 20, 4, hair); px(2, 2, 2, 6, hair); px(22, 2, 2, 6, hair); px(3, 0, 20, 1, INK); }
      if (shape === "long") { px(3, 4, 2, 10, hair); px(21, 4, 2, 10, hair); px(3, 13, 2, 1, INK); px(21, 13, 2, 1, INK); }
      if (shape === "bob") { px(3, 4, 2, 7, hair); px(21, 4, 2, 7, hair); }
      if (shape === "pony") { px(11, 0, 5, 2, hair); px(22, 5, 2, 7, shade(hair, 0.9)); }
    }
    // hats sit on top of everything
    if (/cap/.test(acc)) { px(4, 1, 18, 3, shirt); px(16, 3, 8, 1, shirt); px(4, 1, 18, 1, INK); }
    else if (/beanie/.test(acc)) { px(4, 0, 18, 4, shade(shirt, 0.85)); px(4, 4, 18, 1, INK); }
    else if (/beret/.test(acc)) { px(5, 0, 14, 3, "#a83220"); px(18, 1, 2, 1, "#a83220"); }
    // glasses
    if (/glass|specs/.test(acc)) {
      px(8, 8, 4, 1, INK); px(14, 8, 4, 1, INK); px(12, 8, 2, 1, INK);
      px(8, 9, 1, 1, INK); px(11, 9, 1, 1, INK); px(14, 9, 1, 1, INK); px(17, 9, 1, 1, INK);
    }
    // facial hair
    if ((Number(t.beardLength) || 0) > 0.05 || /beard/.test(acc)) {
      px(6, 13, 14, 3, shade(hair, 0.7)); px(11, 13, 4, 1, "#7a3b30");
    }
    if ((Number(t.moustacheScale) || 0) > 0.1) px(10, 12, 6, 1, shade(hair, 0.65));
    // earrings
    if (/earring/.test(acc)) { px(3, 11, 1, 1, "#f2b84b"); px(22, 11, 1, 1, "#f2b84b"); }

    if (!headOnly) {
      // ---- torso (y 17..31) ----
      const bare = t.clothing === "bare";
      const top = bare ? skin : shirt;
      px(6, 17, 14, 1, INK);
      px(6, 18, 14, 9, top);
      px(18, 18, 2, 9, shade(top, 0.8));
      // arms + hands
      px(4, 18, 2, 8, bare ? skin : top); px(20, 18, 2, 8, bare ? skin : shade(top, 0.8));
      px(4, 26, 2, 2, skin); px(20, 26, 2, 2, skin);
      px(3, 18, 1, 8, INK); px(22, 18, 1, 8, INK);
      // clothing details
      if (t.clothing === "hoodie") { px(9, 18, 8, 2, shade(top, 0.78)); px(12, 20, 2, 5, shade(top, 0.7)); }
      if (t.clothing === "blazer") { px(6, 18, 3, 9, shade(top, 0.6)); px(17, 18, 3, 9, shade(top, 0.6)); px(11, 19, 4, 3, "#e8e6e0"); }
      if (t.clothing === "singlet") { px(6, 18, 14, 2, skin); px(9, 18, 8, 1, top); }
      if (/necklace|chain/.test(acc)) px(9, 18, 8, 1, "#f2b84b");
      // ---- legs + shoes (y 27..40) ----
      px(7, 27, 12, 6, trous);
      px(16, 27, 3, 6, shade(trous, 0.8));
      px(12, 27, 2, 6, shade(trous, 0.86));         // leg split
      px(6, 33, 6, 3, shoes); px(14, 33, 6, 3, shoes);
      px(5, 35, 7, 2, shoes); px(14, 35, 7, 2, shoes);
      px(5, 37, 16, 1, INK);
      px(6, 33, 1, 4, INK); px(19, 33, 2, 1, INK);
    }
    const h = headOnly ? 18 : 40;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 26 ${h}" shape-rendering="crispEdges">${R.join("")}</svg>`;
  }

  // Rendered sprites are cached: rerenders during walking/selection stay free.
  const cache = new Map();
  function key(ch, opts) {
    const t = ch.traits || {};
    return [ch.id, ch.seed, opts && opts.headOnly ? "h" : "b", t.skin, t.skinHex, t.hair, t.hairColor,
      t.hairHex, t.shirt, t.clothing, t.accessory, t.beardLength, t.moustacheScale].join("|");
  }
  function toUrl(svg) { return "data:image/svg+xml;utf8," + encodeURIComponent(svg); }

  window.habboAvatar = {
    render(ch, opts) {
      const k = key(ch, opts || {});
      if (!cache.has(k)) cache.set(k, toUrl(buildSprite(ch, opts || {})));
      return cache.get(k);
    },
    renderHead(ch, opts) {
      return this.render(ch, { ...(opts || {}), headOnly: true });
    }
  };
})();
