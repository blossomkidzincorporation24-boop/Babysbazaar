'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import {
  Upload,
  Play,
  Pencil,
  ChevronUp,
  ChevronDown,
  X,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Loader2,
  Trash2,
  Film,
  Plus,
} from 'lucide-react'
import { Reel } from '@/types/database.types'
import {
  createReel,
  updateReel,
  deleteReel,
  toggleReelStatus,
  reorderReels,
} from '@/lib/actions/reels'
import {
  validateImageFile,
  validateVideoFile,
  formatBytes,
  inspectVideoFile,
  extractVideoThumbnailAndPreview,
  uploadDirectToStorage,
  VideoMetadata,
} from '@/lib/upload'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import ConfirmDelete from '@/components/admin/ConfirmDelete'
import ImageGuidelineCard from '@/components/admin/ImageGuidelineCard'

interface Props {
  initialReels: Reel[]
}

interface QueueItem {
  id: string
  file: File
  title: string
  subtitle: string
  thumbnailFile: File | null
  thumbnailPreview: string | null
  thumbnailUrl: string | null
  videoUrl: string | null
  videoPath: string | null
  metadata: VideoMetadata | null
  status: 'queued' | 'optimizing' | 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  statusText: string
  loadedBytes: number
  totalBytes: number
  error?: string
  canRetry: boolean
  abortController?: AbortController
}

const MAX_CONCURRENT_UPLOADS = 2

function cleanFilenameToTitle(name: string): string {
  const withoutExt = name.replace(/\.[^/.]+$/, '')
  const formatted = withoutExt
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return formatted ? formatted.charAt(0).toUpperCase() + formatted.slice(1) : 'New Reel'
}

