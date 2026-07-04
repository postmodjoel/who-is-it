#!/usr/bin/env python3
"""One-off: generate real Habbo avatar sprites for the character pool via habbo-imaging.

Reads tools/pool-traits.json (dumped from the running game: id, pronouns, hexes, hair
silhouette, clothing, accessory), maps each character onto a Habbo figure string using
the OFFICIAL figuredata palettes (nearest-colour match for skin/hair/shirt, deterministic
set picks per character id), downloads body + head PNGs once, and emits habbo-avatars.js
(window.HabboAvatarSprites) for the game to use at runtime with zero API calls.

Usage: python3 tools/fetch-habbo-avatars.py
"""
import json
import os
import re
import sys
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT_DIR = os.path.join(ROOT, "assets", "habbo", "avatars")
POOL = os.path.join(ROOT, "tools", "pool-traits.json")
RUNTIME_JS = os.path.join(ROOT, "habbo-avatars.js")
FIGDATA_URL = "https://www.habbo.com/gamedata/figuredata/1"
IMG_URL = "https://www.habbo.com/habbo-imaging/avatarimage"
UA = {"User-Agent": "Mozilla/5.0 (whoisit fan-game one-off sprite fetch)"}


def fetch(url, binary=False):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=30) as r:
        data = r.read()
    return data if binary else data.decode("utf-8", "replace")


def djb2(s):
    h = 5381
    for c in s:
        h = ((h << 5) + h + ord(c)) & 0xFFFFFFFF
    return h


def parse_figuredata(xml):
    """palettes: {paletteId: [(colorId, (r,g,b))]}; settypes: {type: (paletteId, {gender: [setIds]})}"""
    palettes = {}
    for pm in re.finditer(r'<palette id="(\d+)">(.*?)</palette>', xml, re.S):
        pid, body = pm.group(1), pm.group(2)
        colors = []
        for cm in re.finditer(r'<color id="(\d+)"[^>]*club="0"[^>]*selectable="1"[^>]*>([0-9A-Fa-f]{6})</color>', body):
            hx = cm.group(2)
            colors.append((cm.group(1), (int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16))))
        palettes[pid] = colors
    settypes = {}
    for sm in re.finditer(r'<settype type="(\w+)" paletteid="(\d+)"[^>]*>(.*?)</settype>', xml, re.S):
        stype, pid, body = sm.group(1), sm.group(2), sm.group(3)
        by_gender = {"M": [], "F": [], "U": []}
        for setm in re.finditer(r'<set id="(\d+)" gender="([MFU])" club="0"[^>]*selectable="1"', body):
            by_gender[setm.group(2)].append(setm.group(1))
        settypes[stype] = (pid, by_gender)
    return palettes, settypes


def nearest_color(palette, hexstr):
    hx = hexstr.lstrip("#")
    want = (int(hx[0:2], 16), int(hx[2:4], 16), int(hx[4:6], 16))
    best, bestd = None, 1e18
    for cid, rgb in palette:
        d = sum((a - b) ** 2 for a, b in zip(rgb, want))
        if d < bestd:
            best, bestd = cid, d
    return best or "1"


def sets_for(settypes, stype, gender):
    pid, by_g = settypes[stype]
    pool = by_g.get(gender, []) + by_g.get("U", [])
    return pid, pool


def build_figure(ch, palettes, settypes):
    g = "F" if ch["pronouns"] == "she" else "M" if ch["pronouns"] == "he" else ("MF"[djb2(ch["id"]) % 2])
    parts = []

    def part(stype, colorhex, salt, skip=False):
        if skip or stype not in settypes:
            return
        pid, pool = sets_for(settypes, stype, g)
        if not pool:
            return
        set_id = pool[djb2(f"{ch['id']}:{salt}") % len(pool)]
        color = nearest_color(palettes.get(pid, []), colorhex) if palettes.get(pid) else "1"
        parts.append(f"{stype}-{set_id}-{color}")

    part("hd", ch["skinHex"], "hd")
    part("hr", ch["hairHex"], "hr", skip=(ch["hair"] == "bald"))
    part("ch", ch["shirt"], "ch")
    # Legs in a darkened take on the shirt; shoes dark.
    part("lg", shade(ch["shirt"], 0.55), "lg")
    part("sh", "#2a2a30", "sh")
    acc = ch.get("accessory", "")
    if re.search(r"cap|beanie|beret", acc):
        part("ha", ch["shirt"], "ha")
    if ch["hair"] == "hijab":
        part("ha", ch["shirt"], "hijab")
    if "Glasses" in acc or acc == "glasses":
        part("ea", "#17151a", "ea")
    return ".".join(parts)


def shade(hexstr, k):
    hx = hexstr.lstrip("#")
    r, gg, b = (max(0, min(255, round(int(hx[i:i + 2], 16) * k))) for i in (0, 2, 4))
    return f"#{r:02x}{gg:02x}{b:02x}"


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    pool = json.load(open(POOL))
    print("fetching figuredata…")
    palettes, settypes = parse_figuredata(fetch(FIGDATA_URL))
    print(f"  palettes: {len(palettes)}, settypes: {list(settypes.keys())}")
    manifest = {}
    for ch in pool:
        fig = build_figure(ch, palettes, settypes)
        body_fn = f"{ch['id']}.png"
        head_fn = f"{ch['id']}_head.png"
        for fn, extra in ((body_fn, ""), (head_fn, "&headonly=1")):
            dest = os.path.join(OUT_DIR, fn)
            if os.path.exists(dest) and os.path.getsize(dest) > 200:
                continue
            url = f"{IMG_URL}?figure={fig}&direction=4&head_direction=4&size=m&img_format=png{extra}"
            try:
                data = fetch(url, binary=True)
                with open(dest, "wb") as f:
                    f.write(data)
            except Exception as e:
                print(f"  {ch['id']}: FAILED ({e})", file=sys.stderr)
                break
        else:
            manifest[ch["id"]] = {
                "body": f"assets/habbo/avatars/{body_fn}",
                "head": f"assets/habbo/avatars/{head_fn}",
                "figure": fig,
            }
            print(f"  {ch['id']}: ok ({fig})")
    with open(RUNTIME_JS, "w") as f:
        f.write("// GENERATED by tools/fetch-habbo-avatars.py — one-off Habbo-imaging sprites for the\n"
                "// character pool (see assets/habbo/SOURCES.md). No runtime API calls.\n"
                "window.HabboAvatarSprites = ")
        json.dump({k: {"body": v["body"], "head": v["head"]} for k, v in manifest.items()}, f, separators=(",", ":"))
        f.write(";\n")
    print(f"habbo-avatars.js: {len(manifest)} sprites")


if __name__ == "__main__":
    main()
