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
    pg: false,          // "PG mode" - the wheel only lands on kid-safe modes, no breeding/woohoo
    boardSize: 24
  },
  currentPlayer: 0,
  gameMode: "local",   // "local" (pass-and-play) or "online" (room-synced)
  board: [],
  players: [],
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

const mysteryEffects = [
  {
    id: "prop-panic",
    name: "WHAT'S IN THE HAND?",
    apply: applyPropPanic,
    exampleQuestion: "Would your person's object beat a rock?"
  },
  {
    id: "family-tree-disaster",
    name: "Family Tree Disaster",
    apply: applyFamilyTreeDisaster,
    exampleQuestion: "Is your person someone’s twin?"
  },
  {
    id: "knockoff-manor",
    name: "MURDER TIME!!!",
    apply: applyKnockoffManor,
    exampleQuestion: "Is your person in the BATHS ROOM?"
  },
  {
    id: "emotional-audit",
    name: "Emotional Audit",
    apply: applyEmotionalAudit,
    exampleQuestion: "Is your person dangerously confident?"
  },
  {
    id: "witness-protection-filter",
    name: "Witness Protection Filter",
    apply: applyWitnessProtectionFilter,
    exampleQuestion: "Are your person's eyes redacted with a black bar?"
  },
  {
    id: "role-reveal",
    name: "Role Reveal",
    apply: applyRoleReveal,
    exampleQuestion: "Does your person work with their hands?"
  },
  {
    id: "hidden-agendas",
    name: "Hidden Agendas",
    apply: applyHiddenAgendas,
    exampleQuestion: "Is your person secretly seething behind that smile?"
  },
  {
    id: "monocultural",
    name: "Monocultural",
    apply: applyMonocultural,
    exampleQuestion: "Is your person a different colour to anyone else?"
  },
  {
    id: "gay-frogged",
    name: "Gay Frogged",
    apply: applyGayFrogged,
    exampleQuestion: "Is your person glowing the same colour as yours?"
  },
  {
    id: "face-first",
    name: "Face First",
    apply: applyFaceFirst,
    exampleQuestion: "Could you pick your person from their face alone?"
  },
  {
    id: "ps1-mode",
    name: "PS1 Mode",
    apply: applyPs1Mode,
    exampleQuestion: ""
  },
  {
    id: "yugioh",
    name: "Yu-Gi-Oh!",
    apply: applyYugioh,
    exampleQuestion: "Is your person a Trap Card?"
  },
  {
    id: "orgy",
    name: "Orgy Mode",
    apply: applyOrgy,
    exampleQuestion: "Is your person a bottom?"
  },
  {
    id: "fireworks",
    name: "Fireworks Mode",
    apply: applyFireworks,
    exampleQuestion: "Ready to make someone's head pop?"
  },
  {
    id: "pixall",
    name: "PIXALL",
    apply: applyPixall,
    exampleQuestion: "Is your person made of more than 8 pixels?"
  },
  {
    id: "disease",
    name: "Disease Mode",
    apply: applyDisease,
    exampleQuestion: "Is your person's condition MEGA?"
  },
  {
    id: "drugs",
    name: "Drug Addict Mode",
    apply: applyDrugs,
    exampleQuestion: "Does your person inject?"
  },
  {
    id: "fertility",
    name: "Fertility Mode",
    apply: applyFertility,
    exampleQuestion: "Is your person barren?"
  },
  {
    id: "disguise",
    name: "Special Disguise",
    apply: applyDisguise,
    exampleQuestion: "Can you even tell who your person is?"
  },
  {
    id: "work",
    name: "Work Mode",
    apply: applyWork,
    exampleQuestion: "Is your person ready for the meeting?"
  },
  {
    id: "woke",
    name: "WOKE Mode",
    apply: applyWoke,
    exampleQuestion: "Is your person doing the absolute most?"
  },
  {
    id: "swipe",
    name: "SWIPE",
    apply: applySwipe,
    exampleQuestion: "Would you swipe right on your person?"
  },
  {
    id: "judgement",
    name: "Judgement Day",
    apply: applyJudgement,
    exampleQuestion: "Is your person going to hell?"
  },
  {
    id: "sims",
    name: "Sims Mode",
    apply: applySims,
    exampleQuestion: "Is your person's plumbob red?"
  },
  {
    id: "heads-only",
    name: "Heads Only",
    apply: applyHeadsOnly,
    exampleQuestion: "Is your person's head in the top half right now?"
  },
  {
    id: "habbo",
    name: "Habbo Hotel",
    apply: applyHabbo,
    exampleQuestion: "Is your person standing on the left side of the room?"
  },
  {
    id: "astrology",
    name: "Astrology",
    apply: applyAstrology,
    exampleQuestion: "Is your person a water sign?"
  },
  {
    id: "pantone",
    name: "PANTONE",
    apply: applyPantone,
    exampleQuestion: "Is your person's colour warm-toned?"
  },
  {
    id: "horny-potter",
    name: "Horny Potter",
    apply: applyHornyPotter,
    exampleQuestion: "Is your person in Slytherin?"
  }
];

const KNOCKOFF_MANOR_TEST_TRIGGERS = ["manor", "murder"];
const PS1_TEST_TRIGGERS = ["ps1"];
const GAY_FROGGED_TEST_TRIGGERS = ["gay"];
let testTriggerBuffer = "";
let ps1Install = null;
let ps1Cleanup = null;

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
        const eff = mysteryEffects.find((e) => e.id === id);
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
}

// What the Wheel of Fate WILL land on for the current salt (deterministic; includes "no effect").
function wheelTarget() {
  const pool = state.settings.pg ? mysteryEffects.filter((e) => PG_SAFE_MODES.includes(e.id)) : mysteryEffects;
  const n = pool.length + 1;   // +1 = the No Effect cell
  const idx = stableHash(`${state.gameSalt}:wheel`) % n;
  return idx < pool.length ? pool[idx].id : null;
}
// No-repeat wheel: the wheel draws from a persistent bag and never repeats a mode until you've
// experienced every single one (then the bag resets for another full lap). Still salt-deterministic
// WITHIN the bag, and the chosen id rides the "start" message so online clients agree regardless
// of their local bag state.
const WHEEL_BAG_KEY = "whoisit_wheel_bag_v1";
function wheelBag() {
  try { const b = JSON.parse(localStorage.getItem(WHEEL_BAG_KEY) || "[]"); return Array.isArray(b) ? b : []; }
  catch (e) { return []; }
}
// Escalating derangement: the wheel works through TIERS, tame -> unhinged. It only reaches into a
// tier once the earlier tiers are exhausted, so a session eases in (PS1, prop panic, murder time)
// and gets progressively more feral, finishing on WOKE (the everything-at-once finale). Within the
// current tier the pick is salt-random for variety. Once the whole gauntlet is seen the bag resets.
const WHEEL_TIERS = [
  ["prop-panic", "ps1-mode", "face-first", "emotional-audit", "role-reveal", "astrology", "pantone", "habbo", "heads-only", null],
  ["knockoff-manor", "family-tree-disaster", "yugioh", "pixall", "horny-potter", "witness-protection-filter"],
  ["hidden-agendas", "monocultural", "gay-frogged", "swipe", "fireworks", "sims"],
  ["drugs", "disguise", "disease", "fertility", "orgy", "judgement", "work"],
  ["woke"]
];
// woke needs every one of its component modes experienced first (belt-and-braces beyond its tier).
const WOKE_PREREQS = ["gay-frogged", "orgy", "drugs", "disease", "fertility", "work", "disguise"];
// PG mode: only these wholesome, "explain-to-a-10-year-old" modes are ever picked. Everything sexual/
// drug/breeding/politically-charged (horny-potter, woke, gay-frogged, orgy, fertility, drugs, disease,
// swipe, work, monocultural, judgement, murder, hidden-agendas, family-tree) is excluded.
const PG_SAFE_MODES = ["prop-panic", "ps1-mode", "face-first", "emotional-audit", "role-reveal", "astrology", "pantone", "heads-only", "yugioh", "pixall", "habbo", "witness-protection-filter", "sims", "family-tree-disaster"];
function wheelPgOk(id) { return !state.settings.pg || id === null || PG_SAFE_MODES.includes(id); }
function wheelTargetFromBag() {
  const known = new Set(mysteryEffects.map((e) => e.id));
  const seen = wheelBag();
  for (const tier of WHEEL_TIERS) {
    let pool = tier.filter((id) => (id === null || known.has(id)) && !seen.includes(id) && wheelPgOk(id));
    // Gate WOKE until its prerequisite modes have all been seen.
    pool = pool.filter((id) => id !== "woke" || WOKE_PREREQS.every((p) => seen.includes(p)));
    if (pool.length) return pool[stableHash(`${state.gameSalt}:wheel`) % pool.length];
  }
  // Whole gauntlet complete - reset and start a fresh, escalating lap.
  try { localStorage.setItem(WHEEL_BAG_KEY, "[]"); } catch (e) { /* fine */ }
  const first = WHEEL_TIERS[0].filter((id) => (id === null || known.has(id)) && wheelPgOk(id));
  return (first.length ? first[stableHash(`${state.gameSalt}:wheel`) % first.length] : null);
}
function markWheelSeen(id) {
  try {
    const seen = wheelBag();
    if (!seen.includes(id)) { seen.push(id); localStorage.setItem(WHEEL_BAG_KEY, JSON.stringify(seen)); }
  } catch (e) { /* fine */ }
}

function makePlayer(index, taken) {
  // Deterministic per seat (both online clients agree), but collision-FREE: seat 0 takes its hashed
  // index; a later seat whose hash lands on a taken index walks forward until it finds a free one, so
  // two seats never share the same secret.
  let idx = stableHash(`${state.gameSalt}:secret:${index}`) % state.board.length;
  if (taken) { while (taken.has(idx)) idx = (idx + 1) % state.board.length; taken.add(idx); }
  return {
    name: `Seat ${String.fromCharCode(65 + index)}`,
    pname: (state.lobby && state.lobby[index]) || (state.gameMode === "online" && index === (state.mySeat || 0) ? state.pname : null),
    secretId: state.board[idx].id,
    eliminated: new Set(),
    mysteryUsed: false,
    secretVisible: true
  };
}

function render() {
  renderLocation();
  renderRoom();
  renderSecret();
  renderHints();
  renderHouseMap();
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
const MODE_SORTS = {
  orgy: [["horniness", "Horniness 🔥"], ["cum", "Cum count 💦"], ["bodycount", "Body count 🍆"], ["deathness", "Close to death 💀"]],
  woke: [["horniness", "Horniness 🔥"], ["cum", "Cum count 💦"], ["deathness", "Close to death 💀"]],
  fertility: [["cum", "Sperm count 💦"], ["eggs", "Egg count 🥚"]],
  disease: [["deathness", "Close to death 💀"]],
  drugs: [["habits", "Habits 💉"]],
  work: [["days", "Days left ⛏"]],
  sims: [["cash", "Simoleons §"], ["mood", "Mood 💎"]],
  judgement: [["karma", "Karma ⚖️"], ["happiness", "Happiness 😀"]],
  swipe: [["match", "Match % 🔥"], ["distance", "Distance 📍"]]
};
function rebuildSortOptions() {
  const sel = els.sortSelect;
  if (!sel) return;
  // PG mode - and the plain FIRST round - hide the sort dropdown entirely (ordinary Guess Who has none).
  if (state.settings.pg || state.plainRound) { state.sortKey = ""; sel.value = ""; sel.style.display = "none"; return; }
  sel.style.display = "";
  const opts = [...BASE_SORTS, ...(MODE_SORTS[state.global.mystery?.id] || [])];
  if (!opts.some((o) => o[0] === state.sortKey)) state.sortKey = "";   // drop a sort the new mode can't do
  sel.innerHTML = opts.map(([v, l]) => `<option value="${v}">${l}</option>`).join("");
  sel.value = state.sortKey;
}

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
  if (!Array.isArray(traits.hairLocks) || !traits.hairLocks.length) return traits;
  traits.hairLocks = traits.hairLocks.map((lk) => ({
    ...lk,
    mirror: !lk.mirror,
    scale: +((Number(lk.scale) || 1) * (1 + (Math.random() - 0.5) * 0.1)).toFixed(3),
    x: +((Number(lk.x) || 50) + (Math.random() - 0.5) * 4).toFixed(2),
    y: +((Number(lk.y) || 50) + (Math.random() - 0.5) * 4).toFixed(2)
  }));
  return traits;
}
function makeBaby(A, B, gayby) {
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
    }, () => abortBaby(baby, A, B))));
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
    }, () => abortBaby(baby, A, B))));
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
      const eff = mysteryEffects.find((e) => e.id === state.global.mystery.id);
      if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (e) { /* mode has no per-baby data - fine */ } }
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
  }, () => abortBaby(baby, A, B))), { woohoo });
}
// A transparent-background portrait + the original backdrop colour, so Sims relief animations can
// move JUST the person while the card background holds still.
function simsPortrait(ch) {
  if (!(ch.traits && window.faceGenerator)) return {};
  try {
    return { image: window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, background: "transparent" }), bg: ch.traits.background };
  } catch (e) { return {}; }
}
// After a baby is born the players decide its fate: KEEP adds it to the board, ABORT... doesn't.
// PG mode is wholesome - the baby is simply KEPT, no abort option is ever offered.
function offerKeepOrAbort(baby, keep, abort) {
  if (state.settings.pg) { keep(); return; }
  const ov = document.createElement("div");
  ov.className = "keep-abort";
  ov.innerHTML = `<div class="ka-box">
      <p class="ka-q">A ${baby.isCrack ? (baby.isGayby ? "CRACK GAYBY" : "CRACK BABY") : baby.isGayby ? "GAYBY" : "baby"} has arrived…</p>
      <img class="ka-face" src="${baby.image}" alt="">
      <p class="ka-name">${escapeHtml(baby.name)}</p>
      <div class="ka-btns">
        <button type="button" class="button primary ka-keep">👶 KEEP</button>
        <button type="button" class="button secondary ka-abort">🚫 ABORT</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector(".ka-keep").addEventListener("click", () => { ov.remove(); keep(); });
  ov.querySelector(".ka-abort").addEventListener("click", () => { ov.remove(); abort(); });
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
// with the mouse (HTML5 drag) AND touch (a manual finger-drag).
let breedTouch = null;
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
  // Touch: drag a finger from one card onto another to breed. A tap (no real drag) still eliminates.
  el.addEventListener("touchstart", (e) => {
    const t = e.touches[0];
    breedTouch = { id, x: t.clientX, y: t.clientY, moved: false };
  }, { passive: true });
  el.addEventListener("touchmove", (e) => {
    if (!breedTouch || breedTouch.id !== id) return;
    const t = e.touches[0];
    if (!breedTouch.moved && (Math.abs(t.clientX - breedTouch.x) > 8 || Math.abs(t.clientY - breedTouch.y) > 8)) breedTouch.moved = true;
    if (breedTouch.moved) {
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
    if (breedTouch && breedTouch.id === id && breedTouch.moved) {
      const t = e.changedTouches[0];
      const under = document.elementFromPoint(t.clientX, t.clientY)?.closest("[data-id]");
      if (under && under.dataset.id !== id) { e.preventDefault(); breedCharacters(id, under.dataset.id); }
    }
    breedTouch = null;
  });
}

// ===================== Custom character editor (persisted to localStorage) =====================
const CUSTOM_KEY = "whoisit_custom_chars_v1";
const EDITOR_ANIM = ["still", "calm", "curious", "serious", "shifty", "alert", "smug", "sleepy", "googly", "sideeye", "crosseyed", "nervous", "nod", "bobble", "dreamy", "lean", "squint"];
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
function upsertCustom(data) {
  const list = loadCustomChars();
  const i = list.findIndex((c) => c.id === data.id);
  if (i >= 0) list[i] = data; else list.push(data);
  saveCustomChars(list);
  mergeCustomIntoPool();
}
function deleteCustom(id) {
  saveCustomChars(loadCustomChars().filter((c) => c.id !== id));
  mergeCustomIntoPool();
}

let editorDialog = null, editorState = null;
function newEditorState() {
  const bases = generatedCharacters.filter((c) => !c.isCustom);
  const base = JSON.parse(JSON.stringify((bases.length ? pick(bases) : generatedCharacters[0]).traits || {}));
  return { id: `custom-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`, name: "New Face", pronouns: "they", traits: base, seed: 96000 + Math.floor(Math.random() * 3000), existing: false };
}
function renderEditorPreview() {
  const img = editorDialog.querySelector("#edPreview");
  if (img) img.src = window.faceGenerator.renderPortrait(editorState.seed, editorState.traits);
}
function renderEditorControls() {
  const T = window.faceGenerator.traitBook, t = editorState.traits;
  const field = (label, html) => `<label class="ed-field"><span>${label}</span>${html}</label>`;
  const group = (title) => `<div class="ed-group">${title}</div>`;
  const sel = (key, opts, val) => `<select data-key="${key}">` + (opts || []).map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("") + "</select>";
  const slide = (key, label, min, max, step, val) => field(label, `<input type="range" data-key="${key}" data-num="1" min="${min}" max="${max}" step="${step}" value="${val}">`);
  const color = (key, label, def) => field(label, `<input type="color" data-key="${key}" value="${t[key] || def}">`);
  const num = (k, d) => (t[k] != null ? t[k] : d);
  editorDialog.querySelector(".editor-controls").innerHTML =
    group("Identity") +
    field("Name", `<input type="text" data-key="__name" value="${escapeHtml(editorState.name)}" maxlength="16">`) +
    field("Pronouns", sel("__pronouns", ["she", "he", "they"], editorState.pronouns)) +
    field("Skin", sel("skin", T.skinTones, t.skin)) +
    field("Expression", sel("expression", T.expressions, t.expression)) +
    field("Animation", sel("animMode", EDITOR_ANIM, t.animMode || "still")) +
    group("Hair") +
    field("Hair style", sel("hair", T.hairStyles, t.hair)) +
    field("Hair colour", sel("hairColor", T.hairColors, t.hairColor)) +
    color("hairOutline", "Hair outline", "#1f2330") +
    slide("frontHairY", "Front hair Y", -24, 24, 1, num("frontHairY", 0)) +
    slide("backHairY", "Back hair Y", -24, 24, 1, num("backHairY", 0)) +
    group("Beard & brows") +
    field("Accessory", sel("accessory", T.accessories, t.accessory || "none")) +
    slide("beardLength", "Beard length", 0, 0.5, 0.01, num("beardLength", 0)) +
    slide("beardScale", "Beard size", 0.6, 1.6, 0.02, num("beardScale", 1)) +
    slide("moustacheScale", "Moustache", 0, 1.6, 0.02, num("moustacheScale", 0)) +
    field("Brow", sel("browShape", T.browShapes, t.browShape || (T.browShapes || [])[0])) +
    slide("browThick", "Brow weight", 0.4, 2, 0.01, num("browThick", 1)) +
    slide("browY", "Brow height", -6, 6, 0.5, num("browY", 0)) +
    group("Face") +
    field("Face shape", sel("faceShape", T.faceShapes, t.faceShape)) +
    field("Nose tip", sel("noseTip", T.noseTips, t.noseTip || "round")) +
    field("Chin", sel("chinShape", T.chinShapes, t.chinShape || "none")) +
    field("Ears", sel("earVariant", T.earVariants, t.earVariant || "round")) +
    slide("headScaleX", "Head width", 0.85, 1.15, 0.01, num("headScaleX", 1)) +
    slide("headScaleY", "Head height", 0.85, 1.15, 0.01, num("headScaleY", 1)) +
    slide("jawLength", "Jaw length", -0.2, 0.5, 0.01, num("jawLength", 0)) +
    slide("noseWidth", "Nose width", 0.7, 1.3, 0.01, num("noseWidth", 1)) +
    slide("noseY", "Nose height", -8, 8, 0.5, num("noseY", 0)) +
    group("Eyes") +
    color("eyeColor", "Eye colour", "#5a3d28") +
    slide("eyeScale", "Eye size", 0.8, 1.25, 0.01, num("eyeScale", 1)) +
    slide("eyeGap", "Eye spacing", 42, 62, 1, num("eyeGap", 47)) +
    slide("lashes", "Lashes", 0, 1.6, 0.05, num("lashes", 0)) +
    group("Mouth & teeth") +
    field("Mouth", sel("mouthStyle", T.mouthStyles, t.mouthStyle)) +
    field("Teeth", sel("teethStyle", T.teethStyles, t.teethStyle || "even")) +
    field("Lips", sel("lips", T.lipStyles, t.lips || "soft")) +
    color("lipColor", "Lip colour", "#a55a52") +
    slide("mouthScale", "Mouth size", 0.85, 1.25, 0.01, num("mouthScale", 1)) +
    slide("mouthY", "Mouth height", -6, 14, 0.5, num("mouthY", 0)) +
    slide("lipLineWidth", "Lip line width", 0.3, 3, 0.05, num("lipLineWidth", 1)) +
    group("Body") +
    field("Clothing", sel("clothing", T.clothing, t.clothing)) +
    color("shirt", "Shirt", "#3a86ff") +
    color("background", "Background", "#a9c4e0") +
    slide("build", "Build", 55, 115, 1, num("build", 82)) +
    slide("bust", "Bust", 0, 0.9, 0.01, num("bust", 0));
}
function renderEditorSaved() {
  const list = loadCustomChars();
  const box = editorDialog.querySelector("#edSavedList");
  box.innerHTML = list.length
    ? list.map((c) => `<button type="button" class="ed-chip" data-edit="${c.id}">${escapeHtml(c.name)}</button>`).join("")
    : `<span class="ed-empty">None yet — build one and hit Save.</span>`;
  box.querySelectorAll("[data-edit]").forEach((b) => b.addEventListener("click", () => {
    const c = loadCustomChars().find((x) => x.id === b.dataset.edit);
    if (c) { editorState = { ...c, traits: JSON.parse(JSON.stringify(c.traits)), existing: true }; renderEditorControls(); renderEditorPreview(); syncEditorButtons(); }
  }));
}
// The live board list: pick a character on the current board to restyle - Save applies + syncs.
function renderEditorBoard() {
  const box = editorDialog.querySelector("#edBoardList");
  if (!box) return;
  const chars = state.board.filter((c) => c.traits);
  box.innerHTML = chars.length
    ? chars.map((c) => `<button type="button" class="ed-chip ${editorState.boardId === c.id ? "is-on" : ""}" data-board="${c.id}">${escapeHtml(displayName(c))}</button>`).join("")
    : `<span class="ed-empty">Deal a game to edit its characters.</span>`;
  box.querySelectorAll("[data-board]").forEach((b) => b.addEventListener("click", () => {
    const c = state.board.find((x) => x.id === b.dataset.board);
    if (!c) return;
    editorState = { id: c.id, name: c.name, pronouns: c.pronouns || "they", traits: JSON.parse(JSON.stringify(c.traits)), seed: c.seed, existing: false, boardId: c.id };
    renderEditorControls(); renderEditorPreview(); renderEditorBoard(); syncEditorButtons();
  }));
}
function syncEditorButtons() {
  const del = editorDialog.querySelector("#edDelete");
  if (del) del.style.display = (editorState.existing && !editorState.boardId) ? "" : "none";
  const save = editorDialog.querySelector("#edSave");
  const add = editorDialog.querySelector("#edAdd");
  const hint = editorDialog.querySelector("#edHint");
  if (editorState.boardId) {
    if (save) save.textContent = "💾 Save to board";
    if (add) add.style.display = "none";
    if (hint) hint.textContent = `Editing ${editorState.name} on the board — Save syncs to both players.`;
  } else {
    if (save) save.textContent = "Save";
    if (add) add.style.display = "";
    if (hint) hint.textContent = "Saved faces get dealt into future games.";
  }
}
// Randomisers. RAND maps each editable trait to a value generator (categorical from the traitBook,
// numeric within the slider range, colours as hex).
function editorRand() {
  const T = window.faceGenerator.traitBook;
  const pickA = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const hex = () => "#" + Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, "0");
  const num = (lo, hi, dp) => +(lo + Math.random() * (hi - lo)).toFixed(dp);
  return {
    __pronouns: () => pickA(["she", "he", "they"]),
    skin: () => pickA(T.skinTones), hair: () => pickA(T.hairStyles), hairColor: () => pickA(T.hairColors),
    expression: () => pickA(T.expressions), faceShape: () => pickA(T.faceShapes),
    noseTip: () => pickA(T.noseTips || ["round"]), browShape: () => pickA(T.browShapes),
    clothing: () => pickA(T.clothing), accessory: () => pickA(T.accessories), animMode: () => pickA(EDITOR_ANIM),
    eyeColor: hex, shirt: hex,
    eyeScale: () => num(0.8, 1.2, 2), browThick: () => num(0.7, 1.4, 2), noseWidth: () => num(0.7, 1.3, 2),
    mouthScale: () => num(0.85, 1.2, 2), build: () => Math.floor(num(60, 110, 0))
  };
}
function setEditorTrait(key, val) {
  if (key === "__pronouns") editorState.pronouns = val;
  else editorState.traits[key] = val;
}
function randomizeAll() {
  const R = editorRand();
  Object.keys(R).forEach((k) => setEditorTrait(k, R[k]()));
  renderEditorControls(); renderEditorPreview();
}
function randomizeCurrent() {
  const R = editorRand();
  const keys = Object.keys(R);
  const key = (editorState.lastKey && R[editorState.lastKey]) ? editorState.lastKey : keys[Math.floor(Math.random() * keys.length)];
  setEditorTrait(key, R[key]());
  renderEditorControls(); renderEditorPreview();
  // Re-focus the field we just rolled so "This setting" keeps targeting it.
  const el = editorDialog.querySelector(`[data-key="${key}"]`);
  if (el) { el.focus(); editorState.lastKey = key; }
}
// Apply the current edit to the live board character and broadcast it to the other seat.
function applyBoardEdit() {
  const c = state.board.find((x) => x.id === editorState.boardId);
  if (!c) return;
  c.traits = JSON.parse(JSON.stringify(editorState.traits));
  c.name = editorState.name; c.pronouns = editorState.pronouns;
  try { c.image = window.faceGenerator.renderPortrait(c.seed, c.traits); } catch (e) { /* keep old */ }
  if (state.global.mystery) { const eff = mysteryEffects.find((x) => x.id === state.global.mystery.id); if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (err) { /* no per-char data */ } } }
  renderBoard(); renderSecret();
  netSend("editchar", { id: c.id, traits: c.traits, name: c.name, pronouns: c.pronouns, seed: c.seed });
  flashToast(`🎨 ${c.name} restyled${state.gameMode === "online" ? " — synced" : ""}.`);
  sfx("sparkle");
}
function buildEditorDialog() {
  const d = document.createElement("dialog");
  d.className = "editor-dialog";
  d.innerHTML = `
    <div class="editor-inner">
      <div class="dialog-head">
        <div><p class="eyebrow">Character studio</p><h2>Make &amp; save a character</h2></div>
        <button class="icon-button" id="edClose" type="button" aria-label="Close">X</button>
      </div>
      <div class="editor-body">
        <div class="editor-preview">
          <img id="edPreview" alt="preview">
          <small id="edHint">Saved faces get dealt into future games.</small>
          <div class="ed-rand">
            <button type="button" id="edRandAll" class="button ghost">🎲 Randomise all</button>
            <button type="button" id="edRandOne" class="button ghost">🎲 This setting</button>
          </div>
        </div>
        <div class="editor-controls"></div>
      </div>
      <div class="editor-saved"><p class="label">On the board <span class="ed-sub">— edit & sync live to both players</span></p><div id="edBoardList" class="ed-saved-list"></div></div>
      <div class="editor-saved"><p class="label">Saved characters</p><div id="edSavedList" class="ed-saved-list"></div></div>
      <div class="dialog-actions">
        <button type="button" id="edDelete" class="button ghost">Delete</button>
        <button type="button" id="edNew" class="button ghost">New</button>
        <button type="button" id="edAdd" class="button secondary">Add to board</button>
        <button type="button" id="edSave" class="button primary">Save</button>
      </div>
    </div>`;
  document.body.appendChild(d);
  d.querySelector(".editor-controls").addEventListener("input", (e) => {
    const el = e.target, key = el.dataset.key;
    if (!key) return;
    if (key === "__name") editorState.name = el.value || "Face";
    else if (key === "__pronouns") editorState.pronouns = el.value;
    else editorState.traits[key] = el.dataset.num ? Number(el.value) : el.value;
    renderEditorPreview();
  });
  // Remember the last field the user touched so "🎲 This setting" knows which one to roll.
  d.querySelector(".editor-controls").addEventListener("focusin", (e) => { if (e.target.dataset && e.target.dataset.key && e.target.dataset.key !== "__name") editorState.lastKey = e.target.dataset.key; });
  d.querySelector("#edRandAll").addEventListener("click", randomizeAll);
  d.querySelector("#edRandOne").addEventListener("click", randomizeCurrent);
  const persist = () => {
    const data = { id: editorState.id, name: editorState.name, pronouns: editorState.pronouns, traits: editorState.traits, seed: editorState.seed };
    upsertCustom(data);
    editorState.existing = true;
    renderEditorSaved(); syncEditorButtons();
    return data;
  };
  d.querySelector("#edSave").addEventListener("click", () => { if (editorState.boardId) applyBoardEdit(); else persist(); });
  d.querySelector("#edAdd").addEventListener("click", () => {
    const data = persist();
    const ch = buildCustomCharacter(data);
    const bi = state.board.findIndex((c) => c.id === data.id);
    if (bi >= 0) state.board[bi] = ch; else state.board.push(ch);
    if (state.global.mystery) { const eff = mysteryEffects.find((x) => x.id === state.global.mystery.id); if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (err) { /* no per-char data */ } } }
    state.justBorn = data.id; renderBoard(); state.justBorn = null;
  });
  d.querySelector("#edNew").addEventListener("click", () => { editorState = newEditorState(); renderEditorControls(); renderEditorPreview(); renderEditorBoard(); syncEditorButtons(); });
  d.querySelector("#edDelete").addEventListener("click", () => { if (editorState.existing) deleteCustom(editorState.id); editorState = newEditorState(); renderEditorControls(); renderEditorPreview(); renderEditorSaved(); syncEditorButtons(); });
  d.querySelector("#edClose").addEventListener("click", () => d.close());
  return d;
}
function openCharacterEditor() {
  if (!window.faceGenerator) return;
  if (!editorDialog) editorDialog = buildEditorDialog();
  editorState = newEditorState();
  renderEditorControls(); renderEditorPreview(); renderEditorSaved(); renderEditorBoard(); syncEditorButtons();
  editorDialog.showModal();
}
function sortedBoard() {
  const key = state.sortKey;
  // Judgement Day lays the board out spatially: heaven at the top, purgatory in the middle, hell at
  // the bottom (unless the player has picked an explicit sort).
  if (!key && state.global.mystery?.id === "judgement") {
    const rank = { HEAVEN: 0, PURGATORY: 1, HELL: 2 };
    const vOf = (c) => rank[state.global.mystery.assignments?.[c.id]?.verdict] ?? 1;
    return [...state.board].sort((a, b) => vOf(a) - vOf(b) || a.name.localeCompare(b.name));
  }
  if (!key) return state.board;
  const arr = [...state.board];
  if (key === "name") return arr.sort((a, b) => a.name.localeCompare(b.name));
  if (key === "skin") return arr.sort((a, b) => skinLuminance(a) - skinLuminance(b) || a.name.localeCompare(b.name));
  return arr.sort((a, b) => (characterStat(b, key) - characterStat(a, key)) || a.name.localeCompare(b.name));
}

// ===================== Opponent view (simulated online play) =====================
// Stand-in for the multiplayer backend: a pseudo-AI in the OTHER seat crosses characters off over
// time, and the human seat sees each elimination pop in as a card - exactly what the real online
// feature will show. Both seats also share the same round mode (the Wheel of Fate result).
let opponentTimer = null;
function stopOpponentSim() { if (opponentTimer) { clearInterval(opponentTimer); opponentTimer = null; } }
function startOpponentSim() {
  stopOpponentSim();
  state.opponentLog = [];
  renderOpponentPanel();
  opponentTimer = setInterval(() => {
    const ai = state.players[1];
    if (!ai || !state.board.length) { stopOpponentSim(); return; }
    const cands = state.board.filter((c) => !ai.eliminated.has(c.id) && c.id !== ai.secretId);
    if (cands.length <= 1) { stopOpponentSim(); return; }
    const victim = cands[Math.floor(Math.random() * cands.length)];
    ai.eliminated.add(victim.id);
    (state.opponentLog = state.opponentLog || []).unshift({ seat: 1, id: victim.id, t: Date.now() });
    renderOpponentPanel();
    if (state.currentPlayer === 1) renderBoard();
  }, 2800);
}

function renderOpponentPanel() {
  const el = els.opponentPanel;
  if (!el) return;
  const otherIdx = state.currentPlayer === 0 ? 1 : 0;
  const log = (state.opponentLog || []).filter((e) => e.seat === otherIdx);
  const mode = state.global.mystery;
  const seatLabel = `Seat ${String.fromCharCode(65 + otherIdx)}`;
  const cards = log.slice(0, 8).map((e, i) => {
    const c = characterById(e.id);
    if (!c) return "";
    return `<div class="opp-card${i === 0 ? " is-new" : ""}"><img src="${c.image}" alt=""><span>${escapeHtml(c.name)}</span></div>`;
  }).join("");
  el.innerHTML = `
    <p class="label">${escapeHtml(seatLabel)} crossing off <span class="opp-live">● live</span></p>
    ${mode ? `<p class="opp-mode">Shared effect: <b>${escapeHtml(mode.name || "—")}</b></p>` : ""}
    <div class="opp-cards">${cards || '<span class="opp-empty">waiting for their first move…</span>'}</div>`;
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
  const isGayFrogged = state.global.mystery?.id === "gay-frogged";
  const isYugioh = state.global.mystery?.id === "yugioh";
  const ygo = isYugioh ? yugiohLocationFlavor(state.location) : null;
  const locName = ygo ? `${state.location.name} ${ygo.suffix}` : state.location.name;
  const locDesc = ygo ? ygo.text : (isGayFrogged && state.location.gayPrompt ? state.location.gayPrompt : state.location.prompt);
  els.locationBand.className = `location-band is-${variant}${isGayFrogged ? " is-gay-frogged" : ""}${isYugioh ? " is-yugioh" : ""}`;
  els.locationBand.innerHTML = `
    <div class="location-photo" style="background-image:url('${encodeURI(artSrc)}')" role="img" aria-label="${escapeHtml(state.location.name)}, ${variant}"></div>
    <div class="location-scrim"></div>
    ${isGayFrogged ? '<div class="location-rainbow" aria-hidden="true"></div>' : ""}
    <div class="location-overlay">
      <div class="location-copy">
        <p class="eyebrow">${isYugioh ? "Field Spell · Activated" : `Location · ${variant === "night" ? "Night" : "Day"}`}</p>
        <h2>${isGayFrogged ? '<span class="gay-frogged-label">GAY</span> ' : ""}${escapeHtml(locName)}</h2>
        <p>${escapeHtml(locDesc)}</p>
      </div>
      <div class="location-stamp">${escapeHtml(isYugioh ? "FIELD" : state.location.stamp)}</div>
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
    // ONLINE: no seat toggle (you only ever control your own seat). Instead, a big shareable room
    // number so a friend can JOIN it, plus a live connection status.
    els.seatRoster.className = "seat-roster online-room";
    els.seatRoster.innerHTML = `
      <p class="or-label">Your room</p>
      <div class="or-code">#${escapeHtml(state.roomCode)} <button type="button" class="or-copy" title="Copy room number">📋</button></div>
      <p class="or-status">${state.onlinePeer ? "🟢 friend connected" : "⏳ waiting for a friend to join…"}</p>`;
    const copyBtn = els.seatRoster.querySelector(".or-copy");
    if (copyBtn) copyBtn.addEventListener("click", () => {
      if (navigator.clipboard) navigator.clipboard.writeText(state.roomCode).catch(() => {});
      copyBtn.textContent = "✓"; setTimeout(() => { copyBtn.textContent = "📋"; }, 900);
    });
    return;
  }
  // LOCAL: one joined segmented toggle, the active seat lit. Tap a half (or the ⇄ badge) to hand off.
  els.seatRoster.className = "seat-roster seat-pill";
  els.seatRoster.innerHTML = state.players.map((player, i) => {
    const label = player.pname || (i === 0 ? "A" : "B");
    return `<button type="button" class="seat-half ${i === state.currentPlayer ? "active" : ""}" data-seat="${i}">
        <span class="seat-glyph">${i === state.currentPlayer ? "YOU" : escapeHtml(label)}</span>
      </button>`;
  }).join("") + `<button type="button" class="seat-swap" data-seat="${(state.currentPlayer + 1) % state.players.length}" aria-label="Swap turn">⇄</button>`;
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
  const gayFroggedAssignment = state.global.mystery?.id === "gay-frogged" ? state.global.mystery.assignments?.[secret.id] : null;
  els.secretCard.className = `secret-card character-card ${secret.variant || ""} ${m.cardClass || ""}`.trim();
  const bg = secret.traits?.background || "#cdd6e0";
  els.secretCard.setAttribute("style", `--secret-bg:${bg};${m.style || ""}`);
  const portraitSrc = m.image || gayFroggedAssignment?.image || secret.image;
  els.secretCard.innerHTML = `
    <div class="portrait-wrap">
      <img src="${portraitSrc}" alt="${escapeHtml(secret.name)}">
      ${m.cornerHtml || ""}
    </div>
    <div class="card-plate">
      <h3>${displayName(secret)}</h3>
      ${state.global.mystery?.id === "gay-frogged" ? `<p class="card-pronouns">${escapeHtml(m.pronoun || "they/them")}</p>` : ""}
      ${state.global.mystery?.id === "role-reveal" ? `<p class="card-role">${escapeHtml(roleFor(secret.id))}</p>` : ""}
      <div class="card-meta">${m.html || ""}</div>
    </div>
  `;
  // Habbo mode: pixelate the player's own portrait too so it matches the room.
  if (state.global.mystery?.id === "habbo") {
    const simg = els.secretCard.querySelector(".portrait-wrap > img");
    if (simg && simg.src) { simg.style.imageRendering = "pixelated"; pixelateSrc(simg.src, 40, (url) => { simg.src = url; }); }
  }
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
  stopHeadsAnim();                 // kill any running floating-heads loop before we rebuild
  habboizeBanner(state.global.mystery?.id === "habbo");   // chunky pixel banner in Habbo mode only
  const dvb = document.getElementById("deVoidBtn"); if (dvb) dvb.style.display = "none";  // re-shown only by the Habbo board
  els.characterBoard.innerHTML = "";
  els.characterBoard.className = "character-board";
  els.characterBoard.setAttribute("aria-label", "Character board");
  if (state.global.mystery?.id === "family-tree-disaster") {
    renderFamilyBoard(player);
    return;
  }
  if (state.global.mystery?.id === "heads-only") {
    renderHeadsOnlyBoard(player);
    return;
  }
  if (state.global.mystery?.id === "habbo") {
    renderHabboBoard(player);
    return;
  }
  if (state.global.mystery?.id === "knockoff-manor") {
    renderKnockoffManorBoard(player);
    return;
  }
  const modeId = state.global.mystery?.id;
  els.characterBoard.classList.toggle("ygo-board", modeId === "yugioh");
  els.characterBoard.classList.toggle("orgy-board", modeId === "orgy");
  els.characterBoard.classList.toggle("pixall-board", modeId === "pixall");
  els.characterBoard.classList.toggle("disease-board", modeId === "disease");
  els.characterBoard.classList.toggle("drugs-board", modeId === "drugs");
  els.characterBoard.classList.toggle("fertility-board", modeId === "fertility");
  els.characterBoard.classList.toggle("work-board", modeId === "work");
  els.characterBoard.classList.toggle("woke-board", modeId === "woke");
  els.characterBoard.classList.toggle("swipe-board", modeId === "swipe");
  els.characterBoard.classList.toggle("judgement-board", modeId === "judgement");
  els.characterBoard.classList.toggle("sims-board", modeId === "sims");
  els.characterBoard.classList.toggle("astrology-board", modeId === "astrology");
  els.characterBoard.classList.toggle("pantone-board", modeId === "pantone");
  els.characterBoard.classList.toggle("hp-board", modeId === "horny-potter");
  document.body.classList.toggle("mode-yugioh", modeId === "yugioh");
  document.body.classList.toggle("mode-pixall", modeId === "pixall");
  sortedBoard().forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
  if (modeId === "judgement") renderJudgementPurgatory();   // aborted souls lingering in limbo
  if (modeId === "pixall") startPixallLoop(); else stopPixallLoop();
  if (modeId === "sims") startSimsLoop(); else stopSimsLoop();
  stopPropLoop();   // no more random swaps - WHAT'S IN THE HAND? is drag-to-battle only
}
// A ghost strip below the Judgement board: every soul you aborted this session, stuck in limbo.
function renderJudgementPurgatory() {
  const souls = state.global.mystery?.purgatory || [];
  if (!souls.length) return;
  const strip = document.createElement("div");
  strip.className = "jd-purgatory-strip";
  strip.innerHTML = `<div class="jd-purg-label">🕯️ PURGATORY · ${souls.length} aborted soul${souls.length > 1 ? "s" : ""} in limbo</div>`
    + `<div class="jd-purg-souls">`
    + souls.map((g) => `<figure class="jd-ghost"><img src="${g.image}" alt=""><figcaption>${escapeHtml(g.name)}<span>#${g.queuePos.toLocaleString()} in queue</span></figcaption></figure>`).join("")
    + `</div>`;
  els.characterBoard.appendChild(strip);
}

