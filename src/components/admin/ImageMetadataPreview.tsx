'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { X, CheckCircle2, AlertCircle, FileImage, Image as ImageIcon } from 'lucide-react'

interface ImageMetadataPreviewProps {
  url: string
  file?: File | null
  recommendedWidth?: number
  recommendedHeight?: number
  recommendedLabel?: string
  onRemove: () => void
  className?: string
  aspectRatioClass?: string
}

export default function ImageMetadataPreview({
  url,
  file,
  recommendedWidth,
  recommendedHeight,
  recommendedLabel,
  onRemove,
  className = '',
  aspectRatioClass = 'aspect-square',
}: ImageMetadataPreviewProps) {
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    if (!url) return
    const img = new window.Image()
    img.src = url
    img.onload = () => {
      setDimensions({ width: img.naturalWidth, height: img.naturalHeight })
    }
  }, [url])

  const formattedFileSize = file ? (
    file.size < 1024 * 1024
      ? `${(file.size / 1024).toFixed(0)} KB`
      : `${(file.size / (1024 * 1024)).toFixed(1)} MB`
  ) : null

  const fileName = file?.name

  const isExactRecommended =
    dimensions && recommendedWidth && recommendedHeight
      ? dimensions.width === recommendedWidth && dimensions.height === recommendedHeight
      : null

  const isRatioMatched =
    dimensions && recommendedWidth && recommendedHeight
      ? Math.abs(dimensions.width / dimensions.height - recommendedWidth / recommendedHeight) < 0.05
      : null

  return (
    <div className={`relative bg-white border border-[#ECE8EA] rounded-xl overflow-hidden group shadow-xs ${className}`}>
      {/* Image Container */}
      <div className={`relative w-full ${aspectRatioClass} bg-[#FAF9FA] overflow-hidden`}>
        <Image src={url} alt="Selected preview" fill className="object-cover" />
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-2 right-2 p-1.5 bg-white/90 backdrop-blur-sm text-red-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:bg-white z-10 cursor-pointer"
          title="Remove image"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>

      {/* Metadata Bar */}
      {(dimensions || fileName || formattedFileSize || recommendedLabel) && (
        <div className="p-2.5 bg-white border-t border-[#ECE8EA] text-left text-[11px] space-y-1">
          {fileName && (
            <div className="font-semibold text-[#202124] truncate" title={fileName}>
              {fileName}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 text-[#666666]">
            {dimensions ? (
              <span className="font-mono font-medium text-[#202124]">
                {dimensions.width} × {dimensions.height} px
              </span>
            ) : (
              <span className="text-[#8A8A8A]">Detecting size...</span>
            )}

            {formattedFileSize && (
              <span className="text-[#8A8A8A] font-medium">{formattedFileSize}</span>
            )}
          </div>

          {/* Validation / Guidance badge */}
          {dimensions && (recommendedWidth || recommendedHeight || recommendedLabel) && (
            <div className="pt-1 border-t border-[#ECE8EA]/60">
              {isExactRecommended || isRatioMatched ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                  <CheckCircle2 size={11} className="text-emerald-600" />
                  Recommended ratio ({dimensions.width}×{dimensions.height})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md">
                  <AlertCircle size={11} className="text-amber-600" />
                  Rec: {recommendedLabel || `${recommendedWidth} × ${recommendedHeight} px`}
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
