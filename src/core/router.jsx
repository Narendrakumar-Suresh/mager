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
      .replace(/\[\.\.\.(\w+)\]/g, '*') // catch-all: [...slug]
      .replace(/\[(\w+)\]/g, ':$1')     // dynamic: [id]

    const routePath = rawPath === '' ? '/' : rawPath
    
    const dirPath = path.replace(/\/index\.(jsx|tsx)$/, '')
    const layoutComponents = []
    
    // Collect all parent layouts
    let currentPath = dirPath
    const layoutPaths = []
    
    while (currentPath !== '../../app') {
      layoutPaths.unshift(currentPath)
      currentPath = currentPath.substring(0, currentPath.lastIndexOf('/'))
    }
    
    layoutPaths.forEach(lp => {
      const layoutFile = layouts[`${lp}/layout.jsx`] || layouts[`${lp}/layout.tsx`]
      if (layoutFile) layoutComponents.push(layoutFile.default)
    })
    
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
  
  return routes
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