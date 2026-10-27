"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Copy, Check, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface JsonTreeNodeProps {
  keyName?: string
  value: any
  path: string
  depth: number
  maxExpandedDepth: number
  searchQuery: string
  onCopyText: (text: string, path: string) => void
  copiedPath: string | null
}

export function JsonTreeNode({
  keyName,
  value,
  path,
  depth,
  maxExpandedDepth,
  searchQuery,
  onCopyText,
  copiedPath,
}: JsonTreeNodeProps) {
  const isObject = value !== null && typeof value === "object"
  const isArray = Array.isArray(value)

  // Determine initial expanded state based on depth
  const [isExpanded, setIsExpanded] = React.useState<boolean>(() => {
    return depth <= maxExpandedDepth
  })

  // Update expanded state whenever maxExpandedDepth changes
  React.useEffect(() => {
    setIsExpanded(depth <= maxExpandedDepth)
  }, [maxExpandedDepth, depth])

  // Check if this node or any child matches search query
  const matchesSearch = React.useMemo(() => {
    if (!searchQuery) return false
    const q = searchQuery.toLowerCase()
    if (keyName && keyName.toLowerCase().includes(q)) return true
    if (!isObject && String(value).toLowerCase().includes(q)) return true
    return false
  }, [searchQuery, keyName, value, isObject])

  // Auto-expand if matching search
  React.useEffect(() => {
    if (matchesSearch && isObject) {
      setIsExpanded(true)
    }
  }, [matchesSearch, isObject])

  const highlightText = (text: string) => {
    if (!searchQuery) return text
    const q = searchQuery.toLowerCase()
    const str = String(text)
    const idx = str.toLowerCase().indexOf(q)
    if (idx === -1) return text
    return (
      <>
        {str.slice(0, idx)}
        <mark className="bg-amber-400/40 text-foreground rounded-xs px-0.5">
          {str.slice(idx, idx + searchQuery.length)}
        </mark>
        {str.slice(idx + searchQuery.length)}
      </>
    )
  }

  const renderValue = () => {
    if (value === null) {
      return (
        <span className="font-mono text-rose-600 dark:text-rose-400 font-semibold italic">
          null
        </span>
      )
    }
    if (value === undefined) {
      return (
        <span className="font-mono text-muted-foreground italic">undefined</span>
      )
    }
    if (typeof value === "boolean") {
      return (
        <span className="font-mono text-purple-600 dark:text-purple-400 font-bold">
          {highlightText(value ? "true" : "false")}
        </span>
      )
    }
    if (typeof value === "number") {
      return (
        <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">
          {highlightText(String(value))}
        </span>
      )
    }
    if (typeof value === "string") {
      return (
        <span className="font-mono text-emerald-700 dark:text-emerald-400 break-all">
          &quot;{highlightText(value)}&quot;
        </span>
      )
    }
    return <span className="font-mono text-foreground">{String(value)}</span>
  }

  // Primitive value
  if (!isObject) {
    const isThisCopied = copiedPath === path
    const isPathCopied = copiedPath === `path:${path}`

    return (
      <div
        className={cn(
          "group/item flex items-center gap-1.5 py-0.5 px-1.5 rounded-sm hover:bg-muted/50 transition-colors text-xs leading-relaxed",
          matchesSearch && "bg-amber-500/10 dark:bg-amber-500/20 rounded"
        )}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
      >
        {keyName !== undefined ? (
          <>
            <span className="font-mono font-semibold text-sky-700 dark:text-sky-300">
              &quot;{highlightText(keyName)}&quot;
            </span>
            <span className="text-muted-foreground font-mono">:</span>
          </>
        ) : null}

        <div className="flex-1 min-w-0">{renderValue()}</div>

        {/* Hover Action Buttons */}
        <div className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity shrink-0">
          <button
            type="button"
            onClick={() => onCopyText(path, `path:${path}`)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-0.5 font-mono"
            title={`Copy JSON Path: ${path}`}
          >
            {isPathCopied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Hash className="size-3" />
            )}
            <span className="hidden sm:inline">path</span>
          </button>
          <button
            type="button"
            onClick={() =>
              onCopyText(typeof value === "string" ? value : JSON.stringify(value), path)
            }
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-0.5"
            title="Copy Value"
          >
            {isThisCopied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
            <span className="hidden sm:inline">val</span>
          </button>
        </div>
      </div>
    )
  }

  // Object or Array
  const entries = isArray
    ? value.map((val, idx) => [idx, val])
    : Object.entries(value)
  const count = entries.length
  const isThisCopied = copiedPath === path
  const isPathCopied = copiedPath === `path:${path}`

  return (
    <div className="text-xs">
      {/* Node Header Row */}
      <div
        className={cn(
          "group/item flex items-center gap-1.5 py-0.5 px-1.5 rounded-sm hover:bg-muted/50 transition-colors cursor-pointer select-none",
          matchesSearch && "bg-amber-500/10 dark:bg-amber-500/20 rounded"
        )}
        style={{ paddingLeft: `${depth * 1.25}rem` }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="size-4 shrink-0 flex items-center justify-center text-muted-foreground">
          {isExpanded ? (
            <ChevronDown className="size-3.5" />
          ) : (
            <ChevronRight className="size-3.5" />
          )}
        </span>

        {keyName !== undefined ? (
          <>
            <span className="font-mono font-semibold text-sky-700 dark:text-sky-300">
              &quot;{highlightText(keyName)}&quot;
            </span>
            <span className="text-muted-foreground font-mono">:</span>
          </>
        ) : null}

        <span className="font-mono text-muted-foreground">
          {isArray ? "[" : "{"}
        </span>

        {!isExpanded && (
          <span className="font-mono text-[11px] text-muted-foreground bg-muted/70 px-1.5 py-0.2 rounded-xs">
            {count} {isArray ? "items" : "keys"}
          </span>
        )}

        {!isExpanded && (
          <span className="font-mono text-muted-foreground">
            {isArray ? "]" : "}"}
          </span>
        )}

        {/* Hover actions */}
        <div
          className="opacity-0 group-hover/item:opacity-100 flex items-center gap-1 transition-opacity ml-auto shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {path ? (
            <button
              type="button"
              onClick={() => onCopyText(path, `path:${path}`)}
              className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-0.5 font-mono"
              title={`Copy JSON Path: ${path}`}
            >
              {isPathCopied ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Hash className="size-3" />
              )}
              <span className="hidden sm:inline">path</span>
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => onCopyText(JSON.stringify(value, null, 2), path)}
            className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground text-[10px] flex items-center gap-0.5"
            title="Copy Object JSON"
          >
            {isThisCopied ? (
              <Check className="size-3 text-emerald-500" />
            ) : (
              <Copy className="size-3" />
            )}
            <span className="hidden sm:inline">copy</span>
          </button>
        </div>
      </div>

      {/* Children elements when expanded */}
      {isExpanded && (
        <div className="relative border-l border-border/40 ml-[calc(1.25rem*var(--depth)+0.5rem)] my-0.5">
          {entries.map(([childKey, childValue]) => {
            const childPath = isArray
              ? `${path}[${childKey}]`
              : path
                ? `${path}.${childKey}`
                : String(childKey)

            return (
              <JsonTreeNode
                key={String(childKey)}
                keyName={isArray ? undefined : String(childKey)}
                value={childValue}
                path={childPath}
                depth={depth + 1}
                maxExpandedDepth={maxExpandedDepth}
                searchQuery={searchQuery}
                onCopyText={onCopyText}
                copiedPath={copiedPath}
              />
            )
          })}
          <div
            className="font-mono text-muted-foreground text-xs py-0.5"
            style={{ paddingLeft: `${(depth + 1) * 1.25}rem` }}
          >
            {isArray ? "]" : "}"}
          </div>
        </div>
      )}
    </div>
  )
}
