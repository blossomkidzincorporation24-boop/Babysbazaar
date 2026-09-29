'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'
import { z } from 'zod'
import { logActivity } from './logs'

const CategorySchema = z.object({
  name: z.string().min(1, 'Category name is required'),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  sort_order: z.coerce.number().default(0),
})

export async function getCategories() {
  const supabase = await createClient()
  // First attempt: order by sort_order then created_at
  const res = await supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (res.error) {
    // Fallback if sort_order column does not exist yet in DB
    const fallback = await supabase
      .from('categories')
      .select('*')
      .order('created_at', { ascending: false })
    if (fallback.error) throw new Error(fallback.error.message)
    return fallback.data
  }
  return res.data
}

export async function getCategoryBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) throw new Error(error.message)
  return data
}

async function generateUniqueCategorySlug(name: string, currentId?: string) {
  const supabase = await createClient()
  let baseSlug = slugify(name)
  let slug = baseSlug
  let counter = 1
  let isUnique = false

  while (!isUnique) {
    let query = supabase.from('categories').select('id').eq('slug', slug)
    if (currentId) query = query.neq('id', currentId)
    const { data } = await query.maybeSingle()
    
    if (!data) {
      isUnique = true
    } else {
      slug = `${baseSlug}-${counter}`
      counter++
    }
  }
  return slug
}

function revalidateCategoryPaths() {
  revalidatePath('/admin/categories')
  revalidatePath('/')
  revalidatePath('/categories')
  revalidatePath('/category', 'layout')
  revalidatePath('/sitemap.xml')
}

export async function createCategory(formData: FormData) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    image: (formData.get('image') as string) || undefined,
    status: (formData.get('status') as string) || 'active',
    sort_order: formData.get('sort_order') || 0,
  }
  const parsed = CategorySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  // Check duplicate
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('name', parsed.data.name)
    .maybeSingle()
  if (existing) return { error: 'A category with this name already exists.' }

  const slug = await generateUniqueCategorySlug(parsed.data.name)
  const { data: category, error } = await supabase.from('categories').insert({
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    image: parsed.data.image || null,
    status: parsed.data.status,
    sort_order: parsed.data.sort_order,
  }).select().single()
  
  if (error) return { error: error.message }

  await logActivity('CATEGORY_CREATED', 'category', category.id, `Created category "${category.name}"`)

  revalidateCategoryPaths()
  return { success: true }
}

export async function updateCategory(id: string, formData: FormData) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const raw = {
    name: formData.get('name') as string,
    description: (formData.get('description') as string) || undefined,
    image: (formData.get('image') as string) || undefined,
    status: (formData.get('status') as string) || 'active',
    sort_order: formData.get('sort_order') || 0,
  }
  const parsed = CategorySchema.safeParse(raw)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const slug = await generateUniqueCategorySlug(parsed.data.name, id)
  const { error } = await supabase.from('categories').update({
    name: parsed.data.name,
    slug,
    description: parsed.data.description || null,
    image: parsed.data.image || null,
    status: parsed.data.status,
    sort_order: parsed.data.sort_order,
  }).eq('id', id)
  if (error) return { error: error.message }

  await logActivity('CATEGORY_UPDATED', 'category', id, `Updated category "${parsed.data.name}"`)

  revalidateCategoryPaths()
  return { success: true }
}

export async function deleteCategory(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  
  const { data: category } = await supabase.from('categories').select('name').eq('id', id).single()

  // Check products assigned to this category
  const { count } = await supabase
    .from('products')
    .select('*', { count: 'exact', head: true })
    .eq('category_id', id)
  if ((count ?? 0) > 0) {
    return { error: `This category contains products. Move the products to another category before deleting.` }
  }
  
  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }

  if (category) {
    await logActivity('CATEGORY_DELETED', 'category', id, `Deleted category "${category.name}"`)
  }

  revalidateCategoryPaths()
  return { success: true }
}

export async function toggleCategoryStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('categories').update({ status: newStatus }).eq('id', id)
  if (error) return { error: error.message }

  await logActivity('CATEGORY_UPDATED', 'category', id, `Changed category status to ${newStatus}`)

  revalidateCategoryPaths()
  return { success: true }
}
