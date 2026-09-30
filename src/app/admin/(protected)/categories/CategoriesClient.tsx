'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Shirt,
  Package,
  Settings2,
  Layers,
} from 'lucide-react'
import { Category } from '@/types/database.types'
import {
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from '@/lib/actions/categories'
import { uploadFile, validateImageFile } from '@/lib/upload'

interface Props {
  initialCategories: Category[]
}

// Clothing is the only category with sub-management
const CLOTHING_SLUG = 'clothing'

function isClothing(cat: Category): boolean {
  return cat.slug === CLOTHING_SLUG || cat.name.toLowerCase() === 'clothing'
}

function isToys(cat: Category): boolean {
  return cat.slug === 'toys' || cat.name.toLowerCase() === 'toys'
}

export default function CategoriesClient({ initialCategories }: Props) {
  const [categories, setCategories] = useState(initialCategories)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Category | null>(null)
  const [formName, setFormName] = useState('')
  const [formImage, setFormImage] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  // Filter out subcategories belonging to Toys so main category grid stays clean
  const topLevelCategories = categories.filter(
    (c) => !c.description?.includes('[parent:toys]')
  )

  function openAdd() {
    setEditing(null)
    setFormName('')
    setFormImage(null)
    setShowModal(true)
  }

  function openEdit(cat: Category) {
    setEditing(cat)
    setFormName(cat.name)
    setFormImage(cat.image)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditing(null)
    setFormName('')
    setFormImage(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); return }
    setUploading(true)
    const result = await uploadFile(file, 'categories')
    setUploading(false)
    if ('error' in result) { toast.error(result.error); return }
    setFormImage(result.url)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) { toast.error('Category name is required'); return }

    startTransition(async () => {
      const fd = new FormData()
      fd.set('name', formName.trim())
      if (formImage) fd.set('image', formImage)
      fd.set('status', 'active')

      const result = editing
        ? await updateCategory(editing.id, fd)
        : await createCategory(fd)

      if (result?.error) { toast.error(result.error); return }
      toast.success(editing ? 'Category updated!' : 'Category created!')
      closeModal()
      window.location.reload()
    })
  }

  async function handleDelete(cat: Category) {
    if (!confirm(`Delete "${cat.name}"?\n\nAre you sure you want to delete this category? This cannot be undone.`)) return
    const result = await deleteCategory(cat.id)
    if (result?.error) { toast.error(result.error); return }
    toast.success('Category deleted')
    setCategories(prev => prev.filter(c => c.id !== cat.id))
  }

  async function handleToggle(cat: Category) {
    const result = await toggleCategoryStatus(cat.id, cat.status)
    if (result?.error) { toast.error(result.error); return }
    toast.success('Status updated')
    setCategories(prev =>
      prev.map(c =>
        c.id === cat.id
          ? { ...c, status: c.status === 'active' ? 'inactive' : 'active' }
          : c
      )
    )
  }

  return (
    <div className="animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">Categories</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            Create and manage the categories customers use to browse your catalogue.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/categories/toys"
            className="flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-[#FF2E63] border border-pink-200 text-sm font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer"
          >
            <Layers size={16} />
            <span>Manage Toys (3-Level)</span>
          </Link>
          <button
            onClick={openAdd}
            className="flex items-center gap-2 bg-[#E52D68] hover:bg-[#D4225A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all duration-200 hover:scale-[1.02] shadow-sm cursor-pointer"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add category</span>
          </button>
        </div>
      </div>

      {/* Category Cards Grid */}
      {topLevelCategories.length === 0 ? (
        <div className="text-center py-24 bg-white border border-[#ECE8EA] rounded-2xl">
          <Package size={48} className="mx-auto mb-4 text-[#ECE8EA]" strokeWidth={1.5} />
          <h3 className="text-lg font-semibold text-[#202124] mb-1">No categories yet</h3>
          <p className="text-sm text-[#8A8A8A] mb-6">Create your first category to start organizing products.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#E52D68] hover:bg-[#D4225A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm"
          >
            <Plus size={16} /> Add category
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {topLevelCategories.map(cat => (
            <div
              key={cat.id}
              className="bg-white border border-[#ECE8EA] rounded-2xl overflow-hidden shadow-[0_2px_10px_-4px_rgba(0,0,0,0.03)] hover:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.08)] transition-all duration-200 group"
            >
              {/* Category Image */}
              <div className="relative h-40 bg-[#FAF9FA] overflow-hidden">
                {cat.image ? (
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Package size={40} className="text-[#ECE8EA]" />
                  </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold backdrop-blur-sm ${
                      cat.status === 'active'
                        ? 'bg-green-500/90 text-white'
                        : 'bg-gray-500/80 text-white'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${cat.status === 'active' ? 'bg-green-200' : 'bg-gray-300'}`} />
                    {cat.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[15px] font-bold text-[#202124] truncate pr-2">{cat.name}</h3>
                </div>

                {/* Actions Row */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* Toggle */}
                    <label className="relative inline-flex items-center cursor-pointer" title={cat.status === 'active' ? 'Deactivate' : 'Activate'}>
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={cat.status === 'active'}
                        onChange={() => handleToggle(cat)}
                      />
                      <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2E7D32]" />
                    </label>

                    {/* Edit */}
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#202124] hover:bg-[#FAF9FA] transition-all"
                      title="Edit"
                    >
                      <Pencil size={15} />
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(cat)}
                      className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#E52D68] hover:bg-red-50 transition-all"
                      title="Delete"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  {/* Manage Clothing Button — ONLY for Clothing */}
                  {isClothing(cat) && (
                    <Link
                      href="/admin/categories/clothing"
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#E52D68] bg-[#FCE8EF] px-3 py-1.5 rounded-lg hover:bg-[#F8D2DF] transition-colors"
                    >
                      <Settings2 size={13} />
                      Manage
                    </Link>
                  )}

                  {/* Manage Toys Button — ONLY for Toys */}
                  {isToys(cat) && (
                    <Link
                      href="/admin/categories/toys"
                      className="flex items-center gap-1.5 text-[12px] font-semibold text-[#FF2E63] bg-pink-50 px-3 py-1.5 rounded-lg hover:bg-pink-100 transition-colors border border-pink-200"
                    >
                      <Layers size={13} />
                      Manage Subcategories
                    </Link>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ───── ADD / EDIT CATEGORY MODAL ───── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold text-[#202124]">
                {editing ? 'Edit Category' : 'Add Category'}
              </h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#202124] hover:bg-[#FAF9FA] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
              {/* Image Upload */}
              <div>
                <label className="block text-[13px] font-semibold text-[#202124] mb-2">Category Image</label>
                {formImage ? (
                  <div className="relative h-44 rounded-xl overflow-hidden border border-[#ECE8EA] group">
                    <Image src={formImage} alt="Preview" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => setFormImage(null)}
                      className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center h-44 border-2 border-dashed border-[#ECE8EA] hover:border-[#E52D68]/40 rounded-xl cursor-pointer transition-colors bg-[#FAF9FA] hover:bg-white group">
                    {uploading ? (
                      <Loader2 size={24} className="animate-spin text-[#E52D68]" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-full bg-white border border-[#ECE8EA] flex items-center justify-center text-[#E52D68] mb-2 group-hover:border-[#E52D68]/30 transition-colors">
                          <Plus size={20} />
                        </div>
                        <span className="text-sm font-medium text-[#202124]">Upload image</span>
                        <span className="text-xs text-[#8A8A8A] mt-0.5">JPG, PNG or WebP</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                )}
              </div>

              {/* Category Name */}
              <div>
                <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">Category Name</label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="Enter category name"
                  className="w-full px-4 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white placeholder-[#8A8A8A]"
                  autoFocus
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={pending}
                  className="px-5 py-2.5 text-sm font-medium text-[#202124] bg-white border border-[#ECE8EA] rounded-xl hover:bg-[#FAF9FA] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || uploading}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#E52D68] hover:bg-[#D4225A] rounded-xl transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {pending && <Loader2 size={14} className="animate-spin" />}
                  {editing ? 'Save Category' : 'Save Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}