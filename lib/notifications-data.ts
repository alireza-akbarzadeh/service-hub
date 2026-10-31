export type NotificationCategory =
  | "incident"
  | "request"
  | "meeting"
  | "announcement"

export type NotificationSeverity = "info" | "warning" | "critical" | "success"

export interface AppNotification {
  id: string
  title: string
  description: string
  category: NotificationCategory
  severity: NotificationSeverity
  timestamp: string // relative or ISO
  read: boolean
  dismissed?: boolean
  actionUrl?: string
  actionLabel?: string
  serviceId?: number
  serviceName?: string
  requestId?: string
}

export const initialSystemNotifications: AppNotification[] = [
  {
    id: "notif-incident-1",
    title: "Vendor API Gateway Latency Spike",
    description:
      "Vendor API Gateway Swagger (Dev) latency spike (>1800ms) observed during automated ping diagnostics. Team investigating DB connection pooling.",
    category: "incident",
    severity: "warning",
    timestamp: "12m ago",
    read: false,
    serviceName: "Vendor API Gateway Swagger (Dev)",
    actionLabel: "Inspect Endpoint",
  },
  {
    id: "notif-pr-1",
    title: "PR-2026-101 Awaiting Code Review",
    description:
      "Farhad Karimi requested review on 'Fix CORS Preflight Missing Allowed-Headers on Vendor API Gateway'. Branch: fix/vendor-gateway-cors-preflight.",
    category: "request",
    severity: "info",
    timestamp: "45m ago",
    read: false,
    requestId: "PR-2026-101",
    actionUrl: "/requests",
    actionLabel: "Review Diff",
  },
  {
    id: "notif-meet-1",
    title: "Engineering Squad Daily Standup",
    description:
      "Cross-functional daily engineering sync begins in 15 minutes at 12:00 IRST (Asia/Tehran).",
    category: "meeting",
    severity: "info",
    timestamp: "1h ago",
    read: false,
    actionUrl: "https://meet.google.com/hsn-stnd-dev",
    actionLabel: "Join Google Meet",
  },
  {
    id: "notif-announce-1",
    title: "Scheduled DB Vacuum & Maintenance",
    description:
      "Core PostgreSQL cluster maintenance scheduled tonight between 02:00 - 02:15 IRST. Transient connection retries may be required.",
    category: "announcement",
    severity: "warning",
    timestamp: "3h ago",
    read: false,
    actionUrl: "/calendar",
    actionLabel: "View Schedule",
  },
  {
    id: "notif-req-2",
    title: "Feature Request Status Updated",
    description:
      "REQ-2026-102 (Webhook Replay & Failure Simulator) has been prioritized and moved to 'In Progress' for the next sprint.",
    category: "request",
    severity: "success",
    timestamp: "5h ago",
    read: true,
    requestId: "REQ-2026-102",
    actionUrl: "/requests",
    actionLabel: "View Kanban",
  },
  {
    id: "notif-announce-2",
    title: "Corporate Network & VPN Warning",
    description:
      "Connecting from a foreign ISP/IP? Ensure your internal OpenVPN or WireGuard profile is active to reach private Staging & Develop VPCs.",
    category: "announcement",
    severity: "info",
    timestamp: "1d ago",
    read: true,
  },
]

const READ_STORAGE_KEY = "service_hub_read_notifications_v1"
const DISMISSED_STORAGE_KEY = "service_hub_dismissed_notifications_v1"

export function getStoredReadIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredReadIds(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify(ids))
  } catch (err) {
    console.error("Failed to save read notification IDs:", err)
  }
}

export function getStoredDismissedIds(): string[] {
  if (typeof window === "undefined") return []
  try {
    const raw = localStorage.getItem(DISMISSED_STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveStoredDismissedIds(ids: string[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(DISMISSED_STORAGE_KEY, JSON.stringify(ids))
  } catch (err) {
    console.error("Failed to save dismissed notification IDs:", err)
  }
}

