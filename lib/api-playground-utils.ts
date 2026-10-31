/**
 * API Playground & HTTP Request Sandbox Utilities
 * Supports method selection, query/header key-value pairs, auth presets,
 * multi-language code generation (cURL, Fetch, Axios, Python, Go),
 * and response metrics calculation.
 */

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE" | "HEAD" | "OPTIONS"

export interface KeyValueItem {
  id: string
  key: string
  value: string
  enabled: boolean
}

export type AuthType = "none" | "bearer" | "basic" | "apiKey"

export interface PlaygroundAuthConfig {
  type: AuthType
  bearerToken?: string
  basicUsername?: string
  basicPassword?: string
  apiKeyName?: string
  apiKeyValue?: string
  apiKeyLocation?: "header" | "query"
}

export interface PlaygroundRequest {
  id: string
  name?: string
  method: HttpMethod
  url: string
  queryParams: KeyValueItem[]
  headers: KeyValueItem[]
  auth: PlaygroundAuthConfig
  bodyType: "none" | "json" | "text"
  body: string
}

export interface PlaygroundResponse {
  status: number
  statusText: string
  timeMs: number
  sizeBytes: number
  headers: Record<string, string>
  body: string
  isJson: boolean
  error?: string
  timestamp: string
}

export interface RequestHistoryItem {
  id: string
  timestamp: string
  method: HttpMethod
  url: string
  status?: number
  timeMs?: number
  request: PlaygroundRequest
}

export const defaultHeaders: KeyValueItem[] = [
  { id: "h-1", key: "Accept", value: "application/json", enabled: true },
  { id: "h-2", key: "Content-Type", value: "application/json", enabled: true },
  { id: "h-3", key: "User-Agent", value: "ServiceHub-Playground/1.0", enabled: true },
]

export const defaultRequest: PlaygroundRequest = {
  id: "req-default",
  name: "Service Health Check",
  method: "GET",
  url: "https://httpbin.org/get",
  queryParams: [
    { id: "q-1", key: "env", value: "production", enabled: true },
    { id: "q-2", key: "telemetry", value: "1", enabled: true },
  ],
  headers: defaultHeaders,
  auth: {
    type: "none",
  },
  bodyType: "none",
  body: "{\n  \"message\": \"Hello from Service Hub\",\n  \"traceId\": \"tr-10294\"\n}",
}

/**
 * Builds the effective full URL combining base URL and active query parameters
 */
export function buildEffectiveUrl(baseUrl: string, queryParams: KeyValueItem[]): string {
  if (!baseUrl) return ""
  try {
    const url = new URL(baseUrl)
    queryParams
      .filter((q) => q.enabled && q.key.trim().length > 0)
      .forEach((q) => {
        url.searchParams.set(q.key.trim(), q.value.trim())
      })
    return url.toString()
  } catch {
    // If not a full valid URL yet, do a simple string append
    const activeParams = queryParams.filter((q) => q.enabled && q.key.trim().length > 0)
    if (activeParams.length === 0) return baseUrl

    const qs = activeParams
      .map((q) => `${encodeURIComponent(q.key.trim())}=${encodeURIComponent(q.value.trim())}`)
      .join("&")

    return baseUrl.includes("?") ? `${baseUrl}&${qs}` : `${baseUrl}?${qs}`
  }
}

/**
 * Generates effective headers including Auth
 */
export function buildEffectiveHeaders(
  headers: KeyValueItem[],
  auth: PlaygroundAuthConfig
): Record<string, string> {
  const result: Record<string, string> = {}

  // Active custom headers
  headers
    .filter((h) => h.enabled && h.key.trim().length > 0)
    .forEach((h) => {
      result[h.key.trim()] = h.value.trim()
    })

  // Auth injection
  if (auth.type === "bearer" && auth.bearerToken?.trim()) {
    result["Authorization"] = `Bearer ${auth.bearerToken.trim()}`
  } else if (auth.type === "basic" && auth.basicUsername) {
    const creds = `${auth.basicUsername}:${auth.basicPassword || ""}`
    if (typeof btoa !== "undefined") {
      result["Authorization"] = `Basic ${btoa(creds)}`
    } else {
      result["Authorization"] = `Basic ${Buffer.from(creds).toString("base64")}`
    }
  } else if (
    auth.type === "apiKey" &&
    auth.apiKeyLocation === "header" &&
    auth.apiKeyName?.trim() &&
    auth.apiKeyValue?.trim()
  ) {
    result[auth.apiKeyName.trim()] = auth.apiKeyValue.trim()
  }

  return result
}

/**
 * Code Generators: cURL
 */
