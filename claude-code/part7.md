---
title: "The Complete Picture"
series: "How Claude Code Works"
episode: 7
totalEpisodes: 7
description: "Putting it all together — the full lifecycle of a Claude Code conversation, from first message to compaction and beyond."
tags: ["lifecycle", "architecture", "optimization", "summary"]
author: "Gokul"
---

# The Complete Picture

You've seen each piece individually: tokens, sessions, the request flow, costs, caching, and compaction. This final episode connects them all into one complete picture.

---

## 01 — The Normal Flow

Here's what happens during a typical Claude Code conversation, message by message:

**Message 1 (Cold Start):**
1. You type a message in the terminal
2. Claude Code packages it with the system prompt and tool definitions
3. The full payload is sent to the API server
4. Server tokenizes the input, processes all tokens, generates a response
5. Server writes a **cache** of the processed tokens (cache write: 1.25× cost)
6. Response streams back to your terminal
7. Claude Code saves the exchange to the local session file

**Message 2 (Cache Warm):**
1. You type your next message
2. Claude Code packages the system prompt + message 1 + response 1 + message 2
3. Server receives the payload and checks: does the prefix match a cached entry?
4. **Cache hit** — the system prompt + message 1 + response 1 are already cached
5. Server skips recomputation for cached tokens (cache read: 0.1× cost)
6. Server processes only the new tokens at the end
7. Cache extends to include the new tokens (cache write on the new portion)
8. Response streams back, session file updated

**Messages 3-N (Steady State):**
- Same pattern repeats. The cached prefix grows with each message.
- Each request re-sends everything, but only the new portion costs full price.
- The 5-minute TTL resets with each request, keeping the cache warm.

---

## 02 — When Compaction Kicks In

As the conversation grows, tokens accumulate. At some point, the context approaches the model's limit:

**Approaching the Limit (~95% full):**
1. Claude Code monitors the token count of the conversation
2. Token count crosses the ~95% threshold (e.g., ~950K of 1M tokens)
3. Claude Code triggers compaction

**Compaction Process:**
1. The conversation is sent to the API with a summarization instruction
2. The server generates a concise summary of older messages
3. Old messages are replaced with the summary
4. Recent messages are preserved in full

**After Compaction:**
1. The conversation continues with the summary + recent messages
2. Token count drops dramatically (e.g., from 950K to ~60K)
3. The prompt cache is **invalidated** — the token sequence has changed
4. The next request triggers a fresh cache write
5. The cache warms up again as new messages are added
6. The cycle continues until compaction is needed again

---

## 03 — Cache and Compaction Working Together

Cache and compaction are complementary — they solve different problems:

| | Prompt Caching | Compaction |
|---|---|---|
| **Problem it solves** | Expensive re-processing | Running out of space |
| **How it works** | Skip computation for repeated tokens | Summarize old messages |
| **When it activates** | Every request (after the first) | At ~95% context capacity |
| **Effect on cost** | Reduces cost by ~76%+ | Resets token count |
| **Side effect** | None — fully transparent | Loses detail from old messages |

**The interaction:** Compaction invalidates the cache. Right after compaction, you're back to a cold start — the next request pays full cache-write cost. But because compaction drastically reduces token count, the cache-write cost is much lower than it would have been. The cache then warms up quickly as the conversation continues.

---

## 04 — The Full Lifecycle

Putting it all together, a long Claude Code session looks like this:

1. **Cold start** — first message, full processing, cache write
2. **Warm phase** — cache hits on every request, costs stay low
3. **Growth** — token count climbs as conversation grows
4. **Compaction** — at ~95% full, old messages are summarized
5. **Cache reset** — cache invalidated, fresh cache write
6. **Warm phase again** — cache rebuilds, costs drop again
7. **Repeat** — the cycle continues as long as the session lasts

Each cycle of "warm → compact → warm again" lets you have conversations that far exceed the context window. Without compaction, you'd be hard-limited to one million tokens of total conversation. With it, sessions can run indefinitely — though detail from early messages fades with each compaction.

---

## 05 — Optimization Tips

Understanding these mechanics lets you work more efficiently:

**Keep the cache warm:**
- Send messages at least every 5 minutes during active work
- If you step away, know that you'll pay a fresh cache write when you return
- This is automatic — just keep working naturally

**Reduce token accumulation:**
- Ask Claude to read only the parts of files you need, not entire files
- Avoid repeatedly reading the same large files
- Use targeted searches instead of broad file reads

**Work with compaction, not against it:**
- Important context should be restated, not assumed from early messages
- If Claude seems to "forget" something after a long session, it was likely compacted
- Starting a new session for a new task is sometimes better than continuing a long one

**Manage costs:**
- Most of your cost is input tokens (re-sent conversation history)
- Prompt caching reduces this by ~76%+ automatically
- Output tokens cost more per token but are a smaller share of total
- Shorter, focused sessions cost less than long, wandering ones

---

## RECAP — The Complete Series

Over seven episodes, we've covered how Claude Code actually works:

1. **LLMs predict the next token** — one token at a time, choosing from probability distributions. Claude is one model, not separate text/code versions.

2. **Claude Code is a CLI tool** — it wraps the Claude API with file access, command execution, and session management. The model behind it is the same Claude.

3. **Sessions are local, the server is stateless** — your conversation history lives in local JSONL files. Every request re-sends the full history because the server doesn't remember previous requests.

4. **Costs grow with conversation length** — because the full history is re-sent every time, input token costs accumulate with each message. This is the fundamental cost driver.

5. **Prompt caching makes re-processing cheap** — prefix-based matching lets the server skip computation for tokens it's already processed. Cache reads cost 0.1× the base price — a 90% discount.

6. **Compaction prevents overflow** — when the context window fills up, old messages are summarized to free space. This loses detail but keeps the conversation going.

7. **It all works together** — caching and compaction form a cycle: cache warms up, conversation grows, compaction resets both, and the cycle repeats.

---

## Next Episode

This is the final episode of "How Claude Code Works." You now understand the complete lifecycle — from the moment you type a message to how costs are managed and conversations extend beyond context limits.
