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
      <div className="bg-white/10 backdrop-blur-2xl rounded-full shadow-2xl border border-white/20 p-4 flex items-center space-x-3 min-w-[300px] max-w-md">
        <CheckCircleIcon className="h-6 w-6 text-white flex-shrink-0" />
        <p className="text-sm font-medium text-white flex-grow">{message}</p>
        <button
          onClick={onClose}
          className="text-white/70 hover:text-white transition flex-shrink-0"
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}

