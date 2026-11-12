# Cosmic Weekly 2.0

A static editorial magazine about the cosmos, physics, technology, the mind and big ideas. Built with semantic HTML, modular CSS and native JavaScript ES modules. No framework or build step is required.

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

## Content

See [Content guide](docs/CONTENT-GUIDE.md) and [Architecture](docs/ARCHITECTURE.md).

## Important launch setting

Update `email` in `data/site.json` from the placeholder `hello@example.com` to a real editorial address before using the contact form.

GitHub Pages account settings cannot be changed by a repository commit. Enable branch `2.0` and root folder in Settings → Pages.

## License

All rights reserved by the site owner unless stated otherwise.
