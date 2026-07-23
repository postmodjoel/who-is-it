const characterRoles = [
  "architect",
  "teacher",
  "mechanic",
  "dentist",
  "accountant",
  "barista",
  "pharmacist",
  "florist",
  "electrician",
  "designer",
  "chef",
  "librarian",
  "bartender",
  "photographer",
  "lawyer",
  "nurse",
  "journalist",
  "social worker",
  "engineer",
  "gardener",
  "paramedic",
  "therapist",
  "musician",
  "pilot",
  "realtor",
  "personal trainer",
  "travel agent",
  "tailor",
  "hairdresser",
  "veterinarian"
];

function makeTags(name, secret, role) {
  const clean = (text) => text.toLowerCase().replace(/[^a-z0-9]+/g, "");
  return [`#${clean(secret).slice(0, 14)}`, `#${clean(role).slice(0, 14)}`, `#${clean(name)}energy`];
}

function generatedPortrait(seed, skin, hair, shirt, accessory, mood) {
  const bg = ["#f7d7c2", "#d9e9cf", "#cfe0f8", "#f8e7a8", "#dfd2f6", "#f5c9d2"][seed % 6];
  const bg2 = ["#fff4dd", "#eef8ee", "#eaf2ff", "#fff4bf", "#efe5ff", "#fff0f4"][seed % 6];
  const faceShape = [
    "M128 62c36 0 60 29 60 74 0 48-24 78-60 78s-60-30-60-78c0-45 24-74 60-74Z",
    "M128 60c39 0 57 32 57 76 0 49-22 78-57 78s-57-29-57-78c0-44 18-76 57-76Z",
    "M128 64c34 0 62 27 62 72 0 50-26 78-62 78s-62-28-62-78c0-45 28-72 62-72Z"
  ][seed % 3];
  const backHair = [
    `M58 159c-3-68 24-110 70-110s73 42 70 110l-26 42H84L58 159Z`,
    `M47 166c5-76 34-118 82-118 43 0 76 36 80 118l-36 33H82L47 166Z`,
    `M70 198c-22-86 4-145 58-145s80 59 58 145H70Z`,
    `M61 133c2-52 28-84 67-84s65 32 67 84c-28-17-103-17-134 0Z`
  ][seed % 4];
  const frontHair = [
    `M68 112c16-44 49-61 96-42 15 6 25 20 29 38-35-23-78-29-125 4Z`,
    `M62 128c8-55 37-78 84-69 24 4 40 21 48 52-42-18-79-12-132 17Z`,
    `M66 116c18-50 74-69 114-24-16-5-29-6-45 0-22 8-44 16-69 24Z`,
    `M70 112c24-47 89-44 116-1-32-10-79-10-116 1Z`
  ][(seed + 1) % 4];
  const mouthPath = {
    smile: "M106 168c12 12 32 12 44 0",
    flat: "M108 170c12 2 28 2 40 0",
    frown: "M108 174c12-7 28-7 40 0"
  }[mood] || "M108 170c12 2 28 2 40 0";
  const mouthDetail = mood === "smile"
    ? "<path d='M112 168c9 5 23 5 32 0' fill='none' stroke='rgba(255,255,255,.82)' stroke-width='2.4' stroke-linecap='round'/>"
    : "";
  const nosePath = seed % 2
    ? "M130 134c-4 10-7 18-12 27M118 161c5 4 15 4 20 0"
    : "M128 134c-2 10-6 19-11 27M116 161c5 3 15 3 21 0";
  const iris = ["#3a6ea5", "#5f8a4b", "#6a4b3b", "#7b5aa6"][seed % 4];
  const eyeShape = `
    <ellipse cx='102' cy='130' rx='13' ry='8' fill='#fffdf7' stroke='#171512' stroke-width='4'/>
    <ellipse cx='154' cy='130' rx='13' ry='8' fill='#fffdf7' stroke='#171512' stroke-width='4'/>
    <circle cx='102' cy='130' r='5' fill='${iris}' stroke='#171512' stroke-width='2'/>
    <circle cx='154' cy='130' r='5' fill='${iris}' stroke='#171512' stroke-width='2'/>
    <circle cx='104' cy='128' r='1.8' fill='#fff'/>
    <circle cx='156' cy='128' r='1.8' fill='#fff'/>
  `;
  const brows = seed % 3 === 0
    ? "M82 111c12-12 29-14 43-3M133 108c15-9 32-7 43 5"
    : "M83 111c15-8 29-8 42 0M134 111c15-8 29-8 42 0";
  const blush = seed % 2 ? "<ellipse cx='88' cy='151' rx='14' ry='7' fill='#f49a92' opacity='.34'/><ellipse cx='168' cy='151' rx='14' ry='7' fill='#f49a92' opacity='.34'/>" : "";
  const glasses = accessory === "glasses"
    ? "<circle cx='102' cy='130' r='18' fill='none' stroke='#171512' stroke-width='5'/><circle cx='154' cy='130' r='18' fill='none' stroke='#171512' stroke-width='5'/><path d='M120 130h16' stroke='#171512' stroke-width='5' stroke-linecap='round'/>"
    : "";
  const hat = accessory === "hat"
    ? `<path d='M72 75c13-29 94-29 108 0l-12 31H84L72 75Z' fill='${shirt}' stroke='#171512' stroke-width='5' stroke-linejoin='round'/><path d='M50 103c39-13 117-13 156 0' fill='none' stroke='#171512' stroke-width='12' stroke-linecap='round'/><path d='M73 88h110' stroke='#27231f' stroke-width='8'/>`
    : "";
  const bow = accessory === "bow"
    ? "<path d='M106 203l22-13 22 13-22 13-22-13Z' fill='#7b3f88' stroke='#171512' stroke-width='4'/>"
    : "";
  const beard = accessory === "beard"
    ? "<path d='M82 151c9 45 83 45 92 0v22c-14 35-78 35-92 0Z' fill='#2f211b' opacity='.92'/><path d='M103 168h50' stroke='#f7d7c2' stroke-width='5' stroke-linecap='round' opacity='.55'/>"
    : "";
  const earrings = accessory === "earrings"
    ? "<circle cx='60' cy='143' r='6' fill='#f2b84b' stroke='#171512' stroke-width='3'/><circle cx='196' cy='143' r='6' fill='#f2b84b' stroke='#171512' stroke-width='3'/>"
    : "";
  const svg = `
    <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 256 256'>
      <defs>
        <radialGradient id='bg${seed}' cx='50%' cy='35%' r='70%'>
          <stop offset='0' stop-color='${bg2}'/>
          <stop offset='1' stop-color='${bg}'/>
        </radialGradient>
        <linearGradient id='shirt${seed}' x1='0' x2='1' y1='0' y2='1'>
          <stop offset='0' stop-color='${shirt}'/>
          <stop offset='1' stop-color='#1c4168' stop-opacity='.45'/>
        </linearGradient>
      </defs>
      <rect width='256' height='256' rx='10' fill='url(#bg${seed})'/>
      <circle cx='128' cy='128' r='101' fill='rgba(255,255,255,.2)'/>
      <path d='M52 256c10-58 142-58 152 0Z' fill='url(#shirt${seed})' stroke='#171512' stroke-width='5'/>
      <path d='M106 195h44v38h-44Z' fill='${skin}' stroke='#171512' stroke-width='5'/>
      <path d='M83 220c22 16 68 16 90 0' fill='none' stroke='rgba(23,21,18,.25)' stroke-width='5' stroke-linecap='round'/>
      <path d='${backHair}' fill='${hair}' stroke='#171512' stroke-width='6' stroke-linejoin='round'/>
      <circle cx='63' cy='139' r='16' fill='${skin}' stroke='#171512' stroke-width='5'/>
      <circle cx='193' cy='139' r='16' fill='${skin}' stroke='#171512' stroke-width='5'/>
      <path d='${faceShape}' fill='${skin}' stroke='#171512' stroke-width='6' stroke-linejoin='round'/>
      <path d='${frontHair}' fill='${hair}' stroke='#171512' stroke-width='5' stroke-linejoin='round'/>
      ${hat}
      <path d='${brows}' fill='none' stroke='#171512' stroke-width='7' stroke-linecap='round'/>
      ${eyeShape}
      ${glasses}
      <path d='${nosePath}' fill='none' stroke='#171512' stroke-width='3.5' stroke-linecap='round' stroke-linejoin='round'/>
      <path d='M127 145c3 5 3 10 0 15' fill='none' stroke='rgba(255,255,255,.3)' stroke-width='2.4' stroke-linecap='round'/>
      ${beard}
      ${blush}
      <path d='${mouthPath}' fill='none' stroke='#171512' stroke-width='4' stroke-linecap='round'/>
      ${mouthDetail}
      ${earrings}
      ${bow}
      <path d='M72 230c26 16 86 16 112 0' fill='none' stroke='rgba(255,255,255,.22)' stroke-width='10' stroke-linecap='round'/>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const fallbackGeneratedCharacters = [
  ["mia", "Mia", "she", "short black hair", "answers carefully", "realtor", "#c98f73", "#202020", "#4f8f9f", "earrings", "smile"],
  ["noah", "Noah", "he", "brown hair", "laughs when cornered", "personal trainer", "#deb18f", "#5b3924", "#5177b8", "none", "flat"],
  ["ava", "Ava", "she", "round glasses", "keeps calm under pressure", "travel agent", "#b9785f", "#33251f", "#d66a77", "glasses", "smile"],
  ["leo", "Leo", "he", "grey hair", "chooses words slowly", "tailor", "#d3a17f", "#8f8a82", "#6d6a99", "beard", "flat"],
  ["zoe", "Zoe", "she", "red hair", "never misses a detail", "hairdresser", "#f0c5a5", "#a54832", "#309b86", "earrings", "smile"],
  ["eli", "Eli", "he", "black cap", "dodges compliments", "veterinarian", "#8d5f4b", "#1d1a17", "#d4914c", "hat", "frown"],
  ["ivy", "Ivy", "she", "straight dark hair", "gives short answers", "editor", "#e7b995", "#31221a", "#8054a8", "none", "flat"],
  ["omar", "Omar", "he", "beard and glasses", "counts exits", "security guard", "#9a6d55", "#211a16", "#2f6f82", "glasses", "flat"],
  ["ruby", "Ruby", "she", "curly hair", "can fake interest", "event planner", "#c78465", "#6d382a", "#c75050", "earrings", "smile"],
  ["max", "Max", "he", "blond hair", "talks in lists", "software developer", "#edc39d", "#d6ad4f", "#4f79a8", "none", "smile"],
  ["ella", "Ella", "she", "brown bob", "has a perfect excuse", "bank teller", "#f0c3a5", "#5a3929", "#578f58", "glasses", "flat"],
  ["ben", "Ben", "he", "dark beard", "waits before answering", "firefighter", "#bd8065", "#261b17", "#b84e3f", "beard", "smile"],
  ["sara", "Sara", "she", "grey bob", "remembers exact dates", "doctor", "#d8a887", "#868079", "#4b89a8", "none", "flat"],
  ["liam", "Liam", "he", "brown cap", "knows when people are bluffing", "delivery driver", "#e0ae88", "#493120", "#7d9b47", "hat", "frown"],
  ["nora", "Nora", "she", "black hair and earrings", "smiles before bad news", "translator", "#a66f59", "#171512", "#c96a90", "earrings", "smile"],
  ["owen", "Owen", "he", "grey beard", "sounds rehearsed", "contractor", "#e2b18d", "#6f6860", "#cc7a38", "beard", "flat"],
  ["maya", "Maya", "she", "glasses and curls", "reads every room", "psychologist", "#9f6d54", "#3f2921", "#3f9a76", "glasses", "smile"],
  ["jack", "Jack", "he", "red hair", "changes topic smoothly", "sales manager", "#f1c6a8", "#b94b31", "#4776b7", "none", "flat"],
  ["lena", "Lena", "she", "short blond hair", "keeps her phone face down", "waiter", "#e8b891", "#d2a63e", "#8e5fa8", "earrings", "frown"],
  ["ari", "Ari", "they", "dark cap", "notices tiny changes", "student", "#ba7e63", "#251d19", "#4b8d8a", "hat", "flat"],
  ["grace", "Grace", "she", "silver glasses", "takes notes quietly", "professor", "#d5a17d", "#aaa39b", "#b66e5b", "glasses", "smile"],
  ["hugo", "Hugo", "he", "black hair", "overthinks easy questions", "bus driver", "#8f604d", "#181412", "#d0a84c", "none", "frown"],
  ["isla", "Isla", "she", "brown hair and hat", "doesn't repeat herself", "shop owner", "#efc5a4", "#60402f", "#6f9c69", "hat", "smile"],
  ["miles", "Miles", "he", "beard", "has a story ready", "radio host", "#c98f70", "#432a20", "#5f73a8", "beard", "flat"]
].map(([id, name, pronouns, feature, secret, role, skin, hair, shirt, accessory, mood], index) => ({
  id,
  name,
  pronouns,
  feature,
  secret,
  role,
  image: generatedPortrait(index, skin, hair, shirt, accessory, mood),
  tags: makeTags(name, secret, role),
  variant: ""
}));

const generatedCharacters = window.faceGenerator
  ? window.faceGenerator.createCharacters(makeTags, fallbackGeneratedCharacters)
  : fallbackGeneratedCharacters;

// Illustrated location banners (1600x520) live in assets/locations/.
// Each location ships a day and a night variant; a variant is chosen per game.
// PERF-01: banners are JPEG q80 (~140KB each) — they were ~950KB PNGs, which alone made web
// deployment impractical (65MB → 10MB for the whole set). They're opaque illustrations; no alpha lost.
const LOCATION_ART_DIR = "assets/locations";

const locations = window.GameData.locations.map((loc) => ({
  ...loc,
  art: {
    day: `${LOCATION_ART_DIR}/${loc.slug}_day_banner.jpg`,
    night: `${LOCATION_ART_DIR}/${loc.slug}_night_banner.jpg`
  }
}));

const absurdPrompts = window.GameData.absurdPrompts;

const classicPrompts = window.GameData.classicPrompts;

const allCharacters = [...generatedCharacters];

const RULESETS = new Set(["whoisit", "groupthink", "whodidyoumake"]);
function normalizeRuleset(value) {
  return RULESETS.has(value) ? value : "whoisit";
}
function rulesetTitle(value = state?.ruleset) {
  const normalized = normalizeRuleset(value);
  if (normalized === "groupthink") return "WHO? DO YOU THINK?";
  if (normalized === "whodidyoumake") return "WHO? DID YOU MAKE?";
  return "WHO? IS IT?";
}

const state = {
  ruleset: "whoisit",  // "whoisit" | "groupthink" | "whodidyoumake"
  groupthink: null,
  whodidyoumake: null,
  settings: {
    prompts: true,
    mystery: true,
    locations: true,
    roles: true,
    pg: true,           // "PG mode" - the wheel only lands on kid-safe modes, no breeding/woohoo
    startModeId: "",    // blank = a plain Guess Who opener; otherwise start in the chosen mystery mode
    modePolicy: "progressive",   // progressive = current ramp, chaotic = everything, custom = explicit mode picks
    allowedModeIds: null,        // custom mode allowlist; null/empty falls back to the full registry
    roundPicker: "random",       // custom only: "random" draws from the allowlist, "manual" lets players choose each round-end
    tiers: null,        // host intensity gate: null/[] = every tier on; else the enabled tier numbers
    guessing: true,     // "Win & Loss": end a round by GUESSING the other player, X tries each
    maxGuesses: 3,      // tries per side before you're out (and the other side wins)
    lowPower: false,    // phones running warm: pause continuous animation loops + blur to cool down
    groupthinkYolo: true, // WHO? DO YOU THINK?: permanent communal cuts + survivor vote
    boardSize: 24
  },
  currentPlayer: 0,
  roundAge: 0,         // how many rounds deep this session is (0 = the plain opening round). Drives prompt "heat".
  gameMode: "local",   // "local" (pass-and-play) or "online" (room-synced)
  playMode: "team",    // "team" (3+ humans share two sides) or "solo" (3+ humans each get a seat)
  board: [],
  players: [],          // Game seats. Team mode has 2 seats; solo mode has one seat per roster entry.
  playerCount: 2,       // 2-8 humans this game
  roster: [],           // [{ name, clientId?, side, personaId? }] - humans mapped onto seats/teams.
  clientId: "",         // online: minted once per tab session so teammates on one side are distinguishable
  myRosterIndex: 0,     // online: which roster slot is me
  isHost: false,        // online: did I open this room (roster authority)
  location: null,
  locationVariant: "day",
  roomCode: "0000",
  gameSalt: "",
  abortedBabies: [],   // session-level: aborted souls that later haunt Judgement Day's purgatory
  lore: [],            // session lore ledger: one entry per finished round, feeds the "Previously…" callbacks
  stats: {},           // session tally of unlocked absurdities (avadas, divorces…) — receipt lines when > 0
  log: [],
  global: {
    mystery: null,
    hints: [[], []],
    roleMap: {},
    undo: [[], []]
  },
  headsForm: 0
};

const els = {
  locationBand: document.querySelector("#locationBand"),
  roomCode: document.querySelector("#roomCode"),
  roomStatus: document.querySelector("#roomStatus"),
  seatRoster: document.querySelector("#seatRoster"),
  secretCard: document.querySelector("#secretCard"),
  swapSeatButton: document.querySelector("#swapSeatButton"),
  questionPrompt: document.querySelector("#questionPrompt"),
  mysteryResult: document.querySelector("#mysteryResult"),
  hintShelf: document.querySelector("#hintShelf"),
  characterBoard: document.querySelector("#characterBoard"),
  opponentPanel: document.querySelector("#opponentPanel"),
  floatingSecret: document.querySelector("#floatingSecret"),
  sortSelect: document.querySelector("#sortSelect"),
  themeButton: document.querySelector("#themeButton"),
  setupButton: document.querySelector("#setupButton"),
  editorButton: document.querySelector("#editorButton"),
  almanacButton: document.querySelector("#almanacButton"),
  soundButton: document.querySelector("#soundButton"),
  soundboardButton: document.querySelector("#soundboardButton"),
  helpButton: document.querySelector("#helpButton"),
  settingSeed: document.querySelector("#settingSeed"),
  copySeedButton: document.querySelector("#copySeedButton"),
  debugEffectPicker: document.querySelector("#debugEffectPicker"),
  setupDialog: document.querySelector("#setupDialog"),
  saveSetupButton: document.querySelector("#saveSetupButton"),
  settingPrompts: document.querySelector("#settingPrompts"),
  settingMystery: document.querySelector("#settingMystery"),
  settingLocations: document.querySelector("#settingLocations"),
  settingRoles: document.querySelector("#settingRoles"),
  settingPG: document.querySelector("#settingPG"),
  settingStartMode: document.querySelector("#settingStartMode"),
  settingModePolicy: document.querySelector("#settingModePolicy"),
  settingModes: document.querySelector("#settingModes"),
  settingLowPower: document.querySelector("#settingLowPower"),
  settingGuessing: document.querySelector("#settingGuessing"),
  settingMaxGuesses: document.querySelector("#settingMaxGuesses"),
  setupRoomCode: document.querySelector("#setupRoomCode"),
};

const RULESET_CHROME_CAPABILITIES = Object.freeze({
  whoisit: Object.freeze({
    sort: true, debugEffect: true, almanac: true, editor: true, soundboard: true,
    sound: true, theme: true, settings: true, help: true, primaryAction: true,
    floatingSecret: true, hints: true
  }),
  groupthink: Object.freeze({
    sort: false, debugEffect: false, almanac: true, editor: true, soundboard: true,
    sound: true, theme: true, settings: true, help: true, primaryAction: true,
    floatingSecret: false, hints: false
  }),
  whodidyoumake: Object.freeze({
    sort: false, debugEffect: false, almanac: false, editor: false, soundboard: true,
    sound: true, theme: true, settings: true, help: true, primaryAction: false,
    floatingSecret: false, hints: false
  })
});

const RULESET_CHROME_TARGETS = {
  sort: () => els.sortSelect?.closest(".sort-wrap"),
  debugEffect: () => els.debugEffectPicker,
  almanac: () => els.almanacButton,
  editor: () => els.editorButton,
  soundboard: () => els.soundboardButton,
  sound: () => els.soundButton,
  theme: () => els.themeButton,
  settings: () => els.setupButton,
  help: () => els.helpButton,
  primaryAction: () => els.swapSeatButton?.closest(".game-bar-actions") || els.swapSeatButton,
  floatingSecret: () => els.floatingSecret,
  hints: () => els.hintShelf
};

function applyRulesetChrome(ruleset = state.ruleset) {
  const key = normalizeRuleset(ruleset);
  const capabilities = RULESET_CHROME_CAPABILITIES[key] || RULESET_CHROME_CAPABILITIES.whoisit;
  Object.entries(RULESET_CHROME_TARGETS).forEach(([name, find]) => {
    const target = find();
    if (!target) return;
    const available = capabilities[name] !== false;
    target.dataset.rulesetControl = name;
    target.hidden = !available;
    target.classList.toggle("is-capability-hidden", !available);
    target.setAttribute("aria-hidden", String(!available));
    if (!available && target.contains(document.activeElement)) document.activeElement?.blur();
  });
  document.body.dataset.rulesetChrome = key;
}

window.RULESET_CHROME_CAPABILITIES = RULESET_CHROME_CAPABILITIES;
window.applyRulesetChrome = applyRulesetChrome;

els.houseMap = document.createElement("section");
els.houseMap.id = "houseMap";
els.houseMap.className = "house-map is-hidden";
els.houseMap.setAttribute("aria-live", "polite");
els.characterBoard.parentNode.insertBefore(els.houseMap, els.characterBoard);

function iconSvg(name) {
  const common = "viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'";
  const paths = {
    moon: "<path d='M20 14.2A7.7 7.7 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2Z'/>",
    help: "<circle cx='12' cy='12' r='9.2'/><path d='M9.3 9.4a2.8 2.8 0 0 1 5.4 1c0 1.9-2.7 2.1-2.7 3.8'/><path d='M12 17.3h.01'/>",
    sun: "<circle cx='12' cy='12' r='4'/><path d='M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3'/>",
    settings: "<circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1Z'/>",
    refresh: "<path d='M20 11a8 8 0 0 0-14.9-3'/><path d='M4 4v4h4'/><path d='M4 13a8 8 0 0 0 14.9 3'/><path d='M20 20v-4h-4'/>",
    swap: "<path d='M7 7h12'/><path d='M15 3l4 4-4 4'/><path d='M17 17H5'/><path d='M9 13l-4 4 4 4'/>",
    eye: "<path d='M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z'/><circle cx='12' cy='12' r='2.8'/>",
    eyeOff: "<path d='M3 3l18 18'/><path d='M10.6 5.2A10.8 10.8 0 0 1 12 5c6 0 9.5 7 9.5 7a17.7 17.7 0 0 1-4.1 4.7'/><path d='M6.2 6.2A17.4 17.4 0 0 0 2.5 12s3.5 7 9.5 7c1.5 0 2.8-.3 4-.8'/><path d='M9.9 9.9A3 3 0 0 0 9 12a3 3 0 0 0 4.7 2.5'/>",
    spark: "<path d='M12 2.5l1.7 4.8L18.5 9l-4.8 1.7L12 15.5l-1.7-4.8L5.5 9l4.8-1.7L12 2.5Z'/><path d='M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8L19 15Z'/><path d='M5 15l.6 1.6L7.2 17l-1.6.6L5 19.2l-.6-1.6L2.8 17l1.6-.4L5 15Z'/>",
    star: "<path d='M12 3.2l2.7 5.6 6.1.9-4.4 4.3 1 6-5.4-2.9-5.4 2.9 1-6-4.4-4.3 6.1-.9L12 3.2Z'/>",
    prompt: "<path d='M4 5.5h16a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-5 4v-4H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2Z'/><path d='M9 10h.01M12 10h.01M15 10h.01'/>",
    undo: "<path d='M9 7H5v4'/><path d='M5 11a7 7 0 1 1 2 5'/>",
    clear: "<path d='M5 5l14 14'/><path d='M19 5L5 19'/>",
    hash: "<path d='M8 3L6 21'/><path d='M18 3l-2 18'/><path d='M3 8h18'/><path d='M2 16h18'/>",
    copy: "<rect x='9' y='9' width='11' height='11' rx='2'/><path d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'/>",
    check: "<path d='M20 6L9 17l-5-5'/>",
    // Toolbar
    book: "<path d='M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v13H6a2 2 0 0 0-2 2Z'/><path d='M4 19a2 2 0 0 1 2-2h14'/><path d='M9 7h7'/>",
    palette: "<path d='M12 3a9 9 0 1 0 0 18 1.6 1.6 0 0 0 1.6-1.6c0-.42-.17-.8-.43-1.08a1.55 1.55 0 0 1-.4-1.02A1.6 1.6 0 0 1 14.4 15H16a5 5 0 0 0 5-5c0-3.87-4-7-9-7Z'/><circle cx='7.6' cy='11.6' r='1.05' fill='currentColor' stroke='none'/><circle cx='9.8' cy='7.6' r='1.05' fill='currentColor' stroke='none'/><circle cx='14.3' cy='7.6' r='1.05' fill='currentColor' stroke='none'/>",
    speaker: "<path d='M4 9.5h3.3L12 6v12l-4.7-3.5H4z'/><path d='M15.5 9.2a4 4 0 0 1 0 5.6'/><path d='M18 6.9a7.5 7.5 0 0 1 0 10.2'/>",
    megaphone: "<path d='M4 10v4l10 4V6L4 10Z'/><path d='M14 9h2.5a3.5 3.5 0 0 1 0 7H14'/><path d='M6.5 15.2 8 21h3l-1.1-4.6'/>",
    // Sort-mode glyphs (the compact sort control shows the active one)
    sortlines: "<path d='M4 7h11M4 12h8M4 17h5'/><path d='M17.5 8v9'/><path d='M14.5 14l3 3 3-3'/>",
    ear: "<path d='M8 9a4 4 0 0 1 8 0c0 2.2-1.6 3.3-2.7 4.2-.85.7-1.2 1.35-1.3 2.3A2.3 2.3 0 0 1 7.4 16'/><path d='M9.6 9.4A2.4 2.4 0 0 1 14 10.7'/>",
    skin: "<circle cx='12' cy='12' r='8.5'/><path d='M12 3.5a8.5 8.5 0 0 1 0 17Z' fill='currentColor' stroke='none'/>",
    hair: "<path d='M5 13a7 7 0 0 1 14 0'/><path d='M6.6 11.4C7 9 8 6.6 8.9 5.6M12 10.6c0-2 .3-4.2.9-5.7M17.2 11.3c-.2-2-.7-3.9-1.4-5'/><path d='M5 13v3.4A2.6 2.6 0 0 0 7.6 19h8.8a2.6 2.6 0 0 0 2.6-2.6V13'/>",
    az: "<path d='M4 8l2.5-4L9 8M4.7 6.7h3.6'/><path d='M4 20h5l-5-6h5'/><path d='M14 6h6l-6 6h6'/>",
    heart: "<path d='M12 20s-7-4.5-9.2-8.3C1.3 8.9 2.7 5.6 5.8 5.6c1.9 0 3.1 1 4.2 2.3 1.1-1.3 2.3-2.3 4.2-2.3 3.1 0 4.5 3.3 3 6.1C19 15.5 12 20 12 20Z'/>",
    pin: "<path d='M12 21s6.5-6.2 6.5-11A6.5 6.5 0 1 0 5.5 10c0 4.8 6.5 11 6.5 11Z'/><circle cx='12' cy='10' r='2.4'/>",
    coin: "<circle cx='12' cy='12' r='8.5'/><path d='M12 7v10M9.6 9.3c.4-.9 1.3-1.4 2.4-1.4 1.3 0 2.4.8 2.4 1.9s-1.1 1.7-2.4 1.7-2.4.8-2.4 2 1.1 1.9 2.4 1.9c1.1 0 2-.5 2.4-1.4'/>",
    smile: "<circle cx='12' cy='12' r='8.5'/><path d='M8.4 14a4.6 4.6 0 0 0 7.2 0'/><path d='M9 9.5h.01M15 9.5h.01'/>",
    syringe: "<path d='M13.5 4.5l6 6'/><path d='M16.8 7.2l-8.9 8.9a2 2 0 0 1-.9.5L3.5 18l1.9-3.5a2 2 0 0 1 .5-.7L14.8 5.2'/><path d='M10 9l3 3M8 11l3 3'/>",
    skull: "<path d='M6 12.5a6 6 0 1 1 12 0V15a2 2 0 0 1-1.3 1.9l-.4.9a1.4 1.4 0 0 1-1.3.9H9a1.4 1.4 0 0 1-1.3-.9l-.4-.9A2 2 0 0 1 6 15Z'/><circle cx='9.3' cy='12' r='1.4' fill='currentColor' stroke='none'/><circle cx='14.7' cy='12' r='1.4' fill='currentColor' stroke='none'/><path d='M10.6 18.6v1.6M13.4 18.6v1.6'/>",
    droplet: "<path d='M12 3.5s6 6.5 6 10.5a6 6 0 0 1-12 0c0-4 6-10.5 6-10.5Z'/>",
    egg: "<path d='M12 3c3.3 0 6 4.9 6 9.1a6 6 0 0 1-12 0C6 7.9 8.7 3 12 3Z'/>",
    flame: "<path d='M12 3s5 3.9 5 9a5 5 0 0 1-10 0c0-1.7.8-3.1 1.6-4 .2 1 .9 1.7 1.8 2 .3-2.8-.4-5.3 1.6-7Z'/>",
    scales: "<path d='M12 4v15M6.5 19h11M12 5.5l-6 1M12 5.5l6 1M7 6l-3 5.5a3 3 0 0 0 6 0Zm10 0l-3 5.5a3 3 0 0 0 6 0Z'/>",
    calendar: "<rect x='4' y='5' width='16' height='16' rx='2'/><path d='M4 9.5h16M8.5 3v4M15.5 3v4'/>",
    stack: "<path d='M12 3.5l8.5 4.3-8.5 4.3-8.5-4.3L12 3.5Z'/><path d='M3.5 12.2 12 16.5l8.5-4.3M3.5 16.2 12 20.5l8.5-4.3'/>",
    angel: "<ellipse cx='12' cy='5' rx='3.6' ry='1.2'/><circle cx='12' cy='10' r='3'/><path d='M6.4 19.5a5.6 5.6 0 0 1 11.2 0'/>"
  };
  return `<span class="control-icon"><svg ${common}>${paths[name] || ""}</svg></span>`;
}

function iconButtonMarkup(icon, label) {
  return `${iconSvg(icon)}<span class="sr-only">${escapeHtml(label)}</span>`;
}

function setButtonIcon(button, icon, label) {
  if (!button) return;
  button.innerHTML = iconButtonMarkup(icon, label);
  button.setAttribute("aria-label", label);
  button.setAttribute("title", label);
}

function installStaticIcons() {
  syncThemeButton();
  setButtonIcon(els.setupButton, "settings", "Setup");
  setButtonIcon(els.almanacButton, "book", "The Almanac");
  setButtonIcon(els.editorButton, "palette", "Character editor");
  setButtonIcon(els.soundButton, "speaker", "Sound & music");
  setButtonIcon(els.soundboardButton, "megaphone", "Soundboard");
  setButtonIcon(els.helpButton, "help", "How it works");
  [els.almanacButton, els.editorButton, els.soundButton, els.soundboardButton, els.helpButton].forEach((b) => b && b.classList.add("icon-only"));
  updateSortGlyph();
  if (els.swapSeatButton) { setButtonIcon(els.swapSeatButton, "swap", "End round"); els.swapSeatButton.classList.add("end-round-btn"); els.swapSeatButton.querySelector(".ib-label")?.remove(); els.swapSeatButton.insertAdjacentHTML("beforeend", "<span class=\"er-txt\">END ROUND</span>"); }
}

function currentTheme() {
  return document.body.dataset.theme === "light" ? "light" : "dark";
}

// Bumped v1 -> v2 (2026-07) to reassert DARK as the default: the mobile theme toggle is now hidden,
// so a stale saved "light" could strand a phone in light with no way back. The bump discards the old
// saved value once, so everyone lands on the dark default; light stays available via the desktop toggle.
const THEME_KEY = "whoisit_theme_v2";
function applyTheme(theme) {
  document.body.dataset.theme = theme === "light" ? "light" : "dark";
  try {
    localStorage.setItem(THEME_KEY, currentTheme());
  } catch (error) {
    // Ignore storage issues in local previews.
  }
  syncThemeButton();
}

// Low power mode: a body flag CSS keys off (halts infinite animations + backdrop blur) and the mode
// loops check via lowPowerMode(). Re-deal after a change so the JS loop guards take effect.
function applyLowPower() {
  document.body.classList.toggle("low-power", !!(state.settings && state.settings.lowPower));
}

function motionAllowed() {
  const reduced = typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return !document.body.classList.contains("low-power") && !reduced;
}

// Desktop (>=861px) puts the board toolbar (sort/settings/etc.) INTO the sticky rail so it stays
// reachable when scrolled; mobile keeps it above the board. One DOM move, re-checked on breakpoint
// change. Grid placement is by grid-area, so append order in either parent doesn't matter.
const desktopRailMq = typeof window.matchMedia === "function" ? window.matchMedia("(min-width: 861px)") : null;
function placeDesktopToolbar() {
  const toolbar = document.querySelector(".topbar-actions");
  const panel = document.querySelector(".side-panel");
  const stageTop = document.querySelector(".stage-top");
  if (!toolbar || !panel || !stageTop) return;
  if (desktopRailMq && desktopRailMq.matches) {
    if (toolbar.parentElement !== panel) { panel.appendChild(toolbar); toolbar.classList.add("in-rail"); }
  } else if (toolbar.parentElement !== stageTop) {
    stageTop.appendChild(toolbar);   // back after the location band
    toolbar.classList.remove("in-rail");
  }
}
if (desktopRailMq) desktopRailMq.addEventListener?.("change", placeDesktopToolbar);

// Desktop: compress the sticky rail continuously as the board moves under it. The old implementation
// flipped one class at 80px and swapped the entire CSS grid, which made the question and controls
// visibly teleport. A scroll-progress value lets the stable layout interpolate instead.
function initHudCollapse() {
  let ticking = false;
  const apply = () => {
    ticking = false;
    const desktop = !desktopRailMq || desktopRailMq.matches;
    const scroll = window.scrollY || window.pageYOffset || 0;
    const progress = desktop ? Math.max(0, Math.min(1, (scroll - 18) / 142)) : 0;
    const helperProgress = Math.max(0, 1 - (progress * 2.4));
    const root = document.documentElement;
    root.style.setProperty("--hud-collapse-progress", progress.toFixed(3));
    root.style.setProperty("--hud-pad-top", `${12 - (progress * 4)}px`);
    root.style.setProperty("--hud-helper-height", `${14 * helperProgress}px`);
    root.style.setProperty("--hud-helper-opacity", String(helperProgress));
    root.style.setProperty("--hud-helper-shift", `${-4 * progress}px`);
    root.style.setProperty("--hud-question-size", `${1.34 - (progress * 0.39)}rem`);
    document.body.classList.toggle("hud-collapsed", desktop && progress >= 0.98);
  };
  const requestApply = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(apply);
  };
  window.addEventListener("scroll", requestApply, { passive: true });
  window.addEventListener("resize", requestApply, { passive: true });
  desktopRailMq?.addEventListener?.("change", requestApply);
  apply();
}

function syncThemeButton() {
  if (!els.themeButton) return;
  const theme = currentTheme();
  const nextLabel = theme === "dark" ? "Light mode" : "Dark mode";
  setButtonIcon(els.themeButton, theme === "dark" ? "sun" : "moon", nextLabel);
}

function toggleTheme() {
  applyTheme(currentTheme() === "dark" ? "light" : "dark");
}

function loadTheme() {
  let savedTheme = "dark";
  try {
    // One-time migration off the old project-name key; the new value wins once written.
    savedTheme = localStorage.getItem(THEME_KEY) || localStorage.getItem("lickyspits-theme") || "dark";
    localStorage.removeItem("lickyspits-theme");
  } catch (error) {
    savedTheme = "dark";
  }
  applyTheme(savedTheme);
}

// A round is now FULLY derived from its gameSalt: board, location, both secrets and the Wheel of
// Fate outcome are all deterministic hashes of it. That's what makes online sync (both clients
// derive the same round from one shared salt), refresh-resume, and shareable SEED codes possible.
function newGame(seedSalt, opts = {}) {
  state.settings = normalizeGameSettings(state.settings);
  applyRulesetChrome();
  if (state.ruleset === "whodidyoumake" && window.WhoDidYouMake) {
    return WhoDidYouMake.startSession(seedSalt, opts);
  }
  if (state.ruleset === "groupthink" && window.Groupthink) {
    return Groupthink.startSession(seedSalt, opts);
  }
  state.groupthink = null;
  state.whodidyoumake = null;
  document.body.classList.remove("ruleset-groupthink", "ruleset-whodidyoumake");
  clearMysteryEffectUI();
  // Clear a lingering round-over reveal (e.g. a remote peer dealt the next round before this client
  // clicked NEXT ROUND). The pre-round team reveal is created later and is excluded here.
  document.querySelectorAll(".round-reveal:not(.team-reveal)").forEach((el) => el.remove());
  // Sort choice persists across rounds (rebuildSortOptions drops it only if the new mode can't do it).
  // The board draws from the procedurally generated faces.
  const pool = generatedCharacters;
  const boardSize = Math.min(state.settings.boardSize, pool.length);
  state.gameSalt = seedSalt || `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  if (!opts.resume) state.headsForm = 0;
  state.board = buildBoard(pool, boardSize);
  state.location = state.settings.locations ? locations[stableHash(`${state.gameSalt}:loc`) % locations.length] : null;
  state.locationVariant = stableHash(`${state.gameSalt}:var`) % 2 ? "night" : "day";
  // The online ROOM is fixed for the whole session (set when hosting/joining) - do NOT re-derive it
  // from each round's salt, or every new round would move rooms and the peer would miss the deal.
  // Local mode just needs a display code, so it can track the salt.
  if (state.gameMode !== "online") state.roomCode = String((stableHash(state.gameSalt) % 9000) + 1000);
  assignRosterTeams({ preserveExisting: opts.resume || opts.preserveRosterSides });   // salt is final now; derive teams/seats
  if (state.roster && state.roster.length) state.playerCount = state.roster.length;
  const takenSecrets = new Set();
  const seats = gameSeatCount();
  state.players = Array.from({ length: seats }, (_, index) => makePlayer(index, takenSecrets));
  assignRosterPersonas(takenSecrets);   // 3+ players: everyone gets a board character to BE this round
  state.currentPlayer = clampSeatIndex(state.mySeat || 0);
  state.log = [];
  state.global.hints = Array.from({ length: seats }, () => []);
  state.global.undo = Array.from({ length: seats }, () => []);
  state.global.roleMap = {};
  state.board.forEach((character, index) => {
    state.global.roleMap[character.id] = state.settings.roles ? characterRoles[index % characterRoles.length] : character.role;
  });
  // The very FIRST round of any fresh game is plain, ordinary Guess Who - no effect, no wheel spin,
  // no sort. The strangeness only creeps in from round two onward.
  const plainRound = opts.first === true;
  state.plainRound = plainRound;
  // Track how many rounds deep we are so prompts can escalate in heat (mild -> medium -> feral).
  // The opening round resets it; every fresh deal after that ages the session. Resume keeps the
  // saved value (it's restored before newGame's applyResume path).
  if (!opts.resume) state.roundAge = plainRound ? 0 : (state.roundAge || 0) + 1;
  // The wheel outcome is picked from the no-repeat bag now, so the "start" message can carry it
  // (a remote client's own bag may disagree - the dealer's pick wins).
  state.wheelPick = plainRound ? null : (opts.effectId !== undefined ? opts.effectId : (state.settings.mystery ? wheelTargetFromBag() : null));
  // Networking only runs in ONLINE mode. Local (pass-and-play) never touches the channel.
  if (state.gameMode === "online") {
    netConnect();   // no-op if already on this room's socket (won't drop the peer)
    // Announce the new round to the peer, UNLESS the lobby's START handler already sent it.
    if (!opts.remote && !opts.announced) {
      state.lastStartSentAt = Date.now();   // marks us a live dealer for the crossing-starts tie-break
      netSend("start", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick, roster: rosterForWire(), playerCount: state.playerCount, playMode: state.playMode, ruleset: state.ruleset });
    }
  }
  resetGuessState();
  drawPrompt();
  addLog("New game dealt. Nobody looks trustworthy.");
  render();
  replayBrand();   // WHO? / IS IT? slides back in for the fresh round
  stopOpponentSim();
  if (opts.resume) return;   // resume path applies the effect itself (silently, no wheel animation)
  // Opening round of a fresh game: a swirling "new dimension" warp fades in over the freshly-dealt
  // board (not the joiner's throwaway deal). Every later round just deals normally.
  if (plainRound && !opts.silentEffect) showDimensionWarp();
  // The rest of the round setup (plain deal / joiner throwaway / wheel spin) is unchanged from the
  // two-player build. For 3+ players we just show a brief team-reveal first, then run it.
  const proceed = () => {
    // The first round: skip the roulette entirely - it just looks like a normal game of Guess Who.
    if (plainRound) { render(); return; }
    // A joiner deals a throwaway round just to populate the UI - no wheel, no opponent sim; the host's
    // sync will replace it in a moment.
    if (opts.silentEffect) {
      if (state.settings.mystery && state.wheelPick) applyMysteryEffect(state.wheelPick);
      render();
      return;
    }
    // The Wheel of Fate spins at the start of the round to pick the chaos mode BOTH seats will share.
    // The landing spot is a hash of the salt, so every client's wheel lands on the SAME mode.
    // Roughly every third round a "PREVIOUSLY, IN THIS UNIVERSE…" callback plays first — unless the
    // wheel bag just completed a full lap, in which case the SEASON FINALE takes the slot.
    if (state.settings.mystery) {
      const preShow = (go) => {
        if (state.pendingFinale) { const s = state.pendingFinale; state.pendingFinale = null; showSeasonFinale(s, go); }
        else maybeShowLoreCallback(go);
      };
      preShow(() => spinModeRoulette((id) => {
        if (id) {
          const eff = MysteryModes.byId(id);
          applyMysteryEffect(id);
          if (eff) {
            if (typeof playEffectAnnouncement === "function") playEffectAnnouncement(eff.name);
            showMysteryAnnouncement(eff.name, eff.exampleQuestion);
            addLog(`Wheel of Fate landed on "${eff.name}" - shared by both seats.`);
          }
        } else {
          drawPrompt();
        }
        render();
        scheduleSave();
      }));
    }
    scheduleSave();
  };
  // 3+ players: announce teams/solo seats before the wheel/plain deal (never on resume). 2p is unchanged.
  if (rosterTeamMode()) showTeamReveal(proceed);
  else if (rosterSoloMode()) showSoloReveal(proceed);
  else proceed();
}

