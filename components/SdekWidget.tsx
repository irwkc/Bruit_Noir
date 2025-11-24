'use client'

import { useEffect, useState } from 'react'

interface SdekWidgetProps {
  city: string
  onPointSelect?: (point: any) => void
}

export default function SdekWidget({ city, onPointSelect }: SdekWidgetProps) {
  const [points, setPoints] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedPointId, setSelectedPointId] = useState<string | null>(null)

  useEffect(() => {
    if (!city || city.length < 3) {
      setPoints([])
      setError(null)
      setSelectedPointId(null)
      return
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000)

    const fetchPoints = async () => {
      setLoading(true)
      setError(null)
      setSelectedPointId(null)

      try {
        const response = await fetch(`/api/sdek-points?city=${encodeURIComponent(city)}`, {
          signal: controller.signal,
        })

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
          throw new Error(errorData.error || `Ошибка ${response.status}`)
        }

        const data = await response.json()

        if (data.error) {
          throw new Error(data.error)
        }

        if (!Array.isArray(data)) {
          throw new Error('Неверный формат ответа от сервера')
        }

        setPoints(data)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          setError('Превышено время ожидания ответа от сервера')
        } else {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки пунктов выдачи')
        }
        setPoints([])
      } finally {
        clearTimeout(timeoutId)
        setLoading(false)
      }
    }

    fetchPoints()

    return () => {
      controller.abort()
      clearTimeout(timeoutId)
    }
  }, [city])

  const handleSelect = (point: any) => {
    setSelectedPointId(point.id)
    onPointSelect?.(point)
  }

  if (!city || city.length < 3) {
    return (
      <div className="w-full h-64 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center text-sm text-gray-300">
        Введите город, чтобы увидеть пункты выдачи СДЭК
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl flex items-center justify-center">
        <div className="text-center text-gray-300">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-3" />
          Загрузка пунктов выдачи СДЭК...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full p-6 bg-red-500/10 border border-red-500/30 text-red-200 rounded-3xl text-sm text-center">
        {error}
      </div>
    )
  }

  if (points.length === 0) {
    return (
      <div className="w-full p-10 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl text-center text-gray-300">
        <div className="text-4xl mb-3">📦</div>
        Пункты выдачи СДЭК в городе «{city}» не найдены
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
      {points.map((point) => (
        <button
          key={point.id}
          type="button"
          onClick={() => handleSelect(point)}
          className={`w-full text-left rounded-2xl border px-4 py-4 transition ${
            selectedPointId === point.id
              ? 'bg-white/20 border-white text-white shadow-lg'
              : 'bg-white/10 border-white/15 text-white hover:bg-white/15'
          }`}
        >
          <div className="text-sm font-semibold line-clamp-2">{point.name}</div>
          <div className="text-xs text-gray-200 mt-1">{point.address}</div>
        </button>
      ))}
    </div>
  )
}

