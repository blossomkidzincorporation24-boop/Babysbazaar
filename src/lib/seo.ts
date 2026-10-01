import {
  BUSINESS_NAME,
  BUSINESS_ADDRESS,
  BUSINESS_PHONE_DISPLAY,
  BUSINESS_EMAIL,
  BUSINESS_WHATSAPP_NUMBER,
  BUSINESS_INSTAGRAM_URL,
  BUSINESS_TWITTER_URL,
  CANONICAL_DOMAIN,
} from '@/lib/constants'

export function getSiteUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL
  if (envUrl) {
    return envUrl.replace(/\/+$/, '')
  }
  return CANONICAL_DOMAIN
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

export function generateWebSiteSchema() {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: siteUrl,
    name: "Baby's Bazaar",
    alternateName: ["Baby's Bazaar Erode", "Babys Bazaar", "BabysBazaar"],
    description:
      "Baby's Bazaar is a baby store in Erode offering baby clothes, newborn essentials, baby care products, toys and kids essentials.",
    inLanguage: 'en-IN',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${siteUrl}/categories?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
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
  const storeName = settings?.store_name || BUSINESS_NAME
  const phone = settings?.phone || settings?.whatsapp_number || BUSINESS_PHONE_DISPLAY
  const email = settings?.email || BUSINESS_EMAIL
  const logo = settings?.logo || `${siteUrl}/babys-bazaar-logo.png`

  return {
    '@context': 'https://schema.org',
    '@type': ['BabyStore', 'Store', 'LocalBusiness'],
    '@id': `${siteUrl}/#store`,
    name: storeName,
    legalName: storeName,
    alternateName: ["Baby's Bazaar Erode", "Babys Bazaar", "Baby's Bazaar - Baby Store in Erode"],
    description:
      "Baby's Bazaar in Erode, Tamil Nadu is a dedicated baby store offering newborn essentials, organic baby clothing, baby bedding, baby care products, feeding accessories, walkers, toys and nursery keepsakes with personalized WhatsApp enquiry.",
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
      streetAddress: '160, Perundurai Road, Near Sudha Hospital, Edayankattuvalasu',
      addressLocality: 'Erode',
      addressRegion: 'Tamil Nadu',
      postalCode: '638011',
      addressCountry: 'IN',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 11.3418,
      longitude: 77.7172,
    },
    hasMap: 'https://maps.app.goo.gl/tWp471w5Uu3L9eA67',
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
    sameAs: [
      BUSINESS_INSTAGRAM_URL,
      BUSINESS_TWITTER_URL,
    ].filter(Boolean),
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
    `${product.title} available at Baby's Bazaar in Erode, Tamil Nadu.`

  const images =
    product.product_images && product.product_images.length > 0
      ? product.product_images.map((img) => (img.startsWith('http') ? img : `${siteUrl}${img}`))
      : [`${siteUrl}/babys-bazaar-logo.png`]

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
        name: BUSINESS_NAME,
        telephone: BUSINESS_PHONE_DISPLAY,
        url: siteUrl,
      },
    },
  }
}

export function generateItemListSchema(
  name: string,
  items: Array<{ name: string; url: string; image?: string | null; price?: number }>
) {
  const siteUrl = getSiteUrl()
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: name,
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      url: item.url.startsWith('http') ? item.url : `${siteUrl}${item.url.startsWith('/') ? item.url : `/${item.url}`}`,
      ...(item.image ? { image: item.image } : {}),
    })),
  }
}
