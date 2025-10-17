import { createServer } from "vite";
import { createNitro, prepare, createDevServer } from "nitropack";
import react from "@vitejs/plugin-react-swc";
import { frameworkPlugin } from "../../../core/plugins/vite-plugin.js";
import { createSSRHandler } from "../../../core/server/ssr-handler.js";

export async function dev() {
  const rootDir = process.cwd();

  // Create Vite server
  const vite = await createServer({
    root: rootDir,
    plugins: [react(), frameworkPlugin({ mode: "development" })],
    server: {
      middlewareMode: true,
    },
  });

  await vite.listen();

  const port = vite.config.server.port;
  const host = vite.config.server.host || "localhost";

  console.log(`🚀 Dev server at http://${host}:${port}`);

  // Create Nitro with SSR handler
  const nitro = await createNitro({
    rootDir,
    dev: true,
    handlers: [
      {
        route: "/**",
        handler: createSSRHandler(),
      },
    ],
  });

  await prepare(nitro);
  const server = createDevServer(nitro);

  server.app.use(vite.middlewares);

  await server.listen(port);
}
