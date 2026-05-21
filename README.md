# Unbox the Black Box

**From confusion to clarity.**

A personal tech learning journal where complex topics become simple, visual, and memorable stories. No jargon. No prerequisites.

## Live Site

Hosted on GitHub Pages — [View Site](#)

## Series

### 01 — How Computers Think
CPUs, instruction sets, binaries, 32 vs 64-bit, CPU vs GPU — the fundamentals of how every device works.

- [Episode 1: The Brain of Your Computer](cpu/part1.html)
- [Episode 2: The Bigger Picture](cpu/part2.html)

## Structure

```
├── index.html          # Homepage
├── style.css           # Shared stylesheet
└── cpu/
    ├── part1.html      # CPU Series — Episode 1
    └── part2.html      # CPU Series — Episode 2
```

## Tech

- Pure HTML, CSS, and vanilla JS
- No frameworks, no build tools, no dependencies
- Designed for GitHub Pages — just push and it's live
- Scroll-reveal animations via IntersectionObserver
- Fully responsive

## Adding a New Series

1. Create a folder (e.g. `networking/`)
2. Add `part1.html` inside it, link `../style.css`
3. Use the nav pattern: `<a href="../index.html" class="nav-title">Unbox the Black Box</a>`
4. Add a series card to `index.html` in the `.series-grid`
5. Keep page-specific styles inline, reusable styles in `style.css`

## Future: Migration to Astro

The current pure HTML setup works well for 2-3 series. Beyond that, the repeated nav/footer/script across every page becomes hard to maintain. Markdown content files (`cpu/part1.md`, `cpu/part2.md`) are already prepared for migration.

When to migrate:
- 4+ series or 10+ pages
- Changing the nav/footer means editing every file manually

What Astro gives you:
- One layout template — nav, footer, scripts written once
- Content stays in `.md` files with frontmatter
- Homepage series grid auto-generates from content
- Output is identical static HTML — same GitHub Pages hosting

## Author

Built with ❤️ by **Gokul**
