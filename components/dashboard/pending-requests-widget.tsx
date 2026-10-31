"use client"

import * as React from "react"
import Link from "next/link"
import {
  GitPullRequest,
  AlertCircle,
  ArrowRight,
  Plus,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { initialRequestsCatalog } from "@/lib/requests-data"
import type { FeedbackRequest } from "@/lib/db/schema"
import { cn } from "@/lib/utils"

interface PendingRequestsWidgetProps {
  onOpenSubmitRequest?: (type?: "feature" | "bug" | "pull_request") => void
  className?: string
}

export function PendingRequestsWidget({
  onOpenSubmitRequest,
  className,
}: PendingRequestsWidgetProps) {
  const [requests, setRequests] = React.useState<FeedbackRequest[]>(initialRequestsCatalog)

  // Compute pending metrics
  const pendingRequests = React.useMemo(() => {
    return requests.filter(
      (r) => r.status === "open" || r.status === "under_review"
    )
  }, [requests])

  const prReviewsCount = React.useMemo(() => {
    return pendingRequests.filter((r) => r.type === "pull_request").length
  }, [pendingRequests])

  const criticalBugsCount = React.useMemo(() => {
    return pendingRequests.filter(
      (r) => r.type === "bug" && (r.priority === "critical" || r.priority === "high")
    ).length
  }, [pendingRequests])

  const topPending = pendingRequests[0]

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-3 shadow-2xs backdrop-blur-xs transition-colors hover:border-violet-500/40",
        className
      )}
    >
      {/* Left: Summary & Stats */}
      <div className="flex items-center gap-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-violet-600 text-white shadow-xs">
          <GitPullRequest className="size-4" />
        </div>

        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold tracking-tight text-foreground">
              Pending Team Requests & Reviews
            </span>
            <Badge
              variant="outline"
              className="border-violet-500/40 bg-violet-500/10 text-violet-600 dark:text-violet-400 text-[10px] font-mono px-1.5 py-0"
            >
              {pendingRequests.length} Needs Attention
            </Badge>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className="font-semibold text-foreground">{prReviewsCount}</span> PRs awaiting review
            </span>
            <span>•</span>
            <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
              <AlertCircle className="size-3" />
              <span>{criticalBugsCount} High-Priority bug</span>
            </span>
            {topPending && (
              <>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline truncate max-w-xs text-muted-foreground/90 font-mono text-[10px]">
                  Latest: {topPending.id} ({topPending.title.slice(0, 35)}...)
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
        {onOpenSubmitRequest && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenSubmitRequest("feature")}
            className="h-7 cursor-pointer gap-1 px-2.5 text-xs text-muted-foreground hover:text-foreground"
          >
            <Plus className="size-3 text-primary" />
            <span className="hidden sm:inline">New Request</span>
          </Button>
        )}

        <Link href="/requests">
          <Button
            type="button"
            size="sm"
            className="h-7 cursor-pointer gap-1.5 bg-violet-600 px-3 text-xs font-medium text-white shadow-xs hover:bg-violet-700"
          >
            <span>Open Board</span>
            <ArrowRight className="size-3" />
          </Button>
        </Link>
      </div>
    </div>
  )
}

