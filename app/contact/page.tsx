'use client'

import { useState } from 'react'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)

    // Валидация на клиенте
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Все поля обязательны для заполнения')
      return
    }

    if (name.trim().length < 2) {
      setError('Имя должно содержать минимум 2 символа')
      return
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Некорректный email адрес')
      return
    }

    if (message.trim().length < 10) {
      setError('Сообщение должно содержать минимум 10 символов')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка при отправке сообщения')
      } else {
        setSuccess(true)
        setName('')
        setEmail('')
        setMessage('')
        // Скрыть сообщение об успехе через 5 секунд
        setTimeout(() => setSuccess(false), 5000)
      }
    } catch (error) {
      setError('Произошла ошибка при отправке сообщения. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-gray-900 mb-8">Контакты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Свяжитесь с нами</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Email</h3>
                <a href="mailto:bruitnoirco@gmail.com" className="text-black hover:text-gray-600 transition">
                  bruitnoirco@gmail.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Телефон</h3>
                <a href="tel:+79206344846" className="text-black hover:text-gray-600 transition">
                  +7 (920) 634-48-46
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Социальные сети</h3>
                <div className="space-y-2">
                  <a href="https://t.me/bruitnoir_co" target="_blank" rel="noopener noreferrer" className="block text-black hover:text-gray-600 transition">
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-6">Напишите нам</h2>
            
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-sm">Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Контакты</h1>
        </div>

        {/* Mobile Content */}
        <div className="px-4 py-6 space-y-4">
          {/* Contact Info Card */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Свяжитесь с нами</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Email</h3>
                <a href="mailto:bruitnoirco@gmail.com" className="text-sm text-black hover:text-gray-600 transition">
                  bruitnoirco@gmail.com
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Телефон</h3>
                <a href="tel:+79206344846" className="text-sm text-black hover:text-gray-600 transition">
                  +7 (920) 634-48-46
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-gray-700">Социальные сети</h3>
                <div className="space-y-1">
                  <a href="https://t.me/bruitnoir_co" target="_blank" rel="noopener noreferrer" className="block text-sm text-black hover:text-gray-600 transition">
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white rounded-lg p-4">
            <h2 className="text-lg font-bold mb-4">Напишите нам</h2>
            
            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-green-800 text-xs">Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-800 text-xs">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-gray-800 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