function makePlayer(index, taken) {
  // Deterministic per seat (both online clients agree), but collision-FREE: seat 0 takes its hashed
  // index; a later seat whose hash lands on a taken index walks forward until it finds a free one, so
  // two seats never share the same secret.
  let idx = stableHash(`${state.gameSalt}:secret:${index}`) % state.board.length;
  if (taken) { while (taken.has(idx)) idx = (idx + 1) % state.board.length; taken.add(idx); }
  return {
    name: `Seat ${String.fromCharCode(65 + index)}`,
    pname: rosterPname(index),
    secretId: state.board[idx].id,
    eliminated: new Set(),
    mysteryUsed: false,
    secretVisible: true
  };
}

// ===================== Roster / teams / solo seats (2-8 humans) =====================
// Team mode keeps the original two-side engine: humans are mapped onto TEAM A / TEAM B and share a
// secret + board state. Solo mode turns every human into their own seat with their own secret and
// crossed-off board state. A two-player game is always effectively solo/classic even if playMode is
// still "team" in saved state.
const SIDE_COUNT = 2, MIN_PLAYERS = 2, MAX_PLAYERS = 12;
const BOARD_SIZES = [18, 24, 30, 36];   // playable board sizes offered in setup (capped to the generated pool)
const RESERVED_PLAYER_NAMES = new Set(["guest", "host"]);

function cleanPlayerName(value) {
  return String(value == null ? "" : value).replace(/\s+/g, " ").trim().slice(0, 16);
}
function isValidPlayerName(value) {
  const name = cleanPlayerName(value);
  return !!name && !RESERVED_PLAYER_NAMES.has(name.toLowerCase());
}
function rosterSoloMode() { return state.playMode === "solo" && !!(state.roster && state.roster.length > 2); }
function rosterTeamMode() { return state.playMode !== "solo" && !!(state.roster && state.roster.length > 2); }
function gameSeatCount() { return rosterSoloMode() ? Math.max(MIN_PLAYERS, state.roster.length) : SIDE_COUNT; }
function clampSeatIndex(index) {
  const max = Math.max(0, (state.players && state.players.length ? state.players.length : gameSeatCount()) - 1);
  const n = Number(index);
  return Number.isFinite(n) ? Math.max(0, Math.min(max, Math.floor(n))) : 0;
}
function ensureSeatArrays(count = gameSeatCount()) {
  state.global.hints = Array.from({ length: count }, (_, i) => state.global.hints[i] || []);
  state.global.undo = Array.from({ length: count }, (_, i) => state.global.undo[i] || []);
}
// The client id is a per-TAB identity that survives refresh (sessionStorage): an accidental reload
// reconnects on the same id so the host reseats the returning player instead of duplicating them -
// while two tabs in one browser stay two distinct online clients (the documented BroadcastChannel
// story in net.js, and how local multi-tab testing works). localStorage would merge every tab into
// one identity.
const CLIENT_ID_KEY = "whoisit_client_v1";
function ensureClientId() {
  if (!state.clientId) {
    try { state.clientId = sessionStorage.getItem(CLIENT_ID_KEY) || ""; } catch (e) { /* fine */ }
  }
  if (!state.clientId) {
    state.clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    try { sessionStorage.setItem(CLIENT_ID_KEY, state.clientId); } catch (e) { /* fine */ }
  }
  return state.clientId;
}
// Build a clean roster of {name} from a count + a names array/object. UI entry points validate names
// before this runs; the fallback only protects old saves / hand-called helpers from exploding.
function normalizeRoster(count, names) {
  const n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count | 0));
  const out = [];
  for (let i = 0; i < n; i++) {
    const raw = Array.isArray(names) ? names[i] : (names && names[i]);
    const nm = cleanPlayerName(raw);
    out.push({ name: nm || `Player ${i + 1}` });
  }
  return out;
}
// Deterministic team split from the salt: identical on every client (same salt + same roster order).
// Writes `side` onto each roster entry. Team mode writes 0|1; solo mode writes the player's own seat.
// Re-runs every round so teams rotate, except snapshot/resume can preserve a mid-round late-join split.
function assignRosterTeams(options = {}) {
  const roster = state.roster || [];
  const n = roster.length;
  if (n === 0) return;
  if (rosterSoloMode()) { roster.forEach((r, i) => { r.side = i; }); return; }
  if (n <= SIDE_COUNT) { roster.forEach((r, i) => { r.side = i < SIDE_COUNT ? i : 1; }); return; }
  if (options.preserveExisting && roster.every((r) => r.side === 0 || r.side === 1)) return;
  const order = roster.map((_, i) => i).sort((a, b) =>
    stableHash(`${state.gameSalt}:team:${a}:${roster[a].name}`) - stableHash(`${state.gameSalt}:team:${b}:${roster[b].name}`)
  );
  const base = Math.floor(n / 2);                              // even → balanced; odd → one side gets the extra
  const bigSide = stableHash(`${state.gameSalt}:teambig`) % 2; // which side gets the extra, derived from the salt
  const size0 = bigSide === 0 ? n - base : base;               // n - base === ceil(n/2)
  order.forEach((rosterIdx, pos) => { roster[rosterIdx].side = pos < size0 ? 0 : 1; });
}
function teamMembers(side) { return (state.roster || []).filter((r) => r.side === side); }
function assignSeatForJoiningRosterIndex(index) {
  const roster = state.roster || [];
  const r = roster[index];
  if (!r) return;
  if (rosterSoloMode()) { roster.forEach((entry, i) => { entry.side = i; }); return; }
  if (roster.length <= SIDE_COUNT) { roster.forEach((entry, i) => { entry.side = i < SIDE_COUNT ? i : 1; }); return; }
  const counts = [0, 0];
  roster.forEach((entry, i) => {
    if (i === index) return;
    if (entry.side === 0 || entry.side === 1) counts[entry.side] += 1;
  });
  r.side = counts[0] <= counts[1] ? 0 : 1;
}
function takenSecretIndexesFromPlayers() {
  const taken = new Set();
  (state.players || []).forEach((player) => {
    const idx = state.board.findIndex((c) => c.id === player.secretId);
    if (idx >= 0) taken.add(idx);
  });
  return taken;
}
function addMidGameRosterSeat(index) {
  assignSeatForJoiningRosterIndex(index);
  if (!state.board.length || !state.players.length) return;
  if (rosterSoloMode()) {
    const targetCount = gameSeatCount();
    const taken = takenSecretIndexesFromPlayers();
    for (let i = 0; i < targetCount; i++) {
      if (!state.players[i]) state.players[i] = makePlayer(i, taken);
    }
    state.players.length = targetCount;
  }
  ensureSeatArrays(state.players.length || gameSeatCount());
  assignRosterPersonas(takenSecretIndexesFromPlayers());
  state.currentPlayer = clampSeatIndex(state.currentPlayer);
}
// 3+ players: every human is dealt a PERSONA - a board character that is theirs to voice and act
// for the round (rotates with the salt each round). Personas never collide with each other or with
// either team's secret, so playing your part can't leak the answer. Pure roleplay, no mechanics.
function assignRosterPersonas(takenIdx) {
  if (!rosterTeamMode()) { (state.roster || []).forEach((r) => { r.personaId = null; }); return; }
  const taken = new Set(takenIdx || []);
  state.roster.forEach((r, i) => {
    let idx = stableHash(`${state.gameSalt}:persona:${i}:${r.name}`) % state.board.length;
    while (taken.has(idx)) idx = (idx + 1) % state.board.length;
    taken.add(idx);
    r.personaId = state.board[idx].id;
  });
}
// Display label for a side: team name in 3+ games, else the human's/classic A-B label.
function teamLabel(side) {
  if (rosterSoloMode()) return (state.roster && state.roster[side] && state.roster[side].name) || `Player ${side + 1}`;
  if (rosterTeamMode()) return side === 0 ? "TEAM A" : "TEAM B";
  const rname = state.roster && state.roster[side] && state.roster[side].name;
  return rname || (state.players[side] && state.players[side].pname) || (side === 0 ? "A" : "B");
}
// pname for makePlayer: team label for 3+, roster/lobby name otherwise (preserves classic behavior).
function rosterPname(index) {
  if (rosterTeamMode()) return teamLabel(index);
  if (state.roster && state.roster[index] && state.roster[index].name) return state.roster[index].name;
  return (state.lobby && state.lobby[index]) || (state.gameMode === "online" && index === (state.mySeat || 0) ? state.pname : null);
}
function sideFromMsg(msg) { return clampSeatIndex(msg && msg.seat); }
// A wire-safe copy of the roster (names + clientIds, no derived `side`).
function rosterForWire() { return (state.roster || []).map((r) => ({ name: r.name, clientId: r.clientId, side: r.side, personaId: r.personaId })); }
// Adopt a roster broadcast by the host and locate myself in it by clientId.
function applyRosterFromMsg(msg) {
  if (!Array.isArray(msg.roster)) return;
  state.ruleset = normalizeRuleset(msg.ruleset || state.ruleset);
  applyRulesetChrome();
  if (msg.playMode === "solo" || msg.playMode === "team") state.playMode = msg.playMode;
  if (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") state.playMode = "solo";
  state.roster = msg.roster.map((r) => ({ name: cleanPlayerName(r.name) || "Player", clientId: r.clientId, side: r.side, personaId: r.personaId }));
  state.playerCount = msg.playerCount || state.roster.length;
  const mine = state.roster.findIndex((r) => r.clientId && r.clientId === state.clientId);
  if (mine >= 0) state.myRosterIndex = mine;
  if (state.inLobby) scheduleSave();   // a guest's lobby save tracks the roster too
}
// After the salt + roster are known, derive teams and set which side is mine.
function syncMySeatFromRoster() {
  if (!state.roster || !state.roster.length || !state.gameSalt) return;
  assignRosterTeams({ preserveExisting: true });
  const me = state.roster[state.myRosterIndex];
  if (me && typeof me.side === "number") state.mySeat = me.side;
}

function render() {
  if (state.ruleset === "whodidyoumake" && window.WhoDidYouMake) { WhoDidYouMake.render(); return; }
  renderLocation();
  renderRoom();
  renderSecret();
  renderHints();
  MysteryModes.renderHouseMap();
  renderBoard();
  renderMystery();
  renderPromptCard();
  if (state.ruleset === "groupthink" && window.Groupthink) Groupthink.renderPrompt();
  renderOpponentPanel();
  if (state.isObserver) { renderObserverHeader(); fitObserverBoard(); } else document.getElementById("observerBar")?.remove();
  syncActionLabel();
  // First-ever board: the manifesto shows first; the mechanic nudges follow once it's dismissed.
  // Later sessions instead open on the forecast bill (it declines to stack with the manifesto).
  if (state.ruleset === "whoisit" && maybeShowManifesto()) { maybeShowOnboarding(); maybeShowForecast(); }
}
// The primary HUD action reads "IS IT…?" in Win & Loss (it opens the guess), else "END ROUND".
function syncActionLabel() {
  if (state.ruleset === "whodidyoumake" && window.WhoDidYouMake) { WhoDidYouMake.syncAction(); return; }
  if (state.ruleset === "groupthink" && window.Groupthink) { Groupthink.syncAction(); return; }
  const txt = document.querySelector("#swapSeatButton .er-txt");
  if (!txt) return;
  const guessing = state.settings.guessing && guessTargetSeat() !== null && !state.isObserver;
  txt.textContent = guessing ? "IS IT…?" : "END ROUND";
  els.swapSeatButton.classList.toggle("is-guess", !!guessing);
}

// ===================== Board sorting =====================
// Deterministic hidden stats per character, so the board can be re-ordered by "happiness / horniness
// / close-to-death / cum count" regardless of which mode is active (WOKE-friendly).
function skinLuminance(ch) {
  const tb = window.faceGenerator && window.faceGenerator.traitBook;
  const hex = (tb && tb.skinToneHex && tb.skinToneHex[ch.traits?.skin]) || ch.traits?.skinHex || "#c88968";
  const n = parseInt(hex.replace("#", ""), 16);
  return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255);
}
function hexHueValue(hex) {
  const clean = String(hex || "#5a3d28").replace("#", "");
  const n = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  if (Number.isNaN(n)) return 0;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const d = max - min;
  let h = 0;
  if (d) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  const lum = 0.299 * r + 0.587 * g + 0.114 * b;
  return h * 1000 + lum;
}
function characterAppeal(ch) {
  const t = ch.traits || {};
  const eyeMismatch =
    Math.abs((Number(t.eyeLeftX) || 0) - (Number(t.eyeRightX) || 0)) * 4 +
    Math.abs((Number(t.eyeLeftY) || 0) - (Number(t.eyeRightY) || 0)) * 4;
  const earMismatch =
    Math.abs((Number(t.earLeftX) || 0) - (Number(t.earRightX) || 0)) * 2 +
    Math.abs((Number(t.earLeftY) || 0) - (Number(t.earRightY) || 0)) * 2;
  const browMismatch = Math.abs((Number(t.browLeftAngle) || 0) - (Number(t.browRightAngle) || 0)) * 1.8;
  const headWarp =
    Math.abs((Number(t.headScaleX) || 1) - 1) * 70 +
    Math.abs((Number(t.headScaleY) || 1) - 1) * 70 +
    Math.abs(Number(t.headTilt) || 0) * 3;
  // Grooming counts against "appeal" too: more hair reads as more to fault, and a beard is a
  // reliable mid-tier deduction (never the whole story, but it stops a big-bearded symmetric face
  // like Diego from topping the chart). Hair carries full weight; the beard is halved (mid-tier).
  const hairVolume = {
    bald: 0, cropped: 18, buzz: 18, bob: 45, messy: 50, curls: 66, locs: 74,
    longWaves: 82, bun: 62, hijab: 35
  }[t.hair] ?? 42;
  const hairPenalty =
    hairVolume * 0.9 +
    (Array.isArray(t.hairLocks) ? t.hairLocks.length * 6 : 0);
  const beardPenalty =
    ((Number(t.beardLength) || 0) * 80 +
      (Array.isArray(t.beardBlobs) ? t.beardBlobs.length * 5 : 0) +
      (["beard", "moustache"].includes(t.accessory) ? 22 : 0)) * 0.5;
  const asymmetry =
    Math.abs(Number(t.lazyEye) || 0) * 12 +
    Math.abs(Number(t.pupilX) || 0) * 6 +
    Math.abs(Number(t.pupilY) || 0) * 3 +
    Math.abs(Number(t.eyeX) || 0) * 2 +
    Math.abs(Number(t.eyeY) || 0) * 1.5 +
    eyeMismatch +
    earMismatch +
    browMismatch +
    Math.abs(Number(t.accessoryX) || 0) * 1.8 +
    Math.abs(Number(t.accessoryRot) || 0) * 0.8 +
    Math.abs(Number(t.beardX) || 0) * 2 +
    Math.abs(Number(t.moustacheX) || 0) * 2 +
    Math.abs(Number(t.moustacheY) || 0) * 1.2 +
    Math.abs(Number(t.tattooX) || 0) * 0.25 +
    Math.abs(Number(t.tattooRot) || 0) * 0.15 +
    headWarp +
    hairPenalty +
    beardPenalty +
    Math.abs((Number(t.bodyWidth) || 1) - 1) * 45 +
    Math.abs((Number(t.shoulderSlope) || 0.5) - 0.5) * 35;
  return Math.max(0, 1000 - asymmetry);
}
function hairAmount(ch) {
  const t = ch.traits || {};
  const base = {
    bald: 0, cropped: 18, buzz: 18, bob: 45, messy: 50, curls: 66, locs: 74,
    longWaves: 82, bun: 62, hijab: 35
  }[t.hair] ?? 42;
  const locks = Array.isArray(t.hairLocks) ? t.hairLocks.length * 7 : 0;
  const beard = (Number(t.beardLength) || 0) * 80 + (Array.isArray(t.beardBlobs) ? t.beardBlobs.length * 5 : 0);
  const facial = ["beard", "moustache"].includes(t.accessory) ? 25 : 0;
  return base + locks + beard + facial;
}
// A hidden, deliberately absurd "Name Appropriateness" ranking. The joke is that the game claims to
// score this at all: it's deterministic hash nonsense (with a faint "shorter name drifts higher"
// nudge so it looks opinionated), NOT a real classifier of anything about the name.
function nameAppropriateness(ch) {
  const n = String(ch.name || "");
  const base = Math.max(0, 120 - n.length * 9);
  return base + (stableHash(`${state.gameSalt || ""}:nameapp:${n.toLowerCase()}`) % 880);
}
function characterStat(ch, key) {
  if (key === "name") return ch.name;
  if (key === "nameappropriateness") return nameAppropriateness(ch);
  if (key === "skin") return skinLuminance(ch);
  if (key === "eye") return hexHueValue(ch.traits?.eyeColor || "#5a3d28");
  if (key === "ear") return Number(ch.traits?.earScale) || 1;
  if (key === "hairamount") return hairAmount(ch);
  if (key === "appeal") return characterAppeal(ch);
  if (key === "abortions") return ch.abortions || 0;
  // Where the active mode actually tracks the stat, sort by the REAL value.
  const a = state.global.mystery?.assignments?.[ch.id];
  if (a) {
    switch (key) {
      case "cum": return parseCum(a.cum) || a.cumLifetime || a.cumToday || 0;
      case "eggs": return a.barren ? -1 : (a.eggs || 0);
      case "days": return a.days || 0;
      case "cash": return a.simoleons != null ? a.simoleons : 0;
      case "match": return a.match || 0;
      case "distance": return -(a.distance || 0);              // nearer first
      case "karma": return a.karma != null ? a.karma : 0;
      case "happiness": return a.happiness != null ? a.happiness : 0;
      case "habits": return a.habits ? a.habits.length : 0;
      case "horniness": return a.horniness || 0;
      case "bodycount": return a.bodyCount || 0;
      case "deathness": return a.lifespan != null ? (10 - a.lifespan) : 0;
      case "mood": return a.mood === "red" ? 2 : a.mood === "yellow" ? 1 : 0;
      default: break;
    }
  }
  // "fuck" (fuckability) and anything the mode doesn't track fall back to a deterministic comedy stat.
  return stableHash(`${state.gameSalt}:sortstat:${key}:${ch.id}`) % 1000;
}
// Baseline visual stats every character "holds"; extra options appear only for the modes that track
// them, and the chosen sort persists across rounds unless it is not valid for the new mode.
// VC-10: uniform 'Label emoji' format across every sort (mode sorts already carry an emoji), sentence case.
const BASE_SORTS = [["eye", "Eye colour 👁"], ["skin", "Skin colour 🎨"], ["ear", "Ear size 👂"], ["hairamount", "Amount of hair 💇"], ["appeal", "General appeal ⭐"]];
function rebuildSortOptions() {
  const sel = els.sortSelect;
  if (!sel) return;
  sel.style.display = "";
  const openingRound = state.roundAge === 0;
  // Default = "Sort by…" (empty key) which leaves the board in its dealt/random order. The named
  // sorts follow.
  const opts = openingRound
    ? [["", "Sort by…"], ...BASE_SORTS]
    : [["", "Sort by…"], ...BASE_SORTS, ...MysteryModes.modeSorts(state.global.mystery?.id)];
  // Hidden host-only sort: only surfaces once the debug picker is unlocked.
  if (document.body.classList.contains("debug-mode")) opts.push(["nameappropriateness", "Name appropriateness 🔤"]);
  if (!opts.some((o) => o[0] === state.sortKey)) state.sortKey = "";   // fall back to board order, not the first named sort
  sel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  sel.value = state.sortKey;
  updateSortGlyph();
}
// The compact sort control shows a glyph for the ACTIVE sort (an ear when sorted by ear size, etc.),
// falling back to the generic sort-lines icon for board order or any mode sort without its own glyph.
const SORT_GLYPH_ICON = {
  // base appearance sorts
  eye: "eye", skin: "skin", ear: "ear", hairamount: "hair", appeal: "star",
  name: "az", nameappropriateness: "az",
  // mode-specific sorts (every key any mode registers in its `sorts` array)
  match: "heart", distance: "pin", cash: "coin", mood: "smile", habits: "syringe",
  deathness: "skull", cum: "droplet", eggs: "egg", horniness: "flame", bodycount: "stack",
  karma: "scales", happiness: "smile", days: "calendar", abortions: "angel"
};
function updateSortGlyph() {
  const holder = document.querySelector(".sort-glyph");
  if (!holder) return;
  holder.innerHTML = iconSvg(SORT_GLYPH_ICON[state.sortKey] || "sortlines");
}

function sortedBoard() {
  const key = state.sortKey;
  const modeSorted = !key ? MysteryModes.defaultSortedBoard() : null;
  if (modeSorted) return modeSorted;
  if (!key) return state.board;
  const arr = [...state.board];
  if (key === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
  if (key === "skin") return arr.sort((a, b) => skinLuminance(a) - skinLuminance(b) || a.name.localeCompare(b.name));
  if (key === "eye") return arr.sort((a, b) => characterStat(a, key) - characterStat(b, key) || a.name.localeCompare(b.name));
  return arr.sort((a, b) => (characterStat(b, key) - characterStat(a, key)) || a.name.localeCompare(b.name));
}

function portraitForCharacter(character) {
  const hasTattoo = !!character?.traits?.tattooText || (Array.isArray(character?.traits?.tattoos) && character.traits.tattoos.length);
  if (!state.settings.pg || !hasTattoo || !window.faceGenerator) return character?.image || "";
  try {
    return window.faceGenerator.renderPortrait(character.seed || 0, { ...character.traits, pg: true });
  } catch (e) {
    return character?.image || "";
  }
}

function renderLocation() {
  const backdrop = document.querySelector("#locationBackdrop");
  const heroHost = document.querySelector(".game-layout");
  if (!state.location) {
    els.locationBand.className = "location-band is-off";
    if (backdrop) backdrop.style.backgroundImage = "";
    if (heroHost) heroHost.style.removeProperty("--hero-art");
    if (els.characterBoard) els.characterBoard.style.removeProperty("--board-art");
    return;
  }
  const variant = state.locationVariant === "night" ? "night" : "day";
  const artSrc = state.location.art[variant];
  // Bleed the location's colours into the page background behind everything.
  if (backdrop) backdrop.style.backgroundImage = `url('${encodeURI(artSrc)}')`;
  // Desktop hero: the same art paints ONE continuous backdrop behind the rail + location strip.
  if (heroHost) heroHost.style.setProperty("--hero-art", `url('${encodeURI(artSrc)}')`);
  // The board shows the banner at the top and fades into a colour sampled from the banner's bottom.
  if (els.characterBoard) {
    els.characterBoard.style.setProperty("--board-art", `url('${encodeURI(artSrc)}')`);
    sampleBottomColor(artSrc, (col) => els.characterBoard.style.setProperty("--board-fade", col));
  }
  const loc = MysteryModes.decorateLocation({
    location: state.location,
    variant,
    artSrc,
    name: state.location.name,
    description: state.location.prompt,
    eyebrow: `Location · ${variant === "night" ? "Night" : "Day"}`,
    stamp: state.location.stamp,
    classes: []
  });
  const modeClasses = (loc.classes || []).map((className) => ` ${className}`).join("");
  els.locationBand.className = `location-band is-${variant}${modeClasses}`;
  els.locationBand.innerHTML = `
    <div class="location-photo" style="background-image:url('${encodeURI(artSrc)}')" role="img" aria-label="${escapeHtml(state.location.name)}, ${variant}"></div>
    <div class="location-scrim"></div>
    ${loc.rainbowHtml || ""}
    <div class="location-overlay">
      <div class="location-copy">
        <p class="eyebrow">${escapeHtml(loc.eyebrow)}</p>
        <h2>${loc.titlePrefixHtml || ""}${escapeHtml(loc.name)}</h2>
        <p>${escapeHtml(loc.description)}</p>
      </div>
      <div class="location-stamp">${escapeHtml(loc.stamp)}</div>
    </div>
  `;
}

function renderRoom() {
  if (state.ruleset === "groupthink" && window.Groupthink) { Groupthink.renderRoom(); return; }
  const online = state.gameMode === "online";
  document.body.classList.toggle("mode-online", online);
  document.body.classList.toggle("mode-solo", rosterSoloMode());
  document.body.classList.toggle("mode-team", rosterTeamMode());
  els.roomCode.innerHTML = `${iconSvg("hash")}<span>${escapeHtml(state.roomCode)}</span>`;
  els.roomCode.setAttribute("aria-label", `Room ${state.roomCode}`);
  els.roomStatus.textContent = "";
  els.seatRoster.innerHTML = "";
  if (online) {
    // ONLINE: no seat toggle (you only ever control your own side). Instead, a big shareable room
    // number so a friend can JOIN it, plus a live connection status. In 3+ games, also show my team.
    els.seatRoster.className = "seat-roster online-room";
    const teamLine = rosterTeamMode()
      ? `<p class="or-team">${escapeHtml(teamLabel(state.mySeat || 0))} — ${teamMembers(state.mySeat || 0).map((m) => escapeHtml(m.clientId && m.clientId === state.clientId ? "you" : m.name)).join(", ")}</p>`
      : rosterSoloMode()
        ? `<p class="or-team">Solo — ${escapeHtml(teamLabel(state.mySeat || 0))}</p>`
      : "";
    const connected = Math.max(0, (state.roster || []).length - 1);
    const statusText = connected
      ? `${connected} friend${connected === 1 ? "" : "s"} connected`
      : "Waiting for friends to join";
    els.seatRoster.innerHTML = `
      <div class="or-code"><span class="or-word">Room</span> <span class="or-num">#${escapeHtml(state.roomCode)}</span> <button type="button" class="or-copy" title="Copy room number" aria-label="Copy room number">${iconSvg("copy")}</button></div>
      ${teamLine}
      <p class="or-status ${connected ? "is-connected" : "is-waiting"}"><span class="or-dot" aria-hidden="true"></span><span>${escapeHtml(statusText)}</span></p>`;
    const copyBtn = els.seatRoster.querySelector(".or-copy");
    if (copyBtn) copyBtn.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(state.roomCode).catch(() => {});
      copyBtn.innerHTML = iconSvg("check");
      copyBtn.classList.add("is-copied");
      setTimeout(() => { copyBtn.innerHTML = iconSvg("copy"); copyBtn.classList.remove("is-copied"); }, 900);
    });
    return;
  }
  // LOCAL: one joined segmented toggle, the active side lit. Tap a half (or the ⇄ badge) to hand off
  // the device. In 3+ games the two halves are TEAMS (with member names); in 2p it's the classic pill.
  const soloMode = rosterSoloMode();
  els.seatRoster.className = "seat-roster seat-pill" + (rosterTeamMode() ? " seat-teams" : "") + (soloMode ? " seat-solos" : "");
  const teamMode = rosterTeamMode();
  const count = state.players.length || gameSeatCount();
  els.seatRoster.innerHTML = Array.from({ length: count }, (_, i) => {
    const active = i === state.currentPlayer;
    const label = teamMode ? teamLabel(i) : (state.players[i].pname || (i === 0 ? "A" : "B"));
    const sub = teamMode ? `<span class="seat-sub">${teamMembers(i).map((m) => {
      const p = m.personaId ? characterById(m.personaId) : null;
      return `${escapeHtml(m.name)}${p ? ` <i class="seat-as">as ${escapeHtml(p.name)}</i>` : ""}`;
    }).join("<br>")}</span>` : "";
    return `<button type="button" class="seat-half ${active ? "active" : ""}" data-seat="${i}">
        <span class="seat-glyph">${active ? "YOU" : escapeHtml(label)}</span>${sub}
      </button>`;
  }).join("") + `<button type="button" class="seat-swap" data-seat="${(state.currentPlayer + 1) % count}" aria-label="${teamMode ? "Swap team" : "Swap turn"}">⇄</button>`;
  els.seatRoster.querySelectorAll(".seat-half, .seat-swap").forEach((b) => b.addEventListener("click", () => {
    const prev = state.currentPlayer;
    const next = clampSeatIndex(b.dataset.seat);
    if (next === prev) return;
    state.currentPlayer = next;
    // Hand-off: the incoming player's face starts hidden so they tap to reveal in private,
    // rather than the previous player's secret flashing to whoever grabs the device next.
    if (state.players[next]) state.players[next].secretVisible = false;
    drawPrompt();   // fresh question for the incoming player - the deck moves with the hand-off
    render();
    // Slide the fresh side across in the direction of travel, so the swap reads as a hand-off.
    slideSideHandoff(next > prev ? "fwd" : "back");
  }));
}

// Local hand-off: replay the motion on the seat control first, with a small supporting secret-card slide.
function slideSideHandoff(dir) {
  if (!motionAllowed()) return;
  const seat = document.querySelector(".seat-roster.seat-pill");
  const secret = document.querySelector(".side-you");
  const seatClass = dir === "back" ? "seat-swap-back" : "seat-swap-fwd";
  const secretClass = dir === "back" ? "seat-secret-back" : "seat-secret-fwd";
  if (seat) {
    seat.classList.remove("seat-swap-fwd", "seat-swap-back");
    void seat.offsetWidth;                    // restart the animation even on rapid taps
    seat.classList.add(seatClass);
  }
  if (secret) {
    secret.classList.remove("seat-secret-fwd", "seat-secret-back");
    void secret.offsetWidth;
    secret.classList.add(secretClass);
  }
}

