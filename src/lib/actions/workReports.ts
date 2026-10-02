'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAuth } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { logActivity } from './logs'
import type { TeamUser, WorkLog, TaskLog, DailyReport, WorkLogWithUser, TaskLogWithUser } from '@/types/database.types'

// ==============================================================================
// 1. ZOD SCHEMAS FOR VALIDATION
// ==============================================================================

const TeamUserSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid email is required'),
  role: z.enum(['admin', 'manager', 'staff', 'sales', 'inventory', 'delivery']).default('staff'),
  phone: z.string().optional().nullable(),
  status: z.enum(['active', 'inactive']).default('active'),
})

const WorkLogSchema = z.object({
  user_id: z.string().uuid('Valid team member is required'),
  work_date: z.string().min(1, 'Work date is required'),
  work_title: z.string().min(1, 'Work title is required'),
  work_description: z.string().optional().nullable(),
  work_category: z.string().default('General'),
  status: z.enum(['completed', 'in_progress', 'pending']).default('completed'),
  start_time: z.string().optional().nullable(),
  end_time: z.string().optional().nullable(),
  total_hours: z.coerce.number().min(0.1, 'Hours must be greater than 0').max(24, 'Hours cannot exceed 24'),
  notes: z.string().optional().nullable(),
})

const TaskLogSchema = z.object({
  assigned_to: z.string().uuid().optional().nullable(),
  task_title: z.string().min(1, 'Task title is required'),
  description: z.string().optional().nullable(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).default('pending'),
  assigned_date: z.string().min(1, 'Assigned date is required'),
  due_date: z.string().optional().nullable(),
  completed_date: z.string().optional().nullable(),
})

// ==============================================================================
// 2. TEAM MEMBERS (team_users) ACTIONS
// ==============================================================================

export async function getTeamUsers(): Promise<TeamUser[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_users')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    console.error('Error fetching team_users:', error)
    return []
  }
  return (data || []) as TeamUser[]
}

export async function createTeamUser(payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const parsed = TeamUserSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_users')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { error: error.message }

  await logActivity('TEAM_USER_CREATED', 'team_user', data.id, `Added team member "${data.name}" (${data.role})`)
  revalidatePath('/admin/work-reports')
  return { success: true, user: data }
}

export async function updateTeamUser(id: string, payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const parsed = TeamUserSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('team_users')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  await logActivity('TEAM_USER_UPDATED', 'team_user', id, `Updated team member "${data.name}"`)
  revalidatePath('/admin/work-reports')
  return { success: true, user: data }
}

export async function toggleTeamUserStatus(id: string, currentStatus: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const newStatus = currentStatus === 'active' ? 'inactive' : 'active'
  const supabase = await createClient()
  const { error } = await supabase
    .from('team_users')
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) return { error: error.message }

  await logActivity('TEAM_USER_STATUS', 'team_user', id, `Changed member status to ${newStatus}`)
  revalidatePath('/admin/work-reports')
  return { success: true }
}

export async function deleteTeamUser(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('team_users').delete().eq('id', id)
  if (error) return { error: error.message }

  await logActivity('TEAM_USER_DELETED', 'team_user', id, 'Deleted team member')
  revalidatePath('/admin/work-reports')
  return { success: true }
}

// ==============================================================================
// 3. WORK LOGS (work_logs) ACTIONS
// ==============================================================================

export async function getWorkLogs(filter: {
  startDate?: string
  endDate?: string
  userId?: string
  category?: string
  status?: string
  limit?: number
  offset?: number
} = {}): Promise<{ logs: WorkLogWithUser[]; totalCount: number }> {
  const supabase = await createClient()
  let query = supabase
    .from('work_logs')
    .select('*, team_users(id, name, email, role)', { count: 'exact' })
    .order('work_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filter.startDate) {
    query = query.gte('work_date', filter.startDate)
  }
  if (filter.endDate) {
    query = query.lte('work_date', filter.endDate)
  }
  if (filter.userId && filter.userId !== 'all') {
    query = query.eq('user_id', filter.userId)
  }
  if (filter.category && filter.category !== 'all') {
    query = query.eq('work_category', filter.category)
  }
  if (filter.status && filter.status !== 'all') {
    query = query.eq('status', filter.status)
  }

  const limit = filter.limit || 50
  const offset = filter.offset || 0
  query = query.range(offset, offset + limit - 1)

  const { data, count, error } = await query

  if (error) {
    console.error('Error fetching work logs:', error)
    return { logs: [], totalCount: 0 }
  }

  return {
    logs: (data || []) as WorkLogWithUser[],
    totalCount: count || 0,
  }
}

