import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY

// IP-адреса, с которых ЮKassa может отправлять уведомления
const YOOKASSA_IPS = [
  '185.71.76.0/27',
  '185.71.77.0/27',
  '77.75.153.0/25',
  '77.75.156.11',
  '77.75.156.35',
  '77.75.154.128/25',
  '2a02:5180::/32',
]

// Проверка IP-адреса (упрощённая версия, для production лучше использовать библиотеку)
function isYooKassaIP(ip: string | null): boolean {
  if (!ip) return false
  // В production лучше использовать библиотеку для проверки CIDR
  // Для упрощения проверяем только основные диапазоны
  return ip.startsWith('185.71.76.') || 
         ip.startsWith('185.71.77.') || 
         ip.startsWith('77.75.153.') ||
         ip.startsWith('77.75.156.') ||
         ip.startsWith('77.75.154.') ||
         ip.startsWith('2a02:5180:')
}

// GET запрос для проверки URL webhook ЮKassa
export async function GET(request: NextRequest) {
  return NextResponse.json({ 
    message: 'YooKassa webhook endpoint is active',
    shopId: YOOKASSA_SHOP_ID ? 'configured' : 'not configured'
  })
}

export async function POST(request: NextRequest) {
  // ВАЖНО: ЮKassa требует всегда возвращать HTTP 200, даже при ошибках
  // Иначе уведомления будут повторяться в течение 24 часов
  
  try {
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      console.error('[YooKassa webhook] YooKassa not configured')
      return NextResponse.json({ ok: false, error: 'Not configured' }, { status: 200 })
    }

    // Проверка IP-адреса (опционально, но рекомендуется)
    const clientIP = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 
                     request.headers.get('x-real-ip') ||
                     'unknown'
    
    // В development режиме пропускаем проверку IP
    if (process.env.NODE_ENV === 'production' && !isYooKassaIP(clientIP)) {
      console.warn(`[YooKassa webhook] Suspicious IP: ${clientIP}`)
      // Не блокируем, но логируем для мониторинга
    }

    const body = await request.json()

    // Проверка формата уведомления согласно документации
    const type = body?.type as string | undefined
    const event = body?.event as string | undefined
    const payment = body?.object

    if (type !== 'notification') {
      console.error('[YooKassa webhook] Invalid notification type:', type)
      return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 200 })
    }

    if (!event || !payment) {
      console.error('[YooKassa webhook] Missing event or object:', { event, hasObject: !!payment })
      return NextResponse.json({ ok: false, error: 'Bad payload' }, { status: 200 })
    }

    const orderId = payment.metadata?.orderId as string | undefined

    if (!orderId) {
      console.warn('[YooKassa webhook] No orderId in metadata:', payment.metadata)
      return NextResponse.json({ ok: true, message: 'No orderId' }, { status: 200 })
    }

    // Обработка событий
    if (event === 'payment.succeeded') {
      console.log(`[YooKassa webhook] Payment succeeded for order ${orderId}`)
      await prisma.order.updateMany({
        where: { id: orderId },
        data: {
          paymentStatus: 'paid',
          status: 'processing',
        },
      })
    } else if (event === 'payment.waiting_for_capture') {
      console.log(`[YooKassa webhook] Payment waiting for capture for order ${orderId}`)
      await prisma.order.updateMany({
        where: { id: orderId },
        data: {
          paymentStatus: 'waiting_for_capture',
          status: 'pending',
        },
      })
    } else if (event === 'payment.canceled') {
      console.log(`[YooKassa webhook] Payment canceled for order ${orderId}`)
      await prisma.order.updateMany({
        where: { id: orderId },
        data: {
          paymentStatus: 'canceled',
          status: 'canceled',
        },
      })
    } else {
      console.log(`[YooKassa webhook] Unhandled event: ${event} for order ${orderId}`)
    }

    // Всегда возвращаем 200, даже если событие не обработано
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    // ВАЖНО: даже при ошибке возвращаем 200, чтобы ЮKassa не повторяла запрос
    console.error('[YooKassa webhook] Error processing webhook:', error)
    return NextResponse.json({ ok: false, error: 'Internal error' }, { status: 200 })
  }
}


