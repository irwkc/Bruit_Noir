'use client'

export const dynamic = 'force-dynamic'

import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Order {
  id: string
  total: number
  status: string
  createdAt: string
  orderItems: any[]
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/profile')
      return
    }
    
    if (session) {
      fetchOrders()
    }
  }, [session, status, router])

  async function fetchOrders() {
    try {
      const res = await fetch('/api/orders')
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  // Показываем загрузку пока проверяем сессию
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  // Если не авторизован, редирект уже произошел, показываем загрузку
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    )
  }

  const statusLabels: { [key: string]: string } = {
    pending: 'Ожидает обработки',
    processing: 'В обработке',
    shipped: 'Отправлен',
    delivered: 'Доставлен',
    cancelled: 'Отменен',
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Профиль</h1>
          <p className="text-gray-600">{session.user?.email}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 space-y-2">
              <Link
                href="/profile"
                className="block px-4 py-2 rounded-md bg-gray-100 font-medium"
              >
                Мои заказы
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="block w-full text-left px-4 py-2 rounded-md hover:bg-gray-100 text-red-600"
              >
                Выйти
              </button>
            </div>
          </div>

          {/* Orders */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-6">Мои заказы</h2>

              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : orders.length > 0 ? (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold">
                            Заказ #{order.id.slice(0, 8)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                          </p>
                        </div>
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 text-sm font-medium rounded-full">
                          {statusLabels[order.status] || order.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        Товаров: {order.orderItems?.length || 0}
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-lg font-bold">
                          {order.total.toLocaleString('ru-RU')} ₽
                        </p>
                        <Link
                          href={`/orders/${order.id}`}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Подробнее
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-600 mb-4">У вас пока нет заказов</p>
                  <Link
                    href="/catalog"
                    className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
                  >
                    Перейти в каталог
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Профиль</h1>
          <p className="text-sm text-gray-600 mt-1">{session.user?.email}</p>
        </div>

        {/* Mobile Menu */}
        <div className="bg-white border-b border-gray-200 px-4 py-3">
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="w-full text-center py-2 text-red-600 font-medium"
          >
            Выйти
          </button>
        </div>

        {/* Mobile Orders */}
        <div className="px-4 py-4">
          <h2 className="text-xl font-bold mb-4">Мои заказы</h2>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
            </div>
          ) : orders.length > 0 ? (
            <div className="space-y-3">
              {orders.map((order) => (
                <div key={order.id} className="bg-white border border-gray-200 rounded-lg p-3">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-sm">
                        Заказ #{order.id.slice(0, 8)}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded-full">
                      {statusLabels[order.status] || order.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    Товаров: {order.orderItems?.length || 0}
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-base font-bold">
                      {order.total.toLocaleString('ru-RU')} ₽
                    </p>
                    <Link
                      href={`/orders/${order.id}`}
                      className="text-blue-600 hover:underline text-xs"
                    >
                      Подробнее
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4 text-sm">У вас пока нет заказов</p>
              <Link
                href="/catalog"
                className="inline-block bg-black text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
              >
                Перейти в каталог
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

