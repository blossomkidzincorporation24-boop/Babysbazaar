export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (envUrl) {
    return envUrl.replace(/\/+$/, '')
  }
  return 'https://babysbazaar.shop'
}

export function buildCanonicalUrl(path: string = ''): string {
  const base = getSiteUrl()
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${base}${cleanPath === '/' ? '' : cleanPath}`
}

export interface BreadcrumbItem {
  name: string
  url: string
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
    })),
  }
}

export function generateLocalBusinessSchema(settings?: {
  store_name?: string | null
  address?: string | null
  phone?: string | null
  email?: string | null
  logo?: string | null
  whatsapp_number?: string | null
} | null) {
  const siteUrl = getSiteUrl()
  const storeName = settings?.store_name || "Baby's Bazaar"
  const phone = settings?.phone || settings?.whatsapp_number || '+91 84898 24888'
  const email = settings?.email || 'support@babysbazaar.shop'
  const logo = settings?.logo || `${siteUrl}/logo.png`

  return {
    '@context': 'https://schema.org',
    '@type': ['BabyStore', 'LocalBusiness', 'Store'],
    '@id': `${siteUrl}/#store`,
    name: storeName,
    legalName: storeName,
    description:
      "Baby's Bazaar in Erode, Tamil Nadu is a dedicated baby products store offering newborn essentials, baby clothing, bedding, feeding accessories, walkers, and nursery essentials with personalized WhatsApp enquiry.",
    url: siteUrl,
    telephone: phone,
    email: email,
    logo: logo,
    image: [
      logo,
      `${siteUrl}/babys-bazaar-logo.png`,
    ],
    address: {
      '@type': 'PostalAddress',
      streetAddress: '60, Perundurai Rd, near Sudha Hospital, Edayankattuvalasu',
      addressLocality: 'Erode',
      addressRegion: 'Tamil Nadu',
      postalCode: '638011',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.341,
      longitude: 77.7172,
    },
    areaServed: [
      {
        '@type': 'City',
        name: 'Erode',
      },
      {
        '@type': 'AdministrativeArea',
        name: 'Tamil Nadu',
      },
      {
        '@type': 'Country',
        name: 'India',
      },
    ],
    currenciesAccepted: 'INR',
    paymentAccepted: 'Cash, UPI, Bank Transfer',
    priceRange: '₹₹',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
          'Sunday',
        ],
        opens: '09:30',
        closes: '21:00',
      },
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: phone,
      contactType: 'customer service',
      availableLanguage: ['English', 'Tamil'],
    },
  }
}

export function generateProductSchema(product: {
  title: string
  slug: string
  description?: string | null
  short_description?: string | null
  price: number
  product_images?: string[] | null
  category_name?: string | null
}) {
  const siteUrl = getSiteUrl()
  const productUrl = `${siteUrl}/product/${product.slug}`
  const description =
    product.short_description ||
    product.description ||
    `${product.title} available at Baby's Bazaar, Erode.`

  const images =
    product.product_images && product.product_images.length > 0
      ? product.product_images.map((img) => (img.startsWith('http') ? img : `${siteUrl}${img}`))
      : [`${siteUrl}/logo.png`]

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${productUrl}#product`,
    name: product.title,
    description: description.replace(/\s+/g, ' ').trim(),
    image: images,
    url: productUrl,
    sku: product.slug,
    brand: {
      '@type': 'Brand',
      name: "Baby's Bazaar",
    },
    category: product.category_name || 'Baby Products',
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'INR',
      price: product.price,
      availability: 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      seller: {
        '@type': 'Store',
        name: "Baby's Bazaar",
        telephone: '+91 84898 24888',
      },
    },
  }
}
