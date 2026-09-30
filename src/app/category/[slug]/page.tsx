export const revalidate = 60

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPublicSettings } from '@/lib/actions/settings'
import { getSiteUrl, generateBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import CategoryDetailClient from '@/components/user/CategoryDetailClient'
import { ProductItem } from '@/components/user/ProductCard'

// Backward-compatible redirect map for legacy slugs
const LEGACY_SLUG_MAP: Record<string, string> = {
  'baby-clothing': 'clothing',
  'babys-beeding-and-beds': 'baby-bedding-and-beds',
  'mom-maternity': 'maternity-and-nursing',
  'mosquito-protection': 'baby-safety-and-protection',
  'babys-travel-acceseries': 'baby-travel-and-strollers',
  'babys-bath-and-care': 'baby-bath-and-care',
  'babys-feeding': 'baby-feeding',
  'babys-walker-ride-on': 'baby-walkers-and-ride-ons',
  'babys-cycle-and-tricycle': 'baby-cycles-and-tricycles',
}

// Helper to format slug to human-readable title (e.g. new-clothings -> "New clothings")
function formatSlugToTitle(slug: string): string {
  if (slug === 'new-clothings') return 'New Clothings'
  if (slug === 'baby-clothes') return 'Baby Clothes'
  if (slug === 'baby-toys') return 'Baby Toys'
  if (slug === 'baby-feeding' || slug === 'babys-feeding') return "Baby's Feeding"
  if (slug.includes('bed')) return "Baby's Beds & Bedding"
  if (slug.includes('safety') || slug === 'mosquito-protection') return 'Baby Safety & Protection'
  if (slug.includes('walker')) return 'Baby Walkers & Ride-Ons'
  if (slug.includes('cycle')) return "Baby's Cycles & Tricycles"
  if (slug.includes('travel') || slug.includes('carrier')) return "Baby Travel & Strollers"
  if (slug.includes('maternity') || slug.includes('mom')) return "Maternity & Nursing"

  return slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug: rawSlug } = await params
  const slug = LEGACY_SLUG_MAP[rawSlug] || rawSlug
  const supabase = await createClient()

  const { data: category } = await supabase
    .from('categories')
    .select('name, slug, description, image')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  const name = category?.name || formatSlugToTitle(slug)
  const title = `${name} in Erode`
  const description =
    category?.description ||
    `Explore quality ${name.toLowerCase()} at Baby's Bazaar in Erode, Tamil Nadu. Browse our curated collection and enquire directly via WhatsApp.`
  const canonicalUrl = `${getSiteUrl()}/category/${slug}`
  const image = category?.image || `${getSiteUrl()}/babys-bazaar-logo.png`

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
          alt: `${name} at Baby's Bazaar Erode`,
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

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  if (LEGACY_SLUG_MAP[slug]) {
    redirect(`/category/${LEGACY_SLUG_MAP[slug]}`)
  }
  const supabase = await createClient()

  // Concurrently fetch settings, category, and matching products
  const [settings, { data: category }] = await Promise.all([
    getPublicSettings(),
    supabase
      .from('categories')
      .select('id, name, slug, description')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  // If category is not found or inactive in Supabase, show 404
  if (!category) {
    notFound()
  }

  let categoryProducts: ProductItem[] = []

  if (category?.id) {
    const { data: dbProducts } = await supabase
      .from('products')
      .select('id, title, slug, price, product_images, description, short_description, new_arrival, best_seller, categories(name, slug)')
      .eq('category_id', category.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })

    if (dbProducts && dbProducts.length > 0) {
      categoryProducts = dbProducts.map((p: any) => ({
        id: p.id,
        title: p.title,
        slug: p.slug,
        price: p.price,
        description: p.description,
        product_images: p.product_images,
        new_arrival: p.new_arrival,
        best_seller: p.best_seller,
        category_tag: p.categories?.name || category.name,
      }))
    }
  }

  // Category display name
  const displayName = category?.name || formatSlugToTitle(slug)

  return (
    <div className="min-h-screen flex flex-col bg-white pb-16 sm:pb-0">
      {/* Top Navigation Bar */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Main Content with Exact Figma Layout & Filter Sidebar */}
      <main className="flex-1">
        <CategoryDetailClient
          categoryName={displayName}
          categorySlug={slug}
          categoryDescription={category?.description}
          initialProducts={categoryProducts}
          whatsappNumber={settings?.whatsapp_number}
        />
      </main>

      {/* Footer */}
      <Footer settings={settings} />

      {/* SEO: BreadcrumbList Structured Data */}
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'Categories', url: '/categories' },
          { name: displayName, url: `/category/${slug}` },
        ])}
      />
    </div>
  )
}
