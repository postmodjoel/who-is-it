#!/usr/bin/env python3
"""Fetch ONLY the d0 + d3 review renders for one or more characters.

This is the refetch half of the approval loop: fix the figure/trait mapping, pull just the two
review angles, look again. It never downloads other directions or walk frames.

Usage:
  python3 tools/fetch-habbo-avatar-review.py gen-aaron
  python3 tools/fetch-habbo-avatar-review.py gen-aaron --figure "hd-180-14.hr-3322-45.ch-255-68"
  python3 tools/fetch-habbo-avatar-review.py --all-needing-refetch

Behaviour:
- Saves assets/habbo/avatars/<id>_d0.png and <id>_d3.png (overwrites those two files only).
- Updates assets/habbo/avatar-review-plan.json (status -> needs_review on success).
- A failed API call NEVER crashes the run: the character is marked api_failed /
  manual_download_needed and the exact failing URL is appended to
  assets/habbo/avatar-manual-download-needed.json so the images can be fetched by hand.
"""
import argparse
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAN = os.path.join(ROOT, "assets", "habbo", "avatar-review-plan.json")
MANUAL = os.path.join(ROOT, "assets", "habbo", "avatar-manual-download-needed.json")
AVATAR_DIR = os.path.join(ROOT, "assets", "habbo", "avatars")
REVIEW_DIRECTIONS = (0, 3)   # the ONLY angles this script will ever touch

# Reuse the existing compiler's fetch + imaging_url (single source of truth for URL shape).
_spec = importlib.util.spec_from_file_location("habbo_fetch", os.path.join(HERE, "fetch-habbo-avatars.py"))
habbo_fetch = importlib.util.module_from_spec(_spec)
sys.modules["habbo_fetch"] = habbo_fetch   # dataclasses need the module registered before exec
_spec.loader.exec_module(habbo_fetch)


def load(p, default):
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return default


def record_manual(items):
    data = load(MANUAL, {"items": []})
    seen = {(i["characterId"], i["direction"]) for i in data["items"]}
    for it in items:
        key = (it["characterId"], it["direction"])
        if key in seen:
            data["items"] = [x for x in data["items"] if not (x["characterId"] == key[0] and x["direction"] == key[1])]
        data["items"].append(it)
    with open(MANUAL, "w") as f:
        json.dump(data, f, indent=1)


def fetch_character(plan, cid, figure_override=None):
    entry = plan["characters"].get(cid)
    if not entry:
        print(f"  {cid}: not in review plan (run stage-habbo-avatar-review.py first)", file=sys.stderr)
        return False
    figure = figure_override or entry["habboMapping"].get("figure")
    if not figure:
        print(f"  {cid}: no figure string on record", file=sys.stderr)
        return False
    if figure_override:
        entry["habboMapping"]["figure"] = figure_override
    ok, failures = True, []
    for d in REVIEW_DIRECTIONS:
        url = habbo_fetch.imaging_url(figure, direction=d)
        rel = f"assets/habbo/avatars/{cid}_d{d}.png"
        dest = os.path.join(ROOT, rel)
        try:
            data = habbo_fetch.fetch(url, binary=True)
            if not data or len(data) < 200:
                raise RuntimeError(f"suspiciously small response ({len(data) if data else 0} bytes)")
            with open(dest, "wb") as f:
                f.write(data)
            entry["habboMapping"]["downloaded"][f"d{d}"] = rel
            print(f"  {cid} d{d}: ok")
        except Exception as e:
            ok = False
            failures.append({
                "characterId": cid, "direction": f"d{d}", "figure": figure,
                "url": url, "targetFile": rel, "reason": str(e)
            })
            print(f"  {cid} d{d}: FAILED ({e})", file=sys.stderr)
    if ok:
        entry["status"] = "needs_review"
        entry["approved"] = False          # a refetched render always needs another look
        entry["lastFailure"] = None
    else:
        entry["status"] = "manual_download_needed" if any("403" in f["reason"] or "404" in f["reason"] for f in failures) else "api_failed"
        entry["lastFailure"] = failures[-1]["reason"]
        record_manual(failures)
        print(f"  -> recorded in {os.path.relpath(MANUAL, ROOT)}")
    return ok


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ids", nargs="*", help="character ids, e.g. gen-aaron")
    ap.add_argument("--figure", help="override figure string (single character only)")
    ap.add_argument("--all-needing-refetch", action="store_true",
                    help="fetch every character whose status is needs_refetch")
    args = ap.parse_args()

    plan = load(PLAN, None)
    if not plan:
        print("no review plan - run tools/stage-habbo-avatar-review.py first", file=sys.stderr)
        return 1
    ids = list(args.ids)
    if args.all_needing_refetch:
        ids += [cid for cid, c in plan["characters"].items() if c["status"] == "needs_refetch" and cid not in ids]
    if not ids:
        print("nothing to fetch (pass ids or --all-needing-refetch)")
        return 0
    if args.figure and len(ids) != 1:
        print("--figure needs exactly one character id", file=sys.stderr)
        return 1
    os.makedirs(AVATAR_DIR, exist_ok=True)
    good = 0
    for cid in ids:
        if fetch_character(plan, cid, args.figure if len(ids) == 1 else None):
            good += 1
    plan["bulkDownloadAllowed"] = all(c["approved"] for c in plan["characters"].values())
    with open(PLAN, "w") as f:
        json.dump(plan, f, indent=1)
    print(f"done: {good}/{len(ids)} ok - review again in tools/habbo-avatar-review.html")
    return 0


if __name__ == "__main__":
    sys.exit(main())
