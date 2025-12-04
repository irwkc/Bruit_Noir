import { NextResponse } from 'next/server'
import { getDeliveryPrice } from '@/lib/siteSettings'

export async function GET() {
  const deliveryPrice = await getDeliveryPrice()
  return NextResponse.json(
    { deliveryPrice },
    {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600',
      },
    }
  )
}


