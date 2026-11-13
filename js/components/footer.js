/**
 * Site footer. Mounts into <footer id="site-footer">.
 */
import { url } from "../config.js";
import { h, qs, replace } from "../core/dom.js";

function footerLink(link) {
  if (link.href) {
    return h("a", { href: link.href, target: "_blank", rel: "noopener noreferrer" }, link.label);
  }
  return h("a", { href: url(link.path) }, link.label);
}

export function mountFooter(site) {
  const host = qs("#site-footer");
  if (!host) return;

  host.classList.add("site-footer");

  replace(
    host,
    h("div", { class: "container" },
      h("div", { class: "site-footer__grid" },
        h("div", { class: "stack" },
          h("a", { class: "brand", href: url("") }, h("span", { class: "brand__name" }, "Cosmic", h("span", {}, "Weekly"))),
          h("p", { class: "dim", style: { maxWidth: "34ch" } }, site.description)
        ),
        site.footerLinks.map((group) =>
          h("nav", { "aria-label": group.title },
            h("h2", { class: "label", style: { fontSize: "var(--step--2)", marginBottom: "var(--space-3)" } }, group.title),
            h("ul", { style: { listStyle: "none", margin: 0, padding: 0, display: "grid", gap: "var(--space-2)" } },
              group.links.map((link) => h("li", {}, footerLink(link)))
            )
          )
        )
      ),
      h("div", { class: "site-footer__bottom" },
        h("span", { class: "label" }, `© ${new Date().getFullYear()} ${site.name}`),
        h("span", { class: "label" }, site.tagline)
      )
    )
  );
}
