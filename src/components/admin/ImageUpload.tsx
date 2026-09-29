'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { uploadFile, validateImageFile } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { ImageIcon, X, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ImageUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  bucket: 'products' | 'categories' | 'photos' | 'banners' | 'settings'
  label?: string
  className?: string
}

export default function ImageUpload({ value, onChange, bucket, label = 'Upload image', className }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)

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
    <div className={cn('w-full', className)}>
      {value ? (
        <div className="relative w-full h-48 rounded-xl overflow-hidden border border-gray-200 group">
          <Image src={value} alt="Uploaded" fill className="object-cover" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
          {uploading ? (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Loader2 size={28} className="animate-spin text-purple-500" />
              <span className="text-sm">Uploading…</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <ImageIcon size={28} />
              <span className="text-sm font-medium text-gray-600">{label}</span>
              <span className="text-xs text-gray-400">Tap to select a file</span>
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
    </div>
  )
}
