'use client'

import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { HeroSlideData } from './types'

interface HeroSlideProps {
  slide: HeroSlideData
  isActive: boolean
  isPriority?: boolean
  slideIndex: number
}

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=1600&q=80'

// Unique Ken Burns zoom origin per slide for variety
const ZOOM_ORIGINS = ['center', 'top left', 'top right', 'bottom left', 'bottom right']

export default function HeroSlide({ slide, isActive, isPriority = false, slideIndex }: HeroSlideProps) {
  const [imgError, setImgError] = useState(false)
  const [entered, setEntered] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const desktopImage = imgError
    ? FALLBACK_IMAGE
    : slide.image_url || slide.image || FALLBACK_IMAGE
  const mobileImage = slide.mobile_image || slide.mobile_image_url || desktopImage

  const title = slide.title || slide.heading || 'Everything Your Little One Needs'
  const description = slide.description || slide.subtitle || ''
  const buttonText = slide.button_text || null
  const buttonLink = slide.button_link || slide.link || '/categories'
  const isExternal = buttonLink ? (buttonLink.startsWith('http://') || buttonLink.startsWith('https://')) : false

  const zoomOrigin = ZOOM_ORIGINS[slideIndex % ZOOM_ORIGINS.length]

  // Stagger the text entrance slightly after the slide becomes active
  useEffect(() => {
    if (isActive) {
      timerRef.current = setTimeout(() => setEntered(true), 120)
    } else {
      if (timerRef.current) clearTimeout(timerRef.current)
      setEntered(false)
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [isActive])

  return (
    <div
      className="absolute inset-0 w-full h-full select-none overflow-hidden"
      style={{
        opacity: isActive ? 1 : 0,
        transition: 'opacity 700ms cubic-bezier(0.4, 0, 0.2, 1)',
        zIndex: isActive ? 10 : 0,
        pointerEvents: isActive ? 'auto' : 'none',
      }}
      aria-hidden={!isActive}
    >
      {/* Ken Burns background image */}
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          transform: isActive ? 'scale(1.08)' : 'scale(1)',
          transformOrigin: zoomOrigin,
          transition: isActive ? 'transform 4500ms cubic-bezier(0.25, 0.46, 0.45, 0.94)' : 'transform 700ms ease',
        }}
      >
        <picture>
          {mobileImage && mobileImage !== desktopImage && (
            <source media="(max-width: 768px)" srcSet={mobileImage} />
          )}
          <Image
            src={desktopImage}
            alt={title}
            fill
            priority={isPriority}
            sizes="(max-width: 768px) 100vw, 1400px"
            className="object-cover object-center"
            onError={() => setImgError(true)}
          />
        </picture>
      </div>

      {/* Light gradient overlay - only left edge for text readability */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/10 to-transparent" />

      {/* Slide Content */}
      <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="max-w-[520px] lg:max-w-[580px]">

          {/* Thin accent line */}
          <div
            style={{
              width: entered ? '48px' : '0px',
              transition: 'width 600ms cubic-bezier(0.4, 0, 0.2, 1) 100ms',
              height: '3px',
              background: 'linear-gradient(90deg, #F40436, #FF6B9D)',
              borderRadius: '9999px',
              marginBottom: '16px',
            }}
          />

          {/* Main Heading */}
          {slideIndex === 0 ? (
            <h1
              className="font-roboto-slab text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.12] drop-shadow-lg"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0px)' : 'translateY(20px)',
                transition: 'opacity 500ms ease 100ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms',
              }}
            >
              {title}
            </h1>
          ) : (
            <h2
              className="font-roboto-slab text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white tracking-tight leading-[1.12] drop-shadow-lg"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0px)' : 'translateY(20px)',
                transition: 'opacity 500ms ease 100ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 100ms',
              }}
            >
              {title}
            </h2>
          )}

          {/* Description */}
          {description && (
            <p
              className="text-sm sm:text-base md:text-lg text-white font-normal mt-3 sm:mt-4 leading-relaxed line-clamp-3 sm:line-clamp-none drop-shadow-md"
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0px)' : 'translateY(16px)',
                transition: 'opacity 500ms ease 220ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 220ms',
              }}
            >
              {description}
            </p>
          )}

          {/* CTA Button */}
          {buttonText && (
            <div
              style={{
                opacity: entered ? 1 : 0,
                transform: entered ? 'translateY(0px)' : 'translateY(16px)',
                transition: 'opacity 500ms ease 320ms, transform 500ms cubic-bezier(0.25, 0.46, 0.45, 0.94) 320ms',
                marginTop: '28px',
              }}
            >
              {isExternal ? (
                <a
                  href={buttonLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] active:scale-95 text-white font-semibold text-sm sm:text-base px-7 sm:px-9 py-3 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {buttonText}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </a>
              ) : (
                <Link
                  href={buttonLink}
                  className="inline-flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] active:scale-95 text-white font-semibold text-sm sm:text-base px-7 sm:px-9 py-3 sm:py-3.5 rounded-full shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer"
                >
                  {buttonText}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
