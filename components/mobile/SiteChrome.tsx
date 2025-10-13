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
    return <>{children}</>
  }

  return (
    <>
      <MobileHeader />
      {children}
      <MobileFooter />
    </>
  )
}
