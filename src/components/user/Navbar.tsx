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
  Grid,
} from 'lucide-react'
import {
  BUSINESS_NAME,
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_GOOGLE_MAPS_URL,
} from '@/lib/constants'

// =======================================================================
// UNIQUE BRANDED ICONS FOR INSTAGRAM & WHATSAPP
// =======================================================================

function InstagramBrandIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        <linearGradient id="igGradientUnique" x1="2" y1="22" x2="22" y2="2" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="25%" stopColor="#e6683c" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="75%" stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke="url(#igGradientUnique)" strokeWidth="2.2" />
      <circle cx="12" cy="12" r="4.2" stroke="url(#igGradientUnique)" strokeWidth="2.2" />
      <circle cx="17.5" cy="6.5" r="1.3" fill="url(#igGradientUnique)" />
    </svg>
  )
}

function InstagramWhiteIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect x="2" y="2" width="20" height="20" rx="6" />
      <circle cx="12" cy="12" r="4" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="3" />
    </svg>
  )
}

function WhatsAppBrandIcon({ size = 20, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path d="M19.05 4.91A9.816 9.816 0 0 0 12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01zm-7.01 15.24c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.22 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.69-.81-.23-.08-.39-.12-.56.12-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.23-1.47-1.38-1.72-.14-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.12-.15.17-.25.25-.42.08-.17.04-.31-.02-.43s-.56-1.34-.76-1.84c-.2-.48-.41-.42-.56-.43h-.48c-.17 0-.43.06-.66.31-.22.25-.86.84-.86 2.05s.88 2.38 1 2.54c.12.17 1.73 2.65 4.2 3.71.59.25 1.05.4 1.41.51.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.15-1.18-.07-.12-.23-.19-.48-.31z" />
    </svg>
  )
}

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

  // Touch swipe handling for right-side drawer
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

  // Touch gesture handlers for closing right drawer by swiping right
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchCurrentX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (touchStartX.current !== null && touchCurrentX.current !== null) {
      const diffX = touchStartX.current - touchCurrentX.current
      if (diffX < -50) {
        // Swiped right by at least 50px -> close right drawer
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
          <div className="flex items-center justify-between h-14 sm:h-16 lg:h-20 gap-2 sm:gap-3">
            
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

            {/* DESKTOP RIGHT ACTIONS (Search, Instagram, WhatsApp & Shop Now) */}
            <div className="hidden lg:flex items-center gap-3 xl:gap-4 shrink-0">
              <form onSubmit={handleSearch} className="relative">
                <input
                  type="text"
                  placeholder="Search products, toys..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-44 xl:w-52 pl-9 pr-8 py-2 rounded-full bg-gray-100 border border-gray-200 text-xs sm:text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E63]/30 transition-all"
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

              {/* Instagram Icon */}
              <a
                href={BUSINESS_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full hover:scale-110 active:scale-95 transition-all shadow-2xs border border-pink-100 bg-pink-50/50 hover:bg-pink-100/70"
                aria-label="Open Baby's Bazaar on Instagram"
              >
                <InstagramBrandIcon size={20} />
              </a>

              {/* WhatsApp Icon */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#25D366] hover:bg-green-50 hover:scale-110 active:scale-95 transition-all shadow-2xs border border-green-100 bg-green-50/50"
                aria-label="Chat on WhatsApp"
              >
                <WhatsAppBrandIcon size={20} />
              </a>

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
            {/* MOBILE HEADER RIGHT: UNIQUE INSTAGRAM + WHATSAPP + HAMBURGER       */}
            {/* =================================================================== */}
            <div className="flex lg:hidden items-center gap-1.5">
              
              {/* Unique Instagram Mobile Header Button */}
              <a
                href={BUSINESS_INSTAGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-tr from-amber-500/10 via-pink-500/15 to-purple-500/15 border border-pink-200/60 active:scale-90 transition-transform shadow-2xs"
                aria-label="Baby's Bazaar Instagram"
              >
                <InstagramBrandIcon size={20} />
              </a>

              {/* Unique WhatsApp Mobile Header Button */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full text-[#25D366] bg-green-50 border border-green-200/80 active:scale-90 transition-transform shadow-2xs"
                aria-label="Direct WhatsApp Concierge"
              >
                <WhatsAppBrandIcon size={20} />
              </a>

              {/* Modern Hamburger Button (44px min touch target) */}
              <button
                type="button"
                onClick={() => setDrawerOpen(true)}
                className="w-10 h-10 flex items-center justify-center rounded-full text-gray-800 hover:text-[#FF2E63] hover:bg-pink-50 active:scale-90 transition-all cursor-pointer -mr-1"
                aria-label="Open navigation menu"
                aria-expanded={drawerOpen}
              >
                <Menu size={24} strokeWidth={2.4} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ======================================================================= */}
      {/* 2. RIGHT-SIDE SLIDE-OUT NAVIGATION DRAWER (UNIQUE LAYOUT)               */}
      {/* ======================================================================= */}
      
      {/* Fullscreen Backdrop */}
      <div
        className={`fixed inset-0 z-[1050] bg-black/50 backdrop-blur-[3px] transition-opacity duration-300 ease-out lg:hidden ${
          drawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />

      {/* RIGHT Drawer Container (slides from right to left) */}
      <aside
        id="mobile-navigation-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className={`fixed top-0 right-0 bottom-0 z-[1060] w-[88vw] max-w-[360px] bg-white shadow-2xl flex flex-col justify-between transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:hidden ${
          drawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* DRAWER TOP: Brand Header & Close Button */}
        <div className="shrink-0 border-b border-gray-100/90 px-4 pt-[max(0.85rem,env(safe-area-inset-top))] pb-3 flex items-center justify-between bg-gradient-to-b from-pink-50/40 to-white">
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
            className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 active:scale-90 transition-all cursor-pointer"
            aria-label="Close menu"
          >
            <X size={20} strokeWidth={2.4} />
          </button>
        </div>

        {/* DRAWER SCROLLABLE BODY */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-3.5 scrollbar-none overscroll-contain">
          
          {/* 1. UNIQUE QUICK CONNECT HUB (INSTAGRAM + WHATSAPP DUAL HERO CARDS) */}
          <div className="grid grid-cols-2 gap-2.5">
            
            {/* INSTAGRAM HERO CARD */}
            <a
              href={BUSINESS_INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-[#833ab4] via-[#fd1d1d] to-[#fcb045] text-white shadow-xs hover:shadow-md active:scale-98 transition-all flex flex-col justify-between min-h-[92px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <InstagramWhiteIcon size={18} />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-white/25">
                  Follow
                </span>
              </div>
              <div className="pt-2">
                <div className="text-xs font-bold leading-tight">Instagram</div>
                <div className="text-[11px] text-white/90 truncate font-medium">@babys.bazaar</div>
              </div>
            </a>

            {/* WHATSAPP HERO CARD */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="relative overflow-hidden rounded-2xl p-3 bg-gradient-to-br from-[#25D366] to-[#128C7E] text-white shadow-xs hover:shadow-md active:scale-98 transition-all flex flex-col justify-between min-h-[92px]"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <WhatsAppBrandIcon size={18} className="text-white" />
                </div>
                <span className="text-[10px] uppercase tracking-wider font-extrabold px-1.5 py-0.5 rounded-full bg-white/25">
                  Chat
                </span>
              </div>
              <div className="pt-2">
                <div className="text-xs font-bold leading-tight">WhatsApp</div>
                <div className="text-[11px] text-white/90 truncate font-medium">Fast Enquiries</div>
              </div>
            </a>
          </div>

          {/* 2. SEARCH BAR */}
          <form onSubmit={handleSearch} className="relative">
            <input
              type="text"
              placeholder="Search products, toys, baby care..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-gray-50 border border-gray-200 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF2E63]/30 focus:border-[#FF2E63] transition-all"
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

          {/* 3. PRIMARY MENU ITEMS (UNIQUE MODERN STRUCTURE) */}
          <nav className="space-y-1" aria-label="Mobile Menu Links">
            
            {/* A. Home */}
            <Link
              href="/"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/'
                  ? 'bg-pink-50 text-[#FF2E63] shadow-2xs'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                pathname === '/' ? 'bg-[#FF2E63] text-white' : 'bg-pink-50 text-[#FF2E63]'
              }`}>
                <Home size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">Home</span>
            </Link>

            {/* B. Expandable Categories Accordion */}
            <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
              <button
                type="button"
                onClick={() => setCategoriesExpanded(!categoriesExpanded)}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63] transition-all cursor-pointer"
                aria-expanded={categoriesExpanded}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-pink-50 text-[#FF2E63] flex items-center justify-center">
                    <Grid size={17} strokeWidth={2.2} />
                  </div>
                  <span>Categories</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded-md">
                    10 Items
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      categoriesExpanded ? 'rotate-180 text-[#FF2E63]' : ''
                    }`}
                  />
                </div>
              </button>

              {/* Subcategories Accordion Content */}
              {categoriesExpanded && (
                <div className="px-2.5 py-1.5 space-y-0.5 bg-gray-50/70 border-t border-gray-100 animate-in fade-in slide-in-from-top-1 duration-200">
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
                  
                  {/* View All Categories Link */}
                  <Link
                    href="/categories"
                    onClick={() => setDrawerOpen(false)}
                    className="flex items-center justify-center gap-1.5 py-2 mt-1 rounded-lg text-xs font-bold text-[#FF2E63] bg-pink-50/70 hover:bg-pink-100 transition-colors"
                  >
                    <span>Explore All 10 Categories</span>
                    <ChevronRight size={13} />
                  </Link>
                </div>
              )}
            </div>

            {/* C. Toys Collection */}
            <Link
              href="/toys"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname.startsWith('/toys')
                  ? 'bg-amber-50 text-[#D97706] shadow-2xs'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#D97706]'
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

            {/* D. New Arrivals */}
            <Link
              href="/#new-arrivals"
              onClick={() => setDrawerOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-gray-800 hover:bg-gray-50 hover:text-[#6E56CF] transition-all"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EDEBFF] text-[#6E56CF] flex items-center justify-center">
                <Sparkles size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">New Arrivals</span>
              <span className="text-[10px] bg-purple-50 text-[#6E56CF] border border-purple-100 font-bold px-2 py-0.5 rounded-full">
                ✨ Fresh Stock
              </span>
            </Link>

            {/* E. About Store */}
            <Link
              href="/about-us"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/about-us' || pathname === '/about'
                  ? 'bg-pink-50 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Info size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">About Store</span>
            </Link>

            {/* F. Contact & Visit Us */}
            <Link
              href="/contact"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                pathname === '/contact' || pathname === '/contact-us'
                  ? 'bg-pink-50 text-[#FF2E63]'
                  : 'text-gray-800 hover:bg-gray-50 hover:text-[#FF2E63]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-gray-100 text-gray-600 flex items-center justify-center">
                <Phone size={17} strokeWidth={2.2} />
              </div>
              <span className="flex-1">Contact &amp; Visit Us</span>
            </Link>
          </nav>

          {/* 4. DIRECT WHATSAPP CONCIERGE BUTTON */}
          <div>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white text-xs sm:text-sm font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
            >
              <WhatsAppBrandIcon size={18} className="text-white" />
              <span>Direct WhatsApp Concierge</span>
            </a>
          </div>

          {/* 5. STORE INFO SNIPPET */}
          <div className="bg-gray-50 rounded-2xl p-3 border border-gray-100 space-y-1.5 text-[11px] text-gray-600">
            <div className="flex items-start gap-2">
              <MapPin size={13} className="text-[#FF2E63] shrink-0 mt-0.5" />
              <span className="leading-tight">
                160, Perundurai Road, Near Sudha Hospital, Erode - 638011
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-[#FF2E63] shrink-0" />
              <span>Open 7 Days: 9:30 AM – 9:00 PM</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone size={13} className="text-[#FF2E63] shrink-0" />
              <span className="font-semibold text-gray-800">{BUSINESS_PHONE_DISPLAY}</span>
            </div>
          </div>
        </div>

        {/* DRAWER FOOTER */}
        <div className="shrink-0 p-3.5 bg-gray-50 border-t border-gray-100 pb-[max(0.85rem,env(safe-area-inset-bottom))] text-center">
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
        <WhatsAppBrandIcon size={26} className="text-white" />
        <span className="sr-only">WhatsApp Chat</span>
      </a>
    </>
  )
}
