'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { toast } from 'sonner'
import { X, Plus, Loader2 } from 'lucide-react'
import { createProduct, updateProduct } from '@/lib/actions/products'
import { uploadFile, validateImageFile } from '@/lib/upload'
import { Category, Product } from '@/types/database.types'
import { formatPrice } from '@/lib/utils'
import ImageGuidelineCard from '@/components/admin/ImageGuidelineCard'
import ImageMetadataPreview from '@/components/admin/ImageMetadataPreview'

const CLOTHING_AGE_OPTIONS = [
  '1–3 Months',
  '3–6 Months',
  '6–12 Months',
  '12–18 Months',
  '18–24 Months',
]

const TOY_AGE_OPTIONS = [
  '0–12 Months',
  '1–3 Years',
  '3–5 Years',
  '5–8 Years',
  '8+ Years',
]

const TOY_FEATURE_OPTIONS = [
  'Battery Operated',
  'Outdoor',
  'Sound & Lights',
  'Educational & STEM',
  'Non-Toxic',
  'USB Rechargeable',
  'Remote Controlled',
]

interface Props {
  categories: Category[]
  product?: any
}

export default function ProductForm({ categories, product }: Props) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()
  const [uploadingImage, setUploadingImage] = useState(false)

  const activeCategories = categories.filter(c => c.status === 'active')
  const toySubcategories = activeCategories.filter(c => c.description?.includes('[parent:toys]'))
  const topCategories = activeCategories.filter(c => !c.description?.includes('[parent:toys]'))
  const toysMainCat = topCategories.find(c => c.slug === 'toys')
  const initialToySubcat = toySubcategories.find(s => s.id === (product?.category_id || ''))

  const [title, setTitle] = useState(product?.title ?? '')
  const [description, setDescription] = useState(product?.description ?? '')
  const [price, setPrice] = useState(product?.price?.toString() ?? '')
  const [categoryId, setCategoryId] = useState(() => {
    if (initialToySubcat && toysMainCat) return toysMainCat.id
    return product?.category_id ?? ''
  })
  const [toySubcategoryId, setToySubcategoryId] = useState<string>(() => {
    return initialToySubcat?.id ?? ''
  })

  // Toy Classification Fields
  const rawShortDesc = product?.short_description || ''
  const [toyProductType, setToyProductType] = useState<string>(() => {
    const match = rawShortDesc.match(/Type:\s*([^|]+)/i)
    return match ? match[1].trim() : ''
  })
  const [toyAgeRange, setToyAgeRange] = useState<string>(() => {
    const match = rawShortDesc.match(/Age:\s*([^|]+)/i)
    return match ? match[1].trim() : ''
  })
  const [toyTags, setToyTags] = useState<string[]>(() => {
    const match = rawShortDesc.match(/Tags:\s*([^|]+)/i)
    if (!match) return []
    return match[1].split(',').map((t: string) => t.trim()).filter(Boolean)
  })

  const [selectedAges, setSelectedAges] = useState<string[]>(() => {
    if (!product) return []
    const source = (product?.short_description || '') + ' ' + (product?.description || '')
    return CLOTHING_AGE_OPTIONS.filter(age => {
      const altAge = age.replace(/–/g, '-')
      return source.includes(age) || source.includes(altAge)
    })
  })
  const [images, setImages] = useState<string[]>(product?.product_images ?? [])
  const [bestSeller, setBestSeller] = useState(product?.best_seller ?? false)
  const [newArrival, setNewArrival] = useState(product?.new_arrival ?? false)
  const [featured, setFeatured] = useState(product?.featured ?? false)
  const [status, setStatus] = useState<'active' | 'inactive'>(product?.status ?? 'active')
  const [errors, setErrors] = useState<Record<string, string>>({})

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); return }
    setUploadingImage(true)
    const result = await uploadFile(file, 'products', product?.id)
    setUploadingImage(false)
    if ('error' in result) { toast.error(result.error); return }
    setImages(prev => [...prev, result.url])
    toast.success('Image added')
  }

  function validate(): boolean {
    const errs: Record<string, string> = {}
    if (!title.trim()) errs.title = 'Title is required'
    if (!price || isNaN(Number(price)) || Number(price) < 0) errs.price = 'Valid price is required'
    if (!categoryId) errs.category = 'Category is required'
    if (images.length === 0) errs.images = 'At least one product image is required'
    setErrors(errs)
    if (Object.keys(errs).length > 0) return false

    if (isToysSelected && !toySubcategoryId) {
      toast.error('Please select a toy subcategory')
      return false
    }

    return true
  }

  const selectedCat = activeCategories.find(c => c.id === categoryId)
  const isClothingSelected = selectedCat?.slug === 'clothing' || selectedCat?.name.toLowerCase() === 'clothing'
  const isToysSelected = selectedCat?.slug === 'toys' || selectedCat?.name.toLowerCase() === 'toys'

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return

    startTransition(async () => {
      let finalCategoryId = categoryId
      let finalShortDescription: string | null = null

      if (isClothingSelected) {
        finalShortDescription = selectedAges.length > 0 ? selectedAges.join(', ') : null
      } else if (isToysSelected) {
        if (toySubcategoryId) {
          finalCategoryId = toySubcategoryId
        }
        const toyMetaParts = [
          toyProductType ? `Type: ${toyProductType}` : null,
          toyAgeRange ? `Age: ${toyAgeRange}` : null,
          toyTags.length > 0 ? `Tags: ${toyTags.join(', ')}` : null,
        ].filter(Boolean)
        finalShortDescription = toyMetaParts.length > 0 ? toyMetaParts.join(' | ') : null
      }

      const payload = {
        title: title.trim(),
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''),
        short_description: finalShortDescription,
        description: description.trim() || undefined,
        price: Number(price),
        category_id: finalCategoryId,
        video_url: null,
        best_seller: bestSeller,
        new_arrival: newArrival,
        featured,
        status,
        sort_order: 0,
        product_images: images,
      }

      const imagePayloads = images.map((url, idx) => ({ url, is_primary: idx === 0, alt_text: title.trim() }))

      try {
        const result = product
          ? await updateProduct(product.id, payload, imagePayloads)
          : await createProduct(payload, imagePayloads)

        if (result?.error) { toast.error(result.error); return }
        toast.success(product ? 'Product updated!' : 'Product created!')
        router.push('/admin/products')
      } catch (err: any) {
        if (err?.message?.includes('Server Action') || err?.message?.includes('failed-to-find-server-action')) {
          toast.info('New system update detected. Refreshing page...')
          setTimeout(() => window.location.reload(), 1000)
        } else {
          toast.error(err?.message || 'Something went wrong. Please try again.')
        }
      }
    })
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Header Context */}
      <div className="mb-8">
        <button 
          type="button" 
          onClick={() => router.push('/admin/products')}
          className="text-[13px] font-medium text-[#8A8A8A] hover:text-[#202124] transition-colors flex items-center gap-1.5 mb-5"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          Back to products
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[28px] font-bold text-[#202124] tracking-tight">{product ? 'Edit product' : 'Add product'}</h1>
            <p className="text-[14px] text-[#8A8A8A] mt-1.5">
              {product ? 'Update product information, category and visibility.' : 'Add product information, choose its category and decide where it appears.'}
            </p>
          </div>
          <div className="text-[12px] font-medium text-[#8A8A8A] tracking-wider uppercase">
            {product ? 'Edit Catalogue Entry' : 'New Catalogue Entry'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Section 01: Images */}
          <div className="bg-white border border-[#ECE8EA] rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center text-sm font-bold flex-shrink-0">
                01
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#202124]">Product images</h2>
                <p className="text-sm text-[#8A8A8A] mt-0.5">Add clear photos customers will see in the catalogue.</p>
              </div>
            </div>

            <div className="pl-12 space-y-5">
              {images.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-[#202124]">
                      Uploaded Photos ({images.length})
                    </span>
                    <span className="text-[11px] text-[#8A8A8A]">First image is primary thumbnail</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-2">
                    {images.map((url, idx) => (
                      <div key={idx} className="relative">
                        {idx === 0 && (
                          <div className="absolute top-2 left-2 z-10 px-2 py-0.5 rounded-md bg-[#E52D68] text-white text-[10px] font-bold shadow-xs">
                            Primary
                          </div>
                        )}
                        <ImageMetadataPreview
                          url={url}
                          recommendedWidth={1200}
                          recommendedHeight={1200}
                          recommendedLabel="1200 × 1200 px (1:1)"
                          onRemove={() => setImages(images.filter((_, i) => i !== idx))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <label className="block border-2 border-dashed border-[#ECE8EA] hover:border-[#E52D68]/40 hover:bg-[#FAF9FA] rounded-xl p-8 text-center cursor-pointer transition-colors group">
                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#FAF9FA] group-hover:bg-white flex items-center justify-center text-[#E52D68] border border-[#ECE8EA] transition-colors">
                  {uploadingImage ? <Loader2 className="animate-spin" size={20} /> : <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>}
                </div>
                <h4 className="text-sm font-semibold text-[#202124] mb-1">
                  {images.length === 0 ? 'Upload primary product image' : 'Add additional gallery image'}
                </h4>
                <p className="text-xs text-[#8A8A8A]">Recommended 1200 × 1200 px (1:1 Square) • Max 5 MB</p>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>
              {errors.images && <p className="text-xs text-red-500 font-medium">{errors.images}</p>}

              {/* Guidelines Info Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <ImageGuidelineCard type="product" compact />
                <ImageGuidelineCard type="product_gallery" compact />
              </div>
            </div>
          </div>

          {/* Section 02: Details */}
          <div className="bg-white border border-[#ECE8EA] rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center text-sm font-bold flex-shrink-0">
                02
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#202124]">Product details</h2>
                <p className="text-sm text-[#8A8A8A] mt-0.5">The essential information customers will read.</p>
              </div>
            </div>

            <div className="pl-12 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">Product title *</label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Organic Cotton Swaddle"
                  className="w-full px-4 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white placeholder-[#8A8A8A]"
                />
                {errors.title && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.title}</p>}
              </div>

              <div>
                <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">Description *</label>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the product in a few clear sentences."
                  className="w-full px-4 py-3 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white placeholder-[#8A8A8A] resize-none"
                />
                <p className="text-[12px] text-[#8A8A8A] mt-1.5">Keep it concise and helpful for parents.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">Price (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A] font-medium">₹</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={price}
                      onChange={e => setPrice(e.target.value)}
                      placeholder="0"
                      className="w-full pl-8 pr-4 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white"
                    />
                  </div>
                  {errors.price && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.price}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">Category *</label>
                  <select
                    value={categoryId}
                    onChange={e => {
                      setCategoryId(e.target.value)
                      // Reset toy subcategory if category changes away from toys
                      const chosen = activeCategories.find(c => c.id === e.target.value)
                      if (chosen?.slug !== 'toys' && chosen?.name.toLowerCase() !== 'toys') {
                        setToySubcategoryId('')
                      }
                    }}
                    className="w-full px-4 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white text-[#202124] appearance-none cursor-pointer"
                  >
                    <option value="" disabled>Select a category</option>
                    {topCategories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1.5 font-medium">{errors.category}</p>}
                </div>
              </div>

              {/* ───── TOYS CLASSIFICATION & SUBCATEGORY (3-LEVEL HIERARCHY) ───── */}
              {isToysSelected && (
                <div className="pt-5 border-t border-[#ECE8EA] space-y-5 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Toy Classification (3-Level System)</h4>
                      <p className="text-xs text-gray-500">Toys → Subcategory → Product Type &amp; Tags</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-50 text-[#FF2E63] border border-pink-100">
                      Toys System
                    </span>
                  </div>

                  {/* 1. Subcategory Dropdown */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">
                      Toy Subcategory *
                    </label>
                    <select
                      value={toySubcategoryId}
                      onChange={e => setToySubcategoryId(e.target.value)}
                      className="w-full px-4 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white text-[#202124] appearance-none cursor-pointer"
                    >
                      <option value="">Select a subcategory (e.g. Remote Control Toys)</option>
                      {toySubcategories.map(sub => (
                        <option key={sub.id} value={sub.id}>{sub.name}</option>
                      ))}
                    </select>
                    <p className="text-[11px] text-gray-400 mt-1">
                      Choose which toy subcategory this item belongs to.
                    </p>
                  </div>

                  {/* 2. Product Type & Age Range */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">
                        Product Type
                      </label>
                      <input
                        type="text"
                        value={toyProductType}
                        onChange={e => setToyProductType(e.target.value)}
                        placeholder="e.g. RC Car, Plush Doll, Stunt Bike"
                        className="w-full px-4 py-2 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">
                        Age Range
                      </label>
                      <select
                        value={toyAgeRange}
                        onChange={e => setToyAgeRange(e.target.value)}
                        className="w-full px-4 py-2 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white text-[#202124] appearance-none cursor-pointer"
                      >
                        <option value="">Select recommended age</option>
                        {TOY_AGE_OPTIONS.map(a => (
                          <option key={a} value={a}>{a}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* 3. Feature Tags */}
                  <div>
                    <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">
                      Features &amp; Tags
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {TOY_FEATURE_OPTIONS.map(feat => {
                        const isChecked = toyTags.includes(feat)
                        return (
                          <label
                            key={feat}
                            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                              isChecked
                                ? 'bg-pink-50 border-[#FF2E63] text-[#FF2E63]'
                                : 'bg-white border-[#ECE8EA] text-gray-700 hover:bg-[#FAF9FA]'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                setToyTags(prev =>
                                  prev.includes(feat)
                                    ? prev.filter(t => t !== feat)
                                    : [...prev, feat]
                                )
                              }}
                              className="w-4 h-4 rounded text-[#FF2E63] border-gray-300 focus:ring-[#FF2E63] accent-[#FF2E63]"
                            />
                            <span>{feat}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Age attribute selection for Clothing */}
              {isClothingSelected && (
                <div className="pt-5 border-t border-[#ECE8EA] animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-[13px] font-semibold text-[#202124]">
                      Age
                    </label>
                    <span className="text-[11px] text-[#8A8A8A]">
                      Select all applicable age groups (multiple allowed)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {CLOTHING_AGE_OPTIONS.map(age => {
                      const isChecked = selectedAges.includes(age)
                      return (
                        <label
                          key={age}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-xs font-semibold cursor-pointer transition-all select-none ${
                            isChecked
                              ? 'bg-[#FCE8EF] border-[#E52D68] text-[#E52D68] shadow-2xs'
                              : 'bg-white border-[#ECE8EA] text-gray-700 hover:bg-[#FAF9FA]'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              setSelectedAges(prev =>
                                prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
                              )
                            }}
                            className="w-4 h-4 rounded text-[#E52D68] border-gray-300 focus:ring-[#E52D68] accent-[#E52D68]"
                          />
                          <span>{age}</span>
                        </label>
                      )
                    })}
                  </div>
                  {selectedAges.length > 0 && (
                    <p className="text-[12px] text-[#E52D68] mt-2 font-medium">
                      Selected: {selectedAges.join(', ')}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Section 03: Classification */}
          <div className="bg-white border border-[#ECE8EA] rounded-2xl p-8 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center text-sm font-bold flex-shrink-0">
                03
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#202124]">Classification</h2>
                <p className="text-sm text-[#8A8A8A] mt-0.5">A product can appear in more than one collection.</p>
              </div>
            </div>

            <div className="pl-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                
                {/* Best Seller */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#ECE8EA] bg-[#FAF9FA]">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#202124]">Best Seller</h4>
                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">Highlight a customer favourite</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={bestSeller} onChange={(e) => setBestSeller(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E52D68]"></div>
                  </label>
                </div>

                {/* New Arrival */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#ECE8EA] bg-[#FAF9FA]">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#202124]">New Arrival</h4>
                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">Show in the newest collection</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={newArrival} onChange={(e) => setNewArrival(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E52D68]"></div>
                  </label>
                </div>

                {/* Featured */}
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#ECE8EA] bg-[#FAF9FA]">
                  <div>
                    <h4 className="text-[13px] font-semibold text-[#202124]">Featured</h4>
                    <p className="text-[11px] text-[#8A8A8A] mt-0.5">Give it priority placement</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={featured} onChange={(e) => setFeatured(e.target.checked)} />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E52D68]"></div>
                  </label>
                </div>
                
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Publish Card */}
        <div className="lg:col-span-4 sticky top-[100px]">
          <div className="bg-white border border-[#ECE8EA] rounded-2xl p-6 shadow-[0_4px_20px_-8px_rgba(0,0,0,0.05)]">
            <h3 className="text-base font-bold text-[#202124] mb-1">Publish product</h3>
            <p className="text-[13px] text-[#8A8A8A] mb-6 leading-relaxed">
              Active products appear on the Baby&apos;s Bazaar website.
            </p>

            <div className="flex items-center justify-between p-4 rounded-xl border border-[#ECE8EA] bg-[#FAF9FA] mb-6">
              <div>
                <h4 className="text-[13px] font-semibold text-[#202124]">Status</h4>
                <p className="text-[12px] text-[#8A8A8A] mt-0.5">{status === 'active' ? 'Visible on website' : 'Hidden from website'}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" checked={status === 'active'} onChange={(e) => setStatus(e.target.checked ? 'active' : 'inactive')} />
                <div className="w-10 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2E7D32]"></div>
              </label>
            </div>

            <div className="bg-[#FAF9FA] rounded-xl p-4 mb-6">
              <h5 className="text-[10px] font-bold text-[#8A8A8A] uppercase tracking-wider mb-3">After Saving</h5>
              <div className="flex items-center gap-2 text-[12px] font-medium text-[#202124]">
                <span>Product</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A8A8A]"><path d="m9 18 6-6-6-6"/></svg>
                <span className={status === 'active' ? 'text-[#2E7D32]' : 'text-[#8A8A8A]'}>{status === 'active' ? 'Published' : 'Draft'}</span>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#8A8A8A]"><path d="m9 18 6-6-6-6"/></svg>
                <span>Website</span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                disabled={pending || uploadingImage}
                className="w-full bg-[#E52D68] hover:bg-[#D4225A] text-white text-[14px] font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {pending ? <Loader2 className="animate-spin" size={18} /> : null}
                <span>{product ? 'Save changes' : 'Publish product'}</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/admin/products')}
                disabled={pending || uploadingImage}
                className="w-full bg-white hover:bg-[#FAF9FA] text-[#202124] text-[14px] font-medium py-3 rounded-xl border border-[#ECE8EA] transition-all disabled:opacity-70"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
