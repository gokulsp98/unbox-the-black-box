---
title: "What is Claude Code?"
series: "How Claude Code Works"
episode: 2
totalEpisodes: 7
description: "Claude model tiers, pricing, context windows, and how Claude Code differs from the web app."
tags: ["Claude", "Claude Code", "Opus", "Sonnet", "Haiku", "pricing"]
author: "Gokul"
---

# What is Claude Code?

You know what an LLM is and how tokens work. Now let's look at the specific model you're using — Claude — and the tool that puts it in your terminal.

---

## 01 — The Claude Model Family

Claude isn't one model — it's a family of models, each built for different needs. Think of them as tiers:

**Claude Opus 4.7** — The most capable model. Best at complex reasoning, nuanced writing, and hard coding tasks. Slower and more expensive, but the highest quality.

**Claude Sonnet 4.6** — The balanced model. Fast, capable, and cost-effective. The default for most tasks — strong enough for nearly everything, at a fraction of Opus's cost.

**Claude Haiku 4.5** — The fastest model. Optimized for speed and low cost. Great for simple tasks, classification, and high-volume use cases where you need quick responses.

### At a Glance

| | Opus 4.7 | Sonnet 4.6 | Haiku 4.5 |
|---|---|---|---|
| **Speed** | Slowest | Fast | Fastest |
| **Quality** | Highest | High | Good |
| **Cost** | $$$  | $$ | $ |
| **Context Window** | 1M tokens | 1M tokens | 200K tokens |
| **Best For** | Complex tasks | General use | Simple/fast tasks |

---

## 02 — What Things Cost

Every API call costs money, measured in tokens. Here's the pricing per million tokens:

**Opus 4.7**
- Input: $5.00 / MTok
- Cache read: $0.50 / MTok
- Output: $25.00 / MTok

**Sonnet 4.6**
- Input: $3.00 / MTok
- Cache read: $0.30 / MTok
- Output: $15.00 / MTok

**Haiku 4.5**
- Input: $0.80 / MTok
- Cache read: $0.08 / MTok
- Output: $4.00 / MTok

Output tokens cost 5× more than input tokens. Why? Generating new text (output) requires the model to run its full prediction cycle for every single token. Processing input is comparatively cheaper — the model reads it all at once in a single forward pass.

> **What's "Cache read"?** When the same conversation prefix is sent again, Anthropic's servers can reuse previously computed results instead of reprocessing from scratch. Cache reads cost ~10× less than fresh input. We'll cover this in detail in Episode 5.

---

## 03 — Context Windows

The **context window** is the maximum amount of text the model can "see" at once — your messages, its responses, system instructions, file contents, everything combined.

- **Opus 4.7:** 1,000,000 tokens (~750,000 words)
- **Sonnet 4.6:** 1,000,000 tokens (~750,000 words)
- **Haiku 4.5:** 200,000 tokens (~150,000 words)

1 million tokens is enormous — roughly 10 full novels, or thousands of code files. But in practice, Claude Code conversations fill up faster than you'd think. Every message, every file read, every tool result accumulates. We'll explore this problem in Episodes 4 and 6.

---

## 04 — What is Claude Code?

Claude Code is a **command-line tool** that puts Claude directly in your terminal. Instead of copy-pasting code into a web chat, Claude Code can:

- **Read your files** — it sees your actual codebase
- **Edit your files** — it writes changes directly
- **Run commands** — it executes terminal commands and reads the output
- **Search your codebase** — it finds relevant code across your project
- **Use git** — it creates commits, branches, and pull requests

The key difference from the web app: Claude Code gives the model **tools**. On the web, Claude can only read what you paste and respond with text. In Claude Code, the model can take actions — read files, write code, run tests, check git status.

### Starting Claude Code

```
claude
```

That's it. Just type `claude` in your terminal. It starts an interactive session where you can type requests and Claude responds — reading files, editing code, and running commands as needed.

### Resuming a Session

```
claude -r
```

This shows your recent sessions and lets you pick one to resume. Sessions persist locally so you can continue where you left off.

---

## 05 — The Interface Changes, Not the Intelligence

This is worth repeating because it's the most common misconception:

Claude Code does **not** use a different model than claude.ai. It uses the exact same Claude model. The difference is entirely in what surrounds the model:

**claude.ai (web):**
- You type text, it responds with text
- You can paste code or upload files
- No access to your file system

**Claude Code (terminal):**
- Same model, same intelligence
- Plus: access to your files, terminal, and git
- The model receives a system prompt with tool definitions
- When it needs to read a file, it "calls" a tool — Claude Code executes it locally and sends the result back

Under the hood, Claude Code is an API client. It sends your conversation to the Claude API, receives the model's response, and if the model wants to use a tool (like reading a file), Claude Code executes that tool locally and sends the result back. The model never directly touches your computer.

---

## RECAP

- **Three model tiers** — Opus (most capable, $5/$25 per MTok), Sonnet (balanced, $3/$15), Haiku (fastest, $0.80/$4). Output always costs 5× more than input.
- **Context windows** — Opus and Sonnet handle 1M tokens; Haiku handles 200K. That's the total conversation capacity.
- **Claude Code is a CLI tool** — it gives the same Claude model access to your files, terminal, and git. Start with `claude`, resume with `claude -r`.
- **Same model, different tools** — the web app and Claude Code use identical intelligence. The difference is the interface and available tools.

---

## Next Episode

You know what Claude is and how Claude Code works at a high level. But what happens when you actually send a message? Episode 3 traces the full journey — from your keystroke to the response appearing in your terminal.
