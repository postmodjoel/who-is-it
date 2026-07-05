#!/usr/bin/env python3
"""Compile game character traits into real Habbo avatar PNGs.

This is intentionally a one-off build tool, not runtime logic. It reads the local
character trait pool and a curated trait map, validates mapped Habbo figure parts
against official figuredata, fetches Habbo-imaging PNGs once, and writes a local
manifest for the game.

Usage from project root:
  python3 tools/fetch-habbo-avatars.py

Inputs:
  tools/pool-traits.json
  tools/habbo-trait-map.json

Outputs:
  assets/habbo/avatars/<character>.png
  assets/habbo/avatars/<character>_head.png
  assets/habbo/avatars/<character>_d<direction>.png when --directions is used
  assets/habbo/avatars/<character>_walk_d<direction>.png when --walk is used
  assets/habbo/avatar-manifest.json
  habbo-avatars.js
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.parse
import urllib.request
import colorsys
from dataclasses import dataclass
from typing import Any

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "habbo", "avatars")
POOL = os.path.join(ROOT, "tools", "pool-traits.json")
TRAIT_MAP = os.path.join(ROOT, "tools", "habbo-trait-map.json")
RUNTIME_JS = os.path.join(ROOT, "habbo-avatars.js")
MANIFEST_JSON = os.path.join(ROOT, "assets", "habbo", "avatar-manifest.json")
DEBUG_JSON = os.path.join(ROOT, "assets", "habbo", "avatar-manifest.debug.json")
FIGDATA_URL = "https://www.habbo.com/gamedata/figuredata/1"
IMG_URL = "https://www.habbo.com/habbo-imaging/avatarimage"
UA = {"User-Agent": "Mozilla/5.0 (who-is-it habbo sprite compiler)"}

# Slot meanings used by Habbo figure strings.
HAIR_SLOT = "hr"
HEADWEAR_SLOT = "ha"
EYEWEAR_SLOT = "ea"
FACE_SLOT = "fa"

HEADWEAR_ACCESSORIES = {"cap", "beanie", "beret", "headband", "flowerClip"}
EYEWEAR_ACCESSORIES = {"roundGlasses", "squareGlasses", "glasses"}
FACE_ACCESSORIES = {"hoops", "studs", "dropEarrings", "necklace", "chain", "choker", "scarf", "moustache", "beard"}

# Use plain classic Habbo head sets. Random/selectable hd fallbacks can pick
# novelty heads that read as red/sunburnt or otherwise unlike the source face.
STANDARD_HD_BY_GENDER = {
    "M": ["180"],
    "F": ["600"],
}

# Manual skin buckets for the exact source palette used by pool-traits.json.
# These are deliberately boring classic Habbo skin palette IDs. If a colour ID
# is not in the live hd palette, the compiler falls back to nearest_skin_color().
SKIN_COLOR_OVERRIDES = {
    "#f4c9a6": "2",
    "#efbd94": "2",
    "#c88968": "3",
    "#cf8038": "4",
    "#ad704e": "4",
    "#865335": "5",
    "#5b341f": "6",
}


def fetch(url: str, binary: bool = False) -> bytes | str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def djb2(s: str) -> int:
    h = 5381
    for c in s:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    return h


@dataclass
class SetType:
    palette_id: str
    by_gender: dict[str, list[str]]

    def pool_for(self, gender: str) -> list[str]:
        # Habbo has M/F/U parts. Use exact gender first, then unisex.
        pool = list(self.by_gender.get(gender, [])) + list(self.by_gender.get("U", []))
        if not pool and gender in ("M", "F"):
            # Last-resort cross-gender fallback; better a valid sprite than a broken figure.
            other = "F" if gender == "M" else "M"
            pool = list(self.by_gender.get(other, [])) + list(self.by_gender.get("U", []))
        return pool


def parse_figuredata(xml: str) -> tuple[dict[str, list[tuple[str, tuple[int, int, int]]]], dict[str, SetType]]:
    """Return palettes and selectable non-club set IDs grouped by set type/gender."""
    palettes: dict[str, list[tuple[str, tuple[int, int, int]]]] = {}
    for pm in re.finditer(r'<palette id="(\d+)">(.*?)</palette>', xml, re.S):
        pid, body = pm.group(1), pm.group(2)
        colors: list[tuple[str, tuple[int, int, int]]] = []
        for cm in re.finditer(r'<color id="(\d+)"[^>]*club="0"[^>]*selectable="1"[^>]*>([0-9A-Fa-f]{6})</color>', body):
            hx = cm.group(2)
            colors.append((cm.group(1), (int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16))))
        palettes[pid] = colors

    settypes: dict[str, SetType] = {}
    for sm in re.finditer(r'<settype type="(\w+)" paletteid="(\d+)"[^>]*>(.*?)</settype>', xml, re.S):
        stype, pid, body = sm.group(1), sm.group(2), sm.group(3)
        by_gender = {"M": [], "F": [], "U": []}
        for setm in re.finditer(r'<set id="(\d+)" gender="([MFU])" club="0"[^>]*selectable="1"', body):
            by_gender[setm.group(2)].append(setm.group(1))
        settypes[stype] = SetType(pid, by_gender)
    return palettes, settypes


def hex_to_rgb(hexstr: str) -> tuple[int, int, int]:
    hx = str(hexstr or "").strip().lstrip("#")
    if not re.fullmatch(r"[0-9A-Fa-f]{6}", hx):
        hx = "999999"
    return int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16)


def nearest_color(palette: list[tuple[str, tuple[int, int, int]]], hexstr: str) -> str:
    want = hex_to_rgb(hexstr)
    best, bestd = None, 1e18
    for cid, rgb in palette:
        d = sum((a - b) ** 2 for a, b in zip(rgb, want))
        if d < bestd:
            best, bestd = cid, d
    return best or "1"


def _rgb_to_hsv01(rgb: tuple[int, int, int]) -> tuple[float, float, float]:
    r, g, b = [x / 255 for x in rgb]
    return colorsys.rgb_to_hsv(r, g, b)


def _hue_distance(a: float, b: float) -> float:
    d = abs(a - b)
    return min(d, 1.0 - d)


def _looks_like_bad_sunburn(rgb: tuple[int, int, int]) -> bool:
    # Habbo's hd palette contains novelty/red complexions that are technically
    # valid skin colours but visually read as sunburn/paint. Do not let normal
    # human skinHex values snap to those just because the RGB distance is close.
    r, g, b = rgb
    h, s, v = _rgb_to_hsv01(rgb)
    hue_deg = h * 360
    if s > 0.45 and (hue_deg < 10 or hue_deg > 350) and r > g * 1.22:
        return True
    if s > 0.55 and r > 150 and g < 95 and b < 95:
        return True
    return False


def nearest_skin_color(palette: list[tuple[str, tuple[int, int, int]]], hexstr: str) -> str:
    """Nearest colour for hd only, with novelty red/green/blue tones filtered out.

    The previous compiler used raw RGB nearest-neighbour against the entire hd
    palette. That caused darker POC characters to snap to reddish novelty tones
    in the Habbo skin palette. This version scores by hue/value/saturation and
    filters obvious sunburn/paint colours.
    """
    if not palette:
        return "1"

    want = hex_to_rgb(hexstr)
    wh, ws, wv = _rgb_to_hsv01(want)

    safe: list[tuple[str, tuple[int, int, int]]] = []
    for cid, rgb in palette:
        h, s, v = _rgb_to_hsv01(rgb)
        hue_deg = h * 360
        # Human-ish Habbo skin tones are mostly orange/brown/neutral. Keep
        # neutral pale tones too, but reject strong red/green/blue novelty tones.
        humanish = (10 <= hue_deg <= 55) or s < 0.24
        if humanish and not _looks_like_bad_sunburn(rgb):
            safe.append((cid, rgb))

    candidates = safe or palette
    best, bestd = None, 1e18
    for cid, rgb in candidates:
        h, s, v = _rgb_to_hsv01(rgb)
        # Weighted score: darkness/value matters most, then hue, then saturation.
        # RGB is still included, but no longer dominates enough to choose red face paint.
        d_h = _hue_distance(h, wh)
        d_s = abs(s - ws)
        d_v = abs(v - wv)
        d_rgb = sum(((a - b) / 255) ** 2 for a, b in zip(rgb, want))
        score = (d_v * 4.5) ** 2 + (d_h * 2.8) ** 2 + (d_s * 1.1) ** 2 + d_rgb * 0.35
        # Dark source characters should not jump up into bright/orange-red skin.
        if wv < 0.55 and v > wv + 0.22:
            score += 1.0
        if _looks_like_bad_sunburn(rgb):
            score += 5.0
        if score < bestd:
            best, bestd = cid, score
    return best or "1"


def shade(hexstr: str, k: float) -> str:
    r, g, b = hex_to_rgb(hexstr)
    scale = lambda c: max(0, min(255, round(c * k)))
    return f"#{scale(r):02x}{scale(g):02x}{scale(b):02x}"


def stable_pick(seed: str, values: list[str], salt: str) -> str | None:
    if not values:
        return None
    # For trait-mapped avatars, use the first valid candidate. This makes
    # tools/habbo-trait-map.json an actual visual priority list instead of
    # randomly rotating through sometimes-hideous-but-valid Habbo parts.
    return values[0]


def token_to_type_id(token: str, implied_type: str | None = None) -> tuple[str, str] | None:
    token = str(token).strip()
    if not token:
        return None
    if "-" in token:
        stype, sid = token.split("-", 1)
    else:
        if not implied_type:
            return None
        stype, sid = implied_type, token
    if not re.fullmatch(r"[a-z]{2}", stype) or not re.fullmatch(r"\d+", sid):
        return None
    return stype, sid


def valid_candidate_ids(
    candidates: list[str],
    wanted_type: str,
    gender: str,
    settypes: dict[str, SetType],
) -> list[str]:
    if wanted_type not in settypes:
        return []
    valid_pool = set(settypes[wanted_type].pool_for(gender))
    out: list[str] = []
    for token in candidates or []:
        parsed = token_to_type_id(token, wanted_type)
        if not parsed:
            continue
        stype, sid = parsed
        if stype == wanted_type and sid in valid_pool:
            out.append(sid)
    return out


def trait_candidates(trait_map: dict[str, Any], bucket: str, key: Any) -> list[str]:
    return list((trait_map.get(bucket) or {}).get(str(key), []) or [])


def choose_set(
    *,
    ch: dict[str, Any],
    stype: str,
    gender: str,
    settypes: dict[str, SetType],
    trait_map: dict[str, Any],
    salt: str,
    debug: dict[str, Any],
    bucket: str | None = None,
    key: Any = None,
    allow_fallback: bool = True,
) -> str | None:
    if stype not in settypes:
        debug["missed"].append(f"{stype}:settype_missing")
        return None

    mapped: list[str] = []
    if bucket is not None:
        mapped += trait_candidates(trait_map, bucket, key)
    mapped += trait_candidates(trait_map, "defaults", stype)

    mapped_valid = valid_candidate_ids(mapped, stype, gender, settypes)
    if mapped_valid:
        sid = stable_pick(ch["id"], mapped_valid, salt)
        debug["matched"].append(f"{bucket or 'defaults'}.{key if key is not None else stype}->{stype}-{sid}")
        return sid

    if not allow_fallback:
        if bucket is not None:
            debug["missed"].append(f"{bucket}.{key}")
        return None

    pool = settypes[stype].pool_for(gender)
    if not pool:
        debug["missed"].append(f"{stype}:no_valid_pool")
        return None

    sid = stable_pick(ch["id"], pool, salt)
    fallback_label = f"{stype}-{sid}"
    debug["fallbacks"][stype] = fallback_label
    if bucket is not None:
        debug["missed"].append(f"{bucket}.{key}")
    return sid


def choose_standard_hd(gender: str, settypes: dict[str, SetType], debug: dict[str, Any]) -> str | None:
    """Choose a normal Habbo head/body base instead of a random hd part."""
    if "hd" not in settypes:
        debug["missed"].append("hd:settype_missing")
        return None
    pool = set(settypes["hd"].pool_for(gender))
    candidates = STANDARD_HD_BY_GENDER.get(gender, [])
    # Non-binary/generated mixed gender falls back to whichever classic base exists.
    candidates += ["180", "600"]
    for sid in candidates:
        if sid in pool:
            debug["matched"].append(f"defaults.hd->hd-{sid}")
            return sid
    # Last resort only: first live hd set. Do not hash-randomize this slot.
    live = sorted(pool, key=lambda x: int(x))
    if live:
        sid = live[0]
        debug["fallbacks"]["hd"] = f"hd-{sid}"
        return sid
    debug["missed"].append("hd:no_valid_pool")
    return None


def skin_color_id_for(
    palette: list[tuple[str, tuple[int, int, int]]],
    hexstr: str,
) -> str:
    key = str(hexstr or "").strip().lower()
    wanted = SKIN_COLOR_OVERRIDES.get(key)
    if wanted and any(cid == wanted for cid, _rgb in palette):
        return wanted
    return nearest_skin_color(palette, hexstr)


def infer_gender(ch: dict[str, Any]) -> str:
    p = ch.get("pronouns")
    if p == "she":
        return "F"
    if p == "he":
        return "M"
    return "MF"[djb2(ch.get("id", "")) % 2]


def add_part(
    parts: list[str],
    palettes: dict[str, list[tuple[str, tuple[int, int, int]]]],
    settypes: dict[str, SetType],
    stype: str,
    sid: str | None,
    color_hex: str,
):
    if not sid or stype not in settypes:
        return
    pid = settypes[stype].palette_id
    if palettes.get(pid):
        if stype == "hd":
            color = skin_color_id_for(palettes.get(pid, []), color_hex)
        else:
            color = nearest_color(palettes.get(pid, []), color_hex)
    else:
        color = "1"
    parts.append(f"{stype}-{sid}-{color}")


def build_figure(ch: dict[str, Any], palettes, settypes, trait_map) -> tuple[str, dict[str, Any]]:
    gender = infer_gender(ch)
    debug = {
        "id": ch.get("id"),
        "gender": gender,
        "traits": {
            "hair": ch.get("hair"),
            "clothing": ch.get("clothing"),
            "accessory": ch.get("accessory"),
            "beard": bool(ch.get("beard")),
            "skinHex": ch.get("skinHex"),
            "hairHex": ch.get("hairHex"),
            "shirt": ch.get("shirt"),
        },
        "matched": [],
        "missed": [],
        "fallbacks": {},
    }
    parts: list[str] = []

    hd = choose_standard_hd(gender, settypes, debug)
    add_part(parts, palettes, settypes, "hd", hd, ch.get("skinHex", "#c89070"))

    hair = str(ch.get("hair") or "")
    if hair and hair != "bald" and hair != "hijab":
        hr = choose_set(ch=ch, stype=HAIR_SLOT, gender=gender, settypes=settypes, trait_map=trait_map, salt=f"hair:{hair}", debug=debug, bucket="hair", key=hair)
        add_part(parts, palettes, settypes, HAIR_SLOT, hr, ch.get("hairHex", "#3a2418"))

    clothing = str(ch.get("clothing") or "tee")
    ch_sid = choose_set(ch=ch, stype="ch", gender=gender, settypes=settypes, trait_map=trait_map, salt=f"clothing:{clothing}", debug=debug, bucket="clothing", key=clothing)
    # For the source trait `bare`, do not use the character shirt colour.
    # Habbo imaging needs a top slot for reliable rendering, so use a basic
    # top tinted to skin instead of making Aaron wear a blue shirt/hoodie.
    shirt_color = ch.get("skinHex", "#c89070") if clothing == "bare" else ch.get("shirt", "#3a86ff")
    add_part(parts, palettes, settypes, "ch", ch_sid, shirt_color)

    lg_sid = choose_set(ch=ch, stype="lg", gender=gender, settypes=settypes, trait_map=trait_map, salt="lg", debug=debug)
    add_part(parts, palettes, settypes, "lg", lg_sid, shade(ch.get("shirt", "#3a86ff"), 0.55))

    sh_sid = choose_set(ch=ch, stype="sh", gender=gender, settypes=settypes, trait_map=trait_map, salt="sh", debug=debug)
    add_part(parts, palettes, settypes, "sh", sh_sid, "#2a2a30")

    acc = str(ch.get("accessory") or "none")
    if hair == "hijab":
        ha = choose_set(ch=ch, stype=HEADWEAR_SLOT, gender=gender, settypes=settypes, trait_map=trait_map, salt="hair:hijab", debug=debug, bucket="hair", key="hijab", allow_fallback=False)
        add_part(parts, palettes, settypes, HEADWEAR_SLOT, ha, ch.get("shirt", "#3a86ff"))
    elif acc in HEADWEAR_ACCESSORIES:
        ha = choose_set(ch=ch, stype=HEADWEAR_SLOT, gender=gender, settypes=settypes, trait_map=trait_map, salt=f"accessory:{acc}", debug=debug, bucket="accessory", key=acc, allow_fallback=False)
        add_part(parts, palettes, settypes, HEADWEAR_SLOT, ha, ch.get("shirt", "#3a86ff"))

    if acc in EYEWEAR_ACCESSORIES:
        ea = choose_set(ch=ch, stype=EYEWEAR_SLOT, gender=gender, settypes=settypes, trait_map=trait_map, salt=f"accessory:{acc}", debug=debug, bucket="accessory", key=acc, allow_fallback=False)
        add_part(parts, palettes, settypes, EYEWEAR_SLOT, ea, "#17151a")

    # Habbo generally supports one fa slot. In this character set, beard/moustache
    # are much more visually identifying than small neck jewellery, so give facial
    # hair priority when the source trait says the character has a beard.
    face_keys = []
    if ch.get("beard"):
        face_keys.append("beard")
    if acc in FACE_ACCESSORIES and acc not in face_keys:
        face_keys.append(acc)

    for face_key in face_keys[:1]:
        fa = choose_set(ch=ch, stype=FACE_SLOT, gender=gender, settypes=settypes, trait_map=trait_map, salt=f"face:{face_key}", debug=debug, bucket="accessory", key=face_key, allow_fallback=False)
        add_part(parts, palettes, settypes, FACE_SLOT, fa, "#2a211b")

    total = len(debug["matched"]) + len(debug["missed"]) + len(debug["fallbacks"])
    debug["score"] = round(len(debug["matched"]) / total, 3) if total else 1
    return ".".join(parts), debug


def imaging_url(figure: str, headonly: bool = False, direction: int = 4, action: str | None = None) -> str:
    params = {
        "figure": figure,
        "direction": str(direction),
        "head_direction": str(direction),
        "size": "m",
        "img_format": "png",
    }
    if action:
        params["action"] = action
    if headonly:
        params["headonly"] = "1"
    return f"{IMG_URL}?{urllib.parse.urlencode(params)}"


def parse_directions(value: str) -> list[int]:
    value = str(value or "4").strip().lower()
    if value in ("all", "8", "0-7"):
        return list(range(8))
    out: list[int] = []
    for piece in value.split(","):
        piece = piece.strip()
        if not piece:
            continue
        if "-" in piece:
            a, b = piece.split("-", 1)
            out.extend(range(int(a), int(b) + 1))
        else:
            out.append(int(piece))
    clean = []
    for d in out:
        if d < 0 or d > 7:
            raise ValueError(f"direction must be 0..7, got {d}")
        if d not in clean:
            clean.append(d)
    return clean or [4]


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="re-download existing PNG files")
    ap.add_argument("--dry-run", action="store_true", help="build manifest/debug output but do not download images")
    ap.add_argument("--directions", default="4", help="directions to download: 4, 0-7, all, or comma list such as 2,4,6")
    ap.add_argument("--walk", action="store_true", help="also download one Habbo-imaging walking pose per direction using action=wlk")
    args = ap.parse_args()
    directions = parse_directions(args.directions)

    os.makedirs(OUT_DIR, exist_ok=True)
    os.makedirs(os.path.dirname(MANIFEST_JSON), exist_ok=True)

    pool = json.load(open(POOL, encoding="utf-8"))
    trait_map = json.load(open(TRAIT_MAP, encoding="utf-8")) if os.path.exists(TRAIT_MAP) else {}

    print("fetching figuredata…")
    palettes, settypes = parse_figuredata(fetch(FIGDATA_URL))
    print(f"  palettes: {len(palettes)}, settypes: {', '.join(sorted(settypes.keys()))}")

    manifest: dict[str, Any] = {}
    debug_rows: list[dict[str, Any]] = []

    for ch in pool:
        fig, debug = build_figure(ch, palettes, settypes, trait_map)
        debug["figure"] = fig
        body_fn = f"{ch['id']}.png"
        head_fn = f"{ch['id']}_head.png"

        direction_paths: dict[str, str] = {}
        walk_paths: dict[str, str] = {}

        if not args.dry_run:
            jobs: list[tuple[str, bool, int, str | None]] = [(body_fn, False, 4, None), (head_fn, True, 4, None)]
            for d in directions:
                d_fn = f"{ch['id']}_d{d}.png"
                direction_paths[str(d)] = f"assets/habbo/avatars/{d_fn}"
                jobs.append((d_fn, False, d, None))
                if args.walk:
                    w_fn = f"{ch['id']}_walk_d{d}.png"
                    walk_paths[str(d)] = f"assets/habbo/avatars/{w_fn}"
                    jobs.append((w_fn, False, d, "wlk"))

            for fn, headonly, direction, action in jobs:
                dest = os.path.join(OUT_DIR, fn)
                if not args.force and os.path.exists(dest) and os.path.getsize(dest) > 200:
                    continue
                try:
                    data = fetch(imaging_url(fig, headonly=headonly, direction=direction, action=action), binary=True)
                    with open(dest, "wb") as f:
                        f.write(data)
                except Exception as e:
                    print(f"  {ch['id']}: FAILED ({e})", file=sys.stderr)
                    debug["download_error"] = str(e)
                    break

        else:
            for d in directions:
                direction_paths[str(d)] = f"assets/habbo/avatars/{ch['id']}_d{d}.png"
                if args.walk:
                    walk_paths[str(d)] = f"assets/habbo/avatars/{ch['id']}_walk_d{d}.png"

        manifest[ch["id"]] = {
            "body": f"assets/habbo/avatars/{body_fn}",
            "head": f"assets/habbo/avatars/{head_fn}",
            "directions": direction_paths,
            "walk": walk_paths,
            "figure": fig,
            "match": {
                "score": debug["score"],
                "matched": debug["matched"],
                "missed": debug["missed"],
                "fallbacks": debug["fallbacks"],
            },
        }
        debug_rows.append(debug)
        print(f"  {ch['id']}: score={debug['score']} figure={fig}")

    with open(MANIFEST_JSON, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2)
        f.write("\n")
    with open(DEBUG_JSON, "w", encoding="utf-8") as f:
        json.dump(debug_rows, f, indent=2)
        f.write("\n")
    with open(RUNTIME_JS, "w", encoding="utf-8") as f:
        f.write("// GENERATED by tools/fetch-habbo-avatars.py — one-off Habbo-imaging sprites for the\n")
        f.write("// character pool. No runtime API calls. Includes figure strings + match diagnostics.\n")
        f.write("window.HabboAvatarSprites = ")
        json.dump(manifest, f, separators=(",", ":"))
        f.write(";\n")

    print(f"habbo-avatars.js: {len(manifest)} sprites; directions={directions}; walk={args.walk}")
    print(f"debug: {DEBUG_JSON}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
