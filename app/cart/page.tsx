'use client'

import { useCartStore } from '@/lib/store'
import Image from 'next/image'
import Link from 'next/link'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Корзина пуста
          </h2>
          <p className="text-gray-600 mb-8">
            Добавьте товары из каталога, чтобы продолжить
          </p>
          <Link
            href="/catalog"
            className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
          >
            Перейти в каталог
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="bg-white rounded-lg p-6 flex gap-6"
              >
                {/* Image */}
                <div className="relative w-24 h-32 rounded-md overflow-hidden flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>

                {/* Info */}
                <div className="flex-grow">
                  <h3 className="font-semibold text-lg text-gray-900 mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-600 mb-1">
                    Размер: <span className="font-medium">{item.size}</span>
                  </p>
                  <p className="text-sm text-gray-600 mb-4 capitalize">
                    Цвет: <span className="font-medium">{item.color}</span>
                  </p>

                  <div className="flex items-center justify-between">
                    {/* Quantity */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="w-8 h-8 border border-gray-300 rounded hover:border-gray-400 transition"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold w-8 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            Math.min(10, item.quantity + 1)
                          )
                        }
                        className="w-8 h-8 border border-gray-300 rounded hover:border-gray-400 transition"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </p>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1 mt-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Итого
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                  <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Доставка:</span>
                  <span>Рассчитается при оформлении</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span>Итого:</span>
                    <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                  </div>
                </div>
              </div>

              <Link
                href="/checkout"
                className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-center"
              >
                Оформить заказ
              </Link>

              <Link
                href="/catalog"
                className="block w-full text-center text-gray-600 hover:text-gray-900 mt-4"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden pb-24">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
          <h1 className="text-2xl font-bold text-gray-900">Корзина</h1>
        </div>

        {/* Mobile Cart Items */}
        <div className="px-4 py-4 space-y-3">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="bg-white rounded-lg p-3 flex gap-3"
            >
              {/* Image */}
              <div className="relative w-20 h-24 rounded-md overflow-hidden flex-shrink-0">
                <Image
                  src={item.image || '/placeholder.jpg'}
                  alt={item.name}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Info */}
              <div className="flex-grow">
                <h3 className="font-semibold text-sm text-gray-900 mb-1 line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-gray-600">
                  {item.size} / <span className="capitalize">{item.color}</span>
                </p>

                <div className="flex items-center justify-between mt-2">
                  {/* Quantity */}
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          Math.max(1, item.quantity - 1)
                        )
                      }
                      className="w-7 h-7 border border-gray-300 rounded text-sm"
                    >
                      -
                    </button>
                    <span className="text-sm font-semibold w-6 text-center">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.productId,
                          item.size,
                          item.color,
                          Math.min(10, item.quantity + 1)
                        )
                      }
                      className="w-7 h-7 border border-gray-300 rounded text-sm"
                    >
                      +
                    </button>
                  </div>

                  {/* Price & Remove */}
                  <div className="text-right">
                    <p className="text-base font-bold text-gray-900">
                      {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                    </p>
                    <button
                      onClick={() =>
                        removeItem(item.productId, item.size, item.color)
                      }
                      className="text-red-600 text-xs flex items-center gap-1 mt-1"
                    >
                      <TrashIcon className="h-3 w-3" />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Mobile Fixed Bottom Summary */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-sm text-gray-600">
              Товары ({items.reduce((sum, item) => sum + item.quantity, 0)}):
            </span>
            <span className="text-lg font-bold text-gray-900">
              {getTotalPrice().toLocaleString('ru-RU')} ₽
            </span>
          </div>

          <Link
            href="/checkout"
            className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-center"
          >
            Оформить заказ
          </Link>

          <Link
            href="/catalog"
            className="block w-full text-center text-gray-600 hover:text-gray-900 mt-2 text-sm"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  )
}

