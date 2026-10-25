"use client"

import * as React from "react"
import { loginAction } from "@/app/actions/services"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  Activity,
  AlertCircle,
  Loader2,
  Users,
} from "lucide-react"

export function TeamLoginView() {
  const [teamName, setTeamName] = React.useState("")
  const [password, setPassword] = React.useState("")
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await loginAction({ teamName, password })
      if (!res.success) {
        setErrorMessage(res.error || "Authentication failed.")
      } else {
        // Reload page to receive server-rendered authenticated state
        window.location.reload()
      }
    } catch (err) {
      setErrorMessage("An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      {/* Top Header */}
      <header className="flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Activity className="size-5" />
          </div>
          <span className="text-base font-bold tracking-tight">
            Services Catalog
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Login Screen */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-in duration-200 zoom-in-95 fade-in">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-lg sm:p-8">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative z-10 space-y-6">
              {/* Lock Badge & Title */}
              <div className="space-y-2 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                  <Lock className="size-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Team Access Required
                </h1>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  Enter your team credentials to unlock the internal service
                  registry, dashboards, and gateway URLs.
                </p>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-1.5 font-medium text-foreground">
                    <Users className="size-3.5 text-muted-foreground" />
                    Team Name
                  </label>
                  <Input
                    required
                    type="text"
                    placeholder="e.g. frontend_team"
                    value={teamName}
                    onChange={(e) => setTeamName(e.target.value)}
                    className="h-10 font-mono text-xs"
                    autoFocus
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="flex items-center gap-1.5 font-medium text-foreground">
                    <Lock className="size-3.5 text-muted-foreground" />
                    Team Password
                  </label>
                  <div className="relative">
                    <Input
                      required
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter team password..."
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="h-10 pr-9 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-2.5 right-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
                      title={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="default"
                  disabled={isLoading}
                  className="mt-2 h-10 w-full cursor-pointer gap-2 font-semibold shadow-xs"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="size-4" />
                      Sign In to Catalog
                    </>
                  )}
                </Button>
              </form>

              {/* Security note */}
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-center text-[11px] text-muted-foreground">
                <span className="font-medium text-foreground">
                  Protected Gateway
                </span>
                : All internal URLs and infrastructure metadata are hidden until
                authenticated.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
