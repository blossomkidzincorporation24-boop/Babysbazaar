export const dynamic = 'force-dynamic'

import { getStorageMetrics, getStorageAnalysis } from '@/lib/actions/storage'
import StorageClient from './StorageClient'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function StoragePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  const metrics = await getStorageMetrics()
  const analysis = await getStorageAnalysis()

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1C1C1E] mb-6">Storage & Backup Management</h1>
      <StorageClient 
        metrics={metrics} 
        analysis={analysis} 
      />
    </div>
  )
}
