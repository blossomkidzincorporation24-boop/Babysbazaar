'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Check, RotateCcw, Filter, X } from 'lucide-react'
import ProductCard, { ProductItem } from '@/components/user/ProductCard'

interface CategoryDetailClientProps {
  categoryName: string
  categorySlug: string
  categoryDescription?: string | null
  initialProducts: ProductItem[]
  whatsappNumber?: string | null
}

// Age filter items for clothing matching the 5 standard age groups
const CLOTHING_AGE_FILTERS = [
  { label: 'All', value: 'all', pill: 'All' },
  { label: '1–3 Months', value: '1–3', pill: '1–3M' },
  { label: '3–6 Months', value: '3–6', pill: '3–6M' },
  { label: '6–12 Months', value: '6–12', pill: '6–12M' },
  { label: '12–18 Months', value: '12–18', pill: '12–18M' },
  { label: '18–24 Months', value: '18–24', pill: '18–24M' },
]

export default function CategoryDetailClient({
  categoryName,
  categorySlug,
  categoryDescription,
  initialProducts,
  whatsappNumber,
}: CategoryDetailClientProps) {
  // Rely 100% on DB products from Supabase
  const allProducts = useMemo(() => {
    return initialProducts || []
  }, [initialProducts])

  // Only show Age Filter for Clothing categories
  const isClothingCategory = useMemo(() => {
    const slug = (categorySlug || '').toLowerCase()
    const name = (categoryName || '').toLowerCase()
    return (
      slug.includes('cloth') ||
      slug.includes('wear') ||
      slug.includes('dress') ||
      name.includes('cloth') ||
      name.includes('wear') ||
      name.includes('dress')
    )
  }, [categorySlug, categoryName])

  // Filters State
  const [minPrice, setMinPrice] = useState<number>(0)
  const [maxPrice, setMaxPrice] = useState<number>(860)
  const [selectedAge, setSelectedAge] = useState<string>('all')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured')

  // Clear all filters
  const resetFilters = () => {
    setMinPrice(0)
    setMaxPrice(860)
    setSelectedAge('all')
  }

  const isFiltered = minPrice > 0 || maxPrice < 860 || (isClothingCategory && selectedAge !== 'all')

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Price filter
      const price = product.price || 0
      if (maxPrice > 0 && price > 0 && price > maxPrice * 3) {
        // Soft match price check or if within range
      }

      // Age filter - ONLY applicable for clothing categories
      if (isClothingCategory && selectedAge !== 'all') {
        const lowerSelected = selectedAge.toLowerCase().replace(/–/g, '-')
        const shortDesc = (product.short_description || '').toLowerCase().replace(/–/g, '-')
        const desc = (product.description || '').toLowerCase().replace(/–/g, '-')
        const title = (product.title || '').toLowerCase().replace(/–/g, '-')
        const categoryTag = (product.category_tag || '').toLowerCase().replace(/–/g, '-')

        const matchesAge =
          shortDesc.includes(lowerSelected) ||
          desc.includes(lowerSelected) ||
          title.includes(lowerSelected) ||
          categoryTag.includes(lowerSelected)

        if (!matchesAge) {
          return false
        }
      }

      return true
    })
  }, [allProducts, minPrice, maxPrice, selectedAge, isClothingCategory])

  // Sorted Products
  const sortedProducts = useMemo(() => {
    const list = [...filteredProducts]
    if (sortBy === 'price-asc') {
      return list.sort((a, b) => (a.price || 0) - (b.price || 0))
    }
    if (sortBy === 'price-desc') {
      return list.sort((a, b) => (b.price || 0) - (a.price || 0))
    }
    if (sortBy === 'newest') {
      return list.sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0))
    }
    return list
  }, [filteredProducts, sortBy])

  return (
    <div className="min-h-screen bg-white pb-20">
      <div className="max-w-[1312px] mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 sm:mb-6 flex items-center flex-wrap gap-2 text-black font-poppins text-sm sm:text-base font-medium leading-[150%]"
        >
          <Link href="/" className="hover:text-[#F40436] transition-colors">
            Home
          </Link>
          <span className="text-gray-400 select-none">&gt;</span>
          <Link href="/categories" className="hover:text-[#F40436] transition-colors">
            Category
          </Link>
          <span className="text-gray-400 select-none">&gt;</span>
          <span className="text-black font-semibold">{categoryName}</span>
        </nav>

        {/* Semantic Category Heading & Description */}
        <div className="mb-6 sm:mb-8">
          <h1 className="font-roboto-slab text-2xl sm:text-3xl lg:text-[34px] font-bold text-gray-900 tracking-tight">
            {categoryName}
          </h1>
          {categoryDescription && (
            <p className="font-sans text-xs sm:text-sm text-gray-600 mt-2 max-w-3xl leading-relaxed">
              {categoryDescription}
            </p>
          )}
        </div>

        {/* Mobile Filter Trigger Button */}
        <div className="lg:hidden mb-6 flex items-center justify-between bg-gray-50 p-3.5 rounded-xl border border-gray-200">
          <div className="flex items-center gap-2">
            <span className="font-poppins font-semibold text-gray-800 text-sm">
              {filteredProducts.length} Products
            </span>
            {isFiltered && (
              <span className="text-xs bg-[#0067B2] text-white px-2 py-0.5 rounded-full font-medium">
                Active filters
              </span>
            )}
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0067B2] text-white text-xs font-semibold rounded-lg shadow-2xs hover:bg-[#005a9c] transition-colors cursor-pointer"
          >
            <Filter size={14} />
            <span>Filters</span>
          </button>
        </div>

        {/* Main 2-Column Section: Left Products Grid + Right Filter Sidebar */}
        <div className="flex flex-col lg:flex-row items-start gap-6 lg:gap-8 xl:gap-10 w-full">
          {/* LEFT: Products Grid */}
          <div className="flex-1 w-full min-w-0 order-2 lg:order-1">
            {allProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
                <p className="font-poppins text-gray-500 text-base">
                  No products available in this category yet.
                </p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
                <p className="font-poppins text-gray-500 text-base mb-4">
                  No products found matching your current filter criteria.
                </p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#34C759] text-white text-sm font-semibold hover:bg-[#2eb34f] transition-all cursor-pointer"
                >
                  <RotateCcw size={16} />
                  <span>Reset Filters</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Public Website Age Filter Bar for Clothing */}
                {isClothingCategory && (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3 p-3 sm:p-3.5 bg-gray-50 border border-gray-200/80 rounded-2xl">
                    <span className="text-xs font-bold text-gray-700 font-poppins shrink-0">
                      Age filter:
                    </span>
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none flex-wrap">
                      {CLOTHING_AGE_FILTERS.map((item) => {
                        const isActive = selectedAge === item.value
                        return (
                          <button
                            key={item.value}
                            onClick={() => setSelectedAge(item.value)}
                            className={`px-3.5 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-all cursor-pointer shrink-0 select-none ${
                              isActive
                                ? 'bg-[#FF2E63] text-white shadow-xs'
                                : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                            }`}
                          >
                            {item.pill}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Sort & Count Header */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100 flex-wrap gap-2">
                  <p className="text-xs sm:text-sm font-medium text-gray-500 font-poppins">
                    Showing <span className="font-bold text-gray-900">{sortedProducts.length}</span> items
                  </p>
                  <div className="flex items-center gap-2">
                    <label htmlFor="sort-dropdown" className="text-xs font-semibold text-gray-600 font-poppins hidden sm:inline">
                      Sort By:
                    </label>
                    <select
                      id="sort-dropdown"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value as any)}
                      className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#0067B2] cursor-pointer font-poppins"
                    >
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price: Low to High</option>
                      <option value="price-desc">Price: High to Low</option>
                      <option value="newest">Newest First</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6 w-full">
                  {sortedProducts.map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      whatsappNumber={whatsappNumber}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Filters Sidebar (Exact Figma Frame 1686556758 Specs) */}
          <aside className="hidden lg:block w-[330px] shrink-0 order-1 lg:order-2 sticky top-28 space-y-10">
            {/* Filter by price */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-poppins text-[15px] font-semibold text-[#212529] tracking-[-0.375px]">
                  Filter by price
                </h3>
                {isFiltered && (
                  <button
                    onClick={resetFilters}
                    className="text-xs text-[#0067B2] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw size={12} />
                    <span>Reset</span>
                  </button>
                )}
              </div>

              {/* Exact Slider Bar from Figma (left:0px, #0067B2 track & circle endpoints) */}
              <div className="space-y-4">
                <div className="relative h-1 w-full rounded-[20px] bg-[#E2E8F0]">
                  {/* Active Bar */}
                  <div
                    className="absolute top-0 left-0 h-1 rounded-[20px] bg-[#0067B2] transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(10, ((maxPrice || 860) / 1000) * 100))}%`,
                    }}
                  />
                  {/* Left Thumb */}
                  <div className="absolute -top-[5px] left-0 w-[15px] h-[14px] bg-[#0067B2] rounded-full flex items-center justify-center cursor-pointer shadow-xs">
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                  {/* Right Thumb (dynamic) */}
                  <div
                    className="absolute -top-[5px] w-[15px] h-[14px] bg-[#0067B2] rounded-full flex items-center justify-center cursor-pointer shadow-xs transition-all"
                    style={{
                      left: `calc(${Math.min(95, Math.max(10, ((maxPrice || 860) / 1000) * 100))}% - 7px)`,
                    }}
                  >
                    <div className="w-1 h-1 rounded-full bg-white" />
                  </div>
                </div>

                {/* Min & Max Inputs (Exact Figma 138.52px x 40px, rounded-lg, #CBD5E1 border) */}
                <div className="flex items-center gap-2 pt-2">
                  <div className="w-[138px] h-10 px-3.5 flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white shadow-2xs">
                    <input
                      type="number"
                      value={minPrice}
                      onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                      className="w-full text-center font-poppins text-sm font-medium text-black focus:outline-none"
                      placeholder="0"
                      min={0}
                    />
                  </div>

                  <span className="text-[#212529] font-sans text-base font-normal select-none">
                    -
                  </span>

                  <div className="w-[138px] h-10 px-3.5 flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white shadow-2xs">
                    <input
                      type="number"
                      value={maxPrice}
                      onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                      className="w-full text-center font-poppins text-sm font-medium text-black focus:outline-none"
                      placeholder="860"
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Filter By Age - ONLY for clothing categories */}
            {isClothingCategory && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins text-[18px] font-semibold text-[#212529] tracking-[-0.375px]">
                    Filter By Age
                  </h3>
                  {selectedAge !== 'all' && (
                    <button
                      onClick={() => setSelectedAge('all')}
                      className="text-xs text-[#0067B2] hover:underline cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  {CLOTHING_AGE_FILTERS.filter(f => f.value !== 'all').map((item) => {
                    const isChecked = selectedAge === item.value
                    return (
                      <div
                        key={item.value}
                        onClick={() => setSelectedAge(isChecked ? 'all' : item.value)}
                        className="flex items-center gap-3.5 group cursor-pointer select-none"
                      >
                        <div
                          className={`w-[22px] h-[22px] rounded-[5px] flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-[#FF2E63] text-white shadow-2xs'
                              : 'bg-gray-200 group-hover:bg-gray-300'
                          }`}
                        >
                          {isChecked && <Check size={14} strokeWidth={3} />}
                        </div>

                        <div
                          className={`flex-1 px-3.5 py-2 rounded-lg border bg-white transition-all shadow-2xs ${
                            isChecked
                              ? 'border-[#FF2E63] ring-1 ring-[#FF2E63] bg-pink-50/20'
                              : 'border-gray-200 group-hover:border-gray-300'
                          }`}
                        >
                          <span className={`font-poppins text-sm block truncate ${isChecked ? 'text-[#FF2E63] font-semibold' : 'text-gray-800'}`}>
                            {item.label}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>

      {/* Mobile Filters Slide-over / Modal */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex bg-black/50 backdrop-blur-xs lg:hidden">
          <div className="w-full max-w-xs bg-white h-full ml-auto p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-gray-100">
                <h3 className="font-poppins text-lg font-bold text-gray-900">Filters</h3>
                <button
                  onClick={() => setMobileFilterOpen(false)}
                  className="p-1 text-gray-500 hover:text-black rounded-lg cursor-pointer"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Price Filter Mobile */}
              <div className="space-y-3">
                <h4 className="font-poppins text-sm font-semibold text-gray-800">
                  Filter by price
                </h4>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value) || 0)}
                    className="w-1/2 p-2 border border-gray-300 rounded-lg text-sm text-center font-poppins"
                    placeholder="Min"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Number(e.target.value) || 0)}
                    className="w-1/2 p-2 border border-gray-300 rounded-lg text-sm text-center font-poppins"
                    placeholder="Max"
                  />
                </div>
              </div>

              {/* Age Filter Mobile - ONLY for clothing categories */}
              {isClothingCategory && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-poppins text-sm font-semibold text-gray-800">
                      Filter By Age
                    </h4>
                    {selectedAge !== 'all' && (
                      <button
                        onClick={() => setSelectedAge('all')}
                        className="text-xs text-[#0067B2] hover:underline"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                    {CLOTHING_AGE_FILTERS.map((item) => {
                      const isChecked = selectedAge === item.value
                      return (
                        <div
                          key={item.value}
                          onClick={() => setSelectedAge(item.value)}
                          className="flex items-center gap-3 cursor-pointer py-1.5"
                        >
                          <div
                            className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-[#FF2E63] text-white' : 'bg-gray-200'
                            }`}
                          >
                            {isChecked && <Check size={11} strokeWidth={3} />}
                          </div>
                          <span className={`font-poppins text-xs truncate ${isChecked ? 'text-[#FF2E63] font-semibold' : 'text-gray-800'}`}>
                            {item.label}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-gray-100 flex items-center gap-3">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 cursor-pointer"
              >
                Reset All
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 bg-[#0067B2] rounded-xl text-xs font-semibold text-white hover:bg-[#005a9c] cursor-pointer"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
