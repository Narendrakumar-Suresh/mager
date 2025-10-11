// entry-client.jsx
import { StrictMode, useEffect, useState } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import RootLayout from '../../app/layout'
import { generateRoutes } from './router'

function ClientComponentWrapper({ component: Component, path }) {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    // Match server's empty div during hydration
    return <div data-client-component={path}></div>
  }
  
  // After hydration, render the actual component
  return <Component />
}

function RouteWithLayouts({ layouts, component: Component, isClient, path }) {
  if (isClient) {
    return <ClientComponentWrapper component={Component} path={path} />
  }

  return layouts.reduceRight((child, Layout) => <Layout>{child}</Layout>, <Component />)
}

const routes = generateRoutes()

hydrateRoot(
  document.getElementById('root'),
  <StrictMode>
    <BrowserRouter>
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
    </BrowserRouter>
  </StrictMode>
)