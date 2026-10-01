export const revalidate = 60

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getPublicSettings } from '@/lib/actions/settings'
import { getSiteUrl, generateProductSchema, generateBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import ProductDetailView, { DetailedProduct } from '@/components/user/ProductDetailView'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: dbProduct } = await supabase
    .from('products')
    .select('id, title, slug, price, description, short_description, product_images, categories(name, slug), images:product_images(*)')
    .eq('slug', slug)
    .eq('status', 'active')
    .maybeSingle()

  if (!dbProduct) {
    return {
      title: "Product Not Found | Baby's Bazaar",
      description: 'The requested baby product could not be found.',
    }
  }

  const categoryName = (dbProduct.categories as any)?.name || 'Baby Products'
  const title = dbProduct.title
  const rawDescription =
    dbProduct.short_description ||
    dbProduct.description ||
    `Explore ${dbProduct.title} (${categoryName}) at Baby's Bazaar in Erode, Tamil Nadu. Enquire via WhatsApp for sizing and delivery.`

  const description = rawDescription.replace(/<[^>]*>?/gm, '').replace(/\s+/g, ' ').trim().slice(0, 160)

  // Primary image
  const images = ((dbProduct.images as any[]) || []).sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.sort_order || 0) - (b.sort_order || 0)
  })
  const primaryImage =
    images[0]?.image_url ||
    (dbProduct.product_images && dbProduct.product_images[0]) ||
    `${getSiteUrl()}/babys-bazaar-logo.png`

  const canonicalUrl = `${getSiteUrl()}/product/${slug}`

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
      type: 'website',
      images: [
        {
          url: primaryImage,
          alt: `${dbProduct.title} at Baby's Bazaar Erode`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [primaryImage],
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Concurrently fetch settings and product
  const [settings, { data: dbProduct }] = await Promise.all([
    getPublicSettings(),
    supabase
      .from('products')
      .select('*, categories(id, name, slug), images:product_images(*)')
      .eq('slug', slug)
      .eq('status', 'active')
      .maybeSingle(),
  ])

  if (!dbProduct) {
    notFound()
  }

  // Fetch related products from the same category
  const { data: dbRelated } = await supabase
    .from('products')
    .select('id, title, slug, price, product_images, categories(name, slug)')
    .eq('status', 'active')
    .eq('category_id', dbProduct.category_id)
    .neq('id', dbProduct.id)
    .limit(4)

  const relatedItems = dbRelated && dbRelated.length > 0 ? dbRelated : []

  // Extract images
  const images = ((dbProduct.images as any[]) || []).sort((a, b) => {
    if (a.is_primary) return -1
    if (b.is_primary) return 1
    return (a.sort_order || 0) - (b.sort_order || 0)
  })
  const productImages =
    images.length > 0
      ? images.map((img) => img.image_url)
      : dbProduct.product_images || []

  // Construct product object from DB product
  const product: DetailedProduct = {
    id: dbProduct.id,
    title: dbProduct.title,
    slug: dbProduct.slug,
    price: dbProduct.price,
    original_price: Math.round(dbProduct.price * 1.25),
    description: dbProduct.description,
    short_description: dbProduct.short_description,
    product_images:
      productImages.length > 0
        ? productImages
        : [
            'https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?w=1000&q=85',
          ],
    category_name: dbProduct.categories?.name,
    category_slug: dbProduct.categories?.slug,
    ready_to_dispatch: true,
  }

  const breadcrumbs = [
    { name: 'Home', url: '/' },
    { name: 'Categories', url: '/categories' },
    ...(product.category_slug && product.category_name
      ? [{ name: product.category_name, url: `/category/${product.category_slug}` }]
      : []),
    { name: product.title, url: `/product/${product.slug}` },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Main Product Detail Content (Hero + Conscious WhatsApp Ordering + Best Sellers) */}
      <main className="flex-1">
        <ProductDetailView
          product={product}
          whatsappNumber={settings?.whatsapp_number}
          bestSellers={relatedItems}
        />
      </main>

      {/* Pink Footer */}
      <Footer settings={settings} />

      {/* SEO: Product and BreadcrumbList Structured Data */}
      <JsonLd
        data={[
          generateProductSchema({
            title: product.title,
            slug: product.slug,
            description: product.description,
            price: product.price,
            product_images: product.product_images,
            category_name: product.category_name,
          }),
          generateBreadcrumbSchema(breadcrumbs),
        ]}
      />
    </div>
  )
}
