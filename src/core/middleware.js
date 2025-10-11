export function createMiddleware() {
    const middlewares = []
    
    return {
      use(path, handler) {
        if (typeof path === 'function') {
          middlewares.push({ path: '/', handler: path })
        } else {
          middlewares.push({ path, handler })
        }
      },
      
      async execute(req, res) {
        for (const { path, handler } of middlewares) {
          if (req.path.startsWith(path)) {
            const result = await handler(req, res)
            if (result === false || res.headersSent) {
              return false
            }
          }
        }
        return true
      }
    }
  }