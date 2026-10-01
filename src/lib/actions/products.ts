'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logActivity } from './logs'
import { slugify } from '@/lib/utils'

export type ImagePayload = {
  url: string
  alt_text?: string
  is_primary?: boolean
}

const ProductSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required'),
  short_description: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, 'Price must be a valid number'),
  category_id: z.string().min(1, 'Category is required'),
  video_url: z.string().optional().nullable(),
  best_seller: z.boolean().default(false),
  new_arrival: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(['active', 'inactive']).default('active'),
  sort_order: z.number().default(0),
  // Kept for backward compatibility during migration
  product_images: z.array(z.string()).min(1, 'At least one product image is required'), 
})

export async function getProducts(page: number = 1, limit: number = 20) {
  const supabase = await createClient()
  const from = (page - 1) * limit
  const to = from + limit - 1
  
  const { data, count, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), images:product_images(*)', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)
    
  if (error) throw new Error(error.message)
  return { products: data, totalCount: count || 0 }
}

export async function getProductBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), images:product_images(*)')
    .eq('slug', slug)
    .single()
  if (error) throw new Error(error.message)
  return data
}

export async function getProduct(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name, slug), images:product_images(*)')
    .eq('id', id)
    .single()
  if (error) throw new Error(error.message)
  return data
}

// Ensure unique slug
async function generateUniqueSlug(title: string, currentId?: string) {
  const supabase = await createClient()
  let baseSlug = slugify(title)
  let slug = baseSlug
  let counter = 1
  let isUnique = false

  while (!isUnique) {
    let query = supabase.from('products').select('id').eq('slug', slug)
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

function revalidateProductPaths(slug?: string) {
  try {
    revalidatePath('/', 'layout')
    revalidatePath('/admin/products')
    revalidatePath('/admin/dashboard')
    revalidatePath('/')
    revalidatePath('/categories')
    revalidatePath('/toys')
    if (slug) {
      revalidatePath(`/product/${slug}`)
    }
    revalidatePath('/sitemap.xml')
  } catch (e) {
    console.error('Revalidation error:', e)
  }
}

export async function createProduct(payload: any, images: ImagePayload[]) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  
  // Auto-generate unique slug
  payload.slug = await generateUniqueSlug(payload.title)
  
  const parsed = ProductSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  // Insert product
  const { data: product, error } = await supabase.from('products').insert(parsed.data).select().single()
  if (error) return { error: error.message }

  // Insert relational images
  if (images && images.length > 0) {
    const imageRecords = images.map((img, idx) => ({
      product_id: product.id,
      image_url: img.url,
      alt_text: img.alt_text || null,
      sort_order: idx,
      is_primary: img.is_primary || (idx === 0)
    }))
    const { error: imgError } = await supabase.from('product_images').insert(imageRecords)
    if (imgError) console.error('Failed to insert images:', imgError)
  }

  await logActivity('PRODUCT_CREATED', 'product', product.id, `Created product "${product.title}"`)

  revalidateProductPaths(product.slug)
  return { success: true, id: product.id, slug: product.slug }
}

export async function updateProduct(id: string, payload: any, images: ImagePayload[]) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  
  if (!payload.slug) {
    payload.slug = await generateUniqueSlug(payload.title, id)
  }

  const parsed = ProductSchema.safeParse(payload)
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Validation error' }

  const { error } = await supabase.from('products').update(parsed.data).eq('id', id)
  if (error) return { error: error.message }

  // Update relational images: first delete existing for this product, then insert new.
  if (images && images.length > 0) {
    await supabase.from('product_images').delete().eq('product_id', id)
    
    const imageRecords = images.map((img, idx) => ({
      product_id: id,
      image_url: img.url,
      alt_text: img.alt_text || null,
      sort_order: idx,
      is_primary: img.is_primary || (idx === 0)
    }))
    const { error: imgError } = await supabase.from('product_images').insert(imageRecords)
    if (imgError) console.error('Failed to update images:', imgError)
  }

  await logActivity('PRODUCT_UPDATED', 'product', id, `Updated product "${payload.title}"`)

  revalidateProductPaths(payload.slug)
  return { success: true }
}

export async function deleteProduct(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  
  // Get product for logging
  const { data: product } = await supabase.from('products').select('title').eq('id', id).single()

  const { error } = await supabase.from('products').delete().eq('id', id)
  if (error) return { error: error.message }

  if (product) {
    await logActivity('PRODUCT_DELETED', 'product', id, `Deleted product "${product.title}"`)
  }

  revalidateProductPaths()
  return { success: true }
}

export async function toggleProductStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const { error } = await supabase.from('products').update({ status: newStatus }).eq('id', id)
  if (error) return { error: error.message }
  
  await logActivity('PRODUCT_UPDATED', 'product', id, `Changed product status to ${newStatus}`)
  
  revalidateProductPaths()
  return { success: true }
}
