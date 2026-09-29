'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const PhotoSchema = z.object({
  image: z.string().min(1, 'Image is required'),
  caption: z.string().optional(),
  type: z.enum(['delivery', 'event']).default('delivery'),
  status: z.enum(['active', 'inactive']).default('active'),
})

export async function getPhotos() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('photos')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data
}

export async function createPhoto(payload: {
  image: string
  caption?: string
  type: 'delivery' | 'event'
  status: 'active' | 'inactive'
}) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const parsed = PhotoSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const { error } = await supabase.from('photos').insert(parsed.data)
  if (error) return { error: error.message }

  revalidatePath('/admin/photos')
  revalidatePath('/')
  revalidatePath('/about-us')
  revalidatePath('/about')
  return { success: true }
}

export async function updatePhoto(id: string, payload: {
  caption?: string
  type: 'delivery' | 'event'
  status: 'active' | 'inactive'
}) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('photos').update(payload).eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/photos')
  revalidatePath('/')
  revalidatePath('/about-us')
  revalidatePath('/about')
  return { success: true }
}

export async function deletePhoto(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('photos').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidatePath('/admin/photos')
  revalidatePath('/')
  revalidatePath('/about-us')
  revalidatePath('/about')
  return { success: true }
}

export async function togglePhotoStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('photos').update({ status: newStatus }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/photos')
  revalidatePath('/')
  revalidatePath('/about-us')
  revalidatePath('/about')
  return { success: true }
}

