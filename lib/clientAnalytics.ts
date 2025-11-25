'use client'

type AnalyticsPayload = {
  eventType?: string
  path?: string
  fullUrl?: string
  referrer?: string | null
  sessionId?: string | null
  visitorId?: string | null
  userAgent?: string | null
  deviceType?: string | null
  language?: string | null
  metadata?: Record<string, unknown> | null
  userId?: string | null
  productId?: string | null
}

function getPersistedId(key: string) {
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

function detectDeviceType(userAgent: string) {
  const ua = userAgent.toLowerCase()
  if (/tablet|ipad/.test(ua)) return 'tablet'
  if (/mobile|iphone|android/.test(ua)) return 'mobile'
  return 'desktop'
}

async function postAnalytics(payload: AnalyticsPayload) {
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
    if (process.env.NODE_ENV === 'development') {
      console.warn('Analytics send error', error)
    }
  }
}

export function trackAnalyticsEvent(partial: AnalyticsPayload) {
  if (typeof window === 'undefined') return

  const userAgent = navigator.userAgent
  const sessionId = getPersistedId('bn_analytics_session')
  const visitorId = getPersistedId('bn_analytics_visitor')

  const payload: AnalyticsPayload = {
    eventType: 'page_view',
    path: window.location.pathname,
    fullUrl: window.location.href,
    referrer: document.referrer || null,
    sessionId,
    visitorId,
    userAgent,
    deviceType: detectDeviceType(userAgent),
    language: navigator.language,
    metadata: {
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screen: {
        width: window.screen.width,
        height: window.screen.height,
      },
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
    },
    ...partial,
  }

  postAnalytics(payload)
}

