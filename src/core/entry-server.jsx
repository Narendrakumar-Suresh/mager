import { renderToString } from 'react-dom/server'
import { generateRoutes, matchRoute } from './router'

export function render(url) {
  const routes = generateRoutes()
  const matchedRoute = matchRoute(url, routes)
  
  if (!matchedRoute) {
    return { html: '<h1>404</h1>' }
  }

  const { component: Component, layouts, isClient, params, searchParams } = matchedRoute
  
  let content
  if (isClient) {
    content = <div data-client-component={matchedRoute.path}></div>
  } else {
    content = <Component params={params} searchParams={searchParams} />
  }
  
  content = layouts.reduceRight((child, Layout) => <Layout>{child}</Layout>, content)

  const html = renderToString(content)
  return { html }
}