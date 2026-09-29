'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Home, ShoppingBag, Search, Menu, MessageCircle, X } from 'lucide-react'

interface MobileBottomNavProps {
  whatsappNumber?: string | null
}

export default function MobileBottomNav({ whatsappNumber }: MobileBottomNavProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const cleanWhatsApp = whatsappNumber?.replace(/\D/g, '') || '919965512123'
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hi Baby's Bazaar, I want to inquire about your products.")}`

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
    }
  }

  return (
    <>
      {/* Search Overlay Drawer */}
      {searchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-start pt-16 px-4 sm:hidden animate-in fade-in duration-150">
          <div className="w-full bg-white rounded-2xl p-4 shadow-xl border border-pink-100 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900">Search Products</h3>
              <button
                onClick={() => setSearchOpen(false)}
                className="p-1 text-gray-500 hover:text-black rounded-lg cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
                aria-label="Close search"
              >
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search cute things..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-full bg-[#FAF0F4] border border-pink-200 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E63]"
              />
              <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#FF2E63]" />
            </form>
          </div>
        </div>
      )}

      {/* Menu Overlay Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex flex-col justify-end sm:hidden animate-in fade-in duration-150">
          <div className="w-full bg-white rounded-t-3xl p-6 shadow-2xl border-t border-pink-100 space-y-4 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="font-roboto-slab text-base font-bold text-[#FF2E63]">Baby&apos;s Bazaar</span>
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 text-gray-500 hover:text-black min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                aria-label="Close menu"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex flex-col gap-1">
              <Link
                href="/"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63] flex items-center gap-3"
              >
                <Home size={18} className="text-[#FF2E63]" />
                <span>Home</span>
              </Link>
              <Link
                href="/categories"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63] flex items-center gap-3"
              >
                <ShoppingBag size={18} className="text-[#FF2E63]" />
                <span>All Categories</span>
              </Link>
              <Link
                href="/category/new-clothings"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63] flex items-center gap-3"
              >
                <span className="text-base">✨</span>
                <span>New Arrivals</span>
              </Link>
              <Link
                href="/about-us"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63] flex items-center gap-3"
              >
                <span className="text-base">ℹ️</span>
                <span>About Us</span>
              </Link>
              <Link
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="py-3 px-4 rounded-xl text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63] flex items-center gap-3"
              >
                <span className="text-base">📞</span>
                <span>Contact Us</span>
              </Link>
            </div>

            <div className="pt-2">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-3 rounded-full bg-[#25D366] text-white text-sm font-semibold flex items-center justify-center gap-2 shadow-xs cursor-pointer min-h-[44px]"
              >
                <MessageCircle size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Sticky Bottom Navigation Bar (Mobile only) */}
      <nav
        aria-label="Mobile Bottom Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-pink-100 sm:hidden flex items-center justify-around py-1 px-1 shadow-lg"
      >
        {/* 1. Home */}
        <Link
          href="/"
          className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            pathname === '/' ? 'text-[#FF2E63] font-semibold' : 'text-gray-600 hover:text-[#FF2E63]'
          }`}
          aria-label="Home"
        >
          <Home size={20} className={pathname === '/' ? 'stroke-[2.2]' : ''} />
          <span>Home</span>
        </Link>

        {/* 2. Shop */}
        <Link
          href="/categories"
          className={`flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors ${
            pathname.startsWith('/category') || pathname.startsWith('/categories')
              ? 'text-[#FF2E63] font-semibold'
              : 'text-gray-600 hover:text-[#FF2E63]'
          }`}
          aria-label="Shop Categories"
        >
          <ShoppingBag size={20} className={pathname.startsWith('/category') ? 'stroke-[2.2]' : ''} />
          <span>Shop</span>
        </Link>

        {/* 3. Search */}
        <button
          onClick={() => setSearchOpen(true)}
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-gray-600 hover:text-[#FF2E63] transition-colors cursor-pointer"
          aria-label="Search"
        >
          <Search size={20} />
          <span>Search</span>
        </button>

        {/* 4. WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-[#25D366] hover:text-[#20BD5A] transition-colors cursor-pointer"
          aria-label="WhatsApp"
        >
          <div className="w-6 h-6 rounded-full bg-[#25D366] text-white flex items-center justify-center">
            <MessageCircle size={15} />
          </div>
          <span>WhatsApp</span>
        </a>

        {/* 5. Menu */}
        <button
          onClick={() => setMenuOpen(true)}
          className="flex-1 min-w-[44px] min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium text-gray-600 hover:text-[#FF2E63] transition-colors cursor-pointer"
          aria-label="Menu"
        >
          <Menu size={20} />
          <span>Menu</span>
        </button>
      </nav>
    </>
  )
}
