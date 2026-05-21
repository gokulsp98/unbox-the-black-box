---
title: "The Brain of Your Computer"
series: "How Computers Think"
episode: 1
totalEpisodes: 2
description: "Ever wondered what really happens inside that little chip? CPUs, instruction sets, compilers, x86_64 vs ARM64 — broken down so anyone can understand."
tags: ["cpu", "instruction-set", "binary", "compiler", "x86", "arm"]
author: "Gokul"
---

# The Brain of Your Computer

Ever wondered what really happens inside that little chip? Let's break it down — no engineering degree needed.

---

## 01 — What is a CPU?

The **CPU (Central Processing Unit)** is a tiny chip — usually smaller than a postage stamp — that sits at the heart of every computer, phone, and smart device.

It does one thing: **follow instructions**. Add these two numbers. Compare these values. Jump to the next step. It does billions of these simple operations every second.

Every app you open, every website you load, every message you send — it all passes through this little chip.

> **Analogy:** Imagine a super-fast chef in a kitchen. The chef can only do simple actions — chop, stir, mix, plate — but does them at incredible speed. A recipe (your software) tells the chef exactly what to do, step by step. The CPU is that chef. The recipe is the program.

---

## 02 — From Human Language to Machine Language

When programmers write code, it looks something like this:

```
// Code written by a human
if (temperature > 30) {
    print("It's hot outside!")
}
```

But the CPU doesn't understand English, Python, or JavaScript. It only understands **binary** — a stream of ones and zeros:

```
// What the CPU actually sees
01001000 10001001 11100101 01001000
10000011 11101100 00001000 01001000
10111000 00000001 00000000 00000000
```

So how does human-readable code become this? A program called a **compiler** does the translation.

**Your Code** (human readable) → **Compiler** (translator) → **Binary** (CPU readable)

The output of the compiler — that file full of ones and zeros — is called a **"binary"**. It's called that because it's literally binary data. When you download an app or install software, you're downloading a binary that was compiled for your specific type of CPU.

---

## 03 — The Language CPUs Speak

Every CPU has a fixed set of commands it understands — this is called its **instruction set**. Think of it as a vocabulary:

```
ADD    — add two numbers
MOV    — move data from one place to another
CMP    — compare two values
JMP    — jump to another instruction
LOAD   — read from memory
STORE  — write to memory
```

Every program you've ever used — from web browsers to video games — is just a long sequence of these simple commands, running billions of times per second.

> **Analogy:** An instruction set is like a human language. English and Japanese are both languages, but a person who only speaks English can't understand Japanese. Similarly, a CPU built for one instruction set **can't run code** compiled for a different one.

---

## 04 — Two Languages Rule the World

Before we dive in, let's clear up something that confuses many people: a **chip** and an **instruction set** are not the same thing.

> **Analogy:** A chip is the physical hardware — the tiny piece of silicon you can hold in your hand. An instruction set is the language that chip speaks. Many different chips can speak the *same* language. An Intel Core i5 from 2015 and an AMD Ryzen 9 from 2024 are completely different chips — but they both speak **x86_64**. So the same binary runs on both.

This also explains **backward compatibility**. Every new x86_64 chip supports the base instructions from 1999 plus optional newer ones:

```
// x86_64 instruction set
Base instructions (1999)  ← every chip supports these
SSE4 (2006)               ← most chips have it
AVX  (2011)               ← optional, common
AVX-512 (2017)            ← optional, only some chips
```

Compilers use the base instructions by default, so the binary runs on *any* x86_64 chip — old or new. Newer extensions are opt-in. That's why a program compiled in 2010 still works on a chip from 2025.

Now, out of all the instruction sets ever created, just **two** dominate almost every device on the planet:

### x86_64

- **Where:** Desktops, laptops, servers
- **Made by:** Intel & AMD
- **Philosophy:** Complex & powerful instructions
- **Power:** Higher — needs a fan to cool down

### ARM64

- **Where:** Phones, tablets, newer laptops, cloud servers
- **Made by:** Many companies (licensed design)
- **Philosophy:** Simple & efficient instructions
- **Power:** Lower — runs cool, great battery life

A binary compiled for x86_64 **won't run** on an ARM64 chip, and vice versa. They speak different languages. That's why software often needs to be compiled separately for each.

