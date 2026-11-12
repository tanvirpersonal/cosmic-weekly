# Cosmic Weekly 2.0 — Delivery checklist

## Progress

- **Implementation milestones:** 10/10 complete (100%).
- **Launch checklist:** 13/14 complete (93%).

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
- [x] Set Pages Source to **GitHub Actions** and verify the deployment workflow succeeds.
- [x] Add Chromium desktop/mobile browser smoke tests to the deployment gate.
- [ ] Complete final manual keyboard/assistive-technology review, visual contrast review and Lighthouse audit.

## Automated checks and deployment

The validation workflow checks JavaScript syntax, local HTML links, article body references, topic references and JSON data on pushes and pull requests targeting `2.0`.

The deployment workflow in `.github/workflows/deploy-pages.yml` validates the site, runs `tools/browser-smoke.mjs` in Chromium across desktop and mobile viewports, and then deploys with the official GitHub Pages actions on pushes to `2.0` or manual dispatch. The latest deployment and browser smoke suite succeeded.

## Deployment target

https://tanvirpersonal.github.io/cosmic-weekly/
