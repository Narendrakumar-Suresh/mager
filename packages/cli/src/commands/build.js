import { build as viteBuild } from "vite";
import { build as nitroBuild } from "nitropack";
import react from "@vitejs/plugin-react-swc";
import { frameworkPlugin } from "../plugins/vite-plugin.js";

export async function build() {
  // Build server with Nitro (includes SSR)
  await nitroBuild({
    preset: "../nitro-preset.js",
    rollupConfig: {
      plugins: [
        react(),
        frameworkPlugin({ mode: "production", target: "server" }),
      ],
    },
  });

  // Build client bundle
  await viteBuild({
    plugins: [
      react(),
      frameworkPlugin({ mode: "production", target: "client" }),
    ],
    build: {
      outDir: ".output/public",
      manifest: true,
    },
  });

  console.log("✅ Build complete!");
}
