'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import MobileProductCard from '@/components/mobile/ProductCard'

interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
}

export default function MobileCatalogPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const categories = [
    { id: 'all', name: 'Все' },
    { id: 'hoodies', name: 'Худи' },
    { id: 't-shirts', name: 'Футболки' },
    { id: 'pants', name: 'Штаны' },
    { id: 'accessories', name: 'Аксессуары' },
  ]

  const sortOptions = [
    { id: 'newest', name: 'Новые' },
    { id: 'price-asc', name: 'Цена ↑' },
    { id: 'price-desc', name: 'Цена ↓' },
    { id: 'name', name: 'A→Z' },
  ]

  useEffect(() => {
    fetchProducts()
  }, [selectedCategory, sortBy])

  async function fetchProducts() {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        category: selectedCategory,
        sort: sortBy,
        limit: '20', // More products for mobile
      })
      const res = await fetch(`/api/products?${params}`)
      if (res.ok) {
        const data = await res.json()
        setProducts(data.data || data)
      }
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold">Каталог</h1>
          <div className="w-6" /> {/* Spacer */}
        </div>
      </div>

      {/* Filters - sticky */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        {/* Categories */}
        <div className="mb-3">
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${
                  selectedCategory === category.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sort */}
        <div className="flex space-x-2 overflow-x-auto">
          {sortOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setSortBy(option.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition ${
                sortBy === option.id
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>

      {/* Products */}
      <div className="p-4">
        {loading ? (
          <div className="grid grid-cols-2 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-64 animate-pulse">
                <div className="bg-gray-200 h-48 rounded-t-xl" />
                <div className="p-3">
                  <div className="bg-gray-200 h-4 rounded mb-2" />
                  <div className="bg-gray-200 h-4 w-16 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {products.map((product) => (
              <MobileProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                images={product.images}
                category={product.category}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Товары не найдены</p>
            <button
              onClick={() => {
                setSelectedCategory('all')
                setSortBy('newest')
              }}
              className="text-blue-600 hover:underline text-sm"
            >
              Сбросить фильтры
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