function renderSecret(opts = {}) {
  if (state.ruleset === "groupthink" && window.Groupthink) { Groupthink.renderSelectionTray(); return; }
  // Observer / TV display has no secret to reveal - it just shows the board neutrally.
  if (state.isObserver) { if (els.secretCard) els.secretCard.innerHTML = ""; return; }
  const player = currentPlayer();
  const secret = characterById(player.secretId);
  const motionClass = motionAllowed() && opts.motion ? ` secret-${opts.motion}` : "";
  if (!player.secretVisible) {
    // Keep the full card footprint (same size as the revealed profile) - just a censored tile.
    els.secretCard.className = `secret-card character-card is-hidden${motionClass}`;
    els.secretCard.removeAttribute("style");
    els.secretCard.title = "Tap to reveal your face";
    els.secretCard.innerHTML = `
      <div class="portrait-wrap"><div class="secret-hidden-tile"><span class="sht-q">?</span></div></div>
      <div class="card-plate"><h3>Face hidden</h3><p class="card-hint">tap to reveal</p></div>`;
    updateFloatingSecret(secret, false);
    return;
  }
  updateFloatingSecret(secret, true);
  // Your own card is the SAME as a board card - full mode dossier (orgy stats, Yu-Gi-Oh info, disease
  // sheet, badges, corner art, portrait swaps). A media query compacts it to face+name on phones.
  const m = state.global.mystery ? getMysteryCardData(secret) : {};
  els.secretCard.className = `secret-card character-card ${secret.variant || ""} ${m.cardClass || ""}${motionClass}`.trim();
  const bg = secret.traits?.background || "#cdd6e0";
  els.secretCard.setAttribute("style", `--secret-bg:${bg};${m.style || ""}`);
  const portraitSrc = m.image || portraitForCharacter(secret);
  els.secretCard.innerHTML = `
    <div class="portrait-wrap">
      <img src="${portraitSrc}" alt="${escapeHtml(secret.name)}">
      ${m.cornerHtml || ""}
    </div>
    <div class="card-plate">
      <h3>${displayName(secret)}</h3>
      ${m.secretExtraHtml || ""}
      <div class="card-meta">${m.html || ""}</div>
    </div>
  `;
  MysteryModes.afterRenderSecret({ card: els.secretCard, character: secret, data: m });
  els.secretCard.title = "Tap to hide your face";
}

// A compact "you are" reminder (head + name) that pins to the top on mobile once the real secret card
// scrolls out of view, so you never lose track of your own character mid-game.
function updateFloatingSecret(secret, visible) {
  const fs = els.floatingSecret;
  if (!fs || !secret) return;
  const img = fs.querySelector("img");
  const name = fs.querySelector(".fs-name");
  const m = state.global.mystery ? getMysteryCardData(secret) : {};
  if (visible) {
    img.src = m.image || portraitForCharacter(secret);
    img.style.visibility = "visible";
    name.textContent = displayName(secret);
    fs.style.setProperty("--secret-bg", secret.traits?.background || "#cdd6e0");
  } else {
    img.style.visibility = "hidden";
    name.textContent = "Face hidden";
    fs.style.removeProperty("--secret-bg");
  }
}

// Pin the floating secret once the sidebar's "You are" block scrolls past the top (mobile only via CSS).
function wireFloatingSecret() {
  const anchor = document.querySelector(".side-you");
  if (!anchor || !els.floatingSecret || !("IntersectionObserver" in window)) return;
  const obs = new IntersectionObserver(
    ([entry]) => { els.floatingSecret.classList.toggle("is-stuck", !entry.isIntersecting); },
    { threshold: 0, rootMargin: "0px 0px 0px 0px" }
  );
  obs.observe(anchor);
}

function collectBoardCardRects() {
  const rects = new Map();
  if (!els.characterBoard) return rects;
  els.characterBoard.querySelectorAll("[data-id]").forEach((card) => {
    rects.set(card.dataset.id, card.getBoundingClientRect());
  });
  return rects;
}

function animateBoardReorder(beforeRects) {
  if (!beforeRects || !beforeRects.size || !motionAllowed()) return;
  const cards = [...els.characterBoard.querySelectorAll("[data-id]")];
  cards.forEach((card) => {
    const before = beforeRects.get(card.dataset.id);
    if (!before || typeof card.animate !== "function") return;
    const after = card.getBoundingClientRect();
    const dx = before.left - after.left;
    const dy = before.top - after.top;
    if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
    card.classList.add("is-reordering");
    try {
      const anim = card.animate(
        [
          { transform: `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px)` },
          { transform: "translate(0, 0)" }
        ],
        { duration: 440, easing: "cubic-bezier(0.22, 0.61, 0.36, 1)" }
      );
      const done = () => card.classList.remove("is-reordering");
      anim.addEventListener("finish", done, { once: true });
      anim.addEventListener("cancel", done, { once: true });
    } catch (e) {
      card.classList.remove("is-reordering");
    }
  });
}

function renderBoard(opts = {}) {
  const player = currentPlayer();
  const beforeRects = opts.animateReorder ? collectBoardCardRects() : null;
  rebuildSortOptions();            // sort menu adapts to the active mode (and persists the choice)
  MysteryModes.beforeRenderBoard();
  els.characterBoard.innerHTML = "";
  els.characterBoard.className = "character-board";
  els.characterBoard.setAttribute("aria-label", "Character board");
  MysteryModes.applyBoardClasses(els.characterBoard);
  if (MysteryModes.renderSpecialBoard(player)) {
    animateBoardReorder(beforeRects);
    return;
  }
  sortedBoard().forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
  MysteryModes.afterDefaultBoard(player);
  animateBoardReorder(beforeRects);
}
function renderHints() {
  if (state.ruleset === "groupthink") { els.hintShelf.innerHTML = ""; els.hintShelf.classList.remove("has-hints"); return; }
  ensureSeatArrays(state.players.length || gameSeatCount());
  const hints = state.global.hints[clampSeatIndex(state.currentPlayer)] || [];
  els.hintShelf.classList.toggle("has-hints", hints.length > 0);
  els.hintShelf.innerHTML = hints.map((hint) => `<span class="hint-pill">${escapeHtml(hint)}</span>`).join("");
}

// The per-seat mystery button is retired (the wheel picks the mode) - just keep the cue-card
// sub-line empty so no stale status text lingers under the question.
function renderMystery() {
  els.mysteryResult.textContent = "";
}
function renderPromptCard() {
  const cueCard = document.querySelector(".cue-card");
  if (!cueCard) return;
  const show = state.ruleset === "groupthink" || !!state.settings.prompts;
  cueCard.hidden = !show;
  cueCard.setAttribute("aria-hidden", show ? "false" : "true");
  if (!show) {
    els.questionPrompt.textContent = "";
    els.mysteryResult.textContent = "";
  }
}

function toggleEliminated(id) {
  if (state.isObserver) return;   // TV display is read-only - a click must not cross off a real seat
  if (state.guessMode) { makeGuess(id); return; }   // Win & Loss: a tap is an accusation, not a cross-off
  if (state.roundOver) return;
  const player = currentPlayer();
  // Clicking a downed tile flips it back up, so the toggle is its own undo.
  if (player.eliminated.has(id)) {
    player.eliminated.delete(id);
    state.justEliminated = null;
    // Mark the just-restored card so the reverse one-shot animation can play (Yu-Gi-Oh un-flip).
    state.justRestored = id;
  } else {
    player.eliminated.add(id);
    // Mark the just-eliminated card so a one-shot animation can play on it (fireworks head-pop, or
    // the Yu-Gi-Oh flip-to-back) - the board re-renders, so the effect runs from a fresh keyframe.
    state.justEliminated = id;
    state.justRestored = null;
  }
  // PERF2-02: on a PLAIN round a tap only needs to flip one card's is-down class - rebuilding all
  // 24-36 card nodes was wasted work. Any active mystery mode keeps the full re-render because its
  // per-card hooks (ygo-flip, swipe-nope, fireworks head-pop…) fire during card construction.
  const cardEl = !state.global.mystery ? document.getElementById(`card-${id}`) : null;
  if (cardEl) {
    cardEl.classList.toggle("is-down", player.eliminated.has(id));
  } else {
    renderBoard();
  }
  state.justEliminated = null;
  state.justRestored = null;
  const down = player.eliminated.has(id);
  if (down && state.global.mystery?.id === "fireworks") bumpStat("headsPopped");
  // Last words: the freshly-flipped character sometimes protests (~40%, local-only theatre).
  if (down && Math.random() < 0.4 && typeof showLastWords === "function") showLastWords(id);
  sfx(down ? "eliminate" : "revive");
  netSend("elim", { id, down });   // live-sync the cross-off
  maybeFinalTwo(player);
  scheduleSave();
}
// FUN2-02: the natural climax of every round used to pass silently. When a seat's live board drops
// to exactly TWO faces, one loud beat: banner + sting, once per seat per round (crossing back up and
// re-reaching two stays quiet - the moment only lands the first time).
const FINAL_TWO_LINES = [
  "FINAL TWO. One of these people is lying to you.",
  "FINAL TWO. Choose like your reputation depends on it.",
  "FINAL TWO. One of them has been smiling too long.",
  "FINAL TWO. The universe is holding its breath.",
  "FINAL TWO. Statistically, you're about to blow this.",
  "FINAL TWO. Look them both in the eyes first."
];
function maybeFinalTwo(player) {
  if (state.isObserver || state.roundOver || !player) return;
  const remaining = (state.board || []).length - player.eliminated.size;
  if (remaining !== 2) return;
  if (!state.finalTwoShown) state.finalTwoShown = {};
  const seat = state.gameMode === "online" ? (state.mySeat || 0) : clampSeatIndex(state.currentPlayer);
  if (state.finalTwoShown[seat]) return;
  state.finalTwoShown[seat] = true;
  const line = FINAL_TWO_LINES[stableHash(`${state.gameSalt}:ft:${seat}`) % FINAL_TWO_LINES.length];
  document.querySelector(".final-two-banner")?.remove();
  const b = document.createElement("div");
  b.className = "guess-banner final-two-banner";
  b.setAttribute("role", "status");
  b.innerHTML = `<span class="gb-text">⚡ ${escapeHtml(line)}</span>`;
  document.body.appendChild(b);
  sfx("coin");
  setTimeout(() => { b.classList.add("ft-out"); setTimeout(() => b.remove(), 400); }, 2600);
}

// Per-mode question decks - when a special mode is active, every drawn question matches its flavour.
const modePrompts = window.GameData.modePrompts;

// A prompt entry is either a plain string or a { text, heat } object. Heat is one of
// "mild" | "medium" | "feral"; untagged strings read as "mild".
function promptText(p) { return typeof p === "string" ? p : (p && p.text) || ""; }
function promptHeat(p) { return (p && typeof p === "object" && p.heat) || "mild"; }
// Which heat tiers are allowed this round. The session eases in: the first few rounds stay mild,
// then medium unlocks, then feral late. PG mode never goes past medium. Heat is a LOCAL flavour
// choice (prompts aren't synced), so no salt determinism is needed here.
function allowedHeats(age, pg) {
  // Escalate FAST: mild only for round 0, medium unlocks round 1, feral from round 3 - most sessions
  // are 3-5 rounds, so the sharpest material now actually shows up (was locked until round 7).
  const tiers = age < 1 ? ["mild"] : age < 3 ? ["mild", "medium"] : ["mild", "medium", "feral"];
  return pg ? tiers.filter((h) => h !== "feral") : tiers;
}
// No-repeat prompt bag: a prompt won't come up again until the whole current pool has cycled. Keyed
// by prompt text so it works across decks. Reset per session (startLocalGame) + when a pool empties.
function drawFromPool(pool) {
  if (!pool.length) return null;
  state.seenPrompts = state.seenPrompts instanceof Set ? state.seenPrompts : new Set();
  let fresh = pool.filter((p) => !state.seenPrompts.has(promptText(p)));
  if (!fresh.length) { pool.forEach((p) => state.seenPrompts.delete(promptText(p))); fresh = pool; }
  const chosen = pick(fresh);
  state.seenPrompts.add(promptText(chosen));
  return chosen;
}
function drawPrompt() {
  if (state.ruleset === "groupthink" && window.Groupthink) { Groupthink.renderPrompt(); return; }
  if (!state.settings.prompts) {
    els.questionPrompt.textContent = "";
    return;
  }
  const modeDeck = state.global.mystery ? modePrompts[state.global.mystery.id] : null;
  let deck = modeDeck && modeDeck.length ? modeDeck : absurdPrompts;
  const locDeck = (window.GameData && window.GameData.locationPrompts) || [];
  const classicDeck = (window.GameData && window.GameData.classicPrompts) || [];
  const roll = Math.random();
  // The banner scene leaks into ~1-in-6 draws. Plus, in the FIRST couple of rounds (before people
  // find their feet), a ~1-in-5 draw is a plain trait ELIMINATOR so beginners see how to actually
  // whittle the board down (the deduction on-ramp the dares never provided).
  if (state.location && locDeck.length && roll < 0.16) deck = locDeck;
  else if (classicDeck.length && (state.roundAge || 0) <= 1 && roll < 0.36) deck = classicDeck;
  // Escalation only kicks in for decks that actually carry heat tags; untagged decks are used whole.
  let pool = deck;
  if (deck.some((p) => p && typeof p === "object" && p.heat)) {
    const allow = allowedHeats(state.roundAge || 0, state.settings.pg);
    let filtered = deck.filter((p) => allow.includes(promptHeat(p)));
    if (!filtered.length) {
      for (const heat of ["mild", "medium", "feral"]) {
        filtered = deck.filter((p) => promptHeat(p) === heat);
        if (filtered.length) break;
      }
    }
    if (filtered.length) pool = filtered;
  }
  // {location} resolves to the current banner scene ("the Wine Cellar"); safe fallback if unset.
  // {who} stays generic ("your character") because the cue card is shared - each reader performs as
  // the secret THEY are hiding, so a name here would leak the board.
  const text = promptText(drawFromPool(pool))
    .replace(/\{location\}/g, state.location ? `the ${state.location.name}` : "this place")
    .replace(/\{who\}/g, "your character");
  els.questionPrompt.textContent = text;
}

// The question rerolls when you click the cue card itself (no auto-rotation, no separate button).
function wireCueCardClick() {
  const cueCard = document.querySelector(".cue-card");
  if (!cueCard || cueCard.dataset.wired) return;
  cueCard.dataset.wired = "1";
  cueCard.classList.add("is-clickable");
  cueCard.setAttribute("role", "button");
  cueCard.setAttribute("tabindex", "0");
  cueCard.title = "Click for a new question";
  const reroll = () => {
    if (state.ruleset === "whodidyoumake") return;   // visual mode: there are no questions to draw
    if (state.ruleset === "groupthink" && window.Groupthink) { Groupthink.rerollPrompt(); return; }
    if (!state.settings.prompts) return;
    cueCard.classList.add("is-fading");
    setTimeout(() => {
      drawPrompt();
      cueCard.classList.remove("is-fading");
    }, 220);
  };
  cueCard.addEventListener("click", reroll);
  cueCard.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); reroll(); }
  });
}

function triggerMysteryEffect(playerIndex) {
  if (state.ruleset !== "whoisit") return;
  const player = state.players[playerIndex];
  if (!state.settings.mystery || player.mysteryUsed) return;
  player.mysteryUsed = true;
  const effect = MysteryModes.randomEffect();
  if (!effect) return;
  applyMysteryEffect(effect.id);
  playEffectAnnouncement(effect.name);
  showMysteryAnnouncement(effect.name, effect.exampleQuestion);
  addLog(`${player.name} triggered a mystery effect.`);
  netSend("mode", { id: effect.id });   // the shared mode changed - the other client follows
}

function createCharacterCard(character, player) {
  const card = document.createElement("button");
  const mystery = getMysteryCardData(character);
  card.type = "button";
  card.id = `card-${character.id}`;
  card.className = `character-card ${character.variant || ""} ${mystery.cardClass || ""}`.trim();
  card.classList.toggle("is-down", !state.isObserver && player.eliminated.has(character.id));
  card.dataset.id = character.id;
  if (mystery.effectName) card.dataset.mysteryEffect = mystery.effectName;
  if (mystery.style) card.setAttribute("style", mystery.style);
  Object.entries(mystery.dataset || {}).forEach(([key, value]) => {
    card.dataset[key] = value;
  });
  const prop = mystery.propEmoji ? `<span class="prop-overlay" aria-label="${escapeHtml(mystery.primaryText)}">${mystery.propEmoji}</span>` : "";
  // Roles are hidden by default - they are not known initially and only surface once the
  // Role Reveal mystery effect is triggered (which renders them via mystery.html below).
  let portraitSrc = mystery.image || portraitForCharacter(character);
  const prepared = MysteryModes.prepareCardRender({ card, character, player, mystery, portraitSrc });
  portraitSrc = prepared.portraitSrc || portraitSrc;
  const modeOverlayHtml = prepared.overlayHtml || "";
  // Freshly-bred babies get a badge + a one-shot "born" pop; GAYBYs keep a permanent rainbow tag.
  if (character.isBaby) card.classList.add("is-baby");
  if (character.isGayby) card.classList.add("is-gayby");
  if (state.justBorn === character.id) card.classList.add("just-born");
  const babyBadge = character.isCrack
    ? `<span class="gayby-badge crack-badge" title="${escapeHtml((character.parents || []).join(" + "))}">💉 CRACK ${character.isGayby ? "GAYBY" : "BABY"}</span>`
    : character.isGayby
      ? `<span class="gayby-badge" title="${escapeHtml((character.parents || []).join(" + "))}">🏳️‍🌈 GAYBY</span>`
      : character.isBaby ? `<span class="baby-badge" title="${escapeHtml((character.parents || []).join(" + "))}">👶 NEW</span>` : "";
  // FUN2-05: characters who keep turning up as SECRETS earn a title on the board itself, so the
  // session's history is visible where you play, not just on the receipt. Plain rounds only -
  // costume modes have their own card chrome and the ribbon would fight it.
  let loreRibbon = "";
  if (!state.global.mystery) {
    const burns = (state.lore || []).reduce((n, e) => n + ((e.ids || []).includes(character.id) ? 1 : 0), 0);
    if (burns >= 2) {
      const titles = ["TWICE-BURNED", "BACK AGAIN", "THE USUAL SUSPECT", "REPEAT OFFENDER", "KNOWN TO POLICE", "CAN'T STAY AWAY"];
      loreRibbon = `<span class="lore-ribbon" title="Unmasked ${burns} times tonight">${titles[stableHash(`${character.id}:${burns}`) % titles.length]}</span>`;
    }
  }
  card.innerHTML = `
    <div class="portrait-wrap">
      <img src="${portraitSrc}" alt="${escapeHtml(character.name)}">
      ${modeOverlayHtml}
      ${prop}
      ${babyBadge}
      ${loreRibbon}
      ${state.sortKey === "abortions" ? `<span class="abortion-count" title="abortions">👼 ${character.abortions || 0}</span>` : ""}
      ${mystery.cornerHtml || ""}
    </div>
    <div class="card-plate">
      <h3>${displayName(character)}</h3>
      ${mystery.characterExtraHtml || ""}
      <div class="card-meta">${mystery.html}</div>
    </div>
  `;
  if (state.ruleset === "groupthink" && window.Groupthink) Groupthink.decorateCard(card, character);
  card.addEventListener("click", (e) => { if (e.target.closest(".dz-painscale")) return; activateCharacter(character.id); });
  if (state.ruleset !== "groupthink") wireBreedDnD(card, character.id);
  return card;
}

