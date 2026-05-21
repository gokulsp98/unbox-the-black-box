---
title: "FastAPI — What Happens When You Hit It"
series: "How FastAPI Works"
episode: 1
totalEpisodes: 7
description: "You run fastapi dev and it works. But what's actually happening? Trace the journey from dev mode to production — Uvicorn, Gunicorn, ASGI, and every layer in between."
tags: ["fastapi", "uvicorn", "gunicorn", "asgi", "http", "request-lifecycle"]
author: "Gokul"
---

# FastAPI — What Happens When You Hit It

You write a few lines of Python, run one command, and suddenly you have a working API. But what's actually happening between your terminal and that JSON response?

Let's start from what you see — and peel back the layers.

---

## 01 — How You Run It in Development

Here's the app everyone starts with:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/hello")
async def hello():
    return {"message": "Hello, world!"}
```

In development, you run it like this:

```
fastapi dev main.py
```

That's it. You open `http://localhost:8000/hello` and see a JSON response. No server config, no setup, no extra tools.

But here's the thing — `fastapi dev` is a convenience wrapper. Under the hood, it's doing this:

```
fastapi dev main.py
       ↓ secretly runs
uvicorn main:app --reload --host 127.0.0.1 --port 8000
```

It starts **Uvicorn** for you — with auto-reload enabled so changes reflect instantly. You just don't see it.

So even in dev mode, there's already a hidden layer: **Uvicorn**, an HTTP server. FastAPI never touches the network directly.

---

## 02 — From Dev to Production: The Three Stages

As your app grows from your laptop to serving real users, the stack grows too:

### Stage 1: Development

```
fastapi dev main.py

What's running:
  Uvicorn (1 worker, auto-reload ON)
    └── FastAPI app
```

One process, one worker, auto-reload. Perfect for coding. Terrible for production — one worker means one request at a time gets CPU attention, and auto-reload wastes resources.

### Stage 2: Simple Production

```
uvicorn main:app --host 0.0.0.0 --port 8000

What's running:
  Uvicorn (1 worker, no reload)
    └── FastAPI app
```

You call Uvicorn directly. No auto-reload. Listens on all interfaces so external traffic can reach it. Good enough for small apps or containers.

### Stage 3: Real Production

```
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4

What's running:
  Gunicorn (process manager)
    ├── Uvicorn Worker 1 → FastAPI app
    ├── Uvicorn Worker 2 → FastAPI app
    ├── Uvicorn Worker 3 → FastAPI app
    └── Uvicorn Worker 4 → FastAPI app
```

Now we have **Gunicorn** managing multiple **Uvicorn workers**. Each worker is a separate process with its own copy of your FastAPI app. Four workers = four requests getting CPU time in parallel.

But wait — what does each piece actually do? Let's break it down.

---

## 03 — The Stack: Who Does What

Every request passes through multiple layers. Each layer has exactly one job:

```
Browser / Client
  ↓  sends HTTP request over the network
Gunicorn (Process Manager) — optional, production only
  ↓  picks a worker to handle this request
Uvicorn (ASGI Server)
  ↓  parses HTTP, creates a Python dict, calls your app
FastAPI (Application Framework)
  ↓  matches the URL, validates input, calls your function
Your Function
  ↓  does the work (DB query, calculation, etc.)
FastAPI
  ↓  converts your return value to JSON
Uvicorn
  ↓  sends the HTTP response back
Browser / Client
```

Four players, four different jobs:

- **Gunicorn** — the manager. Spawns and supervises multiple worker processes. Restarts them if they crash. Doesn't handle HTTP itself.
- **Uvicorn** — the ears. Listens for HTTP, parses requests, sends responses. Each worker runs one Uvicorn instance.
- **FastAPI** — the brain. Routes requests, validates data, generates docs.
- **Your function** — the hands. Does the actual work.

> **Analogy:** Imagine a restaurant. The **owner** (Gunicorn) hires multiple waitstaff and makes sure shifts are covered — but never takes orders himself. Each **waiter** (Uvicorn) stands at the door, seats customers, and carries plates. The **menu system** (FastAPI) checks if the order is valid and routes it to the right kitchen station. The **chef** (your function) actually cooks. Each one has a clear job.

---

## 04 — Why Three Layers? Can't One Do Everything?

This is the question everyone asks. Let's see why each layer exists:

### Why can't FastAPI handle HTTP?

Handling HTTP connections is hard, low-level work:

