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

export function buildWhatsAppEnquiryUrl({
  whatsappNumber,
  productTitle,
  price,
  quantity = 1,
  variant,
  productUrl,
}: {
  whatsappNumber?: string | null
  productTitle: string
  price?: number | string | null
  quantity?: number | string | null
  variant?: string | null
  productUrl?: string
}): string {
  const cleanPhone = whatsappNumber?.replace(/\D/g, '') || '918489824888'
  const formattedPrice =
    typeof price === 'number'
      ? `₹${price.toLocaleString('en-IN')}`
      : price
      ? String(price).startsWith('₹')
        ? String(price)
        : `₹${price}`
      : 'Price on request'

  let message = `Hello Baby's Bazaar,\n\nI am interested in:\n\nProduct: ${productTitle}\nPrice: ${formattedPrice}`

  if (quantity && Number(quantity) > 0) {
    message += `\nQuantity: ${quantity}`
  }

  if (variant && variant.trim()) {
    message += `\nVariant: ${variant.trim()}`
  }

  if (productUrl) {
    message += `\nProduct Link: ${productUrl}`
  }

  message += `\n\nPlease share availability and delivery details.`

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}

export function buildWhatsAppUrl(whatsappNumber: string, productTitle: string, productUrl: string): string {
  return buildWhatsAppEnquiryUrl({
    whatsappNumber,
    productTitle,
    productUrl,
  })
}

export function getPublicUrl(supabaseUrl: string, bucket: string, path: string): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export function cleanToyDescription(rawDescription?: string | null): string {
  if (!rawDescription) return ''
  return rawDescription.replace(/\[parent:[^\]]+\]\s*/gi, '').trim()
}
