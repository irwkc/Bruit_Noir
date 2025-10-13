'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useSession } from 'next-auth/react'

interface DeliveryPoint {
  id: string
  name: string
  address: string
  city: string
  country: string
  workingHours?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([])
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState('')
  const [selectedCity, setSelectedCity] = useState('Москва')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || '')
      setCustomerEmail(session.user.email || '')
    }
  }, [session])

  useEffect(() => {
    fetchDeliveryPoints()
  }, [selectedCity])

  async function fetchDeliveryPoints() {
    try {
      const res = await fetch(`/api/delivery-points?city=${selectedCity}`)
      const data = await res.json()
      setDeliveryPoints(data)
      if (data.length > 0) {
        setSelectedDeliveryPoint(data[0].id)
      }
    } catch (error) {
      console.error('Error fetching delivery points:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDeliveryPoint || items.length === 0) {
      alert('Пожалуйста, выберите пункт доставки')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          deliveryPointId: selectedDeliveryPoint,
          customerName,
          customerEmail,
          customerPhone,
          paymentMethod,
        }),
      })

      if (res.ok) {
        const order = await res.json()
        clearCart()
        router.push(`/orders/${order.id}`)
      } else {
        const error = await res.json()
        alert(error.error || 'Ошибка при оформлении заказа')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Ошибка при оформлении заказа')
    } finally {
      setLoading(false)
    }
  }

  if (items.length === 0) {
    router.push('/cart')
    return null
  }

  const cities = ['Москва', 'Санкт-Петербург', 'Казань', 'Екатеринбург', 'Новосибирск']

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Оформление заказа</h1>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Контактная информация</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Имя *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Телефон *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+7 (999) 123-45-67"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Delivery */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Пункт доставки</h2>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Город
                  </label>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  >
                    {cities.map((city) => (
                      <option key={city} value={city}>
                        {city}
                      </option>
                    ))}
                  </select>
                </div>

                {deliveryPoints.length > 0 ? (
                  <div className="space-y-2">
                    {deliveryPoints.map((point) => (
                      <label
                        key={point.id}
                        className={`block p-4 border-2 rounded-lg cursor-pointer transition ${
                          selectedDeliveryPoint === point.id
                            ? 'border-black bg-gray-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="radio"
                          name="deliveryPoint"
                          value={point.id}
                          checked={selectedDeliveryPoint === point.id}
                          onChange={(e) => setSelectedDeliveryPoint(e.target.value)}
                          className="mr-3"
                        />
                        <div className="inline-block">
                          <p className="font-semibold">{point.name}</p>
                          <p className="text-sm text-gray-600">{point.address}</p>
                          {point.workingHours && (
                            <p className="text-sm text-gray-500 mt-1">
                              Режим работы: {point.workingHours}
                            </p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600">
                    В выбранном городе пока нет пунктов выдачи
                  </p>
                )}
              </div>

              {/* Payment */}
              <div className="bg-white rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Способ оплаты</h2>
                <div className="space-y-2">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-gray-300 transition">
                    <input
                      type="radio"
                      name="payment"
                      value="card"
                      checked={paymentMethod === 'card'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">Банковская карта</p>
                      <p className="text-sm text-gray-600">
                        Visa, Mastercard, МИР
                      </p>
                    </div>
                  </label>
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:border-gray-300 transition">
                    <input
                      type="radio"
                      name="payment"
                      value="cash"
                      checked={paymentMethod === 'cash'}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-semibold">Наличные при получении</p>
                      <p className="text-sm text-gray-600">
                        Оплата в пункте выдачи
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg p-6 sticky top-24">
                <h2 className="text-xl font-bold mb-4">Ваш заказ</h2>

                <div className="space-y-3 mb-6">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.size}-${item.color}`}
                      className="flex justify-between text-sm"
                    >
                      <span className="text-gray-600">
                        {item.name} x{item.quantity}
                      </span>
                      <span className="font-medium">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Доставка:</span>
                    <span>Бесплатно</span>
                  </div>
                  <div className="flex justify-between text-xl font-bold">
                    <span>Итого:</span>
                    <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !selectedDeliveryPoint}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Оформление...' : 'Подтвердить заказ'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

