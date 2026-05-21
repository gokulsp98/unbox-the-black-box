---
title: "The Bigger Picture"
series: "How Your Code Runs"
episode: 2
totalEpisodes: 7
description: "32-bit vs 64-bit, CPU vs GPU, open source vs proprietary — and why it all matters more than you think."
tags: ["cpu", "gpu", "32-bit", "64-bit", "risc-v", "nvidia", "ai"]
author: "Gokul"
---

# The Bigger Picture

32-bit vs 64-bit, CPU vs GPU, open source vs proprietary — and why it all matters more than you think.

---

## 07 — 32-bit vs 64-bit

In Episode 1, we learned that CPUs follow instructions, and that there are two main instruction sets: x86_64 and ARM64. But when you download software, you often see another choice: **"32-bit or 64-bit?"**

What does that actually mean?

It refers to the **width of the data highway** inside the CPU — how much information it can process in a single step.

> **Analogy:** Imagine a road. A 32-bit CPU is like a 2-lane road — only a few cars can pass at once. A 64-bit CPU is like a massive 8-lane highway — far more data flows through at the same time.

The biggest real-world difference? **Memory.** How much RAM your computer can use:

| Architecture | Max RAM |
|---|---|
| 32-bit | 4 GB max |
| 64-bit | 16 billion GB (theoretical) |

By the mid-2000s, computers were hitting the **4 GB wall**. Programs needed more memory, but 32-bit simply couldn't address it. The industry moved to 64-bit to shatter that ceiling.

Today, virtually every computer, phone, and server runs 64-bit. The transition is complete:

```
// The death of 32-bit
2019 — macOS dropped 32-bit app support
2021 — Ubuntu dropped 32-bit downloads
2023 — Google Play requires 64-bit apps
2025 — most Linux distros stopped 32-bit builds
```

### Can 64-bit run 32-bit software?

**Yes** — most 64-bit CPUs have a **compatibility mode** that lets them run older 32-bit code. Think of it like a 6-lane highway that can still handle 3-lane traffic.

But this backward compatibility is being dropped:

- **Windows 64-bit** — still runs 32-bit apps (via a layer called WoW64)
- **Linux 64-bit** — can run 32-bit apps if you install extra libraries
- **macOS (2019+)** — dropped 32-bit support completely. No compatibility mode.

The reverse, however, is **impossible**: a 32-bit CPU can never run 64-bit code. It simply doesn't have the hardware to understand it.

---

## 08 — So Why Not 128-bit?

If 64-bit was better than 32-bit, surely 128-bit would be even better, right?

Not really. Here's why:

- **8-bit** (1970s) — could address **256 bytes** of RAM. Atari, Nintendo NES. Ran out quickly.
- **16-bit** (1980s) — could address **64 KB** of RAM. Super Nintendo. Still tight.
- **32-bit** (1990s–2000s) — could address **4 GB** of RAM. Hit the wall around 2005. Forced the upgrade.
- **64-bit** (2003–now) — could address **16 billion GB** of RAM. We're using 0.0000001% of this. No wall in sight.

Each jump happened because we **ran out of space**. The move from 32-bit to 64-bit solved a real problem — the 4 GB memory limit.

But 64-bit can theoretically address **16 exabytes** of memory. The largest server in the world today uses about 12 TB — that's still less than 0.0001% of what 64-bit allows.

There's simply **no problem to solve**. Building a 128-bit CPU would be more complex, use more power, and solve a problem that won't exist for centuries.

---

## 09 — Who Owns the Language?

Remember instruction sets — the language CPUs speak? Here's the twist: **some languages are locked behind patents, and some are free.**

### x86_64 — Proprietary

**Owned by:** Intel & AMD (patents)

You **cannot** manufacture an x86 chip without their permission. That's why only 2 companies in the world make them.

*Closed club. No entry.*

### ARM64 — Licensed

**Owned by:** ARM Holdings (UK company)