// One primary character action keeps mystery renderers reusable across base rulesets.
function activateCharacter(id) {
  if (state.ruleset === "whodidyoumake") return;
  if (state.ruleset === "groupthink" && window.Groupthink) { Groupthink.togglePick(id); return; }
  toggleEliminated(id);
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function displayName(character) {
  return escapeHtml(character.name);
}

function roleFor(id) {
  return state.global.roleMap[id] || characterById(id).role;
}

function currentPlayer() {
  state.currentPlayer = clampSeatIndex(state.currentPlayer);
  return state.players[state.currentPlayer] || state.players[0];
}

function characterById(id) {
  return allCharacters.find((character) => character.id === id) || state.board.find((character) => character.id === id);
}

function addLog(entry) {
  state.log.push(entry);
}

function pick(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function handleTestTextTrigger(event) {
  // The old mode-summoning words (manor/murder/ps1/...) are retired. One trigger remains: typing
  // "debug" toggles the hidden effect dropdown for testing.
  const target = event.target;
  const isTypingField = target?.matches?.("input, textarea, select, [contenteditable='true']");
  if (isTypingField || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
  testTriggerBuffer = `${testTriggerBuffer}${event.key.toLowerCase()}`.slice(-5);
  if (testTriggerBuffer.endsWith("debug")) {
    testTriggerBuffer = "";
    const on = document.body.classList.toggle("debug-mode");
    if (typeof rebuildSortOptions === "function") rebuildSortOptions();  // reveal/hide the host-only sort
    flashToast(on ? "🐞 debug picker unlocked" : "debug picker hidden");
  }
}

function buildBoard(pool, boardSize) {
  // Deterministic per-game shuffle: same salt + same pool = same board on every client.
  const shuffled = [...pool]
    .map((ch, i) => [stableHash(`${state.gameSalt}:deal:${ch.id || i}`), ch])
    .sort((a, b) => a[0] - b[0])
    .map((x) => x[1]);
  const strict = [];
  const exactOnly = [];
  shuffled.forEach((character) => {
    if (exactOnly.every((picked) => normalizeName(picked.name) !== normalizeName(character.name))) {
      exactOnly.push(character);
    }
    if (strict.every((picked) => !tooSimilarName(picked.name, character.name))) {
      strict.push(character);
    }
  });
  if (strict.length >= boardSize) return strict.slice(0, boardSize);
  const board = [...strict];
  exactOnly.forEach((character) => {
    if (board.length >= boardSize) return;
    if (board.some((picked) => picked.id === character.id)) return;
    if (board.some((picked) => normalizeName(picked.name) === normalizeName(character.name))) return;
    board.push(character);
  });
  return board.slice(0, boardSize);
}

function shuffle(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function normalizeName(name) {
  return String(name).toLowerCase().replace(/[^a-z]/g, "");
}

function tooSimilarName(left, right) {
  const a = normalizeName(left);
  const b = normalizeName(right);
  if (a === b) return true;
  if (a.slice(0, 2) === b.slice(0, 2) && Math.abs(a.length - b.length) <= 2) return true;
  return levenshteinDistance(a, b) <= 2;
}

function levenshteinDistance(a, b) {
  const rows = Array.from({ length: a.length + 1 }, (_, index) => [index]);
  for (let column = 0; column <= b.length; column += 1) {
    rows[0][column] = column;
  }
  for (let row = 1; row <= a.length; row += 1) {
    for (let column = 1; column <= b.length; column += 1) {
      const substitutionCost = a[row - 1] === b[column - 1] ? 0 : 1;
      rows[row][column] = Math.min(
        rows[row - 1][column] + 1,
        rows[row][column - 1] + 1,
        rows[row - 1][column - 1] + substitutionCost
      );
    }
  }
  return rows[a.length][b.length];
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  })[char]);
}

const aliasNames = [
  "Tax Sandra",
  "Door Kevin",
  "Laser Pam",
  "Uncle Maybe",
  "Waffle Judge",
  "Brisket Ghost",
  "Basement June",
  "Tiny Herald",
  "Mayor Oops",
  "Crisis Glen",
  "Velvet Hank",
  "Soup Angela"
];

// Tapping your own player card toggles it hidden/shown (replaces the old eye button).
function toggleSecretVisible() {
  if (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") return;
  const player = currentPlayer();
  player.secretVisible = !player.secretVisible;
  renderSecret({ motion: player.secretVisible ? "reveal" : "hide" });
}
if (els.secretCard) els.secretCard.addEventListener("click", toggleSecretVisible);

// The arrows button ends the round (you tell each other who you were in person - the reveal shows
// both secrets, then the next round deals). Seat swapping in local mode is the YOU/B chips.
els.swapSeatButton.addEventListener("click", () => {
  if (state.ruleset === "whodidyoumake" && window.WhoDidYouMake) WhoDidYouMake.primaryAction();
  else if (state.ruleset === "groupthink" && window.Groupthink) Groupthink.lockIn();
  else endRound();
});

if (els.copySeedButton) els.copySeedButton.addEventListener("click", () => {
  const code = currentSeedCode();
  if (els.settingSeed) els.settingSeed.value = code;
  if (navigator.clipboard) navigator.clipboard.writeText(code).catch(() => {});
  els.copySeedButton.textContent = "✓";
  setTimeout(() => { els.copySeedButton.textContent = "📋"; }, 900);
});
els.themeButton.addEventListener("click", toggleTheme);

// Debug: manually trigger any mystery effect from a dropdown (handy while building/balancing). The
// list respects the debug PG toggle - flip PG on and the non-PG modes vanish from the menu, so you
// can verify PG mode really does hide everything it should.
function rebuildDebugPicker() {
  if (!els.debugEffectPicker) return;
  const keep = els.debugEffectPicker.querySelector('option[value=""]');
  els.debugEffectPicker.innerHTML = "";
  if (keep) els.debugEffectPicker.appendChild(keep);
  MysteryModes.all().forEach((effect) => {
    if (state.settings.pg && !effect.pgSafe) return;
    const opt = document.createElement("option");
    opt.value = effect.id;
    opt.textContent = effect.name;
    els.debugEffectPicker.appendChild(opt);
  });
  // Debug test profiles: seed a session state so end-game flows can be tested without a 30-round night.
  const grp = document.createElement("optgroup");
  grp.label = "🧪 Test profiles";
  [["profile-endgame", "Endgame (1 mode left)"], ["profile-stats", "Stats-heavy session"]].forEach(([v, t]) => {
    const opt = document.createElement("option");
    opt.value = v; opt.textContent = t;
    grp.appendChild(opt);
  });
  els.debugEffectPicker.appendChild(grp);
}
// Seed the persistent + session state for testing the finale/receipt flows.
function applyDebugProfile(kind) {
  const seedLore = () => {
    state.lore = [
      { modeId: "disease", modeName: "Disease Mode", names: ["Felix", "Hugo"], you: "Felix" },
      { modeId: "habbo", modeName: "Habbo Hotel", names: ["Stella", "Niko"], you: "Niko" },
      { modeId: "linkedin", modeName: "LINKEDIN", names: ["Elena", "Bruno"], you: "Elena" },
      { modeId: "gallery", modeName: "THE GALLERY", names: ["Aisha", "Kai"], you: "Kai" },
      { modeId: "horny-potter", modeName: "Horny Potter", names: ["Olivia", "Leon"], you: "Olivia" },
      { modeId: "sims", modeName: "The Sims", names: ["Maya", "Tyler"], you: "Maya" }
    ];
    state.stats = { abortions: 3, divorces: 2, weddings: 1, avadas: 5, habboBans: 4, headsPopped: 7, bobbas: 23, babies: 2, gaybys: 1 };
    state.roundAge = 7;
  };
  if (kind === "profile-stats") {
    seedLore();
    flashToast("🧪 Stats profile loaded — end the round and FINISH SESSION to see the receipt.");
  } else if (kind === "profile-endgame") {
    seedLore();
    // Mark everything but ONE mode as both discovered and wheel-seen: the next spin completes
    // the lap (season finale) and the discovery counter sits at total-1.
    const ids = MysteryModes.all().map((e) => e.id);
    const allButOne = ids.slice(0, -1);
    try {
      localStorage.setItem(DISCOVERED_KEY, JSON.stringify(allButOne));
      localStorage.setItem(WHEEL_BAG_KEY, JSON.stringify(allButOne.concat([null])));
    } catch (e) { /* fine */ }
    flashToast(`🧪 Endgame profile — only "${MysteryModes.byId(ids[ids.length - 1])?.name}" left. Next round finishes the lap.`);
  }
  scheduleSave();
}
function setPgMode(on) {
  state.settings.pg = !!on;
  state.settings = normalizeGameSettings(state.settings);
  if (els.settingPG) els.settingPG.checked = state.settings.pg;
  const debugPg = document.querySelector("#debugPgToggle input");
  if (debugPg) debugPg.checked = state.settings.pg;
  rebuildDebugPicker();
  renderSetupStartModeSelect();
  buildModePicker();
}
if (els.debugEffectPicker) {
  rebuildDebugPicker();
  // Debug-only PG toggle in the topbar - lets you flip PG on/off to test it without opening setup.
  const pgWrap = document.createElement("label");
  pgWrap.id = "debugPgToggle"; pgWrap.className = "debug-pg-toggle";
  pgWrap.innerHTML = `<input type="checkbox"> PG`;
  const pgInput = pgWrap.querySelector("input");
  pgInput.checked = !!state.settings.pg;
  pgInput.addEventListener("change", () => {
    // Debug picker is already gated behind the hidden "debug" trigger, so the adult riddles are just
    // in the way here - flip PG straight off (or on) without them.
    if (pgInput.checked) {
      setPgMode(true);
      flashToast("🧒 PG mode ON — adult modes hidden");
    } else {
      setPgMode(false);
      flashToast("PG mode OFF");
    }
  });
  els.debugEffectPicker.parentNode.insertBefore(pgWrap, els.debugEffectPicker.nextSibling);
  els.debugEffectPicker.addEventListener("change", () => {
    const id = els.debugEffectPicker.value;
    els.debugEffectPicker.value = "";
    if (state.ruleset !== "whoisit") {
      clearMysteryEffectUI();
      state.wheelPick = null;
      flashToast("Mystery effects belong to WHO? IS IT?");
      render();
      return;
    }
    if (id.startsWith("profile-")) { applyDebugProfile(id); return; }
    const effect = MysteryModes.byId(id);
    if (!effect) return;
    if (currentPlayer()) currentPlayer().mysteryUsed = true;
    applyMysteryEffect(effect.id);
    state.wheelPick = effect.id;   // persists through refresh/resume like a wheel-picked mode
    playEffectAnnouncement(effect.name);
    showMysteryAnnouncement(effect.name, effect.exampleQuestion);
    addLog(`Debug: triggered "${effect.name}".`);
    // Online: the debug pick rides the existing "mode" message so every seat switches together.
    netSend("mode", { id: effect.id });
    drawPrompt();                  // cue card immediately speaks the new mode's deck
    render();
    scheduleSave();
  });
}
document.addEventListener("keydown", handleTestTextTrigger);

const setupApplyHint = document.querySelector("#setupApplyHint");
function flagSettingsChanged() { if (setupApplyHint) setupApplyHint.hidden = false; }
// Settings only take effect on the next deal - reveal the reminder once anything is touched.
els.setupDialog.addEventListener("change", (e) => { if (e.target.matches("input, select")) flagSettingsChanged(); });
els.setupDialog.addEventListener("click", (e) => { if (e.target.closest(".mode-policy-chip, .mode-check")) flagSettingsChanged(); });
let setupOpenedSeed = "";   // the seed code the field was prefilled with (set in syncSettingsToForm)
els.setupButton.addEventListener("click", () => {
  syncSettingsToForm();
  if (setupApplyHint) setupApplyHint.hidden = true;   // fresh open, nothing changed yet
  els.setupDialog.showModal();
  // <dialog> autofocuses its first focusable (the close X), painting a focus ring on every open.
  // Keyboard users regain the ring on their first Tab; pointer users never wanted it.
  try { document.activeElement.blur(); } catch (e) { /* fine */ }
});

// Quit to the main menu: refresh auto-resumes a game now, so this is the deliberate way out. Drop the
// saved game, leave any online room, and show the title.
const quitToMenuButton = document.querySelector("#quitToMenuButton");
if (quitToMenuButton) quitToMenuButton.addEventListener("click", () => {
  try { els.setupDialog.close(); } catch (e) { /* fine */ }
  clearOwnSave();
  if (state.gameMode === "online") { try { netSend("bye", {}); } catch (e) { /* fine */ } try { net && net.close(); } catch (e) { /* fine */ } }
  state.inLobby = false; state.isObserver = false;
  // Fully drop the live ruleset so a lingering state.groupthink/whodidyoumake can't have a stray render()
  // repaint its board behind the menu; the next ruleset pick sets this again.
  state.groupthink = null; state.whodidyoumake = null; state.ruleset = "whoisit";
  document.body.classList.remove("observer", "ruleset-whodidyoumake", "ruleset-groupthink");
  document.getElementById("observerBar")?.remove();
  showTitleScreen();
});

els.saveSetupButton.addEventListener("click", () => {
  state.settings.prompts = els.settingPrompts.checked;
  state.settings.mystery = true;
  state.settings.locations = els.settingLocations.checked;
  if (els.settingRoles) state.settings.roles = els.settingRoles.checked;   // Roles toggle retired; roles stay on
  if (els.settingPG) state.settings.pg = els.settingPG.checked;
  if (els.settingGuessing) state.settings.guessing = els.settingGuessing.checked;
  if (els.settingStartMode) state.settings.startModeId = els.settingStartMode.value || "";
  if (els.settingLowPower) { state.settings.lowPower = els.settingLowPower.checked; savePrefs({ lowPower: state.settings.lowPower }); applyLowPower(); }
  readModeSettingsFromForm();
  state.settings = normalizeGameSettings(state.settings);
  // A pasted seed code replays that exact round (board, location, wheel outcome, secrets). Compare
  // against the value the field opened with, NOT the live seed (settings just changed shift it).
  const code = els.settingSeed ? els.settingSeed.value.trim() : "";
  const parsed = code && code !== setupOpenedSeed.trim() ? parseSeedCode(code) : null;
  if (parsed) {
    state.settings = normalizeGameSettings({ ...state.settings, ...(parsed.g || {}) });
    newGame(parsed.s);
  } else {
    // Only the host's settings ride the wire (receiver also enforces this — see net.js).
    if (state.gameMode === "online" && (state.isHost || state.clientId === (typeof netHostId === "function" ? netHostId() : null))) {
      netSend("settings", { settings: state.settings });
    }
    scheduleSave();
    if (setupApplyHint) setupApplyHint.hidden = true;
  }
});
// Unchecking PG in the setup dialog also needs the adults-only riddle (a kid can't just flip it off).
if (els.settingPG) els.settingPG.addEventListener("change", () => {
  if (els.settingPG.checked) { setPgMode(true); return; }  // turning ON is free
  els.settingPG.checked = true;                            // hold it on until the riddle is solved
  askAdultGate((ok) => {
    setPgMode(!ok);
    renderSetupStartModeSelect();
    buildModePicker();
  });
});

// ===================== Sound & music controls =====================
// A SFX helper that plays locally AND (in online play) tells the peer to play it too, so a soundboard
// press or a game event is heard by both seats.
function sfx(name, opts) {
  if (window.Sound) window.Sound.play(name);
  if (opts && opts.shared && state.gameMode === "online") netSend("sfx", { name });
}
// Unlock the AudioContext on the very first user gesture (browsers block audio until then).
let soundUnlocked = false;
function unlockSound() { if (!soundUnlocked && window.Sound) { soundUnlocked = true; window.Sound.resume(); } }
document.addEventListener("pointerdown", unlockSound, { once: false });
// Images are decoration, not draggable payloads: without this, dragging a face ghosts the raw IMG
// (or hijacks the card's own breed drag). Elements that opt into HTML5 drag (draggable=true, e.g.
// breed-mode cards) keep working - the guard only swallows the strays.
document.addEventListener("dragstart", (e) => {
  const t = e.target;
  if (t && t.tagName === "IMG" && !(t.closest && t.closest('[draggable="true"]'))) e.preventDefault();
});
function toggleSoundPanel() {
  let panel = document.getElementById("soundPanel");
  if (panel) { panel.remove(); return; }
  if (!window.Sound) return;
  document.getElementById("soundboardPanel")?.remove();   // they share an anchor - only one at a time
  unlockSound();
  panel = document.createElement("div");
  panel.id = "soundPanel"; panel.className = "sound-panel";
  const S = window.Sound;
  const host = state.gameMode !== "online" || state.isHost;
  const trackOpts = S.trackNames().map((n, i) => `<option value="${i}" ${i === S.currentTrack() ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");
  // Settings only (FX / Music / Track). The soundboard has its own toolbar button, so this
  // panel is a small settings card, and switches/select use the shared De Stijl controls (VC-04).
  panel.innerHTML = `
    <div class="sp-head"><b>Sound</b><button type="button" class="sp-x" aria-label="close">✕</button></div>
    <label class="sp-row"><span>Sound FX</span><input type="checkbox" class="sp-master" ${S.isEnabled() ? "checked" : ""}></label>
    <label class="sp-row"><span>Music${host ? "" : " (host controls)"}</span><input type="checkbox" class="sp-music" ${S.isMusicOn() ? "checked" : ""} ${host ? "" : "disabled"}></label>
    <label class="sp-row"><span>Track</span><select class="sp-track" ${host ? "" : "disabled"}>${trackOpts}</select></label>`;
  document.querySelector(".game-stage")?.appendChild(panel) || document.body.appendChild(panel);
  panel.querySelector(".sp-x").addEventListener("click", () => panel.remove());
  panel.querySelector(".sp-master").addEventListener("change", (e) => { S.setEnabled(e.target.checked); savePrefs({ sound: e.target.checked }); if (e.target.checked) sfx("blip"); });
  const musicBox = panel.querySelector(".sp-music");
  const trackSel = panel.querySelector(".sp-track");
  const pushMusic = () => { S.setMusic(musicBox.checked); S.setTrack(Number(trackSel.value)); if (state.gameMode === "online") netSend("music", { on: musicBox.checked, track: Number(trackSel.value) }); };
  if (host) { musicBox.addEventListener("change", pushMusic); trackSel.addEventListener("change", () => { if (!musicBox.checked) musicBox.checked = true; pushMusic(); }); }
}
if (els.soundButton) els.soundButton.addEventListener("click", toggleSoundPanel);

// FUN-04: the party soundboard has its own toolbar button opening a compact grid. Both players hear
// each hit, and the shared megaphone glyph keeps it visually consistent with the rest of the chrome.
function toggleSoundboardPanel() {
  let panel = document.getElementById("soundboardPanel");
  if (panel) { panel.remove(); return; }
  if (!window.Sound) return;
  document.getElementById("soundPanel")?.remove();   // they share an anchor - only one at a time
  unlockSound();
  const S = window.Sound;
  panel = document.createElement("div");
  panel.id = "soundboardPanel"; panel.className = "sound-panel soundboard-panel";
  panel.innerHTML = `
    <div class="sp-head"><b class="sp-title">${iconSvg("megaphone")}<span>Soundboard</span></b><button type="button" class="sp-x" aria-label="close">✕</button></div>
    <div class="sp-board-label">Both players hear it</div>
    <div class="sp-board">${S.sfxNames().map((n) => `<button type="button" class="sp-fx" data-fx="${n}">${escapeHtml(n)}</button>`).join("")}</div>`;
  document.querySelector(".game-stage")?.appendChild(panel) || document.body.appendChild(panel);
  panel.querySelector(".sp-x").addEventListener("click", () => panel.remove());
  panel.querySelectorAll(".sp-fx").forEach((b) => b.addEventListener("click", () => sfx(b.dataset.fx, { shared: true })));
}
if (els.soundboardButton) {
  // Long-press the megaphone = instant BUZZER; a normal click opens/closes the grid. The buzzer
  // long-press swallows the click that follows so it doesn't also toggle the panel open.
  let sbHold = null;
  let sbFired = false;
  els.soundboardButton.addEventListener("pointerdown", () => {
    sbFired = false;
    sbHold = setTimeout(() => { sbHold = null; sbFired = true; unlockSound(); sfx("buzzer", { shared: true }); }, 500);
  });
  const cancelHold = () => { if (sbHold) { clearTimeout(sbHold); sbHold = null; } };
  els.soundboardButton.addEventListener("pointerup", cancelHold);
  els.soundboardButton.addEventListener("pointerleave", cancelHold);
  els.soundboardButton.addEventListener("click", () => { if (sbFired) { sbFired = false; return; } toggleSoundboardPanel(); });
}

const MODE_POLICY_LABELS = {
  progressive: "Progressive ramping",
  chaotic: "Chaotic mode",
  custom: "Custom"
};
const TIER_LABELS = ["Warm-up", "Spicy", "Rowdy", "Unhinged", "Feral", "Beyond"];
function allMysteryModeDefs() {
  try { return window.MysteryModes.all(); }
  catch (e) { return []; }
}
function tierCount() {
  try { return (window.MysteryModes.wheelTiers() || []).length; }
  catch (e) { return 5; }
}
function effectiveModePolicy(settings = state.settings) {
  return settings && ["progressive", "chaotic", "custom"].includes(settings.modePolicy)
    ? settings.modePolicy
    : "progressive";
}
function allMysteryModeIds() {
  return allMysteryModeDefs().map((effect) => effect.id);
}
function pgSafeModeIds() {
  try { return window.MysteryModes.pgSafeModes(); }
  catch (e) { return []; }
}
function visibleMysteryModeDefs(settings = state.settings) {
  const defs = allMysteryModeDefs();
  if (!(settings && settings.pg)) return defs;
  const safe = new Set(pgSafeModeIds());
  return defs.filter((effect) => safe.has(effect.id));
}
function normalizedStartModeId(settings = state.settings) {
  const picked = typeof (settings && settings.startModeId) === "string" ? settings.startModeId : "";
  if (!picked) return "";
  const known = new Set(allMysteryModeIds());
  if (!known.has(picked)) return "";
  if (settings && settings.pg) {
    const safe = new Set(pgSafeModeIds());
    if (!safe.has(picked)) return "";
  }
  return picked;
}
function startModeOptions(settings = state.settings) {
  return [{ id: "", name: "Guess Who" }, ...visibleMysteryModeDefs(settings)
    .slice()
    .sort((a, b) => (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name))
    .map((effect) => ({ id: effect.id, name: effect.name }))];
}
function normalizedAllowedModeIds(settings = state.settings) {
  const known = new Set(allMysteryModeIds());
  const picked = Array.isArray(settings && settings.allowedModeIds)
    ? settings.allowedModeIds.filter((id) => known.has(id))
    : [];
  const base = picked.length ? picked : [...known];
  if (settings && settings.pg) {
    const safe = new Set(pgSafeModeIds());
    const safePicked = base.filter((id) => safe.has(id));
    return safePicked.length ? safePicked : [...safe];
  }
  return base;
}
function normalizeGameSettings(raw) {
  const next = { ...state.settings, ...(raw || {}) };
  next.mystery = true;
  next.startModeId = normalizedStartModeId(next);
  next.modePolicy = effectiveModePolicy(next);
  next.allowedModeIds = normalizedAllowedModeIds(next);
  next.roundPicker = next.roundPicker === "manual" ? "manual" : "random";
  next.guessing = next.guessing !== false;
  next.maxGuesses = [1, 2, 3, 5].includes(next.maxGuesses) ? next.maxGuesses : 3;
  next.groupthinkYolo = next.groupthinkYolo !== false;
  return next;
}
function hydrateSerializedCharacter(character) {
  if (!character || typeof character !== "object") return null;
  const hydrated = JSON.parse(JSON.stringify(character));
  if (hydrated.traits && window.faceGenerator) {
    try { hydrated.image = window.faceGenerator.renderPortrait(hydrated.seed || 0, hydrated.traits); }
    catch (e) { /* keep image empty */ }
  }
  return hydrated;
}
function hydrateSavedBoard(saved) {
  if (Array.isArray(saved && saved.board) && saved.board.length > 1) {
    return saved.board.map(hydrateSerializedCharacter).filter(Boolean);
  }
  if (Array.isArray(saved && saved.boardIds) && saved.boardIds.length > 1) {
    const byId = new Map(generatedCharacters.map((c) => [c.id, c]));
    const extras = new Map(((saved && saved.babies) || []).map((baby) => [baby.id, hydrateSerializedCharacter(baby)]));
    return saved.boardIds.map((id) => extras.get(id) || byId.get(id)).filter(Boolean);
  }
  return [];
}
function mysteryModeGroups() {
  const defs = visibleMysteryModeDefs().slice().sort((a, b) => (a.tier || 99) - (b.tier || 99) || a.name.localeCompare(b.name));
  const groups = [];
  defs.forEach((effect) => {
    const index = Math.max(0, (effect.tier || 1) - 1);
    if (!groups[index]) groups[index] = { label: TIER_LABELS[index] || `Tier ${index + 1}`, items: [] };
    groups[index].items.push(effect);
  });
  return groups.filter(Boolean);
}
function renderModePolicyControls() {
  const host = els.settingModePolicy;
  if (!host) return;
  const current = effectiveModePolicy();
  host.innerHTML = "";
  [
    ["progressive", "Progressive"],
    ["chaotic", "Chaotic"],
    ["custom", "Custom"]
  ].forEach(([value, title]) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = `mode-policy-chip${current === value ? " is-on" : ""}`;
    chip.dataset.policy = value;
    chip.setAttribute("aria-pressed", current === value ? "true" : "false");
    chip.innerHTML = `<b>${escapeHtml(title)}</b>`;
    chip.addEventListener("click", () => {
      host.querySelectorAll(".mode-policy-chip").forEach((btn) => {
        const on = btn === chip;
        btn.classList.toggle("is-on", on);
        btn.setAttribute("aria-pressed", on ? "true" : "false");
      });
      syncModePickerVisibility();
    });
    host.appendChild(chip);
  });
}
function selectedModeIdsFromForm() {
  if (!els.settingModes) return normalizedAllowedModeIds();
  const selected = [...els.settingModes.querySelectorAll(".mode-check:checked")].map((box) => box.value);
  const base = selected.length ? selected : normalizedAllowedModeIds();
  if (els.settingPG?.checked) {
    const safe = new Set(pgSafeModeIds());
    const safePicked = base.filter((id) => safe.has(id));
    return safePicked.length ? safePicked : pgSafeModeIds();
  }
  return base;
}
function renderSetupStartModeSelect() {
  if (!els.settingStartMode) return;
  const selected = normalizedStartModeId();
  els.settingStartMode.innerHTML = startModeOptions().map((mode) => `
    <option value="${escapeHtml(mode.id)}">${escapeHtml(mode.name)}</option>
  `).join("");
  els.settingStartMode.value = startModeOptions().some((mode) => mode.id === selected) ? selected : "";
}
function syncHostOwnedSetupVisibility() {
  const hostOwnsModes = state.gameMode !== "online" || state.isHost;
  els.settingStartMode?.closest(".setup-mode-row")?.toggleAttribute("hidden", !hostOwnsModes);
  els.settingModePolicy?.closest(".mode-section")?.toggleAttribute("hidden", !hostOwnsModes);
  // Every GAME setting (prompts/locations/roles/PG/board/seed) is host-authoritative online: a guest
  // sees them but can't touch them (BUG-01 + NET-10). Device-local prefs (low power) stay live for all.
  const form = els.setupDialog?.querySelector(".setup-form");
  if (form) {
    form.classList.toggle("guest-locked", !hostOwnsModes);
    [els.settingPrompts, els.settingLocations, els.settingRoles, els.settingPG, els.settingSeed, els.copySeedButton]
      .forEach((el) => el && (el.disabled = !hostOwnsModes));
    els.setupDialog.querySelectorAll(".ts-size, .mode-policy-chip, .mode-check").forEach((el) => { el.disabled = !hostOwnsModes; });
    const hint = els.setupDialog.querySelector(".setup-guest-hint");
    if (!hostOwnsModes && !hint) {
      const p = document.createElement("p");
      p.className = "setup-guest-hint";
      p.textContent = "Only the host can change the game settings. Low power is yours to keep.";
      form.insertBefore(p, form.querySelector(".settings-grid"));
    } else if (hostOwnsModes && hint) hint.remove();
  }
}
function syncModePickerVisibility() {
  const policy = els.settingModePolicy?.querySelector(".mode-policy-chip.is-on")?.dataset.policy || effectiveModePolicy();
  if (els.settingModes) els.settingModes.closest(".mode-section")?.classList.toggle("is-custom", policy === "custom");
}
function buildModePicker() {
  const host = els.settingModes;
  if (!host) return;
  const selected = new Set(normalizedAllowedModeIds());
  host.innerHTML = mysteryModeGroups().map((group) => `
    <section class="mode-group">
      <div class="mode-group-head">
        <strong>${escapeHtml(group.label)}</strong>
        <small>${group.items.length} modes</small>
      </div>
      <div class="mode-check-grid">
        ${group.items.map((effect) => `
          <label class="mode-check-row">
            <input class="mode-check" type="checkbox" value="${escapeHtml(effect.id)}" ${selected.has(effect.id) ? "checked" : ""}>
            <span class="mode-check-copy">
              <b>${escapeHtml(effect.name)}</b>
            </span>
          </label>
        `).join("")}
      </div>
    </section>
  `).join("");
  syncModePickerVisibility();
}
function readModeSettingsFromForm() {
  state.settings.modePolicy = els.settingModePolicy?.querySelector(".mode-policy-chip.is-on")?.dataset.policy || "progressive";
  state.settings.allowedModeIds = selectedModeIdsFromForm();
}
// Guess-count pills (1/2/3/5) + Win&Loss toggle grey-out.
function syncGuessPills() {
  const on = state.settings.guessing !== false;
  els.settingMaxGuesses?.querySelectorAll(".gp").forEach((b) => {
    b.classList.toggle("on", Number(b.dataset.n) === state.settings.maxGuesses);
  });
  els.settingMaxGuesses?.closest(".guess-count-row")?.classList.toggle("is-off", !on);
  // FLOW2-04: Win & Loss runs on exactly TWO SIDES - two players, or any table with Team Mode on
  // (teams share one pooled guess count). Only a 3+ SOLO table can't guess; say so instead of
  // presenting live-looking switches that silently do nothing.
  const available = typeof gameSeatCount === "function" ? gameSeatCount() === 2 : true;
  const winRow = els.settingGuessing?.closest(".toggle-row");
  const countRow = els.settingMaxGuesses?.closest(".guess-count-row");
  [winRow, countRow].forEach((row) => row && row.classList.toggle("is-unavailable", !available));
  const small = winRow?.querySelector("small");
  if (small) {
    if (!small.dataset.original) small.dataset.original = small.textContent;
    small.textContent = available
      ? small.dataset.original
      : "Needs two sides: 2 players, or 3+ with Team Mode on (teams pool their guesses).";
  }
}
if (els.settingMaxGuesses) {
  els.settingMaxGuesses.addEventListener("click", (e) => {
    const b = e.target.closest(".gp");
    if (!b) return;
    state.settings.maxGuesses = Number(b.dataset.n);
    syncGuessPills();
    sfx("blip");
  });
}
if (els.settingGuessing) els.settingGuessing.addEventListener("change", () => { state.settings.guessing = els.settingGuessing.checked; syncGuessPills(); });

function syncSettingsToForm() {
  const groupthinkSetup = state.ruleset === "groupthink";
  const ancestrySetup = state.ruleset === "whodidyoumake";
  els.setupDialog?.classList.toggle("is-groupthink", groupthinkSetup);
  els.setupDialog?.classList.toggle("is-whodidyoumake", ancestrySetup);
  const setupTitle = els.setupDialog?.querySelector(".dialog-head h2");
  if (setupTitle) setupTitle.textContent = groupthinkSetup
    ? "WHO? DO YOU THINK? setup"
    : ancestrySetup ? "WHO? DID YOU MAKE? setup" : "Game setup";
  const pgHelp = els.settingPG?.closest(".toggle-row")?.querySelector("small");
  if (pgHelp) pgHelp.textContent = groupthinkSetup
    ? "Keep the judgement prompts kid-safe. The cards stay plain either way."
    : "Kid-safe: only wholesome modes, no breeding/woohoo. Nephew-approved.";
  els.settingPrompts.checked = state.settings.prompts;
  if (els.settingMystery) els.settingMystery.checked = true;
  els.settingLocations.checked = state.settings.locations;
  if (els.settingRoles) els.settingRoles.checked = state.settings.roles;
  if (els.settingPG) els.settingPG.checked = state.settings.pg;
  if (els.settingGuessing) els.settingGuessing.checked = state.settings.guessing !== false;
  syncGuessPills();
  if (els.settingLowPower) els.settingLowPower.checked = !!state.settings.lowPower;
  renderSetupStartModeSelect();
  renderModePolicyControls();
  buildModePicker();
  syncHostOwnedSetupVisibility();
  if (els.settingSeed) els.settingSeed.value = state.gameSalt ? currentSeedCode() : "";
  // Remember the seed the field was PREFILLED with. Only a seed the user actually changed counts as a
  // paste - otherwise applying settings shifts currentSeedCode() and we'd wrongly "replay" the old
  // round, undoing the very setting they just changed (e.g. intensity tiers).
  setupOpenedSeed = els.settingSeed ? els.settingSeed.value : "";
  if (els.setupRoomCode) els.setupRoomCode.textContent = state.roomCode ? `#${state.roomCode}` : "No room yet";
}

// ===================== Refresh-proof game persistence =====================
// The whole round survives a refresh: the salt re-derives the board/effect/secrets, and the save
// carries what ISN'T derivable - session babies, eliminations, seat, settings.
const GAME_SAVE_KEY = "whoisit_game_v1";
const ONLINE_GAME_SAVE_KEY = "whoisit_online_game_v1";
// Online identity is per-tab, so its refresh snapshot must be per-tab too. A shared localStorage slot
// let a guest overwrite the host's save; the next host refresh then resumed the guest or fell back to
// the title. sessionStorage survives reload but remains isolated between the BroadcastChannel tabs.
function clearOwnSave() {
  try { sessionStorage.removeItem(ONLINE_GAME_SAVE_KEY); } catch (e) { /* storage gone */ }
  try {
    const raw = localStorage.getItem(GAME_SAVE_KEY);
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.clientId && state.clientId && s.clientId !== state.clientId) return;   // not ours
    }
  } catch (e) { /* unreadable save: clearing is the safe default */ }
  try { localStorage.removeItem(GAME_SAVE_KEY); } catch (e) { /* storage gone */ }
}
let saveTimer = null;
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveGameState, 400); }
// One save shape for everything: refresh-resume, lobby rejoin, AND the host->reconnector snapshot
// sent over the wire (see the "snapshot" net message). Never fork this schema.
function buildGameSave() {
  return {
    v: 2,
    ruleset: normalizeRuleset(state.ruleset),
    groupthink: state.ruleset === "groupthink" && window.Groupthink ? Groupthink.serialize() : null,
    whodidyoumake: state.ruleset === "whodidyoumake" && window.WhoDidYouMake ? WhoDidYouMake.serialize() : null,
    salt: state.gameSalt,
    settings: state.settings,
    gameMode: state.gameMode || "local",
    playMode: state.playMode === "solo" ? "solo" : "team",
    inLobby: !!state.inLobby,   // a refresh mid-lobby rejoins the lobby, not a half-dealt round
    isObserver: !!state.isObserver,   // a TV/display refresh rejoins as a display, not a player
    pname: state.pname || "",
    mySeat: state.mySeat || 0,
    roomCode: state.roomCode,   // online: the channel isn't re-derivable for a joiner, so persist it
    currentPlayer: state.currentPlayer,
    roundAge: state.roundAge || 0,
    lore: state.lore || [],
    stats: state.stats || {},
    scoreboard: state.scoreboard || {},   // Win & Loss tally survives a refresh
    guessesLeft: state.guessesLeft || {},
    roundOver: !!state.roundOver,
    hostClaimId: state.hostClaimId || null,   // NET2-02: host-takeover authority survives refreshes
    // NET2-03: the no-repeat prompt memory (capped - old entries just become re-askable)
    seenPrompts: state.seenPrompts instanceof Set ? [...state.seenPrompts].slice(-60) : [],
    playerCount: state.playerCount || 2,
    roster: (state.roster || []).map((r) => ({ name: r.name, clientId: r.clientId, side: r.side, personaId: r.personaId })),
    clientId: state.clientId || "",
    myRosterIndex: state.myRosterIndex || 0,
    isHost: !!state.isHost,
    headsForm: Number.isFinite(state.headsForm) ? state.headsForm : 0,
    board: state.board.map(serializeCharacter),
    boardIds: state.board.map((c) => c.id),   // pin the exact deal: the pool can grow mid-round (fresh GAYBYs)
    effectId: state.global.mystery ? state.global.mystery.id : null,   // debug-picked/mystery-swapped modes survive too
    babies: state.board.filter((c) => c.isBaby || (c.isGayby && !c.persistedGayby)).map(serializeCharacter),
    abortedBabies: state.abortedBabies || [],   // purgatory souls carry across rounds this session
    players: state.players.map((p) => ({ secretId: p.secretId, eliminated: [...p.eliminated], mysteryUsed: p.mysteryUsed, secretVisible: p.secretVisible }))
  };
}
function saveGameState() {
  try {
    const save = buildGameSave();
    if (save.gameMode === "online") {
      sessionStorage.setItem(ONLINE_GAME_SAVE_KEY, JSON.stringify(save));
      // Migrate away the old shared online slot when this tab owns it, while preserving a local game.
      const legacy = JSON.parse(localStorage.getItem(GAME_SAVE_KEY) || "null");
      if (legacy?.gameMode === "online" && (!legacy.clientId || legacy.clientId === save.clientId)) localStorage.removeItem(GAME_SAVE_KEY);
    } else {
      localStorage.setItem(GAME_SAVE_KEY, JSON.stringify(save));
    }
  } catch (e) { /* storage full/blocked - play on */ }
}
function loadGameSave() {
  // A save is resumable with a salt (a dealt round) OR as a lobby rejoin (online room, no deal yet).
  try {
    const online = JSON.parse(sessionStorage.getItem(ONLINE_GAME_SAVE_KEY) || "null");
    const s = online || JSON.parse(localStorage.getItem(GAME_SAVE_KEY) || "null");
    if (!(s && (s.v === 1 || s.v === 2) && (s.salt || (s.inLobby && s.gameMode === "online" && s.roomCode)))) return null;
    // WHO? WERE YOU? retired 2026-07: its ancestry sessions have no home ruleset any more, and
    // letting them normalize into classic would resume a round with no board. Clear + explain.
    if (s.ruleset === "whowereyou") {
      try { localStorage.removeItem(GAME_SAVE_KEY); sessionStorage.removeItem(ONLINE_GAME_SAVE_KEY); } catch (e) { /* storage gone */ }
      if (typeof flashToast === "function") flashToast("The lab has reopened as WHO? DID YOU MAKE? — deal a fresh body.");
      return null;
    }
    if (s.settings) s.settings = normalizeGameSettings(s.settings);
    s.ruleset = normalizeRuleset(s.ruleset);
    if (!Number.isFinite(s.headsForm)) s.headsForm = 0;
    return s;
  } catch (e) { return null; }
}
// Collection meta: every mode the player has ever seen, persisted, shown as "N / total" on the title.
const DISCOVERED_KEY = "whoisit_discovered_v1";
function loadDiscoveredModes() {
  try { const a = JSON.parse(localStorage.getItem(DISCOVERED_KEY) || "[]"); return Array.isArray(a) ? a : []; }
  catch (e) { return []; }
}
function markModeDiscovered(id) {
  if (!id) return;
  try {
    const set = loadDiscoveredModes();
    if (!set.includes(id)) { set.push(id); localStorage.setItem(DISCOVERED_KEY, JSON.stringify(set)); }
  } catch (e) { /* storage off - meta is cosmetic */ }
}

// First-time onboarding: two one-shot nudges (the old on-screen buttons were retired, so new players
// need to be told the cue card rerolls on tap and the secret card flips on tap). Shown once ever.
const ONBOARD_KEY = "whoisit_onboarded_v1";
let onboardDone = false;
function maybeShowOnboarding() {
  if (onboardDone) return;
  try { if (localStorage.getItem(ONBOARD_KEY)) { onboardDone = true; return; } } catch (e) { onboardDone = true; return; }
  // Wait until the board is actually visible (no title/lobby/reveal overlay covering it).
  if (document.querySelector(".title-screen, .lobby-screen, .round-reveal, .onboard-tips, .manifesto-card")) return;
  const cue = document.querySelector(".cue-card");
  const secret = els.secretCard;
  if (!cue || !secret) return;
  const cueR = cue.getBoundingClientRect();
  const secR = secret.getBoundingClientRect();
  if (!cueR.width || !secR.width) return;   // not laid out yet
  onboardDone = true;
  const layer = document.createElement("div");
  layer.className = "onboard-tips";
  const addTip = (r, text) => {
    const rightRoom = window.innerWidth - r.right > 210;
    const b = document.createElement("div");
    b.className = "onboard-tip " + (rightRoom ? "ob-right" : "ob-below");
    b.innerHTML = `<span class="ob-arrow"></span><span class="ob-text">${text}</span>`;
    if (rightRoom) { b.style.left = `${Math.round(r.right + 14)}px`; b.style.top = `${Math.round(r.top + r.height / 2)}px`; }
    else { b.style.left = `${Math.round(Math.min(window.innerWidth - 110, Math.max(110, r.left + r.width / 2)))}px`; b.style.top = `${Math.round(r.bottom + 14)}px`; }
    layer.appendChild(b);
  };
  document.body.appendChild(layer);
  addTip(secR, "👆 Tap your card to hide / show your face");
  addTip(cueR, "👆 Tap the question for a new one");
  const dismiss = () => {
    try { localStorage.setItem(ONBOARD_KEY, "1"); } catch (e) { /* fine */ }
    document.removeEventListener("pointerdown", dismiss, true);
    layer.classList.add("ob-out");
    setTimeout(() => layer.remove(), 300);
  };
  // Any tap dismisses (and still reaches the card underneath - capture listener, no preventDefault).
  setTimeout(() => document.addEventListener("pointerdown", dismiss, true), 500);
  setTimeout(dismiss, 9000);   // fallback so it never lingers
}
// FLOW-01: instead of a how-to-play tutorial (the game is meant to reveal itself, "don't explain it
// too much"), the FIRST-EVER board opens with a short MANIFESTO that sets the tone, then hands you
// straight to the board. Shown once, ever. Returns true when it's already been seen (or isn't
// applicable) so the caller can proceed to the onboarding nudges; false while it's on screen.
const MANIFESTO_KEY = "whoisit_manifesto_v1";
let manifestoDone = false;
let manifestoRetryTimer = null;
// BUG2-01: the only render() after the first-ever deal happens while the title screen is still
// fading out, so the overlay guard used to bail exactly once — and the whole first-run teaching
// layer (manifesto + tips) never fired. When blocked, re-arm a short retry; it self-clears the
// moment the manifesto shows or the key is set, and never runs again after first-run.
function scheduleManifestoRetry() {
  if (manifestoDone || manifestoRetryTimer) return;
  manifestoRetryTimer = setTimeout(() => {
    manifestoRetryTimer = null;
    if (maybeShowManifesto()) maybeShowOnboarding();
  }, 600);
}
function maybeShowManifesto() {
  if (manifestoDone) return true;
  if (state.isObserver) { manifestoDone = true; return true; }
  try { if (localStorage.getItem(MANIFESTO_KEY)) { manifestoDone = true; return true; } } catch (e) { manifestoDone = true; return true; }
  if (document.querySelector(".title-screen, .lobby-screen, .round-reveal, .manifesto-card")) { scheduleManifestoRetry(); return false; }
  const board = document.querySelector(".character-board");
  if (!board || !board.getBoundingClientRect().width) { scheduleManifestoRetry(); return false; }   // wait until the board is laid out
  manifestoDone = true;
  const ov = document.createElement("div");
  ov.className = "manifesto-card";
  ov.setAttribute("role", "dialog");
  ov.setAttribute("aria-label", "A manifesto");
  ov.innerHTML = `
    <div class="mf-shell">
      <p class="mf-eyebrow">A MANIFESTO</p>
      <div class="mf-body">
        <p>Have you ever wondered what your deepest prejudices are?</p>
        <p>Have you ever thought <em>&ldquo;how do I describe someone beyond the base level of their skin colour&rdquo;</em>, or <em>&ldquo;what noise would this person make when being choked to death?&rdquo;</em></p>
        <p>All these and more are answered with a simple game of <b>WHO? IS IT?</b></p>
        <p class="mf-kicker">Some will say this is a parody of the classic GUESS WHO? &nbsp;To those people we say — <b>IS IT?</b></p>
      </div>
      <button type="button" class="button primary mf-go">BEGIN</button>
    </div>`;
  document.body.appendChild(ov);
  const dismiss = () => {
    try { localStorage.setItem(MANIFESTO_KEY, "1"); } catch (e) { /* fine */ }
    if (ov._untrap) ov._untrap();
    ov.classList.add("mf-out");
    // The nudges wait for the card to actually LEAVE the DOM - calling immediately re-hit the same
    // overlay guard the manifesto itself used to die on (BUG2-01, one layer down).
    setTimeout(() => { ov.remove(); maybeShowOnboarding(); }, 280);
  };
  ov.querySelector(".mf-go").addEventListener("click", dismiss);
  trapOverlay(ov, { escape: dismiss });
  return false;
}

// A11Y2-01: minimal modal manners for the overlay family - role/aria-modal, focus the first control,
// keep Tab inside, optionally answer Escape, and hand focus back on close. Deliberately NOT applied
// with Escape to the round reveal / session end (skipping the scoreboard moment by accident is worse).
function trapOverlay(el, opts = {}) {
  if (!el.getAttribute("role")) el.setAttribute("role", "dialog");
  el.setAttribute("aria-modal", "true");
  const prev = document.activeElement;
  const focusables = () => [...el.querySelectorAll("button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])")]
    .filter((b) => !b.disabled && b.offsetParent !== null);
  const first = focusables()[0];
  if (first) setTimeout(() => { try { first.focus(); } catch (e) { /* fine */ } }, 30);
  const onKey = (e) => {
    if (e.key === "Escape" && typeof opts.escape === "function") { e.preventDefault(); opts.escape(); return; }
    if (e.key !== "Tab") return;
    const f = focusables();
    if (!f.length) return;
    const i = f.indexOf(document.activeElement);
    if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
    else if (!e.shiftKey && (i === -1 || i === f.length - 1)) { e.preventDefault(); f[0].focus(); }
  };
  el.addEventListener("keydown", onKey);
  el._untrap = () => { el.removeEventListener("keydown", onKey); try { if (prev && prev.focus) prev.focus(); } catch (e) { /* fine */ } };
}

// FLOW2-02: the '?' toolbar button - the one help surface. Replays the rules any time without
// touching the round: three lines, the drag-and-drop tell, and a manifesto encore.
function showHelpCard() {
  document.querySelector(".help-card")?.remove();
  const groupthink = state.ruleset === "groupthink";
  const fleshdraft = state.ruleset === "whodidyoumake";
  const yolo = state.settings.groupthinkYolo !== false;
  const n = state.settings.maxGuesses || 3;
  const ov = document.createElement("div");
  ov.className = "manifesto-card help-card";
  ov.setAttribute("aria-label", "How it works");
  ov.innerHTML = `
    <div class="mf-shell">
      <p class="mf-eyebrow">HOW IT WORKS</p>
      <div class="mf-body">${fleshdraft && state.gameMode === "online" ? `
        <p><b>1.</b> Everyone secretly holds a commission: six features, drawn from the shared board of faces.</p>
        <p><b>2.</b> Everyone picks simultaneously while their commission and current build stay visible. The first request accepted by the host gets a contested part.</p>
        <p><b>3.</b> Exact parts pay 15, visible lookalikes earn partial credit, and the first completed build earns <b>+10</b>.</p>
        <p class="mf-kicker">Your commission is private. Claims are public. Accuracy wins the night, but speed can break it open.</p>
      ` : fleshdraft ? `
        <p><b>1.</b> Before every pick, privately study your commission beside the face you've built so far.</p>
        <p><b>2.</b> Press READY and both faces disappear. Choose one part from memory—there is no back button and no peek—then pass the device.</p>
        <p><b>3.</b> Exact parts pay 15. Structural features, skin, hair, eyes, lip colour and other visible details all shape substitute similarity.</p>
        <p class="mf-kicker">Study. Hide. Pick. Pass. Claimed parts are gone for everyone, and whatever you take, you wear.</p>
      ` : groupthink && yolo ? `
        <p><b>1.</b> Everyone gets the same prompt and privately picks from one shared cast: three faces at first, then two, then one.</p>
        <p><b>2.</b> Match another player: that face scores <b>2 points</b>. Match nobody: consolation prize, <b>3 points</b>.</p>
        <p><b>3.</b> Every selected face is nominated for destruction. Each player secretly saves one; one clear winner survives, while a tie saves nobody.</p>
        <p class="mf-kicker">Removed faces vanish for everyone. Below six, you each pick one—and agreement crowns the final survivor.</p>
      ` : groupthink ? `
        <p><b>1.</b> Everyone gets the same prompt and privately picks three faces from the full shared cast.</p>
        <p><b>2.</b> Match another player: that face scores <b>2 points</b>. Match nobody: consolation prize, <b>3 points</b>.</p>
        <p><b>3.</b> The whole deck returns next round. Nobody is saved, cut, or removed.</p>
        <p class="mf-kicker">Eight prompts. Thirty reusable faces. Most points—or the strongest two-player sync—wins.</p>
      ` : `
        <p><b>1.</b> You are a face on their board. They're one on yours. Hide yours.</p>
        <p><b>2.</b> Ask anything. Answer however you dare. Tap faces to cross them off.</p>
        <p><b>3.</b> Sure? Hit <b>IS IT…?</b> — ${n} wrong guess${n === 1 ? "" : "es"} and <em>they</em> win.</p>
        <p class="mf-kicker">Some modes let you <b>drag one face onto another</b>. Consequences occur.</p>
      `}</div>
      ${groupthink || fleshdraft ? "" : `<button type="button" class="button ghost hc-manifesto">READ THE MANIFESTO AGAIN</button>`}
      <button type="button" class="button primary mf-go">GOT IT</button>
    </div>`;
  document.body.appendChild(ov);
  const close = () => { if (ov._untrap) ov._untrap(); ov.classList.add("mf-out"); setTimeout(() => ov.remove(), 260); };
  ov.querySelector(".mf-go").addEventListener("click", close);
  ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
  ov.querySelector(".hc-manifesto")?.addEventListener("click", () => {
    close();
    manifestoDone = false;                       // replay wanted: let it show once more, right now
    try { localStorage.removeItem(MANIFESTO_KEY); } catch (e) { /* fine */ }
    setTimeout(() => { if (maybeShowManifesto()) maybeShowOnboarding(); }, 300);
  });
  trapOverlay(ov, { escape: close });
}

