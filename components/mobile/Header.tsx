'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import {
  ShoppingCartIcon,
  UserIcon,
  Bars3Icon,
  Squares2X2Icon,
  InformationCircleIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline'
import { useState, type ComponentProps, type ComponentType } from 'react'
import Image from 'next/image'

export default function MobileHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  type MenuItem = {
    label: string
    href: string
    icon: ComponentType<ComponentProps<'svg'>>
  }

  const menuItems: MenuItem[] = [
    { label: 'Каталог', href: '/catalog', icon: Squares2X2Icon },
    { label: 'О бренде', href: '/about', icon: InformationCircleIcon },
    { label: 'Контакты', href: '/contact', icon: EnvelopeIcon },
  ]

  return (
    <header className="sticky top-0 z-50 md:hidden bg-black text-white">
      <nav className="py-3 border-b border-white/10">
        <div className="flex items-center justify-between min-h-[36px] px-4">
          {/* Logo - smaller for mobile */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo_header.png"
              alt="Bruit Noir"
              width={180}
              height={39}
              className="h-[36px] w-auto"
              priority
            />
          </Link>

          {/* Icons - compact layout */}
          <div className="flex items-center space-x-3">
            <Link
              href="/profile"
              className="p-2.5 bg-white/5 border border-white/15 rounded-full hover:bg-white/10 transition"
            >
              <UserIcon className="h-5 w-5" />
            </Link>
            <Link
              href="/cart"
              className="relative p-2.5 bg-white/5 border border-white/15 rounded-full hover:bg-white/10 transition"
            >
              <ShoppingCartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className={`p-2.5 rounded-full border border-white/15 transition ${
                mobileMenuOpen ? 'bg-white/20' : 'bg-white/5 hover:bg-white/10'
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="px-4 pt-4 pb-6">
            <div className="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-2xl p-4 space-y-2 shadow-2xl">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold hover:bg-white/10 transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span>{item.label}</span>
                    </div>
                    <span className="text-xs text-gray-300">→</span>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
