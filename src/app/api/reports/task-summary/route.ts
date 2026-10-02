import { NextRequest, NextResponse } from 'next/server'
import { getTaskLogs, getTeamUsers } from '@/lib/actions/workReports'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const assignedTo = searchParams.get('assignedTo') || undefined
    const status = searchParams.get('status') || undefined
    const priority = searchParams.get('priority') || undefined

    const [tasks, teamUsers] = await Promise.all([
      getTaskLogs({ assignedTo, status, priority }),
      getTeamUsers(),
    ])

    const totalTasks = tasks.length
    const completedTasks = tasks.filter((t) => t.status === 'completed').length
    const inProgressTasks = tasks.filter((t) => t.status === 'in_progress').length
    const pendingTasks = tasks.filter((t) => t.status === 'pending').length
    const cancelledTasks = tasks.filter((t) => t.status === 'cancelled').length

    const priorityBreakdown = {
      urgent: tasks.filter((t) => t.priority === 'urgent').length,
      high: tasks.filter((t) => t.priority === 'high').length,
      medium: tasks.filter((t) => t.priority === 'medium').length,
      low: tasks.filter((t) => t.priority === 'low').length,
    }

    const memberBreakdown = teamUsers.map((u) => {
      const userTasks = tasks.filter((t) => t.assigned_to === u.id)
      const userCompleted = userTasks.filter((t) => t.status === 'completed').length
      return {
        userId: u.id,
        userName: u.name,
        total: userTasks.length,
        completed: userCompleted,
        pending: userTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length,
        rate: userTasks.length > 0 ? Math.round((userCompleted / userTasks.length) * 100) : 100,
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        totalTasks,
        completedTasks,
        inProgressTasks,
        pendingTasks,
        cancelledTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
        priorityBreakdown,
        memberBreakdown,
        tasks,
      },
    })
  } catch (error: any) {
    console.error('[API GET /api/reports/task-summary Error]:', error)
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to generate task summary' },
      { status: 500 }
    )
  }
}
