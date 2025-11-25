import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdminRequest } from '@/lib/adminAuth'

type RangeOption = '7' | '30' | '90'

export async function GET(request: NextRequest) {
  try {
    await authenticateAdminRequest(request)
  } catch (error) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const range = (searchParams.get('range') as RangeOption) || '30'
  const rangeDays = Number(range)
  const fromParam = searchParams.get('from')
  const toParam = searchParams.get('to')

  const now = new Date()
  let toDate = new Date(now)
  toDate.setHours(23, 59, 59, 999)

  let fromDate = new Date()
  let usingCustomRange = false

  if (fromParam && toParam) {
    const parsedFrom = new Date(fromParam)
    const parsedTo = new Date(toParam)
    if (!isNaN(parsedFrom.getTime()) && !isNaN(parsedTo.getTime()) && parsedFrom <= parsedTo) {
      fromDate = parsedFrom
      fromDate.setHours(0, 0, 0, 0)
      toDate = parsedTo
      toDate.setHours(23, 59, 59, 999)
      usingCustomRange = true
    }
  }

  if (!usingCustomRange) {
    fromDate = new Date()
    fromDate.setDate(fromDate.getDate() - rangeDays + 1)
    fromDate.setHours(0, 0, 0, 0)
  }

  const summary = await prisma.analyticsEvent.aggregate({
    where: { createdAt: { gte: fromDate, lte: toDate } },
    _count: { id: true },
  })

  const uniqueVisitorsResult =
    await prisma.$queryRaw<
      { count: number }[]
    >`SELECT COUNT(DISTINCT COALESCE("visitorId","sessionId","ipHash"))::int as count FROM "AnalyticsEvent" WHERE "createdAt" BETWEEN ${fromDate} AND ${toDate}`

  const dailyStats =
    await prisma.$queryRaw<
      { date: string; visits: number; uniques: number }[]
    >`SELECT DATE("createdAt") as date,
         COUNT(*)::int as visits,
         COUNT(DISTINCT COALESCE("visitorId","sessionId","ipHash"))::int as uniques
      FROM "AnalyticsEvent"
      WHERE "createdAt" BETWEEN ${fromDate} AND ${toDate}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC`

  const topPages =
    await prisma.$queryRaw<{ path: string; visits: number }[]>`
      SELECT "path", COUNT(*)::int as visits
      FROM "AnalyticsEvent"
      WHERE "createdAt" BETWEEN ${fromDate} AND ${toDate}
      GROUP BY "path"
      ORDER BY visits DESC
      LIMIT 8
    `

  const topReferrers =
    await prisma.$queryRaw<{ referrer: string; visits: number }[]>`
      SELECT COALESCE(NULLIF("referrer", ''), 'Прямые заходы') as referrer,
             COUNT(*)::int as visits
      FROM "AnalyticsEvent"
      WHERE "createdAt" BETWEEN ${fromDate} AND ${toDate}
      GROUP BY COALESCE(NULLIF("referrer", ''), 'Прямые заходы')
      ORDER BY visits DESC
      LIMIT 6
    `

  const devices =
    await prisma.$queryRaw<{ deviceType: string; count: number }[]>`
      SELECT COALESCE(NULLIF("deviceType", ''), 'unknown') as "deviceType",
             COUNT(*)::int as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" BETWEEN ${fromDate} AND ${toDate}
      GROUP BY COALESCE(NULLIF("deviceType", ''), 'unknown')
    `

  const productViews =
    await prisma.$queryRaw<
      { productId: string | null; productName: string; views: number }[]
    >`
      SELECT
        e."productId" as "productId",
        COALESCE(p."name", 'Неизвестный товар') as "productName",
        COUNT(*)::int as views
      FROM "AnalyticsEvent" e
      LEFT JOIN "Product" p ON p."id" = e."productId"
      WHERE e."createdAt" BETWEEN ${fromDate} AND ${toDate}
        AND e."eventType" = 'product_view'
        AND e."productId" IS NOT NULL
      GROUP BY e."productId", p."name"
      ORDER BY views DESC
    `

  return NextResponse.json({
    rangeDays: usingCustomRange ? null : rangeDays,
    fromDate: fromDate.toISOString(),
    toDate: toDate.toISOString(),
    summary: {
      visits: summary._count.id,
      uniqueVisitors: uniqueVisitorsResult[0]?.count ?? 0,
    },
    dailyStats,
    topPages,
    topReferrers,
    devices,
    productViews,
  })
}

