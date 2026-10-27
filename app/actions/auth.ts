"use server"

import {
  registerUser,
  loginUser,
  loginWithGoogleDemo,
  logoutUser,
  verifySession,
  type SessionUser,
} from "@/lib/auth"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { revalidatePath } from "next/cache"

export async function registerAction(formData: {
  name: string
  username: string
  email: string
  password: string
  avatar?: string
  role?: "admin" | "developer" | "viewer"
}) {
  const result = await registerUser(formData)
  if (result.success) {
    revalidatePath("/")
    revalidatePath("/chat")
  }
  return result
}

export async function loginUserAction(formData: {
  identifier: string
  password: string
}) {
  const result = await loginUser(formData)
  if (result.success) {
    revalidatePath("/")
    revalidatePath("/chat")
  }
  return result
}

export async function googleLoginAction(input?: {
  email?: string
  name?: string
  avatar?: string
}) {
  const result = await loginWithGoogleDemo(input)
  if (result.success) {
    revalidatePath("/")
    revalidatePath("/chat")
  }
  return result
}

export async function logoutUserAction() {
  await logoutUser()
  revalidatePath("/")
  revalidatePath("/chat")
}

export async function getCurrentUserAction(): Promise<{
  isAuthenticated: boolean
  user?: SessionUser
}> {
  const session = await verifySession()
  return {
    isAuthenticated: session.isAuthenticated,
    user: session.user,
  }
}

export async function listUsersAction(): Promise<{
  success: boolean
  users: Array<{
    id: string
    name: string
    username: string
    email: string
    avatar: string
    role: string
    createdAt: string
  }>
}> {
  const session = await verifySession()
  if (!session.isAuthenticated) {
    return { success: false, users: [] }
  }

  try {
    const rows = await db.select().from(users).orderBy(desc(users.createdAt))
    return {
      success: true,
      users: rows.map((u) => ({
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        role: u.role,
        createdAt: u.createdAt.toISOString(),
      })),
    }
  } catch (err) {
    console.warn("Neon list users error, returning current session:", err)
    if (session.user) {
      return {
        success: true,
        users: [
          {
            id: session.user.id,
            name: session.user.name,
            username: session.user.username,
            email: session.user.email,
            avatar: session.user.avatar,
            role: session.user.role,
            createdAt: new Date().toISOString(),
          },
        ],
      }
    }
    return { success: false, users: [] }
  }
}

export async function updateUserRoleAction(userId: string, newRole: "admin" | "developer" | "viewer") {
  const session = await verifySession()
  if (!session.isAuthenticated) {
    return { success: false, error: "Authentication required. Please log in first." }
  }

  try {
    await db.update(users).set({ role: newRole }).where(eq(users.id, userId))
    revalidatePath("/")
    revalidatePath("/users")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Failed to update role in database." }
  }
}

export async function deleteUserAction(userId: string) {
  const session = await verifySession()
  if (!session.isAuthenticated) {
    return { success: false, error: "Authentication required." }
  }
  if (session.user && session.user.role !== "admin") {
    return { success: false, error: "Only administrators can remove user accounts." }
  }

  try {
    await db.delete(users).where(eq(users.id, userId))
    revalidatePath("/")
    revalidatePath("/users")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Failed to delete user from database." }
  }
}
