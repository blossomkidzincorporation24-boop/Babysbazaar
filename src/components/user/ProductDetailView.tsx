'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShieldCheck, Sparkles, Eye } from 'lucide-react'

export interface DetailedProduct {
  id: string
  title: string
  slug: string
  price: number
  original_price?: number
  description?: string | null
  product_images?: string[]
  category_name?: string
  category_slug?: string
  ready_to_dispatch?: boolean
}

interface ProductDetailViewProps {
  product: DetailedProduct
  whatsappNumber?: string | null
  bestSellers?: any[]
}

export default function ProductDetailView({
  product,
  whatsappNumber,
  bestSellers = [],
}: ProductDetailViewProps) {
  const cleanPhone = whatsappNumber?.replace(/\D/g, '') || '919965512123'

  const images = product.product_images && product.product_images.length > 0
    ? product.product_images
    : ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1000&q=85']

  const [selectedImage, setSelectedImage] = useState(images[0])

  // Pricing calculations
  const price = product.price
  const originalPrice = product.original_price || Math.round(price * 1.25)

  // Direct WhatsApp Enquiry Link (Dynamic & canonical)
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : `https://babysbazaar.com/product/${product.slug}`
  const waMessage = encodeURIComponent(
    `Hi Baby's Bazaar,\nI want to enquire about ${product.title} priced at ₹${price.toLocaleString('en-IN')}.\n\nProduct:\n${productUrl}`
  )
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`

  const displayBestSellers = bestSellers || []

  return (
    <div className="w-full bg-white text-gray-900 pb-20">
      {/* ─────────────────────────────────────────────────────────────
          1. PRODUCT HERO SECTION (Two Columns: Left Image + Right Info)
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1312px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
        {/* Visible Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 sm:mb-6 flex items-center flex-wrap gap-2 text-black font-poppins text-xs sm:text-sm font-medium"
        >
          <Link href="/" className="hover:text-[#F40436] transition-colors">
            Home
          </Link>
          <span className="text-gray-400 select-none">&gt;</span>
          <Link href="/categories" className="hover:text-[#F40436] transition-colors">
            Categories
          </Link>
          {product.category_slug && product.category_name && (
            <>
              <span className="text-gray-400 select-none">&gt;</span>
              <Link
                href={`/category/${product.category_slug}`}
                className="hover:text-[#F40436] transition-colors"
              >
                {product.category_name}
              </Link>
            </>
          )}
          <span className="text-gray-400 select-none">&gt;</span>
          <span className="text-gray-600 font-semibold truncate max-w-[200px] sm:max-w-none">
            {product.title}
          </span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
          {/* Left Column: Main Image with 'Gentle Textile Weave' badge */}
          <div className="lg:col-span-6 lg:sticky lg:top-28 space-y-4">
            <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-xs">
              <Image
                src={selectedImage}
                alt={product.title}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 650px"
                className="object-cover transition-transform duration-500 hover:scale-102"
              />

              {/* Exact 'Gentle Textile Weave' badge at bottom right */}
              <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs flex items-center gap-1.5 pointer-events-none">
                <Sparkles size={13} className="text-[#B45309]" />
                <span className="font-sans text-[11px] font-medium text-gray-700">
                  Gentle Textile Weave
                </span>
              </div>
            </div>

            {/* Thumbnail Gallery (if multiple images) */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all cursor-pointer shrink-0 ${
                      selectedImage === img
                        ? 'border-[#34C759] ring-2 ring-[#34C759]/20'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.title} - View ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Product Specs & Ordering */}
          <div className="lg:col-span-6 flex flex-col justify-start">
            {/* Category Breadcrumb & 'Ready to Dispatch' Badge */}
            <div className="flex items-center justify-between gap-4 flex-wrap mb-3">
              <Link
                href={
                  product.category_slug
                    ? `/category/${product.category_slug}`
                    : '/categories'
                }
                className="font-sans text-[11px] sm:text-xs font-semibold text-[#B45309] tracking-wider uppercase hover:text-[#92400E] transition-colors"
              >
                {product.category_name || 'MOM & BABY NURSERY KEEPSAKES'} &gt;
              </Link>

              {/* Exact '● Ready to Dispatch' Pill Badge */}
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#F0FDF4] text-[#15803D] border border-[#DCFCE7]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#16A34A] animate-pulse" />
                Ready to Dispatch
              </span>
            </div>

            {/* Product Title */}
            <h1 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[36px] font-bold text-[#1C1C18] leading-[1.25] mb-3">
              {product.title}
            </h1>

            {/* Subtitle / Description */}
            <p className="font-sans text-sm sm:text-base text-gray-600 leading-relaxed mb-6">
              {product.description ||
                'Knitted from 100% GOTS certified combed organic cotton.'}
            </p>

            {/* Price Row: Current Price + Strikethrough + 'SEASONAL SAVINGS' badge */}
            <div className="flex items-baseline gap-3 mb-2 flex-wrap">
              <span className="font-roboto-slab text-3xl sm:text-4xl font-bold text-gray-900 tracking-tight">
                ₹{price.toLocaleString('en-IN')}
              </span>
              <span className="font-sans text-lg sm:text-xl text-gray-400 line-through font-normal">
                ₹{originalPrice.toLocaleString('en-IN')}
              </span>
              <span className="font-sans text-[11px] sm:text-xs font-bold px-2 py-0.5 rounded bg-[#FCE8EF] text-[#E1144B] uppercase tracking-wide">
                Seasonal Savings
              </span>
            </div>

            {/* Assurance Note */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-8">
              <ShieldCheck size={16} className="text-[#34C759] shrink-0" />
              <span>
                All-inclusive pricing • Insured doorstep dispatch across India included
              </span>
            </div>

            {/* Big Green Pill CTA Button (Enquire & Order on WhatsApp) */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white font-sans text-base sm:text-lg font-semibold py-4 px-8 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
            >
              <svg
                width="22"
                height="22"
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
              <span>Enquire & Order on WhatsApp</span>
            </a>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HOW BABY'S BAZAAR WORKS → CONSCIOUS WHATSAPP ORDERING
      ───────────────────────────────────────────────────────────── */}
      <section className="max-w-[1312px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        <div className="space-y-2 mb-8 text-center flex flex-col items-center">
          <p className="font-sans text-xs sm:text-sm font-semibold tracking-wider text-[#B45309] uppercase">
            How Baby&apos;s Bazaar Works
          </p>
          <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] text-center">
            Conscious WhatsApp Ordering
          </h2>
          <p className="font-sans text-sm sm:text-base text-gray-600 max-w-2xl leading-relaxed text-center">
            No impersonal shopping carts or automated checkout bots. Experience one-on-one personal assistance from real mothers and textile artisans.
          </p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 01 */}
          <div className="bg-white border border-[#D1D1D1] rounded-[16px] p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all">
            <div className="font-roboto-slab text-4xl sm:text-[44px] font-normal text-[#8951A0] mb-4">
              01
            </div>
            <h3 className="font-roboto-slab text-lg font-bold text-gray-900 mb-2">
              Tap to Enquire
            </h3>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">
              Click the green WhatsApp button. Your inquiry is pre-filled with the exact item name, photos, and live pricing.
            </p>
          </div>

          {/* Card 02 */}
          <div className="bg-white border border-[#D1D1D1] rounded-[16px] p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all">
            <div className="font-roboto-slab text-4xl sm:text-[44px] font-normal text-[#8951A0] mb-4">
              02
            </div>
            <h3 className="font-roboto-slab text-lg font-bold text-gray-900 mb-2">
              Live Video &amp; Fit Check
            </h3>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">
              Our studio concierge shares raw daylight videos, size scale advice, and custom gift note drafts directly in your chat.
            </p>
          </div>

          {/* Card 03 */}
          <div className="bg-white border border-[#D1D1D1] rounded-[16px] p-6 sm:p-7 shadow-2xs hover:shadow-md transition-all">
            <div className="font-roboto-slab text-4xl sm:text-[44px] font-normal text-[#8951A0] mb-4">
              03
            </div>
            <h3 className="font-roboto-slab text-lg font-bold text-gray-900 mb-2">
              Instant UPI &amp; Tracking
            </h3>
            <p className="font-sans text-sm text-gray-600 leading-relaxed">
              Confirm via official GooglePay / UPI / Net Banking. We dispatch with insured express couriers and WhatsApp tracking pings.
            </p>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. COMMUNITY FAVORITES → BEST SELLERS (4 Cards)
      ───────────────────────────────────────────────────────────── */}
      {displayBestSellers.length > 0 && (
        <section className="max-w-[1312px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        {/* Header Row with Rating - Center Aligned */}
        <div className="relative flex flex-col items-center justify-center text-center space-y-1 mb-8">
          <span className="inline-block text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded uppercase tracking-wider">
            Community Favorites
          </span>
          <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] text-center">
            Best Sellers
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 text-center">
            Loved and trusted by parents across India.
          </p>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayBestSellers.map((item: any) => {
            const itemPrice = item.price || 1850
            const itemImage =
              item.image ||
              item.product_images?.[0] ||
              'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=600&q=80'
            const itemCategory =
              item.category || item.category_tag || item.categories?.name || 'BABY BEDDING'

            const itemWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hi Baby's Bazaar, I want to enquire about *${item.title}* (Price: ₹${itemPrice})`
            )}`

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image with 'BEST SELLER' top-left badge and Eye preview button */}
                  <div className="relative aspect-square w-full bg-gray-50 overflow-hidden">
                    <Link href={`/product/${item.slug}`} className="block w-full h-full relative">
                      <Image
                        src={itemImage}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 280px"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>

                    {/* Best Seller Pill Badge */}
                    <div className="absolute top-3 left-3 bg-[#A16207] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase shadow-xs">
                      Best Seller
                    </div>

                    {/* Quick Eye Button */}
                    <Link
                      href={`/product/${item.slug}`}
                      className="absolute bottom-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-gray-700 hover:text-black shadow-xs hover:scale-110 transition-transform"
                    >
                      <Eye size={15} />
                    </Link>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    <p className="font-sans text-[11px] font-semibold text-[#B45309] uppercase tracking-wider">
                      {itemCategory}
                    </p>
                    <Link href={`/product/${item.slug}`}>
                      <h4 className="font-roboto-slab text-[15px] font-semibold text-gray-900 leading-snug line-clamp-2 hover:text-[#E1144B] transition-colors">
                        {item.title}
                      </h4>
                    </Link>
                    <p className="font-roboto-slab text-base font-bold text-gray-900 pt-1">
                      ₹{itemPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>

                {/* Bottom WhatsApp Pill Button */}
                <div className="p-4 pt-0">
                  <a
                    href={itemWaUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#34C759] hover:bg-[#2EB34F] active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.66667 8H8V6.66667H2.66667V8ZM2.66667 6H10.6667V4.66667H2.66667V6ZM2.66667 4H10.6667V2.66667H2.66667V4ZM0 13.3333V1.33333C0 0.966667 0.130556 0.652778 0.391667 0.391667C0.652778 0.130556 0.966667 0 1.33333 0H12C12.3667 0 12.6806 0.130556 12.9417 0.391667C13.2028 0.652778 13.3333 0.966667 13.3333 1.33333V9.33333C13.3333 9.7 13.2028 10.0139 12.9417 10.275C12.6806 10.5361 12.3667 10.6667 12 10.6667H2.66667L0 13.3333ZM2.1 9.33333H12V1.33333H1.33333V10.0833L2.1 9.33333ZM1.33333 9.33333V1.33333V9.33333Z"
                        fill="white"
                      />
                    </svg>
                    <span>Enquire on WhatsApp</span>
                  </a>
                </div>
              </div>
            )
          })}
        </div>
      </section>
      )}
    </div>
  )
}
