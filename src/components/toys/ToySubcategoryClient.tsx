'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  RotateCcw,
  Search,
  Filter,
  X,
  Sparkles,
  Package,
  Layers,
  Check,
} from 'lucide-react'
import ProductCard, { ProductItem } from '@/components/user/ProductCard'
import { Category } from '@/types/database.types'
import { cleanToyDescription } from '@/lib/utils'

interface Props {
  subcategory: Category
  siblingSubcategories: Category[]
  initialProducts: any[]
  whatsappNumber?: string | null
}

export default function ToySubcategoryClient({
  subcategory,
  siblingSubcategories,
  initialProducts,
  whatsappNumber,
}: Props) {
  const allProducts: ProductItem[] = useMemo(() => {
    return (initialProducts || []).map((p) => ({
      id: p.id,
      title: p.title,
      slug: p.slug,
      price: p.price,
      description: p.description,
      short_description: p.short_description,
      product_images: p.product_images,
      new_arrival: p.new_arrival,
      best_seller: p.best_seller,
      category_tag: p.categories?.name || subcategory.name,
    }))
  }, [initialProducts, subcategory.name])

  // Extract dynamic filters from product short_description (Type, Age, Features)
  const availableFilters = useMemo(() => {
    const types = new Set<string>()
    const features = new Set<string>()
    const ages = new Set<string>()

    for (const prod of allProducts) {
      const text = prod.short_description || ''
      const typeMatch = text.match(/Type:\s*([^|]+)/i)
      if (typeMatch) types.add(typeMatch[1].trim())

      const ageMatch = text.match(/Age:\s*([^|]+)/i)
      if (ageMatch) ages.add(ageMatch[1].trim())

      const tagsMatch = text.match(/Tags:\s*([^|]+)/i)
      if (tagsMatch) {
        tagsMatch[1].split(',').forEach((t) => features.add(t.trim()))
      }
    }

    return {
      types: Array.from(types),
      features: Array.from(features),
      ages: Array.from(ages),
    }
  }, [allProducts])

  // Filters State
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [minPrice, setMinPrice] = useState<number>(0)
  const defaultMaxPrice = useMemo(() => {
    if (allProducts.length === 0) return 2000
    const highest = Math.max(...allProducts.map((p) => p.price || 0))
    return highest > 0 ? Math.max(Math.ceil((highest * 1.2) / 50) * 50, 1000) : 2000
  }, [allProducts])
  const [maxPrice, setMaxPrice] = useState<number>(defaultMaxPrice)
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'newest'>('featured')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)

  // Quick filter pills (combining standard tags with dynamic types)
  const quickPills = useMemo(() => {
    const list = ['All']
    // Add known dynamic types or features
    if (availableFilters.types.length > 0) {
      list.push(...availableFilters.types.slice(0, 4))
    }
    if (availableFilters.features.length > 0) {
      list.push(...availableFilters.features.slice(0, 3))
    }
    return Array.from(new Set(list))
  }, [availableFilters])

  // Clear filters
  const resetFilters = () => {
    setSearchQuery('')
    setSelectedTag('all')
    setMinPrice(0)
    setMaxPrice(defaultMaxPrice)
  }

  const isFiltered =
    searchQuery.trim().length > 0 ||
    selectedTag !== 'all' ||
    minPrice > 0 ||
    maxPrice < defaultMaxPrice

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      const price = product.price || 0

      // Price filter
      if (minPrice > 0 && price < minPrice) return false
      if (maxPrice > 0 && price > maxPrice) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const text = `${product.title} ${product.description || ''} ${product.short_description || ''}`.toLowerCase()
        if (!text.includes(q)) return false
      }

      // Quick Tag / Type Filter
      if (selectedTag !== 'all') {
        const tagNorm = selectedTag.toLowerCase().trim()
        const text = `${product.title} ${product.short_description || ''}`.toLowerCase()
        if (!text.includes(tagNorm)) return false
      }

      return true
    })
  }, [allProducts, minPrice, maxPrice, searchQuery, selectedTag])

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

  const cleanDesc = cleanToyDescription(subcategory.description)

  return (
    <div className="w-full">
      {/* ─────────────────────────────────────────────────────────────
          1. CATEGORY BANNER & HEADER
      ───────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-pink-50 via-white to-blue-50/40 border border-gray-100 p-6 sm:p-8 lg:p-10 mb-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <Link
                href="/toys"
                className="text-xs font-bold text-[#FF2E63] hover:underline uppercase tracking-wider font-poppins"
              >
                Toys Collection
              </Link>
              <span className="text-gray-300">&gt;</span>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Subcategory
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 font-roboto-slab tracking-tight">
              {subcategory.name}
            </h1>

            <p className="text-sm text-gray-600 leading-relaxed">
              {cleanDesc ||
                `Browse our premium collection of ${subcategory.name.toLowerCase()} at Baby's Bazaar in Erode. Direct WhatsApp enquiry & speedy home delivery.`}
            </p>
          </div>

          {/* Sibling Subcategory Quick Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 max-w-full md:max-w-md scrollbar-none flex-wrap">
            {siblingSubcategories
              .filter((s) => s.id !== subcategory.id)
              .slice(0, 5)
              .map((sib) => (
                <Link
                  key={sib.id}
                  href={`/toys/${sib.slug}`}
                  className="px-3 py-1.5 rounded-full text-xs font-semibold bg-white hover:bg-pink-50 text-gray-700 hover:text-[#FF2E63] border border-gray-200 transition-colors shrink-0 shadow-2xs"
                >
                  {sib.name}
                </Link>
              ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. HORIZONTAL FILTER BAR (QUICK PILLS + SEARCH + SORT)
      ───────────────────────────────────────────────────────────── */}
      <div className="space-y-4 mb-8">
        {/* Quick Filter Pills */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none flex-wrap">
            <span className="text-xs font-bold text-gray-700 font-poppins mr-1 shrink-0">
              Filter by:
            </span>
            {quickPills.map((pill) => {
              const val = pill.toLowerCase()
              const isActive = selectedTag === val
              return (
                <button
                  key={pill}
                  onClick={() => setSelectedTag(val)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer shrink-0 select-none ${
                    isActive
                      ? 'bg-[#FF2E63] text-white shadow-xs'
                      : 'bg-white hover:bg-gray-100 text-gray-700 border border-gray-200'
                  }`}
                >
                  {pill}
                </button>
              )
            })}
          </div>

          {/* Mobile Filter Toggle Button */}
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 bg-white"
          >
            <Filter size={13} />
            <span>Price Filters</span>
            {isFiltered && <span className="w-2 h-2 rounded-full bg-[#FF2E63]" />}
          </button>
        </div>

        {/* Search, Sort and Result Count */}
        <div className="flex items-center justify-between gap-4 pb-3 border-b border-gray-100 flex-wrap">
          <div className="relative flex-1 max-w-xs">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${subcategory.name}...`}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-[#FF2E63] transition-colors"
            />
          </div>

          <div className="flex items-center gap-4">
            <p className="text-xs sm:text-sm font-medium text-gray-500 font-poppins">
              Showing <span className="font-bold text-gray-900">{sortedProducts.length}</span> items
            </p>

            <div className="flex items-center gap-2">
              <label
                htmlFor="sort-select"
                className="text-xs font-semibold text-gray-600 hidden sm:inline"
              >
                Sort:
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="text-xs font-semibold bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-gray-700 focus:outline-none cursor-pointer"
              >
                <option value="featured">Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="newest">Newest First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. MAIN CONTENT: PRODUCT GRID + SIDEBAR FILTERS
      ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* LEFT: Product Grid */}
        <div className="flex-1 w-full order-2 lg:order-1">
          {sortedProducts.length === 0 ? (
            <div className="text-center py-20 bg-gray-50/60 rounded-3xl border border-gray-200/80 p-8">
              <div className="w-14 h-14 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center mx-auto mb-4 text-[#FF2E63]">
                <Package size={28} />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                No toys found
              </h3>
              <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
                We couldn&apos;t find any toys matching your current filters. Try resetting the filters or enquire directly via WhatsApp.
              </p>
              {isFiltered ? (
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-white bg-[#FF2E63] hover:bg-[#E02454] transition-colors"
                >
                  <RotateCcw size={13} />
                  <span>Reset All Filters</span>
                </button>
              ) : (
                <Link
                  href="/toys"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-colors"
                >
                  <span>Explore Other Toy Categories</span>
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 sm:gap-5 md:gap-6 w-full">
              {sortedProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  whatsappNumber={whatsappNumber}
                />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Desktop Price Filter Sidebar */}
        <aside className="hidden lg:block w-[300px] shrink-0 order-1 lg:order-2 sticky top-28 space-y-6">
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-gray-900 font-poppins">
                Filter by price
              </h3>
              {isFiltered && (
                <button
                  onClick={resetFilters}
                  className="text-xs text-[#0067B2] hover:underline flex items-center gap-1 cursor-pointer font-semibold"
                >
                  <RotateCcw size={11} />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Slider Bar */}
            <div className="space-y-4">
              <div className="relative h-6 flex items-center">
                <div className="relative h-1.5 w-full rounded-[20px] bg-[#E2E8F0]">
                  <div
                    className="absolute top-0 left-0 h-full rounded-[20px] bg-[#0067B2] transition-all"
                    style={{
                      width: `${Math.min(100, Math.max(0, ((maxPrice || 0) / (defaultMaxPrice || 1000)) * 100))}%`,
                    }}
                  />
                </div>
                <input
                  type="range"
                  min={0}
                  max={defaultMaxPrice}
                  step={10}
                  value={maxPrice || 0}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="absolute inset-0 w-full opacity-0 cursor-ew-resize h-6 z-10"
                  aria-label="Filter by maximum price"
                />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-[14px] h-[14px] bg-[#0067B2] rounded-full flex items-center justify-center pointer-events-none shadow-xs transition-all"
                  style={{
                    left: `calc(${Math.min(100, Math.max(0, ((maxPrice || 0) / (defaultMaxPrice || 1000)) * 100))}% - 7px)`,
                  }}
                >
                  <div className="w-1 h-1 rounded-full bg-white" />
                </div>
              </div>

              {/* Min & Max Inputs */}
              <div className="flex items-center gap-2 pt-1">
                <div className="w-1/2 h-10 px-3 flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white shadow-2xs">
                  <span className="text-gray-400 text-xs font-semibold mr-1">₹</span>
                  <input
                    type="number"
                    value={minPrice === 0 ? '' : minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full text-center font-poppins text-xs font-medium text-black focus:outline-none"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <span className="text-gray-400 select-none">-</span>
                <div className="w-1/2 h-10 px-3 flex items-center justify-center rounded-lg border border-[#CBD5E1] bg-white shadow-2xs">
                  <span className="text-gray-400 text-xs font-semibold mr-1">₹</span>
                  <input
                    type="number"
                    value={maxPrice === 0 ? '' : maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value) || 0))}
                    className="w-full text-center font-poppins text-xs font-medium text-black focus:outline-none"
                    placeholder={String(defaultMaxPrice)}
                    min={0}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sibling Categories List */}
          <div className="bg-white border border-gray-200/90 rounded-2xl p-5 shadow-2xs space-y-3">
            <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wider">
              Other Toy Categories
            </h4>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {siblingSubcategories.map((sib) => {
                const isCurrent = sib.id === subcategory.id
                return (
                  <Link
                    key={sib.id}
                    href={`/toys/${sib.slug}`}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-colors ${
                      isCurrent
                        ? 'bg-pink-50 text-[#FF2E63] border border-pink-100 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="truncate">{sib.name}</span>
                    <span className="text-[11px] text-gray-400 ml-2">
                      {sib.product_count || 0}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        </aside>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          4. MOBILE FILTERS MODAL
      ───────────────────────────────────────────────────────────── */}
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
                  <div className="w-1/2 flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-white">
                    <span className="text-xs text-gray-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={minPrice === 0 ? '' : minPrice}
                      onChange={(e) => setMinPrice(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-sm text-center font-poppins focus:outline-none"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                  <span>-</span>
                  <div className="w-1/2 flex items-center border border-gray-300 rounded-lg px-2.5 py-2 bg-white">
                    <span className="text-xs text-gray-400 mr-1">₹</span>
                    <input
                      type="number"
                      value={maxPrice === 0 ? '' : maxPrice}
                      onChange={(e) => setMaxPrice(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full text-sm text-center font-poppins focus:outline-none"
                      placeholder={String(defaultMaxPrice)}
                      min={0}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex gap-3">
              <button
                onClick={resetFilters}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-gray-600 border border-gray-200"
              >
                Reset
              </button>
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-1/2 py-2.5 rounded-xl text-xs font-bold text-white bg-[#FF2E63]"
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
