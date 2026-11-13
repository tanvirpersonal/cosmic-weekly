/**
 * Reader page: /article/?slug=<slug>
 * Loads the Markdown body, renders it with the safe parser, then adds the
 * table of contents, reading-progress bar, share row, prev/next and related stories.
 */
import { PATHS, SETTINGS, url } from "../config.js";
import { h, qs, qsa, replace, icon, ICONS, formatDate, setMeta } from "../core/dom.js";
import { getArticle, getArticleBody, getNeighbours, getRelated, getTopic } from "../core/data.js";
import { renderMarkdown } from "../lib/markdown.js";
import { articleCard, cover, emptyState } from "../components/cards.js";
import { toast } from "../components/toast.js";
import { observeReveals } from "../effects/reveal.js";

/* ---- <head> helpers ----------------------------------------------------- */

function setHeadTag(selector, create, attr, value) {
  let el = qs(selector);
  if (!el) {
    el = create();
    document.head.append(el);
  }
  el.setAttribute(attr, value);
}

function updateHead(article, site) {
  const pageUrl = new URL(PATHS.articlePage(article.slug), site.url).href;
  const title = `${article.title} — ${site.name}`;
  setMeta({ title, description: article.dek });

  setHeadTag('link[rel="canonical"]', () => h("link", { rel: "canonical" }), "href", pageUrl);
  for (const [property, value] of [
    ["og:title", title],
    ["og:description", article.dek],
    ["og:url", pageUrl],
  ]) {
    setHeadTag(`meta[property="${property}"]`, () => h("meta", { property }), "content", value);
  }

  const ld = h("script", { type: "application/ld+json" });
  ld.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.dek,
    datePublished: article.date,
    author: { "@type": "Person", name: article.author },
    publisher: { "@type": "Organization", name: site.name },
    mainEntityOfPage: pageUrl,
  });
  document.head.append(ld);
}

/* ---- pieces ------------------------------------------------------------- */

function renderHead(article, topic) {
  return h("header", { class: "article-head" },
    h("a", { class: "article-head__back", href: url("articles/") }, icon(ICONS.arrowLeft, { size: 16 }), "All stories"),
    h("div", {}, h("a", { class: "tag", href: url(PATHS.archivePage({ topic: article.topic })) }, topic?.name || article.topic)),
    h("h1", {}, article.title),
    h("p", { class: "article-head__dek" }, article.dek),
    h("div", { class: "article-head__meta" },
      h("span", { class: "label" }, formatDate(article.date)),
      h("span", { class: "label" }, `${article.readTime} min read`),
      h("span", { class: "label" }, `By ${article.author}`)
    )
  );
}

function renderToc(headings) {
  return h("aside", { class: "toc", "aria-label": "Table of contents" },
    h("p", { class: "label toc__title" }, "In this story"),
    h("ol", {},
      headings.map((item) =>
        h("li", { "data-level": item.level }, h("a", { href: `#${item.id}`, "data-id": item.id }, item.text))
      )
    )
  );
}

async function copyLink(link) {
  try {
    await navigator.clipboard.writeText(link);
    toast("Link copied to clipboard", { type: "success" });
  } catch {
    toast("Copy the link from your address bar", { type: "error" });
  }
}

function renderFoot(article) {
  const link = location.href.split("#")[0];
  const actions = [
    h("button", { class: "btn btn--ghost btn--sm", type: "button", onclick: () => copyLink(link) },
      icon(ICONS.link, { size: 16 }), "Copy link"),
  ];

  if (navigator.share) {
    actions.push(
      h("button", {
        class: "btn btn--ghost btn--sm",
        type: "button",
        onclick: () => navigator.share({ title: article.title, text: article.dek, url: link }).catch(() => {}),
      }, icon(ICONS.share, { size: 16 }), "Share")
    );
  }

  return h("footer", { class: "article-foot" },
    h("div", { class: "cluster" },
      (article.tags || []).map((tag) =>
        h("a", { class: "chip", href: url(PATHS.archivePage({ q: tag })) }, `#${tag}`))
    ),
    h("div", { class: "cluster" }, actions)
  );
}

