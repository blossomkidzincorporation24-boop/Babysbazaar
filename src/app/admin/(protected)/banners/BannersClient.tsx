'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Plus, Pencil, Image as ImageIcon, ChevronUp, ChevronDown } from 'lucide-react'
import { Banner } from '@/types/database.types'
import {
  createBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus,
  reorderBanners,
} from '@/lib/actions/banners'
import { uploadFile, validateImageFile } from '@/lib/upload'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface Props {
  initialBanners: Banner[]
}

export default function BannersClient({ initialBanners }: Props) {
  const [banners, setBanners] = useState(initialBanners)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Banner | null>(null)

  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [mobileImageUrl, setMobileImageUrl] = useState<string | null>(null)
  const [heading, setHeading] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [isActive, setIsActive] = useState(true)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const [pending, startTransition] = useTransition()

  function openAdd() {
    setEditing(null)
    setImageUrl(null)
    setMobileImageUrl(null)
    setHeading('')
    setSubtitle('')
    setIsActive(true)
    setShowForm(true)
  }

  function openEdit(b: Banner) {
    setEditing(b)
    setImageUrl(b.image)
    setMobileImageUrl(b.mobile_image || null)
    setHeading(b.heading ?? '')
    setSubtitle(b.subtitle ?? '')
    setIsActive(b.status === 'active')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>, isMobile = false) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }

    if (isMobile) setUploadingMobile(true)
    else setUploadingImage(true)

    try {
      const result = await uploadFile(file, 'banners')

      if ('error' in result) {
        toast.error(result.error)
        return
      }

      if (isMobile) {
        setMobileImageUrl(result.url)
        toast.success('Mobile banner image uploaded')
      } else {
        setImageUrl(result.url)
        toast.success('Desktop banner image uploaded')
      }
    } catch (err: any) {
      toast.error(err?.message || 'Upload failed. Please try again.')
    } finally {
      if (isMobile) setUploadingMobile(false)
      else setUploadingImage(false)
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl && !editing) {
      toast.error('Please upload a desktop banner image')
      return
    }

    startTransition(async () => {
      const payload = {
        image: imageUrl || editing?.image || '',
        mobile_image: mobileImageUrl || null,
        heading: heading.trim() || null,
        subtitle: subtitle.trim() || null,
        status: isActive ? 'active' : 'inactive',
        display_order: editing?.display_order || 1,
      }

      const result = editing
        ? await updateBanner(editing.id, payload)
        : await createBanner(payload)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(editing ? 'Banner updated!' : 'Banner created!')
      closeForm()
      window.location.reload()
    })
  }

  async function handleToggle(id: string, status: string) {
    const result = await toggleBannerStatus(id, status)
    if (result?.error) toast.error(result.error)
    else window.location.reload()
  }

  async function handleDelete(id: string) {
    const result = await deleteBanner(id)
    if (result?.error) toast.error(result.error)
    else {
      toast.success('Banner deleted')
      window.location.reload()
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const newList = [...banners]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newList.length) return
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    setBanners(newList)
    await reorderBanners(newList.map((b) => b.id))
  }

  const activeBanner = banners.find((b) => b.status === 'active') || banners[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Hero Banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage full-width promotional sliders on the homepage with scheduling and responsive mobile images.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Hero Banner
        </button>
      </div>

      {/* Live Storefront Preview */}
      {activeBanner && (
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Storefront Preview
            </span>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full border border-emerald-200">
              Active Banner
            </span>
          </div>

          <div className="relative w-full h-56 sm:h-72 rounded-xl overflow-hidden shadow-xs bg-gray-100">
            <Image
              src={activeBanner.image}
              alt={activeBanner.heading ?? 'Banner'}
              fill
              className="object-cover"
            />
            {activeBanner.heading && (
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/25 to-transparent flex flex-col justify-center px-6 sm:px-12 max-w-lg">
                <p className="text-white text-xl sm:text-3xl font-extrabold drop-shadow-md leading-tight">
                  {activeBanner.heading}
                </p>
                {activeBanner.subtitle && (
                  <p className="text-white/90 text-xs sm:text-sm mt-2 line-clamp-2">
                    {activeBanner.subtitle}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* List */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Configured Hero Banners</h2>
          <span className="text-xs font-medium text-gray-500">{banners.length} total</span>
        </div>

        {banners.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <ImageIcon size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No hero banners created yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {banners.map((b, i) => (
              <div key={b.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Order controls */}
                  <div className="flex flex-col gap-1 text-gray-400">
                    <button
                      onClick={() => handleMove(i, 'up')}
                      disabled={i === 0}
                      className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(i, 'down')}
                      disabled={i === banners.length - 1}
                      className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="relative w-24 h-16 rounded-lg bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    <Image src={b.image} alt={b.heading ?? 'Banner'} fill className="object-cover" />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{i + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-900">{b.heading || 'Untitled Hero Slide'}</h3>
                    </div>
                    {b.subtitle && (
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 max-w-md">{b.subtitle}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                      {b.mobile_image && <span className="text-blue-600 font-medium">● Mobile image set</span>}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <ToggleSwitch
                    checked={b.status === 'active'}
                    onChange={() => handleToggle(b.id, b.status)}
                  />
                  <button
                    onClick={() => openEdit(b)}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <ConfirmDelete
                    itemName="this hero banner"
                    onConfirm={() => handleDelete(b.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Edit Hero Banner' : 'Add New Hero Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Heading */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Heading / Title
                </label>
                <input
                  value={heading}
                  onChange={(e) => setHeading(e.target.value)}
                  placeholder="e.g. Everything Your Little One Needs, All in One Place"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436]"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Discover adorable, quality products carefully selected for your little ones"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436]"
                />
              </div>

              {/* Image Uploads */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Desktop Banner Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, false)}
                    className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Recommended size: 1920 × 800 px</p>
                  {uploadingImage && <p className="text-xs text-purple-600 mt-1">Uploading...</p>}
                  {imageUrl && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 mt-2">
                      <Image src={imageUrl} alt="Desktop Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-gray-700">
                      Mobile Banner Image (Optional)
                    </label>
                    {mobileImageUrl && (
                      <button
                        type="button"
                        onClick={() => setMobileImageUrl(null)}
                        className="text-[11px] text-rose-500 hover:text-rose-700 hover:underline cursor-pointer"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileChange(e, true)}
                    className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Recommended size: 1080 × 1350 px</p>
                  {uploadingMobile && <p className="text-xs text-purple-600 font-medium animate-pulse mt-1">Uploading...</p>}
                  {mobileImageUrl && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 mt-2 bg-gray-50">
                      <Image src={mobileImageUrl} alt="Mobile Preview" fill className="object-contain" />
                    </div>
                  )}
                </div>
              </div>

              {/* Status Toggle */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                <div>
                  <span className="block text-xs font-semibold text-gray-700">Banner Status</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    {isActive ? 'Active — Banner will show on website' : 'Inactive — Banner hidden from website'}
                  </span>
                </div>
                <ToggleSwitch checked={isActive} onChange={() => setIsActive(!isActive)} />
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending || uploadingImage || uploadingMobile}
                  className="bg-[#F40436] hover:bg-[#D9032F] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {pending ? 'Saving...' : editing ? 'Save Changes' : 'Create Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
