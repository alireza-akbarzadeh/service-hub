"use client"

import * as React from "react"
import Link from "next/link"
import type { ServiceScorecard, ScoreTier } from "@/lib/scorecards-data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet"
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Activity,
  FileText,
  Users,
  Copy,
  Check,
  ArrowRight,
  TrendingUp,
  Award,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ScorecardDetailSheetProps {
  scorecard: ServiceScorecard | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const TIER_CONFIG: Record<
  ScoreTier,
  { label: string; color: string; bg: string; border: string; desc: string }
> = {
  platinum: {
    label: "Platinum Tier",
    color: "text-cyan-500",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    desc: "Exceeds all production standards. Certified for Tier 0 mission-critical enterprise workloads.",
  },
  gold: {
    label: "Gold Tier",
    color: "text-amber-500",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    desc: "Production-ready with high reliability and security. Minor documentation or observability improvements recommended.",
  },
  silver: {
    label: "Silver Tier",
    color: "text-slate-400",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    desc: "Acceptable for staging and development. Hardening required before promotion to customer-facing traffic.",
  },
  bronze: {
    label: "Bronze Tier",
    color: "text-orange-500",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    desc: "Action required. Missing essential security, ownership, or health check infrastructure.",
  },
}

export function ScorecardDetailSheet({
  scorecard,
  open,
  onOpenChange,
}: ScorecardDetailSheetProps) {
  const [copiedSummary, setCopiedSummary] = React.useState(false)

  if (!scorecard) return null

  const tierInfo = TIER_CONFIG[scorecard.tier]
  const passedRules = scorecard.rules.filter((r) => r.passed)
  const failedRules = scorecard.rules.filter((r) => !r.passed)

  const handleCopySummary = () => {
    const summary = [
      `🛡️ SERVICE SCORECARD AUDIT: ${scorecard.serviceName}`,
      `Readiness Tier: ${tierInfo.label} (${scorecard.percentage}%)`,
      `Owner: ${scorecard.owner} | Category: ${scorecard.category} | Env: ${scorecard.environment}`,
      `Total Score: ${scorecard.totalScore} / ${scorecard.maxScore} pts`,
      `Passed Checks: ${passedRules.length} / ${scorecard.rules.length}`,
      "",
      "--- PILLAR SCORES ---",
      `• Reliability & SLA: ${scorecard.pillars.reliability?.percentage}%`,
      `• Security & TLS: ${scorecard.pillars.security?.percentage}%`,
      `• Observability: ${scorecard.pillars.observability?.percentage}%`,
      `• Documentation: ${scorecard.pillars.documentation?.percentage}%`,
      `• Operations & Ownership: ${scorecard.pillars.operations?.percentage}%`,
      "",
      failedRules.length > 0 ? "--- ACTIONABLE REMEDIATION ---" : "--- NO CRITICAL GAPS ---",
      ...scorecard.actionItems.map((item, idx) => `${idx + 1}. ${item}`),
    ].join("\n")

    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(summary).catch(() => {})
    }
    setCopiedSummary(true)
    setTimeout(() => setCopiedSummary(false), 2000)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full sm:max-w-2xl overflow-y-auto p-0 border-l border-border bg-background"
      >
        {/* Header Hero */}
        <div className="sticky top-0 z-20 border-b border-border bg-background/95 p-6 backdrop-blur-md">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "font-mono text-xs font-semibold uppercase tracking-wider",
                    tierInfo.bg,
                    tierInfo.color,
                    tierInfo.border
                  )}
                >
                  <Award className="mr-1 size-3.5" />
                  {tierInfo.label}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {scorecard.environment}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {scorecard.category}
                </Badge>
              </div>
              <SheetTitle className="text-xl font-bold tracking-tight text-foreground">
                {scorecard.serviceName}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground line-clamp-2">
                {scorecard.description}
              </SheetDescription>
            </div>

            {/* Score Ring / Pill */}
            <div className="flex flex-col items-center justify-center rounded-xl border border-border bg-muted/40 p-3 text-center shrink-0">
              <span className="text-2xl font-black font-mono tracking-tight text-foreground">
                {scorecard.percentage}%
              </span>
              <span className="text-[10px] uppercase font-semibold text-muted-foreground">
                Readiness
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
              {copiedSummary ? (
                <>
                  <Check className="size-3 text-emerald-500" />
                  <span>Copied Audit</span>
                </>
              ) : (
                <>
                  <Copy className="size-3" />
                  <span>Copy Audit Report</span>
                </>
              )}
            </Button>

            <Link
              href={`/playground?url=${encodeURIComponent(scorecard.url)}`}
              target="_blank"
            >
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs gap-1.5 cursor-pointer text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/10"
              >
                <Zap className="size-3 text-amber-500" />
                <span>Test in Playground</span>
              </Button>
            </Link>

            <a
              href={scorecard.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center"
            >
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <span>Open URL</span>
                <ExternalLink className="size-3 ml-0.5" />
              </Button>
            </a>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 text-sm">
          {/* Tier Explanation Card */}
          <div
            className={cn(
              "rounded-lg border p-4 text-xs leading-relaxed",
              tierInfo.bg,
              tierInfo.border
            )}
          >
            <div className="flex items-center gap-2 font-semibold mb-1 text-foreground">
              <Sparkles className={cn("size-4", tierInfo.color)} />
              <span>Assessment Summary</span>
            </div>
            <p className="text-muted-foreground">{tierInfo.desc}</p>
            <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-muted-foreground">
              <span>Owner Squad: <strong className="text-foreground">{scorecard.owner}</strong></span>
              <span>•</span>
              <span>Score: <strong className="text-foreground">{scorecard.totalScore} / {scorecard.maxScore} pts</strong></span>
              <span>•</span>
              <span>Passed: <strong className="text-emerald-500">{passedRules.length}</strong> / {scorecard.rules.length} rules</span>
            </div>
          </div>

          {/* 5-Pillar Score Gauges */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Architectural Pillars Breakdown
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(scorecard.pillars).map(([key, pillar]) => {
                const pct = pillar.percentage
                const isHigh = pct >= 80
                const isMedium = pct >= 60 && pct < 80
                return (
                  <div
                    key={key}
                    className="rounded-lg border border-border bg-card/60 p-3 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-medium">
                      <span className="text-foreground">{pillar.label}</span>
                      <span className="font-mono font-bold text-foreground">
                        {pillar.score}/{pillar.maxScore} ({pct}%)
                      </span>
                    </div>
                    {/* Progress Bar */}
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          isHigh
                            ? "bg-emerald-500"
                            : isMedium
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        )}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <Separator />

          {/* Actionable Remediation Checklist (if any failed) */}
          {failedRules.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold uppercase tracking-wider text-amber-500 flex items-center gap-1.5">
                  <TrendingUp className="size-3.5" />
                  Path to Platinum / Remediation Plan ({failedRules.length} items)
                </h4>
              </div>
              <div className="space-y-2">
                {failedRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="flex items-start gap-2.5 rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-xs"
                  >
                    <AlertTriangle className="size-4 shrink-0 text-amber-500 mt-0.5" />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {rule.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-[9px] px-1 py-0 border-amber-500/30 text-amber-600 dark:text-amber-400"
                        >
                          +{rule.maxPoints - rule.earnedPoints} pts available
                        </Badge>
                      </div>
                      <p className="text-muted-foreground leading-relaxed">
                        {rule.recommendation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-3">
              <CheckCircle2 className="size-5 shrink-0" />
              <div>
                <p className="font-semibold">Flawless Production Score!</p>
                <p className="text-[11px] opacity-90">
                  This service complies with all 15 enterprise architecture, security, and observability standards.
                </p>
              </div>
            </div>
          )}

          <Separator />

          {/* Full 15-Rule Inspection Checklist */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Complete Rules & Audit Criteria ({scorecard.rules.length} Rules)
            </h4>
            <div className="space-y-2">
              {scorecard.rules.map((rule) => (
                <div
                  key={rule.id}
                  className="flex items-start justify-between gap-3 rounded-lg border border-border p-3 text-xs bg-muted/20"
                >
                  <div className="flex items-start gap-2.5">
                    {rule.passed ? (
                      <CheckCircle2 className="size-4 shrink-0 text-emerald-500 mt-0.5" />
                    ) : (
                      <XCircle className="size-4 shrink-0 text-rose-500 mt-0.5" />
                    )}
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {rule.name}
                        </span>
                        <Badge
                          variant="outline"
                          className="font-mono text-[9px] px-1 py-0 capitalize"
                        >
                          {rule.pillar}
                        </Badge>
                        {rule.importance === "critical" && (
                          <Badge
                            variant="destructive"
                            className="text-[9px] px-1 py-0 uppercase"
                          >
                            Critical
                          </Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground">{rule.description}</p>
                    </div>
                  </div>

                  <div className="shrink-0 text-right font-mono text-xs">
                    <span
                      className={cn(
                        "font-bold",
                        rule.passed ? "text-emerald-500" : "text-rose-500"
                      )}
                    >
                      {rule.earnedPoints}
                    </span>
                    <span className="text-muted-foreground">/{rule.maxPoints} pts</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
