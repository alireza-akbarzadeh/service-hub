"use server"

import { db } from "@/lib/db"
import { feedbackRequests, type FeedbackRequest, type NewFeedbackRequest } from "@/lib/db/schema"
import { initialRequestsCatalog } from "@/lib/requests-data"
import { verifySession } from "@/lib/auth"
import { desc, eq } from "drizzle-orm"
import { revalidatePath } from "next/cache"

// In-memory fallback cache when Neon is unavailable locally
let inMemoryRequests: FeedbackRequest[] = [...initialRequestsCatalog]

export async function getFeedbackRequests(): Promise<{
  isAuthenticated: boolean
  teamName?: string
  data: FeedbackRequest[]
  isLiveNeon: boolean
}> {
  const session = await verifySession()

  try {
    const queryPromise = db
      .select()
      .from(feedbackRequests)
      .orderBy(desc(feedbackRequests.createdAt))

    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("Neon direct connection timeout")), 3000)
    )

    const rows = await Promise.race([queryPromise, timeoutPromise])
    if (rows && rows.length > 0) {
      // Sync memory cache
      inMemoryRequests = rows
      return {
        isAuthenticated: session.isAuthenticated,
        teamName: session.teamName,
        data: rows,
        isLiveNeon: true,
      }
    }
  } catch (err) {
    console.warn(
      "Neon feedback_requests query timed out or unreachable locally; using fallback:",
      (err as Error).message
    )
  }

  return {
    isAuthenticated: session.isAuthenticated,
    teamName: session.teamName,
    data: inMemoryRequests,
    isLiveNeon: false,
  }
}

