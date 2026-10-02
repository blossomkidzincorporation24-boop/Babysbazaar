'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Settings as SettingsIcon, Lock, LogOut, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { updateSettings, updatePassword } from '@/lib/actions/settings'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Settings } from '@/types/database.types'

interface Props { initialSettings: Settings | null }

export default function SettingsClient({ initialSettings }: Props) {
  const router = useRouter()
  const supabase = createClient()
  const [pendingInfo, startInfo] = useTransition()
  const [pendingPwd, startPwd] = useTransition()

  // Store Info
  const [storeName, setStoreName] = useState(initialSettings?.store_name ?? '')
  const [whatsapp, setWhatsapp] = useState(initialSettings?.whatsapp_number ?? '')
  const [phone, setPhone] = useState(initialSettings?.phone ?? '')
  const [email, setEmail] = useState(initialSettings?.email ?? '')
  const [address, setAddress] = useState(initialSettings?.address ?? '')

  // Password
  const [currentPwd, setCurrentPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')

  function handleSaveInfo(e: React.FormEvent) {
    e.preventDefault()
    startInfo(async () => {
      const result = await updateSettings({ store_name: storeName, whatsapp_number: whatsapp, phone, email, address })
      if (result?.error) toast.error(result.error)
      else toast.success('Settings saved!')
    })
  }

  function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()
    startPwd(async () => {
      const result = await updatePassword(currentPwd, newPwd, confirmPwd)
      if (result?.error) toast.error(result.error)
      else { toast.success('Password changed!'); setCurrentPwd(''); setNewPwd(''); setConfirmPwd('') }
    })
  }

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage essential store, contact and account information.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Store Information */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <SettingsIcon size={18} className="text-gray-400" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Store information</h2>
                <p className="text-xs text-gray-400">Basic data is used for Baby&apos;s Bazaar</p>
              </div>
            </div>
            <form onSubmit={handleSaveInfo} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Store name</label>
                  <input value={storeName} onChange={e => setStoreName(e.target.value)} placeholder="Baby's Bazaar" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp number</label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact information</label>
                <input value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@babysbazaar.in" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2" />
                <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 98765 43210" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2" />
                <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Store address" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={pendingInfo} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg">
                  {pendingInfo ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : 'Save information'}
                </button>
              </div>
            </form>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={18} className="text-gray-400" />
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Change password</h2>
                <p className="text-xs text-gray-400">Enter a secure password for your admin account</p>
              </div>
            </div>
            <form onSubmit={handleChangePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
                <input type="password" value={currentPwd} onChange={e => setCurrentPwd(e.target.value)} placeholder="••••••••••••" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
                  <input type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} placeholder="Enter new password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
                  <input type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} placeholder="Repeat new password" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
                </div>
              </div>
              <div className="flex justify-end pt-1">
                <button type="submit" disabled={pendingPwd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium px-5 py-2.5 rounded-lg">
                  {pendingPwd ? <><Loader2 size={14} className="animate-spin" /> Updating…</> : 'Update password'}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right column — Image Guide & Logout */}
        <div className="space-y-6">
          {/* Image Guidelines Quick Card */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center font-bold">
                <ImageIcon size={16} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Image Size Guide</h3>
                <p className="text-xs text-gray-400">Dimensions & format specs</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 mb-4 leading-relaxed">
              Find recommended pixel dimensions, aspect ratios, and file guidelines for products, banners, categories, and reels.
            </p>

            <Link
              href="/admin/settings/image-guidelines"
              className="w-full flex items-center justify-center gap-2 bg-[#FAF9FA] hover:bg-[#FCE8EF] text-[#202124] hover:text-[#E52D68] border border-[#ECE8EA] text-xs font-semibold py-2.5 rounded-lg transition-colors"
            >
              <span>View Image Guidelines</span>
              <ExternalLink size={13} />
            </Link>
          </div>

          {/* Logout */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <LogOut size={20} className="text-gray-500" />
            </div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">Log out of admin</h3>
            <p className="text-xs text-gray-400 mb-4">You&apos;ll return to the secure Baby&apos;s Bazaar login screen.</p>
            <button onClick={handleLogout} className="w-full border border-gray-200 text-gray-700 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
              Log out
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
