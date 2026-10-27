"use client"

import * as React from "react"
import type { Service } from "@/lib/db/schema"
import type { HealthCheckResult } from "@/app/actions/services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Activity,
  Check,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  Globe2,
  Layers,
  Server,
  Star,
  Trash2,
  User,
} from "lucide-react"
import { getServiceTags } from "@/hooks/use-services-dashboard"
import { GridConfig, ViewShape, DEFAULT_GRID_CONFIG } from "./grid-view-config"

interface ServicesCardsGridProps {
  services: Service[]
  favorites: number[]
  onToggleFavorite: (id: number) => void
  onInspectService: (svc: Service) => void
  onEditService: (svc: Service) => void
  onDeleteService: (id: number, name: string) => void
  onCopyUrl: (url: string, id: number) => void
  copiedId: number | null
  healthMap: Record<number, HealthCheckResult>
  telemetryMap?: Record<
    number,
    { uptimeRate: number; avgLatency: number; sparkline: number[] }
  >
  onPingSingle: (svc: Service, e?: React.MouseEvent) => void
  mirrorMap: Map<number, Service[]>
  networkInfo: any
  selectedTag: string
  onSelectTag: (tag: string) => void
  onResetFilters: () => void
  gridConfig?: GridConfig
  viewShape?: ViewShape
}

function renderStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "operational":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono text-[10px]"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Operational
        </Badge>
      )
    case "degraded":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono text-[10px]"
        >
          <span className="size-1.5 rounded-full bg-amber-500" />
          Degraded
        </Badge>
      )
    case "maintenance":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400 font-mono text-[10px]"
        >
          <span className="size-1.5 rounded-full bg-sky-500" />
          Maintenance
        </Badge>
      )
    default:
      return (
        <Badge variant="secondary" className="font-mono text-[10px]">
          {status}
        </Badge>
      )
  }
}

