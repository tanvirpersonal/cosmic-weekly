/**
 * Small, safe Markdown renderer.
 *
 * Supports: headings (#–####), paragraphs, **bold**, *italic*, ~~strike~~,
 * `code`, fenced code blocks, links, images (alone on a line → <figure>),
 * blockquotes, ordered / unordered lists (nested), tables, horizontal rules.
 *
 * Safety: raw HTML in the source is escaped (never rendered), and link / image
 * URLs only allow http(s), mailto, anchors and relative paths.
 *
 *   const { html, headings } = renderMarkdown(source);
 */
import { escapeHtml } from "../core/dom.js";

/* ---- helpers ------------------------------------------------------------ */

const SAFE_SCHEMES = new Set(["http", "https", "mailto"]);

function safeUrl(raw) {
  const value = String(raw || "").trim();
  const scheme = /^([a-z][a-z0-9+.-]*):/i.exec(value);
  if (scheme && !SAFE_SCHEMES.has(scheme[1].toLowerCase())) return "#";
  return value;
}

export function slugify(text) {
  return (
    String(text)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9ঀ-৿]+/g, "-") // keeps Bengali letters too
      .replace(/^-+|-+$/g, "") || "section"
  );
}

const indentOf = (line) => /^\s*/.exec(line)[0].length;

/* ---- inline ------------------------------------------------------------- */

function inline(text) {
  const codes = [];

  // 1) pull out code spans so nothing inside them is formatted
  let out = String(text).replace(/(`+)([\s\S]*?[^`])\1(?!`)/g, (_, __, code) => {
    codes.push(`<code>${escapeHtml(code.trim())}</code>`);
    return `\u0000${codes.length - 1}\u0000`;
  });

  // 2) escape everything else
  out = escapeHtml(out);

  // 3) images, then links
  out = out.replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;(.*?)&quot;)?\)/g, (_, alt, src, title) =>
    `<img src="${safeUrl(src)}" alt="${alt}"${title ? ` title="${title}"` : ""} loading="lazy" decoding="async">`
  );

  out = out.replace(/\[([^\]]+)\]\(([^)\s]+)(?:\s+&quot;(.*?)&quot;)?\)/g, (_, label, href, title) => {
    const safe = safeUrl(href);
    const external = /^https?:/i.test(safe);
    return `<a href="${safe}"${title ? ` title="${title}"` : ""}${
      external ? ' target="_blank" rel="noopener noreferrer"' : ""
    }>${label}</a>`;
  });

  // 4) emphasis
  out = out
    .replace(/\*\*([^*\n]+?)\*\*/g, "<strong>$1</strong>")
    .replace(/(^|[^\w])__([^_\n]+?)__(?!\w)/g, "$1<strong>$2</strong>")
    .replace(/(^|[^*\w])\*([^*\s][^*\n]*?)\*(?!\*)/g, "$1<em>$2</em>")
    .replace(/(^|[^\w])_([^_\s][^_\n]*?)_(?!\w)/g, "$1<em>$2</em>")
    .replace(/~~([^~\n]+?)~~/g, "<del>$1</del>");

  // 5) put code spans back
  return out.replace(/\u0000(\d+)\u0000/g, (_, index) => codes[Number(index)]);
}

/* ---- block patterns ----------------------------------------------------- */

const FENCE = /^\s*```\s*([\w-]*)\s*$/;
const HEADING = /^(#{1,4})\s+(.*?)\s*#*\s*$/;
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const QUOTE = /^\s*>\s?/;
const LIST = /^(\s*)([-*+]|\d+[.)])\s+(.*)$/;
const TABLE_SEP = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const IMAGE_ONLY = /^\s*!\[([^\]]*)\]\(([^)\s]+)(?:\s+"(.*?)")?\)\s*$/;

const isBlockStart = (line) =>
  FENCE.test(line) || HEADING.test(line) || HR.test(line) || QUOTE.test(line) || LIST.test(line);

function splitRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/* ---- block parser ------------------------------------------------------- */

