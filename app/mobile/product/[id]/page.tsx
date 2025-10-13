import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
    })
    return product
  } catch (error) {
    console.error('Error fetching product:', error)
    return null
  }
}

export default async function MobileProductPage({ params }: ProductPageProps) {
  const { id } = await params
  const product = await getProduct(id)

  if (!product) {
    notFound()
  }

  const images = (product.images as string[]) || []
  const sizes = (product.sizes as string[]) || []
  const colors = (product.colors as string[]) || []

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <Link href="/catalog" className="text-gray-600">
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold">Товар</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="pb-20">
        {/* Images - mobile carousel */}
        <div className="bg-white">
          {images.length > 0 ? (
            <div className="relative aspect-square">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square bg-gray-100 flex items-center justify-center">
              <span className="text-gray-400">Нет фото</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="bg-white p-4">
          <div className="mb-4">
            <h1 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-gray-900 mb-3">
              {product.price.toLocaleString()} ₽
            </p>
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-sm">
                {product.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                product.stock > 0 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-red-100 text-red-700'
              }`}>
                {product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">Описание</h3>
            <p className="text-gray-600 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Размеры</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Цвета</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition"
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Add to Cart Button */}
          <div className="space-y-3">
            <button
              disabled={product.stock === 0}
              className={`w-full py-4 rounded-lg font-semibold text-lg transition ${
                product.stock > 0
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {product.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
            
            <button className="w-full py-3 border border-gray-300 rounded-lg font-semibold text-gray-700 hover:bg-gray-50 transition">
              В избранное
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
