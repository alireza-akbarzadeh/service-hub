"use client"

import * as React from "react"
import { loginUserAction, registerAction, googleLoginAction } from "@/app/actions/auth"
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
  User,
  AtSign,
  Mail,
  Sparkles,
  Check,
} from "lucide-react"
import { cn } from "@/lib/utils"

const AVATAR_OPTIONS = [
  "👨‍💻", "👩‍💻", "🦊", "🚀", "⚡", "🦁", "🤖", "👾", "🥷", "🧙‍♂️", "🎯", "🛡️"
]

export function TeamLoginView() {
  const [activeTab, setActiveTab] = React.useState<"login" | "register">("login")

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = React.useState("")
  const [loginPassword, setLoginPassword] = React.useState("")

  // Register form state
  const [regName, setRegName] = React.useState("")
  const [regUsername, setRegUsername] = React.useState("")
  const [regEmail, setRegEmail] = React.useState("")
  const [regPassword, setRegPassword] = React.useState("")
  const [regAvatar, setRegAvatar] = React.useState("👨‍💻")
  const [regRole, setRegRole] = React.useState<"admin" | "developer" | "viewer">("developer")

  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [successMessage, setSuccessMessage] = React.useState<string | null>(null)

  // Handle Login
  async function handleLoginSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await loginUserAction({
        identifier: loginIdentifier,
        password: loginPassword,
      })

      if (!res.success) {
        setErrorMessage(res.error || "Authentication failed.")
      } else {
        window.location.reload()
      }
    } catch {
      setErrorMessage("An unexpected network error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Register
  async function handleRegisterSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const res = await registerAction({
        name: regName,
        username: regUsername,
        email: regEmail,
        password: regPassword,
        avatar: regAvatar,
        role: regRole,
      })

      if (!res.success) {
        setErrorMessage(res.error || "Failed to create account.")
      } else {
        setSuccessMessage("Account created successfully! Loading your dashboard...")
        setTimeout(() => {
          window.location.reload()
        }, 600)
      }
    } catch {
      setErrorMessage("An error occurred during registration. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Fast Google Login
  async function handleGoogleLogin(gmail?: string, name?: string) {
    setIsGoogleLoading(true)
    setErrorMessage(null)
    try {
      const res = await googleLoginAction({
        email: gmail || "akbarzadeh.ali@gmail.com",
        name: name || "Ali Akbarzadeh",
        avatar: "🌐",
      })
      if (res.success) {
        window.location.reload()
      } else {
        setErrorMessage(res.error || "Google sign-in failed.")
      }
    } catch {
      setErrorMessage("Google authentication failed.")
    } finally {
      setIsGoogleLoading(false)
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
            Services Catalog & Hub
          </span>
        </div>
        <ThemeToggle />
      </header>

      {/* Main Container */}
      <main className="flex flex-1 items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-md animate-in duration-200 zoom-in-95 fade-in">
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-xl sm:p-8">
            {/* Ambient background glow */}
            <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary/10 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-16 -left-16 size-48 rounded-full bg-sky-500/10 blur-3xl" />

            <div className="relative z-10 space-y-5">
              {/* Lock Badge & Title */}
              <div className="space-y-1.5 text-center">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary shadow-xs">
                  <ShieldCheck className="size-6" />
                </div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  {activeTab === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {activeTab === "login"
                    ? "Sign in with your username, Gmail, or team account to unlock catalog services."
                    : "Register your profile with avatar and username to manage services & chat identity."}
                </p>
              </div>

              {/* Navigation Tabs (Sign In / Register) */}
              <div className="flex rounded-xl bg-muted/60 p-1 border border-border/60">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("login")
                    setErrorMessage(null)
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
                    activeTab === "login"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("register")
                    setErrorMessage(null)
                  }}
                  className={cn(
                    "flex-1 rounded-lg py-1.5 text-xs font-semibold transition-all cursor-pointer",
                    activeTab === "register"
                      ? "bg-background text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  Create Account
                </button>
              </div>

              {/* Error banner */}
              {errorMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive animate-in fade-in">
                  <AlertCircle className="size-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Success banner */}
              {successMessage && (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in">
                  <Check className="size-4 shrink-0" />
                  <span>{successMessage}</span>
                </div>
              )}

              {/* Tab 1: SIGN IN */}
              {activeTab === "login" ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Google 1-Click Login Button */}
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleGoogleLogin()}
                    disabled={isGoogleLoading || isLoading}
                    className="w-full h-10 cursor-pointer gap-2.5 font-medium border-border/80 bg-background hover:bg-muted/60 text-xs shadow-2xs"
                  >
                    {isGoogleLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <svg className="size-4" viewBox="0 0 24 24">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                        />
                      </svg>
                    )}
                    <span>Continue with Gmail / Google</span>
                  </Button>

                  <div className="relative flex items-center justify-center text-[10px] uppercase text-muted-foreground">
                    <span className="w-full border-t border-border" />
                    <span className="bg-card px-2">or password</span>
                    <span className="w-full border-t border-border" />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-1.5 font-medium text-foreground">
                      <AtSign className="size-3.5 text-muted-foreground" />
                      Username or Email
                    </label>
                    <Input
                      required
                      type="text"
                      placeholder="e.g. ali_akbarzadeh or ali@gmail.com"
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      className="h-10 font-mono text-xs"
                      autoFocus
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-1.5 font-medium text-foreground">
                      <Lock className="size-3.5 text-muted-foreground" />
                      Password
                    </label>
                    <div className="relative">
                      <Input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password..."
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
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
                    disabled={isLoading || isGoogleLoading}
                    className="mt-2 h-10 w-full cursor-pointer gap-2 font-semibold shadow-xs"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="size-4 animate-spin" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="size-4" />
                        Sign In
                      </>
                    )}
                  </Button>

                  {/* Fast demo login chips */}
                  <div className="pt-2 text-center">
                    <span className="text-[11px] text-muted-foreground">
                      Quick fills:
                    </span>
                    <div className="mt-1.5 flex flex-wrap justify-center gap-1.5 text-xs">
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier("ali_akbarzadeh")
                          setLoginPassword("Aa.13741995!!!")
                        }}
                        className="rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Admin Ali
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setLoginIdentifier("frontend_team")
                          setLoginPassword("Aa.13741995!!!")
                        }}
                        className="rounded-lg border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground hover:text-foreground cursor-pointer"
                      >
                        Team Squad
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                /* Tab 2: CREATE ACCOUNT */
                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="size-3.5 text-muted-foreground" />
                      Full Name
                    </label>
                    <Input
                      required
                      type="text"
                      placeholder="e.g. Ali Akbarzadeh"
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                      className="h-9.5 text-xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2.5">
                    <div className="space-y-1 text-xs">
                      <label className="flex items-center gap-1 font-medium text-foreground">
                        <AtSign className="size-3 text-muted-foreground" />
                        Username
                      </label>
                      <Input
                        required
                        type="text"
                        placeholder="e.g. ali_dev"
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="h-9.5 font-mono text-xs"
                      />
                    </div>
                    <div className="space-y-1 text-xs">
                      <label className="flex items-center gap-1 font-medium text-foreground">
                        <Mail className="size-3 text-muted-foreground" />
                        Gmail / Email
                      </label>
                      <Input
                        required
                        type="email"
                        placeholder="e.g. ali@gmail.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="h-9.5 font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <label className="flex items-center gap-1.5 font-medium text-foreground">
                      <Lock className="size-3.5 text-muted-foreground" />
                      Password
                    </label>
                    <Input
                      required
                      type="password"
                      placeholder="At least 6 characters..."
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="h-9.5 font-mono text-xs"
                    />
                  </div>

                  {/* Avatar Picker */}
                  <div className="space-y-1.5 text-xs">
                    <label className="flex items-center justify-between font-medium text-foreground">
                      <span>Choose Avatar</span>
                      <span className="font-mono text-xs">{regAvatar}</span>
                    </label>
                    <div className="grid grid-cols-6 gap-1 rounded-xl border border-border bg-muted/30 p-1.5">
                      {AVATAR_OPTIONS.map((emoji) => (
                        <button
                          key={emoji}
                          type="button"
                          onClick={() => setRegAvatar(emoji)}
                          className={cn(
                            "flex size-8 items-center justify-center rounded-lg text-lg transition-transform hover:scale-120 cursor-pointer",
                            regAvatar === emoji
                              ? "bg-primary/20 ring-2 ring-primary scale-110 shadow-xs"
                              : "hover:bg-muted"
                          )}
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-1 text-xs">
                    <label className="font-medium text-foreground">
                      Access Role
                    </label>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[
                        { id: "developer", label: "Developer", desc: "Full hub access" },
                        { id: "admin", label: "Admin", desc: "Manage access" },
                        { id: "viewer", label: "Viewer", desc: "Read only" },
                      ].map((r) => (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setRegRole(r.id as any)}
                          className={cn(
                            "flex flex-col items-center rounded-xl border p-2 text-center text-xs transition-all cursor-pointer",
                            regRole === r.id
                              ? "border-primary bg-primary/10 font-bold text-primary shadow-2xs"
                              : "border-border bg-background text-muted-foreground hover:bg-muted"
                          )}
                        >
                          <span>{r.label}</span>
                          <span className="text-[9px] opacity-70 font-normal">{r.desc}</span>
                        </button>
                      ))}
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
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-4" />
                        Create Account & Enter
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
