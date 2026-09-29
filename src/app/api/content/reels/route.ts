import { NextResponse } from 'next/server'
import { getReels } from '@/lib/actions/reels'

export async function GET() {
  try {
    const reels = await getReels()
    return NextResponse.json({ success: true, reels })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
