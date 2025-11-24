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
    <div className="min-h-screen px-4 py-6 space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-white">Корзина</h1>
        <p className="text-sm text-gray-300">
          {totalItems > 0 ? `${totalItems} товар${totalItems > 1 ? 'а' : ''}` : 'Нет товаров'}
        </p>
      </div>

      {totalItems === 0 ? (
        <div className="flex flex-col items-center justify-center text-center space-y-4 bg-white/5 backdrop-blur-2xl border border-white/10 rounded-3xl py-12 px-6">
          <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
            <svg className="w-10 h-10 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-white">Корзина пуста</h2>
          <p className="text-gray-300">Добавьте товары, чтобы оформить заказ</p>
          <Link
            href="/catalog"
            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white hover:bg-white/20 transition"
          >
            Перейти в каталог
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {items.map((item, index) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}-${index}`}
                className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-4 shadow-lg"
              >
                <div className="flex space-x-4">
                  <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                    {item.image ? (
                      <Image src={item.image} alt={item.name} fill className="object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/60">
                        Нет фото
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-3">
                    <div>
                      <h3 className="font-semibold text-white text-base">{item.name}</h3>
                      <p className="text-lg font-bold text-white mt-1">{item.price.toLocaleString()} ₽</p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center rounded-full border border-white/20 bg-white/10">
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity - 1)}
                          className="px-3 py-2 text-white hover:bg-white/10 transition"
                          disabled={isUpdating}
                        >
                          −
                        </button>
                        <span className="w-12 text-center text-sm font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item, item.quantity + 1)}
                          className="px-3 py-2 text-white hover:bg-white/10 transition"
                          disabled={isUpdating}
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeItem(item.productId, item.size, item.color)}
                        className="text-sm text-red-300 hover:text-red-200 transition"
                      >
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-4 pt-4">
            <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl p-5 shadow-2xl">
              <div className="flex justify-between text-sm text-gray-300 mb-2">
                <span>Количество</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold text-white">
                <span>Итого</span>
                <span>{totalPrice.toLocaleString()} ₽</span>
              </div>
            </div>

            <button className="w-full rounded-full bg-white text-black py-4 text-base font-semibold shadow-lg hover:bg-gray-100 transition">
              Оформить заказ
            </button>

            <Link
              href="/catalog"
              className="block w-full text-center rounded-full border border-white/20 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
            >
              Продолжить покупки
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
