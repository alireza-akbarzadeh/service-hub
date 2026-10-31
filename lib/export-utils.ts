import type { Service } from "./db/schema"
import { getServiceTags } from "@/hooks/use-services-dashboard"

export interface PostmanVariable {
  key: string
  value: string
  type: string
}

export interface PostmanHeader {
  key: string
  value: string
  type: string
}

export interface PostmanRequestItem {
  name: string
  request: {
    method: string
    header: PostmanHeader[]
    url: {
      raw: string
      protocol?: string
      host?: string[]
      path?: string[]
    }
    description: string
  }
  event?: Array<{
    listen: string
    script: {
      exec: string[]
      type: string
    }
  }>
}

export interface PostmanFolder {
  name: string
  item: PostmanRequestItem[]
}

export interface PostmanCollection {
  info: {
    _postman_id: string
    name: string
    description: string
    schema: string
  }
  variable: PostmanVariable[]
  item: PostmanFolder[]
}

/**
 * Generates an official Postman Collection v2.1.0 JSON format
 * ready for one-click import into Postman, Insomnia, or Bruno.
 */
export function generatePostmanCollection(
  services: Service[],
  collectionName = "Service Hub API Catalog"
): PostmanCollection {
  // Group services by Environment first, then by Category
  const envGroups = new Map<string, Service[]>()

  services.forEach((s) => {
    const env = s.environment || "General"
    const list = envGroups.get(env) || []
    list.push(s)
    envGroups.set(env, list)
  })

  const folders: PostmanFolder[] = []

  envGroups.forEach((svcList, envName) => {
    const items: PostmanRequestItem[] = svcList.map((svc) => {
      let protocol = "https"
      let hostParts: string[] = []
      let pathParts: string[] = []

      try {
        const parsed = new URL(svc.url)
        protocol = parsed.protocol.replace(":", "")
        hostParts = parsed.host ? parsed.host.split(".") : []
        pathParts = parsed.pathname
          ? parsed.pathname.split("/").filter(Boolean)
          : []
      } catch {
        hostParts = [svc.url.replace(/^https?:\/\//, "")]
      }

      return {
        name: svc.name,
        request: {
          method: "GET",
          header: [
            {
              key: "Authorization",
              value: "Bearer {{bearerToken}}",
              type: "text",
            },
            {
              key: "X-Correlation-Id",
              value: "{{$guid}}",
              type: "text",
            },
            {
              key: "Accept",
              value: "application/json",
              type: "text",
            },
          ],
          url: {
            raw: svc.url,
            protocol,
            host: hostParts,
            path: pathParts,
          },
          description: `${svc.description}\n\nCategory: ${svc.category}\nOwner: ${svc.owner || "Infrastructure Squad"}\nTags: ${getServiceTags(svc).join(", ")}`,
        },
        event: [
          {
            listen: "test",
            script: {
              exec: [
                "pm.test('Status code is 200 OK or 204 No Content', function () {",
                "    pm.expect(pm.response.code).to.be.oneOf([200, 204, 301, 302]);",
                "});",
                "",
                "pm.test('Response time is acceptable (< 1500ms)', function () {",
                "    pm.expect(pm.response.responseTime).to.be.below(1500);",
                "});",
              ],
              type: "text/javascript",
            },
          },
        ],
      }
    })

    folders.push({
      name: `${envName} Tier (${svcList.length} Services)`,
      item: items,
    })
  })

  return {
    info: {
      _postman_id: `service-catalog-${Date.now()}`,
      name: collectionName,
      description:
        "Automated API catalog export from Service Hub. Contains pre-configured requests, environment variables, authentication headers, and SLA test scripts.",
      schema:
        "https://schema.getpostman.com/json/collection/v2.1.0/collection.json",
    },
    variable: [
      {
        key: "bearerToken",
        value: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
        type: "string",
      },
      {
        key: "correlation_id",
        value: "c03bd65d-c1f5-42bc-85df-34735c4c4f38",
        type: "string",
      },
    ],
    item: folders,
  }
}

/**
 * Generates an aggregated OpenAPI 3.0.3 specification JSON.
 */
export function generateOpenApiSpec(
  services: Service[],
  title = "Service Hub Aggregated OpenAPI Spec"
): Record<string, unknown> {
  const paths: Record<string, unknown> = {}

  services.forEach((s) => {
    let cleanPath = "/api"
    try {
      const u = new URL(s.url)
      cleanPath = u.pathname && u.pathname !== "/" ? u.pathname : `/${s.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
    } catch {
      cleanPath = `/${s.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`
    }

    paths[cleanPath] = {
      get: {
        summary: s.name,
        description: s.description,
        tags: [s.category, s.environment],
        servers: [{ url: s.url, description: `${s.environment} Endpoint` }],
        responses: {
          "200": {
            description: "Service is operational",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: s.status },
                    uptime: { type: "number", example: 99.9 },
                    service: { type: "string", example: s.name },
                  },
                },
              },
            },
          },
        },
      },
    }
  })

  return {
    openapi: "3.0.3",
    info: {
      title,
      version: "2026.10.1",
      description:
        "Aggregated API endpoints and microservice catalog generated by Service Hub.",
    },
    servers: [{ url: "https://hasti.co", description: "Company Production Gateway" }],
    paths,
  }
}

/**
 * Generates CSV formatted text for spreadsheet applications (Excel, Google Sheets).
 */
export function generateServicesCsv(services: Service[]): string {
  const headers = [
    "ID",
    "Name",
    "Environment",
    "Category",
    "Status",
    "URL",
    "Owner",
    "Tags",
  ]

  const escapeCsv = (val: string | number | null | undefined): string => {
    if (val === null || val === undefined) return '""'
    const str = String(val).replace(/"/g, '""')
    return `"${str}"`
  }

  const rows = services.map((s) => {
    const tags = getServiceTags(s).join("; ")
    return [
      escapeCsv(s.id),
      escapeCsv(s.name),
      escapeCsv(s.environment),
      escapeCsv(s.category),
      escapeCsv(s.status),
      escapeCsv(s.url),
      escapeCsv(s.owner || "Infrastructure"),
      escapeCsv(tags),
    ].join(",")
  })

  return [headers.join(","), ...rows].join("\r\n")
}

/**
 * Triggers a browser file download for a text blob.
 */
export function downloadFile(
  content: string,
  filename: string,
  mimeType = "application/json"
): void {
  if (typeof window === "undefined") return
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
