// Initialize site lock cache on server startup
import { refreshSiteLockCache } from './siteLockCache'

// This will be called when the module is imported
// Next.js will import this in the server context
if (typeof window === 'undefined') {
  refreshSiteLockCache().catch((error) => {
    console.error('Failed to initialize site lock cache:', error)
  })
}