// ===================== Prop Panic: the periodic PROP SWAP =====================
// Every few seconds the props go berserk and two random characters trade props - so the answers to
// "who is holding the X" keep shifting mid-round. That's the panic.
let propPanicTimer = null;
function stopPropLoop() { if (propPanicTimer) { clearInterval(propPanicTimer); propPanicTimer = null; } }
function startPropLoop() {
  if (propPanicTimer) return;
  propPanicTimer = setInterval(() => {
    if (state.global.mystery?.id !== "prop-panic") { stopPropLoop(); return; }
    const asg = state.global.mystery.assignments;
    const ids = state.board.map((c) => c.id).filter((id) => asg[id]);
    if (ids.length < 2) return;
    const a = ids[Math.floor(Math.random() * ids.length)];
    let b = a;
    while (b === a) b = ids[Math.floor(Math.random() * ids.length)];
    // Everyone's prop goes berserk, a PROP SWAP!! flash hits, then the two props trade owners.
    els.characterBoard.classList.add("prop-berserk");
    const flash = document.createElement("div");
    flash.className = "prop-swap-flash";
    flash.textContent = "PROP SWAP!!";
    document.body.appendChild(flash);
    setTimeout(() => {
      [asg[a], asg[b]] = [asg[b], asg[a]];
      flash.remove();
      renderBoard();
    }, 700);
  }, 6000);
}

// ===================== Heads Only mode =====================
// Formations: each maps (index i, count n, time-seconds t, width w, height h) -> a target {x,y} in px.
const HEADS_FORMATIONS = [
  // Ring, slowly rotating.
  (i, n, t, w, h) => { const R = Math.min(w, h) * 0.38; const a = (i / n) * Math.PI * 2 + t * 0.22; return { x: w / 2 + Math.cos(a) * R, y: h / 2 + Math.sin(a) * R }; },
  // Figure-8 / infinity (lemniscate), drifting along the curve.
  (i, n, t, w, h) => { const S = Math.min(w, h) * 0.44; const th = (i / n) * Math.PI * 2 + t * 0.35; const d = 1 + Math.sin(th) * Math.sin(th); return { x: w / 2 + (S * 1.35 * Math.cos(th)) / d, y: h / 2 + (S * Math.sin(th) * Math.cos(th)) / d }; },
  // Tidy grid.
  (i, n, t, w, h) => { const cols = Math.ceil(Math.sqrt(n * (w / h))); const c = i % cols, r = Math.floor(i / cols); const rows = Math.ceil(n / cols); return { x: w * (0.1 + ((c + 0.5) / cols) * 0.8), y: h * (0.12 + ((r + 0.5) / Math.max(rows, 1)) * 0.76) }; },
  // Phyllotaxis spiral.
  (i, n, t, w, h) => { const R = Math.min(w, h) * 0.46; const a = i * 2.399963 + t * 0.28; const rad = R * Math.sqrt((i + 1) / n); return { x: w / 2 + Math.cos(a) * rad, y: h / 2 + Math.sin(a) * rad }; },
  // Heart.
  (i, n, t, w, h) => { const th = (i / n) * Math.PI * 2; const s = Math.min(w, h) * 0.03; const hx = 16 * Math.pow(Math.sin(th), 3); const hy = 13 * Math.cos(th) - 5 * Math.cos(2 * th) - 2 * Math.cos(3 * th) - Math.cos(4 * th); return { x: w / 2 + hx * s, y: h / 2 - hy * s }; },
  // Rolling sine wave.
  (i, n, t, w, h) => { const px = (i + 0.5) / n; return { x: w * (0.08 + px * 0.84), y: h / 2 + Math.sin(px * Math.PI * 4 + t * 1.1) * h * 0.26 }; }
];
let headsAnimRaf = null;
let headsPos = new Map();      // char id -> {x,y}, kept across re-renders so clicks don't jolt
let headsStartTs = null;       // persisted so the formation cycle keeps its phase across re-renders
function stopHeadsAnim() { if (headsAnimRaf) { cancelAnimationFrame(headsAnimRaf); headsAnimRaf = null; } }
function resetHeadsAnim() { stopHeadsAnim(); headsPos = new Map(); headsStartTs = null; }

const HEADS_FORM_NAMES = ["Ring ◯", "Figure-8 ∞", "Grid ▦", "Spiral ✺", "Heart ♥", "Wave 〜"];
// Safari perf: SVG data-URL images get re-rasterised by WebKit while they move, and a live CSS
// drop-shadow filter on ~24 animated elements repaints every frame. So each head is rasterised ONCE
// to a flat PNG with the shadow baked in - Safari then just composites bitmaps.
const headRasterCache = new Map();
function rasterizeHead(src, done) {
  if (headRasterCache.has(src)) { done(headRasterCache.get(src)); return; }
  const im = new Image();
  im.onload = () => {
    const S = 160;
    const c = document.createElement("canvas");
    c.width = S; c.height = S;
    const x = c.getContext("2d");
    x.shadowColor = "rgba(0, 0, 0, 0.6)";
    x.shadowBlur = 6;
    x.shadowOffsetY = 3;
    x.drawImage(im, 0, 0, S, S);
    const url = c.toDataURL();
    headRasterCache.set(src, url);
    done(url);
  };
  im.onerror = () => done(src);
  im.src = src;
}
function renderHeadsOnlyBoard(player) {
  els.characterBoard.classList.add("heads-board");
  els.characterBoard.setAttribute("aria-label", "Floating heads");
  if (state.headsForm == null) state.headsForm = 0;
  // A little formation picker sits inside the board - pick the shape rather than auto-cycling.
  const bar = document.createElement("div");
  bar.className = "heads-toolbar";
  bar.innerHTML = HEADS_FORM_NAMES.map((nm, i) => `<button type="button" class="heads-form-btn ${i === state.headsForm ? "on" : ""}" data-form="${i}">${nm}</button>`).join("");
  bar.querySelectorAll("[data-form]").forEach((b) => b.addEventListener("click", () => {
    state.headsForm = Number(b.dataset.form);
    bar.querySelectorAll(".heads-form-btn").forEach((x) => x.classList.toggle("on", x === b));
  }));
  els.characterBoard.appendChild(bar);
  const layer = document.createElement("div");
  layer.className = "heads-layer";
  els.characterBoard.appendChild(layer);
  const list = sortedBoard();
  const n = list.length;
  const heads = list.map((ch) => {
    const m = getMysteryCardData(ch);
    const el = document.createElement("button");
    el.type = "button";
    el.className = `float-head ${player.eliminated.has(ch.id) ? "is-down" : ""}`.trim();
    el.dataset.id = ch.id;
    el.style.setProperty("--bob", `${(stableHash(ch.id) % 1000) / 1000 * 3}s`);
    el.innerHTML = `<img src="${m.image || ch.image}" alt=""><span class="float-name">${escapeHtml(displayName(ch))}</span>`;
    el.addEventListener("click", () => toggleEliminated(ch.id));
    wireBreedDnD(el, ch.id);
    layer.appendChild(el);
    // Swap the SVG for a flat pre-shadowed PNG once it's rasterised (Safari perf - see rasterizeHead).
    rasterizeHead(m.image || ch.image, (url) => { const img = el.querySelector("img"); if (img) img.src = url; });
    const seed = headsPos.get(ch.id);
    return { el, id: ch.id, x: seed ? seed.x : null, y: seed ? seed.y : null };
  });
  const PAD = 58;   // keep whole heads + names inside the board
  // Board size is read ONCE and refreshed on resize - a getBoundingClientRect() inside the rAF loop
  // forces a synchronous layout every frame, which Safari pays for far more dearly than Chrome.
  let w = layer.clientWidth || 640, h = layer.clientHeight || 520;
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(() => { w = layer.clientWidth || 640; h = layer.clientHeight || 520; }).observe(layer);
  }
  const step = (ts) => {
    if (headsStartTs == null) headsStartTs = ts;
    const t = (ts - headsStartTs) / 1000;
    const form = HEADS_FORMATIONS[state.headsForm || 0];
    heads.forEach((hd, i) => {
      const tgt = form(i, n, t, w, h);
      const tx = Math.max(PAD, Math.min(w - PAD, tgt.x));   // clamp inside the board
      const ty = Math.max(PAD, Math.min(h - PAD, tgt.y));
      if (hd.x == null) { hd.x = tx; hd.y = ty; }
      hd.x += (tx - hd.x) * 0.06;   // ease toward the formation so morphs glide
      hd.y += (ty - hd.y) * 0.06;
      hd.el.style.transform = `translate(${hd.x.toFixed(1)}px, ${hd.y.toFixed(1)}px) translate(-50%, -50%)`;
      headsPos.set(hd.id, { x: hd.x, y: hd.y });
    });
    headsAnimRaf = requestAnimationFrame(step);
  };
  headsAnimRaf = requestAnimationFrame(step);
}

// ===================== Habbo Hotel mode =====================
const HABBO_GW = 7, HABBO_GH = 7, HABBO_TW = 84, HABBO_TH = 42;
let habboPos = new Map();     // char id -> {col,row}, persisted so walking survives re-renders
let habboSelected = null;
let habboCtx = null;
let habboWanderTimer = null;  // idle NPCs strolling around, like a populated Habbo room
function resetHabbo() {
  habboPos = new Map(); habboSelected = null; habboCtx = null;
  clearInterval(habboWanderTimer); habboWanderTimer = null;
  document.getElementById("habboCam")?.remove();
  document.getElementById("habboChat")?.remove();
  // The void UI is Habbo-only too: an open DE-VOID panel left over a NEW round would fire stale
  // toggleEliminated(oldId) handlers. Both are recreated by the next Habbo render.
  document.getElementById("voidPanel")?.remove();
  document.getElementById("deVoidBtn")?.remove();
}

// ===================== Sims bladder cycle =====================
// The BLADDER need drains over time; when it bottoms out the Sim pisses (a stream off the bottom of
// the card, eyes-shut shake), then it fills back up.
let simBladderTimer = null;
let simBladder = new Map();
function stopSimsLoop() { if (simBladderTimer) { clearInterval(simBladderTimer); simBladderTimer = null; } }
function resetSimsLoop() { stopSimsLoop(); simBladder = new Map(); }
function simsTick() {
  if (state.global.mystery?.id !== "sims") { stopSimsLoop(); return; }
  const asg = state.global.mystery.assignments || {};
  state.board.forEach((ch) => {
    const a = asg[ch.id];
    if (!a || !a.needs) return;
    const card = document.getElementById(`card-${ch.id}`);
    if (!card || card.classList.contains("sim-pissing")) return;
    if (!simBladder.has(ch.id)) simBladder.set(ch.id, a.needs.bladder);
    const s = card.querySelector('.sim-bar[data-need="bladder"] s');
    let v = simBladder.get(ch.id) - (0.8 + Math.random() * 1.5);   // gentle, slow drain
    if (v <= 0) {
      simBladder.set(ch.id, 94 + Math.random() * 6);           // relief - refill
      if (s) { s.style.width = "100%"; s.className = "sim-ok"; }
      // Some Sims shudder; others gently sway/bob side to side (a relieved little jiggle).
      const relief = stableHash(ch.id + ":relief") % 2 ? "relief-sway" : "relief-shake";
      card.classList.add("sim-pissing", relief);
      const piss = document.createElement("span");
      piss.className = "sim-piss";
      // Organic dribble: individual droplets with their own offsets/timing fall off the bottom of the
      // tile onto the tile underneath, where a puddle collects.
      piss.innerHTML = Array.from({ length: 4 }, (_, i) => {
        const dx = -6 + Math.floor(Math.random() * 13);
        const dl = (i * 0.32 + Math.random() * 0.2).toFixed(2);
        const du = (0.55 + Math.random() * 0.3).toFixed(2);
        return `<i class="sim-drop" style="--dx:${dx}px;--dl:${dl}s;--du:${du}s"></i>`;
      }).join("") + `<i class="sim-puddle"></i>`;
      card.appendChild(piss);
      setTimeout(() => { card.classList.remove("sim-pissing", relief); piss.remove(); }, 2200);
    } else {
      simBladder.set(ch.id, v);
      if (s) { s.style.width = `${v}%`; s.className = v < 25 ? "sim-crit" : v < 55 ? "sim-warn" : "sim-ok"; }
    }
  });
}
function startSimsLoop() { if (!simBladderTimer) simBladderTimer = setInterval(simsTick, 480); }

