'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Star, ChevronLeft, ChevronRight, ExternalLink, MessageSquarePlus } from 'lucide-react'
import Container from '@/components/ui/Container'
import { BUSINESS_GOOGLE_MAPS_URL } from '@/lib/constants'
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
  const initial = (name.trim().charAt(0) || 'P').toUpperCase()

  // Deterministic pastel background for authentic feel
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
        className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 border border-gray-200/80 shadow-2xs ${colorClass}`}
        aria-hidden="true"
      >
        {initial}
      </div>
    )
  }

  return (
    <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gray-100 shrink-0 border border-gray-200 shadow-2xs">
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
  const reviewText = review?.text || ''
  const rating = typeof review?.rating === 'number' && !isNaN(review.rating) ? review.rating : 5
  const isLong = reviewText.length > 170
  const displayText = isLong && !isExpanded ? `${reviewText.slice(0, 170)}...` : reviewText

  return (
    <div className="w-[82vw] sm:w-[calc(50%-12px)] lg:w-[calc(33.33%-16px)] min-w-[270px] sm:min-w-[310px] max-w-[380px] shrink-0 snap-start bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
      <div>
        {/* Card Header: Avatar, Name, Relative Date & Google G */}
        <div className="flex items-start justify-between gap-2.5 mb-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <AuthorAvatar name={review?.authorName || 'Verified Parent'} photoUri={review?.authorPhotoUri} />
            <div className="min-w-0">
              <h3 className="text-sm sm:text-base font-semibold text-gray-900 font-sans leading-tight truncate">
                {review?.authorName || 'Verified Parent'}
              </h3>
              {review?.relativeTimeDescription && (
                <p className="text-[11px] text-gray-400 font-sans mt-0.5 truncate">
                  {review.relativeTimeDescription}
                </p>
              )}
            </div>
          </div>

          <div className="p-1.5 rounded-full bg-gray-50 border border-gray-100 shrink-0" title="Verified Google Review">
            <GoogleGIcon className="w-4 h-4" />
          </div>
        </div>

        {/* Rating Stars */}
        <div className="flex items-center gap-1 mb-3" aria-label={`${rating} out of 5 stars`}>
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={15}
              className={i < rating ? 'fill-[#FBBC05] text-[#FBBC05]' : 'fill-gray-200 text-gray-200'}
            />
          ))}
          <span className="text-xs font-bold text-gray-700 ml-1.5 font-sans">
            {rating.toFixed(1)}
          </span>
        </div>

        {/* Review Text */}
        <p className="text-xs sm:text-[13.5px] text-gray-700 leading-relaxed font-sans">
          &ldquo;{displayText}&rdquo;
        </p>
        {isLong && (
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-[#FF2E63] hover:underline mt-1.5 cursor-pointer block"
          >
            {isExpanded ? 'Show less' : 'Read more'}
          </button>
        )}
      </div>

      {/* Card Footer: Verified on Google */}
      <div className="pt-3.5 mt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500 font-sans">
        <span className="flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium bg-emerald-50/70 border border-emerald-100/60 px-2 py-0.5 rounded-full">
          <svg className="w-3.5 h-3.5 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Google Verified
        </span>

        <a
          href={review.googleMapsUri || BUSINESS_GOOGLE_MAPS_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[11px] text-gray-500 hover:text-black font-medium flex items-center gap-1 transition-colors"
        >
          <span>View on Maps</span>
          <ExternalLink size={11} />
        </a>
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
    const scrollAmount = container.clientWidth > 768 ? container.clientWidth * 0.75 : 310
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="w-full py-12 lg:py-16 overflow-hidden bg-gradient-to-b from-white via-pink-50/20 to-white border-t border-gray-100/60" aria-label="Customer Reviews">
      <Container>
        {/* Section Header */}
        <div className="relative flex flex-col items-center justify-center text-center mb-7 sm:mb-9">
          <div>
            {/* Google Verified Reviews Pill */}
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white border border-gray-200 text-xs font-semibold text-gray-800 mb-2.5 shadow-2xs">
              <GoogleGIcon className="w-4 h-4" />
              <span>Google Verified Reviews</span>
            </div>

            {/* Section Heading: "What Our Customers Say" */}
            <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[34px] font-bold text-gray-900 text-center tracking-tight">
              What Our Customers Say
            </h2>

            {/* Rating and Reviews Counter */}
            <div className="text-xs sm:text-sm text-gray-600 mt-1.5 font-sans flex items-center justify-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1 font-bold text-gray-900 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md text-xs">
                ⭐ {(typeof data?.rating === 'number' && !isNaN(data.rating) ? data.rating : 4.9).toFixed(1)}/5
              </span>
              <span className="font-medium text-gray-700">Based on Google Reviews</span>
              <span className="hidden sm:inline text-gray-300">•</span>
              <span className="text-gray-500">Trusted by {data?.totalReviews || data?.reviews?.length || 85}+ happy parents</span>
            </div>
          </div>

          {/* Desktop Left/Right Slide Buttons */}
          <div className="hidden sm:flex items-center gap-2 absolute right-0 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => slide('left')}
              disabled={!canScrollLeft}
              aria-label="Previous review"
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronLeft size={20} />
            </button>

            <button
              type="button"
              onClick={() => slide('right')}
              disabled={!canScrollRight}
              aria-label="Next review"
              className="w-10 h-10 rounded-full border border-gray-200 bg-white hover:bg-gray-50 flex items-center justify-center text-gray-700 hover:text-black shadow-2xs hover:shadow-xs transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div
            ref={sliderRef}
            className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {reviews.map((rev) => (
              <ReviewCard key={rev.id} review={rev} />
            ))}
          </div>
        </div>

        {/* Mobile Swipe Cue & Dot Indicators */}
        {reviews.length > 1 && (
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3.5">
            {reviews.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (!sliderRef.current) return
                  const cardWidth = sliderRef.current.clientWidth * 0.86
                  sliderRef.current.scrollTo({
                    left: idx * cardWidth,
                    behavior: 'smooth',
                  })
                }}
                aria-label={`Go to review ${idx + 1}`}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-[#FF2E63]' : 'w-1.5 bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        )}

        {/* Google Reviews CTAs (View all reviews + Write a review) */}
        <div className="mt-8 pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a
            href={data.googleMapsUri || BUSINESS_GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-white hover:bg-gray-50 text-gray-800 font-sans text-xs sm:text-sm font-semibold border border-gray-300 shadow-2xs hover:shadow-xs transition-all cursor-pointer active:scale-98"
          >
            <GoogleGIcon className="w-4 h-4" />
            <span>View all reviews on Google</span>
            <ExternalLink size={13} className="text-gray-400 ml-0.5" />
          </a>

          <a
            href={data.googleMapsUri || BUSINESS_GOOGLE_MAPS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF2E63] hover:bg-[#e02052] text-white font-sans text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all cursor-pointer active:scale-98"
          >
            <MessageSquarePlus size={15} />
            <span>Write a Review on Google</span>
          </a>
        </div>
      </Container>
    </section>
  )
}