function parseBlocks(lines, ctx) {
  const html = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    // blank line
    if (!line.trim()) {
      i++;
      continue;
    }

    // fenced code block
    const fence = FENCE.exec(line);
    if (fence) {
      const body = [];
      i++;
      while (i < lines.length && !/^\s*```\s*$/.test(lines[i])) body.push(lines[i++]);
      i++; // closing fence
      const lang = fence[1] ? ` class="language-${escapeHtml(fence[1])}"` : "";
      html.push(`<pre><code${lang}>${escapeHtml(body.join("\n"))}</code></pre>`);
      continue;
    }

    // heading
    const heading = HEADING.exec(line);
    if (heading) {
      const level = heading[1].length;
      const text = heading[2];
      let id = slugify(text.replace(/[*_`~]/g, ""));
      const seen = ctx.ids.get(id) || 0;
      ctx.ids.set(id, seen + 1);
      if (seen) id = `${id}-${seen + 1}`;
      if (level === 2 || level === 3) {
        ctx.headings.push({ id, level, text: text.replace(/[*_`~]/g, "") });
      }
      html.push(`<h${level} id="${id}">${inline(text)}</h${level}>`);
      i++;
      continue;
    }

    // horizontal rule
    if (HR.test(line)) {
      html.push("<hr>");
      i++;
      continue;
    }

    // blockquote (recursive)
    if (QUOTE.test(line)) {
      const inner = [];
      while (i < lines.length && (QUOTE.test(lines[i]) || (lines[i].trim() && inner.length && !isBlockStart(lines[i])))) {
        inner.push(lines[i].replace(QUOTE, ""));
        i++;
      }
      html.push(`<blockquote>${parseBlocks(inner, ctx)}</blockquote>`);
      continue;
    }

    // table
    if (line.includes("|") && i + 1 < lines.length && TABLE_SEP.test(lines[i + 1])) {
      const head = splitRow(line);
      const aligns = splitRow(lines[i + 1]).map((cell) =>
        /^:-+:$/.test(cell) ? "center" : /-+:$/.test(cell) ? "right" : ""
      );
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim() && lines[i].includes("|")) rows.push(splitRow(lines[i++]));

      const cell = (tag, text, idx) =>
        `<${tag}${aligns[idx] ? ` style="text-align:${aligns[idx]}"` : ""}>${inline(text)}</${tag}>`;

      html.push(
        `<table><thead><tr>${head.map((c, idx) => cell("th", c, idx)).join("")}</tr></thead>` +
          `<tbody>${rows
            .map((row) => `<tr>${head.map((_, idx) => cell("td", row[idx] || "", idx)).join("")}</tr>`)
            .join("")}</tbody></table>`
      );
      continue;
    }

    // list
    if (LIST.test(line)) {
      const result = parseList(lines, i, ctx);
      html.push(result.html);
      i = result.next;
      continue;
    }

    // image on its own line → figure
    const image = IMAGE_ONLY.exec(line);
    if (image) {
      const [, alt, src, caption] = image;
      html.push(
        `<figure><img src="${safeUrl(src)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">` +
          `${caption ? `<figcaption>${inline(caption)}</figcaption>` : ""}</figure>`
      );
      i++;
      continue;
    }

    // paragraph
    const para = [line.trim()];
    i++;
    while (i < lines.length && lines[i].trim() && !isBlockStart(lines[i])) para.push(lines[i++].trim());
    html.push(`<p>${inline(para.join(" "))}</p>`);
  }

  return html.join("\n");
}

function parseList(lines, start, ctx) {
  const first = LIST.exec(lines[start]);
  const baseIndent = first[1].length;
  const ordered = /\d/.test(first[2]);
  const items = [];
  let i = start;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      // a blank line ends the list unless the next line continues it
      let j = i + 1;
      while (j < lines.length && !lines[j].trim()) j++;
      const next = lines[j];
      if (next !== undefined && (indentOf(next) > baseIndent || (LIST.test(next) && indentOf(next) === baseIndent))) {
        i = j;
        continue;
      }
      break;
    }

    const match = LIST.exec(line);
    const indent = indentOf(line);

    if (match && indent === baseIndent) {
      if (/\d/.test(match[2]) !== ordered) break; // different list type
      items.push({ text: match[3], sub: [] });
      i++;
    } else if (indent > baseIndent && items.length) {
      items[items.length - 1].sub.push(line);
      i++;
    } else if (items.length && !isBlockStart(line)) {
      items[items.length - 1].text += ` ${line.trim()}`; // lazy continuation
      i++;
    } else {
      break;
    }
  }

  const tag = ordered ? "ol" : "ul";
  const body = items
    .map((item) => {
      let nested = "";
      if (item.sub.length) {
        const cut = Math.min(...item.sub.map(indentOf));
        nested = parseBlocks(item.sub.map((l) => l.slice(cut)), ctx);
      }
      return `<li>${inline(item.text)}${nested}</li>`;
    })
    .join("");

  return { html: `<${tag}>${body}</${tag}>`, next: i };
}

/* ---- public API --------------------------------------------------------- */

/**
 * @param {string} source Markdown text
 * @returns {{ html: string, headings: {id:string, level:number, text:string}[] }}
 */
export function renderMarkdown(source) {
  const ctx = { headings: [], ids: new Map() };
  const lines = String(source ?? "").replace(/\r\n?/g, "\n").split("\n");
  const html = parseBlocks(lines, ctx);
  return { html, headings: ctx.headings };
}
