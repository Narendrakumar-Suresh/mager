export default function(middleware) {
    // Test middleware - log all requests
    middleware.use(async (req, res) => {
      console.log(`[Middleware] ${req.method} ${req.path}`)
      return true
    })
    
    // Block access to /secret
    middleware.use('/secret', async (req, res) => {
      res.status(403).json({ error: 'Forbidden' })
      return false
    })
  }