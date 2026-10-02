import { NextRequest, NextResponse } from 'next/server'
import { getMonthlyReportData } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year') ? parseInt(searchParams.get('year')!, 10) : undefined
    const month = searchParams.get('month') ? parseInt(searchParams.get('month')!, 10) : undefined

    const report = await getMonthlyReportData({ year, month })

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error: any) {
    console.error('[API GET /api/reports/monthly Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate monthly report' },
      { status: 500 }
    )
  }
}
