---
title: "The Event Loop Inside Uvicorn"
series: "How FastAPI Works"
episode: 3
totalEpisodes: 7
description: "How does one Python thread handle thousands of simultaneous requests? The answer is the event loop — and understanding it changes how you write FastAPI code forever."
tags: ["fastapi", "uvicorn", "event-loop", "asyncio", "uvloop", "concurrency", "async"]
author: "Gokul"
---

# The Event Loop Inside Uvicorn

In Episode 1, we saw that Uvicorn sits between the network and your FastAPI app. In Episode 2, we looked at how Uvicorn parses raw HTTP at near-C speed.

But there's a deeper question we haven't answered yet: **how does one server handle thousands of requests at the same time?**

It can't open a thousand threads. It doesn't run on a supercomputer. Yet it handles thousands of concurrent users on a single CPU core without breaking a sweat.

The answer is the **event loop** — and it's one of the most important ideas in all of modern backend programming.

---

## 01 — The Problem: Waiting Is Wasting

Think about what your typical API endpoint actually does:

```python
@app.get("/user/{id}")
async def get_user(id: int):
    user = await db.fetch_one("SELECT * FROM users WHERE id = ?", id)
    profile = await http_client.get(f"https://profile-service/user/{id}")
    return {"user": user, "profile": profile}
```

There are two operations here: a database query and an HTTP call to another service. Both of them involve **waiting**. You send the query, then you sit there until the database sends data back. You send the HTTP request, then you sit there until the other server responds.

That wait time is not a millisecond. It's typically 5ms, 20ms, 50ms, sometimes hundreds of milliseconds. During that entire time, the thread is doing **nothing**.

On a synchronous server, that thread is completely blocked. It can't do anything else. If you have 1000 users hitting your API at the same time, you need 1000 threads — one per user, all sitting idle while their DB queries run.

Threads aren't free. Each one costs memory (typically 1-8MB of stack space). A thousand threads means gigabytes of RAM just sitting around waiting for database responses. And the OS has to schedule all of them, which adds its own overhead.

There has to be a better way. There is.

---

## 02 — What Is an Event Loop?

The event loop is a simple idea with a powerful payoff.

It's a **single-threaded loop** that runs forever, doing exactly three things:

```
while True:
    Check: is anything ready?
      - New connection arrived?
      - DB response came back?
      - Timer expired?
      - File finished reading?

    If yes → run the handler for that event
    If no  → check again
```

That's it. No blocking. No waiting. Always checking. The moment something is ready, it runs the right handler. The moment that handler needs to wait for I/O, it steps aside and the loop moves on to the next ready event.

One thread. One CPU core. Thousands of simultaneous connections.

> **Analogy:** Think of a chef cooking ten dishes at once. A bad chef stands at the stove and watches water boil. A great chef puts the water on, goes to chop vegetables, checks on something in the oven, stirs a sauce, comes back to find the water boiling — and only then continues with that dish. Ten dishes, one chef, zero idle time. The chef is never waiting. Whenever one dish needs a pause (the oven, the boiling water, the resting meat), she's already working on another.
>
> The event loop is that chef. Your requests are the dishes. Waiting for a DB response is the water that needs to boil.

---

## 03 — How the Event Loop Handles Multiple Requests

Let's walk through a concrete scenario. Three requests arrive in quick succession.

**Timeline:**

```
Time →  0ms    10ms   20ms   30ms   40ms   50ms   60ms
        │      │      │      │      │      │      │

Req A   [start]─────[await DB]─────────────────[resume]─[respond]
                           ↓
Req B          [start]─────[await API call]────────────────[resume]─[respond]
                                  ↓
Req C                 [start]─────[await DB]────────────────────[resume]─[respond]
                                         ↓
Event        checking... checking... A's DB back!  B's API back!  C's DB back!
Loop
```

Step by step:

**0ms** — Request A arrives. The event loop runs its handler, which immediately hits a DB query. The handler says "I'm waiting for the DB" and **pauses**. Control returns to the event loop.

