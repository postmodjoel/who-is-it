#!/usr/bin/env python3
"""Download and categorise Habbo furni icons for Habbo mode rooms.

Outputs:
  assets/habbo/furni/*.png
  assets/habbo/furni-manifest.json
  assets/habbo/furni-room-manifest.json
  assets/habbo/SOURCES.md
  habbo-assets.js

Usage:
  python3 tools/scrape-habbo-furni.py --start-page 1 --end-page 80
  python3 tools/scrape-habbo-furni.py --max-downloads 600

The runtime JS exposes:
  window.HabboFurniProps
  window.HabboRoomFurniSets
  window.HabboFurni.pickForLocation(location, count, seed)
"""
from __future__ import annotations

import argparse
import concurrent.futures
import hashlib
import json
import os
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parents[1]
OUT_DIR = ROOT / "assets" / "habbo" / "furni"
MANIFEST = ROOT / "assets" / "habbo" / "furni-manifest.json"
ROOM_MANIFEST = ROOT / "assets" / "habbo" / "furni-room-manifest.json"
SOURCES = ROOT / "assets" / "habbo" / "SOURCES.md"
RUNTIME_JS = ROOT / "habbo-assets.js"
RULES_PATH = ROOT / "tools" / "habbo-room-rules.json"

URL_RE = re.compile(r"https://www\.habboassets\.com/assets/furniture/[^\"'\s<>]*?_icon\.png")
UA = {"User-Agent": "Mozilla/5.0 (who-is-it habbo furni fetcher; contact: local prototype)"}

# Deliberately broad but conservative. These create search/display tags from filenames.
TAG_RULES: dict[str, tuple[str, ...]] = {
    "chair": ("chair", "stool", "seat", "bench", "throne", "armchair"),
    "sofa": ("sofa", "couch", "loveseat"),
    "table": ("table", "desk", "counter", "bardesk", "bar_", "plinth", "podium"),
    "bed": ("bed", "mattress", "sleepingbag", "hammock"),
    "plant": ("plant", "tree", "flower", "bush", "cactus", "vase", "pot", "fern", "bonsai"),
    "garden": ("garden", "grass", "hedge", "fountain", "pond", "waterfall", "lawn", "moss", "stone", "path"),
    "lamp": ("lamp", "light", "lantern", "candle", "torch", "chandelier", "neon"),
    "rug": ("rug", "carpet", "mat_", "floor"),
    "food": ("food", "pizza", "cake", "drink", "coffee", "burger", "icecream", "snack", "mug", "tea", "barrel", "fridge", "minibar"),
    "drink": ("drink", "coffee", "mug", "tea", "soda", "juice", "cocktail"),
    "coffee": ("coffee", "cafe", "mug"),
    "bar": ("bar", "bardesk", "pub", "minibar", "counter"),
    "night": ("disco", "dj", "club", "speaker", "jukebox", "karaoke", "neon", "stage"),
    "music": ("piano", "speaker", "jukebox", "dj", "music", "karaoke"),
    "tv": ("tv", "television", "screen", "monitor", "arcade"),
    "book": ("book", "bookcase", "library", "shelf", "scroll"),
    "shelf": ("shelf", "bookcase", "cabinet", "wardrobe", "dresser", "drawer"),
    "bath": ("bath", "tub", "spa", "jacuzzi"),
    "toilet": ("toilet", "wc"),
    "sink": ("sink", "basin"),
    "shower": ("shower",),
    "mirror": ("mirror",),
    "hospital": ("hospital", "clinic", "medical", "doctor", "dent", "surgery", "xray"),
    "lab": ("lab", "science", "chemical", "testtube", "beaker", "xray"),
    "street": ("street", "road", "sign", "lampost", "lamppost", "traffic", "bus", "taxi", "car"),
    "shop": ("shop", "store", "market", "till", "cash", "display", "rack"),
    "jail": ("jail", "prison", "cell", "bars", "police"),
    "metal": ("metal", "steel", "bars", "gate"),
    "modern": ("mode_", "modern", "nordic", "lodge", "studio", "minimal", "glass"),
    "rare": ("rare", "gold", "diamond", "ltd", "trophy", "throne", "orb", "statue"),
    "water": ("water", "pool", "pond", "fountain", "float", "beach", "sea", "ocean"),
    "beach": ("beach", "pool", "float", "lifeguard", "summer", "island"),
    "misc": ("duck", "dragon", "teleport", "box", "crate", "gift", "fireplace", "clock", "poster", "painting", "window"),
}

