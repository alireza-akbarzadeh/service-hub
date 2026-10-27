"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MarkdownView } from "@/components/ui/markdown-view"
import type { AiToolItem } from "./ai-tools-data"
import { Bot, Code2, Eye, FileEdit, Plus, Sparkles, Wand2 } from "lucide-react"

interface AiToolDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tool?: AiToolItem | null
  onSave: (toolData: Partial<AiToolItem>) => Promise<boolean>
}

export function AiToolDialog({
  open,
  onOpenChange,
  tool,
  onSave,
}: AiToolDialogProps) {
  const isEditing = !!tool

  const [name, setName] = React.useState("")
  const [tagline, setTagline] = React.useState("")
  const [url, setUrl] = React.useState("")
  const [category, setCategory] = React.useState<AiToolItem["category"]>("ide-agents")
  const [pricing, setPricing] = React.useState<AiToolItem["pricing"]>("Freemium")
  const [bestForStr, setBestForStr] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [workflowTips, setWorkflowTips] = React.useState("")
  const [quickCommand, setQuickCommand] = React.useState("")
  const [setupInstructions, setSetupInstructions] = React.useState("")
  const [activeTab, setActiveTab] = React.useState<"edit" | "preview">("edit")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Populate form on open
  React.useEffect(() => {
    if (open) {
      if (tool) {
        setName(tool.name || "")
        setTagline(tool.tagline || "")
        setUrl(tool.url || "")
        setCategory(tool.category || "ide-agents")
        setPricing(tool.pricing || "Freemium")
        setBestForStr(tool.bestFor?.join(", ") || "")
        setDescription(tool.description || "")
        setWorkflowTips(tool.workflowTips || "")
        setQuickCommand(tool.quickCommand || "")
        setSetupInstructions(
          tool.setupInstructions ||
            `# 🚀 ${tool.name} Setup Guide\n\n### 1. Installation\nVisit [${tool.url}](${tool.url})\n\n### 2. Workflow Pro Tips\n${tool.workflowTips || ""}\n`
        )
      } else {
        setName("")
        setTagline("")
        setUrl("")
        setCategory("ide-agents")
        setPricing("Freemium")
        setBestForStr("Full-Stack, Next.js, TypeScript")
        setDescription("")
        setWorkflowTips("")
        setQuickCommand("")
        setSetupInstructions(
          `# 🚀 Setup Instructions\n\n### 1. Installation & Account\nVisit the official website to register.\n\n### 2. Configuration & API Keys\nAdd your credentials to \`.env.local\`:\n\`\`\`bash\nAI_API_KEY=your_key_here\n\`\`\`\n\n### 3. Workflow Pro Tips\n- Use this tool during development for automated code completion and multi-file refactoring.\n`
        )
      }
      setActiveTab("edit")
    }
  }, [open, tool])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !url.trim()) return

    setIsSubmitting(true)
    const bestFor = bestForStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const categoryLabels: Record<string, string> = {
      "ide-agents": "Agentic IDEs & Editors",
      "frontend-ui": "Frontend & Generative UI",
      "backend-devops": "Backend, DB & DevOps",
      "models-apis": "Models & Reasoning",
      "review-testing": "Code Review & Testing",
    }

    const payload: Partial<AiToolItem> = {
      id: tool?.id,
      name: name.trim(),
      tagline: tagline.trim() || `${name} Developer Assistant`,
      url: url.trim(),
      category,
      categoryLabel: categoryLabels[category] || "Custom AI Tool",
      pricing,
      iconBg: tool?.iconBg || "from-blue-600 to-indigo-600",
      bestFor,
      description: description.trim() || tagline.trim(),
      workflowTips: workflowTips.trim(),
      quickCommand: quickCommand.trim() || undefined,
      setupInstructions: setupInstructions.trim(),
    }

    const ok = await onSave(payload)
    setIsSubmitting(false)
    if (ok) {
      onOpenChange(false)
    }
  }

  // Helper insertions for markdown
  const insertMarkdown = (snippet: string) => {
    setSetupInstructions((prev) => prev + "\n" + snippet)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full sm:max-w-2xl max-h-[90vh] overflow-y-auto border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Bot className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? `Edit AI Tool: ${tool?.name}` : "Add New AI Developer Tool"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Register a developer AI tool with setup instructions in Markdown (.md format).
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-1 text-xs">
          {/* Row 1: Name and URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Tool Name *</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Cursor, Bolt.new, Perplexity"
                required
                className="text-xs bg-muted/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Official Website URL *</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://..."
                required
                className="text-xs bg-muted/40 font-mono"
              />
            </div>
          </div>

          {/* Row 2: Tagline */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tagline / Short Summary</label>
            <Input
              value={tagline}
              onChange={(e) => setTagline(e.target.value)}
              placeholder="e.g. The AI-first code editor with agentic multi-file Composer"
              className="text-xs bg-muted/40"
            />
          </div>

          {/* Row 3: Category and Pricing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-muted/40 px-3 text-xs"
              >
                <option value="ide-agents">Agentic IDEs & Editors</option>
                <option value="frontend-ui">Frontend & Generative UI</option>
                <option value="backend-devops">Backend, DB & DevOps</option>
                <option value="models-apis">Foundation Models & Reasoning</option>
                <option value="review-testing">Code Review & Testing</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Pricing Model</label>
              <select
                value={pricing}
                onChange={(e) => setPricing(e.target.value as any)}
                className="w-full h-9 rounded-md border border-input bg-muted/40 px-3 text-xs"
              >
                <option value="Free / Open Source">Free / Open Source</option>
                <option value="Freemium">Freemium</option>
                <option value="Paid">Paid</option>
                <option value="Usage API">Usage API</option>
              </select>
            </div>
          </div>

          {/* Best For Tags & Quick CLI Command */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Tags (comma-separated)</label>
              <Input
                value={bestForStr}
                onChange={(e) => setBestForStr(e.target.value)}
                placeholder="Full-Stack, Next.js, PostgreSQL, TypeScript"
                className="text-xs bg-muted/40 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Quick CLI Command (optional)</label>
              <Input
                value={quickCommand}
                onChange={(e) => setQuickCommand(e.target.value)}
                placeholder="npm i -g @tool or curl -fsSL ..."
                className="text-xs bg-muted/40 font-mono"
              />
            </div>
          </div>

          {/* Workflow Pro Tips */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Full-Stack Workflow Pro Tip</label>
            <Input
              value={workflowTips}
              onChange={(e) => setWorkflowTips(e.target.value)}
              placeholder="e.g. Use Ctrl+I to edit multiple files simultaneously across API and UI."
              className="text-xs bg-muted/40"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Description & Key Features</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Why full-stack developers should use this tool..."
              className="w-full rounded-md border border-input bg-muted/40 p-2 text-xs"
            />
          </div>

          {/* Setup Instructions in Markdown Format (.md) */}
          <div className="space-y-2 rounded-xl border border-border/80 bg-muted/20 p-3">
            <div className="flex items-center justify-between border-b border-border/50 pb-2">
              <div className="flex items-center gap-1.5 font-semibold text-foreground">
                <FileEdit className="size-3.5 text-primary" />
                <span>Setup Instructions (Markdown .md format)</span>
              </div>

              {/* Edit / Preview Tabs */}
              <div className="flex items-center rounded-lg border border-border bg-muted/60 p-0.5">
                <button
                  type="button"
                  onClick={() => setActiveTab("edit")}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold cursor-pointer ${
                    activeTab === "edit"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Edit (.md)
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("preview")}
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold flex items-center gap-1 cursor-pointer ${
                    activeTab === "preview"
                      ? "bg-card text-foreground shadow-2xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <Eye className="size-2.5" />
                  Preview
                </button>
              </div>
            </div>

            {/* Quick markdown helper snippets */}
            {activeTab === "edit" ? (
              <div className="space-y-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] text-muted-foreground">Insert:</span>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("### Section Title")}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 border border-border font-mono cursor-pointer"
                  >
                    ### Heading
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("```bash\n# Terminal command\nnpm install my-tool\n```")}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 border border-border font-mono cursor-pointer"
                  >
                    ``` Code Block
                  </button>
                  <button
                    type="button"
                    onClick={() => insertMarkdown("- Feature bullet point")}
                    className="text-[10px] px-1.5 py-0.5 rounded bg-muted hover:bg-muted/80 border border-border font-mono cursor-pointer"
                  >
                    - Bullet
                  </button>
                </div>

                <textarea
                  rows={7}
                  value={setupInstructions}
                  onChange={(e) => setSetupInstructions(e.target.value)}
                  placeholder="# Tool Setup Guide&#10;&#10;### 1. Installation&#10;...&#10;&#10;### 2. Configuration&#10;..."
                  className="w-full rounded-md border border-input bg-background/80 p-2.5 font-mono text-xs leading-relaxed"
                />
              </div>
            ) : (
              <div className="max-h-60 overflow-y-auto rounded-md border border-border/60 bg-background/90 p-3">
                <MarkdownView content={setupInstructions || "*No setup instructions written yet.*"} />
              </div>
            )}
          </div>

          <DialogFooter className="pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !name.trim() || !url.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create AI Tool"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
