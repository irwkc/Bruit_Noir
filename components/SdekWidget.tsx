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

      // Try to load SDEK points directly via API
      const loadSdekPoints = async () => {
        try {
          const response = await fetch(`/api/sdek-points?city=${encodeURIComponent(city)}`)
          const points = await response.json()
          
          if (points && points.length > 0) {
            renderPointsList(points)
            setIsLoaded(true)
          } else {
            renderNoPoints()
            setIsLoaded(true)
          }
        } catch (error) {
          console.error('Failed to load SDEK points:', error)
          renderError()
          setIsLoaded(true)
        }
      }

      const renderPointsList = (points: any[]) => {
        if (!widgetRef.current) return
        
        const container = document.createElement('div')
        container.className = 'space-y-2 max-h-80 overflow-y-auto'
        
        points.forEach((point, index) => {
          const pointElement = document.createElement('div')
          pointElement.className = 'p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition'
          pointElement.innerHTML = `
            <div class="flex items-start space-x-3">
              <input type="radio" name="sdek-point" value="${point.id}" id="point-${index}" class="mt-1">
              <label for="point-${index}" class="flex-1 cursor-pointer">
                <div class="font-semibold text-sm">${point.name}</div>
                <div class="text-xs text-gray-600 mt-1">${point.address}</div>
                ${point.workingHours ? `<div class="text-xs text-gray-500 mt-1">${point.workingHours}</div>` : ''}
                ${point.phone ? `<div class="text-xs text-blue-600 mt-1">📞 ${point.phone}</div>` : ''}
              </label>
            </div>
          `
          
          pointElement.addEventListener('click', () => {
            // Clear other selections
            container.querySelectorAll('input[type="radio"]').forEach((radio: any) => {
              radio.checked = false
            })
            
            // Select this point
            const radio = pointElement.querySelector('input[type="radio"]') as HTMLInputElement
            radio.checked = true
            
            // Call callback
            if (onPointSelect) {
              onPointSelect(point)
            }
          })
          
          container.appendChild(pointElement)
        })
        
        widgetRef.current.appendChild(container)
      }

      const renderNoPoints = () => {
        if (!widgetRef.current) return
        
        widgetRef.current.innerHTML = `
          <div class="p-6 text-center text-gray-500">
            <div class="text-4xl mb-2">📦</div>
            <p>Пункты выдачи СДЭК в городе "${city}" не найдены</p>
            <p class="text-sm mt-2">Попробуйте ввести другой город</p>
          </div>
        `
      }

      const renderError = () => {
        if (!widgetRef.current) return
        
        widgetRef.current.innerHTML = `
          <div class="p-6 text-center text-red-500">
            <div class="text-4xl mb-2">⚠️</div>
            <p>Ошибка загрузки пунктов выдачи</p>
            <p class="text-sm mt-2">Попробуйте обновить страницу</p>
          </div>
        `
      }

      loadSdekPoints()
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
