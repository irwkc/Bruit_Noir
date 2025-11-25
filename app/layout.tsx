import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import SiteChrome from '@/components/SiteChrome'
import MobileSiteChrome from '@/components/mobile/SiteChrome'
import { Providers } from './providers'
import Script from 'next/script'

const inter = Inter({ 
  subsets: ['latin', 'cyrillic'],
  display: 'swap', // Оптимизация загрузки шрифтов
  preload: true,
})

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
    <html lang="ru">
      <body className={`${inter.className} flex flex-col min-h-dvh`}>
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
              m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
              m[i].l=1*new Date();
              for (var j = 0; j < document.scripts.length; j++) {
                if (document.scripts[j].src === r) { return; }
              }
              k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=105470314', 'ym');

            ym(105470314, 'init', {
              ssr:true,
              webvisor:true,
              clickmap:true,
              ecommerce:"dataLayer",
              accurateTrackBounce:true,
              trackLinks:true
            });
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/105470314" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
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