Together, these two instruction sets cover **99% of all computing devices** in the world.

### So how many versions of software do you need?

A binary needs two things to match: the **instruction set** and the **operating system**. Combine them, and you get one binary per combination:

```
// OS + instruction set = 1 binary

Linux   + x86_64  → 1 binary  (all Intel/AMD servers)
Linux   + ARM64   → 1 binary  (cloud servers, Raspberry Pi)
macOS   + ARM64   → 1 binary  (all modern Macs)
macOS   + x86_64  → 1 binary  (older Intel Macs)
Windows + x86_64  → 1 binary  (all Windows PCs)

Just 5 binaries cover 99% of machines on Earth.
```

That's it. Not hundreds. Not one per chip model. Just one per OS + instruction set pair.

### What about the other 1%?

Other instruction sets exist, but they serve niche roles:

- **RISC-V** — the rising star. Fully open source — anyone can build a RISC-V chip with zero fees. Growing fast, especially in China and IoT devices. We'll cover this more in Episode 2.
- **MIPS** — once popular in routers and gaming consoles (PlayStation 1 & 2). Mostly fading out now.
- **POWER** — IBM's instruction set for mainframes and supercomputers. Powerful but rare outside enterprise.

For now, if you're using a computer, phone, or server — it's almost certainly running x86_64 or ARM64.

---

## 05 — Where Do These Names Come From?

Both "x86_64" and "ARM64" sound like random codes. But each name tells a story. Let's start with x86_64:

### The x86 Timeline

- **1978** — Intel releases the **8086** processor — the original ancestor
- **1982** — Intel 80**186** arrives
- **1985** — Intel 80**286** — people notice the pattern
- **1989** — Intel 80**386** — everyone starts calling the family **"x86"** *(the name sticks)*
- **1993** — Intel 80486 — last numbered chip
- **1995** — Intel **Pentium** — stopped using numbers, but the instruction set stayed "x86"
- **2003 — The Plot Twist** — **AMD** (not Intel!) extends x86 to 64-bit and calls it **AMD64**. Intel had to adopt AMD's design. *(ironic)*

So **x86_64** literally means: the x86 family, extended to 64-bit. You'll also see it called **amd64** — same thing, named after the company that created the 64-bit extension.

### And what about ARM64?

**ARM** stands for **Advanced RISC Machines**. It was created in 1985 by a small British company called Acorn Computers — originally named the *Acorn RISC Machine*.

The "64" simply means it's the 64-bit version of the ARM architecture. You'll also see it called **aarch64** (short for "ARM architecture 64-bit") — same thing, different name.

Unlike x86 which only Intel and AMD can build, ARM Holdings **licenses** their design to anyone willing to pay. That's why dozens of companies — from phone makers to cloud providers — build their own ARM chips.

---

## 06 — Who Makes These Chips?

The instruction set is the language. The chip is the physical hardware. Here's who builds them:

### x86_64 Chips

- **Intel** — Core i3, i5, i7, i9, Xeon. The original x86 inventor. Dominates desktops and servers.
- **AMD** — Ryzen, EPYC, Threadripper. Created the 64-bit extension. Strong competitor to Intel.

### ARM64 Chips

- **Qualcomm** — Snapdragon. Powers most Android phones and many Windows laptops.
- **Apple** — M1, M2, M3, M4 series. Custom ARM chips for Mac and iPad.
- **Samsung** — Exynos. Used in Samsung Galaxy phones in some regions.
- **Amazon (AWS)** — Graviton. ARM chips built for cloud servers — cheaper and energy efficient.

Notice: only **2 companies** make x86 chips, but **many companies** make ARM chips. We'll explore why in Episode 2.

---

## Recap — What We Learned

- **The CPU** is a tiny chip that follows billions of simple instructions every second.
- **A compiler** translates human-readable code into binary — the only language a CPU understands.
- **An instruction set** is the vocabulary of commands a CPU knows. Two dominate the world: x86_64 and ARM64.
- **A binary** is compiled for a specific instruction set + operating system. It won't work on a different combination.

---

*Ready for Episode 2? We'll explore 32-bit vs 64-bit, why there's no 128-bit, CPU vs GPU, and the battle between proprietary, licensed, and open source chip designs.*
