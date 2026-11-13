/**
 * Home page: stats, featured stories, latest grid, topic tiles.
 * The hero text itself is static HTML (good for SEO and no-JS).
 */
import { SETTINGS } from "../config.js";
import { h, qs, replace } from "../core/dom.js";
import { getArticles, getTopics } from "../core/data.js";
import { articleCard, featureCard, topicCard, emptyState, skeletons } from "../components/cards.js";
import { observeReveals } from "../effects/reveal.js";

function stat(value, label) {
  return h("div", { class: "hero__stat" },
    h("strong", {}, String(value)),
    h("span", { class: "label" }, label)
  );
}

export async function init() {
  const featuredEl = qs("#featured");
  const latestEl = qs("#latest");
  const topicsEl = qs("#topics");
  const statsEl = qs("#hero-stats");

  replace(latestEl, skeletons(3));

  let articles;
  let topics;
  try {
    [articles, topics] = await Promise.all([getArticles(), getTopics()]);
  } catch (error) {
    console.error(error);
    const message = emptyState("Stories are unavailable", "We couldn't load the article list. Please refresh the page.");
    replace(latestEl, message);
    return;
  }

  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  // Stats
  const totalMinutes = articles.reduce((sum, a) => sum + a.readTime, 0);
  replace(statsEl,
    stat(articles.length, "Stories"),
    stat(topics.length, "Topics"),
    stat(totalMinutes, "Minutes of reading")
  );

  // Featured: flagged articles first, topped up with the newest
  const flagged = articles.filter((a) => a.featured);
  const featured = [...flagged, ...articles.filter((a) => !a.featured)].slice(0, SETTINGS.homeFeaturedCount);
  const [lead, ...rest] = featured;

  if (lead) {
    replace(featuredEl,
      featureCard(lead, topicById.get(lead.topic)),
      rest.length > 0 && h("div", { class: "grid grid--2" }, rest.map((a) => articleCard(a, topicById.get(a.topic))))
    );
  } else {
    replace(featuredEl, emptyState("Nothing featured yet", "Check back soon."));
  }

  // Latest: newest stories that are not already shown above
  const shown = new Set(featured.map((a) => a.slug));
  const latest = articles.filter((a) => !shown.has(a.slug)).slice(0, SETTINGS.homeLatestCount);
  replace(latestEl,
    latest.length
      ? latest.map((a) => articleCard(a, topicById.get(a.topic)))
      : emptyState("You're all caught up", "Every story is featured above.")
  );

  // Topics with counts
  replace(topicsEl,
    topics.map((topic) =>
      topicCard({ ...topic, count: articles.filter((a) => a.topic === topic.id).length })
    )
  );

  observeReveals();
}
