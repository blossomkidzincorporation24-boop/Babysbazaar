/**
 * Baby's Bazaar — Centralized Business Constants & URLs
 * Single source of truth across the application.
 */

export const BUSINESS_NAME = "Baby's Bazaar"
export const BUSINESS_TAGLINE = "Baby essentials, toys and everyday products for little ones — all in one place."
export const BUSINESS_WHATSAPP_NUMBER = "918489824888"
export const BUSINESS_PHONE_DISPLAY = "+91 84898 24888"
export const BUSINESS_PHONE_TEL = "tel:+918489824888"
export const BUSINESS_EMAIL = "support@babysbazaar.shop"

export const BUSINESS_ADDRESS = "160, Perundurai Road, near Sudha Hospital, Edayankattuvalasu, Erode, Tamil Nadu 638011"
export const BUSINESS_GOOGLE_MAPS_URL = `https://maps.google.com/?q=${encodeURIComponent(BUSINESS_ADDRESS)}`

export const BUSINESS_INSTAGRAM_URL = "https://instagram.com"
export const BUSINESS_TWITTER_URL = "https://twitter.com"

export const CANONICAL_DOMAIN = "https://babysbazaar.shop"

export function getBusinessWhatsAppUrl(customMessage?: string): string {
  const message = customMessage || "Hi Baby's Bazaar, I want to inquire about your products."
  return `https://wa.me/${BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
