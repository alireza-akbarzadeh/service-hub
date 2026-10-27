/**
 * cURL command parser, analyzer, device inspector, and code generator.
 */

export interface ParsedCurl {
  raw: string
  method: string
  url: string
  protocol: string
  host: string
  pathname: string
  queryParams: { key: string; value: string }[]
  headers: { key: string; value: string }[]
  cookies: { key: string; value: string }[]
  auth: {
    type: "bearer" | "basic" | "custom" | "none"
    token?: string
    username?: string
    password?: string
    headerName?: string
  }
  body: {
    raw: string
    isJson: boolean
    formattedJson?: string
    parsedJson?: any
    contentType?: string
    isUrlEncoded: boolean
    urlEncodedParams?: { key: string; value: string }[]
  }
  clientInfo: {
    userAgent?: string
    browser?: string
    os?: string
    deviceType?: "Desktop" | "Mobile" | "Tablet" | "Bot / CLI" | "Unknown"
  }
  options: {
    isCompressed: boolean
    insecure: boolean
    followRedirects: boolean
  }
}

/**
 * Tokenize a cURL command line string, respecting single/double quotes,
 * escaped quotes, and backslash line continuations.
 */
export function tokenizeCurl(cmd: string): string[] {
  // Normalize Windows cmd `^` and PowerShell `` ` `` and Unix `\` line continuations
  let cleaned = cmd
    .replace(/\\\r?\n/g, " ")
    .replace(/\^\r?\n/g, " ")
    .replace(/`\r?\n/g, " ")
    .trim()

  const tokens: string[] = []
  let current = ""
  let inSingleQuote = false
  let inDoubleQuote = false
  let escaped = false

  for (let i = 0; i < cleaned.length; i++) {
    const char = cleaned[i]

    if (escaped) {
      current += char
      escaped = false
      continue
    }

    if (char === "\\") {
      escaped = true
      continue
    }

    if (char === "'" && !inDoubleQuote) {
      inSingleQuote = !inSingleQuote
      continue
    }

    if (char === '"' && !inSingleQuote) {
      inDoubleQuote = !inDoubleQuote
      continue
    }

    if ((char === " " || char === "\t" || char === "\n") && !inSingleQuote && !inDoubleQuote) {
      if (current.length > 0) {
        tokens.push(current)
        current = ""
      }
      continue
    }

    current += char
  }

  if (current.length > 0) {
    tokens.push(current)
  }

  return tokens
}

/**
 * Parse User-Agent string to extract Browser, OS, and Device info
 */
export function parseUserAgent(ua: string): {
  browser: string
  os: string
  deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot / CLI" | "Unknown"
} {
  if (!ua) {
    return { browser: "Unknown", os: "Unknown", deviceType: "Unknown" }
  }

  let browser = "Unknown"
  let os = "Unknown"
  let deviceType: "Desktop" | "Mobile" | "Tablet" | "Bot / CLI" | "Unknown" = "Desktop"

  // Detect curl / CLI / bot
  if (/curl\//i.test(ua)) {
    return { browser: ua, os: "Terminal / CLI", deviceType: "Bot / CLI" }
  }
  if (/postman/i.test(ua)) {
    return { browser: "Postman Runtime", os: "Desktop / CLI", deviceType: "Bot / CLI" }
  }
  if (/python|axios|got|node-fetch/i.test(ua)) {
    return { browser: ua, os: "Backend Runtime", deviceType: "Bot / CLI" }
  }

  // OS Detection
  if (/windows phone/i.test(ua)) {
    os = "Windows Phone"
    deviceType = "Mobile"
  } else if (/windows nt 10\.0/i.test(ua)) {
    os = "Windows 10 / 11"
  } else if (/windows nt 6\.3/i.test(ua)) {
    os = "Windows 8.1"
  } else if (/windows nt 6\.1/i.test(ua)) {
    os = "Windows 7"
  } else if (/windows/i.test(ua)) {
    os = "Windows"
  } else if (/android/i.test(ua)) {
    os = "Android"
    deviceType = /tablet/i.test(ua) ? "Tablet" : "Mobile"
  } else if (/ipad/i.test(ua)) {
    os = "iPadOS"
    deviceType = "Tablet"
  } else if (/iphone/i.test(ua)) {
    os = "iOS (iPhone)"
    deviceType = "Mobile"
  } else if (/macintosh|mac os x/i.test(ua)) {
    os = "macOS"
  } else if (/linux/i.test(ua)) {
    os = "Linux"
  }

  // Browser Detection
  if (/edg\//i.test(ua)) {
    browser = "Microsoft Edge"
  } else if (/opr\/|opera/i.test(ua)) {
    browser = "Opera"
  } else if (/chrome\//i.test(ua) && !/edg\//i.test(ua)) {
    browser = "Google Chrome"
  } else if (/firefox\//i.test(ua)) {
    browser = "Mozilla Firefox"
  } else if (/safari\//i.test(ua) && !/chrome\//i.test(ua)) {
    browser = "Apple Safari"
  }

  return { browser, os, deviceType }
}

/**
 * Main cURL Parser Function
 */
export function parseCurl(curlCommand: string): ParsedCurl {
  const tokens = tokenizeCurl(curlCommand)

  let method = ""
  let url = ""
  const headers: { key: string; value: string }[] = []
  const cookies: { key: string; value: string }[] = []
  const bodyChunks: string[] = []
  let isCompressed = false
  let insecure = false
  let followRedirects = false
  let authUserPass = ""

  let i = 0
  if (tokens[0] && tokens[0].toLowerCase() === "curl") {
    i = 1
  }

  while (i < tokens.length) {
    const token = tokens[i]

    if (token === "-X" || token === "--request") {
      method = (tokens[i + 1] || "").toUpperCase()
      i += 2
      continue
    }

    if (token === "-H" || token === "--header") {
      const headerStr = tokens[i + 1] || ""
      const colonIdx = headerStr.indexOf(":")
      if (colonIdx > 0) {
        const key = headerStr.slice(0, colonIdx).trim()
        const value = headerStr.slice(colonIdx + 1).trim()
        headers.push({ key, value })
      }
      i += 2
      continue
    }

    if (token === "-b" || token === "--cookie") {
      const cookieStr = tokens[i + 1] || ""
      cookieStr.split(";").forEach((pair) => {
        const eqIdx = pair.indexOf("=")
        if (eqIdx > 0) {
          cookies.push({
            key: pair.slice(0, eqIdx).trim(),
            value: pair.slice(eqIdx + 1).trim(),
          })
        }
      })
      i += 2
      continue
    }

    if (
      token === "-d" ||
      token === "--data" ||
      token === "--data-raw" ||
      token === "--data-binary" ||
      token === "--data-ascii" ||
      token === "--data-urlencode"
    ) {
      if (!method) method = "POST"
      if (tokens[i + 1] !== undefined) {
        bodyChunks.push(tokens[i + 1])
      }
      i += 2
      continue
    }

    if (token === "-u" || token === "--user") {
      authUserPass = tokens[i + 1] || ""
      i += 2
      continue
    }

    if (token === "-A" || token === "--user-agent") {
      headers.push({ key: "User-Agent", value: tokens[i + 1] || "" })
      i += 2
      continue
    }

    if (token === "-k" || token === "--insecure") {
      insecure = true
      i++
      continue
    }

    if (token === "-L" || token === "--location") {
      followRedirects = true
      i++
      continue
    }

    if (token === "--compressed") {
      isCompressed = true
      i++
      continue
    }

    // If starts with http or looks like url and we haven't found url yet
    if (!token.startsWith("-") && (!url || (!url.startsWith("http") && token.startsWith("http")))) {
      url = token
      i++
      continue
    }

    i++
  }

  // Fallback default method
  if (!method) {
    method = bodyChunks.length > 0 ? "POST" : "GET"
  }

  // Parse URL components
  let protocol = "https:"
  let host = ""
  let pathname = "/"
  const queryParams: { key: string; value: string }[] = []

  try {
    let fullUrl = url
    if (!fullUrl.startsWith("http://") && !fullUrl.startsWith("https://")) {
      fullUrl = "https://" + fullUrl
    }
    const parsedUrl = new URL(fullUrl)
    protocol = parsedUrl.protocol
    host = parsedUrl.host
    pathname = parsedUrl.pathname

    parsedUrl.searchParams.forEach((val, key) => {
      queryParams.push({ key, value: val })
    })
  } catch {
    // If URL is invalid, try extracting path and queries
    const qIndex = url.indexOf("?")
    if (qIndex !== -1) {
      const qStr = url.slice(qIndex + 1)
      qStr.split("&").forEach((pair) => {
        const [k, v] = pair.split("=")
        if (k) queryParams.push({ key: decodeURIComponent(k), value: decodeURIComponent(v || "") })
      })
    }
  }

  // Parse Body & Content Type
  const rawBody = bodyChunks.join("&")
  let isJson = false
  let formattedJson: string | undefined
  let parsedJson: any | undefined
  let isUrlEncoded = false
  const urlEncodedParams: { key: string; value: string }[] = []

  const contentTypeHeader = headers.find(
    (h) => h.key.toLowerCase() === "content-type"
  )?.value

  if (rawBody.trim().startsWith("{") || rawBody.trim().startsWith("[")) {
    try {
      parsedJson = JSON.parse(rawBody)
      isJson = true
      formattedJson = JSON.stringify(parsedJson, null, 2)
    } catch {
      // not valid json
    }
  } else if (
    contentTypeHeader?.includes("application/x-www-form-urlencoded") ||
    (rawBody.includes("=") && !rawBody.includes("{"))
  ) {
    isUrlEncoded = true
    rawBody.split("&").forEach((pair) => {
      const [k, v] = pair.split("=")
      if (k) urlEncodedParams.push({ key: decodeURIComponent(k), value: decodeURIComponent(v || "") })
    })
  }

  // Parse Auth & Tokens
  const authHeader = headers.find((h) => h.key.toLowerCase() === "authorization")?.value
  let auth: ParsedCurl["auth"] = { type: "none" }

  if (authHeader) {
    if (authHeader.toLowerCase().startsWith("bearer ")) {
      auth = {
        type: "bearer",
        token: authHeader.slice(7).trim(),
        headerName: "Authorization",
      }
    } else if (authHeader.toLowerCase().startsWith("basic ")) {
      try {
        const decoded = atob(authHeader.slice(6).trim())
        const [u, p] = decoded.split(":")
        auth = {
          type: "basic",
          username: u,
          password: p,
          headerName: "Authorization",
        }
      } catch {
        auth = { type: "custom", token: authHeader, headerName: "Authorization" }
      }
    } else {
      auth = { type: "custom", token: authHeader, headerName: "Authorization" }
    }
  } else if (authUserPass) {
    const [u, p] = authUserPass.split(":")
    auth = {
      type: "basic",
      username: u,
      password: p,
    }
  } else {
    // Check for common API Key headers
    const apiKeyHeader = headers.find((h) =>
      /api-key|x-api-key|token|x-token|access-token/i.test(h.key)
    )
    if (apiKeyHeader) {
      auth = {
        type: "custom",
        token: apiKeyHeader.value,
        headerName: apiKeyHeader.key,
      }
    }
  }

  // Parse User Agent & Device
  const uaHeader = headers.find((h) => h.key.toLowerCase() === "user-agent")?.value
  const clientInfo = {
    userAgent: uaHeader,
    ...parseUserAgent(uaHeader || ""),
  }

  return {
    raw: curlCommand,
    method,
    url,
    protocol,
    host,
    pathname,
    queryParams,
    headers,
    cookies,
    auth,
    body: {
      raw: rawBody,
      isJson,
      formattedJson,
      parsedJson,
      contentType: contentTypeHeader,
      isUrlEncoded,
      urlEncodedParams,
    },
    clientInfo,
    options: {
      isCompressed,
      insecure,
      followRedirects,
    },
  }
}

/**
 * Generate executable code snippets from ParsedCurl
 */
export function generateCodeSnippet(
  parsed: ParsedCurl,
  language: "fetch" | "axios" | "python" | "curl_clean"
): string {
  const { method, url, headers, body } = parsed

  if (language === "fetch") {
    const headerObj: Record<string, string> = {}
    headers.forEach((h) => (headerObj[h.key] = h.value))

    let bodySnippet = ""
    if (body.isJson && body.formattedJson) {
      bodySnippet = `,\n  body: JSON.stringify(${body.formattedJson})`
    } else if (body.raw) {
      bodySnippet = `,\n  body: ${JSON.stringify(body.raw)}`
    }

    return `// JavaScript / TypeScript (fetch)
const response = await fetch(${JSON.stringify(url)}, {
  method: "${method}",
  headers: ${JSON.stringify(headerObj, null, 2)}${bodySnippet}
});

const data = await response.json();
console.log(data);`
  }

  if (language === "axios") {
    const headerObj: Record<string, string> = {}
    headers.forEach((h) => (headerObj[h.key] = h.value))

    let dataSnippet = ""
    if (body.isJson && body.formattedJson) {
      dataSnippet = `,\n  data: ${body.formattedJson}`
    } else if (body.raw) {
      dataSnippet = `,\n  data: ${JSON.stringify(body.raw)}`
    }

    return `// JavaScript / TypeScript (axios)
import axios from "axios";

const response = await axios({
  method: "${method.toLowerCase()}",
  url: ${JSON.stringify(url)},
  headers: ${JSON.stringify(headerObj, null, 2)}${dataSnippet}
});

console.log(response.data);`
  }

  if (language === "python") {
    const headerObj: Record<string, string> = {}
    headers.forEach((h) => (headerObj[h.key] = h.value))

    let dataSnippet = ""
    if (body.isJson && body.formattedJson) {
      dataSnippet = `,\n    json=${body.formattedJson}`
    } else if (body.raw) {
      dataSnippet = `,\n    data=${JSON.stringify(body.raw)}`
    }

    return `# Python (requests)
import requests

url = "${url}"
headers = ${JSON.stringify(headerObj, null, 4)}

response = requests.${method.toLowerCase()}(
    url,
    headers=headers${dataSnippet}
)

print(response.status_code)
print(response.json())`
  }

  // Normalized clean cURL
  const lines: string[] = [`curl -X ${method} "${url}"`]
  headers.forEach((h) => {
    lines.push(`  -H "${h.key}: ${h.value}"`)
  })
  if (body.raw) {
    if (body.isJson) {
      lines.push(`  -d '${body.raw.replace(/'/g, "'\\''")}'`)
    } else {
      lines.push(`  -d "${body.raw.replace(/"/g, '\\"')}"`)
    }
  }

  return lines.join(" \\\n")
}

