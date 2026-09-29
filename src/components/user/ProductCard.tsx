'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

export interface ProductItem {
  id: string
  title: string
  slug: string
  price: number
  price_display?: string
  description?: string | null
  product_images?: string[]
  new_arrival?: boolean
  best_seller?: boolean
  category_tag?: string
  categories?: { name?: string; slug?: string } | { name?: string; slug?: string }[] | null | any
}

interface ProductCardProps {
  product: ProductItem
  whatsappNumber?: string | null
  badgeType?: 'best_seller' | 'new_arrival'
}

export default function ProductCard({ product, whatsappNumber }: ProductCardProps) {
  const cleanPhone = whatsappNumber?.replace(/\D/g, '') || '919965512123'
  const imageUrl =
    product.product_images?.[0] ||
    'https://api.builder.io/api/v1/image/assets/TEMP/3a043f6484a7e6ba40d92608cd7bc243cdd19583?width=664'
  const categoryTag =
    product.category_tag ||
    (Array.isArray(product.categories)
      ? product.categories[0]?.name
      : product.categories?.name) ||
    'BABY ESSENTIALS'

  // WhatsApp prefilled message
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : `https://babysbazaar.com/product/${product.slug}`
  const waText = encodeURIComponent(
    `Hi Baby's Bazaar,\nI want to enquire about ${product.title} priced at ${product.price_display || formatPrice(product.price)}.\n\nProduct:\n${productUrl}`
  )
  const waUrl = `https://wa.me/${cleanPhone}?text=${waText}`

  return (
    <div className="bg-white rounded-xl border border-[#D1D1D1] p-2.5 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group/card w-full">
      <Link href={`/product/${product.slug}`} className="flex flex-col flex-1 group/link">
        {/* Product Image Container (Enforced 1:1 Aspect Ratio, object-cover, object-center, no distortion) */}
        <div className="relative aspect-square w-full rounded-lg sm:rounded-xl overflow-hidden bg-gray-50 mb-2.5 sm:mb-3 shrink-0">
          <Image
            src={imageUrl}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover/link:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Category Tag */}
        <p className="font-roboto-slab text-[10px] sm:text-[11px] font-semibold text-[#FF3A3A] tracking-[0.55px] uppercase mb-1 line-clamp-1">
          {categoryTag}
        </p>

        {/* Product Title (Controlled line-clamp & min-height for uniform row alignment) */}
        <h3 className="font-roboto-slab text-xs sm:text-base font-semibold text-[#1C1C18] leading-snug group-hover/link:text-[#FF3A3A] transition-colors mb-1.5 line-clamp-2 min-h-[2.25rem] sm:min-h-[2.6rem] flex items-center">
          {product.title}
        </h3>

        {/* Product Description (2-3 lines clamp & min-height for equal card height) */}
        <p className="font-roboto-slab text-[11px] sm:text-xs text-[#55433F] leading-normal line-clamp-2 sm:line-clamp-3 min-h-[2.1rem] sm:min-h-[2.8rem] mb-3">
          {product.description || ''}
        </p>
      </Link>

      {/* Bottom Bar: Price + Enquire Button visually aligned at card bottom */}
      <div className="mt-auto pt-2.5 border-t border-gray-100 flex items-center justify-between gap-1.5 sm:gap-2">
        <span className="font-roboto-slab text-xs sm:text-sm md:text-[15px] font-bold text-[#FF3A3A] tracking-tight shrink-0">
          {product.price_display || `₹${product.price?.toLocaleString('en-IN') || product.price}`}
        </span>

        {/* Green WhatsApp Enquire Button */}
        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-sans text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-xs transition-all cursor-pointer shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" className="shrink-0">
            <path
              d="M2.66667 8H8V6.66667H2.66667V8ZM2.66667 6H10.6667V4.66667H2.66667V6ZM2.66667 4H10.6667V2.66667H2.66667V4ZM0 13.3333V1.33333C0 0.966667 0.130556 0.652778 0.391667 0.391667C0.652778 0.130556 0.966667 0 1.33333 0H12C12.3667 0 12.6806 0.130556 12.9417 0.391667C13.2028 0.652778 13.3333 0.966667 13.3333 1.33333V9.33333C13.3333 9.7 13.2028 10.0139 12.9417 10.275C12.6806 10.5361 12.3667 10.6667 12 10.6667H2.66667L0 13.3333ZM2.1 9.33333H12V1.33333H1.33333V10.0833L2.1 9.33333ZM1.33333 9.33333V1.33333V9.33333Z"
              fill="white"
            />
          </svg>
          <span>Enquire</span>
        </a>
      </div>
    </div>
  )
}
