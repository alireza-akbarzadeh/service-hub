/**
 * Enterprise Audit Trail & Team Activity Feed
 * Tracks real-time operations, service registrations, PR lifecycle events,
 * security/role modifications, and incident management logs.
 */

export type ActivityEventType =
  | "service_created"
  | "service_updated"
  | "service_deleted"
  | "request_submitted"
  | "request_status_changed"
  | "access_granted"
  | "incident_reported"
  | "incident_resolved"
  | "maintenance_scheduled"

export type ActivityCategory = "all" | "services" | "requests" | "security" | "incidents"

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  category: "services" | "requests" | "security" | "incidents"
  title: string
  description: string
  actor: {
    name: string
    avatar?: string
    role: string
    team: string
  }
  target: {
    type: "service" | "request" | "user" | "incident" | "maintenance"
    id: string | number
    name: string
    url?: string
  }
  metadata?: Record<string, any>
  timestamp: string // ISO string
}

export interface ActivityFilterOptions {
  category: ActivityCategory
  searchQuery: string
  actorTeam: string
  dateRange: "all" | "today" | "week" | "month"
}

export const initialActivityEvents: ActivityEvent[] = [
  {
    id: "act-101",
    type: "incident_reported",
    category: "incidents",
    title: "Incident Triage Initiated: CAP Event Bus Lag",
    description:
      "Automated telemetry alert detected 450ms lag on partition #3 during cross-region rebalance. Workload failover initiated.",
    actor: {
      name: "Sara Mohammadi",
      role: "DevOps On-Call Lead",
      team: "Platform Engineering",
    },
    target: {
      type: "incident",
      id: "INC-2026-104",
      name: "CAP Event Bus",
      url: "/status",
    },
    metadata: {
      severity: "minor",
      lagMs: 450,
      partition: 3,
    },
    timestamp: "2026-10-31T09:30:00Z",
  },
  {
    id: "act-102",
    type: "request_status_changed",
    category: "requests",
    title: "PR Approved & Merged: Swagger OpenTelemetry Exporter",
    description:
      "Approved PR-2026-101 adding W3C Distributed Trace headers and Prometheus scraping metrics to Commerce API Gateway.",
    actor: {
      name: "Alireza Akbarzadeh",
      role: "Tech Lead",
      team: "Frontend Squad",
    },
    target: {
      type: "request",
      id: "PR-2026-101",
      name: "Swagger OpenTelemetry Exporter",
      url: "/requests",
    },
    metadata: {
      commits: 4,
      filesChanged: 12,
      reviewers: ["Sara M.", "Hassan R."],
    },
    timestamp: "2026-10-31T08:15:00Z",
  },
  {
    id: "act-103",
    type: "service_created",
    category: "services",
    title: "Registered Microservice: AI Code Reviewer Assistant",
    description:
      "Deployed and registered new AI Code Reviewer microservice in Staging environment with Swagger OpenAPI 3.0 spec.",
    actor: {
      name: "Nima Rad",
      role: "AI Engineer",
      team: "Data & AI",
    },
    target: {
      type: "service",
      id: 67,
      name: "AI Code Reviewer Assistant",
      url: "https://ai-review.staging.internal",
    },
    metadata: {
      environment: "Staging",
      category: "AI & ML",
      port: 8443,
    },
    timestamp: "2026-10-30T16:40:00Z",
  },
  {
    id: "act-104",
    type: "access_granted",
    category: "security",
    title: "Elevated User Role: Amir Hosseini to Admin",
    description:
      "Promoted Amir Hosseini to Organization Administrator with full CRUD permissions on Production API Gateways and Service Catalogs.",
    actor: {
      name: "Platform Governance Bot",
      role: "Automated IAM",
      team: "Security Compliance",
    },
    target: {
      type: "user",
      id: "usr-404",
      name: "Amir Hosseini",
      url: "/users",
    },
    metadata: {
      previousRole: "Developer",
      newRole: "Admin",
      mfaVerified: true,
    },
    timestamp: "2026-10-30T14:20:00Z",
  },
  {
    id: "act-105",
    type: "maintenance_scheduled",
    category: "services",
    title: "Scheduled Maintenance: PostgreSQL Read-Replica Upgrade",
    description:
      "Scheduled rolling OS kernel update and SSL certificate renewal on production database read-replicas for Sunday 01:30 UTC.",
    actor: {
      name: "Hassan Rezaei",
      role: "Database Administrator",
      team: "Infrastructure",
    },
    target: {
      type: "maintenance",
      id: "MAINT-2026-06",
      name: "PostgreSQL Production Read-Replica",
      url: "/status",
    },
    metadata: {
      durationMins: 60,
      downtimeExpected: "Zero downtime (rolling)",
    },
    timestamp: "2026-10-29T11:00:00Z",
  },
  {
    id: "act-106",
    type: "service_updated",
    category: "services",
    title: "Updated SLA & Health Endpoint: Order Checkout API",
    description:
      "Upgraded health check probe frequency to 15s and added custom Prometheus SLA telemetry metrics endpoint /metrics.",
    actor: {
      name: "Sara Mohammadi",
      role: "Platform Engineer",
      team: "Platform Engineering",
    },
    target: {
      type: "service",
      id: 12,
      name: "Order Checkout API",
      url: "https://checkout.service.internal",
    },
    metadata: {
      oldSla: "99.9%",
      newSla: "99.99%",
    },
    timestamp: "2026-10-28T15:30:00Z",
  },
  {
    id: "act-107",
    type: "incident_resolved",
    category: "incidents",
    title: "Incident Resolved: Kibana Log Aggregator Memory Starvation",
    description:
      "Heap limits scaled to 8GB, cluster rolling restart finalized, and dynamic log indexer rate-limiting enacted.",
    actor: {
      name: "Alireza Akbarzadeh",
      role: "Tech Lead",
      team: "Frontend Squad",
    },
    target: {
      type: "incident",
      id: "INC-2026-101",
      name: "Kibana Logger",
      url: "/status",
    },
    metadata: {
      rootCause: "Unindexed debug payloads without sampling",
      recoveryTimeMins: 85,
    },
    timestamp: "2026-10-27T15:35:00Z",
  },
  {
    id: "act-108",
    type: "request_submitted",
    category: "requests",
    title: "New Feature Request: Dark Mode Support for Swagger UI",
    description:
      "Submitted request REQ-2026-109 asking for automated dark mode theme injection into all internal Swagger API documentation sheets.",
    actor: {
      name: "Mona Karimi",
      role: "Frontend Engineer",
      team: "Commerce Squad",
    },
    target: {
      type: "request",
      id: "REQ-2026-109",
      name: "Dark Mode Swagger Theme",
      url: "/requests",
    },
    metadata: {
      priority: "medium",
      upvotes: 14,
    },
    timestamp: "2026-10-26T09:10:00Z",
  },
]

