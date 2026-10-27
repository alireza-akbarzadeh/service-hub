"use client"

import * as React from "react"
import {
  type AnonUser,
  generateRandomAnonUser,
  AVATAR_ICONS,
  GRADIENT_COLORS,
} from "@/lib/chat-data"
import { chatAudio } from "@/lib/chat-audio"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Dices, Edit3, Shield, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnonIdentityCardProps {
  user: AnonUser
  onUpdateUser: (user: AnonUser) => void
  soundEnabled: boolean
}

export function AnonIdentityCard({
  user,
  onUpdateUser,
  soundEnabled,
}: AnonIdentityCardProps) {
  const [isEditOpen, setIsEditOpen] = React.useState(false)
  const [tempName, setTempName] = React.useState(user.name)
  const [tempAvatar, setTempAvatar] = React.useState(user.avatar)
  const [tempColor, setTempColor] = React.useState(user.color)
  const [isRerolling, setIsRerolling] = React.useState(false)

  const handleReroll = () => {
    setIsRerolling(true)
    if (soundEnabled) {
      chatAudio.playDiceRoll()
    }
    const fresh = generateRandomAnonUser()
    onUpdateUser({
      ...user,
      name: fresh.name,
      avatar: fresh.avatar,
      color: fresh.color,
    })
    setTimeout(() => setIsRerolling(false), 350)
  }

  const handleOpenEdit = () => {
    setTempName(user.name)
    setTempAvatar(user.avatar)
    setTempColor(user.color)
    setIsEditOpen(true)
  }

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!tempName.trim()) return

    onUpdateUser({
      ...user,
      name: tempName.trim(),
      avatar: tempAvatar,
      color: tempColor,
    })
    setIsEditOpen(false)
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card/70 p-3 shadow-xs backdrop-blur-xs transition-all">
        <div className="flex items-center gap-3">
          {/* Avatar with gradient ring */}
          <div
            className={cn(
              "flex size-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-xl shadow-xs transition-transform duration-300",
              user.color || "from-violet-500 to-purple-600",
              isRerolling && "rotate-180 scale-110"
            )}
          >
            <span>{user.avatar}</span>
          </div>

          {/* User info */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <span className="truncate text-xs font-bold text-foreground">
                {user.name}
              </span>
              <span title="Anonymous identity verified">
                <Shield className="size-3 text-emerald-500 shrink-0" />
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Incognito squad</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleReroll}
              className="size-7 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Roll new random identity (Avatar & Name)"
            >
              <Dices
                className={cn(
                  "size-3.5 transition-transform",
                  isRerolling && "animate-spin text-primary"
                )}
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleOpenEdit}
              className="size-7 cursor-pointer text-muted-foreground hover:text-foreground hover:bg-muted"
              title="Customize identity"
            >
              <Edit3 className="size-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="size-4 text-primary" />
              <span>Customize Anonymous Persona</span>
            </DialogTitle>
            <DialogDescription>
              Choose your display name, avatar icon, and avatar color theme.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveEdit} className="space-y-4 py-2">
            <div>
              <label className="text-xs font-semibold text-foreground">Nickname</label>
              <Input
                value={tempName}
                onChange={(e) => setTempName(e.target.value)}
                maxLength={32}
                placeholder="e.g. Cyber Otter"
                className="mt-1"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Select Avatar Icon</label>
              <div className="mt-1.5 grid grid-cols-6 gap-1.5 max-h-36 overflow-y-auto p-1 rounded-lg border border-border bg-muted/30">
                {AVATAR_ICONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setTempAvatar(icon)}
                    className={cn(
                      "flex size-9 cursor-pointer items-center justify-center rounded-lg text-lg transition-all hover:bg-muted",
                      tempAvatar === icon
                        ? "bg-primary/20 ring-2 ring-primary scale-105"
                        : "opacity-80 hover:opacity-100"
                    )}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground">Gradient Aura</label>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {GRADIENT_COLORS.map((gradient) => (
                  <button
                    key={gradient}
                    type="button"
                    onClick={() => setTempColor(gradient)}
                    className={cn(
                      "size-7 cursor-pointer rounded-full bg-gradient-to-br transition-all",
                      gradient,
                      tempColor === gradient
                        ? "ring-2 ring-offset-2 ring-foreground scale-110"
                        : "opacity-70 hover:opacity-100"
                    )}
                  />
                ))}
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" size="sm">
                Save Persona
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
