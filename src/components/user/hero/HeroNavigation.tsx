'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HeroNavigationProps {
  onPrev: () => void
  onNext: () => void
}

export default function HeroNavigation({ onPrev, onNext }: HeroNavigationProps) {
  return (
    <>
      {/* Previous Arrow */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onPrev()
        }}
        aria-label="Previous slide"
        className="absolute left-3 md:left-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/25 hover:bg-white/90 text-white hover:text-gray-900 backdrop-blur-md transition-all duration-200 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6 -ml-0.5" />
      </button>

      {/* Next Arrow */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onNext()
        }}
        aria-label="Next slide"
        className="absolute right-3 md:right-6 top-1/2 -translate-y-1/2 z-20 w-9 h-9 md:w-11 md:h-11 rounded-full bg-white/25 hover:bg-white/90 text-white hover:text-gray-900 backdrop-blur-md transition-all duration-200 flex items-center justify-center shadow-md hover:scale-105 active:scale-95 cursor-pointer"
      >
        <ChevronRight className="w-5 h-5 md:w-6 md:h-6 -mr-0.5" />
      </button>
    </>
  )
}
