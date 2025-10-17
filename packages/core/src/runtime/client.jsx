import { hydrateRoot } from "react-dom/client";

/**
 * Hydrates the SSR'd application
 * @param {import('react').ReactElement} app - Root app component
 */
export function hydrate(app) {
  hydrateRoot(document.getElementById("root"), app);
}

export default function ClientProvider({ children }) {
  return children;
}
