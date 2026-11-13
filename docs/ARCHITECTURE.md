# Architecture

Cosmic Weekly is a static site: plain HTML, CSS and ES modules. No build step, no framework. It runs on GitHub Pages from branch `1.0`.

## Request flow

1. Each page (`index.html`, `articles/`, `article/`, `about/`, `contact/`) is a thin shell with `<body data-page="…">`, an empty `#site-header`, `<main>`, an empty `#site-footer` and a starfield canvas.
2. `js/main.js` boots: theme → starfield → site data → search → header/footer → page module → scroll reveal.
3. The page module `js/pages/<page>.js` exports `init({ site })` and renders its content.

## Layers

| Layer | Files | Role |
| --- | --- | --- |
| Config | `js/config.js` | `ROOT`, `url()`, paths, storage keys. All URLs derive from `import.meta.url`, so the site works under `/cosmic-weekly/`. |
| Core | `js/core/*` | DOM helpers, theme, cached data access. |
| Lib | `js/lib/markdown.js` | Safe Markdown renderer (escapes HTML, filters URL schemes). |
| Components | `js/components/*` | Header, footer, cards, search overlay, toast. |
| Effects | `js/effects/*` | Starfield canvas, scroll reveal. |
| Pages | `js/pages/*` | One module per page. |
| CSS | `css/tokens → base → layout → components → pages → reader` | Design tokens first, page styles last. |

## Content model

- `data/site.json` — name, tagline, URL, email, nav, footer links, hero copy.
- `data/topics.json` — topics with icon and colours.
- `data/articles.json` — article metadata (slug, title, dek, topic, date, readTime, author, tags, featured).
- `content/articles/<slug>.md` — article body in Markdown.

The reader lives at `article/?slug=<slug>` so new articles need no new HTML file.

## Theming

Dark by default. Light theme via `html[data-theme="light"]`, stored in `localStorage` key `cw-theme`. An inline script in each `<head>` applies it before first paint.

## 404

`404.html` sets a `<base>` dynamically (the repo segment on github.io, otherwise `/`) and then injects CSS and the module script, so it works at any URL depth.

## Contact

No backend. The form validates, then opens a `mailto:` link.

## Tooling

- `scripts/ship.sh <ID> "<msg>"` ticks the ROADMAP item, updates the README status, commits and pushes.
- `scripts/build-sitemap.mjs` regenerates `sitemap.xml` (run after adding articles).
