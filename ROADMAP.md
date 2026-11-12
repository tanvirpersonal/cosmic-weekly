# Cosmic Weekly 2.0 — Delivery checklist

## Progress

- **Implementation milestones:** 10/10 complete (100%).
- **Launch checklist:** 10/14 complete (71%).

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

- [ ] Replace the placeholder editorial email in `data/site.json` with the real editorial inbox.
- [ ] Enable GitHub Pages: Settings → Pages → Deploy from a branch → branch `2.0` → folder `/(root)`.
- [ ] Verify the Pages deployment workflow and live URL.
- [ ] Complete desktop/mobile, keyboard, contrast and Lighthouse QA.

## Automated checks

A GitHub Actions workflow checks JavaScript syntax and parses every JSON file under `data/` on pushes and pull requests targeting `2.0`. Check the Actions tab for its result after the next push.

## Deployment target

https://tanvirpersonal.github.io/cosmic-weekly/
