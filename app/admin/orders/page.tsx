'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

interface OrderItem {
  id: string
  quantity: number
  price: number
  size: string
  color: string
  product: {
    id: string
    name: string
    images: string[]
  }
}

interface Order {
  id: string
  total: number
  status: string
  paymentStatus: string
  paymentMethod: string | null
  customerName: string
  customerEmail: string
  customerPhone: string
  deliveryMethod: string
  address: string | null
  postalCode: string | null
  createdAt: string
  orderItems: OrderItem[]
  deliveryPoint: {
    name: string
    address: string
  } | null
}

const statusLabels: Record<string, string> = {
  pending: 'Ожидает обработки',
  processing: 'В обработке',
  shipped: 'Отправлен',
  delivered: 'Доставлен',
  cancelled: 'Отменен',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  useEffect(() => {
    fetchOrders()
  }, [selectedStatus])

  async function fetchOrders() {
    try {
      const url = selectedStatus
        ? `/api/admin/orders?status=${selectedStatus}`
        : '/api/admin/orders'
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setOrders(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  async function updateOrderStatus(orderId: string, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        fetchOrders()
      } else {
        alert('Ошибка при обновлении статуса заказа')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      alert('Ошибка при обновлении статуса заказа')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">Загрузка...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/admin/dashboard" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Назад в админку
          </Link>
          <div className="flex justify-between items-center">
            <h1 className="text-4xl font-bold text-gray-900">Заказы (только оплаченные)</h1>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-900"
            >
              <option value="">Все статусы</option>
              <option value="pending">Ожидает обработки</option>
              <option value="processing">В обработке</option>
              <option value="shipped">Отправлен</option>
              <option value="delivered">Доставлен</option>
              <option value="cancelled">Отменен</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600">Оплаченные заказы не найдены</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Заказ #{order.id.slice(0, 8)}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleString('ru-RU')}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-semibold rounded-full">
                      Оплачен
                    </span>
                    <select
                      value={order.status}
                      onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 rounded-lg bg-white text-gray-900 text-sm"
                    >
                      <option value="pending">Ожидает обработки</option>
                      <option value="processing">В обработке</option>
                      <option value="shipped">Отправлен</option>
                      <option value="delivered">Доставлен</option>
                      <option value="cancelled">Отменен</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Клиент</h4>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                    <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Доставка</h4>
                    <p className="text-sm text-gray-600">
                      {order.deliveryMethod === 'sdek' && order.deliveryPoint
                        ? `СДЭК: ${order.deliveryPoint.name}`
                        : order.deliveryMethod === 'post'
                        ? `Почта России: ${order.address || 'Адрес не указан'}`
                        : order.deliveryMethod === 'post-regular'
                        ? `Почта России (обычная): ${order.address || 'Адрес не указан'}`
                        : 'Не указано'}
                    </p>
                    {order.postalCode && (
                      <p className="text-sm text-gray-600">Индекс: {order.postalCode}</p>
                    )}
                  </div>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Товары</h4>
                  <div className="space-y-2">
                    {order.orderItems.map((item) => (
                      <div key={item.id} className="flex items-center gap-4 p-2 bg-gray-50 rounded">
                        {item.product.images && item.product.images.length > 0 ? (
                          <img
                            className="h-12 w-12 rounded object-cover"
                            src={item.product.images[0]}
                            alt={item.product.name}
                          />
                        ) : (
                          <div className="h-12 w-12 bg-gray-200 rounded flex items-center justify-center">
                            <span className="text-gray-400 text-xs">Нет фото</span>
                          </div>
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                          <p className="text-xs text-gray-500">
                            Размер: {item.size}, Цвет: {item.color}, Количество: {item.quantity}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          {item.price.toLocaleString()} ₽
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-sm text-gray-600">
                    Статус: <span className="font-semibold">{statusLabels[order.status] || order.status}</span>
                  </span>
                  <span className="text-lg font-bold text-gray-900">
                    Итого: {order.total.toLocaleString()} ₽
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

