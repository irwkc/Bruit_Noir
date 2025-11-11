import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createAccessToken, createRefreshToken, verifyToken } from '@/lib/adminTokens'

export async function POST(request: NextRequest) {
  const cookieToken = request.cookies.get('admin_refresh_token')?.value
  const body = (await request.json().catch(() => ({}))) as { refreshToken?: string }
  const refreshToken = body.refreshToken || cookieToken

  if (!refreshToken) {
    return NextResponse.json({ message: 'Refresh token отсутствует' }, { status: 400 })
  }

  try {
    const payload = verifyToken(refreshToken, 'refresh')
    const user = await prisma.user.findUnique({ where: { id: payload.sub } })

    if (!user || user.role !== 'admin') {
      throw new Error('Пользователь не найден')
    }

    const newAccess = createAccessToken(user.id, user.email, user.role)
    const newRefresh = createRefreshToken(user.id, user.email, user.role)

    const response = NextResponse.json({
      accessToken: newAccess,
      refreshToken: newRefresh,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })

    response.cookies.set('admin_access_token', newAccess, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 15,
      path: '/',
    })

    response.cookies.set('admin_refresh_token', newRefresh, {
      httpOnly: true,
      sameSite: 'lax',
      secure: true,
      maxAge: 60 * 60 * 24 * 30,
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Admin refresh error:', error)
    const res = NextResponse.json({ message: 'Недействительный refresh token' }, { status: 401 })
    res.cookies.delete('admin_access_token')
    res.cookies.delete('admin_refresh_token')
    return res
  }
}
