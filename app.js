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

const locations = [
  {
    name: "Cafe",
    slug: "cafe",
    prompt: "Mid-morning, the espresso machine hissing, and three conversations pretending not to overhear each other.",
    gayPrompt: "Oat milk, oversharing, and someone crying in the bathroom because a barista was too nice to them.",
    stamp: "Table 4"
  },
  {
    name: "Restaurant",
    slug: "restaurant",
    prompt: "A late dinner service where the wine has loosened tongues and someone has ordered too much.",
    gayPrompt: "The waiter is definitely a part-time drag queen and someone just proposed to their situationship.",
    stamp: "Booth 9"
  },
  {
    name: "Bar",
    slug: "bar",
    prompt: "Last call energy, sticky counters, and at least one story that gets better every time it's told.",
    gayPrompt: "Last call, Charli XCX on the speaker, and someone's ex just walked in with a hotter ex.",
    stamp: "Last call"
  },
  {
    name: "Rooftop",
    slug: "rooftop",
    prompt: "Skyline views, a cocktail nobody finished, and a confession waiting for the right gust of wind.",
    gayPrompt: "Golden hour, someone's crying on cue, and the group photo has three exes and one situationship.",
    stamp: "Level 22"
  },
  {
    name: "Library",
    slug: "library",
    prompt: "Hushed aisles, a dropped book, and somebody very deliberately not making eye contact.",
    gayPrompt: "The library is open, hunty. Reading is what? Fundamental. Yes gawd, somebody is getting dragged through the nonfiction section.",
    stamp: "Reading room"
  },
  {
    name: "Bookstore",
    slug: "bookstore",
    prompt: "Cramped shelves, a misfiled paperback, and two strangers reaching for the same spine.",
    gayPrompt: "Two people reached for the same Roxane Gay and now they're in love. The poetry section is crying.",
    stamp: "Aisle 3"
  },
  {
    name: "Art Gallery",
    slug: "art_gallery",
    prompt: "White walls, free wine, and everyone nodding at a painting nobody understands.",
    gayPrompt: "Free wine, a painting that's just a red square, and three people claiming it changed their life.",
    stamp: "Opening night"
  },
  {
    name: "Museum Lobby",
    slug: "museum_lobby",
    prompt: "Marble floors, a school tour just left, and a meeting that was supposed to look accidental.",
    gayPrompt: "Marble columns, a forbidden tryst near the Grecian urns, and someone is absolutely giving ancient gay panic.",
    stamp: "Main hall"
  },
  {
    name: "Cinema",
    slug: "cinema",
    prompt: "Trailers rolling, popcorn going cold, and the seat that was definitely supposed to stay empty.",
    gayPrompt: "The movie is Brokeback Mountain. Nobody is watching it. Three people are sobbing anyway.",
    stamp: "Screen 6"
  },
  {
    name: "Hotel Lobby",
    slug: "hotel_lobby",
    prompt: "Late check-in, soft lighting, and a receptionist who has seen absolutely everything.",
    gayPrompt: "Late check-in, the concierge is a retired drag queen, and someone definitely booked a room for two without asking.",
    stamp: "Check-in"
  },
  {
    name: "Airport Lounge",
    slug: "airport_lounge",
    prompt: "A delayed flight, free pretzels, and everyone pretending not to listen to the gate announcements.",
    gayPrompt: "A delayed flight to Fire Island, someone's crying in the lounge, and the pretzels are complimentary.",
    stamp: "Gate 14"
  },
  {
    name: "Train Station",
    slug: "train_station",
    prompt: "A platform between departures, a missed connection, and a goodbye running out of minutes.",
    gayPrompt: "A missed connection, a dramatic slow-motion run down the platform, and someone is blasting Celine Dion.",
    stamp: "Platform 2"
  },
  {
    name: "Gym",
    slug: "gym",
    prompt: "Clanging weights, a borrowed towel, and a rivalry nobody admits is a rivalry.",
    gayPrompt: "Everyone is doing bicep curls and nobody is making eye contact and literally everyone is gay.",
    stamp: "Floor 1"
  },
  {
    name: "Yoga Studio",
    slug: "yoga_studio",
    prompt: "Soft mats, deep breaths, and an inner peace that is being severely tested today.",
    gayPrompt: "Downward dog, emotional processing, and a teacher who keeps saying 'release what no longer serves you' directly at one person.",
    stamp: "9am flow"
  },
  {
    name: "Greenhouse",
    slug: "greenhouse",
    prompt: "Warm glass, dripping ferns, and a quiet argument held just out of earshot.",
    gayPrompt: "Warm glass, rare orchids, and two plant dads having a passive-aggressive disagreement about moisture levels.",
    stamp: "East wing"
  },
  {
    name: "Park",
    slug: "park",
    prompt: "A bench, a shared bag of chips, and a secret that's about to be very badly kept.",
    gayPrompt: "Picnic blankets, a frisbee nobody asked for, and a group chat meltdown happening in real time.",
    stamp: "The green"
  },
  {
    name: "Beach",
    slug: "beach",
    prompt: "Low tide, a dying bonfire, and a long weekend with too many people and one locked beach house.",
    gayPrompt: "Fire Island energy: a locked beach house, a cooler full of seltzers, and someone already crying by 2pm.",
    stamp: "Low tide"
  },
  {
    name: "Diner",
    slug: "diner",
    prompt: "Three a.m., bottomless coffee, and a confession that only makes sense under fluorescent light.",
    gayPrompt: "Post-club fries, somebody's mascara is now a statement, and the waitress has emotionally adopted all of you.",
    stamp: "Counter seat"
  },
  {
    name: "Wine Cellar",
    slug: "wine_cellar",
    prompt: "Cool stone, a dusty vintage, and a toast to something neither of you can name yet.",
    gayPrompt: "An unrequested sommelier monologue, a 'we should just split a bottle' that means everything, and one very load-bearing candle.",
    stamp: "Reserve list"
  },
  {
    name: "Bakery",
    slug: "bakery",
    prompt: "Warm glass, the last croissant, and two polite people each refusing to be the one who takes it.",
    gayPrompt: "A sourdough situationship, a barista writing the wrong name on purpose, and someone openly weeping over a perfectly laminated pastry.",
    stamp: "Fresh batch"
  },
  {
    name: "Nightclub",
    slug: "nightclub",
    prompt: "Two a.m., a bassline you can feel in your teeth, and a glance held three seconds too long across the floor.",
    gayPrompt: "The DJ dropped a remix nobody asked for, two exes are voguing competitively, and someone has lost a shoe to the fog machine.",
    stamp: "Coat check"
  },
  {
    name: "Karaoke",
    slug: "karaoke",
    prompt: "A private room, a sticky remote, and a duet that means far more than either of you will admit.",
    gayPrompt: "Someone queued 'Defying Gravity' unironically and the room has gone silent with reverence. A tambourine has entered the chat.",
    stamp: "Room 3"
  },
  {
    name: "Casino",
    slug: "casino",
    prompt: "No clocks, no windows, and a bet placed on something far riskier than the table.",
    gayPrompt: "Someone's playing blackjack in full sequins, blowing on the dice 'for luck,' and going all in over purely emotional stakes.",
    stamp: "High roller"
  },
  {
    name: "Record Store",
    slug: "record_store",
    prompt: "Crates to flip through, a song you both somehow know, and a hand brushing the same sleeve.",
    gayPrompt: "Someone is gatekeeping a record they found yesterday, and the clerk just diagnosed your entire personality from one purchase.",
    stamp: "New arrivals"
  },
  {
    name: "Theater",
    slug: "theater",
    prompt: "House lights dimming, a held breath, and a seat squeeze right as the curtain lifts.",
    gayPrompt: "It's a one-person show about grief and the lead is somebody's ex. Three rows are sobbing purely on principle.",
    stamp: "Orchestra"
  },
  {
    name: "Arcade",
    slug: "arcade",
    prompt: "Quarter-fed machines, a shared high score, and a rivalry that's clearly about something else.",
    gayPrompt: "A duel for the Dance Dance Revolution crown while a third person narrates it like a championship final.",
    stamp: "High score"
  },
  {
    name: "Bowling Alley",
    slug: "bowling_alley",
    prompt: "Rented shoes, a gutter ball, and a high-five that lingers a beat too long.",
    gayPrompt: "Bumper bowling, a team name change mid-game, and someone winning purely on the strength of the outfit.",
    stamp: "Lane 7"
  },
  {
    name: "Ferry",
    slug: "ferry",
    prompt: "Open water, a shared railing, and a wind that makes leaning in look accidental.",
    gayPrompt: "Someone's doing the Titanic pose unprompted, the gulls have chosen violence, and a long-distance thing is being renegotiated over seltzer.",
    stamp: "Upper deck"
  },
  {
    name: "Pier",
    slug: "pier",
    prompt: "Carnival lights, a shared funnel cake, and a Ferris wheel that stalls at the very top.",
    gayPrompt: "A rigged ring toss, a giant stuffed animal won out of spite, and a confession timed perfectly with the fireworks.",
    stamp: "Boardwalk"
  },
  {
    name: "Spa",
    slug: "spa",
    prompt: "Low light, eucalyptus, and a silence that says more than the small talk did.",
    gayPrompt: "Cucumber water, a face-mask confession, and someone treating a wellness day like court-ordered couples therapy.",
    stamp: "Quiet hour"
  },
  {
    name: "Hair Salon",
    slug: "hair_salon",
    prompt: "Mirror talk, a transformation underway, and a confession that only happens mid-blowout.",
    gayPrompt: "A breakup haircut in progress, the stylist is somehow also a licensed therapist, and everyone's getting bangs out of solidarity.",
    stamp: "Chair 2"
  },
  {
    name: "Tattoo Parlor",
    slug: "tattoo_parlor",
    prompt: "A buzzing needle, a permanent decision, and someone holding a hand 'for the pain.'",
    gayPrompt: "A matching-tattoo idea on a three-week situationship, the artist quietly staging an intervention, and someone crying that it 'doesn't even hurt.'",
    stamp: "Walk-in"
  },
  {
    name: "Office",
    slug: "office",
    prompt: "After hours, monitors still glowing, and a deadline that's become an excuse to stay.",
    gayPrompt: "An after-hours 'quick question,' a situationship conducted entirely in Slack, and HR is absolutely going to hear about this.",
    stamp: "Late shift"
  },
  {
    name: "Aquarium",
    slug: "aquarium",
    prompt: "Blue light, a slow drift of fish, and a hand that almost reaches for another in the dark.",
    gayPrompt: "The jellyfish tank is serving ethereal, someone's crying at the sea turtles, and a first date is going suspiciously, alarmingly well.",
    stamp: "Deep tank"
  },
  {
    name: "Farmers Market",
    slug: "farmers_market",
    prompt: "Morning stalls, a sample offered, and a hand-off of fruit that lasts a second too long.",
    gayPrompt: "An heirloom-tomato bidding war, a tote bag that says everything, and someone catching feelings for the man selling honey.",
    stamp: "Stall 12"
  },
  {
    name: "Ski Lodge",
    slug: "ski_lodge",
    prompt: "Snow on the glass, a crackling fire, and two people who got 'too tired' to ski.",
    gayPrompt: "Nobody actually skied. There's mulled wine, a shared blanket, and a deeply intense group conversation about everyone's attachment style.",
    stamp: "Fireside"
  },
  {
    name: "Hot Spring",
    slug: "hot_spring",
    prompt: "Rising steam, a quiet soak, and a closeness the cold air outside can't explain.",
    gayPrompt: "An accidental couples' soak, a conversation more honest than anyone will admit to later, and lanterns setting the mood unfairly.",
    stamp: "The springs"
  },
].map((loc) => ({
  ...loc,
  art: {
    day: `${LOCATION_ART_DIR}/${loc.slug}_day_banner.png`,
    night: `${LOCATION_ART_DIR}/${loc.slug}_night_banner.png`
  }
}));

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
  themeButton: document.querySelector("#themeButton"),
  setupButton: document.querySelector("#setupButton"),
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
    exampleQuestion: "Is your person under nightclub lighting?"
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
  // The board sits directly on the location banner art (no cream panel).
  if (els.characterBoard) els.characterBoard.style.setProperty("--board-art", `url('${encodeURI(artSrc)}')`);
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
    return;
  }
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
      ${m.cornerHtml || ""}
    </div>
    <div class="secret-info">
      <p class="secret-name">${displayName(secret)}</p>
      ${gayFroggedAssignment ? `<p class="secret-meta secret-pronouns">${escapeHtml(gayFroggedAssignment.pronoun || "they/them")}</p>` : ""}
      ${state.global.mystery?.id === "role-reveal" ? `<p class="secret-meta">${escapeHtml(roleFor(secret.id))}</p>` : ""}
      ${m.html ? `<div class="secret-mode-meta">${m.html}</div>` : ""}
    </div>
  `;
  setButtonIcon(els.revealSecretButton, "eyeOff", "Hide face");
}

function renderBoard() {
  const player = currentPlayer();
  els.characterBoard.innerHTML = "";
  els.characterBoard.className = "character-board";
  els.characterBoard.setAttribute("aria-label", "Character board");
  if (state.global.mystery?.id === "family-tree-disaster") {
    renderFamilyBoard(player);
    return;
  }
  if (state.global.mystery?.id === "knockoff-manor") {
    renderKnockoffManorBoard(player);
    return;
  }
  els.characterBoard.classList.toggle("ygo-board", state.global.mystery?.id === "yugioh");
  els.characterBoard.classList.toggle("orgy-board", state.global.mystery?.id === "orgy");
  state.board.forEach((character) => {
    els.characterBoard.appendChild(createCharacterCard(character, player));
  });
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
  if (!state.settings.mystery) {
    els.mysteryResult.textContent = "Mystery is off.";
  } else if (currentPlayer().mysteryUsed && !els.mysteryResult.textContent) {
    els.mysteryResult.textContent = "This seat already burned its mystery.";
  }
}

function toggleEliminated(id) {
  const player = currentPlayer();
  // Clicking a downed tile flips it back up, so the toggle is its own undo.
  if (player.eliminated.has(id)) {
    player.eliminated.delete(id);
    state.justEliminated = null;
  } else {
    player.eliminated.add(id);
    // Fireworks Mode: mark the just-killed card so its head-pop + fireworks plays once.
    state.justEliminated = state.global.mystery?.id === "fireworks" ? id : null;
  }
  renderBoard();
  state.justEliminated = null;
}

// Per-mode question decks - when a special mode is active, every drawn question matches its flavour.
const modePrompts = {
  yugioh: [
    "Is your person a Monster card?",
    "Is your person a Spell or Trap?",
    "Does your person have more than 2000 ATK?",
    "Is your person's DEF higher than their ATK?",
    "Is your person a DARK attribute?",
    "Is your person Level 5 or higher (would need a Tribute)?",
    "Is your person an Effect Monster?",
    "Could your person be Special Summoned?",
    "Is your person a Normal Monster (no effect)?",
    "Would you set your person face-down?",
    "Is your person a Continuous card?",
    "Does your person belong in the Graveyard already?",
    "Is your person your opening hand?",
    "Is your person a Dragon-type?",
    "Would your person survive Mirror Force?"
  ],
  orgy: [
    "Is your person a top?",
    "Is your person a bottom?",
    "Is your person choking someone tonight?",
    "Is your person getting gagged?",
    "Is your person's body count over 100?",
    "Is your person's cum count today above 5?",
    "Has your person slept with someone else on this board?",
    "Is your person's horniness maxed out?",
    "Does your person have low stamina?",
    "Is someone specific UP NEXT for your person?",
    "Is your person a power bottom?",
    "Is your person a starfish?",
    "Is your person keeping a lot of secrets?",
    "Would your person survive the night?",
    "Is your person linked to more than one other player?"
  ],
  fireworks: [
    "Is your person about to lose their head?",
    "Would your person go out with a bang?",
    "Is your person next on the chopping block?",
    "Does your person deserve to explode?",
    "Would your person make a pretty firework?",
    "Is your person keeping their head down?",
    "Should your person's head pop first?",
    "Is your person a dud or a showstopper?"
  ],
  "knockoff-manor": [
    "Is your person in the BATHS ROOM?",
    "Did your person do it?",
    "Is your person in the same room as the body?",
    "Is your person holding the weapon?",
    "Is your person upstairs?",
    "Does your person have an alibi (they don't)?",
    "Is your person sweating right now?",
    "Would your person flee the manor?"
  ],
  "gay-frogged": [
    "Is your person glowing the same colour as yours?",
    "Is your person serving cunt?",
    "Does your person top from the bottom?",
    "Is your person a POC icon?",
    "Would your person host the function?"
  ]
};

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

function applyMysteryEffect(effectId) {
  clearMysteryEffectUI();
  const effect = mysteryEffects.find((item) => item.id === effectId);
  if (!effect) return;
  state.global.mystery = effect.apply(effect);
}

function clearMysteryEffectUI() {
  state.global.mystery = null;
  els.characterBoard?.classList.remove("family-tree-board", "knockoff-manor-board", "ygo-board", "orgy-board");
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
  // One-shot head-pop + fireworks when this card was just eliminated in Fireworks Mode.
  const popping = state.justEliminated === character.id;
  if (popping) card.classList.add("is-fireworks-pop");
  card.dataset.id = character.id;
  if (mystery.effectName) card.dataset.mysteryEffect = mystery.effectName;
  if (mystery.style) card.setAttribute("style", mystery.style);
  Object.entries(mystery.dataset || {}).forEach(([key, value]) => {
    card.dataset[key] = value;
  });
  const prop = mystery.propEmoji ? `<span class="prop-overlay" aria-label="${escapeHtml(mystery.primaryText)}">${mystery.propEmoji}</span>` : "";
  // Roles are hidden by default - they are not known initially and only surface once the
  // Role Reveal mystery effect is triggered (which renders them via mystery.html below).
  const portraitSrc = mystery.image || character.image;
  // Fireworks Mode kill: a detached "head" (top slice of the portrait) flies up out of the frame and
  // bursts into fireworks. The base portrait is clipped to the body so the head looks separated.
  let fireworks = "";
  if (popping) {
    const cols = ["#ff4d6d", "#ffd24d", "#5dff8f", "#4dd2ff", "#c46bff", "#ff8a4d", "#fff27a"];
    let parts = "";
    const N = 16;
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 + (i % 2 ? 0.2 : 0);
      const dist = 46 + (i % 4) * 14;
      const tx = Math.round(Math.cos(ang) * dist);
      const ty = Math.round(Math.sin(ang) * dist);
      parts += `<i style="--tx:${tx}px;--ty:${ty}px;background:${cols[i % cols.length]}"></i>`;
    }
    fireworks = `<div class="fw" aria-hidden="true">`
      + `<img class="fw-head" src="${portraitSrc}" alt="">`
      + `<div class="fw-burst">${parts}</div><div class="fw-flash"></div></div>`;
  }
  card.innerHTML = `
    <div class="portrait-wrap">
      <img src="${portraitSrc}" alt="${escapeHtml(character.name)}">
      ${fireworks}
      ${prop}
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
    return {
      effectName: mystery.name,
      cardClass: `gayfrog gayfrog-${assignment.key}`,
      dataset: { gayfrogColor: assignment.color },
      style: `--glow:${assignment.color}`,
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
      ? `<span class="ygo-stars" aria-label="Level ${a.level}">${"◆".repeat(a.level)}</span>`
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
  const suffixes = ["of the Forbidden Memory", "of Eternal Duels", "of the Shadow Realm", "of Ascended Destiny",
    "of the Sacred Beasts", "of Infinite Tribute", "of the Millennium Gate", "of Roaring Fate"];
  const lines = [
    "Once per turn, the duelist who controls this field may banish all hesitation from their hand.",
    "While this card remains face-up, every glance counts as a Tribute. Destiny is not negotiable.",
    "A field where the heart of the cards beats loudest — and secrets are paid as a cost.",
    "Activate this Field Spell to draw one truth. Your opponent cannot respond to the awkwardness.",
    "It's your move. The shadows lengthen, the crowd holds its breath, and someone is bluffing.",
    "This card cannot be destroyed by social niceties. Believe in the heart of the cards.",
    "Send one assumption to the graveyard, then Special Summon a brand-new suspicion in its place."];
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
  const skin = pick(names);
  const color = (tb && tb.skinToneHex && tb.skinToneHex[skin]) || "#c88968";
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
newGame();
wireCueCardClick();
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
