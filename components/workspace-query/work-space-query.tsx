"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ExternalLink,
  Maximize2,
  Minimize2,
  RefreshCw,
  Terminal,
  Layers,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export default function WorkSpaceQueryDomain() {
  const iframeRef = React.useRef<HTMLIFrameElement>(null)
  const [isFullscreen, setIsFullscreen] = React.useState(false)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const handleRefresh = () => {
    setIsRefreshing(true)
    if (iframeRef.current) {
      iframeRef.current.src = "/devops-explorer.html"
    }
    setTimeout(() => setIsRefreshing(false), 600)
  }

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev)
  }

  return (
    <div
      className={`flex flex-col bg-background transition-all duration-200 ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen w-screen"
          : "min-h-[calc(100vh-3.5rem)] w-full"
      }`}
    >
      {/* Top Control Bar */}
      <div className="flex h-13 shrink-0 items-center justify-between border-b border-border bg-card/80 px-4 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
            >
              <ArrowLeft className="size-3.5" />
              <span>Back to Catalog</span>
            </Button>
          </Link>

          <div className="h-4 w-px bg-border hidden sm:block" />

          <div className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-md bg-blue-600 text-white shadow-xs">
              <Terminal className="size-3.5" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold leading-tight tracking-tight">
                Azure DevOps Explorer
              </span>
              <span className="text-[10px] text-muted-foreground hidden md:inline">
                WIQL Queries · Delivery Reports · REST Resource Inspection
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 ml-2">
            <Badge
              variant="outline"
              className="gap-1 border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono text-[10px]"
            >
              <span className="size-1.5 rounded-full bg-blue-500 animate-pulse" />
              HIT / Hastim
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] text-muted-foreground font-mono"
            >
              API 7.0
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="h-8 gap-1.5 px-2.5 text-xs cursor-pointer"
            title="Reload Explorer Frame"
          >
            <RefreshCw
              className={`size-3 text-muted-foreground ${
                isRefreshing ? "animate-spin" : ""
              }`}
            />
            <span className="hidden sm:inline">Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={toggleFullscreen}
            className="h-8 gap-1.5 px-2.5 text-xs cursor-pointer"
            title={isFullscreen ? "Exit Fullscreen" : "Maximize Fullscreen"}
          >
            {isFullscreen ? (
              <>
                <Minimize2 className="size-3 text-muted-foreground" />
                <span className="hidden sm:inline">Exit Fullscreen</span>
              </>
            ) : (
              <>
                <Maximize2 className="size-3 text-muted-foreground" />
                <span className="hidden sm:inline">Fullscreen</span>
              </>
            )}
          </Button>

          <a
            href="/devops-explorer.html"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="default"
              size="sm"
              className="h-8 gap-1.5 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
              title="Open Standalone in New Tab"
            >
              <ExternalLink className="size-3" />
              <span className="hidden sm:inline">Open in Tab</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Embedded DevOps Explorer Frame */}
      <div className="flex-1 w-full bg-slate-50 dark:bg-slate-950">
        <iframe
          ref={iframeRef}
          src="/devops-explorer.html"
          title="Azure DevOps Explorer"
          className="h-full w-full min-h-[calc(100vh-6.75rem)] border-0"
          allow="clipboard-read; clipboard-write; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
        />
      </div>
    </div>
  )
}