WALL_WORDS = (
    "painting", "poster", "wall_", "_wall", "window", "mirror", "clock", "shelf",
    "curtain", "banner", "neon_sign", "picture", "sign", "sticker", "frame",
)

# These are usually wearables, badges, effects, catalogue nonsense, or not usable room decor.
EXCLUDE_WORDS = (
    "clothing", "wearable", "_shirt", "_hat", "_hair", "_shoes", "_jacket", "_trousers",
    "_dress", "_skirt", "_acc_", "nft", "badge", "effect_", "_fx_", "horse_dye",
    "loyalty", "_suit", "_wig", "handitem", "bot_", "pet_", "monsterplant_seed",
)


def fetch(url: str, binary: bool = False, retries: int = 2) -> bytes | str:
    last: Exception | None = None
    for attempt in range(retries + 1):
        try:
            req = urllib.request.Request(url, headers=UA)
            with urllib.request.urlopen(req, timeout=30) as r:
                data = r.read()
            return data if binary else data.decode("utf-8", "replace")
        except Exception as exc:  # noqa: BLE001
            last = exc
            if attempt < retries:
                time.sleep(0.8 * (attempt + 1))
    raise last or RuntimeError(f"Failed fetching {url}")


def collect(start_page: int, end_page: int, stop_after_empty: int) -> list[dict[str, Any]]:
    seen: dict[str, dict[str, Any]] = {}
    empty_streak = 0
    for page in range(start_page, end_page + 1):
        url = f"https://www.habboassets.com/images/furni-icons?page={page}"
        try:
            html = fetch(url)
        except Exception as exc:  # noqa: BLE001
            print(f"page {page}: FAILED ({exc})", file=sys.stderr)
            empty_streak += 1
            if empty_streak >= stop_after_empty:
                break
            continue
        found = 0
        for src in URL_RE.findall(str(html)):
            filename = src.rsplit("/", 1)[-1]
            if filename not in seen:
                seen[filename] = {"filename": filename, "sourceUrl": src, "sourcePage": page}
                found += 1
        print(f"page {page}: {found} new icons")
        empty_streak = empty_streak + 1 if found == 0 else 0
        if empty_streak >= stop_after_empty:
            print(f"Stopping after {empty_streak} empty/failed pages.")
            break
    return list(seen.values())


def safe_id(filename: str) -> str:
    return filename.removesuffix("_icon.png")


def classify(filename: str) -> dict[str, Any] | None:
    base = safe_id(filename).lower()
    if any(word in base for word in EXCLUDE_WORDS):
        return None

    tags: list[str] = []
    for tag, words in TAG_RULES.items():
        if any(word in base for word in words):
            tags.append(tag)

    if not tags:
        return None

    kind = "wall" if any(word in base for word in WALL_WORDS) else "floor"

    # Reduce obvious duplicate-ish low-value tags while preserving order.
    seen: set[str] = set()
    tags = [t for t in tags if not (t in seen or seen.add(t))]
    return {"kind": kind, "tags": tags}


def load_rules() -> dict[str, Any]:
    if RULES_PATH.exists():
        return json.loads(RULES_PATH.read_text())
    return {"default": {"preferTags": ["chair", "table", "plant", "lamp"]}, "locations": {}}


def score_for_location(prop: dict[str, Any], rule: dict[str, Any], default_avoid: set[str]) -> int:
    tags = set(prop.get("tags", []))
    prefer = set(rule.get("preferTags", []))
    avoid = set(rule.get("avoidTags", [])) | default_avoid
    score = len(tags & prefer) * 10
    score -= len(tags & avoid) * 6
    if prop.get("kind") == "wall" and ({"poster", "painting", "mirror", "clock", "shelf"} & prefer):
        score += 4
    if "rare" in tags:
        score -= 2  # keep some rares, but do not flood normal rooms with them
    return score


