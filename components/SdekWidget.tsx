'use client'

import { useEffect, useRef, useState } from 'react'

interface SdekWidgetProps {
  city: string
  onPointSelect?: (point: any) => void
}

export default function SdekWidget({ city, onPointSelect }: SdekWidgetProps) {
  const widgetRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    if (!city || city.length < 3) return

    const loadSdekWidget = () => {
      // Remove any existing widget
      if (widgetRef.current) {
        widgetRef.current.innerHTML = ''
      }

      // Create SDEK widget script
      const script = document.createElement('script')
      script.src = 'https://widget.cdek.ru/widget/scripts/rest/api/widget.js'
      script.async = true
      
      script.onload = () => {
        // Initialize SDEK widget
        if (window.cdek && window.cdek.widget) {
          const widget = new window.cdek.widget({
            defaultCity: city,
            popup: false,
            hidedress: false,
            hidecash: false,
            hidedelt: false,
            hidenp: false,
            parent: widgetRef.current
          })

          widget.on('select', (point: any) => {
            if (onPointSelect) {
              onPointSelect(point)
            }
          })

          setIsLoaded(true)
        }
      }

      script.onerror = () => {
        console.error('Failed to load SDEK widget')
      }

      document.head.appendChild(script)

      return () => {
        document.head.removeChild(script)
      }
    }

    loadSdekWidget()
  }, [city, onPointSelect])

  if (!city || city.length < 3) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Введите город для загрузки пунктов выдачи СДЭК</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="font-semibold text-gray-700 mb-2">
          Пункты выдачи СДЭК в городе: {city}
        </h3>
        <p className="text-sm text-gray-600">
          Выберите пункт выдачи из списка ниже
        </p>
      </div>
      
      <div 
        ref={widgetRef} 
        className="w-full min-h-64 border border-gray-300 rounded-lg bg-white"
        style={{ minHeight: '400px' }}
      />
      
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-100 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-2"></div>
            <p className="text-gray-500">Загрузка пунктов выдачи СДЭК...</p>
          </div>
        </div>
      )}
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    cdek: {
      widget: any
    }
  }
}
