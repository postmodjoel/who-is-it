// WHO? DO YOU THINK? prompt deck. Its neutral faces are the straight man, so these prompts deliberately
// stay independent of WHO? IS IT?'s mystery-effect decks and never require a transformed board.
//
// VOICE RULES (July 2026 rewrite). The deck reads as AI-written the moment it breaks these:
//   1. No twist tail. The dark noun IS the punchline. "serial killers with disappointing nicknames",
//      "a sex dungeon with a cleaning roster", "a clipboard to an orgy" - every quirky detail bolted on
//      after the accusation is the prompt apologising for itself. Land it and stop.
//   2. Verdict, not scenario. "There is a body in the boot, pick who put it there" lets players cast a
//      movie. "The three who would murder you for less" makes them point at a person. Point at a person.
//   3. Cut every clause that is not the accusation. Three clauses to deliver one idea is one clause.
//   4. Vary the shape. Bare labels ~40%, "Pick {n}..." ~25%, questions/"Point to" ~20%, rankings ~15%.
//      A bare label is usually the strongest form available.
//   5. Target behaviour and prejudice, never protected identity. "The racists" yes; "the minorities" no.
//
// HEAT IS A REAL LADDER. allowedHeats() in app.js gates round 0 to mild ONLY, so the mild tier is the
// game's first impression - it must be blunt and funny, just not criminal or sexual. Medium is mostly
// pgSafe so PG mode has a playable deck; feral is never in PG.
//
// BALLOT SIZE IS DYNAMIC - see pickCountFor() in groupthink-rules.js. A round asks for one, two or
// three faces depending on crowd size and how much board is left, so NEVER hard-code "three":
//   {n}     - becomes "two"/"three" (and "one" when no solo form is given).
//   solo    - the rewrite used on a one-pick ballot, where plural grammar collapses.
//             "The racists." -> "The racist."  Omit it only when the text already reads at any count.
//   picks   - pins a prompt to its own ballot size regardless of crowd or board. Superlatives are
//             single-pick by construction: there is only one worst person.
(function installGroupthinkData() {
  const p = (id, text, heat = "mild", pgSafe = true, extra = null) =>
    ({ id, text, heat, pgSafe, ...(extra || {}) });
  const solo = (text, picks) => (picks ? { solo: text, picks } : { solo: text });
  const only = (picks) => ({ picks });

  window.GameData.groupthinkPrompts = {
    base: [
      // ---- MILD: the opener. Social, physical, pathetic. Cruel without a corpse. ----
      p("smelliest", "The smelliest ones.", "mild", true, solo("The smelliest one.")),
      p("ugliest", "The ugliest ones.", "mild", true, solo("The ugliest one.")),
      p("most-punchable", "The most punchable faces.", "mild", true, solo("The most punchable face.")),
      p("worst-breath", "Rank the {n} with the worst breath.", "mild", true, solo("The worst breath.")),
      p("fake-nice", "The ones pretending to be nice.", "mild", true, solo("The one pretending to be nice.")),
      p("smug-no-reason", "The smug ones with nothing to be smug about.", "mild", true, solo("Smug. No reason.")),
      p("bad-vibes", "Pure bad vibes.", "mild"),
      p("least-trusted", "The ones you trust least.", "mild", true, solo("The one you trust least.")),
      p("worst-person", "The worst person.", "mild", true, only(1)),
      p("most-desperate", "The most desperate ones.", "mild", true, solo("The most desperate one.")),
      p("dog-dislikes", "The {n} your dog would bark at.", "mild", true, solo("The one your dog would bark at.")),
      p("forgettable", "The {n} nobody remembers meeting.", "mild", true, solo("Nobody remembers meeting this one.")),
      p("worst-laugh", "The worst laughs.", "mild", true, solo("The worst laugh.")),
      p("peaked-at-school", "The ones who peaked at school.", "mild", true, solo("Peaked at school.")),
      p("rude-to-waiters", "The ones who talk to waiters like that.", "mild", true, solo("Talks to waiters like that.")),
      p("never-pay", "The ones who never pay their share.", "mild", true, solo("Never pays their share.")),
      p("cry-first", "Who cries first?", "mild", true, only(1)),
      p("no-friends", "The ones with no friends outside work.", "mild", true, solo("No friends outside work.")),
      p("exhausting", "The most exhausting to be near.", "mild"),

      // ---- MEDIUM: prejudice, betrayal, dishonesty, institutional shame. ----
      p("racists", "The racists.", "medium", true, solo("The racist.")),
      p("homophobes", "The homophobes.", "medium", true, solo("The homophobe.")),
      p("most-manipulative", "The most manipulative.", "medium"),
      p("worst-parents", "The worst parents.", "medium", true, solo("The worst parent.")),
      p("family-disappointment", "The family disappointments.", "medium", true, solo("The family disappointment.")),
      p("secretly-hated", "The ones their friends secretly hate.", "medium", true, solo("Their friends secretly hate this one.")),
      p("least-attractive", "The least attractive.", "medium"),
      p("cannot-be-alone", "The ones who should not be left alone together.", "medium", true, only(2)),
      p("diversity-training", "The ones who make diversity training about themselves.", "medium", true, solo("Made diversity training about themselves.")),
      p("human-resources-file", "The {n} with the thickest HR files.", "medium", true, solo("The thickest HR file.")),
      p("workplace-bully", "The workplace bullies.", "medium", true, solo("The workplace bully.")),
      p("cheaters", "The cheaters.", "medium", true, solo("The cheater.")),
      p("secret-phone", "The ones hiding a second phone.", "medium", true, solo("Hiding a second phone.")),
      p("married-on-apps", "The married ones still on dating apps.", "medium", true, solo("Married. Still on the apps.")),
      p("landlord-deposit", "The landlords keeping the bond.", "medium", true, solo("The landlord keeping the bond.")),
      p("will-excluded", "The ones written out of the will.", "medium", true, solo("Written out of the will.")),
      p("wrongful-dismissal", "The ones who absolutely deserved to be fired.", "medium", true, solo("Absolutely deserved to be fired.")),
      p("expense-fraud", "The ones committing expense fraud.", "medium", true, solo("Committing expense fraud.")),
      p("charity-thieves", "The ones stealing from their own charity.", "medium", true, solo("Stealing from their own charity.")),
      p("funeral-theft", "Who is robbing the house during the funeral?", "medium"),
      p("coffin-selfie", "The ones taking a selfie with the open coffin.", "medium", true, solo("Took a selfie with the open coffin.")),
      p("neighbour-key", "Pick {n} you would never give a spare key.", "medium", true, solo("Never give this one a spare key.")),
      p("fake-name", "Pick {n} most likely to be arrested by police.", "medium", true, solo("Pick the one most likely to be arrested by police.")),
      p("police-interview-first", "Police interview these {n} first.", "medium", true, solo("Police interview this one first.")),
      p("false-confession", "The ones who would confess to a murder they did not commit.", "medium", true, solo("Would confess to a murder they did not commit.")),
      p("jury-convict", "You are the jury. Convict {n} on appearance alone.", "medium", true, solo("You are the jury. Convict one on appearance alone.")),
      p("prison-thrive", "The ones who would thrive in prison.", "medium", true, solo("Would thrive in prison.")),
      p("true-crime-subject", "Pick {n} most likely to have a true-crime podcast made about them.", "medium", true, solo("Pick the one most likely to have a true-crime podcast made about them.")),
      p("cult", "Pick {n} most likely to start a cult.", "medium", true, solo("Pick the one most likely to start a cult.")),
      p("cult-recruitment", "Who gets recruited into the cult first?", "medium", true, only(1)),
      p("cult-leader-plain", "The cult leader and their first two followers.", "medium", true, only(3)),
      p("fake-degree", "Who has the fake degree?", "medium", true, only(1)),
      p("interrogation-break", "Who breaks first in the interrogation room?", "medium", true, only(1)),
      p("divorce-cause", "The most likely to cause a divorce.", "medium"),
      p("border-watchlist", "The ones on a watchlist.", "medium", true, solo("On a watchlist.")),

      // ---- FERAL: crime, bodies, sex, the things you cannot walk back. ----
      p("airport", "Pick {n} most likely to be cavity-searched at an airport.", "feral", false, solo("Pick the one most likely to be cavity-searched at an airport.")),
      p("cannibals", "Pick {n} most likely to be cannibals.", "feral", false, solo("Pick the one most likely to be a cannibal.")),
      p("kill-old-woman", "Pick {n} most likely to kill an old woman for the inheritance.", "feral", false, solo("Pick the one most likely to kill an old woman for the inheritance.")),
      p("unmarked-freezer", "The ones with something human in the freezer.", "feral", false, solo("Something human in the freezer.")),
      p("racist-group-chat", "The ones with a second, much more racist group chat.", "feral", false, solo("Has a second, much more racist group chat.")),
      p("slur-defence", "Pick {n} most likely to say a slur, then explain why it did not count.", "feral", false, solo("Pick the one most likely to say a slur, then explain why it did not count.")),
      p("poly-throuple", "The three most likely to be in a polyamorous throuple.", "feral", false, only(3)),
      p("molesters", "Pick {n} most likely to be child molesters.", "feral", false, solo("Pick the one most likely to be a child molester.")),
      p("serial-killers-plain", "Pick {n} most likely to be serial killers.", "feral", false, solo("Pick the one most likely to be a serial killer.")),
      p("shallow-grave", "Pick {n} who know where the shallow grave is.", "feral", false, solo("Pick the one who knows where the shallow grave is.")),
      p("poisoners", "Pick {n} most likely to poison somebody slowly.", "feral", false, solo("Pick the one most likely to poison somebody slowly.")),
      p("crime-scene-cleaner", "The ones who would clean a crime scene without asking.", "feral", false, solo("Would clean a crime scene without asking.")),
      p("hit-and-run", "The hit-and-run drivers.", "feral", false, solo("The hit-and-run driver.")),
      p("evidence-burners", "The ones already burning evidence.", "feral", false, solo("Already burning evidence.")),
      p("buried", "Pick {n} most likely to have buried something still moving.", "feral", false, solo("Pick the one most likely to have buried something still moving.")),
      p("arson", "Pick {n} who know exactly how the fire started.", "feral", false, solo("Pick the one who knows exactly how the fire started.")),
      p("least-missed", "The ones nobody would report missing.", "feral", false, solo("Nobody would report this one missing.")),
      p("funeral-relief", "The funerals you would attend just to make sure.", "feral", false, solo("The funeral you would attend just to make sure.")),
      p("children-avoid", "The ones children instinctively avoid.", "feral", false, solo("Children instinctively avoid this one.")),
      p("nursing-home-ban", "The ones banned from the nursing home.", "feral", false, solo("Banned from the nursing home.")),
      p("prison-first-night", "Who has the worst first night in prison?", "feral", false, only(1)),
      p("cult-sacrifice", "Pick {n} most likely to volunteer somebody else for the sacrifice.", "feral", false, solo("Pick the one most likely to volunteer somebody else for the sacrifice.")),
      p("boss-affair", "Pick {n} most likely to try to fuck their boss.", "feral", false, solo("Pick the one most likely to try to fuck their boss.")),
      p("father-affair", "Pick {n} most likely to have an affair with their own father.", "feral", false, solo("Pick the one most likely to have an affair with their own father.")),
      p("secret-lovers", "The ones already sleeping together.", "feral", false, only(2)),
      p("worst-in-bed", "The worst in bed.", "feral", false),
      p("family-function-hookup", "The ones who hook up at a family function.", "feral", false, only(2)),
      p("pregnancy-denial", "Pick {n} most likely to deny the baby is theirs.", "feral", false, solo("Pick the one most likely to deny the baby is theirs.")),
      p("affair-receipts", "The ones keeping receipts from the affair.", "feral", false, solo("Keeping receipts from the affair.")),
      p("grave", "Pick {n} most likely to have had sex in a graveyard.", "feral", false, solo("Pick the one most likely to have had sex in a graveyard.")),
      p("sex-dungeon", "Pick {n} most likely to have a sex dungeon.", "feral", false, solo("Pick the one most likely to have a sex dungeon.")),
      p("swingers", "Pick {n} most likely to suggest a swingers party.", "feral", false, solo("Pick the one most likely to suggest a swingers party."))
    ],
    locations: [
      p("loc-thrown-out", "Who gets thrown out of {location} first?", "mild", true, only(1)),
      p("loc-recognised", "At {location}, the ones the staff recognise.", "mild", true, solo("At {location}, the one the staff recognise.")),
      p("loc-police", "Police have surrounded {location}. Pick the {n} they came for.", "medium", true, solo("Police have surrounded {location}. Pick the one they came for.")),
      p("loc-die", "Pick {n} most likely to die at {location}.", "feral", false, solo("Pick the one most likely to die at {location}."))
    ]
  };
})();
