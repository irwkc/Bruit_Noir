import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { sendNewOrderNotification } from '@/lib/email'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 })
    }

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
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID not found in session' }, { status: 401 })
    }
    
    const body = await request.json()

    const {
      items,
      deliveryMethod,
      deliveryPointId,
      address,
      postalCode,
      customerName,
      customerEmail,
      customerPhone,
      paymentMethod,
    } = body

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Корзина пуста' }, { status: 400 })
    }

    const productIds = items.map((item: any) => item.productId)
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        price: true,
        stock: true,
        available: true,
      },
    })

    const productMap = new Map(products.map((product) => [product.id, product]))

    const invalidItems = [] as string[]
    const insufficientItems = [] as string[]

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product || !product.available) {
        invalidItems.push(item.productId)
        continue
      }

      if (product.stock <= 0 || item.quantity > product.stock) {
        insufficientItems.push(item.productId)
      }
    }

    const uniqueInvalidItems = Array.from(new Set(invalidItems))
    const uniqueInsufficientItems = Array.from(new Set(insufficientItems))

    if (uniqueInvalidItems.length > 0 || uniqueInsufficientItems.length > 0) {
      return NextResponse.json(
        {
          error: 'Некоторые товары недоступны для заказа',
          invalidItems: uniqueInvalidItems,
          insufficientItems: uniqueInsufficientItems,
        },
        { status: 409 }
      )
    }

    // Calculate total from database prices
    const total = items.reduce((sum: number, item: any) => {
      const product = productMap.get(item.productId)
      if (!product) {
        return sum
      }
      return sum + Number(product.price) * Number(item.quantity)
    }, 0)

    // Create order with items
    const order = await prisma.order.create({
      data: {
        userId,
        total,
        deliveryMethod,
        deliveryPointId,
        address,
        postalCode,
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
            price: Number(productMap.get(item.productId)?.price ?? item.price ?? 0),
            size: item.size,
            color: item.color,
          })),
        },
      },
      include: {
        orderItems: {
          include: { product: true },
        },
        deliveryPoint: true,
      },
    })

    // Fire-and-forget notifications
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
        total,
        customerName,
        customerEmail,
        customerPhone,
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
      ).catch((error) => {
        console.error('Failed to send admin notifications:', error)
      })
    }

    return NextResponse.json(order, { status: 201 })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

