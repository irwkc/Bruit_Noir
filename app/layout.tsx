import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import MobileSiteChrome from '@/components/mobile/SiteChrome'
import { Providers } from './providers'
import CdekScripts from '@/components/CdekScripts'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: 'Bruit Noir - Современный бренд одежды',
  description: 'Стильная и качественная одежда для настоящих ценителей моды',
  icons: {
    icon: [
      { url: '/favicon.png?v=2', type: 'image/png' },
      { url: '/icon.png?v=2', type: 'image/png', sizes: 'any' },
    ],
    shortcut: ['/favicon.png?v=2'],
    apple: [{ url: '/apple-touch-icon.png?v=2', sizes: '180x180', type: 'image/png' }],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru" className="bg-black">
      <body className={`${inter.className} flex flex-col min-h-dvh bg-black`}>
        <CdekScripts />
        <Providers>
          {/* Desktop version */}
          <div className="hidden md:block">
            <SiteChrome>{children}</SiteChrome>
          </div>
          {/* Mobile version */}
          <div className="block md:hidden">
            <MobileSiteChrome>{children}</MobileSiteChrome>
          </div>
        </Providers>
      </body>
    </html>
  )
}
