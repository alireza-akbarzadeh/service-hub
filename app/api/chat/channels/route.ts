import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { chatChannels, type ChatChannel as DbChatChannel } from "@/lib/db/schema"
import { asc } from "drizzle-orm"
import { INITIAL_CHANNELS, type ChatChannel } from "@/lib/chat-data"

// In-memory fallback cache
let channelsStore: ChatChannel[] = [...INITIAL_CHANNELS]

function mapDbToChannel(row: DbChatChannel): ChatChannel {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description || "",
    topic: row.topic || "",
    category: (row.category as ChatChannel["category"]) || "general",
    icon: row.icon || "Hash",
    isDefault: row.isDefault,
    createdAt: row.createdAt ? new Date(row.createdAt).toISOString() : new Date().toISOString(),
  }
}

/**
 * GET /api/chat/channels
 * Returns all chat channels from Neon Postgres with in-memory fallback
 */
export async function GET() {
  try {
    const queryPromise = db.select().from(chatChannels).orderBy(asc(chatChannels.createdAt))
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Neon channels timeout")), 3500)
    )
    const rows = await Promise.race([queryPromise, timeoutPromise])

    if (rows && rows.length > 0) {
      const liveChannels = rows.map(mapDbToChannel)
      channelsStore = liveChannels
      return NextResponse.json({
        success: true,
        data: liveChannels,
        source: "neon",
      })
    }

    // Seed defaults if empty
    try {
      for (const ch of INITIAL_CHANNELS) {
        await db.insert(chatChannels).values({
          id: ch.id,
          name: ch.name,
          slug: ch.slug,
          description: ch.description,
          topic: ch.topic,
          category: ch.category,
          icon: ch.icon,
          isDefault: ch.isDefault,
        })
      }
    } catch {
      // Ignore seed conflict
    }

    return NextResponse.json({
      success: true,
      data: channelsStore,
      source: "initial",
    })
  } catch (error) {
    console.warn("Neon channels fetch fallback to memory:", error)
    return NextResponse.json({
      success: true,
      data: channelsStore,
      source: "memory_fallback",
    })
  }
}

/**
 * POST /api/chat/channels
 * Creates a new channel
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description = "", topic = "", category = "general", icon = "Hash" } = body

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "Channel name is required" },
        { status: 400 }
      )
    }

    const cleanName = name.trim().toLowerCase().replace(/[^a-z0-9-_]/g, "-")
    const cleanSlug = cleanName.replace(/^-+|-+$/g, "") || `chan-${Date.now().toString(36)}`
    const channelId = cleanSlug

    // Check existing
    const exists = channelsStore.some((c) => c.id === channelId || c.slug === cleanSlug)
    if (exists) {
      return NextResponse.json(
        { success: false, error: `Channel #${cleanSlug} already exists` },
        { status: 409 }
      )
    }

    const newChannel: ChatChannel = {
      id: channelId,
      name: cleanSlug,
      slug: cleanSlug,
      description: description.trim() || `Channel for #${cleanSlug} discussions`,
      topic: topic.trim() || `Welcome to #${cleanSlug}!`,
      category: category as ChatChannel["category"],
      icon: icon || "Hash",
      isDefault: false,
      createdAt: new Date().toISOString(),
    }

    // Add to in-memory store
    channelsStore.push(newChannel)

    // Save to Neon DB
    try {
      await db.insert(chatChannels).values({
        id: newChannel.id,
        name: newChannel.name,
        slug: newChannel.slug,
        description: newChannel.description,
        topic: newChannel.topic,
        category: newChannel.category,
        icon: newChannel.icon,
        isDefault: newChannel.isDefault,
      })
    } catch (dbErr) {
      console.warn("Neon channel insert warning:", dbErr)
    }

    return NextResponse.json({
      success: true,
      data: newChannel,
    })
  } catch (error) {
    console.error("Failed to create channel:", error)
    return NextResponse.json(
      { success: false, error: "Failed to create channel" },
      { status: 500 }
    )
  }
}