function habboIso(col, row) {
  const originX = HABBO_GH * HABBO_TW / 2 + 24;
  const originY = 150;   // sits the room lower in the tall board area
  return { x: originX + (col - row) * HABBO_TW / 2, y: originY + (col + row) * HABBO_TH / 2 };
}
// A "camera" that zooms the room onto a chosen avatar and follows them (like Habbo). Pass null to
// pull back out to the whole room.
function habboCamera(id) {
  const room = habboCtx?.room;
  if (!room) return;
  if (!id || !habboPos.has(id)) { room.style.transform = ""; return; }
  const p = habboIso(habboPos.get(id).col, habboPos.get(id).row);
  const rect = els.characterBoard.getBoundingClientRect();
  const scale = 2.0;
  const cx = p.x, cy = p.y - 44;                 // aim at the head, not the feet
  room.style.transform = `translate(${(rect.width / 2 - cx * scale).toFixed(0)}px, ${(rect.height / 2 - cy * scale).toFixed(0)}px) scale(${scale})`;
}
function selectHabbo(id) {
  // Click the already-selected avatar again to zoom back out.
  if (habboSelected === id) {
    habboSelected = null;
    habboCtx?.figEls.forEach((el) => el.classList.remove("selected"));
    habboCamera(null);
    renderHabboSelectionUI();
    return;
  }
  habboSelected = id;
  if (habboCtx) habboCtx.figEls.forEach((el, cid) => el.classList.toggle("selected", cid === id));
  habboCamera(id);
  renderHabboSelectionUI(true);   // a fresh pick is the one moment the chat input grabs focus
}
// The ROOM CAM (a close-up feed of whoever is selected, crunched far softer than the room heads so
// you can actually tell who it is) + the chat bar that lets you talk AS them. Both live OUTSIDE the
// zooming room so they stay put while the camera flies around. Chat needs a real keyboard - phones
// don't get the bar (the room is cramped enough on a phone without an on-screen keyboard on top).
const HABBO_HAS_KEYBOARD = !!(window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches);
function renderHabboSelectionUI(focusChat = false) {
  const wrap = document.querySelector(".board-wrap");
  // Re-renders rebuild the bar (room DOM is fully rebuilt anyway) - carry the typed draft and focus
  // across so a mid-sentence net-sync render doesn't eat the message or yank the caret.
  const oldBar = document.getElementById("habboChat");
  const oldInput = oldBar?.querySelector("input");
  const draft = oldBar?.dataset.forId === habboSelected ? (oldInput?.value || "") : "";
  const hadFocus = !!oldInput && document.activeElement === oldInput;
  document.getElementById("habboCam")?.remove();
  document.getElementById("habboChat")?.remove();
  if (!wrap || !habboSelected || state.global.mystery?.id !== "habbo") return;
  const ch = characterById(habboSelected);
  if (!ch) return;
  const a = state.global.mystery.assignments[ch.id] || {};
  const cam = document.createElement("div");
  cam.id = "habboCam"; cam.className = "hb-cam";
  cam.innerHTML = `<p class="hb-cam-top"><span class="hb-rec">● REC</span><span>ROOM CAM</span></p>`
    + `<div class="hb-cam-screen"><img src="${a.head || ch.image}" alt=""></div>`
    + `<p class="hb-cam-name">${displayName(ch)}</p>`
    + `<button type="button" class="hb-cam-void">🕳 INTO THE VOID</button>`;
  wrap.appendChild(cam);
  // Gentler crunch (84px vs the room's 30) - recognisable, still pixel-art.
  if (a.head) pixelateSrc(a.head, 84, (url) => { const img = cam.querySelector(".hb-cam-screen img"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
  cam.querySelector(".hb-cam-void").addEventListener("click", () => voidHabbo(ch.id));
  if (HABBO_HAS_KEYBOARD) {
    const bar = document.createElement("div");
    bar.id = "habboChat"; bar.className = "hb-chatbar";
    bar.dataset.forId = ch.id;
    bar.innerHTML = `<img src="${a.head || ch.image}" alt="">`
      + `<input type="text" maxlength="90" placeholder="Chat as ${displayName(ch)}…" aria-label="Chat as ${displayName(ch)}">`
      + `<button type="button">SAY</button>`;
    wrap.appendChild(bar);
    if (a.head) pixelateSrc(a.head, 30, (url) => { const img = bar.querySelector("img"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
    const input = bar.querySelector("input");
    if (draft) input.value = draft;
    const say = () => { const t = input.value.trim(); if (t) { habboSay(ch.id, t); input.value = ""; } input.focus(); };
    bar.querySelector("button").addEventListener("click", say);
    input.addEventListener("keydown", (e) => { if (e.key === "Enter") say(); if (e.key === "Escape") selectHabbo(habboSelected); });
    if (focusChat || hadFocus) setTimeout(() => { if (input.isConnected) input.focus({ preventScroll: true }); }, 60);
  }
}
// Habbo chat: the new bubble lands at the head; older ones float upward and expire.
function habboSay(id, text) {
  const el = habboCtx?.figEls.get(id);
  if (!el) return;
  el.querySelectorAll(".hb-bubble").forEach((b) => {
    const lift = (Number(b.dataset.lift) || 0) + 1;
    if (lift > 2) { b.remove(); return; }
    b.dataset.lift = String(lift);
    b.style.setProperty("--lift", lift);
  });
  const bub = document.createElement("span");
  bub.className = "hb-bubble";
  bub.innerHTML = `<b>${escapeHtml(characterById(id)?.name || "???")}:</b> ${escapeHtml(text)}`;
  el.appendChild(bub);
  setTimeout(() => { bub.classList.add("hb-bubble-out"); setTimeout(() => bub.remove(), 350); }, 12000);
}
// Dropping someone into the void: spin-shrink-fall on the spot, then the re-render removes them from
// the room (the DE-VOID panel can pull them back). Lives on the ROOM CAM now - no ✕ over the room.
function voidHabbo(id) {
  const el = habboCtx?.figEls.get(id);
  const pos = habboPos.get(id);
  if (!el || !pos || el.classList.contains("hb-voiding")) return;
  if (habboSelected === id) selectHabbo(id);      // deselect: zooms out + clears the cam/chat
  el._walk = (el._walk || 0) + 1;                 // cancel any in-flight walk (its steps would clobber the fall)
  el.classList.remove("walking");
  // Fall from wherever they visibly are (mid-walk they're not on their habboPos tile yet).
  const m = /translate\((-?[\d.]+)px,\s*(-?[\d.]+)px\)/.exec(el.style.transform || "");
  const here = m ? { x: Number(m[1]), y: Number(m[2]) } : habboIso(pos.col, pos.row);
  el.classList.add("hb-voiding");
  el.style.transition = "transform 0.55s cubic-bezier(0.5, 0, 0.9, 0.5), opacity 0.55s ease-in";
  el.style.transform = `translate(${here.x.toFixed(0)}px, ${(here.y + 60).toFixed(0)}px) rotate(420deg) scale(0.03)`;
  el.style.opacity = "0";
  // Guard the delayed toggle against a round change landing inside the window (online: a peer's
  // "start" can deal a new round mid-fall - a stale toggle would corrupt + net-sync it).
  const salt = state.gameSalt;
  setTimeout(() => { if (state.gameSalt === salt && state.global.mystery?.id === "habbo") toggleEliminated(id); }, 560);
}
// An L-shaped path along the grid (columns first, then rows). Each hop is to an ADJACENT tile, which
// on screen is a pure isometric diagonal - so the avatar walks the grid like a real Habbo, turning at
// the corner, instead of sliding straight across the room.
function habboPath(c0, r0, c1, r1) {
  const path = []; let c = c0, r = r0;
  while (c !== c1) { c += Math.sign(c1 - c); path.push({ col: c, row: r }); }
  while (r !== r1) { r += Math.sign(r1 - r); path.push({ col: c, row: r }); }
  return path;
}
function habboWalk(id, col, row) {
  if (!habboCtx) return;
  for (const [oid, p] of habboPos) if (oid !== id && p.col === col && p.row === row) return; // tile taken
  const el = habboCtx.figEls.get(id);
  const cur = habboPos.get(id);
  if (!el || !cur || el.classList.contains("hb-voiding")) return;
  const path = habboPath(cur.col, cur.row, col, row);
  if (!path.length) return;
  habboPos.set(id, { col, row });                      // final tile (kept for persistence)
  const token = (el._walk = (el._walk || 0) + 1);      // cancels any walk already in progress
  const STEP = 360;                                    // one Habbo beat per tile
  el.classList.add("walking");
  let i = 0, prevX = habboIso(cur.col, cur.row).x;
  const stepTo = () => {
    if (el._walk !== token) return;
    if (i >= path.length) { el.classList.remove("walking"); return; }   // arrived: stop the gait
    const s = path[i]; const p = habboIso(s.col, s.row);
    // Habbos face the way they're walking - flip at every turn of the L-path.
    if (p.x !== prevX) { el.classList.toggle("hb-face-l", p.x < prevX); el.classList.toggle("hb-face-r", p.x > prevX); }
    prevX = p.x;
    el.style.transitionDuration = `${STEP}ms`;
    el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px)`;
    el.style.zIndex = String(100 + s.col + s.row);
    if (habboSelected === el.dataset.id) habboCamera(el.dataset.id);   // camera follows the walk
    i++;
    setTimeout(stepTo, STEP);
  };
  stepTo();
}
function habboMoveTo(col, row) { if (habboSelected) habboWalk(habboSelected, col, row); }
// Idle wander: every few seconds a random unselected habbo strolls a tile or two, so the room reads
// as a real populated Habbo hotel instead of a museum of statues.
function habboWander() {
  if (state.global.mystery?.id !== "habbo" || !habboCtx) return;
  const ids = [...habboCtx.figEls.keys()].filter((id) => id !== habboSelected);
  if (!ids.length) return;
  const id = ids[Math.floor(Math.random() * ids.length)];
  const el = habboCtx.figEls.get(id);
  const cur = habboPos.get(id);
  if (!el || !cur || el.classList.contains("walking") || el.classList.contains("hb-voiding")) return;
  const taken = new Set([...habboPos.entries()].filter(([oid]) => oid !== id).map(([, p]) => `${p.col},${p.row}`));
  const opts = [];
  for (let dc = -2; dc <= 2; dc++) for (let dr = -2; dr <= 2; dr++) {
    const c = cur.col + dc, r = cur.row + dr;
    if ((dc || dr) && Math.abs(dc) + Math.abs(dr) <= 2 && c >= 0 && c < HABBO_GW && r >= 0 && r < HABBO_GH && !taken.has(`${c},${r}`)) opts.push({ c, r });
  }
  if (opts.length) { const t = opts[Math.floor(Math.random() * opts.length)]; habboWalk(id, t.c, t.r); }
}
// In Habbo mode the location banner gets crunched down to chunky pixels + quantised colours so the
// whole top of the screen reads as one pixel-art scene. Restored when the mode ends.
function habboizeBanner(on) {
  const photo = document.querySelector(".location-photo");
  if (!photo) return;
  if (!on) {
    if (photo.dataset.origBg) { photo.style.backgroundImage = photo.dataset.origBg; photo.style.removeProperty("image-rendering"); delete photo.dataset.origBg; }
    return;
  }
  if (photo.dataset.origBg) return;   // already pixelated
  const m = /url\("?([^")]+)"?\)/.exec(photo.style.backgroundImage);
  if (!m) return;
  photo.dataset.origBg = photo.style.backgroundImage;
  const im = new Image();
  im.onload = () => {
    const W = 144, H = 48;
    const c = document.createElement("canvas");
    c.width = W; c.height = H;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(im, 0, 0, W, H);
    try {
      const d = x.getImageData(0, 0, W, H); const a = d.data;
      for (let i = 0; i < a.length; i += 4) { a[i] = Math.round(a[i] / 36) * 36; a[i + 1] = Math.round(a[i + 1] / 36) * 36; a[i + 2] = Math.round(a[i + 2] / 36) * 36; }
      x.putImageData(d, 0, 0);
    } catch (e) { /* tainted - skip quantise */ }
    if (photo.dataset.origBg) {   // still in habbo mode
      photo.style.backgroundImage = `url('${c.toDataURL()}')`;
      photo.style.imageRendering = "pixelated";
    }
  };
  im.src = decodeURI(m[1]);
}

function renderHabboBoard(player) {
  els.characterBoard.classList.add("habbo-board");
  els.characterBoard.setAttribute("aria-label", "Habbo Hotel room");
  const list = sortedBoard();
  const room = document.createElement("div");
  room.className = "habbo-room";
  els.characterBoard.appendChild(room);

  // ===== The room shell: two REAL iso walls meeting at the back corner + a solid floor slab, all
  // themed from the current location (hot spring = teal water room, park = grass, etc). Everything
  // lives inside .habbo-room so the camera zoom carries the whole room. =====
  const wallX = habboIso(0, 0).x;                      // back corner of the diamond
  const EDGE = (HABBO_GW - 1) * (HABBO_TW / 2);         // horizontal run of one wall (252px)
  const RISE = (HABBO_GH - 1) * (HABBO_TH / 2);         // vertical drop of one wall edge (126px)
  const WALL_H = 112;
  const locName = ((state.location && state.location.name) || "").toLowerCase();
  // Every location maps to a full room skin (walls / floor / rug) so a Ski Lodge READS as a ski
  // lodge, a Hot Spring as a steamy spa, a Diner as a checker-floor greasy spoon, etc.
  const HABBO_THEMES = [
    [/ski|snow|ice|arctic|lodge|mountain/, { wall: "#6a4a2e", cap: "#8a6742", skirt: "#4a3018", ground: "#dce9f4", tile: "#f4f8fc", tileAlt: "#dfe9f2", side: "#a2b6ca", room: "#141c28", rug: "#a83a3a", rug2: "#7e2626", trim: "#e0b04a" }],
    [/spring|spa|pool|aquarium|bath|sauna/, { wall: "#2e6f78", cap: "#4c99a2", skirt: "#1d4a50", ground: "#7fccc4", tile: "#cdeeea", tileAlt: "#b2e0da", side: "#5f9a94", room: "#12262e", rug: "#1e5a62", rug2: "#174a50", trim: "#7fccc4" }],
    [/beach|pier|ferry|harbou?r|island/, { wall: "#7fc4e8", cap: "#a8dcf4", skirt: "#4a90b8", ground: "#e8d5a0", tile: "#f0e0b4", tileAlt: "#e2cf98", side: "#b8a068", room: "#173042", rug: "#3a86c8", rug2: "#2e6ea6", trim: "#f0e0b4" }],
    [/park|garden|greenhouse|farm|zoo|camp|orchard|meadow|yoga/, { wall: "#7a5a34", cap: "#96754a", skirt: "#59401f", ground: "#57a344", tile: "#6fbf58", tileAlt: "#5da84a", side: "#3f7531", room: "#161f12", rug: "#c8703a", rug2: "#a85a2c", trim: "#e8c87a" }],
    [/casino|nightclub|club|bar\b|arcade|karaoke|cinema|theatre|theater|bowling|record/, { wall: "#3a2a52", cap: "#57407a", skirt: "#241634", ground: "#502e58", tile: "#8a4a94", tileAlt: "#74407e", side: "#3e2044", room: "#120a1a", rug: "#5a3474", rug2: "#49285f", trim: "#c9a44a" }],
    [/bakery|cafe|diner|restaurant|kitchen|market|wine/, { wall: "#b0483a", cap: "#cc6a58", skirt: "#84332a", ground: "#e8ddc8", tile: "#f4ecd8", tileAlt: "#d8cbb0", side: "#b0a488", room: "#241812", rug: "#b0483a", rug2: "#963a2e", trim: "#f4ecd8" }],
    [/rooftop|office|train|airport|station|city|museum|library|bookstore|laundromat|hotel|gym|salon|gallery|tattoo/, { wall: "#5e6472", cap: "#7c828f", skirt: "#41454f", ground: "#8e94a0", tile: "#c2c8d2", tileAlt: "#aeb4c0", side: "#767c88", room: "#141821", rug: "#3a5a8c", rug2: "#2e4870", trim: "#c2c8d2" }]
  ];
  const theme = (HABBO_THEMES.find(([re]) => re.test(locName)) || [null,
    { wall: "#7d87b8", cap: "#99a2cc", skirt: "#565e88", ground: "#c3ae7e", tile: "#d8c79a", tileAlt: "#cbb888", side: "#93805a", room: "#232a4a", rug: "#8c3a3a", rug2: "#742e2e", trim: "#d8b45a" }])[1];
  const varName = { tileAlt: "tile-alt" };
  Object.keys(theme).forEach((k) => els.characterBoard.style.setProperty(`--hb-${varName[k] || k}`, theme[k]));

  // Solid ground slab under the tiles (with a hard extrusion off the two front edges).
  const ground = document.createElement("div");
  ground.className = "hb-ground";
  ground.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="${EDGE * 2}" height="${RISE * 2 + 10}" style="position:absolute;left:${wallX - EDGE}px;top:150px" aria-hidden="true">
      <polygon points="${EDGE},${RISE * 2} ${EDGE * 2},${RISE} ${EDGE * 2},${RISE + 9} ${EDGE},${RISE * 2 + 9} 0,${RISE + 9} 0,${RISE}" fill="var(--hb-side)"/>
      <polygon points="${EDGE},0 ${EDGE * 2},${RISE} ${EDGE},${RISE * 2} 0,${RISE}" fill="var(--hb-ground)"/>
    </svg>`;
  // Walls: parallelograms whose bottom edges ride the floor's two back edges exactly (skewY ±26.565°,
  // tan = TH/TW = 0.5). Left wall shaded a touch darker than the right, Habbo-style.
  const wallL = document.createElement("div");
  wallL.className = "hb-wallpanel hbw-left";
  wallL.style.cssText = `left:${wallX - EDGE}px;top:${150 - WALL_H}px;width:${EDGE}px;height:${WALL_H}px`;
  const wallR = document.createElement("div");
  wallR.className = "hb-wallpanel hbw-right";
  wallR.style.cssText = `left:${wallX}px;top:${150 - WALL_H}px;width:${EDGE}px;height:${WALL_H}px`;
  room.appendChild(wallL);
  room.appendChild(wallR);
  room.appendChild(ground);

  const floor = document.createElement("div");
  floor.className = "habbo-floor";
  room.appendChild(floor);
  // Clicking empty room (not an avatar, not a walkable tile) drops the camera back out.
  room.addEventListener("click", (e) => {
    if (habboSelected && (e.target === room || e.target === floor || e.target.closest(".hb-ground")
      || e.target.classList.contains("hb-wallpanel") || e.target.classList.contains("habbo-decor"))) selectHabbo(habboSelected);
  });
  for (let r = 0; r < HABBO_GH; r++) for (let c = 0; c < HABBO_GW; c++) {
    const p = habboIso(c, r);
    const tile = document.createElement("div");
    tile.className = `habbo-tile ${(c + r) % 2 ? "alt" : ""}`.trim();
    tile.style.left = `${p.x}px`; tile.style.top = `${p.y}px`; tile.style.zIndex = String(c + r);
    tile.addEventListener("click", () => habboMoveTo(c, r));
    floor.appendChild(tile);
  }
  // Original room decor (NOT Habbo's copyrighted art): a rug on the floor, framed abstract paintings on
  // the back wall, and a pot plant.
  const mid = habboIso((HABBO_GW - 1) / 2, (HABBO_GH - 1) / 2);
  const decor = document.createElement("div");
  decor.className = "habbo-decor";
  // The paintings are ACTUAL tiny pixel-art scenes (16x12 SVG grids, crisp edges): a sunset over the
  // sea, green hills with a tree, and a starry night - not abstract colour mush.
  const PXA = `xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 12" width="100%" height="100%" preserveAspectRatio="none" shape-rendering="crispEdges"`;
  const r = (x, y, w, h, c) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${c}"/>`;
  const paintSunset = `<svg ${PXA}>`
    + r(0, 0, 16, 3, "#8a2c3e") + r(0, 3, 16, 2, "#c8503a") + r(0, 5, 16, 2, "#e8843a") + r(0, 7, 16, 1, "#f0b04a")
    + r(6, 4, 4, 4, "#ffd24d") + r(7, 3, 2, 1, "#ffd24d") + r(7, 8, 2, 1, "#ffe9a0")   // sun + top notch + glint
    + r(0, 8, 16, 4, "#1a4a6a") + r(5, 9, 6, 1, "#3a7a9a") + r(6, 10, 4, 1, "#3a7a9a") // sea + reflection
    + `</svg>`;
  const paintHills = `<svg ${PXA}>`
    + r(0, 0, 16, 8, "#8ac8e8") + r(2, 2, 4, 1, "#ffffff") + r(3, 1, 2, 1, "#ffffff") + r(10, 3, 3, 1, "#ffffff")  // sky + clouds
    + r(0, 8, 16, 4, "#4a9a3a") + r(0, 7, 7, 1, "#4a9a3a") + r(9, 7, 7, 1, "#3a8030")   // rolling hills
    + r(11, 4, 2, 3, "#6a4a2a") + r(9, 1, 6, 4, "#2c7a2c") + r(10, 0, 4, 1, "#2c7a2c")  // tree trunk + canopy
    + `</svg>`;
  const paintNight = `<svg ${PXA}>`
    + r(0, 0, 16, 9, "#1a1440") + r(2, 1, 3, 3, "#f0eccc") + r(3, 2, 3, 2, "#1a1440")   // sky + crescent moon
    + r(8, 2, 1, 1, "#ffffff") + r(12, 1, 1, 1, "#ffffff") + r(10, 5, 1, 1, "#ffe9a0") + r(14, 4, 1, 1, "#ffffff") + r(6, 6, 1, 1, "#ffffff")
    + r(0, 9, 16, 3, "#33245c") + r(0, 8, 5, 1, "#33245c") + r(11, 8, 5, 1, "#33245c")  // purple hills
    + `</svg>`;
  decor.innerHTML =
    `<div class="hb-rug" style="left:${mid.x}px;top:${mid.y}px"></div>` +
    `<div class="hb-plant" style="left:${wallX - EDGE - 6}px;top:${150 + RISE - 54}px"><span class="hb-pot"></span></div>`;
  room.appendChild(decor);
  // Paintings hang INSIDE the wall panels, so they inherit the wall's skew and sit flat on it.
  wallL.innerHTML = `<div class="hb-painting" style="left:34px;top:20px">${paintSunset}</div>`
    + `<div class="hb-painting" style="left:150px;top:26px">${paintHills}</div>`;
  wallR.innerHTML = `<div class="hb-painting" style="left:96px;top:22px">${paintNight}</div>`;
  // Give any character without a tile a starting spot, strided so they scatter across the whole floor
  // rather than bunching in the back rows.
  const total = HABBO_GW * HABBO_GH;
  const taken = new Set([...habboPos.values()].map((p) => `${p.col},${p.row}`));
  const stride = Math.max(1, Math.floor(total / Math.max(1, list.length)));
  let slot = 0;
  list.forEach((ch) => {
    if (habboPos.has(ch.id)) return;
    let idx, c, r, key, tries = 0;
    do { idx = (slot * stride + Math.floor(slot / total)) % total; c = idx % HABBO_GW; r = Math.floor(idx / HABBO_GW); key = `${c},${r}`; slot++; tries++; } while (taken.has(key) && tries < total * 2);
    taken.add(key); habboPos.set(ch.id, { col: c, row: r });
  });
  const figs = document.createElement("div");
  figs.className = "habbo-figs";
  room.appendChild(figs);
  const figEls = new Map();
  list.forEach((ch) => {
    // Voided avatars aren't in the room at all - they're in the void (DE-VOID panel brings them back).
    if (player.eliminated.has(ch.id)) return;
    const a = state.global.mystery.assignments[ch.id] || {};
    const pos = habboPos.get(ch.id);
    const p = habboIso(pos.col, pos.row);
    // Iso facing: instead of staring at the camera, everyone looks diagonally toward the room's
    // centre - pupils shifted sideways+down and a slight head turn, Habbo-style.
    const facing = pos.col >= pos.row ? -1 : 1;   // right half of the room looks left, left half right
    if (ch.traits && window.faceGenerator) {
      try {
        a.head = window.faceGenerator.renderPortrait(ch.seed, {
          ...ch.traits, headOnly: true,
          pupilX: (Number(ch.traits.pupilX) || 0) + facing * 2.6,
          pupilY: (Number(ch.traits.pupilY) || 0) + 1.6
        });
      } catch (e) { /* keep the stock head */ }
    }
    const el = document.createElement("button");
    el.type = "button";
    el.className = `habbo-fig ${facing === 1 ? "hb-face-r" : "hb-face-l"} ${ch.id === habboSelected ? "selected" : ""}`.trim();
    el.dataset.id = ch.id;
    el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px)`;
    el.style.zIndex = String(100 + pos.col + pos.row);
    // Proper Habbo anatomy: big pixel head on a little torso with arms (skin-tone hands), legs and
    // shoes - the parts animate a real step-gait while walking. The bottom half wears the SAME
    // outfit as the top: pants are a darker shade of the shirt, not a random colour.
    const pants = mixHex(a.shirt || "#4a90e2", "#14161c", 0.45);
    el.innerHTML = `<span class="hb-name">${escapeHtml(displayName(ch))}</span>`
      + `<img class="hb-head" src="${a.head || ch.image}" alt="">`
      + `<span class="hb-body" style="--shirt:${a.shirt || "#4a90e2"};--skin:${skinHexOf(ch)};--pants:${pants}">`
      + `<i class="hb-arm hb-arm-l"></i><i class="hb-arm hb-arm-r"></i><i class="hb-torso"></i>`
      + `<i class="hb-leg hb-leg-l"></i><i class="hb-leg hb-leg-r"></i></span>`
      + `<span class="hb-shadow"></span>`;
    // Click an avatar to select: the room camera zooms onto them, the ROOM CAM shows their face
    // properly, and (with a keyboard) the chat bar lets you talk as them.
    el.addEventListener("click", () => selectHabbo(ch.id));
    figs.appendChild(el);
    figEls.set(ch.id, el);
    // Pixelate the head into chunky Habbo pixels once it loads. Crop tight to the head first so the
    // whole pixel budget lands on the face (not transparent margins) - readable AND properly pixel-art.
    if (a.head) pixelateSrc(a.head, 30, (url) => { const img = el.querySelector(".hb-head"); if (img) img.src = url; }, [0.14, 0.09, 0.72, 0.72]);
  });
  habboCtx = { figEls, room };
  if (habboSelected && !figEls.has(habboSelected)) habboSelected = null;   // selection voided/gone
  if (habboSelected) habboCamera(habboSelected);   // keep the camera on re-render
  renderHabboSelectionUI();                        // rebuild the ROOM CAM + chat bar for the selection
  if (!habboWanderTimer) habboWanderTimer = setInterval(habboWander, 2600);   // idle strolling
  renderVoidControls(player);                      // the void + DE-VOID panel is a Habbo-only feature
}

function renderHints() {
  const hints = state.global.hints[state.currentPlayer];
  els.hintShelf.classList.toggle("has-hints", hints.length > 0);
  els.hintShelf.innerHTML = hints.map((hint) => `<span class="hint-pill">${escapeHtml(hint)}</span>`).join("");
}

function renderHouseMap() {
  const mystery = state.global.mystery;
  if (mystery?.id !== "knockoff-manor") {
    els.houseMap.className = "house-map is-hidden";
    els.houseMap.innerHTML = "";
    return;
  }
  els.houseMap.className = "house-map is-hidden";
  els.houseMap.innerHTML = "";
}

function renderKnockoffManorBoard(player) {
  const mystery = state.global.mystery;
  const rooms = mystery.rooms || [];
  els.characterBoard.classList.add("knockoff-manor-board");
  els.characterBoard.setAttribute("aria-label", "MURDER TIME room board");
  renderMurderCenter(mystery);
  rooms.forEach((room) => {
    const roomTile = document.createElement("section");
    roomTile.className = `manor-room-tile ${room.id === mystery.bloodRoomId ? "has-blood" : ""}`.trim();
    roomTile.dataset.room = room.name;
    roomTile.style.setProperty("--room-row", room.row);
    roomTile.style.setProperty("--room-col", room.col);
    roomTile.style.setProperty("--room-row-span", room.rowSpan);
    roomTile.style.setProperty("--room-col-span", room.colSpan);
    roomTile.style.setProperty("--room-tone", room.tone);
    roomTile.innerHTML = `
      <div class="manor-room-label">
        <span>${escapeHtml(room.name)}</span>
      </div>
      ${room.id === mystery.bloodRoomId ? "<div class=\"blood-splatter\" aria-hidden=\"true\"></div>" : ""}
      <div class="manor-room-cards"></div>
    `;
    const cardWrap = roomTile.querySelector(".manor-room-cards");
    state.board
      .filter((character) => mystery.assignments[character.id]?.roomId === room.id)
      .sort((a, b) => a.name.localeCompare(b.name))
      .forEach((character) => {
        cardWrap.appendChild(createManorCharacterToken(character, player));
      });
    // Rooms accept dragged suspects.
    roomTile.dataset.roomId = room.id;
    roomTile.addEventListener("dragover", (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; roomTile.classList.add("drop-target"); });
    roomTile.addEventListener("dragleave", () => roomTile.classList.remove("drop-target"));
    roomTile.addEventListener("drop", (e) => {
      e.preventDefault(); roomTile.classList.remove("drop-target");
      const cid = e.dataTransfer.getData("text/plain");
      if (cid) manorMoveTo(cid, room.id);
    });
    els.characterBoard.appendChild(roomTile);
  });
}

function renderMurderCenter(mystery) {
  const center = document.createElement("section");
  center.className = "murder-center";
  center.setAttribute("aria-label", "Murder weapons");
  center.innerHTML = `
    <div class="weapon-pile">
      ${(mystery.weapons || []).map((weapon) => `<span>${escapeHtml(weapon.emoji)}</span>`).join("")}
    </div>
  `;
  els.characterBoard.appendChild(center);
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

// ===================== The Void (elimination) + DE-VOID panel =====================
function renderVoidControls(player) {
  const wrap = document.querySelector(".board-wrap");
  if (!wrap) return;
  const voided = state.board.filter((c) => player.eliminated.has(c.id));
  let btn = document.getElementById("deVoidBtn");
  if (!btn) {
    btn = document.createElement("button");
    btn.id = "deVoidBtn"; btn.type = "button"; btn.className = "de-void-btn";
    btn.addEventListener("click", toggleVoidPanel);
    wrap.appendChild(btn);
  }
  btn.innerHTML = `<span class="dv-hole">🕳</span> DE-VOID REQUIRED? <span class="dv-count">${voided.length}</span>`;
  btn.style.display = voided.length ? "" : "none";
  if (!voided.length) { const p = document.getElementById("voidPanel"); if (p) p.classList.remove("open"); }
  const panel = document.getElementById("voidPanel");
  if (panel && panel.classList.contains("open")) fillVoidPanel(player);
}
function toggleVoidPanel() {
  let panel = document.getElementById("voidPanel");
  if (!panel) {
    panel = document.createElement("div"); panel.id = "voidPanel"; panel.className = "void-panel";
    document.querySelector(".board-wrap").appendChild(panel);
  }
  panel.classList.toggle("open");
  if (panel.classList.contains("open")) fillVoidPanel(currentPlayer());
}
function fillVoidPanel(player) {
  const panel = document.getElementById("voidPanel");
  if (!panel) return;
  const voided = state.board.filter((c) => player.eliminated.has(c.id));
  panel.innerHTML = `<p class="vp-title">DE-VOID REQUIRED? <span>tap a face to pull them back out</span></p>`
    + `<div class="vp-faces">${voided.map((c) => {
      const m = getMysteryCardData(c);
      return `<button type="button" class="vp-face" data-id="${c.id}"><img src="${m.image || c.image}" alt=""><span class="vp-name">${escapeHtml(displayName(c))}</span></button>`;
    }).join("")}</div>`;
  panel.querySelectorAll(".vp-face").forEach((b) => b.addEventListener("click", () => toggleEliminated(b.dataset.id)));
}

// Per-mode question decks - when a special mode is active, every drawn question matches its flavour.
const modePrompts = window.GameData.modePrompts;

function drawPrompt() {
  const modeDeck = state.global.mystery ? modePrompts[state.global.mystery.id] : null;
  const deck = modeDeck && modeDeck.length
    ? modeDeck
    : (state.settings.prompts ? absurdPrompts : classicPrompts);
  els.questionPrompt.textContent = pick(deck);
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
  const effect = pick(mysteryEffects);
  applyMysteryEffect(effect.id);
  playEffectAnnouncement(effect.name);
  showMysteryAnnouncement(effect.name, effect.exampleQuestion);
  addLog(`${player.name} triggered a mystery effect.`);
  netSend("mode", { id: effect.id });   // the shared mode changed - the other client follows
}

function triggerKnockoffManorTest() {
  currentPlayer().mysteryUsed = true;
  applyMysteryEffect("knockoff-manor");
  const effect = mysteryEffects.find((item) => item.id === "knockoff-manor");
  playEffectAnnouncement(effect.name);
  showMysteryAnnouncement(effect.name, effect.exampleQuestion);
  addLog(`${currentPlayer().name} typed the test trigger.`);
  render();
}

function triggerPs1Test() {
  currentPlayer().mysteryUsed = true;
  applyMysteryEffect("ps1-mode");
  const effect = mysteryEffects.find((item) => item.id === "ps1-mode");
  playEffectAnnouncement(effect.name);
  showMysteryAnnouncement(effect.name, effect.exampleQuestion);
  addLog(`${currentPlayer().name} typed the test trigger.`);
  render();
}

function triggerGayFroggedTest() {
  currentPlayer().mysteryUsed = true;
  applyMysteryEffect("gay-frogged");
  const effect = mysteryEffects.find((item) => item.id === "gay-frogged");
  playEffectAnnouncement(effect.name);
  showMysteryAnnouncement(effect.name, effect.exampleQuestion);
  addLog(`${currentPlayer().name} typed the test trigger.`);
  render();
}

// Roulette glyphs, one per mode - each is a MONOCHROME symbol chosen to hint at its mode's theme
// (never a full-colour emoji: the cells tint the glyph via `color: hsl(--hue)` + glow, and colour
// emoji would ignore that and break the neon aesthetic). Unknown ids fall back to an abstract set.
const MODE_GLYPHS = {
  "prop-panic": "☂",                 // random props
  "family-tree-disaster": "⚭",       // tangled bloodlines
  "knockoff-manor": "☠",             // MURDER TIME
  "emotional-audit": "♥",            // feelings on trial
  "witness-protection-filter": "⊘",  // identity redacted
  "role-reveal": "❂",                // roles come to light
  "hidden-agendas": "⚿",             // secret motives
  "monocultural": "⧉",               // everyone the same
  "gay-frogged": "⚧",                // turned gay
  "face-first": "☻",                 // all about the face
  "ps1-mode": "△",                   // low-poly / PlayStation
  "yugioh": "◈",                     // duel cards
  "orgy": "⚯",                       // entangled bodies
  "fireworks": "✸",                  // explosive finish
  "pixall": "▦",                     // pixel grid
  "disease": "☣",                    // biohazard
  "drugs": "☤",                      // caduceus / substances
  "fertility": "☥",                  // ankh / life
  "disguise": "⬗",                   // half-hidden face
  "work": "⚒",                       // labour
  "woke": "◉",                       // eyes open
  "swipe": "☞",                      // swipe right
  "judgement": "⚖",                  // scales of justice
  "sims": "⬦",                       // plumbob
  "heads-only": "⊚",                 // floating heads
  "habbo": "⌂",                      // the hotel
  "astrology": "☽",                  // celestial
  "pantone": "❏",                    // colour chip
  "horny-potter": "☇",               // lightning scar
};
const FALLBACK_GLYPHS = ["✦", "⚛", "⬢", "✶", "⟁", "⌖", "☯", "⚙", "❖", "⌬", "☄", "⊛"];

// Spin a slot-machine of abstract symbols at the start of a round; it decelerates onto a random mode,
// flashes chaotically, then reveals + applies it. done(id) fires with the chosen mode id (or null).
function spinModeRoulette(done) {
  const modes = mysteryEffects.map((e, i) => ({ id: e.id, name: e.name, glyph: MODE_GLYPHS[e.id] || FALLBACK_GLYPHS[i % FALLBACK_GLYPHS.length], hue: (i * 47) % 360 }));
  modes.push({ id: null, name: "No Effect", glyph: "∅", hue: 210 });
  // Lands on the no-repeat bag pick (shared via the start message); legacy fallback: salt hash.
  const targetId = state.wheelPick !== undefined ? state.wheelPick : wheelTarget();
  markWheelSeen(targetId);
  const target = modes.find((m) => m.id === targetId) || modes[modes.length - 1];
  const targetPos = modes.indexOf(target);
  const CELL = 112, REPS = 9;
  let cells = [];
  for (let r = 0; r < REPS; r++) cells = cells.concat(modes);
  const landIndex = (REPS - 1) * modes.length + targetPos;

  document.querySelectorAll(".roulette-overlay").forEach((o) => o.remove());
  const overlay = document.createElement("div");
  overlay.className = "roulette-overlay";
  overlay.innerHTML = `
    <div class="roulette-box">
      <p class="roulette-title">Spinning the Wheel of Fate…</p>
      <div class="roulette-window">
        <div class="roulette-marker"></div>
        <div class="roulette-strip">${cells.map((m) => `<div class="roulette-cell" style="--hue:${m.hue}">${m.glyph}</div>`).join("")}</div>
      </div>
      <p class="roulette-reveal" aria-live="polite"></p>
    </div>`;
  document.body.appendChild(overlay);
  const strip = overlay.querySelector(".roulette-strip");
  const win = overlay.querySelector(".roulette-window");
  const center = win.clientWidth / 2;
  const jitter = (Math.random() - 0.5) * (CELL * 0.5);
  const finalX = -(landIndex * CELL + CELL / 2 - center + jitter);
  strip.style.transform = "translateX(0)";
  if (window.Sound) window.Sound.spinTicks(3400, 32, 340);   // fast-then-slow ticks match the deceleration
  requestAnimationFrame(() => {
    strip.style.transition = "transform 3.4s cubic-bezier(.1,.62,.2,1)";
    strip.style.transform = `translateX(${finalX}px)`;
  });
  // Drive the reveal off a timer (matches the 3.4s spin) rather than transitionend, which can be
  // dropped if the element is laid out late.
  setTimeout(() => {
    if (!overlay.isConnected) return;
    const rev = overlay.querySelector(".roulette-reveal");
    rev.textContent = target.id ? target.name : "NO EFFECT — clean round";
    rev.style.setProperty("--hue", target.hue);
    overlay.classList.add("is-landed", "is-flash");
    setTimeout(() => { overlay.remove(); done(target.id); }, 1400);
  }, 3500);
}

function applyMysteryEffect(effectId) {
  clearMysteryEffectUI();
  const effect = mysteryEffects.find((item) => item.id === effectId);
  if (!effect) return;
  state.global.mystery = effect.apply(effect);
}

function clearMysteryEffectUI() {
  state.global.mystery = null;
  resetHeadsAnim();
  resetHabbo();
  resetSimsLoop();
  stopPropLoop();
  stopPixallLoop();
  els.characterBoard?.classList.remove("family-tree-board", "knockoff-manor-board", "ygo-board", "orgy-board", "pixall-board", "disease-board", "drugs-board", "fertility-board", "work-board", "woke-board", "swipe-board", "judgement-board", "sims-board", "heads-board", "habbo-board", "astrology-board", "pantone-board", "hp-board");
  document.body.classList.remove("mode-yugioh", "mode-pixall");
  els.mysteryResult.textContent = "";
  if (ps1Cleanup) { ps1Cleanup(); ps1Cleanup = null; }
}

function createCharacterCard(character, player) {
  const card = document.createElement("button");
  const mystery = getMysteryCardData(character);
  card.type = "button";
  card.id = `card-${character.id}`;
  card.className = `character-card ${character.variant || ""} ${mystery.cardClass || ""}`.trim();
  card.classList.toggle("is-down", player.eliminated.has(character.id));
  const justKilled = state.justEliminated === character.id;
  const modeId = state.global.mystery?.id;
  // One-shot head-pop + fireworks when just eliminated in Fireworks Mode.
  const popping = justKilled && modeId === "fireworks";
  if (popping) card.classList.add("is-fireworks-pop");
  // One-shot flip-to-back animation when just eliminated in Yu-Gi-Oh mode, and the reverse un-flip
  // when a downed card is clicked back up.
  if (justKilled && modeId === "yugioh") card.classList.add("ygo-flip");
  if (state.justRestored === character.id && modeId === "yugioh") card.classList.add("ygo-unflip");
  // SWIPE: crossing a card off slams a "NOPE" stamp on it; bringing it back stamps "LIKED".
  if (justKilled && modeId === "swipe") card.classList.add("swipe-nope");
  if (state.justRestored === character.id && modeId === "swipe") card.classList.add("swipe-like");
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
  // Fireworks Mode: an eliminated character stays HEADLESS (head removed, neck stump) for the rest of
  // the round - not just during the pop. The base portrait is the noHead render; the one-shot pop
  // animation (flying head + blood + burst) only plays on the card that was just killed.
  const fwHeadless = modeId === "fireworks" && player.eliminated.has(character.id)
    && character.traits && window.faceGenerator;
  let fireworks = "";
  if (fwHeadless) {
    const render = (extra) => window.faceGenerator.renderPortrait(character.seed, { ...character.traits, ...extra });
    portraitSrc = render({ noHead: true });           // headless body + neck stump stays as the card art
    card.classList.add("fw-headless");
  }
  if (popping && character.traits && window.faceGenerator) {
    const render = (extra) => window.faceGenerator.renderPortrait(character.seed, { ...character.traits, ...extra });
    const headSrc = render({ headOnly: true });        // the head that flies off

    // Every character explodes differently: a hashed burst STYLE (ring / willow droop / double
    // crackle / 5-point star) with its own palette, particle sizes, spreads and stagger.
    const PALETTES = [
      ["#ff4d6d", "#ffd24d", "#fff27a"], ["#4dd2ff", "#5dff8f", "#c8fff2"],
      ["#c46bff", "#ff5ad0", "#ffd0f4"], ["#ff8a4d", "#ffd24d", "#ff4d3a"],
      ["#5dff8f", "#c8ff5a", "#f2ffc8"], ["#fff27a", "#ffffff", "#ffd24d"]
    ];
    const fh = (s) => stableHash(character.id + ":" + s);
    const pal = PALETTES[fh("fwpal") % PALETTES.length];
    const style = ["ring", "willow", "crackle", "star"][fh("fwsty") % 4];
    const spark = (ang, dist, o) => {
      o = o || {};
      const size = o.size != null ? o.size : 0.7 + (fh("fwsz" + ang + dist) % 60) / 100;
      return `<i style="--tx:${Math.round(Math.cos(ang) * dist)}px;--ty:${Math.round(Math.sin(ang) * dist)}px;`
        + `--ps:${size.toFixed(2)};--gy:${o.droop || 0}px;--pd:${(o.delay || 0).toFixed(2)}s;--pdur:${(o.dur || 0.85).toFixed(2)}s;`
        + `background:${o.col || pal[fh("fwc" + ang) % pal.length]}"></i>`;
    };
    let parts = "";
    if (style === "ring") {          // clean even shell, one colour ring inside another
      for (let i = 0; i < 14; i++) parts += spark((i / 14) * Math.PI * 2, 58 + (fh("r" + i) % 10), { col: pal[0] });
      for (let i = 0; i < 9; i++) parts += spark((i / 9) * Math.PI * 2 + 0.3, 30, { col: pal[1], size: 0.6, delay: 0.08 });
    } else if (style === "willow") { // long droopy trails that sag under gravity
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2 + (fh("w" + i) % 10) / 30;
        parts += spark(ang, 40 + (fh("wd" + i) % 34), { droop: 34 + (fh("wg" + i) % 26), dur: 1.5, size: 0.8 });
      }
    } else if (style === "crackle") { // main pop, then a delayed scatter of small crackles
      for (let i = 0; i < 10; i++) parts += spark((i / 10) * Math.PI * 2, 44 + (fh("c" + i) % 14));
      for (let i = 0; i < 14; i++) {
        const ang = (fh("ca" + i) % 628) / 100;
        parts += spark(ang, 52 + (fh("cd" + i) % 30), { size: 0.45, delay: 0.22 + (fh("cy" + i) % 20) / 100, col: pal[2] });
      }
    } else {                          // star: particles march out along 5 spokes
      for (let s = 0; s < 5; s++) for (let k = 1; k <= 3; k++) {
        const ang = (s / 5) * Math.PI * 2 - Math.PI / 2;
        parts += spark(ang, 26 * k, { size: 1.15 - k * 0.25, delay: k * 0.06, col: pal[k - 1] });
      }
    }
    // Blood: particles spraying up/out from the neck (around 59% down the portrait, centred).
    let blood = "";
    for (let i = 0; i < 14; i++) {
      const ang = -Math.PI / 2 + (i / 14 - 0.5) * 2.2;     // fan upward
      const dist = 26 + (i % 5) * 12;
      const dly = (i % 6) * 0.07;
      blood += `<b style="--bx:${Math.round(Math.cos(ang) * dist)}px;--by:${Math.round(Math.sin(ang) * dist)}px;--bd:${dly.toFixed(2)}s"></b>`;
    }
    fireworks = `<div class="fw" aria-hidden="true">`
      + `<img class="fw-head" src="${headSrc}" alt="">`
      + `<div class="fw-blood">${blood}</div>`
      + `<div class="fw-burst">${parts}</div><div class="fw-flash"></div></div>`;
  }
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
      ${fireworks}
      ${prop}
      ${babyBadge}
      ${state.sortKey === "abortions" ? `<span class="abortion-count" title="abortions">👼 ${character.abortions || 0}</span>` : ""}
      ${mystery.cornerHtml || ""}
    </div>
    <div class="card-plate">
      <h3>${displayName(character)}</h3>
      ${state.global.mystery?.id === "gay-frogged" ? `<p class="card-pronouns">${escapeHtml(mystery.pronoun || "they/them")}</p>` : ""}
      ${state.global.mystery?.id === "gay-frogged" ? `<div class="card-grindr-tags">${[...(stableHash(character.id + ":poc") % 3 === 0 ? ["POC"] : []), ...characterTags(character)].map((t) => `<span class="grindr-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      <div class="card-meta">${mystery.html}</div>
    </div>
  `;
  card.addEventListener("click", (e) => { if (e.target.closest(".dz-painscale")) return; toggleEliminated(character.id); });
  wireBreedDnD(card, character.id);
  return card;
}

function createManorCharacterToken(character, player) {
  const token = document.createElement("button");
  const assignment = state.global.mystery?.assignments[character.id];
  const inBlood = assignment?.roomId && assignment.roomId === state.global.mystery?.bloodRoomId;
  token.type = "button";
  token.id = `token-${character.id}`;
  token.className = `manor-token ${inBlood ? "in-blood" : ""}`.trim();
  token.classList.toggle("is-down", player.eliminated.has(character.id));
  token.dataset.id = character.id;
  if (assignment?.roomName) token.dataset.houseRoom = assignment.roomName;
  token.setAttribute("aria-label", `${character.name}${assignment?.roomName ? ` in ${assignment.roomName}` : ""}`);
  token.setAttribute("title", `${character.name} — drag between rooms to move a suspect`);
  // Everyone's shifty: a per-suspect nervous glance/shuffle (hashed offset + speed), guilt sweat
  // for whoever's currently in the blood room.
  const sway = 2.2 + (stableHash(character.id + ":shift") % 240) / 100;
  const delay = -(stableHash(character.id + ":shiftd") % 3000) / 1000;
  token.style.setProperty("--shift-dur", `${sway.toFixed(2)}s`);
  token.style.setProperty("--shift-delay", `${delay.toFixed(2)}s`);
  token.innerHTML = `
    <img src="${character.image}" alt="">
    ${inBlood ? '<span class="manor-sweat" aria-hidden="true">💧</span>' : ""}
    <span class="manor-name">${escapeHtml(character.name)}</span>
  `;
  // Tap crosses off; a real drag relocates the suspect. (manordrag flag set by the drag handler.)
  token.addEventListener("click", () => { if (token.dataset.manordrag) { delete token.dataset.manordrag; return; } toggleEliminated(character.id); });
  wireManorDnD(token, character.id);
  return token;
}
// Drag a suspect from one room onto another to move them (repositioning to reason about alibis).
// The drop target is the room tile the pointer is over.
let manorTouchDrag = null;
function wireManorDnD(token, id) {
  token.draggable = true;
  token.addEventListener("dragstart", (e) => { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "move"; token.classList.add("dragging"); token.dataset.manordrag = "1"; });
  token.addEventListener("dragend", () => token.classList.remove("dragging"));
  // Touch: finger-drag the token onto another room tile.
  token.addEventListener("touchstart", (e) => { manorTouchDrag = { id, token }; }, { passive: true });
  token.addEventListener("touchmove", (e) => {
    if (!manorTouchDrag) return;
    manorTouchDrag.moved = true;
    token.dataset.manordrag = "1";
    token.classList.add("dragging");
  }, { passive: true });
  token.addEventListener("touchend", (e) => {
    if (!manorTouchDrag || !manorTouchDrag.moved) { manorTouchDrag = null; return; }
    const t = e.changedTouches[0];
    const tile = document.elementFromPoint(t.clientX, t.clientY)?.closest(".manor-room-tile");
    token.classList.remove("dragging");
    if (tile) manorMoveTo(id, tile.dataset.roomId);
    manorTouchDrag = null;
  });
}
function manorMoveTo(charId, roomId) {
  const mystery = state.global.mystery;
  if (!mystery || mystery.id !== "knockoff-manor") return;
  const room = (mystery.rooms || []).find((r) => r.id === roomId);
  const asg = mystery.assignments[charId];
  if (!room || !asg || asg.roomId === roomId) return;
  asg.roomId = room.id;
  asg.roomName = room.name;
  netSend("manor-move", { charId, roomId });
  addLog(`A suspect slinked into ${room.name}.`);
  renderBoard();
  scheduleSave();
}

function renderFamilyBoard(player) {
  els.characterBoard.classList.add("family-tree-board");
  const mystery = state.global.mystery;
  const clusters = mystery?.clusters || [];
  clusters.forEach((cluster) => {
    const treeModel = buildFamilyTreeModel(cluster, mystery.assignments);
    const group = document.createElement("section");
    group.className = `family-cluster ${cluster.className}`;
    group.dataset.familyCluster = cluster.id;
    group.innerHTML = `<h3>${escapeHtml(cluster.name)}</h3><div class="family-tree"><svg class="family-tree-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"></svg></div>`;
    const tree = group.querySelector(".family-tree");
    const svg = tree.querySelector(".family-tree-lines");
    svg.innerHTML = treeModel.paths.map((path) => `<path d="${path}"></path>`).join("");
    treeModel.slots.forEach((slot) => {
      const character = state.board.find((item) => item.id === slot.characterId);
      if (!character) return;
      const node = document.createElement("div");
      node.className = `family-slot family-slot-${slot.key}`;
      node.style.gridColumn = `${slot.col} / span ${slot.span}`;
      node.style.gridRow = String(slot.row);
      node.appendChild(createCharacterCard(character, player));
      tree.appendChild(node);
    });
    // Members beyond the template's slots (in-laws who married in, fresh babies) branch off below the
    // tree instead of silently vanishing.
    const slotted = new Set(treeModel.slots.map((s) => s.characterId));
    const extras = cluster.characterIds.filter((cid) => !slotted.has(cid));
    if (extras.length) {
      const row = document.createElement("div");
      row.className = "family-extras";
      extras.forEach((cid) => {
        const character = state.board.find((item) => item.id === cid);
        if (character) row.appendChild(createCharacterCard(character, player));
      });
      group.appendChild(row);
    }
    els.characterBoard.appendChild(group);
  });
}

function buildFamilyTreeModel(cluster, assignments) {
  const templates = getFamilyTemplates(cluster.characterIds.length);
  const template = templates[stableHash(`${state.gameSalt}:${cluster.id}:template`) % templates.length];
  const slotDefs = template.slotDefs.slice(0, cluster.characterIds.length);
  const slots = assignFamilySlots(cluster, assignments, slotDefs);
  const slotMap = Object.fromEntries(slots.map((slot) => [slot.key, slot]));
  return {
    slots,
    paths: template.buildPaths(slotMap)
  };
}

function getFamilyTemplates(size) {
  const duoBranch = {
    slotDefs: [
      { key: "parentA", row: 1, col: 2, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Step-aunt", "Weird Uncle"] },
      { key: "parentB", row: 1, col: 4, span: 2, prefers: ["Dad", "Mum", "Legal Guardian Maybe", "Step-aunt", "Weird Uncle"] },
      { key: "core", row: 2, col: 3, span: 2, prefers: ["Twin", "Cousin", "Work Nephew", "Family Friend Who Won’t Leave", "Weird Uncle"] },
      { key: "side", row: 2, col: 5, span: 2, prefers: ["Cousin", "Step-aunt", "Weird Uncle", "Family Friend Who Won’t Leave", "Twin"] },
      { key: "baby", row: 3, col: 3, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Twin", "Cousin"] },
      { key: "sideKid", row: 3, col: 5, span: 2, prefers: ["Cousin", "Twin", "Work Nephew", "Baby Somehow"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parentA && slotMap.parentB) {
        const left = familyPoint(slotMap.parentA, "bottom");
        const right = familyPoint(slotMap.parentB, "bottom");
        const joinY = 18;
        const trunkY = 35;
        const midX = (left.x + right.x) / 2;
        paths.push(pathFromPoints([[left.x, joinY], [right.x, joinY]]));
        paths.push(pathFromPoints([[left.x, left.y], [left.x, joinY]]));
        paths.push(pathFromPoints([[right.x, right.y], [right.x, joinY]]));
        if (slotMap.core) {
          const coreTop = familyPoint(slotMap.core, "top");
          paths.push(pathFromPoints([[midX, joinY], [midX, trunkY], [coreTop.x, trunkY], [coreTop.x, coreTop.y]]));
          if (slotMap.side) {
            const sideTop = familyPoint(slotMap.side, "top");
            paths.push(pathFromPoints([[coreTop.x, trunkY], [sideTop.x, trunkY], [sideTop.x, sideTop.y]]));
          }
        }
      }
      if (slotMap.core && slotMap.baby) {
        const coreBottom = familyPoint(slotMap.core, "bottom");
        const babyTop = familyPoint(slotMap.baby, "top");
        paths.push(pathFromPoints([[coreBottom.x, coreBottom.y], [coreBottom.x, babyTop.y], [babyTop.x, babyTop.y]]));
      }
      if (slotMap.side && slotMap.sideKid) {
        const sideBottom = familyPoint(slotMap.side, "bottom");
        const kidTop = familyPoint(slotMap.sideKid, "top");
        paths.push(pathFromPoints([[sideBottom.x, sideBottom.y], [sideBottom.x, kidTop.y], [kidTop.x, kidTop.y]]));
      }
      return paths;
    }
  };
  const singleBranch = {
    slotDefs: [
      { key: "parent", row: 1, col: 3, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Step-aunt", "Weird Uncle"] },
      { key: "left", row: 2, col: 1, span: 2, prefers: ["Weird Uncle", "Step-aunt", "Family Friend Who Won’t Leave", "Cousin"] },
      { key: "core", row: 2, col: 3, span: 2, prefers: ["Twin", "Cousin", "Work Nephew", "Family Friend Who Won’t Leave"] },
      { key: "right", row: 2, col: 5, span: 2, prefers: ["Cousin", "Step-aunt", "Weird Uncle", "Twin"] },
      { key: "child", row: 3, col: 3, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Twin", "Cousin"] },
      { key: "leftChild", row: 3, col: 1, span: 2, prefers: ["Cousin", "Work Nephew", "Baby Somehow", "Twin"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parent) {
        const parentBottom = familyPoint(slotMap.parent, "bottom");
        const lineY = 35;
        const middle = [slotMap.left, slotMap.core, slotMap.right].filter(Boolean);
        if (middle.length) {
          const xs = middle.map((slot) => familyPoint(slot, "top").x).sort((a, b) => a - b);
          paths.push(pathFromPoints([[parentBottom.x, parentBottom.y], [parentBottom.x, lineY], [xs[0], lineY], [xs[xs.length - 1], lineY]]));
          middle.forEach((slot) => {
            const top = familyPoint(slot, "top");
            paths.push(pathFromPoints([[top.x, lineY], [top.x, top.y]]));
          });
        }
      }
      if (slotMap.core && slotMap.child) {
        const coreBottom = familyPoint(slotMap.core, "bottom");
        const childTop = familyPoint(slotMap.child, "top");
        paths.push(pathFromPoints([[coreBottom.x, coreBottom.y], [coreBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      if (slotMap.left && slotMap.leftChild) {
        const leftBottom = familyPoint(slotMap.left, "bottom");
        const childTop = familyPoint(slotMap.leftChild, "top");
        paths.push(pathFromPoints([[leftBottom.x, leftBottom.y], [leftBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      return paths;
    }
  };
  const splitBranch = {
    slotDefs: [
      { key: "parentA", row: 1, col: 2, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Step-aunt"] },
      { key: "parentB", row: 1, col: 4, span: 2, prefers: ["Dad", "Mum", "Legal Guardian Maybe", "Weird Uncle"] },
      { key: "left", row: 2, col: 2, span: 2, prefers: ["Twin", "Cousin", "Weird Uncle", "Family Friend Who Won’t Leave"] },
      { key: "right", row: 2, col: 4, span: 2, prefers: ["Cousin", "Twin", "Step-aunt", "Weird Uncle"] },
      { key: "leftChild", row: 3, col: 1, span: 2, prefers: ["Work Nephew", "Baby Somehow", "Cousin", "Twin"] },
      { key: "rightChild", row: 3, col: 5, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Cousin", "Twin"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parentA && slotMap.parentB) {
        const a = familyPoint(slotMap.parentA, "bottom");
        const b = familyPoint(slotMap.parentB, "bottom");
        const joinY = 18;
        const leftMid = slotMap.left ? familyPoint(slotMap.left, "top") : null;
        const rightMid = slotMap.right ? familyPoint(slotMap.right, "top") : null;
        paths.push(pathFromPoints([[a.x, joinY], [b.x, joinY]]));
        paths.push(pathFromPoints([[a.x, a.y], [a.x, joinY]]));
        paths.push(pathFromPoints([[b.x, b.y], [b.x, joinY]]));
        if (leftMid) paths.push(pathFromPoints([[a.x, joinY], [a.x, 35], [leftMid.x, 35], [leftMid.x, leftMid.y]]));
        if (rightMid) paths.push(pathFromPoints([[b.x, joinY], [b.x, 35], [rightMid.x, 35], [rightMid.x, rightMid.y]]));
      }
      if (slotMap.left && slotMap.leftChild) {
        const leftBottom = familyPoint(slotMap.left, "bottom");
        const childTop = familyPoint(slotMap.leftChild, "top");
        paths.push(pathFromPoints([[leftBottom.x, leftBottom.y], [leftBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      if (slotMap.right && slotMap.rightChild) {
        const rightBottom = familyPoint(slotMap.right, "bottom");
        const childTop = familyPoint(slotMap.rightChild, "top");
        paths.push(pathFromPoints([[rightBottom.x, rightBottom.y], [rightBottom.x, childTop.y], [childTop.x, childTop.y]]));
      }
      return paths;
    }
  };
  const chainBranch = {
    slotDefs: [
      { key: "parent", row: 1, col: 3, span: 2, prefers: ["Mum", "Dad", "Legal Guardian Maybe", "Family Friend Who Won’t Leave"] },
      { key: "core", row: 2, col: 3, span: 2, prefers: ["Twin", "Cousin", "Work Nephew", "Step-aunt"] },
      { key: "left", row: 3, col: 1, span: 2, prefers: ["Cousin", "Weird Uncle", "Step-aunt", "Family Friend Who Won’t Leave"] },
      { key: "baby", row: 3, col: 3, span: 2, prefers: ["Baby Somehow", "Work Nephew", "Twin", "Cousin"] },
      { key: "right", row: 3, col: 5, span: 2, prefers: ["Cousin", "Twin", "Weird Uncle", "Step-aunt"] }
    ],
    buildPaths(slotMap) {
      const paths = [];
      if (slotMap.parent && slotMap.core) {
        const parentBottom = familyPoint(slotMap.parent, "bottom");
        const coreTop = familyPoint(slotMap.core, "top");
        paths.push(pathFromPoints([[parentBottom.x, parentBottom.y], [parentBottom.x, coreTop.y], [coreTop.x, coreTop.y]]));
      }
      if (slotMap.core) {
        const coreBottom = familyPoint(slotMap.core, "bottom");
        const lower = [slotMap.left, slotMap.baby, slotMap.right].filter(Boolean);
        if (lower.length) {
          const xs = lower.map((slot) => familyPoint(slot, "top").x).sort((a, b) => a - b);
          const lineY = 67;
          paths.push(pathFromPoints([[coreBottom.x, coreBottom.y], [coreBottom.x, lineY], [xs[0], lineY], [xs[xs.length - 1], lineY]]));
          lower.forEach((slot) => {
            const top = familyPoint(slot, "top");
            paths.push(pathFromPoints([[top.x, lineY], [top.x, top.y]]));
          });
        }
      }
      return paths;
    }
  };
  if (size <= 4) return [chainBranch, singleBranch];
  if (size === 5) return [duoBranch, singleBranch, chainBranch];
  return [duoBranch, splitBranch, singleBranch, chainBranch];
}

function assignFamilySlots(cluster, assignments, slotDefs) {
  const remaining = [...cluster.characterIds];
  return slotDefs.map((slot) => {
    const pickIndex = remaining.reduce((best, id, index) => {
      const role = assignments[id]?.role || "";
      const preference = slot.prefers.indexOf(role);
      const score = preference === -1 ? 999 : preference;
      const tiebreak = stableHash(`${cluster.id}:${slot.key}:${id}`);
      if (!best || score < best.score || (score === best.score && tiebreak < best.tiebreak)) {
        return { index, score, tiebreak };
      }
      return best;
    }, null);
    const characterId = remaining.splice(pickIndex?.index ?? 0, 1)[0];
    return { ...slot, characterId };
  });
}

function familyPoint(slot, edge) {
  const x = ((slot.col - 1) + (slot.span / 2)) / 6 * 100;
  const rowBands = {
    1: { top: 7, center: 18, bottom: 29 },
    2: { top: 39, center: 50, bottom: 61 },
    3: { top: 71, center: 82, bottom: 93 }
  };
  const band = rowBands[slot.row] || rowBands[2];
  return { x, y: band[edge] ?? band.center };
}

function pathFromPoints(points) {
  return points.map(([x, y], index) => `${index === 0 ? "M" : "L"} ${x} ${y}`).join(" ");
}

// A labelled pain scale from D:< (agony) to :D (fine), over a red-to-green track, with the person's
// level (pain index 0-4, 0 = most pain) highlighted. Used by Disease mode and the woke disease module.
const PAIN_SCALE_FACES = ["D:<", ">:(", ":|", ":)", ":D"];
const PAIN_EXPRESSIONS = ["angry", "sad", "neutral", "happy", "happy"];
function renderPainScale(pain, cid) {
  const faces = PAIN_SCALE_FACES
    .map((f, i) => `<span class="dz-face${i === pain ? " is-here" : ""}" data-pain="${i}">${escapeHtml(f)}</span>`)
    .join("");
  return `<div class="dz-painscale"><span class="dz-painscale-label">PAIN SCALE · drag ↔</span>`
    + `<div class="dz-painscale-faces" data-cid="${cid || ""}">${faces}</div></div>`;
}
// Drag along a pain scale to set that character's pain level - which re-renders their face into the
// matching expression (agony -> angry ... fine -> happy). Updated in place so the drag isn't broken.
function setPain(cid, index) {
  const a = state.global.mystery?.assignments?.[cid];
  if (!a || a.pain === index) return;
  a.pain = index;
  const ch = characterById(cid);
  const card = document.getElementById(`card-${cid}`);
  if (ch && ch.traits && window.faceGenerator) {
    a.image = window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, expression: PAIN_EXPRESSIONS[index] || "neutral" });
    const img = card?.querySelector(".portrait-wrap > img");
    if (img) img.src = a.image;
  }
  card?.querySelectorAll(".dz-painscale-faces .dz-face").forEach((f, i) => f.classList.toggle("is-here", i === index));
}
let painDragCard = null;
function painPointer(e) {
  const under = document.elementFromPoint(e.clientX, e.clientY);
  const scale = under?.closest(".dz-painscale-faces");
  if (!scale || !scale.dataset.cid) return;
  const rect = scale.getBoundingClientRect();
  const t = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
  setPain(scale.dataset.cid, Math.round(t * (PAIN_SCALE_FACES.length - 1)));
}
function wirePainScaleDrag() {
  els.characterBoard.addEventListener("pointerdown", (e) => {
    const scale = e.target.closest(".dz-painscale-faces");
    if (!scale) return;
    e.preventDefault();                                   // stop the card's HTML5 drag / text select
    painDragCard = e.target.closest(".character-card");
    if (painDragCard) painDragCard.draggable = false;     // don't let it start a breed-drag mid-pain-drag
    painPointer(e);
  });
  document.addEventListener("pointermove", (e) => { if (painDragCard) painPointer(e); });
  document.addEventListener("pointerup", () => { if (painDragCard) { painDragCard.draggable = true; painDragCard = null; } });
}

function getMysteryCardData(character) {
  const mystery = state.global.mystery;
  if (!mystery || !mystery.assignments) return { html: "", dataset: {} };
  const assignment = mystery.assignments[character.id];
  if (!assignment) return { html: "", dataset: {} };
  if (mystery.id === "prop-panic") {
    // The prop is WIELDED, not a corner badge: big, plonked somewhere on the person at a hashed
    // angle/position, wobbling on its own beat. The panic loop periodically swaps props around.
    // Hands/torso zone (not plastered over the face): x 14-64%, y 52-78% of the portrait.
    const px = 14 + (stableHash(character.id + ":ppx") % 50);
    const py = 52 + (stableHash(character.id + ":ppy") % 26);
    const rot = -28 + (stableHash(character.id + ":ppr") % 57);
    const dl = -(stableHash(character.id + ":ppd") % 2400) / 1000;
    return {
      effectName: mystery.name,
      primaryText: assignment.value,
      propEmoji: assignment.emoji,
      cardClass: "prop-mode",
      style: `--pp-x:${px}%;--pp-y:${py}%;--pp-rot:${rot}deg;--pp-delay:${dl.toFixed(2)}s`,
      dataset: { mysteryValue: assignment.value },
      html: addMysteryBadge(assignment.value, "prop")
    };
  }
  if (mystery.id === "family-tree-disaster") {
    return {
      effectName: mystery.name,
      dataset: { familyCluster: assignment.clusterId, familyRole: assignment.role },
      html: addMysteryBadge(assignment.role, "family")
    };
  }
  if (mystery.id === "knockoff-manor") {
    return {
      effectName: mystery.name,
      cardClass: "manor-guest",
      dataset: { houseRoom: assignment.roomName },
      html: addMysteryBadge(assignment.roomName, "room")
    };
  }
  if (mystery.id === "emotional-audit") {
    return {
      effectName: mystery.name,
      dataset: { emotionMeter: assignment.meter, emotionValue: String(assignment.value) },
      html: `<span class="emotion-meter"><span>${escapeHtml(assignment.meter)}: ${assignment.value}%</span><i style="--meter:${assignment.value}%"></i></span>`
    };
  }
  if (mystery.id === "vibe-labels") {
    return {
      effectName: mystery.name,
      dataset: { mysteryValue: assignment.value },
      html: addMysteryBadge(assignment.value, "vibe")
    };
  }
  if (mystery.id === "role-reveal") {
    return {
      effectName: mystery.name,
      dataset: { mysteryValue: assignment.value },
      html: addMysteryBadge(assignment.value, "role")
    };
  }
  if (mystery.id === "pantone") {
    return {
      effectName: mystery.name,
      cardClass: "pantone-mode",
      dataset: { pantoneName: assignment.name, pantoneCode: assignment.code },
      html: `<span class="pt-code">${escapeHtml(assignment.code)} TCX</span><span class="pt-name">${escapeHtml(assignment.name)}</span>`
    };
  }
  if (mystery.id === "horny-potter") {
    const genderCls = { MALE: "g-male", FEMALE: "g-female", ASIAN: "g-asian", ETHNIC: "g-ethnic" }[assignment.gender] || "g-male";
    const smoke = (assignment.role === "deatheater" || assignment.role === "darklord")
      ? `<span class="hp-smoke" aria-hidden="true"><i></i><i></i><i></i></span>` : "";
    return {
      effectName: mystery.name,
      cardClass: `hp-mode hp-${assignment.role}`,
      image: assignment.image || undefined,
      style: `--hp-color:${assignment.color};--smoke-delay:${assignment.smokeDelay || 0}s`,
      dataset: { hpHouse: assignment.house, hpSpell: assignment.spell, hpGender: assignment.gender },
      cornerHtml: smoke + `<span class="hp-gender ${genderCls}">${escapeHtml(assignment.gender)}</span>`,
      html: `<div class="hp-tag"><span class="hp-crest">${assignment.crest}</span> ${escapeHtml(assignment.house)}</div>`
        + `<table class="hp-sheet"><tbody>`
        + `<tr><th>Wand</th><td>${escapeHtml(assignment.wand)}</td></tr>`
        + `<tr class="hp-spell-row"><th>Fav Spell</th><td><b>${escapeHtml(assignment.spell)}</b> — ${escapeHtml(assignment.spellHint)}</td></tr>`
        + (assignment.horcrux
          ? `<tr class="hp-horcrux-row"><th>Horcrux</th><td>${escapeHtml(assignment.horcrux)}</td></tr>`
          : `<tr><th>Patronus</th><td>${escapeHtml(assignment.patronus)}</td></tr>`
            + `<tr><th>Boggart</th><td>${escapeHtml(assignment.boggart)}</td></tr>`)
        + `</tbody></table>`
    };
  }
  if (mystery.id === "hidden-agendas") {
    const side = assignment.party === "Democrat" ? "dem" : "rep";
    const st = assignment.stances || { for: [], against: [] };
    return {
      effectName: mystery.name,
      cardClass: `agenda-${side}`,
      image: assignment.image || undefined,
      propEmoji: assignment.emoji,
      primaryText: `${assignment.party} · ${assignment.state} · ${assignment.mood}`,
      dataset: { agendaParty: assignment.party, agendaState: assignment.state, agendaMood: assignment.mood },
      cornerHtml: assignment.converted ? `<span class="pol-converted">CONVERTED</span>` : "",
      html: `${addMysteryBadge(assignment.party, `agenda-${side}`)}${addMysteryBadge(assignment.state, "agenda-state")}`
        + `<div class="ha-stances">`
        + `<div class="ha-for"><b>FOR:</b> ${st.for.map(escapeHtml).join(", ")}</div>`
        + `<div class="ha-against"><b>AGAINST:</b> ${st.against.map(escapeHtml).join(", ")}</div>`
        + `</div>`
    };
  }
  if (mystery.id === "witness-protection-filter") {
    // Per-character delay + speed so the CCTV cams cut at different moments and paces - a wall of
    // synced cameras reads as one predictable loop; desynced ones read as genuinely chaotic.
    const camDelay = -(stableHash(character.id + ":cam") % 5200) / 1000;
    const camDur = 3.6 + (stableHash(character.id + ":camdur") % 3200) / 1000;
    return {
      effectName: mystery.name,
      cardClass: assignment.className,
      dataset: { mysteryValue: assignment.value },
      style: `--cam-delay:${camDelay.toFixed(2)}s;--cam-dur:${camDur.toFixed(2)}s`,
      cornerHtml: `<span class="wp-pixel" aria-hidden="true"></span>`,   // pixelated censor over the chest
      html: assignment.reason ? `<div class="wp-reason">🚨 <b>WANTED:</b> ${escapeHtml(assignment.reason)}</div>` : ""
    };
  }
  if (mystery.id === "monocultural") {
    return {
      effectName: mystery.name,
      image: assignment.image || undefined,
      html: ""
    };
  }
  if (mystery.id === "gay-frogged") {
    const cornerHtml = `<div class="gayfrog-corner">${assignment.letters.map((l) => `<span class="gayfrog-letter">${escapeHtml(l)}</span>`).join("")}</div>`;
    const titleBadge = assignment.title ? addMysteryBadge(assignment.title, "gayfrog-badge gayfrog-word") : "";
    // A per-tile negative animation-delay (0 to -6s) so the pulsing rainbow background on each card is
    // offset from its neighbours - the board shimmers rather than strobing in unison.
    const pulseDelay = -(stableHash(character.id + ":pulse") % 6000) / 1000;
    return {
      effectName: mystery.name,
      cardClass: `gayfrog gayfrog-${assignment.key}`,
      dataset: { gayfrogColor: assignment.color },
      style: `--glow:${assignment.color};--pulse-delay:${pulseDelay.toFixed(2)}s`,
      image: assignment.image || undefined,
      cornerHtml,
      pronoun: assignment.pronoun,
      html: titleBadge
    };
  }
  if (mystery.id === "face-first") {
    return {
      effectName: mystery.name,
      cardClass: "facefirst",
      html: ""
    };
  }
  if (mystery.id === "disguise") {
    return {
      effectName: mystery.name,
      cardClass: "disguise",
      image: assignment.image || undefined,
      html: `<div class="dg-arabic" dir="rtl">${escapeHtml(assignment.arabic || "")}</div>`
        + `<div class="dg-phon">${escapeHtml(assignment.phon || "")}</div>`
    };
  }
  if (mystery.id === "woke") {
    const a = assignment;
    const M = window.GameData.drugMethods;
    const tierCls = { MINOR: "dz-minor", MAJOR: "dz-major", MEGA: "dz-mega" };
    const has = (m) => a.modules && a.modules.includes(m);

    // --- Corners: each module keeps the signature badge from its home mode. LBGT letter chips go
    //     top-left (like Gay-Frogged); every other badge stacks top-right in .woke-badges. ---
    const prideCorner = has("gay")
      ? `<div class="gayfrog-corner">${a.gay.letters.map((l) => `<span class="gayfrog-letter">${escapeHtml(l)}</span>`).join("")}</div>`
      : "";
    const badges = [];
    if (has("orgy")) badges.push(`<span class="orgy-pos">${escapeHtml(a.orgy.pos)}</span>`);
    if (has("drugs")) badges.push(`<span class="dg-count">${a.drugs.habits.length}× hooked</span>`);
    if (has("fertility")) badges.push(`<span class="ft-timer">⏳ ${a.fertility.hrs}h ${a.fertility.mins}m</span>`);
    if (has("work")) badges.push(`<span class="wk-days">${a.work.days}d</span>`);
    const cornerHtml = prideCorner + (badges.length ? `<div class="woke-badges">${badges.join("")}</div>` : "");

    // --- Body: each module rendered with its home mode's own markup/classes, stacked. ---
    const blocks = [];
    if (has("gay")) {
      const tags = [...(stableHash(character.id + ":poc") % 3 === 0 ? ["POC"] : []), ...characterTags(character)];
      blocks.push(`<div class="woke-block woke-gay">`
        + `<p class="card-pronouns">${escapeHtml(a.gay.pronoun)}</p>`
        + `<div class="card-grindr-tags">${tags.map((t) => `<span class="grindr-tag">${escapeHtml(t)}</span>`).join("")}</div>`
        + `<span class="mystery-badge gayfrog-badge gayfrog-word">${escapeHtml(a.gay.title)}</span></div>`);
    }
    if (has("orgy")) {
      const o = a.orgy;
      const bar = (label, n) => `<span class="orgy-bar"><b>${label}</b><i><s style="--n:${n * 10}%"></s></i></span>`;
      blocks.push(`<div class="orgy-stats">`
        + `<div class="orgy-cum"><span>💦 ${o.cumToday} today</span><span>${o.cumLifetime.toLocaleString()} life</span></div>`
        + `${bar("STAMINA", o.stamina)}${bar("HORNY", o.horniness)}${bar("LIFESPAN", o.lifespan)}${bar("SECRETS", o.secrets)}</div>`);
    }
    if (has("drugs")) {
      const rows = a.drugs.habits.map((d) => `<span class="dg-row"><b>${escapeHtml(d.name)}</b><i>${M[d.method] || d.method}</i></span>`).join("");
      blocks.push(`<div class="dg-sheet">${rows}<div class="dg-daily">~${a.drugs.daily}/day</div></div>`);
    }
    if (has("disease")) {
      const d = a.disease;
      const pills = d.diseases.map((x) => `<span class="dz-pill ${tierCls[x.tier]}">${escapeHtml(x.tier)} · ${escapeHtml(x.name)}</span>`).join("");
      const cancers = d.cancers.length
        ? `<div class="dz-cancers"><b>🎗 Cancers:</b> ${d.cancers.map((c) => `${escapeHtml(c.type)} <i>(${escapeHtml(c.eta)})</i>`).join(", ")}</div>`
        : "";
      const meds = `<div class="dz-meds"><b>💊 Meds:</b> ${d.meds.map(escapeHtml).join(", ")}</div>`;
      blocks.push(`<div class="dz-sheet">${renderPainScale(d.pain)}<div class="dz-pills">${pills}</div>`
        + `<div class="dz-bar"><b>AUTISM</b><i><s style="--n:${Math.round(d.autism * 100)}%"></s></i><u>${Math.round(d.autism * 100)}%</u></div>`
        + `${cancers}${meds}</div>`);
    }
    if (has("fertility")) {
      const f = a.fertility;
      const defect = f.defect ? `<div class="ft-defect">⚠ ${escapeHtml(f.defect)}</div>` : "";
      blocks.push(`<div class="ft-sheet">`
        + `<div class="ft-row"><b>💦</b><i>${escapeHtml(f.cum)}</i></div>`
        + `<div class="ft-row"><b>🥚</b><i>${f.barren ? '<span class="ft-barren">BARREN</span>' : f.eggs}</i></div>${defect}</div>`);
    }
    if (has("work")) {
      blocks.push(`<div class="wk-sheet"><div class="wk-sentence">⛏ ${a.work.days} DAYS REMAINING</div>`
        + `<div class="wk-stash"><b>STASH:</b> ${a.work.items.map(escapeHtml).join(", ")}</div></div>`);
    }
    if (has("disguise")) blocks.push(`<div class="woke-line">🕶 <i>incognito</i></div>`);
    // A woke baby wears whatever the identity reels landed on.
    if (character.wokeIdentity) {
      const w = character.wokeIdentity;
      blocks.unshift(`<div class="woke-id">🎰 ${escapeHtml(w.pronouns)} · ${escapeHtml(w.gender)} · ${escapeHtml(w.ethnicity)}</div>`);
    }

    const pulseDelay = -(stableHash(character.id + ":pulse") % 6000) / 1000;
    return {
      effectName: mystery.name,
      cardClass: has("gay") ? "woke has-pride" : "woke",
      image: a.image || undefined,
      style: `--glow:${a.glow};--pulse-delay:${pulseDelay.toFixed(2)}s`,
      dataset: a.orgy ? { wokePos: a.orgy.pos } : {},
      cornerHtml,
      html: `<div class="woke-sheet">${blocks.join("")}</div>`
    };
  }
  if (mystery.id === "work") {
    const a = assignment;
    return {
      effectName: mystery.name,
      cardClass: "work",
      image: a.image || undefined,
      cornerHtml: `<span class="wk-days" title="days remaining">${a.days}d</span>`,
      html: `<div class="wk-sheet">
        <div class="wk-sentence">⛏ ${a.days} DAYS REMAINING</div>
        <div class="wk-stash"><b>STASH:</b> ${a.items.map(escapeHtml).join(", ")}</div>
      </div>`
    };
  }
  if (mystery.id === "fertility") {
    const a = assignment;
    const fresh = a.freshMeat ? `<div class="ft-fresh">🥩 FRESH MEAT</div>` : "";
    const defect = a.defect ? `<div class="ft-defect">⚠ ${escapeHtml(a.defect)}</div>` : "";
    const countRow = a.hasCount ? `<div class="ft-row"><b>💦</b><i>${escapeHtml(a.cum)}</i></div>` : "";
    const eggsRow = a.hasEggs ? `<div class="ft-row"><b>🥚</b><i>${a.barren ? '<span class="ft-barren">BARREN</span>' : a.eggs}</i></div>` : "";
    return {
      effectName: mystery.name,
      cardClass: `fertility ${a.freshMeat ? "is-fresh" : ""}`.trim(),
      cornerHtml: `<span class="ft-timer" title="next emptying">⏳ ${a.hrs}h ${a.mins}m</span>`,
      html: `<div class="ft-sheet">${fresh}${countRow}${eggsRow}${defect}</div>`
    };
  }
  if (mystery.id === "disease") {
    const a = assignment;
    const tierCls = { MINOR: "dz-minor", MAJOR: "dz-major", MEGA: "dz-mega" };
    const pills = a.diseases.map((d) => `<span class="dz-pill ${tierCls[d.tier]}">${escapeHtml(d.tier)} · ${escapeHtml(d.name)}</span>`).join("");
    const cancers = a.cancers.length
      ? `<div class="dz-cancers"><b>🎗 Cancers:</b> ${a.cancers.map((c) => `${escapeHtml(c.type)} <i>(${escapeHtml(c.eta)})</i>`).join(", ")}</div>`
      : "";
    const meds = `<div class="dz-meds"><b>💊 Meds:</b> ${a.meds.map(escapeHtml).join(", ")}</div>`;
    return {
      effectName: mystery.name,
      cardClass: `disease ${a.patientZero ? "patient-zero" : ""}`.trim(),
      dataset: { dzPregnant: String(a.pregnant) },
      image: a.image || undefined,
      cornerHtml: a.patientZero ? `<span class="pz-badge">☣ PATIENT ZERO!</span>` : "",
      html: `<div class="dz-sheet">
        ${renderPainScale(a.pain, character.id)}
        <div class="dz-pills">${pills}</div>
        <div class="dz-bar"><b>AUTISM</b><i><s style="--n:${Math.round(a.autism * 100)}%"></s></i><u>${Math.round(a.autism * 100)}%</u></div>
        ${cancers}${meds}
      </div>`
    };
  }
  if (mystery.id === "drugs") {
    const a = assignment;
    const M = window.GameData.drugMethods;
    const rows = a.habits.map((d) => `<span class="dg-row"><b>${escapeHtml(d.name)}</b><i>${M[d.method] || d.method}</i></span>`).join("");
    return {
      effectName: mystery.name,
      cardClass: "drugs",
      image: a.image || undefined,
      cornerHtml: `<span class="dg-count" title="habits">${a.habits.length}× hooked</span>`,
      html: `<div class="dg-sheet">${rows}<div class="dg-daily">~${a.daily}/day</div></div>`
    };
  }
  if (mystery.id === "orgy") {
    const a = assignment;
    const bar = (label, n) => `<span class="orgy-bar"><b>${label}</b><i><s style="--n:${n * 10}%"></s></i></span>`;
    return {
      effectName: mystery.name,
      cardClass: "orgy",
      image: a.image,
      dataset: { orgyPos: a.pos },
      cornerHtml: `<span class="orgy-pos">${escapeHtml(a.pos)}</span><span class="orgy-bodycount" title="body count">🍆 ${a.bodyCount}</span>`,
      html: `<div class="orgy-stats">
        <div class="orgy-cum"><span>💦 ${a.cumToday} today</span><span>${a.cumLifetime.toLocaleString()} life</span></div>
        ${bar("STAMINA", a.stamina)}${bar("HORNY", a.horniness)}${bar("LIFESPAN", a.lifespan)}${bar("SECRETS", a.secrets)}
        <div class="orgy-links">🔗 ${escapeHtml(a.partners.join(", ") || "untouched")}</div>
        <div class="orgy-upnext"><b>UP NEXT:</b> ${escapeHtml(a.upNext)}</div>
      </div>`
    };
  }
  if (mystery.id === "yugioh") {
    const a = assignment;
    const isMonster = a.frame !== "spell" && a.frame !== "trap";
    const orbKey = isMonster ? a.attr : (a.frame === "spell" ? "SPELL" : "TRAP");
    const orbGlyph = { DARK: "🌙", LIGHT: "☀", FIRE: "🔥", WATER: "💧", EARTH: "⛰", WIND: "🌪", SPELL: "✦", TRAP: "⊘" }[orbKey] || "★";
    const stars = isMonster
      ? `<span class="ygo-stars" aria-label="Level ${a.level}">${'<i class="ygo-star">★</i>'.repeat(a.level)}</span>`
      : `<span class="ygo-kind">${escapeHtml(a.kind)}</span>`;
    const cornerHtml = `<span class="ygo-orb" data-attr="${orbKey}" title="${escapeHtml(orbKey)}">${orbGlyph}</span>`;
    const footer = isMonster
      ? `<span class="ygo-stat">ATK/${a.atk}</span><span class="ygo-stat">DEF/${a.def}</span>`
      : "";
    return {
      effectName: mystery.name,
      cardClass: `ygo ygo-${a.frame}`,
      dataset: { ygoAttr: orbKey },
      cornerHtml: `${cornerHtml}<span class="ygo-toprow">${stars}</span>`,
      html: `<span class="ygo-typeline">${escapeHtml(a.typeLine)}</span>${footer ? `<span class="ygo-footer">${footer}</span>` : ""}`
    };
  }
  if (mystery.id === "swipe") {
    const a = assignment;
    const tick = a.verified ? ' <span class="sw-tick" title="verified">✔</span>' : "";
    const unread = a.unread ? `<span class="sw-unread" title="unread messages">💬 ${a.unread}</span>` : "";
    return {
      effectName: mystery.name,
      cardClass: "swipe",
      // Name / age / distance overlay directly on the "profile photo", Tinder-style.
      cornerHtml: `<span class="sw-match" title="match">🔥 ${a.match}%</span>${unread}`
        + `<div class="sw-photo-label">`
        + `<div class="sw-name">${escapeHtml(displayName(character))} <span class="sw-age">${a.age}</span>${tick}</div>`
        + `<div class="sw-dist"><span class="sw-online"></span> ${a.distance} km away · <i>active now</i></div>`
        + `</div>`,
      html: `<div class="sw-sheet">
        <div class="sw-bio">"${escapeHtml(a.bio)}"</div>
        <div class="sw-look">🔎 ${escapeHtml(a.lookingFor)}</div>
        <div class="sw-flagrow">
          <span class="sw-flag sw-green">💚 ${escapeHtml(a.green)}</span>
          <span class="sw-flag sw-red">🚩 ${escapeHtml(a.red)}</span>
        </div>
        <div class="sw-ick">😬 <b>The ick:</b> ${escapeHtml(a.ick)}</div>
      </div>`
    };
  }
  if (mystery.id === "judgement") {
    const a = assignment;
    const glyph = a.mega ? "👹" : { HEAVEN: "😇", HELL: "😈" }[a.verdict];
    const label = a.mega ? "MEGA HELL" : { HEAVEN: "HEAVEN", HELL: "HELL" }[a.verdict];
    const crown = {
      HEAVEN: '<svg class="jd-halo" viewBox="0 0 64 22"><ellipse cx="32" cy="11" rx="27" ry="7.5"/></svg>',
      HELL: '<svg class="jd-horns" viewBox="0 0 62 34"><path class="horn" d="M21 34 C 8 25 5 9 14 2 C 13 13 17 25 25 31 Z"/><path class="horn" d="M41 34 C 54 25 57 9 48 2 C 49 13 45 25 37 31 Z"/></svg>'
    }[a.verdict];
    const meter2Label = { HEAVEN: "BLISS", HELL: "TORMENT" }[a.verdict];
    const meter2Cls = { HEAVEN: "rct-good", HELL: "rct-bad" }[a.verdict];
    const money = a.wealth != null ? `${a.wealth < 0 ? "-§" + Math.abs(a.wealth).toLocaleString() : "§" + a.wealth.toLocaleString()}` : "";
    const where = a.verdict === "HELL"
      ? `${escapeHtml(a.location)} · <b>${a.mega ? "🔥 MEGA HELL" : "Circle " + a.layer}</b>`
      : `${escapeHtml(a.location)} · <b>Tier ${a.layer}${money ? " · " + money : ""}</b>`;
    const bar = (lbl, n, cls) => `<span class="rct-bar"><b>${lbl}</b><i><s class="${cls}" style="--n:${n}%"></s></i></span>`;
    // HELL: individual flame tongues, each with its own position / height / flicker timing (hashed
    // per character+index so no two demons burn alike), split behind and in front of the body.
    let flames = "";
    if (a.verdict === "HELL") {
      const mk = (i, front) => {
        const s = `${character.id}:fl${front ? "f" : "b"}${i}`;
        const x = 3 + (stableHash(s + "x") % 90);
        const d = -(stableHash(s + "d") % 900) / 1000;
        const dur = (55 + (stableHash(s + "u") % 55)) / 100;
        const h = front ? 18 + (stableHash(s + "h") % 22) : 26 + (stableHash(s + "h") % 40);
        const w = front ? 10 + (stableHash(s + "w") % 8) : 14 + (stableHash(s + "w") % 12);
        return `<i class="jd-flame" style="--fx:${x}%;--fd:${d.toFixed(2)}s;--fu:${dur.toFixed(2)}s;--fh:${h}px;--fw:${w}px"></i>`;
      };
      let back = "", frontF = "";
      for (let i = 0; i < 7; i++) back += mk(i, false);
      for (let i = 0; i < 4; i++) frontF += mk(i, true);
      flames = `<span class="jd-flames jd-flames-back" aria-hidden="true">${back}</span>`
        + `<span class="jd-flames jd-flames-front" aria-hidden="true">${frontF}</span>`;
    }
    return {
      effectName: mystery.name,
      cardClass: `judgement jd-${a.verdict.toLowerCase()}${a.mega ? " jd-mega" : ""}`,
      dataset: { verdict: a.verdict },
      image: a.image || undefined,
      cornerHtml: flames
        + `<span class="jd-verdict">${glyph} ${label}</span>`
        + `<span class="jd-crown" aria-hidden="true">${crown}</span>`,
      html: `<div class="jd-sheet">
        <div class="jd-loc">📍 ${where}</div>
        <div class="jd-thought">💭 <i>"${escapeHtml(a.thought)}"</i></div>
        ${bar("HAPPINESS", a.happiness, "rct-happy")}
        ${bar(meter2Label, a.meter2, meter2Cls)}
      </div>`
    };
  }
  if (mystery.id === "heads-only") {
    return { effectName: mystery.name, cardClass: "heads-secret", image: assignment.image || undefined, html: "" };
  }
  if (mystery.id === "astrology") {
    const a = assignment;
    const retro = a.retro ? `<div class="astro-retro">☿ Mercury retrograde</div>` : "";
    return {
      effectName: mystery.name,
      cardClass: `astrology astro-${a.element.toLowerCase()}`,
      cornerHtml: `<span class="astro-glyph" title="${escapeHtml(a.sun.name)}">${a.sun.glyph}</span>`,
      html: `<div class="astro-sheet">
        <div class="astro-sign">${a.sun.glyph} <b>${escapeHtml(a.sun.name)}</b> · ${escapeHtml(a.element)}</div>
        <div class="astro-big">☀${a.sun.glyph} ☾${a.moon} ↑${a.rising}</div>
        <div class="astro-horo">🔮 <i>"${escapeHtml(a.horoscope)}"</i></div>
        <div class="astro-toxic">🚩 ${escapeHtml(a.toxic)}</div>
        ${retro}
      </div>`
    };
  }
  if (mystery.id === "habbo") {
    return { effectName: mystery.name, cardClass: "habbo-secret", image: assignment.head || undefined, html: "" };
  }
  if (mystery.id === "sims") {
    const a = assignment;
    const bar = (label, n, need) => {
      const cls = n < 25 ? "sim-crit" : n < 55 ? "sim-warn" : "sim-ok";
      return `<span class="sim-bar" data-need="${need}"><b>${label}</b><i><s class="${cls}" style="--n:${n}%"></s></i></span>`;
    };
    const money = a.simoleons < 0 ? `-§${Math.abs(a.simoleons).toLocaleString()}` : `§${a.simoleons.toLocaleString()}`;
    // A real CSS-3D square bipyramid (8 triangular faces) that genuinely rotates in 3D - so side faces
    // stay visible as it turns instead of squashing to a flat line like the old SVG.
    const plumbob = `<span class="sim-plumbob" data-mood="${a.mood}" aria-label="mood: ${a.mood}">`
      + `<span class="pb3d">`
      + `<b class="pf pt0"></b><b class="pf pt1"></b><b class="pf pt2"></b><b class="pf pt3"></b>`
      + `<b class="pf pb0"></b><b class="pf pb1"></b><b class="pf pb2"></b><b class="pf pb3"></b>`
      + `</span></span>`;
    return {
      effectName: mystery.name,
      cardClass: `sims sim-${a.mood}`,
      image: a.image || undefined,
      style: a.bg ? `--sim-bg:${a.bg}` : undefined,
      cornerHtml: plumbob
        + `<span class="sim-cash" title="simoleons">${money}</span>`,
      html: `<div class="sim-sheet">
        <div class="sim-action">💬 <i>${escapeHtml(a.action)}…</i></div>
        ${bar("HUNGER", a.needs.hunger, "hunger")}${bar("SOCIAL", a.needs.social, "social")}${bar("BLADDER", a.needs.bladder, "bladder")}${bar("FUN", a.needs.fun, "fun")}
        <div class="sim-career">💼 ${escapeHtml(a.career)}</div>
      </div>`
    };
  }
  return { html: "", dataset: {} };
}

function addMysteryBadge(text, type) {
  return `<span class="mystery-badge ${type}">${escapeHtml(text)}</span>`;
}

// Yu-Gi-Oh! mode: every character becomes a duel card - Normal/Effect monster, Spell or Trap, with
// an attribute orb, level stars, type line and ATK/DEF. Deterministic per character + game salt.
function applyYugioh(effect) {
  const monsterTypes = ["Spellcaster", "Warrior", "Dragon", "Beast", "Fiend", "Fairy", "Machine", "Zombie", "Aqua", "Pyro", "Rock", "Insect", "Dinosaur", "Sea Serpent", "Psychic", "Beast-Warrior", "Winged Beast", "Reptile"];
  const attrs = ["DARK", "LIGHT", "FIRE", "WATER", "EARTH", "WIND"];
  const spellKinds = ["Normal", "Quick-Play", "Continuous", "Field", "Equip"];
  const trapKinds = ["Normal", "Continuous", "Counter"];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:ygo:${ch.id}`);
    const roll = h % 100;
    let frame;
    if (roll < 30) frame = "normal";
    else if (roll < 62) frame = "effect";
    else if (roll < 80) frame = "spell";
    else if (roll < 95) frame = "trap";
    else if (roll < 98) frame = "fusion";
    else frame = "ritual";
    const a = { frame };
    if (frame === "spell" || frame === "trap") {
      a.kind = (frame === "spell" ? spellKinds : trapKinds)[(h >>> 3) % (frame === "spell" ? spellKinds.length : trapKinds.length)];
      a.typeLine = frame === "spell" ? "[Spell Card]" : "[Trap Card]";
    } else {
      a.attr = attrs[(h >>> 5) % attrs.length];
      a.level = 1 + ((h >>> 7) % 8);
      a.mtype = monsterTypes[(h >>> 11) % monsterTypes.length];
      const base = 300 + ((h >>> 9) % 10) * 200 + a.level * 200;
      a.atk = Math.min(3000, Math.round(base / 50) * 50);
      a.def = Math.min(3000, Math.round((base * 0.78 + ((h >>> 13) % 6) * 100) / 50) * 50);
      const tag = frame === "fusion" ? "Fusion/Effect" : frame === "ritual" ? "Ritual/Effect" : frame === "effect" ? "Effect" : "Normal";
      a.typeLine = `[${a.mtype}/${tag}]`;
    }
    assignments[ch.id] = a;
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Fertility Mode: a reproductive readout - cum count (millions/billions), egg count (10s-100s, some
// barren), a countdown to next "emptying", and a product-defect warning. Comedy stats on avatars.
function applyFertility(effect) {
  const defects = ["CHROMOSOMAL SURPLUS", "BATTERY FARM EGGS", "SLOW SWIMMERS", "CRACK BABIES IMMINENT",
    "TADPOLE QUALITY: POOR", "EXPIRED STOCK", "TWO-HEADED RISK", "GENETIC LUCKY DIP",
    "RECALLED BATCH", "SUSPICIOUSLY KEEN", "ALL DUDS", "PREMIUM GRADE (allegedly)"];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:fert:${ch.id}`);
    // Each person produces eggs OR cummies; a rare few make both.
    const r = (h >>> 17) % 100;
    const hasBoth = r < 8;
    const hasCount = hasBoth || r < 54;
    const hasEggs = hasBoth || r >= 54;
    const billions = (h >>> 2) % 4 === 0;
    const cum = billions
      ? (1 + ((h >>> 4) % 40) / 10).toFixed(1) + "B"
      : (50 + ((h >>> 4) % 900)) + "M";
    const barren = hasEggs && (h >>> 9) % 6 === 0;
    const eggs = barren ? 0 : 8 + ((h >>> 6) % 320);
    const hrs = (h >>> 11) % 72;
    const mins = (h >>> 13) % 60;
    const defect = ((h >>> 15) % 3 === 0)
      ? defects[stableHash(`${state.gameSalt}:fdef:${ch.id}`) % defects.length]
      : null;
    assignments[ch.id] = { cum, eggs, barren, hrs, mins, defect, hasCount, hasEggs };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// WOKE Mode: a chaotic mix-and-match of every other stat mode. Each character rolls a RANDOM SUBSET
// (2-3) of modules and, for each, gets the SAME data a real card in that mode would - so the woke card
// can be rendered with each mode's own visual treatment (LBGT letter chips, orgy bars, disease pills,
// pain-face corner, fertility timer, work sentence, disguise). Not Yu-Gi-Oh.
const WOKE_MODULES = ["gay", "orgy", "drugs", "disease", "fertility", "work", "disguise"];
// Rainbow-dye a portrait's hair for the woke "gay" module: every hair lock takes a different pride
// colour (with matching shade/shine so it still reads as hair), and the base silhouette is dyed too.
const WOKE_RAINBOW = ["#e40303", "#ff8c00", "#ffd400", "#28a745", "#3a86ff", "#8338ec"];
function wokeRainbowHair(traits) {
  const base = { hairHex: WOKE_RAINBOW[0] };
  if (!Array.isArray(traits.hairLocks) || !traits.hairLocks.length) return base;
  base.hairLocks = traits.hairLocks.map((l, i) => {
    const c = WOKE_RAINBOW[i % WOKE_RAINBOW.length];
    return { ...l, fill: c, dark: mixHex(c, "#180418", 0.42), shine: mixHex(c, "#ffffff", 0.42) };
  });
  return base;
}
function applyWoke(effect) {
  const D = window.GameData;
  const positions = ["TOP", "BOTTOM", "SIDE", "GAGGED", "CHOKING", "VERS", "POWER BOTTOM", "STARFISH"];
  const glows = ["#ff4d6d", "#ff9e3a", "#ffe23a", "#4dd46a", "#3aa0ff", "#a05aff", "#ff5ad0"];
  const defects = ["SLOW SWIMMERS", "EXPIRED STOCK", "TWO-HEADED RISK", "RECALLED BATCH", "ALL DUDS", "PREMIUM (allegedly)"];
  const stash = (D && D.workInventory) || ["Shiv"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:wk:${salt}`) % arr.length];
  // Special Disguise flattens the vibe when everyone's covered, so cap it at a COUPLE of people:
  // only the two lowest-hashed board members are ever allowed to roll it.
  const disguiseOk = new Set(
    deterministicOrder(state.board, `${state.gameSalt}:woke:disg`).slice(0, 2).map((c) => c.id)
  );
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:woke:${ch.id}`);
    // Deterministic shuffle of the module list, then take 2-3 for this character.
    const order = WOKE_MODULES
      .map((m) => [m, stableHash(`${state.gameSalt}:wkmod:${ch.id}:${m}`)])
      .sort((a, b) => a[1] - b[1])
      .map((x) => x[0]);
    let mods = order.slice(0, 2 + (h % 2));
    if (mods.includes("disguise") && !disguiseOk.has(ch.id)) mods = mods.filter((m) => m !== "disguise");
    const has = (m) => mods.includes(m);
    const a = { modules: mods };

    // Gay-Frogged: LBGT letter(s), a pride colour, pronoun, and an orientation title.
    if (has("gay")) {
      const L = PRIDE_LETTERS_POOL[(h >>> 3) % PRIDE_LETTERS_POOL.length];
      a.gay = {
        letters: L.letters, key: L.key, color: L.color,
        pronoun: PRIDE_PRONOUNS_POOL[(h >>> 6) % PRIDE_PRONOUNS_POOL.length],
        title: PRIDE_TITLES_POOL[(h >>> 9) % PRIDE_TITLES_POOL.length]
      };
    }
    a.glow = a.gay ? a.gay.color : glows[h % glows.length];

    // Orgy: position, body count, today's/lifetime cum, and the four stat bars.
    if (has("orgy")) {
      const stat = (salt) => 1 + (stableHash(`${state.gameSalt}:wko:${ch.id}:${salt}`) % 10);
      a.orgy = {
        pos: positions[(h >>> 5) % positions.length],
        bodyCount: 2 + ((h >>> 3) % 187),
        cumToday: (h >>> 5) % 14,
        cumLifetime: 150 + ((h >>> 7) % 9850),
        stamina: stat("sta"), horniness: stat("hor"), lifespan: stat("life"), secrets: stat("sec")
      };
    }
    // Drug Addict: 1-2 street-name habits + how they take each, plus a daily count.
    if (has("drugs")) {
      const n = 1 + ((h >>> 6) % 2);
      const habits = [];
      for (let k = 0; k < n; k++) {
        const dr = pick(D.drugs, `${ch.id}:dg${k}`);
        if (!habits.some((x) => x.name === dr[0])) habits.push({ name: dr[0], method: dr[1] });
      }
      a.drugs = { habits, daily: 1 + ((h >>> 5) % 40) };
    }
    // Disease: 1-2 diagnoses (with severity), a possible cancer, meds, an autism %, and a pain face.
    if (has("disease")) {
      const diseases = [];
      const dn = 1 + (h % 2);
      for (let k = 0; k < dn; k++) {
        const dz = pick(D.diseases, `${ch.id}:dz${k}`);
        if (!diseases.some((x) => x.name === dz[0])) diseases.push({ name: dz[0], tier: dz[1] });
      }
      const cancers = [];
      if ((h >>> 9) % 3 === 0) cancers.push({ type: pick(D.cancerTypes, `${ch.id}:c`), eta: pick(D.cancerEtas, `${ch.id}:e`) });
      a.disease = {
        diseases, cancers, meds: [pick(D.medications, `${ch.id}:m`)],
        autism: ((h >>> 3) % 101) / 100, pain: (h >>> 11) % D.painFaces.length
      };
    }
    // Fertility: a cum count, an egg count (or BARREN), a next-emptying timer, and a possible defect.
    if (has("fertility")) {
      const barren = (h >>> 11) % 5 === 0;
      const billions = (h >>> 2) % 4 === 0;
      a.fertility = {
        cum: billions ? (1 + ((h >>> 4) % 40) / 10).toFixed(1) + "B" : (50 + ((h >>> 4) % 900)) + "M",
        eggs: barren ? 0 : 8 + ((h >>> 6) % 320), barren,
        hrs: (h >>> 13) % 72, mins: (h >>> 15) % 60,
        defect: ((h >>> 17) % 3 === 0) ? defects[(h >>> 19) % defects.length] : null
      };
    }
    // Work: a days-remaining sentence and a stash item.
    if (has("work")) {
      a.work = { days: 1 + (h % 9000), items: [stash[(h >>> 4) % stash.length]] };
    }

    // Image: a disguised covering when that module rolled, otherwise the bare-shouldered woke portrait.
    // Gay module => full RAINBOW HAIR (each hair lock a different pride colour, base dyed too).
    if (ch.traits && window.faceGenerator) {
      const R = (extra) => window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, ...extra });
      const pride = has("gay") ? wokeRainbowHair(ch.traits) : {};
      a.image = has("disguise")
        ? (ch.pronouns === "she"
          ? R({ disguise: true })
          : R({ hair: "bald", hairLocks: [], beardLength: 0, accessory: "turban", accessoryColor: "#ededee",
            accessoryY: 0, accessoryScale: 1,
            clothing: (ch.traits.clothing === "bare" || ch.traits.clothing === "singlet") ? "tee" : ch.traits.clothing,
            shirt: "#f2f2f2" }))
        : R({ clothing: "bare", accessory: "none", ...pride });
    } else {
      a.image = ch.image;
    }
    assignments[ch.id] = a;
  });
  return { id: effect.id, name: effect.name, assignments };
}

// SWIPE Mode: every character becomes a dating-app profile - a bio, what they're looking for, a green
// flag, a red flag, the ick, an age, a distance away, a match %, and unread messages. Crossing a card
// off slaps a "NOPE" stamp on it; bringing it back stamps "LIKED".
function applySwipe(effect) {
  const D = window.GameData;
  const lookingFor = D.swipeLookingFor || ["Something casual"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:sw:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:swipe:${ch.id}`);
    assignments[ch.id] = {
      age: 18 + (h % 42),
      distance: 1 + ((h >>> 4) % 40),
      match: 1 + ((h >>> 7) % 99),
      unread: (h >>> 5) % 4 === 0 ? (h >>> 11) % 99 : 0,
      verified: (h >>> 13) % 7 === 0,
      lookingFor: lookingFor[(h >>> 3) % lookingFor.length],
      bio: pick(D.swipeBios || ["Just vibes."], `${ch.id}:bio`),
      green: pick(D.swipeGreenFlags || ["Texts back"], `${ch.id}:g`),
      red: pick(D.swipeRedFlags || ["Still loves their ex"], `${ch.id}:r`),
      ick: pick(D.swipeIcks || ["Chases the bus"], `${ch.id}:ick`)
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// JUDGEMENT DAY: the afterlife as a RollerCoaster-Tycoon theme park. Everyone's been sorted into
// HEAVEN, HELL or PURGATORY - each with its own dramatic backdrop (god-rays / flames / grey limbo) and
// a halo, horns or a shrug. Rendered like an RCT guest: a Location + Circle/Tier (or queue position), a
// guest "thought", and Happiness + a themed mood meter.
function applyJudgement(effect) {
  const D = window.GameData;
  const pick = (obj, verdict, salt) => {
    const arr = (obj && obj[verdict]) || ["—"];
    return arr[stableHash(`${state.gameSalt}:jd:${salt}`) % arr.length];
  };
  // The living are sorted HEAVEN or HELL only (purgatory is now reserved for aborted souls), skewed
  // toward hell. Heaven TIERS track each soul's last Sims net worth - the rich float higher.
  const bank = simBankGet();
  const wealthOf = (ch) => (bank[ch.id] != null ? bank[ch.id] : ((stableHash(`${state.gameSalt}:jdw:${ch.id}`) % 65000) - 5000));
  const verdictOf = {};
  state.board.forEach((ch) => { verdictOf[ch.id] = ["HELL", "HELL", "HELL", "HEAVEN", "HEAVEN"][stableHash(`${state.gameSalt}:judge:${ch.id}`) % 5]; });
  const heavenIds = state.board.filter((c) => verdictOf[c.id] === "HEAVEN").sort((x, y) => wealthOf(y) - wealthOf(x)).map((c) => c.id);
  const heavenTier = {};
  heavenIds.forEach((id, i) => { heavenTier[id] = heavenIds.length <= 1 ? 9 : 9 - Math.round((i / (heavenIds.length - 1)) * 8); });
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:judge:${ch.id}`);
    const verdict = verdictOf[ch.id];
    const wealth = Math.round(wealthOf(ch));
    const layer = verdict === "HEAVEN" ? heavenTier[ch.id] : 1 + ((h >>> 3) % 9);
    const mega = verdict === "HELL" && layer === 9;         // the deepest circle = MEGA HELL
    const base = verdict === "HEAVEN" ? 72 : 2;
    // Heaven: naked souls on a TRANSPARENT background (clouds show through). Hell: charred, ashen skin.
    let image = null;
    if (ch.traits && window.faceGenerator) {
      image = verdict === "HEAVEN"
        ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, background: "transparent", clothing: "bare", accessory: "none" })
        : window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, clothing: "bare", accessory: "none", skinHex: mega ? "#3a2b28" : "#4a3f3a", cheekOpacity: 0 });
    }
    assignments[ch.id] = {
      verdict, image, wealth, layer, mega,
      location: pick(D.judgementLocations, verdict, `${ch.id}:loc`),
      thought: pick(D.judgementThoughts, verdict, `${ch.id}:th`),
      happiness: Math.min(100, base + ((h >>> 5) % 26)),
      meter2: verdict === "HELL" ? 70 + ((h >>> 7) % 30) : 4 + ((h >>> 7) % 24)
    };
  });
  // Aborted souls linger in PURGATORY - rendered as a separate ghost strip on the board.
  const purgatory = (state.abortedBabies || []).map((g) => {
    let image = g.image;
    if (g.traits && window.faceGenerator) { try { image = window.faceGenerator.renderPortrait(g.seed, { ...g.traits, background: "transparent" }); } catch (e) { /* keep stored */ } }
    return { id: g.id, name: g.name, image, queuePos: 1 + (stableHash(`${state.gameSalt}:jdq:${g.id}`) % 900000) };
  });
  return { id: effect.id, name: effect.name, assignments, purgatory };
}

// SIMS Mode: every character is a Sim - a plumbob mood (green/yellow/red) floating over the head, four
// depleting need bars, whatever autonomous action they're currently doing, a career, and a simoleon
// balance.
// A tiny cross-round ledger of each character's last Sims net worth - Judgement Day reads it to rank
// heaven tiers (the rich ascend higher). Persisted so a Sims round earlier in the session still counts.
const SIM_BANK_KEY = "whoisit_sim_bank_v1";
function simBankGet() { try { return JSON.parse(localStorage.getItem(SIM_BANK_KEY) || "{}") || {}; } catch (e) { return {}; } }
function simBankSet(map) { try { localStorage.setItem(SIM_BANK_KEY, JSON.stringify(map)); } catch (e) { /* storage off */ } }
function applySims(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:sim:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:sims:${ch.id}`);
    const need = (salt) => 1 + (stableHash(`${state.gameSalt}:simn:${ch.id}:${salt}`) % 100);
    const needs = { hunger: need("hun"), social: need("soc"), bladder: need("bla"), fun: need("fun") };
    const lowest = Math.min(needs.hunger, needs.social, needs.bladder, needs.fun);
    const mood = lowest < 25 ? "red" : lowest < 55 ? "yellow" : "green";
    assignments[ch.id] = {
      mood, needs,
      action: pick(D.simsActions || ["Standing still"], `${ch.id}:a`),
      career: pick(D.simsCareers || ["Unemployed"], `${ch.id}:job`),
      simoleons: (h % 3 === 0 ? -(h % 900) : (h >>> 4) % 99000),
      ...simsPortrait(ch)   // transparent-bg portrait so relief animations move only the person
    };
  });
  const bank = simBankGet();
  state.board.forEach((ch) => { bank[ch.id] = assignments[ch.id].simoleons; });
  simBankSet(bank);
  return { id: effect.id, name: effect.name, assignments };
}
// Drag two Sims together => a SLOT MACHINE cycles the possible interactions and lands on one. The
// PG-safe set is wholesome (hug/gossip/rob/married/slap); adult games add WOOHOO + FIGHT.
const SIM_ICON = { MARRIED: "💍", SLAP: "👋", HUG: "🤗", GOSSIP: "🗣️", ROB: "🦝", FIGHT: "🥊", WOOHOO: "🛏️" };
function simReface(ch, expr) { try { return window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, expression: expr, background: "transparent" }); } catch (e) { return null; } }
function simsInteract(A, B) {
  const asg = state.global.mystery?.assignments;
  const a = asg && asg[A.id], b = asg && asg[B.id];
  if (!a || !b) return;
  if (document.querySelector(".wed-overlay")) return;      // one interaction at a time
  const PG_ACTS = ["MARRIED", "SLAP", "HUG", "GOSSIP", "ROB"];
  const ACTIONS = state.settings.pg ? PG_ACTS : [...PG_ACTS, "WOOHOO", "FIGHT"];
  const action = ACTIONS[stableHash(`${state.gameSalt}:simact:${A.id}:${B.id}`) % ACTIONS.length];
  const ov = document.createElement("div");
  ov.className = "wed-overlay";
  ov.innerHTML = `<div class="wed-stage">
      <div class="wed-title">🎰 SIMS</div>
      <div class="wed-couple">
        <img class="wed-face" src="${A.image}" alt="">
        <span class="wed-heart">↔</span>
        <img class="wed-face" src="${B.image}" alt="">
      </div>
      <div class="wed-slot"><b class="wed-slot-label">?</b></div>
    </div>`;
  document.body.appendChild(ov);
  const label = ov.querySelector(".wed-slot-label");
  const face = (act) => `${SIM_ICON[act] || "🎲"} ${act}`;
  // Rattle through the options, then lock on the chosen one.
  const stopTk = window.Sound ? window.Sound.spinTicks(1900, 95, 160) : null;
  let t = 0;
  const spin = setInterval(() => { label.textContent = face(ACTIONS[t % ACTIONS.length]); t++; }, 110);
  setTimeout(() => {
    clearInterval(spin); if (stopTk) stopTk();
    label.textContent = face(action);
    ov.classList.add("wed-locked", `act-${action.toLowerCase()}`);
    sfx("pop");
  }, 1900);
  setTimeout(() => {
    ov.remove();
    const H = {
      WOOHOO: () => simsWoohoo(A, B), SLAP: () => simsSlap(A, B, a, b), HUG: () => simsHug(A, B, a, b),
      GOSSIP: () => simsGossip(A, B, a, b), ROB: () => simsRob(A, B, a, b), FIGHT: () => simsFight(A, B, a, b),
      MARRIED: () => simsMarried(A, B, a, b)
    };
    (H[action] || H.MARRIED)();
  }, 2900);
}
// MARRIED: SUCCESS (stay together, estate wiped, both miserable) or FAILURE (divorce, split the estate
// 50/50, both blissful). Deterministic per pair.
function simsMarried(A, B, a, b) {
  const success = stableHash(`${state.gameSalt}:wed:${A.id}:${B.id}:${(a.simoleons || 0) + (b.simoleons || 0)}`) % 2 === 0;
  if (success) {
    [a, b].forEach((s) => { s.simoleons = Math.round((s.simoleons || 0) * 0.04); s.mood = "red"; s.action = "Regretting the vows"; s.needs = { ...s.needs, fun: Math.min(s.needs?.fun ?? 20, 8), social: Math.min(s.needs?.social ?? 20, 12) }; });
    flashToast("⛓️ Married — til debt do us part"); sfx("buzzer");
  } else {
    const pot = (a.simoleons || 0) + (b.simoleons || 0);
    a.simoleons = Math.round(pot / 2); b.simoleons = pot - a.simoleons;
    [a, b].forEach((s) => { s.mood = "green"; s.action = "Living their best divorced life"; s.needs = { ...s.needs, fun: Math.max(s.needs?.fun ?? 80, 90), social: Math.max(s.needs?.social ?? 80, 88) }; });
    flashToast("🕊️ Divorce — happily ever after"); sfx("coin");
  }
  const bank = simBankGet(); bank[A.id] = a.simoleons; bank[B.id] = b.simoleons; simBankSet(bank);
  renderBoard();
}
// SLAP: A wallops B. B's SOCIAL bottoms out and their face crumples (diabolically sad); A is elated.
function simsSlap(A, B, a, b) {
  const reface = (ch, expr) => { try { return window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, expression: expr, background: "transparent" }); } catch (e) { return null; } };
  b.mood = "red"; b.needs = { ...b.needs, social: 1, fun: Math.min(b.needs?.fun ?? 20, 6) }; b.action = "Reeling from that slap"; const bi = reface(B, "sad"); if (bi) b.image = bi;
  a.mood = "green"; a.needs = { ...a.needs, social: Math.max(a.needs?.social ?? 80, 96), fun: Math.max(a.needs?.fun ?? 80, 95) }; a.action = "Never felt more alive"; const ai = reface(A, "bigSmile"); if (ai) a.image = ai;
  flashToast(`👋 SLAP! ${escapeHtml(B.name)} did NOT see that coming.`);
  sfx("slap");
  renderBoard();
  const card = document.getElementById(`card-${B.id}`);
  if (card) { card.classList.remove("sim-slapped"); void card.offsetWidth; card.classList.add("sim-slapped"); }
}
const simBank = (A, B, a, b) => { const bank = simBankGet(); bank[A.id] = a.simoleons; bank[B.id] = b.simoleons; simBankSet(bank); };
// HUG: both social soars, both blissful.
function simsHug(A, B, a, b) {
  [{ ch: A, s: a }, { ch: B, s: b }].forEach(({ ch, s }) => { s.mood = "green"; s.needs = { ...s.needs, social: Math.max(s.needs?.social ?? 80, 97), fun: Math.max(s.needs?.fun ?? 70, 84) }; s.action = "Sharing a lovely hug"; const im = simReface(ch, "happy"); if (im) s.image = im; });
  flashToast(`🤗 ${escapeHtml(A.name)} + ${escapeHtml(B.name)} share a hug.`); sfx("sparkle"); renderBoard();
}
// FIGHT: both social craters, both furious.
function simsFight(A, B, a, b) {
  [{ ch: A, s: a }, { ch: B, s: b }].forEach(({ ch, s }) => { s.mood = "red"; s.needs = { ...s.needs, social: 4, fun: 6 }; s.action = "In a screaming match"; const im = simReface(ch, "angry"); if (im) s.image = im; });
  flashToast(`🥊 ${escapeHtml(A.name)} and ${escapeHtml(B.name)} throw hands!`); sfx("buzzer"); renderBoard();
  [A.id, B.id].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("sim-slapped"); void c.offsetWidth; c.classList.add("sim-slapped"); } });
}
// GOSSIP: A spills the tea and thrives; B just got dragged and wilts.
function simsGossip(A, B, a, b) {
  a.mood = "green"; a.needs = { ...a.needs, social: Math.max(a.needs?.social ?? 70, 93), fun: Math.max(a.needs?.fun ?? 70, 88) }; a.action = "Spilling the tea"; const ai = simReface(A, "happy"); if (ai) a.image = ai;
  b.mood = "red"; b.needs = { ...b.needs, social: Math.min(b.needs?.social ?? 40, 14) }; b.action = "Just got dragged"; const bi = simReface(B, "sad"); if (bi) b.image = bi;
  flashToast(`🗣️ ${escapeHtml(A.name)} spread a rumour about ${escapeHtml(B.name)}.`); sfx("laugh"); renderBoard();
}
// ROB: A cleans B out - all of B's simoleons transfer to A.
function simsRob(A, B, a, b) {
  const loot = Math.max(0, b.simoleons || 0);
  a.simoleons = (a.simoleons || 0) + loot; b.simoleons = 0;
  a.mood = "green"; a.action = "Just came into money"; const ai = simReface(A, "happy"); if (ai) a.image = ai;
  b.mood = "red"; b.needs = { ...b.needs, fun: 8 }; b.action = "Been completely cleaned out"; const bi = simReface(B, "sad"); if (bi) b.image = bi;
  simBank(A, B, a, b);
  flashToast(`🦝 ${escapeHtml(A.name)} robbed ${escapeHtml(B.name)} of §${loot.toLocaleString()}!`); sfx("coin"); renderBoard();
}
// WOOHOO: the classic Sims baby-maker (adult mode only). Reuses the shared birth animation + KEEP/ABORT.
function simsWoohoo(A, B) {
  const gayby = sameSex(A, B);
  const baby = makeBaby(A, B, gayby);
  playBirthAnimation(A.image, B.image, baby, true, () => offerKeepOrAbort(baby, () => {
    state.board.push(baby);
    if (state.global.mystery) state.global.mystery.assignments[baby.id] = { mood: "green", needs: { hunger: 92, social: 95, bladder: 70, fun: 98 }, action: "Being a fresh newborn", career: "Unemployed", simoleons: 0, ...simsPortrait(baby) };
    if (baby.isGayby) persistGayby(baby);
    netAnnounceBaby(baby); scheduleSave();
    state.justBorn = baby.id;
    if (typeof addLog === "function") addLog(`${A.name} + ${B.name} woohoo'd — baby ${baby.name}!`);
    renderBoard();
    state.justBorn = null;
  }, () => abortBaby(baby, A, B)), { woohoo: true });
}

