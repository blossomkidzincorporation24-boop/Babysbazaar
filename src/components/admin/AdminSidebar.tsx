'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Package,
  Truck,
  Camera,
  Film,
  Image as ImageIcon,
  Tag,
  Sparkles,
  FolderArchive,
  ClipboardCheck,
  Settings,
  Database,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BabyBazaarLogo from './BabyBazaarLogo'

const navItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { href: '/admin/products', label: 'Product management', icon: Package },
  { href: '/admin/categories', label: 'Category Management', icon: Truck },
  { href: '/admin/banners', label: 'Hero Banners', icon: ImageIcon },
  { href: '/admin/offers', label: 'Offer Banners', icon: Tag },
  { href: '/admin/delivery', label: 'Delivery & Badges', icon: Sparkles },
  { href: '/admin/reels', label: 'Reels / Videos', icon: Film },
  { href: '/admin/media', label: 'Media Library', icon: FolderArchive },
  { href: '/admin/photos', label: 'Photos', icon: Camera },
  { href: '/admin/work-reports', label: 'Work Reports', icon: ClipboardCheck },
  { href: '/admin/storage', label: 'Storage & Backup', icon: Database },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside className="w-[230px] min-h-screen bg-[#FCE8EF] flex flex-col justify-between py-6 px-4 fixed top-0 left-0 z-40 border-r border-[#F8E3EC]/70 select-none">
      <div>
        {/* Logo */}
        <div className="px-2 pt-1 pb-8">
          <Link href="/admin/dashboard" className="block hover:opacity-95 transition-opacity">
            <BabyBazaarLogo className="h-10" width={150} height={60} />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="space-y-1.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
                  isActive
                    ? 'bg-white text-[#252525] font-semibold shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-white'
                    : 'text-[#5A5A5A] hover:bg-white/50 hover:text-[#252525]'
                )}
              >
                <Icon
                  size={18}
                  className={cn(
                    'transition-colors flex-shrink-0',
                    isActive ? 'text-[#252525] stroke-[2.2]' : 'text-[#7A7A7A] stroke-[1.8]'
                  )}
                />
                <span className="truncate">{label}</span>
              </Link>
            )
          })}
        </nav>
      </div>

      {/* Bottom Logout */}
      <div className="pt-4 border-t border-[#F5DCE6]/60">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[#6A6A6A] hover:bg-white/60 hover:text-[#E52D68] transition-colors w-full text-left"
        >
          <LogOut size={18} className="text-[#888888] stroke-[1.8]" />
          <span>Log out</span>
        </button>
      </div>
    </aside>
  )
}
