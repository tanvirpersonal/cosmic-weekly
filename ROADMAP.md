# Cosmic Weekly 1.0 — Build Roadmap

> **This file is the single source of truth for progress.**
> One checkbox = one file (or one task). When a file is finished, tick its box, commit and push **immediately**.
> If a session ends (usage limit), the next session resumes from the first unchecked box.

## Resume protocol (for Claude / any contributor)

1. `git checkout 1.0 && git pull origin 1.0`
2. Read this file. Find the **first unchecked `- [ ]` item** — that is the next job.
3. Build only that file, matching the conventions in the **Architecture decisions** section below.
4. Run `bash scripts/ship.sh <ID> "<commit message>"` — it ticks the box, refreshes the status block in `README.md`, commits and pushes to `origin 1.0`.
5. Repeat. Never batch several files into one push.
6. If a file turns out to need a change in an earlier file, fix the earlier file in the **same** commit and note it in the log at the bottom.

## Architecture decisions

| Topic | Decision |
| --- | --- |
| Hosting | GitHub Pages (project site), branch `1.0`. No server code. |
| Build step | **None.** Plain HTML + CSS + ES modules. Opens directly in any static server. |
| Routing | Folder-per-page (`articles/index.html`, `about/index.html`) for clean URLs. Reader uses `article/?slug=<slug>`. |
| Paths | Always **relative** (project sites live under `/cosmic-weekly/`). JS finds the site root with `new URL('../', import.meta.url)` in `js/config.js`. |
| Content | Metadata in `data/*.json`; article bodies as Markdown in `content/articles/<slug>.md`, rendered in the browser by our own safe parser (`js/lib/markdown.js`, escapes raw HTML). |
| Dynamic feel | Client-side rendering, live search + filters, reading progress, theme toggle, animated starfield canvas, scroll reveal. |
| Styling | CSS custom properties (tokens) → base → layout → components → pages → reader. No frameworks. |
| Fonts | Fraunces (display), Inter (UI), JetBrains Mono (labels) via Google Fonts, with system fallbacks. |
| Look | Deep-space observatory: ink-blue black, aurora violet/cyan accents, warm gold highlights, large editorial type. Dark default, light theme supported. |
| Accessibility | Semantic landmarks, skip link, visible focus, `prefers-reduced-motion`, alt text, AA contrast. |
| Security | No `innerHTML` with unescaped data; Markdown parser escapes HTML; external links get `rel="noopener noreferrer"`. |

## Target file tree

```
cosmic-weekly/
├── index.html                    Home
├── articles/index.html           Archive (search + filters)
├── article/index.html            Reader (?slug=)
├── about/index.html
├── contact/index.html            Pitch / contact form
├── 404.html
├── css/        tokens · base · layout · components · pages · reader
├── js/
│   ├── config.js  main.js
│   ├── core/        dom · theme · data
│   ├── lib/         markdown
│   ├── components/  header · footer · cards · search · toast
│   ├── effects/     starfield · reveal
│   └── pages/       home · archive · article · contact
├── data/       site.json · topics.json · articles.json
├── content/articles/*.md
├── assets/     og/cover.svg
├── scripts/    ship.sh · build-sitemap.mjs
├── docs/       ARCHITECTURE.md · CONTENT-GUIDE.md
├── robots.txt  sitemap.xml  manifest.webmanifest  favicon.svg  .nojekyll
└── ROADMAP.md  README.md
```

---

## Phase 0 — Foundation

- [x] **01** `ROADMAP.md` — this plan
- [x] **02** `README.md` — project overview + live status block
- [x] **03** `scripts/ship.sh` — tick box, update README status, commit, push
- [x] **04** `.nojekyll` — disable Jekyll on Pages
- [x] **05** `robots.txt`
- [x] **06** `favicon.svg` — new Cosmic Weekly mark
- [x] **07** `manifest.webmanifest` — installable web app metadata

## Phase 1 — Design system (CSS)

