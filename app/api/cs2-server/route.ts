import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { appSettings, chatMessages } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { verifySession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export interface Cs2ServerConfig {
  address: string
  targetTime: string // "17:10" (5:10 PM)
  title: string
  notes?: string
  updatedBy?: string
  updatedAt?: string
}

const DEFAULT_CONFIG: Cs2ServerConfig = {
  address: "172.24.129.12",
  targetTime: "17:10",
  title: "Daily CS2 Squad Match",
  notes: "Office 5v5 Casual / Competitive • Dust II & Mirage",
  updatedBy: "System",
  updatedAt: new Date().toISOString(),
}

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(appSettings)
      .where(eq(appSettings.key, "cs2_server"))
      .limit(1)

    if (rows.length > 0 && rows[0].value) {
      const parsed: Cs2ServerConfig = JSON.parse(rows[0].value)
      return NextResponse.json({
        success: true,
        config: {
          ...DEFAULT_CONFIG,
          ...parsed,
          updatedBy: rows[0].updatedBy || parsed.updatedBy || "Team",
          updatedAt: rows[0].updatedAt
            ? rows[0].updatedAt instanceof Date
              ? rows[0].updatedAt.toISOString()
              : String(rows[0].updatedAt)
            : parsed.updatedAt || new Date().toISOString(),
        },
      })
    }

    // Default if not initialized
    return NextResponse.json({
      success: true,
      config: DEFAULT_CONFIG,
    })
  } catch (error) {
    console.warn("Failed to get cs2 config from DB, returning default:", error)
    return NextResponse.json({
      success: true,
      config: DEFAULT_CONFIG,
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const address = String(body.address || "172.24.129.12").trim()
    const targetTime = String(body.targetTime || "17:10").trim()
    const title = String(body.title || "Daily CS2 Squad Match").trim()
    const notes = String(body.notes || "").trim()

    let updaterName = body.updatedBy || "Team Member"
    try {
      const session = await verifySession()
      if (session.user?.name) {
        updaterName = session.user.name
      }
    } catch {
      // ignore
    }

    const newConfig: Cs2ServerConfig = {
      address,
      targetTime,
      title,
      notes,
      updatedBy: updaterName,
      updatedAt: new Date().toISOString(),
    }

    // Upsert into app_settings
    await db
      .insert(appSettings)
      .values({
        key: "cs2_server",
        value: JSON.stringify(newConfig),
        updatedBy: updaterName,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: appSettings.key,
        set: {
          value: JSON.stringify(newConfig),
          updatedBy: updaterName,
          updatedAt: new Date(),
        },
      })

    // Optionally post a system chat announcement to the general channel
    try {
      await db.insert(chatMessages).values({
        id: `cs2_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        channelId: "general",
        senderId: "system_cs2",
        senderName: "CS2 Match Coordinator",
        senderAvatar: "🎮",
        senderColor: "#f59e0b",
        senderUsername: "cs2_bot",
        isAnonymous: false,
        content: `🚨 **CS2 Server Address Updated!**\nNew server: \`connect ${address}\`\nMatch starts at **${targetTime} (5:10 PM)**!\nUpdated by **${updaterName}**. Get your game ready! 🎯`,
        type: "system",
        reactions: "{}",
        replyTo: null,
      })
    } catch (chatErr) {
      console.warn("Could not post system chat message for CS2 update:", chatErr)
    }

    return NextResponse.json({
      success: true,
      message: "CS2 Server address updated and notification pushed to team!",
      config: newConfig,
    })
  } catch (error) {
    console.error("POST /api/cs2-server error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to update CS2 server",
      },
      { status: 500 }
    )
  }
}
