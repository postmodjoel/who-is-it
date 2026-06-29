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

const locations = [
  {
    name: "Airport Terminal",
    prompt: "A delayed evening flight, crowded seating, and everyone pretending not to listen.",
    stamp: "Gate 14",
    vars: ["#18212b", "#7ba6d8", "#3f5876", "#d9edff"]
  },
  {
    name: "Wedding Reception",
    prompt: "A hotel ballroom after dinner, when the speeches are over and the real stories start.",
    stamp: "Table 8",
    vars: ["#271920", "#d98c99", "#8f5c66", "#ffe2e7"]
  },
  {
    name: "Office Party",
    prompt: "A conference room with cheap wine, polite laughter, and several unfinished conversations.",
    stamp: "After hours",
    vars: ["#1a2119", "#8fbb7d", "#556b4c", "#e4f7da"]
  },
  {
    name: "Suburban Dinner Party",
    prompt: "A neat dining room, a tense dessert course, and one story nobody should have brought up.",
    stamp: "Dessert",
    vars: ["#221c17", "#ca9a6d", "#5d7456", "#f7e2c9"]
  },
  {
    name: "Hotel Lobby",
    prompt: "Late check-in, soft lighting, and a receptionist who has seen everything.",
    stamp: "Check-in",
    vars: ["#1a1d24", "#98a6bb", "#6d7380", "#e5edf8"]
  },
  {
    name: "High School Reunion",
    prompt: "A hired hall, old name tags, and people measuring each other very politely.",
    stamp: "Class of '06",
    vars: ["#171b28", "#73a2da", "#9a7731", "#dbe8ff"]
  },
  {
    name: "Hospital Waiting Room",
    prompt: "Plastic chairs, stale coffee, and people deciding what not to say.",
    stamp: "Ward B",
    vars: ["#172220", "#83c1b5", "#496f68", "#d8f4ef"]
  },
  {
    name: "Beach House",
    prompt: "A weekend away with too many couples, too little sleep, and one locked spare room.",
    stamp: "Long weekend",
    vars: ["#15211f", "#7ccdbb", "#8f7a39", "#e0f6ef"]
  }
];

const absurdPrompts = [
  "How would this person ask for a divorce?",
  "What would this person say in their wedding vows?",
  "What would this person name their boat?",
  "On a dating app, what are this person's three hashtags?",
  "What is the lie this person would be best at selling?",
  "What would this person say if they were caught reading someone else's texts?",
  "What would this person's last message before leaving a group chat say?",
  "What compliment would this person give that somehow sounds like a threat?",
  "What would this person write in an apology note they absolutely did not mean?",
  "How would this person fire someone without technically saying they are fired?",
  "What would this person confess after two glasses of wine?",
  "What would this person say to talk their way out of a parking ticket?",
  "What would this person put in a will that makes the family go silent?",
  "What would this person's fake charity be called?",
  "What is this person's signature move in an argument they are losing?",
  "What would this person say if an ex walked into the room?",
  "What would this person write as the subject line of a very dramatic email?",
  "What rumour would this person accidentally start at a dinner party?",
  "What would this person say while deleting a security camera recording?",
  "What would this person name their memoir?",
  "What would this person's alibi sound like?",
  "How would this person break bad news to someone they secretly dislike?",
  "What would this person say to a neighbour they have been avoiding for six months?",
  "What is the most suspicious thing this person would call \"just a misunderstanding\"?",
  "What would this person say if they were asked to make a toast with no warning?",
  "What would this person's notes app confession look like?",
  "What would this person say to end a date early?",
  "What would this person put on a missing poster for themselves?",
  "How would this person explain a suitcase full of cash?",
  "What would this person say if they were pretending everything was fine?"
];

const classicPrompts = [
  "Does your person have facial hair?",
  "Is your person wearing glasses?",
  "Does your person have warm-colored hair?",
  "Would your person be described as smiling?",
  "Does your person have an accessory near their head?",
  "Does your person look surprised?",
  "Does your person look angry?",
  "Does your person look sad?",
  "Is your person wearing a hoodie?",
  "Does your person have a head covering?",
  "Does your person have long hair?",
  "Is your person looking directly forward?",
  "Does your person seem older than thirty?",
  "Could your person be described as confident?",
  "Does your person have short hair?",
  "Is your person wearing a bright color?"
];

const allCharacters = [...baseCharacters, ...generatedCharacters];

const state = {
  settings: {
    prompts: true,
    mystery: true,
    locations: true,
    roles: true,
    expanded: true,
    boardSize: 24
  },
  currentPlayer: 0,
  board: [],
  players: [],
  location: null,
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
  eventLog: document.querySelector("#eventLog"),
  boardTitle: document.querySelector("#boardTitle"),
  hintShelf: document.querySelector("#hintShelf"),
  characterBoard: document.querySelector("#characterBoard"),
  undoButton: document.querySelector("#undoButton"),
  clearButton: document.querySelector("#clearButton"),
  themeButton: document.querySelector("#themeButton"),
  setupButton: document.querySelector("#setupButton"),
  newGameButton: document.querySelector("#newGameButton"),
  setupDialog: document.querySelector("#setupDialog"),
  saveSetupButton: document.querySelector("#saveSetupButton"),
  settingPrompts: document.querySelector("#settingPrompts"),
  settingMystery: document.querySelector("#settingMystery"),
  settingLocations: document.querySelector("#settingLocations"),
  settingRoles: document.querySelector("#settingRoles"),
  settingExpanded: document.querySelector("#settingExpanded"),
  settingBoardSize: document.querySelector("#settingBoardSize")
};

