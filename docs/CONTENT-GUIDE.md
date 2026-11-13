# Content guide: add an article in 3 steps

## 1. Write the Markdown

Create `content/articles/<slug>.md`. The slug is lowercase words joined by hyphens, e.g. `the-color-of-rain`.

Supported Markdown: headings (`##`, `###` appear in the table of contents), paragraphs, **bold**, *italic*, `code`, links, lists, block quotes, tables and fenced code blocks. Raw HTML is escaped. Do not repeat the title as an `#` heading; the page adds it.

## 2. Register it

Add an entry to `data/articles.json`:

```json
{
  "slug": "the-color-of-rain",
  "title": "The Color of Rain",
  "dek": "One-sentence summary shown on cards.",
  "topic": "earth",
  "date": "2026-11-20",
  "readTime": 6,
  "author": "Your Name",
  "tags": ["weather", "light"],
  "featured": false
}
```

`topic` must match an `id` in `data/topics.json`. Set `featured: true` on one article to make it the home-page hero story.

## 3. Refresh the sitemap and publish

```bash
node scripts/build-sitemap.mjs
git add -A && git commit -m "Add article: The Color of Rain" && git push
```

The article is then live at `article/?slug=the-color-of-rain`.

## Other edits

- Contact email: `data/site.json` → `email` (replace the placeholder `hello@example.com`).
- New topic: add it to `data/topics.json`; it appears in filters and the pitch form automatically.
- Colours and spacing: `css/tokens.css`.
