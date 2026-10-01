'use client'

import Link from 'next/link'
import BabyBazaarLogo from '@/components/admin/BabyBazaarLogo'
import { MapPin, Phone } from 'lucide-react'
import Container from '@/components/ui/Container'
import {
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_PHONE_TEL,
  BUSINESS_GOOGLE_MAPS_URL,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_TWITTER_URL,
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_TAGLINE,
} from '@/lib/constants'

interface FooterProps {
  settings?: {
    whatsapp_number?: string | null
    phone?: string | null
    email?: string | null
    address?: string | null
  } | null
}

export default function Footer({ settings }: FooterProps) {
  const cleanPhone = settings?.phone || BUSINESS_PHONE_DISPLAY
  const phoneTel = `tel:${cleanPhone.replace(/[^+\d]/g, '') || '+918489824888'}`
  const address = settings?.address || BUSINESS_ADDRESS
  const mapUrl = settings?.address ? `https://maps.google.com/?q=${encodeURIComponent(settings.address)}` : BUSINESS_GOOGLE_MAPS_URL
  const waNumber = settings?.whatsapp_number?.replace(/\D/g, '') || BUSINESS_WHATSAPP_NUMBER

  return (
    <footer className="w-full bg-[#FBE6ED] border-t border-[#F2D0DC] text-[#121212] select-none">
      <Container className="py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12 pb-12">
          {/* Column 1: Brand Info & Socials */}
          <div className="flex flex-col justify-between space-y-6">
            <div className="space-y-5">
              <Link href="/" className="inline-block hover:opacity-95 transition-opacity" aria-label="Baby's Bazaar Home">
                <BabyBazaarLogo className="h-12 sm:h-14" width={160} height={70} />
              </Link>
              <p className="font-roboto-slab text-base sm:text-lg text-black leading-relaxed font-normal max-w-sm">
                {BUSINESS_TAGLINE}
              </p>
            </div>

            {/* Social Icons */}
            <div className="space-y-3">
              <h4 className="font-roboto-slab text-sm sm:text-base font-bold text-black">
                Follow us on
              </h4>
              <div className="flex items-center gap-3">
                {/* Instagram */}
                <a
                  href={BUSINESS_INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Baby's Bazaar on Instagram"
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs hover:shadow-md transition-all hover:scale-105"
                >
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M14.12 6H25.88C30.36 6 34 9.64 34 14.12V25.88C34 28.0336 33.1445 30.0989 31.6217 31.6217C30.0989 33.1445 28.0336 34 25.88 34H14.12C9.64 34 6 30.36 6 25.88V14.12C6 11.9664 6.8555 9.90109 8.37829 8.37829C9.90109 6.8555 11.9664 6 14.12 6ZM13.84 8.8C12.5033 8.8 11.2214 9.331 10.2762 10.2762C9.331 11.2214 8.8 12.5033 8.8 13.84V26.16C8.8 28.946 11.054 31.2 13.84 31.2H26.16C27.4967 31.2 28.7786 30.669 29.7238 29.7238C30.669 28.7786 31.2 27.4967 31.2 26.16V13.84C31.2 11.054 28.946 8.8 26.16 8.8H13.84ZM27.35 10.9C27.8141 10.9 28.2593 11.0844 28.5874 11.4126C28.9156 11.7408 29.1 12.1859 29.1 12.65C29.1 13.1141 28.9156 13.5592 28.5874 13.8874C28.2593 14.2156 27.8141 14.4 27.35 14.4C26.8859 14.4 26.4408 14.2156 26.1126 13.8874C25.7844 13.5592 25.6 13.1141 25.6 12.65C25.6 12.1859 25.7844 11.7408 26.1126 11.4126C26.4408 11.0844 26.8859 10.9 27.35 10.9ZM20 13C21.8565 13 23.637 13.7375 24.9497 15.0503C26.2625 16.363 27 18.1435 27 20C27 21.8565 26.2625 23.637 24.9497 24.9497C23.637 26.2625 21.8565 27 20 27C18.1435 27 16.363 26.2625 15.0503 24.9497C13.7375 23.637 13 21.8565 13 20C13 18.1435 13.7375 16.363 15.0503 15.0503C16.363 13.7375 18.1435 13 20 13ZM20 15.8C18.8861 15.8 17.8178 16.2425 17.0302 17.0302C16.2425 17.8178 15.8 18.8861 15.8 20C15.8 21.1139 16.2425 22.1822 17.0302 22.9698C17.8178 23.7575 18.8861 24.2 20 24.2C21.1139 24.2 22.1822 23.7575 22.9698 22.9698C23.7575 22.1822 24.2 21.1139 24.2 20C24.2 18.8861 23.7575 17.8178 22.9698 17.0302C22.1822 16.2425 21.1139 15.8 20 15.8Z"
                      fill="#F91603"
                    />
                  </svg>
                </a>

                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Baby's Bazaar on WhatsApp"
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs hover:shadow-md transition-all hover:scale-105"
                >
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M29.9196 10.0741C28.6294 8.77782 27.0929 7.75002 25.3995 7.05058C23.7061 6.35114 21.8898 5.99403 20.0563 6.00008C12.3739 6.00008 6.11256 12.2301 6.11256 19.874C6.11256 22.324 6.7598 24.704 7.96985 26.804L6 34L13.3869 32.068C15.4271 33.174 17.7206 33.762 20.0563 33.762C27.7387 33.762 34 27.532 34 19.888C34 16.178 32.5508 12.6921 29.9196 10.0741ZM20.0563 31.41C17.9739 31.41 15.9337 30.85 14.1467 29.8L13.7246 29.548L9.33467 30.696L10.5025 26.44L10.2211 26.006C9.06389 24.1679 8.44954 22.043 8.44824 19.874C8.44824 13.5181 13.6543 8.33807 20.0422 8.33807C23.1377 8.33807 26.0503 9.54207 28.2312 11.7261C29.3112 12.7955 30.1671 14.0676 30.7492 15.4687C31.3313 16.8698 31.628 18.372 31.6221 19.888C31.6503 26.244 26.4442 31.41 20.0563 31.41ZM26.4161 22.786C26.0643 22.618 24.3477 21.778 24.0382 21.652C23.7146 21.54 23.4894 21.484 23.2502 21.82C23.0111 22.17 22.3497 22.954 22.1528 23.178C21.9558 23.416 21.7447 23.444 21.393 23.262C21.0412 23.094 19.9156 22.716 18.593 21.54C17.5518 20.616 16.8623 19.482 16.6513 19.132C16.4543 18.782 16.6231 18.6 16.806 18.418C16.9608 18.264 17.1578 18.012 17.3266 17.816C17.4955 17.62 17.5658 17.466 17.6784 17.242C17.791 17.004 17.7347 16.808 17.6503 16.64C17.5658 16.472 16.8623 14.7641 16.5809 14.0641C16.2995 13.3921 16.004 13.4761 15.793 13.4621H15.1176C14.8784 13.4621 14.5126 13.5461 14.1889 13.8961C13.8794 14.2461 12.9789 15.0861 12.9789 16.794C12.9789 18.502 14.2312 20.154 14.4 20.378C14.5688 20.616 16.8623 24.116 20.3518 25.614C21.1819 25.978 21.8291 26.188 22.3357 26.342C23.1658 26.608 23.9256 26.566 24.5307 26.482C25.206 26.384 26.599 25.642 26.8804 24.83C27.1759 24.018 27.1759 23.332 27.0774 23.178C26.9789 23.024 26.7678 22.954 26.4161 22.786Z"
                      fill="#F91603"
                    />
                  </svg>
                </a>

                {/* Twitter / X */}
                <a
                  href={BUSINESS_TWITTER_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Open Baby's Bazaar on X"
                  className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-xs hover:shadow-md transition-all hover:scale-105"
                >
                  <svg width="20" height="20" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M28.05 7H32.344L22.964 17.6735L34 32.2H25.36L18.588 23.3915L10.848 32.2H6.55L16.582 20.7798L6 7.00199H14.86L20.972 15.0518L28.05 7ZM26.54 29.6419H28.92L13.56 9.42506H11.008L26.54 29.6419Z"
                      fill="#F91603"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4 sm:pl-4">
            <h4 className="font-roboto-slab text-base sm:text-lg font-bold text-black">
              Quick Links
            </h4>
            <ul className="space-y-3 font-roboto-slab text-base text-black/85">
              <li>
                <Link href="/about-us" className="hover:text-[#F40436] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/categories" className="hover:text-[#F40436] transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#F40436] transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="/#faq" className="hover:text-[#F40436] transition-colors">
                  FAQs
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Explore Collections */}
          <div className="space-y-4 sm:pl-4">
            <h4 className="font-roboto-slab text-base sm:text-lg font-bold text-black">
              Explore Collections
            </h4>
            <ul className="space-y-3 font-roboto-slab text-base text-black/85">
              <li>
                <Link href="/toys" className="hover:text-[#F40436] transition-colors">
                  Toys Collection
                </Link>
              </li>
              <li>
                <Link href="/#best-sellers" className="hover:text-[#F40436] transition-colors">
                  Best Sellers
                </Link>
              </li>
              <li>
                <Link href="/#new-arrivals" className="hover:text-[#F40436] transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/#photos" className="hover:text-[#F40436] transition-colors">
                  Customer Moments
                </Link>
              </li>
              <li>
                <Link href="/#reels" className="hover:text-[#F40436] transition-colors">
                  Trending Reels
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact Us */}
          <div className="space-y-5">
            <h4 className="font-roboto-slab text-base sm:text-lg font-semibold text-[#E21352]">
              Contact us
            </h4>

            {/* Address */}
            <div className="flex items-start gap-3">
              <MapPin size={22} className="text-black shrink-0 mt-0.5" />
              <p className="font-roboto-slab text-sm sm:text-base text-black leading-snug">
                {address}
              </p>
            </div>

            {/* Live Map Button */}
            <div>
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open Baby's Bazaar location in Google Maps"
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-[#E21352] hover:bg-[#C2103F] active:scale-95 text-white font-roboto-slab text-sm font-semibold shadow-xs transition-all cursor-pointer"
              >
                <MapPin size={18} />
                <span>Google map Live location</span>
              </a>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3 pt-1">
              <Phone size={22} className="text-black shrink-0 mt-0.5" />
              <div>
                <span className="font-roboto-slab text-xs font-semibold uppercase tracking-widest text-black/70 block">
                  PHONE
                </span>
                <a
                  href={phoneTel}
                  className="font-roboto-slab text-sm sm:text-base font-normal text-black hover:text-[#E21352] transition-colors block mt-0.5"
                  aria-label={`Call Baby's Bazaar at ${cleanPhone}`}
                >
                  {cleanPhone}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-8 border-t border-[#F2D0DC] flex flex-col sm:flex-row items-center justify-between gap-4 font-roboto-slab text-sm text-[#121212]">
          <p>© 2026 Baby&apos;s Bazaar. All rights reserved.</p>
          <p className="text-gray-600 text-xs sm:text-sm">Erode, Tamil Nadu, India</p>
        </div>
      </Container>
    </footer>
  )
}

