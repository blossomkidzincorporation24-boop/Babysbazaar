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
  Shirt,
  Baby,
  Ruler,
  Package,
} from 'lucide-react'
import {
  createClothingSubcategory,
  updateClothingSubcategory,
  deleteClothingSubcategory,
  toggleClothingSubcategoryStatus,
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

type TabKey = 'subcategories' | 'age_groups' | 'sizes'

const TABS: { key: TabKey; label: string; icon: typeof Shirt }[] = [
  { key: 'subcategories', label: 'Sub-categories', icon: Shirt },
  { key: 'age_groups', label: 'Age Groups', icon: Baby },
  { key: 'sizes', label: 'Clothing Sizes', icon: Ruler },
]

interface Props {
  initialSubcategories: ClothingItem[]
  initialAgeGroups: ClothingItem[]
  initialSizes: ClothingItem[]
}

export default function ClothingManagementClient({
  initialSubcategories,
  initialAgeGroups,
  initialSizes,
}: Props) {
  const [activeTab, setActiveTab] = useState<TabKey>('subcategories')
  const [subcategories, setSubcategories] = useState(initialSubcategories)
  const [ageGroups, setAgeGroups] = useState(initialAgeGroups)
  const [sizes, setSizes] = useState(initialSizes)

  // Modal state
  const [showModal, setShowModal] = useState(false)
  const [editingItem, setEditingItem] = useState<ClothingItem | null>(null)
  const [formName, setFormName] = useState('')
  const [pending, startTransition] = useTransition()

  function getActiveList(): ClothingItem[] {
    switch (activeTab) {
      case 'subcategories': return subcategories
      case 'age_groups': return ageGroups
      case 'sizes': return sizes
    }
  }

  function getTabConfig() {
    switch (activeTab) {
      case 'subcategories':
        return {
          title: 'Clothing Sub-categories',
          addLabel: '+ Add Sub-category',
          modalTitle: editingItem ? 'Edit Sub-category' : 'Add Sub-category',
          fieldLabel: 'Sub-category Name',
          placeholder: 'Enter sub-category name',
        }
      case 'age_groups':
        return {
          title: 'Age Groups',
          addLabel: '+ Add Age Group',
          modalTitle: editingItem ? 'Edit Age Group' : 'Add Age Group',
          fieldLabel: 'Age Group Name',
          placeholder: 'Enter age group',
        }
      case 'sizes':
        return {
          title: 'Clothing Sizes',
          addLabel: '+ Add Size',
          modalTitle: editingItem ? 'Edit Clothing Size' : 'Add Clothing Size',
          fieldLabel: 'Size Name',
          placeholder: 'Enter clothing size',
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

      if (activeTab === 'subcategories') {
        result = editingItem
          ? await updateClothingSubcategory(editingItem.id, formName.trim())
          : await createClothingSubcategory(formName.trim())
      } else if (activeTab === 'age_groups') {
        result = editingItem
          ? await updateClothingAgeGroup(editingItem.id, formName.trim())
          : await createClothingAgeGroup(formName.trim())
      } else {
        result = editingItem
          ? await updateClothingSize(editingItem.id, formName.trim())
          : await createClothingSize(formName.trim())
      }

      if (result?.error) { toast.error(result.error); return }
      toast.success(editingItem ? 'Updated successfully!' : 'Created successfully!')
      closeModal()
      window.location.reload()
    })
  }

  async function handleDelete(item: ClothingItem) {
    const config = getTabConfig()
    if (!confirm(`Delete "${item.name}"?\n\nAre you sure you want to delete this? This cannot be undone.`)) return

    let result: { error?: string; success?: boolean } | undefined

    if (activeTab === 'subcategories') {
      result = await deleteClothingSubcategory(item.id)
      if (!result?.error) setSubcategories(prev => prev.filter(i => i.id !== item.id))
    } else if (activeTab === 'age_groups') {
      result = await deleteClothingAgeGroup(item.id)
      if (!result?.error) setAgeGroups(prev => prev.filter(i => i.id !== item.id))
    } else {
      result = await deleteClothingSize(item.id)
      if (!result?.error) setSizes(prev => prev.filter(i => i.id !== item.id))
    }

    if (result?.error) { toast.error(result.error); return }
    toast.success('Deleted successfully')
  }

  async function handleToggle(item: ClothingItem) {
    let result: { error?: string; success?: boolean } | undefined

    if (activeTab === 'subcategories') {
      result = await toggleClothingSubcategoryStatus(item.id, item.status)
      if (!result?.error) setSubcategories(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    } else if (activeTab === 'age_groups') {
      result = await toggleClothingAgeGroupStatus(item.id, item.status)
      if (!result?.error) setAgeGroups(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    } else {
      result = await toggleClothingSizeStatus(item.id, item.status)
      if (!result?.error) setSizes(prev => prev.map(i => i.id === item.id ? { ...i, status: i.status === 'active' ? 'inactive' : 'active' } : i))
    }

    if (result?.error) { toast.error(result.error); return }
    toast.success('Status updated')
  }

  const config = getTabConfig()
  const list = getActiveList()

  return (
    <div className="animate-in fade-in duration-300">
      {/* Breadcrumb + Back */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 text-[13px] text-[#8A8A8A] mb-2">
            <Link href="/admin/categories" className="hover:text-[#202124] transition-colors">
              Categories
            </Link>
            <span>/</span>
            <span className="text-[#202124] font-medium">Clothing</span>
          </div>
          <h1 className="text-2xl font-bold text-[#202124] tracking-tight">Clothing Management</h1>
          <p className="text-sm text-[#8A8A8A] mt-1">
            Manage clothing sub-categories, age groups and clothing sizes.
          </p>
        </div>
        <Link
          href="/admin/categories"
          className="flex items-center gap-2 text-sm font-medium text-[#8A8A8A] hover:text-[#202124] transition-colors"
        >
          <ArrowLeft size={16} />
          Back to Categories
        </Link>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center gap-1 bg-[#FAF9FA] border border-[#ECE8EA] rounded-xl p-1 mb-6 w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-white text-[#202124] shadow-sm border border-[#ECE8EA]'
                  : 'text-[#8A8A8A] hover:text-[#202124]'
              }`}
            >
              <Icon size={15} className={isActive ? 'text-[#E52D68]' : ''} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white border border-[#ECE8EA] rounded-2xl shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)] overflow-hidden">
        {/* Tab Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#ECE8EA]">
          <h2 className="text-[15px] font-bold text-[#202124]">{config.title}</h2>
          <button
            onClick={openAdd}
            className="flex items-center gap-1.5 text-[13px] font-semibold text-[#E52D68] bg-[#FCE8EF] px-4 py-2 rounded-lg hover:bg-[#F8D2DF] transition-colors"
          >
            <Plus size={14} strokeWidth={2.5} />
            {config.addLabel}
          </button>
        </div>

        {/* Table */}
        {list.length === 0 ? (
          <div className="text-center py-16">
            <Package size={40} className="mx-auto mb-3 text-[#ECE8EA]" />
            <p className="text-sm font-medium text-[#202124]">Nothing here yet</p>
            <p className="text-xs text-[#8A8A8A] mt-1">Click the button above to add your first item.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#ECE8EA] text-[11px] font-semibold text-[#8A8A8A] uppercase tracking-wider">
                  <th className="px-6 py-3.5 font-medium">Name</th>
                  <th className="px-6 py-3.5 font-medium">Status</th>
                  <th className="px-6 py-3.5 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECE8EA]">
                {list.map(item => (
                  <tr key={item.id} className="group hover:bg-[#FAF9FA] transition-colors duration-150">
                    <td className="px-6 py-4">
                      <span className="text-[14px] font-medium text-[#202124]">{item.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium ${
                          item.status === 'active'
                            ? 'bg-[#E8F5E9] text-[#2E7D32]'
                            : 'bg-[#F1F3F4] text-[#5F6368]'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${item.status === 'active' ? 'bg-[#2E7D32]' : 'bg-[#5F6368]'}`} />
                        {item.status === 'active' ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle */}
                        <label className="relative inline-flex items-center cursor-pointer mr-2" title={item.status === 'active' ? 'Deactivate' : 'Activate'}>
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={item.status === 'active'}
                            onChange={() => handleToggle(item)}
                          />
                          <div className="w-8 h-[18px] bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-3.5 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3.5 after:w-3.5 after:transition-all peer-checked:bg-[#2E7D32]" />
                        </label>

                        {/* Edit */}
                        <button
                          onClick={() => openEdit(item)}
                          className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#202124] hover:bg-white border border-transparent hover:border-[#ECE8EA] transition-all"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => handleDelete(item)}
                          className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#E52D68] hover:bg-white border border-transparent hover:border-[#ECE8EA] transition-all"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ───── ADD / EDIT MODAL ───── */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4">
              <h3 className="text-lg font-bold text-[#202124]">{config.modalTitle}</h3>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-lg text-[#8A8A8A] hover:text-[#202124] hover:bg-[#FAF9FA] transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
              <div>
                <label className="block text-[13px] font-semibold text-[#202124] mb-1.5">
                  {config.fieldLabel}
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder={config.placeholder}
                  className="w-full px-4 py-2.5 text-sm border border-[#ECE8EA] rounded-xl focus:outline-none focus:border-[#E52D68] focus:ring-1 focus:ring-[#E52D68] transition-all bg-white placeholder-[#8A8A8A]"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={pending}
                  className="px-5 py-2.5 text-sm font-medium text-[#202124] bg-white border border-[#ECE8EA] rounded-xl hover:bg-[#FAF9FA] transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="px-5 py-2.5 text-sm font-semibold text-white bg-[#E52D68] hover:bg-[#D4225A] rounded-xl transition-all shadow-sm disabled:opacity-70 flex items-center gap-2"
                >
                  {pending && <Loader2 size={14} className="animate-spin" />}
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
