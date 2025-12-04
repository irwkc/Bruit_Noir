'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

export default function AdminSettingsPage() {
  const [deliveryPrice, setDeliveryPrice] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      try {
        setError(null)
        const res = await fetch('/api/admin/settings/delivery')
        if (!res.ok) {
          if (res.status === 401) {
            setError('Нет доступа. Пожалуйста, войдите как админ.')
            return
          }
          setError('Не удалось загрузить настройки доставки')
          return
        }
        const data = (await res.json()) as { deliveryPrice?: number }
        const value = typeof data.deliveryPrice === 'number' ? data.deliveryPrice : 0
        setDeliveryPrice(value.toString())
      } catch (e) {
        console.error('Error loading delivery settings', e)
        setError('Ошибка при загрузке настроек доставки')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)
    try {
      const value = Number(deliveryPrice.replace(',', '.'))
      const res = await fetch('/api/admin/settings/delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deliveryPrice: value }),
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        setError(data.message || 'Не удалось сохранить настройки доставки')
        return
      }

      setDeliveryPrice(
        typeof data.deliveryPrice === 'number' ? data.deliveryPrice.toString() : deliveryPrice
      )
      setMessage('Стоимость доставки сохранена')
    } catch (e) {
      console.error('Error saving delivery settings', e)
      setError('Ошибка при сохранении настроек доставки')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-10">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Link href="/admin/dashboard" className="text-blue-600 hover:underline">
              ← Назад в админку
            </Link>
            <h1 className="mt-2 text-3xl font-bold text-gray-900">Настройки магазина</h1>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Доставка</h2>
          <p className="text-sm text-gray-600 mb-4">
            Стоимость доставки будет добавляться к сумме товаров на этапе оформления заказа и
            учитываться в общей сумме заказа.
          </p>

          {loading ? (
            <div className="py-6 text-gray-500">Загрузка…</div>
          ) : (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Стоимость доставки, ₽
                </label>
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={deliveryPrice}
                  onChange={(e) => setDeliveryPrice(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}
              {message && <p className="text-sm text-green-600">{message}</p>}

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-gray-800 disabled:bg-gray-400"
              >
                {saving ? 'Сохранение…' : 'Сохранить изменения'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}


