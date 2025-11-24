'use client'

import { useCartStore } from '@/lib/store'
import Image from 'next/image'
import Link from 'next/link'
import { TrashIcon } from '@heroicons/react/24/outline'

export default function CartPage() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore()

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Корзина пуста
          </h2>
          <p className="text-gray-300 mb-8">
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

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0)

  const getItemsLabel = (count: number) => {
    const mod10 = count % 10
    const mod100 = count % 100
    if (mod10 === 1 && mod100 !== 11) return 'товар'
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'товара'
    return 'товаров'
  }

  return (
    <div className="min-h-screen">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Корзина</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <div
                key={`${item.productId}-${item.size}-${item.color}`}
                className="bg-white/10 backdrop-blur-md rounded-lg p-6 flex gap-6 border border-white/20"
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
                  <h3 className="font-semibold text-lg text-white mb-2">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-300 mb-1">
                    Размер: <span className="font-medium">{item.size}</span>
                  </p>
                  <p className="text-sm text-gray-300 mb-4 capitalize">
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
                        className="w-8 h-8 border border-white/30 rounded hover:border-white/50 transition text-white"
                      >
                        -
                      </button>
                      <span className="text-lg font-semibold w-8 text-center text-white">
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
                        className="w-8 h-8 border border-white/30 rounded hover:border-white/50 transition text-white"
                      >
                        +
                      </button>
                    </div>

                    {/* Price */}
                    <div className="text-right">
                      <p className="text-xl font-bold text-white">
                        {(item.price * item.quantity).toLocaleString('ru-RU')} ₽
                      </p>
                      <button
                        onClick={() =>
                          removeItem(item.productId, item.size, item.color)
                        }
                        className="text-red-400 hover:text-red-300 text-sm flex items-center gap-1 mt-2"
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
            <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 sticky top-24 border border-white/20">
              <h2 className="text-xl font-bold text-white mb-6">
                Итого
              </h2>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-gray-300">
                  <span>Товары ({items.reduce((sum, item) => sum + item.quantity, 0)}):</span>
                  <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Доставка:</span>
                  <span>Рассчитается при оформлении</span>
                </div>
                <div className="border-t border-white/20 pt-3">
                  <div className="flex justify-between text-xl font-bold text-white">
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
                className="block w-full text-center text-gray-300 hover:text-white mt-4"
              >
                Продолжить покупки
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden px-4 py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-white">Корзина</h1>
          <p className="text-sm text-gray-300">
            {totalQuantity} {getItemsLabel(totalQuantity)}
          </p>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <div
              key={`${item.productId}-${item.size}-${item.color}`}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-2xl p-4 shadow-lg"
            >
              <div className="flex space-x-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden border border-white/10 bg-white/5 flex-shrink-0">
                  <Image
                    src={item.image || '/placeholder.jpg'}
                    alt={item.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0 space-y-3">
                  <div>
                    <h3 className="font-semibold text-white text-base line-clamp-2">
                      {item.name}
                    </h3>
                    <p className="text-xs text-gray-300 mt-1">
                      {item.size} • <span className="capitalize">{item.color}</span>
                    </p>
                    <p className="text-lg font-bold text-white mt-2">
                      {item.price.toLocaleString('ru-RU')} ₽
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center rounded-full border border-white/20 bg-white/10">
                      <button
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.size,
                            item.color,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="px-3 py-2 text-white hover:bg-white/20 transition focus:outline-none"
                      >
                        −
                      </button>
                      <span className="w-12 text-center text-sm font-semibold text-white">
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
                        className="px-3 py-2 text-white hover:bg-white/20 transition focus:outline-none"
                      >
                        +
                      </button>
                    </div>
                    <button
                      onClick={() => removeItem(item.productId, item.size, item.color)}
                      className="inline-flex items-center gap-2 rounded-full border border-red-300/30 bg-red-300/10 px-4 py-2 text-xs font-semibold text-red-200 hover:bg-red-300/20 transition"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4 pt-2">
          <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-2xl p-5 shadow-2xl">
            <div className="flex justify-between text-sm text-gray-300 mb-2">
              <span>Количество</span>
              <span>
                {totalQuantity} {getItemsLabel(totalQuantity)}
              </span>
            </div>
            <div className="flex justify-between text-lg font-semibold text-white">
              <span>Итого</span>
              <span>{getTotalPrice().toLocaleString('ru-RU')} ₽</span>
            </div>
          </div>

          <Link
            href="/checkout"
            className="block w-full rounded-full bg-white text-black py-4 text-base font-semibold shadow-lg hover:bg-gray-100 transition text-center"
          >
            Оформить заказ
          </Link>

          <Link
            href="/catalog"
            className="block w-full text-center rounded-full border border-white/20 bg-transparent py-3 text-sm font-semibold text-white hover:bg-white/10 transition"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  )
}

