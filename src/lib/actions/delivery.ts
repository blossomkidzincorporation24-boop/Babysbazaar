'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { DeliveryFeature } from '@/types/database.types'

const DeliveryFeatureSchema = z.object({
  title: z.string().min(1, 'Title / text is required'),
  description: z.string().optional().nullable(),
  icon: z.string().min(1, 'Icon or emoji is required'),
  badge_type: z.enum(['ribbon', 'trust_badge']).default('ribbon'),
  display_order: z.coerce.number().default(0),
  status: z.enum(['active', 'inactive']).default('active'),
})

const DEFAULT_DELIVERY_FEATURES: DeliveryFeature[] = [
  {
    id: 'ribbon-1',
    title: 'Free Shipping on Orders above ₹3500',
    description: null,
    icon: '✨',
    badge_type: 'ribbon',
    display_order: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ribbon-2',
    title: 'Same day shipping for orders before 5 PM',
    description: null,
    icon: '📦',
    badge_type: 'ribbon',
    display_order: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ribbon-3',
    title: 'Shipping across INDIA',
    description: null,
    icon: '🚚',
    badge_type: 'ribbon',
    display_order: 3,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'ribbon-4',
    title: 'For international and wholesale orders DM us',
    description: null,
    icon: '🌍',
    badge_type: 'ribbon',
    display_order: 4,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'badge-1',
    title: 'WhatsApp Concierge',
    description: 'Instant size advice, photos & real-time care',
    icon: 'MessageCircle',
    badge_type: 'trust_badge',
    display_order: 1,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'badge-2',
    title: 'Pan-India Dispatch',
    description: 'Insured doorstep parcel dispatch in 24 hrs',
    icon: 'Truck',
    badge_type: 'trust_badge',
    display_order: 2,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'badge-3',
    title: 'Personalized Gifting',
    description: 'Handcrafted keepsake boxes & calligraphy',
    icon: 'Gift',
    badge_type: 'trust_badge',
    display_order: 3,
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

export async function getDeliveryFeatures(): Promise<DeliveryFeature[]> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('delivery_features')
      .select('*')
      .order('display_order', { ascending: true })

    if (error) {
      console.warn('delivery_features table fetch warning:', error.message)
      return DEFAULT_DELIVERY_FEATURES
    }
    return (data && data.length > 0) ? (data as DeliveryFeature[]) : DEFAULT_DELIVERY_FEATURES
  } catch (err: any) {
    return DEFAULT_DELIVERY_FEATURES
  }
}

export async function getActiveDeliveryFeatures(badgeType?: 'ribbon' | 'trust_badge'): Promise<DeliveryFeature[]> {
  try {
    const supabase = await createClient()
    let query = supabase
      .from('delivery_features')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true })

    if (badgeType) {
      query = query.eq('badge_type', badgeType)
    }

    const { data, error } = await query
    if (error || !data || data.length === 0) {
      return badgeType
        ? DEFAULT_DELIVERY_FEATURES.filter((f) => f.badge_type === badgeType)
        : DEFAULT_DELIVERY_FEATURES
    }
    return data as DeliveryFeature[]
  } catch (err: any) {
    return badgeType
      ? DEFAULT_DELIVERY_FEATURES.filter((f) => f.badge_type === badgeType)
      : DEFAULT_DELIVERY_FEATURES
  }
}

export async function createDeliveryFeature(payload: any) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const parsed = DeliveryFeatureSchema.safeParse(payload)
    if (!parsed.success) {
      return { error: parsed.error.issues[0]?.message ?? 'Validation error' }
    }

    const { error } = await supabase.from('delivery_features').insert(parsed.data)
    if (error) return { error: error.message }

    revalidatePath('/admin/delivery')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function updateDeliveryFeature(id: string, payload: any) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase
      .from('delivery_features')
      .update({
        ...payload,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/delivery')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function deleteDeliveryFeature(id: string) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const { error } = await supabase.from('delivery_features').delete().eq('id', id)
    if (error) return { error: error.message }

    revalidatePath('/admin/delivery')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function toggleDeliveryFeatureStatus(id: string, currentStatus: string) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
    const { error } = await supabase
      .from('delivery_features')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) return { error: error.message }

    revalidatePath('/admin/delivery')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}

export async function reorderDeliveryFeatures(orderedIds: string[]) {
  try {
    const auth = await requireAuth()
    if (!auth.authorized) return { error: auth.error }

    const supabase = await createClient()
    const updates = orderedIds.map((id, index) =>
      supabase
        .from('delivery_features')
        .update({ display_order: index + 1, updated_at: new Date().toISOString() })
        .eq('id', id)
    )
    await Promise.all(updates)

    revalidatePath('/admin/delivery')
    revalidatePath('/')
    return { success: true }
  } catch (err: any) {
    return { error: err.message }
  }
}
