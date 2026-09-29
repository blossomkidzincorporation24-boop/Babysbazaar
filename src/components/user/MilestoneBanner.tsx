'use client'

export default function MilestoneBanner() {
  return (
    <section className="max-w-[1312px] mx-auto px-4 sm:px-6 my-6 sm:my-10">
      <div className="w-full rounded-3xl border border-[#EFE9E4]/90 bg-white shadow-[0_4px_20px_-2px_rgba(44,36,32,0.05)] py-10 sm:py-14 px-6 sm:px-12 text-center flex flex-col items-center justify-center">
        {/* Main Heading */}
        <h2 className="font-roboto-slab text-2xl sm:text-3xl md:text-[36px] font-semibold text-[#F40436] tracking-tight leading-tight">
          Find What Fits Their{' '}
          <span className="text-[#F40436] font-normal">Little Stage</span>
        </h2>

        {/* Description */}
        <p className="font-sans text-sm sm:text-base text-[#7A6E67] mt-2.5 max-w-xl">
          Discover products selected for every stage of your baby&apos;s growth.
        </p>

        {/* Supportive Microcopy */}
        <p className="font-sans text-xs sm:text-[13px] text-[#9C9088] mt-5 max-w-lg leading-relaxed">
          Not sure what size or stage to choose? Our nursery curator can advise sizing directly on WhatsApp.
        </p>
      </div>
    </section>
  )
}
