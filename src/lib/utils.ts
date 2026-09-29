import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price)
}

export function buildWhatsAppUrl(whatsappNumber: string, productTitle: string, productUrl: string): string {
  const number = whatsappNumber.replace(/\D/g, '')
  const message = encodeURIComponent(
    `Hi Baby's Bazaar,\n\nI am interested in:\n*${productTitle}*\n${productUrl}\n\nPlease share more details.`
  )
  return `https://wa.me/${number}?text=${message}`
}

export function getPublicUrl(supabaseUrl: string, bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}
