export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import DashboardView from '@/components/admin/DashboardView'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [
    { data: products },
    { data: categories },
    { data: banners },
    { data: photos },
  ] = await Promise.all([
      supabase
        .from('products')
        .select('*, categories(id, name, slug)')
        .order('created_at', { ascending: false })
        .limit(20),
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

  return (
    <DashboardView
      products={(products as any) || []}
      categories={categories || []}
      banners={banners || []}
      photos={photos || []}
    />
  )
}
