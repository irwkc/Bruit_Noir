import Link from 'next/link'
import Image from 'next/image'
import { prisma } from '@/lib/prisma'
import ProductCard from '@/components/ProductCard'
import MobileProductCard from '@/components/mobile/ProductCard'
import FadeIn from '@/components/animations/FadeIn'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

type FeaturedProduct = {
  id: string
  name: string
  price: number
  images: unknown
  category: string
  available?: boolean
}

export const dynamic = 'force-dynamic'

async function getFeaturedProducts(): Promise<FeaturedProduct[]> {
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
  const featuredProducts: FeaturedProduct[] = await getFeaturedProducts()

  return (
    <div>
      {/* Desktop Hero Section */}
      <section className="relative h-screen text-white hidden md:block">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="max-w-2xl">
            <FadeIn delay={0.2}>
              <div className="mb-6">
                <Image
                  src="/logo.png"
                  alt="Bruit Noir"
                  width={600}
                  height={132}
                  className="h-32 md:h-40 w-auto"
                  priority
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-xl md:text-2xl mb-8 text-gray-200">
                Новая коллекция уличной моды. Стиль, который говорит сам за себя.
              </p>
            </FadeIn>
            <FadeIn delay={0.6}>
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
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Mobile Hero Section */}
      <section className="relative h-screen text-white block md:hidden">
        <div className="relative z-10 px-4 py-16 h-full flex flex-col justify-center">
          <div className="text-center">
            <FadeIn delay={0.2}>
              <div className="mb-4 flex justify-center">
                <Image
                  src="/logo.png"
                  alt="Bruit Noir"
                  width={450}
                  height={99}
                  className="h-24 w-auto"
                  priority
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.4}>
              <p className="text-lg mb-8 text-gray-200 px-4">
                Новая коллекция уличной моды
              </p>
            </FadeIn>
            <FadeIn delay={0.6}>
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
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Desktop Featured Products */}
      <section className="py-16 hidden md:block">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {featuredProducts.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredProducts.map((product: FeaturedProduct) => (
                <StaggerItem key={product.id}>
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    images={((product.images as unknown) as string[]) || []}
                    category={product.category}
                    available={product.available}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">Товары скоро появятся</p>
              <Link href="/admin" className="text-blue-400 hover:underline">
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

      {/* Mobile Featured Products */}
      <section className="py-8 block md:hidden">
        <div className="px-4">
          {featuredProducts.length > 0 ? (
            <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={0.08}>
              {featuredProducts.map((product: FeaturedProduct) => (
                <StaggerItem key={product.id}>
                  <MobileProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    images={((product.images as unknown) as string[]) || []}
                    category={product.category}
                    available={product.available}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-300 mb-4">Товары скоро появятся</p>
              <Link href="/admin" className="text-blue-400 hover:underline text-sm">
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
