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

// Получаем код города по названию через API локаций СДЭК
async function getCityCode(cityName: string): Promise<number | null> {
  try {
    const token = await getCdekAuthToken()
    
    // Ищем город по названию через API локаций
    const response = await fetch(`${CDEK_BASE_URL}/location/cities?city=${encodeURIComponent(cityName)}&size=1`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      console.error(`CDEK location API error (${response.status})`)
      return null
    }

    const data = await response.json()
    
    // API возвращает массив городов
    if (!data || !Array.isArray(data) || data.length === 0) {
      console.log(`City "${cityName}" not found in CDEK API`)
      return null
    }

    // Берем первый найденный город
    const city = data[0]
    const cityCode = city.code || city.city_code || null
    
    if (cityCode) {
      console.log(`Found city code for "${cityName}": ${cityCode}`)
    }
    
    return cityCode
  } catch (error) {
    console.error('Error fetching city code:', error)
    return null
  }
}

// Используем реальный API СДЭК v2
async function fetchRealSdekPoints(cityName: string) {
  try {
    const token = await getCdekAuthToken()
  
    // Сначала получаем код города
    const cityCode = await getCityCode(cityName)
    
    if (!cityCode) {
      console.log(`City code not found for "${cityName}", trying to search by name directly`)
      // Если код не найден, пробуем искать по названию (может сработать для некоторых городов)
    }
    
    // Формируем URL для получения пунктов выдачи
    // Используем city_code если найден, иначе city (название)
    const urlParams = new URLSearchParams({
      type: 'PVZ',
      is_handout: 'true',
      size: '200', // Увеличиваем лимит для получения всех пунктов
    })
    
    if (cityCode) {
      urlParams.append('city_code', cityCode.toString())
    } else {
      urlParams.append('city', cityName)
    }
    
    const response = await fetch(`${CDEK_BASE_URL}/deliverypoints?${urlParams.toString()}`, {
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

    // Фильтруем пункты выдачи по городу (на случай, если API вернул пункты из других городов)
    const filteredData = data.filter((point: any) => {
      const pointCity = point.location?.city || point.city || ''
      // Проверяем, что город пункта выдачи совпадает с запрошенным (без учета регистра)
      return pointCity.toLowerCase().includes(cityName.toLowerCase()) || 
             cityName.toLowerCase().includes(pointCity.toLowerCase())
    })

    // Если после фильтрации ничего не осталось, возвращаем все пункты
    // (возможно, API уже отфильтровал правильно)
    const pointsToUse = filteredData.length > 0 ? filteredData : data

    // Возвращаем все пункты выдачи
    return pointsToUse.map((point: any) => ({
      id: point.code || point.uuid || `sdek-${point.code}`,
      code: point.code,
      name: point.name || `СДЭК - ${point.location?.address || cityName}`,
      address: point.location?.address || point.address || '',
      city: point.location?.city || point.city || cityName,
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
