import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatMessages, type ChatMessage as DbChatMessage } from "@/lib/db/schema"
import { asc, eq } from "drizzle-orm"
import { INITIAL_MESSAGES, type ChatMessage } from "@/lib/chat-data"

// In-memory fallback message cache (bounded to last 500 messages)
let messagesStore: ChatMessage[] = [...INITIAL_MESSAGES]

function mapDbToMessage(row: DbChatMessage): ChatMessage {
  let reactions: Record<string, string[]> = {}
  try {
    reactions = typeof row.reactions === "string" ? JSON.parse(row.reactions) : row.reactions || {}
  } catch {
    reactions = {}
  }

  let replyTo = undefined
  if (row.replyTo) {
    try {
      replyTo = typeof row.replyTo === "string" ? JSON.parse(row.replyTo) : row.replyTo
    } catch {
      replyTo = undefined
    }
  }

  return {
    id: row.id,
    channelId: row.channelId,
    senderId: row.senderId,
    senderName: row.senderName,
    senderAvatar: row.senderAvatar,
    senderColor: row.senderColor || "from-violet-500 to-purple-600",
    content: row.content,
    type: (row.type as ChatMessage["type"]) || "text",
    reactions,
    replyTo,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  }
}

/**
 * GET /api/chat/messages?channelId=...&since=...
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const channelId = searchParams.get("channelId") || "general"
  const since = searchParams.get("since")

  try {
    const queryPromise = db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.channelId, channelId))
      .orderBy(asc(chatMessages.createdAt))

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Neon messages query timeout")), 3500)
    )

    const rows = await Promise.race([queryPromise, timeoutPromise])

    if (rows && rows.length > 0) {
      let live = rows.map(mapDbToMessage)
      if (since) {
        const sinceTime = new Date(since).getTime()
        live = live.filter((m) => new Date(m.createdAt).getTime() > sinceTime)
      }
      return NextResponse.json({
        success: true,
        data: live,
        source: "neon",
      })
    }

    // If channel is initial and db empty for it, seed initial messages
    const channelInitial = INITIAL_MESSAGES.filter((m) => m.channelId === channelId)
    if (channelInitial.length > 0) {
      try {
        for (const m of channelInitial) {
          await db.insert(chatMessages).values({
            id: m.id,
            channelId: m.channelId,
            senderId: m.senderId,
            senderName: m.senderName,
            senderAvatar: m.senderAvatar,
            senderColor: m.senderColor,
            content: m.content,
            type: m.type,
            reactions: JSON.stringify(m.reactions),
          })
        }
      } catch {
        // Ignore seed conflict
      }
    }

    let result = messagesStore.filter((m) => m.channelId === channelId)
    if (since) {
      const sinceTime = new Date(since).getTime()
      result = result.filter((m) => new Date(m.createdAt).getTime() > sinceTime)
    }

    return NextResponse.json({
      success: true,
      data: result,
      source: "initial_memory",
    })
  } catch (err) {
    console.warn("Neon messages query fallback to memory:", err)
    let result = messagesStore.filter((m) => m.channelId === channelId)
    if (since) {
      const sinceTime = new Date(since).getTime()
      result = result.filter((m) => new Date(m.createdAt).getTime() > sinceTime)
    }

    return NextResponse.json({
      success: true,
      data: result,
      source: "memory_fallback",
    })
  }
}

/**
 * POST /api/chat/messages
 * Send message
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      channelId = "general",
      senderId,
      senderName,
      senderAvatar,
      senderColor = "from-violet-500 to-purple-600",
      content,
      type = "text",
      replyTo,
    } = body

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Message content cannot be empty" },
        { status: 400 }
      )
    }

    const newMessage: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      channelId,
      senderId: senderId || "anon_unknown",
      senderName: senderName || "Anonymous User",
      senderAvatar: senderAvatar || "🎭",
      senderColor,
      content: content.trim(),
      type: type || "text",
      reactions: {},
      replyTo: replyTo || undefined,
      createdAt: new Date().toISOString(),
    }

    // Save in memory store
    messagesStore.push(newMessage)
    if (messagesStore.length > 1000) {
      messagesStore = messagesStore.slice(-1000)
    }

    // Save to Neon DB
    try {
      await db.insert(chatMessages).values({
        id: newMessage.id,
        channelId: newMessage.channelId,
        senderId: newMessage.senderId,
        senderName: newMessage.senderName,
        senderAvatar: newMessage.senderAvatar,
        senderColor: newMessage.senderColor,
        content: newMessage.content,
        type: newMessage.type,
        reactions: JSON.stringify(newMessage.reactions),
        replyTo: newMessage.replyTo ? JSON.stringify(newMessage.replyTo) : null,
      })
    } catch (dbErr) {
      console.warn("Neon message insert warning:", dbErr)
    }

    return NextResponse.json({
      success: true,
      data: newMessage,
    })
  } catch (error) {
    console.error("Failed to post message:", error)
    return NextResponse.json(
      { success: false, error: "Failed to post message" },
      { status: 500 }
    )
  }
}
