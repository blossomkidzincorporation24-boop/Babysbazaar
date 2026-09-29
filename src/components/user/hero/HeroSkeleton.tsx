export default function HeroSkeleton() {
  return (
    <section className="max-w-6xl mx-auto px-4 pt-4 sm:pt-6">
      <div className="relative w-full h-[380px] sm:h-[440px] md:h-[480px] lg:h-[500px] rounded-2xl md:rounded-3xl bg-pink-100/50 animate-pulse overflow-hidden">
        <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 md:px-16 lg:px-20 max-w-lg space-y-4">
          {/* Skeleton Title Lines */}
          <div className="h-8 sm:h-10 md:h-12 bg-white/40 rounded-xl w-3/4" />
          <div className="h-8 sm:h-10 md:h-12 bg-white/40 rounded-xl w-1/2" />
          {/* Skeleton Description */}
          <div className="h-4 sm:h-5 bg-white/30 rounded-lg w-5/6 mt-2" />
          {/* Skeleton Button */}
          <div className="h-10 sm:h-12 bg-[#E1144B]/30 rounded-full w-44 mt-4" />
        </div>
      </div>
    </section>
  )
}