export async function getWorkLog(id: string): Promise<WorkLogWithUser | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_logs')
    .select('*, team_users(id, name, email, role)')
    .eq('id', id)
    .single()

  if (error) return null
  return data as WorkLogWithUser
}

export async function createWorkLog(payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const parsed = WorkLogSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_logs')
    .insert(parsed.data)
    .select('*, team_users(name)')
    .single()

  if (error) return { error: error.message }

  await logActivity(
    'WORK_LOG_CREATED',
    'work_log',
    data.id,
    `Logged work: "${data.work_title}" on ${data.work_date} (${data.total_hours}h)`
  )

  revalidatePath('/admin/work-reports')
  return { success: true, log: data }
}

export async function updateWorkLog(id: string, payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const parsed = WorkLogSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('work_logs')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select('*, team_users(name)')
    .single()

  if (error) return { error: error.message }

  await logActivity(
    'WORK_LOG_UPDATED',
    'work_log',
    id,
    `Updated work log: "${data.work_title}" (${data.work_date})`
  )

  revalidatePath('/admin/work-reports')
  return { success: true, log: data }
}

export async function deleteWorkLog(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('work_logs').delete().eq('id', id)
  if (error) return { error: error.message }

  await logActivity('WORK_LOG_DELETED', 'work_log', id, 'Deleted work log')
  revalidatePath('/admin/work-reports')
  return { success: true }
}

// ==============================================================================
// 4. TASK LOGS (task_logs) ACTIONS
// ==============================================================================

export async function getTaskLogs(filter: {
  assignedTo?: string
  status?: string
  priority?: string
  limit?: number
} = {}): Promise<TaskLogWithUser[]> {
  const supabase = await createClient()
  let query = supabase
    .from('task_logs')
    .select('*, team_users(id, name, email, role)')
    .order('assigned_date', { ascending: false })
    .order('created_at', { ascending: false })

  if (filter.assignedTo && filter.assignedTo !== 'all') {
    query = query.eq('assigned_to', filter.assignedTo)
  }
  if (filter.status && filter.status !== 'all') {
    query = query.eq('status', filter.status)
  }
  if (filter.priority && filter.priority !== 'all') {
    query = query.eq('priority', filter.priority)
  }
  if (filter.limit) {
    query = query.limit(filter.limit)
  }

  const { data, error } = await query
  if (error) {
    console.error('Error fetching task logs:', error)
    return []
  }
  return (data || []) as TaskLogWithUser[]
}

export async function createTaskLog(payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const parsed = TaskLogSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('task_logs')
    .insert(parsed.data)
    .select()
    .single()

  if (error) return { error: error.message }

  await logActivity('TASK_CREATED', 'task_log', data.id, `Created task "${data.task_title}"`)
  revalidatePath('/admin/work-reports')
  return { success: true, task: data }
}

export async function updateTaskLog(id: string, payload: any) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const parsed = TaskLogSchema.safeParse(payload)
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Validation error' }
  }

  // Auto-set completed_date if completed
  if (parsed.data.status === 'completed' && !parsed.data.completed_date) {
    parsed.data.completed_date = new Date().toISOString().split('T')[0]
  }

  const supabase = await createClient()
  const { data, error } = await supabase
    .from('task_logs')
    .update({
      ...parsed.data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) return { error: error.message }

  await logActivity('TASK_UPDATED', 'task_log', id, `Updated task "${data.task_title}"`)
  revalidatePath('/admin/work-reports')
  return { success: true, task: data }
}

