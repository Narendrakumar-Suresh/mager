import { StrictMode, useEffect, useState } from 'react'
import { hydrateRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { generateRoutes, matchRoute } from './router'

function ClientComponentWrapper({ component: Component, path }) {
  const [mounted, setMounted] = useState(false)
  const location = useLocation()
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return <div data-client-component={path}></div>
  }
  
  const routes = generateRoutes()
  const fullUrl = `http://localhost${location.pathname}${location.search}`
  const matched = matchRoute(fullUrl, routes)
  
  return <Component params={matched?.params || {}} searchParams={matched?.searchParams || {}} />
}

function DynamicRoute() {
  const location = useLocation()
  const routes = generateRoutes()
  const fullUrl = `http://localhost${location.pathname}${location.search}`
  const matched = matchRoute(fullUrl, routes)

  if (!matched) return <h1>404</h1>

  const { component: Component, layouts, isClient, params, searchParams } = matched

  let content
  if (isClient) {
    content = <ClientComponentWrapper component={Component} path={matched.path} />
  } else {
    content = <Component params={params} searchParams={searchParams} />
  }

  return layouts.reduceRight((child, Layout) => <Layout>{child}</Layout>, content)
}

hydrateRoot(
  document.getElementById('root'),
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<DynamicRoute />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)