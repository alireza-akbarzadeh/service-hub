import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { aiTools } from "@/lib/db/schema"
import { desc, eq } from "drizzle-orm"
import { AI_DEVELOPER_TOOLS, type AiToolItem } from "@/components/dev-tools/ai-catalog/ai-tools-data"
import { verifySession } from "@/lib/auth"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const rows = await db.select().from(aiTools).orderBy(desc(aiTools.createdAt))

    // If table is completely empty, seed the initial curated tools
    if (rows.length === 0) {
      for (const item of AI_DEVELOPER_TOOLS) {
        await db.insert(aiTools).values({
          id: item.id,
          name: item.name,
          tagline: item.tagline,
          category: item.category,
          categoryLabel: item.categoryLabel,
          url: item.url,
          pricing: item.pricing,
          iconBg: item.iconBg,
          bestFor: JSON.stringify(item.bestFor || []),
          description: item.description,
          workflowTips: item.workflowTips || "",
          quickCommand: item.quickCommand || null,
          setupInstructions: item.setupInstructions || `# ${item.name} Setup Guide\n\nVisit [${item.name}](${item.url}) to get started.\n\n### Workflow Tips\n${item.workflowTips}`,
          createdBy: "Platform Team",
        }).onConflictDoNothing()
      }

      // Re-read seeded rows
      const seeded = await db.select().from(aiTools).orderBy(desc(aiTools.createdAt))
      return NextResponse.json({
        success: true,
        count: seeded.length,
        tools: seeded.map(mapRowToItem),
      })
    }

    return NextResponse.json({
      success: true,
      count: rows.length,
      tools: rows.map(mapRowToItem),
    })
  } catch (error) {
    console.error("GET /api/ai/tools error, returning in-memory fallback:", error)
    return NextResponse.json({
      success: true,
      count: AI_DEVELOPER_TOOLS.length,
      tools: AI_DEVELOPER_TOOLS,
    })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const id = body.id?.trim() || `tool_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`
    const name = String(body.name || "").trim()
    const tagline = String(body.tagline || "").trim()
    const url = String(body.url || "").trim()
    const category = String(body.category || "ide-agents")
    const categoryLabel = String(body.categoryLabel || "Custom AI Tool")
    const pricing = String(body.pricing || "Freemium")
    const iconBg = String(body.iconBg || "from-blue-600 to-indigo-600")
    const description = String(body.description || "").trim()
    const workflowTips = String(body.workflowTips || "").trim()
    const quickCommand = body.quickCommand ? String(body.quickCommand).trim() : null
    const setupInstructions = String(body.setupInstructions || "").trim()

    let bestForArray: string[] = []
    if (Array.isArray(body.bestFor)) {
      bestForArray = body.bestFor
    } else if (typeof body.bestFor === "string") {
      try {
        bestForArray = JSON.parse(body.bestFor)
      } catch {
        bestForArray = body.bestFor.split(",").map((s: string) => s.trim()).filter(Boolean)
      }
    }

    if (!name || !url) {
      return NextResponse.json(
        { success: false, error: "Name and URL are required" },
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
      .insert(aiTools)
      .values({
        id,
        name,
        tagline,
        category,
        categoryLabel,
        url,
        pricing,
        iconBg,
        bestFor: JSON.stringify(bestForArray),
        description,
        workflowTips,
        quickCommand,
        setupInstructions,
        createdBy: creatorName,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: aiTools.id,
        set: {
          name,
          tagline,
          category,
          categoryLabel,
          url,
          pricing,
          iconBg,
          bestFor: JSON.stringify(bestForArray),
          description,
          workflowTips,
          quickCommand,
          setupInstructions,
          updatedAt: new Date(),
        },
      })

    return NextResponse.json({
      success: true,
      message: `AI Tool '${name}' saved successfully.`,
      tool: {
        id,
        name,
        tagline,
        category,
        categoryLabel,
        url,
        pricing,
        iconBg,
        bestFor: bestForArray,
        description,
        workflowTips,
        quickCommand,
        setupInstructions,
        createdBy: creatorName,
      },
    })
  } catch (error) {
    console.error("POST /api/ai/tools error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to save AI tool",
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
        { success: false, error: "Tool ID is required" },
        { status: 400 }
      )
    }

    await db.delete(aiTools).where(eq(aiTools.id, id))
    return NextResponse.json({
      success: true,
      message: "AI Tool deleted successfully",
    })
  } catch (error) {
    console.error("DELETE /api/ai/tools error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to delete AI tool",
      },
      { status: 500 }
    )
  }
}

function mapRowToItem(row: typeof aiTools.$inferSelect): AiToolItem {
  let parsedBestFor: string[] = []
  try {
    parsedBestFor = JSON.parse(row.bestFor || "[]")
  } catch {
    parsedBestFor = []
  }

  return {
    id: row.id,
    name: row.name,
    tagline: row.tagline,
    category: row.category as any,
    categoryLabel: row.categoryLabel,
    url: row.url,
    pricing: row.pricing as any,
    iconBg: row.iconBg,
    bestFor: parsedBestFor,
    description: row.description,
    workflowTips: row.workflowTips,
    quickCommand: row.quickCommand || undefined,
    setupInstructions: row.setupInstructions || undefined,
    createdBy: row.createdBy || undefined,
    createdAt: row.createdAt ? (row.createdAt instanceof Date ? row.createdAt.toISOString() : String(row.createdAt)) : undefined,
  }
}
