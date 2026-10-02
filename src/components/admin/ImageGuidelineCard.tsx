'use client'

import { Info, CheckCircle2, Sparkles, AlertCircle, Image as ImageIcon, Video, HelpCircle, Crop } from 'lucide-react'

export type ImageGuidelineType =
  | 'category'
  | 'product'
  | 'product_gallery'
  | 'hero_desktop'
  | 'hero_mobile'
  | 'offer_banner'
  | 'category_thumbnail'
  | 'photo'
  | 'reel'

export interface GuidelineConfig {
  title: string
  recommendedSize: string
  aspectRatio: string
  format: string
  maxSize: string
  safeAreaNote?: string
  tips: string[]
  badgeColor?: string
}

export const IMAGE_GUIDELINES: Record<ImageGuidelineType, GuidelineConfig> = {
  category: {
    title: 'Category Image',
    recommendedSize: '800 × 800 px',
    aspectRatio: '1:1 (Square)',
    format: 'JPG, PNG, WebP',
    maxSize: '5 MB',
    tips: [
      'Clean product or category image',
      'Centered subject with simple background',
      'Good lighting; avoid text-heavy images',
      'Keep the main subject inside the center safe area',
    ],
  },
  product: {
    title: 'Product Image',
    recommendedSize: '1200 × 1200 px',
    aspectRatio: '1:1 (Square)',
    format: 'JPG, PNG, WebP',
    maxSize: '5 MB per image',
    tips: [
      'Product clearly visible on clean/light background',
      'Centered subject with balanced whitespace',
      'High-resolution photography for zoom clarity',
      'Consistent lighting and style across catalog',
    ],
  },
  product_gallery: {
    title: 'Product Gallery Images',
    recommendedSize: '1200 × 1200 px',
    aspectRatio: '1:1 (Square)',
    format: 'JPG, PNG, WebP',
    maxSize: '5 MB per image',
    tips: [
      'Multi-angle views and detail closeups',
      'Maintain consistent square dimensions',
      'Show packaging or size reference where helpful',
    ],
  },
  hero_desktop: {
    title: 'Hero Banner — Desktop',
    recommendedSize: '1920 × 800 px',
    aspectRatio: '12:5 (Landscape)',
    format: 'JPG, WebP',
    maxSize: '5 MB',
    safeAreaNote: 'Keep critical subjects away from extreme edges for overlay text.',
    tips: [
      'Wide landscape composition',
      'Leave safe space on left/center for website headings',
      'Clean background composition with high clarity',
    ],
  },
  hero_mobile: {
    title: 'Hero Banner — Mobile',
    recommendedSize: '1080 × 1350 px',
    aspectRatio: '4:5 (Portrait)',
    format: 'JPG, WebP',
    maxSize: '5 MB',
    safeAreaNote: 'Centered mobile safe area for text overlays.',
    tips: [
      'Portrait layout optimized for phone screens',
      'Dedicated vertical composition (avoid simple cropping)',
      'High contrast and legible visuals',
    ],
  },
  offer_banner: {
    title: 'Offer / Promotional Banner',
    recommendedSize: '1600 × 600 px',
    aspectRatio: '8:3 (Wide Banner)',
    format: 'JPG, WebP',
    maxSize: '5 MB',
    tips: [
      'Eye-catching promotional graphic',
      'Clear visual hierarchy with uncluttered space for offer text',
      'High contrast colors aligned with Baby’s Bazaar palette',
    ],
  },
  category_thumbnail: {
    title: 'Category / Subcategory Thumbnail',
    recommendedSize: '800 × 800 px',
    aspectRatio: '1:1 (Square)',
    format: 'JPG, PNG, WebP',
    maxSize: '5 MB',
    tips: [
      'Square icon or thumbnail image',
      'Instantly recognizable category iconography',
      'High sharpness at small display sizes',
    ],
  },
  photo: {
    title: 'Store / Delivery / Event Photo',
    recommendedSize: '1600 × 1200 px',
    aspectRatio: '4:3 (Standard Photo)',
    format: 'JPG, WebP',
    maxSize: '5 MB',
    tips: [
      'Authentic customer deliveries and showroom moments',
      'Natural lighting and clear subject focus',
      'Landscape orientation for gallery presentation',
    ],
  },
  reel: {
    title: 'Reel / Short Video',
    recommendedSize: '1080 × 1920 px',
    aspectRatio: '9:16 (Vertical Fullscreen)',
    format: 'MP4 / Video URL',
    maxSize: '100 MB / Video URL',
    tips: [
      'Vertical 9:16 smartphone view',
      'Engaging 15–60s product demo or unboxing',
      'Center key actions within vertical safe margin',
    ],
  },
}

