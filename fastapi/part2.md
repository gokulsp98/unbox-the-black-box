---
title: "Uvicorn — The Server Behind FastAPI"
series: "How FastAPI Works"
episode: 2
totalEpisodes: 7
description: "FastAPI never touches the network. That's Uvicorn's job. Here's what Uvicorn actually does — how it parses HTTP at C speed using httptools and uvloop, and exactly how it hands a request to your app."
tags: ["fastapi", "uvicorn", "asgi", "uvloop", "httptools", "http", "event-loop"]
author: "Gokul"
---

# Uvicorn — The Server Behind FastAPI

Episode 1 ended with a key insight: FastAPI is not a server. It's an application. Someone else has to listen for HTTP connections, parse the raw bytes, and call your app.

That someone is **Uvicorn**.

This episode is entirely about Uvicorn — what it does, how it does it so fast, and the exact handshake it performs before your endpoint ever runs.

---

## 01 — What Uvicorn Actually Does

Before your Python code runs a single line, Uvicorn has already done a lot of work.

Here's what Uvicorn owns:

- **Opening a port** — binds to `0.0.0.0:8000` (or wherever you point it), listens for incoming connections
- **Accepting TCP connections** — when a client connects, Uvicorn accepts it and starts reading bytes
- **Parsing raw HTTP** — turns a stream of bytes like `GET /users HTTP/1.1\r\nHost: ...` into structured Python objects
- **Calling your app** — packages the parsed request into a standard format and calls FastAPI
- **Sending the response** — takes whatever FastAPI returns and writes HTTP response bytes back to the client

FastAPI never sees the network. It never opens a socket. It never touches raw bytes. By the time your endpoint function runs, Uvicorn has already done the dirty work.

```
Client
  │  sends raw bytes over TCP
  ▼
Uvicorn
  │  parses bytes → Python objects
  │  calls your app via ASGI
  ▼
FastAPI
  │  routes, validates, runs your function
  ▼
Uvicorn
  │  converts response → raw bytes
  ▼
Client
  receives HTTP response
```

> **Analogy:** Think of Uvicorn as a mail room. Letters (HTTP requests) arrive in raw, physical form. The mail room opens them, sorts them, and delivers a clean, organized package to the right desk. The person at the desk (FastAPI) just works with the contents. They never touch the envelope, the postage, or the truck that delivered it.

---

## 02 — "Written in Python" Doesn't Mean Slow

The obvious question: Uvicorn is Python. Python is slow. So isn't Uvicorn slow?

No — because Uvicorn doesn't actually do the heavy lifting in Python.

The two most expensive operations in an HTTP server are:

1. **Parsing HTTP** — reading raw bytes and extracting the method, path, headers, and body
2. **Running the event loop** — managing thousands of concurrent connections without blocking

Uvicorn outsources both of these to C.

### httptools — C-speed HTTP parsing

```
pip install uvicorn[standard]
```

When you install Uvicorn with the `[standard]` extras, you get `httptools` — a Python binding to **llhttp**, the same HTTP parser used inside Node.js.

`llhttp` is written in C. It is extremely fast. Uvicorn calls into it from Python, but the actual byte-crunching happens in C.

```
Raw bytes arrive:
  "GET /users HTTP/1.1\r\nHost: localhost\r\n\r\n"
                 │
                 ▼
         httptools (C code)
                 │
                 ▼
    method = "GET"
    path   = "/users"
    headers = {"host": "localhost"}
    body    = b""
```

Your Python code gets pre-parsed, clean Python objects. The byte-level work already happened in C.

### uvloop — a C-based event loop

Python's standard library has an event loop called `asyncio`. It's what powers `async`/`await`. It's written in Python.

`uvloop` replaces it with a faster one — written in C, wrapping **libuv**, the same async I/O library that powers Node.js.

```
Default asyncio:   Python event loop
                   slower, but portable

uvloop:            C event loop (wraps libuv)
                   2-4x faster
                   same async/await interface
```

Your `async def` functions still look and feel the same. Uvloop is a drop-in replacement — it just runs the scheduler in C instead of Python.

> **Analogy:** Python is the construction foreman. It reads the blueprints, gives instructions, and coordinates the job. But the actual digging, pouring, and lifting? That's done by heavy machinery (C). The foreman doesn't carry the concrete himself. He just directs the machines that do.

