"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Check,
  Flame,
  LayoutGrid,
  Paintbrush,
  Palette,
  Sparkles,
} from "lucide-react"
import {
  CHAT_WALLPAPERS,
  ChatWallpaper,
  CHAT_WALLPAPER_STORAGE_KEY,
} from "./chat-wallpapers"
import { cn } from "@/lib/utils"

interface WallpaperPickerDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentWallpaper: ChatWallpaper
  onSelectWallpaper: (wallpaper: ChatWallpaper) => void
}

export function WallpaperPickerDialog({
  open,
  onOpenChange,
  currentWallpaper,
  onSelectWallpaper,
}: WallpaperPickerDialogProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string>("All")

  const categories = React.useMemo(() => {
    const list = ["All", "Classic", "Fiery", "Cyber", "Nature", "Space", "Minimal", "Light"]
    return list
  }, [])

  const filteredWallpapers = React.useMemo(() => {
    if (selectedCategory === "All") return CHAT_WALLPAPERS
    return CHAT_WALLPAPERS.filter((w) => w.category === selectedCategory)
  }, [selectedCategory])

  const handleSelect = (wallpaper: ChatWallpaper) => {
    onSelectWallpaper(wallpaper)
    try {
      localStorage.setItem(CHAT_WALLPAPER_STORAGE_KEY, wallpaper.id)
    } catch {}
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white shadow-xs">
              <Palette className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold">
                Chat Wallpapers & Background Themes
              </DialogTitle>
              <DialogDescription className="text-xs">
                Personalize your Telegram-style chat canvas with different feels, colors, and textures.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-b border-border/60 pb-3">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={cn(
                "cursor-pointer rounded-full px-3 py-1 text-xs font-medium transition-all border",
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground border-primary shadow-2xs font-semibold"
                  : "bg-muted/40 border-border text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Wallpaper Grid Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          {filteredWallpapers.map((w) => {
            const isSelected = currentWallpaper.id === w.id
            return (
              <button
                key={w.id}
                type="button"
                onClick={() => handleSelect(w)}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-2xl border text-left transition-all cursor-pointer hover:scale-[1.02] shadow-2xs",
                  isSelected
                    ? "border-primary ring-2 ring-primary/80 shadow-md"
                    : "border-border hover:border-border/80"
                )}
              >
                {/* Visual Thumbnail */}
                <div
                  className="relative h-24 w-full overflow-hidden p-2 flex flex-col justify-between"
                  style={{ background: w.previewGradient }}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-2 right-2 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-xs">
                      <Check className="size-3 stroke-[3]" />
                    </div>
                  )}

                  {/* Dummy Chat Bubbles Mini Preview */}
                  <div className="space-y-1 opacity-80 pointer-events-none">
                    <div className="h-2.5 w-14 rounded-full bg-sky-500/80 shadow-2xs" />
                    <div className="h-2.5 w-18 ml-auto rounded-full bg-white/30 backdrop-blur-xs shadow-2xs" />
                  </div>

                  <span
                    className="inline-block text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold self-start backdrop-blur-md shadow-2xs text-white"
                    style={{ backgroundColor: `${w.accentColor}cc` }}
                  >
                    {w.category}
                  </span>
                </div>

                {/* Footer Info */}
                <div className="p-2.5 bg-card/95 border-t border-border/40">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-foreground truncate">
                      {w.name}
                    </span>
                    <span
                      className="size-2 rounded-full shrink-0"
                      style={{ backgroundColor: w.accentColor }}
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground truncate block">
                    {w.feel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-border/60 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5 text-[11px]">
            <Sparkles className="size-3 text-amber-500" />
            <span>Saved to your personal device profile</span>
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer text-xs"
          >
            Done
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
