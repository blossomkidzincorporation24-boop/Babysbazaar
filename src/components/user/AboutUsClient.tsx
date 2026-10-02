'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import {
  ChevronLeft,
  ChevronRight,
  Shirt,
  Heart,
  Baby,
  Gift,
  Utensils,
  Sparkles,
  ShoppingBag,
  Layers,
  MessageCircle,
  Smile,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'

interface PhotoItem {
  id: string
  image: string
  caption?: string | null
  type?: string | null
  status?: string | null
}

export interface CategoryOfferItem {
  id: string
  name: string
  slug: string
  image?: string | null
  description?: string | null
}

interface AboutUsClientProps {
  whatsappNumber?: string | null
  photos?: PhotoItem[]
  categories?: CategoryOfferItem[]
}

// 8 "What We Offer" Departments from Figma Frame 1686556764
const WHAT_WE_OFFER = [
  {
    tag: '0 – 24 MONTHS',
    title: 'Baby Clothing',
    description: 'Newborn and baby clothing for everyday comfort.',
    meta: 'Soft Fabrics',
    slug: 'baby-clothes',
    icon: Shirt,
    boxBg: 'bg-[#FEE2E2]',
    iconColor: 'text-[#EF4444]',
  },
  {
    tag: 'MATERNAL COMFORT',
    title: 'Mom & Maternity',
    description: 'Useful products and essentials for mothers.',
    meta: 'Postpartum Care',
    slug: 'mom-maternity',
    icon: Heart,
    boxBg: 'bg-[#FEF3C7]',
    iconColor: 'text-[#D97706]',
  },
  {
    tag: 'PLAY & DISCOVERY',
    title: 'Toys & Play',
    description: 'Toys designed to bring fun and creativity into everyday play.',
    meta: 'Sensory & Active',
    slug: 'baby-toys',
    icon: Baby,
    boxBg: 'bg-[#DCFCE7]',
    iconColor: 'text-[#16A34A]',
  },
  {
    tag: 'SPECIAL OCCASIONS',
    title: 'Gifts',
    description: 'Thoughtful gift options for babies and kids.',
    meta: 'Hampers & Sets',
    slug: 'gift-sets',
    icon: Gift,
    boxBg: 'bg-[#FCE8EF]',
    iconColor: 'text-[#D92F68]',
  },
  {
    tag: 'MEALTIME',
    title: "Baby's Feeding",
    description: 'Practical products for feeding and mealtime needs.',
    meta: 'Comfort & Support',
    slug: 'babys-feeding',
    icon: Utensils,
    boxBg: 'bg-[#FFEDD5]',
    iconColor: 'text-[#EA580C]',
  },
  {
    tag: 'DAILY HYGIENE',
    title: 'Baby Care',
    description: 'Everyday essentials for baby care and hygiene.',
    meta: 'Gentle Care',
    slug: 'bath-care',
    icon: Sparkles,
    boxBg: 'bg-[#CCFBF1]',
    iconColor: 'text-[#0D9488]',
  },
  {
    tag: 'EVERYDAY LITTLE THINGS',
    title: 'Accessories',
    description: 'Everyday accessories and useful essentials for little ones.',
    meta: 'Caps, Socks & Clips',
    slug: 'accessories',
    icon: ShoppingBag,
    boxBg: 'bg-[#D1FAE5]',
    iconColor: 'text-[#059669]',
  },
  {
    tag: '2 – 8 YEARS',
    title: 'Kids Wear',
    description: 'Comfortable and stylish clothing for growing kids.',
    meta: 'Daily & Occasion',
    slug: 'kids-wear',
    icon: Layers,
    boxBg: 'bg-[#FFE4E6]',
    iconColor: 'text-[#E11D48]',
  },
]

