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
    boardSize: 24
  },
  currentPlayer: 0,
  board: [],
  players: [],
  location: null,
  locationVariant: "day",
  roomCode: "0000",
  gameSalt: "",
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
  newGameButton: document.querySelector("#newGameButton"),
  debugEffectPicker: document.querySelector("#debugEffectPicker"),
  setupDialog: document.querySelector("#setupDialog"),
  saveSetupButton: document.querySelector("#saveSetupButton"),
  settingPrompts: document.querySelector("#settingPrompts"),
  settingMystery: document.querySelector("#settingMystery"),
  settingLocations: document.querySelector("#settingLocations"),
  settingRoles: document.querySelector("#settingRoles"),
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
  setButtonIcon(els.newGameButton, "refresh", "New game");
  setButtonIcon(els.swapSeatButton, "swap", "Swap seat");
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
    name: "Prop Panic",
    apply: applyPropPanic,
    exampleQuestion: "Is your person holding a plunger?"
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
    id: "vibe-labels",
    name: "Vibe Labels",
    apply: applyVibeLabels,
    exampleQuestion: "Does your person have lore?"
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
  }
];

const KNOCKOFF_MANOR_TEST_TRIGGERS = ["manor", "murder"];
const PS1_TEST_TRIGGERS = ["ps1"];
const GAY_FROGGED_TEST_TRIGGERS = ["gay"];
let testTriggerBuffer = "";
let ps1Install = null;
let ps1Cleanup = null;

