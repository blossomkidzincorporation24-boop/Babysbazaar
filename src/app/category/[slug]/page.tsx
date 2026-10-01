export const revalidate = 60

import type { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPublicSettings } from '@/lib/actions/settings'
import { getSiteUrl, generateBreadcrumbSchema, generateItemListSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import CategoryDetailClient from '@/components/user/CategoryDetailClient'
import { ProductItem } from '@/components/user/ProductCard'

// Backward-compatible redirect map for legacy slugs to match database slugs
const LEGACY_SLUG_MAP: Record<string, string> = {
  'baby-clothing': 'clothing',
  'babys-clothing': 'clothing',
  'babys-beeding-and-beds': 'baby-bedding-beds',
  'baby-bedding-and-beds': 'baby-bedding-beds',
  'mom-maternity': 'maternity-nursing',
  'maternity-and-nursing': 'maternity-nursing',
  'mosquito-protection': 'baby-safety-and-protection',
  'baby-safety-protection': 'baby-safety-and-protection',
  'babys-travel-acceseries': 'baby-travel-and-strollers',
  'baby-travel-strollers': 'baby-travel-and-strollers',
  'babys-bath-and-care': 'baby-bath-care',
  'baby-bath-and-care': 'baby-bath-care',
  'babys-feeding': 'baby-feeding',
  'babys-walker-ride-on': 'baby-walkers-ride-ons',
  'baby-walkers-and-ride-ons': 'baby-walkers-ride-ons',
  'babys-cycle-and-tricycle': 'baby-cycles-tricycles',
  'baby-cycles-and-tricycles': 'baby-cycles-tricycles',
}

// Helper to format slug to human-readable title (e.g. new-clothings -> "New clothings")
function formatSlugToTitle(slug: string): string {
  if (slug === 'new-clothings') return 'New Clothings'
  if (slug === 'clothing' || slug === 'baby-clothes') return 'Baby Clothes'
  if (slug === 'baby-toys') return 'Baby Toys'
  if (slug === 'baby-feeding' || slug === 'babys-feeding') return "Baby's Feeding"
  if (slug.includes('bed')) return "Baby's Beds & Bedding"
  if (slug.includes('safety') || slug.includes('protection')) return 'Baby Safety & Protection'
  if (slug.includes('walker')) return 'Baby Walkers & Ride-Ons'
  if (slug.includes('cycle')) return "Baby's Cycles & Tricycles"
  if (slug.includes('travel') || slug.includes('carrier') || slug.includes('stroller')) return "Baby Travel & Strollers"
  if (slug.includes('maternity') || slug.includes('nursing') || slug.includes('mom')) return "Maternity & Nursing"
  if (slug.includes('bath') || slug.includes('care')) return "Baby Bath & Care"

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

  let { data: category } = await supabase
    .from('categories')
    .select('name, slug, description, image')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (!category && LEGACY_SLUG_MAP[rawSlug]) {
    const { data: fallbackCat } = await supabase
      .from('categories')
      .select('name, slug, description, image')
      .eq('slug', LEGACY_SLUG_MAP[rawSlug])
      .eq('status', 'active')
      .maybeSingle()
    if (fallbackCat) category = fallbackCat
  }

  const name = category?.name || formatSlugToTitle(slug)
  const title = `${name} in Erode | Baby's Bazaar`
  const description =
    category?.description ||
    `Shop quality ${name.toLowerCase()} in Erode at Baby's Bazaar. Curated newborn essentials, baby clothes & products with instant WhatsApp enquiry.`
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
  if (slug === 'toys') {
    redirect('/toys')
  }
  const toySubcategorySlugs = [
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
  ]
  if (toySubcategorySlugs.includes(slug)) {
    redirect(`/toys/${slug}`)
  }
  if (LEGACY_SLUG_MAP[slug] && LEGACY_SLUG_MAP[slug] !== slug) {
    redirect(`/category/${LEGACY_SLUG_MAP[slug]}`)
  }
  const resolvedSlug = LEGACY_SLUG_MAP[slug] || slug
  const supabase = await createClient()

  // Concurrently fetch settings, category, and matching products
  let [settings, { data: category }] = await Promise.all([
    getPublicSettings(),
    supabase
      .from('categories')
      .select('id, name, slug, description')
      .eq('slug', resolvedSlug)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  // Fallback: If not found, try original slug or lookup
  if (!category && resolvedSlug !== slug) {
    const { data: originalCat } = await supabase
      .from('categories')
      .select('id, name, slug, description')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle()
    if (originalCat) category = originalCat
  }

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
        short_description: p.short_description,
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
    <div className="min-h-screen flex flex-col bg-white">
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

      {/* SEO: BreadcrumbList & ItemList Structured Data */}
      <JsonLd
        data={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Categories', url: '/categories' },
            { name: displayName, url: `/category/${slug}` },
          ]),
          generateItemListSchema(
            `${displayName} - Baby's Bazaar Erode`,
            categoryProducts.map((p) => ({
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
