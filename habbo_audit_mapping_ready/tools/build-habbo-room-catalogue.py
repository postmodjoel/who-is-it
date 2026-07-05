#!/usr/bin/env python3
"""Build the curated, gameplay-facing furni catalogue from the raw 12k-icon dump.

Input:  assets/habbo/furni-manifest.json  (raw scrape manifest - stays untouched as source data)
Output: assets/habbo/habbo-room-catalogue.json
        habbo-assets.js  (regenerated: legacy HabboFurniProps + embedded catalogue + picker,
                          because file:// can't fetch() JSON - the game loads JS, tools load JSON)

Curation rules:
- Filename-keyword categorisation into the room categories the game needs.
- Size groups per category: background (wall-ish) / large (anchors) / medium / small.
- Hard caps per group so the catalogue is a CURATED list, not a re-dump.
- Wearables/effects/NFT junk excluded outright.
- Local filenames only. Gameplay must select ONLY from this catalogue, never the raw folder.

Usage:  python3 tools/build-habbo-room-catalogue.py
"""
import json
import os
import re

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
MANIFEST = os.path.join(ROOT, "assets", "habbo", "furni-manifest.json")
CATALOGUE = os.path.join(ROOT, "assets", "habbo", "habbo-room-catalogue.json")
RUNTIME_JS = os.path.join(ROOT, "habbo-assets.js")

CAPS = {"background": 12, "large": 22, "medium": 30, "small": 30}

EXCLUDE = ("clothing", "_shirt", "_hat_", "_hair", "_shoes", "_jacket", "_trousers", "_dress",
           "_skirt", "_acc_", "nft", "_badge", "effect_", "_fx_", "loyalty", "_suit", "_wig",
           "horse_dye", "_sticker", "poster_")   # poster_ items are wall stickers with no room identity

# category -> list of filename keywords (substring match, first-listed categories win ties).
CATEGORIES = {
    "park":      ["park_", "garden_", "country_", "autumn_", "picnic", "tree", "bench", "pond", "grass", "bush_"],
    "garden":    ["zengarden_", "bohogarden_", "easter_", "flower", "plant", "hedge", "fountain", "greenhouse"],
    "school":    ["school_", "classroom", "chalkboard", "locker", "study", "books", "satchel", "teacher"],
    "university": ["uni_", "campus", "lecture", "library", "bookcase", "bookshelf", "scroll"],
    "office":    ["exe_", "office", "desk", "printer", "telephone", "folder", "computer", "monitor", "swivel"],
    "cafe":      ["cafe_", "sunsetcafe_", "dessertcafe_", "room_cof", "coffee", "barista", "teapot", "mug"],
    "restaurant": ["diner_", "ktchn_", "restaurant", "counter", "fridge", "stove", "food", "pizza", "burger", "cake"],
    "bedroom":   ["bed_", "hygge_", "attic_", "messy_", "wardrobe", "dresser", "pillow", "duvet", "bunk"],
    "house":     ["lodge_", "sofa", "armchair", "lamp", "rug", "fireplace", "bookend", "tv_", "shelf"],
    "nightclub": ["party_", "disco_", "vwave_", "neonpunk_", "dj", "stage", "neon", "speaker", "spotlight", "clubsofa"],
    "party":     ["bday", "balloon", "confetti", "present", "gift", "pinata", "cake"],
    "hospital":  ["hosp_", "hosptl_", "xray", "medicine", "firstaid", "stretcher", "wheelchair"],
    "lab":       ["lab_", "_lab", "laboratory", "beaker", "microscope", "specimen", "machine"],
    "prison":    ["prison", "jail", "cell_", "chain", "cage", "wire"],
    "security":  ["army_", "wf_", "conf_", "security", "gate", "guard", "camera", "barrier"],
    "beach":     ["beach", "summer_", "seaside_", "santorini_", "lifeguard", "surf", "sand", "shell", "palm"],
    "pool":      ["pool", "float", "swim", "diving", "waterslide"],
    "spooky":    ["hween_", "skull", "ghost", "coffin", "blood", "cursed", "spider", "tomb", "grave"],
    "haunted":   ["gothic_", "darkelegant_", "candelabra", "cobweb", "raven", "crypt"],
    "arcade":    ["arcade_", "pinball", "joystick", "vrmachine", "claw", "coinslot"],
    "gaming":    ["gaming_", "console", "controller", "pixel_", "retro_tv"],
    "hotel":     ["hotel_", "room_hall", "classic1_", "hc_", "lobby", "reception", "chandelier", "pillar", "concierge"],
    "lobby":     ["elevator", "frontdesk", "luggage", "bellhop", "revolving"],
    "shop":      ["boutique_", "display", "checkout", "kiosk", "vending", "rack", "mannequin", "till"],
    "mall":      ["mall_", "market_", "stall", "shopping", "escalator"],
    "street":    ["road", "street", "lamppost", "pavement", "shopfront", "hydrant", "trafficlight", "bin_"],
    "city":      ["nyc_", "tokyo_", "paris_", "building", "skyline", "billboard", "subway"],
    "fantasy":   ["fantasy_", "wonderland_", "magitech_", "mushroom_", "dragon", "potion", "rune", "wizard", "magic", "fairy"],
    "weird":     ["cloud_", "stellar_", "alien", "ufo", "eyeball", "tentacle", "portal", "void", "duck"],
}

