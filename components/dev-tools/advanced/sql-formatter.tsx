"use client"

import * as React from "react"
import {
  Database,
  Copy,
  Check,
  Minimize2,
  Maximize2,
  Sparkles,
  FileCode,
  Trash2,
  Play,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

const SAMPLE_SQL = `with active_users as (
select id, email, created_at, role from users where status = 'active' and is_verified = true
),
recent_orders as (
select user_id, sum(total_amount) as total_spent, count(*) as order_count 
from orders where order_date >= current_date - interval '30 days' group by user_id
)
select u.id, u.email, u.role, coalesce(o.total_spent, 0) as total_spent, coalesce(o.order_count, 0) as order_count
from active_users u left join recent_orders o on u.id = o.user_id
where coalesce(o.total_spent, 0) > 100 order by total_spent desc limit 50;`

// List of major SQL keywords to uppercase
const SQL_KEYWORDS = [
  "SELECT",
  "FROM",
  "WHERE",
  "LEFT JOIN",
  "RIGHT JOIN",
  "INNER JOIN",
  "FULL JOIN",
  "CROSS JOIN",
  "JOIN",
  "ON",
  "GROUP BY",
  "ORDER BY",
  "HAVING",
  "LIMIT",
  "OFFSET",
  "UNION ALL",
  "UNION",
  "WITH",
  "AS",
  "INSERT INTO",
  "VALUES",
  "UPDATE",
  "SET",
  "DELETE FROM",
  "AND",
  "OR",
  "NOT",
  "IN",
  "BETWEEN",
  "LIKE",
  "ILIKE",
  "IS NULL",
  "IS NOT NULL",
  "DISTINCT",
  "CASE",
  "WHEN",
  "THEN",
  "ELSE",
  "END",
  "COALESCE",
  "RETURNING",
  "ON CONFLICT",
  "DO NOTHING",
  "DO UPDATE",
  "ASC",
  "DESC",
]

export function SqlFormatter() {
  const [inputSql, setInputSql] = React.useState<string>(SAMPLE_SQL)
  const [indentSpaces, setIndentSpaces] = React.useState<number>(2)
  const [uppercaseKeywords, setUppercaseKeywords] = React.useState<boolean>(true)
  const [copied, setCopied] = React.useState<boolean>(false)

  // Format SQL Query
  const formattedSql = React.useMemo(() => {
    if (!inputSql.trim()) return ""

    let sql = inputSql.trim()

    // 1. Normalize linebreaks and whitespace
    sql = sql.replace(/\s+/g, " ")

    // 2. Keyword Uppercasing
    if (uppercaseKeywords) {
      // Sort keywords longest first so 'LEFT JOIN' matches before 'JOIN'
      const sorted = [...SQL_KEYWORDS].sort((a, b) => b.length - a.length)
      for (const kw of sorted) {
        const regex = new RegExp(`\\b${kw}\\b`, "gi")
        sql = sql.replace(regex, kw)
      }
    }

    // 3. Newline insertions for major clauses
    const majorClauses = [
      "SELECT",
      "FROM",
      "WHERE",
      "LEFT JOIN",
      "RIGHT JOIN",
      "INNER JOIN",
      "FULL JOIN",
      "CROSS JOIN",
      "JOIN",
      "GROUP BY",
      "ORDER BY",
      "HAVING",
      "LIMIT",
      "OFFSET",
      "UNION ALL",
      "UNION",
      "VALUES",
      "SET",
      "RETURNING",
      "ON CONFLICT",
    ]

    for (const clause of majorClauses) {
      const reg = new RegExp(`\\s+(${clause})\\b`, "g")
      sql = sql.replace(reg, `\n$1`)
    }

    // Handle commas in SELECT list (wrap to new line with indent)
    const indent = " ".repeat(indentSpaces)
    const lines = sql.split("\n")
    const formattedLines: string[] = []

    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      // If it starts with major clause, keep it left-aligned or indent sub-parts
      const startsWithMajor = majorClauses.some((c) => line.startsWith(c)) || line.startsWith("WITH")

      if (startsWithMajor) {
        formattedLines.push(line)
      } else {
        formattedLines.push(indent + line)
      }
    }

    return formattedLines.join("\n")
  }, [inputSql, indentSpaces, uppercaseKeywords])

  // Minify SQL (single line without comments)
  const minifiedSql = React.useMemo(() => {
    return inputSql
      .replace(/\/\*[\s\S]*?\*\/|--.*$/gm, "") // remove comments
      .replace(/\s+/g, " ")
      .trim()
  }, [inputSql])

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-border/80 bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-cyan-600 text-white shadow-sm">
            <Database className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                SQL Query Formatter & Minifier
              </h2>
              <Badge
                variant="outline"
                className="border-emerald-500/40 bg-emerald-500/10 text-[10px] font-mono text-emerald-600 dark:text-emerald-400"
              >
                Postgres / MySQL / SQLite
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Beautify, auto-indent, and uppercase complex queries with CTEs, JOINs, and window functions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => handleCopy(minifiedSql)}
            className="text-xs h-8 cursor-pointer"
          >
            <Minimize2 className="size-3.5 mr-1" />
            Copy Minified
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => handleCopy(formattedSql)}
            className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold h-8 cursor-pointer shadow-xs"
          >
            {copied ? (
              <>
                <Check className="size-3.5 mr-1 text-white" />
                Copied Formatted!
              </>
            ) : (
              <>
                <Copy className="size-3.5 mr-1" />
                Copy Formatted SQL
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Formatting Options Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/70 bg-card p-3 text-xs">
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-1.5 cursor-pointer select-none font-semibold text-foreground">
            <input
              type="checkbox"
              checked={uppercaseKeywords}
              onChange={(e) => setUppercaseKeywords(e.target.checked)}
              className="rounded accent-primary"
            />
            <span>Uppercase Keywords (SELECT, WHERE, JOIN...)</span>
          </label>

          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Indent:</span>
            {[2, 4].map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setIndentSpaces(n)}
                className={cn(
                  "px-2 py-0.5 rounded font-mono text-xs cursor-pointer border",
                  indentSpaces === n
                    ? "border-primary bg-primary/10 text-primary font-bold"
                    : "border-border/60 bg-muted/30 text-muted-foreground hover:bg-muted"
                )}
              >
                {n} Spaces
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setInputSql(SAMPLE_SQL)}
            className="text-primary hover:underline cursor-pointer text-[11px]"
          >
            Load Sample Query
          </button>
          <span className="text-border">•</span>
          <button
            type="button"
            onClick={() => setInputSql("")}
            className="text-muted-foreground hover:text-destructive cursor-pointer text-[11px]"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Editor Split: Raw SQL on Left, Formatted on Right */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: Input SQL */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground">Input Raw / Minified SQL</span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {inputSql.length} chars
            </span>
          </div>
          <textarea
            rows={14}
            value={inputSql}
            onChange={(e) => setInputSql(e.target.value)}
            placeholder="Paste messy or single-line SQL query here..."
            className="w-full rounded-xl border border-border/80 bg-background/80 p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
          />
        </div>

        {/* Right: Formatted SQL Output */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-foreground flex items-center gap-1.5">
              <Sparkles className="size-3.5 text-emerald-500" />
              Beautified SQL Result
            </span>
            <span className="font-mono text-[10px] text-muted-foreground">
              {formattedSql.split("\n").length} lines
            </span>
          </div>
          <div className="relative rounded-xl border border-border/80 bg-muted/20 p-3 min-h-[290px] max-h-[350px] overflow-auto">
            <pre className="font-mono text-xs text-foreground whitespace-pre leading-relaxed">
              {formattedSql || "-- Formatted query will appear here"}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
