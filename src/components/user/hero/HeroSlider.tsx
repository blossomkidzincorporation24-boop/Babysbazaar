'use client'

import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { HeroSlideData } from './types'
import HeroSlide from './HeroSlide'
import Container from '@/components/ui/Container'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroSliderProps {
  slides?: HeroSlideData[]
}

const AUTOPLAY_DURATION = 5000

export default function HeroSlider({ slides = [] }: HeroSliderProps) {
  const validSlides = useMemo(() => {
    const now = new Date()
    const activeList = slides.filter((slide) => {
      const isActive =
        slide.status === 'active' ||
        slide.is_active === true ||
        (!slide.status && slide.is_active !== false)
      if (!isActive) return false
      if (slide.start_date) {
        const start = new Date(slide.start_date)
        if (!isNaN(start.getTime()) && start > now) return false
      }
      if (slide.end_date) {
        const end = new Date(slide.end_date)
        if (!isNaN(end.getTime()) && end < now) return false
      }
      return true
    })
    activeList.sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
    return activeList
  }, [slides])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [progress, setProgress] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null)
  const progressStartRef = useRef<number>(Date.now())

  const total = validSlides.length
  const hasMultiple = total > 1

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % total)
    setProgress(0)
    progressStartRef.current = Date.now()
  }, [total])

  const prevSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + total) % total)
    setProgress(0)
    progressStartRef.current = Date.now()
  }, [total])

  const goToSlide = useCallback((index: number) => {
    setCurrentIndex(index)
    setProgress(0)
    progressStartRef.current = Date.now()
  }, [])

  // Autoplay
  useEffect(() => {
    if (!hasMultiple || isPaused) {
      if (timerRef.current) clearInterval(timerRef.current)
      return
    }
    timerRef.current = setInterval(nextSlide, AUTOPLAY_DURATION)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [hasMultiple, isPaused, nextSlide])

  // Progress bar
  useEffect(() => {
    if (!hasMultiple || isPaused) {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current)
      return
    }
    setProgress(0)
    progressStartRef.current = Date.now()
    progressTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - progressStartRef.current
      setProgress(Math.min((elapsed / AUTOPLAY_DURATION) * 100, 100))
    }, 40)
    return () => { if (progressTimerRef.current) clearInterval(progressTimerRef.current) }
  }, [currentIndex, hasMultiple, isPaused])

  // Touch
  const touchStartX = useRef<number | null>(null)
  const handleTouchStart = (e: React.TouchEvent) => { setIsPaused(true); touchStartX.current = e.touches[0].clientX }
  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsPaused(false)
    if (touchStartX.current !== null) {
      const diff = touchStartX.current - e.changedTouches[0].clientX
      if (diff > 50) nextSlide()
      else if (diff < -50) prevSlide()
    }
    touchStartX.current = null
  }

  // Keyboard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prevSlide()
    else if (e.key === 'ArrowRight') nextSlide()
  }

  if (validSlides.length === 0) {
    return (
      <section aria-label="Hero Banner" className="w-full pt-4 sm:pt-6">
        <Container>
          <div className="relative w-full h-[280px] sm:h-[380px] md:h-[450px] rounded-2xl md:rounded-3xl overflow-hidden bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 shadow-2xl flex items-center justify-center text-center p-6">
            <div className="max-w-xl text-white space-y-3">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-roboto-slab tracking-tight drop-shadow-md">
                Baby&apos;s Bazaar – Baby Store in Erode
              </h1>
              <p className="text-sm sm:text-base md:text-lg text-white/90 font-medium">
                Baby clothes, newborn essentials, toys and baby care products in Erode.
              </p>
            </div>
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section
      aria-label="Hero Carousel"
      className="w-full pt-4 sm:pt-6 outline-none"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <Container>
        {/* Hero frame — responsive height */}
        <div className="relative w-full h-[320px] sm:h-[420px] md:h-[500px] lg:h-[580px] xl:h-[640px] rounded-2xl md:rounded-3xl overflow-hidden bg-gray-900 shadow-2xl">

          {/* Slides */}
          {validSlides.map((slide, index) => (
            <HeroSlide
              key={slide.id || index}
              slide={slide}
              isActive={index === currentIndex}
              isPriority={index === 0}
              slideIndex={index}
            />
          ))}

          {/* ── Left / Right Navigation Arrows ── */}
          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); prevSlide() }}
                aria-label="Previous slide"
                className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/90 text-white hover:text-gray-900 backdrop-blur-sm border border-white/20 hover:border-transparent transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); nextSlide() }}
                aria-label="Next slide"
                className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/15 hover:bg-white/90 text-white hover:text-gray-900 backdrop-blur-sm border border-white/20 hover:border-transparent transition-all duration-300 flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </button>
            </>
          )}

          {/* ── Slide Counter (e.g. 01 / 03) + Dot Indicators ── */}
          {hasMultiple && (
            <div className="absolute bottom-5 sm:bottom-6 left-0 right-0 z-20 flex items-center justify-center gap-4 px-6">
              {/* Slide number */}
              <span className="text-white/50 text-xs font-mono tabular-nums hidden sm:block">
                {String(currentIndex + 1).padStart(2, '0')}
              </span>

              {/* Dot indicators */}
              <div className="flex items-center gap-2">
                {validSlides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); goToSlide(idx) }}
                    aria-label={`Go to slide ${idx + 1}`}
                    className={`rounded-full transition-all duration-500 cursor-pointer ${
                      idx === currentIndex
                        ? 'w-8 h-2 bg-white'
                        : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>

              {/* Total count */}
              <span className="text-white/50 text-xs font-mono tabular-nums hidden sm:block">
                {String(total).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* ── Autoplay Progress Bar (bottom edge) ── */}
          {hasMultiple && (
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/10 z-20">
              <div
                className="h-full bg-gradient-to-r from-[#F40436] to-[#FF6B9D]"
                style={{
                  width: `${progress}%`,
                  transition: isPaused ? 'none' : 'width 40ms linear',
                }}
              />
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
