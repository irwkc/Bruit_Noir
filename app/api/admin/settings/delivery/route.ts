import { NextRequest, NextResponse } from 'next/server'
import { authenticateAdminRequest } from '@/lib/adminAuth'
import { getDeliveryPrice, updateDeliveryPrice } from '@/lib/siteSettings'

export async function GET(request: NextRequest) {
  try {
    await authenticateAdminRequest(request)
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const deliveryPrice = await getDeliveryPrice()
  return NextResponse.json({ deliveryPrice })
}

export async function POST(request: NextRequest) {
  try {
    await authenticateAdminRequest(request)
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const body = (await request.json().catch(() => ({}))) as { deliveryPrice?: number | string }
  const raw = typeof body.deliveryPrice === 'string' ? Number(body.deliveryPrice) : body.deliveryPrice

  if (raw == null || Number.isNaN(raw)) {
    return NextResponse.json({ message: 'Некорректная стоимость доставки' }, { status: 400 })
  }

  if (raw < 0 || raw > 100_000) {
    return NextResponse.json({ message: 'Стоимость доставки должна быть от 0 до 100000 ₽' }, { status: 400 })
  }

  const settings = await updateDeliveryPrice(raw)
  return NextResponse.json({ deliveryPrice: settings.deliveryPrice })
}


