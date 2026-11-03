/**
 * In-Browser Mock API Server & Contract Simulator Suite
 * Enables frontend and backend developers to simulate microservice HTTP endpoints,
 * configure latency delays, HTTP status codes, response headers, and dynamic payload macros.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE"

export interface MockHeader {
  id: string
  key: string
  value: string
  enabled: boolean
}

export interface MockEndpoint {
  id: string
  name: string
  serviceName: string
  method: HttpMethod
  path: string // e.g. "/api/v1/checkout/preview"
  status: number // 200, 201, 400, 401, 403, 404, 500
  delayMs: number // 0 to 3000ms
  headers: MockHeader[]
  responseBody: string
  description: string
  isEnabled: boolean
  callCount: number
  lastCalledAt?: string
  createdAt: string
  updatedAt: string
}

export interface MockExecutionResult {
  status: number
  statusText: string
  durationMs: number
  headers: Record<string, string>
  body: string
  isJson: boolean
  executedAt: string
}

export const HTTP_STATUS_OPTIONS = [
  { code: 200, label: "200 OK", category: "success" },
  { code: 201, label: "201 Created", category: "success" },
  { code: 204, label: "204 No Content", category: "success" },
  { code: 400, label: "400 Bad Request", category: "client_error" },
  { code: 401, label: "401 Unauthorized", category: "client_error" },
  { code: 403, label: "403 Forbidden", category: "client_error" },
  { code: 404, label: "404 Not Found", category: "client_error" },
  { code: 409, label: "409 Conflict", category: "client_error" },
  { code: 422, label: "422 Unprocessable Entity", category: "client_error" },
  { code: 429, label: "429 Too Many Requests", category: "client_error" },
  { code: 500, label: "500 Internal Server Error", category: "server_error" },
  { code: 502, label: "502 Bad Gateway", category: "server_error" },
  { code: 503, label: "503 Service Unavailable", category: "server_error" },
  { code: 504, label: "504 Gateway Timeout", category: "server_error" },
]

export const METHOD_COLORS: Record<HttpMethod, { badge: string; text: string }> = {
  GET: { badge: "bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/30", text: "text-sky-500" },
  POST: { badge: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30", text: "text-emerald-500" },
  PUT: { badge: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30", text: "text-amber-500" },
  PATCH: { badge: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30", text: "text-purple-500" },
  DELETE: { badge: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30", text: "text-rose-500" },
}

/**
 * Replaces dynamic Faker-style template macros inside mock responses.
 * Supported macros: {{uuid}}, {{timestamp}}, {{isoDate}}, {{randomInt}}, {{randomPrice}}, {{randomName}}, {{randomEmail}}
 */
export function interpolateMacros(template: string): string {
  if (!template) return template

  const names = ["Ali Akbarzadeh", "Farhad Rostami", "Sara Danesh", "Hossein Rezaei", "Kaveh Mohammadi", "Sina Vafaei"]
  const emails = ["user@hasti.co", "developer@golrang.com", "platform@gig.services", "qa@hasti.ir"]

  return template
    .replace(/\{\{uuid\}\}/g, () => {
      return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0
        const v = c === "x" ? r : (r & 0x3) | 0x8
        return v.toString(16)
      })
    })
    .replace(/\{\{timestamp\}\}/g, () => Date.now().toString())
    .replace(/\{\{isoDate\}\}/g, () => new Date().toISOString())
    .replace(/\{\{randomInt\}\}/g, () => Math.floor(1000 + Math.random() * 9000).toString())
    .replace(/\{\{randomPrice\}\}/g, () => (Math.floor(150 + Math.random() * 850) * 1000).toLocaleString())
    .replace(/\{\{randomName\}\}/g, () => names[Math.floor(Math.random() * names.length)])
    .replace(/\{\{randomEmail\}\}/g, () => emails[Math.floor(Math.random() * emails.length)])
}

