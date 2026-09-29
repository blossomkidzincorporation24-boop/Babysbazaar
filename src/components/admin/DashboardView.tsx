'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  RotateCcw,
  Search,
  Plus,
  Pencil,
  Share2,
  CheckCircle2,
  UploadCloud,
  Layers,
  ArrowRight,
  ExternalLink,
  Sparkles,
  Camera,
  X,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'
import { formatPrice } from '@/lib/utils'
import { toggleProductStatus, deleteProduct, createProduct, updateProduct } from '@/lib/actions/products'
import { uploadFile, validateImageFile } from '@/lib/upload'

interface ProductItem {
  id: string
  title: string
  description: string | null
  price: number
  category_id: string | null
  product_images: string[]
  best_seller: boolean
  new_arrival: boolean
  featured: boolean
  status: 'active' | 'inactive'
  created_at: string
  categories?: { id: string; name: string; slug: string } | null
}

interface CategoryItem {
  id: string
  name: string
  slug: string
  image: string | null
  status: string
}

interface BannerItem {
  id: string
  image: string
  heading: string | null
  button_text: string | null
  link: string | null
  display_order: number
  status: 'active' | 'inactive'
}

interface PhotoItem {
  id: string
  image: string
  caption: string | null
  type: string
  status: 'active' | 'inactive'
}

interface DashboardViewProps {
  products: ProductItem[]
  categories: CategoryItem[]
  banners: BannerItem[]
  photos: PhotoItem[]
}

