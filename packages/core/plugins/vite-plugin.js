import { scanRoutes } from "./route-scanner.js";

/**
 * @typedef {Object} FrameworkPluginOptions
 * @property {'development' | 'production'} mode
 * @property {'client' | 'server'} [target]
 */

/**
 * Vite plugin for framework functionality
 * @param {FrameworkPluginOptions} options
 * @returns {import('vite').Plugin}
 */
export function frameworkPlugin(options) {
  let routes = [];
  let config;

  return {
    name: "framework",

    async configResolved(resolvedConfig) {
      config = resolvedConfig;
      routes = await scanRoutes(config.root + "/app");
      console.log("📁 Routes:", routes);
    },

    /**
     * Handle virtual modules
     */
    resolveId(id) {
      if (id === "/@framework/entry-client") {
        return "\0@framework/entry-client";
      }
      if (id === "virtual:routes") {
        return "\0virtual:routes";
      }
    },

    /**
     * Load virtual modules
     */
    load(id) {
      if (id === "\0@framework/entry-client") {
        // Generate static imports for all routes
        const routeImports = routes
          .map((route, idx) => {
            const pagePath = route.filePath ? route.filePath + "/" : "";
            return `const Page${idx} = () => import('/app/${pagePath}index.tsx')`;
          })
          .join("\n");

        const routeMap = routes
          .map((route, idx) => `  '${route.path}': Page${idx}`)
          .join(",\n");

        return `
import React from 'react'
import { createRoot } from 'react-dom/client'
import Layout from '/app/layout.tsx'

${routeImports}

const routeMap = {
${routeMap}
}

const path = window.location.pathname
const pageLoader = routeMap[path]

if (!pageLoader) {
  document.getElementById('root').innerHTML = '<h1>404 Not Found</h1>'
} else {
  pageLoader().then(({ default: Page }) => {
    const root = createRoot(document.getElementById('root'))
    root.render(
      React.createElement(Layout, null, React.createElement(Page))
    )
  })
}
        `;
      }

      if (id === "\0virtual:routes") {
        return `export default ${JSON.stringify(routes, null, 2)}`;
      }
    },
  };
}
