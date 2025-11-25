import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Prisma } from '@prisma/client'
import crypto from 'crypto'

type AnalyticsPayload = {
  eventType?: string
  path?: string
  fullUrl?: string
  referrer?: string | null
  sessionId?: string | null
  visitorId?: string | null
  userAgent?: string | null
  deviceType?: string | null
  language?: string | null
  metadata?: Prisma.InputJsonValue | null
  userId?: string | null
  productId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as AnalyticsPayload
    const {
      eventType = 'page_view',
      path,
      fullUrl,
      referrer,
      sessionId,
      visitorId,
      userAgent,
      deviceType,
      language,
      metadata,
      userId,
      productId,
    } = body

    if (!path) {
      return NextResponse.json({ error: 'Path is required' }, { status: 400 })
    }

    const rawIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      request.headers.get('cf-connecting-ip') ||
      request.headers.get('x-real-ip') ||
      undefined
    const ipHash = rawIp ? crypto.createHash('sha256').update(rawIp).digest('hex') : null

    await prisma.analyticsEvent.create({
      data: {
        eventType,
        path,
        fullUrl,
        referrer,
        sessionId,
        visitorId,
        userAgent,
        deviceType,
        language,
        metadata: metadata ?? undefined,
        userId: userId || undefined,
        productId: productId || undefined,
        ipHash,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to store analytics event', error)
    return NextResponse.json({ error: 'Failed to store analytics event' }, { status: 500 })
  }
}