export const initialMockEndpoints: MockEndpoint[] = [
  {
    id: "mock-auth-token",
    name: "OAuth2 Token Exchange",
    serviceName: "Identity & SSO Provider",
    method: "POST",
    path: "/api/v1/oauth/token",
    status: 200,
    delayMs: 120,
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
      { id: "h2", key: "Cache-Control", value: "no-store", enabled: true },
    ],
    responseBody: JSON.stringify(
      {
        access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMTA0MiIsIm5hbWUiOiJBbGkgQWtiYXJ6YWRlaCIsInJvbGUiOiJFbmdpbmVlciJ9",
        token_type: "Bearer",
        expires_in: 3600,
        refresh_token: "r-{{uuid}}",
        scope: "read write catalog.admin",
        issued_at: "{{isoDate}}",
      },
      null,
      2
    ),
    description: "Issues signed JWT bearer token with claims for frontend authentication testing.",
    isEnabled: true,
    callCount: 142,
    createdAt: "2026-10-31T08:00:00Z",
    updatedAt: "2026-11-02T10:00:00Z",
  },
  {
    id: "mock-products-list",
    name: "Product Catalog Query",
    serviceName: "Product Catalog Search API",
    method: "GET",
    path: "/api/v1/products/search",
    status: 200,
    delayMs: 250,
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
      { id: "h2", key: "X-Total-Count", value: "48", enabled: true },
    ],
    responseBody: JSON.stringify(
      {
        page: 1,
        pageSize: 10,
        total: 48,
        items: [
          {
            id: "{{randomInt}}",
            sku: "SKU-{{randomInt}}",
            title: "Ultra Performance Cloud Router",
            priceToman: 4850000,
            stock: 14,
            inStock: true,
          },
          {
            id: "{{randomInt}}",
            sku: "SKU-{{randomInt}}",
            title: "Industrial Managed PoE Switch 24-Port",
            priceToman: 12400000,
            stock: 5,
            inStock: true,
          },
        ],
      },
      null,
      2
    ),
    description: "Returns paginated list of catalog products for UI table and infinite scroll prototyping.",
    isEnabled: true,
    callCount: 88,
    createdAt: "2026-10-31T09:30:00Z",
    updatedAt: "2026-11-01T15:20:00Z",
  },
  {
    id: "mock-checkout-preview",
    name: "Checkout Calculation & Tax",
    serviceName: "Commerce Gateway API",
    method: "POST",
    path: "/api/v1/checkout/preview",
    status: 200,
    delayMs: 380,
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
      { id: "h2", key: "X-Trace-Id", value: "{{uuid}}", enabled: true },
    ],
    responseBody: JSON.stringify(
      {
        orderId: "ORD-{{randomInt}}",
        subtotal: 17250000,
        discountPercent: 10,
        discountAmount: 1725000,
        taxAmount: 1397250,
        finalTotal: 16922250,
        currency: "IRR",
        estimatedDeliveryDays: 2,
        validUntil: "{{isoDate}}",
      },
      null,
      2
    ),
    description: "Calculates basket tax, discount coupons, and shipping estimates prior to order confirmation.",
    isEnabled: true,
    callCount: 65,
    createdAt: "2026-11-01T12:00:00Z",
    updatedAt: "2026-11-02T09:10:00Z",
  },
  {
    id: "mock-payment-failure",
    name: "Payment IPG Rejection Simulator",
    serviceName: "Payment Gateway Connector",
    method: "POST",
    path: "/api/v1/payments/verify",
    status: 400,
    delayMs: 650,
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
    ],
    responseBody: JSON.stringify(
      {
        error: "PAYMENT_DECLINED",
        code: 1042,
        message: "Bank settlement rejected: Insufficient funds or invalid Shaparak security token.",
        referenceId: "TX-{{uuid}}",
        timestamp: "{{isoDate}}",
      },
      null,
      2
    ),
    description: "Simulates failure state to test user error banners and retry payment buttons on web/mobile.",
    isEnabled: true,
    callCount: 31,
    createdAt: "2026-11-01T14:40:00Z",
    updatedAt: "2026-11-02T11:00:00Z",
  },
  {
    id: "mock-notification-dispatch",
    name: "Push SMS & Webhook Dispatch",
    serviceName: "Notification Worker Hub",
    method: "POST",
    path: "/api/v1/notify/sms",
    status: 201,
    delayMs: 180,
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
    ],
    responseBody: JSON.stringify(
      {
        status: "queued",
        messageId: "MSG-{{uuid}}",
        recipient: "{{randomEmail}}",
        provider: "KavehNegar VIP Trunk",
        dispatchedAt: "{{isoDate}}",
      },
      null,
      2
    ),
    description: "Confirms message queuing in background worker buffer for async SMS notification tests.",
    isEnabled: true,
    callCount: 44,
    createdAt: "2026-11-02T13:10:00Z",
    updatedAt: "2026-11-02T13:10:00Z",
  },
  {
    id: "mock-gateway-health",
    name: "Synthetic Health & Uptime Probe",
    serviceName: "Commerce Gateway API",
    method: "GET",
    path: "/healthz",
    status: 200,
    delayMs: 45,
    headers: [
      { id: "h1", key: "Content-Type", value: "application/json", enabled: true },
    ],
    responseBody: JSON.stringify(
      {
        status: "UP",
        environment: "Production",
        uptimeSeconds: 864200,
        database: "CONNECTED",
        redisCluster: "HEALTHY",
        checkedAt: "{{isoDate}}",
      },
      null,
      2
    ),
    description: "Lightweight synthetic ping endpoint for uptime probes and load balancer health monitors.",
    isEnabled: true,
    callCount: 290,
    createdAt: "2026-10-30T10:00:00Z",
    updatedAt: "2026-11-02T16:00:00Z",
  },
]

