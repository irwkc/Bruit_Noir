'use client'

import { usePathname } from 'next/navigation'
import MobileHeader from './Header'
import MobileFooter from './Footer'
import React from 'react'

interface MobileSiteChromeProps {
  children: React.ReactNode
}

export default function MobileSiteChrome({ children }: MobileSiteChromeProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname.startsWith('/admin')

  if (isAdminRoute) {
    return <div className="flex min-h-dvh flex-col bg-black">{children}</div>
  }

  return (
    <div className="flex min-h-dvh flex-col bg-black">
      <MobileHeader />
      <main className="flex-1">{children}</main>
      <MobileFooter />
    </div>
  )
}
