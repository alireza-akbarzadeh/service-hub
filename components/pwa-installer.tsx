"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Download,
  Laptop,
  Check,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react"
import { cn } from "@/lib/utils"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>
}

export function PwaInstaller() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = React.useState(false)
  const [isDismissed, setIsDismissed] = React.useState(false)
  const [showModal, setShowModal] = React.useState(false)

  React.useEffect(() => {
    // 1. Register Service Worker for PWA
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          console.log("Service Hub PWA ServiceWorker registered with scope:", reg.scope)
        })
        .catch((err) => {
          console.warn("PWA ServiceWorker registration failed:", err)
        })
    }

    // 2. Check if already installed
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      setIsInstalled(isStandalone)

      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      }

      window.addEventListener("beforeinstallprompt", handler)

      window.addEventListener("appinstalled", () => {
        setIsInstalled(true)
        setDeferredPrompt(null)
      })

      return () => {
        window.removeEventListener("beforeinstallprompt", handler)
      }
    }
  }, [])

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        setIsInstalled(true)
      }
      setDeferredPrompt(null)
    } else {
      setShowModal(true)
    }
  }

  // If already running inside standalone desktop window, don't show prompt banner
  if (isInstalled || isDismissed) {
    return null
  }

  return (
    <>
      {/* Floating Subtle Windows PWA Install Pill (Bottom Left) */}
      <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-2xl border border-orange-500/30 bg-background/95 p-2 shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-bottom-3 max-w-sm">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 text-lg shadow-inner">
          🔥
        </div>

        <div className="flex flex-col min-w-0 pr-1">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-xs text-foreground truncate">
              Install Service Hub
            </span>
            <Badge
              variant="outline"
              className="border-orange-500/40 bg-orange-500/10 text-orange-600 dark:text-orange-400 font-mono text-[9px] px-1 py-0 h-4"
            >
              Windows App
            </Badge>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">
            Run as a native desktop app with taskbar pinning
          </p>
        </div>

        <div className="flex items-center gap-1">
          <Button
            type="button"
            size="sm"
            onClick={handleInstallClick}
            className="h-7 cursor-pointer gap-1 bg-gradient-to-r from-orange-600 to-amber-600 px-2.5 text-[11px] font-bold text-white shadow-xs hover:from-orange-700 hover:to-amber-700"
          >
            <Download className="size-3" />
            <span>Install</span>
          </Button>

          <button
            type="button"
            onClick={() => setIsDismissed(true)}
            className="flex size-6 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            title="Dismiss install prompt"
          >
            <X className="size-3" />
          </button>
        </div>
      </div>

      {/* Manual Install Instructions Modal if beforeinstallprompt is handled by browser UI */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
          <div className="relative w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-orange-500/10 text-2xl">
                  🔥
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">
                    Install in Windows
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Add Service Hub to your Windows Desktop & Start Menu
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/40 p-4 text-xs">
              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-[11px] text-primary">
                  1
                </span>
                <p>
                  Look at the right side of your browser&apos;s address bar for the{" "}
                  <strong className="text-foreground">Install App</strong> icon (
                  <Laptop className="inline size-3 text-orange-500 mx-0.5" /> or ⊕).
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-[11px] text-primary">
                  2
                </span>
                <p>
                  Click <strong className="text-foreground">Install</strong> when prompted
                  by Microsoft Edge or Google Chrome.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/20 font-bold text-[11px] text-primary">
                  3
                </span>
                <p>
                  Check <strong className="text-foreground">&quot;Pin to taskbar&quot;</strong>{" "}
                  and <strong className="text-foreground">&quot;Pin to Start&quot;</strong> in
                  the Windows dialog to launch anytime!
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowModal(false)}
                className="cursor-pointer text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/**
 * Sidebar button version of PWA install trigger
 */
export function PwaSidebarInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = React.useState<BeforeInstallPromptEvent | null>(null)
  const [isInstalled, setIsInstalled] = React.useState(false)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const isStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as any).standalone === true
      setIsInstalled(isStandalone)

      const handler = (e: Event) => {
        e.preventDefault()
        setDeferredPrompt(e as BeforeInstallPromptEvent)
      }

      window.addEventListener("beforeinstallprompt", handler)
      window.addEventListener("appinstalled", () => setIsInstalled(true))

      return () => {
        window.removeEventListener("beforeinstallprompt", handler)
      }
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt()
      const choice = await deferredPrompt.userChoice
      if (choice.outcome === "accepted") {
        setIsInstalled(true)
      }
    } else {
      alert("To install in Windows, click the App Install icon (⊕) in your browser address bar.")
    }
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1.5 text-xs text-emerald-600 dark:text-emerald-400">
        <Check className="size-3.5" />
        <span className="font-semibold text-[11px]">Desktop App Active</span>
      </div>
    )
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleInstall}
      className="w-full h-8 gap-2 border-orange-500/30 bg-orange-500/5 text-orange-600 hover:bg-orange-500/15 dark:text-orange-400 cursor-pointer text-xs font-semibold shadow-2xs group-data-[collapsible=icon]:justify-center"
      title="Install Service Hub as Windows desktop app"
    >
      <Laptop className="size-3.5 text-orange-500" />
      <span className="group-data-[collapsible=icon]:hidden">Install in Windows</span>
    </Button>
  )
}