interface ImageGuidelineCardProps {
  type: ImageGuidelineType
  compact?: boolean
  className?: string
}

export default function ImageGuidelineCard({
  type,
  compact = false,
  className = '',
}: ImageGuidelineCardProps) {
  const guide = IMAGE_GUIDELINES[type]
  if (!guide) return null

  if (compact) {
    return (
      <div
        className={`bg-[#FBF9FA] border border-[#ECE8EA] rounded-xl p-3.5 text-xs text-[#555555] space-y-2 select-none ${className}`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-[#ECE8EA]/80 pb-2">
          <div className="flex items-center gap-1.5 font-semibold text-[#202124]">
            <Info size={14} className="text-[#E52D68] shrink-0" />
            <span>{guide.title} Guidelines</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-[#FCE8EF] text-[#E52D68] font-bold text-[10px] tracking-wide">
            {guide.recommendedSize}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[11px] text-[#666666]">
          <div>
            <span className="text-[#8A8A8A]">Ratio:</span> <strong className="text-[#202124]">{guide.aspectRatio}</strong>
          </div>
          <div>
            <span className="text-[#8A8A8A]">Max Size:</span> <strong className="text-[#202124]">{guide.maxSize}</strong>
          </div>
          <div className="col-span-2">
            <span className="text-[#8A8A8A]">Format:</span> <strong className="text-[#202124]">{guide.format}</strong>
          </div>
        </div>

        <ul className="space-y-1 pt-1 border-t border-[#ECE8EA]/60 text-[11px] text-[#666666]">
          {guide.tips.slice(0, 2).map((tip, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold leading-none mt-0.5">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div
      className={`bg-white border border-[#ECE8EA] rounded-2xl p-5 shadow-xs text-xs space-y-3.5 select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#ECE8EA]">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center font-bold">
            <ImageIcon size={14} />
          </div>
          <div>
            <h4 className="font-bold text-[#202124] text-xs uppercase tracking-wider">{guide.title}</h4>
            <p className="text-[11px] text-[#8A8A8A]">Recommended upload standards</p>
          </div>
        </div>
        <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-[#E52D68] font-bold text-xs border border-pink-100">
          {guide.recommendedSize}
        </span>
      </div>

      {/* Specs Grid */}
      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#FAF9FA] border border-[#ECE8EA]/70 text-[11px]">
        <div>
          <div className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Aspect Ratio</div>
          <div className="font-bold text-[#202124] mt-0.5">{guide.aspectRatio}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Formats</div>
          <div className="font-bold text-[#202124] mt-0.5">{guide.format}</div>
        </div>
        <div>
          <div className="text-[10px] text-[#8A8A8A] uppercase font-semibold">Max File</div>
          <div className="font-bold text-[#202124] mt-0.5">{guide.maxSize}</div>
        </div>
      </div>

      {/* Tips */}
      <div className="space-y-1.5 pt-1">
        <div className="text-[11px] font-semibold text-[#202124] flex items-center gap-1">
          <Sparkles size={13} className="text-[#E52D68]" />
          <span>Upload Recommendations:</span>
        </div>
        <ul className="space-y-1 pl-1 text-[11px] text-[#555555]">
          {guide.tips.map((tip, idx) => (
            <li key={idx} className="flex items-start gap-1.5">
              <span className="text-emerald-600 font-bold leading-none mt-0.5">✓</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {guide.safeAreaNote && (
        <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/60 text-[11px] text-amber-800 flex items-start gap-1.5">
          <AlertCircle size={14} className="text-amber-600 shrink-0 mt-0.5" />
          <span>{guide.safeAreaNote}</span>
        </div>
      )}
    </div>
  )
}
