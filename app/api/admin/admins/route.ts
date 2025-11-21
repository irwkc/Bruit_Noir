import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/adminAuth'

// GET - список всех админов
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request)
    if (!user || !user.isSuperAdmin) {
      return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 })
    }

    const admins = await prisma.user.findMany({
      where: { role: 'admin' },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        totpEnabled: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ admins })
  } catch (error) {
    console.error('Error fetching admins:', error)
    return NextResponse.json({ message: 'Ошибка при получении списка админов' }, { status: 500 })
  }
}

// POST - создание нового админа
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request)
    if (!user || !user.isSuperAdmin) {
      return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 })
    }

    const { email, password, name } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ message: 'Укажите email и пароль' }, { status: 400 })
    }

    // Проверяем, не существует ли уже пользователь с таким email
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ message: 'Пользователь с таким email уже существует' }, { status: 400 })
    }

    // Хешируем пароль
    const hashedPassword = await bcrypt.hash(password, 10)

    // Создаём нового админа
    const newAdmin = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || null,
        role: 'admin',
        isSuperAdmin: false,
      },
      select: {
        id: true,
        email: true,
        name: true,
        isSuperAdmin: true,
        totpEnabled: true,
        createdAt: true,
      },
    })

    return NextResponse.json({ admin: newAdmin, message: 'Админ успешно создан' })
  } catch (error) {
    console.error('Error creating admin:', error)
    return NextResponse.json({ message: 'Ошибка при создании админа' }, { status: 500 })
  }
}

// DELETE - удаление админа
export async function DELETE(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request)
    if (!user || !user.isSuperAdmin) {
      return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const adminId = searchParams.get('id')

    if (!adminId) {
      return NextResponse.json({ message: 'Укажите ID админа' }, { status: 400 })
    }

    // Нельзя удалить самого себя
    if (adminId === user.id) {
      return NextResponse.json({ message: 'Нельзя удалить самого себя' }, { status: 400 })
    }

    // Нельзя удалить другого суперадмина
    const targetAdmin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { isSuperAdmin: true },
    })

    if (targetAdmin?.isSuperAdmin) {
      return NextResponse.json({ message: 'Нельзя удалить главного админа' }, { status: 400 })
    }

    // Удаляем админа
    await prisma.user.delete({
      where: { id: adminId, role: 'admin' },
    })

    return NextResponse.json({ message: 'Админ успешно удалён' })
  } catch (error) {
    console.error('Error deleting admin:', error)
    return NextResponse.json({ message: 'Ошибка при удалении админа' }, { status: 500 })
  }
}

