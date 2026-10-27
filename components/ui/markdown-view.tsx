"use client"

import * as React from "react"
import { Check, Copy, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MarkdownViewProps {
  content: string
  className?: string
}

export function MarkdownView({ content, className }: MarkdownViewProps) {
  const [copiedCodeIdx, setCopiedCodeIdx] = React.useState<number | null>(null)

  const handleCopyCode = (text: string, idx: number) => {
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text)
      setCopiedCodeIdx(idx)
      setTimeout(() => setCopiedCodeIdx(null), 1500)
    }
  }

  // Parse markdown lines into structured elements
  const elements = React.useMemo(() => {
    if (!content) return []

    const lines = content.split("\n")
    const result: Array<{
      type: "h1" | "h2" | "h3" | "codeblock" | "bullet" | "blockquote" | "p"
      text: string
      codeLines?: string[]
      lang?: string
    }> = []

    let inCodeBlock = false
    let currentCodeLang = ""
    let currentCodeLines: string[] = []

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      // Code block start/end
      if (line.trim().startsWith("```")) {
        if (!inCodeBlock) {
          inCodeBlock = true
          currentCodeLang = line.trim().replace(/^```/, "").trim() || "text"
          currentCodeLines = []
        } else {
          inCodeBlock = false
          result.push({
            type: "codeblock",
            text: currentCodeLines.join("\n"),
            codeLines: currentCodeLines,
            lang: currentCodeLang,
          })
          currentCodeLines = []
        }
        continue
      }

      if (inCodeBlock) {
        currentCodeLines.push(line)
        continue
      }

      const trimmed = line.trim()

      if (!trimmed) {
        continue
      }

      if (trimmed.startsWith("# ")) {
        result.push({ type: "h1", text: trimmed.slice(2) })
      } else if (trimmed.startsWith("## ")) {
        result.push({ type: "h2", text: trimmed.slice(3) })
      } else if (trimmed.startsWith("### ")) {
        result.push({ type: "h3", text: trimmed.slice(4) })
      } else if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
        result.push({ type: "bullet", text: trimmed.slice(2) })
      } else if (trimmed.startsWith("> ")) {
        result.push({ type: "blockquote", text: trimmed.slice(2) })
      } else {
        result.push({ type: "p", text: line })
      }
    }

    // Handle open codeblock
    if (inCodeBlock && currentCodeLines.length > 0) {
      result.push({
        type: "codeblock",
        text: currentCodeLines.join("\n"),
        codeLines: currentCodeLines,
        lang: currentCodeLang,
      })
    }

    return result
  }, [content])

  // Helper to format inline bold, code, and links
  const renderInlineFormatted = (raw: string) => {
    // Replace markdown links [text](url)
    const parts: React.ReactNode[] = []
    const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g

    let lastIndex = 0
    let match: RegExpExecArray | null

    while ((match = linkRegex.exec(raw)) !== null) {
      if (match.index > lastIndex) {
        parts.push(renderBoldAndCode(raw.slice(lastIndex, match.index)))
      }
      parts.push(
        <a
          key={match.index}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline hover:text-primary/80 inline-flex items-center gap-0.5"
        >
          {match[1]}
          <ExternalLink className="size-2.5 inline" />
        </a>
      )
      lastIndex = match.index + match[0].length
    }

    if (lastIndex < raw.length) {
      parts.push(renderBoldAndCode(raw.slice(lastIndex)))
    }

    return parts.length > 0 ? parts : renderBoldAndCode(raw)
  }

  const renderBoldAndCode = (text: string) => {
    const segments = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    return segments.map((seg, i) => {
      if (seg.startsWith("`") && seg.endsWith("`")) {
        return (
          <code
            key={i}
            className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground font-semibold"
          >
            {seg.slice(1, -1)}
          </code>
        )
      }
      if (seg.startsWith("**") && seg.endsWith("**")) {
        return <strong key={i} className="font-bold text-foreground">{seg.slice(2, -2)}</strong>
      }
      return seg
    })
  }

  let codeBlockCounter = 0

  return (
    <div className={`space-y-3.5 text-xs text-foreground/90 leading-relaxed ${className || ""}`}>
      {elements.map((el, i) => {
        if (el.type === "h1") {
          return (
            <h1 key={i} className="text-base sm:text-lg font-bold text-foreground border-b border-border/60 pb-1.5 mt-2">
              {renderInlineFormatted(el.text)}
            </h1>
          )
        }
        if (el.type === "h2") {
          return (
            <h2 key={i} className="text-sm sm:text-base font-bold text-foreground border-b border-border/40 pb-1 mt-3">
              {renderInlineFormatted(el.text)}
            </h2>
          )
        }
        if (el.type === "h3") {
          return (
            <h3 key={i} className="text-xs sm:text-sm font-semibold text-foreground mt-2 text-primary">
              {renderInlineFormatted(el.text)}
            </h3>
          )
        }
        if (el.type === "codeblock") {
          const idx = codeBlockCounter++
          return (
            <div key={i} className="relative rounded-xl border border-border/80 bg-muted/60 overflow-hidden font-mono text-xs my-2">
              <div className="flex items-center justify-between border-b border-border/50 bg-background/50 px-3 py-1.5 text-[10.5px] text-muted-foreground">
                <span className="font-semibold uppercase tracking-wider">{el.lang || "code"}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleCopyCode(el.text, idx)}
                  className="h-6 px-2 text-[10.5px] gap-1 cursor-pointer hover:text-foreground"
                >
                  {copiedCodeIdx === idx ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>
              <pre className="p-3 overflow-x-auto text-foreground/90 leading-relaxed selection:bg-primary/20">
                <code>{el.text}</code>
              </pre>
            </div>
          )
        }
        if (el.type === "bullet") {
          return (
            <div key={i} className="flex items-start gap-2 pl-2">
              <span className="text-primary font-bold">•</span>
              <div className="flex-1">{renderInlineFormatted(el.text)}</div>
            </div>
          )
        }
        if (el.type === "blockquote") {
          return (
            <blockquote key={i} className="border-l-4 border-primary/40 bg-primary/5 pl-3 py-1.5 rounded-r-lg italic text-muted-foreground">
              {renderInlineFormatted(el.text)}
            </blockquote>
          )
        }
        return <p key={i}>{renderInlineFormatted(el.text)}</p>
      })}
    </div>
  )
}
