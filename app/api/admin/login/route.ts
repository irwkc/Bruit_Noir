import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { buildTotpAssets, generateTotpSecret, verifyTotp } from '@/lib/totp'
import { createAccessToken, createRefreshToken } from '@/lib/adminTokens'

function unauthorized(message = 'Неверный логин или пароль') {
  return NextResponse.json({ message }, { status: 401 })
}

export async function POST(request: NextRequest) {
  const { email, password, code } = (await request.json().catch(() => ({}))) as {
    email?: string
    password?: string
    code?: string
  }

  if (!email || !password) {
    return NextResponse.json({ message: 'Укажите email и пароль' }, { status: 400 })
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.role !== 'admin' || !user.password) {
    return unauthorized()
  }

  const passwordOk = await bcrypt.compare(password, user.password)
  if (!passwordOk) {
    return unauthorized()
  }

  // Handle TOTP bootstrap / verification
  if (!user.totpEnabled) {
    if (!user.totpSecret) {
      const { secret, otpauth, qrCodeDataUrl } = await generateTotpSecret(email)
      await prisma.user.update({ where: { id: user.id }, data: { totpSecret: secret } })
      return NextResponse.json(
        {
          requiresTotpSetup: true,
          message: 'Сканируйте QR-код и введите шестизначный код из Google Authenticator',
          qrCodeDataUrl,
          otpauthUrl: otpauth,
        },
        { status: 202 }
      )
    }

    if (!code) {
      const { qrCodeDataUrl, otpauth } = await buildTotpAssets(email, user.totpSecret)
      return NextResponse.json(
        {
          requiresTotpSetup: true,
          message: 'Введите код из Google Authenticator, чтобы завершить подключение 2FA',
          qrCodeDataUrl,
          otpauthUrl: otpauth,
        },
        { status: 202 }
      )
    }

    const valid = verifyTotp(user.totpSecret, code)
    if (!valid) {
      return NextResponse.json({ message: 'Неверный код подтверждения' }, { status: 400 })
    }

    await prisma.user.update({ where: { id: user.id }, data: { totpEnabled: true } })
  } else {
    if (!code) {
      return NextResponse.json({ message: 'Введите код из Google Authenticator' }, { status: 400 })
    }

    if (!user.totpSecret || !verifyTotp(user.totpSecret, code)) {
      return NextResponse.json({ message: 'Неверный одноразовый код' }, { status: 401 })
    }
  }

  const accessToken = createAccessToken(user.id, user.email, user.role)
  const refreshToken = createRefreshToken(user.id, user.email, user.role)

  const response = NextResponse.json({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  })

  response.cookies.set('admin_access_token', accessToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 15,
    path: '/',
  })

  response.cookies.set('admin_refresh_token', refreshToken, {
    httpOnly: true,
    sameSite: 'lax',
    secure: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
  })

  response.cookies.delete('admin_token')

  return response
}


