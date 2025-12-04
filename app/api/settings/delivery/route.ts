import { NextResponse } from 'next/server'
import { getDeliveryPrice } from '@/lib/siteSettings'

export async function GET() {
  const deliveryPrice = await getDeliveryPrice()
  return NextResponse.json({ deliveryPrice })
}


