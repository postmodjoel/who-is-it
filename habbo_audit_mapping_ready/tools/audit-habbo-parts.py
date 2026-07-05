#!/usr/bin/env python3
"""Generate simple contact-sheet HTML pages for choosing Habbo part IDs.

Run from project root:
  python3 tools/audit-habbo-parts.py

Then open:
  assets/habbo/audit/index.html

Use the visible tokens, e.g. hr-828 or ch-255, to fill tools/habbo-trait-map.json.
"""
from __future__ import annotations

import os
import re
import urllib.parse
import urllib.request

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets", "habbo", "audit")
FIGDATA_URL = "https://www.habbo.com/gamedata/figuredata/1"
IMG_URL = "https://www.habbo.com/habbo-imaging/avatarimage"
UA = {"User-Agent": "Mozilla/5.0 (who-is-it habbo part auditor)"}
BASE = {
    "M": "hd-180-1.ch-255-92.lg-280-82.sh-290-80",
    "F": "hd-600-1.ch-665-92.lg-710-82.sh-730-80",
}
PART_TYPES = ["hr", "ch", "lg", "sh", "ha", "ea", "fa"]


def fetch(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=45) as r:
        return r.read().decode("utf-8", "replace")


def parse(xml: str):
    settypes = {}
    for sm in re.finditer(r'<settype type="(\w+)" paletteid="(\d+)"[^>]*>(.*?)</settype>', xml, re.S):
        stype, pid, body = sm.group(1), sm.group(2), sm.group(3)
        if stype not in PART_TYPES:
            continue
        rows = []
        for setm in re.finditer(r'<set id="(\d+)" gender="([MFU])" club="0"[^>]*selectable="1"', body):
            rows.append((setm.group(1), setm.group(2)))
        settypes[stype] = rows
    return settypes


def figure_for(stype: str, sid: str, gender: str) -> str:
    color = "1"
    if stype == "hr": color = "45"
    if stype in ("ch", "lg", "sh", "ha"): color = "92"
    if stype in ("ea", "fa"): color = "80"
    part = f"{stype}-{sid}-{color}"
    return f"{BASE[gender]}.{part}"


def img_url(fig: str, headonly=False) -> str:
    q = {
        "figure": fig,
        "direction": "4",
        "head_direction": "4",
        "size": "m",
        "img_format": "png",
    }
    if headonly:
        q["headonly"] = "1"
    return IMG_URL + "?" + urllib.parse.urlencode(q)


def write_page(stype: str, rows):
    path = os.path.join(OUT, f"{stype}.html")
    cards = []
    for sid, gender in rows:
        genders = ["M", "F"] if gender == "U" else [gender]
        for g in genders:
            fig = figure_for(stype, sid, g)
            cards.append(f"""<figure><img loading=lazy src="{img_url(fig, headonly=stype in ['hr','ha','ea','fa'])}"><figcaption>{stype}-{sid}<br>{gender}</figcaption></figure>""")
    with open(path, "w", encoding="utf-8") as f:
        f.write(f"""<!doctype html><meta charset=utf-8><title>{stype} audit</title>
<style>body{{font:14px system-ui;margin:20px;background:#f6f6f6}}.grid{{display:grid;grid-template-columns:repeat(auto-fill,minmax(92px,1fr));gap:12px}}figure{{margin:0;background:white;border:1px solid #ddd;border-radius:8px;padding:8px;text-align:center}}img{{image-rendering:pixelated;max-width:64px;min-height:64px}}figcaption{{font-family:ui-monospace,monospace;font-size:12px}}</style>
<h1>{stype}</h1><p>Copy tokens into <code>tools/habbo-trait-map.json</code>.</p><div class=grid>{''.join(cards)}</div>""")


def main():
    os.makedirs(OUT, exist_ok=True)
    rows = parse(fetch(FIGDATA_URL))
    links = []
    for stype in PART_TYPES:
        write_page(stype, rows.get(stype, []))
        links.append(f"<li><a href='{stype}.html'>{stype}</a> — {len(rows.get(stype, []))} selectable parts</li>")
    with open(os.path.join(OUT, "index.html"), "w", encoding="utf-8") as f:
        f.write("<!doctype html><meta charset=utf-8><title>Habbo part audit</title><h1>Habbo part audit</h1><ul>" + "".join(links) + "</ul>")
    print(os.path.join(OUT, "index.html"))


if __name__ == "__main__":
    main()
