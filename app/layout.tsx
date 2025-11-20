import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import MobileSiteChrome from '@/components/mobile/SiteChrome'
import { Providers } from './providers'

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
        <Script
          src="https://api-maps.yandex.ru/2.1/?apikey=f366a46d-5c10-4875-a6ee-263f3678b026&lang=ru_RU"
          strategy="afterInteractive"
        />
        <Script
          src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
          strategy="afterInteractive"
          onLoad={() => {
            window.dispatchEvent(new Event('cdek-widget-ready'))
          }}
        />
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
