'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { slugify } from '@/lib/utils'
import { z } from 'zod'
import { Category } from '@/types/database.types'

const ToySubcategorySchema = z.object({
  name: z.string().min(1, 'Subcategory name is required'),
  slug: z.string().optional(),
  description: z.string().optional().nullable(),
  image: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
  sort_order: z.coerce.number().default(0),
})


// Get main Toys category record
export async function getToysMainCategory(): Promise<Category | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', 'toys')
    .maybeSingle()
  return data
}

// Get all Toy subcategories with live product counts
export async function getToySubcategories(includeInactive = false): Promise<Category[]> {
  const supabase = await createClient()
  
  // 1. Fetch main toys category
  const mainToys = await getToysMainCategory()
  const mainToysId = mainToys?.id

  // 2. Query categories table
  let query = supabase
    .from('categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (!includeInactive) {
    query = query.eq('status', 'active')
  }

  const { data: allCategories, error } = await query
  if (error || !allCategories) return []

  // 3. Filter for toy subcategories (using parent_id or description tag [parent:toys])
  const toySubcategories = allCategories.filter((cat) => {
    // Exclude the parent Toys category itself
    if (cat.slug === 'toys') return false

    // Match if parent_id is Toys ID
    if (mainToysId && (cat as any).parent_id === mainToysId) return true

    // Match if description includes [parent:toys]
    if (cat.description && cat.description.toLowerCase().includes('[parent:toys]')) return true

    // Match well-known standard toy slugs if parent tag wasn't attached
    const standardToySlugs = [
      'baby-toys',
      'educational-toys',
      'remote-control-toys',
      'cars-and-vehicles',
      'dolls-and-pretend-play',
      'building-toys',
      'musical-toys',
      'outdoor-toys',
      'soft-toys',
      'activity-and-puzzle',
      'ride-on-toys',
    ]
    return standardToySlugs.includes(cat.slug)
  })

  // 4. Fetch product counts for each subcategory
  const subcategoryIds = toySubcategories.map((c) => c.id)
  let countMap: Record<string, number> = {}

  if (subcategoryIds.length > 0) {
    const { data: prodData } = await supabase
      .from('products')
      .select('category_id')
      .in('category_id', subcategoryIds)
      .eq('status', 'active')

    if (prodData) {
      for (const row of prodData) {
        if (row.category_id) {
          countMap[row.category_id] = (countMap[row.category_id] || 0) + 1
        }
      }
    }
  }

  return toySubcategories.map((cat) => ({
    ...cat,
    product_count: countMap[cat.id] || 0,
  }))
}

// Get single toy subcategory by slug
export async function getToySubcategoryBySlug(slug: string): Promise<Category | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error || !data) return null
  return data
}

// Fetch products for a toy subcategory
export async function getToySubcategoryProducts(categoryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), images:product_images(*)')
    .eq('category_id', categoryId)
    .eq('status', 'active')
    .order('created_at', { ascending: false })

  if (error) return []
  return data || []
}

// Fetch all toy products (across all toy subcategories + main toys category)
export async function getAllToyProducts(limit = 40) {
  const supabase = await createClient()
  const toySubcategories = await getToySubcategories(false)
  const mainToys = await getToysMainCategory()

  const allCategoryIds = [
    ...(mainToys ? [mainToys.id] : []),
    ...toySubcategories.map((c) => c.id),
  ]

  if (allCategoryIds.length === 0) return []

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), images:product_images(*)')
    .in('category_id', allCategoryIds)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) return []
  return data || []
}

// Create new Toy Subcategory
export async function createToySubcategory(formData: FormData) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const userDesc = (formData.get('description') as string)?.trim() || ''
  const image = (formData.get('image') as string) || null
  const status = ((formData.get('status') as string) || 'active') as 'active' | 'inactive'
  const sortOrder = Number(formData.get('sort_order')) || 0

  if (!name) return { error: 'Subcategory name is required' }

  const slug = customSlug ? slugify(customSlug) : slugify(name)
  const descriptionWithParent = `[parent:toys] ${userDesc}`

  // Check duplicate slug
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .maybeSingle()

  if (existing) {
    return { error: 'A category or subcategory with this slug already exists' }
  }

  // Get main toys category ID
  const mainToys = await getToysMainCategory()

  const payload: any = {
    name,
    slug,
    description: descriptionWithParent,
    image,
    status,
    sort_order: sortOrder,
  }

  if (mainToys?.id) {
    payload.parent_id = mainToys.id
  }

  // Attempt insert (with parent_id fallback if column doesn't exist yet)
  let { data, error } = await supabase.from('categories').insert(payload).select().single()

  if (error && error.message?.includes('parent_id')) {
    delete payload.parent_id
    const retry = await supabase.from('categories').insert(payload).select().single()
    data = retry.data
    error = retry.error
  }

  if (error) return { error: error.message }

  revalidateToyPaths(slug)
  return { success: true, data }
}

// Update existing Toy Subcategory
export async function updateToySubcategory(id: string, formData: FormData) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const name = (formData.get('name') as string)?.trim()
  const customSlug = (formData.get('slug') as string)?.trim()
  const userDesc = (formData.get('description') as string)?.trim() || ''
  const image = (formData.get('image') as string) || null
  const status = ((formData.get('status') as string) || 'active') as 'active' | 'inactive'
  const sortOrder = Number(formData.get('sort_order')) || 0

  if (!name) return { error: 'Subcategory name is required' }

  const slug = customSlug ? slugify(customSlug) : slugify(name)
  const descriptionWithParent = `[parent:toys] ${userDesc}`

  // Check duplicate slug for other categories
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('slug', slug)
    .neq('id', id)
    .maybeSingle()

  if (existing) {
    return { error: 'Another category is already using this slug' }
  }

  const mainToys = await getToysMainCategory()

  const payload: any = {
    name,
    slug,
    description: descriptionWithParent,
    image,
    status,
    sort_order: sortOrder,
    updated_at: new Date().toISOString(),
  }

  if (mainToys?.id) {
    payload.parent_id = mainToys.id
  }

  let { error } = await supabase.from('categories').update(payload).eq('id', id)

  if (error && error.message?.includes('parent_id')) {
    delete payload.parent_id
    const retry = await supabase.from('categories').update(payload).eq('id', id)
    error = retry.error
  }

  if (error) return { error: error.message }

  revalidateToyPaths(slug)
  return { success: true }
}

// Delete Toy Subcategory
export async function deleteToySubcategory(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()

  // First fetch slug for path revalidation
  const { data: cat } = await supabase.from('categories').select('slug').eq('id', id).single()

  const { error } = await supabase.from('categories').delete().eq('id', id)
  if (error) return { error: error.message }

  revalidateToyPaths(cat?.slug)
  return { success: true }
}

// Toggle subcategory active status
export async function toggleToySubcategoryStatus(id: string, currentStatus: 'active' | 'inactive') {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const nextStatus = currentStatus === 'active' ? 'inactive' : 'active'

  const { error } = await supabase
    .from('categories')
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  revalidateToyPaths()
  return { success: true, status: nextStatus }
}

// Revalidate all related toy paths
function revalidateToyPaths(slug?: string) {
  revalidatePath('/toys')
  if (slug) revalidatePath(`/toys/${slug}`)
  revalidatePath('/category/toys')
  revalidatePath('/admin/categories')
  revalidatePath('/admin/categories/toys')
  revalidatePath('/sitemap.xml')
}
