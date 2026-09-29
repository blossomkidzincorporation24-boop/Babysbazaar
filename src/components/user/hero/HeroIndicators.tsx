'use client'

interface HeroIndicatorsProps {
  total: number
  current: number
  onChange: (index: number) => void
}

export default function HeroIndicators({ total, current, onChange }: HeroIndicatorsProps) {
  if (total <= 1) return null

  return (
    <div
      role="tablist"
      aria-label="Slide indicators"
      className="absolute bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/20 backdrop-blur-xs"
    >
      {Array.from({ length: total }).map((_, index) => {
        const isActive = index === current
        return (
          <button
            key={index}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-label={`Go to slide ${index + 1}`}
            onClick={(e) => {
              e.stopPropagation()
              onChange(index)
            }}
            className={`transition-all duration-300 rounded-full cursor-pointer ${
              isActive
                ? 'w-6 sm:w-7 h-2 bg-[#E1144B]'
                : 'w-2 h-2 bg-white/60 hover:bg-white'
            }`}
          />
        )
      })}
    </div>
  )
}
