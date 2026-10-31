"use client"

import * as React from "react"
import Link from "next/link"
import {
  AlertCircle,
  ArrowLeft,
  ArrowUpDown,
  Bug,
  CheckCircle2,
  Clock,
  ExternalLink,
  Filter,
  Flame,
  GitBranch,
  GitMerge,
  GitPullRequest,
  Kanban,
  Layers,
  LayoutGrid,
  Lightbulb,
  ListFilter,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Table as TableIcon,
  Tag,
  ThumbsUp,
  User,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { RequestSubmitModal } from "./request-submit-modal"
import { RequestDetailSheet } from "./request-detail-sheet"
import { DiffViewer } from "./diff-viewer"
import type { FeedbackRequest } from "@/lib/db/schema"
import { toggleRequestUpvote } from "@/app/actions/requests"

interface RequestsBoardViewProps {
  initialRequests: FeedbackRequest[]
  isLiveNeon: boolean
  teamName?: string
}

const STATUS_COLUMNS = [
  { id: "open", label: "Open (New)", icon: Clock, color: "text-sky-500", border: "border-sky-500/20" },
  { id: "under_review", label: "Under Review", icon: Search, color: "text-amber-500", border: "border-amber-500/20" },
  { id: "in_progress", label: "In Progress", icon: Sparkles, color: "text-blue-500", border: "border-blue-500/20" },
  { id: "merged", label: "Merged / Resolved", icon: CheckCircle2, color: "text-purple-500", border: "border-purple-500/20" },
  { id: "closed", label: "Closed", icon: CheckCircle2, color: "text-zinc-500", border: "border-zinc-500/20" },
]

export function RequestsBoardView({
  initialRequests,
  isLiveNeon,
  teamName,
}: RequestsBoardViewProps) {
  const [requests, setRequests] = React.useState<FeedbackRequest[]>(initialRequests)
  const [selectedType, setSelectedType] = React.useState<string>("all")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedPriority, setSelectedPriority] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban")

  // Modal & Drawer State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false)
  const [submitDefaultType, setSubmitDefaultType] = React.useState<"feature" | "bug" | "pull_request">("feature")
  const [activeDetailRequest, setActiveDetailRequest] = React.useState<FeedbackRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Compute stats
  const stats = React.useMemo(() => {
    const total = requests.length
    const features = requests.filter((r) => r.type === "feature").length
    const bugs = requests.filter((r) => r.type === "bug").length
    const prs = requests.filter((r) => r.type === "pull_request").length
    const openBugs = requests.filter(
      (r) => r.type === "bug" && (r.status === "open" || r.status === "in_progress")
    ).length
    const criticalBugs = requests.filter(
      (r) => r.type === "bug" && (r.severity === "P0" || r.severity === "P1") && r.status !== "closed"
    ).length
    const pendingPrs = requests.filter(
      (r) => r.type === "pull_request" && (r.status === "open" || r.status === "under_review")
    ).length
    const mergedCount = requests.filter((r) => r.status === "merged").length

    return { total, features, bugs, prs, openBugs, criticalBugs, pendingPrs, mergedCount }
  }, [requests])

  // Filter requests
  const filteredRequests = React.useMemo(() => {
    return requests.filter((r) => {
      // Type filter
      if (selectedType !== "all" && r.type !== selectedType) return false
      // Status filter
      if (selectedStatus !== "all" && r.status !== selectedStatus) return false
      // Priority filter
      if (selectedPriority !== "all" && r.priority !== selectedPriority) return false

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = r.title.toLowerCase().includes(q)
        const matchDesc = r.description.toLowerCase().includes(q)
        const matchAuthor = r.authorName.toLowerCase().includes(q)
        const matchService = r.targetService.toLowerCase().includes(q)
        const matchBranch = r.branchName?.toLowerCase().includes(q) || false
        const matchTags = r.tags.toLowerCase().includes(q)
        if (!matchTitle && !matchDesc && !matchAuthor && !matchService && !matchBranch && !matchTags) {
          return false
        }
      }
      return true
    })
  }, [requests, selectedType, selectedStatus, selectedPriority, searchQuery])

  // Upvote item directly from board
  const handleQuickUpvote = async (e: React.MouseEvent, item: FeedbackRequest) => {
    e.stopPropagation()
    const currentUser =
      typeof window !== "undefined"
        ? localStorage.getItem("service_catalog_coworker_name") || "Coworker"
        : "Coworker"

    const res = await toggleRequestUpvote(item.id, currentUser)
    if (res.success && res.upvotes !== undefined) {
      setRequests((prev) =>
        prev.map((r) => (r.id === item.id ? { ...r, upvotes: res.upvotes! } : r))
      )
    }
  }

  const handleOpenDetail = (item: FeedbackRequest) => {
    setActiveDetailRequest(item)
    setIsDetailOpen(true)
  }

  const handleUpdateItem = (updated: FeedbackRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)))
    if (activeDetailRequest?.id === updated.id) {
      setActiveDetailRequest(updated)
    }
  }

  const handleDeleteItem = (id: string) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
    setIsDetailOpen(false)
  }

  const openSubmitModal = (type: "feature" | "bug" | "pull_request" = "feature") => {
    setSubmitDefaultType(type)
    setIsSubmitModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2 text-xs font-medium text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Catalog</span>
            </Button>
          </Link>

          <span className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <GitPullRequest className="size-4" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-foreground flex items-center gap-2">
                <span>Requests & Coworker PRs</span>
                <Badge
                  variant="outline"
                  className={
                    isLiveNeon
                      ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono"
                      : "border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 font-mono"
                  }
                >
                  {isLiveNeon ? "Neon PostgreSQL Live" : "Local Sync"}
                </Badge>
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Submit Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openSubmitModal("pull_request")}
              className="h-8 cursor-pointer gap-1.5 border-purple-500/30 bg-purple-500/5 px-2.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/10 dark:text-purple-400"
            >
              <GitPullRequest className="size-3.5" />
              <span>Propose Bug Fix / PR</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openSubmitModal("bug")}
              className="h-8 cursor-pointer gap-1.5 border-rose-500/30 bg-rose-500/5 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400"
            >
              <Bug className="size-3.5" />
              <span>Report Bug</span>
            </Button>
          </div>

          <Button
            type="button"
            size="sm"
            onClick={() => openSubmitModal("feature")}
            className="h-8 cursor-pointer gap-1.5 bg-primary px-3 text-xs font-semibold text-primary-foreground hover:bg-primary/90 shadow-2xs"
          >
            <Plus className="size-3.5" />
            <span>New Request</span>
          </Button>

          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {/* Total Submissions */}
          <div className="rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">All Submissions</span>
              <Layers className="size-4 text-primary" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stats.total}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Active backlog items
            </div>
          </div>

          {/* Pending PRs */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400">
              <span className="text-xs font-medium">Bug Fix PRs</span>
              <GitPullRequest className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-purple-600 dark:text-purple-400">
              {stats.prs}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="font-semibold text-purple-600 dark:text-purple-400">{stats.pendingPrs}</span> awaiting review
            </div>
          </div>

          {/* Feature Requests */}
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Feature Requests</span>
              <Lightbulb className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.features}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Community suggestions
            </div>
          </div>

          {/* Active Bugs */}
          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span className="text-xs font-medium">Bug Reports</span>
              <Bug className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {stats.openBugs}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {stats.criticalBugs > 0 ? (
                <span className="font-semibold text-rose-600 dark:text-rose-400">
                  {stats.criticalBugs} P0/P1 blockers
                </span>
              ) : (
                "0 critical blockers"
              )}
            </div>
          </div>

          {/* Merged / Done */}
          <div className="hidden lg:block rounded-xl border border-border bg-card p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-xs font-medium">Merged & Resolved</span>
              <GitMerge className="size-4 text-emerald-500" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              {stats.mergedCount}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Successfully shipped
            </div>
          </div>
        </div>

        {/* Filter and Control Bar */}
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-3 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Type selector tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedType("all")}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedType === "all"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All ({requests.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("pull_request")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedType === "pull_request"
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <GitPullRequest className="size-3.5" />
                <span>Pull Requests ({stats.prs})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("feature")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedType === "feature"
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Lightbulb className="size-3.5" />
                <span>Features ({stats.features})</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedType("bug")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  selectedType === "bug"
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Bug className="size-3.5" />
                <span>Bugs ({stats.bugs})</span>
              </button>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "kanban"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Kanban className="size-3.5" />
                <span className="hidden sm:inline">Kanban Board</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                  viewMode === "table"
                    ? "bg-background text-foreground shadow-2xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="size-3.5" />
                <span className="hidden sm:inline">Table View</span>
              </button>
            </div>
          </div>

          {/* Search & dropdown filters */}
          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-4">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title, author, branch, service, tag..."
                className="h-8 pl-8 text-xs"
              />
            </div>

            <div>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="all">All Statuses</option>
                <option value="open">Open (New)</option>
                <option value="under_review">Under Review</option>
                <option value="in_progress">In Progress</option>
                <option value="merged">Merged / Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-background px-2 text-xs"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Kanban Board View */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 items-start">
            {STATUS_COLUMNS.map((col) => {
              const itemsInCol = filteredRequests.filter((r) => r.status === col.id)
              const Icon = col.icon

              return (
                <div
                  key={col.id}
                  className="flex flex-col rounded-xl border border-border bg-muted/20 p-3 min-h-[400px]"
                >
                  {/* Column Header */}
                  <div className="mb-3 flex items-center justify-between pb-2 border-b border-border">
                    <div className="flex items-center gap-1.5 font-semibold text-xs text-foreground">
                      <Icon className={`size-3.5 ${col.color}`} />
                      <span>{col.label}</span>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {itemsInCol.length}
                    </Badge>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5">
                    {itemsInCol.map((item) => (
                      <RequestCard
                        key={item.id}
                        item={item}
                        onClick={() => handleOpenDetail(item)}
                        onUpvote={(e) => handleQuickUpvote(e, item)}
                      />
                    ))}

                    {itemsInCol.length === 0 && (
                      <div className="py-8 text-center text-[11px] text-muted-foreground/60 italic">
                        No items in this column
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Table View */}
        {viewMode === "table" && (
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Title & Target Service</th>
                    <th className="py-2.5 px-3">Priority</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Author</th>
                    <th className="py-2.5 px-3">Upvotes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {filteredRequests.map((item) => (
                    <tr
                      key={item.id}
                      onClick={() => handleOpenDetail(item)}
                      className="cursor-pointer hover:bg-muted/40 transition-colors"
                    >
                      <td className="py-2.5 px-3 font-mono font-bold text-primary">
                        {item.id}
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge
                          variant="outline"
                          className={
                            item.type === "pull_request"
                              ? "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-semibold"
                              : item.type === "bug"
                                ? "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-semibold"
                                : "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                          }
                        >
                          {item.type === "pull_request"
                            ? "PR / Fix"
                            : item.type === "bug"
                              ? "Bug Report"
                              : "Feature"}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-foreground line-clamp-1">
                          {item.title}
                        </div>
                        <div className="text-[11px] text-muted-foreground line-clamp-1">
                          {item.targetService}
                          {item.branchName && ` • branch: ${item.branchName}`}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium capitalize">
                        <span
                          className={
                            item.priority === "critical"
                              ? "text-rose-600 font-bold"
                              : item.priority === "high"
                                ? "text-amber-600 font-semibold"
                                : "text-muted-foreground"
                          }
                        >
                          {item.priority}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <Badge variant="outline" className="capitalize text-[10px]">
                          {item.status.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <div className="text-foreground font-medium">{item.authorName}</div>
                        <div className="text-[10px]">{item.authorRole}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={(e) => handleQuickUpvote(e, item)}
                          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"
                        >
                          <ThumbsUp className="size-3 text-primary" />
                          <span>{item.upvotes}</span>
                        </button>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenDetail(item)}
                          className="h-7 text-xs font-medium text-primary hover:underline"
                        >
                          Triage & Review →
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-muted-foreground">
                        No requests or pull requests match the current filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Submission Modal */}
      <RequestSubmitModal
        isOpen={isSubmitModalOpen}
        onOpenChange={setIsSubmitModalOpen}
        defaultType={submitDefaultType}
        onSuccess={(newReq) => {
          setRequests((prev) => [newReq, ...prev])
        }}
      />

      {/* Detail & Work Item Drawer */}
      <RequestDetailSheet
        request={activeDetailRequest}
        isOpen={isDetailOpen}
        onOpenChange={setIsDetailOpen}
        onUpdate={handleUpdateItem}
        onDelete={handleDeleteItem}
      />
    </div>
  )
}

function RequestCard({
  item,
  onClick,
  onUpvote,
}: {
  item: FeedbackRequest
  onClick: () => void
  onUpvote: (e: React.MouseEvent) => void
}) {
  const typeBorder =
    item.type === "pull_request"
      ? "hover:border-purple-500/50"
      : item.type === "bug"
        ? "hover:border-rose-500/50"
        : "hover:border-emerald-500/50"

  let tags: string[] = []
  try {
    tags = JSON.parse(item.tags || "[]")
  } catch {
    tags = []
  }

  return (
    <div
      onClick={onClick}
      className={`group relative cursor-pointer rounded-lg border border-border bg-card p-3 shadow-2xs transition-all hover:shadow-md ${typeBorder}`}
    >
      {/* Top Type & ID pill */}
      <div className="mb-2 flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1.5">
          {item.type === "pull_request" ? (
            <Badge
              variant="outline"
              className="border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400 font-mono text-[10px] font-bold"
            >
              <GitPullRequest className="mr-1 size-2.5" />
              {item.id}
            </Badge>
          ) : item.type === "bug" ? (
            <Badge
              variant="outline"
              className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold"
            >
              <Bug className="mr-1 size-2.5" />
              {item.id}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px] font-bold"
            >
              <Lightbulb className="mr-1 size-2.5" />
              {item.id}
            </Badge>
          )}

          {item.severity && (
            <span
              className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                item.severity === "P0" || item.severity === "P1"
                  ? "bg-rose-500 text-white"
                  : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              }`}
            >
              {item.severity}
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onUpvote}
          className="flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all"
          title="Upvote (+1)"
        >
          <ThumbsUp className="size-2.5 text-primary" />
          <span>{item.upvotes}</span>
        </button>
      </div>

      {/* Title */}
      <h4 className="mb-1.5 text-xs font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {item.title}
      </h4>

      {/* Target service & branch */}
      <div className="mb-2 text-[10px] text-muted-foreground flex flex-wrap items-center gap-1">
        <span className="font-medium text-foreground/80">{item.targetService}</span>
        {item.branchName && (
          <span className="inline-flex items-center gap-0.5 rounded bg-muted px-1 font-mono text-[9px] text-amber-600 dark:text-amber-400">
            <GitBranch className="size-2" />
            {item.branchName}
          </span>
        )}
      </div>

      {/* Diff snippet preview if PR */}
      {item.type === "pull_request" && item.diffContent && (
        <div className="mb-2 rounded bg-slate-950 px-2 py-1 font-mono text-[10px] text-emerald-400 line-clamp-1 border border-slate-800">
          code patch available ↗
        </div>
      )}

      {/* Submitter footer */}
      <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white"
            style={{ backgroundColor: item.authorAvatar || "#3b82f6" }}
          >
            {item.authorName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[90px]">{item.authorName}</span>
        </div>

        <span className="capitalize text-[10px] font-medium text-foreground/70">
          {item.priority} priority
        </span>
      </div>
    </div>
  )
}
