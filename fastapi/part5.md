---
title: "Workers — Scaling FastAPI Across CPU Cores"
series: "How FastAPI Works"
episode: 5
totalEpisodes: 7
description: "Async gives you concurrency within one process. But what about multiple CPU cores? This episode explains the worker model — multiple processes, each with their own GIL and event loop — and how to tune your worker count for real production workloads."
tags: ["fastapi", "workers", "multiprocessing", "gunicorn", "uvicorn", "GIL", "concurrency", "parallelism"]
author: "Gokul"
---

# Workers — Scaling FastAPI Across CPU Cores

In Episodes 3 and 4, we saw how FastAPI handles concurrency: one event loop, one thread, hundreds of requests interleaved through `async/await`. It's elegant. But there's a hard ceiling.

No matter how efficient your async code is, one Python process can only use one CPU core at a time.

If you have four cores and you're running one process, three of them are sitting idle. That's the problem workers solve.

---

## 01 — The GIL Problem

Python has a feature called the **Global Interpreter Lock** — the GIL.

The GIL is a mutex (a lock) inside CPython, Python's standard interpreter. It ensures that only one thread executes Python bytecode at any given moment, even if your machine has multiple CPU cores.

Here's what that means in practice:

```
4-core machine, 1 Python process, 4 threads:

Core 1: ██████████████████  (running Python)
Core 2: ──────────────────  (idle — GIL is taken)
Core 3: ──────────────────  (idle — GIL is taken)
Core 4: ──────────────────  (idle — GIL is taken)
```

Only one thread holds the GIL at a time. The others wait their turn. For CPU-bound work — heavy computation, image processing, cryptography — threading in Python gives you no parallelism at all. You get concurrency (taking turns), not parallelism (working simultaneously).

The event loop from Episodes 3 and 4 doesn't change this. It gives us *concurrency* — the ability to interleave I/O waits and make progress on multiple requests. But it still runs in a single thread, under the same GIL. One core is all we get.

For a web API that mostly waits on databases and external services, this is fine. For anything CPU-heavy, or to simply use all available hardware, we need a different approach.

> **Analogy:** The GIL is like a baton in a relay race — only the runner holding the baton can run Python. Four runners on the track, but only one baton. Passing it around makes each runner *feel* concurrent, but at any instant only one is actually moving.

---

## 02 — The Solution: Multiple Processes

The fix is straightforward: instead of one process trying to share a GIL across threads, we run **multiple separate processes**. Each process is a completely independent copy of the Python interpreter — with its own GIL, its own memory, its own event loop.

```
4-core machine, 4 Python processes:

Core 1: ██████████████████  (Worker 1, own GIL)
Core 2: ██████████████████  (Worker 2, own GIL)
Core 3: ██████████████████  (Worker 3, own GIL)
Core 4: ██████████████████  (Worker 4, own GIL)
```

All four cores are busy. True parallelism — not taking turns, actually running at the same time.

You get this with one flag:

```
uvicorn main:app --workers 4
```

Or with Gunicorn:

```
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4
```

Four workers. Four OS processes. Four cores doing real work simultaneously.

> **Analogy:** Instead of one chef trying to work at every station in a kitchen, you hire four chefs and give each their own station. They don't share tools, they don't get in each other's way — they just work in parallel.

---

## 03 — What Each Worker Actually Is

When you run `--workers 4`, here's what's actually created:

```
Main Process (manages workers)
  ├── Worker 1: own GIL, own event loop, own FastAPI app
  ├── Worker 2: own GIL, own event loop, own FastAPI app
  ├── Worker 3: own GIL, own event loop, own FastAPI app
  └── Worker 4: own GIL, own event loop, own FastAPI app
```

Each worker is a full, separate OS process. Not a thread. Not a lightweight coroutine. A process — the same kind of thing your terminal or your text editor is.

That means each worker:

- Has its own copy of your FastAPI app loaded in memory
- Has its own event loop running independently
- Has its own GIL (irrelevant to other workers)
- Has its own in-memory state (caches, global variables — completely isolated)
- Can crash without taking down the other workers