function iconSvg(name) {
  const common = "viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'";
  const paths = {
    moon: "<path d='M20 14.2A7.7 7.7 0 0 1 9.8 4 8.6 8.6 0 1 0 20 14.2Z'/>",
    sun: "<circle cx='12' cy='12' r='4'/><path d='M12 2.5v2.5M12 19v2.5M21.5 12H19M5 12H2.5M18.7 5.3l-1.8 1.8M7.1 16.9l-1.8 1.8M18.7 18.7l-1.8-1.8M7.1 7.1L5.3 5.3'/>",
    settings: "<circle cx='12' cy='12' r='3.2'/><path d='M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.55 5.45l-1.7 1.7M7.15 16.85l-1.7 1.7M18.55 18.55l-1.7-1.7M7.15 7.15l-1.7-1.7'/>",
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
  setButtonIcon(els.drawPromptButton, "prompt", "Draw prompt");
  setButtonIcon(els.undoButton, "undo", "Undo");
  setButtonIcon(els.clearButton, "clear", "Clear board");
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
    exampleQuestion: "Is your person under nightclub lighting?"
  }
];

function newGame() {
  clearMysteryEffectUI();
  const pool = state.settings.expanded ? allCharacters : baseCharacters;
  const boardSize = Math.min(state.settings.boardSize, pool.length);
  state.board = buildBoard(pool, boardSize);
  state.location = state.settings.locations ? pick(locations) : null;
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
  renderBoard();
  renderHints();
  renderMystery();
  renderLog();
}

function renderLocation() {
  if (!state.location) {
    els.locationBand.className = "location-band is-off";
    return;
  }
  const [bg, a, b, c] = state.location.vars;
  document.documentElement.style.setProperty("--location-bg", bg);
  document.documentElement.style.setProperty("--location-a", a);
  document.documentElement.style.setProperty("--location-b", b);
  document.documentElement.style.setProperty("--location-c", c);
  els.locationBand.className = "location-band";
  els.locationBand.innerHTML = `
    <div class="location-art" aria-label="${escapeHtml(state.location.name)} image"></div>
    <div class="location-copy">
      <p class="eyebrow">Location</p>
      <h2>${escapeHtml(state.location.name)}</h2>
      <p>${escapeHtml(state.location.prompt)}</p>
    </div>
    <div class="location-stamp">${escapeHtml(state.location.stamp)}</div>
  `;
}

function renderRoom() {
  els.roomCode.innerHTML = `${iconSvg("hash")}<span>${escapeHtml(state.roomCode)}</span>`;
  els.roomCode.setAttribute("aria-label", `Room ${state.roomCode}`);
  els.roomStatus.textContent = "";
  els.boardTitle.textContent = "The lineup";
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
    return;
  }
  els.secretCard.className = "secret-card";
  els.secretCard.innerHTML = `
    <img src="${secret.image}" alt="${escapeHtml(secret.name)}">
    <div>
      <p class="secret-name">${displayName(secret)}</p>
      <p class="secret-meta">${escapeHtml(roleFor(secret.id))}</p>
    </div>
  `;
  setButtonIcon(els.revealSecretButton, "eyeOff", "Hide face");
}

function renderBoard() {
  const player = currentPlayer();
  els.characterBoard.innerHTML = "";
  els.characterBoard.className = "character-board";
  if (state.global.mystery?.id === "family-tree-disaster") {
    renderFamilyBoard(player);
    return;
  }
  state.board.forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
}

function renderHints() {
  const hints = state.global.hints[state.currentPlayer];
  els.hintShelf.classList.toggle("has-hints", hints.length > 0);
  els.hintShelf.innerHTML = hints.map((hint) => `<span class="hint-pill">${escapeHtml(hint)}</span>`).join("");
}

function renderMystery() {
  const used = state.players.filter((player) => player.mysteryUsed).length;
  els.mysteryUseCount.textContent = `${used}/2`;
  const disabled = !state.settings.mystery || currentPlayer().mysteryUsed;
  els.mysteryButton.disabled = disabled;
  setButtonIcon(els.mysteryButton, "spark", currentPlayer().mysteryUsed ? "Mystery spent" : "Mystery effect");
  if (!state.settings.mystery) {
    els.mysteryResult.textContent = "Mystery is off.";
  } else if (currentPlayer().mysteryUsed && !els.mysteryResult.textContent) {
    els.mysteryResult.textContent = "This seat already burned its mystery.";
  }
}

