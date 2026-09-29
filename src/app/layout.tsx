import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

import { getSiteUrl } from '@/lib/seo'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Baby Products Shop in Erode | Baby's Bazaar",
    template: "%s | Baby's Bazaar",
  },
  description:
    "Explore Baby's Bazaar in Erode, Tamil Nadu — your trusted destination for newborn essentials, organic baby clothing, bedding, toys, and nursery keepsakes. Enquire directly via WhatsApp.",
  keywords: [
    "Baby's Bazaar",
    'Baby products in Erode',
    'Baby shop in Erode',
    'Newborn products in Erode',
    'Baby bedding in Erode',
    'Baby accessories',
    'Mom and baby products',
    'Newborn essentials',
    'Baby clothes Erode',
  ],
  authors: [{ name: "Baby's Bazaar" }],
  creator: "Baby's Bazaar",
  publisher: "Baby's Bazaar",
  formatDetection: {
    email: true,
    address: true,
    telephone: true,
  },
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: "Baby Products Shop in Erode | Baby's Bazaar",
    description:
      "Explore Baby's Bazaar in Erode, Tamil Nadu — your trusted destination for newborn essentials, organic baby clothing, bedding, and nursery keepsakes.",
    url: siteUrl,
    siteName: "Baby's Bazaar",
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/babys-bazaar-logo.png`,
        width: 1200,
        height: 630,
        alt: "Baby's Bazaar - Baby Products Shop in Erode",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Baby Products Shop in Erode | Baby's Bazaar",
    description:
      "Explore Baby's Bazaar in Erode — trusted baby and newborn essentials with convenient WhatsApp enquiry.",
    images: [`${siteUrl}/babys-bazaar-logo.png`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto+Slab:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased font-sans max-w-full overflow-x-clip">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}
