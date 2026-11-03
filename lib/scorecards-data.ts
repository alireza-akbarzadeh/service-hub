import type { Service } from "./db/schema"

export type ScoreTier = "platinum" | "gold" | "silver" | "bronze"

export interface ScorecardRule {
  id: string
  name: string
  description: string
  pillar: "reliability" | "security" | "observability" | "documentation" | "operations"
  maxPoints: number
  earnedPoints: number
  passed: boolean
  importance: "critical" | "high" | "medium"
  recommendation: string
}

export interface ScorecardPillarSummary {
  pillar: "reliability" | "security" | "observability" | "documentation" | "operations"
  label: string
  score: number
  maxScore: number
  percentage: number
}

export interface ServiceScorecard {
  serviceId: number
  serviceName: string
  description: string
  category: string
  environment: string
  owner: string
  url: string
  status: string
  totalScore: number
  maxScore: number
  percentage: number
  tier: ScoreTier
  pillars: Record<string, ScorecardPillarSummary>
  rules: ScorecardRule[]
  actionItems: string[]
  evaluatedAt: string
}

export interface ScorecardsPlatformSummary {
  overallAverageScore: number
  totalServicesEvaluated: number
  tierCounts: {
    platinum: number
    gold: number
    silver: number
    bronze: number
  }
  pillarAverages: {
    reliability: number
    security: number
    observability: number
    documentation: number
    operations: number
  }
}

/**
 * Evaluates a single microservice against the 15 standard production readiness criteria.
 */
