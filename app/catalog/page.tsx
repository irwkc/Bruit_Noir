'use client'

import { useState, useEffect } from 'react'
import ProductCard from '@/components/ProductCard'
import MobileProductCard from '@/components/mobile/ProductCard'
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline'
import StaggerContainer from '@/components/animations/StaggerContainer'
import StaggerItem from '@/components/animations/StaggerItem'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  available?: boolean
  preOrder?: boolean
}

export default function CatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [selectedCategory, sortBy, searchQuery])

  useEffect(() => {
    fetchProducts(true)
  }, [selectedCategory, sortBy, page])

  async function fetchProducts(reset = false) {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        // Всегда запрашиваем все товары, категории фильтруем на клиенте
        category: 'all',
        sort: sortBy,
        page: String(page),
        limit: '12',
      })
      const res = await fetch(`/api/products?${params}`)
      const json = await res.json()
      const data: Product[] = json.data || []
      const meta = json.pagination || { totalPages: 1 }
      setTotalPages(meta.totalPages || 1)
      setProducts((prev) => (reset || page === 1 ? data : [...prev, ...data]))
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  // Нормализация категорий для устойчивой фильтрации на клиенте
  const CATEGORY_ALIASES: Record<string, string[]> = {
    hoodies: ['hoodies', 'hoodie'],
    't-shirts': ['t-shirts', 'tshirt', 'tshirts'],
    pants: ['pants', 'trousers'],
    accessories: ['accessories', 'accessory'],
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase())

    if (!matchesSearch) return false

    if (selectedCategory === 'all') return true

    const aliases = CATEGORY_ALIASES[selectedCategory]
    const productCategory = product.category.toLowerCase()

    if (aliases) {
      return aliases.includes(productCategory)
    }

    return productCategory === selectedCategory.toLowerCase()
  })

  const categories = [
    { id: 'all', name: 'Все товары' },
    { id: 'hoodies', name: 'Худи' },
    { id: 't-shirts', name: 'Футболки' },
    { id: 'pants', name: 'Штаны' },
    { id: 'accessories', name: 'Аксессуары' },
  ]

  return (
    <div className="min-h-screen">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">Каталог</h1>
          <p className="text-lg text-gray-300">
            Вся коллекция Bruit Noir в одном месте
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Search */}
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск товаров..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/30 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/30 focus:border-white/50"
            />
          </div>

          {/* Category */}
          <div className="sticky top-16 z-10 -mx-4 px-4 py-3">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedCategory === cat.id
                      ? 'border-white bg-white text-black'
                      : 'bg-white/10 text-white border-white/30 hover:border-white/50'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading && products.length === 0 ? null : filteredProducts.length > 0 ? (
          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <StaggerItem key={product.id}>
                <ProductCard
                  id={product.id}
                  name={product.name}
                  price={product.price}
                  images={(product as any).images || []}
                  category={product.category}
                  available={product.available}
                  preOrder={product.preOrder}
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-300 text-lg mb-4">
              {searchQuery ? 'Товары не найдены' : 'Товары скоро появятся'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10 hover:border-white/60 transition"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                <span>Сбросить поиск</span>
              </button>
            )}
          </div>
        )}

        {/* Load more */}
        {filteredProducts.length > 0 && page < totalPages && (
          <div className="mt-10 flex justify-center">
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={loading}
              className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium hover:border-gray-400 disabled:opacity-50"
            >
              {loading ? 'Загрузка...' : 'Показать ещё'}
            </button>
          </div>
        )}
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-white mb-1">Каталог</h1>
          <p className="text-sm text-gray-300">
            Вся коллекция Bruit Noir
          </p>
        </div>

        {/* Mobile Search */}
        <div className="px-4 pb-2">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg text-white placeholder-gray-400 bg-black/40 border border-white/20 focus:ring-2 focus:ring-white/40 focus:border-white/60 shadow-sm"
            />
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="sticky top-0 z-10 px-4 py-3">
          {/* Categories */}
          <div className="flex overflow-x-auto gap-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'border-white bg-white text-black'
                    : 'bg-white/10 text-white border-white/30'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Products Grid */}
        <div className="px-4 py-4">
          {loading && products.length === 0 ? null : filteredProducts.length > 0 ? (
            <StaggerContainer className="grid grid-cols-2 gap-3" staggerDelay={0.08}>
              {filteredProducts.map((product) => (
                <StaggerItem key={product.id}>
                  <MobileProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    images={(product as any).images || []}
                    category={product.category}
                    available={product.available}
                    preOrder={product.preOrder}
                  />
                </StaggerItem>
              ))}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm mb-3">
                {searchQuery ? 'Товары не найдены' : 'Товары скоро появятся'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-4 py-1.5 text-xs font-medium text-white hover:bg-white/10 hover:border-white/50 transition"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
                  <span>Сбросить поиск</span>
                </button>
              )}
            </div>
          )}

          {/* Mobile Load more */}
          {filteredProducts.length > 0 && page < totalPages && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-medium hover:border-gray-400 disabled:opacity-50"
              >
                {loading ? 'Загрузка...' : 'Показать ещё'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

