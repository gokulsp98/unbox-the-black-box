---
title: "Context Limits & Compaction"
series: "How Claude Code Works"
episode: 6
totalEpisodes: 7
description: "What fills the context window, what happens when it's full, and how compaction summarizes old messages to keep going."
tags: ["context window", "compaction", "summarization", "token limits"]
author: "Gokul"
---

# Context Limits & Compaction

Caching makes re-processing cheaper, but it doesn't solve the space problem. Every model has a maximum context window, and long conversations eventually fill it. What happens then?

---

## 01 — What Fills the Context Window

The context window holds everything the model needs to see:

- **System prompt** — instructions that tell Claude how to behave (~2K-5K tokens)
- **Your messages** — every question and instruction you've typed
- **Claude's responses** — every answer, code block, and explanation
- **Tool results** — file contents, command outputs, search results
- **Tool definitions** — descriptions of available tools (~2K-4K tokens)

In a Claude Code session, tool results are the biggest consumers. Reading a single 200-line code file can add 2,000-4,000 tokens. Read 10 files? That's 20K-40K tokens just from file contents.

---

## 02 — Context Window Sizes

- **Opus 4.7:** 1,000,000 tokens
- **Sonnet 4.6:** 1,000,000 tokens
- **Haiku 4.5:** 200,000 tokens

1 million tokens sounds enormous. But in a real Claude Code session with file reads, edits, test outputs, and back-and-forth discussion, it fills up. A heavy session might use 200K-400K tokens within 30-40 messages.

---

## 03 — What Happens at ~95% Full

When the context window reaches approximately 95% capacity, Claude Code triggers **compaction**. This isn't a hard threshold at exactly 95% — the trigger is based on total token count approaching the model's limit.

Compaction is a two-step process:

**Step 1 — Detection (client-side):** Claude Code monitors the token count of the conversation. When it detects the context is nearly full, it initiates compaction.

**Step 2 — Summarization (server-side):** Claude Code sends the conversation to the API with a special instruction: "Summarize this conversation, preserving key context." The model generates a summary, which requires a server round-trip.

The summary replaces the old messages. Instead of 40 detailed messages with tool results, you get a concise summary (~2K-5K tokens) plus the most recent messages.

---

## 04 — Before and After Compaction

**Before compaction (~95% full):**
- System prompt (3K tokens)
- Messages 1-40 with all tool results (450K tokens)
- Total: ~453K tokens

**After compaction:**
- System prompt (3K tokens)
- Summary of messages 1-30 (3K tokens)
- Recent messages 31-40 preserved in full (50K tokens)
- Total: ~56K tokens

The conversation continues seamlessly. Claude can still reference earlier work through the summary. But detailed information from old messages — exact file contents, specific error messages, intermediate reasoning — is lost.

---

## 05 — The Compaction Tradeoff

Compaction is a necessary compromise:

**What's preserved:**
- Key decisions and approaches
- What files were modified and why
- Current task state and progress
- Important constraints and requirements

**What's lost:**
- Exact file contents from early reads
- Specific error messages and stack traces
- Detailed intermediate reasoning
- Exact wording of earlier messages

**Impact on cache:** Compaction invalidates the prompt cache. The summarized conversation has a completely different token sequence, so the prefix no longer matches. The next request after compaction triggers a fresh cache write.

---

## 06 — Compaction Frequency

How often compaction happens depends on the **token accumulation rate**, not the number of messages. A conversation where every message reads large files fills up faster than one with short text-only exchanges.

Factors that accelerate compaction:
- Reading many or large files
- Long model responses with detailed code
- Many tool calls per turn (each result adds tokens)
- File contents in tool results

You might hit compaction after 20 messages in a file-heavy session, or after 100+ messages in a lightweight conversation.

---

## RECAP

- **The context window holds everything** — system prompt, messages, responses, tool results, and tool definitions. File reads are the biggest consumers.
- **Context sizes** — Opus and Sonnet: 1M tokens. Haiku: 200K tokens.
- **Compaction triggers at ~95% full** — detection is client-side (Claude Code monitors token count), but summarization requires a server round-trip.
- **Old messages become a summary** — detailed information is lost, but key decisions and context are preserved.
- **Cache is invalidated** — compaction changes the token sequence, breaking the prefix cache. The next request starts a fresh cache.
- **Frequency depends on token accumulation rate** — file-heavy sessions compact sooner. Message count alone doesn't determine when compaction occurs.

---

## Next Episode

You now understand all the pieces: tokens, sessions, caching, and compaction. Episode 7 puts it all together — the complete lifecycle of a Claude Code conversation, from first message to compaction and beyond.
