'use client'

import { useTransition } from 'react'
import { Trash2, Loader2 } from 'lucide-react'

interface ConfirmDeleteProps {
  onConfirm: () => Promise<void>
  itemName?: string
  children?: React.ReactNode
  className?: string
  iconSize?: number
}

export default function ConfirmDelete({ onConfirm, itemName = 'this item', children, className, iconSize = 16 }: ConfirmDeleteProps) {
  const [pending, startTransition] = useTransition()

  function handleClick() {
    if (!confirm(`Are you sure you want to delete ${itemName}? This cannot be undone.`)) return
    startTransition(async () => {
      await onConfirm()
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      title="Delete"
      className={className ?? 'p-1.5 rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50'}
    >
      {pending ? <Loader2 size={iconSize} className="animate-spin" /> : (children ?? <Trash2 size={iconSize} />)}
    </button>
  )
}
