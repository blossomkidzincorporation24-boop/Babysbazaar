import { NextRequest, NextResponse } from 'next/server'
import { getWorkingDaysReport } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const userId = searchParams.get('userId') || undefined
    const status = searchParams.get('status') || undefined

    const report = await getWorkingDaysReport({
      startDate,
      endDate,
      userId,
      status,
    })

    return NextResponse.json({
      success: true,
      data: report,
    })
  } catch (error: any) {
    console.error('[API GET /api/reports/working-days Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to calculate working days report' },
      { status: 500 }
    )
  }
}
