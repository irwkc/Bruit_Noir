"use client"

import { useState } from 'react'

type TotpPayload = {
  requiresTotpSetup?: boolean
  qrCodeDataUrl?: string
  otpauthUrl?: string
  message?: string
}

export default function AdminLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totpState, setTotpState] = useState<TotpPayload | null>(null)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email || !password) {
      setError('Введите email и пароль')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, code: code || undefined }),
      })

      if (res.status === 202) {
        const payload = (await res.json()) as TotpPayload
        setTotpState(payload)
        if (!payload?.requiresTotpSetup) {
          setError('Требуется подтверждение 2FA')
        }
        if (!payload?.qrCodeDataUrl) {
          setError('Не удалось подготовить 2FA, попробуйте еще раз')
        }
        return
      }

      if (res.ok) {
        window.location.href = '/admin/dashboard'
        return
      }

      const data = await res.json().catch(() => ({} as any))
      setError(data?.message || 'Ошибка авторизации')
    } catch (err) {
      console.error(err)
      setError('Не удалось выполнить запрос')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm bg-zinc-900 rounded-xl p-6 shadow-xl border border-zinc-800 space-y-5"
      >
        <div>
          <h1 className="text-2xl font-bold">Вход в админку</h1>
          <p className="text-sm text-zinc-400 mt-1">
            {totpState?.requiresTotpSetup
              ? 'Введите код из Google Authenticator'
              : 'Используйте учетную запись администратора'}
          </p>
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input
              type="email"
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              disabled={totpState?.requiresTotpSetup}
            />
          </div>

          <div>
            <label className="block text-sm mb-1">Пароль</label>
            <input
              type="password"
              className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              disabled={totpState?.requiresTotpSetup}
            />
          </div>

          {!totpState?.requiresTotpSetup && (
            <div>
              <label className="block text-sm mb-1">
                Код из приложения (если 2FA уже подключена)
              </label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none tracking-widest text-center"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                autoComplete="one-time-code"
              />
            </div>
          )}

          {totpState?.requiresTotpSetup && (
            <div className="space-y-3">
              <div className="rounded-lg bg-zinc-800 border border-zinc-700 p-3 text-sm text-zinc-300">
                <p className="font-semibold mb-2">Шаг 2. Подтверждение 2FA</p>
                <p className="text-xs text-zinc-400">
                  {totpState.message || 'Отсканируйте QR-код в Google Authenticator и введите шестизначный код'}
                </p>
              </div>
              {totpState.qrCodeDataUrl && (
                <img
                  src={totpState.qrCodeDataUrl}
                  alt="QR code"
                  className="mx-auto w-48 h-48 rounded bg-white p-2"
                />
              )}
              <div>
                <label className="block text-sm mb-1">Код из приложения</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className="w-full px-3 py-2 rounded bg-zinc-800 border border-zinc-700 focus:outline-none tracking-widest text-center"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  required
                  autoComplete="one-time-code"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2 rounded bg-white text-black font-semibold hover:bg-zinc-200 transition disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {totpState?.requiresTotpSetup ? (loading ? 'Подтверждаем…' : 'Подтвердить код') : loading ? 'Входим…' : 'Войти'}
        </button>
      </form>
    </div>
  )
}
