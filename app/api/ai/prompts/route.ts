import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { aiPrompts } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { DEVELOPER_PROMPTS, type PromptTemplate } from "@/components/dev-tools/ai-catalog/ai-tools-data"
import { verifySession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await db.select().from(aiPrompts).orderBy(desc(aiPrompts.createdAt))

    // Seed defaults if empty
    if (rows.length === 0) {
      for (let i = 0; i < DEVELOPER_PROMPTS.length; i++) {
        const item = DEVELOPER_PROMPTS[i]
        await db.insert(aiPrompts).values({
          id: item.id || `prompt_seed_${i + 1}`,
          title: item.title,
          category: item.category,
          prompt: item.prompt,
          bestModel: item.bestModel,
          tags: JSON.stringify(item.tags || []),
          createdBy: "Platform Team",
        }).onConflictDoNothing()
      }

      const seeded = await db.select().from(aiPrompts).orderBy(desc(aiPrompts.createdAt))
      return NextResponse.json({
        success: true,
        count: seeded.length,
        prompts: seeded.map(mapRowToPrompt),
      })
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      prompts: rows.map(mapRowToPrompt),
    })
  } catch (error) {
    console.error("GET /api/ai/prompts error, returning fallback:", error)
    return NextResponse.json({
      success: true,
      count: DEVELOPER_PROMPTS.length,
      prompts: DEVELOPER_PROMPTS,
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = body.id?.trim() || `prompt_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const title = String(body.title || "").trim()
    const category = String(body.category || "Full-Stack").trim()
    const prompt = String(body.prompt || "").trim()
    const bestModel = String(body.bestModel || "Claude 3.7 Sonnet / Cursor").trim()

    let tagsArray: string[] = []
    if (Array.isArray(body.tags)) {
      tagsArray = body.tags
    } else if (typeof body.tags === "string") {
      try {
        tagsArray = JSON.parse(body.tags)
      } catch {
        tagsArray = body.tags.split(",").map((s: string) => s.trim()).filter(Boolean)
      }
    }

    if (!title || !prompt) {
      return NextResponse.json(
        { success: false, error: "Title and Prompt content are required" },
        { status: 400 }
      )
    }

    let creatorName = "Team Member"
    try {
      const session = await verifySession()
      if (session.user?.name) {
        creatorName = session.user.name
      }
    } catch {
      // ignore
    }

    await db
      .insert(aiPrompts)
      .values({
        id,
        title,
        category,
        prompt,
        bestModel,
        tags: JSON.stringify(tagsArray),
        createdBy: creatorName,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiPrompts.id,
        set: {
          title,
          category,
          prompt,
          bestModel,
          tags: JSON.stringify(tagsArray),
          updatedAt: new Date(),
        },
      })

    return NextResponse.json({
      success: true,
      message: `Prompt '${title}' saved successfully.`,
      prompt: {
        id,
        title,
        category,
        prompt,
        bestModel,
        tags: tagsArray,
        createdBy: creatorName,
      },
    })
  } catch (error) {
    console.error("POST /api/ai/prompts error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save prompt",
      },
      { status: 500 }
    )
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { success: false, error: "Prompt ID is required" },
        { status: 400 }
      )
    }

    await db.delete(aiPrompts).where(eq(aiPrompts.id, id))
    return NextResponse.json({
      success: true,
      message: "Prompt deleted successfully",
    })
  } catch (error) {
    console.error("DELETE /api/ai/prompts error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete prompt",
      },
      { status: 500 }
    )
  }
}

function mapRowToPrompt(row: typeof aiPrompts.$inferSelect): PromptTemplate {
  let parsedTags: string[] = []
  try {
    parsedTags = JSON.parse(row.tags || "[]")
  } catch {
    parsedTags = []
  }

  return {
    id: row.id,
    title: row.title,
    category: row.category,
    prompt: row.prompt,
    bestModel: row.bestModel,
    tags: parsedTags,
    createdBy: row.createdBy || undefined,
    createdAt: row.createdAt ? (row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt)) : undefined,
  }
}