export async function createFeedbackRequest(data: {
  type: "feature" | "bug" | "pull_request"
  title: string
  description: string
  targetService?: string
  priority?: "low" | "medium" | "high" | "critical"
  authorName: string
  authorRole?: string
  authorEmail?: string
  authorAvatar?: string
  // Bug fields
  severity?: string
  environment?: string
  stepsToReproduce?: string
  expectedBehavior?: string
  actualBehavior?: string
  // PR fields
  branchName?: string
  prUrl?: string
  diffContent?: string
  testNotes?: string
  tags?: string[]
}): Promise<{ success: boolean; data?: FeedbackRequest; error?: string }> {
  try {
    if (!data.title?.trim() || !data.description?.trim() || !data.authorName?.trim()) {
      return { success: false, error: "Title, description, and author name are required." }
    }

    const year = new Date().getFullYear()
    const randomSuffix = Math.floor(100 + Math.random() * 900)
    const prefix =
      data.type === "feature" ? "REQ" : data.type === "bug" ? "BUG" : "PR"
    const newId = `${prefix}-${year}-${randomSuffix}`

    const newRecord: FeedbackRequest = {
      id: newId,
      type: data.type,
      title: data.title.trim(),
      description: data.description.trim(),
      targetService: data.targetService?.trim() || "General",
      priority: data.priority || "medium",
      status: "open",
      authorName: data.authorName.trim(),
      authorRole: data.authorRole?.trim() || "Coworker",
      authorEmail: data.authorEmail?.trim() || null,
      authorAvatar: data.authorAvatar || "#3b82f6",
      severity: data.severity || null,
      environment: data.environment || "All",
      stepsToReproduce: data.stepsToReproduce?.trim() || null,
      expectedBehavior: data.expectedBehavior?.trim() || null,
      actualBehavior: data.actualBehavior?.trim() || null,
      branchName: data.branchName?.trim() || null,
      prUrl: data.prUrl?.trim() || null,
      diffContent: data.diffContent?.trim() || null,
      testNotes: data.testNotes?.trim() || null,
      assignedTo: null,
      reviewNotes: null,
      resolutionSummary: null,
      upvotes: 1,
      upvotedBy: JSON.stringify([data.authorName.trim()]),
      tags: JSON.stringify(data.tags || []),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    // Try saving to Neon DB
    try {
      await db.insert(feedbackRequests).values(newRecord)
    } catch (neonErr) {
      console.warn("Failed to write request to Neon; saved to memory cache:", neonErr)
    }

    // Always update in-memory cache
    inMemoryRequests = [newRecord, ...inMemoryRequests]

    revalidatePath("/")
    revalidatePath("/requests")

    return { success: true, data: newRecord }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function updateFeedbackRequest(
  id: string,
  updates: {
    status?: "open" | "under_review" | "in_progress" | "merged" | "closed"
    priority?: "low" | "medium" | "high" | "critical"
    assignedTo?: string | null
    reviewNotes?: string | null
    resolutionSummary?: string | null
    tags?: string[]
  }
): Promise<{ success: boolean; data?: FeedbackRequest; error?: string }> {
  try {
    const existing = inMemoryRequests.find((r) => r.id === id)
    if (!existing) {
      return { success: false, error: "Request not found" }
    }

    const updatedRecord: FeedbackRequest = {
      ...existing,
      status: updates.status ?? existing.status,
      priority: updates.priority ?? existing.priority,
      assignedTo: updates.assignedTo !== undefined ? updates.assignedTo : existing.assignedTo,
      reviewNotes: updates.reviewNotes !== undefined ? updates.reviewNotes : existing.reviewNotes,
      resolutionSummary:
        updates.resolutionSummary !== undefined
          ? updates.resolutionSummary
          : existing.resolutionSummary,
      tags: updates.tags ? JSON.stringify(updates.tags) : existing.tags,
      updatedAt: new Date(),
    }

    try {
      await db
        .update(feedbackRequests)
        .set({
          status: updatedRecord.status,
          priority: updatedRecord.priority,
          assignedTo: updatedRecord.assignedTo,
          reviewNotes: updatedRecord.reviewNotes,
          resolutionSummary: updatedRecord.resolutionSummary,
          tags: updatedRecord.tags,
          updatedAt: updatedRecord.updatedAt,
        })
        .where(eq(feedbackRequests.id, id))
    } catch (neonErr) {
      console.warn("Neon update failed, updated in-memory:", neonErr)
    }

    inMemoryRequests = inMemoryRequests.map((r) => (r.id === id ? updatedRecord : r))

    revalidatePath("/")
    revalidatePath("/requests")

    return { success: true, data: updatedRecord }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function toggleRequestUpvote(
  id: string,
  voterId: string
): Promise<{ success: boolean; upvotes?: number; hasUpvoted?: boolean; error?: string }> {
  try {
    const target = inMemoryRequests.find((r) => r.id === id)
    if (!target) {
      return { success: false, error: "Request not found" }
    }

    let voters: string[] = []
    try {
      voters = JSON.parse(target.upvotedBy || "[]")
    } catch {
      voters = []
    }

    const hasUpvoted = voters.includes(voterId)
    const newVoters = hasUpvoted
      ? voters.filter((v) => v !== voterId)
      : [...voters, voterId]
    const newCount = Math.max(0, newVoters.length)

    try {
      await db
        .update(feedbackRequests)
        .set({
          upvotes: newCount,
          upvotedBy: JSON.stringify(newVoters),
          updatedAt: new Date(),
        })
        .where(eq(feedbackRequests.id, id))
    } catch (neonErr) {
      console.warn("Neon upvote update failed, updated in-memory:", neonErr)
    }

    target.upvotes = newCount
    target.upvotedBy = JSON.stringify(newVoters)
    target.updatedAt = new Date()

    revalidatePath("/")
    revalidatePath("/requests")

    return { success: true, upvotes: newCount, hasUpvoted: !hasUpvoted }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}

export async function deleteFeedbackRequest(
  id: string
): Promise<{ success: boolean; error?: string }> {
  try {
    try {
      await db.delete(feedbackRequests).where(eq(feedbackRequests.id, id))
    } catch (neonErr) {
      console.warn("Neon delete failed:", neonErr)
    }

    inMemoryRequests = inMemoryRequests.filter((r) => r.id !== id)

    revalidatePath("/")
    revalidatePath("/requests")

    return { success: true }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
