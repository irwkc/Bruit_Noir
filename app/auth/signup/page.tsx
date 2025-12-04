'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'

export default function SignUpPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Загружаем данные из формы оформления заказа при монтировании компонента
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const savedData =
        localStorage.getItem('checkoutFormData') ||
        sessionStorage.getItem('checkoutFormData')

      if (savedData) {
        const formData = JSON.parse(savedData)
        if (formData.name) {
          setName(formData.name)
        }
        if (formData.email) {
          setEmail(formData.email)
        }
        localStorage.removeItem('checkoutFormData')
        sessionStorage.removeItem('checkoutFormData')
        return
      }

      const params = new URLSearchParams(window.location.search)
      const prefillName = params.get('prefillName')
      const prefillEmail = params.get('prefillEmail')
      if (prefillName) setName(prefillName)
      if (prefillEmail) setEmail(prefillEmail)
    } catch (error) {
      console.error('Error loading checkout form data:', error)
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Пароли не совпадают')
      return
    }

    if (password.length < 6) {
      setError('Пароль должен быть не менее 6 символов')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Ошибка при регистрации')
      } else {
        // Очищаем данные формы оформления заказа после успешной регистрации
        localStorage.removeItem('checkoutFormData')
        sessionStorage.removeItem('checkoutFormData')
        
        // Redirect to verification page
        if (data.requiresVerification && data.userId) {
          router.push(`/auth/verify?userId=${data.userId}`)
        } else {
          // Если есть callbackUrl, используем его, иначе на страницу входа
          const urlParams = new URLSearchParams(window.location.search)
          const callbackUrl = urlParams.get('callbackUrl')
          router.push(callbackUrl || '/auth/signin')
        }
      }
    } catch (error) {
      setError('Произошла ошибка при регистрации')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-black"></div>
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-gray-800 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gray-700 rounded-full mix-blend-screen filter blur-[100px] opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/2 w-[550px] h-[550px] bg-gray-800 rounded-full mix-blend-screen filter blur-[110px] opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/2 right-1/2 w-[450px] h-[450px] bg-gray-900 rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      {/* Форма */}
      <div className="relative max-w-md w-full space-y-4 z-10">
        <div className="flex justify-start">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-300 hover:text-white transition"
          >
            <span className="text-lg leading-none">←</span>
            <span>Назад</span>
          </Link>
        </div>
        <div className="bg-white/10 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/20">
          <div className="text-center mb-8">
            <div className="mb-6 flex justify-center">
              <Image
                src="/logo.png"
                alt="Bruit Noir"
                width={400}
                height={88}
                className="h-20 w-auto"
                priority
              />
            </div>
            <h2 className="text-2xl font-semibold text-white mt-6">
            Создать аккаунт
          </h2>
            <p className="mt-2 text-sm text-gray-300">
            Уже есть аккаунт?{' '}
              <Link href="/auth/signin" className="font-medium text-white hover:underline">
              Войти
            </Link>
          </p>
        </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
          {error && (
              <div className="bg-red-500/20 backdrop-blur-sm border-l-4 border-red-500 text-red-200 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

            <div className="space-y-5">
            <div>
                <label htmlFor="name" className="block text-sm font-semibold text-white mb-2">
                Имя
              </label>
                <div className="relative">
              <input
                id="name"
                name="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                placeholder="Ваше имя"
              />
                </div>
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-semibold text-white mb-2">
                Email
              </label>
                <div className="relative">
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                placeholder="your@email.com"
              />
                </div>
            </div>
            <div>
                <label htmlFor="password" className="block text-sm font-semibold text-white mb-2">
                Пароль
              </label>
                <div className="relative">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                placeholder="Минимум 6 символов"
              />
                </div>
            </div>
            <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white mb-2">
                Подтвердите пароль
              </label>
                <div className="relative">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-white/20 backdrop-blur-md border-2 border-white/30 rounded-xl text-white placeholder-gray-300 focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/30 transition-all duration-200"
                placeholder="Повторите пароль"
              />
                </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
                className="w-full py-3.5 px-4 bg-black text-white font-semibold rounded-xl hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              {loading ? 'Регистрация...' : 'Зарегистрироваться'}
            </button>
          </div>
        </form>
        </div>
      </div>
    </div>
  )
}

