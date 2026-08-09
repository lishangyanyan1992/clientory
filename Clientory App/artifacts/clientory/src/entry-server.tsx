import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import { AppProviders, SiteRoutes } from "./App";
import { blogPosts } from "./data/blogPosts";

export interface ClientAssets {
  script: string;
  stylesheets: string[];
}

export interface PrerenderRoute {
  path: string;
  lastModified?: string;
  changeFrequency: "weekly" | "monthly";
  priority: number;
}

const staticRoutes: PrerenderRoute[] = [
  { path: "/", changeFrequency: "weekly", priority: 1 },
  { path: "/about", changeFrequency: "monthly", priority: 0.8 },
  { path: "/pricing", changeFrequency: "monthly", priority: 0.8 },
  { path: "/geo-for-professional-services", lastModified: "2026-08-09", changeFrequency: "monthly", priority: 0.9 },
  { path: "/blog", changeFrequency: "weekly", priority: 0.7 },
  { path: "/clientory-vs-otterly", changeFrequency: "monthly", priority: 0.7 },
  { path: "/clientory-vs-peec", changeFrequency: "monthly", priority: 0.7 },
  { path: "/clientory-vs-semrush-ai", changeFrequency: "monthly", priority: 0.7 },
  { path: "/clientory-vs-manual-testing", changeFrequency: "monthly", priority: 0.7 },
];

export const prerenderRoutes: PrerenderRoute[] = [
  ...staticRoutes,
  ...blogPosts.map((post) => ({
    path: `/blog/${post.slug}`,
    lastModified: post.date,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  })),
];

function Document({ url, assets }: { url: string; assets: ClientAssets }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        {assets.stylesheets.map((href) => <link key={href} rel="stylesheet" href={href} />)}
      </head>
      <body>
        <div id="root">
          <AppProviders>
            <StaticRouter location={url}>
              <SiteRoutes />
            </StaticRouter>
          </AppProviders>
        </div>
        <script type="module" src={assets.script} />
      </body>
    </html>
  );
}

export function render(url: string, assets: ClientAssets) {
  return `<!DOCTYPE html>${renderToString(<Document url={url} assets={assets} />)}`;
}
