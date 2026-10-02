export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'
import { AdminNavProvider } from '@/components/admin/AdminNavContext'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  return (
    <AdminNavProvider>
      <div className="flex min-h-screen bg-[#FAF9FA]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col ml-0 lg:ml-[240px] min-w-0 transition-all duration-300">
          <AdminHeader />
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </AdminNavProvider>
  )
}
