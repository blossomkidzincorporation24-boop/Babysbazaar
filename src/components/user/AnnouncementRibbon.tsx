'use client'

import { DeliveryFeature } from '@/types/database.types'
import { MessageCircle, Truck, Gift, Heart, Package, Globe, ShieldCheck, Sparkles } from 'lucide-react'

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

function renderRibbonIcon(iconStr: string) {
  if (!iconStr) return null
  const IconComponent = ICON_MAP[iconStr]
  if (IconComponent) {
    return <IconComponent size={16} className="inline-block" />
  }
  return <span>{iconStr}</span>
}

interface AnnouncementRibbonProps {
  items?: DeliveryFeature[]
}

const DEFAULT_PERKS = [
  { emoji: '✨', text: 'Free Shipping on Orders above ₹3500' },
  { emoji: '📦', text: 'Same day shipping for orders before 5 PM' },
  { emoji: '🚚', text: 'Shipping across INDIA' },
  { emoji: '🌍', text: 'For international and wholesale orders DM us' },
]

export default function AnnouncementRibbon({ items }: AnnouncementRibbonProps) {
  const displayItems =
    items && items.length > 0
      ? items.map((i) => ({ emoji: i.icon || '✨', text: i.title }))
      : DEFAULT_PERKS

  // Ensure enough items to smoothly animate marquee
  const loopedItems = [...displayItems, ...displayItems, ...displayItems]

  return (
    <section className="w-full bg-[#FBE6ED] border-y border-[#FEF3C7] py-3.5 overflow-hidden select-none">
      <div className="flex items-center gap-8 sm:gap-14 animate-marquee whitespace-nowrap text-xs sm:text-sm font-bold text-[#1F2937] font-roboto-slab tracking-wide">
        {loopedItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2.5 shrink-0">
            <span className="text-base flex items-center justify-center">{renderRibbonIcon(item.emoji)}</span>
            <span>{item.text}</span>
            <span className="text-gray-300 ml-6 sm:ml-10">•</span>
          </div>
        ))}
      </div>
    </section>
  )
}
