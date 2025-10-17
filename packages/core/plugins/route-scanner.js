import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";

/**
 * @typedef {Object} Route
 * @property {string} path - URL path (e.g., '/blog/:slug')
 * @property {string} filePath - File system path
 * @property {boolean} hasLayout - Whether this route segment has a layout
 * @property {boolean} dynamic - Whether this is a dynamic route
 */

/**
 * Recursively scan directory for page.tsx and layout.tsx files
 * @param {string} dir - Directory to scan
 * @param {string} [baseDir] - Base directory for relative paths
 * @returns {Promise<Route[]>}
 */
export async function scanRoutes(dir, baseDir = dir) {
  const routes = [];

  async function scan(currentDir, urlPath = "") {
    const entries = await readdir(currentDir, { withFileTypes: true });

    let hasPage = false;
    let hasLayout = false;

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name);

      if (entry.isDirectory()) {
        // Handle dynamic routes [param]
        const isDynamic =
          entry.name.startsWith("[") && entry.name.endsWith("]");
        const segment = isDynamic ? ":" + entry.name.slice(1, -1) : entry.name;

        await scan(fullPath, urlPath + "/" + segment);
      } else if (entry.name === "index.tsx" || entry.name === "index.jsx") {
        hasPage = true;
      } else if (entry.name === "layout.tsx" || entry.name === "layout.jsx") {
        hasLayout = true;
      }
    }

    if (hasPage) {
      routes.push({
        path: urlPath || "/",
        filePath: relative(baseDir, currentDir),
        hasLayout,
        dynamic: urlPath.includes(":"),
      });
    }
  }

  await scan(dir);
  return routes;
}