export async function deleteTaskLog(id: string) {
  const auth = await requireAuth()
  if (!auth.authorized) return { error: auth.error }

  const supabase = await createClient()
  const { error } = await supabase.from('task_logs').delete().eq('id', id)
  if (error) return { error: error.message }

  await logActivity('TASK_DELETED', 'task_log', id, 'Deleted task')
  revalidatePath('/admin/work-reports')
  return { success: true }
}

// ==============================================================================
// 5. WORKING DAYS & REPORT AGGREGATION ENGINE (UNIQUE DATES DEDUPLICATION)
// ==============================================================================

export interface MemberWorkSummary {
  userId: string
  userName: string
  userEmail: string
  userRole: string
  userStatus: string
  workingDays: number          // UNIQUE working dates
  totalHours: number
  avgHoursPerDay: number
  tasksAssigned: number
  tasksCompleted: number
  tasksPending: number
  completionRate: number
  datesWorked: string[]        // Distinct sorted dates
}

export interface WorkingDaysReportResult {
  periodLabel: string
  startDate: string
  endDate: string
  totalTeamMembers: number
  totalMembersActive: number
  totalCompanyWorkingDays: number // Unique dates with at least 1 log across team
  totalCompanyHours: number
  totalTasksAssigned: number
  totalTasksCompleted: number
  totalTasksPending: number
  memberSummaries: MemberWorkSummary[]
}

export async function getWorkingDaysReport(filter: {
  startDate?: string
  endDate?: string
  userId?: string
  status?: string
} = {}): Promise<WorkingDaysReportResult> {
  const supabase = await createClient()

  // 1. Fetch active team users
  let usersQuery = supabase.from('team_users').select('*')
  if (filter.userId && filter.userId !== 'all') {
    usersQuery = usersQuery.eq('id', filter.userId)
  }
  const { data: usersData } = await usersQuery
  const users = (usersData || []) as TeamUser[]

  // 2. Fetch work logs within date range
  let logsQuery = supabase.from('work_logs').select('*')
  if (filter.startDate) logsQuery = logsQuery.gte('work_date', filter.startDate)
  if (filter.endDate) logsQuery = logsQuery.lte('work_date', filter.endDate)
  if (filter.userId && filter.userId !== 'all') logsQuery = logsQuery.eq('user_id', filter.userId)
  if (filter.status && filter.status !== 'all') logsQuery = logsQuery.eq('status', filter.status)

  const { data: logsData } = await logsQuery
  const workLogs = (logsData || []) as WorkLog[]

  // 3. Fetch task logs within date range
  let tasksQuery = supabase.from('task_logs').select('*')
  if (filter.startDate) tasksQuery = tasksQuery.gte('assigned_date', filter.startDate)
  if (filter.endDate) tasksQuery = tasksQuery.lte('assigned_date', filter.endDate)
  if (filter.userId && filter.userId !== 'all') tasksQuery = tasksQuery.eq('assigned_to', filter.userId)

  const { data: tasksData } = await tasksQuery
  const taskLogs = (tasksData || []) as TaskLog[]

  // Company-wide Unique Working Dates
  const companyUniqueDates = new Set(workLogs.map((l) => l.work_date))

  // 4. Calculate individual metrics with deduplication per user
  const memberSummaries: MemberWorkSummary[] = users.map((user) => {
    const userLogs = workLogs.filter((l) => l.user_id === user.id)
    const userTasks = taskLogs.filter((t) => t.assigned_to === user.id)

    // Deduplicate dates: 10 logs on October 1 = 1 working day
    const uniqueDatesSet = new Set(userLogs.map((l) => l.work_date))
    const workingDays = uniqueDatesSet.size
    const datesWorked = Array.from(uniqueDatesSet).sort()

    const totalHours = Number(
      userLogs.reduce((acc, curr) => acc + Number(curr.total_hours || 0), 0).toFixed(2)
    )

    const avgHoursPerDay = workingDays > 0 ? Number((totalHours / workingDays).toFixed(1)) : 0

    const tasksAssigned = userTasks.length
    const tasksCompleted = userTasks.filter((t) => t.status === 'completed').length
    const tasksPending = userTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length
    const completionRate = tasksAssigned > 0 ? Math.round((tasksCompleted / tasksAssigned) * 100) : 100

    return {
      userId: user.id,
      userName: user.name,
      userEmail: user.email,
      userRole: user.role,
      userStatus: user.status,
      workingDays,
      totalHours,
      avgHoursPerDay,
      tasksAssigned,
      tasksCompleted,
      tasksPending,
      completionRate,
      datesWorked,
    }
  })

  // Sort by working days descending
  memberSummaries.sort((a, b) => b.workingDays - a.workingDays || b.totalHours - a.totalHours)

  const totalCompanyHours = Number(
    memberSummaries.reduce((acc, m) => acc + m.totalHours, 0).toFixed(2)
  )
  const totalTasksAssigned = memberSummaries.reduce((acc, m) => acc + m.tasksAssigned, 0)
  const totalTasksCompleted = memberSummaries.reduce((acc, m) => acc + m.tasksCompleted, 0)
  const totalTasksPending = memberSummaries.reduce((acc, m) => acc + m.tasksPending, 0)

  return {
    periodLabel: filter.startDate && filter.endDate ? `${filter.startDate} to ${filter.endDate}` : 'All Time',
    startDate: filter.startDate || '',
    endDate: filter.endDate || '',
    totalTeamMembers: users.length,
    totalMembersActive: memberSummaries.filter((m) => m.workingDays > 0).length,
    totalCompanyWorkingDays: companyUniqueDates.size,
    totalCompanyHours,
    totalTasksAssigned,
    totalTasksCompleted,
    totalTasksPending,
    memberSummaries,
  }
}

