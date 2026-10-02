'use server'

import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { r2Client, R2_BUCKET, getR2StorageUsage, STORAGE_LIMIT_BYTES, R2_PUBLIC_URL } from '@/lib/r2'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@/lib/supabase/server'

type Bucket = 'products' | 'categories' | 'photos' | 'reels' | 'banners' | 'settings'

import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export async function getUploadUrl(
  fileName: string, 
  fileType: string, 
  bucket: Bucket,
  entityId?: string
) {
  const supabase = await createClient()
  
  // 1. Verify Authentication
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized: Please log in' }

  // Check if real R2 credentials exist
  const accountId = process.env.R2_ACCOUNT_ID
  const accessKey = process.env.R2_ACCESS_KEY_ID
  const isR2Configured = accountId && 
    !accountId.includes('your-cloudflare') && 
    accessKey && 
    !accessKey.includes('your-r2')

  const ext = fileName.split('.').pop() || 'bin'
  const uniqueName = `${uuidv4()}.${ext}`

  // 2. Direct Supabase Storage signed upload URL for 'reels' (or fallback when R2 not configured)
  // Ensures video streams directly from browser to storage with zero Next.js server memory load
  if (bucket === 'reels' || !isR2Configured) {
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
      const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
      const adminSupabase = createSupabaseClient(supabaseUrl, serviceKey)
      
      const storagePath = entityId ? `${entityId}/${uniqueName}` : uniqueName

      const { data: signedData, error: signError } = await adminSupabase.storage
        .from(bucket)
        .createSignedUploadUrl(storagePath, { upsert: true })

      if (signError || !signedData?.signedUrl) {
        return { error: signError?.message || 'Failed to create upload URL' }
      }

      const { data: pubData } = adminSupabase.storage.from(bucket).getPublicUrl(storagePath)

      return {
        useR2: false,
        signedUrl: signedData.signedUrl,
        path: storagePath,
        publicUrl: pubData.publicUrl,
        token: signedData.token
      }
    } catch (err: any) {
      return { error: err.message || 'Supabase storage authorization failed' }
    }
  }

  // 3. 7 GB Storage Safety Limit Check for R2
  const currentUsage = await getR2StorageUsage()
  if (currentUsage >= STORAGE_LIMIT_BYTES) {
    return { error: 'Storage safety limit reached (7 GB). Please remove unused files or increase the configured limit.' }
  }

  // 4. Generate Structured Path for R2
  const path = entityId ? `${bucket}/${entityId}/${uniqueName}` : `${bucket}/${uniqueName}`

  // 5. Create Presigned URL for Cloudflare R2
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: path,
    ContentType: fileType,
  })

  try {
    const signedUrl = await getSignedUrl(r2Client, command, { expiresIn: 3600 })
    return { 
      useR2: true,
      signedUrl, 
      path, 
      publicUrl: `${R2_PUBLIC_URL}/${path}` 
    }
  } catch (error) {
    return { error: 'Failed to generate upload URL for R2' }
  }
}

export async function getDirectUploadUrl(
  fileName: string,
  fileType: string,
  bucket: Bucket = 'reels',
  entityId?: string
) {
  return getUploadUrl(fileName, fileType, bucket, entityId)
}

export async function uploadFileServerSide(formData: FormData) {
  const file = formData.get('file') as File
  const bucket = (formData.get('bucket') as Bucket) || 'products'
  const entityId = formData.get('entity_id') as string | undefined

  if (!file) return { error: 'No file provided' }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized: Please log in' }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  const ext = file.name.split('.').pop() || 'bin'
  const uniqueName = `${uuidv4()}.${ext}`
  const path = entityId ? `${bucket}/${entityId}/${uniqueName}` : `${bucket}/${uniqueName}`

  const isR2Configured = Boolean(
    process.env.R2_ACCOUNT_ID &&
    !process.env.R2_ACCOUNT_ID.includes('your-cloudflare') &&
    process.env.R2_ACCESS_KEY_ID
  )

  if (isR2Configured) {
    try {
      const command = new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: path,
        ContentType: file.type || 'application/octet-stream',
        Body: buffer,
      })
      await r2Client.send(command)
      return {
        url: `${R2_PUBLIC_URL}/${path}`,
        path
      }
    } catch (err: any) {
      console.warn('R2 server-side upload warning:', err.message)
    }
  }

  // Supabase fallback if R2 is not configured or server put fails
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    const adminSupabase = createSupabaseClient(supabaseUrl, serviceKey)
    const storagePath = entityId ? `${entityId}/${uniqueName}` : uniqueName

    const { error: uploadErr } = await adminSupabase.storage
      .from(bucket)
      .upload(storagePath, buffer, { contentType: file.type || 'application/octet-stream', upsert: true })

    if (uploadErr) return { error: uploadErr.message }

    const { data: pubData } = adminSupabase.storage.from(bucket).getPublicUrl(storagePath)
    return {
      url: pubData.publicUrl,
      path: storagePath
    }
  } catch (err: any) {
    return { error: err.message || 'Server upload failed' }
  }
}

