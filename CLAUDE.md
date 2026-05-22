# Unbox the Black Box — CLAUDE.md

## Project Overview
A static tech learning blog built with **Astro** and hosted on GitHub Pages. Outputs pure HTML/CSS/JS — no client-side frameworks.

## Site Name
**Unbox the Black Box** — tagline: "From confusion to clarity"

## Tech Stack
- **Astro** (static site generator)
- Pure HTML/CSS/JS output
- GitHub Pages deployment via GitHub Actions

## Commands
```bash
npm run dev       # dev server at localhost:4321
npm run build     # build to dist/
npm run preview   # preview built site
```

## Color Palette
Purple/blue/teal theme — do not change:
- Hero gradient: `#2d3436` → `#0c2461` → `#6c5ce7`
- Title text gradient: `#a29bfe` → `#74b9ff` → `#55efc4`
- Primary accent: `#6c5ce7`
- Nav title: `#6c5ce7`
- Footer: gradient `#0c2461` → `#6c5ce7`, white text

## Project Structure
```
├── astro.config.mjs             # base: '/unbox-the-black-box/', build.format: 'file'
├── public/
│   └── style.css                # Shared styles (nav, hero, typography, components, footer)
├── src/
│   ├── data/
│   │   └── series.ts            # Series config (titles, slugs, progress %)
│   ├── layouts/
│   │   ├── BaseLayout.astro     # HTML shell, head, footer, scripts
│   │   ├── HomepageLayout.astro # Base + homepage nav
│   │   └── ArticleLayout.astro  # Base + article nav + optional quiz JS
│   ├── components/
│   │   ├── Nav.astro            # Homepage nav (site title only)
│   │   ├── ArticleNav.astro     # Episode dropdown with progress bar
│   │   ├── Footer.astro         # Static footer
│   │   ├── GoatCounter.astro    # Analytics script
│   │   ├── RevealScript.astro   # IntersectionObserver (is:inline)
│   │   ├── NavDropdownScript.astro # Click-outside-close (is:inline)
│   │   └── QuizScript.astro     # Quiz interaction JS (is:inline)
│   └── pages/
│       ├── index.astro          # Homepage
│       ├── cpu/part1-7.astro    # CPU series (7 episodes)
│       └── fastapi/part1-7.astro # FastAPI series (7 episodes)
├── cpu/*.md                     # Markdown source files
└── fastapi/*.md                 # Markdown source files
```

## Conventions
- Shared/reusable CSS goes in `public/style.css`
- Page-specific CSS goes in the `inlineStyle` prop (rendered via `<style set:html={...} />`, unscoped)
- **Never** use Astro `<style>` tags in pages — they scope selectors and break CSS
- All scripts use `is:inline` — without it, Astro defers execution and breaks DOM queries
- Body HTML content uses `<Fragment set:html={bodyHtml} />` to avoid JSX curly brace parsing
- Nav: homepage has site title only; article pages have episode dropdown
- Footer: consistent across all pages — "Unbox the Black Box — from confusion to clarity. Built with love by Gokul."
- Series config lives in `src/data/series.ts` — single source of truth for episode titles, slugs, progress

## Adding a New Series
1. Add series config to `src/data/series.ts`
2. Create `src/pages/{series}/` folder with `.astro` pages
3. Use `ArticleLayout` with the series config and episode number
4. Add a series card to `src/pages/index.astro` `.series-grid`
5. Update stats in the about section
6. Create `.md` source files in `{series}/` at project root

## Adding a New Episode
1. Add episode to the series config in `src/data/series.ts`
2. Create `src/pages/{series}/partN.astro` using `ArticleLayout`
3. Create `{series}/partN.md` source file

## Content Workflow
- Always edit the `.md` source file first, then update the corresponding `.astro` page
- Markdown files are the source of truth for all content

## CSS Units
- Always use `rem` or `em` — never use `px`
- Formula: `px ÷ 16 = rem` (e.g. 1px = 0.0625rem, 2px = 0.125rem, 4px = 0.25rem)

