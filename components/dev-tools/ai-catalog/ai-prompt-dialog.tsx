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
import type { PromptTemplate } from "./ai-tools-data"
import { MessageSquareCode, Sparkles } from "lucide-react"

interface AiPromptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prompt?: PromptTemplate | null
  onSave: (promptData: Partial<PromptTemplate>) => Promise<boolean>
}

export function AiPromptDialog({
  open,
  onOpenChange,
  prompt,
  onSave,
}: AiPromptDialogProps) {
  const isEditing = !!prompt

  const [title, setTitle] = React.useState("")
  const [category, setCategory] = React.useState("Full-Stack")
  const [bestModel, setBestModel] = React.useState("Claude 3.7 Sonnet / Cursor")
  const [tagsStr, setTagsStr] = React.useState("")
  const [promptContent, setPromptContent] = React.useState("")
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  React.useEffect(() => {
    if (open) {
      if (prompt) {
        setTitle(prompt.title || "")
        setCategory(prompt.category || "Full-Stack")
        setBestModel(prompt.bestModel || "Claude 3.7 Sonnet / Cursor")
        setTagsStr(prompt.tags?.join(", ") || "")
        setPromptContent(prompt.prompt || "")
      } else {
        setTitle("")
        setCategory("Full-Stack")
        setBestModel("Claude 3.7 Sonnet / Cursor")
        setTagsStr("Next.js, TypeScript, PostgreSQL")
        setPromptContent("")
      }
    }
  }, [open, prompt])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !promptContent.trim()) return

    setIsSubmitting(true)
    const tags = tagsStr
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)

    const payload: Partial<PromptTemplate> = {
      id: prompt?.id,
      title: title.trim(),
      category: category.trim(),
      bestModel: bestModel.trim(),
      tags,
      prompt: promptContent.trim(),
    }

    const ok = await onSave(payload)
    setIsSubmitting(false)
    if (ok) {
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl p-5 sm:p-6">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <MessageSquareCode className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                {isEditing ? `Edit Prompt: ${prompt?.title}` : "Add Developer Prompt Template"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Save battle-tested AI prompts for full-stack architecture, database queries, and code reviews.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 py-1 text-xs">
          <div className="space-y-1">
            <label className="font-semibold text-foreground">Prompt Title *</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Next.js Server Action Refactoring with Zod"
              required
              className="text-xs bg-muted/40"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="font-semibold text-foreground">Category</label>
              <Input
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Architecture, Frontend, Database, DevOps"
                className="text-xs bg-muted/40"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-foreground">Recommended Model</label>
              <Input
                value={bestModel}
                onChange={(e) => setBestModel(e.target.value)}
                placeholder="Claude 3.7 Sonnet, DeepSeek R1, GPT-4o"
                className="text-xs bg-muted/40"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Tags (comma-separated)</label>
            <Input
              value={tagsStr}
              onChange={(e) => setTagsStr(e.target.value)}
              placeholder="Next.js, TypeScript, Zod, Drizzle"
              className="text-xs bg-muted/40 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="font-semibold text-foreground">Prompt Content *</label>
            <textarea
              rows={8}
              value={promptContent}
              onChange={(e) => setPromptContent(e.target.value)}
              placeholder="Write or paste your full prompt template here..."
              required
              className="w-full rounded-md border border-input bg-muted/40 p-2.5 font-mono text-xs leading-relaxed"
            />
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
              disabled={isSubmitting || !title.trim() || !promptContent.trim()}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-xs"
            >
              {isSubmitting ? "Saving..." : isEditing ? "Save Changes" : "Create Prompt"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
