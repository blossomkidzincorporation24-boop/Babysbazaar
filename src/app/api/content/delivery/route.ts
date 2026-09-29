import { NextResponse } from 'next/server'
import { getDeliveryFeatures, getActiveDeliveryFeatures } from '@/lib/actions/delivery'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') as 'ribbon' | 'trust_badge' | null
    const activeOnly = searchParams.get('active') !== 'false'

    if (activeOnly) {
      const features = await getActiveDeliveryFeatures(type || undefined)
      return NextResponse.json({ success: true, features })
    }

    const features = await getDeliveryFeatures()
    return NextResponse.json({ success: true, features })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
