import type { Service } from "./db/schema"

const STORAGE_PREFIX = "service_hub_doc_override_"

/**
 * Generates structured, production-grade technical Markdown documentation
 * tailored to the specific microservice metadata and category.
 */
export function generateDefaultServiceDoc(service: Service): string {
  const isSwagger =
    service.category === "API & Swagger" ||
    service.name.toLowerCase().includes("swagger") ||
    service.url.includes("swagger")

  const isDevOps =
    service.category === "DevOps & CI/CD" ||
    service.environment === "DevOps & Tools"

  const isObservability = service.category === "Observability"

  return `# ${service.name} — Engineering Runbook & Architecture

> **Environment:** \`${service.environment}\`  
> **Category:** \`${service.category}\`  
> **Service Status:** \`${service.status.toUpperCase()}\`  
> **Engineering Owner:** **${service.owner || "Infrastructure Squad"}**  
> **Primary Endpoint:** [${service.url}](${service.url})

---

## 1. 🚀 Service Overview & Purpose
${service.description}

This service forms part of the core **${service.environment}** deployment tier. It serves requests for internal developer tooling, portal applications, and downstream APIs.

---

## 2. 🏗️ Architecture & Component Topology
- **Deployment Platform:** Kubernetes Pods / Linux Systemd Docker container
- **Data Persistence:** Neon Serverless PostgreSQL / Distributed Redis Cache
- **Message Bus & Telemetry:** OpenTelemetry Tracing / RabbitMQ & Kafka Event Streams
- **Network Boundaries:** Protected behind internal API Gateway and Cloudflare edge

\`\`\`mermaid
flowchart LR
    Client["Client / Portal Web"] --> Gateway["API Gateway"]
    Gateway --> Service["${service.name}"]
    Service --> Cache["Redis Cache"]
    Service --> DB[("PostgreSQL DB")]
    Service --> Queue["Kafka / RabbitMQ"]
\`\`\`

---

## 3. 🔑 Authentication & Required Headers
All incoming requests to this service must provide standardized tracing and authorization headers:

\`\`\`http
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-Correlation-Id: c03bd65d-c1f5-42bc-85df-34735c4c4f38
X-Client-Version: 2026.10.1
Accept: application/json
\`\`\`

${
  isSwagger
    ? `### Interactive API Explorer
This service exposes interactive OpenAPI / Swagger specifications at \`${service.url}\`.
- To inspect raw JSON schema: \`${service.url.replace(/\/$/, "")}/v1/swagger.json\`
- Bearer authorization can be unlocked via the green **Authorize** button with a staging JWT.`
    : `### Standard API Endpoints
- \`GET /health\` — Liveness and readiness probe for orchestration
- \`GET /metrics\` — Prometheus telemetry scrape target
- \`GET /api/v1/status\` — Version, uptime, and database connection pool statistics`
}

---

## 4. 🛠️ Local Development & Quickstart Runbook
To run or debug a local replica of **${service.name}**:

\`\`\`bash
# 1. Pull the container image or clone repository
git clone git@git.internal.hasti.co:services/${service.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}.git
cd ${service.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}

# 2. Configure environment overrides
cp .env.example .env.local
# Set DATABASE_URL and REDIS_URL to local Docker services

# 3. Spin up local supporting dependencies
docker compose up -d redis postgres

# 4. Start local development hot reload
dotnet run # or: npm run dev / go run main.go
\`\`\`

---

## 5. ⚠️ Incident Triage, Runbook & SLA
If **${service.name}** experiences degraded latency or connection timeouts:
1. **Network Connectivity:** If working remotely or off-premise, verify active connection to the company VPN. External non-whitelisted IPs will receive \`403 Forbidden\` or TCP timeouts.
2. **Ping Diagnostics:** Run client-side latency ping test directly from the Service Hub launcher or via cURL:
   \`\`\`bash
   curl -I -m 5 "${service.url}"
   \`\`\`
3. **Database Pool Saturation:** Review Neon Postgres active connection count in the Observability portal.
4. **On-Call Escalation:** Contact **${service.owner || "DevOps Team"}** on Slack/Teams \`#alerts-${service.environment.toLowerCase()}\`.
`
}

/**
 * Retrieves custom Markdown notes saved by the developer for a given service.
 */
export function getCustomServiceDoc(serviceId: number): string | null {
  if (typeof window === "undefined") return null
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${serviceId}`)
  } catch {
    return null
  }
}

/**
 * Saves developer notes or edited runbook for a service in localStorage.
 */
export function saveCustomServiceDoc(serviceId: number, content: string): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${serviceId}`, content)
  } catch (err) {
    console.error("Failed to save custom service doc:", err)
  }
}

/**
 * Removes custom notes and resets to generated runbook documentation.
 */
export function resetCustomServiceDoc(serviceId: number): void {
  if (typeof window === "undefined") return
  try {
    localStorage.removeItem(`${STORAGE_PREFIX}${serviceId}`)
  } catch (err) {
    console.error("Failed to reset service doc:", err)
  }
}

/**
 * Returns effective documentation for a service (custom overrides if present, else generated).
 */
export function getEffectiveServiceDoc(service: Service): {
  content: string
  isCustom: boolean
} {
  const custom = getCustomServiceDoc(service.id)
  if (custom && custom.trim().length > 0) {
    return { content: custom, isCustom: true }
  }
  return { content: generateDefaultServiceDoc(service), isCustom: false }
}

