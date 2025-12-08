'use client'

import Link from 'next/link'

export default function MarqueeBanner() {
  const text = 'Следите за развитием бренда в нашем телеграм канале'
  const telegramUrl = 'https://t.me/bruitnoir_co'
  
  // Дублируем контент для бесшовной анимации
  const content = (
    <Link 
      href={telegramUrl} 
      target="_blank" 
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors px-8"
    >
      <span>{text}</span>
      <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.295-.6.295-.002 0-.003 0-.005 0l.213-3.054 5.56-5.022c.24-.213-.054-.334-.373-.12l-6.87 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.941z"/>
      </svg>
    </Link>
  )

  return (
    <div className="relative w-full h-8 bg-black/60 backdrop-blur-sm border-b border-white/10 overflow-hidden z-50">
      <div className="absolute inset-0 flex items-center">
        <div className="flex animate-marquee whitespace-nowrap">
          {content}
          {content}
        </div>
      </div>
    </div>
  )
}

