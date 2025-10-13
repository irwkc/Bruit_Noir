import { auth } from '@/auth'
import { NextResponse } from 'next/server'

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user && (req.auth.user as any).role === 'admin'
  const { pathname } = req.nextUrl

  // Protect admin routes
  if (pathname.startsWith('/admin')) {
    // Always require admin role; otherwise show sign-in with return to /admin
    if (!isLoggedIn || !isAdmin) {
      const url = new URL('/auth/signin', req.url)
      url.searchParams.set('callbackUrl', '/admin')
      return NextResponse.redirect(url)
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

