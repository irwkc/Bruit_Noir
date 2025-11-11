import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdminRequest } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    await authenticateAdminRequest(request)
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const status = searchParams.get('status')?.toLowerCase()
  const limit = Math.min(Number(searchParams.get('limit') || '50'), 100)
  const cursor = searchParams.get('cursor')

  const orders = await prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      orderItems: {
        include: { product: true },
      },
      deliveryPoint: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  })

  const nextCursor = orders.length === limit ? orders[orders.length - 1]?.id : null

  return NextResponse.json({ data: orders, nextCursor })
}
