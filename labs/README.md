# Developer workbenches

Start the local server with `npm run serve:test`, then open `/labs/` for the searchable visual
directory. Every workbench also has an **All Labs** button that returns there.

Direct links:

- `/labs/face-studio.html` — face generator filters and calibration
- `/labs/clothing-lab.html` — clothing layers, fit, and occlusion
- `/labs/hair-studio.html` — hair combinations, mutations, and catalogue
- `/labs/hair-compositor-lab.html` — hair mass, rim, and overlap diagnostics
- `/labs/genetics-lab.html` — genetics and WHO? DID YOU MAKE? simulations
- `/labs/prompt-studio.html` — prompt review and patch export
- `/labs/compare.html` — generated portraits beside reference art
- `/labs/audit-v2-dashboard.html` — retained product audit dashboard

The page files contain workbench markup. Reusable workbench JavaScript and CSS live in matching
directories under `src/labs/`; shared character rendering stays in `src/characters/`.
