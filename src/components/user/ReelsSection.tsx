'use client'

import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'
import { Play, Heart, MessageCircle, X, Share2, ChevronLeft, ChevronRight } from 'lucide-react'
import Container from '@/components/ui/Container'

export interface ReelItem {
  id: string
  title: string
  subtitle?: string
  thumbnail: string
  video: string
  status?: string
}

interface ReelsSectionProps {
  reels?: ReelItem[]
  whatsappNumber?: string | null
}

export default function ReelsSection({ reels = [], whatsappNumber }: ReelsSectionProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeVideo, setActiveVideo] = useState<string | null>(null)
  const [likedReels, setLikedReels] = useState<Record<string, boolean>>({})

  const cleanPhone = whatsappNumber?.replace(/\D/g, '') || '918489824888'
  const displayReels = (reels || []).filter(Boolean)

  const checkScroll = () => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10)

    const cardWidth = 260
    const newIdx = Math.round(scrollLeft / cardWidth)
    setCurrentIndex(Math.min(Math.max(newIdx, 0), displayReels.length - 1))
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
  }, [displayReels.length])

  const slide = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const container = sliderRef.current
    const scrollAmount = container.clientWidth > 768 ? container.clientWidth * 0.75 : 280
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    })
  }

  const handleBuyViaWhatsApp = (title: string) => {
    const text = encodeURIComponent(
      `Hi Baby's Bazaar, I saw your reel for *${title}* and want to purchase / enquire about it!`
    )
    window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank')
  }

  const toggleLike = (id: string) => {
    setLikedReels((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const handleShare = async (reel: ReelItem) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: reel.title,
          text: `Check out this Baby's Bazaar reel for ${reel.title}!`,
          url: window.location.href,
        })
      } catch {
        // User dismissed share
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('Link copied to clipboard!')
    }
  }

  if (!displayReels || displayReels.length === 0) {
    return null
  }

  return (
    <section className="w-full py-10 lg:py-16 overflow-hidden">
      <Container>
        {/* Section Header - Center Aligned */}
        <div className="relative flex flex-col items-center justify-center text-center mb-6 sm:mb-8">
          <div>
            <h2 className="font-roboto-slab text-2xl sm:text-3xl lg:text-4xl font-bold text-[#F40436] text-center">
              Trending Reels &amp; Unboxings
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 font-sans text-center">
              Watch real parent unboxings, demo videos, and styling tips
            </p>
          </div>

          {/* Slide Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-3 sm:mt-0 sm:absolute sm:right-0 sm:top-1/2 sm:-translate-y-1/2">
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
        </div>

        {/* 8-Card Horizontal Reels Slider Track */}
        {displayReels.length > 0 ? (
          <>
            <div className="overflow-hidden -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
              <div
                ref={sliderRef}
                className="flex items-stretch gap-5 sm:gap-6 overflow-x-auto scrollbar-none scroll-smooth pb-4 pt-1 snap-x snap-mandatory"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {displayReels.map((reel) => {
                  const isLiked = likedReels[reel.id]
                  return (
                    <div
                      key={reel.id}
                      className="w-[72vw] sm:w-[calc(33.33%-14px)] lg:w-[calc(25%-18px)] min-w-[220px] sm:min-w-[240px] max-w-[290px] shrink-0 snap-start bg-white rounded-2xl border border-[#D1D1D1] shadow-2xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between"
                    >
                      {/* Vertical Video Thumbnail */}
                      <div
                        onClick={() => setActiveVideo(reel.video)}
                        className="relative aspect-[9/13] w-full bg-gray-100 cursor-pointer group overflow-hidden"
                      >
                        <Image
                          src={reel.thumbnail}
                          alt={reel.title}
                          fill
                          sizes="(max-width: 640px) 72vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />

                        {/* Dark subtle overlay on hover */}
                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors" />

                        {/* Centered Play Button */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/85 group-hover:bg-white text-gray-800 shadow-lg flex items-center justify-center group-hover:scale-110 transition-all">
                            <Play size={20} className="ml-0.5 text-black" fill="currentColor" />
                          </div>
                        </div>
                      </div>

                      {/* Bottom Info & CTA */}
                      <div className="p-3.5 space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-roboto-slab text-xs sm:text-sm font-bold text-gray-900 truncate max-w-[150px] sm:max-w-[170px]">
                              {reel.title}
                            </h3>
                            <p className="text-[11px] text-gray-400 font-medium mt-0.5">{reel.subtitle || 'Baby Care'}</p>
                          </div>
                          <div className="flex items-center gap-2 text-gray-400">
                            <button
                              type="button"
                              onClick={() => toggleLike(reel.id)}
                              aria-label="Add to wishlist"
                              className={`transition-colors cursor-pointer ${
                                isLiked ? 'text-[#F40436]' : 'hover:text-[#F40436]'
                              }`}
                            >
                              <Heart size={16} fill={isLiked ? '#F40436' : 'none'} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleShare(reel)}
                              aria-label="Share reel"
                              className="hover:text-gray-700 transition-colors cursor-pointer"
                            >
                              <Share2 size={16} />
                            </button>
                          </div>
                        </div>

                        {/* Red Pill Button */}
                        <button
                          type="button"
                          onClick={() => handleBuyViaWhatsApp(reel.title)}
                          className="w-full bg-[#F40436] hover:bg-[#D9032F] active:scale-98 text-white font-roboto-slab text-xs font-semibold py-2.5 rounded-full flex items-center justify-center gap-1.5 shadow-xs transition-all cursor-pointer"
                        >
                          <MessageCircle size={14} fill="currentColor" />
                          <span>Buy Now Via Whatsapp</span>
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Mobile Swipe Cue & Dot Indicators */}
            <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
              {displayReels.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (!sliderRef.current) return
                    const cardWidth = sliderRef.current.clientWidth * 0.75
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
            <p className="text-sm font-medium">No reels available yet.</p>
          </div>
        )}
      </Container>

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-black rounded-3xl overflow-hidden max-w-sm w-full aspect-[9/16] shadow-2xl">
            <button
              onClick={() => setActiveVideo(null)}
              className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
            <video
              src={activeVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </section>
  )
}
