# Unbox the Black Box

**From confusion to clarity.**

A personal tech learning journal where complex topics become simple, visual, and memorable stories. No jargon. No prerequisites.

## Live Site

Hosted on GitHub Pages — [View Site](https://gokulsp98.github.io/unbox-the-black-box/)

## Series

### 01 — How Your Code Runs
CPUs, instruction sets, binaries, compilers, interpreters — the fundamentals of how code becomes action.

- Episode 1: The Brain of Your Computer
- Episode 2: The Bigger Picture
- Episode 3: C — The Journey to Binary
- Episode 4: Java — Binary While Running
- Episode 5: Python — Binary One Line At A Time
- Episode 6: JavaScript — Binary In Your Browser
- Episode 7: The Full Picture

### 02 — How FastAPI Works
Uvicorn, ASGI, event loops, coroutines, workers, routing, validation — every layer from `fastapi dev` to production.

- Episode 1: What Happens When You Hit It
- Episode 2: Uvicorn — The Server Behind FastAPI
- Episode 3: The Event Loop Inside Uvicorn
- Episode 4: Coroutines — async/await
- Episode 5: Workers — Scaling Across CPU Cores
- Episode 6: FastAPI's Magic — Routing & Validation
- Episode 7: The Full Production Stack

## Tech Stack

- **Astro** — static site generator, outputs pure HTML/CSS/JS
- No client-side frameworks or runtime dependencies
- GitHub Pages via GitHub Actions (`deploy.yml`)
- Scroll-reveal animations via IntersectionObserver
- Interactive quizzes (FastAPI series) with click feedback
- GoatCounter analytics
- Fully responsive

## Project Structure

```
├── astro.config.mjs            # Astro config (static, base path, file format)
├── package.json
├── public/
│   └── style.css               # Shared stylesheet (unchanged from pre-Astro)
├── src/
│   ├── data/
│   │   └── series.ts           # Series config (titles, slugs, progress)
│   ├── layouts/
│   │   ├── BaseLayout.astro    # HTML shell, head, footer, scripts
│   │   ├── HomepageLayout.astro
│   │   └── ArticleLayout.astro # Nav dropdown, optional quiz JS
│   ├── components/
│   │   ├── Nav.astro           # Homepage nav
│   │   ├── ArticleNav.astro    # Episode dropdown nav
│   │   ├── Footer.astro
│   │   ├── GoatCounter.astro
│   │   ├── RevealScript.astro
│   │   ├── NavDropdownScript.astro
│   │   └── QuizScript.astro
│   └── pages/
│       ├── index.astro         # Homepage
│       ├── cpu/part1-7.astro   # CPU series (7 episodes)
│       └── fastapi/part1-7.astro # FastAPI series (7 episodes)
├── cpu/*.md                    # Markdown source files
└── fastapi/*.md                # Markdown source files
```

## Development

```bash
npm install         # install dependencies
npm run dev         # start dev server (localhost:4321)
npm run build       # build to dist/
npm run preview     # preview built site
```

## Adding a New Series

1. Add series config to `src/data/series.ts`
2. Create a folder under `src/pages/` (e.g. `src/pages/networking/`)
3. Create `.astro` pages using `ArticleLayout`
4. Add a series card to `src/pages/index.astro`
5. Keep page-specific styles in `inlineStyle` prop, shared styles in `public/style.css`

## Author

Built with love by **Gokul**
