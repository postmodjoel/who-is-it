// WHO? DO YOU THINK? prompt deck. Its neutral faces are the straight man, so these prompts deliberately
// stay independent of WHO? IS IT?'s mystery-effect decks and never require a transformed board.
(function installGroupthinkData() {
  const p = (id, text, heat = "mild", pgSafe = true) => ({ id, text, heat, pgSafe });
  window.GameData.groupthinkPrompts = {
    base: [
      p("cult", "Pick three most likely to start a cult."),
      p("funeral", "Pick three you would trust to plan your funeral."),
      p("reality-tv", "Pick three most likely to survive a reality show."),
      p("fake-name", "Pick three most likely to give the police a fake name."),
      p("group-admin", "Pick three most likely to become the group-chat admin."),
      p("airport", "Pick three most likely to cause a scene at the airport."),
      p("lottery", "Pick three most likely to disappear after winning the lottery."),
      p("karaoke", "Pick three most likely to take karaoke far too seriously."),
      p("flatpack", "Pick three most likely to lie about being able to build flat-pack furniture."),
      p("wrong-wedding", "Pick three most likely to attend the wrong wedding and stay."),
      p("escape-room", "Pick three most likely to ruin an escape room for everyone."),
      p("neighbour-key", "Pick three you would never give a spare key."),
      p("secret-family", "Pick three most likely to have a secret second family.", "medium", false),
      p("fake-death", "Pick three most likely to fake their own death.", "medium", false),
      p("affair", "Pick three most likely to have an affair and confess in the family group chat.", "medium", false),
      p("buried", "Pick three most likely to have buried something that was still moving.", "medium", false),
      p("witness", "Pick three who would make the least convincing witnesses.", "medium"),
      p("blackmail", "Pick three most likely to keep blackmail material in a labelled folder.", "medium", false),
      p("arson", "Pick three most likely to know exactly how the fire started.", "medium", false),
      p("alibi", "Pick three most likely to have rehearsed an alibi for tonight.", "medium", false),
      p("body", "Pick three you would call if you needed to move a body.", "medium", false),
      p("crime-podcast", "Pick three most likely to turn their own crime into a podcast.", "medium", false),
      p("swingers", "Pick three most likely to suggest turning dinner into a swingers party.", "feral", false),
      p("molesters", "Pick three most likely to be child molesters.", "feral", false),
      p("human-meat", "Pick three most likely to have eaten human meat and enjoyed it.", "feral", false),
      p("sex-dungeon", "Pick three most likely to have a sex dungeon with a cleaning roster.", "feral", false),
      p("serial-killer", "Pick three most likely to be serial killers with disappointing nicknames.", "feral", false),
      p("orgy-clipboard", "Pick three most likely to bring a clipboard to an orgy.", "feral", false),
      p("grave", "Pick three most likely to have had sex in a graveyard.", "feral", false),
      p("cult-sacrifice", "Pick three most likely to volunteer somebody else for the sacrifice.", "feral", false)
    ],
    locations: [
      p("loc-banned", "At {location}, pick three people who are already banned."),
      p("loc-employed", "At {location}, pick three people pretending to work there."),
      p("loc-lockin", "Locked overnight at {location}: pick the three people responsible."),
      p("loc-survive", "Pick three most likely to survive a night at {location}."),
      p("loc-cctv", "The CCTV from {location} has leaked. Pick three people definitely in it.", "medium", false),
      p("loc-police", "Police have surrounded {location}. Pick the three people they came for.", "medium", false),
      p("loc-toilet", "A toilet at {location} has been destroyed. Pick the three prime suspects.", "feral", false)
    ]
  };
})();
