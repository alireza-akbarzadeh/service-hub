"use server"

import { revalidatePath } from "next/cache"
import type { FrontendMeeting } from "@/app/api/meetings/route"

export async function fetchServerMeetings(): Promise<FrontendMeeting[]> {
  try {
    const res = await fetch("http://localhost:3000/api/meetings", {
      cache: "no-store",
    })
    if (!res.ok) return []
    const json = await res.json()
    return json.data || []
  } catch {
    return []
  }
}

export async function saveMeetingAction(
  meeting: Partial<FrontendMeeting>
): Promise<{ success: boolean; data?: FrontendMeeting; error?: string }> {
  try {
    const isUpdate = !!meeting.id
    const method = isUpdate ? "PUT" : "POST"

    const res = await fetch("http://localhost:3000/api/meetings", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meeting),
    })

    const json = await res.json()
    revalidatePath("/")
    return json
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to save meeting"
    return { success: false, error: message }
  }
}

export async function deleteMeetingAction(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch(`http://localhost:3000/api/meetings?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    })
    const json = await res.json()
    revalidatePath("/")
    return json
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to delete meeting"
    return { success: false, error: message }
  }
}
