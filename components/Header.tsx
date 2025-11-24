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
    <header className="bg-black text-white sticky top-0 z-50">
      <nav className="border-b border-transparent">
        <div className="flex min-h-[60px] items-center justify-between py-2 px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <Image
                src="/logo_header.jpeg"
                alt="Bruit Noir"
                width={300}
                height={66}
                className="h-[60px] w-auto"
                priority
              />
            </Link>
          </div>

          {/* Desktop Navigation (removed per request) */}
          <div className="hidden md:flex md:items-center md:space-x-8" />

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

        {/* Mobile Menu (removed per request) */}
        {mobileMenuOpen && <div className="md:hidden py-4 space-y-2" />}
      </nav>
    </header>
  )
}

