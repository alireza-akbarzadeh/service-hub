export interface FrontendMeeting {
  id: string
  title: string
  tehranTime: string // "HH:MM" in 24-hour format
  durationMins: number
  platform: "Google Meet" | "Zoom" | "Teams" | "Custom"
  meetUrl: string
  agenda: string
  attendees: string
  notifyBeforeMins: number
  isActive: boolean
  createdAt: string
}

export const INITIAL_MEETINGS: FrontendMeeting[] = [
  {
    id: "standup",
    title: "Daily Frontend Standup",
    tehranTime: "10:30",
    durationMins: 30,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "PR reviews, blockers, microservice integration & daily goals",
    attendees: "Frontend Squad & QA",
    notifyBeforeMins: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "arch-review",
    title: "Frontend Architecture & Code Review",
    tehranTime: "14:00",
    durationMins: 45,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Component refactoring, performance metrics & state management",
    attendees: "Tech Leads & Engineers",
    notifyBeforeMins: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "design-sync",
    title: "UI/UX Design System Sync",
    tehranTime: "16:15",
    durationMins: 30,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Figma tokens handoff, theme adjustments & responsive review",
    attendees: "Product Designers & Frontend",
    notifyBeforeMins: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]
