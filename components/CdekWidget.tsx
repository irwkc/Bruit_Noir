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

// Глобальный счетчик для уникальных ID контейнеров
let widgetCounter = 0
// Глобальный реестр активных виджетов для предотвращения множественной инициализации
const activeWidgets = new Set<string>()

// Глобальный обработчик для подавления необработанных ошибок CanceledError
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason
    const errorMessage = String(error?.message || error || '').toLowerCase()
    
    // Подавляем CanceledError и другие некритичные ошибки виджета
    if (
      errorMessage.includes('canceled') ||
      errorMessage.includes('aborted') ||
      error?.name === 'CanceledError'
    ) {
      event.preventDefault()
      console.debug('Suppressed CanceledError from CDEK widget:', error)
    }
  })
}

export default function CdekWidget({ city, onPointSelect }: CdekWidgetProps) {
  const widgetInstanceRef = useRef<{ destroy?: () => void } | null>(null)
  const isInitializingRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const containerIdRef = useRef<string | null>(null)
  const hasInitializedRef = useRef(false)
  const componentKeyRef = useRef<string | null>(null)

  // Генерируем стабильный ID только один раз при первом рендере
  const containerId = useMemo(() => {
    if (typeof window !== 'undefined') {
      widgetCounter++
      const id = `cdek-widget-${widgetCounter}`
      // Генерируем уникальный ключ для компонента, чтобы React правильно различал экземпляры
      componentKeyRef.current = `cdek-widget-component-${Date.now()}-${Math.random()}`
      return id
    }
    return null
  }, [])

  // Устанавливаем mounted и containerIdRef после монтирования
  useEffect(() => {
    if (typeof window !== 'undefined' && containerId) {
      containerIdRef.current = containerId
      setMounted(true)
    }
  }, [containerId])

  const destroyWidget = useCallback(() => {
    if (widgetInstanceRef.current?.destroy) {
      try {
        widgetInstanceRef.current.destroy()
      } catch (error) {
        console.warn('Error destroying widget:', error)
      }
      widgetInstanceRef.current = null
    }
    // Удаляем из реестра активных виджетов
    if (containerIdRef.current) {
      activeWidgets.delete(containerIdRef.current)
      const container = document.getElementById(containerIdRef.current)
      if (container) {
        container.removeAttribute('data-cdek-widget')
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined' || !mounted || !containerIdRef.current || !containerId) return
    if (!city || city.length < 3) {
      destroyWidget()
      hasInitializedRef.current = false
      return
    }

    const currentContainerId = containerIdRef.current
    let cleanupListener: (() => void) | undefined
    let initTimeout: NodeJS.Timeout | undefined
    let checkInterval: NodeJS.Timeout | undefined

    const initWidget = () => {
      // Предотвращаем множественную инициализацию
      if (isInitializingRef.current || hasInitializedRef.current) {
        console.log('Widget initialization blocked: already initializing or initialized')
        return false
      }

      // Проверяем, не инициализирован ли уже виджет в этом контейнере глобально
      if (activeWidgets.has(currentContainerId)) {
        console.log('Widget already active for container:', currentContainerId)
        hasInitializedRef.current = true
        return true
      }

      // Если виджет уже инициализирован, не создаём новый
      if (widgetInstanceRef.current) {
        hasInitializedRef.current = true
        activeWidgets.add(currentContainerId)
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

      // Убеждаемся, что контейнер существует и пуст
      const container = document.getElementById(currentContainerId)
      if (!container) {
        console.log('Container not found:', currentContainerId)
        return false
      }

      // Проверяем, не инициализирован ли уже виджет в этом контейнере
      if (container.children.length > 0) {
        const hasCdekContent = container.querySelector('[class*="cdek"], [id*="cdek"], iframe, [data-cdek-widget]')
        if (hasCdekContent) {
          console.log('Widget already rendered in container, skipping initialization')
          hasInitializedRef.current = true
          activeWidgets.add(currentContainerId)
          return true
        }
      }

      // СТРОГАЯ ПРОВЕРКА: разрешаем только один активный виджет на странице
      // Проверяем, есть ли уже отрендеренный виджет в любом контейнере на странице
      const existingWidget = document.querySelector('[data-cdek-widget="ready"], [data-cdek-widget="initializing"]')
      if (existingWidget) {
        const existingId = existingWidget.id
        // Если это не наш контейнер, блокируем инициализацию
        if (existingId !== currentContainerId) {
          console.log('Another widget is already active on the page:', existingId, '- skipping initialization for:', currentContainerId)
          hasInitializedRef.current = true
          // Скрываем этот контейнер, так как виджет уже отображается в другом месте
          if (container) {
            container.style.display = 'none'
          }
          return true
        }
      }
      
      // Дополнительная проверка через реестр активных виджетов
      if (activeWidgets.size > 0 && !activeWidgets.has(currentContainerId)) {
        console.log('Other widgets are in registry, checking if they are visible...')
        // Проверяем, действительно ли другие виджеты видны на странице
        let hasVisibleWidget = false
        activeWidgets.forEach((widgetId) => {
          const widgetContainer = document.getElementById(widgetId)
          if (widgetContainer && widgetContainer.offsetParent !== null) {
            hasVisibleWidget = true
          }
        })
        if (hasVisibleWidget) {
          console.log('Visible widget found, skipping initialization for:', currentContainerId)
          hasInitializedRef.current = true
          if (container) {
            container.style.display = 'none'
          }
          return true
        }
      }

      // Помечаем, что начинаем инициализацию
      isInitializingRef.current = true
      activeWidgets.add(currentContainerId)

      // Очищаем контейнер перед инициализацией
      container.innerHTML = ''
      container.setAttribute('data-cdek-widget', 'initializing')
      destroyWidget()

      try {
        // Дополнительная проверка на клиентскую сторону перед инициализацией
        if (typeof window === 'undefined' || !window.location) {
          console.log('Skipping widget initialization: not in browser environment')
          return false
        }

        console.log('Initializing CDEK widget with:', {
          from: DEFAULT_ORIGIN_CITY,
          defaultLocation: city,
          root: currentContainerId,
          apiKey: YANDEX_API_KEY ? 'present' : 'missing',
          servicePath: SERVICE_PATH,
        })
        
        widgetInstanceRef.current = new window.CDEKWidget({
          from: DEFAULT_ORIGIN_CITY,
          defaultLocation: city,
          root: currentContainerId,
          apiKey: YANDEX_API_KEY,
          servicePath: SERVICE_PATH,
          onReady: () => {
            console.log('CDEK widget initialized successfully for container:', currentContainerId)
            isInitializingRef.current = false
            hasInitializedRef.current = true
            const container = document.getElementById(currentContainerId)
            if (container) {
              container.setAttribute('data-cdek-widget', 'ready')
            }
          },
          onChoose: (point: any) => {
            console.log('CDEK point selected:', point)
            onPointSelect?.(point)
          },
          onError: (error: any) => {
            // Игнорируем ошибки 404/403 и CanceledError - это нормально для виджета
            const errorMessage = String(error?.message || error || '')
            const errorString = errorMessage.toLowerCase()
            
            if (
              errorString.includes('404') || 
              errorString.includes('403') || 
              errorString.includes('canceled') ||
              errorString.includes('aborted')
            ) {
              // Эти ошибки можно игнорировать - они не критичны
              return
            }
            
            console.error('CDEK widget error:', error)
            isInitializingRef.current = false
            hasInitializedRef.current = false
            
            // Показываем сообщение об ошибке пользователю только для критических ошибок
            const container = document.getElementById(currentContainerId)
            if (container) {
              container.innerHTML = `
                <div class="p-6 text-center text-red-500">
                  <div class="text-4xl mb-2">⚠️</div>
                  <p class="font-semibold mb-2">Ошибка загрузки виджета СДЭК</p>
                  <p class="text-sm text-gray-600">Попробуйте обновить страницу</p>
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
        const container = document.getElementById(currentContainerId)
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
      // Не сбрасываем hasInitializedRef здесь, чтобы избежать повторной инициализации
      destroyWidget()
    }
  }, [city, destroyWidget, onPointSelect, mounted, containerId])

  // Не рендерим контейнер до монтирования, чтобы избежать проблем с гидратацией
  if (!mounted || !containerId) {
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

  // ВАЖНО: Виджет CDEK использует normalize.css (Reset CSS), что может влиять на стили страницы
  // См. https://github.com/cdek-it/widget/wiki
  // Также при использовании с Яндекс-картами стабильность не гарантируется
  // Изолируем виджет в отдельном контейнере для минимизации влияния на остальную страницу
  return (
    <div 
      key={componentKeyRef.current || containerId}
      className="w-full border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden cdek-widget-wrapper" 
      suppressHydrationWarning
      style={{ isolation: 'isolate' }} // CSS isolation для предотвращения влияния normalize.css на остальную страницу
    >
      <div
        id={containerId}
        key={containerId}
        style={{ width: '100%', height: '600px', minHeight: '600px', contain: 'layout style paint' }}
        className="w-full cdek-widget-container"
        suppressHydrationWarning
        data-cdek-container={containerId}
      />
    </div>
  )
}


