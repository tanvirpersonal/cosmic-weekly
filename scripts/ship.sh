#!/usr/bin/env bash
# Ship one finished roadmap item.
#
#   bash scripts/ship.sh <ID> "<commit message>"
#   e.g. bash scripts/ship.sh 08 "Add design tokens"
#
# What it does:
#   1. Ticks the item's checkbox in ROADMAP.md
#   2. Refreshes the STATUS block in README.md (progress, last done, next up)
#   3. Commits everything and pushes to origin/1.0
#
# Build the file first, then run this. One item per run.
set -euo pipefail
cd "$(dirname "$0")/.."

BRANCH="1.0"
ID="${1:?Usage: ship.sh <ID> \"<commit message>\"}"
MSG="${2:?Usage: ship.sh <ID> \"<commit message>\"}"

if [ "$(git branch --show-current)" != "$BRANCH" ]; then
  echo "Please switch to branch $BRANCH first (git checkout $BRANCH)." >&2
  exit 1
fi

if ! grep -qE "^- \[( |x)\] \*\*${ID}\*\*" ROADMAP.md; then
  echo "Item $ID was not found in ROADMAP.md." >&2
  exit 1
fi

# 1) tick the box
sed -i -E "s/^- \[ \] \*\*${ID}\*\*/- [x] **${ID}**/" ROADMAP.md

# 2) refresh README status block
python3 -I - "$ID" <<'PY'
import re, sys, datetime

done_id = sys.argv[1]
items = []
for line in open("ROADMAP.md", encoding="utf-8"):
    m = re.match(r"^- \[( |x)\] \*\*(\d+)\*\* (.+?)(?: — (.*))?$", line.rstrip("\n"))
    if m:
        items.append((m.group(1) == "x", m.group(2), m.group(3).strip("` "), (m.group(4) or "").strip()))

total = len(items)
done = sum(1 for i in items if i[0])
pct = round(done * 100 / total) if total else 0
bar = "█" * (pct // 5) + "░" * (20 - pct // 5)
last = next((i for i in items if i[1] == done_id), None)
nxt = next((i for i in items if not i[0]), None)

lines = [
    "<!-- STATUS:START -->",
    f"**Progress:** `{bar}` {done}/{total} items ({pct}%)",
    "",
    f"- **Last finished:** #{last[1]} — `{last[2]}`" if last else "- **Last finished:** —",
    f"- **Next up:** #{nxt[1]} — `{nxt[2]}`" + (f" ({nxt[3]})" if nxt[3] else "") if nxt else "- **Next up:** all items complete 🎉",
    f"- **Updated:** {datetime.date.today().isoformat()}",
    "<!-- STATUS:END -->",
]
block = "\n".join(lines)

text = open("README.md", encoding="utf-8").read()
new = re.sub(r"<!-- STATUS:START -->.*?<!-- STATUS:END -->", lambda _: block, text, flags=re.S)
open("README.md", "w", encoding="utf-8").write(new)
print(f"Status: {done}/{total} done ({pct}%)")
PY

# 3) commit + push
git add -A
git commit -q -m "$MSG"
git push -q -u origin "$BRANCH"
echo "Pushed: $MSG"
