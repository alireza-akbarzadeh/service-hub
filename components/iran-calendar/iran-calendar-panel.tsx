"use client"

import * as React from "react"
import { IranClockCalendar } from "./iran-clock-calendar"
import { FrontendMeetingsPanel } from "./frontend-meetings-panel"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Calendar, Clock, PanelRightClose, Radio, Sparkles } from "lucide-react"

interface IranCalendarPanelProps {
  className?: string
  onClose?: () => void
  isCollapsible?: boolean
}

export function IranCalendarPanel({
  className,
  onClose,
  isCollapsible = false,
}: IranCalendarPanelProps) {
  return (
    <aside
      className={cn(
        "flex flex-col border-l border-border bg-card/60 backdrop-blur-md",
        className
      )}
    >
      {/* Panel Top Header */}
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-4">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Clock className="size-4 text-amber-500" />
          </div>
          <div>
            <h2 className="text-xs font-bold tracking-tight text-foreground">
              Iran Time & Frontend Sync
            </h2>
            <p className="text-[10px] text-muted-foreground">
              Jalali Calendar & Meeting Push
            </p>
          </div>
        </div>

        {isCollapsible && onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="size-7 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Collapse Right Panel"
          >
            <PanelRightClose className="size-4" />
          </Button>
        )}
      </div>

      {/* Panel Scrollable Body */}
      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        {/* Top Half: Exact Iranian Time, Date, On/Off Day & Calendar */}
        <section aria-label="Iranian Date, Time & Calendar">
          <IranClockCalendar />
        </section>

        <Separator className="my-2 opacity-60" />

        {/* Bottom Half: Frontend Meeting & Web Push Notifications */}
        <section aria-label="Frontend Meeting & Notifications">
          <FrontendMeetingsPanel />
        </section>
      </div>
    </aside>
  )
}
