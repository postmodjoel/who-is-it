# Habbo audit mapping pass

This package replaces the empty `tools/habbo-trait-map.json` with a populated first-pass mapping based on the audit HTML you generated.

Files:
- `tools/habbo-trait-map.json` — populated trait-to-Habbo token map.
- `tools/habbo-map-preview.html` — visual review page for the chosen tokens. Open it with internet access so Habbo imaging URLs load.
- `tools/habbo-character-map-plan.json` — predicted token choices per character before live figuredata validation.
- `tools/fetch-habbo-avatars.py` — same compiler as previous patch, with face-slot priority adjusted so beard beats tiny neck/jewellery accessories when `beard: true`.

Install:
1. Copy the `tools/` folder contents into the project root.
2. Run:

```bash
python3 tools/fetch-habbo-avatars.py --force
```

Outputs:
- `assets/habbo/avatars/*.png`
- `assets/habbo/avatar-manifest.json`
- `assets/habbo/avatar-manifest.debug.json`
- `habbo-avatars.js`

Review:
- Open `assets/habbo/avatar-manifest.debug.json`.
- Low scores or `fallbacks` mean a mapped token did not validate against live figuredata.
- If a token looks wrong, open `tools/habbo-map-preview.html`, choose a better token from your full audit pages, and move it earlier in `tools/habbo-trait-map.json`.
