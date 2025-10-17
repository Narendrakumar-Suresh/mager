import { defineNitroPreset } from "nitropack";

export default defineNitroPreset({
  extends: "node-server",
  entry: "./nitro-entry.js",
  serveStatic: true,
  commands: {
    preview: "node .output/server/index.mjs",
  },
});
