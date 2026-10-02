import { NextRequest, NextResponse } from 'next/server'
import { getWorkLogs, getTeamUsers } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate') || undefined
    const endDate = searchParams.get('endDate') || undefined
    const userId = searchParams.get('userId') || undefined

    const [{ logs }, teamUsers] = await Promise.all([
      getWorkLogs({ startDate, endDate, userId, limit: 1000 }),
      getTeamUsers(),
    ])

    const totalHours = Number(
      logs.reduce((acc, curr) => acc + Number(curr.total_hours || 0), 0).toFixed(2)
    )

    // Category breakdown
    const categoryMap: Record<string, { totalHours: number; count: number }> = {}
    logs.forEach((log) => {
      const cat = log.work_category || 'General'
      if (!categoryMap[cat]) {
        categoryMap[cat] = { totalHours: 0, count: 0 }
      }
      categoryMap[cat].totalHours = Number((categoryMap[cat].totalHours + Number(log.total_hours || 0)).toFixed(2))
      categoryMap[cat].count += 1
    })

    const categoryBreakdown = Object.entries(categoryMap).map(([category, stats]) => ({
      category,
      totalHours: stats.totalHours,
      count: stats.count,
      percentage: totalHours > 0 ? Math.round((stats.totalHours / totalHours) * 100) : 0,
    })).sort((a, b) => b.totalHours - a.totalHours)

    // Member breakdown
    const memberBreakdown = teamUsers.map((u) => {
      const userLogs = logs.filter((l) => l.user_id === u.id)
      const userHours = Number(
        userLogs.reduce((acc, curr) => acc + Number(curr.total_hours || 0), 0).toFixed(2)
      )
      const uniqueDays = new Set(userLogs.map((l) => l.work_date)).size
      return {
        userId: u.id,
        userName: u.name,
        role: u.role,
        totalHours: userHours,
        workingDays: uniqueDays,
        avgHoursPerDay: uniqueDays > 0 ? Number((userHours / uniqueDays).toFixed(1)) : 0,
        logCount: userLogs.length,
      }
    }).sort((a, b) => b.totalHours - a.totalHours)

    return NextResponse.json({
      success: true,
      data: {
        totalHours,
        totalLogs: logs.length,
        categoryBreakdown,
        memberBreakdown,
      },
    })
  } catch (error: any) {
    console.error('[API GET /api/reports/hour-summary Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate hour summary' },
      { status: 500 }
    )
  }
}