When a request comes in, the OS distributes incoming TCP connections across the listening workers. Each worker picks up a request, handles it through its own event loop, and sends the response back — completely independently of the others.

This is important: **workers do not communicate with each other**. They don't share a cache. They don't share session state. They don't know the other workers exist. Each one is an island.

If you store something in a Python dict inside Worker 1's app, Worker 2 has no idea it's there. This is why stateless design matters in production — anything you need to share (session data, rate limit counters, cached results) needs to live outside the process, in Redis or a database.

---

## 04 — Processes vs Threads

The choice between threads and processes for Python parallelism has a clear answer once you understand the GIL.

| | Threads | Processes |
|---|---|---|
| **GIL** | Shared — only one runs at a time | Each has its own — true parallelism |
| **Memory** | Shared — see each other's data | Isolated — completely separate |
| **CPU parallelism** | No (GIL prevents it) | Yes |
| **Communication** | Easy (shared memory) | Hard (need IPC, Redis, etc.) |
| **Memory usage** | Low — one copy of the app | High — N copies of the app |
| **Crash isolation** | One thread crash can kill all | One worker crash leaves others running |

For CPU parallelism in Python: **processes win, every time**. The GIL makes threads useless for this purpose.

The tradeoff is memory. Each worker loads your entire FastAPI app — all your routes, all your Pydantic models, all your dependencies. If your app takes 200MB to load, four workers use 800MB. That's the price of true parallelism.

For most web APIs, this is a reasonable trade. Memory is cheap. Wasting three CPU cores is expensive.

> **Analogy:** Threads are like multiple people sharing one laptop — they take turns but can't really work at the same time. Processes are like giving each person their own laptop — more hardware cost, but everyone works in parallel and one person's crash doesn't affect the others.

---

## 05 — How Many Workers?

The standard formula:

```
workers = 2 × CPU_cores + 1
```

For a 4-core machine: `2 × 4 + 1 = 9` workers.

Where does this come from?

- You want at least one worker per core to keep all cores busy
- The `× 2` accounts for workers that are momentarily blocked — waiting for a database response, doing I/O, handling a slow client. A blocked worker isn't using its core, so having extras means other workers can fill the gap
- The `+ 1` is a spare — one extra worker to absorb traffic spikes without all workers being simultaneously busy

To find your core count in Python:

```python
import multiprocessing
print(multiprocessing.cpu_count())
```

Or in your startup script:

```python
import multiprocessing
workers = 2 * multiprocessing.cpu_count() + 1
```

This formula is a starting point, not a law. It assumes your workers are mostly I/O-bound (which web APIs usually are). If your endpoints are CPU-heavy, you might go with `1 × CPU_cores` instead — no point having more workers than cores if they're all pegging the CPU.

Real tuning comes from measuring. Run load tests, watch CPU and memory usage, adjust. But `2 × cores + 1` is the right place to start.

---

## 06 — Uvicorn `--workers` vs Gunicorn

Uvicorn can spawn workers on its own:

```
uvicorn main:app --workers 4
```

This works. For many setups — containers, simple deployments, small teams — it's all you need.

Gunicorn with the Uvicorn worker class adds more:

```
gunicorn main:app -k uvicorn.workers.UvicornWorker -w 4
```

What Gunicorn adds on top:

- **Graceful restarts** — when you deploy a new version, Gunicorn can drain existing requests on old workers before killing them. No dropped connections, no errors for users mid-request. Uvicorn alone doesn't handle this as cleanly.
- **Automatic crash recovery** — if a worker process crashes (memory error, unhandled exception, anything), Gunicorn detects it and spawns a replacement. With Uvicorn alone, a crashed worker stays dead.
- **Pre-fork model** — Gunicorn forks workers before traffic arrives, so they're warm and ready from the start.
- **Mature signal handling** — SIGHUP for reload, SIGTERM for graceful shutdown, fine-grained control over worker lifecycle.

