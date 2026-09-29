'use client'

import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import { OfferBanner } from '@/types/database.types'

interface PromoBannerProps {
  offer?: OfferBanner | null
}

export default function PromoBanner({ offer }: PromoBannerProps) {
  if (!offer) return null

  const banner = offer

  return (
    <section className="w-full py-10 lg:py-16">
      <Container>
        <div className="relative w-full h-72 sm:h-88 md:h-[420px] rounded-2xl md:rounded-3xl overflow-hidden shadow-xs">
          {/* Background Image */}
          <Image
            src={banner.image}
            alt={banner.title}
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-center"
          />

          {/* Soft Dark Gradient on Left */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />

          {/* Text Content */}
          <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-12 md:px-16 max-w-md md:max-w-xl">
            {banner.badge_text && (
              <span className="font-roboto-slab text-[10px] sm:text-xs font-bold uppercase tracking-widest text-[#FFCCD7] mb-2 bg-white/15 backdrop-blur-xs px-3.5 py-1 rounded-full w-fit">
                {banner.badge_text}
              </span>
            )}
            <h2 className="font-roboto-slab text-2xl sm:text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-tight whitespace-pre-line">
              {banner.title}
            </h2>
            {banner.subtitle && (
              <p className="font-roboto-slab text-xs sm:text-sm text-white/90 mt-2 sm:mt-3 leading-relaxed max-w-md">
                {banner.subtitle}
              </p>
            )}
            <div className="mt-5 sm:mt-7">
              <Link
                href={banner.button_link || '/categories'}
                className="inline-flex items-center justify-center bg-[#F40436] hover:bg-[#D9032F] active:scale-95 text-white font-roboto-slab font-semibold text-xs sm:text-sm px-8 py-3 rounded-full shadow-lg transition-all cursor-pointer"
              >
                {banner.button_text || 'Shop Collection'}
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </section>
  )
}
