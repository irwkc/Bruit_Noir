import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { verifyAdminToken } from '@/lib/adminAuth'
import { refreshSiteLockCache, setSiteLockStatus } from '@/lib/siteLockCache'
// Initialize cache on module load
import '@/lib/initSiteLockCache'

// GET - получить статус закрытого режима
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request)
    if (!user) {
      return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 })
    }

    // Используем кэш, но обновляем его на всякий случай
    await refreshSiteLockCache()
    
    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      // Создаём настройки по умолчанию, если их нет
      settings = await prisma.siteSettings.create({
        data: {
          siteLocked: false,
          siteLockPassword: null,
        },
      })
      setSiteLockStatus(false)
    }

    return NextResponse.json({
      siteLocked: settings.siteLocked,
      // Не возвращаем пароль в открытом виде
    })
  } catch (error) {
    console.error('Error fetching site lock status:', error)
    return NextResponse.json({ message: 'Ошибка при получении статуса' }, { status: 500 })
  }
}

// POST - включить/выключить закрытый режим
export async function POST(request: NextRequest) {
  try {
    const user = await verifyAdminToken(request)
    if (!user) {
      return NextResponse.json({ message: 'Доступ запрещён' }, { status: 403 })
    }

    const { siteLocked, password } = await request.json()

    if (typeof siteLocked !== 'boolean') {
      return NextResponse.json({ message: 'Укажите статус закрытого режима' }, { status: 400 })
    }

    let settings = await prisma.siteSettings.findFirst()

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {
          siteLocked: false,
          siteLockPassword: null,
        },
      })
    }

    let hashedPassword = settings.siteLockPassword

    // Если включаем режим, нужен пароль
    if (siteLocked) {
      // Если пароль не передан, но режим включается, используем существующий пароль
      if (password && password.length > 0) {
        if (password.length < 4) {
          return NextResponse.json({ message: 'Пароль должен быть не менее 4 символов' }, { status: 400 })
        }
        hashedPassword = await bcrypt.hash(password, 10)
      } else if (!settings.siteLockPassword) {
        // Если пароля нет и новый не передан, требуем пароль
        return NextResponse.json({ message: 'При включении режима требуется пароль' }, { status: 400 })
      }
      // Если пароль не передан, но есть существующий - оставляем его
    } else {
      // Если выключаем, очищаем пароль
      hashedPassword = null
    }

    const updated = await prisma.siteSettings.update({
      where: { id: settings.id },
      data: {
        siteLocked,
        siteLockPassword: hashedPassword,
      },
    })

    // Обновляем кэш в памяти сразу после изменения в БД
    setSiteLockStatus(updated.siteLocked)
    console.log('Site lock updated:', { siteLocked: updated.siteLocked, cacheUpdated: true })

    return NextResponse.json({
      siteLocked: updated.siteLocked,
      message: siteLocked ? 'Закрытый режим включён' : 'Закрытый режим выключен',
    })
  } catch (error) {
    console.error('Error updating site lock:', error)
    return NextResponse.json({ message: 'Ошибка при обновлении настроек' }, { status: 500 })
  }
}