// APPEAL2-02: the cold open. Once per session (and never on top of the manifesto), a salt-derived
// bill of what tonight statistically holds. Pure theatre; tap or 2.6s dismisses it.
function maybeShowForecast() {
  if (state.forecastShown || (state.roundAge || 0) !== 0 || state.isObserver) return;
  try { if (!localStorage.getItem(MANIFESTO_KEY)) return; } catch (e) { return; }
  if (document.querySelector(".title-screen, .lobby-screen, .round-reveal, .manifesto-card, .help-card")) return;
  if (!state.location || !state.gameSalt) return;
  state.forecastShown = true;
  const modes = MysteryModes.all();
  const a = modes[stableHash(`${state.gameSalt}:fca`) % modes.length];
  let b = modes[stableHash(`${state.gameSalt}:fcb`) % modes.length];
  if (b === a) b = modes[(modes.indexOf(a) + 7) % modes.length];
  const ov = document.createElement("div");
  ov.className = "forecast-card";
  ov.setAttribute("role", "status");
  ov.innerHTML = `
    <div class="fc-shell">
      <p class="fc-eyebrow">TONIGHT'S FORECAST</p>
      <p class="fc-line">☁ ${escapeHtml(a.name)} before midnight</p>
      <p class="fc-line">☁ at least one ${escapeHtml(b.name.toLowerCase())} incident</p>
      <p class="fc-line">☁ something unforgivable at the ${escapeHtml(state.location.name)}</p>
    </div>`;
  document.body.appendChild(ov);
  const skip = () => { ov.classList.add("fc-out"); setTimeout(() => ov.remove(), 300); };
  ov.addEventListener("pointerdown", skip);
  setTimeout(skip, 2600);
}
function resumeGame(saved) {
  state.ruleset = normalizeRuleset(saved.ruleset);
  applyRulesetChrome();
  // A TV/display refresh rejoins the room as a display (never as a seated player).
  if (saved.isObserver && (saved.gameMode || "") === "online" && saved.roomCode) {
    joinRoom(saved.roomCode, "TV", { observe: true });
    return;
  }
  // A save's online identity belongs to the TAB that made it (clientId lives in per-tab
  // sessionStorage). A DIFFERENT tab opening the same save must never impersonate that player —
  // that duplicated the host live (two tabs, one clientId) and made later joins invisible.
  // Instead the foreign tab walks in the front door: it JOINS the room as itself.
  if ((saved.gameMode || "") === "online" && saved.roomCode && saved.clientId) {
    const myTabId = ensureClientId();
    if (myTabId && saved.clientId !== myTabId) {
      joinRoom(saved.roomCode, saved.pname || "", {});
      return;
    }
  }
  // A refresh mid-LOBBY (online, nothing dealt yet): rejoin the room as the same person instead of
  // trying to resume a round that never existed.
  if (saved.inLobby && (saved.gameMode || "") === "online") { resumeOnlineLobby(saved); return; }
  state.settings = normalizeGameSettings(saved.settings || {});
  state.gameMode = saved.gameMode || "local";
  state.playMode = saved.playMode === "solo" ? "solo" : "team";
  state.pname = isValidPlayerName(saved.pname) ? cleanPlayerName(saved.pname) : (state.pname || "Player");
  state.mySeat = saved.mySeat || 0;
  // The online room code must be restored BEFORE newGame's netConnect, or a resumed client would
  // reconnect to the default "0000" channel and silently stop syncing. Fall back to the salt-derived
  // code (valid for a host, whose code IS the salt hash) for older saves without a stored roomCode.
  if ((saved.gameMode || "local") === "online") {
    state.roomCode = saved.roomCode || String((stableHash(saved.salt) % 9000) + 1000);
  }
  state.roundAge = saved.roundAge || 0;   // restored before newGame's resume path (which preserves it)
  state.lore = Array.isArray(saved.lore) ? saved.lore : [];
  state.stats = saved.stats && typeof saved.stats === "object" ? saved.stats : {};
  state.scoreboard = saved.scoreboard && typeof saved.scoreboard === "object" ? saved.scoreboard : {};
  state.hostClaimId = saved.hostClaimId || null;             // NET2-02: takeover authority survives
  state.seenPrompts = new Set(Array.isArray(saved.seenPrompts) ? saved.seenPrompts : []);   // NET2-03
  state.abortedBabies = saved.abortedBabies || [];
  // Restore the roster BEFORE newGame so assignRosterTeams re-derives the same sides from the same
  // salt + roster (and the seat pill / team labels come back intact).
  state.playerCount = saved.playerCount || (Array.isArray(saved.roster) ? saved.roster.length : 2) || 2;
  state.roster = Array.isArray(saved.roster) ? saved.roster.map((r, i) => ({
    name: cleanPlayerName(r.name) || `Player ${i + 1}`,
    clientId: r.clientId,
    side: r.side,
    personaId: r.personaId
  })) : [];
  state.clientId = saved.clientId || state.clientId;
  state.myRosterIndex = saved.myRosterIndex || 0;
  state.isHost = !!saved.isHost;
  state.headsForm = Number.isFinite(saved.headsForm) ? saved.headsForm : 0;
  state.gameSalt = saved.salt || saved.whodidyoumake?.sessionSeed || state.gameSalt;
  if (state.ruleset === "whodidyoumake" && window.WhoDidYouMake) {
    WhoDidYouMake.resume(saved);
    return;
  }
  if (state.ruleset === "groupthink" && window.Groupthink) {
    Groupthink.resume(saved);
    return;
  }
  newGame(saved.salt, { resume: true, remote: true });
  const rebuilt = hydrateSavedBoard(saved);
  if (rebuilt.length >= 2) {
    state.board = rebuilt;
    state.global.roleMap = {};
    state.board.forEach((ch, i) => { state.global.roleMap[ch.id] = state.settings.roles ? characterRoles[i % characterRoles.length] : ch.role; });
  }
  // Apply the effect AFTER the babies exist so they get per-mode stats too. No wheel replay. The
  // saved effect id wins (covers debug-picked modes); old saves fall back to the derived wheel.
  const effId = saved.effectId !== undefined ? saved.effectId : (state.settings.mystery ? wheelTarget() : null);
  if (effId) applyMysteryEffect(effId);
  (saved.players || []).forEach((sp, i) => {
    if (!state.players[i]) return;
    state.players[i].secretId = sp.secretId || state.players[i].secretId;
    state.players[i].eliminated = new Set(sp.eliminated || []);
    state.players[i].mysteryUsed = !!sp.mysteryUsed;
    if (typeof sp.secretVisible === "boolean") state.players[i].secretVisible = sp.secretVisible;
  });
  state.currentPlayer = saved.currentPlayer ?? (state.mySeat || 0);
  ensureSeatArrays(state.players.length || gameSeatCount());
  addLog("Round restored - carry on.");
  render();
}

// ===================== End round + title screen =====================
// Re-run the sidebar logo's slide-in (the same move as the title screen).
function replayBrand() {
  document.querySelectorAll(".side-head h1 span").forEach((s) => {
    s.style.animation = "none";
    void s.offsetWidth;   // reflow so the animation restarts from frame 0
    s.style.animation = "";
  });
}
function showRoundOverSplash(done) {
  const ov = document.createElement("div");
  ov.className = "round-over";
  ov.innerHTML = `<div class="ro-text">ROUND<br>OVER</div>`;
  document.body.appendChild(ov);
  setTimeout(() => { ov.remove(); if (done) done(); }, 1600);
}
// Pre-round team announcement (3+ players only). Same full-screen language as the round reveal.
// Each member's chip shows the board character they'll be PLAYING this round (their persona).
function showTeamReveal(done) {
  const chip = (m) => {
    const p = m.personaId ? characterById(m.personaId) : null;
    const face = p && p.image ? `<img class="tr-face" src="${p.image}" alt="">` : `<span class="tr-ini">${escapeHtml((m.name || "?").slice(0, 1).toUpperCase())}</span>`;
    return `<div class="tr-chip">${face}<span class="tr-nm">${escapeHtml(m.name || "?")}${p ? `<i class="tr-as">as ${escapeHtml(p.name)}</i>` : ""}</span></div>`;
  };
  const teamCol = (side) => `<div class="tr-team tr-${side === 0 ? "a" : "b"}">
      <div class="tr-head">${escapeHtml(teamLabel(side))}</div>
      <div class="tr-members">${teamMembers(side).map(chip).join("")}</div>
    </div>`;
  const ov = document.createElement("div");
  ov.className = "round-reveal team-reveal";
  ov.innerHTML = `
    <div class="rr-title">TEAMS</div>
    <div class="tr-teams">${teamCol(0)}<div class="rr-vs">VS</div>${teamCol(1)}</div>
    <p class="tr-tap">tap to continue</p>`;
  document.body.appendChild(ov);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    ov.classList.add("rr-out");
    setTimeout(() => ov.remove(), 450);
    if (done) done();
  };
  ov.addEventListener("click", finish);
  setTimeout(finish, 6200);   // hang long enough to actually read who's on which team
}
// Pre-round solo announcement (3+ players only). Everyone gets their own secret and their own board
// state; the app just holds those secrets while the humans decide the social win condition.
function showSoloReveal(done) {
  const ov = document.createElement("div");
  ov.className = "round-reveal team-reveal solo-reveal";
  const cards = (state.roster || []).map((r, i) => {
    return `<div class="tr-chip solo-chip">
      <span class="tr-ini">${escapeHtml((r.name || "?").slice(0, 1).toUpperCase())}</span>
      <span class="tr-nm">${escapeHtml(r.name || `Player ${i + 1}`)}<i class="tr-as">private secret dealt</i></span>
    </div>`;
  }).join("");
  ov.innerHTML = `
    <div class="rr-title">SOLO MODE</div>
    <div class="tr-solo-grid">${cards}</div>
    <p class="tr-tap">tap to continue</p>`;
  document.body.appendChild(ov);
  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    ov.classList.add("rr-out");
    setTimeout(() => ov.remove(), 650);
    if (done) done();
  };
  ov.addEventListener("click", finish);
  setTimeout(finish, 5200);
}
// End of round: the big reveal - BOTH secret characters side by side, then the next round deals.
function showRoundReveal(done, outcome) {
  // Crossing END ROUND clicks online would stack two reveals (each client receives the other's
  // endround too). Clear any existing non-team reveal first so there's only ever one.
  document.querySelectorAll(".round-reveal:not(.team-reveal)").forEach((el) => el.remove());
  state.roundOver = true;
  document.body.classList.remove("guess-mode");
  document.querySelector(".guess-banner")?.remove();
  // Win & Loss: a resolved round carries an outcome (someone guessed right, or ran out of tries).
  // Record it on the session scoreboard once, from whichever client is showing the reveal first.
  if (outcome && outcome.winnerName && !state.roundScored) {
    state.roundScored = true;
    state.scoreboard = state.scoreboard || {};
    state.scoreboard[outcome.winnerName] = (state.scoreboard[outcome.winnerName] || 0) + 1;
    bumpStat("roundsWon");
  }
  const secrets = (state.players || []).map((player) => characterById(player.secretId)).filter(Boolean);
  const my = clampSeatIndex(state.gameMode === "online" ? (state.mySeat || 0) : state.currentPlayer);
  const teamMode = rosterTeamMode();
  const soloMode = rosterSoloMode();
  recordRoundLore(secrets);
  // Mode-flavoured epilogue under each reveal ("Still going around with that MAJOR HYSTERIA.") -
  // the character's send-off in the voice of the round that just ended.
  // Each reveal is the SAME card language as the gameplay board (image + name strip in one bordered
  // tile), with the caption above and the mode epilogue below.
  const secretCardHtml = (sec, cls, label, epi) =>
    `<span class="rr-label ${cls}">${label}</span><span class="rr-cardface"><img src="${sec ? sec.image : ""}" alt=""><span class="rr-name">${escapeHtml(sec ? sec.name : "?")}</span></span>${epi ? `<span class="rr-epilogue">${escapeHtml(epi)}</span>` : ""}`;
  let cardsHtml = "";
  if (soloMode && secrets.length > 2) {
    cardsHtml = secrets.map((sec, i) => {
      const epi = typeof modeEpilogue === "function" ? modeEpilogue(sec) : "";
      const isMine = i === my;
      const label = isMine ? "YOU WERE" : `${teamLabel(i).toUpperCase()} WAS`;
      return `<div class="rr-card">${secretCardHtml(sec, isMine ? "rr-you" : "rr-them", label, epi)}</div>`;
    }).join("");
  } else {
    const secA = secrets[0];
    const secB = secrets[1];
    const mine = my === 0 ? secA : secB;
    const theirs = my === 0 ? secB : secA;
    const epiMine = typeof modeEpilogue === "function" ? modeEpilogue(mine) : "";
    const epiTheirs = typeof modeEpilogue === "function" ? modeEpilogue(theirs) : "";
    // ONE secret per side, whatever the team sizes. A side has a single shared secret; the team's
    // members were already introduced at the round-start team reveal, so the end reveal is just the
    // two secrets head-to-head (team label in 3+ games, "YOU WERE" in 2p).
    cardsHtml = `
      <div class="rr-card">${secretCardHtml(mine, "rr-you", teamMode ? "YOUR TEAM WAS" : "YOU WERE", epiMine)}</div>
      <div class="rr-vs">×</div>
      <div class="rr-card">${secretCardHtml(theirs, "rr-them", "THEY WERE", epiTheirs)}</div>`;
  }
  // Manual round picker (custom lineup + "Selected"): instead of one NEXT ROUND, the players choose
  // the next mode from buttons - each ticked mode in the allowlist becomes a button, plus a random
  // fallback. Any other lineup keeps the single NEXT ROUND (the wheel / ramp decides).
  const manualPick = effectiveModePolicy() === "custom" && state.settings.roundPicker === "manual";
  let actionsHtml;
  if (manualPick) {
    const modeBtns = normalizedAllowedModeIds().map((id) => {
      const def = MysteryModes.byId(id);
      return `<button type="button" class="button rr-mode" data-mode="${escapeHtml(id)}">${escapeHtml(def ? def.name : id)}</button>`;
    }).join("");
    actionsHtml = `
      <div class="rr-pick">
        <p class="rr-pick-label">Pick the next mode</p>
        <div class="rr-mode-grid">${modeBtns}</div>
        <button type="button" class="button rr-next rr-random">🎲 Surprise me</button>
      </div>`;
  } else {
    actionsHtml = `<button type="button" class="button primary rr-next">NEXT ROUND →</button>`;
  }
  // Win banner when the round was won by a guess (or lost by running out). Otherwise a plain reveal.
  let titleHtml = `<div class="rr-title">ROUND OVER</div>`;
  if (outcome && outcome.winnerName) {
    const sub = outcome.how === "guessed"
      ? `Nailed it — <b>${escapeHtml(outcome.targetName || "them")}</b> all along.`
      : `<b>${escapeHtml(outcome.loserName || "They")}</b> ran out of guesses.`;
    titleHtml = `<div class="rr-winline">🏆 <b>${escapeHtml(outcome.winnerName)}</b> WINS</div><p class="rr-winsub">${sub}</p>`;
  }
  const scoreHtml = scoreboardLine();
  const loreHtml = loreCallbackLine();
  const ov = document.createElement("div");
  ov.className = `round-reveal${soloMode ? " rr-solo" : ""}${manualPick ? " rr-manual" : ""}${outcome && outcome.winnerName ? " rr-won" : ""}`;
  ov.innerHTML = `
    <div class="rr-shell">
      ${titleHtml}
      <div class="rr-cards">${cardsHtml}</div>
      ${loreHtml}
      ${scoreHtml}
      <div class="rr-actions">
        ${actionsHtml}
        <button type="button" class="button rr-finish"><svg class="rr-finish-ico" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 3v18l2-1.4 2 1.4 2-1.4 2 1.4 2-1.4 2 1.4V3l-2 1.4L14 3l-2 1.4L10 3 8 4.4 6 3Z"/><path d="M9 8h6M9 12h6"/></svg>FINISH SESSION</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  trapOverlay(ov);   // A11Y2-01: keep Tab inside the reveal (no Escape - the scoreboard moment stays)
  // No auto-advance: players click NEXT ROUND when they're ready (time to pass the device / react).
  // Online: whoever clicks deals + broadcasts; a remote deal also clears any lingering reveal (newGame).
  let finished = false;
  const finish = (pickId) => {
    if (finished) return;
    finished = true;
    ov.classList.add("rr-out");
    setTimeout(() => { ov.remove(); if (done) done(pickId); }, 560);
  };
  ov.querySelector(".rr-next").addEventListener("click", () => finish());   // NEXT ROUND / Surprise me = let the wheel decide
  ov.querySelectorAll(".rr-mode").forEach((btn) => btn.addEventListener("click", () => finish(btn.dataset.mode)));
  // FINISH SESSION: confirmed first (a mis-tap here used to end the whole night), then the
  // receipt prints on the session-end screen.
  ov.querySelector(".rr-finish").addEventListener("click", () => {
    if (finished) return;
    confirmEndSession(() => {
      if (finished) return;
      finished = true;
      ov.remove();
      showSessionEnd();
    });
  });
}
// A small confirm sheet before the night ends - cancel keeps the round reveal exactly as it was.
function confirmEndSession(onConfirm) {
  document.querySelector(".end-confirm")?.remove();
  const ov = document.createElement("div");
  ov.className = "end-confirm";
  ov.innerHTML = `
    <div class="end-confirm-box">
      <p class="ec-title">END THE SESSION?</p>
      <p class="ec-sub">The night wraps up and your receipt prints. You can keep playing afterwards.</p>
      <div class="ec-actions">
        <button type="button" class="button ec-cancel">← KEEP PLAYING</button>
        <button type="button" class="button primary ec-yes">PRINT THE RECEIPT</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector(".ec-cancel").addEventListener("click", () => { sfx("click"); ov.remove(); });
  ov.querySelector(".ec-yes").addEventListener("click", () => { sfx("click"); ov.remove(); onConfirm(); });
  ov.addEventListener("click", (e) => { if (e.target === ov) ov.remove(); });
}
function endRound() {
  // Win & Loss on: the round ENDS by guessing. The old "just reveal" is still reachable from inside
  // the guess prompt ("just reveal it"). Solo mode with 3+ separate secrets keeps the plain reveal.
  if (state.settings.guessing && !state.roundOver && !state.isObserver && guessTargetSeat() !== null) {
    enterGuessMode();
    return;
  }
  netSend("endround", {});
  // A picked mode (manual round picker) forces that mode next round; otherwise the wheel decides.
  showRoundReveal((pickId) => newGame(null, pickId ? { effectId: pickId } : {}));
}

// ===================== Win & Loss: guess the other player =====================
// Reset each round (called from newGame). Session scoreboard survives; per-round tries don't.
function resetGuessState() {
  state.roundOver = false;
  state.roundScored = false;
  state.guessMode = null;
  state.finalTwoShown = {};   // FUN2-02: the FINAL TWO beat re-arms each round
  document.querySelector(".final-two-banner")?.remove();
  const n = state.settings.maxGuesses || 3;
  state.guessesLeft = {};
  (state.players || []).forEach((_, i) => { state.guessesLeft[i] = n; });
  document.body.classList.remove("guess-mode");
  document.querySelector(".guess-banner, .guess-confirm")?.remove();
}
// Who is the guesser this turn: local pass-and-play = the active seat; online = my seat.
function guesserSeat() {
  return clampSeatIndex(state.gameMode === "online" ? (state.mySeat || 0) : state.currentPlayer);
}
// Head-to-head only: the seat you're trying to name. Two secrets (2p or team) → the other side.
// Solo mode with 3+ distinct secrets has no single "them", so guessing is off there (null).
function guessTargetSeat() {
  const seats = (state.players || []).length;
  if (seats !== 2) return null;
  return guesserSeat() === 0 ? 1 : 0;
}
function seatWinnerName(seat) {
  if (rosterTeamMode && rosterTeamMode() && typeof teamLabel === "function") return teamLabel(seat);
  const r = (state.roster || [])[seat];
  if (r && r.name) return r.name;
  return `Player ${seat + 1}`;
}
// The universe remembers: sometimes the reveal drops a one-line callback to an EARLIER round, so a
// session reads as an unfolding story rather than disconnected rounds. ~55% when there's history.
function loreCallbackLine() {
  const lore = state.lore || [];
  if (lore.length < 2) return "";
  const now = lore[lore.length - 1];
  const past = lore.slice(0, -1);
  if (Math.random() > 0.55) return "";
  const nowNames = new Set(now.names || []);
  // A name that has surfaced before this round.
  const recurring = [];
  past.forEach((e, i) => (e.names || []).forEach((nm) => { if (nowNames.has(nm)) recurring.push({ nm, round: i + 1 }); }));
  let line = "";
  if (recurring.length) {
    const r = recurring[Math.floor(Math.random() * recurring.length)];
    const opts = [
      `${r.nm.toUpperCase()} again. The universe keeps handing them out.`,
      `That's twice for ${r.nm.toUpperCase()}. Someone's cursed.`,
      `${r.nm.toUpperCase()} was in round ${r.round} too. Coincidence? Obviously not.`
    ];
    line = opts[Math.floor(Math.random() * opts.length)];
  } else {
    const e = past[Math.floor(Math.random() * past.length)];
    const opts = [
      e.modeName ? `Remember ${String(e.modeName).toUpperCase()}? The universe does.` : "",
      e.you ? `You've been ${e.you.toUpperCase()} before. It suits you, unfortunately.` : "",
      `Round ${past.indexOf(e) + 1} really happened. No refunds.`
    ].filter(Boolean);
    line = opts[Math.floor(Math.random() * opts.length)];
  }
  return line ? `<p class="rr-lore">🕰️ ${escapeHtml(line)}</p>` : "";
}
function scoreboardLine() {
  const sb = state.scoreboard || {};
  const entries = Object.entries(sb).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]);
  if (!entries.length) return "";
  const parts = entries.map(([nm, w]) => `<span class="rr-score-chip"><b>${escapeHtml(nm)}</b> ${w}</span>`).join("");
  return `<div class="rr-scoreboard"><span class="rr-score-label">Wins tonight</span>${parts}</div>`;
}
function enterGuessMode() {
  const seat = guesserSeat();
  const left = (state.guessesLeft || {})[seat] ?? (state.settings.maxGuesses || 3);
  if (left <= 0) { flashToast("You're out of guesses — the round's nearly over."); return; }
  state.guessMode = { seat };
  document.body.classList.add("guess-mode");
  document.querySelector(".guess-banner")?.remove();
  // BUG2-04: local copy names both sides ("JOEL — tap who you think NAOMI is"), doubling as a
  // whose-turn reminder in pass-and-play. Online keeps the simple second-person line.
  const guesser = seatWinnerName(seat);
  const target = seatWinnerName(guessTargetSeat());
  const b = document.createElement("div");
  b.className = "guess-banner";
  b.setAttribute("role", "status");
  b.innerHTML = `
    <span class="gb-text">🔍 ${state.gameMode === "online"
      ? "Tap who you think they are"
      : `${escapeHtml(guesser)} — tap who you think ${escapeHtml(target)} is`} · <b>${left}</b> guess${left === 1 ? "" : "es"} left</span>
    <span class="gb-row">
      <button type="button" class="button ghost gb-cancel">CANCEL</button>
      <button type="button" class="button ghost gb-reveal">JUST REVEAL IT</button>
    </span>`;
  document.body.appendChild(b);
  b.querySelector(".gb-cancel").addEventListener("click", exitGuessMode);
  b.querySelector(".gb-reveal").addEventListener("click", () => {
    exitGuessMode();
    netSend("endround", {});
    showRoundReveal((pickId) => newGame(null, pickId ? { effectId: pickId } : {}));
  });
  sfx("blip");
}
function exitGuessMode() {
  state.guessMode = null;
  document.body.classList.remove("guess-mode");
  document.querySelector(".guess-banner")?.remove();
}
// A tap in guess mode: accuse this character of being the other side's secret.
function makeGuess(charId) {
  if (!state.guessMode) return;
  const seat = state.guessMode.seat;
  const theirSeat = seat === 0 ? 1 : 0;
  const theirSecretId = state.players[theirSeat] && state.players[theirSeat].secretId;
  const char = characterById(charId);
  if (!char) return;
  document.querySelector(".guess-confirm")?.remove();
  // FLOW2-03: guessing someone YOU crossed off is usually a mis-tap — flag it in voice, still allow
  // it (maybe they bluffed themselves; deliberate galaxy-brain plays get funnier with the warning).
  const selfCrossed = !!(state.players[seat] && state.players[seat].eliminated && state.players[seat].eliminated.has(charId));
  const c = document.createElement("div");
  c.className = "guess-confirm";
  c.innerHTML = `
    <div class="gc-box">
      <p class="gc-q">${selfCrossed ? "YOU CROSSED THEM OFF YOURSELF." : "IS IT…"}</p>
      <img class="gc-face" src="${char.image || ""}" alt="">
      <p class="gc-name">${escapeHtml(char.name)}?</p>
      ${selfCrossed ? `<p class="gc-warn">Bold. The universe is watching.</p>` : ""}
      <div class="gc-actions">
        <button type="button" class="button gc-back">← Not sure</button>
        <button type="button" class="button primary gc-yes">${selfCrossed ? "LOCK IT IN ANYWAY" : "LOCK IT IN"}</button>
      </div>
    </div>`;
  document.body.appendChild(c);
  const closeConfirm = () => { if (c._untrap) c._untrap(); c.remove(); };
  c.addEventListener("click", (e) => { if (e.target === c) closeConfirm(); });
  c.querySelector(".gc-back").addEventListener("click", closeConfirm);
  trapOverlay(c, { escape: closeConfirm });   // A11Y2-01
  c.querySelector(".gc-yes").addEventListener("click", () => {
    c.remove();
    const correct = charId === theirSecretId;
    netSend("guess", { seat, id: charId, correct });
    if (correct) {
      sfx("win");
      resolveRound({ winnerSeat: seat, winnerName: seatWinnerName(seat), how: "guessed", targetName: char.name });
    } else {
      sfx("buzzer");
      // A wrong guess crosses that face off for the guesser (confirmed not them) + burns a try.
      const p = state.players[seat];
      if (p && !p.eliminated.has(charId)) { p.eliminated.add(charId); netSend("elim", { id: charId, down: true }); }
      state.guessesLeft[seat] = Math.max(0, (state.guessesLeft[seat] ?? state.settings.maxGuesses) - 1);
      const left = state.guessesLeft[seat];
      renderBoard();
      if (left <= 0) {
        resolveRound({ winnerSeat: theirSeat, winnerName: seatWinnerName(theirSeat), how: "exhausted", loserName: seatWinnerName(seat) });
      } else {
        exitGuessMode();
        flashToast(`❌ Not ${char.name}. ${wrongGuessTaunt(charId)} ${left} guess${left === 1 ? "" : "es"} left.`);
      }
    }
  });
}
// FUN2-04: wrong guesses are a comedy beat, not a status update. Salt+id keeps the line stable for
// both ends of an online round; the pool is big enough that repeats read as callbacks, not loops.
const WRONG_GUESS_TAUNTS = [
  "Confidently wrong. The universe noted it.",
  "That person is somewhere, being innocent.",
  "They watched you say that.",
  "Somewhere, a lawyer smiled.",
  "The board remembers this.",
  "An accusation like that follows you.",
  "Wrong, and now everyone knows your process.",
  "Add it to the incident report."
];
function wrongGuessTaunt(charId) {
  return WRONG_GUESS_TAUNTS[stableHash(`${state.gameSalt}:taunt:${charId}`) % WRONG_GUESS_TAUNTS.length];
}
// End the round with a winner (or lost-by-exhaustion). Broadcast so both clients show the same result.
function resolveRound(outcome) {
  if (state.roundOver) return;
  netSend("endround", { outcome });
  showRoundReveal((pickId) => newGame(null, pickId ? { effectId: pickId } : {}), outcome);
}

// Session stat tally: modes report their unlocked absurdities here; the receipt prints any > 0.
function bumpStat(key, n = 1) {
  if (!state.stats) state.stats = {};
  state.stats[key] = (state.stats[key] || 0) + n;
  scheduleSave();
}

// ===================== Session lore: the universe remembers =====================
// One ledger entry per finished round (who the secrets were, which mode it was). Feeds the
// "PREVIOUSLY, IN THIS UNIVERSE…" callback that sometimes plays before the next wheel spin.
function recordRoundLore(...roundSecrets) {
  if (!Array.isArray(state.lore)) state.lore = [];
  const secrets = (Array.isArray(roundSecrets[0]) ? roundSecrets[0] : roundSecrets).filter(Boolean);
  const eff = state.global.mystery ? MysteryModes.byId(state.global.mystery.id) : null;
  const my = clampSeatIndex(state.gameMode === "online" ? (state.mySeat || 0) : state.currentPlayer);
  const mine = secrets[my] || secrets[0];
  state.lore.push({
    modeId: eff ? eff.id : null,
    modeName: eff ? eff.name : null,
    names: secrets.map((sec) => sec && sec.name).filter(Boolean),
    ids: secrets.map((sec) => sec && sec.id).filter(Boolean),   // portraits for the end credits
    you: mine ? mine.name : null   // which one THIS device was (feeds the night receipt)
  });
  if (state.lore.length > 12) state.lore.shift();
  almanacRecord(secrets, eff);
  scheduleSave();
}

