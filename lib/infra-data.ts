/**
 * Infrastructure & Container Telemetry Suite
 * Provides live Kubernetes cluster observability, pod replica health,
 * container restart tracking, CPU/RAM utilization gauges, and container log streams.
 */

export type PodStatus = "Running" | "CrashLoopBackOff" | "Pending" | "Terminating" | "ContainerCreating"

export interface KubernetesCluster {
  id: string
  name: string
  environment: "Production" | "Staging" | "Develop"
  region: string
  version: string
  status: "healthy" | "degraded" | "maintenance"
  nodeCount: number
  totalCpuCores: number
  usedCpuCores: number
  totalMemoryGiB: number
  usedMemoryGiB: number
}

export interface PodTelemetry {
  id: string
  name: string
  serviceName: string
  namespace: string
  clusterId: string
  status: PodStatus
  readyReplicas: number
  totalReplicas: number
  restarts: number
  cpuUsageMilli: number // e.g. 145m
  cpuLimitMilli: number // e.g. 500m
  memoryUsageMiB: number // e.g. 340Mi
  memoryLimitMiB: number // e.g. 1024Mi
  age: string
  node: string
  ip: string
  image: string
  canaryVersion?: string
  logs: {
    timestamp: string
    level: "INFO" | "WARN" | "ERROR"
    message: string
  }[]
}

export interface InfraSummary {
  totalPods: number
  runningCount: number
  crashLoopCount: number
  pendingCount: number
  avgCpuPercent: number
  avgMemoryPercent: number
  totalRestarts: number
}

export const initialClusters: KubernetesCluster[] = [
  {
    id: "k8s-prod-01",
    name: "Production Cluster (DC-Tehran-01)",
    environment: "Production",
    region: "ir-tehran-1",
    version: "v1.31.2",
    status: "healthy",
    nodeCount: 12,
    totalCpuCores: 96,
    usedCpuCores: 58,
    totalMemoryGiB: 384,
    usedMemoryGiB: 246,
  },
  {
    id: "k8s-stage-01",
    name: "Staging Replica Cluster (DC-Tehran-02)",
    environment: "Staging",
    region: "ir-tehran-2",
    version: "v1.31.2",
    status: "healthy",
    nodeCount: 6,
    totalCpuCores: 48,
    usedCpuCores: 22,
    totalMemoryGiB: 192,
    usedMemoryGiB: 88,
  },
]

