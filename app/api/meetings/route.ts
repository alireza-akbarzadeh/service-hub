import { NextResponse } from "next/server"

export interface FrontendMeeting {
  id: string
  title: string
  tehranTime: string // "HH:MM" in 24-hour format
  durationMins: number
  platform: "Google Meet" | "Zoom" | "Teams" | "Custom"
  meetUrl: string
  agenda: string
  attendees: string
  notifyBeforeMins: number
  isActive: boolean
  createdAt: string
}

export const INITIAL_MEETINGS: FrontendMeeting[] = [
  {
    id: "standup",
    title: "Daily Frontend Standup",
    tehranTime: "10:30",
    durationMins: 30,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "PR reviews, blockers, microservice integration & daily goals",
    attendees: "Frontend Squad & QA",
    notifyBeforeMins: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "arch-review",
    title: "Frontend Architecture & Code Review",
    tehranTime: "14:00",
    durationMins: 45,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Component refactoring, performance metrics & state management",
    attendees: "Tech Leads & Engineers",
    notifyBeforeMins: 10,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: "design-sync",
    title: "UI/UX Design System Sync",
    tehranTime: "16:15",
    durationMins: 30,
    platform: "Google Meet",
    meetUrl: "https://meet.google.com/new",
    agenda: "Figma tokens handoff, theme adjustments & responsive review",
    attendees: "Product Designers & Frontend",
    notifyBeforeMins: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
]

// In-memory fallback cache for server runtime
let meetingsStore: FrontendMeeting[] = [...INITIAL_MEETINGS]

/**
 * GET /api/meetings
 * Returns list of configured frontend meetings
 */
export async function GET() {
  return NextResponse.json({
    success: true,
    data: meetingsStore,
  })
}

/**
 * POST /api/meetings
 * Create a new meeting
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    if (!body.title || !body.tehranTime) {
      return NextResponse.json(
        { success: false, error: "Title and Tehran time are required." },
        { status: 400 }
      )
    }

    const newMeeting: FrontendMeeting = {
      id: body.id || `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: String(body.title).trim(),
      tehranTime: String(body.tehranTime).trim(),
      durationMins: Number(body.durationMins) || 30,
      platform: body.platform || "Google Meet",
      meetUrl: body.meetUrl?.trim() || "https://meet.google.com/new",
      agenda: body.agenda?.trim() || "Engineering sync",
      attendees: body.attendees?.trim() || "Frontend Squad",
      notifyBeforeMins: Number(body.notifyBeforeMins) || 5,
      isActive: body.isActive !== false,
      createdAt: new Date().toISOString(),
    }

    meetingsStore.push(newMeeting)

    return NextResponse.json({
      success: true,
      data: newMeeting,
      all: meetingsStore,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/meetings
 * Update an existing meeting
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()

    if (!body.id) {
      return NextResponse.json(
        { success: false, error: "Meeting ID is required." },
        { status: 400 }
      )
    }

    const index = meetingsStore.findIndex((m) => m.id === body.id)
    if (index === -1) {
      return NextResponse.json(
        { success: false, error: "Meeting not found." },
        { status: 400 }
      )
    }

    meetingsStore[index] = {
      ...meetingsStore[index],
      ...body,
      id: meetingsStore[index].id, // preserve ID
    }

    return NextResponse.json({
      success: true,
      data: meetingsStore[index],
      all: meetingsStore,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/meetings?id=...
 * Delete a meeting
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Meeting ID is required." },
        { status: 400 }
      )
    }

    meetingsStore = meetingsStore.filter((m) => m.id !== id)

    return NextResponse.json({
      success: true,
      deletedId: id,
      all: meetingsStore,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error"
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
