# Putting WHO? IS IT? online

The whole game runs as **one Python process** (`relay.py`) that serves the static game *and* the
room-sync WebSocket on a single port. No Node, no build step, no database. Deploy it anywhere that
runs a Dockerfile, share the URL, done — online play auto-connects to the same host.

## Run it locally (one command)

```bash
python3 relay.py            # -> http://localhost:8765
```

Two browser tabs on the same machine already sync (they use BroadcastChannel). To test the real
WebSocket path locally, add `?relay=ws://localhost:8765` to the URL.

## Deploy for real (pick one — all have a free tier)

You need the code on GitHub first:

```bash
gh repo create who-is-it --public --source=. --push     # or make a repo in the GitHub UI and push
```

### Render.com  (easiest — no CLI)
1. Push to GitHub (above).
2. Render dashboard → **New +** → **Blueprint** → pick this repo. It reads `render.yaml` and builds
   the Dockerfile automatically.
3. You get a URL like `https://who-is-it.onrender.com`. Share it. Done.
   *(Free tier sleeps after ~15 min idle; first visit then takes ~30 s to wake.)*

### Fly.io  (fast, stays snappy)
```bash
brew install flyctl          # if you don't have it
fly launch --now             # reads fly.toml + Dockerfile, deploys
```
You get `https://who-is-it.fly.dev`.

### Railway
New Project → Deploy from GitHub repo → it detects the Dockerfile. Set no env vars ($PORT is
provided automatically).

## Playing online once it's deployed

1. Both players open the deployed URL.
2. One taps **ONLINE GAME** and reads out the room number (e.g. `#4821`).
3. The other types that number into **JOIN**.
That's it — crossings, babies, tug-o-wars and round changes all sync live.

> Same board on both devices needs the same character pool. Custom characters / saved GAYBYs live in
> each browser, so for a pixel-identical board use fresh profiles or don't rely on saved customs —
> the seed handles everything else.
