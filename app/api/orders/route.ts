import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    console.log('Orders API - Session:', session)
    console.log('Orders API - Session user:', session?.user)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('Orders API - User ID:', userId)
    console.log('Orders API - Full session user:', session.user)

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
        deliveryPoint: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(orders)
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    console.log('Orders POST API - Session:', session)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    console.log('Orders POST API - User ID:', userId)
    console.log('Orders POST API - Full session user:', session.user)
    const body = await request.json()

    const { items, deliveryPointId, customerName, customerEmail, customerPhone, paymentMethod } = body

    // Calculate total
    const total = items.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0)

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        deliveryPointId,
        customerName,
        customerEmail,
        customerPhone,
        paymentMethod,
        status: 'pending',
        paymentStatus: 'pending',
        orderItems: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: {
        orderItems: true,
        deliveryPoint: true,
      },
    })

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