BACKGROUND_WORDS = ("wall", "window", "curtain", "banner", "wallpaper", "mural", "painting", "mirror", "clock", "sign")
LARGE_WORDS = ("sofa", "bed", "stage", "tree", "counter", "piano", "fireplace", "wardrobe", "fountain",
               "bookcase", "throne", "statue", "machine", "car", "escalator", "chandelier", "gate", "pillar")
MEDIUM_WORDS = ("table", "chair", "desk", "stool", "bench", "armchair", "dresser", "shelf", "locker",
                "fridge", "stove", "cabinet", "rack", "kiosk", "barrel")


def label_of(fname):
    base = fname[:-len("_icon.png")] if fname.endswith("_icon.png") else fname
    base = re.sub(r"^(room_|CF_\d+_|bonusrare\d*_?)", "", base)
    base = re.sub(r"_c?\d+[a-z]?_", "_", base)
    return re.sub(r"[_]+", " ", base).strip() or fname


def size_of(base):
    if any(w in base for w in BACKGROUND_WORDS):
        return "background"
    if any(w in base for w in LARGE_WORDS):
        return "large"
    if any(w in base for w in MEDIUM_WORDS):
        return "medium"
    return "small"


def main():
    manifest = json.load(open(MANIFEST))
    catalogue = {cat: {"background": [], "large": [], "medium": [], "small": []} for cat in CATEGORIES}
    for item in manifest:
        fn = item["filename"]
        base = fn.lower()
        if any(w in base for w in EXCLUDE):
            continue
        for cat, words in CATEGORIES.items():
            hits = [w for w in words if w in base]
            if not hits:
                continue
            group = size_of(base)
            bucket = catalogue[cat][group]
            if len(bucket) >= CAPS[group]:
                continue
            if any(e["file"] == fn for e in bucket):
                continue
            bucket.append({
                "file": fn,
                "label": label_of(fn),
                # More-specific keyword hits weigh heavier so themed sets beat generic words.
                "weight": min(3, len(hits) + (1 if any(len(w) > 6 for w in hits) else 0)),
                "enabled": True
            })
            break   # first matching category wins - keeps items from flooding every room

    # Map the game's location names onto catalogue categories (keyword -> category).
    location_aliases = {
        "park": "park", "garden": "garden", "greenhouse": "garden", "farm": "garden", "orchard": "garden",
        "meadow": "park", "camp": "park", "zoo": "park",
        "school": "school", "library": "university", "bookstore": "university", "museum": "university",
        "office": "office", "rooftop": "office",
        "cafe": "cafe", "bakery": "cafe", "diner": "restaurant", "restaurant": "restaurant",
        "kitchen": "restaurant", "market": "mall", "wine": "restaurant",
        "hotel": "hotel", "casino": "nightclub", "nightclub": "nightclub", "club": "nightclub",
        "karaoke": "nightclub", "record": "nightclub", "cinema": "arcade", "theatre": "nightclub",
        "bowling": "arcade", "arcade": "arcade",
        "hospital": "hospital", "pharmacy": "hospital", "dentist": "hospital",
        "gym": "pool", "yoga": "garden", "spa": "pool", "spring": "pool", "pool": "pool",
        "bath": "pool", "sauna": "pool", "aquarium": "pool",
        "beach": "beach", "pier": "beach", "ferry": "beach", "harbour": "beach", "island": "beach",
        "ski": "weird", "snow": "weird", "mountain": "park", "lodge": "house",
        "gallery": "hotel", "tattoo": "shop", "salon": "shop", "laundromat": "shop",
        "station": "street", "train": "street", "airport": "lobby", "city": "city",
        "graveyard": "spooky", "manor": "haunted", "castle": "haunted"
    }

    out = {
        "$schema": "who-is-it-habbo-room-catalogue-v1",
        "note": "Curated gameplay catalogue. Gameplay selects ONLY from here, never the raw furni dump.",
        "fallbackOrder": ["hotel", "park"],
        "placementMix": { "background": [1, 2], "large": [2, 4], "medium": [3, 8], "small": [3, 8], "total": [8, 20] },
        "locationAliases": location_aliases,
        "rooms": catalogue
    }
    with open(CATALOGUE, "w") as f:
        json.dump(out, f, indent=1)
    total = sum(len(g) for c in catalogue.values() for g in c.values())
    print(f"catalogue: {total} curated entries across {len(catalogue)} categories -> {os.path.relpath(CATALOGUE, ROOT)}")
    for cat, groups in catalogue.items():
        sizes = " ".join(f"{k}:{len(v)}" for k, v in groups.items() if v)
        print(f"  {cat:12s} {sizes or 'EMPTY'}")

    # ---- regenerate habbo-assets.js: legacy props + embedded catalogue + deterministic picker ----
    legacy = ""
    try:
        cur = open(RUNTIME_JS).read()
        m = re.search(r"window\.HabboFurniProps\s*=\s*(\[.*?\]);", cur, re.S)
        if m:
            legacy = m.group(1)
    except Exception:
        pass
    with open(RUNTIME_JS, "w") as f:
        f.write("// GENERATED by tools/build-habbo-room-catalogue.py - curated room catalogue embedded as JS\n"
                "// (file:// can't fetch JSON). Raw manifests in assets/habbo/ remain the source data.\n")
        if legacy:
            f.write("// Legacy tag-based props (kept for compatibility with the current room renderer):\n")
            f.write("window.HabboFurniProps = " + legacy + ";\n")
        f.write("window.HabboRoomCatalogue = ")
        json.dump(out, f, separators=(",", ":"))
        f.write(";\n")
        f.write("""
// Pick a furnished-room set from the curated catalogue. Deterministic when hashFn is supplied
// (pass the game's stableHash + a salt-derived seed string) - both online clients agree.
// Never touches the raw furni dump; enabled entries only; weight-respecting; 8-20 items via the
// catalogue's placementMix (1-2 background, 2-4 large, 3-8 medium, 3-8 small).
window.HabboRooms = {
  categoryFor(locationName) {
    const name = String(locationName || "").toLowerCase();
    const aliases = window.HabboRoomCatalogue.locationAliases || {};
    for (const key of Object.keys(aliases)) if (name.includes(key)) return aliases[key];
    return null;
  },
  pick(locationName, seedStr, hashFn) {
    const cat = window.HabboRoomCatalogue;
    const h = hashFn || ((s) => { let x = 5381; for (let i = 0; i < s.length; i++) x = ((x << 5) + x + s.charCodeAt(i)) >>> 0; return x; });
    let roomKey = this.categoryFor(locationName);
    const rooms = cat.rooms || {};
    const usable = (k) => rooms[k] && Object.values(rooms[k]).some((g) => g.some((e) => e.enabled));
    if (!roomKey || !usable(roomKey)) roomKey = (cat.fallbackOrder || []).find(usable) || Object.keys(rooms)[0];
    const groups = rooms[roomKey];
    const mix = cat.placementMix || { background: [1, 2], large: [2, 4], medium: [3, 8], small: [3, 8], total: [8, 20] };
    const picked = [];
    for (const size of ["background", "large", "medium", "small"]) {
      const pool = (groups[size] || []).filter((e) => e.enabled);
      if (!pool.length) continue;
      const [lo, hi] = mix[size];
      const want = Math.min(pool.length, lo + (h(`${seedStr}:${roomKey}:${size}:n`) % (hi - lo + 1)));
      // Weighted, deterministic, no-repeat draw.
      const bag = [];
      pool.forEach((e, i) => { for (let w = 0; w < (e.weight || 1); w++) bag.push(i); });
      const taken = new Set();
      for (let k = 0; k < want && taken.size < pool.length; k++) {
        let idx = bag[h(`${seedStr}:${roomKey}:${size}:${k}`) % bag.length], tries = 0;
        while (taken.has(idx) && tries++ < pool.length) idx = (idx + 1) % pool.length;
        if (taken.has(idx)) break;
        taken.add(idx);
        picked.push({ ...pool[idx], size, path: `assets/habbo/furni/${pool[idx].file}` });
      }
    }
    const [, tMax] = mix.total;
    return { room: roomKey, items: picked.slice(0, tMax) };
  }
};
""")
    print(f"runtime: window.HabboRoomCatalogue + window.HabboRooms.pick -> {os.path.relpath(RUNTIME_JS, ROOT)}")


if __name__ == "__main__":
    main()
