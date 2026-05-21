---
title: "FastAPI's Magic — Routing, Validation & Docs"
series: "How FastAPI Works"
episode: 6
totalEpisodes: 7
description: "Uvicorn handles the HTTP, the event loop handles concurrency — but what does FastAPI itself actually do? Here's how routing, Pydantic validation, dependency injection, and auto-generated docs work under the hood."
tags: ["fastapi", "pydantic", "routing", "validation", "dependency-injection", "openapi", "middleware"]
author: "Gokul"
---

# FastAPI's Magic — Routing, Validation & Docs

By now you know how Uvicorn listens for HTTP, how the event loop juggles thousands of requests, and how workers give you parallelism across CPU cores. All of that is the plumbing.

Now let's talk about what FastAPI actually does — what it adds on top of that plumbing, and why it's genuinely different from older Python frameworks.

---

## 01 — What FastAPI Actually Does

When a request arrives, Uvicorn has already done the hard part: parsed the raw HTTP bytes, created the ASGI scope dict, and handed it off. At that point, FastAPI takes over.

FastAPI sits on top of **Starlette** (which handles routing, middleware, and request/response objects) and adds three things that Starlette doesn't give you:

1. **Automatic validation from type hints** — You write `user_id: int` and FastAPI ensures the value is an integer before your function ever runs. Wrong type? 422 error, automatically.
2. **Dependency injection** — You write `Depends(get_current_user)` and FastAPI runs that function first, resolves its result, and passes it to your endpoint. Dependencies can depend on other dependencies.
3. **Auto-generated API docs** — FastAPI reads your routes, type hints, and models, then generates a live Swagger UI at `/docs` and ReDoc at `/redoc`. Zero extra code.

These three features are why FastAPI exists. Starlette is fast and clean, but you'd have to build validation, dependency resolution, and doc generation yourself. FastAPI does all three for you, and it does them at declaration time — from the exact same type hints you'd write anyway.

> **Analogy:** Think of Starlette as a well-built car engine. It runs, it's efficient, but you still need to add the dashboard, GPS, and safety systems. FastAPI is the full car — the engine is Starlette, but the things that make it usable day-to-day are what FastAPI adds on top.

---

## 02 — Routing — How FastAPI Finds Your Function

When your FastAPI app starts up, every decorated function gets registered as a route:

```python
from fastapi import FastAPI

app = FastAPI()

@app.get("/users/{user_id}")
async def get_user(user_id: int):
    return {"user_id": user_id}
```

That `@app.get(...)` call isn't magic — it calls Starlette's router and registers an entry that maps `GET + /users/{user_id}` to your function. FastAPI wraps Starlette's router and adds its own metadata on top (validation rules, response model, doc strings).

When a request comes in:

```
Incoming request: GET /users/42

Router scans registered routes:
  GET  /health         → no match
  POST /users          → wrong method
  GET  /users/{user_id} → MATCH

Path parameter extracted: user_id = "42" (still a string at this point)
```

Starlette handles the actual pattern matching — including extracting path parameters from `{user_id}` segments. FastAPI then takes the extracted values and runs them through validation before passing them to your function.

The router is built once at startup. There's no scanning on every request — it compiles the route table into an efficient lookup structure so matching is fast.

---

## 03 — Pydantic — Validation From Type Hints

This is the centerpiece of FastAPI. Let's understand exactly what happens.

You define a model using **Pydantic**:

```python
from pydantic import BaseModel

class Item(BaseModel):
    name: str
    price: float
    in_stock: bool
```

And use it in an endpoint:

```python
@app.post("/items")
async def create_item(item: Item):
    return item
```

When a request hits `POST /items`, here's what happens before your function runs:

```
Request body (raw JSON):
{
  "name": "Widget",
  "price": "9.99",    ← this is a string, not a float
  "in_stock": true
}

Pydantic receives this dict and tries to construct Item(...)

"price" is str — Pydantic coerces "9.99" → 9.99 (float) ✓
"name"  is str — already correct ✓
"in_stock" is bool — already correct ✓

Item constructed successfully → passed to your function
```

Pydantic is lenient where it can be. A string `"9.99"` becomes a float `9.99`. A string `"true"` becomes a boolean `True`. These are safe coercions — the type is wrong but the meaning is unambiguous.

Now try sending something that can't be coerced:

```
Request body:
{
  "name": "Widget",
  "price": "not-a-number",
  "in_stock": true
}

Pydantic tries: float("not-a-number") → fails

FastAPI catches the validation error
Your function is NEVER called
Response returned immediately:
```

```json
HTTP 422 Unprocessable Entity

{
  "detail": [
    {
      "type": "float_parsing",
      "loc": ["body", "price"],
      "msg": "Input should be a valid number, unable to parse string as a number",
      "input": "not-a-number"
    }
  ]
}
```

The 422 is generated by FastAPI's exception handler. It tells the caller exactly what's wrong and where — field name, location (body/query/path), and why it failed. Your function never ran.

