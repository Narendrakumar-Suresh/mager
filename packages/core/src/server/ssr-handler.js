import { defineEventHandler } from "h3";
import React from "react";
import { renderToPipeableStream } from "react-dom/server";
import { scanRoutes } from "../plugins/route-scanner.js";

export function createSSRHandler() {
  return defineEventHandler(async (event) => {
    const url = event.node.req.url;
    const pathname = url.split("?")[0];

    // Skip API routes and assets
    if (pathname.startsWith("/api") || pathname.includes(".")) {
      return;
    }

    const rootDir = process.cwd();
    const routes = await scanRoutes(rootDir + "/app");

    // Find matching route
    const route = routes.find((r) => r.path === pathname);
    if (!route) {
      event.node.res.statusCode = 404;
      return "<h1>404 Not Found</h1>";
    }

    // Import page and layout
    const pagePath = route.filePath ? route.filePath + "/" : "";
    const { default: Layout } = await import(`${rootDir}/app/layout.tsx`);
    const { default: Page } = await import(
      `${rootDir}/app/${pagePath}page.tsx`
    );

    const pageContent = React.createElement(Page);
    const app = React.createElement(Layout, null, pageContent);

    return new Promise((resolve, reject) => {
      let html = "";
      const stream = renderToPipeableStream(app, {
        onShellReady() {
          stream.pipe({
            write(chunk) {
              html += chunk;
            },
            end() {
              const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Framework App</title>
</head>
<body>
  <div id="root">${html}</div>
  <script type="module" src="/@framework/entry-client"></script>
</body>
</html>
              `;
              resolve(fullHtml);
            },
          });
        },
        onError: reject,
      });
    });
  });
}
