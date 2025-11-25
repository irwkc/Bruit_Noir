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

  const fromDate = new Date()
  fromDate.setDate(fromDate.getDate() - rangeDays + 1)
  fromDate.setHours(0, 0, 0, 0)

  const summary = await prisma.analyticsEvent.aggregate({
    where: { createdAt: { gte: fromDate } },
    _count: { id: true },
  })

  const uniqueVisitorsResult =
    await prisma.$queryRaw<{ count: number }[]>`SELECT COUNT(DISTINCT COALESCE("visitorId","sessionId","ipHash"))::int as count FROM "AnalyticsEvent" WHERE "createdAt" >= ${fromDate}`

  const dailyStats =
    await prisma.$queryRaw<
      { date: string; visits: number; uniques: number }[]
    >`SELECT DATE("createdAt") as date,
         COUNT(*)::int as visits,
         COUNT(DISTINCT COALESCE("visitorId","sessionId","ipHash"))::int as uniques
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${fromDate}
      GROUP BY DATE("createdAt")
      ORDER BY DATE("createdAt") ASC`

  const topPages =
    await prisma.$queryRaw<{ path: string; visits: number }[]>`
      SELECT "path", COUNT(*)::int as visits
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${fromDate}
      GROUP BY "path"
      ORDER BY visits DESC
      LIMIT 8
    `

  const topReferrers =
    await prisma.$queryRaw<{ referrer: string; visits: number }[]>`
      SELECT COALESCE(NULLIF("referrer", ''), 'Прямые заходы') as referrer,
             COUNT(*)::int as visits
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${fromDate}
      GROUP BY COALESCE(NULLIF("referrer", ''), 'Прямые заходы')
      ORDER BY visits DESC
      LIMIT 6
    `

  const devices =
    await prisma.$queryRaw<{ deviceType: string; count: number }[]>`
      SELECT COALESCE(NULLIF("deviceType", ''), 'unknown') as "deviceType",
             COUNT(*)::int as count
      FROM "AnalyticsEvent"
      WHERE "createdAt" >= ${fromDate}
      GROUP BY COALESCE(NULLIF("deviceType", ''), 'unknown')
    `

  return NextResponse.json({
    rangeDays,
    summary: {
      visits: summary._count.id,
      uniqueVisitors: uniqueVisitorsResult[0]?.count ?? 0,
    },
    dailyStats,
    topPages,
    topReferrers,
    devices,
  })
}

