'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCartStore } from '@/lib/store'
import { useSession } from 'next-auth/react'
import CityAutocomplete from '@/components/CityAutocomplete'
import SdekWidget from '@/components/SdekWidget'

// Force dynamic rendering to avoid SSR issues with CDEK widget
export const dynamic = 'force-dynamic'
export const dynamicParams = true

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

  const [selectedDeliveryPoint, setSelectedDeliveryPoint] = useState<DeliveryPoint | null>(null)
  const [selectedCity, setSelectedCity] = useState('Москва')
  const [deliveryMethod] = useState('sdek') // Только СДЭК
  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)

  const [customerLastName, setCustomerLastName] = useState('')
  const [customerFirstName, setCustomerFirstName] = useState('')
  const [customerMiddleName, setCustomerMiddleName] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [customerPhone, setCustomerPhone] = useState('+7 ')
  const [showAuthModal, setShowAuthModal] = useState(false)

  useEffect(() => {
    if (session?.user) {
      // Если в имени есть пробелы, разбиваем на ФИО
      const nameParts = (session.user.name || '').split(' ')
      if (nameParts.length >= 2) {
        setCustomerLastName(nameParts[0] || '')
        setCustomerFirstName(nameParts[1] || '')
        setCustomerMiddleName(nameParts[2] || '')
      } else if (nameParts.length === 1) {
        setCustomerFirstName(nameParts[0] || '')
      }
      setCustomerEmail(session.user.email || '')
    }
  }, [session])

  // Форматирование номера телефона
  const formatPhoneNumber = (value: string): string => {
    // Удаляем все нецифровые символы, кроме +
    let digits = value.replace(/[^\d+]/g, '')
    
    // Если нет +7 в начале, добавляем
    if (!digits.startsWith('+7')) {
      if (digits.startsWith('7')) {
        digits = '+7' + digits.slice(1)
      } else if (digits.startsWith('8')) {
        digits = '+7' + digits.slice(1)
      } else {
        digits = '+7' + digits.replace(/^\+/, '')
      }
    }
    
    // Ограничиваем длину (максимум 12 символов: +7 и 10 цифр)
    if (digits.length > 12) {
      digits = digits.slice(0, 12)
    }
    
    // Форматируем: +7 (999) 123-45-67
    if (digits.length <= 2) {
      return digits
    }
    
    const code = digits.slice(2, 5) // 999
    const part1 = digits.slice(5, 8) // 123
    const part2 = digits.slice(8, 10) // 45
    const part3 = digits.slice(10, 12) // 67
    
    let formatted = '+7'
    
    if (code) {
      formatted += ` (${code}`
      if (part1 || part2 || part3) {
        formatted += ')'
      }
    }
    
    if (part1) {
      formatted += ` ${part1}`
    }
    
    if (part2) {
      formatted += `-${part2}`
    }
    
    if (part3) {
      formatted += `-${part3}`
    }
    
    return formatted
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value)
    setCustomerPhone(formatted)
  }

  // Clear selected point when city changes
  useEffect(() => {
    setSelectedDeliveryPoint(null)
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
      // Объединяем ФИО в полное имя
      const fullName = [customerLastName, customerFirstName, customerMiddleName]
        .filter(Boolean)
        .join(' ')
        .trim()

      const orderData = {
        items,
        deliveryMethod: 'sdek',
        deliveryPoint: selectedDeliveryPoint, // Отправляем полную информацию о пункте выдачи
        customerName: fullName,
        customerEmail,
        customerPhone,
        paymentMethod,
      }
      
      console.log('Sending order data:', orderData)
      
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      })

      if (res.ok) {
        const order = await res.json()
        clearCart()
        router.push(`/orders/${order.id}`)
      } else {
        const error = await res.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Order creation error:', error)
        
        // Если ошибка авторизации, показываем модальное окно
        if (res.status === 401 || error.error === 'Unauthorized') {
          setShowAuthModal(true)
        } else {
          const errorMessage = error.details 
            ? `${error.error || 'Ошибка при оформлении заказа'}: ${error.details}`
            : error.error || 'Ошибка при оформлении заказа'
          alert(errorMessage)
        }
      }
    } catch (error) {
      console.error('Error creating order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Ошибка при оформлении заказа'
      alert(`Ошибка при оформлении заказа: ${errorMessage}`)
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
      {/* SDEK Widget использует API напрямую, скрипты не нужны */}
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
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Фамилия *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerLastName}
                        onChange={(e) => setCustomerLastName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Имя *
                      </label>
                      <input
                        type="text"
                        required
                        value={customerFirstName}
                        onChange={(e) => setCustomerFirstName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Отчество
                      </label>
                      <input
                        type="text"
                        value={customerMiddleName}
                        onChange={(e) => setCustomerMiddleName(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      />
                    </div>
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
                      onChange={handlePhoneChange}
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
                      
                      {/* SDEK Widget - используем простой виджет без официального CDEK виджета */}
                      <div className="w-full">
                        <SdekWidget
                          city={selectedCity}
                          onPointSelect={(point) => {
                            setSelectedDeliveryPoint(point)
                            console.log('Selected SDEK point:', point)
                          }}
                        />
                      </div>
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
                  Фамилия *
                </label>
                <input
                  type="text"
                  required
                  value={customerLastName}
                  onChange={(e) => setCustomerLastName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Имя *
                </label>
                <input
                  type="text"
                  required
                  value={customerFirstName}
                  onChange={(e) => setCustomerFirstName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Отчество
                </label>
                <input
                  type="text"
                  value={customerMiddleName}
                  onChange={(e) => setCustomerMiddleName(e.target.value)}
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
                  onChange={handlePhoneChange}
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
                  
                  {/* SDEK Widget - используем простой виджет без официального CDEK виджета */}
                  <div className="w-full">
                    <SdekWidget
                      city={selectedCity}
                      onPointSelect={(point) => {
                        setSelectedDeliveryPoint(point)
                        console.log('Selected SDEK point:', point)
                      }}
                    />
                  </div>
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

      {/* Модальное окно для авторизации */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-gray-100 mb-4">
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Требуется авторизация
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Для оформления заказа необходимо войти в личный кабинет
              </p>
              <div className="flex gap-3 mb-4">
                <button
                  onClick={() => setShowAuthModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  Отмена
                </button>
                <button
                  onClick={() => {
                    setShowAuthModal(false)
                    router.push('/auth/signin?callbackUrl=/checkout')
                  }}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition"
                >
                  Войти
                </button>
              </div>
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-600 mb-3 text-center">
                  Если еще нет аккаунта
                </p>
                <button
                  onClick={() => {
                    // Сохраняем данные формы в localStorage для передачи на страницу регистрации
                    // Используем только имя (customerFirstName), а не полное ФИО
                    if (customerFirstName || customerEmail) {
                      localStorage.setItem('checkoutFormData', JSON.stringify({
                        name: customerFirstName || '',
                        email: customerEmail || '',
                      }))
                    }
                    
                    setShowAuthModal(false)
                    router.push('/auth/signup?callbackUrl=/checkout')
                  }}
                  className="w-full px-4 py-2 border-2 border-black text-black rounded-lg font-medium hover:bg-gray-50 transition"
                >
                  Зарегистрироваться
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

