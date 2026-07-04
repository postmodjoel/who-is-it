const baseCharacters = [
  ["alex", "Alex", "he", "baseball cap", "always overexplains", "architect"],
  ["bella", "Bella", "she", "blonde hair", "keeps old voicemails", "teacher"],
  ["carlos", "Carlos", "he", "red cap", "never answers unknown numbers", "mechanic"],
  ["diana", "Diana", "she", "red hair and glasses", "knows every exit", "dentist"],
  ["ethan", "Ethan", "he", "bow tie", "apologizes too quickly", "accountant"],
  ["fiona", "Fiona", "she", "purple hat", "has a rehearsed laugh", "barista"],
  ["george", "George", "he", "grey hair", "keeps emergency cash", "pharmacist"],
  ["hannah", "Hannah", "she", "green glasses", "changes the subject neatly", "florist"],
  ["ivan", "Ivan", "he", "blue beanie", "remembers small debts", "electrician"],
  ["jade", "Jade", "she", "long dark hair", "never sits with her back to a door", "designer"],
  ["kevin", "Kevin", "he", "moustache", "has a practiced excuse", "chef"],
  ["luna", "Luna", "she", "white hair", "keeps a very calm face", "librarian"],
  ["marco", "Marco", "he", "curly hair", "knows when to leave", "bartender"],
  ["nina", "Nina", "she", "red beanie", "reads the room too well", "photographer"],
  ["oscar", "Oscar", "he", "dark hair", "has a backup story", "lawyer"],
  ["penny", "Penny", "she", "pink glasses", "keeps receipts", "nurse"],
  ["quinn", "Quinn", "they", "green cap", "doesn't blink first", "journalist"],
  ["rosa", "Rosa", "she", "teal shirt", "says less than they know", "social worker"],
  ["sam", "Sam", "they", "glasses and beard", "knows every loophole", "engineer"],
  ["tara", "Tara", "she", "wide-brim hat", "can end a conversation cleanly", "gardener"],
  ["umar", "Umar", "he", "red cap and beard", "has two phones", "paramedic"],
  ["violet", "Violet", "she", "purple outfit", "smiles at the wrong time", "therapist"],
  ["will", "Will", "he", "brown hair", "keeps a spare shirt", "musician"],
  ["xena", "Xena", "she", "striped shirt", "notices who is lying", "pilot"]
].map(([id, name, pronouns, feature, secret, role]) => ({
  id,
  name,
  pronouns,
  feature,
  secret,
  role,
  image: `assets/characters/${id}.png`,
  tags: makeTags(name, secret, role),
  variant: ""
}));

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
const LOCATION_ART_DIR = "assets/locations";

const locations = window.GameData.locations.map((loc) => ({
  ...loc,
  art: {
    day: `${LOCATION_ART_DIR}/${loc.slug}_day_banner.png`,
    night: `${LOCATION_ART_DIR}/${loc.slug}_night_banner.png`
  }
}));

const absurdPrompts = window.GameData.absurdPrompts;

const classicPrompts = window.GameData.classicPrompts;

const allCharacters = [...baseCharacters, ...generatedCharacters];

const state = {
  settings: {
    prompts: true,
    mystery: true,
    locations: true,
    roles: true,
    pg: true,           // "PG mode" - the wheel only lands on kid-safe modes, no breeding/woohoo
    boardSize: 24
  },
  currentPlayer: 0,
  roundAge: 0,         // how many rounds deep this session is (0 = the plain opening round). Drives prompt "heat".
  gameMode: "local",   // "local" (pass-and-play) or "online" (room-synced)
  board: [],
  players: [],          // ALWAYS length 2 - these are SIDES/teams, never per-human. See roster below.
  playerCount: 2,       // 2-8 humans this game
  roster: [],           // [{ name, clientId?, side }] - humans mapped onto the two sides. Empty ≙ classic 2p.
  clientId: "",         // online: minted once per tab session so teammates on one side are distinguishable
  myRosterIndex: 0,     // online: which roster slot is me
  isHost: false,        // online: did I open this room (roster authority)
  location: null,
  locationVariant: "day",
  roomCode: "0000",
  gameSalt: "",
  abortedBabies: [],   // session-level: aborted souls that later haunt Judgement Day's purgatory
  log: [],
  global: {
    mystery: null,
    hints: [[], []],
    roleMap: {},
    undo: [[], []]
  }
};

const els = {
  locationBand: document.querySelector("#locationBand"),
  roomCode: document.querySelector("#roomCode"),
  roomStatus: document.querySelector("#roomStatus"),
  seatRoster: document.querySelector("#seatRoster"),
  secretCard: document.querySelector("#secretCard"),
  revealSecretButton: document.querySelector("#revealSecretButton"),
  swapSeatButton: document.querySelector("#swapSeatButton"),
  drawPromptButton: document.querySelector("#drawPromptButton"),
  questionPrompt: document.querySelector("#questionPrompt"),
  mysteryButton: document.querySelector("#mysteryButton"),
  mysteryResult: document.querySelector("#mysteryResult"),
  mysteryUseCount: document.querySelector("#mysteryUseCount"),
  hintShelf: document.querySelector("#hintShelf"),
  characterBoard: document.querySelector("#characterBoard"),
  opponentPanel: document.querySelector("#opponentPanel"),
  floatingSecret: document.querySelector("#floatingSecret"),
  sortSelect: document.querySelector("#sortSelect"),
  themeButton: document.querySelector("#themeButton"),
  setupButton: document.querySelector("#setupButton"),
  editorButton: document.querySelector("#editorButton"),
  soundButton: document.querySelector("#soundButton"),
  newGameButton: document.querySelector("#newGameButton"),
  endRoundButton: document.querySelector("#endRoundButton"),
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
  settingBoardSize: document.querySelector("#settingBoardSize")
};

els.houseMap = document.createElement("section");
els.houseMap.id = "houseMap";
els.houseMap.className = "house-map is-hidden";
els.houseMap.setAttribute("aria-live", "polite");
els.characterBoard.parentNode.insertBefore(els.houseMap, els.characterBoard);

