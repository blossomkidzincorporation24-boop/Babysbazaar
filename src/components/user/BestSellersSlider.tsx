'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import Container from '@/components/ui/Container'
import ProductCard, { ProductItem } from '@/components/user/ProductCard'

interface BestSellersSliderProps {
  products: ProductItem[]
  whatsappNumber?: string | null
}

export default function BestSellersSlider({
  products,
  whatsappNumber,
}: BestSellersSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  // Ensure up to 8 items in Best Sellers
  const displayProducts = products && products.length >= 8 ? products.slice(0, 8) : products

  const checkScroll = () => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)

    const cardWidth = 320
    const newIdx = Math.round(scrollLeft / cardWidth)
    setCurrentIndex(Math.min(Math.max(newIdx, 0), displayProducts.length - 1))
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
  }, [displayProducts.length])

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
        {/* Section Header - Center Aligned */}
        <div className="relative flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div>
            <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] mb-1 text-center">
              Best Sellers
            </h2>
            <p className="font-sans text-xs sm:text-sm text-gray-500 text-center">
              Loved and trusted by over 10,000+ happy parents across India
            </p>
          </div>

          {/* Right Controls: Arrow buttons & "view all >" */}
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
              href="/categories"
              className="text-xs sm:text-sm font-semibold text-[#F40436] hover:text-[#D9032F] transition-colors ml-2 sm:ml-4 whitespace-nowrap"
            >
              View all &rarr;
            </Link>
          </div>
        </div>

        {/* 8-Card Horizontal Slider Track */}
        {displayProducts.length > 0 ? (
          <>
            <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div
                ref={sliderRef}
                className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayProducts.map((product, index) => (
                  <div
                    key={product.id || index}
                    className="w-[75vw] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] min-w-[220px] sm:min-w-[260px] max-w-[320px] shrink-0 snap-start flex flex-col"
                  >
                    <ProductCard
                      product={product}
                      whatsappNumber={whatsappNumber}
                      badgeType="best_seller"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile Swipe Cue & Dot Indicators */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
              {displayProducts.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!sliderRef.current) return
                    const cardWidth = sliderRef.current.clientWidth * 0.85
                    sliderRef.current.scrollTo({
                      left: idx * cardWidth,
                      behavior: 'smooth',
                    })
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${
                    idx === currentIndex
                      ? 'w-6 bg-[#E21352]'
                      : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-gray-500 font-sans">
            <p className="text-sm font-medium">No best sellers available yet.</p>
          </div>
        )}
      </Container>
    </section>
  )
}
