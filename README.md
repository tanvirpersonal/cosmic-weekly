# Cosmic Weekly 2.0

A static editorial magazine about the cosmos, physics, technology, the mind and big ideas. Built with semantic HTML, modular CSS and native JavaScript ES modules. No framework or build step is required.

## Project progress

- **Implementation:** 10/10 milestones complete (100%).
- **Launch readiness:** 12/14 checklist items complete (86%).
- The GitHub Actions deployment workflow is committed. Switching Pages Source to GitHub Actions, confirming deployment, and live-site QA remain.

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
- GitHub Pages was previously enabled using branch `2.0` and folder `/(root)`. Switch **Source** to **GitHub Actions** to use the new deployment workflow.
- Verify the deployment and run desktop/mobile, keyboard, contrast and Lighthouse checks.

GitHub Pages Source settings cannot be changed by a normal repository commit. The repository owner must select **GitHub Actions** in **Settings → Pages**.

## License

All rights reserved by the site owner unless stated otherwise.
