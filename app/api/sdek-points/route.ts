import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    // Mock data for SDEK delivery points
    // In real implementation, you would call SDEK API here
    const mockSdekPoints = [
      {
        id: `sdek-${city}-1`,
        name: `СДЭК - ${city} Центральный`,
        address: `ул. Центральная, 1, ${city}`,
        city: city,
        country: 'Россия',
        workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
        latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
        longitude: 37.6176 + (Math.random() - 0.5) * 0.1,
      },
      {
        id: `sdek-${city}-2`,
        name: `СДЭК - ${city} Северный`,
        address: `ул. Северная, 15, ${city}`,
        city: city,
        country: 'Россия',
        workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
        latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
        longitude: 37.6176 + (Math.random() - 0.5) * 0.1,
      },
      {
        id: `sdek-${city}-3`,
        name: `СДЭК - ${city} Южный`,
        address: `ул. Южная, 25, ${city}`,
        city: city,
        country: 'Россия',
        workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
        latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
        longitude: 37.6176 + (Math.random() - 0.5) * 0.1,
      },
      {
        id: `sdek-${city}-4`,
        name: `СДЭК - ${city} Восточный`,
        address: `ул. Восточная, 8, ${city}`,
        city: city,
        country: 'Россия',
        workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
        latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
        longitude: 37.6176 + (Math.random() - 0.5) * 0.1,
      },
      {
        id: `sdek-${city}-5`,
        name: `СДЭК - ${city} Западный`,
        address: `ул. Западная, 12, ${city}`,
        city: city,
        country: 'Россия',
        workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
        latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
        longitude: 37.6176 + (Math.random() - 0.5) * 0.1,
      }
    ]

    // Add some random points for demonstration
    const additionalPoints = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, (_, i) => ({
      id: `sdek-${city}-${i + 6}`,
      name: `СДЭК - ${city} Пункт ${i + 6}`,
      address: `ул. Примерная, ${Math.floor(Math.random() * 100) + 1}, ${city}`,
      city: city,
      country: 'Россия',
      workingHours: 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
      latitude: 55.7558 + (Math.random() - 0.5) * 0.1,
      longitude: 37.6176 + (Math.random() - 0.5) * 0.1,
    }))

    const allPoints = [...mockSdekPoints, ...additionalPoints]

    return NextResponse.json(allPoints)
  } catch (error) {
    console.error('Error fetching SDEK points:', error)
    return NextResponse.json({ error: 'Failed to fetch SDEK points' }, { status: 500 })
  }
}
