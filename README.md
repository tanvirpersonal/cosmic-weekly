# Cosmic Weekly

A dynamic, editorial-style magazine website about the cosmos, physics, technology, the mind and big ideas. Pure HTML, CSS and ES modules — no build step, no framework, ready for GitHub Pages.

## Build status

<!-- STATUS:START -->
**Progress:** `███████░░░░░░░░░░░░░` 18/52 items (35%)

- **Last finished:** #18 — `content/articles/how-machines-learn.md`
- **Next up:** #19 — `content/articles/the-physics-of-a-snowflake.md`
- **Updated:** 2026-11-12
<!-- STATUS:END -->

The full checklist lives in [`ROADMAP.md`](./ROADMAP.md). Every file there has a checkbox; a ticked box means the file is finished and pushed.

### Continuing after a break

1. `git checkout 1.0 && git pull origin 1.0`
2. Open `ROADMAP.md` and take the first unchecked item.
3. Build that one file, then run `bash scripts/ship.sh <ID> "<message>"`.

## Features (planned for 1.0)

- Home with animated starfield hero, featured story, latest stories and topic explorer
- Article archive with live search, topic filters, sorting and shareable URLs
- Reader with reading-progress bar, table of contents, related stories and prev/next
- Dark and light themes (remembers the choice, respects system settings)
- Full keyboard support, reduced-motion support and responsive layout
- Content as Markdown files — add an article without touching any code

## Run locally

Any static server works (ES modules need `http://`, not `file://`):

```bash
python3 -m http.server 8080
# open http://localhost:8080
```

## Project structure

See the target tree in [`ROADMAP.md`](./ROADMAP.md#target-file-tree). In short:

| Folder | Purpose |
| --- | --- |
| `css/` | Design system: tokens → base → layout → components → pages → reader |
| `js/` | ES modules: `core`, `lib`, `components`, `effects`, `pages` |
| `data/` | JSON for site settings, topics and the article index |
| `content/articles/` | One Markdown file per article |
| `assets/` | Images and social-share art |
| `scripts/` | Maintenance helpers |
| `docs/` | Architecture and content guide |

## Branches

- `1.0` — the new professional rebuild (this branch)
- `main` — the previous single-page version, kept untouched

## License

All rights reserved by the site owner unless stated otherwise.
