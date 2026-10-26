import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { meetings, type Meeting } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"

import {
  type FrontendMeeting,
  INITIAL_MEETINGS,
} from "@/lib/meetings-data"

export { type FrontendMeeting, INITIAL_MEETINGS }

export function mapDbMeetingToFrontend(row: Meeting): FrontendMeeting {
  return {
    id: row.id,
    title: row.title,
    tehranTime: row.tehranTime,
    durationMins: row.durationMins,
    platform: (row.platform as FrontendMeeting["platform"]) || "Google Meet",
    meetUrl: row.meetUrl,
    agenda: row.agenda || "",
    attendees: row.attendees || "Frontend Squad",
    notifyBeforeMins: row.notifyBeforeMins,
    isActive: row.isActive,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  }
}

// In-memory fallback cache for server runtime
let meetingsStore: FrontendMeeting[] = [...INITIAL_MEETINGS]

/**
 * GET /api/meetings
 * Returns list of configured frontend meetings from Neon Postgres
 */
export async function GET() {
  try {
    const queryPromise = db.select().from(meetings).orderBy(asc(meetings.tehranTime))
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Neon query timeout")), 3500)
    )
    const rows = await Promise.race([queryPromise, timeoutPromise])

    if (rows && rows.length > 0) {
      const liveMeetings = rows.map(mapDbMeetingToFrontend)
      meetingsStore = liveMeetings
      return NextResponse.json({
        success: true,
        data: liveMeetings,
        source: "neon",
      })
    }

    // If table is empty, auto-seed with INITIAL_MEETINGS
    try {
      for (const m of INITIAL_MEETINGS) {
        await db
          .insert(meetings)
          .values({
            id: m.id,
            title: m.title,
            tehranTime: m.tehranTime,
            durationMins: m.durationMins,
            platform: m.platform,
            meetUrl: m.meetUrl,
            agenda: m.agenda,
            attendees: m.attendees,
            notifyBeforeMins: m.notifyBeforeMins,
            isActive: m.isActive,
          })
          .onConflictDoNothing()
      }
    } catch (seedErr) {
      console.warn("Auto-seed error:", seedErr)
    }

    return NextResponse.json({
      success: true,
      data: meetingsStore,
      source: "neon-seeded",
    })
  } catch (err) {
    console.warn("Neon meetings GET query fallback:", (err as Error).message)
    return NextResponse.json({
      success: true,
      data: meetingsStore,
      source: "fallback",
    })
  }
}

/**
 * POST /api/meetings
 * Create a new meeting in Neon Postgres
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

    const meetingId = body.id || `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const meetingPayload = {
      id: meetingId,
      title: String(body.title).trim(),
      tehranTime: String(body.tehranTime).trim(),
      durationMins: Number(body.durationMins) || 30,
      platform: (body.platform as FrontendMeeting["platform"]) || "Google Meet",
      meetUrl: body.meetUrl?.trim() || "https://meet.google.com/new",
      agenda: body.agenda?.trim() || "Engineering sync",
      attendees: body.attendees?.trim() || "Frontend Squad",
      notifyBeforeMins: Number(body.notifyBeforeMins) || 5,
      isActive: body.isActive !== false,
    }

    let createdRecord: FrontendMeeting = {
      ...meetingPayload,
      createdAt: new Date().toISOString(),
    }

    try {
      const insertPromise = db
        .insert(meetings)
        .values(meetingPayload)
        .returning()

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Neon insert timeout")), 4000)
      )

      const [row] = await Promise.race([insertPromise, timeoutPromise])
      if (row) {
        createdRecord = mapDbMeetingToFrontend(row)
      }
    } catch (dbErr) {
      console.warn("Neon insert warning, saving to local store:", (dbErr as Error).message)
    }

    // Update in-memory fallback
    const existingIndex = meetingsStore.findIndex((m) => m.id === createdRecord.id)
    if (existingIndex >= 0) {
      meetingsStore[existingIndex] = createdRecord
    } else {
      meetingsStore.push(createdRecord)
    }

    return NextResponse.json({
      success: true,
      data: createdRecord,
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
 * Update an existing meeting in Neon Postgres
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

    const meetingId = String(body.id)
    const updateData: Partial<typeof meetings.$inferInsert> = {}
    if (body.title !== undefined) updateData.title = String(body.title).trim()
    if (body.tehranTime !== undefined) updateData.tehranTime = String(body.tehranTime).trim()
    if (body.durationMins !== undefined) updateData.durationMins = Number(body.durationMins)
    if (body.platform !== undefined) updateData.platform = body.platform
    if (body.meetUrl !== undefined) updateData.meetUrl = String(body.meetUrl).trim()
    if (body.agenda !== undefined) updateData.agenda = String(body.agenda).trim()
    if (body.attendees !== undefined) updateData.attendees = String(body.attendees).trim()
    if (body.notifyBeforeMins !== undefined) updateData.notifyBeforeMins = Number(body.notifyBeforeMins)
    if (body.isActive !== undefined) updateData.isActive = Boolean(body.isActive)

    let updatedRecord: FrontendMeeting | null = null

    try {
      const updatePromise = db
        .update(meetings)
        .set(updateData)
        .where(eq(meetings.id, meetingId))
        .returning()

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Neon update timeout")), 4000)
      )

      const [row] = await Promise.race([updatePromise, timeoutPromise])
      if (row) {
        updatedRecord = mapDbMeetingToFrontend(row)
      }
    } catch (dbErr) {
      console.warn("Neon update warning:", (dbErr as Error).message)
    }

    const index = meetingsStore.findIndex((m) => m.id === meetingId)
    if (index >= 0) {
      meetingsStore[index] = {
        ...meetingsStore[index],
        ...body,
        id: meetingId,
      }
      if (!updatedRecord) {
        updatedRecord = meetingsStore[index]
      }
    }

    return NextResponse.json({
      success: true,
      data: updatedRecord,
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
 * Delete a meeting from Neon Postgres
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

    try {
      const deletePromise = db.delete(meetings).where(eq(meetings.id, id))
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Neon delete timeout")), 4000)
      )
      await Promise.race([deletePromise, timeoutPromise])
    } catch (dbErr) {
      console.warn("Neon delete warning:", (dbErr as Error).message)
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
