'use client'

import { MessageCircle } from 'lucide-react'
import { buildWhatsAppUrl } from '@/lib/utils'

interface Props {
  whatsappNumber?: string | null
  productTitle: string
  productUrl: string
}

export default function WhatsAppButton({ whatsappNumber, productTitle, productUrl }: Props) {
  if (!whatsappNumber) {
    return (
      <div className="w-full bg-gray-100 text-gray-500 text-sm text-center py-3 rounded-xl">
        WhatsApp enquiry is not configured yet.
      </div>
    )
  }

  const url = buildWhatsAppUrl(whatsappNumber, productTitle, productUrl)

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 rounded-xl text-sm transition-colors shadow-md"
    >
      <MessageCircle size={20} />
      Enquire on WhatsApp
    </a>
  )
}
