// Pure rules for WHO? DID YOU MAKE? — the flesh draft.
// Players hold secret "commissions" (part recipes over a shared donor board) and take turns
// claiming body parts. Claimed parts are gone for everyone, and whatever you claim you wear:
// denial is legal, powerful, and self-taxing. Like GeneticsRules, this module has no DOM,
// storage, network, Date.now, or Math.random dependency — rounds are pure functions of a seed.
(function installMakeRules(root) {
  const Genetics = root.GeneticsRules;
  if (!Genetics) throw new Error("GeneticsRules must load before make-rules.js");

  const MODE_VERSION = 1;
  // 18 seats on the slab (I and O are skipped - they read as 1 and 0 across a party table).
  const DONOR_LABELS = ["A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "Q", "R", "S", "T"];
  const PICKS_PER_PLAYER = 6;

  // Scoring: an exact recipe part is always worth more than any lookalike substitution.
  // Substitution credit is rescaled above a similarity floor — synthetic donors share a
  // restrained base, so raw part similarity idles near 0.65 and unscaled credit would hand
  // clueless drafting ~60/100 (measured in bot sims). Floored, random play lands ~40.
  const EXACT_POINTS = 15;
  const SUBSTITUTION_CAP = 12;
  const SUBSTITUTION_FLOOR = 0.4;
  const MASTERPIECE_BONUS = 10;

  const substitutionPoints = (similarity) =>
    Math.min(SUBSTITUTION_CAP, Math.round(EXACT_POINTS * Math.max(0, (similarity - SUBSTITUTION_FLOOR) / (1 - SUBSTITUTION_FLOOR))));

  // How many of a player's six recipe parts must also appear in someone else's recipe.
  // Bigger tables collide more by pigeonhole, so the ceiling scales with seats.
  const CONTESTED_RANGE = { min: 2, max: 4 };
  const maxContestedFor = (playerCount) => playerCount <= 4 ? 4 : playerCount === 5 ? 5 : 6;

  const BACKDROPS = ["#a9c4e0", "#eeb6bd", "#9fccb0", "#e3b4ab", "#bcd09a", "#e8d4a1", "#bfdce6", "#c6b9e0"];

  // ---------------------------------------------------------------------------
  // The six draftable parts partition the trait registry's bundles completely.
  // Colour rides with its anatomy: skin with SKULL, eye colour with EYES, hair
  // colour with HAIR — so complexion is evidence on the board, not a 7th slot.
  // ---------------------------------------------------------------------------
  const PART_GROUPS = {
    skull: ["headFrame", "headTilt", "jawChin", "faceShape", "ears", "earRot", "earAsym", "skin"],
    eyes: ["eyeCore", "eyePlacement", "eyeAsym", "lazyEye", "pupil", "eyelids", "eyeColor", "browCore", "browAngle", "browAsym"],
    nose: ["nose"],
    mouth: ["mouth"],
    hair: ["hairTexture", "hairline", "hairColorGroup"],
    body: ["body", "neck"]
  };
  const PART_ORDER = ["skull", "eyes", "nose", "mouth", "hair", "body"];
  const PART_LABELS = { skull: "SKULL", eyes: "EYES", nose: "NOSE", mouth: "MOUTH", hair: "HAIR", body: "BODY" };

  const ENTRIES_BY_PART = {};
  {
    const groupToPart = {};
    PART_ORDER.forEach((part) => PART_GROUPS[part].forEach((group) => {
      if (groupToPart[group]) throw new Error(`Trait group ${group} is claimed by two parts`);
      groupToPart[group] = part;
    }));
    PART_ORDER.forEach((part) => { ENTRIES_BY_PART[part] = []; });
    Genetics.TRAIT_REGISTRY.forEach((entry) => {
      const part = groupToPart[entry.group];
      if (!part) throw new Error(`Trait group ${entry.group} belongs to no draftable part — update PART_GROUPS`);
      ENTRIES_BY_PART[part].push(entry);
    });
  }

  // ---------------------------------------------------------------------------
  // Cast donors: the base WHO? IS IT? characters can serve as the slab. Their
  // non-registry furniture (glasses, beards, hats, outfits, wrinkles, makeup,
  // jewellery) rides with the anatomical part it belongs to — take her eyes,
  // you get her glasses; take his body, you wear his shirt. Extras are identity
  // only: scoring stays phenotype-pure, so none of this is worth points.
  // ---------------------------------------------------------------------------
  const ACCESSORY_PART = {
    glasses: "eyes", roundGlasses: "eyes", squareGlasses: "eyes", catEyeGlasses: "eyes", eyebrowRing: "eyes",
    noseRing: "nose",
    beard: "mouth", moustache: "mouth",
    hoops: "skull", studs: "skull", dropEarrings: "skull",
    necklace: "body", chain: "body", choker: "body", scarf: "body", ring: "body",
    bow: "hair", cap: "hair", turban: "hair", beanie: "hair", beret: "hair", headband: "hair",
    flowerClip: "hair", bucketHat: "hair", sunHat: "hair", capBack: "hair"
  };
  const JEWELLERY_PART = {
    studs: "skull", hoops: "skull", dropEarrings: "skull",
    necklace: "body", chain: "body", choker: "body", ring: "body",
    noseRing: "nose", eyebrowRing: "eyes"
  };
  const ACCESSORY_KEYS = ["accessory", "accessoryColor", "accessoryMetal", "accessoryX", "accessoryY", "accessoryScale", "accessoryRot", "accessoryLayer", "chainLink"];
  const EXTRA_KEYS = {
    skull: ["faceLineOpacity", "nasoOpacity", "foreheadLineOpacity", "frownLineOpacity", "underEyeOpacity", "underEyeY", "underEyeLineWidth",
      "crowsFeetOpacity", "marionetteOpacity", "cheekLineOpacity", "cheekY", "cheekOpacity", "blushColor", "blushScale", "blushX",
      "contourOpacity", "contourY", "contourX", "contourWidth", "jawShadowY", "adamAppleStyle", "adamAppleScale", "adamAppleOpacity", "adamAppleY"],
    eyes: ["lashes", "eyelashThickness", "eyelashDensity", "eyelashCurl", "eyelashCoverage", "eyelashColor",
      "eyeshadowOpacity", "eyeshadowColor", "undershadowOpacity", "undershadowY", "undershadowWidth", "underEyeWidth"],
    nose: [],
    mouth: ["expression", "mouthStyle", "smileLips", "lipColor", "lipLineWidth", "teethStyle", "teethGap", "teethOverhang", "teethX", "teethY", "teethScale",
      "mouthOpenW", "mouthOpenH", "beardLength", "beardX", "beardY", "beardScale", "beardSkewX", "beardSkewY", "moustacheX", "moustacheY", "moustacheScale"],
    hair: ["hair", "hairColor", "hairHex", "hairOutlineMode", "hairOutline", "hairOutlineWidth", "backHairY", "hairComposition", "hairLocks","lockBlend", "castShadowPreset"],
    body: ["clothing", "shirt", "tattooText", "tattooPlace", "tattooFont", "tattooColor", "tattooX", "tattooY", "tattooScale", "tattooRot", "tattooSkewX", "tattooWarp", "tattooOpacity", "tattooLayer"]
  };

  function castDonorFrom(character) {
    const node = Genetics.normalizeFounder(character);
    const source = character.traits || {};
    const extras = Object.fromEntries(PART_ORDER.map((part) => [part, {}]));
    PART_ORDER.forEach((part) => EXTRA_KEYS[part].forEach((key) => {
      if (source[key] !== undefined && source[key] !== "") extras[part][key] = source[key];
    }));
    // FACE tattoos belong to the skull, not the torso - re-route the whole tattoo bundle
    // so stealing a body doesn't walk off with someone's face ink.
    if (String(source.tattooPlace || "") === "face" && Object.keys(extras.body).some((key) => key.startsWith("tattoo"))) {
      Object.keys(extras.body).filter((key) => key.startsWith("tattoo")).forEach((key) => {
        extras.skull[key] = extras.body[key];
        delete extras.body[key];
      });
    }
    const accessory = String(source.accessory || "none");
    if (accessory !== "none") {
      const part = ACCESSORY_PART[accessory] || "eyes";
      ACCESSORY_KEYS.forEach((key) => { if (source[key] !== undefined && source[key] !== "") extras[part][key] = source[key]; });
    }
    (Array.isArray(source.jewelleryItems) ? source.jewelleryItems : []).forEach((item) => {
      const part = JEWELLERY_PART[item] || "body";
      (extras[part].jewelleryItems = extras[part].jewelleryItems || []).push(item);
    });
    return { ...node, displayName: String(character.name || "Donor"), extras };
  }

  // The unclaimed body: putty-grey, bald, neutral-featured. Every creature starts here.
  const MANNEQUIN = (() => {
    const phenotype = {};
    Genetics.TRAIT_REGISTRY.forEach((entry) => {
      if (entry.mode === "perceptualColor") return;
      if (entry.mode === "categorical") { phenotype[entry.key] = entry.key === "hairFamily" ? "none" : entry.options[0]; return; }
      phenotype[entry.key] = entry.base;
    });
    phenotype.skinColor = "#cbc4b6";
    phenotype.hairColor = "#8a857c";
    phenotype.eyeColor = "#7a766e";
    phenotype.hairStyle = "bald";
    return Object.freeze(phenotype);
  })();

  const clone = (value) => JSON.parse(JSON.stringify(value));

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

  function shuffled(list, rng) {
    const copy = list.slice();
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swap = Math.floor(rng() * (index + 1));
      [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
  }

  // ---------------------------------------------------------------------------
  // Assembly: copy each claimed part's trait bundle from its donor onto the
  // mannequin. Used for secret targets, live previews, and stripped-donor cards.
  // ---------------------------------------------------------------------------
  function assembleCreature(partsMap, donorsById, options = {}) {
    const phenotype = clone(MANNEQUIN);
    PART_ORDER.forEach((part) => {
      const donor = donorsById[partsMap?.[part]];
      if (!donor) return;
      ENTRIES_BY_PART[part].forEach((entry) => { phenotype[entry.key] = donor.phenotype[entry.key]; });
      if (part === "hair") phenotype.hairStyle = donor.phenotype.hairStyle;
    });
    const traits = Genetics.phenotypeToTraits(phenotype, { background: options.background });
    // Ride-along extras: each part carries its donor's furniture (cast donors only —
    // synthetic strangers have none). Keys are strictly partitioned, so parts never
    // fight over a slot; jewellery concatenates because ears + necklace can coexist.
    PART_ORDER.forEach((part) => {
      const extras = donorsById[partsMap?.[part]]?.extras?.[part];
      if (!extras) return;
      Object.entries(extras).forEach(([key, value]) => {
        if (key === "jewelleryItems") traits.jewelleryItems = [...(traits.jewelleryItems || []), ...value];
        else traits[key] = value;
      });
    });
    traits.animMode = "still";
    return {
      id: String(options.id || `wdym-creature-${stableHash(JSON.stringify(partsMap))}`),
      name: String(options.name || "The Commission"),
      phenotype,
      traits,
      parts: clone(partsMap || {})
    };
  }

  // Strip claimed parts back to mannequin values (and strip their ride-along extras)
  // by reassembling the donor from whatever parts they have left.
  function strippedDonor(donor, takenParts, options = {}) {
    const remaining = Object.fromEntries(PART_ORDER
      .filter((part) => !(takenParts || []).includes(part))
      .map((part) => [part, donor.id]));
    const node = assembleCreature(remaining, { [donor.id]: donor }, {
      id: donor.id,
      name: donor.name,
      background: options.background || donor.traits?.background
    });
    return { ...donor, phenotype: node.phenotype, traits: node.traits };
  }

  function partSimilarity(phenoA, phenoB, part) {
    let score = 0;
    let weight = 0;
    ENTRIES_BY_PART[part].forEach((entry) => {
      score += Genetics.traitSimilarity(entry, phenoA, phenoB) * entry.weight;
      weight += entry.weight;
    });
    return weight ? score / weight : 0;
  }

  // ---------------------------------------------------------------------------
  // Commissions: one secret recipe per player, six parts from six distinct
  // donors, built constructively so every player has 2-4 contested parts
  // (exact part+donor pairs shared with a rival). Deterministic per seed.
  // ---------------------------------------------------------------------------
  function contestedCounts(recipes) {
    return recipes.map((recipe, index) => PART_ORDER.filter((part) =>
      recipes.some((other, otherIndex) => otherIndex !== index && other[part] === recipe[part])
    ).length);
  }

  function buildCommissions({ donorIds, playerCount, seed, minContested = CONTESTED_RANGE.min, maxContested }) {
    if (playerCount < 2) throw new Error("The flesh draft needs at least two players");
    const ceiling = maxContested ?? maxContestedFor(playerCount);
    const rng = seeded(`${seed}:commissions`);
    const randomRecipe = () => {
      const donors = shuffled(donorIds, rng).slice(0, PART_ORDER.length);
      const parts = shuffled(PART_ORDER, rng);
      return Object.fromEntries(parts.map((part, index) => [part, donors[index]]));
    };
    let best = null;
    for (let attempt = 0; attempt < 80; attempt += 1) {
      const recipes = [randomRecipe()];
      for (let player = 1; player < playerCount; player += 1) {
        const recipe = randomRecipe();
        const rival = recipes[Math.floor(rng() * recipes.length)];
        const share = minContested + Math.floor(rng() * (Math.min(ceiling, 4) - minContested + 1));
        for (const part of shuffled(PART_ORDER, rng).slice(0, share)) {
          const donor = rival[part];
          const clash = PART_ORDER.find((other) => other !== part && recipe[other] === donor);
          if (clash) {
            const used = new Set(Object.values(recipe).concat(donor));
            const free = donorIds.filter((id) => !used.has(id));
            recipe[clash] = free[Math.floor(rng() * free.length)] || recipe[clash];
          }
          recipe[part] = donor;
        }
        recipes.push(recipe);
      }
      if (recipes.some((recipe) => new Set(Object.values(recipe)).size !== PART_ORDER.length)) continue;
      const counts = contestedCounts(recipes);
      if (counts.every((count) => count >= minContested && count <= ceiling)) return recipes;
      // Track the least-violating sample so exhaustion degrades gracefully instead of degenerating.
      const violation = counts.reduce((sum, count) =>
        sum + Math.max(0, minContested - count) + Math.max(0, count - ceiling), 0);
      if (!best || violation < best.violation) best = { recipes, violation };
    }
    return best.recipes;
  }

  // ---------------------------------------------------------------------------
  // Round construction + the draft state machine.
  // ---------------------------------------------------------------------------
  function snakeOrder(playerCount, rounds = PICKS_PER_PLAYER) {
    const order = [];
    for (let lap = 0; lap < rounds; lap += 1) {
      const seats = Array.from({ length: playerCount }, (_, index) => index);
      order.push(...(lap % 2 ? seats.reverse() : seats));
    }
    return order;
  }

  // A deliberately oversized slab: commissions still need six parts, but they hide
  // among eighteen bodies, so recognising the right donor is a real skill check.
  function donorCountFor() {
    return 18;
  }

  function buildDraftRound(options) {
    const sessionSeed = String(options.sessionSeed || "wdym-session");
    const roundIndex = options.roundIndex || 0;
    const playerCount = options.playerCount;
    if (!Number.isInteger(playerCount) || playerCount < 2 || playerCount > 6) {
      throw new Error("WHO? DID YOU MAKE? seats 2-6 players");
    }
    const seed = `${sessionSeed}:make:${roundIndex}`;
    const donorCount = options.donorCount || donorCountFor(playerCount);
    const background = BACKDROPS[stableHash(`${seed}:bg`) % BACKDROPS.length];
    // Donor source: the recognisable base cast (characterful, extras ride with parts)
    // or synthetic strangers (anonymous, extras-free). Cast needs enough eligible bodies.
    const eligibleCast = options.donorSource === "cast" && Array.isArray(options.characters)
      ? options.characters.filter((character) => character?.traits && !character.isBaby && !character.isGayby)
      : [];
    const usingCast = eligibleCast.length >= donorCount;
    // Seeded sample before the (seedless) maximin pass, or every round would slab the
    // same "most distinct" cast members. Baldness is capped in the window: "no hair" is a
    // cheap distinctness axis, so unchecked maximin fills the slab with baldies.
    let pool;
    if (usingCast) {
      const mapped = shuffled(eligibleCast, seeded(`${seed}:castpool`)).map(castDonorFrom);
      const windowSize = Math.min(mapped.length, donorCount * 2 + 4);
      const baldCap = donorCount >= 14 ? 3 : 2;
      const nonBaldCount = mapped.filter((donor) => donor.phenotype.hairFamily !== "none").length;
      const effectiveBaldCap = Math.max(baldCap, donorCount - nonBaldCount);
      const window = [];
      let baldTaken = 0;
      mapped.forEach((donor) => {
        if (window.length >= windowSize) return;
        const bald = donor.phenotype.hairFamily === "none";
        if (bald && baldTaken >= effectiveBaldCap) return;
        if (bald) baldTaken += 1;
        window.push(donor);
      });
      mapped.forEach((donor) => {   // backfill only if the best achievable cap cannot fill the slab
        if (window.length < donorCount && !window.includes(donor)) window.push(donor);
      });
      pool = window;
    } else {
      pool = Genetics.generateFounderPool(`${seed}:donors`, Math.max(24, donorCount * 3));
    }
    const donors = Genetics.selectDistinctFounders(pool, donorCount).map((node, index) => ({
      ...node,
      id: `wdym-donor-r${roundIndex}-${index}`,
      label: DONOR_LABELS[index],
      name: usingCast ? String(node.displayName || `Donor ${DONOR_LABELS[index]}`) : `Donor ${DONOR_LABELS[index]}`,
      traits: { ...node.traits, background }
    }));
    const donorsById = Object.fromEntries(donors.map((donor) => [donor.id, donor]));
    const recipes = buildCommissions({
      donorIds: donors.map((donor) => donor.id),
      playerCount,
      seed,
      minContested: options.minContested,
      maxContested: options.maxContested
    });
    const targets = recipes.map((recipe, player) => assembleCreature(recipe, donorsById, {
      id: `wdym-target-r${roundIndex}-p${player}`,
      name: "The Commission",
      background
    }));
    return {
      modeVersion: MODE_VERSION,
      seed,
      roundIndex,
      background,
      playerCount,
      donorSource: usingCast ? "cast" : "strangers",
      donors,
      recipes,
      targets,
      turnOrder: snakeOrder(playerCount),
      claims: [],
      results: null
    };
  }

  const donorById = (round, id) => round.donors.find((donor) => donor.id === id) || null;

  // The six donors behind a player's commission, sorted by slab letter so their display
  // order leaks nothing about which part each one contributed.
  function commissionDonors(round, playerIndex) {
    const ids = [...new Set(Object.values(round.recipes[playerIndex] || {}))];
    return ids.map((id) => donorById(round, id)).filter(Boolean)
      .sort((a, b) => a.label.localeCompare(b.label));
  }
  const currentPicker = (round) => round.claims.length < round.turnOrder.length ? round.turnOrder[round.claims.length] : null;
  const draftComplete = (round) => round.claims.length >= round.turnOrder.length;

  function claimsOf(round, playerIndex) {
    const slots = Object.fromEntries(PART_ORDER.map((part) => [part, null]));
    round.claims.forEach((claim) => { if (claim.playerIndex === playerIndex) slots[claim.part] = claim.donorId; });
    return slots;
  }

  function takenBy(round, donorId, part) {
    const claim = round.claims.find((entry) => entry.donorId === donorId && entry.part === part);
    return claim ? claim.playerIndex : null;
  }

  function legalClaims(round, playerIndex) {
    if (currentPicker(round) !== playerIndex) return [];
    const slots = claimsOf(round, playerIndex);
    const taken = new Set(round.claims.map((claim) => `${claim.donorId}:${claim.part}`));
    const legal = [];
    PART_ORDER.forEach((part) => {
      if (slots[part]) return;   // wear-what-you-steal: one of each part, no discards
      round.donors.forEach((donor) => {
        if (!taken.has(`${donor.id}:${part}`)) legal.push({ donorId: donor.id, part });
      });
    });
    return legal;
  }

  function applyClaim(round, playerIndex, donorId, part) {
    if (currentPicker(round) !== playerIndex) throw new Error("Not this player's pick");
    if (!PART_ORDER.includes(part)) throw new Error(`Unknown part ${part}`);
    if (!donorById(round, donorId)) throw new Error(`Unknown donor ${donorId}`);
    if (claimsOf(round, playerIndex)[part]) throw new Error(`${PART_LABELS[part]} slot already filled`);
    if (takenBy(round, donorId, part) !== null) throw new Error("That part has already been claimed");
    round.claims.push({ pickIndex: round.claims.length, playerIndex, donorId, part });
    return round;
  }

  // ---------------------------------------------------------------------------
  // Scoring + reveal annotations.
  // ---------------------------------------------------------------------------
  function scoreCommission(round, playerIndex) {
    const recipe = round.recipes[playerIndex];
    const slots = claimsOf(round, playerIndex);
    const donorsById = Object.fromEntries(round.donors.map((donor) => [donor.id, donor]));
    const parts = PART_ORDER.map((part) => {
      const wantedId = recipe[part];
      const claimedId = slots[part];
      if (!claimedId) return { part, label: PART_LABELS[part], wantedId, claimedId: null, exact: false, similarity: 0, points: 0 };
      if (claimedId === wantedId) return { part, label: PART_LABELS[part], wantedId, claimedId, exact: true, similarity: 1, points: EXACT_POINTS };
      const similarity = partSimilarity(donorsById[claimedId].phenotype, donorsById[wantedId].phenotype, part);
      return {
        part,
        label: PART_LABELS[part],
        wantedId,
        claimedId,
        exact: false,
        similarity: +similarity.toFixed(3),
        points: substitutionPoints(similarity)
      };
    });
    const exactCount = parts.filter((entry) => entry.exact).length;
    const masterpiece = exactCount === PART_ORDER.length;
    return {
      playerIndex,
      parts,
      exactCount,
      masterpiece,
      score: parts.reduce((sum, entry) => sum + entry.points, 0) + (masterpiece ? MASTERPIECE_BONUS : 0)
    };
  }

  function annotateThefts(round) {
    const thefts = [];
    round.recipes.forEach((recipe, victim) => {
      PART_ORDER.forEach((part) => {
        const wantedId = recipe[part];
        const theft = round.claims.find((claim) => claim.donorId === wantedId && claim.part === part && claim.playerIndex !== victim);
        if (!theft) return;
        const own = round.claims.find((claim) => claim.playerIndex === victim && claim.part === part);
        if (own && own.pickIndex < theft.pickIndex) return;   // victim had already secured or replaced it
        thefts.push({
          victim,
          thief: theft.playerIndex,
          part,
          label: PART_LABELS[part],
          donorId: wantedId,
          pickIndex: theft.pickIndex,
          contested: round.recipes[theft.playerIndex][part] === wantedId   // rival needed it too vs pure spite
        });
      });
    });
    return thefts.sort((a, b) => a.pickIndex - b.pickIndex);
  }

  function scoreRound(round) {
    return {
      players: round.recipes.map((_, playerIndex) => scoreCommission(round, playerIndex)),
      thefts: annotateThefts(round)
    };
  }

  // ---------------------------------------------------------------------------
  // Bots — tuning instruments for the Lab's sim harness (and CI), not opponents.
  // ---------------------------------------------------------------------------
  function botGreedy(round, playerIndex, rng) {
    const legal = legalClaims(round, playerIndex);
    const recipe = round.recipes[playerIndex];
    const mine = legal.filter((claim) => recipe[claim.part] === claim.donorId);
    if (mine.length) {
      const contested = mine.filter((claim) => round.recipes.some((other, index) =>
        index !== playerIndex && other[claim.part] === claim.donorId));
      const pick = (contested.length ? contested : mine);
      return pick[Math.floor(rng() * pick.length)];
    }
    const donorsById = Object.fromEntries(round.donors.map((donor) => [donor.id, donor]));
    let best = null;
    legal.forEach((claim) => {
      const similarity = partSimilarity(donorsById[claim.donorId].phenotype, donorsById[recipe[claim.part]].phenotype, claim.part);
      if (!best || similarity > best.similarity) best = { ...claim, similarity };
    });
    return best;
  }

  function botSpite(round, playerIndex, rng) {
    const legal = legalClaims(round, playerIndex);
    const recipe = round.recipes[playerIndex];
    const steals = legal.filter((claim) => round.recipes.some((other, index) =>
      index !== playerIndex && other[claim.part] === claim.donorId));
    const stealsIAlsoNeed = steals.filter((claim) => recipe[claim.part] === claim.donorId);
    if (stealsIAlsoNeed.length) return stealsIAlsoNeed[Math.floor(rng() * stealsIAlsoNeed.length)];
    if (steals.length) return steals[Math.floor(rng() * steals.length)];
    return botGreedy(round, playerIndex, rng);
  }

  function botRandom(round, playerIndex, rng) {
    const legal = legalClaims(round, playerIndex);
    return legal[Math.floor(rng() * legal.length)];
  }

  function runBotDraft(round, botsByPlayer, seed) {
    const rng = seeded(`${seed}:botdraft`);
    while (!draftComplete(round)) {
      const player = currentPicker(round);
      const bot = botsByPlayer[player] || botGreedy;
      const claim = bot(round, player, rng);
      applyClaim(round, player, claim.donorId, claim.part);
    }
    round.results = scoreRound(round);
    return round;
  }

  root.MakeRules = Object.freeze({
    MODE_VERSION,
    PART_ORDER,
    PART_LABELS,
    PART_GROUPS,
    PICKS_PER_PLAYER,
    EXACT_POINTS,
    SUBSTITUTION_CAP,
    SUBSTITUTION_FLOOR,
    substitutionPoints,
    MASTERPIECE_BONUS,
    CONTESTED_RANGE,
    maxContestedFor,
    DONOR_LABELS,
    MANNEQUIN,
    ACCESSORY_PART,
    castDonorFrom,
    assembleCreature,
    strippedDonor,
    partSimilarity,
    buildCommissions,
    contestedCounts,
    snakeOrder,
    donorCountFor,
    buildDraftRound,
    donorById,
    commissionDonors,
    currentPicker,
    draftComplete,
    claimsOf,
    takenBy,
    legalClaims,
    applyClaim,
    scoreCommission,
    annotateThefts,
    scoreRound,
    bots: { greedy: botGreedy, spite: botSpite, random: botRandom },
    runBotDraft,
    serialize: clone
  });
})(typeof window !== "undefined" ? window : globalThis);
