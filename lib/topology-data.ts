import type { Service } from "./db/schema"

export type TopologyTier =
  | "client"
  | "gateway"
  | "core-api"
  | "worker"
  | "database"
  | "telemetry"

export interface TopologyNode {
  id: string
  name: string
  category: string
  environment: string
  status: "operational" | "degraded" | "maintenance" | "offline"
  tier: TopologyTier
  latencyMs?: number
  serviceId?: number
  url?: string
  description?: string
  owner?: string
  x: number
  y: number
}

export interface TopologyEdge {
  id: string
  source: string
  target: string
  protocol: "HTTP/REST" | "gRPC" | "WebSocket" | "TCP/DB" | "Kafka/AMQP"
  label?: string
  animated?: boolean
}

/**
 * Standard microservice dependency ecosystem definition
 */
export const baseTopologyNodes: TopologyNode[] = [
  // --- TIER 1: CLIENT WEB APPS (x: 100) ---
  {
    id: "commerce-web",
    name: "Commerce Web",
    category: "Web Apps",
    environment: "Develop",
    status: "operational",
    tier: "client",
    latencyMs: 145,
    url: "https://commerce-develop.hasti.co/",
    description: "Customer-facing storefront web portal built with Next.js and Tailwind.",
    owner: "Commerce Team",
    x: 100,
    y: 120,
  },
  {
    id: "admin-portal",
    name: "Admin Portal",
    category: "Web Apps",
    environment: "Develop",
    status: "operational",
    tier: "client",
    latencyMs: 110,
    url: "https://admin-develop.hasti.co/",
    description: "Back-office operations dashboard for operations and customer support.",
    owner: "Admin Core Team",
    x: 100,
    y: 280,
  },
  {
    id: "vendor-portal",
    name: "Vendor Portal",
    category: "Web Apps",
    environment: "Develop",
    status: "operational",
    tier: "client",
    latencyMs: 190,
    url: "https://vendor-develop.hasti.co/",
    description: "Merchant administration panel for inventory, pricing, and settlements.",
    owner: "Merchant Squad",
    x: 100,
    y: 440,
  },

  // --- TIER 2: API GATEWAYS & INGRESS (x: 360) ---
  {
    id: "admin-gateway",
    name: "Admin API Gateway",
    category: "API & Swagger",
    environment: "Develop",
    status: "operational",
    tier: "gateway",
    latencyMs: 85,
    url: "https://admin-develop.hasti.co/swagger/index.html",
    description: "Central reverse proxy, rate limiter, and JWT authentication gateway.",
    owner: "Core Platform",
    x: 360,
    y: 200,
  },
  {
    id: "vendor-gateway",
    name: "Vendor API Gateway",
    category: "API & Swagger",
    environment: "Develop",
    status: "degraded",
    tier: "gateway",
    latencyMs: 1820,
    url: "https://vendor-develop.hasti.co/swagger/index.html",
    description: "Public merchant gateway handling catalog ingest and order state transitions.",
    owner: "Merchant Squad",
    x: 360,
    y: 380,
  },

  // --- TIER 3: CORE DOMAIN SERVICES (x: 620) ---
  {
    id: "auth-service",
    name: "Identity & Auth Service",
    category: "API & Swagger",
    environment: "Develop",
    status: "operational",
    tier: "core-api",
    latencyMs: 65,
    url: "https://auth-develop.hasti.co/",
    description: "OAuth2 / OIDC token authority, RBAC policies, and user profiles.",
    owner: "Security Squad",
    x: 620,
    y: 100,
  },
  {
    id: "order-service",
    name: "Order & Checkout API",
    category: "API & Swagger",
    environment: "Develop",
    status: "operational",
    tier: "core-api",
    latencyMs: 120,
    url: "https://orders-develop.hasti.co/",
    description: "Order management, cart validation, invoice generation and payment webhooks.",
    owner: "Checkout Team",
    x: 620,
    y: 240,
  },
  {
    id: "product-service",
    name: "Product Catalog API",
    category: "API & Swagger",
    environment: "Develop",
    status: "operational",
    tier: "core-api",
    latencyMs: 95,
    url: "https://catalog-develop.hasti.co/",
    description: "SKU listings, inventory sync, pricing rules, and elasticsearch indexing.",
    owner: "Catalog Squad",
    x: 620,
    y: 380,
  },
  {
    id: "notification-service",
    name: "Notification Worker",
    category: "Background Jobs",
    environment: "Develop",
    status: "operational",
    tier: "worker",
    latencyMs: 55,
    url: "https://notify-develop.hasti.co/",
    description: "Async SMS dispatch, OTP delivery, customer transactional email, and web push.",
    owner: "Comms Squad",
    x: 620,
    y: 510,
  },

  // --- TIER 4: PERSISTENCE, BROKERS & CACHE (x: 880) ---
  {
    id: "neon-postgres",
    name: "Neon PostgreSQL Cluster",
    category: "Config & Data",
    environment: "Develop",
    status: "operational",
    tier: "database",
    latencyMs: 42,
    url: "https://console.neon.tech/",
    description: "Serverless Postgres primary cluster with read replicas and branch snapshots.",
    owner: "DBA / DevOps",
    x: 880,
    y: 160,
  },
  {
    id: "redis-cache",
    name: "Redis Cluster (Cache)",
    category: "Config & Data",
    environment: "Develop",
    status: "operational",
    tier: "database",
    latencyMs: 12,
    url: "https://redis-dev.hasti.co/",
    description: "In-memory session store, distributed locks, rate-limit counters, and cart cache.",
    owner: "Infrastructure",
    x: 880,
    y: 300,
  },
  {
    id: "kafka-broker",
    name: "Kafka Event Broker",
    category: "Messaging",
    environment: "Develop",
    status: "operational",
    tier: "worker",
    latencyMs: 25,
    url: "https://kafka-dev.hasti.co/",
    description: "Distributed commit log for domain events (order.placed, payment.settled, inventory.adjusted).",
    owner: "Data Platform",
    x: 880,
    y: 440,
  },

  // --- TIER 5: OBSERVABILITY & TELEMETRY (x: 880) ---
  {
    id: "opentelemetry",
    name: "OpenTelemetry & Prometheus",
    category: "Observability",
    environment: "DevOps & Tools",
    status: "operational",
    tier: "telemetry",
    latencyMs: 38,
    url: "https://telemetry-dev.hasti.co/",
    description: "Central distributed tracing collector, health logs, and Prometheus scrape target.",
    owner: "SRE Squad",
    x: 880,
    y: 560,
  },
]

