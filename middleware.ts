import { NextResponse } from 'next/server'

export default function middleware(req: any) {
  const { pathname } = req.nextUrl

  // Временное отключение админ-редиректов (борьба с петлями)
  if (pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Пользовательские маршруты больше не проверяем здесь

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