export default function ReelsClient({ initialReels }: Props) {
  const [reels, setReels] = useState<Reel[]>(initialReels)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingReel, setEditingReel] = useState<Reel | null>(null)

  // Edit Single Reel State
  const [editTitle, setEditTitle] = useState('')
  const [editSubtitle, setEditSubtitle] = useState('')
  const [editVideoMode, setEditVideoMode] = useState<'upload' | 'url'>('upload')
  const [editVideoUrl, setEditVideoUrl] = useState<string | null>(null)
  const [editThumbnailUrl, setEditThumbnailUrl] = useState<string | null>(null)
  const [editUploadingVideo, setEditUploadingVideo] = useState(false)
  const [editVideoProgress, setEditVideoProgress] = useState(0)
  const [editUploadingThumb, setEditUploadingThumb] = useState(false)
  const [editThumbProgress, setEditThumbProgress] = useState(0)
  const [editPending, setEditPending] = useState(false)

  // Upload Queue State
  const [queue, setQueue] = useState<QueueItem[]>([])
  const [isProcessingQueue, setIsProcessingQueue] = useState(false)
  const [activePreviewVideo, setActivePreviewVideo] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const isDraggingRef = useRef(false)
  const [isDragging, setIsDragging] = useState(false)

  // Sync state if initialReels changes
  useEffect(() => {
    setReels(initialReels)
  }, [initialReels])

  // Open Edit Modal for a single reel
  function openEdit(r: Reel) {
    setEditingReel(r)
    setEditTitle(r.title)
    setEditSubtitle((r as any).subtitle || '')
    setEditVideoMode(r.video.startsWith('http') ? 'url' : 'upload')
    setEditVideoUrl(r.video)
    setEditThumbnailUrl(r.thumbnail)
    setEditVideoProgress(100)
    setEditThumbProgress(100)
    setShowEditModal(true)
  }

  function closeEditModal() {
    setShowEditModal(false)
    setEditingReel(null)
  }

  // Open Upload Modal
  function openUploadModal() {
    setShowUploadModal(true)
  }

  function closeUploadModal() {
    const isUploading = queue.some((item) => item.status === 'uploading' || item.status === 'processing')
    if (isUploading) {
      if (!confirm('Reels are currently uploading. Are you sure you want to close this window?')) {
        return
      }
    }
    setShowUploadModal(false)
    setQueue([])
  }

  // Add multiple files to queue with pre-validation
  const handleFilesSelected = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const newItems: QueueItem[] = []

    for (const file of fileArray) {
      const validationError = validateVideoFile(file)
      if (validationError) {
        toast.error(`${file.name}: ${validationError}`)
        continue
      }

      const item: QueueItem = {
        id: Math.random().toString(36).substring(2, 9),
        file,
        title: cleanFilenameToTitle(file.name),
        subtitle: '',
        thumbnailFile: null,
        thumbnailPreview: null,
        thumbnailUrl: null,
        videoUrl: null,
        videoPath: null,
        metadata: null,
        status: 'queued',
        progress: 0,
        statusText: 'Queued',
        loadedBytes: 0,
        totalBytes: file.size,
        canRetry: false,
      }
      newItems.push(item)

      // Background instant thumbnail & metadata pre-fetch for instant UI preview
      ;(async () => {
        try {
          const [meta, thumbResult] = await Promise.all([
            inspectVideoFile(file),
            extractVideoThumbnailAndPreview(file, 720, 0.82),
          ])

          setQueue((prev) =>
            prev.map((q) => {
              if (q.id === item.id) {
                return {
                  ...q,
                  metadata: meta,
                  thumbnailFile: thumbResult?.file || null,
                  thumbnailPreview: thumbResult?.previewUrl || null,
                }
              }
              return q
            })
          )
        } catch {
          // Non-blocking thumbnail generation
        }
      })()
    }

    if (newItems.length > 0) {
      setQueue((prev) => [...prev, ...newItems])
      setShowUploadModal(true)
    }
  }, [])

  // Process a single queue item
  const processQueueItem = useCallback(async (item: QueueItem) => {
    const abortController = new AbortController()

    setQueue((prev) =>
      prev.map((q) =>
        q.id === item.id
          ? {
              ...q,
              status: 'uploading',
              statusText: 'Uploading Reel... 0%',
              abortController,
              canRetry: false,
              error: undefined,
            }
          : q
      )
    )

    try {
      // Step 1: Ensure lightweight thumbnail is available (draw ~30KB frame)
      let currentThumbFile = item.thumbnailFile
      if (!currentThumbFile) {
        const thumbResult = await extractVideoThumbnailAndPreview(item.file, 720, 0.82)
        if (thumbResult) {
          currentThumbFile = thumbResult.file
          setQueue((prev) =>
            prev.map((q) =>
              q.id === item.id
                ? {
                    ...q,
                    thumbnailFile: thumbResult.file,
                    thumbnailPreview: thumbResult.previewUrl,
                  }
                : q
            )
          )
        }
      }

      // Step 2: Direct Storage Upload for Video (if not already uploaded)
      let finalVideoUrl = item.videoUrl
      let finalVideoPath = item.videoPath

      if (!finalVideoUrl) {
        const videoRes = await uploadDirectToStorage(
          item.file,
          'reels',
          (percent, loaded, total) => {
            setQueue((prev) =>
              prev.map((q) =>
                q.id === item.id
                  ? {
                      ...q,
                      progress: percent,
                      loadedBytes: loaded,
                      totalBytes: total,
                      statusText: `Uploading Reel... ${percent}%`,
                    }
                  : q
              )
            )
          },
          abortController.signal
        )

        if ('error' in videoRes) {
          throw new Error(videoRes.error)
        }

        finalVideoUrl = videoRes.url
        finalVideoPath = videoRes.path

        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  videoUrl: finalVideoUrl,
                  videoPath: finalVideoPath,
                  progress: 100,
                  statusText: 'Processing...',
                  status: 'processing',
                }
              : q
          )
        )
      } else {
        setQueue((prev) =>
          prev.map((q) =>
            q.id === item.id
              ? {
                  ...q,
                  statusText: 'Processing...',
                  status: 'processing',
                }
              : q
          )
        )
      }

      // Step 3: Direct Storage Upload for Thumbnail
      let finalThumbUrl = item.thumbnailUrl
      if (!finalThumbUrl && currentThumbFile) {
        const thumbRes = await uploadDirectToStorage(currentThumbFile, 'reels')
        if (!('error' in thumbRes) && thumbRes.url) {
          finalThumbUrl = thumbRes.url
        }
      }

      const defaultFallbackThumb =
        'https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80'

      // Step 4: Finalize Database Record Insertion
      const createRes = await createReel({
        title: item.title.trim(),
        subtitle: item.subtitle.trim() || null,
        video: finalVideoUrl,
        thumbnail: finalThumbUrl || defaultFallbackThumb,
        status: 'active',
      })

      if (createRes?.error) {
        throw new Error(createRes.error)
      }

      // Mark completed & update dashboard state immediately
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: 'completed',
                statusText: 'Upload Complete',
                progress: 100,
                videoUrl: finalVideoUrl,
                thumbnailUrl: finalThumbUrl,
                canRetry: false,
              }
            : q
        )
      )

      if (createRes?.reel) {
        setReels((prev) => [createRes.reel, ...prev])
      }

      toast.success(`Reel "${item.title}" uploaded!`)
    } catch (err: any) {
      const errorMessage = err?.message || 'Upload failed'
      setQueue((prev) =>
        prev.map((q) =>
          q.id === item.id
            ? {
                ...q,
                status: 'error',
                statusText: `Failed: ${errorMessage}`,
                error: errorMessage,
                canRetry: true,
              }
            : q
        )
      )
      toast.error(`"${item.title}": ${errorMessage}`)
    }
  }, [])

  // Queue Controller: Controlled Concurrency Runner (max 2 active)
  useEffect(() => {
    const activeCount = queue.filter(
      (item) => item.status === 'uploading' || item.status === 'processing'
    ).length
    const availableSlots = MAX_CONCURRENT_UPLOADS - activeCount

    if (availableSlots > 0) {
      const nextItems = queue.filter((item) => item.status === 'queued').slice(0, availableSlots)
      for (const nextItem of nextItems) {
        processQueueItem(nextItem)
      }
    }

    const hasActiveOrQueued = queue.some(
      (item) =>
        item.status === 'queued' ||
        item.status === 'uploading' ||
        item.status === 'processing'
    )
    setIsProcessingQueue(hasActiveOrQueued)
  }, [queue, processQueueItem])

  // Retry a failed item
  const handleRetryItem = (id: string) => {
    setQueue((prev) =>
      prev.map((q) =>
        q.id === id
          ? {
              ...q,
              status: 'queued',
              statusText: 'Queued',
              canRetry: false,
              error: undefined,
            }
          : q
      )
    )
  }

  // Remove an item from the queue
  const handleRemoveQueueItem = (id: string) => {
    setQueue((prev) => {
      const target = prev.find((q) => q.id === id)
      if (target?.abortController) {
        target.abortController.abort()
      }
      return prev.filter((q) => q.id !== id)
    })
  }

  // Drag and drop handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = true
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    isDraggingRef.current = false
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesSelected(e.dataTransfer.files)
    }
  }

  // Edit Single Reel Handlers
  async function handleEditVideoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validateVideoFile(file)
    if (err) {
      toast.error(err)
      return
    }

    setEditUploadingVideo(true)
    setEditVideoProgress(0)

    // Direct storage upload
    const result = await uploadDirectToStorage(file, 'reels', (percent) => {
      setEditVideoProgress(percent)
    })

    setEditUploadingVideo(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setEditVideoUrl(result.url)
    toast.success('New video uploaded!')
  }

  async function handleEditThumbUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const err = validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }

    setEditUploadingThumb(true)
    setEditThumbProgress(0)

    const result = await uploadDirectToStorage(file, 'reels', (percent) => {
      setEditThumbProgress(percent)
    })

    setEditUploadingThumb(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    setEditThumbnailUrl(result.url)
    toast.success('Thumbnail uploaded!')
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!editingReel) return
    if (!editVideoUrl) {
      toast.error('Video is required')
      return
    }
    if (!editTitle.trim()) {
      toast.error('Title is required')
      return
    }

    setEditPending(true)
    const payload = {
      video: editVideoUrl,
      thumbnail: editThumbnailUrl || editingReel.thumbnail,
      title: editTitle.trim(),
      subtitle: editSubtitle.trim() || null,
      status: editingReel.status,
    }

    const result = await updateReel(editingReel.id, payload)
    setEditPending(false)

    if (result?.error) {
      toast.error(result.error)
      return
    }

    // Update local state without full reload
    setReels((prev) =>
      prev.map((r) => (r.id === editingReel.id ? { ...r, ...payload, id: editingReel.id } : r))
    )
    toast.success('Reel updated successfully!')
    closeEditModal()
  }

  // Dashboard grid actions: toggle, reorder, delete without full page reloads
  async function handleToggle(id: string, currentStatus: string) {
    const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'
    setReels((prev) => prev.map((r) => (r.id === id ? { ...r, status: nextStatus } : r)))
    const result = await toggleReelStatus(id, currentStatus)
    if (result?.error) {
      // revert on failure
      setReels((prev) => prev.map((r) => (r.id === id ? { ...r, status: currentStatus as any } : r)))
      toast.error(result.error)
    }
  }

  async function handleDelete(id: string) {
    const oldList = [...reels]
    setReels((prev) => prev.filter((r) => r.id !== id))
    const result = await deleteReel(id)
    if (result?.error) {
      setReels(oldList)
      toast.error(result.error)
    } else {
      toast.success('Reel deleted')
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

  const completedCount = queue.filter((q) => q.status === 'completed').length
  const totalInQueue = queue.length

  return (
    <div
      className="space-y-6 relative"
      onDragEnter={handleDragEnter}
      onDragOver={(e) => e.preventDefault()}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Drag & Drop Overlay */}
      {isDragging && (
        <div className="fixed inset-0 z-50 bg-[#F40436]/10 backdrop-blur-xs border-4 border-dashed border-[#F40436] flex flex-col items-center justify-center pointer-events-none p-6 text-center">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center max-w-sm">
            <Upload size={48} className="text-[#F40436] animate-bounce mb-3" />
            <h3 className="text-lg font-bold text-gray-800">Drop Reels to Upload</h3>
            <p className="text-xs text-gray-500 mt-1">Select multiple videos (MP4, MOV, WebM)</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reels &amp; Short Videos</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage trending video unboxings, customer reels, and product demonstrations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="file"
            ref={fileInputRef}
            multiple
            accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/m4v,video/mkv,video/avi"
            onChange={(e) => {
              if (e.target.files) handleFilesSelected(e.target.files)
              e.target.value = ''
            }}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Upload size={16} /> Upload Reels
          </button>
        </div>
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
                  <ConfirmDelete itemName="this reel" onConfirm={() => handleDelete(reel.id)} />
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

      {/* Batch Upload Modal with Controlled Concurrency Queue */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 my-8 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-800">Fast Reels Upload</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Direct storage streaming • Real-time progress • Fast auto-thumbnails
                </p>
              </div>
              <button
                onClick={closeUploadModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100"
              >
                <X size={18} />
              </button>
            </div>

            {/* Queue Stats Bar */}
            {totalInQueue > 0 && (
              <div className="flex items-center justify-between py-3 px-4 my-3 bg-gray-50 border border-gray-100 rounded-2xl text-xs">
                <span className="font-semibold text-gray-700">
                  {completedCount} of {totalInQueue} Completed
                </span>
                <div className="flex items-center gap-2">
                  {isProcessingQueue ? (
                    <span className="flex items-center gap-1.5 text-purple-700 font-medium bg-purple-100/70 px-2.5 py-1 rounded-full">
                      <Loader2 size={12} className="animate-spin" />
                      Uploading ({MAX_CONCURRENT_UPLOADS} concurrent)
                    </span>
                  ) : completedCount === totalInQueue ? (
                    <span className="flex items-center gap-1 text-emerald-700 font-medium bg-emerald-100 px-2.5 py-1 rounded-full">
                      <CheckCircle size={12} /> All Uploads Finished
                    </span>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-[#F40436] font-semibold hover:underline ml-2"
                  >
                    <Plus size={14} /> Add More
                  </button>
                </div>
              </div>
            )}

            {/* Queue Items List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 py-1">
              {queue.length === 0 ? (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#F40436] rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors bg-gray-50/50 hover:bg-red-50/20"
                >
                  <Film size={36} className="text-gray-400 mb-2" />
                  <p className="text-sm font-semibold text-gray-700">Choose or drag video files</p>
                  <p className="text-xs text-gray-400 mt-1">Select one or multiple reels (MP4, MOV, WebM up to 1GB)</p>
                </div>
              ) : (
                queue.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-100 rounded-2xl p-3.5 bg-white shadow-2xs hover:border-gray-200 transition-all flex flex-col gap-2.5"
                  >
                    <div className="flex items-start gap-3">
                      {/* Video Thumbnail Preview */}
                      <div className="relative w-14 h-20 bg-gray-900 rounded-xl overflow-hidden shrink-0 border border-gray-200">
                        {item.thumbnailPreview ? (
                          <img
                            src={item.thumbnailPreview}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Film size={18} className="text-gray-500" />
                          </div>
                        )}
                        {item.status === 'completed' && (
                          <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <CheckCircle size={18} className="text-white drop-shadow-sm" />
                          </div>
                        )}
                      </div>

                      {/* Title & Tag Inputs */}
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <input
                          type="text"
                          value={item.title}
                          disabled={item.status === 'uploading' || item.status === 'processing'}
                          onChange={(e) => {
                            const val = e.target.value
                            setQueue((prev) =>
                              prev.map((q) => (q.id === item.id ? { ...q, title: val } : q))
                            )
                          }}
                          placeholder="Reel title *"
                          className="w-full text-xs font-semibold text-gray-800 border border-gray-200 rounded-lg px-2.5 py-1.5 outline-none focus:border-[#F40436] disabled:bg-gray-50"
                        />

                        <input
                          type="text"
                          value={item.subtitle}
                          disabled={item.status === 'uploading' || item.status === 'processing'}
                          onChange={(e) => {
                            const val = e.target.value
                            setQueue((prev) =>
                              prev.map((q) => (q.id === item.id ? { ...q, subtitle: val } : q))
                            )
                          }}
                          placeholder="Tag / Category (optional)"
                          className="w-full text-[11px] text-gray-600 border border-gray-200 rounded-lg px-2.5 py-1 outline-none focus:border-[#F40436] disabled:bg-gray-50"
                        />

                        <div className="flex items-center gap-2 text-[10px] text-gray-400">
                          <span>{item.file.name}</span>
                          <span>•</span>
                          <span>{formatBytes(item.file.size)}</span>
                          {item.metadata?.formattedDuration && (
                            <>
                              <span>•</span>
                              <span>{item.metadata.formattedDuration}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="shrink-0 flex items-center gap-1.5">
                        {item.canRetry && (
                          <button
                            type="button"
                            onClick={() => handleRetryItem(item.id)}
                            className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                            title="Retry Upload"
                          >
                            <RefreshCw size={15} />
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveQueueItem(item.id)}
                          disabled={item.status === 'uploading'}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Remove"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Progress Bar & Status Text */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span
                          className={`font-semibold ${
                            item.status === 'completed'
                              ? 'text-emerald-700'
                              : item.status === 'error'
                              ? 'text-red-600'
                              : item.status === 'uploading'
                              ? 'text-purple-700'
                              : 'text-gray-500'
                          }`}
                        >
                          {item.statusText}
                        </span>
                        {item.status === 'uploading' && (
                          <span className="text-[10px] text-gray-500">
                            {formatBytes(item.loadedBytes)} / {formatBytes(item.totalBytes)}
                          </span>
                        )}
                      </div>

                      <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-200 ${
                            item.status === 'completed'
                              ? 'bg-emerald-500'
                              : item.status === 'error'
                              ? 'bg-red-500'
                              : 'bg-[#F40436]'
                          }`}
                          style={{
                            width: `${
                              item.status === 'completed'
                                ? 100
                                : item.status === 'queued'
                                ? 0
                                : Math.max(5, item.progress)
                            }%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-4 mt-2 border-t border-gray-100 flex items-center justify-between">
              <ImageGuidelineCard type="reel" compact />
              <button
                type="button"
                onClick={closeUploadModal}
                className="bg-gray-900 hover:bg-black text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors cursor-pointer shrink-0 ml-4"
              >
                {completedCount > 0 ? 'Done' : 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Single Reel Modal */}
      {showEditModal && editingReel && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 my-8">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Edit Reel</h2>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Reel Title *
                </label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
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
                  value={editSubtitle}
                  onChange={(e) => setEditSubtitle(e.target.value)}
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
                      onClick={() => setEditVideoMode('upload')}
                      className={`font-semibold cursor-pointer ${
                        editVideoMode === 'upload' ? 'text-[#F40436]' : 'text-gray-400'
                      }`}
                    >
                      File Upload
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setEditVideoMode('url')}
                      className={`font-semibold cursor-pointer ${
                        editVideoMode === 'url' ? 'text-[#F40436]' : 'text-gray-400'
                      }`}
                    >
                      URL
                    </button>
                  </div>
                </div>

                {editVideoMode === 'upload' ? (
                  <div className="space-y-2">
                    {editUploadingVideo ? (
                      <div className="border border-purple-200 bg-purple-50/60 rounded-xl p-3.5 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-purple-900">Uploading Reel...</span>
                          <span className="font-bold text-purple-700">{editVideoProgress}%</span>
                        </div>
                        <div className="w-full bg-purple-200/70 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#F40436] h-2 rounded-full transition-all duration-200"
                            style={{ width: `${Math.max(5, editVideoProgress)}%` }}
                          />
                        </div>
                      </div>
                    ) : editVideoUrl ? (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-2 truncate pr-2">
                          <CheckCircle size={15} className="text-emerald-600 shrink-0" />
                          <span className="text-xs font-semibold text-emerald-800 truncate">
                            Video ready
                          </span>
                        </div>
                        <label className="text-xs text-[#F40436] hover:underline font-semibold cursor-pointer shrink-0">
                          Replace
                          <input
                            type="file"
                            accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/m4v,video/mkv,video/avi"
                            onChange={handleEditVideoUpload}
                            className="hidden"
                          />
                        </label>
                      </div>
                    ) : (
                      <label className="flex items-center gap-2 border border-dashed border-gray-300 rounded-xl p-3 text-xs text-gray-600 hover:border-[#F40436] cursor-pointer">
                        <Upload size={16} /> Choose replacement video
                        <input
                          type="file"
                          accept="video/mp4,video/webm,video/quicktime,video/x-m4v,video/m4v,video/mkv,video/avi"
                          onChange={handleEditVideoUpload}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  <input
                    type="url"
                    value={editVideoUrl || ''}
                    onChange={(e) => setEditVideoUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full text-sm border border-gray-200 rounded-xl px-3.5 py-2 outline-none focus:border-[#F40436]"
                  />
                )}
              </div>

              {/* Cover Thumbnail */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Cover Thumbnail
                </label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleEditThumbUpload}
                  disabled={editUploadingThumb}
                  className="text-xs text-gray-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer w-full"
                />

                {editUploadingThumb && (
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center justify-between text-xs text-purple-700 font-medium">
                      <span>Uploading thumbnail...</span>
                      <span>{editThumbProgress}%</span>
                    </div>
                    <div className="w-full bg-purple-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-150"
                        style={{ width: `${Math.max(5, editThumbProgress)}%` }}
                      />
                    </div>
                  </div>
                )}

                {editThumbnailUrl && !editUploadingThumb && (
                  <div className="flex items-center gap-3 mt-2 p-2 bg-gray-50 border border-gray-100 rounded-xl">
                    <div className="relative w-12 h-16 rounded-lg overflow-hidden border border-gray-200 bg-black shrink-0">
                      <Image
                        src={editThumbnailUrl}
                        alt="Thumbnail preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="text-xs font-medium text-gray-700">Thumbnail configured</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editPending || editUploadingVideo || editUploadingThumb}
                  className="bg-[#F40436] hover:bg-[#D9032F] disabled:opacity-50 text-white text-sm font-semibold px-5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  {editPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
