'use client'

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect, useState } from 'react'

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

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
}

export default function DeliveryMap({ deliveryPoints, selectedPointId, onPointSelect }: DeliveryMapProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500">Загрузка карты...</p>
      </div>
    )
  }

  // Calculate center point from delivery points
  const center: [number, number] = [55.7558, 37.6176] // Default to Moscow
  if (deliveryPoints.length > 0) {
    const pointsWithCoords = deliveryPoints.filter(p => p.latitude && p.longitude)
    if (pointsWithCoords.length > 0) {
      const avgLat = pointsWithCoords.reduce((sum, p) => sum + (p.latitude || 0), 0) / pointsWithCoords.length
      const avgLng = pointsWithCoords.reduce((sum, p) => sum + (p.longitude || 0), 0) / pointsWithCoords.length
      center[0] = avgLat
      center[1] = avgLng
    }
  }

  return (
    <div className="w-full h-64 rounded-lg overflow-hidden border border-gray-300">
      <MapContainer
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {deliveryPoints.map((point) => {
          if (!point.latitude || !point.longitude) return null
          
          return (
            <Marker
              key={point.id}
              position={[point.latitude, point.longitude]}
              eventHandlers={{
                click: () => onPointSelect(point.id)
              }}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-semibold">{point.name}</p>
                  <p className="text-gray-600">{point.address}</p>
                  {point.workingHours && (
                    <p className="text-gray-500 mt-1">{point.workingHours}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          )
        })}
      </MapContainer>
    </div>
  )
}
