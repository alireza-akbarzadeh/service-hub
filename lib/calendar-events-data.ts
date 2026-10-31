/**
 * Calendar Events Data & Utilities
 * Comprehensive event model for Full-Screen Calendar supporting English Gregorian
 * and Jalali dual-calendar engineering workflows.
 */

export type CalendarEventType = "meeting" | "deployment" | "sprint" | "oncall" | "gaming"

export interface CalendarEvent {
  id: string
  title: string
  date: string // "YYYY-MM-DD"
  startTime: string // "HH:MM" (24-hour)
  durationMins: number
  endTime: string // "HH:MM"
  type: CalendarEventType
  platform: "Google Meet" | "Zoom" | "Teams" | "Custom"
  meetUrl: string
  agenda: string
  attendees: string
  notifyBeforeMins: number
  isRecurringDaily?: boolean
  isRecurringWeekly?: boolean
  recurringDay?: number // 0-6 (0=Sun, 1=Mon, ..., 6=Sat)
  color?: string
}

export const EVENT_TYPE_CONFIG: Record<
  CalendarEventType,
  {
    label: string
    badgeClass: string
    dotColor: string
    borderClass: string
    bgClass: string
    textClass: string
  }
> = {
  meeting: {
    label: "Team Meeting",
    badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    dotColor: "#10b981",
    borderClass: "border-emerald-500/40",
    bgClass: "bg-emerald-500/10 hover:bg-emerald-500/20",
    textClass: "text-emerald-600 dark:text-emerald-400",
  },
  deployment: {
    label: "Deployment & Release",
    badgeClass: "border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-400",
    dotColor: "#8b5cf6",
    borderClass: "border-violet-500/40",
    bgClass: "bg-violet-500/10 hover:bg-violet-500/20",
    textClass: "text-violet-600 dark:text-violet-400",
  },
  sprint: {
    label: "Sprint & Milestone",
    badgeClass: "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400",
    dotColor: "#0284c7",
    borderClass: "border-sky-500/40",
    bgClass: "bg-sky-500/10 hover:bg-sky-500/20",
    textClass: "text-sky-600 dark:text-sky-400",
  },
  oncall: {
    label: "On-Call & Infra Ops",
    badgeClass: "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
    dotColor: "#f59e0b",
    borderClass: "border-amber-500/40",
    bgClass: "bg-amber-500/10 hover:bg-amber-500/20",
    textClass: "text-amber-600 dark:text-amber-400",
  },
  gaming: {
    label: "CS2 Squad Match",
    badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
    dotColor: "#f43f5e",
    borderClass: "border-rose-500/40",
    bgClass: "bg-rose-500/10 hover:bg-rose-500/20",
    textClass: "text-rose-600 dark:text-rose-400",
  },
}

/**
 * Calculate HH:MM end time from start time and duration
 */
export function calculateEndTime(startTime: string, durationMins: number): string {
  const [hStr, mStr] = (startTime || "10:00").split(":")
  const totalMins = (parseInt(hStr, 10) || 0) * 60 + (parseInt(mStr, 10) || 0) + durationMins
  const endH = Math.floor(totalMins / 60) % 24
  const endM = totalMins % 60
  return `${String(endH).padStart(2, "0")}:${String(endM).padStart(2, "0")}`
}