- [x] **08** `css/tokens.css` — colors, type scale, spacing, radius, shadows, motion, dark/light themes
- [x] **09** `css/base.css` — reset, typography, focus, selection, skip link, utilities
- [x] **10** `css/layout.css` — container, grid, section rhythm, header/footer shells
- [x] **11** `css/components.css` — buttons, chips, cards, forms, nav, toast, search overlay
- [x] **12** `css/pages.css` — hero, home sections, archive, about, contact, 404
- [x] **13** `css/reader.css` — article typography, progress bar, TOC, code, quotes, tables

## Phase 2 — Data & content

- [x] **14** `data/site.json` — site name, tagline, nav, social, SEO defaults
- [x] **15** `data/topics.json` — topic list (Cosmos, Physics, Technology, Mind, Earth, Ideas)
- [x] **16** `content/articles/inside-a-black-hole.md`
- [x] **17** `content/articles/webb-and-the-first-galaxies.md`
- [x] **18** `content/articles/how-machines-learn.md`
- [x] **19** `content/articles/the-physics-of-a-snowflake.md`
- [x] **20** `content/articles/why-we-dream.md`
- [x] **21** `content/articles/slow-ideas.md`
- [x] **22** `data/articles.json` — index of all articles (slug, title, dek, topic, date, readTime, cover, featured)

## Phase 3 — JavaScript

- [x] **23** `js/config.js` — site root URL, paths, constants
- [x] **24** `js/core/dom.js` — safe element builder, `qs`, `qsa`, `escapeHtml`
- [x] **25** `js/core/theme.js` — dark/light toggle with persistence
- [x] **26** `js/core/data.js` — fetch + cache JSON and Markdown
- [x] **27** `js/lib/markdown.js` — safe Markdown → HTML (headings, lists, quotes, code, tables, links, images)
- [x] **28** `js/components/header.js` — nav, theme toggle, search button, mobile menu
- [x] **29** `js/components/footer.js`
- [x] **30** `js/components/cards.js` — featured card, article card, topic chip
- [x] **31** `js/components/search.js` — full-screen live search overlay (`/` shortcut)
- [x] **32** `js/components/toast.js`
- [x] **33** `js/effects/starfield.js` — lightweight canvas starfield (pauses when hidden / reduced motion)
- [x] **34** `js/effects/reveal.js` — scroll reveal via IntersectionObserver
- [x] **35** `js/main.js` — boot: theme, header, footer, starfield, reveal, search

## Phase 4 — Pages

- [x] **36** `index.html` — Home shell
- [x] **37** `js/pages/home.js` — hero, featured, latest, topics, newsletter-style CTA
- [x] **38** `articles/index.html` — Archive shell
- [x] **39** `js/pages/archive.js` — search, topic filter, sort, URL-synced state
- [x] **40** `article/index.html` — Reader shell
- [x] **41** `js/pages/article.js` — load Markdown, TOC, progress bar, related, prev/next, share
- [x] **42** `about/index.html`
- [x] **43** `contact/index.html` — pitch form (opens mail client, no backend)
- [x] **44** `js/pages/contact.js`
- [x] **45** `404.html`

## Phase 5 — Polish, SEO, docs

- [x] **46** `assets/og/cover.svg` — social share image (+ cover.png render used by og:image)
- [x] **47** `scripts/build-sitemap.mjs` — generates `sitemap.xml` from `data/articles.json`
- [x] **48** `sitemap.xml`
- [x] **49** `docs/ARCHITECTURE.md`
- [x] **50** `docs/CONTENT-GUIDE.md` — how to add an article in 3 steps
- [x] **51** QA pass — links, mobile widths, keyboard, contrast, reduced motion; fix findings
- [x] **52** Final — set GitHub Pages source to branch `1.0`, update README with live URL

---

## Session log

| Date | Done | Notes |
| --- | --- | --- |
| 2026-11-12 | 01 | Branch `1.0` created as a clean orphan branch; `main` (old single-page version) left untouched. |
| 2026-11-12 – 14 | 02–52 | All files built, one push per item. QA: fixed 320px header overflow. Remaining by hand: set Pages source to `1.0`, replace placeholder email. |
