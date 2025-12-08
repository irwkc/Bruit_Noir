'use client'

import { useState } from 'react'
import Link from 'next/link'

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
    <div className="min-h-screen">
      {/* Desktop Version */}
      <div className="hidden md:block mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-5xl font-bold text-white mb-8">Контакты</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">Свяжитесь с нами</h2>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2 text-white">Email</h3>
                <a href="mailto:bruitnoirco@gmail.com" className="text-gray-300 hover:text-white transition">
                  bruitnoirco@gmail.com
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">Телефон</h3>
                <a href="tel:+79206344846" className="text-gray-300 hover:text-white transition">
                  +7 (920) 634-48-46
                </a>
              </div>

              <div>
                <h3 className="font-semibold mb-2 text-white">Социальные сети</h3>
                <div className="space-y-2">
                  <a href="https://t.me/bruitnoir_co" target="_blank" rel="noopener noreferrer" className="block text-gray-300 hover:text-white transition">
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-8 border border-white/20">
            <h2 className="text-2xl font-bold mb-6 text-white">Напишите нам</h2>
            
            {success && (
              <div className="mb-4 p-4 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg">
                <p className="text-white text-sm">Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-4 bg-white/10 backdrop-blur-2xl border border-red-400/50 rounded-lg">
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/10 backdrop-blur-2xl text-white py-3 rounded-full font-semibold border border-white/20 hover:bg-white/20 transition disabled:bg-white/5 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-4">
                Нажимая кнопку «Отправить», вы соглашаетесь с{' '}
                <Link href="/privacy" className="text-white hover:underline">
                  Политикой конфиденциальности
                </Link>
                {' '}и{' '}
                <Link href="/oferta" className="text-white hover:underline">
                  Публичной офертой
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Mobile Version */}
      <div className="block md:hidden">
        {/* Mobile Content */}
        <div className="px-4 py-6 space-y-4">
          <h1 className="text-2xl font-bold text-white mb-4">Контакты</h1>
          
          {/* Contact Info Card */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <h2 className="text-lg font-bold mb-4 text-white">Свяжитесь с нами</h2>
            
            <div className="space-y-3">
              <div>
                <h3 className="text-sm font-semibold mb-1 text-white">Email</h3>
                <a href="mailto:bruitnoirco@gmail.com" className="text-sm text-gray-300 hover:text-white transition">
                  bruitnoirco@gmail.com
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-white">Телефон</h3>
                <a href="tel:+79206344846" className="text-sm text-gray-300 hover:text-white transition">
                  +7 (920) 634-48-46
                </a>
              </div>

              <div>
                <h3 className="text-sm font-semibold mb-1 text-white">Социальные сети</h3>
                <div className="space-y-1">
                  <a href="https://t.me/bruitnoir_co" target="_blank" rel="noopener noreferrer" className="block text-sm text-gray-300 hover:text-white transition">
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form Card */}
          <div className="bg-white/10 backdrop-blur-2xl rounded-lg p-4 border border-white/20">
            <h2 className="text-lg font-bold mb-4 text-white">Напишите нам</h2>
            
            {success && (
              <div className="mb-4 p-3 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg">
                <p className="text-white text-xs">Сообщение успешно отправлено! Мы свяжемся с вами в ближайшее время.</p>
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-white/10 backdrop-blur-2xl border border-red-400/50 rounded-lg">
                <p className="text-red-300 text-xs">{error}</p>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Имя
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-base bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-base bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-white mb-1">
                  Сообщение
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2 text-base bg-white/10 backdrop-blur-2xl border border-white/20 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-white/50 focus:border-white/50 disabled:bg-white/5 disabled:cursor-not-allowed"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/10 backdrop-blur-2xl text-white py-2.5 rounded-full text-sm font-semibold border border-white/20 hover:bg-white/20 transition disabled:bg-white/5 disabled:cursor-not-allowed"
              >
                {loading ? 'Отправка...' : 'Отправить'}
              </button>
              
              <p className="text-xs text-gray-400 text-center mt-3">
                Нажимая кнопку «Отправить», вы соглашаетесь с{' '}
                <Link href="/privacy" className="text-white hover:underline">
                  Политикой конфиденциальности
                </Link>
                {' '}и{' '}
                <Link href="/oferta" className="text-white hover:underline">
                  Публичной офертой
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
