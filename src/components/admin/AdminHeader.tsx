import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import AdminMobileNavToggle from './AdminMobileNavToggle'

interface AdminHeaderProps {
  showAddProduct?: boolean
}

export default async function AdminHeader({ showAddProduct = true }: AdminHeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.full_name || "Baby's Bazaar"

  return (
    <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-3.5 sm:py-5 bg-white border-b border-[#F0EDF5]/70 sticky top-0 z-30">
      <div className="flex items-center gap-2 min-w-0">
        <AdminMobileNavToggle />
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg lg:text-[22px] font-bold text-[#1C1C1E] tracking-tight truncate">
            Welcome to Baby&apos;s Bazaar
          </h1>
          <p className="text-[11px] sm:text-[12px] text-[#777777] mt-0.5 hidden sm:block truncate">
            Manage your Baby&apos;s Bazaar website content from one place.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 sm:gap-5 shrink-0">
        {showAddProduct && (
          <Link
            href="/admin/products/new"
            className="flex items-center gap-1.5 sm:gap-2 bg-[#E52D68] hover:bg-[#D4225A] active:scale-[0.98] text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl shadow-xs transition-all duration-150"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span className="hidden xs:inline sm:inline">Add product</span>
          </Link>
        )}

        {/* Admin Profile */}
        <div className="flex items-center gap-2 sm:gap-3 pl-2 sm:pl-3 border-l border-gray-100">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-pink-100 text-[#E52D68] font-bold text-xs sm:text-sm flex items-center justify-center ring-2 ring-pink-100 flex-shrink-0 shadow-2xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight text-left hidden md:block">
            <div className="text-[13px] font-semibold text-[#252525] truncate max-w-[120px] lg:max-w-[140px]">
              {displayName}
            </div>
            <div className="text-[11px] text-[#888888] font-medium">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  )
}
