#!/usr/bin/env python3
"""WHO? IS IT? — all-in-one server. Zero dependencies (Python 3 stdlib only).

Serves the game's static files AND the room-sync WebSocket on ONE port, so the whole thing runs as a
single process / single container. Perfect for a free PaaS (Render / Fly / Railway): deploy once,
share the URL, and online play "just works" (the game auto-connects to same-origin WebSocket).

Local:   python3 relay.py           -> http://localhost:8765
Deploy:  reads $PORT (most hosts set it); serves this folder; upgrades WebSocket requests.

Protocol: a WebSocket request (Upgrade: websocket) joins a room = the last path segment
(ws(s)://host/<room>). Every message a client sends is fanned out to the OTHER clients in that room.
Everything else is a plain HTTP GET served from this directory.
"""
import base64
import hashlib
import mimetypes
import os
import socket
import struct
import threading

PORT = int(os.environ.get("PORT", "8765"))
HOST = "0.0.0.0"
ROOT = os.path.dirname(os.path.abspath(__file__))
WS_MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

rooms = {}
rooms_lock = threading.Lock()


def recv_headers(conn):
    data = b""
    while b"\r\n\r\n" not in data:
        chunk = conn.recv(4096)
        if not chunk:
            return None, None
        data += chunk
        if len(data) > 65536:
            return None, None
    head, _, _rest = data.partition(b"\r\n\r\n")
    lines = head.decode("latin-1").split("\r\n")
    request = lines[0]
    headers = {}
    for line in lines[1:]:
        if ":" in line:
            k, v = line.split(":", 1)
            headers[k.strip().lower()] = v.strip()
    return request, headers


# ---------- static file serving ----------

def send_http(conn, status, body=b"", ctype="text/plain; charset=utf-8", extra=""):
    conn.send((
        f"HTTP/1.1 {status}\r\n"
        f"Content-Type: {ctype}\r\n"
        f"Content-Length: {len(body)}\r\n"
        "Cache-Control: no-cache\r\n"
        f"{extra}Connection: close\r\n\r\n"
    ).encode() + body)


def serve_static(conn, request):
    try:
        path = request.split(" ", 2)[1]
    except IndexError:
        send_http(conn, "400 Bad Request")
        return
    path = path.split("?", 1)[0].split("#", 1)[0]
    if path == "/" or path == "":
        path = "/index.html"
    # Resolve safely inside ROOT (no directory traversal).
    target = os.path.normpath(os.path.join(ROOT, path.lstrip("/")))
    if not target.startswith(ROOT) or not os.path.isfile(target):
        send_http(conn, "404 Not Found", b"Not found")
        return
    ctype = mimetypes.guess_type(target)[0] or "application/octet-stream"
    with open(target, "rb") as f:
        body = f.read()
    send_http(conn, "200 OK", body, ctype)


# ---------- websocket ----------

def ws_accept(conn, key):
    accept = base64.b64encode(hashlib.sha1((key + WS_MAGIC).encode()).digest()).decode()
    conn.send((
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
    ).encode())


def read_frame(conn):
    def read_exact(n):
        buf = b""
        while len(buf) < n:
            chunk = conn.recv(n - len(buf))
            if not chunk:
                return None
            buf += chunk
        return buf

    head = read_exact(2)
    if not head:
        return None
    opcode = head[0] & 0x0F
    masked = head[1] & 0x80
    length = head[1] & 0x7F
    if length == 126:
        ext = read_exact(2)
        if not ext:
            return None
        length = struct.unpack(">H", ext)[0]
    elif length == 127:
        ext = read_exact(8)
        if not ext:
            return None
        length = struct.unpack(">Q", ext)[0]
    if length > 2_000_000:
        return None
    mask = read_exact(4) if masked else b"\x00\x00\x00\x00"
    if mask is None:
        return None
    payload = read_exact(length) if length else b""
    if payload is None:
        return None
    if masked:
        payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    return opcode, payload


def make_frame(payload, opcode=0x1):
    n = len(payload)
    if n < 126:
        head = struct.pack("!BB", 0x80 | opcode, n)
    elif n < 65536:
        head = struct.pack("!BBH", 0x80 | opcode, 126, n)
    else:
        head = struct.pack("!BBQ", 0x80 | opcode, 127, n)
    return head + payload


def serve_ws(conn, request, headers, addr):
    key = headers.get("sec-websocket-key")
    if not key:
        send_http(conn, "400 Bad Request")
        return
    ws_accept(conn, key)
    try:
        path = request.split(" ", 2)[1]
    except IndexError:
        path = "/lobby"
    room = path.split("?", 1)[0].strip("/").split("/")[-1] or "lobby"
    with rooms_lock:
        rooms.setdefault(room, set()).add(conn)
    print(f"+ {addr[0]} joined room {room} ({len(rooms[room])} in room)", flush=True)
    try:
        while True:
            frame = read_frame(conn)
            if frame is None:
                break
            opcode, payload = frame
            if opcode == 0x8:
                break
            if opcode == 0x9:
                conn.send(make_frame(payload, 0xA))
                continue
            if opcode not in (0x1, 0x2):
                continue
            out = make_frame(payload, opcode)
            with rooms_lock:
                peers = [c for c in rooms.get(room, ()) if c is not conn]
            for peer in peers:
                try:
                    peer.send(out)
                except OSError:
                    pass
    except OSError:
        pass
    finally:
        with rooms_lock:
            rooms.get(room, set()).discard(conn)
            if room in rooms and not rooms[room]:
                del rooms[room]
        print(f"- {addr[0]} left room {room}", flush=True)


# ---------- dispatch ----------

def client_thread(conn, addr):
    try:
        request, headers = recv_headers(conn)
        if not request:
            return
        if headers.get("upgrade", "").lower() == "websocket":
            serve_ws(conn, request, headers, addr)
        else:
            serve_static(conn, request)
    except OSError:
        pass
    finally:
        try:
            conn.close()
        except OSError:
            pass


def main():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((HOST, PORT))
    srv.listen(64)
    print(f"WHO? IS IT? server on http://{HOST}:{PORT}  (game + room-sync WebSocket)", flush=True)
    while True:
        conn, addr = srv.accept()
        threading.Thread(target=client_thread, args=(conn, addr), daemon=True).start()


if __name__ == "__main__":
    main()
