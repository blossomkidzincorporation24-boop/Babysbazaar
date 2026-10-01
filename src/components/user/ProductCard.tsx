'use client'

import Image from 'next/image'
import Link from 'next/link'
import { formatPrice, buildWhatsAppEnquiryUrl } from '@/lib/utils'
import { getSiteUrl } from '@/lib/seo'

export interface ProductItem {
  id: string
  title: string
  slug: string
  price: number
  price_display?: string
  description?: string | null
  short_description?: string | null
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
  const imageUrl =
    product.product_images?.[0] ||
    'https://api.builder.io/api/v1/image/assets/TEMP/3a043f6484a7e6ba40d92608cd7bc243cdd19583?width=664'
  const categoryTag =
    product.category_tag ||
    (Array.isArray(product.categories)
      ? product.categories[0]?.name
      : product.categories?.name) ||
    'BABY ESSENTIALS'

  // Standardized WhatsApp prefilled message
  const productUrl = typeof window !== 'undefined' ? `${window.location.origin}/product/${product.slug}` : `${getSiteUrl()}/product/${product.slug}`
  const formattedPrice = product.price_display || `₹${product.price?.toLocaleString('en-IN') || product.price}`
  const waUrl = buildWhatsAppEnquiryUrl({
    whatsappNumber,
    productTitle: product.title,
    price: formattedPrice,
    productUrl,
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-200/90 hover:border-gray-300 p-2.5 sm:p-3.5 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between h-full group/card w-full">
      <Link href={`/product/${product.slug}`} className="flex flex-col flex-1 group/link">
        {/* Product Image Container (Enforced 1:1 Aspect Ratio, object-cover, object-center, no distortion) */}
        <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-gray-50 mb-2.5 sm:mb-3 shrink-0">
          <Image
            src={imageUrl}
            alt={`${product.title} - Baby's Bazaar Erode`}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover/link:scale-105 transition-transform duration-300"
          />
        </div>

        {/* Category Tag */}
        <p className="font-sans text-[11px] font-semibold text-[#E1144B] mb-1 line-clamp-1">
          {categoryTag}
        </p>

        {/* Product Title */}
        <h3 className="font-roboto-slab text-xs sm:text-base font-semibold text-[#1C1C18] leading-snug group-hover/link:text-[#FF3A3A] transition-colors mb-1.5 line-clamp-2">
          {product.title}
        </h3>

        {/* Product Description - renders only when present */}
        {product.description?.trim() ? (
          <p className="font-roboto-slab text-[11px] sm:text-xs text-[#55433F] leading-normal line-clamp-2 mb-2">
            {product.description.trim()}
          </p>
        ) : null}
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
          aria-label={`Enquire about ${product.title} on WhatsApp`}
          className="inline-flex items-center justify-center gap-1 sm:gap-1.5 bg-[#25D366] hover:bg-[#20ba59] active:scale-95 text-white font-sans text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-full shadow-xs transition-all cursor-pointer shrink-0"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
          </svg>
          <span>Enquire</span>
        </a>
      </div>
    </div>
  )
}
