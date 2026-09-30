'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
  Baby,
  Ruler,
  Package,
} from 'lucide-react'
import {
  createClothingAgeGroup,
  updateClothingAgeGroup,
  deleteClothingAgeGroup,
  toggleClothingAgeGroupStatus,
  createClothingSize,
  updateClothingSize,
  deleteClothingSize,
  toggleClothingSizeStatus,
} from '@/lib/actions/clothing'

type ClothingItem = {
  id: string
  name: string
  status: string
  sort_order: number
  created_at: string
  updated_at: string
}

type TabKey = 'age_groups' | 'sizes'

const TABS: { key: TabKey; label: string; icon: typeof Baby }[] = [
  { key: 'age_groups', label: 'Age Groups', icon: Baby },
  { key: 'sizes', label: 'Clothing Sizes', icon: Ruler },
]

interface Props {
  initialAgeGroups: ClothingItem[]
  initialSizes: ClothingItem[]
}

export default function ClothingManagementClient({
  initialAgeGroups,
  initialSizes,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('age_groups')
  const [ageGroups, setAgeGroups] = useState(initialAgeGroups)
  const [sizes, setSizes] = useState(initialSizes)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [formName, setFormName] = useState('')
  const [pending, startTransition] = useTransition()

  function getActiveList(): ClothingItem[] {
    switch (activeTab) {
      case 'age_groups': return ageGroups
      case 'sizes': return sizes
    }
  }

  function getTabConfig() {
    switch (activeTab) {
      case 'age_groups':
        return {
          title: 'Clothing Age Groups',
          description: 'Organize clothing products using age attributes (e.g. 1–3M, 3–6M, 6–12M).',
          addLabel: '+ Add Age Group',
          modalTitle: editingItem ? 'Edit Age Group' : 'Add Age Group',
          fieldLabel: 'Age Group Name',
          placeholder: 'e.g. 1–3 Months',
        }
      case 'sizes':
        return {
          title: 'Clothing Sizes',
          description: 'Manage standard garment size variants for product enquiries.',
          addLabel: '+ Add Size',
          modalTitle: editingItem ? 'Edit Clothing Size' : 'Add Clothing Size',
          fieldLabel: 'Size Name',
          placeholder: 'e.g. 0–3M, 3–6M',
        }
    }
  }

  function openAdd() {
    setEditingItem(null)
    setFormName('')
    setShowModal(true)
  }

  function openEdit(item: ClothingItem) {
    setEditingItem(item)
    setFormName(item.name)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setEditingItem(null)
    setFormName('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!formName.trim()) { toast.error('Name is required'); return }

    startTransition(async () => {
      let result: { error?: string; success?: boolean } | undefined

      if (activeTab === 'age_groups') {
        result = editingItem
          ? await updateClothingAgeGroup(editingItem.id, formName.trim())
          : await createClothingAgeGroup(formName.trim())
      } else if (activeTab === 'sizes') {
        result = editingItem
          ? await updateClothingSize(editingItem.id, formName.trim())
          : await createClothingSize(formName.trim())
      }

      if (result?.error) { toast.error(result.error); return }
      toast.success(editingItem ? 'Updated!' : 'Created!')
      closeModal()
      window.location.reload()
    })
  }

  async function handleDelete(item: ClothingItem) {
    if (!confirm(`Delete "${item.name}"?`)) return

    let result: { error?: string; success?: boolean } | undefined
    if (activeTab === 'age_groups') {
      result = await deleteClothingAgeGroup(item.id)
      if (!result?.error) setAgeGroups(prev => prev.filter(i => i.id !== item.id))
    } else if (activeTab === 'sizes') {
      result = await deleteClothingSize(item.id)
      if (!result?.error) setSizes(prev => prev.filter(i => i.id !== item.id))
    }

    if (result?.error) toast.error(result.error)
    else toast.success('Deleted')
  }

  async function handleToggle(item: ClothingItem) {
    let result: { error?: string; success?: boolean } | undefined
    if (activeTab === 'age_groups') {
      result = await toggleClothingAgeGroupStatus(item.id, item.status)
      if (!result?.error) setAgeGroups(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    } else if (activeTab === 'sizes') {
      result = await toggleClothingSizeStatus(item.id, item.status)
      if (!result?.error) setSizes(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    }

    if (result?.error) toast.error(result.error)
    else toast.success('Status updated')
  }

  const config = getTabConfig()
  const currentList = getActiveList()

  return (
    <div className="animate-in fade-in duration-300">
      {/* Back Link */}
      <Link
        href="/admin/categories"
        className="inline-flex items-center gap-2 text-sm text-[#8A8A8A] hover:text-[#202124] transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Categories
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">Clothing Attributes</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            Manage age groups and size attributes used for filtering and organizing Clothing products.
          </p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 bg-[#E52D68] hover:bg-[#D4225A] text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span>{config.addLabel}</span>
        </button>
      </div>

      {/* Tabs (Age Groups & Sizes ONLY - Subcategory removed) */}
      <div className="flex gap-2 border-b border-[#ECE8EA] mb-6">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-[#E52D68] text-[#E52D68]'
                  : 'border-transparent text-[#8A8A8A] hover:text-[#202124]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              <span className={`text-[11px] px-2 py-0.5 rounded-full ${
                isActive ? 'bg-[#FCE8EF] text-[#E52D68]' : 'bg-gray-100 text-gray-500'
              }`}>
                {tab.key === 'age_groups' ? ageGroups.length : sizes.length}
              </span>
            </button>
          )
        })}
      </div>

      {/* Section Info Card */}
      <div className="bg-[#FAF9FA] border border-[#ECE8EA] rounded-xl p-4 mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-[#202124]">{config.title}</h3>
          <p className="text-xs text-[#8A8A8A] mt-0.5">{config.description}</p>
        </div>
        <span className="text-xs text-gray-500 font-medium">
          {currentList.length} total
        </span>
      </div>

      {/* List */}
      {currentList.length === 0 ? (
        <div className="text-center py-20 bg-white border border-[#ECE8EA] rounded-2xl">
          <Package size={40} className="mx-auto mb-3 text-[#ECE8EA]" />
          <h4 className="text-sm font-semibold text-[#202124] mb-1">No items yet</h4>
          <p className="text-xs text-[#8A8A8A] mb-4">Click below to add your first entry.</p>
          <button
            onClick={openAdd}
            className="inline-flex items-center gap-2 bg-[#E52D68] text-white text-xs font-semibold px-4 py-2 rounded-xl"
          >
            <Plus size={14} /> Add
          </button>
        </div>
      ) : (
        <div className="bg-white border border-[#ECE8EA] rounded-2xl overflow-hidden shadow-xs">
          <div className="divide-y divide-[#ECE8EA]">
            {currentList.map(item => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 hover:bg-[#FAF9FA] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${
                    item.status === 'active' ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm font-semibold text-[#202124]">{item.name}</span>
                  <span className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    item.status === 'active'
                      ? 'bg-green-50 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item.status}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {/* Toggle */}
                  <label className="relative inline-flex items-center cursor-pointer mr-2" title="Toggle status">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={item.status === 'active'}
                      onChange={() => handleToggle(item)}
                    />
                    <div className="w-8 h-4 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#2E7D32]" />
                  </label>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(item)}
                    className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
                    title="Edit"
                  >
                    <Pencil size={14} />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(item)}
                    className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#202124]">{config.modalTitle}</h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#202124] mb-1.5">
                  {config.fieldLabel} *
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={config.placeholder}
                  className="w-full px-3.5 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68]"
                  autoFocus
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#E52D68] hover:bg-[#D4225A] rounded-xl flex items-center gap-1.5 disabled:opacity-50"
                >
                  {pending && <Loader2 size={13} className="animate-spin" />}
                  {editingItem ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
