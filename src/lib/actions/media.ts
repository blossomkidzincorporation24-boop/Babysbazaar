'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { MediaAsset } from '@/types/database.types'

export async function getMediaAssets(fileType?: string): Promise<MediaAsset[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('media_assets')
      .select('*')
      .order('created_at', { ascending: false })

    if (fileType && fileType !== 'all') {
      query = query.eq('file_type', fileType)
    }

    const { data, error } = await query
    if (error) {
      console.warn('media_assets fetch warning:', error.message)
      return []
    }
    return (data as MediaAsset[]) || []
  } catch (err: any) {
    return []
  }
}

export async function createMediaAsset(payload: {
  name: string
  file_url: string
  file_type: string
  file_size?: number
  bucket?: string
}) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const { data, error } = await supabase
      .from('media_assets')
      .insert({
        name: payload.name,
        file_url: payload.file_url,
        file_type: payload.file_type,
        file_size: payload.file_size || 0,
        bucket: payload.bucket || 'banners',
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) return { error: error.message }
    revalidatePath('/admin/media')
    return { success: true, asset: data }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteMediaAsset(id: string) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase.from('media_assets').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/admin/media')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
