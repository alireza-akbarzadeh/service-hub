"use client"

import * as React from "react"
import { ArrowLeftRight, Copy, Check, Trash2, Binary } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type ToolMode = "base64" | "url" | "html"

export function Base64Tool() {
  const [mode, setMode] = React.useState<ToolMode>("base64")
  const [operation, setOperation] = React.useState<"encode" | "decode">("encode")
  const [input, setInput] = React.useState<string>("Hello Service Hub Developer! 🚀")
  const [copied, setCopied] = React.useState(false)

  const output = React.useMemo(() => {
    if (!input) return ""
    try {
      if (mode === "base64") {
        if (operation === "encode") {
          return btoa(
            encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (_, p1) =>
              String.fromCharCode(parseInt(p1, 16))
            )
          )
        } else {
          return decodeURIComponent(
            atob(input)
              .split("")
              .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
              .join("")
          )
        }
      } else if (mode === "url") {
        if (operation === "encode") {
          return encodeURIComponent(input)
        } else {
          return decodeURIComponent(input)
        }
      } else if (mode === "html") {
        if (operation === "encode") {
          return input.replace(
            /[&<>"']/g,
            (m) =>
              ({
                "&": "&amp;",
                "<": "&lt;",
                ">": "&gt;",
                '"': "&quot;",
                "'": "&#39;",
              })[m] || m
          )
        } else {
          const doc = new DOMParser().parseFromString(input, "text/html")
          return doc.documentElement.textContent || ""
        }
      }
      return ""
    } catch (err: any) {
      return `Error: ${err.message || "Failed to process string"}`
    }
  }, [input, mode, operation])

  const handleCopy = () => {
    navigator.clipboard.writeText(output)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleSwap = () => {
    setInput(output)
    setOperation(operation === "encode" ? "decode" : "encode")
  }

  return (
    <div className="space-y-4">
      {/* Mode & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card p-3 shadow-xs">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setMode("base64")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "base64"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            Base64
          </button>
          <button
            type="button"
            onClick={() => setMode("url")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "url"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            URL Encode/Decode
          </button>
          <button
            type="button"
            onClick={() => setMode("html")}
            className={`cursor-pointer rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
              mode === "html"
                ? "bg-primary text-primary-foreground shadow-2xs"
                : "text-muted-foreground hover:bg-muted"
            }`}
          >
            HTML Entities
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setOperation("encode")}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                operation === "encode"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Encode
            </button>
            <button
              type="button"
              onClick={() => setOperation("decode")}
              className={`cursor-pointer rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                operation === "decode"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Decode
            </button>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={handleSwap}
            className="cursor-pointer gap-1.5 text-xs"
            title="Swap input & output"
          >
            <ArrowLeftRight className="size-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </Button>
        </div>
      </div>

      {/* Grid: Input & Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input */}
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden h-[340px]">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-bold text-foreground">
              Input ({operation === "encode" ? "Raw Text" : "Encoded Text"})
            </span>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setInput("")}
              className="size-7 p-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="size-3.5" />
            </Button>
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter string to process..."
            className="flex-1 p-4 font-mono text-xs outline-none resize-none bg-background text-foreground leading-relaxed"
          />
        </div>

        {/* Output */}
        <div className="flex flex-col rounded-2xl border border-border bg-card shadow-xs overflow-hidden h-[340px]">
          <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2.5">
            <span className="text-xs font-bold text-foreground">
              Result ({operation === "encode" ? "Encoded" : "Decoded"})
            </span>
            <Button
              size="xs"
              variant="outline"
              onClick={handleCopy}
              className="gap-1 text-xs"
            >
              {copied ? (
                <Check className="size-3 text-emerald-500" />
              ) : (
                <Copy className="size-3" />
              )}
              <span>{copied ? "Copied" : "Copy"}</span>
            </Button>
          </div>
          <textarea
            readOnly
            value={output}
            placeholder="Result will appear here..."
            className="flex-1 p-4 font-mono text-xs outline-none resize-none bg-muted/20 text-foreground leading-relaxed select-all"
          />
        </div>
      </div>
    </div>
  )
}