function newGame() {
  clearMysteryEffectUI();
  state.sortKey = "";
  if (els.sortSelect) els.sortSelect.value = "";
  // The board only draws from the procedurally generated faces. The hand-illustrated PNG
  // characters (baseCharacters) stay defined as the gold-standard reference but are never dealt
  // into the playable board.
  const pool = generatedCharacters;
  const boardSize = Math.min(state.settings.boardSize, pool.length);
  state.board = buildBoard(pool, boardSize);
  state.location = state.settings.locations ? pick(locations) : null;
  state.locationVariant = Math.random() < 0.5 ? "day" : "night";
  state.gameSalt = `game-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  state.roomCode = String((stableHash(state.gameSalt) % 9000) + 1000);
  state.players = [makePlayer(0), makePlayer(1)];
  state.currentPlayer = 0;
  state.log = [];
  state.global.hints = [[], []];
  state.global.undo = [[], []];
  state.global.roleMap = {};
  state.board.forEach((character, index) => {
    state.global.roleMap[character.id] = state.settings.roles ? characterRoles[index % characterRoles.length] : character.role;
  });
  drawPrompt();
  addLog("New game dealt. Nobody looks trustworthy.");
  render();
  stopOpponentSim();
  // The Wheel of Fate spins at the start of the round to pick the chaos mode BOTH seats will share.
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
      startOpponentSim();
    });
  } else {
    startOpponentSim();
  }
}

function makePlayer(index) {
  return {
    name: `Seat ${String.fromCharCode(65 + index)}`,
    secretId: pick(state.board).id,
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
  // "fuck" (fuckability) and the rest are deterministic per-character comedy stats.
  return stableHash(`${state.gameSalt}:sortstat:${key}:${ch.id}`) % 1000;
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
  if (aHex && bHex) child.skinHex = mixHex(aHex, bHex);
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
function mutateBaby(traits) {
  const T = window.faceGenerator?.traitBook || {};
  const rnd = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const eyeCols = ["#5a3d28", "#3a5a8a", "#2e6b4e", "#7a5a2a", "#4a4a55", "#6a3a3a", "#8a6a2a", "#4a8a8a"];
  if (Math.random() < 0.55) traits.eyeColor = rnd(eyeCols);
  if (Math.random() < 0.6) traits.eyeScale = +(((traits.eyeScale || 1) * (0.88 + Math.random() * 0.28))).toFixed(2);
  if (Math.random() < 0.5 && T.earVariants) traits.earVariant = rnd(T.earVariants);
  if (Math.random() < 0.5) traits.earScale = +((0.85 + Math.random() * 0.4)).toFixed(2);
  if (Math.random() < 0.5) traits.browThick = +(((traits.browThick || 1) * (0.82 + Math.random() * 0.4))).toFixed(2);
  if (Math.random() < 0.5) traits.noseWidth = +(((traits.noseWidth || 1) * (0.85 + Math.random() * 0.3))).toFixed(2);
  if (Math.random() < 0.35 && T.hairColors) traits.hairColor = rnd(T.hairColors);
  if (Math.random() < 0.3 && T.noseTips) traits.noseTip = rnd(T.noseTips);
  return traits;
}
let babyCounter = 0;
function makeBaby(A, B, gayby) {
  const traits = mutateBaby(mergeTraits(A.traits || {}, B.traits || {}));
  const seed = 90001 + (babyCounter++);
  return {
    id: `baby-${seed}`,
    name: babyName(A.name, B.name),
    pronouns: Math.random() < 0.5 ? A.pronouns : B.pronouns,
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

// Drop character `aId` onto `bId` -> a baby joins the board for THIS game only (never saved).
function breedCharacters(aId, bId) {
  const A = characterById(aId), B = characterById(bId);
  if (!A || !B || !window.faceGenerator) return;

  // In FERTILITY mode breeding is gated: you need one egg-producer + one sperm-producer, and it costs
  // each of them some balance. They grind together, then a baby explodes out (parents survive).
  if (state.global.mystery?.id === "fertility") {
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
    asg[baby.id] = { cum: `${1 + Math.floor(Math.random() * 8)}M`, eggs: 1 + Math.floor(Math.random() * 4), barren: false, hrs: 71, mins: 59, defect: null, hasCount: true, hasEggs: true };
    renderBoard();                                            // show the deducted balances immediately
    playBirthAnimation(A.image, B.image, baby, true, () => {
      state.board.push(baby);
      if (baby.isGayby) persistGayby(baby);
      state.justBorn = baby.id;
      renderBoard();
      state.justBorn = null;
      if (typeof addLog === "function") addLog(`${A.name} + ${B.name} bred ${baby.name}!`);
    });
    return;
  }

  const gayby = sameSex(A, B);
  const baby = makeBaby(A, B, gayby);
  playBirthAnimation(A.image, B.image, baby, false, () => {
    state.board.push(baby);
    // Regenerate the active mode's per-character data so the baby gets its own stats/card too.
    if (state.global.mystery) {
      const eff = mysteryEffects.find((e) => e.id === state.global.mystery.id);
      if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (e) { /* mode has no per-baby data - fine */ } }
    }
    if (baby.isGayby) persistGayby(baby);
    state.justBorn = baby.id;
    if (typeof addLog === "function") addLog(`${A.name} + ${B.name} made a baby: ${baby.name}!`);
    renderBoard();
    state.justBorn = null;
  });
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
function playBirthAnimation(imgA, imgB, baby, grind, done) {
  const gender = baby.isGayby ? "IT'S A GAYBY!!" : baby.pronouns === "he" ? "IT'S A BOY!" : baby.pronouns === "she" ? "IT'S A GIRL!" : "IT'S A THEM!";
  const cols = ["#ff4d6d", "#ffd24d", "#5dff8f", "#4dd2ff", "#c46bff", "#ff8a4d", "#fff27a"];
  let burst = "";
  for (let i = 0; i < 18; i++) {
    const ang = (i / 18) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
    const dist = 78 + (i % 4) * 24;
    burst += `<i style="--tx:${Math.round(Math.cos(ang) * dist)}px;--ty:${Math.round(Math.sin(ang) * dist)}px;color:${cols[i % cols.length]}"></i>`;
  }
  const ov = document.createElement("div");
  ov.className = `breed-overlay ${grind ? "with-grind" : ""}`.trim();
  ov.innerHTML = `<div class="breed-stage">
      ${grind ? `<img class="breed-p breed-a" src="${imgA}" alt=""><img class="breed-p breed-b" src="${imgB}" alt="">` : ""}
      <div class="breed-flash"></div>
      <div class="breed-burst">${burst}</div>
      <div class="birth-banner ${baby.isGayby ? "gayby-banner" : ""}">${gender}</div>
      <div class="birth-card ${baby.isGayby ? "gayby-card" : ""}"><img src="${baby.image}" alt=""><span class="birth-name">${escapeHtml(baby.name)}</span></div>
    </div>`;
  document.body.appendChild(ov);
  setTimeout(() => { ov.remove(); done(); }, grind ? 3200 : 2500);
}
// Shared drag-and-drop wiring: any card / floating head can be dragged onto another to breed.
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
  const selVal = (key, val) => `<select data-key="${key}">`;
  const sel = (key, opts, val) => selVal(key) + opts.map((o) => `<option ${o === val ? "selected" : ""}>${o}</option>`).join("") + "</select>";
  const slide = (key, label, min, max, step, val) => field(label, `<input type="range" data-key="${key}" data-num="1" min="${min}" max="${max}" step="${step}" value="${val}">`);
  editorDialog.querySelector(".editor-controls").innerHTML =
    field("Name", `<input type="text" data-key="__name" value="${escapeHtml(editorState.name)}" maxlength="16">`) +
    field("Pronouns", sel("__pronouns", ["she", "he", "they"], editorState.pronouns)) +
    field("Skin", sel("skin", T.skinTones, t.skin)) +
    field("Hair", sel("hair", T.hairStyles, t.hair)) +
    field("Hair colour", sel("hairColor", T.hairColors, t.hairColor)) +
    field("Expression", sel("expression", T.expressions, t.expression)) +
    field("Face shape", sel("faceShape", T.faceShapes, t.faceShape)) +
    field("Nose", sel("noseTip", T.noseTips, t.noseTip || "round")) +
    field("Brow", sel("browShape", T.browShapes, t.browShape || T.browShapes[0])) +
    field("Clothing", sel("clothing", T.clothing, t.clothing)) +
    field("Accessory", sel("accessory", T.accessories, t.accessory || "none")) +
    field("Animation", sel("animMode", EDITOR_ANIM, t.animMode || "still")) +
    field("Eye colour", `<input type="color" data-key="eyeColor" value="${t.eyeColor || "#5a3d28"}">`) +
    field("Shirt", `<input type="color" data-key="shirt" value="${t.shirt || "#3a86ff"}">`) +
    slide("eyeScale", "Eye size", 0.8, 1.2, 0.01, t.eyeScale != null ? t.eyeScale : 1) +
    slide("browThick", "Brow weight", 0.7, 1.4, 0.01, t.browThick != null ? t.browThick : 1) +
    slide("noseWidth", "Nose width", 0.7, 1.3, 0.01, t.noseWidth != null ? t.noseWidth : 1) +
    slide("mouthScale", "Mouth size", 0.85, 1.2, 0.01, t.mouthScale != null ? t.mouthScale : 1) +
    slide("build", "Build", 60, 110, 1, t.build != null ? t.build : 82);
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
function syncEditorButtons() {
  const del = editorDialog.querySelector("#edDelete");
  if (del) del.style.display = editorState.existing ? "" : "none";
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
        <div class="editor-preview"><img id="edPreview" alt="preview"><small>Saved faces get dealt into future games.</small></div>
        <div class="editor-controls"></div>
      </div>
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
  const persist = () => {
    const data = { id: editorState.id, name: editorState.name, pronouns: editorState.pronouns, traits: editorState.traits, seed: editorState.seed };
    upsertCustom(data);
    editorState.existing = true;
    renderEditorSaved(); syncEditorButtons();
    return data;
  };
  d.querySelector("#edSave").addEventListener("click", persist);
  d.querySelector("#edAdd").addEventListener("click", () => {
    const data = persist();
    const ch = buildCustomCharacter(data);
    const bi = state.board.findIndex((c) => c.id === data.id);
    if (bi >= 0) state.board[bi] = ch; else state.board.push(ch);
    if (state.global.mystery) { const eff = mysteryEffects.find((x) => x.id === state.global.mystery.id); if (eff && eff.apply) { try { state.global.mystery = eff.apply(eff); } catch (err) { /* no per-char data */ } } }
    state.justBorn = data.id; renderBoard(); state.justBorn = null;
  });
  d.querySelector("#edNew").addEventListener("click", () => { editorState = newEditorState(); renderEditorControls(); renderEditorPreview(); syncEditorButtons(); });
  d.querySelector("#edDelete").addEventListener("click", () => { if (editorState.existing) deleteCustom(editorState.id); editorState = newEditorState(); renderEditorControls(); renderEditorPreview(); renderEditorSaved(); syncEditorButtons(); });
  d.querySelector("#edClose").addEventListener("click", () => d.close());
  return d;
}
function openCharacterEditor() {
  if (!window.faceGenerator) return;
  if (!editorDialog) editorDialog = buildEditorDialog();
  editorState = newEditorState();
  renderEditorControls(); renderEditorPreview(); renderEditorSaved(); syncEditorButtons();
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
  return arr.sort((a, b) => characterStat(b, key) - characterStat(a, key));
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
  els.roomCode.innerHTML = `${iconSvg("hash")}<span>${escapeHtml(state.roomCode)}</span>`;
  els.roomCode.setAttribute("aria-label", `Room ${state.roomCode}`);
  els.roomStatus.textContent = "";
  els.seatRoster.innerHTML = "";
  state.players.forEach((player, index) => {
    const chip = document.createElement("button");
    chip.type = "button";
    chip.className = "seat-chip";
    if (index === state.currentPlayer) chip.classList.add("active");
    chip.innerHTML = `
      <span class="seat-glyph">${index === state.currentPlayer ? "YOU" : player.name.slice(-1)}</span>
      <span class="seat-dot ${player.mysteryUsed ? "is-spent" : "is-ready"}" aria-hidden="true"></span>
    `;
    chip.setAttribute("aria-label", `${player.name}, ${player.mysteryUsed ? "mystery spent" : "mystery ready"}`);
    chip.setAttribute("title", `${player.name}, ${player.mysteryUsed ? "mystery spent" : "mystery ready"}`);
    chip.addEventListener("click", () => {
      state.currentPlayer = index;
      render();
    });
    els.seatRoster.appendChild(chip);
  });
}

function renderSecret() {
  const player = currentPlayer();
  const secret = characterById(player.secretId);
  if (!player.secretVisible) {
    els.secretCard.className = "secret-card is-hidden";
    els.secretCard.textContent = "Face hidden";
    setButtonIcon(els.revealSecretButton, "eye", "Show face");
    updateFloatingSecret(secret, false);
    return;
  }
  updateFloatingSecret(secret, true);
  // Mirror whatever the active special mode shows on this character's board card, so the secret card
  // carries the exact same dossier (orgy stats, Yu-Gi-Oh card info, badges, etc.).
  const m = state.global.mystery ? getMysteryCardData(secret) : {};
  els.secretCard.className = `secret-card ${m.cardClass || ""}`.trim();
  // The card takes the character's own portrait background colour, so the portrait sits directly in
  // it (no card-in-a-card) and the colours don't double up.
  const bg = secret.traits?.background || "#cdd6e0";
  els.secretCard.setAttribute("style", `--secret-bg:${bg};${m.style || ""}`);
  const gayFroggedAssignment = state.global.mystery?.id === "gay-frogged" ? state.global.mystery.assignments?.[secret.id] : null;
  els.secretCard.innerHTML = `
    <div class="secret-portrait">
      <img src="${m.image || gayFroggedAssignment?.image || secret.image}" alt="${escapeHtml(secret.name)}">
    </div>
    <div class="secret-info">
      <p class="secret-name">${displayName(secret)}</p>
      ${gayFroggedAssignment ? `<p class="secret-meta secret-pronouns">${escapeHtml(gayFroggedAssignment.pronoun || "they/them")}</p>` : ""}
      ${state.global.mystery?.id === "role-reveal" ? `<p class="secret-meta">${escapeHtml(roleFor(secret.id))}</p>` : ""}
      ${m.html ? `<div class="secret-mode-meta">${m.html}</div>` : ""}
    </div>
    ${m.cornerHtml ? `<div class="secret-corner">${m.cornerHtml}</div>` : ""}
  `;
  setButtonIcon(els.revealSecretButton, "eyeOff", "Hide face");
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
  stopHeadsAnim();                 // kill any running floating-heads loop before we rebuild
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
  document.body.classList.toggle("mode-yugioh", modeId === "yugioh");
  document.body.classList.toggle("mode-pixall", modeId === "pixall");
  sortedBoard().forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
  if (modeId === "pixall") pixelateBoard();
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

function renderHeadsOnlyBoard(player) {
  els.characterBoard.classList.add("heads-board");
  els.characterBoard.setAttribute("aria-label", "Floating heads");
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
    const seed = headsPos.get(ch.id);
    return { el, id: ch.id, x: seed ? seed.x : null, y: seed ? seed.y : null };
  });
  const FORM_MS = 5600;
  const step = (ts) => {
    if (headsStartTs == null) headsStartTs = ts;
    const elapsed = ts - headsStartTs;
    const form = HEADS_FORMATIONS[Math.floor(elapsed / FORM_MS) % HEADS_FORMATIONS.length];
    const t = elapsed / 1000;
    const rect = layer.getBoundingClientRect();
    const w = rect.width || 640, h = rect.height || 520;
    heads.forEach((hd, i) => {
      const tgt = form(i, n, t, w, h);
      if (hd.x == null) { hd.x = tgt.x; hd.y = tgt.y; }
      hd.x += (tgt.x - hd.x) * 0.06;   // ease toward the formation so morphs glide
      hd.y += (tgt.y - hd.y) * 0.06;
      hd.el.style.transform = `translate(${hd.x.toFixed(1)}px, ${hd.y.toFixed(1)}px) translate(-50%, -50%)`;
      headsPos.set(hd.id, { x: hd.x, y: hd.y });
    });
    headsAnimRaf = requestAnimationFrame(step);
  };
  headsAnimRaf = requestAnimationFrame(step);
}

