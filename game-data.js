// ===================================================================================
// GAME DATA — editable content (questions, locations, mode flavour). Safe to edit in a
// separate thread without touching game logic in app.js. Loaded as window.GameData.
// ===================================================================================
window.GameData = {
  // Player question decks ------------------------------------------------------------
  classicPrompts: [
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
],

  absurdPrompts: [
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
],

  // Per-mode question decks (keyed by mystery-effect id) -----------------------------
  modePrompts: {
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
  ],
  disease: [
    "Is your person's worst condition MEGA?",
    "Does your person have cancer?",
    "Is your person pregnant?",
    "Is your person's autism above 50%?",
    "Is your person in serious pain (>:( )?",
    "Has your person been diagnosed with Hysteria?",
    "Is your person on more than one medication?",
    "Does your person have a terminal estimated arrival?",
    "Is one of your person's conditions on the old DSM?",
    "Would your person survive to next Tuesday?",
    "Is your person prescribed leeches?"
  ],
  drugs: [
    "Does your person inject?",
    "Does your person have more than one habit?",
    "Does your person smoke their drug of choice?",
    "Is your person hooked on something you snort?",
    "Does your person take more than 10 a day?",
    "Is your person on the gear?",
    "Would your person huff it?",
    "Does your person swallow theirs?",
    "Is your person clean? (they are not)"
  ],
  fertility: [
    "Is your person barren?",
    "Does your person's count run into the billions?",
    "Does your person have a product defect?",
    "Is your person's next emptying within the hour?",
    "Does your person have more than 100 eggs?",
    "Are your person's swimmers slow?",
    "Is your person a battery farm?",
    "Would you breed your person?"
  ],
  disguise: [
    "Can you even tell who your person is?",
    "Are your person's eyes giving anything away?",
    "Would you recognise your person at the shops?",
    "Is your person hiding a smile under there?",
    "Could your person rob a bank like this?"
  ],
  work: [
    "Is your person ready for the 9am stand-up?",
    "Does your person look like they slept?",
    "Has your person had any sun this year?",
    "Would your person reply-all by mistake?",
    "Is your person dead behind the eyes?",
    "Does your person have any eyebrows left?"
  ]
},

  // Locations (art paths are derived from `slug` in app.js) --------------------------
  locations: [
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
],

  // Yu-Gi-Oh 'Field Spell' location reskin -------------------------------------------
  yugiohField: {
    suffixes: ["of the Forbidden Memory", "of Eternal Duels", "of the Shadow Realm", "of Ascended Destiny",
    "of the Sacred Beasts", "of Infinite Tribute", "of the Millennium Gate", "of Roaring Fate"],
    lines: [
    "Once per turn, the duelist who controls this field may banish all hesitation from their hand.",
    "While this card remains face-up, every glance counts as a Tribute. Destiny is not negotiable.",
    "A field where the heart of the cards beats loudest — and secrets are paid as a cost.",
    "Activate this Field Spell to draw one truth. Your opponent cannot respond to the awkwardness.",
    "It's your move. The shadows lengthen, the crowd holds its breath, and someone is bluffing.",
    "This card cannot be destroyed by social niceties. Believe in the heart of the cards.",
    "Send one assumption to the graveyard, then Special Summon a brand-new suspicion in its place."]
  },

  // Disease Mode data ----------------------------------------------------------------------------
  // Deliberately outdated / un-medical "diagnoses" (old DSM-style) plus a couple of real heavy ones.
  // tier: MINOR | MAJOR | MEGA
  diseases: [
    ["Homosexuality", "MAJOR"], ["Hysteria", "MINOR"], ["Drapetomania", "MAJOR"],
    ["Moral Insanity", "MAJOR"], ["Inadequate Personality", "MINOR"], ["Neurasthenia", "MINOR"],
    ["Melancholia", "MINOR"], ["The Vapours", "MINOR"], ["Wandering Womb", "MAJOR"],
    ["Affluenza", "MINOR"], ["Gout", "MINOR"], ["Consumption", "MAJOR"], ["Brain Fever", "MAJOR"],
    ["Lovesickness", "MINOR"], ["Ennui", "MINOR"], ["Scurvy", "MINOR"], ["Bad Humours", "MINOR"],
    ["HIV", "MEGA"], ["Bubonic Plague", "MEGA"], ["Consumption of the Soul", "MEGA"],
    ["Nervous Exhaustion", "MINOR"], ["Excess of Bile", "MINOR"], ["Female Hysteria", "MAJOR"]
  ],
  cancerTypes: ["Lung", "Pancreatic", "Skin", "Bone", "Brain", "Liver", "Stomach", "Throat",
    "Blood", "Colon", "Eyeball", "Elbow", "Vibe", "Wallet", "Spleen"],
  cancerEtas: ["3 weeks", "6 months", "18 months", "by 2030", "imminent", "Q3", "next Tuesday",
    "any day now", "already here", "5–7 business days"],
  medications: ["Mercury Tonic", "Heroic Cough Syrup", "Radium Water", "Cocaine Drops",
    "Leeches (3x daily)", "Laudanum", "Arsenic Wafers", "Lithium Soda", "Snake Oil", "Bloodletting",
    "Tobacco Smoke Enema", "Morphine Lozenge", "Electroshock (PRN)", "Lobotomy (pending)",
    "Strychnine Pick-Me-Up", "Cod Liver Oil", "Opium Tincture", "Vibes (untested)"],
  // Pain faces from worst (left) to best (right).
  painFaces: [">:(", ">:|", ":|", ":)", ":D"],

  // Drug Addict Mode data ------------------------------------------------------------------------
  // Street names only, paired with how they take it.
  drugs: [
    ["Smack", "inject"], ["Gear", "inject"], ["Crank", "inject"], ["Tina", "inject"],
    ["Charlie", "snort"], ["Bugle", "snort"], ["Ket", "snort"], ["Special K", "snort"],
    ["Crack", "smoke"], ["Rock", "smoke"], ["Brown", "smoke"], ["Spice", "smoke"], ["Reefer", "smoke"],
    ["Molly", "swallow"], ["Mandy", "swallow"], ["Tabs", "swallow"], ["Beans", "swallow"],
    ["Vallies", "swallow"], ["Benzos", "swallow"], ["Oxys", "swallow"], ["Lean", "drink"],
    ["Poppers", "huff"], ["Glue", "huff"], ["Gas", "huff"], ["Whippits", "huff"], ["Meow Meow", "snort"],
    ["Bath Salts", "snort"], ["Devil's Lettuce", "smoke"], ["Jenkem", "huff"]
  ],
  drugMethods: {
    inject: "💉 inject", snort: "👃 snort", smoke: "🚬 smoke",
    swallow: "💊 swallow", drink: "🥤 drink", huff: "🫁 huff"
  }
};
