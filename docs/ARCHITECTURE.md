# Architecture

Cosmic Weekly is a static site built with HTML, CSS and native ES modules. GitHub Pages serves the repository root directly; no server runtime or bundler is required.

- `js/config.js` resolves the project root from its module URL, supporting nested GitHub Pages routes.
- `js/core/data.js` fetches and caches JSON and Markdown.
- `js/lib/markdown.js` escapes raw HTML and only turns HTTP(S) links/images into active elements.
- `js/main.js` initializes shared UI and dispatches page renderers based on data attributes.
- CSS layers are tokens, base, layout, components, pages and reader.

Routes: home `/`, archive `/articles/`, reader `/article/?slug=<slug>`, about `/about/`, contact `/contact/`.

Deployment: enable GitHub Pages for branch `2.0`, folder `/(root)`.
