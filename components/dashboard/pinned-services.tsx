"use client"

import * as React from "react"
import type { Service } from "@/lib/db/schema"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Check, Copy, ExternalLink, Star } from "lucide-react"

interface PinnedServicesProps {
  favoriteServices: Service[]
  showOnlyFavorites: boolean
  onToggleShowOnlyFavorites: () => void
  onToggleFavorite: (id: number) => void
  onCopyUrl: (url: string, id: number) => void
  copiedId: number | null
}

export function PinnedServices({
  favoriteServices,
  showOnlyFavorites,
  onToggleShowOnlyFavorites,
  onToggleFavorite,
  onCopyUrl,
  copiedId,
}: PinnedServicesProps) {
  if (favoriteServices.length === 0) return null

  return (
    <div className="rounded-xl border border-amber-500/20 bg-linear-to-r from-amber-500/10 via-background to-background p-4 shadow-xs">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-md bg-amber-500/20 text-amber-500">
            <Star className="size-3.5 fill-amber-400 text-amber-500" />
          </div>
          <div>
            <h3 className="text-xs font-semibold tracking-tight text-foreground">
              Pinned Quick Launch ({favoriteServices.length})
            </h3>
            <p className="text-[11px] text-muted-foreground">
              Your personal daily tools for immediate access
            </p>
          </div>
        </div>

        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onToggleShowOnlyFavorites}
          className="h-7 cursor-pointer gap-1 text-[11px] text-muted-foreground hover:text-foreground"
        >
          {showOnlyFavorites ? "Show All Services" : "Filter Table to Pinned"}
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {favoriteServices.map((svc) => (
          <div
            key={svc.id}
            className="group flex items-center justify-between gap-2 rounded-lg border border-border bg-card p-2.5 shadow-2xs transition-all hover:border-primary/50 hover:shadow-xs"
          >
            <div className="min-w-0 flex-1">
              <a
                href={svc.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs font-medium text-foreground transition-colors hover:text-primary"
              >
                <span className="truncate">{svc.name}</span>
                <ExternalLink className="size-3 shrink-0 opacity-60 group-hover:text-primary group-hover:opacity-100" />
              </a>
              <div className="mt-1 flex items-center gap-1.5">
                <Badge variant="outline" className="px-1 py-0 font-mono text-[9px]">
                  {svc.environment}
                </Badge>
                <span className="truncate text-[10px] text-muted-foreground">
                  {svc.category}
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-0.5">
              <button
                type="button"
                onClick={() => onCopyUrl(svc.url, svc.id)}
                className="cursor-pointer rounded-md p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Copy URL"
              >
                {copiedId === svc.id ? (
                  <Check className="size-3 text-emerald-500" />
                ) : (
                  <Copy className="size-3" />
                )}
              </button>
              <button
                type="button"
                onClick={() => onToggleFavorite(svc.id)}
                className="cursor-pointer rounded-md p-1 text-amber-500 transition-colors hover:bg-muted"
                title="Unpin"
              >
                <Star className="size-3 fill-amber-400" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