// ===================== Habbo Hotel mode =====================
const HABBO_GW = 8, HABBO_GH = 8, HABBO_TW = 60, HABBO_TH = 30;
let habboPos = new Map();     // char id -> {col,row}, persisted so walking survives re-renders
let habboSelected = null;
let habboCtx = null;
function resetHabbo() { habboPos = new Map(); habboSelected = null; habboCtx = null; }
function habboIso(col, row) {
  const originX = HABBO_GH * HABBO_TW / 2 + 24;
  const originY = 150;   // sits the room lower in the tall board area
  return { x: originX + (col - row) * HABBO_TW / 2, y: originY + (col + row) * HABBO_TH / 2 };
}
function selectHabbo(id) {
  habboSelected = id;
  if (habboCtx) habboCtx.figEls.forEach((el, cid) => el.classList.toggle("selected", cid === id));
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
function habboMoveTo(col, row) {
  if (!habboSelected || !habboCtx) return;
  for (const [id, p] of habboPos) if (id !== habboSelected && p.col === col && p.row === row) return; // tile taken
  const el = habboCtx.figEls.get(habboSelected);
  const cur = habboPos.get(habboSelected);
  if (!el || !cur) return;
  const path = habboPath(cur.col, cur.row, col, row);
  if (!path.length) return;
  habboPos.set(habboSelected, { col, row });          // final tile (kept for persistence)
  const token = (el._walk = (el._walk || 0) + 1);      // cancels any walk already in progress
  const STEP = 300;
  el.classList.add("walking");
  let i = 0;
  const stepTo = () => {
    if (el._walk !== token || i >= path.length) return;
    const s = path[i]; const p = habboIso(s.col, s.row);
    el.style.transitionDuration = `${STEP}ms`;
    el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px)`;
    el.style.zIndex = String(100 + s.col + s.row);
    i++;
    setTimeout(stepTo, STEP);
  };
  stepTo();
}
function renderHabboBoard(player) {
  els.characterBoard.classList.add("habbo-board");
  els.characterBoard.setAttribute("aria-label", "Habbo Hotel room");
  const list = sortedBoard();
  const room = document.createElement("div");
  room.className = "habbo-room";
  els.characterBoard.appendChild(room);
  const floor = document.createElement("div");
  floor.className = "habbo-floor";
  room.appendChild(floor);
  for (let r = 0; r < HABBO_GH; r++) for (let c = 0; c < HABBO_GW; c++) {
    const p = habboIso(c, r);
    const tile = document.createElement("div");
    tile.className = `habbo-tile ${(c + r) % 2 ? "alt" : ""}`.trim();
    tile.style.left = `${p.x}px`; tile.style.top = `${p.y}px`; tile.style.zIndex = String(c + r);
    tile.addEventListener("click", () => habboMoveTo(c, r));
    floor.appendChild(tile);
  }
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
    const a = state.global.mystery.assignments[ch.id] || {};
    const pos = habboPos.get(ch.id);
    const p = habboIso(pos.col, pos.row);
    const el = document.createElement("button");
    el.type = "button";
    el.className = `habbo-fig ${player.eliminated.has(ch.id) ? "is-down" : ""} ${ch.id === habboSelected ? "selected" : ""}`.trim();
    el.dataset.id = ch.id;
    el.style.transform = `translate(${p.x.toFixed(0)}px, ${p.y.toFixed(0)}px)`;
    el.style.zIndex = String(100 + pos.col + pos.row);
    el.innerHTML = `<span class="hb-name">${escapeHtml(displayName(ch))}</span>`
      + `<span class="hb-kill" title="cross off">✕</span>`
      + `<img class="hb-head" src="${a.head || ch.image}" alt="">`
      + `<span class="hb-body" style="--shirt:${a.shirt || "#4a90e2"}"></span>`
      + `<span class="hb-shadow"></span>`;
    el.addEventListener("click", (e) => {
      if (e.target.classList.contains("hb-kill")) { toggleEliminated(ch.id); return; }
      selectHabbo(ch.id);
    });
    figs.appendChild(el);
    figEls.set(ch.id, el);
    // Pixelate the head into chunky Habbo pixels once it loads.
    if (a.head) pixelateSrc(a.head, 44, (url) => { const img = el.querySelector(".hb-head"); if (img) img.src = url; });
  });
  habboCtx = { figEls };
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
  const used = state.players.filter((player) => player.mysteryUsed).length;
  els.mysteryUseCount.textContent = `${used}/2`;
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

