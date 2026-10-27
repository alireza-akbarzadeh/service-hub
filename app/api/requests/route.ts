import { NextRequest, NextResponse } from "next/server"
import {
  getFeedbackRequests,
  createFeedbackRequest,
  updateFeedbackRequest,
  deleteFeedbackRequest,
} from "@/app/actions/requests"

export const dynamic = "force-dynamic"

export async function GET() {
  const result = await getFeedbackRequests()
  return NextResponse.json(result)
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const result = await createFeedbackRequest(body)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json()
    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 })
    }
    const result = await updateFeedbackRequest(id, updates)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json(result.data)
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    if (!id) {
      return NextResponse.json({ error: "Missing id query parameter" }, { status: 400 })
    }
    const result = await deleteFeedbackRequest(id)
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }
    return NextResponse.json({ success: true })
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 })
  }
}
