import { chromium } from "playwright";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";

const root = process.cwd();
const types = { ".html":"text/html", ".js":"text/javascript", ".css":"text/css", ".json":"application/json", ".md":"text/markdown", ".svg":"image/svg+xml", ".webmanifest":"application/manifest+json" };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    let file = normalize(join(root, pathname));
    if (!file.startsWith(root)) throw new Error("Invalid path");
    if (pathname.endsWith("/")) file = join(file, "index.html");
    const data = await readFile(file);
    res.writeHead(200, { "content-type": types[extname(file)] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404);
    res.end("Not found");
  }
});
await new Promise(resolve => server.listen(4173, "127.0.0.1", resolve));

const browser = await chromium.launch({ headless: true });
const failures = [];
async function check(name, fn) {
  try { await fn(); console.log("PASS", name); }
  catch (error) { failures.push({ name, error: error.message }); console.error("FAIL", name, error.message); }
}
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const pageErrors = [];
  page.on("pageerror", error => pageErrors.push(error.message));

  await check("home renders and loads stories", async () => {
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    await page.locator("body.is-ready").waitFor();
    if (!(await page.locator("main h1").count())) throw new Error("Missing homepage heading");
    if ((await page.locator(".grid--cards .article-card, .grid--cards a").count()) < 1) throw new Error("No story cards found");
  });

  await check("theme toggle works", async () => {
    const before = await page.locator("html").getAttribute("data-theme");
    await page.getByRole("button", { name: "Toggle theme" }).click();
    const after = await page.locator("html").getAttribute("data-theme");
    if (before === after) throw new Error("Theme did not change");
  });

  await check("search opens, returns results and closes", async () => {
    await page.getByRole("button", { name: "Search" }).click();
    const box = page.locator(".search.is-open");
    await box.locator(".search__input").fill("black hole");
    await box.locator("a").first().waitFor();
    if (!(await box.locator("a").first().innerText()).toLowerCase().includes("black hole")) throw new Error("Search result mismatch");
    await page.keyboard.press("Escape");
    if (await page.locator(".search.is-open").count()) throw new Error("Search overlay did not close");
  });

  await check("article reader loads content and table of contents", async () => {
    await page.goto("http://127.0.0.1:4173/article/?slug=inside-a-black-hole", { waitUntil: "networkidle" });
    await page.locator(".prose").waitFor();
    if (!(await page.locator(".article-head h1").innerText()).includes("Black Hole")) throw new Error("Wrong article title");
    if (!(await page.locator(".prose").innerText()).trim().length) throw new Error("Article body is empty");
  });

  await check("archive search filters stories", async () => {
    await page.goto("http://127.0.0.1:4173/articles/", { waitUntil: "networkidle" });
    const search = page.locator("main input[type=search]");
    await search.fill("snowflake");
    await page.locator(".grid--cards a").first().waitFor();
    if (!(await page.locator(".grid--cards").innerText()).toLowerCase().includes("snowflake")) throw new Error("Archive search did not filter");
  });

  await check("about and contact pages render", async () => {
    await page.goto("http://127.0.0.1:4173/about/", { waitUntil: "networkidle" });
    if (!(await page.locator("main h1").count())) throw new Error("About heading missing");
    await page.goto("http://127.0.0.1:4173/contact/", { waitUntil: "networkidle" });
    for (const name of ["name", "email", "subject", "message"]) {
      if (!(await page.locator(`[name="${name}"]`).count())) throw new Error(`Contact field missing: ${name}`);
    }
  });

  await check("mobile layout and navigation", async () => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
    const widths = await page.evaluate(() => ({ viewport: document.documentElement.clientWidth, page: document.documentElement.scrollWidth }));
    if (widths.page > widths.viewport + 1) throw new Error(`Horizontal overflow: ${widths.page}px > ${widths.viewport}px`);
    await page.locator("#menu-toggle").click();
    if ((await page.locator(".site-nav").getAttribute("data-open")) !== "1") throw new Error("Mobile navigation did not open");
  });

  if (pageErrors.length) failures.push({ name: "browser console errors", error: pageErrors.join("; ") });
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
if (failures.length) {
  console.error(JSON.stringify(failures, null, 2));
  process.exitCode = 1;
} else {
  console.log("All browser smoke tests passed.");
}
