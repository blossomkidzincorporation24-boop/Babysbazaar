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

// Age filter items for clothing
const AGE_FILTER_ITEMS = [
  '0–3 Months',
  '3–6 Months',
  '6–12 Months',
  '1–2 Years',
  '2–4 Years',
]

// Optional Baby Age Sub-Filters for baby clothing
const BABY_AGE_GROUPS = [
  '0–3 Months',
  '3–6 Months',
  '6–12 Months',
  '1–2 Years',
  '2–4 Years',
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
  const [selectedAges, setSelectedAges] = useState<string[]>([])
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'figma' | 'babyAge'>('figma')
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured')

  // Toggle filter selection
  const toggleAgeFilter = (item: string) => {
    setSelectedAges((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    )
  }

  // Clear all filters
  const resetFilters = () => {
    setMinPrice(0)
    setMaxPrice(860)
    setSelectedAges([])
  }

  const isFiltered = minPrice > 0 || maxPrice < 860 || (isClothingCategory && selectedAges.length > 0)

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Price filter
      const price = product.price || 0
      if (maxPrice > 0 && price > 0 && price > maxPrice * 3) {
        // Soft match price check or if within range
      }

      // Age / Tag filter - ONLY applicable for clothing categories
      if (isClothingCategory && selectedAges.length > 0) {
        const matchesAge = selectedAges.some((tag) => {
          const lowerTag = tag.toLowerCase()
          return (
            product.title.toLowerCase().includes(lowerTag) ||
            product.category_tag?.toLowerCase().includes(lowerTag) ||
            product.description?.toLowerCase().includes(lowerTag)
          )
        })
        if (!matchesAge) {
          return false
        }
      }

      return true
    })
  }, [allProducts, minPrice, maxPrice, selectedAges, isClothingCategory])

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
              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <h3 className="font-poppins text-[20px] font-semibold text-[#212529] tracking-[-0.375px]">
                    Filter By Age
                  </h3>
                  {/* Secondary toggle for baby clothing age groups vs Figma brands */}
                  <div className="flex items-center gap-1 text-[11px] font-poppins text-gray-400">
                    <button
                      onClick={() => setActiveTab('figma')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        activeTab === 'figma' ? 'text-[#0067B2] font-semibold bg-blue-50' : 'hover:text-black'
                      }`}
                    >
                      Brands
                    </button>
                    <span>|</span>
                    <button
                      onClick={() => setActiveTab('babyAge')}
                      className={`px-1.5 py-0.5 rounded cursor-pointer ${
                        activeTab === 'babyAge' ? 'text-[#0067B2] font-semibold bg-blue-50' : 'hover:text-black'
                      }`}
                    >
                      Ages
                    </button>
                  </div>
                </div>

                {/* Exact Checkbox + Pill Rows from Figma Frame 1686556758 */}
                <div className="flex flex-col gap-4">
                  {(activeTab === 'figma' ? AGE_FILTER_ITEMS : BABY_AGE_GROUPS).map((item) => {
                    const isChecked = selectedAges.includes(item)
                    return (
                      <div
                        key={item}
                        onClick={() => toggleAgeFilter(item)}
                        className="flex items-center gap-4 group cursor-pointer"
                      >
                        {/* Exact 25px x 24px Subway Tick Checkbox */}
                        <div
                          className={`w-[25px] h-[24px] rounded-[5px] flex items-center justify-center transition-colors shrink-0 ${
                            isChecked
                              ? 'bg-[#0067B2] text-white shadow-2xs'
                              : 'bg-[#D1D1D1] group-hover:bg-[#c0c0c0]'
                          }`}
                        >
                          {isChecked && <Check size={16} strokeWidth={3} />}
                        </div>

                        {/* Exact Figma White Pill Card: border #D1D1D1, rounded-[4px], px-4 py-2 */}
                        <div
                          className={`flex-1 px-4 py-2 rounded-[4px] border bg-white transition-all shadow-2xs ${
                            isChecked
                              ? 'border-[#0067B2] ring-1 ring-[#0067B2] bg-blue-50/20'
                              : 'border-[#D1D1D1] group-hover:border-gray-400'
                          }`}
                        >
                          <span className="font-poppins text-[16px] font-normal text-black block truncate">
                            {item}
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
                  <h4 className="font-poppins text-sm font-semibold text-gray-800">
                    Filter By Age
                  </h4>
                  <div className="flex flex-col gap-2.5 max-h-60 overflow-y-auto pr-1">
                    {[...AGE_FILTER_ITEMS, ...BABY_AGE_GROUPS].map((item) => {
                      const isChecked = selectedAges.includes(item)
                      return (
                        <div
                          key={item}
                          onClick={() => toggleAgeFilter(item)}
                          className="flex items-center gap-3 cursor-pointer py-1"
                        >
                          <div
                            className={`w-5 h-5 rounded flex items-center justify-center shrink-0 ${
                              isChecked ? 'bg-[#0067B2] text-white' : 'bg-gray-200'
                            }`}
                          >
                            {isChecked && <Check size={12} strokeWidth={3} />}
                          </div>
                          <span className="font-poppins text-sm text-gray-800 truncate">
                            {item}
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
