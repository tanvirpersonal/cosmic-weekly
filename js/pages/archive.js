/**
 * Archive page: live search + topic filter + sort, with state kept in the URL
 * (?q=…&topic=…&sort=…) so any view can be bookmarked or shared.
 */
import { h, qs, replace, debounce, setMeta } from "../core/dom.js";
import { getArticles, getTopicsWithCounts, searchArticles } from "../core/data.js";
import { articleCard, topicChip, emptyState, skeletons } from "../components/cards.js";
import { observeReveals } from "../effects/reveal.js";

const SORTERS = {
  newest: (a, b) => b.date.localeCompare(a.date),
  oldest: (a, b) => a.date.localeCompare(b.date),
  short: (a, b) => a.readTime - b.readTime || b.date.localeCompare(a.date),
  long: (a, b) => b.readTime - a.readTime || b.date.localeCompare(a.date),
};

export async function init() {
  const grid = qs("#archive-grid");
  const filtersEl = qs("#archive-filters");
  const countEl = qs("#archive-count");
  const qInput = qs("#archive-q");
  const sortSelect = qs("#archive-sort");

  replace(grid, skeletons(6));

  let articles;
  let topics;
  try {
    [articles, topics] = await Promise.all([getArticles(), getTopicsWithCounts()]);
  } catch (error) {
    console.error(error);
    replace(grid, emptyState("Stories are unavailable", "We couldn't load the article list. Please refresh the page."));
    return;
  }

  const topicById = new Map(topics.map((topic) => [topic.id, topic]));

  // ---- state (initialised from the URL) ----
  const params = new URLSearchParams(location.search);
  const state = {
    q: params.get("q") || "",
    topic: topicById.has(params.get("topic")) ? params.get("topic") : "",
    sort: SORTERS[params.get("sort")] ? params.get("sort") : "newest",
  };

  qInput.value = state.q;
  sortSelect.value = state.sort;

  function syncUrl() {
    const next = new URLSearchParams();
    if (state.q) next.set("q", state.q);
    if (state.topic) next.set("topic", state.topic);
    if (state.sort !== "newest") next.set("sort", state.sort);
    const query = next.toString();
    history.replaceState(null, "", `${location.pathname}${query ? `?${query}` : ""}`);
  }

  function renderFilters() {
    const chip = (id, label, count) =>
      topicChip({
        label,
        count,
        active: state.topic === id,
        onClick: () => {
          state.topic = id;
          update();
        },
      });

    replace(filtersEl,
      chip("", "All", articles.length),
      topics.filter((t) => t.count > 0).map((t) => chip(t.id, t.name, t.count))
    );
  }

  function renderList() {
    let list = articles;
    if (state.topic) list = list.filter((a) => a.topic === state.topic);
    list = searchArticles(list, state.q);
    list = [...list].sort(SORTERS[state.sort]);

    const topicName = state.topic ? topicById.get(state.topic).name : "";
    const parts = [`${list.length} ${list.length === 1 ? "story" : "stories"}`];
    if (topicName) parts.push(`in ${topicName}`);
    if (state.q) parts.push(`matching “${state.q}”`);
    countEl.textContent = parts.join(" ");

    if (!list.length) {
      replace(grid,
        emptyState("No stories found", "Try a different keyword, or clear the filters to see everything.")
      );
      return;
    }

    replace(grid, list.map((a) => articleCard(a, topicById.get(a.topic))));
    observeReveals(grid);
  }

  function update() {
    syncUrl();
    renderFilters();
    renderList();
    setMeta({
      title: state.topic
        ? `${topicById.get(state.topic).name} stories — Cosmic Weekly`
        : "Articles — Cosmic Weekly",
    });
  }

  qInput.addEventListener("input", debounce(() => {
    state.q = qInput.value.trim();
    update();
  }, 120));

  sortSelect.addEventListener("change", () => {
    state.sort = sortSelect.value;
    update();
  });

  update();
}
