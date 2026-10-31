"use client"

import * as React from "react"
import {
  AlertCircle,
  Bug,
  Check,
  ChevronDown,
  ExternalLink,
  Flame,
  GitBranch,
  GitPullRequest,
  GripVertical,
  Lightbulb,
  ThumbsUp,
  User,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { FeedbackRequest } from "@/lib/db/schema"
import { cn } from "@/lib/utils"

interface KanbanCardProps {
  item: FeedbackRequest
  isDragging?: boolean
  onClick: () => void
  onUpvote: (e: React.MouseEvent) => void
  onDragStart: (e: React.DragEvent) => void
  onDragEnd: (e: React.DragEvent) => void
  onQuickStatusChange: (newStatus: "open" | "under_review" | "in_progress" | "merged" | "closed") => void
}

export function KanbanCard({
  item,
  isDragging,
  onClick,
  onUpvote,
  onDragStart,
  onDragEnd,
  onQuickStatusChange,
}: KanbanCardProps) {
  const [showStatusMenu, setShowStatusMenu] = React.useState(false)

  const typeConfig = {
    pull_request: {
      badgeClass: "border-purple-500/30 bg-purple-500/10 text-purple-600 dark:text-purple-400",
      borderHover: "hover:border-purple-500/50",
      icon: GitPullRequest,
      label: "PR / Fix",
    },
    bug: {
      badgeClass: "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400",
      borderHover: "hover:border-rose-500/50",
      icon: Bug,
      label: "Bug Report",
    },
    feature: {
      badgeClass: "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
      borderHover: "hover:border-emerald-500/50",
      icon: Lightbulb,
      label: "Feature",
    },
  }[item.type] || {
    badgeClass: "border-primary/30 bg-primary/10 text-primary",
    borderHover: "hover:border-primary/50",
    icon: Lightbulb,
    label: item.type,
  }

  const Icon = typeConfig.icon

  // Priority color
  const priorityColor = {
    critical: "text-rose-600 font-bold",
    high: "text-amber-500 font-semibold",
    medium: "text-blue-500",
    low: "text-muted-foreground",
  }[item.priority] || "text-muted-foreground"

  let tags: string[] = []
  try {
    tags = JSON.parse(item.tags || "[]")
  } catch {
    tags = []
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={cn(
        "group relative cursor-grab active:cursor-grabbing rounded-xl border border-border bg-card p-3 shadow-2xs transition-all hover:shadow-md select-none",
        typeConfig.borderHover,
        isDragging && "opacity-40 border-dashed scale-[0.98] ring-2 ring-primary/40",
        item.priority === "critical" && "ring-1 ring-rose-500/30"
      )}
    >
      {/* Top Header: Drag handle, Type badge, Ticket ID, Upvotes */}
      <div className="mb-2 flex items-center justify-between gap-1 text-[11px]">
        <div className="flex items-center gap-1.5 min-w-0">
          <GripVertical className="size-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors shrink-0" />
          <Badge
            variant="outline"
            className={cn("text-[10px] font-mono font-bold px-1.5 py-0 shrink-0", typeConfig.badgeClass)}
          >
            <Icon className="mr-1 size-2.5 inline" />
            {item.id}
          </Badge>

          {item.severity && (
            <span
              className={cn(
                "rounded px-1.5 py-0.2 text-[9px] font-bold shrink-0",
                item.severity === "P0" || item.severity === "P1"
                  ? "bg-rose-500 text-white animate-pulse"
                  : "bg-amber-500/20 text-amber-700 dark:text-amber-400"
              )}
            >
              {item.severity}
            </span>
          )}
        </div>

        {/* Upvote button */}
        <button
          type="button"
          onClick={onUpvote}
          className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all cursor-pointer shadow-2xs"
          title="Upvote ticket (+1)"
        >
          <ThumbsUp className="size-2.5 text-primary" />
          <span>{item.upvotes}</span>
        </button>
      </div>

      {/* Ticket Title */}
      <h4 className="mb-1.5 text-xs font-semibold leading-snug text-foreground group-hover:text-primary transition-colors line-clamp-2">
        {item.title}
      </h4>

      {/* Target service & branch */}
      <div className="mb-2 text-[10px] text-muted-foreground flex flex-wrap items-center gap-1">
        <span className="font-medium text-foreground/85 truncate max-w-[140px]">
          {item.targetService}
        </span>
        {item.branchName && (
          <span className="inline-flex items-center gap-0.5 rounded bg-muted/60 px-1 font-mono text-[9px] text-amber-600 dark:text-amber-400 truncate max-w-[120px]">
            <GitBranch className="size-2 shrink-0" />
            <span className="truncate">{item.branchName}</span>
          </span>
        )}
      </div>

      {/* Code diff indicator if PR */}
      {item.type === "pull_request" && item.diffContent && (
        <div className="mb-2 rounded bg-slate-950 px-2 py-0.5 font-mono text-[9.5px] text-emerald-400 border border-slate-800 flex items-center justify-between">
          <span>Git Diff Attached</span>
          <span className="text-[8.5px] text-slate-400">Review ↗</span>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-1">
          {tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded bg-muted/50 px-1 py-0.2 text-[9px] font-mono text-muted-foreground"
            >
              #{tag}
            </span>
          ))}
          {tags.length > 3 && (
            <span className="text-[9px] font-mono text-muted-foreground">
              +{tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Bottom Footer: Author, Priority, Quick Move menu */}
      <div className="flex items-center justify-between border-t border-border/60 pt-2 text-[10px] text-muted-foreground">
        <div className="flex items-center gap-1.5 min-w-0">
          <div
            className="flex size-4 shrink-0 items-center justify-center rounded-full text-[8px] font-bold text-white shadow-2xs"
            style={{ backgroundColor: item.authorAvatar || "#3b82f6" }}
          >
            {item.authorName.charAt(0).toUpperCase()}
          </div>
          <span className="truncate max-w-[90px] font-medium text-foreground/80">
            {item.authorName}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <span className={cn("capitalize font-mono text-[10px]", priorityColor)}>
            {item.priority}
          </span>

          {/* Quick status dropdown for keyboard/touch users */}
          <div className="relative">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setShowStatusMenu(!showStatusMenu)
              }}
              className="size-4 flex items-center justify-center rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
              title="Move ticket status"
            >
              <ChevronDown className="size-3" />
            </button>

            {showStatusMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-6 z-30 w-36 rounded-xl border border-border bg-card p-1 shadow-xl text-xs backdrop-blur-md"
              >
                <div className="px-2 py-1 text-[10px] font-bold uppercase text-muted-foreground border-b border-border mb-1">
                  Move to
                </div>
                {(
                  [
                    { id: "open", label: "Open (New)" },
                    { id: "under_review", label: "Under Review" },
                    { id: "in_progress", label: "In Progress" },
                    { id: "merged", label: "Merged / Done" },
                    { id: "closed", label: "Closed" },
                  ] as const
                ).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => {
                      setShowStatusMenu(false)
                      onQuickStatusChange(s.id)
                    }}
                    className={cn(
                      "w-full text-left px-2 py-1 rounded text-[11px] cursor-pointer hover:bg-muted transition-colors flex items-center justify-between",
                      item.status === s.id && "font-bold text-primary"
                    )}
                  >
                    <span>{s.label}</span>
                    {item.status === s.id && <Check className="size-3" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

