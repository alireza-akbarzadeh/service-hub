import { NextResponse } from "next/server"
import { verifySession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    // 1. Authenticate user
    const session = await verifySession()
    if (!session.isAuthenticated) {
      return NextResponse.json(
        { success: false, error: "Unauthorized session. Please login to Service Hub." },
        { status: 401 }
      )
    }

    // 2. Parse request parameters
    const payload = await request.json()
    const { method = "GET", url, headers = {}, body } = payload

    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "Valid target URL is required" },
        { status: 400 }
      )
    }

    // Validate URL scheme
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
      if (!["http:", "https:"].includes(parsedUrl.protocol)) {
        return NextResponse.json(
          { success: false, error: "Only http and https protocols are supported" },
          { status: 400 }
        )
      }
    } catch {
      return NextResponse.json(
        { success: false, error: "Invalid URL format" },
        { status: 400 }
      )
    }

    // Prepare fetch options
    const fetchHeaders = new Headers()
    Object.entries(headers).forEach(([key, val]) => {
      if (typeof val === "string" && key.toLowerCase() !== "host") {
        fetchHeaders.set(key, val)
      }
    })

    const fetchOptions: RequestInit = {
      method: method.toUpperCase(),
      headers: fetchHeaders,
      signal: AbortSignal.timeout(12000), // 12 second safety timeout
    }

    if (["POST", "PUT", "PATCH", "DELETE"].includes(method.toUpperCase()) && body) {
      fetchOptions.body = typeof body === "string" ? body : JSON.stringify(body)
    }

    const startTime = performance.now()
    let response: Response
    try {
      response = await fetch(parsedUrl.toString(), fetchOptions)
    } catch (fetchErr: any) {
      const elapsed = Math.round(performance.now() - startTime)
      const errorMsg =
        fetchErr?.name === "TimeoutError"
          ? "Request timed out after 12,000ms"
          : fetchErr?.message || "Connection refused or unreachable host"

      return NextResponse.json({
        success: true,
        data: {
          status: 0,
          statusText: "Connection Error",
          timeMs: elapsed,
          sizeBytes: 0,
          headers: {},
          body: JSON.stringify({ error: errorMsg, targetUrl: url }, null, 2),
          isJson: true,
          error: errorMsg,
          timestamp: new Date().toISOString(),
        },
      })
    }

    const elapsed = Math.round(performance.now() - startTime)

    // Capture response headers
    const responseHeaders: Record<string, string> = {}
    response.headers.forEach((val, key) => {
      responseHeaders[key] = val
    })

    const rawText = await response.text()
    const sizeBytes = new Blob([rawText]).size

    let isJson = false
    let formattedBody = rawText

    try {
      const parsedJson = JSON.parse(rawText)
      formattedBody = JSON.stringify(parsedJson, null, 2)
      isJson = true
    } catch {
      isJson = false
    }

    return NextResponse.json({
      success: true,
      data: {
        status: response.status,
        statusText: response.statusText || "OK",
        timeMs: elapsed,
        sizeBytes,
        headers: responseHeaders,
        body: formattedBody,
        isJson,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal server error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
