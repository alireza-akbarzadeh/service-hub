"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import {
  AlertCircle,
  AlignJustify,
  Check,
  CheckCircle2,
  Columns3,
  Copy,
  FileCode2,
  FileJson,
  HardDrive,
  LayoutGrid,
  Link as LinkIcon,
  RotateCcw,
  Rows3,
  Share2,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react"
import * as React from "react"
import {
  DEFAULT_GRID_CONFIG,
  encodeConfigToUrlHash,
  formatJsonConfig,
  GridConfig,
  PRESET_CONFIGS,
  STORAGE_KEY,
  validateAndParseJsonConfig,
} from "./grid-view-config"

interface DashboardSettingsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: GridConfig
  onSaveConfig: (newConfig: GridConfig) => void
}

type SettingsTab = "form" | "json" | "presets"

export function DashboardSettingsDialog({
  open,
  onOpenChange,
  config,
  onSaveConfig,
}: DashboardSettingsDialogProps) {
  const [activeTab, setActiveTab] = React.useState<SettingsTab>("form")

  // Local draft states
  const [draftConfig, setDraftConfig] = React.useState<GridConfig>(config)
  const [jsonText, setJsonText] = React.useState<string>("")
  const [jsonError, setJsonError] = React.useState<string | null>(null)
  const [jsonSuccessMsg, setJsonSuccessMsg] = React.useState<string | null>(
    null
  )
  const [copiedType, setCopiedType] = React.useState<string | null>(null)

  // Sync draft whenever config or dialog open changes
  React.useEffect(() => {
    if (open) {
      setDraftConfig(config)
      setJsonText(formatJsonConfig(config))
      setJsonError(null)
      setJsonSuccessMsg(null)
    }
  }, [open, config])

  // Handle visual form modifications
  const updateDraft = (updates: Partial<GridConfig>) => {
    const updated: GridConfig = {
      ...draftConfig,
      ...updates,
      viewMode: updates.viewShape || draftConfig.viewShape,
    }
    setDraftConfig(updated)
    setJsonText(formatJsonConfig(updated))
    setJsonError(null)
    // Save live
    onSaveConfig(updated)
  }

  // Handle JSON Textarea change
  const handleJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value
    setJsonText(val)
    setJsonSuccessMsg(null)
    const result = validateAndParseJsonConfig(val)
    if (!result.valid) {
      setJsonError(result.error || "Invalid JSON")
    } else {
      setJsonError(null)
    }
  }

  // Apply JSON Changes
  const handleApplyJson = () => {
    const result = validateAndParseJsonConfig(jsonText)
    if (!result.valid || !result.config) {
      setJsonError(
        result.error || "Invalid JSON syntax or configuration format"
      )
      return
    }
    setDraftConfig(result.config)
    setJsonText(formatJsonConfig(result.config))
    setJsonError(null)
    setJsonSuccessMsg(
      "Configuration successfully validated and saved to LocalStorage!"
    )
    onSaveConfig(result.config)
    setTimeout(() => setJsonSuccessMsg(null), 3000)
  }

  // Format / Prettify JSON
  const handleFormatJson = () => {
    const result = validateAndParseJsonConfig(jsonText)
    if (result.valid && result.config) {
      setJsonText(formatJsonConfig(result.config))
      setJsonError(null)
    } else {
      setJsonError(result.error || "Cannot format invalid JSON")
    }
  }

  // Copy JSON to clipboard
  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(jsonText)
      setCopiedType("json")
      setTimeout(() => setCopiedType(null), 2000)
    } catch {}
  }

  // Copy Shareable URL Hash
  const handleCopyShareLink = async () => {
    try {
      const hash = encodeConfigToUrlHash(draftConfig)
      const url = `${window.location.origin}${window.location.pathname}#${hash}`
      await navigator.clipboard.writeText(url)
      setCopiedType("link")
      setTimeout(() => setCopiedType(null), 2000)
    } catch {}
  }

  // Reset to default configuration
  const handleResetDefaults = () => {
    setDraftConfig(DEFAULT_GRID_CONFIG)
    setJsonText(formatJsonConfig(DEFAULT_GRID_CONFIG))
    setJsonError(null)
    setJsonSuccessMsg("Reset to factory default settings!")
    onSaveConfig(DEFAULT_GRID_CONFIG)
    setTimeout(() => setJsonSuccessMsg(null), 3000)
  }

  // Apply a preset
  const handleApplyPreset = (presetConfig: Partial<GridConfig>) => {
    const merged: GridConfig = {
      ...DEFAULT_GRID_CONFIG,
      ...presetConfig,
      viewMode: presetConfig.viewShape || DEFAULT_GRID_CONFIG.viewShape,
      viewShape: presetConfig.viewShape || DEFAULT_GRID_CONFIG.viewShape,
    }
    setDraftConfig(merged)
    setJsonText(formatJsonConfig(merged))
    setJsonError(null)
    setJsonSuccessMsg(`Applied preset successfully!`)
    onSaveConfig(merged)
    setTimeout(() => setJsonSuccessMsg(null), 3000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[90vh] max-w-2xl flex-col overflow-hidden p-0 sm:max-w-3xl">
        {/* Header */}
        <DialogHeader className="border-b border-border bg-muted/20 p-5 pb-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <SlidersHorizontal className="size-4" />
              </div>
              <div>
                <DialogTitle className="text-base font-bold">
                  Dashboard View & Layout Configuration
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Personalize 3 display shapes, telemetry visibility & raw JSON
                  preferences stored in your browser.
                </DialogDescription>
              </div>
            </div>

            <Badge
              variant="outline"
              className="hidden items-center gap-1 border-border/80 bg-background font-mono text-[10px] text-muted-foreground sm:inline-flex"
            >
              <HardDrive className="size-3 text-emerald-500" />
              <span>localStorage: {STORAGE_KEY}</span>
            </Badge>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1.5 pt-3">
            <button
              type="button"
              onClick={() => setActiveTab("form")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "form"
                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <SlidersHorizontal className="size-3.5" />
              <span>Visual Form</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("json")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "json"
                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <FileJson className="size-3.5" />
              <span>Raw JSON Config</span>
              {jsonError ? (
                <span className="size-1.5 rounded-full bg-destructive" />
              ) : (
                <span className="size-1.5 rounded-full bg-emerald-500" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("presets")}
              className={cn(
                "flex cursor-pointer items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all",
                activeTab === "presets"
                  ? "bg-primary font-semibold text-primary-foreground shadow-xs"
                  : "bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Sparkles className="size-3.5" />
              <span>Presets & Team Share</span>
            </button>
          </div>
        </DialogHeader>

        {/* Tab 1: Visual Form Settings */}
        {activeTab === "form" && (
          <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
            {/* 1. Primary Shape Selector (3 Shapes) */}
            <div className="space-y-2">
              <label className="flex items-center justify-between text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                <span>1. View Shape (Select from 3 styles)</span>
                <span className="font-mono text-[11px] font-normal text-primary normal-case">
                  Current: {draftConfig.viewShape}
                </span>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {/* Shape 1: Table */}
                <div
                  onClick={() => updateDraft({ viewShape: "table" })}
                  className={cn(
                    "flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-primary/60",
                    draftConfig.viewShape === "table"
                      ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                      <Rows3 className="size-4" />
                    </div>
                    {draftConfig.viewShape === "table" && (
                      <Badge className="bg-primary px-1.5 py-0 text-[10px]">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      Table View
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      Data-dense tabular rows with headers, sorting, and inline
                      telemetry status.
                    </div>
                  </div>
                </div>

                {/* Shape 2: Row Card */}
                <div
                  onClick={() => updateDraft({ viewShape: "row-card" })}
                  className={cn(
                    "flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-primary/60",
                    draftConfig.viewShape === "row-card"
                      ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                      <AlignJustify className="size-4" />
                    </div>
                    {draftConfig.viewShape === "row-card" && (
                      <Badge className="bg-primary px-1.5 py-0 text-[10px]">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      Row Cards
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      Horizontal expansive cards spanning the full width for
                      modern catalog scanning.
                    </div>
                  </div>
                </div>

                {/* Shape 3: Squared Card */}
                <div
                  onClick={() => updateDraft({ viewShape: "square-card" })}
                  className={cn(
                    "flex cursor-pointer flex-col justify-between gap-3 rounded-xl border p-3.5 text-left transition-all hover:border-primary/60",
                    draftConfig.viewShape === "square-card"
                      ? "border-primary bg-primary/5 shadow-xs ring-2 ring-primary/20"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex size-7 items-center justify-center rounded-lg bg-muted text-foreground">
                      <LayoutGrid className="size-4" />
                    </div>
                    {draftConfig.viewShape === "square-card" && (
                      <Badge className="bg-primary px-1.5 py-0 text-[10px]">
                        Active
                      </Badge>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">
                      Squared Cards
                    </div>
                    <div className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                      Modular square box cards in a multi-column grid layout for
                      visual monitoring.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Grid Columns & Density */}
            <div className="grid grid-cols-1 gap-4 border-t border-border/70 pt-4 sm:grid-cols-2">
              {/* Card Grid Columns (relevant especially for squared cards) */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <Columns3 className="size-3.5" />
                  <span>Card Grid Columns</span>
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(["auto", "2", "3", "4"] as const).map((col) => (
                    <button
                      key={col}
                      type="button"
                      onClick={() => updateDraft({ cardColumns: col })}
                      className={cn(
                        "cursor-pointer rounded-lg border px-2 py-1.5 text-center font-mono text-xs font-medium transition-all",
                        draftConfig.cardColumns === col
                          ? "border-primary bg-primary font-semibold text-primary-foreground shadow-2xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {col === "auto" ? "Auto" : `${col} Cols`}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Controls column layout in Squared Cards mode (Auto adapts 1 to
                  4 cols).
                </p>
              </div>

              {/* Display Density */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  <SlidersHorizontal className="size-3.5" />
                  <span>Display Density</span>
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  {(["comfortable", "compact"] as const).map((density) => (
                    <button
                      key={density}
                      type="button"
                      onClick={() => updateDraft({ cardDensity: density })}
                      className={cn(
                        "cursor-pointer rounded-lg border px-3 py-1.5 text-center text-xs font-medium capitalize transition-all",
                        draftConfig.cardDensity === density
                          ? "border-primary bg-primary font-semibold text-primary-foreground shadow-2xs"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      )}
                    >
                      {density}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Comfortable provides relaxed spacing; Compact maximizes screen
                  real estate.
                </p>
              </div>
            </div>

            {/* 3. Service Element Visibility Toggles */}
            <div className="space-y-2.5 border-t border-border/70 pt-4">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                Service Details & Telemetry Visibility
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {[
                  {
                    key: "showTelemetry",
                    label: "Telemetry & Latency Sparkline",
                    desc: "Live ping result, SLA uptime % & mini history chart",
                  },
                  {
                    key: "showTags",
                    label: "Service Tags",
                    desc: "Domain categorization chips (#api, #frontend, etc.)",
                  },
                  {
                    key: "showHops",
                    label: "Environment Hops (Mirrors)",
                    desc: "Quick jump buttons between Dev, Test, and Stage",
                  },
                  {
                    key: "showOwner",
                    label: "Service Owner",
                    desc: "Display responsible team or engineer pill",
                  },
                  {
                    key: "showDescription",
                    label: "Service Description",
                    desc: "Summary text explaining service purpose",
                  },
                ].map((item) => {
                  const isChecked = Boolean(
                    draftConfig[item.key as keyof GridConfig]
                  )
                  return (
                    <div
                      key={item.key}
                      onClick={() =>
                        updateDraft({
                          [item.key]: !isChecked,
                        } as any)
                      }
                      className={cn(
                        "flex cursor-pointer items-center justify-between rounded-xl border p-2.5 transition-all hover:border-primary/50",
                        isChecked
                          ? "border-primary/40 bg-primary/5"
                          : "border-border bg-card/60 opacity-80"
                      )}
                    >
                      <div className="space-y-0.5">
                        <div className="text-xs font-semibold text-foreground">
                          {item.label}
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {item.desc}
                        </div>
                      </div>
                      <div
                        className={cn(
                          "flex size-5 shrink-0 items-center justify-center rounded transition-colors",
                          isChecked
                            ? "bg-primary text-primary-foreground"
                            : "border border-border bg-muted/50"
                        )}
                      >
                        {isChecked && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 4. Default Page Size */}
            <div className="space-y-2 border-t border-border/70 pt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                  Default Items Per Page
                </label>
                <span className="font-mono text-xs font-bold text-primary">
                  {draftConfig.defaultPageSize} items
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                {[5, 10, 15, 20, 25, 50].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => updateDraft({ defaultPageSize: size })}
                    className={cn(
                      "flex-1 cursor-pointer rounded-md border py-1 font-mono text-xs transition-all",
                      draftConfig.defaultPageSize === size
                        ? "border-primary bg-primary font-semibold text-primary-foreground"
                        : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Raw JSON Configuration Editor */}
        {activeTab === "json" && (
          <div className="flex-1 space-y-4 overflow-y-auto p-5 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">
                  Direct LocalStorage JSON Editor
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Manipulate your dashboard config directly as JSON. Changes are
                  saved to localStorage without requiring authentication.
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFormatJson}
                  className="h-7 cursor-pointer text-[11px]"
                  title="Format JSON with standard indentation"
                >
                  <FileCode2 className="mr-1 size-3" />
                  Format
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-7 cursor-pointer text-[11px]"
                  title="Copy JSON configuration to clipboard"
                >
                  {copiedType === "json" ? (
                    <Check className="mr-1 size-3 text-emerald-500" />
                  ) : (
                    <Copy className="mr-1 size-3" />
                  )}
                  {copiedType === "json" ? "Copied" : "Copy JSON"}
                </Button>
              </div>
            </div>

            {/* Validation Banner */}
            {jsonError ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span className="font-mono text-[11px]">{jsonError}</span>
              </div>
            ) : jsonSuccessMsg ? (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2.5 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-4 shrink-0" />
                <span>{jsonSuccessMsg}</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-2 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="size-3.5 shrink-0" />
                <span className="text-[11px]">
                  Valid JSON configuration format
                </span>
              </div>
            )}

            {/* JSON Code Textarea */}
            <div className="relative overflow-hidden rounded-xl border border-border bg-muted/30 font-mono text-xs">
              <textarea
                value={jsonText}
                onChange={handleJsonChange}
                rows={13}
                spellCheck={false}
                className="w-full resize-none bg-transparent p-3.5 font-mono text-xs leading-relaxed text-foreground outline-none selection:bg-primary/20 focus:ring-1 focus:ring-primary"
                placeholder="Paste or write valid JSON configuration here..."
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetDefaults}
                className="h-8 cursor-pointer text-xs text-muted-foreground hover:text-foreground"
              >
                <RotateCcw className="mr-1.5 size-3.5 opacity-70" />
                Reset Defaults
              </Button>

              <Button
                size="sm"
                onClick={handleApplyJson}
                disabled={Boolean(jsonError)}
                className="h-8 cursor-pointer gap-1.5 text-xs shadow-xs"
              >
                <Upload className="size-3.5" />
                <span>Apply & Save to LocalStorage</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 3: Presets & Team Share */}
        {activeTab === "presets" && (
          <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
            {/* Team Sharing Section */}
            <div className="space-y-3 rounded-xl border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5 text-sm font-bold text-foreground">
                    <Share2 className="size-4 text-primary" />
                    <span>Global & Team Shared Configuration</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Since preference authentication isn't tied to individual
                    user logins, share this setup with your team via one-click
                    links or portable JSON.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyShareLink}
                  className="h-8 cursor-pointer gap-1.5 text-xs"
                >
                  {copiedType === "link" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <LinkIcon className="size-3.5 text-primary" />
                  )}
                  <span>
                    {copiedType === "link"
                      ? "Share Link Copied!"
                      : "Copy Shareable URL Hash"}
                  </span>
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyJson}
                  className="h-8 cursor-pointer gap-1.5 text-xs"
                >
                  {copiedType === "json" ? (
                    <Check className="size-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                  <span>
                    {copiedType === "json" ? "JSON Copied!" : "Copy Raw JSON"}
                  </span>
                </Button>
              </div>
            </div>

            {/* Presets List */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                One-Click Team Presets
              </label>

              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {PRESET_CONFIGS.map((preset) => (
                  <div
                    key={preset.id}
                    className="flex flex-col justify-between space-y-2 rounded-xl border border-border bg-card p-3.5 transition-all hover:border-primary/50"
                  >
                    <div>
                      <div className="text-xs font-bold text-foreground">
                        {preset.name}
                      </div>
                      <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">
                        {preset.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1">
                      <span className="font-mono text-[10px] text-primary">
                        {preset.config.viewShape} • {preset.config.cardDensity}
                      </span>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleApplyPreset(preset.config)}
                        className="h-7 cursor-pointer text-[11px]"
                      >
                        Apply Preset
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <DialogFooter className="flex items-center justify-between border-t border-border bg-muted/10 p-3 px-5 sm:justify-between">
          <div className="flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            <span>Config Auto-Saved to LocalStorage</span>
          </div>

          <Button
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-8 cursor-pointer text-xs"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
