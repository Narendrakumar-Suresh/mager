/**
 * @typedef {Object} PageProps
 * @property {Record<string, any>} [params] - Dynamic route parameters
 * @property {Record<string, string>} [searchParams] - URL search parameters
 */

/**
 * @typedef {Object} LayoutProps
 * @property {import('react').ReactNode} children - Child page or layout
 * @property {Record<string, any>} [params] - Dynamic route parameters
 */

export { default as ClientProvider } from "./runtime/client.jsx";
export { renderPage } from "./runtime/server.jsx";