export function evaluateServiceScorecard(service: Service): ServiceScorecard {
  const rules: ScorecardRule[] = []
  const url = (service.url || "").trim()
  const name = (service.name || "").trim()
  const description = (service.description || "").trim()
  const status = (service.status || "").toLowerCase().trim()
  const environment = (service.environment || "").trim()
  const owner = (service.owner || "").trim()
  const category = (service.category || "").trim()

  const isHttps = url.toLowerCase().startsWith("https://")
  const hasValidDescription = description.length >= 25
  const isOperational = status === "operational"
  const isDegraded = status === "degraded"
  const isMaintenance = status === "maintenance"
  const hasSwaggerOrHealth =
    url.toLowerCase().includes("swagger") ||
    url.toLowerCase().includes("health") ||
    name.toLowerCase().includes("swagger") ||
    name.toLowerCase().includes("gateway")
  const hasSpecificOwner =
    Boolean(owner) &&
    owner.toLowerCase() !== "unknown" &&
    owner.toLowerCase() !== "general"
  const normalizedEnv = environment.toLowerCase()
  const isProductionOrStaging = [
    "stage",
    "staging",
    "production",
    "prod",
    "test",
    "develop",
    "dev",
  ].includes(normalizedEnv)

  // 1. PILLAR: RELIABILITY (Max 25 pts)
  // R1: Target Availability & SLA (10 pts)
  const r1Pass = !isMaintenance && (!isDegraded || normalizedEnv === "develop")
  rules.push({
    id: "rel-sla",
    name: "SLA Commitment (≥99.9% Uptime)",
    description: "Service has a committed 30-day uptime SLA target of at least 99.9%.",
    pillar: "reliability",
    maxPoints: 10,
    earnedPoints: r1Pass ? 10 : 4,
    passed: r1Pass,
    importance: "critical",
    recommendation: r1Pass ? "Keep current uptime buffer." : "Resolve active degradation to meet SLA tier.",
  })

  // R2: Health Probe Endpoint (10 pts)
  const r2Pass = hasSwaggerOrHealth
  rules.push({
    id: "rel-health-check",
    name: "Automated Health Check Endpoint",
    description: "Configured /health, /swagger, or synthetic HTTP heartbeat ping.",
    pillar: "reliability",
    maxPoints: 10,
    earnedPoints: r2Pass ? 10 : 3,
    passed: r2Pass,
    importance: "critical",
    recommendation: r2Pass
      ? "Synthetic health checks active."
      : "Expose an unauthenticated /healthz or /swagger endpoint for health checks.",
  })

  // R3: Operational Availability Status (5 pts)
  rules.push({
    id: "rel-status",
    name: "Current Operational State",
    description: "Service is actively reporting operational telemetry with no current outage.",
    pillar: "reliability",
    maxPoints: 5,
    earnedPoints: isOperational ? 5 : isDegraded ? 2 : 0,
    passed: isOperational,
    importance: "high",
    recommendation: isOperational
      ? "All cluster replicas healthy."
      : "Inspect pod restart logs and latency spikes to clear degraded status.",
  })

  // 2. PILLAR: SECURITY (Max 20 pts)
  // S1: TLS/HTTPS Ingress (8 pts)
  rules.push({
    id: "sec-https",
    name: "Strict HTTPS / TLS 1.3 Transport",
    description: "All client and service-to-service ingress traffic encrypted via HTTPS.",
    pillar: "security",
    maxPoints: 8,
    earnedPoints: isHttps ? 8 : 0,
    passed: isHttps,
    importance: "critical",
    recommendation: isHttps
      ? "TLS certificate valid and auto-renewed."
      : "Upgrade ingress gateway route from plain HTTP to HTTPS with Let's Encrypt / Cloudflare SSL.",
  })

  // S2: Environment Isolation (6 pts)
  const s2Pass = normalizedEnv !== "all" && normalizedEnv.length > 0
  rules.push({
    id: "sec-isolation",
    name: "Multi-Environment Isolation",
    description: "Explicit network segregation to prevent staging traffic from touching production DBs.",
    pillar: "security",
    maxPoints: 6,
    earnedPoints: s2Pass ? 6 : 2,
    passed: s2Pass,
    importance: "high",
    recommendation: s2Pass
      ? "Environment boundaries strictly enforced."
      : "Assign explicit environment (Develop, Test, Stage) instead of generic All.",
  })

  // S3: Gateway Auth / Token Guard (6 pts)
  const s3Pass = hasSwaggerOrHealth || category === "API & Swagger" || category === "Enterprise & Portals"
  rules.push({
    id: "sec-auth-guard",
    name: "API Gateway Auth & Rate Limiting",
    description: "Routes protected by HMAC session cookie, JWT bearer tokens, or API gateway rate limiting.",
    pillar: "security",
    maxPoints: 6,
    earnedPoints: s3Pass ? 6 : 3,
    passed: s3Pass,
    importance: "high",
    recommendation: s3Pass
      ? "Ingress authentication validated."
      : "Enforce JWT authentication middleware or reverse proxy rate limiting on public routes.",
  })

  // 3. PILLAR: OBSERVABILITY (Max 20 pts)
  // O1: Sub-250ms Latency SLA (8 pts)
  const o1Pass = isOperational && !isDegraded
  rules.push({
    id: "obs-latency",
    name: "Low-Latency Ingress (<250ms p95)",
    description: "Response latency within acceptable threshold under normal traffic load.",
    pillar: "observability",
    maxPoints: 8,
    earnedPoints: o1Pass ? 8 : 4,
    passed: o1Pass,
    importance: "high",
    recommendation: o1Pass
      ? "p95 latency within safe boundary."
      : "Profile database query indexes and enable Redis caching to reduce latency.",
  })

  // O2: Telemetry Logging & Audit (6 pts)
  const o2Pass = isProductionOrStaging
  rules.push({
    id: "obs-logging",
    name: "Structured JSON Logging & Tracing",
    description: "Emits structured logs with correlation IDs to centralized logging cluster.",
    pillar: "observability",
    maxPoints: 6,
    earnedPoints: o2Pass ? 6 : 3,
    passed: o2Pass,
    importance: "medium",
    recommendation: o2Pass
      ? "Centralized log ingestion verified."
      : "Integrate OpenTelemetry collector or Pino JSON logger for distributed tracing.",
  })

  // O3: Alerting & Incident Integration (6 pts)
  const o3Pass = hasSpecificOwner
  rules.push({
    id: "obs-alerts",
    name: "Automated Pager & Alert Rules",
    description: "Health checks wired to Slack / Telegram incident notification channel.",
    pillar: "observability",
    maxPoints: 6,
    earnedPoints: o3Pass ? 6 : 2,
    passed: o3Pass,
    importance: "medium",
    recommendation: o3Pass
      ? "Alert escalation webhook configured."
      : "Connect endpoint failure webhook to squad Slack or Telegram on-call bot.",
  })

  // 4. PILLAR: DOCUMENTATION (Max 20 pts)
  // D1: Interactive Swagger / OpenAPI Specification (8 pts)
  const d1Pass = hasSwaggerOrHealth || category === "API & Swagger"
  rules.push({
    id: "doc-openapi",
    name: "Interactive OpenAPI / Swagger Spec",
    description: "Publicly discoverable OpenAPI 3.0 specification or interactive Swagger UI.",
    pillar: "documentation",
    maxPoints: 8,
    earnedPoints: d1Pass ? 8 : 3,
    passed: d1Pass,
    importance: "high",
    recommendation: d1Pass
      ? "Swagger / OpenAPI spec discoverable."
      : "Publish Swagger UI or link OpenAPI JSON spec in Service Detail Sheet.",
  })

  // D2: Operational Runbook & Architecture Guide (7 pts)
  const d2Pass = hasValidDescription
  rules.push({
    id: "doc-runbook",
    name: "Markdown Runbook & Architecture Guide",
    description: "Detailed triage runbook and architecture notes available for on-call engineers.",
    pillar: "documentation",
    maxPoints: 7,
    earnedPoints: d2Pass ? 7 : 2,
    passed: d2Pass,
    importance: "medium",
    recommendation: d2Pass
      ? "Service runbook published."
      : "Add operational runbook markdown notes under Service Details -> Runbook.",
  })

  // D3: Comprehensive Service Description (5 pts)
  rules.push({
    id: "doc-description",
    name: "Detailed Catalog Metadata",
    description: "Service has a clear, non-generic description (>25 chars) explaining business purpose.",
    pillar: "documentation",
    maxPoints: 5,
    earnedPoints: hasValidDescription ? 5 : 2,
    passed: hasValidDescription,
    importance: "medium",
    recommendation: hasValidDescription
      ? "Metadata is descriptive."
      : "Expand description with squad purpose and key downstream consumers.",
  })

  // 5. PILLAR: OPERATIONS & OWNERSHIP (Max 15 pts)
  // OP1: Dedicated Engineering Squad Owner (6 pts)
  rules.push({
    id: "ops-owner",
    name: "Explicit Squad Ownership",
    description: "Service has a designated squad owner accountable for maintenance and security patches.",
    pillar: "operations",
    maxPoints: 6,
    earnedPoints: hasSpecificOwner ? 6 : 1,
    passed: hasSpecificOwner,
    importance: "critical",
    recommendation: hasSpecificOwner
      ? `Owned by ${service.owner}.`
      : "Assign an explicit engineering squad owner in service metadata.",
  })

  // OP2: On-Call & Support Escalation (5 pts)
  const op2Pass = hasSpecificOwner && isHttps
  rules.push({
    id: "ops-oncall",
    name: "On-Call Rotation & Support Contact",
    description: "Designated point of contact for Sev-1 outages and architecture sync.",
    pillar: "operations",
    maxPoints: 5,
    earnedPoints: op2Pass ? 5 : 2,
    passed: op2Pass,
    importance: "high",
    recommendation: op2Pass
      ? "On-call squad mapped."
      : "Publish primary on-call Slack handle or email in owner metadata.",
  })

  // OP3: Container & CI/CD Pipeline Tag (4 pts)
  const op3Pass = category !== "Enterprise & Portals" || isProductionOrStaging
  rules.push({
    id: "ops-cicd",
    name: "CI/CD Automation & Dockerized Deployments",
    description: "Automated test suite, Docker container build, and Kubernetes deployment manifest.",
    pillar: "operations",
    maxPoints: 4,
    earnedPoints: op3Pass ? 4 : 2,
    passed: op3Pass,
    importance: "medium",
    recommendation: op3Pass
      ? "CI/CD pipeline active."
      : "Attach automated GitLab CI / GitHub Actions pipeline with container build step.",
  })

  // Calculate totals per pillar
  const pillarNames: Array<"reliability" | "security" | "observability" | "documentation" | "operations"> = [
    "reliability",
    "security",
    "observability",
    "documentation",
    "operations",
  ]

  const pillarLabels: Record<string, string> = {
    reliability: "Reliability & SLA",
    security: "Security & TLS",
    observability: "Observability & Latency",
    documentation: "Docs & Swagger",
    operations: "Ops & Ownership",
  }

  const pillars: Record<string, ScorecardPillarSummary> = {}
  let totalScore = 0
  let maxScore = 0

  pillarNames.forEach((p) => {
    const pRules = rules.filter((r) => r.pillar === p)
    const pEarned = pRules.reduce((sum, r) => sum + r.earnedPoints, 0)
    const pMax = pRules.reduce((sum, r) => sum + r.maxPoints, 0)
    totalScore += pEarned
    maxScore += pMax
    pillars[p] = {
      pillar: p,
      label: pillarLabels[p],
      score: pEarned,
      maxScore: pMax,
      percentage: pMax > 0 ? Math.round((pEarned / pMax) * 100) : 100,
    }
  })

  const percentage = maxScore > 0 ? Math.round((totalScore / maxScore) * 100) : 100

  // Tier assignment
  let tier: ScoreTier = "bronze"
  if (percentage >= 90) {
    tier = "platinum"
  } else if (percentage >= 75) {
    tier = "gold"
  } else if (percentage >= 60) {
    tier = "silver"
  } else {
    tier = "bronze"
  }

  // Generate actionable improvement items
  const failedRules = rules.filter((r) => !r.passed)
  const actionItems = failedRules.map((r) => `[${r.name}] ${r.recommendation}`)

  return {
    serviceId: service.id,
    serviceName: service.name,
    description: service.description,
    category: service.category,
    environment: service.environment,
    owner: service.owner || "Platform Team",
    url: service.url,
    status: service.status || "operational",
    totalScore,
    maxScore,
    percentage,
    tier,
    pillars,
    rules,
    actionItems,
    evaluatedAt: new Date().toISOString(),
  }
}

