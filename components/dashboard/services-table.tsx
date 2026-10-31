"use client"

import * as React from "react"
import type { Service } from "@/lib/db/schema"
import type { HealthCheckResult } from "@/app/actions/services"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"
import {
  Activity,
  Check,
  Copy,
  Edit2,
  ExternalLink,
  Eye,
  Server,
  Star,
  Trash2,
} from "lucide-react"
import { getServiceTags } from "@/hooks/use-services-dashboard"

interface ServicesTableProps {
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
}

function renderStatusBadge(status: string) {
  switch (status.toLowerCase()) {
    case "operational":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        >
          <span className="size-1.5 rounded-full bg-emerald-500" />
          Operational
        </Badge>
      )
    case "degraded":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400"
        >
          <span className="size-1.5 rounded-full bg-amber-500" />
          Degraded
        </Badge>
      )
    case "maintenance":
      return (
        <Badge
          variant="outline"
          className="gap-1 border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
        >
          <span className="size-1.5 rounded-full bg-sky-500" />
          Maintenance
        </Badge>
      )
    default:
      return <Badge variant="secondary">{status}</Badge>
  }
}

export function ServicesTable({
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
}: ServicesTableProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-xs">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[300px]">Service & Description</TableHead>
            <TableHead>Environment</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Owner</TableHead>
            <TableHead>Link</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-48 text-center text-muted-foreground">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Server className="size-8 opacity-30" />
                  <p className="font-medium">No services match the current filters.</p>
                  <Button variant="outline" size="xs" onClick={onResetFilters}>
                    Reset Filters
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            services.map((svc) => (
              <TableRow key={svc.id} className="group transition-colors">
                <TableCell>
                  <div className="flex items-center gap-1.5 text-foreground">
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(svc.id)}
                      className="cursor-pointer rounded p-1 text-muted-foreground transition-colors hover:text-amber-500"
                      title={favorites.includes(svc.id) ? "Unpin service" : "Pin service"}
                    >
                      <Star
                        className={cn(
                          "size-3.5",
                          favorites.includes(svc.id)
                            ? "fill-amber-400 text-amber-500"
                            : "text-muted-foreground/30 hover:text-amber-500"
                        )}
                      />
                    </button>
                    <button
                      type="button"
                      onClick={() => onInspectService(svc)}
                      className="cursor-pointer truncate text-left text-[13px] font-medium text-foreground transition-colors hover:text-primary tracking-tight"
                      title="Click to inspect details & snippets"
                    >
                      {svc.name}
                    </button>
                  </div>
                  <div className="mt-0.5 line-clamp-1 max-w-[340px] pl-6 text-[11px] text-muted-foreground/80 font-normal leading-normal">
                    {svc.description}
                  </div>
                  {/* Service Tags */}
                  <div className="mt-1 flex flex-wrap items-center gap-1 pl-6">
                    {getServiceTags(svc).map((tag) => (
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
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <Badge variant="secondary" className="text-[11px] font-normal">
                      {svc.environment}
                    </Badge>

                    {/* Mirror Hops: Jump to Dev / Test / Stage */}
                    {(mirrorMap.get(svc.id) || []).length > 0 && (
                      <div className="mt-0.5 flex flex-wrap items-center gap-1">
                        <span className="font-mono text-[10px] text-muted-foreground">
                          Hop:
                        </span>
                        {(mirrorMap.get(svc.id) || []).map((m) => {
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
                              className="inline-flex cursor-pointer items-center gap-0.5 rounded border border-border/80 bg-muted/60 px-1.5 py-0.5 text-[10px] font-medium tracking-wide shadow-2xs transition-all hover:border-primary hover:bg-primary hover:text-primary-foreground"
                            >
                              <span>{shortEnv}</span>
                              <ExternalLink className="size-2.5 opacity-60" />
                            </a>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-xs text-muted-foreground font-normal">
                    {svc.category}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5">
                      {renderStatusBadge(svc.status)}
                      {telemetryMap && telemetryMap[svc.id] && (
                        <span
                          className={cn(
                            "rounded px-1 py-0.5 font-mono text-[9px] font-semibold tracking-tight border",
                            telemetryMap[svc.id].uptimeRate >= 95
                              ? "border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                              : telemetryMap[svc.id].uptimeRate >= 80
                                ? "border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/5"
                                : "border-destructive/30 text-destructive bg-destructive/5"
                          )}
                          title={`30-day reliability: ${telemetryMap[svc.id].uptimeRate}% • Avg: ${telemetryMap[svc.id].avgLatency}ms (Neon Postgres)`}
                        >
                          {telemetryMap[svc.id].uptimeRate}%
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5">
                      {healthMap[svc.id] ? (
                        <div
                          onClick={(e) => onPingSingle(svc, e)}
                          className={cn(
                            "inline-flex cursor-pointer items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono text-[10px] transition-all",
                            healthMap[svc.id].status === "online"
                              ? "border-emerald-500/30 bg-emerald-500/10 font-semibold text-emerald-600 dark:text-emerald-400"
                              : healthMap[svc.id].status === "warning"
                                ? "border-amber-500/30 bg-amber-500/10 font-medium text-amber-600 dark:text-amber-400"
                                : "border-destructive/30 bg-destructive/10 font-medium text-destructive"
                          )}
                          title={`Ping again: ${healthMap[svc.id].message || healthMap[svc.id].status} (${healthMap[svc.id].latencyMs}ms)`}
                        >
                          <span className="size-1.5 rounded-full bg-current" />
                          <span>{healthMap[svc.id].latencyMs}ms</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => onPingSingle(svc, e)}
                          className="inline-flex cursor-pointer items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
                          title="Run live ping check"
                        >
                          <Activity className="size-2.5 opacity-60" />
                          <span>Ping</span>
                        </button>
                      )}

                      {/* Mini Sparkline Bars */}
                      {telemetryMap && telemetryMap[svc.id]?.sparkline?.length > 0 && (
                        <button
                          type="button"
                          onClick={() => onInspectService(svc)}
                          className="flex items-end gap-0.5 h-3.5 px-1 py-0.5 rounded bg-muted/40 hover:bg-muted cursor-pointer transition-colors"
                          title={`Neon Latency History (${telemetryMap[svc.id].sparkline.length} checks). Click to inspect details.`}
                        >
                          {telemetryMap[svc.id].sparkline.slice(-6).map((lat, idx) => {
                            const heightPercent = Math.min(Math.max((lat / 150) * 100, 20), 100)
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
                  </div>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground font-normal">
                  {svc.owner || "Platform"}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1.5">
                    <a
                      href={svc.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                    >
                      Open
                      <ExternalLink className="size-3" />
                    </a>
                    {!networkInfo.isIran &&
                      networkInfo.countryCode &&
                      (svc.url.includes("hasti.co") ||
                        svc.url.includes("tapsi.shop") ||
                        svc.url.includes("172.")) && (
                        <span
                          className="cursor-help text-[10px] font-medium text-amber-600 dark:text-amber-400"
                          title="This endpoint is firewalled to Iran IP or Agency VPN. It may fail to open while connected to a foreign VPN."
                        >
                          ⚠️ Iran Net
                        </span>
                      )}
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onCopyUrl(svc.url, svc.id)}
                      className="opacity-0 transition-opacity group-hover:opacity-100"
                      title="Copy link"
                    >
                      {copiedId === svc.id ? (
                        <Check className="size-3 text-emerald-500" />
                      ) : (
                        <Copy className="size-3 text-muted-foreground" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onInspectService(svc)}
                      title="Inspect service details & snippets"
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Eye className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onEditService(svc)}
                      title="Edit service"
                      className="cursor-pointer text-muted-foreground hover:text-foreground"
                    >
                      <Edit2 className="size-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => onDeleteService(svc.id, svc.name)}
                      title="Delete service"
                      className="cursor-pointer text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