// 4 "Why Baby's Bazaar" Value Pillars from Figma Frame 1686556764
const WHY_US_FEATURES = [
  {
    title: 'Wide Variety',
    description: 'Find baby, kids and mother essentials in one place.',
    icon: Sparkles,
    bg: 'bg-[#FEF3C7]',
    color: 'text-[#D97706]',
  },
  {
    title: 'Parent-Friendly Shopping',
    description: 'Simple product discovery designed around everyday family needs.',
    icon: Smile,
    bg: 'bg-[#D1FAE5]',
    color: 'text-[#059669]',
  },
  {
    title: 'Everyday Essentials',
    description: "Picks tailored for different stages of a child's growing journey.",
    icon: CheckCircle2,
    bg: 'bg-[#FEE2E2]',
    color: 'text-[#DC2626]',
  },
  {
    title: 'Easy Enquiry',
    description: 'Customers can quickly enquire about products through WhatsApp.',
    icon: MessageCircle,
    bg: 'bg-[#F3F4F6]',
    color: 'text-[#4B5563]',
  },
]

import { BUSINESS_WHATSAPP_NUMBER } from '@/lib/constants'

export default function AboutUsClient({ whatsappNumber, photos = [], categories = [] }: AboutUsClientProps) {
  const cleanPhone = whatsappNumber?.replace(/\D/g, '') || BUSINESS_WHATSAPP_NUMBER
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    "Hi Baby's Bazaar, I'd like to chat and know more about your collection!"
  )}`

  // Dynamically map database photos from admin photos table
  const activePhotos = (photos || []).filter(Boolean)
  const slides = activePhotos.map((item, index) => ({
    id: item.id || index + 1,
    image: item.image,
    title: item.caption || 'Delivered with Love & Care',
    review: item.caption
      ? `“${item.caption}”`
      : '“Beautiful quality baby essentials delivered right to our doorstep with extreme care.”',
    author: item.type === 'delivery' ? 'Happy Parent' : 'Baby’s Bazaar Family',
    location: 'Verified Delivery',
  }))

  const [currentSlide, setCurrentSlide] = useState(0)

  const nextSlide = () => {
    if (slides.length <= 1) return
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    if (slides.length <= 1) return
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  return (
    <div className="w-full bg-white text-gray-900 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Everything Your Little One Needs, All in One Place)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[400px] sm:h-[480px] lg:h-[520px] overflow-hidden bg-gray-900 select-none">
        {/* Background Image */}
        <Image
          src="https://api.builder.io/api/v1/image/assets/TEMP/b360b1e0aa875fc428ad8d9c6dfe39fa2808ea41?width=2550"
          alt="Everything Your Little One Needs"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Dark Gradient Overlay for High Contrast Text */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/65" />

        {/* Centered Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <Container className="text-center">
            <h1 className="font-roboto-slab text-2xl sm:text-4xl lg:text-[46px] font-bold text-white tracking-tight leading-[1.25] drop-shadow-md max-w-3xl mx-auto">
              Everything Your Little One Needs,
              <br />
              <span className="text-[#FFD000]">All in One Place.</span>
            </h1>

            {/* Dual CTA Buttons */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/categories"
                className="bg-[#E1144B] hover:bg-[#c91040] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold px-8 py-3 rounded-full shadow-lg transition-all cursor-pointer"
              >
                Explore Categories
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] hover:bg-[#20BD5A] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold px-8 py-3 rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.02516 23.7126C1.02403 27.7455 2.08603 31.6834 4.10541 35.1543L0.832031 47.0132L13.063 43.8311C16.446 45.6584 20.2363 46.6159 24.088 46.6162H24.0982C36.8135 46.6162 47.164 36.3496 47.1695 23.7306C47.1719 17.6158 44.7742 11.8659 40.4178 7.53994C36.0622 3.21436 30.2693 0.830916 24.0972 0.828125C11.3804 0.828125 1.03059 11.0942 1.02534 23.7126"
                    fill="white"
                  />
                  <path
                    d="M18.1277 13.7949C17.6803 12.8083 17.2095 12.7884 16.784 12.7711C16.4357 12.7562 16.0374 12.7573 15.6395 12.7573C15.2413 12.7573 14.5942 12.906 14.0473 13.4986C13.4998 14.0917 11.957 15.525 11.957 18.4401C11.957 21.3553 14.097 24.1728 14.3953 24.5685C14.694 24.9635 18.5265 31.1372 24.5962 33.5123C29.6407 35.4861 30.6673 35.0935 31.7621 34.9946C32.8571 34.8959 35.2953 33.5616 35.7928 32.178C36.2906 30.7946 36.2906 29.6087 36.1413 29.3609C35.9921 29.114 35.5938 28.9657 34.9967 28.6695C34.3995 28.3733 31.4634 26.9397 30.9161 26.7419C30.3686 26.5443 29.9705 26.4457 29.5723 27.039C29.174 27.6314 28.0305 28.9657 27.6819 29.3609C27.3337 29.757 26.9852 29.8063 26.3882 29.5099C25.7906 29.2126 23.8674 28.5877 21.5857 26.5692C19.8105 24.9986 18.612 23.0591 18.2636 22.4658C17.9152 21.8734 18.2263 21.5523 18.5257 21.2571C18.794 20.9916 19.1231 20.5652 19.422 20.2193C19.7197 19.8733 19.8191 19.6264 20.0182 19.2312C20.2175 18.8357 20.1178 18.4896 19.9687 18.1933C19.8191 17.8969 18.6587 14.9665 18.1277 13.7949Z"
                    fill="white"
                  />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </Container>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. WHAT WE OFFER (8 Cards in 4x2 Responsive Grid)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 lg:py-16">
        <Container>
          {/* Section Heading */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#F40436] mb-2">
              What We Offer
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              Explore a carefully organized department spanning tender infancy to active early childhood and mother care.
            </p>
          </div>

          {/* Dynamic Database Categories Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {(categories && categories.length > 0 ? categories : WHAT_WE_OFFER).map((item: any, idx: number) => {
              const isDbCategory = Boolean(item.id && !item.boxBg)
              const title = item.name || item.title || 'Baby Category'
              const slug = item.slug || ''
              const description = item.description || 'Quality baby products and essentials for your little ones.'
              const imageSrc = item.image
              const IconComponent = item.icon || ShoppingBag
              const linkHref = slug === 'baby-toys' || slug === 'toys' ? '/toys' : `/category/${slug}`

              return (
                <div
                  key={item.id || idx}
                  className="bg-[#FFF8FA] border border-[#FDE8EF] rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all duration-300 group"
                >
                  <div>
                    {/* Category Image or Icon Header */}
                    {imageSrc ? (
                      <div className="relative aspect-video w-full rounded-xl overflow-hidden mb-4 bg-white border border-[#FDE8EF] shadow-2xs">
                        <Image
                          src={imageSrc}
                          alt={`${title} - Baby's Bazaar`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl ${item.boxBg || 'bg-[#FEE2E2]'} ${item.iconColor || 'text-[#EF4444]'} flex items-center justify-center mb-4 transition-transform group-hover:scale-105`}
                      >
                        <IconComponent size={20} strokeWidth={2.2} />
                      </div>
                    )}

                    {/* Tag */}
                    <p className="font-sans text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                      {item.tag || 'BABY STORE'}
                    </p>

                    {/* Title */}
                    <h3 className="font-roboto-slab text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#E1144B] transition-colors mb-2">
                      {title}
                    </h3>

                    {/* Description */}
                    <p className="font-sans text-xs text-gray-600 leading-relaxed line-clamp-3">
                      {description}
                    </p>
                  </div>

                  {/* Bottom Meta & Link */}
                  <div className="pt-5 mt-4 border-t border-[#F8E3EC] flex items-center justify-between text-[11px]">
                    <span className="font-sans text-gray-400 font-medium">
                      {item.meta || 'Verified Catalog'}
                    </span>
                    <Link
                      href={linkHref}
                      className="font-sans font-semibold text-[#E1144B] hover:text-[#B80D3C] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform"
                    >
                      <span>Explore Category</span>
                      <span>↗</span>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. WHY BABY'S BAZAAR (4 Pillar Cards)
      ───────────────────────────────────────────────────────────── */}
      <section className="w-full py-10 lg:py-16 bg-[#FAFAFC] border-y border-gray-100">
        <Container>
          {/* Section Heading */}
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#F40436] mb-2">
              Why Baby&apos;s Bazaar
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
              Designed from the ground up to support parents with reliable selection, genuine assistance, and comfort.
            </p>
          </div>

          {/* 4 Feature Columns */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {WHY_US_FEATURES.map((feat, idx) => {
              const Icon = feat.icon
              return (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs hover:shadow-sm transition-all"
                >
                  <div
                    className={`w-12 h-12 rounded-full ${feat.bg} ${feat.color} flex items-center justify-center mb-4`}
                  >
                    <Icon size={22} strokeWidth={2.2} />
                  </div>
                  <h3 className="font-roboto-slab text-base sm:text-lg font-bold text-gray-900 mb-2">
                    {feat.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm text-gray-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>
              )
            })}
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          4. OUR HAPPY CUSTOMER (Showcase Banner Carousel)
      ───────────────────────────────────────────────────────────── */}
      {slides.length > 0 && (
        <section id="happy-customers" className="w-full py-10 lg:py-16 scroll-mt-24">
          <Container>
            {/* Section Heading */}
            <div className="text-center mb-8 sm:mb-10">
              <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[34px] font-bold text-[#F40436] mb-2">
                Our Happy Customer
              </h2>
              <p className="font-sans text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
                Designed from the ground up to support parents with reliable selection, genuine assistance, and comfort.
              </p>
            </div>

            {/* Asymmetric Tall Rectangular Frame */}
            <div className="relative w-full max-w-[1400px] mx-auto px-2 sm:px-4">
              <div className="relative w-full aspect-[16/9] sm:aspect-[2/1] min-h-[420px] sm:min-h-[500px] lg:min-h-[580px] rounded-[28px] sm:rounded-[44px] rounded-bl-[16px] sm:rounded-bl-[28px] overflow-hidden bg-black border-2 border-[#FAF0E6] shadow-xl shadow-amber-950/10 ring-1 ring-black/5 transition-all">
                {/* Blurred background backdrop so no blank edges */}
                {slides[currentSlide]?.image && (
                  <Image
                    src={slides[currentSlide].image}
                    alt="Backdrop blur"
                    fill
                    className="object-cover blur-2xl opacity-40 scale-110 pointer-events-none"
                  />
                )}

                {/* Main photo - fits 100% inside frame without cropping faces or logos */}
                {slides[currentSlide]?.image && (
                  <Image
                    src={slides[currentSlide].image}
                    alt={slides[currentSlide]?.title || 'Happy Customer'}
                    fill
                    priority
                    sizes="(max-width: 1400px) 100vw, 1400px"
                    className="object-contain object-center transition-all duration-700 relative z-0"
                  />
                )}

                {/* Lower 35% Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 via-35% to-transparent pointer-events-none" />

                {/* Safe Area Testimonial Content (6-8% Internal Padding) */}
                <div className="absolute inset-0 z-10 flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-3xl">
                  <span className="font-sans text-[11px] font-bold uppercase tracking-widest text-[#FFD000] mb-2 drop-shadow-xs">
                    Verified Parent Review
                  </span>
                  <h3 className="font-roboto-slab text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2 leading-tight drop-shadow-sm">
                    {slides[currentSlide]?.title}
                  </h3>
                  <p className="font-sans text-xs sm:text-sm lg:text-base text-white/95 leading-relaxed line-clamp-3 sm:line-clamp-none mb-4">
                    {slides[currentSlide]?.review}
                  </p>
                  <div className="flex items-center gap-2 text-xs sm:text-sm text-white/85">
                    <span className="font-semibold text-white">
                      {slides[currentSlide]?.author}
                    </span>
                    <span>•</span>
                    <span>{slides[currentSlide]?.location}</span>
                  </div>
                </div>
              </div>

              {/* Left Translucent Blur Chevron Button */}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={prevSlide}
                  aria-label="Previous customer story"
                  className="absolute left-0 sm:left-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/40 hover:bg-white/95 text-gray-900 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 border border-white/60"
                >
                  <ChevronLeft size={22} className="-ml-0.5 text-gray-900" />
                </button>
              )}

              {/* Right Translucent Blur Chevron Button */}
              {slides.length > 1 && (
                <button
                  type="button"
                  onClick={nextSlide}
                  aria-label="Next customer story"
                  className="absolute right-0 sm:right-1 top-1/2 -translate-y-1/2 z-20 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/40 hover:bg-white/95 text-gray-900 backdrop-blur-md flex items-center justify-center transition-all cursor-pointer shadow-lg active:scale-95 border border-white/60"
                >
                  <ChevronRight size={22} className="-mr-0.5 text-gray-900" />
                </button>
              )}
            </div>
          </Container>
        </section>
      )}
    </div>
  )
}
