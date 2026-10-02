export const revalidate = 60

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getPublicSettings } from '@/lib/actions/settings'
import { getSiteUrl, generateBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import AboutUsClient from '@/components/user/AboutUsClient'

export const metadata: Metadata = {
  title: "About Us | Baby Store in Erode | Baby's Bazaar",
  description:
    "Learn about Baby's Bazaar in Erode, Tamil Nadu — our story, commitment to baby-safe essentials, newborn clothes, toys, and friendly WhatsApp assistance.",
  alternates: {
    canonical: `${getSiteUrl()}/about-us`,
  },
  openGraph: {
    title: "About Us | Baby Store in Erode | Baby's Bazaar",
    description:
      "Learn about Baby's Bazaar in Erode, Tamil Nadu — our story, commitment to baby-safe essentials, newborn clothes, toys, and friendly WhatsApp assistance.",
    url: `${getSiteUrl()}/about-us`,
  },
}

export default async function AboutUsPage() {
  const supabase = await createClient()

  const [settingsRes, categoriesRes, photosRes] = await Promise.allSettled([
    getPublicSettings(),
    supabase
      .from('categories')
      .select('id, name, slug, image, description, sort_order')
      .eq('status', 'active')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false }),
    supabase
      .from('photos')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false }),
  ])

  const settings = settingsRes.status === 'fulfilled' ? settingsRes.value : null
  const rawCategories = (categoriesRes.status === 'fulfilled' && Array.isArray(categoriesRes.value?.data)) ? categoriesRes.value.data : []
  const photos = (photosRes.status === 'fulfilled' && Array.isArray(photosRes.value?.data)) ? photosRes.value.data : []

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
  const categories = (Array.isArray(rawCategories) ? rawCategories : [])
    .filter((c: any) => c && c.slug && !toySubcategorySlugs.has(c.slug) && !(c.description && typeof c.description === 'string' && c.description.toLowerCase().includes('[parent:toys]')))

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar with active "About us" highlight */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Main Content matching Figma Frame 1686556764 */}
      <main className="flex-1">
        <AboutUsClient
          photos={photos || []}
          categories={categories}
          whatsappNumber={settings?.whatsapp_number}
        />
      </main>

      {/* Pink Footer from Figma Frame 1686556764 */}
      <Footer settings={settings} />

      {/* SEO: BreadcrumbList Structured Data */}
      <JsonLd
        data={generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: 'About Us', url: '/about-us' },
        ])}
      />
    </div>
  )
}