For a containerized environment where the orchestrator (Kubernetes, ECS) handles crash recovery and rolling restarts, Uvicorn's built-in workers are often sufficient. The container dies, the orchestrator restarts it — Gunicorn's worker supervision is redundant.

For a traditional server setup, or high-traffic production where you need zero-downtime deploys without external tooling, Gunicorn earns its place.

The choice isn't "one is better" — it's "what does your deployment infrastructure already handle?"

---

## 07 — The Complete Concurrency Picture

We've now seen three layers of concurrency in FastAPI. They stack on top of each other:

```
┌─────────────────────────────────────────────────────────────┐
│                      Incoming Requests                      │
└───────────────────────┬────────────────┬────────────────────┘
                        │                │
            ┌───────────▼──────┐ ┌───────▼──────────┐
            │    Worker 1      │ │    Worker 2       │
            │  (OS Process)    │ │  (OS Process)     │
            │                  │ │                   │
            │  ┌────────────┐  │ │  ┌────────────┐  │
            │  │ Event Loop │  │ │  │ Event Loop │  │
            │  │            │  │ │  │            │  │
            │  │ coro coro  │  │ │  │ coro coro  │  │
            │  │ coro coro  │  │ │  │ coro coro  │  │
            │  └────────────┘  │ │  └────────────┘  │
            │                  │ │                   │
            │  ┌────────────┐  │ │  ┌────────────┐  │
            │  │ Thread Pool│  │ │  │ Thread Pool│  │
            │  │ (sync def) │  │ │  │ (sync def) │  │
            │  └────────────┘  │ │  └────────────┘  │
            └──────────────────┘ └───────────────────┘
```

Each layer does a different job:

**Workers (processes)** — parallelism across CPU cores. Multiple workers run simultaneously on different cores. The OS decides which worker handles each incoming connection. This is your horizontal scale — more workers means more CPU cores working.

**Event loop (per worker)** — concurrency for I/O-bound work within each worker. One event loop handles many requests by interleaving them at `await` points. While one coroutine waits for a database response, another runs. This is why a single worker can handle hundreds of concurrent requests.

**Thread pool (per worker)** — handles sync/blocking code without freezing the event loop. When a `def` endpoint runs, FastAPI offloads it to a thread pool so the event loop stays free. The thread pool is not for parallelism — it's for isolation.

Put it together:

```
For I/O-bound work (99% of web APIs):
  Event loop handles concurrency within each worker.
  Workers handle parallelism across cores.
  Result: high throughput, low memory, all cores used.

For CPU-bound work:
  Workers handle parallelism.
  Event loop gives no benefit (no I/O to interleave).
  Result: as many workers as cores, each pegging one core.
```

This is why FastAPI scales well with reasonable hardware. It's not magic — it's three layers of well-understood concurrency working together.

---

## 08 — Recap

- **The GIL** ensures only one thread runs Python at a time. Multiple threads in one process cannot achieve CPU parallelism in CPython.
- **The fix is processes** — each process has its own GIL and event loop. `uvicorn main:app --workers 4` creates four independent OS processes.
- **Each worker is isolated** — its own memory, its own FastAPI app, its own state. Workers don't share anything. Global variables and in-process caches are per-worker.
- **Processes use more memory than threads** — each worker loads a full copy of your app. That's the cost of true parallelism.
- **The worker formula** is `2 × CPU_cores + 1` — enough to keep all cores busy, plus spares for workers momentarily blocked on I/O.
- **Uvicorn `--workers` is sufficient for most setups.** Gunicorn adds graceful restarts, crash recovery, and mature signal handling for high-traffic production.
- **Three concurrency layers stack together:** workers (parallelism across cores) → event loop (concurrency for I/O within each worker) → thread pool (isolation for sync code).

---

*Up next in Episode 6: FastAPI's Magic — Routing, Validation & Docs. You've seen how requests get to your app and how workers scale it. Now let's look at what FastAPI does with a request once it arrives — how `@app.get("/users/{id}")` turns into a matched route, how your type hints become validation, and how the interactive docs at `/docs` generate themselves from code you already wrote.*
