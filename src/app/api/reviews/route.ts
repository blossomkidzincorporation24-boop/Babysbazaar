import { NextResponse } from 'next/server'
import { getGoogleReviews } from '@/lib/google/google-reviews'

export const dynamic = 'force-dynamic'

/**
 * Server-side route handler for Google Places customer reviews.
 * Kept completely isolated on the server to prevent exposing GOOGLE_PLACES_API_KEY.
 * Employs 1-hour cache revalidation and returns clean, verified data or graceful empty structure.
 */
export async function GET() {
  try {
    const data = await getGoogleReviews()
    return NextResponse.json({
      success: true,
      data: data || {
        placeName: "Baby's Bazaar",
        rating: 5,
        totalReviews: 0,
        reviews: [],
      },
    })
  } catch (error: any) {
    console.error('[API Reviews Error]:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch customer reviews',
        data: {
          placeName: "Baby's Bazaar",
          rating: 5,
          totalReviews: 0,
          reviews: [],
        },
      },
      { status: 500 }
    )
  }
}
