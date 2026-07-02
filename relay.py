#!/usr/bin/env python3
"""WHO? IS IT? — cross-device relay. Zero dependencies (Python 3 stdlib only).

Run:            python3 relay.py            (listens on 0.0.0.0:8765)
Then open the game on each device with ?relay=ws://<this-mac's-LAN-IP>:8765
e.g.            http://192.168.1.20:4173/?relay=ws://192.168.1.20:8765

It's a dumb room-scoped fan-out: every WebSocket message a client sends is
forwarded verbatim to every OTHER client connected to the same room (the room
is the URL path, e.g. ws://host:8765/5297). All game logic stays client-side.
"""
import base64
import hashlib
import socket
import struct
import threading

HOST, PORT = "0.0.0.0", 8765
MAGIC = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11"

rooms = {}            # room name -> set of client sockets
rooms_lock = threading.Lock()


def handshake(conn):
    """Read the HTTP upgrade request, reply with the WS accept. Returns room name or None."""
    data = b""
    while b"\r\n\r\n" not in data:
        chunk = conn.recv(4096)
        if not chunk:
            return None
        data += chunk
        if len(data) > 65536:
            return None
    head = data.decode("latin-1")
    path = head.split(" ", 2)[1] if " " in head else "/"
    key = None
    for line in head.split("\r\n"):
        if line.lower().startswith("sec-websocket-key:"):
            key = line.split(":", 1)[1].strip()
    if not key:
        return None
    accept = base64.b64encode(hashlib.sha1((key + MAGIC).encode()).digest()).decode()
    conn.send((
        "HTTP/1.1 101 Switching Protocols\r\n"
        "Upgrade: websocket\r\nConnection: Upgrade\r\n"
        f"Sec-WebSocket-Accept: {accept}\r\n\r\n"
    ).encode())
    return path.strip("/") or "lobby"


def read_frame(conn):
    """Read one client frame. Returns (opcode, payload bytes) or None on close/error."""
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
    if length > 1_000_000:
        return None
    mask = read_exact(4) if masked else b"\x00" * 4
    if mask is None:
        return None
    payload = read_exact(length) if length else b""
    if payload is None:
        return None
    if masked:
        payload = bytes(b ^ mask[i % 4] for i, b in enumerate(payload))
    return opcode, payload


def make_frame(payload, opcode=0x1):
    length = len(payload)
    if length < 126:
        head = struct.pack("!BB", 0x80 | opcode, length)
    elif length < 65536:
        head = struct.pack("!BBH", 0x80 | opcode, 126, length)
    else:
        head = struct.pack("!BBQ", 0x80 | opcode, 127, length)
    return head + payload


def client_thread(conn, addr):
    room = None
    try:
        room = handshake(conn)
        if not room:
            return
        with rooms_lock:
            rooms.setdefault(room, set()).add(conn)
        print(f"+ {addr[0]} joined room {room} ({len(rooms[room])} in room)")
        while True:
            frame = read_frame(conn)
            if frame is None:
                break
            opcode, payload = frame
            if opcode == 0x8:            # close
                break
            if opcode == 0x9:            # ping -> pong
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
        if room:
            with rooms_lock:
                rooms.get(room, set()).discard(conn)
                if room in rooms and not rooms[room]:
                    del rooms[room]
            print(f"- {addr[0]} left room {room}")
        try:
            conn.close()
        except OSError:
            pass


def main():
    srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    srv.bind((HOST, PORT))
    srv.listen(16)
    print(f"WHO? IS IT? relay listening on ws://{HOST}:{PORT}")
    print("Open the game with ?relay=ws://<this-mac-ip>:8765 on every device.")
    while True:
        conn, addr = srv.accept()
        threading.Thread(target=client_thread, args=(conn, addr), daemon=True).start()


if __name__ == "__main__":
    main()