export function generateCurlSnippet(req: PlaygroundRequest): string {
  const fullUrl = buildEffectiveUrl(req.url, req.queryParams)
  const headers = buildEffectiveHeaders(req.headers, req.auth)

  let command = `curl -X ${req.method} "${fullUrl || "https://api.example.com"}"`

  Object.entries(headers).forEach(([k, v]) => {
    command += ` \\\n  -H "${k}: ${v}"`
  })

  if (["POST", "PUT", "PATCH"].includes(req.method) && req.bodyType === "json" && req.body) {
    const minified = req.body.replace(/"/g, '\\"')
    command += ` \\\n  -d "${minified.replace(/\n/g, "")}"`
  }

  return command
}

/**
 * Code Generators: Fetch (JavaScript / TypeScript)
 */
export function generateFetchSnippet(req: PlaygroundRequest): string {
  const fullUrl = buildEffectiveUrl(req.url, req.queryParams)
  const headers = buildEffectiveHeaders(req.headers, req.auth)

  const hasBody = ["POST", "PUT", "PATCH"].includes(req.method) && req.bodyType !== "none" && req.body

  const options: Record<string, any> = {
    method: req.method,
    headers: headers,
  }

  if (hasBody) {
    try {
      options.body = JSON.parse(req.body)
    } catch {
      options.body = req.body
    }
  }

  return `const response = await fetch("${fullUrl || "https://api.example.com"}", {
  method: "${req.method}",
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},${
    hasBody
      ? `\n  body: JSON.stringify(${req.bodyType === "json" ? req.body.replace(/\n/g, "\n  ") : `"${req.body}"`}),`
      : ""
  }
});
const data = await response.json();
console.log(data);`
}

/**
 * Code Generators: Axios
 */
export function generateAxiosSnippet(req: PlaygroundRequest): string {
  const fullUrl = buildEffectiveUrl(req.url, req.queryParams)
  const headers = buildEffectiveHeaders(req.headers, req.auth)
  const hasBody = ["POST", "PUT", "PATCH"].includes(req.method) && req.bodyType !== "none" && req.body

  return `import axios from "axios";

const response = await axios({
  method: "${req.method.toLowerCase()}",
  url: "${fullUrl || "https://api.example.com"}",
  headers: ${JSON.stringify(headers, null, 4).replace(/\n/g, "\n  ")},${
    hasBody
      ? `\n  data: ${req.bodyType === "json" ? req.body.replace(/\n/g, "\n  ") : `"${req.body}"`},`
      : ""
  }
});

console.log(response.data);`
}

/**
 * Code Generators: Python (requests)
 */
export function generatePythonSnippet(req: PlaygroundRequest): string {
  const fullUrl = buildEffectiveUrl(req.url, req.queryParams)
  const headers = buildEffectiveHeaders(req.headers, req.auth)
  const hasBody = ["POST", "PUT", "PATCH"].includes(req.method) && req.bodyType !== "none" && req.body

  return `import requests
import json

url = "${fullUrl || "https://api.example.com"}"
headers = ${JSON.stringify(headers, null, 4)}

${
  hasBody
    ? `payload = json.loads('''${req.body}''')\nresponse = requests.${req.method.toLowerCase()}(url, headers=headers, json=payload)`
    : `response = requests.${req.method.toLowerCase()}(url, headers=headers)`
}

print(response.status_code)
print(response.json())`
}

/**
 * Code Generators: Go (net/http)
 */
export function generateGoSnippet(req: PlaygroundRequest): string {
  const fullUrl = buildEffectiveUrl(req.url, req.queryParams)
  const headers = buildEffectiveHeaders(req.headers, req.auth)
  const hasBody = ["POST", "PUT", "PATCH"].includes(req.method) && req.bodyType !== "none" && req.body

  return `package main

import (
\t"fmt"
\t"io"
\t"net/http"${hasBody ? '\n\t"strings"' : ""}
)

func main() {
\turl := "${fullUrl || "https://api.example.com"}"
\t${hasBody ? `payload := strings.NewReader(\`${req.body}\`)\n\treq, _ := http.NewRequest("${req.method}", url, payload)` : `req, _ := http.NewRequest("${req.method}", url, nil)`}

${Object.entries(headers)
  .map(([k, v]) => `\treq.Header.Add("${k}", "${v}")`)
  .join("\n")}

\tres, err := http.DefaultClient.Do(req)
\tif err != nil {
\t\tpanic(err)
\t}
\tdefer res.Body.Close()

\tbody, _ := io.ReadAll(res.Body)
\tfmt.Println(res.StatusCode)
\tfmt.Println(string(body))
}`
}
