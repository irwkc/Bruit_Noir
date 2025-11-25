"use client"

import { useEffect, useMemo, useState } from 'react'

type AnalyticsResponse = {
  rangeDays: number
  summary: { visits: number; uniqueVisitors: number }
  dailyStats: { date: string; visits: number; uniques: number }[]
  topPages: { path: string; visits: number }[]
  topReferrers: { referrer: string; visits: number }[]
  devices: { deviceType: string; count: number }[]
  productViews: { productId: string | null; productName: string; views: number }[]
}

const RANGE_OPTIONS = [
  { label: '7 дней', value: '7' },
  { label: '30 дней', value: '30' },
  { label: '90 дней', value: '90' },
]

function formatDate(dateString: string) {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: 'short' })
}

function LineChart({ data }: { data: { date: string; visits: number }[] }) {
  if (!data.length) {
    return <div className="text-sm text-gray-500">Недостаточно данных</div>
  }

  const max = Math.max(...data.map((point) => point.visits), 1)
  const points = data.map((point, index) => {
    const x = (index / Math.max(data.length - 1, 1)) * 100
    const y = 100 - (point.visits / max) * 100
    return `${x},${y}`
  })

  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-40">
      <defs>
        <linearGradient id="analyticsLine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
        </linearGradient>
      </defs>
      <polyline
        fill="none"
        stroke="url(#analyticsLine)"
        strokeWidth="2"
        points={points.join(' ')}
      />
    </svg>
  )
}

export default function AnalyticsDashboard() {
  const [range, setRange] = useState('30')
  const [data, setData] = useState<AnalyticsResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let isMounted = true
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const response = await fetch(`/api/admin/analytics?range=${range}`, {
          credentials: 'include',
        })

        if (!response.ok) {
          throw new Error('Не удалось загрузить аналитику')
        }

        const json = (await response.json()) as AnalyticsResponse
        if (isMounted) {
          setData(json)
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Ошибка загрузки')
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    fetchData()

    const interval = setInterval(fetchData, 60_000)
    return () => {
      isMounted = false
      clearInterval(interval)
    }
  }, [range])

  const dailySeries = useMemo(
    () =>
      data?.dailyStats.map((item) => ({
        date: formatDate(item.date),
        visits: item.visits,
      })) ?? [],
    [data?.dailyStats]
  )

  const topPages = data?.topPages ?? []
  const topReferrers = data?.topReferrers ?? []
  const devices = data?.devices ?? []
  const productViews = data?.productViews ?? []

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Аналитика</h1>
          <p className="text-white/70 text-sm mt-1">
            Живые данные по посещаемости за выбранный период
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-full bg-white/10 border border-white/20 p-1">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setRange(option.value)}
              className={`px-4 py-1 rounded-full text-sm transition ${
                range === option.value
                  ? 'bg-white text-black font-semibold'
                  : 'text-white/70 hover:text-white'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-5 text-white">
          <p className="text-sm text-white/70">Визитов</p>
          <p className="text-3xl font-semibold mt-2">{data?.summary.visits ?? '--'}</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/5 p-5 text-white">
          <p className="text-sm text-white/70">Уникальных посетителей</p>
          <p className="text-3xl font-semibold mt-2">{data?.summary.uniqueVisitors ?? '--'}</p>
        </div>
        <div className="rounded-2xl border border-white/20 bg-white/5 p-5 text-white">
          <p className="text-sm text-white/70">Среднее в день</p>
          <p className="text-3xl font-semibold mt-2">
            {data && data.dailyStats.length
              ? Math.round(data.summary.visits / data.dailyStats.length)
              : '--'}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Динамика визитов</h2>
          {loading && <span className="text-xs text-white/60">Обновляем...</span>}
        </div>
        <LineChart data={dailySeries} />
        <div className="mt-4 grid grid-cols-5 text-xs text-white/50 gap-2">
          {dailySeries.map((point) => (
            <div key={point.date} className="truncate">
              {point.date}
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-white">
          <h2 className="text-lg font-semibold mb-4">Топ страниц</h2>
          <div className="space-y-3">
            {topPages.length === 0 && <p className="text-sm text-white/60">Ещё нет данных</p>}
            {topPages.map((page) => (
              <div key={page.path}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate pr-4">{page.path}</span>
                  <span className="text-white/60">{page.visits}</span>
                </div>
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-white/70"
                    style={{
                      width: `${topPages.length ? (page.visits / topPages[0].visits) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-white space-y-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Источники трафика</h2>
            <div className="space-y-3">
              {topReferrers.length === 0 && (
                <p className="text-sm text-white/60">Данных пока нет</p>
              )}
              {topReferrers.map((ref) => (
                <div key={ref.referrer}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="truncate pr-4">{ref.referrer}</span>
                    <span className="text-white/60">{ref.visits}</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-white/70"
                      style={{
                        width: `${
                          topReferrers.length ? (ref.visits / topReferrers[0].visits) * 100 : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-3">Типы устройств</h2>
            <div className="flex gap-3">
              {devices.length === 0 && <p className="text-sm text-white/60">Нет данных</p>}
              {devices.map((device) => (
                <div
                  key={device.deviceType}
                  className="flex-1 rounded-2xl border border-white/15 bg-white/5 p-3 text-center"
                >
                  <p className="text-xs uppercase tracking-widest text-white/60">
                    {device.deviceType}
                  </p>
                  <p className="text-2xl font-semibold">{device.count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/20 bg-white/5 p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Посещения товаров</h2>
          <span className="text-xs text-white/60">Всего: {productViews.length}</span>
        </div>
        {productViews.length === 0 ? (
          <p className="text-sm text-white/60">Нет просмотров товаров за период</p>
        ) : (
          <div className="space-y-3">
            {productViews.map((product) => (
              <div key={product.productId ?? product.productName}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate pr-4">{product.productName}</span>
                  <span className="text-white/70">{product.views}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                  <div
                    className="h-full bg-white/70"
                    style={{
                      width: `${
                        productViews.length
                          ? (product.views / productViews[0].views) * 100
                          : 0
                      }%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

