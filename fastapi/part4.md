---
title: "Coroutines — How async/await Powers FastAPI"
series: "How FastAPI Works"
episode: 4
totalEpisodes: 7
description: "Every FastAPI endpoint is either async or sync. But what does that actually mean under the hood? This episode breaks down coroutines, how await works step by step, and the one mistake that silently kills your app's performance."
tags: ["fastapi", "async", "await", "coroutines", "asyncio", "event-loop", "concurrency"]
author: "Gokul"
---

# Coroutines — How async/await Powers FastAPI

You've seen the syntax a hundred times:

```python
@app.get("/users/{id}")
async def get_user(id: int):
    user = await db.fetch_user(id)
    return user
```

But what is `async def` actually doing? What happens when Python hits `await`? And why does getting this wrong silently cripple your app under load?

Let's unpack it.

---

## 01 — What Is a Coroutine?

A normal Python function runs start to finish. You call it, it executes every line, it returns. No pauses, no interruptions.

```python
def get_user(id):
    user = db.fetch_user(id)   # waits here — CPU sits idle while DB responds
    return user
```

A **coroutine** is different. It's a function that can *pause itself* midway and say: "I'm waiting for something — let someone else run while I wait. Resume me when my result is ready."

```python
async def get_user(id):
    user = await db.fetch_user(id)   # pauses here — but doesn't block the thread
    return user
```

In Python, any function defined with `async def` is a coroutine. The `async` keyword doesn't make it run faster — it makes it *pauseable*.

> **Analogy:** A normal function is like reading a book from page 1 to the end without stopping. A coroutine is like a bookmark — you can put it down at any page, do something else, and pick it up exactly where you left off.

The critical thing: when a coroutine pauses, the thread is free. Something else can run. This is the entire point.

---

## 02 — How await Works, Step by Step

`await` is the pause button. Let's trace exactly what happens when Python executes it.

```python
async def get_user(id: int):
    print("Starting request")
    user = await db.fetch_user(id)    # <-- await point
    print("Got user:", user.name)
    return user
```

Here's the sequence:

```
1. get_user() starts running
2. Prints "Starting request"
3. Hits: await db.fetch_user(id)
   ↓
4. Coroutine PAUSES — suspends right here
   ↓
5. Control returns to the event loop
   ↓
6. Event loop runs OTHER coroutines (other requests, other tasks)
   ↓
7. DB responds with the result
   ↓
8. Event loop RESUMES get_user() right after the await
   ↓
9. user now holds the result
10. Prints "Got user: Alice"
11. Returns
```

The coroutine doesn't know it was paused. From its perspective, it just called `db.fetch_user(id)` and got a result back. The pause is invisible to the code inside the function.

You can have multiple `await` points in one function — each one is a potential pause:

```python
async def get_dashboard(user_id: int):
    print("Step 1")
    user = await db.get_user(user_id)         # pause #1

    print("Step 2")
    settings = await db.get_settings(user_id) # pause #2

    print("Step 3")
    token = await auth.validate(user)         # pause #3

    return {"user": user, "settings": settings, "token": token}
```

Each `await` is a moment where the event loop can squeeze in work from other requests. The function itself runs top to bottom — it just takes breaks.

> **Analogy:** Imagine you're cooking and you have pasta boiling, a sauce simmering, and garlic bread in the oven. You don't stand in front of each one staring until it's done. You start the pasta, set a timer (`await`), chop vegetables while it boils, check the sauce, set another timer (`await`), stir it. You are one person doing multiple things — not because you work faster, but because you use the waiting time wisely.

---

## 03 — Coroutines vs Threads

There are two ways to handle "waiting": coroutines and threads. They solve the same problem differently.

### Threads

When you use threads, the operating system manages everything. Each thread has its own execution stack — its own memory space where it tracks local variables, call history, and where it's up to.

```
Thread 1: handling request A  ← OS switches between these
Thread 2: handling request B
Thread 3: handling request C
...
Thread N: handling request N
```

The OS decides *when* to switch between threads. This is called **preemptive** scheduling — the OS can interrupt a thread at any point, mid-execution. Threads are independent processes essentially.

The cost: each thread needs its own stack — roughly **8MB of memory** by default on Linux. 1,000 threads = 8GB of memory just for stacks. And context-switching between threads isn't free — the OS has to save and restore state.

### Coroutines

Coroutines run on a single thread. The event loop runs them one at a time. But each coroutine can *voluntarily* pause at `await` points, letting the event loop pick the next one.