// ===================== The Almanac: everything the universe has ever established =====================
// A persistent per-character dossier (per device). Every finished round: everyone on the board gains
// an appearance; the two unmasked secrets also gain their mode-voiced epilogue as a recorded FACT.
const ALMANAC_KEY = "whoisit_almanac_v1";
function almanacLoad() {
  try { const a = JSON.parse(localStorage.getItem(ALMANAC_KEY) || "null"); return a && a.chars ? a : { chars: {} }; }
  catch (e) { return { chars: {} }; }
}
function almanacSave(a) {
  try { localStorage.setItem(ALMANAC_KEY, JSON.stringify(a)); } catch (e) { /* storage full - the universe forgets */ }
}
function almanacRecord(secretsOrA, maybeB, maybeEff) {
  const secrets = Array.isArray(secretsOrA) ? secretsOrA.filter(Boolean) : [secretsOrA, maybeB].filter(Boolean);
  const eff = Array.isArray(secretsOrA) ? maybeB : maybeEff;
  const a = almanacLoad();
  const touch = (ch) => {
    if (!ch) return null;
    const entry = a.chars[ch.id] || (a.chars[ch.id] = { name: ch.name, rounds: 0, unmasked: 0, facts: [] });
    entry.name = ch.name;
    return entry;
  };
  state.board.forEach((ch) => { const e = touch(ch); if (e) e.rounds += 1; });
  secrets.forEach((sec) => {
    const e = touch(sec);
    if (!e) return;
    e.unmasked += 1;
    const line = typeof modeEpilogue === "function" ? modeEpilogue(sec) : "";
    if (line) {
      e.facts.push({ m: eff ? eff.name : "A perfectly normal round", line });
      if (e.facts.length > 20) e.facts.shift();
    }
  });
  almanacSave(a);
}
// ===================== The Night Receipt: an old-school printout of the session =====================
// Feeds out of a printer slot, thermal-paper style: every round as a line item with a stamped
// verdict, the cast you played as, dubious totals, a barcode, NO REFUNDS.
const RECEIPT_TAGS = ["[OK]", "[INCIDENT]", "[UNDER REVIEW]", "[NO SURVIVORS]", "[SEALED]", "[DO NOT ASK]", "[RESOLVED*]", "[ONGOING]"];
// Human labels for the stat tally — a stat only prints when its count is > 0.
const RECEIPT_STAT_LABELS = {
  abortions: "ABORTIONS",
  babies: "BABIES BRED",
  gaybys: "GAYBYS",
  divorces: "DIVORCES (SIMS)",
  weddings: "WEDDINGS (REGRETTED)",
  avadas: "AVADA KEDAVRAS",
  habboBans: "HABBO POOL BANS",
  headsPopped: "HEADS POPPED",
  bobbas: "BOBBAS SAID"
};
// FUN-06: a tiny seeded matrix-dot / ASCII face per character, printed on the receipt. Deterministic
// (same seed → same face) so a scanned summary reprints the identical portraits. Fixed-width lines so
// they stay aligned in the monospace <pre>. (Noted for later: a full "ASCII MODE" mystery effect that
// renders the WHOLE board like this — see the roadmap note in modes.js.)
const ASCII_EYES = ["o", "O", "*", "x", "^", "-", "@", "="];
const ASCII_NOSE = ["_", "v", ".", "!", "7"];
const ASCII_MOUTH = ["___", "vvv", "---", "ooo", "www", ")-(", "\\_/"];
function asciiFace(seed) {
  const h = stableHash(String(seed || "x")) >>> 0;   // unsigned: a signed >> could go negative → undefined index
  const e = ASCII_EYES[h % ASCII_EYES.length];
  const n = ASCII_NOSE[(h >>> 3) % ASCII_NOSE.length];
  const m = ASCII_MOUTH[(h >>> 6) % ASCII_MOUTH.length];
  // Every line's inner width is 7 chars so the box stays square in the monospace <pre>.
  return [
    ".-------.",
    `| ${e}   ${e} |`,
    `|   ${n}   |`,
    `|  ${m}  |`,
    "'-------'"
  ].join("\n");
}
// FUN-06: 3–5 salt-picked per-player superlatives computed from the session's wins + how often each
// name was the secret. Deterministic pick so online peers and the scanned summary agree.
function receiptSuperlatives(scoreboard, lore, saltSrc) {
  const wins = scoreboard || {};
  const appear = {};
  (lore || []).forEach((e) => (e.names || []).forEach((nm) => { appear[nm] = (appear[nm] || 0) + 1; }));
  const names = [...new Set([...Object.keys(wins), ...Object.keys(appear)])];
  if (!names.length) return "";
  const used = new Set();
  const awards = [];
  const add = (label, nm) => { if (!nm || used.has(nm) || awards.length >= 5) return; used.add(nm); awards.push(`${label} — ${nm.toUpperCase()}`); };
  const topOf = (obj) => { const es = Object.entries(obj).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]); return es.length ? es[0][0] : null; };
  add("🏆 MOST DANGEROUS", topOf(wins));
  add("🎭 FACE OF THE NIGHT", topOf(appear));
  const zero = names.filter((n) => (appear[n] || 0) > 0 && !(wins[n] > 0) && !used.has(n));
  add("🥀 PARTICIPATION TROPHY", zero.length ? zero[stableHash(`${saltSrc}:loser`) % zero.length] : null);
  const flav = ["🔪 MOST LIKELY TO REOFFEND", "🕳️ LEAST MISSED", "🧊 COLDEST DEAD EYES", "🎪 BIGGEST LIABILITY", "📉 WORST DECISIONS", "🫥 HARDEST TO DESCRIBE"];
  names.filter((n) => !used.has(n)).forEach((nm) => { if (awards.length < 3) add(flav[stableHash(`${saltSrc}:flav:${nm}`) % flav.length], nm); });
  return awards.slice(0, 5).map((t) => `<div class="rc-award">${escapeHtml(t)}</div>`).join("");
}
// APP-01: render the on-screen receipt to a shareable PNG. foreignObject taints the canvas in some
// browsers, so we draw the receipt manually from its DOM — reliable, self-contained, no libraries.
function saveReceiptPng() {
  const node = document.querySelector(".receipt-paper");
  if (!node) return;
  const scale = 2, W = 384, PADX = 26;
  const rows = [];
  node.querySelectorAll(":scope > *").forEach((el) => {
    const cls = el.className || "";
    if (/rc-qr|rc-save|rc-foot/.test(cls) && !/rc-qr-none/.test(cls)) return;   // links/QR don't belong in a static image
    if (cls.includes("rc-rule")) { rows.push({ t: "rule" }); return; }
    if (cls.includes("rc-barcode")) { rows.push({ t: "barcode" }); return; }
    if (cls.includes("rc-ascii-row")) {
      el.querySelectorAll(".rc-ascii").forEach((pre, i, all) => {
        (pre.textContent || "").split("\n").forEach((ln) => rows.push({ t: "mono", s: ln }));
        rows.push({ t: "mono", s: (pre.dataset.name || "") });
        if (i < all.length - 1) rows.push({ t: "gap" });
      });
      return;
    }
    if (cls.includes("rc-line") || cls.includes("rc-award")) {
      const span = el.querySelector("span"), b = el.querySelector("b");
      if (span || b) rows.push({ t: "kv", l: span ? span.textContent : "", r: b ? b.textContent : "" });
      else rows.push({ t: "center", s: el.textContent.trim() });
      return;
    }
    rows.push({ t: cls.includes("rc-head") ? "head" : "center", s: el.textContent.trim(), big: cls.includes("rc-logo") });
  });
  const H = rows.reduce((y, r) => y + ({ rule: 14, barcode: 34, gap: 8, mono: 15 }[r.t] || (r.big ? 40 : 24)), 40) + 20;
  const canvas = document.createElement("canvas");
  canvas.width = W * scale; canvas.height = H * scale;
  const ctx = canvas.getContext("2d");
  ctx.scale(scale, scale);
  ctx.fillStyle = "#fffdf7"; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#171512"; ctx.textBaseline = "alphabetic";
  let y = 30;
  rows.forEach((r) => {
    if (r.t === "rule") { ctx.strokeStyle = "rgba(23,21,18,0.4)"; ctx.setLineDash([3, 3]); ctx.beginPath(); ctx.moveTo(PADX, y + 2); ctx.lineTo(W - PADX, y + 2); ctx.stroke(); ctx.setLineDash([]); y += 14; return; }
    if (r.t === "gap") { y += 8; return; }
    if (r.t === "barcode") { ctx.fillStyle = "#171512"; let bx = PADX; while (bx < W - PADX) { const bw = 1 + (stableHash(`${bx}:bar`) % 4); ctx.fillRect(bx, y, bw, 26); bx += bw + 1 + (stableHash(`${bx}:gap`) % 3); } y += 34; return; }
    if (r.t === "mono") { ctx.fillStyle = "#171512"; ctx.textAlign = "center"; ctx.font = "12px 'Courier New', monospace"; ctx.fillText(r.s || "", W / 2, y + 11); y += 15; return; }
    if (r.t === "kv") { ctx.fillStyle = "#171512"; ctx.font = "13px 'Space Grotesk', system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillText(r.l || "", PADX, y + 15); ctx.textAlign = "right"; ctx.font = "bold 13px 'Space Grotesk', system-ui, sans-serif"; ctx.fillText(r.r || "", W - PADX, y + 15); y += 24; return; }
    ctx.fillStyle = "#171512"; ctx.textAlign = r.t === "head" ? "left" : "center";
    ctx.font = `${r.big ? "800 26px" : (r.t === "head" ? "800 14px" : "600 14px")} 'Space Grotesk', system-ui, sans-serif`;
    ctx.fillText(r.s || "", r.t === "head" ? PADX : W / 2, y + (r.big ? 28 : 16));
    y += r.big ? 40 : 24;
  });
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "who-is-it-receipt.png";
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 4000);
  }, "image/png");
}
// The thermal printout. opts.data overrides the live state (the scanned summary page rebuilds the
// same receipt from the QR payload); opts.qrUrl prints a scannable QR + link under the barcode.
function buildReceiptPaper(opts = {}) {
  const d = opts.data || {};
  const lore = d.lore || state.lore || [];
  const stats = d.stats || state.stats || {};
  const roomCode = d.room || state.roomCode || "0000";
  const serialSrc = d.serial || state.gameSalt || "void";
  const season = (() => { try { return parseInt(localStorage.getItem("whoisit_season_v1") || "1", 10) || 1; } catch (e) { return 1; } })();
  const items = lore.length
    ? lore.map((e, i) => {
      const tag = RECEIPT_TAGS[stableHash(`${e.modeName || "plain"}:${i}:tag`) % RECEIPT_TAGS.length];
      return `<div class="rc-line"><span>1x ${escapeHtml((e.modeName || "AN ORDINARY ROUND").toUpperCase())}</span><b>${tag}</b></div>`;
    }).join("")
    : `<div class="rc-line"><span>0x ROUNDS ON RECORD</span><b>[SUSPICIOUS]</b></div>`;
  const you = [...new Set(lore.map((e) => e.you).filter(Boolean))];
  const secretsBurned = lore.reduce((n, e) => n + (e.names ? e.names.length : 0), 0);
  // Win & Loss scoreboard: winners this session, most wins first.
  const scoreboard = d.scoreboard || state.scoreboard || {};
  const winRows = Object.entries(scoreboard).filter(([, w]) => w > 0).sort((a, b) => b[1] - a[1]);
  const winnersLine = winRows.length
    ? winRows.map(([nm, w]) => `<div class="rc-line"><span>${escapeHtml(nm.toUpperCase())}</span><b>${w} WIN${w === 1 ? "" : "S"}</b></div>`).join("")
    : `<div class="rc-line"><span>WINNERS</span><b>N/A</b></div>`;
  const statLines = Object.entries(RECEIPT_STAT_LABELS)
    .filter(([key]) => stats[key] > 0)
    .map(([key, label]) => `<div class="rc-line"><span>${label}</span><b>${stats[key]}</b></div>`).join("");
  // FUN-06: matrix-dot ASCII faces for up to 3 distinct characters this session + salt-picked awards.
  const faces = [];
  const seenFace = new Set();
  lore.forEach((e) => (e.ids || []).forEach((id, i) => {
    if (!id || seenFace.has(id) || faces.length >= 3) return;
    seenFace.add(id);
    faces.push({ id, name: (e.names && e.names[i]) || "?" });
  }));
  const asciiRow = faces.length
    ? `<div class="rc-rule"></div><div class="rc-ascii-row">${faces.map((f) => {
        const nm = String(f.name).toUpperCase();
        return `<div class="rc-ascii-face"><pre class="rc-ascii" data-name="${escapeHtml(nm)}">${escapeHtml(asciiFace(f.id))}</pre><span class="rc-ascii-name">${escapeHtml(nm)}</span></div>`;
      }).join("")}</div>`
    : "";
  const awards = receiptSuperlatives(scoreboard, lore, serialSrc);
  // The QR: local generation (vendor-qrcode.js), graceful fallback to a plain link if it fails.
  let qrBlock = "";
  if (opts.qrUrl) {
    let svg = "";
    try {
      const qr = qrcode(0, "M");
      qr.addData(opts.qrUrl);
      qr.make();
      svg = qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true });
    } catch (e) { svg = ""; }
    qrBlock = `<div class="rc-rule"></div>
      <div class="rc-qr">${svg}</div>
      <p class="rc-qr-label">SCAN FOR SUMMARY<br>PLAY THIS DECK AGAIN</p>
      <p class="rc-qr-open"><a href="${opts.qrUrl.replace(/"/g, "&quot;")}">OPEN SUMMARY ↗</a></p>`;
  }
  // The save link: a plain copyable URL (not just a QR) that re-deals this exact deck - board,
  // settings, wheel outcome. Phone players save/share it like any link.
  let saveBlock = "";
  if (opts.saveUrl) {
    const shown = opts.saveUrl.replace(/^https?:\/\//, "");
    const display = shown.length > 34 ? `${shown.slice(0, 31)}…` : shown;
    saveBlock = `<div class="rc-rule"></div>
      <p class="rc-head">SAVE THIS GAME:</p>
      <p class="rc-save"><a class="rc-save-link" href="${opts.saveUrl.replace(/"/g, "&quot;")}">${escapeHtml(display)}</a></p>
      <button type="button" class="rc-save-copy" data-url="${opts.saveUrl.replace(/"/g, "&quot;")}">COPY LINK</button>`;
  }
  return `
    <div class="receipt-paper" role="document">
      <p class="rc-logo">WHO? IS IT?</p>
      <p class="rc-sub">UNIVERSE RECEIPT</p>
      <p class="rc-meta">ROOM #${escapeHtml(roomCode)} · SEASON ${season}</p>
      <div class="rc-rule"></div>
      ${items}
      <div class="rc-rule"></div>
      <p class="rc-head">TONIGHT YOU WERE:</p>
      <p class="rc-cast">${you.length ? you.map(escapeHtml).join(", ") : "NOBODY (YET)"}</p>
      ${asciiRow}
      <div class="rc-rule"></div>
      <div class="rc-line"><span>ROUNDS PLAYED</span><b>${lore.length}</b></div>
      <div class="rc-line"><span>SECRETS BURNED</span><b>${secretsBurned}</b></div>
      ${statLines ? `<div class="rc-rule"></div><p class="rc-head">INCIDENT TALLY:</p>${statLines}` : ""}
      <div class="rc-rule"></div>
      <p class="rc-head">WINNERS:</p>
      ${winnersLine}
      ${awards ? `<div class="rc-rule"></div><p class="rc-head">SUPERLATIVES:</p>${awards}` : ""}
      <div class="rc-line"><span>REFUNDS</span><b>NONE</b></div>
      <div class="rc-rule"></div>
      <p class="rc-thanks">THANK YOU FOR EXISTING<br>IN THIS UNIVERSE</p>
      <div class="rc-barcode" aria-hidden="true"></div>
      <p class="rc-serial">#${escapeHtml(String(stableHash(serialSrc)).slice(0, 10))}</p>
      ${qrBlock}
      ${saveBlock}
      <p class="rc-foot">*nothing was resolved</p>
    </div>`;
}
// The compact game link: salt + settings as a URL-safe seed code. Opening it deals the exact same
// round (board, location, wheel outcome) - the shareable "my specific game" URL under the QR.
function gameLinkUrl() {
  const code = currentSeedCode().replace(/\+/g, "-").replace(/\//g, "_");
  if (!code) return "";
  const base = location.protocol === "file:" ? location.href.split("#")[0].split("?")[0] : location.origin + location.pathname;
  return `${base}?g=${code}`;
}

// ===================== Session summary: what the receipt's QR opens =====================
// The payload is self-contained (settings + players + lore-lite + stats) and rides the URL hash as
// base64, so a scanned phone needs no live room, no localStorage, no server - just the game URL.
function buildSessionSummaryPayload() {
  const s = state.settings || {};
  return {
    v: 1,
    set: { prompts: s.prompts, mystery: s.mystery, locations: s.locations, roles: s.roles, pg: s.pg, boardSize: s.boardSize },
    pc: state.playerCount || 2,
    playMode: state.playMode === "solo" ? "solo" : "team",
    names: (state.roster || []).map((r) => r.name).filter(Boolean),   // names only - no client ids in a QR
    room: state.roomCode || "0000",
    serial: state.gameSalt || "void",
    lore: (state.lore || []).slice(-12).map((e) => ({ modeName: e.modeName, names: e.names, you: e.you })),
    stats: state.stats || {},
    scoreboard: state.scoreboard || {},
    disc: loadDiscoveredModes().filter((id) => MysteryModes.all().some((e) => e.id === id)).length
  };
}
function summaryUrl() {
  const payload = btoa(unescape(encodeURIComponent(JSON.stringify(buildSessionSummaryPayload()))));
  const base = location.protocol === "file:" ? location.href.split("#")[0] : location.origin + location.pathname;
  return `${base}#summary=${payload}`;
}
function parseSummaryHash() {
  const m = /#summary=([^&]+)/.exec(location.hash || "");
  if (!m) return null;
  try {
    const p = JSON.parse(decodeURIComponent(escape(atob(m[1]))));
    return p && p.v === 1 ? p : null;
  } catch (e) { return null; }
}
// Boot hook: a #summary= URL opens the summary screen instead of the title. Returns true if shown.
function maybeShowSummaryPage() {
  const p = parseSummaryHash();
  if (!p) return false;
  showSummaryPage(p);
  return true;
}
function showSummaryPage(p) {
  document.querySelector(".session-end")?.remove();
  const setup = [
    `${p.pc || 2} player${(p.pc || 2) === 1 ? "" : "s"}`,
    (p.pc || 2) > 2 ? (p.playMode === "solo" ? "solo mode" : "team mode") : null,
    (p.names || []).length ? (p.names || []).map(escapeHtml).join(", ") : null,
    p.set && p.set.pg ? "PG mode" : null,
    p.set && p.set.boardSize ? `${p.set.boardSize} faces` : null
  ].filter(Boolean).join(" · ");
  const ov = document.createElement("div");
  ov.className = "session-end summary-page";
  ov.innerHTML = `
    <div class="se-stage">
      <div class="se-head">
        <p class="sf-eyebrow">FROM THE RECEIPT</p>
        <h2 class="sf-title se-title">SESSION<br>SUMMARY</h2>
        <p class="se-sub">${setup}${p.disc ? ` · 🎡 ${p.disc} modes discovered` : ""}</p>
      </div>
      <div class="rc-printarea"><div class="rc-window">${buildReceiptPaper({ data: p })}</div></div>
      <button type="button" class="button primary su-again">▶ PLAY THIS DECK AGAIN</button>
      <button type="button" class="button se-home">← TITLE</button>
    </div>`;
  document.body.appendChild(ov);
  const clearHash = () => { try { history.replaceState(null, "", location.pathname + location.search); } catch (e) { location.hash = ""; } };
  ov.querySelector(".su-again").addEventListener("click", () => {
    // Same deck & crew, fresh universe: restore settings + player config, new salt, clean slate.
    clearHash();
    state.settings = { ...state.settings, ...(p.set || {}) };
    state.stats = {}; state.lore = [];
    ov.remove();
    document.querySelector(".title-screen")?.remove();
    if ((p.pc || 2) >= 2 && (p.names || []).length) startLocalGame(p.pc, p.names, p.playMode === "solo" ? "solo" : "team");
    else showTitleScreen();
  });
  ov.querySelector(".se-home").addEventListener("click", () => { clearHash(); ov.remove(); showTitleScreen(); });
}
// The end-of-session CREDITS screen: FINISH SESSION leads here. Its own full-screen world (no
// game board): drifting dark gradient, a huge title, tiki hold-music, an endlessly scrolling
// credit-roll of everyone encountered this session (mode-flavoured, doubles welcome: WOKE OLIVIA
// and GALLERY OLIVIA are different people), and the receipt printing out of its slot.
// Discovering every mode upgrades it to THE COMPLETE UNIVERSE.
function showSessionEnd(opts = {}) {
  // NET-05: ending the session used to be local-only - the other player was left sitting in a dead
  // room with no explanation. Tell the peers; they print their OWN receipt (stats are per-device).
  if (state.gameMode === "online" && !opts.remote && !state.isObserver) {
    try { netSend("sessionend", {}); } catch (e) { /* offline is fine */ }
  }
  document.querySelector(".session-end")?.remove();
  const visibleModes = MysteryModes.all();
  const found = loadDiscoveredModes().filter((id) => visibleModes.some((e) => e.id === id)).length;
  const total = visibleModes.length;
  const complete = found >= total;
  // The cast: every secret from every round, captioned with its round's mode ("WOKE OLIVIA").
  let cast = [];
  (state.lore || []).forEach((e) => {
    (e.ids && e.ids.length ? e.ids : []).forEach((id) => {
      const ch = characterById(id);
      if (ch) cast.push({ img: ch.image, name: ch.name, mode: e.modeName || "ORDINARY" });
    });
  });
  if (!cast.length) cast = state.board.slice(0, 12).map((ch) => ({ img: ch.image, name: ch.name, mode: "UNCREDITED" }));
  // Pad short sessions so ONE copy of the roll is taller than any viewport - otherwise a short cast
  // clumps in a couple of rows at the very top with a big empty gap below. Duplicated for a seamless
  // loop (the -50% keyframe scrolls exactly one copy).
  const unique = cast.slice();
  while (cast.length < 48) cast = cast.concat(unique);
  cast = cast.slice(0, 48);
  const tile = (c) => `<div class="se-cast"><img src="${c.img}" alt=""><span class="se-cast-mode">${escapeHtml(String(c.mode).toUpperCase())}</span><span class="se-cast-name">${escapeHtml(c.name)}</span></div>`;
  const roll = cast.map(tile).join("");
  const ov = document.createElement("div");
  ov.className = "session-end" + (complete ? " se-complete" : "");
  ov.innerHTML = `
    <div class="se-credits" aria-hidden="true"><div class="se-roll">${roll}${roll}</div></div>
    <div class="se-stage">
      <div class="se-head">
        ${complete
          ? `<p class="sf-eyebrow">EVERY MODE. EVERY INCIDENT. EVERYONE.</p><h2 class="sf-title se-title">THE COMPLETE<br>UNIVERSE</h2>`
          : `<p class="sf-eyebrow">THAT'S THE NIGHT</p><h2 class="sf-title se-title">SESSION<br>ENDED</h2><p class="se-sub">🎡 ${found} / ${total} modes discovered — the universe isn't finished with you.</p>`}
      </div>
      <div class="rc-printarea">
        <div class="rc-printer" aria-hidden="true"><i></i></div>
        <div class="rc-window">${buildReceiptPaper({ qrUrl: summaryUrl(), saveUrl: gameLinkUrl() })}</div>
      </div>
      <div class="se-actions">
        <button type="button" class="button primary se-continue">▶ CONTINUE PLAYING</button>
        <button type="button" class="button se-savepng">🖼 SAVE THE RECEIPT</button>
        <button type="button" class="button se-home">BACK TO TITLE</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  trapOverlay(ov);   // A11Y2-01: Tab stays on the receipt actions (no Escape - closing is a decision)
  try {
    if (window.Sound) { Sound.resume(); Sound.printer(1800); Sound.creditsLoop(true); }
  } catch (e) { /* silence is acceptable at a funeral */ }
  if (complete) sfx("win");
  // Follow the printout down as it feeds so the buttons are already in view when it lands
  // (on phones the receipt is taller than the screen). Any user scroll/touch cancels the tour.
  const stage = ov.querySelector(".se-stage");
  if (stage) {
    let cancelled = false;
    const cancel = () => { cancelled = true; };
    ["wheel", "touchstart", "pointerdown"].forEach((ev) => stage.addEventListener(ev, cancel, { passive: true, once: true }));
    const t0 = performance.now();
    const DURATION = 1900, DELAY = 420;   // start shortly after the feed begins, land as it finishes
    const follow = (now) => {
      if (cancelled) return;
      const t = Math.min(1, Math.max(0, (now - t0 - DELAY) / DURATION));
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      stage.scrollTop = (stage.scrollHeight - stage.clientHeight) * ease;
      if (t < 1) requestAnimationFrame(follow);
    };
    requestAnimationFrame(follow);
  }
  // COPY LINK on the receipt: copies the full ?g= game URL (the printed text is trimmed).
  const copyBtn = ov.querySelector(".rc-save-copy");
  if (copyBtn) copyBtn.addEventListener("click", () => {
    if (navigator.clipboard) navigator.clipboard.writeText(copyBtn.dataset.url || "").catch(() => {});
    copyBtn.textContent = "COPIED ✓";
    setTimeout(() => { copyBtn.textContent = "COPY LINK"; }, 1200);
  });
  // APP-01: SAVE THE RECEIPT renders the on-screen receipt node to a PNG the player can share.
  ov.querySelector(".se-savepng")?.addEventListener("click", (e) => {
    try { saveReceiptPng(); e.currentTarget.textContent = "🖼 SAVED ✓"; setTimeout(() => { e.currentTarget.textContent = "🖼 SAVE THE RECEIPT"; }, 1600); }
    catch (err) { e.currentTarget.textContent = "Couldn't save"; }
  });
  // PERF-02: QR encoder is lazy - if it wasn't in when the receipt printed, reprint the paper with
  // the QR once it lands (the scroll/printer theatrics are not restarted).
  if (typeof qrcode === "undefined") {
    ensureQrcode().then(() => {
      if (!ov.isConnected) return;
      const win = ov.querySelector(".rc-window");
      if (win) win.innerHTML = buildReceiptPaper({ qrUrl: summaryUrl(), saveUrl: gameLinkUrl() });
      const cb = ov.querySelector(".rc-save-copy");
      if (cb) cb.addEventListener("click", () => {
        if (navigator.clipboard) navigator.clipboard.writeText(cb.dataset.url || "").catch(() => {});
        cb.textContent = "COPIED ✓";
        setTimeout(() => { cb.textContent = "COPY LINK"; }, 1200);
      });
    }).catch(() => {});
  }
  // CONTINUE PLAYING: the receipt was a checkpoint, not the end - keep the ledger and deal on.
  ov.querySelector(".se-continue").addEventListener("click", () => {
    try { if (window.Sound) Sound.creditsLoop(false); } catch (e) { /* fine */ }
    ov.remove();
    newGame();
  });
  ov.querySelector(".se-home").addEventListener("click", () => {
    // The session is over: clear the round save + ledger so the next night starts fresh.
    clearOwnSave();
    state.lore = [];
    state.stats = {};
    try { if (window.Sound) Sound.creditsLoop(false); } catch (e) { /* fine */ }
    ov.remove();
    showTitleScreen();
  });
}

function showAlmanac() {
  document.querySelector(".almanac-overlay")?.remove();
  const a = almanacLoad();
  const entries = Object.entries(a.chars)
    .map(([id, e]) => ({ id, ...e }))
    .sort((x, y) => y.unmasked - x.unmasked || y.rounds - x.rounds);
  const row = (e) => {
    const ch = characterById(e.id);
    const img = ch && ch.image ? `<img src="${ch.image}" alt="">` : `<span class="al-blank">${escapeHtml((e.name || "?")[0] || "?")}</span>`;
    const facts = (e.facts || []).slice(-3).reverse()
      .map((f) => `<p class="al-fact"><b>${escapeHtml(f.m)}:</b> ${escapeHtml(f.line)}</p>`).join("");
    return `<div class="al-row">
      <div class="al-portrait">${img}</div>
      <div class="al-body">
        <p class="al-name">${escapeHtml(e.name || "???")}</p>
        <p class="al-stats">${e.rounds} round${e.rounds === 1 ? "" : "s"} · unmasked ${e.unmasked}×</p>
        ${facts || `<p class="al-fact al-none">No incidents on record. Yet.</p>`}
      </div>
    </div>`;
  };
  const ov = document.createElement("div");
  ov.className = "almanac-overlay";
  ov.innerHTML = `
    <div class="almanac-box">
      <div class="al-head">
        <div>
          <p class="al-eyebrow">THE ALMANAC</p>
          <p class="al-sub">Everything this universe has ever established. It keeps growing.</p>
          <p class="al-discovered" title="Mystery modes you've encountered">🎡 ${loadDiscoveredModes().filter((id) => MysteryModes.all().some((e) => e.id === id)).length} / ${MysteryModes.all().length} modes discovered</p>
        </div>
        <button type="button" class="icon-button al-close" aria-label="Close">X</button>
      </div>
      <div class="al-list">${entries.length ? entries.map(row).join("") : `<p class="al-empty">Nothing on record. Finish a round — the universe will start taking notes.</p>`}</div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener("click", (e) => { if (e.target === ov || e.target.closest(".al-close")) ov.remove(); });
}
// Roughly every third round (salt-deterministic, so online peers agree) the deal pauses for a
// callback to an earlier round before the wheel spins. Pure lore - nothing mechanical.
const LORE_TEMPLATES = [
  (e, n) => `${n} has not been seen since the ${e.modeName} incident.`,
  (e, n) => `${n} would like everyone to forget what happened during ${e.modeName}. We will not.`,
  (e, n) => `The ${e.modeName} incident remains under investigation. ${n} is not cooperating.`,
  (e, n) => `Somewhere out there, ${n} is still recovering from ${e.modeName}.`,
  (e, n) => `${n} has gone home to think about what they did.`,
  (e, n) => `${e.modeName} changed ${n}. Everyone's too polite to mention it.`,
  (e, n) => `${n} maintains that ${e.modeName} "wasn't even that bad". The others disagree.`
];
// SEASON FINALE: the wheel bag just completed a full lap of every mode (flagged in
// wheelTargetFromBag). Play the recap montage of the season's lore, then roll the next season.
function showSeasonFinale(season, next) {
  const lore = (state.lore || []).slice(-8);
  const recap = lore.length
    ? lore.map((e, i) => `<p class="sf-line" style="--i:${i}">▸ ${escapeHtml(e.modeName || "A quiet round")}${e.names.length ? ` — ${escapeHtml(e.names.join(" & "))}` : ""}</p>`).join("")
    : `<p class="sf-line" style="--i:0">▸ A season of incidents nobody wrote down. Probably for the best.</p>`;
  const ov = document.createElement("div");
  ov.className = "finale-overlay";
  ov.innerHTML = `
    <div class="finale-box">
      <p class="sf-eyebrow">EVERY MODE. EVERY INCIDENT. EVERYONE.</p>
      <h2 class="sf-title">THAT'S A WRAP ON<br>SEASON ${season}</h2>
      <div class="sf-recap">${recap}</div>
      <button type="button" class="button primary sf-next">ROLL SEASON ${season + 1} →</button>
    </div>`;
  document.body.appendChild(ov);
  sfx("reveal");
  let doneOnce = false;
  const finish = () => {
    if (doneOnce) return;
    doneOnce = true;
    ov.classList.add("lore-out");
    setTimeout(() => { ov.remove(); next(); }, 420);
  };
  ov.querySelector(".sf-next").addEventListener("click", finish);
}
function maybeShowLoreCallback(next) {
  const lore = (state.lore || []).filter((entry) => entry.modeName && entry.names.length);
  const show = lore.length && stableHash(`${state.gameSalt}:lorecb`) % 3 === 0;
  if (!show) { next(); return; }
  // Prefer recent history but occasionally dig deeper - all salt-picked so peers see the same line.
  const pool = lore.slice(-5);
  const entry = pool[stableHash(`${state.gameSalt}:loree`) % pool.length];
  const name = entry.names[stableHash(`${state.gameSalt}:loren`) % entry.names.length];
  const line = LORE_TEMPLATES[stableHash(`${state.gameSalt}:loret`) % LORE_TEMPLATES.length](entry, name);
  const ov = document.createElement("div");
  ov.className = "lore-overlay";
  ov.innerHTML = `<div class="lore-box"><p class="lore-eyebrow">PREVIOUSLY, IN THIS UNIVERSE…</p><p class="lore-line">${escapeHtml(line)}</p></div>`;
  document.body.appendChild(ov);
  let doneOnce = false;
  const finish = () => {
    if (doneOnce) return;
    doneOnce = true;
    ov.classList.add("lore-out");
    setTimeout(() => { ov.remove(); next(); }, 420);
  };
  ov.addEventListener("click", finish);
  setTimeout(finish, 3600);
}
// Disabling PG mode requires solving adults-only riddles (free text) - the answers are all bits of
// grown-up life a 10-year-old wouldn't know. cb(true) if solved, cb(false) if cancelled/given up.
const ADULT_RIDDLES = [
  { q: "I'm the super-fund pot your boss is legally forced to top up, and you can't touch me till you're old. What am I?", a: ["super", "superannuation", "my super", "the super"] },
  { q: "I'm the tax office every Aussie adult dreads at return time. Three letters — what am I?", a: ["ato", "the ato", "australian taxation office", "tax office"] },
  { q: "I'm the nine-digit number you give a new employer so they don't tax you to death. Three letters for short — what am I?", a: ["tfn", "tax file number", "a tfn"] },
  { q: "I'm the uni debt that quietly follows you around and comes out of your pay once you earn enough. What am I?", a: ["hecs", "help", "hecs debt", "help debt", "hecs-help", "uni debt", "student debt"] },
  { q: "I'm the extra 2% on your tax that helps pay for the public hospital system. Two words — what am I?", a: ["medicare levy", "the medicare levy", "medicare"] },
  { q: "I'm the yearly fee that keeps your car legal to drive on the road. What am I (Aussie slang)?", a: ["rego", "registration", "car rego", "the rego"] },
  { q: "I'm the nasty government tax you cop when you buy a house or a car. Two words — what am I?", a: ["stamp duty", "the stamp duty", "duty"] },
  { q: "I'm the property-investor tax trick where your rental loses money on paper so you pay less tax. Two words — what am I?", a: ["negative gearing", "negatively geared", "gearing"] },
  { q: "I'm the loan that chains you to one house for thirty years. One word — what am I?", a: ["mortgage", "a mortgage", "home loan"] },
  { q: "I'm the interest rate the Reserve Bank sets that makes every mortgage holder sweat. Two words — what am I?", a: ["cash rate", "the cash rate", "rba cash rate", "interest rate", "rate"] },
  { q: "I'm the quarterly form a small business lodges to sort out their GST. Three letters — what am I?", a: ["bas", "business activity statement", "a bas"] },
  { q: "I'm the doctor's visit that costs you nothing because Medicare foots the bill. Two words — what am I?", a: ["bulk billing", "bulk billed", "bulkbilling"] },
  { q: "I'm the ongoing fee you pay to the body corporate for living in an apartment block. What am I?", a: ["strata", "strata fees", "body corporate", "strata levy", "levies"] }
];
function normalizeAdultAnswer(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9 ]/g, "").replace(/\s+/g, " ").trim();
}
// Hangman-style hint: the answer with ~1-in-3 letters revealed, the rest as underscores. Spaces and
// punctuation show through. e.g. "superannuation" → "_ U _ _ R _ _ _ U _ _ _ O _".
function maskRiddleAnswer(answer) {
  return String(answer || "").split("").map((ch, i) =>
    /[a-z0-9]/i.test(ch) ? (i % 3 === 1 ? ch.toUpperCase() : "_") : ch
  ).join(" ").replace(/\s{2,}/g, "   ");   // widen the gaps that land on real spaces
}
function askAdultGate(cb, required = 1) {   // one riddle is gate enough - three was a chore for the grown-ups too
  const needed = Math.max(1, Math.min(required, ADULT_RIDDLES.length));
  // Shuffle ALL riddles into a queue (not just `needed`): a hard one can be SKIPPED to a fresh one,
  // so `idx` (which riddle is showing) is tracked separately from `solved` (how many you've got).
  const riddles = ADULT_RIDDLES
    .map((r, i) => ({ r, k: Math.random() + i / 1000 }))
    .sort((a, b) => a.k - b.k)
    .map((entry) => entry.r);
  let solved = 0;
  let idx = 0;
  const ov = document.createElement("div");
  ov.className = "riddle-overlay";
  ov.innerHTML = `<div class="riddle-box">
      <p class="riddle-eyebrow">🔞 Adults only — ${needed === 1 ? "answer this to turn PG off" : `solve ${needed} to turn PG off`}</p>
      <p class="riddle-progress" ${needed === 1 ? "hidden" : ""}></p>
      <p class="riddle-q"></p>
      <p class="riddle-hint" aria-label="answer hint"></p>
      <input class="riddle-input" type="text" placeholder="type your answer…" autocomplete="off" spellcheck="false">
      <p class="riddle-msg"></p>
      <div class="riddle-actions">
        <button type="button" class="button ghost riddle-cancel">Never mind</button>
        <button type="button" class="button ghost riddle-skip">Skip ↻</button>
        <button type="button" class="button primary riddle-go">Answer</button>
      </div>
    </div>`;
  const riddleHost = els.setupDialog && els.setupDialog.open ? els.setupDialog : document.body;
  riddleHost.appendChild(ov);
  const input = ov.querySelector(".riddle-input");
  const msg = ov.querySelector(".riddle-msg");
  const progress = ov.querySelector(".riddle-progress");
  const question = ov.querySelector(".riddle-q");
  const hint = ov.querySelector(".riddle-hint");
  setTimeout(() => input.focus(), 60);
  const done = (ok) => { ov.remove(); cb(ok); };
  const paint = () => {
    const r = riddles[idx];
    progress.textContent = `${solved} / ${needed} correct`;
    question.textContent = r.q;
    hint.textContent = maskRiddleAnswer(r.a[0]);   // these are hard - give a hangman-style skeleton
    msg.textContent = "";
    input.value = "";
    input.focus();
  };
  const nextRiddle = () => { idx = (idx + 1) % riddles.length; paint(); };
  const submit = () => {
    const r = riddles[idx];
    const val = normalizeAdultAnswer(input.value);
    const answers = r.a.map(normalizeAdultAnswer);
    if (answers.includes(val)) {
      solved += 1;
      if (solved >= needed) { done(true); return; }
      nextRiddle();
      return;
    }
    msg.textContent = "That's not it — PG mode stays on. Keep going, Skip it, or ask a grown-up.";
    input.classList.add("shake");
    setTimeout(() => input.classList.remove("shake"), 400);
    input.select();
  };
  ov.querySelector(".riddle-go").addEventListener("click", submit);
  ov.querySelector(".riddle-skip").addEventListener("click", nextRiddle);   // too hard? grab a different one
  ov.querySelector(".riddle-cancel").addEventListener("click", () => done(false));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") done(false); });
  paint();
}

