"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlignJustify,
  Check,
  FileJson,
  LayoutGrid,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
  X,
  Eye,
} from "lucide-react"
import { DEFAULT_GRID_CONFIG, GridConfig, ViewShape } from "./grid-view-config"

interface GridConfigMenuProps {
  config: GridConfig
  onChangeConfig: (newConfig: GridConfig) => void
  onOpenSettings?: () => void
}

export function GridConfigMenu({
  config,
  onChangeConfig,
  onOpenSettings,
}: GridConfigMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  const currentShape = config.viewShape || "table"

  // Close when clicking outside or pressing Escape
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  const handleShapeChange = (shape: ViewShape) => {
    onChangeConfig({
      ...config,
      viewShape: shape,
      viewMode: shape,
    })
  }

  const handleColumnsChange = (cols: "auto" | "2" | "3" | "4") => {
    onChangeConfig({
      ...config,
      cardColumns: cols,
    })
  }

  const handleDensityChange = (density: "comfortable" | "compact") => {
    onChangeConfig({
      ...config,
      cardDensity: density,
    })
  }

  const handleToggle = (
    key: keyof Pick<
      GridConfig,
      | "showTags"
      | "showTelemetry"
      | "showHops"
      | "showOwner"
      | "showDescription"
    >
  ) => {
    onChangeConfig({
      ...config,
      [key]: !config[key],
    })
  }

  const handleResetDefaults = () => {
    onChangeConfig(DEFAULT_GRID_CONFIG)
  }

  return (
    <div ref={menuRef} className="relative flex items-center gap-1.5">
      {/* 3-Shape Segmented Switcher: Table | Row Cards | Squared Cards */}
      <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shadow-2xs">
        {/* 1. Table */}
        <button
          type="button"
          onClick={() => handleShapeChange("table")}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all select-none",
            currentShape === "table"
              ? "bg-background font-semibold text-foreground shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Table view (data-dense tabular rows)"
        >
          <Rows3 className="size-3.5" />
          <span className="hidden sm:inline">Table</span>
        </button>

        {/* 2. Row Card */}
        <button
          type="button"
          onClick={() => handleShapeChange("row-card")}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all select-none",
            currentShape === "row-card"
              ? "bg-background font-semibold text-foreground shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Row Cards view (full-width horizontal cards)"
        >
          <AlignJustify className="size-3.5" />
          <span className="hidden sm:inline">Row Cards</span>
        </button>

        {/* 3. Squared Card */}
        <button
          type="button"
          onClick={() => handleShapeChange("square-card")}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all select-none",
            currentShape === "square-card"
              ? "bg-background font-semibold text-foreground shadow-xs ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Squared Cards view (multi-column grid)"
        >
          <LayoutGrid className="size-3.5" />
          <span className="hidden sm:inline">Squared Cards</span>
        </button>
      </div>

      {/* Quick Layout Dropdown Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className={cn(
          "inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-lg border border-border bg-background px-2.5 text-xs font-medium text-muted-foreground shadow-2xs transition-colors hover:bg-muted hover:text-foreground",
          (isOpen || currentShape !== "table") && "border-primary/40 text-foreground ring-1 ring-primary/20"
        )}
        title="Quick view style & display configuration"
      >
        <SlidersHorizontal className="size-3.5 text-primary" />
        <span className="hidden sm:inline">Config</span>
      </button>

      {/* Crash-Free Floating Dropdown Popover */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 z-50 w-64 rounded-xl border border-border bg-popover/95 p-3 text-xs text-popover-foreground shadow-xl backdrop-blur-md animate-in fade-in-0 zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 border-b border-border/60">
            <span className="font-bold text-xs text-foreground">
              Display & Layout Config
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded p-0.5 text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
            >
              <X className="size-3.5" />
            </button>
          </div>

          <div className="space-y-3 pt-2 max-h-[420px] overflow-y-auto">
            {/* Display Shape */}
            <div className="space-y-1">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Display Shape
              </span>
              <div className="space-y-0.5">
                {[
                  { id: "table" as const, label: "Table List", icon: Rows3 },
                  { id: "row-card" as const, label: "Row Cards", icon: AlignJustify },
                  { id: "square-card" as const, label: "Squared Cards", icon: LayoutGrid },
                ].map((item) => {
                  const isSelected = currentShape === item.id
                  const Icon = item.icon
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleShapeChange(item.id)}
                      className={cn(
                        "flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-xs transition-colors",
                        isSelected
                          ? "bg-primary/10 text-primary font-semibold"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="size-3.5 opacity-70" />
                        <span>{item.label}</span>
                      </div>
                      {isSelected && <Check className="size-3.5 text-primary" />}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Column Options (When in Squared Cards Mode) */}
            {currentShape === "square-card" && (
              <div className="space-y-1 pt-1 border-t border-border/50">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                  Grid Columns
                </span>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { id: "auto" as const, label: "Auto (1-4)" },
                    { id: "2" as const, label: "2 Columns" },
                    { id: "3" as const, label: "3 Columns" },
                    { id: "4" as const, label: "4 Columns" },
                  ].map((col) => {
                    const isSelected = config.cardColumns === col.id
                    return (
                      <button
                        key={col.id}
                        type="button"
                        onClick={() => handleColumnsChange(col.id)}
                        className={cn(
                          "cursor-pointer rounded-md px-2 py-1 text-xs text-center border transition-colors",
                          isSelected
                            ? "border-primary bg-primary/10 text-primary font-semibold"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        {col.label}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Visibility Toggles */}
            <div className="space-y-1 pt-1 border-t border-border/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Visibility Toggles
              </span>
              <div className="space-y-1">
                {[
                  { key: "showTelemetry" as const, label: "Telemetry & Latency" },
                  { key: "showTags" as const, label: "Service Tags" },
                  { key: "showHops" as const, label: "Environment Hops" },
                  { key: "showOwner" as const, label: "Service Owner" },
                ].map((item) => {
                  const isChecked = config[item.key]
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleToggle(item.key)}
                      className="flex w-full cursor-pointer items-center justify-between rounded-md px-2 py-1 text-xs text-foreground hover:bg-muted transition-colors"
                    >
                      <span>{item.label}</span>
                      <div
                        className={cn(
                          "size-4 rounded flex items-center justify-center border transition-colors",
                          isChecked
                            ? "bg-primary border-primary text-primary-foreground"
                            : "border-border bg-background"
                        )}
                      >
                        {isChecked && <Check className="size-3" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Card Density */}
            <div className="space-y-1 pt-1 border-t border-border/50">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground block">
                Card Density
              </span>
              <div className="grid grid-cols-2 gap-1">
                {[
                  { id: "comfortable" as const, label: "Comfortable" },
                  { id: "compact" as const, label: "Compact" },
                ].map((d) => {
                  const isSelected = config.cardDensity === d.id
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => handleDensityChange(d.id)}
                      className={cn(
                        "cursor-pointer rounded-md px-2 py-1 text-xs text-center border transition-colors",
                        isSelected
                          ? "border-primary bg-primary/10 text-primary font-semibold"
                          : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {d.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 border-t border-border/50 space-y-1">
              {onOpenSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false)
                    onOpenSettings()
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs font-semibold text-primary hover:bg-primary/10 transition-colors"
                >
                  <FileJson className="size-3.5 text-primary" />
                  <span>Full Settings & JSON Config...</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  handleResetDefaults()
                  setIsOpen(false)
                }}
                className="flex w-full cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              >
                <RotateCcw className="size-3.5 opacity-70" />
                <span>Reset Defaults</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
