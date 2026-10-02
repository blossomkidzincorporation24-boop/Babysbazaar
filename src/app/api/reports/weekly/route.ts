import { NextRequest, NextResponse } from 'next/server'
import { getWeeklyReportData } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined

    const report = await getWeeklyReportData({ startDate, endDate })

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error: any) {
    console.error('[API GET /api/reports/weekly Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate weekly report' },
      { status: 500 }
    )
  }
}