export const initialPods: PodTelemetry[] = [
  {
    id: "pod-commerce-gw-1",
    name: "commercegw-deploy-7b4a2e1-9kd2l",
    serviceName: "Commerce Gateway API",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "Running",
    readyReplicas: 3,
    totalReplicas: 3,
    restarts: 0,
    cpuUsageMilli: 185,
    cpuLimitMilli: 500,
    memoryUsageMiB: 380,
    memoryLimitMiB: 1024,
    age: "4d 12h",
    node: "node-worker-prod-04",
    ip: "10.244.4.18",
    image: "registry.hasti.co/gateway/commerce:v2.5.1",
    logs: [
      { timestamp: "10:45:12.104", level: "INFO", message: "HTTP listener active on 0.0.0.0:8080 (HTTPS termination via Envoy)" },
      { timestamp: "10:45:15.820", level: "INFO", message: "Redis token bucket rate limiter initialized [50,000 req/min]" },
      { timestamp: "10:48:30.400", level: "INFO", message: "JWT verification public key cache refreshed from sso-provider" },
      { timestamp: "10:52:00.120", level: "INFO", message: "Health check probe GET /healthz returned 200 OK (latency: 1.8ms)" },
    ],
  },
  {
    id: "pod-identity-sso-1",
    name: "sso-provider-deploy-8f1c990-4xt8m",
    serviceName: "Identity & SSO Provider",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "Running",
    readyReplicas: 2,
    totalReplicas: 2,
    restarts: 0,
    cpuUsageMilli: 120,
    cpuLimitMilli: 400,
    memoryUsageMiB: 290,
    memoryLimitMiB: 512,
    age: "12d 6h",
    node: "node-worker-prod-02",
    ip: "10.244.2.14",
    image: "registry.hasti.co/auth/sso-core:v3.2.0",
    logs: [
      { timestamp: "09:12:00.010", level: "INFO", message: "JWKS RSA256 private key loaded. Rotation interval: 90 days." },
      { timestamp: "09:30:14.230", level: "INFO", message: "OAuth2 Token issued for client_id='hasti-mobile-app'" },
      { timestamp: "10:14:02.890", level: "INFO", message: "Audit event: Admin role elevated for user id=1042" },
    ],
  },
  {
    id: "pod-order-proc-1",
    name: "order-processor-deploy-e4d3a12-7zp9q",
    serviceName: "Order Processing Service",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "Running",
    readyReplicas: 4,
    totalReplicas: 4,
    restarts: 1,
    cpuUsageMilli: 340,
    cpuLimitMilli: 1000,
    memoryUsageMiB: 680,
    memoryLimitMiB: 1536,
    age: "2d 18h",
    node: "node-worker-prod-05",
    ip: "10.244.5.22",
    image: "registry.hasti.co/commerce/order-worker:v1.9.4",
    logs: [
      { timestamp: "10:15:30.220", level: "INFO", message: "Postgres connection pool established (max: 40 connections)" },
      { timestamp: "10:22:18.450", level: "INFO", message: "Kafka consumer group 'order-events' rebalance complete" },
      { timestamp: "10:35:44.910", level: "WARN", message: "Slow query detected: SELECT * FROM orders WHERE tenant_id=... (duration: 312ms)" },
    ],
  },
  {
    id: "pod-notify-hub-1",
    name: "notification-hub-deploy-2c7e811-1mn4p",
    serviceName: "Notification Worker Hub",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "CrashLoopBackOff",
    readyReplicas: 0,
    totalReplicas: 2,
    restarts: 8,
    cpuUsageMilli: 490,
    cpuLimitMilli: 500,
    memoryUsageMiB: 1010,
    memoryLimitMiB: 1024,
    age: "3h 40m",
    node: "node-worker-prod-03",
    ip: "10.244.3.44",
    image: "registry.hasti.co/comms/notification-worker:v2.1.2",
    logs: [
      { timestamp: "10:50:00.120", level: "INFO", message: "Starting notification worker process PID=1" },
      { timestamp: "10:50:04.880", level: "WARN", message: "Redis Pub/Sub socket buffer threshold reached 95%" },
      { timestamp: "10:50:11.410", level: "ERROR", message: "FATAL: OutOfMemoryError: Container memory limit (1024Mi) exceeded." },
      { timestamp: "10:50:12.000", level: "ERROR", message: "Kernel OOMKiller terminated process 1 (signal 9 SIGKILL)" },
    ],
  },
  {
    id: "pod-product-search-1",
    name: "product-search-deploy-9a01f44-8bc3w",
    serviceName: "Product Catalog Search API",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "Running",
    readyReplicas: 3,
    totalReplicas: 3,
    restarts: 0,
    cpuUsageMilli: 210,
    cpuLimitMilli: 800,
    memoryUsageMiB: 540,
    memoryLimitMiB: 1024,
    age: "6d 4h",
    node: "node-worker-prod-01",
    ip: "10.244.1.33",
    image: "registry.hasti.co/catalog/search-api:v4.0.1",
    logs: [
      { timestamp: "08:00:10.010", level: "INFO", message: "Connected to Elasticsearch cluster at https://es-prod.gig.services:9200" },
      { timestamp: "08:15:30.400", level: "INFO", message: "Persian text analysis dictionary loaded: 142,000 root stems" },
      { timestamp: "09:40:02.120", level: "INFO", message: "P95 search latency: 14ms across 1,840 queries" },
    ],
  },
  {
    id: "pod-admin-portal-1",
    name: "admin-web-deploy-1b8c2d5-3va2z",
    serviceName: "Admin Web Portal",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "Running",
    readyReplicas: 2,
    totalReplicas: 2,
    restarts: 0,
    cpuUsageMilli: 65,
    cpuLimitMilli: 300,
    memoryUsageMiB: 180,
    memoryLimitMiB: 512,
    age: "1d 20h",
    node: "node-worker-prod-06",
    ip: "10.244.6.12",
    image: "registry.hasti.co/portals/admin-web:v2.8.0",
    logs: [
      { timestamp: "10:00:00.120", level: "INFO", message: "Next.js Node server listening on port 3000" },
      { timestamp: "10:15:00.800", level: "INFO", message: "CDN Cache warmup completed for 48 static chunks" },
    ],
  },
  {
    id: "pod-payment-gw-1",
    name: "payment-gw-deploy-5d2b1f8-2kr5y",
    serviceName: "Payment Gateway Connector",
    namespace: "production",
    clusterId: "k8s-prod-01",
    status: "Running",
    readyReplicas: 2,
    totalReplicas: 2,
    restarts: 0,
    cpuUsageMilli: 90,
    cpuLimitMilli: 400,
    memoryUsageMiB: 240,
    memoryLimitMiB: 512,
    age: "5d 8h",
    node: "node-worker-prod-02",
    ip: "10.244.2.89",
    image: "registry.hasti.co/banking/ipg-connector:v1.4.2",
    logs: [
      { timestamp: "10:30:12.300", level: "INFO", message: "mTLS mutual authentication established with Shaparak Central IPG" },
      { timestamp: "10:45:00.100", level: "INFO", message: "Settlement cycle transaction batch verified: 310 orders" },
    ],
  },
  {
    id: "pod-stage-commerce-1",
    name: "stage-commerce-deploy-6cf1b2a-8wt4q",
    serviceName: "Commerce Gateway API",
    namespace: "staging",
    clusterId: "k8s-stage-01",
    status: "Running",
    readyReplicas: 1,
    totalReplicas: 1,
    restarts: 0,
    cpuUsageMilli: 75,
    cpuLimitMilli: 400,
    memoryUsageMiB: 210,
    memoryLimitMiB: 512,
    age: "18h 30m",
    node: "node-stage-worker-01",
    ip: "10.244.10.12",
    image: "registry.hasti.co/gateway/commerce:v2.5.2-canary",
    canaryVersion: "v2.5.2-canary (10% traffic)",
    logs: [
      { timestamp: "11:00:00.010", level: "INFO", message: "Staging Canary v2.5.2 deployed. Traffic split: 10% canary, 90% stable." },
      { timestamp: "11:05:14.220", level: "INFO", message: "Synthetic end-to-end integration test passed 48/48 suites." },
    ],
  },
]

