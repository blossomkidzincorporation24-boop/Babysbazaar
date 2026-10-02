'use client'

import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  MessageCircle,
  ExternalLink,
  Sparkles,
  ShoppingBag,
  Package,
  Gift,
  HelpCircle,
  CheckCircle2,
} from 'lucide-react'

import {
  BUSINESS_NAME,
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_EMAIL,
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_GOOGLE_MAPS_URL,
} from '@/lib/constants'

interface ContactUsClientProps {
  settings?: {
    store_name?: string | null
    whatsapp_number?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
  } | null
}

export default function ContactUsClient({ settings }: ContactUsClientProps) {
  const storeName = settings?.store_name || BUSINESS_NAME
  const cleanWhatsApp = settings?.whatsapp_number?.replace(/\D/g, '') || BUSINESS_WHATSAPP_NUMBER
  const storePhone = settings?.phone || BUSINESS_PHONE_DISPLAY
  const storeEmail = settings?.email || BUSINESS_EMAIL
  const rawAddress = settings?.address || BUSINESS_ADDRESS
  const storeAddress = rawAddress.includes('60, Perundurai') || rawAddress.includes('60 Perundurai') ? BUSINESS_ADDRESS : rawAddress
  const mapUrl = storeAddress ? `https://maps.google.com/?q=${encodeURIComponent(storeAddress)}` : BUSINESS_GOOGLE_MAPS_URL

  // WhatsApp chat links
  const defaultWhatsAppUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Hi ${storeName}, I want to get in touch regarding your baby products.`
  )}`

  const quickTopics = [
    {
      title: 'Product & Sizing Enquiry',
      desc: 'Ask about cloth sizes, materials & age fit',
      icon: ShoppingBag,
      message: `Hi ${storeName}, I have a question about baby product sizing and availability.`,
    },
    {
      title: 'Order Status & Dispatch',
      desc: 'Track your parcel dispatch or delivery info',
      icon: Package,
      message: `Hi ${storeName}, I would like to check my order and delivery status.`,
    },
    {
      title: 'Gift Hampers & Keepsakes',
      desc: 'Customized gift boxes & baby hampers',
      icon: Gift,
      message: `Hi ${storeName}, I want to know more about your baby gift sets and hampers.`,
    },
    {
      title: 'Store Visit & Directions',
      desc: 'Plan your visit to our Erode flagship store',
      icon: MapPin,
      message: `Hi ${storeName}, I am planning to visit your Erode store today.`,
    },
  ]

  return (
    <div className="w-full bg-white text-gray-900 pb-16">
      {/* ─────────────────────────────────────────────────────────────
          1. HERO SECTION (Everything Your Little One Needs, All in One Place)
      ───────────────────────────────────────────────────────────── */}
      <section className="relative w-full h-[380px] sm:h-[460px] lg:h-[500px] overflow-hidden bg-gray-900 select-none">
        {/* Background Image matching Figma Frame 1686556757 */}
        <Image
          src="https://api.builder.io/api/v1/image/assets/TEMP/aaced12e863576487024071a2cae721f06878269?width=2878"
          alt="Everything Your Little One Needs"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* Dark Gradient Overlay for Contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/45 to-black/65" />

        {/* Centered Content */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center">
          <Container className="text-center">
            <h1 className="font-roboto-slab text-2xl sm:text-4xl lg:text-[44px] font-bold text-white tracking-tight leading-[1.25] drop-shadow-md max-w-3xl mx-auto">
              Everything Your Little One Needs,
              <br />
              <span className="text-[#FACF11]">All in One Place.</span>
            </h1>

            {/* Dual CTA Buttons */}
            <div className="mt-6 sm:mt-8 flex items-center justify-center gap-4 flex-wrap">
              <Link
                href="/categories"
                className="bg-[rgba(226,19,82,0.90)] hover:bg-[#E21352] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
              >
                Explore Categories
              </Link>

              <a
                href={defaultWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#34C759] hover:bg-[#2ebd52] active:scale-95 text-white font-sans text-xs sm:text-sm font-semibold px-8 py-3.5 rounded-full shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle size={18} />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </Container>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT (Instant WhatsApp Concierge & Get in Touch)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* ── Left Column: Direct WhatsApp Support Card ── */}
            <div className="lg:col-span-6 bg-gradient-to-br from-white via-[#FFF8FA] to-[#FDF0F4] border border-[#FAD6E2] rounded-3xl p-6 sm:p-9 shadow-xs space-y-6">
              <div>
                <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#FCE8EF] text-[#E21352] text-xs font-semibold uppercase tracking-wider mb-3">
                  <Sparkles size={14} />
                  <span>Instant Concierge</span>
                </div>
                <h2 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-[#1C1C18]">
                  Chat with Our Team on WhatsApp
                </h2>
                <p className="text-sm sm:text-base text-gray-600 mt-2 leading-relaxed font-sans">
                  Have questions about newborn clothes, baby cribs, strollers, toys or gift hampers? Connect with our personal shopper team directly for quick assistance, live photos, and recommendations.
                </p>
              </div>

              {/* Main Green WhatsApp Action Button */}
              <a
                href={defaultWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] active:scale-[0.99] text-white font-sans font-bold text-base transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2.5 cursor-pointer"
              >
                <MessageCircle size={22} />
                <span>Start WhatsApp Conversation</span>
              </a>

              {/* Quick Inquiry Topics */}
              <div className="pt-4 border-t border-[#F8E3EC] space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-gray-400 font-sans">
                  Or choose a specific topic:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {quickTopics.map((topic, idx) => {
                    const Icon = topic.icon
                    const topicUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(topic.message)}`
                    return (
                      <a
                        key={idx}
                        href={topicUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-3.5 rounded-xl bg-white border border-gray-100 hover:border-[#E21352]/40 hover:shadow-xs transition-all flex items-start gap-3 group cursor-pointer"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#FBE6ED] text-[#E21352] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon size={16} />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#E21352] transition-colors leading-tight truncate">
                            {topic.title}
                          </h4>
                          <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-1">
                            {topic.desc}
                          </p>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>

              {/* Trust Indicators */}
              <div className="pt-3 flex items-center justify-between gap-2 text-xs text-gray-500 border-t border-[#F8E3EC] font-sans flex-wrap">
                <div className="flex items-center gap-1 text-emerald-700 font-medium">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Fast response within minutes</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500">
                  <span>Pan-India shipping assistance</span>
                </div>
              </div>
            </div>

            {/* ── Right Column: "Get in Touch" Info Card ── */}
            <div className="lg:col-span-6 space-y-8 lg:pl-4">
              <div>
                <h2 className="font-roboto-slab text-3xl sm:text-4xl lg:text-[42px] font-bold text-[#1C1C18] tracking-tight leading-tight">
                  Get in Touch
                </h2>
                <p className="text-gray-600 mt-2 text-base font-normal max-w-lg leading-relaxed font-sans">
                  We are here to assist you with newborn clothing sizing, personalized hampers, or orders through friendly WhatsApp shopping.
                </p>
              </div>

              {/* 4 Info Blocks */}
              <div className="space-y-4 sm:space-y-5">
                {/* 1. STORE LOCATION */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#FBE6ED] flex items-center justify-center shrink-0 text-[#E21352]">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-xs font-bold tracking-wider text-gray-400 uppercase">
                      STORE LOCATION
                    </h3>
                    <p className="font-sans text-sm sm:text-base text-[#1C1C18] font-medium leading-relaxed">
                      {storeAddress}
                    </p>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#E21352] hover:underline pt-1"
                    >
                      <span>View Live Location on Google Maps</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* 2. PHONE */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0 text-[#16A34A]">
                    <Phone size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-xs font-bold tracking-wider text-gray-400 uppercase">
                      PHONE & CALL
                    </h3>
                    <p className="font-sans text-base sm:text-lg font-bold text-[#1C1C18]">
                      {storePhone}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${storePhone.replace(/\s+/g, '')}`}
                        className="text-xs font-semibold text-gray-700 hover:text-black underline"
                      >
                        Call Us Directly
                      </a>
                      <span className="text-gray-300">•</span>
                      <a
                        href={defaultWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-semibold text-[#16A34A] hover:underline flex items-center gap-1"
                      >
                        <MessageCircle size={12} />
                        WhatsApp Concierge
                      </a>
                    </div>
                  </div>
                </div>

                {/* 3. BUSINESS HOURS */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#D97706]">
                    <Clock size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-xs font-bold tracking-wider text-gray-400 uppercase">
                      BUSINESS HOURS
                    </h3>
                    <div className="font-sans text-sm sm:text-base text-[#1C1C18] space-y-0.5">
                      <p>
                        <span className="font-semibold">Monday – Sunday:</span> 09:30 AM – 09:00 PM
                      </p>
                      <p className="text-xs text-gray-500 pt-0.5">
                        Open all 7 days for baby essentials & toys shopping
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. EMAIL */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-2xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0 text-[#7C3AED]">
                    <Mail size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-sans text-xs font-bold tracking-wider text-gray-400 uppercase">
                      EMAIL
                    </h3>
                    <a
                      href={`mailto:${storeEmail}`}
                      className="font-sans text-sm sm:text-base text-[#1C1C18] font-medium hover:text-[#E21352] transition-colors break-all block"
                    >
                      {storeEmail}
                    </a>
                    <p className="text-xs text-gray-400">
                      We respond to all written inquiries promptly.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PHYSICAL STOREFRONT SHOWCASE SECTION
      ───────────────────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12">
        <Container>
          <div className="relative w-full rounded-3xl overflow-hidden border border-gray-200 shadow-lg group bg-black">
            {/* Actual Baby's Bazaar Storefront Image */}
            <div className="relative w-full h-[280px] sm:h-[400px] lg:h-[480px]">
              <Image
                src="https://api.builder.io/api/v1/image/assets/TEMP/248bc591238aaf81d1d541b02a5cfbc35b7a7180?width=2212"
                alt="Baby's Bazaar Retail Flagship Storefront"
                fill
                sizes="(max-width: 1280px) 100vw, 1280px"
                className="object-cover object-center group-hover:scale-102 transition-transform duration-700 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            </div>

            {/* Overlay Info Card */}
            <div className="absolute bottom-6 left-6 right-6 sm:bottom-8 sm:left-8 sm:right-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white z-10">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-[#E21352] text-xs font-semibold tracking-wider uppercase mb-2">
                  Visit Our Experience Center
                </span>
                <h3 className="font-roboto-slab text-xl sm:text-2xl lg:text-3xl font-bold drop-shadow-md">
                  Baby's Bazaar Flagship Store
                </h3>
                <p className="text-xs sm:text-sm text-gray-200 mt-1 max-w-xl">
                  Explore our curated fabrics, infant play zones, luxury hampers, and baby care essentials in person at 160, Perundurai Road, Near Sudha Hospital, Erode.
                </p>
              </div>

              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0 cursor-pointer"
              >
                <MapPin size={16} className="text-[#E21352]" />
                <span>Get Driving Directions</span>
              </a>
            </div>
          </div>
        </Container>
      </section>
    </div>
  )
}
