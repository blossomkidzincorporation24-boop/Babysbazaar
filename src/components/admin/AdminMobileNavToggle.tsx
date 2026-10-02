'use client'

import { Menu } from 'lucide-react'
import { useAdminNav } from './AdminNavContext'

export default function AdminMobileNavToggle() {
  const { toggleSidebar } = useAdminNav()

  return (
    <button
      type="button"
      onClick={toggleSidebar}
      className="p-2 -ml-2 mr-1 rounded-xl text-gray-700 hover:text-[#E52D68] hover:bg-pink-50 lg:hidden cursor-pointer transition-colors"
      aria-label="Toggle navigation menu"
    >
      <Menu size={22} />
    </button>
  )
}
