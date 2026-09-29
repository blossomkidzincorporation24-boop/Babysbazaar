import { NextResponse } from 'next/server'
import { getBanners } from '@/lib/actions/banners'

export async function GET() {
  try {
    const banners = await getBanners()
    return NextResponse.json({ success: true, banners })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