// Category color pill mapping
const categoryColors: Record<string, { bg: string; text: string }> = {
  'Baby Clothing': { bg: 'bg-[#EDEBFF]', text: 'text-[#6E56CF]' },
  'Blankets & Swaddles': { bg: 'bg-[#E1F0FF]', text: 'text-[#2563EB]' },
  'Toys & Teethers': { bg: 'bg-[#E6F8F3]', text: 'text-[#0D9488]' },
  'Footwear': { bg: 'bg-[#FDF2E9]', text: 'text-[#EA580C]' },
  'Nursery Decor': { bg: 'bg-[#F5EDFF]', text: 'text-[#9333EA]' },
  'Feeding Essentials': { bg: 'bg-[#FEF3C7]', text: 'text-[#D97706]' },
  'Bath & Care': { bg: 'bg-[#E0F2FE]', text: 'text-[#0284C7]' },
  'Gift Sets': { bg: 'bg-[#FCE7F3]', text: 'text-[#DB2777]' },
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return 'Recently'
  const now = new Date()
  const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (diffSec < 60) return 'Just now'
  const diffMin = Math.floor(diffSec / 60)
  if (diffMin < 60) return `${diffMin} min ago`
  const diffHour = Math.floor(diffMin / 60)
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`
  const diffDay = Math.floor(diffHour / 24)
  if (diffDay === 1) return 'Yesterday'
  if (diffDay < 30) return `${diffDay} days ago`
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function DashboardView({
  products: initialProducts,
  categories,
  banners,
  photos,
}: DashboardViewProps) {
  const router = useRouter()
  const [products, setProducts] = useState<ProductItem[]>(initialProducts)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeBannerIndex, setActiveBannerIndex] = useState(0)
  const [isPending, startTransition] = useTransition()

  // Modal States
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null)
  const [formTitle, setFormTitle] = useState('')
  const [formDescription, setFormDescription] = useState('')
  const [formPrice, setFormPrice] = useState('')
  const [formCategoryId, setFormCategoryId] = useState('')
  const [formImages, setFormImages] = useState<string[]>([])
  const [formBestSeller, setFormBestSeller] = useState(false)
  const [formNewArrival, setFormNewArrival] = useState(false)
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active')
  const [isUploading, setIsUploading] = useState(false)

  // Dynamic Recent Activity Timeline
  const dynamicActivities = (() => {
    const list: { id: string; title: string; subtitle: string; time: string; timestamp: number }[] = []

    products.forEach(p => {
      if (p.created_at) {
        list.push({
          id: `prod-${p.id}`,
          title: p.new_arrival ? 'New Arrival published' : p.best_seller ? 'Product marked as Best Seller' : 'New product added',
          subtitle: p.title,
          time: formatRelativeTime(p.created_at),
          timestamp: new Date(p.created_at).getTime(),
        })
      }
    })

    categories.forEach(c => {
      if ((c as any).created_at) {
        list.push({
          id: `cat-${c.id}`,
          title: 'Category created',
          subtitle: c.name,
          time: formatRelativeTime((c as any).created_at),
          timestamp: new Date((c as any).created_at).getTime(),
        })
      }
    })

    banners.forEach(b => {
      if ((b as any).created_at) {
        list.push({
          id: `ban-${b.id}`,
          title: 'Hero banner updated',
          subtitle: b.heading || 'Banner slide',
          time: formatRelativeTime((b as any).created_at),
          timestamp: new Date((b as any).created_at).getTime(),
        })
      }
    })

    photos.forEach(ph => {
      if ((ph as any).created_at) {
        list.push({
          id: `pho-${ph.id}`,
          title: 'Delivery photo uploaded',
          subtitle: ph.caption || 'Customer delivery photo',
          time: formatRelativeTime((ph as any).created_at),
          timestamp: new Date((ph as any).created_at).getTime(),
        })
      }
    })

    list.sort((a, b) => b.timestamp - a.timestamp)
    return list.slice(0, 5)
  })()

  // Calculations
  const activeProducts = products.filter(p => p.status === 'active')
  const newArrivalsCount = products.filter(p => p.new_arrival && p.status === 'active').length
  const bestSellersCount = products.filter(p => p.best_seller && p.status === 'active').length
  const totalValue = products.reduce((acc, curr) => acc + Number(curr.price || 0), 0)

  // Filtered products
  const filteredProducts = products.filter(p => {
    const q = searchQuery.toLowerCase().trim()
    if (!q) return true
    const titleMatch = p.title.toLowerCase().includes(q)
    const catMatch = p.categories?.name.toLowerCase().includes(q)
    return titleMatch || catMatch
  })

  // Toggle Product Active/Hidden
  async function handleToggleStatus(product: ProductItem) {
    const newStatus = product.status === 'active' ? 'inactive' : 'active'
    // Optimistic update
    setProducts(prev =>
      prev.map(p => (p.id === product.id ? { ...p, status: newStatus } : p))
    )

    const res = await toggleProductStatus(product.id, product.status)
    if (res?.error) {
      toast.error(res.error)
      // Revert
      setProducts(prev =>
        prev.map(p => (p.id === product.id ? { ...p, status: product.status } : p))
      )
    } else {
      toast.success(
        newStatus === 'active'
          ? `"${product.title}" is now visible on the website`
          : `"${product.title}" hidden from website`
      )
    }
  }

  // Share product link
  function handleShare(product: ProductItem) {
    const url = `${window.location.origin}/product/${product.id}`
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url)
      toast.success('Product link copied to clipboard!')
    } else {
      toast.info(`Product URL: ${url}`)
    }
  }

  // Open Product Editor Modal
  function handleOpenEdit(product: ProductItem) {
    setEditingProduct(product)
    setFormTitle(product.title)
    setFormDescription(product.description || '')
    setFormPrice(String(product.price))
    setFormCategoryId(product.category_id || '')
    setFormImages(product.product_images || [])
    setFormBestSeller(product.best_seller)
    setFormNewArrival(product.new_arrival)
    setFormStatus(product.status)
    setIsProductModalOpen(true)
  }

  function handleOpenNew() {
    setEditingProduct(null)
    setFormTitle('')
    setFormDescription('')
    setFormPrice('')
    setFormCategoryId(categories[0]?.id || '')
    setFormImages([])
    setFormBestSeller(false)
    setFormNewArrival(true)
    setFormStatus('active')
    setIsProductModalOpen(true)
  }

  // Handle image upload in modal
  async function handleUploadImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const validation = validateImageFile(file)
    if (validation) {
      toast.error(validation)
      return
    }
    setIsUploading(true)
    const result = await uploadFile(file, 'products')
    setIsUploading(false)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    setFormImages(prev => [...prev, result.url])
    toast.success('Image uploaded!')
  }

  // Save product from modal
  function handleSaveProduct(e: React.FormEvent) {
    e.preventDefault()
    if (!formTitle.trim()) {
      toast.error('Title is required')
      return
    }
    if (!formPrice || isNaN(Number(formPrice))) {
      toast.error('Valid price is required')
      return
    }
    if (!formCategoryId) {
      toast.error('Please select a category')
      return
    }

    if (formImages.length === 0) {
      toast.error('Please upload at least one product image.')
      return
    }

    startTransition(async () => {
      const payload = {
        title: formTitle.trim(),
        description: formDescription.trim() || undefined,
        price: Number(formPrice),
        category_id: formCategoryId,
        product_images: formImages,
        best_seller: formBestSeller,
        new_arrival: formNewArrival,
        featured: formBestSeller || formNewArrival,
        status: formStatus,
      }

      const imagePayloads = formImages.map((url, idx) => ({ url, is_primary: idx === 0, alt_text: formTitle.trim() }))

      let res
      if (editingProduct) {
        res = await updateProduct(editingProduct.id, payload, imagePayloads)
      } else {
        res = await createProduct(payload, imagePayloads)
      }

      if (res?.error) {
        toast.error(res.error)
      } else {
        toast.success(editingProduct ? 'Product updated successfully' : 'Product added successfully')
        setIsProductModalOpen(false)
        router.refresh()
      }
    })
  }

  // Active banner
  const activeBanner = banners[activeBannerIndex] || banners[0] || null

  return (
    <div className="space-y-7 pb-16">
      {/* ======================================================== */}
      {/* 1. TOP SUMMARY CARDS (Exact 3 cards from reference)      */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Total Products */}
        <div className="bg-white rounded-2xl p-6 border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">Total Products</span>
            <div className="w-8 h-8 rounded-lg bg-[#DDF7EF] flex items-center justify-center text-[#0EA77B]">
              <Layers size={16} strokeWidth={2.5} />
            </div>
          </div>
          <div className="mt-3 text-[30px] font-extrabold text-[#1C1C1E] tracking-tight">
            {products.length}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#0EA77B]">
            <CheckCircle2 size={14} />
            <span>{activeProducts.length} Active in catalog</span>
          </div>
        </div>

        {/* Card 2: New Arrivals */}
        <div className="bg-white rounded-2xl p-6 border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">New Arrivals</span>
            <div className="w-8 h-8 rounded-lg bg-[#EDEBFF] flex items-center justify-center text-[#6E56CF]">
              <Sparkles size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-3 text-[30px] font-extrabold text-[#1C1C1E] tracking-tight">
            {newArrivalsCount}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#6E56CF]">
            <TrendingUp size={14} />
            <span>Featured prominently</span>
          </div>
        </div>

        {/* Card 3: Best Sellers */}
        <div className="bg-white rounded-2xl p-6 border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] transition-all hover:shadow-[0_4px_16px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#666666]">Best Sellers</span>
            <div className="w-8 h-8 rounded-lg bg-[#FFE1D7] flex items-center justify-center text-[#E5673E]">
              <RotateCcw size={16} strokeWidth={2.2} />
            </div>
          </div>
          <div className="mt-3 text-[30px] font-extrabold text-[#1C1C1E] tracking-tight">
            {bestSellersCount}
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs font-medium text-[#E5673E]">
            <TrendingUp size={14} />
            <span>Customer favorites</span>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. RECENT ACTIVITY & QUICK START (2-column section)       */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* Recent Activity (Left Column - 7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <h2 className="text-[15px] font-bold text-[#1C1C1E]">Recent activity</h2>
            <p className="text-[12px] text-[#888888] mt-0.5">The latest changes across your catalogue</p>

            <div className="mt-5 space-y-4">
              {dynamicActivities.length === 0 ? (
                <div className="text-center py-6 text-gray-400 text-xs">
                  No recent activity recorded yet.
                </div>
              ) : (
                dynamicActivities.map(item => (
                  <div key={item.id} className="flex items-start justify-between text-xs">
                    <div className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-[#D92F68] mt-1 flex-shrink-0" />
                      <div>
                        <div className="font-semibold text-[#252525]">{item.title}</div>
                        <div className="text-[#888888] text-[11px] mt-0.5">{item.subtitle}</div>
                      </div>
                    </div>
                    <span className="text-[#999999] text-[11px]">{item.time}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Start (Right Column - 5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <span className="text-[10px] font-bold text-[#D92F68] tracking-wider uppercase">
              QUICK START
            </span>
            <h2 className="text-[15px] font-bold text-[#1C1C1E] mt-1">Build your catalogue</h2>
            <p className="text-[11px] text-[#777777] mt-0.5 leading-relaxed">
              Create a category first, then add products and choose where they appear.
            </p>

            <div className="mt-5 space-y-4">
              {/* Step 1 */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full bg-[#DDF7EF] text-[#0EA77B] text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  ✓
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[#252525]">Create categories</div>
                  <div className="text-[#888888] text-[11px] mt-0.5">
                    {categories.length > 0 ? `${categories.length} categories ready` : 'Set up your product groups'}
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  2
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[#252525]">Add a product</div>
                  <div className="text-[#888888] text-[11px] mt-0.5">Images, details and price</div>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex items-start gap-3.5">
                <div className="w-5 h-5 rounded-full border border-gray-300 text-gray-500 text-[11px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                  3
                </div>
                <div className="leading-tight">
                  <div className="text-xs font-semibold text-[#252525]">Publish to website</div>
                  <div className="text-[#888888] text-[11px] mt-0.5">Make it visible to customers</div>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 mt-4 border-t border-gray-50">
            <Link
              href="/admin/products"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D92F68] hover:text-[#B81E52] transition-colors"
            >
              <span>Continue with products</span>
              <span className="text-[14px]">›</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 3. CURATED PRODUCTS SECTION (Table matching screenshot)  */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-[16px] font-bold text-[#1C1C1E]">
              Curated Products on Baby&apos;s Bazaar
            </h2>
            <p className="text-[12px] text-[#777777] mt-0.5">
              Simple product view. Click any toggle to show or hide from your online customers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Find by title or category..."
                className="pl-8 pr-4 py-1.5 bg-[#F9F9FB] border border-gray-200 rounded-lg text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#D92F68] focus:border-[#D92F68] w-48 sm:w-56 transition-all"
              />
            </div>

            {/* + New Item Button */}
            <button
              onClick={handleOpenNew}
              className="flex items-center gap-1.5 bg-[#D92F68] hover:bg-[#C2235B] active:scale-[0.98] text-white text-xs font-semibold px-3.5 py-2 rounded-lg shadow-2xs transition-all flex-shrink-0"
            >
              <Plus size={14} strokeWidth={2.5} />
              <span>New Item</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-100 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                <th className="py-3 px-6">Item & Thumbnail</th>
                <th className="py-3 px-6">Category</th>
                <th className="py-3 px-6">Price</th>
                <th className="py-3 px-6">Show in Shop</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-xs">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400">
                    No products matching your search.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(product => {
                  const categoryName = product.categories?.name || 'Unassigned'
                  const color = categoryColors[categoryName] || {
                    bg: 'bg-gray-100',
                    text: 'text-gray-700',
                  }
                  const thumb = product.product_images?.[0] || '/babys-bazaar-logo.png'

                  return (
                    <tr
                      key={product.id}
                      className="hover:bg-[#FCFAFB] transition-colors group"
                    >
                      {/* Item & Thumbnail */}
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3.5">
                          <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-pink-50 border border-gray-100 flex-shrink-0">
                            <Image
                              src={thumb}
                              alt={product.title}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div>
                            <div className="font-bold text-[#252525] text-[13px] hover:text-[#D92F68] transition-colors">
                              {product.title}
                            </div>
                            <div className="text-[11px] text-[#888888] line-clamp-1 mt-0.5 max-w-xs">
                              {product.description || 'Featured in Baby catalogue'}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category Badge */}
                      <td className="py-3.5 px-6">
                        <span
                          className={`inline-block px-3 py-1 rounded-full text-[11px] font-semibold ${color.bg} ${color.text}`}
                        >
                          {categoryName}
                        </span>
                      </td>

                      {/* Price */}
                      <td className="py-3.5 px-6 font-bold text-[#252525] text-[13px]">
                        {formatPrice(product.price)}
                      </td>

                      {/* Show in Shop (Active / Hidden Toggle) */}
                      <td className="py-3.5 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(product)}
                          className={`px-3 py-1 rounded-full text-[11px] font-semibold transition-all ${
                            product.status === 'active'
                              ? 'bg-[#DDF7EF] text-[#0EA77B] hover:bg-[#c9f2e5]'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                        >
                          {product.status === 'active' ? 'Active' : 'Hidden'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(product)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 bg-white border border-gray-200 rounded-lg text-xs font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-colors"
                          >
                            <Pencil size={12} className="text-gray-500" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleShare(product)}
                            title="Share product link"
                            className="p-1.5 text-gray-400 hover:text-[#D92F68] hover:bg-pink-50 rounded-lg transition-colors"
                          >
                            <Share2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Bottom Notice Strip */}
        <div className="p-4 bg-[#F8FDFB] border-t border-[#E6F5EF] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-gray-600 font-medium">
            <CheckCircle2 size={16} className="text-[#0EA77B] flex-shrink-0" />
            <span>
              Showing {filteredProducts.length} of {products.length} items currently in your catalog. No complicated SKU codes or quantities needed!
            </span>
          </div>
          <Link
            href="/admin/products"
            className="self-start sm:self-auto px-3.5 py-1.5 bg-white border border-gray-200 hover:border-[#D92F68] hover:text-[#D92F68] text-gray-700 rounded-lg font-semibold text-[11px] shadow-2xs transition-colors flex items-center gap-1"
          >
            <span>Browse All {products.length} Products</span>
            <span>↗</span>
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 4. ACTIVE HOMEPAGE BANNER (Exact layout from reference)  */}
      {/* ======================================================== */}
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <h2 className="text-[16px] font-bold text-[#1C1C1E]">
            Active Homepage Banner
          </h2>
          <span className="bg-[#DDF7EF] text-[#0EA77B] text-[11px] font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#0EA77B] animate-pulse" />
            Live Slide {activeBannerIndex + 1}
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Banner Preview (Left - 9 cols) */}
          <div className="lg:col-span-9 relative rounded-2xl overflow-hidden min-h-[220px] bg-stone-900 border border-gray-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] group">
            {activeBanner ? (
              <>
                <Image
                  src={activeBanner.image}
                  alt={activeBanner.heading || 'Hero Banner'}
                  fill
                  className="object-cover opacity-85 group-hover:scale-[1.01] transition-transform duration-500"
                />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10 p-7 flex flex-col justify-between">
                  {/* Top Row: Button */}
                  <div className="flex justify-end">
                    <Link
                      href="/admin/banners"
                      className="bg-white/95 backdrop-blur text-gray-800 text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-white transition-all"
                    >
                      <Pencil size={12} />
                      <span>Manage Visual</span>
                    </Link>
                  </div>

                  {/* Bottom: Text Content */}
                  <div>
                    {activeBanner.heading && (
                      <h3 className="text-[22px] font-bold text-white mt-0.5 drop-shadow-sm leading-tight">
                        {activeBanner.heading}
                      </h3>
                    )}
                    {activeBanner.link && (
                      <p className="text-[11px] text-white/70 mt-1">
                        Button target: {activeBanner.link}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="h-full min-h-[220px] flex flex-col items-center justify-center p-8 text-center bg-gray-50 border border-dashed border-gray-200 rounded-2xl">
                <p className="text-sm font-medium text-gray-500 mb-2">No active hero banners configured.</p>
                <Link
                  href="/admin/banners"
                  className="text-xs font-semibold text-[#D92F68] hover:underline"
                >
                  Create your first hero banner &rarr;
                </Link>
              </div>
            )}
          </div>

          {/* Upload Area (Right - 3 cols) */}
          <div className="lg:col-span-3">
            <Link
              href="/admin/banners"
              className="w-full h-full min-h-[220px] rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/70 hover:bg-pink-50/40 hover:border-[#D92F68]/40 transition-colors flex flex-col items-center justify-center p-6 text-center cursor-pointer group"
            >
              <div className="w-12 h-12 rounded-full bg-[#EDEBFF] flex items-center justify-center text-[#6E56CF] group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <span className="text-xs font-bold text-gray-800 mt-3">Upload Image</span>
              <span className="text-[11px] text-gray-400 mt-0.5">1200 x 1200 px recommended</span>
            </Link>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-1">
          <button
            onClick={() =>
              setActiveBannerIndex(prev => (prev + 1) % Math.max(banners.length, 1))
            }
            className="sm:col-span-4 bg-[#EDF2FE] hover:bg-[#E2EAFA] text-[#345DEE] text-xs font-semibold py-2.5 rounded-xl transition-colors text-center"
          >
            Change Slide
          </button>
          <Link
            href="/admin/banners"
            className="sm:col-span-6 bg-[#E84E36] hover:bg-[#D43D26] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors text-center flex items-center justify-center"
          >
            Manage All Slides
          </Link>
          <button
            onClick={() => toast.info('To delete a banner, use the Manage All Slides panel')}
            className="sm:col-span-2 bg-[#D92F68] hover:bg-[#C2235B] text-white text-xs font-semibold py-2.5 rounded-xl transition-colors text-center"
          >
            Delete
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 5. DELIVERY IMAGES (Customer photos section)             */}
      {/* ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#F0EDF5] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-[16px] font-bold text-[#1C1C1E]">Delivery Images</h2>
            <span className="text-xs text-gray-400 font-normal">Recently added</span>
          </div>
          <Link
            href="/admin/photos"
            className="text-gray-400 hover:text-gray-700 transition-colors"
            title="Manage delivery photos"
          >
            <Layers size={18} />
          </Link>
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {/* Upload Card */}
          <Link
            href="/admin/photos"
            className="aspect-[4/5] rounded-2xl border-2 border-dashed border-[#DDD2F9] bg-[#F7F4FD] hover:bg-[#F2EDFB] hover:border-[#6E56CF] transition-colors flex flex-col items-center justify-center p-4 text-center cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#6E56CF] shadow-xs group-hover:scale-110 transition-transform">
              <UploadCloud size={20} />
            </div>
            <span className="text-xs font-bold text-gray-800 mt-2.5">Upload Image</span>
            <span className="text-[10px] text-gray-400 mt-0.5">1200 x 1200 px recommended</span>
          </Link>

          {/* Photo Cards from Supabase */}
          {photos.slice(0, 3).map((photo, i) => (
            <div
              key={photo.id}
              className="aspect-[4/5] rounded-2xl overflow-hidden relative shadow-2xs border border-gray-100 group"
            >
              <Image
                src={photo.image}
                alt={photo.caption || 'Customer delivery photo'}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {/* Badge */}
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-[#E65A42] text-white text-[9px] font-bold px-2 py-0.5 rounded shadow-xs">
                  Shop Now
                </span>
              </div>
              {/* Caption overlay */}
              {photo.caption && (
                <div className="absolute inset-x-0 bottom-0 p-2.5 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[11px] text-white font-medium line-clamp-1">
                    {photo.caption}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer See All */}
        <div className="flex justify-end pt-1">
          <Link
            href="/admin/photos"
            className="text-xs font-semibold text-[#252525] hover:text-[#D92F68] transition-colors flex items-center gap-1"
          >
            <span>See All</span>
            <ArrowRight size={13} />
          </Link>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 6. MODAL: QUICK ADD / EDIT PRODUCT                       */}
      {/* ======================================================== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingProduct ? 'Edit Product' : 'Add New Item'}
              </h3>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={e => setFormTitle(e.target.value)}
                  placeholder="e.g. Honey Ribbed Cotton Romper"
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D92F68]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={e => setFormDescription(e.target.value)}
                  placeholder="e.g. Featured in Spring Newborn Drop..."
                  className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D92F68]"
                />
              </div>

              {/* Price & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Price (₹) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="1"
                    value={formPrice}
                    onChange={e => setFormPrice(e.target.value)}
                    placeholder="499"
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#D92F68]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={e => setFormCategoryId(e.target.value)}
                    className="w-full text-xs px-3 py-2 border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-1 focus:ring-[#D92F68]"
                  >
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Product Image
                </label>
                <div className="flex items-center gap-3">
                  {formImages[0] ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200">
                      <Image
                        src={formImages[0]}
                        alt="Product preview"
                        fill
                        className="object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormImages([])}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ) : null}

                  <label className="flex-1 border-2 border-dashed border-gray-200 hover:border-[#D92F68] rounded-xl p-3 text-center cursor-pointer transition-colors">
                    <span className="text-xs text-gray-500 font-medium">
                      {isUploading ? 'Uploading...' : 'Click to upload image'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadImage}
                      disabled={isUploading}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formNewArrival}
                    onChange={e => setFormNewArrival(e.target.checked)}
                    className="rounded text-[#D92F68] focus:ring-[#D92F68]"
                  />
                  <span>New Arrival</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700">
                  <input
                    type="checkbox"
                    checked={formBestSeller}
                    onChange={e => setFormBestSeller(e.target.checked)}
                    className="rounded text-[#D92F68] focus:ring-[#D92F68]"
                  />
                  <span>Best Seller</span>
                </label>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 rounded-lg text-xs font-medium hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || isUploading}
                  className="px-5 py-2 bg-[#D92F68] hover:bg-[#C2235B] text-white rounded-lg text-xs font-semibold transition-all disabled:opacity-60 flex items-center gap-1.5"
                >
                  {isPending && <Loader2 size={12} className="animate-spin" />}
                  <span>{editingProduct ? 'Save Changes' : 'Create Item'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
