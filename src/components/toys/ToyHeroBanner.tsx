'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Sparkles, ArrowRight, ShieldCheck, HeartHandshake, Truck } from 'lucide-react'

export default function ToyHeroBanner() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#FFF5F7] via-white to-[#F0F7FF] border border-pink-100/70 p-6 sm:p-10 lg:p-12 shadow-xs mb-12">
      {/* Decorative Pastel Background Blobs */}
      <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-pink-100/40 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-16 w-72 h-72 rounded-full bg-blue-100/40 blur-3xl pointer-events-none" />

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Column: Headlines & Call to Actions */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 border border-pink-200/80 shadow-2xs">
            <Sparkles size={14} className="text-[#FF2E63]" />
            <span className="text-xs font-bold text-gray-800 uppercase tracking-wider font-poppins">
              Baby&apos;s Bazaar Toy Collection
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight leading-[1.18] font-roboto-slab">
            Fun, Learn &amp;{' '}
            <span className="text-[#FF2E63] relative inline-block">
              Grow
              <svg
                className="absolute left-0 -bottom-1.5 w-full text-pink-300"
                viewBox="0 0 100 8"
                preserveAspectRatio="none"
              >
                <path
                  d="M0,5 Q50,0 100,5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-600 max-w-xl leading-relaxed">
            Thoughtfully curated toys designed for curious minds and joyful play. From newborn sensory rattles and STEM puzzles to high-speed RC cars and snuggly plush toys.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 pt-1 text-xs font-semibold text-gray-700">
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-gray-100 shadow-2xs">
              <ShieldCheck size={14} className="text-green-600" />
              <span>100% Non-Toxic &amp; Child Safe</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/80 px-3 py-1.5 rounded-xl border border-gray-100 shadow-2xs">
              <Truck size={14} className="text-[#0067B2]" />
              <span>Direct WhatsApp Dispatch</span>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Showcase Visual */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/3] sm:aspect-[5/4] w-full rounded-2xl overflow-hidden bg-white shadow-md border border-pink-100/80">
            <Image
              src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=900&q=85"
              alt="Fun, Learn and Grow Baby Toys"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 500px"
              className="object-cover"
            />
            {/* Soft Floating Pill */}
            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-xl border border-gray-100 shadow-xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-900">Explore 11 Toy Categories</p>
                <p className="text-[11px] text-gray-500">From newborns to 8+ years</p>
              </div>
              <span className="text-xs font-bold text-[#FF2E63] flex items-center gap-1">
                Browse below <ArrowRight size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
