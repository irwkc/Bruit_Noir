import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

async function getFeaturedProducts() {
  try {
    const products = await prisma.product.findMany({
      where: { featured: true },
      take: 6,
      orderBy: { createdAt: 'desc' },
    })
    return products
  } catch (error) {
    console.error('Error fetching products:', error)
    return []
  }
}

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts()

  return (
    <div>
      {/* Hero Section */}
      <section className="relative h-[600px] bg-gradient-to-r from-black to-gray-900 text-white">
        <div className="absolute inset-0 bg-black opacity-40" />
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              BRUIT NOIR
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Новая коллекция уличной моды. Стиль, который говорит сам за себя.
            </p>
            <div className="flex space-x-4">
              <Link
                href="/catalog"
                className="bg-white text-black px-8 py-3 rounded-md font-semibold hover:bg-gray-200 transition"
              >
                Смотреть коллекцию
              </Link>
              <Link
                href="/about"
                className="border-2 border-white text-white px-8 py-3 rounded-md font-semibold hover:bg-white hover:text-black transition"
              >
                О бренде
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Избранные товары
            </h2>
            <p className="text-lg text-gray-600">
              Лучшие предложения от Bruit Noir
            </p>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={(product as any).images || []}
                  category={product.category}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">Товары скоро появятся</p>
              <Link href="/admin" className="text-blue-600 hover:underline">
                Добавить товары в админ-панели
              </Link>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              href="/catalog"
              className="inline-block bg-black text-white px-8 py-3 rounded-md font-semibold hover:bg-gray-800 transition"
            >
              Смотреть все товары
            </Link>
          </div>
        </div>
      </section>

      {/* Benefits strip (clean, minimal) */}
      <section className="bg-white border-y border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-stretch divide-y md:divide-y-0 md:divide-x divide-gray-200">
            <div className="flex-1 py-8 md:py-10 px-0 md:px-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center text-sm font-semibold">1</div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold tracking-tight">Быстрая доставка</h3>
                  <p className="text-sm md:text-base text-gray-600">По всей России. Пункты выдачи и курьер.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 py-8 md:py-10 px-0 md:px-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center text-sm font-semibold">2</div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold tracking-tight">Контроль качества</h3>
                  <p className="text-sm md:text-base text-gray-600">Отборные ткани, точная посадка, долгий срок службы.</p>
                </div>
              </div>
            </div>
            <div className="flex-1 py-8 md:py-10 px-0 md:px-8">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-full border border-gray-300 flex items-center justify-center text-sm font-semibold">3</div>
                <div>
                  <h3 className="text-lg md:text-xl font-semibold tracking-tight">Лёгкий возврат</h3>
                  <p className="text-sm md:text-base text-gray-600">14 дней на обмен или возврат без лишних вопросов.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
