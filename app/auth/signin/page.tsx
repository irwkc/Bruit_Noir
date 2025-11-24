'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MobileHeader from '@/components/mobile/Header'
import MobileFooter from '@/components/mobile/Footer'

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Если есть callbackUrl, используем его, иначе на профиль
        const urlParams = new URLSearchParams(window.location.search)
        const callbackUrl = urlParams.get('callbackUrl')
        router.push(callbackUrl || '/profile')
        router.refresh()
      }
    } catch (error) {
      setError('Произошла ошибка при входе')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Анимированный фон */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-black"></div>
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-gray-800 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gray-700 rounded-full mix-blend-screen filter blur-[100px] opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/2 w-[550px] h-[550px] bg-gray-800 rounded-full mix-blend-screen filter blur-[110px] opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/2 right-1/2 w-[450px] h-[450px] bg-gray-900 rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <div className="hidden md:block">
          <Header />
        </div>
        <div className="md:hidden">
          <MobileHeader />
        </div>

        <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
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
                  Войдите в аккаунт
                </h2>
                <p className="mt-2 text-sm text-gray-300">
                  Или{' '}
                  <Link href="/auth/signup" className="font-medium text-white hover:underline">
                    создайте новый аккаунт
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
                        placeholder="Ваш пароль"
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
                    {loading ? 'Вход...' : 'Войти'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </main>

        <div className="hidden md:block">
          <Footer />
        </div>
        <div className="md:hidden">
          <MobileFooter />
        </div>
      </div>
    </div>
  )
}

