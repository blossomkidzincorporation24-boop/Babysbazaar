'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react'
import Container from '@/components/ui/Container'
import type { GoogleReviewsData, GoogleReview } from '@/lib/google/google-reviews'

function GoogleGIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.665-5.17 3.665-9.12z"
        fill="#4285F4"
      />
      <path
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.13C3.27 21.39 7.33 24 12 24z"
        fill="#34A853"
      />
      <path
        d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.13z"
        fill="#FBBC05"
      />
      <path
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.27 2.61 1.25 6.58l4.03 3.13c.95-2.83 3.6-4.96 6.72-4.96z"
        fill="#EA4335"
      />
    </svg>
  )
}

function AuthorAvatar({ name, photoUri }: { name: string; photoUri?: string }) {
  const [imgError, setImgError] = useState(false)
  const initial = (name.trim().charAt(0) || 'C').toUpperCase()

  // Deterministic pastel background
  const colors = [
    'bg-rose-100 text-rose-700',
    'bg-amber-100 text-amber-700',
    'bg-emerald-100 text-emerald-700',
    'bg-sky-100 text-sky-700',
    'bg-indigo-100 text-indigo-700',
    'bg-purple-100 text-purple-700',
  ]
  const colorIndex = (name.charCodeAt(0) || 0) % colors.length
  const colorClass = colors[colorIndex]

  if (!photoUri || imgError) {
    return (
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200 ${colorClass}`}
        aria-hidden="true"
      >
        {initial}
      </div>
    )
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
      <Image
        src={photoUri}
        alt={name}
        fill
        sizes="40px"
        className="object-cover"
        onError={() => setImgError(true)}
      />
    </div>
  )
}

function ReviewCard({ review }: { review: GoogleReview }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const isLong = review.text.length > 180
  const displayText = isLong && !isExpanded ? `${review.text.slice(0, 180)}...` : review.text

  return (
    <div className="w-[82vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] min-w-[260px] sm:min-w-[300px] max-w-[380px] shrink-0 snap-start bg-white rounded-xl border border-[#D1D1D1] p-4 sm:p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Card Header: Avatar, Name, Relative Date & Google G */}
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div className="flex items-center gap-2.5 min-w-0">
            <AuthorAvatar name={review.authorName} photoUri={review.authorPhotoUri} />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 font-sans leading-tight truncate">
                {review.authorName}
              </h3>
              {review.relativeTimeDescription && (
                <p className="text-[11px] text-gray-400 font-sans mt-0.5 truncate">
                  {review.relativeTimeDescription}
                </p>
              )}
            </div>
          </div>

          <div className="p-1 rounded-full bg-gray-50 border border-gray-100 shrink-0" title="Google Review">
            <GoogleGIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-2.5" aria-label={`${review.rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={15}
              className={i < review.rating ? 'fill-[#FBBC05] text-[#FBBC05]' : 'fill-gray-200 text-gray-200'}
            />
          ))}
          <span className="text-xs font-semibold text-gray-600 ml-1.5 font-sans">
            {review.rating.toFixed(1)}
          </span>
        </div>

        {/* Review Text */}
        <p className="text-xs sm:text-sm text-gray-800 leading-relaxed font-sans">
          &ldquo;{displayText}&rdquo;
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-medium text-[#F40436] hover:underline mt-1 cursor-pointer"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Card Footer: Verified on Google */}
      <div className="pt-3 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
        <span className="flex items-center gap-1 text-[11px] text-gray-500">
          <svg className="w-3.5 h-3.5 text-emerald-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Google Verified Review
        </span>

        {review.googleMapsUri && (
          <a
            href={review.googleMapsUri}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-gray-500 hover:text-black flex items-center gap-1 transition-colors"
          >
            View on Maps
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </div>
  )
}

export default function GoogleReviewsSlider({ data }: { data: GoogleReviewsData }) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)

  const reviews = data.reviews

  const checkScroll = () => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)

    const cardWidth = 320
    const newIdx = Math.round(scrollLeft / cardWidth)
    setCurrentIndex(Math.min(Math.max(newIdx, 0), reviews.length - 1))
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
  }, [reviews.length])

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
    <section className="w-full py-10 lg:py-16 overflow-hidden bg-white">
      <Container>
        {/* Section Header */}
        <div className="relative flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 mb-2">
              <GoogleGIcon className="w-3.5 h-3.5" />
              <span>Google Verified Reviews</span>
            </div>

            <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[34px] font-semibold text-[#F40436] text-center">
              Rating And Reviews
            </h2>

            <p className="text-xs sm:text-sm text-gray-600 mt-1 font-sans text-center flex items-center justify-center gap-1.5 flex-wrap">
              <span className="font-semibold text-gray-900">{data.rating.toFixed(1)}★</span>
              <span>Average Rating on Google from over {data.totalReviews}+ parents</span>
            </p>
          </div>

          {/* Slide Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
            <button
              type="button"
              onClick={() => slide('left')}
              disabled={!canScrollLeft}
              aria-label="Slide Left"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => slide('right')}
              disabled={!canScrollRight}
              aria-label="Slide Right"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            ref={sliderRef}
            className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>

        {/* Mobile Swipe Cue & Dot Indicators */}
        {reviews.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!sliderRef.current) return
                  const cardWidth = sliderRef.current.clientWidth * 0.88
                  sliderRef.current.scrollTo({
                    left: idx * cardWidth,
                    behavior: 'smooth',
                  })
                }}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-[#E21352]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Google CTA Footer */}
        {data.googleMapsUri && (
          <div className="mt-8 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={data.googleMapsUri}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-sans text-xs sm:text-sm font-medium border border-gray-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
            >
              <GoogleGIcon className="w-4 h-4" />
              <span>View all reviews on Google Maps</span>
              <ExternalLink size={13} className="text-gray-400" />
            </a>
          </div>
        )}
      </Container>
    </section>
  )
}
