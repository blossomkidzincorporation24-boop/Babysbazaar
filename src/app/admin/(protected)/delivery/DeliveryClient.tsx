'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Plus, Pencil, Sparkles, ShieldCheck, ChevronUp, ChevronDown, MessageCircle, Truck, Gift, Heart, Package, Globe } from 'lucide-react'
import { DeliveryFeature } from '@/types/database.types'
import {
  createDeliveryFeature,
  updateDeliveryFeature,
  deleteDeliveryFeature,
  toggleDeliveryFeatureStatus,
  reorderDeliveryFeatures,
} from '@/lib/actions/delivery'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface Props {
  initialFeatures: DeliveryFeature[]
}

const COMMON_EMOJIS = ['✨', '📦', '🚚', '🌍', '⚡', '🎁', '🛡️', '💬', '❤️', '👶']
const COMMON_ICONS = ['MessageCircle', 'Truck', 'Gift', 'Heart', 'Package', 'Globe', 'ShieldCheck']

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  MessageCircle,
  Truck,
  Gift,
  Heart,
  Package,
  Globe,
  ShieldCheck,
  Sparkles,
}

function renderIcon(iconStr: string, size = 20, className = '') {
  if (!iconStr) return null
  const IconComponent = ICON_MAP[iconStr]
  if (IconComponent) {
    return <IconComponent size={size} className={className} />
  }
  return <span className={className}>{iconStr}</span>
}

