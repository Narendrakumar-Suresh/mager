import { renderToPipeableStream } from "react-dom/server";

/**
 * Renders a page component to HTML stream
 * @param {import('react').ReactElement} page - Page component to render
 * @param {import('react').ReactElement[]} layouts - Layout components wrapping the page
 * @returns {Promise<string>} Rendered HTML
 */
export async function renderPage(page, layouts = []) {
  let component = page;

  // Wrap page with layouts from innermost to outermost
  for (let i = layouts.length - 1; i >= 0; i--) {
    const Layout = layouts[i];
    component = <Layout>{component}</Layout>;
  }

  return new Promise((resolve, reject) => {
    let html = "";
    const stream = renderToPipeableStream(component, {
      onShellReady() {
        stream.pipe({
          write(chunk) {
            html += chunk;
          },
          end() {
            resolve(html);
          },
        });
      },
      onError: reject,
    });
  });
}
