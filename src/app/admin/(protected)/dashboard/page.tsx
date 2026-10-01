export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import DashboardView from '@/components/admin/DashboardView'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [productsRes, categoriesRes, bannersRes, photosRes] = await Promise.allSettled([
    supabase
      .from('products')
      .select('*, categories(id, name, slug)')
      .order('created_at', { ascending: false }),
    supabase
      .from('categories')
      .select('*')
      .order('name', { ascending: true }),
    supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true }),
    supabase
      .from('photos')
      .select('*')
      .order('created_at', { ascending: false }),
  ])

  const products = productsRes.status === 'fulfilled' ? productsRes.value.data || [] : []
  const categories = categoriesRes.status === 'fulfilled' ? categoriesRes.value.data || [] : []
  const banners = bannersRes.status === 'fulfilled' ? bannersRes.value.data || [] : []
  const photos = photosRes.status === 'fulfilled' ? photosRes.value.data || [] : []

  return (
    <DashboardView
      products={products as any}
      categories={categories}
      banners={banners}
      photos={photos}
    />
  )
}
