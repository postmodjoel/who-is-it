(function () {
  const ink = "#1f2330";
  const stroke = { contour: 3.4, feature: 2.5, detail: 1.7 };

  const bodyPresets = {
    slim: { label: "Slim", build: 70, shoulderSlope: 0.82, bodyWidth: 0.84, belly: 0.02 },
    average: { label: "Average", build: 82, shoulderSlope: 0.56, bodyWidth: 1, belly: 0.08 },
    broad: { label: "Broad", build: 98, shoulderSlope: 0.25, bodyWidth: 1.08, belly: 0.02 },
    soft: { label: "Soft belly", build: 88, shoulderSlope: 0.48, bodyWidth: 1.18, belly: 0.62 }
  };

  const skinPresets = {
    fair: { label: "Fair", value: "#efbd94" },
    olive: { label: "Olive", value: "#c39b6a" },
    tan: { label: "Tan", value: "#c88968" },
    brown: { label: "Brown", value: "#865335" },
    deep: { label: "Deep", value: "#5b341f" }
  };

  const colourSwatches = ["#2f7a78", "#d84e40", "#e0a33a", "#5369b8", "#763f9d", "#267c4f", "#313640", "#f1f1eb"];

  const currentOutfits = [
    { id: "tee", name: "Crew Tee", status: "current", kind: "base", type: "tee", color: "#2f7a78", tags: ["baseline", "crew"], notes: "Good base silhouette, but most variety relies on colour alone." },
    { id: "vneck", name: "V-Neck Knit", status: "current", kind: "base", type: "vneck", color: "#7062a8", tags: ["neckline", "knit"], notes: "A stronger neckline read than tee, still shares the same torso." },
    { id: "collared", name: "Button-Up", status: "current", kind: "base", type: "collared", color: "#3f78a5", tags: ["collar", "buttons"], notes: "Clear at small size thanks to the flaps and placket." },
    { id: "blazer", name: "Blazer", status: "current", kind: "base", type: "blazer", color: "#384252", tags: ["formal", "tie"], notes: "One of the current options with the most shape language." },
    { id: "jacket", name: "Zip Jacket", status: "current", kind: "base", type: "jacket", color: "#2b6795", tags: ["outerwear", "zip"], notes: "Useful, but close to hoodie and tee unless the zip is visible." },
    { id: "hoodie", name: "Hoodie", status: "current", kind: "base", type: "hoodie", color: "#5c6f43", tags: ["casual", "hood"], notes: "Best current casual option; the hood rolls read well." },
    { id: "turtleneck", name: "Turtleneck", status: "current", kind: "base", type: "turtleneck", color: "#1f6f78", tags: ["high neck", "ribbed"], notes: "Distinct neckline, simple body." },
    { id: "overalls", name: "Overalls", status: "current", kind: "layer", type: "overalls", defaultBase: "tee", color: "#596f9b", tags: ["straps", "bib", "layerable"], notes: "A bib-and-strap layer that should sit over tees, shirts, or knits." },
    { id: "singlet", name: "Singlet", status: "current", kind: "base", type: "singlet", color: "#d76075", tags: ["bare shoulder", "straps"], notes: "Bare shoulders help, but it is the only lighter warm-weather option." }
  ];

  const newOutfits = [
    { id: "rugby", name: "Rugby Stripe", status: "new", kind: "base", type: "rugby", color: "#246c5b", accent: "#f0d35f", tags: ["stripes", "sport"], notes: "Big horizontal bands stay readable even on tiny cards." },
    { id: "flannel", name: "Open Flannel", status: "new", kind: "layer", type: "flannel", defaultBase: "tee", color: "#b7443d", accent: "#253244", tags: ["plaid", "layerable"], notes: "Now treated as a real overshirt: plaid sleeves and side body over a visible underlayer." },
    { id: "denim", name: "Denim Jacket", status: "new", kind: "layer", type: "denim", defaultBase: "tee", color: "#3d6f9e", accent: "#d6a24e", tags: ["outerwear", "pockets", "layerable"], notes: "Chest pockets and stitching create character without needing extra width." },
    { id: "varsity", name: "Varsity Jacket", status: "new", kind: "layer", type: "varsity", defaultBase: "tee", color: "#a53845", accent: "#f0f0e7", tags: ["contrast sleeves", "patch", "layerable"], notes: "Redrawn as a jacket with sleeves and ribbing instead of hanging scarf panels." },
    { id: "bomber", name: "Bomber Jacket", status: "new", kind: "layer", type: "bomber", defaultBase: "tee", color: "#566f40", accent: "#e0a33a", tags: ["puffy", "ribbed", "layerable"], notes: "Rounded body and ribbed bands broaden the outerwear set." },
    { id: "cardigan", name: "Cardigan", status: "new", kind: "layer", type: "cardigan", defaultBase: "turtleneck", color: "#7d5a8f", accent: "#f2dfcf", tags: ["knit", "buttons", "layerable"], notes: "Soft open front, cosy without being another hoodie." },
    { id: "sweaterVest", name: "Sweater Vest", status: "new", kind: "layer", type: "sweaterVest", defaultBase: "collared", color: "#c58b31", accent: "#283e6a", tags: ["argyle", "shirt", "layerable"], notes: "A vest layer over shirts, tees, or turtlenecks." },
    { id: "labCoat", name: "Lab Coat", status: "new", kind: "layer", type: "labCoat", defaultBase: "scrubs", color: "#f4f6f4", accent: "#2f7a78", tags: ["role", "coat", "layerable"], notes: "Outer arms are now coat-white, with the underlayer visible only through the centre opening." },
    { id: "scrubs", name: "Scrubs", status: "new", kind: "base", type: "scrubs", color: "#1e8c91", accent: "#cbe7e6", tags: ["role", "v-neck"], notes: "A clean occupational option that is not just a collared shirt." },
    { id: "chefCoat", name: "Chef Coat", status: "new", kind: "base", type: "chefCoat", color: "#f2f1e8", accent: "#cc453c", tags: ["role", "double-breasted"], notes: "Double buttons are instantly different from the current button-up." },
    { id: "apron", name: "Apron", status: "new", kind: "layer", type: "apron", defaultBase: "collared", color: "#2f7a78", accent: "#e7b64f", tags: ["role", "bib", "layerable"], notes: "A true overlay now, so it can sit over tees, shirts, scrubs, or knits." },
    { id: "securityVest", name: "Hi-Vis Vest", status: "new", kind: "layer", type: "securityVest", defaultBase: "tee", color: "#242b34", accent: "#e7f04a", tags: ["role", "reflective", "layerable"], notes: "High visibility strips give a loud, readable option without changing skin or hair." },
    { id: "tracksuit", name: "Tracksuit Top", status: "new", kind: "base", type: "tracksuit", color: "#315eaa", accent: "#f3f0e7", tags: ["sport", "zip"], notes: "Shoulder stripes and tall collar separate it from the zip jacket." },
    { id: "raincoat", name: "Raincoat", status: "new", kind: "layer", type: "raincoat", defaultBase: "tee", color: "#e3b83e", accent: "#384252", tags: ["hood", "snaps", "layerable"], notes: "Bright slicker hood gives a bold silhouette and comic-location energy." },
    { id: "pinafore", name: "Pinafore", status: "new", kind: "layer", type: "pinafore", defaultBase: "tee", color: "#4b5f9c", accent: "#f1f1eb", tags: ["dress", "straps", "layerable"], notes: "A dress-like layer that can sit over a tee, shirt, or turtleneck." },
    { id: "sariDrape", name: "Sari Drape", status: "new", kind: "base", type: "sariDrape", color: "#d04e78", accent: "#e3b83e", tags: ["drape", "formal"], notes: "Diagonal fabric makes the chest read unlike any existing collar." },
    { id: "kurta", name: "Kurta", status: "new", kind: "base", type: "kurta", color: "#2f7a5d", accent: "#d8b65a", tags: ["tunic", "placket"], notes: "Long placket and band collar give a calm, polished silhouette." },
    { id: "sequin", name: "Sequin Top", status: "new", kind: "base", type: "sequin", color: "#4f3c8b", accent: "#f0c94d", tags: ["party", "sparkle"], notes: "Tiny star details help nightclub/casino characters stand out." },
    { id: "leather", name: "Biker Jacket", status: "new", kind: "layer", type: "leather", defaultBase: "tee", color: "#252933", accent: "#cdd2d6", tags: ["outerwear", "diagonal zip", "layerable"], notes: "Asymmetry is the big win here; it avoids another centre-zip read." }
  ];

  const REVIEW_KEY = "who-is-that-clothing-lab-reviews";
  const catalog = currentOutfits.concat(newOutfits);
  const baseOutfits = catalog.filter((item) => item.kind !== "layer");

  const state = {
    selectedId: newOutfits[0].id,
    view: "all",
    colour: newOutfits[0].color,
    underLayer: "tee",
    skin: skinPresets.fair.value,
    body: { ...bodyPresets.average },
    reviews: readReviews()
  };

  const els = {
    viewFilter: document.querySelector("#viewFilter"),
    underLayer: document.querySelector("#underLayer"),
    bodyPreset: document.querySelector("#bodyPreset"),
    skinPreset: document.querySelector("#skinPreset"),
    colourInput: document.querySelector("#colourInput"),
    swatches: document.querySelector("#swatches"),
    previewArt: document.querySelector("#previewArt"),
    previewStatus: document.querySelector("#previewStatus"),
    previewName: document.querySelector("#previewName"),
    previewNotes: document.querySelector("#previewNotes"),
    previewTags: document.querySelector("#previewTags"),
    buildRange: document.querySelector("#buildRange"),
    slopeRange: document.querySelector("#slopeRange"),
    bodyWidthRange: document.querySelector("#bodyWidthRange"),
    bellyRange: document.querySelector("#bellyRange"),
    specOutput: document.querySelector("#specOutput"),
    catalogTitle: document.querySelector("#catalogTitle"),
    catalogStats: document.querySelector("#catalogStats"),
    outfitGrid: document.querySelector("#outfitGrid"),
    yayButton: document.querySelector("#yayButton"),
    nayButton: document.querySelector("#nayButton"),
    clearVoteButton: document.querySelector("#clearVoteButton")
  };

  function hexToRgb(hex) {
    const raw = String(hex || "").replace("#", "");
    const full = raw.length === 3 ? raw.split("").map((c) => c + c).join("") : raw.padEnd(6, "0").slice(0, 6);
    const num = parseInt(full, 16);
    return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
  }

  function shadeColor(hex, factor) {
    const { r, g, b } = hexToRgb(hex);
    const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
    return `rgb(${clamp(r * factor)}, ${clamp(g * factor)}, ${clamp(b * factor)})`;
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" }[char]));
  }

  function f(value) {
    return Number(value).toFixed(1);
  }

  function currentItem() {
    return catalog.find((item) => item.id === state.selectedId) || catalog[0];
  }

  function itemColor(item) {
    return state.selectedId === item.id ? state.colour : item.color;
  }

  function readReviews() {
    try {
      return JSON.parse(localStorage.getItem(REVIEW_KEY)) || {};
    } catch (error) {
      return {};
    }
  }

  function saveReviews() {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(state.reviews));
  }

  function reviewFor(id) {
    return state.reviews[id] || "";
  }

  function setReview(id, vote) {
    if (!id) return;
    if (vote) state.reviews[id] = vote;
    else delete state.reviews[id];
    saveReviews();
    render();
  }

  function baseItemFor(id) {
    return baseOutfits.find((item) => item.id === id) || baseOutfits[0];
  }

  function baseForLayer(item) {
    const id = item.kind === "layer" ? (state.underLayer || item.defaultBase || "tee") : item.id;
    return baseItemFor(id);
  }

  function bodyPath(t) {
    const sh = Math.max(60, Math.min(106, Number(t.build) || 82));
    const slope = Math.max(0.15, Math.min(0.9, Number(t.shoulderSlope) || 0.56));
    const neckHalf = sh < 76 ? 20 : 22;
    const neckY = 142;
    const tipY = 154 + slope * 25;
    const botHalf = sh * (Number(t.bodyWidth) || 1);
    const belly = Math.max(0, Math.min(1, Number(t.belly) || 0)) * 17;
    const r = 7 + slope * 5;
    const nl = 128 - neckHalf;
    const nr = 128 + neckHalf;
    const tl = 128 - sh;
    const tr = 128 + sh;
    const bl = 128 - botHalf;
    const br = 128 + botHalf;
    const dropY = neckY + 4 + slope * 7;
    return `M${f(nl)} ${f(neckY)}`
      + ` C ${f(nl - 7)} ${f(dropY)} ${f(tl + r)} ${f(tipY - r - 2)} ${f(tl)} ${f(tipY)}`
      + ` C ${f(tl - r + 2)} ${f(tipY + r)} ${f(bl - 1 - belly)} ${f(tipY + 13)} ${f(bl - belly * 0.8)} 256`
      + ` L ${f(br + belly * 0.8)} 256`
      + ` C ${f(br + 1 + belly)} ${f(tipY + 13)} ${f(tr + r - 2)} ${f(tipY + r)} ${f(tr)} ${f(tipY)}`
      + ` C ${f(tr - r)} ${f(tipY - r - 2)} ${f(nr + 7)} ${f(dropY)} ${f(nr)} ${f(neckY)} Z`;
  }

  function mannequin(t) {
    const skin = state.skin;
    const hair = "#332017";
    return `
      <path d='M108 104L108 153Q128 165 148 153L148 104Z' fill='${skin}' stroke='${ink}' stroke-width='3'/>
      <circle cx='67' cy='105' r='11' fill='${skin}' stroke='${ink}' stroke-width='3'/>
      <circle cx='189' cy='105' r='11' fill='${skin}' stroke='${ink}' stroke-width='3'/>
      <path d='M128 39c36 0 60 27 60 67 0 25-8 46-22 59-10 10-23 15-38 15s-28-5-38-15c-14-13-22-34-22-59 0-40 24-67 60-67Z' fill='${skin}' stroke='${ink}' stroke-width='3.4'/>
      <path d='M70 93c8-37 31-58 60-58 30 0 53 20 60 58-31-13-77-13-120 0Z' fill='${hair}' stroke='${ink}' stroke-width='3' stroke-linejoin='round'/>
      <path d='M101 107c9-3 18-3 27 0M136 107c9-3 18-3 27 0' stroke='${ink}' stroke-width='2.4' stroke-linecap='round'/>
      <path d='M111 127q17 9 34 0' fill='none' stroke='${ink}' stroke-width='2.4' stroke-linecap='round'/>
    `;
  }

  function baseBody(t, fill, extra = "") {
    const lo = shadeColor(fill, 0.82);
    const hi = shadeColor(fill, 1.14);
    const d = bodyPath(t);
    const sh = Number(t.build) || 82;
    const arc = `M${f(128 - sh * 0.47)} 239C${f(128 - sh * 0.28)} 214 ${f(128 - sh * 0.12)} 203 128 203C${f(128 + sh * 0.12)} 203 ${f(128 + sh * 0.28)} 214 ${f(128 + sh * 0.47)} 239`;
    return `
      <path d='${d}' fill='${fill}' stroke='${ink}' stroke-width='${stroke.contour}' stroke-linejoin='round'/>
      <path d='${arc}' fill='none' stroke='${lo}' stroke-width='${stroke.detail}' stroke-linecap='round' opacity='.38'/>
      <path d='M${f(128 - sh * 0.7)} 175C${f(128 - sh * 0.55)} 195 ${f(128 - sh * 0.47)} 218 ${f(128 - sh * 0.49)} 256M${f(128 + sh * 0.7)} 175C${f(128 + sh * 0.55)} 195 ${f(128 + sh * 0.47)} 218 ${f(128 + sh * 0.49)} 256' fill='none' stroke='${lo}' stroke-width='${stroke.detail}' stroke-linecap='round' opacity='.48'/>
      <path d='M92 168c22 9 50 9 72 0' fill='none' stroke='${hi}' stroke-width='1.4' stroke-linecap='round' opacity='.28'/>
      ${extra}
    `;
  }

  function crewCollar(c) {
    const lo = shadeColor(c, 0.82);
    return `
      <path d='M102 142 Q128 158 154 142 L158 151 Q128 169 98 151 Z' fill='${lo}' stroke='${ink}' stroke-width='2.4' stroke-linejoin='round'/>
      <path d='M107 146 Q128 158 149 146' fill='none' stroke='rgba(255,255,255,.35)' stroke-width='1.4' stroke-linecap='round'/>
    `;
  }

  function vNeck(c) {
    const lo = shadeColor(c, 0.78);
    return `
      <path d='M101 143L128 183L155 143' fill='none' stroke='${ink}' stroke-width='6' stroke-linejoin='round'/>
      <path d='M101 143L128 183L155 143' fill='none' stroke='${lo}' stroke-width='3' stroke-linejoin='round'/>
    `;
  }

  function buttonPlacket(x, y, count, step, color) {
    let out = "";
    for (let i = 0; i < count; i += 1) {
      out += `<circle cx='${x}' cy='${y + i * step}' r='2.2' fill='${color}' stroke='${ink}' stroke-width='1.1'/>`;
    }
    return out;
  }

  function renderCurrent(item, t, c) {
    const accent = item.accent || shadeColor(c, 1.35);
    if (item.type === "vneck") return baseBody(t, c, vNeck(c));
    if (item.type === "collared") {
      return baseBody(t, c, `
        <path d='M128 151L102 143L97 163L126 172Z' fill='${c}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M128 151L154 143L159 163L130 172Z' fill='${c}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M128 166L128 256' stroke='${shadeColor(c, 0.62)}' stroke-width='2.4' opacity='.55'/>
        ${buttonPlacket(128, 182, 4, 14, accent)}
      `);
    }
    if (item.type === "blazer") {
      return baseBody(t, c, `
        <path d='M113 143L128 196L143 143Z' fill='#f2efe7' stroke='${ink}' stroke-width='2'/>
        <path d='M128 151L122 160L126 210L131 210L135 160Z' fill='${shadeColor(c, 0.52)}' stroke='${ink}' stroke-width='1.8'/>
        <path d='M101 143L128 153L121 203L95 166Z' fill='${shadeColor(c, 1.08)}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M155 143L128 153L135 203L161 166Z' fill='${shadeColor(c, 1.08)}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
      `);
    }
    if (item.type === "jacket") {
      return baseBody(t, c, `
        <path d='M101 144Q128 160 155 144L160 155Q128 174 96 155Z' fill='${shadeColor(c, 0.85)}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M128 154V256' stroke='${ink}' stroke-width='2.8'/>
        <g stroke='${accent}' stroke-width='1.4'>${Array.from({ length: 11 }, (_, i) => `<path d='M125 ${166 + i * 7}H131'/>`).join("")}</g>
        <path d='M103 176C111 200 116 224 116 256M153 176C145 200 140 224 140 256' fill='none' stroke='${shadeColor(c, 0.68)}' stroke-width='1.8' opacity='.6'/>
      `);
    }
    if (item.type === "hoodie") {
      const lo = shadeColor(c, 0.78);
      return baseBody(t, c, `
        <path d='M101 160C84 142 92 112 116 116C126 132 121 151 111 164Z' fill='${lo}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M155 160C172 142 164 112 140 116C130 132 135 151 145 164Z' fill='${lo}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M102 144Q128 160 154 144L158 153Q128 170 98 153Z' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M105 232Q128 241 151 232L151 256H105Z' fill='${lo}' stroke='${shadeColor(c, 0.6)}' stroke-width='1.8'/>
        <path d='M118 153L114 188M138 153L142 188' stroke='${shadeColor(c, 0.55)}' stroke-width='2.5' stroke-linecap='round'/>
        <circle cx='114' cy='190' r='2.5' fill='${accent}' stroke='${ink}' stroke-width='1.2'/>
        <circle cx='142' cy='190' r='2.5' fill='${accent}' stroke='${ink}' stroke-width='1.2'/>
      `);
    }
    if (item.type === "turtleneck") {
      const rib = shadeColor(c, 0.62);
      return baseBody(t, c, `
        <path d='M102 144Q128 128 154 144L154 164Q128 176 102 164Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <g stroke='${rib}' stroke-width='1.2' opacity='.55'>${Array.from({ length: 8 }, (_, i) => `<path d='M${107 + i * 6} 142V165'/>`).join("")}</g>
        <path d='M106 154Q128 165 150 154' fill='none' stroke='${shadeColor(c, 0.52)}' stroke-width='2'/>
      `);
    }
    if (item.type === "overalls") {
      return baseBody(t, "#f2efe7", `
        <path d='M104 156Q128 166 152 156L152 222L104 222Z' fill='${c}' stroke='${ink}' stroke-width='2.6' stroke-linejoin='round'/>
        <path d='M104 157C91 147 79 145 68 151M152 157C165 147 177 145 188 151' fill='none' stroke='${c}' stroke-width='11' stroke-linecap='round'/>
        <path d='M104 157C91 147 79 145 68 151M152 157C165 147 177 145 188 151' fill='none' stroke='${ink}' stroke-width='2' stroke-linecap='round' opacity='.62'/>
        <circle cx='113' cy='171' r='2.5' fill='${accent}' stroke='${ink}' stroke-width='1.2'/>
        <circle cx='143' cy='171' r='2.5' fill='${accent}' stroke='${ink}' stroke-width='1.2'/>
        <path d='M112 197H144' stroke='${shadeColor(c, 0.65)}' stroke-width='2' stroke-linecap='round'/>
      `);
    }
    if (item.type === "singlet") {
      const skin = state.skin;
      return baseBody(t, skin, `
        <path d='M103 145L113 145L110 169L102 169Z' fill='${c}' stroke='${ink}' stroke-width='2'/>
        <path d='M153 145L143 145L146 169L154 169Z' fill='${c}' stroke='${ink}' stroke-width='2'/>
        <path d='M109 148C110 187 91 211 89 256H167C165 211 146 187 147 148Q128 168 109 148Z' fill='${c}' stroke='${ink}' stroke-width='3' stroke-linejoin='round'/>
        <path d='M113 158Q128 176 143 158' fill='none' stroke='${shadeColor(c, 0.75)}' stroke-width='1.8' stroke-linecap='round'/>
      `);
    }
    return baseBody(t, c, crewCollar(c));
  }

  function clipPattern(id, content) {
    return `<defs><clipPath id='${id}'><path d='${bodyPath(state.body)}'/></clipPath></defs><g clip-path='url(#${id})'>${content}</g>`;
  }

  function renderNew(item, t, c) {
    const a = item.accent || shadeColor(c, 1.25);
    const lo = shadeColor(c, 0.76);
    const hi = shadeColor(c, 1.14);
    if (item.type === "rugby") {
      const stripes = Array.from({ length: 5 }, (_, i) => `<rect x='28' y='${158 + i * 24}' width='200' height='13' fill='${i % 2 ? shadeColor(c, 0.86) : a}' opacity='${i % 2 ? ".75" : ".95"}'/>`).join("");
      return baseBody(t, c, clipPattern("clip-rugby", stripes) + `
        <path d='M102 143Q128 160 154 143L159 153Q128 171 97 153Z' fill='#f2efe7' stroke='${ink}' stroke-width='2.3'/>
        <path d='M113 145L128 166L143 145' fill='none' stroke='${shadeColor(c, 0.55)}' stroke-width='2.2'/>
      `);
    }
    if (item.type === "flannel") {
      const plaid = Array.from({ length: 6 }, (_, i) => `<path d='M${76 + i * 20} 145V256M45 ${161 + i * 18}H211'/>`).join("");
      return baseBody(t, "#f3eee6", `
        <path d='M64 151C88 154 104 163 118 178L113 256H64Z' fill='${c}' stroke='${ink}' stroke-width='2.8' stroke-linejoin='round'/>
        <path d='M192 151C168 154 152 163 138 178L143 256H192Z' fill='${c}' stroke='${ink}' stroke-width='2.8' stroke-linejoin='round'/>
        <g stroke='${shadeColor(c, 0.62)}' stroke-width='1.5' opacity='.75'>${plaid}</g>
        <g stroke='${a}' stroke-width='1.1' opacity='.6'><path d='M84 145V256M172 145V256M45 181H211M45 217H211'/></g>
        <path d='M105 144L128 178L151 144' fill='none' stroke='${ink}' stroke-width='2.5'/>
      `);
    }
    if (item.type === "denim") {
      return baseBody(t, c, `
        <path d='M101 144L128 158L120 208L94 169Z' fill='${hi}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M155 144L128 158L136 208L162 169Z' fill='${hi}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M92 194H118V219H92ZM138 194H164V219H138Z' fill='${lo}' stroke='${ink}' stroke-width='2'/>
        <path d='M99 202H111M145 202H157M128 158V256' stroke='${a}' stroke-width='1.8' stroke-linecap='round' opacity='.85'/>
        ${buttonPlacket(128, 176, 5, 15, a)}
      `);
    }
    if (item.type === "varsity") {
      return baseBody(t, a, `
        <path d='M80 157C99 166 109 183 113 256H72C65 211 64 179 80 157Z' fill='${c}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M176 157C157 166 147 183 143 256H184C191 211 192 179 176 157Z' fill='${c}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M99 145Q128 162 157 145L161 155Q128 174 95 155Z' fill='${c}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M103 149Q128 162 153 149M95 239H161' fill='none' stroke='${a}' stroke-width='2.1' stroke-linecap='round'/>
        <text x='104' y='205' font-size='22' font-weight='900' fill='${c}' stroke='${ink}' stroke-width='0.8'>W</text>
      `);
    }
    if (item.type === "bomber") {
      return baseBody(t, c, `
        <path d='M93 143Q128 159 163 143L163 157Q128 174 93 157Z' fill='${lo}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M85 240H171V256H85Z' fill='${lo}' stroke='${ink}' stroke-width='2.3'/>
        <path d='M128 157V256' stroke='${ink}' stroke-width='2.8'/>
        <path d='M99 184C108 207 112 230 111 256M157 184C148 207 144 230 145 256' fill='none' stroke='${shadeColor(c, 0.57)}' stroke-width='2'/>
        <g stroke='${a}' stroke-width='1.4' opacity='.8'><path d='M95 149H161M88 247H168'/></g>
      `);
    }
    if (item.type === "cardigan") {
      return baseBody(t, a, `
        <path d='M74 151C99 159 116 180 122 256H76Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M182 151C157 159 140 180 134 256H180Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M104 145L128 190L152 145' fill='none' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
        <path d='M104 145L128 190L152 145' fill='none' stroke='${shadeColor(c, 0.65)}' stroke-width='2' stroke-linejoin='round'/>
        ${buttonPlacket(132, 185, 5, 14, "#f6d7a5")}
        <path d='M93 202H113M143 202H163' stroke='${shadeColor(c, 0.68)}' stroke-width='1.7' stroke-linecap='round'/>
      `);
    }
    if (item.type === "sweaterVest") {
      const diamonds = Array.from({ length: 4 }, (_, i) => {
        const x = 98 + i * 20;
        return `<path d='M${x} 190l10 -12l10 12l-10 12Z' fill='${i % 2 ? a : shadeColor(c, 1.25)}' stroke='${shadeColor(c, 0.58)}' stroke-width='1'/>`;
      }).join("");
      return baseBody(t, "#f4efe5", `
        <path d='M96 146L128 194L160 146C153 187 162 219 169 256H87C94 219 103 187 96 146Z' fill='${c}' stroke='${ink}' stroke-width='2.7' stroke-linejoin='round'/>
        <path d='M101 145L128 186L155 145' fill='none' stroke='${a}' stroke-width='3.2' stroke-linejoin='round'/>
        ${diamonds}
      `);
    }
    if (item.type === "labCoat") {
      return baseBody(t, a, `
        <path d='M69 151C93 156 111 174 121 256H69Z' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M187 151C163 156 145 174 135 256H187Z' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M101 143L128 158L119 203L94 168Z' fill='${c}' stroke='${ink}' stroke-width='2.3'/>
        <path d='M155 143L128 158L137 203L162 168Z' fill='${c}' stroke='${ink}' stroke-width='2.3'/>
        <rect x='145' y='189' width='24' height='13' rx='2' fill='${a}' stroke='${ink}' stroke-width='1.5'/>
        <path d='M128 158V256' stroke='${shadeColor(c, 0.8)}' stroke-width='2'/>
      `);
    }
    if (item.type === "scrubs") {
      return baseBody(t, c, `
        <path d='M99 144L128 183L157 144' fill='none' stroke='${shadeColor(c, 0.62)}' stroke-width='5' stroke-linejoin='round'/>
        <path d='M102 145L128 177L154 145' fill='none' stroke='${ink}' stroke-width='2.2' stroke-linejoin='round'/>
        <path d='M143 193H164V221H143Z' fill='${lo}' stroke='${ink}' stroke-width='1.8'/>
        <path d='M149 198V218' stroke='${a}' stroke-width='1.7' stroke-linecap='round'/>
      `);
    }
    if (item.type === "chefCoat") {
      return baseBody(t, c, `
        <path d='M103 144Q128 161 153 144L153 160Q128 176 103 160Z' fill='${c}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M94 149C116 168 128 198 128 256M162 149C140 168 128 198 128 256' fill='none' stroke='${shadeColor(c, 0.72)}' stroke-width='2'/>
        ${buttonPlacket(115, 177, 4, 16, a)}
        ${buttonPlacket(141, 177, 4, 16, a)}
      `);
    }
    if (item.type === "apron") {
      return baseBody(t, c, `
        <path d='M104 150C112 159 121 163 128 163C135 163 144 159 152 150' fill='none' stroke='${a}' stroke-width='6' stroke-linecap='round'/>
        <path d='M101 161L155 161L166 256H90Z' fill='${a}' stroke='${ink}' stroke-width='2.7' stroke-linejoin='round'/>
        <path d='M91 197C112 207 144 207 165 197' fill='none' stroke='${shadeColor(a, 0.7)}' stroke-width='2'/>
        <path d='M108 225H148' stroke='${shadeColor(a, 0.72)}' stroke-width='1.8' stroke-linecap='round'/>
      `);
    }
    if (item.type === "securityVest") {
      return baseBody(t, c, `
        <path d='M86 151C105 164 117 188 121 256H84Z' fill='${a}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M170 151C151 164 139 188 135 256H172Z' fill='${a}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M96 178L116 256M160 178L140 256' stroke='#f8fbf3' stroke-width='5' opacity='.85'/>
        <path d='M86 219H170' stroke='#f8fbf3' stroke-width='6' opacity='.82'/>
      `);
    }
    if (item.type === "tracksuit") {
      return baseBody(t, c, `
        <path d='M99 143Q128 158 157 143L158 159Q128 178 98 159Z' fill='${lo}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M128 155V256' stroke='${ink}' stroke-width='2.7'/>
        <path d='M77 157C91 168 105 182 115 205M179 157C165 168 151 182 141 205' fill='none' stroke='${a}' stroke-width='5' stroke-linecap='round'/>
        <path d='M82 168C94 179 104 193 111 214M174 168C162 179 152 193 145 214' fill='none' stroke='${shadeColor(a, 0.75)}' stroke-width='2' stroke-linecap='round'/>
      `);
    }
    if (item.type === "raincoat") {
      return baseBody(t, c, `
        <path d='M94 161C92 130 106 110 128 110C150 110 164 130 162 161C151 151 139 146 128 146C117 146 105 151 94 161Z' fill='${c}' stroke='${ink}' stroke-width='2.8'/>
        <path d='M101 145Q128 166 155 145' fill='none' stroke='${shadeColor(c, 0.68)}' stroke-width='4' stroke-linecap='round'/>
        <path d='M128 166V256' stroke='${ink}' stroke-width='2.5'/>
        ${buttonPlacket(128, 181, 5, 14, a)}
        <path d='M97 199H116M140 199H159' stroke='${shadeColor(c, 0.65)}' stroke-width='1.8' stroke-linecap='round'/>
      `);
    }
    if (item.type === "pinafore") {
      return baseBody(t, a, `
        <path d='M100 145C111 160 117 185 117 256H139C139 185 145 160 156 145' fill='none' stroke='${c}' stroke-width='10' stroke-linecap='round'/>
        <path d='M90 179Q128 190 166 179L176 256H80Z' fill='${c}' stroke='${ink}' stroke-width='2.8' stroke-linejoin='round'/>
        <path d='M105 195H151' stroke='${shadeColor(c, 0.65)}' stroke-width='1.8'/>
        <circle cx='113' cy='181' r='2.5' fill='${a}' stroke='${ink}' stroke-width='1'/>
        <circle cx='143' cy='181' r='2.5' fill='${a}' stroke='${ink}' stroke-width='1'/>
      `);
    }
    if (item.type === "sariDrape") {
      return baseBody(t, c, `
        <path d='M71 151C109 172 139 202 172 256H116C100 225 83 193 61 165Z' fill='${a}' stroke='${ink}' stroke-width='2.7' stroke-linejoin='round'/>
        <path d='M83 171C112 190 139 221 158 256' fill='none' stroke='${shadeColor(a, 0.7)}' stroke-width='2.2' opacity='.8'/>
        <path d='M100 145L128 168L156 145' fill='none' stroke='${shadeColor(c, 0.68)}' stroke-width='2.5'/>
        <g fill='${shadeColor(a, 1.16)}' opacity='.75'><circle cx='98' cy='181' r='2'/><circle cx='119' cy='202' r='2'/><circle cx='140' cy='225' r='2'/></g>
      `);
    }
    if (item.type === "kurta") {
      return baseBody(t, c, `
        <path d='M104 144Q128 154 152 144L152 157Q128 167 104 157Z' fill='${hi}' stroke='${ink}' stroke-width='2.3'/>
        <path d='M128 157V237' stroke='${a}' stroke-width='3' stroke-linecap='round'/>
        ${buttonPlacket(128, 171, 4, 14, "#f1df9c")}
        <path d='M101 194H115M141 194H155' stroke='${a}' stroke-width='1.8' stroke-linecap='round' opacity='.8'/>
      `);
    }
    if (item.type === "sequin") {
      const stars = Array.from({ length: 22 }, (_, i) => {
        const x = 83 + (i * 29) % 91;
        const y = 169 + (i * 37) % 78;
        return `<path d='M${x} ${y - 3}L${x + 2} ${y}L${x + 5} ${y}L${x + 2.4} ${y + 2}L${x + 3.5} ${y + 5}L${x} ${y + 3}L${x - 3.5} ${y + 5}L${x - 2.4} ${y + 2}L${x - 5} ${y}L${x - 2} ${y}Z' fill='${a}' opacity='.8'/>`;
      }).join("");
      return baseBody(t, c, `
        <path d='M98 145C115 158 136 158 158 145' fill='none' stroke='${a}' stroke-width='3.2' stroke-linecap='round'/>
        ${clipPattern("clip-sequin", stars)}
      `);
    }
    if (item.type === "leather") {
      return baseBody(t, c, `
        <path d='M101 144L128 156L111 204L91 168Z' fill='${hi}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M155 144L128 156L145 204L165 168Z' fill='${lo}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M106 155L150 236' stroke='${a}' stroke-width='2.6' stroke-linecap='round'/>
        <path d='M96 195H116M141 195H162' stroke='${a}' stroke-width='1.8' stroke-linecap='round'/>
        <circle cx='155' cy='171' r='2.4' fill='${a}' stroke='${ink}' stroke-width='1'/>
      `);
    }
    return baseBody(t, c, crewCollar(c));
  }

  function renderLayer(item, t, c) {
    const a = item.accent || shadeColor(c, 1.2);
    const lo = shadeColor(c, 0.76);
    const hi = shadeColor(c, 1.12);
    const sleeveL = `M70 155C91 163 106 188 113 256H72C64 214 61 176 70 155Z`;
    const sleeveR = `M186 155C165 163 150 188 143 256H184C192 214 195 176 186 155Z`;
    const openLeft = `M75 153C94 158 110 174 119 256H74Z`;
    const openRight = `M181 153C162 158 146 174 137 256H182Z`;
    const centreZip = `<path d='M128 158V256' stroke='${ink}' stroke-width='2.5' stroke-linecap='round'/>`;

    if (item.type === "overalls") {
      return `
        <path d='M104 157C91 147 79 145 68 151M152 157C165 147 177 145 188 151' fill='none' stroke='${c}' stroke-width='11' stroke-linecap='round'/>
        <path d='M104 157C91 147 79 145 68 151M152 157C165 147 177 145 188 151' fill='none' stroke='${ink}' stroke-width='2' stroke-linecap='round' opacity='.62'/>
        <path d='M104 156Q128 166 152 156L152 222L104 222Z' fill='${c}' stroke='${ink}' stroke-width='2.6' stroke-linejoin='round'/>
        <circle cx='113' cy='171' r='2.5' fill='${a}' stroke='${ink}' stroke-width='1.2'/>
        <circle cx='143' cy='171' r='2.5' fill='${a}' stroke='${ink}' stroke-width='1.2'/>
        <path d='M112 197H144' stroke='${shadeColor(c, 0.65)}' stroke-width='2' stroke-linecap='round'/>
      `;
    }
    if (item.type === "flannel") {
      const plaid = `
        <g stroke='${shadeColor(c, 0.58)}' stroke-width='1.5' opacity='.8'>
          <path d='M82 153V256M101 153V256M155 153V256M174 153V256M63 178H193M63 206H193M63 234H193'/>
        </g>
        <g stroke='${a}' stroke-width='1.1' opacity='.65'>
          <path d='M91 153V256M165 153V256M63 191H193M63 222H193'/>
        </g>`;
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='${openLeft}' fill='${c}' stroke='${ink}' stroke-width='2.6' stroke-linejoin='round'/>
        <path d='${openRight}' fill='${c}' stroke='${ink}' stroke-width='2.6' stroke-linejoin='round'/>
        ${plaid}
        <path d='M99 144L128 169L157 144' fill='none' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M105 149L128 168L151 149' fill='none' stroke='${hi}' stroke-width='1.7' stroke-linejoin='round'/>
      `;
    }
    if (item.type === "denim") {
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${openLeft}' fill='${hi}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='${openRight}' fill='${hi}' stroke='${ink}' stroke-width='2.5' stroke-linejoin='round'/>
        <path d='M92 194H118V219H92ZM138 194H164V219H138Z' fill='${lo}' stroke='${ink}' stroke-width='2'/>
        <path d='M99 202H111M145 202H157M128 158V256' stroke='${a}' stroke-width='1.8' stroke-linecap='round' opacity='.85'/>
        ${buttonPlacket(128, 176, 5, 15, a)}
      `;
    }
    if (item.type === "varsity") {
      return `
        <path d='${sleeveL}' fill='${a}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${a}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M88 151C109 158 121 176 124 256H88Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M168 151C147 158 135 176 132 256H168Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M97 144Q128 162 159 144L163 155Q128 174 93 155Z' fill='${c}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M99 150Q128 163 157 150M89 239H167' fill='none' stroke='${a}' stroke-width='2.2' stroke-linecap='round'/>
        ${centreZip}
        <text x='101' y='204' font-size='20' font-weight='900' fill='${a}' stroke='${ink}' stroke-width='0.7'>W</text>
      `;
    }
    if (item.type === "bomber") {
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M82 153C104 159 118 178 122 256H82Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M174 153C152 159 138 178 134 256H174Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M93 143Q128 159 163 143L163 157Q128 174 93 157Z' fill='${lo}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M83 240H173V256H83Z' fill='${lo}' stroke='${ink}' stroke-width='2.3'/>
        ${centreZip}
        <g stroke='${a}' stroke-width='1.4' opacity='.8'><path d='M95 149H161M88 247H168'/></g>
      `;
    }
    if (item.type === "cardigan") {
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${openLeft}' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='${openRight}' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M104 145L128 190L152 145' fill='none' stroke='${ink}' stroke-width='4' stroke-linejoin='round'/>
        <path d='M104 145L128 190L152 145' fill='none' stroke='${shadeColor(c, 0.65)}' stroke-width='2' stroke-linejoin='round'/>
        ${buttonPlacket(132, 185, 5, 14, "#f6d7a5")}
        <path d='M93 202H113M143 202H163' stroke='${shadeColor(c, 0.68)}' stroke-width='1.7' stroke-linecap='round'/>
      `;
    }
    if (item.type === "sweaterVest") {
      const diamonds = Array.from({ length: 4 }, (_, i) => {
        const x = 98 + i * 20;
        return `<path d='M${x} 190l10 -12l10 12l-10 12Z' fill='${i % 2 ? a : shadeColor(c, 1.25)}' stroke='${shadeColor(c, 0.58)}' stroke-width='1'/>`;
      }).join("");
      return `
        <path d='M96 146L128 194L160 146C153 187 162 219 169 256H87C94 219 103 187 96 146Z' fill='${c}' stroke='${ink}' stroke-width='2.7' stroke-linejoin='round'/>
        <path d='M101 145L128 186L155 145' fill='none' stroke='${a}' stroke-width='3.2' stroke-linejoin='round'/>
        ${diamonds}
      `;
    }
    if (item.type === "labCoat") {
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M70 151C94 156 112 174 121 256H70Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M186 151C162 156 144 174 135 256H186Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M101 143L128 158L119 203L94 168Z' fill='${c}' stroke='${ink}' stroke-width='2.3'/>
        <path d='M155 143L128 158L137 203L162 168Z' fill='${c}' stroke='${ink}' stroke-width='2.3'/>
        <rect x='145' y='189' width='24' height='13' rx='2' fill='${a}' stroke='${ink}' stroke-width='1.5'/>
        <path d='M128 158V256' stroke='${shadeColor(c, 0.8)}' stroke-width='2'/>
      `;
    }
    if (item.type === "apron") {
      return `
        <path d='M104 150C112 159 121 163 128 163C135 163 144 159 152 150' fill='none' stroke='${c}' stroke-width='6' stroke-linecap='round'/>
        <path d='M101 161L155 161L166 256H90Z' fill='${c}' stroke='${ink}' stroke-width='2.7' stroke-linejoin='round'/>
        <path d='M91 197C112 207 144 207 165 197' fill='none' stroke='${shadeColor(c, 0.7)}' stroke-width='2'/>
        <path d='M108 225H148' stroke='${shadeColor(c, 0.72)}' stroke-width='1.8' stroke-linecap='round'/>
        <rect x='111' y='180' width='34' height='12' rx='2' fill='${a}' stroke='${ink}' stroke-width='1.4'/>
      `;
    }
    if (item.type === "securityVest") {
      return `
        <path d='M86 151C105 164 117 188 121 256H84Z' fill='${a}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M170 151C151 164 139 188 135 256H172Z' fill='${a}' stroke='${ink}' stroke-width='2.4'/>
        <path d='M96 178L116 256M160 178L140 256' stroke='#f8fbf3' stroke-width='5' opacity='.85'/>
        <path d='M86 219H170' stroke='#f8fbf3' stroke-width='6' opacity='.82'/>
      `;
    }
    if (item.type === "raincoat") {
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M84 153C106 160 121 180 124 256H84Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M172 153C150 160 135 180 132 256H172Z' fill='${c}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M94 161C92 130 106 110 128 110C150 110 164 130 162 161C151 151 139 146 128 146C117 146 105 151 94 161Z' fill='${c}' stroke='${ink}' stroke-width='2.8'/>
        <path d='M101 145Q128 166 155 145' fill='none' stroke='${shadeColor(c, 0.68)}' stroke-width='4' stroke-linecap='round'/>
        ${centreZip}
        ${buttonPlacket(128, 181, 5, 14, a)}
      `;
    }
    if (item.type === "pinafore") {
      return `
        <path d='M100 145C111 160 117 185 117 256H139C139 185 145 160 156 145' fill='none' stroke='${c}' stroke-width='10' stroke-linecap='round'/>
        <path d='M90 179Q128 190 166 179L176 256H80Z' fill='${c}' stroke='${ink}' stroke-width='2.8' stroke-linejoin='round'/>
        <path d='M105 195H151' stroke='${shadeColor(c, 0.65)}' stroke-width='1.8'/>
        <circle cx='113' cy='181' r='2.5' fill='${a}' stroke='${ink}' stroke-width='1'/>
        <circle cx='143' cy='181' r='2.5' fill='${a}' stroke='${ink}' stroke-width='1'/>
      `;
    }
    if (item.type === "leather") {
      return `
        <path d='${sleeveL}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='${sleeveR}' fill='${c}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M82 153C104 159 119 178 122 256H82Z' fill='${hi}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M174 153C152 159 137 178 134 256H174Z' fill='${lo}' stroke='${ink}' stroke-width='2.6'/>
        <path d='M101 144L128 156L111 204L91 168Z' fill='${hi}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M155 144L128 156L145 204L165 168Z' fill='${lo}' stroke='${ink}' stroke-width='2.5'/>
        <path d='M106 155L150 236' stroke='${a}' stroke-width='2.6' stroke-linecap='round'/>
        <path d='M96 195H116M141 195H162' stroke='${a}' stroke-width='1.8' stroke-linecap='round'/>
      `;
    }
    return "";
  }

  function renderOutfitSvg(item, opts = {}) {
    const c = opts.color || itemColor(item);
    const width = opts.large ? 360 : 256;
    const base = baseForLayer(item);
    const baseColor = base.color;
    const body = item.kind === "layer"
      ? renderBaseGarment(base, state.body, baseColor) + renderLayer(item, state.body, c)
      : renderBaseGarment(item, state.body, c);
    const label = escapeHtml(item.name);
    return `
      <svg viewBox='0 0 256 256' role='img' aria-label='${label} clothing preview' xmlns='http://www.w3.org/2000/svg'>
        <rect width='256' height='256' rx='16' fill='#dfe9ec'/>
        <circle cx='46' cy='45' r='18' fill='rgba(232,111,79,.12)'/>
        <circle cx='211' cy='52' r='13' fill='rgba(36,116,106,.13)'/>
        ${body}
        ${mannequin(state.body)}
        <path d='M0 255H256' stroke='rgba(31,35,48,.2)'/>
      </svg>
    `.replace("<svg", `<svg width='${width}' height='${width}'`);
  }

  function renderBaseGarment(item, t, c) {
    return item.status === "current" ? renderCurrent(item, t, c) : renderNew(item, t, c);
  }

  function filteredCatalog() {
    if (state.view === "new") return catalog.filter((item) => item.status === "new");
    if (state.view === "current") return catalog.filter((item) => item.status === "current");
    if (state.view === "layers") return catalog.filter((item) => item.kind === "layer");
    if (state.view === "unreviewed") return catalog.filter((item) => !reviewFor(item.id));
    if (state.view === "yay") return catalog.filter((item) => reviewFor(item.id) === "yay");
    if (state.view === "nay") return catalog.filter((item) => reviewFor(item.id) === "nay");
    return catalog;
  }

  function renderPreview() {
    const item = currentItem();
    const base = baseForLayer(item);
    const vote = reviewFor(item.id);
    els.previewArt.innerHTML = renderOutfitSvg(item, { large: true, color: state.colour });
    els.previewStatus.textContent = item.status === "new" ? "New concept" : "Current option";
    els.previewStatus.classList.toggle("current", item.status === "current");
    els.previewName.textContent = item.name;
    els.previewNotes.textContent = item.notes;
    els.previewTags.innerHTML = item.tags.map((tag) => `<span class='tag'>${escapeHtml(tag)}</span>`).join("");
    els.yayButton.classList.toggle("is-active", vote === "yay");
    els.nayButton.classList.toggle("is-active", vote === "nay");
    els.clearVoteButton.disabled = !vote;
    els.specOutput.value = JSON.stringify({
      id: item.id,
      name: item.name,
      status: item.status,
      review: vote || "unreviewed",
      layerable: item.kind === "layer",
      underLayer: item.kind === "layer" ? base.id : null,
      renderType: item.type,
      baseColor: state.colour,
      accent: item.accent || null,
      tags: item.tags,
      integrationNote: item.notes
    }, null, 2);
    els.colourInput.value = state.colour;
    renderSwatches();
  }

  function renderGrid() {
    const items = filteredCatalog();
    if (!items.includes(currentItem()) && items.length) {
      state.selectedId = items[0].id;
      state.colour = items[0].color;
    }
    els.outfitGrid.innerHTML = items.map((item) => `
      <article class='outfit-card ${item.id === state.selectedId ? "is-selected" : ""}' data-id='${item.id}' data-review='${reviewFor(item.id)}'>
        <button class='card-main' type='button' data-select='${item.id}'>
          ${renderOutfitSvg(item)}
          <span class='card-meta'>
            <strong>${escapeHtml(item.name)}</strong>
            <span>${item.status === "new" ? "New concept" : "Current"}${item.kind === "layer" ? " / Layer" : ""}</span>
            <em>${escapeHtml(item.tags.slice(0, 2).join(" / "))}</em>
          </span>
        </button>
        <div class='card-votes' aria-label='Review ${escapeHtml(item.name)}'>
          <button class='vote-button' type='button' data-vote='yay' data-id='${item.id}'>Yay</button>
          <button class='vote-button' type='button' data-vote='nay' data-id='${item.id}'>Nay</button>
        </div>
        <span class='review-mark'>${reviewFor(item.id) || "Unreviewed"}</span>
      </article>
    `).join("");
    els.catalogTitle.textContent = `${items.length} outfit${items.length === 1 ? "" : "s"}`;
    renderStats();
  }

  function renderStats() {
    const newCount = catalog.filter((item) => item.status === "new").length;
    const currentCount = catalog.filter((item) => item.status === "current").length;
    const layers = catalog.filter((item) => item.kind === "layer").length;
    const yay = catalog.filter((item) => reviewFor(item.id) === "yay").length;
    const nay = catalog.filter((item) => reviewFor(item.id) === "nay").length;
    const pending = catalog.length - yay - nay;
    els.catalogStats.innerHTML = [
      ["Current", currentCount],
      ["New", newCount],
      ["Layers", layers],
      ["Yay", yay],
      ["Nay", nay],
      ["Pending", pending]
    ].map(([label, value]) => `<span class='stat'><strong>${value}</strong><span>${label}</span></span>`).join("");
  }

  function renderSwatches() {
    els.swatches.innerHTML = colourSwatches.map((colour) => `
      <button class='swatch ${colour.toLowerCase() === state.colour.toLowerCase() ? "is-active" : ""}' type='button' data-colour='${colour}' style='background:${colour}' aria-label='Use ${colour}'></button>
    `).join("");
  }

  function syncRanges() {
    els.buildRange.value = state.body.build;
    els.slopeRange.value = state.body.shoulderSlope;
    els.bodyWidthRange.value = state.body.bodyWidth;
    els.bellyRange.value = state.body.belly;
  }

  function setupControls() {
    els.underLayer.innerHTML = baseOutfits.map((item) => `<option value='${item.id}'>${item.name}</option>`).join("");
    els.underLayer.value = state.underLayer;
    els.bodyPreset.innerHTML = Object.entries(bodyPresets).map(([id, preset]) => `<option value='${id}'>${preset.label}</option>`).join("");
    els.bodyPreset.value = "average";
    els.skinPreset.innerHTML = Object.entries(skinPresets).map(([id, preset]) => `<option value='${id}'>${preset.label}</option>`).join("");
    els.skinPreset.value = "fair";
    syncRanges();

    els.viewFilter.addEventListener("change", () => {
      state.view = els.viewFilter.value;
      render();
    });
    els.underLayer.addEventListener("change", () => {
      state.underLayer = els.underLayer.value;
      render();
    });
    els.bodyPreset.addEventListener("change", () => {
      state.body = { ...bodyPresets[els.bodyPreset.value] };
      syncRanges();
      render();
    });
    els.skinPreset.addEventListener("change", () => {
      state.skin = skinPresets[els.skinPreset.value].value;
      render();
    });
    els.colourInput.addEventListener("input", () => {
      state.colour = els.colourInput.value;
      render();
    });
    els.swatches.addEventListener("click", (event) => {
      const button = event.target.closest("[data-colour]");
      if (!button) return;
      state.colour = button.dataset.colour;
      render();
    });
    els.outfitGrid.addEventListener("click", (event) => {
      const voteButton = event.target.closest("[data-vote]");
      if (voteButton) {
        setReview(voteButton.dataset.id, voteButton.dataset.vote);
        return;
      }
      const selectButton = event.target.closest("[data-select]");
      if (!selectButton) return;
      const item = catalog.find((entry) => entry.id === selectButton.dataset.select);
      if (!item) return;
      state.selectedId = item.id;
      state.colour = item.color;
      if (item.kind === "layer" && item.defaultBase) {
        state.underLayer = item.defaultBase;
        els.underLayer.value = state.underLayer;
      }
      render();
    });
    els.yayButton.addEventListener("click", () => setReview(state.selectedId, "yay"));
    els.nayButton.addEventListener("click", () => setReview(state.selectedId, "nay"));
    els.clearVoteButton.addEventListener("click", () => setReview(state.selectedId, ""));
    [
      ["buildRange", "build"],
      ["slopeRange", "shoulderSlope"],
      ["bodyWidthRange", "bodyWidth"],
      ["bellyRange", "belly"]
    ].forEach(([elKey, stateKey]) => {
      els[elKey].addEventListener("input", () => {
        state.body[stateKey] = Number(els[elKey].value);
        render();
      });
    });
  }

  function render() {
    renderGrid();
    renderPreview();
  }

  setupControls();
  render();
  window.clothingLab = { catalog, renderOutfitSvg, bodyPresets, skinPresets };
})();
