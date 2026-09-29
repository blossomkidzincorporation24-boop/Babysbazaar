import { NextResponse } from 'next/server'
import { getOfferBanners, getActiveOfferBanner } from '@/lib/actions/offers'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('active') === 'true'

    if (activeOnly) {
      const offer = await getActiveOfferBanner()
      return NextResponse.json({ success: true, offer })
    }

    const offers = await getOfferBanners()
    return NextResponse.json({ success: true, offers })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
