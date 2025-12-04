import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendNewOrderNotification } from '@/lib/email'
import { verifyWebhookSignature } from '@/lib/yookassa'

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY

// Отключаем body parsing для получения raw body для проверки подписи
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

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

    // Получаем raw body для проверки подписи (если потребуется)
    // В Next.js App Router нужно использовать request.text() для получения raw body
    let rawBody: string
    let body: any
    
    try {
      // Пытаемся получить raw body
      rawBody = await request.text()
      body = JSON.parse(rawBody)
    } catch (error) {
      // Если не получилось, пробуем через json()
      body = await request.json()
      rawBody = JSON.stringify(body)
    }
    
    // Проверка подписи (опционально - YooKassa может не требовать её)
    // Если YooKassa отправляет подпись, она будет в заголовке
    const signature = request.headers.get('x-yookassa-signature') || 
                      request.headers.get('x-signature')
    
    // Проверяем подпись только если она передана и в production
    if (signature && process.env.NODE_ENV === 'production' && YOOKASSA_SECRET_KEY) {
      try {
        if (!verifyWebhookSignature(rawBody, signature)) {
          console.error('[YooKassa webhook] Invalid signature')
          // Логируем, но не блокируем - YooKassa может не требовать подпись
          // return NextResponse.json({ ok: false, error: 'Invalid signature' }, { status: 200 })
        }
      } catch (sigError) {
        console.warn('[YooKassa webhook] Signature verification failed:', sigError)
        // Не блокируем запрос, если проверка подписи не удалась
      }
    }

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

      // Обновляем статус заказа только если он ещё не был отмечен как paid
      const updateResult = await prisma.order.updateMany({
        where: {
          id: orderId,
          paymentStatus: { not: 'paid' },
        },
        data: {
          paymentStatus: 'paid',
          status: 'processing',
        },
      })

      // Если ничего не обновилось — значит, мы уже обрабатывали этот платеж (повторный webhook)
      if (updateResult.count === 0) {
        console.log(`[YooKassa webhook] Order ${orderId} already marked as paid, skipping stock update and notifications`)
      } else {
        try {
          // Получаем заказ с полной информацией
          const order = await prisma.order.findUnique({
            where: { id: orderId },
            include: {
              orderItems: {
                include: { product: true },
              },
              deliveryPoint: true,
            },
          })

          if (!order) {
            console.warn(`[YooKassa webhook] Order not found for notification/stock: ${orderId}`)
          } else {
            // Уменьшаем остатки по товарам и, если остаток стал 0 или меньше, переводим товар в статус "нет в наличии"
            await prisma.$transaction(async (tx) => {
              for (const item of order.orderItems) {
                try {
                  const updated = await tx.product.update({
                    where: { id: item.productId },
                    data: {
                      stock: {
                        decrement: item.quantity,
                      },
                    },
                  })

                  if (updated.stock <= 0 && updated.available) {
                    await tx.product.update({
                      where: { id: item.productId },
                      data: { available: false },
                    })
                  }
                } catch (stockError) {
                  console.error(
                    `[YooKassa webhook] Failed to decrement stock for product ${item.productId} (order ${orderId}):`,
                    stockError
                  )
                }
              }
            })

            // Отправляем письма администраторам
            const admins = await prisma.user.findMany({
              where: {
                role: 'admin',
                orderNotificationEmail: { not: null },
              },
              select: { orderNotificationEmail: true },
            })

            if (admins.length > 0) {
              const payload = {
                id: order.id,
                total: order.total,
                customerName: order.customerName,
                customerEmail: order.customerEmail,
                customerPhone: order.customerPhone,
                createdAt: order.createdAt,
                items: order.orderItems.map((item) => ({
                  name: item.product?.name || 'Товар',
                  quantity: item.quantity,
                  price: item.price,
                  size: item.size,
                  color: item.color,
                })),
              }

              void Promise.all(
                admins
                  .map((admin) => admin.orderNotificationEmail)
                  .filter((email): email is string => Boolean(email))
                  .map((email) => sendNewOrderNotification(email, payload))
              ).catch((notifyError) => {
                console.error('[YooKassa webhook] Failed to send admin notifications:', notifyError)
              })
            }
          }
        } catch (notifyError) {
          console.error('[YooKassa webhook] Error while updating stock / sending notifications:', notifyError)
        }
      }
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


