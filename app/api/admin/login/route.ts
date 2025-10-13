import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, password } = await request.json().catch(() => ({ })) as any
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@bruitnoir.local'
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'change-me-now'

  if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    const res = NextResponse.json({ ok: true })
    res.cookies.set('admin_token', 'ok', {
      httpOnly: true,
      path: '/',
      secure: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 8,
    })
    return res
  }

  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
}


