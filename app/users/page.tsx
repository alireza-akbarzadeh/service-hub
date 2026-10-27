import { verifySession } from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { desc } from "drizzle-orm"
import { UsersManagementView } from "@/components/users/users-management-view"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Access Management & Users · Services Catalog",
  description:
    "Manage team members, roles (Admin/Developer/Viewer), and Google/Gmail authentication.",
}

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

export default async function UsersPage() {
  const session = await verifySession()

  let initialUsers: Array<{
    id: string
    name: string
    username: string
    email: string
    avatar: string
    role: string
    createdAt: string
  }> = []

  try {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt))
    initialUsers = rows.map((u) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      avatar: u.avatar || "👤",
      role: u.role || "viewer",
      createdAt: toSafeIso(u.createdAt),
    }))
  } catch (err) {
    console.error("Server fetch users error:", err)
  }

  return (
    <UsersManagementView
      currentUser={session.user}
      initialUsers={initialUsers}
    />
  )
}
