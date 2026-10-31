"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  ChevronDown,
  Filter,
  Plus,
  Search,
  Settings,
  Star,
  Tag,
} from "lucide-react"
import { CATEGORIES, AVAILABLE_TAGS } from "@/hooks/use-services-dashboard"
import { GridConfig, DEFAULT_GRID_CONFIG } from "./grid-view-config"
import { GridConfigMenu } from "./grid-config-menu"

interface ServicesFilterBarProps {
  showOnlyFavorites: boolean
  onToggleShowOnlyFavorites: () => void
  favoritesCount: number
  selectedCategory: string
  onSelectCategory: (cat: string) => void
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedTag: string
  onSelectTag: (tag: string) => void
  tagCounts: Record<string, number>
  onOpenAddModal: () => void
  gridConfig?: GridConfig
  onChangeGridConfig?: (config: GridConfig) => void
  onOpenSettings?: () => void
}

export function ServicesFilterBar({
  showOnlyFavorites,
  onToggleShowOnlyFavorites,
  favoritesCount,
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  selectedTag,
  onSelectTag,
  tagCounts,
  onOpenAddModal,
  gridConfig = DEFAULT_GRID_CONFIG,
  onChangeGridConfig,
  onOpenSettings,
}: ServicesFilterBarProps) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-card p-3 shadow-xs">
      <div className="flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex flex-1 flex-col items-stretch gap-2.5 sm:flex-row sm:items-center">
          {/* Pinned Filter Toggle Button */}
          <Button
            type="button"
            variant={showOnlyFavorites ? "default" : "outline"}
            size="sm"
            onClick={onToggleShowOnlyFavorites}
            className={cn(
              "h-9 shrink-0 cursor-pointer gap-1.5 text-xs",
              showOnlyFavorites
                ? "bg-amber-500 text-white hover:bg-amber-600"
                : "text-muted-foreground hover:text-foreground"
            )}
            title="Show only pinned favorite services"
          >
            <Star
              className={cn(
                "size-3.5",
                showOnlyFavorites
                  ? "fill-white text-white"
                  : favoritesCount > 0
                    ? "fill-amber-400 text-amber-500"
                    : "text-muted-foreground"
              )}
            />
            <span>Pinned</span>
            {favoritesCount > 0 && (
              <span
                className={cn(
                  "py-0.2 rounded-full px-1.5 font-mono text-[10px]",
                  showOnlyFavorites
                    ? "bg-white/20 text-white"
                    : "bg-muted text-muted-foreground"
                )}
              >
                {favoritesCount}
              </span>
            )}
          </Button>

          {/* Category Select Box */}
          <div className="relative w-full shrink-0 sm:w-56">
            <Filter className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <select
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="h-9 w-full cursor-pointer appearance-none rounded-lg border border-border bg-background py-1.5 pr-8 pl-9 text-xs font-medium text-foreground transition-colors hover:bg-muted/40 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === "All" ? "All Categories" : cat}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute top-2.5 right-3 size-4 text-muted-foreground opacity-70" />
          </div>

          {/* Instant Search Bar */}
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by service name, endpoint, owner..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="h-9 pl-9 text-xs"
            />
          </div>
        </div>

        {/* View Mode Configuration & Add Service Button */}
        <div className="flex shrink-0 items-center justify-between gap-2 sm:justify-end">
          {onChangeGridConfig && (
            <GridConfigMenu
              config={gridConfig}
              onChangeConfig={onChangeGridConfig}
              onOpenSettings={onOpenSettings}
            />
          )}

          {onOpenSettings && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={onOpenSettings}
              className="size-9 shrink-0 cursor-pointer text-muted-foreground shadow-2xs hover:text-foreground"
              title="Dashboard Settings & JSON Config Editor"
            >
              <Settings className="size-4" />
            </Button>
          )}

          <Button
            size="sm"
            onClick={onOpenAddModal}
            className="h-9 cursor-pointer gap-1.5 shadow-xs"
          >
            <Plus className="size-4" />
            <span>Add Service</span>
          </Button>
        </div>
      </div>

      {/* Quick Tag Filter Strip */}
      <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-2.5">
        <div className="mr-1 flex items-center gap-1 text-[11px] font-semibold text-muted-foreground">
          <Tag className="size-3 text-primary" />
          <span>Tags:</span>
        </div>
        {AVAILABLE_TAGS.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onSelectTag(tag.id)}
            className={cn(
              "flex cursor-pointer items-center gap-1 rounded-full border px-2.5 py-0.5 font-mono text-[11px] transition-all",
              selectedTag === tag.id
                ? "border-primary bg-primary font-semibold text-primary-foreground shadow-2xs"
                : "border-border bg-muted/30 text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <span>{tag.label}</span>
            {tagCounts[tag.id] !== undefined && (
              <span
                className={cn(
                  "text-[9px] opacity-80",
                  selectedTag === tag.id
                    ? "text-primary-foreground"
                    : "text-muted-foreground"
                )}
              >
                ({tagCounts[tag.id] || 0})
              </span>
            )}
          </button>
        ))}
        {selectedTag !== "#all" && (
          <button
            type="button"
            onClick={() => onSelectTag("#all")}
            className="ml-1 cursor-pointer text-[11px] font-medium text-primary hover:underline"
          >
            Reset Tag
          </button>
        )}
      </div>
    </div>
  )
}
