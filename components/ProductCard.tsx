'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'

interface ProductCardProps {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  available?: boolean
  preOrder?: boolean
}

export default function ProductCard({
  id,
  name,
  price,
  images,
  category,
  available = true,
  preOrder = false,
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const isAvailable = available !== false
  const isPreOrder = preOrder === true

  return (
    <Link href={`/product/${id}`} className="block group">
      <div
        className="relative overflow-hidden rounded-2xl border border-white/20 transition-[transform,box-shadow] duration-300 will-change-transform hover:-translate-y-1 hover:shadow-2xl"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image */}
        <div className="relative aspect-[3/4] bg-gray-100">
          <Image
            src={(Array.isArray(images) ? images[0] : undefined) || '/placeholder.jpg'}
            alt={name}
            fill
            className={`object-cover transition-transform duration-700 ease-out ${
              isHovered ? 'scale-110' : 'scale-100'
            } ${isAvailable ? '' : 'opacity-60'}`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          {/* Gradient / Top badges */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />
          <div className="absolute top-3 left-3 flex flex-col gap-2">
            <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
              {category}
            </span>
            {isPreOrder && (
              <span className="rounded-full bg-yellow-400 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-black shadow-sm">
                pre-order
              </span>
            )}
          </div>
          {!isAvailable && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center rounded-full bg-red-600/90 px-3 py-1 text-xs font-semibold text-white shadow-lg">
                Нет в наличии
              </span>
            </div>
          )}

          {/* Quick CTA */}
          <div className={`absolute inset-x-3 bottom-3 transition-all ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center justify-between rounded-xl bg-white/10 backdrop-blur-2xl border border-white/20 px-3 py-2">
              <span className="truncate pr-2 text-sm font-medium text-white">Быстрый просмотр</span>
              <span className="text-xs font-semibold text-white">→</span>
            </div>
          </div>
        </div>

        {/* Info with glass effect */}
        <div className="bg-white/10 backdrop-blur-2xl border-t border-white/20 px-3 pb-3 pt-3">
          <div className="flex items-baseline justify-between">
            <h3 className="line-clamp-1 text-base font-medium text-white group-hover:text-gray-200">
            {name}
          </h3>
            <p className="whitespace-nowrap pl-3 text-lg font-semibold text-white">
            {price.toLocaleString('ru-RU')} ₽
          </p>
        </div>
        {!isAvailable && (
            <div className="mt-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-red-400">Скоро в наличии</p>
          </div>
        )}
        </div>
      </div>
    </Link>
  )
}

