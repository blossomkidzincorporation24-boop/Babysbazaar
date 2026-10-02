import { NextRequest, NextResponse } from 'next/server'
import { getWorkLog, updateWorkLog, deleteWorkLog } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

interface RouteContext {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing log ID' }, { status: 400 })
    }

    const log = await getWorkLog(id)
    if (!log) {
      return NextResponse.json({ success: false, error: 'Work log not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      data: log,
    })
  } catch (error: any) {
    console.error('[API GET /api/work-logs/[id] Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch work log' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing log ID' }, { status: 400 })
    }

    const body = await request.json()
    const result = await updateWorkLog(id, body)

    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error.includes('Unauthorized') ? 401 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Work log updated successfully',
      data: result.log,
    })
  } catch (error: any) {
    console.error('[API PUT /api/work-logs/[id] Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update work log' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing log ID' }, { status: 400 })
    }

    const result = await deleteWorkLog(id)
    if (result.error) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: result.error.includes('Unauthorized') ? 401 : 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Work log deleted successfully',
    })
  } catch (error: any) {
    console.error('[API DELETE /api/work-logs/[id] Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete work log' },
      { status: 500 }
    )
  }
}