// Abstract glyphs for the roulette - deliberately give nothing away about the mode.
const MODE_GLYPHS = ["☣", "◉", "✦", "⚛", "☠", "⬢", "✶", "❂", "⟁", "◈", "⌖", "☯", "⚙", "♆", "⚕", "✺", "⊛", "❖", "⌬", "☄"];

// Spin a slot-machine of abstract symbols at the start of a round; it decelerates onto a random mode,
// flashes chaotically, then reveals + applies it. done(id) fires with the chosen mode id (or null).
function spinModeRoulette(done) {
  const modes = mysteryEffects.map((e, i) => ({ id: e.id, name: e.name, glyph: MODE_GLYPHS[i % MODE_GLYPHS.length], hue: (i * 47) % 360 }));
  modes.push({ id: null, name: "No Effect", glyph: "∅", hue: 210 });
  const target = pick(modes);
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
  els.characterBoard?.classList.remove("family-tree-board", "knockoff-manor-board", "ygo-board", "orgy-board", "pixall-board", "disease-board", "drugs-board", "fertility-board", "work-board", "woke-board", "swipe-board", "judgement-board", "sims-board", "heads-board", "habbo-board");
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

    const cols = ["#ff4d6d", "#ffd24d", "#5dff8f", "#4dd2ff", "#c46bff", "#ff8a4d", "#fff27a"];
    let parts = "";
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
      const dist = 46 + (i % 4) * 14;
      parts += `<i style="--tx:${Math.round(Math.cos(ang) * dist)}px;--ty:${Math.round(Math.sin(ang) * dist)}px;background:${cols[i % cols.length]}"></i>`;
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
  const babyBadge = character.isGayby
    ? `<span class="gayby-badge" title="${escapeHtml((character.parents || []).join(" + "))}">🏳️‍🌈 GAYBY</span>`
    : character.isBaby ? `<span class="baby-badge" title="${escapeHtml((character.parents || []).join(" + "))}">👶 NEW</span>` : "";
  card.innerHTML = `
    <div class="portrait-wrap">
      <img src="${portraitSrc}" alt="${escapeHtml(character.name)}">
      ${fireworks}
      ${prop}
      ${babyBadge}
      ${mystery.cornerHtml || ""}
    </div>
    <div class="card-plate">
      <h3>${displayName(character)}</h3>
      ${state.global.mystery?.id === "gay-frogged" ? `<p class="card-pronouns">${escapeHtml(mystery.pronoun || "they/them")}</p>` : ""}
      ${state.global.mystery?.id === "gay-frogged" ? `<div class="card-grindr-tags">${[...(stableHash(character.id + ":poc") % 3 === 0 ? ["POC"] : []), ...characterTags(character)].map((t) => `<span class="grindr-tag">${escapeHtml(t)}</span>`).join("")}</div>` : ""}
      <div class="card-meta">${mystery.html}</div>
    </div>
  `;
  card.addEventListener("click", () => toggleEliminated(character.id));
  wireBreedDnD(card, character.id);
  return card;
}