This is the key insight: **validation is a gate, not a check inside your function.** You don't write `if not isinstance(price, float): raise ...` — Pydantic does it before you even see the request.

---

## 04 — Path Params, Query Params, Request Body

FastAPI decides where each piece of data comes from based entirely on your function signature. You don't decorate parameters or use special wrappers — you just write a normal function and FastAPI figures it out.

The rules:

| Source | How FastAPI recognizes it |
|---|---|
| **Path parameter** | Name appears in the path string: `"/users/{user_id}"` |
| **Query parameter** | Function param not in the path and not a Pydantic model |
| **Request body** | Parameter is a Pydantic `BaseModel` subclass |

Here's a single endpoint that uses all three:

```python
from pydantic import BaseModel

class ItemUpdate(BaseModel):
    name: str
    price: float

@app.put("/users/{user_id}/items/{item_id}")
async def update_item(
    user_id: int,          # ← path param (in URL)
    item_id: int,          # ← path param (in URL)
    notify: bool = False,  # ← query param (?notify=true)
    item: ItemUpdate,      # ← request body (JSON)
):
    return {
        "user_id": user_id,
        "item_id": item_id,
        "notify": notify,
        "item": item,
    }
```

A request to `PUT /users/3/items/7?notify=true` with a JSON body of `{"name": "Gadget", "price": 19.99}` maps like this:

```
URL path    → user_id = 3, item_id = 7
Query string → notify = True
JSON body   → item = ItemUpdate(name="Gadget", price=19.99)
```

All four parameters are validated, coerced to the right types, and passed to your function. If any fail, you get a 422 with the exact field and reason.

> **Analogy:** Think of your function signature as a form. FastAPI reads the form, sees which fields are labeled "from the URL," which are "from the query string," and which are "from the body," and fills each one in from the right place. You write the form once; FastAPI does the filling.

---

## 05 — Dependency Injection — `Depends()` Explained

Dependencies solve a common problem: some logic needs to run before your endpoint, every time, and you don't want to copy-paste it everywhere.

A dependency is just a function. You tell FastAPI to run it first with `Depends()`:

```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

bearer_scheme = HTTPBearer()

async def get_current_user(token = Depends(bearer_scheme)):
    # token.credentials is the raw JWT string
    user = verify_jwt(token.credentials)
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid token")
    return user

@app.get("/me")
async def get_profile(current_user = Depends(get_current_user)):
    return {"user": current_user}
```

When a request hits `GET /me`:

```
FastAPI sees: current_user = Depends(get_current_user)

Before calling get_profile, FastAPI runs get_current_user first.
  get_current_user itself Depends(bearer_scheme) — runs that first.
    bearer_scheme extracts Authorization header → returns token object
  get_current_user verifies the JWT → returns user dict
FastAPI passes user dict as current_user into get_profile.
get_profile runs with current_user already resolved.
```

This is the dependency tree: FastAPI walks the `Depends()` chain, resolves them from the bottom up, and passes results upward. A dependency that raises an `HTTPException` short-circuits everything — your endpoint never runs.

Dependencies aren't limited to authentication. Common uses:

- **Database sessions** — Open a session before the endpoint, close it after (using `yield`)
- **Current user** — Extract and validate identity from a token
- **Pagination params** — Parse `page` and `size` query params once, reuse across dozens of endpoints
- **Feature flags** — Check config before allowing access

```python
async def get_db():
    db = SessionLocal()
    try:
        yield db          # ← yields the session to the endpoint
    finally:
        db.close()        # ← always runs after the endpoint returns

@app.get("/users")
async def list_users(db = Depends(get_db)):
    return db.query(User).all()
```

The `yield`-based dependency is FastAPI's answer to resource management — acquire before, release after, guaranteed.

> **Analogy:** Dependencies are like mise en place in cooking. Before the chef starts cooking (your function), the kitchen has already chopped the vegetables, measured the spices, and pre-heated the oven (dependencies ran). The chef just cooks. If any prep step fails — out of an ingredient, wrong temperature — the dish never gets made.

---

## 06 — Auto-Generated OpenAPI Docs

One of the most impressive things FastAPI does is generate complete API documentation with zero extra code.

Start any FastAPI app and visit `/docs` — you get a live Swagger UI. Visit `/redoc` — you get ReDoc. Both are generated from a single JSON file at `/openapi.json`.

FastAPI builds that JSON at startup by inspecting every registered route:

```
For each route, FastAPI reads:
  - HTTP method (GET, POST, PUT, DELETE...)
  - URL path and path parameters
  - Function parameters and their types
  - Pydantic models (for request bodies and responses)
  - Docstrings (become descriptions in the docs)
  - response_model (if specified)
  - status_code (if specified)
```

Here's what that looks like in practice:

```python
class UserResponse(BaseModel):
    id: int
    name: str
    email: str

@app.get(
    "/users/{user_id}",
    response_model=UserResponse,
    status_code=200,
    summary="Get a user by ID",
    tags=["users"],
)
async def get_user(user_id: int):
    """
    Retrieve a single user by their unique ID.

    - **user_id**: The integer ID of the user to fetch
    """
    return fetch_user_from_db(user_id)
```

