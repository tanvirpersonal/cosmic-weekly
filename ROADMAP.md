# Cosmic Weekly 2.0 — Delivery checklist

## Progress

- **Implementation milestones:** 10/10 complete (100%).
- **Launch checklist:** 12/14 complete (86%).

## Implementation — complete

- [x] Carry forward design system, theme and content data
- [x] Safe Markdown rendering
- [x] Shared header, footer, cards, toast and search overlay
- [x] Homepage and article archive
- [x] Article reader, TOC, progress, related and adjacent stories
- [x] About, contact and 404 pages
- [x] Starfield and reduced-motion handling
- [x] PWA manifest, sitemap and robots.txt
- [x] Architecture and content documentation
- [x] GitHub Pages deployment instructions

## Launch checklist

- [x] Set the editorial contact email in `data/site.json`.
- [x] Enable GitHub Pages: branch `2.0`, folder `/(root)` (Pages build has run successfully).
- [ ] Verify the Pages deployment workflow and live URL.
- [ ] Complete desktop/mobile, keyboard, contrast and Lighthouse QA.

## Automated checks

A GitHub Actions workflow checks JavaScript syntax, local HTML links, article body references, topic references and JSON data on pushes and pull requests targeting `2.0`.

## Deployment target

https://tanvirpersonal.github.io/cosmic-weekly/
