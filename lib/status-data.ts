/**
 * System Status, Health Observability & SLA Tracking Data Suite
 * Provides 30-day / 90-day uptime SLA calculations, incident timelines,
 * scheduled maintenance tracking, and bulk health probe metrics.
 */

export type IncidentSeverity = "critical" | "major" | "minor" | "maintenance"
export type IncidentStatus = "investigating" | "identified" | "monitoring" | "resolved"

export interface IncidentUpdate {
  id: string
  timestamp: string
  status: IncidentStatus
  message: string
  author: string
}

export interface SystemIncident {
  id: string
  title: string
  severity: IncidentSeverity
  status: IncidentStatus
  affectedServices: string[]
  environment: string
  startedAt: string
  resolvedAt?: string
  summary: string
  rootCause?: string
  updates: IncidentUpdate[]
}

export interface MaintenanceWindow {
  id: string
  title: string
  scheduledStart: string
  scheduledEnd: string
  status: "upcoming" | "in_progress" | "completed"
  affectedServices: string[]
  summary: string
  conductedBy: string
}

export interface DayUptimePoint {
  date: string // "YYYY-MM-DD"
  label: string // "Oct 28"
  uptimePercent: number // e.g. 100, 99.95, 98.4
  status: "operational" | "degraded" | "outage"
  incidentsCount: number
  avgLatencyMs: number
}

export interface ServiceSlaRecord {
  serviceId: string | number
  serviceName: string
  category: string
  environment: string
  tier: "Gateways" | "Core APIs" | "Databases & Messaging" | "DevOps & Tooling"
  uptime30Days: number // e.g. 99.98
  history30Days: DayUptimePoint[]
  currentLatencyMs: number
  currentStatus: "operational" | "degraded" | "offline" | "maintenance"
  lastCheckedAt: string
}

export interface SystemHealthSummary {
  overallStatus: "all_operational" | "partial_degradation" | "major_outage" | "maintenance"
  uptime30DaysAvg: number
  totalServicesCount: number
  operationalCount: number
  degradedCount: number
  maintenanceCount: number
  activeIncidentsCount: number
  lastUpdated: string
}

/**
 * Deterministic 30-day uptime generator to render 30 discrete daily status blocks.
 */
export function generate30DayUptimeHistory(
  serviceName: string,
  baseStatus: string = "operational"
): DayUptimePoint[] {
  const points: DayUptimePoint[] = []
  const today = new Date()

  // Generate simple hash from service name for consistent realistic patterns
  let hash = 0
  for (let i = 0; i < serviceName.length; i++) {
    hash = (hash << 5) - hash + serviceName.charCodeAt(i)
    hash |= 0
  }

  const isDegradedService =
    baseStatus === "degraded" ||
    serviceName.toLowerCase().includes("kibana") ||
    serviceName.toLowerCase().includes("redis")

  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)

    const dateStr = d.toISOString().split("T")[0]
    const label = d.toLocaleDateString("en-US", { month: "short", day: "numeric" })

    // Seed-based degradation on specific days for realistic status boards
    const daySeed = Math.abs(hash + i * 37) % 100

    let status: "operational" | "degraded" | "outage" = "operational"
    let uptime = 100
    let incidents = 0
    let latency = 25 + (daySeed % 40)

    if (isDegradedService && (i === 1 || i === 2)) {
      status = "degraded"
      uptime = 98.4
      incidents = 1
      latency = 185
    } else if (daySeed > 96 && !serviceName.includes("Gateway")) {
      status = "degraded"
      uptime = 99.2
      incidents = 1
      latency = 120
    }

    points.push({
      date: dateStr,
      label,
      uptimePercent: uptime,
      status,
      incidentsCount: incidents,
      avgLatencyMs: latency,
    })
  }

  return points
}

/**
 * Fixture Incidents for the engineering status timeline
 */