export const baseTopologyEdges: TopologyEdge[] = [
  // Frontends -> Gateways & Auth
  { id: "e1", source: "commerce-web", target: "admin-gateway", protocol: "HTTP/REST", label: "/api/storefront" },
  { id: "e2", source: "admin-portal", target: "admin-gateway", protocol: "HTTP/REST", label: "/api/admin" },
  { id: "e3", source: "vendor-portal", target: "vendor-gateway", protocol: "HTTP/REST", label: "/api/vendor" },
  { id: "e4", source: "commerce-web", target: "auth-service", protocol: "HTTP/REST", label: "OIDC Login" },
  { id: "e5", source: "admin-portal", target: "auth-service", protocol: "HTTP/REST", label: "SSO / MFA" },

  // Gateways -> Domain Microservices
  { id: "e6", source: "admin-gateway", target: "auth-service", protocol: "gRPC", label: "Token Verify" },
  { id: "e7", source: "admin-gateway", target: "order-service", protocol: "gRPC", label: "Checkout" },
  { id: "e8", source: "admin-gateway", target: "product-service", protocol: "HTTP/REST", label: "Inventory" },
  { id: "e9", source: "vendor-gateway", target: "product-service", protocol: "HTTP/REST", label: "Catalog Sync" },
  { id: "e10", source: "vendor-gateway", target: "order-service", protocol: "gRPC", label: "Fulfillment" },

  // Domain Microservices -> Databases & Brokers
  { id: "e11", source: "auth-service", target: "neon-postgres", protocol: "TCP/DB", label: "Users DB" },
  { id: "e12", source: "auth-service", target: "redis-cache", protocol: "TCP/DB", label: "JWT Revoke" },
  { id: "e13", source: "order-service", target: "neon-postgres", protocol: "TCP/DB", label: "Orders DB" },
  { id: "e14", source: "order-service", target: "redis-cache", protocol: "TCP/DB", label: "Idempotency" },
  { id: "e15", source: "order-service", target: "kafka-broker", protocol: "Kafka/AMQP", label: "OrderPlaced" },
  { id: "e16", source: "product-service", target: "neon-postgres", protocol: "TCP/DB", label: "Catalog DB" },
  { id: "e17", source: "product-service", target: "redis-cache", protocol: "TCP/DB", label: "SKU Cache" },
  { id: "e18", source: "kafka-broker", target: "notification-service", protocol: "Kafka/AMQP", label: "SendNotification" },

  // Telemetry taps
  { id: "e19", source: "admin-gateway", target: "opentelemetry", protocol: "HTTP/REST", label: "Traces" },
  { id: "e20", source: "vendor-gateway", target: "opentelemetry", protocol: "HTTP/REST", label: "Latency Spike" },
  { id: "e21", source: "order-service", target: "opentelemetry", protocol: "HTTP/REST", label: "Metrics" },
]

/**
 * Generates Mermaid.js flowchart markdown string from nodes and edges
 */
export function generateMermaidFlowchart(
  nodes: TopologyNode[],
  edges: TopologyEdge[]
): string {
  const lines: string[] = ["flowchart LR"]

  // Subgraphs by tier
  const tiers: Record<TopologyTier, string> = {
    client: "Client Applications",
    gateway: "API Gateways",
    "core-api": "Core Microservices",
    worker: "Background Workers & Event Bus",
    database: "Data Persistence & Caching",
    telemetry: "Observability",
  }

  const grouped = new Map<TopologyTier, TopologyNode[]>()
  nodes.forEach((n) => {
    const list = grouped.get(n.tier) || []
    list.push(n)
    grouped.set(n.tier, list)
  })

  grouped.forEach((tierNodes, tierKey) => {
    lines.push(`    subgraph ${tierKey}["${tiers[tierKey]}"]`)
    tierNodes.forEach((n) => {
      const statusIcon = n.status === "operational" ? "🟢" : n.status === "degraded" ? "🟡" : "🔴"
      lines.push(`        ${n.id}["${statusIcon} ${n.name}"]`)
    })
    lines.push("    end")
  })

  // Edges
  edges.forEach((e) => {
    const label = e.label ? `|${e.label}|` : ""
    lines.push(`    ${e.source} -->${label} ${e.target}`)
  })

  return lines.join("\n")
}
