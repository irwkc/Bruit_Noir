'use client'

import { useCallback, useEffect, useMemo, useRef } from 'react'

interface CdekWidgetProps {
  city: string
  onPointSelect?: (point: any) => void
}

declare global {
  interface Window {
    CDEKWidget?: new (config: Record<string, any>) => {
      destroy?: () => void
    }
  }
}

const YANDEX_API_KEY = 'f366a46d-5c10-4875-a6ee-263f3678b026'
const SERVICE_PATH = '/api/cdek-service'
const DEFAULT_ORIGIN_CITY = 'Москва'
const READY_EVENT = 'cdek-widget-ready'

export default function CdekWidget({ city, onPointSelect }: CdekWidgetProps) {
  const widgetInstanceRef = useRef<{ destroy?: () => void } | null>(null)
  const containerId = useMemo(
    () => `cdek-widget-${Math.random().toString(36).slice(2, 9)}`,
    []
  )

  const destroyWidget = useCallback(() => {
    if (widgetInstanceRef.current?.destroy) {
      widgetInstanceRef.current.destroy()
      widgetInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!city || city.length < 3) {
      destroyWidget()
      return
    }

    let cleanupListener: (() => void) | undefined

    const initWidget = () => {
      const WidgetConstructor = window.CDEKWidget
      if (!WidgetConstructor) return

      destroyWidget()

      widgetInstanceRef.current = new WidgetConstructor({
        from: DEFAULT_ORIGIN_CITY,
        defaultLocation: city,
        root: containerId,
        apiKey: YANDEX_API_KEY,
        servicePath: SERVICE_PATH,
        onReady: () => {
          // Widget ready
        },
        onChoose: (point: any) => {
          onPointSelect?.(point)
        },
      })
    }

    if (window.CDEKWidget) {
      initWidget()
    } else {
      const handleReady = () => initWidget()
      window.addEventListener(READY_EVENT, handleReady)
      cleanupListener = () => window.removeEventListener(READY_EVENT, handleReady)
    }

    return () => {
      cleanupListener?.()
      destroyWidget()
    }
  }, [city, containerId, destroyWidget, onPointSelect])

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm">
      <div
        id={containerId}
        className="min-h-[420px] w-full overflow-hidden rounded-xl"
      />
    </div>
  )
}


