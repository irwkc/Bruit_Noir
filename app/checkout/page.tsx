'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import dynamicImport from 'next/dynamic'
import CityAutocomplete from '@/components/CityAutocomplete'

// Dynamically import SDEK widget to avoid SSR issues
const SdekWidget = dynamicImport(() => import('@/components/SdekWidget'), { ssr: false })

export const dynamic = 'force-dynamic'

interface DeliveryPoint {
  id: string
  name: string
  address: string
  city: string
  country: string
  workingHours?: string
  latitude?: number
  longitude?: number
  phone?: string
  email?: string
  type?: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const { items, getTotalPrice, clearCart } = useCartStore()

  const [deliveryPoints, setDeliveryPoints] = useState<DeliveryPoint[]>([])
  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState('')
  const [selectedCity, setSelectedCity] = useState('Москва')
  const [deliveryMethod, setDeliveryMethod] = useState('post')
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)
  
  // Address fields for postal delivery
  const [address, setAddress] = useState('')
  const [postalCode, setPostalCode] = useState('')

  const [customerName, setCustomerName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')

  useEffect(() => {
    if (session?.user) {
      setCustomerName(session.user.name || '')
      setCustomerEmail(session.user.email || '')
    }
  }, [session])

  // Remove deliveryPoints fetching for SDEK as widget handles it
  useEffect(() => {
    if (deliveryMethod === 'sdek') {
      // Clear selected point when switching to SDEK
      setSelectedDeliveryPoint('')
    }
  }, [deliveryMethod])

  // fetchDeliveryPoints function removed - SDEK widget handles this internally

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (deliveryMethod === 'sdek' && !selectedDeliveryPoint) {
      alert('Пожалуйста, выберите пункт выдачи СДЭК')
      return
    }
    
    if (deliveryMethod === 'post' && (!address || !postalCode)) {
      alert('Пожалуйста, заполните адрес доставки')
      return
    }
    
    if (items.length === 0) {
      alert('Корзина пуста')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          deliveryMethod,
          deliveryPointId: deliveryMethod === 'sdek' ? selectedDeliveryPoint : null,
          address: deliveryMethod === 'post' ? address : null,
          postalCode: deliveryMethod === 'post' ? postalCode : null,
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
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
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
                <h2 className="text-xl font-bold mb-4">Способ доставки</h2>

                {/* Delivery Method Selection */}
                <div className="space-y-3 mb-6">
                  <label className="block p-4 border-2 rounded-lg cursor-pointer transition">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="post"
                      checked={deliveryMethod === 'post'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <p className="font-semibold">Почтой России (Первым классом) от 1 дня, от 956 ₽</p>
                    </div>
                  </label>

                  <label className="block p-4 border-2 rounded-lg cursor-pointer transition">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="post-regular"
                      checked={deliveryMethod === 'post-regular'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <p className="font-semibold">Почтой России от 2 дней, от 575 ₽</p>
                    </div>
                  </label>

                  <label className="block p-4 border-2 rounded-lg cursor-pointer transition">
                    <input
                      type="radio"
                      name="deliveryMethod"
                      value="sdek"
                      checked={deliveryMethod === 'sdek'}
                      onChange={(e) => setDeliveryMethod(e.target.value)}
                      className="mr-3"
                    />
                    <div className="inline-block">
                      <p className="font-semibold">СДЭК Пункт выдачи от 1 дня, от 425 ₽</p>
                    </div>
                  </label>
                </div>

                {/* Postal Delivery Fields */}
                {(deliveryMethod === 'post' || deliveryMethod === 'post-regular') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Город
                      </label>
                      <input
                        type="text"
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        placeholder="Введите город"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Адрес *
                      </label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="Улица, дом, квартира"
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Почтовый индекс *
                      </label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="123456"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                  </div>
                )}

                {/* SDEK Delivery Points */}
                {deliveryMethod === 'sdek' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Город
                      </label>
                      <CityAutocomplete
                        value={selectedCity}
                        onChange={setSelectedCity}
                        placeholder="Введите город для поиска пунктов выдачи"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Доставка СДЭК доступна во все города России
                      </p>
                    </div>

                    {selectedCity && selectedCity.length >= 3 ? (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-700 mb-2">Выберите пункт выдачи:</h3>
                        
                        {/* SDEK Widget */}
                        <div className="w-full">
                          <SdekWidget
                            city={selectedCity}
                            onPointSelect={(point) => {
                              setSelectedDeliveryPoint(point.id)
                              console.log('Selected SDEK point:', point)
                            }}
                          />
                        </div>
                        
                        {selectedDeliveryPoint && (
                          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-sm text-green-800 font-semibold">
                              ✅ Пункт выдачи выбран
                            </p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-gray-600">
                        Введите город для поиска пунктов выдачи СДЭК
                      </p>
                    )}
                  </div>
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
                  disabled={loading || (deliveryMethod === 'sdek' && !selectedDeliveryPoint) || (deliveryMethod !== 'sdek' && (!address || !postalCode))}
                  className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  {loading ? 'Оформление...' : 'Подтвердить заказ'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">Оформление</h1>
        </div>

        <form onSubmit={handleSubmit} className="px-4 py-4 space-y-4">
          {/* Contact Information */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3">Контакты</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email *
                </label>
                <input
                  type="email"
                  required
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Телефон *
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="+7 (999) 123-45-67"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Delivery */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3">Способ доставки</h2>

            {/* Delivery Method Selection */}
            <div className="space-y-2 mb-4">
              <label className="block p-3 border-2 rounded-lg cursor-pointer transition">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="post"
                  checked={deliveryMethod === 'post'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="mr-2"
                />
                <div className="inline-block">
                  <p className="text-sm font-semibold">Почтой России (Первым классом) от 1 дня, от 956 ₽</p>
                </div>
              </label>

              <label className="block p-3 border-2 rounded-lg cursor-pointer transition">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="post-regular"
                  checked={deliveryMethod === 'post-regular'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="mr-2"
                />
                <div className="inline-block">
                  <p className="text-sm font-semibold">Почтой России от 2 дней, от 575 ₽</p>
                </div>
              </label>

              <label className="block p-3 border-2 rounded-lg cursor-pointer transition">
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="sdek"
                  checked={deliveryMethod === 'sdek'}
                  onChange={(e) => setDeliveryMethod(e.target.value)}
                  className="mr-2"
                />
                <div className="inline-block">
                  <p className="text-sm font-semibold">СДЭК Пункт выдачи от 1 дня, от 425 ₽</p>
                </div>
              </label>
            </div>

            {/* Postal Delivery Fields */}
            {(deliveryMethod === 'post' || deliveryMethod === 'post-regular') && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Город
                  </label>
                  <input
                    type="text"
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    placeholder="Введите город"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Адрес *
                  </label>
                  <textarea
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Улица, дом, квартира"
                    rows={3}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Почтовый индекс *
                  </label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    placeholder="123456"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                </div>
              </div>
            )}

            {/* SDEK Delivery Points */}
            {deliveryMethod === 'sdek' && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Город
                  </label>
                  <CityAutocomplete
                    value={selectedCity}
                    onChange={setSelectedCity}
                    placeholder="Введите город для поиска пунктов выдачи"
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Доставка СДЭК доступна во все города России
                  </p>
                </div>

                {selectedCity && selectedCity.length >= 3 ? (
                  <div className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Выберите пункт выдачи:</h3>
                    
                    {/* SDEK Widget */}
                    <div className="w-full">
                      <SdekWidget
                        city={selectedCity}
                        onPointSelect={(point) => {
                          setSelectedDeliveryPoint(point.id)
                          console.log('Selected SDEK point:', point)
                        }}
                      />
                    </div>
                    
                    {selectedDeliveryPoint && (
                      <div className="mt-2 p-2 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-xs text-green-800 font-semibold">
                          ✅ Пункт выдачи выбран
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-gray-600 text-sm">
                    Введите город для поиска пунктов выдачи СДЭК
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Payment */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3">Оплата</h2>
            <div className="space-y-2">
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === 'card'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <div>
                  <p className="font-semibold text-sm">Банковская карта</p>
                  <p className="text-xs text-gray-600">
                    Visa, Mastercard, МИР
                  </p>
                </div>
              </label>
              <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === 'cash'}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="mr-2"
                />
                <div>
                  <p className="font-semibold text-sm">Наличные</p>
                  <p className="text-xs text-gray-600">
                    Оплата при получении
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-3">Ваш заказ</h2>

            <div className="space-y-2 mb-4">
              {items.map((item) => (
                <div
                  key={`${item.productId}-${item.size}-${item.color}`}
                  className="flex justify-between text-xs"
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

            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Доставка:</span>
                <span>Бесплатно</span>
              </div>
              <div className="flex justify-between text-lg font-bold">
                <span>Итого:</span>
                <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
              </div>
            </div>
          </div>

          {/* Mobile Submit Button */}
          <div className="px-4 pb-6">
            <button
              type="submit"
              disabled={loading || (deliveryMethod === 'sdek' && !selectedDeliveryPoint) || (deliveryMethod !== 'sdek' && (!address || !postalCode))}
              onClick={handleSubmit}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Оформление...' : 'Подтвердить заказ'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