const LOCAL_STORAGE_KEY = "service_hub_mock_endpoints"

/**
 * Loads mock endpoints from localStorage or falls back to initial mocks.
 */
export function getStoredMocks(): MockEndpoint[] {
  if (typeof window === "undefined") return initialMockEndpoints
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) return initialMockEndpoints
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : initialMockEndpoints
  } catch {
    return initialMockEndpoints
  }
}

/**
 * Saves mock endpoints to localStorage.
 */
export function saveStoredMocks(mocks: MockEndpoint[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mocks))
  } catch (err) {
    console.warn("Failed to persist mock endpoints:", err)
  }
}

/**
 * Executes a simulated mock endpoint request with configured delay and macro replacement.
 */
export async function executeMockRequest(endpoint: MockEndpoint): Promise<MockExecutionResult> {
  const startTime = performance.now()

  // Simulate network delay
  if (endpoint.delayMs > 0) {
    await new Promise((resolve) => setTimeout(resolve, endpoint.delayMs))
  }

  const durationMs = Math.round(performance.now() - startTime)
  const interpolatedBody = interpolateMacros(endpoint.responseBody)

  let isJson = false
  try {
    JSON.parse(interpolatedBody)
    isJson = true
  } catch {
    isJson = false
  }

  const headersRecord: Record<string, string> = {}
  endpoint.headers
    .filter((h) => h.enabled)
    .forEach((h) => {
      headersRecord[h.key] = interpolateMacros(h.value)
    })

  const statusMap: Record<number, string> = {
    200: "OK",
    201: "Created",
    204: "No Content",
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbidden",
    404: "Not Found",
    409: "Conflict",
    422: "Unprocessable Entity",
    429: "Too Many Requests",
    500: "Internal Server Error",
    502: "Bad Gateway",
    503: "Service Unavailable",
    504: "Gateway Timeout",
  }

  return {
    status: endpoint.status,
    statusText: statusMap[endpoint.status] || "Response",
    durationMs,
    headers: headersRecord,
    body: interpolatedBody,
    isJson,
    executedAt: new Date().toISOString(),
  }
}

/**
 * Generates an OpenAPI 3.0.3 specification JSON from current mock endpoints.
 */
export function exportMocksToOpenApi(mocks: MockEndpoint[]): string {
  const paths: Record<string, any> = {}

  mocks.forEach((m) => {
    const p = m.path.startsWith("/") ? m.path : `/${m.path}`
    if (!paths[p]) paths[p] = {}

    const methodLower = m.method.toLowerCase()
    paths[p][methodLower] = {
      summary: m.name,
      description: m.description,
      tags: [m.serviceName],
      responses: {
        [m.status]: {
          description: `Simulated response with ${m.delayMs}ms delay`,
          content: {
            "application/json": {
              schema: {
                type: "object",
                example: (() => {
                  try {
                    return JSON.parse(m.responseBody)
                  } catch {
                    return m.responseBody
                  }
                })(),
              },
            },
          },
        },
      },
    }
  })

  const spec = {
    openapi: "3.0.3",
    info: {
      title: "Service Hub Mock API Server Collection",
      version: "1.0.0",
      description: "Auto-generated contract specifications from in-browser simulated mock endpoints.",
    },
    paths,
  }

  return JSON.stringify(spec, null, 2)
}
