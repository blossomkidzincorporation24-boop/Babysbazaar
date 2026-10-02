'use client'

import { useState } from 'react'
import Image from 'next/image'
import { uploadFile, validateImageFile } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import ImageGuidelineCard, { type ImageGuidelineType } from './ImageGuidelineCard'
import ImageMetadataPreview from './ImageMetadataPreview'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket: 'products' | 'categories' | 'photos' | 'banners' | 'settings'
  label?: string
  guidelineType?: ImageGuidelineType
  showGuidelineCard?: boolean
  className?: string
}

export default function ImageUpload({
  value,
  onChange,
  bucket,
  label = 'Upload image',
  guidelineType,
  showGuidelineCard = true,
  className,
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

  // Map bucket to default guideline type if not explicitly supplied
  const effectiveGuideline: ImageGuidelineType | undefined =
    guidelineType ||
    (bucket === 'products'
      ? 'product'
      : bucket === 'categories'
      ? 'category'
      : bucket === 'banners'
      ? 'hero_desktop'
      : bucket === 'photos'
      ? 'photo'
      : undefined)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setUploading(true)
    const result = await uploadFile(file, bucket)
    setUploading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    onChange(result.url)
    toast.success('Image uploaded successfully')
  }

  return (
    <div className={cn('w-full space-y-3', className)}>
      {value ? (
        <ImageMetadataPreview
          url={value}
          aspectRatioClass="h-48"
          onRemove={() => onChange(null)}
        />
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-[#ECE8EA] rounded-xl cursor-pointer hover:border-[#E52D68]/40 hover:bg-[#FAF9FA] transition-colors group bg-[#FAF9FA]/40">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Loader2 size={28} className="animate-spin text-[#E52D68]" />
              <span className="text-sm font-medium text-gray-600">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-1.5 text-gray-400">
              <div className="w-10 h-10 rounded-full bg-white border border-[#ECE8EA] flex items-center justify-center text-[#E52D68] mb-1 group-hover:border-[#E52D68]/30 transition-colors">
                <ImageIcon size={20} />
              </div>
              <span className="text-sm font-semibold text-[#202124]">{label}</span>
              <span className="text-xs text-[#8A8A8A]">Click or drag JPG, PNG, WebP (Max 5 MB)</span>
            </div>
          )}
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleChange}
            disabled={uploading}
            className="hidden"
          />
        </label>
      )}

      {showGuidelineCard && effectiveGuideline && (
        <ImageGuidelineCard type={effectiveGuideline} compact />
      )}
    </div>
  )
}
