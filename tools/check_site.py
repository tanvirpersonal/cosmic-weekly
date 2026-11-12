#!/usr/bin/env python3
"""Validate local HTML asset links and article content references."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
import json
import sys

ROOT = Path(__file__).resolve().parents[1]

class Links(HTMLParser):
    def __init__(self):
        super().__init__()
        self.targets = []
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        for key in ("href", "src"):
            value = attrs.get(key, "")
            if value:
                self.targets.append(value)

errors = []
checked = 0
for page in sorted(ROOT.rglob("*.html")):
    if any(part.startswith(".") for part in page.relative_to(ROOT).parts):
        continue
    parser = Links()
    parser.feed(page.read_text(encoding="utf-8"))
    for raw in parser.targets:
        parsed = urlsplit(raw)
        if parsed.scheme or parsed.netloc or raw.startswith(("#", "data:")):
            continue
        target = (page.parent / parsed.path).resolve()
        try:
            target.relative_to(ROOT)
        except ValueError:
            errors.append(f"{page.relative_to(ROOT)}: link escapes site root: {raw}")
            continue
        if target.is_dir():
            target = target / "index.html"
        if not target.exists():
            errors.append(f"{page.relative_to(ROOT)}: missing target: {raw}")
        checked += 1

articles = json.loads((ROOT / "data/articles.json").read_text(encoding="utf-8"))
topics = json.loads((ROOT / "data/topics.json").read_text(encoding="utf-8"))
topic_ids = {item["id"] for item in topics}
for article in articles:
    slug = article.get("slug", "")
    if not slug or not (ROOT / "content/articles" / f"{slug}.md").is_file():
        errors.append(f"article body missing for slug: {slug!r}")
    if article.get("topic") not in topic_ids:
        errors.append(f"unknown topic for article {slug!r}: {article.get('topic')!r}")

if errors:
    print("\n".join(f"ERROR: {item}" for item in errors))
    sys.exit(1)
print(f"Static site checks passed: {checked} local HTML links; {len(articles)} article bodies; topic references valid.")