Here's what using uvloop looks like under the hood — Uvicorn does this automatically when uvloop is installed:

```python
import uvloop

# Uvicorn swaps out the event loop before starting
asyncio.set_event_loop_policy(uvloop.EventLoopPolicy())
```

That one swap is responsible for a significant chunk of Uvicorn's speed advantage.

---

## 03 — How Uvicorn Handles a Connection

Let's trace a single request from the moment it arrives to the moment Uvicorn calls your app. This happens in microseconds, but there are real steps.

```
Step 1: Listen
──────────────
Uvicorn binds to port 8000.
The OS kernel now knows: anything arriving at port 8000 goes to Uvicorn.

Step 2: Accept connection
─────────────────────────
A client connects. Uvicorn accepts the TCP connection.
The event loop registers this connection for reading.

Step 3: Read bytes
──────────────────
Bytes arrive. Uvicorn's event loop wakes up and reads them.
Raw bytes: b"GET /users?active=true HTTP/1.1\r\nHost: localhost\r\n\r\n"

Step 4: Parse HTTP (via httptools)
───────────────────────────────────
httptools processes the bytes and extracts:
  - Method: GET
  - Path: /users
  - Query string: active=true
  - Headers: {host: localhost}
  - Body: (empty)

Step 5: Build ASGI scope
─────────────────────────
Uvicorn assembles a dict:
  scope = {
      "type": "http",
      "method": "GET",
      "path": "/users",
      "query_string": b"active=true",
      "headers": [(b"host", b"localhost")],
      ...
  }

Step 6: Call the FastAPI app
─────────────────────────────
Uvicorn calls:  await app(scope, receive, send)
FastAPI takes over.

Step 7: Receive the response
─────────────────────────────
FastAPI calls `send` with the response data.
Uvicorn collects it.

Step 8: Format and send
────────────────────────
Uvicorn writes raw HTTP bytes back to the client:
  "HTTP/1.1 200 OK\r\nContent-Type: application/json\r\n\r\n{...}"
```

Each step is clear, fast, and isolated. Uvicorn doesn't know what your app does. FastAPI doesn't know how Uvicorn works. They communicate through one standard interface.

---

## 04 — The ASGI Handoff in Detail

The moment Uvicorn hands control to FastAPI is the most important line in the whole server:

```python
await app(scope, receive, send)
```

Three arguments. That's the entire ASGI protocol.

### `scope` — the request descriptor

A plain Python dict. Read-only. Contains everything about the request:

```python
scope = {
    "type": "http",          # "http", "websocket", or "lifespan"
    "asgi": {"version": "3.0"},
    "http_version": "1.1",
    "method": "GET",
    "path": "/users",
    "raw_path": b"/users",
    "query_string": b"active=true",
    "root_path": "",
    "headers": [
        (b"host", b"localhost:8000"),
        (b"accept", b"application/json"),
    ],
    "client": ("127.0.0.1", 54321),  # (IP, port) of the client
    "server": ("127.0.0.1", 8000),   # (IP, port) of this server
}
```

FastAPI reads this dict and figures out how to route the request.

### `receive` — reading the request body

`receive` is an async callable. Your app calls it to read the request body chunk by chunk. For a `GET` request there's nothing to read, but for a `POST` with a JSON body:

```python
# FastAPI calls this internally when it needs the body
event = await receive()
# event looks like:
# {
#     "type": "http.request",
#     "body": b'{"name": "Alice"}',
#     "more_body": False
# }
```

The body isn't pushed at you all at once — you ask for it when you need it. This makes streaming large payloads possible without loading everything into memory.

### `send` — sending the response

`send` is an async callable. Your app calls it twice: once to send the response headers, once (or more) to send the body.

```python
# FastAPI calls this internally to send the response
await send({
    "type": "http.response.start",
    "status": 200,
    "headers": [
        (b"content-type", b"application/json"),
        (b"content-length", b"18"),
    ],
})

await send({
    "type": "http.response.body",
    "body": b'{"name": "Alice"}',
    "more_body": False,  # no more chunks after this
})
```

Uvicorn listens for these `send` calls and writes the corresponding bytes back to the TCP connection.

### The full handshake

