import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const city = searchParams.get('city')

    let where = {}
    if (city) {
      where = { city }
    }

    const deliveryPoints = await prisma.deliveryPoint.findMany({
      where,
      orderBy: { city: 'asc' },
    })

    return NextResponse.json(deliveryPoints)
  } catch (error) {
    console.error('Error fetching delivery points:', error)
    return NextResponse.json({ error: 'Failed to fetch delivery points' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const deliveryPoint = await prisma.deliveryPoint.create({
      data: body,
    })
    return NextResponse.json(deliveryPoint, { status: 201 })
  } catch (error) {
    console.error('Error creating delivery point:', error)
    return NextResponse.json({ error: 'Failed to create delivery point' }, { status: 500 })
  }
}