// Device prefs that outlive rounds (board size, sound) - set from the TITLE screen only, so
// nobody can quietly resize the board mid-game and desync everyone else.
const PREFS_KEY = "whoisit_prefs_v1";
function loadPrefs() {
  try { return JSON.parse(localStorage.getItem(PREFS_KEY) || "{}") || {}; } catch (e) { return {}; }
}
function savePrefs(patch) {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify({ ...loadPrefs(), ...patch })); } catch (e) { /* fine */ }
}
// Agent-driven browsers reload this game dozens of times a session, and every launch fired the full
// SFX bed at whoever was sitting in the room. Automation starts silent.
//
// This is a RUNTIME override, never written to device prefs - a real browser on the same machine
// keeps whatever the human chose. Detection covers Claude Code's preview pane (a `Claude/` token in
// the Electron UA - it does NOT set navigator.webdriver), Playwright/Selenium/Puppeteer (which do),
// and headless or Codex-driven Chrome. `?mute` forces silence anywhere; `?audio=on` overrides all of
// it when you actually want to hear the game inside an agent session.
function isAgentBrowser() {
  try {
    const params = new URLSearchParams(location.search);
    if (params.has("mute") || params.has("silent")) return true;
    if (params.get("audio") === "on") return false;
    const ua = navigator.userAgent || "";
    return navigator.webdriver === true
      || /\bClaude\//.test(ua)
      || /HeadlessChrome|Playwright|Puppeteer|Codex|Selenium/i.test(ua);
  } catch (e) { return false; }
}
function showTitleSettings() {
  document.querySelector(".ts-settings-panel")?.remove();
  const S = window.Sound;
  const panel = document.createElement("div");
  panel.className = "ts-settings-panel";
  const sizeBtns = BOARD_SIZES.map((n) =>
    `<button type="button" class="tsp-size ${state.settings.boardSize === n ? "on" : ""}" data-n="${n}">${n}</button>`).join("");
  const trackOpts = (S ? S.trackNames() : []).map((t, i) =>
    `<option value="${i}" ${S && S.currentTrack() === i ? "selected" : ""}>${escapeHtml(t)}</option>`).join("");
  panel.innerHTML = `
    <div class="tsp-box">
      <div class="tsp-head"><b>SETTINGS</b><button type="button" class="icon-button tsp-close" aria-label="Close">X</button></div>
      <div class="tsp-row"><span>Board size</span><span class="tsp-sizes">${sizeBtns}</span></div>
      <div class="tsp-row"><span>Sound</span><label class="tsp-toggle"><input type="checkbox" class="tsp-sound" ${S && S.isEnabled() ? "checked" : ""}><i></i></label></div>
      <div class="tsp-row"><span>Music</span><label class="tsp-toggle"><input type="checkbox" class="tsp-music" ${S && S.isMusicOn() ? "checked" : ""}><i></i></label></div>
      <div class="tsp-row"><span>Track</span><select class="tsp-track button ghost">${trackOpts}</select></div>
      <p class="tsp-note">Board size applies from the next deal. It can't be changed mid-game.</p>
    </div>`;
  document.body.appendChild(panel);
  panel.addEventListener("click", (e) => { if (e.target === panel || e.target.closest(".tsp-close")) panel.remove(); });
  panel.querySelectorAll(".tsp-size").forEach((b) => b.addEventListener("click", () => {
    state.settings.boardSize = Number(b.dataset.n);
    savePrefs({ boardSize: state.settings.boardSize });
    panel.querySelectorAll(".tsp-size").forEach((x) => x.classList.toggle("on", x === b));
    sfx("blip");
  }));
  panel.querySelector(".tsp-sound").addEventListener("change", (e) => { if (S) S.setEnabled(e.target.checked); savePrefs({ sound: e.target.checked }); });
  panel.querySelector(".tsp-music").addEventListener("change", (e) => { if (S) { S.resume(); S.setMusic(e.target.checked); } savePrefs({ music: e.target.checked }); });
  panel.querySelector(".tsp-track").addEventListener("change", (e) => { if (S) { S.setTrack(Number(e.target.value)); } savePrefs({ track: Number(e.target.value) }); });
}
// PG toggle now lives INSIDE the local/host setup steps (not the main menu), so it's chosen in
// context right before a game. Same control markup in both places; a single handler keeps them synced.
// The landing ticker is now the GAME'S OWN voice, not a separate reel of corporate icebreakers -
// real dares (mild/medium) + the location dares, with {location} resolved to a scene. First
// impressions should sound like the game you're about to play.
const TITLE_TICKER_QUESTIONS = (() => {
  const gd = window.GameData || {};
  const scenes = (gd.locations || [{ name: "the party" }]);
  const resolveTokens = (t) => t
    .replace(/\{location\}/g, `the ${scenes[stableHash(t) % scenes.length].name}`)
    .replace(/\{who\}/g, "your character");
  const dares = (gd.absurdPrompts || []).filter((p) => p.heat !== "feral").map((p) => resolveTokens(p.text));
  const locs = (gd.locationPrompts || []).filter((p) => p.heat !== "feral").map((p) => resolveTokens(p.text));
  const pool = [...dares, ...locs].map((t) => t.replace(/[.…]+$/, ""));
  return pool.length ? pool : ["WHO IS IT?"];
})();
const TITLE_TICKER_DURATIONS = [70, 84, 96, 110, 125, 88, 104, 118, 76, 132];
const TITLE_TICKER_OPACITIES = [0.13, 0.18, 0.15, 0.22, 0.16, 0.2, 0.14, 0.24, 0.17, 0.21];
function titleTickerRowText(rowIndex) {
  const total = TITLE_TICKER_QUESTIONS.length;
  const count = 6 + (rowIndex % 3);
  const parts = [];
  for (let i = 0; i < count; i += 1) {
    parts.push(TITLE_TICKER_QUESTIONS[(rowIndex * 5 + i * 3 + (rowIndex % 2 ? 1 : 0)) % total]);
  }
  return `${parts.join(" • ")} • `;
}
function buildTitleTickerRows(count = 10) {
  return Array.from({ length: count }, (_, rowIndex) => {
    const text = escapeHtml(titleTickerRowText(rowIndex));
    const duration = TITLE_TICKER_DURATIONS[rowIndex % TITLE_TICKER_DURATIONS.length];
    const opacity = TITLE_TICKER_OPACITIES[rowIndex % TITLE_TICKER_OPACITIES.length];
    const delay = -((rowIndex * 11) % duration);
    return `
      <div class="ts-qrow ${rowIndex % 2 ? "is-reverse" : ""}" style="--ticker-duration:${duration}s; --ticker-opacity:${opacity}; --ticker-delay:${delay}s;">
        <div class="ts-qtrack">
          <span>${text}</span>
          <span aria-hidden="true">${text}</span>
        </div>
      </div>
    `;
  }).join("");
}
// Bold, single-colour line icons for the whole title menu - no emoji, so every row reads as one
// consistent set. Drawn on a 24-grid with currentColor, so they inherit each pill's ink (navy on
// white/yellow) and match automatically. Wrapped in the .ts-ico slot (icon + hairline separator).
const TS_ICONS = {
  play: '<path d="M8 6.5 18 12 8 17.5Z" fill="currentColor" stroke="none"/>',
  local: '<path d="M4 10.5V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v2.5"/><path d="M3.5 10.5h17a1.5 1.5 0 0 1 1.5 1.5V17H2v-5a1.5 1.5 0 0 1 1.5-1.5Z"/><path d="M5 19v-2M19 19v-2"/>',
  online: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  host: '<path d="M4 11.5 12 5l8 6.5"/><path d="M6 10.5V19h12v-8.5"/><path d="M10 19v-4.5h4V19"/>',
  join: '<circle cx="8.5" cy="12" r="3.5"/><path d="M11.8 11h8.7v3M17 11v2.5"/>',
  tv: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M8 4l4 4 4-4"/>',
  door: '<path d="M13.5 3.5H7A1.5 1.5 0 0 0 5.5 5v14A1.5 1.5 0 0 0 7 20.5h6.5"/><path d="M13.5 3 18.5 5v14l-5 2z"/><circle cx="15.4" cy="12" r="0.9" fill="currentColor" stroke="none"/>',
  back: '<path d="M14.5 5 8 12l6.5 7"/>',
  add: '<path d="M12 5.5v13M5.5 12h13"/>',
  dice: '<rect x="4" y="4" width="16" height="16" rx="3.5"/><circle cx="9" cy="9" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="9" r="1.4" fill="currentColor" stroke="none"/><circle cx="9" cy="15" r="1.4" fill="currentColor" stroke="none"/><circle cx="15" cy="15" r="1.4" fill="currentColor" stroke="none"/>',
  resume: '<path d="M4 12a8 8 0 1 1 2.4 5.7"/><path d="M4 8v4h4"/>',
  pg: '<path d="M12 3.5 5 6.2v5c0 4.3 2.9 7.3 7 9.3 4.1-2 7-5 7-9.3v-5z"/><path d="M9.2 12.2l2 2 3.6-4"/>',
  team: '<circle cx="8.5" cy="9" r="2.6"/><circle cx="16" cy="9.5" r="2.2"/><path d="M3.8 18c.4-2.8 2.3-4.4 4.7-4.4s4.3 1.6 4.7 4.4z"/><path d="M14.5 13.9c2 .2 3.5 1.7 3.8 4.1"/>',
  board: '<rect x="4" y="4" width="16" height="16" rx="2.2"/><path d="M4 10h16M4 15h16M9.5 4v16M14.5 4v16"/>'
};
function tsIcon(name) {
  const p = TS_ICONS[name] || "";
  return `<span class="ts-ico"><svg class="ts-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg></span>`;
}
// Sound / music icons come as an on+off pair so the toggle CROSSFADES between the two glyphs.
const TS_AUDIO_ICONS = {
  sound: {
    on: '<path d="M4 9.5h3.2L12 6v12l-4.8-3.5H4z"/><path d="M15.5 9a4 4 0 0 1 0 6M18 6.8a7.2 7.2 0 0 1 0 10.4"/>',
    off: '<path d="M4 9.5h3.2L12 6v12l-4.8-3.5H4z"/><path d="M16.5 9.5l5 5M21.5 9.5l-5 5"/>'
  },
  music: {
    on: '<circle cx="7" cy="17.5" r="2.5"/><circle cx="17" cy="15.5" r="2.5"/><path d="M9.5 17.5V6l10-2v11.5M9.5 9l10-2"/>',
    off: '<circle cx="7" cy="17.5" r="2.5"/><path d="M9.5 17.5V6l10-2v4"/><path d="M4 4l16 16"/>'
  }
};
function tsAudioIconSlot(kind) {
  const g = TS_AUDIO_ICONS[kind];
  const svg = (cls, body) => `<svg class="ts-svg ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  return `<span class="ts-ico ts-ico-audio">${svg("ico-on", g.on)}${svg("ico-off", g.off)}</span>`;
}
function pgToggleMarkup() {
  const on = state.settings.pg;
  return `<button type="button" class="ts-opt ts-pg ${on ? "on" : ""}" aria-pressed="${on}">${tsIcon("pg")}<span class="ts-opt-label">PG mode</span><b class="ts-chip">${on ? "ON" : "OFF"}</b></button>`;
}
function yoloToggleMarkup() {
  const on = state.settings.groupthinkYolo !== false;
  return `<button type="button" class="ts-opt ts-yolo ${on ? "on" : ""}" aria-pressed="${on}">${tsIcon("dice")}<span class="ts-opt-label ts-yolo-label">YOLO MODE<small>${on ? "PERMANENT CUTS" : "FULL DECK · 8 ROUNDS"}</small></span><b class="ts-chip">${on ? "ON" : "OFF"}</b></button>`;
}
// Board size lives inline in the setup step now (no nested settings panel).
function boardSizeMarkup() {
  const pills = BOARD_SIZES.map((n) => `<button type="button" class="ts-size ${state.settings.boardSize === n ? "on" : ""}" data-n="${n}">${n}</button>`).join("");
  return `<div class="ts-opt ts-opt-board">${tsIcon("board")}<span class="ts-opt-label">Board</span><span class="ts-size-pills">${pills}</span></div>`;
}
function startModeMarkup(selectClass = "") {
  const options = startModeOptions().map((mode) => `
    <option value="${escapeHtml(mode.id)}" ${normalizedStartModeId() === mode.id ? "selected" : ""}>${escapeHtml(mode.name)}</option>
  `).join("");
  return `<label class="ts-opt ts-opt-select">${tsIcon("dice")}<span class="ts-opt-label">Game Mode</span><span class="ts-select-shell"><select class="ts-mode-select ${escapeHtml(selectClass)}" aria-label="Game mode">${options}</select></span></label>`;
}
// The SAME mode picker the in-game setup dialog uses (Progressive / Chaotic / Custom + the tier grid),
// so the title menu and the setup gear stay in lockstep. Reuses the .mode-* classes for shared styling;
// the .ts-mode-lineup wrapper only recolours them to the title's translucent palette.
function modeLineupMarkup() {
  const policy = effectiveModePolicy();
  const chips = [
    ["progressive", "Progressive"],
    ["chaotic", "Chaotic"],
    ["custom", "Custom"]
  ].map(([value, title]) =>
    `<button type="button" class="mode-policy-chip ${policy === value ? "is-on" : ""}" data-policy="${value}" aria-pressed="${policy === value}"><b>${escapeHtml(title)}</b></button>`
  ).join("");
  const selected = new Set(normalizedAllowedModeIds());
  const groups = mysteryModeGroups().map((group) => `
    <section class="mode-group">
      <div class="mode-group-head"><strong>${escapeHtml(group.label)}</strong><small>${group.items.length} modes</small></div>
      <div class="mode-check-grid">
        ${group.items.map((effect) => `
          <label class="mode-check-row">
            <input class="mode-check" type="checkbox" value="${escapeHtml(effect.id)}" ${selected.has(effect.id) ? "checked" : ""}>
            <span class="mode-check-copy"><b>${escapeHtml(effect.name)}</b></span>
          </label>`).join("")}
      </div>
    </section>`).join("");
  // Custom only: choose whether each new round's mode is drawn at random from the ticked set, or
  // hand-picked by the players at the end of every round (buttons appear on the ROUND OVER screen).
  const manual = state.settings.roundPicker === "manual";
  const roundPick = `
    <div class="ts-roundpick">
      <span class="ts-roundpick-label">ROUND PICKER</span>
      <div class="ts-roundpick-seg" role="group" aria-label="Round picker">
        <button type="button" class="ts-roundpick-opt ${manual ? "" : "is-on"}" data-pick="random">Random</button>
        <button type="button" class="ts-roundpick-opt ${manual ? "is-on" : ""}" data-pick="manual">Selected</button>
      </div>
    </div>`;
  return `<div class="ts-mode-lineup mode-section ${policy === "custom" ? "is-custom" : ""}">
    <div class="ts-lineup-head">MODE LINEUP</div>
    <div class="mode-policy-toggles">${chips}</div>
    <div class="mode-picker-wrap">${roundPick}<div class="mode-picker">${groups}</div></div>
  </div>`;
}
// Two independent settings rows: game sounds (FX) and music, each with an animated on/off glyph.
function audioToggleMarkup() {
  // Initial states come from device prefs so they survive reloads (Sound.isMusicOn() also checks the
  // track, so it can't seed the button).
  const prefs = loadPrefs();
  const agent = isAgentBrowser();
  const sfxOn = !agent && prefs.sound !== false;
  const musicOn = !agent && prefs.music !== false;
  const row = (cls, kind, label, on) =>
    `<button type="button" class="ts-opt ts-audio ${cls} ${on ? "on" : ""}" aria-pressed="${on}">${tsAudioIconSlot(kind)}<span class="ts-opt-label">${label}</span><b class="ts-chip">${on ? "ON" : "OFF"}</b></button>`;
  return row("ts-sound", "sound", "Sound", sfxOn) + row("ts-music", "music", "Music", musicOn);
}
function showTitleScreen() {
  document.title = "WHO? KNOWS?";
  document.body.classList.remove("ruleset-groupthink", "ruleset-whodidyoumake");
  applyRulesetChrome("whoisit");
  // The alternate rulesets paint full-screen ceremonies (handoff, reveal, finale, intro) into fixed
  // overlays at z-index 12000+, well above the title screen's 2000. If we reach the menu while one is
  // still up (e.g. keyboard-opening setup during a reveal, since #app is not inert there), it would
  // sit on top of the menu and block it. Tear them down at the single funnel every menu-return uses.
  document.querySelectorAll(".gt-results, .gt-finale, .gt-handoff, .gt-intro-warp, .wdym-handoff, .wdym-peek-overlay").forEach((el) => el.remove());
  if (els.swapSeatButton) els.swapSeatButton.hidden = false;
  const saved = loadGameSave();
  const ov = document.createElement("div");
  ov.className = "title-screen title-landing";
  // AES2-01: one quiet anchor for the empty lower half on TALL screens - a slow marquee of the mode
  // roster at low opacity. CSS only shows it >=900px tall and hides it while the menu is open.
  const marqueeNames = MysteryModes.all().map((e) => e.name.toUpperCase()).join(" · ");
  ov.innerHTML = `
    <div class="ts-ticker-field" aria-hidden="true">${buildTitleTickerRows(20)}</div>
    <div class="ts-mode-marquee" aria-hidden="true"><span>${escapeHtml(marqueeNames)} · ${escapeHtml(marqueeNames)} · </span></div>
    <div class="ts-legibility" aria-hidden="true"></div>
    <div class="ts-stage">
      <div class="ts-poster-slot">
        <div class="ts-poster">
          <div class="ts-words" aria-hidden="true">
            <span class="ts-who">WHO?</span>
            <span class="ts-isit">KNOWS?</span>
          </div>
          <p class="ts-anthology">THE DERANGED ANTHOLOGY</p>
          <div class="ts-cta">
            <button type="button" class="button primary ts-letplay">${tsIcon("play")}<span class="ts-lbl">LET'S PLAY</span></button>
            ${saved ? `<button type="button" class="button ghost ts-resume ts-resume-splash">${saved.gameMode === "online"
              ? `${tsIcon("online")}<span class="ts-lbl">${saved.inLobby ? "REJOIN LOBBY" : "RESUME"} · #${escapeHtml(saved.roomCode || "?")}</span>`
              : `${tsIcon("resume")}<span class="ts-lbl">RESUME LAST GAME</span>`}</button>` : ""}
          </div>
        </div>
      </div>
      <div class="ts-actions">
        <div class="ts-step ts-step-ruleset" hidden>
          <div class="ts-ruleset-head">
            <span>CHOOSE YOUR GAME</span>
            <small>SAME FACES. DIFFERENT DAMAGE.</small>
          </div>
          <div class="ts-ruleset-carousel">
            <button type="button" class="ts-rs-arrow ts-rs-prev" aria-label="Previous game" tabindex="-1">‹</button>
            <div class="ts-ruleset-grid" role="group" aria-label="Choose a game">
            <button type="button" class="button ts-ruleset ts-ruleset-whoisit" data-ruleset="whoisit" aria-label="Play WHO? IS IT?">
              <span class="ts-ruleset-logo ts-ruleset-logo-whoisit" aria-hidden="true">
                <span class="ts-rs-who">WHO?</span>
                <span class="ts-rs-isit">IS IT?</span>
              </span>
              <small><span>ASK.</span><span>ACCUSE.</span><span>UNMASK.</span></small>
              ${(() => {
                // The mystery wheel belongs to WHO? IS IT?, so its discovery count rides on this card
                // alone - never groupthink/whodidyoumake, never the poster. Hidden until 3+ unlocked so
                // first-timers see nothing (APP-02).
                const total = MysteryModes.all().length;
                const disc = loadDiscoveredModes().filter((id) => MysteryModes.all().some((e) => e.id === id)).length;
                return disc >= 3 ? `<p class="ts-discovery" title="Mystery modes you've unlocked">🎡 ${disc} / ${total} modes discovered</p>` : "";
              })()}
              <span class="ts-ruleset-enter" aria-hidden="true">PLAY</span>
            </button>
            <button type="button" class="button ts-ruleset ts-ruleset-groupthink" data-ruleset="groupthink" aria-label="Play WHO? DO YOU THINK?">
              <span class="ts-ruleset-logo ts-ruleset-logo-groupthink" aria-hidden="true">
                <span class="ts-rs-who">WHO?</span>
                <span class="ts-rs-doyouthink">DO YOU THINK?</span>
              </span>
              <small><span>LOOK.</span><span>POINT.</span><span>REGRET.</span></small>
              <span class="ts-ruleset-enter" aria-hidden="true">PLAY</span>
            </button>
            <button type="button" class="button ts-ruleset ts-ruleset-whodidyoumake" data-ruleset="whodidyoumake" aria-label="Play WHO? DID YOU MAKE?">
              <span class="ts-ruleset-logo ts-ruleset-logo-whodidyoumake" aria-hidden="true">
                <span class="ts-rs-who">WHO?</span>
                <span class="ts-rs-didyoumake">DID YOU MAKE?</span>
              </span>
              <small><span>STEAL.</span><span>STITCH.</span><span>WEAR IT.</span></small>
              <span class="ts-ruleset-enter" aria-hidden="true">PLAY</span>
            </button>
            </div>
            <button type="button" class="ts-rs-arrow ts-rs-next" aria-label="Next game" tabindex="-1">›</button>
          </div>
          <div class="ts-rs-dots" aria-hidden="true"><i data-rs-dot="0"></i><i data-rs-dot="1"></i><i data-rs-dot="2"></i></div>
          <button type="button" class="button ghost ts-ruleset-back">${tsIcon("back")}<span class="ts-lbl">BACK</span></button>
        </div>
        <div class="ts-step ts-step-main" hidden>
          <button type="button" class="button primary ts-local">${tsIcon("local")}<span class="ts-lbl">LOCAL GAME</span></button>
          <button type="button" class="button secondary ts-online">${tsIcon("online")}<span class="ts-lbl">ONLINE GAME</span></button>
          ${audioToggleMarkup()}
          <button type="button" class="button ghost ts-splash-back">${tsIcon("back")}<span class="ts-lbl">BACK</span></button>
      </div>
      <div class="ts-step ts-step-names" hidden>
        <div class="ts-names-list"></div>
        <button type="button" class="ts-add-player">${tsIcon("add")}<span class="ts-lbl">ADD PLAYER</span></button>
        <label class="ts-opt ts-team-mode" hidden>
          ${tsIcon("team")}<span class="ts-opt-label">Team Mode</span>
          <input class="ts-team-mode-input" type="checkbox" checked>
          <b class="ts-chip">ON</b>
        </label>
        ${yoloToggleMarkup()}
        ${modeLineupMarkup()}
        ${pgToggleMarkup()}
        ${boardSizeMarkup()}
        ${audioToggleMarkup()}
        <div class="ts-btn-row">
          <button type="button" class="button ghost ts-back">${tsIcon("back")}<span class="ts-lbl">BACK</span></button>
          <button type="button" class="button primary ts-names-go">${tsIcon("dice")}<span class="ts-lbl">BEGIN</span></button>
        </div>
      </div>
      <div class="ts-step ts-step-online" hidden>
        <input class="ts-name-input" type="text" maxlength="16" placeholder="Your name" aria-label="Your name">
        ${modeLineupMarkup()}
        <button type="button" class="button primary ts-host">${tsIcon("host")}<span class="ts-lbl">HOST A ROOM</span></button>
        <button type="button" class="button secondary ts-showjoin">${tsIcon("join")}<span class="ts-lbl">JOIN A ROOM</span></button>
        <button type="button" class="button ghost ts-observe">${tsIcon("tv")}<span class="ts-lbl">DISPLAY ON A TV</span></button>
        <button type="button" class="button ghost ts-back">${tsIcon("back")}<span class="ts-lbl">BACK</span></button>
      </div>
      <div class="ts-step ts-step-join" hidden>
        <p class="ts-join-label">Enter your friend's room number</p>
        <input class="ts-join-input" type="text" inputmode="numeric" maxlength="4" placeholder="1234" aria-label="Room code to join">
        <button type="button" class="button primary ts-join-go">${tsIcon("door")}<span class="ts-lbl">JOIN ROOM</span></button>
        <button type="button" class="button ghost ts-back">${tsIcon("back")}<span class="ts-lbl">BACK</span></button>
      </div>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const close = () => { if (window.Sound) Sound.titleLoop(false); ov.classList.add("ts-out"); setTimeout(() => ov.remove(), 500); };
  // The title groove (bass + drums) can only start after a user gesture unlocks the AudioContext.
  ov.addEventListener("pointerdown", () => { if (window.Sound) { Sound.resume(); Sound.titleLoop(true); } }, { once: true });
  // Every menu tap clicks (PG plays its own richer sound; mode-lineup chips get rebuilt so they play
  // their own click via the delegated handler below).
  ov.querySelectorAll("button:not(.ts-pg):not(.ts-yolo):not(.mode-policy-chip)").forEach((b) => b.addEventListener("click", () => sfx("click")));
  // PG toggle(s): the same control appears in the local + host setup steps; one handler keeps every
  // instance in sync. Turning PG ON is free; turning it OFF is gated behind an adults-only riddle.
  const paintPg = () => ov.querySelectorAll(".ts-pg").forEach((b) => {
    b.classList.toggle("on", state.settings.pg);
    b.querySelector("b").textContent = state.settings.pg ? "ON" : "OFF";
    b.setAttribute("aria-pressed", String(state.settings.pg));
  });
  ov.querySelectorAll(".ts-pg").forEach((pgBtn) => pgBtn.addEventListener("click", () => {
    if (!state.settings.pg) { setPgMode(true); paintPg(); paintStartModes(); repaintLineups(); sfx("blip"); return; }
    askAdultGate((ok) => {
      if (ok) { setPgMode(false); paintPg(); paintStartModes(); repaintLineups(); sfx("coin"); }
      else { setPgMode(true); paintPg(); paintStartModes(); repaintLineups(); sfx("buzzer"); }
    });
  }));
  const paintYolo = () => ov.querySelectorAll(".ts-yolo").forEach((button) => {
    const on = state.settings.groupthinkYolo !== false;
    button.classList.toggle("on", on);
    button.setAttribute("aria-pressed", String(on));
    button.querySelector(".ts-chip").textContent = on ? "ON" : "OFF";
    button.querySelector(".ts-yolo-label small").textContent = on ? "PERMANENT CUTS" : "FULL DECK · 8 ROUNDS";
  });
  ov.querySelectorAll(".ts-yolo").forEach((button) => button.addEventListener("click", () => {
    state.settings.groupthinkYolo = state.settings.groupthinkYolo === false;
    savePrefs({ groupthinkYolo: state.settings.groupthinkYolo });
    paintYolo();
    sfx("blip");
  }));
  // Inline settings (board size + sound + music) live in the local/host steps, mirrored across both.
  ov.querySelectorAll(".ts-size").forEach((btn) => btn.addEventListener("click", () => {
    const n = Number(btn.dataset.n);
    state.settings.boardSize = n;
    savePrefs({ boardSize: n });
    ov.querySelectorAll(".ts-size").forEach((x) => x.classList.toggle("on", Number(x.dataset.n) === n));
    sfx("blip");
  }));
  // Sound FX and music toggle independently; each keeps its twin (names + online steps) in sync.
  const paintAudio = (sel, on) => ov.querySelectorAll(sel).forEach((x) => {
    x.classList.toggle("on", on); x.setAttribute("aria-pressed", String(on)); x.querySelector("b").textContent = on ? "ON" : "OFF";
  });
  const paintStartModes = () => {
    const selected = normalizedStartModeId();
    const options = startModeOptions();
    ov.querySelectorAll(".ts-mode-select").forEach((select) => {
      select.innerHTML = options.map((mode) => `<option value="${escapeHtml(mode.id)}">${escapeHtml(mode.name)}</option>`).join("");
      select.value = options.some((mode) => mode.id === selected) ? selected : "";
    });
  };
  const setStartMode = (value) => {
    state.settings.startModeId = value || "";
    state.settings = normalizeGameSettings(state.settings);
    paintStartModes();
  };
  ov.querySelectorAll(".ts-sound").forEach((btn) => btn.addEventListener("click", () => {
    const on = !btn.classList.contains("on");
    if (window.Sound) { Sound.setEnabled(on); if (on) Sound.resume(); }
    savePrefs({ sound: on });
    paintAudio(".ts-sound", on);
  }));
  ov.querySelectorAll(".ts-music").forEach((btn) => btn.addEventListener("click", () => {
    const on = !btn.classList.contains("on");
    if (window.Sound) { if (on) Sound.resume(); Sound.setMusic(on); if (on) Sound.titleLoop(true); }
    savePrefs({ music: on });
    paintAudio(".ts-music", on);
  }));
  ov.querySelectorAll(".ts-mode-select").forEach((select) => select.addEventListener("change", () => setStartMode(select.value)));
  // Mode lineup: same picker as the setup gear. There are two instances (local + online steps); rather
  // than wire each, we delegate on the overlay and keep them in lockstep off state.settings.
  const repaintLineups = () => ov.querySelectorAll(".ts-mode-lineup").forEach((node) => { node.outerHTML = modeLineupMarkup(); });
  ov.addEventListener("click", (e) => {
    const pick = e.target.closest(".ts-roundpick-opt");
    if (pick) {
      state.settings.roundPicker = pick.dataset.pick === "manual" ? "manual" : "random";
      repaintLineups();
      sfx("blip");
      return;
    }
    const chip = e.target.closest(".ts-mode-lineup .mode-policy-chip");
    if (!chip) return;
    state.settings.modePolicy = chip.dataset.policy;
    state.settings = normalizeGameSettings(state.settings);
    repaintLineups();
    sfx("blip");
  });
  ov.addEventListener("change", (e) => {
    const box = e.target.closest(".ts-mode-lineup .mode-check");
    if (!box) return;
    const lineup = box.closest(".ts-mode-lineup");
    const ids = [...lineup.querySelectorAll(".mode-check:checked")].map((b) => b.value);
    state.settings.allowedModeIds = ids;   // raw picks; the empty->all fallback happens at game start
    ov.querySelectorAll(".ts-mode-lineup").forEach((node) => {
      if (node === lineup) return;
      node.querySelectorAll(".mode-check").forEach((b) => { b.checked = ids.includes(b.value); });
    });
    sfx("blip");
  });
  const openSplash = () => {
    observeMode = false;
    ov.classList.remove("ts-menu-open", "ts-ruleset-open", "has-ruleset");
    ov.classList.remove("is-groupthink", "is-whodidyoumake");
    const posterAnswer = ov.querySelector(".ts-poster .ts-isit");
    if (posterAnswer) posterAnswer.textContent = "KNOWS?";
    Object.values(steps).forEach((el) => {
      el.hidden = true;
      el.classList.remove("ts-step-enter");
    });
  };
  const steps = {
    ruleset: ov.querySelector(".ts-step-ruleset"),
    main: ov.querySelector(".ts-step-main"),
    names: ov.querySelector(".ts-step-names"),
    online: ov.querySelector(".ts-step-online"),
    join: ov.querySelector(".ts-step-join")
  };
  const paintTitleRuleset = (ruleset = null) => {
    const key = ruleset ? normalizeRuleset(ruleset) : null;
    ov.classList.toggle("has-ruleset", !!key);
    ov.classList.toggle("is-groupthink", key === "groupthink");
    ov.classList.toggle("is-whodidyoumake", key === "whodidyoumake");
    const posterAnswer = ov.querySelector(".ts-poster .ts-isit");
    if (posterAnswer) posterAnswer.textContent = key === "groupthink"
      ? "DO YOU THINK?"
      : key === "whodidyoumake" ? "DID YOU MAKE?" : key === "whoisit" ? "IS IT?" : "KNOWS?";
  };
  // FOCUS CAROUSEL: the centred game gets .is-focus (crisp); the neighbours blur/dim/peek. Scroll,
  // arrows and dots navigate; a tap on a blurred neighbour centres it instead of starting the game.
  const rsTrack = ov.querySelector(".ts-ruleset-grid");
  const rsCards = [...ov.querySelectorAll(".ts-ruleset")];
  const rsDots = [...ov.querySelectorAll("[data-rs-dot]")];
  let rsFocusIdx = 0, rsRaf = 0, rsUserScroll = false;
  const rsSetFocus = (idx) => {
    rsFocusIdx = idx;
    rsCards.forEach((c, i) => c.classList.toggle("is-focus", i === idx));
    rsDots.forEach((d, i) => d.classList.toggle("is-on", i === idx));
  };
  const rsCentreOn = (idx, smooth = true) => {
    const card = rsCards[idx]; if (!card) return;
    rsSetFocus(idx);
    // This scroll is OURS, and we already set the focus it lands on. Drop back out of user-scroll mode
    // so rsSyncFromScroll ignores the scroll events it fires - otherwise, if the track hasn't finished
    // laying out, sync reads a half-applied scrollLeft and drags focus onto a neighbour.
    rsUserScroll = false;
    rsTrack.scrollTo({ left: card.offsetLeft - (rsTrack.clientWidth - card.clientWidth) / 2, behavior: smooth ? "smooth" : "auto" });
  };
  const rsSyncFromScroll = () => {
    const mid = rsTrack.scrollLeft + rsTrack.clientWidth / 2;
    let best = 0, bestD = Infinity;
    rsCards.forEach((c, i) => { const cc = c.offsetLeft + c.clientWidth / 2; const d = Math.abs(cc - mid); if (d < bestD) { bestD = d; best = i; } });
    if (best !== rsFocusIdx) rsSetFocus(best);
  };
  if (rsTrack) {
    // Only a scroll the USER started may move the focus. Anything else is one of our own centre-scrolls,
    // which has already set the focus it means to land on.
    ["pointerdown", "touchstart", "wheel"].forEach((evt) =>
      rsTrack.addEventListener(evt, () => { rsUserScroll = true; }, { passive: true }));
    rsTrack.addEventListener("scroll", () => { if (!rsUserScroll || rsRaf) return; rsRaf = requestAnimationFrame(() => { rsRaf = 0; rsSyncFromScroll(); }); }, { passive: true });
    ov.querySelector(".ts-rs-prev")?.addEventListener("click", () => rsCentreOn(Math.max(0, rsFocusIdx - 1)));
    ov.querySelector(".ts-rs-next")?.addEventListener("click", () => rsCentreOn(Math.min(rsCards.length - 1, rsFocusIdx + 1)));
    rsDots.forEach((d, i) => d.addEventListener("click", () => rsCentreOn(i)));
  }
  const show = (name) => {
    // Set focus synchronously so an immediate click lands on the centred card (no race), then centre the
    // scroll after a double rAF: the step was just un-hidden, so its offsets aren't final until it lays
    // out, and centring on stale geometry would let the scroll-sync flicker focus on re-entry.
    if (name === "ruleset") { paintTitleRuleset(); rsSetFocus(rsFocusIdx || 0); requestAnimationFrame(() => requestAnimationFrame(() => rsCentreOn(rsFocusIdx || 0, false))); }
    ov.classList.toggle("ts-ruleset-open", name === "ruleset");
    Object.entries(steps).forEach(([k, el]) => {
      const active = k === name;
      ov.classList.add("ts-menu-open");
      el.hidden = !active;
      if (active) { el.classList.remove("ts-step-enter"); void el.offsetWidth; el.classList.add("ts-step-enter"); }   // re-trigger the fade-in
    });
  };
  // A11Y-01: validation was a silent visual shake. Now it also writes an inline, announced error line
  // under the field (aria-live) and sets aria-invalid, so screen-reader + no-animation users get it.
  const markInvalid = (el, message) => {
    if (!el) return;
    el.classList.add("shake");
    el.setAttribute("aria-invalid", "true");
    setTimeout(() => el.classList.remove("shake"), 400);
    if (message) {
      // Anchor the line after the whole name row (input + remove button), else after the input.
      const anchor = el.closest(".ts-name-row") || el;
      if (!el._errNode || !el._errNode.isConnected) {
        const err = document.createElement("p");
        err.className = "ts-field-error";
        err.setAttribute("aria-live", "polite");
        anchor.insertAdjacentElement("afterend", err);
        el._errNode = err;
      }
      el._errNode.textContent = message;
      const clear = () => {
        el.removeAttribute("aria-invalid");
        if (el._errNode) { el._errNode.remove(); el._errNode = null; }
        el.removeEventListener("input", clear);
      };
      el.addEventListener("input", clear);
    }
    el.focus();
  };
  ov.querySelector(".ts-letplay").addEventListener("click", () => show("ruleset"));
  ov.querySelector(".ts-splash-back").addEventListener("click", () => show("ruleset"));
  ov.querySelector(".ts-ruleset-back").addEventListener("click", openSplash);
  ov.querySelectorAll(".ts-ruleset").forEach((button, idx) => button.addEventListener("click", () => {
    // A tap on a blurred neighbour brings it into focus; only the centred game starts on tap.
    if (!button.classList.contains("is-focus")) { rsCentreOn(idx); return; }
    state.ruleset = normalizeRuleset(button.dataset.ruleset);
    if (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") state.playMode = "solo";
    document.title = rulesetTitle();
    paintTitleRuleset(state.ruleset);
    const onlineButton = ov.querySelector(".ts-step-main .ts-online");
    if (onlineButton) {
      onlineButton.disabled = false;
      onlineButton.querySelector(".ts-lbl").textContent = state.ruleset === "whodidyoumake" ? "LIVE BUILD ONLINE" : "ONLINE GAME";
    }
    show("main");
  }));
  // LOCAL games: no up-front stepper. The names step starts at 2 slots and the host adds/removes
  // players there (2..MAX_PLAYERS). Team Mode appears once there are 3+.
  let localPlayMode = "team";
  const namesList = ov.querySelector(".ts-names-list");
  const addBtn = ov.querySelector(".ts-add-player");
  const teamToggle = ov.querySelector(".ts-step-names .ts-team-mode");
  const teamInput = ov.querySelector(".ts-team-mode-input");
  const slotCount = () => namesList.querySelectorAll(".ts-name-slot").length;
  const refreshNamesUi = () => {
    const n = slotCount();
    teamToggle.hidden = state.ruleset === "groupthink" || state.ruleset === "whodidyoumake" || n <= 2;
    teamToggle.classList.toggle("on", teamInput.checked);
    teamToggle.querySelector("b").textContent = teamInput.checked ? "ON" : "OFF";
    // The flesh draft seats six at most (donor board + snake pacing are tuned for 2-6).
    const seatCap = state.ruleset === "whodidyoumake" ? 6 : MAX_PLAYERS;
    addBtn.disabled = n >= seatCap;
    namesList.querySelectorAll(".ts-name-remove").forEach((b) => { b.disabled = n <= MIN_PLAYERS; });
  };
  const addSlot = (focus) => {
    if (slotCount() >= (state.ruleset === "whodidyoumake" ? 6 : MAX_PLAYERS)) return;
    const i = slotCount();
    const row = document.createElement("div");
    row.className = "ts-name-row";
    row.innerHTML = `<input class="ts-name-slot" type="text" maxlength="16" placeholder="Player ${i + 1}" aria-label="Player ${i + 1} name"><button type="button" class="ts-name-remove" aria-label="Remove player">×</button>`;
    namesList.appendChild(row);
    refreshNamesUi();
    if (focus) row.querySelector("input").focus();
  };
  const resetSlots = (n) => { namesList.innerHTML = ""; for (let k = 0; k < n; k += 1) addSlot(false); teamInput.checked = localPlayMode !== "solo"; refreshNamesUi(); };
  namesList.addEventListener("click", (e) => {
    const rm = e.target.closest(".ts-name-remove");
    if (!rm || slotCount() <= MIN_PLAYERS) return;
    rm.closest(".ts-name-row").remove();
    namesList.querySelectorAll(".ts-name-slot").forEach((inp, idx) => { if (!inp.value) inp.placeholder = `Player ${idx + 1}`; });
    refreshNamesUi();
  });
  addBtn.addEventListener("click", () => { addSlot(true); });
  ov.querySelector(".ts-local").addEventListener("click", () => {
    resetSlots(MIN_PLAYERS);
    show("names");
    setTimeout(() => namesList.querySelector("input")?.focus(), 50);
  });
  teamInput.addEventListener("change", (e) => {
    localPlayMode = e.target.checked ? "team" : "solo";
    teamToggle.classList.toggle("on", e.target.checked);
    teamToggle.querySelector("b").textContent = e.target.checked ? "ON" : "OFF";
  });
  ov.querySelector(".ts-names-go").addEventListener("click", () => {
    const inputs = [...namesList.querySelectorAll(".ts-name-slot")];
    const bad = inputs.find((el) => !isValidPlayerName(el.value));
    if (bad) { markInvalid(bad, "Everyone needs a name. Even Greg."); return; }
    const names = inputs.map((el) => cleanPlayerName(el.value));
    const count = inputs.length;
    close();
    startLocalGame(count, names, (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") ? "solo" : (count > 2 ? localPlayMode : "team"));
  });
  ov.querySelector(".ts-online").addEventListener("click", () => {
    show("online");
  });
  const nameInput = ov.querySelector(".ts-name-input");
  const nameOf = () => cleanPlayerName(nameInput?.value);
  const requireName = () => {
    if (!isValidPlayerName(nameInput?.value)) { markInvalid(nameInput, "Everyone needs a name. Even Greg."); return null; }
    return nameOf();
  };
  ov.querySelector(".ts-host").addEventListener("click", () => {
    const nm = requireName();
    if (!nm) return;
    close();
    startOnlineGame(nm);
  });
  let observeMode = false;
  ov.querySelector(".ts-showjoin").addEventListener("click", () => {
    if (!requireName()) return;
    observeMode = false;
    show("join");
    setTimeout(() => ov.querySelector(".ts-join-input").focus(), 50);
  });
  // Observer (TV): no name needed - straight to the room code.
  ov.querySelector(".ts-observe").addEventListener("click", () => {
    observeMode = true;
    show("join");
    setTimeout(() => ov.querySelector(".ts-join-input").focus(), 50);
  });
  ov.querySelectorAll(".ts-back").forEach((b) => b.addEventListener("click", () => { observeMode = false; show("main"); }));
  const joinInput = ov.querySelector(".ts-join-input");
  const doJoin = () => {
    const nm = observeMode ? "TV" : requireName();
    if (!observeMode && !nm) { show("online"); return; }
    const code = (joinInput.value || "").trim();
    if (/^\d{3,4}$/.test(code)) { close(); joinRoom(code, nm, { observe: observeMode }); }
    else markInvalid(joinInput, "Room codes are 3 or 4 digits — check the host's screen.");
  };
  ov.querySelector(".ts-join-go").addEventListener("click", doJoin);
  joinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doJoin(); });
  const res = ov.querySelector(".ts-resume");
  if (res) res.addEventListener("click", () => { close(); resumeGame(saved); });
  paintStartModes();
  openSplash();
  // FLOW-04: arrived via a ?join=CODE link/QR. Jump to the name step with the code stashed, so the
  // guest just types a name and hits JOIN A ROOM. (A name is still required - we never auto-name.)
  if (pendingJoinCode) {
    const code = pendingJoinCode; pendingJoinCode = null;
    joinInput.value = code;
    show("online");
    setTimeout(() => { try { nameInput.focus(); } catch (e) { /* fine */ } }, 60);
    if (typeof flashToast === "function") flashToast(`Joining room #${code} — enter your name, then JOIN A ROOM.`);
  }
}

