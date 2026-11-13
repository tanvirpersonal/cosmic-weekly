/**
 * Full-screen live search overlay.
 *   - open with the header button or the "/" key, close with Esc / backdrop
 *   - arrow keys move through results, Enter opens
 *   - focus is trapped inside while open and restored on close
 */
import { PATHS, SETTINGS, url } from "../config.js";
import { h, qs, qsa, replace, icon, ICONS, debounce, escapeHtml } from "../core/dom.js";
import { getArticles, getTopics, searchArticles } from "../core/data.js";

function highlight(text, query) {
  const safe = escapeHtml(text);
  const terms = query.split(/\s+/).filter((t) => t.length > 1).map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  if (!terms.length) return safe;
  return safe.replace(new RegExp(`(${terms.map(escapeHtml).join("|")})`, "gi"), "<mark>$1</mark>");
}

export function createSearch() {
  let articles = [];
  let topics = [];
  let loaded = false;
  let lastFocus = null;
  let active = -1;

  const input = h("input", {
    class: "search__input",
    type: "search",
    placeholder: "Search stories, topics, tags…",
    autocomplete: "off",
    spellcheck: "false",
    "aria-label": "Search articles",
    role: "combobox",
    "aria-expanded": "true",
    "aria-controls": "search-results",
  });
  const results = h("ul", { class: "search__results", id: "search-results", role: "listbox" });
  const closeBtn = h("button", { class: "icon-btn", type: "button", "aria-label": "Close search" }, icon(ICONS.close));

  const overlay = h("div", { class: "search", role: "dialog", "aria-modal": "true", "aria-label": "Search" },
    h("div", { class: "search__panel" },
      h("div", { class: "search__bar" }, icon(ICONS.search), input, closeBtn),
      results
    )
  );
  document.body.append(overlay);

  const topicName = (id) => topics.find((t) => t.id === id)?.name || id;

  function setActive(index) {
    const items = qsa("a", results);
    if (!items.length) return;
    active = (index + items.length) % items.length;
    items.forEach((a, i) => {
      a.classList.toggle("is-active", i === active);
      a.setAttribute("aria-selected", String(i === active));
    });
    items[active].scrollIntoView({ block: "nearest" });
  }

  function render() {
    const query = input.value.trim();
    active = -1;

    if (!loaded) {
      replace(results, h("li", { class: "search__empty" }, "Loading…"));
      return;
    }

    const pool = query.length >= SETTINGS.searchMinChars ? searchArticles(articles, query) : articles;
    const shown = pool.slice(0, SETTINGS.searchMaxResults);

    if (!shown.length) {
      replace(results, h("li", { class: "search__empty" }, `No stories match “${query}”.`));
      return;
    }

    replace(results,
      !query && h("li", { class: "label", style: { padding: "var(--space-3) var(--space-4)" } }, "Latest stories"),
      shown.map((article) => {
        const title = h("span", { class: "search__item-title" });
        title.innerHTML = highlight(article.title, query); // escaped first in highlight()
        return h("li", { class: "search__item", role: "option" },
          h("a", { href: url(PATHS.articlePage(article.slug)) },
            title,
            h("span", { class: "search__item-meta" }, `${topicName(article.topic)} · ${article.readTime} min read`)
          )
        );
      })
    );
  }

  async function ensureData() {
    if (loaded) return;
    try {
      [articles, topics] = await Promise.all([getArticles(), getTopics()]);
      loaded = true;
    } catch {
      replace(results, h("li", { class: "search__empty" }, "Search is unavailable right now."));
      return;
    }
    render();
  }

  function open() {
    if (overlay.classList.contains("is-open")) return;
    lastFocus = document.activeElement;
    overlay.classList.add("is-open");
    document.body.classList.add("is-locked");
    render();
    input.focus();
    ensureData();
  }

  function close() {
    if (!overlay.classList.contains("is-open")) return;
    overlay.classList.remove("is-open");
    document.body.classList.remove("is-locked");
    input.value = "";
    lastFocus?.focus?.();
  }

  input.addEventListener("input", debounce(render, 90));
  closeBtn.addEventListener("click", close);
  overlay.addEventListener("mousedown", (event) => event.target === overlay && close());
  results.addEventListener("click", (event) => event.target.closest("a") && close());

  overlay.addEventListener("keydown", (event) => {
    if (event.key === "Escape") return close();
    if (event.key === "ArrowDown") { event.preventDefault(); setActive(active + 1); }
    else if (event.key === "ArrowUp") { event.preventDefault(); setActive(active - 1); }
    else if (event.key === "Enter") {
      const link = qsa("a", results)[Math.max(active, 0)];
      if (link) { event.preventDefault(); link.click(); }
    } else if (event.key === "Tab") {
      // simple focus trap: input ↔ close button ↔ result links
      const focusable = [input, closeBtn, ...qsa("a", results)];
      const index = focusable.indexOf(document.activeElement);
      const next = event.shiftKey ? index - 1 : index + 1;
      if (next < 0 || next >= focusable.length) {
        event.preventDefault();
        focusable[next < 0 ? focusable.length - 1 : 0].focus();
      }
    }
  });

  // "/" opens search unless the user is typing somewhere
  document.addEventListener("keydown", (event) => {
    if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
    const el = document.activeElement;
    const typing = el && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));
    if (typing) return;
    event.preventDefault();
    open();
  });

  return { open, close };
}
