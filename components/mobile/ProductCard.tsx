import Link from 'next/link'
import Image from 'next/image'

interface MobileProductCardProps {
  id: string
  name: string
  price: number
  images: string[]
  category: string
}

export default function MobileProductCard({
  id,
  name,
  price,
  images,
  category,
}: MobileProductCardProps) {
  return (
    <Link href={`/product/${id}`} className="block">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Image - square aspect ratio for mobile */}
        <div className="relative aspect-square bg-gray-100">
          {images && images.length > 0 ? (
            <Image
              src={images[0]}
              alt={name}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-100">
              <span className="text-gray-400 text-sm">Нет фото</span>
            </div>
          )}
          
          {/* Category badge - smaller for mobile */}
          <div className="absolute top-2 left-2">
            <span className="bg-black/80 text-white text-xs px-2 py-1 rounded-full font-medium">
              {category}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-3">
          <h3 className="font-medium text-gray-900 text-sm leading-tight mb-1 line-clamp-2">
            {name}
          </h3>
          <p className="text-lg font-bold text-gray-900">
            {price.toLocaleString()} ₽
          </p>
        </div>
      </div>
    </Link>
  )
}
