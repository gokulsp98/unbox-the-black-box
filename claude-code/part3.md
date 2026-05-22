---
title: "Sessions & the Request Flow"
series: "How Claude Code Works"
episode: 3
totalEpisodes: 7
description: "What sessions are, where they're stored, and the full journey of a message from your terminal to Claude's servers and back."
tags: ["sessions", "request flow", "tokenization", "API", "Claude Code"]
author: "Gokul"
---

# Sessions & the Request Flow

You type a message in Claude Code and hit enter. A few seconds later, a response appears. But what actually happened in those seconds? Let's trace the full journey.

---

## 01 — What is a Session?

A **session** is a conversation — the sequence of messages between you and Claude. Every time you start Claude Code, you start a new session.

A session contains:
- Your messages (questions, instructions)
- Claude's responses
- Tool calls and their results (file reads, command outputs)
- System instructions (the prompt that tells Claude how to behave)

Each session is an independent conversation. Claude has no memory across sessions — when you start a new one, the model doesn't remember what you talked about before. Everything the model needs to know must be in the current session.

---

## 02 — Where Sessions Live

Sessions are stored as local files on your machine:

```
~/.claude/projects/<encoded-path>/<session-id>.jsonl
```

The `<encoded-path>` is your project directory path, URL-encoded. The `<session-id>` is a unique identifier for each conversation.

Each session file is a JSONL (JSON Lines) file — one JSON object per line, one line per message. It's a simple append-only log.

**Key insight:** Sessions are local-only. They never leave your machine (only the messages you send to the API do). If you delete the session file, the conversation is gone.

---

## 03 — The Server is Stateless

Here's something that surprises most people: **Claude's server doesn't remember your conversation.**

Every time you send a message, Claude Code sends the **entire conversation history** to the API. Every message, every response, every tool result — from the very first message to the latest one.

The server processes it all, generates a response, and immediately forgets everything. Next message? The whole history gets sent again, plus the new message.

This is called a **stateless API** — the server holds no state between requests. Your local session file is the only place the conversation exists.

---

## 04 — The Full Request Lifecycle

Here's exactly what happens when you press Enter on a message in Claude Code:

**Step 1 — Claude Code collects context.** It gathers the full conversation history from the local session file, plus system instructions and tool definitions.

**Step 2 — Everything is sent to the API.** The entire payload — system prompt, all messages, tool definitions — goes to Anthropic's API over HTTPS.

**Step 3 — The server tokenizes.** Anthropic's server converts all the text into tokens using the tokenizer. This happens server-side — Claude Code sends text, not tokens.

**Step 4 — The model processes.** The model reads all the tokens and generates a response, one token at a time (as we learned in Episode 1).

**Step 5 — The response streams back.** Tokens are sent back to Claude Code as they're generated — that's why you see the response appear word by word, not all at once.

**Step 6 — Tool calls may happen.** If the model's response includes a tool call (like "read this file"), Claude Code executes it locally, appends the result to the conversation, and sends a new request to the API. Steps 2–6 repeat.

**Step 7 — The session file is updated.** Claude Code appends the new messages to the local JSONL file.

---

## 05 — Why Everything Gets Re-sent

This re-sending-everything approach seems wasteful. Why not just send the new message?

Because the server is stateless — it literally doesn't have the previous messages. Every request must be self-contained. The server needs the full conversation to understand context.

This design has tradeoffs:

**Advantages:**
- Simple server architecture — no session state to manage
- No server-side storage needed
- Easy to scale — any server can handle any request
- Your conversation stays private on your machine

**Disadvantages:**
- Token usage grows with every message (you'll see this in Episode 4)
- Cost increases as conversations get longer
- Eventually, you hit the context window limit (Episode 6)

---

## RECAP

- **A session is a conversation** — stored as a local JSONL file at `~/.claude/projects/<encoded-path>/<session-id>.jsonl`. It never leaves your machine.
- **The server is stateless** — it doesn't remember previous requests. Every message sends the full conversation history.
- **Tokenization happens server-side** — Claude Code sends text; the server converts it to tokens before the model processes it.
- **Tool calls create loops** — the model requests an action, Claude Code executes it locally, and sends the result back in a new API request.
- **Re-sending everything has costs** — token usage and expense grow with every message. This is the core problem we'll explore in the next episodes.

---

## Next Episode

Now you understand the flow — every message re-sends everything. But how much does that actually cost? Episode 4 breaks down the math of why AI gets expensive as conversations grow.
