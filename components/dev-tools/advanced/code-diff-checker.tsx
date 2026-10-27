"use client"

import * as React from "react"
import {
  GitCompare,
  ArrowLeftRight,
  Copy,
  Check,
  Trash2,
  Columns,
  Rows,
  Plus,
  Minus,
  FileCode,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface DiffLine {
  type: "added" | "deleted" | "unchanged"
  leftNum?: number
  rightNum?: number
  text: string
}

const SAMPLE_ORIGINAL = `function fetchUserData(userId: string) {
  const url = "/api/v1/user/" + userId;
  return fetch(url)
    .then((res) => res.json())
    .catch((err) => {
      console.error(err);
      return null;
    });
}`

const SAMPLE_MODIFIED = `async function fetchUserData(userId: string): Promise<User | null> {
  const url = \`/api/v2/users/\${encodeURIComponent(userId)}\`;
  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) throw new Error(\`HTTP error: \${res.status}\`);
    return await res.json();
  } catch (err) {
    console.error("Fetch user error:", err);
    return null;
  }
}`

export function CodeDiffChecker() {
  const [originalCode, setOriginalCode] = React.useState<string>(SAMPLE_ORIGINAL)
  const [modifiedCode, setModifiedCode] = React.useState<string>(SAMPLE_MODIFIED)
  const [viewMode, setViewMode] = React.useState<"split" | "unified">("split")
  const [copiedPatch, setCopiedPatch] = React.useState<boolean>(false)

  // Compute diff lines using Myers / LCS line matching
  const { diffLines, addedCount, deletedCount, unchangedCount } = React.useMemo(() => {
    const origLines = originalCode.split("\n")
    const modLines = modifiedCode.split("\n")

    // Dynamic programming matrix for LCS
    const n = origLines.length
    const m = modLines.length
    const dp: number[][] = Array.from({ length: n + 1 }, () => Array(m + 1).fill(0))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < m; j++) {
        if (origLines[i] === modLines[j]) {
          dp[i + 1][j + 1] = dp[i][j] + 1
        } else {
          dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1])
        }
      }
    }

    // Backtrack to build diff
    const result: DiffLine[] = []
    let i = n
    let j = m
    const temp: DiffLine[] = []

    while (i > 0 || j > 0) {
      if (i > 0 && j > 0 && origLines[i - 1] === modLines[j - 1]) {
        temp.push({
          type: "unchanged",
          leftNum: i,
          rightNum: j,
          text: origLines[i - 1],
        })
        i--
        j--
      } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
        temp.push({
          type: "added",
          rightNum: j,
          text: modLines[j - 1],
        })
        j--
      } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
        temp.push({
          type: "deleted",
          leftNum: i,
          text: origLines[i - 1],
        })
        i--
      }
    }

    temp.reverse()

    let added = 0
    let deleted = 0
    let unchanged = 0

    temp.forEach((line) => {
      if (line.type === "added") added++
      else if (line.type === "deleted") deleted++
      else unchanged++
    })

    return {
      diffLines: temp,
      addedCount: added,
      deletedCount: deleted,
      unchangedCount: unchanged,
    }
  }, [originalCode, modifiedCode])

  const handleSwap = () => {
    setOriginalCode(modifiedCode)
    setModifiedCode(originalCode)
  }

  const handleCopyUnified = () => {
    const patch = diffLines
      .map((l) => {
        const prefix = l.type === "added" ? "+" : l.type === "deleted" ? "-" : " "
        return `${prefix} ${l.text}`
      })
      .join("\n")
    navigator.clipboard.writeText(patch)
    setCopiedPatch(true)
    setTimeout(() => setCopiedPatch(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm">
            <GitCompare className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Code & Text Diff Comparator
              </h2>
              <Badge
                variant="outline"
                className="border-blue-500/40 bg-blue-500/10 text-[10px] font-mono text-blue-600 dark:text-blue-400"
              >
                Git LCS Engine
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Side-by-side split and unified code comparison with line numbers and patch export.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center rounded-xl border border-border/80 bg-muted/40 p-0.5">
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                viewMode === "split"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Columns className="size-3.5" />
              <span>Split</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("unified")}
              className={cn(
                "flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer",
                viewMode === "unified"
                  ? "bg-card text-foreground shadow-2xs font-bold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Rows className="size-3.5" />
              <span>Unified</span>
            </button>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleSwap}
            className="text-xs h-8 cursor-pointer"
            title="Swap Original and Modified"
          >
            <ArrowLeftRight className="size-3 mr-1" />
            Swap
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleCopyUnified}
            className="text-xs bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-8 cursor-pointer shadow-xs"
          >
            {copiedPatch ? (
              <>
                <Check className="size-3.5 mr-1 text-emerald-300" />
                Copied Patch
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" />
                Copy Diff
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="flex items-center justify-between rounded-xl border border-border/70 bg-card px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
            <Plus className="size-3" />
            {addedCount} added
          </span>
          <span className="flex items-center gap-1 font-mono font-semibold text-rose-600 dark:text-rose-400">
            <Minus className="size-3" />
            {deletedCount} deleted
          </span>
          <span className="font-mono text-muted-foreground">
            {unchangedCount} unchanged
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              setOriginalCode(SAMPLE_ORIGINAL)
              setModifiedCode(SAMPLE_MODIFIED)
            }}
            className="text-[11px] text-primary hover:underline cursor-pointer"
          >
            Load Sample
          </button>
          <span className="text-border">•</span>
          <button
            type="button"
            onClick={() => {
              setOriginalCode("")
              setModifiedCode("")
            }}
            className="text-[11px] text-muted-foreground hover:text-destructive cursor-pointer"
          >
            Clear Both
          </button>
        </div>
      </div>

      {/* Input Editors (Collapsible or Split) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Original */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Original Code / Text</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {originalCode.split("\n").length} lines
            </span>
          </div>
          <textarea
            rows={8}
            value={originalCode}
            onChange={(e) => setOriginalCode(e.target.value)}
            placeholder="Paste original code here..."
            className="w-full rounded-xl border border-border/80 bg-background/80 p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
          />
        </div>

        {/* Right: Modified */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Modified Code / Text</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {modifiedCode.split("\n").length} lines
            </span>
          </div>
          <textarea
            rows={8}
            value={modifiedCode}
            onChange={(e) => setModifiedCode(e.target.value)}
            placeholder="Paste modified code here..."
            className="w-full rounded-xl border border-border/80 bg-background/80 p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
          />
        </div>
      </div>

      {/* Visual Diff Output */}
      <div className="rounded-2xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="border-b border-border/60 bg-muted/40 px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
            <FileCode className="size-3.5 text-primary" />
            Visual Diff Output ({viewMode === "split" ? "Side-by-Side" : "Unified"})
          </span>
          <span className="text-[11px] font-mono text-muted-foreground">
            {diffLines.length} total lines
          </span>
        </div>

        {viewMode === "unified" ? (
          /* Unified View */
          <div className="max-h-[500px] overflow-auto font-mono text-xs divide-y divide-border/30 bg-background/60">
            {diffLines.map((line, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-stretch px-3 py-1 font-mono text-xs transition-colors",
                  line.type === "added" &&
                    "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
                  line.type === "deleted" &&
                    "bg-rose-500/10 text-rose-700 dark:text-rose-300",
                  line.type === "unchanged" && "text-muted-foreground hover:bg-muted/30"
                )}
              >
                <span className="w-8 shrink-0 text-right pr-2 text-[10px] opacity-40 select-none">
                  {line.leftNum || ""}
                </span>
                <span className="w-8 shrink-0 text-right pr-2 text-[10px] opacity-40 select-none">
                  {line.rightNum || ""}
                </span>
                <span className="w-5 shrink-0 text-center font-bold select-none">
                  {line.type === "added" ? "+" : line.type === "deleted" ? "-" : " "}
                </span>
                <span className="whitespace-pre-wrap break-all flex-1 text-foreground">
                  {line.text}
                </span>
              </div>
            ))}
          </div>
        ) : (
          /* Split View */
          <div className="max-h-[500px] overflow-auto font-mono text-xs divide-y divide-border/30 bg-background/60">
            {diffLines.map((line, idx) => (
              <div key={idx} className="grid grid-cols-2 divide-x divide-border/40 text-xs">
                {/* Left Side (Deletions & Unchanged) */}
                <div
                  className={cn(
                    "flex items-stretch px-3 py-1",
                    line.type === "deleted"
                      ? "bg-rose-500/10 text-rose-700 dark:text-rose-300"
                      : line.type === "unchanged"
                        ? "text-muted-foreground"
                        : "bg-muted/10 opacity-30 select-none"
                  )}
                >
                  <span className="w-7 shrink-0 text-right pr-2 text-[10px] opacity-50 select-none">
                    {line.leftNum || ""}
                  </span>
                  <span className="w-4 shrink-0 text-center font-bold select-none">
                    {line.type === "deleted" ? "-" : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1 text-foreground">
                    {line.type !== "added" ? line.text : ""}
                  </span>
                </div>

                {/* Right Side (Additions & Unchanged) */}
                <div
                  className={cn(
                    "flex items-stretch px-3 py-1",
                    line.type === "added"
                      ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : line.type === "unchanged"
                        ? "text-muted-foreground"
                        : "bg-muted/10 opacity-30 select-none"
                  )}
                >
                  <span className="w-7 shrink-0 text-right pr-2 text-[10px] opacity-50 select-none">
                    {line.rightNum || ""}
                  </span>
                  <span className="w-4 shrink-0 text-center font-bold select-none">
                    {line.type === "added" ? "+" : " "}
                  </span>
                  <span className="whitespace-pre-wrap break-all flex-1 text-foreground">
                    {line.type !== "deleted" ? line.text : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
