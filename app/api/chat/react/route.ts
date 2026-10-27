import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatMessages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: Request) {
  try {
    const { messageId, emoji, senderId } = await request.json()

    if (!messageId || !emoji || !senderId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Try finding in Neon DB
    let reactions: Record<string, string[]> = {}

    try {
      const rows = await db
        .select()
        .from(chatMessages)
        .where(eq(chatMessages.id, messageId))
        .limit(1)

      if (rows && rows.length > 0) {
        const row = rows[0]
        try {
          reactions =
            typeof row.reactions === "string"
              ? JSON.parse(row.reactions)
              : row.reactions || {}
        } catch {
          reactions = {}
        }

        const userList = reactions[emoji] || []
        const hasReacted = userList.includes(senderId)

        if (hasReacted) {
          // Remove reaction
          reactions[emoji] = userList.filter((id) => id !== senderId)
          if (reactions[emoji].length === 0) {
            delete reactions[emoji]
          }
        } else {
          // Add reaction
          reactions[emoji] = [...userList, senderId]
        }

        await db
          .update(chatMessages)
          .set({ reactions: JSON.stringify(reactions) })
          .where(eq(chatMessages.id, messageId))

        return NextResponse.json({
          success: true,
          reactions,
        })
      }
    } catch (err) {
      console.warn("Neon react update warning:", err)
    }

    return NextResponse.json({
      success: true,
      reactions,
    })
  } catch (error) {
    console.error("Failed to react to message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to react" },
      { status: 500 }
    )
  }
}
