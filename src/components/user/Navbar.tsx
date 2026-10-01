'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  Search,
  Menu,
  X,
  Sparkles,
  ShoppingBag,
  Home,
  ChevronDown,
  ChevronRight,
  MessageCircle,
  Phone,
  Info,
  MapPin,
  Clock,
  Heart,
  Grid,
} from 'lucide-react'
import {
  BUSINESS_NAME,
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_GOOGLE_MAPS_URL,
} from '@/lib/constants'

interface CategoryLink {
  name: string
  href: string
  badge?: string
}

const STORE_CATEGORIES: CategoryLink[] = [
  { name: 'Baby Clothing', href: '/category/clothing' },
  { name: "Baby's Beds & Bedding", href: '/category/baby-bedding-beds' },
  { name: 'Maternity & Nursing', href: '/category/maternity-nursing' },
  { name: 'Baby Safety & Protection', href: '/category/baby-safety-and-protection' },
  { name: 'Baby Feeding Essentials', href: '/category/baby-feeding' },
  { name: 'Baby Bath & Care', href: '/category/baby-bath-care' },
  { name: 'Baby Travel & Strollers', href: '/category/baby-travel-and-strollers' },
  { name: 'Baby Walkers & Ride-Ons', href: '/category/baby-walkers-ride-ons' },
  { name: "Baby's Cycles & Tricycles", href: '/category/baby-cycles-tricycles' },
  { name: '🧸 Kids & Baby Toys', href: '/toys', badge: 'Popular' },
]

interface NavbarProps {
  whatsappNumber?: string | null
}

