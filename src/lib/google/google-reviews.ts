export interface GoogleReview {
  id: string
  authorName: string
  authorPhotoUri?: string
  authorUri?: string
  rating: number
  text: string
  relativeTimeDescription?: string
  publishTime?: string
  googleMapsUri?: string
}

export interface GoogleReviewsData {
  placeName: string
  rating: number
  totalReviews: number
  reviews: GoogleReview[]
  googleMapsUri?: string
}

interface NewPlacesReview {
  name?: string
  relativePublishTimeDescription?: string
  rating?: number
  text?: { text?: string; languageCode?: string }
  originalText?: { text?: string; languageCode?: string }
  authorAttribution?: {
    displayName?: string
    uri?: string
    photoUri?: string
  }
  publishTime?: string
  googleMapsUri?: string
}

interface NewPlacesResponse {
  id?: string
  displayName?: { text?: string; languageCode?: string }
  rating?: number
  userRatingCount?: number
  googleMapsUri?: string
  reviews?: NewPlacesReview[]
  error?: { message?: string; code?: number }
}

interface LegacyPlacesReview {
  author_name?: string
  author_url?: string
  profile_photo_url?: string
  rating?: number
  relative_time_description?: string
  text?: string
  time?: number
}

interface LegacyPlacesResponse {
  result?: {
    name?: string
    rating?: number
    user_ratings_total?: number
    url?: string
    reviews?: LegacyPlacesReview[]
  }
  status?: string
  error_message?: string
}

/**
 * Fetch verified customer reviews for Baby's Bazaar from Google Places API.
 * Uses Next.js data cache with 1-hour revalidation (3600 seconds).
 * Server-only: API key is never exposed to the client.
 * Returns null if unconfigured or if API returns an error or no reviews.
 */
export async function getGoogleReviews(): Promise<GoogleReviewsData | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY?.trim()
  const placeId = (process.env.NEXT_PUBLIC_GOOGLE_PLACE_ID || process.env.GOOGLE_PLACE_ID)?.trim()

  if (!apiKey || !placeId) {
    if (process.env.NODE_ENV === 'development') {
      console.info(
        '[GoogleReviews] GOOGLE_PLACES_API_KEY or NEXT_PUBLIC_GOOGLE_PLACE_ID is not configured in environment. Google Reviews section will be hidden.'
      )
    }
    return null
  }

  // 1. Try Google Places API (New)
  try {
    const newApiUrl = `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`
    const res = await fetch(newApiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'id,displayName,rating,userRatingCount,reviews,googleMapsUri',
        'Accept-Language': 'en',
      },
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data: NewPlacesResponse = await res.json()
      if (data.reviews && data.reviews.length > 0) {
        const placeName = data.displayName?.text || "Baby's Bazaar"
        const rating = typeof data.rating === 'number' ? data.rating : 5
        const totalReviews = typeof data.userRatingCount === 'number' ? data.userRatingCount : data.reviews.length
        const googleMapsUri = data.googleMapsUri || `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`

        const reviews: GoogleReview[] = data.reviews
          .filter((r) => Boolean(r.text?.text || r.originalText?.text))
          .map((r, index) => ({
            id: r.name || `new-rev-${index}`,
            authorName: r.authorAttribution?.displayName || 'Happy Customer',
            authorPhotoUri: r.authorAttribution?.photoUri,
            authorUri: r.authorAttribution?.uri,
            rating: typeof r.rating === 'number' ? r.rating : 5,
            text: r.text?.text || r.originalText?.text || '',
            relativeTimeDescription: r.relativePublishTimeDescription || '',
            publishTime: r.publishTime,
            googleMapsUri: r.googleMapsUri || googleMapsUri,
          }))

        if (reviews.length > 0) {
          return {
            placeName,
            rating,
            totalReviews,
            reviews,
            googleMapsUri,
          }
        }
      }
    }
  } catch (error) {
    console.warn('[GoogleReviews] Places API (New) fetch error, attempting legacy endpoint fallback:', error)
  }

  // 2. Fallback to Legacy Places API Details
  try {
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,rating,user_ratings_total,reviews,url&language=en&key=${encodeURIComponent(apiKey)}`

    const res = await fetch(legacyUrl, {
      method: 'GET',
      next: { revalidate: 3600 },
    })

    if (res.ok) {
      const data: LegacyPlacesResponse = await res.json()
      if (data.status === 'OK' && data.result?.reviews && data.result.reviews.length > 0) {
        const placeName = data.result.name || "Baby's Bazaar"
        const rating = typeof data.result.rating === 'number' ? data.result.rating : 5
        const totalReviews =
          typeof data.result.user_ratings_total === 'number'
            ? data.result.user_ratings_total
            : data.result.reviews.length
        const googleMapsUri =
          data.result.url || `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`

        const reviews: GoogleReview[] = data.result.reviews
          .filter((r) => Boolean(r.text))
          .map((r, index) => ({
            id: `legacy-rev-${index}-${r.time || ''}`,
            authorName: r.author_name || 'Happy Customer',
            authorPhotoUri: r.profile_photo_url,
            authorUri: r.author_url,
            rating: typeof r.rating === 'number' ? r.rating : 5,
            text: r.text || '',
            relativeTimeDescription: r.relative_time_description || '',
            googleMapsUri,
          }))

        if (reviews.length > 0) {
          return {
            placeName,
            rating,
            totalReviews,
            reviews,
            googleMapsUri,
          }
        }
      } else if (data.status && data.status !== 'OK') {
        console.warn(`[GoogleReviews] Legacy Places API returned status: ${data.status} - ${data.error_message || ''}`)
      }
    }
  } catch (error) {
    console.warn('[GoogleReviews] Legacy Places API fetch error:', error)
  }

  return null
}
