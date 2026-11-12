/**
 * Theme (dark / light).
 *
 * Order of precedence: saved choice → system preference → dark.
 * Each HTML page also runs a tiny inline script in <head> (see page shells) that
 * applies the saved theme before first paint, so there is no flash.
 */
import { STORAGE } from "../config.js";

const root = document.documentElement;
const THEME_COLORS = { dark: "#070914", light: "#f7f6ff" };
const listeners = new Set();

function readSaved() {
  try {
    const value = localStorage.getItem(STORAGE.theme);
    return value === "light" || value === "dark" ? value : null;
  } catch {
    return null; // storage can be blocked (private mode); fail quietly
  }
}

function systemTheme() {
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function getTheme() {
  return root.dataset.theme || readSaved() || systemTheme();
}

function apply(theme) {
  root.dataset.theme = theme;
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute("content", THEME_COLORS[theme]);
  listeners.forEach((fn) => fn(theme));
}

export function setTheme(theme, { save = true } = {}) {
  apply(theme);
  if (!save) return;
  try {
    localStorage.setItem(STORAGE.theme, theme);
  } catch {
    /* ignore */
  }
}

export function toggleTheme() {
  const next = getTheme() === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/** Subscribe to theme changes. Returns an unsubscribe function. */
export function onThemeChange(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Call once at startup. */
export function initTheme() {
  apply(readSaved() || systemTheme());

  // Follow the system only while the user has not chosen explicitly.
  window.matchMedia?.("(prefers-color-scheme: light)").addEventListener?.("change", (event) => {
    if (!readSaved()) apply(event.matches ? "light" : "dark");
  });
}
