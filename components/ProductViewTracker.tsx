"use client"

import { useEffect } from 'react'
import { trackAnalyticsEvent } from '@/lib/clientAnalytics'

interface ProductViewTrackerProps {
  productId: string
  productName?: string
}

export default function ProductViewTracker({ productId, productName }: ProductViewTrackerProps) {
  useEffect(() => {
    if (!productId) return
    trackAnalyticsEvent({
      eventType: 'product_view',
      productId,
      metadata: {
        productName,
      },
    })
  }, [productId, productName])

  return null
}

