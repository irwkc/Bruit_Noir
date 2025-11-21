'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import Script from 'next/script'
import CityAutocomplete from '@/components/CityAutocomplete'
import dynamicImport from 'next/dynamic'

// Dynamically import SDEK widget to avoid SSR issues
const CdekWidget = dynamicImport(() => import('@/components/CdekWidget'), { ssr: false })

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

  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState('')
  const [selectedCity, setSelectedCity] = useState('Москва')
  const [deliveryMethod] = useState('sdek') // Только СДЭК
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

  // Clear selected point when city changes
  useEffect(() => {
    setSelectedDeliveryPoint('')
  }, [selectedCity])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedDeliveryPoint) {
      alert('Пожалуйста, выберите пункт выдачи СДЭК')
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
          deliveryMethod: 'sdek',
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
    <>
      {/* Load CDEK scripts only on checkout page - afterInteractive for faster loading */}
      <Script
        src="https://api-maps.yandex.ru/2.1/?apikey=f366a46d-5c10-4875-a6ee-263f3678b026&lang=ru_RU"
        strategy="afterInteractive"
        onLoad={() => {
          // Помечаем, что Яндекс.Карты загружены
          if (typeof window !== 'undefined') {
            // Даём время на полную инициализацию Яндекс.Карт
            const callback = () => {
              (window as any).__ymaps_loaded = true
              (window as any).__ymaps_ready = true
              window.dispatchEvent(new Event('ymaps-ready'))
            }
            const delay = 1500
            setTimeout(callback, delay)
          }
        }}
        onError={(e) => {
          console.error('Failed to load Yandex Maps:', e)
        }}
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            (window as any).__cdek_widget_loaded = true
            window.dispatchEvent(new Event('cdek-widget-ready'))
          }
        }}
        onError={(e) => {
          console.error('Failed to load CDEK widget:', e)
        }}
      />
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
                
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="font-semibold text-gray-900">СДЭК Пункт выдачи</p>
                  <p className="text-sm text-gray-600 mt-1">Доставка от 1 дня, от 425 ₽</p>
                </div>

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
                      
                      {/* CDEK Widget */}
                      <div className="w-full">
                        <CdekWidget
                          city={selectedCity}
                          onPointSelect={(point) => {
                            const chosenId =
                              point?.code ||
                              point?.id ||
                              point?.uuid ||
                              point?.pvz_code ||
                              point?.number ||
                              ''
                            setSelectedDeliveryPoint(chosenId)
                            console.log('Selected CDEK point:', point)
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
            
            <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-sm font-semibold text-gray-900">СДЭК Пункт выдачи</p>
              <p className="text-xs text-gray-600 mt-1">Доставка от 1 дня, от 425 ₽</p>
            </div>

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
                  
                  {/* CDEK Widget */}
                  <div className="w-full">
                    <CdekWidget
                      city={selectedCity}
                      onPointSelect={(point) => {
                        const chosenId =
                          point?.code ||
                          point?.id ||
                          point?.uuid ||
                          point?.pvz_code ||
                          point?.number ||
                          ''
                        setSelectedDeliveryPoint(chosenId)
                        console.log('Selected CDEK point:', point)
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
              disabled={loading || !selectedDeliveryPoint}
              onClick={handleSubmit}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              {loading ? 'Оформление...' : 'Подтвердить заказ'}
            </button>
          </div>
        </form>
      </div>
      </div>
    </>
  )
}

