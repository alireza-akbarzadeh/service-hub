"use client"

import * as React from "react"
import Link from "next/link"
import type { Deployment } from "@/lib/dora-metrics-data"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  AlertTriangle,
  ArrowRight,
  Check,
  CheckCircle2,
  Clock,
  Copy,
  ExternalLink,
  GitBranch,
  GitCommit,
  GitPullRequest,
  RotateCcw,
  ShieldAlert,
  Terminal,
  User,
  XCircle,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface DeploymentDetailSheetProps {
  deployment: Deployment | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeploymentDetailSheet({
  deployment,
  open,
  onOpenChange,
}: DeploymentDetailSheetProps) {
  const [copiedLog, setCopiedLog] = React.useState(false)

  if (!deployment) return null

  const isSuccess = deployment.status === "success"
  const isRolledBack = deployment.status === "rolled_back"
  const isFailed = deployment.status === "failed"

  const handleCopySummary = () => {
    const summary = [
      `🚀 DEPLOYMENT AUDIT: ${deployment.id}`,
      `Service: ${deployment.serviceName} (${deployment.environment})`,
      `Status: ${deployment.status.toUpperCase()}`,
      `Commit: ${deployment.commitHash} - ${deployment.commitMessage}`,
      `Author: ${deployment.author.name} [${deployment.author.squad}]`,
      `Pipeline Duration: ${deployment.pipelineDurationSeconds}s`,
      `Timestamp: ${deployment.deployedAt}`,
      ...(deployment.failureReason ? [`Failure Reason: ${deployment.failureReason}`] : []),
    ].join("\n")

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(summary).catch(() => {})
    }
    setCopiedLog(true)
    setTimeout(() => setCopiedLog(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-xl overflow-y-auto p-0 border-l border-border bg-background"
      >
        {/* Header Hero */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 p-6 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-[10px] font-bold uppercase tracking-wider",
                    isSuccess && "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
                    isRolledBack && "border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400",
                    isFailed && "border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400"
                  )}
                >
                  {isSuccess && <CheckCircle2 className="mr-1 size-3 inline" />}
                  {isRolledBack && <RotateCcw className="mr-1 size-3 inline" />}
                  {isFailed && <XCircle className="mr-1 size-3 inline" />}
                  {deployment.status.replace("_", " ")}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {deployment.environment}
                </Badge>
                <span className="font-mono text-xs text-muted-foreground">{deployment.id}</span>
              </div>
              <SheetTitle className="text-lg font-bold text-foreground">
                {deployment.serviceName}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground font-mono">
                Commit {deployment.commitHash} • {deployment.branch}
              </SheetDescription>
            </div>

            {/* Elapsed Duration Pill */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-2.5 text-center shrink-0">
              <span className="text-xl font-black font-mono tracking-tight text-foreground">
                {deployment.pipelineDurationSeconds}s
              </span>
              <span className="text-[9px] uppercase font-semibold text-muted-foreground">
                Pipeline
              </span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopySummary}
              className="h-7 text-xs gap-1.5 cursor-pointer"
            >
              {copiedLog ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span>Copied Info</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy Summary</span>
                </>
              )}
            </Button>

            <Link href="/requests" target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer"
              >
                <GitPullRequest className="size-3 text-purple-500" />
                <span>View Requests</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Commit & Author Card */}
          <div className="rounded-lg border border-border bg-card/60 p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  Git Commit Message
                </span>
                <p className="text-xs font-semibold text-foreground leading-snug">
                  {deployment.commitMessage}
                </p>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 font-mono text-xs rounded bg-muted/60 px-2 py-0.5 text-muted-foreground">
                <GitCommit className="size-3.5 text-primary" />
                <span>{deployment.commitHash}</span>
              </div>
            </div>

            <Separator />

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Author</span>
                <div className="flex items-center gap-1.5 font-medium text-foreground">
                  <div
                    className="size-4 rounded-full flex items-center justify-center text-[8px] font-bold text-white"
                    style={{ backgroundColor: deployment.author.avatar || "#3b82f6" }}
                  >
                    {deployment.author.name.charAt(0)}
                  </div>
                  <span>{deployment.author.name}</span>
                </div>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Squad Owner</span>
                <p className="font-medium text-foreground">{deployment.author.squad}</p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Deployed At</span>
                <p className="font-mono text-[11px] text-muted-foreground">
                  {new Date(deployment.deployedAt).toLocaleString()}
                </p>
              </div>

              <div className="space-y-0.5">
                <span className="text-[10px] text-muted-foreground uppercase font-medium">Git Branch</span>
                <div className="flex items-center gap-1 font-mono text-[11px] text-amber-600 dark:text-amber-400">
                  <GitBranch className="size-3" />
                  <span>{deployment.branch}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Failure / Rollback Warning Banner */}
          {(isFailed || isRolledBack) && deployment.failureReason && (
            <div className="rounded-lg border border-rose-500/30 bg-rose-500/10 p-4 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-rose-600 dark:text-rose-400">
                <ShieldAlert className="size-4" />
                <span>
                  {isRolledBack ? "Deployment Rolled Back" : "Pipeline Execution Failed"}
                </span>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                {deployment.failureReason}
              </p>
              {deployment.rollbackDurationSeconds && (
                <p className="text-[11px] font-mono text-muted-foreground pt-1">
                  Automated rollback executed in {deployment.rollbackDurationSeconds}s.
                </p>
              )}
            </div>
          )}

          {/* CI/CD Pipeline Stages */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              CI/CD Pipeline Stages & Verification
            </h4>
            <div className="space-y-2">
              {(deployment.pipelineSteps || [
                { name: "Code Lint & Static Analysis", durationSeconds: 15, status: "success" },
                { name: "Unit & Integration Tests", durationSeconds: 42, status: "success" },
                { name: "Docker Container Build & Scan", durationSeconds: 58, status: "success" },
                { name: "Kubernetes Rolling Deployment", durationSeconds: 25, status: "success" },
              ]).map((step, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border p-3 text-xs bg-muted/20"
                >
                  <div className="flex items-center gap-2">
                    {step.status === "success" ? (
                      <CheckCircle2 className="size-4 text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle className="size-4 text-rose-500 shrink-0" />
                    )}
                    <span className="font-medium text-foreground">{step.name}</span>
                  </div>
                  <span className="font-mono text-muted-foreground">{step.durationSeconds}s</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
