export const revalidate = 60

import type { Metadata } from 'next'
import Link from 'next/link'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import ToyHeroBanner from '@/components/toys/ToyHeroBanner'
import ToyCategoryCard from '@/components/toys/ToyCategoryCard'
import ProductCard from '@/components/user/ProductCard'
import { getPublicSettings } from '@/lib/actions/settings'
import { getToySubcategories, getAllToyProducts } from '@/lib/actions/toys'
import { getSiteUrl } from '@/lib/seo'
import { Sparkles, ArrowRight, Grid, Heart } from 'lucide-react'

export const metadata: Metadata = {
  title: "Baby & Kids Toys | Fun, Learn & Grow | Baby's Bazaar",
  description:
    "Explore baby toys, educational STEM toys, remote control cars, building blocks, musical toys, and soft plushies at Baby's Bazaar in Erode. Direct WhatsApp enquiry & fast dispatch.",
  alternates: {
    canonical: `${getSiteUrl()}/toys`,
  },
  openGraph: {
    title: "Baby & Kids Toys | Baby's Bazaar",
    description:
      "Explore curated toys for curious minds: baby toys, educational STEM, RC vehicles, building blocks & more.",
    url: `${getSiteUrl()}/toys`,
    images: [
      {
        url: 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=1200&q=85',
        alt: "Baby's Bazaar Toys Collection",
      },
    ],
  },
}

export default async function ToysLandingPage() {
  const [settings, subcategories, products] = await Promise.all([
    getPublicSettings(),
    getToySubcategories(false), // only active subcategories
    getAllToyProducts(12),
  ])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      <main className="flex-1 max-w-[1312px] mx-auto px-4 sm:px-6 pt-4 sm:pt-6 pb-20 w-full">
        {/* Breadcrumb Navigation */}
        <nav
          aria-label="Breadcrumb"
          className="mb-4 sm:mb-6 flex items-center flex-wrap gap-2 text-xs font-semibold text-gray-500 font-poppins"
        >
          <Link href="/" className="hover:text-[#FF2E63] transition-colors">
            Home
          </Link>
          <span className="text-gray-300 select-none">&gt;</span>
          <Link href="/categories" className="hover:text-[#FF2E63] transition-colors">
            Categories
          </Link>
          <span className="text-gray-300 select-none">&gt;</span>
          <span className="text-gray-900 font-bold">Toys</span>
        </nav>

        {/* 1. HERO BANNER: "Fun, Learn & Grow" */}
        <ToyHeroBanner />

        {/* 2. SHOP BY CATEGORY SECTION */}
        <section className="mb-16">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-8 pb-4 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF2E63]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[#FF2E63] font-poppins">
                  Browse by Subcategory
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 font-roboto-slab tracking-tight">
                Shop by Category
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 font-medium">
              Showing <span className="font-bold text-gray-900">{subcategories.length}</span> curated toy categories
            </p>
          </div>

          {/* Attractive 11 Category Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {subcategories.map((subcat) => (
              <ToyCategoryCard key={subcat.id} category={subcat} />
            ))}
          </div>
        </section>

        {/* 3. FEATURED PRODUCTS (IF AVAILABLE) */}
        {products && products.length > 0 && (
          <section className="pt-8 border-t border-gray-100">
            <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <Sparkles size={14} className="text-[#FF2E63]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-700 font-poppins">
                    Handpicked Favorites
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 font-roboto-slab">
                  Popular in Toys
                </h3>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
              {products.map((prod: any) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  whatsappNumber={settings?.whatsapp_number}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <Footer settings={settings} />
    </div>
  )
}
