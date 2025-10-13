'use client'

import Link from 'next/link'
import { useCartStore } from '@/lib/store'
import { ShoppingCartIcon, UserIcon, Bars3Icon } from '@heroicons/react/24/outline'
import { useState } from 'react'
import Image from 'next/image'

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const totalItems = useCartStore((state) => state.getTotalItems())

  return (
    <header className="bg-black text-white shadow-lg sticky top-0 z-50">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo.png"
                alt="Bruit Noir"
                width={220}
                height={48}
                className="h-8 w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <Link href="/catalog" className="text-sm font-medium hover:text-gray-300 transition">
              Каталог
            </Link>
            <Link href="/about" className="text-sm font-medium hover:text-gray-300 transition">
              О нас
            </Link>
            <Link href="/contact" className="text-sm font-medium hover:text-gray-300 transition">
              Контакты
            </Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4">
            <Link href="/profile" className="hover:text-gray-300 transition">
              <UserIcon className="h-6 w-6" />
            </Link>
            <Link href="/cart" className="relative hover:text-gray-300 transition">
              <ShoppingCartIcon className="h-6 w-6" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </Link>
            <button
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-2">
            <Link
              href="/catalog"
              className="block px-3 py-2 text-base font-medium hover:bg-gray-900 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Каталог
            </Link>
            <Link
              href="/about"
              className="block px-3 py-2 text-base font-medium hover:bg-gray-900 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              О нас
            </Link>
            <Link
              href="/contact"
              className="block px-3 py-2 text-base font-medium hover:bg-gray-900 rounded-md"
              onClick={() => setMobileMenuOpen(false)}
            >
              Контакты
            </Link>
          </div>
        )}
      </nav>
    </header>
  )
}

