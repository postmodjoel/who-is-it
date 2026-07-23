# Who Is That?

A local absurdist Guess Who-style prototype.

## Run it

Run the repository as a static site:

```sh
npm run serve:test
```

Then visit `http://127.0.0.1:4173`. The deployed version uses `relay.py` to serve the same
files and add WebSocket room sync.

The main browser entry point is `index.html`. Developer workbenches live in `labs/`; see
[`labs/README.md`](labs/README.md) for their URLs.

## Repository map

```text
index.html        Main game entry point and classic-script load order
src/core/         Game flow, shared data, networking, sound, and base styles
src/characters/   Face generation, hair, clothing, and character editing
src/modes/        Mystery modes and self-contained rulesets
src/labs/         JavaScript and CSS used only by developer workbenches
src/vendor/       Vendored browser libraries
labs/             Developer workbench HTML entry points
assets/           Fonts, location art, Habbo sprites, and manifests
tests/            Node rule tests and Playwright browser tests
tools/            Local server, generators, simulations, and maintenance scripts
docs/             Design notes and technical documentation
```

For load order, ownership boundaries, and the quickest path to common changes, read
[`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

The game currently supports:

- Hot-seat Player 1 / Player 2 boards
- 48-character library with 24 dealt by default
- Setup toggles for prompts, mystery effects, locations, roles, and expanded faces
- 30 mystery effects, once per player
- Location theming with a prompt image panel
- Per-character role labels
- Classic or absurd question decks

## Credits

Several hair silhouettes (`src/characters/faces-hair.js`) are derived from
[faces.js](https://github.com/zengm-games/facesjs)
by ZenGM, used under the Apache License 2.0. The original SVG paths were rescaled to fit this
project's head. See that file's header for details.
