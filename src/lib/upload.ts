'use client'

import { getUploadUrl, uploadFileServerSide, deleteR2FileSafe } from '@/lib/actions/storage'
import { createClient } from '@/lib/supabase/client'
import { v4 as uuidv4 } from 'uuid'

type Bucket = 'products' | 'categories' | 'photos' | 'reels' | 'banners' | 'settings'

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', 'video/m4v', 'video/x-matroska', 'video/avi']
const ALLOWED_EXTENSIONS = ['mp4', 'mov', 'webm', 'm4v', 'mkv', 'avi']
const MAX_IMAGE_SIZE = 5 * 1024 * 1024  // 5MB
const MAX_VIDEO_SIZE = 100 * 1024 * 1024 // 100MB

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
    return 'Video must be smaller than 100MB.'
  }
  return null
}

export async function uploadFile(
  file: File,
  bucket: Bucket,
  entity_id?: string
): Promise<{ url: string; path: string } | { error: string }> {
  // 1. Try direct presigned upload first
  const res = await getUploadUrl(file.name, file.type, bucket, entity_id)

  if (!('error' in res) && res?.signedUrl) {
    try {
      const uploadRes = await fetch(res.signedUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': file.type || 'application/octet-stream',
        },
        body: file,
      })

      if (uploadRes.ok) {
        return { url: res.publicUrl!, path: res.path! }
      }
    } catch (err) {
      // Direct browser PUT hit CORS or fetch error; fallback seamlessly to server-side upload action
    }
  }

  // 2. Server-side upload fallback (bypasses browser CORS policy 100%)
  const formData = new FormData()
  formData.append('file', file)
  formData.append('bucket', bucket)
  if (entity_id) formData.append('entity_id', entity_id)

  const serverRes = await uploadFileServerSide(formData)
  if ('error' in serverRes && serverRes.error) {
    return { error: serverRes.error }
  }
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