- Opening TCP sockets
- Managing thousands of simultaneous connections
- Parsing raw HTTP bytes correctly
- Handling keep-alive, chunked transfer, timeouts

This has nothing to do with your business logic. Your endpoint that fetches user data shouldn't care about TCP socket management. So FastAPI doesn't — it delegates to Uvicorn.

### Why can't Uvicorn manage multiple processes?

Uvicorn *can* run with `--workers 4`, and it works. But Gunicorn is battle-tested for process management:

- Graceful restarts (zero downtime deploys)
- Automatic restart of crashed workers
- Pre-fork model (workers are ready before traffic hits)
- Mature monitoring and signal handling

Uvicorn's `--workers` flag actually works fine for many setups. Gunicorn adds robustness for high-traffic production environments.

### Why not just use Gunicorn alone?

Gunicorn was built for **WSGI** — the older, synchronous Python web standard. It doesn't natively speak **ASGI** (the async standard FastAPI uses). So Gunicorn manages the processes, but each process runs a Uvicorn worker that handles the actual async HTTP.

```
Gunicorn says:  "I'll manage the processes"
Uvicorn says:   "I'll handle the HTTP and async"
FastAPI says:   "I'll handle the application logic"
```

> **Analogy:** Your phone has a **cellular radio** (hardware that connects to towers), an **operating system** (manages apps and resources), and **apps** (do useful things). The apps don't connect to towers. The radio doesn't manage apps. The OS doesn't display your photos. Three layers, each with a clear purpose.

---

## 05 — Step by Step: The Life of a Request

Let's trace exactly what happens when your browser hits `GET /hello`:

### Step 1: Browser sends an HTTP request

Your browser creates a raw HTTP message and sends it over TCP:

```
GET /hello HTTP/1.1
Host: localhost:8000
Accept: application/json
```

This is just text flying over the network. It arrives at port 8000 on your machine.

### Step 2: Uvicorn receives the raw bytes

Uvicorn is sitting on port 8000, waiting. When bytes arrive, it:

1. **Accepts the TCP connection**
2. **Parses the HTTP** — extracts the method (`GET`), path (`/hello`), headers, and body
3. **Creates a Python dict** called a `scope` — a standardized way to represent the request:

```python
# What Uvicorn creates internally (simplified)
scope = {
    "type": "http",
    "method": "GET",
    "path": "/hello",
    "headers": [...],
    "query_string": b"",
}
```

4. **Calls your FastAPI app** using the ASGI interface

This is the **ASGI protocol** — Uvicorn doesn't know or care that it's talking to FastAPI. It just calls whatever Python app you pointed it at.

### Step 3: FastAPI takes over

FastAPI receives the request and:

1. **Matches the route** — scans registered endpoints, finds `@app.get("/hello")`
2. **Validates the input** — checks path params, query params, request body against your type hints
3. **Resolves dependencies** — runs any `Depends()` functions
4. **Calls your function** — `hello()`

### Step 4: Your function runs

```python
async def hello():
    return {"message": "Hello, world!"}
```

It returns a plain Python dict. Your function doesn't know about HTTP, headers, or JSON encoding. It just returns data.

### Step 5: FastAPI builds the response

FastAPI takes your dict and:

1. **Serializes it to JSON** — `{"message": "Hello, world!"}`
2. **Sets the status code** — `200 OK`
3. **Sets the Content-Type header** — `application/json`
4. **Hands the response back to Uvicorn**

### Step 6: Uvicorn sends it back

Uvicorn formats it as raw HTTP and sends the bytes back:

```
HTTP/1.1 200 OK
Content-Type: application/json
Content-Length: 27

{"message":"Hello, world!"}
```

### Step 7: Browser displays the result

Your browser receives the response and renders the JSON.

Total time: usually **under 1 millisecond** for a simple endpoint.

---

## 06 — What is ASGI? The Contract Between Server and App

For Uvicorn and FastAPI to work together, they need a shared contract — a standard that says "here's how a server talks to an app."

That contract is **ASGI** — **Asynchronous Server Gateway Interface**.

ASGI says:

> "The server will call your app as a Python callable. It will pass three things: a `scope` dict (what the request is), a `receive` callable (to read the body), and a `send` callable (to send the response)."

```python
# What an ASGI app looks like at the lowest level
async def app(scope, receive, send):
    # scope = dict with request info (method, path, headers)
    # receive = async function to read request body
    # send = async function to send response
    ...
```

FastAPI implements this interface. So does Django Channels. So does Starlette. Uvicorn can talk to any of them — because it only cares about the interface, not the framework.

