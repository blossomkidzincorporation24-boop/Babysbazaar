'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Container from '@/components/ui/Container'

interface PhotoItem {
  id: string
  image: string
  caption?: string | null
}

interface CustomerPhotosProps {
  photos?: PhotoItem[]
}

export default function CustomerPhotos({ photos = [] }: CustomerPhotosProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const displayPhotos = (photos || []).filter(Boolean)

  if (!displayPhotos || displayPhotos.length === 0) {
    return null
  }

  const checkScroll = () => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)

    const cardWidth = 300
    const newIdx = Math.round(scrollLeft / cardWidth)
    setCurrentIndex(Math.min(Math.max(newIdx, 0), displayPhotos.length - 1))
  }

  useEffect(() => {
    checkScroll()
    const current = sliderRef.current
    if (current) {
      current.addEventListener('scroll', checkScroll, { passive: true })
      window.addEventListener('resize', checkScroll)
    }
    return () => {
      if (current) current.removeEventListener('scroll', checkScroll)
      window.removeEventListener('resize', checkScroll)
    }
  }, [displayPhotos.length])

  const slide = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const container = sliderRef.current
    const scrollAmount = container.clientWidth > 768 ? container.clientWidth * 0.75 : 300
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="w-full py-10 lg:py-16 overflow-hidden">
      <Container>
        {/* Section Header */}
        <div className="relative flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div>
            <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] text-center">
              Loved by Little Ones ❤️
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-sans text-center">
              Real moments from our happy parents & little ones
            </p>
          </div>

          {/* Right Controls: Arrow buttons & "see all >" */}
          <div className="flex items-center gap-3 sm:gap-4 mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <button
                onClick={() => slide('left')}
                disabled={!canScrollLeft}
                aria-label="Slide Left"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                onClick={() => slide('right')}
                disabled={!canScrollRight}
                aria-label="Slide Right"
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight size={20} />
              </button>
            </div>

            <Link
              href="/about-us#happy-customers"
              className="text-xs sm:text-sm font-semibold text-[#F40436] hover:text-[#D9032F] transition-colors ml-2 sm:ml-4 whitespace-nowrap"
            >
              View all moments &rarr;
            </Link>
          </div>
        </div>

        {/* Horizontal Slider Container */}
        {displayPhotos.length > 0 ? (
          <>
            <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div
                ref={sliderRef}
                className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayPhotos.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    className="w-[75vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] min-w-[240px] sm:min-w-[280px] max-w-[340px] shrink-0 snap-start"
                  >
                    <div className="group relative aspect-[3/4.2] w-full rounded-3xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 bg-gray-100 border border-gray-100">
                      <Image
                        src={item.image}
                        alt={item.caption || 'Loved by Little Ones customer photo'}
                        fill
                        sizes="(max-width: 640px) 75vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {item.caption && (
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-8">
                          <p className="text-xs text-white font-medium line-clamp-1">
                            {item.caption}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Dots */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
              {displayPhotos.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!sliderRef.current) return
                    const cardWidth = sliderRef.current.clientWidth * 0.8
                    sliderRef.current.scrollTo({
                      left: idx * cardWidth,
                      behavior: 'smooth',
                    })
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-[#F40436]'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 font-sans">
            <p className="text-sm font-medium">No customer photos available yet.</p>
          </div>
        )}
      </Container>
    </section>
  )
}
