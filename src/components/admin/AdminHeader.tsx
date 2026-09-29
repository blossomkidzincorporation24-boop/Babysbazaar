import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Plus } from 'lucide-react'
import Image from 'next/image'

interface AdminHeaderProps {
  showAddProduct?: boolean
}

export default async function AdminHeader({ showAddProduct = true }: AdminHeaderProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const displayName = user?.user_metadata?.full_name || 'Vinoth'

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-white border-b border-[#F0EDF5]/70 sticky top-0 z-30">
      <div>
        <h1 className="text-[22px] font-bold text-[#1C1C1E] tracking-tight">
          Welcome back, {displayName}!
        </h1>
        <p className="text-[12px] text-[#777777] mt-0.5">
          Manage your Baby&apos;s Bazaar website content from one place.
        </p>
      </div>

      <div className="flex items-center gap-5">
        {showAddProduct && (
          <Link
            href="/admin/products/new"
            className="flex items-center gap-2 bg-[#E52D68] hover:bg-[#D4225A] active:scale-[0.98] text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-xs transition-all duration-150"
          >
            <Plus size={16} strokeWidth={2.5} />
            <span>Add product</span>
          </Link>
        )}

        {/* Admin Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-gray-100">
          <div className="w-9 h-9 rounded-full bg-pink-100 text-[#E52D68] font-bold text-sm flex items-center justify-center ring-2 ring-pink-100 flex-shrink-0 shadow-2xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="leading-tight text-left">
            <div className="text-[13px] font-semibold text-[#252525] truncate max-w-[140px]">
              {displayName}
            </div>
            <div className="text-[11px] text-[#888888] font-medium">Administrator</div>
          </div>
        </div>
      </div>
    </header>
  )
}
