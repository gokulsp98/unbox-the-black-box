# Unbox the Black Box — CLAUDE.md

## Project Overview
A static tech learning blog hosted on GitHub Pages. Pure HTML/CSS/JS — no frameworks, no build tools.

## Site Name
**Unbox the Black Box** — tagline: "From confusion to clarity"

## Color Palette
Purple/blue/teal theme — do not change:
- Hero gradient: `#2d3436` → `#0c2461` → `#6c5ce7`
- Title text gradient: `#a29bfe` → `#74b9ff` → `#55efc4`
- Primary accent: `#6c5ce7`
- Nav title: `#6c5ce7`
- Footer: gradient `#0c2461` → `#6c5ce7`, white text

## File Structure
```
index.html       — Homepage (series grid, about section)
style.css        — Shared styles (nav, hero, typography, components, footer)
cpu/             — CPU series (part1.html, part2.html)
```

## Conventions
- Shared/reusable CSS goes in `style.css`
- Page-specific CSS stays inline in `<style>` within each HTML file
- Nav: just the site title linking home + page-specific links (e.g. Episode 1 / Episode 2)
- Homepage nav: only the site title, no extra links
- Footer: consistent across all pages — "Unbox the Black Box — from confusion to clarity. Built with ❤️ by Gokul."
- All content pages link `../style.css` and use `../index.html` for home

## Adding a New Series
1. Create a new folder (e.g. `networking/`)
2. Add HTML pages inside, link `../style.css`
3. Keep nav pattern: site title links home, page links for parts
4. Add a series card to homepage `.series-grid`
5. Update stats in the about section

## Do Not
- Add frameworks or build tools
- Change the color palette without asking
- Add "coming soon" placeholder cards
- Put specific series names in the homepage nav
- Use low-contrast text (keep hero/footer text clearly visible)