```
One thread, one event loop:
  Coroutine A runs → hits await → pauses
  Coroutine B runs → hits await → pauses
  Coroutine C runs → hits await → pauses
  Coroutine A resumes (its result is ready)
  ...
```

You decide when to switch, by choosing where to `await`. This is called **cooperative** scheduling — the coroutines cooperate.

The cost: coroutines are extremely lightweight. A few kilobytes each. No OS involvement, no context-switch overhead.

### Side by Side

| | Threads | Coroutines |
|---|---|---|
| Switching | OS decides (preemptive) | You decide via `await` (cooperative) |
| Memory per unit | ~8MB | ~kilobytes |
| 10,000 units | Crash or severe thrash | Fine |
| Blocking I/O | Each thread waits independently | Blocks the whole event loop |
| Parallel CPU work | Yes (different cores) | No (single thread) |

10,000 threads = your server runs out of memory and grinds to a halt. 10,000 coroutines = completely manageable.

> **Analogy:** Threads are like hiring 10,000 employees and giving each one their own desk, computer, and coffee machine. They all work independently, but you're paying for 10,000 desks. Coroutines are like one very efficient employee with a to-do list who switches tasks whenever they hit a "waiting for reply" moment. Same amount of work gets done, one desk.

Coroutines win for I/O-heavy workloads (databases, HTTP calls, file reads) — which is most web API work.

---

## 04 — `sync def` vs `async def` in FastAPI

FastAPI supports both. And the difference matters more than you think.

### `async def` — runs on the event loop

```python
@app.get("/users/{id}")
async def get_user(id: int):
    user = await db.get_user(id)   # async DB driver (asyncpg, motor, etc.)
    return user
```

FastAPI runs this directly on the event loop. The `await` calls let the loop do other work during I/O. This is the high-performance path.

The rule: if you use `async def`, every I/O call inside it must be `await`-ed with an async library. No exceptions.

### `def` — runs in a thread pool

```python
@app.get("/users/{id}")
def get_user(id: int):
    user = db.get_user(id)   # sync DB driver (psycopg2, SQLAlchemy default, etc.)
    return user
```

FastAPI detects that this is a regular function (no `async`). It automatically runs it in a **thread pool** via `run_in_executor`. The function gets its own thread, so blocking calls are fine — they block that thread, not the event loop.

This is FastAPI being smart. It doesn't force you into async-everything.

### When to use which

```
You have async libraries (asyncpg, httpx, aiofiles, motor)?
  → use async def

You have sync libraries (psycopg2, requests, SQLAlchemy sync)?
  → use def

You have mixed? → separate them, or use run_in_executor manually
```

> **Analogy:** `async def` is like a chef who can multitask — they start a dish, let it simmer (`await`), and work on another while waiting. `def` is like a chef in a separate kitchen — they can take as long as they need because they're not blocking the main kitchen at all.

---

## 05 — Multiple Awaits in One Request

A single endpoint can do multiple I/O operations. Each `await` is a chance for the event loop to breathe.

### Sequential awaits

```python
@app.get("/dashboard/{user_id}")
async def get_dashboard(user_id: int):
    user = await db.get_user(user_id)           # pause, resume
    orders = await db.get_orders(user_id)       # pause, resume
    notifications = await get_notifications()   # pause, resume
    return {"user": user, "orders": orders, "notifications": notifications}
```

Three I/O calls. At each `await`, other requests get to run. The event loop is never blocked. But these three calls happen **one after another** — total time is roughly the sum of all three.

### Parallel awaits with `asyncio.gather`

If those three calls don't depend on each other, run them at the same time:

```python
import asyncio

@app.get("/dashboard/{user_id}")
async def get_dashboard(user_id: int):
    user, orders, notifications = await asyncio.gather(
        db.get_user(user_id),
        db.get_orders(user_id),
        get_notifications()
    )
    return {"user": user, "orders": orders, "notifications": notifications}
```

`asyncio.gather` fires all three coroutines concurrently. They all start, all hit their own `await` points, and all wait for their I/O in parallel.

```
Sequential:   [user: 50ms] → [orders: 80ms] → [notifs: 30ms] = 160ms total
Parallel:     [user: 50ms]
              [orders: 80ms]   all running at once
              [notifs: 30ms]
              ──────────────── = 80ms total (slowest one wins)
```

Same three DB calls. Half the total time.

