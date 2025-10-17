/**
 * Match a URL path against a route pattern
 * @param {string} pattern - Route pattern (e.g., '/blog/:slug')
 * @param {string} path - URL path to match
 * @returns {{ params: Record<string, string> } | null}
 */
export function matchRoute(pattern, path) {
  const patternParts = pattern.split("/").filter(Boolean);
  const pathParts = path.split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};

  for (let i = 0; i < patternParts.length; i++) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      // Dynamic segment
      const paramName = patternPart.slice(1);
      params[paramName] = pathPart;
    } else if (patternPart !== pathPart) {
      // Static segment mismatch
      return null;
    }
  }

  return { params };
}