// HEADS ONLY: no cards at all - just every character's floating head (+ name) drifting around the
// board, morphing between formations (circle, figure-8, grid, spiral, heart, wave). Heads render with
// a transparent background so only the head shows.
function applyHeadsOnly(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    const image = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, headOnly: true })
      : ch.image;
    assignments[ch.id] = { image };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// ASTROLOGY: every character gets a sun / moon / rising sign, an element, a daily horoscope, a toxic
// trait, and a Mercury-retrograde status.
function applyAstrology(effect) {
  const D = window.GameData;
  const signs = D.astrologySigns || [["Scorpio", "♏", "Water"]];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:astro:${ch.id}`);
    const sun = signs[h % signs.length];
    const moon = signs[(h >>> 4) % signs.length];
    const rising = signs[(h >>> 8) % signs.length];
    assignments[ch.id] = {
      sun: { name: sun[0], glyph: sun[1], element: sun[2] },
      moon: moon[1], rising: rising[1],
      element: sun[2],
      horoscope: (D.astrologyHoroscopes || ["The stars are unclear."])[(h >>> 3) % (D.astrologyHoroscopes || [1]).length],
      toxic: (D.astrologyToxic || ["ghosts everyone"])[(h >>> 6) % (D.astrologyToxic || [1]).length],
      retro: (h >>> 11) % 3 === 0
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// PANTONE: an early, purely-aesthetic mode. Each card is restyled as a Pantone colour chip - the
// character's (harmonised) background is matched to the nearest real Pantone swatch, and the plate
// shows the wordmark + code + colour name under their name. Nothing is repainted; it's a lens.
const PANTONE_COLORS = [
  // pinks / roses
  { c: "13-1520", n: "Rose Quartz", h: "#f7cbcb" }, { c: "15-1816", n: "Pink Nectar", h: "#e5a4ac" },
  { c: "14-1714", n: "Candy Pink", h: "#f4bbc7" }, { c: "15-2215", n: "Sachet Pink", h: "#e8909c" },
  { c: "16-1720", n: "Confetti", h: "#e58fa1" }, { c: "17-2031", n: "Fandango Pink", h: "#d4517f" },
  { c: "13-2807", n: "Ballerina", h: "#eec9d2" }, { c: "14-2710", n: "Pink Lavender", h: "#dcb1cc" },
  { c: "15-2705", n: "Orchid Bloom", h: "#d6a9c6" }, { c: "14-3204", n: "Pink Tint", h: "#e2d3dc" },
  // reds / corals
  { c: "16-1546", n: "Living Coral", h: "#ff6f61" }, { c: "16-1548", n: "Coral", h: "#f88379" },
  { c: "17-1463", n: "Tangerine Tango", h: "#dd4124" }, { c: "19-1664", n: "True Red", h: "#bf1932" },
  { c: "18-1438", n: "Marsala", h: "#955251" }, { c: "16-1626", n: "Dubarry", h: "#f4737e" },
  { c: "15-1327", n: "Peach Nougat", h: "#e6a086" },
  // oranges / peach
  { c: "14-1231", n: "Peach Cobbler", h: "#f5b183" }, { c: "13-1023", n: "Apricot Ice", h: "#f6c9a6" },
  { c: "16-1359", n: "Orange Tiger", h: "#f96714" }, { c: "14-1050", n: "Amberglow", h: "#e08e45" },
  { c: "13-0947", n: "Golden Apricot", h: "#e0a058" },
  // yellows / butters
  { c: "12-0824", n: "Pale Banana", h: "#f4e6a0" }, { c: "13-0851", n: "Lemon Drop", h: "#f2df66" },
  { c: "12-0722", n: "Custard", h: "#e8d99a" }, { c: "13-0755", n: "Primrose Yellow", h: "#efc93b" },
  { c: "11-0620", n: "Vanilla Custard", h: "#f0e3bb" }, { c: "14-0754", n: "Ceylon Yellow", h: "#d8ab4e" },
  // greens
  { c: "13-0317", n: "Green Ash", h: "#c0d3b0" }, { c: "14-0223", n: "Nile Green", h: "#a8c17f" },
  { c: "15-0343", n: "Greenery", h: "#88b04b" }, { c: "16-0142", n: "Kelly Green", h: "#4a944e" },
  { c: "12-0225", n: "Lime Cream", h: "#dfe8ad" }, { c: "14-6329", n: "Spearmint", h: "#7bbb8f" },
  { c: "13-6009", n: "Aqua Foam", h: "#a7cbb6" }, { c: "13-0221", n: "Butterfly", h: "#c8d99a" },
  // teals / cyans
  { c: "15-5217", n: "Cockatoo", h: "#58c9b9" }, { c: "14-4816", n: "Aruba Blue", h: "#69cbc9" },
  { c: "16-5127", n: "Turquoise", h: "#45b8ac" }, { c: "13-5309", n: "Pastel Turquoise", h: "#9dd5cd" },
  { c: "15-4712", n: "Dusty Aqua", h: "#8fc7c2" },
  // blues
  { c: "14-4318", n: "Cloud Blue", h: "#a8c3d1" }, { c: "14-4122", n: "Ballad Blue", h: "#a3bcd4" },
  { c: "15-3920", n: "Serenity", h: "#92a8d1" }, { c: "16-4132", n: "Little Boy Blue", h: "#6f9bd1" },
  { c: "18-4141", n: "Classic Blue", h: "#2a4d7b" }, { c: "13-4304", n: "Bit of Blue", h: "#dbe4e6" },
  { c: "13-4411", n: "Corydalis Blue", h: "#c1d3df" }, { c: "12-4607", n: "Clearwater", h: "#b6d7d5" },
  // purples / lavender
  { c: "14-3710", n: "Lavender Fog", h: "#c9bcd4" }, { c: "16-3320", n: "Sheer Lilac", h: "#b294bb" },
  { c: "18-3838", n: "Ultra Violet", h: "#5f4b8b" }, { c: "15-3817", n: "Lavender", h: "#b7add0" },
  // neutrals / browns
  { c: "11-0602", n: "Snow White", h: "#f2f0eb" }, { c: "13-4108", n: "Nimbus Cloud", h: "#d4d5d8" },
  { c: "15-4101", n: "High-rise Grey", h: "#b8bdc4" }, { c: "11-0107", n: "Almond Buff", h: "#e6dcc8" },
  { c: "13-1108", n: "Bone Beige", h: "#dccfbb" }, { c: "17-1052", n: "Buckthorn Brown", h: "#b07636" },
  { c: "19-1218", n: "Chocolate", h: "#5a3a29" }, { c: "19-4005", n: "Pirate Black", h: "#2b2b2c" },
  // Expanded library - a dense spread across the full wheel so any mixed colour maps to a distinct name.
  { c: "18-1763", n: "Poinsettia", h: "#cd202c" }, { c: "17-1664", n: "Poppy Red", h: "#dc343b" }, { c: "18-1660", n: "Tomato", h: "#c63b2f" },
  { c: "19-1557", n: "Chili Pepper", h: "#9b1b30" }, { c: "18-1550", n: "Aurora Red", h: "#b13b3b" }, { c: "17-1927", n: "Bubblegum", h: "#ee9dc0" },
  { c: "15-1912", n: "Quartz Pink", h: "#e4a0a8" }, { c: "14-2311", n: "Prism Pink", h: "#e6a4c4" }, { c: "16-2118", n: "Aurora Pink", h: "#e5779b" },
  { c: "18-2436", n: "Raspberry", h: "#b3325a" }, { c: "19-2434", n: "Beaujolais", h: "#80304c" }, { c: "18-1633", n: "Baroque Rose", h: "#b05f6d" },
  { c: "16-1526", n: "Terra Cotta", h: "#e28b7a" }, { c: "15-1523", n: "Peach Beige", h: "#e5b09c" }, { c: "14-1420", n: "Peach Pink", h: "#f4b6a0" },
  { c: "17-1937", n: "Hot Pink", h: "#e55982" }, { c: "15-2217", n: "Carmine Rose", h: "#e35a8d" }, { c: "18-2333", n: "Fuchsia Red", h: "#ab3373" },
  { c: "19-1663", n: "Racing Red", h: "#bd2635" }, { c: "16-1520", n: "Rose Tan", h: "#e0a89a" }, { c: "16-1364", n: "Vibrant Orange", h: "#ff7420" },
  { c: "15-1263", n: "Autumn Sunset", h: "#f88f47" }, { c: "14-1139", n: "Iceland Poppy", h: "#f2ad4a" }, { c: "16-1449", n: "Orange Ochre", h: "#e58637" },
  { c: "15-1247", n: "Tangerine", h: "#f79256" }, { c: "13-1114", n: "Sun Kiss", h: "#f0cfa0" }, { c: "12-0915", n: "Cornhusk", h: "#f2dfb2" },
  { c: "13-1030", n: "Impala", h: "#f4d29a" }, { c: "16-1145", n: "Nugget Gold", h: "#c08a3e" }, { c: "16-1546", n: "Coral Rose", h: "#f0876a" },
  { c: "15-1340", n: "Mock Orange", h: "#f6a04d" }, { c: "14-1064", n: "Saffron", h: "#f4a838" }, { c: "13-0858", n: "Empire Yellow", h: "#f6c500" },
  { c: "14-0847", n: "Freesia", h: "#e5b93a" }, { c: "12-0736", n: "Buttercup", h: "#f4d444" }, { c: "11-0710", n: "Transparent Yellow", h: "#f4eeb2" },
  { c: "13-0632", n: "Limelight", h: "#e3e08b" }, { c: "12-0740", n: "Aspen Gold", h: "#f6d55b" }, { c: "14-0952", n: "Spectra Yellow", h: "#f0b323" },
  { c: "12-0642", n: "Blazing Yellow", h: "#fce300" }, { c: "14-0446", n: "Bright Chartreuse", h: "#a5b736" }, { c: "15-0533", n: "Green Oasis", h: "#a4ab5a" },
  { c: "16-0435", n: "Peapod", h: "#8ba14b" }, { c: "15-6442", n: "Online Lime", h: "#79993a" }, { c: "16-0439", n: "Macaw Green", h: "#6f8f3a" },
  { c: "18-0135", n: "Online Green", h: "#3f7d3f" }, { c: "17-6229", n: "Fairway", h: "#3f915e" }, { c: "16-6444", n: "Vibrant Green", h: "#4fa64f" },
  { c: "15-6340", n: "Classic Green", h: "#4a9d5b" }, { c: "14-0156", n: "Green Flash", h: "#78bb44" }, { c: "13-0220", n: "Paradise Green", h: "#b6d97a" },
  { c: "12-0322", n: "Seafoam Green", h: "#c3d5a4" }, { c: "14-6408", n: "Desert Sage", h: "#a3ad8e" }, { c: "16-0110", n: "Turf Green", h: "#5a7247" },
  { c: "18-0130", n: "Garden Green", h: "#3a6b35" }, { c: "13-0648", n: "Sulphur Spring", h: "#d5d717" }, { c: "17-5641", n: "Emerald", h: "#009874" },
  { c: "16-5533", n: "Arcadia", h: "#00a28a" }, { c: "15-5519", n: "Turquoise", h: "#3bc6b8" }, { c: "14-4522", n: "Blue Curacao", h: "#37b6c4" },
  { c: "15-4825", n: "Scuba Blue", h: "#00a3c6" }, { c: "16-4535", n: "Bluebird", h: "#009bbf" }, { c: "14-4620", n: "Aqua Sky", h: "#7bc4c4" },
  { c: "13-4909", n: "Bleached Aqua", h: "#c1dcd8" }, { c: "12-5209", n: "Bimini Blue", h: "#b7dbdd" }, { c: "16-5121", n: "Lagoon", h: "#4c9a94" },
  { c: "18-4936", n: "Deep Lake", h: "#0f6d78" }, { c: "13-5412", n: "Aquifer", h: "#9dd0cf" }, { c: "18-4045", n: "Directoire Blue", h: "#1f4b99" },
  { c: "19-4052", n: "Classic Blue", h: "#0f4c81" }, { c: "18-4148", n: "Diva Blue", h: "#0079b5" }, { c: "17-4247", n: "Cendre Blue", h: "#3a7ca5" },
  { c: "16-4020", n: "Blue Bell", h: "#93aac7" }, { c: "15-3919", n: "Placid Blue", h: "#8aaad4" }, { c: "14-4115", n: "Cerulean", h: "#9bb7d4" },
  { c: "13-4308", n: "Ballad Blue", h: "#c1cdd6" }, { c: "14-4318", n: "Cerulean Sky", h: "#a7c1d2" }, { c: "18-3949", n: "Deep Ultramarine", h: "#39477f" },
  { c: "19-3952", n: "Surf the Web", h: "#2a4b9b" }, { c: "16-4032", n: "Little Boy Blue", h: "#7aa2d6" }, { c: "19-4029", n: "True Navy", h: "#33455f" },
  { c: "18-3224", n: "Radiant Orchid", h: "#ad5e99" }, { c: "17-3617", n: "Dahlia Purple", h: "#7f6497" }, { c: "16-3521", n: "Bougainvillea", h: "#9a6d9e" },
  { c: "15-3620", n: "Lavendula", h: "#a58fc0" }, { c: "14-3711", n: "Lavender Blue", h: "#b7b9d8" }, { c: "17-3628", n: "Amethyst Orchid", h: "#9866b0" },
  { c: "19-3536", n: "Imperial Palace", h: "#5c3a63" }, { c: "18-3418", n: "Purple Passion", h: "#66507a" }, { c: "19-3542", n: "Prism Violet", h: "#59315f" },
  { c: "13-3405", n: "Orchid Ice", h: "#d9c6d6" }, { c: "18-1048", n: "Monks Robe", h: "#6d4832" }, { c: "17-1230", n: "Mocha Mousse", h: "#a47864" },
  { c: "16-1235", n: "Tawny Birch", h: "#c08552" }, { c: "15-1315", n: "Warm Sand", h: "#d6b89a" }, { c: "14-1116", n: "Sand", h: "#dcc9a8" },
  { c: "13-1008", n: "Oatmeal", h: "#dccdb4" }, { c: "16-1414", n: "Cork", h: "#b79d80" }, { c: "17-1418", n: "Cognac", h: "#9c6b4a" },
  { c: "19-1220", n: "Coffee Bean", h: "#4a3327" }, { c: "18-0625", n: "Olive Drab", h: "#6a6338" }, { c: "16-0928", n: "Prairie Sand", h: "#c19a52" },
  { c: "15-1216", n: "Cuban Sand", h: "#c9a889" }, { c: "11-4001", n: "Brilliant White", h: "#edf1f4" }, { c: "12-4302", n: "Cloud Dancer", h: "#f0eee9" },
  { c: "14-4002", n: "Silver", h: "#bcbdc0" }, { c: "15-4003", n: "Dawn Blue", h: "#a2a9ab" }, { c: "17-4405", n: "Neutral Grey", h: "#8f9192" },
  { c: "18-0601", n: "Pewter", h: "#67686a" }, { c: "19-4007", n: "Anthracite", h: "#28292b" }, { c: "18-1306", n: "Fossil", h: "#79736b" },
  { c: "16-1305", n: "Aluminum", h: "#a29c94" }, { c: "19-0303", n: "Jet Black", h: "#2a2a2c" },
];
function pantoneRgb(hex) { const h = hex.replace("#", ""); return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]; }
function pantoneDist(a, b) {
  // "redmean" weighted distance - matches perceived colour closeness better than raw RGB.
  const rm = (a[0] + b[0]) / 2, dr = a[0] - b[0], dg = a[1] - b[1], db = a[2] - b[2];
  return (2 + rm / 256) * dr * dr + 4 * dg * dg + (2 + (255 - rm) / 256) * db * db;
}
function nearestPantone(hex) {
  const t = pantoneRgb(hex);
  let best = PANTONE_COLORS[0], bd = Infinity;
  for (const p of PANTONE_COLORS) { const d = pantoneDist(t, pantoneRgb(p.h)); if (d < bd) { bd = d; best = p; } }
  return best;
}
function applyPantone(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    const bg = (ch.traits && ch.traits.background) || "#cccccc";
    const p = nearestPantone(bg);
    assignments[ch.id] = { code: p.c, name: p.n, hex: p.h };
  });
  return { id: effect.id, name: effect.name, assignments };
}
function skinHexOf(ch) {
  const tb = window.faceGenerator && window.faceGenerator.traitBook;
  if (ch.traits && ch.traits.skinHex) return ch.traits.skinHex;
  const name = ch.traits && ch.traits.skin;
  return (tb && tb.skinToneHex && tb.skinToneHex[name]) || "#c88968";
}
// Bleed two suspects into each other like wet paint: each one shifts PART-way toward the other (not
// all the way to a shared midpoint), so they end up related-but-distinct instead of identical. Their
// Pantone chips re-derive from each new shade. Repeatable, so you can keep nudging the board together.
const PANTONE_MIX_T = 0.4;          // how far each moves toward the other (0 = no change, 0.5 = identical)
function mixPantonePair(A, B) {
  const bgA = (A.traits && A.traits.background) || "#cccccc", bgB = (B.traits && B.traits.background) || "#cccccc";
  const skinA = skinHexOf(A), skinB = skinHexOf(B);
  const asg = state.global.mystery && state.global.mystery.assignments;
  // A touch of per-character random jitter on the blend so the two never round to the SAME Pantone tag
  // (retry the jitter a few times until their nearest chips differ).
  const shift = (ch, ownBg, otherBg, ownSkin, otherSkin, avoidCode) => {
    const baseBg = mixHex(ownBg, otherBg, PANTONE_MIX_T);
    let bg = baseBg, p = nearestPantone(bg);
    for (let tries = 0; avoidCode && p.c === avoidCode && tries < 6; tries++) { bg = jitterHex(baseBg, 0.05); p = nearestPantone(bg); }
    if (!avoidCode) bg = jitterHex(baseBg, 0.03);   // still nudge the first one a little
    p = nearestPantone(bg);
    ch.traits = { ...ch.traits, background: bg, skinHex: jitterHex(mixHex(ownSkin, otherSkin, PANTONE_MIX_T), 0.03) };
    delete ch.traits.skin;          // let the mixed hex render instead of the named palette tone
    ch.image = window.faceGenerator.renderPortrait(ch.seed, ch.traits);
    if (asg) asg[ch.id] = { code: p.c, name: p.n, hex: p.h };
    return p.c;
  };
  const codeA = shift(A, bgA, bgB, skinA, skinB, null);
  shift(B, bgB, bgA, skinB, skinA, codeA);          // B avoids landing on A's exact Pantone
  renderBoard();
  [A.id, B.id].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("pantone-mix"); void c.offsetWidth; c.classList.add("pantone-mix"); } });
}

// HORNY POTTER: Harry Potter, but filthy. Everyone is sorted into a house with a wand + a favourite
// (real) spell interpreted lewdly. A few are house-less Death Eaters (Unforgivable Curses), and ONE
// is the Dark Lord - repainted bald and pasty, no house.
function applyHornyPotter(effect) {
  const D = window.GameData;
  const houses = D.hpHouses || [["Gryffindor", "#7a0f18", "🦁", "reckless"]];
  const spells = D.hpSpells || [["Lumos", "turns them on"]];
  const dark = D.hpDarkSpells || [["Imperio", "total control"]];
  const woods = D.hpWandWoods || ["Elder"], cores = D.hpWandCores || ["dragon heartstring"], flexes = D.hpWandFlex || ["rigid"];
  const patronuses = D.hpPatronuses || ["a wet raccoon"], boggarts = D.hpBoggarts || ["commitment"], horcruxes = D.hpHorcruxes || ["a buttplug"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:hp:${salt}`) % arr.length];
  const order = deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:sort`);
  // Exactly one poor soul (never the Dark Lord at index 0) is packing a very cursed "wand".
  const cursedIdx = order.length > 1 ? 1 + (stableHash(`${state.gameSalt}:hp:cursed`) % (order.length - 1)) : -1;
  const assignments = {};
  // Re-render a portrait onto a per-character-VARIED tint of a base colour, so every card's background
  // reads as its house (or its dark faction) without two cards sharing the exact same shade.
  const tinted = (ch, base, toward, lo, hi, extra) => {
    if (!(ch.traits && window.faceGenerator)) return null;
    const h = stableHash(`${state.gameSalt}:hp:tint:${ch.id}`);
    const t = lo + ((h % 1000) / 1000) * (hi - lo);
    return window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, ...(extra || {}), background: mixHex(base, toward, t) });
  };
  order.forEach((ch, i) => {
    const h = stableHash(`${state.gameSalt}:hp:${ch.id}`);
    let wand = `${woods[h % woods.length]}, ${cores[(h >>> 3) % cores.length]} core, ${flexes[(h >>> 6) % flexes.length]}`;
    if (i === cursedIdx) wand = "Flesh, human hair, actually his cock";
    const gender = hpGenderLabel(ch);
    const smokeDelay = -((h >>> 2) % 800) / 100;   // per-death-eater smoke offset (never in sync)
    if (i === 0) {                                   // the single Dark Lord - pasty repaint on a dark tint
      const image = tinted(ch, "#101018", "#2b2740", 0.1, 0.5, { hair: "bald", hairLocks: [], accessory: "none", skinHex: "#e6e7de", browThick: 0.15, noseScale: 0.62, lipColor: "#b7a6a6" });
      const s = dark[(h >>> 9) % dark.length];
      assignments[ch.id] = { role: "darklord", house: "The Dark Lord", color: "#3a3358", crest: "☇", wand: "Elder, thestral tail-hair core, unyielding", spell: s[0], spellHint: s[1], horcrux: pick(horcruxes, `hx:${ch.id}`), image, gender, smokeDelay };
      return;
    }
    if (h % 5 === 0) {                               // ~1 in 5 are house-less Death Eaters - smoky dark card
      const s = dark[(h >>> 9) % dark.length];
      const image = tinted(ch, "#1a1420", "#3a2846", 0.15, 0.55);
      assignments[ch.id] = { role: "deatheater", house: "Death Eater", color: "#5a3a6e", crest: "☠", wand, spell: s[0], spellHint: s[1], horcrux: pick(horcruxes, `hx:${ch.id}`), image, gender, smokeDelay };
      return;
    }
    const house = houses[(h >>> 4) % houses.length];
    const s = spells[(h >>> 9) % spells.length];
    const image = tinted(ch, house[1], "#f7f3ea", 0.44, 0.6);   // VIBRANT house tint (clearly the colour), per-char varied
    assignments[ch.id] = { role: "house", house: house[0], color: house[1], crest: house[2], vibe: house[3], wand, spell: s[0], spellHint: s[1], patronus: pick(patronuses, `pat:${ch.id}`), boggart: pick(boggarts, `bog:${ch.id}`), image, gender };
  });
  return { id: effect.id, name: effect.name, assignments };
}
// JK Rowling's "gender detector": crude, confident and wrong. Everyone is stamped MALE or FEMALE by
// how the game reckons they "should" present (they/them people get force-binaried) - except the two
// deliberately-broken cases: Olivia is misgendered MALE, and non-white characters get racialised
// labels (Kai -> ASIAN, dark-skinned -> ETHNIC) instead of a gender. It's satire of the bigoted logic.
function hpGenderLabel(ch) {
  if (ch.id === "gen-olivia") return "MALE";
  if (ch.id === "gen-kai") return "ASIAN";
  if (["brown", "deep", "ebony"].includes(ch.traits && ch.traits.skin)) return "ETHNIC";
  if (ch.pronouns === "he") return "MALE";
  if (ch.pronouns === "she") return "FEMALE";
  return (Number(ch.traits && ch.traits.bust) || 0) > 0.15 ? "FEMALE" : "MALE";   // they/them -> forced binary
}
// Dark Lord's kill: a green killing-curse flash over the victim's card, then they're crossed off (the
// HP way to mark a NO). If already down, un-cross them (drag the Dark Lord on again to revive).
function avadaKedavra(ch) {
  const card = document.getElementById(`card-${ch.id}`);
  const alreadyDown = currentPlayer().eliminated.has(ch.id);
  if (card && !alreadyDown) {
    card.classList.remove("hp-avada-hit"); void card.offsetWidth; card.classList.add("hp-avada-hit");
    const flash = document.createElement("div");
    flash.className = "hp-avada-flash";
    card.querySelector(".portrait-wrap")?.appendChild(flash);
  }
  flashToast(alreadyDown ? `✨ Finite — ${ch.name} rises again.` : `☠ Avada Kedavra — ${ch.name} is no more.`);
  sfx(alreadyDown ? "sparkle" : "boom");
  setTimeout(() => toggleEliminated(ch.id), alreadyDown ? 60 : 500);
}

// HABBO HOTEL: an isometric room. Every character becomes a blocky Habbo-style avatar (a pixelated
// head on a shirt-coloured body) standing on an iso floor. Click an avatar to select it, then click a
// tile to walk them there.
function applyHabbo(effect) {
  const tb = window.faceGenerator?.traitBook;
  const assignments = {};
  state.board.forEach((ch) => {
    const head = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, headOnly: true })
      : ch.image;
    const shirt = ch.traits?.shirt || (tb?.skinToneHex?.[ch.traits?.skin]) || "#4a90e2";
    assignments[ch.id] = { head, shirt };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Special Disguise: the WOMEN get a neutral full-face covering (a single eye slit); everyone else is
// stripped to a bald head + hat + plain white top instead. A generic concealing wrap, not religious.
// Rough Latin->Arabic-script transliteration (looks the part, not linguistically exact) + an
// exaggerated phonetic spelling (Olivia -> OH-LEE-VEE-AHHH).
const ARABIC_MAP = { a: "ا", b: "ب", c: "ك", d: "د", e: "ي", f: "ف", g: "ج", h: "ه", i: "ي", j: "ج", k: "ك", l: "ل", m: "م", n: "ن", o: "و", p: "ب", q: "ق", r: "ر", s: "س", t: "ت", u: "و", v: "ف", w: "و", x: "كس", y: "ي", z: "ز" };
function arabicize(name) {
  return [...name.toLowerCase()].map((c) => ARABIC_MAP[c] || "").join("‌") || "؟";
}
function phonetic(name) {
  const V = { a: "AH", e: "EH", i: "EE", o: "OH", u: "OO", y: "EE" };
  const syl = []; let cons = "";
  for (const c of name.toLowerCase()) {
    if (V[c]) { syl.push(cons.toUpperCase() + V[c]); cons = ""; } else if (/[a-z]/.test(c)) cons += c;
  }
  if (cons) syl.push(cons.toUpperCase());
  let s = syl.join("-") || name.toUpperCase();
  return s.replace(/(AH|EH|OH|OO)$/, "$1HH").replace(/(EE)$/, "EEEE");   // stretch the final vowel
}
function applyDisguise(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    let image = null;
    if (ch.traits && window.faceGenerator) {
      // Two incognito looks: balaclava crew go pure black; turban crew go clean white.
      image = ch.pronouns === "she"
        ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, disguise: true, disguiseColor: "#0c0c0f", accessoryColor: "#0b0b0d", shirt: "#0b0b0d" })
        : window.faceGenerator.renderPortrait(ch.seed, {
          ...ch.traits, hair: "bald", hairLocks: [], beardLength: 0,
          accessory: "turban", accessoryColor: "#eceae2", accessoryY: 0, accessoryScale: 1,
          clothing: (ch.traits.clothing === "bare" || ch.traits.clothing === "singlet") ? "tee" : ch.traits.clothing,
          shirt: "#ededea"
        });
    }
    assignments[ch.id] = { image, arabic: arabicize(ch.name), phon: phonetic(ch.name) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Work Mode: a Soviet-labour-camp readout. Everyone's a bald, browless, pasty husk; each gets a days-
// remaining sentence and a secret stash of contraband (shivs etc.). Gulag energy.
function applyWork(effect) {
  const stash = (window.GameData && window.GameData.workInventory) || ["Shiv"];
  const assignments = {};
  state.board.forEach((ch) => {
    const image = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, {
        ...ch.traits, hair: "bald", hairLocks: [], noBrows: true,
        skinHex: "#e9ddd2", cheekOpacity: 0, beardLength: 0,
        build: 40, bodyWidth: 0.66, shoulderSlope: 1, bust: 0    // starved, tiny frail torso (head unchanged)
      })
      : null;
    const h = stableHash(`${state.gameSalt}:work:${ch.id}`);
    const days = 1 + (h % 9000);
    const n = 1 + ((h >>> 4) % 3);
    const items = [];
    for (let k = 0; k < n; k++) {
      const it = stash[stableHash(`${state.gameSalt}:wk:${ch.id}:${k}`) % stash.length];
      if (!items.includes(it)) items.push(it);
    }
    assignments[ch.id] = { image, days, items };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Disease Mode: every character gets a sheet of (deliberately outdated) diagnoses with MINOR/MAJOR/
// MEGA severity, a sliding autism scale, possible cancers with an estimated arrival, a meds list, a
// pain face, and a chance of pregnancy (filed as a MAJOR disease).
function applyDisease(effect) {
  const D = window.GameData;
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:dz:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:disease:${ch.id}`);
    const diseases = [];
    const n = 1 + (h % 3);
    for (let k = 0; k < n; k++) {
      const d = pick(D.diseases, `${ch.id}:d${k}`);
      if (!diseases.some((x) => x.name === d[0])) diseases.push({ name: d[0], tier: d[1] });
    }
    const pregnant = (h >>> 7) % 5 === 0;
    if (pregnant) diseases.unshift({ name: "Pregnancy", tier: "MAJOR" });
    const cancers = [];
    const cn = (h >>> 9) % 3;
    for (let k = 0; k < cn; k++) {
      cancers.push({ type: pick(D.cancerTypes, `${ch.id}:c${k}`), eta: pick(D.cancerEtas, `${ch.id}:e${k}`) });
    }
    const meds = [];
    const mn = 1 + ((h >>> 13) % 3);
    for (let k = 0; k < mn; k++) {
      const m = pick(D.medications, `${ch.id}:m${k}`);
      if (!meds.includes(m)) meds.push(m);
    }
    assignments[ch.id] = {
      diseases, cancers, meds, pregnant,
      autism: ((h >>> 3) % 101) / 100,
      pain: (h >>> 11) % D.painFaces.length
    };
  });
  // Crown 1-2 of them PATIENT ZERO (deterministic: the lowest-hashing on the board).
  const ranked = state.board.map((c) => [c.id, stableHash(`${state.gameSalt}:pz:${c.id}`)]).sort((a, b) => a[1] - b[1]);
  const zeros = 1 + (ranked.length > 12 ? 1 : 0);
  for (let k = 0; k < zeros && k < ranked.length; k++) if (assignments[ranked[k][0]]) assignments[ranked[k][0]].patientZero = true;
  return { id: effect.id, name: effect.name, assignments };
}

