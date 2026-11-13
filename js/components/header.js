/**
 * Site header: brand, nav, search button, theme toggle, mobile menu.
 * Mounts into <header id="site-header">.
 */
import { ROOT, url } from "../config.js";
import { h, qs, replace, icon, ICONS } from "../core/dom.js";
import { getTheme, toggleTheme, onThemeChange } from "../core/theme.js";

const brandMark = () => {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 64 64");
  svg.setAttribute("class", "brand__mark");
  svg.setAttribute("aria-hidden", "true");
  svg.innerHTML =
    '<defs><linearGradient id="bm" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8b7bff"/><stop offset="1" stop-color="#2fd6e8"/></linearGradient></defs>' +
    '<ellipse cx="32" cy="32" rx="26" ry="10" fill="none" stroke="url(#bm)" stroke-width="4" transform="rotate(-24 32 32)"/>' +
    '<circle cx="32" cy="32" r="11" fill="#f5b94a"/><circle cx="54" cy="22" r="3" fill="#2fd6e8"/>';
  return svg;
};

/** True when `path` is the page we are on (handles "" for home). */
function isCurrent(path) {
  const here = location.pathname.replace(/index\.html$/, "");
  const target = new URL(path, ROOT).pathname;
  if (path === "") return here === target;
  if (here.startsWith(target)) return true;
  // the reader (/article/?slug=…) belongs to the "Articles" section
  return path === "articles/" && here.startsWith(new URL("article/", ROOT).pathname);
}

export function mountHeader(site, { onSearch } = {}) {
  const host = qs("#site-header");
  if (!host) return;

  const links = site.nav.map((item) =>
    h("a", { href: url(item.path), "aria-current": isCurrent(item.path) ? "page" : false }, item.label)
  );

  const themeBtn = h("button", { class: "icon-btn", type: "button", id: "theme-toggle" });
  const paintTheme = (theme) => {
    const next = theme === "dark" ? "light" : "dark";
    themeBtn.setAttribute("aria-label", `Switch to ${next} theme`);
    themeBtn.title = `Switch to ${next} theme`;
    replace(themeBtn, icon(theme === "dark" ? ICONS.sun : ICONS.moon));
  };
  paintTheme(getTheme());
  onThemeChange(paintTheme);
  themeBtn.addEventListener("click", toggleTheme);

  const searchBtn = h(
    "button",
    { class: "icon-btn", type: "button", "aria-label": "Search articles (press /)", title: "Search ( / )", onclick: () => onSearch?.() },
    icon(ICONS.search)
  );

  const panel = h(
    "div",
    { class: "mobile-panel", id: "mobile-panel", role: "dialog", "aria-label": "Menu" },
    site.nav.map((item) =>
      h("a", { href: url(item.path), "aria-current": isCurrent(item.path) ? "page" : false }, item.label)
    )
  );

  const menuBtn = h("button", {
    class: "icon-btn",
    type: "button",
    id: "menu-toggle",
    "aria-label": "Open menu",
    "aria-expanded": "false",
    "aria-controls": "mobile-panel",
  }, icon(ICONS.menu));

  const setMenu = (open) => {
    panel.classList.toggle("is-open", open);
    document.body.classList.toggle("is-locked", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    replace(menuBtn, icon(open ? ICONS.close : ICONS.menu));
  };
  menuBtn.addEventListener("click", () => setMenu(!panel.classList.contains("is-open")));
  panel.addEventListener("click", (event) => event.target.closest("a") && setMenu(false));
  document.addEventListener("keydown", (event) => event.key === "Escape" && setMenu(false));
  window.matchMedia("(min-width: 821px)").addEventListener("change", (e) => e.matches && setMenu(false));

  replace(
    host,
    h("div", { class: "container site-header__inner" },
      h("a", { class: "brand", href: url(""), "aria-label": `${site.name} — home` },
        brandMark(), h("span", { class: "brand__name" }, "Cosmic", h("span", {}, "Weekly"))),
      h("nav", { class: "site-nav", "aria-label": "Main" }, links),
      h("div", { class: "site-header__actions" }, searchBtn, themeBtn, menuBtn)
    ),
    panel
  );

  // Border + stronger background once the page is scrolled
  const onScroll = () => host.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}
