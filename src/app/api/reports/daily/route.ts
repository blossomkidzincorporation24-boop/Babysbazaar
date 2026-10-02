import { NextRequest, NextResponse } from 'next/server'
import { getDailyReportData } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date') || undefined

    const report = await getDailyReportData(date)

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error: any) {
    console.error('[API GET /api/reports/daily Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate daily report' },
      { status: 500 }
    )
  }
}
