import { NextRequest, NextResponse } from 'next/server'

const CDEK_LOGIN = 'WZZgKAtswgunooJgz6cON4erHC7GUfeq'
const CDEK_SECRET = 'DIpAX2MTgYBxmj6TASdVZ9OkkOkhMiR7'
const CDEK_BASE_URL = 'https://api.cdek.ru/v2'

let authToken: string | null = null
let tokenExpiry: number = 0

async function getCdekAuthToken(): Promise<string> {
  // Проверяем, есть ли валидный токен
  if (authToken && Date.now() < tokenExpiry) {
    return authToken
  }

  const formData = new URLSearchParams()
  formData.append('grant_type', 'client_credentials')
  formData.append('client_id', CDEK_LOGIN)
  formData.append('client_secret', CDEK_SECRET)

  const response = await fetch(`${CDEK_BASE_URL}/oauth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData.toString(),
  })

  if (!response.ok) {
    throw new Error('Failed to get CDEK auth token')
  }

  const data = await response.json()

  if (!data.access_token) {
    throw new Error('No access token in CDEK response')
  }

  const newToken = data.access_token
  authToken = newToken
  tokenExpiry = Date.now() + (data.expires_in || 3500) * 1000

  return newToken
}

// Используем реальный API СДЭК v2
async function fetchRealSdekPoints(city: string) {
  try {
    const token = await getCdekAuthToken()
    
    // Получаем пункты выдачи через официальный API СДЭК v2
    // Ограничиваем количество пунктов для производительности
    const response = await fetch(`${CDEK_BASE_URL}/deliverypoints?city=${encodeURIComponent(city)}&type=PVZ&is_handout=true&size=50`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`CDEK API error (${response.status}):`, errorText)
      throw new Error(`CDEK API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    
    // API СДЭК v2 возвращает массив пунктов выдачи
    if (!data || !Array.isArray(data)) {
      console.error('Invalid CDEK API response:', data)
      throw new Error('Invalid response from CDEK API')
    }

    if (data.length === 0) {
      return []
    }

    // Ограничиваем количество пунктов до 50 для производительности
    const limitedData = data.slice(0, 50)

    return limitedData.map((point: any) => ({
      id: point.code || point.uuid || `sdek-${point.code}`,
      code: point.code,
      name: point.name || `СДЭК - ${point.location?.address || city}`,
      address: point.location?.address || point.address || '',
      city: point.location?.city || city,
      country: point.location?.country || 'Россия',
      workingHours: point.work_time || point.workTime || 'Пн-Пт: 9:00-21:00, Сб-Вс: 10:00-18:00',
      latitude: point.location?.latitude || point.latitude || null,
      longitude: point.location?.longitude || point.longitude || null,
      phone: point.phones?.[0]?.number || point.phone || '',
      email: point.email || '',
      type: point.type || 'PVZ',
      pvz_code: point.code,
    }))
  } catch (error) {
    console.error('SDEK API error:', error)
    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')

    if (!city) {
      return NextResponse.json({ error: 'City parameter is required' }, { status: 400 })
    }

    // Получаем реальные данные из API СДЭК v2
    console.log(`Fetching SDEK points for city: ${city}`)
    const points = await fetchRealSdekPoints(city)
    console.log(`SDEK API returned:`, points ? points.length : 0, 'points')
    
    // Возвращаем пустой массив, если пунктов нет, или массив пунктов
    return NextResponse.json(points || [])
    
  } catch (error) {
    console.error('Error fetching SDEK points:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to fetch SDEK points'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}