export function formatDateKey(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export const GREGORIAN_MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export const GREGORIAN_WEEKDAYS = [
  { short: "Mon", long: "Monday", isWeekend: false },
  { short: "Tue", long: "Tuesday", isWeekend: false },
  { short: "Wed", long: "Wednesday", isWeekend: false },
  { short: "Thu", long: "Thursday", isWeekend: false },
  { short: "Fri", long: "Friday", isWeekend: false },
  { short: "Sat", long: "Saturday", isWeekend: true },
  { short: "Sun", long: "Sunday", isWeekend: true },
]

import { gregorianToJalali, type JalaliDate } from "@/components/iran-calendar/jalali-utils"

export interface CalendarDayCell {
  dateKey: string // "YYYY-MM-DD"
  day: number
  month: number
  year: number
  isCurrentMonth: boolean
  isToday: boolean
  dayOfWeek: number // 0=Sun..6=Sat
  jalali: JalaliDate
}

/**
 * Generate 35 or 42 grid cells for a given Gregorian month (1-indexed month)
 * startOnMonday: true = Monday (0) to Sunday (6), false = Sunday (0) to Saturday (6)
 */
export function generateMonthGrid(
  year: number,
  month: number,
  startOnMonday = true
): CalendarDayCell[] {
  const today = new Date()
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`

  const firstDay = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()

  // getDay() gives 0 for Sunday, 1 for Monday, etc.
  let firstDayIndex = firstDay.getDay()
  if (startOnMonday) {
    // Convert so Monday is 0, Sunday is 6
    firstDayIndex = (firstDayIndex + 6) % 7
  }

  const cells: CalendarDayCell[] = []

  // Previous month trailing days
  const prevMonthDays = new Date(year, month - 1, 0).getDate()
  const prevMonth = month === 1 ? 12 : month - 1
  const prevYear = month === 1 ? year - 1 : year

  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i
    const dateKey = formatDateKey(prevYear, prevMonth, d)
    cells.push({
      dateKey,
      day: d,
      month: prevMonth,
      year: prevYear,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      dayOfWeek: new Date(prevYear, prevMonth - 1, d).getDay(),
      jalali: gregorianToJalali(prevYear, prevMonth, d),
    })
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const dateKey = formatDateKey(year, month, d)
    cells.push({
      dateKey,
      day: d,
      month,
      year,
      isCurrentMonth: true,
      isToday: dateKey === todayKey,
      dayOfWeek: new Date(year, month - 1, d).getDay(),
      jalali: gregorianToJalali(year, month, d),
    })
  }

  // Next month leading days to complete the 35 or 42 grid
  const remaining = (7 - (cells.length % 7)) % 7
  const nextMonth = month === 12 ? 1 : month + 1
  const nextYear = month === 12 ? year + 1 : year

  for (let d = 1; d <= remaining; d++) {
    const dateKey = formatDateKey(nextYear, nextMonth, d)
    cells.push({
      dateKey,
      day: d,
      month: nextMonth,
      year: nextYear,
      isCurrentMonth: false,
      isToday: dateKey === todayKey,
      dayOfWeek: new Date(nextYear, nextMonth - 1, d).getDay(),
      jalali: gregorianToJalali(nextYear, nextMonth, d),
    })
  }

  return cells
}

/**
 * Filter events occurring on a specific dateKey (YYYY-MM-DD),
 * including matching recurring events.
 */
export function getEventsForDate(dateKey: string, events: CalendarEvent[]): CalendarEvent[] {
  const [yStr, mStr, dStr] = dateKey.split("-")
  const dateObj = new Date(parseInt(yStr, 10), parseInt(mStr, 10) - 1, parseInt(dStr, 10))
  const dayOfWeek = dateObj.getDay() // 0=Sun, 1=Mon, ..., 6=Sat

  return events
    .filter((event) => {
      if (event.date === dateKey) return true
      if (event.isRecurringDaily) {
        // Daily recurring: does not apply to weekends if it's a standup, but CS2 is everyday
        if (event.type === "meeting" && (dayOfWeek === 0 || dayOfWeek === 6)) {
          return false
        }
        return true
      }
      if (event.isRecurringWeekly && event.recurringDay === dayOfWeek) {
        return true
      }
      return false
    })
    .sort((a, b) => a.startTime.localeCompare(b.startTime))
}

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  // Recurring Daily Standup
  {
    id: "standup-recurring",
    title: "Daily Frontend Standup",
    date: "2026-10-31",
    startTime: "10:30",
    durationMins: 30,
    endTime: "11:00",
    type: "meeting",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Blockers, PR-2026-101 merge review, microservice catalog integration & daily goals",
    attendees: "Frontend Squad & QA",
    notifyBeforeMins: 5,
    isRecurringDaily: true,
  },
  // Architecture Review
  {
    id: "arch-review-tue",
    title: "Architecture & Code Review",
    date: "2026-10-27",
    startTime: "14:00",
    durationMins: 45,
    endTime: "14:45",
    type: "meeting",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Topology call graph performance, Redis caching layer & Next.js 16 compiler notes",
    attendees: "Tech Leads & Platform Team",
    notifyBeforeMins: 10,
    isRecurringWeekly: true,
    recurringDay: 2, // Tuesday
  },
  // Design Sync
  {
    id: "design-sync-wed",
    title: "UI/UX Design System Sync",
    date: "2026-10-28",
    startTime: "16:15",
    durationMins: 30,
    endTime: "16:45",
    type: "meeting",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Figma tokens handoff, theme adjustments, WCAG accessibility & bottom dock review",
    attendees: "Product Designers & Frontend",
    notifyBeforeMins: 5,
    isRecurringWeekly: true,
    recurringDay: 3, // Wednesday
  },
  // Sprint 24 Planning
  {
    id: "sprint-24-planning",
    title: "Sprint 24 Planning & Backlog Grooming",
    date: "2026-10-26",
    startTime: "09:30",
    durationMins: 60,
    endTime: "10:30",
    type: "sprint",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Scope sprint deliverables: In-Browser API Playground, Secrets Studio & Full-Screen Calendar",
    attendees: "Entire Engineering Team & Product",
    notifyBeforeMins: 15,
  },
  // Mid-Sprint Check
  {
    id: "sprint-24-midcheck",
    title: "Sprint 24 Mid-Sprint Alignment",
    date: "2026-10-31",
    startTime: "11:30",
    durationMins: 30,
    endTime: "12:00",
    type: "sprint",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Sprint 24 burndown status check, blockers clearance & QA readiness",
    attendees: "Frontend Squad & Scrum Master",
    notifyBeforeMins: 5,
  },
  // Deployment: v2.4.0 Production
  {
    id: "deploy-v2-4-0",
    title: "Production Release v2.4.0 (Edge Gateways)",
    date: "2026-10-27",
    startTime: "20:00",
    durationMins: 60,
    endTime: "21:00",
    type: "deployment",
    platform: "Teams",
    meetUrl: "https://meet.google.com/new",
    agenda: "Deploy canary edge gateway pods, monitor 5xx error rate on Prometheus & cut traffic over",
    attendees: "DevOps & Release Engineers",
    notifyBeforeMins: 30,
  },
  // Deployment: Hotfix
  {
    id: "deploy-hotfix-cors",
    title: "v2.4.1 Hotfix Deploy: CORS Preflight",
    date: "2026-10-30",
    startTime: "18:30",
    durationMins: 30,
    endTime: "19:00",
    type: "deployment",
    platform: "Custom",
    meetUrl: "https://meet.google.com/new",
    agenda: "Push PR-2026-101 CORS allow-origin header fix to production cluster",
    attendees: "Platform On-Call Engineer",
    notifyBeforeMins: 10,
  },
  // On-Call Maintenance Window
  {
    id: "oncall-neon-db",
    title: "Neon Postgres Connection Pool Upgrade",
    date: "2026-10-31",
    startTime: "23:00",
    durationMins: 45,
    endTime: "23:45",
    type: "oncall",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Zero-downtime connection pool resize and read-replica failover test",
    attendees: "Database Reliability Engineers",
    notifyBeforeMins: 30,
  },
  // CS2 Match Today
  {
    id: "cs2-match-daily",
    title: "CS2 Squad Match (Daily 5:10 PM)",
    date: "2026-10-31",
    startTime: "17:10",
    durationMins: 50,
    endTime: "18:00",
    type: "gaming",
    platform: "Custom",
    meetUrl: "https://meet.google.com/new",
    agenda: "De_Inferno & De_Mirage competitive squad match on Iran 128-tick private server",
    attendees: "Frontend Squad & Gaming Guild",
    notifyBeforeMins: 5,
    isRecurringDaily: true,
  },
  // November Events
  {
    id: "deploy-v2-5-rc",
    title: "v2.5.0 Release Candidate Cut",
    date: "2026-11-03",
    startTime: "14:00",
    durationMins: 45,
    endTime: "14:45",
    type: "deployment",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Tag v2.5.0-rc.1, freeze master branch, trigger automated E2E test suite in GitHub Actions",
    attendees: "Release Captains & QA",
    notifyBeforeMins: 15,
  },
  {
    id: "redis-failover-drill",
    title: "Redis Cluster Failover Simulation",
    date: "2026-11-04",
    startTime: "16:00",
    durationMins: 45,
    endTime: "16:45",
    type: "oncall",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Chaos engineering drill: Sentinel auto-promotion with live traffic simulation",
    attendees: "DevOps & Core Backend Squad",
    notifyBeforeMins: 15,
  },
  {
    id: "deploy-v2-5-prod",
    title: "Production Release v2.5.0 (Global Rollout)",
    date: "2026-11-05",
    startTime: "21:00",
    durationMins: 90,
    endTime: "22:30",
    type: "deployment",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Global rollout of v2.5.0 with full-screen calendar, API playground and audit feed",
    attendees: "All Hands On-Call & Leads",
    notifyBeforeMins: 30,
  },
  {
    id: "sprint-24-demo-retro",
    title: "Sprint 24 Demo & Retrospective",
    date: "2026-11-06",
    startTime: "15:00",
    durationMins: 60,
    endTime: "16:00",
    type: "sprint",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Present new Service Hub modules, celebrate sprint wins, review retros in Notion",
    attendees: "Engineering, Product & Design",
    notifyBeforeMins: 15,
  },
  {
    id: "sprint-25-kickoff",
    title: "Sprint 25 Sprint Kickoff",
    date: "2026-11-09",
    startTime: "09:30",
    durationMins: 60,
    endTime: "10:30",
    type: "sprint",
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Sprint 25 goal setting, capacity planning & task breakdown",
    attendees: "Entire Engineering Team",
    notifyBeforeMins: 10,
  },
]