function renderLog() {
  els.eventLog.innerHTML = state.log.slice(-8).reverse().map((entry) => `<div class="event-entry">${escapeHtml(entry)}</div>`).join("");
}

function toggleEliminated(id) {
  const player = currentPlayer();
  state.global.undo[state.currentPlayer].push(new Set(player.eliminated));
  if (player.eliminated.has(id)) {
    player.eliminated.delete(id);
  } else {
    player.eliminated.add(id);
  }
  renderBoard();
}

function undo() {
  const stack = state.global.undo[state.currentPlayer];
  if (!stack.length) return;
  currentPlayer().eliminated = stack.pop();
  renderBoard();
}

function clearBoard() {
  const player = currentPlayer();
  state.global.undo[state.currentPlayer].push(new Set(player.eliminated));
  player.eliminated.clear();
  renderBoard();
}

function drawPrompt() {
  const deck = state.settings.prompts ? absurdPrompts : classicPrompts;
  els.questionPrompt.textContent = pick(deck);
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
  showMysteryAnnouncement(effect.name, effect.exampleQuestion);
  addLog(`${player.name} triggered a mystery effect.`);
}

function applyMysteryEffect(effectId) {
  clearMysteryEffectUI();
  const effect = mysteryEffects.find((item) => item.id === effectId);
  if (!effect) return;
  state.global.mystery = effect.apply(effect);
}

function clearMysteryEffectUI() {
  state.global.mystery = null;
  els.characterBoard?.classList.remove("family-tree-board");
  els.mysteryResult.textContent = "";
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
  Object.entries(mystery.dataset || {}).forEach(([key, value]) => {
    card.dataset[key] = value;
  });
  const prop = mystery.propEmoji ? `<span class="prop-overlay" aria-label="${escapeHtml(mystery.primaryText)}">${mystery.propEmoji}</span>` : "";
  const role = state.settings.roles ? `<span class="role-chip">${escapeHtml(roleFor(character.id))}</span>` : "";
  card.innerHTML = `
    <div class="portrait-wrap">
      <img src="${character.image}" alt="${escapeHtml(character.name)}">
      ${prop}
    </div>
    <h3>${displayName(character)}</h3>
    <div class="card-meta">${role}${mystery.html}</div>
  `;
  card.addEventListener("click", () => toggleEliminated(character.id));
  return card;
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

function getMysteryCardData(character) {
  const mystery = state.global.mystery;
  if (!mystery) return { html: "", dataset: {} };
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
  if (mystery.id === "witness-protection-filter") {
    return {
      effectName: mystery.name,
      cardClass: assignment.className,
      dataset: { mysteryValue: assignment.value },
      html: ""
    };
  }
  return { html: "", dataset: {} };
}

function addMysteryBadge(text, type) {
  return `<span class="mystery-badge ${type}">${escapeHtml(text)}</span>`;
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
  const categories = [
    ["Aquarium Glass", "witness-aquarium"],
    ["Nightclub Lighting", "witness-nightclub"],
    ["Security Camera", "witness-security"],
    ["Fog Machine", "witness-fog"],
    ["Interrogation Lamp", "witness-interrogation"],
    ["Smoke Alarm Incident", "witness-smoke"]
  ];
  const assignments = {};
  const selectedIds = buildWitnessShortlist(effect.id, categories.length);
  deterministicOrder(selectedIds.map((id) => characterById(id)), `${state.gameSalt}:${effect.id}:selected`).forEach((character, index) => {
    const value = categories[index];
    assignments[character.id] = { value: value[0], className: value[1] };
  });
  return { id: effect.id, name: effect.name, assignments, selectedIds };
}

function showMysteryAnnouncement(_effectName, exampleQuestion) {
  els.mysteryResult.textContent = exampleQuestion;
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

els.drawPromptButton.addEventListener("click", drawPrompt);
els.mysteryButton.addEventListener("click", activateMystery);
els.undoButton.addEventListener("click", undo);
els.clearButton.addEventListener("click", clearBoard);
els.newGameButton.addEventListener("click", newGame);
els.themeButton.addEventListener("click", toggleTheme);

els.setupButton.addEventListener("click", () => {
  syncSettingsToForm();
  els.setupDialog.showModal();
});

els.saveSetupButton.addEventListener("click", () => {
  state.settings.prompts = els.settingPrompts.checked;
  state.settings.mystery = els.settingMystery.checked;
  state.settings.locations = els.settingLocations.checked;
  state.settings.roles = els.settingRoles.checked;
  state.settings.expanded = els.settingExpanded.checked;
  state.settings.boardSize = Number(els.settingBoardSize.value);
  newGame();
});

function syncSettingsToForm() {
  els.settingPrompts.checked = state.settings.prompts;
  els.settingMystery.checked = state.settings.mystery;
  els.settingLocations.checked = state.settings.locations;
  els.settingRoles.checked = state.settings.roles;
  els.settingExpanded.checked = state.settings.expanded;
  els.settingBoardSize.value = String(state.settings.boardSize);
}

loadTheme();
installStaticIcons();
newGame();
