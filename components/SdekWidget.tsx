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
        
        // Add header with count
        const header = document.createElement('div')
        header.className = 'mb-3 p-3 bg-green-50 rounded-lg'
        header.innerHTML = `
          <div class="text-sm font-semibold text-green-800">
            ✅ Найдено пунктов выдачи: ${points.length}
          </div>
        `
        widgetRef.current.appendChild(header)
        
        const container = document.createElement('div')
        container.className = 'space-y-2 overflow-y-auto'
        container.style.maxHeight = '400px'
        
        points.forEach((point, index) => {
          const pointElement = document.createElement('div')
          pointElement.className = 'p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-gray-400 transition'
          pointElement.setAttribute('data-point-id', point.id)
          pointElement.innerHTML = `
            <div class="flex items-start space-x-3">
              <input type="radio" name="sdek-point" value="${point.id}" id="point-${index}" class="mt-1 w-4 h-4">
              <label for="point-${index}" class="flex-1 cursor-pointer">
                <div class="font-semibold text-sm text-gray-900">${point.name}</div>
                <div class="text-xs text-gray-600 mt-1">${point.address}</div>
                ${point.workingHours ? `<div class="text-xs text-gray-500 mt-1">🕐 ${point.workingHours}</div>` : ''}
                ${point.phone ? `<div class="text-xs text-blue-600 mt-1">📞 ${point.phone}</div>` : ''}
              </label>
            </div>
          `
          
          pointElement.addEventListener('click', () => {
            // Clear other selections
            container.querySelectorAll('[data-point-id]').forEach((el: any) => {
              el.classList.remove('border-black', 'bg-gray-50')
              el.classList.add('border-gray-200')
            })
            
            // Highlight selected
            pointElement.classList.remove('border-gray-200')
            pointElement.classList.add('border-black', 'bg-gray-50')
            
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
      <div 
        ref={widgetRef} 
        className="w-full border border-gray-300 rounded-lg bg-white p-4"
      />
      
      {!isLoaded && (
        <div className="w-full p-8 bg-gray-100 rounded-lg flex items-center justify-center">
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
