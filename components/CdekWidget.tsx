'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

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
  const isInitializingRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const containerIdRef = useRef<string | null>(null)

  // Генерируем ID только на клиенте после монтирования
  useEffect(() => {
    if (typeof window !== 'undefined' && !containerIdRef.current) {
      containerIdRef.current = `cdek-widget-${Math.random().toString(36).slice(2, 9)}`
      setMounted(true)
    }
  }, [])

  const destroyWidget = useCallback(() => {
    if (widgetInstanceRef.current?.destroy) {
      widgetInstanceRef.current.destroy()
      widgetInstanceRef.current = null
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted || !containerIdRef.current) return
    if (!city || city.length < 3) {
      destroyWidget()
      return
    }

    const containerId = containerIdRef.current
    let cleanupListener: (() => void) | undefined
    let initTimeout: NodeJS.Timeout | undefined
    let checkInterval: NodeJS.Timeout | undefined

    const initWidget = () => {
      // Предотвращаем множественную инициализацию
      if (isInitializingRef.current) {
        return false
      }

      // Если виджет уже инициализирован, не создаём новый
      if (widgetInstanceRef.current) {
        return true
      }

      // Проверяем наличие всех зависимостей
      if (!window.CDEKWidget || !(window as any).__cdek_widget_loaded) {
        console.log('CDEK widget dependencies check:', {
          CDEKWidget: !!window.CDEKWidget,
          __cdek_widget_loaded: !!(window as any).__cdek_widget_loaded,
        })
        return false
      }

      // Проверяем, что Яндекс.Карты загружены и готовы
      if (!(window as any).ymaps || !(window as any).__ymaps_ready) {
        console.log('Yandex Maps dependencies check:', {
          ymaps: !!(window as any).ymaps,
          __ymaps_ready: !!(window as any).__ymaps_ready,
        })
        return false
      }
      
      console.log('All dependencies loaded, initializing widget...')

      // Убеждаемся, что контейнер существует
      const container = document.getElementById(containerId)
      if (!container) {
        return false
      }

      // Помечаем, что начинаем инициализацию
      isInitializingRef.current = true

      destroyWidget()

      try {
        console.log('Initializing CDEK widget with:', {
          from: DEFAULT_ORIGIN_CITY,
          defaultLocation: city,
          root: containerId,
          apiKey: YANDEX_API_KEY ? 'present' : 'missing',
          servicePath: SERVICE_PATH,
        })
        
        widgetInstanceRef.current = new window.CDEKWidget({
          from: DEFAULT_ORIGIN_CITY,
          defaultLocation: city,
          root: containerId,
          apiKey: YANDEX_API_KEY,
          servicePath: SERVICE_PATH,
          onReady: () => {
            console.log('CDEK widget initialized successfully')
            isInitializingRef.current = false
          },
          onChoose: (point: any) => {
            console.log('CDEK point selected:', point)
            onPointSelect?.(point)
          },
          onError: (error: any) => {
            console.error('CDEK widget error:', error)
            isInitializingRef.current = false
            
            // Показываем сообщение об ошибке пользователю
            const container = document.getElementById(containerId)
            if (container) {
              container.innerHTML = `
                <div class="p-6 text-center text-red-500">
                  <div class="text-4xl mb-2">⚠️</div>
                  <p class="font-semibold mb-2">Ошибка загрузки виджета СДЭК</p>
                  <p class="text-sm text-gray-600">${error?.message || 'Попробуйте обновить страницу'}</p>
                  <button 
                    onclick="window.location.reload()" 
                    class="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                  >
                    Обновить страницу
                  </button>
                </div>
              `
            }
          },
        })
        console.log('CDEK widget instance created')
        return true
      } catch (error) {
        console.error('Failed to initialize CDEK widget:', error)
        isInitializingRef.current = false
        
        // Показываем сообщение об ошибке пользователю
        const container = document.getElementById(containerId)
        if (container) {
          container.innerHTML = `
            <div class="p-6 text-center text-red-500">
              <div class="text-4xl mb-2">⚠️</div>
              <p class="font-semibold mb-2">Ошибка инициализации виджета СДЭК</p>
              <p class="text-sm text-gray-600">${error instanceof Error ? error.message : 'Попробуйте обновить страницу'}</p>
              <button 
                onclick="window.location.reload()" 
                class="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
              >
                Обновить страницу
              </button>
            </div>
          `
        }
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
      let readyHandler: (() => void) | null = null
      
      // Если виджет не загружен, ждём события
      if (!window.CDEKWidget || !(window as any).__cdek_widget_loaded) {
        console.log('Waiting for CDEK widget to load...')
        readyHandler = () => {
          console.log('CDEK widget loaded event received')
          // Даём время на загрузку Яндекс.Карт
          setTimeout(() => {
            if (!tryInit() && !checkInterval) {
              console.log('Starting periodic check for widget initialization...')
              // Если не получилось, проверяем периодически
              checkInterval = setInterval(() => {
                if (tryInit()) {
                  console.log('Widget initialized via periodic check')
                  clearInterval(checkInterval!)
                  checkInterval = undefined
                }
              }, 500)
            }
          }, 2000)
        }
        window.addEventListener(READY_EVENT, readyHandler)
        window.addEventListener('ymaps-ready', readyHandler)
        cleanupListener = () => {
          if (readyHandler) {
            window.removeEventListener(READY_EVENT, readyHandler)
            window.removeEventListener('ymaps-ready', readyHandler)
          }
        }
      }

      // Если Яндекс.Карты не загружены, проверяем периодически
      if ((!(window as any).ymaps || !(window as any).__ymaps_ready) && !checkInterval) {
        checkInterval = setInterval(() => {
          // Просто проверяем наличие ymaps и флага готовности
          if ((window as any).ymaps && (window as any).__ymaps_ready) {
            if (tryInit()) {
              clearInterval(checkInterval!)
              checkInterval = undefined
            }
          }
        }, 500)
      }
    }

    return () => {
      cleanupListener?.()
      if (initTimeout) clearTimeout(initTimeout)
      if (checkInterval) clearInterval(checkInterval)
      isInitializingRef.current = false
      destroyWidget()
    }
  }, [city, destroyWidget, onPointSelect, mounted])

  // Не рендерим контейнер до монтирования, чтобы избежать проблем с гидратацией
  if (!mounted || !containerIdRef.current) {
    return (
      <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div
          style={{ width: '100%', height: '600px', minHeight: '600px' }}
          className="w-full flex items-center justify-center"
        >
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-500">Загрузка карты...</p>
          </div>
        </div>
      </div>
    )
  }
  
  // Если город не указан или слишком короткий
  if (!city || city.length < 3) {
    return (
      <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
        <div
          style={{ width: '100%', height: '600px', minHeight: '600px' }}
          className="w-full flex items-center justify-center"
        >
          <p className="text-gray-500">Введите город для загрузки пунктов выдачи СДЭК</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
      <div
        id={containerIdRef.current}
        style={{ width: '100%', height: '600px', minHeight: '600px' }}
        className="w-full"
      />
    </div>
  )
}


