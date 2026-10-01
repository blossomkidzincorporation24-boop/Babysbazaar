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
    <section className="w-full py-10 lg:py-16">
      <Container>
        {/* Section Title */}
        <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#F40436] text-center mb-6 sm:mb-8">
          Product Categories
        </h2>

        {displayCategories.length > 0 ? (
          /* 4 columns grid matching Figma Frame 247:2700 */
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {displayCategories.map((cat, idx) => {
              const imageSrc = cat.image || 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=600&q=80'
              return (
                <Link
                  key={cat.id || idx}
                  href={cat.slug === 'toys' ? '/toys' : `/category/${cat.slug}`}
                  className="group relative h-40 sm:h-48 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 border border-gray-100 flex flex-col justify-end bg-gray-100"
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
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />

                  {/* Red Corner Badge */}
                  <div className="relative z-10 w-fit bg-[#F40436] rounded-tr-[40px] pl-3.5 pr-7 py-2 shadow-sm transition-transform group-hover:translate-x-1">
                    <span className="font-roboto-slab text-white text-xs sm:text-[14px] font-semibold tracking-wide block truncate max-w-[160px] sm:max-w-[210px]">
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
