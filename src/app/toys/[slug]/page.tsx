export const revalidate = 60

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import ToySubcategoryClient from '@/components/toys/ToySubcategoryClient'
import { getPublicSettings } from '@/lib/actions/settings'
import {
  getToySubcategoryBySlug,
  getToySubcategories,
  getToySubcategoryProducts,
} from '@/lib/actions/toys'
import { cleanToyDescription } from '@/lib/utils'
import { getSiteUrl, generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  if (slug === 'toys') {
    redirect('/toys')
  }

  const subcategory = await getToySubcategoryBySlug(slug)
  if (!subcategory) {
    return {
      title: "Toy Category Not Found | Baby's Bazaar",
      description: "The requested toy category could not be found.",
    }
  }

  const cleanDesc = cleanToyDescription(subcategory.description)
  const title = `${subcategory.name} in Erode | Baby's Bazaar Toys`
  const description =
    cleanDesc ||
    `Shop quality ${subcategory.name.toLowerCase()} in Erode at Baby's Bazaar. Browse our collection and enquire directly via WhatsApp.`
  const canonicalUrl = `${getSiteUrl()}/toys/${slug}`
  const image = subcategory.image || 'https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?w=800&q=80'

  return {
    title,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      images: [
        {
          url: image,
          alt: `${subcategory.name} at Baby's Bazaar Erode`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function ToySubcategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (slug === 'toys') {
    redirect('/toys')
  }

  const [settings, subcategory, siblingSubcategories] = await Promise.all([
    getPublicSettings(),
    getToySubcategoryBySlug(slug),
    getToySubcategories(false),
  ])

  if (!subcategory) {
    notFound()
  }

  const products = await getToySubcategoryProducts(subcategory.id)

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Navbar */}
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
          <Link href="/toys" className="hover:text-[#FF2E63] transition-colors">
            Toys
          </Link>
          <span className="text-gray-300 select-none">&gt;</span>
          <span className="text-gray-900 font-bold">{subcategory.name}</span>
        </nav>

        {/* Client Subcategory View */}
        <ToySubcategoryClient
          subcategory={subcategory}
          siblingSubcategories={siblingSubcategories}
          initialProducts={products}
          whatsappNumber={settings?.whatsapp_number}
        />
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* SEO: BreadcrumbList & ItemList Structured Data */}
      <JsonLd
        data={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Categories', url: '/categories' },
            { name: 'Toys', url: '/toys' },
            { name: subcategory.name, url: `/toys/${slug}` },
          ]),
          generateItemListSchema(
            `${subcategory.name} - Baby's Bazaar Erode`,
            products.map((p) => ({
              name: p.title,
              url: `/product/${p.slug}`,
              image: p.product_images?.[0],
              price: p.price,
            }))
          ),
        ]}
      />
    </div>
  )
}
