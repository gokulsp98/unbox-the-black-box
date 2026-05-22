---
title: "Prompt Caching"
series: "How Claude Code Works"
episode: 5
totalEpisodes: 7
description: "How prefix-based caching works, cache reads vs writes, TTL, and the real cost savings."
tags: ["caching", "prompt caching", "prefix matching", "TTL", "cost optimization"]
author: "Gokul"
---

# Prompt Caching

Episode 4 showed the problem: every request re-sends the full conversation, and costs grow fast. Prompt caching is the first solution — it makes re-processing dramatically cheaper.

---

## 01 — The Key Insight

Here's the insight: when you send message 5, 90% of the tokens are identical to what you sent in message 4. The system prompt, messages 1-4, and all previous responses — they haven't changed. Only the new message at the end is different.

What if the server could recognize "I've already processed these tokens" and skip the expensive computation? That's exactly what prompt caching does.

---

## 02 — How It Works: Prefix Matching

Prompt caching uses **prefix-based matching** — not content hashing, not checksums, not any form of content fingerprinting.

Here's how it works:

1. The server processes your request and computes internal state for each token position
2. These computed states are stored in a cache, keyed by the exact token sequence
3. On the next request, the server checks: does the beginning of this new request match a cached prefix?
4. If yes, it skips recomputation for the matching portion and only processes new tokens at the end

The critical rule: **the match must start from the very beginning.** If even one token at the start differs, the entire cache misses. It's not "find matching chunks anywhere in the conversation" — it's "does the prefix of this request match a cached prefix?"

---

## 03 — Cache Reads vs Cache Writes

There are two cost events:

**Cache write** — the first time tokens are processed. This costs **1.25× the base input price**. You pay slightly MORE the first time because the server also stores the computed results.

**Cache read** — subsequent requests that match the cached prefix. This costs **0.1× the base input price** — a 90% discount.

For Sonnet ($3/MTok base):
- Fresh input: $3.00 / MTok
- Cache write: $3.75 / MTok (1.25×)
- Cache read: $0.30 / MTok (0.1×)

The first request in a conversation is slightly more expensive. But every subsequent request that reuses the same prefix gets a massive discount on the repeated portion.

---

## 04 — TTL: The Cache Expiry Clock

Cached tokens don't live forever. They have a **TTL (Time To Live):**

- **Default: 5 minutes** — if you don't send another request within 5 minutes, the cache expires
- **Each request resets the clock** — every cache hit restarts the 5-minute countdown
- **Extended TTL: 1 hour** — available as a paid option for workloads that need longer gaps between requests

In practice, during an active coding session where you're sending messages every few minutes, the cache stays warm. But if you step away for lunch and come back, you'll pay a fresh cache write.

---

## 05 — A Real Cost Example

Let's revisit the 5-message conversation from Episode 4, now with caching (Sonnet):

**Without caching:**
| Request | Input Tokens | Cost |
|---------|-------------|------|
| Msg 1 | 2,000 (all new) | $0.014 |
| Msg 2 | 4,500 (all new) | $0.027 |
| Msg 3 | 8,300 (all new) | $0.043 |
| Msg 4 | 12,500 (all new) | $0.053 |
| Msg 5 | 16,100 (all new) | $0.063 |
| **Total input** | | **$0.200** |

**With caching:**
| Request | Cache Write | Cache Read | New Input | Cost |
|---------|-----------|-----------|----------|------|
| Msg 1 | 2,000 @ $3.75 | — | — | $0.008 |
| Msg 2 | 2,000 @ $3.75 | 2,500 @ $0.30 | — | $0.008 |
| Msg 3 | 2,000 @ $3.75 | 6,300 @ $0.30 | — | $0.009 |
| Msg 4 | 2,000 @ $3.75 | 10,500 @ $0.30 | — | $0.011 |
| Msg 5 | 2,000 @ $3.75 | 14,100 @ $0.30 | — | $0.012 |
| **Total input** | | | | **$0.048** |

**Savings: ~76% on input costs.** The longer the conversation, the bigger the savings — because more tokens hit the cache.

---

## 06 — What Breaks the Cache

The cache depends on exact prefix matching. These things break it:

- **Any change to the system prompt** — even adding a space
- **Editing or deleting an earlier message** — the prefix changes
- **Timeout** — 5 minutes of inactivity (or 1 hour with extended TTL)
- **Server-side cache eviction** — under high load, caches may be evicted early (rare)

Normal conversation flow — where you keep adding messages at the end — preserves the cache perfectly. The prefix (system prompt + all previous messages) stays identical, and only new content is appended.

---

## RECAP

- **Prompt caching reuses previous computation** — the server recognizes tokens it already processed and skips recomputation.
- **It's prefix-based** — the match must start from the beginning of the request. Any change at the start invalidates the entire cache.
- **Cache writes cost 1.25×** — the first request is slightly more expensive. Cache reads cost 0.1× — a 90% discount on subsequent requests.
- **5-minute default TTL** — each cache hit resets the countdown. Extended 1-hour TTL is available as a paid option.
- **Real savings: ~76%+ on input costs** — the longer the conversation, the bigger the savings. Normal conversation flow naturally preserves the cache.

---

## Next Episode

Caching makes re-processing cheaper. But what happens when the conversation gets so long it doesn't fit in the context window at all? Episode 6 covers compaction — how Claude Code summarizes old messages to keep going.
