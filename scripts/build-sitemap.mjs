#!/usr/bin/env node
/**
 * Generates sitemap.xml from data/site.json + data/articles.json.
 * Usage: node scripts/build-sitemap.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

const root = new URL("../", import.meta.url);
const read = async (p) => JSON.parse(await readFile(new URL(p, root), "utf8"));

const site = await read("data/site.json");
const articles = await read("data/articles.json");
const base = site.url.replace(/\/?$/, "/");

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const today = new Date().toISOString().slice(0, 10);

const pages = [
  { loc: "", priority: "1.0", lastmod: today },
  { loc: "articles/", priority: "0.9", lastmod: today },
  { loc: "about/", priority: "0.5", lastmod: today },
  { loc: "contact/", priority: "0.4", lastmod: today },
  ...articles.map((a) => ({
    loc: `article/?slug=${a.slug}`,
    priority: "0.8",
    lastmod: a.date,
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (p) => `  <url>
    <loc>${esc(base + p.loc)}</loc>
    <lastmod>${p.lastmod}</lastmod>
    <priority>${p.priority}</priority>
  </url>`
  )
  .join("\n")}
</urlset>
`;

await writeFile(fileURLToPath(new URL("sitemap.xml", root)), xml);
console.log(`sitemap.xml written (${pages.length} URLs)`);
