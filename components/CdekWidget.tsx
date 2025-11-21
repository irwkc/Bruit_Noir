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
    let initTimeout: NodeJS.Timeout | undefined
    let checkInterval: NodeJS.Timeout | undefined

    const initWidget = () => {
      // Проверяем наличие всех зависимостей
      if (!window.CDEKWidget) {
        return false
      }

      // Проверяем, что Яндекс.Карты загружены
      if (!(window as any).ymaps) {
        return false
      }

      // Убеждаемся, что контейнер существует
      const container = document.getElementById(containerId)
      if (!container) {
        return false
      }

      // Если виджет уже инициализирован, не создаём новый
      if (widgetInstanceRef.current) {
        return true
      }

      destroyWidget()

      try {
        widgetInstanceRef.current = new window.CDEKWidget({
          from: DEFAULT_ORIGIN_CITY,
          defaultLocation: city,
          root: containerId,
          apiKey: YANDEX_API_KEY,
          servicePath: SERVICE_PATH,
          onReady: () => {
            console.log('CDEK widget ready')
          },
          onChoose: (point: any) => {
            console.log('CDEK point selected:', point)
            onPointSelect?.(point)
          },
          onError: (error: any) => {
            console.error('CDEK widget error:', error)
          },
        })
        return true
      } catch (error) {
        console.error('Failed to initialize CDEK widget:', error)
        return false
      }
    }

    // Функция для попытки инициализации с проверками
    const tryInit = () => {
      if (initWidget()) {
        if (checkInterval) {
          clearInterval(checkInterval)
          checkInterval = undefined
        }
        return true
      }
      return false
    }

    // Пробуем инициализировать сразу
    if (!tryInit()) {
      // Если не получилось, ждём события загрузки виджета
      const handleReady = () => {
        if (!tryInit()) {
          // Если виджет загрузился, но Яндекс.Карты ещё нет, проверяем периодически
          checkInterval = setInterval(() => {
            if (tryInit()) {
              clearInterval(checkInterval!)
              checkInterval = undefined
            }
          }, 300)
        }
      }
      
      if (window.CDEKWidget) {
        handleReady()
      } else {
        window.addEventListener(READY_EVENT, handleReady)
        cleanupListener = () => window.removeEventListener(READY_EVENT, handleReady)
      }

      // Также проверяем Яндекс.Карты отдельно
      if (!(window as any).ymaps) {
        checkInterval = setInterval(() => {
          if (tryInit()) {
            clearInterval(checkInterval!)
            checkInterval = undefined
          }
        }, 300)
      }
    }

    return () => {
      cleanupListener?.()
      if (initTimeout) clearTimeout(initTimeout)
      if (checkInterval) clearInterval(checkInterval)
      destroyWidget()
    }
  }, [city, containerId, destroyWidget, onPointSelect])

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div
        id={containerId}
        style={{ width: '100%', height: '600px', minHeight: '600px' }}
        className="w-full"
      />
    </div>
  )
}


