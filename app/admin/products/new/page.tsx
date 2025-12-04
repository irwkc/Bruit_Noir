'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function NewProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'hoodies',
    stock: '',
    images: [] as string[],
    sizes: ['S', 'M', 'L'],
    colors: ['black'],
    featured: false,
    outOfStock: false,
    preOrder: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          stock: formData.stock ? parseInt(formData.stock, 10) : 0,
          images: formData.images.filter((img: string) => img.trim() !== ''),
          available: !formData.outOfStock,
          preOrder: formData.preOrder,
        }),
      })

      if (res.ok) {
        router.push('/admin')
      } else {
        alert('Ошибка при создании товара')
      }
    } catch (error) {
      console.error('Error creating product:', error)
      alert('Ошибка при создании товара')
    } finally {
      setLoading(false)
    }
  }

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
    setFormData({ ...formData, images: [...formData.images, ...uploadedUrls] })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <Link href="/admin" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Назад к списку
          </Link>
          <h1 className="text-4xl font-bold text-gray-900">Добавить товар</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Название *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Описание *
            </label>
            <textarea
              required
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Цена (₽) *
              </label>
              <input
                type="number"
                required
                min="0"
                step="0.01"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Наличие (шт.) *
              </label>
              <input
                type="number"
                required
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
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

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Категория *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
              id="new-out-of-stock"
              type="checkbox"
              checked={formData.outOfStock}
              onChange={(e) => setFormData({ ...formData, outOfStock: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
            />
            <label htmlFor="new-out-of-stock" className="text-sm text-gray-800">
              <span className="font-semibold">Нет в наличии</span>
              <span className="block text-gray-500">
                Покупатели увидят пометку «Нет в наличии», количество скроется, а добавление в корзину будет недоступно.
              </span>
            </label>
          </div>

          <div className="flex items-start gap-3 rounded-lg border border-yellow-200 px-4 py-3 bg-yellow-50">
            <input
              id="new-pre-order"
              type="checkbox"
              checked={formData.preOrder}
              onChange={(e) => setFormData({ ...formData, preOrder: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-yellow-400 text-yellow-600 focus:ring-yellow-500"
            />
            <label htmlFor="new-pre-order" className="text-sm text-gray-800">
              <span className="font-semibold text-yellow-800">Режим pre-order</span>
              <span className="block text-gray-600">
                Товар можно заказывать в предзаказ. На карточке появится жёлтый бейдж «pre-order», а на странице товара будет пометка про сроки предзаказа.
              </span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Изображения (перетащи файлы или выбери)
            </label>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={async (e) => {
                e.preventDefault()
                const files = Array.from(e.dataTransfer.files)
                await uploadFiles(files)
              }}
              className="w-full border-2 border-dashed border-gray-300 rounded-lg p-6 text-center bg-white"
            >
              <p className="text-sm text-black mb-3">Перетащите изображения сюда</p>
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
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {formData.images.map((url, i) => (
                    <div key={i} className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="preview" className="w-full h-24 object-cover rounded" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Размеры (через запятую)
            </label>
            <input
              type="text"
              value={formData.sizes.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  sizes: e.target.value.split(',').map((s) => s.trim()),
                })
              }
              placeholder="XS, S, M, L, XL"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent bg-white text-black placeholder-gray-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-2">
              Цвета (через запятую)
            </label>
            <input
              type="text"
              value={formData.colors.join(', ')}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  colors: e.target.value.split(',').map((c) => c.trim()),
                })
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
              onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
              className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
            />
            <label htmlFor="featured" className="ml-2 block text-sm text-gray-900">
              Избранный товар (показывать на главной)
            </label>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {loading ? 'Создание...' : 'Создать товар'}
            </button>
            <Link
              href="/admin"
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

