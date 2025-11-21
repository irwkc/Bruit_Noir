'use client'

import Script from 'next/script'

const YANDEX_API_KEY = 'f366a46d-5c10-4875-a6ee-263f3678b026'
const READY_EVENT = 'cdek-widget-ready'

export default function CdekScripts() {
  return (
    <>
      <Script
        src={`https://api-maps.yandex.ru/2.1/?apikey=${YANDEX_API_KEY}&lang=ru_RU`}
        strategy="afterInteractive"
      />
      <Script
        src="https://cdn.jsdelivr.net/npm/@cdek-it/widget@3"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event(READY_EVENT))
          }
        }}
      />
    </>
  )
}

