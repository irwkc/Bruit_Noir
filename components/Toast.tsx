'use client'

import { useEffect } from 'react'
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface ToastProps {
  message: string
  show: boolean
  onClose: () => void
  duration?: number
}

export default function Toast({ message, show, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    if (show) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, onClose, duration])

  if (!show) return null

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-slide-down">
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 flex items-center space-x-3 min-w-[300px] max-w-md">
        <CheckCircleIcon className="h-6 w-6 text-green-500 flex-shrink-0" />
        <p className="text-sm font-medium text-gray-900 flex-grow">{message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition flex-shrink-0"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

