import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import Image from 'next/image'
import Link from 'next/link'
import ProductViewTracker from '@/components/ProductViewTracker'

interface ProductPageProps {
  params: Promise<{ id: string }>
}

async function getProduct(id: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        price: true,
        images: true,
        category: true,
        sizes: true,
        colors: true,
        stock: true,
        available: true,
        preOrder: true,
      },
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
    <div className="min-h-screen">
      <ProductViewTracker productId={product.id} productName={product.name} />
      <div className="pb-20">
        {/* Images - mobile carousel */}
        <div>
          {images.length > 0 ? (
            <div className="relative aspect-square border-b border-white/20">
              <Image
                src={images[0]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          ) : (
            <div className="aspect-square bg-white/5 flex items-center justify-center border-b border-white/20">
              <span className="text-gray-400">Нет фото</span>
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="px-4 py-4 space-y-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <h1 className="text-xl font-bold text-white mb-2">{product.name}</h1>
            <p className="text-2xl font-bold text-white mb-3">
              {product.price.toLocaleString()} ₽
            </p>
            <div className="flex items-center space-x-2 mb-3">
              <span className="bg-black text-white px-2 py-1 rounded-full text-sm">
                {product.category}
              </span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                product.available && product.stock > 0
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-gray-400'
              }`}>
                {product.available && product.stock > 0 ? 'В наличии' : 'Нет в наличии'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <h3 className="font-semibold text-white mb-2">Описание</h3>
            <p className="text-gray-300 text-sm leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Sizes */}
          {sizes.length > 0 && (
            <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-white mb-3">Размеры</h3>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    className="px-3 py-2 border border-white/30 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition"
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Colors */}
          {colors.length > 0 && (
            <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
              <h3 className="font-semibold text-white mb-3">Цвета</h3>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <button
                    key={color}
                    className="px-3 py-2 border border-white/30 bg-white/10 text-white rounded-lg text-sm hover:bg-white/20 transition capitalize"
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
              disabled={!product.available || product.stock === 0}
              className={`w-full py-4 rounded-full font-semibold text-lg transition ${
                product.available && product.stock > 0
                  ? 'bg-white/10 backdrop-blur-2xl text-white border border-white/20 hover:bg-white/20'
                  : 'bg-white/5 text-gray-400 cursor-not-allowed border border-white/10'
              }`}
            >
              {product.available && product.stock > 0 ? 'Добавить в корзину' : 'Нет в наличии'}
            </button>
            
            <button className="w-full py-3 border border-white/20 bg-white/10 backdrop-blur-2xl text-white rounded-full font-semibold hover:bg-white/20 transition">
              В избранное
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
