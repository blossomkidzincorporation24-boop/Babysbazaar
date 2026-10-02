import React from 'react'
import Link from 'next/link'
import {
  ImageIcon,
  ArrowLeft,
  Package,
  Truck,
  Sparkles,
  Camera,
  Film,
  Tag,
  CheckCircle2,
  Info,
  Layers,
  FileImage,
} from 'lucide-react'
import ImageGuidelineCard, { IMAGE_GUIDELINES } from '@/components/admin/ImageGuidelineCard'

export const dynamic = 'force-dynamic'

export default function ImageGuidelinesPage() {
  const guidelineKeys = [
    { key: 'category', icon: Truck, label: 'Category & Catalog' },
    { key: 'product', icon: Package, label: 'Product Primary Image' },
    { key: 'product_gallery', icon: Layers, label: 'Product Gallery / Additional Photos' },
    { key: 'hero_desktop', icon: ImageIcon, label: 'Hero Banner — Desktop' },
    { key: 'hero_mobile', icon: ImageIcon, label: 'Hero Banner — Mobile' },
    { key: 'offer_banner', icon: Tag, label: 'Offer / Promo Banner' },
    { key: 'category_thumbnail', icon: FileImage, label: 'Category / Subcategory Thumbnail' },
    { key: 'photo', icon: Camera, label: 'Store / Delivery / Event Photo' },
    { key: 'reel', icon: Film, label: 'Reel / Video Demonstration' },
  ] as const

  return (
    <div className="space-y-8 pb-16 font-sans animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#ECE8EA] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link
              href="/admin/settings"
              className="text-xs font-semibold text-[#8A8A8A] hover:text-[#202124] transition-colors flex items-center gap-1.5 mb-3"
            >
              <ArrowLeft size={14} />
              <span>Back to Settings</span>
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center font-bold">
                <ImageIcon size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-[#202124] tracking-tight">
                  Admin Image Size & Upload Guide
                </h1>
                <p className="text-sm text-[#8A8A8A] mt-0.5">
                  Official specifications, recommended dimensions, aspect ratios, and format guidelines for Baby’s Bazaar.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Overview Badges */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#ECE8EA]">
          <div className="p-4 rounded-xl bg-[#FAF9FA] border border-[#ECE8EA] space-y-1">
            <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Common Formats</span>
            <div className="text-sm font-bold text-[#202124]">JPG, PNG, WebP</div>
            <p className="text-[11px] text-[#8A8A8A]">WebP is highly recommended for faster loading</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9FA] border border-[#ECE8EA] space-y-1">
            <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Maximum File Size</span>
            <div className="text-sm font-bold text-[#E52D68]">5 MB (Images) / 1 GB (Reels)</div>
            <p className="text-[11px] text-[#8A8A8A]">Up to 1 GB (1024 MB) for uploaded video reels</p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAF9FA] border border-[#ECE8EA] space-y-1">
            <span className="text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">Standard Ratio</span>
            <div className="text-sm font-bold text-[#202124]">1:1 (Square) for Products</div>
            <p className="text-[11px] text-[#8A8A8A]">Ensures uniform layout across shop catalog</p>
          </div>
        </div>
      </div>

      {/* Quick Reference Summary Table */}
      <div className="bg-white rounded-2xl border border-[#ECE8EA] shadow-xs overflow-hidden">
        <div className="p-6 border-b border-[#ECE8EA]">
          <h3 className="font-bold text-base text-[#202124]">Image Specifications Summary</h3>
          <p className="text-xs text-[#8A8A8A] mt-0.5">Quick lookup table for designers and catalog managers</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FA] text-[#666666] font-semibold border-b border-[#ECE8EA]">
              <tr>
                <th className="py-3.5 px-6">SECTION / ASSET</th>
                <th className="py-3.5 px-4">RECOMMENDED RESOLUTION</th>
                <th className="py-3.5 px-4 text-center">ASPECT RATIO</th>
                <th className="py-3.5 px-4 text-center">FORMATS</th>
                <th className="py-3.5 px-4 text-center">MAX FILE SIZE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECE8EA] text-[#444444]">
              {guidelineKeys.map(({ key, icon: Icon, label }) => {
                const spec = IMAGE_GUIDELINES[key]
                return (
                  <tr key={key} className="hover:bg-[#FAF9FA]/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center shrink-0">
                          <Icon size={16} />
                        </div>
                        <div>
                          <div className="font-semibold text-[#202124]">{label}</div>
                          <div className="text-[10px] text-[#8A8A8A]">{spec.tips[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4 font-mono font-bold text-[#E52D68] text-xs">
                      {spec.recommendedSize}
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-800 font-medium text-[11px]">
                        {spec.aspectRatio}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-medium text-neutral-600">
                      {spec.format}
                    </td>
                    <td className="py-4 px-4 text-center font-semibold text-neutral-900">
                      {spec.maxSize}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Cards Grid */}
      <div className="space-y-4">
        <h3 className="font-bold text-lg text-[#202124]">Detailed Guidelines by Section</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {guidelineKeys.map(({ key }) => (
            <ImageGuidelineCard key={key} type={key} />
          ))}
        </div>
      </div>
    </div>
  )
}