/**
 * Calculates cluster telemetry summary across active pods.
 */
export function calculateInfraSummary(pods: PodTelemetry[] = initialPods): InfraSummary {
  const totalPods = pods.length || 1
  const runningCount = pods.filter((p) => p.status === "Running").length
  const crashLoopCount = pods.filter((p) => p.status === "CrashLoopBackOff").length
  const pendingCount = pods.filter((p) => p.status === "Pending" || p.status === "ContainerCreating").length
  const totalRestarts = pods.reduce((sum, p) => sum + p.restarts, 0)

  let totalCpuPct = 0
  let totalMemPct = 0

  pods.forEach((p) => {
    const cpuPct = Math.round((p.cpuUsageMilli / p.cpuLimitMilli) * 100)
    const memPct = Math.round((p.memoryUsageMiB / p.memoryLimitMiB) * 100)
    totalCpuPct += cpuPct
    totalMemPct += memPct
  })

  return {
    totalPods,
    runningCount,
    crashLoopCount,
    pendingCount,
    avgCpuPercent: Math.round(totalCpuPct / totalPods),
    avgMemoryPercent: Math.round(totalMemPct / totalPods),
    totalRestarts,
  }
}

/**
 * Generates RFC 4180 CSV export string for cluster pods and container metrics.
 */
export function exportInfraPodsToCsv(pods: PodTelemetry[]): string {
  const headers = [
    "Pod ID",
    "Pod Name",
    "Service Name",
    "Namespace",
    "Cluster ID",
    "Status",
    "Ready Replicas",
    "Restarts",
    "CPU Usage (m)",
    "CPU Limit (m)",
    "Memory Usage (MiB)",
    "Memory Limit (MiB)",
    "Node",
    "IP Address",
    "Age",
  ]

  const rows = pods.map((p) => [
    p.id,
    `"${p.name.replace(/"/g, '""')}"`,
    `"${p.serviceName.replace(/"/g, '""')}"`,
    p.namespace,
    p.clusterId,
    p.status,
    `${p.readyReplicas}/${p.totalReplicas}`,
    p.restarts,
    p.cpuUsageMilli,
    p.cpuLimitMilli,
    p.memoryUsageMiB,
    p.memoryLimitMiB,
    p.node,
    p.ip,
    p.age,
  ])

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n")
}
