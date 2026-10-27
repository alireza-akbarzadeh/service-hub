/**
 * JSON utility functions: formatting, validation, repairing, statistics,
 * and TypeScript type inference.
 */

export interface JsonStats {
  sizeBytes: number
  characters: number
  lines: number
  keysCount: number
  arraysCount: number
  maxDepth: number
}

/**
 * Attempts to intelligently repair malformed or non-strict JSON:
 * - Inserts missing commas between properties and array items (e.g. when a comma is accidentally removed)
 * - Removes single-line and multi-line comments
 * - Converts Python literals (True, False, None) and JS undefined/NaN to JSON
 * - Wraps unquoted object keys in double quotes
 * - Converts single quotes to double quotes
 * - Removes trailing commas in arrays and objects
 * - Auto-balances missing closing brackets and braces
 * - Uses iterative V8 error-guided insertion to repair exact error positions
 */
export function repairJson(input: string): string {
  if (!input || !input.trim()) return input

  let text = input.trim()

  // First, check if already valid
  try {
    JSON.parse(text)
    return text
  } catch {
    // Continue with repair
  }

  // Pass 1: Remove comments (// ... and /* ... */)
  text = text.replace(/\/\*[\s\S]*?\*\/|([^:]|^)\/\/.*$/gm, "$1")

  // Pass 2: Python literals & JavaScript undefined / NaN
  text = text.replace(/\bTrue\b/g, "true")
  text = text.replace(/\bFalse\b/g, "false")
  text = text.replace(/\bNone\b/g, "null")
  text = text.replace(/\bundefined\b/g, "null")
  text = text.replace(/\bNaN\b/g, "null")

  // Pass 3: Convert single-quoted strings to double-quoted strings
  text = text.replace(/'((?:\\.|[^'])*)'/g, (_, content) => {
    const escaped = content.replace(/"/g, '\\"')
    return `"${escaped}"`
  })

  // Pass 4: Fix unquoted property names like { name: "test", foo_bar: 123 }
  text = text.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$]*)\s*:/g, '$1"$2":')

  // Pass 5: Fix missing commas between properties in objects
  // E.g. "foo": "bar"\n"baz": 123  or  123\n"baz": 123  or  true\n"baz": 123  or  }\n"baz": 123  or  ]\n"baz": 123
  text = text.replace(
    /(["\d]|true|false|null|[}\]])(\s*\n+\s*)("(?:\\.|[^"])+"\s*:)/g,
    "$1,$2$3"
  )

  // Pass 6: Also handle missing comma on same line: e.g. {"a": 1 "b": 2}
  text = text.replace(
    /(["\d]|true|false|null|[}\]])(\s+)("(?:\\.|[^"])+"\s*:)/g,
    "$1,$2$3"
  )

  // Pass 7: Fix missing commas between closing brace/bracket and opening brace/bracket
  // E.g. } \n {  or  ] \n [  or  } \n [
  text = text.replace(/([}\]])(\s*\n*\s*)([{\[])/g, "$1,$2$3")

  // Pass 8: Fix missing commas in arrays between items on new lines
  // E.g. "apple"\n"banana" or 123\n456
  text = text.replace(
    /(["\d]|true|false|null|[}\]])(\s*\n+\s*)("(?:\\.|[^"])+"|\d+|true|false|null|[{\[])/g,
    (match, p1, p2, p3) => {
      if (p3.includes(":")) {
        return `${p1},${p2}${p3}`
      }
      return `${p1},${p2}${p3}`
    }
  )

  // Pass 9: Remove trailing commas in objects and arrays: , } -> } and , ] -> ]
  text = text.replace(/,\s*([}\]])/g, "$1")

  // Pass 10: Balance unclosed braces and brackets
  let openBraces = 0
  let openBrackets = 0
  let inString = false
  let escaped = false

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === "\\") {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (!inString) {
      if (ch === "{") openBraces++
      else if (ch === "}") openBraces = Math.max(0, openBraces - 1)
      else if (ch === "[") openBrackets++
      else if (ch === "]") openBrackets = Math.max(0, openBrackets - 1)
    }
  }

  while (openBrackets > 0) {
    text += "]"
    openBrackets--
  }
  while (openBraces > 0) {
    text += "}"
    openBraces--
  }

  // Pass 11: V8 Parser-guided syntax correction (iteratively inserts missing comma if parser expects it)
  for (let attempt = 0; attempt < 8; attempt++) {
    try {
      JSON.parse(text)
      return text // Validated!
    } catch (err: any) {
      const msg = err.message || ""
      const matchPos = msg.match(/position (\d+)/i)
      if (matchPos) {
        const pos = parseInt(matchPos[1], 10)
        // Look back from error position for previous non-whitespace character
        let insertIdx = pos
        while (insertIdx > 0 && /\s/.test(text[insertIdx - 1])) {
          insertIdx--
        }
        if (
          insertIdx > 0 &&
          text[insertIdx - 1] !== "," &&
          text[insertIdx - 1] !== "{" &&
          text[insertIdx - 1] !== "[" &&
          text[insertIdx - 1] !== ":"
        ) {
          text = text.slice(0, insertIdx) + "," + text.slice(insertIdx)
          continue
        }
      }
      break
    }
  }

  return text
}

/**
 * Recursively sort keys of an object or array of objects
 */
export function sortJsonKeys(data: any, order: "asc" | "desc" = "asc"): any {
  if (data === null || typeof data !== "object") {
    return data
  }

  if (Array.isArray(data)) {
    return data.map((item) => sortJsonKeys(item, order))
  }

  const keys = Object.keys(data).sort((a, b) => {
    return order === "asc" ? a.localeCompare(b) : b.localeCompare(a)
  })

  const sortedObj: Record<string, any> = {}
  for (const key of keys) {
    sortedObj[key] = sortJsonKeys(data[key], order)
  }

  return sortedObj
}

/**
 * Calculate structural statistics for a parsed JSON structure
 */
export function computeJsonStats(rawText: string, parsed: any): JsonStats {
  const characters = rawText.length
  const lines = rawText.length > 0 ? rawText.split("\n").length : 0
  const sizeBytes = new Blob([rawText]).size

  let keysCount = 0
  let arraysCount = 0
  let maxDepth = 0

  function traverse(value: any, depth: number) {
    if (depth > maxDepth) maxDepth = depth

    if (value && typeof value === "object") {
      if (Array.isArray(value)) {
        arraysCount += value.length
        for (const item of value) {
          traverse(item, depth + 1)
        }
      } else {
        const keys = Object.keys(value)
        keysCount += keys.length
        for (const k of keys) {
          traverse(value[k], depth + 1)
        }
      }
    }
  }

  if (parsed !== null && typeof parsed === "object") {
    traverse(parsed, 1)
  }

  return {
    sizeBytes,
    characters,
    lines,
    keysCount,
    arraysCount,
    maxDepth,
  }
}

/**
 * Format bytes into human-readable string (B, KB, MB)
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B"
  const k = 1024
  const sizes = ["B", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

/**
 * Infer TypeScript Interfaces from arbitrary JSON data
 */
export function jsonToTypeScript(
  json: any,
  rootInterfaceName = "RootObject"
): string {
  const interfaces: Map<string, string> = new Map()

  function capitalize(str: string): string {
    if (!str) return "Item"
    return str.charAt(0).toUpperCase() + str.slice(1)
  }

  function getType(val: any, keyName: string): string {
    if (val === null) return "null"
    if (val === undefined) return "any"

    const type = typeof val
    if (type === "string" || type === "number" || type === "boolean") {
      return type
    }

    if (Array.isArray(val)) {
      if (val.length === 0) return "any[]"
      // sample from array items
      const sampleItem = val.find((item) => item !== null && typeof item === "object") || val[0]
      const itemType = getType(sampleItem, `${keyName}Item`)
      return `${itemType}[]`
    }

    if (type === "object") {
      const subInterfaceName = capitalize(keyName)
      generateInterface(val, subInterfaceName)
      return subInterfaceName
    }

    return "any"
  }

  function generateInterface(obj: Record<string, any>, name: string) {
    if (!obj || typeof obj !== "object" || Array.isArray(obj)) return

    const lines: string[] = []
    lines.push(`export interface ${name} {`)

    for (const [key, value] of Object.entries(obj)) {
      const sanitizedKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key)
        ? key
        : JSON.stringify(key)
      const isOptional = value === null || value === undefined ? "?" : ""
      const typeStr = getType(value, key)
      lines.push(`  ${sanitizedKey}${isOptional}: ${typeStr};`)
    }

    lines.push("}")
    interfaces.set(name, lines.join("\n"))
  }

  if (Array.isArray(json)) {
    if (json.length > 0 && typeof json[0] === "object") {
      generateInterface(json[0], `${rootInterfaceName}Item`)
      return (
        Array.from(interfaces.values()).join("\n\n") +
        `\n\nexport type ${rootInterfaceName} = ${rootInterfaceName}Item[];`
      )
    } else {
      return `export type ${rootInterfaceName} = ${getType(json, "Item")};`
    }
  } else if (typeof json === "object" && json !== null) {
    generateInterface(json, rootInterfaceName)
    return Array.from(interfaces.values()).join("\n\n")
  } else {
    return `export type ${rootInterfaceName} = ${typeof json};`
  }
}

/**
 * Built-in Sample Datasets for Quick Testing
 */
export const SAMPLE_JSONS: Record<
  string,
  { label: string; description: string; json: string }
> = {
  users_api: {
    label: "User Profile API Response",
    description: "Paginated user profiles with roles, security metadata, and nested configs",
    json: JSON.stringify(
      {
        status: 200,
        success: true,
        message: "Users fetched successfully",
        pagination: {
          page: 1,
          per_page: 2,
          total_pages: 14,
          total_records: 28,
        },
        data: [
          {
            id: "usr_98a72b",
            name: "Alireza Mohammadi",
            username: "alireza.dev",
            email: "alireza@tehran.company.ir",
            roles: ["lead-frontend", "admin", "devops-viewer"],
            active: true,
            created_at: "2026-03-15T08:30:00Z",
            tehran_timezone: "Asia/Tehran (IRST +03:30)",
            preferences: {
              theme: "dark",
              locale: "fa-IR",
              notifications: {
                email: true,
                slack: false,
                push: true,
              },
            },
            assigned_services: [
              {
                id: 101,
                name: "Customer Order Gateway",
                env: "Develop",
                port: 5040,
                health: "UP",
              },
              {
                id: 104,
                name: "Kibana Telemetry Log",
                env: "Test",
                port: 5601,
                health: "UP",
              },
            ],
          },
          {
            id: "usr_44e19c",
            name: "Sara Rahimi",
            username: "sara.r",
            email: "sara.rahimi@company.ir",
            roles: ["backend-engineer"],
            active: true,
            created_at: "2026-06-20T10:15:00Z",
            tehran_timezone: "Asia/Tehran (IRST +03:30)",
            preferences: {
              theme: "system",
              locale: "en-US",
              notifications: {
                email: true,
                slack: true,
                push: false,
              },
            },
            assigned_services: [
              {
                id: 202,
                name: "Payment Processing Core",
                env: "Stage",
                port: 8080,
                health: "UP",
              },
            ],
          },
        ],
        meta: {
          server_id: "cluster-teh-az-02",
          request_duration_ms: 18.4,
          cache_hit: true,
        },
      },
      null,
      2
    ),
  },
  k8s_manifest: {
    label: "Kubernetes Service Deployment",
    description: "Cloud-native Kubernetes Deployment and Service spec",
    json: JSON.stringify(
      {
        apiVersion: "apps/v1",
        kind: "Deployment",
        metadata: {
          name: "service-catalog-api",
          namespace: "internal-tools",
          labels: {
            app: "service-catalog",
            tier: "backend",
            environment: "staging",
          },
        },
        spec: {
          replicas: 3,
          selector: {
            matchLabels: {
              app: "service-catalog",
            },
          },
          template: {
            metadata: {
              labels: {
                app: "service-catalog",
              },
            },
            spec: {
              containers: [
                {
                  name: "service-hub-core",
                  image: "registry.company.ir/infra/service-hub:v2.4.1",
                  ports: [
                    {
                      containerPort: 3000,
                      name: "http",
                    },
                  ],
                  resources: {
                    limits: {
                      cpu: "500m",
                      memory: "512Mi",
                    },
                    requests: {
                      cpu: "100m",
                      memory: "128Mi",
                    },
                  },
                  readinessProbe: {
                    httpGet: {
                      path: "/api/health",
                      port: 3000,
                    },
                    initialDelaySeconds: 5,
                    periodSeconds: 10,
                  },
                },
              ],
            },
          },
        },
      },
      null,
      2
    ),
  },
  microservices_mesh: {
    label: "Microservices Telemetry Map",
    description: "Graph dependencies and latency metrics between microservices",
    json: JSON.stringify(
      {
        cluster: "tehran-dc-replica",
        timestamp: "2026-10-27T11:50:00Z",
        nodes: [
          {
            id: "api-gateway",
            type: "gateway",
            instances: 4,
            avg_latency_ms: 2.4,
            error_rate: 0.001,
          },
          {
            id: "auth-service",
            type: "service",
            instances: 3,
            avg_latency_ms: 5.1,
            error_rate: 0.0,
          },
          {
            id: "catalog-db-neon",
            type: "database",
            engine: "PostgreSQL 17 (Serverless)",
            pooler: "PgBouncer",
            active_connections: 12,
          },
        ],
        edges: [
          {
            from: "api-gateway",
            to: "auth-service",
            protocol: "gRPC",
            rps: 340,
          },
          {
            from: "auth-service",
            to: "catalog-db-neon",
            protocol: "TCP/SSL",
            rps: 210,
          },
        ],
      },
      null,
      2
    ),
  },
}
