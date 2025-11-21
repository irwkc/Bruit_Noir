import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyToken } from './adminTokens'

export async function authenticateAdminRequest(request: NextRequest) {
  const bearer = request.headers.get('authorization')
  let token: string | undefined

  if (bearer?.startsWith('Bearer ')) {
    token = bearer.slice(7)
  } else {
    token = request.cookies.get('admin_access_token')?.value
  }

  if (!token) {
    throw new Error('Требуется авторизация')
  }

  const payload = verifyToken(token, 'access')
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })

  if (!user || user.role !== 'admin') {
    throw new Error('Недостаточно прав')
  }

  return user
}

export async function authenticateAdminToken(token: string) {
  const payload = verifyToken(token, 'access')
  const user = await prisma.user.findUnique({ where: { id: payload.sub } })

  if (!user || user.role !== 'admin') {
    throw new Error('Недостаточно прав')
  }

  return user
}

export async function verifyAdminToken(request: NextRequest) {
  try {
    return await authenticateAdminRequest(request)
  } catch {
    return null
  }
}
