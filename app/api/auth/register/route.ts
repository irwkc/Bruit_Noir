import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { generateVerificationCode, sendVerificationEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      // If user exists but not verified, allow resending code
      if (!existingUser.emailVerified) {
        // Check if can resend (2 minutes cooldown)
        if (existingUser.lastCodeSentAt) {
          const timeSinceLastCode = Date.now() - existingUser.lastCodeSentAt.getTime()
          if (timeSinceLastCode < 120000) { // 2 minutes in milliseconds
            const waitTime = Math.ceil((120000 - timeSinceLastCode) / 1000)
            return NextResponse.json(
              { error: `Подождите ${waitTime} секунд перед повторной отправкой кода` },
              { status: 429 }
            )
          }
        }

        // Generate new code and send
        const verificationCode = generateVerificationCode()
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            verificationCode,
            verificationExpires: expiresAt,
            verificationAttempts: 0,
            lastCodeSentAt: new Date(),
          },
        })

        await sendVerificationEmail(email, verificationCode, name)

        return NextResponse.json(
          { 
            message: 'Код подтверждения отправлен повторно',
            userId: existingUser.id,
            requiresVerification: true
          },
          { status: 200 }
        )
      }

      return NextResponse.json(
        { error: 'Пользователь с таким email уже существует' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Generate verification code
    const verificationCode = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        verificationCode,
        verificationExpires: expiresAt,
        lastCodeSentAt: new Date(),
      },
    })

    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode, name)

    if (!emailResult.success) {
      // Delete user if email failed
      await prisma.user.delete({ where: { id: user.id } })
      return NextResponse.json(
        { error: 'Не удалось отправить код подтверждения. Попробуйте позже.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Код подтверждения отправлен на email',
        userId: user.id,
        requiresVerification: true
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Ошибка при создании пользователя' },
      { status: 500 }
    )
  }
}

