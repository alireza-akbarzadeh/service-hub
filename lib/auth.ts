import { cookies } from "next/headers"
import crypto from "crypto"
import { db } from "@/lib/db"
import { users, type User } from "@/lib/db/schema"
import { eq, or } from "drizzle-orm"

const COOKIE_NAME = "team_catalog_session"

export interface SessionUser {
  id: string
  name: string
  username: string
  email: string
  avatar: string
  role: "admin" | "developer" | "viewer"
}

// In-memory fallback user store when Neon is offline
let memoryUsersStore: User[] = [
  {
    id: "usr_admin",
    name: "Ali Akbarzadeh",
    username: "ali_akbarzadeh",
    email: "akbarzadeh.ali@gmail.com",
    passwordHash:
      "f8a3d1b9c2e4:b37e0e7a78e727e4e1a0d8e8b6b1464b1f41b3a324a18776822452eb8c27a9221199732d8471b0aa447385d8e7e17441bbd9c9a63e8a719c817291a13b49e156",
    avatar: "👨‍💻",
    role: "admin",
    bio: "Lead Frontend Engineer",
    createdAt: new Date(),
    updatedAt: new Date(),
  },
]

function getSecret() {
  return process.env.AUTH_SECRET || "services-catalog-auth-secret-key-321"
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex")
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex")
  return `${salt}:${hash}`
}

export function verifyPassword(password: string, storedHash: string): boolean {
  try {
    const [salt, originalHash] = storedHash.split(":")
    if (!salt || !originalHash) return false
    const hash = crypto
      .pbkdf2Sync(password, salt, 1000, 64, "sha512")
      .toString("hex")
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(originalHash))
  } catch {
    return false
  }
}

function createSignedToken(payload: {
  user?: SessionUser
  teamName?: string
  exp: number
}): string {
  const jsonStr = JSON.stringify(payload)
  const base64Payload = Buffer.from(jsonStr).toString("base64url")
  const hmac = crypto.createHmac("sha256", getSecret())
  hmac.update(base64Payload)
  const signature = hmac.digest("base64url")
  return `${base64Payload}.${signature}`
}

export async function setAuthSession(sessionData: {
  user?: SessionUser
  teamName?: string
}): Promise<void> {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30 // 30 days
  const token = createSignedToken({ ...sessionData, exp })
  const cookieStore = await cookies()

  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  })
}

export async function verifySession(): Promise<{
  isAuthenticated: boolean
  user?: SessionUser
  teamName?: string
}> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get(COOKIE_NAME)?.value
    if (!token) {
      return { isAuthenticated: false }
    }

    // Support new signed format: base64url.signature
    if (token.includes(".")) {
      const [base64Payload, signature] = token.split(".")
      if (!base64Payload || !signature) {
        return { isAuthenticated: false }
      }

      const expectedSignature = crypto
        .createHmac("sha256", getSecret())
        .update(base64Payload)
        .digest("base64url")

      if (
        crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )
      ) {
        const decodedStr = Buffer.from(base64Payload, "base64url").toString()
        const payload = JSON.parse(decodedStr)
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
          return { isAuthenticated: false }
        }
        return {
          isAuthenticated: true,
          user: payload.user,
          teamName: payload.teamName || payload.user?.name,
        }
      }
    } else if (token.includes(":")) {
      // Legacy format teamName:signature
      const [teamName, signature] = token.split(":")
      const expectedSignature = crypto
        .createHmac("sha256", getSecret())
        .update(teamName.toLowerCase())
        .digest("hex")

      if (
        crypto.timingSafeEqual(
          Buffer.from(signature),
          Buffer.from(expectedSignature)
        )
      ) {
        return {
          isAuthenticated: true,
          teamName,
          user: {
            id: `usr_${teamName}`,
            name: teamName,
            username: teamName.toLowerCase().replace(/\s+/g, "_"),
            email: `${teamName.toLowerCase()}@services.internal`,
            avatar: "👥",
            role: "developer",
          },
        }
      }
    }
  } catch (error) {
    console.error("Session verification error:", error)
  }
  return { isAuthenticated: false }
}

/**
 * Register a new user with Name, Username, Email, Password, and Avatar
 */
