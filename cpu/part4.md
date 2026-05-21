---
title: "Java: Binary While It's Running"
series: "How Your Code Runs"
episode: 4
totalEpisodes: 7
description: "C's limitations created the demand for something new. Java answered with a brilliant idea — compile to a fake CPU, then build that fake CPU everywhere."
tags: ["java", "jvm", "jit", "bytecode", "portability", "write-once-run-anywhere"]
author: "Gokul"
---

# Not All Code Is Created Equal

Python creates binary one line at a time. JavaScript does it inside your browser. Every language picks a different tradeoff — and that's why they all exist.

---

## 16 — Python: Binary One Instruction At A Time

In Episode 3, we saw how C compiles to binary before you run the program, and Java compiles to binary while running via the JVM. Python takes a third approach — the simplest, and the slowest.

There's no compile step you ever see. You just run your code directly.

```
python hello.py
```

A program called the **interpreter** reads your source code line by line, translates each line to binary, the CPU executes it, and then it moves to the next line.

```
Source Code → Interpreter reads line → binary → CPU runs it
                                     → next line → binary → CPU runs it
                                     → next line → binary → CPU runs it
```

```
python hello.py

Line 1: name = "Gokul"
  → interpreter translates to binary → CPU stores "Gokul" in memory

Line 2: print("Hello " + name)
  → interpreter translates to binary → CPU prints "Hello Gokul"

Done. No binary file was created. Nothing saved to disk.
Run it again? The interpreter translates everything from scratch.
```

**So when does Python code become binary?** One instruction at a time, while running — and the binary is immediately forgotten after each line executes. It's never saved, never cached, never reused.

And just like Java needs the JVM, Python needs the **Python interpreter** installed on the machine. Without it, `.py` files are just text files — the computer doesn't know what to do with them.

The full flow:

```
Python:
  hello.py → CPython (compiler) → hello.pyc (bytecode) → CPython interpreter → binary one line at a time → CPU runs it
```

### Wait — What About .pyc Files?

If you've used Python, you may have noticed a `__pycache__` folder with `.pyc` files appearing next to your code. That looks like compilation — and it is, partially.

When you run `hello.py`, Python actually does a hidden step first: it compiles your source code into **bytecode** — similar to what Java does. This bytecode is saved as a `.pyc` file.

```
hello.py → Python compiler → hello.cpython-312.pyc (bytecode)
```

Sound familiar? It's the same idea as Java's `.class` files. But here's the critical difference:

```
Java:   bytecode → JVM with JIT → native binary (fast, cached)
Python: bytecode → CPython interpreter → reads bytecode line by line (slow, no JIT)
```

Java's JVM takes bytecode and **compiles hot paths into native binary** that the CPU runs directly. Python's interpreter (called CPython) just **reads the bytecode instructions one by one** and executes them — no JIT, no native binary compilation.

So the `.pyc` file saves Python from re-parsing your source code every time — that's a small speedup. But the actual execution is still interpreted line by line. The bytecode never becomes native binary. It's like translating a book from English to a simpler English — it's easier to read, but you're still reading it word by word instead of memorizing it.

```
Python's actual flow:
  hello.py → compiler → bytecode (.pyc) → CPython interpreter → CPU

Java's flow:
  Hello.java → javac → bytecode (.class) → JVM (with JIT) → CPU

Both compile to bytecode. The difference is what happens next.
Java's JVM compiles bytecode to native binary.
Python's CPython just interprets it.
```

That's why Python is still much slower than Java, despite both having a bytecode step.

This makes Python the **slowest** of the four languages we're covering. The `.pyc` cache helps avoid re-parsing, but the interpreter still translates bytecode to binary one instruction at a time, every single run.

### So Why Would Anyone Use It?

Because writing Python is **incredibly fast for humans**:

```
C (read a file):
  FILE *f = fopen("data.txt", "r");
  if (f == NULL) { perror("Error"); return 1; }
  char buffer[1024];
  while (fgets(buffer, sizeof(buffer), f)) {
      printf("%s", buffer);
  }
  fclose(f);

Python (same thing):
  print(open("data.txt").read())
```

What takes 6 lines in C takes 1 line in Python. For web apps, data analysis, automation scripts — developer time matters more than CPU time.

### The Hidden Truth: Python Is a Glue Language

Here's something most beginners don't realize: when Python does heavy work, **it's not actually Python doing the work**. The heavy lifting happens in libraries written in C.

```
import numpy as np
data = np.array([1, 2, 3])
result = data * 2
```

That multiplication doesn't run in Python. NumPy is written in **C**. Python calls the C code, which produces binary, which the CPU runs at full native speed.

Python writes the logic. C does the math.

That's why AI and machine learning use Python — you write training loops in Python, but the actual matrix multiplications run in C/CUDA libraries at full binary speed on GPUs. Python is just the glue holding it all together.

### Python Is Getting Faster

Python 3.13+ introduced an experimental **JIT compiler** — just like Java's. It watches for hot code paths and compiles them to binary. It's early, but the speed gap between Python and Java is starting to close.

---

## 17 — JavaScript: Binary Inside Your Browser

JavaScript is unique — it's the only major language where **you ship source code directly to the user**. When you visit a website, your browser downloads `.js` files — raw source code — and runs them.

