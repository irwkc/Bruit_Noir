import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getSiteLockStatus } from '@/lib/siteLockCache'
// Initialize cache on module load
import '@/lib/initSiteLockCache'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Пропускаем админку, API, статические файлы
  if (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/icon') ||
    pathname === '/site-unlock'
  ) {
    return NextResponse.next()
  }

  // Проверяем закрытый режим из кэша (без запроса к БД)
  try {
    const siteLocked = await getSiteLockStatus()
    
    if (siteLocked) {
      // Проверяем cookie доступа
      const unlocked = request.cookies.get('site_unlocked')?.value === 'true'
      
      if (!unlocked) {
        // Редиректим на страницу ввода пароля
        const url = request.nextUrl.clone()
        url.pathname = '/site-unlock'
        return NextResponse.redirect(url)
      }
    }
  } catch (error) {
    // В случае ошибки пропускаем (чтобы не сломать сайт)
    console.error('Middleware error:', error)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|icon).*)'],
}

