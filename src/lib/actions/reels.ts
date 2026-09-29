'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const ReelSchema = z.object({
  video: z.string().min(1, 'Video is required'),
  thumbnail: z.string().optional().nullable().default('https://images.unsplash.com/photo-1544126592-807ade215a0b?w=800&q=80'),
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().nullable(),
  product_id: z.string().optional().nullable(),
  display_order: z.coerce.number().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
})

export async function getReels() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('reels')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  return data ?? []
}

export async function createReel(payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const parsed = ReelSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  let { error } = await supabase.from('reels').insert(parsed.data)
  
  // Defensive retry with core columns if optional columns aren't in DB yet
  if (error && error.message.includes('column')) {
    const corePayload = {
      video: parsed.data.video,
      thumbnail: parsed.data.thumbnail,
      title: parsed.data.title,
      status: parsed.data.status,
    }
    const retry = await supabase.from('reels').insert(corePayload)
    error = retry.error
  }

  if (error) return { error: error.message }
  revalidatePath('/admin/reels')
  revalidatePath('/')
  return { success: true }
}

export async function updateReel(id: string, payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  let { error } = await supabase.from('reels').update({
    ...payload,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  if (error && error.message.includes('column')) {
    const corePayload: any = {}
    if (payload.title !== undefined) corePayload.title = payload.title
    if (payload.status !== undefined) corePayload.status = payload.status
    if (payload.video !== undefined) corePayload.video = payload.video
    if (payload.thumbnail !== undefined) corePayload.thumbnail = payload.thumbnail
    corePayload.updated_at = new Date().toISOString()
    const retry = await supabase.from('reels').update(corePayload).eq('id', id)
    error = retry.error
  }

  if (error) return { error: error.message }
  revalidatePath('/admin/reels')
  revalidatePath('/')
  return { success: true }
}

export async function deleteReel(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('reels').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/reels')
  revalidatePath('/')
  return { success: true }
}

export async function toggleReelStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('reels').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/reels')
  revalidatePath('/')
  return { success: true }
}

export async function reorderReels(orderedIds: string[]) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const updates = orderedIds.map((id, index) =>
    supabase.from('reels').update({ display_order: index + 1, updated_at: new Date().toISOString() }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/admin/reels')
  revalidatePath('/')
  return { success: true }
}