function iconSvg(name) {
  const common = "viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'";
  const paths = {
    moon: "<path d='M20 14.2A7.7 7.7 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2Z'/>",
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
    hash: "<path d='M8 3L6 21'/><path d='M18 3l-2 18'/><path d='M3 8h18'/><path d='M2 16h18'/>"
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
  if (els.swapSeatButton) { setButtonIcon(els.swapSeatButton, "swap", "End round"); els.swapSeatButton.classList.add("end-round-btn"); els.swapSeatButton.querySelector(".ib-label")?.remove(); els.swapSeatButton.insertAdjacentHTML("beforeend", "<span class=\"er-txt\">END ROUND</span>"); }
  if (els.drawPromptButton) setButtonIcon(els.drawPromptButton, "prompt", "Draw prompt");
}

function currentTheme() {
  return document.body.dataset.theme === "light" ? "light" : "dark";
}

function applyTheme(theme) {
  document.body.dataset.theme = theme === "light" ? "light" : "dark";
  try {
    localStorage.setItem("lickyspits-theme", currentTheme());
  } catch (error) {
    // Ignore storage issues in local previews.
  }
  syncThemeButton();
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
    savedTheme = localStorage.getItem("lickyspits-theme") || "dark";
  } catch (error) {
    savedTheme = "dark";
  }
  applyTheme(savedTheme);
}