export default function Navbar({ whatsappNumber }: NavbarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [categoriesExpanded, setCategoriesExpanded] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // Touch swipe handling
  const touchStartX = useRef<number | null>(null)
  const touchCurrentX = useRef<number | null>(null)

  const cleanWhatsApp = whatsappNumber?.replace(/\D/g, '') || BUSINESS_WHATSAPP_NUMBER
  const whatsappUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent("Hi Baby's Bazaar, I want to inquire about your products.")}`

  // Scroll listener for sticky header styling
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Body scroll locking when drawer is open
  useEffect(() => {
    if (drawerOpen) {
      const scrollY = window.scrollY
      document.body.style.position = 'fixed'
      document.body.style.top = `-${scrollY}px`
      document.body.style.width = '100%'
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.position = ''
        document.body.style.top = ''
        document.body.style.width = ''
        document.body.style.overflow = ''
        window.scrollTo(0, scrollY)
      }
    }
  }, [drawerOpen])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) {
        setDrawerOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [drawerOpen])

  // Close drawer on path change
  useEffect(() => {
    setDrawerOpen(false)
  }, [pathname])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/categories?search=${encodeURIComponent(searchQuery.trim())}`)
      setDrawerOpen(false)
      setSearchQuery('')
    }
  }

  // Touch gesture handlers for closing drawer by swiping left
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const diffX = touchStartX.current - touchCurrentX.current
      if (diffX > 60) {
        // Swiped left by at least 60px -> close drawer
        setDrawerOpen(false)
      }
    }
    touchStartX.current = null
    touchCurrentX.current = null
  }

  const navLinks = [
    { label: 'Home', href: '/' },
    { label: 'Categories', href: '/categories' },
    { label: 'Toys', href: '/toys' },
    { label: 'About', href: '/about-us' },
    { label: 'Contact', href: '/contact' },
  ]

  return (
    <>
      {/* ======================================================================= */}
      {/* 1. HEADER (DESKTOP + PURPOSE-BUILT MOBILE)                             */}
      {/* ======================================================================= */}
      <header
        className={`sticky top-0 z-[1000] w-full transition-all duration-200 bg-white ${
          isScrolled ? 'shadow-xs border-b border-gray-100/80 bg-white/95 backdrop-blur-md' : 'border-b border-transparent'
        }`}
      >
        <div className="max-w-[1340px] mx-auto px-3 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-3">
            
            {/* BRAND LOGO */}
            <div className="flex items-center gap-3 shrink-0">
              <Link
                href="/"
                className="flex items-center hover:opacity-95 transition-opacity"
                aria-label="Baby's Bazaar Home"
              >
                <div className="relative w-28 sm:w-36 h-9 sm:h-12">
                  <Image
                    src="/logo.png"
                    alt="Baby's Bazaar"
                    fill
                    className="object-contain"
                    priority
                  />
                </div>
              </Link>

              {/* Desktop Cute Badge "✨ New Arrivals" */}
              <Link
                href="/#new-arrivals"
                className="hidden xl:flex items-center gap-1.5 bg-[#FFF9E6] border border-[#FDE68A] hover:bg-[#FFF3C4] text-[#D97706] font-bold text-xs px-3 py-1.5 rounded-full shadow-2xs transition-all cursor-pointer"
              >
                <Sparkles size={13} className="text-[#D97706]" />
                <span>New Arrivals</span>
                <span className="text-[10px]">✨</span>
              </Link>
            </div>

            {/* DESKTOP NAVIGATION (Hidden on mobile) */}
            <nav className="hidden lg:flex items-center gap-7 xl:gap-9" aria-label="Main Navigation">
              {navLinks.map((link) => {
                const isActive =
                  link.href === '/'
                    ? pathname === '/'
                    : link.href === '/about-us'
                    ? pathname === '/about-us' || pathname === '/about'
                    : link.href === '/contact'
                    ? pathname === '/contact' || pathname === '/contact-us'
                    : link.href === '/toys'
                    ? pathname.startsWith('/toys')
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

            {/* DESKTOP RIGHT ACTIONS (Search & Shop Now) */}
            <div className="hidden lg:flex items-center gap-4 shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products, toys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-48 xl:w-56 pl-9 pr-8 py-2 rounded-full bg-gray-100 border border-gray-200 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E63]/30 transition-all"
                  aria-label="Search products"
                />
                <button
                  type="submit"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[#FF2E63] hover:scale-110 transition-transform cursor-pointer p-0.5"
                  aria-label="Search"
                >
                  <Search size={16} />
                </button>
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer text-xs"
                    aria-label="Clear search"
                  >
                    ✕
                  </button>
                )}
              </form>

              {/* Desktop "Shop Now" */}
              <Link
                href="/categories"
                className="bg-[#FF2E63] hover:bg-[#e02052] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-xs hover:shadow-md transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <ShoppingBag size={15} />
                <span>Shop Now</span>
              </Link>
            </div>

            {/* =================================================================== */}
            {/* MOBILE HEADER RIGHT: CLEAN HAMBURGER BUTTON ONLY (44px TOUCH TARGET) */}
            {/* =================================================================== */}
            <div className="flex lg:hidden items-center">
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-11 h-11 flex items-center justify-center rounded-full text-gray-800 hover:text-[#FF2E63] hover:bg-pink-50/80 active:scale-95 transition-all cursor-pointer -mr-1"
                aria-label="Open menu"
                aria-expanded={drawerOpen}
              >
                <Menu size={26} strokeWidth={2.2} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* 2. INSTAGRAM-STYLE SLIDE-OUT LEFT NAVIGATION DRAWER                     */}
      {/* ======================================================================= */}
      
      {/* Fullscreen Backdrop */}
      <div
        className={`fixed inset-0 z-[1050] bg-black/45 backdrop-blur-[2px] transition-opacity duration-300 ease-out lg:hidden ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* Left Drawer Container */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 left-0 bottom-0 z-[1060] w-[86vw] max-w-[350px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* DRAWER TOP: Brand Header & Close Button */}
        <div className="shrink-0 border-b border-gray-100 px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-3.5 flex items-center justify-between">
          <Link
            href="/"
            onClick={() => setDrawerOpen(false)}
            className="flex items-center gap-2"
          >
            <div className="relative w-28 h-8">
              <Image
                src="/logo.png"
                alt="Baby's Bazaar"
                fill
                className="object-contain"
              />
            </div>
          </Link>

          <button
            type="button"
            onClick={() => setDrawerOpen(false)}
            className="w-10 h-10 -mr-1 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 active:scale-95 transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X size={22} strokeWidth={2.2} />
          </button>
        </div>

        {/* DRAWER SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-none overscroll-contain">
          
          {/* Quick Search in Drawer */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products, toys..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-full bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E63]/30 focus:border-[#FF2E63] transition-all"
              aria-label="Search catalogue"
            />
            <button
              type="submit"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#FF2E63] p-0.5 cursor-pointer"
              aria-label="Search"
            >
              <Search size={15} />
            </button>
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}
          </form>

          {/* PRIMARY NAVIGATION LINKS WITH SUBTLE STAGGER */}
          <nav className="space-y-1 pt-1" aria-label="Mobile Menu Links">
            
            {/* 1. Home */}
            <Link
              href="/"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-pink-50/90 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pathname === '/' ? 'bg-[#FF2E63] text-white' : 'bg-pink-50 text-[#FF2E63]'
              }`}>
                <Home size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">Home</span>
            </Link>

            {/* 2. Shop / All Products */}
            <Link
              href="/categories"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/categories' && !pathname.includes('toys')
                  ? 'bg-pink-50/90 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                pathname === '/categories' ? 'bg-[#FF2E63] text-white' : 'bg-pink-50 text-[#FF2E63]'
              }`}>
                <ShoppingBag size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">Shop All Products</span>
            </Link>

            {/* 3. Expandable Categories Accordion */}
            <div className="rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="w-full flex items-center justify-between gap-3.5 px-3.5 py-3 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63] transition-all cursor-pointer"
                aria-expanded={categoriesExpanded}
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#FF2E63] flex items-center justify-center">
                    <Grid size={17} strokeWidth={2.2} />
                  </div>
                  <span>Categories</span>
                </div>
                <ChevronDown
                  size={16}
                  className={`text-gray-400 transition-transform duration-200 ${
                    categoriesExpanded ? 'rotate-180 text-[#FF2E63]' : ''
                  }`}
                />
              </button>

              {/* Subcategories Accordion Content */}
              {categoriesExpanded && (
                <div className="pl-12 pr-2 py-1.5 space-y-1 bg-gray-50/60 rounded-xl mb-1 border-l-2 border-[#FF2E63]/30 ml-4 animate-in fade-in slide-in-from-top-1 duration-200">
                  {STORE_CATEGORIES.map((cat) => (
                    <Link
                      key={cat.href}
                      href={cat.href}
                      onClick={() => setDrawerOpen(false)}
                      className="flex items-center justify-between py-2 px-2.5 rounded-lg text-xs font-semibold text-gray-700 hover:text-[#FF2E63] hover:bg-white transition-colors"
                    >
                      <span>{cat.name}</span>
                      {cat.badge ? (
                        <span className="bg-[#FFF9E6] text-[#D97706] border border-[#FDE68A] text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                          {cat.badge}
                        </span>
                      ) : (
                        <ChevronRight size={13} className="text-gray-300" />
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Toys Collection */}
            <Link
              href="/toys"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname.startsWith('/toys')
                  ? 'bg-pink-50/90 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#D97706] flex items-center justify-center text-sm">
                🧸
              </div>
              <span className="flex-1">Toys Collection</span>
              <span className="bg-[#FEF3C7] text-[#D97706] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                11 Categories
              </span>
            </Link>

            {/* 5. New Arrivals */}
            <Link
              href="/#new-arrivals"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EDEBFF] text-[#6E56CF] flex items-center justify-center">
                <Sparkles size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">New Arrivals</span>
              <span className="text-[11px] text-[#6E56CF] font-bold">✨ Fresh</span>
            </Link>

            {/* 6. Best Sellers */}
            <Link
              href="/#best-sellers"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#FDF2E9] text-[#EA580C] flex items-center justify-center">
                <Heart size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">Best Sellers</span>
              <span className="text-[11px] text-[#EA580C] font-bold">⭐ Loved</span>
            </Link>

            {/* 7. About Us */}
            <Link
              href="/about-us"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/about-us' || pathname === '/about'
                  ? 'bg-pink-50/90 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Info size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">About Store</span>
            </Link>

            {/* 8. Contact Us */}
            <Link
              href="/contact"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/contact' || pathname === '/contact-us'
                  ? 'bg-pink-50/90 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Phone size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">Contact Us</span>
            </Link>
          </nav>

          {/* WHATSAPP ACTION BUTTON IN DRAWER */}
          <div className="pt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
            >
              <MessageCircle size={18} fill="currentColor" />
              <span>Direct WhatsApp Enquiry</span>
            </a>
          </div>

          {/* STORE CONTACT INFO SNIPPET */}
          <div className="bg-gray-50 rounded-2xl p-3.5 border border-gray-100 space-y-2 text-xs text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin size={14} className="text-[#FF2E63] shrink-0 mt-0.5" />
              <span className="leading-snug">
                160, Perundurai Road, Near Sudha Hospital, Erode - 638011
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={14} className="text-[#FF2E63] shrink-0" />
              <span>Open 7 Days: 9:30 AM – 9:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={14} className="text-[#FF2E63] shrink-0" />
              <span className="font-semibold text-gray-800">{BUSINESS_PHONE_DISPLAY}</span>
            </div>
          </div>
        </div>

        {/* DRAWER FOOTER */}
        <div className="shrink-0 p-4 bg-gray-50 border-t border-gray-100 pb-[max(1rem,env(safe-area-inset-bottom))] text-center">
          <p className="text-[11px] font-bold text-gray-800 font-roboto-slab">
            Baby&apos;s Bazaar &bull; Erode
          </p>
          <p className="text-[10px] text-gray-500 mt-0.5">
            Quality essentials, toys &amp; care for little ones
          </p>
        </div>
      </aside>

      {/* ======================================================================= */}
      {/* 3. SLEEK FLOATING WHATSAPP BUTTON (UNOBTRUSIVE, SAFE-AREA AWARE)        */}
      {/* ======================================================================= */}
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Enquire with Baby's Bazaar on WhatsApp"
        className={`fixed z-30 bottom-5 right-5 sm:bottom-6 sm:right-6 w-13 h-13 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer ${
          drawerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
        style={{
          bottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
          right: 'max(1.25rem, calc(env(safe-area-inset-right, 0px) + 0.75rem))',
        }}
      >
        <MessageCircle size={26} fill="currentColor" />
        <span className="sr-only">WhatsApp Chat</span>
      </a>
    </>
  )
}
