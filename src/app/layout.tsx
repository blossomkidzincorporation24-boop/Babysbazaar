import type { Metadata } from 'next'
import './globals.css'
import { Toaster } from 'sonner'

import { getSiteUrl } from '@/lib/seo'

const siteUrl = getSiteUrl()

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Baby's Bazaar | Baby Store in Erode | Baby Products & Toys",
    template: "%s | Baby's Bazaar",
  },
  description:
    "Baby's Bazaar is a baby store in Erode offering baby clothes, newborn essentials, baby care products, toys and kids essentials with direct WhatsApp enquiry.",
  keywords: [
    "Baby's Bazaar",
    "Baby's Bazaar Erode",
    "Baby store in Erode",
    "Baby shop in Erode",
    "Baby products shop in Erode",
    "Baby clothes shop in Erode",
    "Newborn baby products in Erode",
    "Kids toys shop in Erode",
    "Baby care products in Erode",
    "Toys shop in Erode",
    "Kids products in Erode",
    "Baby bedding Erode",
    "Erode baby shop",
  ],
  authors: [{ name: "Baby's Bazaar", url: siteUrl }],
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
    title: "Baby's Bazaar | Baby Store in Erode | Baby Products & Toys",
    description:
      "Baby's Bazaar is a baby store in Erode offering baby clothes, newborn essentials, baby care products, toys and kids essentials with direct WhatsApp enquiry.",
    url: siteUrl,
    siteName: "Baby's Bazaar",
    locale: 'en_IN',
    type: 'website',
    images: [
      {
        url: `${siteUrl}/babys-bazaar-logo.png`,
        width: 1200,
        height: 630,
        alt: "Baby's Bazaar - Baby Store in Erode",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Baby's Bazaar | Baby Store in Erode | Baby Products & Toys",
    description:
      "Baby's Bazaar is a baby store in Erode offering baby clothes, newborn essentials, baby care products, toys and kids essentials with direct WhatsApp enquiry.",
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
