---
title: "Why AI Gets Expensive"
series: "How Claude Code Works"
episode: 4
totalEpisodes: 7
description: "The full-history-every-request problem, token accumulation, and the real cost math of AI conversations."
tags: ["cost", "tokens", "pricing", "API", "accumulation"]
author: "Gokul"
---

# Why AI Gets Expensive

You now know that every API request sends the full conversation history. Let's see what that actually costs — and why costs grow faster than you'd expect.

---

## 01 — The Accumulation Problem

Remember from Episode 3: every message re-sends everything. That means the tokens you're paying for accumulate with every request.

Let's trace a simple 5-message conversation using Sonnet ($3 input / $15 output per MTok):

| Request | What's Sent | Input Tokens | New Output | Total Cost So Far |
|---------|------------|-------------|-----------|------------------|
| 1 | system + msg 1 | 2,000 | 500 | $0.014 |
| 2 | system + msg 1 + resp 1 + msg 2 | 4,500 | 800 | $0.039 |
| 3 | everything + msg 3 | 8,300 | 1,200 | $0.081 |
| 4 | everything + msg 4 | 12,500 | 600 | $0.128 |
| 5 | everything + msg 5 | 16,100 | 1,000 | $0.191 |

Notice the pattern: by message 5, you're sending 16,100 input tokens — even though the total new content added is far less. You're paying to re-process the same old messages every time.

---

## 02 — Output Tokens Cost 5× More

Output tokens are the expensive ones. Every output token requires the model to run its full prediction cycle — one forward pass through the entire neural network.

Input tokens are processed in a single batch — the model reads them all at once. Output tokens are generated one at a time, sequentially.

For Sonnet: $3 per MTok input vs $15 per MTok output. That 5× multiplier adds up fast when the model writes long code blocks or detailed explanations.

---

## 03 — Real-World Example: A Coding Session

Let's trace a realistic 30-minute coding session with Claude Code using Sonnet:

1. You ask Claude to fix a bug (2K tokens sent, 500 tokens generated)
2. Claude reads 3 files (tool calls add ~6K tokens of file content)
3. Claude explains the bug and proposes a fix (1.5K output)
4. You say "yes, do it" — but the full history (10K+) gets re-sent
5. Claude edits files, runs tests (more tool calls, more tokens)
6. Repeat for 10-15 exchanges

By message 15, each request might be sending 50K-100K input tokens. At $3/MTok, that's $0.15-$0.30 per message just for input — plus output costs.

A full coding session can easily cost $2-$10, depending on conversation length and how many files are read.

---

## 04 — Why This Design Exists

This seems inefficient. Why pay to re-process old messages every time?

The answer goes back to how LLMs work: the model needs to "see" the full conversation to generate a coherent response. It can't just read the new message — without context, it wouldn't know what you've been working on, what files have been discussed, or what approach was agreed upon.

The stateless design is a deliberate tradeoff: simpler servers, easier scaling, and user privacy — in exchange for higher per-request costs.

But there's a solution. Two solutions, actually — and they're the subjects of the next two episodes:

1. **Prompt caching** (Episode 5) — don't re-compute tokens you've already processed
2. **Compaction** (Episode 6) — summarize old messages to reduce token count

---

## RECAP

- **Tokens accumulate** — each request re-sends everything, so input token count grows with every message.
- **Output costs 5×** — generating text is 5× more expensive than reading it, because each output token requires a separate forward pass.
- **Real sessions cost $2-$10** — a 30-minute coding session with file reads and edits adds up fast.
- **Two solutions exist** — prompt caching (pay less for repeated tokens) and compaction (send fewer tokens). Both coming in the next episodes.

---

## Next Episode

The accumulation problem is real — but there's a clever solution. What if the server could remember tokens it already processed and skip the work? That's prompt caching, and it changes the math entirely.
