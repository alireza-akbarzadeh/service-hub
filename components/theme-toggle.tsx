"use client"

import * as React from "react"
import { useTheme } from "next-themes"
import { Moon, Sun, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-8 w-24 items-center justify-center rounded-lg border border-border bg-card/50" />
    )
  }

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-card/60 p-1 shadow-xs backdrop-blur-sm">
      <Button
        variant={theme === "light" ? "secondary" : "ghost"}
        size="xs"
        onClick={() => setTheme("light")}
        className="gap-1.5 px-2 text-xs transition-colors"
        title="Light theme"
        aria-label="Light theme"
      >
        <Sun className="size-3.5 text-amber-500" />
        <span className="hidden sm:inline">Light</span>
      </Button>
      <Button
        variant={theme === "dark" ? "secondary" : "ghost"}
        size="xs"
        onClick={() => setTheme("dark")}
        className="gap-1.5 px-2 text-xs transition-colors"
        title="Dark theme"
        aria-label="Dark theme"
      >
        <Moon className="size-3.5 text-sky-400" />
        <span className="hidden sm:inline">Dark</span>
      </Button>
      <Button
        variant={theme === "system" ? "secondary" : "ghost"}
        size="xs"
        onClick={() => setTheme("system")}
        className="gap-1.5 px-2 text-xs transition-colors"
        title="System theme"
        aria-label="System theme"
      >
        <Monitor className="size-3.5 text-muted-foreground" />
        <span className="hidden sm:inline">System</span>
      </Button>
    </div>
  )
}