## Diagram Text Visibility
- Never use white or near-white text (`color:#fff`, `rgba(255,255,255,...)`) on light-colored backgrounds
- Light backgrounds (`.fb-orange`, `.fb-green`, `.fb-blue`, etc.) need dark text (`#2d3436` or the box's theme color)
- Dark backgrounds (`#1e272e`, dark gradients) can use white/light text
- Always verify text is clearly readable against its background before shipping

## Quiz Section ("Probe Your Thinking")
Each episode ends with a **CHECKPOINT** quiz section between the Recap and the Next Episode banner.

### Design
- Section label: `<span class="section-num partN-num">CHECKPOINT</span>`
- Heading: `<h2>Probe Your Thinking</h2>`
- Subtitle: `<p class="quiz-subtitle">No pressure. Just see what stuck.</p>`
- Wrapper: `<section class="section reveal quiz-epN">`
- 3–5 questions per episode, all multiple choice with 4 clickable options

### Quiz Card Structure
```html
<div class="quiz-card">
  <div class="quiz-card-header">
    <span class="quiz-q-num">Q 01</span>
    <span class="quiz-type-tag">MULTIPLE CHOICE</span>
  </div>
  <p class="quiz-question">Question text</p>
  <ul class="quiz-options">
    <li><button class="quiz-option" type="button"><span class="quiz-opt-letter">A</span>Option</button></li>
    <li><button class="quiz-option" data-correct="true" type="button"><span class="quiz-opt-letter">B</span>Correct option</button></li>
    <!-- more options -->
  </ul>
  <button class="quiz-reveal-btn" type="button" aria-expanded="false">Show Answer <span class="quiz-chevron">▾</span></button>
  <div class="quiz-answer">
    <div class="quiz-answer-inner">
      <div class="quiz-answer-highlight">✓ Correct: <strong>(B) Answer</strong></div>
      <p class="quiz-answer-text">Explanation.</p>
    </div>
  </div>
</div>
```

### Interactive Behavior (JS)
- Click an option → if correct, turns **green** (`.correct`); if wrong, turns **red** (`.wrong`) and correct option highlights green
- Answer explanation auto-reveals on click
- Card locks after answering (`.answered` class prevents re-clicks)
- "Show Answer" button still works as manual toggle
- Quiz JS is in `QuizScript.astro`, injected via `ArticleLayout` when `hasQuiz={true}`

### CSS Location
- Shared quiz classes live in `public/style.css` (`.quiz-card`, `.quiz-option`, `.quiz-answer`, etc.)
- Per-episode color theming in the page's `inlineStyle` (`.quiz-epN .quiz-q-num`, `.quiz-epN .quiz-reveal-btn`, etc.)

### Per-Episode Theming
| Ep | Class | Accent | Tint BG |
|----|-------|--------|---------|
| 1 | `.quiz-ep1` | `#00b894` | `#e8f8f5` |
| 2 | `.quiz-ep2` | `#0984e3` | `#e3f2fd` |
| 3 | `.quiz-ep3` | `#00cec9` | `#e0fafa` |
| 4 | `.quiz-ep4` | `#6c5ce7` | `#f0efff` |
| 5 | `.quiz-ep5` | `#0a3d62` | `#dceeff` |
| 6 | `.quiz-ep6` | `#00b894` | `#e8f8f5` |
| 7 | `.quiz-ep7` | `#6c5ce7` | `#f0efff` |

### Rules
- Every question must have clickable options — no "question + reveal only" format
- Always mark the correct option with `data-correct="true"`
- All options must be `<button>` elements wrapped in `<li>` (not bare `<li>`)
- Use `</button></li>` closing — never `</li>` without `</button>`

## Do Not
- Add client-side frameworks (React, Vue, etc.)
- Change the color palette without asking
- Add "coming soon" placeholder cards
- Put specific series names in the homepage nav
- Use low-contrast text (keep hero/footer text clearly visible)
- Use `px` units in CSS — always use `rem` or `em`
- Edit HTML content without updating the corresponding `.md` file first
- Use white text on light diagram backgrounds (e.g. `color:#fff` on `.fb-orange`/`.fb-green`)
- Use Astro `<style>` tags in pages (they scope selectors)
- Use scripts without `is:inline` (Astro defers them and breaks DOM queries)