// Drug Addict Mode: random street-name addictions (some have several) + how they take each one.
function applyDrugs(effect) {
  const D = window.GameData;
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:drugs:${ch.id}`);
    const n = 1 + (h % 4);
    const habits = [];
    for (let k = 0; k < n; k++) {
      const d = D.drugs[stableHash(`${state.gameSalt}:dg:${ch.id}:${k}`) % D.drugs.length];
      if (!habits.some((x) => x.name === d[0])) habits.push({ name: d[0], method: d[1] });
    }
    // Everyone's eyes are heavy-lidded and half-shut - sleazy and off their face.
    const image = ch.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, eyeOpen: 0.28, underEyeOpacity: 0.5, browY: (Number(ch.traits.browY) || 0) + 1 })
      : null;
    assignments[ch.id] = { habits, daily: 1 + ((h >>> 5) % 40), image };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// PIXALL: 8-bit pixel-art mode. No per-character data - the look comes from the pixel font (CSS) and
// a canvas pass that downscales + colour-quantises each portrait into chunky pixels.
function applyPixall(effect) {
  return { id: effect.id, name: effect.name, assignments: {} };
}

// ===================== Hidden Agendas politics (stances + tug-o-war) =====================
// Every politician runs on a platform of completely unhinged stances - FOR and AGAINST are drawn
// from one shared pool with zero party consistency (that's the point).
const STANCE_POOL = [
  "Abortion", "War in Iraq", "Pregnancy Tax", "Homosexuality", "Sodomy", "Creatine",
  "Seed Oils", "Chemtrails", "Daylight Savings", "Fluoride", "Microplastics", "5G Towers",
  "Immigrant Geese", "The Death Penalty (for jaywalking)", "Universal Basic Cigarettes",
  "Gluten", "Vaping in Church", "Horse Girls", "Pit Bulls (as currency)", "The Moon Landing",
  "Divorce (recreational)", "Mandatory Gym Class", "Cousin Marriage (loopholes)", "Feet Pic Tariffs",
  "Big Mattress", "Birds", "The Metric System", "Raw Milk Influencers", "Grandparents Voting"
];
function pickStances(chId) {
  // A deterministic shuffle of the pool per character; first 2-3 are FOR, next 2-3 AGAINST.
  const scored = STANCE_POOL.map((s) => [stableHash(`${state.gameSalt}:st:${chId}:${s}`), s]).sort((a, b) => a[0] - b[0]);
  const nFor = 2 + (stableHash(`${state.gameSalt}:stf:${chId}`) % 2);
  const nAg = 2 + (stableHash(`${state.gameSalt}:sta:${chId}`) % 2);
  return { for: scored.slice(0, nFor).map((x) => x[1]), against: scored.slice(nFor, nFor + nAg).map((x) => x[1]) };
}
if (window.GameData && window.GameData.modePrompts && !window.GameData.modePrompts["hidden-agendas"]) {
  window.GameData.modePrompts["hidden-agendas"] = [
    "Is your person FOR sodomy?",
    "Is your person AGAINST creatine?",
    "Would your person tax a pregnancy?",
    "Is your person packing heat at a school bake sale?",
    "Would your person fart a rainbow on live TV?",
    "Does your person own more than three flags?",
    "Is your person's approval rating under 40%?",
    "Would your person win a tug-o-war?",
    "Has your person ever been cancelled?",
    "Does your person think the moon landing was staged?",
    "Would your person tax YOU specifically?",
    "Is your person a REP?",
    "Is your person a DEM?",
    "Does your person do their own research?",
    "Would your person survive a town hall?",
    "Is your person in it for the lobbyist money?",
    "Does your person kiss babies for the cameras?"
  ];
}
// The tug-o-war: donkey pulls from the left, elephant from the right, both contestants' faces ride
// the rope. It strains back and forth, a random side wins with a yank, and the loser converts.
function politicsTug(A, B) {
  const mode = state.global.mystery?.id;
  const asg = state.global.mystery.assignments;
  const pa = asg[A.id], pb = asg[B.id];
  if (!pa || !pb) return;
  // Works for both party formats: politics uses REP/DEM, hidden agendas uses Republican/Democrat.
  const norm = (p) => (/^rep/i.test(p || "") ? "REP" : "DEM");
  if (norm(pa.party) === norm(pb.party)) {
    // Same team - no fight, just the no-breed jiggle.
    [A.id, B.id].forEach((id) => { const c = document.getElementById(`card-${id}`); if (c) { c.classList.remove("no-breed-jiggle"); void c.offsetWidth; c.classList.add("no-breed-jiggle"); } });
    return;
  }
  const dem = norm(pa.party) === "DEM" ? A : B;
  const rep = norm(pa.party) === "REP" ? A : B;
  const ov = document.createElement("div");
  ov.className = "tug-overlay";
  // One consolidated piece of art (donkey + rope + elephant); the contestants' faces ride the rope.
  ov.innerHTML = `<div class="tug-stage">
      <div class="tug-title">⚖️ TUG-O-WAR!</div>
      <div class="tug-scene">
        <img class="tug-art" src="assets/pol-tug.png" alt="">
        <img class="tug-face tug-face-dem" src="${dem.image}" alt="">
        <img class="tug-face tug-face-rep" src="${rep.image}" alt="">
      </div>
    </div>`;
  document.body.appendChild(ov);
  const repWins = Math.random() < 0.5;
  // Strain for a couple of seconds, then the winning side yanks the rope home.
  setTimeout(() => {
    ov.classList.add(repWins ? "win-rep" : "win-dem");
    const banner = document.createElement("div");
    banner.className = "tug-banner";
    const loser = repWins ? dem : rep;
    banner.innerHTML = `${repWins ? "🐘" : "🫏"} <b>${escapeHtml(loser.name)}</b> CONVERTED!`;
    ov.querySelector(".tug-stage").appendChild(banner);
  }, 2300);
  setTimeout(() => {
    const loser = repWins ? dem : rep;
    // The loser swaps party but keeps their home state, mood and (crucially) their unhinged stances.
    asg[loser.id] = { ...asg[loser.id], party: repWins ? "Republican" : "Democrat", converted: true };
    netSend("tug", { loserId: loser.id, party: asg[loser.id].party });
    scheduleSave();
    ov.remove();
    renderBoard();
  }, 3900);
}

// Rasterise an SVG portrait down to `size` px and quantise its colours for a real 8-bit look.
const pixelCache = new Map();
// `crop` (optional) is [fx, fy, fw, fh] as FRACTIONS of the source (0-1) - use it to spend the whole
// pixel budget on a region (e.g. just the head) instead of wasting it on transparent margins. Given
// as fractions so it survives whatever intrinsic size the SVG happens to rasterise at.
function pixelateSrc(src, size, done, crop) {
  const key = crop ? `${src}|${crop.join(",")}|${size}` : src;
  if (pixelCache.has(key)) { done(pixelCache.get(key)); return; }
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    if (crop) {
      // SVGs without width/height report intrinsic size 0, which breaks drawImage's source-crop. So
      // first rasterise the whole SVG into a known-size canvas (dest-size draw is reliable), THEN crop.
      const BASE = 256;
      const tmp = document.createElement("canvas");
      tmp.width = BASE; tmp.height = BASE;
      const tx = tmp.getContext("2d");
      tx.imageSmoothingEnabled = false;
      tx.drawImage(im, 0, 0, BASE, BASE);
      x.drawImage(tmp, crop[0] * BASE, crop[1] * BASE, crop[2] * BASE, crop[3] * BASE, 0, 0, size, size);
    } else {
      x.drawImage(im, 0, 0, size, size);
    }
    try {
      const d = x.getImageData(0, 0, size, size);
      const a = d.data;
      for (let i = 0; i < a.length; i += 4) {
        a[i] = Math.round(a[i] / 51) * 51;
        a[i + 1] = Math.round(a[i + 1] / 51) * 51;
        a[i + 2] = Math.round(a[i + 2] / 51) * 51;
      }
      x.putImageData(d, 0, 0);
    } catch (e) { /* tainted canvas - skip quantise */ }
    const url = c.toDataURL();
    pixelCache.set(key, url);
    done(url);
  };
  im.onerror = () => done(src);
  im.src = src;
}
// PIXALL runs LIVE: each portrait <img> is swapped for a small canvas that re-samples the animated
// SVG several times a second - so blinks/expressions keep playing in chunky pixels instead of the
// old one-shot snapshot freezing people mid-blink. (SVG-image CSS animations keep running in the
// browser's image copy; drawImage grabs whatever frame is current.)
let pixallTimer = null;
let pixallItems = [];
function stopPixallLoop() { if (pixallTimer) { clearInterval(pixallTimer); pixallTimer = null; } pixallItems = []; }
function startPixallLoop() {
  stopPixallLoop();
  const SIZE = 46, BASE = 256, CROP = [0.15, 0.02, 0.7, 0.7];
  const tmp = document.createElement("canvas");
  tmp.width = BASE; tmp.height = BASE;
  const tx = tmp.getContext("2d");
  els.characterBoard.querySelectorAll(".portrait-wrap > img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:image/png")) return;
    const srcIm = new Image();
    srcIm.src = src;                       // the browser keeps this SVG's animations ticking
    const cv = document.createElement("canvas");
    cv.width = SIZE; cv.height = SIZE;
    cv.className = "pixall-live";
    img.replaceWith(cv);
    pixallItems.push({ srcIm, ctx: cv.getContext("2d"), cv });
  });
  const draw = () => {
    pixallItems = pixallItems.filter((it) => it.cv.isConnected);
    if (!pixallItems.length) { stopPixallLoop(); return; }
    pixallItems.forEach((it) => {
      if (!it.srcIm.complete) return;
      tx.clearRect(0, 0, BASE, BASE);
      tx.imageSmoothingEnabled = false;
      tx.drawImage(it.srcIm, 0, 0, BASE, BASE);
      const x = it.ctx;
      x.imageSmoothingEnabled = false;
      x.clearRect(0, 0, SIZE, SIZE);
      x.drawImage(tmp, CROP[0] * BASE, CROP[1] * BASE, CROP[2] * BASE, CROP[3] * BASE, 0, 0, SIZE, SIZE);
      try {
        const d = x.getImageData(0, 0, SIZE, SIZE); const a = d.data;
        for (let i = 0; i < a.length; i += 4) { a[i] = Math.round(a[i] / 51) * 51; a[i + 1] = Math.round(a[i + 1] / 51) * 51; a[i + 2] = Math.round(a[i + 2] / 51) * 51; }
        x.putImageData(d, 0, 0);
      } catch (e) { /* tainted - leave unquantised */ }
    });
  };
  draw();
  pixallTimer = setInterval(draw, 140);   // ~7fps: chunky, retro, cheap
}
function pixelateBoard() {
  els.characterBoard.querySelectorAll(".portrait-wrap > img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:image/png")) return;
    // Crop in toward the face so the pixel budget lands on features - you can still tell who's who.
    pixelateSrc(src, 46, (url) => { if (img.isConnected) img.src = url; }, [0.15, 0.02, 0.7, 0.7]);
  });
}

// Average colour of the bottom strip of the location banner, for the board's fade-to-bottom gradient.
const fadeCache = new Map();
function sampleBottomColor(src, done) {
  if (fadeCache.has(src)) { done(fadeCache.get(src)); return; }
  const im = new Image();
  im.crossOrigin = "anonymous";
  im.onload = () => {
    const w = 24, h = 24;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const x = c.getContext("2d");
    x.drawImage(im, 0, 0, w, h);
    try {
      const d = x.getImageData(0, Math.floor(h * 0.72), w, Math.ceil(h * 0.28)).data;
      let r = 0, g = 0, b = 0, n = 0;
      for (let i = 0; i < d.length; i += 4) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      const col = `rgb(${Math.round(r / n)},${Math.round(g / n)},${Math.round(b / n)})`;
      fadeCache.set(src, col);
      done(col);
    } catch (e) { done("#15140f"); }
  };
  im.onerror = () => done("#15140f");
  im.src = src;
}

// Fireworks Mode: no per-character data - it's a visual mode where eliminating a character pops their
// head out of the card frame and explodes it into fireworks (handled in createCharacterCard + CSS).
function applyFireworks(effect) {
  return { id: effect.id, name: effect.name, assignments: {} };
}

// Orgy Mode: everyone's stripped to bare cartoon shoulders and given a dossier of (entirely fictional,
// comedic) bedroom stats - position, body count, cum count today/lifetime, stat bars, who they're
// linked to, and who's UP NEXT. Pure text/number gags on cartoon avatars, in the spirit of gay-frogged.
function applyOrgy(effect) {
  const positions = ["TOP", "BOTTOM", "SIDE", "GAGGED", "CHOKING", "VERS", "POWER BOTTOM", "STARFISH"];
  const board = state.board;
  const assignments = {};
  board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:orgy:${ch.id}`);
    const stat = (salt, max) => 1 + (stableHash(`${state.gameSalt}:orgy:${ch.id}:${salt}`) % max);
    const partnerCount = 1 + ((h >>> 9) % 3);
    const partners = [];
    for (let k = 0; k < partnerCount && partners.length < board.length - 1; k++) {
      let idx = stableHash(`${state.gameSalt}:orgy:${ch.id}:p${k}`) % board.length;
      let n = board[idx].name;
      let guard = 0;
      while ((n === ch.name || partners.includes(n)) && guard++ < board.length) { idx = (idx + 1) % board.length; n = board[idx].name; }
      if (n !== ch.name && !partners.includes(n)) partners.push(n);
    }
    let upNext = board[(h >>> 11) % board.length].name;
    if (upNext === ch.name) upNext = board[((h >>> 11) + 1) % board.length].name;
    const image = (ch.traits && window.faceGenerator)
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, clothing: "bare", accessory: "none" })
      : ch.image;
    assignments[ch.id] = {
      pos: positions[h % positions.length],
      bodyCount: 2 + ((h >>> 3) % 187),
      cumToday: (h >>> 5) % 14,
      cumLifetime: 150 + ((h >>> 7) % 9850),
      stamina: stat("sta", 10), horniness: stat("hor", 10), lifespan: stat("life", 10), secrets: stat("sec", 10),
      partners, upNext, image
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Re-skins the location as a Yu-Gi-Oh "Field Spell" - a grandiose suffix + over-dramatic flavour text.
function yugiohLocationFlavor(location) {
  const suffixes = window.GameData.yugiohField.suffixes;
  const lines = window.GameData.yugiohField.lines;
  const h = stableHash(`${state.gameSalt}:ygofield:${location.name}`);
  return { suffix: suffixes[h % suffixes.length], text: lines[(h >>> 4) % lines.length] };
}

// WHAT'S IN THE HAND?: everyone holds one of exactly 12 objects. Drag one onto another and the two
// objects BATTLE (Rock-Paper-Scissors style) - each beats the 5 that follow it around the ring, loses
// to the 5 before, and ties the one directly opposite. The loser is knocked off the board.
const PROP_BATTLE = [
  ["Rock", "🪨", "smashes"], ["Bag", "🛍️", "swallows"], ["Scissors", "✂️", "shreds"],
  ["Fire", "🔥", "burns"], ["Water", "💧", "douses"], ["Sponge", "🧽", "soaks up"],
  ["Sword", "🗡️", "slices"], ["Snake", "🐍", "poisons"], ["Boot", "🥾", "stomps"],
  ["Tree", "🌳", "outgrows"], ["Sun", "☀️", "scorches"], ["Moon", "🌙", "eclipses"]
];
// Does prop i beat prop j? +1 win, -1 loss, 0 draw. (Ring of 12: beat next 5, lose prev 5, tie +6.)
function propBattleResult(i, j) {
  if (i === j) return 0;
  const d = ((j - i) % 12 + 12) % 12;
  return d >= 1 && d <= 5 ? 1 : (d === 6 ? 0 : -1);
}
function applyPropPanic(effect) {
  const assignments = {};
  assignEvenCategories(state.board, PROP_BATTLE.map((p, i) => i), effect.id).forEach(({ character, value }) => {
    const p = PROP_BATTLE[value];
    assignments[character.id] = { propIdx: value, value: p[0], emoji: p[1] };
  });
  return { id: effect.id, name: effect.name, assignments };
}
// The duel: A's object is dragged onto B's. A VS overlay flashes the two, then the winner's object
// "verbs" the loser and the loser is crossed off (drag again on a downed card to revive).
function propBattle(A, B) {
  const asg = state.global.mystery?.assignments;
  const a = asg && asg[A.id], b = asg && asg[B.id];
  if (!a || !b || A.id === B.id) return;
  if (document.querySelector(".pb-overlay")) return;
  const res = propBattleResult(a.propIdx, b.propIdx);
  const ov = document.createElement("div");
  ov.className = "pb-overlay";
  ov.innerHTML = `<div class="pb-stage">
      <div class="pb-fighters">
        <span class="pb-fighter pb-a"><b>${a.emoji}</b><i>${escapeHtml(a.value)}</i></span>
        <span class="pb-vs">VS</span>
        <span class="pb-fighter pb-b"><b>${b.emoji}</b><i>${escapeHtml(b.value)}</i></span>
      </div>
      <div class="pb-result"></div>
    </div>`;
  document.body.appendChild(ov);
  sfx("blip");
  setTimeout(() => {
    const out = ov.querySelector(".pb-result");
    if (res === 0) {
      ov.classList.add("pb-draw");
      out.innerHTML = `🤝 <b>DRAW!</b> ${a.emoji} and ${b.emoji} are evenly matched.`;
      sfx("honk");
    } else {
      const win = res === 1 ? a : b, lose = res === 1 ? b : a;
      const winner = res === 1 ? A : B, loser = res === 1 ? B : A;
      ov.classList.add(res === 1 ? "pb-a-wins" : "pb-b-wins");
      out.innerHTML = `${win.emoji} <b>${escapeHtml(win.value)}</b> ${escapeHtml(PROP_BATTLE[win.propIdx][2])} ${lose.emoji} <b>${escapeHtml(lose.value)}</b>!`;
      ov._loserId = loser.id;
      ov._loserDown = currentPlayer().eliminated.has(loser.id);
      sfx("win");
    }
  }, 1400);
  setTimeout(() => {
    const loserId = ov._loserId;
    ov.remove();
    if (loserId) toggleEliminated(loserId);   // knock the loser off (or revive if already down)
  }, 2600);
}

function applyFamilyTreeDisaster(effect) {
  const roles = [
    "Mum",
    "Dad",
    "Twin",
    "Weird Uncle",
    "Cousin",
    "Step-aunt",
    "Work Nephew",
    "Baby Somehow",
    "Legal Guardian Maybe",
    "Family Friend Who Won’t Leave"
  ];
  const familyNames = [
    "Family A",
    "Family B",
    "The Suspicious Branch",
    "The Loud Cousins",
    "The Unclear Household"
  ];
  const clusterCount = Math.min(5, Math.max(3, Math.ceil(state.board.length / 8)));
  const sorted = deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:clusters`);
  const clusters = Array.from({ length: clusterCount }, (_, index) => ({
    id: `family-${index + 1}`,
    name: familyNames[index],
    className: `family-tone-${index + 1}`,
    characterIds: []
  }));
  const assignments = {};
  sorted.forEach((character, index) => {
    const cluster = clusters[index % clusterCount];
    const role = getDeterministicMysteryValue(character.id, roles, `${state.gameSalt}:${effect.id}:role`);
    cluster.characterIds.push(character.id);
    assignments[character.id] = { clusterId: cluster.id, role };
  });
  return { id: effect.id, name: effect.name, assignments, clusters };
}

const KNOCKOFF_ROOM_NAMES = [
  "DINING ROOM",
  "FOOD HALL",
  "BATHS ROOM",
  "WORSHIP HALL",
  "WHISPER KITCHEN",
  "KNIFE LIBRARY",
  "UPSTAIRS DOWNSTAIRS",
  "PANIC PARLOR",
  "GARAGE OF TRUTH",
  "FORMAL CLOSET",
  "SECOND LOUNGE",
  "CRIME NOOK",
  "LAUNDRY BALLROOM",
  "CONSERVATORY-ISH",
  "HALLWAY HALL",
  "STUDY BUDDY",
  "BILLIARD ADJACENT",
  "MUD ROOM COURT"
];

// A tight 3x3 of equal room blocks wrapping the central weapon pile (rows 4-6 / cols 4-6), so there's
// no big empty moat around the middle - every cell of the 9x9 grid is filled.
const KNOCKOFF_ROOM_LAYOUTS = [
  { row: 1, col: 1, rowSpan: 3, colSpan: 3 },
  { row: 1, col: 4, rowSpan: 3, colSpan: 3 },
  { row: 1, col: 7, rowSpan: 3, colSpan: 3 },
  { row: 4, col: 1, rowSpan: 3, colSpan: 3 },
  { row: 4, col: 7, rowSpan: 3, colSpan: 3 },
  { row: 7, col: 1, rowSpan: 3, colSpan: 3 },
  { row: 7, col: 4, rowSpan: 3, colSpan: 3 },
  { row: 7, col: 7, rowSpan: 3, colSpan: 3 }
];

const KNOCKOFF_ROOM_TONES = [
  "#ffd166",
  "#8bd3dd",
  "#f7a8b8",
  "#b8e986",
  "#cdb4db",
  "#f4a261",
  "#a8dadc",
  "#ffddd2",
  "#bde0fe",
  "#d9ed92"
];

const MURDER_WEAPONS = [
  { name: "candlestick", emoji: "🕯️" },
  { name: "kitchen knife", emoji: "🔪" },
  { name: "revolver-ish", emoji: "🔫" },
  { name: "wrench", emoji: "🔧" },
  { name: "rope", emoji: "🪢" },
  { name: "hammer", emoji: "🔨" },
  { name: "axe", emoji: "🪓" },
  { name: "poison bottle", emoji: "🧪" },
  { name: "shovel", emoji: "🪏" },
  { name: "brick", emoji: "🧱" }
];

function applyKnockoffManor(effect) {
  const roomCount = KNOCKOFF_ROOM_LAYOUTS.length;
  const roomNames = deterministicOrder(
    KNOCKOFF_ROOM_NAMES.map((name, index) => ({ id: `room-name-${index}`, name })),
    `${state.gameSalt}:${effect.id}:names`
  ).slice(0, roomCount);
  const rooms = roomNames.map((roomName, index) => ({
    id: `manor-room-${index + 1}`,
    name: roomName.name,
    row: KNOCKOFF_ROOM_LAYOUTS[index].row,
    col: KNOCKOFF_ROOM_LAYOUTS[index].col,
    rowSpan: KNOCKOFF_ROOM_LAYOUTS[index].rowSpan,
    colSpan: KNOCKOFF_ROOM_LAYOUTS[index].colSpan,
    tone: KNOCKOFF_ROOM_TONES[index % KNOCKOFF_ROOM_TONES.length]
  }));
  const assignments = {};
  deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:guests`).forEach((character, index) => {
    const room = rooms[index % rooms.length];
    assignments[character.id] = { roomId: room.id, roomName: room.name };
  });
  const bloodRoom = rooms[stableHash(`${state.gameSalt}:${effect.id}:blood-room`) % rooms.length];
  const weapons = deterministicOrder(MURDER_WEAPONS.map((weapon, index) => ({
    id: `weapon-${index}`,
    name: weapon.name,
    emoji: weapon.emoji
  })), `${state.gameSalt}:${effect.id}:weapons`).slice(0, 6);
  return { id: effect.id, name: effect.name, assignments, rooms, bloodRoomId: bloodRoom.id, weapons };
}