def build_room_sets(curated: list[dict[str, Any]], rules: dict[str, Any], per_room_limit: int) -> dict[str, list[str]]:
    default_avoid = set(rules.get("default", {}).get("avoidTags", []))
    out: dict[str, list[str]] = {}
    for room_slug, rule in rules.get("locations", {}).items():
        ranked = []
        for prop in curated:
            score = score_for_location(prop, rule, default_avoid)
            if score > 0:
                # stable tie-breaker by id so generated JS does not churn randomly
                ranked.append((score, prop["id"], prop))
        ranked.sort(key=lambda x: (-x[0], x[1]))
        out[room_slug] = [p["id"] for _, _, p in ranked[:per_room_limit]]
    return out


def download(entry: dict[str, Any], force: bool = False) -> str:
    dest = OUT_DIR / entry["filename"]
    if dest.exists() and dest.stat().st_size > 0 and not force:
        return "skip"
    try:
        data = fetch(entry["sourceUrl"], binary=True)
        tmp = dest.with_suffix(dest.suffix + ".tmp")
        tmp.write_bytes(data if isinstance(data, bytes) else data.encode())
        tmp.replace(dest)
        return "ok"
    except Exception as exc:  # noqa: BLE001
        return f"fail: {exc}"


def write_runtime_js(curated: list[dict[str, Any]], room_sets: dict[str, list[str]], rules: dict[str, Any]) -> None:
    runtime = {
        "props": curated,
        "roomSets": room_sets,
        "rules": rules,
    }
    js = """// GENERATED by tools/scrape-habbo-furni.py — local Habbo furni props for Habbo mode.\n// No runtime network calls. Icons live in assets/habbo/furni/.\n(function(){\n  const data = __DATA__;\n  window.HabboFurniProps = data.props;\n  window.HabboRoomFurniSets = data.roomSets;\n  const byId = Object.fromEntries(data.props.map(p => [p.id, p]));\n  function hash(s){ let h=5381; s=String(s||''); for(let i=0;i<s.length;i++) h=((h<<5)+h+s.charCodeAt(i))>>>0; return h>>>0; }\n  function textForLocation(location){\n    if (!location) return '';\n    if (typeof location === 'string') return location.toLowerCase();\n    return [location.slug, location.name, location.prompt, location.description, location.stamp].filter(Boolean).join(' ').toLowerCase();\n  }\n  function matchingRoomKeys(location){\n    const text = textForLocation(location);\n    const locs = (data.rules && data.rules.locations) || {};\n    const keys = [];\n    for (const [key, rule] of Object.entries(locs)) {\n      const words = rule.match || [key];\n      if (words.some(w => text.includes(String(w).toLowerCase()))) keys.push(key);\n    }\n    return keys.length ? keys : ['default'];\n  }\n  function stablePick(list, count, seed){\n    const arr = list.slice();\n    arr.sort((a,b) => hash(seed + ':' + a.id) - hash(seed + ':' + b.id));\n    return arr.slice(0, Math.max(0, count || 12));\n  }\n  function propsForKeys(keys){\n    const seen = new Set();\n    const out = [];\n    for (const key of keys) {\n      const ids = data.roomSets[key] || [];\n      for (const id of ids) if (!seen.has(id) && byId[id]) { seen.add(id); out.push(byId[id]); }\n    }\n    if (!out.length) {\n      const defaults = new Set((data.roomSets.default || []));\n      return data.props.filter(p => defaults.has(p.id) || ['chair','table','plant','lamp','rug'].some(t => (p.tags||[]).includes(t)));\n    }\n    return out;\n  }\n  window.HabboFurni = {\n    byId,\n    matchingRoomKeys,\n    forLocation(location){ return propsForKeys(matchingRoomKeys(location)); },\n    pickForLocation(location, count, seed){ return stablePick(propsForKeys(matchingRoomKeys(location)), count || 12, seed || textForLocation(location)); }\n  };\n})();\n"""
    payload = json.dumps(runtime, separators=(",", ":"))
    RUNTIME_JS.write_text(js.replace("__DATA__", payload))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--start-page", type=int, default=1)
    parser.add_argument("--end-page", type=int, default=80)
    parser.add_argument("--stop-after-empty", type=int, default=5)
    parser.add_argument("--max-downloads", type=int, default=0, help="0 = no cap")
    parser.add_argument("--concurrency", type=int, default=8)
    parser.add_argument("--force", action="store_true")
    parser.add_argument("--per-room-limit", type=int, default=80)
    args = parser.parse_args()

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    (ROOT / "assets" / "habbo").mkdir(parents=True, exist_ok=True)

    print("Collecting furni icon URLs…")
    entries = collect(args.start_page, args.end_page, args.stop_after_empty)
    entries.sort(key=lambda e: e["filename"])
    if args.max_downloads and args.max_downloads > 0:
        entries = entries[: args.max_downloads]
    print(f"{len(entries)} unique icons selected; downloading…")

    counts = {"ok": 0, "skip": 0, "fail": 0}
    with concurrent.futures.ThreadPoolExecutor(max_workers=max(1, args.concurrency)) as ex:
        futs = {ex.submit(download, e, args.force): e for e in entries}
        for fut in concurrent.futures.as_completed(futs):
            res = fut.result()
            key = "ok" if res == "ok" else "skip" if res == "skip" else "fail"
            counts[key] += 1
            if key == "fail":
                print(f"{futs[fut]['filename']}: {res}", file=sys.stderr)
    print(f"downloaded {counts['ok']}, skipped {counts['skip']}, failed {counts['fail']}")

    manifest = []
    curated = []
    for e in entries:
        dest = OUT_DIR / e["filename"]
        if not dest.exists() or dest.stat().st_size <= 0:
            continue
        item = {
            "id": safe_id(e["filename"]),
            "slug": safe_id(e["filename"]),
            "filename": e["filename"],
            "path": f"assets/habbo/furni/{e['filename']}",
            "sourcePage": e["sourcePage"],
            "sourceUrl": e["sourceUrl"],
            "sha1": hashlib.sha1(dest.read_bytes()).hexdigest()[:12],
        }
        manifest.append(item)
        c = classify(e["filename"])
        if c:
            curated.append({"id": item["id"], "path": item["path"], "kind": c["kind"], "tags": c["tags"]})

    MANIFEST.write_text(json.dumps(manifest, indent=2))
    rules = load_rules()
    room_sets = build_room_sets(curated, rules, args.per_room_limit)
    default_tags = set(rules.get("default", {}).get("preferTags", []))
    room_sets["default"] = [p["id"] for p in curated if default_tags & set(p.get("tags", []))][: args.per_room_limit]
    ROOM_MANIFEST.write_text(json.dumps({"props": curated, "roomSets": room_sets}, indent=2))
    write_runtime_js(curated, room_sets, rules)

    SOURCES.write_text(
        "# Habbo furni icon sources\n\n"
        f"Icons scraped from https://www.habboassets.com/images/furni-icons pages {args.start_page}-{args.end_page}.\n"
        "Original artwork © Sulake Oy. Use as local prototype/fan-game assets only; do not redistribute as an asset pack.\n\n"
        "Generated by tools/scrape-habbo-furni.py.\n"
    )

    tag_counts: dict[str, int] = {}
    for p in curated:
        for tag in p["tags"]:
            tag_counts[tag] = tag_counts.get(tag, 0) + 1
    print(f"manifest: {len(manifest)} downloaded icons")
    print(f"curated: {len(curated)} room props")
    print("top tags:", sorted(tag_counts.items(), key=lambda x: (-x[1], x[0]))[:20])
    print(f"runtime: {RUNTIME_JS}")


if __name__ == "__main__":
    main()
