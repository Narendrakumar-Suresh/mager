export default function dynamicImportVars() {
    return {
      name: 'dynamic-import-vars',
      resolveId(id) {
        if (id === './router.js' || id === './entry-server.js') {
          return { id, external: true }
        }
      }
    }
  }