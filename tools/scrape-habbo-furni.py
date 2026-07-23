#!/usr/bin/env python3
"""Scrape Habbo furni icons from habboassets.com into assets/habbo/furni/.

(Planned as a Node .mjs, ported to Python: this machine has no Node runtime.)

- Fetches https://www.habboassets.com/images/furni-icons?page=8 .. page=16
- Extracts image URLs matching /assets/furniture/*_icon.png
- Downloads PNGs into assets/habbo/furni/ (skips existing, dedupes by filename,
  concurrency ~6)
- Writes assets/habbo/furni-manifest.json  (id, slug, filename, path, sourcePage, sourceUrl)
- Writes assets/habbo/SOURCES.md
- Generates src/modes/habbo/habbo-assets.js: a curated window.HabboFurniProps list of room-decor
  props (chairs, sofas, tables, plants, lamps, rugs...) classified by filename
  keywords; clothing/wearable-looking items are excluded from room placement.

Usage:  python3 tools/scrape-habbo-furni.py
"""
import concurrent.futures
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "habbo", "furni")
MANIFEST = os.path.join(ROOT, "assets", "habbo", "furni-manifest.json")
SOURCES = os.path.join(ROOT, "assets", "habbo", "SOURCES.md")
RUNTIME_JS = os.path.join(ROOT, "src", "modes", "habbo", "habbo-assets.js")
PAGES = range(8, 17)  # 8..16 inclusive
URL_RE = re.compile(r"https://www\.habboassets\.com/assets/furniture/[^\"'\s]*_icon\.png")
UA = {"User-Agent": "Mozilla/5.0 (whoisit fan-game asset fetch)"}


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def collect():
    seen = {}
    for page in PAGES:
        url = f"https://www.habboassets.com/images/furni-icons?page={page}"
        try:
            html = fetch(url)
        except Exception as e:
            print(f"  page {page}: FAILED ({e})", file=sys.stderr)
            continue
        found = 0
        for m in URL_RE.findall(html):
            fn = m.rsplit("/", 1)[-1]
            if fn not in seen:
                seen[fn] = {"filename": fn, "sourceUrl": m, "sourcePage": page}
                found += 1
        print(f"  page {page}: {found} new icons")
    return list(seen.values())


def download(entry):
    dest = os.path.join(OUT_DIR, entry["filename"])
    if os.path.exists(dest) and os.path.getsize(dest) > 0:
        return "skip"
    try:
        data = fetch(entry["sourceUrl"], binary=True)
        with open(dest, "wb") as f:
            f.write(data)
        return "ok"
    except Exception as e:
        return f"fail: {e}"


# ---- classification for the curated runtime list -------------------------------------
# Wall-mounted decor.
WALL_WORDS = ("painting", "poster", "wall_", "_wall", "window", "mirror", "clock", "shelf",
              "curtain", "banner", "neon_sign", "picture")
# Floor decor by kind (tag -> keywords).
FLOOR_TAGS = {
    "chair": ("chair", "stool", "seat", "throne", "bench"),
    "sofa": ("sofa", "couch", "armchair"),
    "table": ("table", "desk", "bar_", "counter"),
    "plant": ("plant", "tree", "flower", "bush", "cactus", "vase"),
    "lamp": ("lamp", "light", "lantern", "candle", "torch"),
    "rug": ("rug", "carpet", "mat_"),
    "bed": ("bed", "mattress"),
    "rare": ("rare", "gold", "diamond", "ltd", "trophy", "throne"),
    "garden": ("garden", "grass", "hedge", "fountain", "pond"),
    "night": ("disco", "dj", "neon", "club", "speaker"),
    "food": ("food", "pizza", "cake", "drink", "coffee", "burger", "icecream", "snack"),
    "modern": ("mode_", "modern", "nordic", "lodge", "studio"),
    "misc": ("fridge", "tv", "television", "fireplace", "piano", "arcade", "jukebox",
             "bookcase", "cabinet", "dragon", "duck", "teleport", "box"),
}
# Wearables / non-decor: exclude from room placement.
EXCLUDE_WORDS = ("clothing", "_shirt", "_hat", "_hair", "_shoes", "_jacket", "_trousers",
                 "_dress", "_skirt", "_acc_", "nft", "_badge", "effect_", "_fx_", "horse_dye",
                 "loyalty", "_suit", "_wig")


def classify(fn):
    base = fn[:-len("_icon.png")].lower()
    if any(w in base for w in EXCLUDE_WORDS):
        return None
    tags = []
    kind = None
    if any(w in base for w in WALL_WORDS):
        kind = "wall"
    for tag, words in FLOOR_TAGS.items():
        if any(w in base for w in words):
            tags.append(tag)
            if kind is None:
                kind = "floor"
    if kind is None:
        return None  # unclassifiable - leave out of the curated set
    return {"kind": kind, "tags": tags or ["misc"]}


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    print("Collecting icon URLs…")
    entries = collect()
    print(f"{len(entries)} unique icons; downloading…")
    results = {"ok": 0, "skip": 0, "fail": 0}
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as ex:
        for entry, res in zip(entries, ex.map(download, entries)):
            results["ok" if res == "ok" else "skip" if res == "skip" else "fail"] += 1
            if res.startswith("fail"):
                print(f"  {entry['filename']}: {res}", file=sys.stderr)
    print(f"downloaded {results['ok']}, skipped {results['skip']}, failed {results['fail']}")

    manifest = []
    for e in sorted(entries, key=lambda x: x["filename"]):
        if not os.path.exists(os.path.join(OUT_DIR, e["filename"])):
            continue
        slug = e["filename"][:-len("_icon.png")]
        manifest.append({
            "id": slug, "slug": slug, "filename": e["filename"],
            "path": f"assets/habbo/furni/{e['filename']}",
            "sourcePage": e["sourcePage"], "sourceUrl": e["sourceUrl"],
        })
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=1)
    print(f"manifest: {len(manifest)} entries")

    with open(SOURCES, "w") as f:
        f.write("# Habbo furni icon sources\n\n"
                "Icons scraped from https://www.habboassets.com/images/furni-icons "
                f"(pages {PAGES.start}-{PAGES.stop - 1}).\n"
                "Original artwork © Sulake Oy — used here as fan/prototype assets for a "
                "private, non-commercial party game. Not for redistribution.\n\n"
                "Fetched by tools/scrape-habbo-furni.py.\n")

    curated = []
    for m in manifest:
        c = classify(m["filename"])
        if c:
            curated.append({"id": m["id"], "path": m["path"], "kind": c["kind"], "tags": c["tags"]})
    with open(RUNTIME_JS, "w") as f:
        f.write("// GENERATED by tools/scrape-habbo-furni.py — curated room-decor props from the\n"
                "// scraped furni icons (see assets/habbo/SOURCES.md). Only genuine decor is listed;\n"
                "// wearables/effects are excluded. Loaded before modes.js.\n"
                "window.HabboFurniProps = ")
        json.dump(curated, f, separators=(",", ":"))
        f.write(";\n")
    kinds = {}
    for c in curated:
        kinds[c["kind"]] = kinds.get(c["kind"], 0) + 1
    print(f"habbo-assets.js: {len(curated)} curated props {kinds}")


if __name__ == "__main__":
    main()
