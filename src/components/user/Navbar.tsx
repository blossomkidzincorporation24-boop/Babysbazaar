'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
} from 'lucide-react'
import MobileBottomNav from '@/components/user/MobileBottomNav'

interface NavbarProps {
  whatsappNumber?: string | null
}

export default function Navbar({ whatsappNumber }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  const cleanWhatsApp = whatsappNumber?.replace(/\D/g, '') || '919965512123'
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hi Baby's Bazaar, I want to inquire about your products.")}`

  // Scroll listener for dynamic sticky header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`)
      setMobileMenuOpen(false)
    }
  }

  // Direct navigation links
  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'About', href: '/about-us' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      <header className={`sticky top-0 z-[1000] w-full transition-all duration-300 bg-white ${
        isScrolled ? 'shadow-md bg-white/95 backdrop-blur-md py-1' : 'py-2'
      }`}>
        {/* MAIN DYNAMIC NAVBAR CARD */}
        <div className="px-2 sm:px-4">
          <div className="max-w-[1340px] mx-auto bg-white rounded-2xl sm:rounded-3xl shadow-xs border border-gray-100 px-3 sm:px-6 py-2 sm:py-3 flex items-center justify-between gap-3 sm:gap-6 transition-all">
            
            {/* LEFT: Logo & New Arrivals Badge */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              <Link href="/" className="flex items-center gap-2 hover:opacity-95 transition-opacity">
                <div className="relative w-28 sm:w-36 h-10 sm:h-12">
                  <Image
                    src="/logo.png"
                    alt="Baby's Bazaar"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>

              {/* Cute Yellow Badge "⭐ New Arrivals 🌟" */}
              <Link
                href="/category/new-clothings"
                className="hidden xl:flex items-center gap-1.5 bg-[#FFF9E6] border border-[#FDE68A] hover:bg-[#FFF3C4] text-[#D97706] font-bold text-xs px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-[#D97706]" />
                <span>New Arrivals</span>
                <span className="text-[10px]">✨</span>
              </Link>
            </div>

            {/* CENTER: Direct Navigation Links */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : link.href === '/about-us'
                    ? pathname === '/about-us' || pathname === '/about'
                    : link.href === '/contact'
                    ? pathname === '/contact' || pathname === '/contact-us'
                    : pathname.startsWith('/category') || pathname.startsWith('/categories')
                return (
                  <Link
                    key={link.label}
                    href={link.href}
                    className={`text-sm xl:text-[15px] font-semibold transition-colors relative py-1 ${
                      isActive
                        ? 'text-[#FF2E63]'
                        : 'text-gray-700 hover:text-[#FF2E63]'
                    }`}
                  >
                    <span>{link.label}</span>
                    {isActive && (
                      <span className="absolute bottom-0 left-0 right-0 h-[3px] bg-[#FF2E63] rounded-full" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* RIGHT: Search Bar & Shop Now Action Button */}
            <div className="flex items-center gap-3 sm:gap-4 shrink-0">
              {/* Search Input */}
              <form onSubmit={handleSearch} className="relative hidden md:block">
                <input
                  type="text"
                  placeholder="Search cute things..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 lg:w-56 pl-9 pr-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E63]/30 transition-all"
                />
                <Search
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF2E63]"
                />
              </form>

              {/* Primary Action Button: "🛍️ Shop Now" Pill Button */}
              <Link
                href="/categories"
                className="bg-[#FF2E63] hover:bg-[#e02052] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold px-4 sm:px-5 py-2 sm:py-2.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>Shop Now</span>
              </Link>

              {/* Mobile Hamburger Toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 text-gray-700 hover:text-[#FF2E63] lg:hidden cursor-pointer"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>

          {/* MOBILE DRAWER MENU */}
          {mobileMenuOpen && (
            <div className="lg:hidden mt-2 bg-white rounded-2xl border border-gray-100 shadow-xl p-5 space-y-4 animate-in fade-in slide-in-from-top-2">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search cute things..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 rounded-full bg-gray-100 border border-gray-200 text-xs text-gray-700"
                />
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF2E63]" />
              </form>

              <div className="flex flex-col gap-2 pt-1 border-t border-gray-100">
                <Link
                  href="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63]"
                >
                  Home
                </Link>
                <Link
                  href="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63]"
                >
                  Categories
                </Link>
                <Link
                  href="/category/new-clothings"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63]"
                >
                  ✨ New Arrivals
                </Link>
                <Link
                  href="/about-us"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63]"
                >
                  About Us
                </Link>
                <Link
                  href="/contact"
                  onClick={() => setMobileMenuOpen(false)}
                  className="py-2 px-3 rounded-lg text-sm font-semibold text-gray-800 hover:bg-pink-50 hover:text-[#FF2E63]"
                >
                  Contact Us
                </Link>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold text-center shadow-xs"
                >
                  WhatsApp Us
                </a>
                <Link
                  href="/categories"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2.5 rounded-full bg-[#FF2E63] text-white text-xs font-semibold text-center shadow-xs"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Sticky Mobile Bottom Navigation Bar */}
      <MobileBottomNav whatsappNumber={whatsappNumber} />
    </>
  )
}
