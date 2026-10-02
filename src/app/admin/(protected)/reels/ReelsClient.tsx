'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, Video, Play, Pencil, Film, ChevronUp, ChevronDown, ExternalLink, X } from 'lucide-react'
import { Reel } from '@/types/database.types'
import {
  createReel,
  updateReel,
  deleteReel,
  toggleReelStatus,
  reorderReels,
} from '@/lib/actions/reels'
import {
  uploadFile,
  validateImageFile,
  validateVideoFile,
  formatBytes,
  generateThumbnailFromVideo,
} from '@/lib/upload'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import ConfirmDelete from '@/components/admin/ConfirmDelete'
import ImageGuidelineCard from '@/components/admin/ImageGuidelineCard'

interface Props {
  initialReels: Reel[]
}

export default function ReelsClient({ initialReels }: Props) {
  const [reels, setReels] = useState<Reel[]>(initialReels)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Reel | null>(null)

  const [videoMode, setVideoMode] = useState<'upload' | 'url'>('upload')
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [thumbnailUrl, setThumbnailUrl] = useState<string | null>(null)
  const [title, setTitle] = useState('')
  const [subtitle, setSubtitle] = useState('')

  const [activePreviewVideo, setActivePreviewVideo] = useState<string | null>(null)
  const [uploadingVideo, setUploadingVideo] = useState(false)
  const [videoProgress, setVideoProgress] = useState(0)
  const [videoFileName, setVideoFileName] = useState<string | null>(null)
  const [videoFileSize, setVideoFileSize] = useState<number | null>(null)
  const [generatingThumb, setGeneratingThumb] = useState(false)
  const [uploadingThumb, setUploadingThumb] = useState(false)
  const [thumbProgress, setThumbProgress] = useState(0)
  const [pending, startTransition] = useTransition()

  function openAdd() {
    setEditing(null)
    setVideoMode('upload')
    setVideoUrl(null)
    setThumbnailUrl(null)
    setTitle('')
    setSubtitle('')
    setVideoProgress(0)
    setVideoFileName(null)
    setVideoFileSize(null)
    setShowForm(true)
  }

  function openEdit(r: Reel) {
    setEditing(r)
    setVideoMode(r.video.startsWith('http') ? 'url' : 'upload')
    setVideoUrl(r.video)
    setThumbnailUrl(r.thumbnail)
    setTitle(r.title)
    setSubtitle((r as any).subtitle || '')
    setVideoProgress(100)
    setVideoFileName(null)
    setVideoFileSize(null)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  async function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateVideoFile(file)
    if (err) {
      toast.error(err)
      return
    }

    setVideoFileName(file.name)
    setVideoFileSize(file.size)
    setUploadingVideo(true)
    setVideoProgress(0)

    // Auto-extract and upload video thumbnail in background if no thumbnail is set
    const thumbExtractionPromise = (async () => {
      if (!thumbnailUrl) {
        try {
          setGeneratingThumb(true)
          const thumbFile = await generateThumbnailFromVideo(file)
          if (thumbFile) {
            const thumbRes = await uploadFile(thumbFile, 'reels')
            if (!('error' in thumbRes) && thumbRes.url) {
              setThumbnailUrl(thumbRes.url)
            }
          }
        } catch (e) {
          // ignore silent thumbnail generation failure
        } finally {
          setGeneratingThumb(false)
        }
      }
    })()

    const result = await uploadFile(file, 'reels', undefined, (percent) => {
      setVideoProgress(percent)
    })

    setUploadingVideo(false)
    await thumbExtractionPromise

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setVideoUrl(result.url)
    toast.success('Video uploaded successfully!')
  }

  async function handleThumbChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }

    setUploadingThumb(true)
    setThumbProgress(0)
    const result = await uploadFile(file, 'reels', undefined, (percent) => {
      setThumbProgress(percent)
    })
    setUploadingThumb(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setThumbnailUrl(result.url)
    toast.success('Thumbnail uploaded!')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editing && !videoUrl) {
      toast.error('Please upload a video or enter a video URL')
      return
    }
    if (!title.trim()) {
      toast.error('Reel title is required')
      return
    }

    startTransition(async () => {
      const payload = {
        video: videoUrl || editing?.video || '',
        thumbnail: thumbnailUrl || editing?.thumbnail || 'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80',
        title: title.trim(),
        subtitle: subtitle.trim() || null,
        status: editing?.status || 'active',
      }

      const result = editing
        ? await updateReel(editing.id, payload)
        : await createReel(payload)

      if (result?.error) {
        toast.error(result.error)
        return
      }

      toast.success(editing ? 'Reel updated!' : 'Reel created!')
      closeForm()
      window.location.reload()
    })
  }

  async function handleToggle(id: string, status: string) {
    const result = await toggleReelStatus(id, status)
    if (result?.error) toast.error(result.error)
    else window.location.reload()
  }

  async function handleDelete(id: string) {
    const result = await deleteReel(id)
    if (result?.error) toast.error(result.error)
    else {
      toast.success('Reel deleted')
      window.location.reload()
    }
  }

  async function handleMove(index: number, direction: 'up' | 'down') {
    const newList = [...reels]
    const swapIndex = direction === 'up' ? index - 1 : index + 1
    if (swapIndex < 0 || swapIndex >= newList.length) return
    ;[newList[index], newList[swapIndex]] = [newList[swapIndex], newList[index]]
    setReels(newList)
    await reorderReels(newList.map((r) => r.id))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reels &amp; Short Videos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage trending video unboxings, customer reels, and product demonstrations.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
        >
          <Upload size={16} /> Upload Reel
        </button>
      </div>

      {/* Grid of Reels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {reels.map((reel, idx) => (
          <div
            key={reel.id}
            className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            {/* Thumbnail + Video Play Overlay */}
            <div className="relative aspect-[9/14] w-full bg-gray-100 group">
              <Image
                src={reel.thumbnail}
                alt={reel.title}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />

              {/* Play Button opens preview modal */}
              <button
                onClick={() => setActivePreviewVideo(reel.video)}
                className="absolute inset-0 flex items-center justify-center cursor-pointer"
                title="Play Video"
              >
                <div className="w-12 h-12 rounded-full bg-white/90 group-hover:scale-110 transition-transform shadow-lg flex items-center justify-center text-gray-800">
                  <Play size={20} className="ml-0.5" fill="currentColor" />
                </div>
              </button>

              {/* Order Badge */}
              <span className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold px-2 py-0.5 rounded-md">
                #{idx + 1}
              </span>
            </div>

            {/* Info */}
            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-semibold text-sm text-gray-900 truncate">{reel.title}</h3>
                {(reel as any).subtitle && (
                  <p className="text-xs text-gray-400 mt-0.5">{(reel as any).subtitle}</p>
                )}
              </div>

              {/* Controls */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <div className="flex items-center gap-1 text-gray-400">
                  <button
                    onClick={() => handleMove(idx, 'up')}
                    disabled={idx === 0}
                    className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => handleMove(idx, 'down')}
                    disabled={idx === reels.length - 1}
                    className="p-1 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <ToggleSwitch
                    checked={reel.status === 'active'}
                    onChange={() => handleToggle(reel.id, reel.status)}
                  />
                  <button
                    onClick={() => openEdit(reel)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <Pencil size={15} />
                  </button>
                  <ConfirmDelete
                    itemName="this reel"
                    onConfirm={() => handleDelete(reel.id)}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Video Modal Player */}
      {activePreviewVideo && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="relative bg-black rounded-2xl overflow-hidden max-w-sm w-full aspect-[9/16] shadow-2xl flex flex-col">
            <button
              onClick={() => setActivePreviewVideo(null)}
              className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/80 cursor-pointer"
            >
              <X size={18} />
            </button>
            <video
              src={activePreviewVideo}
              controls
              autoPlay
              playsInline
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {/* Upload/Edit Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 my-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              {editing ? 'Edit Reel' : 'Upload Reel'}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reel Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Leather Classic Tote"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436]"
                  required
                />
              </div>

              {/* Subtitle / Category */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Tag / Subtitle (Optional)
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="e.g. Bags & Accessories"
                  className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2.5 outline-none focus:border-[#F40436]"
                />
              </div>

              {/* Video: File Upload or External URL */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-semibold text-gray-700">Video Source *</label>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setVideoMode('upload')}
                      className={`font-semibold cursor-pointer ${videoMode === 'upload' ? 'text-[#F40436]' : 'text-gray-400'}`}
                    >
                      File Upload
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setVideoMode('url')}
                      className={`font-semibold cursor-pointer ${videoMode === 'url' ? 'text-[#F40436]' : 'text-gray-400'}`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {videoMode === 'upload' ? (
                  <div className="space-y-2">
                    {!uploadingVideo && !videoUrl ? (
                      <div>
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/m4v,video/mkv,video/avi"
                          onChange={handleVideoChange}
                          className="w-full text-xs text-gray-600 file:mr-2.5 file:py-2 file:px-3.5 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer border border-gray-200 rounded-xl p-1.5"
                        />
                      </div>
                    ) : uploadingVideo ? (
                      <div className="border border-purple-200 bg-purple-50/60 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-purple-900 truncate max-w-[200px]">
                            {videoFileName || 'Uploading video...'}
                          </span>
                          <span className="font-bold text-purple-700">{videoProgress}%</span>
                        </div>
                        {/* Progress Bar */}
                        <div className="w-full bg-purple-200/70 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#F40436] h-2 rounded-full transition-all duration-200 ease-out"
                            style={{ width: `${Math.max(5, videoProgress)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-purple-600">
                          <span>
                            {videoFileSize
                              ? `${formatBytes(Math.round(videoFileSize * (videoProgress / 100)))} of ${formatBytes(videoFileSize)}`
                              : 'Uploading...'}
                          </span>
                          <span>Please keep this window open</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-800 truncate">
                            {videoFileName || 'Video uploaded'}
                          </span>
                          {videoFileSize && (
                            <span className="text-[11px] text-emerald-600 shrink-0">
                              ({formatBytes(videoFileSize)})
                            </span>
                          )}
                        </div>
                        <label className="text-xs text-[#F40436] hover:underline font-semibold cursor-pointer shrink-0">
                          Change
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoChange}
                            className="hidden"
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={videoUrl || ''}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#F40436]"
                  />
                )}
              </div>

              {/* Thumbnail */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-gray-700">
                    Cover Thumbnail Image (Optional)
                  </label>
                  {generatingThumb && (
                    <span className="text-[11px] text-purple-600 font-medium animate-pulse">
                      Auto-extracting from video...
                    </span>
                  )}
                </div>

                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleThumbChange}
                  disabled={uploadingThumb}
                  className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer w-full"
                />

                {uploadingThumb && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-purple-700 font-medium">
                      <span>Uploading thumbnail...</span>
                      <span>{thumbProgress}%</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-150"
                        style={{ width: `${Math.max(5, thumbProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {thumbnailUrl && !uploadingThumb && (
                  <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-gray-200 bg-black shrink-0">
                      <Image src={thumbnailUrl} alt="Thumbnail preview" fill className="object-cover" />
                    </div>
                    <div className="text-xs">
                      <p className="font-semibold text-gray-800">Cover Thumbnail Ready</p>
                      <p className="text-gray-400 text-[11px]">
                        {generatingThumb ? 'Auto-generating from video frame' : 'Ready to be saved with reel'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reel / Video Guideline Card */}
              <ImageGuidelineCard type="reel" compact />

              {/* Action Buttons */}
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
                  disabled={pending || uploadingVideo || uploadingThumb}
                  className="bg-[#F40436] hover:bg-[#D9032F] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {pending ? 'Saving...' : editing ? 'Save Changes' : 'Upload Reel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
