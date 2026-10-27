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
  ViewMode,
  DEFAULT_GRID_CONFIG,
} from "./grid-view-config"
import { cn } from "@/lib/utils"
import {
  Columns2,
  Columns3,
  Columns4,
  LayoutGrid,
  RotateCcw,
  Rows3,
  SlidersHorizontal,
  Table as TableIcon,
} from "lucide-react"

interface GridConfigMenuProps {
  config: GridConfig
  onChangeConfig: (newConfig: GridConfig) => void
}

export function GridConfigMenu({ config, onChangeConfig }: GridConfigMenuProps) {
  const handleViewModeChange = (mode: ViewMode) => {
    onChangeConfig({
      ...config,
      viewMode: mode,
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

  const handleToggle = (key: keyof Pick<GridConfig, "showTags" | "showTelemetry" | "showHops" | "showOwner">) => {
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
      {/* Segmented View Mode Switcher: Table ⇄ Cards */}
      <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 shadow-2xs">
        <button
          type="button"
          onClick={() => handleViewModeChange("table")}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all select-none",
            config.viewMode === "table"
              ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Switch to Table view"
        >
          <Rows3 className="size-3.5" />
          <span className="hidden sm:inline">Table</span>
        </button>

        <button
          type="button"
          onClick={() => handleViewModeChange("card")}
          className={cn(
            "flex cursor-pointer items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium transition-all select-none",
            config.viewMode === "card"
              ? "bg-background text-foreground shadow-xs font-semibold ring-1 ring-border"
              : "text-muted-foreground hover:text-foreground"
          )}
          title="Switch to Card Grid view"
        >
          <LayoutGrid className="size-3.5" />
          <span className="hidden sm:inline">Cards</span>
        </button>
      </div>

      {/* Grid & Card Configuration Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "h-8 cursor-pointer gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground shadow-2xs",
                config.viewMode === "card" && "border-primary/40 text-foreground"
              )}
              title="Configure View Style & Card layout options"
            />
          }
        >
          <SlidersHorizontal className="size-3.5 text-primary" />
          <span className="hidden sm:inline">Layout Config</span>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-56 text-xs">
          <DropdownMenuLabel className="font-bold text-foreground">
            View Style & Card Config
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* View Mode Radio */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Display Style
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup
              value={config.viewMode}
              onValueChange={(v) => handleViewModeChange(v as ViewMode)}
            >
              <DropdownMenuRadioItem value="table" className="cursor-pointer text-xs">
                <Rows3 className="size-3.5 mr-2 opacity-70" />
                <span>Table List</span>
              </DropdownMenuRadioItem>
              <DropdownMenuRadioItem value="card" className="cursor-pointer text-xs">
                <LayoutGrid className="size-3.5 mr-2 opacity-70" />
                <span>Card Grid</span>
              </DropdownMenuRadioItem>
            </DropdownMenuRadioGroup>
          </DropdownMenuGroup>

          {/* Card-specific configurations */}
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Card Grid Columns
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

          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-[10px] text-muted-foreground uppercase tracking-wider">
              Card Elements
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
