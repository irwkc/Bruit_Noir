import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { authenticateAdminRequest } from '@/lib/adminAuth'

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateAdminRequest(request)
    return NextResponse.json({ email: user.orderNotificationEmail || null })
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateAdminRequest(request)
    const { email } = (await request.json().catch(() => ({}))) as { email?: string }

    const normalized = email?.trim()
    if (normalized && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
      return NextResponse.json({ message: 'Некорректный email' }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { orderNotificationEmail: normalized || null },
    })

    return NextResponse.json({ email: normalized || null })
  } catch {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
  }
}
