import { NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { desc } from "drizzle-orm"

export const dynamic = "force-dynamic"

function toSafeIso(dateVal: unknown): string {
  if (!dateVal) return new Date().toISOString()
  if (dateVal instanceof Date) return dateVal.toISOString()
  if (typeof dateVal === "string") return dateVal
  try {
    return new Date(String(dateVal)).toISOString()
  } catch {
    return new Date().toISOString()
  }
}

export async function GET() {
  try {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt))
    const formatted = rows.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar || "👤",
      role: u.role || "viewer",
      createdAt: toSafeIso(u.createdAt),
    }))

    return NextResponse.json({
      success: true,
      count: formatted.length,
      users: formatted,
    })
  } catch (error) {
    console.error("GET /api/users error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch users",
        users: [],
      },
      { status: 500 }
    )
  }
}
