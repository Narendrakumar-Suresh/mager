/**
 * Start production server
 */
export async function start() {
  const { default: handler } = await import(
    process.cwd() + "/.output/server/index.mjs"
  );

  const server = require("node:http").createServer(handler);
  server.listen(3000, () => {
    console.log("🚀 Production server running at http://localhost:3000");
  });
}
