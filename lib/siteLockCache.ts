// In-memory cache for site lock status
// This avoids database queries on every request

let siteLockedCache: boolean | null = null
let cacheInitialized = false

export async function getSiteLockStatus(): Promise<boolean> {
  // If cache is not initialized, load from DB once
  if (!cacheInitialized) {
    await refreshSiteLockCache()
  }
  
  // Return cached value (default to false if not set)
  return siteLockedCache ?? false
}

export async function refreshSiteLockCache(): Promise<void> {
  try {
    const { prisma } = await import('@/lib/prisma')
    const settings = await prisma.siteSettings.findFirst()
    siteLockedCache = settings?.siteLocked ?? false
    cacheInitialized = true
  } catch (error) {
    console.error('Error refreshing site lock cache:', error)
    // On error, default to unlocked
    siteLockedCache = false
    cacheInitialized = true
  }
}

export function setSiteLockStatus(locked: boolean): void {
  siteLockedCache = locked
  cacheInitialized = true
}

// Initialize cache on module load (for server startup)
if (typeof window === 'undefined') {
  // Only run on server
  refreshSiteLockCache().catch(console.error)
}