**10ms** — Request B arrives. The event loop runs its handler, which hits an API call and **pauses**. Control returns to the event loop.

**20ms** — Request C arrives. The event loop runs its handler, which hits a DB query and **pauses**. Control returns to the event loop.

**The event loop is now checking for events:** Is A's DB response back? Not yet. Is B's API response back? Not yet. Is C's DB response back? Not yet. Keep checking.

**35ms** — A's DB response arrives. The event loop wakes up A's handler, it finishes its work and sends the response. Done.

**45ms** — B's API response arrives. The event loop wakes up B's handler, it finishes and responds. Done.

**55ms** — C's DB response arrives. Same thing.

Three requests, one thread, zero time wasted sitting idle. The thread was doing useful work the entire time — either handling a request or getting ready to handle the next one.

---

## 04 — Blocking vs Non-Blocking I/O

This is the critical distinction that separates async code from sync code. It's also where bugs happen.

**Blocking I/O** — the entire thread freezes until the operation completes:

```python
import time

@app.get("/slow")
async def slow():
    time.sleep(5)          # ← BLOCKS. The entire event loop freezes.
    result = db.query()    # ← BLOCKS. Synchronous DB library.
    return result
```

When `time.sleep(5)` runs, the event loop can't check for anything. It's frozen. Every other connected user is stuck waiting for 5 seconds. Nothing moves.

**Non-blocking I/O** — hands control back to the event loop while waiting:

```python
import asyncio

@app.get("/slow")
async def slow():
    await asyncio.sleep(5)      # ← Non-blocking. Event loop handles other requests.
    result = await db.query()   # ← Non-blocking. Uses async DB driver.
    return result
```

`await asyncio.sleep(5)` doesn't freeze the thread. It tells the event loop: "Wake me up in 5 seconds. Go handle other stuff until then." The event loop says "great" and moves on.

The difference in behavior:

```
Blocking:
  0s          5s
  │───────────│
  Request A   │  ← entire event loop frozen
              ▼
              Request B starts (only now, after 5 full seconds)

Non-blocking:
  0s          5s
  │           │
  Request A starts, awaits sleep
    Request B starts immediately (event loop is free)
      Request C starts immediately (event loop is free)
        ...
  5 seconds later: A wakes up, finishes
```

This is why FastAPI uses `async def`. It's not just syntax — it's what enables the event loop to work.

Same rule applies to database calls:

```python
# Blocking — don't do this in async def
result = db.execute("SELECT ...")

# Non-blocking — use an async driver
result = await db.execute("SELECT ...")
```

---

## 05 — What Happens If You Block the Event Loop?

This is the number one mistake in FastAPI. Easy to make, brutal in production.

If your `async def` endpoint calls any blocking code, the **entire event loop freezes**:

```python
@app.get("/users")
async def get_users():
    time.sleep(2)                        # 💀 2-second freeze
    result = requests.get("https://...")  # 💀 sync HTTP library — blocks
    return result.json()
```

For those 2 seconds, **every connected user waits**. All 1000 of them. The event loop cannot check for any events. New requests can't be accepted. Existing requests can't be resumed. Everything stops.

FastAPI does have a safety net — but only if you use `def` instead of `async def`:

```python
@app.get("/users")
def get_users():           # ← regular def, not async def
    time.sleep(2)          # ← still blocks, but now in a thread pool
    return {"ok": True}
```

When FastAPI sees a regular `def` endpoint (not `async def`), it runs it in a **thread pool** automatically. The blocking call freezes that thread — but not the event loop. The event loop keeps running. Other requests keep getting handled.

The trap is this:

```python
@app.get("/users")
async def get_users():     # ← async def
    time.sleep(2)          # ← blocking call inside async def = disaster
    return {"ok": True}
```

`async def` with blocking code is the worst of both worlds — FastAPI trusts you to not block, runs it on the event loop, and you freeze everything.

