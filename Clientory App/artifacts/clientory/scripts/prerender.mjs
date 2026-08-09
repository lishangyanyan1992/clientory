import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const appDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDirectory = path.join(appDirectory, "dist", "public");
const serverDirectory = path.join(appDirectory, "dist", "server");

const builtTemplate = await readFile(path.join(publicDirectory, "index.html"), "utf8");
const scriptMatch = builtTemplate.match(/<script[^>]+type=["']module["'][^>]+src=["']([^"']+)["'][^>]*><\/script>/i);
const stylesheets = [...builtTemplate.matchAll(/<link[^>]+rel=["']stylesheet["'][^>]+href=["']([^"']+)["'][^>]*>/gi)]
  .map((match) => match[1])
  .filter((href) => href.startsWith("/assets/"));

if (!scriptMatch) {
  throw new Error("Could not find the client entry script in the Vite build output.");
}

const assets = { script: scriptMatch[1], stylesheets };
const serverEntry = await import(path.join(serverDirectory, "entry-server.js"));

for (const route of serverEntry.prerenderRoutes) {
  const outputPath = route.path === "/"
    ? path.join(publicDirectory, "index.html")
    : path.join(publicDirectory, route.path.slice(1), "index.html");

  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, serverEntry.render(route.path, assets), "utf8");
}

await writeFile(path.join(publicDirectory, "404.html"), serverEntry.render("/404", assets), "utf8");

const escapeXml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;")
  .replaceAll("'", "&apos;");

const sitemapEntries = serverEntry.prerenderRoutes.map((route) => {
  const fields = [
    `    <loc>${escapeXml(`https://clientory.org${route.path}`)}</loc>`,
    route.lastModified ? `    <lastmod>${route.lastModified}</lastmod>` : null,
    `    <changefreq>${route.changeFrequency}</changefreq>`,
    `    <priority>${route.priority.toFixed(1)}</priority>`,
  ].filter(Boolean).join("\n");

  return `  <url>\n${fields}\n  </url>`;
}).join("\n");

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries}\n</urlset>\n`;
await writeFile(path.join(publicDirectory, "sitemap.xml"), sitemap, "utf8");
await rm(serverDirectory, { recursive: true, force: true });

console.log(`Prerendered ${serverEntry.prerenderRoutes.length} public routes.`);
