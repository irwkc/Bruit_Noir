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
}

export default function ProductCard({ id, name, price, images, category }: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <Link href={`/product/${id}`} className="block group">
      <div
        className="relative overflow-hidden rounded-2xl bg-white ring-1 ring-black/5 transition-[transform,box-shadow] duration-300 will-change-transform hover:-translate-y-1 hover:shadow-2xl"
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
            }`}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
          />
          {/* Gradient / Top badges */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-90" />
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="rounded-full bg-black/80 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white backdrop-blur">
              {category}
            </span>
          </div>

          {/* Quick CTA */}
          <div className={`absolute inset-x-3 bottom-3 transition-all ${isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3'}`}>
            <div className="flex items-center justify-between rounded-xl bg-white/90 px-3 py-2 shadow-lg backdrop-blur">
              <span className="truncate pr-2 text-sm font-medium text-gray-900">Быстрый просмотр</span>
              <span className="text-xs font-semibold text-gray-700">→</span>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="flex items-baseline justify-between px-3 pb-3 pt-3">
          <h3 className="line-clamp-1 text-base font-medium text-gray-900 group-hover:text-black">
            {name}
          </h3>
          <p className="whitespace-nowrap pl-3 text-lg font-semibold text-gray-900">
            {price.toLocaleString('ru-RU')} ₽
          </p>
        </div>
      </div>
    </Link>
  )
}