// A round is now FULLY derived from its gameSalt: board, location, both secrets and the Wheel of
// Fate outcome are all deterministic hashes of it. That's what makes online sync (both clients
// derive the same round from one shared salt), refresh-resume, and shareable SEED codes possible.
function newGame(seedSalt, opts = {}) {
  clearMysteryEffectUI();
  // Sort choice persists across rounds (rebuildSortOptions drops it only if the new mode can't do it).
  // The board only draws from the procedurally generated faces. The hand-illustrated PNG
  // characters (baseCharacters) stay defined as the gold-standard reference but are never dealt
  // into the playable board.
  const pool = generatedCharacters;
  const boardSize = Math.min(state.settings.boardSize, pool.length);
  state.gameSalt = seedSalt || `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  state.board = buildBoard(pool, boardSize);
  state.location = state.settings.locations ? locations[stableHash(`${state.gameSalt}:loc`) % locations.length] : null;
  state.locationVariant = stableHash(`${state.gameSalt}:var`) % 2 ? "night" : "day";
  // The online ROOM is fixed for the whole session (set when hosting/joining) - do NOT re-derive it
  // from each round's salt, or every new round would move rooms and the peer would miss the deal.
  // Local mode just needs a display code, so it can track the salt.
  if (state.gameMode !== "online") state.roomCode = String((stableHash(state.gameSalt) % 9000) + 1000);
  assignRosterTeams();   // salt is final now; derive team sides (no-op for classic <=2 rosters)
  const takenSecrets = new Set();
  state.players = [makePlayer(0, takenSecrets), makePlayer(1, takenSecrets)];
  state.currentPlayer = state.mySeat || 0;
  state.log = [];
  state.global.hints = [[], []];
  state.global.undo = [[], []];
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
    if (!opts.remote && !opts.announced) netSend("start", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick });
  }
  drawPrompt();
  addLog("New game dealt. Nobody looks trustworthy.");
  render();
  replayBrand();   // WHO? / IS IT? slides back in for the fresh round
  stopOpponentSim();
  if (opts.resume) return;   // resume path applies the effect itself (silently, no wheel animation)
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
    if (state.settings.mystery) {
      spinModeRoulette((id) => {
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
      });
    }
    scheduleSave();
  };
  // 3+ players: announce the two teams before the wheel/plain deal (never on resume). 2p is unchanged.
  if (rosterTeamMode()) showTeamReveal(proceed);
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

// ===================== Roster / teams (2-8 players over two sides) =====================
// The engine is a two-SIDE game forever (state.players.length === 2). A roster of 2-8 humans is
// mapped deterministically onto those two sides; teammates share a side (and its secret/board).
// Empty roster (or length <= 2) means "classic" - the game looks and behaves exactly like the
// original two-player build.
const SIDE_COUNT = 2, MIN_PLAYERS = 2, MAX_PLAYERS = 8;

function rosterTeamMode() { return !!(state.roster && state.roster.length > 2); }
function ensureClientId() {
  if (!state.clientId) state.clientId = `c-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return state.clientId;
}
// Build a clean roster of {name} from a count + a names array/object (blank names get "Player N").
function normalizeRoster(count, names) {
  const n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, count | 0));
  const out = [];
  for (let i = 0; i < n; i++) {
    const raw = Array.isArray(names) ? names[i] : (names && names[i]);
    const nm = (raw == null ? "" : String(raw)).trim();
    out.push({ name: nm || `Player ${i + 1}` });
  }
  return out;
}
// Deterministic team split from the salt: identical on every client (same salt + same roster order).
// Writes `side` (0|1) onto each roster entry. Re-runs every round so teams rotate.
function assignRosterTeams() {
  const roster = state.roster || [];
  const n = roster.length;
  if (n === 0) return;
  if (n <= SIDE_COUNT) { roster.forEach((r, i) => { r.side = i < SIDE_COUNT ? i : 1; }); return; }
  const order = roster.map((_, i) => i).sort((a, b) =>
    stableHash(`${state.gameSalt}:team:${a}:${roster[a].name}`) - stableHash(`${state.gameSalt}:team:${b}:${roster[b].name}`)
  );
  const base = Math.floor(n / 2);                              // even → balanced; odd → one side gets the extra
  const bigSide = stableHash(`${state.gameSalt}:teambig`) % 2; // which side gets the extra, derived from the salt
  const size0 = bigSide === 0 ? n - base : base;               // n - base === ceil(n/2)
  order.forEach((rosterIdx, pos) => { roster[rosterIdx].side = pos < size0 ? 0 : 1; });
}
function teamMembers(side) { return (state.roster || []).filter((r) => r.side === side); }
// Display label for a side: team name in 3+ games, else the human's/classic A-B label.
function teamLabel(side) {
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
function sideFromMsg(msg) { return msg && msg.seat === 0 ? 0 : 1; }
// A wire-safe copy of the roster (names + clientIds, no derived `side`).
function rosterForWire() { return (state.roster || []).map((r) => ({ name: r.name, clientId: r.clientId })); }
// Adopt a roster broadcast by the host and locate myself in it by clientId.
function applyRosterFromMsg(msg) {
  if (!Array.isArray(msg.roster)) return;
  state.roster = msg.roster.map((r) => ({ name: r.name, clientId: r.clientId }));
  state.playerCount = msg.playerCount || state.roster.length;
  const mine = state.roster.findIndex((r) => r.clientId && r.clientId === state.clientId);
  if (mine >= 0) state.myRosterIndex = mine;
}
// After the salt + roster are known, derive teams and set which side is mine.
function syncMySeatFromRoster() {
  if (!state.roster || !state.roster.length || !state.gameSalt) return;
  assignRosterTeams();
  const me = state.roster[state.myRosterIndex];
  if (me && typeof me.side === "number") state.mySeat = me.side;
}

function render() {
  renderLocation();
  renderRoom();
  renderSecret();
  renderHints();
  MysteryModes.renderHouseMap();
  renderBoard();
  renderMystery();
  renderOpponentPanel();
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
function characterStat(ch, key) {
  if (key === "name") return ch.name;
  if (key === "skin") return skinLuminance(ch);
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
// Baseline stats every character "holds"; extra options appear only for the modes that track them, and
// the chosen sort persists across rounds (unless it's not valid for the new mode).
const BASE_SORTS = [["", "Board order"], ["name", "Name A–Z"], ["skin", "Skin tone 🎨"], ["fuck", "Fuckability 😏"], ["abortions", "Abortions 👼"]];
function rebuildSortOptions() {
  const sel = els.sortSelect;
  if (!sel) return;
  // PG mode - and the plain FIRST round - hide the sort dropdown entirely (ordinary Guess Who has none).
  if (state.settings.pg || state.plainRound) { state.sortKey = ""; sel.value = ""; sel.style.display = "none"; return; }
  sel.style.display = "";
  const opts = [...BASE_SORTS, ...MysteryModes.modeSorts(state.global.mystery?.id)];
  if (!opts.some((o) => o[0] === state.sortKey)) state.sortKey = "";   // drop a sort the new mode can't do
  sel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  sel.value = state.sortKey;
}

function sortedBoard() {
  const key = state.sortKey;
  const modeSorted = !key ? MysteryModes.defaultSortedBoard() : null;
  if (modeSorted) return modeSorted;
  if (!key) return state.board;
  const arr = [...state.board];
  if (key === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
  if (key === "skin") return arr.sort((a, b) => skinLuminance(a) - skinLuminance(b) || a.name.localeCompare(b.name));
  return arr.sort((a, b) => (characterStat(b, key) - characterStat(a, key)) || a.name.localeCompare(b.name));
}

function renderLocation() {
  const backdrop = document.querySelector("#locationBackdrop");
  if (!state.location) {
    els.locationBand.className = "location-band is-off";
    if (backdrop) backdrop.style.backgroundImage = "";
    if (els.characterBoard) els.characterBoard.style.removeProperty("--board-art");
    return;
  }
  const variant = state.locationVariant === "night" ? "night" : "day";
  const artSrc = state.location.art[variant];
  // Bleed the location's colours into the page background behind everything.
  if (backdrop) backdrop.style.backgroundImage = `url('${encodeURI(artSrc)}')`;
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
  const online = state.gameMode === "online";
  document.body.classList.toggle("mode-online", online);
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
      : "";
    els.seatRoster.innerHTML = `
      <p class="or-label">Your room</p>
      <div class="or-code">#${escapeHtml(state.roomCode)} <button type="button" class="or-copy" title="Copy room number">📋</button></div>
      ${teamLine}
      <p class="or-status">${state.onlinePeer ? "🟢 friend connected" : "⏳ waiting for a friend to join…"}</p>`;
    const copyBtn = els.seatRoster.querySelector(".or-copy");
    if (copyBtn) copyBtn.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(state.roomCode).catch(() => {});
      copyBtn.textContent = "✓"; setTimeout(() => { copyBtn.textContent = "📋"; }, 900);
    });
    return;
  }
  // LOCAL: one joined segmented toggle, the active side lit. Tap a half (or the ⇄ badge) to hand off
  // the device. In 3+ games the two halves are TEAMS (with member names); in 2p it's the classic pill.
  els.seatRoster.className = "seat-roster seat-pill" + (rosterTeamMode() ? " seat-teams" : "");
  const teamMode = rosterTeamMode();
  els.seatRoster.innerHTML = [0, 1].map((i) => {
    const active = i === state.currentPlayer;
    const label = teamMode ? teamLabel(i) : (state.players[i].pname || (i === 0 ? "A" : "B"));
    const sub = teamMode ? `<span class="seat-sub">${escapeHtml(teamMembers(i).map((m) => m.name).join(", "))}</span>` : "";
    return `<button type="button" class="seat-half ${active ? "active" : ""}" data-seat="${i}">
        <span class="seat-glyph">${active ? "YOU" : escapeHtml(label)}</span>${sub}
      </button>`;
  }).join("") + `<button type="button" class="seat-swap" data-seat="${(state.currentPlayer + 1) % SIDE_COUNT}" aria-label="${teamMode ? "Swap team" : "Swap turn"}">⇄</button>`;
  els.seatRoster.querySelectorAll(".seat-half, .seat-swap").forEach((b) => b.addEventListener("click", () => {
    state.currentPlayer = Number(b.dataset.seat);
    render();
  }));
}

function renderSecret() {
  const player = currentPlayer();
  const secret = characterById(player.secretId);
  if (!player.secretVisible) {
    // Keep the full card footprint (same size as the revealed profile) - just a censored tile.
    els.secretCard.className = "secret-card character-card is-hidden";
    els.secretCard.removeAttribute("style");
    els.secretCard.title = "Tap to reveal your face";
    els.secretCard.innerHTML = `
      <div class="portrait-wrap"><div class="secret-hidden-tile">🙈</div></div>
      <div class="card-plate"><h3>Face hidden</h3><p class="card-hint">tap to reveal</p></div>`;
    if (els.revealSecretButton) setButtonIcon(els.revealSecretButton, "eye", "Show face");
    updateFloatingSecret(secret, false);
    return;
  }
  updateFloatingSecret(secret, true);
  // Your own card is the SAME as a board card - full mode dossier (orgy stats, Yu-Gi-Oh info, disease
  // sheet, badges, corner art, portrait swaps). A media query compacts it to face+name on phones.
  const m = state.global.mystery ? getMysteryCardData(secret) : {};
  els.secretCard.className = `secret-card character-card ${secret.variant || ""} ${m.cardClass || ""}`.trim();
  const bg = secret.traits?.background || "#cdd6e0";
  els.secretCard.setAttribute("style", `--secret-bg:${bg};${m.style || ""}`);
  const portraitSrc = m.image || secret.image;
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
  if (els.revealSecretButton) setButtonIcon(els.revealSecretButton, "eyeOff", "Hide face");
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
    img.src = m.image || secret.image;
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

function renderBoard() {
  const player = currentPlayer();
  rebuildSortOptions();            // sort menu adapts to the active mode (and persists the choice)
  MysteryModes.beforeRenderBoard();
  els.characterBoard.innerHTML = "";
  els.characterBoard.className = "character-board";
  els.characterBoard.setAttribute("aria-label", "Character board");
  MysteryModes.applyBoardClasses(els.characterBoard);
  if (MysteryModes.renderSpecialBoard(player)) return;
  sortedBoard().forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
  MysteryModes.afterDefaultBoard(player);
}
function renderHints() {
  const hints = state.global.hints[state.currentPlayer];
  els.hintShelf.classList.toggle("has-hints", hints.length > 0);
  els.hintShelf.innerHTML = hints.map((hint) => `<span class="hint-pill">${escapeHtml(hint)}</span>`).join("");
}

function renderMystery() {
  if (!els.mysteryButton) { els.mysteryResult.textContent = ""; return; }   // button retired - wheel picks the mode
  const used = state.players.filter((player) => player.mysteryUsed).length;
  if (els.mysteryUseCount) els.mysteryUseCount.textContent = `${used}/2`;
  const disabled = !state.settings.mystery || currentPlayer().mysteryUsed;
  els.mysteryButton.disabled = disabled;
  setButtonIcon(els.mysteryButton, "spark", currentPlayer().mysteryUsed ? "Mystery spent" : "Mystery effect");
  // The sub-line under the question stays empty - the mystery button already shows its own state, so
  // no filler status text ("Mystery is off." / "already burned its mystery.") clutters the cue card.
  els.mysteryResult.textContent = "";
}

function toggleEliminated(id) {
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
  renderBoard();
  state.justEliminated = null;
  state.justRestored = null;
  sfx(player.eliminated.has(id) ? "eliminate" : "revive");
  netSend("elim", { id, down: player.eliminated.has(id) });   // live-sync the cross-off
  scheduleSave();
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
  const tiers = age < 3 ? ["mild"] : age < 6 ? ["mild", "medium"] : ["mild", "medium", "feral"];
  return pg ? tiers.filter((h) => h !== "feral") : tiers;
}
function drawPrompt() {
  const modeDeck = state.global.mystery ? modePrompts[state.global.mystery.id] : null;
  const deck = modeDeck && modeDeck.length
    ? modeDeck
    : (state.settings.prompts ? absurdPrompts : classicPrompts);
  // Escalation only kicks in for decks that actually carry heat tags; untagged decks are used whole,
  // so this is a no-op until the content is tagged.
  let pool = deck;
  if (deck.some((p) => p && typeof p === "object" && p.heat)) {
    const allow = allowedHeats(state.roundAge || 0, state.settings.pg);
    const filtered = deck.filter((p) => allow.includes(promptHeat(p)));
    if (filtered.length) pool = filtered;
  }
  els.questionPrompt.textContent = promptText(pick(pool));
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

function activateMystery() {
  triggerMysteryEffect(state.currentPlayer);
  render();
  scheduleSave();
}

function triggerMysteryEffect(playerIndex) {
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
  card.classList.toggle("is-down", player.eliminated.has(character.id));
  card.dataset.id = character.id;
  if (mystery.effectName) card.dataset.mysteryEffect = mystery.effectName;
  if (mystery.style) card.setAttribute("style", mystery.style);
  Object.entries(mystery.dataset || {}).forEach(([key, value]) => {
    card.dataset[key] = value;
  });
  const prop = mystery.propEmoji ? `<span class="prop-overlay" aria-label="${escapeHtml(mystery.primaryText)}">${mystery.propEmoji}</span>` : "";
  // Roles are hidden by default - they are not known initially and only surface once the
  // Role Reveal mystery effect is triggered (which renders them via mystery.html below).
  let portraitSrc = mystery.image || character.image;
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
  card.innerHTML = `
    <div class="portrait-wrap">
      <img src="${portraitSrc}" alt="${escapeHtml(character.name)}">
      ${modeOverlayHtml}
      ${prop}
      ${babyBadge}
      ${state.sortKey === "abortions" ? `<span class="abortion-count" title="abortions">👼 ${character.abortions || 0}</span>` : ""}
      ${mystery.cornerHtml || ""}
    </div>
    <div class="card-plate">
      <h3>${displayName(character)}</h3>
      ${mystery.characterExtraHtml || ""}
      <div class="card-meta">${mystery.html}</div>
    </div>
  `;
  card.addEventListener("click", (e) => { if (e.target.closest(".dz-painscale")) return; toggleEliminated(character.id); });
  wireBreedDnD(card, character.id);
  return card;
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
  return state.players[state.currentPlayer];
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
  currentPlayer().secretVisible = !currentPlayer().secretVisible;
  renderSecret();
}
if (els.revealSecretButton) els.revealSecretButton.addEventListener("click", toggleSecretVisible);
if (els.secretCard) els.secretCard.addEventListener("click", toggleSecretVisible);

// The arrows button ends the round (you tell each other who you were in person - the reveal shows
// both secrets, then the next round deals). Seat swapping in local mode is the YOU/B chips.
els.swapSeatButton.addEventListener("click", endRound);

if (els.drawPromptButton) els.drawPromptButton.addEventListener("click", drawPrompt);
if (els.mysteryButton) els.mysteryButton.addEventListener("click", activateMystery);
if (els.endRoundButton) els.endRoundButton.addEventListener("click", endRound);
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
}
function setPgMode(on) {
  state.settings.pg = !!on;
  if (els.settingPG) els.settingPG.checked = state.settings.pg;
  const debugPg = document.querySelector("#debugPgToggle input");
  if (debugPg) debugPg.checked = state.settings.pg;
  rebuildDebugPicker();
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
    if (pgInput.checked) {
      setPgMode(true);
      flashToast("🧒 PG mode ON — adult modes hidden");
      return;
    }
    pgInput.checked = true;
    askAdultGate((ok) => {
      if (ok) { setPgMode(false); flashToast("PG mode OFF"); }
      else { setPgMode(true); flashToast("PG mode stays ON"); }
    });
  });
  els.debugEffectPicker.parentNode.insertBefore(pgWrap, els.debugEffectPicker.nextSibling);
  els.debugEffectPicker.addEventListener("change", () => {
    const id = els.debugEffectPicker.value;
    els.debugEffectPicker.value = "";
    const effect = MysteryModes.byId(id);
    if (!effect) return;
    if (currentPlayer()) currentPlayer().mysteryUsed = true;
    applyMysteryEffect(effect.id);
    playEffectAnnouncement(effect.name);
    showMysteryAnnouncement(effect.name, effect.exampleQuestion);
    addLog(`Debug: triggered "${effect.name}".`);
    render();
  });
}
document.addEventListener("keydown", handleTestTextTrigger);

