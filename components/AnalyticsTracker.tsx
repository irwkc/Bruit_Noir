"use client"

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

function getId(key: string) {
  if (typeof window === 'undefined') return null
  try {
    const existing = window.localStorage.getItem(key)
    if (existing) return existing
    const value =
      window.crypto?.randomUUID?.() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    window.localStorage.setItem(key, value)
    return value
  } catch {
    return null
  }
}

function getDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (/mobile|iphone|android|ipad/.test(ua)) return 'mobile'
  if (/tablet/.test(ua)) return 'tablet'
  return 'desktop'
}

async function sendEvent(payload: Record<string, unknown>) {
  try {
    const body = JSON.stringify(payload)
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: 'application/json' })
      navigator.sendBeacon('/api/analytics/events', blob)
      return
    }

    await fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
      keepalive: true,
      credentials: 'same-origin',
    })
  } catch (error) {
    console.warn('Analytics send error', error)
  }
}

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const previousUrl = useRef<string | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !pathname) return
    const query = searchParams?.toString()
    const fullPath = query ? `${pathname}?${query}` : pathname

    if (previousUrl.current === fullPath) return
    previousUrl.current = fullPath

    const sessionId = getId('bn_analytics_session') || undefined
    const visitorId = getId('bn_analytics_visitor') || undefined

    const userAgent = navigator.userAgent

    const metadata = {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      language: navigator.language,
      referrer: document.referrer || null,
    }

    const payload = {
      eventType: 'page_view',
      path: pathname,
      fullUrl: window.location.href,
      referrer: document.referrer || null,
      sessionId,
      visitorId,
      userAgent,
      deviceType: getDeviceType(userAgent),
      language: navigator.language,
      metadata,
      userId: session?.user?.id ?? null,
    }

    sendEvent(payload)
  }, [pathname, searchParams, session])

  return null
}

