'use client'

import { useCartStore, CartItem } from '@/lib/store'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'

export default function MobileCartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice, getTotalItems } = useCartStore()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleQuantityChange = async (item: CartItem, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(item.productId, item.size, item.color)
      return
    }
    
    setIsUpdating(true)
    updateQuantity(item.productId, item.size, item.color, newQuantity)
    // Small delay for better UX
    setTimeout(() => setIsUpdating(false), 300)
  }

  const totalItems = getTotalItems()
  const totalPrice = getTotalPrice()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold">Корзина</h1>
          <div className="w-6" />
        </div>
      </div>

      {totalItems === 0 ? (
        /* Empty Cart */
        <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Корзина пуста</h2>
            <p className="text-gray-600 mb-6">Добавьте товары, чтобы оформить заказ</p>
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      ) : (
        /* Cart with Items */
        <div className="pb-20">
          {/* Cart Items */}
          <div className="bg-white">
            {items.map((item, index) => (
              <div key={`${item.productId}-${item.size}-${item.color}-${index}`} className="border-b border-gray-200 p-4">
                <div className="flex space-x-3">
                  {/* Product Image */}
                  <div className="relative w-20 h-20 bg-gray-100 rounded-lg flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-400 text-xs">Нет фото</span>
                      </div>
                    )}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1">
                      {item.name}
                    </h3>
                    <p className="text-lg font-bold text-gray-900 mb-2">
                      {item.price.toLocaleString()} ₽
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center border border-gray-300 rounded-lg">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="p-2 hover:bg-gray-50 transition"
                          disabled={isUpdating}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                          </svg>
                        </button>
                        <span className="px-3 py-2 text-sm font-medium min-w-[3rem] text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="p-2 hover:bg-gray-50 transition"
                          disabled={isUpdating}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-white border-t border-gray-200 p-4 sticky bottom-0">
            <div className="space-y-3">
              <div className="flex justify-between text-lg font-semibold">
                <span>Итого ({totalItems} товар{totalItems > 1 ? 'а' : ''}):</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
              
              <button className="w-full bg-black text-white py-4 rounded-lg font-semibold text-lg hover:bg-gray-800 transition">
                Оформить заказ
              </button>
              
              <Link
                href="/catalog"
                className="block w-full text-center py-3 text-gray-600 hover:text-gray-800 transition"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