/**
 * Sample cURLs for fast testing
 */
export const SAMPLE_CURLS = {
  authPost: `curl 'https://api.tapsi.shop/v1/orders/create' \\
  -X POST \\
  -H 'Accept: application/json, text/plain, */*' \\
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ1c3JfMDQ5MSIsInJvbGUiOiJsZWFkLWZyb250ZW5kIiwidGVhbSI6ImFwaS1nYXRld2F5IiwiZXhwIjoxNzYxNjAwMDAwfQ.g8Xp3M90u9K1pQwO8x8e4kL1fA2bC3dE4fG5hI6jK7l' \\
  -H 'Content-Type: application/json' \\
  -H 'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36' \\
  -H 'X-Client-Version: 2.14.0' \\
  -b 'session_id=teh_sess_982b1c; dark_mode=true' \\
  --data-raw '{"order_id":"ord_8921","customer":{"name":"Alireza Mohammadi","email":"alireza@tehran.company.ir","phone":"+989123456789"},"items":[{"service_id":101,"name":"Customer Order Gateway","quantity":1,"price":450000}],"delivery_address":"Valiasr Ave, Tehran, Iran","payment_method":"card_online","discount_code":"SPRING2026"}'`,

  kibanaQuery: `curl -X GET "https://kibana-dev.company.ir/api/console/proxy?path=_cat%2Findices%3Fv%3Dtrue&method=GET" \\
  -H "Authorization: Basic ZWxhc3RpYzpTZWNyZXRQYXNzMjAyNg==" \\
  -H "User-Agent: PostmanRuntime/7.39.0" \\
  -H "kbn-xsrf: true" \\
  -H "Accept: application/json"`,

  swaggerSearch: `curl -X GET "https://stage-gateway.tapsi.shop/api/v2/services/search?env=Develop&category=Backend&tag=gateway&limit=25" \\
  -H "X-Api-Key: sec_tok_89a7b3c4d5e6f7" \\
  -H "Accept-Language: fa-IR,fa;q=0.9,en-US;q=0.8" \\
  -H "User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1"`,
}
