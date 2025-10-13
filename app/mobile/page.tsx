import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MobileProductCard from '@/components/mobile/ProductCard'

type FeaturedProduct = {
  id: string
  name: string
  price: number
  images: unknown
  category: string
}

export const dynamic = 'force-dynamic'

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      take: 4, // Fewer products for mobile
      orderBy: { createdAt: 'desc' },
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function MobileHomePage() {
  const featuredProducts: FeaturedProduct[] = await getFeaturedProducts()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - mobile optimized */}
      <section className="relative h-[500px] bg-gradient-to-b from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative z-10 px-4 py-16 h-full flex flex-col justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4 leading-tight">
              BRUIT NOIR
            </h1>
            <p className="text-lg mb-8 text-gray-200 px-4">
              Новая коллекция уличной моды
            </p>
            <div className="flex flex-col space-y-3 px-4">
              <Link
                href="/catalog"
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition text-center"
              >
                Смотреть коллекцию
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-black transition text-center"
              >
                О бренде
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products - mobile grid */}
      <section className="py-8">
        <div className="px-4">
          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-3">
              {featuredProducts.map((product: FeaturedProduct) => (
                <MobileProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={((product.images as unknown) as string[]) || []}
                  category={product.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Товары скоро появятся</p>
              <Link href="/admin" className="text-blue-600 hover:underline text-sm">
                Добавить товары в админ-панели
              </Link>
            </div>
          )}

          <div className="text-center mt-8">
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition text-sm"
            >
              Смотреть все товары
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
