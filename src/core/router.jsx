const pages = {
  ...import.meta.glob('../../app/**/index.{jsx,tsx}', { eager: true, query: '?raw', import: 'default' }),
}

const pageModules = {
  ...import.meta.glob('../../app/**/index.{jsx,tsx}', { eager: true }),
}

const layouts = {
  ...import.meta.glob('../../app/**/layout.{jsx,tsx}', { eager: true }),
}

const apiRoutes = {
  ...import.meta.glob('../../app/api/**/route.{js,ts}', { eager: true }),
}

export function generateRoutes() {
  const routes = []
  
  for (const path in pageModules) {
    const rawPath = path
      .replace('../../app', '')
      .replace(/\/index\.(jsx|tsx)$/, '')
      .replace(/\[\.\.\.(\w+)\]/g, '*')
      .replace(/\[(\w+)\]/g, ':$1')

    const routePath = rawPath === '' ? '/' : rawPath
    
    const layoutComponents = []
    const pathSegments = path.replace('../../app/', '').split('/').slice(0, -1)
    
    // Only get the deepest layout (closest to the page)
    for (let i = pathSegments.length - 1; i >= 0; i--) {
      const layoutPath = '../../app/' + pathSegments.slice(0, i + 1).join('/')
      const layoutFile = layouts[`${layoutPath}/layout.jsx`] || layouts[`${layoutPath}/layout.tsx`]
      if (layoutFile) {
        layoutComponents.push(layoutFile.default)
        break // Stop at first found layout
      }
    }
    
    // If no nested layout found, use root layout
    if (layoutComponents.length === 0) {
      const rootLayout = layouts['../../app/layout.jsx'] || layouts['../../app/layout.tsx']
      if (rootLayout) {
        layoutComponents.push(rootLayout.default)
      }
    }
    
    const module = pageModules[path]
    const sourceCode = pages[path] || ''
    const isClientComponent = /^['"]use client['"];?\s*$/m.test(sourceCode)
    
    routes.push({
      path: routePath,
      component: module.default,
      layouts: layoutComponents,
      isClient: isClientComponent
    })
  }
  
  return routes.sort((a, b) => {
    const aScore = a.path.includes('*') ? 0 : a.path.includes(':') ? 1 : 2
    const bScore = b.path.includes('*') ? 0 : b.path.includes(':') ? 1 : 2
    return bScore - aScore
  })
}

export function matchRoute(url, routes) {
  const urlObj = new URL(url, 'http://localhost')
  // Remove trailing slash except for root
  const pathname = urlObj.pathname === '/' ? '/' : urlObj.pathname.replace(/\/$/, '')
  const searchParams = Object.fromEntries(urlObj.searchParams)
  
  for (const route of routes) {
    const pattern = route.path
      .replace(/\*/g, '(.*)')
      .replace(/:(\w+)/g, '([^/]+)')
    
    const regex = new RegExp(`^${pattern}$`)
    const match = pathname.match(regex)
    
    if (match) {
      const paramNames = [...route.path.matchAll(/:(\w+)/g)].map(m => m[1])
      const params = {}
      
      paramNames.forEach((name, i) => {
        params[name] = match[i + 1]
      })
      
      return {
        ...route,
        params,
        searchParams
      }
    }
  }
  
  return null
}

export function generateApiRoutes() {
  const routes = []
  
  for (const path in apiRoutes) {
    const apiPath = path
      .replace('../../app/api', '/api')
      .replace(/\/route\.(js|ts)$/, '')
      .replace(/\[\.\.\.(\w+)\]/g, '*')
      .replace(/\[(\w+)\]/g, ':$1')
    
    routes.push({
      path: apiPath || '/api',
      handler: apiRoutes[path]
    })
  }
  
  return routes
}