export function ServicesCardsGrid({
  services,
  favorites,
  onToggleFavorite,
  onInspectService,
  onEditService,
  onDeleteService,
  onCopyUrl,
  copiedId,
  healthMap,
  telemetryMap,
  onPingSingle,
  mirrorMap,
  networkInfo,
  selectedTag,
  onSelectTag,
  onResetFilters,
  gridConfig = DEFAULT_GRID_CONFIG,
  viewShape,
}: ServicesCardsGridProps) {
  // Use prop or config shape
  const activeShape: ViewShape = viewShape || gridConfig.viewShape || "square-card"

  if (services.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 p-12 text-center text-muted-foreground shadow-2xs">
        <Server className="size-10 opacity-30 text-primary" />
        <div className="space-y-1">
          <p className="text-sm font-semibold text-foreground">No services found</p>
          <p className="text-xs text-muted-foreground">
            No microservices match your current category, environment, or search filters.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onResetFilters} className="mt-2 text-xs cursor-pointer">
          Reset Filters
        </Button>
      </div>
    )
  }

  const isCompact = gridConfig.cardDensity === "compact"

  // -------------------------------------------------------------
  // SHAPE 2: ROW CARD (Horizontal full-width structured cards)
  // -------------------------------------------------------------
  if (activeShape === "row-card") {
    return (
      <div className="flex flex-col space-y-3">
        {services.map((svc) => {
          const isFav = favorites.includes(svc.id)
          const hops = mirrorMap.get(svc.id) || []
          const tags = getServiceTags(svc)
          const health = healthMap[svc.id]
          const telemetry = telemetryMap ? telemetryMap[svc.id] : undefined

          return (
            <div
              key={svc.id}
              className={cn(
                "group relative flex flex-col justify-between rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-xs",
                isCompact ? "p-3 space-y-2" : "p-4 space-y-3",
                isFav &&
                  "ring-1 ring-amber-500/30 border-amber-500/40 bg-linear-to-r from-amber-500/5 via-card to-card"
              )}
            >
              {/* Top Row: Favorite, Name, Env, Category, Owner, Status */}
              <div className="flex flex-wrap items-center justify-between gap-2.5">
                <div className="flex flex-wrap items-center gap-2 min-w-0">
                  {/* Favorite pin */}
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(svc.id)}
                    className="cursor-pointer shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-amber-500"
                    title={isFav ? "Unpin service" : "Pin service"}
                  >
                    <Star
                      className={cn(
                        "size-4 transition-transform group-hover:scale-110",
                        isFav
                          ? "fill-amber-400 text-amber-500"
                          : "text-muted-foreground/30 hover:text-amber-500"
                      )}
                    />
                  </button>

                  {/* Service Name */}
                  <button
                    type="button"
                    onClick={() => onInspectService(svc)}
                    className="cursor-pointer truncate text-left text-sm font-bold text-foreground transition-colors hover:text-primary"
                    title="Click to inspect service details"
                  >
                    {svc.name}
                  </button>

                  {/* Environment & Category Badges */}
                  <Badge
                    variant="secondary"
                    className="font-mono text-[10px] px-1.5 py-0 font-medium"
                  >
                    {svc.environment}
                  </Badge>

                  <span className="text-[11px] text-muted-foreground font-medium">
                    • {svc.category}
                  </span>

                  {gridConfig.showOwner && svc.owner && (
                    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                      <User className="size-2.5 opacity-70" />
                      <span>{svc.owner}</span>
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <div className="shrink-0">{renderStatusBadge(svc.status)}</div>
              </div>

              {/* Middle Section: Description & Tags */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pl-7">
                {gridConfig.showDescription !== false && (
                  <p
                    className={cn(
                      "text-xs text-muted-foreground leading-relaxed flex-1",
                      isCompact ? "line-clamp-1" : "line-clamp-2"
                    )}
                  >
                    {svc.description}
                  </p>
                )}

                {/* Tags Strip */}
                {gridConfig.showTags && tags.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1 shrink-0">
                    {tags.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => onSelectTag(tag)}
                        className={cn(
                          "rounded px-1.5 py-0 font-mono text-[9px] transition-colors cursor-pointer",
                          selectedTag === tag
                            ? "bg-primary text-primary-foreground font-semibold"
                            : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Bottom Row: Telemetry, Hops, URL link, Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border/50 pt-2.5 pl-7">
                {/* Left sub-bar: Telemetry & Hops */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Ping latency & uptime */}
                  {gridConfig.showTelemetry && (
                    <div className="flex items-center gap-1.5">
                      {health ? (
                        <div
                          onClick={(e) => onPingSingle(svc, e)}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition-all",
                            health.status === "online"
                              ? "border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                              : health.status === "warning"
                                ? "border-amber-500/30 bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400"
                                : "border-destructive/30 bg-destructive/10 font-medium text-destructive"
                          )}
                          title={`Ping again: ${health.message || health.status} (${health.latencyMs}ms)`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          <span>{health.latencyMs}ms</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => onPingSingle(svc, e)}
                          className="inline-flex cursor-pointer items-center gap-1 rounded border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Run live ping check"
                        >
                          <Activity className="size-2.5 opacity-60" />
                          <span>Ping</span>
                        </button>
                      )}

                      {telemetry && (
                        <span
                          className={cn(
                            "rounded px-1.5 py-0.5 font-mono text-[9px] font-semibold border",
                            telemetry.uptimeRate >= 95
                              ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                              : telemetry.uptimeRate >= 80
                                ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                                : "border-destructive/30 text-destructive bg-destructive/5"
                          )}
                          title={`30-day reliability: ${telemetry.uptimeRate}% • Avg: ${telemetry.avgLatency}ms`}
                        >
                          {telemetry.uptimeRate}% SLA
                        </span>
                      )}

                      {telemetry && telemetry.sparkline?.length > 0 && (
                        <div
                          className="flex items-end gap-0.5 h-4 px-1 py-0.5 rounded bg-muted/40"
                          title="Recent check latencies"
                        >
                          {telemetry.sparkline.slice(-6).map((lat, idx) => {
                            const heightPercent = Math.min(
                              Math.max((lat / 150) * 100, 20),
                              100
                            )
                            return (
                              <span
                                key={idx}
                                style={{ height: `${heightPercent}%` }}
                                className={cn(
                                  "w-1 rounded-t-2xs",
                                  lat <= 90
                                    ? "bg-emerald-500/80"
                                    : lat <= 130
                                      ? "bg-amber-500/80"
                                      : "bg-destructive/80"
                                )}
                              />
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Mirror hops */}
                  {gridConfig.showHops && hops.length > 0 && (
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-[10px] text-muted-foreground">
                        Hop:
                      </span>
                      {hops.map((m) => {
                        const shortEnv =
                          m.environment === "Develop"
                            ? "Dev"
                            : m.environment === "Test"
                              ? "Test"
                              : m.environment === "Stage"
                                ? "Stage"
                                : m.environment
                        return (
                          <a
                            key={m.id}
                            href={m.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`Jump to ${m.environment}: ${m.name}`}
                            className="inline-flex cursor-pointer items-center gap-0.5 rounded border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                          >
                            <span>{shortEnv}</span>
                            <ExternalLink className="size-2.5 opacity-60" />
                          </a>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* Right sub-bar: URL Open, Copy & Actions */}
                <div className="flex items-center gap-2 ml-auto">
                  <a
                    href={svc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline truncate max-w-[160px] sm:max-w-[220px]"
                    title={svc.url}
                  >
                    <Globe2 className="size-3 shrink-0" />
                    <span className="truncate">{svc.url.replace(/^https?:\/\//, "")}</span>
                    <ExternalLink className="size-2.5 shrink-0" />
                  </a>

                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => onCopyUrl(svc.url, svc.id)}
                    className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Copy endpoint URL"
                  >
                    {copiedId === svc.id ? (
                      <Check className="size-3 text-emerald-500" />
                    ) : (
                      <Copy className="size-3" />
                    )}
                  </Button>

                  {!networkInfo.isIran &&
                    networkInfo.countryCode &&
                    (svc.url.includes("hasti.co") ||
                      svc.url.includes("tapsi.shop") ||
                      svc.url.includes("172.")) && (
                      <span
                        className="cursor-help font-mono text-[9px] font-semibold text-amber-600 dark:text-amber-400"
                        title="Iran Net restricted"
                      >
                        ⚠️ Net
                      </span>
                    )}

                  <div className="h-4 w-px bg-border/60 mx-0.5" />

                  {/* Actions */}
                  <div className="flex items-center gap-0.5">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onInspectService(svc)}
                      title="Inspect service details & snippets"
                      className="size-6 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEditService(svc)}
                      title="Edit service"
                      className="size-6 cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDeleteService(svc.id, svc.name)}
                      title="Delete service"
                      className="size-6 cursor-pointer text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // -------------------------------------------------------------
  // SHAPE 3: SQUARED CARD (Multi-column modular square box cards)
  // -------------------------------------------------------------
  const gridColumnClass =
    gridConfig.cardColumns === "2"
      ? "grid-cols-1 md:grid-cols-2"
      : gridConfig.cardColumns === "3"
        ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        : gridConfig.cardColumns === "4"
          ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4"

  return (
    <div className={cn("grid gap-3.5", gridColumnClass)}>
      {services.map((svc) => {
        const isFav = favorites.includes(svc.id)
        const hops = mirrorMap.get(svc.id) || []
        const tags = getServiceTags(svc)
        const health = healthMap[svc.id]
        const telemetry = telemetryMap ? telemetryMap[svc.id] : undefined

        return (
          <div
            key={svc.id}
            className={cn(
              "group relative flex flex-col justify-between rounded-xl border border-border bg-card transition-all duration-200 hover:border-primary/50 hover:shadow-xs",
              isCompact ? "p-3 space-y-2.5" : "p-4 space-y-3",
              isFav &&
                "ring-1 ring-amber-500/30 border-amber-500/40 bg-linear-to-b from-amber-500/5 to-transparent"
            )}
          >
            {/* Header: Title, Star, and Status Badge */}
            <div className="space-y-1.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(svc.id)}
                    className="cursor-pointer shrink-0 rounded p-1 text-muted-foreground transition-colors hover:text-amber-500"
                    title={isFav ? "Unpin service" : "Pin service"}
                  >
                    <Star
                      className={cn(
                        "size-4 transition-transform group-hover:scale-110",
                        isFav
                          ? "fill-amber-400 text-amber-500"
                          : "text-muted-foreground/30 hover:text-amber-500"
                      )}
                    />
                  </button>

                  <button
                    type="button"
                    onClick={() => onInspectService(svc)}
                    className="cursor-pointer truncate text-left text-sm font-bold text-foreground transition-colors hover:text-primary"
                    title="Click to inspect service details"
                  >
                    {svc.name}
                  </button>
                </div>

                <div className="shrink-0">{renderStatusBadge(svc.status)}</div>
              </div>

              {/* Sub-header: Environment, Category & Owner tags */}
              <div className="flex flex-wrap items-center gap-1.5 pl-6">
                <Badge
                  variant="secondary"
                  className="font-mono text-[10px] px-1.5 py-0 font-medium"
                >
                  {svc.environment}
                </Badge>
                <span className="text-[11px] text-muted-foreground font-medium">
                  • {svc.category}
                </span>
                {gridConfig.showOwner && svc.owner && (
                  <span className="flex items-center gap-1 font-mono text-[10px] text-muted-foreground/80 ml-auto">
                    <User className="size-2.5" />
                    <span>{svc.owner}</span>
                  </span>
                )}
              </div>
            </div>

            {/* Middle: Description */}
            {gridConfig.showDescription !== false && (
              <div className="pl-6">
                <p
                  className={cn(
                    "text-xs text-muted-foreground leading-relaxed",
                    isCompact ? "line-clamp-2" : "line-clamp-3"
                  )}
                >
                  {svc.description}
                </p>
              </div>
            )}

            {/* Tags Strip */}
            {gridConfig.showTags && tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 pl-6">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSelectTag(tag)}
                    className={cn(
                      "rounded px-1.5 py-0 font-mono text-[9px] transition-colors cursor-pointer",
                      selectedTag === tag
                        ? "bg-primary text-primary-foreground font-semibold"
                        : "bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Telemetry & Health Checks Strip */}
            {gridConfig.showTelemetry && (
              <div className="flex items-center justify-between border-t border-border/50 pt-2 text-xs">
                {/* Ping latency */}
                <div className="flex items-center gap-1.5">
                  {health ? (
                    <div
                      onClick={(e) => onPingSingle(svc, e)}
                      className={cn(
                        "inline-flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition-all",
                        health.status === "online"
                          ? "border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                          : health.status === "warning"
                            ? "border-amber-500/30 bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400"
                            : "border-destructive/30 bg-destructive/10 font-medium text-destructive"
                      )}
                      title={`Ping again: ${health.message || health.status} (${health.latencyMs}ms)`}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      <span>{health.latencyMs}ms</span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => onPingSingle(svc, e)}
                      className="inline-flex cursor-pointer items-center gap-1 rounded border border-border/80 bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      title="Run live ping check"
                    >
                      <Activity className="size-2.5 opacity-60" />
                      <span>Ping</span>
                    </button>
                  )}

                  {/* 30-day uptime badge */}
                  {telemetry && (
                    <span
                      className={cn(
                        "rounded px-1 py-0.5 font-mono text-[9px] font-semibold border",
                        telemetry.uptimeRate >= 95
                          ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                          : telemetry.uptimeRate >= 80
                            ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                            : "border-destructive/30 text-destructive bg-destructive/5"
                      )}
                      title={`30-day reliability: ${telemetry.uptimeRate}% • Avg: ${telemetry.avgLatency}ms`}
                    >
                      {telemetry.uptimeRate}% SLA
                    </span>
                  )}
                </div>

                {/* Sparkline */}
                {telemetry && telemetry.sparkline?.length > 0 && (
                  <button
                    type="button"
                    onClick={() => onInspectService(svc)}
                    className="flex items-end gap-0.5 h-4 px-1.5 py-0.5 rounded bg-muted/40 hover:bg-muted cursor-pointer transition-colors"
                    title={`Neon Latency History (${telemetry.sparkline.length} checks). Click to inspect.`}
                  >
                    {telemetry.sparkline.slice(-6).map((lat, idx) => {
                      const heightPercent = Math.min(
                        Math.max((lat / 150) * 100, 20),
                        100
                      )
                      return (
                        <span
                          key={idx}
                          style={{ height: `${heightPercent}%` }}
                          className={cn(
                            "w-1 rounded-t-2xs",
                            lat <= 90
                              ? "bg-emerald-500/80"
                              : lat <= 130
                                ? "bg-amber-500/80"
                                : "bg-destructive/80"
                          )}
                        />
                      )
                    })}
                  </button>
                )}
              </div>
            )}

            {/* Mirror Hops Strip */}
            {gridConfig.showHops && hops.length > 0 && (
              <div className="flex flex-wrap items-center gap-1 border-t border-border/40 pt-2">
                <span className="font-mono text-[10px] text-muted-foreground">Hop:</span>
                {hops.map((m) => {
                  const shortEnv =
                    m.environment === "Develop"
                      ? "Dev"
                      : m.environment === "Test"
                        ? "Test"
                        : m.environment === "Stage"
                          ? "Stage"
                          : m.environment

                  return (
                    <a
                      key={m.id}
                      href={m.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={`Jump to ${m.environment}: ${m.name}`}
                      className="inline-flex cursor-pointer items-center gap-0.5 rounded border border-border/80 bg-muted/50 px-1.5 py-0.5 font-mono text-[10px] font-semibold tracking-wide transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                    >
                      <span>{shortEnv}</span>
                      <ExternalLink className="size-2.5 opacity-60" />
                    </a>
                  )
                })}
              </div>
            )}

            {/* Footer: Endpoint link, copy button, and action buttons */}
            <div className="flex items-center justify-between border-t border-border/60 pt-2.5">
              <div className="flex items-center gap-1.5 min-w-0">
                <a
                  href={svc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-primary hover:underline truncate max-w-[130px] sm:max-w-[170px]"
                  title={svc.url}
                >
                  <Globe2 className="size-3 shrink-0" />
                  <span className="truncate">Open</span>
                  <ExternalLink className="size-2.5 shrink-0" />
                </a>

                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onCopyUrl(svc.url, svc.id)}
                  className="size-6 text-muted-foreground hover:text-foreground cursor-pointer"
                  title="Copy endpoint URL"
                >
                  {copiedId === svc.id ? (
                    <Check className="size-3 text-emerald-500" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                </Button>

                {!networkInfo.isIran &&
                  networkInfo.countryCode &&
                  (svc.url.includes("hasti.co") ||
                    svc.url.includes("tapsi.shop") ||
                    svc.url.includes("172.")) && (
                    <span
                      className="cursor-help font-mono text-[9px] font-semibold text-amber-600 dark:text-amber-400"
                      title="Iran Net restricted"
                    >
                      ⚠️ Net
                    </span>
                  )}
              </div>

              {/* Action Buttons: Inspect, Edit, Delete */}
              <div className="flex items-center gap-0.5 shrink-0">
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onInspectService(svc)}
                  title="Inspect service details & snippets"
                  className="size-6 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Eye className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onEditService(svc)}
                  title="Edit service"
                  className="size-6 cursor-pointer text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="size-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-xs"
                  onClick={() => onDeleteService(svc.id, svc.name)}
                  title="Delete service"
                  className="size-6 cursor-pointer text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="size-3.5" />
                </Button>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
