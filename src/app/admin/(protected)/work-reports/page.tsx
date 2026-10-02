export const dynamic = 'force-dynamic'

import {
  getTeamUsers,
  getWorkLogs,
  getTaskLogs,
  getDashboardAnalyticsData,
  getWorkingDaysReport,
  getDailyReportData,
  getWeeklyReportData,
  getMonthlyReportData,
} from '@/lib/actions/workReports'
import WorkReportsClient from './WorkReportsClient'

export default async function WorkReportsPage() {
  const [
    teamUsers,
    workLogsRes,
    taskLogs,
    analytics,
    workingDaysReport,
    dailyReport,
    weeklyReport,
    monthlyReport,
  ] = await Promise.all([
    getTeamUsers(),
    getWorkLogs({ limit: 100 }),
    getTaskLogs({ limit: 100 }),
    getDashboardAnalyticsData(),
    getWorkingDaysReport(),
    getDailyReportData(),
    getWeeklyReportData(),
    getMonthlyReportData(),
  ])

  return (
    <WorkReportsClient
      initialTeamUsers={teamUsers}
      initialWorkLogs={workLogsRes.logs}
      initialTaskLogs={taskLogs}
      initialAnalytics={analytics}
      initialWorkingDaysReport={workingDaysReport}
      initialDailyReport={dailyReport}
      initialWeeklyReport={weeklyReport}
      initialMonthlyReport={monthlyReport}
    />
  )
}