The docs know:
- `user_id` is a required integer in the path
- The response is a `UserResponse` object with `id`, `name`, `email`
- The endpoint is grouped under the "users" tag
- The description comes from the docstring
- The success status code is 200
- Validation errors return 422 (FastAPI adds this automatically)

The Swagger UI at `/docs` lets you send real requests directly from the browser — fill in the form, hit Execute, see the response. It's a live client that auto-builds itself from your code.

This is not cosmetic. It means your code and your docs can never drift apart — they're the same thing. The type hints that drive validation also drive the documentation.

---

## 07 — Middleware — The Pipeline Before Your Function

Middleware is code that runs for every request, before routing even happens. It wraps the entire request/response cycle.

```python
from fastapi.middleware.cors import CORSMiddleware
import time

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://myapp.com"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Custom timing middleware
@app.middleware("http")
async def add_timing_header(request, call_next):
    start = time.time()
    response = await call_next(request)   # ← runs the rest of the stack
    duration = time.time() - start
    response.headers["X-Process-Time"] = str(duration)
    return response
```

Middleware forms a pipeline — each layer wraps the next one. The outermost middleware runs first on the way in and last on the way out:

```
Request →  Timing middleware (start timer)
        →  CORS middleware (check origin, add headers)
        →  Router + your endpoint
        ←  CORS middleware (nothing more to do)
        ←  Timing middleware (stop timer, add header)
Response
```

The `call_next(request)` line hands control to the next middleware (or the router). Everything before it runs on the way in; everything after runs on the way out.

Starlette implements the middleware pipeline — FastAPI inherits it and lets you plug in as many layers as you need. Common middleware: CORS headers, request logging, auth checks, response compression, rate limiting.

One thing to be aware of: middleware runs on every request, including static files, the `/docs` endpoint, and health checks. Keep middleware lean.

---

## 08 — The Full FastAPI Request Pipeline

Here's everything in one picture. A request comes in and travels through every layer we've covered:

```
Request arrives at Uvicorn
  │
  ▼
Middleware pipeline (inbound)
  ├── Timing: record start time
  ├── CORS: check Origin header, set response headers
  └── Any other middleware, in order added
  │
  ▼
Starlette router
  ├── Match URL path + HTTP method
  └── Extract path parameters (still raw strings)
  │
  ▼
FastAPI dependency resolution
  ├── Walk the Depends() tree bottom-up
  ├── Run each dependency function in order
  ├── Any dependency raises HTTPException → stop here, return error
  └── Pass resolved values upward
  │
  ▼
Pydantic validation (input)
  ├── Coerce path params to declared types (str "42" → int 42)
  ├── Parse query params with defaults
  ├── Deserialize + validate request body against Pydantic model
  └── Any validation failure → 422, stop here, return error
  │
  ▼
Your function runs
  └── Returns a value (dict, Pydantic model, list, etc.)
  │
  ▼
Pydantic validation (output)
  └── If response_model is set: validate and filter return value
  │
  ▼
FastAPI serializes to JSON
  └── Sets Content-Type, status code
  │
  ▼
Middleware pipeline (outbound)
  ├── CORS: nothing left to do
  └── Timing: compute duration, add X-Process-Time header
  │
  ▼
Uvicorn sends HTTP response
```

Each layer has one job and hands off to the next. If any layer raises an exception it knows how to handle (validation error, HTTP exception), the pipeline short-circuits and returns an error response. Uvicorn handles the actual bytes in and out. Your function only ever sees clean, validated, typed Python objects.

---

## Recap — What We Learned

- **FastAPI adds three things on top of Starlette**: automatic validation from type hints, dependency injection, and auto-generated OpenAPI docs.
- **Routing** is handled by Starlette's router — compiled once at startup, efficient at runtime. FastAPI wraps it with validation metadata.
- **Pydantic validates before your function runs** — wrong type → 422 with a detailed error, zero boilerplate in your code.
- **FastAPI knows where data comes from** based on your function signature: path params match URL segments, query params are everything else, Pydantic models come from the request body.
- **`Depends()`** lets you declare reusable logic that runs before your endpoint — database sessions, auth checks, shared config. Dependencies can chain; FastAPI resolves the whole tree.
- **`/docs` and `/redoc` are free** — FastAPI generates OpenAPI JSON from your routes and type hints at startup. Your code is your documentation.
- **Middleware wraps every request** — runs before routing on the way in, after your function on the way out. Starlette implements the pipeline; FastAPI inherits it.
- The full pipeline is: **Middleware → Router → Dependencies → Validation → Your function → Output validation → Middleware → Response**.

---

*Next up in Episode 7: The full production stack — how a real FastAPI deployment looks from DNS to database, where Kubernetes, reverse proxies, and connection pools fit in, and what actually breaks at scale.*