export async function registerUser(input: {
  name: string
  username: string
  email: string
  password: string
  avatar?: string
  role?: "admin" | "developer" | "viewer"
}): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  const name = input.name?.trim()
  const username = input.username?.trim().toLowerCase().replace(/^@/, "")
  const email = input.email?.trim().toLowerCase()
  const password = input.password?.trim()
  const avatar = input.avatar?.trim() || "👤"
  const role = input.role || "developer"

  if (!name || name.length < 2) {
    return { success: false, error: "Please enter your full name (at least 2 characters)." }
  }

  if (!username || !/^[a-zA-Z0-9_]{3,30}$/.test(username)) {
    return {
      success: false,
      error: "Username must be 3-30 characters (letters, numbers, underscores only).",
    }
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address (e.g. Gmail)." }
  }

  if (!password || password.length < 6) {
    return { success: false, error: "Password must be at least 6 characters long." }
  }

  const passwordHash = hashPassword(password)
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`

  const newUserRow: User = {
    id: newId,
    name,
    username,
    email,
    passwordHash,
    avatar,
    role,
    bio: "",
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  // Check Neon DB first
  try {
    const existing = await db
      .select()
      .from(users)
      .where(or(eq(users.username, username), eq(users.email, email)))

    if (existing && existing.length > 0) {
      const match = existing[0]
      if (match.username === username) {
        return { success: false, error: `Username @${username} is already taken.` }
      }
      if (match.email === email) {
        return { success: false, error: `An account with ${email} already exists.` }
      }
    }

    await db.insert(users).values(newUserRow)
  } catch (dbErr) {
    console.warn("Neon user check/insert error, falling back to memory:", dbErr)
    const memConflict = memoryUsersStore.find(
      (u) => u.username === username || u.email === email
    )
    if (memConflict) {
      return { success: false, error: "Username or email is already registered." }
    }
    memoryUsersStore.push(newUserRow)
  }

  const sessionUser: SessionUser = {
    id: newId,
    name,
    username,
    email,
    avatar,
    role,
  }

  await setAuthSession({ user: sessionUser, teamName: name })

  return { success: true, user: sessionUser }
}

/**
 * Login user using Email or Username + Password, or legacy team name
 */
export async function loginUser(input: {
  identifier: string // email or username or teamName
  password: string
}): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  const idLower = input.identifier?.trim().toLowerCase().replace(/^@/, "")
  const password = input.password?.trim()

  if (!idLower || !password) {
    return { success: false, error: "Please enter your username/email and password." }
  }

  // 1. Try DB user match
  try {
    const rows = await db
      .select()
      .from(users)
      .where(or(eq(users.username, idLower), eq(users.email, idLower)))

    if (rows && rows.length > 0) {
      const user = rows[0]
      const isValid = verifyPassword(password, user.passwordHash)
      if (isValid) {
        const sessionUser: SessionUser = {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          role: (user.role as SessionUser["role"]) || "developer",
        }
        await setAuthSession({ user: sessionUser, teamName: user.name })
        return { success: true, user: sessionUser }
      } else {
        return { success: false, error: "Incorrect password. Please try again." }
      }
    }
  } catch (err) {
    console.warn("Neon user query fallback:", err)
  }

  // 2. Check memory store
  const memUser = memoryUsersStore.find(
    (u) => u.username === idLower || u.email === idLower
  )
  if (memUser) {
    if (verifyPassword(password, memUser.passwordHash)) {
      const sessionUser: SessionUser = {
        id: memUser.id,
        name: memUser.name,
        username: memUser.username,
        email: memUser.email,
        avatar: memUser.avatar,
        role: (memUser.role as SessionUser["role"]) || "developer",
      }
      await setAuthSession({ user: sessionUser, teamName: memUser.name })
      return { success: true, user: sessionUser }
    }
  }

  // 3. Fallback: Check legacy team credentials for backward compatibility
  const expectedTeam = (process.env.AUTH_TEAM_NAME || "frontend_team")
    .trim()
    .toLowerCase()
  const expectedPass = process.env.AUTH_TEAM_PASSWORD || "Aa.13741995!!"

  if (idLower === expectedTeam && password === expectedPass) {
    const sessionUser: SessionUser = {
      id: "usr_frontend_team",
      name: "Frontend Squad",
      username: "frontend_team",
      email: "frontend_team@services.internal",
      avatar: "👥",
      role: "admin",
    }
    await setAuthSession({ user: sessionUser, teamName: "Frontend Squad" })
    return { success: true, user: sessionUser }
  }

  return {
    success: false,
    error: "Invalid username, email, or password. Please verify your credentials.",
  }
}

/**
 * One-click Google / Gmail sign in
 */
export async function loginWithGoogleDemo(input?: {
  email?: string
  name?: string
  avatar?: string
}): Promise<{ success: boolean; error?: string; user?: SessionUser }> {
  const email = (input?.email || "user@gmail.com").toLowerCase().trim()
  const name = input?.name || email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
  const username = email.split("@")[0].replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase()
  const avatar = input?.avatar || "🌐"

  let sessionUser: SessionUser = {
    id: `usr_google_${Date.now()}`,
    name,
    username,
    email,
    avatar,
    role: "developer",
  }

  try {
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, email))

    if (existing && existing.length > 0) {
      const u = existing[0]
      sessionUser = {
        id: u.id,
        name: u.name,
        username: u.username,
        email: u.email,
        avatar: u.avatar,
        role: (u.role as SessionUser["role"]) || "developer",
      }
    } else {
      await db.insert(users).values({
        id: sessionUser.id,
        name: sessionUser.name,
        username: sessionUser.username,
        email: sessionUser.email,
        passwordHash: hashPassword(crypto.randomBytes(24).toString("hex")),
        avatar: sessionUser.avatar,
        role: sessionUser.role,
        bio: "Signed in with Google Account",
      })
    }
  } catch (err) {
    console.warn("Neon Google login insert warning:", err)
  }

  await setAuthSession({ user: sessionUser, teamName: name })
  return { success: true, user: sessionUser }
}

/**
 * Legacy loginTeam for backward compatibility
 */
export async function loginTeam(formData: {
  teamName: string
  password: string
}): Promise<{ success: boolean; error?: string }> {
  const res = await loginUser({
    identifier: formData.teamName,
    password: formData.password,
  })
  return { success: res.success, error: res.error }
}

/**
 * Legacy logout
 */
export async function logoutTeam(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(COOKIE_NAME)
}

export const logoutUser = logoutTeam
