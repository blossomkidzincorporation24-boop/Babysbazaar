'use client'

import { useState, useTransition, useMemo } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Package,
  Search,
  ChevronRight,
  ChevronDown,
  Layers,
  Eye,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react'
import { Category } from '@/types/database.types'
import {
  createToySubcategory,
  updateToySubcategory,
  deleteToySubcategory,
  toggleToySubcategoryStatus,
} from '@/lib/actions/toys'
import { cleanToyDescription } from '@/lib/utils'
import { uploadFile, validateImageFile } from '@/lib/upload'

interface Props {
  mainCategory: Category | null
  initialSubcategories: Category[]
}

export default function ToyManagementClient({
  mainCategory,
  initialSubcategories,
}: Props) {
  const [subcategories, setSubcategories] = useState<Category[]>(initialSubcategories)
  const [searchQuery, setSearchQuery] = useState('')
  const [treeExpanded, setTreeExpanded] = useState(true)

  // Modal State
  const [showModal, setShowModal] = useState(false)
  const [editingSub, setEditingSub] = useState<Category | null>(null)
  const [formName, setFormName] = useState('')
  const [formSlug, setFormSlug] = useState('')
  const [formDesc, setFormDesc] = useState('')
  const [formImage, setFormImage] = useState<string | null>(null)
  const [formStatus, setFormStatus] = useState<'active' | 'inactive'>('active')
  const [formSortOrder, setFormSortOrder] = useState<number>(0)
  const [parentSelection, setParentSelection] = useState('toys')

  const [uploadingImage, setUploadingImage] = useState(false)
  const [pending, startTransition] = useTransition()

  // Filtered subcategories based on search
  const filteredSubcategories = useMemo(() => {
    if (!searchQuery.trim()) return subcategories
    const query = searchQuery.toLowerCase().trim()
    return subcategories.filter(
      (s) =>
        s.name.toLowerCase().includes(query) ||
        s.slug.toLowerCase().includes(query) ||
        (s.description || '').toLowerCase().includes(query)
    )
  }, [subcategories, searchQuery])

  // Total products across all subcategories
  const totalToyProducts = useMemo(() => {
    return subcategories.reduce((acc, curr) => acc + (curr.product_count || 0), 0)
  }, [subcategories])

  function openAddModal() {
    setEditingSub(null)
    setFormName('')
    setFormSlug('')
    setFormDesc('')
    setFormImage(null)
    setFormStatus('active')
    setFormSortOrder(subcategories.length + 1)
    setParentSelection('toys')
    setShowModal(true)
  }

  function openEditModal(sub: Category) {
    setEditingSub(sub)
    setFormName(sub.name)
    setFormSlug(sub.slug)
    setFormDesc(cleanToyDescription(sub.description))
    setFormImage(sub.image || null)
    setFormStatus(sub.status)
    setFormSortOrder(sub.sort_order || 0)
    setParentSelection('toys')
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingSub(null)
  }

  // Handle image upload to Cloudflare R2 / Supabase
  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }
    setUploadingImage(true)
    const result = await uploadFile(file, 'categories')
    setUploadingImage(false)
    if ('error' in result) {
      toast.error(result.error)
      return
    }
    setFormImage(result.url)
    toast.success('Category image uploaded!')
  }

  // Handle form submit (Create or Update)
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) {
      toast.error('Category name is required')
      return
    }

    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', formName.trim())
      if (formSlug.trim()) fd.set('slug', formSlug.trim())
      if (formDesc.trim()) fd.set('description', formDesc.trim())
      if (formImage) fd.set('image', formImage)
      fd.set('status', formStatus)
      fd.set('sort_order', String(formSortOrder))

      const res = editingSub
        ? await updateToySubcategory(editingSub.id, fd)
        : await createToySubcategory(fd)

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success(editingSub ? 'Subcategory updated!' : 'Subcategory created!')
      closeModal()
      window.location.reload()
    })
  }

  // Handle delete subcategory
  async function handleDelete(sub: Category) {
    if (
      !confirm(
        `Delete "${sub.name}" subcategory?\n\nThis will remove the subcategory from the public store. Existing products will remain intact.`
      )
    ) {
      return
    }

    const res = await deleteToySubcategory(sub.id)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    toast.success('Subcategory deleted')
    setSubcategories((prev) => prev.filter((s) => s.id !== sub.id))
  }

  // Handle toggle status
  async function handleToggleStatus(sub: Category) {
    const res = await toggleToySubcategoryStatus(sub.id, sub.status)
    if (res?.error) {
      toast.error(res.error)
      return
    }
    const newStatus = res.status as 'active' | 'inactive'
    toast.success(`Subcategory marked as ${newStatus}`)
    setSubcategories((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: newStatus } : s))
    )
  }

  return (
    <div className="animate-in fade-in duration-300 pb-16 max-w-[1280px] mx-auto">
      {/* Top Back Navigation */}
      <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
        <Link
          href="/admin/categories"
          className="inline-flex items-center gap-2 text-xs font-semibold text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Categories</span>
        </Link>

        {/* Public Storefront Preview Link */}
        <Link
          href="/toys"
          target="_blank"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF2E63] hover:underline"
        >
          <ExternalLink size={13} />
          <span>View Public Toy Storefront</span>
        </Link>
      </div>

      {/* Page Header */}
      <div className="bg-white border border-gray-200/80 rounded-2xl p-6 sm:p-8 shadow-xs mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-50 text-[#FF2E63] border border-pink-100 uppercase tracking-wider">
                3-Level Classification
              </span>
              <span className="text-xs text-gray-400 font-medium">
                Toys → Subcategory → Product
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              Toy Category Management
            </h1>
            <p className="text-sm text-gray-500 max-w-2xl leading-relaxed">
              Organize all baby and kids toys through a structured 3-level tree.
              Any subcategory created here automatically reflects on the public storefront.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-[#FF2E63] hover:bg-[#E02454] text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Plus size={16} strokeWidth={2.5} />
              <span>Add Subcategory</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 mt-6 border-t border-gray-100">
          <div className="bg-gray-50/80 rounded-xl p-3.5">
            <p className="text-xs text-gray-500 font-medium">Parent Category</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {mainCategory?.name || 'Toys'}
            </p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3.5">
            <p className="text-xs text-gray-500 font-medium">Total Subcategories</p>
            <p className="text-base font-bold text-gray-900 mt-0.5">
              {subcategories.length} Subcategories
            </p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3.5">
            <p className="text-xs text-gray-500 font-medium">Active Subcategories</p>
            <p className="text-base font-bold text-green-700 mt-0.5">
              {subcategories.filter((s) => s.status === 'active').length} Active
            </p>
          </div>
          <div className="bg-gray-50/80 rounded-xl p-3.5">
            <p className="text-xs text-gray-500 font-medium">Linked Products</p>
            <p className="text-base font-bold text-[#FF2E63] mt-0.5">
              {totalToyProducts} Products
            </p>
          </div>
        </div>
      </div>

      {/* Search & Tree Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search toy subcategories by name or slug..."
            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF2E63] focus:ring-1 focus:ring-[#FF2E63] transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTreeExpanded((prev) => !prev)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
          >
            {treeExpanded ? (
              <>
                <ChevronDown size={14} /> Collapse Tree
              </>
            ) : (
              <>
                <ChevronRight size={14} /> Expand Tree
              </>
            )}
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          CATEGORY HIERARCHY TREE VIEW
      ───────────────────────────────────────────────────────────── */}
      <div className="bg-white border border-gray-200/90 rounded-2xl overflow-hidden shadow-xs mb-8">
        {/* Parent Category Header Node */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-pink-50/50 via-white to-white border-b border-gray-100 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setTreeExpanded((prev) => !prev)}
              className="p-1 hover:bg-pink-100/60 rounded-md text-[#FF2E63] transition-colors cursor-pointer"
            >
              {treeExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-pink-100 border border-pink-200 shrink-0">
              {mainCategory?.image ? (
                <Image
                  src={mainCategory.image}
                  alt="Toys"
                  fill
                  className="object-cover"
                />
              ) : (
                <Package size={20} className="m-auto text-[#FF2E63]" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900 text-base">Toys</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-green-50 text-green-700 font-semibold border border-green-200">
                  Active
                </span>
                <span className="text-xs text-gray-400 font-medium">/toys</span>
              </div>
              <p className="text-xs text-gray-500">
                Main Category · {subcategories.length} Subcategories · {totalToyProducts} Products
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF2E63] bg-pink-50 hover:bg-pink-100 border border-pink-200 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
            >
              <Plus size={14} /> Add Subcategory
            </button>
          </div>
        </div>

        {/* Subcategories Nested List */}
        {treeExpanded && (
          <div className="divide-y divide-gray-100">
            {filteredSubcategories.length === 0 ? (
              <div className="p-8 text-center text-sm text-gray-400">
                No toy subcategories found matching &quot;{searchQuery}&quot;.
              </div>
            ) : (
              filteredSubcategories.map((sub, index) => {
                const isCleanDesc = cleanToyDescription(sub.description)
                return (
                  <div
                    key={sub.id}
                    className="p-4 sm:px-6 hover:bg-gray-50/70 transition-colors flex items-center justify-between flex-wrap gap-4 group"
                  >
                    {/* Left: Tree line indicator + Image + Info */}
                    <div className="flex items-center gap-3.5 pl-6 sm:pl-8 relative">
                      {/* Tree line connector visual */}
                      <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-300 font-mono select-none">
                        {index === filteredSubcategories.length - 1 ? '└──' : '├──'}
                      </span>

                      {/* Subcategory Image */}
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                        {sub.image ? (
                          <Image
                            src={sub.image}
                            alt={sub.name}
                            fill
                            sizes="48px"
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <Package size={20} />
                          </div>
                        )}
                      </div>

                      {/* Title, slug, description */}
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-gray-900">
                            {sub.name}
                          </h3>
                          <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                            /toys/{sub.slug}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              sub.status === 'active'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {sub.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {isCleanDesc || 'No description added.'}
                        </p>
                      </div>
                    </div>

                    {/* Right: Product Count + Actions */}
                    <div className="flex items-center gap-4">
                      {/* Product Count Badge */}
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700">
                        {sub.product_count || 0} products
                      </span>

                      {/* Status Toggle Switch */}
                      <label
                        className="relative inline-flex items-center cursor-pointer"
                        title={sub.status === 'active' ? 'Deactivate' : 'Activate'}
                      >
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={sub.status === 'active'}
                          onChange={() => handleToggleStatus(sub)}
                        />
                        <div className="w-8 h-4.5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#FF2E63]" />
                      </label>

                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(sub)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors cursor-pointer"
                        title="Edit subcategory"
                      >
                        <Pencil size={15} />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(sub)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                        title="Delete subcategory"
                      >
                        <Trash2 size={15} />
                      </button>

                      {/* View on Public Website */}
                      <Link
                        href={`/toys/${sub.slug}`}
                        target="_blank"
                        className="p-1.5 rounded-lg text-gray-400 hover:text-[#FF2E63] hover:bg-pink-50 transition-colors"
                        title="View on store"
                      >
                        <ExternalLink size={15} />
                      </Link>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────
          ADD / EDIT TOY SUBCATEGORY MODAL (WITH LIVE PREVIEW)
      ───────────────────────────────────────────────────────────── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div
            className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-200 border border-gray-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {editingSub ? 'Edit Toy Subcategory' : 'Add Toy Subcategory'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Parent: Toys → {formName || 'New Subcategory'}
                </p>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Parent Category & Name */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Parent Category
                  </label>
                  <select
                    value={parentSelection}
                    onChange={(e) => setParentSelection(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF2E63]"
                    disabled
                  >
                    <option value="toys">Toys (Top-Level)</option>
                  </select>
                  <p className="text-[11px] text-gray-400 mt-1">
                    This subcategory will live under the &quot;Toys&quot; hierarchy.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Subcategory Name *
                  </label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => {
                      setFormName(e.target.value)
                      if (!editingSub) {
                        setFormSlug(
                          e.target.value
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/(^-|-$)+/g, '')
                        )
                      }
                    }}
                    placeholder="e.g. Remote Control Toys"
                    required
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF2E63] focus:ring-1 focus:ring-[#FF2E63]"
                  />
                </div>
              </div>

              {/* Slug & Display Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Slug
                  </label>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-400 px-3 py-2.5 bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl select-none">
                      /toys/
                    </span>
                    <input
                      type="text"
                      value={formSlug}
                      onChange={(e) => setFormSlug(e.target.value)}
                      placeholder="remote-control-toys"
                      className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-r-xl focus:outline-none focus:border-[#FF2E63] focus:ring-1 focus:ring-[#FF2E63]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formSortOrder}
                    onChange={(e) => setFormSortOrder(Number(e.target.value) || 0)}
                    min={0}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF2E63] focus:ring-1 focus:ring-[#FF2E63]"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Short Description / Tagline
                </label>
                <textarea
                  rows={2}
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  placeholder="e.g. High-speed RC cars, stunt buggies, and interactive drones for young racers."
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF2E63] focus:ring-1 focus:ring-[#FF2E63] resize-none"
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                  Category Image
                </label>
                <div className="flex items-center gap-4">
                  {formImage && (
                    <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shrink-0">
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <label className="flex-1 flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-[#FF2E63] hover:bg-pink-50/20 cursor-pointer transition-colors">
                    {uploadingImage ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Loader2 size={16} className="animate-spin text-[#FF2E63]" />
                        <span>Uploading image...</span>
                      </div>
                    ) : (
                      <>
                        <span className="text-xs font-semibold text-[#FF2E63]">
                          Click to upload image
                        </span>
                        <span className="text-[11px] text-gray-400 mt-0.5">
                          JPEG, PNG or WebP under 5MB
                        </span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageUpload}
                      disabled={uploadingImage}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3.5 bg-gray-50 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-gray-800">Active on Public Store</p>
                  <p className="text-[11px] text-gray-500">
                    If inactive, it will be hidden from shoppers but its data remains safe.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    className="sr-only peer"
                    checked={formStatus === 'active'}
                    onChange={(e) =>
                      setFormStatus(e.target.checked ? 'active' : 'inactive')
                    }
                  />
                  <div className="w-10 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#FF2E63]" />
                </label>
              </div>

              {/* ─────────────────────────────────────────────────────────
                  LIVE CARD PREVIEW BEFORE SAVING
              ───────────────────────────────────────────────────────── */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50/50 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
                  <Eye size={14} className="text-[#FF2E63]" />
                  <span>Live Storefront Card Preview</span>
                </div>

                <div className="max-w-[280px] bg-white rounded-2xl border border-gray-200/80 p-3 shadow-xs">
                  <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100 mb-2.5">
                    {formImage ? (
                      <Image
                        src={formImage}
                        alt="Preview"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <Package size={32} />
                      </div>
                    )}
                    <span className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 text-gray-700 backdrop-blur-xs">
                      0 items
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-gray-900 truncate">
                    {formName || 'Subcategory Title'}
                  </h4>
                  <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">
                    {formDesc || 'Short description preview.'}
                  </p>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || uploadingImage}
                  className="flex items-center gap-2 bg-[#FF2E63] hover:bg-[#E02454] disabled:opacity-50 text-white text-sm font-semibold px-6 py-2 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  {pending && <Loader2 size={15} className="animate-spin" />}
                  <span>{editingSub ? 'Save Changes' : 'Create Subcategory'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
