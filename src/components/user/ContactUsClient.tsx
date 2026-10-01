'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Container from '@/components/ui/Container'
import {
  MapPin,
  Phone,
  Clock,
  Mail,
  ChevronDown,
  Send,
  MessageCircle,
  ExternalLink,
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

  // WhatsApp chat link
  const defaultWhatsAppUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(
    `Hi ${storeName}, I want to get in touch regarding your baby products.`
  )}`

  // Form State
  const [orderId, setOrderId] = useState('')
  const [problemType, setProblemType] = useState('')
  const [message, setMessage] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const issueText = problemType || 'General Inquiry'
    const orderText = orderId.trim() ? `Order ID: ${orderId.trim()}` : 'Order ID: Not provided'
    const nameText = customerName.trim() ? `Customer: ${customerName.trim()}\n` : ''

    const waText = `*Baby's Bazaar - Customer Support Request*\n${nameText}${orderText}\nTopic: ${issueText}\n\n*Message / Query:*\n${message.trim() || 'Need assistance with my inquiry.'}`

    setSubmitted(true)

    // Open WhatsApp with compiled inquiry
    const targetUrl = `https://wa.me/${cleanWhatsApp}?text=${encodeURIComponent(waText)}`
    window.open(targetUrl, '_blank', 'noopener,noreferrer')
  }

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
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M1.02516 23.7126C1.02403 27.7455 2.08603 31.6834 4.10541 35.1543L0.832031 47.0132L13.063 43.8311C16.446 45.6584 20.2363 46.6159 24.088 46.6162H24.0982C36.8135 46.6162 47.164 36.3496 47.1695 23.7306C47.1719 17.6158 44.7742 11.8659 40.4178 7.53994C36.0622 3.21436 30.2693 0.830916 24.0972 0.828125C11.3804 0.828125 1.03059 11.0942 1.02534 23.7126"
                    fill="white"
                  />
                  <path
                    d="M18.1277 13.7949C17.6803 12.8083 17.2095 12.7884 16.784 12.7711C16.4357 12.7562 16.0374 12.7573 15.6395 12.7573C15.2413 12.7573 14.5942 12.906 14.0473 13.4986C13.4998 14.0917 11.957 15.525 11.957 18.4401C11.957 21.3553 14.097 24.1728 14.3953 24.5685C14.694 24.9635 18.5265 31.1372 24.5962 33.5123C29.6407 35.4861 30.6673 35.0935 31.7621 34.9946C32.8571 34.8959 35.2953 33.5616 35.7928 32.178C36.2906 30.7946 36.2906 29.6087 36.1413 29.3609C35.9921 29.114 35.5938 28.9657 34.9967 28.6695C34.3995 28.3733 31.4634 26.9397 30.9161 26.7419C30.3686 26.5443 29.9705 26.4457 29.5723 27.039C29.174 27.6314 28.0305 28.9657 27.6819 29.3609C27.3337 29.757 26.9852 29.8063 26.3882 29.5099C25.7906 29.2126 23.8674 28.5877 21.5857 26.5692C19.8105 24.9986 18.612 23.0591 18.2636 22.4658C17.9152 21.8734 18.2263 21.5523 18.5257 21.2571C18.794 20.9916 19.1231 20.5652 19.422 20.2193C19.7197 19.8733 19.8191 19.6264 20.0182 19.2312C20.2175 18.8357 20.1178 18.4896 19.9687 18.1933C19.8191 17.8969 18.6587 14.9665 18.1277 13.7949Z"
                    fill="white"
                  />
                </svg>
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </Container>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          2. MAIN CONTENT (Two Columns: Customer support & Get in Touch)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-12 sm:py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            {/* ── Left Column: "Customer support" Form ── */}
            <div className="lg:col-span-6 bg-white border border-[#D1D1D1] rounded-2xl p-6 sm:p-9 shadow-xs">
              <div className="mb-6">
                <h2 className="font-poppins text-2xl sm:text-3xl font-semibold text-[#0D0D0D]">
                  Customer support
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Have questions about your order, sizes, or baby care gifts? Send us a message and our concierge team will respond directly.
                </p>
              </div>

              {submitted && (
                <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-semibold">Message prepared for WhatsApp!</p>
                    <p className="text-xs text-green-700 mt-0.5">
                      If the WhatsApp window didn't open automatically,{' '}
                      <a
                        href={defaultWhatsAppUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline font-medium hover:text-green-900"
                      >
                        click here to chat directly
                      </a>.
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Your Name (Optional helper) */}
                <div>
                  <label className="block font-poppins text-sm sm:text-base font-medium text-[#0D0D0D] mb-1.5">
                    Your Name <span className="text-xs text-gray-400 font-normal">(optional)</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full h-12 px-4 rounded-md border border-[#D1D1D1] bg-white text-gray-900 placeholder-[#7A7A7A] text-sm sm:text-base focus:outline-none focus:border-[#E21352] focus:ring-1 focus:ring-[#E21352] transition-colors"
                  />
                </div>

                {/* Field 1: Product Order ID */}
                <div>
                  <label className="block font-poppins text-sm sm:text-base font-medium text-[#0D0D0D] mb-1.5">
                    Product Order ID
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your product ID"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                    className="w-full h-12 px-4 rounded-md border border-[#D1D1D1] bg-white text-gray-900 placeholder-[#7A7A7A] text-sm sm:text-base focus:outline-none focus:border-[#E21352] focus:ring-1 focus:ring-[#E21352] transition-colors"
                  />
                </div>

                {/* Field 2: What is your problem (Dropdown) */}
                <div>
                  <label className="block font-poppins text-sm sm:text-base font-medium text-[#0D0D0D] mb-1.5">
                    What is your problem
                  </label>
                  <div className="relative">
                    <select
                      value={problemType}
                      onChange={(e) => setProblemType(e.target.value)}
                      className="w-full h-12 px-4 pr-10 rounded-md border border-[#D1D1D1] bg-white text-gray-900 text-sm sm:text-base appearance-none focus:outline-none focus:border-[#E21352] focus:ring-1 focus:ring-[#E21352] transition-colors cursor-pointer"
                    >
                      <option value="">Enter your Product Size / Inquiry</option>
                      <option value="Product Size & Fit Help">Product Size & Fit Help</option>
                      <option value="Order Status & Delivery Tracking">Order Status & Delivery Tracking</option>
                      <option value="Fabric & Material Composition">Fabric & Material Composition</option>
                      <option value="Exchange or Return Assistance">Exchange or Return Assistance</option>
                      <option value="Custom Gift Hamper Inquiries">Custom Gift Hamper Inquiries</option>
                      <option value="Damaged or Incorrect Item">Damaged or Incorrect Item</option>
                      <option value="Other Assistance">Other Assistance</option>
                    </select>
                    <ChevronDown
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
                    />
                  </div>
                </div>

                {/* Field 3: Write the message */}
                <div>
                  <label className="block font-poppins text-sm sm:text-base font-medium text-[#0D0D0D] mb-1.5">
                    Write the message
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Enter your address or details about your inquiry..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    className="w-full p-4 rounded-lg border border-[#CCC] bg-white text-gray-900 placeholder-[#8F8B8B] text-sm sm:text-base focus:outline-none focus:border-[#E21352] focus:ring-1 focus:ring-[#E21352] transition-colors resize-none"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full h-13 rounded-xl bg-[rgba(226,19,82,0.90)] hover:bg-[#E21352] active:scale-[0.99] text-white font-poppins font-medium text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send size={18} />
                  <span>Send Message</span>
                </button>
              </form>
            </div>

            {/* ── Right Column: "Get in Touch" Info Card ── */}
            <div className="lg:col-span-6 space-y-8 lg:pl-4">
              <div>
                <h2 className="font-poppins text-3xl sm:text-4xl lg:text-[48px] font-medium text-[#272727] tracking-tight leading-tight">
                  Get in Touch
                </h2>
                <p className="text-gray-600 mt-2 text-base font-normal max-w-lg leading-relaxed">
                  We are here to assist you with newborn clothing sizing, personalized hampers, or orders through conscious WhatsApp shopping.
                </p>
              </div>

              {/* 4 Info Blocks */}
              <div className="space-y-6">
                {/* 1. STORE LOCATION */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#FBE6ED] flex items-center justify-center shrink-0 text-[#E21352]">
                    <MapPin size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-poppins text-sm font-semibold tracking-wider text-[#282929] uppercase">
                      STORE LOCATION
                    </h3>
                    <p className="font-poppins text-sm sm:text-base text-[#504443] leading-relaxed">
                      {storeAddress}
                    </p>
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#E21352] hover:underline pt-1"
                    >
                      <span>View Live Location on Google Maps</span>
                      <ExternalLink size={14} />
                    </a>
                  </div>
                </div>

                {/* 2. PHONE */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#DCFCE7] flex items-center justify-center shrink-0 text-[#16A34A]">
                    <Phone size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-poppins text-sm font-semibold tracking-wider text-[#282929] uppercase">
                      PHONE
                    </h3>
                    <p className="font-sans text-base sm:text-lg font-bold text-[#504443]">
                      {storePhone}
                    </p>
                    <div className="flex items-center gap-3 pt-1">
                      <a
                        href={`tel:${storePhone.replace(/\s+/g, '')}`}
                        className="text-xs font-semibold text-gray-700 hover:text-black underline"
                      >
                        Call Us
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
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#FEF3C7] flex items-center justify-center shrink-0 text-[#D97706]">
                    <Clock size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-poppins text-sm font-semibold tracking-wider text-[#282929] uppercase">
                      BUSINESS HOURS
                    </h3>
                    <div className="font-poppins text-sm sm:text-base text-[#504443] space-y-0.5">
                      <p>
                        <span className="font-medium text-gray-900">Mon – Fri:</span> 09:00 – 18:00
                      </p>
                      <p>
                        <span className="font-medium text-gray-900">Saturday:</span> 10:00 – 14:00
                      </p>
                      <p className="text-xs text-gray-500 pt-0.5">
                        Sunday: Closed for Nursery Refresh (WhatsApp Orders Active)
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. EMAIL */}
                <div className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-xl border border-gray-100 bg-[#FAFAFA] hover:bg-white hover:shadow-xs transition-all">
                  <div className="w-12 h-12 rounded-xl bg-[#EDE9FE] flex items-center justify-center shrink-0 text-[#7C3AED]">
                    <Mail size={24} />
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-poppins text-sm font-semibold tracking-wider text-[#282929] uppercase">
                      EMAIL
                    </h3>
                    <a
                      href={`mailto:${storeEmail}`}
                      className="font-poppins text-sm sm:text-base text-[#504443] hover:text-[#E21352] transition-colors break-all block"
                    >
                      {storeEmail}
                    </a>
                    <p className="text-xs text-gray-400">
                      We respond to all written inquiries within 24 hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* ─────────────────────────────────────────────────────────────
          3. PHYSICAL STOREFRONT SHOWCASE SECTION (Figma Frame 1686556757)
      ───────────────────────────────────────────────────────────── */}
      <section className="py-8 sm:py-12">
        <Container>
          <div className="relative w-full rounded-2xl overflow-hidden border border-gray-200 shadow-lg group bg-black">
            {/* Actual Baby's Bazaar Storefront Image from Figma */}
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
                className="bg-white hover:bg-gray-100 text-gray-900 font-semibold px-6 py-3 rounded-full text-xs sm:text-sm flex items-center gap-2 shadow-lg transition-all active:scale-95 shrink-0"
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
