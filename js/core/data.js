/**
 * Data layer: loads JSON + Markdown, caches the promises so each file is
 * fetched at most once per page view.
 */
import { PATHS, url } from "../config.js";

const cache = new Map();

function load(path, parse) {
  if (!cache.has(path)) {
    const promise = fetch(url(path))
      .then((response) => {
        if (!response.ok) throw new Error(`Could not load ${path} (${response.status})`);
        return parse(response);
      })
      .catch((error) => {
        cache.delete(path); // allow a retry on the next call
        throw error;
      });
    cache.set(path, promise);
  }
  return cache.get(path);
}

const json = (path) => load(path, (response) => response.json());
const text = (path) => load(path, (response) => response.text());

export const getSite = () => json(PATHS.site);
export const getTopics = () => json(PATHS.topics);

/** All articles, newest first. */
export async function getArticles() {
  const articles = await json(PATHS.articles);
  return [...articles].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getTopic(id) {
  const topics = await getTopics();
  return topics.find((topic) => topic.id === id) || null;
}

export async function getArticle(slug) {
  const articles = await getArticles();
  return articles.find((article) => article.slug === slug) || null;
}

/** Raw Markdown for one article. */
export const getArticleBody = (slug) => text(PATHS.articleBody(slug));

/** Topics + article counts, used by filters and the home page. */
export async function getTopicsWithCounts() {
  const [topics, articles] = await Promise.all([getTopics(), getArticles()]);
  return topics.map((topic) => ({
    ...topic,
    count: articles.filter((article) => article.topic === topic.id).length,
  }));
}

/** Articles related to the given one: same topic first, then shared tags. */
export async function getRelated(article, limit = 3) {
  const articles = await getArticles();
  const tags = new Set(article.tags || []);

  return articles
    .filter((other) => other.slug !== article.slug)
    .map((other) => ({
      article: other,
      score:
        (other.topic === article.topic ? 10 : 0) +
        (other.tags || []).filter((tag) => tags.has(tag)).length,
    }))
    .sort((a, b) => b.score - a.score || b.article.date.localeCompare(a.article.date))
    .slice(0, limit)
    .map((entry) => entry.article);
}

/** Previous (older) and next (newer) article in chronological order. */
export async function getNeighbours(slug) {
  const articles = await getArticles(); // newest first
  const index = articles.findIndex((article) => article.slug === slug);
  return {
    newer: index > 0 ? articles[index - 1] : null,
    older: index >= 0 && index < articles.length - 1 ? articles[index + 1] : null,
  };
}

/** Simple, accent-insensitive search over title, dek, tags and topic. */
export function searchArticles(articles, query) {
  const normalise = (value) =>
    String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "");

  const terms = normalise(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return articles;

  return articles.filter((article) => {
    const haystack = normalise(
      [article.title, article.dek, article.topic, ...(article.tags || [])].join(" ")
    );
    return terms.every((term) => haystack.includes(term));
  });
}