els.setupButton.addEventListener("click", () => {
  syncSettingsToForm();
  els.setupDialog.showModal();
});

els.saveSetupButton.addEventListener("click", () => {
  state.settings.prompts = els.settingPrompts.checked;
  state.settings.mystery = els.settingMystery.checked;
  state.settings.locations = els.settingLocations.checked;
  state.settings.roles = els.settingRoles.checked;
  if (els.settingPG) state.settings.pg = els.settingPG.checked;
  state.settings.boardSize = Number(els.settingBoardSize.value);
  // A pasted seed code replays that exact round (board, location, wheel outcome, secrets).
  const code = els.settingSeed ? els.settingSeed.value.trim() : "";
  const parsed = code && code !== currentSeedCode() ? parseSeedCode(code) : null;
  if (parsed) {
    state.settings = { ...state.settings, ...(parsed.g || {}) };
    newGame(parsed.s);
  } else {
    newGame();
  }
});
// Unchecking PG in the setup dialog also needs the adults-only riddle (a kid can't just flip it off).
if (els.settingPG) els.settingPG.addEventListener("change", () => {
  if (els.settingPG.checked) return;                       // turning ON is free
  els.settingPG.checked = true;                            // hold it on until the riddle is solved
  askAdultGate((ok) => { setPgMode(!ok); });
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
function toggleSoundPanel() {
  let panel = document.getElementById("soundPanel");
  if (panel) { panel.remove(); return; }
  if (!window.Sound) return;
  unlockSound();
  panel = document.createElement("div");
  panel.id = "soundPanel"; panel.className = "sound-panel";
  const S = window.Sound;
  const host = state.gameMode !== "online" || state.isHost;
  const trackOpts = S.trackNames().map((n, i) => `<option value="${i}" ${i === S.currentTrack() ? "selected" : ""}>${escapeHtml(n)}</option>`).join("");
  panel.innerHTML = `
    <div class="sp-head"><b>🔊 Sound</b><button type="button" class="sp-x" aria-label="close">✕</button></div>
    <label class="sp-row"><span>Sound on</span><input type="checkbox" class="sp-master" ${S.isEnabled() ? "checked" : ""}></label>
    <label class="sp-row"><span>Music${host ? "" : " (host controls)"}</span><input type="checkbox" class="sp-music" ${S.isMusicOn() ? "checked" : ""} ${host ? "" : "disabled"}></label>
    <label class="sp-row"><span>Track</span><select class="sp-track" ${host ? "" : "disabled"}>${trackOpts}</select></label>
    <div class="sp-board-label">Soundboard — both players hear it</div>
    <div class="sp-board">${S.sfxNames().map((n) => `<button type="button" class="sp-fx" data-fx="${n}">${escapeHtml(n)}</button>`).join("")}</div>`;
  document.querySelector(".game-stage")?.appendChild(panel) || document.body.appendChild(panel);
  panel.querySelector(".sp-x").addEventListener("click", () => panel.remove());
  panel.querySelector(".sp-master").addEventListener("change", (e) => { S.setEnabled(e.target.checked); if (e.target.checked) sfx("blip"); });
  const musicBox = panel.querySelector(".sp-music");
  const trackSel = panel.querySelector(".sp-track");
  const pushMusic = () => { S.setMusic(musicBox.checked); S.setTrack(Number(trackSel.value)); if (state.gameMode === "online") netSend("music", { on: musicBox.checked, track: Number(trackSel.value) }); };
  if (host) { musicBox.addEventListener("change", pushMusic); trackSel.addEventListener("change", () => { if (!musicBox.checked) musicBox.checked = true; pushMusic(); }); }
  panel.querySelectorAll(".sp-fx").forEach((b) => b.addEventListener("click", () => sfx(b.dataset.fx, { shared: true })));
}
if (els.soundButton) els.soundButton.addEventListener("click", toggleSoundPanel);

function syncSettingsToForm() {
  els.settingPrompts.checked = state.settings.prompts;
  els.settingMystery.checked = state.settings.mystery;
  els.settingLocations.checked = state.settings.locations;
  els.settingRoles.checked = state.settings.roles;
  if (els.settingPG) els.settingPG.checked = state.settings.pg;
  els.settingBoardSize.value = String(state.settings.boardSize);
  if (els.settingSeed) els.settingSeed.value = state.gameSalt ? currentSeedCode() : "";
}

// ===================== Refresh-proof game persistence =====================
// The whole round survives a refresh: the salt re-derives the board/effect/secrets, and the save
// carries what ISN'T derivable - session babies, eliminations, seat, settings.
const GAME_SAVE_KEY = "whoisit_game_v1";
let saveTimer = null;
function scheduleSave() { clearTimeout(saveTimer); saveTimer = setTimeout(saveGameState, 400); }
function saveGameState() {
  try {
    localStorage.setItem(GAME_SAVE_KEY, JSON.stringify({
      v: 1,
      salt: state.gameSalt,
      settings: state.settings,
      gameMode: state.gameMode || "local",
      mySeat: state.mySeat || 0,
      roomCode: state.roomCode,   // online: the channel isn't re-derivable for a joiner, so persist it
      currentPlayer: state.currentPlayer,
      roundAge: state.roundAge || 0,
      playerCount: state.playerCount || 2,
      roster: (state.roster || []).map((r) => ({ name: r.name, clientId: r.clientId, side: r.side })),
      clientId: state.clientId || "",
      myRosterIndex: state.myRosterIndex || 0,
      isHost: !!state.isHost,
      boardIds: state.board.map((c) => c.id),   // pin the exact deal: the pool can grow mid-round (fresh GAYBYs)
      effectId: state.global.mystery ? state.global.mystery.id : null,   // debug-picked/mystery-swapped modes survive too
      babies: state.board.filter((c) => c.isBaby || (c.isGayby && !c.persistedGayby)).map(serializeCharacter),
      abortedBabies: state.abortedBabies || [],   // purgatory souls carry across rounds this session
      players: state.players.map((p) => ({ secretId: p.secretId, eliminated: [...p.eliminated], mysteryUsed: p.mysteryUsed }))
    }));
  } catch (e) { /* storage full/blocked - play on */ }
}
function loadGameSave() {
  try { const s = JSON.parse(localStorage.getItem(GAME_SAVE_KEY) || "null"); return s && s.v === 1 && s.salt ? s : null; }
  catch (e) { return null; }
}
function resumeGame(saved) {
  state.settings = { ...state.settings, ...(saved.settings || {}) };
  state.gameMode = saved.gameMode || "local";
  state.mySeat = saved.mySeat || 0;
  // The online room code must be restored BEFORE newGame's netConnect, or a resumed client would
  // reconnect to the default "0000" channel and silently stop syncing. Fall back to the salt-derived
  // code (valid for a host, whose code IS the salt hash) for older saves without a stored roomCode.
  if ((saved.gameMode || "local") === "online") {
    state.roomCode = saved.roomCode || String((stableHash(saved.salt) % 9000) + 1000);
  }
  state.roundAge = saved.roundAge || 0;   // restored before newGame's resume path (which preserves it)
  state.abortedBabies = saved.abortedBabies || [];
  // Restore the roster BEFORE newGame so assignRosterTeams re-derives the same sides from the same
  // salt + roster (and the seat pill / team labels come back intact).
  state.playerCount = saved.playerCount || 2;
  state.roster = Array.isArray(saved.roster) ? saved.roster.map((r) => ({ name: r.name, clientId: r.clientId, side: r.side })) : [];
  state.clientId = saved.clientId || state.clientId;
  state.myRosterIndex = saved.myRosterIndex || 0;
  state.isHost = !!saved.isHost;
  newGame(saved.salt, { resume: true, remote: true });
  // Rebuild the EXACT dealt board from the save: re-dealing from the salt isn't enough because the
  // pool can have grown mid-round (a fresh GAYBY persists into it instantly and would displace
  // someone). Falls back to the salt deal for old saves.
  if (Array.isArray(saved.boardIds) && saved.boardIds.length > 1) {
    const byId = new Map(generatedCharacters.map((c) => [c.id, c]));
    const rebuilt = saved.boardIds.map((id) => byId.get(id)).filter(Boolean);
    if (rebuilt.length >= 2) {
      state.board = rebuilt;
      state.global.roleMap = {};
      state.board.forEach((ch, i) => { state.global.roleMap[ch.id] = state.settings.roles ? characterRoles[i % characterRoles.length] : ch.role; });
    }
  }
  // Session babies rejoin the board (images re-rendered from their traits).
  (saved.babies || []).forEach((b) => {
    if (state.board.some((c) => c.id === b.id)) return;
    const baby = { ...b };
    if (baby.traits && window.faceGenerator) { try { baby.image = window.faceGenerator.renderPortrait(baby.seed, baby.traits); } catch (e) { return; } }
    state.board.push(baby);
  });
  // Apply the effect AFTER the babies exist so they get per-mode stats too. No wheel replay. The
  // saved effect id wins (covers debug-picked modes); old saves fall back to the derived wheel.
  const effId = saved.effectId !== undefined ? saved.effectId : (state.settings.mystery ? wheelTarget() : null);
  if (effId) applyMysteryEffect(effId);
  (saved.players || []).forEach((sp, i) => {
    if (!state.players[i]) return;
    state.players[i].secretId = sp.secretId || state.players[i].secretId;
    state.players[i].eliminated = new Set(sp.eliminated || []);
    state.players[i].mysteryUsed = !!sp.mysteryUsed;
  });
  state.currentPlayer = saved.currentPlayer ?? (state.mySeat || 0);
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
function showTeamReveal(done) {
  const chip = (m) => `<div class="tr-chip"><span class="tr-ini">${escapeHtml((m.name || "?").slice(0, 1).toUpperCase())}</span><span class="tr-nm">${escapeHtml(m.name || "?")}</span></div>`;
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
  setTimeout(finish, 3000);
}
// End of round: the big reveal - BOTH secret characters side by side, then the next round deals.
function showRoundReveal(done) {
  const secA = characterById(state.players[0].secretId);
  const secB = characterById(state.players[1].secretId);
  const my = state.gameMode === "online" ? (state.mySeat || 0) : state.currentPlayer;
  const mine = my === 0 ? secA : secB;
  const theirs = my === 0 ? secB : secA;
  const teamMode = rosterTeamMode();
  const ov = document.createElement("div");
  ov.className = "round-reveal";
  ov.innerHTML = `
    <div class="rr-title">ROUND OVER</div>
    <div class="rr-cards">
      <div class="rr-card"><span class="rr-label rr-you">${teamMode ? "YOUR TEAM WAS" : "YOU WERE"}</span><img src="${mine ? mine.image : ""}" alt=""><span class="rr-name">${escapeHtml(mine ? mine.name : "?")}</span></div>
      <div class="rr-vs">×</div>
      <div class="rr-card"><span class="rr-label rr-them">THEY WERE</span><img src="${theirs ? theirs.image : ""}" alt=""><span class="rr-name">${escapeHtml(theirs ? theirs.name : "?")}</span></div>
    </div>`;
  document.body.appendChild(ov);
  setTimeout(() => {
    ov.classList.add("rr-out");
    setTimeout(() => ov.remove(), 450);
    if (done) done();
  }, 4200);
}
function endRound() {
  netSend("endround", {});
  showRoundReveal(() => newGame());
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
function askAdultGate(cb, required = 3) {
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
      <p class="riddle-eyebrow">🔞 Adults only — solve ${needed} to turn PG off</p>
      <p class="riddle-progress"></p>
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

function showTitleScreen() {
  const saved = loadGameSave();
  const ov = document.createElement("div");
  ov.className = "title-screen";
  ov.innerHTML = `
    <div class="ts-words" aria-hidden="true">
      <span class="ts-who">WHO?</span>
      <span class="ts-isit">IS IT?</span>
    </div>
    <div class="ts-actions">
      <div class="ts-step ts-step-main">
        <div class="ts-count" role="group" aria-label="Number of players">
          <span class="ts-count-label">PLAYERS</span>
          <button type="button" class="ts-count-btn ts-count-dn" aria-label="Fewer players">−</button>
          <b class="ts-count-val">2</b>
          <button type="button" class="ts-count-btn ts-count-up" aria-label="More players">+</button>
        </div>
        <button type="button" class="button primary ts-local">🛋 LOCAL GAME</button>
        <button type="button" class="button secondary ts-online">🌐 ONLINE GAME</button>
        ${saved ? `<button type="button" class="button ghost ts-resume">↩ RESUME ROUND · #${(stableHash(saved.salt) % 9000) + 1000}</button>` : ""}
      </div>
      <div class="ts-step ts-step-names" hidden>
        <p class="ts-names-label">Name your players</p>
        <div class="ts-names-list"></div>
        <button type="button" class="button primary ts-names-go">DEAL →</button>
        <button type="button" class="button ghost ts-back">← back</button>
      </div>
      <div class="ts-step ts-step-online" hidden>
        <input class="ts-name-input" type="text" maxlength="16" placeholder="Your name" aria-label="Your name">
        <button type="button" class="button primary ts-host">🎪 HOST A ROOM</button>
        <button type="button" class="button secondary ts-showjoin">🔑 JOIN A ROOM</button>
        <button type="button" class="button ghost ts-back">← back</button>
      </div>
      <div class="ts-step ts-step-join" hidden>
        <p class="ts-join-label">Enter your friend's room number</p>
        <input class="ts-join-input" type="text" inputmode="numeric" maxlength="4" placeholder="1234" aria-label="Room code to join">
        <button type="button" class="button primary ts-join-go">JOIN ROOM →</button>
        <button type="button" class="button ghost ts-back">← back</button>
      </div>
    </div>
    <button type="button" class="button secondary ts-pg ${state.settings.pg ? "on" : ""}" aria-pressed="${state.settings.pg}"><span>PG MODE</span><b>${state.settings.pg ? "ON" : "OFF"}</b></button>`;
  document.body.appendChild(ov);
  const close = () => { ov.classList.add("ts-out"); setTimeout(() => ov.remove(), 500); };
  // PG toggle: turning it ON is free; turning it OFF is gated behind an adults-only riddle.
  const pgBtn = ov.querySelector(".ts-pg");
  const paintPg = () => { pgBtn.classList.toggle("on", state.settings.pg); pgBtn.querySelector("b").textContent = state.settings.pg ? "ON" : "OFF"; pgBtn.setAttribute("aria-pressed", String(state.settings.pg)); };
  pgBtn.addEventListener("click", () => {
    if (!state.settings.pg) { setPgMode(true); paintPg(); sfx("blip"); return; }
    askAdultGate((ok) => { if (ok) { setPgMode(false); paintPg(); sfx("coin"); } else { setPgMode(true); paintPg(); sfx("buzzer"); } });
  });
  const steps = {
    main: ov.querySelector(".ts-step-main"),
    names: ov.querySelector(".ts-step-names"),
    online: ov.querySelector(".ts-step-online"),
    join: ov.querySelector(".ts-step-join")
  };
  const show = (name) => Object.entries(steps).forEach(([k, el]) => { el.hidden = k !== name; });
  // Player-count stepper (drives LOCAL games; online host picks count in the lobby).
  let localCount = MIN_PLAYERS;
  const countVal = ov.querySelector(".ts-count-val");
  const setCount = (c) => { localCount = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, c)); countVal.textContent = localCount; };
  ov.querySelector(".ts-count-dn").addEventListener("click", () => { setCount(localCount - 1); sfx("blip"); });
  ov.querySelector(".ts-count-up").addEventListener("click", () => { setCount(localCount + 1); sfx("blip"); });
  ov.querySelector(".ts-local").addEventListener("click", () => {
    if (localCount <= 2) { close(); startLocalGame(); return; }   // classic path unchanged
    // 3+ players: collect names first.
    const list = ov.querySelector(".ts-names-list");
    list.innerHTML = Array.from({ length: localCount }, (_, i) =>
      `<input class="ts-name-slot" type="text" maxlength="16" placeholder="Player ${i + 1}" aria-label="Player ${i + 1} name">`
    ).join("");
    show("names");
    setTimeout(() => list.querySelector("input")?.focus(), 50);
  });
  ov.querySelector(".ts-names-go").addEventListener("click", () => {
    const names = [...ov.querySelectorAll(".ts-name-slot")].map((el) => el.value);
    close();
    startLocalGame(localCount, names);
  });
  ov.querySelector(".ts-online").addEventListener("click", () => show("online"));
  const nameOf = () => (ov.querySelector(".ts-name-input")?.value || "").trim();
  ov.querySelector(".ts-host").addEventListener("click", () => { close(); startOnlineGame(nameOf() || "Host"); });
  ov.querySelector(".ts-showjoin").addEventListener("click", () => { show("join"); setTimeout(() => ov.querySelector(".ts-join-input").focus(), 50); });
  ov.querySelectorAll(".ts-back").forEach((b) => b.addEventListener("click", () => show("main")));
  const joinInput = ov.querySelector(".ts-join-input");
  const doJoin = () => { const code = (joinInput.value || "").trim(); if (/^\d{3,4}$/.test(code)) { close(); joinRoom(code, nameOf() || "Guest"); } else { joinInput.classList.add("shake"); setTimeout(() => joinInput.classList.remove("shake"), 400); } };
  ov.querySelector(".ts-join-go").addEventListener("click", doJoin);
  joinInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doJoin(); });
  const res = ov.querySelector(".ts-resume");
  if (res) res.addEventListener("click", () => { close(); resumeGame(saved); });
}

// LOCAL: pass-and-play on one screen - the YOU/B (or team) toggle is how you hand off the device.
// No args (or count <= 2) is the classic two-player game: empty roster, identical to the old build.
function startLocalGame(count, names) {
  state.gameMode = "local"; state.mySeat = 0; state.inLobby = false;
  if (count && count > 2) {
    state.roster = normalizeRoster(count, names);
    state.playerCount = state.roster.length;
  } else {
    state.roster = []; state.playerCount = 2;
  }
  newGame(undefined, { first: true });
  // The plain opening round returns before newGame's own scheduleSave, so a fresh multi-player
  // setup would vanish on an immediate refresh - pin it now.
  if (rosterTeamMode()) scheduleSave();
}

// ONLINE host: open a LOBBY (no round dealt yet). The room's salt is fixed now so the room code is
// stable through the eventual deal; players gather, then the host presses START.
function startOnlineGame(name) {
  state.gameMode = "online"; state.isHost = true; state.mySeat = 0; state.inLobby = true;
  ensureClientId();
  state.pname = name || "Player 1";
  state.gameSalt = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  state.roomCode = String((stableHash(state.gameSalt) % 9000) + 1000);
  state.playerCount = 2;
  state.roster = [{ name: state.pname, clientId: state.clientId }];   // host is roster slot 0
  state.myRosterIndex = 0;
  state.seenPeers = new Set();
  netConnect();
  showLobby();
}
// ONLINE guest: connect to the host's room and wait for the host's roster broadcast + START.
function joinRoom(code, name) {
  state.gameMode = "online"; state.isHost = false; state.mySeat = 1; state.inLobby = true;
  ensureClientId();
  state.pname = name || "Player 2";
  state.roomCode = code;
  state.roster = [];               // populated from the host's "lobby" broadcast
  state.myRosterIndex = -1;
  state.seenPeers = new Set();
  netConnect();
  showLobby();
}

// The waiting room: room number, who's arrived, and (host only) a START button once a friend joins.
function showLobby() {
  document.querySelector(".lobby-screen")?.remove();
  const host = state.isHost;
  const ov = document.createElement("div");
  ov.className = "lobby-screen title-screen";
  ov.innerHTML = `
    <div class="ts-words" aria-hidden="true"><span class="ts-who">WHO?</span><span class="ts-isit">IS IT?</span></div>
    <p class="lobby-code">ROOM <b>#${escapeHtml(state.roomCode)}</b></p>
    ${host ? `<div class="ts-count lobby-count" role="group" aria-label="Number of players">
      <span class="ts-count-label">PLAYERS</span>
      <button type="button" class="ts-count-btn lobby-count-dn" aria-label="Fewer players">−</button>
      <b class="ts-count-val lobby-count-val">${state.playerCount}</b>
      <button type="button" class="ts-count-btn lobby-count-up" aria-label="More players">+</button>
    </div>` : ""}
    <div class="lobby-players"></div>
    <p class="lobby-status"></p>
    <div class="lobby-actions">
      ${host ? `<button type="button" class="button primary lobby-start" disabled>START</button>` : ""}
      <button type="button" class="button ghost lobby-leave">← leave</button>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector(".lobby-leave").addEventListener("click", () => { state.inLobby = false; try { net && net.close(); } catch (e) {} ov.remove(); showTitleScreen(); });
  if (host) {
    // The count is the number of SLOTS shown; it can't drop below the humans already here.
    const setCount = (c) => {
      state.playerCount = Math.max(Math.max(MIN_PLAYERS, state.roster.length), Math.min(MAX_PLAYERS, c));
      broadcastLobby();
      updateLobby();
    };
    ov.querySelector(".lobby-count-dn").addEventListener("click", () => setCount(state.playerCount - 1));
    ov.querySelector(".lobby-count-up").addEventListener("click", () => setCount(state.playerCount + 1));
  }
  const startBtn = ov.querySelector(".lobby-start");
  if (startBtn) startBtn.addEventListener("click", () => {
    state.inLobby = false;
    ov.classList.add("ts-out"); setTimeout(() => ov.remove(), 400);
    // Finalize the roster to the humans actually present, then deal. The opening online round is
    // plain Guess Who (no effect, no wheel) for every seat.
    state.playerCount = state.roster.length;
    state.wheelPickShared = null;
    syncMySeatFromRoster();
    netSend("start", { salt: state.gameSalt, settings: state.settings, roster: rosterForWire(), playerCount: state.playerCount, effectId: null, first: true });
    newGame(state.gameSalt, { effectId: null, announced: true, first: true });
  });
  updateLobby();
}
// Host → everyone: the authoritative roster + target player count. Guests render their lobby from it.
function broadcastLobby() {
  if (!state.isHost) return;
  netSend("lobby", { roster: rosterForWire(), playerCount: state.playerCount });
}
function updateLobby() {
  const ov = document.querySelector(".lobby-screen");
  if (!ov) return;
  const roster = state.roster || [];
  const slots = Math.max(state.playerCount || 2, roster.length, 2);
  const cv = ov.querySelector(".lobby-count-val"); if (cv) cv.textContent = state.playerCount;
  ov.querySelector(".lobby-players").innerHTML = Array.from({ length: slots }, (_, i) => {
    const r = roster[i];
    const me = r && r.clientId && r.clientId === state.clientId;
    return `<div class="lobby-player ${r ? "here" : "empty"}">${r ? `✅ ${escapeHtml(r.name)}${me ? " (you)" : ""}` : "⏳ waiting…"}</div>`;
  }).join("");
  const enough = roster.length >= 2;
  ov.querySelector(".lobby-status").textContent = enough
    ? (state.isHost ? "Ready when you are — press START." : "Waiting for the host to start…")
    : `Share room #${state.roomCode} with friends.`;
  const startBtn = ov.querySelector(".lobby-start");
  if (startBtn) startBtn.disabled = !enough;
}

// ===================== SEED codes (share a whole setup) =====================
// The code packs the salt + settings; pasting it deals the IDENTICAL round (same board, same
// location, same wheel outcome, same secrets) - assuming both sides have the same character pool.
function currentSeedCode() {
  try { return btoa(unescape(encodeURIComponent(JSON.stringify({ s: state.gameSalt, g: state.settings })))).replace(/=+$/, ""); }
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
mergeCustomIntoPool();                 // fold saved custom characters into the playable pool
mergeGaybiesIntoPool();                // and the persistent GAYBYs
wirePainScaleDrag();                   // drag the disease pain scale to change emotions
if (els.editorButton) els.editorButton.addEventListener("click", openCharacterEditor);
showTitleScreen();                     // WHO? / IS IT? slides in; deal or resume from there
wireCueCardClick();
wireFloatingSecret();
if (els.sortSelect) {
  els.sortSelect.addEventListener("change", () => { state.sortKey = els.sortSelect.value; renderBoard(); });
}
