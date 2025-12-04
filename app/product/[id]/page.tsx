'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import { useCartStore } from '@/lib/store'
import { ShoppingCartIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'
import Toast from '@/components/Toast'
import ProductViewTracker from '@/components/ProductViewTracker'

interface Product {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  stock: number
  available: boolean
  preOrder?: boolean
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedImage, setSelectedImage] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const addItem = useCartStore((state) => state.addItem)

  useEffect(() => {
    fetchProduct()
  }, [params.id])

  async function fetchProduct() {
    try {
      const res = await fetch(`/api/products/${params.id}`)
      const data = await res.json()
      const normalizedSizes = Array.isArray(data.sizes) ? data.sizes : []
      const normalizedColors = Array.isArray(data.colors) ? data.colors : []
      setProduct({
        ...data,
        sizes: normalizedSizes,
        colors: normalizedColors,
      })
      if (normalizedSizes.length > 0) setSelectedSize(normalizedSizes[0])
      if (normalizedColors.length > 0) setSelectedColor(normalizedColors[0])
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) return

    const isOutOfStock = !product.available || product.stock === 0
    if (isOutOfStock) return

    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      size: selectedSize,
      color: selectedColor,
      quantity,
    })

    setShowToast(true)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4 text-white">Товар не найден</h2>
        <Link href="/catalog" className="text-blue-400 hover:underline">
          Вернуться в каталог
        </Link>
      </div>
    )
  }

  const isOutOfStock = !product.available || product.stock === 0
  const isPreOrder = product.preOrder === true

  return (
    <div className="min-h-screen">
      <ProductViewTracker productId={product.id} productName={product.name} />
      <Toast
        message="Товар добавлен в корзину!"
        show={showToast}
        onClose={() => setShowToast(false)}
      />
      
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Images */}
          <div>
            {/* Main Image */}
            <div className="relative aspect-[3/4] mb-4 rounded-lg overflow-hidden border border-white/20">
              <Image
                src={product.images[selectedImage] || '/placeholder.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border ${
                      selectedImage === index ? 'border-white ring-2 ring-white/50' : 'border-white/20'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-6 border border-white/20">
            <div className="bg-black text-white inline-block px-3 py-1 text-xs font-semibold uppercase mb-4">
              {product.category}
            </div>

            <h1 className="text-4xl font-bold text-white mb-4">
              {product.name}
            </h1>

            <p className="text-3xl font-bold text-white mb-6">
              {product.price.toLocaleString('ru-RU')} ₽
            </p>

            <p className="text-gray-300 mb-4 leading-relaxed">
              {product.description}
            </p>

            {isPreOrder && (
              <p className="mb-4 text-sm font-medium text-yellow-300">
                Доставка этого товара осуществляется по срокам предзаказа.
              </p>
            )}

            {/* Size Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Размер
              </label>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-4 py-2 border-2 rounded-md font-medium transition ${
                      selectedSize === size
                        ? 'border-white bg-white text-black'
                        : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Цвет
              </label>
              <div className="flex flex-wrap gap-2">
                {product.colors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={`px-4 py-2 border-2 rounded-md font-medium transition capitalize ${
                      selectedColor === color
                        ? 'border-white bg-white text-black'
                        : 'border-white/30 bg-white/10 text-white hover:border-white/50'
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-white mb-3">
                Количество
              </label>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  disabled={isOutOfStock}
                  className="w-10 h-10 border-2 border-white/30 bg-white/10 text-white rounded-md transition disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40 hover:border-white/50"
                >
                  -
                </button>
                <span className="text-xl font-semibold w-12 text-center text-white">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => Math.min(10, prev + 1))}
                  disabled={isOutOfStock}
                  className="w-10 h-10 border-2 border-white/30 bg-white/10 text-white rounded-md transition disabled:cursor-not-allowed disabled:border-white/10 disabled:text-white/40 hover:border-white/50"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              onClick={handleAddToCart}
              disabled={!selectedSize || !selectedColor || isOutOfStock}
              className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <ShoppingCartIcon className="h-6 w-6" />
              <span>
                {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
              </span>
            </button>

            {/* Stock Info */}
            <p className="text-sm text-gray-300 mt-4">
              {product.available
                ? `В наличии: ${product.stock} шт.`
                : 'Этот товар временно недоступен для заказа'}
            </p>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Images */}
        <div>
          <div className="relative aspect-[3/4] border-b border-white/20">
            <Image
              src={product.images[selectedImage] || '/placeholder.jpg'}
              alt={product.name}
              fill
              className="object-cover"
              priority
            />
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-2 p-3 overflow-x-auto bg-white/5">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border ${
                    selectedImage === index ? 'border-white ring-2 ring-white/50' : 'border-white/20'
                  }`}
                >
                  <Image
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Product Info */}
        <div className="px-4 py-4 space-y-4">
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <div className="bg-black text-white inline-block px-2 py-1 text-xs font-semibold uppercase mb-3">
              {product.category}
            </div>

            <h1 className="text-2xl font-bold text-white mb-2">
            {product.name}
          </h1>

            <p className="text-2xl font-bold text-white mb-3">
            {product.price.toLocaleString('ru-RU')} ₽
          </p>

            <p className="text-sm text-gray-300 leading-relaxed">
              {product.description}
            </p>

            {isPreOrder && (
              <p className="mt-3 text-xs font-medium text-yellow-300">
                Доставка этого товара осуществляется по срокам предзаказа.
              </p>
            )}
          </div>

          {/* Size Selection */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <label className="block text-sm font-semibold text-white mb-2">
              Размер
            </label>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-2 border-2 rounded-md text-sm font-medium transition ${
                    selectedSize === size
                      ? 'border-white bg-white text-black'
                      : 'border-white/30 bg-white/10 text-white'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Color Selection */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <label className="block text-sm font-semibold text-white mb-2">
              Цвет
            </label>
            <div className="flex flex-wrap gap-2">
              {product.colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`px-3 py-2 border-2 rounded-md text-sm font-medium transition capitalize ${
                    selectedColor === color
                      ? 'border-white bg-white text-black'
                      : 'border-white/30 bg-white/10 text-white'
                  }`}
                >
                  {color}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <label className="block text-sm font-semibold text-white mb-2">
              Количество
            </label>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 border-2 border-white/30 bg-white/10 text-white rounded-md"
              >
                -
              </button>
              <span className="text-lg font-semibold w-12 text-center text-white">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(10, quantity + 1))}
                className="w-10 h-10 border-2 border-white/30 bg-white/10 text-white rounded-md"
              >
                +
              </button>
            </div>
          </div>

          {/* Stock Info */}
          <p className="text-xs text-gray-300 mb-4">
            {product.available
              ? `В наличии: ${product.stock} шт.`
              : 'Этот товар временно недоступен для заказа'}
          </p>

          {/* Mobile Add to Cart Button */}
          <button
            onClick={handleAddToCart}
            disabled={!selectedSize || !selectedColor || isOutOfStock}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            <ShoppingCartIcon className="h-5 w-5" />
            <span>
              {isOutOfStock ? 'Нет в наличии' : 'Добавить в корзину'}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

