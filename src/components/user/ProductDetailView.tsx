'use client'

import { useState, useMemo, useEffect } from 'react'
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
  short_description?: string | null
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

const ALL_AGE_GROUPS = [
  '1–3 Months',
  '3–6 Months',
  '6–12 Months',
  '12–18 Months',
  '18–24 Months',
]

export default function ProductDetailView({
  product,
  whatsappNumber,
  bestSellers = [],
}: ProductDetailViewProps) {
  const cleanPhone = whatsappNumber?.replace(/\D/g, '') || '918489824888'

  const images = product.product_images && product.product_images.length > 0
    ? product.product_images
    : ['https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1000&q=85']

  const [selectedImage, setSelectedImage] = useState(images[0])
  const [quantity, setQuantity] = useState(1)

  // Clothing category detection
  const isClothing =
    (product.category_slug || '').toLowerCase().includes('cloth') ||
    (product.category_name || '').toLowerCase().includes('cloth')

  // Extract which age groups were selected/toggled in admin for this product
  const availableAges = useMemo(() => {
    if (!product.short_description) return []
    const norm = (s: string) =>
      s.toLowerCase().replace(/[\u2013\u2014–—]/g, '-').replace(/\s+/g, ' ').trim()
    const descNorm = norm(product.short_description)

    const matched = ALL_AGE_GROUPS.filter((age) => {
      const ageNorm = norm(age)
      const ageShort = ageNorm.replace(' months', '')
      return descNorm.includes(ageNorm) || descNorm.includes(ageShort)
    })
    if (matched.length > 0) return matched

    return product.short_description.split(',').map((s) => s.trim()).filter(Boolean)
  }, [product.short_description])

  const [selectedVariant, setSelectedVariant] = useState<string>(() => availableAges[0] || '')

  useEffect(() => {
    if (availableAges.length > 0 && (!selectedVariant || !availableAges.includes(selectedVariant))) {
      setSelectedVariant(availableAges[0])
    }
  }, [availableAges, selectedVariant])

  // Pricing calculations
  const price = product.price
  const originalPrice = product.original_price || Math.round(price * 1.25)

  // Standardized WhatsApp Enquiry Message (Audit Specification)
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : `https://babysbazaar.com/product/${product.slug}`
  const variantLine = isClothing && selectedVariant ? `\nVariant / Age: ${selectedVariant}` : ''
  const waMessage = encodeURIComponent(
    `Hello Baby's Bazaar, I am interested in:\nProduct: ${product.title}\nPrice: ₹${price.toLocaleString('en-IN')}\nQuantity: ${quantity}${variantLine}\nProduct Link: ${productUrl}\n\nPlease share availability and delivery details.`
  )
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${waMessage}`

  // Share on WhatsApp
  const shareText = encodeURIComponent(`Check out ${product.title} on Baby's Bazaar:\n${productUrl}`)
  const shareWhatsappUrl = `https://api.whatsapp.com/send?text=${shareText}`

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

            {/* Clothing Size / Age Variant Selector (ONLY show options toggled in admin) */}
            {isClothing && availableAges.length > 0 && (
              <div className="mb-6 space-y-2.5">
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Select Size / Age:{' '}
                  <span className="text-[#FF2E63] font-bold">{selectedVariant}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableAges.map((sz) => (
                    <button
                      key={sz}
                      type="button"
                      onClick={() => setSelectedVariant(sz)}
                      className={`px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        selectedVariant === sz
                          ? 'bg-[#FF2E63] text-white border-[#FF2E63] shadow-xs scale-102'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-4 mb-6">
              <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                Quantity:
              </span>
              <div className="inline-flex items-center border border-gray-200 rounded-full bg-gray-50 p-1 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 rounded-full bg-white text-gray-800 font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer select-none"
                  aria-label="Decrease quantity"
                >
                  -
                </button>
                <span className="w-10 text-center font-bold text-sm text-gray-900 select-none">
                  {quantity}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity((q) => Math.min(10, q + 1))}
                  className="w-8 h-8 rounded-full bg-white text-gray-800 font-bold flex items-center justify-center hover:bg-gray-100 transition-colors shadow-2xs cursor-pointer select-none"
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Assurance Note */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-600 mb-8">
              <ShieldCheck size={16} className="text-[#34C759] shrink-0" />
              <span>
                Direct WhatsApp consultation • Fast dispatch across India included
              </span>
            </div>

            {/* Action Buttons: Primary Enquire + Share on WhatsApp */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Primary Green Pill CTA (Enquire on WhatsApp) */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#20BD5A] active:scale-[0.98] text-white font-sans text-base sm:text-lg font-semibold py-3.5 px-6 rounded-full shadow-md hover:shadow-lg transition-all cursor-pointer"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Enquire on WhatsApp</span>
              </a>

              {/* Secondary Share on WhatsApp Button */}
              <a
                href={shareWhatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 active:scale-[0.98] text-gray-700 font-sans text-sm font-semibold py-3.5 px-5 rounded-full transition-all cursor-pointer shadow-2xs"
                title="Share this product on WhatsApp"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                </svg>
                <span>Share</span>
              </a>
            </div>
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
          3. SIMILAR & RECOMMENDED → RELATED PRODUCTS (4 Cards)
      ───────────────────────────────────────────────────────────── */}
      {displayBestSellers.length > 0 && (
        <section className="max-w-[1312px] mx-auto px-4 sm:px-6 pt-16 sm:pt-24">
        {/* Header Row - Center Aligned */}
        <div className="relative flex flex-col items-center justify-center text-center space-y-1 mb-8">
          <span className="inline-block text-[11px] font-bold text-[#B45309] bg-[#FEF3C7] px-2.5 py-0.5 rounded uppercase tracking-wider">
            Similar &amp; Recommended
          </span>
          <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] text-center">
            Related Products
          </h2>
          <p className="font-sans text-xs sm:text-sm text-gray-500 text-center">
            More curated essentials you might love.
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
              item.category || item.category_tag || item.categories?.name || 'BABY PRODUCTS'

            const itemUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${item.slug}` : `https://babysbazaar.com/product/${item.slug}`
            const itemWaUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
              `Hello Baby's Bazaar, I am interested in:\nProduct: ${item.title}\nPrice: ₹${itemPrice.toLocaleString('en-IN')}\nProduct Link: ${itemUrl}\n\nPlease share availability and delivery details.`
            )}`

            return (
              <div
                key={item.id}
                className="bg-white rounded-xl border border-gray-100 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
              >
                <div>
                  {/* Image with 'RECOMMENDED' top-left badge and Eye preview button */}
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

                    {/* Badge */}
                    <div className="absolute top-3 left-3 bg-[#A16207] text-white text-[10px] font-bold px-2 py-0.5 rounded-sm tracking-wider uppercase shadow-xs">
                      Popular
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
                    className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-full bg-[#25D366] hover:bg-[#20BD5A] active:scale-95 text-white text-xs font-semibold shadow-2xs transition-all cursor-pointer"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
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
