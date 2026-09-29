'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'
import { Plus, Camera, Pencil } from 'lucide-react'
import { Photo } from '@/types/database.types'
import { createPhoto, updatePhoto, deletePhoto, togglePhotoStatus } from '@/lib/actions/photos'
import { uploadFile, validateImageFile } from '@/lib/upload'
import ToggleSwitch from '@/components/admin/ToggleSwitch'
import ConfirmDelete from '@/components/admin/ConfirmDelete'

interface Props { initialPhotos: Photo[] }

export default function PhotosClient({ initialPhotos }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Photo | null>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [caption, setCaption] = useState('')
  const [type, setType] = useState<'delivery' | 'event'>('delivery')
  const [uploading, setUploading] = useState(false)
  const [pending, startTransition] = useTransition()

  function openAdd() { setEditing(null); setImageUrl(null); setCaption(''); setType('delivery'); setShowForm(true) }
  function openEdit(p: Photo) { setEditing(p); setImageUrl(p.image); setCaption(p.caption ?? ''); setType(p.type); setShowForm(true) }
  function closeForm() { setShowForm(false); setEditing(null) }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const err = validateImageFile(file)
    if (err) { toast.error(err); return }
    setUploading(true)
    const result = await uploadFile(file, 'photos')
    setUploading(false)
    if ('error' in result) { toast.error(result.error); return }
    setImageUrl(result.url)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!imageUrl && !editing) { toast.error('Please upload an image'); return }
    startTransition(async () => {
      const result = editing
        ? await updatePhoto(editing.id, { caption, type, status: editing.status })
        : await createPhoto({ image: imageUrl!, caption, type, status: 'active' })
      if (result?.error) { toast.error(result.error); return }
      toast.success(editing ? 'Photo updated!' : 'Photo uploaded!')
      closeForm()
      window.location.reload()
    })
  }

  async function handleToggle(id: string, status: string) {
    const result = await togglePhotoStatus(id, status)
    if (result?.error) toast.error(result.error)
    else window.location.reload()
  }

  async function handleDelete(id: string) {
    const result = await deletePhoto(id)
    if (result?.error) toast.error(result.error)
    else { toast.success('Photo deleted'); window.location.reload() }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Photos</h1>
          <p className="text-sm text-gray-500 mt-1">Manage delivery and event photos</p>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus size={16} /> Upload photo
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editing ? 'Edit Photo' : 'Upload Photo'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Photo *</label>
                  {imageUrl ? (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200">
                      <Image src={imageUrl} alt="Preview" fill className="object-cover" />
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-colors">
                      <Camera size={28} className="text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">{uploading ? 'Uploading…' : 'Click to upload photo'}</span>
                      <input type="file" accept="image/*" onChange={handleFileChange} disabled={uploading} className="hidden" />
                    </label>
                  )}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Caption</label>
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Delivery to happy customer" className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select value={type} onChange={e => setType(e.target.value as 'delivery' | 'event')} className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-purple-500">
                  <option value="delivery">Delivery</option>
                  <option value="event">Event</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={closeForm} className="flex-1 border border-gray-200 text-gray-600 text-sm font-medium py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={pending || uploading} className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:opacity-60 text-white text-sm font-medium py-2.5 rounded-lg">
                  {pending ? 'Saving…' : editing ? 'Update' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grid */}
      {initialPhotos.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <Camera size={48} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No delivery photos yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {initialPhotos.map(p => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="relative w-full h-40">
                <Image src={p.image} alt={p.caption ?? 'Photo'} fill className="object-cover" />
              </div>
              <div className="p-3">
                {p.caption && <p className="text-xs text-gray-600 mb-2 truncate">{p.caption}</p>}
                <span className="text-xs text-gray-400 capitalize">{p.type}</span>
                <div className="flex items-center justify-between mt-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {p.status === 'active' ? '● Active' : '● Inactive'}
                  </span>
                  <div className="flex items-center gap-1">
                    <ToggleSwitch checked={p.status === 'active'} onChange={() => handleToggle(p.id, p.status)} />
                    <button onClick={() => openEdit(p)} className="p-1 text-gray-400 hover:text-gray-600"><Pencil size={14} /></button>
                    <ConfirmDelete onConfirm={() => handleDelete(p.id)} itemName="this photo" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
