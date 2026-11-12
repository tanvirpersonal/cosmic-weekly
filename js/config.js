/**
 * Cosmic Weekly — configuration
 *
 * Every page lives at a different depth (/, /articles/, /article/ …), and the
 * site is served from a sub-folder on GitHub Pages. So we never hard-code paths:
 * ROOT is derived from the location of this very file (js/config.js → site root).
 */

/** Absolute URL of the site root, always ending with "/". */
export const ROOT = new URL("../", import.meta.url);

/** Build an absolute URL from a site-root-relative path. url("articles/") */
export const url = (path = "") => new URL(path, ROOT).href;

/** JSON / Markdown locations (relative to the site root). */
export const PATHS = {
  site: "data/site.json",
  topics: "data/topics.json",
  articles: "data/articles.json",
  articleBody: (slug) => `content/articles/${encodeURIComponent(slug)}.md`,
  articlePage: (slug) => `article/?slug=${encodeURIComponent(slug)}`,
  archivePage: (params = {}) => {
    const qs = new URLSearchParams(
      Object.entries(params).filter(([, v]) => v !== "" && v != null)
    ).toString();
    return `articles/${qs ? `?${qs}` : ""}`;
  },
};

/** localStorage keys. */
export const STORAGE = {
  theme: "cw-theme",
};

/** Behaviour constants. */
export const SETTINGS = {
  searchMinChars: 2,
  searchMaxResults: 8,
  homeLatestCount: 6,
  homeFeaturedCount: 3,
  relatedCount: 3,
  toastMs: 3200,
  starDensity: 0.00014, // stars per pixel of viewport area
};