```
Uvicorn:   "Here's the scope, receive, and send."
           await app(scope, receive, send)

FastAPI:   reads scope → routes the request
           await receive() → reads the body (if needed)
           ... runs your endpoint function ...
           await send(headers)
           await send(body)

Uvicorn:   collects the send() calls
           formats them as HTTP
           writes to the TCP socket
```

Neither side needs to know how the other is implemented. Uvicorn could be swapped for Hypercorn. FastAPI could be swapped for Starlette. As long as both speak ASGI, it works.

---

## 05 — Uvicorn vs Other ASGI Servers

Uvicorn isn't the only ASGI server. The ASGI spec is a standard — any server that implements it can run FastAPI.

| Server | Key feature | When to use |
|--------|-------------|-------------|
| **Uvicorn** | Fastest, most popular. Uses uvloop + httptools. | Default choice. Start here. |
| **Hypercorn** | Supports HTTP/2 and HTTP/3. | If you need those protocols. |
| **Daphne** | Built for Django Channels. | If you're in the Django ecosystem. |
| **Granian** | Written in Rust. Very fast. | Newer option, growing ecosystem. |

All of them speak ASGI. All of them call your FastAPI app the same way:

```python
await app(scope, receive, send)
```

Switching servers is one command change. Your FastAPI code doesn't change at all.

```bash
# Uvicorn
uvicorn main:app

# Hypercorn (same app, different server)
hypercorn main:app

# Granian
granian --interface asgi main:app
```

> **Analogy:** The ASGI interface is like an electrical outlet standard. Your appliance (FastAPI) has a plug. Any outlet (Uvicorn, Hypercorn, Daphne) that follows the standard will power it. You don't rewire the appliance when you change the outlet.

---

## 06 — What Uvicorn Does NOT Do

Uvicorn is deliberately narrow. Understanding its limits matters when you deploy.

**Uvicorn is not a process manager.**
It runs one process. If that process crashes, your app is down. That's what Gunicorn is for — it spawns and supervises multiple Uvicorn workers. (Covered in Episode 1.)

**Uvicorn doesn't handle SSL in production.**
You *can* pass `--ssl-certfile` and `--ssl-keyfile` to Uvicorn, and it works for development. But in production, SSL termination belongs to a reverse proxy like Nginx or a load balancer. They're much better at it.

**Uvicorn is not a reverse proxy.**
It doesn't do load balancing across servers, caching, rate limiting, or path rewriting. Nginx or a cloud load balancer does that upstream.

**Uvicorn doesn't manage workers well on its own.**
Running `uvicorn --workers 4` works, but you lose graceful restarts, automatic worker replacement, and the process management maturity that Gunicorn provides.

```
What Uvicorn DOES own:
  ✓ Accepting TCP connections
  ✓ Parsing HTTP (via httptools)
  ✓ Running the async event loop (via uvloop)
  ✓ Calling your ASGI app
  ✓ Sending HTTP responses

What Uvicorn delegates:
  → Process management  ............  Gunicorn
  → SSL termination  ...............  Nginx / Load balancer
  → Reverse proxying  ..............  Nginx / Traefik
  → Multiple servers  ..............  Cloud load balancer
```

This sharp boundary is a feature. Uvicorn is excellent at one thing because it doesn't try to do everything.

---

## 07 — Recap

- **Uvicorn is the HTTP server.** FastAPI is the application. Uvicorn owns the network. FastAPI owns the logic.
- **httptools** — a C extension that wraps Node.js's llhttp HTTP parser. Parses HTTP at C speed.
- **uvloop** — a C extension that wraps libuv, Node.js's event loop. Replaces Python's asyncio. 2-4x faster.
- Uvicorn's speed comes from outsourcing the expensive parts to C. Python directs; C executes.
- **ASGI** is the three-argument handshake: `await app(scope, receive, send)`. That's the entire protocol.
- `scope` — a dict describing the request (method, path, headers, query string).
- `receive` — an async callable to read the request body.
- `send` — an async callable to write response headers and body.
- Uvicorn is **not** a process manager, SSL endpoint, or reverse proxy. Know its boundaries.
- Any ASGI server (Hypercorn, Daphne, Granian) can run FastAPI — they all speak the same protocol.

---

*Next up in Episode 3: Uvicorn uses an event loop to handle thousands of connections on a single thread. How? What is an event loop, really — and why does `async`/`await` make FastAPI so much more efficient than Flask? We'll build it up from scratch.*
