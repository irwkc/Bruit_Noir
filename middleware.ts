import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user && (req.auth.user as any).role === 'admin'
  const { pathname } = req.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Separate admin cookie auth
    const adminToken = req.cookies.get('admin_token')?.value
    if (!adminToken) {
      // Разрешаем /admin (форма входа на этой же странице) и /admin/login
      if (pathname === '/admin' || pathname === '/admin/login') {
        return NextResponse.next()
      }
      // Остальные /admin/* требуют токен — ведём на /admin (логин)
      return NextResponse.redirect(new URL('/admin', req.url))
    }
  }

  // Protect user profile routes
  if (pathname.startsWith('/profile') || pathname.startsWith('/orders')) {
    if (!isLoggedIn) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

