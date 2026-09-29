import { MetadataRoute } from 'next'
import { createClient } from '@supabase/supabase-js'
import { getSiteUrl } from '@/lib/seo'

export const revalidate = 3600 // Cache sitemap for 1 hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const now = new Date()

  // Base public pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/categories`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/about-us`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.6,
    },
  ]

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return staticRoutes
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    // Concurrently fetch active categories and active products
    const [categoriesRes, productsRes] = await Promise.allSettled([
      supabase
        .from('categories')
        .select('slug, updated_at, created_at')
        .eq('status', 'active'),
      supabase
        .from('products')
        .select('slug, updated_at, created_at')
        .eq('status', 'active'),
    ])

    const categoryRoutes: MetadataRoute.Sitemap =
      categoriesRes.status === 'fulfilled' && categoriesRes.value.data
        ? categoriesRes.value.data
            .filter((c) => Boolean(c.slug))
            .map((c) => ({
              url: `${siteUrl}/category/${c.slug}`,
              lastModified: c.updated_at ? new Date(c.updated_at) : (c.created_at ? new Date(c.created_at) : now),
              changeFrequency: 'weekly',
              priority: 0.8,
            }))
        : []

    const productRoutes: MetadataRoute.Sitemap =
      productsRes.status === 'fulfilled' && productsRes.value.data
        ? productsRes.value.data
            .filter((p) => Boolean(p.slug))
            .map((p) => ({
              url: `${siteUrl}/product/${p.slug}`,
              lastModified: p.updated_at ? new Date(p.updated_at) : (p.created_at ? new Date(p.created_at) : now),
              changeFrequency: 'weekly',
              priority: 0.7,
            }))
        : []

    return [...staticRoutes, ...categoryRoutes, ...productRoutes]
  } catch (error) {
    console.error('[Sitemap] Error generating dynamic sitemap:', error)
    return staticRoutes
  }
}
