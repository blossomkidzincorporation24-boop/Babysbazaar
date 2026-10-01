export const revalidate = 60

import { createClient } from '@/lib/supabase/server'
import { getPublicSettings } from '@/lib/actions/settings'
import Link from 'next/link'
import Navbar from '@/components/user/Navbar'
import { SplitHero } from '@/components/user/hero'
import CategoryGrid from '@/components/user/CategoryGrid'
import MilestoneBanner from '@/components/user/MilestoneBanner'
import { Suspense } from 'react'
import ProductCard from '@/components/user/ProductCard'
import GoogleReviews from '@/components/user/GoogleReviews'
import GoogleReviewsSkeleton from '@/components/user/GoogleReviewsSkeleton'
import type { Metadata } from 'next'
import { getSiteUrl, generateBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import Footer from '@/components/user/Footer'
import { BUSINESS_WHATSAPP_NUMBER } from '@/lib/constants'

export async function generateMetadata({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}): Promise<Metadata> {
  const { search } = (await searchParams) || {}
  const siteUrl = getSiteUrl()

  if (search && search.trim()) {
    return {
      title: `Search Results for "${search.trim()}" | Baby's Bazaar`,
      description: `Search results for "${search.trim()}" at Baby's Bazaar in Erode. Enquire directly on WhatsApp for product availability.`,
      robots: {
        index: false,
        follow: true,
      },
      alternates: {
        canonical: `${siteUrl}/categories`,
      },
    }
  }

  return {
    title: "All Baby Product Categories | Baby Store in Erode | Baby's Bazaar",
    description:
      "Explore all baby product categories at Baby's Bazaar in Erode — baby clothes, newborn essentials, baby care products, bedding, toys, and nursery essentials with easy WhatsApp enquiry.",
    alternates: {
      canonical: `${siteUrl}/categories`,
    },
    openGraph: {
      title: "All Baby Product Categories | Baby's Bazaar Erode",
      description:
        "Explore all baby product categories at Baby's Bazaar in Erode — baby clothes, newborn essentials, baby care products, bedding, toys, and nursery essentials.",
      url: `${siteUrl}/categories`,
    },
  }
}

export default async function CategoriesPage({
  searchParams,
}: {
  searchParams?: Promise<{ search?: string }>
}) {
  const { search } = (await searchParams) || {}
  const supabase = await createClient()

  // Concurrently fetch category page data from database with resilience
  const [
    settingsRes,
    bannersRes,
    categoriesRes,
    productsRes,
    searchRes,
  ] = await Promise.allSettled([
    getPublicSettings(),
    supabase
      .from('banners')
      .select('*')
      .eq('status', 'active')
      .order('display_order', { ascending: true }),
    supabase
      .from('categories')
      .select('id, name, slug, image, description')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .limit(20),
    supabase
      .from('products')
      .select('id, title, slug, price, product_images, description, categories(name, slug)')
      .eq('status', 'active')
      .limit(6),
    search && search.trim()
      ? supabase
          .from('products')
          .select('id, title, slug, price, product_images, description, short_description, new_arrival, best_seller, categories(name, slug)')
          .eq('status', 'active')
          .or(`title.ilike.%${search.trim()}%,description.ilike.%${search.trim()}%,short_description.ilike.%${search.trim()}%`)
          .order('created_at', { ascending: false })
          .limit(40)
      : Promise.resolve({ data: [] }),
  ])

  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : null
  const banners = bannersRes.status === 'fulfilled' ? bannersRes.value?.data || [] : []
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
    .slice(0, 10)
  const displayProducts = productsRes.status === 'fulfilled' ? productsRes.value?.data || [] : []
  const searchResults = searchRes.status === 'fulfilled' ? (searchRes.value as any)?.data || [] : []

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-[#FFE8EE] selection:text-[#E1144B] pb-16 sm:pb-0">
      {/* 1. Header / Navbar */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Dynamic Search Results Section (if search parameter is provided) */}
      {search ? (
        <section className="max-w-[1312px] mx-auto px-4 sm:px-6 py-8">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-gray-100 flex-wrap gap-3">
            <div>
              <h1 className="font-roboto-slab text-2xl sm:text-3xl font-bold text-gray-900">
                Search Results for &ldquo;{search}&rdquo;
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 mt-1 font-poppins">
                Found {searchResults.length} matching item{searchResults.length === 1 ? '' : 's'}
              </p>
            </div>
            <Link
              href="/categories"
              className="text-xs font-semibold text-[#FF2E63] hover:underline"
            >
              Clear Search
            </Link>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 w-full">
              {searchResults.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  whatsappNumber={settings?.whatsapp_number}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8">
              <p className="font-roboto-slab text-lg font-bold text-gray-800 mb-2">
                No products found matching &ldquo;{search}&rdquo;
              </p>
              <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
                Try searching with different keywords, browse our categories below, or contact our WhatsApp concierge for custom assistance.
              </p>
              <div className="flex items-center justify-center gap-3 flex-wrap">
                <Link
                  href="/categories"
                  className="px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                  View All Categories
                </Link>
                <a
                  href={`https://wa.me/${settings?.whatsapp_number?.replace(/\D/g, '') || BUSINESS_WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hi Baby's Bazaar, I am looking for: ${search}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Ask about this product on WhatsApp"
                  className="px-5 py-2.5 rounded-full bg-[#25D366] text-white text-xs font-semibold hover:bg-[#20bd5a] transition-colors"
                >
                  Ask on WhatsApp
                </a>
              </div>
            </div>
          )}
        </section>
      ) : (
        <>
          {/* 2. Split Hero Section (Mother & Baby + Typography) */}
          <SplitHero slides={banners || []} />

          {/* 3. Product Categories (10 Categories with Red Curved Badges) */}
          <CategoryGrid categories={categories || []} />

          {/* 4. Milestone Banner ("Find What Fits Their Little Stage") */}
          <MilestoneBanner />

          {/* 5. Curated Products (6 Cards in 3x2 Grid + "View all >" link) */}
          <section className="max-w-[1312px] mx-auto px-4 sm:px-6 py-6 sm:py-8">
            {displayProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6 lg:gap-8 w-full">
                  {displayProducts.slice(0, 6).map((product: any) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      whatsappNumber={settings?.whatsapp_number}
                    />
                  ))}
                </div>

                {/* View all button on bottom right */}
                <div className="flex justify-end items-center gap-2 mt-8 sm:mt-10">
                  <Link
                    href="/categories"
                    className="inline-flex items-center gap-2 text-[#8B5CF6] hover:text-[#7C3AED] text-lg sm:text-[20px] font-normal transition-colors"
                  >
                    <span>View all</span>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M19.293 12L20 11.293L20.707 12L20 12.707L19.293 12ZM4.29297 13C4.02775 13 3.7734 12.8946 3.58586 12.7071C3.39833 12.5195 3.29297 12.2652 3.29297 12C3.29297 11.7348 3.39833 11.4804 3.58586 11.2929C3.7734 11.1053 4.02775 11 4.29297 11V13ZM14 5.29297L20 11.293L18.586 12.707L12.586 6.70697L14 5.29297ZM20 12.707L14 18.707L12.586 17.293L18.586 11.293L20 12.707ZM19.293 13H4.29297V11H19.293V13Z"
                        fill="#8B5CF6"
                      />
                    </svg>
                  </Link>
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-gray-500 font-sans">
                <p className="text-base font-medium">No products available yet.</p>
              </div>
            )}
          </section>
        </>
      )}

      {/* 6. Rating And Reviews (Real Google Places Reviews) */}
      <Suspense fallback={<GoogleReviewsSkeleton />}>
        <GoogleReviews />
      </Suspense>

      {/* 7. Footer */}
      <Footer settings={settings} />

      {/* SEO: BreadcrumbList Structured Data */}
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
        ])}
      />
    </div>
  )
}