// LOCAL: pass-and-play on one screen - the YOU/B (or team) toggle is how you hand off the device.
// No args (or count <= 2) is the classic two-player game: empty roster, identical to the old build.
// The "new dimension" intro: a swirling zoom + title card that fades away to reveal the dealt game.
// One-shot; auto-removes. Purely cosmetic (the board is already dealt underneath).
function showDimensionWarp() {
  document.querySelector(".dimension-warp")?.remove();
  const ov = document.createElement("div");
  ov.className = "dimension-warp";
  ov.innerHTML = `
    <div class="dw-swirl" aria-hidden="true"></div>
    <div class="dw-vortex" aria-hidden="true"></div>
    <div class="dw-copy">
      <p class="dw-line">Entering a new dimension.</p>
      <p class="dw-line dw-line2">It's time to ask:</p>
      <div class="dw-who"><span class="dw-who1">WHO?</span><span class="dw-who2">IS IT?</span></div>
    </div>`;
  document.body.appendChild(ov);
  try { if (window.Sound && Sound.play) Sound.play("whoosh"); } catch (e) { /* silence is fine */ }
  setTimeout(() => {
    ov.classList.add("dw-out");
    setTimeout(() => ov.remove(), 900);
  }, 3600);
}

function startLocalGame(count, names, playMode = "team") {
  state.gameMode = "local"; state.mySeat = 0; state.inLobby = false; state.isHost = false;
  state.scoreboard = {};   // fresh session, fresh Win & Loss tally
  state.seenPrompts = new Set();   // fresh session, prompts cycle without repeats
  state.playMode = (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") ? "solo" : (playMode === "solo" ? "solo" : "team");
  state.roster = normalizeRoster(count || MIN_PLAYERS, names);
  state.playerCount = state.roster.length;
  const effectId = state.ruleset === "groupthink" || state.ruleset === "whodidyoumake" ? null : (normalizedStartModeId(state.settings) || null);
  // Progressive lineups ease in with a plain Guess Who round; chaotic/custom lineups already opted
  // into nonsense, so they spin a mode on round one (FLOW-05).
  const skipWarmup = effectiveModePolicy() !== "progressive";
  newGame(undefined, effectId ? { effectId } : (skipWarmup ? {} : { first: true }));
  // The plain opening round returns before newGame's own scheduleSave, so a fresh multi-player
  // setup would vanish on an immediate refresh - pin it now.
  scheduleSave();
}

// ONLINE host: open a LOBBY (no round dealt yet). The room's salt is fixed now so the room code is
// stable through the eventual deal; players gather, then the host presses START.
function startOnlineGame(name) {
  state.gameMode = "online"; state.isHost = true; state.mySeat = 0; state.inLobby = true;
  state.scoreboard = {};
  state.seenPrompts = new Set();   // NET2-03: fresh session, fresh no-repeat memory (matches local)
  state.hostClaimId = null;
  ensureClientId();
  state.playMode = (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") ? "solo" : "team";
  state.pname = cleanPlayerName(name) || "Player 1";
  state.gameSalt = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  // NET-09 (documented, accepted risk): 4-digit codes can collide — two concurrent hosts have a
  // ~1-in-9000 chance of sharing a room, in which case a joiner may reach the wrong lobby. At this
  // game's scale (a party, one relay) that's acceptable; recovery is "leave, host a new room".
  // If the game ever runs on a shared public relay, widen to 5-6 digits or salt-prefix the channel.
  state.roomCode = String((stableHash(state.gameSalt) % 9000) + 1000);
  state.playerCount = 1;
  state.roster = [{ name: state.pname, clientId: state.clientId }];   // host is roster slot 0
  state.myRosterIndex = 0;
  state.seenPeers = new Set();
  netConnect();
  showLobby();
  saveGameState();   // the lobby itself is resumable - an accidental refresh rejoins this room
}
// ONLINE guest: connect to the host's room and wait for the host's roster broadcast + START.
// opts.observe = a TV/display client: joins the room but takes no seat and just mirrors the board.
let joinAckTimer = null;
function joinRoom(code, name, opts = {}) {
  state.isObserver = !!(opts && opts.observe);
  state.gameMode = "online"; state.isHost = false; state.mySeat = 0; state.inLobby = true;
  ensureClientId();
  state.playMode = (state.ruleset === "groupthink" || state.ruleset === "whodidyoumake") ? "solo" : "team";
  state.pname = state.isObserver ? "TV" : (cleanPlayerName(name) || "Player 2");
  state.roomCode = code;
  state.roster = [];               // populated from the host's "lobby" broadcast
  state.myRosterIndex = -1;
  state.seenPeers = new Set();
  document.body.classList.toggle("observer", state.isObserver);
  netConnect();
  if (state.isObserver) showObserverWait(); else showLobby();
  saveGameState();   // the lobby itself is resumable - an accidental refresh rejoins this room
  // A wrong/dead code otherwise waits forever, indistinguishable from loading. If NO host answers
  // (lobby/snapshot/start) within 10s, say so - and keep listening in case they show up late.
  clearTimeout(joinAckTimer);
  joinAckTimer = setTimeout(() => {
    if (state.gameMode === "online" && state.inLobby && !(state.roster || []).some((r) => r.clientId && r.clientId !== state.clientId)) {
      showJoinDeadEnd("silent");
    }
  }, 10000);
}
// The host answered something - the room is real; stand the dead-end warning down.
function joinAcked() {
  clearTimeout(joinAckTimer);
  document.querySelector(".join-deadend")?.remove();
}
// The two ways a join dies: silence (typo'd/dead code) and a full room. Both get told, in voice,
// with a way out - a full room still offers the couch (observer/TV mode).
function showJoinDeadEnd(kind) {
  if (!document.querySelector(".lobby-screen")) return;   // only meaningful while waiting
  clearTimeout(joinAckTimer);                             // don't let the silence timer clobber this
  document.querySelector(".join-deadend")?.remove();
  const box = document.createElement("div");
  box.className = "join-deadend";
  box.setAttribute("role", "alert");
  box.innerHTML = kind === "full"
    ? `<b>Room #${escapeHtml(state.roomCode)} is full.</b><span>Twelve seats, all warm. Someone has to leave first — or take the couch.</span>
       <span class="jd-row"><button type="button" class="button jd-tv">📺 WATCH AS TV</button><button type="button" class="button ghost jd-back">← BACK</button></span>`
    : `<b>Nobody's hosting room #${escapeHtml(state.roomCode)}.</b><span>Check the code with your host — or wait, in case they're mid-refresh.</span>
       <span class="jd-row"><button type="button" class="button jd-retry">RETRY</button><button type="button" class="button ghost jd-back">← BACK</button></span>`;
  document.querySelector(".lobby-screen").appendChild(box);
  box.querySelector(".jd-back")?.addEventListener("click", () => {
    try { netSend("bye", {}); net && net.close(); } catch (e) { /* fine */ }
    clearOwnSave();
    state.gameMode = "local"; state.inLobby = false;
    document.querySelector(".lobby-screen")?.remove();
    showTitleScreen();
  });
  box.querySelector(".jd-retry")?.addEventListener("click", () => {
    box.remove();
    netSend("hello", { pname: state.pname });
    clearTimeout(joinAckTimer);
    joinAckTimer = setTimeout(() => { if (state.inLobby) showJoinDeadEnd("silent"); }, 10000);
  });
  box.querySelector(".jd-tv")?.addEventListener("click", () => {
    document.querySelector(".lobby-screen")?.remove();
    joinRoom(state.roomCode, "TV", { observe: true });
  });
}
// Host takeover: if the host has been silent >30s mid-game, the FIRST live guest in join order is
// offered the crown. Claiming broadcasts "hostclaim" — everyone records the new authority and a
// late-returning original host demotes itself (see net.js). Offered once per host-outage.
let hostTakeoverShown = false;
function maybeOfferHostTakeover() {
  if (state.gameMode !== "online" || state.isHost || state.inLobby || state.isObserver) return;
  if (hostTakeoverShown || document.querySelector(".host-takeover")) return;
  const hostId = typeof netHostId === "function" ? netHostId() : null;
  if (!hostId || hostId === state.clientId) return;
  const hp = netPeers.get(hostId);
  if (!hp || !hp.gone || Date.now() - hp.lastSeen < 30000) return;   // must have been heard, then lost
  // Next in line = the first roster entry after the host that is either me or a live peer. Only the
  // player who IS next in line sees the offer (no thundering herd of new hosts).
  const nextInLine = (state.roster || []).slice(1).find((r) => r.clientId === state.clientId || (netPeers.get(r.clientId) && !netPeers.get(r.clientId).gone));
  if (!nextInLine || nextInLine.clientId !== state.clientId) return;
  hostTakeoverShown = true;
  const b = document.createElement("div");
  b.className = "host-takeover";
  b.setAttribute("role", "status");
  b.innerHTML = `<span>👑 The host's gone quiet. You're next in line.</span><button type="button" class="button ht-claim">TAKE OVER HOSTING</button><button type="button" class="button ghost ht-dismiss">Not me</button>`;
  document.body.appendChild(b);
  b.querySelector(".ht-claim").addEventListener("click", () => {
    state.isHost = true;
    state.hostClaimId = state.clientId;
    netSend("hostclaim", {});
    // WHO? DO YOU THINK? has secret parallel ballots. The new host asks each locked client to
    // resubmit its own ballot so takeover can finish the round without revealing anyone's picks.
    if (state.ruleset === "groupthink" && window.Groupthink) Groupthink.onHostClaim();
    if (state.ruleset === "whodidyoumake" && window.WhoDidYouMake) WhoDidYouMake.onHostClaim();
    flashToast("👑 You're the host now.");
    saveGameState();
    b.remove();
  });
  b.querySelector(".ht-dismiss").addEventListener("click", () => b.remove());
}
// The host reappeared before anyone claimed: withdraw the offer (and re-arm it for next time).
function resetHostTakeoverOffer() {
  hostTakeoverShown = false;
  document.querySelector(".host-takeover")?.remove();
  lobbyHostGoneShown = false;
  document.querySelector(".lobby-host-gone")?.remove();
}
// MISS-02: guests waiting in a lobby whose host vanished used to just sit there forever. If the host
// peer has been gone >20s while we're still in the lobby, drop a banner and pull focus to Leave.
let lobbyHostGoneShown = false;
function maybeWarnLobbyHostGone() {
  if (state.gameMode !== "online" || state.isHost || !state.inLobby || state.isObserver) return;
  const ov = document.querySelector(".lobby-screen");
  if (!ov) return;
  const hostId = typeof netHostId === "function" ? netHostId() : null;
  const hp = hostId ? netPeers.get(hostId) : null;
  const gone = !!(hp && hp.gone && Date.now() - hp.lastSeen > 20000);
  if (!gone) {
    if (lobbyHostGoneShown) { ov.querySelector(".lobby-host-gone")?.remove(); lobbyHostGoneShown = false; }
    return;
  }
  if (lobbyHostGoneShown || ov.querySelector(".lobby-host-gone")) return;
  lobbyHostGoneShown = true;
  const b = document.createElement("div");
  b.className = "lobby-host-gone";
  b.setAttribute("role", "alert");
  b.innerHTML = `<b>The host left the lobby.</b><span>No one's dealing any more. Hang on a moment in case they refreshed — or head back.</span>`;
  const status = ov.querySelector(".lobby-status");
  if (status) status.after(b); else ov.appendChild(b);
  const leave = ov.querySelector(".lobby-leave");
  if (leave) { try { leave.focus(); } catch (e) { /* fine */ } }
}

// The TV's holding screen until the host deals a round. Shares .lobby-screen so the round-apply
// handler auto-removes it, then the observer board renders underneath.
function showObserverWait() {
  document.querySelector(".lobby-screen")?.remove();
  const ov = document.createElement("div");
  ov.className = "lobby-screen title-screen observer-wait";
  ov.innerHTML = `
    <div class="ts-words" aria-hidden="true"><span class="ts-who">WHO?</span><span class="ts-isit">IS IT?</span></div>
    <p class="lobby-code">📺 DISPLAY · ROOM <b>#${escapeHtml(state.roomCode)}</b></p>
    <p class="obw-hint">Waiting for the host to deal the first round…</p>
    <button type="button" class="button ghost lobby-leave">← Leave</button>`;
  document.body.appendChild(ov);
  ov.querySelector(".lobby-leave").addEventListener("click", () => {
    state.isObserver = false; state.inLobby = false;
    document.body.classList.remove("observer");
    netSend("bye", {}); clearOwnSave();
    try { net && net.close(); } catch (e) { /* fine */ }
    ov.remove(); showTitleScreen();
  });
}
// Observer HUD: a slim top banner with the room, the active mode and the player count. The location
// + board come from the normal render underneath (the side panel is hidden by body.observer CSS).
// TV display: size the grid so EVERY face fits on screen at once - no scrolling, no dead side
// margins. Tries every column count and keeps whichever gives the biggest face. Custom-layout
// boards (habbo room, floating heads, manor map, family tree) keep their own layouts.
const TV_CUSTOM_BOARDS = ["habbo-board", "heads-board", "knockoff-manor-board", "family-tree-board"];
function fitObserverBoard() {
  const board = els.characterBoard;
  if (!state.isObserver || !board) return;
  const custom = TV_CUSTOM_BOARDS.some((c) => board.classList.contains(c));
  document.body.classList.toggle("tv-fit", !custom);
  if (custom) { board.style.removeProperty("--tv-cols"); board.style.removeProperty("--tv-board-h"); return; }
  const n = board.querySelectorAll("[data-id]").length || (state.board || []).length;
  if (!n) return;
  const barH = document.getElementById("observerBar")?.getBoundingClientRect().height || 56;
  const PAD = 20, GAP = 10, PLATE = 34;   // wrap padding, grid gap, name plate under each face
  const W = Math.max(200, window.innerWidth - PAD);
  const H = Math.max(200, window.innerHeight - barH - PAD);
  let best = { cols: Math.ceil(Math.sqrt(n)), size: 0 };
  for (let cols = 1; cols <= n; cols += 1) {
    const rows = Math.ceil(n / cols);
    const cw = (W - (cols - 1) * GAP) / cols;
    const ch = (H - (rows - 1) * GAP) / rows;
    const size = Math.min(cw, ch - PLATE);   // the square face this layout would allow
    if (size > best.size) best = { cols, size };
  }
  board.style.setProperty("--tv-cols", String(best.cols));
  board.style.setProperty("--tv-board-h", `${H}px`);
}
window.addEventListener("resize", () => { if (state.isObserver) fitObserverBoard(); });
function renderObserverHeader() {
  let bar = document.getElementById("observerBar");
  if (!bar) { bar = document.createElement("div"); bar.id = "observerBar"; document.body.appendChild(bar); }
  const groupthink = state.ruleset === "groupthink";
  const modeName = groupthink ? `ROUND ${(state.groupthink?.roundIndex || 0) + 1} · ${state.board.length} LEFT` : (state.global.mystery ? state.global.mystery.name : "GUESS WHO");
  const loc = state.location ? state.location.name : "";
  const count = Array.isArray(state.roster) ? state.roster.length : 0;
  bar.innerHTML = `
    <span class="ob-brand"><b class="ob-who">WHO?</b> <b class="ob-isit">${groupthink ? "DO YOU THINK?" : "IS IT?"}</b></span>
    <span class="ob-meta">
      ${loc ? `<span class="ob-chip ob-loc">📍 ${escapeHtml(loc)}</span>` : ""}
      <span class="ob-chip ob-mode">${escapeHtml(modeName)}</span>
      ${count ? `<span class="ob-chip">${count} player${count === 1 ? "" : "s"}</span>` : ""}
      <span class="ob-chip ob-room">📺 #${escapeHtml(state.roomCode || "")}</span>
    </span>`;
}
// Refresh mid-lobby: reconnect to the same room as the same clientId. The host restores its
// authoritative roster and re-broadcasts; a guest re-announces itself (same persistent clientId,
// so the host updates the existing slot instead of adding a duplicate).
function resumeOnlineLobby(saved) {
  state.gameMode = "online"; state.inLobby = true;
  state.isHost = !!saved.isHost;
  state.playMode = state.ruleset === "groupthink" ? "solo" : (saved.playMode === "solo" ? "solo" : "team");
  state.pname = isValidPlayerName(saved.pname) ? cleanPlayerName(saved.pname) : (state.pname || "Player");
  state.clientId = saved.clientId || ensureClientId();
  state.roomCode = saved.roomCode;
  state.gameSalt = saved.salt || "";
  state.playerCount = saved.playerCount || (Array.isArray(saved.roster) ? saved.roster.length : 1) || 1;
  state.roster = state.isHost && Array.isArray(saved.roster)
    ? saved.roster.map((r, i) => ({ name: cleanPlayerName(r.name) || `Player ${i + 1}`, clientId: r.clientId, side: r.side, personaId: r.personaId }))
    : [];
  state.myRosterIndex = state.isHost ? 0 : -1;
  state.mySeat = state.isHost ? 0 : 1;
  state.seenPeers = new Set();
  netConnect();
  showLobby();
  if (state.isHost) { broadcastLobby(); updateLobby(); }
}

// The waiting room: room number, who's arrived, and (host only) a START button once a friend joins.
// FLOW-04: the lobby now hands out an actual join URL + QR (using the receipt's QR generator), not
// just "share the room code". When there's no relay (same-origin WS), cross-device play can't work,
// so we say so plainly instead of letting a phone silently fail to connect.
function lobbyJoinShareMarkup() {
  const relay = (typeof NET_RELAY !== "undefined") ? NET_RELAY : null;
  const url = `${location.origin}${location.pathname}?join=${encodeURIComponent(state.roomCode)}`;
  let qrSvg = "";
  if (relay) {
    try { const qr = qrcode(0, "M"); qr.addData(url); qr.make(); qrSvg = qr.createSvgTag({ cellSize: 3, margin: 0, scalable: true }); } catch (e) { qrSvg = ""; }
  }
  const shown = url.replace(/^https?:\/\//, "");
  const display = shown.length > 40 ? `${shown.slice(0, 37)}…` : shown;
  return `<div class="lobby-share">
    ${relay
      ? `${qrSvg ? `<div class="ls-qr">${qrSvg}</div>` : ""}
         <p class="ls-hint">Scan to join, or share this link:</p>
         <div class="ls-url"><a href="${url.replace(/"/g, "&quot;")}">${escapeHtml(display)}</a><button type="button" class="button ghost ls-copy" data-url="${url.replace(/"/g, "&quot;")}">Copy</button></div>`
      : `<p class="ls-hint">Room <b>#${escapeHtml(state.roomCode)}</b> works for tabs on <b>this device</b> only. To let phones join, serve the game with the relay running (same-origin WebSocket).</p>`}
  </div>`;
}
function showLobby() {
  document.querySelector(".lobby-screen")?.remove();
  const host = state.isHost;
  const ov = document.createElement("div");
  ov.className = "lobby-screen title-screen";
  const groupthink = state.ruleset === "groupthink";
  const fleshdraft = state.ruleset === "whodidyoumake";
  ov.classList.toggle("is-groupthink", groupthink);
  ov.innerHTML = `
    <div class="ts-words" aria-hidden="true"><span class="ts-who">WHO?</span><span class="ts-isit">${groupthink ? "DO YOU THINK?" : fleshdraft ? "DID YOU MAKE?" : "IS IT?"}</span></div>
    <p class="lobby-code">ROOM <b>#${escapeHtml(state.roomCode)}</b></p>
    ${host ? lobbyJoinShareMarkup() : ""}
    ${host ? `${!groupthink && !fleshdraft ? `<label class="ts-opt ts-team-mode lobby-team-mode ${state.playMode === "solo" ? "" : "on"}">
      ${tsIcon("team")}<span class="ts-opt-label">Team Mode</span>
      <input class="lobby-team-mode-input" type="checkbox" ${state.playMode === "solo" ? "" : "checked"}>
      <b class="ts-chip">${state.playMode === "solo" ? "OFF" : "ON"}</b>
    </label>` : ""}
    ${fleshdraft ? `<p class="lobby-mode-note"><b>LIVE BUILD</b><span>Everyone picks simultaneously. Your commission stays visible.</span></p>` : pgToggleMarkup()}
    ${groupthink ? yoloToggleMarkup() : ""}
    ${groupthink || fleshdraft ? "" : boardSizeMarkup()}` : ""}
    <div class="lobby-players"></div>
    <p class="lobby-status"></p>
    <div class="lobby-actions">
      ${host ? `<button type="button" class="button primary lobby-start" disabled>START</button>` : ""}
      <button type="button" class="button ghost lobby-leave">← Leave</button>
    </div>`;
  document.body.appendChild(ov);
  // PERF-02: the QR encoder is a lazy script - if it isn't in yet, re-render the lobby once it lands
  // so the share box upgrades from link-only to QR+link. showLobby() is idempotent.
  if (host && typeof qrcode === "undefined") {
    ensureQrcode().then(() => { if (state.inLobby && document.querySelector(".lobby-screen")) showLobby(); }).catch(() => {});
  }
  ov.querySelector(".ls-copy")?.addEventListener("click", (e) => {
    const url = e.currentTarget.dataset.url || "";
    try { navigator.clipboard.writeText(url); e.currentTarget.textContent = "Copied"; setTimeout(() => { e.currentTarget.textContent = "Copy"; }, 1400); } catch (err) { /* clipboard blocked */ }
  });
  ov.querySelector(".lobby-leave").addEventListener("click", () => {
    state.inLobby = false;
    netSend("bye", { pname: state.pname });                          // tell the room we left on purpose
    clearOwnSave();   // don't offer a rejoin to a room we quit
    try { net && net.close(); } catch (e) { /* fine */ }
    ov.remove(); showTitleScreen();
  });
  if (host) {
    const modeInput = ov.querySelector(".lobby-team-mode-input");
    modeInput?.addEventListener("change", (e) => {
      state.playMode = e.target.checked ? "team" : "solo";
      ov.querySelector(".lobby-team-mode b").textContent = e.target.checked ? "ON" : "OFF";
      state.playerCount = state.roster.length;
      broadcastLobby();
      updateLobby();
      saveGameState();
    });
    // PG, YOLO + board size are HOST-only room settings. Guests inherit them from lobby broadcasts
    // and again at START. Same controls as the local setup.
    const pgBtn = ov.querySelector(".ts-pg");
    const paintPg = () => { if (!pgBtn) return; pgBtn.classList.toggle("on", state.settings.pg); pgBtn.querySelector("b").textContent = state.settings.pg ? "ON" : "OFF"; pgBtn.setAttribute("aria-pressed", String(state.settings.pg)); };
    pgBtn?.addEventListener("click", () => {
      if (!state.settings.pg) { setPgMode(true); paintPg(); sfx("blip"); saveGameState(); return; }
      askAdultGate((ok) => { if (ok) { setPgMode(false); paintPg(); sfx("coin"); } else { setPgMode(true); paintPg(); sfx("buzzer"); } saveGameState(); });
    });
    const yoloBtn = ov.querySelector(".ts-yolo");
    yoloBtn?.addEventListener("click", () => {
      state.settings.groupthinkYolo = state.settings.groupthinkYolo === false;
      const on = state.settings.groupthinkYolo;
      yoloBtn.classList.toggle("on", on);
      yoloBtn.setAttribute("aria-pressed", String(on));
      yoloBtn.querySelector(".ts-chip").textContent = on ? "ON" : "OFF";
      yoloBtn.querySelector(".ts-yolo-label small").textContent = on ? "PERMANENT CUTS" : "FULL DECK · 8 ROUNDS";
      savePrefs({ groupthinkYolo: on });
      netSend("settings", { settings: state.settings });
      broadcastLobby();
      updateLobby();
      sfx("blip");
      saveGameState();
    });
    ov.querySelectorAll(".ts-size").forEach((btn) => btn.addEventListener("click", () => {
      const n = Number(btn.dataset.n);
      state.settings.boardSize = n; savePrefs({ boardSize: n });
      ov.querySelectorAll(".ts-size").forEach((x) => x.classList.toggle("on", Number(x.dataset.n) === n));
      sfx("blip"); saveGameState();
    }));
  }
  const startBtn = ov.querySelector(".lobby-start");
  if (startBtn) startBtn.addEventListener("click", () => {
    state.inLobby = false;
    ov.classList.add("ts-out"); setTimeout(() => ov.remove(), 400);
    // Finalize the roster to the humans actually present, then deal. WHO? DO YOU THINK? is plain for
    // every round; WHO? IS IT? may still begin in a deliberately selected mystery mode.
    state.playerCount = state.roster.length;
    state.wheelPickShared = null;
    syncMySeatFromRoster();
    const plainRuleset = state.ruleset === "groupthink" || state.ruleset === "whodidyoumake";
    const skipWarmup = !plainRuleset && effectiveModePolicy() !== "progressive";
    let effectId = plainRuleset ? null : (normalizedStartModeId(state.settings) || null);
    // Match local setup: custom/chaotic lineups have explicitly opted out of the plain opening
    // round. Pick the authoritative first effect here so every online client receives the same one.
    if (!effectId && skipWarmup && state.settings.mystery) effectId = wheelTargetFromBag();
    const first = !effectId && !skipWarmup;
    netSend("start", { salt: state.gameSalt, settings: state.settings, roster: rosterForWire(), playerCount: state.playerCount, playMode: state.playMode, ruleset: state.ruleset, effectId, first });
    newGame(state.gameSalt, effectId
      ? { effectId, announced: true }
      : (first ? { effectId: null, announced: true, first: true } : { announced: true }));
  });
  updateLobby();
}
// Host → everyone: the authoritative roster + target player count. Guests render their lobby from it.
function broadcastLobby() {
  if (!state.isHost) return;
  state.playerCount = state.roster.length;
  netSend("lobby", { roster: rosterForWire(), playerCount: state.playerCount, playMode: state.playMode, ruleset: state.ruleset, settings: state.settings });
  if (state.inLobby) scheduleSave();   // the lobby roster survives a host refresh
}
function updateLobby() {
  const ov = document.querySelector(".lobby-screen");
  if (!ov || state.isObserver) return;   // the observer's wait screen has no player list to fill
  const roster = state.roster || [];
  const roomCap = state.ruleset === "whodidyoumake" ? 6 : MAX_PLAYERS;
  const slots = Math.max(MIN_PLAYERS, Math.min(roomCap, roster.length + (roster.length < roomCap ? 1 : 0)));
  const modeToggle = ov.querySelector(".lobby-team-mode");
  if (modeToggle) {
    modeToggle.hidden = state.ruleset === "groupthink" || roster.length <= 2;
    const modeInput = modeToggle.querySelector("input");
    if (modeInput) modeInput.checked = state.playMode !== "solo";
    modeToggle.classList.toggle("on", state.playMode !== "solo");
    modeToggle.querySelector("b").textContent = state.playMode === "solo" ? "OFF" : "ON";
  }
  ov.querySelector(".lobby-players").innerHTML = Array.from({ length: slots }, (_, i) => {
    const r = roster[i];
    const me = r && r.clientId && r.clientId === state.clientId;
    return `<div class="lobby-player ${r ? "here" : "empty"}">${r ? `● ${escapeHtml(r.name)}${me ? " (you)" : ""}` : "Share the room code"}</div>`;   // De Stijl: no green ✅ - the blue pill already says "present"
  }).join("");
  const enough = roster.length >= 2;
  const modeLine = state.ruleset === "groupthink"
    ? ` WHO? DO YOU THINK? · YOLO ${state.settings.groupthinkYolo !== false ? "ON — permanent cuts" : "OFF — full deck"}.`
    : state.ruleset === "whodidyoumake"
      ? " LIVE BUILD · simultaneous picks."
    : (roster.length > 2 ? ` Team Mode ${state.playMode === "solo" ? "OFF" : "ON"}.` : "");
  ov.querySelector(".lobby-status").textContent = enough
    ? (state.isHost ? `Ready when you are — press START.${modeLine}` : `Waiting for the host to start…${modeLine}`)
    : `Share room #${state.roomCode} with friends.`;
  const startBtn = ov.querySelector(".lobby-start");
  if (startBtn) startBtn.disabled = !enough;
}

// ===================== SEED codes (share a whole setup) =====================
// The code packs the salt + settings; pasting it deals the IDENTICAL round (same board, same
// location, same wheel outcome, same secrets) - assuming both sides have the same character pool.
function currentSeedCode() {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify({ s: state.gameSalt, g: state.settings, r: normalizeRuleset(state.ruleset) })))).replace(/=+$/, ""); }
  catch (e) { return ""; }
}
function parseSeedCode(code) {
  try {
    const d = JSON.parse(decodeURIComponent(escape(atob((code || "").trim()))));
    return d && d.s ? d : null;
  } catch (e) { return null; }
}

loadTheme();
installStaticIcons();
// MISS-03: settings footer version reads the app.js cache-bust number straight off the script tag,
// so the build stamp is always accurate without a second place to update.
(() => {
  const verEl = document.getElementById("setupVersion");
  if (!verEl) return;
  let build = "";
  try {
    const src = document.querySelector('script[src*="app.js"]')?.getAttribute("src") || "";
    build = (src.match(/v=(\d+)/) || [])[1] || "";
  } catch (e) { /* fine */ }
  verEl.textContent = `WHO? KNOWS?${build ? ` · build ${build}` : ""}`;
})();
// Device prefs (board size, sound/music) set from the title-screen settings panel.
{
  const prefs = loadPrefs();
  if (BOARD_SIZES.includes(prefs.boardSize)) state.settings.boardSize = prefs.boardSize;
  if (typeof prefs.groupthinkYolo === "boolean") state.settings.groupthinkYolo = prefs.groupthinkYolo;
  if (prefs.lowPower === true) state.settings.lowPower = true;   // device pref, persists across sessions
  applyLowPower();
  placeDesktopToolbar();   // desktop: fold the board toolbar into the sticky rail
  initHudCollapse();       // desktop: skinny rail once you scroll into the board
  if (window.Sound) {
    const agent = isAgentBrowser();   // automation opens muted; see isAgentBrowser()
    if (agent || prefs.sound === false) Sound.setEnabled(false);
    if (typeof prefs.track === "number") Sound.setTrack(prefs.track);
    // music ON by default (playback still waits for the first gesture), but never for automation
    if (!agent && prefs.music !== false) Sound.setMusic(true);
  }
}
// PERF-02: on-demand script loader. editor.js and vendor-qrcode.js no longer load at boot — the
// editor arrives on the first 🎨 click, the QR encoder on first lobby/receipt (plus an idle preload).
// habbo-*/breeding stay eager: a habbo-round RESUME applies the mode synchronously during boot.
const _loadedScripts = {};
function loadScriptOnce(src) {
  if (_loadedScripts[src]) return _loadedScripts[src];
  _loadedScripts[src] = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.onload = resolve;
    s.onerror = () => { delete _loadedScripts[src]; reject(new Error(`failed to load ${src}`)); };
    document.body.appendChild(s);
  });
  return _loadedScripts[src];
}
const EDITOR_SRC = "editor.js?v=229";
const QRCODE_SRC = "vendor-qrcode.js?v=205";
function ensureQrcode() { return typeof qrcode !== "undefined" ? Promise.resolve() : loadScriptOnce(QRCODE_SRC); }

// Saved-custom-character storage (moved from editor.js so the BOOT deal can fold customs into the
// pool without loading the whole editor). editor.js reuses these globals when it lazy-loads.
const CUSTOM_KEY = "whoisit_custom_chars_v1";
function loadCustomChars() { try { return JSON.parse(localStorage.getItem(CUSTOM_KEY)) || []; } catch (e) { return []; } }
function saveCustomChars(list) { try { localStorage.setItem(CUSTOM_KEY, JSON.stringify(list)); } catch (e) { /* storage disabled */ } }
function buildCustomCharacter(data) {
  const seed = data.seed != null ? data.seed : (95000 + (stableHash(data.id) % 4000));
  return {
    id: data.id, name: data.name || "Custom", pronouns: data.pronouns || "they",
    feature: "a custom-made character", secret: "keeps to themselves", role: data.role || "local witness",
    image: window.faceGenerator.renderPortrait(seed, data.traits), tags: [], variant: "",
    traits: data.traits, seed, isCustom: true
  };
}
// Rebuild the custom entries in the playable pool from storage (so saved faces get dealt into games).
function mergeCustomIntoPool() {
  if (!window.faceGenerator) return;
  [generatedCharacters, allCharacters].forEach((arr) => {
    for (let i = arr.length - 1; i >= 0; i--) if (arr[i].isCustom) arr.splice(i, 1);
  });
  loadCustomChars().forEach((d) => { const ch = buildCustomCharacter(d); generatedCharacters.push(ch); allCharacters.push(ch); });
}

mergeCustomIntoPool();                 // fold saved custom characters into the playable pool
mergeGaybiesIntoPool();                // and the persistent GAYBYs
wirePainScaleDrag();                   // drag the disease pain scale to change emotions
if (els.editorButton) els.editorButton.addEventListener("click", () => {
  loadScriptOnce(EDITOR_SRC).then(() => openCharacterEditor()).catch(() => flashToast("Couldn't load the editor."));
});
// Idle preload: the QR encoder is all but guaranteed to be wanted eventually (lobby share, receipt).
setTimeout(() => { ensureQrcode().catch(() => {}); }, 4000);
if (els.almanacButton) els.almanacButton.addEventListener("click", showAlmanac);
if (els.helpButton) els.helpButton.addEventListener("click", showHelpCard);   // FLOW2-02
// A scanned receipt QR (#summary=...) opens the summary screen; ?observe=CODE turns this tab straight
// into a TV display for that room; otherwise the title as usual.
const observeParam = (() => { try { return new URLSearchParams(location.search).get("observe"); } catch (e) { return null; } })();
// A saved ?g= game link (printed on the receipt) deals that exact deck straight away - the URL-safe
// base64 is the seed code (salt + settings), so the link is self-contained.
const gameLinkParam = (() => { try { return new URLSearchParams(location.search).get("g"); } catch (e) { return null; } })();
// FLOW-04: ?join=CODE (from the lobby QR/link) boots straight into the join flow for that room.
const joinParam = (() => { try { return new URLSearchParams(location.search).get("join"); } catch (e) { return null; } })();
let pendingJoinCode = null;
function bootFromGameLink(raw) {
  const parsed = parseSeedCode(String(raw).replace(/-/g, "+").replace(/_/g, "/"));
  try { history.replaceState(null, "", location.pathname); } catch (e) { /* keep the URL as-is */ }
  // BUG2-07: a mangled/ancient ?g= link used to fail silently to the title - acknowledge it in voice.
  if (!parsed) { setTimeout(() => { try { flashToast("That game link didn't survive. Deal a fresh universe instead."); } catch (e) { /* pre-UI */ } }, 600); return false; }
  if (parsed.g) state.settings = normalizeGameSettings({ ...state.settings, ...parsed.g });
  state.ruleset = normalizeRuleset(parsed.r);
  state.gameMode = "local"; state.mySeat = 0; state.inLobby = false; state.isHost = false;
  state.playMode = state.ruleset === "groupthink" || state.ruleset === "whodidyoumake" ? "solo" : "team";
  state.roster = normalizeRoster(MIN_PLAYERS, ["Player 1", "Player 2"]);
  state.playerCount = state.roster.length;
  newGame(parsed.s, { first: true });
  scheduleSave();
  return true;
}
// A refresh while you were in a game/room drops you straight back into it (a round, a lobby, or a TV
// display) - going to the main menu isn't what you'd expect. The title only shows with no game to resume.
const resumableSave = loadGameSave();
if (maybeShowSummaryPage()) { /* summary page shown */ }
else if (observeParam && /^\d{3,4}$/.test(observeParam.trim())) { joinRoom(observeParam.trim(), "TV", { observe: true }); }
else if (joinParam && /^\d{3,4}$/.test(joinParam.trim())) {
  pendingJoinCode = joinParam.trim();
  try { history.replaceState(null, "", location.pathname); } catch (e) { /* keep URL */ }
  showTitleScreen();
}
else if (gameLinkParam && bootFromGameLink(gameLinkParam)) { /* saved game link dealt */ }
else if (resumableSave) { try { resumeGame(resumableSave); } catch (e) { showTitleScreen(); } }
else showTitleScreen();
wireCueCardClick();
wireFloatingSecret();
if (els.sortSelect) {
  els.sortSelect.addEventListener("change", () => { state.sortKey = els.sortSelect.value; updateSortGlyph(); renderBoard({ animateReorder: true }); });
}
