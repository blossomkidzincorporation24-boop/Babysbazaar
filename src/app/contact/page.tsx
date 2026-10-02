export const revalidate = 60

import type { Metadata } from 'next'
import { getPublicSettings } from '@/lib/actions/settings'
import { getSiteUrl, generateBreadcrumbSchema, generateLocalBusinessSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import Navbar from '@/components/user/Navbar'
import Footer from '@/components/user/Footer'
import ContactUsClient from '@/components/user/ContactUsClient'

export const metadata: Metadata = {
  title: "Contact Us | Baby Store in Erode | Baby's Bazaar",
  description:
    "Get in touch with Baby's Bazaar in Erode, Tamil Nadu. Visit our store at 160, Perundurai Road, Near Sudha Hospital, Edayankattuvalasu, Erode or contact us via WhatsApp (+91 84890 24888) for instant product enquiries.",
  alternates: {
    canonical: `${getSiteUrl()}/contact`,
  },
  openGraph: {
    title: "Contact Us | Baby Store in Erode | Baby's Bazaar",
    description:
      "Get in touch with Baby's Bazaar in Erode, Tamil Nadu. Visit our store at 160, Perundurai Road, Near Sudha Hospital, Edayankattuvalasu, Erode or contact us via WhatsApp for instant product enquiries.",
    url: `${getSiteUrl()}/contact`,
  },
}

export default async function ContactPage() {
  const settings = await getPublicSettings()

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navbar with active "Contact" highlight */}
      <Navbar whatsappNumber={settings?.whatsapp_number} />

      {/* Main Content matching Figma Frame 1686556757 */}
      <main className="flex-1">
        <ContactUsClient settings={settings} />
      </main>

      {/* Pink Footer matching Figma Frame 1686556757 */}
      <Footer settings={settings} />

      {/* SEO: BreadcrumbList and LocalBusiness Structured Data */}
      <JsonLd
        data={[
          generateBreadcrumbSchema([
            { name: 'Home', url: '/' },
            { name: 'Contact Us', url: '/contact' },
          ]),
          generateLocalBusinessSchema(settings),
        ]}
      />
    </div>
  )
}
