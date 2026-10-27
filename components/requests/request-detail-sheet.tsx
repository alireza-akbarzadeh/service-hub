"use client"

import * as React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { DiffViewer } from "./diff-viewer"
import type { FeedbackRequest } from "@/lib/db/schema"
import {
  updateFeedbackRequest,
  toggleRequestUpvote,
  deleteFeedbackRequest,
} from "@/app/actions/requests"
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Bug,
  CheckCircle2,
  Clock,
  ExternalLink,
  Flame,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Layers,
  Lightbulb,
  MessageSquare,
  Save,
  Share2,
  ThumbsUp,
  Trash2,
  User,
  UserCheck,
} from "lucide-react"

interface RequestDetailSheetProps {
  request: FeedbackRequest | null
  isOpen: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (updated: FeedbackRequest) => void
  onDelete?: (id: string) => void
}

const ASSIGNEE_OPTIONS = [
  "Unassigned",
  "Ali Akbarzadeh (Maintainer)",
  "Frontend Squad",
  "FinTech & Wallet Squad",
  "Catalog Squad",
  "DevOps Team",
  "Platform Architecture",
  "QA Specialist",
]

export function RequestDetailSheet({
  request,
  isOpen,
  onOpenChange,
  onUpdate,
  onDelete,
}: RequestDetailSheetProps) {
  if (!request) return null

  const [status, setStatus] = React.useState(request.status)
  const [priority, setPriority] = React.useState(request.priority)
  const [assignedTo, setAssignedTo] = React.useState(request.assignedTo || "")
  const [reviewNotes, setReviewNotes] = React.useState(request.reviewNotes || "")
  const [resolutionSummary, setResolutionSummary] = React.useState(
    request.resolutionSummary || ""
  )
  const [isSaving, setIsSaving] = React.useState(false)
  const [saveSuccess, setSaveSuccess] = React.useState(false)
  const [upvotes, setUpvotes] = React.useState(request.upvotes)
  const [hasUpvoted, setHasUpvoted] = React.useState(false)
  const [copiedShare, setCopiedShare] = React.useState(false)

  // Reset when request changes
  React.useEffect(() => {
    if (request) {
      setStatus(request.status)
      setPriority(request.priority)
      setAssignedTo(request.assignedTo || "")
      setReviewNotes(request.reviewNotes || "")
      setResolutionSummary(request.resolutionSummary || "")
      setUpvotes(request.upvotes)
      setSaveSuccess(false)

      const currentUser =
        typeof window !== "undefined"
          ? localStorage.getItem("service_catalog_coworker_name") || "Guest"
          : "Guest"
      try {
        const voters = JSON.parse(request.upvotedBy || "[]")
        setHasUpvoted(voters.includes(currentUser))
      } catch {
        setHasUpvoted(false)
      }
    }
  }, [request])

  const handleSaveTriage = async () => {
    if (!request) return
    setIsSaving(true)
    setSaveSuccess(false)

    const res = await updateFeedbackRequest(request.id, {
      status: status as any,
      priority: priority as any,
      assignedTo: assignedTo === "Unassigned" ? null : assignedTo,
      reviewNotes: reviewNotes.trim() || null,
      resolutionSummary: resolutionSummary.trim() || null,
    })

    setIsSaving(false)
    if (res.success && res.data) {
      setSaveSuccess(true)
      onUpdate(res.data)
      setTimeout(() => setSaveSuccess(false), 2500)
    }
  }

  const handleUpvote = async () => {
    if (!request) return
    const currentUser =
      typeof window !== "undefined"
        ? localStorage.getItem("service_catalog_coworker_name") || "Coworker"
        : "Coworker"

    const res = await toggleRequestUpvote(request.id, currentUser)
    if (res.success && res.upvotes !== undefined) {
      setUpvotes(res.upvotes)
      setHasUpvoted(res.hasUpvoted || false)
      onUpdate({
        ...request,
        upvotes: res.upvotes,
      })
    }
  }

  const handleCopyMarkdown = () => {
    if (!request) return
    const md = `### [${request.id}] ${request.title}
- **Type**: ${request.type.toUpperCase()}
- **Status**: ${status}
- **Priority**: ${priority}
- **Target Service**: ${request.targetService}
- **Author**: ${request.authorName} (${request.authorRole})
- **Description**: ${request.description}
${request.branchName ? `- **Branch**: \`${request.branchName}\`` : ""}
${request.prUrl ? `- **PR Link**: ${request.prUrl}` : ""}
${reviewNotes ? `- **Maintainer Notes**: ${reviewNotes}` : ""}`

    navigator.clipboard.writeText(md)
    setCopiedShare(true)
    setTimeout(() => setCopiedShare(false), 2000)
  }

  const handleDelete = async () => {
    if (!request) return
    if (!confirm(`Are you sure you want to delete ${request.id}?`)) return
    const res = await deleteFeedbackRequest(request.id)
    if (res.success) {
      if (onDelete) onDelete(request.id)
      onOpenChange(false)
    }
  }

  // Parse tags
  let tags: string[] = []
  try {
    tags = JSON.parse(request.tags || "[]")
  } catch {
    tags = []
  }

  const typeColor =
    request.type === "pull_request"
      ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400"
      : request.type === "bug"
        ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
        : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"

  const statusBadge = (s: string) => {
    switch (s) {
      case "open":
        return <Badge variant="outline" className="border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400">Open</Badge>
      case "under_review":
        return <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">Under Review</Badge>
      case "in_progress":
        return <Badge variant="outline" className="border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400">In Progress</Badge>
      case "merged":
        return <Badge variant="outline" className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400">Merged / Deployed</Badge>
      case "closed":
        return <Badge variant="outline" className="border-zinc-500/30 bg-zinc-500/10 text-zinc-600 dark:text-zinc-400">Closed</Badge>
      default:
        return <Badge variant="outline">{s}</Badge>
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full max-w-xl overflow-y-auto sm:max-w-2xl p-6"
      >
        <SheetHeader className="space-y-2 pb-3 border-b border-border">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${typeColor}`}
              >
                {request.type === "pull_request" ? (
                  <GitPullRequest className="size-3.5" />
                ) : request.type === "bug" ? (
                  <Bug className="size-3.5" />
                ) : (
                  <Lightbulb className="size-3.5" />
                )}
                <span>{request.id}</span>
              </span>
              {statusBadge(status)}
              {request.severity && (
                <Badge
                  variant="outline"
                  className={
                    request.severity === "P0" || request.severity === "P1"
                      ? "border-rose-500/40 bg-rose-500/20 text-rose-600 font-bold dark:text-rose-400"
                      : "border-amber-500/30 text-amber-600 dark:text-amber-400"
                  }
                >
                  {request.severity}
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                className={`h-7 cursor-pointer gap-1 px-2 text-xs font-medium transition-all ${
                  hasUpvoted
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title="Upvote item (+1)"
              >
                <ThumbsUp className="size-3.5" />
                <span>{upvotes}</span>
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCopyMarkdown}
                className="h-7 cursor-pointer px-2 text-xs text-muted-foreground hover:text-foreground"
                title="Copy markdown summary"
              >
                {copiedShare ? (
                  <CheckCircle2 className="size-3.5 text-emerald-500" />
                ) : (
                  <Share2 className="size-3.5" />
                )}
              </Button>
            </div>
          </div>

          <SheetTitle className="text-base font-bold leading-snug text-foreground">
            {request.title}
          </SheetTitle>

          <SheetDescription className="text-xs text-muted-foreground flex items-center gap-2">
            <span>Target:</span>
            <span className="font-medium text-foreground">{request.targetService}</span>
            {request.environment && (
              <>
                <span>•</span>
                <span>Env: {request.environment}</span>
              </>
            )}
          </SheetDescription>
        </SheetHeader>

        {/* Content Body */}
        <div className="space-y-5 py-4 text-xs">
          {/* Submitter & Metadata Box */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-center gap-2.5">
              <div
                className="flex size-8 shrink-0 items-center justify-center rounded-full font-bold text-white shadow-2xs text-xs"
                style={{ backgroundColor: request.authorAvatar || "#3b82f6" }}
              >
                {request.authorName.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-foreground">
                  {request.authorName}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {request.authorRole}
                  {request.authorEmail && ` • ${request.authorEmail}`}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="size-3" />
                <span>{new Date(request.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="mb-1 text-xs font-semibold text-foreground">
              {request.type === "pull_request"
                ? "Pull Request Overview & Objective"
                : request.type === "bug"
                  ? "Issue Summary"
                  : "Feature Description"}
            </h4>
            <div className="rounded-md border border-border/80 bg-background p-3 text-xs leading-relaxed text-foreground/90 whitespace-pre-wrap">
              {request.description}
            </div>
          </div>

          {/* Bug Details: Steps & Behavior */}
          {request.type === "bug" && (
            <div className="space-y-3">
              {request.stepsToReproduce && (
                <div>
                  <h4 className="mb-1 text-xs font-semibold text-foreground">
                    Steps to Reproduce
                  </h4>
                  <div className="rounded-md border border-border/80 bg-background p-3 font-mono text-[11px] text-foreground/90 whitespace-pre-wrap">
                    {request.stepsToReproduce}
                  </div>
                </div>
              )}

              {(request.expectedBehavior || request.actualBehavior) && (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {request.expectedBehavior && (
                    <div className="rounded-md border border-emerald-500/20 bg-emerald-500/5 p-2.5">
                      <span className="mb-1 block font-semibold text-emerald-600 dark:text-emerald-400">
                        Expected Behavior
                      </span>
                      <p className="text-foreground/90">{request.expectedBehavior}</p>
                    </div>
                  )}
                  {request.actualBehavior && (
                    <div className="rounded-md border border-rose-500/20 bg-rose-500/5 p-2.5">
                      <span className="mb-1 block font-semibold text-rose-600 dark:text-rose-400">
                        Actual Behavior
                      </span>
                      <p className="text-foreground/90">{request.actualBehavior}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Pull Request Code Diff Viewer */}
          {request.type === "pull_request" && request.diffContent && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <GitPullRequest className="size-3.5 text-purple-500" />
                  Proposed Code Diff & Fix
                </h4>
                {request.branchName && (
                  <Badge variant="outline" className="font-mono text-[10px] text-amber-500">
                    branch: {request.branchName}
                  </Badge>
                )}
              </div>

              <DiffViewer
                diff={request.diffContent}
                branchName={request.branchName}
                prUrl={request.prUrl}
              />

              {request.testNotes && (
                <div className="rounded-md border border-border/80 bg-muted/20 p-2.5 text-[11px]">
                  <span className="font-semibold text-foreground">Test Verification Notes: </span>
                  <span className="text-muted-foreground">{request.testNotes}</span>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] font-medium text-muted-foreground">Tags:</span>
              {tags.map((t) => (
                <Badge
                  key={t}
                  variant="secondary"
                  className="font-mono text-[10px] text-muted-foreground"
                >
                  #{t}
                </Badge>
              ))}
            </div>
          )}

          <Separator />

          {/* Developer Triage & Work Section */}
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="size-4 text-primary" />
                <span className="font-bold text-foreground">
                  Developer Work & Triage Panel
                </span>
              </div>
              {saveSuccess && (
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="size-3" />
                  Saved
                </span>
              )}
            </div>

            <p className="text-[11px] text-muted-foreground">
              Review your coworker&apos;s request, transition status, assign developers, or write notes.
            </p>

            {/* Quick Status Bar */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div>
                <label className="mb-1 block text-[11px] font-semibold text-foreground">
                  Status Pipeline
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs font-medium"
                >
                  <option value="open">Open (New)</option>
                  <option value="under_review">Under Review</option>
                  <option value="in_progress">In Progress</option>
                  <option value="merged">
                    {request.type === "pull_request" ? "Merged & Deployed" : "Resolved"}
                  </option>
                  <option value="closed">Closed / Declined</option>
                </select>
              </div>

              <div>
                <label className="mb-1 block text-[11px] font-semibold text-foreground">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="mb-1 block text-[11px] font-semibold text-foreground">
                  Assigned Developer / Squad
                </label>
                <select
                  value={assignedTo || "Unassigned"}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
                >
                  {ASSIGNEE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Review Notes */}
            <div>
              <label className="mb-1 block text-[11px] font-semibold text-foreground">
                Maintainer Notes & Review Feedback
              </label>
              <textarea
                rows={3}
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Write your feedback, verification steps, or ETA for your coworker..."
                className="w-full rounded-md border border-border bg-background p-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Quick 1-click status actions */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex flex-wrap items-center gap-1.5">
                {request.type === "pull_request" && status !== "merged" && (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      setStatus("merged")
                      setResolutionSummary("Pull Request approved and merged into master branch.")
                    }}
                    className="h-7 cursor-pointer gap-1 bg-purple-600 px-2.5 text-[11px] font-semibold text-white hover:bg-purple-700"
                  >
                    <GitMerge className="size-3" />
                    <span>Merge PR</span>
                  </Button>
                )}

                {status !== "in_progress" && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setStatus("in_progress")}
                    className="h-7 cursor-pointer gap-1 px-2.5 text-[11px] text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-950/40"
                  >
                    Set In Progress
                  </Button>
                )}

                {status !== "closed" && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setStatus("closed")}
                    className="h-7 cursor-pointer text-[11px] text-zinc-500 hover:text-zinc-700"
                  >
                    Close
                  </Button>
                )}
              </div>

              <Button
                type="button"
                disabled={isSaving}
                onClick={handleSaveTriage}
                size="sm"
                className="h-7 cursor-pointer gap-1.5 bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs"
              >
                <Save className="size-3" />
                <span>{isSaving ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>

          {/* Delete Danger Zone */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[10px] text-muted-foreground">
              Internal ticket: {request.id}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-7 cursor-pointer gap-1 text-[11px] text-rose-500 hover:bg-rose-500/10 hover:text-rose-600"
            >
              <Trash2 className="size-3" />
              <span>Delete Ticket</span>
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
