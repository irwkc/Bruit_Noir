import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Не указан userId' },
        { status: 400 }
      )
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Пользователь не найден' },
        { status: 404 }
      )
    }

    // Check if already verified
    if (user.emailVerified) {
      return NextResponse.json(
        { error: 'Email уже подтвержден' },
        { status: 400 }
      )
    }

    // Check cooldown (2 minutes)
    if (user.lastCodeSentAt) {
      const timeSinceLastCode = Date.now() - user.lastCodeSentAt.getTime()
      if (timeSinceLastCode < 120000) { // 2 minutes in milliseconds
        const waitTime = Math.ceil((120000 - timeSinceLastCode) / 1000)
        return NextResponse.json(
          { error: `Подождите ${waitTime} секунд перед повторной отправкой кода` },
          { status: 429 }
        )
      }
    }

    // Generate new code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Update user
    await prisma.user.update({
      where: { id: userId },
      data: {
        verificationCode,
        verificationExpires: expiresAt,
        verificationAttempts: 0,
        lastCodeSentAt: new Date(),
      },
    })

    // Send email
    const emailResult = await sendVerificationEmail(user.email, verificationCode, user.name || undefined)

    if (!emailResult.success) {
      return NextResponse.json(
        { error: 'Не удалось отправить код. Попробуйте позже.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { message: 'Новый код отправлен на email' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error resending code:', error)
    return NextResponse.json(
      { error: 'Ошибка при отправке кода' },
      { status: 500 }
    )
  }
}

