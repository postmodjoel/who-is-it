# Putting WHO? IS IT? online

The whole game is **one Python process** (`relay.py`) that serves the static game *and* the room-sync
WebSocket on a single port. No Node, no build step, no database.

---

## ⭐ The clean pipeline (set up once, then never copy files again)

**Code → GitHub → auto-built image → your server pulls it.** After the one-time setup the loop is:
I push a commit → GitHub Actions rebuilds the image → your server auto-updates. You do nothing.

### One-time setup

**1. Make a GitHub repo and push this code.**
On github.com click **New repository**, name it `who-is-it`, create it empty, then locally:
```bash
cd "WHO IS THAT claude"
git branch -M main
git remote add origin https://github.com/<your-username>/who-is-it.git
git push -u origin main
```
The included workflow (`.github/workflows/deploy.yml`) fires on that push and builds the image to
**`ghcr.io/<your-username>/who-is-it:latest`**.

**2. Make the image pullable without a login (once).**
GitHub -> your profile -> **Packages** -> `who-is-it` -> **Package settings** -> **Change visibility ->
Public**. (Or keep it private and run `docker login ghcr.io` once on the server with a read:packages
token -- public is simpler.)

**3. On your Saltbox server, one tiny folder:**
```bash
sudo mkdir -p /opt/who-is-it && cd /opt/who-is-it
curl -O https://raw.githubusercontent.com/<your-username>/who-is-it/main/docker-compose.yml
printf 'WHO_IMAGE=ghcr.io/<your-username>/who-is-it:latest\n' > .env
```
Edit `docker-compose.yml` and set your subdomain (`who.onlybbm.com`, 3x). Then:
```bash
docker compose up -d
```

That is the whole install. See **Saltbox / Traefik** below for DNS + the one label to sanity-check.

### After that -- updates are automatic

The compose file tags the container for **Watchtower**. If you have it (Saltbox: `sb install
watchtower`, or it may already be running), every push I make gets rebuilt by CI and pulled by
Watchtower within minutes. Manual update any time:
```bash
cd /opt/who-is-it && docker compose pull && docker compose up -d
```

So the ongoing loop for *me* is just `git push`, and for *you* it is nothing (or one `pull`).

---

## Saltbox / Traefik specifics (DNS + the labels)

Saltbox runs **Traefik** on a Docker network called `saltbox`. The `docker-compose.yml` joins that
network and hands Traefik the routing labels, so the game gets a subdomain + auto HTTPS, and Traefik
proxies the WebSocket upgrade on the same router (online play needs no extra config).

**DNS (Cloudflare):** add a record for the subdomain, **Proxied (orange cloud)** -- Cloudflare's proxy
supports WebSockets:
```
Type: CNAME   Name: who   Target: onlybbm.com   (or your server's A-record host)
```

**Version check (the one thing to verify):** the labels use `entrypoints: web/websecure` and
`certresolver: cfdns`, matching current Saltbox. If yours is older it may use `http/https` or a
different resolver. Rather than guess, copy the exact values from an app you already run:
```bash
docker inspect $(docker ps --format '{{.Names}}' | grep -m1 -iE 'plex|sonarr|overseerr') \
  | grep -i 'traefik.http.routers' | sort -u
```
Swap those three values (`entrypoints`, `certresolver`, middleware names) into `docker-compose.yml`.

**Verify it came up:**
```bash
docker compose logs -f            # -> "WHO? IS IT? server on http://0.0.0.0:8080"
docker network inspect saltbox | grep who-is-it   # should be listed
```
Give Traefik ~30s for the cert, then open **https://who.onlybbm.com**.

### Play
Both open the URL -> one taps **ONLINE GAME -> HOST A ROOM** and reads out the number -> the other
does **JOIN A ROOM** and types it. The client auto-connects to `wss://who.onlybbm.com/<room>`.

### Troubleshooting
- **502 / no cert:** wrong `entrypoints`/`certresolver` -- do the version check above.
- **Loads but online won't connect:** confirm the Cloudflare record is **Proxied** and you are on
  `https://` (the client only upgrades to `wss://` on a real https host).
- **Container not picked up:** `docker network ls | grep -i salt` -- if the network is not literally
  `saltbox`, set that name in the compose `networks:` block.

---

## Other hosts (no Saltbox)

The same image runs anywhere that takes a Dockerfile -- **Render** (`render.yaml` blueprint),
**Fly.io** (`fly launch --now`), **Railway** (detects the Dockerfile). They inject `$PORT`.

## Run it locally (no Docker)
```bash
python3 relay.py        # http://localhost:8765
```
Two tabs sync via BroadcastChannel; add `?relay=ws://localhost:8765` to test the real WebSocket path.

> Identical boards across two devices need the same character pool. Custom characters / saved GAYBYs
> live per-browser; the seed handles everything else.