There's no compile step, no bytecode file, nothing installed on the user's machine. The browser does everything.

But how does it become binary? Chrome's **V8 engine** handles the entire journey:

```
JavaScript:
  app.js → V8 engine (in browser) → bytecode in memory → JIT → binary in memory → CPU runs it
```

V8 works a lot like Java's JVM — it interprets bytecode first, then JIT compiles frequently-run code into native binary. The JIT is so aggressive that JavaScript sometimes runs **faster than Java**.

The key difference from every other language: **you don't install anything**. No compiler, no JVM, no interpreter. The browser *is* the runtime. Every computer with a browser can run JavaScript — that's why it powers the entire web.

---

## 18 — The Full Picture

Now let's see all four languages side by side. Every one of them produces binary — the CPU demands it. But the journey is completely different:

```
C:
  hello.c → gcc (compiler) → hello (binary on disk) → CPU runs it directly

Java:
  Hello.java → javac (compiler) → Hello.class (bytecode) → JVM (with JIT) → binary in memory → CPU runs it

Python:
  hello.py → CPython (compiler) → hello.pyc (bytecode) → CPython interpreter → binary one line at a time → CPU runs it

JavaScript:
  app.js → V8 engine (in browser) → bytecode in memory → JIT → binary in memory → CPU runs it
```

### What You Need Installed to Run Each

This is something people overlook. A C binary runs on its own — you just double-click it. But Java, Python, and JavaScript need a **runtime** installed on the machine:

```
C:            Nothing. The binary IS the program. 
              The CPU runs it directly. No dependencies.

Java:         JVM (Java Virtual Machine) must be installed.
              Without it, .class files are useless.

Python:       Python interpreter must be installed.
              Without it, .py files are just text.

JavaScript:   A browser (Chrome, Firefox, Safari).
              The browser's engine is the runtime.
              (Or Node.js for server-side JS)
```

This is a real tradeoff. C binaries are self-contained — send the file, it runs. Java and Python need the user to install something first. JavaScript sidesteps this entirely because every computer already has a browser.

### The Comparison

```
             When does it          Is binary          
             become binary?        saved to disk?     Speed
───────────────────────────────────────────────────────────
C            Before you run it     Yes (permanent     Fastest
             (compile time)        file on disk)      

Java         While it's running    No (lives in       Fast (after
             (JVM + JIT)           memory, then gone) warm-up)

JavaScript   While it's running    No (lives in       Fast (V8 JIT
             (browser engine)      browser memory)    is aggressive)

Python       While it's running    No (translated     Slowest
             (one line at a time)  & immediately
                                   forgotten)         
```

```
             Portability              What you need        Developer
                                      installed to run     Speed
────────────────────────────────────────────────────────────────────
C            Compile per platform     Nothing              Slow

Java         One file runs on any     JVM                  Medium
             platform with JVM        

JavaScript   Runs in any browser      A browser            Fast

Python       Runs on any platform     Python interpreter   Fastest
             with Python installed    
```

The spectrum is always the same tradeoff: **speed vs portability vs ease of use**. No language wins all three. Each one picks a different balance.

---

## 19 — Why They All Exist

If one language could do everything, the others would disappear. But each solves a different problem:

**Building an OS, game engine, or embedded system?**

Use C or Rust. You need maximum speed and hardware control. The binary is created once at compile time. The CPU runs it directly with zero overhead. Nothing is faster. And the binary runs on its own — no runtime needed.

**Building a banking system, enterprise app, or Android app?**

Use Java. You need portability, reliability, and good performance. The JVM creates binary at runtime, and JIT compilation makes it nearly as fast as C after warm-up. One codebase runs everywhere — as long as the JVM is installed.

**Building a website or web app?**

Use JavaScript. It's the only language browsers understand natively. No installation, no compilation — the browser handles everything. V8's JIT makes it surprisingly fast.

**Building an automation script, data pipeline, or AI prototype?**

Use Python. You need to build fast. Runtime speed doesn't matter because the heavy math runs in C libraries underneath anyway. The interpreter translates to binary one line at a time — slow, but you wrote the entire program in an afternoon.

The choice is never about which language is "best." It's about which tradeoff fits the problem.

---

## Recap — The Complete Journey

- **Everything becomes binary.** The CPU only understands binary — this hasn't changed since Episode 1. Every language must produce it.
- **C** creates binary before you run the program. It's saved to disk as a permanent file. Fastest execution, no runtime needed — but locked to one platform per binary.
- **Java** creates binary while the program is running. The JVM translates bytecode to binary in memory. JIT compilation makes hot paths nearly as fast as C. Needs JVM installed.
- **Python** creates binary one instruction at a time. The interpreter translates and immediately forgets. Slowest, but fastest to write. Needs Python installed.
- **JavaScript** ships source code to the browser. V8's JIT compiles it to binary in memory. No installation needed — every computer has a browser.
- **The tradeoff** is always speed vs portability vs developer time. No language wins all three.
- **Python is a glue language** — the heavy work runs in C libraries at native binary speed. Python just orchestrates it.

---

*You've now covered the complete journey: from what a CPU is (Episode 1), to how the computing world is structured (Episode 2), to how every programming language gets its code running on that CPU (Episodes 3 & 4).*
