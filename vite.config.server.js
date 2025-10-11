import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import dynamicImportVars from './vite-plugin-dynamic-import.js'

export default defineConfig({
  plugins: [react(), dynamicImportVars()],
  build: {
    ssr: true,
    outDir: 'dist/server',
    rollupOptions: {
      input: {
        'entry-server': './src/core/entry-server.jsx',
        'router': './src/core/router.jsx',
        'server': './src/core/server.js',
        'middleware': './src/core/middleware.js',
        'loadMiddleware': './src/core/loadMiddleware.js',
      },
      output: {
        entryFileNames: '[name].js',
      },
      external: [
        'express',
        'compression',
        'sirv',
        'node:fs',
        'node:path',
        'node:url',
        'node:fs/promises',
      ],
    },
  },
})