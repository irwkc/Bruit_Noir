import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const YOOKASSA_SHOP_ID = process.env.YOOKASSA_SHOP_ID
const YOOKASSA_SECRET_KEY = process.env.YOOKASSA_SECRET_KEY

export async function POST(request: NextRequest) {
  try {
    if (!YOOKASSA_SHOP_ID || !YOOKASSA_SECRET_KEY) {
      return NextResponse.json({ message: 'YooKassa not configured' }, { status: 500 })
    }

    // (опционально) базовая проверка авторизации вебхука
    const authHeader = request.headers.get('authorization')
    const expected = Buffer.from(`${YOOKASSA_SHOP_ID}:${YOOKASSA_SECRET_KEY}`).toString('base64')
    if (authHeader && authHeader !== `Basic ${expected}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()

    const event = body?.event as string | undefined
    const payment = body?.object

    if (!event || !payment) {
      return NextResponse.json({ message: 'Bad payload' }, { status: 400 })
    }

    if (event === 'payment.succeeded') {
      const orderId = payment.metadata?.orderId as string | undefined
      if (orderId) {
        await prisma.order.updateMany({
          where: { id: orderId },
          data: {
            paymentStatus: 'paid',
            status: 'processing',
          },
        })
      }
    }

    // На будущее можно обрабатывать и другие события (payment.canceled и т.п.)

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('YooKassa webhook error:', error)
    return NextResponse.json({ message: 'Internal error' }, { status: 500 })
  }
}


