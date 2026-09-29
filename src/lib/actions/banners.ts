'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'

const BannerSchema = z.object({
  image: z.string().min(1, 'Banner image is required'),
  mobile_image: z.string().optional().nullable(),
  heading: z.string().optional().nullable(),
  subtitle: z.string().optional().nullable(),
  button_text: z.string().optional().nullable(),
  link: z.string().optional().nullable(),
  link_type: z.string().optional().nullable(),
  display_order: z.coerce.number().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
})

export async function getBanners() {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
    if (error) throw new Error(error.message)
    return data ?? []
  } catch (err: any) {
    console.warn('Error fetching banners:', err.message)
    return []
  }
}

export async function createBanner(payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const parsed = BannerSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  // Attempt insert with extended fields
  let { error } = await supabase.from('banners').insert(parsed.data)
  
  // Defensive fallback if optional columns haven't been added yet
  if (error && error.message.includes('column')) {
    const corePayload = {
      image: parsed.data.image,
      heading: parsed.data.heading ?? undefined,
      button_text: parsed.data.button_text ?? undefined,
      link: parsed.data.link ?? undefined,
      display_order: parsed.data.display_order,
      status: parsed.data.status,
    }
    const retry = await supabase.from('banners').insert(corePayload)
    error = retry.error
  }

  if (error) return { error: error.message }
  revalidatePath('/admin/banners')
  revalidatePath('/')
  revalidatePath('/categories')
  return { success: true }
}

export async function updateBanner(id: string, payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  
  // Attempt update with all provided fields
  let { error } = await supabase.from('banners').update({
    ...payload,
    updated_at: new Date().toISOString(),
  }).eq('id', id)

  // Defensive fallback if newly added columns aren't in DB yet
  if (error && error.message.includes('column')) {
    const corePayload: any = {}
    if (payload.heading !== undefined) corePayload.heading = payload.heading
    if (payload.button_text !== undefined) corePayload.button_text = payload.button_text
    if (payload.link !== undefined) corePayload.link = payload.link
    if (payload.status !== undefined) corePayload.status = payload.status
    if (payload.image !== undefined) corePayload.image = payload.image
    if (payload.display_order !== undefined) corePayload.display_order = payload.display_order
    corePayload.updated_at = new Date().toISOString()

    const retry = await supabase.from('banners').update(corePayload).eq('id', id)
    error = retry.error
  }

  if (error) return { error: error.message }
  revalidatePath('/admin/banners')
  revalidatePath('/')
  revalidatePath('/categories')
  return { success: true }
}

export async function deleteBanner(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('banners').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/banners')
  revalidatePath('/')
  revalidatePath('/categories')
  return { success: true }
}

export async function toggleBannerStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('banners').update({ status: newStatus, updated_at: new Date().toISOString() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/banners')
  revalidatePath('/')
  revalidatePath('/categories')
  return { success: true }
}

export async function reorderBanners(orderedIds: string[]) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const updates = orderedIds.map((id, index) =>
    supabase.from('banners').update({ display_order: index + 1, updated_at: new Date().toISOString() }).eq('id', id)
  )
  await Promise.all(updates)
  revalidatePath('/admin/banners')
  revalidatePath('/')
  revalidatePath('/categories')
  return { success: true }
}
