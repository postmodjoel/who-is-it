#!/usr/bin/env python3
"""Stage the d0/d3 Habbo avatar review plan.

Reads the existing working data (pool traits, character map plan, avatar manifest + debug
manifest) and generates/updates assets/habbo/avatar-review-plan.json.

Rules:
- Only d0 and d3 are staged for review. No other directions, no walk frames, are staged
  (existing files on disk are noted but never deleted).
- Re-running is safe: existing per-character status / approved / comparisonNotes are PRESERVED;
  only the mechanical fields (figure, downloaded paths, debug info) are refreshed.

Usage:  python3 tools/stage-habbo-avatar-review.py
"""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
PLAN_OUT = os.path.join(ROOT, "assets", "habbo", "avatar-review-plan.json")
AVATAR_DIR = os.path.join(ROOT, "assets", "habbo", "avatars")


def load(p, default):
    try:
        with open(p) as f:
            return json.load(f)
    except Exception:
        return default


def main():
    pool = load(os.path.join(HERE, "pool-traits.json"), [])
    debug = {d["id"]: d for d in load(os.path.join(ROOT, "assets", "habbo", "avatar-manifest.debug.json"), [])}
    mapplan = {p["id"]: p for p in load(os.path.join(HERE, "habbo-character-map-plan.json"), [])}
    existing = load(PLAN_OUT, {}).get("characters", {})

    characters = {}
    for ch in pool:
        cid = ch["id"]
        dbg = debug.get(cid, {})
        prev = existing.get(cid, {})
        downloaded = {}
        for d in ("d0", "d3"):
            rel = f"assets/habbo/avatars/{cid}_{d}.png"
            if os.path.exists(os.path.join(ROOT, rel)):
                downloaded[d] = rel
        status = prev.get("status") or ("needs_review" if len(downloaded) == 2 else "needs_refetch")
        characters[cid] = {
            "sourceCharacterId": cid,
            "status": status,
            "approved": bool(prev.get("approved", False)),
            "sourceTraits": {
                "skinTone": ch.get("skinHex", ""),
                "hair": ch.get("hair", ""),
                "hairColor": ch.get("hairHex", ""),
                # These live inside the face generator's full trait set, not the reduced pool
                # dump - the review page shows the REAL rendered portrait instead, which is the
                # actual source of truth for face shape/eyes/nose/mouth.
                "eyeColor": "",
                "faceShape": "",
                "nose": "",
                "mouth": "",
                "facialHair": "beard" if ch.get("beard") else "",
                "accessories": ch.get("accessory", ""),
                "top": f"{ch.get('clothing', '')} {ch.get('shirt', '')}".strip(),
                "notes": prev.get("sourceTraits", {}).get("notes", "")
            },
            "habboMapping": {
                "figure": prev.get("habboMapping", {}).get("figure") or dbg.get("figure", ""),
                "gender": dbg.get("gender", "M" if ch.get("pronouns") == "he" else "F" if ch.get("pronouns") == "she" else "U"),
                "directionsToReview": ["d0", "d3"],
                "downloaded": downloaded,
                "mappedTokens": mapplan.get(cid, {}).get("mappedTokens", {}),
                "debug": {
                    "matched": dbg.get("matched", []),
                    "missed": dbg.get("missed", []),
                    "fallbacks": dbg.get("fallbacks", {}),
                    "score": dbg.get("score")
                }
            },
            "comparisonNotes": prev.get("comparisonNotes", []),
            "lastFailure": prev.get("lastFailure")
        }

    out = {
        "$schema": "who-is-it-habbo-avatar-review-plan-v1",
        "stage": "d0-d3-review",
        "bulkDownloadAllowed": all(c["approved"] for c in characters.values()) and bool(characters),
        "characters": characters
    }
    os.makedirs(os.path.dirname(PLAN_OUT), exist_ok=True)
    with open(PLAN_OUT, "w") as f:
        json.dump(out, f, indent=1)
    counts = {}
    for c in characters.values():
        counts[c["status"]] = counts.get(c["status"], 0) + 1
    print(f"staged {len(characters)} characters -> {os.path.relpath(PLAN_OUT, ROOT)}")
    print("status:", counts, "| approved:", sum(1 for c in characters.values() if c["approved"]))


if __name__ == "__main__":
    main()
