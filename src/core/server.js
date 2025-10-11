import fs from 'node:fs/promises'
import express from 'express'
import { createMiddleware } from './middleware.js'
import { loadAllMiddleware } from './loadMiddleware.js'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isProduction = process.env.NODE_ENV === 'production'
const port = process.env.PORT || 5173
const base = process.env.BASE || '/'

const templateHtml = isProduction
  ? await fs.readFile(path.resolve(__dirname, '../client/index.html'), 'utf-8')
  : ''

const app = express()
app.use(express.json())

let vite
if (!isProduction) {
  const { createServer } = await import('vite')
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  })
  app.use(vite.middlewares)
} else {
  const compression = (await import('compression')).default
  const sirv = (await import('sirv')).default
  app.use(compression())
  app.use(base, sirv(path.resolve(__dirname, '../client'), { extensions: [] }))
}

// Load all middleware
const middleware = createMiddleware()
const userMiddlewares = await loadAllMiddleware(vite, isProduction)
for (const fn of userMiddlewares) {
  await fn(middleware)
}

// Execute middleware
app.use(async (req, res, next) => {
  const shouldContinue = await middleware.execute(req, res)
  if (shouldContinue) next()
})

// Handle API routes
app.use(async (req, res, next) => {
  if (!req.path.startsWith('/api/')) {
    return next()
  }

  try {
    const { generateApiRoutes } = !isProduction 
      ? await vite.ssrLoadModule('/src/core/router.jsx')
      : await import('./router.js')
    
    const apiRoutes = generateApiRoutes()
    const fullPath = req.path
    
    for (const route of apiRoutes) {
      const pattern = route.path
        .replace(/\*/g, '(.*)')
        .replace(/:(\w+)/g, '([^/]+)')
      
      const regex = new RegExp(`^${pattern}$`)
      const match = fullPath.match(regex)
      
      if (match) {
        const paramNames = [...route.path.matchAll(/:(\w+)/g)].map(m => m[1])
        const params = {}
        paramNames.forEach((name, i) => {
          params[name] = match[i + 1]
        })
        
        const handler = route.handler[req.method]
        if (!handler) {
          return res.status(405).json({ error: 'Method not allowed' })
        }
        
        const url = `http://${req.headers.host}${req.originalUrl}`
        const webRequest = new Request(url, {
          method: req.method,
          headers: req.headers,
          body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : null
        })
        
        const response = await handler(webRequest, { params })
        const body = await response.text()
        
        res.status(response.status || 200)
        response.headers.forEach((value, key) => {
          res.setHeader(key, value)
        })
        return res.send(body)
      }
    }
    
    res.status(404).json({ error: 'API route not found' })
  } catch (e) {
    console.error('API Error:', e)
    res.status(500).json({ error: e.message })
  }
})

// Serve HTML
app.use(async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '')

    let template, render
    if (!isProduction) {
      template = await fs.readFile('./index.html', 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule('/src/core/entry-server.jsx')).render
    } else {
      template = templateHtml
      render = (await import('./entry-server.js')).render
    }

    const rendered = await render(url)

    const html = template
      .replace(`<!--app-head-->`, rendered.head ?? '')
      .replace(`<!--app-html-->`, rendered.html ?? '')

    res.status(200).set({ 'Content-Type': 'text/html' }).send(html)
  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`)
})