export const initialIncidents: SystemIncident[] = [
  {
    id: "INC-2026-104",
    title: "Intermittent CAP Messaging Queue Latency & Rebalancing",
    severity: "minor",
    status: "monitoring",
    affectedServices: ["CAP Event Bus", "Hangfire Scheduler", "Order Checkout API"],
    environment: "Production",
    startedAt: "2026-10-31T09:30:00Z",
    summary:
      "Engineers observed elevated queue consumer lag across partition #3 during cross-region rebalance. Workload failover to replica partition completed.",
    updates: [
      {
        id: "upd-104-3",
        timestamp: "2026-10-31T11:45:00Z",
        status: "monitoring",
        message:
          "Partition rebalancing completed successfully. Queue latency normalized to 14ms across all consumer nodes. Monitoring stability for 60 minutes.",
        author: "DevOps On-Call (Sara M.)",
      },
      {
        id: "upd-104-2",
        timestamp: "2026-10-31T10:15:00Z",
        status: "identified",
        message:
          "Identified root cause: transient network throttling on secondary Kafka broker. Traffic rerouted to primary cluster instances.",
        author: "Platform Engineering (Hassan R.)",
      },
      {
        id: "upd-104-1",
        timestamp: "2026-10-31T09:30:00Z",
        status: "investigating",
        message:
          "Automated telemetry alert triggered for message processing lag exceeding 450ms. On-call triage initiated.",
        author: "System Bot",
      },
    ],
  },
  {
    id: "INC-2026-101",
    title: "Kibana Log Aggregator Memory Contention & Rolling Restart",
    severity: "major",
    status: "resolved",
    affectedServices: ["Kibana Logger", "Elasticsearch Ingestion"],
    environment: "Develop & Staging",
    startedAt: "2026-10-27T14:10:00Z",
    resolvedAt: "2026-10-27T15:35:00Z",
    summary:
      "A burst in unindexed debug payloads from testing squads triggered heap memory starvation on node-02, causing UI timeouts in Kibana.",
    rootCause:
      "Elasticsearch log rotation policy encountered thread pool saturation due to verbose JSON trace logs submitted without sampling.",
    updates: [
      {
        id: "upd-101-3",
        timestamp: "2026-10-27T15:35:00Z",
        status: "resolved",
        message:
          "Heap allocated to 8GB, cluster rolling restart finalized, and dynamic log indexer rate-limiting enacted. All services operational.",
        author: "DevOps Squad Lead (Ali A.)",
      },
      {
        id: "upd-101-2",
        timestamp: "2026-10-27T14:40:00Z",
        status: "identified",
        message:
          "Memory leak isolated to unindexed query analyzer threads. Rolling restart initiated with increased heap boundaries.",
        author: "Platform Team",
      },
      {
        id: "upd-101-1",
        timestamp: "2026-10-27T14:10:00Z",
        status: "investigating",
        message:
          "Developers reported 504 Gateway Timeouts when querying developer log indexes.",
        author: "Support Desk",
      },
    ],
  },
]

/**
 * Scheduled Maintenance Windows
 */
export const upcomingMaintenanceWindows: MaintenanceWindow[] = [
  {
    id: "MAINT-2026-06",
    title: "PostgreSQL Production Read-Replica Security Patching",
    scheduledStart: "2026-11-03T01:30:00Z",
    scheduledEnd: "2026-11-03T02:30:00Z",
    status: "upcoming",
    affectedServices: ["Neon Postgres Read-Replica", "Analytics Warehouse"],
    summary:
      "Zero-downtime rolling OS kernel update and SSL certificate renewal on database cluster replicas. Primary write instance will remain 100% active.",
    conductedBy: "Cloud Infrastructure Team",
  },
  {
    id: "MAINT-2026-05",
    title: "Harbor Container Registry Storage Volume Migration",
    scheduledStart: "2026-11-08T22:00:00Z",
    scheduledEnd: "2026-11-08T23:00:00Z",
    status: "upcoming",
    affectedServices: ["Harbor Registry", "CI/CD Deployment Runners"],
    summary:
      "Expanding NVMe storage pool from 1TB to 4TB with zero downtime for existing images. Push operations may experience brief 30-second retries.",
    conductedBy: "DevOps Squad",
  },
]

/**
 * Calculate overall health metrics from a list of services
 */
export function calculateSystemHealthSummary(
  records: ServiceSlaRecord[],
  incidents: SystemIncident[]
): SystemHealthSummary {
  const total = records.length
  const degraded = records.filter((r) => r.currentStatus === "degraded").length
  const maintenance = records.filter((r) => r.currentStatus === "maintenance").length
  const offline = records.filter((r) => r.currentStatus === "offline").length
  const operational = total - degraded - maintenance - offline

  const activeIncidents = incidents.filter((i) => i.status !== "resolved").length

  let overallStatus: SystemHealthSummary["overallStatus"] = "all_operational"
  if (offline > 0 || incidents.some((i) => i.severity === "critical" && i.status !== "resolved")) {
    overallStatus = "major_outage"
  } else if (degraded > 0 || activeIncidents > 0) {
    overallStatus = "partial_degradation"
  } else if (maintenance > 0) {
    overallStatus = "maintenance"
  }

  // Calculate 30-day average
  const totalUptimeSum = records.reduce((acc, r) => acc + r.uptime30Days, 0)
  const uptime30DaysAvg = total > 0 ? Number((totalUptimeSum / total).toFixed(2)) : 99.98

  return {
    overallStatus,
    uptime30DaysAvg,
    totalServicesCount: total,
    operationalCount: operational,
    degradedCount: degraded,
    maintenanceCount: maintenance,
    activeIncidentsCount: activeIncidents,
    lastUpdated: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
  }
}

