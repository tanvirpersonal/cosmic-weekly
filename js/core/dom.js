/**
 * DOM helpers.
 *
 * Rule for the whole project: data coming from JSON or Markdown never goes
 * through innerHTML unescaped. Use h() (text is always set via textContent)
 * or escapeHtml() when building strings.
 */

export const qs = (selector, root = document) => root.querySelector(selector);
export const qsa = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Escape a string for safe use inside HTML text or attribute values. */
export function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  })[ch]);
}

/**
 * Create an element.
 *   h("a", { class: "btn", href: "/x", onclick: fn }, "Label", h("span", {}, "!"))
 * - "class" / "className" set the class list
 * - "dataset" takes an object
 * - keys starting with "on" attach event listeners
 * - false / null / undefined attributes are skipped
 * - string children become text nodes (never parsed as HTML)
 */
export function h(tag, attrs = {}, ...children) {
  const el = document.createElement(tag);

  for (const [key, value] of Object.entries(attrs || {})) {
    if (value === false || value == null) continue;

    if (key === "class" || key === "className") el.className = value;
    else if (key === "dataset") Object.assign(el.dataset, value);
    else if (key === "style" && typeof value === "object") Object.assign(el.style, value);
    else if (key.startsWith("on") && typeof value === "function") {
      el.addEventListener(key.slice(2).toLowerCase(), value);
    } else if (value === true) el.setAttribute(key, "");
    else el.setAttribute(key, String(value));
  }

  append(el, ...children);
  return el;
}

/** Append children (strings, nodes, arrays, or falsy values to skip). */
export function append(parent, ...children) {
  for (const child of children.flat(Infinity)) {
    if (child === false || child == null) continue;
    parent.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return parent;
}

/** Remove all children, then optionally append new ones. */
export function replace(parent, ...children) {
  parent.replaceChildren();
  return append(parent, ...children);
}

/** Build an inline SVG icon from a path definition (24×24 viewBox, stroke style). */
export function icon(pathData, { size = 20, label = "" } = {}) {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", size);
  svg.setAttribute("height", size);
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "1.8");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  if (label) {
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", label);
  } else {
    svg.setAttribute("aria-hidden", "true");
  }
  for (const d of [].concat(pathData)) {
    const path = document.createElementNS(ns, "path");
    path.setAttribute("d", d);
    svg.append(path);
  }
  return svg;
}

/** Icon path library used by components. */
export const ICONS = {
  search: ["M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z", "m21 21-4.3-4.3"],
  menu: ["M4 7h16", "M4 12h16", "M4 17h16"],
  close: ["M6 6l12 12", "M18 6 6 18"],
  sun: [
    "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
    "M12 2v2", "M12 20v2", "M4.9 4.9l1.4 1.4", "M17.7 17.7l1.4 1.4",
    "M2 12h2", "M20 12h2", "M4.9 19.1l1.4-1.4", "M17.7 6.3l1.4-1.4",
  ],
  moon: ["M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z"],
  arrowRight: ["M5 12h14", "m13 6 6 6-6 6"],
  arrowLeft: ["M19 12H5", "m11 6-6 6 6 6"],
  link: [
    "M10 13a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1",
    "M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
  ],
  share: ["M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7", "M16 6l-4-4-4 4", "M12 2v14"],
};

/** Debounce a function. */
export function debounce(fn, wait = 150) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}

/** Format an ISO date (YYYY-MM-DD) for display, e.g. "10 Nov 2026". */
export function formatDate(iso, locale = undefined) {
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" });
}

/** Set <title> and meta description for the current page. */
export function setMeta({ title, description } = {}) {
  if (title) document.title = title;
  if (description) {
    let meta = qs('meta[name="description"]');
    if (!meta) {
      meta = h("meta", { name: "description" });
      document.head.append(meta);
    }
    meta.setAttribute("content", description);
  }
}
