'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

export default function OrderConfirmationPage() {
  const params = useParams()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real app, fetch order details
    // For now, just show confirmation
    setLoading(false)
  }, [params.id])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Заказ оформлен!
        </h1>
        
        <p className="text-gray-600 mb-2">
          Номер заказа: <span className="font-semibold">#{params.id?.slice(0, 8)}</span>
        </p>
        
        <p className="text-gray-600 mb-8">
          Мы отправили подтверждение на вашу электронную почту. 
          С вами свяжутся в ближайшее время для уточнения деталей доставки.
        </p>

        <div className="space-y-3">
          <Link
            href="/profile"
            className="block w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition"
          >
            Мои заказы
          </Link>
          <Link
            href="/catalog"
            className="block w-full bg-gray-200 text-gray-800 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
          >
            Продолжить покупки
          </Link>
        </div>
      </div>
    </div>
  )
}

