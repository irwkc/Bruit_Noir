import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

// POST - проверка пароля для доступа к сайту
export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ message: 'Введите пароль' }, { status: 400 })
    }

    const settings = await prisma.siteSettings.findFirst()

    if (!settings || !settings.siteLocked || !settings.siteLockPassword) {
      return NextResponse.json({ message: 'Закрытый режим не активен' }, { status: 400 })
    }

    const passwordOk = await bcrypt.compare(password, settings.siteLockPassword)

    if (!passwordOk) {
      return NextResponse.json({ message: 'Неверный пароль' }, { status: 401 })
    }

    // Устанавливаем cookie для доступа (действует 30 дней)
    const cookieStore = await cookies()
    cookieStore.set('site_unlocked', 'true', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 дней
    })

    return NextResponse.json({ success: true, message: 'Доступ разрешён' })
  } catch (error) {
    console.error('Error unlocking site:', error)
    return NextResponse.json({ message: 'Ошибка при проверке пароля' }, { status: 500 })
  }
}

// GET - проверка, разблокирован ли сайт
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const unlocked = cookieStore.get('site_unlocked')?.value === 'true'

    return NextResponse.json({ unlocked })
  } catch (error) {
    return NextResponse.json({ unlocked: false })
  }
}

