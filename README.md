# Cosmic Weekly 2.0

A static editorial magazine about the cosmos, physics, technology, the mind and big ideas. Built with semantic HTML, modular CSS and native JavaScript ES modules. No framework or build step is required.

## Project progress

- **Implementation:** 10/10 milestones complete (100%).
- **Launch readiness:** 11/14 checklist items complete (79%).
- GitHub Pages is enabled and its build has succeeded. Final deployment verification and live-site QA remain.

See [ROADMAP.md](ROADMAP.md) for the tracked checklist.

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/ from the repository root.

## Deploy to GitHub Pages

1. Open **Settings → Pages**.
2. Choose **Deploy from a branch**.
3. Select branch **2.0** and folder **/(root)**, then Save.
4. Wait for the Pages deployment workflow to finish.

Expected project URL: https://tanvirpersonal.github.io/cosmic-weekly/

## Features

- Responsive home, archive, article reader, about and contact pages
- Article search overlay (press `/`) and topic filtering
- Markdown reader with table of contents, reading progress and related stories
- Dark/light theme with saved preference
- Reduced-motion-aware starfield and scroll reveal
- PWA manifest, 404 page, robots.txt and sitemap
- Safe Markdown rendering: raw HTML is escaped
- GitHub Actions checks JavaScript syntax and JSON data on pushes and pull requests to `2.0`

## Content

See [Content guide](docs/CONTENT-GUIDE.md) and [Architecture](docs/ARCHITECTURE.md).

## Launch requirements

- Replace `email` in `data/site.json` with the real editorial inbox before using the contact form.
- Enable GitHub Pages in repository settings using branch `2.0` and folder `/(root)`.
- Verify the deployment and run desktop/mobile, keyboard, contrast and Lighthouse checks.

GitHub Pages settings cannot be changed by a normal repository commit. The repository owner must enable the branch in **Settings → Pages**.

## License

All rights reserved by the site owner unless stated otherwise.
