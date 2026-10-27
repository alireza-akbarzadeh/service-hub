"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Crosshair, Gamepad2, Radio, Save, Send, Sparkles, Terminal } from "lucide-react"
import type { Cs2ServerConfig } from "@/lib/cs2-match"

interface Cs2EditDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  config: Cs2ServerConfig
  onSave: (newValues: Partial<Cs2ServerConfig>) => Promise<boolean>
}

export function Cs2EditDialog({
  open,
  onOpenChange,
  config,
  onSave,
}: Cs2EditDialogProps) {
  const [address, setAddress] = React.useState(config.address || "172.24.129.12")
  const [targetTime, setTargetTime] = React.useState(config.targetTime || "17:10")
  const [title, setTitle] = React.useState(config.title || "Daily CS2 Squad Match")
  const [notes, setNotes] = React.useState(config.notes || "Dust II / Mirage")
  const [isSaving, setIsSaving] = React.useState(false)

  // Sync state when config updates
  React.useEffect(() => {
    if (open) {
      setAddress(config.address || "172.24.129.12")
      setTargetTime(config.targetTime || "17:10")
      setTitle(config.title || "Daily CS2 Squad Match")
      setNotes(config.notes || "Dust II / Mirage")
    }
  }, [open, config])

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!address.trim()) return

    setIsSaving(true)
    const success = await onSave({
      address: address.trim(),
      targetTime: targetTime.trim(),
      title: title.trim(),
      notes: notes.trim(),
    })
    setIsSaving(false)

    if (success) {
      onOpenChange(false)
    }
  }

  const applyPreset = (ip: string) => {
    setAddress(ip)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md sm:max-w-lg border-border/80 bg-card/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="space-y-1.5">
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 ring-1 ring-amber-500/30">
              <Gamepad2 className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold flex items-center gap-2">
                Configure CS2 Match Server
                <Badge
                  variant="outline"
                  className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 text-[10px]"
                >
                  Live Sync
                </Badge>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Update the CS2 server IP. Changes will push an instant alert to all coworkers and trigger sound notifications.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSave} className="space-y-4 py-2">
          {/* Server IP Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Crosshair className="size-3.5 text-amber-500" />
                CS2 Server Address (IP or IP:Port)
              </span>
              <span className="text-[11px] font-normal text-muted-foreground">
                Default: 172.24.129.12
              </span>
            </label>
            <div className="relative">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="172.24.129.12 or 172.24.129.12:27015"
                className="font-mono text-sm bg-background/60 pl-8 focus-visible:ring-amber-500"
                required
              />
              <Radio className="size-4 text-amber-500 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Quick Preset Buttons */}
            <div className="flex items-center gap-1.5 pt-1">
              <span className="text-[11px] text-muted-foreground">Presets:</span>
              <button
                type="button"
                onClick={() => applyPreset("172.24.129.12")}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted/60 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 border border-border/60 transition-colors"
              >
                172.24.129.12
              </button>
              <button
                type="button"
                onClick={() => applyPreset("172.24.129.12:27015")}
                className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-muted/60 hover:bg-amber-500/20 hover:text-amber-600 dark:hover:text-amber-400 border border-border/60 transition-colors"
              >
                :27015
              </button>
            </div>
          </div>

          {/* Console Command Preview */}
          <div className="rounded-xl border border-border/60 bg-muted/40 p-2.5 text-xs">
            <div className="flex items-center justify-between text-muted-foreground text-[11px] mb-1">
              <span className="flex items-center gap-1 font-mono">
                <Terminal className="size-3 text-sky-500" />
                In-Game CS2 Console Command (~):
              </span>
            </div>
            <code className="font-mono text-xs text-amber-600 dark:text-amber-400 font-semibold select-all">
              connect {address || "172.24.129.12"}
            </code>
          </div>

          {/* Target Match Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Match Time (Tehran Time)
              </label>
              <Input
                type="time"
                value={targetTime}
                onChange={(e) => setTargetTime(e.target.value)}
                className="font-mono text-sm bg-background/60 focus-visible:ring-amber-500"
              />
              <p className="text-[10px] text-muted-foreground">
                Target: 17:10 (5:10 PM) daily squad match
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground">
                Map / Match Notes
              </label>
              <Input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Dust II, Mirage, Casual 5v5"
                className="text-xs bg-background/60 focus-visible:ring-amber-500"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSaving || !address.trim()}
              className="text-xs gap-1.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 shadow-sm"
            >
              {isSaving ? (
                <>Updating...</>
              ) : (
                <>
                  <Send className="size-3.5" />
                  Save & Notify Everyone
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
