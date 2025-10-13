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
      // Avoid redirect loops: rewrite /admin to login to keep URL stable
      if (pathname === '/admin') {
        return NextResponse.rewrite(new URL('/admin/login', req.url))
      }
      // For any other /admin/* path - send to login
      if (pathname !== '/admin/login') {
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      return NextResponse.next()
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