// ==============================================================================
// 6. DAILY REPORT SPECIFIC AGGREGATOR
// ==============================================================================

export async function getDailyReportData(dateStr?: string) {
  const targetDate = dateStr || new Date().toISOString().split('T')[0]
  const supabase = await createClient()

  const [usersRes, logsRes, tasksRes] = await Promise.all([
    supabase.from('team_users').select('*').eq('status', 'active'),
    supabase.from('work_logs').select('*, team_users(id, name, email, role)').eq('work_date', targetDate),
    supabase.from('task_logs').select('*, team_users(id, name, email, role)').eq('assigned_date', targetDate),
  ])

  const users = (usersRes.data || []) as TeamUser[]
  const logs = (logsRes.data || []) as WorkLogWithUser[]
  const tasks = (tasksRes.data || []) as TaskLogWithUser[]

  const uniqueUsersWorked = new Set(logs.map((l) => l.user_id))
  const totalHours = logs.reduce((acc, curr) => acc + Number(curr.total_hours || 0), 0)

  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

  const memberBreakdowns = users.map((user) => {
    const userLogs = logs.filter((l) => l.user_id === user.id)
    const userTasks = tasks.filter((t) => t.assigned_to === user.id)
    const hasWorked = userLogs.length > 0
    const userHours = userLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0)

    return {
      userId: user.id,
      name: user.name,
      userName: user.name,
      role: user.role,
      hasWorked,
      hoursWorked: Number(userHours.toFixed(1)),
      totalHours: Number(userHours.toFixed(1)),
      logs: userLogs,
      tasks: userTasks,
      tasksCompleted: userTasks.filter((t) => t.status === 'completed').length,
      notes: userLogs.map((l) => l.notes).filter(Boolean).join('; ') || (hasWorked ? 'Logged daily duties' : 'No work log submitted'),
    }
  })

  return {
    date: targetDate,
    totalTeamMembers: users.length,
    membersWorked: uniqueUsersWorked.size,
    totalTasks: tasks.length,
    completedTasks,
    pendingTasks,
    totalHours: Number(totalHours.toFixed(1)),
    memberBreakdowns,
    memberEntries: memberBreakdowns,
  }
}

// ==============================================================================
// 7. WEEKLY REPORT SPECIFIC AGGREGATOR
// ==============================================================================