function renderPager({ older, newer }) {
  if (!older && !newer) return null;

  const item = (article, label, extra = "") =>
    article
      ? h("a", { class: extra, href: url(PATHS.articlePage(article.slug)) },
          h("span", { class: "label" }, label),
          h("span", { class: "pager__title" }, article.title))
      : h("span", { "aria-hidden": "true" });

  return h("nav", { class: "pager", "aria-label": "More stories" },
    item(older, "← Older story"),
    item(newer, "Newer story →", "pager__next")
  );
}

/* ---- reading progress + active TOC link --------------------------------- */

function trackReading(prose, toc) {
  const bar = qs("#progress-bar");
  const headings = qsa("h2[id], h3[id]", prose);
  const links = toc ? qsa("a[data-id]", toc) : [];
  let ticking = false;

  function update() {
    ticking = false;
    const rect = prose.getBoundingClientRect();
    const total = rect.height - window.innerHeight * 0.6;
    const done = Math.min(Math.max(-rect.top + window.innerHeight * 0.1, 0), total);
    if (bar) bar.style.transform = `scaleX(${total > 0 ? (done / total).toFixed(4) : 1})`;

    if (links.length) {
      let current = headings[0]?.id;
      for (const heading of headings) {
        if (heading.getBoundingClientRect().top <= 120) current = heading.id;
      }
      links.forEach((a) => {
        const on = a.dataset.id === current;
        a.classList.toggle("is-active", on);
        if (on) a.setAttribute("aria-current", "true");
        else a.removeAttribute("aria-current");
      });
    }
  }

  const onScroll = () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll, { passive: true });
  update();
}

/* ---- entry point -------------------------------------------------------- */

export async function init({ site }) {
  const root = qs("#article-root");
  const slug = new URLSearchParams(location.search).get("slug");

  const notFound = () => {
    setMeta({ title: `Story not found — ${site.name}` });
    document.head.append(h("meta", { name: "robots", content: "noindex" }));
    replace(root,
      h("div", { class: "section" },
        emptyState("We couldn't find that story", "It may have moved, or the link might be mistyped."),
        h("p", { style: { textAlign: "center", marginTop: "var(--space-5)" } },
          h("a", { class: "btn btn--primary", href: url("articles/") }, "Browse all stories"))
      )
    );
  };

  if (!slug) return notFound();

  let article;
  try {
    article = await getArticle(slug);
  } catch (error) {
    console.error(error);
    return notFound();
  }
  if (!article) return notFound();

  let body;
  try {
    body = await getArticleBody(slug);
  } catch (error) {
    console.error(error);
    replace(root, h("div", { class: "section" }, emptyState("This story couldn't be loaded", "Please refresh the page to try again.")));
    return;
  }

  const [topic, neighbours, related] = await Promise.all([
    getTopic(article.topic),
    getNeighbours(slug),
    getRelated(article, SETTINGS.relatedCount),
  ]);
  const relatedTopics = await Promise.all(related.map((a) => getTopic(a.topic)));

  updateHead(article, site);

  const { html, headings } = renderMarkdown(body);
  const prose = h("div", { class: "prose", id: "story" });
  prose.innerHTML = html; // output of our parser: raw HTML is escaped, URLs are filtered

  const toc = headings.length >= 2 ? renderToc(headings) : null;

  const layout = h("div", {
    class: "article-layout",
    // without a TOC there is just one column
    style: toc ? null : { gridTemplateColumns: "minmax(0, var(--reading-width))" },
  },
    toc,
    h("div", { class: "article-main" }, prose, renderFoot(article), renderPager(neighbours))
  );

  replace(root,
    renderHead(article, topic),
    cover(topic, "article-cover"),
    layout,
    related.length > 0 &&
      h("section", { class: "section", "aria-labelledby": "related-title" },
        h("div", { class: "section__head" },
          h("div", {}, h("span", { class: "label label--accent" }, "Keep reading"), h("h2", { class: "section__title", id: "related-title" }, "Related stories"))
        ),
        h("div", { class: "grid grid--cards" }, related.map((a, i) => articleCard(a, relatedTopics[i])))
      )
  );

  trackReading(prose, toc);
  observeReveals(root);

  // Deep link to a heading (#section) once the content exists.
  // getElementById, not a selector: heading ids may start with a digit.
  if (location.hash.length > 1) {
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }
}
