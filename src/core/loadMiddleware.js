import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function loadAllMiddleware(vite, isProduction) {
  const middlewares = []
  
  // Load root middleware
  try {
    const rootMiddleware = !isProduction
      ? await vite.ssrLoadModule('/middleware.js')
      : await import('../../middleware.js')
    
    if (rootMiddleware.default) {
      middlewares.push(rootMiddleware.default)
    }
  } catch (e) {
    // No root middleware
  }
  
  // Load route-specific middleware
  const appDir = path.resolve(__dirname, '../../app')
  
  function findMiddlewareFiles(dir) {
    const files = []
    
    if (!fs.existsSync(dir)) return files
    
    const items = fs.readdirSync(dir)
    
    for (const item of items) {
      const fullPath = path.join(dir, item)
      const stat = fs.statSync(fullPath)
      
      if (stat.isDirectory()) {
        files.push(...findMiddlewareFiles(fullPath))
      } else if (item === 'middleware.js' || item === 'middleware.ts') {
        files.push(fullPath)
      }
    }
    
    return files
  }
  
  const middlewareFiles = findMiddlewareFiles(appDir)
  
  for (const file of middlewareFiles) {
    try {
      const relativePath = '/' + path.relative(path.resolve(__dirname, '../..'), file).replace(/\\/g, '/')
      const mod = !isProduction
        ? await vite.ssrLoadModule(relativePath)
        : await import(file)
      
      if (mod.default) {
        middlewares.push(mod.default)
      }
    } catch (e) {
      console.error(`Error loading middleware from ${file}:`, e)
    }
  }
  
  return middlewares
}