export async function getWeeklyReportData(filter: { startDate?: string; endDate?: string } = {}) {
  const now = new Date()
  let startDate: Date
  
  if (filter.startDate) {
    startDate = new Date(filter.startDate)
  } else {
    startDate = new Date()
    const dayIndex = startDate.getDay() === 0 ? 6 : startDate.getDay() - 1
    startDate.setDate(startDate.getDate() - dayIndex)
  }

  const days: { dateStr: string; dayName: string }[] = []
  const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

  for (let i = 0; i < 7; i++) {
    const d = new Date(startDate)
    d.setDate(d.getDate() + i)
    days.push({
      dateStr: d.toISOString().split('T')[0],
      dayName: dayNames[i],
    })
  }

  const weekEndStr = filter.endDate || days[6].dateStr
  const supabase = await createClient()

  const [logsRes, tasksRes, usersRes] = await Promise.all([
    supabase.from('work_logs').select('*, team_users(id, name, role)').gte('work_date', days[0].dateStr).lte('work_date', weekEndStr),
    supabase.from('task_logs').select('*').gte('assigned_date', days[0].dateStr).lte('assigned_date', weekEndStr),
    supabase.from('team_users').select('*').order('name', { ascending: true }),
  ])

  const logs = (logsRes.data || []) as WorkLogWithUser[]
  const tasks = (tasksRes.data || []) as TaskLog[]
  const users = (usersRes.data || []) as TeamUser[]

  const dayBreakdowns = days.map(({ dateStr, dayName }) => {
    const dayLogs = logs.filter((l) => l.work_date === dateStr)
    const dayTasks = tasks.filter((t) => t.assigned_date === dateStr)
    const membersWorked = new Set(dayLogs.map((l) => l.user_id)).size
    const hours = Number(dayLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1))

    return {
      date: dateStr,
      dayName,
      membersWorked,
      totalTasks: dayTasks.length,
      tasksCompleted: dayTasks.filter((t) => t.status === 'completed').length,
      hours,
    }
  })

  const memberSummaries = users.map((u) => {
    const uLogs = logs.filter((l) => l.user_id === u.id)
    const uniqueDays = new Set(uLogs.map((l) => l.work_date)).size
    const totalHours = Number(uLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1))
    const dailyHours: Record<string, number> = {
      Mon: 0,
      Tue: 0,
      Wed: 0,
      Thu: 0,
      Fri: 0,
      Sat: 0,
      Sun: 0,
    }

    const shortDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    days.forEach(({ dateStr }, idx) => {
      const dayLogSum = uLogs
        .filter((l) => l.work_date === dateStr)
        .reduce((acc, l) => acc + Number(l.total_hours || 0), 0)
      dailyHours[shortDays[idx]] = Number(dayLogSum.toFixed(1))
    })

    return {
      userId: u.id,
      userName: u.name,
      role: u.role,
      workingDays: uniqueDays,
      totalHours,
      dailyHours,
    }
  })

  const totalWeekHours = dayBreakdowns.reduce((acc, d) => acc + d.hours, 0)
  const totalWeekTasksCompleted = dayBreakdowns.reduce((acc, d) => acc + d.tasksCompleted, 0)
  const uniqueCompanyWorkingDays = dayBreakdowns.filter((d) => d.membersWorked > 0).length

  return {
    startDate: days[0].dateStr,
    endDate: weekEndStr,
    totalTeamMembers: users.length,
    workingDays: uniqueCompanyWorkingDays,
    tasksCompleted: totalWeekTasksCompleted,
    totalWeeklyHours: Number(totalWeekHours.toFixed(1)),
    dayBreakdowns,
    memberSummaries,
  }
}

// ==============================================================================
// 8. MONTHLY REPORT & ATTENDANCE MATRIX AGGREGATOR
// ==============================================================================

