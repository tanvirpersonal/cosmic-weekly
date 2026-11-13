/**
 * Toast notifications.
 *   toast("Link copied");
 *   toast("Something went wrong", { type: "error" });
 * The region is an aria-live container, so screen readers announce messages.
 */
import { SETTINGS } from "../config.js";
import { h } from "../core/dom.js";

let region;

function getRegion() {
  if (!region) {
    region = h("div", { class: "toast-region", role: "status", "aria-live": "polite", "aria-atomic": "false" });
    document.body.append(region);
  }
  return region;
}

export function toast(message, { type = "info", duration = SETTINGS.toastMs } = {}) {
  const el = h("div", { class: `toast${type !== "info" ? ` toast--${type}` : ""}` }, message);
  getRegion().append(el);

  const remove = () => {
    el.classList.add("is-leaving");
    el.addEventListener("animationend", () => el.remove(), { once: true });
    setTimeout(() => el.remove(), 600); // fallback if animations are disabled
  };
  setTimeout(remove, duration);
  return remove;
}
