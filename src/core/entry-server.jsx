import { renderToString } from 'react-dom/server'
import { StaticRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '../../app/layout'
import { generateRoutes } from './router'

function RouteWithLayouts({ layouts, component: Component, isClient, path }) {
  if (isClient) {
    return <div data-client-component={path}></div>
  }

  return layouts.reduceRight((child, Layout) => <Layout>{child}</Layout>, <Component />)
}

export function render(url) {
  const cleanUrl = new URL(url, 'http://localhost').pathname
  const routes = generateRoutes()

  const html = renderToString(
    <StaticRouter location={cleanUrl}>
      <RootLayout>
        <Routes>
          {routes.map(({ path, component, layouts, isClient }) => (
            <Route
              key={path}
              path={path}
              element={<RouteWithLayouts layouts={layouts} component={component} isClient={isClient} path={path} />}
            />
          ))}
        </Routes>
      </RootLayout>
    </StaticRouter>
  )

  return { html }
}