**The rule:**
- `async def` + `await` calls → fine
- `async def` + blocking calls → disaster
- `def` + blocking calls → fine (runs in thread pool)
- `def` + `await` → syntax error (can't use await outside async)

---

## 06 — uvloop: The C-Powered Event Loop

Python's built-in event loop — the one in the `asyncio` standard library — is written in pure Python. It works. It's reliable. But it's not the fastest it can be.

Uvicorn swaps it out for **uvloop**.

uvloop is a Python library that reimplements the event loop in C, wrapping **libuv** — the same library that powers Node.js's event loop. You get the same Python `asyncio` API you're already using. You just get it running 2-4x faster.

```python
# You write this — works the same either way
await asyncio.sleep(1)
result = await db.fetch_one(query)
```

Under the hood, uvloop is doing the checking and scheduling in compiled C instead of interpreted Python. Tighter loops, less overhead per event, more throughput.

Uvicorn enables it automatically:

```python
# Inside Uvicorn's startup code (simplified)
import uvloop
uvloop.install()    # replaces asyncio's default loop with uvloop
```

You don't configure anything. You just get a faster event loop for free.

> **Analogy:** Same kitchen, same chef, same recipes. But now the kitchen has better equipment — faster burners, sharper knives, better oven thermostats. The chef works the same way. Everything is just faster.

---

## 07 — The Event Loop Is NOT Parallelism

This is the most important clarification in this whole episode. Easy to confuse, important to keep straight.

**Concurrency** — many tasks in progress at the same time, taking turns:

```
Thread:  [A]──[pause]──[B]──[pause]──[A]──[C]──[pause]──[B]──[A done]
                ↑                        ↑
           A waits for DB           C arrives
```

**Parallelism** — many tasks running at literally the same time, on different CPUs:

```
Core 1:  [A────────────────────────────done]
Core 2:  [B────────────────────────────done]
Core 3:  [C────────────────────────────done]
Core 4:  [D────────────────────────────done]
```

The event loop gives you **concurrency, not parallelism**.

One thread. One CPU core. Tasks take turns. When task A is waiting for the DB, task B runs. When B is waiting for an API call, A gets to continue. They are interleaved, not simultaneous.

This is incredibly useful for I/O-bound work — where most of the time is spent waiting for external systems. While you're waiting for the database, you might as well handle another request. The event loop makes this natural.

But for CPU-bound work — image processing, video encoding, machine learning inference, complex calculations — the event loop doesn't help. The CPU is busy running your code, not waiting. There's nothing to interleave. One task monopolizes the thread and everything else stalls.

```
I/O-bound work:     Event loop = huge win ✓
CPU-bound work:     Event loop = no help  ✗ (need real parallelism)
```

For true parallelism — multiple tasks running on multiple cores simultaneously — you need multiple workers. That's Episode 5.

---

## 08 — Recap

- **Most API work is I/O** — database queries, HTTP calls, file reads. The thread spends most of its time waiting, not computing.

- **A synchronous server blocks** during I/O. One thread per request. 1000 users = 1000 threads = gigabytes of wasted memory.

- **The event loop** is a single thread that never waits. It checks what's ready, runs the handler, moves on. Chef cooking ten dishes — never watching the water boil.

- **Blocking I/O freezes the event loop** — `time.sleep()`, synchronous DB drivers, synchronous HTTP libraries all freeze the entire loop. Every connected user waits.

- **Non-blocking I/O** (`await`) gives control back to the loop. The loop handles other work while waiting for the response to come back.

- **The golden rule:** `async def` with `await` calls = good. `async def` with blocking calls = catastrophic. Regular `def` with blocking calls = FastAPI puts it in a thread pool, which is safe.

- **uvloop** replaces Python's built-in event loop with a C implementation. Same API, 2-4x faster. Uvicorn uses it automatically.

- **The event loop is concurrency, not parallelism.** One thread. Tasks interleave, they don't run simultaneously. For multiple CPU cores, you need multiple workers.

---

*Next up in Episode 4: We'll go one level deeper — into coroutines and `async`/`await` themselves. What does `await` actually do? What is a coroutine? How does Python know where to pause and resume? It's stranger and more elegant than you might expect.*
