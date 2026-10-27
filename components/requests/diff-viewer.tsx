"use client"

import * as React from "react"
import { Check, Copy, GitBranch, GitCommit, Terminal } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DiffViewerProps {
  diff: string
  branchName?: string | null
  prUrl?: string | null
}

export function DiffViewer({ diff, branchName, prUrl }: DiffViewerProps) {
  const [copiedPatch, setCopiedPatch] = React.useState(false)
  const [copiedCheckout, setCopiedCheckout] = React.useState(false)

  const copyPatchToClipboard = () => {
    navigator.clipboard.writeText(diff)
    setCopiedPatch(true)
    setTimeout(() => setCopiedPatch(false), 2000)
  }

  const checkoutCommand = branchName
    ? `git fetch origin ${branchName} && git checkout ${branchName}`
    : `git apply << 'EOF'\n${diff}\nEOF`

  const copyCheckoutCommand = () => {
    navigator.clipboard.writeText(checkoutCommand)
    setCopiedCheckout(true)
    setTimeout(() => setCopiedCheckout(false), 2000)
  }

  // Parse lines for syntax highlighting
  const lines = React.useMemo(() => {
    return diff.split("\n").map((line, index) => {
      let type: "header" | "chunk" | "added" | "removed" | "normal" = "normal"
      if (line.startsWith("---") || line.startsWith("+++")) {
        type = "header"
      } else if (line.startsWith("@@")) {
        type = "chunk"
      } else if (line.startsWith("+")) {
        type = "added"
      } else if (line.startsWith("-")) {
        type = "removed"
      }
      return { line, index, type }
    })
  }, [diff])

  return (
    <div className="flex flex-col rounded-lg border border-border bg-slate-950 font-mono text-xs text-slate-100 shadow-md overflow-hidden">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/90 px-3 py-2 text-[11px]">
        <div className="flex items-center gap-2 text-slate-300">
          <Terminal className="size-3.5 text-emerald-400" />
          <span className="font-semibold text-slate-200">Git Patch / Diff</span>
          {branchName && (
            <span className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[10px] text-amber-300">
              <GitBranch className="size-2.5" />
              {branchName}
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {branchName && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={copyCheckoutCommand}
              className="h-6 gap-1 border-slate-700 bg-slate-800/80 px-2 text-[10px] text-slate-200 hover:bg-slate-700 hover:text-white"
              title="Copy git checkout command"
            >
              {copiedCheckout ? (
                <>
                  <Check className="size-2.5 text-emerald-400" />
                  <span>Copied cmd</span>
                </>
              ) : (
                <>
                  <GitCommit className="size-2.5 text-sky-400" />
                  <span>Copy Checkout</span>
                </>
              )}
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={copyPatchToClipboard}
            className="h-6 gap-1 border-slate-700 bg-slate-800/80 px-2 text-[10px] text-slate-200 hover:bg-slate-700 hover:text-white"
            title="Copy entire diff patch"
          >
            {copiedPatch ? (
              <>
                <Check className="size-2.5 text-emerald-400" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="size-2.5 text-slate-400" />
                <span>Copy Patch</span>
              </>
            )}
          </Button>

          {prUrl && (
            <a
              href={prUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-6 items-center rounded border border-purple-500/40 bg-purple-950/60 px-2 text-[10px] font-medium text-purple-300 hover:bg-purple-900/60"
            >
              Open Git PR ↗
            </a>
          )}
        </div>
      </div>

      {/* Code diff lines */}
      <div className="max-h-72 overflow-x-auto overflow-y-auto p-2 text-[11px] leading-5 select-text">
        {lines.map(({ line, index, type }) => {
          let rowClass = "text-slate-300 hover:bg-slate-900/60"
          let prefixColor = "text-slate-600"

          if (type === "added") {
            rowClass = "bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/50"
            prefixColor = "text-emerald-400"
          } else if (type === "removed") {
            rowClass = "bg-rose-950/50 text-rose-200 line-through/40 hover:bg-rose-900/50"
            prefixColor = "text-rose-400"
          } else if (type === "chunk") {
            rowClass = "bg-sky-950/40 text-sky-300 font-semibold my-0.5 py-0.5 px-1 rounded-xs"
            prefixColor = "text-sky-400"
          } else if (type === "header") {
            rowClass = "text-amber-300/90 font-semibold"
            prefixColor = "text-amber-400"
          }

          return (
            <div key={index} className={`flex items-start px-2 py-0.5 rounded-xs ${rowClass}`}>
              <span className={`w-8 shrink-0 text-right select-none pr-3 text-[10px] font-mono opacity-50`}>
                {index + 1}
              </span>
              <pre className="font-mono whitespace-pre flex-1 overflow-visible">
                {line}
              </pre>
            </div>
          )
        })}
      </div>
    </div>
  )
}
