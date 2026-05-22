---
title: "What is an LLM?"
series: "How Claude Code Works"
episode: 1
totalEpisodes: 7
description: "What large language models actually do — next-token prediction, tokens as the unit of everything, and why it all matters."
tags: ["LLM", "tokens", "AI", "next-token prediction"]
author: "Gokul"
---

# What is an LLM?

You've probably used ChatGPT, Claude, or Gemini. You type a question, it types back an answer. But what's actually happening under the hood?

---

## 01 — A Next-Token Prediction Machine

A Large Language Model (LLM) is a neural network trained on massive amounts of text. Books, code, research papers, websites — billions of documents.

But here's the thing that surprises most people: an LLM doesn't "understand" your question the way a human does. It does something much simpler and much more powerful at the same time.

> **It predicts the next token.**

That's it. Given everything that came before, the model calculates the probability of every possible next piece of text and picks one. Then it does it again. And again. Token by token, it builds a response.

> **Analogy:** Think of it like autocomplete on your phone — but instead of predicting the next word in a text message, it predicts the next piece of text in an entire conversation. And it's been trained on so much text that its predictions are remarkably good.

---

## 02 — What is a Token?

A **token** is the smallest unit of text that an LLM processes. It's not always a word. It's not always a character. It's somewhere in between.

The model has a **tokenizer** — a tool that splits text into these pieces. Common words stay whole. Uncommon words get split into smaller pieces.

```
"Hello world"     →  ["Hello", " world"]           = 2 tokens
"Claude is great" →  ["Claude", " is", " great"]   = 3 tokens
"Programming"     →  ["Programm", "ing"]            = 2 tokens
"API"             →  ["API"]                         = 1 token
"authentication"  →  ["authentic", "ation"]          = 2 tokens
```

Notice the spaces. " world" (with a leading space) is a single token — the space is part of it. This is how most modern tokenizers work.

### Rule of Thumb

**~3–4 characters ≈ 1 token** (for English text)

Other languages, code, and special characters tokenize differently — sometimes more efficiently, sometimes less.

### Quick Estimates

- 1,000 words ≈ 1,300 tokens
- A typical code file (200 lines) ≈ 2,000–4,000 tokens
- This entire episode ≈ ~1,500 tokens

---

## 03 — Why Tokens Matter

Tokens are the currency of AI. Everything is measured in them:

**Cost** — you're charged per token processed. Input tokens (what you send) and output tokens (what the model generates) both cost money. Output tokens cost more.

**Speed** — more tokens = more time. The model generates one token at a time, so longer responses take longer.

**Limits** — every model has a maximum number of tokens it can handle in one conversation. This is called the **context window**. Go beyond it, and the conversation can't continue without intervention.

> **Analogy:** Tokens are like words on a page in a notebook. The notebook has a fixed number of pages (context window). You pay for every word written (cost). And writing each word takes a moment (speed). Fill the notebook, and you need a new one — or a summary of what you've written so far.

---

## 04 — One Model, Many Uses

Here's a common misconception: there isn't a separate "text AI" and "code AI." Claude is a single general-purpose model. The same model that writes poetry can also write Python, explain quantum physics, or debug your React component.

When you use Claude on the web (claude.ai), in a mobile app, or through Claude Code in your terminal — it's the same underlying model. The difference is the **interface**, not the intelligence.

Claude Code gives the model access to your file system, terminal, and development tools. The model itself is identical — it just has more context about your project and more tools to act on it.

### What Claude Can Do

- Have natural conversations
- Write, debug, and explain code in 50+ languages
- Analyze documents and images
- Search and navigate codebases
- Run commands and edit files (via Claude Code)

---

## RECAP

- **An LLM predicts the next token** — not "the best response." It generates text one piece at a time, choosing the most likely continuation.
- **A token is a small piece of text** — roughly 3–4 characters. Common words are one token; uncommon words get split into pieces.
- **Tokens are the currency of AI** — they determine cost, speed, and conversation limits.
- **Claude is one model** — the same model powers the web app, mobile app, and Claude Code. The interface changes, not the intelligence.

---

## Next Episode

You know what an LLM is and what tokens are. But what exactly is Claude? What models are available, what do they cost, and what is Claude Code? Episode 2 breaks it all down.
