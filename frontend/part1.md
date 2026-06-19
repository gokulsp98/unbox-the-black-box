---
title: "The Web Before JavaScript"
series: "How the Frontend Works"
episode: 1
totalEpisodes: 22
description: "The web started as a system for sharing documents — HTML only, no interactivity. Every click required a full server round trip. This is where it all began."
tags: ["web history", "HTML", "Tim Berners-Lee", "server round trip"]
author: "Gokul"
---

# The Web Before JavaScript

Before JavaScript existed, the web was something very different from what we know today. No animations. No instant feedback. No dynamic content. Just documents.

---

## 01 — Tim Berners-Lee and the First Web (1991)

The web was invented by **Tim Berners-Lee** in 1991 at CERN, the physics research lab in Switzerland. His goal was simple: help scientists share research documents with each other across the internet.

The original web had exactly one technology: **HTML** (HyperText Markup Language). A webpage was just a text file with some tags:

```html
<h1>Welcome to my page</h1>
<p>This is some text.</p>
<a href="/about.html">Go to about page</a>
```

That was the entire web. Text and links. No colours, no layout, no interactivity. Think of it as a digital book — pages connected by hyperlinks.

---

## 02 — What a Page Load Looked Like

Every single interaction on this early web required a **full round trip to the server**:

```
User clicks a link
        ↓
Browser sends a request to the server
        ↓
Server builds the entire HTML page
        ↓
Server sends the full HTML back
        ↓
Browser displays the new page
```

Want to go to the About page? Full reload. Want to submit a form? Full reload. Want to see if your email was valid? Full reload — the server would check it and send back an error page.

There was no in-between. Every action = a complete new page from the server.

---

## 03 — The Problem This Created

This was fine for reading documents. But as the web grew, people wanted to build **applications** — things that respond instantly, show feedback, update without reloading.

Imagine filling out a long form, clicking Submit, waiting for the page to reload, and then seeing "Email field is required" — back to the empty form.

Without JavaScript, this was the only option. The server had to do everything.

What was impossible without JavaScript:
- Check if a form field is empty before submitting
- Show a dropdown menu when hovering
- Update part of a page without reloading the whole thing
- React to a button click with instant feedback
- Show a loading spinner while waiting

The web was built for **sharing documents**, not building applications. Something had to change.

---

## RECAP

- The web was invented in 1991 by Tim Berners-Lee at CERN
- Original web = only HTML — text documents connected by hyperlinks
- Every interaction required a full server round trip — page reloaded completely each time
- No interactivity was possible — the server did everything
- This worked for documents but was terrible for applications

---

## Next Episode

The limitations of a document-only web pushed Netscape to solve the problem. In 1995, a developer named Brendan Eich created JavaScript in just 10 days. Episode 2 covers exactly why it was created and what it could do.
