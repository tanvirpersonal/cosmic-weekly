/**
 * Boot script loaded by every page:  <script type="module" src="…/js/main.js">
 *
 * It sets up the shared chrome (theme, header, footer, search, starfield,
 * reveal), then loads the page-specific module named by <body data-page="…">
 * (home | archive | article | contact). Pages without a module (about, 404)
 * simply get the chrome.
 */
import { initTheme } from "./core/theme.js";
import { getSite } from "./core/data.js";
import { mountHeader } from "./components/header.js";
import { mountFooter } from "./components/footer.js";
import { createSearch } from "./components/search.js";
import { initStarfield } from "./effects/starfield.js";
import { observeReveals } from "./effects/reveal.js";
import { setMeta } from "./core/dom.js";

const PAGES = {
  home: () => import("./pages/home.js"),
  archive: () => import("./pages/archive.js"),
  article: () => import("./pages/article.js"),
  contact: () => import("./pages/contact.js"),
};

async function boot() {
  initTheme();
  initStarfield();

  let site;
  try {
    site = await getSite();
  } catch (error) {
    console.error(error);
    document.body.classList.add("is-ready");
    return;
  }

  const search = createSearch();
  mountHeader(site, { onSearch: search.open });
  mountFooter(site);

  const page = document.body.dataset.page;
  if (page && PAGES[page]) {
    try {
      const module = await PAGES[page]();
      await module.init({ site });
    } catch (error) {
      console.error(`Page "${page}" failed to load`, error);
    }
  }

  setMeta({}); // keeps whatever the page set; hook for future shared meta
  observeReveals();
  document.body.classList.add("is-ready");
}

boot();