```
Uvicorn  ←→  ASGI  ←→  FastAPI
Uvicorn  ←→  ASGI  ←→  Django Channels
Uvicorn  ←→  ASGI  ←→  Starlette
```

This is why `uvicorn main:app` works — Uvicorn imports `app` from `main.py` and calls it using the ASGI protocol. It doesn't know it's FastAPI.

### What about WSGI?

Before ASGI, Python had **WSGI** — the synchronous version. Flask and traditional Django use WSGI.

| | WSGI | ASGI |
|--|------|------|
| **Style** | Synchronous | Asynchronous |
| **One request** | Blocks the thread until done | Can pause and let others run |
| **Concurrency** | One request per thread | Thousands per thread |
| **Server** | Gunicorn (native) | Uvicorn |
| **Frameworks** | Flask, Django | FastAPI, Django Channels |

ASGI exists because async Python (`async`/`await`) made it possible to handle many requests with a single thread — which is exactly what makes FastAPI fast. We'll dig deep into this in Episodes 3 and 4.

---

## 07 — The Hidden Layer: Starlette

Here's a detail most tutorials skip: FastAPI is built on top of **another framework**.

```
FastAPI
  ↓  built on top of
Starlette (lightweight ASGI framework)
  ↓  built on top of
AnyIO (async compatibility layer)
```

And for data validation:

```
FastAPI  →  Pydantic (data validation using type hints)
```

**Starlette** handles the core web stuff — routing, middleware, request/response objects, WebSockets. FastAPI adds the magic on top — automatic validation from type hints, dependency injection, and auto-generated OpenAPI docs.

When you write `@app.get("/hello")`, FastAPI registers the route through Starlette's router. When a request arrives, Starlette's middleware pipeline processes it before your function runs.

You rarely interact with Starlette directly. But knowing it's there explains why FastAPI is fast — Starlette is one of the fastest Python web frameworks, and FastAPI inherits all of that.

---

## 08 — The Complete Mental Model

Here's the full picture — from dev to production:

### Development
```
fastapi dev main.py
       │
       ▼
┌──────────────────────────┐
│  Uvicorn (1 worker)      │
│  + auto-reload           │
│    └── FastAPI app        │
│          └── Your code    │
└──────────────────────────┘
```

### Production
```
gunicorn -k uvicorn.workers.UvicornWorker -w 4
       │
       ▼
┌──────────────────────────────────────────┐
│  Gunicorn (process manager)              │
│                                          │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ Uvicorn W1  │  │ Uvicorn W2  │       │
│  │  └─ FastAPI │  │  └─ FastAPI │       │
│  │    └─ Code  │  │    └─ Code  │       │
│  └─────────────┘  └─────────────┘       │
│  ┌─────────────┐  ┌─────────────┐       │
│  │ Uvicorn W3  │  │ Uvicorn W4  │       │
│  │  └─ FastAPI │  │  └─ FastAPI │       │
│  │    └─ Code  │  │    └─ Code  │       │
│  └─────────────┘  └─────────────┘       │
└──────────────────────────────────────────┘
```

**Key takeaway:** FastAPI is not a server. It's an application framework that plugs into a server (Uvicorn) via a standard interface (ASGI). In dev mode, `fastapi dev` hides this from you. In production, Gunicorn adds process management on top. Understanding these layers is the foundation for everything else in this series.

---

## Recap — What We Learned

- **`fastapi dev`** is a convenience — it secretly runs Uvicorn with auto-reload behind the scenes.
- **Uvicorn** is the HTTP server — it listens on a port, parses HTTP, and manages connections. FastAPI can't do this alone.
- **Gunicorn** is the process manager — it spawns multiple Uvicorn workers so your app can use multiple CPU cores. Used in production for robustness.
- **FastAPI** is the application framework — it routes requests, validates input, and generates docs. It doesn't handle networking.
- **ASGI** is the contract between server and framework — a simple interface (`scope`, `receive`, `send`) that lets any ASGI server talk to any ASGI app.
- **Starlette** is the web framework FastAPI is built on — it handles routing, middleware, and request/response objects under the hood.
- A request flows: **Client → Gunicorn → Uvicorn → FastAPI → Your function → FastAPI → Uvicorn → Client**.

---

*Next up in Episode 2: We'll look inside Uvicorn — how a Python server handles HTTP at near-C speed, what uvloop and httptools are, and why "written in Python" doesn't mean slow.*
