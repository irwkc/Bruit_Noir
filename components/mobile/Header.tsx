'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { ShoppingCartIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import Image from 'next/image'

export default function MobileHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <header className="bg-black text-white sticky top-0 z-50 md:hidden">
      <nav className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo - smaller for mobile */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Bruit Noir"
              width={120}
              height={26}
              className="h-6 w-auto"
              priority
            />
          </Link>

          {/* Icons - compact layout */}
          <div className="flex items-center space-x-3">
            <Link href="/profile" className="p-2 hover:bg-gray-800 rounded-full transition">
              <UserIcon className="h-5 w-5" />
            </Link>
            <Link href="/cart" className="relative p-2 hover:bg-gray-800 rounded-full transition">
              <ShoppingCartIcon className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="p-2 hover:bg-gray-800 rounded-full transition"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3Icon className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="mt-4 pb-4 border-t border-gray-800">
            <div className="pt-4 space-y-3">
              <Link
                href="/catalog"
                className="block py-2 text-sm font-medium hover:text-gray-300 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Каталог
              </Link>
              <Link
                href="/about"
                className="block py-2 text-sm font-medium hover:text-gray-300 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                О бренде
              </Link>
              <Link
                href="/contact"
                className="block py-2 text-sm font-medium hover:text-gray-300 transition"
                onClick={() => setMobileMenuOpen(false)}
              >
                Контакты
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
