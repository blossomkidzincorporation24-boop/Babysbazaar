'use client'

import { useState, useTransition } from 'react'
import { HardDrive, AlertTriangle, CheckCircle2, Trash2, ShieldAlert, ShieldCheck, Database, Cloud } from 'lucide-react'
import { deleteR2FileSafe } from '@/lib/actions/storage'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface StorageClientProps {
  metrics: any
  analysis: any
}

function formatBytes(bytes: number, decimals = 2) {
  if (!+bytes) return '0 Bytes'
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export default function StorageClient({ metrics, analysis }: StorageClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const isR2Ready = analysis?.isR2Configured && !metrics?.error
  const usageBytes = metrics?.usageBytes || 0
  const limitBytes = metrics?.limitBytes || 7 * 1024 * 1024 * 1024
  const usagePercentage = Math.min((usageBytes / limitBytes) * 100, 100)
  
  // Determine safety color
  let barColor = 'bg-[#0EA77B]' // Green
  let statusText = 'Normal'
  let Icon = ShieldCheck
  let iconColor = 'text-[#0EA77B]'

  const gigabytes = usageBytes / (1024 * 1024 * 1024)
  if (gigabytes >= 7) {
    barColor = 'bg-red-500'
    statusText = 'Limit Reached - Uploads Blocked'
    Icon = ShieldAlert
    iconColor = 'text-red-500'
  } else if (gigabytes >= 6) {
    barColor = 'bg-orange-500'
    statusText = 'Critical Warning (Near 7GB)'
    Icon = AlertTriangle
    iconColor = 'text-orange-500'
  } else if (gigabytes >= 5) {
    barColor = 'bg-yellow-400'
    statusText = 'Warning (Over 5GB)'
    Icon = AlertTriangle
    iconColor = 'text-yellow-500'
  }

  const handleCleanOrphan = (key: string) => {
    startTransition(async () => {
      const res = await deleteR2FileSafe(key)
      if (res.error) {
        toast.error(res.error)
      } else {
        toast.success('Orphan file deleted')
        router.refresh()
      }
    })
  }

  return (
    <div className="space-y-6">
      {!isR2Ready && (
        <div className="bg-[#FFF8E6] border border-[#FFE8A3] rounded-2xl p-4 flex items-center justify-between text-xs text-[#8A6700]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle size={18} className="text-[#D99B00] shrink-0" />
            <div>
              <span className="font-bold">Cloudflare R2 in Setup Mode:</span> Add your live Cloudflare credentials to <code className="bg-white/80 px-1.5 py-0.5 rounded border border-[#E8D499]">.env.local</code> to activate real-time bucket syncing.
            </div>
          </div>
          <span className="font-semibold px-2 py-1 bg-white/60 rounded-md">Safety Limit Active</span>
        </div>
      )}

      {/* 1. Storage Safety Bar */}
      <div className="bg-white rounded-2xl border border-[#F0EDF5] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Cloud size={24} className={iconColor} />
            <div>
              <h2 className="text-base font-bold text-[#1C1C1E]">Cloudflare R2 Media Storage</h2>
              <p className="text-sm text-gray-500 font-medium">Safety Limit: {formatBytes(limitBytes)}</p>
            </div>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${barColor.replace('bg-', 'bg-').replace('500', '100')} ${iconColor}`}>
            <Icon size={14} />
            {statusText}
          </div>
        </div>

        <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
          <div className={`h-3 rounded-full transition-all duration-500 ${barColor}`} style={{ width: `${usagePercentage}%` }}></div>
        </div>
        <div className="flex justify-between text-xs font-bold text-gray-600">
          <span>{formatBytes(usageBytes)} Used</span>
          <span>{usagePercentage.toFixed(1)}% of 7 GB</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. Database Status */}
        <div className="bg-white rounded-2xl border border-[#F0EDF5] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-4">
            <Database size={24} className="text-[#6E56CF]" />
            <h2 className="text-base font-bold text-[#1C1C1E]">Supabase Database</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Status</span>
              <span className="font-bold text-[#0EA77B] flex items-center gap-1"><CheckCircle2 size={14}/> Active</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Tracked Media Files</span>
              <span className="font-bold text-gray-800">{analysis.referencedCount || 0}</span>
            </div>
          </div>
        </div>

        {/* 3. Backup Status */}
        <div className="bg-white rounded-2xl border border-[#F0EDF5] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3 mb-4">
            <HardDrive size={24} className="text-[#D92F68]" />
            <h2 className="text-base font-bold text-[#1C1C1E]">Google Drive Backup</h2>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Last Database Backup</span>
              <span className="font-bold text-gray-400">Not configured yet</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-50">
              <span className="text-gray-500">Last Media Backup</span>
              <span className="font-bold text-gray-400">Not configured yet</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Orphan Files Tracker */}
      <div className="bg-white rounded-2xl border border-[#F0EDF5] shadow-[0_2px_12px_rgba(0,0,0,0.02)] overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-[#1C1C1E]">Orphan File Tracker</h2>
            <p className="text-xs text-gray-500 mt-1">Files existing in R2 that are no longer linked to any product or category.</p>
          </div>
          <div className="bg-orange-50 text-orange-600 font-bold px-3 py-1.5 rounded-lg text-sm border border-orange-100">
            {analysis.orphanCount || 0} orphans found
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider font-semibold border-b border-gray-100">
                <th className="px-6 py-3">File Key</th>
                <th className="px-6 py-3">Size</th>
                <th className="px-6 py-3">Last Modified</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(!analysis.orphans || analysis.orphans.length === 0) ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-400">
                    <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400 opacity-50" />
                    No orphan files found. Your storage is perfectly clean.
                  </td>
                </tr>
              ) : (
                analysis.orphans.map((file: any) => (
                  <tr key={file.key} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium text-gray-800 text-xs break-all max-w-xs">{file.key}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{formatBytes(file.size)}</td>
                    <td className="px-6 py-3 text-gray-500 text-xs">{new Date(file.lastModified).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-right">
                      <ConfirmDelete 
                        onConfirm={async () => handleCleanOrphan(file.key)}
                        itemName="this orphan file"
                        className="text-red-500 hover:bg-red-50 p-1.5 rounded transition-colors inline-flex items-center"
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  )
}