export default function DeliveryClient({ initialFeatures }: Props) {
  const [features, setFeatures] = useState<DeliveryFeature[]>(initialFeatures)
  const [tab, setTab] = useState<'ribbon' | 'trust_badge'>('ribbon')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<DeliveryFeature | null>(null)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [icon, setIcon] = useState('✨')
  const [badgeType, setBadgeType] = useState<'ribbon' | 'trust_badge'>('ribbon')

  const [pending, startTransition] = useTransition()

  function openAdd(type: 'ribbon' | 'trust_badge') {
    setEditing(null)
    setBadgeType(type)
    setTitle('')
    setDescription('')
    setIcon(type === 'ribbon' ? '✨' : 'MessageCircle')
    setShowForm(true)
  }

  function openEdit(feat: DeliveryFeature) {
    setEditing(feat)
    setBadgeType(feat.badge_type)
    setTitle(feat.title)
    setDescription(feat.description || '')
    setIcon(feat.icon)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('Title is required')
      return
    }

    startTransition(async () => {
      const payload = {
        title: title.trim(),
        description: description.trim() || null,
        icon: icon.trim() || '✨',
        badge_type: badgeType,
        status: editing?.status || 'active',
        display_order: editing?.display_order || 1,
      }

      const result = editing
        ? await updateDeliveryFeature(editing.id, payload)
        : await createDeliveryFeature(payload)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(editing ? 'Feature updated!' : 'Feature added!')
      closeForm()
      window.location.reload()
    })
  }

  async function handleToggle(id: string, status: string) {
    const result = await toggleDeliveryFeatureStatus(id, status)
    if (result?.error) toast.error(result.error)
    else window.location.reload()
  }

  async function handleDelete(id: string) {
    const result = await deleteDeliveryFeature(id)
    if (result?.error) toast.error(result.error)
    else {
      toast.success('Feature removed')
      window.location.reload()
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const currentList = features.filter((f) => f.badge_type === tab)
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= currentList.length) return

    const reordered = [...currentList]
    ;[reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]]

    // Update in local state
    const otherList = features.filter((f) => f.badge_type !== tab)
    setFeatures([...otherList, ...reordered])

    await reorderDeliveryFeatures(reordered.map((f) => f.id))
  }

  const ribbonItems = features.filter((f) => f.badge_type === 'ribbon')
  const trustBadges = features.filter((f) => f.badge_type === 'trust_badge')
  const displayItems = tab === 'ribbon' ? ribbonItems : trustBadges

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery & Trust Highlights</h1>
          <p className="text-sm text-gray-500 mt-1">
            Control the announcement ticker ribbon and trust badges displayed across the customer storefront.
          </p>
        </div>
        <button
          onClick={() => openAdd(tab)}
          className="flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Plus size={16} /> Add {tab === 'ribbon' ? 'Ticker Item' : 'Trust Badge'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200">
        <button
          onClick={() => setTab('ribbon')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            tab === 'ribbon'
              ? 'border-[#F40436] text-[#F40436]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <Sparkles size={16} /> Shipping & Perks Ribbon ({ribbonItems.length})
        </button>
        <button
          onClick={() => setTab('trust_badge')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
            tab === 'trust_badge'
              ? 'border-[#F40436] text-[#F40436]'
              : 'border-transparent text-gray-500 hover:text-gray-800'
          }`}
        >
          <ShieldCheck size={16} /> Trust & Service Badges ({trustBadges.length})
        </button>
      </div>

      {/* Live Ribbon Preview */}
      {tab === 'ribbon' && (
        <div className="bg-[#FBE6ED] border border-[#FEF3C7] rounded-xl p-4 overflow-hidden">
          <p className="text-[11px] font-bold text-[#E1144B] uppercase tracking-wider mb-2">
            Storefront Ticker Ribbon Preview:
          </p>
          <div className="flex items-center gap-6 overflow-x-auto text-xs font-semibold text-gray-800 font-sans py-1">
            {ribbonItems
              .filter((i) => i.status === 'active')
              .map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <span className="text-sm">{renderIcon(item.icon, 16)}</span>
                  <span>{item.title}</span>
                  <span className="text-gray-400 ml-4">•</span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Live Trust Badges Preview */}
      {tab === 'trust_badge' && (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-3">
            Storefront Trust Badges Preview:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trustBadges
              .filter((i) => i.status === 'active')
              .map((badge, idx) => (
                <div key={idx} className="bg-white rounded-lg p-3.5 border border-gray-200/80 shadow-2xs flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-50 text-[#F40436] flex items-center justify-center font-bold shrink-0">
                    {renderIcon(badge.icon, 20, 'text-[#F40436]')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-gray-900">{badge.title}</h4>
                    {badge.description && (
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">{badge.description}</p>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Feature List Table */}
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-800">
            {tab === 'ribbon' ? 'Ticker Announcement Items' : 'Trust & Service Badges'}
          </h2>
          <span className="text-xs font-medium text-gray-500">{displayItems.length} items</span>
        </div>

        {displayItems.length === 0 ? (
          <div className="py-12 text-center text-gray-400">
            <p className="text-sm">No items configured yet for this section</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {displayItems.map((item, idx) => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-gray-50/50 transition-colors"
              >
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
                      disabled={idx === displayItems.length - 1}
                      className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                    >
                      <ChevronDown size={16} />
                    </button>
                  </div>

                  {/* Icon / Emoji badge */}
                  <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-xl shrink-0 font-medium text-gray-700 overflow-hidden">
                    {renderIcon(item.icon, 22, 'text-[#E1144B]')}
                  </div>

                  {/* Details */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
                      <h3 className="text-sm font-semibold text-gray-900">{item.title}</h3>
                    </div>
                    {item.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{item.description}</p>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 self-end sm:self-center">
                  <ToggleSwitch
                    checked={item.status === 'active'}
                    onChange={() => handleToggle(item.id, item.status)}
                  />
                  <button
                    onClick={() => openEdit(item)}
                    className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                    title="Edit"
                  >
                    <Pencil size={16} />
                  </button>
                  <ConfirmDelete
                    itemName="this feature"
                    onConfirm={() => handleDelete(item.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Edit Feature' : `Add ${badgeType === 'ribbon' ? 'Ticker Item' : 'Trust Badge'}`}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Type selector */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Feature Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setBadgeType('ribbon')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      badgeType === 'ribbon'
                        ? 'bg-red-50 border-[#F40436] text-[#F40436]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Ticker Ribbon Item
                  </button>
                  <button
                    type="button"
                    onClick={() => setBadgeType('trust_badge')}
                    className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                      badgeType === 'trust_badge'
                        ? 'bg-red-50 border-[#F40436] text-[#F40436]'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Trust Service Badge
                  </button>
                </div>
              </div>

              {/* Icon / Emoji Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Icon or Emoji *
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="✨ or MessageCircle"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#F40436]"
                  required
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(badgeType === 'ribbon' ? COMMON_EMOJIS : COMMON_ICONS).map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => setIcon(item)}
                      className={`px-2.5 py-1 text-xs rounded-md transition-colors flex items-center gap-1.5 cursor-pointer border ${
                        icon === item
                          ? 'bg-[#F40436]/10 border-[#F40436] text-[#F40436] font-semibold'
                          : 'bg-gray-100 hover:bg-gray-200 border-transparent text-gray-700'
                      }`}
                    >
                      {renderIcon(item, 14)}
                      <span>{item}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Title / Announcement Text *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Free Shipping on Orders above ₹3500"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436]"
                  required
                />
              </div>

              {/* Description (for Trust badges) */}
              {badgeType === 'trust_badge' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Description Subtext
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="e.g. Instant size advice, photos & real-time care"
                    className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436]"
                  />
                </div>
              )}

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeForm}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="bg-[#F40436] hover:bg-[#D9032F] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {pending ? 'Saving...' : editing ? 'Save Changes' : 'Add Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