> **Analogy:** Sequential is like calling three friends one after another — call Alice, hang up, call Bob, hang up, call Carol. Parallel is like sending all three a text at once and waiting for whoever replies last. Same information, much less waiting.

---

## 06 — The #1 Mistake: `async def` + Blocking Code

This is the most common async mistake in FastAPI, and it's silent. No error, no warning — just a server that freezes under load.

### The antipattern

```python
@app.get("/bad")
async def bad_endpoint():
    time.sleep(5)                                  # BLOCKS the entire event loop!
    result = requests.get("https://api.example.com")  # BLOCKS again!
    return result.json()
```

`time.sleep(5)` doesn't pause the coroutine — it freezes the **entire thread**. The event loop can't run anything else. Every other request is stuck waiting for those 5 seconds.

`requests.get(...)` is a synchronous HTTP call. It blocks the thread until the response arrives — same problem.

You've taken a single-threaded event loop and made it act like a bottleneck. 100 users hit this endpoint at the same time → 100 requests queued up → each waits for all the ones before it.

### The correct version

```python
@app.get("/good")
async def good_endpoint():
    await asyncio.sleep(5)                             # pauses the coroutine, not the thread
    async with httpx.AsyncClient() as client:
        result = await client.get("https://api.example.com")  # non-blocking HTTP
    return result.json()
```

`asyncio.sleep(5)` pauses *this coroutine* and lets the event loop handle other requests during those 5 seconds. `httpx` is an async HTTP client — `await client.get(...)` does the same.

The rule of thumb:

```
In async def:
  time.sleep(n)     → asyncio.sleep(n)
  requests.get(url) → httpx.AsyncClient().get(url)
  open("file")      → aiofiles.open("file")
  psycopg2 queries  → asyncpg queries

If you must use a blocking library in async def:
  → move it to a def endpoint instead, let FastAPI thread-pool it
  → or wrap it: await run_in_executor(None, blocking_func)
```

> **Analogy:** `time.sleep` in an `async def` is like the one employee with the to-do list deciding to take a nap instead of switching tasks. Everyone else on the list is frozen until they wake up.

---

## 07 — How FastAPI Knows What to Do

When a request comes in, FastAPI inspects your endpoint function before calling it:

```
Request arrives for GET /users/42
           ↓
FastAPI finds the handler function
           ↓
Is it async def?
  YES → run directly on the event loop
          ↓ await-able, plays nice with asyncio
  NO  → run in a thread pool (run_in_executor)
          ↓ gets its own thread, blocking is safe
```

The thread pool FastAPI uses is `anyio`'s default thread pool — a managed pool of OS threads. Your sync handler runs there, the event loop keeps humming.

This is why both patterns work out of the box:

```python
# FastAPI runs this on the event loop
@app.get("/async-endpoint")
async def async_endpoint():
    data = await some_async_db.fetch()
    return data

# FastAPI runs this in a thread pool
@app.get("/sync-endpoint")
def sync_endpoint():
    data = some_sync_db.fetch()   # blocks its own thread, nothing else is affected
    return data
```

FastAPI handles the routing decision automatically. But the *responsibility* of using the right libraries in the right kind of function is yours.

```
async def + async library  ✓  Fast, correct
def       + sync library   ✓  Correct, slightly more memory (thread per request)
def       + async library  ✓  Works, but you lose the async benefit
async def + sync library   ✗  Looks fine, kills performance under load
```

---

## 08 — Recap

- A **coroutine** is a function defined with `async def` that can pause and resume at `await` points
- `await` suspends the coroutine and gives control back to the event loop — other coroutines run while it waits
- **Coroutines** are lightweight (kilobytes each) and cooperative. **Threads** are heavier (8MB each) and preemptive
- FastAPI runs `async def` handlers on the event loop and `def` handlers in a thread pool automatically
- Use `async def` with async libraries (`asyncpg`, `httpx`, `aiofiles`). Use `def` with sync libraries (`psycopg2`, `requests`)
- `asyncio.gather()` runs multiple coroutines concurrently — total time equals the slowest one, not the sum
- **The #1 mistake:** calling blocking code (`time.sleep`, `requests.get`) inside `async def` — it freezes the entire event loop with no error
- The fix: use async equivalents, or move blocking code to a `def` handler

---

Up next: **Episode 5 — Workers and Processes**. You've seen how one worker handles many requests concurrently with async. But what happens when you spin up multiple workers? How do they share memory (spoiler: they don't), how does Gunicorn decide which worker handles which request, and what does this mean for things like caches and background state? Let's look inside the process model.
