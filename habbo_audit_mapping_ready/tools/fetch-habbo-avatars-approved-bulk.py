#!/usr/bin/env python3
"""FINAL STAGE ONLY: bulk-download the full avatar set for APPROVED characters.

Hard gate: if ANY character in assets/habbo/avatar-review-plan.json is not approved, this
script refuses to run and prints exactly who is still outstanding. Approve everyone through
tools/habbo-avatar-review.html (d0/d3 comparison) first.

When all are approved it downloads, using the APPROVED figure strings only:
  - standing d0-d7
  - walking (action=wlk) d0-d7
  - head
  - default/front body
and updates assets/habbo/avatar-manifest.json.

Usage:  python3 tools/fetch-habbo-avatars-approved-bulk.py [--force]
(Not run automatically by anything. This is a deliberate, manual, final step.)
"""
import argparse
import importlib.util
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAN = os.path.join(ROOT, "assets", "habbo", "avatar-review-plan.json")
MANIFEST = os.path.join(ROOT, "assets", "habbo", "avatar-manifest.json")
AVATAR_DIR = os.path.join(ROOT, "assets", "habbo", "avatars")

_spec = importlib.util.spec_from_file_location("habbo_fetch", os.path.join(HERE, "fetch-habbo-avatars.py"))
habbo_fetch = importlib.util.module_from_spec(_spec)
sys.modules["habbo_fetch"] = habbo_fetch   # dataclasses need the module registered before exec
_spec.loader.exec_module(habbo_fetch)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--force", action="store_true", help="re-download files that already exist")
    args = ap.parse_args()

    try:
        plan = json.load(open(PLAN))
    except Exception:
        print("no review plan - run tools/stage-habbo-avatar-review.py first", file=sys.stderr)
        return 1
    chars = plan.get("characters", {})
    unapproved = [cid for cid, c in chars.items() if not c.get("approved")]
    if unapproved or not chars:
        print("BULK DOWNLOAD BLOCKED - these characters are not approved yet:")
        for cid in unapproved:
            print(f"  - {cid}  (status: {chars[cid].get('status')})")
        print("\nApprove every character via tools/habbo-avatar-review.html, update the plan, retry.")
        return 1

    os.makedirs(AVATAR_DIR, exist_ok=True)
    manifest = {}
    failures = 0
    for cid, c in chars.items():
        figure = c["habboMapping"]["figure"]
        jobs = [(f"{cid}.png", False, 4, None), (f"{cid}_head.png", True, 4, None)]
        for d in range(8):
            jobs.append((f"{cid}_d{d}.png", False, d, None))
            jobs.append((f"{cid}_walk_d{d}.png", False, d, "wlk"))
        entry = {"body": f"assets/habbo/avatars/{cid}.png", "head": f"assets/habbo/avatars/{cid}_head.png",
                 "directions": {}, "walk": {}, "figure": figure}
        for fn, headonly, direction, action in jobs:
            dest = os.path.join(AVATAR_DIR, fn)
            rel = f"assets/habbo/avatars/{fn}"
            if action == "wlk":
                entry["walk"][str(direction)] = rel
            elif fn.endswith(f"_d{direction}.png"):
                entry["directions"][str(direction)] = rel
            if os.path.exists(dest) and os.path.getsize(dest) > 200 and not args.force:
                continue
            url = habbo_fetch.imaging_url(figure, headonly=headonly, direction=direction, action=action)
            try:
                data = habbo_fetch.fetch(url, binary=True)
                if not data or len(data) < 200:
                    raise RuntimeError("suspiciously small response")
                with open(dest, "wb") as f:
                    f.write(data)
            except Exception as e:
                failures += 1
                print(f"  {fn}: FAILED ({e})", file=sys.stderr)
        manifest[cid] = entry
        print(f"  {cid}: complete")
    with open(MANIFEST, "w") as f:
        json.dump(manifest, f, indent=1)
    print(f"bulk done: {len(manifest)} characters, {failures} failed files -> {os.path.relpath(MANIFEST, ROOT)}")
    return 0 if failures == 0 else 2


if __name__ == "__main__":
    sys.exit(main())
