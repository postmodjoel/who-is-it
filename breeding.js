// Breeding, identity reels, persistent gaybies, and aborted-baby purgatory.

// ===================== Breeding (drag one card onto another to make a baby) =====================
function mixHex(a, b, t = 0.5) {
  const pa = parseInt(String(a).replace("#", ""), 16), pb = parseInt(String(b).replace("#", ""), 16);
  const ch = (s) => { const va = (pa >> s) & 255, vb = (pb >> s) & 255; return Math.round(va + (vb - va) * t).toString(16).padStart(2, "0"); };
  return `#${ch(16)}${ch(8)}${ch(0)}`;
}
// Cross two parents' traits: numbers average (a real blend), hex colours mix, categorical picks a
// parent at random. Skin becomes an interpolated tone so babies come out genuinely mixed.
function mergeTraits(A, B) {
  const child = {};
  new Set([...Object.keys(A), ...Object.keys(B)]).forEach((k) => {
    const av = A[k], bv = B[k];
    if (av === undefined) { child[k] = bv; return; }
    if (bv === undefined) { child[k] = av; return; }
    if (typeof av === "number" && typeof bv === "number") { child[k] = (av + bv) / 2; return; }
    if (typeof av === "string" && typeof bv === "string" && av[0] === "#" && bv[0] === "#") { child[k] = mixHex(av, bv); return; }
    child[k] = Math.random() < 0.5 ? av : bv;
  });
  const tb = window.faceGenerator?.traitBook?.skinToneHex || {};
  const aHex = A.skinHex || tb[A.skin], bHex = B.skinHex || tb[B.skin];
  if (aHex && bHex) {
    // Average the parents' skin, then a small jitter (so identical-skin parents still vary slightly).
    child.skinHex = jitterHex(mixHex(aHex, bHex), 0.045);
    delete child.skin;   // let the mixed hex render instead of an inherited palette name
  }
  return child;
}
function babyName(a, b) {
  const head = a.slice(0, Math.ceil(a.length / 2));
  const tail = b.slice(Math.floor(b.length / 2));
  const n = (head + tail) || a;
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
}
// Random mutations so every baby is visibly its own person (different eyes/ears/nose/etc), not just an
// average of the parents.
// Small random brightness/hue jitter on a hex - for genetic 'minor variance' on inherited colours.
function jitterHex(hex, amt) {
  const n = parseInt(String(hex).replace("#", ""), 16);
  if (isNaN(n)) return hex;
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const d = () => Math.round((Math.random() - 0.5) * 2 * amt * 255);
  const bright = d();
  const cl = (v, e) => Math.max(0, Math.min(255, Math.round(v + bright + e)));
  r = cl(r, d() * 0.4); g = cl(g, d() * 0.4); b = cl(b, d() * 0.4);
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
function mutateBaby(traits) {
  const T = window.faceGenerator?.traitBook || {};
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const hairColors = window.faceGenerator?.traitBook?.hairColors || {};
  const eyeCols = ["#5a3d28", "#3a5a8a", "#2e6b4e", "#7a5a2a", "#4a4a55", "#6a3a3a", "#8a6a2a", "#4a8a8a"];
  // Eyes: usually a SHIFT of the inherited/averaged colour (minor variance); rarely a fresh colour.
  const baseEye = (typeof traits.eyeColor === "string" && traits.eyeColor[0] === "#") ? traits.eyeColor : "#5a3d28";
  if (Math.random() < 0.8) traits.eyeColor = jitterHex(baseEye, 0.06);
  else traits.eyeColor = rnd(eyeCols);
  if (Math.random() < 0.6) traits.eyeScale = +(((traits.eyeScale || 1) * (0.9 + Math.random() * 0.2))).toFixed(2);   // ±10%
  if (Math.random() < 0.5 && T.earVariants) traits.earVariant = rnd(T.earVariants);
  if (Math.random() < 0.5) traits.earScale = +((0.88 + Math.random() * 0.3)).toFixed(2);
  if (Math.random() < 0.5) traits.browThick = +(((traits.browThick || 1) * (0.85 + Math.random() * 0.3))).toFixed(2);
  if (Math.random() < 0.5) traits.noseWidth = +(((traits.noseWidth || 1) * (0.88 + Math.random() * 0.24))).toFixed(2);
  // Hair: SHADE-SHIFT the inherited colour a touch (via hairHex) instead of jumping to a random name.
  const baseHairHex = hairColors[traits.hairColor] || "#3a2418";
  if (Math.random() < 0.75) traits.hairHex = jitterHex(baseHairHex, 0.07);
  else if (T.hairColors) traits.hairColor = rnd(T.hairColors);
  if (Math.random() < 0.3 && T.noseTips) traits.noseTip = rnd(T.noseTips);
  return traits;
}
let babyCounter = 0;
// A gayby that inherits hairLocks gets EVERY part mirrored + a tiny per-part jitter (scale +/-5%,
// x/y +/-2%) so siblings don't look identical - just enough variety without breaking the style.
function jitterGaybyHair(traits) {
  const flip = (lk) => ({
    ...lk,
    mirror: !lk.mirror,
    scale: +((Number(lk.scale) || 1) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(3),
    x: +((Number(lk.x) || 50) + (Math.random() - 0.5) * 4).toFixed(2),
    y: +((Number(lk.y) || 50) + (Math.random() - 0.5) * 4).toFixed(2)
  });
  // A materialized composition is the authoritative stack: jitter ITS layers (base layers just
  // mirror) and keep the legacy hairLocks view in sync with the non-base layers.
  const comp = traits.hairComposition;
  if (comp && comp.version === 1 && Array.isArray(comp.layers) && comp.layers.length) {
    const layers = comp.layers.map((layer) => {
      if (!layer) return layer;
      if (layer.origin === "base") return { ...layer, mirror: !layer.mirror };
      const flipped = flip(layer);
      if (Number.isFinite(Number(layer.scaleX))) {
        const jitter = 1 + (Math.random() - 0.5) * 0.1;
        flipped.scaleX = +(Number(layer.scaleX) * jitter).toFixed(3);
        flipped.scaleY = +((Number(layer.scaleY) || Number(layer.scaleX)) * jitter).toFixed(3);
      }
      return flipped;
    });
    traits.hairComposition = { ...comp, layers };
    traits.hairLocks = layers.filter((layer) => layer && layer.origin !== "base");
    return traits;
  }
  if (!Array.isArray(traits.hairLocks) || !traits.hairLocks.length) return traits;
  traits.hairLocks = traits.hairLocks.map(flip);
  return traits;
}
function makeBaby(A, B, gayby) {
  if (typeof bumpStat === "function") bumpStat(gayby ? "gaybys" : "babies");
  let traits = mutateBaby(mergeTraits(A.traits || {}, B.traits || {}));
  if (gayby) traits = jitterGaybyHair(traits);
  const seed = 90001 + (babyCounter++);
  return {
    // Globally-unique id: session-scoped counters collided with GAYBYs persisted from earlier
    // sessions (same baby-9000X id back in the pool -> duplicate board entries).
    id: `baby-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e6).toString(36)}`,
    name: babyName(A.name, B.name),
    // ~1 in 5 come out non-binary (they/them); the rest inherit a parent's pronouns.
    pronouns: Math.random() < 0.2 ? "they" : (Math.random() < 0.5 ? A.pronouns : B.pronouns),
    feature: gayby ? "a gayby" : "a brand-new baby",
    secret: A.secret,
    role: Math.random() < 0.5 ? A.role : B.role,
    image: window.faceGenerator.renderPortrait(seed, traits),
    tags: gayby ? ["GAYBY"] : [],
    variant: "",
    traits,
    seed,
    isBaby: true,
    isGayby: !!gayby,
    parents: [A.name, B.name]
  };
}
// A GAYBY comes from two men or two egg-producers; it gets a badge that PERSISTS across games via its
// own localStorage list (merged into the pool on load, like custom characters).
function sameSex(A, B) { return A.pronouns === B.pronouns && (A.pronouns === "he" || A.pronouns === "she"); }
const GAYBY_KEY = "whoisit_gaybies_v1";
function loadGaybies() { try { return JSON.parse(localStorage.getItem(GAYBY_KEY)) || []; } catch (e) { return []; } }
function mergeGaybiesIntoPool() {
  if (!window.faceGenerator) return;
  [generatedCharacters, allCharacters].forEach((a) => { for (let i = a.length - 1; i >= 0; i--) if (a[i].persistedGayby) a.splice(i, 1); });
  loadGaybies().forEach((d) => {
    const ch = { id: d.id, name: d.name, pronouns: d.pronouns, feature: "a gayby", secret: "keeps to themselves", role: "local witness", image: window.faceGenerator.renderPortrait(d.seed, d.traits), tags: ["GAYBY"], variant: "", traits: d.traits, seed: d.seed, isGayby: true, persistedGayby: true };
    generatedCharacters.push(ch); allCharacters.push(ch);
  });
}
function persistGayby(baby) {
  try { const l = loadGaybies(); l.push({ id: baby.id, name: baby.name, pronouns: baby.pronouns, traits: baby.traits, seed: baby.seed }); localStorage.setItem(GAYBY_KEY, JSON.stringify(l)); } catch (e) { /* storage off */ }
  mergeGaybiesIntoPool();
}
// --- Fertility "balance" helpers (the cum count is a display string like "770M" / "2.0B") ---
function parseCum(str) { const m = String(str).match(/([\d.]+)\s*([MB])/i); if (!m) return 0; return parseFloat(m[1]) * (m[2].toUpperCase() === "B" ? 1000 : 1); }
function formatCum(mils) { return mils >= 1000 ? `${(mils / 1000).toFixed(1)}B` : `${Math.max(0, Math.round(mils))}M`; }

// Breeding only happens in the modes where it makes sense.
const BREED_MODES = ["fertility", "orgy", "gay-frogged", "disease", "woke", "family-tree-disaster", "drugs", "hidden-agendas"];

// ===================== Identity reels (slot-machine pickers for new babies) =====================
// A row of slot-machine reels that spin through their values and land staggered left-to-right (same
// energy as the opening mode roulette). Used for woke babies (pronouns/gender/ethnicity) and disease
// babies (severity/disease). done(results) fires with the landed value of each reel.
const PRONOUN_REEL = ["he/him", "she/her", "they/them", "ze/zir", "xe/xem", "it/its", "any/all"];
const GENDER_REEL = ["Male", "Female", "Non-Binary", "Genderfluid", "Agender", "Two-Spirit", "Demiboy", "Demigirl", "Bigender", "Genderqueer"];
const ETHNICITY_REEL = ["White", "Black", "Asian", "Latino", "Indigenous", "Pacific Islander", "Middle Eastern", "Mixed", "Ambiguously Ethnic"];
const KINK_REEL = ["vanilla", "switch", "dom", "sub", "brat", "voyeur", "exhibitionist", "praise kink", "degradation", "bondage", "roleplay", "sensory play", "monogamish", "polycurious", "into feet", "cosplay only", "car enthusiast", "danger streak"];
function spinIdentityReels(title, reels, done) {
  const ov = document.createElement("div");
  ov.className = "reel-overlay";
  ov.innerHTML = `<div class="reel-box"><p class="reel-title">${escapeHtml(title)}</p><div class="reel-row">`
    + reels.map((r, i) => `<div class="reel" data-i="${i}"><span class="reel-label">${escapeHtml(r.label)}</span><span class="reel-value">…</span></div>`).join("")
    + `</div></div>`;
  document.body.appendChild(ov);
  const results = new Array(reels.length);
  let landedCount = 0;
  // A ticking spin sound while any reel is still turning.
  const lastLand = 1100 + (reels.length - 1) * 750;
  const stopTicks = window.Sound ? window.Sound.spinTicks(lastLand, 55, 130) : null;
  reels.forEach((r, i) => {
    const valEl = ov.querySelector(`.reel[data-i="${i}"] .reel-value`);
    const spin = setInterval(() => { valEl.textContent = r.values[Math.floor(Math.random() * r.values.length)]; }, 70);
    setTimeout(() => {
      clearInterval(spin);
      results[i] = r.values[Math.floor(Math.random() * r.values.length)];
      valEl.textContent = results[i];
      valEl.closest(".reel").classList.add("landed");
      sfx("pop");
      if (++landedCount === reels.length) { if (stopTicks) stopTicks(); setTimeout(() => { ov.remove(); done(results); }, 900); }
    }, 1100 + i * 750);
  });
}
// The gambling reels EVERY breeding mode now runs, once the baby exists and BEFORE keep/abort:
// pronouns, gender, a kink (+ ethnicity in WOKE). Skipped entirely in PG mode. Sets baby.identity.
function babyIdentityReels(baby, mode, cb) {
  if (state.settings.pg) { cb(); return; }
  const reels = [
    { label: "PRONOUNS", values: PRONOUN_REEL },
    { label: "GENDER", values: GENDER_REEL },
    { label: "KINK", values: KINK_REEL }
  ];
  if (mode === "woke") reels.push({ label: "ETHNICITY", values: ETHNICITY_REEL });
  spinIdentityReels("🎰 ASSIGNING THE BABY…", reels, (res) => {
    const [pro, gen, kink, eth] = res;
    baby.identity = { pronouns: pro, gender: gen, kink };
    baby.pronouns = pro.startsWith("he") ? "he" : pro.startsWith("she") ? "she" : "they";
    if (mode === "woke") baby.wokeIdentity = { pronouns: pro, gender: gen, ethnicity: eth };
    cb();
  });
}
// Combine two parents' disease sheets into a mutant derivative for a disease-mode baby.
function combineDiseaseAssignment(A, B) {
  const asg = state.global.mystery.assignments;
  const pa = asg[A.id] || {}, pb = asg[B.id] || {};
  const muts = ["Neo-", "Mutant ", "Super-", "Novel ", "Hyper-", "Ω-"];
  const bump = { MINOR: "MAJOR", MAJOR: "MEGA", MEGA: "MEGA" };
  const seen = new Set();
  const diseases = [...(pa.diseases || []), ...(pb.diseases || [])]
    .map((d, i) => ({ name: muts[i % muts.length] + d.name, tier: bump[d.tier] || d.tier }))
    .filter((d) => (seen.has(d.name) ? false : seen.add(d.name)))
    .slice(0, 4);
  return {
    diseases: diseases.length ? diseases : [{ name: "Novel Ailment", tier: "MAJOR" }],
    cancers: [...(pa.cancers || []), ...(pb.cancers || [])].slice(0, 2),
    meds: [...new Set([...(pa.meds || []), ...(pb.meds || [])])].slice(0, 3),
    pregnant: false,
    autism: Math.min(1, ((pa.autism || 0) + (pb.autism || 0)) / 2 + 0.1),
    pain: Math.min(pa.pain != null ? pa.pain : 2, pb.pain != null ? pb.pain : 2)
  };
}
// A political baby's platform: party inherited, everything else remixed from BOTH parents' stances -
// each inherited stance lands randomly in FOR or AGAINST (kids love inverting their parents >:)).
function mixAgendaAssignment(A, B) {
  const asg = state.global.mystery.assignments;
  const pa = asg[A.id] || {}, pb = asg[B.id] || {};
  const parentAll = new Set([...(pa.stances?.for || []), ...(pa.stances?.against || []), ...(pb.stances?.for || []), ...(pb.stances?.against || [])]);
  const pool = [...parentAll].sort(() => Math.random() - 0.5);
  const nFor = Math.min(pool.length, 2 + Math.floor(Math.random() * 2));
  const nAg = Math.min(Math.max(0, pool.length - nFor), 2 + Math.floor(Math.random() * 2));
  const forList = pool.slice(0, nFor);
  // The baby develops a conviction NEITHER parent held - the "new thinking" the game announces.
  const fresh = STANCE_POOL.filter((s) => !parentAll.has(s));
  const newThinking = fresh.length ? fresh[Math.floor(Math.random() * fresh.length)] : null;
  if (newThinking) forList.unshift(newThinking);
  return {
    party: pa.party || pb.party || "Democrat",
    state: Math.random() < 0.5 ? pa.state : pb.state,
    mood: Math.random() < 0.5 ? pa.mood : pb.mood,
    emoji: Math.random() < 0.5 ? pa.emoji : pb.emoji,
    stances: { for: forList, against: pool.slice(nFor, nFor + nAg) },
    newThinking
  };
}
// The dramatic "NEW THINKING UNLOCKED: FOR ___" banner when a hidden-agendas baby invents a conviction.
function showNewThinking(stance) {
  const ov = document.createElement("div");
  ov.className = "new-thinking";
  ov.innerHTML = `<div class="nt-box"><span class="nt-top">💡 NEW THINKING UNLOCKED</span><span class="nt-for">FOR ${escapeHtml(String(stance).toUpperCase())}</span></div>`;
  document.body.appendChild(ov);
  sfx("magic");
  setTimeout(() => { ov.classList.add("nt-out"); setTimeout(() => ov.remove(), 450); }, 2400);
}
// Drop character `aId` onto `bId` -> a baby joins the board for THIS game only (never saved).
function breedCharacters(aId, bId) {
  const A = characterById(aId), B = characterById(bId);
  if (!A || !B || !window.faceGenerator) return;
  const mode = state.global.mystery?.id;
  // PANTONE: dragging two people together doesn't breed - it MIXES them like paint. Both take the
  // averaged background AND the averaged skin tone, and their Pantone chips re-derive from the blend.
  if (mode === "pantone") { mixPantonePair(A, B); return; }
  // WHAT'S IN THE HAND?: drag one object onto another and they BATTLE (RPS-style); loser is crossed off.
  if (mode === "prop-panic") { propBattle(A, B); return; }
  // SIMS: dragging two sims spins a slot machine of interactions - MARRIED / SLAP / WOOHOO (WOOHOO is
  // dropped in PG mode) - and plays out whichever it lands on.
  if (mode === "sims") { simsInteract(A, B); return; }
  // HORNY POTTER: the only "drag" is the Dark Lord onto a victim - he Avada Kedavras them (marks them
  // as a NO). Anyone else dragging just jiggles ("not here").
  if (mode === "horny-potter") {
    const asgHP = state.global.mystery.assignments || {};
    if (asgHP[A.id]?.role === "darklord" && A.id !== B.id) { avadaKedavra(B); return; }
    [aId, bId].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("no-breed-jiggle"); void c.offsetWidth; c.classList.add("no-breed-jiggle"); } });
    return;
  }
  // Hidden Agendas: an opposite-party drag is a TUG-O-WAR; same-party comrades BREED instead,
  // and the baby develops its own unhinged ideology remixed from its parents' platforms.
  if (mode === "hidden-agendas") {
    const asgHA = state.global.mystery.assignments;
    const nrm = (p) => (/^rep/i.test(p || "") ? "REP" : "DEM");
    if (asgHA[A.id] && asgHA[B.id] && nrm(asgHA[A.id].party) !== nrm(asgHA[B.id].party)) { politicsTug(A, B); return; }
    // same party -> fall through to the generic breed below
  }
  if (!BREED_MODES.includes(mode)) {
    // No nagging message - just jiggle the pair to say "not here".
    [aId, bId].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("no-breed-jiggle"); void c.offsetWidth; c.classList.add("no-breed-jiggle"); } });
    return;
  }

  // In FERTILITY mode breeding is gated: you need one egg-producer + one sperm-producer, and it costs
  // each of them some balance. They grind together, then a baby explodes out (parents survive).
  if (mode === "fertility") {
    const asg = state.global.mystery.assignments;
    const fa = asg[A.id], fb = asg[B.id];
    if (!fa || !fb) { flashToast("These two can't breed."); return; }
    const eggOf = (f) => f.hasEggs && !f.barren && f.eggs > 0;
    const spermOf = (f) => f.hasCount && parseCum(f.cum) > 0;
    const dropEgg = (f) => { f.eggs = Math.max(0, f.eggs - 1); };
    const dropSperm = (f) => { f.cum = formatCum(parseCum(f.cum) - (60 + Math.floor(Math.random() * 90))); };
    let gayby = false;
    if (eggOf(fa) && spermOf(fb)) { dropEgg(fa); dropSperm(fb); }
    else if (eggOf(fb) && spermOf(fa)) { dropEgg(fb); dropSperm(fa); }
    else if (eggOf(fa) && eggOf(fb)) { dropEgg(fa); dropEgg(fb); gayby = true; }   // two eggs -> gayby
    else if (spermOf(fa) && spermOf(fb)) { dropSperm(fa); dropSperm(fb); gayby = true; } // two sperm -> gayby
    else { flashToast("Need eggs 🥚 + sperm 💦 — no viable gametes!"); return; }
    if (sameSex(A, B)) gayby = true;
    const baby = makeBaby(A, B, gayby);
    // FRESH MEAT: a newborn starts with 0 cummies and a huge fresh clutch of eggs.
    asg[baby.id] = { cum: "0M", eggs: 300 + Math.floor(Math.random() * 400), barren: false, hrs: 71, mins: 59, defect: null, hasCount: true, hasEggs: true, freshMeat: true };
    renderBoard();                                            // show the deducted balances immediately
    playBirthAnimation(A.image, B.image, baby, true, () => babyIdentityReels(baby, mode, () => offerKeepOrAbort(baby, () => {
      state.board.push(baby);
      if (baby.isGayby) persistGayby(baby);
      netAnnounceBaby(baby); scheduleSave();
      state.justBorn = baby.id;
      renderBoard();
      state.justBorn = null;
      if (typeof addLog === "function") addLog(`${A.name} + ${B.name} bred ${baby.name}!`);
    }, () => abortBaby(baby, A, B), { mode, assignment: asg[baby.id] })));
    return;
  }

  // FAMILY TREE: dragging someone onto another family marries them INTO that family, and the pair
  // gets a baby/gayby that branches off them in the tree.
  if (mode === "family-tree-disaster") {
    const asg = state.global.mystery.assignments;
    const fa = asg[A.id], fb = asg[B.id];
    if (!fa || !fb) return;
    const gaybyKid = state.settings.pg ? false : sameSex(A, B);   // PG family tree: only boys/girls
    const baby = makeBaby(A, B, gaybyKid);
    playBirthAnimation(A.image, B.image, baby, true, () => babyIdentityReels(baby, mode, () => offerKeepOrAbort(baby, () => {
      state.board.push(baby);
      const clusters = state.global.mystery.clusters || [];
      // The dragged one leaves their old family and joins the drop target's.
      if (fa.clusterId !== fb.clusterId) {
        const from = clusters.find((c) => c.id === fa.clusterId);
        const to = clusters.find((c) => c.id === fb.clusterId);
        if (from && to) {
          from.characterIds = from.characterIds.filter((cid) => cid !== A.id);
          to.characterIds.push(A.id);
          fa.clusterId = to.id;
        }
      }
      const home = clusters.find((c) => c.id === fb.clusterId);
      if (home) home.characterIds.push(baby.id);
      asg[baby.id] = { clusterId: fb.clusterId, role: "Baby Somehow" };
      if (baby.isGayby) persistGayby(baby);
      netAnnounceBaby(baby); scheduleSave();
      state.justBorn = baby.id;
      if (typeof addLog === "function") addLog(`${A.name} married into ${home ? home.name : "the family"} — ${baby.name} branches off!`);
      renderBoard();
      state.justBorn = null;
    }, () => abortBaby(baby, A, B), {
      mode,
      family: (state.global.mystery.clusters || []).find((c) => c.id === fb.clusterId)?.name || "the family"
    })));
    return;
  }

  // Orgy / Gay / Disease / Sims / Drugs.
  const gayby = sameSex(A, B);
  const diseaseBaby = mode === "disease" ? combineDiseaseAssignment(A, B) : null;  // compute before the animation
  const agendaBaby = mode === "hidden-agendas" ? mixAgendaAssignment(A, B) : null; // remixed ideology
  const baby = makeBaby(A, B, gayby);
  if (mode === "drugs") baby.isCrack = true;   // druggie parents make a CRACK BABY / CRACK GAYBY
  const woohoo = mode === "sims";   // Sims "woohoo" before the baby
  playBirthAnimation(A.image, B.image, baby, woohoo, () => babyIdentityReels(baby, mode, () => offerKeepOrAbort(baby, () => {
    state.board.push(baby);
    if (mode === "disease") {
      state.global.mystery.assignments[baby.id] = diseaseBaby;   // baby inherits mutant combined diseases
    } else if (mode === "hidden-agendas") {
      state.global.mystery.assignments[baby.id] = agendaBaby;    // fresh ideology remixed from the parents
      addLog(`${baby.name} has developed NEW political opinions.`);
      if (agendaBaby && agendaBaby.newThinking) showNewThinking(agendaBaby.newThinking);
    } else if (mode === "sims") {
      state.global.mystery.assignments[baby.id] = { mood: "green", needs: { hunger: 92, social: 95, bladder: 70, fun: 98 }, action: "Being a fresh newborn", career: "Unemployed", simoleons: 0, ...simsPortrait(baby) };
    } else if (state.global.mystery) {
      try { reapplyCurrentMystery(); } catch (e) { /* mode has no per-baby data - fine */ }
    }
    if (baby.isGayby) persistGayby(baby);
      netAnnounceBaby(baby); scheduleSave();
    state.justBorn = baby.id;
    if (typeof addLog === "function") addLog(`${A.name} + ${B.name} made a baby: ${baby.name}!`);
    renderBoard();
    state.justBorn = null;
    // Disease babies get the pathology roulette: a random severity + a random bonus disease. (Pronouns/
    // gender/kink already rolled BEFORE keep/abort via babyIdentityReels, for every breeding mode.)
    if (mode === "disease") {
      const names = ((window.GameData && window.GameData.diseases) || [["Novel Ailment", "MAJOR"]]).map((d) => d[0]);
      spinIdentityReels("PATHOLOGY ROULETTE…", [
        { label: "SEVERITY", values: ["MINOR", "MAJOR", "MEGA"] },
        { label: "DISEASE", values: names }
      ], ([tier, name]) => {
        const asg = state.global.mystery?.assignments[baby.id];
        if (asg) asg.diseases = [{ name, tier }, ...(asg.diseases || [])].slice(0, 4);
        renderBoard();
      });
    }
  }, () => abortBaby(baby, A, B), { mode, assignment: diseaseBaby || agendaBaby })), { woohoo });
}
// A transparent-background portrait + the original backdrop colour, so Sims relief animations can
// move JUST the person while the card background holds still.
function simsPortrait(ch) {
  if (!(ch.traits && window.faceGenerator)) return {};
  try {
    return { image: window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, background: "transparent" }), bg: ch.traits.background };
  } catch (e) { return {}; }
}
// The offer is the one place where the freshly generated person can be read before the decision.
// Always show reel identity plus the data that this special effect has already generated for them.
function babyOfferDetails(baby, preview) {
  preview = preview || {};
  const mode = preview.mode || state.global.mystery?.id;
  const a = preview.assignment || state.global.mystery?.assignments?.[baby.id] || null;
  const rows = [];
  const add = (label, value, wide) => {
    if (value == null || value === "") return;
    rows.push({ label, value: String(value), wide: !!wide });
  };
  const identity = baby.identity || baby.wokeIdentity || {};
  add("Pronouns", identity.pronouns || (baby.pronouns === "he" ? "he/him" : baby.pronouns === "she" ? "she/her" : "they/them"));
  add("Gender", identity.gender);
  add("Kink", identity.kink);
  add("Ethnicity", baby.wokeIdentity?.ethnicity);
  add("Role", baby.role);

  if (mode === "fertility" && a) {
    add("Sperm", a.cum);
    add("Eggs", a.barren ? "BARREN" : a.eggs);
    add("Ready in", `${a.hrs}h ${a.mins}m`);
  } else if (mode === "disease" && a) {
    add("Conditions", (a.diseases || []).map((d) => `${d.tier} ${d.name}`).join(" · "), true);
    add("Medication", (a.meds || []).join(" · ") || "none", true);
    add("Pain", Number.isFinite(a.pain) ? `${a.pain + 1}/5` : "");
  } else if (mode === "hidden-agendas" && a) {
    add("Party", a.party);
    add("Home state", a.state);
    add("New thinking", a.newThinking ? `FOR ${a.newThinking}` : "none yet", true);
  } else if (mode === "sims" && a) {
    add("Mood", a.mood);
    add("Needs", a.needs ? `Hunger ${a.needs.hunger} · Social ${a.needs.social} · Fun ${a.needs.fun}` : "", true);
    add("Career", a.career);
  } else if (mode === "family-tree-disaster") {
    add("Family", preview.family);
  } else if (mode === "drugs" && baby.isCrack) {
    add("Special effect", baby.isGayby ? "Crack gayby" : "Crack baby");
  }
  add("Parents", (baby.parents || []).join(" + "), true);
  return rows.map((row) => `<div class="ka-detail${row.wide ? " ka-detail-wide" : ""}" data-baby-field="${escapeHtml(row.label.toLowerCase().replace(/\s+/g, "-"))}"><dt>${escapeHtml(row.label)}</dt><dd>${escapeHtml(row.value)}</dd></div>`).join("");
}

