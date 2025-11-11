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
        category: selectedCategory,
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

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const categories = [
    { id: 'all', name: 'Все товары' },
    { id: 'hoodies', name: 'Худи' },
    { id: 't-shirts', name: 'Футболки' },
    { id: 'pants', name: 'Штаны' },
    { id: 'accessories', name: 'Аксессуары' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Каталог</h1>
          <p className="text-lg text-gray-600">
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
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>

          {/* Category & Sort */}
          <div className="sticky top-16 z-10 -mx-4 bg-gray-50/80 px-4 py-3 backdrop-blur">
            <div className="flex flex-wrap items-center gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    selectedCategory === cat.id
                      ? 'border-black bg-black text-white'
                      : 'bg-white text-black border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {cat.name}
                </button>
              ))}

              <div className="ml-auto flex items-center gap-2">
                {[
                  { id: 'newest', label: 'Новые' },
                  { id: 'price-asc', label: 'Цена ↑' },
                  { id: 'price-desc', label: 'Цена ↓' },
                  { id: 'name', label: 'A→Z' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSortBy(opt.id)}
                    className={`rounded-full px-3 py-2 text-sm transition ${
                      sortBy === opt.id
                        ? 'bg-black text-white'
                        : 'bg-white text-black border border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse overflow-hidden rounded-2xl bg-white p-3 ring-1 ring-black/5">
                <div className="mb-3 aspect-[3/4] rounded-xl bg-gray-200" />
                <div className="mb-2 h-4 w-2/3 rounded bg-gray-200" />
                <div className="h-4 w-24 rounded bg-gray-200" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
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
                />
              </StaggerItem>
            ))}
          </StaggerContainer>
        ) : (
          <div className="text-center py-20">
            <p className="text-gray-600 text-lg mb-4">
              {searchQuery ? 'Товары не найдены' : 'Товары скоро появятся'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-blue-600 hover:underline"
              >
                Сбросить поиск
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
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Каталог</h1>
          <p className="text-sm text-gray-600">
            Вся коллекция Bruit Noir
          </p>
        </div>

        {/* Mobile Search */}
        <div className="bg-white px-4 py-3 border-b border-gray-200">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Поиск..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
            />
          </div>
        </div>

        {/* Mobile Filters */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          {/* Categories */}
          <div className="flex overflow-x-auto gap-2 mb-2 pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex-shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                  selectedCategory === cat.id
                    ? 'border-black bg-black text-white'
                    : 'bg-white text-black border-gray-300'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex overflow-x-auto gap-2 -mx-4 px-4 scrollbar-hide">
            {[
              { id: 'newest', label: 'Новые' },
              { id: 'price-asc', label: 'Цена ↑' },
              { id: 'price-desc', label: 'Цена ↓' },
              { id: 'name', label: 'A→Z' },
            ].map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition ${
                  sortBy === opt.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-black'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Products Grid */}
        <div className="px-4 py-4">
          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-lg bg-gray-200 mb-2" />
                  <div className="h-3 w-2/3 rounded bg-gray-200 mb-1" />
                  <div className="h-3 w-16 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : filteredProducts.length > 0 ? (
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
                  className="text-blue-600 hover:underline text-sm"
                >
                  Сбросить поиск
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

