import { NextRequest, NextResponse } from 'next/server'
import { getWorkLogs, createWorkLog } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const userId = searchParams.get('userId') || undefined
    const category = searchParams.get('category') || undefined
    const status = searchParams.get('status') || undefined
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0

    const result = await getWorkLogs({
      startDate,
      endDate,
      userId,
      category,
      status,
      limit,
      offset,
    })

    return NextResponse.json({
      success: true,
      data: result.logs,
      totalCount: result.totalCount,
      limit,
      offset,
    })
  } catch (error: any) {
    console.error('[API GET /api/work-logs Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch work logs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const result = await createWorkLog(body)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error.includes('Unauthorized') ? 401 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Work log recorded successfully',
      data: result.log,
    }, { status: 201 })
  } catch (error: any) {
    console.error('[API POST /api/work-logs Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create work log' },
      { status: 500 }
    )
  }
}