/**
 * Filter activities by options
 */
export function filterActivityEvents(
  events: ActivityEvent[],
  filter: ActivityFilterOptions
): ActivityEvent[] {
  return events.filter((evt) => {
    // 1. Category
    if (filter.category !== "all" && evt.category !== filter.category) {
      return false
    }

    // 2. Team
    if (filter.actorTeam !== "all" && evt.actor.team !== filter.actorTeam) {
      return false
    }

    // 3. Search
    if (filter.searchQuery.trim().length > 0) {
      const q = filter.searchQuery.toLowerCase()
      const matchTitle = evt.title.toLowerCase().includes(q)
      const matchDesc = evt.description.toLowerCase().includes(q)
      const matchActor = evt.actor.name.toLowerCase().includes(q)
      const matchTarget = evt.target.name.toLowerCase().includes(q)
      if (!matchTitle && !matchDesc && !matchActor && !matchTarget) {
        return false
      }
    }

    return true
  })
}

/**
 * Export Activity Log to CSV
 */
export function exportActivityLogCsv(events: ActivityEvent[]): string {
  const headers = ["Event ID", "Timestamp", "Type", "Category", "Title", "Actor", "Team", "Target"]
  const rows = events.map((e) => [
    e.id,
    e.timestamp,
    e.type,
    e.category,
    `"${e.title.replace(/"/g, '""')}"`,
    `"${e.actor.name.replace(/"/g, '""')}"`,
    `"${e.actor.team.replace(/"/g, '""')}"`,
    `"${e.target.name.replace(/"/g, '""')}"`,
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}
