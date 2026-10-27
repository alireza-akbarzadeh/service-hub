"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import {
  Code2,
  Copy,
  Check,
  Download,
  Upload,
  Trash2,
  Wand2,
  Minimize2,
  Maximize2,
  ArrowDownAZ,
  ArrowUpAZ,
  AlertCircle,
  FileCode,
  Table as TableIcon,
  Search,
  Sparkles,
  RefreshCw,
  FolderTree,
  FileJson,
  Layers,
  Sun,
  Moon,
  Laptop,
  Columns2,
  PanelLeft,
  PanelRight,
  CheckCircle2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import {
  repairJson,
  sortJsonKeys,
  computeJsonStats,
  formatBytes,
  jsonToTypeScript,
  SAMPLE_JSONS,
  type JsonStats,
} from "@/lib/json-utils"
import { JsonTreeNode } from "./json-tree-node"
import { JsonTableView } from "./json-table-view"

type ViewTab = "tree" | "code" | "table" | "typescript"
type EditorThemeMode = "auto" | "dark" | "light"

export function JsonFormatterViewer({ initialJson }: { initialJson?: string } = {}) {
  const { resolvedTheme } = useTheme()

  // Input & Formatting state
  const [rawInput, setRawInput] = React.useState<string>(
    () => initialJson || SAMPLE_JSONS.users_api.json
  )

  React.useEffect(() => {
    if (initialJson) {
      setRawInput(initialJson)
    }
  }, [initialJson])
  const [indentOption, setIndentOption] = React.useState<number | string>(2)
  const [viewTab, setViewTab] = React.useState<ViewTab>("tree")
  const [editorThemeMode, setEditorThemeMode] = React.useState<EditorThemeMode>("auto")
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false)
  const [layoutMode, setLayoutMode] = React.useState<"split" | "editor" | "viewer">("split")
  const [repairNotice, setRepairNotice] = React.useState<{ text: string; type: "success" | "info" } | null>(null)

  // ESC key exits fullscreen
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isFullscreen])

  // Tree View controls
  const [maxExpandedDepth, setMaxExpandedDepth] = React.useState<number>(3)
  const [treeSearch, setTreeSearch] = React.useState<string>("")
  const [copiedItem, setCopiedItem] = React.useState<string | null>(null)

  // TypeScript tab configuration
  const [tsRootName, setTsRootName] = React.useState<string>("UserApiResponse")

  // File upload input ref
  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Parsing and error validation
  const { parsedJson, parseError, formattedJson, stats } = React.useMemo(() => {
    if (!rawInput.trim()) {
      return {
        parsedJson: null,
        parseError: null,
        formattedJson: "",
        stats: null,
      }
    }

    try {
      const parsed = JSON.parse(rawInput)
      const indent = indentOption === "tab" ? "\t" : Number(indentOption)
      const formatted = JSON.stringify(parsed, null, indent)
      const statsObj = computeJsonStats(formatted, parsed)
      return {
        parsedJson: parsed,
        parseError: null,
        formattedJson: formatted,
        stats: statsObj,
      }
    } catch (err: any) {
      // Extract line & col info if possible
      const message = err.message || "Invalid JSON syntax"
      let errorLine: number | null = null
      let errorCol: number | null = null

      const match = message.match(/line (\d+) column (\d+)/i) || message.match(/position (\d+)/i)
      if (match) {
        if (match[2]) {
          errorLine = parseInt(match[1], 10)
          errorCol = parseInt(match[2], 10)
        } else {
          // Position to line calculation
          const pos = parseInt(match[1], 10)
          const lines = rawInput.slice(0, pos).split("\n")
          errorLine = lines.length
          errorCol = lines[lines.length - 1].length + 1
        }
      }

      return {
        parsedJson: null,
        parseError: {
          message,
          line: errorLine,
          col: errorCol,
        },
        formattedJson: "",
        stats: null,
      }
    }
  }, [rawInput, indentOption])

  // Inferred TypeScript interfaces
  const tsOutput = React.useMemo(() => {
    if (!parsedJson) return ""
    try {
      return jsonToTypeScript(parsedJson, tsRootName.trim() || "RootObject")
    } catch {
      return "// Could not infer TypeScript definitions"
    }
  }, [parsedJson, tsRootName])

  // Copy helper
  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedItem(id)
    setTimeout(() => setCopiedItem(null), 1500)
  }

  // Format action (re-serializes nicely formatted string into input)
  const handleBeautify = () => {
    if (formattedJson) {
      setRawInput(formattedJson)
    } else {
      // Try to repair first then format
      try {
        const repaired = repairJson(rawInput)
        const parsed = JSON.parse(repaired)
        const indent = indentOption === "tab" ? "\t" : Number(indentOption)
        setRawInput(JSON.stringify(parsed, null, indent))
      } catch {
        // Leave as is if even repair fails
      }
    }
  }

  // Minify action
  const handleMinify = () => {
    try {
      let target = parsedJson
      if (!target) {
        target = JSON.parse(repairJson(rawInput))
      }
      setRawInput(JSON.stringify(target))
    } catch (err: any) {
      // Cannot minify invalid JSON
    }
  }

  // Auto Repair action
  const handleRepair = () => {
    if (!rawInput.trim()) return
    try {
      const repaired = repairJson(rawInput)
      const parsed = JSON.parse(repaired)
      const indent = indentOption === "tab" ? "\t" : Number(indentOption)
      setRawInput(JSON.stringify(parsed, null, indent))
      setRepairNotice({
        text: "Auto-repaired successfully! Fixed missing commas & syntax.",
        type: "success",
      })
      setTimeout(() => setRepairNotice(null), 3500)
    } catch (err: any) {
      // If full JSON.parse still fails, apply any partial repairs
      const repaired = repairJson(rawInput)
      if (repaired !== rawInput) {
        setRawInput(repaired)
        setRepairNotice({
          text: "Applied partial syntax fixes. Check remaining highlighted errors.",
          type: "info",
        })
        setTimeout(() => setRepairNotice(null), 4000)
      } else {
        setRepairNotice({
          text: "Could not auto-repair. Check syntax error position below.",
          type: "info",
        })
        setTimeout(() => setRepairNotice(null), 4000)
      }
    }
  }

  // Sort Keys action
  const handleSortKeys = (order: "asc" | "desc") => {
    if (!parsedJson) return
    const sorted = sortJsonKeys(parsedJson, order)
    const indent = indentOption === "tab" ? "\t" : Number(indentOption)
    setRawInput(JSON.stringify(sorted, null, indent))
  }

  // Load sample dataset
  const handleLoadSample = (sampleKey: string) => {
    const sample = SAMPLE_JSONS[sampleKey]
    if (sample) {
      setRawInput(sample.json)
      if (sampleKey === "users_api") setTsRootName("UserApiResponse")
      if (sampleKey === "k8s_manifest") setTsRootName("K8sDeploymentSpec")
      if (sampleKey === "microservices_mesh") setTsRootName("MicroservicesMesh")
    }
  }

  // Upload JSON file
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      const content = event.target?.result as string
      if (content) {
        setRawInput(content)
      }
    }
    reader.readAsText(file)
    // Reset file input
    e.target.value = ""
  }

  // Download formatted JSON file
  const handleDownload = () => {
    const content = formattedJson || rawInput
    const blob = new Blob([content], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `formatted-${new Date().toISOString().slice(0, 10)}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Determine active visual theme for the code workspace
  const effectiveTheme =
    editorThemeMode === "auto"
      ? resolvedTheme === "dark"
        ? "dark"
        : "light"
      : editorThemeMode

  return (
    <div
      className={cn(
        "transition-all duration-150",
        isFullscreen
          ? "fixed inset-0 z-50 bg-background p-3 sm:p-5 flex flex-col overflow-hidden"
          : "space-y-3"
      )}
    >
      {/* Top Toolbar: Formatting, Presets, Indentation & Theme Toggle */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-border bg-card p-2.5 sm:p-3 shadow-xs shrink-0">
        {/* Left Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <Button
            size="sm"
            onClick={handleBeautify}
            disabled={!rawInput.trim()}
            className="cursor-pointer gap-1.5 text-xs font-semibold shadow-xs"
            title="Format / Beautify JSON"
          >
            <Sparkles className="size-3.5 text-amber-300" />
            <span>Format</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleMinify}
            disabled={!rawInput.trim()}
            className="cursor-pointer gap-1.5 text-xs"
            title="Minify JSON into a single compact line"
          >
            <Minimize2 className="size-3.5" />
            <span>Minify</span>
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleRepair}
            disabled={!rawInput.trim()}
            className="cursor-pointer gap-1.5 text-xs border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10 font-medium"
            title="Auto-repair missing commas, quotes, Python True/False, and syntax issues"
          >
            <Wand2 className="size-3.5" />
            <span>Auto-Repair</span>
          </Button>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* Sort Keys buttons */}
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSortKeys("asc")}
            disabled={!parsedJson}
            className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            title="Sort Keys A to Z"
          >
            <ArrowDownAZ className="size-4" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => handleSortKeys("desc")}
            disabled={!parsedJson}
            className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground hidden sm:inline-flex"
            title="Sort Keys Z to A"
          >
            <ArrowUpAZ className="size-4" />
          </Button>

          <div className="h-5 w-px bg-border mx-1 hidden sm:block" />

          {/* Indent selector */}
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <span className="text-[11px] font-medium hidden sm:inline">Indent:</span>
            <select
              value={indentOption}
              onChange={(e) => setIndentOption(e.target.value)}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs font-mono text-foreground cursor-pointer outline-none"
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </div>

          {/* Samples Dropdown */}
          <div className="flex items-center gap-1">
            <select
              defaultValue=""
              onChange={(e) => {
                if (e.target.value) handleLoadSample(e.target.value)
                e.target.value = ""
              }}
              className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-muted-foreground cursor-pointer outline-none hover:text-foreground max-w-[140px] sm:max-w-none"
            >
              <option value="" disabled>
                Load Sample...
              </option>
              <option value="users_api">User API (Tehran Team)</option>
              <option value="k8s_manifest">K8s Deployment Spec</option>
              <option value="microservices_mesh">Microservice Telemetry Mesh</option>
            </select>
          </div>
        </div>

        {/* Right Actions: Upload, Download, Copy, Theme */}
        <div className="flex items-center gap-1.5 ml-auto">
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json,text/plain"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button
            size="sm"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Upload .json file"
          >
            <Upload className="size-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={handleDownload}
            disabled={!rawInput.trim()}
            className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Download formatted .json file"
          >
            <Download className="size-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={() => handleCopy(formattedJson || rawInput, "full_json")}
            disabled={!rawInput.trim()}
            className="cursor-pointer gap-1.5 text-xs"
            title="Copy formatted JSON to clipboard"
          >
            {copiedItem === "full_json" ? (
              <Check className="size-3.5 text-emerald-500" />
            ) : (
              <Copy className="size-3.5" />
            )}
            <span className="hidden sm:inline">
              {copiedItem === "full_json" ? "Copied" : "Copy"}
            </span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setRawInput("")}
            disabled={!rawInput}
            className="size-8 p-0 cursor-pointer text-muted-foreground hover:text-destructive"
            title="Clear editor"
          >
            <Trash2 className="size-4" />
          </Button>

          <div className="h-5 w-px bg-border mx-1" />

          {/* Theme override switcher for Code View */}
          <div className="flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setEditorThemeMode("auto")}
              className={cn(
                "size-6 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                editorThemeMode === "auto"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Sync with System/App theme"
            >
              <Laptop className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditorThemeMode("light")}
              className={cn(
                "size-6 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                editorThemeMode === "light"
                  ? "bg-amber-500/20 text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Light theme"
            >
              <Sun className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setEditorThemeMode("dark")}
              className={cn(
                "size-6 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                editorThemeMode === "dark"
                  ? "bg-sky-500/20 text-sky-400 font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Dark theme"
            >
              <Moon className="size-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-border mx-1 hidden md:block" />

          {/* View Mode Layout (Split / Editor / Viewer) */}
          <div className="hidden md:flex items-center rounded-lg border border-border bg-muted/30 p-0.5">
            <button
              type="button"
              onClick={() => setLayoutMode("split")}
              className={cn(
                "size-6 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                layoutMode === "split"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Split View (50 / 50)"
            >
              <Columns2 className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("editor")}
              className={cn(
                "size-6 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                layoutMode === "editor"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Editor Only (Full Width)"
            >
              <PanelLeft className="size-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode("viewer")}
              className={cn(
                "size-6 rounded-md flex items-center justify-center text-xs transition-colors cursor-pointer",
                layoutMode === "viewer"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title="Viewer Only (Full Width)"
            >
              <PanelRight className="size-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-border mx-1" />

          {/* Fullscreen Toggle Button */}
          <Button
            size="sm"
            variant={isFullscreen ? "default" : "outline"}
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="cursor-pointer gap-1.5 text-xs font-medium"
            title={isFullscreen ? "Exit Fullscreen (Esc)" : "Full Screen Formatter"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3.5" />
                <span className="hidden sm:inline">Exit (ESC)</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Auto Repair Feedback Toast/Banner */}
      {repairNotice && (
        <div
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-medium animate-in fade-in-0 duration-150 border shrink-0",
            repairNotice.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-400"
          )}
        >
          <CheckCircle2 className="size-4 shrink-0" />
          <span className="flex-1">{repairNotice.text}</span>
          <button
            type="button"
            onClick={() => setRepairNotice(null)}
            className="text-xs opacity-75 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Main Split Grid: Input on Left, Viewer on Right */}
      <div
        className={cn(
          "grid gap-3.5 transition-all",
          isFullscreen ? "flex-1 min-h-0" : "h-[calc(100vh-14rem)] min-h-[640px]",
          layoutMode === "split" && "grid-cols-1 lg:grid-cols-2",
          layoutMode === "editor" && "grid-cols-1",
          layoutMode === "viewer" && "grid-cols-1"
        )}
      >
        {/* LEFT COLUMN: Input Textarea & Parsing Status */}
        {layoutMode !== "viewer" && (
          <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden h-full">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <div className="flex items-center gap-2">
              <FileJson className="size-4 text-primary" />
              <span className="text-xs font-bold text-foreground">JSON Input</span>
              {parsedJson ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-[10px] text-emerald-600 dark:text-emerald-400 font-mono"
                >
                  <Check className="size-2.5" />
                  Valid JSON
                </Badge>
              ) : parseError ? (
                <Badge
                  variant="outline"
                  className="gap-1 border-destructive/30 bg-destructive/10 text-[10px] text-destructive font-mono"
                >
                  <AlertCircle className="size-2.5" />
                  Syntax Error
                </Badge>
              ) : null}
            </div>

            <div className="text-[11px] font-mono text-muted-foreground">
              {stats ? `${stats.lines} lines • ${formatBytes(stats.sizeBytes)}` : ""}
            </div>
          </div>

          {/* Textarea Editor Area */}
          <div className="relative flex-1 min-h-0 bg-background">
            <textarea
              value={rawInput}
              onChange={(e) => setRawInput(e.target.value)}
              placeholder="Paste or type raw JSON here... (e.g. { 'foo': 'bar' })"
              spellCheck={false}
              className={cn(
                "size-full resize-none p-4 font-mono text-xs leading-relaxed outline-none transition-colors",
                effectiveTheme === "dark"
                  ? "bg-[#0d1117] text-[#c9d1d9] selection:bg-sky-900/60"
                  : "bg-[#f6f8fa] text-[#24292f] selection:bg-sky-200"
              )}
            />
          </div>

          {/* Error Banner or Quick Stats Footer */}
          {parseError ? (
            <div className="border-t border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive flex items-start gap-2">
              <AlertCircle className="size-4 shrink-0 mt-0.5" />
              <div className="flex-1 overflow-hidden">
                <div className="font-semibold flex items-center justify-between">
                  <span>{parseError.message}</span>
                  {parseError.line ? (
                    <span className="font-mono text-[11px] px-1.5 py-0.2 rounded bg-destructive/20">
                      Line {parseError.line}, Col {parseError.col}
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[11px] opacity-80">
                    Try clicking &ldquo;Auto-Repair&rdquo; above to automatically fix syntax issues.
                  </span>
                  <button
                    type="button"
                    onClick={handleRepair}
                    className="underline text-[11px] font-medium hover:opacity-90"
                  >
                    Fix Now
                  </button>
                </div>
              </div>
            </div>
          ) : stats ? (
            <div className="border-t border-border bg-muted/20 px-4 py-2 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-muted-foreground">
              <div className="flex items-center gap-3">
                <span>{stats.characters.toLocaleString()} chars</span>
                <span>•</span>
                <span>{stats.keysCount} keys</span>
                <span>•</span>
                <span>{stats.arraysCount} arrays</span>
              </div>
              <div>Depth: Level {stats.maxDepth}</div>
            </div>
          ) : null}
        </div>
        )}

        {/* RIGHT COLUMN: Interactive Tree, Raw Code, Table, TypeScript */}
        {layoutMode !== "editor" && (
          <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden h-full">
          {/* Header with View Tabs */}
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewTab("tree")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  viewTab === "tree"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <FolderTree className="size-3.5" />
                <span>Tree View</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("code")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  viewTab === "code"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Code2 className="size-3.5" />
                <span>Code</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("table")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  viewTab === "table"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <TableIcon className="size-3.5" />
                <span>Table</span>
              </button>

              <button
                type="button"
                onClick={() => setViewTab("typescript")}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors cursor-pointer",
                  viewTab === "typescript"
                    ? "bg-primary text-primary-foreground shadow-2xs"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <FileCode className="size-3.5 text-sky-400" />
                <span>TypeScript</span>
              </button>
            </div>

            {/* Tree Specific Controls (Search, Depth) */}
            {viewTab === "tree" && parsedJson && (
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <Search className="absolute left-2 top-2 size-3 text-muted-foreground" />
                  <input
                    type="text"
                    value={treeSearch}
                    onChange={(e) => setTreeSearch(e.target.value)}
                    placeholder="Filter keys/values..."
                    className="h-7 w-32 md:w-44 rounded-md border border-border bg-background pl-7 pr-2 text-xs font-mono text-foreground placeholder:text-muted-foreground outline-none"
                  />
                </div>

                <select
                  value={maxExpandedDepth}
                  onChange={(e) => setMaxExpandedDepth(Number(e.target.value))}
                  className="h-7 rounded-md border border-border bg-background px-1.5 text-xs font-mono text-foreground cursor-pointer outline-none"
                  title="Expand to Depth"
                >
                  <option value={1}>Lvl 1</option>
                  <option value={2}>Lvl 2</option>
                  <option value={3}>Lvl 3</option>
                  <option value={5}>Lvl 5</option>
                  <option value={99}>All</option>
                </select>
              </div>
            )}

            {/* TypeScript Specific Controls */}
            {viewTab === "typescript" && (
              <div className="flex items-center gap-1.5">
                <Input
                  value={tsRootName}
                  onChange={(e) => setTsRootName(e.target.value)}
                  placeholder="Root interface name"
                  className="h-7 w-36 text-xs font-mono bg-background"
                />
                <Button
                  size="xs"
                  onClick={() => handleCopy(tsOutput, "ts_types")}
                  className="cursor-pointer gap-1 text-xs"
                >
                  {copiedItem === "ts_types" ? (
                    <Check className="size-3 text-emerald-400" />
                  ) : (
                    <Copy className="size-3" />
                  )}
                  <span>Copy TS</span>
                </Button>
              </div>
            )}
          </div>

          {/* Viewer Body */}
          <div
            className={cn(
              "flex-1 min-h-0 overflow-auto p-4 transition-colors",
              effectiveTheme === "dark"
                ? "bg-[#0d1117] text-[#c9d1d9]"
                : "bg-[#f6f8fa] text-[#24292f]"
            )}
          >
            {!rawInput.trim() ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                <FileJson className="size-10 stroke-1 opacity-30 mb-2" />
                <p className="text-sm font-medium">No JSON input</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Type or paste JSON on the left panel, or click &ldquo;Load Sample&rdquo;
                </p>
              </div>
            ) : parseError ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-6">
                <AlertCircle className="size-10 text-destructive/60 mb-2" />
                <p className="text-sm font-semibold text-foreground">
                  Invalid JSON Syntax
                </p>
                <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                  {parseError.message}
                </p>
                <Button
                  size="sm"
                  onClick={handleRepair}
                  className="mt-4 gap-1.5 text-xs bg-amber-500 hover:bg-amber-600 text-white"
                >
                  <Wand2 className="size-3.5" />
                  <span>Attempt Auto-Repair</span>
                </Button>
              </div>
            ) : viewTab === "tree" ? (
              /* TREE VIEW */
              <div className="font-mono">
                <JsonTreeNode
                  value={parsedJson}
                  path=""
                  depth={0}
                  maxExpandedDepth={maxExpandedDepth}
                  searchQuery={treeSearch}
                  onCopyText={handleCopy}
                  copiedPath={copiedItem}
                />
              </div>
            ) : viewTab === "code" ? (
              /* CODE VIEW WITH LINE NUMBERS */
              <div className="flex font-mono text-xs leading-relaxed">
                {/* Line numbers gutter */}
                <div className="select-none pr-4 text-right text-muted-foreground/40 font-mono text-xs border-r border-border/40">
                  {formattedJson.split("\n").map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                {/* Highlighted text */}
                <pre className="pl-4 flex-1 overflow-x-auto whitespace-pre font-mono text-xs">
                  {formattedJson}
                </pre>
              </div>
            ) : viewTab === "table" ? (
              /* TABLE VIEW */
              <div className="font-sans">
                <JsonTableView data={parsedJson} />
              </div>
            ) : viewTab === "typescript" ? (
              /* TYPESCRIPT DEFINITIONS */
              <div className="space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between text-muted-foreground text-[11px] pb-1 border-b border-border/40">
                  <span>Generated TypeScript Interfaces</span>
                  <span>Auto-inferred types</span>
                </div>
                <pre className="whitespace-pre-wrap font-mono text-xs text-sky-400 leading-relaxed">
                  {tsOutput}
                </pre>
              </div>
            ) : null}
          </div>

          {/* Viewer Footer: Quick Path or Info Bar */}
          <div className="border-t border-border bg-muted/20 px-4 py-2 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
            <div className="truncate">
              {viewTab === "tree" ? (
                <span>Hover a node to copy path or value</span>
              ) : viewTab === "typescript" ? (
                <span>Pure TypeScript types ready for frontend / backend code</span>
              ) : viewTab === "table" ? (
                <span>Sortable spreadsheet view for array models</span>
              ) : (
                <span>Formatted JSON code block</span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-[10px] uppercase font-mono">
                {effectiveTheme} mode
              </Badge>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  )
}
