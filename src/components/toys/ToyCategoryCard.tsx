'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Package } from 'lucide-react'
import { Category } from '@/types/database.types'
import { cleanToyDescription } from '@/lib/utils'

interface Props {
  category: Category
}

export default function ToyCategoryCard({ category }: Props) {
  const cleanDesc = cleanToyDescription(category.description)
  const productCount = category.product_count || 0

  return (
    <Link
      href={`/toys/${category.slug}`}
      className="group flex flex-col bg-white rounded-2xl sm:rounded-3xl border border-gray-200/80 hover:border-pink-200 p-3 sm:p-4 shadow-2xs hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
    >
      {/* Category Image with count pill */}
      <div className="relative aspect-[4/3] w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gray-50 mb-3.5 shrink-0">
        {category.image ? (
          <Image
            src={category.image}
            alt={category.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover object-center group-hover:scale-106 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Package size={36} />
          </div>
        )}

        {/* Live Product Count Badge */}
        <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-full text-[11px] font-bold text-gray-800 shadow-2xs border border-white/60">
          {productCount} {productCount === 1 ? 'item' : 'items'}
        </div>
      </div>

      {/* Card Info */}
      <div className="flex flex-col flex-1 justify-between">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <h3 className="font-bold text-sm sm:text-base text-gray-900 group-hover:text-[#FF2E63] transition-colors truncate">
              {category.name}
            </h3>
            <span className="w-6 h-6 rounded-full bg-gray-50 group-hover:bg-pink-50 text-gray-400 group-hover:text-[#FF2E63] flex items-center justify-center transition-colors shrink-0">
              <ArrowUpRight size={14} />
            </span>
          </div>

          <p className="text-xs text-gray-500 line-clamp-1 leading-relaxed">
            {cleanDesc || 'Explore collection'}
          </p>
        </div>

        <div className="pt-3 mt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-semibold text-gray-600">
          <span className="text-gray-400 font-normal">Explore subcategory</span>
          <span className="text-[#FF2E63] group-hover:underline">Shop now →</span>
        </div>
      </div>
    </Link>
  )
}
