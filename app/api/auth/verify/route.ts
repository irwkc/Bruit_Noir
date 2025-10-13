import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { userId, code } = await request.json()

    if (!userId || !code) {
      return NextResponse.json(
        { error: 'Не указан userId или код' },
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

    // Check if code expired
    if (!user.verificationExpires || user.verificationExpires < new Date()) {
      return NextResponse.json(
        { error: 'Код истек. Запросите новый код.' },
        { status: 400 }
      )
    }

    // Check attempts
    if (user.verificationAttempts >= 3) {
      return NextResponse.json(
        { error: 'Превышено количество попыток. Запросите новый код.' },
        { status: 429 }
      )
    }

    // Check code
    if (user.verificationCode !== code) {
      // Increment attempts
      await prisma.user.update({
        where: { id: userId },
        data: {
          verificationAttempts: user.verificationAttempts + 1,
        },
      })

      const attemptsLeft = 3 - (user.verificationAttempts + 1)
      return NextResponse.json(
        { error: `Неверный код. Осталось попыток: ${attemptsLeft}` },
        { status: 400 }
      )
    }

    // Verify user
    await prisma.user.update({
      where: { id: userId },
      data: {
        emailVerified: new Date(),
        verificationCode: null,
        verificationExpires: null,
        verificationAttempts: 0,
      },
    })

    return NextResponse.json(
      { message: 'Email успешно подтвержден!' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error verifying code:', error)
    return NextResponse.json(
      { error: 'Ошибка при проверке кода' },
      { status: 500 }
    )
  }
}

