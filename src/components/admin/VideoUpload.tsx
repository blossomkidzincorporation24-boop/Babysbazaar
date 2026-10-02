'use client'

import { useState } from 'react'
import { uploadFile, validateVideoFile, formatBytes } from '@/lib/upload'
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
  const [progress, setProgress] = useState(0)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileSize, setFileSize] = useState<number | null>(null)

  async function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateVideoFile(file)
    if (validationError) {
      toast.error(validationError)
      return
    }

    setFileName(file.name)
    setFileSize(file.size)
    setUploading(true)
    setProgress(0)

    const result = await uploadFile(file, 'reels', undefined, (pct) => {
      setProgress(pct)
    })
    setUploading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    onChange(result.url)
    toast.success('Video uploaded successfully')
  }

  return (
    <div className={cn('w-full', className)}>
      <label className={cn(
        'flex flex-col gap-2 w-full border-2 border-dashed rounded-xl p-4 cursor-pointer transition-colors',
        value ? 'border-green-300 bg-green-50/70' : 'border-gray-200 hover:border-purple-400 hover:bg-purple-50/50'
      )}>
        {uploading ? (
          <div className="w-full space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-purple-600 shrink-0" />
                <span className="font-semibold text-purple-900 truncate max-w-[200px]">{fileName}</span>
              </div>
              <span className="font-bold text-purple-700">{progress}%</span>
            </div>
            <div className="w-full bg-purple-200/70 rounded-full h-2 overflow-hidden">
              <div
                className="bg-[#F40436] h-2 rounded-full transition-all duration-200"
                style={{ width: `${Math.max(5, progress)}%` }}
              />
            </div>
            {fileSize && (
              <div className="text-[11px] text-purple-600 text-right">
                {formatBytes(Math.round(fileSize * (progress / 100)))} of {formatBytes(fileSize)}
              </div>
            )}
          </div>
        ) : value ? (
          <div className="flex items-center gap-3 w-full">
            <CheckCircle size={22} className="text-green-500 shrink-0" />
            <div className="truncate">
              <span className="text-sm font-medium text-gray-800 truncate block">{fileName || 'Video uploaded'}</span>
              {fileSize && <span className="text-xs text-gray-500">{formatBytes(fileSize)}</span>}
            </div>
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); onChange(null); setFileName(null); setFileSize(null) }}
              className="ml-auto text-red-400 hover:text-red-600 p-1"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-3 w-full">
            <Video size={22} className="text-gray-400 shrink-0" />
            <div>
              <div className="text-sm font-medium text-gray-600">{label}</div>
              <div className="text-xs text-gray-400">MP4, MOV, WebM • Click to select</div>
            </div>
          </div>
        )}
        <input
          type="file"
          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/m4v,video/mkv,video/avi"
          onChange={handleChange}
          disabled={uploading}
          className="hidden"
        />
      </label>
    </div>
  )
}
