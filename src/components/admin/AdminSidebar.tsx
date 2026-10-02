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
  Settings,
  Database,
  LogOut,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import BabyBazaarLogo from './BabyBazaarLogo'
import { useAdminNav } from './AdminNavContext'

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
  { href: '/admin/storage', label: 'Storage & Backup', icon: Database },
  { href: '/admin/settings', label: 'Settings', icon: Settings },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { sidebarOpen, closeSidebar } = useAdminNav()

  async function handleLogout() {
    closeSidebar()
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <>
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          onClick={closeSidebar}
          aria-hidden="true"
          className="fixed inset-0 bg-black/50 backdrop-blur-xs z-40 lg:hidden transition-opacity duration-300 animate-in fade-in"
        />
      )}

      <aside
        className={cn(
          'w-[240px] h-full min-h-screen bg-[#FCE8EF] flex flex-col justify-between py-5 sm:py-6 px-4 fixed top-0 left-0 z-50 border-r border-[#F8E3EC]/70 select-none transition-transform duration-300 ease-in-out overflow-y-auto',
          sidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div>
          {/* Logo & Close Button */}
          <div className="flex items-center justify-between px-2 pt-1 pb-6 sm:pb-8">
            <Link
              href="/admin/dashboard"
              onClick={closeSidebar}
              className="block hover:opacity-95 transition-opacity"
            >
              <BabyBazaarLogo className="h-9 sm:h-10" width={140} height={55} />
            </Link>
            <button
              type="button"
              onClick={closeSidebar}
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-white/60 lg:hidden cursor-pointer"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 sm:space-y-1.5">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || (href !== '/admin/dashboard' && pathname.startsWith(href))
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closeSidebar}
                  className={cn(
                    'flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] font-medium transition-all duration-150',
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
        <div className="pt-4 mt-6 border-t border-[#F5DCE6]/60">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-[13px] font-medium text-[#6A6A6A] hover:bg-white/60 hover:text-[#E52D68] transition-colors w-full text-left cursor-pointer"
          >
            <LogOut size={18} className="text-[#888888] stroke-[1.8]" />
            <span>Log out</span>
          </button>
        </div>
      </aside>
    </>
  )
}
