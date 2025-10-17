import { renderPage } from "@framework/core";
import { matchRoute } from "@framework/router/src/route-matcher.js";
import { eventHandler, getQuery } from "h3";

// Import virtual routes manifest
import routes from "virtual:routes";

export default eventHandler(async (event) => {
  const url = event.node.req.url;
  const pathname = url.split("?")[0];

  // Find matching route
  const route = routes.find((r) => matchRoute(r.path, pathname));

  if (!route) {
    return { statusCode: 404, body: "Not Found" };
  }

  // Load page component
  const pagePath = `${process.cwd()}/app/${route.filePath}/page`;
  const { default: Page } = await import(pagePath);

  // Load layouts
  const layouts = [];
  const segments = route.filePath.split("/");

  for (let i = 0; i <= segments.length; i++) {
    const layoutPath = segments.slice(0, i).join("/") || ".";
    try {
      const { default: Layout } = await import(
        `${process.cwd()}/app/${layoutPath}/layout`
      );
      layouts.push(Layout);
    } catch {}
  }

  // Extract params from URL
  const match = matchRoute(route.path, pathname);
  const searchParams = getQuery(event);

  // Render to HTML
  const html = await renderPage(
    <Page params={match.params} searchParams={searchParams} />,
    layouts,
  );

  return `<!DOCTYPE html>${html}`;
});
