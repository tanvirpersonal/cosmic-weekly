/**
 * Scroll reveal: elements with class "reveal" fade/slide in when they enter the viewport.
 * Call observeReveals() again after rendering new content (pages do this).
 * Without IntersectionObserver or with reduced motion, everything is shown immediately.
 */
let observer;

function getObserver() {
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
  );
  return observer;
}

export function observeReveals(root = document) {
  const nodes = Array.from(root.querySelectorAll(".reveal:not(.is-visible)"));
  if (!nodes.length) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced || !("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const io = getObserver();
  nodes.forEach((node, index) => {
    // light stagger for siblings revealed together
    node.style.setProperty("--reveal-delay", `${Math.min(index % 6, 5) * 70}ms`);
    io.observe(node);
  });
}
