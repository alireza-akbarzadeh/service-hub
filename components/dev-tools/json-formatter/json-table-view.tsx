"use client"

import * as React from "react"
import { Search, ArrowUpDown, Copy, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface JsonTableViewProps {
  data: any
}

export function JsonTableView({ data }: JsonTableViewProps) {
  const [search, setSearch] = React.useState("")
  const [sortKey, setSortKey] = React.useState<string | null>(null)
  const [sortOrder, setSortOrder] = React.useState<"asc" | "desc">("asc")
  const [copiedCell, setCopiedCell] = React.useState<string | null>(null)

  // Find array of objects in data (either root or first array property)
  const targetArray: Record<string, any>[] | null = React.useMemo(() => {
    if (Array.isArray(data) && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      return data
    }
    if (data && typeof data === "object") {
      for (const val of Object.values(data)) {
        if (Array.isArray(val) && val.length > 0 && typeof val[0] === "object" && val[0] !== null) {
          return val
        }
      }
    }
    return null
  }, [data])

  // Extract all unique keys from array objects
  const columns: string[] = React.useMemo(() => {
    if (!targetArray) return []
    const keySet = new Set<string>()
    for (const item of targetArray) {
      if (item && typeof item === "object") {
        Object.keys(item).forEach((k) => keySet.add(k))
      }
    }
    return Array.from(keySet)
  }, [targetArray])

  // Filter and sort items
  const filteredItems = React.useMemo(() => {
    if (!targetArray) return []
    let list = [...targetArray]

    if (search.trim()) {
      const q = search.trim().toLowerCase()
      list = list.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(q)
        )
      )
    }

    if (sortKey) {
      list.sort((a, b) => {
        const valA = a[sortKey]
        const valB = b[sortKey]
        if (valA === valB) return 0
        if (valA === undefined || valA === null) return 1
        if (valB === undefined || valB === null) return -1
        const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true })
        return sortOrder === "asc" ? comp : -comp
      })
    }

    return list
  }, [targetArray, search, sortKey, sortOrder])

  const copyCell = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedCell(id)
    setTimeout(() => setCopiedCell(null), 1500)
  }

  const handleSort = (col: string) => {
    if (sortKey === col) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortKey(col)
      setSortOrder("asc")
    }
  }

  if (!targetArray || columns.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed border-border rounded-xl">
        <p className="text-sm font-medium">Table view requires an Array of Objects</p>
        <p className="text-xs text-muted-foreground mt-1 max-w-sm">
          Your JSON does not contain a list of records. Try switching to the Tree View or Code View.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Search & Meta Bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-2.5 size-3.5 text-muted-foreground" />
          <Input
            placeholder="Search in table..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 text-xs bg-background"
          />
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Badge variant="outline" className="font-mono text-[11px]">
            {filteredItems.length} of {targetArray.length} records
          </Badge>
          <Badge variant="outline" className="font-mono text-[11px]">
            {columns.length} columns
          </Badge>
        </div>
      </div>

      {/* Table Box */}
      <div className="overflow-x-auto rounded-xl border border-border bg-card shadow-xs">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-muted-foreground">
              <th className="px-3 py-2 font-mono text-[11px] font-semibold text-center w-12 border-r border-border/50">
                #
              </th>
              {columns.map((col) => (
                <th
                  key={col}
                  onClick={() => handleSort(col)}
                  className="px-3 py-2 font-mono text-[11px] font-semibold cursor-pointer hover:bg-muted/80 transition-colors select-none"
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate">{col}</span>
                    <ArrowUpDown className="size-3 shrink-0 opacity-50" />
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 font-mono">
            {filteredItems.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="hover:bg-muted/30 transition-colors group"
              >
                <td className="px-3 py-2 text-center text-muted-foreground bg-muted/10 border-r border-border/50 text-[10px]">
                  {rowIdx + 1}
                </td>
                {columns.map((col) => {
                  const rawVal = row[col]
                  const cellId = `${rowIdx}-${col}`
                  const isCopied = copiedCell === cellId

                  let displayStr = ""
                  let isObj = false

                  if (rawVal === null) {
                    displayStr = "null"
                  } else if (rawVal === undefined) {
                    displayStr = "—"
                  } else if (typeof rawVal === "object") {
                    displayStr = JSON.stringify(rawVal)
                    isObj = true
                  } else {
                    displayStr = String(rawVal)
                  }

                  return (
                    <td
                      key={col}
                      className="px-3 py-2 max-w-[240px] truncate relative group/cell"
                      title={displayStr}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={cn(
                            "truncate",
                            rawVal === null && "italic text-rose-500",
                            typeof rawVal === "boolean" && "text-purple-600 dark:text-purple-400 font-semibold",
                            typeof rawVal === "number" && "text-amber-600 dark:text-amber-400",
                            typeof rawVal === "string" && "text-emerald-700 dark:text-emerald-400",
                            isObj && "text-muted-foreground text-[10px]"
                          )}
                        >
                          {displayStr}
                        </span>

                        <button
                          type="button"
                          onClick={() => copyCell(displayStr, cellId)}
                          className="opacity-0 group-hover/cell:opacity-100 p-0.5 rounded text-muted-foreground hover:text-foreground shrink-0"
                          title="Copy cell value"
                        >
                          {isCopied ? (
                            <Check className="size-3 text-emerald-500" />
                          ) : (
                            <Copy className="size-3" />
                          )}
                        </button>
                      </div>
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
