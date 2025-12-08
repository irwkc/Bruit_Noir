'use client'

import { usePathname } from 'next/navigation'
import MobileHeader from './Header'
import MobileFooter from './Footer'
import MarqueeBanner from '@/components/MarqueeBanner'
import React from 'react'

interface MobileSiteChromeProps {
  children: React.ReactNode
}

export default function MobileSiteChrome({ children }: MobileSiteChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')
  const isAuthPage = pathname.startsWith('/auth')

  if (isAdminRoute) {
    return <div className="flex min-h-dvh flex-col bg-black">{children}</div>
  }

  // Страницы входа/регистрации рендерятся без SiteChrome (у них свой фон)
  if (isAuthPage) {
    return <>{children}</>
  }

  return (
    <div className="relative min-h-dvh bg-black">
      {/* Анимированный фон */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none" style={{ zIndex: 0 }}>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-900 via-black to-black"></div>
        <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-gray-800 rounded-full mix-blend-screen filter blur-[120px] opacity-40 animate-blob"></div>
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-gray-700 rounded-full mix-blend-screen filter blur-[100px] opacity-35 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/4 left-1/2 w-[550px] h-[550px] bg-gray-800 rounded-full mix-blend-screen filter blur-[110px] opacity-40 animate-blob animation-delay-4000"></div>
        <div className="absolute bottom-1/2 right-1/2 w-[450px] h-[450px] bg-gray-900 rounded-full mix-blend-screen filter blur-[90px] opacity-30 animate-blob animation-delay-6000"></div>
      </div>

      <div className="relative flex flex-col min-h-dvh" style={{ zIndex: 10 }}>
      <MarqueeBanner />
      <MobileHeader />
      <main className="flex-1">{children}</main>
      <MobileFooter />
      </div>
    </div>
  )
}