export async function getMonthlyReportData(filter: { year?: number; month?: number } = {}) {
  const now = new Date()
  const year = filter.year || now.getFullYear()
  const month = filter.month || now.getMonth() + 1
  const startDateStr = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const endDateStr = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const supabase = await createClient()

  const [usersRes, logsRes, tasksRes] = await Promise.all([
    supabase.from('team_users').select('*').order('name', { ascending: true }),
    supabase.from('work_logs').select('*').gte('work_date', startDateStr).lte('work_date', endDateStr),
    supabase.from('task_logs').select('*').gte('assigned_date', startDateStr).lte('assigned_date', endDateStr),
  ])

  const users = (usersRes.data || []) as TeamUser[]
  const logs = (logsRes.data || []) as WorkLog[]
  const tasks = (tasksRes.data || []) as TaskLog[]

  // Build list of all days in month
  const calendarDays: { dateStr: string; dayNum: number; isWeekend: boolean }[] = []
  for (let i = 1; i <= lastDay; i++) {
    const d = new Date(year, month - 1, i)
    const isWeekend = d.getDay() === 0 // Sunday weekend
    calendarDays.push({
      dateStr: `${year}-${String(month).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      dayNum: i,
      isWeekend,
    })
  }

  const memberAttendance = users.map((user) => {
    const userLogs = logs.filter((l) => l.user_id === user.id)
    const userTasks = tasks.filter((t) => t.assigned_to === user.id)

    const userWorkedDates = new Set(userLogs.map((l) => l.work_date))
    const workingDays = userWorkedDates.size

    const totalHours = Number(
      userLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1)
    )
    const avgHours = workingDays > 0 ? Number((totalHours / workingDays).toFixed(1)) : 0

    const tasksCompleted = userTasks.filter((t) => t.status === 'completed').length
    const tasksPending = userTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

    // Matrix status for each calendar day: 'worked' | 'no_log' | 'weekend'
    const daysMatrix: Record<string, 'worked' | 'no_log' | 'weekend'> = {}
    const dayStatus = calendarDays.map((day) => {
      const dayLogsForUser = userLogs.filter((l) => l.work_date === day.dateStr)
      const hours = dayLogsForUser.length > 0
        ? Number(dayLogsForUser.reduce((a, c) => a + Number(c.total_hours || 0), 0).toFixed(1))
        : 0
      const status: 'worked' | 'no_log' | 'weekend' = userWorkedDates.has(day.dateStr)
        ? 'worked'
        : day.isWeekend
        ? 'weekend'
        : 'no_log'
      daysMatrix[day.dateStr] = status
      return {
        day: day.dayNum,
        date: day.dateStr,
        status,
        isWeekend: day.isWeekend,
        hours,
      }
    })

    return {
      userId: user.id,
      name: user.name,
      userName: user.name,
      role: user.role,
      status: user.status,
      workingDays,
      totalWorkingDays: workingDays,
      totalHours,
      avgHours,
      avgHoursPerDay: avgHours,
      tasksCompleted,
      tasksPending,
      daysMatrix,
      dayStatus,
    }
  })

  const totalCompanyHours = Number(
    memberAttendance.reduce((acc, m) => acc + m.totalHours, 0).toFixed(1)
  )
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === 'completed').length
  const pendingTasks = tasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length
  const uniqueCompanyDays = new Set(logs.map((l) => l.work_date)).size

  return {
    year,
    month,
    monthName: new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' }),
    totalDaysInMonth: lastDay,
    calendarDays,
    totalWorkingDays: uniqueCompanyDays,
    totalTeamMembers: users.length,
    totalTasks,
    completedTasks,
    pendingTasks,
    totalWorkingHours: totalCompanyHours,
    memberAttendance,
  }
}

// ==============================================================================
// 9. DASHBOARD ANALYTICS & CHARTS DATA LOADER
// ==============================================================================

export async function getDashboardAnalyticsData() {
  const supabase = await createClient()
  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // This month boundaries
  const thisMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`
  
  // Previous month boundaries
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthStart = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-01`
  const prevMonthLastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate()
  const prevMonthEnd = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}-${String(prevMonthLastDay).padStart(2, '0')}`

  // 7 days ago boundary
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split('T')[0]

  const [
    usersRes,
    allLogsRes,
    todayLogsRes,
    thisMonthLogsRes,
    prevMonthLogsRes,
    last7DaysLogsRes,
    allTasksRes,
    todayTasksRes,
  ] = await Promise.all([
    supabase.from('team_users').select('*'),
    supabase.from('work_logs').select('*'),
    supabase.from('work_logs').select('*, team_users(id, name, email, role)').eq('work_date', todayStr),
    supabase.from('work_logs').select('*').gte('work_date', thisMonthStart),
    supabase.from('work_logs').select('*').gte('work_date', prevMonthStart).lte('work_date', prevMonthEnd),
    supabase.from('work_logs').select('*').gte('work_date', sevenDaysAgoStr),
    supabase.from('task_logs').select('*'),
    supabase.from('task_logs').select('*').eq('assigned_date', todayStr),
  ])

  const users = (usersRes.data || []) as TeamUser[]
  const allLogs = (allLogsRes.data || []) as WorkLog[]
  const todayLogs = (todayLogsRes.data || []) as WorkLogWithUser[]
  const thisMonthLogs = (thisMonthLogsRes.data || []) as WorkLog[]
  const prevMonthLogs = (prevMonthLogsRes.data || []) as WorkLog[]
  const last7DaysLogs = (last7DaysLogsRes.data || []) as WorkLog[]
  const allTasks = (allTasksRes.data || []) as TaskLog[]
  const todayTasks = (todayTasksRes.data || []) as TaskLog[]

  // Deduplicated working days
  const totalWorkingDays = new Set(allLogs.map((l) => l.work_date)).size
  const thisMonthWorkingDays = new Set(thisMonthLogs.map((l) => l.work_date)).size
  const prevMonthWorkingDays = new Set(prevMonthLogs.map((l) => l.work_date)).size
  const todayMembersWorked = new Set(todayLogs.map((l) => l.user_id)).size

  const totalHours = Number(allLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1))
  const todayHours = Number(todayLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1))
  const thisMonthHours = Number(thisMonthLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1))

  const totalTasks = allTasks.length
  const completedTasks = allTasks.filter((t) => t.status === 'completed').length
  const pendingTasks = allTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

  const todayTasksCreated = todayTasks.length
  const todayTasksCompleted = todayTasks.filter((t) => t.status === 'completed').length
  const todayTasksPending = todayTasks.filter((t) => t.status === 'pending' || t.status === 'in_progress').length

  // Last 7 days trend chart
  const last7DaysChart: { date: string; day: string; dayName: string; hours: number; logsCount: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dStr = d.toISOString().split('T')[0]
    const dLogs = last7DaysLogs.filter((l) => l.work_date === dStr)
    const hours = Number(dLogs.reduce((acc, l) => acc + Number(l.total_hours || 0), 0).toFixed(1))
    const day = d.toLocaleDateString('en-US', { weekday: 'short' })
    last7DaysChart.push({
      date: dStr,
      day,
      dayName: day,
      hours,
      logsCount: dLogs.length,
    })
  }

  // Category distribution
  const categoryMap: Record<string, number> = {}
  allLogs.forEach((log) => {
    const cat = log.work_category || 'General'
    categoryMap[cat] = (categoryMap[cat] || 0) + Number(log.total_hours || 0)
  })

  const categoryBreakdown = Object.entries(categoryMap).map(([category, hours]) => ({
    category,
    hours: Number(hours.toFixed(1)),
  }))

  return {
    todayDate: todayStr,
    today: todayStr,
    todayLogs,
    todayMetrics: {
      totalTeamMembers: users.length,
      membersWorkedToday: todayMembersWorked,
      totalWorkingHours: todayHours,
      tasksCreatedToday: todayTasksCreated,
      tasksCompletedToday: todayTasksCompleted,
      tasksPendingToday: todayTasksPending,
    },
    totalTeamMembers: users.length,
    activeTeamMembers: users.filter((u) => u.status === 'active').length,
    todayMembersWorked,
    todayHours,
    todayTasksCreated,
    todayTasksCompleted,
    todayTasksPending,
    totalWorkingDays,
    thisMonthWorkingDays,
    prevMonthWorkingDays,
    totalHours,
    currentMonthHours: thisMonthHours,
    currentMonthWorkingDays: thisMonthWorkingDays,
    totalTasks,
    completedTasks,
    pendingTasks,
    last7DaysChart,
    sevenDayTrend: last7DaysChart,
    categoryBreakdown,
  }
}
