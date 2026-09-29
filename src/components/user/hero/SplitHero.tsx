'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroSlideData } from './types'

interface SplitHeroProps {
  slides?: HeroSlideData[]
}

const DEFAULT_HERO = {
  titlePrimary: 'Everything Your Little One Needs,',
  titleSecondary: 'All in One Place.',
  description:
    'Discover adorable clothing, toys, feeding essentials, baby care products and thoughtful gifts crafted with pure care and certified safety.',
  image:
    'https://api.builder.io/api/v1/image/assets/TEMP/446ba6bf7429149f836dcba5bd2dd456c1af5ac1?width=1160',
  button_text: 'Get your Product',
  link: '/categories',
}

export default function SplitHero({ slides = [] }: SplitHeroProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Filter active slides
  const activeSlides = slides.filter(
    (s) => s.status === 'active' || s.is_active !== false
  )

  const hasMultiple = activeSlides.length > 1

  useEffect(() => {
    if (!hasMultiple) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % activeSlides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [hasMultiple, activeSlides.length])

  const current = activeSlides[currentIndex]

  const title = current?.heading || current?.title || ''
  const description = current?.description || DEFAULT_HERO.description
  const image = current?.image || current?.image_url || DEFAULT_HERO.image

  return (
    <section className="max-w-[1312px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10 pb-8 sm:pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Typography */}
        <div className="lg:col-span-6 flex flex-col justify-center max-w-xl">
          <h1 className="font-roboto-slab text-3xl sm:text-4xl lg:text-[48px] font-bold text-[#1E1B18] tracking-tight leading-[1.18]">
            Everything Your Little <br className="hidden sm:inline" />
            One Needs,{' '}
            <span className="text-[#F40436] font-normal">All in One</span>{' '}
            <span className="text-[#F40436] font-normal">Place.</span>
          </h1>

          <p className="font-roboto-slab text-sm sm:text-base lg:text-[18px] text-[#534345] font-normal mt-4 sm:mt-6 leading-relaxed max-w-lg">
            {description}
          </p>

          {/* Optional CTA Button if configured */}
          {current?.button_text && (
            <div className="mt-6">
              <Link
                href={current?.link || '/categories'}
                className="inline-flex items-center justify-center bg-[#F40436] hover:bg-[#D9032F] active:scale-95 text-white font-roboto-slab font-semibold text-sm px-8 py-3 rounded-full shadow-md hover:shadow-lg transition-all"
              >
                {current.button_text}
              </Link>
            </div>
          )}

          {/* Slide Indicators if multiple */}
          {hasMultiple && (
            <div className="flex items-center gap-2 mt-6">
              {activeSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentIndex
                      ? 'w-7 bg-[#F40436]'
                      : 'w-2 bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Hero Photograph Card */}
        <div className="lg:col-span-6 flex justify-center lg:justify-end">
          <div className="relative w-full max-w-[580px] aspect-[5/4] rounded-3xl overflow-hidden shadow-[0_20px_25px_-5px_rgba(0,0,0,0.10),0_8px_10px_-6px_rgba(0,0,0,0.10)] bg-[#FBF2ED]">
            <Image
              src={image}
              alt="Gentle and loving mother smiling with her baby"
              fill
              sizes="(max-width: 1024px) 100vw, 580px"
              priority
              className="object-cover object-center"
            />
            {/* Subtle bottom gradient from Figma */}
            <div className="absolute inset-0 bg-gradient-to-t from-[rgba(52,48,44,0.30)] via-transparent to-transparent pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  )
}
