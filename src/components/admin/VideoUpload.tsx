'use client'

import { useState } from 'react'
import { uploadFile, validateVideoFile } from '@/lib/upload'
import { cn } from '@/lib/utils'
import { Video, X, Loader2, CheckCircle } from 'lucide-react'
import { toast } from 'sonner'

interface VideoUploadProps {
  value: string | null
  onChange: (url: string | null) => void
  label?: string
  className?: string
}

export default function VideoUpload({ value, onChange, label = 'Choose reel video', className }: VideoUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateVideoFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setUploading(true)
    const result = await uploadFile(file, 'reels')
    setUploading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setFileName(file.name)
    onChange(result.url)
    toast.success('Video uploaded successfully')
  }

  return (
    <div className={cn('w-full', className)}>
      <label className={cn(
        'flex items-center gap-3 w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors',
        value ? 'border-green-300 bg-green-50' : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50'
      )}>
        {uploading ? (
          <>
            <Loader2 size={22} className="animate-spin text-purple-500 shrink-0" />
            <span className="text-sm text-gray-500">Uploading video…</span>
          </>
        ) : value ? (
          <>
            <CheckCircle size={22} className="text-green-500 shrink-0" />
            <span className="text-sm text-gray-700 truncate">{fileName || 'Video uploaded'}</span>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(null); setFileName(null) }}
              className="ml-auto text-red-400 hover:text-red-600"
            >
              <X size={16} />
            </button>
          </>
        ) : (
          <>
            <Video size={22} className="text-gray-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-600">{label}</div>
              <div className="text-xs text-gray-400">Tap to select a file</div>
            </div>
          </>
        )}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
