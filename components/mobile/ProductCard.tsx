import Link from 'next/link'
import Image from 'next/image'

interface MobileProductCardProps {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  available?: boolean
}

export default function MobileProductCard({
  id,
  name,
  price,
  images,
  category,
  available = true,
  preOrder = false,
}: MobileProductCardProps) {
  const isAvailable = available !== false
  const isPreOrder = preOrder === true

  return (
    <Link href={`/product/${id}`} className="block">
      <div className="rounded-xl border border-white/20 overflow-hidden">
        {/* Image - square aspect ratio for mobile */}
        <div className="relative aspect-square bg-gray-100">
          {images && images.length > 0 ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              className={`object-cover ${isAvailable ? '' : 'opacity-60'}`}
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">Нет фото</span>
            </div>
          )}
          
          {/* Category + pre-order badges */}
          <div className="absolute top-2 left-2 flex flex-col items-start gap-1">
            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded-full font-medium">
              {category}
            </span>
            {isPreOrder && (
              <span className="bg-yellow-400 text-black text-[11px] px-2 py-0.5 rounded-full font-semibold uppercase">
                pre-order
              </span>
            )}
          </div>
        </div>

        {/* Content with glass effect */}
        <div className="bg-white/10 backdrop-blur-2xl border-t border-white/20 p-3">
          <h3 className="font-medium text-white text-sm leading-tight mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-lg font-bold text-white">
            {price.toLocaleString()} ₽
          </p>
          {!isAvailable && (
            <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-red-400">
              Скоро в продаже
            </p>
          )}
        </div>
      </div>
    </Link>
  )
}
