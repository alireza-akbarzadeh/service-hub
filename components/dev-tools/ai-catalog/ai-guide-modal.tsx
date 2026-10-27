"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MarkdownView } from "@/components/ui/markdown-view"
import type { AiToolItem } from "./ai-tools-data"
import {
  ArrowUpRight,
  Bot,
  BookOpen,
  Edit2,
  ExternalLink,
  Terminal,
} from "lucide-react"

interface AiGuideModalProps {
  tool: AiToolItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (tool: AiToolItem) => void
}

export function AiGuideModal({
  tool,
  open,
  onOpenChange,
  onEdit,
}: AiGuideModalProps) {
  if (!tool) return null

  const fallbackMarkdown = `# 🛠️ ${tool.name} Setup Guide

Welcome to the setup instructions for **${tool.name}** (${tool.tagline}).

### 1. Official Documentation & Download
Visit the official website: [${tool.url}](${tool.url})

### 2. Workflow Pro Tips
${tool.workflowTips || "Integrate this tool into your daily developer workflow to eliminate boilerplate and speed up shipping."}

${tool.quickCommand ? `### 3. Quick Terminal Command\n\`\`\`bash\n${tool.quickCommand}\n\`\`\`` : ""}

### 4. Best Use Cases
${tool.bestFor.map((b) => `- **${b}**`).join("\n")}
`

  const markdownContent = tool.setupInstructions || fallbackMarkdown

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-4xl max-h-[85vh] overflow-y-auto border-border/80 bg-card/95 p-5 shadow-2xl backdrop-blur-xl sm:p-6">
        <DialogHeader className="border-b border-border/60 pb-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                <BookOpen className="size-5" />
              </div>
              <div>
                <DialogTitle className="flex items-center gap-2 text-base font-bold">
                  {tool.name} Setup Instructions
                  <Badge
                    variant="outline"
                    className="border-primary/30 font-mono text-[10px] text-primary"
                  >
                    .md format
                  </Badge>
                </DialogTitle>
                <DialogDescription className="max-w-sm truncate text-xs text-muted-foreground">
                  {tool.tagline}
                </DialogDescription>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onEdit && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onOpenChange(false)
                    onEdit(tool)
                  }}
                  className="h-7 cursor-pointer gap-1 px-2.5 text-xs"
                >
                  <Edit2 className="size-3" />
                  <span>Edit Guide</span>
                </Button>
              )}

              <a
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex h-7 items-center gap-1 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                <span>Visit Site</span>
                <ArrowUpRight className="size-3" />
              </a>
            </div>
          </div>
        </DialogHeader>

        {/* Rendered Markdown Instructions */}
        <div className="py-2">
          <MarkdownView content={markdownContent} />
        </div>
      </DialogContent>
    </Dialog>
  )
}
