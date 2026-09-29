'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Upload, Search, Copy, Check, Trash2, Film, Image as ImageIcon, Filter, ExternalLink, FolderArchive } from 'lucide-react'
import { MediaAsset } from '@/types/database.types'
import { createMediaAsset, deleteMediaAsset } from '@/lib/actions/media'
import { uploadFile, validateImageFile, validateVideoFile } from '@/lib/upload'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface Props {
  initialAssets: MediaAsset[]
}

export default function MediaClient({ initialAssets }: Props) {
  const [assets, setAssets] = useState<MediaAsset[]>(initialAssets)
  const [filterType, setFilterType] = useState<'all' | 'image' | 'video'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const isVideo = file.type.startsWith('video/')
    const err = isVideo ? validateVideoFile(file) : validateImageFile(file)
    if (err) {
      toast.error(err)
      return
    }

    setUploading(true)
    const bucket = isVideo ? 'reels' : 'banners'
    const result = await uploadFile(file, bucket)
    setUploading(false)

    if ('error' in result) {
      toast.error(result.error)
      return
    }

    startTransition(async () => {
      const res = await createMediaAsset({
        name: file.name,
        file_url: result.url,
        file_type: isVideo ? 'video' : 'image',
        file_size: file.size,
        bucket,
      })

      if (res?.error) {
        toast.error(res.error)
        return
      }

      toast.success('Media asset uploaded!')
      window.location.reload()
    })
  }

  function handleCopy(url: string, id: string) {
    navigator.clipboard.writeText(url)
    setCopiedId(id)
    toast.success('URL copied to clipboard!')
    setTimeout(() => setCopiedId(null), 2000)
  }

  async function handleDelete(id: string) {
    const res = await deleteMediaAsset(id)
    if (res?.error) {
      toast.error(res.error)
    } else {
      toast.success('Media asset removed')
      setAssets((prev) => prev.filter((a) => a.id !== id))
    }
  }

  const filteredAssets = assets.filter((asset) => {
    if (filterType !== 'all' && asset.file_type !== filterType) return false
    if (searchQuery.trim() && !asset.name.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  function formatBytes(bytes: number) {
    if (!bytes) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Media Library</h1>
          <p className="text-sm text-gray-500 mt-1">
            Centralized repository for high-resolution images, banners, and video assets across your store.
          </p>
        </div>

        {/* Upload Button */}
        <label className="flex items-center gap-2 bg-[#F40436] hover:bg-[#D9032F] text-white text-sm font-medium px-4 py-2.5 rounded-xl shadow-xs transition-colors cursor-pointer">
          <Upload size={16} />
          <span>{uploading ? 'Uploading...' : 'Upload Media Asset'}</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileUpload}
            disabled={uploading}
            className="hidden"
          />
        </label>
      </div>

      {/* Filters and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-gray-200 rounded-xl outline-none focus:border-[#F40436]"
          />
        </div>

        {/* Type Filter Buttons */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'image', 'video'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all cursor-pointer ${
                filterType === type
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type === 'all' ? 'All Files' : `${type}s`}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filteredAssets.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200/80 p-12 text-center text-gray-400">
          <FolderArchive size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-sm font-medium text-gray-600">No media assets found</p>
          <p className="text-xs text-gray-400 mt-1">Upload images or videos above to store them in your library.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredAssets.map((asset) => (
            <div
              key={asset.id}
              className="group bg-white rounded-xl border border-gray-200 overflow-hidden shadow-2xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              {/* Media Thumbnail */}
              <div className="relative aspect-square w-full bg-gray-100 overflow-hidden">
                {asset.file_type === 'video' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900 text-white">
                    <Film size={32} className="text-white/70 mb-1" />
                    <span className="text-[10px] uppercase font-bold tracking-widest text-white/60">Video</span>
                  </div>
                ) : (
                  <Image
                    src={asset.file_url}
                    alt={asset.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}

                {/* Overlay actions on hover */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleCopy(asset.file_url, asset.id)}
                    className="p-2 rounded-full bg-white text-gray-800 hover:scale-110 transition-transform shadow-md cursor-pointer"
                    title="Copy URL"
                  >
                    {copiedId === asset.id ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                  </button>
                  <a
                    href={asset.file_url}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 rounded-full bg-white text-gray-800 hover:scale-110 transition-transform shadow-md cursor-pointer"
                    title="Open in new tab"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <ConfirmDelete
                    itemName={asset.name}
                    onConfirm={() => handleDelete(asset.id)}
                  />
                </div>
              </div>

              {/* Bottom Meta */}
              <div className="p-2.5">
                <p className="text-xs font-semibold text-gray-800 truncate" title={asset.name}>
                  {asset.name}
                </p>
                <div className="flex items-center justify-between text-[10px] text-gray-400 mt-1">
                  <span className="capitalize">{asset.file_type}</span>
                  <span>{formatBytes(asset.file_size)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
