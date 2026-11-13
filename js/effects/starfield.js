/**
 * Lightweight animated starfield on <canvas id="starfield">.
 *  - three parallax depth layers that drift upward, with gentle twinkle
 *  - slight pointer parallax on devices with a mouse
 *  - paused when the tab is hidden; a single static frame for reduced motion
 *  - star count scales with screen area and is capped for low-end phones
 */
import { SETTINGS } from "../config.js";

export function initStarfield() {
  const canvas = document.getElementById("starfield");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const lowPower = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2;

  let width = 0;
  let height = 0;
  let stars = [];
  let raf = 0;
  let pointerX = 0;
  let pointerY = 0;

  const COLORS = ["255,255,255", "190,200,255", "160,235,245", "255,225,170"];

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cap = lowPower ? 90 : 240;
    const count = Math.min(cap, Math.round(width * height * SETTINGS.starDensity));
    stars = Array.from({ length: count }, () => {
      const depth = Math.random(); // 0 = far, 1 = near
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        r: 0.4 + depth * 1.3,
        depth,
        speed: 0.01 + depth * 0.05,
        phase: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.6,
        color: COLORS[(Math.random() * COLORS.length) | 0],
      };
    });
    draw(0);
  }

  function draw(time) {
    ctx.clearRect(0, 0, width, height);
    const t = time / 1000;

    for (const s of stars) {
      if (!reduced) {
        s.y -= s.speed;
        if (s.y < -2) { s.y = height + 2; s.x = Math.random() * width; }
      }
      const alpha = reduced ? 0.7 : 0.35 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.tw + s.phase));
      const x = s.x + pointerX * s.depth * 14;
      const y = s.y + pointerY * s.depth * 14;
      ctx.beginPath();
      ctx.fillStyle = `rgba(${s.color},${alpha.toFixed(3)})`;
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function loop(time) {
    draw(time);
    raf = requestAnimationFrame(loop);
  }

  const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop); };
  const stop = () => { cancelAnimationFrame(raf); raf = 0; };

  resize();
  window.addEventListener("resize", resize, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : start()));

  if (!reduced && window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener("pointermove", (event) => {
      pointerX = event.clientX / width - 0.5;
      pointerY = event.clientY / height - 0.5;
    }, { passive: true });
  }

  start();
}
