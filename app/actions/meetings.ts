"use server"

import { revalidatePath } from "next/cache"
import { db } from "@/lib/db"
import { meetings } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import {
  mapDbMeetingToFrontend,
  INITIAL_MEETINGS,
  type FrontendMeeting,
} from "@/app/api/meetings/route"

export async function fetchServerMeetings(): Promise<FrontendMeeting[]> {
  try {
    const queryPromise = db.select().from(meetings).orderBy(asc(meetings.tehranTime))
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Timeout")), 3000)
    )
    const rows = await Promise.race([queryPromise, timeoutPromise])
    if (rows && rows.length > 0) {
      return rows.map(mapDbMeetingToFrontend)
    }
  } catch (err) {
    console.warn("fetchServerMeetings DB fallback:", (err as Error).message)
  }
  return INITIAL_MEETINGS
}

export async function saveMeetingAction(
  meeting: Partial<FrontendMeeting>
): Promise<{ success: boolean; data?: FrontendMeeting; error?: string }> {
  try {
    if (!meeting.title || !meeting.tehranTime) {
      return { success: false, error: "Title and Tehran time are required." }
    }

    const meetingId = meeting.id || `meet-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`
    const isUpdate = !!meeting.id

    if (isUpdate) {
      const updateData: Partial<typeof meetings.$inferInsert> = {}
      if (meeting.title !== undefined) updateData.title = String(meeting.title).trim()
      if (meeting.tehranTime !== undefined) updateData.tehranTime = String(meeting.tehranTime).trim()
      if (meeting.durationMins !== undefined) updateData.durationMins = Number(meeting.durationMins)
      if (meeting.platform !== undefined) updateData.platform = meeting.platform
      if (meeting.meetUrl !== undefined) updateData.meetUrl = String(meeting.meetUrl).trim()
      if (meeting.agenda !== undefined) updateData.agenda = String(meeting.agenda).trim()
      if (meeting.attendees !== undefined) updateData.attendees = String(meeting.attendees).trim()
      if (meeting.notifyBeforeMins !== undefined) updateData.notifyBeforeMins = Number(meeting.notifyBeforeMins)
      if (meeting.isActive !== undefined) updateData.isActive = Boolean(meeting.isActive)

      const [updated] = await db
        .update(meetings)
        .set(updateData)
        .where(eq(meetings.id, meetingId))
        .returning()

      revalidatePath("/")
      return {
        success: true,
        data: updated ? mapDbMeetingToFrontend(updated) : undefined,
      }
    } else {
      const insertData = {
        id: meetingId,
        title: String(meeting.title).trim(),
        tehranTime: String(meeting.tehranTime).trim(),
        durationMins: Number(meeting.durationMins) || 30,
        platform: (meeting.platform as FrontendMeeting["platform"]) || "Google Meet",
        meetUrl: meeting.meetUrl?.trim() || "https://meet.google.com/new",
        agenda: meeting.agenda?.trim() || "Engineering sync",
        attendees: meeting.attendees?.trim() || "Frontend Squad",
        notifyBeforeMins: Number(meeting.notifyBeforeMins) || 5,
        isActive: meeting.isActive !== false,
      }

      const [created] = await db
        .insert(meetings)
        .values(insertData)
        .returning()

      revalidatePath("/")
      return {
        success: true,
        data: created ? mapDbMeetingToFrontend(created) : undefined,
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save meeting"
    return { success: false, error: message }
  }
}

export async function deleteMeetingAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await db.delete(meetings).where(eq(meetings.id, id))
    revalidatePath("/")
    return { success: true }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete meeting"
    return { success: false, error: message }
  }
}