export async function deleteR2FileSafe(path: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  const { data: profile } = await supabase.from('admin_profiles').select('id').eq('id', user.id).single()
  if (!profile) return { error: 'Unauthorized' }

  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET,
    Key: path,
  })

  try {
    await r2Client.send(command)
    return { success: true }
  } catch (error) {
    return { error: 'Failed to delete file from R2.' }
  }
}

export async function getStorageMetrics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }
  
  const currentUsage = await getR2StorageUsage()
  return {
    usageBytes: currentUsage,
    limitBytes: STORAGE_LIMIT_BYTES
  }
}

import { ListObjectsV2Command } from '@aws-sdk/client-s3'

export async function getStorageAnalysis() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // 1. Get all files in R2
  const r2Files: { key: string; size: number; lastModified: Date }[] = []
  let isTruncated = true
  let continuationToken: string | undefined = undefined
  let isR2Configured = true

  try {
    while (isTruncated) {
      const command: any = new ListObjectsV2Command({ Bucket: R2_BUCKET, ContinuationToken: continuationToken })
      const response: any = await r2Client.send(command)
      response.Contents?.forEach((item: any) => {
        if (item.Key) {
          r2Files.push({ key: item.Key, size: item.Size || 0, lastModified: item.LastModified })
        }
      })
      isTruncated = response.IsTruncated || false
      continuationToken = response.NextContinuationToken
    }
  } catch (error) {
    isR2Configured = false
  }

  // 2. Get all files referenced in the Database
  const dbUrls = new Set<string>()

  try {
    const [
      { data: products },
      { data: images },
      { data: categories },
      { data: banners },
      { data: photos },
      { data: reels },
      { data: settings }
    ] = await Promise.all([
      supabase.from('products').select('product_images'),
      supabase.from('product_images').select('image_url'),
      supabase.from('categories').select('image'),
      supabase.from('banners').select('image'),
      supabase.from('photos').select('image'),
      supabase.from('reels').select('video, thumbnail'),
      supabase.from('settings').select('logo')
    ])

    products?.forEach(p => p.product_images?.forEach((url: string) => dbUrls.add(url)))
    images?.forEach(i => i.image_url && dbUrls.add(i.image_url))
    categories?.forEach(c => c.image && dbUrls.add(c.image))
    banners?.forEach(b => b.image && dbUrls.add(b.image))
    photos?.forEach(p => p.image && dbUrls.add(p.image))
    reels?.forEach(r => {
      if (r.video) dbUrls.add(r.video)
      if (r.thumbnail) dbUrls.add(r.thumbnail)
    })
    settings?.forEach(s => s.logo && dbUrls.add(s.logo))
  } catch (err) {
    // Database query fallback
  }

  // Helper to check if an R2 key is in the DB URLs
  const isReferenced = (key: string) => {
    return Array.from(dbUrls).some(url => url.includes(key))
  }

  const orphans = r2Files.filter(file => !isReferenced(file.key))
  const referenced = r2Files.filter(file => isReferenced(file.key))

  return {
    isR2Configured,
    totalFiles: r2Files.length,
    orphanCount: orphans.length,
    referencedCount: referenced.length > 0 ? referenced.length : dbUrls.size,
    orphans
  }
}

