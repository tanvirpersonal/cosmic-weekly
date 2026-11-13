/**
 * Card components built from article / topic data.
 * Class names match css/components.css and css/pages.css.
 */
import { PATHS, url } from "../config.js";
import { h, formatDate } from "../core/dom.js";

/** Generated cover art, tinted by the article's topic colours. */
export function cover(topic, extraClass = "") {
  const [c1, c2] = topic?.colors || ["#8b7bff", "#2fd6e8"];
  return h("div", {
    class: `cover ${extraClass}`.trim(),
    role: "presentation",
    style: { "--c1": c1, "--c2": c2 },
  });
}

const meta = (article) =>
  h("div", { class: "card__meta" },
    h("span", {}, formatDate(article.date)),
    h("span", { class: "dot" }, `${article.readTime} min read`)
  );

/** Standard article card. */
export function articleCard(article, topic) {
  return h("article", { class: "card reveal" },
    cover(topic, "card__media"),
    h("div", { class: "card__body" },
      h("span", { class: "label label--accent" }, topic?.name || article.topic),
      h("h3", { class: "card__title" },
        h("a", { href: url(PATHS.articlePage(article.slug)) }, article.title)),
      h("p", { class: "card__dek" }, article.dek),
      meta(article)
    )
  );
}

/** Large featured card (home page). */
export function featureCard(article, topic) {
  return h("article", { class: "feature reveal" },
    cover(topic),
    h("div", { class: "feature__body" },
      h("span", { class: "tag" }, topic?.name || article.topic),
      h("h3", { class: "feature__title" },
        h("a", { href: url(PATHS.articlePage(article.slug)) }, article.title)),
      h("p", { class: "feature__dek" }, article.dek),
      meta(article)
    )
  );
}

/** Topic tile (home page). */
export function topicCard(topic) {
  return h("a", { class: "topic-card reveal", href: url(PATHS.archivePage({ topic: topic.id })) },
    h("span", { class: "topic-card__icon", "aria-hidden": "true" }, topic.icon),
    h("span", { class: "topic-card__name" }, topic.name),
    h("p", { class: "topic-card__desc" }, topic.description),
    h("span", { class: "label" }, `${topic.count ?? 0} ${topic.count === 1 ? "story" : "stories"}`)
  );
}

/** Filter chip. Renders a button; the caller handles click. */
export function topicChip({ label, count, active, onClick }) {
  return h("button", {
    class: `chip${active ? " is-active" : ""}`,
    type: "button",
    "aria-pressed": String(Boolean(active)),
    onclick: onClick,
  }, label, count != null && h("span", { class: "chip__count" }, count));
}

/** Empty-state block. */
export function emptyState(title, text) {
  return h("div", { class: "empty" }, h("h3", {}, title), h("p", {}, text));
}

/** Loading skeletons. */
export const skeletons = (count = 3) =>
  Array.from({ length: count }, () => h("div", { class: "skeleton", "aria-hidden": "true" }));
