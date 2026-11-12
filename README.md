# Cosmic Weekly 2.0

A static editorial magazine about the cosmos, physics, technology, the mind and big ideas. Built with semantic HTML, modular CSS and native JavaScript ES modules. No framework or build step is required.

## Project progress

- **Implementation:** 10/10 milestones complete (100%).
- **Launch readiness:** 13/14 checklist items complete (93%).
- The GitHub Actions deployment workflow is active and the latest deployment succeeded. Automated desktop/mobile browser smoke tests pass. Final manual browser, keyboard, contrast and Lighthouse review remains.

See [ROADMAP.md](ROADMAP.md) for the tracked checklist.

## Run locally

```bash
python3 -m http.server 8080
```

Open http://localhost:8080/ from the repository root.

## Deploy to GitHub Pages

1. Open **Settings → Pages**.
2. Under **Build and deployment**, choose **GitHub Actions** as the Source (one-time repository setting).
3. Push to branch **2.0**, or manually run **Actions → Deploy Cosmic Weekly to GitHub Pages → Run workflow**.
4. The workflow validates JavaScript, JSON, local links and article references before uploading and deploying the static site.
5. Confirm the workflow's **deploy** job succeeds, then check the live URL.

Expected project URL: https://tanvirpersonal.github.io/cosmic-weekly/

## Features

- Responsive home, archive, article reader, about and contact pages
- Article search overlay (press `/`) and topic filtering
- Markdown reader with table of contents, reading progress and related stories
- Dark/light theme with saved preference
- Reduced-motion-aware starfield and scroll reveal
- PWA manifest, 404 page, robots.txt and sitemap
- Safe Markdown rendering: raw HTML is escaped
- GitHub Actions checks JavaScript syntax, JSON data, local HTML links and article references on pushes and pull requests to `2.0`

## Content

See [Content guide](docs/CONTENT-GUIDE.md) and [Architecture](docs/ARCHITECTURE.md).

## Launch requirements

- Editorial contact email is configured in `data/site.json`.
- GitHub Pages Source is set to **GitHub Actions**.
- Latest deployment completed successfully.
- Automated Chromium smoke tests pass on desktop and mobile viewports.
- Remaining: manual keyboard/assistive-technology review, visual contrast review and Lighthouse performance/accessibility audit.

The browser smoke suite runs before every deployment; a failing test blocks publication.

## License

All rights reserved by the site owner unless stated otherwise.
