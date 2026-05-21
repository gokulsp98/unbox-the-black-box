---
title: "The Journey to Binary"
series: "How Your Code Runs"
episode: 3
totalEpisodes: 7
description: "Every language must produce binary for the CPU. C takes the most direct path — it creates binary before you even run the program."
tags: ["compiler", "binary", "c", "gcc", "compile-time"]
author: "Gokul"
---

# The Journey to Binary

Every language must produce binary for the CPU. C does it before you run the program. Java does it while running. The difference changes everything.

---

## 12 — The One Rule

In Episode 1, we learned that the CPU only understands **binary** — a stream of ones and zeros. No exceptions. Every app, every website, every AI model — it all becomes binary before the CPU can run it.

So if you write code in C, Java, or Python, it **must** become binary at some point. The CPU doesn't care what language you used — it only sees binary.

The real question isn't *whether* your code becomes binary. It's **when**.

And that "when" is what separates every programming language into three groups.

---

## 13 — C: Binary Before You Run It

C takes the most direct path. You write code, a **compiler** translates it into binary, and that binary file sits on your disk — ready to run anytime.

```
C:
  hello.c → gcc (compiler) → hello (binary on disk) → CPU runs it directly
```

```
You compile once:
  gcc hello.c → hello (binary file on disk)

You run it:
  ./hello → CPU reads binary instructions directly

No translator. No middleman. Maximum speed.
```

The binary is a permanent file. Compile once, run it a million times — no translation ever again. The CPU reads the instructions directly, exactly like we described in Episode 1: MOV, ADD, CMP, JMP — billions per second.

This is the fastest way to run code. Nothing sits between your program and the CPU. That's why operating systems, game engines, and embedded systems are written in C.

And because the binary IS the program, you don't need anything else installed to run it. No runtime, no virtual machine — just double-click the binary and the CPU runs it directly.

But there's a catch — one we hinted at in Episode 1.

Remember how a binary is compiled for a **specific instruction set + operating system**? That means a binary compiled on Linux x86_64 won't run on macOS ARM64. Want to run on 5 platforms? Compile 5 separate binaries, test each one, fix platform-specific bugs in each one.

By the 1990s, this became a real problem.

---

## 14 — The Problems That Created Java and Python

C was created in 1972. For two decades, it was the king. But as computing exploded — the internet, personal computers, mobile devices — three painful problems emerged:

**Problem 1: Portability**

"I compiled my program on Linux. Now my client wants it on Windows, Mac, and three types of servers. I have to compile, test, and debug on *each platform separately*."

For a small utility, that's annoying. For a large application with millions of lines of code, it's a nightmare.

**Problem 2: Memory bugs**

C gives you full control of memory — you manually allocate it and free it. But one mistake and your program crashes, corrupts data, or opens a security hole. Buffer overflows — caused by C's manual memory management — have been the #1 security vulnerability for decades.

**Problem 3: Development speed**

Building a web application in C takes weeks of careful coding. The internet was growing fast. Businesses needed to build things in days, not months — even if the program ran a bit slower.

These three problems created the demand for new languages. And two very different solutions emerged.

---

## 15 — Java: Binary While It's Running

In 1995, Java's creators asked a brilliant question: **"What if we compile to a fake CPU's instructions, then build that fake CPU on every platform?"**

That fake CPU is the **JVM (Java Virtual Machine)**. And this one idea solved the portability problem completely.

Here's how it works, in two steps:

**Step 1: Compile to bytecode (on your machine)**

```
javac Hello.java → Hello.class (bytecode)
```

Bytecode is **not binary**. The CPU can't run it. It's a set of instructions for a fictional computer — the JVM. Think of it as a universal language that no real CPU speaks, but every JVM understands.

**Step 2: JVM translates to binary (on any machine)**

```
java Hello → JVM reads bytecode → produces binary → CPU runs it
```

The JVM is a program installed on the user's computer. It reads the bytecode and produces real binary — real MOV, ADD, JMP instructions — for whatever CPU it's running on.

```
Same Hello.class file:
  On Linux x86_64  → JVM produces x86_64 binary → CPU runs it
  On macOS ARM64   → JVM produces ARM64 binary  → CPU runs it
  On Windows x86   → JVM produces x86 binary    → CPU runs it
```

One file. Every platform. No recompilation. This is Java's famous **"Write once, run anywhere."**

But here's the key difference from C: **the binary is never saved to disk.** It lives in memory, gets used, and disappears when the program stops. The JVM creates it fresh every time you run the program.

And unlike C, you **need the JVM installed** on the machine to run Java programs. Without it, `.class` files are useless — just like a DVD is useless without a DVD player.

The full flow:

```
Java:
  Hello.java → javac (compiler) → Hello.class (bytecode) → JVM (with JIT) → binary in memory → CPU runs it
```

**So when does Java code become binary?** At runtime — while the program is already running. The JVM translates bytecode to binary on the fly.

### The Speed Problem (and How JIT Solved It)

Translating bytecode to binary at runtime adds overhead. Early Java was noticeably slower than C. But then came **JIT — Just-In-Time Compilation**.

The JVM is smart. It doesn't just translate bytecode blindly — it **watches** which code runs frequently. These frequently-run sections are called "hot paths." When the JVM spots a hot path, it compiles it to native binary once and keeps that binary in memory.

```
First 100 calls to calculatePrice():
  → JVM interprets bytecode (slow — translating on the fly)

JVM notices: "this function is HOT — it runs constantly"

JVM compiles it to native binary once, caches it in memory.

Next 1,000,000 calls:
  → CPU runs the cached binary directly (fast — same as C)
```

So Java starts slow (warm-up phase), then gets **near C speed** once the JIT kicks in. That's why Java dominates enterprise servers that run for hours or days — the warm-up cost is negligible, and the rest is full-speed native binary.

---

## Recap — What We Learned

- **Everything becomes binary.** The CPU only understands binary — this hasn't changed since Episode 1. Every language must produce it. The question is when.
- **C** creates binary before you run the program. It's saved to disk as a permanent file. Fastest execution, no runtime needed — but locked to one platform per binary.
- **C's limitations** — portability, memory bugs, and slow development — created the demand for Java and Python.
- **Java** creates binary while the program is running. The JVM translates bytecode to binary in memory. JIT compilation makes hot paths nearly as fast as C. But you need the JVM installed.
- **The pattern:** C gives you speed but locks you to a platform. Java gives you portability but needs a runtime. Is there a way to get even easier development? That's where Python and JavaScript come in — next episode.

---

*In Episode 4, we'll see how Python and JavaScript take completely different paths to binary — and why the choice of language is always a tradeoff between speed, portability, and how fast you can build things.*