// After a baby is born the players decide its fate: KEEP adds it to the board, ABORT... doesn't.
// PG mode is wholesome - the baby is simply KEPT, no abort option is ever offered.
function offerKeepOrAbort(baby, keep, abort, preview) {
  if (state.settings.pg) { keep(); return; }
  const ov = document.createElement("div");
  ov.className = "keep-abort";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-modal", "true");
  ov.setAttribute("aria-labelledby", "ka-baby-name");
  ov.innerHTML = `<div class="ka-box">
      <p class="ka-q">A ${baby.isCrack ? (baby.isGayby ? "CRACK GAYBY" : "CRACK BABY") : baby.isGayby ? "GAYBY" : "baby"} has arrived…</p>
      <img class="ka-face" src="${baby.image}" alt="Portrait of ${escapeHtml(baby.name)}">
      <p class="ka-name" id="ka-baby-name">${escapeHtml(baby.name)}</p>
      <dl class="ka-details">${babyOfferDetails(baby, preview)}</dl>
      <p class="ka-status" aria-live="polite"></p>
      <div class="ka-btns">
        <button type="button" class="button primary ka-keep">👶 KEEP</button>
        <button type="button" class="button secondary ka-abort">🚫 ABORT</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  requestAnimationFrame(() => ov.classList.add("is-ready"));
  const buttons = [...ov.querySelectorAll("button")];
  let resolving = false;
  const settle = (choice, callback) => {
    if (resolving) return;
    resolving = true;
    buttons.forEach((button) => { button.disabled = true; });
    ov.classList.add(choice === "keep" ? "is-keeping" : "is-aborting");
    ov.querySelector(".ka-status").textContent = choice === "keep" ? "Joining the family…" : "Fading from this timeline…";
    const reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setTimeout(() => { ov.remove(); callback(); }, reduced ? 40 : 520);
  };
  ov.querySelector(".ka-keep").addEventListener("click", () => settle("keep", keep));
  ov.querySelector(".ka-abort").addEventListener("click", () => settle("abort", abort));
  ov.querySelector(".ka-keep").focus();
}
const ABORT_LINES = [
  "was terminated. Only the strongest survive.",
  "was brought to a close. Dessert anyone?",
  "met the guillotine. ABBA was in attendance.",
  "was returned to sender. No refund.",
  "did not clear customs.",
  "was un-alived before the vibe check.",
  "was sent back to the drawing board. Literally.",
  "yeeted into the void. Godspeed.",
  "was politely declined by management.",
  "was recalled for safety reasons.",
  "took the L. Better luck next conception.",
  "was composted. Very eco-friendly."
];
function abortBaby(baby, parentA, parentB) {
  // Each aborted baby adds to a hidden tally on both parents - sortable as "Abortions".
  [parentA, parentB].forEach((p) => { if (p) p.abortions = (p.abortions || 0) + 1; });
  if (typeof bumpStat === "function") bumpStat("abortions");
  // The soul lingers: it haunts Judgement Day's purgatory for the rest of the session (persisted).
  state.abortedBabies = state.abortedBabies || [];
  if (!state.abortedBabies.some((g) => g.id === baby.id)) {
    state.abortedBabies.push({ id: baby.id, name: baby.name, seed: baby.seed, traits: baby.traits, isGayby: !!baby.isGayby, parents: baby.parents || [] });
  }
  const line = ABORT_LINES[Math.floor(Math.random() * ABORT_LINES.length)];
  flashToast(`👼 ${baby.name} ${line}`);
  sfx("trash");                                    // the sound of being thrown out
  if (typeof addLog === "function") addLog(`${baby.name} ${line}`);
  renderBoard();
  scheduleSave();
}
// A brief centred toast for breeding feedback.
function flashToast(msg) {
  const t = document.createElement("div");
  t.className = "flash-toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1800);
}
// The birth fanfare: (fertility only) the parents grind together, then a fireworks burst + flash, an
// "IT'S A BOY/GIRL/THEM!" reveal with the baby's name, and finally the baby forms into a card that
// flies down to the bottom of the stack. `done()` fires at the end (adds the baby to the board).
function playBirthAnimation(imgA, imgB, baby, grind, done, opts) {
  const woohoo = opts && opts.woohoo;
  const gender = baby.isCrack
    ? (baby.isGayby ? "IT'S A CRACK GAYBY!!" : "IT'S A CRACK BABY!!")
    : baby.isGayby ? "IT'S A GAYBY!!" : baby.pronouns === "he" ? "IT'S A BOY!" : baby.pronouns === "she" ? "IT'S A GIRL!" : "IT'S A NON-BINARY!";
  const cols = ["#ff4d6d", "#ffd24d", "#5dff8f", "#4dd2ff", "#c46bff", "#ff8a4d", "#fff27a"];
  let burst = "";
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
    const dist = 78 + (i % 4) * 24;
    burst += `<i style="--tx:${Math.round(Math.cos(ang) * dist)}px;--ty:${Math.round(Math.sin(ang) * dist)}px;color:${cols[i % cols.length]}"></i>`;
  }
  const ov = document.createElement("div");
  ov.className = `breed-overlay ${grind ? "with-grind" : ""} ${woohoo ? "woohoo" : ""}`.trim();
  ov.innerHTML = `<div class="breed-stage">
      ${grind ? `<img class="breed-p breed-a" src="${imgA}" alt=""><img class="breed-p breed-b" src="${imgB}" alt="">` : ""}
      ${woohoo ? `<div class="woohoo-cover">🛏️ WOOHOOING IN PROGRESS…</div>` : ""}
      <div class="breed-flash"></div>
      <div class="breed-burst">${burst}</div>
      <div class="birth-banner ${baby.isGayby ? "gayby-banner" : ""}">${gender}</div>
      <div class="birth-card ${baby.isGayby ? "gayby-card" : ""}"><img src="${baby.image}" alt=""><span class="birth-name">${escapeHtml(baby.name)}</span></div>
    </div>`;
  document.body.appendChild(ov);
  setTimeout(() => sfx("baby"), grind ? 1400 : 350);   // fanfare as the baby is revealed
  setTimeout(() => { ov.remove(); done(); }, grind ? 3200 : 2500);
}
// Shared drag-and-drop wiring: any card / floating head can be dragged onto another to breed. Works
// with the mouse (HTML5 drag) AND touch (a manual long-press finger-drag).
let breedTouch = null;
const BREED_TOUCH_HOLD_MS = 350;
function wireBreedDnD(el, id) {
  el.draggable = true;
  el.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "copy"; el.classList.add("dragging"); });
  el.addEventListener("dragend", () => el.classList.remove("dragging"));
  el.addEventListener("dragover", (e) => { e.preventDefault(); el.classList.add("drop-target"); });
  el.addEventListener("dragleave", () => el.classList.remove("drop-target"));
  el.addEventListener("drop", (e) => {
    e.preventDefault(); el.classList.remove("drop-target");
    const src = e.dataTransfer.getData("text/plain");
    if (src && src !== id) breedCharacters(src, id);
  });
  // Touch: hold briefly, then drag a finger from one card onto another to breed. A tap still
  // eliminates, and a normal scroll starting on a card remains a scroll.
  el.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    breedTouch = {
      id,
      x: t.clientX,
      y: t.clientY,
      active: false,
      moved: false,
      timer: setTimeout(() => {
        if (!breedTouch || breedTouch.id !== id) return;
        breedTouch.active = true;
        el.classList.add("dragging");
      }, BREED_TOUCH_HOLD_MS)
    };
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!breedTouch || breedTouch.id !== id) return;
    const t = e.touches[0];
    const movedEnough = Math.abs(t.clientX - breedTouch.x) > 8 || Math.abs(t.clientY - breedTouch.y) > 8;
    if (!breedTouch.active && movedEnough) {
      clearTimeout(breedTouch.timer);
      breedTouch = null;
      return;
    }
    if (breedTouch.active) {
      breedTouch.moved = movedEnough || breedTouch.moved;
      e.preventDefault();                               // don't scroll while dragging a face
      el.classList.add("dragging");
      document.querySelectorAll(".drop-target").forEach((x) => x.classList.remove("drop-target"));
      const under = document.elementFromPoint(t.clientX, t.clientY)?.closest("[data-id]");
      if (under && under.dataset.id !== id) under.classList.add("drop-target");
    }
  }, { passive: false });
  el.addEventListener("touchend", (e) => {
    el.classList.remove("dragging");
    document.querySelectorAll(".drop-target").forEach((x) => x.classList.remove("drop-target"));
    if (breedTouch) clearTimeout(breedTouch.timer);
    if (breedTouch && breedTouch.id === id && breedTouch.active) {
      e.preventDefault();
      const t = e.changedTouches[0];
      const under = document.elementFromPoint(t.clientX, t.clientY)?.closest("[data-id]");
      if (under && under.dataset.id !== id) breedCharacters(id, under.dataset.id);
    }
    breedTouch = null;
  });
  el.addEventListener("touchcancel", () => {
    if (breedTouch) clearTimeout(breedTouch.timer);
    breedTouch = null;
    el.classList.remove("dragging");
    document.querySelectorAll(".drop-target").forEach((x) => x.classList.remove("drop-target"));
  });
}