function createManorCharacterToken(character, player) {
  const token = document.createElement("button");
  const assignment = state.global.mystery?.assignments[character.id];
  token.type = "button";
  token.id = `token-${character.id}`;
  token.className = "manor-token";
  token.classList.toggle("is-down", player.eliminated.has(character.id));
  token.dataset.id = character.id;
  if (assignment?.roomName) token.dataset.houseRoom = assignment.roomName;
  token.setAttribute("aria-label", `${character.name}${assignment?.roomName ? ` in ${assignment.roomName}` : ""}`);
  token.setAttribute("title", `${character.name}${assignment?.roomName ? ` · ${assignment.roomName}` : ""}`);
  token.innerHTML = `
    <img src="${character.image}" alt="">
    <span>${escapeHtml(character.name)}</span>
  `;
  token.addEventListener("click", () => toggleEliminated(character.id));
  return token;
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
function renderPainScale(pain) {
  const faces = PAIN_SCALE_FACES
    .map((f, i) => `<span class="dz-face${i === pain ? " is-here" : ""}">${escapeHtml(f)}</span>`)
    .join("");
  return `<div class="dz-painscale"><span class="dz-painscale-label">PAIN SCALE</span>`
    + `<div class="dz-painscale-faces">${faces}</div></div>`;
}

function getMysteryCardData(character) {
  const mystery = state.global.mystery;
  if (!mystery || !mystery.assignments) return { html: "", dataset: {} };
  const assignment = mystery.assignments[character.id];
  if (!assignment) return { html: "", dataset: {} };
  if (mystery.id === "prop-panic") {
    return {
      effectName: mystery.name,
      primaryText: assignment.value,
      propEmoji: assignment.emoji,
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
  if (mystery.id === "hidden-agendas") {
    const side = assignment.party === "Democrat" ? "dem" : "rep";
    return {
      effectName: mystery.name,
      cardClass: `agenda-${side}`,
      image: assignment.image || undefined,
      propEmoji: assignment.emoji,
      primaryText: `${assignment.party} · ${assignment.state} · ${assignment.mood}`,
      dataset: { agendaParty: assignment.party, agendaState: assignment.state, agendaMood: assignment.mood },
      html: `${addMysteryBadge(assignment.party, `agenda-${side}`)}${addMysteryBadge(assignment.state, "agenda-state")}`
    };
  }
  if (mystery.id === "witness-protection-filter") {
    return {
      effectName: mystery.name,
      cardClass: assignment.className,
      dataset: { mysteryValue: assignment.value },
      html: ""
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
    return { effectName: mystery.name, image: assignment.image || undefined, html: "" };
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
    const defect = a.defect ? `<div class="ft-defect">⚠ ${escapeHtml(a.defect)}</div>` : "";
    const countRow = a.hasCount ? `<div class="ft-row"><b>💦</b><i>${escapeHtml(a.cum)}</i></div>` : "";
    const eggsRow = a.hasEggs ? `<div class="ft-row"><b>🥚</b><i>${a.barren ? '<span class="ft-barren">BARREN</span>' : a.eggs}</i></div>` : "";
    return {
      effectName: mystery.name,
      cardClass: "fertility",
      cornerHtml: `<span class="ft-timer" title="next emptying">⏳ ${a.hrs}h ${a.mins}m</span>`,
      html: `<div class="ft-sheet">${countRow}${eggsRow}${defect}</div>`
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
      cardClass: "disease",
      dataset: { dzPregnant: String(a.pregnant) },
      html: `<div class="dz-sheet">
        ${renderPainScale(a.pain)}
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
    const glyph = { HEAVEN: "😇", HELL: "😈", PURGATORY: "🤷" }[a.verdict];
    // Short badge label so it never collides with the centred crown (PURGATORY -> LIMBO).
    const label = { HEAVEN: "HEAVEN", HELL: "HELL", PURGATORY: "LIMBO" }[a.verdict];
    const crown = {
      HEAVEN: '<svg class="jd-halo" viewBox="0 0 64 22"><ellipse cx="32" cy="11" rx="27" ry="7.5"/></svg>',
      HELL: '<svg class="jd-horns" viewBox="0 0 62 34"><path class="horn" d="M21 34 C 8 25 5 9 14 2 C 13 13 17 25 25 31 Z"/><path class="horn" d="M41 34 C 54 25 57 9 48 2 C 49 13 45 25 37 31 Z"/></svg>',
      PURGATORY: '<span class="jd-limbo">?</span>'
    }[a.verdict];
    const meter2Label = { HEAVEN: "BLISS", HELL: "TORMENT", PURGATORY: "BOREDOM" }[a.verdict];
    const meter2Cls = { HEAVEN: "rct-good", HELL: "rct-bad", PURGATORY: "rct-mid" }[a.verdict];
    const where = a.verdict === "PURGATORY"
      ? `${escapeHtml(a.location)} · <b>#${a.queuePos.toLocaleString()} in queue</b>`
      : `${escapeHtml(a.location)} · <b>${a.verdict === "HELL" ? "Circle" : "Tier"} ${a.layer}</b>`;
    const bar = (lbl, n, cls) => `<span class="rct-bar"><b>${lbl}</b><i><s class="${cls}" style="--n:${n}%"></s></i></span>`;
    return {
      effectName: mystery.name,
      cardClass: `judgement jd-${a.verdict.toLowerCase()}`,
      dataset: { verdict: a.verdict },
      image: a.image || undefined,
      cornerHtml: `<span class="jd-verdict">${glyph} ${label}</span>`
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
  if (mystery.id === "habbo") {
    return { effectName: mystery.name, cardClass: "habbo-secret", image: assignment.head || undefined, html: "" };
  }
  if (mystery.id === "sims") {
    const a = assignment;
    const bar = (label, n) => {
      const cls = n < 25 ? "sim-crit" : n < 55 ? "sim-warn" : "sim-ok";
      return `<span class="sim-bar"><b>${label}</b><i><s class="${cls}" style="--n:${n}%"></s></i></span>`;
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
      cornerHtml: plumbob
        + `<span class="sim-cash" title="simoleons">${money}</span>`,
      html: `<div class="sim-sheet">
        <div class="sim-action">💬 <i>${escapeHtml(a.action)}…</i></div>
        ${bar("HUNGER", a.needs.hunger)}${bar("SOCIAL", a.needs.social)}${bar("BLADDER", a.needs.bladder)}${bar("FUN", a.needs.fun)}
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
function applyWoke(effect) {
  const D = window.GameData;
  const positions = ["TOP", "BOTTOM", "SIDE", "GAGGED", "CHOKING", "VERS", "POWER BOTTOM", "STARFISH"];
  const glows = ["#ff4d6d", "#ff9e3a", "#ffe23a", "#4dd46a", "#3aa0ff", "#a05aff", "#ff5ad0"];
  const defects = ["SLOW SWIMMERS", "EXPIRED STOCK", "TWO-HEADED RISK", "RECALLED BATCH", "ALL DUDS", "PREMIUM (allegedly)"];
  const stash = (D && D.workInventory) || ["Shiv"];
  const pick = (arr, salt) => arr[stableHash(`${state.gameSalt}:wk:${salt}`) % arr.length];
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:woke:${ch.id}`);
    // Deterministic shuffle of the module list, then take 2-3 for this character.
    const order = WOKE_MODULES
      .map((m) => [m, stableHash(`${state.gameSalt}:wkmod:${ch.id}:${m}`)])
      .sort((a, b) => a[1] - b[1])
      .map((x) => x[0]);
    const mods = order.slice(0, 2 + (h % 2));
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
    if (ch.traits && window.faceGenerator) {
      const R = (extra) => window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, ...extra });
      a.image = has("disguise")
        ? (ch.pronouns === "she"
          ? R({ disguise: true })
          : R({ hair: "bald", hairLocks: [], beardLength: 0, accessory: "turban", accessoryColor: "#ededee",
            accessoryY: 0, accessoryScale: 1,
            clothing: (ch.traits.clothing === "bare" || ch.traits.clothing === "singlet") ? "tee" : ch.traits.clothing,
            shirt: "#f2f2f2" }))
        : R({ clothing: "bare", accessory: "none" });
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
  const verdicts = ["HEAVEN", "HELL", "PURGATORY"];
  const pick = (obj, verdict, salt) => {
    const arr = (obj && obj[verdict]) || ["—"];
    return arr[stableHash(`${state.gameSalt}:jd:${salt}`) % arr.length];
  };
  const assignments = {};
  state.board.forEach((ch) => {
    const h = stableHash(`${state.gameSalt}:judge:${ch.id}`);
    // Skew slightly toward hell/heaven over purgatory (0,1 = heaven/hell twice as likely each).
    const verdict = verdicts[[0, 1, 0, 1, 2][h % 5]];
    const layer = verdict === "PURGATORY" ? null : 1 + ((h >>> 3) % 9);      // Dante circles / heaven tiers
    const queuePos = verdict === "PURGATORY" ? 1 + ((h >>> 3) % 900000) : null;
    // Happiness: heaven high, hell rock-bottom, purgatory low. Second meter is verdict-specific.
    const base = verdict === "HEAVEN" ? 72 : verdict === "HELL" ? 2 : 22;
    // Heaven renders on a TRANSPARENT background so the drifting clouds behind the card show through
    // around the figure (fire for hell stays in front, over the portrait).
    const image = (verdict === "HEAVEN" && ch.traits && window.faceGenerator)
      ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, background: "transparent" })
      : null;
    assignments[ch.id] = {
      verdict, image,
      location: pick(D.judgementLocations, verdict, `${ch.id}:loc`),
      thought: pick(D.judgementThoughts, verdict, `${ch.id}:th`),
      layer, queuePos,
      happiness: Math.min(100, base + ((h >>> 5) % 26)),
      meter2: verdict === "HELL" ? 70 + ((h >>> 7) % 30) : verdict === "PURGATORY" ? 58 + ((h >>> 7) % 42) : 4 + ((h >>> 7) % 24)
    };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// SIMS Mode: every character is a Sim - a plumbob mood (green/yellow/red) floating over the head, four
// depleting need bars, whatever autonomous action they're currently doing, a career, and a simoleon
// balance.
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
      simoleons: (h % 3 === 0 ? -(h % 900) : (h >>> 4) % 99000)
    };
  });
  return { id: effect.id, name: effect.name, assignments };
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
function applyDisguise(effect) {
  const assignments = {};
  state.board.forEach((ch) => {
    let image = null;
    if (ch.traits && window.faceGenerator) {
      image = ch.pronouns === "she"
        ? window.faceGenerator.renderPortrait(ch.seed, { ...ch.traits, disguise: true })
        : window.faceGenerator.renderPortrait(ch.seed, {
          ...ch.traits, hair: "bald", hairLocks: [], beardLength: 0,
          accessory: "turban", accessoryColor: "#ededee", accessoryY: 0, accessoryScale: 1,
          clothing: (ch.traits.clothing === "bare" || ch.traits.clothing === "singlet") ? "tee" : ch.traits.clothing,
          shirt: "#f2f2f2"
        });
    }
    assignments[ch.id] = { image };
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
        skinHex: "#e9ddd2", cheekOpacity: 0, beardLength: 0
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
    assignments[ch.id] = { habits, daily: 1 + ((h >>> 5) % 40) };
  });
  return { id: effect.id, name: effect.name, assignments };
}

// PIXALL: 8-bit pixel-art mode. No per-character data - the look comes from the pixel font (CSS) and
// a canvas pass that downscales + colour-quantises each portrait into chunky pixels.
function applyPixall(effect) {
  return { id: effect.id, name: effect.name, assignments: {} };
}

// Rasterise an SVG portrait down to `size` px and quantise its colours for a real 8-bit look.
const pixelCache = new Map();
function pixelateSrc(src, size, done) {
  if (pixelCache.has(src)) { done(pixelCache.get(src)); return; }
  const im = new Image();
  im.onload = () => {
    const c = document.createElement("canvas");
    c.width = size; c.height = size;
    const x = c.getContext("2d");
    x.imageSmoothingEnabled = false;
    x.drawImage(im, 0, 0, size, size);
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
    pixelCache.set(src, url);
    done(url);
  };
  im.onerror = () => done(src);
  im.src = src;
}
function pixelateBoard() {
  els.characterBoard.querySelectorAll(".portrait-wrap > img").forEach((img) => {
    const src = img.getAttribute("src");
    if (!src || src.startsWith("data:image/png")) return;
    pixelateSrc(src, 46, (url) => { if (img.isConnected) img.src = url; });
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

function applyPropPanic(effect) {
  const props = [
    ["traffic cone", "🚧"],
    ["baguette", "🥖"],
    ["swordfish", "🐟"],
    ["clipboard", "📋"],
    ["plunger", "🪠"],
    ["juice box", "🧃"],
    ["kazoo", "🎺"],
    ["magnifying glass", "🔍"],
    ["bolt cutters", "✂️"],
    ["rubber chicken", "🐔"],
    ["tiny fan", "🪭"],
    ["yoga mat", "🟪"],
    ["candelabra", "🕯️"],
    ["melon", "🍈"],
    ["briefcase", "💼"],
    ["garden rake", "🪴"],
    ["roller skate", "🛼"],
    ["boom mic", "🎤"],
    ["frozen peas", "🫛"],
    ["desk bell", "🔔"],
    ["binoculars", "🔭"],
    ["saucepan", "🍲"],
    ["novelty goblet", "🏆"],
    ["extension cord", "🔌"],
    ["folding chair", "🪑"],
    ["megaphone", "📣"],
    ["seashell", "🐚"],
    ["trophy fish", "🎣"]
  ];
  const assignments = {};
  assignEvenCategories(state.board, props, effect.id).forEach(({ character, value }) => {
    assignments[character.id] = { value: value[0], emoji: value[1] };
  });
  return { id: effect.id, name: effect.name, assignments };
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
  const assignments = {};
  selectedIds.forEach((id) => {
    const pickHash = stableHash(`${state.gameSalt}:${effect.id}:pick:${id}`);
    const [label, cls] = weighted[pickHash % weighted.length];
    assignments[id] = { value: label, className: cls };
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
    assignments[character.id] = { party, state: homeState, mood: mood.label, emoji: mood.emoji, image };
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
function playEffectAnnouncement(name) {
  const prev = document.getElementById("effectBlast");
  if (prev) prev.remove();

  const overlay = document.createElement("div");
  overlay.id = "effectBlast";
  overlay.className = "effect-blast";

  const flash = document.createElement("div");
  flash.className = "effect-blast-flash";
  overlay.appendChild(flash);

  const word = document.createElement("div");
  word.className = "effect-blast-word";
  [...name.toUpperCase()].forEach((ch, index) => {
    const span = document.createElement("span");
    span.className = "effect-blast-letter";
    span.textContent = ch === " " ? " " : ch;
    const dir = index % 2 === 0 ? -1 : 1;
    span.style.setProperty("--dx", `${dir * (55 + Math.random() * 45)}vw`);
    span.style.setProperty("--dy", `${(Math.random() - 0.5) * 70}vh`);
    span.style.setProperty("--rot", `${dir * (15 + Math.random() * 35)}deg`);
    span.style.setProperty("--delay", `${index * 40}ms`);
    word.appendChild(span);
  });
  overlay.appendChild(word);

  document.body.appendChild(overlay);
  window.setTimeout(() => overlay.remove(), 1900);
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
  const target = event.target;
  const isTypingField = target?.matches?.("input, textarea, select, [contenteditable='true']");
  if (isTypingField || event.ctrlKey || event.metaKey || event.altKey || event.key.length !== 1) return;
  const allTriggers = [...KNOCKOFF_MANOR_TEST_TRIGGERS, ...PS1_TEST_TRIGGERS, ...GAY_FROGGED_TEST_TRIGGERS];
  const maxTriggerLength = Math.max(...allTriggers.map((trigger) => trigger.length));
  testTriggerBuffer = `${testTriggerBuffer}${event.key.toLowerCase()}`.slice(-maxTriggerLength);
  if (KNOCKOFF_MANOR_TEST_TRIGGERS.some((trigger) => testTriggerBuffer.endsWith(trigger))) {
    testTriggerBuffer = "";
    triggerKnockoffManorTest();
  } else if (PS1_TEST_TRIGGERS.some((trigger) => testTriggerBuffer.endsWith(trigger))) {
    testTriggerBuffer = "";
    triggerPs1Test();
  } else if (GAY_FROGGED_TEST_TRIGGERS.some((trigger) => testTriggerBuffer.endsWith(trigger))) {
    testTriggerBuffer = "";
    triggerGayFroggedTest();
  }
}

function buildBoard(pool, boardSize) {
  const shuffled = shuffle(pool);
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

els.revealSecretButton.addEventListener("click", () => {
  currentPlayer().secretVisible = !currentPlayer().secretVisible;
  renderSecret();
});

els.swapSeatButton.addEventListener("click", () => {
  state.currentPlayer = state.currentPlayer === 0 ? 1 : 0;
  render();
});

if (els.drawPromptButton) els.drawPromptButton.addEventListener("click", drawPrompt);
els.mysteryButton.addEventListener("click", activateMystery);
els.newGameButton.addEventListener("click", newGame);
els.themeButton.addEventListener("click", toggleTheme);

// Debug: manually trigger any mystery effect from a dropdown (handy while building/balancing).
if (els.debugEffectPicker) {
  mysteryEffects.forEach((effect) => {
    const opt = document.createElement("option");
    opt.value = effect.id;
    opt.textContent = effect.name;
    els.debugEffectPicker.appendChild(opt);
  });
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
  state.settings.boardSize = Number(els.settingBoardSize.value);
  newGame();
});

function syncSettingsToForm() {
  els.settingPrompts.checked = state.settings.prompts;
  els.settingMystery.checked = state.settings.mystery;
  els.settingLocations.checked = state.settings.locations;
  els.settingRoles.checked = state.settings.roles;
  els.settingBoardSize.value = String(state.settings.boardSize);
}

loadTheme();
installStaticIcons();
mergeCustomIntoPool();                 // fold saved custom characters into the playable pool
mergeGaybiesIntoPool();                // and the persistent GAYBYs
if (els.editorButton) els.editorButton.addEventListener("click", openCharacterEditor);
newGame();
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
