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

---

# Saltbox (self-hosted, behind Traefik) → who.onlybbm.com

Saltbox already runs **Traefik** as its reverse proxy on a Docker network called `saltbox`. You just
build this as a container, join that network, and hand Traefik the routing labels. The included
`docker-compose.yml` does all of that. Traefik proxies plain HTTP **and** the WebSocket upgrade over
the same router, so online play works with zero extra config.

### 1. DNS
In Cloudflare (the DNS Saltbox uses) add a record for the subdomain, **Proxied (orange cloud)**:

```
Type: CNAME   Name: who   Target: onlybbm.com     (or your server's A-record host)
```

Cloudflare's proxy supports WebSockets, so leave it orange.

### 2. Get the code on the server
```bash
sudo mkdir -p /opt/who-is-it && cd /opt/who-is-it
# copy this repo here (git clone <your-repo> ., or scp/rsync the folder)
```

### 3. Set your domain
Edit `docker-compose.yml` → replace `who.onlybbm.com` (appears 3×) with your subdomain.

> **Version check:** the labels use `entrypoints: web/websecure` and `certresolver: cfdns`, which
> match current Saltbox. If yours is older it may use `http/https` and a different resolver name —
> the fastest fix is to open an existing Saltbox app's labels and copy the exact
> `entrypoints`, `certresolver`, and middleware names:
> ```bash
> docker inspect $(docker ps --format '{{.Names}}' | grep -m1 -iE 'plex|sonarr|overseerr') \
>   | grep -i 'traefik.http.routers' | sort -u
> ```
> Swap those three values into `docker-compose.yml` and you're done.

### 4. Build + run
```bash
cd /opt/who-is-it
docker compose up -d --build
docker compose logs -f          # should print: "WHO? IS IT? server on http://0.0.0.0:8080"
```

Traefik auto-detects the container on the `saltbox` network and issues the cert. Give it ~30s, then
open **https://who.onlybbm.com**.

### 5. Play
Both players open the URL → one hits **ONLINE GAME → HOST A ROOM** and reads out the number → the
other does **JOIN A ROOM** and types it. The game auto-connects to `wss://who.onlybbm.com/<room>`
through Traefik.

### Updating later
```bash
cd /opt/who-is-it && git pull && docker compose up -d --build
```

### Troubleshooting
- **502 / cert not issued:** wrong `entrypoints`/`certresolver` label — do the version check in step 3.
- **Site loads but online won't connect:** confirm the Cloudflare record is **Proxied** and that you're
  on `https://` (the client only upgrades to `wss://` on a real https host).
- **Container not picked up:** `docker network inspect saltbox` should list `who-is-it`; if not, the
  external network name differs — set it to whatever `docker network ls | grep -i salt` shows.
