'use client'

import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'

interface CategoryItem {
  id: string
  name: string
  slug: string
  image?: string | null
}

interface CategoryGridProps {
  categories?: CategoryItem[]
}

export default function CategoryGrid({ categories = [] }: CategoryGridProps) {
  const displayCategories = categories || []

  return (
    <section className="w-full py-8 sm:py-10 lg:py-16">
      <Container>
        {/* Section Title */}
        <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] text-center mb-5 sm:mb-8">
          Product Categories
        </h2>

        {displayCategories.length > 0 ? (
          /* 2-columns on mobile, 3 on tablet, 4 on desktop matching Figma design */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 lg:gap-6">
            {displayCategories.map((cat, idx) => {
              const imageSrc = cat.image || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80'
              return (
                <Link
                  key={cat.id || idx}
                  href={cat.slug === 'toys' ? '/toys' : `/category/${cat.slug}`}
                  className="group relative h-36 sm:h-44 md:h-48 rounded-2xl overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-end bg-gray-100 active:scale-[0.98]"
                >
                  {/* Background Image */}
                  <Image
                    src={imageSrc}
                    alt={`${cat.name} baby products`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 300px"
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Subtle dark gradient for contrast */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent pointer-events-none" />

                  {/* Red Corner Badge */}
                  <div className="relative z-10 w-fit bg-[#F40436] rounded-tr-[28px] sm:rounded-tr-[40px] pl-3 pr-5 sm:pl-3.5 sm:pr-7 py-1.5 sm:py-2 shadow-sm transition-transform group-hover:translate-x-1">
                    <span className="font-roboto-slab text-white text-[11px] sm:text-[13px] md:text-[14px] font-bold tracking-wide block truncate max-w-[130px] sm:max-w-[200px]">
                      {cat.name}
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 font-sans">
            <p className="text-sm font-medium">No categories available yet.</p>
          </div>
        )}
      </Container>
    </section>
  )
}
