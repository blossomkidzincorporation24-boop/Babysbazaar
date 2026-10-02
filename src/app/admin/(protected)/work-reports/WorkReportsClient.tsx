'use client'

import React, { useState, useTransition } from 'react'
import {
  Calendar,
  Clock,
  CheckCircle2,
  Users,
  Briefcase,
  Plus,
  Filter,
  Download,
  Printer,
  ChevronRight,
  TrendingUp,
  AlertCircle,
  FileText,
  Trash2,
  Edit2,
  Search,
  CheckSquare,
  BarChart3,
  CalendarDays,
  ListTodo,
  UserCheck,
  UserPlus,
  RefreshCw,
  X,
} from 'lucide-react'
import type {
  TeamUser,
  WorkLogWithUser,
  TaskLogWithUser,
  DailyReport,
} from '@/types/database.types'
import {
  createTeamUser,
  updateTeamUser,
  toggleTeamUserStatus,
  deleteTeamUser,
  createWorkLog,
  updateWorkLog,
  deleteWorkLog,
  createTaskLog,
  updateTaskLog,
  deleteTaskLog,
  getWorkingDaysReport,
  getDailyReportData,
  getWeeklyReportData,
  getMonthlyReportData,
  getDashboardAnalyticsData,
  getWorkLogs,
  getTaskLogs,
  getTeamUsers,
  type WorkingDaysReportResult,
} from '@/lib/actions/workReports'

interface WorkReportsClientProps {
  initialTeamUsers: TeamUser[]
  initialWorkLogs: WorkLogWithUser[]
  initialTaskLogs: TaskLogWithUser[]
  initialAnalytics: any
  initialWorkingDaysReport: WorkingDaysReportResult
  initialDailyReport: any
  initialWeeklyReport: any
  initialMonthlyReport: any
}

type TabType =
  | 'overview'
  | 'working-days'
  | 'daily'
  | 'weekly'
  | 'monthly'
  | 'work-logs'
  | 'tasks'
  | 'team'

