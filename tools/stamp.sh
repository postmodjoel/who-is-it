#!/usr/bin/env bash
# PERF-03 — cache-bust stamper.
#
# Manually bumping every `?v=N` in index.html is easy to forget, and it already drifted once (some
# files served stale while others updated). This rewrites the `?v=` on EVERY local css/js asset in
# index.html to the current epoch in one shot, so a single run before deploy busts all caches together.
#
# Usage:  tools/stamp.sh            # stamp index.html in place
#         tools/stamp.sh --check    # print what would change, touch nothing (non-zero if drift found)
#
# Only repository-local assets (href/src="path/foo.css?v=..." / "path/foo.js?v=...") are touched —
# absolute URLs and CDN links are left alone.
#
# DEPLOY NOTE (PERF-01): exclude these from any web deploy — they are dev-only material, not runtime:
#   assets/reference/            (gold-standard art, ~11MB)
#   assets/characters/Archive.zip (~10MB)
#   Example/ habbo_audit_mapping_ready/ tests/ tools/  (already non-runtime)
set -euo pipefail

cd "$(dirname "$0")/.."
FILE="index.html"
STAMP="$(date +%s)"

if [[ ! -f "$FILE" ]]; then
  echo "stamp.sh: $FILE not found (run from the repo root)" >&2
  exit 1
fi

PATTERN='((?:href|src)="[A-Za-z0-9._/-]+\.(?:css|js)\?v=)\d+'

if [[ "${1:-}" == "--check" ]]; then
  # Report the distinct version values currently in use; >1 distinct value == drift.
  vals="$(grep -oE '(href|src)="[A-Za-z0-9._/-]+\.(css|js)\?v=[0-9]+' "$FILE" \
    | grep -oE 'v=[0-9]+' | sort -u)"
  count="$(printf '%s\n' "$vals" | grep -c . || true)"
  echo "distinct ?v= values in $FILE: $count"
  printf '%s\n' "$vals"
  [[ "$count" -le 1 ]]
  exit $?
fi

perl -0pi -e "s/${PATTERN}/\${1}${STAMP}/g" "$FILE"
# MISS2-01: Face Studio shares the generator — stamp it in lockstep so the calibration workbench
# can never silently render a DIFFERENT build of the faces than the live game.
[ -f labs/face-studio.html ] && perl -0pi -e "s/${PATTERN}/\${1}${STAMP}/g" labs/face-studio.html
# Prompt Studio pins game-data.js the same way.
[ -f labs/prompt-studio.html ] && perl -0pi -e "s/${PATTERN}/\${1}${STAMP}/g" labs/prompt-studio.html
# PERF-02: app.js lazy-loads editor.js + vendor-qrcode.js via versioned constants — stamp those too.
perl -0pi -e "s/(EDITOR_SRC = \"src\\/characters\\/editor\\.js\\?v=)\\d+/\\${1}${STAMP}/; s/(QRCODE_SRC = \"src\\/vendor\\/vendor-qrcode\\.js\\?v=)\\d+/\\${1}${STAMP}/" src/core/app.js
echo "Stamped local css/js assets in $FILE + labs/face-studio.html (+ lazy-load constants in src/core/app.js) with ?v=${STAMP}"
