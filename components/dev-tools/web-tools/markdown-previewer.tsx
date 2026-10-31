"use client"

import * as React from "react"
import {
  FileText,
  Copy,
  Check,
  Eye,
  Code,
  Heading1,
  Heading2,
  Bold,
  Italic,
  List,
  ListOrdered,
  CheckSquare,
  Table as TableIcon,
  Quote,
  Terminal,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

const SAMPLE_MARKDOWN = `# Microservice Technical Specification

> **Service:** \`auth-worker-v2\`  
> **Owner:** Platform Infrastructure Squad  
> **Status:** Production Operational

## Architectural Overview
This service handles distributed session validation, OAuth2 JWT token rotations, and rate limiting.

### Quick Endpoints Matrix
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :---: |
| \`POST\` | \`/v1/auth/token\` | Issue new access token | No |
| \`GET\` | \`/v1/auth/verify\` | Validate Bearer token claims | Yes |
| \`POST\` | \`/v1/auth/revoke\` | Invalidate active user session | Yes |

### Core Checklist
- [x] Integrate Redis cluster failover
- [x] Configure automated health probes
- [ ] Add OpenTelemetry distributed tracing spans
- [ ] Implement rate-limiting sliding window

\`\`\`typescript
interface TokenClaims {
  sub: string
  roles: string[]
  iat: number
  exp: number
}
\`\`\`
`

export function MarkdownPreviewer() {
  const [markdown, setMarkdown] = React.useState<string>(SAMPLE_MARKDOWN)
  const [copiedKey, setCopiedKey] = React.useState<string | null>(null)
  const [viewMode, setViewMode] = React.useState<"split" | "edit" | "preview">("split")

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  // Quick stats
  const stats = React.useMemo(() => {
    const chars = markdown.length
    const words = markdown.trim() ? markdown.trim().split(/\s+/).length : 0
    const lines = markdown.split("\n").length
    const readingTimeMin = Math.ceil(words / 200)
    return { chars, words, lines, readingTimeMin }
  }, [markdown])

  // Simple HTML renderer for preview
  const renderedHtml = React.useMemo(() => {
    let html = markdown
      // Escape HTML entities to prevent injection
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")

    // Code blocks ```lang ... ```
    html = html.replace(/```([a-z0-9_-]*)\n([\s\S]*?)```/gi, (_, lang, code) => {
      return `<pre class="my-3 rounded-lg bg-muted/80 p-3 font-mono text-xs overflow-x-auto border border-border"><code>${code.trim()}</code></pre>`
    })

    // Inline code `code`
    html = html.replace(/`([^`]+)`/g, '<code class="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-primary">$1</code>')

    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3 class="text-sm font-bold text-foreground mt-4 mb-2">$1</h3>')
    html = html.replace(/^## (.*$)/gim, '<h2 class="text-base font-bold text-foreground mt-5 mb-2.5 border-b border-border/60 pb-1">$1</h2>')
    html = html.replace(/^# (.*$)/gim, '<h1 class="text-lg font-extrabold text-foreground mt-2 mb-3">$1</h1>')

    // Blockquote
    html = html.replace(/^\> (.*$)/gim, '<blockquote class="border-l-2 border-primary/60 pl-3 my-2 text-xs italic text-muted-foreground">$1</blockquote>')

    // Task list items
    html = html.replace(/^- \[x\] (.*$)/gim, '<div class="flex items-center gap-2 my-1 text-xs text-foreground"><span class="size-3.5 flex items-center justify-center rounded bg-emerald-500/20 text-emerald-500 text-[10px] font-bold">✓</span><span class="line-through opacity-75">$1</span></div>')
    html = html.replace(/^- \[ \] (.*$)/gim, '<div class="flex items-center gap-2 my-1 text-xs text-foreground"><span class="size-3.5 flex items-center justify-center rounded border border-border text-[10px]"></span><span>$1</span></div>')

    // Regular list items
    html = html.replace(/^- (.*$)/gim, '<li class="ml-4 list-disc text-xs text-foreground my-0.5">$1</li>')

    // Bold & Italic
    html = html.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    html = html.replace(/\*([^*]+)\*/g, '<em class="italic">$1</em>')

    // Paragraph line breaks
    html = html.replace(/\n\n/g, '<div class="my-2"></div>')

    return html
  }, [markdown])

  const insertText = (before: string, after: string = "") => {
    setMarkdown((prev) => prev + `\n${before}${after}`)
  }

  return (
    <div className="space-y-4">
      {/* Top Controls & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border bg-card p-4 shadow-2xs">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          <h3 className="text-sm font-bold">Live Markdown Editor & GFM Previewer</h3>
          <Badge variant="outline" className="text-[10px] font-mono">
            GitHub Flavored
          </Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
            <button
              type="button"
              onClick={() => setViewMode("edit")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "edit" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Editor
            </button>
            <button
              type="button"
              onClick={() => setViewMode("split")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "split" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Split View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("preview")}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                viewMode === "preview" ? "bg-background text-foreground shadow-2xs" : "text-muted-foreground"
              }`}
            >
              Preview
            </button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => copyToClipboard(markdown, "md")}
            className="h-8 text-xs gap-1 cursor-pointer"
          >
            {copiedKey === "md" ? <Check className="size-3 text-emerald-500" /> : <Copy className="size-3" />}
            <span>Copy Markdown</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => copyToClipboard(renderedHtml, "html")}
            className="h-8 text-xs gap-1 cursor-pointer"
          >
            {copiedKey === "html" ? <Check className="size-3" /> : <Code className="size-3" />}
            <span>Copy HTML</span>
          </Button>
        </div>
      </div>

      {/* Quick Insert Toolbar */}
      <div className="flex flex-wrap items-center gap-1 rounded-lg border border-border bg-muted/40 p-1.5 text-xs">
        <button
          type="button"
          onClick={() => insertText("# Heading 1")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Heading 1"
        >
          <Heading1 className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertText("## Heading 2")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Heading 2"
        >
          <Heading2 className="size-3.5" />
        </button>
        <div className="h-4 w-px bg-border mx-1" />
        <button
          type="button"
          onClick={() => insertText("**bold text**")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Bold"
        >
          <Bold className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertText("*italic text*")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Italic"
        >
          <Italic className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertText("> Blockquote text")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Blockquote"
        >
          <Quote className="size-3.5" />
        </button>
        <div className="h-4 w-px bg-border mx-1" />
        <button
          type="button"
          onClick={() => insertText("- [ ] Task item")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Task List"
        >
          <CheckSquare className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() =>
            insertText(
              "| Column 1 | Column 2 |\n| :--- | :--- |\n| Value 1 | Value 2 |"
            )
          }
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Table"
        >
          <TableIcon className="size-3.5" />
        </button>
        <button
          type="button"
          onClick={() => insertText("```typescript\nconst greeting = 'Hello';\n```")}
          className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
          title="Code Block"
        >
          <Terminal className="size-3.5" />
        </button>

        <div className="ml-auto flex items-center gap-3 text-[11px] font-mono text-muted-foreground pr-2">
          <span>{stats.words} words</span>
          <span>•</span>
          <span>{stats.chars} chars</span>
          <span>•</span>
          <span>~{stats.readingTimeMin} min read</span>
        </div>
      </div>

      {/* Editor & Preview Split Panes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {(viewMode === "split" || viewMode === "edit") && (
          <div className={`space-y-1.5 ${viewMode === "edit" ? "lg:col-span-2" : ""}`}>
            <textarea
              value={markdown}
              onChange={(e) => setMarkdown(e.target.value)}
              className="w-full h-[520px] rounded-xl border border-border bg-card p-4 font-mono text-xs leading-relaxed text-foreground resize-none focus:outline-none focus:ring-1 focus:ring-primary shadow-2xs"
              placeholder="Type your markdown here..."
            />
          </div>
        )}

        {(viewMode === "split" || viewMode === "preview") && (
          <div className={`space-y-1.5 ${viewMode === "preview" ? "lg:col-span-2" : ""}`}>
            <div
              className="w-full h-[520px] overflow-y-auto rounded-xl border border-border bg-card/60 p-5 text-xs text-foreground shadow-2xs"
              dangerouslySetInnerHTML={{ __html: renderedHtml }}
            />
          </div>
        )}
      </div>
    </div>
  )
}
