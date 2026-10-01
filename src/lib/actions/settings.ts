'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getSettings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .limit(1)
    .single()
  if (error) return null
  return data
}

export async function updateSettings(payload: {
  store_name?: string
  whatsapp_number?: string
  phone?: string
  email?: string
  address?: string
}) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  // Get the single settings row id
  const { data: existing } = await supabase
    .from('settings')
    .select('id')
    .limit(1)
    .single()

  if (existing) {
    const { error } = await supabase
      .from('settings')
      .update(payload)
      .eq('id', existing.id)
    if (error) return { error: error.message }
  } else {
    const { error } = await supabase.from('settings').insert(payload)
    if (error) return { error: error.message }
  }

  revalidatePath('/admin/settings')
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/about-us')
  revalidatePath('/contact')
  revalidatePath('/category', 'layout')
  revalidatePath('/product', 'layout')
  return { success: true }
}

export async function updatePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (newPassword !== confirmPassword) return { error: 'Passwords do not match.' }
  if (newPassword.length < 6) return { error: 'New password must be at least 6 characters.' }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) return { error: error.message }
  return { success: true }
}

import { BUSINESS_ADDRESS } from '@/lib/constants'

export async function getPublicSettings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('settings')
    .select('store_name, logo, whatsapp_number, phone, email, address')
    .limit(1)
    .single()

  if (data) {
    if (!data.address || data.address.includes('60, Perundurai') || data.address.includes('60 Perundurai')) {
      data.address = BUSINESS_ADDRESS
    }
  }

  return data
}
