'use client'

import { getUploadUrl, uploadFileServerSide, deleteR2FileSafe } from '@/lib/actions/storage'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

type Bucket = 'products' | 'categories' | 'photos' | 'reels' | 'banners' | 'settings'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/m4v', 'video/x-matroska', 'video/avi']
const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v', 'mkv', 'avi']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_VIDEO_SIZE = 1024 * 1024 * 1024 // 1 GB (1024 MB)

export function validateImageFile(file: File): string | null {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Unsupported file type. Please upload a JPEG, PNG or WebP image.'
  }
  if (file.size > MAX_IMAGE_SIZE) {
    return 'Image must be smaller than 5MB.'
  }
  return null
}

export function validateVideoFile(file: File): string | null {
  const ext = file.name.split('.').pop()?.toLowerCase() || ''
  const isTypeValid = ALLOWED_VIDEO_TYPES.includes(file.type) || file.type.startsWith('video/') || ALLOWED_EXTENSIONS.includes(ext)

  if (!isTypeValid) {
    return 'Unsupported video format. Please upload an MP4, MOV or WebM video.'
  }
  if (file.size > MAX_VIDEO_SIZE) {
    return 'Video must be smaller than 1 GB (1024 MB).'
  }
  return null
}

export type UploadProgressCallback = (percent: number, loadedBytes: number, totalBytes: number) => void

export function formatBytes(bytes: number, decimals = 1): string {
  if (!bytes || bytes === 0) return '0 B'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export async function generateThumbnailFromVideo(file: File): Promise<File | null> {
  if (typeof window === 'undefined') return null
  return new Promise((resolve) => {
    try {
      const video = document.createElement('video')
      video.preload = 'metadata'
      video.muted = true
      video.playsInline = true
      const url = URL.createObjectURL(file)
      video.src = url

      const cleanUp = () => {
        try {
          URL.revokeObjectURL(url)
          video.remove()
        } catch {}
      }

      video.onloadeddata = () => {
        // Seek to 1s or 25% of the video to avoid black intro frames
        const seekTime = (video.duration && video.duration > 2) ? 1.0 : Math.min(0.5, (video.duration || 1) / 2)
        video.currentTime = seekTime
      }

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas')
          canvas.width = video.videoWidth || 720
          canvas.height = video.videoHeight || 1280
          const ctx = canvas.getContext('2d')
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
            canvas.toBlob(
              (blob) => {
                cleanUp()
                if (blob) {
                  const cleanName = file.name.replace(/\.[^/.]+$/, '').slice(0, 30)
                  const thumbFile = new File([blob], `thumb_${cleanName}.jpg`, {
                    type: 'image/jpeg',
                  })
                  resolve(thumbFile)
                } else {
                  resolve(null)
                }
              },
              'image/jpeg',
              0.85
            )
          } else {
            cleanUp()
            resolve(null)
          }
        } catch {
          cleanUp()
          resolve(null)
        }
      }

      video.onerror = () => {
        cleanUp()
        resolve(null)
      }

      // Safety timeout: 6 seconds max for thumbnail extraction
      setTimeout(() => {
        cleanUp()
        resolve(null)
      }, 6000)
    } catch {
      resolve(null)
    }
  })
}

export async function uploadFile(
  file: File,
  bucket: Bucket,
  entity_id?: string,
  onProgress?: UploadProgressCallback
): Promise<{ url: string; path: string } | { error: string }> {
  // 1. Try direct presigned upload first (Direct to R2 or Supabase)
  const res = await getUploadUrl(file.name, file.type, bucket, entity_id)

  if (!('error' in res) && res?.signedUrl) {
    try {
      const ok = await new Promise<boolean>((resolve) => {
        const xhr = new XMLHttpRequest()
        xhr.open('PUT', res.signedUrl, true)
        xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream')

        if (xhr.upload && onProgress) {
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const percent = Math.min(99, Math.round((e.loaded / e.total) * 100))
              onProgress(percent, e.loaded, e.total)
            }
          }
        }

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            if (onProgress) onProgress(100, file.size, file.size)
            resolve(true)
          } else {
            resolve(false)
          }
        }

        xhr.onerror = () => resolve(false)
        xhr.ontimeout = () => resolve(false)
        xhr.send(file)
      })

      if (ok) {
        return { url: res.publicUrl!, path: res.path! }
      }
    } catch (err) {
      // Fallback seamlessly to server-side upload action
    }
  }

  // 2. Server-side upload fallback (bypasses browser CORS policy 100%)
  if (onProgress) onProgress(30, Math.floor(file.size * 0.3), file.size)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  if (entity_id) formData.append('entity_id', entity_id)

  if (onProgress) onProgress(60, Math.floor(file.size * 0.6), file.size)
  const serverRes = await uploadFileServerSide(formData)
  if ('error' in serverRes && serverRes.error) {
    return { error: serverRes.error }
  }
  if (onProgress) onProgress(100, file.size, file.size)
  return { url: serverRes.url!, path: serverRes.path! }
}

export async function deleteFile(bucket: Bucket, path: string): Promise<{ error?: string }> {
  try {
    if (path.includes('/') && !path.startsWith('http')) {
      await deleteR2FileSafe(path)
    }
    const supabase = createClient()
    const { error } = await supabase.storage.from(bucket).remove([path])
    if (error) return { error: error.message }
    return {}
  } catch (err: any) {
    return { error: err.message }
  }
}
