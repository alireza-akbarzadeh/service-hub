"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  GridConfig,
  ViewShape,
  DEFAULT_GRID_CONFIG,
} from "./grid-view-config"
import { cn } from "@/lib/utils"
import {
  AlignJustify,
  Columns2,
  Columns3,
  Columns4,
  FileJson,
  LayoutGrid,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
  Table as TableIcon,
} from "lucide-react"

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
  const currentShape = config.viewShape || "table"

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
      "showTags" | "showTelemetry" | "showHops" | "showOwner" | "showDescription"
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
    <div className="flex items-center gap-1.5">
      {/* 3-Shape Segmented Switcher: Table | Row Cards | Squared Cards */}
      <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shadow-2xs">
        {/* 1. Table */}
        <button
          type="button"
          onClick={() => handleShapeChange("table")}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all select-none",
            currentShape === "table"
              ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
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
              ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
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
              ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Squared Cards view (multi-column grid)"
        >
          <LayoutGrid className="size-3.5" />
          <span className="hidden sm:inline">Squared Cards</span>
        </button>
      </div>

      {/* Quick Layout Dropdown & Settings Modal Trigger */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs",
                currentShape !== "table" && "border-primary/40 text-foreground"
              )}
              title="Quick view style & display configuration"
            />
          }
        >
          <SlidersHorizontal className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Config</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-58 text-xs">
          <DropdownMenuLabel className="font-bold text-foreground">
            Display Shape & Layout
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* 3 Shapes Radio */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Display Shape
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={currentShape}
              onValueChange={(v) => handleShapeChange(v as ViewShape)}
            >
              <DropdownMenuRadioItem value="table" className="cursor-pointer text-xs">
                <Rows3 className="size-3.5 mr-2 opacity-70" />
                <span>Table List</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="row-card" className="cursor-pointer text-xs">
                <AlignJustify className="size-3.5 mr-2 opacity-70" />
                <span>Row Cards</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="square-card" className="cursor-pointer text-xs">
                <LayoutGrid className="size-3.5 mr-2 opacity-70" />
                <span>Squared Cards</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          {/* Column options when in Squared Cards mode */}
          {currentShape === "square-card" && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
                  Grid Columns
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                  value={config.cardColumns}
                  onValueChange={(v) => handleColumnsChange(v as any)}
                >
                  <DropdownMenuRadioItem value="auto" className="cursor-pointer text-xs">
                    Auto Responsive (1 - 4)
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="2" className="cursor-pointer text-xs">
                    2 Columns
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="3" className="cursor-pointer text-xs">
                    3 Columns
                  </DropdownMenuRadioItem>
                  <DropdownMenuRadioItem value="4" className="cursor-pointer text-xs">
                    4 Columns
                  </DropdownMenuRadioItem>
                </DropdownMenuRadioGroup>
              </DropdownMenuGroup>
            </>
          )}

          {/* Elements visibility */}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Visibility Toggles
            </DropdownMenuLabel>
            <DropdownMenuCheckboxItem
              checked={config.showTelemetry}
              onCheckedChange={() => handleToggle("showTelemetry")}
              className="cursor-pointer text-xs"
            >
              Telemetry & Latency
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={config.showTags}
              onCheckedChange={() => handleToggle("showTags")}
              className="cursor-pointer text-xs"
            >
              Service Tags
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={config.showHops}
              onCheckedChange={() => handleToggle("showHops")}
              className="cursor-pointer text-xs"
            >
              Environment Hops
            </DropdownMenuCheckboxItem>
            <DropdownMenuCheckboxItem
              checked={config.showOwner}
              onCheckedChange={() => handleToggle("showOwner")}
              className="cursor-pointer text-xs"
            >
              Service Owner
            </DropdownMenuCheckboxItem>
          </DropdownMenuGroup>

          {/* Density */}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Card Density
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={config.cardDensity}
              onValueChange={(v) => handleDensityChange(v as any)}
            >
              <DropdownMenuRadioItem value="comfortable" className="cursor-pointer text-xs">
                Comfortable
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="compact" className="cursor-pointer text-xs">
                Compact
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          {/* Full Settings & JSON Config Modal */}
          {onOpenSettings && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={onOpenSettings}
                className="cursor-pointer text-xs font-semibold text-primary"
              >
                <FileJson className="size-3.5 mr-2 text-primary" />
                <span>Full Settings & JSON Config...</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleResetDefaults}
            className="cursor-pointer text-xs text-muted-foreground hover:text-foreground"
          >
            <RotateCcw className="size-3.5 mr-2 opacity-70" />
            <span>Reset Defaults</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
