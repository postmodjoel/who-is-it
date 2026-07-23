# Game review and test plan

## Current baseline

The reorganised paths are healthy at this checkpoint:

- 73/73 JavaScript rules, renderer, simulation, and import tests pass.
- 14/14 browser page checks pass.
- Every public page loads without a missing local resource or runtime error.
- Every HTML link, CSS `url(...)`, relative JavaScript import, and literal asset
  path resolves.
- The lab directory lists every workbench and its links work.
- The lip-line fix, clothing profiles, and imported Face Studio corrections have
  focused regression coverage.

One test needed correcting during the scan. The renderer migrates a legacy beard
from the accessory slot to `beardLength`; the costume-uniqueness test had treated
that visible beard as “no accessory.” The test now compares the rendered costume,
and the complete 73-test set is green.

## What “working” means

A release is ready only when all five gates are green:

1. **Integrity:** pages, imports, assets, fonts, and Docker entry points resolve.
2. **Rules:** scoring, turn legality, generated data, and serialization are
   deterministic.
3. **Journeys:** a real player can start, play, finish, replay, and recover.
4. **Presentation:** supported screen sizes contain every control and preserve the
   intended hierarchy.
5. **Deployment:** the built container serves the same version that passed locally.

## Review sequence

### Gate 1 — fast automated checks on every change

Run:

```sh
npm run test:integrity
npm run test:rules
node --test tests/*.test.mjs
npx playwright test tests/public-pages.spec.js tests/labs-hub.spec.js --project=desktop --workers=1
```

This is the quick answer to “did a move, rename, import, or renderer change break
anything obvious?”

### Gate 2 — critical local-game journeys

Test each main ruleset from a clean browser session:

| Ruleset | Minimum journey |
| --- | --- |
| WHO? IS IT? | Name players → choose mode → assign secrets → ask/answer → eliminate → win → replay → main menu |
| WHO? DO YOU THINK? | Create the ballot → submit every player’s private picks → resolve ties/saves → score → next round → finish |
| WHO? DID YOU MAKE? | Start commission → draft/claim all six parts → assemble → score exact and substituted parts → finish |
| WHO? WERE YOU? | Start the legacy/experimental route → complete one full round → return safely |

For every journey, check:

- minimum and maximum supported player counts;
- back buttons and cancellation at each setup step;
- refresh during setup, mid-round, and on the result screen;
- replay with the same players and start again with new players;
- keyboard, mouse, and touch interaction;
- no duplicate secrets, impossible turns, dead ends, or stale overlays.

Record each run as `PASS`, `FAIL`, or `BLOCKED`, with the URL, ruleset, mode,
player count, browser, and a screenshot for failures.

### Gate 3 — mode matrix

The large mode catalogue should be split into a small smoke pass and a rotating
deep pass:

- **Every release:** open every mode, render a full board, select a card, reveal
  the secret, and return to the menu.
- **Deep rotation:** play one complete match in one third of the modes per review,
  so all modes receive a full journey across three reviews.
- **Always deep-test changed modes:** any mode whose CSS, data, scoring, or renderer
  changed in the release.

The mode-matrix test should assert that each registered mode has a label, valid
configuration, loadable assets, a selectable board, and a safe exit.

### Gate 4 — online and relay resilience

Use two real browser contexts, then repeat once with two physical devices:

1. Host creates a room.
2. Guest joins with the room code.
3. Both see the same ruleset, roster, board, turn, and result.
4. Guest refreshes and rejoins.
5. Host briefly loses connection and recovers.
6. A message is delayed or repeated without duplicating a turn.
7. Finish, replay, and leave the room.

Deep-test secret ballot privacy for Groupthink and atomic simultaneous claims for
WHO? DID YOU MAKE?. Also verify host migration if it remains a supported feature.

### Gate 5 — device and visual containment

Capture the same checkpoints at:

- 1440×900 desktop;
- 1280×800 laptop;
- 768×1024 tablet;
- 390×844 modern phone;
- 360×800 narrow phone;
- phone landscape.

Required checkpoints:

- landing;
- ruleset chooser;
- player setup;
- mode chooser;
- first playable board;
- selected/revealed card;
- round result and final result;
- lab directory;
- top of every lab page.

Fail the gate for horizontal overflow, clipped text or controls, overlapping
interactive targets, unreadably small text, hidden focus, or a modal that cannot
be dismissed.

### Gate 6 — accessibility and resilience

- Complete setup and one round using only the keyboard.
- Confirm visible focus and sensible focus order.
- Check names/labels for icon-only buttons and form controls.
- Check contrast for text, disabled states, selections, and error messages.
- Verify reduced-motion mode.
- Verify useful errors when the relay is unavailable.
- Test with saved data missing, malformed, and from the previous version.

### Gate 7 — deployment proof

On the server:

```sh
cd /opt/who-is-it
docker compose pull
docker compose up -d
docker compose ps
docker compose exec who-is-it ls /app
docker compose exec who-is-it ls /app/labs
```

`docker compose pull latest` is not valid because `latest` is an image tag, not a
Compose service. Pulling and then running `docker compose up -d` is sufficient;
the reorganised directories live inside the image.

Finish with an HTTP smoke check against the real public URL for `/`, `/labs/`, and
one asset from `/src/`. Compare the deployed image digest or release identifier
with the version that passed locally.

## Release checklist

- [ ] All fast automated checks green
- [ ] Four critical local journeys green
- [ ] Mode smoke matrix green
- [ ] Online two-context and two-device journeys green
- [ ] Persistence/rejoin cases green
- [ ] Six viewport checks green
- [ ] Accessibility pass complete
- [ ] Approved visual changes implemented and recaptured
- [ ] Container pulled, restarted, and public smoke checks green
- [ ] Known limitations written down before release

## Recommended ongoing rhythm

- **Every code change:** integrity + focused rules test.
- **Before pushing:** all 73 Node tests + page smoke tests.
- **Before a release:** the complete seven-gate review.
- **After deployment:** public URL smoke plus one real two-device room.
- **After visual approval:** turn accepted screenshots into Playwright visual
  baselines so the accepted layout cannot silently regress.

