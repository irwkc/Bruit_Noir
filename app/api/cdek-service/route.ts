import { NextRequest, NextResponse } from 'next/server'

const CDEK_LOGIN = 'WZZgKAtswgunooJgz6cON4erHC7GUfeq'
const CDEK_SECRET = 'DIpAX2MTgYBxmj6TASdVZ9OkkOkhMiR7'
const CDEK_BASE_URL = 'https://api.cdek.ru/v2'
const SERVICE_VERSION = '3.11.1'

let authToken: string | null = null
let tokenExpiry: number = 0

async function getAuthToken(): Promise<string> {
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
  // Токен обычно валиден 3600 секунд, ставим на 3500 для безопасности
  tokenExpiry = Date.now() + (data.expires_in || 3500) * 1000

  return newToken
}

async function makeCdekRequest(
  method: string,
  params: Record<string, any>,
  useJson: boolean = false
): Promise<{ result: string; headers: Headers }> {
  const token = await getAuthToken()

  const headers: HeadersInit = {
    Accept: 'application/json',
    'X-App-Name': 'widget_pvz',
    'X-App-Version': SERVICE_VERSION,
    Authorization: `Bearer ${token}`,
  }

  let url = `${CDEK_BASE_URL}/${method}`
  let body: string | undefined

  if (useJson) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(params)
  } else {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value))
      }
    })
    url += '?' + searchParams.toString()
  }

  const response = await fetch(url, {
    method: useJson ? 'POST' : 'GET',
    headers,
    body,
  })

  const result = await response.text()

  return {
    result,
    headers: response.headers,
  }
}

export async function GET(request: NextRequest) {
  return handleRequest(request)
}

export async function POST(request: NextRequest) {
  return handleRequest(request)
}

async function handleRequest(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const action = searchParams.get('action')

    // Получаем данные из body для POST запросов
    let bodyData: Record<string, any> = {}
    if (request.method === 'POST') {
      try {
        bodyData = await request.json()
      } catch {
        // Если body пустой или не JSON, игнорируем
      }
    }

    // Объединяем параметры из query и body
    const requestData: Record<string, any> = {}
    searchParams.forEach((value, key) => {
      requestData[key] = value
    })
    Object.assign(requestData, bodyData)

    if (!action) {
      return NextResponse.json(
        { message: 'Action is required' },
        {
          status: 400,
          headers: {
            'X-Service-Version': SERVICE_VERSION,
          },
        }
      )
    }

    let result: { result: string; headers: Headers }

    switch (action) {
      case 'offices':
        result = await makeCdekRequest('deliverypoints', requestData)
        break
      case 'calculate':
        result = await makeCdekRequest('calculator/tarifflist', requestData, true)
        break
      default:
        return NextResponse.json(
          { message: 'Unknown action' },
          {
            status: 400,
            headers: {
              'X-Service-Version': SERVICE_VERSION,
            },
          }
        )
    }

    // Копируем X- заголовки из ответа CDEK
    const responseHeaders: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Service-Version': SERVICE_VERSION,
    }

    result.headers.forEach((value, key) => {
      if (key.toLowerCase().startsWith('x-')) {
        responseHeaders[key] = value
      }
    })

    return new NextResponse(result.result, {
      status: 200,
      headers: responseHeaders,
    })
  } catch (error) {
    console.error('CDEK service error:', error)
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      {
        status: 500,
        headers: {
          'X-Service-Version': SERVICE_VERSION,
        },
      }
    )
  }
}

