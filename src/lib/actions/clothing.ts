'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

// ─── SUB-CATEGORIES ────────────────────────────────────────
export async function getClothingSubcategories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clothing_subcategories')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createClothingSubcategory(name: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (!name.trim()) return { error: 'Name is required' }
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('clothing_subcategories')
    .select('id')
    .eq('name', name.trim())
    .maybeSingle()
  if (existing) return { error: 'This sub-category already exists.' }
  const { error } = await supabase.from('clothing_subcategories').insert({ name: name.trim() })
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateClothingSubcategory(id: string, name: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (!name.trim()) return { error: 'Name is required' }
  const supabase = await createClient()
  const { error } = await supabase.from('clothing_subcategories').update({ name: name.trim() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteClothingSubcategory(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('clothing_subcategories').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function toggleClothingSubcategoryStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('clothing_subcategories').update({ status: newStatus }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

// ─── AGE GROUPS ────────────────────────────────────────────
export async function getClothingAgeGroups() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clothing_age_groups')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createClothingAgeGroup(name: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (!name.trim()) return { error: 'Name is required' }
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('clothing_age_groups')
    .select('id')
    .eq('name', name.trim())
    .maybeSingle()
  if (existing) return { error: 'This age group already exists.' }
  const { error } = await supabase.from('clothing_age_groups').insert({ name: name.trim() })
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateClothingAgeGroup(id: string, name: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (!name.trim()) return { error: 'Name is required' }
  const supabase = await createClient()
  const { error } = await supabase.from('clothing_age_groups').update({ name: name.trim() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteClothingAgeGroup(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('clothing_age_groups').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function toggleClothingAgeGroupStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('clothing_age_groups').update({ status: newStatus }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

// ─── CLOTHING SIZES ────────────────────────────────────────
export async function getClothingSizes() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('clothing_sizes')
    .select('*')
    .order('sort_order', { ascending: true })
  if (error) return []
  return data ?? []
}

export async function createClothingSize(name: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (!name.trim()) return { error: 'Name is required' }
  const supabase = await createClient()
  const { data: existing } = await supabase
    .from('clothing_sizes')
    .select('id')
    .eq('name', name.trim())
    .maybeSingle()
  if (existing) return { error: 'This size already exists.' }
  const { error } = await supabase.from('clothing_sizes').insert({ name: name.trim() })
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function updateClothingSize(id: string, name: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  if (!name.trim()) return { error: 'Name is required' }
  const supabase = await createClient()
  const { error } = await supabase.from('clothing_sizes').update({ name: name.trim() }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function deleteClothingSize(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('clothing_sizes').delete().eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}

export async function toggleClothingSizeStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('clothing_sizes').update({ status: newStatus }).eq('id', id)
  if (error) return { error: error.message }
  revalidatePath('/admin/categories')
  return { success: true }
}
