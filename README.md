# Who Is That?

A local absurdist Guess Who-style prototype.

Open `index.html` in a browser, or run a tiny static server from this folder:

```sh
python3 -m http.server 5173
```

Then visit `http://localhost:5173`.

For generator iteration without the game UI, open `face-studio.html`, or visit `http://localhost:5173/face-studio.html` when using the static server.

The game currently supports:

- Hot-seat Player 1 / Player 2 boards
- 48-character library with 24 dealt by default
- Setup toggles for prompts, mystery effects, locations, roles, and expanded faces
- 30 mystery effects, once per player
- Location theming with a prompt image panel
- Per-character role labels
- Classic or absurd question decks

## Credits

Several hair silhouettes (`faces-hair.js`) are derived from [faces.js](https://github.com/zengm-games/facesjs)
by ZenGM, used under the Apache License 2.0. The original SVG paths were rescaled to fit this
project's head. See the header of `faces-hair.js` for details.
