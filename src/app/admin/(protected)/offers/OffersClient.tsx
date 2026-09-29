'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { toast } from 'sonner'
import { Plus, Pencil, Tag, Calendar, ChevronUp, ChevronDown, ExternalLink } from 'lucide-react'
import { OfferBanner } from '@/types/database.types'
import {
  createOfferBanner,
  updateOfferBanner,
  deleteOfferBanner,
  toggleOfferBannerStatus,
  reorderOfferBanners,
} from '@/lib/actions/offers'
import { uploadFile, validateImageFile } from '@/lib/upload'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface Props {
  initialOffers: OfferBanner[]
}

export default function OffersClient({ initialOffers }: Props) {
  const [offers, setOffers] = useState<OfferBanner[]>(initialOffers)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<OfferBanner | null>(null)

  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [mobileImageUrl, setMobileImageUrl] = useState<string | null>(null)
  const [isActive, setIsActive] = useState(true)

  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingMobile, setUploadingMobile] = useState(false)
  const [pending, startTransition] = useTransition()

  function openAdd() {
    setEditing(null)
    setTitle('')
    setSubtitle('')
    setImageUrl(null)
    setMobileImageUrl(null)
    setIsActive(true)
    setShowForm(true)
  }

  function openEdit(offer: OfferBanner) {
    setEditing(offer)
    setTitle(offer.title)
    setSubtitle(offer.subtitle || '')
    setImageUrl(offer.image)
    setMobileImageUrl(offer.mobile_image || null)
    setIsActive(offer.status === 'active')
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>, isMobile = false) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }

    if (isMobile) setUploadingMobile(true)
    else setUploadingImage(true)

    const result = await uploadFile(file, 'banners')

    if (isMobile) setUploadingMobile(false)
    else setUploadingImage(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    if (isMobile) {
      setMobileImageUrl(result.url)
      toast.success('Mobile banner image uploaded!')
    } else {
      setImageUrl(result.url)
      toast.success('Main banner image uploaded!')
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl && !editing) {
      toast.error('Please upload a banner image')
      return
    }
    if (!title.trim()) {
      toast.error('Offer banner title is required')
      return
    }

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        badge_text: editing?.badge_text || 'FAMILY CRAFTED',
        image: imageUrl || editing?.image || '',
        mobile_image: mobileImageUrl || null,
        button_text: editing?.button_text || 'Shop Collection',
        button_link: editing?.button_link || '/categories',
        start_date: editing?.start_date || null,
        end_date: editing?.end_date || null,
        status: isActive ? 'active' : 'inactive',
        display_order: editing?.display_order || 1,
      }

      const result = editing
        ? await updateOfferBanner(editing.id, payload)
        : await createOfferBanner(payload)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(editing ? 'Offer banner updated!' : 'Offer banner created!')
      closeForm()
      window.location.reload()
    })
  }

  async function handleToggle(id: string, status: string) {
    const result = await toggleOfferBannerStatus(id, status)
    if (result?.error) toast.error(result.error)
    else window.location.reload()
  }

  async function handleDelete(id: string) {
    const result = await deleteOfferBanner(id)
    if (result?.error) toast.error(result.error)
    else {
      toast.success('Offer banner deleted')
      window.location.reload()
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const newList = [...offers]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newList.length) return
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    setOffers(newList)
    await reorderOfferBanners(newList.map((o) => o.id))
  }

  const activeOffer = offers.find((o) => o.status === 'active') || offers[0]

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Offer & Promotional Banners</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage promotional callouts, seasonal discounts, and featured brand highlights on the storefront.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add Offer Banner
        </button>
      </div>

      {/* Live Storefront Mockup Preview */}
      {activeOffer && (
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

          <div className="relative w-full h-56 sm:h-64 rounded-xl overflow-hidden shadow-xs">
            <Image
              src={activeOffer.image}
              alt={activeOffer.title}
              fill
              className="object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
            <div className="absolute inset-0 z-10 flex flex-col justify-center px-6 sm:px-10 max-w-lg">
              {activeOffer.badge_text && (
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#FFCCD7] mb-1.5 bg-white/15 px-3 py-0.5 rounded-full w-fit">
                  {activeOffer.badge_text}
                </span>
              )}
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                {activeOffer.title}
              </h2>
              {activeOffer.subtitle && (
                <p className="text-xs text-white/90 mt-2 line-clamp-2 max-w-md">
                  {activeOffer.subtitle}
                </p>
              )}
              <div className="mt-4">
                <span className="inline-block bg-[#F40436] text-white text-xs font-semibold px-5 py-2 rounded-full shadow-sm">
                  {activeOffer.button_text || 'Shop Collection'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* List of Offers */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">Configured Offer Banners</h2>
          <span className="text-xs font-medium text-gray-500">{offers.length} total</span>
        </div>

        {offers.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <Tag size={36} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm">No offer banners created yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {offers.map((offer, idx) => (
              <div key={offer.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  {/* Reordering Controls */}
                  <div className="flex flex-col gap-1 text-gray-400">
                    <button
                      onClick={() => handleMove(idx, 'up')}
                      disabled={idx === 0}
                      className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronUp size={16} />
                    </button>
                    <button
                      onClick={() => handleMove(idx, 'down')}
                      disabled={idx === offers.length - 1}
                      className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Image Thumbnail */}
                  <div className="relative w-24 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                    <Image src={offer.image} alt={offer.title} fill className="object-cover" />
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-900">{offer.title}</h3>
                      {offer.badge_text && (
                        <span className="text-[10px] bg-red-50 text-[#F40436] font-semibold px-2 py-0.5 rounded-full border border-red-100">
                          {offer.badge_text}
                        </span>
                      )}
                    </div>
                    {offer.subtitle && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-md">{offer.subtitle}</p>
                    )}
                    <div className="flex items-center gap-3 text-[11px] text-gray-400 mt-1.5">
                      <span>CTA: {offer.button_text} ({offer.button_link})</span>
                      {(offer.start_date || offer.end_date) && (
                        <span className="flex items-center gap-1 text-purple-600">
                          <Calendar size={12} /> Scheduled
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <ToggleSwitch
                    checked={offer.status === 'active'}
                    onChange={() => handleToggle(offer.id, offer.status)}
                  />
                  <button
                    onClick={() => openEdit(offer)}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <ConfirmDelete
                    itemName="this offer banner"
                    onConfirm={() => handleDelete(offer.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl p-6 my-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Edit Offer Banner' : 'Add New Offer Banner'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Banner Heading / Title
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Little Things. Big Smiles."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436] focus:ring-1 focus:ring-[#F40436]"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Subtitle / Tagline
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Discover our latest baby essentials — crafted from unbleached cotton..."
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436] focus:ring-1 focus:ring-[#F40436]"
                />
              </div>

              {/* Image Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Desktop Banner Image *
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, false)}
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
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Mobile Banner Image (Optional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, true)}
                    className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Recommended size: 1080 × 1350 px</p>
                  {uploadingMobile && <p className="text-xs text-purple-600 mt-1">Uploading...</p>}
                  {mobileImageUrl && (
                    <div className="relative w-full h-24 rounded-lg overflow-hidden border border-gray-200 mt-2">
                      <Image src={mobileImageUrl} alt="Mobile Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>

              {/* Banner Status */}
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-200/80">
                <div>
                  <span className="block text-xs font-semibold text-gray-700">Banner Status</span>
                  <span className="block text-[11px] text-gray-500 mt-0.5">
                    {isActive ? 'Active — Banner will show on website' : 'Inactive — Banner hidden from website'}
                  </span>
                </div>
                <ToggleSwitch checked={isActive} onChange={() => setIsActive(!isActive)} />
              </div>

              {/* Form Buttons */}
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
