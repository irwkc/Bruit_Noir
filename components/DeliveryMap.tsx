'use client'

import { useEffect, useRef, useState } from 'react'

interface DeliveryPoint {
  id: string
  name: string
  address: string
  city: string
  country: string
  workingHours?: string
  latitude?: number
  longitude?: number
}

interface DeliveryMapProps {
  deliveryPoints: DeliveryPoint[]
  selectedPointId: string
  onPointSelect: (pointId: string) => void
  city?: string
}

export default function DeliveryMap({ deliveryPoints, selectedPointId, onPointSelect, city }: DeliveryMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [ymaps, setYmaps] = useState<any>(null)
  const [map, setMap] = useState<any>(null)
  const [placemarks, setPlacemarks] = useState<any[]>([])

  useEffect(() => {
    // Load Yandex Maps API
    if (typeof window !== 'undefined' && !window.ymaps) {
      const script = document.createElement('script')
      script.src = 'https://api-maps.yandex.ru/2.1/?lang=ru_RU'
      script.async = true
      script.onload = () => {
        window.ymaps.ready(() => {
          setYmaps(window.ymaps)
          setIsLoaded(true)
        })
      }
      document.head.appendChild(script)
    } else if (window.ymaps) {
      setYmaps(window.ymaps)
      setIsLoaded(true)
    }

    return () => {
      if (map) {
        map.destroy()
      }
    }
  }, [])

  // Function to geocode city and get coordinates
  const geocodeCity = async (cityName: string): Promise<[number, number] | null> => {
    if (!ymaps) return null
    
    try {
      const geocoder = ymaps.geocode(`${cityName}, Россия`)
      const result = await geocoder
      
      if (result.geoObjects.getLength() > 0) {
        const firstGeoObject = result.geoObjects.get(0)
        const coords = firstGeoObject.geometry.getCoordinates()
        return coords
      }
      return null
    } catch (error) {
      console.error('Geocoding error:', error)
      return null
    }
  }

  useEffect(() => {
    if (!isLoaded || !ymaps || !mapRef.current) return

    const initializeMap = async () => {
      // Default center (Moscow)
      let center: [number, number] = [55.7558, 37.6176]
      
      // Try to geocode city if provided
      if (city && city.trim()) {
        const cityCoords = await geocodeCity(city.trim())
        if (cityCoords) {
          center = cityCoords
        }
      } else if (deliveryPoints.length > 0) {
        // Use delivery points center if no city specified
        const pointsWithCoords = deliveryPoints.filter(p => p.latitude && p.longitude)
        if (pointsWithCoords.length > 0) {
          const avgLat = pointsWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / pointsWithCoords.length
          const avgLng = pointsWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / pointsWithCoords.length
          center = [avgLat, avgLng]
        }
      }

      // Create or update map
      let newMap = map
      if (!newMap) {
        newMap = new ymaps.Map(mapRef.current, {
          center: center,
          zoom: 13,
          controls: ['zoomControl', 'fullscreenControl']
        })
        setMap(newMap)
      } else {
        newMap.setCenter(center)
      }

      // Clear previous placemarks
      placemarks.forEach(placemark => {
        newMap.geoObjects.remove(placemark)
      })

      // Create placemarks for delivery points
      const pointsWithCoords = deliveryPoints.filter(p => p.latitude && p.longitude)
      const newPlacemarks = pointsWithCoords.map(point => {
        const placemark = new ymaps.Placemark(
          [point.latitude!, point.longitude!],
          {
            balloonContent: `
              <div style="padding: 10px;">
                <h3 style="margin: 0 0 5px 0; font-weight: bold;">${point.name}</h3>
                <p style="margin: 0 0 5px 0; color: #666;">${point.address}</p>
                ${point.workingHours ? `<p style="margin: 0; color: #888; font-size: 12px;">${point.workingHours}</p>` : ''}
              </div>
            `,
            iconCaption: point.name
          },
          {
            preset: selectedPointId === point.id ? 'islands#redDotIcon' : 'islands#blueDotIcon',
            draggable: false
          }
        )

        placemark.events.add('click', () => {
          onPointSelect(point.id)
        })

        return placemark
      })

      // Add placemarks to map
      newPlacemarks.forEach(placemark => {
        newMap.geoObjects.add(placemark)
      })

      setPlacemarks(newPlacemarks)
    }

    initializeMap()
  }, [isLoaded, ymaps, deliveryPoints, selectedPointId, onPointSelect, city])

  // Update map center when city changes
  useEffect(() => {
    if (!map || !ymaps || !city || !city.trim()) return

    const updateMapCenter = async () => {
      const cityCoords = await geocodeCity(city.trim())
      if (cityCoords) {
        map.setCenter(cityCoords)
      }
    }

    updateMapCenter()
  }, [city, map, ymaps])

  // Update placemark styles when selection changes
  useEffect(() => {
    if (!map || !placemarks.length || !deliveryPoints.length) return

    const pointsWithCoords = deliveryPoints.filter(p => p.latitude && p.longitude)
    
    placemarks.forEach((placemark, index) => {
      if (index < pointsWithCoords.length) {
        const point = pointsWithCoords[index]
        const isSelected = selectedPointId === point.id
        placemark.options.set('preset', isSelected ? 'islands#redDotIcon' : 'islands#blueDotIcon')
      }
    })
  }, [selectedPointId, map, placemarks, deliveryPoints])

  if (!isLoaded) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Загрузка карты...</p>
      </div>
    )
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
    </div>
  )
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ymaps: any
  }
}