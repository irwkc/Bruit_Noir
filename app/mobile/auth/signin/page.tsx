'use client'

import { useState } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'

export default function MobileSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError('Неверный email или пароль')
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-gray-600">
            ← Назад
          </Link>
          <h1 className="text-lg font-semibold">Вход</h1>
          <div className="w-6" />
        </div>
      </div>

      <div className="px-4 py-8">
        <div className="max-w-sm mx-auto">
          {/* Logo */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Добро пожаловать</h2>
            <p className="text-gray-600">Войдите в свой аккаунт</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Пароль
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition disabled:bg-gray-400"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          {/* Links */}
          <div className="mt-6 text-center space-y-3">
            <Link
              href="/auth/signup"
              className="block text-gray-600 hover:text-black transition"
            >
              Нет аккаунта? Зарегистрироваться
            </Link>
            <Link
              href="/"
              className="block text-sm text-gray-500 hover:text-gray-700 transition"
            >
              Вернуться на главную
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
