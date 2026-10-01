export const revalidate = 60

import { createClient } from '@/lib/supabase/server'
import { getPublicSettings } from '@/lib/actions/settings'
import { getActiveOfferBanner } from '@/lib/actions/offers'
import { getActiveDeliveryFeatures } from '@/lib/actions/delivery'
import Link from 'next/link'
import Navbar from '@/components/user/Navbar'
import { HeroSlider } from '@/components/user/hero'
import CategoryGrid from '@/components/user/CategoryGrid'
import ProductCard from '@/components/user/ProductCard'
import AnnouncementRibbon from '@/components/user/AnnouncementRibbon'
import ReelsSection from '@/components/user/ReelsSection'
import { Suspense } from 'react'
import PromoBanner from '@/components/user/PromoBanner'
import CustomerPhotos from '@/components/user/CustomerPhotos'
import GoogleReviews from '@/components/user/GoogleReviews'
import GoogleReviewsSkeleton from '@/components/user/GoogleReviewsSkeleton'
import FaqSection from '@/components/user/FaqSection'
import Footer from '@/components/user/Footer'
import Container from '@/components/ui/Container'
import NewArrivalsSlider from '@/components/user/NewArrivalsSlider'
import BestSellersSlider from '@/components/user/BestSellersSlider'
import type { Metadata } from 'next'
import { getSiteUrl, generateLocalBusinessSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = {
  title: "Baby Products Shop in Erode | Baby's Bazaar",
  description:
    "Explore Baby's Bazaar in Erode, Tamil Nadu. Quality newborn essentials, organic baby clothing, bedding, and nursery accessories with easy WhatsApp enquiry.",
  alternates: {
    canonical: getSiteUrl(),
  },
  openGraph: {
    title: "Baby Products Shop in Erode | Baby's Bazaar",
    description:
      "Explore Baby's Bazaar in Erode, Tamil Nadu. Quality newborn essentials, baby clothing, bedding, and nursery accessories.",
    url: getSiteUrl(),
  },
}

export default async function UserHomePage() {
  const supabase = await createClient()

  // Concurrently fetch all storefront data with resilience
  const [
    settingsRes,
    bannersRes,
    offerBannerRes,
    ribbonFeaturesRes,
    trustBadgesRes,
    categoriesRes,
    newArrivalsRes,
    bestSellersRes,
    photosRes,
    reelsRes,
  ] = await Promise.allSettled([
    getPublicSettings(),
    supabase
      .from('banners')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true }),
    getActiveOfferBanner(),
    getActiveDeliveryFeatures('ribbon'),
    getActiveDeliveryFeatures('trust_badge'),
    supabase
      .from('categories')
      .select('id, name, slug, image, description, sort_order')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .limit(20),
    supabase
      .from('products')
      .select('id, title, slug, price, product_images, description, new_arrival, categories(name, slug)')
      .eq('status', 'active')
      .eq('new_arrival', true)
      .limit(8),
    supabase
      .from('products')
      .select('id, title, slug, price, product_images, description, best_seller, categories(name, slug)')
      .eq('status', 'active')
      .eq('best_seller', true)
      .limit(8),
    supabase
      .from('photos')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12),
    supabase
      .from('reels')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(8),
  ])

  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : null
  const banners = bannersRes.status === 'fulfilled' ? bannersRes.value?.data || [] : []
  const offerBanner = offerBannerRes.status === 'fulfilled' ? offerBannerRes.value : null
  const ribbonFeatures = ribbonFeaturesRes.status === 'fulfilled' ? ribbonFeaturesRes.value : []
  const rawCategories = categoriesRes.status === 'fulfilled' ? categoriesRes.value?.data || [] : []
  const toySubcategorySlugs = new Set([
    'baby-toys',
    'educational-toys',
    'remote-control-toys',
    'cars-and-vehicles',
    'dolls-and-pretend-play',
    'building-toys',
    'musical-toys',
    'outdoor-toys',
    'soft-toys',
    'activity-and-puzzle',
    'ride-on-toys',
  ])
  const categories = rawCategories
    .filter((c: any) => !toySubcategorySlugs.has(c.slug) && !(c.description && c.description.toLowerCase().includes('[parent:toys]')))
    .slice(0, 8)
  const newArrivals = newArrivalsRes.status === 'fulfilled' ? newArrivalsRes.value?.data || [] : []
  const bestSellers = bestSellersRes.status === 'fulfilled' ? bestSellersRes.value?.data || [] : []
  const photos = photosRes.status === 'fulfilled' ? photosRes.value?.data || [] : []
  const reels = reelsRes.status === 'fulfilled' ? reelsRes.value?.data || [] : []

  const displayNewArrivals = (newArrivals || []).filter(Boolean)
  const displayBestSellers = (bestSellers || []).filter(Boolean)

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#FFE8EE] selection:text-[#E1144B] pb-16 sm:pb-0">
      {/* 1. Header / Navbar */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* 2. Hero Slider */}
      <HeroSlider slides={banners || []} />

      {/* 3. Product Categories */}
      <CategoryGrid categories={categories || []} />

      {/* 4. New Arrivals Slider (8 products with left/right smooth slide) */}
      <NewArrivalsSlider
        products={displayNewArrivals}
        whatsappNumber={settings?.whatsapp_number}
      />

      {/* 5. Shipping & Perks Ticker Ribbon */}
      <AnnouncementRibbon items={ribbonFeatures || []} />

      {/* 6. Trending Reels & Unboxings (Slider with smooth left/right slide) */}
      <ReelsSection
        reels={reels || []}
        whatsappNumber={settings?.whatsapp_number}
      />

      {/* 7. Best Sellers Slider (8 products with left/right smooth slide) */}
      <BestSellersSlider
        products={displayBestSellers}
        whatsappNumber={settings?.whatsapp_number}
      />

      {/* 8. Promotional Banner ("Little Things. Big Smiles.") */}
      <PromoBanner offer={offerBanner} />

      {/* 9. Loved by Little Ones ❤️ */}
      <CustomerPhotos photos={photos || []} />

      {/* 10. Rating And Reviews (Real Google Places Reviews) */}
      <Suspense fallback={<GoogleReviewsSkeleton />}>
        <GoogleReviews />
      </Suspense>

      {/* 11. Frequently Asked Questions (FAQ Accordion) */}
      <FaqSection />

      {/* 12. Footer */}
      <Footer settings={settings} />

      {/* SEO: Structured Data for LocalBusiness */}
      <JsonLd data={generateLocalBusinessSchema(settings)} />
    </div>
  )
}
