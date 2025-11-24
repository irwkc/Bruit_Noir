import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdminRequest } from '@/lib/adminAuth'
import { sendOrderShippedNotification } from '@/lib/email'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await authenticateAdminRequest(request)
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = params
    const body = await request.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 })
    }

    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    // Получаем заказ с полной информацией
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        orderItems: {
          include: { product: true },
        },
        deliveryPoint: true,
      },
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    // Обновляем статус заказа
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
      include: {
        orderItems: {
          include: { product: true },
        },
        deliveryPoint: true,
      },
    })

    // Если статус изменен на "shipped", отправляем уведомление клиенту
    if (status === 'shipped' && order.status !== 'shipped') {
      try {
        await sendOrderShippedNotification(order.customerEmail, {
          id: order.id,
          customerName: order.customerName,
          items: order.orderItems.map((item) => ({
            name: item.product?.name || 'Товар',
            quantity: item.quantity,
            price: item.price,
            size: item.size,
            color: item.color,
          })),
          total: order.total,
          deliveryPoint: order.deliveryPoint,
        })
      } catch (emailError) {
        console.error('Error sending shipped notification:', emailError)
        // Не прерываем выполнение, если email не отправился
      }
    }

    return NextResponse.json(updatedOrder)
  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Failed to update order status' },
      { status: 500 }
    )
  }
}

