"use client"

import { useState } from 'react'

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    setLoading(false)
    if (res.ok) {
      // после входа — в админ-панель
      window.location.href = '/admin/dashboard'
    } else {
      const data = await res.json().catch(() => ({} as any))
      setError(data?.message || 'Неверный логин или пароль')
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800"
      >
        <h1 className="text-2xl font-bold mb-6">Вход в админку</h1>
        {error && (
          <div className="mb-4 text-red-400 text-sm">{error}</div>
        )}
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full mb-4 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label className="block text-sm mb-1">Пароль</label>
        <input
          type="password"
          className="w-full mb-6 px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-white text-black font-semibold hover:bg-zinc-200 transition"
        >
          {loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}

import { redirect } from 'next/navigation'

export default function AdminLoginRedirect() {
  redirect('/auth/signin?callbackUrl=%2Fadmin')
}


