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
  Download,
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
  X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { NotificationCenter } from "@/components/notifications/notification-center"
import { DashboardBottomBar } from "@/components/dashboard/dashboard-bottom-bar"
import { RequestSubmitModal } from "./request-submit-modal"
import { RequestDetailSheet } from "./request-detail-sheet"
import { KanbanCard } from "./kanban-card"
import type { FeedbackRequest } from "@/lib/db/schema"
import { toggleRequestUpvote, updateFeedbackRequest } from "@/app/actions/requests"
import { cn } from "@/lib/utils"

interface RequestsBoardViewProps {
  initialRequests: FeedbackRequest[]
  isLiveNeon: boolean
  teamName?: string
}

type RequestStatus = "open" | "under_review" | "in_progress" | "merged" | "closed"

const STATUS_COLUMNS: {
  id: RequestStatus
  label: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  activeBorder: string
  bg: string
}[] = [
  {
    id: "open",
    label: "Open (New)",
    icon: Clock,
    color: "text-sky-500",
    activeBorder: "border-sky-500/60 ring-2 ring-sky-500/20",
    bg: "bg-sky-500/5",
  },
  {
    id: "under_review",
    label: "Under Review",
    icon: Search,
    color: "text-amber-500",
    activeBorder: "border-amber-500/60 ring-2 ring-amber-500/20",
    bg: "bg-amber-500/5",
  },
  {
    id: "in_progress",
    label: "In Progress",
    icon: Sparkles,
    color: "text-blue-500",
    activeBorder: "border-blue-500/60 ring-2 ring-blue-500/20",
    bg: "bg-blue-500/5",
  },
  {
    id: "merged",
    label: "Merged / Done",
    icon: CheckCircle2,
    color: "text-purple-500",
    activeBorder: "border-purple-500/60 ring-2 ring-purple-500/20",
    bg: "bg-purple-500/5",
  },
  {
    id: "closed",
    label: "Closed",
    icon: CheckCircle2,
    color: "text-zinc-500",
    activeBorder: "border-zinc-500/60 ring-2 ring-zinc-500/20",
    bg: "bg-zinc-500/5",
  },
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
  const [selectedService, setSelectedService] = React.useState<string>("all")
  const [searchQuery, setSearchQuery] = React.useState<string>("")
  const [sortBy, setSortBy] = React.useState<"newest" | "upvotes" | "priority">("newest")
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban")
  const [needsAttentionOnly, setNeedsAttentionOnly] = React.useState<boolean>(false)

  // Drag and drop state
  const [draggedItemId, setDraggedItemId] = React.useState<string | null>(null)
  const [dragOverColId, setDragOverColId] = React.useState<string | null>(null)
  const [moveToast, setMoveToast] = React.useState<{ text: string } | null>(null)

  // Modal & Drawer State
  const [isSubmitModalOpen, setIsSubmitModalOpen] = React.useState(false)
  const [submitDefaultType, setSubmitDefaultType] = React.useState<"feature" | "bug" | "pull_request">("feature")
  const [activeDetailRequest, setActiveDetailRequest] = React.useState<FeedbackRequest | null>(null)
  const [isDetailOpen, setIsDetailOpen] = React.useState(false)

  // Unique target services for filter dropdown
  const uniqueServices = React.useMemo(() => {
    const set = new Set<string>()
    requests.forEach((r) => {
      if (r.targetService) set.add(r.targetService)
    })
    return Array.from(set).sort()
  }, [requests])

  // Compute triage stats
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
    return requests
      .filter((r) => {
        if (needsAttentionOnly) {
          const isCriticalBug =
            r.type === "bug" && (r.severity === "P0" || r.severity === "P1") && r.status !== "closed"
          const isPendingPr =
            r.type === "pull_request" && (r.status === "open" || r.status === "under_review")
          if (!isCriticalBug && !isPendingPr) return false
        }

        if (selectedType !== "all" && r.type !== selectedType) return false
        if (selectedStatus !== "all" && r.status !== selectedStatus) return false
        if (selectedPriority !== "all" && r.priority !== selectedPriority) return false
        if (selectedService !== "all" && r.targetService !== selectedService) return false

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase()
          const matchTitle = r.title.toLowerCase().includes(q)
          const matchDesc = r.description.toLowerCase().includes(q)
          const matchAuthor = r.authorName.toLowerCase().includes(q)
          const matchService = r.targetService.toLowerCase().includes(q)
          const matchBranch = r.branchName?.toLowerCase().includes(q) || false
          const matchTags = (r.tags || "").toLowerCase().includes(q)
          if (!matchTitle && !matchDesc && !matchAuthor && !matchService && !matchBranch && !matchTags) {
            return false
          }
        }
        return true
      })
      .sort((a, b) => {
        if (sortBy === "upvotes") return b.upvotes - a.upvotes
        if (sortBy === "priority") {
          const pRank = { critical: 4, high: 3, medium: 2, low: 1 }
          const diff = (pRank[b.priority as keyof typeof pRank] || 0) - (pRank[a.priority as keyof typeof pRank] || 0)
          if (diff !== 0) return diff
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
  }, [requests, needsAttentionOnly, selectedType, selectedStatus, selectedPriority, selectedService, searchQuery, sortBy])

  // Handle Drag & Drop move
  const handleMoveStatus = async (itemId: string, newStatus: RequestStatus) => {
    const item = requests.find((r) => r.id === itemId)
    if (!item || item.status === newStatus) return

    // Optimistic UI update
    setRequests((prev) =>
      prev.map((r) => (r.id === itemId ? { ...r, status: newStatus, updatedAt: new Date() } : r))
    )

    setMoveToast({ text: `Moved ${item.id} to ${newStatus.replace("_", " ")}` })
    setTimeout(() => setMoveToast(null), 3000)

    // Background server action
    try {
      await updateFeedbackRequest(itemId, { status: newStatus })
    } catch (err) {
      console.warn("Failed to persist request status:", err)
    }
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/plain", id)
    e.dataTransfer.effectAllowed = "move"
    setDraggedItemId(id)
  }

  const handleDragEnd = () => {
    setDraggedItemId(null)
    setDragOverColId(null)
  }

  const handleDragOverColumn = (e: React.DragEvent, colId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    if (dragOverColId !== colId) {
      setDragOverColId(colId)
    }
  }

  const handleDropToColumn = (e: React.DragEvent, colId: RequestStatus) => {
    e.preventDefault()
    const id = e.dataTransfer.getData("text/plain") || draggedItemId
    if (id) {
      handleMoveStatus(id, colId)
    }
    setDraggedItemId(null)
    setDragOverColId(null)
  }

  // Quick upvote action
  const handleQuickUpvote = async (e: React.MouseEvent, item: FeedbackRequest) => {
    e.stopPropagation()
    const currentUser =
      typeof window !== "undefined"
        ? localStorage.getItem("service_catalog_coworker_name") || "Coworker"
        : "Coworker"

    // Optimistic local update
    setRequests((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, upvotes: r.upvotes + 1 } : r))
    )

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

  // Export Backlog to CSV
  const handleExportCsv = () => {
    const headers = ["Ticket ID", "Type", "Title", "Target Service", "Priority", "Status", "Author", "Upvotes", "Created At"]
    const rows = filteredRequests.map((r) => [
      r.id,
      r.type,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.targetService}"`,
      r.priority,
      r.status,
      `"${r.authorName}"`,
      r.upvotes,
      new Date(r.createdAt).toISOString(),
    ])

    const csvContent = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.setAttribute("download", `service-hub-requests-${new Date().toISOString().split("T")[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col select-none selection:bg-primary/20 overflow-x-clip">
      {/* Sticky Top Application Header */}
      <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur-md sm:px-6">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors group"
          >
            <ArrowLeft className="size-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="hidden sm:inline">Back to Hub</span>
          </Link>

          <span className="h-4 w-px bg-border" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-primary/15 text-primary border border-primary/30 shadow-xs">
              <GitPullRequest className="size-3.5" />
            </div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-bold tracking-tight text-foreground">
                Requests & Coworker PRs
              </h1>
              <Badge
                variant="outline"
                className={
                  isLiveNeon
                    ? "border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono hidden sm:inline-flex"
                    : "border-amber-500/30 bg-amber-500/10 text-[10px] text-amber-600 font-mono hidden sm:inline-flex"
                }
              >
                {isLiveNeon ? "Neon Live" : "Local Sync"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2">
          {/* Quick Submit Buttons */}
          <div className="hidden sm:flex items-center gap-1.5">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openSubmitModal("pull_request")}
              className="h-8 cursor-pointer gap-1.5 border-purple-500/30 bg-purple-500/5 px-2.5 text-xs font-semibold text-purple-600 hover:bg-purple-500/10 dark:text-purple-400 shadow-2xs"
            >
              <GitPullRequest className="size-3.5" />
              <span>Propose Bug Fix / PR</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => openSubmitModal("bug")}
              className="h-8 cursor-pointer gap-1.5 border-rose-500/30 bg-rose-500/5 px-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-500/10 dark:text-rose-400 shadow-2xs"
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

          {/* Export CSV */}
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleExportCsv}
            className="size-8 cursor-pointer text-muted-foreground hover:text-foreground hidden sm:flex"
            title="Export filtered backlog to CSV"
          >
            <Download className="size-3.5" />
          </Button>

          <span className="h-4 w-px bg-border hidden sm:block" />
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </header>

      {/* Main Workspace */}
      <main className="w-full max-w-[1920px] mx-auto flex-1 p-3 sm:p-5 lg:p-6 space-y-4 pb-16">
        {/* Triage Stats Row */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-5">
          {/* Total Submissions */}
          <div className="rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
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
          <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-3.5 shadow-2xs">
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
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400">
              <span className="text-xs font-medium">Feature Requests</span>
              <Lightbulb className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-emerald-600 dark:text-emerald-400">
              {stats.features}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              Suggestions & enhancements
            </div>
          </div>

          {/* Active Bugs */}
          <div className="rounded-2xl border border-rose-500/20 bg-rose-500/5 p-3.5 shadow-2xs">
            <div className="flex items-center justify-between text-rose-600 dark:text-rose-400">
              <span className="text-xs font-medium">Bug Reports</span>
              <Bug className="size-4" />
            </div>
            <div className="mt-2 text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">
              {stats.openBugs}
            </div>
            <div className="mt-1 text-[11px] text-muted-foreground">
              {stats.criticalBugs > 0 ? (
                <span className="font-semibold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                  <Flame className="size-3 animate-pulse" />
                  {stats.criticalBugs} P0/P1 blockers
                </span>
              ) : (
                "0 critical blockers"
              )}
            </div>
          </div>

          {/* Merged / Done */}
          <div className="hidden lg:block rounded-2xl border border-border bg-card p-3.5 shadow-2xs">
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
        <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-3">
            {/* Type selector tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedType("all")
                  setNeedsAttentionOnly(false)
                }}
                className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedType === "all" && !needsAttentionOnly
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                All ({requests.length})
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType("pull_request")
                  setNeedsAttentionOnly(false)
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedType === "pull_request" && !needsAttentionOnly
                    ? "bg-purple-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <GitPullRequest className="size-3.5" />
                <span>Pull Requests ({stats.prs})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType("bug")
                  setNeedsAttentionOnly(false)
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedType === "bug" && !needsAttentionOnly
                    ? "bg-rose-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Bug className="size-3.5" />
                <span>Bug Reports ({stats.bugs})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedType("feature")
                  setNeedsAttentionOnly(false)
                }}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ${
                  selectedType === "feature" && !needsAttentionOnly
                    ? "bg-emerald-600 text-white shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Lightbulb className="size-3.5" />
                <span>Feature Requests ({stats.features})</span>
              </button>

              {/* Fast Triage Pill: Needs Attention */}
              <button
                type="button"
                onClick={() => setNeedsAttentionOnly(!needsAttentionOnly)}
                className={cn(
                  "flex cursor-pointer items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all ml-1",
                  needsAttentionOnly
                    ? "bg-amber-500 text-white shadow-2xs ring-2 ring-amber-500/40"
                    : "border border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                )}
              >
                <Flame className="size-3.5" />
                <span>Needs Attention ({stats.criticalBugs + stats.pendingPrs})</span>
              </button>
            </div>

            {/* View Mode Switcher: Kanban vs Table */}
            <div className="flex items-center rounded-xl border border-border/80 bg-muted/30 p-1 text-xs">
              <button
                type="button"
                onClick={() => setViewMode("kanban")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  viewMode === "kanban"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Kanban className="size-3.5" />
                <span>Kanban (DnD)</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode("table")}
                className={`flex cursor-pointer items-center gap-1.5 rounded-lg px-2.5 py-1 font-semibold transition-all ${
                  viewMode === "table"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <TableIcon className="size-3.5" />
                <span>Table View</span>
              </button>
            </div>
          </div>

          {/* Search & Dropdown Filters Grid */}
          <div className="grid grid-cols-1 gap-2 pt-1 sm:grid-cols-5">
            <div className="relative sm:col-span-2">
              <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tickets, author, branch, service, tag..."
                className="h-8 pl-8 text-xs rounded-xl"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  <X className="size-3.5" />
                </button>
              )}
            </div>

            {/* Target Service Filter */}
            <div>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs"
              >
                <option value="all">All Microservices</option>
                {uniqueServices.map((svc) => (
                  <option key={svc} value={svc}>
                    {svc}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority Filter */}
            <div>
              <select
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
                className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs"
              >
                <option value="all">All Priorities</option>
                <option value="critical">Critical (Blocker)</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Sort Filter */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="h-8 w-full rounded-xl border border-border bg-background px-2 text-xs"
              >
                <option value="newest">Sort: Newest First</option>
                <option value="upvotes">Sort: Most Upvoted</option>
                <option value="priority">Sort: Highest Priority</option>
              </select>
            </div>
          </div>
        </div>

        {/* Temporary Drag & Drop Move Toast Notification */}
        {moveToast && (
          <div className="fixed bottom-14 right-6 z-50 flex items-center gap-2 rounded-xl border border-primary/40 bg-card/95 px-4 py-2 text-xs font-semibold shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-2">
            <CheckCircle2 className="size-4 text-emerald-500" />
            <span>{moveToast.text}</span>
          </div>
        )}

        {/* Kanban Board View with Full Drag & Drop */}
        {viewMode === "kanban" && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5 items-start">
            {STATUS_COLUMNS.map((col) => {
              const itemsInCol = filteredRequests.filter((r) => r.status === col.id)
              const Icon = col.icon
              const isOver = dragOverColId === col.id

              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOverColumn(e, col.id)}
                  onDragLeave={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                      setDragOverColId(null)
                    }
                  }}
                  onDrop={(e) => handleDropToColumn(e, col.id)}
                  className={cn(
                    "flex flex-col rounded-2xl border bg-muted/20 p-3 min-h-[480px] transition-all",
                    isOver ? col.activeBorder : "border-border/70",
                    isOver ? col.bg : "bg-muted/15"
                  )}
                >
                  {/* Column Header */}
                  <div className="mb-3 flex items-center justify-between pb-2 border-b border-border/60">
                    <div className="flex items-center gap-1.5 font-bold text-xs text-foreground">
                      <Icon className={cn("size-3.5", col.color)} />
                      <span>{col.label}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
                        {itemsInCol.length}
                      </Badge>
                      <button
                        type="button"
                        onClick={() => openSubmitModal("feature")}
                        className="size-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                        title={`Add ticket to ${col.label}`}
                      >
                        <Plus className="size-3" />
                      </button>
                    </div>
                  </div>

                  {/* Cards List */}
                  <div className="space-y-2.5 flex-1">
                    {itemsInCol.map((item) => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        isDragging={draggedItemId === item.id}
                        onDragStart={(e) => handleDragStart(e, item.id)}
                        onDragEnd={handleDragEnd}
                        onClick={() => handleOpenDetail(item)}
                        onUpvote={(e) => handleQuickUpvote(e, item)}
                        onQuickStatusChange={(newStatus) => handleMoveStatus(item.id, newStatus)}
                      />
                    ))}

                    {/* Empty Drop Zone */}
                    {itemsInCol.length === 0 && (
                      <div
                        className={cn(
                          "py-12 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-3 text-[11px] transition-colors",
                          isOver
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border/60 text-muted-foreground/60 italic"
                        )}
                      >
                        <span>{isOver ? "Release to drop ticket here" : "No items in this column"}</span>
                        <span className="text-[10px] opacity-75 mt-0.5">Drag tickets here to move</span>
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
          <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-muted/40 font-semibold text-muted-foreground">
                  <tr>
                    <th className="py-2.5 px-3">Ticket ID</th>
                    <th className="py-2.5 px-3">Type</th>
                    <th className="py-2.5 px-3">Title & Target Microservice</th>
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
                      <td className="py-2.5 px-3" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={item.status}
                          onChange={(e) => handleMoveStatus(item.id, e.target.value as RequestStatus)}
                          className="h-7 rounded-md border border-border bg-background px-2 text-xs font-medium cursor-pointer"
                        >
                          <option value="open">Open</option>
                          <option value="under_review">Under Review</option>
                          <option value="in_progress">In Progress</option>
                          <option value="merged">Merged</option>
                          <option value="closed">Closed</option>
                        </select>
                      </td>
                      <td className="py-2.5 px-3 text-muted-foreground">
                        <div className="text-foreground font-medium">{item.authorName}</div>
                        <div className="text-[10px]">{item.authorRole}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <button
                          type="button"
                          onClick={(e) => handleQuickUpvote(e, item)}
                          className="flex items-center gap-1 rounded px-2 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground cursor-pointer"
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
                          className="h-7 text-xs font-semibold text-primary hover:underline cursor-pointer"
                        >
                          Triage & Review →
                        </Button>
                      </td>
                    </tr>
                  ))}

                  {filteredRequests.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-muted-foreground">
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

      {/* Fixed Bottom Telemetry Bar */}
      <DashboardBottomBar branchName="master" />
    </div>
  )
}
