'use client'

import { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface ProductResponse {
  id: string
  name: string
  description: string
  price: number
  images: string[]
  category: string
  sizes: string[]
  colors: string[]
  stock: number
  featured: boolean
  available: boolean
  preOrder?: boolean
}

const DEFAULT_SIZES = ['S', 'M', 'L']
const DEFAULT_COLORS = ['black']

export default function EditProductPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const productId = params?.id

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'hoodies',
    stock: '',
    images: [] as string[],
    sizes: DEFAULT_SIZES,
    colors: DEFAULT_COLORS,
    featured: false,
    outOfStock: false,
    preOrder: false,
  })

  const hasAnyData = useMemo(
    () =>
      Boolean(
        formData.name ||
          formData.description ||
          formData.images.length ||
          formData.price ||
          formData.stock
      ),
    [formData]
  )

  useEffect(() => {
    if (!productId) return

    async function fetchProduct() {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) {
          throw new Error('Не удалось загрузить данные товара')
        }

        const product = (await res.json()) as ProductResponse

        setFormData({
          name: product.name,
          description: product.description,
          price: product.price ? String(product.price) : '',
          category: product.category ?? 'hoodies',
          stock: product.stock ? String(product.stock) : '',
          images: Array.isArray(product.images) ? product.images : [],
          sizes: Array.isArray(product.sizes) && product.sizes.length > 0 ? product.sizes : DEFAULT_SIZES,
          colors: Array.isArray(product.colors) && product.colors.length > 0 ? product.colors : DEFAULT_COLORS,
          featured: Boolean(product.featured),
          outOfStock: product.available === false,
        preOrder: product.preOrder === true,
        })
      } catch (fetchError) {
        console.error('Error fetching product:', fetchError)
        setError(fetchError instanceof Error ? fetchError.message : 'Ошибка при загрузке товара')
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [productId])

  async function uploadFiles(files: File[]) {
    const uploadedUrls: string[] = []
    for (const file of files) {
      const data = new FormData()
      data.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: data })
      if (!res.ok) continue
      const json = (await res.json()) as { url?: string }
      if (json?.url) uploadedUrls.push(json.url)
    }
    setFormData((prev) => ({ ...prev, images: [...prev.images, ...uploadedUrls] }))
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!productId) return

    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price) || 0,
          category: formData.category,
          stock: formData.stock ? parseInt(formData.stock, 10) || 0 : 0,
          images: formData.images.filter((img) => img.trim() !== ''),
          sizes: formData.sizes.filter((size) => size.trim() !== ''),
          colors: formData.colors.filter((color) => color.trim() !== ''),
          featured: formData.featured,
          available: !formData.outOfStock,
          preOrder: formData.preOrder,
        }),
      })

      if (!res.ok) {
        throw new Error('Не удалось сохранить изменения')
      }

      router.push('/admin/products')
    } catch (submitError) {
      console.error('Error updating product:', submitError)
      setError(submitError instanceof Error ? submitError.message : 'Ошибка при сохранении товара')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-lg text-gray-600">Загрузка данных товара…</div>
      </div>
    )
  }

  if (error && !hasAnyData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-2xl font-bold text-gray-900 mb-3">Не получилось загрузить товар</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/admin/products"
            className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100"
          >
            ← Вернуться к списку
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/admin/products" className="text-blue-600 hover:underline mb-4 inline-flex items-center gap-1">
            ← К списку товаров
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Редактирование товара</h1>
          <p className="text-gray-600 mt-2">
            Внесите изменения и сохраните, чтобы обновить карточку товара в магазине.
          </p>
        </div>

        {error && hasAnyData && (
          <div className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">Название *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Описание *</label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Цена (₽) *</label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">Наличие (шт.) *</label>
              <input
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500 disabled:bg-gray-100"
                disabled={formData.outOfStock}
              />
              {formData.outOfStock && (
                <p className="mt-1 text-xs text-gray-500">
                  Количество скрыто, пока товар отмечен как «Нет в наличии».
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">Категория *</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData((prev) => ({ ...prev, category: e.target.value }))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black"
              >
                <option value="hoodies">Худи</option>
                <option value="t-shirts">Футболки</option>
                <option value="pants">Штаны</option>
                <option value="accessories">Аксессуары</option>
              </select>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-gray-200 px-4 py-3 bg-gray-50">
              <input
                id="out-of-stock"
                type="checkbox"
                checked={formData.outOfStock}
                onChange={(e) => setFormData((prev) => ({ ...prev, outOfStock: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
              />
              <label htmlFor="out-of-stock" className="text-sm text-gray-800">
                <span className="font-semibold">Нет в наличии</span>
                <span className="block text-gray-500">
                  Покупатели увидят пометку «Нет в наличии», количество скроется, а добавление в корзину будет недоступно.
                </span>
              </label>
            </div>

            <div className="flex items-start gap-3 rounded-lg border border-yellow-200 px-4 py-3 bg-yellow-50">
              <input
                id="edit-pre-order"
                type="checkbox"
                checked={formData.preOrder}
                onChange={(e) => setFormData((prev) => ({ ...prev, preOrder: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
              />
              <label htmlFor="edit-pre-order" className="text-sm text-gray-800">
                <span className="font-semibold text-yellow-800">Режим pre-order</span>
                <span className="block text-gray-600">
                  Если включить, товар останется доступным для заказа как предзаказ, с жёлтым бейджем «pre-order».
                </span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Изображения</label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault()
                const files = Array.from(e.dataTransfer.files)
                await uploadFiles(files)
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white"
            >
              <p className="text-sm text-black mb-3">Перетащите изображения сюда или выберите файлы</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={async (e) => {
                  const files = Array.from(e.target.files || [])
                  await uploadFiles(files)
                }}
                className="block w-full text-sm text-black file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
              />
              {formData.images.length > 0 && (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {formData.images.map((url, index) => (
                    <div key={index} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`preview-${index}`} className="w-full h-28 object-cover rounded-lg" />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({
                            ...prev,
                            images: prev.images.filter((_, imgIndex) => imgIndex !== index),
                          }))
                        }
                        className="absolute top-2 right-2 rounded-full bg-black/70 px-2 py-1 text-xs text-white hover:bg-black"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Размеры (через запятую)</label>
            <input
              type="text"
              value={formData.sizes.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  sizes: e.target.value
                    .split(',')
                    .map((size) => size.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="XS, S, M, L, XL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">Цвета (через запятую)</label>
            <input
              type="text"
              value={formData.colors.join(', ')}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  colors: e.target.value
                    .split(',')
                    .map((color) => color.trim())
                    .filter(Boolean),
                }))
              }
              placeholder="black, white, gray"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="featured"
              checked={formData.featured}
              onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Избранный товар (показывать на главной)
            </label>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {saving ? 'Сохранение…' : 'Сохранить изменения'}
            </button>
            <Link
              href="/admin/products"
              className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
            >
              Отмена
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
