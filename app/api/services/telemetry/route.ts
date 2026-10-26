import { NextResponse } from "next/server"
import {
  getServiceHealthTelemetry,
  getAllServicesTelemetrySummary,
  recordServicePing,
} from "@/app/actions/services"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const serviceIdParam = searchParams.get("serviceId")

    if (serviceIdParam) {
      const serviceId = Number(serviceIdParam)
      const telemetry = await getServiceHealthTelemetry(serviceId)
      return NextResponse.json({ success: true, data: telemetry })
    }

    const fleetSummary = await getAllServicesTelemetrySummary()
    return NextResponse.json({ success: true, data: fleetSummary })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { serviceId, url, result } = body

    if (!serviceId || !url || !result) {
      return NextResponse.json(
        { success: false, error: "serviceId, url, and result are required" },
        { status: 400 }
      )
    }

    const res = await recordServicePing(Number(serviceId), String(url), result)
    return NextResponse.json(res)
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
