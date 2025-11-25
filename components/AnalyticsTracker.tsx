"use client"

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { trackAnalyticsEvent } from '@/lib/clientAnalytics'

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const previousUrl = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return
    const query = searchParams?.toString()
    const fullPath = query ? `${pathname}?${query}` : pathname
    const fullUrl = window.location.href

    if (previousUrl.current === fullPath) return
    previousUrl.current = fullPath

    trackAnalyticsEvent({
      eventType: 'page_view',
      path: pathname,
      fullUrl,
      referrer: document.referrer || null,
      userId: session?.user?.id ?? null,
    })
  }, [pathname, searchParams, session])

  return null
}