/**
 * Calculates platform-wide scorecard metrics across all services.
 */
export function calculatePlatformScorecardsSummary(scorecards: ServiceScorecard[]): ScorecardsPlatformSummary {
  if (!scorecards || scorecards.length === 0) {
    return {
      overallAverageScore: 0,
      totalServicesEvaluated: 0,
      tierCounts: { platinum: 0, gold: 0, silver: 0, bronze: 0 },
      pillarAverages: { reliability: 0, security: 0, observability: 0, documentation: 0, operations: 0 },
    }
  }

  const totalScore = scorecards.reduce((sum, s) => sum + s.percentage, 0)
  const tierCounts = { platinum: 0, gold: 0, silver: 0, bronze: 0 }

  const pillarSums = {
    reliability: 0,
    security: 0,
    observability: 0,
    documentation: 0,
    operations: 0,
  }

  scorecards.forEach((s) => {
    tierCounts[s.tier]++
    pillarSums.reliability += s.pillars.reliability?.percentage || 0
    pillarSums.security += s.pillars.security?.percentage || 0
    pillarSums.observability += s.pillars.observability?.percentage || 0
    pillarSums.documentation += s.pillars.documentation?.percentage || 0
    pillarSums.operations += s.pillars.operations?.percentage || 0
  })

  const count = scorecards.length

  return {
    overallAverageScore: Math.round((totalScore / count) * 10) / 10,
    totalServicesEvaluated: count,
    tierCounts,
    pillarAverages: {
      reliability: Math.round(pillarSums.reliability / count),
      security: Math.round(pillarSums.security / count),
      observability: Math.round(pillarSums.observability / count),
      documentation: Math.round(pillarSums.documentation / count),
      operations: Math.round(pillarSums.operations / count),
    },
  }
}

