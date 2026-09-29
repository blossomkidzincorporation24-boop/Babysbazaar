'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { OfferBanner } from '@/types/database.types'

const OfferBannerSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  subtitle: z.string().optional().nullable(),
  badge_text: z.string().optional().nullable(),
  image: z.string().min(1, 'Banner image is required'),
  mobile_image: z.string().optional().nullable(),
  button_text: z.string().optional().nullable(),
  button_link: z.string().optional().nullable(),
  background_color: z.string().optional().nullable(),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  display_order: z.coerce.number().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
})

export async function getOfferBanners(): Promise<OfferBanner[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('offer_banners')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.warn('offer_banners table fetch warning:', error.message)
      return []
    }
    return (data as OfferBanner[]) ?? []
  } catch (err: any) {
    console.warn('Error fetching offer banners:', err.message)
    return []
  }
}

export async function getActiveOfferBanner(): Promise<OfferBanner | null> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('offer_banners')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    if (error || !data || data.length === 0) {
      return null
    }

    const now = new Date()
    const valid = data.find((b: OfferBanner) => {
      if (b.start_date) {
        const start = new Date(b.start_date)
        if (!isNaN(start.getTime()) && start > now) return false
      }
      if (b.end_date) {
        const end = new Date(b.end_date)
        if (!isNaN(end.getTime()) && end < now) return false
      }
      return true
    })

    return (valid as OfferBanner) || null
  } catch (err: any) {
    return null
  }
}

export async function createOfferBanner(payload: any) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const parsed = OfferBannerSchema.safeParse(payload)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Validation error' }
    }

    const { error } = await supabase.from('offer_banners').insert(parsed.data)
    if (error) return { error: error.message }

    revalidatePath('/admin/offers')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateOfferBanner(id: string, payload: any) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase
      .from('offer_banners')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/offers')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteOfferBanner(id: string) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase.from('offer_banners').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/offers')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleOfferBannerStatus(id: string, currentStatus: string) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('offer_banners')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/offers')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function reorderOfferBanners(orderedIds: string[]) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('offer_banners')
        .update({ display_order: index + 1, updated_at: new Date().toISOString() })
        .eq('id', id)
    )
    await Promise.all(updates)

    revalidatePath('/admin/offers')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