You **can** make an ARM chip, but you must **pay a licensing fee** to ARM. Apple, Qualcomm, Samsung, Amazon — they all pay.

*Open door, but you pay to enter.*

### RISC-V — Open Source

**Owned by:** Nobody. Free for everyone.

**Anyone** can design and build a RISC-V chip with zero fees, zero permission. It's growing fast — China is investing heavily.

*Fully free. No gates.*

---

Here's the key distinction many people miss: the instruction set documentation is public — Intel publishes 5,000-page manuals explaining every x86 instruction. **Anyone can write software** that runs on x86.

But **manufacturing a physical chip** that executes those instructions? That's where the patents block you. Writing software for x86 is free. Building an x86 CPU will get you sued.

> **Analogy:** Speaking English is free — anyone can do it. But if someone copyrighted the English dictionary and you tried to print your own dictionary, you'd be sued. That's the difference between using an instruction set (free) and implementing one in silicon (patented).

---

## 10 — CPU vs GPU

So far, everything we've discussed — instruction sets, 32-bit vs 64-bit, proprietary vs open — has been about the **CPU**. But there's another chip sitting right next to it on your computer's board: the **GPU**.

GPUs are in gaming PCs, they power AI, and Nvidia became a trillion-dollar company because of them. But what makes them different from CPUs?

### CPU

**A math professor**

Few cores (4–24), each extremely smart. Can solve any problem — algebra, logic, complex decisions. Works on one complex task at a time, very fast.

### GPU

**10,000 students**

Thousands of tiny cores, each can only do simple math. But all 10,000 work at the same time. Same simple task, millions of times in parallel.

---

Here's what each is good at:

```
// CPU: complex decisions, step by step
if user is logged in
  check permissions
    if admin → load dashboard
    else → load profile
      fetch from database
        format response

Each step depends on the previous one.
GPU can't do this well.
```

```
// GPU: same math, 8 million times
Pixel 1:      multiply color x lighting
Pixel 2:      multiply color x lighting
Pixel 3:      multiply color x lighting
...
Pixel 8,294,400:  multiply color x lighting

Same operation. No dependencies.
CPU would do this one by one — painfully slow.
```

---

## 11 — Why GPUs Power AI

Artificial intelligence — deep learning, neural networks, ChatGPT — is built on one core operation: **matrix multiplication**.

That sounds scary, but it's just this: multiply and add, multiply and add, multiply and add — **billions of times**.

> **Analogy:** Training an AI model is like grading **10 million exam papers**. Each paper needs the same simple steps: check answer, mark score, add it up. A professor (CPU) could do it, but it would take years. 10,000 students (GPU) finish in a day — because every paper is independent.

This is why **Nvidia** became one of the most valuable companies in history. Their GPUs — combined with their **CUDA** software platform — dominate AI training:

- **Nvidia GPU + CUDA** — ~90% of AI training market. Proprietary software lock-in.
- **AMD GPU + ROCm** — Open source alternative. Growing, but still catching up.
- **Google TPU** — Custom chip designed purely for AI. Only available on Google Cloud.

---

## Recap — The Complete Picture

- **32-bit vs 64-bit** — determines how much memory a CPU can address. 32-bit topped out at 4 GB. 64-bit can handle billions of GB. No need for 128-bit anytime soon.
- **Instruction set ownership** — x86 is locked (Intel/AMD patents), ARM is licensed (pay a fee), RISC-V is fully open and free for anyone.
- **CPU vs GPU** — CPUs are a few smart cores for complex tasks. GPUs are thousands of simple cores for parallel tasks. AI training is massively parallel — that's why GPUs dominate.
- **Open source matters** — RISC-V proves that open instruction sets can compete. The tension between proprietary control and open collaboration shapes the entire industry.

---

*You made it! You now understand the fundamentals of how CPUs work, what instruction sets are, and why the world of computing is shaped the way it is.*