export default function WorkReportsClient({
  initialTeamUsers,
  initialWorkLogs,
  initialTaskLogs,
  initialAnalytics,
  initialWorkingDaysReport,
  initialDailyReport,
  initialWeeklyReport,
  initialMonthlyReport,
}: WorkReportsClientProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [teamUsers, setTeamUsers] = useState<TeamUser[]>(initialTeamUsers)
  const [workLogs, setWorkLogs] = useState<WorkLogWithUser[]>(initialWorkLogs)
  const [taskLogs, setTaskLogs] = useState<TaskLogWithUser[]>(initialTaskLogs)
  const [analytics, setAnalytics] = useState(initialAnalytics)
  const [workingDaysReport, setWorkingDaysReport] = useState<WorkingDaysReportResult>(initialWorkingDaysReport)
  const [dailyReport, setDailyReport] = useState(initialDailyReport)
  const [weeklyReport, setWeeklyReport] = useState(initialWeeklyReport)
  const [monthlyReport, setMonthlyReport] = useState(initialMonthlyReport)

  const [isPending, startTransition] = useTransition()
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Working Days Filter State
  const [filterPeriod, setFilterPeriod] = useState<string>('this_month')
  const [filterUser, setFilterUser] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Daily Filter State
  const [dailyDate, setDailyDate] = useState<string>(new Date().toISOString().split('T')[0])

  // Modals state
  const [showWorkLogModal, setShowWorkLogModal] = useState(false)
  const [editingWorkLog, setEditingWorkLog] = useState<WorkLogWithUser | null>(null)
  const [workLogForm, setWorkLogForm] = useState({
    user_id: '',
    work_date: new Date().toISOString().split('T')[0],
    work_title: '',
    work_description: '',
    work_category: 'General',
    status: 'completed',
    start_time: '09:00',
    end_time: '17:00',
    total_hours: 8,
    notes: '',
  })

  const [showTaskModal, setShowTaskModal] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskLogWithUser | null>(null)
  const [taskForm, setTaskForm] = useState({
    assigned_to: '',
    task_title: '',
    description: '',
    priority: 'medium',
    status: 'pending',
    assigned_date: new Date().toISOString().split('T')[0],
    due_date: '',
  })

  const [showMemberModal, setShowMemberModal] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamUser | null>(null)
  const [memberForm, setMemberForm] = useState({
    name: '',
    email: '',
    role: 'staff',
    phone: '',
    status: 'active',
  })

  // Search filter for work logs
  const [searchQuery, setSearchQuery] = useState('')

  function showMessage(type: 'success' | 'error', message: string) {
    setFeedback({ type, message })
    setTimeout(() => setFeedback(null), 4000)
  }

  // Refresh all reports
  async function refreshData() {
    startTransition(async () => {
      try {
        const [users, logsData, tasks, newAnalytics, daysReport, dailyData, weeklyData, monthlyData] =
          await Promise.all([
            getTeamUsers(),
            getWorkLogs({ limit: 100 }),
            getTaskLogs({ limit: 100 }),
            getDashboardAnalyticsData(),
            getWorkingDaysReport({ userId: filterUser, status: filterStatus }),
            getDailyReportData(dailyDate),
            getWeeklyReportData(),
            getMonthlyReportData(),
          ])

        setTeamUsers(users)
        setWorkLogs(logsData.logs)
        setTaskLogs(tasks)
        setAnalytics(newAnalytics)
        setWorkingDaysReport(daysReport)
        setDailyReport(dailyData)
        setWeeklyReport(weeklyData)
        setMonthlyReport(monthlyData)
        showMessage('success', 'Data refreshed successfully')
      } catch (err: any) {
        showMessage('error', 'Failed to refresh data: ' + err.message)
      }
    })
  }

  // Apply Working Days filter
  async function handleFilterWorkingDays(period: string, user: string, status: string) {
    setFilterPeriod(period)
    setFilterUser(user)
    setFilterStatus(status)

    let start = ''
    let end = ''
    const now = new Date()

    if (period === 'today') {
      start = now.toISOString().split('T')[0]
      end = start
    } else if (period === 'this_week') {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1)
      const monday = new Date(now.setDate(diff))
      start = monday.toISOString().split('T')[0]
      end = new Date().toISOString().split('T')[0]
    } else if (period === 'this_month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]
    } else if (period === 'prev_month') {
      start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0]
      end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0]
    } else if (period === 'custom') {
      start = customStartDate
      end = customEndDate
    }

    startTransition(async () => {
      const res = await getWorkingDaysReport({
        startDate: start || undefined,
        endDate: end || undefined,
        userId: user,
        status: status,
      })
      setWorkingDaysReport(res)
    })
  }

  // Daily report date change
  async function handleDailyDateChange(date: string) {
    setDailyDate(date)
    startTransition(async () => {
      const res = await getDailyReportData(date)
      setDailyReport(res)
    })
  }

  // Work Log CRUD
  function openAddWorkLog() {
    setEditingWorkLog(null)
    setWorkLogForm({
      user_id: teamUsers[0]?.id || '',
      work_date: new Date().toISOString().split('T')[0],
      work_title: '',
      work_description: '',
      work_category: 'General',
      status: 'completed',
      start_time: '09:00',
      end_time: '17:00',
      total_hours: 8,
      notes: '',
    })
    setShowWorkLogModal(true)
  }

  function openEditWorkLog(log: WorkLogWithUser) {
    setEditingWorkLog(log)
    setWorkLogForm({
      user_id: log.user_id,
      work_date: log.work_date,
      work_title: log.work_title,
      work_description: log.work_description || '',
      work_category: log.work_category || 'General',
      status: log.status,
      start_time: log.start_time || '09:00',
      end_time: log.end_time || '17:00',
      total_hours: log.total_hours,
      notes: log.notes || '',
    })
    setShowWorkLogModal(true)
  }

  async function handleSaveWorkLog(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      let res
      if (editingWorkLog) {
        res = await updateWorkLog(editingWorkLog.id, workLogForm)
      } else {
        res = await createWorkLog(workLogForm)
      }

      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', editingWorkLog ? 'Work log updated' : 'Work log added')
        setShowWorkLogModal(false)
        refreshData()
      }
    })
  }

  async function handleDeleteWorkLog(id: string) {
    if (!confirm('Are you sure you want to delete this work log?')) return
    startTransition(async () => {
      const res = await deleteWorkLog(id)
      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', 'Work log deleted')
        refreshData()
      }
    })
  }

  // Task CRUD
  function openAddTask() {
    setEditingTask(null)
    setTaskForm({
      assigned_to: teamUsers[0]?.id || '',
      task_title: '',
      description: '',
      priority: 'medium',
      status: 'pending',
      assigned_date: new Date().toISOString().split('T')[0],
      due_date: '',
    })
    setShowTaskModal(true)
  }

  function openEditTask(task: TaskLogWithUser) {
    setEditingTask(task)
    setTaskForm({
      assigned_to: task.assigned_to || '',
      task_title: task.task_title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      assigned_date: task.assigned_date,
      due_date: task.due_date || '',
    })
    setShowTaskModal(true)
  }

  async function handleSaveTask(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      let res
      if (editingTask) {
        res = await updateTaskLog(editingTask.id, taskForm)
      } else {
        res = await createTaskLog(taskForm)
      }

      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', editingTask ? 'Task updated' : 'Task created')
        setShowTaskModal(false)
        refreshData()
      }
    })
  }

  async function handleDeleteTask(id: string) {
    if (!confirm('Are you sure you want to delete this task?')) return
    startTransition(async () => {
      const res = await deleteTaskLog(id)
      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', 'Task deleted')
        refreshData()
      }
    })
  }

  // Member CRUD
  function openAddMember() {
    setEditingMember(null)
    setMemberForm({
      name: '',
      email: '',
      role: 'staff',
      phone: '',
      status: 'active',
    })
    setShowMemberModal(true)
  }

  function openEditMember(member: TeamUser) {
    setEditingMember(member)
    setMemberForm({
      name: member.name,
      email: member.email,
      role: member.role,
      phone: member.phone || '',
      status: member.status,
    })
    setShowMemberModal(true)
  }

  async function handleSaveMember(e: React.FormEvent) {
    e.preventDefault()
    startTransition(async () => {
      let res
      if (editingMember) {
        res = await updateTeamUser(editingMember.id, memberForm)
      } else {
        res = await createTeamUser(memberForm)
      }

      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', editingMember ? 'Team member updated' : 'Team member added')
        setShowMemberModal(false)
        refreshData()
      }
    })
  }

  async function handleToggleMemberStatus(member: TeamUser) {
    startTransition(async () => {
      const res = await toggleTeamUserStatus(member.id, member.status)
      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', `Member marked ${member.status === 'active' ? 'inactive' : 'active'}`)
        refreshData()
      }
    })
  }

  async function handleDeleteMember(id: string) {
    if (!confirm('Are you sure you want to remove this team member? All their historical logs will be preserved.')) return
    startTransition(async () => {
      const res = await deleteTeamUser(id)
      if (res.error) {
        showMessage('error', res.error)
      } else {
        showMessage('success', 'Team member removed')
        refreshData()
      }
    })
  }

  // Export CSV function
  function exportCSV() {
    const headers = [
      'Team Member',
      'Role',
      'Status',
      'Working Days (Unique)',
      'Total Hours',
      'Avg Hours/Day',
      'Tasks Assigned',
      'Tasks Completed',
      'Tasks Pending',
      'Completion Rate (%)',
      'Dates Worked',
    ]

    const rows = workingDaysReport.memberSummaries.map((m) => [
      `"${m.userName}"`,
      m.userRole,
      m.userStatus,
      m.workingDays,
      m.totalHours,
      m.avgHoursPerDay,
      m.tasksAssigned,
      m.tasksCompleted,
      m.tasksPending,
      `${m.completionRate}%`,
      `"${m.datesWorked.join(', ')}"`,
    ])

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute('download', `BabysBazaar_Work_Report_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showMessage('success', 'CSV Report downloaded')
  }

  // Filtered work logs
  const filteredWorkLogs = workLogs.filter((log) => {
    const term = searchQuery.toLowerCase()
    const name = log.team_users?.name?.toLowerCase() || ''
    const title = log.work_title.toLowerCase()
    const cat = log.work_category.toLowerCase()
    const desc = (log.work_description || '').toLowerCase()
    return name.includes(term) || title.includes(term) || cat.includes(term) || desc.includes(term)
  })

  return (
    <div className="space-y-8 pb-16 font-sans">
      {/* Toast Notification */}
      {feedback && (
        <div
          className={`fixed top-5 right-5 z-50 px-5 py-3.5 rounded-xl shadow-lg border text-sm font-medium flex items-center gap-3 transition-all animate-in fade-in slide-in-from-top-4 ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 size={18} className="text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="text-rose-600" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Header Bar */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-neutral-100 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FCE8EF] text-[#E52D68] flex items-center justify-center font-bold">
                <Briefcase size={20} />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
                  Work Report & Team Management
                </h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  Live team tracking, deduplicated working day calculations, daily worklogs & performance analytics
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={refreshData}
              disabled={isPending}
              className="p-2.5 text-neutral-600 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw size={16} className={isPending ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={exportCSV}
              className="px-4 py-2.5 text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Download size={16} />
              <span>Export CSV</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-4 py-2.5 text-neutral-700 bg-white hover:bg-neutral-50 border border-neutral-200 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm print:hidden"
            >
              <Printer size={16} />
              <span>Print Report</span>
            </button>

            <button
              onClick={openAddWorkLog}
              className="px-4 py-2.5 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={16} />
              <span>Log Work</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="mt-8 border-b border-neutral-200/80 flex items-center gap-2 overflow-x-auto no-scrollbar print:hidden">
          {[
            { id: 'overview', label: 'Dashboard & KPIs', icon: BarChart3 },
            { id: 'working-days', label: 'Working Days Report', icon: TrendingUp },
            { id: 'daily', label: 'Daily Work Tracking', icon: CalendarDays },
            { id: 'weekly', label: 'Weekly Summary', icon: Clock },
            { id: 'monthly', label: 'Monthly Matrix', icon: Calendar },
            { id: 'work-logs', label: 'Work Logs', icon: FileText },
            { id: 'tasks', label: 'Task Management', icon: ListTodo },
            { id: 'team', label: 'Team Members', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active
                    ? 'border-[#E52D68] text-[#E52D68] font-semibold'
                    : 'border-transparent text-neutral-500 hover:text-neutral-900 hover:border-neutral-300'
                }`}
              >
                <Icon size={16} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. OVERVIEW & ANALYTICS DASHBOARD */}
      {/* ========================================================================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Top KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Total Team</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Users size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">{analytics.todayMetrics.totalTeamMembers}</span>
                <span className="text-xs text-neutral-500">members registered</span>
              </div>
              <div className="mt-3 text-xs text-emerald-600 font-medium flex items-center gap-1">
                <UserCheck size={14} />
                <span>{analytics.todayMetrics.membersWorkedToday} worked today</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Today's Hours</span>
                <div className="w-9 h-9 rounded-xl bg-pink-50 text-[#E52D68] flex items-center justify-center">
                  <Clock size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">{analytics.todayMetrics.totalWorkingHours}h</span>
                <span className="text-xs text-neutral-500">logged today</span>
              </div>
              <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
                <Calendar size={14} />
                <span>Date: {analytics.todayDate}</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Tasks Completed</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">{analytics.todayMetrics.tasksCompletedToday}</span>
                <span className="text-xs text-neutral-500">completed today</span>
              </div>
              <div className="mt-3 text-xs text-amber-600 font-medium flex items-center gap-1">
                <AlertCircle size={14} />
                <span>{analytics.todayMetrics.tasksPendingToday} pending/in progress</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Month's Total Hours</span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <TrendingUp size={18} />
                </div>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-neutral-900">{analytics.currentMonthHours}h</span>
                <span className="text-xs text-neutral-500">this month</span>
              </div>
              <div className="mt-3 text-xs text-neutral-500 flex items-center gap-1">
                <CheckSquare size={14} />
                <span>{analytics.currentMonthWorkingDays} unique company days</span>
              </div>
            </div>
          </div>

          {/* 7-Day Trend Chart & Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 7-Day Working Hours Trend */}
            <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-neutral-900">7-Day Team Working Hours Trend</h2>
                  <p className="text-xs text-neutral-500">Hours logged per day across all staff</p>
                </div>
                <div className="text-xs font-medium text-neutral-400">Last 7 Days</div>
              </div>

              <div className="space-y-4">
                <div className="flex items-end gap-3 h-48 pt-6 pb-2 border-b border-neutral-100">
                  {analytics.sevenDayTrend.map((item: any, idx: number) => {
                    const maxH = Math.max(...analytics.sevenDayTrend.map((d: any) => d.hours), 10)
                    const heightPercent = Math.min(Math.round((item.hours / maxH) * 100), 100)
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-[11px] font-semibold text-neutral-700 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.hours}h
                        </span>
                        <div
                          style={{ height: `${Math.max(heightPercent, 8)}%` }}
                          className={`w-full max-w-[42px] rounded-t-lg transition-all duration-300 ${
                            item.hours > 0 ? 'bg-[#E52D68] group-hover:bg-[#d4205b]' : 'bg-neutral-100'
                          }`}
                        />
                      </div>
                    )
                  })}
                </div>
                <div className="flex justify-between gap-3 text-center">
                  {analytics.sevenDayTrend.map((item: any, idx: number) => (
                    <div key={idx} className="flex-1">
                      <div className="text-[11px] font-semibold text-neutral-800">{item.dayName}</div>
                      <div className="text-[10px] text-neutral-400">{item.date.slice(5)}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Work Categories Breakdown */}
            <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
              <h2 className="text-base font-bold text-neutral-900 mb-1">Work Categories</h2>
              <p className="text-xs text-neutral-500 mb-6">Hours distribution by department</p>

              <div className="space-y-4">
                {analytics.categoryBreakdown.length === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-400">No logs recorded yet</div>
                ) : (
                  analytics.categoryBreakdown.map((cat: any, idx: number) => {
                    const totalAll = analytics.categoryBreakdown.reduce((a: number, c: any) => a + c.hours, 0) || 1
                    const pct = Math.round((cat.hours / totalAll) * 100)
                    return (
                      <div key={idx} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="text-neutral-700">{cat.category}</span>
                          <span className="text-neutral-500">
                            {cat.hours}h ({pct}%)
                          </span>
                        </div>
                        <div className="w-full bg-neutral-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-[#E52D68] h-2 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* Today's Activity & Staff Logs */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-base font-bold text-neutral-900">Today's Work Activity ({analytics.todayDate})</h2>
                <p className="text-xs text-neutral-500">Live submission stream from team members</p>
              </div>
              <button
                onClick={openAddWorkLog}
                className="text-xs font-semibold text-[#E52D68] hover:underline flex items-center gap-1"
              >
                <Plus size={14} />
                <span>Add Log</span>
              </button>
            </div>

            {analytics.todayLogs.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-neutral-200 rounded-xl">
                <Clock className="mx-auto text-neutral-300 mb-2" size={32} />
                <p className="text-sm font-medium text-neutral-600">No work logs submitted today yet</p>
                <p className="text-xs text-neutral-400 mt-1">Click "Log Work" to record activities for today.</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {analytics.todayLogs.map((log: any) => (
                  <div key={log.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-full bg-[#FCE8EF] text-[#E52D68] font-bold flex items-center justify-center text-sm flex-shrink-0">
                        {log.team_users?.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-semibold text-neutral-900">{log.work_title}</h4>
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 font-medium">
                            {log.work_category}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          by <span className="font-medium text-neutral-700">{log.team_users?.name}</span> ({log.team_users?.role})
                          {log.work_description ? ` — ${log.work_description}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                      <div className="text-right">
                        <span className="font-bold text-neutral-900 text-sm">{log.total_hours} hrs</span>
                        <div className="text-neutral-400">
                          {log.start_time && log.end_time ? `${log.start_time} - ${log.end_time}` : 'Full Day'}
                        </div>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full font-medium ${
                          log.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. WORKING DAYS REPORT TAB (STRICT DEDUPLICATION) */}
      {/* ========================================================================= */}
      {activeTab === 'working-days' && (
        <div className="space-y-6">
          {/* Filters Bar */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-neutral-900">Working Days & Performance Report</h2>
                <p className="text-xs text-neutral-500">
                  Strict deduplication: Multiple logs on the same date count as 1 working day.
                </p>
              </div>

              {/* Period Quick Select */}
              <div className="flex flex-wrap items-center gap-2">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'this_week', label: 'This Week' },
                  { id: 'this_month', label: 'This Month' },
                  { id: 'prev_month', label: 'Previous Month' },
                  { id: 'custom', label: 'Custom Range' },
                ].map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleFilterWorkingDays(p.id, filterUser, filterStatus)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                      filterPeriod === p.id
                        ? 'bg-[#E52D68] text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Range & Filter Dropdowns */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2 border-t border-neutral-100">
              {filterPeriod === 'custom' && (
                <>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500 block mb-1">Start Date</label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-neutral-500 block mb-1">End Date</label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full text-xs px-3 py-2 border rounded-xl"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="text-[11px] font-semibold text-neutral-500 block mb-1">Team Member</label>
                <select
                  value={filterUser}
                  onChange={(e) => handleFilterWorkingDays(filterPeriod, e.target.value, filterStatus)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                >
                  <option value="all">All Team Members</option>
                  {teamUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-neutral-500 block mb-1">Work Status</label>
                <select
                  value={filterStatus}
                  onChange={(e) => handleFilterWorkingDays(filterPeriod, filterUser, e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-neutral-200 rounded-xl bg-white"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="in_progress">In Progress</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              {filterPeriod === 'custom' && (
                <div className="flex items-end">
                  <button
                    onClick={() => handleFilterWorkingDays('custom', filterUser, filterStatus)}
                    className="w-full py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800"
                  >
                    Apply Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Summary Table */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-neutral-900 text-sm">
                  Period: <span className="text-[#E52D68]">{workingDaysReport.periodLabel}</span>
                </h3>
                <p className="text-xs text-neutral-500">
                  {workingDaysReport.startDate} to {workingDaysReport.endDate} • Total Company Hours:{' '}
                  <span className="font-semibold text-neutral-800">{workingDaysReport.totalCompanyHours}h</span>
                </p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3.5 px-4">TEAM MEMBER</th>
                    <th className="py-3.5 px-4 text-center">ROLE</th>
                    <th className="py-3.5 px-4 text-center">WORKING DAYS</th>
                    <th className="py-3.5 px-4 text-center">TOTAL HOURS</th>
                    <th className="py-3.5 px-4 text-center">AVG HOURS/DAY</th>
                    <th className="py-3.5 px-4 text-center">TASKS ASSIGNED</th>
                    <th className="py-3.5 px-4 text-center">TASKS DONE</th>
                    <th className="py-3.5 px-4 text-center">TASKS PENDING</th>
                    <th className="py-3.5 px-4 text-center">COMPLETION RATE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {workingDaysReport.memberSummaries.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-neutral-400">
                        No team member records found for this period.
                      </td>
                    </tr>
                  ) : (
                    workingDaysReport.memberSummaries.map((member) => (
                      <tr key={member.userId} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-neutral-900">{member.userName}</div>
                          <div className="text-[10px] text-neutral-400">{member.userEmail}</div>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium capitalize">
                            {member.userRole}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-pink-50 text-[#E52D68] font-bold text-xs">
                            {member.workingDays} days
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-semibold text-neutral-900">
                          {member.totalHours} hrs
                        </td>
                        <td className="py-3.5 px-4 text-center text-neutral-600">
                          {member.avgHoursPerDay} h/day
                        </td>
                        <td className="py-3.5 px-4 text-center font-medium">{member.tasksAssigned}</td>
                        <td className="py-3.5 px-4 text-center text-emerald-600 font-semibold">
                          {member.tasksCompleted}
                        </td>
                        <td className="py-3.5 px-4 text-center text-amber-600 font-semibold">
                          {member.tasksPending}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <span className="font-semibold">{member.completionRate}%</span>
                            <div className="w-12 bg-neutral-200 rounded-full h-1.5 overflow-hidden">
                              <div
                                className={`h-1.5 rounded-full ${
                                  member.completionRate >= 80
                                    ? 'bg-emerald-500'
                                    : member.completionRate >= 50
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                                }`}
                                style={{ width: `${member.completionRate}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DAILY WORK TRACKING TAB */}
      {/* ========================================================================= */}
      {activeTab === 'daily' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Daily Work Tracking</h2>
              <p className="text-xs text-neutral-500">Detailed snapshot of team submissions for any specific date</p>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-xs font-semibold text-neutral-600">Select Date:</label>
              <input
                type="date"
                value={dailyDate}
                onChange={(e) => handleDailyDateChange(e.target.value)}
                className="text-xs px-3 py-2 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-[#E52D68]"
              />
              <button
                onClick={() => handleDailyDateChange(new Date().toISOString().split('T')[0])}
                className="px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
              >
                Today
              </button>
            </div>
          </div>

          {/* Daily Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-xl border border-neutral-100">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">Members Worked</div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">
                {dailyReport.membersWorked} / {dailyReport.totalTeamMembers}
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-100">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">Total Hours</div>
              <div className="text-2xl font-bold text-[#E52D68] mt-1">{dailyReport.totalHours} hrs</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-100">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">Tasks Completed</div>
              <div className="text-2xl font-bold text-emerald-600 mt-1">{dailyReport.tasksCompleted}</div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-neutral-100">
              <div className="text-[11px] text-neutral-400 font-semibold uppercase">Tasks Pending</div>
              <div className="text-2xl font-bold text-amber-600 mt-1">{dailyReport.tasksPending}</div>
            </div>
          </div>

          {/* Member Daily Entries Table */}
          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-neutral-100">
              <h3 className="font-bold text-neutral-900 text-sm">Team Member Submissions for {dailyDate}</h3>
            </div>

            <div className="divide-y divide-neutral-100">
              {dailyReport.memberEntries.length === 0 ? (
                <div className="p-8 text-center text-xs text-neutral-400">No team members registered.</div>
              ) : (
                dailyReport.memberEntries.map((entry: any) => (
                  <div key={entry.userId} className="p-5 hover:bg-neutral-50/60 transition-colors">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-neutral-900 text-sm">{entry.userName}</span>
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 text-[11px] capitalize">
                            {entry.role}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                              entry.hasWorked ? 'bg-emerald-50 text-emerald-700' : 'bg-neutral-100 text-neutral-400'
                            }`}
                          >
                            {entry.hasWorked ? '✓ Logged Work' : '✗ No Entry'}
                          </span>
                        </div>

                        {entry.hasWorked ? (
                          <div className="mt-3 space-y-2">
                            {entry.logs.map((log: any) => (
                              <div key={log.id} className="bg-neutral-50 p-3 rounded-xl text-xs space-y-1">
                                <div className="flex items-center justify-between">
                                  <span className="font-semibold text-neutral-800">{log.work_title}</span>
                                  <span className="font-bold text-neutral-900">{log.total_hours} hrs</span>
                                </div>
                                {log.work_description && (
                                  <p className="text-neutral-600 text-[11px]">{log.work_description}</p>
                                )}
                                {log.notes && (
                                  <p className="text-neutral-400 text-[10px] italic">Notes: {log.notes}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-neutral-400 mt-2">No work recorded for this date.</p>
                        )}
                      </div>

                      <div className="flex sm:flex-col items-end justify-between gap-2 text-right">
                        <div>
                          <div className="text-xs text-neutral-400">Total Hours</div>
                          <div className="text-base font-bold text-neutral-900">{entry.totalHours} hrs</div>
                        </div>
                        <div>
                          <div className="text-xs text-neutral-400">Tasks Completed</div>
                          <div className="text-xs font-semibold text-emerald-600">{entry.tasksCompleted} tasks</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. WEEKLY SUMMARY TAB */}
      {/* ========================================================================= */}
      {activeTab === 'weekly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Weekly Work Report</h2>
              <p className="text-xs text-neutral-500">
                Period: {weeklyReport.startDate} to {weeklyReport.endDate}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-neutral-400">Weekly Total: </span>
              <span className="text-lg font-bold text-[#E52D68]">{weeklyReport.totalWeeklyHours} hrs</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3.5 px-4">TEAM MEMBER</th>
                    <th className="py-3.5 px-3 text-center">MON</th>
                    <th className="py-3.5 px-3 text-center">TUE</th>
                    <th className="py-3.5 px-3 text-center">WED</th>
                    <th className="py-3.5 px-3 text-center">THU</th>
                    <th className="py-3.5 px-3 text-center">FRI</th>
                    <th className="py-3.5 px-3 text-center">SAT</th>
                    <th className="py-3.5 px-3 text-center">SUN</th>
                    <th className="py-3.5 px-4 text-center">TOTAL DAYS</th>
                    <th className="py-3.5 px-4 text-center">TOTAL HOURS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {weeklyReport.memberSummaries.map((m: any) => (
                    <tr key={m.userId} className="hover:bg-neutral-50/70">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900">{m.userName}</div>
                        <div className="text-[10px] text-neutral-400 capitalize">{m.role}</div>
                      </td>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => {
                        const h = m.dailyHours[day] || 0
                        return (
                          <td key={day} className="py-3.5 px-3 text-center">
                            {h > 0 ? (
                              <span className="px-2 py-1 rounded-md bg-pink-50 text-[#E52D68] font-bold text-[11px]">
                                {h}h
                              </span>
                            ) : (
                              <span className="text-neutral-300">-</span>
                            )}
                          </td>
                        )
                      })}
                      <td className="py-3.5 px-4 text-center font-bold text-neutral-800">{m.workingDays}</td>
                      <td className="py-3.5 px-4 text-center font-bold text-[#E52D68]">{m.totalHours} hrs</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. MONTHLY ATTENDANCE MATRIX TAB */}
      {/* ========================================================================= */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                Monthly Attendance & Work Matrix ({monthlyReport.monthName} {monthlyReport.year})
              </h2>
              <p className="text-xs text-neutral-500">
                Full month calendar attendance grid: Green indicates days with logged work
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-emerald-500" />
                <span className="text-neutral-600">Worked</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-neutral-200" />
                <span className="text-neutral-600">No Log</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded bg-neutral-100 border border-dashed border-neutral-300" />
                <span className="text-neutral-600">Weekend</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3.5 px-4 sticky left-0 bg-neutral-50 z-10">TEAM MEMBER</th>
                    {Array.from({ length: monthlyReport.totalDaysInMonth }, (_, i) => i + 1).map((d) => (
                      <th key={d} className="py-2 px-1.5 text-center font-mono text-[10px] min-w-[28px]">
                        {d}
                      </th>
                    ))}
                    <th className="py-3.5 px-3 text-center">DAYS</th>
                    <th className="py-3.5 px-3 text-center">HOURS</th>
                    <th className="py-3.5 px-3 text-center">AVG/DAY</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {monthlyReport.memberAttendance.map((m: any) => (
                    <tr key={m.userId} className="hover:bg-neutral-50/70">
                      <td className="py-3 px-4 font-semibold text-neutral-900 sticky left-0 bg-white hover:bg-neutral-50 z-10 whitespace-nowrap">
                        {m.userName}
                      </td>
                      {m.dayStatus.map((s: any) => (
                        <td key={s.day} className="py-2 px-1 text-center">
                          {s.status === 'worked' ? (
                            <div
                              title={`${s.date}: ${s.hours} hours logged`}
                              className="w-5 h-5 mx-auto rounded bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold cursor-help"
                            >
                              {s.hours}
                            </div>
                          ) : s.isWeekend ? (
                            <div
                              title={`${s.date}: Weekend`}
                              className="w-5 h-5 mx-auto rounded bg-neutral-100 border border-neutral-200 text-neutral-400 flex items-center justify-center text-[9px]"
                            >
                              -
                            </div>
                          ) : (
                            <div
                              title={`${s.date}: No log`}
                              className="w-5 h-5 mx-auto rounded bg-neutral-100 text-neutral-300 flex items-center justify-center text-[9px]"
                            >
                              ·
                            </div>
                          )}
                        </td>
                      ))}
                      <td className="py-3 px-3 text-center font-bold text-neutral-900">{m.totalWorkingDays}</td>
                      <td className="py-3 px-3 text-center font-bold text-[#E52D68]">{m.totalHours}h</td>
                      <td className="py-3 px-3 text-center text-neutral-600">{m.avgHoursPerDay}h</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. WORK LOGS TABLE & CRUD TAB */}
      {/* ========================================================================= */}
      {activeTab === 'work-logs' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs by staff name, work title, category or description..."
                className="w-full text-xs pl-10 pr-4 py-2.5 border border-neutral-200 rounded-xl bg-white focus:outline-none focus:border-[#E52D68]"
              />
            </div>
            <button
              onClick={openAddWorkLog}
              className="px-4 py-2.5 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Log New Work</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-50 text-neutral-600 font-semibold border-b border-neutral-100">
                  <tr>
                    <th className="py-3.5 px-4">DATE</th>
                    <th className="py-3.5 px-4">STAFF MEMBER</th>
                    <th className="py-3.5 px-4">WORK TITLE / DESCRIPTION</th>
                    <th className="py-3.5 px-4 text-center">CATEGORY</th>
                    <th className="py-3.5 px-4 text-center">HOURS</th>
                    <th className="py-3.5 px-4 text-center">STATUS</th>
                    <th className="py-3.5 px-4 text-right">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-neutral-700">
                  {filteredWorkLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-neutral-400">
                        No work logs found. Click "Log New Work" to create one.
                      </td>
                    </tr>
                  ) : (
                    filteredWorkLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                          {log.work_date}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-semibold text-neutral-900">{log.team_users?.name || 'Unknown'}</div>
                          <div className="text-[10px] text-neutral-400 capitalize">{log.team_users?.role}</div>
                        </td>
                        <td className="py-3.5 px-4 max-w-xs">
                          <div className="font-semibold text-neutral-900">{log.work_title}</div>
                          {log.work_description && (
                            <div className="text-[11px] text-neutral-500 truncate">{log.work_description}</div>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-700 text-[11px] font-medium">
                            {log.work_category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-center font-bold text-neutral-900 whitespace-nowrap">
                          {log.total_hours} hrs
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[11px] font-semibold capitalize ${
                              log.status === 'completed'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditWorkLog(log)}
                              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
                              title="Edit"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteWorkLog(log.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                              title="Delete"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 7. TASK MANAGEMENT TAB */}
      {/* ========================================================================= */}
      {activeTab === 'tasks' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Task Management</h2>
              <p className="text-xs text-neutral-500">Track and assign operational tasks across the team</p>
            </div>
            <button
              onClick={openAddTask}
              className="px-4 py-2.5 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {taskLogs.length === 0 ? (
              <div className="col-span-full py-12 text-center text-neutral-400 bg-white rounded-2xl border border-neutral-100">
                No tasks logged yet. Click "Create Task" to assign work.
              </div>
            ) : (
              taskLogs.map((task) => (
                <div
                  key={task.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-100 shadow-sm space-y-3 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          task.priority === 'urgent'
                            ? 'bg-rose-100 text-rose-700'
                            : task.priority === 'high'
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize ${
                          task.status === 'completed'
                            ? 'bg-emerald-50 text-emerald-700'
                            : task.status === 'in_progress'
                            ? 'bg-purple-50 text-purple-700'
                            : 'bg-neutral-100 text-neutral-600'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    <h4 className="font-bold text-neutral-900 text-sm">{task.task_title}</h4>
                    {task.description && (
                      <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{task.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
                    <div>
                      <div className="text-[10px] text-neutral-400">Assigned To</div>
                      <div className="font-semibold text-neutral-800">
                        {task.team_users?.name || 'Unassigned'}
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTask(task)}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
                        title="Edit Task"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                        title="Delete Task"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 8. TEAM MEMBERS ROSTER TAB */}
      {/* ========================================================================= */}
      {activeTab === 'team' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-bold text-neutral-900">Team Members Roster</h2>
              <p className="text-xs text-neutral-500">Manage all staff members, roles and access status</p>
            </div>
            <button
              onClick={openAddMember}
              className="px-4 py-2.5 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-colors"
            >
              <UserPlus size={16} />
              <span>Add Member</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {teamUsers.map((member) => (
              <div
                key={member.id}
                className="bg-white rounded-2xl p-6 border border-neutral-100 shadow-sm space-y-4 flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-[#FCE8EF] text-[#E52D68] font-bold text-base flex items-center justify-center">
                      {member.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-neutral-900 text-sm">{member.name}</h4>
                      <p className="text-xs text-neutral-400">{member.email}</p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      member.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-neutral-100 text-neutral-400'
                    }`}
                  >
                    {member.status}
                  </span>
                </div>

                <div className="space-y-2 text-xs text-neutral-600 bg-neutral-50 p-3 rounded-xl">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Role:</span>
                    <span className="font-semibold text-neutral-800 capitalize">{member.role}</span>
                  </div>
                  {member.phone && (
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Phone:</span>
                      <span className="font-semibold text-neutral-800">{member.phone}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100 text-xs">
                  <button
                    onClick={() => handleToggleMemberStatus(member)}
                    className="text-neutral-500 hover:text-neutral-900 font-medium"
                  >
                    Set {member.status === 'active' ? 'Inactive' : 'Active'}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditMember(member)}
                      className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      onClick={() => handleDeleteMember(member.id)}
                      className="p-1.5 text-rose-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT WORK LOG */}
      {/* ========================================================================= */}
      {showWorkLogModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingWorkLog ? 'Edit Work Log' : 'Log Daily Work Entry'}
              </h3>
              <button
                onClick={() => setShowWorkLogModal(false)}
                className="p-1 text-neutral-400 hover:text-neutral-700"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveWorkLog} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Team Member *</label>
                  <select
                    required
                    value={workLogForm.user_id}
                    onChange={(e) => setWorkLogForm({ ...workLogForm, user_id: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="">Select Member</option>
                    {teamUsers.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Work Date *</label>
                  <input
                    type="date"
                    required
                    value={workLogForm.work_date}
                    onChange={(e) => setWorkLogForm({ ...workLogForm, work_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Work Title / Task Completed *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Catalogued 25 new toys, Packed 18 orders"
                  value={workLogForm.work_title}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, work_title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Detailed Description</label>
                <textarea
                  rows={2}
                  placeholder="Details of work done today..."
                  value={workLogForm.work_description}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, work_description: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Category</label>
                  <select
                    value={workLogForm.work_category}
                    onChange={(e) => setWorkLogForm({ ...workLogForm, work_category: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="General">General</option>
                    <option value="Inventory">Inventory</option>
                    <option value="Packaging">Packaging</option>
                    <option value="Fulfillment">Fulfillment</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Total Hours *</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.1"
                    max="24"
                    required
                    value={workLogForm.total_hours}
                    onChange={(e) =>
                      setWorkLogForm({ ...workLogForm, total_hours: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Status</label>
                  <select
                    value={workLogForm.status}
                    onChange={(e) => setWorkLogForm({ ...workLogForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="completed">Completed</option>
                    <option value="in_progress">In Progress</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Additional Notes</label>
                <input
                  type="text"
                  placeholder="Optional remarks..."
                  value={workLogForm.notes}
                  onChange={(e) => setWorkLogForm({ ...workLogForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowWorkLogModal(false)}
                  className="px-4 py-2 border rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Work Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TASK */}
      {/* ========================================================================= */}
      {showTaskModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingTask ? 'Edit Task' : 'Assign New Task'}
              </h3>
              <button onClick={() => setShowTaskModal(false)} className="p-1 text-neutral-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveTask} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Audit new baby clothes inventory"
                  value={taskForm.task_title}
                  onChange={(e) => setTaskForm({ ...taskForm, task_title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Assigned To</label>
                <select
                  value={taskForm.assigned_to}
                  onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl bg-white"
                >
                  <option value="">Unassigned</option>
                  {teamUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Status</label>
                  <select
                    value={taskForm.status}
                    onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Assigned Date</label>
                  <input
                    type="date"
                    required
                    value={taskForm.assigned_date}
                    onChange={(e) => setTaskForm({ ...taskForm, assigned_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Due Date</label>
                  <input
                    type="date"
                    value={taskForm.due_date}
                    onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowTaskModal(false)}
                  className="px-4 py-2 border rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL: ADD / EDIT TEAM MEMBER */}
      {/* ========================================================================= */}
      {showMemberModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-neutral-900 text-base">
                {editingMember ? 'Edit Team Member' : 'Add New Team Member'}
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="p-1 text-neutral-400">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={memberForm.name}
                  onChange={(e) => setMemberForm({ ...memberForm, name: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. priya@babysbazaar.com"
                  value={memberForm.email}
                  onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Role</label>
                  <select
                    value={memberForm.role}
                    onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="admin">Admin</option>
                    <option value="manager">Manager</option>
                    <option value="staff">Staff</option>
                    <option value="sales">Sales</option>
                    <option value="inventory">Inventory</option>
                    <option value="delivery">Delivery</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Status</label>
                  <select
                    value={memberForm.status}
                    onChange={(e) => setMemberForm({ ...memberForm, status: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-xl bg-white"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-neutral-700 block mb-1">Phone Number (Optional)</label>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  value={memberForm.phone}
                  onChange={(e) => setMemberForm({ ...memberForm, phone: e.target.value })}
                  className="w-full px-3 py-2 border rounded-xl"
                />
              </div>

              <div className="pt-3 border-t flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowMemberModal(false)}
                  className="px-4 py-2 border rounded-xl font-medium text-neutral-600 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="px-5 py-2 bg-[#E52D68] hover:bg-[#d4205b] text-white rounded-xl font-semibold disabled:opacity-50"
                >
                  {isPending ? 'Saving...' : 'Save Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