function applyEmotionalAudit(effect) {
  const meters = [
    "Happiness",
    "Anger",
    "Panic",
    "Suspicion",
    "Confidence",
    "Exhaustion",
    "Petty Grievance",
    "Divorce Energy",
    "Parking Rage",
    "Secretiveness",
    "Jazz Tolerance",
    "Apology Quality",
    "Dryness",
    "Overfamiliarity",
    "Passive Aggression",
    "Shame Buffer",
    "Mum Friend Energy",
    "Midnight Courage",
    "Flirt Risk",
    "Grudge Retention",
    "Escalation",
    "Office Poison",
    "Gossip Voltage",
    "Holiday Resentment",
    "Text Tone",
    "Bad News Glow",
    "Trustworthiness",
    "Dinner Party Damage",
    "Aunt Energy",
    "Lie Fluency",
    "Exit Strategy"
  ];
  const assignments = {};
  assignEvenCategories(state.board, meters, `${state.gameSalt}:${effect.id}:meters`).forEach(({ character, value: meter }) => {
    assignments[character.id] = {
      meter,
      value: stableHash(`${state.gameSalt}:${effect.id}:${character.id}:${character.name}`) % 101
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

function applyVibeLabels(effect) {
  const labels = [
    "Has Lore",
    "Replies All",
    "Would Bring Guitar",
    "Microwaves Fish",
    "Says Circle Back",
    "Owns an Air Fryer",
    "Sleeps in Jeans",
    "Knows a Shortcut",
    "Unpaid DJ Energy",
    "Has a Laminator",
    "Would Fake a Smile",
    "Keeps Receipts",
    "Talks in Threats",
    "Can Ruin a Picnic",
    "Brings Courtroom Energy",
    "Could Start a Rumour",
    "Competes With Children",
    "Makes Brunch Tense",
    "Would Win the Divorce",
    "Owns Decorative Knives",
    "Could Sell You a Lie",
    "Looks Financially Petty",
    "Would Cry on Cue",
    "Unclear Motives",
    "Weaponized Calm",
    "Suspiciously Polite",
    "Carries Emotional Debt",
    "Bad Textback Energy",
    "Knows Too Much",
    "Birthday Speech Risk",
    "May Be the Ex",
    "Subtweet Face",
    "Definitely Has a Folder",
    "Could Silence a Table",
    "Private Groupchat Vibe"
  ];
  const assignments = {};
  assignEvenCategories(state.board, labels, `${state.gameSalt}:${effect.id}`).forEach(({ character, value }) => {
    assignments[character.id] = { value };
  });
  return { id: effect.id, name: effect.name, assignments };
}

function applyWitnessProtectionFilter(effect) {
  // Weighted pool: black censor bars over the eyes/mouth are the most common redaction, a handful get
  // the CCTV/security-camera look, and the rest are sprinkled with the atmospheric filters. Each entry
  // is [label, className, weight]; higher weight = shows up on more people.
  const pool = [
    ["Eyes Redacted", "witness-eyebar", 5],
    ["Mouth Redacted", "witness-mouthbar", 3],
    ["Security Camera", "witness-security", 4],
    ["Aquarium Glass", "witness-aquarium", 1],
    ["Fog Machine", "witness-fog", 1],
    ["Interrogation Lamp", "witness-interrogation", 1],
    ["Smoke Alarm Incident", "witness-smoke", 1]
  ];
  const weighted = [];
  pool.forEach(([label, cls, w]) => { for (let i = 0; i < w; i++) weighted.push([label, cls]); });
  // Filter roughly 60% of the board (always including both players' secrets), each assigned a weighted
  // category - so bars and cameras can repeat across several people.
  const count = Math.max(6, Math.round(state.board.length * 0.6));
  const selectedIds = buildWitnessShortlist(effect.id, count);
  const reasons = (window.GameData && window.GameData.witnessReasons) || ["Snitched on the mob"];
  const assignments = {};
  selectedIds.forEach((id) => {
    const pickHash = stableHash(`${state.gameSalt}:${effect.id}:pick:${id}`);
    const [label, cls] = weighted[pickHash % weighted.length];
    assignments[id] = { value: label, className: cls, reason: reasons[stableHash(`${state.gameSalt}:wpr:${id}`) % reasons.length] };
  });
  return { id: effect.id, name: effect.name, assignments, selectedIds };
}

function applyRoleReveal(effect) {
  const assignments = {};
  state.board.forEach((character) => {
    assignments[character.id] = { value: roleFor(character.id) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut",
  "Florida", "Georgia", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Mexico", "New York", "Ohio", "Oklahoma",
  "Oregon", "Pennsylvania", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "Wisconsin", "Wyoming"
];

// The "true" feelings revealed behind the smile. Each label maps to one of the face generator's
// five expressions so generated portraits can actually re-render with the new mood.
const HIDDEN_EMOTIONS = [
  { key: "angry", label: "Furious", emoji: "😠" },
  { key: "sad", label: "Resentful", emoji: "😔" },
  { key: "surprised", label: "Rattled", emoji: "😦" },
  { key: "happy", label: "Smug", emoji: "😏" },
  { key: "neutral", label: "Scheming", emoji: "🫥" }
];

// Hidden Agendas: splits the board into red/blue political sides, gives everyone a home state, and
// flips their expression to a "true" feeling. Generated faces are repainted with the new emotion;
// the hand-illustrated PNG faces keep their art but still get the mood emoji + colour treatment.
function applyHiddenAgendas(effect) {
  const assignments = {};
  deterministicOrder(state.board, `${state.gameSalt}:${effect.id}:side`).forEach((character, index) => {
    const party = index % 2 === 0 ? "Democrat" : "Republican";
    const homeState = getDeterministicMysteryValue(character.id, US_STATES, `${state.gameSalt}:${effect.id}:state`);
    const current = character.traits ? character.traits.expression : null;
    const moodPool = HIDDEN_EMOTIONS.filter((mood) => mood.key !== current);
    const mood = getDeterministicMysteryValue(character.id, moodPool, `${state.gameSalt}:${effect.id}:mood`);
    const image = character.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(character.seed, { ...character.traits, expression: mood.key })
      : null;
    assignments[character.id] = { party, state: homeState, mood: mood.label, emoji: mood.emoji, image, stances: pickStances(character.id) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// Monocultural: repaints every generated face with ONE shared skin tone, randomly chosen from the
// generator's defined skin tones (so it's always a real human tone - never an alien/blue/etc).
function applyMonocultural(effect) {
  const tb = window.faceGenerator && window.faceGenerator.traitBook;
  const names = (tb && tb.skinTones) || ["fair"];
  const hexOf = (name) => (tb && tb.skinToneHex && tb.skinToneHex[name]) || "#c88968";
  const lum = (name) => { const n = parseInt(hexOf(name).replace("#", ""), 16); return 0.299 * ((n >> 16) & 255) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255); };
  // Monocultural goes to an extreme: everyone becomes either the WHITEST or the DARKEST tone.
  const sorted = [...names].sort((a, b) => lum(a) - lum(b));
  const skin = (stableHash(`${state.gameSalt}:mono`) % 2 === 0) ? sorted[0] : sorted[sorted.length - 1];
  const color = hexOf(skin);
  const assignments = {};
  state.board.forEach((character) => {
    const image = character.traits && window.faceGenerator
      ? window.faceGenerator.renderPortrait(character.seed, { ...character.traits, skin })
      : null;
    assignments[character.id] = { image };
  });
  return { id: effect.id, name: effect.name, color, assignments };
}

// Gay Frogged: everyone gets LGBTQIA+ letter(s) + an orientation title, independently assigned.
const PRIDE_LETTERS_POOL = [
  { letters: ["L"],        key: "L",    color: "#e40303" },
  { letters: ["G"],        key: "G",    color: "#ff8c00" },
  { letters: ["B"],        key: "B",    color: "#ffd400" },
  { letters: ["T"],        key: "T",    color: "#2ecc71" },
  { letters: ["Q"],        key: "Q",    color: "#00bcd4" },
  { letters: ["I"],        key: "I",    color: "#3a86ff" },
  { letters: ["A"],        key: "A",    color: "#8338ec" },
  { letters: ["+"],        key: "plus", color: "#ff4fd8" },
  { letters: ["L", "G"],   key: "LG",   color: "#ff6b35" },
  { letters: ["B", "T"],   key: "BT",   color: "#55efc4" },
  { letters: ["Q", "I"],   key: "QI",   color: "#74b9ff" },
  { letters: ["Q", "I", "A"], key: "QIA", color: "#4a90e2" },
];

const PRIDE_PRONOUNS_POOL = [
  "he/him", "she/her", "they/them", "they/them",
  "this/that", "this/that", "xe/xem", "ze/zir",
  "it/its", "she/they", "he/they", "any/all",
];

const PRIDE_TITLES_POOL = [
  "gay", "ultragay", "bisexual", "pansexual", "demisexual",
  "supersexual", "faggot", "fat++", "queer", "fluid",
  "unlabelled", "arospec", "asexual", "curious", "sapphic",
  "straight+", "omnisexual", "graysexual", "it's complicated",
  "homoflexible", "skoliosexual", "lithosexual", "polyamorous",
  "butch", "femme", "twink", "bear", "masc4masc",
];

function applyGayFrogged(effect) {
  const assignments = {};
  const letterAssignments = {};
  const titleAssignments = {};
  assignEvenCategories(state.board, PRIDE_LETTERS_POOL, `${state.gameSalt}:${effect.id}:letters`).forEach(({ character, value }) => {
    letterAssignments[character.id] = value;
  });
  assignEvenCategories(state.board, PRIDE_TITLES_POOL, `${state.gameSalt}:${effect.id}:titles`).forEach(({ character, value }) => {
    titleAssignments[character.id] = value;
  });
  const pronounAssignments = {};
  assignEvenCategories(state.board, PRIDE_PRONOUNS_POOL, `${state.gameSalt}:${effect.id}:pronouns`).forEach(({ character, value }) => {
    pronounAssignments[character.id] = value;
  });
  state.board.forEach((character) => {
    const letter = letterAssignments[character.id];
    assignments[character.id] = {
      letters: letter?.letters || ["Q"],
      key: letter?.key || "Q",
      color: letter?.color || "#00bcd4",
      title: titleAssignments[character.id] || "queer",
      pronoun: pronounAssignments[character.id] || "they/them",
    };
  });

  // Shuffle hairstyles between characters and re-render portraits
  if (window.faceGenerator) {
    const eligible = state.board.filter((c) => c.traits);
    const hairPool = shuffle(eligible.map((c) => ({ hair: c.traits.hair, hairColor: c.traits.hairColor, hairProfile: c.traits.hairProfile, hairLocks: c.traits.hairLocks, frontHairY: c.traits.frontHairY })));
    eligible.forEach((character, index) => {
      const swappedHair = hairPool[index];
      const image = window.faceGenerator.renderPortrait(character.seed, { ...character.traits, ...swappedHair });
      if (assignments[character.id]) {
        assignments[character.id].image = image;
      }
    });
  }

  return { id: effect.id, name: effect.name, assignments };
}

// Face First: crops every portrait in tight so only the face fills the tile.
function applyFaceFirst(effect) {
  const assignments = {};
  state.board.forEach((character) => {
    assignments[character.id] = {};
  });
  return { id: effect.id, name: effect.name, assignments };
}

function applyPs1Mode(effect) {
  if (ps1Install) {
    ps1Cleanup = ps1Install();
  }
  return { id: effect.id, name: effect.name };
}

// Full-frame announcement: a white flash plus the effect's name, each letter flung in from
// off-screen along its own path to slam together in the centre.
// Per-mode flash colour behind the effect title. "rainbow" gets a special conic wash.
const MODE_FLASH = {
  disease: "#e0341a", "gay-frogged": "rainbow", orgy: "#ff2d6f", drugs: "#8a5cff", fertility: "#ff5a7d",
  work: "#8a1a1a", woke: "#ff5ad0", judgement: "#ffcf4d", sims: "#3ec46a", swipe: "#ff5a72",
  habbo: "#2fb6d8", astrology: "#8c5af0", fireworks: "#ffd24d", yugioh: "#a05aff", disguise: "#0b0b0d",
  "witness-protection-filter": "#c9d200", pixall: "#5dff8f", monocultural: "#c88968", "heads-only": "#7a5cff",
  "hidden-agendas": "#3a5fd0"
};
function playEffectAnnouncement(name) {
  sfx("reveal");
  const prev = document.getElementById("effectBlast");
  if (prev) prev.remove();

  const overlay = document.createElement("div");
  overlay.id = "effectBlast";
  overlay.className = "effect-blast";

  // Full-screen colour flash behind the letters, tinted to the active mode.
  const col = MODE_FLASH[state.global.mystery?.id] || "#ffbe0b";
  const bg = document.createElement("div");
  bg.className = "effect-blast-bg";
  bg.style.background = col === "rainbow"
    ? "conic-gradient(from 0deg, #ff5a5a, #ffb14e, #ffe83a, #5dff8f, #4dd2ff, #c46bff, #ff5a5a)"
    : `radial-gradient(circle at 50% 45%, ${col}, transparent 70%)`;
  overlay.appendChild(bg);

  const flash = document.createElement("div");
  flash.className = "effect-blast-flash";
  overlay.appendChild(flash);

  const word = document.createElement("div");
  word.className = "effect-blast-word";
  // Group letters into per-word chunks that never break internally, so the title wraps BETWEEN words.
  let blastIndex = 0;
  name.toUpperCase().split(" ").forEach((wordText) => {
    const chunk = document.createElement("span");
    chunk.className = "effect-blast-wordpart";
    [...wordText].forEach((ch) => {
      const span = document.createElement("span");
      span.className = "effect-blast-letter";
      span.textContent = ch;
      const dir = blastIndex % 2 === 0 ? -1 : 1;
      span.style.setProperty("--dx", `${dir * (55 + Math.random() * 45)}vw`);
      span.style.setProperty("--dy", `${(Math.random() - 0.5) * 70}vh`);
      span.style.setProperty("--rot", `${dir * (15 + Math.random() * 35)}deg`);
      span.style.setProperty("--delay", `${blastIndex * 40}ms`);
      chunk.appendChild(span);
      blastIndex++;
    });
    word.appendChild(chunk);
  });
  overlay.appendChild(word);

  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 3050);   // linger - let the title actually land
}

function showMysteryAnnouncement(_effectName, _exampleQuestion) {
  // No static example line any more - instead the live question switches into the mode's own deck.
  els.mysteryResult.textContent = "";
  drawPrompt();
}

function assignEvenCategories(characters, values, salt) {
  return deterministicOrder(characters, salt).map((character, index) => ({
    character,
    value: values[index % values.length]
  }));
}

function getDeterministicMysteryValue(characterId, valueList, salt) {
  return valueList[stableHash(`${salt}:${characterId}`) % valueList.length];
}

function deterministicOrder(items, salt) {
  return [...items].sort((a, b) => {
    const aHash = stableHash(`${salt}:${a.id}:${a.name}`);
    const bHash = stableHash(`${salt}:${b.id}:${b.name}`);
    return aHash - bHash;
  });
}

function buildWitnessShortlist(effectId, count) {
  const forced = Array.from(new Set(state.players.map((player) => player.secretId)));
  const ordered = deterministicOrder(state.board, `${state.gameSalt}:${effectId}:shortlist`);
  const chosen = [...forced];
  ordered.forEach((character) => {
    if (chosen.length >= Math.min(count, state.board.length)) return;
    if (!chosen.includes(character.id)) chosen.push(character.id);
  });
  return chosen.slice(0, Math.min(count, state.board.length));
}

function stableHash(value) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

const GRINDR_TAGS = [
  "bb", "fisting", "group", "leather", "gape", "doggy",
  "oral", "vers", "top", "bottom", "pig", "daddy",
  "kinky", "hung", "bear", "otter", "twink", "cub",
  "wolf", "jock", "masc", "fem", "dom", "sub",
  "feet", "rim", "raw", "pup", "gear", "sling",
  "safe", "pnp", "420", "party", "discreet", "str8",
  "hairy", "smooth", "chub", "muscle", "thick", "lean",
  "nsa", "ltr", "host", "travel", "now", "tonight",
];

function characterTags(character) {
  const h = stableHash(character.id + ":tags");
  const count = 2 + (h % 3);
  const tags = [];
  for (let i = 0; i < count; i++) {
    const tag = GRINDR_TAGS[stableHash(character.id + ":tag:" + i) % GRINDR_TAGS.length];
    if (!tags.includes(tag)) tags.push(tag);
  }
  return tags;
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
  mysteryEffects.forEach((effect) => {
    if (state.settings.pg && !PG_SAFE_MODES.includes(effect.id)) return;
    const opt = document.createElement("option");
    opt.value = effect.id;
    opt.textContent = effect.name;
    els.debugEffectPicker.appendChild(opt);
  });
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
    state.settings.pg = pgInput.checked;
    if (els.settingPG) els.settingPG.checked = pgInput.checked;
    rebuildDebugPicker();
    flashToast(pgInput.checked ? "🧒 PG mode ON — adult modes hidden" : "PG mode OFF");
  });
  els.debugEffectPicker.parentNode.insertBefore(pgWrap, els.debugEffectPicker.nextSibling);
  els.debugEffectPicker.addEventListener("change", () => {
    const id = els.debugEffectPicker.value;
    els.debugEffectPicker.value = "";
    const effect = mysteryEffects.find((item) => item.id === id);
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
  askAdultRiddle((ok) => { els.settingPG.checked = !ok; state.settings.pg = !ok; });
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
  const host = state.gameMode !== "online" || (state.mySeat || 0) === 0;
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

// ===================== Online layer (room-synced clients) =====================
// The transport is a BroadcastChannel keyed by room code - two tabs/windows in the same browser ARE
// two online clients (each drives one seat). Because a round is fully derived from its salt, the
// protocol only needs to carry the salt plus live events (eliminations, babies, conversions,
// round-end); a future WebSocket relay can speak this exact protocol.
let net = null;
let netRoom = null;          // the room the current socket is connected to
let netReconnectTimer = null;
function setNetStatus(s) { state.netStatus = s; const el = document.querySelector(".or-status"); if (el && state.gameMode === "online") el.textContent = s === "open" ? (state.onlinePeer ? "🟢 friend connected" : "🟡 connected — waiting for a friend…") : s === "connecting" ? "🟠 connecting…" : "🔴 disconnected — retrying…"; updateLobby(); }
// Cross-device transport: add ?relay=ws://<host>:8765 to the URL on every device and run
// `python3 relay.py` on one machine - the relay fans messages out per room. Without the param the
// transport is a BroadcastChannel (two tabs in the same browser). Same protocol either way.
// Where the room-sync WebSocket lives. Priority: an explicit ?relay=ws://host param (local dev with
// a separate relay); else, when the page is served over http(s) from a real host (a deployment),
// use the SAME origin - so a deployed single-container build "just works" with no param. On plain
// localhost/file with no param we stay on BroadcastChannel (two tabs = two clients).
const NET_RELAY = (() => {
  try {
    const explicit = new URLSearchParams(location.search).get("relay");
    if (explicit) return explicit.replace(/\/+$/, "");
    const isLocal = /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?)/.test(location.hostname) || location.protocol === "file:";
    if (!isLocal && (location.protocol === "http:" || location.protocol === "https:")) {
      return `${location.protocol === "https:" ? "wss:" : "ws:"}//${location.host}`;
    }
  } catch (e) { /* fall through to BroadcastChannel */ }
  return null;
})();
function netConnect(force) {
  // Already on the right room's socket? Don't tear it down (that would drop the peer mid-game).
  if (!force && net && netRoom === state.roomCode) return;
  clearTimeout(netReconnectTimer);
  try { if (net) net.close(); } catch (e) { /* already closed */ }
  net = null; netRoom = state.roomCode;
  const room = state.roomCode;
  if (NET_RELAY) {
    setNetStatus("connecting");
    let ws;
    try { ws = new WebSocket(`${NET_RELAY}/${room}`); }
    catch (e) { setNetStatus("closed"); scheduleReconnect(room); return; }
    const queue = [];
    ws.onopen = () => { setNetStatus("open"); netSend("hello", { pname: state.pname }); while (queue.length) ws.send(queue.shift()); };
    ws.onmessage = (e) => { try { handleNetMsg(JSON.parse(e.data)); } catch (err) { /* junk frame */ } };
    ws.onerror = () => { /* onclose follows */ };
    ws.onclose = () => { if (netRoom === room && state.gameMode === "online") { setNetStatus("closed"); scheduleReconnect(room); } };
    net = {
      post: (m) => { const s = JSON.stringify(m); if (ws.readyState === 1) ws.send(s); else if (ws.readyState === 0) queue.push(s); },
      close: () => { try { ws.onclose = null; ws.close(); } catch (e) { /* fine */ } }
    };
    return;
  }
  try {
    const bc = new BroadcastChannel(`whoisit-room-${room}`);
    bc.onmessage = (e) => handleNetMsg(e.data || {});
    net = { post: (m) => bc.postMessage(m), close: () => bc.close() };
    setNetStatus("open");
    netSend("hello", { pname: state.pname });
  } catch (e) { net = null; /* no BroadcastChannel - offline only */ }
}
// Reconnect to the SAME room after a drop (the room is stable through a game, so this recovers a
// flaky connection instead of silently going dead).
function scheduleReconnect(room) {
  clearTimeout(netReconnectTimer);
  netReconnectTimer = setTimeout(() => {
    if (state.gameMode === "online" && state.roomCode === room) { netRoom = null; netConnect(true); }
  }, 1500);
}
function netSend(type, data) {
  if (!net) return;
  try { net.post({ type, seat: state.mySeat || 0, ...data }); } catch (e) { /* channel closed */ }
}
function markPeerOnline() {
  if (!state.onlinePeer) {
    state.onlinePeer = true;
    stopOpponentSim();                       // a REAL opponent replaces the AI sim
    addLog("Another player connected to the room.");
    if (els.roomStatus) els.roomStatus.textContent = "";
    renderRoom();                            // flip the room panel to "friend connected"
  }
}
function handleNetMsg(msg) {
  if (!msg || typeof msg !== "object") return;
  if (msg.type === "sfx") { if (window.Sound && typeof msg.name === "string") window.Sound.play(msg.name); return; }
  if (msg.type === "music") { if (window.Sound) { window.Sound.setTrack(Number(msg.track) || 0); window.Sound.setMusic(!!msg.on); } return; }
  if (msg.type === "editchar") {
    // The other player restyled a board character - apply their traits + re-render our copy.
    const c = state.board.find((x) => x.id === msg.id);
    if (c && msg.traits) {
      c.traits = msg.traits; if (msg.name) c.name = msg.name; if (msg.pronouns) c.pronouns = msg.pronouns;
      try { c.image = window.faceGenerator.renderPortrait(msg.seed != null ? msg.seed : c.seed, c.traits); } catch (e) { /* keep old */ }
      if (state.global.mystery) { const eff = mysteryEffects.find((x) => x.id === state.global.mystery.id); if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (err) { /* fine */ } } }
      renderBoard(); renderSecret();
      flashToast(`🎨 A friend restyled ${c.name}.`);
    }
    return;
  }
  if (msg.type === "hello") {
    markPeerOnline();
    const seat = msg.seat === 0 ? 0 : 1;
    if (state.inLobby) {
      // Lobby: record the newcomer's name, announce their arrival, reply once so they learn us too.
      state.lobby = state.lobby || {};
      if (msg.pname && state.lobby[seat] !== msg.pname) { state.lobby[seat] = msg.pname; addLog(`${msg.pname} has arrived.`); }
      updateLobby();
      state.seenPeers = state.seenPeers || new Set();
      if (!state.seenPeers.has(seat)) { state.seenPeers.add(seat); netSend("hello", { pname: state.pname }); }
      return;
    }
    // Mid-game newcomer: sync them into the current round.
    netSend("sync", { salt: state.gameSalt, settings: state.settings, effectId: state.wheelPick });
    return;
  }
  if (msg.type === "sync") {
    markPeerOnline();
    if (msg.salt && msg.salt !== state.gameSalt) {
      state.settings = { ...state.settings, ...(msg.settings || {}) };
      state.mySeat = msg.seat === 0 ? 1 : 0;   // take the other seat
      newGame(msg.salt, { remote: true, effectId: msg.effectId });
    } else if ((state.mySeat || 0) === (msg.seat || 0)) {
      // Same round (e.g. second tab resumed the same save) but we collided on the seat - the
      // newcomer (that's us: we sent the hello this sync answers) yields to the other one.
      state.mySeat = msg.seat === 0 ? 1 : 0;
      state.currentPlayer = state.mySeat;
      render();
    }
    return;
  }
  if (msg.type === "start") {
    markPeerOnline();
    state.settings = { ...state.settings, ...(msg.settings || {}) };
    if (msg.names) { state.lobby = msg.names; state.pname = msg.names[state.mySeat || 0] || state.pname; }
    state.inLobby = false;
    document.querySelector(".lobby-screen")?.remove();
    newGame(msg.salt, { remote: true, effectId: msg.effectId, first: msg.first === true });
    return;
  }
  if (msg.type === "elim") {
    markPeerOnline();
    const seat = msg.seat === 0 ? 0 : 1;
    if (seat === (state.mySeat || 0)) return;      // our own echo
    const p = state.players[seat];
    if (!p) return;
    if (msg.down) p.eliminated.add(msg.id); else p.eliminated.delete(msg.id);
    // Feed shows CURRENT crossings only: un-crossing removes the entry (no add/remove/add doubling).
    state.opponentLog = (state.opponentLog || []).filter((e) => !(e.seat === seat && e.id === msg.id));
    if (msg.down) state.opponentLog.unshift({ seat, id: msg.id, t: Date.now() });
    renderOpponentPanel();
    return;
  }
  if (msg.type === "baby") {
    markPeerOnline();
    if (!msg.baby || state.board.some((c) => c.id === msg.baby.id)) return;
    const baby = { ...msg.baby };
    if (baby.traits && window.faceGenerator) { try { baby.image = window.faceGenerator.renderPortrait(baby.seed, baby.traits); } catch (e) { return; } }
    state.board.push(baby);
    // Re-run the mode's apply so the newcomer gets per-baby stats on this client too.
    const eff = mysteryEffects.find((e2) => e2.id === state.global.mystery?.id);
    if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (e) { /* fine */ } }
    addLog(`${baby.name} arrived from the other seat!`);
    renderBoard();
    return;
  }
  if (msg.type === "tug") {
    markPeerOnline();
    const asg = state.global.mystery?.assignments;
    if (asg && asg[msg.loserId]) { asg[msg.loserId] = { ...asg[msg.loserId], party: msg.party, converted: true }; renderBoard(); }
    return;
  }
  if (msg.type === "manor-move") {
    markPeerOnline();
    const mystery = state.global.mystery;
    if (mystery?.id === "knockoff-manor") {
      const room = (mystery.rooms || []).find((r) => r.id === msg.roomId);
      const asg = mystery.assignments[msg.charId];
      if (room && asg) { asg.roomId = room.id; asg.roomName = room.name; renderBoard(); }
    }
    return;
  }
  if (msg.type === "mode") {
    markPeerOnline();
    const eff = mysteryEffects.find((e2) => e2.id === msg.id);
    if (eff) {
      applyMysteryEffect(eff.id);
      playEffectAnnouncement(eff.name);
      showMysteryAnnouncement(eff.name, eff.exampleQuestion);
      render();
      scheduleSave();
    }
    return;
  }
  if (msg.type === "endround") {
    markPeerOnline();
    showRoundReveal();   // the follow-up "start" message deals the new round
  }
}
// Strip a character down to what another client (or a save file) needs to rebuild them.
function serializeCharacter(ch) {
  const { image, ...rest } = ch;
  return JSON.parse(JSON.stringify(rest));
}
function netAnnounceBaby(baby) { netSend("baby", { baby: serializeCharacter(baby) }); }

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
      currentPlayer: state.currentPlayer,
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
  state.abortedBabies = saved.abortedBabies || [];
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
// End of round: the big reveal - BOTH secret characters side by side, then the next round deals.
function showRoundReveal(done) {
  const secA = characterById(state.players[0].secretId);
  const secB = characterById(state.players[1].secretId);
  const my = state.gameMode === "online" ? (state.mySeat || 0) : state.currentPlayer;
  const mine = my === 0 ? secA : secB;
  const theirs = my === 0 ? secB : secA;
  const ov = document.createElement("div");
  ov.className = "round-reveal";
  ov.innerHTML = `
    <div class="rr-title">ROUND OVER</div>
    <div class="rr-cards">
      <div class="rr-card"><span class="rr-label rr-you">YOU WERE</span><img src="${mine ? mine.image : ""}" alt=""><span class="rr-name">${escapeHtml(mine ? mine.name : "?")}</span></div>
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
// Disabling PG mode requires solving an adults-only riddle (free text) - the answers are all bits of
// grown-up life a 10-year-old wouldn't know. cb(true) if solved, cb(false) if cancelled/given up.
const ADULT_RIDDLES = [
  { q: "I visit every adult once a year, take a cut of all you earned, and no child has ever paid me. What am I?", a: ["tax", "taxes", "taxman", "the taxman", "income tax", "hmrc", "irs"] },
  { q: "I'm the loan that chains you to one house for thirty years. One word — what am I?", a: ["mortgage", "a mortgage"] },
  { q: "\"Nothing in life is certain except death and ___.\" Fill in the blank.", a: ["taxes", "tax"] },
  { q: "I'm taken from your wage before it even lands, I pay for the roads and hospitals, and grown-ups dread me every payslip. What am I?", a: ["tax", "taxes", "national insurance", "ni"] },
  { q: "Adults sign me to rent a home, I list what you can't do, and I always want a deposit. What am I?", a: ["lease", "tenancy", "a lease", "tenancy agreement", "rental agreement", "contract"] }
];
function askAdultRiddle(cb) {
  const r = ADULT_RIDDLES[Math.floor(Math.random() * ADULT_RIDDLES.length)];
  const ov = document.createElement("div");
  ov.className = "riddle-overlay";
  ov.innerHTML = `<div class="riddle-box">
      <p class="riddle-eyebrow">🔞 Adults only — solve this to turn PG off</p>
      <p class="riddle-q">${escapeHtml(r.q)}</p>
      <input class="riddle-input" type="text" placeholder="type your answer…" autocomplete="off" spellcheck="false">
      <p class="riddle-msg"></p>
      <div class="riddle-actions">
        <button type="button" class="button ghost riddle-cancel">Never mind</button>
        <button type="button" class="button primary riddle-go">Answer</button>
      </div>
    </div>`;
  document.body.appendChild(ov);
  const input = ov.querySelector(".riddle-input");
  const msg = ov.querySelector(".riddle-msg");
  setTimeout(() => input.focus(), 60);
  const done = (ok) => { ov.remove(); cb(ok); };
  const submit = () => {
    const val = input.value.trim().toLowerCase().replace(/[^a-z ]/g, "").replace(/\s+/g, " ").trim();
    if (r.a.includes(val)) done(true);
    else { msg.textContent = "That's not it — PG mode stays on. (Ask a grown-up.)"; input.classList.add("shake"); setTimeout(() => input.classList.remove("shake"), 400); input.select(); }
  };
  ov.querySelector(".riddle-go").addEventListener("click", submit);
  ov.querySelector(".riddle-cancel").addEventListener("click", () => done(false));
  input.addEventListener("keydown", (e) => { if (e.key === "Enter") submit(); if (e.key === "Escape") done(false); });
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
        <button type="button" class="button primary ts-local">🛋 LOCAL GAME</button>
        <button type="button" class="button secondary ts-online">🌐 ONLINE GAME</button>
        ${saved ? `<button type="button" class="button ghost ts-resume">↩ RESUME ROUND · #${(stableHash(saved.salt) % 9000) + 1000}</button>` : ""}
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
    <button type="button" class="ts-pg ${state.settings.pg ? "on" : ""}" aria-pressed="${state.settings.pg}">🧒 PG mode: <b>${state.settings.pg ? "ON" : "OFF"}</b></button>
    <p class="ts-hint">Local = pass one screen back and forth. Online = share your room number with a friend.</p>`;
  document.body.appendChild(ov);
  const close = () => { ov.classList.add("ts-out"); setTimeout(() => ov.remove(), 500); };
  // PG toggle: turning it ON is free; turning it OFF is gated behind an adults-only riddle.
  const pgBtn = ov.querySelector(".ts-pg");
  const paintPg = () => { pgBtn.classList.toggle("on", state.settings.pg); pgBtn.querySelector("b").textContent = state.settings.pg ? "ON" : "OFF"; pgBtn.setAttribute("aria-pressed", String(state.settings.pg)); };
  pgBtn.addEventListener("click", () => {
    if (!state.settings.pg) { state.settings.pg = true; if (els.settingPG) els.settingPG.checked = true; paintPg(); sfx("blip"); return; }
    askAdultRiddle((ok) => { if (ok) { state.settings.pg = false; if (els.settingPG) els.settingPG.checked = false; paintPg(); sfx("coin"); } else { sfx("buzzer"); } });
  });
  const steps = {
    main: ov.querySelector(".ts-step-main"),
    online: ov.querySelector(".ts-step-online"),
    join: ov.querySelector(".ts-step-join")
  };
  const show = (name) => Object.entries(steps).forEach(([k, el]) => { el.hidden = k !== name; });
  ov.querySelector(".ts-local").addEventListener("click", () => { close(); startLocalGame(); });
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

// LOCAL: pass-and-play on one screen - the YOU/B seat toggle is how you swap turns.
function startLocalGame() { state.gameMode = "local"; state.mySeat = 0; state.inLobby = false; newGame(undefined, { first: true }); }

// ONLINE host: open a LOBBY (no round dealt yet). The room's salt is fixed now so the room code is
// stable through the eventual deal; players gather, then the host presses START.
function startOnlineGame(name) {
  state.gameMode = "online"; state.mySeat = 0; state.inLobby = true;
  state.pname = name || "Player 1";
  state.gameSalt = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  state.roomCode = String((stableHash(state.gameSalt) % 9000) + 1000);
  state.lobby = { 0: state.pname };
  state.seenPeers = new Set();
  netConnect();
  showLobby();
}
// ONLINE guest: connect to the host's room and wait in the lobby for them to start.
function joinRoom(code, name) {
  state.gameMode = "online"; state.mySeat = 1; state.inLobby = true;
  state.pname = name || "Player 2";
  state.roomCode = code;
  state.lobby = { 1: state.pname };
  state.seenPeers = new Set();
  netConnect();
  showLobby();
}

// The waiting room: room number, who's arrived, and (host only) a START button once a friend joins.
function showLobby() {
  document.querySelector(".lobby-screen")?.remove();
  const host = (state.mySeat || 0) === 0;
  const ov = document.createElement("div");
  ov.className = "lobby-screen title-screen";
  ov.innerHTML = `
    <div class="ts-words" aria-hidden="true"><span class="ts-who">WHO?</span><span class="ts-isit">IS IT?</span></div>
    <p class="lobby-code">ROOM <b>#${escapeHtml(state.roomCode)}</b></p>
    <div class="lobby-players"></div>
    <p class="lobby-status"></p>
    <div class="lobby-actions">
      ${host ? `<button type="button" class="button primary lobby-start" disabled>START</button>` : ""}
      <button type="button" class="button ghost lobby-leave">← leave</button>
    </div>`;
  document.body.appendChild(ov);
  ov.querySelector(".lobby-leave").addEventListener("click", () => { state.inLobby = false; try { net && net.close(); } catch (e) {} ov.remove(); showTitleScreen(); });
  const startBtn = ov.querySelector(".lobby-start");
  if (startBtn) startBtn.addEventListener("click", () => {
    state.inLobby = false;
    ov.classList.add("ts-out"); setTimeout(() => ov.remove(), 400);
    // The opening online round is plain Guess Who (no effect, no wheel) for both seats.
    state.wheelPickShared = null;
    netSend("start", { salt: state.gameSalt, settings: state.settings, names: state.lobby, effectId: null, first: true });
    newGame(state.gameSalt, { effectId: null, announced: true, first: true });
  });
  updateLobby();
}
function updateLobby() {
  const ov = document.querySelector(".lobby-screen");
  if (!ov) return;
  const names = state.lobby || {};
  const both = names[0] && names[1];
  ov.querySelector(".lobby-players").innerHTML = [0, 1].map((s) => {
    const nm = names[s];
    const me = s === (state.mySeat || 0);
    return `<div class="lobby-player ${nm ? "here" : "empty"}">${nm ? `✅ ${escapeHtml(nm)}${me ? " (you)" : ""}` : "⏳ waiting for a friend…"}</div>`;
  }).join("");
  ov.querySelector(".lobby-status").textContent = both ? ((state.mySeat || 0) === 0 ? "Everyone's here — press START." : "Waiting for the host to start…") : `Share room #${state.roomCode} with a friend.`;
  const startBtn = ov.querySelector(".lobby-start");
  if (startBtn) startBtn.disabled = !both;
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
(function () {
  const boardSelector = "#characterBoard";
  const cardSelector = ".character-card";
  const portraitSelector = ".portrait-wrap";
  const secretSelector = "#secretCard";
  const locationSelector = "#locationBand";

  function stableHash(value) {
    let hash = 2166136261;
    const text = String(value || "ps1");
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  function makePalette(seed) {
    const palette = [
      ["#101824", "#f4c45f"],
      ["#131a2a", "#efb86d"],
      ["#1b1524", "#dec769"],
      ["#16191d", "#f0a65d"],
      ["#141d16", "#d2c75d"],
      ["#171321", "#e2b1ff"]
    ];
    const [booth, light] = palette[seed % palette.length];
    return {
      booth,
      light,
      skin: seed % 3 === 0 ? "#b87454" : seed % 3 === 1 ? "#d59a70" : "#8f5d43",
      skinDark: seed % 3 === 0 ? "#83513e" : seed % 3 === 1 ? "#a86f50" : "#65402f",
      skinLight: seed % 3 === 0 ? "#d59068" : seed % 3 === 1 ? "#efb17f" : "#a97454",
      hair: seed % 4 === 0 ? "#2b1c18" : seed % 4 === 1 ? "#7b4328" : seed % 4 === 2 ? "#151515" : "#c58b2f",
      hairLight: seed % 4 === 0 ? "#5a3529" : seed % 4 === 1 ? "#a96338" : seed % 4 === 2 ? "#373737" : "#e0b95b"
    };
  }

  function cssUrl(value) {
    return `url("${String(value).replace(/"/g, '\\"')}")`;
  }

  function createStage(card, portrait, image) {
    const seed = stableHash(card.dataset.id || image.currentSrc || image.src);
    const colors = makePalette(seed);
    const stage = document.createElement("div");
    stage.className = "ps1-character-stage";
    stage.setAttribute("aria-hidden", "true");
    stage.style.setProperty("--ps1-face", cssUrl(image.currentSrc || image.src));
    stage.style.setProperty("--ps1-booth", colors.booth);
    stage.style.setProperty("--ps1-light", colors.light);
    stage.style.setProperty("--ps1-skin", colors.skin);
    stage.style.setProperty("--ps1-skin-dark", colors.skinDark);
    stage.style.setProperty("--ps1-skin-light", colors.skinLight);
    stage.style.setProperty("--ps1-hair", colors.hair);
    stage.style.setProperty("--ps1-hair-light", colors.hairLight);
    const angle = (seed % 9) - 4;
    stage.style.setProperty("--ps1-angle", `${angle}deg`);
    stage.style.setProperty("--ps1-hover-angle", `${Math.round(angle * -0.4)}deg`);
    stage.style.setProperty("--ps1-bob-delay", `${-(seed % 4800)}ms`);

    stage.innerHTML = `
      <div class="ps1-booth">
        <span class="ps1-floor"></span>
        <div class="ps1-head-rig">
          <span class="ps1-shadow"></span>
          <div class="ps1-head-blob">
            <span class="ps1-head-core"></span>
            <span class="ps1-map-plane ps1-map-left"></span>
            <span class="ps1-map-plane ps1-map-right"></span>
            <span class="ps1-ear ps1-ear-left"></span>
            <span class="ps1-ear ps1-ear-right"></span>
            <span class="ps1-map-plane ps1-map-top"></span>
            <span class="ps1-map-plane ps1-map-front"></span>
            <span class="ps1-front-facet ps1-front-facet-brow"></span>
            <span class="ps1-front-facet ps1-front-facet-left"></span>
            <span class="ps1-front-facet ps1-front-facet-right"></span>
            <span class="ps1-front-facet ps1-front-facet-jaw"></span>
            <span class="ps1-nose-facet"></span>
            <span class="ps1-chin-facet"></span>
          </div>
        </div>
        <span class="ps1-scanline"></span>
      </div>
    `;

    const prop = portrait.querySelector(".prop-overlay");
    portrait.classList.add("has-ps1-character");
    portrait.insertBefore(stage, prop || null);
  }

  function syncPortrait(container, image, id) {
    let stage = container.querySelector(":scope > .ps1-character-stage");
    if (!stage) {
      createStage({ dataset: { id } }, container, image);
      stage = container.querySelector(":scope > .ps1-character-stage");
    }

    if (stage) {
      if (stage.dataset.textureSampled !== "true") {
        stage.style.setProperty("--ps1-face", cssUrl(image.currentSrc || image.src));
      }
      sampleTextureColors(stage, image);
    }
  }

  function syncStage(card) {
    const portrait = card.querySelector(portraitSelector);
    const image = portrait?.querySelector(":scope > img");
    if (!portrait || !image) return;
    syncPortrait(portrait, image, card.dataset.id || image.src);
  }

  function enhanceBoard(board) {
    board.querySelectorAll(cardSelector).forEach(syncStage);
  }

  function enhanceSecret(secretCard) {
    if (!secretCard || secretCard.classList.contains("is-hidden")) return;
    let wrapper = secretCard.querySelector(":scope > .ps1-secret-portrait");
    let image = wrapper?.querySelector(":scope > img") || secretCard.querySelector(":scope > img");
    if (!image) return;

    if (!wrapper) {
      wrapper = document.createElement("div");
      wrapper.className = "portrait-wrap ps1-secret-portrait";
      secretCard.insertBefore(wrapper, image);
      wrapper.appendChild(image);
    }

    syncPortrait(wrapper, image, `secret-${image.alt || image.src}`);
  }

  function enhanceLocation(locationBand) {
    const photo = locationBand?.querySelector(".location-photo");
    if (!photo) return;
    const source = extractCssUrl(photo.style.backgroundImage);
    if (!source || photo.dataset.ps1Source === source) return;
    photo.dataset.ps1Source = source;

    const image = new Image();
    image.onload = () => {
      try {
        const texture = pixelTexture(image, 112, 36);
        if (texture && photo.dataset.ps1Source === source) {
          photo.style.backgroundImage = cssUrl(texture);
          photo.classList.add("is-ps1-pixelated");
        }
      } catch (error) {
        photo.classList.add("is-ps1-pixelated");
      }
    };
    image.src = source;
  }

  function sampleTextureColors(stage, image) {
    if (stage.dataset.textureSampled === "true") return;
    if (!image.complete || !image.naturalWidth) {
      if (stage.dataset.textureSamplePending === "true") return;
      stage.dataset.textureSamplePending = "true";
      image.addEventListener("load", () => sampleTextureColors(stage, image), { once: true });
      return;
    }

    try {
      const canvas = document.createElement("canvas");
      const size = 24;
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return;
      context.imageSmoothingEnabled = false;
      context.drawImage(image, 0, 0, size, size);
      const skin = averageRect(context, size, 9, 9, 15, 17);
      const hair = averageRect(context, size, 8, 4, 16, 8);
      const texture = pixelTexture(image, 64);
      if (texture) {
        stage.style.setProperty("--ps1-face", cssUrl(texture));
      }
      if (skin) {
        stage.style.setProperty("--ps1-skin", skin);
        stage.style.setProperty("--ps1-skin-dark", shadeHex(skin, 0.68));
        stage.style.setProperty("--ps1-skin-light", shadeHex(skin, 1.2));
      }
      if (hair) {
        stage.style.setProperty("--ps1-hair", shadeHex(hair, 0.86));
        stage.style.setProperty("--ps1-hair-light", shadeHex(hair, 1.24));
      }
      delete stage.dataset.textureSamplePending;
      stage.dataset.textureSampled = "true";
    } catch (error) {
      delete stage.dataset.textureSamplePending;
      stage.dataset.textureSampled = "true";
    }
  }

  function averageRect(context, size, x1, y1, x2, y2) {
    const data = context.getImageData(0, 0, size, size).data;
    let r = 0;
    let g = 0;
    let b = 0;
    let count = 0;
    for (let y = y1; y < y2; y += 1) {
      for (let x = x1; x < x2; x += 1) {
        const index = (y * size + x) * 4;
        if (data[index + 3] < 32) continue;
        r += data[index];
        g += data[index + 1];
        b += data[index + 2];
        count += 1;
      }
    }
    if (!count) return "";
    return rgbToHex(Math.round(r / count), Math.round(g / count), Math.round(b / count));
  }

  function pixelTexture(image, width, height = width) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) return "";
    context.imageSmoothingEnabled = false;
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL("image/png");
  }

  function extractCssUrl(value) {
    const match = String(value || "").match(/url\((['"]?)(.*?)\1\)/);
    return match ? match[2] : "";
  }

  function shadeHex(hex, amount) {
    const value = hex.replace("#", "");
    const r = Math.max(0, Math.min(255, Math.round(parseInt(value.slice(0, 2), 16) * amount)));
    const g = Math.max(0, Math.min(255, Math.round(parseInt(value.slice(2, 4), 16) * amount)));
    const b = Math.max(0, Math.min(255, Math.round(parseInt(value.slice(4, 6), 16) * amount)));
    return rgbToHex(r, g, b);
  }

  function rgbToHex(r, g, b) {
    return `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  }

  function install() {
    document.body.dataset.characterRenderer = "ps1";
    const board = document.querySelector(boardSelector);
    const secretCard = document.querySelector(secretSelector);
    const locationBand = document.querySelector(locationSelector);
    if (!board) return () => {};

    enhanceBoard(board);
    enhanceSecret(secretCard);
    enhanceLocation(locationBand);

    let scheduled = false;
    const scheduleEnhance = () => {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(() => {
        scheduled = false;
        enhanceBoard(board);
        enhanceSecret(secretCard);
        enhanceLocation(locationBand);
      });
    };
    const observer = new MutationObserver(scheduleEnhance);
    observer.observe(board, { childList: true });
    if (secretCard) observer.observe(secretCard, { childList: true });
    if (locationBand) observer.observe(locationBand, { childList: true, subtree: true });

    return function uninstall() {
      observer.disconnect();
      delete document.body.dataset.characterRenderer;
      document.querySelectorAll(".ps1-character-stage").forEach((el) => el.remove());
      document.querySelectorAll(".has-ps1-character").forEach((el) => {
        el.classList.remove("has-ps1-character");
      });
      document.querySelectorAll(".ps1-secret-portrait").forEach((el) => {
        const img = el.querySelector("img");
        if (img) el.parentElement?.insertBefore(img, el);
        el.remove();
      });
      document.querySelectorAll("[data-ps1-source]").forEach((el) => {
        delete el.dataset.ps1Source;
        el.classList.remove("is-ps1-pixelated");
      });
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => { ps1Install = install; }, { once: true });
  } else {
    ps1Install = install;
  }
})();