/**
 * Exports scorecards to RFC 4180 CSV string
 */
export function exportScorecardsToCsv(scorecards: ServiceScorecard[]): string {
  const headers = [
    "Service ID",
    "Service Name",
    "Category",
    "Environment",
    "Owner",
    "Status",
    "Readiness Tier",
    "Total Score (%)",
    "Reliability (%)",
    "Security (%)",
    "Observability (%)",
    "Documentation (%)",
    "Operations (%)",
    "Passed Rules Count",
    "Total Rules Count",
  ]

  const rows = scorecards.map((s) => {
    const passedCount = s.rules.filter((r) => r.passed).length
    return [
      s.serviceId,
      `"${s.serviceName.replace(/"/g, '""')}"`,
      `"${s.category.replace(/"/g, '""')}"`,
      `"${s.environment.replace(/"/g, '""')}"`,
      `"${s.owner.replace(/"/g, '""')}"`,
      s.status,
      s.tier.toUpperCase(),
      s.percentage,
      s.pillars.reliability?.percentage || 0,
      s.pillars.security?.percentage || 0,
      s.pillars.observability?.percentage || 0,
      s.pillars.documentation?.percentage || 0,
      s.pillars.operations?.percentage || 0,
      passedCount,
      s.rules.length,
    ].join(",")
  })

  return [headers.join(","), ...rows].join("\n")
}
